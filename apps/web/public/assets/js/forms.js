/* P2 form wiring — connects the prototype's client-side forms to the real API.
 * Port-only layer (prototype app.js stays byte-identical): capture-phase submit
 * interception so the prototype's fake-success handler never fires for wired
 * forms. Falls back to inline validation states; renders the same .form-success
 * markup the prototype uses. No visual change until a visitor submits.
 *
 * Wiring map (page path → registry type):
 *   /contact.html → contact · /quote.html → quote · /careers.html → job-application
 *   #rmaForm → rma (creates a real RMA case) · #nlForm → newsletter (every page)
 * The partner-portal demo sign-in form is intentionally NOT wired (demo only).
 */
(function () {
  'use strict';

  var API = window.TWINMOS_API || '/api/v1';
  if (API.charAt(API.length - 1) === '/') API = API.slice(0, -1);

  var PAGE_TYPE = { '/contact.html': 'contact', '/quote.html': 'quote', '/careers.html': 'job-application' };
  /** RMA intake field names (shared rmaIntakeSchema) mapped from form labels. */
  var KEY_ALIASES = {
    'full name': 'name', 'email': 'email', 'e-mail': 'email', 'email address': 'email',
    'business email': 'email', 'contact name': 'name',
    'phone': 'phone', 'phone (with country code)': 'phone',
    'country': 'country', 'country / region': 'country', 'country region': 'country',
    'product': 'product', 'serial / part number': 'serial', 'serial': 'serial',
    'issue description': 'issue', 'message': 'message', 'topic': 'topic',
    'company': 'company', 'company / organization': 'company',
    'product interest': 'productInterest', 'estimated quantity': 'quantity',
    'requirement details': 'details',
    'position applied for': 'position', 'preferred department': 'department',
    'preferred location': 'location', 'employment type': 'employmentType',
    'years of experience': 'experienceYears', 'notice period': 'noticePeriod',
    'highest education': 'education', 'linkedin / portfolio url': 'portfolio',
    'how did you hear about us?': 'source', 'cover letter — why , why this role?': 'coverLetter',
    'privacy consent': '_consent',
  };

  function normLabel(text) {
    return String(text || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function keyFor(label) {
    var n = normLabel(label);
    if (KEY_ALIASES[n]) return KEY_ALIASES[n];
    return n.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'field';
  }

  function typeForForm(form) {
    if (form.id === 'rmaForm') return 'rma';
    if (form.id === 'nlForm') return 'newsletter';
    var success = form.getAttribute('data-success') || '';
    if (success.indexOf('Demo sign-in') !== -1) return null; // portal demo — leave to prototype
    if (form.hasAttribute('data-tm-form')) return PAGE_TYPE[location.pathname] || null;
    return null;
  }

  function collect(form) {
    var payload = {};
    var email = '';
    var name = '';
    var consentChecked = null;
    Array.prototype.forEach.call(form.querySelectorAll('.fg'), function (fg) {
      var label = fg.querySelector('label');
      var ctl = fg.querySelector('input, select, textarea');
      if (!ctl) return;
      var key = keyFor(label ? label.textContent : '');
      var value = ctl.type === 'checkbox' ? (ctl.checked ? 'yes' : '') : String(ctl.value || '').trim();
      if (key === '_consent') { consentChecked = ctl.checked; return; }
      if (!value) return;
      payload[key] = value.slice(0, 4000);
      if (key === 'email') email = value;
      if (key === 'name') name = value;
    });
    // footer/newsletter inline form
    var nl = form.querySelector('#nlEmail');
    if (nl) { email = nl.value.trim(); }
    return { payload: payload, email: email, name: name, consentChecked: consentChecked };
  }

  function validate(form) {
    var ok = true;
    Array.prototype.forEach.call(form.querySelectorAll('.fg[data-req]'), function (fg) {
      var ctl = fg.querySelector('input, select, textarea');
      var v = ctl ? String(ctl.value || '').trim() : '';
      var bad = !v;
      if (!bad && ctl.type === 'email') bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      var min = fg.getAttribute('data-min');
      if (!bad && min && v.length < Number(min)) bad = true;
      fg.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    return ok;
  }

  function showSuccess(form, message) {
    var box = form.closest('[data-form-box]') || form.parentElement;
    form.style.display = 'none';
    var ok = document.createElement('div');
    ok.className = 'form-success show';
    ok.innerHTML = '<div class="tick">✓</div><h3>Submitted</h3><p></p>';
    ok.querySelector('p').textContent = message; // textContent: payload never enters innerHTML
    box.appendChild(ok);
  }
  function showError(form, message) {
    var old = form.querySelector('.tm-api-error');
    if (old) old.remove();
    var p = document.createElement('p');
    p.className = 'tm-api-error';
    p.setAttribute('role', 'alert');
    p.style.cssText = 'color:#B3261E;font-size:13.5px;margin:10px 0 0';
    p.textContent = message;
    form.appendChild(p);
  }

  /* Turnstile (optional): when a site key is configured, render the widget into
   * each wired form once; the token is read from the hidden response input. */
  var turnstileReady = null;
  function ensureTurnstile(form) {
    var key = window.TURNSTILE_SITE_KEY;
    if (!key || form.querySelector('.cf-turnstile')) return Promise.resolve(null);
    if (!turnstileReady) {
      turnstileReady = new Promise(function (resolve) {
        var s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.onload = function () { resolve(window.turnstile || null); };
        s.onerror = function () { resolve(null); };
        document.head.appendChild(s);
      });
    }
    return turnstileReady.then(function (ts) {
      if (!ts) return null;
      var holder = document.createElement('div');
      holder.className = 'cf-turnstile';
      form.appendChild(holder);
      ts.render(holder, { sitekey: key });
      return holder;
    });
  }
  function turnstileToken(form) {
    var el = form.querySelector('[name="cf-turnstile-response"]');
    return el ? el.value : undefined;
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.nodeName !== 'FORM') return;
    var type = typeForForm(form);
    if (!type) return;

    e.preventDefault();
    e.stopPropagation(); // prototype fake-success handler must not run

    if (!validate(form)) return;
    var data = collect(form);
    if (!data.email) { showError(form, 'Please provide your email address.'); return; }
    if (data.consentChecked === false) { showError(form, 'Please accept the privacy notice to continue.'); return; }

    var btn = form.querySelector('button[type="submit"], .btn');
    var busy = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    var body = {
      type: type,
      email: data.email,
      payload: data.payload,
      consent: true, // UI carries an explicit checkbox where the prototype provides one; documented for forms whose prototype UI lacks it
      ...(turnstileToken(form) ? { turnstileToken: turnstileToken(form) } : {}),
    };

    fetch(API + '/forms/' + type, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then(function (res) {
      if (res.ok) return res.json().then(function (out) { return out; });
      return res.json().catch(function () { return {}; }).then(function (problem_) {
        var detail = (problem_ && problem_.detail) || (problem_ && problem_.title) || ('HTTP ' + res.status);
        throw new Error(detail);
      });
    }).then(function (out) {
      var msg = form.getAttribute('data-success') || 'Thank you — the TwinMOS team will reply within one business day.';
      if (type === 'rma' && out && out.rmaNumber) {
        msg = 'RMA request received. Your RMA number is ' + out.rmaNumber + ' — a confirmation email with shipping instructions is on its way.';
      }
      if (type === 'newsletter' && form.id === 'nlForm') {
        form.innerHTML = '';
        var chip = document.createElement('span');
        chip.className = 'chip ok';
        chip.textContent = '✓ Subscribed — welcome aboard';
        form.appendChild(chip);
        return;
      }
      showSuccess(form, msg);
    }).catch(function (err) {
      if (btn) { btn.disabled = false; btn.textContent = busy; }
      showError(form, 'We could not send your submission (' + (err && err.message ? err.message : 'network error') + '). Please try again in a moment.');
    });
  }, true); // capture: runs before the prototype's bubble-phase handlers

  /* RMA tracker: synchronous interception (async stopImmediatePropagation is
   * impossible) — if the API answers, render the real timeline; if not, re-click
   * through to the prototype's demo handler unchanged. */
  var trackBtn = document.getElementById('rmaTrackBtn');
  if (trackBtn) {
    trackBtn.addEventListener('click', function (e) {
      if (trackBtn.getAttribute('data-tm-native') === '1') return; // fallback pass-through
      var id = (document.getElementById('rmaId').value || '').trim().toUpperCase();
      if (!id) return; // let the prototype validate the empty field
      e.preventDefault();
      e.stopImmediatePropagation(); // claim the click BEFORE the prototype handler
      fetch(API + '/rma/' + encodeURIComponent(id)).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (rma) {
        var out = document.getElementById('rmaOut');
        if (!out) return;
        var html = '<div class="form-success show" style="text-align:left"><div class="tick">✓</div><h3>' + rma.number + ' — ' + String(rma.status).replace(/_/g, ' ') + '</h3>';
        html += '<p>Requested for ' + (rma.maskedInfo && rma.maskedInfo.product ? String(rma.maskedInfo.product) : 'your product') + '</p><ol style="margin:8px 0 0;padding-left:18px;font-size:13.5px">';
        (rma.timeline || []).forEach(function (ev) {
          html += '<li>' + (ev.from === ev.to ? 'Case created — ' + String(ev.to).replace(/_/g, ' ') : String(ev.from).replace(/_/g, ' ') + ' → <b>' + String(ev.to).replace(/_/g, ' ') + '</b>') + (ev.note ? ' · ' + ev.note : '') + '</li>';
        });
        html += '</ol></div>';
        out.innerHTML = html;
      }).catch(function () {
        // API unavailable → hand the click to the prototype's demo tracker
        trackBtn.setAttribute('data-tm-native', '1');
        trackBtn.click();
        trackBtn.removeAttribute('data-tm-native');
      });
    }, true);
  }

  // Pre-render Turnstile widgets when a site key is configured (production).
  if (window.TURNSTILE_SITE_KEY) {
    var init = function () {
      Array.prototype.forEach.call(document.querySelectorAll('form[data-tm-form], #rmaForm'), function (f) {
        if (typeForForm(f)) ensureTurnstile(f);
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
