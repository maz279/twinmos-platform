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

  var API = window.TWINMOS_API || (typeof window !== 'undefined' && window.location.port === '4321' ? 'http://127.0.0.1:8787/api/v1' : '/api/v1');
  if (API.charAt(API.length - 1) === '/') API = API.slice(0, -1);

  // Clean URLs are canonical; .html aliases are 301s. Normalise both.
  var PAGE_TYPE = { '/contact': 'contact', '/quote': 'quote', '/careers': 'job-application', '/partners': 'partner-inquiry' };
  function cleanPath(p) { return String(p || '/').replace(/\.html$/i, '').replace(/\/$/, '') || '/'; }
  /** RMA intake field names (shared rmaIntakeSchema) mapped from form labels. */
  var KEY_ALIASES = {
    'full name': 'name', 'email': 'email', 'e-mail': 'email', 'email address': 'email',
    'business email': 'email', 'contact name': 'name', 'partner email': 'email',
    'phone': 'phone', 'phone (with country code)': 'phone',
    'country': 'country', 'country / region': 'country', 'country region': 'country',
    'product': 'product', 'serial / part number': 'serial', 'serial': 'serial',
    'issue description': 'issue', 'message': 'message', 'topic': 'topic',
    'company': 'company', 'company / organization': 'company',
    'product interest': 'productInterest', 'estimated quantity': 'quantity',
    'requirement details': 'details', 'channel type': 'channelType',
    'position applied for': 'position', 'preferred department': 'department',
    'preferred location': 'location', 'employment type': 'employmentType',
    'years of experience': 'experienceYears', 'notice period': 'noticePeriod',
    'highest education': 'education', 'linkedin / portfolio url': 'portfolio',
    'how did you hear about us?': 'source', 'cover letter — why , why this role?': 'coverLetter',
    'privacy consent': '_consent',
  };

  /** Careers picks the registry type from the Position select (General Application → own type). */
  function careersType(payload) {
    return String(payload.position || '').toLowerCase().indexOf('general application') !== -1
      ? 'general-application' : 'job-application';
  }

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
    var explicit = form.getAttribute('data-form-type');
    if (explicit) return explicit;
    if (form.hasAttribute('data-tm-form')) return PAGE_TYPE[cleanPath(location.pathname)] || null;
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
      // Prefer the explicit name attribute (CMS form definitions); fall back to
      // the legacy prototype label mapping.
      var key = ctl.name ? (ctl.name === 'consent' ? '_consent' : ctl.name) : keyFor(label ? label.textContent : '');
      var value = ctl.type === 'checkbox' ? (ctl.checked ? 'yes' : '') : String(ctl.value || '').trim();
      if (key === '_consent') { consentChecked = ctl.checked; return; }
      if (!value) return;
      payload[key] = value.slice(0, 4000);
      if (key === 'email' || key === 'customerEmail' || key === 'emailAddress' || (!email && ctl.type === 'email')) {
        email = value;
        payload.email = value;
      }
      if (key === 'name' || key === 'customerName' || key === 'fullName') {
        name = value;
        payload.name = value;
      }
      if (key === 'productModel' || key === 'model') {
        payload.product = value;
      }
      if (key === 'defectDescription' || key === 'faultDescription') {
        payload.issue = value;
      }
      if (key === 'serialNumber') {
        payload.serial = value;
      }
    });
    // footer/newsletter inline form
    var nl = form.querySelector('#nlEmail');
    if (nl) { email = nl.value.trim(); }
    return { payload: payload, email: email, name: name, consentChecked: consentChecked };
  }

  var errSeq = 0;

  function ensurePrivacyNotice(form) {
    if (form.querySelector('.form-privacy-notice, [data-form-privacy-notice], [data-newsletter-notice]')) return;
    var p = document.createElement('p');
    p.className = 'form-privacy-notice form-note';
    p.setAttribute('data-form-privacy-notice', '1');
    p.style.cssText = 'font-size:12px;color:#4E6579;margin-top:10px;line-height:1.4';
    p.innerHTML = 'By submitting, you agree to the <a href="/legal?tab=privacy" style="color:#00729C;text-decoration:underline">TwinMOS Privacy Policy</a>. Your data is protected.';
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.parentElement) {
      submitBtn.parentElement.insertBefore(p, submitBtn);
    } else {
      form.appendChild(p);
    }
  }

  var errSeq = 0;

  function ensurePrivacyNotice(form) {
    if (form.querySelector('.form-privacy-notice, [data-form-privacy-notice], [data-newsletter-notice]')) return;
    var p = document.createElement('p');
    p.className = 'form-privacy-notice form-note';
    p.setAttribute('data-form-privacy-notice', '1');
    p.style.cssText = 'font-size:12px;color:#4E6579;margin-top:10px;line-height:1.4';
    p.innerHTML = 'By submitting, you agree to the <a href="/legal?tab=privacy" style="color:#00729C;text-decoration:underline">TwinMOS Privacy Policy</a>. Your data is protected.';
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.parentElement) {
      submitBtn.parentElement.insertBefore(p, submitBtn);
    } else {
      form.appendChild(p);
    }
  }

  function validate(form) {
    ensurePrivacyNotice(form);
    ensurePrivacyNotice(form);
    var ok = true;
    Array.prototype.forEach.call(form.querySelectorAll('.fg[data-req]'), function (fg) {
      var ctl = fg.querySelector('input, select, textarea');
      var v = ctl ? String(ctl.value || '').trim() : '';
      var bad = !v;
      if (!bad && ctl.type === 'email') bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      var min = fg.getAttribute('data-min');
      if (!bad && min && v.length < Number(min)) bad = true;
      fg.classList.toggle('invalid', bad);
      if (ctl) {
        if (bad) {
          ctl.setAttribute('aria-invalid', 'true');
        } else {
          ctl.removeAttribute('aria-invalid');
        }
      }
      if (bad) ok = false;
    });
    var consent = form.querySelector('input[name="consent"]');
    if (consent && !consent.checked) {
      showError(form, 'Please accept the privacy notice to continue.');
      ok = false;
    }
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
    var errId = 'form-err-' + (++errSeq);
    p.id = errId;
    p.textContent = message;
    form.appendChild(p);
    form.setAttribute('aria-describedby', errId);
  }

  /* Turnstile (optional): when a site key is configured, render the widget into
   * each wired form once; the token is read from the hidden response input. */
  var turnstileReady = null;
  function ensureTurnstile(form) {
    var key = window.TURNSTILE_SITE_KEY;
    // Skip the placeholder key shipped in the default settings; rendering it
    // produces a Cloudflare 400020 error on every quote page.
    if (!key || key === '0x4AAAAAAAx' || form.querySelector('.cf-turnstile')) return Promise.resolve(null);
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

  var pageLoadedAt = Date.now();
  function fetchFormToken() {
    if (window.__TM_FORM_TOKEN__) return;
    try {
      fetch(API + '/forms/token').then(function (r) {
        if (r && r.ok) return r.json();
      }).then(function (data) {
        if (data && data.token) {
          window.__TM_FORM_TOKEN__ = data.token;
          Array.prototype.forEach.call(document.querySelectorAll('form'), function (f) {
            var inp = f.querySelector('[name="formToken"]');
            if (inp && !inp.value) inp.value = data.token;
          });
        }
      }).catch(function () {});
    } catch (_) {}
  }
  function tagForms() {
    Array.prototype.forEach.call(document.querySelectorAll('form'), function (f) {
      if (!f.hasAttribute('data-loaded-at')) f.setAttribute('data-loaded-at', String(Date.now()));
    });
    fetchFormToken();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tagForms);
  else tagForms();

  function getUtmParams() {
    var utm = {};
    try {
      var sp = new URLSearchParams(window.location.search);
      var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      keys.forEach(function (k) {
        var v = sp.get(k);
        if (v) utm[k] = v.slice(0, 200);
      });
      if (Object.keys(utm).length > 0) {
        sessionStorage.setItem('tm_utm', JSON.stringify(utm));
      } else {
        var saved = sessionStorage.getItem('tm_utm');
        if (saved) utm = JSON.parse(saved);
      }
    } catch (_) {}
    return utm;
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
      type: type === 'job-application' ? careersType(data.payload) : type,
      email: data.email,
      payload: Object.assign({}, data.payload, (typeof getUtmParams === 'function' ? getUtmParams() : {})),
      leadSource: (function () {
        var u = typeof getUtmParams === 'function' ? getUtmParams() : {};
        return u.utm_source ? (u.utm_source + (u.utm_medium ? ' / ' + u.utm_medium : '')) : (document.referrer ? 'referrer: ' + document.referrer.slice(0, 100) : 'direct');
      })(),
      utm: typeof getUtmParams === 'function' ? getUtmParams() : {},
      fillTimeMs: Math.max(0, Date.now() - (form.getAttribute('data-loaded-at') ? Number(form.getAttribute('data-loaded-at')) : (pageLoadedAt || Date.now()))),
      ...(((form.querySelector('[name="hp"]') || form.querySelector('[name="website"]') || {}).value) ? { hp: (form.querySelector('[name="hp"]') || form.querySelector('[name="website"]')).value } : {}),
      ...(((form.querySelector('[name="formToken"]') || {}).value || window.__TM_FORM_TOKEN__) ? { formToken: (form.querySelector('[name="formToken"]') || {}).value || window.__TM_FORM_TOKEN__ } : {}),
      // Z-19 Fix: NEVER send consent: true on a form that has no consent checkbox.
      consent: data.consentChecked === true,
      ...(turnstileToken(form) ? { turnstileToken: turnstileToken(form) } : {}),
    };

    fetch(API + '/forms/' + body.type, {
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
      // P6 (ADR-009): surface the ticket reference after submit (post-action
      // only — zero pixels change at rest; the same reference is in the
      // auto-reply email).
      if (type !== 'rma' && out && out.reference) {
        msg = msg + ' Your reference: ' + out.reference + '.';
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

  /* "Was this helpful?" (learn/news detail pages): votes are stored for real by
   * POST /forms/content-feedback (ZT-034). RMA tracking lives in portal.js. */
  Array.prototype.forEach.call(document.querySelectorAll('.btn-helpful[data-slug]'), function (b) {
    b.addEventListener('click', function () {
      var box = document.getElementById('feedbackActions');
      var msg = document.getElementById('feedbackMsg');
      var entity = /^\/news\//.test(location.pathname) ? 'news' : 'article';
      Array.prototype.forEach.call(document.querySelectorAll('.btn-helpful'), function (x) { x.disabled = true; });
      fetch(API + '/forms/content-feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entity: entity, slug: b.getAttribute('data-slug'), helpful: b.getAttribute('data-vote') === 'yes', locale: document.documentElement.lang || 'en' }),
      }).then(function (r) {
        if (msg) { msg.style.display = 'block'; msg.style.color = r.ok ? '#16a34a' : '#B3261E'; msg.textContent = r.ok ? 'Thank you for your feedback.' : 'Your feedback could not be recorded — please try again later.'; }
        if (r.ok && box) box.style.display = 'none';
        if (!r.ok) Array.prototype.forEach.call(document.querySelectorAll('.btn-helpful'), function (x) { x.disabled = false; });
      }).catch(function () {
        if (msg) { msg.style.display = 'block'; msg.style.color = '#B3261E'; msg.textContent = 'Your feedback could not be recorded — please try again later.'; }
        Array.prototype.forEach.call(document.querySelectorAll('.btn-helpful'), function (x) { x.disabled = false; });
      });
    });
  });

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
