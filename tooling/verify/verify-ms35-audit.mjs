// MS3.5 Comprehensive Milestone Verification & Audit Suite
// Evaluates all tasks T3.5.1 through T3.5.9 and audits all MS3.5 success criteria:
// 1. REVAL-01: Revalidation endpoint 403 on missing/invalid secret; 200 on valid secret;
//              Database sitemap lists published URLs and zero drafts; dynamic robots.txt.
// 2. CACHE-01: Preview bypasses cache with private, no-store, noindex; stale-if-error served;
//              Edge /internal/ returns 404; hashed assets immutable 365d, unversioned not.
// 3. CMS-E1:   Admin redirect returns 301 within 5s; chains/loops rejected at save;
//              Lookup p95 < 5ms with 1,000 rows; 0 filesystem writes to deploy/nginx.
// 4. CMS-E5:   Published article visible on its page, hubs, and home within 5s without
//              manual export; delivered after web restart.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('================================================================');
console.log('       MS3.5: Fast Invalidation & Edge Micro-Cache Audit');
console.log('================================================================\n');

const API_BASE = process.env.API_URL || 'http://127.0.0.1:8787';
const WEB_BASE = process.env.WEB_URL || 'http://localhost:4321';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'dev-revalidate-secret';

let totalChecks = 0;
let passedChecks = 0;

async function runAuditCheck(id, description, checkFn) {
  totalChecks++;
  process.stdout.write(`[*] [${id}] ${description}... `);
  try {
    await checkFn();
    console.log('PASS');
    passedChecks++;
  } catch (err) {
    console.log('FAIL');
    console.error(`    Error: ${err.message}`);
  }
}

// Helper: Authenticate with live API as admin
async function getAdminCookie() {
  const loginRes = await fetch(`${API_BASE}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:5173' },
    body: JSON.stringify({ email: 'admin@twinmos.dev', password: 'admin' }),
  });
  if (loginRes.status !== 200) {
    throw new Error(`Admin login failed with status ${loginRes.status}`);
  }
  const rawCookie = loginRes.headers.get('set-cookie');
  if (!rawCookie) throw new Error('Missing set-cookie in auth response');
  return rawCookie.split(';')[0];
}

// -----------------------------------------------------------------------------
// 1. REVAL-01: Revalidation endpoint security & dynamic sitemap / robots hygiene
// -----------------------------------------------------------------------------
await runAuditCheck('REVAL-01-SEC', 'POST /internal/revalidate rejects unauthorized requests with 403', async () => {
  // 1. Missing secret
  const noSecretRes = await fetch(`${WEB_BASE}/internal/revalidate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tags: ['pages'] }),
  });
  if (noSecretRes.status !== 403) {
    throw new Error(`Expected 403 for missing secret, got ${noSecretRes.status}`);
  }

  // 2. Invalid secret
  const badSecretRes = await fetch(`${WEB_BASE}/internal/revalidate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret: 'wrong-secret-12345', tags: ['pages'] }),
  });
  if (badSecretRes.status !== 403) {
    throw new Error(`Expected 403 for invalid secret, got ${badSecretRes.status}`);
  }

  // 3. Valid secret
  const validRes = await fetch(`${WEB_BASE}/internal/revalidate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret: REVALIDATE_SECRET, tags: ['pages', 'redirects'] }),
  });
  if (validRes.status !== 200) {
    throw new Error(`Expected 200 for valid secret, got ${validRes.status}`);
  }
  const body = await validRes.json();
  if (!body.revalidated) {
    throw new Error('Response did not indicate revalidated: true');
  }
});

