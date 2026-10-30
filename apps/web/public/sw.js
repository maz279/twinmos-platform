// TwinMOS Service Worker — Tasks R0.5 / Z-27 compliant.
// Network-first strategy for static assets.
// Never caches API requests or private/no-store responses.
// Versioned cache with automatic eviction of stale caches.

const CACHE_NAME = 'twinmos-v2026.10';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Never cache API or internal routes
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/internal/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const cc = (res.headers.get('cache-control') || '').toLowerCase();
          const isPrivateOrNoStore =
            cc.includes('no-store') || cc.includes('private') || cc.includes('no-cache');
          if (!isPrivateOrNoStore) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((m) => m || Response.error()))
  );
});
