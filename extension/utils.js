/**
 * CartCop Shared Utilities
 */

/**
 * Parse a price string to a number.
 * Handles formats like "€19,99", "$279.00", "£15.99", "19,99 €", etc.
 * Returns null if parsing fails.
 */
function parsePrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return null;
  
  // Remove currency symbols and whitespace
  let cleaned = priceStr.replace(/[€$£¥₹\s]/g, '').trim();
  
  // Handle formats where comma is decimal separator (e.g., "19,99" or "19,99")
  // vs. formats where comma is thousands separator (e.g., "1,999.00")
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  
  if (lastComma > lastDot) {
    // Comma is likely decimal separator
    cleaned = cleaned.replace(/,/g, '.');
  } else if (lastComma !== -1 && lastDot === -1) {
    // Only commas, treat as decimal
    cleaned = cleaned.replace(/,/g, '.');
  } else if (lastComma !== -1 && lastDot !== -1) {
    // Both present - comma is thousands separator
    cleaned = cleaned.replace(/,/g, '');
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Generate a hash from URL (hostname + pathname) for product deduplication.
 */
function hashUrl(url) {
  try {
    const parsed = new URL(url);
    const key = `${parsed.hostname}${parsed.pathname}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  } catch {
    // Fallback: use the full URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * Format a timestamp to a human-readable date string.
 */
function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 24 hours ago
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const mins = Math.floor(diff / (60 * 1000));
      return mins < 1 ? 'Just now' : `${mins}m ago`;
    }
    return `${hours}h ago`;
  }
  
  // Less than 7 days ago
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  }
  
  // Otherwise show date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Format a full date for comparison pages.
 */
function formatFullDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
function truncate(text, maxLen = 28) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

/**
 * Format currency for display.
 * Handles both numeric values and formatted strings.
 */
function formatCurrency(value, fallback = '+ unknown') {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'number' || isNaN(value)) return fallback;
  
  // Determine currency symbol from the sum of previously parsed values
  // Default to $ but this could be enhanced
  const symbol = '$';
  return `${symbol}${value.toFixed(2)}`;
}

/**
 * Get BS score color based on score value.
 */
function getBsColor(score) {
  if (score >= 70) return '#ff4444';
  if (score >= 40) return '#ffaa00';
  return '#00cc66';
}

/**
 * Get verdict icon.
 */
function getVerdictIcon(verdict) {
  if (verdict === 'SUSPICIOUS') return '\uD83D\uDEA8';
  if (verdict === 'WARNING') return '\u26A0\uFE0F';
  return '\u2705';
}

/**
 * Get verdict color.
 */
function getVerdictColor(verdict) {
  if (verdict === 'SUSPICIOUS') return '#ff4444';
  if (verdict === 'WARNING') return '#ffaa00';
  return '#00cc66';
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.CartCopUtils = {
    parsePrice,
    hashUrl,
    formatDate,
    formatFullDate,
    truncate,
    formatCurrency,
    getBsColor,
    getVerdictIcon,
    getVerdictColor
  };
}
