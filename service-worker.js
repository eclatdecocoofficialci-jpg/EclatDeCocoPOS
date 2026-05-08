const CACHE_NAME = "eclat-de-coco-pos-v91";

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
  "./script.js?v=61",
  "./style.css?v=61",
  "./manifest.json?v=61",
  "./icon-192.png",
  "./icon-512.png",
  "./coco-bg.jpg"
];

/* INSTALL */
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {

  const req = event.request;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return res;
      });
    })
  );
});
