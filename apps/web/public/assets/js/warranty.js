/* Warranty registration + status lookup (/support/warranty).
 * POSTs to /api/v1/warranty/{register,lookup}; serial and e-mail travel in the
 * body, never in the URL. Turnstile is rendered explicitly when the deployment
 * provides a site key (meta turnstile-site-key, set by Layout.astro). */
(function () {
  'use strict';
  var API = String(window.TWINMOS_API || '/api/v1').replace(/\/+$/, '');
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; }
  function box(ok, html) {
    return '<div style="border:1px solid ' + (ok ? '#86EFAC' : '#FCA5A5') + ';background:' + (ok ? '#F0FDF4' : '#FEF2F2') +
      ';padding:12px 14px;border-radius:8px;text-align:left;font-size:13.5px;color:#0F172A">' + html + '</div>';
  }
  var STATUS = {
    active: 'Warranty active', expiring_soon: 'Warranty expiring soon', expired: 'Warranty expired',
    lifetime: 'Lifetime warranty', undetermined: 'Registered — warranty term to be confirmed by TwinMOS support',
    not_registered: 'No registration found for this serial and e-mail address',
  };
  function describe(d) {
    return '<b>' + esc(STATUS[d.status] || d.status) + '</b>' +
      (d.product ? '<br>' + esc(d.product) : '') +
      (d.serial ? '<br>Serial: ' + esc(d.serial) : '') +
      (d.purchaseDate ? '<br>Purchased: ' + esc(d.purchaseDate) : '') +
      (d.warrantyTerm ? '<br>Warranty: ' + esc(d.warrantyTerm) : '') +
      (d.expiresAt ? '<br>Covered until: ' + esc(String(d.expiresAt).slice(0, 10)) : '');
  }
  function problemText(p, status) {
    return (p && (p.detail || p.title)) || ('Request failed (HTTP ' + status + ')');
  }

  var formToken = '';
  fetch(API + '/forms/token').then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d && d.token) formToken = d.token; }).catch(function () {});

  var siteKeyMeta = document.querySelector('meta[name="turnstile-site-key"]');
  var siteKey = siteKeyMeta ? siteKeyMeta.getAttribute('content') : '';
  var holder = document.querySelector('.wty-turnstile');
  if (siteKey && holder) {
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.onload = function () { if (window.turnstile) window.turnstile.render(holder, { sitekey: siteKey }); };
    document.head.appendChild(s);
  }

  var reg = document.getElementById('wtyRegisterForm');
  if (reg) reg.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = document.getElementById('wtyRegisterOut');
    var f = reg.elements;
    var body = {
      serial: f.serial.value.trim(), name: f.name.value.trim(), email: f.email.value.trim(),
      country: f.country.value.trim() || undefined, purchaseDate: f.purchaseDate.value,
      retailer: f.retailer.value.trim() || undefined, consent: f.consent.checked, formToken: formToken,
    };
    var ts = reg.querySelector('[name="cf-turnstile-response"]');
    if (ts && ts.value) body.turnstileToken = ts.value;
    if (!body.serial || !body.name || !body.email || !body.purchaseDate) { out.innerHTML = box(false, 'Please complete the required fields.'); return; }
    if (!body.consent) { out.innerHTML = box(false, 'Please accept the privacy notice to continue.'); return; }
    var btn = reg.querySelector('button[type="submit"]');
    btn.disabled = true;
    out.innerHTML = '<p class="form-note">Registering…</p>';
    fetch(API + '/warranty/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; }); })
      .then(function (x) {
        btn.disabled = false;
        if (x.r.status === 202) { out.innerHTML = box(true, 'Almost done — open the confirmation link we sent to ' + esc(body.email) + ' to activate the registration (valid for 48 hours).'); reg.reset(); if (window.turnstile && holder) window.turnstile.reset(holder); return; } // tokens are single-use: the next registration needs a fresh challenge
        out.innerHTML = box(false, esc(problemText(x.d, x.r.status)));
        if (window.turnstile && holder) window.turnstile.reset(holder);
      })
      .catch(function () { btn.disabled = false; out.innerHTML = box(false, 'The registration service could not be reached — please retry.'); });
  });

  // Confirmation link from the e-mail: activate on an explicit click (POST),
  // so mail link scanners cannot activate a registration.
  var confirmToken = new URLSearchParams(location.search).get('confirm');
  var regCard = document.getElementById('register');
  if (confirmToken && regCard) {
    var panel = document.createElement('div');
    panel.className = 'card card-pad';
    panel.style.marginBottom = '16px';
    panel.innerHTML = '<h2 class="h3">Confirm your registration</h2><p class="form-note">Click to activate the warranty registration requested with this e-mail address.</p><button class="btn btn-primary" type="button" id="wtyConfirmBtn">Confirm registration</button><div id="wtyConfirmOut" aria-live="polite" style="margin-top:12px"></div>';
    regCard.parentNode.insertBefore(panel, regCard);
    document.getElementById('wtyConfirmBtn').addEventListener('click', function () {
      var b = this; b.disabled = true;
      var out = document.getElementById('wtyConfirmOut');
      fetch(API + '/warranty/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: confirmToken }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; }); })
        .then(function (x) { b.style.display = 'none'; out.innerHTML = x.r.ok ? box(true, 'Registration confirmed.<br>' + describe(x.d)) : box(false, esc(problemText(x.d, x.r.status))); })
        .catch(function () { b.disabled = false; out.innerHTML = box(false, 'The service could not be reached — please retry.'); });
    });
  }

  var look = document.getElementById('wtyLookupForm');
  if (look) look.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = document.getElementById('wtyLookupOut');
    var body = { serial: look.elements.serial.value.trim(), email: look.elements.email.value.trim() };
    if (!body.serial || !body.email) { out.innerHTML = box(false, 'Enter the serial number and your e-mail address.'); return; }
    out.innerHTML = '<p class="form-note">Checking…</p>';
    fetch(API + '/warranty/lookup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; }); })
      .then(function (x) {
        if (!x.r.ok) { out.innerHTML = box(false, esc(problemText(x.d, x.r.status))); return; }
        var ok = x.d.status !== 'not_registered' && x.d.status !== 'expired';
        out.innerHTML = box(ok, describe(x.d) + (x.d.status === 'not_registered' ? '<br><a href="#register">Register this product →</a>' : ''));
      })
      .catch(function () { out.innerHTML = box(false, 'The warranty service could not be reached — please retry.'); });
  });
})();
