const CACHE_NAME = "eclat-de-coco-pos-v60";

/* ================= FILES ================= */
const urlsToCache = [
  "./",
  "./index.html",
  "./pos.html",
  "./dashboard.html",
  "./sales.html",
  "./expenses.html",
  "./customers.html",
  "./reports.html",
  "./inventory.html",
  "./products.html",
  "./script.js",
  "./style.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./coco-bg.jpg"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  self.skipWaiting(); // 🔥 activation immédiate

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
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

  self.clients.claim(); // 🔥 prend contrôle direct
});

/* ================= FETCH (SMART OFFLINE) ================= */
self.addEventListener("fetch", event => {
  const request = event.request;

  // 🔥 ALWAYS NETWORK FIRST FOR JS/CSS
  if (
    request.url.includes("script.js") ||
    request.url.includes("style.css")
  ) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 🔥 NAVIGATION (PWA OFFLINE MODE)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match("./pos.html"))
    );
    return;
  }

  // 🔥 CACHE FIRST DEFAULT
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      });
    })
  );
});
