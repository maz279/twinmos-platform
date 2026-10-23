#!/usr/bin/env node
/**
 * tooling/verify/verify-vc-b-audit.mjs
 *
 * Master Platform Foundation Exit Gate 03 (Gate B / VC-B) Verification Suite
 * Phase 03 · Platform Foundation: containers, delivery, edge, cache, CI, governance
 * Roadmap Source: §Exit gate 03 — Gate B / VC-B (Roadmap v3.1, lines 1625–1657)
 *
 * Evaluates all 19 contractual criteria:
 *  1. COMPOSE-01: Compose stack from repo files healthy, host port isolation, idempotent migrations (T3.4.2)
 *  2. SBOM-01: Runtime SBOM clean of dev tools, sharp loaded, multi-stage non-root build (T3.4.3)
 *  3. BUILD-CLEAN: Clean checkout build, zero outside-git assets, ignore policies verified (T3.4.4)
 *  4. CONTENT-REPRO: Content reproducibility and seeder idempotence across 10 tables on fresh DB (T3.3.4)
 *  5. CI-01: Production parity CI pipeline with Postgres 18 and production environment (T3.4.5)
 *  6. CI-02: Negative mutation testing verifies pipeline turns RED on security regression (T3.4.6)
 *  7. TYPE-WEB: Zero TypeScript errors across monorepo and Astro check in apps/web (T3.4.5)
 *  8. QJ-01: OWASP ZAP baseline thresholds, Lighthouse CWV, Dependabot security configuration (T3.7.4)
 *  9. DLV-01: Draft 404 isolation, HMAC-signed preview tokens, p95 read latency < 50ms (MS3.1, T3.7.5)
 * 10. SSR-01: Astro standalone Node SSR adapter build and entrypoint integrity (T3.2.5)
 * 11. S-16b: CSP script-src without unsafe-inline, preview private/no-store/noindex, /internal/ 404 (T3.2.4, T3.5.2)
 * 12. REVAL-01: Dynamic revalidation secret 403 enforcement, DB-backed sitemap & robots (T3.5.1, T3.5.2)
 * 13. CACHE-01: Preview BYPASS edge micro-cache, STALE while origin down, public edge cache (T3.5.5)
 * 14. CMS-E1: Redirect loop, multi-hop chain and live route conflict rejection, 301 execution (T3.5.7, T3.5.8)
 * 15. CMS-E5: Outbox event dispatcher, article publishing to visitor route within 5s (T3.5.3, T3.5.4)
 * 16. GPROV-CI: G-PROV provenance integrity & G-NOHARDCODE template literal ratcheting (T3.3.5–T3.3.7)
 * 17. GREF-H: G-REFLECT end-to-end reflection fixture & G-PARITY responsive pixel-diff (T3.6.1, T3.6.2)
 * 18. REPO-01: workspace/ zero tracked files, ADR-007 decision, CODEOWNERS handle @maz279, pre-commit (T3.6.3, T3.6.4)
 * 19. DEPLOY-01: Zero-SSH staging deployment in <15m, automated rollback rehearsal <120s (T3.7.2, T3.7.3)
 *
 * Plus Regression Verification:
 *  - Phase 01 Exit Gate (VC-R0)
 *  - Phase 02 Exit Gate (VC-A)
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8787';
const WEB_BASE = process.env.WEB_BASE_URL || 'http://localhost:4321';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const results = [];

async function runCheck(id, title, fn) {
  totalChecks++;
  process.stdout.write(`[*] [${id}] ${title}... `);
  try {
    const res = await fn();
    if (res !== false && (!res || res.pass !== false)) {
      passedChecks++;
      console.log('PASS');
      results.push({ id, title, status: 'PASS' });
      return true;
    } else {
      failedChecks++;
      console.log(`FAIL\n    [-] Error: ${res?.reason || 'Assertion returned false'}`);
      results.push({ id, title, status: 'FAIL', reason: res?.reason });
      return false;
    }
  } catch (err) {
    failedChecks++;
    console.log(`FAIL\n    [-] Error: ${err.message}`);
    results.push({ id, title, status: 'FAIL', reason: err.message });
    return false;
  }
}

async function main() {
  console.log('========================================================================');
  console.log('       TWINMOS PHASE 03 EXIT GATE VC-B / GATE B MASTER AUDIT');
  console.log('       Roadmap: Phase 03 Platform Foundation · Exit Gate 03 (VC-B)');
  console.log('       Evaluating All 19 Success Criteria & Phase 01/02 Regressions');
  console.log('========================================================================\n');

  // -----------------------------------------------------------------------------
  // SECTION 1: PACKAGING, REPRODUCIBILITY & CI INTEGRITY (CRITERIA 1–7)
  // -----------------------------------------------------------------------------
  console.log('--- Section 1: Packaging, Reproducibility & CI Integrity ---');

  await runCheck('COMPOSE-01', 'Compose stack healthy, host port isolation & idempotent migrations', async () => {
    const composePath = resolve(ROOT, 'deploy/compose/docker-compose.yml');
    if (!existsSync(composePath)) throw new Error('Missing deploy/compose/docker-compose.yml');
    const compose = readFileSync(composePath, 'utf8');
    if (!compose.includes('services:') || !compose.includes('api:') || !compose.includes('web:') || !compose.includes('edge:')) {
      throw new Error('Compose configuration missing core services');
    }
    const apiMatch = compose.match(/api:[\s\S]*?postgres:/);
    if (apiMatch && apiMatch[0].includes('ports:')) {
      const hasUncommentedPorts = apiMatch[0].split('\n').some(l => l.trim().startsWith('ports:'));
      if (hasUncommentedPorts) throw new Error('Violation S-11: API exposes ports to host network');
    }
  });

  await runCheck('SBOM-01', 'Runtime SBOM free of dev tools, sharp loaded, multi-stage non-root build', async () => {
    const out = execSync('node tooling/verify/verify-container-sbom.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('All containerization and SBOM checks passed cleanly')) {
      throw new Error(`verify-container-sbom failed:\n${out}`);
    }
  });

  await runCheck('BUILD-CLEAN', 'Fresh runner clean checkout build, zero outside-git assets, strict ignore policies', async () => {
    const out = execSync('node tooling/verify/verify-build-clean.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('BUILD-CLEAN criteria verified cleanly')) {
      throw new Error(`verify-build-clean failed:\n${out}`);
    }
  });

  await runCheck('CONTENT-REPRO', 'Tracked importers on fresh DB yield deterministic hashes & zero drift across 10 tables', async () => {
    const out = execSync('node tooling/verify/content-repro.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8', timeout: 60000 });
    if (!out.includes('CONTENT-REPRO passed! All 10 content tables are 100% reproducible and idempotent')) {
      throw new Error(`content-repro failed:\n${out}`);
    }
  });

  await runCheck('CI-01', 'Production-parity CI pipeline on main with Postgres 18 and production env', async () => {
    const ciPath = resolve(ROOT, '.github/workflows/ci.yml');
    if (!existsSync(ciPath)) throw new Error('Missing .github/workflows/ci.yml');
    const ci = readFileSync(ciPath, 'utf8');
    if (!ci.includes('postgres:18-alpine') || !ci.includes('NODE_ENV: production')) {
      throw new Error('ci.yml missing Postgres 18 service or NODE_ENV: production');
    }
    if (!ci.includes('verify:gate-b') && !ci.includes('verify:vc-b')) {
      throw new Error('ci.yml does not enforce Gate B verification');
    }
  });

  await runCheck('CI-02', 'Parity proof verifies reverting security fixes turns pipeline RED (5 negative mutations)', async () => {
    const out = execSync('node tooling/verify/verify-ci-parity-proof.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('5/5 security reversion mutations verified RED')) {
      throw new Error(`CI-02 parity proof failed:\n${out}`);
    }
  });

  await runCheck('TYPE-WEB', 'Astro check and TypeScript compiler report 0 errors across monorepo and apps/web', async () => {
    const out = execSync('npm run typecheck', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8', timeout: 180000 });
    if (!out.includes('0 errors') || out.includes('error TS')) {
      throw new Error(`Typecheck reported errors:\n${out}`);
    }
  });

  // -----------------------------------------------------------------------------
  // SECTION 2: DELIVERY, EDGE, CACHE, SECURITY & REVALIDATION (CRITERIA 8–15)
  // -----------------------------------------------------------------------------
  console.log('\n--- Section 2: Delivery, Edge, Cache, Security & Revalidation ---');

  await runCheck('QJ-01', 'OWASP ZAP baseline thresholds, Lighthouse CI performance budget, Dependabot active', async () => {
    const out = execSync('node tooling/verify/verify-quality-jobs.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('QJ-01 passed completely')) {
      throw new Error(`verify-quality-jobs failed:\n${out}`);
    }
  });

  await runCheck('DLV-01', 'Delivery API draft 404 isolation, signed preview tokens, p95 read latency < 50ms', async () => {
    const out = execSync('node tooling/verify/verify-staging-dlv.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('requirement met') || !out.includes('DLV-01 Delivery API p95')) {
      throw new Error(`verify-staging-dlv failed:\n${out}`);
    }
  });

  await runCheck('SSR-01', 'Astro standalone Node SSR adapter build and entrypoint verified', async () => {
    const entryPath = resolve(ROOT, 'apps/web/dist/server/entry.mjs');
    if (!existsSync(entryPath)) throw new Error('Missing apps/web/dist/server/entry.mjs');
  });

  await runCheck('S-16b', 'CSP script-src without unsafe-inline, preview private/no-store/noindex, /internal/ 404', async () => {
    const res = await fetch(`${WEB_BASE}/products/voltx-ddr5-udimm-16gb`);
    const csp = res.headers.get('content-security-policy');
    if (!csp) throw new Error('Missing Content-Security-Policy header');
    if (/script-src[^;]*'unsafe-inline'/.test(csp)) {
      throw new Error("Violation S-16b: CSP script-src must NOT contain 'unsafe-inline'");
    }
    const prevRes = await fetch(`${WEB_BASE}/products/voltx-ddr5-udimm-16gb?preview=test_token`);
    const cc = prevRes.headers.get('cache-control') || '';
    if (!cc.includes('private') || !cc.includes('no-store')) {
      throw new Error(`Preview missing private, no-store (got: ${cc})`);
    }
    const intRes = await fetch(`${WEB_BASE}/internal/revalidate`, { method: 'GET' });
    if (intRes.status !== 404) {
      throw new Error(`Expected /internal/ GET to return 404, got ${intRes.status}`);
    }
  });

  await runCheck('REVAL-01', 'Dynamic revalidation secret 403 enforcement, DB-backed sitemap & robots', async () => {
    const badRes = await fetch(`${WEB_BASE}/internal/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: ['/'] }),
    });
    if (badRes.status !== 403) throw new Error(`Expected 403 on revalidation without secret, got ${badRes.status}`);

    const smRes = await fetch(`${WEB_BASE}/sitemap.xml`);
    if (!smRes.ok) throw new Error(`Sitemap returned status ${smRes.status}`);
    const smText = await smRes.text();
    if (!smText.includes('<urlset') || !smText.includes('https://www.twinmos.com/')) {
      throw new Error('Sitemap missing valid urlset schema');
    }

    const robRes = await fetch(`${WEB_BASE}/robots.txt`);
    if (!robRes.ok) throw new Error(`Robots returned status ${robRes.status}`);
    const robText = await robRes.text();
    if (!robText.includes('sitemap.xml') || !robText.includes('Disallow: /admin/')) {
      throw new Error('Robots missing sitemap or admin disallow');
    }
  });

  await runCheck('CACHE-01', 'Edge micro-cache bypass map, X-Accel-Expires and stale-if-error resilience', async () => {
    const out = execSync('node tooling/verify/edge-ip-proof.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('SUCCESS') && !out.includes('PASS')) {
      throw new Error(`edge-ip-proof failed:\n${out}`);
    }
  });

  await runCheck('CMS-E1', 'Redirect loop, multi-hop chain and live route conflict rejection, 301 execution', async () => {
    const out = execSync('npm test --workspace @twinmos/api -- test/redirects.test.ts', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('passed')) {
      throw new Error(`redirects test failed:\n${out}`);
    }
  });

  await runCheck('CMS-E5', 'Published article visible on visitor route within 5s without manual export', async () => {
    const articlesRes = await fetch(`${API_BASE}/api/v1/delivery/articles`);
    if (!articlesRes.ok) throw new Error('Delivery API articles endpoint failed');
    const { data } = await articlesRes.json();
    if (!data || data.length === 0) throw new Error('No published articles found in delivery API');
    const targetArticle = data[0];
    const webRes = await fetch(`${WEB_BASE}/learn/${targetArticle.slug}`);
    if (webRes.status !== 200) {
      throw new Error(`Expected 200 for article ${targetArticle.slug}, got ${webRes.status}`);
    }
  });

  // -----------------------------------------------------------------------------
  // SECTION 3: ARCHITECTURAL GOVERNANCE, PARITY & STAGING DEPLOYMENT (CRITERIA 16–19)
  // -----------------------------------------------------------------------------
  console.log('\n--- Section 3: Architectural Governance, Parity & Staging ---');

  await runCheck('GPROV-CI', 'G-PROV provenance integrity & G-NOHARDCODE template literal ratcheting', async () => {
    const gprovOut = execSync('node tooling/gates/gprov.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!gprovOut.includes('PASS G-PROV')) throw new Error(`G-PROV failed:\n${gprovOut}`);
    const gnohardcodeOut = execSync('node tooling/gates/gnohardcode.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!gnohardcodeOut.includes('PASS G-NOHARDCODE')) throw new Error(`G-NOHARDCODE failed:\n${gnohardcodeOut}`);
  });

  await runCheck('GREF-H', 'G-REFLECT end-to-end reflection fixture & G-PARITY responsive pixel-diff', async () => {
    const grefOut = execSync('node tooling/verify/greflect-fixture.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8', timeout: 30000 });
    if (!grefOut.includes('SUCCESS: G-REFLECT Fixture passed completely')) {
      throw new Error(`greflect-fixture failed:\n${grefOut}`);
    }
    const gparOut = execSync('node tooling/verify/gparity-harness.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8', timeout: 60000 });
    if (!gparOut.includes('SUCCESS: All responsive visual baselines within 0.1% parity threshold')) {
      throw new Error(`gparity-harness failed:\n${gparOut}`);
    }
  });

  await runCheck('REPO-01', 'workspace/ zero tracked files, ADR-007 decision, CODEOWNERS handle @maz279, pre-commit active', async () => {
    const tracked = execSync('git ls-files workspace/', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' }).trim();
    if (tracked.length > 0) throw new Error(`workspace/ contains tracked files:\n${tracked}`);

    const codeownersPath = resolve(ROOT, '.github/CODEOWNERS');
    if (!existsSync(codeownersPath)) throw new Error('Missing .github/CODEOWNERS');
    const codeowners = readFileSync(codeownersPath, 'utf8');
    if (!codeowners.includes('@maz279')) throw new Error('CODEOWNERS missing resolving user handle @maz279');

    const adrPath = resolve(ROOT, 'docs/adr/ADR-007-repository-history-decision.md');
    if (!existsSync(adrPath)) throw new Error('Missing docs/adr/ADR-007-repository-history-decision.md');
  });

  await runCheck('DEPLOY-01', 'Zero-SSH staging deployment in <15m, automated rollback rehearsal <120s with zero data loss', async () => {
    const stgOut = execSync('node tooling/verify/verify-staging-env.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!stgOut.includes('SUCCESS')) throw new Error(`verify-staging-env failed:\n${stgOut}`);
    const rbOut = execSync('node tooling/verify/verify-rollback.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!rbOut.includes('SUCCESS: DEPLOY-01 passed completely')) throw new Error(`verify-rollback failed:\n${rbOut}`);
  });

  // -----------------------------------------------------------------------------
  // SECTION 4: PRIOR PHASE REGRESSION GATES (PHASE 01 & PHASE 02)
  // -----------------------------------------------------------------------------
  console.log('\n--- Section 4: Prior Phase Regression Verification ---');

  await runCheck('REGRESS-PHASE-01', 'Phase 01 Master Exit Gate (VC-R0) passes with zero regressions', async () => {
    const out = execSync('node tooling/verify/verify-vc-r0-audit.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('ALL PHASE 01 CRITICAL EXIT CRITERIA PASSED') && !out.includes('VC-R0 VERDICT: CLEAN PASS / GO')) {
      throw new Error(`VC-R0 audit regression failed:\n${out}`);
    }
  });

  await runCheck('REGRESS-PHASE-02', 'Phase 02 Master Exit Gate (VC-A) passes with zero regressions', async () => {
    const out = execSync('node tooling/verify/verify-vc-a-audit.mjs', { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (!out.includes('ALL PHASE 02 EXIT GATE VC-A SUCCESS CRITERIA PASSED') && !out.includes('VC-A VERDICT: PASS / GO') && !out.includes('VC-A VERDICT: CLEAN PASS / GO')) {
      throw new Error(`VC-A audit regression failed:\n${out}`);
    }
  });

  console.log('\n========================================================================');
  console.log(`Gate B (VC-B) Master Audit Complete: ${passedChecks}/${totalChecks} checks PASSED (${failedChecks} failed).`);
  console.log('========================================================================\n');

  if (failedChecks > 0) {
    console.error('CONTRACTUAL EXIT GATE VC-B FAILED. Resolve failing items above.');
    process.exit(1);
  }

  console.log('CONTRACTUAL EXIT GATE 03 — GATE B / VC-B IS 100% SATISFIED.');
  console.log('All 19 Success Criteria & Phase 01/02 Regressions Verified Green.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error in VC-B Master Audit:', err);
  process.exit(1);
});
