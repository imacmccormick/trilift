const CACHE_NAME = 'trilift-cache-v1';
const ASSETS = [
  '/trilift/',
  '/trilift/index.html',
  '/trilift/manifest.json',
  '/trilift/favicon.svg',
  '/trilift/icon-192.png',
  '/trilift/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to cache if network fails
        return cachedResponse;
      });

      // Serve static assets from cache instantly (stale-while-revalidate)
      const isStaticAsset = event.request.url.includes('/assets/') || 
                            event.request.url.endsWith('.svg') || 
                            event.request.url.endsWith('.png');

      if (cachedResponse && isStaticAsset) {
        return cachedResponse;
      }
      
      return fetchPromise.catch(() => cachedResponse);
    })
  );
});
