const POLL_INTERVAL = 1500;

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

function renderAnalysis(analysis) {
  const pc = analysis.pageComments;
  const color = getBsColor(pc.bsScore);
  const icon = getVerdictIcon(pc.verdict);

  const scoreBadge = document.getElementById('score-badge');
  scoreBadge.textContent = `${pc.bsScore}/100`;
  scoreBadge.style.background = color;
  scoreBadge.style.display = '';

  document.getElementById('content').innerHTML = `
    <div class="section">
      <div class="section-title">${icon} Verdict</div>
      <div class="summary">${pc.summary}</div>
    </div>
    <div class="section">
      <div class="section-title">\u26A0\uFE0F Issues Found</div>
      ${renderIssues(pc.issues)}
    </div>
    <div class="section">
      <div class="section-title">\u2705 Better Alternatives</div>
      ${renderAlternatives(analysis.alternatives, color)}
    </div>
  `;
}

function renderState(icon, message) {
  document.getElementById('content').innerHTML = `
    <div class="state">
      <div class="state-icon">${icon}</div>
      <div class="state-label">${message}</div>
    </div>
  `;
}

function poll() {
  chrome.runtime.sendMessage({ type: 'GET_ANALYSIS' }, result => {
    if (!result || chrome.runtime.lastError) {
      renderState('\uD83D\uDD0D', 'Navigate to a product page to analyze it.');
      return;
    }
    if (result.cartcop_status === 'loading') {
      renderState('\u23F3', '<span class="loading-text">Analyzing product...</span>');
      setTimeout(poll, POLL_INTERVAL);
      return;
    }
    if (result.cartcop_status === 'error') {
      renderState('\u274C', result.cartcop_error || 'An error occurred.');
      return;
    }
    if (result.cartcop_status === 'done' && result.cartcop_analysis) {
      renderAnalysis(result.cartcop_analysis);
      return;
    }
    renderState('\uD83D\uDD0D', 'Navigate to a product page to analyze it.');
  });
}

document.addEventListener('DOMContentLoaded', poll);
