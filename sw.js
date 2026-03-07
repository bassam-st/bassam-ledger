const CACHE_VERSION = "v3";
const CACHE_NAME = `bassam-ledger-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.json",
  "./favicon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./opengraph.jpg",
  "./assets/index-CFuIDYIO.js",
  "./assets/index-Ck93cm95.css",
  "./assets/minimalist_blue_abstract_logo_for_accounting_app-BNhBlFdH.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n.startsWith("bassam-ledger-") && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const resClone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            }
            return res;
          })
          .catch(() => caches.match("./index.html"));
      })
    );
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
