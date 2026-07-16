const CACHE_NAME = 'body-journal-v19';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'styles.css',
  'config.js',
  'db.js',
  'program.js',
  'profiles.js',
  'app.js',
  'manifest.json'
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, fall back to cached index.html if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          return (
            response ||
            fetch(event.request).then((fetchResponse) => {
              // Cache successful responses
              if (fetchResponse && fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return fetchResponse;
            })
          );
        })
        .catch(() => {
          return caches.match('index.html');
        })
    );
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((fetchResponse) => {
        // Don't cache non-successful responses
        if (!fetchResponse || fetchResponse.status !== 200) {
          return fetchResponse;
        }

        // Cache successful responses for future use
        const responseClone = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return fetchResponse;
      });
    })
  );
});
