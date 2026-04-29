const CACHE_NAME = "eclat-de-coco-pos-v1";

/* 📦 FICHIERS À METTRE EN CACHE (OFFLINE) */
const urlsToCache = [
  "/",
  "/index.html",
  "/pos.html",
  "/sales.html",
  "/expenses.html",
  "/customers.html",
  "/reports.html",
  "/style.css",
  "/script.js"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* ================= FETCH (OFFLINE FIRST) ================= */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // fallback offline si internet coupé
        if (event.request.destination === "document") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
