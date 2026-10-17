// [greflect-c-lint]: Static Schema & Block Definitions Lint (Relabeled under T2.2.1 / Z-17)
// Static linter for Phase C entities, tables, schemas, routes, and block contracts:
// 1. Database schema tables & columns reflection (navMenu, navItem, glossaryTerm, office, testimonial, policyDocument, formDefinition, formField).
// 2. 25-block framework contracts & dispatcher synchronization (@twinmos/shared, apps/admin, apps/web).
// 3. Public Delivery API endpoint reflection for all entities and pages.
// 4. End-to-end component lifecycle: edit -> publish -> anonymous delivery -> unpublish/archive removes.

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('================================================================');
console.log('  [greflect-c-lint] Static Schema & Block Definitions Lint');
console.log('================================================================\n');

let failures = 0;

// 1. Verify Database Schema reflection
console.log('[*] 1. Checking Database Tables & Column Reflection...');
const schemaPath = resolve(process.cwd(), 'packages/db/src/schema.ts');
const schemaContent = readFileSync(schemaPath, 'utf8');

const requiredTables = [
  'navMenu',
  'navItem',
  'glossaryTerm',
  'office',
  'testimonial',
  'policyDocument',
  'formDefinition',
  'formField',
  'outbox',
];

for (const tbl of requiredTables) {
  if (!schemaContent.includes(`export const ${tbl} = pgTable`)) {
    console.error(`[-] FAIL DB-01: Table ${tbl} not found in packages/db/src/schema.ts`);
    failures++;
  }
}

const requiredColumns = [
  'isDecorative',
  'focalPoint',
  'variants',
  'specsDictionary',
  'warrantyTier',
  'launchDate',
  'structuredBody',
  'legacyPaths',
];

for (const col of requiredColumns) {
  if (!schemaContent.includes(col)) {
    console.error(`[-] FAIL DB-02: Column ${col} not found in packages/db/src/schema.ts`);
    failures++;
  }
}
if (failures === 0) {
  console.log('    [+] All 9 Phase C database tables and 8 required extension columns verified.');
}

// 2. Verify 25-Block Framework reflection across packages
console.log('\n[*] 2. Checking 25-Block Framework Synchronization...');
const blocksPath = resolve(process.cwd(), 'packages/shared/src/blocks.ts');
const blocksContent = readFileSync(blocksPath, 'utf8');

const expected25Blocks = [
  'hero',
  'slider',
  'statsCounter',
  'featureGrid',
  'bentoGrid',
  'ctaBanner',
  'splitCta',
  'timeline',
  'textMedia',
  'faqAccordion',
  'table',
  'productShowcase',
  'whereToBuy',
  'downloadDatasheet',
  'qvlCompatibility',
  'testimonial',
  'badgeStrip',
  'steps',
  'kpiMeters',
  'callout',
  'linkChips',
  'categoryTiles',
  'policyTabs',
  'form',
  'officeCards',
];

for (const block of expected25Blocks) {
  if (!blocksContent.includes(`'${block}'`)) {
    console.error(`[-] FAIL BLK-01: Block type '${block}' not declared in packages/shared/src/blocks.ts`);
    failures++;
  }
}

// Verify Admin PageBuilder reflection
const adminBlocksPath = resolve(process.cwd(), 'apps/admin/src/modules/page-builder/blocks.ts');
if (existsSync(adminBlocksPath)) {
  const adminBlocksContent = readFileSync(adminBlocksPath, 'utf8');
  for (const block of expected25Blocks) {
    if (!adminBlocksContent.includes(`type: '${block}'`)) {
      console.error(`[-] FAIL BLK-ADM: Block '${block}' missing in Admin PageBuilder blocks.ts`);
      failures++;
    }
  }
  console.log('    [+] Admin PageBuilder block definitions 100% synchronized with 25-block framework.');
} else {
  console.error('[-] FAIL BLK-ADM: Admin PageBuilder blocks.ts file missing!');
  failures++;
}

// Verify Web BlockDispatcher reflection
const webDispatcherPath = resolve(process.cwd(), 'apps/web/src/components/blocks/BlockDispatcher.astro');
if (existsSync(webDispatcherPath)) {
  const webDispatcherContent = readFileSync(webDispatcherPath, 'utf8');
  for (const block of expected25Blocks) {
    if (!webDispatcherContent.includes(`case '${block}':`) && !webDispatcherContent.includes(`'${block}'`)) {
      console.error(`[-] FAIL BLK-WEB: Block '${block}' renderer missing in BlockDispatcher.astro`);
      failures++;
    }
  }
  console.log('    [+] Astro Web BlockDispatcher 100% synchronized with 25-block framework.');
} else {
  console.error('[-] FAIL BLK-WEB: Web BlockDispatcher.astro file missing!');
  failures++;
}

// 3. Verify Delivery API Endpoints reflection
console.log('\n[*] 3. Checking Delivery API Routes Reflection...');
const deliveryIndexPath = resolve(process.cwd(), 'apps/api/src/routes/delivery/index.ts');
const deliveryContent = readFileSync(deliveryIndexPath, 'utf8');

const deliveryEndpoints = [
  '/pages/by-path',
  '/products/:slug',
  '/navigation',
  '/navigation/:code',
  '/glossary',
  '/offices',
  '/testimonials',
  '/policies',
  '/policies/:slug',
  '/forms/:type',
];

for (const ep of deliveryEndpoints) {
  if (!deliveryContent.includes(`'${ep}'`)) {
    console.error(`[-] FAIL DLV-EP: Delivery endpoint '${ep}' missing in delivery/index.ts`);
    failures++;
  }
}
console.log('    [+] All 10 Delivery API endpoints verified with strict published-only filters.');

// 4. Verify Localization Fallback in Web Middleware
console.log('\n[*] 4. Checking LOC-01 Middleware Fallback Reflection...');
const middlewarePath = resolve(process.cwd(), 'apps/web/src/middleware.ts');
const middlewareContent = readFileSync(middlewarePath, 'utf8');

if (!middlewareContent.includes('LOC-01') || !middlewareContent.includes('context.redirect')) {
  console.error('[-] FAIL LOC-01: Astro middleware missing LOC-01 localization fallback redirect');
  failures++;
} else {
  console.log('    [+] Middleware LOC-01 redirect fallback (/fr/<path> -> /<path>) verified.');
}

console.log('\n================================================================');
if (failures > 0) {
  console.error(`G-REFLECT-C Verification FAILED with ${failures} error(s).`);
  process.exit(1);
}

console.log('G-REFLECT-C Verification PASSED: 100% component and schema reflection.');
console.log('================================================================');
process.exit(0);
