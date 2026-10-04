// TwinMOS prototype service worker — network-first pages, cache-first versioned assets
var CACHE = 'twinmos-proto-' + '219974299b';
var ASSETS = ['index.html','shop.html','product.html','compatibility.html','compare.html','where-to-buy.html','gaming.html','solutions.html','support.html','rma.html','learn.html','learn-guides.html','learn-explained.html','learn-benchmarks.html','learn-glossary.html','learn-blog.html','news.html','article.html','technology.html','about.html','careers.html','contact.html','quote.html','legal.html','partners.html','search.html','404.html','sitemap.html','assets/css/main.css?v=219974299b','assets/js/app.js?v=219974299b','assets/js/data.js?v=219974299b','assets/img/logo.webp?v=219974299b'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    // pages: network-first so rebuilds are picked up immediately; cache only as offline fallback
    e.respondWith(fetch(e.request).then(function (r) {
      var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
      return r;
    }).catch(function () { return caches.match(e.request).then(function (hit) { return hit || caches.match('index.html'); }); }));
    return;
  }
  // content-hashed (?v=) assets are immutable → cache-first; anything else falls through to network
  e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request); }));
});
