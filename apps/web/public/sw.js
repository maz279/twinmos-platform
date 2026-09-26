// P1 service worker — deliberately network-first for EVERYTHING with no precache,
// so a rebuild is always picked up (the prototype's precaching SW masked stale
// builds; see project memory "SW stale-HTML pitfalls"). Static hosting + CDN make
// caching their job, not the SW's.
const CACHE = 'twinmos-p1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((m) => m || Response.error()))
  );
});
