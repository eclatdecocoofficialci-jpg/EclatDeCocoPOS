/* ================= CACHE VERSION ================= */
const CACHE_NAME = "eclat-de-coco-pos-v61";

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

  "./script.js?v=61",
  "./style.css?v=61",

  "./manifest.json?v=61",

  "./icon-192.png",
  "./icon-512.png",

  "./coco-bg.jpg"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => cache.addAll(urlsToCache))

  );
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys.map(key => {

          if(key !== CACHE_NAME){

            return caches.delete(key);
          }

        })

      )

    )

  );

  self.clients.claim();
});

/* ================= FORCE UPDATE ================= */
self.addEventListener("message", event => {

  if(event.data && event.data.type === "SKIP_WAITING"){

    self.skipWaiting();
  }
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {

  const request = event.request;

  /* ================= JS / CSS / MANIFEST ================= */
  if(

    request.url.includes("script.js") ||
    request.url.includes("style.css") ||
    request.url.includes("manifest.json")

  ){

    event.respondWith(

      fetch(request)

        .then(response => {

          const clone = response.clone();

          caches.open(CACHE_NAME)

            .then(cache => cache.put(request, clone));

          return response;
        })

        .catch(() => caches.match(request))

    );

    return;
  }

  /* ================= HTML NAVIGATION ================= */
  if(request.mode === "navigate"){

    event.respondWith(

      fetch(request)

        .then(response => {

          const clone = response.clone();

          caches.open(CACHE_NAME)

            .then(cache => cache.put(request, clone));

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

  /* ================= CACHE FIRST ================= */
  event.respondWith(

    caches.match(request)

      .then(cached => {

        if(cached){

          return cached;
        }

        return fetch(request)

          .then(response => {

            const clone = response.clone();

            caches.open(CACHE_NAME)

              .then(cache => cache.put(request, clone));

            return response;
          });

      })

  );
});
