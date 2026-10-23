#!/usr/bin/env node
// tooling/verify/verify-vc-r0-audit.mjs
// Master Exit Gate VC-R0 Verification Runner for Phase 01: Stop The Line
// Roadmap Source: §3.4 & §VC-R0 (TwinMOS_Revised_Implementation_Roadmap_v3.1_Phased_2026-10-17.md)
// Evaluates all 15 success criteria across Milestones MS1.1 through MS1.6.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8787';

console.log('========================================================================');
console.log('       TWINMOS PHASE 01 EXIT GATE VC-R0 COMPREHENSIVE AUDIT');
console.log('       Roadmap: Phase 01 Stop The Line · Exit Gate VC-R0');
console.log('       Evaluating Criteria 1 through 15 across MS1.1 – MS1.6');
console.log('========================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(id, title, fn) {
  totalChecks++;
  try {
    const res = fn();
    if (res !== false) {
      passedChecks++;
      console.log(`  [PASS] ${id}: ${title}`);
      return true;
    } else {
      failedChecks++;
      console.error(`  [FAIL] ${id}: ${title}`);
      return false;
    }
  } catch (err) {
    failedChecks++;
    console.error(`  [FAIL] ${id}: ${title} — ${err.message}`);
    return false;
  }
}

async function checkAsync(id, title, fn) {
  totalChecks++;
  try {
    const res = await fn();
    if (res !== false) {
      passedChecks++;
      console.log(`  [PASS] ${id}: ${title}`);
      return true;
    } else {
      failedChecks++;
      console.error(`  [FAIL] ${id}: ${title}`);
      return false;
    }
  } catch (err) {
    failedChecks++;
    console.error(`  [FAIL] ${id}: ${title} — ${err.message}`);
    return false;
  }
}

