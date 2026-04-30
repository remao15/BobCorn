/**
 * CartCop Content Script
 * Runs local heuristics to detect e-commerce product pages.
 * No DOM modification — triggers background analysis only.
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
      const ogType = document.querySelector('meta[property="og:type"]');
      const ogPrice = document.querySelector(
        'meta[property="og:price:amount"], meta[property="product:price:amount"]'
      );
      return ogType?.content?.toLowerCase().includes('product') || !!ogPrice;
    },

    urlPattern: () =>
      /\/(dp|product|products|item|p|buy|course|courses|listing|listings|shop\/product|store\/product)\//i
        .test(location.pathname),

    cartButton: () => {
      const keywords = [
        'add to cart', 'add to bag', 'buy now', 'purchase', 'checkout',
        'enroll now', 'enroll', 'buy course', 'get this course', 'subscribe and save',
        'aggiungi al carrello', 'in den warenkorb', 'ajouter au panier',
        'a\u00f1adir al carrito'
      ];
      return [...document.querySelectorAll('button, input[type="submit"], a[role="button"]')].some(el => {
        const text = (el.textContent || el.value || '').toLowerCase().trim();
        return keywords.some(k => text.includes(k));
      });
    },

    priceSignal: () => {
      const text = document.body.innerText.slice(0, 8000);
      return /[\u20AC$\u00A3\u00A5\u20A3\u20B9]\s*\d+[\d.,]*|\d+[\d.,]*\s*[\u20AC$\u00A3\u00A5]|CHF\s*\d+|\d+[\d.,]*\s*CHF/
        .test(text);
    },

    buyboxSignal: () => {
      return !!document.querySelector(
        '[class*="buybox"], [id*="buybox"], [class*="buy-box"], [class*="purchase"], ' +
        '[class*="enroll"], [data-purpose*="buy"], [data-purpose*="enroll"], ' +
        '[class*="add-to-cart"], [id*="add-to-cart"]'
      );
    }
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
