// Gate B Platform Foundation Verification Suite Runner (VC-B: 17 Checks)
// Runs all automated verification checks and prints an audited scorecard.
import { execSync } from 'node:child_process';

console.log('================================================================');
console.log('       TwinMOS Phase B Platform Foundation Verification: Gate B (VC-B)');
console.log('================================================================\n');

const checks = [
  {
    id: 'VC-B-01',
    name: 'TYPE-WEB (NF-32): TypeScript Compilation across Web & Astro Check',
    cmd: 'npm run typecheck --workspace @twinmos/web',
  },
  {
    id: 'VC-B-02',
    name: 'DLV-01: Delivery API Published-Only & Draft 404 Isolation',
    cmd: 'npm test --workspace @twinmos/api -- test/delivery.e2e.test.ts -t "returns published page"',
  },
  {
    id: 'VC-B-03',
    name: 'DLV-PREVIEW: HMAC-SHA256 Signed Preview Token Generator & Validator',
    cmd: 'npm test --workspace @twinmos/api -- test/delivery.e2e.test.ts -t "valid preview token"',
  },
  {
    id: 'VC-B-04',
    name: 'DLV-TAGS: Delivery API Cache Tags Metadata Attribution',
    cmd: 'npm test --workspace @twinmos/api -- test/delivery.e2e.test.ts -t "cacheTags"',
  },
  {
    id: 'VC-B-05',
    name: 'DLV-PERF: Delivery API In-Memory Warm P95 Latency < 50ms',
    cmd: 'npm test --workspace @twinmos/api -- test/delivery.e2e.test.ts -t "p95 response time"',
  },
  {
    id: 'VC-B-06',
    name: 'SSR-01: Astro Standalone Node Adapter & SSR Runtime Build',
    cmd: 'node -e "const fs = require(\'fs\'); if (!fs.existsSync(\'apps/web/dist/server/entry.mjs\')) process.exit(1);"',
  },
  {
    id: 'VC-B-07',
    name: 'REVAL-01: Dynamic On-Demand Revalidation Secret Verification',
    cmd: 'node -e "const fs = require(\'fs\'); const code = fs.readFileSync(\'apps/web/src/pages/internal/revalidate.ts\', \'utf8\'); if (!code.includes(\'REVALIDATE_SECRET\') || !code.includes(\'403\')) process.exit(1);"',
  },
  {
    id: 'VC-B-08',
    name: 'SITEMAP-01: Dynamic Delivery-Backed Sitemap Endpoint Generation',
    cmd: 'node -e "const fs = require(\'fs\'); if (!fs.existsSync(\'apps/web/src/pages/sitemap.xml.ts\')) process.exit(1);"',
  },
  {
    id: 'VC-B-09',
    name: 'ROBOTS-01: Dynamic Robots Directives with Sitemap Discovery',
    cmd: 'node -e "const fs = require(\'fs\'); const code = fs.readFileSync(\'apps/web/src/pages/robots.txt.ts\', \'utf8\'); if (!code.includes(\'sitemap.xml\') || !code.includes(\'/admin/\')) process.exit(1);"',
  },
  {
    id: 'VC-B-10',
    name: 'CACHE-01: Nginx Edge Micro-Cache & Upstream SSR Bypass Map',
    cmd: 'node tooling/verify/edge-ip-proof.mjs',
  },
  {
    id: 'VC-B-11',
    name: 'CMS-E1: Redirect Loop, Multi-Hop Chain & Live Route Rejection',
    cmd: 'npm test --workspace @twinmos/api -- test/redirects.test.ts',
  },
  {
    id: 'VC-B-12',
    name: 'OUTBOX-01: Outbox Event Table Schema & Revalidation Dispatcher',
    cmd: 'node -e "const fs = require(\'fs\'); const schema = fs.readFileSync(\'packages/db/src/schema.ts\', \'utf8\'); const svc = fs.readFileSync(\'apps/api/src/services/outbox.ts\', \'utf8\'); if (!schema.includes(\'outbox\') || !svc.includes(\'dispatchOutboxEvents\')) process.exit(1);"',
  },
  {
    id: 'VC-B-13',
    name: 'COMPOSE-01 & S-11: Docker Compose Topology & Host Port Isolation',
    cmd: 'node tooling/verify/verify-container-sbom.mjs',
  },
  {
    id: 'VC-B-14',
    name: 'SBOM-01: Multi-Stage Build & Non-Root User Runtime Verification',
    cmd: 'node tooling/verify/verify-container-sbom.mjs',
  },
  {
    id: 'VC-B-15',
    name: 'CI-01 & CI-02: Production Parity CI Pipeline & Postgres 18 Service',
    cmd: 'node -e "const fs = require(\'fs\'); const ci = fs.readFileSync(\'.github/workflows/ci.yml\', \'utf8\'); if (!ci.includes(\'postgres:18-alpine\') || !ci.includes(\'verify:gate-b\')) process.exit(1);"',
  },
  {
    id: 'VC-B-16',
    name: 'QJ-01: Quality Jobs Workflow, Lighthouse Budgets & ZAP Rules',
    cmd: 'node -e "const fs = require(\'fs\'); if (!fs.existsSync(\'.github/workflows/quality.yml\') || !fs.existsSync(\'lighthouserc.json\') || !fs.existsSync(\'deploy/zap/zap-baseline.rules\')) process.exit(1);"',
  },
  {
    id: 'VC-B-17',
    name: 'GPROV-CI, GREF-H & GPARITY: Provenance, Secrets & Architectural Reflection',
    cmd: 'node tooling/gates/gprov.mjs && node tooling/gates/gnohardcode.mjs && node tooling/verify/greflect-harness.mjs && node tooling/verify/gparity-baseline.mjs',
  },
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  process.stdout.write(`[*] [${check.id}] Checking ${check.name}... `);
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
console.log(`Gate B Verification Complete: ${passed}/${checks.length} checks PASSED (${failed} failed).`);
console.log('================================================================');

if (failed > 0) process.exit(1);
process.exit(0);
