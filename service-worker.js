const CACHE_NAME = "eclat-de-coco-pos-v59";

/* ================= FILES TO CACHE ================= */
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

  /* 🔥 ALWAYS FRESH JS / CSS */
  if (
    request.url.includes("script.js") ||
    request.url.includes("style.css") ||
    request.url.includes("manifest.json")
  ) {

    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );

    return;
  }

  /* 🔥 NAVIGATION */
  if (request.mode === "navigate") {

    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(async () => {
          return (
            await caches.match("./index.html") ||
            await caches.match("./pos.html")
          );
        })
    );

    return;
  }

  /* 🔥 CACHE FIRST */
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
          return response;
        })
      );
    })
  );

});
