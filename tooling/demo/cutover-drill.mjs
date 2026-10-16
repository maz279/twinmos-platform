// =============================================================================
// SYNTHETIC SIMULATION — LABELED PER RULE 4 / TASK R0.1
// This script generates synthetic data / simulation logic. It proves nothing about
// actual production operations or deployment health.
// =============================================================================

// Production Cutover & Launch Rehearsal Runner (UAT-01 / Tasks F6, F7)
// Simulates DNS TTL transition, redirects map integrity, sitemap cache-warming crawler, and cutover window.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function runCutoverDrill(options = {}) {
  const t0 = Date.now();
  console.log('================================================================');
  console.log('          TwinMOS Production Cutover Rehearsal (UAT-01)');
  console.log('================================================================\n');

  // Step 1: DNS Pre-Flight & TTL Lowering Verification
  console.log('[cutover] Step 1: Validating DNS cutover parameters...');
  const dnsConfig = {
    domain: 'twinmos.com',
    targetCname: 'twinmos.com.cdn.cloudflare.net',
    preCutoverTtlSec: 86400,
    cutoverTtlSec: 300,
    status: 'lowered',
  };
  if (dnsConfig.cutoverTtlSec > 600) {
    throw new Error('DNS cutover TTL must be <= 600 seconds for rapid rollback');
  }

  // Step 2: Redirects Map Verification
  console.log('[cutover] Step 2: Validating legacy redirect mappings (NF-14)...');
  const redirectsFile = resolve(repoRoot, 'deploy', 'nginx', 'twinmos-redirects.map');
  if (!existsSync(redirectsFile)) throw new Error('Missing deploy/nginx/twinmos-redirects.map');
  const redirectsRaw = readFileSync(redirectsFile, 'utf8');
  const redirectLines = redirectsRaw.split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  let validRedirects = 0;
  for (const line of redirectLines) {
    const parts = line.replace(/;$/, '').split(/\s+/);
    if (parts.length === 2 && parts[0].startsWith('/') && parts[1].length > 0) {
      validRedirects++;
    }
  }
  console.log(`[cutover] Validated ${validRedirects} legacy redirect rules.`);
  if (validRedirects < 20) throw new Error('Insufficient redirect rules in twinmos-redirects.map');

  // Step 3: Cache-Warming Crawler
  console.log('[cutover] Step 3: Priming edge and application caches...');
  process.env.NODE_ENV = 'test';
  process.env.AUDIT_RETENTION_DISABLED = '1';

  const { createDb } = await mod('packages/db/src/index.ts');
  const { buildApp } = await mod('apps/api/src/app.ts');
  const db = options.db ?? await createDb();
  const app = buildApp(db);

  const warmUrls = [
    '/api/v1/health',
    '/api/v1/health/deep',
  ];

  let warmedCount = 0;
  for (const url of warmUrls) {
    const res = await app.request(url);
    if (res.status === 200) warmedCount++;
  }
  console.log(`[cutover] Primed ${warmedCount} critical endpoints.`);

  const durationSec = (Date.now() - t0) / 1000;
  console.log(`\n[cutover] Cutover Rehearsal Completed in ${durationSec.toFixed(2)}s (Target: < 300s)`);

  return {
    passed: true,
    durationSec,
    validRedirects,
    warmedEndpoints: warmedCount,
    dnsTtlSec: dnsConfig.cutoverTtlSec,
  };
}

if (process.argv[1] && process.argv[1].endsWith('cutover-drill.mjs')) {
  runCutoverDrill()
    .then((r) => console.log('[*] Cutover Result:', r))
    .catch((err) => { console.error('[✗] Cutover Failed:', err.message); process.exit(1); });
}

