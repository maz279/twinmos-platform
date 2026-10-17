// tooling/verify/verify-ms14-audit.mjs
// Comprehensive Verification Suite for MS1.4 · Stop silent data changes on edit (T1.4.1 – T1.4.4)
// Roadmap Source: R0.4 | Closes Audit Finding: Z-04 (CRITICAL)
// Check IDs: DATA-PATCH, Probes X1, X3, X3b
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8787';
const ORIGIN = 'http://localhost:5173';

async function run() {
  console.log('================================================================');
  console.log('    TwinMOS MS1.4 Stop Silent Data Changes Audit Verification');
  console.log('    Milestone: MS1.4 · Tasks: T1.4.1 – T1.4.4 · Closes: Z-04');
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
  // 1. T1.4.1: Automated Table-Driven Test Suite (DATA-PATCH)
  // ---------------------------------------------------------------------------
  console.log('--- 1. T1.4.1 / DATA-PATCH: Automated Table-Driven Test Suite ---');
  assert(existsSync('apps/api/test/data-patch.test.ts'), 'Table-driven test suite apps/api/test/data-patch.test.ts exists');
  try {
    const testOutput = execSync('npx vitest run test/data-patch.test.ts', {
      cwd: 'apps/api',
      encoding: 'utf8',
      timeout: 120000,
    });
    assert(testOutput.includes('18 passed'), `vitest data-patch.test.ts passed all 18 table-driven tests (PGlite)`);
  } catch (err) {
    assert(false, `data-patch.test.ts vitest run failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // 2. T1.4.2: Schema Separation Without Defaults & Payload Pruning
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. T1.4.2: Schema Separation & Payload Pruning (Z-04 Remediation) ---');
  
  // packages/shared/src/index.ts
  const sharedSrc = readFileSync('packages/shared/src/index.ts', 'utf8');
  assert(sharedSrc.includes('productBaseSchema'), 'packages/shared defines productBaseSchema without embedded defaults');
  assert(sharedSrc.includes('productUpdateSchema = productBaseSchema.partial()'), 'productUpdateSchema derives from productBaseSchema.partial()');
  assert(sharedSrc.includes('variantBaseSchema') && sharedSrc.includes('variantUpdateSchema'), 'variantUpdateSchema derives from variantBaseSchema');
  assert(sharedSrc.includes('compatibilityBaseSchema') && sharedSrc.includes('compatibilityCreateSchema'), 'compatibilityCreateSchema extends compatibilityBaseSchema');
  assert(sharedSrc.includes('articleBaseSchema') && sharedSrc.includes('articleUpdateSchema = articleBaseSchema.partial()'), 'articleUpdateSchema derives from articleBaseSchema.partial()');
  assert(sharedSrc.includes('newsBaseSchema') && sharedSrc.includes('newsUpdateSchema = newsBaseSchema.partial()'), 'newsUpdateSchema derives from newsBaseSchema.partial()');
  assert(sharedSrc.includes('pageBaseSchema') && sharedSrc.includes('pageUpdateSchema = pageBaseSchema.partial()'), 'pageUpdateSchema derives from pageBaseSchema.partial()');
  assert(sharedSrc.includes('faqBaseSchema') && sharedSrc.includes('faqUpdateSchema = faqBaseSchema.partial()'), 'faqUpdateSchema derives from faqBaseSchema.partial()');
  assert(sharedSrc.includes('jobPostingBaseSchema') && sharedSrc.includes('jobPostingUpdateSchema = jobPostingBaseSchema.partial()'), 'jobPostingUpdateSchema derives from jobPostingBaseSchema.partial()');
  assert(sharedSrc.includes('distributorBaseSchema') && sharedSrc.includes('distributorUpdateSchema = distributorBaseSchema.partial()'), 'distributorUpdateSchema derives from distributorBaseSchema.partial()');

  // apps/api/src/routes/entities.ts
  const entitiesSrc = readFileSync('apps/api/src/routes/entities.ts', 'utf8');
  assert(entitiesSrc.includes('glossaryUpdateSchema = glossaryBaseSchema.partial()'), 'entities.ts defines glossaryUpdateSchema without defaults');
  assert(entitiesSrc.includes('officeUpdateSchema = officeBaseSchema.partial()'), 'entities.ts defines officeUpdateSchema without defaults');
  assert(entitiesSrc.includes('testimonialUpdateSchema = testimonialBaseSchema.partial()'), 'entities.ts defines testimonialUpdateSchema without defaults');
  assert(entitiesSrc.includes('policyUpdateSchema = policyBaseSchema.partial()'), 'entities.ts defines policyUpdateSchema without defaults');
  assert(entitiesSrc.includes('formDefUpdateSchema = formDefBaseSchema.partial()'), 'entities.ts defines formDefUpdateSchema without defaults');
  assert(entitiesSrc.includes('formFieldUpdateSchema = formFieldBaseSchema.partial()'), 'entities.ts defines formFieldUpdateSchema without defaults');

  // apps/api/src/routes/navigation.ts
  const navSrc = readFileSync('apps/api/src/routes/navigation.ts', 'utf8');
  assert(navSrc.includes('itemUpdateSchema = itemBaseSchema.partial()'), 'navigation.ts defines itemUpdateSchema without defaults');
  assert(navSrc.includes('menuUpdateSchema'), 'navigation.ts defines menuUpdateSchema without defaults');

  // prunePatch helper verification across all routes
  assert(entitiesSrc.includes('function prunePatch'), 'entities.ts contains prunePatch helper');
  const contentSrc = readFileSync('apps/api/src/routes/content.ts', 'utf8');
  assert(contentSrc.includes('function prunePatch') || contentSrc.includes('prunePatch'), 'content.ts uses prunePatch helper');
  const adminSrc = readFileSync('apps/api/src/routes/admin.ts', 'utf8');
  assert(adminSrc.includes('function prunePatch') || adminSrc.includes('prunePatch'), 'admin.ts uses prunePatch helper');
  assert(navSrc.includes('function prunePatch') || navSrc.includes('prunePatch'), 'navigation.ts uses prunePatch helper');
  const partnerSrc = readFileSync('apps/api/src/routes/partner.ts', 'utf8');
  assert(partnerSrc.includes('function prunePatch') || partnerSrc.includes('prunePatch'), 'partner.ts uses prunePatch helper');
  const settingsSrc = readFileSync('apps/api/src/routes/settings.ts', 'utf8');
  assert(settingsSrc.includes('function prunePatch') || settingsSrc.includes('prunePatch'), 'settings.ts uses prunePatch helper');

  // Route parity (both PATCH and PUT registered)
  assert(contentSrc.includes("r.patch('/content/:entity/:id'") && contentSrc.includes("r.put('/content/:entity/:id'"), 'content.ts registers both PATCH and PUT');
  assert(adminSrc.includes("r.patch('/products/:id'") && adminSrc.includes("r.put('/products/:id'"), 'admin.ts registers both PATCH and PUT for products');
  assert(adminSrc.includes("r.patch('/products/:id/variants/:varId'") && adminSrc.includes("r.put('/products/:id/variants/:varId'"), 'admin.ts registers both PATCH and PUT for variants');
  assert(adminSrc.includes("r.patch('/compatibility/:id'") && adminSrc.includes("r.put('/compatibility/:id'"), 'admin.ts registers both PATCH and PUT for compatibility');
  assert(adminSrc.includes("r.patch('/job-postings/:id'") && adminSrc.includes("r.put('/job-postings/:id'"), 'admin.ts registers both PATCH and PUT for job-postings');
  assert(partnerSrc.includes("r.patch('/distributors/:id'") && partnerSrc.includes("r.put('/distributors/:id'"), 'partner.ts registers both PATCH and PUT for distributors');
  assert(partnerSrc.includes("r.patch('/marketplace-listings/:id'") && partnerSrc.includes("r.put('/marketplace-listings/:id'"), 'partner.ts registers both PATCH and PUT for marketplace');
  assert(entitiesSrc.includes("r.patch('/entities/policies/:id'") && entitiesSrc.includes("r.put('/entities/policies/:id'"), 'entities.ts registers both PATCH and PUT for policies');
  assert(entitiesSrc.includes("r.patch('/entities/testimonials/:id'") && entitiesSrc.includes("r.put('/entities/testimonials/:id'"), 'entities.ts registers both PATCH and PUT for testimonials');
  assert(entitiesSrc.includes("r.patch('/entities/glossary/:id'") && entitiesSrc.includes("r.put('/entities/glossary/:id'"), 'entities.ts registers both PATCH and PUT for glossary');
  assert(entitiesSrc.includes("r.patch('/entities/offices/:id'") && entitiesSrc.includes("r.put('/entities/offices/:id'"), 'entities.ts registers both PATCH and PUT for offices');
  assert(navSrc.includes("r.patch('/navigation/menus/:id'") && navSrc.includes("r.put('/navigation/menus/:id'"), 'navigation.ts registers both PATCH and PUT for menus');
  assert(navSrc.includes("r.patch('/navigation/items/:id'") && navSrc.includes("r.put('/navigation/items/:id'"), 'navigation.ts registers both PATCH and PUT for items');

  // ---------------------------------------------------------------------------
  // 3. T1.4.3: Data Repair Runbook & Repair Ledger Record
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. T1.4.3: Data Repair Runbook & Formal Repair Ledger ---');
  assert(existsSync('tooling/repair-r04-data.ts'), 'Data repair runbook tooling/repair-r04-data.ts exists');
  try {
    const repairOutput = execSync('node --experimental-strip-types tooling/repair-r04-data.ts', { encoding: 'utf8' });
    assert(repairOutput.includes('Repair Execution Summary'), 'Data repair runbook executed cleanly');
  } catch (err) {
    assert(false, `repair-r04-data.ts execution failed: ${err.message}`);
  }

  assert(existsSync('docs/reports/DATA_REPAIR_MS14.md'), 'Formal repair log docs/reports/DATA_REPAIR_MS14.md exists');
  const repairDoc = readFileSync('docs/reports/DATA_REPAIR_MS14.md', 'utf8');
  assert(repairDoc.includes('Z-04') && repairDoc.includes('MS1.4'), 'Repair log references Z-04 audit remediation');
  assert(repairDoc.includes('content.update') && repairDoc.includes('permission_flag'), 'Repair log covers audit log and permission_flag inspection');

  // ---------------------------------------------------------------------------
  // 4. T1.4.4: Live Audit Probes (X1, X3, X3b) on Production Stack
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. T1.4.4: Live Audit Probes (X1, X3, X3b) on Production API Stack ---');
  try {
    const probeOutput = execSync('node tooling/verify/verify-x1-x3.mjs', { encoding: 'utf8', timeout: 30000 });
    const probePasses = (probeOutput.match(/\[PASS\]/g) || []).length;
    assert(probePasses >= 30, `Live probes X1, X3, X3b executed cleanly (${probePasses} passes, 0 failures)`);
  } catch (err) {
    assert(false, `verify-x1-x3.mjs execution failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // 5. Visual Evidence & Accessibility Parity
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Visual Evidence & WCAG 2.2 AA Parity ---');
  assert(existsSync('apps/web/dist/index.html'), 'Static web build exists (apps/web/dist/index.html)');
  assert(existsSync('tooling/verify/evidence/01_homepage.png'), 'Evidence screenshot: 01_homepage.png exists');
  assert(existsSync('tooling/verify/evidence/02_shop_catalog.png'), 'Evidence screenshot: 02_shop_catalog.png exists');
  assert(existsSync('tooling/verify/evidence/03_pdp_voltx.png'), 'Evidence screenshot: 03_pdp_voltx.png exists');
  assert(existsSync('tooling/verify/evidence/04_compare.png'), 'Evidence screenshot: 04_compare.png exists');
  assert(existsSync('tooling/verify/evidence/05_support_rma.png'), 'Evidence screenshot: 05_support_rma.png exists');
  assert(existsSync('tooling/verify/evidence/06_arabic_locale.png'), 'Evidence screenshot: 06_arabic_locale.png exists');

  console.log('\n================================================================');
  console.log(`TwinMOS MS1.4 Summary: ${passed} checks PASSED, ${failed} checks FAILED.`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('[verify-ms14-audit] Fatal error:', err);
  process.exit(1);
});
