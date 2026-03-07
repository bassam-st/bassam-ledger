// Bassam Ledger - Offline-first Service Worker
// This service worker is written to work on:
// - Replit domains (root)
// - GitHub Pages (sub-path)
// by using ONLY relative URLs.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `bassam-ledger-${CACHE_VERSION}`;

// Pre-cache the app shell and build assets.
// IMPORTANT: keep paths RELATIVE ("./...") so it works under sub-path hosting.
const PRECACHE_URLS = [
  './',
  './index.html',
  './404.html',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './opengraph.jpg',
  './assets/index-CFuIDYIO.js',
  './assets/index-Ck93cm95.css',
  './assets/minimalist_blue_abstract_logo_for_accounting_app-BNhBlFdH.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n.startsWith('bassam-ledger-') && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Cache strategy:
// - Navigation requests: cache-first for index.html (offline SPA)
// - Static same-origin requests: cache-first
// - Other requests: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') return;

  // SPA navigation: return cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(req))
    );
    return;
  }

  // Same-origin requests
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            // Cache successful basic responses
            if (res && res.status === 200 && res.type === 'basic') {
              const resClone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            }
            return res;
          })
          .catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // Cross-origin: try network, fallback to cache if previously cached
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
