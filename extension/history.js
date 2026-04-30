// AdCheck History Page Logic

let allProducts = [];
let selectedIds = new Set();
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadHistory();
  setupEventListeners();
}

async function loadHistory() {
  try {
    const result = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
    
    if (result.success && result.result) {
      allProducts = result.result;
      updateStats();
      renderProducts();
    } else {
      showEmptyState();
    }
  } catch (err) {
    console.error('Failed to load history:', err);
    showEmptyState();
  }
}

function updateStats() {
  const totalSaved = allProducts.reduce((sum, p) => sum + (p.moneySaved || 0), 0);
  document.getElementById('total-saved').textContent = formatCurrency(totalSaved);
  document.getElementById('total-count').textContent = allProducts.length;
}

function setupEventListeners() {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  // Compare button
  document.getElementById('compare-btn').addEventListener('click', handleCompare);

  // Clear button
  document.getElementById('clear-btn').addEventListener('click', handleClear);
}

function getFilteredProducts() {
  if (currentFilter === 'all') return allProducts;
  if (currentFilter === 'skipped') return allProducts.filter(p => p.skipped);
  if (currentFilter === 'suspicious') return allProducts.filter(p => p.pageComments?.verdict === 'SUSPICIOUS');
  if (currentFilter === 'warning') return allProducts.filter(p => p.pageComments?.verdict === 'WARNING');
  if (currentFilter === 'clean') return allProducts.filter(p => p.pageComments?.verdict === 'CLEAN');
  return allProducts;
}

function renderProducts() {
  const container = document.getElementById('product-list');
  const filtered = getFilteredProducts();
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">&#128269;</div>
        <div class="empty-text">
          ${currentFilter === 'all' 
            ? 'No products in history yet.<br/>Analyze some products to see them here.' 
            : `No ${currentFilter} products found.`}
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(product => {
    const pc = product.pageComments || {};
    const bsScore = pc.bsScore || 0;
    const verdict = pc.verdict || 'UNKNOWN';
    const color = getBsColor(bsScore);
    const dotColor = verdict === 'SUSPICIOUS' ? '#ff4444' : 
                      verdict === 'WARNING' ? '#ffaa00' : '#00cc66';
    
    const isSelected = selectedIds.has(product.id);
    const isDisabled = !isSelected && selectedIds.size >= 2;
    const hostname = getHostname(product.url);

    return `
      <div class="product-row" data-id="${product.id}">
        <input type="checkbox" 
               class="product-checkbox" 
               ${isSelected ? 'checked' : ''} 
               ${isDisabled ? 'disabled' : ''}
               data-id="${product.id}">
        <span class="product-dot" style="background:${dotColor}"></span>
        <div class="product-info">
          <div class="product-title">${escapeHtml(product.title)}</div>
          <div class="product-meta">
            <span>${hostname}</span>
            <span>${product.price || 'No price'}</span>
            <span>${formatDate(product.analyzedAt)}</span>
            ${product.skipped ? '<span class="product-skipped">\u2713 Skipped</span>' : ''}
          </div>
        </div>
        <span class="product-score" style="background:${color}">${bsScore}/100</span>
        <div class="product-actions">
          <button class="action-btn" data-action="view" data-id="${product.id}">View</button>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners
  container.querySelectorAll('.product-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      handleCheckboxChange(e.target.dataset.id, e.target.checked);
    });
  });

  container.querySelectorAll('.action-btn[data-action="view"]').forEach(btn => {
    btn.addEventListener('click', () => {
      viewProduct(btn.dataset.id);
    });
  });

  updateCompareBar();
}

function handleCheckboxChange(id, checked) {
  if (checked) {
    if (selectedIds.size < 2) {
      selectedIds.add(id);
    }
  } else {
    selectedIds.delete(id);
  }
  
  // Re-render to update disabled states
  renderProducts();
}

function updateCompareBar() {
  const bar = document.getElementById('compare-bar');
  if (selectedIds.size === 2) {
    bar.classList.add('visible');
  } else {
    bar.classList.remove('visible');
  }
}

function handleCompare() {
  if (selectedIds.size !== 2) return;
  
  const ids = Array.from(selectedIds).join(',');
  window.location.href = `compare.html#${ids}`;
}

function viewProduct(id) {
  // Store the product ID in session storage and redirect to popup
  // Since this is a separate page, we just open popup.html
  // The popup will detect the cached product and show it
  chrome.runtime.sendMessage({
    type: 'GET_PRODUCT',
    id: id
  }).then(result => {
    if (result.success && result.result) {
      // Open popup with the cached product
      chrome.tabs.create({ url: 'popup.html?view=cached&id=' + id });
    }
  });
}

async function handleClear() {
  if (!confirm('Are you sure you want to clear all history? This cannot be undone.')) {
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
    allProducts = [];
    selectedIds.clear();
    updateStats();
    showEmptyState();
  } catch (err) {
    console.error('Failed to clear history:', err);
    alert('Failed to clear history. Please try again.');
  }
}

function showEmptyState() {
  document.getElementById('product-list').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">&#128269;</div>
      <div class="empty-text">
        No products in history yet.<br/>
        Analyze some products to see them here.
      </div>
    </div>
  `;
}

// Utility functions
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'Unknown';
  }
}

function formatCurrency(value) {
  if (value === null || value === undefined || typeof value !== 'number') return '$0.00';
  return `$${value.toFixed(2)}`;
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

function getBsColor(score) {
  if (score >= 70) return '#ff4444';
  if (score >= 40) return '#ffaa00';
  return '#00cc66';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
