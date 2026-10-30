// P4/MS6.2 i18n runtime — Loads locale bundle from API or static fallback,
// exposes t(), applies dir/lang on <html>, manages language cookies,
// handles case-insensitive locale select syncing, Intl date/number formatting,
// and ensures zero RTL leakage to English pages (T6.2.1, T6.2.2 / Z-31 / LOC-02).
(function () {
  'use strict';

  var API = window.TWINMOS_API || '/api/v1';
  if (API.charAt(API.length - 1) === '/') API = API.slice(0, -1);

  // ---- language selector wiring (header & drawer) ------------------
  function wireLangSelect(sel) {
    if (!sel || sel.dataset.tmWired) return;
    sel.dataset.tmWired = '1';
    sel.addEventListener('change', function () {
      var code = String(sel.value || 'en').toLowerCase();
      // T6.2.2.4: Remember language choice in cookie; no redirects based on IP.
      document.cookie = 'twinmos_locale=' + encodeURIComponent(code) + '; path=/; max-age=31536000; SameSite=Lax';
      var target = code === 'en' ? '/' : '/' + code;
      location.href = target;
    });
  }

  var langSel = document.getElementById('langSel');
  wireLangSelect(langSel);
  var drawerLangSel = document.getElementById('drawerLangSel');
  wireLangSelect(drawerLangSel);

  // ---- path locale discovery -----------------------------------------
  // Landings live at /{locale} or /{locale}/ or legacy /{locale}.html
  var m = location.pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?:\/|\.html?$|$)/i);
  var pathLocale = m && m[1] ? m[1].toLowerCase() : '';

  // Synchronize language dropdowns case-insensitively (e.g. zh-cn <-> zh-CN)
  function syncSelect(sel, loc) {
    if (!sel) return;
    var norm = String(loc || 'en').toLowerCase();
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value.toLowerCase() === norm) {
        sel.selectedIndex = i;
        break;
      }
    }
  }
  syncSelect(langSel, pathLocale || 'en');
  syncSelect(drawerLangSel, pathLocale || 'en');

  // T6.2.2.1: Stop app applying RTL to English pages for anyone who once chose Arabic.
  // P4 parity contract: the server emits dir ONLY for RTL (an explicit
  // dir="ltr" shifted Chrome's text rasterization) — mirror that here.
  var RTL = ['ar'];
  if (pathLocale && RTL.indexOf(pathLocale) !== -1) {
    document.documentElement.lang = pathLocale;
    document.documentElement.dir = 'rtl';
  } else {
    // English or LTR locale: remove any stale dir rather than writing ltr
    document.documentElement.removeAttribute('dir');
    if (pathLocale) {
      document.documentElement.lang = pathLocale;
    } else {
      document.documentElement.lang = 'en';
    }
  }

  // T6.2.2.5: Intl formatting for dates and numbers
  var currentLocaleTag = pathLocale === 'zh-cn' ? 'zh-CN' : (pathLocale || 'en');

  function formatDate(d, opts) {
    try {
      var dateObj = d instanceof Date ? d : new Date(d);
      if (isNaN(dateObj.getTime())) return String(d);
      return new Intl.DateTimeFormat(currentLocaleTag, opts || { year: 'numeric', month: 'short', day: 'numeric' }).format(dateObj);
    } catch (e) {
      return String(d);
    }
  }

  function formatNumber(n, opts) {
    try {
      var num = Number(n);
      if (isNaN(num)) return String(n);
      return new Intl.NumberFormat(currentLocaleTag, opts).format(num);
    } catch (e) {
      return String(n);
    }
  }

  window.TM = window.TM || {};
  window.TM.formatDate = formatDate;
  window.TM.formatNumber = formatNumber;

  if (!pathLocale) {
    // English default page — format any data-i18n-date or data-i18n-number and finish
    applyFormatting();
    return;
  }

  function t(key) {
    if (typeof window.I18N === 'object' && typeof window.I18N[key] === 'string') {
      return window.I18N[key];
    }
    var parts = key.split('.');
    var node = window.I18N;
    for (var i = 0; i < parts.length && node; i++) node = node[parts[i]];
    return typeof node === 'string' ? node : '';
  }

  function flatten(strings) {
    var out = {};
    Object.keys(strings).forEach(function (ns) {
      Object.keys(strings[ns]).forEach(function (k) {
        var val = strings[ns][k];
        if (!out[k] || (typeof val === 'string' && val.indexOf('???') === -1)) {
          out[k] = val;
        }
      });
    });
    return out;
  }

  function applyFormatting() {
    var dateEls = document.querySelectorAll('[data-i18n-date]');
    Array.prototype.forEach.call(dateEls, function (el) {
      var raw = el.getAttribute('data-i18n-date');
      if (raw) el.textContent = formatDate(raw);
    });

    var numEls = document.querySelectorAll('[data-i18n-number]');
    Array.prototype.forEach.call(numEls, function (el) {
      var raw = el.getAttribute('data-i18n-number');
      if (raw) el.textContent = formatNumber(raw);
    });
  }

  function apply() {
    var els = document.querySelectorAll('[data-i18n]');
    Array.prototype.forEach.call(els, function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v) el.textContent = v;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-placeholder]'), function (el) {
      var v = t(el.getAttribute('data-i18n-placeholder'));
      if (v) el.setAttribute('placeholder', v);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-aria]'), function (el) {
      var v = t(el.getAttribute('data-i18n-aria'));
      if (v) el.setAttribute('aria-label', v);
    });
    applyFormatting();
  }

  var bundle = window.I18N_BUNDLE;
  if (bundle) {
    window.I18N = flatten(bundle);
    apply();
    return;
  }

  fetch(API + '/i18n/' + encodeURIComponent(pathLocale))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || !d.strings) return;
      window.I18N = flatten(d.strings);
      apply();
    })
    .catch(function () {
      applyFormatting();
    });
})();
