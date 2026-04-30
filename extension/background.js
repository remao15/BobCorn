/**
 * CartCop Background Service Worker
 * Runs two parallel Nemotron pipelines: page analysis (offline) + alternatives (Tavily-grounded).
 */

importScripts('keys.js', 'prompts.js');

const MODEL = 'nvidia/nemotron-3-super-120b-a12b';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PRODUCT_DETECTED') {
    handleProductAnalysis(message.payload);
    return false;
  }
  if (message.type === 'GET_ANALYSIS') {
    chrome.storage.session.get(['cartcop_status', 'cartcop_analysis', 'cartcop_error'], result => {
      sendResponse(result);
    });
    return true;
  }
});

async function handleProductAnalysis(payload) {
  await chrome.storage.session.set({ cartcop_status: 'loading', cartcop_analysis: null, cartcop_error: null });
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
      pageComments,
      alternatives
    };

    await chrome.storage.session.set({ cartcop_status: 'done', cartcop_analysis: analysis });
    setBadge('\u2713', '#00cc66');
  } catch (err) {
    await chrome.storage.session.set({ cartcop_status: 'error', cartcop_error: err.message });
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
      'X-Title': 'CartCop BS Detector'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1200
    })
  });
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.choices[0].message.content
    .trim()
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '');
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
