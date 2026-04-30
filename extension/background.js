/**
 * AdCheck Background Service Worker
 * Runs two parallel Gemini pipelines: page analysis (offline) + alternatives (Tavily-grounded).
 * Also handles persistent storage for Skip & Save and Comparison Mode features.
 */

importScripts('keys.js', 'prompts.js', 'utils.js');

const STORAGE_KEY = 'adcheck';
const MAX_PRODUCTS = 100;

const MODEL = 'qwen/qwen3.6-35b-a3b:exacto';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';

// ==================== MESSAGE LISTENERS ====================

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PRODUCT_DETECTED') {
    handleProductAnalysis(message.payload);
    return false;
  }
  if (message.type === 'GET_ANALYSIS') {
    chrome.storage.session.get(['adcheck_status', 'adcheck_analysis', 'adcheck_error'], result => {
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

// ==================== PRODUCT ANALYSIS ====================

async function handleProductAnalysis(payload) {
  await chrome.storage.session.set({ adcheck_status: 'loading', adcheck_analysis: null, adcheck_error: null });
  setBadge('...', '#888888');

  try {
    const { orKey, tvKey } = await getKeys();

    const [pageComments, alternatives] = await Promise.all([
      runPageComments(payload.pageText, orKey),
      runAlternatives(payload.title, payload.pageText, orKey, tvKey)
    ]);

    const analysis = {
      product: payload.title,
      url: payload.url,
      price: payload.price || null,
      pageComments,
      alternatives
    };

    await chrome.storage.session.set({ adcheck_status: 'done', adcheck_analysis: analysis });
    setBadge('\u2713', '#00cc66');
  } catch (err) {
    await chrome.storage.session.set({ adcheck_status: 'error', adcheck_error: err.message });
    setBadge('!', '#ff4444');
  }
}

async function runPageComments(pageText, apiKey) {
  const raw = await callModel(PROMPTS.pageComments(pageText), apiKey);
  return JSON.parse(raw);
}

async function runAlternatives(title, pageText, orKey, tvKey) {
  const queriesRaw = await callModel(PROMPTS.alternativeQueries(title, pageText), orKey);
  const queries = JSON.parse(queriesRaw);

  const searchResults = await Promise.all(queries.map(q => tavilySearch(q, tvKey)));
  const flatResults = searchResults.flat();

  const filteredRaw = await callModel(PROMPTS.alternativesFilter(title, flatResults), orKey);
  return JSON.parse(filteredRaw);
}

async function callModel(prompt, apiKey) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/remao15/BobCorn',
      'X-Title': 'AdCheck'
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

/**
 * Get the full adcheck storage object, initializing if needed.
 */
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

/**
 * Save the adcheck storage object.
 */
async function setStorage(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
  });
}

/**
 * Save an analysis to persistent storage.
 * Deduplicates by URL hash. Updates existing entry or creates new.
 */
async function saveAnalysis(payload, analysis) {
  const storage = await getStorage();
  const id = hashUrl(payload.url);
  const now = Date.now();

  // Try to find existing entry
  const existingIndex = storage.products.findIndex(p => p.id === id);

  const productEntry = {
    id,
    url: payload.url,
    title: payload.title,
    price: payload.price || null,
    category: analysis.pageComments.category || null,
    skipped: false,
    skippedAt: null,
    moneySaved: null,
    analyzedAt: now,
    pageComments: analysis.pageComments,
    alternatives: analysis.alternatives
  };

  if (existingIndex !== -1) {
    // Update existing - preserve skipped status and moneySaved if already skipped
    const existing = storage.products[existingIndex];
    productEntry.skipped = existing.skipped;
    productEntry.skippedAt = existing.skippedAt;
    productEntry.moneySaved = existing.moneySaved;
    storage.products[existingIndex] = productEntry;
  } else {
    // Enforce cap
    if (storage.products.length >= MAX_PRODUCTS) {
      // Remove oldest non-skipped first
      const nonSkippedIndex = storage.products.findIndex(p => !p.skipped);
      if (nonSkippedIndex !== -1) {
        storage.products.splice(nonSkippedIndex, 1);
      } else {
        // All are skipped, remove oldest
        storage.products.shift();
      }
    }
    storage.products.push(productEntry);
    storage.totalAnalyzed++;
  }

  await setStorage(storage);
  return productEntry;
}

/**
 * Mark a product as skipped (Skip & Save action).
 */
async function markSkipped(id) {
  const storage = await getStorage();
  const index = storage.products.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error('Product not found in history');
  }

  const product = storage.products[index];

  // If already skipped, return as-is (idempotent)
  if (product.skipped) {
    return product;
  }

  const moneySaved = parsePrice(product.price);
  product.skipped = true;
  product.skippedAt = Date.now();
  product.moneySaved = moneySaved;

  // Update total saved
  if (moneySaved !== null) {
    storage.totalSaved = (storage.totalSaved || 0) + moneySaved;
  }

  storage.products[index] = product;
  await setStorage(storage);

  return product;
}

/**
 * Get all history products sorted by analyzedAt descending.
 */
async function getHistory() {
  const storage = await getStorage();
  return storage.products.sort((a, b) => (b.analyzedAt || 0) - (a.analyzedAt || 0));
}

/**
 * Get a single product by ID.
 */
async function getProduct(id) {
  const storage = await getStorage();
  return storage.products.find(p => p.id === id) || null;
}

/**
 * Clear all history.
 */
async function clearHistory() {
  await setStorage({
    products: [],
    totalSaved: 0,
    totalAnalyzed: 0
  });
}
