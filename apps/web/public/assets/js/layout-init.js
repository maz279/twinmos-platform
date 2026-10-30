(function () {
  // Service Worker Registration
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }

  // API Config from meta tags
  var apiMeta = document.querySelector('meta[name="twinmos-api"]');
  var turnstileMeta = document.querySelector('meta[name="turnstile-site-key"]');
  window.TWINMOS_API = apiMeta ? apiMeta.getAttribute('content') : '';
  window.TURNSTILE_SITE_KEY = turnstileMeta ? turnstileMeta.getAttribute('content') : '';

  // PDP Deep Links Hero Image Discovery
  try {
    if (/product\.html$/.test(location.pathname)) {
      var id = new URLSearchParams(location.search).get('id');
      if (id) {
        var s = document.createElement('script');
        s.src = '/assets/js/pdp-hero.js';
        s.onload = function () {
          var src = window.PDP_HERO && window.PDP_HERO[id];
          if (!src) return;
          var l = document.createElement('link');
          l.rel = 'preload';
          l.as = 'image';
          l.href = src;
          document.head.appendChild(l);
        };
        document.body.appendChild(s);
      }
    }
  } catch (e) {
    /* best-effort */
  }

  // URL-param hygiene before app layer parses them
  try {
    var s = location.search;
    if (s && /[<>"'`]/.test(s)) {
      var params = new URLSearchParams(s);
      var clean = new URLSearchParams();
      params.forEach(function (v, k) {
        clean.set(k, v.replace(/[<>"'`]/g, ''));
      });
      var qs = clean.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }
  } catch (e) {
    /* never block the page */
  }

  // App layer boots post-first-paint. Catalog ships live-first from
  // /api/catalog-data.js (SSR, Delivery API canonical); the static
  // catalog-data.js remains only as that endpoint's outage fallback.
  var files = [
    '/assets/js/consent.js',
    '/api/catalog-data.js',
    '/assets/js/app.js',
    '/assets/js/img-dims.js',
    '/assets/js/a11y.js',
    '/assets/js/forms.js',
    '/assets/js/i18n.js',
    '/assets/js/portal.js',
  ];

  function boot() {
    files.forEach(function (src) {
      var sc = document.createElement('script');
      sc.src = src;
      sc.async = false;
      document.body.appendChild(sc);
    });
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(boot, { timeout: 300 });
  } else {
    setTimeout(boot, 300);
  }
})();
