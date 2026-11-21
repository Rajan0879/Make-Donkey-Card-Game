const CACHE_NAME = 'make-donkey-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network requests pass through cleanly, caching static assets when possible
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
