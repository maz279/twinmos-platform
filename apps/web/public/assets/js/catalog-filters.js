/* Catalogue filter/sort/gallery wiring (MS5.3): external per CSP script-src
 * 'self'. All controls are real form inputs that keep their server-rendered
 * state; this script only navigates on change so URLs stay shareable and the
 * page works without JavaScript (filters submit as normal form controls). */
(function () {
  'use strict';
  function go(href) { window.location.href = href; }

  // Category radios + brand checkboxes + sort select on /products[/<category>]
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var nav = el.getAttribute('data-nav');
    if (nav) { go(nav); return; }
    if (el.id === 'sortSel' || el.getAttribute('aria-label') === 'Sort products') {
      var u = new URL(window.location.href);
      u.searchParams.set('sort', el.value);
      go(u.toString());
    }
  });

  // PDP gallery thumbnails (buttons carry data-full); the page-level gallery
  // script owns arrows/counter, this keeps the shared handler class-driven.
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.gallery-thumb') : null;
    if (!btn) return;
    var full = btn.getAttribute('data-full');
    var mainImg = document.querySelector('.pdp-main-image img');
    if (full && mainImg) {
      mainImg.src = full;
      mainImg.classList.toggle('is-scene', btn.getAttribute('data-scene') === 'true');
    }
    document.querySelectorAll('.gallery-thumb').forEach(function (b) {
      b.classList.remove('on');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('on');
    btn.setAttribute('aria-selected', 'true');
  });
})();
