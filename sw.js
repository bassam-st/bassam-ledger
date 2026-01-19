const CACHE_NAME = "bassam-ledger-v2";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.json",
  "./sw.js",
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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Cache-first للملفات الثابتة
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // خزّن أي ملف تم تحميله بنجاح (للاستخدام لاحقًا Offline)
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // في حالة Offline ورابط SPA: رجّع index.html
          return caches.match("./index.html");
        });
    })
  );
});
