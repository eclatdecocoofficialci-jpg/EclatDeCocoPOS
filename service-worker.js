const CACHE_NAME = "eclat-de-coco-pos-v23";

/* ================= FILES TO CACHE ================= */
const urlsToCache = [
  "/",
  "/pos.html",
  "/dashboard.html",
  "/sales.html",
  "/expenses.html",
  "/customers.html",
  "/reports.html",
  "/inventory.html",
  "/products.html",
  "/style.css",
  "/manifest.json",
  "/icon-192.png",

  "/coco-bg.jpg"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );

  // force update immédiat
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {

  const request = event.request;

  // 🔥 JS / CSS toujours frais
  if (
    request.url.includes("script.js") ||
    request.url.includes("style.css")
  ) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // 🔥 NAVIGATION (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match("/pos.html");
        })
    );
    return;
  }

  // 🔥 DEFAULT CACHE
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request);
    })
  );
});
