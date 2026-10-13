/**
 * Smart Waste Classifier - Shared Utilities
 * Provides DOM helpers, date formatters, and validation helpers.
 */

/**
 * Select a single DOM element matching a CSS selector.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Select all DOM elements matching a CSS selector.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Formats a probability ratio (0.0 to 1.0) into a user-friendly percentage string.
 * @param {number} probability
 * @returns {string} e.g. "94%"
 */
export function formatConfidence(probability) {
  if (typeof probability !== 'number' || isNaN(probability)) {
    return '0%';
  }
  const percentage = Math.round(Math.max(0, Math.min(1, probability)) * 100);
  return `${percentage}%`;
}

/**
 * Formats an ISO date string or Date object into human-readable date and time.
 * @param {string|Date} dateInput
 * @returns {string} e.g. "13 Oct 2026, 5:10 PM"
 */
export function formatDate(dateInput) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Unknown date';
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'Unknown date';
  }
}

/**
 * Generates a unique, non-crypto identifier for scan records.
 * @param {string} [prefix='scan']
 * @returns {string}
 */
export function generateId(prefix = 'scan') {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${randomSuffix}`;
}

/**
 * Escapes HTML characters in a string to prevent XSS injection.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
