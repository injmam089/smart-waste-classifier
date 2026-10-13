/**
 * Smart Waste Classifier - UI Module (Mobile-First Overhaul)
 * Handles screen transitions, accessible navigation, view states, camera UI,
 * dynamic scan history filtering, recent scans, and statistics.
 */

import { $, $$, formatConfidence, formatDate } from './utils.js';
import { getWasteGuidance } from './waste-data.js';

/**
 * Valid application screen identifiers.
 */
export const SCREENS = ['home', 'scan', 'result', 'history', 'statistics', 'about'];

let currentScreenId = 'home';
const screenChangeListeners = [];

/**
 * Rotating status messages for AI analysis state.
 */
let loadingMessageInterval = null;
const ROTATING_MESSAGES = [
  'Looking at visual features...',
  'Identifying waste type...',
  'Preparing disposal guidance...',
  'Analyzing optical textures...'
];

/**
 * Register a listener invoked whenever the active screen changes.
 * @param {function(string, string): void} listener (newScreenId, previousScreenId)
 */
export function onScreenChange(listener) {
  if (typeof listener === 'function') {
    screenChangeListeners.push(listener);
  }
}

/**
 * Switch the active visible screen.
 * @param {string} screenId Screen ID without '#' (e.g., 'home', 'scan')
 */
export function showScreen(screenId) {
  if (!SCREENS.includes(screenId)) {
    console.warn(`[UI] Unknown screen requested: "${screenId}". Falling back to "home".`);
    screenId = 'home';
  }

  const previousScreenId = currentScreenId;
  currentScreenId = screenId;

  // Update DOM screens
  const screens = $$('.app-screen');
  screens.forEach((screen) => {
    if (screen.id === `screen-${screenId}`) {
      screen.classList.add('active');
      screen.setAttribute('aria-hidden', 'false');
    } else {
      screen.classList.remove('active');
      screen.setAttribute('aria-hidden', 'true');
    }
  });

  // Update navigation active states
  const navButtons = $$('[data-nav-target]');
  navButtons.forEach((btn) => {
    const target = btn.getAttribute('data-nav-target');
    const isCurrent = target === screenId;
    btn.setAttribute('aria-current', isCurrent ? 'page' : 'false');

    // Floating center scan button styling
    if (btn.classList.contains('floating-scan-btn')) {
      if (isCurrent) {
        btn.classList.add('ring-4', 'ring-emerald-400/50');
      } else {
        btn.classList.remove('ring-4', 'ring-emerald-400/50');
      }
      return;
    }

    if (isCurrent) {
      btn.classList.add('text-emerald-700', 'font-bold');
      btn.classList.remove('text-slate-500', 'text-slate-600', 'font-medium');
    } else {
      btn.classList.remove('text-emerald-700', 'font-bold');
      btn.classList.add('text-slate-500', 'font-medium');
    }
  });

  // Announce for screen readers
  const announcer = $('#screen-announcer');
  if (announcer) {
    const readableTitle = screenId.charAt(0).toUpperCase() + screenId.slice(1);
    announcer.textContent = `${readableTitle} screen loaded`;
  }

  // Scroll viewport smoothly to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update browser URL hash cleanly without causing duplicate popstate events
  if (window.location.hash !== `#${screenId}`) {
    history.replaceState(null, '', `#${screenId}`);
  }

  // Shift focus to the main heading of the new screen for accessibility
  const activeScreen = $(`#screen-${screenId}`);
  if (activeScreen) {
    const heading = activeScreen.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }

  // Notify registered listeners of screen transition
  screenChangeListeners.forEach((listener) => {
    try {
      listener(screenId, previousScreenId);
    } catch (err) {
      console.error('[UI] Screen change listener error:', err);
    }
  });
}

/**
 * Returns currently active screen ID.
 * @returns {string}
 */
export function getCurrentScreen() {
  return currentScreenId;
}

/**
 * Updates the camera viewfinder overlay and controls state.
 * @param {'prompt'|'loading'|'active'|'captured'|'error'} state
 * @param {Object} [details={}]
 */
