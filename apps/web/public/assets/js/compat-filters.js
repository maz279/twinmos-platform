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
    var rawType = (typeSelect ? typeSelect.value : '').toLowerCase().trim();
    var type = rawType === 'motherboard' ? 'diy' : rawType;
    var brand = (brandSelect ? brandSelect.value : '').toLowerCase().trim();
    var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var shown = 0;

    cards.forEach(function (card) {
      var ok = true;
      var cardType = (card.getAttribute('data-type') || '').toLowerCase();
      var cardBrand = (card.getAttribute('data-brand') || '').toLowerCase();

      if (type && cardType !== type && !(type === 'diy' && cardType === 'motherboard')) ok = false;
      if (ok && brand && cardBrand !== brand) ok = false;
      if (ok && q) {
        var hay = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        if (hay.indexOf(q) === -1) ok = false;
      }
      card.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });

    if (countDisplay) {
      countDisplay.textContent = 'Showing ' + shown + ' of ' + cards.length + ' Platforms';
    }
  }

  if (typeSelect) typeSelect.addEventListener('change', apply);
  if (brandSelect) brandSelect.addEventListener('change', apply);
  if (queryInput) queryInput.addEventListener('input', apply);

  Array.prototype.forEach.call(quickPicks, function (btn) {
    btn.addEventListener('click', function () {
      var qType = btn.getAttribute('data-type') || '';
      var qBrand = btn.getAttribute('data-brand') || '';
      var qQuery = btn.getAttribute('data-q') || '';

      if (typeSelect) typeSelect.value = qType;
      if (brandSelect) brandSelect.value = qBrand;
      if (queryInput) queryInput.value = qQuery;
      apply();
    });
  });

  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
  apply();
})();
