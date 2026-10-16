import { readFileSync } from 'node:fs';

const BASE = 'http://127.0.0.1:8787';

async function run() {
  console.log('================================================================');
  console.log('             TwinMOS R0.3 Comprehensive Audit Verification');
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

  // 1. Z-01 / SEC-PREVIEW: Preview token minting requires staff session; dev-revalidate-secret rejected
  console.log('\n--- 1. SEC-PREVIEW: Preview Token Security ---');
  const resDevSecret = await fetch(`${BASE}/api/v1/delivery/preview-token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-revalidate-secret': 'dev-revalidate-secret-000000000000000000000000',
    },
    body: JSON.stringify({ entityType: 'page', entityId: 1 }),
  });
  assert(resDevSecret.status === 401, `Anonymous request with x-revalidate-secret rejected with 401 (got ${resDevSecret.status})`);

  const resAnon = await fetch(`${BASE}/api/v1/delivery/preview-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ entityType: 'page', entityId: 1 }),
  });
  assert(resAnon.status === 401, `Anonymous request without session rejected with 401 (got ${resAnon.status})`);

  // 2. Z-12 / DLV-LEAK: Delivery Leaks
  console.log('\n--- 2. DLV-LEAK: Delivery Leaks Remediation ---');
  const resFaqs = await fetch(`${BASE}/api/v1/delivery/faqs`);
  assert(resFaqs.status === 200, `GET /api/v1/delivery/faqs returned 200`);
  const faqsData = await resFaqs.json();
  const nonPublishedFaqs = (faqsData.data ?? []).filter(f => f.status && f.status !== 'published');
  assert(nonPublishedFaqs.length === 0, `GET /faqs only returns published items (found ${nonPublishedFaqs.length} non-published)`);

  const resSettings = await fetch(`${BASE}/api/v1/delivery/settings`);
  assert(resSettings.status === 200, `GET /api/v1/delivery/settings returned 200`);
  const settingsData = await resSettings.json();
  const disallowedKeys = Object.keys(settingsData.data ?? {}).filter(k => 
    !['siteName', 'siteUrl', 'contactEmail', 'supportEmail', 'phone', 'address', 'copyrightText', 'maintenanceMode'].includes(k)
  );
  assert(disallowedKeys.length === 0, `GET /settings only exposes public allow-listed keys (leaked keys: ${disallowedKeys.join(', ') || 'none'})`);

  const resFormSchema = await fetch(`${BASE}/api/v1/delivery/forms/contact`);
  assert(resFormSchema.status === 200, `GET /forms/contact returned 200`);
  const formSchemaData = await resFormSchema.json();
  assert(formSchemaData.data?.routingEmail === undefined, `GET /forms/:type does NOT leak routingEmail`);

  // 3. Z-10 / LOCK-CT: Auth Content-Type Enforcement
  console.log('\n--- 3. LOCK-CT: Auth Content-Type Rejection ---');
  const resFormPost = await fetch(`${BASE}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'email=test%40example.com&password=wrong',
  });
  assert(resFormPost.status === 415, `POST /auth/* with application/x-www-form-urlencoded rejected with 415 (got ${resFormPost.status})`);

  // 4. Z-29 / P7: Health Deep
  console.log('\n--- 4. P7: Deep Health Probe Protection ---');
  const resDeepAnon = await fetch(`${BASE}/api/v1/health/deep`);
  assert(resDeepAnon.status === 401, `Anonymous GET /api/v1/health/deep rejected with 401 (got ${resDeepAnon.status})`);

  const resHealth = await fetch(`${BASE}/api/v1/health`);
  assert(resHealth.status === 200, `Public GET /api/v1/health returns 200`);

  // 5. Z-21 / P8: Newsletter Opt-In and Unsubscribe Security
  console.log('\n--- 5. P8: Newsletter Security & Double Opt-in ---');
  const testEmail = `AUDIT-TEST-${Date.now()}@TwinMOS.dev`;
  const resNl = await fetch(`${BASE}/api/v1/forms/newsletter`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  assert(resNl.status === 201, `POST /forms/newsletter returned 201`);
  const nlData = await resNl.json();
  assert(nlData.confirmUrl === undefined, `Newsletter JSON response never leaks confirmUrl`);
  assert(nlData.token === undefined, `Newsletter JSON response never leaks token`);

  const resUnsubAnon = await fetch(`${BASE}/api/v1/forms/newsletter/unsubscribe?email=${encodeURIComponent(testEmail)}`, {
    method: 'GET',
  });
  assert(resUnsubAnon.status === 400, `Unsubscribe with bare email (no token) rejected with 400 (got ${resUnsubAnon.status})`);

  // 6. Z-09 / RESET-LOG: Verify auth.ts source code
  console.log('\n--- 6. RESET-LOG: Auth Logging Cleanliness ---');
  const authSource = readFileSync('apps/api/src/auth.ts', 'utf8');
  assert(!authSource.includes('console.log(`[auth] Reset password URL:'), `auth.ts never logs reset password URLs to console`);
  assert(!authSource.includes('console.log(`[auth] Verification email URL:'), `auth.ts never logs verification email URLs to console`);
  assert(authSource.includes('Password reset mailer is not configured'), `auth.ts throws error when reset mailer is not configured`);

  console.log('\n================================================================');
  console.log(`Audit Summary: ${passed} checks PASSED, ${failed} checks FAILED.`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
