// CartCop Comparison Page Logic

let product1 = null;
let product2 = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const hash = window.location.hash.slice(1); // Remove #
  if (!hash) {
    showError('No products specified for comparison.');
    return;
  }

  const ids = hash.split(',');
  if (ids.length !== 2) {
    showError('Invalid comparison URL.');
    return;
  }

  try {
    const [result1, result2] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'GET_PRODUCT', id: ids[0] }),
      chrome.runtime.sendMessage({ type: 'GET_PRODUCT', id: ids[1] })
    ]);

    if (!result1.success || !result1.result) {
      showError('Product 1 not found.');
      return;
    }
    if (!result2.success || !result2.result) {
      showError('Product 2 not found.');
      return;
    }

    product1 = result1.result;
    product2 = result2.result;

    // Check category warning
    if (product1.category && product2.category && product1.category !== product2.category) {
      document.getElementById('category-warning').style.display = 'block';
    }

    renderComparison();
  } catch (err) {
    console.error('Failed to load products:', err);
    showError('Failed to load products for comparison.');
  }
}

function showError(message) {
  document.getElementById('content').innerHTML = `
    <div class="error">
      <div class="error-icon">&#9888;</div>
      <div>${escapeHtml(message)}</div>
    </div>
  `;
}

function renderComparison() {
  const comparison = `
    <div class="comparison">
      ${renderProductColumn(product1, product2)}
      ${renderProductColumn(product2, product1)}
    </div>
    ${renderWinnerBar()}
  `;

  document.getElementById('content').innerHTML = comparison;
}

function renderProductColumn(product, otherProduct) {
  const pc = product.pageComments || {};
  const bsScore = pc.bsScore || 0;
  const verdict = pc.verdict || 'UNKNOWN';
  const color = getBsColor(bsScore);
  const verdictColor = verdict === 'SUSPICIOUS' ? '#ff4444' : verdict === 'WARNING' ? '#ffaa00' : '#00cc66';
  const hostname = getHostname(product.url);

  // Determine which issues are shared vs different
  const { sharedIssues, diffIssues } = categorizeIssues(pc.issues || [], otherProduct.pageComments?.issues || []);

  return `
    <div class="product-col">
      <div class="product-header">
        <div class="product-title">${escapeHtml(product.title)}</div>
        <div class="product-meta">
          <span>${hostname}</span>
          <span>${product.price || 'No price'}</span>
          <span>Analyzed ${formatFullDate(product.analyzedAt)}</span>
        </div>
      </div>

      <div class="product-section">
        <div class="section-label">BS Score</div>
        <div class="score-display">
          <span class="score-number" style="color:${color}">${bsScore}</span>
          <span class="score-unit">/100</span>
          <span class="verdict-badge" style="background:${verdictColor}">${verdict}</span>
        </div>
      </div>

      <div class="product-section">
        <div class="section-label">Summary</div>
        <div class="summary-text">${escapeHtml(pc.summary || 'No summary available.')}</div>
      </div>

      <div class="product-section">
        <div class="section-label">Issues (${pc.issues?.length || 0})</div>
        ${renderIssuesList(pc.issues || [], sharedIssues, diffIssues)}
      </div>

      <div class="product-section">
        <div class="section-label">Alternatives (${product.alternatives?.length || 0})</div>
        ${renderAlternativesList(product.alternatives || [])}
      </div>
    </div>
  `;
}

function categorizeIssues(issues1, issues2) {
  const sharedIssues = [];
  const diffIssues = [];

  issues1.forEach(issue1 => {
    const isShared = issues2.some(issue2 => 
      issue2.type === issue1.type && 
      issue2.severity === issue1.severity &&
      fuzzyMatch(issue2.detail, issue1.detail)
    );
    
    if (isShared) {
      sharedIssues.push(issue1);
    } else {
      diffIssues.push(issue1);
    }
  });

  return { sharedIssues, diffIssues };
}

function fuzzyMatch(str1, str2, threshold = 0.7) {
  if (!str1 || !str2) return false;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return true;
  
  // Simple word overlap check
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  let overlap = 0;
  words1.forEach(w => {
    if (words2.has(w)) overlap++;
  });
  
  const union = new Set([...words1, ...words2]).size;
  return overlap / union >= threshold;
}

function renderIssuesList(issues, sharedIssues, diffIssues) {
  if (issues.length === 0) {
    return '<div class="no-issues">No issues found.</div>';
  }

  // Create a map for quick lookup
  const sharedSet = new Set(sharedIssues.map(i => i.detail));

  return issues.map(issue => {
    const isShared = sharedSet.has(issue.detail);
    const className = isShared ? 'issue-item shared' : 'issue-item diff';
    
    return `
      <div class="${className}">
        <div class="issue-header">
          <span class="issue-sev sev-${issue.severity}">${issue.severity}</span>
          <span class="issue-type">${issue.type}</span>
        </div>
        <div class="issue-detail">${escapeHtml(issue.detail)}</div>
      </div>
    `;
  }).join('');
}

