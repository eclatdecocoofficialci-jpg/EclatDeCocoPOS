const CACHE_NAME = "eclatpos-cache-999";

/* ================= FILES ================= */
const urlsToCache = [
  "index.html",
  "pos.html",
  "dashboard.html",
  "sales.html",
  "products.html",
  "inventory.html",
  "customers.html",
  "reports.html",
  "style.css",
  "script.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
];

/* ================= INSTALL ================= */
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

/* ================= FETCH (FIXED STRATEGY) ================= */
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(fetch(event.request));
});
