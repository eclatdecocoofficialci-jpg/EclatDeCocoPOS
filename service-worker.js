const CACHE_NAME = "eclat-pos-v1";
const urlsToCache = [
  "./dashboard.html",
  "./pos.html",
  "./sales.html",
  "./products.html",
  "./inventory.html",
  "./expenses.html",
  "./orders.html",
  "./customers.html",
  "./reports.html",
  "./style.css",
  "./script.js",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
