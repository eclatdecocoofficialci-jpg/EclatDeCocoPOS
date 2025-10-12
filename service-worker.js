const CACHE_NAME = 'coco-pos-cache-v1';
const FILES_TO_CACHE = [
  './EclatDeCocoPOS.html',
  './manifest.json',
  './eclat_de_coco_official.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});