// Verification script for R0.4 live probes:
// Probe X1: Page edit retains published status on PATCH and PUT
// Probe X3: Policy edit retains published status on PATCH and PUT
// Probe X3b: Testimonial edit retains permissionFlag: true on PATCH and PUT

const BASE = 'http://127.0.0.1:8787';
const ORIGIN = 'http://localhost:5173';

async function run() {
  console.log('================================================================');
  console.log('         R0.4 Live Audit Probes Verification (X1, X3, X3b)');
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

  // 1. Authenticate as Admin
  console.log('--- 1. Authenticating with live API ---');
  const loginRes = await fetch(`${BASE}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    body: JSON.stringify({ email: 'admin@twinmos.dev', password: 'admin' })
  });
  assert(loginRes.status === 200, `Admin sign-in returned 200 (got ${loginRes.status})`);
  const rawCookie = loginRes.headers.get('set-cookie');
  const cookie = rawCookie?.split(';')[0] ?? '';
  assert(cookie.includes('better-auth.session_token'), 'Acquired valid session token cookie');

  const headers = {
    'content-type': 'application/json',
    cookie,
    origin: ORIGIN,
  };

  // 2. Probe X1: Content Page edit retains published status
  console.log('\n--- 2. Probe X1: Page Edit Retains Published Status ---');
  const pageSlug = `r04-page-test-${Date.now()}`;
  const createPageRes = await fetch(`${BASE}/api/v1/admin/content/page`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: pageSlug,
      title: 'Original Published Page',
      body: 'Original content markdown',
      status: 'published',
      locale: 'en',
      source: 'docs/BUSINESS_DECISION_LOG.md (content ownership matrix)',
      approver: 'Victoria Sterling',
    }),
  });
  assert(createPageRes.status === 201, `Created test page (HTTP ${createPageRes.status})`);
  const createdPage = await createPageRes.json();
  const pageId = createdPage.id;
  assert(createdPage.status === 'published', `Initial page status is 'published'`);

  // PATCH page without status
  const patchPageRes = await fetch(`${BASE}/api/v1/admin/content/page/${pageId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ title: 'Patched Page Title' }),
  });
  assert(patchPageRes.status === 200, `PATCH /content/page/:id returned 200`);
  const patchedPage = await patchPageRes.json();
  assert(patchedPage.title === 'Patched Page Title', `PATCH updated title correctly`);
  assert(patchedPage.status === 'published', `[PROBE X1] PATCH retained status: 'published' (did NOT revert to draft)`);

  // PUT page without status
  const putPageRes = await fetch(`${BASE}/api/v1/admin/content/page/${pageId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ title: 'Put Page Title' }),
  });
  assert(putPageRes.status === 200, `PUT /content/page/:id returned 200`);
  const putPage = await putPageRes.json();
  assert(putPage.title === 'Put Page Title', `PUT updated title correctly`);
  assert(putPage.status === 'published', `[PROBE X1] PUT retained status: 'published'`);

  // 3. Probe X3: Policy Document edit retains published status & version
  console.log('\n--- 3. Probe X3: Policy Edit Retains Published Status & Version ---');
  const policySlug = `r04-policy-test-${Date.now()}`;
  const createPolicyRes = await fetch(`${BASE}/api/v1/admin/entities/policies`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: policySlug,
      title: 'Original Privacy Policy',
      version: '3.5',
      status: 'published',
      locale: 'en',
      source: 'https://www.twinmos.com/legal',
      approver: 'Legal Counsel',
      legalApproved: true,
    }),
  });
  assert(createPolicyRes.status === 201, `Created test policy (HTTP ${createPolicyRes.status})`);
  const createdPolicy = await createPolicyRes.json();
  const policyId = createdPolicy.id;
  assert(createdPolicy.status === 'published', `Initial policy status is 'published'`);

  // PATCH policy without status
  const patchPolicyRes = await fetch(`${BASE}/api/v1/admin/entities/policies/${policyId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ summary: 'Updated summary via PATCH' }),
  });
  assert(patchPolicyRes.status === 200, `PATCH /entities/policies/:id returned 200`);
  const patchedPolicy = await patchPolicyRes.json();
  assert(patchedPolicy.summary === 'Updated summary via PATCH', `PATCH updated summary correctly`);
  assert(patchedPolicy.status === 'published', `[PROBE X3] PATCH retained status: 'published'`);
  assert(patchedPolicy.version === '3.5', `[PROBE X3] PATCH retained version: '3.5'`);

  // PUT policy without status
  const putPolicyRes = await fetch(`${BASE}/api/v1/admin/entities/policies/${policyId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ summary: 'Updated summary via PUT' }),
  });
  assert(putPolicyRes.status === 200, `PUT /entities/policies/:id returned 200`);
  const putPolicy = await putPolicyRes.json();
  assert(putPolicy.summary === 'Updated summary via PUT', `PUT updated summary correctly`);
  assert(putPolicy.status === 'published', `[PROBE X3] PUT retained status: 'published'`);
  assert(putPolicy.version === '3.5', `[PROBE X3] PUT retained version: '3.5'`);

  // 4. Probe X3b: Testimonial edit retains permissionFlag: true & sort
  console.log('\n--- 4. Probe X3b: Testimonial Edit Retains Consent Flag ---');
  const createTestimonialRes = await fetch(`${BASE}/api/v1/admin/entities/testimonials`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      quote: 'Exceptional NVMe speeds and reliability.',
      author: 'Ahmad Al-Mansoor',
      permissionFlag: true,
      sort: 7,
      locale: 'en',
      source: 'internal-customer-survey',
      approver: 'Marketing Lead',
      permissionEvidence: 'Signed customer release on file (verification probe).',
    }),
  });
  assert(createTestimonialRes.status === 201, `Created test testimonial (HTTP ${createTestimonialRes.status})`);
  const createdTestimonial = await createTestimonialRes.json();
  const testimonialId = createdTestimonial.id;
  assert(createdTestimonial.permissionFlag === true, `Initial permissionFlag is true`);

  // PATCH testimonial without permissionFlag
  const patchTestimonialRes = await fetch(`${BASE}/api/v1/admin/entities/testimonials/${testimonialId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ role: 'Lead DevOps Engineer' }),
  });
  assert(patchTestimonialRes.status === 200, `PATCH /entities/testimonials/:id returned 200`);
  const patchedTestimonial = await patchTestimonialRes.json();
  assert(patchedTestimonial.role === 'Lead DevOps Engineer', `PATCH updated role correctly`);
  assert(patchedTestimonial.permissionFlag === true, `[PROBE X3b] PATCH retained permissionFlag: true`);
  assert(patchedTestimonial.sort === 7, `[PROBE X3b] PATCH retained sort: 7`);

  // PUT testimonial without permissionFlag
  const putTestimonialRes = await fetch(`${BASE}/api/v1/admin/entities/testimonials/${testimonialId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ role: 'Principal Architect' }),
  });
  assert(putTestimonialRes.status === 200, `PUT /entities/testimonials/:id returned 200`);
  const putTestimonial = await putTestimonialRes.json();
  assert(putTestimonial.role === 'Principal Architect', `PUT updated role correctly`);
  assert(putTestimonial.permissionFlag === true, `[PROBE X3b] PUT retained permissionFlag: true`);
  assert(putTestimonial.sort === 7, `[PROBE X3b] PUT retained sort: 7`);

  // Cleanup: probes must not leave published testimonials/policies/pages behind.
  for (const path of [
    `/api/v1/admin/entities/testimonials/${testimonialId}`,
    `/api/v1/admin/entities/policies/${policyId}`,
    `/api/v1/admin/content/page/${pageId}`,
  ]) {
    await fetch(`${BASE}${path}`, { method: 'DELETE', headers }).catch(() => {});
  }

  console.log('\n================================================================');
  console.log(`Live Probes Summary: ${passed} checks PASSED, ${failed} checks FAILED.`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