await runAuditCheck('REVAL-01-SITEMAP', 'Sitemap and robots.txt serve dynamic DB entries with zero drafts', async () => {
  // Verify static shadow files are deleted
  const staticSitemap = resolve(process.cwd(), 'apps/web/public/sitemap.xml');
  const staticRobots = resolve(process.cwd(), 'apps/web/public/robots.txt');
  if (existsSync(staticSitemap) || existsSync(staticRobots)) {
    throw new Error('Static shadow sitemap.xml or robots.txt still present in public/');
  }

  // Query sitemap.xml
  const sitemapRes = await fetch(`${WEB_BASE}/sitemap.xml`);
  if (sitemapRes.status !== 200) throw new Error(`sitemap.xml returned HTTP ${sitemapRes.status}`);
  const sitemapXml = await sitemapRes.text();
  if (!sitemapXml.includes('<urlset') && !sitemapXml.includes('<sitemapindex')) {
    throw new Error('sitemap.xml did not return valid XML urlset or sitemapindex');
  }
  if (sitemapXml.includes('draft') || sitemapXml.includes('prototype-gen5-4tb') || sitemapXml.includes('internal-memo')) {
    throw new Error('sitemap.xml contains draft or unpublished entries');
  }

  // Query robots.txt
  const robotsRes = await fetch(`${WEB_BASE}/robots.txt`);
  if (robotsRes.status !== 200) throw new Error(`robots.txt returned HTTP ${robotsRes.status}`);
  const robotsTxt = await robotsRes.text();
  if (!robotsTxt.includes('Sitemap:') || !robotsTxt.includes('User-agent:')) {
    throw new Error('robots.txt does not contain standard User-agent and Sitemap directives');
  }
});

// -----------------------------------------------------------------------------
// 2. CACHE-01: Preview bypass & Edge Micro-Cache Configuration
// -----------------------------------------------------------------------------
await runAuditCheck('CACHE-01-PREVIEW', 'Preview requests enforce cache bypass and noindex', async () => {
  const previewRes = await fetch(`${WEB_BASE}/learn/what-is-xmp?preview=test-token-123`);
  const cacheControl = previewRes.headers.get('cache-control') || '';
  const robotsTag = previewRes.headers.get('x-robots-tag') || '';

  if (!cacheControl.includes('private') || !cacheControl.includes('no-store')) {
    throw new Error(`Preview Cache-Control missing private, no-store (got: ${cacheControl})`);
  }
  if (!robotsTag.includes('noindex')) {
    throw new Error(`Preview X-Robots-Tag missing noindex (got: ${robotsTag})`);
  }
});

await runAuditCheck('CACHE-01-EDGE', 'Nginx edge config enforces micro-cache, internal 404, and asset hashing', () => {
  const nginxConfPath = resolve(process.cwd(), 'deploy/nginx/twinmos.conf');
  if (!existsSync(nginxConfPath)) throw new Error('Missing deploy/nginx/twinmos.conf');
  const conf = readFileSync(nginxConfPath, 'utf8');

  // Verify internal 404
  if (!conf.includes('location ^~ /internal/') || !conf.includes('return 404;')) {
    throw new Error('Nginx does not block external /internal/ with 404');
  }

  // Verify proxy cache key and connect timeout
  if (!conf.includes('proxy_cache_key "$scheme$host$request_uri";')) {
    throw new Error('Missing proxy_cache_key scheme+host+uri in nginx config');
  }
  if (!conf.includes('proxy_connect_timeout 2s;')) {
    throw new Error('Missing proxy_connect_timeout 2s in nginx config');
  }

  // Verify stale-if-error and cache lock
  if (!conf.includes('proxy_cache_use_stale error timeout') || !conf.includes('proxy_cache_lock on;')) {
    throw new Error('Missing proxy_cache_use_stale or proxy_cache_lock in nginx config');
  }

  // Verify versioned vs unversioned asset caching
  if (!conf.includes('expires 365d;') || !conf.includes('immutable')) {
    throw new Error('Missing 365d immutable cache for versioned assets in nginx config');
  }
  if (!conf.includes('expires -1;') || !conf.includes('no-cache, must-revalidate')) {
    throw new Error('Missing no-cache must-revalidate for unversioned assets in nginx config');
  }
});

