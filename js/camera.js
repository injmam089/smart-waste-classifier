/**
 * Smart Waste Classifier - Camera Module
 * Handles WebRTC camera access, permissions, lifecycle, and frame capture.
 * Follows Phase 2 specifications (FR-02, FR-03, FR-04, Section 14).
 */

let activeStream = null;
let activeVideoElement = null;
let cameraState = 'idle'; // 'idle' | 'starting' | 'active' | 'error' | 'stopped'
let lastFacingMode = 'environment';

/**
 * Checks whether the browser supports camera capture via navigator.mediaDevices.getUserMedia.
 * @returns {boolean}
 */
export function isCameraSupported() {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/**
 * Returns the current lifecycle state of the camera.
 * @returns {string}
 */
export function getCameraState() {
  return cameraState;
}

/**
 * Returns whether the camera stream is currently active with live tracks.
 * @returns {boolean}
 */
export function isCameraActive() {
  if (!activeStream) return false;
  const tracks = activeStream.getVideoTracks();
  return tracks.length > 0 && tracks.some((t) => t.readyState === 'live');
}

/**
 * Stops all tracks on the active camera stream and cleans up resources.
 */
export function stopCamera() {
  if (activeStream) {
    try {
      activeStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`[Camera] Track stopped: ${track.kind} (${track.label || 'unnamed'})`);
      });
    } catch (err) {
      console.warn('[Camera] Error while stopping tracks:', err);
    }
    activeStream = null;
  }

  if (activeVideoElement) {
    try {
      activeVideoElement.pause();
      activeVideoElement.srcObject = null;
    } catch (err) {
      console.warn('[Camera] Error while detaching video srcObject:', err);
    }
    activeVideoElement = null;
  }

  cameraState = 'stopped';
  console.log('[Camera] Camera stopped and resources released.');
}

/**
 * Starts the camera stream and binds it to the specified video element.
 * Prioritizes the environment/rear camera and gracefully falls back to any available camera.
 *
 * @param {HTMLVideoElement} videoElement
 * @param {Object} [options={}]
 * @param {string} [options.facingMode='environment'] 'environment' | 'user'
 * @returns {Promise<{success: boolean, stream?: MediaStream, error?: string, errorType?: string}>}
 */
