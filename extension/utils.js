/**
 * CartCop Shared Utilities
 * Imported by background.js via importScripts.
 */

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

function parsePrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return null;
  // Remove currency symbols, spaces, keep digits and separators
  const stripped = priceStr.replace(/[^\d.,]/g, '');
  if (!stripped) return null;
  // Normalize: if comma is decimal separator (e.g. "19,99"), replace with dot
  const normalized = stripped.replace(/(\d),(\d{2})$/, '$1.$2').replace(/,/g, '');
  const num = parseFloat(normalized);
  if (isNaN(num) || num <= 0) return null;
  return Math.round(num * 100) / 100;
}