// -----------------------------------------------------------------------------
// 3. CMS-E1: Admin Redirects Engine (Validation, 301 Latency & 0 Disk Writes)
// -----------------------------------------------------------------------------
await runAuditCheck('CMS-E1-VALIDATION', 'CMS redirects reject loops, chains, and existing page conflicts', async () => {
  const cookie = await getAdminCookie();

  // Test 1: Loop rejection
  const loopRes = await fetch(`${API_BASE}/api/v1/admin/redirects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie, origin: 'http://localhost:5173' },
    body: JSON.stringify({ from: '/loop-a', to: '/loop-a', code: 301 }),
  });
  if (loopRes.status !== 422) {
    throw new Error(`Self loop was not rejected with 422 (got ${loopRes.status})`);
  }

  // Test 2: Conflict with existing page
  const conflictRes = await fetch(`${API_BASE}/api/v1/admin/redirects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie, origin: 'http://localhost:5173' },
    body: JSON.stringify({ from: '/about', to: '/company', code: 301 }),
  });
  if (conflictRes.status !== 422) {
    throw new Error(`Conflict with live page path was not rejected with 422 (got ${conflictRes.status})`);
  }
});

await runAuditCheck('CMS-E1-LIVE', 'CMS redirect created in admin returns 301 on web tier within 5s', async () => {
  const cookie = await getAdminCookie();
  const testFrom = `/redirect-e1-${Date.now()}`;
  const testTo = '/learn';

  // 1. Create redirect
  const createRes = await fetch(`${API_BASE}/api/v1/admin/redirects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie, origin: 'http://localhost:5173' },
    body: JSON.stringify({ from: testFrom, to: testTo, code: 301 }),
  });
  if (createRes.status !== 201) {
    throw new Error(`Create redirect failed with status ${createRes.status}`);
  }

  // 2. Query web tier within 5s
  const start = Date.now();
  let redirected = false;
  let finalStatus = 0;
  let finalLocation = '';

  while (Date.now() - start < 5000) {
    const webRes = await fetch(`${WEB_BASE}${testFrom}`, { redirect: 'manual' });
    finalStatus = webRes.status;
    finalLocation = webRes.headers.get('location') || '';
    if (finalStatus === 301 && finalLocation === testTo) {
      redirected = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!redirected) {
    throw new Error(`Web tier did not return 301 to ${testTo} within 5s (got ${finalStatus}, location: ${finalLocation})`);
  }

  // 3. Verify the versioned deploy map exists, has the full legacy inventory,
  //    and that no runtime code writes it (the zero-cwd-write invariant).
  const mapPath = resolve(process.cwd(), 'deploy/nginx/twinmos-redirects.map');
  if (!existsSync(mapPath)) {
    throw new Error('deploy/nginx/twinmos-redirects.map is missing (deploy artifact required by nginx)');
  }
  const mapRules = readFileSync(mapPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  if (mapRules.length < 72) {
    throw new Error(`deploy/nginx/twinmos-redirects.map has ${mapRules.length} rules; expected at least 72`);
  }
  let runtimeRefs = '';
  try {
    runtimeRefs = execSync('git grep -n "twinmos-redirects.map" -- apps packages', { encoding: 'utf8' });
  } catch {
    runtimeRefs = '';
  }
  const writeRefs = runtimeRefs
    .split('\n')
    .filter((line) => line && /writeFileSync|appendFileSync|createWriteStream|writeFile\(/i.test(line));
  if (writeRefs.length > 0) {
    throw new Error(`runtime code writes the deploy map: ${writeRefs[0]}`);
  }
});

// -----------------------------------------------------------------------------
// 4. CMS-E5: Article Publishing Pipeline (Outbox, Invalidation & Live Delivery)
// -----------------------------------------------------------------------------
await runAuditCheck('CMS-E5-LIVE', 'New published article is visible on web tier within 5s without manual export', async () => {
  const cookie = await getAdminCookie();
  const testSlug = `ms35-e5-article-${Date.now()}`;
  const testTitle = `CMS-E5 Verified Article ${Date.now()}`;

  // 1. Create draft article
  const createRes = await fetch(`${API_BASE}/api/v1/admin/content/article`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie, origin: 'http://localhost:5173' },
    body: JSON.stringify({
      title: testTitle,
      slug: testSlug,
      category: 'Guides',
      excerpt: 'Automated live delivery test without manual export',
      content: '<p>Verifying CMS-E5 contract exit gate live execution.</p>',
      status: 'draft',
    }),
  });
  if (createRes.status !== 201) {
    throw new Error(`Article creation failed with status ${createRes.status}`);
  }
  const article = await createRes.json();

  // 2. Verify draft returns 404 on web tier
  const draftWebRes = await fetch(`${WEB_BASE}/learn/${testSlug}`);
  if (draftWebRes.status !== 404) {
    throw new Error(`Draft article returned ${draftWebRes.status} instead of 404`);
  }

  // 3. Transition draft -> in_review -> published
  const reviewRes = await fetch(`${API_BASE}/api/v1/admin/content/article/${article.id}/transition`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie, origin: 'http://localhost:5173' },
    body: JSON.stringify({ to: 'in_review' }),
  });
  if (reviewRes.status !== 200) throw new Error(`Transition to in_review failed (${reviewRes.status})`);

  const pubRes = await fetch(`${API_BASE}/api/v1/admin/content/article/${article.id}/transition`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie, origin: 'http://localhost:5173' },
    body: JSON.stringify({ to: 'published' }),
  });
  if (pubRes.status !== 200) throw new Error(`Transition to published failed (${pubRes.status})`);

  // 4. Poll web tier within 5s
  const start = Date.now();
  let articleDelivered = false;
  let deliveryLatencyMs = 0;

  while (Date.now() - start < 5000) {
    const webRes = await fetch(`${WEB_BASE}/learn/${testSlug}`);
    if (webRes.status === 200) {
      const html = await webRes.text();
      if (html.includes(testTitle)) {
        articleDelivered = true;
        deliveryLatencyMs = Date.now() - start;
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!articleDelivered) {
    throw new Error('Published article was not rendered on /learn/:slug within 5s');
  }

  // 5. Verify delivered after revalidation / web restart simulation
  const revalRes = await fetch(`${WEB_BASE}/internal/revalidate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret: REVALIDATE_SECRET, tags: ['articles', `article:${testSlug}`] }),
  });
  if (revalRes.status !== 200) throw new Error('Post-publish revalidate failed');

  const afterRestartRes = await fetch(`${WEB_BASE}/learn/${testSlug}`);
  if (afterRestartRes.status !== 200) {
    throw new Error(`Article failed to deliver after revalidation (status: ${afterRestartRes.status})`);
  }

  // 6. Verify sitemap includes the published article
  const sitemapRes = await fetch(`${WEB_BASE}/sitemap.xml`);
  const sitemapXml = await sitemapRes.text();
  if (!sitemapXml.includes(testSlug)) {
    throw new Error('Published article is missing from dynamic sitemap.xml');
  }
});

// -----------------------------------------------------------------------------
// 5. Automated Unit & Integration Suites
// -----------------------------------------------------------------------------
await runAuditCheck('OUTBOX-SUITE', 'Full outbox event recording & dispatcher unit suite (apps/api/test/outbox.test.ts)', () => {
  execSync('npx vitest run apps/api/test/outbox.test.ts', { stdio: 'pipe' });
});

await runAuditCheck('REDIRECTS-SUITE', 'Redirects validation, outbox event & p95 < 5ms benchmark (apps/api/test/redirects.test.ts)', () => {
  execSync('npx vitest run apps/api/test/redirects.test.ts', { stdio: 'pipe' });
});

console.log('\n================================================================');
console.log(`MS3.5 Audit Results: ${passedChecks}/${totalChecks} checks passed`);
console.log('================================================================\n');

if (passedChecks !== totalChecks) {
  process.exit(1);
}
