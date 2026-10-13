/**
 * Smart Waste Classifier - Main Application Orchestrator
 * Integrates UI navigation, Phase 2 Camera Module, and Phase 3 AI Classifier Module.
 */

import { $, $$, generateId } from './utils.js';
import {
  initUI,
  showScreen,
  SCREENS,
  onScreenChange,
  updateCameraUI,
  updateClassifierUI,
  renderClassificationResult,
  renderHistory,
  showClearHistoryModal,
  renderStatistics
} from './ui.js';
import {
  startCamera,
  stopCamera,
  captureFrame,
  toggleCameraFacing,
  isCameraSupported,
  isCameraActive
} from './camera.js';
import {
  loadModel,
  predict,
  getClassifierState,
  isModelReady,
  setModelConfig,
  CONFIDENCE_THRESHOLD,
  DEFAULT_MODEL_URL
} from './classifier.js';
import {
  getScanHistory,
  saveScan,
  clearScanHistory,
  getStatistics
} from './storage.js';

let lastCapturedCanvas = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Smart Waste Classifier] Initializing application...');

  // Initialize UI navigation
  initUI();

  // Set up camera controls and lifecycle
  setupCameraIntegration();

  // Set up model loading and custom URL inputs
  setupClassifierIntegration();

  // Set up local scan history controls (Phase 6)
  setupHistoryIntegration();

  // Register PWA service worker (Phase 8)
  registerServiceWorker();

  // Automatically load the production Teachable Machine model on launch
  attemptDefaultModelLoad();

  // Determine initial screen from hash or default to home
  const initialHash = window.location.hash.replace('#', '').trim();
  if (initialHash && SCREENS.includes(initialHash)) {
    showScreen(initialHash);
  } else {
    showScreen('home');
  }

  console.log('[Smart Waste Classifier] Application initialized successfully.');
});

/**
 * Automatically loads the production Teachable Machine model on launch.
 */
async function attemptDefaultModelLoad() {
  console.log('[App] Initializing production Teachable Machine model...');
  const res = await loadModel(DEFAULT_MODEL_URL);
  if (!res.success) {
    console.warn('[App] Production model load error:', res.error);
  } else {
    console.log('[App] Production model loaded successfully and ready.');
  }
}

/**
 * Configures camera event listeners, controls, and screen lifecycle integration.
 */
function setupCameraIntegration() {
  const videoEl = $('#camera-preview');
  const canvasEl = $('#camera-canvas');
  const btnStart = $('#btn-start-camera');
  const btnRetry = $('#btn-retry-camera');
  const btnCapture = $('#btn-capture');
  const btnRetake = $('#btn-retake-camera');
  const btnFlip = $('#btn-flip-camera');

  // Handle start camera button click
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      initiateCameraStream();
    });
  }

  // Handle retry camera button click
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      initiateCameraStream();
    });
  }

  // Handle capture button click
  if (btnCapture) {
    btnCapture.addEventListener('click', () => {
      handleCaptureFrame();
    });
  }

  // Handle retake button click
  if (btnRetake) {
    btnRetake.addEventListener('click', () => {
      handleRetakeFrame();
    });
  }

  // Handle camera flip toggle
  if (btnFlip) {
    btnFlip.addEventListener('click', () => {
      handleFlipCamera();
    });
  }

  // Manage camera lifecycle on screen transitions
  onScreenChange((newScreen, previousScreen) => {
    // When leaving the scan screen, stop all camera tracks immediately to release hardware
    if (previousScreen === 'scan' && newScreen !== 'scan') {
      console.log('[App] Leaving scan screen, stopping camera tracks...');
      stopCamera();
      updateCameraUI('prompt');
      lastCapturedCanvas = null;
    }

    // When entering the scan screen, initiate camera if supported and ensure model is ready
    if (newScreen === 'scan') {
      if (!isModelReady() && getClassifierState() !== 'loading') {
        console.log('[App] Entering scan screen; ensuring production model is loaded...');
        loadModel(DEFAULT_MODEL_URL);
      }
      if (!isCameraSupported()) {
        updateCameraUI('error', {
          title: 'Camera Unsupported',
          message: 'Your browser does not support camera access via getUserMedia. Please use a modern browser.'
        });
      } else {
        initiateCameraStream();
      }
    }
  });
}

/**
 * Sets up custom Teachable Machine model loading controls.
 */
function setupClassifierIntegration() {
  const btnLoadCustomModel = $('#btn-load-custom-model');
  const inputModelUrl = $('#input-model-url');

  if (btnLoadCustomModel && inputModelUrl) {
    btnLoadCustomModel.addEventListener('click', async () => {
      const url = inputModelUrl.value.trim();
      if (!url) {
        alert('Please enter a valid Teachable Machine model URL.');
        return;
      }

      updateClassifierUI('loading');
      console.log(`[App] Loading custom Teachable Machine model from ${url}...`);

      const loadRes = await loadModel(url);
      if (loadRes.success) {
        console.log('[App] Custom model loaded successfully.');
        // If a frame was already captured, run prediction immediately
        if (lastCapturedCanvas) {
          await runClassification(lastCapturedCanvas);
        }
      } else {
        updateClassifierUI('error', { message: loadRes.error });
      }
    });
  }
}

/**
 * Configures scan history UI interactions, confirmation modal, and screen rendering.
 */
