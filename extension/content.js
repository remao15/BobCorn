/**
 * CartCop Content Script
 * Injects a BS Detector overlay on Amazon product pages.
 */

(function () {
  'use strict';

  // ─── CONFIG ───
  const OVERLAY_ID = 'cartcop-bs-detector';

  // ─── STEP 3: TARGET IDENTIFICATION ───
  function getNormalizedUrl() {
    const url = new URL(window.location.href);
    // Strip query params and fragments for robust matching
    return `${url.origin}${url.pathname}`;
  }

  function findProductData() {
    const currentUrl = getNormalizedUrl();
    const db = window.CARTCOP_MOCK_DB || {};

    // Try exact match first
    if (db[currentUrl]) {
      return db[currentUrl];
    }

    // Try matching by ASIN (the /dp/XXXX part)
    const asinMatch = currentUrl.match(/\/dp\/[A-Z0-9]{10}/);
    if (asinMatch) {
      const asin = asinMatch[0];
      for (const key of Object.keys(db)) {
        if (key.includes(asin)) {
          return db[key];
        }
      }
    }

    return null;
  }

  // ─── STEP 4: UI INJECTION ───
  function getBsColor(score) {
    if (score >= 70) return '#ff4444'; // Red — high BS
    if (score >= 40) return '#ffaa00'; // Orange — medium BS
    return '#00cc66'; // Green — low BS / good product
  }

  function getBsLabel(score) {
    if (score >= 70) return 'HIGH BS ALERT';
    if (score >= 40) return 'MEDIUM BS WARNING';
    return 'LOW BS — SOLID PICK';
  }

  function createOverlay(data) {
    const color = getBsColor(data.bsScore);
    const label = getBsLabel(data.bsScore);

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="cartcop-header">
        <span class="cartcop-icon">🛡️</span>
        <span class="cartcop-title">CARTCOP BS DETECTOR</span>
        <span class="cartcop-score" style="background:${color}">${data.bsScore}/100</span>
      </div>
      <div class="cartcop-verdict" style="border-left-color:${color}">
        <div class="cartcop-label" style="color:${color}">${label}</div>
        <div class="cartcop-truth">${data.brutalTruth}</div>
      </div>
      <div class="cartcop-alts">
        <div class="cartcop-alts-title">✅ Better Alternatives:</div>
        ${data.alternatives.map((alt, i) => `
          <div class="cartcop-alt">
            <div class="cartcop-alt-num">${i + 1}</div>
            <div class="cartcop-alt-info">
              <div class="cartcop-alt-name">${alt.name} <span class="cartcop-alt-price">${alt.price}</span></div>
              <div class="cartcop-alt-why">${alt.whyBetter}</div>
            </div>
            <a class="cartcop-alt-link" href="${alt.link}" target="_blank" rel="noopener">View →</a>
          </div>
        `).join('')}
      </div>
    `;

    // ─── STYLES ───
    const style = document.createElement('style');
    style.textContent = `
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
      }
      #${OVERLAY_ID} .cartcop-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      #${OVERLAY_ID} .cartcop-icon { font-size: 20px; }
      #${OVERLAY_ID} .cartcop-title {
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 0.5px;
        color: #fff;
        flex: 1;
      }
      #${OVERLAY_ID} .cartcop-score {
        font-weight: 900;
        font-size: 16px;
        padding: 4px 10px;
        border-radius: 6px;
        color: #fff;
      }
      #${OVERLAY_ID} .cartcop-verdict {
        border-left: 4px solid ${color};
        padding-left: 12px;
        margin-bottom: 16px;
      }
      #${OVERLAY_ID} .cartcop-label {
        font-weight: 800;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }
      #${OVERLAY_ID} .cartcop-truth {
        font-size: 15px;
        line-height: 1.5;
        color: #e0e0e0;
        font-style: italic;
      }
      #${OVERLAY_ID} .cartcop-alts-title {
        font-weight: 700;
        font-size: 13px;
        margin-bottom: 10px;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      #${OVERLAY_ID} .cartcop-alt {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: rgba(255,255,255,0.04);
        border-radius: 8px;
        padding: 10px 12px;
        margin-bottom: 8px;
        transition: background 0.2s;
      }
      #${OVERLAY_ID} .cartcop-alt:hover {
        background: rgba(255,255,255,0.08);
      }
      #${OVERLAY_ID} .cartcop-alt-num {
        font-weight: 900;
        font-size: 18px;
        color: ${color};
        min-width: 22px;
        text-align: center;
        line-height: 1;
      }
      #${OVERLAY_ID} .cartcop-alt-info {
        flex: 1;
      }
      #${OVERLAY_ID} .cartcop-alt-name {
        font-weight: 700;
        font-size: 14px;
        color: #fff;
        margin-bottom: 2px;
      }
      #${OVERLAY_ID} .cartcop-alt-price {
        font-weight: 600;
        color: #00cc66;
        margin-left: 4px;
      }
      #${OVERLAY_ID} .cartcop-alt-why {
        font-size: 12px;
        color: #bbb;
        line-height: 1.4;
      }
      #${OVERLAY_ID} .cartcop-alt-link {
        font-size: 12px;
        font-weight: 700;
        color: ${color};
        text-decoration: none;
        white-space: nowrap;
        padding: 4px 8px;
        border: 1px solid ${color};
        border-radius: 4px;
        transition: all 0.2s;
      }
      #${OVERLAY_ID} .cartcop-alt-link:hover {
        background: ${color};
        color: #0a0a0f;
      }
    `;

    return { overlay, style };
  }

  function findAddToCartContainer() {
    // Amazon uses multiple selectors across regions and A/B tests
    const selectors = [
      '#addToCart_feature_div',
      '#add-to-cart-button',
      '#submit.add-to-cart',
      'input[name="submit.add-to-cart"]',
      '#buybox',
      '#desktop_buybox',
      '#rcx-subscribe-and-save',
      '[data-feature-name="addToCart"]',
      '#twister-plus-buy-box'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        // Return the closest container, or the element itself
        return el.closest('#addToCart_feature_div, #buybox, #desktop_buybox, [data-feature-name="addToCart"], #twister-plus-buy-box') || el;
      }
    }

    // Fallback: look for any button with "Add to Cart" text
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    for (const btn of buttons) {
      const text = (btn.textContent || btn.value || '').toLowerCase();
      if (text.includes('add to cart') || text.includes('aggiungi al carrello')) {
        return btn.closest('div[class*="buybox"], div[class*="addToCart"], div[id*="buybox"]') || btn;
      }
    }

    return null;
  }

  function injectOverlay() {
    // Prevent duplicate injection
    if (document.getElementById(OVERLAY_ID)) {
      return;
    }

    const data = findProductData();
    if (!data) {
      console.log('[CartCop] No mock data found for this product.');
      return;
    }

    console.log('[CartCop] Product detected! BS Score:', data.bsScore);

    const { overlay, style } = createOverlay(data);
    const target = findAddToCartContainer();

    if (target && target.parentNode) {
      target.parentNode.insertBefore(overlay, target);
      document.head.appendChild(style);
      console.log('[CartCop] Overlay injected above Add to Cart.');
    } else {
      // Fallback: append to body if we can't find the button
      document.body.appendChild(overlay);
      document.head.appendChild(style);
      console.log('[CartCop] Overlay injected to body (fallback).');
    }
  }

  // ─── INIT ───
  function init() {
    // Run on initial load
    injectOverlay();

    // Re-run on URL change (Amazon uses SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        // Remove old overlay if present
        const old = document.getElementById(OVERLAY_ID);
        if (old) old.remove();
        // Small delay for Amazon's DOM to update
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