export function updateCameraUI(state, details = {}) {
  const overlayPrompt = $('#camera-overlay-prompt');
  const overlayLoading = $('#camera-overlay-loading');
  const overlayError = $('#camera-overlay-error');
  const overlayCaptured = $('#camera-overlay-captured');
  const previewVideo = $('#camera-preview');
  const reticle = $('#camera-reticle');
  const btnCapture = $('#btn-capture');
  const btnFlip = $('#btn-flip-camera');
  const controlsLive = $('#controls-live');
  const controlsCaptured = $('#controls-captured');
  const statusBadge = $('#camera-status-badge');
  const statusDot = $('#camera-status-dot');
  const statusText = $('#camera-status-text');
  const errorTitle = $('#camera-error-title');
  const errorMessage = $('#camera-error-message');
  const capturedImg = $('#captured-image-preview');

  // Hide all overlays initially
  [overlayPrompt, overlayLoading, overlayError, overlayCaptured].forEach((el) => {
    if (el) el.classList.add('hidden');
  });

  if (state === 'prompt') {
    if (overlayPrompt) overlayPrompt.classList.remove('hidden');
    if (previewVideo) previewVideo.classList.add('hidden');
    if (reticle) reticle.classList.add('hidden');
    if (btnCapture) btnCapture.disabled = true;
    if (btnFlip) btnFlip.disabled = true;
    if (controlsLive) controlsLive.classList.remove('hidden');
    if (controlsCaptured) controlsCaptured.classList.add('hidden');

    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-slate-400';
    if (statusText) statusText.textContent = 'Standby';
    if (statusBadge) statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full flex items-center gap-1.5';
  } else if (state === 'loading') {
    if (overlayLoading) overlayLoading.classList.remove('hidden');
    if (previewVideo) previewVideo.classList.add('hidden');
    if (reticle) reticle.classList.add('hidden');
    if (btnCapture) btnCapture.disabled = true;
    if (btnFlip) btnFlip.disabled = true;
    if (controlsLive) controlsLive.classList.remove('hidden');
    if (controlsCaptured) controlsCaptured.classList.add('hidden');

    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
    if (statusText) statusText.textContent = 'Starting Camera...';
    if (statusBadge) statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full flex items-center gap-1.5';
  } else if (state === 'active') {
    if (previewVideo) previewVideo.classList.remove('hidden');
    if (reticle) reticle.classList.remove('hidden');
    if (btnCapture) btnCapture.disabled = false;
    if (btnFlip) btnFlip.disabled = false;
    if (controlsLive) controlsLive.classList.remove('hidden');
    if (controlsCaptured) controlsCaptured.classList.add('hidden');

    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500';
    if (statusText) statusText.textContent = 'Live Preview';
    if (statusBadge) statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full flex items-center gap-1.5';
  } else if (state === 'captured') {
    if (overlayCaptured) overlayCaptured.classList.remove('hidden');
    if (previewVideo) previewVideo.classList.remove('hidden'); // Keep underneath
    if (reticle) reticle.classList.add('hidden');
    if (capturedImg && details.dataUrl) {
      capturedImg.src = details.dataUrl;
    }
    if (controlsLive) controlsLive.classList.add('hidden');
    if (controlsCaptured) controlsCaptured.classList.remove('hidden');

    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-blue-500';
    if (statusText) statusText.textContent = 'Frame Captured';
    if (statusBadge) statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-full flex items-center gap-1.5';
  } else if (state === 'error') {
    if (overlayError) overlayError.classList.remove('hidden');
    if (previewVideo) previewVideo.classList.add('hidden');
    if (reticle) reticle.classList.add('hidden');
    if (btnCapture) btnCapture.disabled = true;
    if (btnFlip) btnFlip.disabled = true;
    if (controlsLive) controlsLive.classList.remove('hidden');
    if (controlsCaptured) controlsCaptured.classList.add('hidden');

    if (errorTitle && details.title) errorTitle.textContent = details.title;
    if (errorMessage && details.message) errorMessage.textContent = details.message;

    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-rose-500';
    if (statusText) statusText.textContent = 'Camera Error';
    if (statusBadge) statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-800 rounded-full flex items-center gap-1.5';
  }
}

