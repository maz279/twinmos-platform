import fs from 'node:fs';

const filePath = 'apps/web/public/assets/js/forms.js';
let content = fs.readFileSync(filePath, 'utf8');

const isCrlf = content.includes('\r\n');
let normalized = content.replace(/\r\n/g, '\n');

const oldValidate = `  function validate(form) {`;
const newValidate = `  var errSeq = 0;

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
    ensurePrivacyNotice(form);`;

const oldToggle = `      fg.classList.toggle('invalid', bad);
      if (bad) ok = false;`;
const newToggle = `      fg.classList.toggle('invalid', bad);
      if (ctl) {
        if (bad) {
          ctl.setAttribute('aria-invalid', 'true');
        } else {
          ctl.removeAttribute('aria-invalid');
        }
      }
      if (bad) ok = false;`;

const oldErr = `    p.textContent = message;
    form.appendChild(p);
  }`;
const newErr = `    var errId = 'form-err-' + (++errSeq);
    p.id = errId;
    p.textContent = message;
    form.appendChild(p);
    form.setAttribute('aria-describedby', errId);
  }`;

if (!normalized.includes(oldValidate)) {
  console.error('oldValidate not found in forms.js');
  process.exit(1);
}
normalized = normalized.replace(oldValidate, newValidate);
normalized = normalized.replace(oldToggle, newToggle);
normalized = normalized.replace(oldErr, newErr);

if (isCrlf) {
  normalized = normalized.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, normalized, 'utf8');
console.log('Successfully patched forms.js with accessible error states and privacy notice enforcement.');
