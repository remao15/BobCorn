// CartCop Popup — Macro layer (score, verdict, summary, alternatives, stats)
// No highlight content — that's the micro layer in the DOM.

const POLL_INTERVAL = 1500;

// Track state
let currentView = 'loading';
let currentAnalysis = null;
let currentProductId = null;
let currentSkipped = false;
let streamPort = null;
let isStreaming = false;
let streamBuffer = '';

// ==================== UTILITIES ====================

function getBsColor(score) {
  if (score >= 70) return '#ff4444';
  if (score >= 40) return '#ffaa00';
  return '#00cc66';
}

function getVerdictIcon(verdict) {
  if (verdict === 'SUSPICIOUS') return '\uD83D\uDEA8';
  if (verdict === 'WARNING') return '\u26A0\uFE0F';
  return '\u2705';
}

function truncate(text, maxLen = 28) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const mins = Math.floor(diff / (60 * 1000));
      return mins < 1 ? 'Just now' : `${mins}m ago`;
    }
    return `${hours}h ago`;
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function formatCurrency(value) {
  if (value === null || value === undefined) return '+ unknown';
  if (typeof value !== 'number' || isNaN(value)) return '+ unknown';
  return `+ $${value.toFixed(2)}`;
}

function hashUrl(url) {
  try {
    const parsed = new URL(url);
    const key = `${parsed.hostname}${parsed.pathname}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  } catch {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// ==================== STREAMING ====================

function connectStream() {
  if (streamPort) return;
  streamPort = chrome.runtime.connect({ name: 'cartcop-stream' });
  streamPort.onMessage.addListener(handleStreamMessage);
  streamPort.onDisconnect.addListener(() => {
    streamPort = null;
    isStreaming = false;
  });
}

function handleStreamMessage(msg) {
  if (msg.type === 'CHUNK') {
    isStreaming = true;
    streamBuffer += msg.text;
    updateStreamingUI();
  } else if (msg.type === 'DONE') {
    isStreaming = false;
    streamBuffer = '';
    // Analysis is now in storage, poll will pick it up
  } else if (msg.type === 'ERROR') {
    isStreaming = false;
    streamBuffer = '';
    renderState('\u274C', msg.error || 'Streaming error');
  }
}

function updateStreamingUI() {
  // Show a typing animation with the accumulated buffer
  const content = document.getElementById('content');
  if (!content.querySelector('.streaming-state')) {
    content.innerHTML = `
      <div class="state streaming-state">
        <div class="state-icon">&#9203;</div>
        <div class="state-label loading-text">Analyzing product...</div>
        <div class="summary" style="margin-top:12px;text-align:left;min-height:40px;">
          <span id="stream-text"></span><span class="streaming-cursor"></span>
        </div>
      </div>
    `;
  }
  const streamText = document.getElementById('stream-text');
  if (streamText) {
    // Show last ~200 chars of buffer as a preview
    const preview = streamBuffer.slice(-200);
    streamText.textContent = preview;
  }
}

// ==================== RENDER FUNCTIONS ====================

function renderIssues(issues) {
  if (!issues?.length) return '<div style="color:#555;font-size:12px">No issues found.</div>';
  return issues.map(issue => `
    <div class="issue">
      <span class="issue-sev sev-${issue.severity}">${issue.severity}</span>
      <div>
        <div class="issue-type">${issue.type}</div>
        <div class="issue-detail">${issue.detail}</div>
      </div>
    </div>
  `).join('');
}

function renderAlternatives(alts, color) {
  if (!alts?.length) return '<div style="color:#555;font-size:12px">No alternatives found.</div>';
  return alts.map((alt, i) => `
    <div class="alt">
      <div class="alt-num" style="color:${color}">${i + 1}</div>
      <div class="alt-body">
        <div class="alt-name">${alt.name} <span class="alt-price">${alt.price}</span></div>
        <div class="alt-service">${alt.service}</div>
        <div class="alt-why">${alt.whyBetter}</div>
      </div>
      <a class="alt-link" href="${alt.url}" target="_blank" rel="noopener"
         style="border:1px solid ${color};color:${color}">View \u2192</a>
    </div>
  `).join('');
}

function renderHighlightsPill(count) {
  if (!count || count <= 0) return '';
  return `<span class="highlights-pill">${count} highlights on page \u2197</span>`;
}

function renderActionBar(analysis, productId, skipped) {
  const bsScore = analysis.pageComments?.bsScore || 0;

  if (skipped) {
    const saved = analysis.moneySaved;
    const savedText = saved !== null ? formatCurrency(saved).replace('+ ', '') : 'unknown';
    return `
      <div class="action-bar">
        <button class="btn btn-skip-done" disabled>
          \u2713 Skipped \u2014 ${savedText} saved
        </button>
      </div>
    `;
  }

  if (bsScore >= 40) {
    return `
      <div class="action-bar">
        <button class="btn btn-skip" id="skip-btn">
          Skip & Save
        </button>
      </div>
    `;
  }

  return `
    <div class="action-bar">
      <button class="btn btn-noted" id="noted-btn">
        Noted \u2014 mark as reviewed
      </button>
    </div>
  `;
}

function renderAnalysis(analysis, isCached = false, cachedAt = null) {
  const pc = analysis.pageComments || {};
  const color = getBsColor(pc.bsScore || 0);
  const icon = getVerdictIcon(pc.verdict);
  const productId = hashUrl(analysis.url);

  currentAnalysis = analysis;
  currentProductId = productId;
  currentSkipped = analysis.skipped || false;
  currentView = isCached ? 'cached' : 'live';

  const scoreBadge = document.getElementById('score-badge');
  scoreBadge.textContent = `${pc.bsScore || '?'}/100`;
  scoreBadge.style.background = color;
  scoreBadge.style.display = '';

  const cachedLabel = isCached ? `<span class="cached-label">Cached \u00B7 ${formatDate(cachedAt)}</span>` : '';
  const highlightsCount = analysis.highlightsCount || 0;
  const highlightsPill = !isCached ? renderHighlightsPill(highlightsCount) : '';

  document.getElementById('content').innerHTML = `
    <div class="section">
      <div class="section-title">${icon} Verdict ${cachedLabel} ${highlightsPill}</div>
      <div class="summary">${pc.summary || 'No summary available.'}</div>
    </div>
    <div class="section">
      <div class="section-title">\u26A0\uFE0F Issues Found</div>
      ${renderIssues(pc.issues)}
    </div>
    <div class="section">
      <div class="section-title">\u2705 Better Alternatives</div>
      ${renderAlternatives(analysis.alternatives, color)}
    </div>
    ${renderActionBar(analysis, productId, currentSkipped)}
  `;

  // Attach skip/noted button handlers
  const skipBtn = document.getElementById('skip-btn');
  if (skipBtn) skipBtn.addEventListener('click', handleSkip);

  const notedBtn = document.getElementById('noted-btn');
  if (notedBtn) notedBtn.addEventListener('click', handleNoted);
}

async function handleSkip() {
  if (!currentProductId) return;
  const btn = document.getElementById('skip-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    await chrome.runtime.sendMessage({
      type: 'SAVE_ANALYSIS',
      payload: {
        url: currentAnalysis.url,
        title: currentAnalysis.product,
        price: currentAnalysis.price
      },
      analysis: currentAnalysis
    });

    const result = await chrome.runtime.sendMessage({
      type: 'SKIP_PRODUCT',
      id: currentProductId
    });

    if (result.success) {
      currentSkipped = true;
      const saved = result.result.moneySaved;
      const savedText = saved !== null ? formatCurrency(saved).replace('+ ', '') : 'unknown';
      const actionBar = document.querySelector('.action-bar');
      if (actionBar) {
        actionBar.innerHTML = `
          <button class="btn btn-skip-done" disabled>
            \u2713 Skipped \u2014 ${savedText} saved
          </button>
        `;
      }
    }
  } catch (err) {
    console.error('Skip failed:', err);
    if (btn) { btn.disabled = false; btn.textContent = 'Skip & Save'; }
  }
}

async function handleNoted() {
  if (!currentProductId) return;
  const btn = document.getElementById('noted-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    await chrome.runtime.sendMessage({
      type: 'SAVE_ANALYSIS',
      payload: {
        url: currentAnalysis.url,
        title: currentAnalysis.product,
        price: currentAnalysis.price
      },
      analysis: currentAnalysis
    });
    if (btn) btn.textContent = '\u2713 Marked as reviewed';
  } catch (err) {
    console.error('Noted failed:', err);
    if (btn) { btn.disabled = false; btn.textContent = 'Noted \u2014 mark as reviewed'; }
  }
}

function renderDashboard(stats, recentProducts) {
  currentView = 'dashboard';
  currentAnalysis = null;
  currentProductId = null;
  currentSkipped = false;

  const scoreBadge = document.getElementById('score-badge');
  scoreBadge.style.display = 'none';

  const avgScore = stats.avgScore !== null
    ? `${Math.round(stats.avgScore)}/100`
    : 'N/A';

  let recentHtml = '';

  if (recentProducts.length === 0) {
    recentHtml = `
      <div class="empty-dashboard">
        <div class="empty-dashboard-icon">&#128269;</div>
        <div class="empty-dashboard-text">
          No products analyzed yet.<br/>
          Visit a product page to get started.
        </div>
      </div>
    `;
  } else {
    recentHtml = `
      <div class="recent-list">
        ${recentProducts.slice(0, 5).map(p => {
          const color = getBsColor(p.pageComments?.bsScore || 0);
          const dotColor = p.pageComments?.verdict === 'SUSPICIOUS' ? '#ff4444' :
                           p.pageComments?.verdict === 'WARNING' ? '#ffaa00' : '#00cc66';
          return `
            <div class="recent-item" data-id="${p.id}">
              <span class="recent-dot" style="background:${dotColor}"></span>
              <div class="recent-info">
                <div class="recent-name">${truncate(p.title)}</div>
                <div class="recent-meta">
                  <span>${p.price || 'No price'}</span>
                  <span class="recent-score" style="background:${color}">${p.pageComments?.bsScore || '?'}/100</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <a href="history.html" target="_blank" class="view-all">View all \u2192</a>
    `;
  }

  document.getElementById('content').innerHTML = `
    <div class="dashboard">
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-value saved">${formatCurrency(stats.totalSaved)}</div>
          <div class="stat-label">Total Saved</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.totalAnalyzed}</div>
          <div class="stat-label">Analyzed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${avgScore}</div>
          <div class="stat-label">Avg BS</div>
        </div>
      </div>
      <div class="recent-title">Recent Products</div>
      ${recentHtml}
    </div>
  `;

  document.querySelectorAll('.recent-item[data-id]').forEach(item => {
    item.addEventListener('click', () => loadCachedProduct(item.dataset.id));
  });
}

function renderState(icon, message) {
  const scoreBadge = document.getElementById('score-badge');
  scoreBadge.style.display = 'none';
  document.getElementById('content').innerHTML = `
    <div class="state">
      <div class="state-icon">${icon}</div>
      <div class="state-label">${message}</div>
    </div>
  `;
}

async function loadCachedProduct(id) {
  try {
    const result = await chrome.runtime.sendMessage({ type: 'GET_PRODUCT', id });
    if (result.success && result.result) {
      renderAnalysis(result.result, true, result.result.analyzedAt);
    } else {
      renderState('\u274C', 'Product not found in history.');
    }
  } catch (err) {
    renderState('\u274C', 'Failed to load product.');
  }
}

// ==================== MAIN POLL LOOP ====================

async function poll() {
  // Connect streaming port first
  connectStream();

  chrome.runtime.sendMessage({ type: 'GET_ANALYSIS' }, async result => {
    if (!result || chrome.runtime.lastError) {
      await showDashboard();
      return;
    }

    if (result.cartcop_status === 'loading') {
      // If we're already streaming, the streaming UI is active
      // Otherwise show the loading state
      if (!isStreaming) {
        renderState('\u23F3', '<span class="loading-text">Analyzing product...</span>');
      }
      setTimeout(poll, POLL_INTERVAL);
      return;
    }

    if (result.cartcop_status === 'error') {
      renderState('\u274C', result.cartcop_error || 'An error occurred.');
      return;
    }

    if (result.cartcop_status === 'done' && result.cartcop_analysis) {
      const analysis = result.cartcop_analysis;
      const productId = hashUrl(analysis.url);

      // Check if already skipped
      try {
        const historyResult = await chrome.runtime.sendMessage({ type: 'GET_PRODUCT', id: productId });
        if (historyResult.success && historyResult.result) {
          analysis.skipped = historyResult.result.skipped;
        }
      } catch {}

      // Get highlights count from session storage
      try {
        const sessionResult = await chrome.storage.session.get(['cartcop_highlights']);
        analysis.highlightsCount = (sessionResult.cartcop_highlights || []).length;
      } catch {}

      renderAnalysis(analysis);

      // Auto-save
      try {
        await chrome.runtime.sendMessage({
          type: 'SAVE_ANALYSIS',
          payload: { url: analysis.url, title: analysis.product, price: analysis.price },
          analysis: analysis
        });
      } catch (err) {
        console.warn('Auto-save failed:', err);
      }
      return;
    }

    // No analysis — show dashboard
    await showDashboard();
  });
}

async function showDashboard() {
  try {
    const result = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
    let stats = { totalSaved: 0, totalAnalyzed: 0, avgScore: null };
    let recentProducts = [];

    if (result.success && result.result) {
      const products = result.result;
      const totalSaved = products.reduce((sum, p) => sum + (p.moneySaved || 0), 0);
      const totalAnalyzed = products.length;
      const scores = products.map(p => p.pageComments?.bsScore).filter(s => typeof s === 'number');
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      stats = { totalSaved, totalAnalyzed, avgScore };
      recentProducts = products;
    }

    renderDashboard(stats, recentProducts);
  } catch (err) {
    renderDashboard({ totalSaved: 0, totalAnalyzed: 0, avgScore: null }, []);
  }
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', poll);
