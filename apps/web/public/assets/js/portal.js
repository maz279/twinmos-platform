/* P5 partner portal + anti-counterfeit — port-only layer.
 * partners.html: the demo sign-in form becomes a real partner sign-in
 *   (Better Auth session); on success an inline portal dashboard renders the
 *   org profile and its gated assets (price files / MDF / resources) with
 *   download links through the authenticated endpoint.
 * support.html: a serial-number verifier widget posts to the public
 *   /sn-check endpoint and renders the verdict + advice.
 * No behavior changes on any other page; EN parity untouched (elements only
 * appear after user action). */
(function () {
  'use strict';

  var API = window.TWINMOS_API || '/api/v1';
  if (API.charAt(API.length - 1) === '/') API = API.slice(0, -1);

  function esc(s) { var d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; }

  // ---------- partner portal (partners.html) ----------
  var portalForm = document.querySelector('form[data-tm-form]');
  var isPartners = /\/partners\.html$/.test(location.pathname);
  if (isPartnersForm(portalForm)) {
    wirePortal(portalForm);
  }
  function isPartnersForm(form) {
    return !!(form && isPartners &&
      (form.getAttribute('data-success') || '').indexOf('Demo sign-in') !== -1 &&
      form.querySelector('input[type="password"]'));
  }

  function wirePortal(form) {
    // Real sign-in replaces the prototype's fake "demo accepted" handler:
    // capture phase beats app.js's bubble-phase submit, so the fake success
    // never fires. On success the portal dashboard renders below the form.
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var email = (form.querySelector('input[type=email], input[type=text]') || {}).value || '';
      var password = (form.querySelector('input[type=password]') || {}).value || '';
      var err = form.querySelector('.tm-portal-error');
      if (err) err.remove();
      if (!email || !password) {
        showPortalError(form, 'Enter your partner email and password.');
        return;
      }
      var btn = form.querySelector('button[type="submit"], .btn');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }
      fetch(API + '/auth/sign-in/email', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email, password: password }),
      }).then(function (r) {
        if (!r.ok) throw new Error('Sign-in failed — check your credentials.');
        return fetch(API + '/partner/me', { credentials: 'include' });
      }).then(function (r) {
        if (!r.ok) throw new Error('Signed in, but this account has no active partner membership.');
        return r.json();
      }).then(function (me) {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        renderPortal(me);
      }).catch(function (e2) {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        showPortalError(form, e2 && e2.message ? e2.message : 'Sign-in failed.');
      });
    }, true); // capture — before the prototype's fake-success handler
    // page load: existing session → dashboard straight away
    bootPortalIfMember();
  }

  function showPortalError(form, msg) {
    var p = document.createElement('p');
    p.className = 'tm-portal-error';
    p.setAttribute('role', 'alert');
    p.style.cssText = 'color:#B3261E;font-size:13.5px;margin:10px 0 0';
    p.textContent = msg;
    form.appendChild(p);
  }

  function bootPortalIfMember() {
    fetch(API + '/partner/me', { credentials: 'include' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (me) { if (me) return renderPortal(me); })
      .catch(function () { /* not signed in or not a member */ });
  }

  function renderPortal(me) {
    var host = document.getElementById('partnerPortal');
    if (!host) {
      host = document.createElement('div');
      host.id = 'partnerPortal';
      var box = document.querySelector('form[data-tm-form]');
      (box ? box.parentElement : document.querySelector('#main')).appendChild(host);
    }
    fetch(API + '/partner/assets', { credentials: 'include' })
      .then(function (r) { return r.ok ? r.json() : { items: [] }; })
      .then(function (assets) {
        var rows = (assets.items || []).map(function (a) {
          return '<tr><td>' + esc(a.category) + '</td><td><b>' + esc(a.title) + '</b></td><td>' +
            (a.bytes ? Math.round(a.bytes / 1024) + ' KB' : '—') + '</td><td><a href="' + API + '/partner/assets/' +
            encodeURIComponent(a.id) + '/download" target="_blank" rel="noopener">Download</a></td></tr>';
        }).join('');
        host.innerHTML =
          '<div class="card card-pad" style="margin-top:18px;text-align:start">' +
          '<span class="chip">' + esc(assets.org ? assets.org.type : me.org.type) + '</span>' +
          '<h3 class="h3" style="margin:10px 0 4px">' + esc(me.org.name) + ' — partner portal</h3>' +
          '<p class="form-note">Signed in as ' + esc(me.user.email) + ' (' + esc(me.memberRole) + '). Status: ' + esc(me.org.status) + '.</p>' +
          '<h4 class="h3" style="margin:14px 0 6px">Your documents</h4>' +
          (rows
            ? '<table class="tbl" style="width:100%;border-collapse:collapse;font-size:14px">' +
              '<thead><tr><th style="text-align:left;padding:6px 8px">Category</th><th style="text-align:left;padding:6px 8px">Title</th><th style="text-align:left;padding:6px 8px">Size</th><th></th></tr></thead>' +
              '<tbody>' + rows + '</tbody></table>'
            : '<p class="form-note">No documents shared with your organization yet.</p>') +
          '</div>';
        host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      })
      .catch(function () { /* assets fetch failed — me card alone */ });
  }

  // ---------- SN-check widget (support.html) ----------
  if (/\/support\.html$/.test(location.pathname)) {
    var main = document.getElementById('main');
    if (!main) return;
    // Collapsed chip appended at the END of main: nothing above shifts
    // (P1 parity); one click expands the verifier card.
    var chip = document.createElement('div');
    chip.className = 'card card-pad';
    chip.style.cssText = 'text-align:start;margin-top:18px;cursor:pointer;user-select:none';
    chip.innerHTML =
      '<span class="eyebrow">Anti-counterfeit</span> ' +
      '<b style="display:block;margin-top:6px">Verify a product serial number</b>' +
      '<p class="form-note" style="margin:4px 0 0">Check a TwinMOS serial against our registry before you buy — click to verify.</p>';
    var expanded = false;
    chip.addEventListener('click', function () {
      if (expanded) return;
      expanded = true;
      chip.style.cursor = 'default';
      chip.innerHTML =
        '<span class="eyebrow">Anti-counterfeit</span>' +
        '<h3 class="h3" style="margin:8px 0 6px">Verify a serial number</h3>' +
        '<p class="form-note">Check a TwinMOS product serial against our registry before you buy.</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">' +
        '<input class="input" id="snInput" placeholder="e.g. TM-DEMO-0001" style="flex:1;min-width:200px" aria-label="Serial number">' +
        '<button class="btn btn-accent" id="snBtn">Verify</button></div>' +
        '<div id="snOut" style="margin-top:12px"></div>';
      var run = function () {
        var serial = (document.getElementById('snInput').value || '').trim();
        var out = document.getElementById('snOut');
        if (!serial) { out.innerHTML = '<p class="form-note" style="color:#B3261E">Enter a serial number first.</p>'; return; }
        out.innerHTML = '<p class="form-note">Checking…</p>';
        fetch(API + '/sn-check', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ serial: serial }),
        }).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)); })
          .then(function (d) {
            var ok = d.result === 'valid';
            out.innerHTML =
              '<div class="form-success' + (ok ? ' show' : '') + '" style="' + (ok ? '' : 'border-color:#FCA5A5;background:#FEF2F2') + ';text-align:left">' +
              '<div class="tick" style="' + (ok ? '' : 'background:#DC2626') + '">' + (ok ? '✓' : '!') + '</div>' +
              '<h3>' + esc(serial) + ' — ' + (ok ? 'genuine' : 'not verified') + '</h3>' +
              (d.sku ? '<p class="form-note">SKU: ' + esc(d.sku) + (d.manufacturedAt ? ' · made ' + esc(String(d.manufacturedAt).slice(0, 10)) : '') + '</p>' : '') +
              '<p style="font-size:13.5px">' + esc(d.advice) + '</p></div>';
          })
          .catch(function () {
            out.innerHTML = '<p class="form-note" style="color:#B3261E">Verification is unavailable right now — please retry.</p>';
          });
      };
      document.getElementById('snBtn').addEventListener('click', run);
      document.getElementById('snInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
      document.getElementById('snInput').focus();
    });
    main.appendChild(chip);
  }
})();