function setupHistoryIntegration() {
  const btnClear = $('#btn-clear-history');
  const btnCancel = $('#btn-cancel-clear-history');
  const btnConfirm = $('#btn-confirm-clear-history');
  const modal = $('#modal-clear-history');

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      showClearHistoryModal(true);
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      showClearHistoryModal(false);
    });
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      // Close modal if user clicks on backdrop outside the modal card
      if (event.target === modal) {
        showClearHistoryModal(false);
      }
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      console.log('[App] Clearing all scan history from LocalStorage...');
      clearScanHistory();
      showClearHistoryModal(false);
      renderHistory(getScanHistory());
      renderStatistics(getStatistics());

      const announcer = $('#screen-announcer');
      if (announcer) {
        announcer.textContent = 'All scan history and statistics have been cleared.';
      }
    });
  }

  // Refresh history or statistics whenever switching to their screens
  onScreenChange((newScreen) => {
    if (newScreen === 'history') {
      console.log('[App] Refreshing history screen view...');
      renderHistory(getScanHistory());
    } else if (newScreen === 'statistics') {
      console.log('[App] Refreshing statistics dashboard...');
      renderStatistics(getStatistics());
    }
  });
}

/**
 * Starts the camera stream and updates UI states accordingly.
 */
async function initiateCameraStream() {
  const videoEl = $('#camera-preview');
  if (!videoEl) return;

  updateCameraUI('loading');

  const result = await startCamera(videoEl, { facingMode: 'environment' });

  if (result.success) {
    updateCameraUI('active');
  } else {
    updateCameraUI('error', {
      title: getCameraErrorTitle(result.errorType),
      message: result.error || 'Failed to access camera.'
    });
  }
}

/**
 * Captures current frame from video onto canvas and triggers AI classification.
 */
async function handleCaptureFrame() {
  const videoEl = $('#camera-preview');
  const canvasEl = $('#camera-canvas');

  if (!videoEl || !canvasEl) return;

  const captureResult = captureFrame(videoEl, canvasEl, 640);

  if (captureResult.success) {
    lastCapturedCanvas = captureResult.canvas;
    const dataUrl = canvasEl.toDataURL('image/jpeg', 0.85);

    updateCameraUI('captured', { dataUrl });
    console.log('[App] Frame captured successfully. Handing off to AI classifier...');

    // Run AI classification pipeline on the captured frame
    await runClassification(lastCapturedCanvas);
  } else {
    alert(captureResult.error || 'Unable to capture frame.');
  }
}

/**
 * Runs the AI classification pipeline on a canvas input.
 * Persists confident classifications to LocalStorage (FR-09, FR-12).
 * @param {HTMLCanvasElement} canvas
 */
async function runClassification(canvas) {
  if (!isModelReady()) {
    console.log('[App] AI model is not ready yet. Awaiting production model load...');
    updateClassifierUI('loading');
    const loadRes = await loadModel(DEFAULT_MODEL_URL);
    if (!loadRes.success) {
      updateClassifierUI('error', { message: loadRes.error || 'Failed to load AI model.' });
      return;
    }
  }

  updateClassifierUI('loading');
  const result = await predict(canvas);
  const dataUrl = canvas.toDataURL ? canvas.toDataURL('image/jpeg', 0.85) : '';

  // Render on dedicated Result Screen
  renderClassificationResult(result, dataUrl);

  // If classification was confident (>= 75%), save scan metadata to LocalStorage (FR-09 & FR-12)
  if (result.success && result.isConfident && result.topPrediction) {
    const scanRecord = {
      scanId: generateId('scan'),
      timestamp: new Date().toISOString(),
      category: result.topPrediction.category,
      predictedClass: result.topPrediction.className,
      confidence: result.topPrediction.probability,
      guidanceKey: result.topPrediction.category
    };

    const saveResult = saveScan(scanRecord);
    if (!saveResult.success) {
      console.warn('[App] Could not persist scan history:', saveResult.error);
    }
  }

  // Transition to Result Screen
  showScreen('result');
}

/**
 * Resets back to live camera preview after capture.
 */
function handleRetakeFrame() {
  lastCapturedCanvas = null;
  const videoEl = $('#camera-preview');

  if (isCameraActive()) {
    updateCameraUI('active');
  } else if (videoEl) {
    initiateCameraStream();
  }
}

/**
 * Toggles camera between rear and front lens.
 */
async function handleFlipCamera() {
  const videoEl = $('#camera-preview');
  if (!videoEl) return;

  updateCameraUI('loading');
  const result = await toggleCameraFacing(videoEl);

  if (result.success) {
    updateCameraUI('active');
  } else {
    updateCameraUI('error', {
      title: getCameraErrorTitle(result.errorType),
      message: result.error || 'Failed to switch camera.'
    });
  }
}

/**
 * Maps error types to user-friendly titles.
 * @param {string} errorType
 * @returns {string}
 */
function getCameraErrorTitle(errorType) {
  switch (errorType) {
    case 'PERMISSION_DENIED':
      return 'Permission Denied';
    case 'DEVICE_NOT_FOUND':
      return 'No Camera Found';
    case 'DEVICE_BUSY':
      return 'Camera In Use';
    case 'OVERCONSTRAINED':
      return 'Resolution Not Supported';
    case 'UNSUPPORTED':
      return 'Browser Unsupported';
    default:
      return 'Camera Unavailable';
  }
}

/**
 * Exports captured canvas reference for Phase 4 consumption.
 * @returns {HTMLCanvasElement|null}
 */
export function getLastCapturedCanvas() {
  return lastCapturedCanvas;
}

/**
 * Registers the Service Worker for PWA offline shell caching (Phase 8).
 * Fails gracefully and never breaks the application.
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed (app will continue normally):', error);
        });
    });
  } else {
    console.log('[PWA] Service Workers are not supported in this browser environment.');
  }
}
