const CACHE_NAME = 'studysnap-cache-v1';

// Static resources to pre-cache immediately on load
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle standard GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strictly skip Firestore APIs, Auth endpoints, and dynamic external calls
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.pathname.startsWith('/__/auth') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Navigation requests (HTML loading / user reloading the page)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If the page fetches successfully, clone and store it in cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/', responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, serve the cached index shell page
          return caches.match('/').then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, and media files like images/fonts/icons)
  // We use standard Cache-First with dynamic fallback & cache update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.log('[SW] Fetch failed for resource, serving from cache if available:', event.request.url);
        });

      return cachedResponse || fetchPromise;
    })
  );
});
