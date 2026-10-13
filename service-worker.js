/**
 * Smart Waste Classifier - Service Worker
 * Implements App Shell caching, cache versioning, and offline fallback.
 * Strictly adheres to Master Plan Section 26 and FR-16.
 */

const CACHE_VERSION = 'smart-waste-v1';
const CACHE_NAME = `${CACHE_VERSION}`;

/**
 * Core Application Shell Assets required for offline rendering.
 */
const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/camera.js',
  './js/classifier.js',
  './js/storage.js',
  './js/ui.js',
  './js/utils.js',
  './js/waste-data.js',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-192-maskable.png',
  './assets/icons/icon-512-maskable.png'
];

/**
 * Service Worker Installation
 * Pre-caches the application shell and immediately activates.
 */
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Installing version ${CACHE_NAME}...`);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching core application shell assets...');
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] App shell cached successfully. Skipping waiting.');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('[Service Worker] App shell pre-caching partial failure:', err);
      })
  );
});

/**
 * Service Worker Activation
 * Cleans up outdated caches from previous versions and claims clients.
 */
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Activating version ${CACHE_NAME}...`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(`[Service Worker] Deleting outdated cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Active and claiming all clients.');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Strategy
 * - Static shell assets: Cache-first with network fallback.
 * - Navigation requests: Network-first with cached index.html fallback when offline.
 * - Non-GET requests and browser extensions: Bypass caching.
 * - External CDNs (TensorFlow/TeachableMachine): Network-first; never fabricate fake offline AI results.
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Handle SPA navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // When offline, serve cached index.html shell
          return caches.match('./index.html').then((cachedHtml) => {
            return cachedHtml || caches.match('./');
          });
        })
    );
    return;
  }

  // Handle same-origin static assets (Cache-first with network fallback)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            // If valid response, update cache dynamically for app assets
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn(`[Service Worker] Network fetch failed for ${request.url}:`, err);
            throw err;
          });
      })
    );
    return;
  }

  // External network resources (e.g. CDNs): Default network fetch
  event.respondWith(
    fetch(request).catch((err) => {
      // Allow network failure to be handled cleanly by the app
      throw err;
    })
  );
});
