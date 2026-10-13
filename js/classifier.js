/**
 * Smart Waste Classifier - AI Classifier Module
 * Integrates Google Teachable Machine Image Model, performs visual feature inference,
 * normalizes prediction probabilities, and enforces the 75% confidence threshold.
 * Follows Phase 3 requirements (FR-05, FR-06, FR-07, FR-08, FR-09, Section 15).
 */

/**
 * Required confidence threshold as specified in the Master Plan (75%).
 * Predictions below this threshold are flagged as uncertain and rejected from history.
 */
export const CONFIDENCE_THRESHOLD = 0.75;

/**
 * Three required waste categories for the MVP.
 */
export const SUPPORTED_CATEGORIES = ['recyclable', 'organic', 'ewaste'];

/**
 * Configuration for the Teachable Machine model.
 * Defaults to the local ./model/ directory or a remote Teachable Machine URL.
 * Set to null initially if no model has been trained/placed yet.
 */
let modelConfig = {
  // If undefined, attempts local ./model/ files first or a configured remote endpoint
  modelUrl: null,
  metadataUrl: null
};

let loadedModel = null;
let classifierState = 'unconfigured'; // 'unconfigured' | 'loading' | 'ready' | 'error'
let lastLoadError = null;

/**
 * Returns current classifier state.
 * @returns {'unconfigured'|'loading'|'ready'|'error'}
 */
export function getClassifierState() {
  return classifierState;
}

/**
 * Returns whether the AI model is ready to execute inference.
 * @returns {boolean}
 */
export function isModelReady() {
  return classifierState === 'ready' && loadedModel !== null;
}

/**
 * Returns the last error encountered during model loading or prediction.
 * @returns {string|null}
 */
export function getLastError() {
  return lastLoadError;
}

/**
 * Configures the model URL and metadata URL for Teachable Machine.
 * Supports both remote Teachable Machine endpoints and local file paths.
 *
 * @param {string} url Base URL or path (e.g. 'https://teachablemachine.withgoogle.com/models/xxxx/' or './model/')
 */
export function setModelConfig(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    modelConfig.modelUrl = null;
    modelConfig.metadataUrl = null;
    classifierState = 'unconfigured';
    return;
  }

  const cleanUrl = url.trim().replace(/\/?$/, '/'); // Ensure trailing slash
  modelConfig.modelUrl = `${cleanUrl}model.json`;
  modelConfig.metadataUrl = `${cleanUrl}metadata.json`;
  console.log(`[Classifier] Model configured: ${modelConfig.modelUrl}`);
}

/**
 * Loads the Teachable Machine image classification model asynchronously.
 * Uses window.tmImage (provided by @teachablemachine/image script).
 *
 * @param {string} [customUrl] Optional model URL override.
 * @returns {Promise<{success: boolean, error?: string, errorType?: string}>}
 */
export async function loadModel(customUrl) {
  if (customUrl) {
    setModelConfig(customUrl);
  }

  if (!modelConfig.modelUrl) {
    classifierState = 'unconfigured';
    lastLoadError = 'No Teachable Machine model URL or path has been configured.';
    return {
      success: false,
      error: lastLoadError,
      errorType: 'NOT_CONFIGURED'
    };
  }

  // Verify that Teachable Machine runtime is available
  const tmImage = window.tmImage || globalThis.tmImage;
  if (!tmImage || typeof tmImage.load !== 'function') {
    classifierState = 'error';
    lastLoadError = 'Teachable Machine image library (tmImage) is not loaded in the browser environment.';
    console.error(`[Classifier] ${lastLoadError}`);
    return {
      success: false,
      error: 'AI runtime library could not be found. Please check internet connection or script references.',
      errorType: 'RUNTIME_MISSING'
    };
  }

  classifierState = 'loading';
  lastLoadError = null;
  console.log(`[Classifier] Loading model from: ${modelConfig.modelUrl}...`);

  try {
    const model = await tmImage.load(modelConfig.modelUrl, modelConfig.metadataUrl);
    loadedModel = model;
    classifierState = 'ready';
    console.log('[Classifier] Teachable Machine model loaded successfully and ready for inference.');

    // Log detected classes from metadata if available
    const classLabels = model.getTotalClasses ? model.getClassLabels() : [];
    console.log('[Classifier] Registered model classes:', classLabels);

    return { success: true };
  } catch (err) {
    classifierState = 'error';
    lastLoadError = `Failed to load model from ${modelConfig.modelUrl}: ${err.message || err}`;
    console.error('[Classifier] Model loading failure:', err);

    return {
      success: false,
      error: 'AI model could not be loaded. Please check model files or network connection.',
      errorType: 'LOAD_FAILED'
    };
  }
}

/**
 * Maps arbitrary class label strings to the 3 standard categories:
 * 'recyclable', 'organic', 'ewaste'.
 *
 * @param {string} className
 * @returns {'recyclable'|'organic'|'ewaste'|'unknown'}
 */
