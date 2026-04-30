/**
 * CartCop Background Service Worker
 * Two-pipeline design:
 *   A) Summary — streamed via port to popup (macro)
 *   B) Highlights — async to content script for DOM injection (micro)
 * Also handles persistent storage for Skip & Save and Comparison Mode.
 */

importScripts('keys.js', 'prompts.js', 'utils.js');

const STORAGE_KEY = 'cartcop';
const MAX_PRODUCTS = 100;

const MODEL = 'minimax/minimax-m2.7:exacto';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';

// Active streaming port reference
let activeStreamPort = null;

// ==================== PORT CONNECTION (STREAMING) ====================

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'cartcop-stream') {
    activeStreamPort = port;
    port.onDisconnect.addListener(() => {
      activeStreamPort = null;
    });
  }
});

// ==================== MESSAGE LISTENERS ====================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PRODUCT_DETECTED') {
    handleProductAnalysis(message.payload, sender.tab?.id);
    return false;
  }
  if (message.type === 'GET_ANALYSIS') {
    chrome.storage.session.get(['cartcop_status', 'cartcop_analysis', 'cartcop_error'], result => {
      sendResponse(result);
    });
    return true;
  }
  if (message.type === 'SAVE_ANALYSIS') {
    saveAnalysis(message.payload, message.analysis)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
  if (message.type === 'SKIP_PRODUCT') {
    markSkipped(message.id)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
  if (message.type === 'GET_HISTORY') {
    getHistory()
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
  if (message.type === 'GET_PRODUCT') {
    getProduct(message.id)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
  if (message.type === 'CLEAR_HISTORY') {
    clearHistory()
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

// ==================== PRODUCT ANALYSIS (TWO PIPELINES) ====================

async function handleProductAnalysis(payload, tabId) {
  await chrome.storage.session.set({
    cartcop_status: 'loading',
    cartcop_analysis: null,
    cartcop_error: null,
    cartcop_highlights: null
  });
  setBadge('...', '#888888');

  try {
    const { orKey, tvKey } = await getKeys();

    // Pipeline A: Summary (streamed) + Alternatives
    // Pipeline B: Highlights (async, sent to content script)
    // Both start simultaneously
    const summaryPromise = runSummaryStream(payload, orKey);
    const highlightsPromise = runHighlights(payload, orKey, tabId);
    const alternativesPromise = runAlternatives(payload.title, payload.pageText, orKey, tvKey);

    // Wait for summary and alternatives
    const [summaryResult, alternativesResult] = await Promise.all([
      summaryPromise,
      alternativesPromise
    ]);

    // Wait for highlights (non-blocking for popup)
    highlightsPromise.catch(err => {
      console.warn('[CartCop] Highlights pipeline failed:', err);
    });

    const analysis = {
      product: payload.title,
      url: payload.url,
      price: payload.price || null,
      pageComments: summaryResult,
      alternatives: alternativesResult
    };

    await chrome.storage.session.set({ cartcop_status: 'done', cartcop_analysis: analysis });
    setBadge('\u2713', '#00cc66');
  } catch (err) {
    await chrome.storage.session.set({ cartcop_status: 'error', cartcop_error: err.message });
    setBadge('!', '#ff4444');
    if (activeStreamPort) {
      activeStreamPort.postMessage({ type: 'ERROR', error: err.message });
    }
  }
}

// ==================== PIPELINE A: SUMMARY (STREAMED) ====================

async function runSummaryStream(payload, apiKey) {
  const prompt = PROMPTS.summary(payload.pageText);

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/remao15/BobCorn',
      'X-Title': 'CartCop BS Detector'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1200,
      stream: true
    })
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`OpenRouter error ${res.status}: ${errBody || res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    // Parse SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          if (activeStreamPort) {
            activeStreamPort.postMessage({ type: 'CHUNK', text: delta });
          }
        }
      } catch {
        // Ignore parse errors for incomplete chunks
      }
    }
  }

  // Try to parse the accumulated text as JSON
  let summary;
  try {
    summary = JSON.parse(fullText.trim());
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = fullText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        summary = JSON.parse(jsonMatch[1].trim());
      } catch {
        throw new Error('Failed to parse summary JSON');
      }
    } else {
      throw new Error('Failed to parse summary JSON');
    }
  }

  if (activeStreamPort) {
    activeStreamPort.postMessage({ type: 'DONE', data: summary });
  }

  return summary;
}

// ==================== PIPELINE B: HIGHLIGHTS (ASYNC) ====================

async function runHighlights(payload, apiKey, tabId) {
  if (!tabId) {
    console.warn('[CartCop] No tabId for highlights');
    return;
  }

  try {
    const raw = await callModel(PROMPTS.highlights(payload.pageText), apiKey);
    const result = JSON.parse(raw);

    // Store highlights in session storage
    await chrome.storage.session.set({ cartcop_highlights: result.highlights || [] });

    // Send to content script
    chrome.tabs.sendMessage(tabId, {
      type: 'HIGHLIGHTS_READY',
      highlights: result.highlights || []
    });
  } catch (err) {
    console.warn('[CartCop] Highlights failed:', err);
  }
}

// ==================== ALTERNATIVES ====================

async function runAlternatives(title, pageText, orKey, tvKey) {
  const queriesRaw = await callModel(PROMPTS.alternativeQueries(title, pageText), orKey);
  const queries = JSON.parse(queriesRaw);

  const searchResults = await Promise.all(queries.map(q => tavilySearch(q, tvKey)));
  const flatResults = searchResults.flat();

  const filteredRaw = await callModel(PROMPTS.alternativesFilter(title, flatResults), orKey);
  return JSON.parse(filteredRaw);
}

// ==================== MODEL CALL (NON-STREAMING) ====================

async function callModel(prompt, apiKey) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/remao15/BobCorn',
      'X-Title': 'CartCop BS Detector'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`OpenRouter error ${res.status}: ${errBody || res.statusText}`);
  }

  const data = await res.json();

  if (!data.choices?.length) {
    throw new Error(`No choices in OpenRouter response: ${JSON.stringify(data)}`);
  }

  const content = data.choices[0].message?.content;
  if (!content || content.trim() === '') {
    throw new Error('Empty content in OpenRouter response');
  }

  return content.trim();
}

async function tavilySearch(query, apiKey) {
  const res = await fetch(TAVILY_SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, query, search_depth: 'basic', max_results: 5 })
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

async function getKeys() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openrouterKey', 'tavilyKey'], result => {
      const orKey = result.openrouterKey || (typeof OPENROUTER_KEY !== 'undefined' ? OPENROUTER_KEY : null);
      const tvKey = result.tavilyKey || (typeof TAVILY_KEY !== 'undefined' ? TAVILY_KEY : null);
      if (!orKey || !tvKey) reject(new Error('API keys not configured. See README.'));
      else resolve({ orKey, tvKey });
    });
  });
}

function setBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

// ==================== PERSISTENT STORAGE LAYER ====================

async function getStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], result => {
      const data = result[STORAGE_KEY] || {
        products: [],
        totalSaved: 0,
        totalAnalyzed: 0
      };
      resolve(data);
    });
  });
}

async function setStorage(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
  });
}

async function saveAnalysis(payload, analysis) {
  const storage = await getStorage();
  const id = hashUrl(payload.url);
  const now = Date.now();

  const existingIndex = storage.products.findIndex(p => p.id === id);

  const productEntry = {
    id,
    url: payload.url,
    title: payload.title,
    price: payload.price || null,
    category: analysis.pageComments?.category || null,
    skipped: false,
    skippedAt: null,
    moneySaved: null,
    analyzedAt: now,
    pageComments: analysis.pageComments,
    alternatives: analysis.alternatives
  };

  if (existingIndex !== -1) {
    const existing = storage.products[existingIndex];
    productEntry.skipped = existing.skipped;
    productEntry.skippedAt = existing.skippedAt;
    productEntry.moneySaved = existing.moneySaved;
    storage.products[existingIndex] = productEntry;
  } else {
    if (storage.products.length >= MAX_PRODUCTS) {
      const nonSkippedIndex = storage.products.findIndex(p => !p.skipped);
      if (nonSkippedIndex !== -1) {
        storage.products.splice(nonSkippedIndex, 1);
      } else {
        storage.products.shift();
      }
    }
    storage.products.push(productEntry);
    storage.totalAnalyzed++;
  }

  await setStorage(storage);
  return productEntry;
}

async function markSkipped(id) {
  const storage = await getStorage();
  const index = storage.products.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error('Product not found in history');
  }

  const product = storage.products[index];

  if (product.skipped) {
    return product;
  }

  const moneySaved = parsePrice(product.price);
  product.skipped = true;
  product.skippedAt = Date.now();
  product.moneySaved = moneySaved;

  if (moneySaved !== null) {
    storage.totalSaved = (storage.totalSaved || 0) + moneySaved;
  }

  storage.products[index] = product;
  await setStorage(storage);

  return product;
}

async function getHistory() {
  const storage = await getStorage();
  return storage.products.sort((a, b) => (b.analyzedAt || 0) - (a.analyzedAt || 0));
}

async function getProduct(id) {
  const storage = await getStorage();
  return storage.products.find(p => p.id === id) || null;
}

async function clearHistory() {
  await setStorage({
    products: [],
    totalSaved: 0,
    totalAnalyzed: 0
  });
}
