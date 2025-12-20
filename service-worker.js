const CACHE_NAME = 'eclatpos-cache-v2'; // Version du cache
const urlsToCache = [
  'dashboard.html',
  'pos.html',
  'sales.html',
  'products.html',
  'inventory.html',
  'expenses.html',
  'orders.html',
  'customers.html',
  'reports.html',
  'style.css',
  'script.js',
  'dashboard.js',
  'customers.js',
  'icon-192.png',
  'icon-512.png',
  'chart.min.js'
];

// INSTALL : mise en cache initiale
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching all files');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ACTIVATE : suppression anciens caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// FETCH : réponse à partir du cache, sinon réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // fichier trouvé dans le cache
      }
      return fetch(event.request)
        .then(networkResponse => {
          // mettre en cache les nouveaux fichiers dynamiques
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Optionnel : renvoyer une page offline générique si indisponible
          if (event.request.mode === 'navigate') {
            return caches.match('dashboard.html'); // par défaut
          }
        });
    })
  );
});
