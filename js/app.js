/**
 * Smart Waste Classifier - Main Application Orchestrator
 * Phase 1 Foundation
 */

import { initUI, showScreen, SCREENS } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Smart Waste Classifier] Initializing Phase 1 Foundation...');

  // Initialize UI navigation
  initUI();

  // Determine initial screen from hash or default to home
  const initialHash = window.location.hash.replace('#', '').trim();
  if (initialHash && SCREENS.includes(initialHash)) {
    showScreen(initialHash);
  } else {
    showScreen('home');
  }

  console.log('[Smart Waste Classifier] Foundation initialized successfully.');
});
