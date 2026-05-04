const CACHE_NAME = "eclat-de-coco-pos-v5"; // 🔥 version mise à jour

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
  "/script.js",

  "/manifest.json",

  "/icon-192.png"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );

  // 🔥 force activation immédiate
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // 🔥 supprime anciens caches
          }
        })
      );
    })
  );

  // 🔥 prend contrôle immédiat des pages ouvertes
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {

  const request = event.request;

  // 🔥 NAVIGATION (pages HTML)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/pos.html");
      })
    );
    return;
  }

  // 🔥 STATIC FILES (CSS / JS / IMAGES)
  event.respondWith(
    caches.match(request).then(cached => {

      if (cached) return cached;

      return fetch(request)
        .then(response => {

          // ne cache que les réponses valides
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // fallback silencieux
          return cached;
        });

    })
  );
});
