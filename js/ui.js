/**
 * Smart Waste Classifier - UI Module (Phase 1 Foundation)
 * Handles screen transitions, accessible navigation, and view states.
 */

import { $, $$ } from './utils.js';

/**
 * Valid application screen identifiers.
 */
export const SCREENS = ['home', 'scan', 'result', 'history', 'statistics', 'about'];

let currentScreenId = 'home';

/**
 * Switch the active visible screen.
 * @param {string} screenId Screen ID without '#' (e.g., 'home', 'scan')
 */
export function showScreen(screenId) {
  if (!SCREENS.includes(screenId)) {
    console.warn(`[UI] Unknown screen requested: "${screenId}". Falling back to "home".`);
    screenId = 'home';
  }

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
}

/**
 * Returns currently active screen ID.
 * @returns {string}
 */
export function getCurrentScreen() {
  return currentScreenId;
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
