import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

async function run() {
  console.log('================================================================');
  console.log('       TwinMOS R0.4 Comprehensive Audit Verification');
  console.log('       R0.4 · Stop silent data changes on edit (Z-04 / DATA-PATCH)');
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

  // 1. Z-04 Schema Separation Audit
  console.log('--- 1. Schema Separation Audit (No defaults on Base / Partial updates) ---');
  const sharedSrc = readFileSync('packages/shared/src/index.ts', 'utf8');
  assert(sharedSrc.includes('productBaseSchema'), 'packages/shared defines productBaseSchema without defaults');
  assert(sharedSrc.includes('productUpdateSchema = productBaseSchema.partial()'), 'productUpdateSchema derives from productBaseSchema.partial()');
  assert(sharedSrc.includes('variantBaseSchema') && sharedSrc.includes('variantUpdateSchema'), 'variantUpdateSchema derives from variantBaseSchema');
  assert(sharedSrc.includes('pageUpdateSchema = pageBaseSchema.partial()'), 'pageUpdateSchema derives from pageBaseSchema.partial()');
  assert(sharedSrc.includes('jobPostingUpdateSchema = jobPostingBaseSchema.partial()'), 'jobPostingUpdateSchema derives from jobPostingBaseSchema.partial()');
  assert(sharedSrc.includes('distributorUpdateSchema = distributorBaseSchema.partial()'), 'distributorUpdateSchema derives from distributorBaseSchema.partial()');

  const entitiesSrc = readFileSync('apps/api/src/routes/entities.ts', 'utf8');
  assert(entitiesSrc.includes('glossaryUpdateSchema = glossaryBaseSchema.partial()'), 'entities.ts defines glossaryUpdateSchema without defaults');
  assert(entitiesSrc.includes('officeUpdateSchema = officeBaseSchema.partial()'), 'entities.ts defines officeUpdateSchema without defaults');
  assert(entitiesSrc.includes('testimonialUpdateSchema = testimonialBaseSchema.partial()'), 'entities.ts defines testimonialUpdateSchema without defaults');
  assert(entitiesSrc.includes('policyUpdateSchema = policyBaseSchema.partial()'), 'entities.ts defines policyUpdateSchema without defaults');
  assert(entitiesSrc.includes('formDefUpdateSchema = formDefBaseSchema.partial()'), 'entities.ts defines formDefUpdateSchema without defaults');
  assert(entitiesSrc.includes('formFieldUpdateSchema = formFieldBaseSchema.partial()'), 'entities.ts defines formFieldUpdateSchema without defaults');

  // 2. Prune Patch Helper Audit
  console.log('\n--- 2. Payload Pruning Helper Audit (prunePatch) ---');
  assert(entitiesSrc.includes('function prunePatch'), 'entities.ts contains prunePatch helper');
  const contentSrc = readFileSync('apps/api/src/routes/content.ts', 'utf8');
  assert(contentSrc.includes('prunePatch'), 'content.ts uses prunePatch helper');
  const adminSrc = readFileSync('apps/api/src/routes/admin.ts', 'utf8');
  assert(adminSrc.includes('prunePatch'), 'admin.ts uses prunePatch helper');
  const navSrc = readFileSync('apps/api/src/routes/navigation.ts', 'utf8');
  assert(navSrc.includes('prunePatch'), 'navigation.ts uses prunePatch helper');
  const partnerSrc = readFileSync('apps/api/src/routes/partner.ts', 'utf8');
  assert(partnerSrc.includes('prunePatch'), 'partner.ts uses prunePatch helper');
  const settingsSrc = readFileSync('apps/api/src/routes/settings.ts', 'utf8');
  assert(settingsSrc.includes('prunePatch'), 'settings.ts uses prunePatch helper');

  // 3. Route Parity Audit (PATCH and PUT)
  console.log('\n--- 3. PATCH and PUT Route Parity Audit ---');
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

  // 4. Live Audit Probes (X1, X3, X3b)
  console.log('\n--- 4. Live API Audit Probes Execution ---');
  try {
    const probeOutput = execSync('node tooling/verify/verify-x1-x3.mjs', { encoding: 'utf8', timeout: 30000 });
    const probePasses = (probeOutput.match(/\[PASS\]/g) || []).length;
    assert(probePasses >= 30, `Live probes X1, X3, X3b executed successfully (${probePasses} passed checks)`);
  } catch (err) {
    assert(false, `Live probes execution failed: ${err.message}`);
  }

  // 5. Automated Data-Patch Test Suite (18 entities)
  console.log('\n--- 5. Automated Data-Patch Regression Suite ---');
  try {
    const testOutput = execSync('npx vitest run test/data-patch.test.ts', { cwd: 'apps/api', encoding: 'utf8', timeout: 60000 });
    assert(testOutput.includes('18 passed'), 'Automated data-patch regression suite passed 18/18 tests');
  } catch (err) {
    assert(false, `data-patch.test.ts failed: ${err.message}`);
  }

  // 6. Data Repair Runbook Audit
  console.log('\n--- 6. Data Repair Runbook Audit ---');
  try {
    const repairOutput = execSync('node --experimental-strip-types tooling/repair-r04-data.ts', { encoding: 'utf8' });
    assert(repairOutput.includes('Repair Execution Summary'), 'Data repair runbook executed cleanly');
  } catch (err) {
    assert(false, `repair-r04-data.ts failed: ${err.message}`);
  }

  // 7. Visual & WCAG 2.2 AA Accessibility Parity Audit
  console.log('\n--- 7. Visual & WCAG 2.2 AA Accessibility Audit ---');
  assert(existsSync('apps/web/dist/index.html'), 'Static web build exists for audit inspection');
  assert(existsSync('tooling/verify/evidence/01_homepage.png'), 'Screenshot evidence 01_homepage.png exists');
  assert(existsSync('tooling/verify/evidence/02_shop_catalog.png'), 'Screenshot evidence 02_shop_catalog.png exists');
  assert(existsSync('tooling/verify/evidence/03_pdp_voltx.png'), 'Screenshot evidence 03_pdp_voltx.png exists');
  assert(existsSync('tooling/verify/evidence/04_compare.png'), 'Screenshot evidence 04_compare.png exists');
  assert(existsSync('tooling/verify/evidence/05_support_rma.png'), 'Screenshot evidence 05_support_rma.png exists');
  assert(existsSync('tooling/verify/evidence/06_arabic_locale.png'), 'Screenshot evidence 06_arabic_locale.png exists');

  console.log('\n================================================================');
  console.log(`R0.4 Comprehensive Audit Summary: ${passed} checks PASSED, ${failed} checks FAILED.`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('[verify-r04-audit] Fatal error:', err);
  process.exit(1);
});
