// Gate C Content Model & Editors Verification Suite Runner (VC-C: 12 Checks)
// Runs all automated verification checks and prints an audited scorecard.
import { execSync } from 'node:child_process';

console.log('================================================================');
console.log('       TwinMOS Phase C Content Model & Editors: Gate C (VC-C)');
console.log('================================================================\n');

const checks = [
  {
    id: 'VC-C-01',
    name: 'GREF-C: Component Reflection Across Database, Contracts, Admin & Astro Web',
    cmd: 'node tooling/verify/greflect-c.mjs',
  },
  {
    id: 'VC-C-02',
    name: 'CMS-E2: Navigation Menus & Hierarchical Public Delivery Tree',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "CMS-E2"',
  },
  {
    id: 'VC-C-03',
    name: 'CMS-E3: Page-Builder Exact Path Resolution via Delivery API',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "serves page by exact path"',
  },
  {
    id: 'VC-C-04',
    name: 'CMS-E4: Automated 301 Redirect Generation on Path Mutation',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "mutating page path automatically generates 301 redirect"',
  },
  {
    id: 'VC-C-05',
    name: 'CMS-E6: Product Specs Dictionary, Launch Date & Warranty Tier Delivery',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "creates product with specsDictionary"',
  },
  {
    id: 'VC-C-06',
    name: 'CMS-E7: Product Lifecycle Archive & Public Delivery HTTP 410 Gone',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "archiving product causes public Delivery API to return HTTP 410 Gone"',
  },
  {
    id: 'VC-C-07',
    name: 'CMS-E8: Glossary Term A-Z Search & Office Registry Public Delivery',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "creates glossary term and delivers via A-Z search"',
  },
  {
    id: 'VC-C-08',
    name: 'CMS-E14: Corporate Testimonials, Policy Documents & Forms API Delivery',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "creates and delivers policy document by slug"',
  },
  {
    id: 'VC-C-09',
    name: 'ADMIN-EDIT: Accessible Keyboard Reordering (WCAG 2.2 SC 2.5.7) & 25 Blocks',
    cmd: 'node tooling/verify/check-admin-edit.mjs',
  },
  {
    id: 'VC-C-10',
    name: 'LOC-01: Localization Routing Fallback & Corrupted UTF-8 Strict Rejection (422)',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "strictly rejects corrupted UTF encodings"',
  },
  {
    id: 'VC-C-11',
    name: 'WF-01: Editorial Concurrency Control & Stale Version 409 Conflict Rejection',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "rejects stale version edit with HTTP 409 Conflict"',
  },
  {
    id: 'VC-C-12',
    name: 'MEDIA-01: Media Pipeline Decorative Flag, Empty Alt & Focal Point Storage',
    cmd: 'npm test --workspace @twinmos/api -- test/phase-c.e2e.test.ts -t "MEDIA-01"',
  },
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  process.stdout.write(`[*] Checking ${check.id}: ${check.name}... `);
  try {
    execSync(check.cmd, { stdio: 'pipe', encoding: 'utf8' });
    console.log('PASS');
    passed++;
  } catch (err) {
    console.log('FAIL');
    console.error(err.stdout || err.stderr || err.message);
    failed++;
  }
}

console.log('\n================================================================');
console.log(`Gate C Verification Complete: ${passed}/${checks.length} checks PASSED (${failed} failed).`);
console.log('================================================================');

if (failed > 0) process.exit(1);
process.exit(0);