/**
 * Updates AI classification status within the captured frame overlay.
 * Handles rotating analysis messages and visual feedback.
 * @param {'loading'|'unconfigured'|'confident'|'uncertain'|'error'} state
 * @param {Object} [data={}]
 */
export function updateClassifierUI(state, data = {}) {
  // Clear any existing rotating message interval
  if (loadingMessageInterval) {
    clearInterval(loadingMessageInterval);
    loadingMessageInterval = null;
  }

  const loadingEl = $('#ai-loading-state');
  const unconfiguredEl = $('#ai-unconfigured-state');
  const confidentEl = $('#ai-confident-state');
  const uncertainEl = $('#ai-uncertain-state');
  const errorEl = $('#ai-error-state');
  const loadingMsgEl = $('#ai-loading-message');

  // Hide all sub-states first
  [loadingEl, unconfiguredEl, confidentEl, uncertainEl, errorEl].forEach((el) => {
    if (el) el.classList.add('hidden');
  });

  if (state === 'loading') {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (loadingMsgEl) {
      let idx = 0;
      loadingMsgEl.textContent = ROTATING_MESSAGES[0];
      loadingMessageInterval = setInterval(() => {
        idx = (idx + 1) % ROTATING_MESSAGES.length;
        if (loadingMsgEl) {
          loadingMsgEl.textContent = ROTATING_MESSAGES[idx];
        }
      }, 1200);
    }
  } else if (state === 'unconfigured') {
    if (unconfiguredEl) unconfiguredEl.classList.remove('hidden');
  } else if (state === 'confident' && data.topPrediction) {
    if (confidentEl) {
      confidentEl.classList.remove('hidden');
      const category = data.topPrediction.category;
      const iconEl = $('#ai-result-icon');
      const catEl = $('#ai-result-category');
      const classEl = $('#ai-result-class');
      const confEl = $('#ai-result-confidence');

      const icons = { recyclable: '♻️', organic: '🌱', ewaste: '🔋', unknown: '📦' };
      const labels = { recyclable: 'Recyclable', organic: 'Organic', ewaste: 'E-Waste', unknown: 'Unknown' };

      if (iconEl) iconEl.textContent = icons[category] || '📦';
      if (catEl) catEl.textContent = labels[category] || data.topPrediction.className;
      if (classEl) classEl.textContent = data.topPrediction.className;
      if (confEl) {
        const pct = Math.round(data.topPrediction.probability * 100);
        confEl.textContent = `${pct}% Confidence`;
      }
    }
  } else if (state === 'uncertain') {
    if (uncertainEl) {
      uncertainEl.classList.remove('hidden');
      const uncertConfEl = $('#ai-uncertain-confidence');
      if (uncertConfEl && data.topPrediction) {
        const pct = Math.round(data.topPrediction.probability * 100);
        uncertConfEl.textContent = `${pct}% Confidence (< 75% Threshold)`;
      }
    }
  } else if (state === 'error') {
    if (errorEl) {
      errorEl.classList.remove('hidden');
      const errorMsgEl = $('#ai-error-message');
      if (errorMsgEl && data.message) {
        errorMsgEl.textContent = data.message;
      }
    }
  }
}

/**
 * Renders dynamic classification results on the dedicated #screen-result screen.
 * Strictly uses real model output values from classifier.predict().
 *
 * @param {Object} resultData Output object from classifier.predict()
 * @param {string} [capturedDataUrl=''] Data URL of the captured video frame
 */
