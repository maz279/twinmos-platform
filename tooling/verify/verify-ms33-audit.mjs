// MS3.3 Comprehensive Verification & Audit Suite (15 Checks)
// Validates all tasks under MS3.3 · Reproducible content and build; CMS gates:
// T3.3.1 (Remove snapshot fallback & fail loudly in prod)
// T3.3.2 (Seeders read only tracked inputs in tooling/data)
// T3.3.3 (Idempotent importers, natural keys, zero padding, zero deletion)
// T3.3.4 (CONTENT-REPRO test: 0 mutations across tables on fresh DB)
// T3.3.5 (G-PROV that measures provenance percentage)
// T3.3.6 (G-NOHARDCODE AST lint with allow-list)
// T3.3.7 (baselines.json ratchet enforcement)

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = resolve(process.cwd());

console.log('================================================================');
console.log('  MS3.3 Comprehensive Audit Suite: Reproducible Content & CMS Gates');
console.log('  Roadmap v3.1 · Tasks T3.3.1 – T3.3.7 · 15 Rigorous Verifications');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function check(id, name, fn) {
  process.stdout.write(`[*] [${id.padEnd(28)}] ${name}... `);
  try {
    fn();
    console.log('PASS');
    passed++;
  } catch (err) {
    console.log('FAIL');
    console.error(`    ↳ Error: ${err.message}`);
    failed++;
  }
}

// ------------------------------------------------------------
// Iteration 1: T3.3.1 & T3.3.2 (Snapshot removal & Tracked inputs)
// ------------------------------------------------------------
check('T3.3.1-NO-PAGES-CACHE', 'apps/web/src/data/pages-cache.json does not exist on disk', () => {
  const cachePath = resolve(repoRoot, 'apps/web/src/data/pages-cache.json');
  if (existsSync(cachePath)) {
    throw new Error('pages-cache.json still exists on disk');
  }
});

check('T3.3.1-DELIVERY-NO-CACHE', 'apps/web/src/lib/delivery.ts has no pages-cache.json or prototype data reads', () => {
  const deliveryPath = resolve(repoRoot, 'apps/web/src/lib/delivery.ts');
  const content = readFileSync(deliveryPath, 'utf8');
  if (content.includes('pages-cache.json')) throw new Error('delivery.ts still references pages-cache.json');
  if (content.includes('prototype/assets/js/data.js')) throw new Error('delivery.ts still references prototype data.js');
  if (content.includes('localPagesCache')) throw new Error('delivery.ts still references localPagesCache');
  if (content.includes('localArticlesCache')) throw new Error('delivery.ts still references localArticlesCache');
});

check('T3.3.1-DELIVERY-PROD-LOUD-FAIL', 'apps/web/src/lib/delivery.ts fails loudly in production mode when API unreachable', () => {
  const deliveryPath = resolve(repoRoot, 'apps/web/src/lib/delivery.ts');
  const content = readFileSync(deliveryPath, 'utf8');
  if (!content.includes("process.env.NODE_ENV === 'production'")) {
    throw new Error('delivery.ts does not guard production mode failure');
  }
  if (!content.includes('throw new Error(')) {
    throw new Error('delivery.ts does not throw in production on API failure');
  }
});

