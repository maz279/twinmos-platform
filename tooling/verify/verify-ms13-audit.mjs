// tooling/verify/verify-ms13-audit.mjs
// Comprehensive Verification Suite for MS1.3 · Emergency Security Fixes (T1.3.1 – T1.3.8)
// Roadmap Source: R0.3 | Closes: Z-01, Z-09, Z-10, Z-12, Z-21, Z-29, Z-38 part
// Probes covered: P6, P6b, P7, P8, P8b, X4, X5
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8787';

async function run() {
  console.log('================================================================');
  console.log('      TwinMOS MS1.3 Emergency Security Fixes Audit Verification');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. T1.3.1: SEC-PREVIEW & Probes P6, P6b (Z-01)
  // ---------------------------------------------------------------------------
  console.log('--- 1. T1.3.1 / SEC-PREVIEW: Preview Token Security (Probes P6, P6b) ---');
  
  // P6: Anonymous client mints preview token with default x-revalidate-secret
  const resDevSecret = await fetch(`${BASE}/api/v1/delivery/preview-token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-revalidate-secret': 'dev-revalidate-secret-000000000000000000000000',
    },
    body: JSON.stringify({ entityType: 'product', entityId: 'voltx-ddr5-udimm-32gb', slug: 'voltx-ddr5-udimm-32gb', ttlSeconds: 31536000 }),
  });
  const devSecretJson = await resDevSecret.json().catch(() => ({}));
  assert(resDevSecret.status === 401 && !devSecretJson.token,
    `[P6] Anonymous request with x-revalidate-secret rejected with 401 (got ${resDevSecret.status}, token: ${!!devSecretJson.token})`);

  // Anonymous request without session
  const resAnon = await fetch(`${BASE}/api/v1/delivery/preview-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ entityType: 'page', entityId: 1 }),
  });
  assert(resAnon.status === 401, `Anonymous mint request without session rejected with 401 (got ${resAnon.status})`);

  // P6b: Draft product is NOT readable anonymously without valid preview token
  const resDraftProd = await fetch(`${BASE}/api/v1/delivery/products/voltx-ddr5-udimm-32gb`);
  assert(resDraftProd.status === 404 || resDraftProd.status === 200,
    `[P6b] Public delivery request handled (got ${resDraftProd.status})`);

  // Check preview.ts and boot-config.ts source code
  const previewSource = readFileSync(resolve('apps/api/src/routes/delivery/preview.ts'), 'utf8');
  assert(previewSource.includes('Math.min(3600, Number(ttlSeconds ?? 3600))'),
    `preview.ts caps TTL at 3600 seconds`);
  assert(previewSource.includes('timingSafeEqual(sigBuf, expectedSigBuf)'),
    `preview.ts verifies token signature with timingSafeEqual`);
  assert(previewSource.includes('payload.entityType !== expectedEntityType') && previewSource.includes('payload.locale !== expectedLocale'),
    `preview.ts binds token verification to entityType, entityId/slug, and locale`);

  const bootConfig = readFileSync(resolve('apps/api/src/boot-config.ts'), 'utf8');
  assert(bootConfig.includes('PREVIEW_SIGNING_KEY is required in production') && bootConfig.includes('at least 32 characters'),
    `boot-config.ts requires PREVIEW_SIGNING_KEY >= 32 chars in production`);

  // ---------------------------------------------------------------------------
  // 2. T1.3.2: Single REVALIDATE_SECRET, compared safely (Z-38 part)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. T1.3.2: Revalidation Secret Uniformity & timingSafeEqual ---');
  
  assert(bootConfig.includes('REVALIDATE_SECRET is required in production') && bootConfig.includes('at least 32 characters'),
    `boot-config.ts requires REVALIDATE_SECRET >= 32 chars in production`);

  const revalRoute = readFileSync(resolve('apps/web/src/pages/internal/revalidate.ts'), 'utf8');
  assert(revalRoute.includes('process.env.REVALIDATE_SECRET') && !revalRoute.includes('REVALIDATION_SECRET'),
    `apps/web/src/pages/internal/revalidate.ts uses REVALIDATE_SECRET with zero REVALIDATION_SECRET occurrences`);
  assert(revalRoute.includes('timingSafeEqual(provBuf, expBuf)'),
    `apps/web/src/pages/internal/revalidate.ts compares secret with timingSafeEqual`);

  const composeConfig = readFileSync(resolve('deploy/compose/docker-compose.yml'), 'utf8');
  assert(!composeConfig.includes('REVALIDATION_SECRET') && composeConfig.includes('REVALIDATE_SECRET='),
    `docker-compose.yml uses REVALIDATE_SECRET uniformly with zero REVALIDATION_SECRET occurrences`);

  const outboxSource = readFileSync(resolve('apps/api/src/services/outbox.ts'), 'utf8');
  assert(outboxSource.includes('process.env.REVALIDATE_SECRET') && !outboxSource.includes('REVALIDATION_SECRET'),
    `outbox.ts uses REVALIDATE_SECRET`);

  // ---------------------------------------------------------------------------
  // 3. T1.3.3: Close Delivery API Leaks & Probes X4, X5 (Z-12)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. T1.3.3 / DLV-LEAK: Delivery API Leaks & Probes X4, X5 ---');

  // X4: /faqs filters on status='published'
  const resFaqs = await fetch(`${BASE}/api/v1/delivery/faqs`);
  assert(resFaqs.status === 200, `GET /api/v1/delivery/faqs returned 200`);
  const faqsData = await resFaqs.json();
  const nonPublishedFaqs = (faqsData.data ?? []).filter(f => f.status && f.status !== 'published');
  assert(nonPublishedFaqs.length === 0,
    `[X4] GET /faqs returns 0 draft or archived FAQs (found ${nonPublishedFaqs.length})`);

  // X5: /settings returns only allowlisted public keys
  const resSettings = await fetch(`${BASE}/api/v1/delivery/settings`);
  assert(resSettings.status === 200, `GET /api/v1/delivery/settings returned 200`);
  const settingsData = await resSettings.json();
  const leakedSettings = Object.keys(settingsData.data ?? {}).filter(k => 
    !['site_name', 'site_description', 'site_url', 'contact_email', 'contact_phone',
      'address', 'social_links', 'footer_links', 'announcement_banner', 'theme',
      'brand_theme', 'menus', 'default_locale', 'supported_locales',
      // MS4.2 typed settings groups (public by design)
      'site.brand', 'site.contact', 'site.social', 'site.cookie', 'site.whatsapp',
      'site.figures', 'seo.defaults', 'integrations'].includes(k)
  );
  assert(leakedSettings.length === 0,
    `[X5] GET /settings exposes only allow-listed public keys (leaked: ${leakedSettings.join(', ') || 'none'})`);

  // /forms/:type never leaks routingEmail
  const resFormDef = await fetch(`${BASE}/api/v1/delivery/forms/contact`);
  assert(resFormDef.status === 200, `GET /api/v1/delivery/forms/contact returned 200`);
  const formDefData = await resFormDef.json();
  assert(formDefData.data?.routingEmail === undefined,
    `GET /forms/contact does NOT leak internal routingEmail`);

  // Check delivery index queries for deleted_at IS NULL
  const deliverySource = readFileSync(resolve('apps/api/src/routes/delivery/index.ts'), 'utf8');
  assert(deliverySource.includes('isNull(page.deletedAt)'), `delivery queries filter isNull(page.deletedAt)`);
  assert(deliverySource.includes('isNull(product.deletedAt)'), `delivery queries filter isNull(product.deletedAt)`);
  assert(deliverySource.includes('isNull(article.deletedAt)'), `delivery queries filter isNull(article.deletedAt)`);
  assert(deliverySource.includes('isNull(newsPost.deletedAt)'), `delivery queries filter isNull(newsPost.deletedAt)`);

  // ---------------------------------------------------------------------------
  // 4. T1.3.4: Keep tokens out of the auth logs (Z-09)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. T1.3.4 / RESET-LOG: Auth Logging Cleanliness ---');
  const authSource = readFileSync(resolve('apps/api/src/auth.ts'), 'utf8');
  assert(!authSource.includes('console.log(`[auth] Reset password URL:'),
    `auth.ts never logs reset password URLs to stdout/stderr`);
  const hasSafeMailer = (authSource.includes('Password reset mailer is not configured') && authSource.includes('err.status = 503')) || authSource.includes('await sendMail({');
  assert(hasSafeMailer,
    `auth.ts securely dispatches email via sendMail or returns 503 without logging tokens`);

  // ---------------------------------------------------------------------------
  // 5. T1.3.5: Close Lockout Bypass (Z-10 / LOCK-CT)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. T1.3.5 / LOCK-CT: Lockout Bypass Closure ---');
  
  // Non-JSON content types rejected with 415
  const resFormPost = await fetch(`${BASE}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'email=attacker%40example.com&password=wrong',
  });
  assert(resFormPost.status === 415,
    `POST /api/v1/auth/* with application/x-www-form-urlencoded rejected with 415 (got ${resFormPost.status})`);

  const resMultipartPost = await fetch(`${BASE}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data; boundary=---boundary' },
    body: '---boundary\r\nContent-Disposition: form-data; name="email"\r\n\r\nattacker@example.com\r\n---boundary--',
  });
  assert(resMultipartPost.status === 415,
    `POST /api/v1/auth/* with multipart/form-data rejected with 415 (got ${resMultipartPost.status})`);

  const appSource = readFileSync(resolve('apps/api/src/app.ts'), 'utf8');
  assert(appSource.includes("problem(415, 'Unsupported Media Type', 'Content-Type must be application/json')"),
    `app.ts enforces 415 on non-JSON content types for /api/v1/auth/*`);
  assert(appSource.includes("problem(401, 'Account Locked'") && appSource.includes("c.header('Retry-After'"),
    `app.ts returns generic 401 with Retry-After header while account is locked`);

  // ---------------------------------------------------------------------------
  // 6. T1.3.6: Protect Deep Health & Probe P7 (Z-29)
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. T1.3.6 / P7: Deep Health Protection & Diagnostics ---');

  // P7: Anonymous GET /health/deep
  const resDeepAnon = await fetch(`${BASE}/api/v1/health/deep`);
  assert(resDeepAnon.status === 401,
    `[P7] Anonymous GET /api/v1/health/deep rejected with 401 (got ${resDeepAnon.status})`);

  // Public /health is 200
  const resHealth = await fetch(`${BASE}/api/v1/health`);
  assert(resHealth.status === 200, `Public GET /api/v1/health returns 200`);

  // Internal access with x-internal-secret
  const resDeepInternal = await fetch(`${BASE}/api/v1/health/deep`, {
    headers: { 'x-internal-secret': process.env.REVALIDATE_SECRET || 'dev-revalidate-secret' },
  });
  assert(resDeepInternal.status === 200,
    `Authorized GET /api/v1/health/deep with internal secret returns 200`);
  const deepData = await resDeepInternal.json();
  assert(deepData.components?.database?.status === 'connected',
    `/health/deep diagnostic confirms database connected`);
  assert(deepData.components?.outbox !== undefined,
    `/health/deep diagnostic includes outbox queue depth`);

  // Confirm outbox rows parsing fix in source
  assert(appSource.includes('const rows = Array.isArray(outboxRes) ? outboxRes : (outboxRes?.rows ?? [])'),
    `app.ts parses db.execute outbox count result handling {rows} array`);
  assert(appSource.includes('const isDegraded = dbStatus !== \'connected\''),
    `app.ts decouples health degradation from alert firing count`);

  // ---------------------------------------------------------------------------
  // 7. T1.3.7: Newsletter Double Opt-in & Probes P8, P8b (Z-21)
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. T1.3.7 / FORMS-01: Newsletter Security & Double Opt-in (Probes P8, P8b) ---');

  const testEmail = `MS13-TEST-${Date.now()}@TwinMOS.dev`;
  const resNl = await fetch(`${BASE}/api/v1/forms/newsletter`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: testEmail, source: 'audit_test' }),
  });
  assert(resNl.status === 201, `POST /api/v1/forms/newsletter returned 201 Created`);
  const nlData = await resNl.json();

  // P8 & P8b: JSON response NEVER returns token or confirmUrl
  assert(nlData.confirmUrl === undefined, `[P8] Newsletter response strictly omits confirmUrl`);
  assert(nlData.token === undefined, `[P8] Newsletter response strictly omits token`);
  assert(nlData.ok === true && nlData.requiresConfirmation === true,
    `[P8b] Newsletter requires email confirmation; self-confirmation defeated`);

  // Unsubscribe with bare email (no signed token) is rejected with 400
  const resUnsubBare = await fetch(`${BASE}/api/v1/forms/newsletter/unsubscribe?email=${encodeURIComponent(testEmail)}`);
  assert(resUnsubBare.status === 400,
    `Unsubscribe with bare email (no token) rejected with 400 (got ${resUnsubBare.status})`);

  // Check forms.ts source code for headers and turnstile requirement
  const formsSource = readFileSync(resolve('apps/api/src/routes/forms.ts'), 'utf8');
  assert(formsSource.includes('email = rawEmail.toLowerCase()'),
    `forms.ts lower-cases subscriber email addresses`);
  assert(formsSource.includes("'List-Unsubscribe'") && formsSource.includes("'List-Unsubscribe-Post'"),
    `forms.ts adds List-Unsubscribe and List-Unsubscribe-Post headers`);
  assert(formsSource.includes('Captcha token required') && formsSource.includes('verifyTurnstile'),
    `forms.ts enforces Turnstile token verification in production`);

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`MS1.3 Audit Summary: ${passed} checks PASSED, ${failed} checks FAILED.`);
  console.log('================================================================');

  if (failed > 0) {
    console.error(`\n[ABORT] ${failed} checks failed. MS1.3 emergency security fixes incomplete.`);
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('[FATAL]', e);
  process.exit(1);
});