export function renderClassificationResult(resultData, capturedDataUrl = '') {
  const viewConfident = $('#result-view-confident');
  const viewUncertain = $('#result-view-uncertain');
  const viewError = $('#result-view-error');
  const statusBadge = $('#result-status-badge');

  // Hide all view variants initially
  [viewConfident, viewUncertain, viewError].forEach((v) => {
    if (v) v.classList.add('hidden');
  });

  if (!resultData) {
    if (viewError) viewError.classList.remove('hidden');
    const msg = $('#result-error-message');
    if (msg) msg.textContent = 'No classification data received.';
    if (statusBadge) {
      statusBadge.textContent = 'Classification Error';
      statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full';
    }
    return;
  }

  // 1. High-Confidence Result (isConfident === true, probability >= 0.75)
  if (resultData.success && resultData.isConfident && resultData.topPrediction) {
    if (viewConfident) viewConfident.classList.remove('hidden');

    const top = resultData.topPrediction;
    const probability = Number(top.probability) || 0;
    const pct = Math.round(probability * 100);

    // Update thumbnail
    const thumbImg = $('#result-captured-thumbnail');
    if (thumbImg) {
      if (capturedDataUrl) {
        thumbImg.src = capturedDataUrl;
        thumbImg.parentElement.classList.remove('hidden');
      } else {
        thumbImg.parentElement.classList.add('hidden');
      }
    }

    // Category dictionary mapping
    const categoryConfigs = {
      recyclable: {
        label: 'Recyclable',
        icon: '♻️',
        cardClass: 'bg-emerald-50/70 border-emerald-200',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        barColor: 'bg-emerald-600',
        pillColor: 'text-emerald-700'
      },
      organic: {
        label: 'Organic',
        icon: '🌱',
        cardClass: 'bg-lime-50/70 border-lime-200',
        badgeClass: 'bg-lime-100 text-lime-900 border-lime-300',
        barColor: 'bg-lime-600',
        pillColor: 'text-lime-700'
      },
      ewaste: {
        label: 'E-Waste',
        icon: '🔋',
        cardClass: 'bg-amber-50/70 border-amber-200',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        barColor: 'bg-amber-600',
        pillColor: 'text-amber-700'
      },
      unknown: {
        label: 'Uncategorized',
        icon: '📦',
        cardClass: 'bg-slate-50 border-slate-200',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        barColor: 'bg-slate-600',
        pillColor: 'text-slate-700'
      }
    };

    const config = categoryConfigs[top.category] || categoryConfigs.unknown;

    // Apply category styles to container & badge
    const cardContainer = $('#result-card-container');
    if (cardContainer) {
      cardContainer.className = `rounded-2xl p-5 mb-5 border transition-all text-center ${config.cardClass}`;
    }

    const badgeEl = $('#result-category-badge');
    if (badgeEl) {
      badgeEl.className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold mb-2.5 shadow-2xs border ${config.badgeClass}`;
    }

    const iconEl = $('#result-category-icon');
    if (iconEl) iconEl.textContent = config.icon;

    const labelEl = $('#result-category-label');
    if (labelEl) labelEl.textContent = config.label;

    // Model class name
    const classNameEl = $('#result-class-name');
    if (classNameEl) classNameEl.textContent = top.className || config.label;

    // Confidence pill & bar
    const confPill = $('#result-confidence-pill');
    if (confPill) {
      confPill.textContent = `${pct}%`;
      confPill.className = `font-bold ${config.pillColor}`;
    }

    const confBar = $('#result-confidence-bar');
    if (confBar) {
      confBar.className = `h-full rounded-full transition-all duration-500 ${config.barColor}`;
      confBar.style.width = `${pct}%`;
    }

    // Explanation
    const explanationEl = $('#result-explanation');
    if (explanationEl) {
      explanationEl.textContent = `Visual feature analysis matched this item's optical characteristics (color, shape, contours, edges, and textures) to "${top.className}" with ${pct}% model confidence.`;
    }

    // Dynamic Disposal Guidance (Phase 5)
    const guidance = getWasteGuidance(top.category);

    const summaryEl = $('#result-guidance-summary');
    if (summaryEl) {
      summaryEl.textContent = guidance.summary;
    }

    const prepListEl = $('#result-guidance-prep-list');
    populateGuidanceList(prepListEl, guidance.preparation);

    const stepsListEl = $('#result-guidance-steps-list');
    populateGuidanceList(stepsListEl, guidance.disposalSteps);

    const warningsListEl = $('#result-guidance-warnings-list');
    populateGuidanceList(warningsListEl, guidance.warnings);

    const localRuleEl = $('#result-guidance-local-rule');
    if (localRuleEl) {
      localRuleEl.textContent = guidance.localRuleNote;
    }

    if (statusBadge) {
      statusBadge.textContent = 'Classification Confident';
      statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full';
    }

    const announcer = $('#screen-announcer');
    if (announcer) {
      announcer.textContent = `Classification complete: ${top.className}, identified as ${top.category} with ${Math.round(top.probability * 100)}% confidence.`;
    }
    return;
  }

  // 2. Low-Confidence / Uncertain Result (< 75%)
  if (resultData.success && !resultData.isConfident && resultData.topPrediction) {
    if (viewUncertain) viewUncertain.classList.remove('hidden');

    const top = resultData.topPrediction;
    const pct = Math.round(Number(top.probability) * 100) || 0;

    const thumbImg = $('#result-uncertain-thumbnail');
    if (thumbImg) {
      if (capturedDataUrl) {
        thumbImg.src = capturedDataUrl;
        thumbImg.parentElement.classList.remove('hidden');
      } else {
        thumbImg.parentElement.classList.add('hidden');
      }
    }

    const confNotice = $('#result-uncertain-confidence');
    if (confNotice) {
      confNotice.textContent = `${pct}% Confidence (Below 75% required threshold)`;
    }

    if (statusBadge) {
      statusBadge.textContent = 'Uncertain Classification';
      statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full';
    }

    const announcer = $('#screen-announcer');
    if (announcer) {
      announcer.textContent = 'Classification uncertain: confidence is below 75% threshold. Please try scanning again with clear lighting.';
    }
    return;
  }

  // 3. Error Result
  if (viewError) viewError.classList.remove('hidden');
  const msgEl = $('#result-error-message');
  if (msgEl) {
    msgEl.textContent = resultData.error || "We couldn't analyze this image. Please try again.";
  }
  if (statusBadge) {
    statusBadge.textContent = 'Analysis Failed';
    statusBadge.className = 'text-xs font-semibold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full';
  }

  const announcer = $('#screen-announcer');
  if (announcer) {
    announcer.textContent = 'Classification error: ' + (resultData.error || 'Failed to analyze image.');
  }
}

