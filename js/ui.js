/**
 * Smart Waste Classifier - UI Module
 * Handles screen transitions, accessible navigation, view states, and camera UI.
 */

import { $, $$ } from './utils.js';

/**
 * Valid application screen identifiers.
 */
export const SCREENS = ['home', 'scan', 'result', 'history', 'statistics', 'about'];

let currentScreenId = 'home';
const screenChangeListeners = [];

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
    if (isCurrent) {
      btn.classList.add('text-green-700', 'font-bold', 'border-green-600');
      btn.classList.remove('text-slate-600', 'font-medium', 'border-transparent');
    } else {
      btn.classList.remove('text-green-700', 'font-bold', 'border-green-600');
      btn.classList.add('text-slate-600', 'font-medium', 'border-transparent');
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
}
