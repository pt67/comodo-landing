const CACHE_NAME = 'comodo-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/index.css',
  '/js/index.js',
  '/cordova.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});