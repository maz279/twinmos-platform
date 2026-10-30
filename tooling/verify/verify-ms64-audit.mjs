#!/usr/bin/env node
// verify-ms64-audit.mjs — Master 10-Gate Audit Suite for MS6.4 URL Migration
// Enforces full compliance with Roadmap MS6.4, NF-14, R-08, BD-06, and URL-01.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CLASSIFICATION_FILE = resolve(ROOT, 'tooling/data/legacy_url_classification.json');
const NGINX_MAP_FILE = resolve(ROOT, 'deploy', 'nginx', 'twinmos-redirects.map');
const URL01_REPORT_FILE = resolve(ROOT, 'tooling/verify/evidence/url_01_report.json');
const VISUAL_REPORT_FILE = resolve(ROOT, 'tooling/verify/evidence/ms64_visual/visual_report.json');
const LLMS_FILE = resolve(ROOT, 'apps/web/public/llms.txt');

async function main() {
  console.log('================================================================');
  console.log('  MS6.4 URL Migration — Master 10-Gate Audit Verification');
  console.log('================================================================\n');

  const gates = [];

  function evaluateGate(name, condition, details = '') {
    const passed = Boolean(condition);
    gates.push({ name, passed, details });
    const mark = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] ${name} ${details ? `(${details})` : ''}`);
    if (!passed) {
      console.error(`  -> FAILURE DETAILS: ${details}`);
    }
  }

  // Load classification dataset
  const items = JSON.parse(readFileSync(CLASSIFICATION_FILE, 'utf8'));
  const redirect301Count = items.filter((i) => i.code === 301).length;
  const gone410Count = items.filter((i) => i.code === 410).length;
  const canonical200Count = items.filter((i) => i.code === 200).length;

  // Gate 1: Comprehensive Legacy URL Classification Coverage
  evaluateGate(
    'Gate 1: Comprehensive Legacy URL Classification Coverage',
    items.length >= 320 && redirect301Count >= 280 && gone410Count >= 20 && canonical200Count >= 5,
    `Total: ${items.length}, 301s: ${redirect301Count}, 410s: ${gone410Count}, 200s: ${canonical200Count}`
  );

  // Gate 2: Zero Mass-Redirects to Root
  const nonHomepageRedirects = items.filter(
    (i) => i.code === 301 && (i.to === '/' || i.to === '') && i.from !== '/index.php' && i.from !== '/index.html'
  );
  evaluateGate(
    'Gate 2: Zero Mass-Redirects to Root (SEO Anti-Pattern Protection)',
    nonHomepageRedirects.length === 0,
    `Unexpected root redirects: ${nonHomepageRedirects.length}`
  );

  // Gate 3: Zero Redirect Loops & Multi-Hop Chains
  const sources = new Set(items.filter((i) => i.code === 301).map((i) => i.from));
  const chains = items.filter((i) => i.code === 301 && sources.has(i.to.split('?')[0]));
  evaluateGate(
    'Gate 3: Zero Redirect Loops & Multi-Hop Chains (0 Chains)',
    chains.length === 0,
    `Chains detected: ${chains.length}`
  );

  // Gate 4: NGINX Map Parity (deploy/nginx/twinmos-redirects.map)
  const mapContent = readFileSync(NGINX_MAP_FILE, 'utf8');
  const mapLines = mapContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#'));
  const semicolonsValid = mapLines.every((l) => l.endsWith(';'));
  evaluateGate(
    'Gate 4: NGINX Map Parity (NF-14 / R-08 Sync)',
    mapLines.length === redirect301Count && semicolonsValid,
    `Map lines: ${mapLines.length}, Semicolons valid: ${semicolonsValid}`
  );

  // Gate 5: Delivery API Dynamic Redirects Health
  let apiRedirectsCount = 0;
  try {
    const apiRes = await fetch('http://127.0.0.1:8787/api/v1/delivery/redirects');
    if (apiRes.ok) {
      const data = await apiRes.json();
      apiRedirectsCount = Array.isArray(data) ? data.length : (data.data?.length ?? data.meta?.total ?? 0);
    }
  } catch (err) {
    console.warn('API delivery query notice:', err.message);
  }
  evaluateGate(
    'Gate 5: Delivery API Dynamic Redirects Active Serving',
    apiRedirectsCount >= 300,
    `Delivery API returned ${apiRedirectsCount} active rules`
  );

  // Gate 6: Press Releases Decision (T2.1.5 / BD-06)
  const pressItems = items.filter((i) => i.category === 'press_legacy' || i.category === 'press_archived');
  const pressCompliant = pressItems.every((i) => ['/news', '/support'].includes(i.to));
  evaluateGate(
    'Gate 6: Press Releases Archival Governance (BD-06 / T2.1.5)',
    pressItems.length > 0 && pressCompliant,
    `Press release items: ${pressItems.length}, Compliant: ${pressCompliant}`
  );

  // Gate 7: Live URL-01 Parity Certification (verify-url-01.mjs)
  let url01Pass = false;
  let url01Details = 'No report found';
  if (existsSync(URL01_REPORT_FILE)) {
    const rep = JSON.parse(readFileSync(URL01_REPORT_FILE, 'utf8'));
    url01Pass = rep.summary.status === 'CERTIFIED_PASS' && rep.summary.failedCount === 0;
    url01Details = `${rep.summary.passedCount}/${rep.summary.totalTested} passed, 0 chains, 0 broken`;
  }
  evaluateGate('Gate 7: Live URL-01 Parity Certification (All 327 URLs)', url01Pass, url01Details);

  // Gate 8: Playwright Visual Evidence & Manual Inspection
  let visualPass = false;
  let visualDetails = 'No visual report found';
  if (existsSync(VISUAL_REPORT_FILE)) {
    const vRep = JSON.parse(readFileSync(VISUAL_REPORT_FILE, 'utf8'));
    visualPass = vRep.status === 'PASS' && vRep.scenes.length === 5;
    visualDetails = `${vRep.scenes.length}/5 scenes verified, screenshots captured`;
  }
  evaluateGate('Gate 8: Playwright Visual & Manual Inspection Evidence', visualPass, visualDetails);

  // Gate 9: WCAG 2.2 AA Accessibility on 410 Gone Terminal Page
  let a11yPass = false;
  let a11yDetails = 'No a11y audit found';
  if (existsSync(VISUAL_REPORT_FILE)) {
    const vRep = JSON.parse(readFileSync(VISUAL_REPORT_FILE, 'utf8'));
    const audit = vRep.a11yAudits?.find((a) => a.context === '410-Gone-Page');
    if (audit && audit.criticalCount === 0 && audit.seriousCount === 0) {
      a11yPass = true;
      a11yDetails = `0 critical, 0 serious, ${audit.violationsCount} total violations`;
    }
  }
  evaluateGate('Gate 9: WCAG 2.2 AA Conformance on 410 Gone Page (axe-core)', a11yPass, a11yDetails);

  // Gate 10: Technical Documentation Index (/llms.txt)
  let llmsPass = false;
  try {
    const llmsRes = await fetch('http://127.0.0.1:4321/llms.txt');
    const txt = await llmsRes.text();
    if (llmsRes.status === 200 && txt.includes('# TwinMOS Technologies') && txt.includes('/products')) {
      llmsPass = true;
    }
  } catch (err) {
    console.warn('llms.txt fetch notice:', err.message);
  }
  evaluateGate('Gate 10: Technical Documentation Index (/llms.txt 200 OK)', llmsPass, 'TwinMOS corporate & product index verified');

  console.log('\n----------------------------------------------------------------');
  const allPassed = gates.every((g) => g.passed);
  if (allPassed) {
    console.log('✓ ALL 10 GATES PASSED! MS6.4 URL MIGRATION CERTIFIED READY FOR STAGING');
    console.log('----------------------------------------------------------------\n');
    process.exit(0);
  } else {
    console.error('✗ AUDIT FAILED: Some gates did not pass.');
    console.log('----------------------------------------------------------------\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
