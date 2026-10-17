(function () {
  'use strict';

  var STORAGE_KEY = 'twinmos_consent';

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analytics) {
    try {
      var id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      var record = {
        id: id,
        timestamp: new Date().toISOString(),
        version: '2026.1',
        categories: {
          essential: true,
          analytics: Boolean(analytics),
          preferences: Boolean(analytics),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      var bar = document.getElementById('cookieBar');
      if (bar) bar.style.display = 'none';
      window.dispatchEvent(new CustomEvent('twinmos:consent', { detail: record }));
    } catch (e) {
      var b = document.getElementById('cookieBar');
      if (b) b.style.display = 'none';
    }
  }

  function openConsentBar() {
    var bar = document.getElementById('cookieBar');
    if (bar) {
      bar.style.display = 'flex';
      if (typeof bar.scrollIntoView === 'function') {
        bar.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }

  function init() {
    var bar = document.getElementById('cookieBar');
    var consent = getConsent();

    if (bar) {
      if (consent) {
        bar.style.display = 'none';
      } else {
        bar.style.display = 'flex';
      }
    }

    var acceptBtn = document.getElementById('cookieAccept');
    if (acceptBtn && !acceptBtn.__bound) {
      acceptBtn.__bound = true;
      acceptBtn.addEventListener('click', function () {
        saveConsent(true);
      });
    }

    var declineBtn = document.getElementById('cookieDecline');
    if (declineBtn && !declineBtn.__bound) {
      declineBtn.__bound = true;
      declineBtn.addEventListener('click', function () {
        saveConsent(false);
      });
    }

    var prefBtn = document.getElementById('cookiePreferencesBtn');
    if (prefBtn && !prefBtn.__bound) {
      prefBtn.__bound = true;
      prefBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openConsentBar();
      });
    }
  }

  window.addEventListener('twinmos:open-consent', openConsentBar);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
