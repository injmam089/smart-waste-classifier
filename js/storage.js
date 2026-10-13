/**
 * Smart Waste Classifier - Local Storage Module
 * Manages persistent client-side scan history and statistics in browser LocalStorage.
 * Follows Master Plan Section 13 and FR-12, FR-14.
 */

import { generateId } from './utils.js';

/**
 * Single versioned LocalStorage key for scan history.
 */
export const STORAGE_KEY = 'smartWaste.scanHistory';

/**
 * Checks whether browser LocalStorage is available and writable.
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    if (typeof localStorage === 'undefined') return false;
    const testKey = '__swc_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves all stored scan records, sorted newest first.
 * Gracefully handles missing storage, corrupted JSON, or empty datasets.
 *
 * @returns {Array<{
 *   scanId: string,
 *   timestamp: string,
 *   category: 'recyclable'|'organic'|'ewaste'|'unknown',
 *   predictedClass: string,
 *   confidence: number,
 *   guidanceKey: string
 * }>}
 */
export function getScanHistory() {
  if (!isStorageAvailable()) {
    console.warn('[Storage] LocalStorage is not accessible.');
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[Storage] Stored history payload is not an array; resetting to empty array.');
      return [];
    }

    // Sort newest first by ISO timestamp
    return parsed.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('[Storage] Error reading or parsing scan history:', err);
    return [];
  }
}

/**
 * Saves an accepted, confident scan record to LocalStorage.
 * Strictly guarantees that NO raw image data (base64/data URLs) is stored.
 *
 * @param {Object} record
 * @param {string} [record.scanId]
 * @param {string} [record.timestamp]
 * @param {string} record.category 'recyclable'|'organic'|'ewaste'|'unknown'
 * @param {string} record.predictedClass Model class name (e.g. 'Plastic Bottle')
 * @param {number} record.confidence Probability value between 0.0 and 1.0
 * @param {string} [record.guidanceKey] Key linking to waste-data.js
 * @returns {{success: boolean, record?: Object, error?: string}}
 */
export function saveScan(record) {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: 'Your scan was completed, but local history could not be saved (storage unavailable).'
    };
  }

  if (!record || typeof record !== 'object') {
    return {
      success: false,
      error: 'Invalid scan record provided.'
    };
  }

  try {
    const history = getScanHistory();

    // Construct sanitized record adhering to schema (FR-12)
    const cleanRecord = {
      scanId: record.scanId || generateId('scan'),
      timestamp: record.timestamp || new Date().toISOString(),
      category: record.category || 'unknown',
      predictedClass: record.predictedClass || 'Unidentified Item',
      confidence: typeof record.confidence === 'number'
        ? Math.max(0, Math.min(1, record.confidence))
        : 0,
      guidanceKey: record.guidanceKey || record.category || 'unknown'
    };

    // Explicitly guarantee no image bytes are saved to prevent quota exhaustion & privacy leakage
    delete cleanRecord.image;
    delete cleanRecord.imageData;
    delete cleanRecord.dataUrl;
    delete cleanRecord.thumbnail;

    // Prepend newest scan
    history.unshift(cleanRecord);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    console.log(`[Storage] Saved scan record ${cleanRecord.scanId} (${cleanRecord.predictedClass}) to LocalStorage.`);

    return {
      success: true,
      record: cleanRecord
    };
  } catch (err) {
    console.error('[Storage] QuotaExceeded or write error while saving scan:', err);
    return {
      success: false,
      error: 'Your scan was completed, but local history could not be saved.'
    };
  }
}

/**
 * Clears all scan records from LocalStorage.
 *
 * @returns {{success: boolean, error?: string}}
 */
export function clearScanHistory() {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: 'LocalStorage is unavailable.'
    };
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Storage] Scan history cleared successfully.');
    return { success: true };
  } catch (err) {
    console.error('[Storage] Failed to clear scan history:', err);
    return {
      success: false,
      error: 'Failed to clear scan history from storage.'
    };
  }
}

/**
 * Computes aggregated statistics from stored scan records.
 * Useful for Phase 6 validation and Phase 7 Statistics dashboard.
 *
 * @returns {{
 *   total: number,
 *   counts: { recyclable: number, organic: number, ewaste: number, other: number },
 *   percentages: { recyclable: number, organic: number, ewaste: number, other: number }
 * }}
 */
export function getStatistics() {
  const history = getScanHistory();
  const counts = {
    recyclable: 0,
    organic: 0,
    ewaste: 0,
    other: 0
  };

  history.forEach((item) => {
    const cat = (item.category || '').toLowerCase();
    if (cat === 'recyclable') {
      counts.recyclable++;
    } else if (cat === 'organic') {
      counts.organic++;
    } else if (cat === 'ewaste') {
      counts.ewaste++;
    } else {
      counts.other++;
    }
  });

  const total = history.length;
  const percentages = {
    recyclable: total > 0 ? Math.round((counts.recyclable / total) * 100) : 0,
    organic: total > 0 ? Math.round((counts.organic / total) * 100) : 0,
    ewaste: total > 0 ? Math.round((counts.ewaste / total) * 100) : 0,
    other: total > 0 ? Math.round((counts.other / total) * 100) : 0
  };

  return {
    total,
    counts,
    percentages
  };
}
