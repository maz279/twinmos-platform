// analytics-init.js — Consent-gated Google Analytics loader (MS4.2 T4.2.1 /
// integrations.analyticsEnabled). The measurement ID is rendered into a meta
// tag by Layout.astro only when the switch is on; this file loads gtag.js
// after the visitor has granted the "analytics" consent category.
(function () {
  'use strict';

  var meta = document.querySelector('meta[name="twinmos-analytics"]');
  var gaId = meta ? String(meta.getAttribute('content') || '').trim() : '';
  if (!/^G-[A-Z0-9]+$/i.test(gaId)) return;

  var loaded = false;

  function hasAnalyticsConsent() {
    try {
      var raw = localStorage.getItem('twinmos_consent');
      if (!raw) return false;
      var record = JSON.parse(raw);
      return !!(record && record.categories && record.categories.analytics);
    } catch (e) {
      return false;
    }
  }

  function load() {
    if (loaded || !hasAnalyticsConsent()) return;
    loaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { anonymize_ip: true });
  }

  load();
  window.addEventListener('twinmos:consent', load);
})();
