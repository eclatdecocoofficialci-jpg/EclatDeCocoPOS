const CACHE_NAME = "eclat-de-coco-pos-v4";

/* FILES TO CACHE */
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
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {

  const request = event.request;

  // NAVIGATION (pages HTML)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/pos.html"))
    );
    return;
  }

  // STATIC FILES (CSS / JS / images)
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request)
          .then(response => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(request, response.clone());
              return response;
            });
          })
          .catch(() => cached)
      );
    })
  );
});