/**
 * Safely populates an unordered list with array items using textContent.
 * Prevents HTML injection vulnerabilities.
 *
 * @param {HTMLUListElement} ulElement
 * @param {string[]} items
 */
function populateGuidanceList(ulElement, items) {
  if (!ulElement) return;

  // Clear existing items safely
  while (ulElement.firstChild) {
    ulElement.removeChild(ulElement.firstChild);
  }

  if (Array.isArray(items) && items.length > 0) {
    if (ulElement.parentElement) ulElement.parentElement.classList.remove('hidden');
    items.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      ulElement.appendChild(li);
    });
  } else if (ulElement.parentElement) {
    ulElement.parentElement.classList.add('hidden');
  }
}

/**
 * Visual badge styling presets for scan history categories.
 */
export const categoryStyles = {
  recyclable: {
    icon: '♻️',
    label: 'Recyclable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  organic: {
    icon: '🌱',
    label: 'Organic',
    badgeClass: 'bg-lime-100 text-lime-800 border-lime-200'
  },
  ewaste: {
    icon: '🔋',
    label: 'E-Waste',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  unknown: {
    icon: '📦',
    label: 'Uncategorized',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200'
  }
};

/**
 * Renders the persistent scan history list into the History screen.
 * Supports optional category filtering.
 * Safely creates DOM elements and utilizes textContent to prevent XSS.
 *
 * @param {Array<Object>} historyRecords
 * @param {string} [activeFilter='all']
 */
export function renderHistory(historyRecords, activeFilter = 'all') {
  const badgeEl = $('#history-count-badge');
  const btnClear = $('#btn-clear-history');
  const emptyStateEl = $('#history-empty-state');
  const listContainerEl = $('#history-list-container');
  const itemsListEl = $('#history-items-list');

  const allRecords = Array.isArray(historyRecords) ? historyRecords : [];
  const records = activeFilter && activeFilter !== 'all'
    ? allRecords.filter(r => (r.category || '').toLowerCase() === activeFilter.toLowerCase())
    : allRecords;

  // Update badge count with total saved records
  if (badgeEl) {
    badgeEl.textContent = allRecords.length === 1 ? '1 Saved Scan' : `${allRecords.length} Saved Scans`;
  }

  // Handle empty state
  if (records.length === 0) {
    if (emptyStateEl) emptyStateEl.classList.remove('hidden');
    if (listContainerEl) listContainerEl.classList.add('hidden');
    if (btnClear) {
      btnClear.disabled = allRecords.length === 0;
      btnClear.className = allRecords.length === 0
        ? 'text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl cursor-not-allowed transition-colors flex items-center gap-1 min-h-[44px]'
        : 'text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1 min-h-[44px]';
    }
    if (itemsListEl) {
      while (itemsListEl.firstChild) {
        itemsListEl.removeChild(itemsListEl.firstChild);
      }
    }
    return;
  }

  // Handle populated state
  if (emptyStateEl) emptyStateEl.classList.add('hidden');
  if (listContainerEl) listContainerEl.classList.remove('hidden');
  if (btnClear) {
    btnClear.disabled = false;
    btnClear.className = 'text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1 min-h-[44px]';
  }

  if (!itemsListEl) return;

  // Clear existing items safely
  while (itemsListEl.firstChild) {
    itemsListEl.removeChild(itemsListEl.firstChild);
  }

  // Render cards sorted newest first
  records.forEach((record) => {
    const catKey = (record.category || 'unknown').toLowerCase();
    const style = categoryStyles[catKey] || categoryStyles.unknown;

    const li = document.createElement('li');
    li.className = 'bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/90 rounded-2xl p-3.5 transition-all flex items-center justify-between gap-3 shadow-2xs';

    // Left block: category badge + predicted class
    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-center gap-2.5 min-w-0';

    const iconBadge = document.createElement('div');
    iconBadge.className = `w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${style.badgeClass}`;
    iconBadge.setAttribute('aria-hidden', 'true');
    iconBadge.textContent = style.icon;

    const textDiv = document.createElement('div');
    textDiv.className = 'min-w-0';

    const classHeading = document.createElement('h3');
    classHeading.className = 'text-sm font-bold text-slate-900 truncate';
    classHeading.textContent = record.predictedClass || style.label;

    const catLabel = document.createElement('span');
    catLabel.className = 'text-xs text-slate-500 block';
    catLabel.textContent = style.label;

    textDiv.appendChild(classHeading);
    textDiv.appendChild(catLabel);
    leftDiv.appendChild(iconBadge);
    leftDiv.appendChild(textDiv);

    // Right block: confidence score + formatted timestamp
    const rightDiv = document.createElement('div');
    rightDiv.className = 'flex flex-col items-end justify-center gap-0.5 text-right shrink-0';

    const confSpan = document.createElement('span');
    confSpan.className = 'text-xs font-extrabold text-emerald-800 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs';
    confSpan.textContent = formatConfidence(record.confidence);

    const timeEl = document.createElement('time');
    timeEl.className = 'text-[11px] text-slate-400 whitespace-nowrap';
    timeEl.setAttribute('datetime', record.timestamp || '');
    timeEl.textContent = formatDate(record.timestamp);

    rightDiv.appendChild(confSpan);
    rightDiv.appendChild(timeEl);

    li.appendChild(leftDiv);
    li.appendChild(rightDiv);

    itemsListEl.appendChild(li);
  });
}

/**
 * Renders latest 2-3 scans on the mobile Home screen.
 * @param {Array<Object>} historyRecords
 */
export function renderHomeRecentScans(historyRecords) {
  const container = $('#home-recent-scans-container');
  if (!container) return;

  const records = Array.isArray(historyRecords) ? historyRecords : [];

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (records.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'py-6 px-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center';

    const icon = document.createElement('span');
    icon.className = 'text-2xl block mb-1 text-slate-400';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '🌱';

    const p = document.createElement('p');
    p.className = 'text-xs font-medium text-slate-500';
    p.textContent = 'Your scans will appear here.';

    emptyCard.appendChild(icon);
    emptyCard.appendChild(p);
    container.appendChild(emptyCard);
    return;
  }

  const recent = records.slice(0, 3);
  recent.forEach((record) => {
    const catKey = (record.category || 'unknown').toLowerCase();
    const style = categoryStyles[catKey] || categoryStyles.unknown;

    const card = document.createElement('div');
    card.className = 'p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 transition-all';

    const left = document.createElement('div');
    left.className = 'flex items-center gap-2.5 min-w-0';

    const iconBadge = document.createElement('span');
    iconBadge.className = `w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border ${style.badgeClass}`;
    iconBadge.textContent = style.icon;

    const info = document.createElement('div');
    info.className = 'min-w-0';

    const title = document.createElement('h4');
    title.className = 'text-xs font-bold text-slate-900 truncate';
    title.textContent = record.predictedClass || style.label;

    const sub = document.createElement('span');
    sub.className = 'text-[11px] text-slate-500 block';
    sub.textContent = formatDate(record.timestamp);

    info.appendChild(title);
    info.appendChild(sub);
    left.appendChild(iconBadge);
    left.appendChild(info);

    const right = document.createElement('span');
    right.className = 'text-xs font-extrabold text-emerald-800 bg-white border border-slate-200/90 px-2 py-0.5 rounded-full shadow-2xs shrink-0';
    right.textContent = formatConfidence(record.confidence);

    card.appendChild(left);
    card.appendChild(right);
    container.appendChild(card);
  });
}

/**
 * Toggles visibility of the Clear History confirmation modal.
 * @param {boolean} isOpen
 */
export function showClearHistoryModal(isOpen) {
  const modal = $('#modal-clear-history');
  if (!modal) return;
  if (isOpen) {
    modal.classList.remove('hidden');
    const cancelBtn = $('#btn-cancel-clear-history');
    if (cancelBtn) cancelBtn.focus();
  } else {
    modal.classList.add('hidden');
    const clearBtn = $('#btn-clear-history');
    if (clearBtn && !clearBtn.disabled) clearBtn.focus();
  }
}

/**
 * Toggles visibility of the Scanning Tips modal.
 * @param {boolean} isOpen
 */
export function showTipsModal(isOpen) {
  const modal = $('#modal-scan-tips');
  if (!modal) return;
  if (isOpen) {
    modal.classList.remove('hidden');
    const dismissBtn = $('#btn-dismiss-tips');
    if (dismissBtn) dismissBtn.focus();
  } else {
    modal.classList.add('hidden');
    const tipsBtn = $('#btn-scan-tips');
    if (tipsBtn) tipsBtn.focus();
  }
}

/**
 * Renders aggregated statistics into the Statistics screen (FR-13 & Section 25).
 * Updates metric counters, percentages, and visual distribution bars.
 * Strictly uses textContent and safe DOM APIs for all dynamic values.
 *
 * @param {{
 *   total: number,
 *   counts: { recyclable: number, organic: number, ewaste: number, other: number },
 *   percentages: { recyclable: number, organic: number, ewaste: number, other: number }
 * }} stats
 */
export function renderStatistics(stats) {
  const statusBadge = $('#stats-status-badge');
  const emptyState = $('#stats-empty-state');
  const contentContainer = $('#stats-content-container');

  const totalCount = $('#stat-total-count');
  const recCount = $('#stat-recyclable-count');
  const recPct = $('#stat-recyclable-pct');
  const orgCount = $('#stat-organic-count');
  const orgPct = $('#stat-organic-pct');
  const ewCount = $('#stat-ewaste-count');
  const ewPct = $('#stat-ewaste-pct');

  const recBar = $('#stat-bar-recyclable');
  const orgBar = $('#stat-bar-organic');
  const ewBar = $('#stat-bar-ewaste');

  const recDistText = $('#stat-dist-recyclable-text');
  const orgDistText = $('#stat-dist-organic-text');
  const ewDistText = $('#stat-dist-ewaste-text');

  if (!stats || typeof stats.total !== 'number' || stats.total === 0) {
    // Empty state
    if (emptyState) emptyState.classList.remove('hidden');
    if (contentContainer) contentContainer.classList.add('hidden');
    if (statusBadge) statusBadge.textContent = '0 Scans Recorded';

    if (totalCount) totalCount.textContent = '0';
    if (recCount) recCount.textContent = '0';
    if (recPct) recPct.textContent = '0%';
    if (orgCount) orgCount.textContent = '0';
    if (orgPct) orgPct.textContent = '0%';
    if (ewCount) ewCount.textContent = '0';
    if (ewPct) ewPct.textContent = '0%';

    if (recBar) {
      recBar.style.width = '0%';
      recBar.setAttribute('aria-valuenow', '0');
    }
    if (orgBar) {
      orgBar.style.width = '0%';
      orgBar.setAttribute('aria-valuenow', '0');
    }
    if (ewBar) {
      ewBar.style.width = '0%';
      ewBar.setAttribute('aria-valuenow', '0');
    }
    return;
  }

  // Populated state
  if (emptyState) emptyState.classList.add('hidden');
  if (contentContainer) contentContainer.classList.remove('hidden');
  if (statusBadge) {
    statusBadge.textContent = stats.total === 1 ? '1 Scan Recorded' : `${stats.total} Scans Recorded`;
  }

  // Populate numeric counters safely via textContent
  const counts = stats.counts || {};
  const pcts = stats.percentages || {};

  if (totalCount) totalCount.textContent = String(stats.total);
  if (recCount) recCount.textContent = String(counts.recyclable || 0);
  if (recPct) recPct.textContent = `${pcts.recyclable || 0}%`;
  if (orgCount) orgCount.textContent = String(counts.organic || 0);
  if (orgPct) orgPct.textContent = `${pcts.organic || 0}%`;
  if (ewCount) ewCount.textContent = String(counts.ewaste || 0);
  if (ewPct) ewPct.textContent = `${pcts.ewaste || 0}%`;

  // Update visual distribution progress bars
  const recPercentage = Math.max(0, Math.min(100, pcts.recyclable || 0));
  const orgPercentage = Math.max(0, Math.min(100, pcts.organic || 0));
  const ewPercentage = Math.max(0, Math.min(100, pcts.ewaste || 0));

  if (recBar) {
    recBar.style.width = `${recPercentage}%`;
    recBar.setAttribute('aria-valuenow', String(recPercentage));
  }
  if (orgBar) {
    orgBar.style.width = `${orgPercentage}%`;
    orgBar.setAttribute('aria-valuenow', String(orgPercentage));
  }
  if (ewBar) {
    ewBar.style.width = `${ewPercentage}%`;
    ewBar.setAttribute('aria-valuenow', String(ewPercentage));
  }

  // Update distribution readable text
  if (recDistText) {
    recDistText.textContent = `${counts.recyclable || 0} items (${recPercentage}%)`;
  }
  if (orgDistText) {
    orgDistText.textContent = `${counts.organic || 0} items (${orgPercentage}%)`;
  }
  if (ewDistText) {
    ewDistText.textContent = `${counts.ewaste || 0} items (${ewPercentage}%)`;
  }
}

/**
 * Initialize UI navigation listeners for elements with data-nav-target.
 */
export function initUI() {
  // Bind all buttons with data-nav-target
  document.addEventListener('click', (event) => {
    const navEl = event.target.closest('[data-nav-target]');
    if (navEl) {
      event.preventDefault();
      const target = navEl.getAttribute('data-nav-target');
      showScreen(target);
    }
  });

  // Handle URL hash on initial load and popstate
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && SCREENS.includes(hash)) {
      showScreen(hash);
    }
  });

  // Accessibility: Keyboard handlers for dialogs and modal traps
  document.addEventListener('keydown', (event) => {
    const modalClear = $('#modal-clear-history');

    // Close clear history modal on Escape key
    if (modalClear && !modalClear.classList.contains('hidden')) {
      if (event.key === 'Escape') {
        event.preventDefault();
        showClearHistoryModal(false);
        return;
      }

      // Accessible Focus Trap: Cycle between Cancel and Confirm buttons
      if (event.key === 'Tab') {
        const cancelBtn = $('#btn-cancel-clear-history');
        const confirmBtn = $('#btn-confirm-clear-history');

        if (event.shiftKey && document.activeElement === cancelBtn) {
          event.preventDefault();
          if (confirmBtn) confirmBtn.focus();
        } else if (!event.shiftKey && document.activeElement === confirmBtn) {
          event.preventDefault();
          if (cancelBtn) cancelBtn.focus();
        }
      }
      return;
    }

    // Close scan tips modal on Escape key
    const modalTips = $('#modal-scan-tips');
    if (modalTips && !modalTips.classList.contains('hidden')) {
      if (event.key === 'Escape') {
        event.preventDefault();
        showTipsModal(false);
      }
    }
  });
}
