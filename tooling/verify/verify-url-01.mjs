import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const CLASSIFICATION_FILE = resolve(ROOT, 'tooling/data/legacy_url_classification.json');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence');
const REPORT_FILE = resolve(EVIDENCE_DIR, 'url_01_report.json');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4321';

async function testSingleUrl(item) {
  const url = `${BASE_URL}${item.from}`;
  const result = {
    from: item.from,
    expectedTo: item.to,
    expectedCode: item.code,
    category: item.category,
    actualCode: null,
    actualLocation: null,
    targetCode: null,
    hops: 0,
    passed: false,
    error: null,
  };

  try {
    const res = await fetch(url, { redirect: 'manual' });
    result.actualCode = res.status;
    result.actualLocation = res.headers.get('location');

    if (item.code === 301) {
      if (res.status === 301) {
        result.hops = 1;
        // Verify target returns 200
        const targetUrl = result.actualLocation.startsWith('http')
          ? result.actualLocation
          : `${BASE_URL}${result.actualLocation}`;

        const targetRes = await fetch(targetUrl, { redirect: 'manual' });
        result.targetCode = targetRes.status;

        if (targetRes.status === 200) {
          result.passed = true;
        } else if ([301, 302, 307, 308].includes(targetRes.status)) {
          result.error = `REDIRECT CHAIN DETECTED: target ${result.actualLocation} returned ${targetRes.status} instead of 200`;
        } else {
          result.error = `BROKEN TARGET: target ${result.actualLocation} returned ${targetRes.status}`;
        }
      } else {
        result.error = `Expected status 301, got ${res.status}`;
      }
    } else if (item.code === 410) {
      if (res.status === 410) {
        result.passed = true;
      } else {
        result.error = `Expected status 410, got ${res.status}`;
      }
    } else if (item.code === 200) {
      if (res.status === 200) {
        result.passed = true;
      } else {
        result.error = `Expected status 200, got ${res.status}`;
      }
    }
  } catch (err) {
    result.error = err.message;
  }

  return result;
}

async function runPool(items, concurrency = 10) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      const res = await testSingleUrl(current);
      results.push(res);
      if (results.length % 50 === 0 || results.length === items.length) {
        process.stdout.write(`Tested ${results.length}/${items.length} URLs...\r`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  console.log(`\nCompleted testing ${results.length} URLs.`);
  return results;
}

async function main() {
  console.log(`Starting URL-01 Live Parity Certification against ${BASE_URL}...`);
  const items = JSON.parse(readFileSync(CLASSIFICATION_FILE, 'utf8'));
  console.log(`Loaded ${items.length} classified URLs.`);

  const startTime = Date.now();
  const results = await runPool(items, 10);
  const durationMs = Date.now() - startTime;

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);
  const singleHop200 = results.filter((r) => r.expectedCode === 301 && r.passed);
  const gone410 = results.filter((r) => r.expectedCode === 410 && r.passed);
  const chains = results.filter((r) => r.error && r.error.includes('REDIRECT CHAIN'));
  const brokenTargets = results.filter((r) => r.error && r.error.includes('BROKEN TARGET'));
  const massRedirectsToRoot = results.filter(
    (r) => r.expectedCode === 301 && (r.actualLocation === '/' || r.actualLocation === '') && r.from !== '/index.php' && r.from !== '/index.html'
  );

  const report = {
    timestamp: new Date().toISOString(),
    milestone: 'MS6.4',
    auditGate: 'URL-01',
    baseUrl: BASE_URL,
    durationMs,
    summary: {
      totalTested: results.length,
      passedCount: passed.length,
      failedCount: failed.length,
      singleHop200Count: singleHop200.length,
      gone410Count: gone410.length,
      redirectChainsCount: chains.length,
      brokenTargetsCount: brokenTargets.length,
      massRedirectsToRootCount: massRedirectsToRoot.length,
      status: failed.length === 0 ? 'CERTIFIED_PASS' : 'FAIL',
    },
    failures: failed,
  };

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Wrote URL-01 report to: ${REPORT_FILE}`);

  console.log('--- URL-01 CERTIFICATION SUMMARY ---');
  console.log(`Total URLs Tested: ${report.summary.totalTested}`);
  console.log(`Passed:            ${report.summary.passedCount}`);
  console.log(`Failed:            ${report.summary.failedCount}`);
  console.log(`Single-Hop (200):  ${report.summary.singleHop200Count}`);
  console.log(`410 Gone Valid:    ${report.summary.gone410Count}`);
  console.log(`Redirect Chains:   ${report.summary.redirectChainsCount} (Target: 0)`);
  console.log(`Broken Targets:    ${report.summary.brokenTargetsCount} (Target: 0)`);
  console.log(`Mass-Redirects /:  ${report.summary.massRedirectsToRootCount} (Target: 0)`);
  console.log(`Status:            ${report.summary.status}`);

  if (failed.length > 0) {
    console.error('\nFirst 5 Failures:');
    for (const f of failed.slice(0, 5)) {
      console.error(`- ${f.from} -> expected: ${f.expectedTo} (${f.expectedCode}), got: ${f.actualCode} (${f.error})`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
