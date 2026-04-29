const CACHE_NAME = "eclat-de-coco-pos-v2";

/* 📦 FILES TO CACHE */
const urlsToCache = [
  "/",
  "/index.html",
  "/pos.html",
  "/sales.html",
  "/expenses.html",
  "/customers.html",
  "/reports.html",
  "/inventory.html",
  "/products.html",
  "/style.css",
  "/script.js",
  "/manifest.json"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );

  // force new SW activation immediately
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

/* ================= FETCH (SMART OFFLINE MODE) ================= */
self.addEventListener("fetch", event => {

  // HTML pages → network first, fallback offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/pos.html");
      })
    );
    return;
  }

  // STATIC FILES → cache first (fast POS)
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(networkResponse => {

        // update cache dynamically
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

      }).catch(() => {
        return cached;
      });
    })
  );
});
