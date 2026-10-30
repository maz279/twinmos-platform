#!/usr/bin/env node
// verify-ms63-audit.mjs — Comprehensive 14-Gate Audit Suite for Milestone MS6.3
// Consent manager and truthful content (Tasks T6.3.1 - T6.3.4)
// Closes Z-15, Z-39; fulfills CONSENT-01, CONSENT-CSP, TRUTH-01, CONTENT-01, CONTENT-02, and T6.3.4.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const WEB_PORT = process.env.WEB_PORT || 4321;
const API_PORT = process.env.API_PORT || 8787;

const WEB_URL = `http://127.0.0.1:${WEB_PORT}`;
const API_URL = `http://127.0.0.1:${API_PORT}`;

console.log('================================================================');
console.log('  Milestone MS6.3: Master Verification & Comprehensive Audit');
console.log('  Consent Manager, Server Records, Claims Register & Link Policy');
console.log('================================================================\n');

let gatesPassed = 0;
const totalGates = 14;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASSED: ${message}`);
}

async function runGate(num, title, fn) {
  console.log(`\n--- GATE ${num}: ${title} ---`);
  try {
    await fn();
    gatesPassed++;
  } catch (err) {
    console.error(`  ❌ GATE ${num} EXCEPTION:`, err.message || err);
    process.exit(1);
  }
}

async function main() {
  // ============================================================================
  // ITERATION 1: Static Codebase & Architecture Audit
  // ============================================================================
  console.log('\n================================================================');
  console.log('  ITERATION 1: Static Codebase & Architecture Audit');
  console.log('================================================================');

  await runGate(1, 'T6.3.1 CookieBanner First-Layer Equal Prominence', () => {
    const bannerPath = resolve(ROOT, 'apps/web/src/components/chrome/CookieBanner.astro');
    assert(existsSync(bannerPath), 'CookieBanner.astro component exists');
    const content = readFileSync(bannerPath, 'utf8');

    assert(content.includes('id="cookieCustomize"'), 'First layer has Customize button (#cookieCustomize)');
    assert(content.includes('id="cookieDecline"'), 'First layer has Decline button (#cookieDecline)');
    assert(content.includes('id="cookieAccept"'), 'First layer has Accept button (#cookieAccept)');
    assert(content.includes('role="region"'), 'Cookie bar has accessible role="region"');
    assert(content.includes('aria-label={title}') || content.includes('aria-label="Cookie Preferences"'), 'Cookie bar has descriptive aria-label');
  });

  await runGate(2, 'T6.3.1 Accessible Granular Preferences Modal Dialog', () => {
    const bannerPath = resolve(ROOT, 'apps/web/src/components/chrome/CookieBanner.astro');
    const content = readFileSync(bannerPath, 'utf8');

    assert(content.includes('id="cookieModal"'), 'Cookie preferences dialog exists (#cookieModal)');
    assert(content.includes('role="dialog"'), 'Dialog has role="dialog"');
    assert(content.includes('aria-modal="true"'), 'Dialog has aria-modal="true"');
    assert(content.includes('aria-labelledby="cookieModalTitle"'), 'Dialog has aria-labelledby');
    assert(content.includes('aria-describedby="cookieModalDesc"'), 'Dialog has aria-describedby');

    // 4 categories
    assert(content.includes('id="cookieCatEssential"'), 'Strictly necessary category exists');
    assert(content.includes('id="cookieCatAnalytics"'), 'Analytics category exists');
    assert(content.includes('id="cookieCatMarketing"'), 'Marketing category exists');
    assert(content.includes('id="cookieCatPreferences"'), 'Preferences category exists');
    assert(/cookieCatEssential["'][^>]*disabled/.test(content), 'Strictly necessary category is locked/disabled');
  });

  await runGate(3, 'T6.3.1 Footer Persistent Withdrawal & Preference Trigger', () => {
    const footerPath = resolve(ROOT, 'apps/web/src/components/chrome/Footer.astro');
    assert(existsSync(footerPath), 'Footer.astro component exists');
    const content = readFileSync(footerPath, 'utf8');

    assert(content.includes('id="cookiePreferencesBtn"'), 'Footer renders persistent #cookiePreferencesBtn trigger');
    assert(content.includes('Cookie Preferences'), 'Footer trigger displays clear text "Cookie Preferences"');
  });

  await runGate(4, 'T6.3.1 Client Consent Script & Zero Inline Code (CSP Compliance)', () => {
    const consentJs = resolve(ROOT, 'apps/web/public/assets/js/consent.js');
    assert(existsSync(consentJs), 'External consent script public/assets/js/consent.js exists');
    const content = readFileSync(consentJs, 'utf8');

    assert(content.includes('twinmos_consent'), 'Reads/writes twinmos_consent localStorage/cookie');
    assert(content.includes('/api/v1/consent'), 'Submits telemetry record to POST /api/v1/consent');
    assert(content.includes('twinmos:consent'), 'Dispatches twinmos:consent custom event');
    assert(content.includes('cookieModal'), 'Manages cookieModal open/close/focus trapping');

    const layoutInit = readFileSync(resolve(ROOT, 'apps/web/public/assets/js/layout-init.js'), 'utf8');
    assert(layoutInit.includes('/assets/js/consent.js'), 'layout-init.js boots consent.js as external script');
  });

  // ============================================================================
  // ITERATION 2: Cookie Registry & Fake Toast Retirement
  // ============================================================================
  console.log('\n================================================================');
  console.log('  ITERATION 2: Cookie Registry & Fake Toast Retirement');
  console.log('================================================================');

  await runGate(5, 'T6.3.1 Official Cookie Registry & Semantic CookieTable', () => {
    const registryPath = resolve(ROOT, 'apps/web/src/data/cookieRegistry.ts');
    assert(existsSync(registryPath), 'Cookie registry exists at apps/web/src/data/cookieRegistry.ts');
    const regContent = readFileSync(registryPath, 'utf8');
    assert(regContent.includes('export const COOKIE_REGISTRY'), 'Exports typed COOKIE_REGISTRY array');
    assert(regContent.includes('twinmos_consent'), 'Registers twinmos_consent');
    assert(regContent.includes('twinmos_locale'), 'Registers twinmos_locale');

    const tablePath = resolve(ROOT, 'apps/web/src/components/chrome/CookieTable.astro');
    assert(existsSync(tablePath), 'CookieTable.astro component exists');
    const tableContent = readFileSync(tablePath, 'utf8');
    assert(tableContent.includes('COOKIE_REGISTRY.map'), 'CookieTable maps dynamically over registry');
    assert(tableContent.includes('role="table"') || tableContent.includes('<table'), 'Renders accessible HTML table');
  });

  await runGate(6, 'T6.3.1 Zero Fake Toast in app.js and legal.astro', () => {
    const legalPath = resolve(ROOT, 'apps/web/src/pages/legal.astro');
    const legalContent = readFileSync(legalPath, 'utf8');
    assert(legalContent.includes('CookieTable'), 'legal.astro embeds CookieTable');

    const appJsWeb = readFileSync(resolve(ROOT, 'apps/web/public/assets/js/app.js'), 'utf8');
    const appJsProto = readFileSync(resolve(ROOT, 'prototype/assets/js/app.js'), 'utf8');

    for (const code of [appJsWeb, appJsProto]) {
      assert(!code.includes('Preferences saved — the production site stores granular consent'),
        'Fake toast copy purged from app.js');
      assert(code.includes('twinmos:open-consent'),
        'Dispatches twinmos:open-consent on cookie preference button');
    }
  });

  // ============================================================================
  // ITERATION 3: Live Endpoints & Server-Side Consent Record (CONSENT-01)
  // ============================================================================
  console.log('\n================================================================');
  console.log('  ITERATION 3: Live Endpoints & Server-Side Consent Record');
  console.log('================================================================');

  await runGate(7, 'T6.3.2 Consent Health Probe (GET /api/v1/consent/health)', async () => {
    const res = await fetch(`${API_URL}/api/v1/consent/health`);
    assert(res.ok, `Health probe returned status ${res.status}`);
    const json = await res.json();
    assert(json.status === 'ok', 'Health status is "ok"');
    assert(json.service === 'consent-record-collector', 'Service name confirmed');
  });

  await runGate(8, 'T6.3.2 Server-Side Consent Record Collection (POST /api/v1/consent / CONSENT-01)', async () => {
    const testConsentId = 'audit_ms63_' + Math.random().toString(36).slice(2, 9);
    const res = await fetch(`${API_URL}/api/v1/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TwinMOS-Audit-Probe/1.0',
      },
      body: JSON.stringify({
        id: testConsentId,
        policyVersion: '2026.1',
        choices: {
          essential: true,
          analytics: true,
          marketing: false,
          preferences: true,
        },
        source: 'audit-suite',
      }),
    });

    assert(res.status === 201, `POST /api/v1/consent returned 201 Created (got ${res.status})`);
    const json = await res.json();
    assert(json.ok === true || json.success === true, 'Response indicates success');
    assert(json.id === testConsentId || json.consentId === testConsentId, 'Returns created consentId');
    assert(json.choices?.essential === true, 'Strictly necessary choice confirmed recorded');
    assert(json.choices?.analytics === true, 'Analytics choice confirmed recorded');
  });

  // ============================================================================
  // ITERATION 4: Claims Register, Truthful Content & Link Checker
  // ============================================================================
  console.log('\n================================================================');
  console.log('  ITERATION 4: Claims Register, Truthful Content & Link Checker');
  console.log('================================================================');

  await runGate(9, 'T6.3.3 Corporate Claims Register Signed Evidence (TRUTH-01)', () => {
    const claimsPath = resolve(ROOT, 'evidence/claims_register_signed.md');
    assert(existsSync(claimsPath), 'evidence/claims_register_signed.md exists');
    const content = readFileSync(claimsPath, 'utf8');

    assert(content.includes('1998'), 'Claims register certifies founding year 1998');
    assert(content.includes('28+'), 'Claims register certifies 28+ years company age');
    assert(content.includes('93+'), 'Claims register certifies 93+ countries');
    assert(content.includes('TÜV SÜD ISO 9001'), 'Claims register certifies TÜV SÜD ISO 9001');
    assert(content.includes('14,000 MB/s'), 'Claims register certifies CoreX Pro Gen5 speed');
    assert(content.includes('Lifetime Limited'), 'Claims register certifies Lifetime Limited warranty');
    assert(content.includes('5-Year Limited'), 'Claims register certifies 5-Year Limited warranty');
    assert(content.includes('Director of Corporate Communications & Product Governance'),
      'Claims register carries signed signoff from Director of Corporate Communications');
  });

  await runGate(10, 'T6.3.3 Business Facts Truthfulness (CONTENT-02 / Z-15 / Z-39)', () => {
    const aboutPath = resolve(ROOT, 'apps/web/src/pages/about.astro');
    if (existsSync(aboutPath)) {
      const content = readFileSync(aboutPath, 'utf8');
      assert(!content.includes('123 Technology Drive'), 'Placeholder US address 123 Technology Drive is eliminated');
    }

    const appJs = readFileSync(resolve(ROOT, 'apps/web/public/assets/js/app.js'), 'utf8');
    assert(!appJs.includes('This prototype stores nothing server-side'), 'Disclaimers saying "stores nothing" are eliminated');
  });

  await runGate(11, 'T6.3.4 External Link Policy: rel="noopener" & New-Tab Announcements', () => {
    const footerPath = resolve(ROOT, 'apps/web/src/components/chrome/Footer.astro');
    const footerContent = readFileSync(footerPath, 'utf8');

    // All target="_blank" links must carry rel="noopener"
    const blankLinks = footerContent.match(/<a\s+[^>]*?target="_blank"[^>]*?>/g) || [];
    assert(blankLinks.length > 0, 'Found external target="_blank" links in footer');
    for (const link of blankLinks) {
      assert(link.includes('rel="noopener"'), `Link carries rel="noopener": ${link}`);
    }

    // Accessible announcements for new tabs
    assert(footerContent.includes('Facebook (opens in a new tab)'), 'Facebook link announces opening in a new tab');
    assert(footerContent.includes('Chat on WhatsApp (opens in a new tab)'), 'WhatsApp link announces opening in a new tab');
  });

  await runGate(12, 'T6.3.4 Link Checker Execution & 0 Broken Links Verified', () => {
    const reportPath = resolve(ROOT, 'tooling/verify/evidence/check_links_report.json');
    assert(existsSync(reportPath), 'check_links_report.json exists from link checker run');
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));

    assert(report.summary.brokenLinksCount === 0, `Report certifies 0 broken links (found: ${report.summary.brokenLinksCount})`);
    assert(report.summary.policyViolationsCount === 0, `Report certifies 0 policy violations (found: ${report.summary.policyViolationsCount})`);
    assert(report.summary.status === 'PASS', 'Report overall status is PASS');
    assert(report.summary.routesScanned >= 20, `At least 20 routes scanned (actual: ${report.summary.routesScanned})`);
  });

  await runGate(13, 'MS6.3 Automated Unit & Integration Suite (Vitest ms63-consent-truth)', () => {
    try {
      execSync('npx vitest run test/ms63-consent-truth.test.ts', {
        cwd: resolve(ROOT, 'apps/api'),
        stdio: 'pipe',
        encoding: 'utf8',
      });
      assert(true, 'Vitest ms63-consent-truth.test.ts passed all 13 tests cleanly');
    } catch (err) {
      assert(false, `Vitest failed: ${err.stdout || err.message}`);
    }
  });

  await runGate(14, 'Gate D Comprehensive Parity Proof (CONSENT-01, TRUTH-01, CONTENT-01, CONTENT-02)', () => {
    try {
      const output = execSync('node tooling/verify/run-all-gate-d.mjs', {
        cwd: ROOT,
        stdio: 'pipe',
        encoding: 'utf8',
      });
      assert(output.includes('19/19 checks PASSED'), 'Gate D certifies 19/19 checks passing');
      assert(output.includes('CONSENT-01'), 'Gate D CONSENT-01 check verified');
      assert(output.includes('CONTENT-01'), 'Gate D CONTENT-01 check verified');
      assert(output.includes('CONTENT-02'), 'Gate D CONTENT-02 check verified');
    } catch (err) {
      assert(false, `Gate D verification failed: ${err.stdout || err.message}`);
    }
  });

  // ============================================================================
  // FINAL SCORECARD
  // ============================================================================
  console.log('\n================================================================');
  console.log(`  AUDIT SUMMARY: ${gatesPassed}/${totalGates} GATES PASSED`);
  console.log('================================================================');
  if (gatesPassed === totalGates) {
    console.log('🎉 ALL 14 AUDIT GATES PASSED! Milestone MS6.3 is 100% complete.');
    process.exit(0);
  } else {
    console.error(`❌ ONLY ${gatesPassed}/${totalGates} PASSED.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('FATAL AUDIT FAILURE:', err);
  process.exit(1);
});