export async function startCamera(videoElement, options = {}) {
  if (!videoElement) {
    return {
      success: false,
      error: 'A valid HTMLVideoElement is required to display the camera stream.',
      errorType: 'INVALID_ELEMENT'
    };
  }

  if (!isCameraSupported()) {
    cameraState = 'error';
    return {
      success: false,
      error: 'Your browser does not support the camera features required by this app. Please use a modern browser.',
      errorType: 'UNSUPPORTED'
    };
  }

  // Ensure any previous stream is completely stopped before requesting a new one
  stopCamera();

  cameraState = 'starting';
  activeVideoElement = videoElement;
  const requestedFacingMode = options.facingMode || lastFacingMode || 'environment';
  lastFacingMode = requestedFacingMode;

  // Primary constraints prioritizing environment/rear camera
  const primaryConstraints = {
    video: {
      facingMode: { ideal: requestedFacingMode },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  let stream = null;

  try {
    console.log(`[Camera] Requesting camera with facingMode: "${requestedFacingMode}"...`);
    stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
  } catch (err) {
    console.warn('[Camera] Primary constraints failed, attempting fallback constraints...', err.name, err.message);

    // Fallback: request any video track without strict constraints
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (fallbackErr) {
      cameraState = 'error';
      return handleCameraError(fallbackErr);
    }
  }

  // Successfully acquired stream
  activeStream = stream;
  videoElement.srcObject = stream;

  // Wait for video metadata to load and start playback
  try {
    await new Promise((resolve, reject) => {
      const onLoaded = () => {
        videoElement.removeEventListener('loadedmetadata', onLoaded);
        videoElement.removeEventListener('error', onError);
        resolve();
      };
      const onError = (e) => {
        videoElement.removeEventListener('loadedmetadata', onLoaded);
        videoElement.removeEventListener('error', onError);
        reject(e);
      };

      if (videoElement.readyState >= 1) {
        resolve();
      } else {
        videoElement.addEventListener('loadedmetadata', onLoaded);
        videoElement.addEventListener('error', onError);
      }
    });

    await videoElement.play();
    cameraState = 'active';
    console.log('[Camera] Video stream playing successfully.');
    return { success: true, stream };
  } catch (playErr) {
    console.error('[Camera] Error playing video stream:', playErr);
    stopCamera();
    cameraState = 'error';
    return {
      success: false,
      error: 'Failed to play the camera preview stream.',
      errorType: 'PLAY_FAILED'
    };
  }
}

/**
 * Toggles between rear (environment) and front (user) cameras if supported.
 * @param {HTMLVideoElement} videoElement
 * @returns {Promise<{success: boolean, facingMode: string}>}
 */
export async function toggleCameraFacing(videoElement) {
  const newFacingMode = lastFacingMode === 'environment' ? 'user' : 'environment';
  const result = await startCamera(videoElement, { facingMode: newFacingMode });
  return {
    ...result,
    facingMode: newFacingMode
  };
}

/**
 * Captures the current frame from the video element onto an HTML5 canvas.
 * Scales the frame to a moderate resolution to optimize classification and prevent memory bloat.
 *
 * @param {HTMLVideoElement} videoElement
 * @param {HTMLCanvasElement} canvasElement
 * @param {number} [maxDimension=640]
 * @returns {{success: boolean, canvas?: HTMLCanvasElement, width?: number, height?: number, error?: string}}
 */
export function captureFrame(videoElement, canvasElement, maxDimension = 640) {
  if (!videoElement || !canvasElement) {
    return { success: false, error: 'Both videoElement and canvasElement are required.' };
  }

  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  if (!videoWidth || !videoHeight) {
    return {
      success: false,
      error: 'Video stream is not currently delivering frames. Please ensure camera is active.'
    };
  }

  // Calculate scaled dimensions maintaining aspect ratio
  let targetWidth = videoWidth;
  let targetHeight = videoHeight;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth >= targetHeight) {
      targetHeight = Math.round((targetHeight / targetWidth) * maxDimension);
      targetWidth = maxDimension;
    } else {
      targetWidth = Math.round((targetWidth / targetHeight) * maxDimension);
      targetHeight = maxDimension;
    }
  }

  canvasElement.width = targetWidth;
  canvasElement.height = targetHeight;

  const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { success: false, error: 'Failed to acquire 2D rendering context from canvas.' };
  }

  // Draw current video frame to canvas
  ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
  console.log(`[Camera] Frame captured at ${targetWidth}x${targetHeight}px.`);

  return {
    success: true,
    canvas: canvasElement,
    width: targetWidth,
    height: targetHeight
  };
}

/**
 * Classifies getUserMedia errors into user-friendly messages and error types.
 * @param {Error} error
 * @returns {{success: false, error: string, errorType: string}}
 */
function handleCameraError(error) {
  const errName = error.name || '';
  console.error('[Camera] getUserMedia failed with:', errName, error.message);

  if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
    return {
      success: false,
      error: 'Camera access is required to scan waste. Please allow camera permission in your browser settings and try again.',
      errorType: 'PERMISSION_DENIED'
    };
  }

  if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
    return {
      success: false,
      error: 'No camera hardware was detected on this device. Please connect a camera and try again.',
      errorType: 'DEVICE_NOT_FOUND'
    };
  }

  if (errName === 'NotReadableError' || errName === 'TrackStartError') {
    return {
      success: false,
      error: 'Camera is currently in use by another application or blocked by the operating system.',
      errorType: 'DEVICE_BUSY'
    };
  }

  if (errName === 'OverconstrainedError') {
    return {
      success: false,
      error: 'The requested camera settings are not supported by your hardware.',
      errorType: 'OVERCONSTRAINED'
    };
  }

  return {
    success: false,
    error: 'Unable to access camera. Please check browser permissions and device settings.',
    errorType: 'UNKNOWN_ERROR'
  };
}
