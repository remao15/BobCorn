/**
 * CartCop Background Service Worker
 * Calls OpenRouter (Perplexity Sonar) to analyze Amazon products in real time.
 *
 * Setup: run this once in the extension's service worker console:
 *   chrome.storage.local.set({ openrouterKey: 'sk-or-YOUR_KEY_HERE' })
 */

importScripts('keys.js');
importScripts('prompt.js');

const MODEL = 'perplexity/sonar';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ANALYZE_PRODUCT') {
    analyzeProduct(message.payload)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true; // keep message channel open for async response
  }
});

async function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openrouterKey'], result => {
      if (result.openrouterKey) {
        resolve(result.openrouterKey);
      } else if (typeof OPENROUTER_KEY !== 'undefined') {
        resolve(OPENROUTER_KEY);
      } else {
        reject(new Error('API key not configured. See README setup instructions.'));
      }
    });
  });
}

async function analyzeProduct({ url, title, price, rating, reviewCount }) {
  const apiKey = await getApiKey();
  const prompt = buildPrompt({ url, title, price, rating, reviewCount });

  const res = await fetch(API_URL, {
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
      temperature: 0.3,
      max_tokens: 800
    })
  });

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const raw = data.choices[0].message.content
    .trim()
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '');

  return JSON.parse(raw);
}
