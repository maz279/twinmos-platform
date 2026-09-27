// P4 i18n runtime — port-only layer. Loads the locale bundle from the API (or
// a build-generated static fallback), exposes t(), applies dir/lang on <html>,
// and swaps any [data-i18n] elements + placeholders that carry keys. EN pages
// are untouched (the layer no-ops when no bundle/keys exist) so P1 parity
// holds by construction.
(function () {
  'use strict';

  var API = window.TWINMOS_API || '/api/v1';
  if (API.charAt(API.length - 1) === '/') API = API.slice(0, -1);

  // landings live at /{locale}.html under build.format:'file' (legacy /{locale}/ kept)
  var m = location.pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?:\/|\.html?$)/);
  var pathLocale = m && m[1];
  if (!pathLocale) return; // EN (default, unprefixed) — nothing to do

  var RTL = ['ar'];
  document.documentElement.lang = pathLocale;
  document.documentElement.dir = RTL.indexOf(pathLocale) !== -1 ? 'rtl' : 'ltr';

  function t(key) {
    // flat map first (literal 'hero.title' key), then dotted walk for
    // bundles that arrive nested (hand-authored I18N_BUNDLE form)
    if (typeof window.I18N === 'object' && typeof window.I18N[key] === 'string') {
      return window.I18N[key];
    }
    var parts = key.split('.');
    var node = window.I18N;
    for (var i = 0; i < parts.length && node; i++) node = node[parts[i]];
    return typeof node === 'string' ? node : '';
  }

  /** Bundles arrive namespaced ({ common: {…} }); data-i18n keys are ns-free,
   *  so merge namespaces flat (later ns wins on key collision — kept rare by
   *  the import UI which works one ns at a time). */
  function flatten(strings) {
    var out = {};
    Object.keys(strings).forEach(function (ns) {
      Object.keys(strings[ns]).forEach(function (k) { out[k] = strings[ns][k]; });
    });
    return out;
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
  }

  var bundle = window.I18N_BUNDLE; // build-generated static fallback
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
    .catch(function () { /* bundle unavailable — page stays in EN */ });
})();
