/**
 * Smart Waste Classifier - Main Application Orchestrator
 * Integrates UI navigation and Phase 2 Camera Module.
 */

import { $, $$ } from './utils.js';
import { initUI, showScreen, SCREENS, onScreenChange, updateCameraUI } from './ui.js';
import {
  startCamera,
  stopCamera,
  captureFrame,
  toggleCameraFacing,
  isCameraSupported,
  isCameraActive
} from './camera.js';

let lastCapturedCanvas = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Smart Waste Classifier] Initializing application...');

  // Initialize UI navigation
  initUI();

  // Set up camera controls and lifecycle
  setupCameraIntegration();

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

    // When entering the scan screen, initiate camera if supported
    if (newScreen === 'scan') {
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
 * Captures current frame from video onto canvas.
 */
function handleCaptureFrame() {
  const videoEl = $('#camera-preview');
  const canvasEl = $('#camera-canvas');

  if (!videoEl || !canvasEl) return;

  const captureResult = captureFrame(videoEl, canvasEl, 640);

  if (captureResult.success) {
    lastCapturedCanvas = captureResult.canvas;
    const dataUrl = canvasEl.toDataURL('image/jpeg', 0.85);

    updateCameraUI('captured', { dataUrl });
    console.log('[App] Frame captured successfully. Ready for Phase 3 AI classification.');
  } else {
    alert(captureResult.error || 'Unable to capture frame.');
  }
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
 * Exports captured canvas reference for Phase 3 AI model consumption.
 * @returns {HTMLCanvasElement|null}
 */
export function getLastCapturedCanvas() {
  return lastCapturedCanvas;
}
