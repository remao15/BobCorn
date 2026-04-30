/**
 * CartCop Content Script
 * Runs local heuristics to detect e-commerce product pages.
 * Highlights suspicious/positive text snippets from analysis.
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

  /**
   * Extract price from the page.
   * Priority: meta tags > structured data > DOM scraping.
   */
  function extractPrice() {
    // Try meta tags first (Open Graph, Schema.org)
    const ogPrice = document.querySelector(
      'meta[property="og:price:amount"], meta[property="product:price:amount"], meta[property="product:price:currency"]'
    );
    if (ogPrice) {
      const priceAmount = document.querySelector('meta[property="og:price:amount"]')?.content ||
                          document.querySelector('meta[property="product:price:amount"]')?.content;
      const priceCurrency = document.querySelector('meta[property="og:price:currency"]')?.content ||
                            document.querySelector('meta[property="product:price:currency"]')?.content;
      if (priceAmount) {
        return priceCurrency ? `${priceCurrency}${priceAmount}` : priceAmount;
      }
    }

    // Try JSON-LD structured data
    const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of ldScripts) {
      try {
        const data = JSON.parse(script.textContent);
        // Handle single product
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offer.price) {
            const currency = offer.priceCurrency || '';
            return `${currency}${offer.price}`;
          }
        }
        // Handle @graph array
        if (data['@graph']) {
          for (const item of data['@graph']) {
            if (item.offers) {
              const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              if (offer.price) {
                const currency = offer.priceCurrency || '';
                return `${currency}${offer.price}`;
              }
            }
          }
        }
      } catch {}
    }

    // Try common DOM selectors
    const priceSelectors = [
      // Udemy
      '[data-purpose="price"] span:first-child',
      '.price-text span',
      // Amazon
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price .a-offscreen',
      // General
      '[class*="price"]:not([class*="old"]):not([class*="was"])',
      '[class*="Price"]',
      '.product-price',
      '.sale-price',
      '.current-price'
    ];

    for (const selector of priceSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.textContent?.trim() || el.innerText?.trim();
        if (text && /\d/.test(text)) {
          return text;
        }
      }
    }

    // Fallback: extract from page text
    const text = document.body.innerText.slice(0, 8000);
    const priceMatch = text.match(/[\u20AC$\u00A3\u00A5\u20B9]\s*\d+[\d.,]*|\d+[\d.,]*\s*[\u20AC$\u00A3\u00A5]/);
    if (priceMatch) {
      return priceMatch[0];
    }

    return null;
  }

  function extractPageData() {
    const title =
      document.querySelector('meta[property="og:title"]')?.content ||
      document.querySelector('h1')?.textContent?.trim() ||
      document.title;

    const pageText = document.body.innerText.replace(/\s+/g, ' ').trim();
    const price = extractPrice();

    return { url: location.href, title, pageText, price };
  }

  function run() {
    if (!detectProduct()) {
      // Notify popup that this is not a product page
      chrome.runtime.sendMessage({ type: 'NON_PRODUCT_PAGE' });
      return;
    }
    const payload = extractPageData();
    console.log('[CartCop] Product page detected:', payload.title, '| Price:', payload.price);
    chrome.runtime.sendMessage({ type: 'PRODUCT_DETECTED', payload });
  }

  // ==================== HIGHLIGHT SYSTEM ====================

  const HIGHLIGHT_CLASS = 'cartcop-highlight';
  const TOLERANCE = 5; // Character tolerance for fuzzy matching

  function removeHighlights() {
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
    highlights.forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });
    // Remove injected styles
    const style = document.getElementById('cartcop-highlight-styles');
    if (style) style.remove();
    console.log('[CartCop] Highlights removed');
  }

  function injectStyles() {
    if (document.getElementById('cartcop-highlight-styles')) return;
    const style = document.createElement('style');
    style.id = 'cartcop-highlight-styles';
    style.textContent = `
      .cartcop-highlight {
        position: relative;
        border-radius: 3px;
        padding: 1px 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      .cartcop-highlight:hover {
        outline: 2px solid currentColor;
      }
      .cartcop-negative-high {
        background-color: rgba(255, 68, 68, 0.2);
      }
      .cartcop-negative-medium {
        background-color: rgba(255, 170, 0, 0.15);
      }
      .cartcop-positive {
        background-color: rgba(0, 204, 102, 0.15);
      }
      .cartcop-pill {
        position: absolute;
        top: -8px;
        right: -4px;
        font-size: 10px;
        padding: 1px 5px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-weight: 600;
        color: white;
        z-index: 999999;
        pointer-events: none;
      }
      .cartcop-pill-neg { background-color: #ff4444; }
      .cartcop-pill-pos { background-color: #00cc66; }
      .cartcop-highlight.cartcop-pulse {
        animation: cartcop-pulse 0.6s ease-in-out 2;
      }
      @keyframes cartcop-pulse {
        0%, 100% { outline: 2px solid currentColor; }
        50% { outline: 4px solid currentColor; background-color: rgba(255, 255, 0, 0.3); }
      }
    `;
    document.head.appendChild(style);
  }

  function getPillClass(sentiment) {
    return sentiment === 'positive' ? 'cartcop-pill-pos' : 'cartcop-pill-neg';
  }

  function getHighlightClass(highlight) {
    if (highlight.sentiment === 'positive') return 'cartcop-positive';
    if (highlight.severity === 'high') return 'cartcop-negative-high';
    return 'cartcop-negative-medium';
  }

  function findTextInNodes(searchText) {
    const normalizedSearch = searchText.toLowerCase().trim();
    const searchLen = normalizedSearch.length;

    // Try TreeWalker approach first
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Skip unwanted elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'head', 'iframe'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.classList.contains(HIGHLIGHT_CLASS)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.id && parent.id.startsWith('cartcop-')) {
            return NodeFilter.FILTER_REJECT;
          }
          const text = node.textContent.toLowerCase();
          if (text.includes(normalizedSearch)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          // Check with tolerance
          if (Math.abs(text.length - searchLen) <= TOLERANCE && 
              levenshtein(text, normalizedSearch) <= TOLERANCE) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    const nodes = [];
    let node;
    while (node = walker.nextNode()) {
      nodes.push(node);
    }

    // If we found text nodes containing the string, return them
    if (nodes.length > 0) {
      return { nodes, method: 'treewalker' };
    }

    // Fallback: check parent elements for fragmented text
    const allElements = document.body.querySelectorAll('*');
    for (const el of allElements) {
      if (['script', 'style', 'noscript', 'head', 'iframe'].includes(el.tagName.toLowerCase())) {
        continue;
      }
      if (el.classList.contains(HIGHLIGHT_CLASS) || (el.id && el.id.startsWith('cartcop-'))) {
        continue;
      }
      const innerText = el.innerText || '';
      if (innerText.toLowerCase().includes(normalizedSearch)) {
        return { nodes: [el], method: 'element' };
      }
    }

    return { nodes: [], method: null };
  }

  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function applyHighlight(highlight) {
    const { nodes, method } = findTextInNodes(highlight.text);
    if (nodes.length === 0) {
      console.warn(`[CartCop] Could not find highlight text: "${highlight.text}"`);
      return false;
    }

    injectStyles();

    if (method === 'element') {
      // Wrap the entire element
      const el = nodes[0];
      const mark = document.createElement('mark');
      mark.id = `cartcop-${highlight.id}`;
      mark.className = `${HIGHLIGHT_CLASS} ${getHighlightClass(highlight)}`;
      
      const pill = document.createElement('span');
      pill.className = `cartcop-pill ${getPillClass(highlight.sentiment)}`;
      pill.textContent = highlight.sentiment === 'positive' ? `\u2713 ${highlight.id}` : `\u26A0 ${highlight.id}`;
      mark.appendChild(pill);
      mark.appendChild(document.createTextNode(el.innerText));
      
      el.innerHTML = '';
      el.appendChild(mark);
    } else {
      // TreeWalker - wrap text nodes
      for (const textNode of nodes) {
        const text = textNode.textContent;
        const idx = text.toLowerCase().indexOf(highlight.text.toLowerCase());
        if (idx === -1) continue;

        const before = text.substring(0, idx);
        const match = text.substring(idx, idx + highlight.text.length);
        const after = text.substring(idx + highlight.text.length);

        const mark = document.createElement('mark');
        mark.id = `cartcop-${highlight.id}`;
        mark.className = `${HIGHLIGHT_CLASS} ${getHighlightClass(highlight)}`;

        const pill = document.createElement('span');
        pill.className = `cartcop-pill ${getPillClass(highlight.sentiment)}`;
        pill.textContent = highlight.sentiment === 'positive' ? `\u2713 ${highlight.id}` : `\u26A0 ${highlight.id}`;

        const parent = textNode.parentNode;
        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(mark);
        if (after) fragment.appendChild(document.createTextNode(after));
        mark.appendChild(pill);
        mark.appendChild(document.createTextNode(match));

        parent.replaceChild(fragment, textNode);
        break; // Only highlight first occurrence
      }
    }

    console.log(`[CartCop] Applied highlight: ${highlight.id}`);
    return true;
  }

  function applyHighlights(highlights) {
    if (!highlights?.length) return;
    removeHighlights();
    let applied = 0;
    for (const highlight of highlights) {
      if (applyHighlight(highlight)) applied++;
    }
    console.log(`[CartCop] Applied ${applied}/${highlights.length} highlights`);
  }

  function scrollToHighlight(id) {
    const el = document.getElementById(`cartcop-${id}`);
    if (!el) {
      console.warn(`[CartCop] Highlight not found: ${id}`);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('cartcop-pulse');
    setTimeout(() => el.classList.remove('cartcop-pulse'), 1200);
  }

  function pollForHighlights() {
    chrome.storage.session.get(['cartcop_status', 'cartcop_analysis'], result => {
      if (result.cartcop_status === 'done' && result.cartcop_analysis?.pageComments?.highlights) {
        applyHighlights(result.cartcop_analysis.pageComments.highlights);
      }
    });
  }

  // Message listener for popup commands
  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'SCROLL_TO_HIGHLIGHT') {
      scrollToHighlight(message.id);
    }
  });

  // MutationObserver for URL changes (SPA navigation)
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      removeHighlights();
      // Small delay to let the page settle
      setTimeout(() => {
        if (detectProduct()) {
          run();
        } else {
          chrome.runtime.sendMessage({ type: 'NON_PRODUCT_PAGE' });
        }
      }, 500);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      run();
      // Poll for highlights after analysis
      setTimeout(pollForHighlights, 2000);
    });
  } else {
    run();
    setTimeout(pollForHighlights, 2000);
  }
})();
