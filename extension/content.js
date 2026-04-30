/**
 * CartCop Content Script
 * Runs local heuristics to detect e-commerce product pages.
 * No DOM modification — triggers background analysis and badge only.
 */

(function () {
  'use strict';

  const SIGNALS = {
    schemaProduct: () => {
      return [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
        try {
          const d = JSON.parse(s.textContent);
          const types = [].concat(
            d['@type'] || [],
            (d['@graph'] || []).map(x => x['@type'])
          ).flat();
          return types.some(t => typeof t === 'string' && t.toLowerCase().includes('product'));
        } catch { return false; }
      });
    },

    ogProduct: () => {
      const og = document.querySelector('meta[property="og:type"]');
      return og?.content?.toLowerCase().includes('product') || false;
    },

    urlPattern: () =>
      /\/(dp|product|item|p|buy|shop\/product|products)\//i.test(location.pathname),

    cartButton: () => {
      const keywords = [
        'add to cart', 'buy now', 'purchase', 'checkout',
        'aggiungi al carrello', 'in den warenkorb', 'ajouter au panier', 'add to bag'
      ];
      return [...document.querySelectorAll('button, input[type="submit"], a')].some(el => {
        const text = (el.textContent || el.value || '').toLowerCase().trim();
        return keywords.some(k => text.includes(k));
      });
    },

    priceSignal: () =>
      /[\u20AC$\u00A3\u00A5\u20B9]\s*\d+[\d.,]*|\d+[\d.,]*\s*[\u20AC$\u00A3\u00A5\u20B9]|CHF\s*\d+/
        .test(document.body.innerText.slice(0, 5000))
  };

  function detectProduct() {
    const hits = Object.values(SIGNALS).filter(fn => fn()).length;
    return hits >= 2;
  }

  function extractPageData() {
    const title =
      document.querySelector('meta[property="og:title"]')?.content ||
      document.querySelector('h1')?.textContent?.trim() ||
      document.title;

    const pageText = document.body.innerText.replace(/\s+/g, ' ').trim();

    return { url: location.href, title, pageText };
  }

  function run() {
    if (!detectProduct()) return;
    const payload = extractPageData();
    console.log('[CartCop] Product page detected:', payload.title);
    chrome.runtime.sendMessage({ type: 'PRODUCT_DETECTED', payload });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
