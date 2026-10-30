// consent.js — Accessible GDPR/ePrivacy Consent Manager (T6.3.1, T6.3.2 / CONSENT-01 / CONSENT-CSP)
// Fully external script with zero inline code. Provides equal prominence choices:
// Accept, Decline, and Granular Customize. Syncs choices server-side via POST /api/v1/consent.
(function () {
  'use strict';

  var STORAGE_KEY = 'twinmos_consent';
  var lastFocusedElement = null;

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function sendServerRecord(record) {
    try {
      var payload = JSON.stringify({
        id: record.id,
        timestamp: record.timestamp,
        policyVersion: record.version || '2026.1',
        choices: record.categories,
      });

      // Same-origin behind the edge; cross-origin in dev where the API lives
      // on :8787 (TWINMOS_API carries the full /api/v1 prefix).
      var rawBase = window.TWINMOS_API || '';
      var apiBase = rawBase.replace(/\/api\/v1\/?$/, '');
      var endpoint = apiBase + '/api/v1/consent';

      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        var blob = new Blob([payload], { type: 'application/json' });
        var sent = navigator.sendBeacon(endpoint, blob);
        if (sent) return;
      }

      if (typeof fetch === 'function') {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(function () {});
      }
    } catch (e) {
      // Non-blocking telemetry fallback
    }
  }

  function saveConsent(cats) {
    try {
      var id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

      var categories = {
        essential: true, // Always true
        analytics: false,
        marketing: false,
        preferences: false,
      };

      if (typeof cats === 'boolean') {
        categories.analytics = cats;
        categories.marketing = cats;
        categories.preferences = cats;
      } else if (cats && typeof cats === 'object') {
        categories.analytics = Boolean(cats.analytics);
        categories.marketing = Boolean(cats.marketing);
        categories.preferences = Boolean(cats.preferences);
      }

      var record = {
        id: id,
        timestamp: new Date().toISOString(),
        version: '2026.1',
        categories: categories,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));

      // Send compliance record to server-side logging endpoint (T6.3.2)
      sendServerRecord(record);

      // Hide both banner and modal
      var bar = document.getElementById('cookieBar');
      if (bar) bar.style.display = 'none';
      closePreferencesModal();

      // Dispatch event for consent-gated scripts (analytics-init.js)
      window.dispatchEvent(new CustomEvent('twinmos:consent', { detail: record }));
    } catch (e) {
      var b = document.getElementById('cookieBar');
      if (b) b.style.display = 'none';
      closePreferencesModal();
    }
  }

  function openPreferencesModal(triggerEl) {
    lastFocusedElement = triggerEl || document.activeElement;
    var backdrop = document.getElementById('cookieModalBackdrop');
    if (!backdrop) return;

    var existing = getConsent();
    var cats = existing && existing.categories ? existing.categories : { analytics: false, marketing: false, preferences: false };

    var elAnalytics = document.getElementById('cookieCatAnalytics');
    var elMarketing = document.getElementById('cookieCatMarketing');
    var elPreferences = document.getElementById('cookieCatPreferences');

    if (elAnalytics) elAnalytics.checked = Boolean(cats.analytics);
    if (elMarketing) elMarketing.checked = Boolean(cats.marketing);
    if (elPreferences) elPreferences.checked = Boolean(cats.preferences);

    backdrop.style.display = 'flex';
    backdrop.setAttribute('aria-hidden', 'false');

    var customBtn = document.getElementById('cookieCustomize');
    if (customBtn) customBtn.setAttribute('aria-expanded', 'true');

    var closeBtn = document.getElementById('cookieModalClose');
    if (closeBtn) closeBtn.focus();

    document.addEventListener('keydown', handleModalKeyDown);
  }

  function closePreferencesModal() {
    var backdrop = document.getElementById('cookieModalBackdrop');
    if (backdrop) {
      backdrop.style.display = 'none';
      backdrop.setAttribute('aria-hidden', 'true');
    }

    var customBtn = document.getElementById('cookieCustomize');
    if (customBtn) customBtn.setAttribute('aria-expanded', 'false');

    document.removeEventListener('keydown', handleModalKeyDown);

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      try {
        lastFocusedElement.focus();
      } catch (e) {}
    }
  }

  function handleModalKeyDown(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      closePreferencesModal();
      return;
    }

    if (e.key === 'Tab' || e.keyCode === 9) {
      var modal = document.getElementById('cookieModal');
      if (!modal) return;
      var focusables = modal.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;

      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
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

    // 1. Accept button (first layer)
    var acceptBtn = document.getElementById('cookieAccept');
    if (acceptBtn && !acceptBtn.__bound) {
      acceptBtn.__bound = true;
      acceptBtn.addEventListener('click', function () {
        saveConsent(true);
      });
    }

    // 2. Decline button (first layer)
    var declineBtn = document.getElementById('cookieDecline');
    if (declineBtn && !declineBtn.__bound) {
      declineBtn.__bound = true;
      declineBtn.addEventListener('click', function () {
        saveConsent(false);
      });
    }

    // 3. Customize button (first layer)
    var customizeBtn = document.getElementById('cookieCustomize');
    if (customizeBtn && !customizeBtn.__bound) {
      customizeBtn.__bound = true;
      customizeBtn.addEventListener('click', function () {
        openPreferencesModal(customizeBtn);
      });
    }

    // 4. Modal Close button
    var modalClose = document.getElementById('cookieModalClose');
    if (modalClose && !modalClose.__bound) {
      modalClose.__bound = true;
      modalClose.addEventListener('click', function () {
        closePreferencesModal();
      });
    }

    // 5. Modal Reject Non-Essential
    var rejectAllBtn = document.getElementById('cookieRejectAll');
    if (rejectAllBtn && !rejectAllBtn.__bound) {
      rejectAllBtn.__bound = true;
      rejectAllBtn.addEventListener('click', function () {
        saveConsent(false);
      });
    }

    // 6. Modal Accept All
    var acceptAllBtn = document.getElementById('cookieAcceptAll');
    if (acceptAllBtn && !acceptAllBtn.__bound) {
      acceptAllBtn.__bound = true;
      acceptAllBtn.addEventListener('click', function () {
        saveConsent(true);
      });
    }

    // 7. Modal Save Preferences
    var savePrefsBtn = document.getElementById('cookieSavePreferences');
    if (savePrefsBtn && !savePrefsBtn.__bound) {
      savePrefsBtn.__bound = true;
      savePrefsBtn.addEventListener('click', function () {
        var elAnalytics = document.getElementById('cookieCatAnalytics');
        var elMarketing = document.getElementById('cookieCatMarketing');
        var elPreferences = document.getElementById('cookieCatPreferences');
        saveConsent({
          essential: true,
          analytics: elAnalytics ? elAnalytics.checked : false,
          marketing: elMarketing ? elMarketing.checked : false,
          preferences: elPreferences ? elPreferences.checked : false,
        });
      });
    }

    // 8. Footer "Cookie Preferences" link (Withdrawal link always available)
    var prefBtn = document.getElementById('cookiePreferencesBtn');
    if (prefBtn && !prefBtn.__bound) {
      prefBtn.__bound = true;
      prefBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openPreferencesModal(prefBtn);
      });
    }

    // 9. Backdrop click to close modal
    var backdrop = document.getElementById('cookieModalBackdrop');
    if (backdrop && !backdrop.__bound) {
      backdrop.__bound = true;
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) {
          closePreferencesModal();
        }
      });
    }
  }

  // Global event triggers for withdrawal / opening
  window.addEventListener('twinmos:open-consent', function () {
    openPreferencesModal(null);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
