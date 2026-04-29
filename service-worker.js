const CACHE_NAME = "eclatpos-cache-v4";

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
  console.log("[SW] Install");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate");

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

/* ================= FETCH ================= */
self.addEventListener("fetch", (event) => {

  // ❗ IMPORTANT: ne pas bloquer POST / API
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {

      // 1. cache
      if (cached) return cached;

      // 2. réseau
      return fetch(event.request)
        .then((response) => {

          // ne pas casser les réponses invalides
          if (!response || response.status !== 200) {
            return response;
          }

          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });

        })
        .catch(() => {

          // fallback OFFLINE pour navigation
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }

        });

    })
  );
});
