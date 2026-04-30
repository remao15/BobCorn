/**
 * CartCop Content Script
 * Scrapes Amazon product data, requests live analysis from background worker,
 * and injects a BS Detector overlay above the Add to Cart button.
 */

(function () {
  'use strict';

  const OVERLAY_ID = 'cartcop-bs-detector';

  // ─── SCRAPING ───
  function scrapeProductData() {
    const title =
      document.getElementById('productTitle')?.textContent?.trim() ||
      document.querySelector('h1.a-size-large')?.textContent?.trim() ||
      document.title;

    const price =
      document.querySelector('.a-price .a-offscreen')?.textContent?.trim() ||
      document.querySelector('#priceblock_ourprice')?.textContent?.trim() ||
      document.querySelector('#priceblock_dealprice')?.textContent?.trim() ||
      document.querySelector('.a-price-whole')?.textContent?.trim() ||
      'N/A';

    const rating =
      document.querySelector('#acrPopover .a-size-base')?.textContent?.trim() ||
      document.querySelector('[data-hook="rating-out-of-text"]')?.textContent?.trim() ||
      document.querySelector('.a-icon-alt')?.textContent?.trim() ||
      'N/A';

    const reviewCount =
      document.querySelector('#acrCustomerReviewText')?.textContent?.trim() ||
      document.querySelector('[data-hook="total-review-count"]')?.textContent?.trim() ||
      '0 reviews';

    return {
      url: window.location.href,
      title: title || 'Unknown product',
      price,
      rating,
      reviewCount
    };
  }

  // ─── COLOR HELPERS ───
  function getBsColor(score) {
    if (score >= 70) return '#dc2626'; // red-600
    if (score >= 40) return '#d97706'; // amber-600
    return '#16a34a'; // green-600
  }

  function getBsBackground(score) {
    if (score >= 70) return '#fef2f2'; // red-50
    if (score >= 40) return '#fffbeb'; // amber-50
    return '#f0fdf4'; // green-50
  }

  function getBsLabel(score) {
    if (score >= 70) return 'High BS Alert';
    if (score >= 40) return 'Medium BS Warning';
    return 'Low BS — Solid Pick';
  }

  // ─── STYLES ───
  function buildStyles(color, bg) {
    return `
      #${OVERLAY_ID} {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background: ${bg};
        border: 1px solid ${color};
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 16px;
        color: #1f2937;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        max-width: 100%;
        box-sizing: border-box;
        transition: border-color 0.3s, background 0.3s;
      }
      #${OVERLAY_ID} .cc-header {
        display: flex; align-items: center; gap: 10px;
        margin-bottom: 12px; padding-bottom: 12px;
        border-bottom: 1px solid rgba(0,0,0,0.08);
      }
      #${OVERLAY_ID} .cc-icon { font-size: 18px; }
      #${OVERLAY_ID} .cc-title {
        font-weight: 700; font-size: 13px; letter-spacing: 0.3px; color: #374151; flex: 1; text-transform: uppercase;
      }
      #${OVERLAY_ID} .cc-score {
        font-weight: 800; font-size: 14px; padding: 3px 10px; border-radius: 6px; color: #fff; background: ${color};
      }
      #${OVERLAY_ID} .cc-loading {
        font-size: 13px; color: #6b7280; font-style: italic;
        animation: cc-pulse 1.5s ease-in-out infinite;
      }
      #${OVERLAY_ID} .cc-status { font-size: 13px; color: #4b5563; padding: 4px 0; }
      @keyframes cc-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      #${OVERLAY_ID} .cc-verdict {
        border-left: 3px solid ${color}; padding-left: 12px; margin-bottom: 14px;
      }
      #${OVERLAY_ID} .cc-label {
        font-weight: 700; font-size: 12px; text-transform: uppercase;
        letter-spacing: 0.4px; margin-bottom: 4px; color: ${color};
      }
      #${OVERLAY_ID} .cc-truth {
        font-size: 14px; line-height: 1.5; color: #374151; font-style: italic;
      }
      #${OVERLAY_ID} .cc-alts-title {
        font-weight: 700; font-size: 11px; margin-bottom: 8px;
        color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px;
      }
      #${OVERLAY_ID} .cc-alt {
        display: flex; align-items: flex-start; gap: 10px;
        background: #fff; border-radius: 8px;
        padding: 10px 12px; margin-bottom: 6px;
        border: 1px solid rgba(0,0,0,0.06);
        transition: box-shadow 0.2s;
      }
      #${OVERLAY_ID} .cc-alt:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
      #${OVERLAY_ID} .cc-alt-num {
        font-weight: 800; font-size: 16px; min-width: 20px; text-align: center; line-height: 1; color: ${color};
      }
      #${OVERLAY_ID} .cc-alt-info { flex: 1; }
      #${OVERLAY_ID} .cc-alt-name {
        font-weight: 600; font-size: 13px; color: #1f2937; margin-bottom: 2px;
      }
      #${OVERLAY_ID} .cc-alt-price { font-weight: 700; color: #16a34a; margin-left: 4px; font-size: 12px; }
      #${OVERLAY_ID} .cc-alt-why { font-size: 12px; color: #4b5563; line-height: 1.4; }
      #${OVERLAY_ID} .cc-alt-link {
        font-size: 11px; font-weight: 700; text-decoration: none;
        white-space: nowrap; padding: 4px 10px;
        border: 1px solid ${color}; border-radius: 5px;
        color: ${color}; transition: all 0.2s;
      }
      #${OVERLAY_ID} .cc-alt-link:hover { background: ${color}; color: #fff; }
    `;
  }

  // ─── OVERLAY: LOADING STATE ───
  function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="cc-header">
        <span class="cc-icon">🛡️</span>
        <span class="cc-title">CartCop BS Detector</span>
        <span class="cc-loading">Analyzing…</span>
      </div>
      <div class="cc-status">Fetching real-time product intel…</div>
    `;
    const style = document.createElement('style');
    style.id = 'cartcop-style';
    style.textContent = buildStyles('#9ca3af', '#f9fafb');
    return { overlay, style };
  }

  // ─── OVERLAY: RESULT STATE ───
  function renderResult(data) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    const color = getBsColor(data.bsScore);
    const bg = getBsBackground(data.bsScore);
    const label = getBsLabel(data.bsScore);

    overlay.style.borderColor = color;
    overlay.style.background = bg;
    overlay.innerHTML = `
      <div class="cc-header">
        <span class="cc-icon">🛡️</span>
        <span class="cc-title">CartCop BS Detector</span>
        <span class="cc-score">${data.bsScore}/100</span>
      </div>
      <div class="cc-verdict">
        <div class="cc-label">${label}</div>
        <div class="cc-truth">${data.brutalTruth}</div>
      </div>
      <div class="cc-alts">
        <div class="cc-alts-title">Better Alternatives</div>
        ${data.alternatives.map((alt, i) => `
          <div class="cc-alt">
            <div class="cc-alt-num">${i + 1}</div>
            <div class="cc-alt-info">
              <div class="cc-alt-name">${alt.name} <span class="cc-alt-price">${alt.price}</span></div>
              <div class="cc-alt-why">${alt.whyBetter}</div>
            </div>
            <a class="cc-alt-link" href="${alt.link}" target="_blank" rel="noopener">View →</a>
          </div>
        `).join('')}
      </div>
    `;

    const styleEl = document.getElementById('cartcop-style');
    if (styleEl) styleEl.textContent = buildStyles(color, bg);
  }

  function renderError(msg) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.style.borderColor = '#dc2626';
    overlay.style.background = '#fef2f2';
    overlay.innerHTML = `
      <div class="cc-header">
        <span class="cc-icon">🛡️</span>
        <span class="cc-title">CartCop BS Detector</span>
      </div>
      <div class="cc-status" style="color:#dc2626">⚠️ ${msg}</div>
    `;
  }

  // ─── DOM INJECTION ───
  function findAddToCartContainer() {
    const selectors = [
      '#addToCart_feature_div',
      '#add-to-cart-button',
      '#buybox',
      '#desktop_buybox',
      '[data-feature-name="addToCart"]',
      '#twister-plus-buy-box'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el.closest('#addToCart_feature_div, #buybox, #desktop_buybox, [data-feature-name="addToCart"]') || el;
    }
    for (const btn of document.querySelectorAll('button, input[type="submit"]')) {
      const text = (btn.textContent || btn.value || '').toLowerCase();
      if (text.includes('add to cart') || text.includes('aggiungi al carrello')) {
        return btn.closest('div[class*="buybox"], div[id*="buybox"]') || btn;
      }
    }
    return null;
  }

  function injectOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;
    if (!/\/dp\/[A-Z0-9]{10}/.test(window.location.href)) return;

    const { overlay, style } = createLoadingOverlay();
    const target = findAddToCartContainer();

    if (target?.parentNode) {
      target.parentNode.insertBefore(overlay, target);
    } else {
      document.body.prepend(overlay);
    }
    document.head.appendChild(style);

    const payload = scrapeProductData();
    console.log('[CartCop] Analyzing product:', payload.title);

    chrome.runtime.sendMessage({ type: 'ANALYZE_PRODUCT', payload }, response => {
      if (chrome.runtime.lastError || response?.error) {
        const msg = response?.error || chrome.runtime.lastError.message;
        console.error('[CartCop] Error:', msg);
        renderError(msg);
      } else {
        console.log('[CartCop] BS Score:', response.bsScore);
        renderResult(response);
      }
    });
  }

  // ─── INIT ───
  function init() {
    injectOverlay();

    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        document.getElementById(OVERLAY_ID)?.remove();
        setTimeout(injectOverlay, 800);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
