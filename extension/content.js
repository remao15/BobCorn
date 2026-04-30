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

  // ─── HELPERS ───
  function getBsColor(score) {
    if (score >= 70) return '#ff4444';
    if (score >= 40) return '#ffaa00';
    return '#00cc66';
  }

  function getBsLabel(score) {
    if (score >= 70) return 'HIGH BS ALERT';
    if (score >= 40) return 'MEDIUM BS WARNING';
    return 'LOW BS — SOLID PICK';
  }

  // ─── STYLES ───
  function buildStyles(color) {
    return `
      #${OVERLAY_ID} {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background: #0a0a0f;
        border: 2px solid ${color};
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        color: #fff;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
        max-width: 100%;
        box-sizing: border-box;
        transition: border-color 0.4s;
      }
      #${OVERLAY_ID} .cc-header {
        display: flex; align-items: center; gap: 10px;
        margin-bottom: 12px; padding-bottom: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      #${OVERLAY_ID} .cc-icon { font-size: 20px; }
      #${OVERLAY_ID} .cc-title {
        font-weight: 800; font-size: 14px; letter-spacing: 0.5px; color: #fff; flex: 1;
      }
      #${OVERLAY_ID} .cc-score {
        font-weight: 900; font-size: 16px; padding: 4px 10px; border-radius: 6px; color: #fff;
      }
      #${OVERLAY_ID} .cc-loading {
        font-size: 13px; color: #888; font-style: italic;
        animation: cc-pulse 1.5s ease-in-out infinite;
      }
      #${OVERLAY_ID} .cc-status { font-size: 14px; color: #aaa; padding: 6px 0; }
      @keyframes cc-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
      #${OVERLAY_ID} .cc-verdict {
        border-left: 4px solid ${color}; padding-left: 12px; margin-bottom: 16px;
      }
      #${OVERLAY_ID} .cc-label {
        font-weight: 800; font-size: 13px; text-transform: uppercase;
        letter-spacing: 0.5px; margin-bottom: 6px;
      }
      #${OVERLAY_ID} .cc-truth {
        font-size: 15px; line-height: 1.5; color: #e0e0e0; font-style: italic;
      }
      #${OVERLAY_ID} .cc-alts-title {
        font-weight: 700; font-size: 13px; margin-bottom: 10px;
        color: #aaa; text-transform: uppercase; letter-spacing: 0.5px;
      }
      #${OVERLAY_ID} .cc-alt {
        display: flex; align-items: flex-start; gap: 10px;
        background: rgba(255,255,255,0.04); border-radius: 8px;
        padding: 10px 12px; margin-bottom: 8px; transition: background 0.2s;
      }
      #${OVERLAY_ID} .cc-alt:hover { background: rgba(255,255,255,0.08); }
      #${OVERLAY_ID} .cc-alt-num {
        font-weight: 900; font-size: 18px; min-width: 22px; text-align: center; line-height: 1;
      }
      #${OVERLAY_ID} .cc-alt-info { flex: 1; }
      #${OVERLAY_ID} .cc-alt-name {
        font-weight: 700; font-size: 14px; color: #fff; margin-bottom: 2px;
      }
      #${OVERLAY_ID} .cc-alt-price { font-weight: 600; color: #00cc66; margin-left: 4px; }
      #${OVERLAY_ID} .cc-alt-why { font-size: 12px; color: #bbb; line-height: 1.4; }
      #${OVERLAY_ID} .cc-alt-link {
        font-size: 12px; font-weight: 700; text-decoration: none;
        white-space: nowrap; padding: 4px 8px;
        border: 1px solid ${color}; border-radius: 4px;
        color: ${color}; transition: all 0.2s;
      }
      #${OVERLAY_ID} .cc-alt-link:hover { background: ${color}; color: #0a0a0f; }
    `;
  }

  // ─── OVERLAY: LOADING STATE ───
  function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="cc-header">
        <span class="cc-icon">🛡️</span>
        <span class="cc-title">CARTCOP BS DETECTOR</span>
        <span class="cc-loading">Analyzing with Perplexity Sonar...</span>
      </div>
      <div class="cc-status">🔍 Fetching real-time product intel...</div>
    `;
    const style = document.createElement('style');
    style.id = 'cartcop-style';
    style.textContent = buildStyles('#555');
    return { overlay, style };
  }

  // ─── OVERLAY: RESULT STATE ───
  function renderResult(data) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    const color = getBsColor(data.bsScore);
    const label = getBsLabel(data.bsScore);

    overlay.style.borderColor = color;
    overlay.innerHTML = `
      <div class="cc-header">
        <span class="cc-icon">🛡️</span>
        <span class="cc-title">CARTCOP BS DETECTOR</span>
        <span class="cc-score" style="background:${color}">${data.bsScore}/100</span>
      </div>
      <div class="cc-verdict" style="border-left-color:${color}">
        <div class="cc-label" style="color:${color}">${label}</div>
        <div class="cc-truth">${data.brutalTruth}</div>
      </div>
      <div class="cc-alts">
        <div class="cc-alts-title">✅ Better Alternatives:</div>
        ${data.alternatives.map((alt, i) => `
          <div class="cc-alt">
            <div class="cc-alt-num" style="color:${color}">${i + 1}</div>
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
    if (styleEl) styleEl.textContent = buildStyles(color);
  }

  function renderError(msg) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.innerHTML = `
      <div class="cc-header">
        <span class="cc-icon">🛡️</span>
        <span class="cc-title">CARTCOP BS DETECTOR</span>
      </div>
      <div class="cc-status" style="color:#ff4444">⚠️ ${msg}</div>
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
