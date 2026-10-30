/* P5 partner portal + anti-counterfeit + RMA status tracker — port-only layer.
 * partners: real partner sign-in (Better Auth session) + portal dashboard.
 * support / rma: serial verifier (POST /api/v1/sn-check) and live RMA tracker
 *   (GET /api/v1/forms/rma/:number) with status timeline.
 * Works on clean URLs (/partners, /support, /rma) and legacy .html URLs.
 */
(function () {
  'use strict';

  var API = window.TWINMOS_API || '/api/v1';
  if (API.charAt(API.length - 1) === '/') API = API.slice(0, -1);

  function esc(s) { var d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; }

  // ---------- partner portal (partners or partners.html) ----------
  var portalForm = document.getElementById('partnerSignIn');
  var isPartners = /\/partners(\.html)?$/.test(location.pathname);
  if (isPartnersForm(portalForm)) {
    wirePortal(portalForm);
  }
  function isPartnersForm(form) {
    return !!(form && isPartners && form.querySelector('input[type="password"]'));
  }

  function wirePortal(form) {
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
    }, true);
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
    // ask for the session first (200 + null when signed out), so anonymous
    // visitors do not trigger a 401 on /partner/me on every page view
    fetch(API + '/auth/get-session', { credentials: 'include' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) { return s && s.user ? fetch(API + '/partner/me', { credentials: 'include' }) : null; })
      .then(function (r) { return r && r.ok ? r.json() : null; })
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
          '<button type="button" id="tmPortalSignOut" class="btn" style="margin-top:14px">Sign out</button>' +
          '</div>';
        var so = document.getElementById('tmPortalSignOut');
        if (so) so.addEventListener('click', function () {
          so.disabled = true; so.textContent = 'Signing out…';
          fetch(API + '/auth/sign-out', { method: 'POST', credentials: 'include' })
            .catch(function () { /* clear the dashboard regardless */ })
            .then(function () { host.innerHTML = ''; if (host.parentNode) host.parentNode.removeChild(host); });
        });
        host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      })
      .catch(function () { /* assets fetch failed */ });
  }

  // ---------- RMA Status Tracker (#rmaTrackForm -> POST /api/v1/rma/track {number, email}) ----------
  // The only tracker on the site: proof of ownership is the RMA number PLUS the
  // e-mail used for the request, sent in the body (never in the URL).
  function wireRmaTracker() {
    var rmaForm = document.getElementById('rmaTrackForm');
    if (!rmaForm) return;

    rmaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('rmaTrackInput');
      var out = document.getElementById('rmaTrackOut');
      if (!input || !out) return;

      var num = (input.value || '').trim();
      var emailEl = document.getElementById('rmaTrackEmail');
      var email = emailEl ? (emailEl.value || '').trim() : '';
      if (!num || !email) {
        out.innerHTML = '<p class="form-note" style="color:#B3261E">Enter the RMA number from your confirmation e-mail and the e-mail address you used.</p>';
        return;
      }

      out.innerHTML = '<p class="form-note" style="color:#2563EB">Checking live RMA service status…</p>';

      fetch(API + '/rma/track', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ number: num, email: email }),
      }).then(function (r) {
        if (r.status === 404) throw new Error('NOT_FOUND');
        if (r.status === 400) throw new Error('INVALID_FORMAT');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (d) {
        var statusColor = '#2563EB';
        var statusLabel = d.status.replace(/_/g, ' ').toUpperCase();
        // RMA_STATUS: submitted → under_review → approved → in_repair → shipped → delivered (closed at any step)
        if (d.status === 'in_repair' || d.status === 'approved') statusColor = '#D97706';
        else if (d.status === 'shipped' || d.status === 'delivered') statusColor = '#16A34A';
        else if (d.status === 'closed') statusColor = '#475569';

        var timelineHtml = '';
        if (d.timeline && d.timeline.length > 0) {
          timelineHtml = '<div style="margin-top:14px;padding-top:12px;border-top:1px solid #E2E8F0">' +
            '<strong style="font-size:13px;color:#475569;display:block;margin-bottom:8px">Activity Timeline:</strong>' +
            '<ul style="margin:0;padding-left:18px;font-size:13px;color:#334155;line-height:1.6">' +
            d.timeline.map(function (ev) {
              return '<li>' +
                '<strong>' + esc(ev.to ? ev.to.replace(/_/g, ' ') : 'Update') + '</strong>' +
                (ev.at ? ' <span style="color:#64748B">(' + esc(String(ev.at).slice(0, 10)) + ')</span>' : '') +
                (ev.note ? ' — ' + esc(ev.note) : '') +
                '</li>';
            }).join('') +
            '</ul></div>';
        }

        out.innerHTML =
          '<div class="card card-pad" style="background:#FFFFFF;border:1px solid #CBD5E1;border-radius:8px;padding:16px;text-align:left;box-shadow:0 1px 3px rgba(0,0,0,0.05)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">' +
          '<span style="font-weight:700;font-size:15px;color:#0F172A">' + esc(d.number) + '</span>' +
          '<span class="chip" style="background:' + statusColor + ';color:#FFFFFF;font-weight:600;font-size:12px;padding:2px 10px;border-radius:9999px">' + esc(statusLabel) + '</span>' +
          '</div>' +
          '<p class="form-note" style="margin:0 0 6px">' +
          (d.maskedInfo && d.maskedInfo.name ? 'Customer: <strong>' + esc(d.maskedInfo.name) + '</strong> · ' : '') +
          (d.maskedInfo && d.maskedInfo.product ? 'Product: <strong>' + esc(d.maskedInfo.product) + '</strong>' : '') +
          '</p>' +
          (d.createdAt ? '<p class="form-note" style="margin:0;color:#64748B;font-size:12px">Opened: ' + esc(String(d.createdAt).slice(0, 10)) + '</p>' : '') +
          timelineHtml +
          '</div>';
      }).catch(function (err) {
        if (err.message === 'NOT_FOUND') {
          out.innerHTML =
            '<div class="card card-pad" style="border-color:#FCA5A5;background:#FEF2F2;color:#991B1B;padding:12px 14px;border-radius:6px;text-align:left">' +
            '<strong style="display:block;margin-bottom:2px">RMA Not Found</strong>' +
            '<span style="font-size:13px">No RMA matches <strong>' + esc(num) + '</strong> and that e-mail address. Check both against your confirmation e-mail.</span>' +
            '</div>';
        } else if (err.message === 'INVALID_FORMAT') {
          out.innerHTML =
            '<div class="card card-pad" style="border-color:#FCA5A5;background:#FEF2F2;color:#991B1B;padding:12px 14px;border-radius:6px;text-align:left">' +
            '<strong style="display:block;margin-bottom:2px">Invalid RMA Format</strong>' +
            '<span style="font-size:13px">Please enter an RMA number formatted like <code>TM-RMA-2026-123456</code> and a valid e-mail address.</span>' +
            '</div>';
        } else {
          out.innerHTML =
            '<div class="card card-pad" style="border-color:#FCA5A5;background:#FEF2F2;color:#991B1B;padding:12px 14px;border-radius:6px;text-align:left">' +
            '<span style="font-size:13px">Tracking service is temporarily unavailable. Please retry in a moment.</span>' +
            '</div>';
        }
      });
    });
  }

  // ---------- SN-check verifier (#snBtn / #snInput -> POST /api/v1/sn-check) ----------
  function wireSnCheck() {
    function executeSnCheck(serial, outEl) {
      if (!serial) {
        outEl.innerHTML = '<p class="form-note" style="color:#B3261E">Enter a serial number first.</p>';
        return;
      }
      outEl.innerHTML = '<p class="form-note" style="color:#2563EB">Querying anti-counterfeit registry…</p>';
      fetch(API + '/sn-check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ serial: serial }),
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (d) {
        // URD UR-17: VERIFIED GENUINE / NOT FOUND / SUSPECTED COUNTERFEIT
        var kind = d.result === 'valid' ? 'ok' : d.result === 'suspicious' ? 'suspect' : 'unknown';
        var title = kind === 'ok' ? 'Verified genuine' : kind === 'suspect' ? 'Suspected counterfeit' : 'Serial not found';
        var tone = kind === 'ok' ? ['#86EFAC', '#F0FDF4', '#16A34A', '#166534'] : ['#FCA5A5', '#FEF2F2', '#DC2626', '#991B1B'];
        // warranty status is shown only to the owner (serial + e-mail), never here
        var warranty = d.warrantyLookup ? '<p class="form-note" style="margin:6px 0 0"><a href="/support/warranty">Check or register this product’s warranty →</a></p>' : '';
        outEl.innerHTML =
          '<div style="border:1px solid ' + tone[0] + ';background:' + tone[1] + ';text-align:left;padding:14px;border-radius:8px">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:' + tone[2] + ';color:#FFFFFF;font-weight:700;font-size:14px">' + (kind === 'ok' ? '✓' : '!') + '</span>' +
          '<strong style="font-size:15px;color:' + tone[3] + '">' + esc(d.serial || serial) + ' — ' + title + '</strong>' +
          '</div>' +
          (d.sku ? '<p class="form-note" style="margin:2px 0 6px">SKU: <strong>' + esc(d.sku) + '</strong>' + (d.manufacturedAt ? ' · Manufactured ' + esc(String(d.manufacturedAt).slice(0, 10)) : '') + '</p>' : '') +
          '<p style="font-size:13.5px;color:#334155;margin:0;line-height:1.5">' + esc(d.advice) + '</p>' +
          warranty +
          (kind !== 'ok' ? '<div style="margin-top:8px"><a href="/contact" style="color:#DC2626;font-size:13px;font-weight:600;text-decoration:underline">Report suspicious hardware to brand protection →</a></div>' : '') +
          '</div>';
      }).catch(function () {
        outEl.innerHTML = '<p class="form-note" style="color:#B3261E">Verification is unavailable right now — please retry.</p>';
      });
    }

    var snForm = document.getElementById('snForm');
    var snInput = document.getElementById('snInput');
    if (snForm && snInput) {
      var out = document.getElementById('snOut') || snForm.parentElement;
      snForm.addEventListener('submit', function (e) {
        e.preventDefault();
        executeSnCheck((snInput.value || '').trim(), out);
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      wireRmaTracker();
      wireSnCheck();
    });
  } else {
    wireRmaTracker();
    wireSnCheck();
  }
})();
