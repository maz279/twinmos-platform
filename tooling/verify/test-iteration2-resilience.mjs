// tooling/verify/test-iteration2-resilience.mjs
// Milestone MS5.2 · Iteration 2: Edge Resilience, Cache-Tag & Error Fallback Suite
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WEB_PORT = process.env.PORT || 4321;
const API_PORT = process.env.API_PORT || 8787;

console.log('================================================================');
console.log('   MS5.2 Iteration 2: Edge Resilience, Cache Tags & Offline Fallback');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`[PASS] ${message}`);
    if (details) console.log(`       -> ${details}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    if (details) console.error(`       -> ${details}`);
    failed++;
  }
}

async function run() {
  // 1. Error Status Codes & Content Verification
  const errorPages = [
    { path: '/404', expectedStatus: 404, expectedTitle: 'Page not found', expectedTag: 'page:404' },
    { path: '/410', expectedStatus: 410, expectedTitle: 'Resource Gone', expectedTag: 'page:410' },
    { path: '/500', expectedStatus: 500, expectedTitle: 'Internal Server Error', expectedTag: 'page:500' },
    { path: '/maintenance', expectedStatus: 503, expectedTitle: 'Scheduled Maintenance', expectedTag: 'page:maintenance' },
  ];

  for (const ep of errorPages) {
    try {
      const res = await fetch(`http://localhost:${WEB_PORT}${ep.path}`, { redirect: 'manual' });
      assert(res.status === ep.expectedStatus, `${ep.path} emits HTTP ${ep.expectedStatus}`, `Received status ${res.status}`);
      const text = await res.text();
      assert(text.includes(ep.expectedTitle), `${ep.path} renders expected title "${ep.expectedTitle}"`);
      const cacheTag = res.headers.get('Cache-Tag') || res.headers.get('cache-tag');
      const xCacheTags = res.headers.get('X-Cache-Tags') || res.headers.get('x-cache-tags');
      assert(Boolean(cacheTag) && cacheTag.includes(ep.expectedTag), `${ep.path} sets Cache-Tag header`, `Cache-Tag: ${cacheTag}`);
      assert(Boolean(xCacheTags) && xCacheTags.includes(ep.expectedTag), `${ep.path} sets X-Cache-Tags header`, `X-Cache-Tags: ${xCacheTags}`);
    } catch (err) {
      assert(false, `${ep.path} request failed`, err.message);
    }
  }

  // 2. Catch-all CMS Page Cache Tags on Normal Page
  try {
    const res = await fetch(`http://localhost:${WEB_PORT}/about`, { redirect: 'manual' });
    assert(res.status === 200, `/about returns HTTP 200 via catch-all CMS delivery route`);
    const cacheTag = res.headers.get('Cache-Tag') || res.headers.get('cache-tag');
    assert(Boolean(cacheTag) && cacheTag.includes('pages'), `/about contains 'pages' cache tag`, `Cache-Tag: ${cacheTag}`);
  } catch (err) {
    assert(false, `/about fetch failed`, err.message);
  }

  // 3. Preview Mode Headers Verification (T5.2.1)
  try {
    const resPreview = await fetch(`http://localhost:${WEB_PORT}/about?preview=token123`, { redirect: 'manual' });
    const cc = resPreview.headers.get('Cache-Control') || '';
    const robots = resPreview.headers.get('X-Robots-Tag') || '';
    assert(cc.includes('no-store') && cc.includes('private'), `Preview mode sets 'private, no-store'`, `Cache-Control: ${cc}`);
    assert(robots.includes('noindex') && robots.includes('nofollow'), `Preview mode sets 'noindex, nofollow'`, `X-Robots-Tag: ${robots}`);
  } catch (err) {
    assert(false, `Preview mode request failed`, err.message);
  }

  // 4. Offline Fallback Markup Verification across all 4 templates
  const root = process.cwd();
  for (const slug of ['404', '410', '500', 'maintenance']) {
    const filePath = resolve(root, 'apps/web/src/pages', `${slug}.astro`);
    const code = readFileSync(filePath, 'utf8');
    const hasFallbackAttr = code.includes(`data-fallback="offline-${slug}"`);
    const hasSafeDefaultHero = code.includes('class="page-hero block-hero"');
    assert(hasFallbackAttr && hasSafeDefaultHero, `${slug}.astro provides robust offline fallback hero (${slug})`);
  }

  // 5. Clean 404 for nonexistent slug
  try {
    const res404 = await fetch(`http://localhost:${WEB_PORT}/completely-nonexistent-random-slug-987`, { redirect: 'manual' });
    assert(res404.status === 404, `Nonexistent slug returns HTTP 404 cleanly`);
  } catch (err) {
    assert(false, `Nonexistent slug request failed`, err.message);
  }

  console.log('\n================================================================');
  console.log(`   Iteration 2 Results: ${passed} passed, ${failed} failed.`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

run();
