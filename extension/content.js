/**
 * CartCop Content Script
 * Runs local heuristics to detect e-commerce product pages.
 * Injects DOM highlights with shadow-DOM tooltips (micro layer).
 */

(function () {
  'use strict';

  const HIGHLIGHT_CLASS = 'cartcop-hl';
  const SHADOW_HOST_ID = 'cartcop-shadow-host';
  const TOOLTIP_GAP = 8;

  // ==================== PRODUCT DETECTION ====================

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

  function extractPrice() {
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

    const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of ldScripts) {
      try {
        const data = JSON.parse(script.textContent);
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offer.price) {
            const currency = offer.priceCurrency || '';
            return `${currency}${offer.price}`;
          }
        }
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

    const priceSelectors = [
      '[data-purpose="price"] span:first-child',
      '.price-text span',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price .a-offscreen',
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
      chrome.runtime.sendMessage({ type: 'NON_PRODUCT_PAGE' });
      return;
    }
    const payload = extractPageData();
    console.log('[CartCop] Product page detected:', payload.title, '| Price:', payload.price);
    chrome.runtime.sendMessage({ type: 'PRODUCT_DETECTED', payload });
  }

  // ==================== SHADOW DOM TOOLTIP SYSTEM ====================

  let shadowHost = null;
  let shadowRoot = null;
  let pinnedTooltips = new Set();
  let activeHighlight = null;

  function ensureShadowHost() {
    if (shadowHost) return;
    shadowHost = document.createElement('div');
    shadowHost.id = SHADOW_HOST_ID;
    shadowHost.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
    document.documentElement.appendChild(shadowHost);
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    injectShadowStyles();
  }

  function injectShadowStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cartcop-tooltip {
        position: fixed;
        background: #1a1a2e;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 12px 14px;
        max-width: 280px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        color: #e0e0e0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        pointer-events: auto;
        z-index: 2147483647;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.2s, transform 0.2s;
      }
      .cartcop-tooltip.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .cartcop-tooltip.pinned {
        border-color: rgba(255,255,255,0.2);
      }
      .cartcop-tooltip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .cartcop-tooltip-id {
        font-weight: 700;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        color: #fff;
      }
      .cartcop-tooltip-sev {
        font-size: 9px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 3px;
        text-transform: uppercase;
      }
      .cartcop-tooltip-sev-high { background: rgba(255,68,68,0.2); color: #ff6666; }
      .cartcop-tooltip-sev-medium { background: rgba(255,170,0,0.2); color: #ffbb33; }
      .cartcop-tooltip-sev-low { background: rgba(255,255,0,0.15); color: #ffdd44; }
      .cartcop-tooltip-comment {
        color: #ccc;
      }
      .cartcop-tooltip-close {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.08);
        border: none;
        border-radius: 4px;
        color: #888;
        font-size: 12px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .cartcop-tooltip.pinned .cartcop-tooltip-close {
        opacity: 1;
      }
      .cartcop-tooltip-close:hover {
        background: rgba(255,255,255,0.15);
        color: #fff;
      }
      .cartcop-tooltip-arrow {
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #1a1a2e;
      }
      .cartcop-tooltip-arrow::after {
        content: '';
        position: absolute;
        top: -7px;
        left: -6px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid rgba(255,255,255,0.1);
        z-index: -1;
      }
    `;
    shadowRoot.appendChild(style);
  }

  function createTooltip(highlight, markEl) {
    ensureShadowHost();

    const tooltip = document.createElement('div');
    tooltip.className = 'cartcop-tooltip';
    tooltip.dataset.highlightId = highlight.id;

    const sevClass = highlight.severity ? `cartcop-tooltip-sev-${highlight.severity}` : '';
    const sevText = highlight.severity ? highlight.severity : (highlight.sentiment === 'positive' ? 'positive' : '');

    tooltip.innerHTML = `
      <button class="cartcop-tooltip-close">\u2715</button>
      <div class="cartcop-tooltip-header">
        <span class="cartcop-tooltip-id" style="background:${getHighlightColor(highlight)}">${highlight.id}</span>
        ${sevText ? `<span class="cartcop-tooltip-sev ${sevClass}">${sevText}</span>` : ''}
      </div>
      <div class="cartcop-tooltip-comment">${escapeHtml(highlight.comment)}</div>
      <div class="cartcop-tooltip-arrow"></div>
    `;

    shadowRoot.appendChild(tooltip);

    // Close button
    tooltip.querySelector('.cartcop-tooltip-close').addEventListener('click', (e) => {
      e.stopPropagation();
      dismissTooltip(tooltip);
    });

    return tooltip;
  }

  function positionTooltip(tooltip, markEl) {
    const rect = markEl.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = rect.top - tooltipRect.height - TOOLTIP_GAP;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

    // Keep within viewport
    if (top < 10) {
      top = rect.bottom + TOOLTIP_GAP;
      tooltip.querySelector('.cartcop-tooltip-arrow').style.cssText = 'top:-6px;bottom:auto;border-top:none;border-bottom:6px solid #1a1a2e;';
    }
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  function showTooltip(tooltip) {
    requestAnimationFrame(() => {
      tooltip.classList.add('visible');
    });
  }

  function dismissTooltip(tooltip) {
    tooltip.classList.remove('visible');
    pinnedTooltips.delete(tooltip);
    setTimeout(() => {
      if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    }, 200);
  }

  function dismissAllUnpinned() {
    shadowRoot.querySelectorAll('.cartcop-tooltip:not(.pinned)').forEach(t => {
      dismissTooltip(t);
    });
  }

  // ==================== HIGHLIGHT INJECTION ====================

  function getHighlightColor(highlight) {
    if (highlight.sentiment === 'positive') return '#00cc66';
    if (highlight.severity === 'high') return '#ff4444';
    if (highlight.severity === 'medium') return '#ffaa00';
    return '#ffdd44';
  }

  function getHighlightBg(highlight) {
    if (highlight.sentiment === 'positive') return 'rgba(0, 204, 102, 0.15)';
    if (highlight.severity === 'high') return 'rgba(255, 68, 68, 0.18)';
    if (highlight.severity === 'medium') return 'rgba(255, 170, 0, 0.15)';
    return 'rgba(255, 255, 0, 0.12)';
  }

  function injectHighlightStyles() {
    if (document.getElementById('cartcop-highlight-styles')) return;
    const style = document.createElement('style');
    style.id = 'cartcop-highlight-styles';
    style.textContent = `
      .cartcop-hl {
        border-radius: 3px;
        padding: 1px 2px;
        cursor: pointer;
        transition: outline 0.2s;
      }
      .cartcop-hl:hover {
        outline: 2px solid currentColor;
      }
      .cartcop-hl-negative-high {
        background-color: rgba(255, 68, 68, 0.18);
      }
      .cartcop-hl-negative-medium {
        background-color: rgba(255, 170, 0, 0.15);
      }
      .cartcop-hl-negative-low {
        background-color: rgba(255, 255, 0, 0.12);
      }
      .cartcop-hl-positive {
        background-color: rgba(0, 204, 102, 0.15);
      }
    `;
    document.head.appendChild(style);
  }

  function findTextInNodes(searchText) {
    const normalizedSearch = searchText.toLowerCase().trim();
    const searchLen = normalizedSearch.length;
    const TOLERANCE = 5;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
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

    if (nodes.length > 0) {
      return { nodes, method: 'treewalker' };
    }

    // Fallback: check parent elements
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
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
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
      return null;
    }

    injectHighlightStyles();

    let markEl;

    if (method === 'element') {
      const el = nodes[0];
      markEl = document.createElement('mark');
      markEl.dataset.cartcopId = highlight.id;
      markEl.className = `${HIGHLIGHT_CLASS} ${getHighlightClass(highlight)}`;
      markEl.appendChild(document.createTextNode(el.innerText));
      el.innerHTML = '';
      el.appendChild(markEl);
    } else {
      for (const textNode of nodes) {
        const text = textNode.textContent;
        const idx = text.toLowerCase().indexOf(highlight.text.toLowerCase());
        if (idx === -1) continue;

        const before = text.substring(0, idx);
        const match = text.substring(idx, idx + highlight.text.length);
        const after = text.substring(idx + highlight.text.length);

        markEl = document.createElement('mark');
        markEl.dataset.cartcopId = highlight.id;
        markEl.className = `${HIGHLIGHT_CLASS} ${getHighlightClass(highlight)}`;

        const parent = textNode.parentNode;
        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(markEl);
        if (after) fragment.appendChild(document.createTextNode(after));
        markEl.appendChild(document.createTextNode(match));

        parent.replaceChild(fragment, textNode);
        break;
      }
    }

    if (markEl) {
      attachTooltipHandlers(markEl, highlight);
    }

    return markEl;
  }

  function getHighlightClass(highlight) {
    if (highlight.sentiment === 'positive') return 'cartcop-hl-positive';
    if (highlight.severity === 'high') return 'cartcop-hl-negative-high';
    if (highlight.severity === 'medium') return 'cartcop-hl-negative-medium';
    return 'cartcop-hl-negative-low';
  }

  function attachTooltipHandlers(markEl, highlight) {
    let tooltip = null;

    markEl.addEventListener('mouseenter', () => {
      if (!tooltip) {
        tooltip = createTooltip(highlight, markEl);
        positionTooltip(tooltip, markEl);
        showTooltip(tooltip);
      }
    });

    markEl.addEventListener('mouseleave', () => {
      if (tooltip && !tooltip.classList.contains('pinned')) {
        dismissTooltip(tooltip);
        tooltip = null;
      }
    });

    markEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!tooltip) {
        tooltip = createTooltip(highlight, markEl);
        positionTooltip(tooltip, markEl);
      }
      tooltip.classList.add('pinned');
      pinnedTooltips.add(tooltip);
    });
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

  function removeHighlights() {
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
    highlights.forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });

    // Remove shadow host tooltips
    if (shadowHost) {
      shadowHost.remove();
      shadowHost = null;
      shadowRoot = null;
      pinnedTooltips.clear();
    }

    const style = document.getElementById('cartcop-highlight-styles');
    if (style) style.remove();
    console.log('[CartCop] Highlights removed');
  }

  // ==================== GLOBAL EVENT HANDLERS ====================

  // Click outside to dismiss unpinned tooltips
  document.addEventListener('click', (e) => {
    if (!e.target.closest(`.${HIGHLIGHT_CLASS}`)) {
      dismissAllUnpinned();
    }
  });

  // Scroll: pinned tooltips follow their anchors
  let scrollRaf = null;
  window.addEventListener('scroll', () => {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      // Dismiss unpinned on scroll
      dismissAllUnpinned();

      // Reposition pinned tooltips
      pinnedTooltips.forEach(tooltip => {
        const id = tooltip.dataset.highlightId;
        const markEl = document.querySelector(`[data-cartcop-id="${id}"]`);
        if (markEl) {
          positionTooltip(tooltip, markEl);
        }
      });
    });
  }, { passive: true });

  // ==================== MESSAGE LISTENERS ====================

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'HIGHLIGHTS_READY') {
      applyHighlights(message.highlights);
    }
    if (message.type === 'SCROLL_TO_HIGHLIGHT') {
      scrollToHighlight(message.id);
    }
  });

  function scrollToHighlight(id) {
    const el = document.querySelector(`[data-cartcop-id="${id}"]`);
    if (!el) {
      console.warn(`[CartCop] Highlight not found: ${id}`);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.outline = '3px solid #fff';
    setTimeout(() => { el.style.outline = ''; }, 1500);
  }

  // ==================== SPA NAVIGATION ====================

  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      removeHighlights();
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

  // ==================== INITIALIZATION ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      run();
    });
  } else {
    run();
  }

  // Utility
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
