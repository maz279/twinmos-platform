// Comprehensive MS4.1 Milestone Audit & Verification Suite (Roadmap v3.1 lines 1672–1736)
// Closes Z-13, Z-39. Enforces BLOCK-STRICT exit gate preconditions.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

console.log('================================================================');
console.log('  MS4.1 Comprehensive Audit: Page Entity & One Block Contract');
console.log('                    Pass Gate: BLOCK-STRICT                      ');
console.log('================================================================\n');

let passed = 0;
let failed = 0;
const results = [];

async function check(id, description, fn) {
  process.stdout.write(`[*] [${id}] ${description}... `);
  try {
    await fn();
    console.log('PASS');
    passed++;
    results.push({ id, description, status: 'PASS' });
  } catch (err) {
    console.log(`FAIL\n    [-] Error: ${err.message}`);
    failed++;
    results.push({ id, description, status: 'FAIL', error: err.message });
  }
}

async function main() {
  // -----------------------------------------------------------------------------
  // TASK T4.1.1: Page Entity Constraints & Database Integrity
  // -----------------------------------------------------------------------------

  await check('MS4.1-DB-01', 'Page schema defines self-referencing parentId foreign key', () => {
    const schemaPath = resolve(ROOT, 'packages/db/src/schema.ts');
    const code = readFileSync(schemaPath, 'utf8');
    if (!code.includes('parentId: integer(\'parent_id\').references((): AnyPgColumn => page.id, { onDelete: \'set null\' })')) {
      throw new Error('schema.ts missing self-referencing parentId foreign key constraint');
    }
  });

  await check('MS4.1-DB-02', 'Page schema enforces compound unique index on (locale, path)', () => {
    const schemaPath = resolve(ROOT, 'packages/db/src/schema.ts');
    const code = readFileSync(schemaPath, 'utf8');
    if (!code.includes('uniqueIndex(\'page_locale_path_uq\').on(t.locale, t.path)')) {
      throw new Error('schema.ts missing uniqueIndex(page_locale_path_uq) on (locale, path)');
    }
  });

  await check('MS4.1-DB-03', 'Migration 0024_page_constraints.sql created and registered in journal', () => {
    const migPath = resolve(ROOT, 'packages/db/migrations/0024_page_constraints.sql');
    const journalPath = resolve(ROOT, 'packages/db/migrations/meta/_journal.json');
    if (!existsSync(migPath)) throw new Error('Missing 0024_page_constraints.sql migration');
    const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
    const entry = journal.entries.find((e) => e.idx === 24 && e.tag === '0024_page_constraints');
    if (!entry) throw new Error('Migration 0024_page_constraints not registered in _journal.json');
  });

  // -----------------------------------------------------------------------------
  // TASK T4.1.2: One Shared Block Definition & Zero-Fallback Invariant
  // -----------------------------------------------------------------------------

  await check('MS4.1-BLK-01', 'BLOCK_TYPES in @twinmos/shared defines exactly 30 block types', async () => {
    const sharedBlocks = resolve(ROOT, 'packages/shared/src/blocks.ts');
    const code = readFileSync(sharedBlocks, 'utf8');
    const typesMatch = code.match(/export const BLOCK_TYPES = \[\s*([\s\S]*?)\s*\] as const/);
    if (!typesMatch) throw new Error('Cannot find BLOCK_TYPES in packages/shared/src/blocks.ts');
    const types = typesMatch[1]
      .split(',')
      .map((s) => s.trim().replace(/['"]/g, ''))
      .filter(Boolean);
    if (types.length !== 30) {
      throw new Error(`Expected exactly 30 block types in BLOCK_TYPES, got ${types.length}: ${types.join(', ')}`);
    }
    if (!types.includes('anchorNav') || !types.includes('specComparison')) {
      throw new Error('BLOCK_TYPES missing anchorNav or specComparison');
    }
  });

  await check('MS4.1-BLK-02', 'Shared block validation strictly rejects unknown types with per-field report (Zero-fallback invariant)', () => {
    const sharedBlocks = resolve(ROOT, 'packages/shared/src/blocks.ts');
    const code = readFileSync(sharedBlocks, 'utf8');
    if (code.includes('z.record(z.unknown())') || code.includes('z.any()')) {
      throw new Error('packages/shared/src/blocks.ts contains loose fallback bypass (z.record or z.any)');
    }
    if (!code.includes('Unknown block type') || !code.includes('BLOCK_SCHEMAS')) {
      throw new Error('packages/shared/src/blocks.ts missing strict BLOCK_SCHEMAS resolution');
    }
  });

  await check('MS4.1-BLK-03', 'Shared blocks library exports versioning helper migrateBlock()', () => {
    const sharedBlocks = resolve(ROOT, 'packages/shared/src/blocks.ts');
    const code = readFileSync(sharedBlocks, 'utf8');
    if (!code.includes('export function migrateBlock(')) {
      throw new Error('packages/shared/src/blocks.ts missing migrateBlock export');
    }
  });

  // -----------------------------------------------------------------------------
  // TASK T4.1.3: Admin Page Builder Alignment
  // -----------------------------------------------------------------------------

  await check('MS4.1-ADM-01', 'Admin Page Builder BLOCK_DEFS contains all 30 block types with 100% valid make() defaults', async () => {
    const adminBlocks = resolve(ROOT, 'apps/admin/src/modules/page-builder/blocks.ts');
    const code = readFileSync(adminBlocks, 'utf8');
    if (!code.includes('BLOCK_TYPES') || !code.includes('@twinmos/shared')) {
      throw new Error('Admin blocks.ts does not import BLOCK_TYPES from @twinmos/shared');
    }
    const { BLOCK_DEFS } = await import('../../apps/admin/src/modules/page-builder/blocks.ts');
    const { validateBlock } = await import('../../packages/shared/src/blocks.ts');
    if (BLOCK_DEFS.length !== 30) {
      throw new Error(`Admin BLOCK_DEFS length is ${BLOCK_DEFS.length}, expected 30`);
    }
    for (const def of BLOCK_DEFS) {
      const defaultBlock = def.make();
      const val = validateBlock(defaultBlock);
      if (!val.success) {
        throw new Error(`Admin default block "${def.type}" failed shared validation: ${JSON.stringify(val.errors)}`);
      }
    }
  });

  await check('MS4.1-ADM-02', 'Admin MediaPicker enforces mandatory alt text for non-decorative assets', () => {
    const mediaPicker = resolve(ROOT, 'apps/admin/src/media-picker.tsx');
    const code = readFileSync(mediaPicker, 'utf8');
    if (!code.includes('Alt required') || !code.includes('Boolean(m.alt && m.alt.trim())')) {
      throw new Error('MediaPicker does not enforce mandatory alt text on media assets');
    }
  });

  await check('MS4.1-ADM-03', 'Admin PageBuilder provides keyboard block reordering alternatives (WCAG 2.2 SC 2.1.1)', () => {
    const builder = resolve(ROOT, 'apps/admin/src/modules/page-builder/PageBuilder.tsx');
    const code = readFileSync(builder, 'utf8');
    if (!code.includes('Move ${def?.label ?? block.type} block up') || !code.includes('Move ${def?.label ?? block.type} block down')) {
      throw new Error('PageBuilder missing keyboard block reordering buttons (Move up / Move down)');
    }
  });

  // -----------------------------------------------------------------------------
  // TASK T4.1.4: Safe Astro Block Dispatcher & XSS Sanitization
  // -----------------------------------------------------------------------------

  await check('MS4.1-AST-01', 'Sanitizer implements OWASP allow-list and strips script/form tags', async () => {
    const sanitizePath = resolve(ROOT, 'packages/shared/src/sanitize.ts');
    if (!existsSync(sanitizePath)) throw new Error('Missing packages/shared/src/sanitize.ts');
    const { sanitizeRichText, replaceLogoToken } = await import('../../packages/shared/src/sanitize.ts');
    const dirty = '<script>alert(1)</script><form action="/evil"><input name="bad"/></form><p>Hello World</p>';
    const clean = sanitizeRichText(dirty);
    if (clean.includes('<script') || clean.includes('<form') || clean.includes('<input')) {
      throw new Error(`Sanitizer failed to strip dangerous elements: ${clean}`);
    }
    if (!clean.includes('<p>Hello World</p>')) {
      throw new Error(`Sanitizer stripped safe paragraph: ${clean}`);
    }
    const logoReplaced = replaceLogoToken('Header {logo} Text');
    if (!logoReplaced.includes('<img src="/brand/logo.svg" alt="TwinMOS"')) {
      throw new Error(`replaceLogoToken failed: ${logoReplaced}`);
    }
  });

  await check('MS4.1-AST-02', 'BlockDispatcher has zero raw un-sanitized set:html directives', () => {
    const dispatcher = resolve(ROOT, 'apps/web/src/components/blocks/BlockDispatcher.astro');
    const code = readFileSync(dispatcher, 'utf8');
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('set:html') && !line.includes('sanitizeRichText(')) {
        throw new Error(`BlockDispatcher line ${i + 1} has un-sanitized set:html: ${line.trim()}`);
      }
    }
  });

  await check('MS4.1-AST-03', 'BlockDispatcher eliminates fabricated QVL defaults and hardcoded CTA copy', () => {
    const dispatcher = resolve(ROOT, 'apps/web/src/components/blocks/BlockDispatcher.astro');
    const code = readFileSync(dispatcher, 'utf8');
    if (code.includes('|| \'Z790 / B650\'') || code.includes('|| \'DDR5-6000\'') || code.includes('|| \'✓ Qualified\'')) {
      throw new Error('BlockDispatcher contains fabricated QVL fallback values');
    }
    if (code.includes('Explore Products') && code.includes('splitCta')) {
      throw new Error('BlockDispatcher splitCta has hardcoded copy instead of typed block fields');
    }
  });

  // -----------------------------------------------------------------------------
  // TASK T4.1.5: Reserved Page Paths & Auto-Redirects
  // -----------------------------------------------------------------------------

  await check('MS4.1-PTH-01', 'RESERVED_PAGE_PATHS rejects /admin, /api, /internal', async () => {
    const { RESERVED_PAGE_PATHS, isReservedPagePath } = await import('../../packages/shared/src/index.ts');
    if (!RESERVED_PAGE_PATHS.includes('/admin') || !RESERVED_PAGE_PATHS.includes('/api') || !RESERVED_PAGE_PATHS.includes('/internal')) {
      throw new Error('RESERVED_PAGE_PATHS missing required prefixes');
    }
    if (!isReservedPagePath('/admin') || !isReservedPagePath('/admin/settings')) {
      throw new Error('isReservedPagePath failed on /admin');
    }
    if (!isReservedPagePath('/api') || !isReservedPagePath('/api/v1/pages')) {
      throw new Error('isReservedPagePath failed on /api');
    }
    if (!isReservedPagePath('/internal') || !isReservedPagePath('/internal/metrics')) {
      throw new Error('isReservedPagePath failed on /internal');
    }
    if (isReservedPagePath('/products/memory') || isReservedPagePath('/about-us')) {
      throw new Error('isReservedPagePath falsely flagged valid product/about paths');
    }
  });

  await check('MS4.1-PTH-02', 'API content route rejects reserved paths and auto-generates 301 redirects on rename', () => {
    const contentRoute = resolve(ROOT, 'apps/api/src/routes/content.ts');
    const code = readFileSync(contentRoute, 'utf8');
    if (!code.includes('isReservedPagePath(') || !code.includes('Reserved path')) {
      throw new Error('content.ts does not guard against reserved page paths');
    }
    if (!code.includes('redirect.from') || !code.includes('existing.legacyPaths')) {
      throw new Error('content.ts does not generate 301 redirects on page path update');
    }
  });

  // -----------------------------------------------------------------------------
  // TASK T4.1.6: Contract Tests Execution (Vitest Suite)
  // -----------------------------------------------------------------------------

  await check('MS4.1-TST-01', 'Vitest blocks-contract.test.ts executes and passes 100% of tests', () => {
    try {
      const out = execSync('npx vitest run apps/api/test/blocks-contract.test.ts', {
        encoding: 'utf8',
        cwd: ROOT,
        timeout: 60000,
      });
      if (!out.includes('1 passed') || out.includes('failed')) {
        throw new Error(`Contract test output indicated failure:\n${out}`);
      }
    } catch (err) {
      throw new Error(`Vitest execution failed: ${err.stdout || err.message}`);
    }
  });

  // -----------------------------------------------------------------------------
  // PASS GATE: BLOCK-STRICT & Exit Gate Preconditions
  // -----------------------------------------------------------------------------

  await check('MS4.1-GATE-01', 'TypeScript compilation passes across apps/admin with 0 errors', () => {
    try {
      execSync('npx tsc -p apps/admin/tsconfig.json --noEmit', {
        encoding: 'utf8',
        cwd: ROOT,
        timeout: 30000,
      });
    } catch (err) {
      throw new Error(`Admin TypeScript check failed: ${err.stdout || err.message}`);
    }
  });

  await check('MS4.1-GATE-02', 'Astro check passes across apps/web with 0 errors', () => {
    try {
      const out = execSync('npx astro check', {
        encoding: 'utf8',
        cwd: resolve(ROOT, 'apps/web'),
        timeout: 180000,
        maxBuffer: 20 * 1024 * 1024,
      });
      if (out.includes('error') && !out.includes('0 errors')) {
        throw new Error(`Astro check failed:\n${out}`);
      }
    } catch (err) {
      throw new Error(`Astro check execution failed: ${err.stdout || err.message}`);
    }
  });

  // -----------------------------------------------------------------------------
  // SUMMARY & SIGN-OFF
  // -----------------------------------------------------------------------------

  console.log('\n================================================================');
  console.log(`  MS4.1 AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`  Status: ${failed === 0 ? 'ALL CRITERIA SATISFIED (BLOCK-STRICT PASSED)' : 'VERIFICATION FAILED'}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled audit error:', err);
  process.exit(1);
});