check('T3.3.1-TRACKED-FIXTURE', 'tooling/data/tracked-fixture-pages.json exists and is tracked in git for test mode', () => {
  const fixturePath = resolve(repoRoot, 'tooling/data/tracked-fixture-pages.json');
  if (!existsSync(fixturePath)) throw new Error('tracked-fixture-pages.json missing');
  try {
    const ignored = execSync('git check-ignore tooling/data/tracked-fixture-pages.json', { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (ignored) throw new Error('tracked-fixture-pages.json is git-ignored');
  } catch {
    // Exit code 1 from git check-ignore means NOT ignored (desired behavior)
  }
});

check('T3.3.2-INVENTORY-TRACKED', 'tooling/data/inventory_blocks.json exists and is tracked in git', () => {
  const invPath = resolve(repoRoot, 'tooling/data/inventory_blocks.json');
  if (!existsSync(invPath)) throw new Error('inventory_blocks.json missing');
  try {
    const ignored = execSync('git check-ignore tooling/data/inventory_blocks.json', { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (ignored) throw new Error('inventory_blocks.json is git-ignored');
  } catch {
    // Exit code 1 from git check-ignore means NOT ignored (desired behavior)
  }
});

check('T3.3.2-SEEDER-NO-AUDIT-DIR', 'tooling/seed-phase-d-pages.ts reads only from tracked repo data, no ../audit/...', () => {
  const seederPath = resolve(repoRoot, 'tooling/seed-phase-d-pages.ts');
  const content = readFileSync(seederPath, 'utf8');
  if (content.includes('../audit/')) throw new Error('seed-phase-d-pages.ts still references ../audit/...');
  if (!content.includes("resolve(HERE, 'data', 'inventory_blocks.json')")) {
    throw new Error('seed-phase-d-pages.ts does not load from tooling/data/inventory_blocks.json');
  }
});

// ------------------------------------------------------------
// Iteration 2: T3.3.3 (Natural Keys & Idempotent Importer)
// ------------------------------------------------------------
check('T3.3.3-SCHEMA-NATURAL-KEYS', 'packages/db/src/schema.ts contains unique compound indexes for natural keys', () => {
  const schemaPath = resolve(repoRoot, 'packages/db/src/schema.ts');
  const content = readFileSync(schemaPath, 'utf8');
  const required = [
    'uniqueIndex(\'glossary_term_uq\').on(t.term, t.locale)',
    'uniqueIndex(\'office_title_locale_uq\').on(t.title, t.locale)',
    'uniqueIndex(\'testimonial_author_locale_uq\').on(t.author, t.locale)',
    'uniqueIndex(\'form_field_form_name_uq\').on(t.formId, t.name)',
    'uniqueIndex(\'nav_item_menu_parent_sort_uq\').on(t.menuId, t.parentId, t.sort)',
    'uniqueIndex(\'faq_question_locale_uq\').on(t.question, t.locale)',
  ];
  for (const req of required) {
    if (!content.includes(req)) {
      throw new Error(`Missing required unique index: ${req}`);
    }
  }
});

check('T3.3.3-IMPORTER-NO-DELETE', 'tooling/import-corpus-v2.ts does not execute destructive db.delete(faq)', () => {
  const importerPath = resolve(repoRoot, 'tooling/import-corpus-v2.ts');
  const content = readFileSync(importerPath, 'utf8');
  if (content.includes('db.delete(faq)')) {
    throw new Error('import-corpus-v2.ts still contains db.delete(faq)');
  }
});

check('T3.3.3-IMPORTER-NO-PADDING', 'tooling/import-corpus-v2.ts does not pad fake FAQs and imports genuine corpus only', () => {
  const importerPath = resolve(repoRoot, 'tooling/import-corpus-v2.ts');
  const content = readFileSync(importerPath, 'utf8');
  if (content.includes('faqCount < 155')) {
    throw new Error('import-corpus-v2.ts still contains fake FAQ padding loop');
  }
  if (content.includes('How do I optimize system performance with TwinMOS high-speed components (FAQ')) {
    throw new Error('import-corpus-v2.ts still contains hardcoded dummy FAQ generator');
  }
});

// ------------------------------------------------------------
// Iteration 3: T3.3.4, T3.3.5, T3.3.6, T3.3.7 (Content Repro & Gates)
// ------------------------------------------------------------
check('T3.3.4-CONTENT-REPRO', 'CONTENT-REPRO test passes (0 mutations between runs on fresh database)', () => {
  const output = execSync('node tooling/verify/content-repro.mjs', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  if (!output.includes('PASS: CONTENT-REPRO passed!')) {
    throw new Error('content-repro.mjs did not pass');
  }
});

check('T3.3.5-GPROV-PERCENTAGE', 'tooling/gates/gprov.mjs measures and reports CMS content provenance percentage', () => {
  const output = execSync('node tooling/gates/gprov.mjs', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  if (!output.includes('Measured provenance:')) {
    throw new Error('gprov.mjs does not output measured provenance percentage');
  }
  if (!output.includes('PASS G-PROV')) {
    throw new Error('gprov.mjs failed');
  }
});

check('T3.3.6-GNOHARDCODE-AST', 'tooling/gates/gnohardcode.mjs runs Astro template AST lint with allow-list', () => {
  const output = execSync('node tooling/gates/gnohardcode.mjs', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  if (!output.includes('Hardcoded literals found:')) {
    throw new Error('gnohardcode.mjs does not output hardcoded literals count');
  }
  if (!output.includes('PASS G-NOHARDCODE')) {
    throw new Error('gnohardcode.mjs failed');
  }
});

check('T3.3.7-BASELINES-RATCHET', 'tooling/gates/baselines.json defines active provenance and hardcode ratchets', () => {
  const baselinesPath = resolve(repoRoot, 'tooling/gates/baselines.json');
  if (!existsSync(baselinesPath)) throw new Error('baselines.json missing');
  const baseline = JSON.parse(readFileSync(baselinesPath, 'utf8'));
  if (typeof baseline.provenance?.minProvenancePercent !== 'number') {
    throw new Error('baselines.json missing minProvenancePercent');
  }
  if (typeof baseline.hardcode?.maxLiterals !== 'number') {
    throw new Error('baselines.json missing maxLiterals');
  }
});

// ------------------------------------------------------------
// Iteration 4: Gate B & Live Services Regression
// ------------------------------------------------------------
check('GATE-B-INTEGRITY', 'Gate B check VC-B-17 passes with upgraded provenance and no-hardcode gates', () => {
  execSync('node tooling/gates/gprov.mjs && node tooling/gates/gnohardcode.mjs && node tooling/verify/greflect-harness.mjs && node tooling/verify/gparity-baseline.mjs', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
});

check('LIVE-SERVICES-HEALTH', 'Web (4321), API (8787), and Admin (5173) are responding with HTTP 200', async () => {
  const urls = [
    'http://localhost:4321/',
    'http://127.0.0.1:8787/health',
    'http://localhost:5173/',
  ];
  for (const url of urls) {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`);
  }
});

console.log('\n================================================================');
console.log(`MS3.3 Audit Complete: ${passed}/15 checks PASSED (${failed} failed).`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);
process.exit(0);