function renderAlternativesList(alts) {
  if (alts.length === 0) {
    return '<div class="no-issues">No alternatives found.</div>';
  }

  return alts.map((alt, i) => `
    <div class="alt-item">
      <span class="alt-num">${i + 1}</span>
      <div class="alt-body">
        <div class="alt-name">${escapeHtml(alt.name)} <span class="alt-price">${alt.price || 'N/A'}</span></div>
        <div class="alt-service">${escapeHtml(alt.service || 'Unknown')}</div>
        <div class="alt-why">${escapeHtml(alt.whyBetter || '')}</div>
      </div>
    </div>
  `).join('');
}

function renderWinnerBar() {
  const winner = determineWinner();
  
  if (!winner) {
    return `
      <div class="winner-bar">
        <span class="winner-icon">&#9899;</span>
        <div>
          <div class="winner-text">Too close to call.</div>
          <div class="winner-reason">Both products have similar scores, issues, and pricing.</div>
        </div>
      </div>
    `;
  }

  const winnerProduct = winner.product;
  const loserProduct = winner.product === product1 ? product2 : product1;
  const reasons = [];

  if (winner.scoresDiff !== 0) {
    reasons.push(`${winner.scoresDiff > 0 ? 'lower' : 'higher'} BS score (${winnerProduct.pageComments.bsScore} vs ${loserProduct.pageComments.bsScore})`);
  }
  if (winner.highIssuesDiff !== 0) {
    reasons.push(`${winner.highIssuesDiff > 0 ? 'fewer' : 'more'} high-severity issues`);
  }
  if (winner.priceDiff !== 0) {
    const wPrice = parsePrice(winnerProduct.price) || 0;
    const lPrice = parsePrice(loserProduct.price) || 0;
    reasons.push(`${winner.priceDiff > 0 ? 'cheaper' : 'more expensive'} ($${wPrice.toFixed(2)} vs $${lPrice.toFixed(2)})`);
  }

  return `
    <div class="winner-bar">
      <span class="winner-icon">&#127942;</span>
      <div>
        <div class="winner-text">WINNER: ${escapeHtml(winner.product.title)}</div>
        <div class="winner-reason">${reasons.join(', ')}</div>
      </div>
    </div>
  `;
}

function determineWinner() {
  const pc1 = product1.pageComments || {};
  const pc2 = product2.pageComments || {};
  
  const score1 = pc1.bsScore || 0;
  const score2 = pc2.bsScore || 0;

  const highIssues1 = (pc1.issues || []).filter(i => i.severity === 'high').length;
  const highIssues2 = (pc2.issues || []).filter(i => i.severity === 'high').length;

  const price1 = parsePrice(product1.price) || 0;
  const price2 = parsePrice(product2.price) || 0;

  // Score comparison (lower is better)
  if (score1 !== score2) {
    return {
      product: score1 < score2 ? product1 : product2,
      scoresDiff: score1 - score2,
      highIssuesDiff: 0,
      priceDiff: 0
    };
  }

  // High severity issues comparison (fewer is better)
  if (highIssues1 !== highIssues2) {
    const winner = highIssues1 < highIssues2 ? product1 : product2;
    return {
      product: winner,
      scoresDiff: 0,
      highIssuesDiff: highIssues1 - highIssues2,
      priceDiff: 0
    };
  }

  // Price comparison (lower is better)
  if (price1 !== price2) {
    return {
      product: price1 < price2 ? product1 : product2,
      scoresDiff: 0,
      highIssuesDiff: 0,
      priceDiff: price1 - price2
    };
  }

  // All tied
  return null;
}

// Utility functions
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'Unknown';
  }
}

function formatFullDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function getBsColor(score) {
  if (score >= 70) return '#ff4444';
  if (score >= 40) return '#ffaa00';
  return '#00cc66';
}

function parsePrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return null;
  let cleaned = priceStr.replace(/[€$£¥₹\s]/g, '').trim();
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  
  if (lastComma > lastDot) {
    cleaned = cleaned.replace(/,/g, '.');
  } else if (lastComma !== -1 && lastDot === -1) {
    cleaned = cleaned.replace(/,/g, '.');
  } else if (lastComma !== -1 && lastDot !== -1) {
    cleaned = cleaned.replace(/,/g, '');
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