export function normalizeCategory(className) {
  if (!className || typeof className !== 'string') return 'unknown';

  const normalized = className.trim().toLowerCase();

  if (
    normalized.includes('recycl') ||
    normalized.includes('plastic') ||
    normalized.includes('paper') ||
    normalized.includes('cardboard') ||
    normalized.includes('can') ||
    normalized.includes('glass')
  ) {
    return 'recyclable';
  }

  if (
    normalized.includes('organ') ||
    normalized.includes('food') ||
    normalized.includes('fruit') ||
    normalized.includes('vegetable') ||
    normalized.includes('leaf') ||
    normalized.includes('leaves') ||
    normalized.includes('compost')
  ) {
    return 'organic';
  }

  if (
    normalized.includes('e-waste') ||
    normalized.includes('ewaste') ||
    normalized.includes('electronic') ||
    normalized.includes('battery') ||
    normalized.includes('cable') ||
    normalized.includes('phone')
  ) {
    return 'ewaste';
  }

  return 'unknown';
}

/**
 * Identifies the class prediction with the highest probability.
 *
 * @param {Array<{className: string, probability: number}>} predictions
 * @returns {{className: string, probability: number, category: string}|null}
 */
export function getTopPrediction(predictions) {
  if (!Array.isArray(predictions) || predictions.length === 0) {
    return null;
  }

  let top = predictions[0];
  for (let i = 1; i < predictions.length; i++) {
    if (predictions[i].probability > top.probability) {
      top = predictions[i];
    }
  }

  return {
    className: top.className,
    probability: Number(top.probability) || 0,
    category: normalizeCategory(top.className)
  };
}

/**
 * Evaluates whether a probability score satisfies the 75% confidence threshold.
 *
 * @param {number} probability Value between 0.0 and 1.0
 * @returns {boolean}
 */
export function isConfident(probability) {
  return typeof probability === 'number' && probability >= CONFIDENCE_THRESHOLD;
}

/**
 * Runs visual classification on a captured frame (canvas or image element).
 * Returns normalized probabilities, top prediction, and confidence validation.
 *
 * @param {HTMLCanvasElement|HTMLImageElement} imageElement
 * @returns {Promise<{
 *   success: boolean,
 *   isConfident?: boolean,
 *   topPrediction?: {className: string, probability: number, category: string},
 *   predictions?: Array<{className: string, probability: number, category: string}>,
 *   threshold?: number,
 *   uncertainMessage?: string,
 *   error?: string,
 *   errorType?: string
 * }>}
 */
export async function predict(imageElement) {
  if (!imageElement) {
    return {
      success: false,
      error: 'An image or canvas element is required for visual classification.',
      errorType: 'INVALID_INPUT'
    };
  }

  if (!isModelReady()) {
    if (classifierState === 'unconfigured') {
      return {
        success: false,
        error: 'Teachable Machine model is not yet configured. Please provide a trained model URL or place model files in /model.',
        errorType: 'MODEL_NOT_CONFIGURED'
      };
    }
    if (classifierState === 'loading') {
      return {
        success: false,
        error: 'AI model is still loading. Please wait a moment and try again.',
        errorType: 'MODEL_LOADING'
      };
    }
    return {
      success: false,
      error: 'AI model is not ready. Please verify model loading status.',
      errorType: 'MODEL_NOT_READY'
    };
  }

  try {
    console.log('[Classifier] Running visual feature analysis on captured frame...');

    // Execute prediction through Teachable Machine
    const rawPredictions = await loadedModel.predict(imageElement);

    if (!Array.isArray(rawPredictions) || rawPredictions.length === 0) {
      return {
        success: false,
        error: 'Inference produced no predictions. Please try scanning again.',
        errorType: 'EMPTY_PREDICTIONS'
      };
    }

    // Normalize predictions
    const predictions = rawPredictions.map((p) => ({
      className: p.className,
      probability: Math.max(0, Math.min(1, Number(p.probability) || 0)),
      category: normalizeCategory(p.className)
    }));

    // Find top prediction
    const topPrediction = getTopPrediction(predictions);

    if (!topPrediction) {
      return {
        success: false,
        error: 'Could not determine top prediction from model output.',
        errorType: 'INVALID_PREDICTIONS'
      };
    }

    // Check confidence threshold (75%)
    const meetsThreshold = isConfident(topPrediction.probability);

    console.log(
      `[Classifier] Top Prediction: "${topPrediction.className}" (${Math.round(topPrediction.probability * 100)}%), Category: "${topPrediction.category}", Confident: ${meetsThreshold}`
    );

    return {
      success: true,
      isConfident: meetsThreshold,
      topPrediction,
      predictions,
      threshold: CONFIDENCE_THRESHOLD,
      uncertainMessage: meetsThreshold
        ? null
        : 'Unable to identify waste accurately. Try again with better lighting, a clear background, and one object centered in the camera.'
    };
  } catch (err) {
    console.error('[Classifier] Inference error:', err);
    return {
      success: false,
      error: "We couldn't analyze this image. Please try again.",
      errorType: 'INFERENCE_FAILED'
    };
  }
}

/**
 * Injects a mock model instance for testing purposes.
 * Strictly used in automated verification tests to validate pipeline behavior.
 *
 * @param {Object} mockModel Object providing predict(input) function.
 */
export function _setMockModelForTesting(mockModel) {
  loadedModel = mockModel;
  classifierState = mockModel ? 'ready' : 'unconfigured';
}
