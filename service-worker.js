const CACHE_NAME = 'eclatpos-cache-v1';
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
  'icon-192.png',
  'icon-512.png',
  'chart.min.js'
];

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching all files');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// FETCH
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