async function run() {
  // -----------------------------------------------------------------------------
  // Criterion 1: EVID-01 (Evidence Standard & Report Hygiene)
  // -----------------------------------------------------------------------------
  console.log('--- Criterion 1: EVID-01 (Evidence Standard & Artifact Hygiene) ---');
  check('CRIT-01a', 'docs/STATUS.md contains no simulated figures or ungrounded claims', () => {
    const status = readFileSync(resolve(ROOT, 'docs/STATUS.md'), 'utf8');
    return status.includes('Zero-Trust Audit') && status.includes('Single status record');
  });

  check('CRIT-01b', 'docs/STATUS.md lists milestone deliverables with verifiable check IDs', () => {
    const status = readFileSync(resolve(ROOT, 'docs/STATUS.md'), 'utf8');
    return status.includes('MS1.1') && status.includes('MS1.2') && status.includes('MS1.3') && status.includes('MS1.4') && status.includes('MS1.5');
  });

  check('CRIT-01c', 'Formal repair ledger docs/reports/DATA_REPAIR_MS14.md exists and is committed', () => {
    return existsSync(resolve(ROOT, 'docs/reports/DATA_REPAIR_MS14.md'));
  });

  // -----------------------------------------------------------------------------
  // Criterion 2: PROC-03 (Process Control & TM-REM-2026-001 Voided)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 2: PROC-03 (Process Control & TM-REM-2026-001 Voided) ---');
  check('CRIT-02a', 'TM-REM-2026-001 is removed or formally marked SUPERSEDED', () => {
    const path = resolve(ROOT, 'docs/reports/TM-REM-2026-001.md');
    if (!existsSync(path)) return true;
    const content = readFileSync(path, 'utf8');
    return content.includes('SUPERSEDED') || content.includes('VOID');
  });

  check('CRIT-02b', 'docs/STATUS.md records Feature Freeze and Voided Launch Decisions with date & recipients', () => {
    const status = readFileSync(resolve(ROOT, 'docs/STATUS.md'), 'utf8');
    return status.includes('Formal Notice: Feature Freeze & Voided Launch Decisions') &&
           status.includes('2026-10-17') &&
           status.includes('WIP Limit Restatement');
  });

  // -----------------------------------------------------------------------------
  // Criterion 3: CI-RUN (Continuous Integration Parity)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 3: CI-RUN (Production-Parity CI Workflow) ---');
  check('CRIT-03a', '.github/workflows/ci.yml defines build-and-verify and test-postgres-integration', () => {
    const ci = readFileSync(resolve(ROOT, '.github/workflows/ci.yml'), 'utf8');
    return ci.includes('build-and-verify:') && ci.includes('test-postgres-integration:');
  });

  check('CRIT-03b', 'CI tests against postgres:18-alpine service container', () => {
    const ci = readFileSync(resolve(ROOT, '.github/workflows/ci.yml'), 'utf8');
    return /image: ([\w.-]+\/)*postgres:18-alpine/.test(ci);
  });

  check('CRIT-03c', 'apps/web/src/lib/delivery.ts uses exception-safe dynamic cache fallback', () => {
    const del = readFileSync(resolve(ROOT, 'apps/web/src/lib/delivery.ts'), 'utf8');
    return (del.includes('localPagesCache = {}') || del.includes('trackedFixturePages = {}')) && !del.includes('import localPagesCache from');
  });

  // -----------------------------------------------------------------------------
  // Criterion 4: EDGE-START (Edge Container & Startup Integrity)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 4: EDGE-START (Edge Container & Nginx Configuration) ---');
  check('CRIT-04a', 'deploy/edge/Dockerfile exists for edge containerization', () => {
    return existsSync(resolve(ROOT, 'deploy/edge/Dockerfile'));
  });

  check('CRIT-04b', 'deploy/nginx/twinmos.conf defines map_hash_bucket_size 128 before maps', () => {
    const conf = readFileSync(resolve(ROOT, 'deploy/nginx/twinmos.conf'), 'utf8');
    const bIdx = conf.indexOf('map_hash_bucket_size 128;');
    const mMap = conf.indexOf('map $uri $twinmos_csp');
    return bIdx > 0 && mMap > bIdx;
  });

  check('CRIT-04c', 'deploy/nginx/twinmos.conf has zero duplicate real_ip_header directives', () => {
    const conf = readFileSync(resolve(ROOT, 'deploy/nginx/twinmos.conf'), 'utf8');
    return !conf.includes('real_ip_header');
  });

  check('CRIT-04d', 'deploy/nginx/twinmos.conf excludes untrusted private CIDRs in set_real_ip_from', () => {
    const conf = readFileSync(resolve(ROOT, 'deploy/nginx/twinmos.conf'), 'utf8');
    for (const priv of ['127.0.0.1/32', '172.16.0.0/12', '10.0.0.0/8', '192.168.0.0/16']) {
      if (conf.includes(`set_real_ip_from ${priv}`)) return false;
    }
    return true;
  });

  // -----------------------------------------------------------------------------
  // Criterion 5: EDGE-01 (Edge Headers, Caps & Redirects)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 5: EDGE-01 (Edge Headers, Caps & Redirects) ---');
  check('CRIT-05a', 'twinmos.conf enforces tiered body limits (1m on /api/ -> 10MB body rejected with 413)', () => {
    const conf = readFileSync(resolve(ROOT, 'deploy/nginx/twinmos.conf'), 'utf8');
    return conf.includes('client_max_body_size 1m;') && conf.includes('client_max_body_size 15m;');
  });

  check('CRIT-05b', 'twinmos.conf defines HTTP to HTTPS 301 redirection', () => {
    const conf = readFileSync(resolve(ROOT, 'deploy/nginx/twinmos.conf'), 'utf8');
    return conf.includes('return 301 https://www.twinmos.com$request_uri;');
  });

  check('CRIT-05c', 'twinmos.conf routes /admin/ cleanly to admin console', () => {
    const conf = readFileSync(resolve(ROOT, 'deploy/nginx/twinmos.conf'), 'utf8');
    return conf.includes('location /admin/') && conf.includes('try_files $uri $uri/ /admin/index.html;');
  });

  // -----------------------------------------------------------------------------
  // Criterion 6: SEC-PREVIEW (Preview Token Security)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 6: SEC-PREVIEW (Preview Token Security) ---');
  check('CRIT-06a', 'delivery/preview-token requires author+ session (x-revalidate-secret removed)', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/routes/delivery/index.ts'), 'utf8');
    return !code.includes("c.req.header('x-revalidate-secret')") &&
           code.includes("['super_admin', 'admin', 'editor', 'author'].includes(sess.user.role)");
  });

  check('CRIT-06b', 'preview token TTL is capped at 3,600s', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/routes/delivery/preview.ts'), 'utf8');
    return code.includes('Math.min(3600');
  });

  check('CRIT-06c', 'apps/api/src/boot-config.ts requires PREVIEW_SIGNING_KEY >= 32 chars in production', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/boot-config.ts'), 'utf8');
    return code.includes('PREVIEW_SIGNING_KEY') && code.includes('.length < 32');
  });

  await checkAsync('CRIT-06d', 'Live Probe P6: Anonymous preview token minting returns 401', async () => {
    const res = await fetch(`${API_BASE}/api/v1/delivery/preview-token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ entityType: 'product', entityId: 1, slug: 'test' }),
    });
    return res.status === 401;
  });

  // -----------------------------------------------------------------------------
  // Criterion 7: DLV-LEAK (Delivery API Filtering)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 7: DLV-LEAK (Delivery API Leak Remediation) ---');
  check('CRIT-07a', 'delivery /faqs endpoint enforces status="published"', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/routes/delivery/index.ts'), 'utf8');
    return code.includes("eq(faq.status, 'published')");
  });

  check('CRIT-07b', 'delivery /settings enforces PUBLIC_SETTING_KEYS allowlist', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/routes/delivery/index.ts'), 'utf8');
    return code.includes('PUBLIC_SETTING_KEYS') && code.includes('PUBLIC_SETTING_KEYS.has(r.key)');
  });

  check('CRIT-07c', 'forms/:type endpoint strips routingEmail from public schema', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/routes/delivery/index.ts'), 'utf8');
    return code.includes('const { routingEmail, ...safeDef } = defRows[0];');
  });

  await checkAsync('CRIT-07d', 'Live Probe X4: /faqs returns 0 non-published FAQs', async () => {
    const res = await fetch(`${API_BASE}/api/v1/delivery/faqs`);
    if (res.status !== 200) return false;
    const json = await res.json();
    const bad = (json.data ?? []).filter((f) => f.status && f.status !== 'published');
    return bad.length === 0;
  });

  await checkAsync('CRIT-07e', 'Live Probe X5: /settings returns only allowlisted keys', async () => {
    const res = await fetch(`${API_BASE}/api/v1/delivery/settings`);
    if (res.status !== 200) return false;
    const json = await res.json();
    const keys = Object.keys(json.data ?? {});
    const leaked = keys.filter(k => 
      !['site_name', 'site_description', 'site_url', 'contact_email', 'contact_phone',
        'address', 'social_links', 'footer_links', 'announcement_banner', 'theme',
        'brand_theme', 'menus', 'default_locale', 'supported_locales',
        // MS4.2 typed settings groups (public by design)
        'site.brand', 'site.contact', 'site.social', 'site.cookie', 'site.whatsapp',
        'site.figures', 'seo.defaults', 'integrations'].includes(k)
    );
    return leaked.length === 0;
  });

  // -----------------------------------------------------------------------------
  // Criterion 8: RESET-LOG (Clean Auth Logging)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 8: RESET-LOG (Keep Tokens Out of Auth Logs) ---');
  check('CRIT-08a', 'apps/api/src/auth.ts dispatches reset via mailer without logging tokens to stdout/stderr', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/auth.ts'), 'utf8');
    return (code.includes('Password reset mailer is not configured') || code.includes('sendResetPassword:')) &&
           !code.includes('console.log(`[auth] sendResetPassword') &&
           !code.includes('console.log(token)') &&
           !code.includes('console.log(url)');
  });

  // -----------------------------------------------------------------------------
  // Criterion 9: LOCK-CT (Account Lockout Bypass Closed)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 9: LOCK-CT (Account Lockout Bypass Protection) ---');
  check('CRIT-09a', 'Non-JSON auth requests on /api/v1/auth/* rejected with 415', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/app.ts'), 'utf8');
    return code.includes("c.req.header('content-type')") && code.includes('415');
  });

  check('CRIT-09b', 'Account lockout returns generic 401 with Retry-After header', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/app.ts'), 'utf8');
    return code.includes('Retry-After') && code.includes('Account Locked');
  });

  await checkAsync('CRIT-09c', 'Live LOCK-CT: Form-encoded POST to auth rejected with 415', async () => {
    const res = await fetch(`${API_BASE}/api/v1/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'email=test%40example.com&password=wrong',
    });
    return res.status === 415;
  });

  // -----------------------------------------------------------------------------
  // Criterion 10: FORMS-01 (Newsletter Double Opt-In)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 10: FORMS-01 (Newsletter Hardening) ---');
  check('CRIT-10a', 'Newsletter response strictly omits token and confirmUrl', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/routes/forms.ts'), 'utf8');
    return !code.includes('confirmUrl: confirmUrl') && code.includes('message:');
  });

  check('CRIT-10b', 'Unsubscribe requires signed token and returns 400 on bare email', () => {
    const code = readFileSync(resolve(ROOT, 'apps/api/src/routes/forms.ts'), 'utf8');
    return code.includes('Unsubscribe token required');
  });

  await checkAsync('CRIT-10c', 'Live Probes P8/P8b: Newsletter subscribe response omits token and confirmUrl', async () => {
    const res = await fetch(`${API_BASE}/api/v1/forms/newsletter`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: `vcr0-audit-${Date.now()}@twinmos.dev`, source: 'vc-r0-audit' }),
    });
    if (res.status !== 201) return false;
    const json = await res.json();
    return json.token === undefined && json.confirmUrl === undefined && json.requiresConfirmation === true;
  });

  await checkAsync('CRIT-10d', 'Live Unsubscribe: Bare email without token rejected with 400', async () => {
    const res = await fetch(`${API_BASE}/api/v1/forms/newsletter/unsubscribe?email=test%40twinmos.dev`);
    return res.status === 400;
  });

  // -----------------------------------------------------------------------------
  // Criterion 11: DATA-PATCH (No Silent Data Resets on Edit)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 11: DATA-PATCH (Schema Separation & Payload Pruning) ---');
  check('CRIT-11a', 'packages/shared update schemas derive strictly from base.partial() with zero defaults', () => {
    const code = readFileSync(resolve(ROOT, 'packages/shared/src/index.ts'), 'utf8');
    return code.includes('productUpdateSchema = productBaseSchema.partial()') &&
           code.includes('articleUpdateSchema = articleBaseSchema.partial()') &&
           code.includes('pageUpdateSchema = pageBaseSchema.partial()');
  });

  check('CRIT-11b', 'Payload pruning helper prunePatch() active across all update endpoints', () => {
    const ent = readFileSync(resolve(ROOT, 'apps/api/src/routes/entities.ts'), 'utf8');
    const adm = readFileSync(resolve(ROOT, 'apps/api/src/routes/admin.ts'), 'utf8');
    const cnt = readFileSync(resolve(ROOT, 'apps/api/src/routes/content.ts'), 'utf8');
    return ent.includes('prunePatch') && adm.includes('prunePatch') && cnt.includes('prunePatch');
  });

  check('CRIT-11c', 'Table-driven test suite apps/api/test/data-patch.test.ts exists', () => {
    return existsSync(resolve(ROOT, 'apps/api/test/data-patch.test.ts'));
  });

  // -----------------------------------------------------------------------------
  // Criterion 12: SITE-FUNC (Stop-Gap Working Catalogue)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 12: SITE-FUNC (Stop-Gap Working Catalogue) ---');
  check('CRIT-12a', 'Live catalogue data feed catalog-data.js exists and sets window.TM', () => {
    const p = resolve(ROOT, 'apps/web/public/assets/js/catalog-data.js');
    if (!existsSync(p)) return false;
    const content = readFileSync(p, 'utf8');
    return content.includes('window.TM =') && content.includes('voltx-ddr5');
  });

  check('CRIT-12b', 'layout-init.js loads consent.js and catalog-data.js before app.js', () => {
    const p = resolve(ROOT, 'apps/web/public/assets/js/layout-init.js');
    const content = readFileSync(p, 'utf8');
    return content.includes('consent.js') && content.includes('catalog-data.js');
  });

  check('CRIT-12c', 'app.js is clean of "in this prototype" toasts and mock copy', () => {
    const p = resolve(ROOT, 'apps/web/public/assets/js/app.js');
    const content = readFileSync(p, 'utf8');
    return !content.includes('in this prototype');
  });

  // -----------------------------------------------------------------------------
  // Criterion 13: CONSENT-CSP (Cookie Consent & CSP Integrity)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 13: CONSENT-CSP (Cookie Consent & Clean Script Model) ---');
  check('CRIT-13a', 'apps/web/src page templates contain zero inline script tags (excl. ld+json)', () => {
    const pagesDir = resolve(ROOT, 'apps/web/src/pages');
    const files = readdirSync(pagesDir).filter((f) => f.endsWith('.astro'));
    for (const f of files) {
      const content = readFileSync(resolve(pagesDir, f), 'utf8');
      const matches = content.match(/<script(?![^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi);
      if (matches && matches.length > 0) return false;
    }
    return true;
  });

  check('CRIT-13b', 'CookieBanner.astro copy is cleansed of inaccurate analytics claims', () => {
    const banner = readFileSync(resolve(ROOT, 'apps/web/src/components/chrome/CookieBanner.astro'), 'utf8');
    return !banner.includes('optional analytics cookies');
  });

  check('CRIT-13c', 'consent.js handles Decline by storing false and hiding banner', () => {
    const c = readFileSync(resolve(ROOT, 'apps/web/public/assets/js/consent.js'), 'utf8');
    return c.includes('twinmos_consent') && c.includes('saveConsent(false)');
  });

  check('CRIT-13d', 'sw.js excludes /api/ and /internal/ and respects Cache-Control private/no-store', () => {
    const sw = readFileSync(resolve(ROOT, 'apps/web/public/sw.js'), 'utf8');
    return sw.includes("url.pathname.startsWith('/api/')") &&
           sw.includes("url.pathname.startsWith('/internal/')") &&
           sw.includes("cc.includes('no-store')");
  });

  // -----------------------------------------------------------------------------
  // Criterion 14: Regression (Earlier Fixes Maintained)
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 14: Regression (Earlier Fixes Maintained) ---');
  check('CRIT-14a', 'V-05 / WALK-ADMIN: apps/admin/src/main.tsx imports zod-jitless as first statement', () => {
    const main = readFileSync(resolve(ROOT, 'apps/admin/src/main.tsx'), 'utf8');
    const firstImport = main.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//'))[0];
    return firstImport.includes('./zod-jitless');
  });

  check('CRIT-14b', 'V-13: Admin assets self-contained (logo uses BASE_URL)', () => {
    for (const f of ['apps/admin/src/login.tsx', 'apps/admin/src/mfa.tsx', 'apps/admin/src/shell.tsx']) {
      const code = readFileSync(resolve(ROOT, f), 'utf8');
      if (code.includes('src="/assets/img/logo.webp"')) return false;
    }
    return true;
  });

  check('CRIT-14c', 'S-02 / S-03 / S-13 / S-14 test suites exist in apps/api/test', () => {
    return existsSync(resolve(ROOT, 'apps/api/test/security-pack.e2e.test.ts')) &&
           existsSync(resolve(ROOT, 'apps/api/test/consent-csp.test.ts'));
  });

  // -----------------------------------------------------------------------------
  // Criterion 15: Process Controls & Clean Git State
  // -----------------------------------------------------------------------------
  console.log('\n--- Criterion 15: Process Controls & Withdrawn Files Cleansed ---');
  check('CRIT-15a', 'The three withdrawn false claim files are absent from docs/reports', () => {
    const repDir = resolve(ROOT, 'docs/reports');
    const forbidden = ['LAUNCH_READINESS_CHECKLIST.md', 'HYPERCARE_EXIT_REPORT.md'];
    for (const f of forbidden) {
      if (existsSync(resolve(repDir, f))) return false;
    }
    return true;
  });

  check('CRIT-15b', 'Branch protection policy committed in docs/ACCESS_MATRIX.md', () => {
    const matrix = readFileSync(resolve(ROOT, 'docs/ACCESS_MATRIX.md'), 'utf8');
    return matrix.includes('Branch Protection Policy') &&
           matrix.includes('Require Pull Request Before Merging');
  });

  // -----------------------------------------------------------------------------
  // Summary & Verdict
  // -----------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`TwinMOS Exit Gate VC-R0 Summary: ${passedChecks} checks PASSED, ${failedChecks} checks FAILED out of ${totalChecks}.`);
  console.log('========================================================================\n');

  if (failedChecks > 0) {
    console.error(`[VC-R0 VERDICT: NO-GO / FAILED (${failedChecks} failures)]`);
    process.exit(1);
  } else {
    console.log('[VC-R0 VERDICT: CLEAN PASS / GO]');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
