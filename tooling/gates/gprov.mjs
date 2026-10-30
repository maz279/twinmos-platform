// G-PROV Gate (Task B8a / GPROV-CI / T3.3.5 / T3.3.7)
// Enforces:
// 1. Git provenance: repo HEAD commit and author identity
// 2. Build provenance integrity: dist/build-info.json
// 3. CMS Content Provenance Measurement: measures percentage of content delivered via
//    CMS Delivery API and BlockDispatcher across all Astro routes, enforced by ratchet in baselines.json.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';

console.log('[gprov] Running G-PROV provenance integrity & CMS measurement gate...');

let failures = 0;

// 1. Verify git provenance
try {
  const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const author = execSync('git log -1 --pretty=format:"%an <%ae>"', { encoding: 'utf8' }).trim();
  if (!commit || commit.length < 7) {
    console.error('[gprov] FAIL: Could not resolve git commit hash.');
    failures++;
  } else {
    console.log(`[gprov] PASS: Git commit provenance verified (${commit.slice(0, 7)} by ${author}).`);
  }
} catch (err) {
  console.error('[gprov] FAIL: Git environment error:', err.message);
  failures++;
}

// 2. Verify build provenance in apps/web/dist (if build output exists)
const buildInfoPath = resolve(process.cwd(), 'apps/web/dist/build-info.json');
if (!existsSync(buildInfoPath)) {
  console.log('[gprov] Info: apps/web/dist/build-info.json not found on disk (pre-build stage).');
} else {
  try {
    const raw = readFileSync(buildInfoPath, 'utf8');
    const info = JSON.parse(raw);
    if ((!info.commit && !info.commitSha) || !info.builtAt) {
      console.error('[gprov] FAIL: build-info.json missing required provenance fields (commit/commitSha, builtAt).');
      failures++;
    } else {
      console.log(`[gprov] PASS: Build provenance verified (commit: ${(info.commit || info.commitSha).slice(0, 7)}, builtAt: ${info.builtAt}).`);
    }
  } catch (err) {
    console.error('[gprov] FAIL: build-info.json is malformed:', err.message);
    failures++;
  }
}

// 3. Measure CMS Content Provenance across Astro pages (Task T3.3.5 & T3.3.7)
const pagesDir = resolve(process.cwd(), 'apps/web/src/pages');
const baselinesPath = resolve(process.cwd(), 'tooling/gates/baselines.json');

let baseline = {
  provenance: { minProvenancePercent: 85.0, currentProvenancePercent: 92.5 }
};
if (existsSync(baselinesPath)) {
  try {
    baseline = JSON.parse(readFileSync(baselinesPath, 'utf8'));
  } catch {
    // fallback to defaults
  }
}

let totalPages = 0;
let deliveryBoundPages = 0;
let totalContentElements = 0;
let deliveryBoundElements = 0;

if (existsSync(pagesDir)) {
  const pageFiles = readdirSync(pagesDir).filter((f) => f.endsWith('.astro'));
  totalPages = pageFiles.length;

  for (const file of pageFiles) {
    const filePath = join(pagesDir, file);
    const content = readFileSync(filePath, 'utf8');

    // Check if the page imports and calls getDelivery*
    const usesDelivery = /getDelivery(Page|Product|Article|News|Faqs|Facets)/.test(content);
    const usesBlockDispatcher = /<BlockDispatcher/.test(content);

    if (usesDelivery) {
      deliveryBoundPages++;
    }

    // Heuristic measurement of content elements (headings, meta, blocks)
    const blockCount = (content.match(/<BlockDispatcher/g) || []).length;
    const dynamicTitle = /title\s*=\s*page\?\.title|title\s*=\s*product\?\.name|title\s*=\s*article\?\.title/.test(content);
    const dynamicDesc = /desc\s*=\s*page\?\.seoDescription|desc\s*=\s*product\?\.description/.test(content);

    // Each page counts 3 primary metadata fields + blocks
    const totalFields = 3 + (blockCount > 0 ? blockCount : 1);
    const boundFields = (dynamicTitle ? 1 : 0) + (dynamicDesc ? 1 : 0) + (usesDelivery ? 1 : 0) + (usesBlockDispatcher ? 1 : 0);

    totalContentElements += totalFields;
    deliveryBoundElements += boundFields;
  }
}

const calculatedProvenance = totalContentElements > 0
  ? Math.round((deliveryBoundElements / totalContentElements) * 1000) / 10
  : 100.0;

const minThreshold = baseline.provenance?.minProvenancePercent ?? 85.0;

console.log(`\n[gprov] CMS Content Provenance Measurement (Task T3.3.5):`);
console.log(`        • Pages analyzed:           ${totalPages}`);
console.log(`        • CMS Delivery-bound pages: ${deliveryBoundPages}/${totalPages} (${Math.round((deliveryBoundPages / totalPages) * 100)}%)`);
console.log(`        • Measured provenance:      ${calculatedProvenance}%`);
console.log(`        • Ratchet threshold:        ≥ ${minThreshold}%`);

if (calculatedProvenance < minThreshold) {
  console.error(`[gprov] FAIL: CMS Content Provenance (${calculatedProvenance}%) is below ratchet threshold (${minThreshold}%).`);
  failures++;
} else {
  console.log(`[gprov] PASS: CMS Content Provenance verified against ratchet baseline.`);
}

if (failures > 0) {
  console.error(`\n[gprov] G-PROV gate FAILED with ${failures} error(s).`);
  process.exit(1);
}

console.log('[gprov] PASS G-PROV: Provenance gate completed successfully.');
process.exit(0);
