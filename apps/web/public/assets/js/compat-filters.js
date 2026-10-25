/* Compatibility finder client filter (T5.6): external per CSP script-src
 * 'self'. Progressively enhances the server-rendered cards; the form itself
 * still submits to /compatibility so the page works without JavaScript. */
(function () {
  'use strict';
  var form = document.getElementById('compatFilterForm');
  var typeSelect = document.getElementById('compatType');
  var brandSelect = document.getElementById('compatBrand');
  var queryInput = document.getElementById('compatQuery');
  var countDisplay = document.getElementById('compatCountDisplay');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.compat-card'));
  var quickPicks = document.querySelectorAll('.quick-pick-btn');
  if (!cards.length) return;

  function apply() {
    var type = typeSelect ? typeSelect.value : '';
    var brand = brandSelect ? brandSelect.value : '';
    var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var shown = 0;
    cards.forEach(function (card) {
      var ok = true;
      if (type && card.getAttribute('data-type') !== type) ok = false;
      if (ok && brand && card.getAttribute('data-brand') !== brand) ok = false;
      if (ok && q) {
        var hay = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        if (hay.indexOf(q) === -1) ok = false;
      }
      card.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    if (countDisplay) countDisplay.textContent = shown + ' of ' + cards.length + ' systems';
  }

  if (typeSelect) typeSelect.addEventListener('change', apply);
  if (brandSelect) brandSelect.addEventListener('change', apply);
  if (queryInput) queryInput.addEventListener('input', apply);

  Array.prototype.forEach.call(quickPicks, function (btn) {
    btn.addEventListener('click', function () {
      if (typeSelect) typeSelect.value = btn.getAttribute('data-type') || '';
      if (brandSelect) brandSelect.value = btn.getAttribute('data-brand') || '';
      if (queryInput) queryInput.value = '';
      apply();
    });
  });

  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
  apply();
})();
