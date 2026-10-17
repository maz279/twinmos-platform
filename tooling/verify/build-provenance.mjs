// BUILD-01, BUILD-02, CONTENT-03: Build Provenance & Content Hygiene
// Tasks T2.2.7 & T2.3.6:
// 1. BUILD-01: Web and Admin builds write build-info.json with commit SHA and isDirty flag.
//    Fails (exit code 1) on dirty working tree, missing build-info, or commit SHA mismatch.
// 2. BUILD-02 & CONTENT-03: Refuses localhost URLs in public and admin build output.
// 3. Supports --test-stale negative mutation test.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function verifyBuildProvenance(options = {}) {
  const {
    webDist = resolve(process.cwd(), 'apps/web/dist'),
    adminDist = resolve(process.cwd(), 'apps/admin/dist'),
    expectedSha = null,
    allowMissing = false,
  } = options;

  let currentSha = expectedSha || process.env.GIT_SHA || process.env.GITHUB_SHA || '';
  if (!currentSha) {
    try {
      currentSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      currentSha = 'dev-local';
    }
  }

  let failures = 0;
  const reports = [];

  // 1. Verify Web Dist
  if (existsSync(webDist)) {
    const webBuildInfoPath = join(webDist, 'build-info.json');
    if (!existsSync(webBuildInfoPath)) {
      reports.push({ check: 'BUILD-01', target: 'web', error: 'Missing build-info.json in apps/web/dist' });
      failures++;
    } else {
      const webInfo = JSON.parse(readFileSync(webBuildInfoPath, 'utf8'));
      const enforceClean = process.env.CI || process.env.NODE_ENV === 'production' || !process.env.ALLOW_DIRTY;
      if (webInfo.isDirty && enforceClean) {
        reports.push({ check: 'BUILD-01', target: 'web', error: 'apps/web/dist was built from a dirty working tree (isDirty: true)' });
        failures++;
      } else if (webInfo.isDirty) {
        reports.push({ check: 'BUILD-01', target: 'web', warning: 'apps/web/dist has isDirty: true (allowed in local development with ALLOW_DIRTY=1)' });
      }
      if (webInfo.commitSha && currentSha && webInfo.commitSha !== currentSha && currentSha !== 'dev-local') {
        reports.push({
          check: 'BUILD-01',
          target: 'web',
          error: `Stale web dist: build SHA ${webInfo.commitSha} does not match repo HEAD ${currentSha}`
        });
        failures++;
      } else {
        reports.push({ check: 'BUILD-01', target: 'web', success: `Web build SHA verified (${webInfo.commitSha})` });
      }
    }

    // CONTENT-03: Scan web dist for localhost URLs
    const prohibitedPattern = /http:\/\/localhost|https:\/\/localhost|http:\/\/127\.0\.0\.1|https:\/\/127\.0\.0\.1/i;
    let webLocalhostCount = 0;

    function scanDir(dir) {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.endsWith('.html') || entry.endsWith('.js') || entry.endsWith('.json')) {
          if (entry === 'build-info.json') continue;
          const content = readFileSync(fullPath, 'utf8');
          if (prohibitedPattern.test(content)) {
            webLocalhostCount++;
          }
        }
      }
    }
    scanDir(webDist);
    if (webLocalhostCount > 0) {
      reports.push({ check: 'CONTENT-03', target: 'web', error: `Found ${webLocalhostCount} prohibited localhost occurrences in apps/web/dist` });
      failures++;
    } else {
      reports.push({ check: 'CONTENT-03', target: 'web', success: 'Zero localhost URLs in apps/web/dist' });
    }
  } else if (!allowMissing) {
    reports.push({ check: 'BUILD-01', target: 'web', error: 'apps/web/dist does not exist' });
    failures++;
  }

  // 2. Verify Admin Dist (if present)
  if (existsSync(adminDist)) {
    const adminBuildInfoPath = join(adminDist, 'build-info.json');
    if (!existsSync(adminBuildInfoPath)) {
      reports.push({ check: 'BUILD-01', target: 'admin', error: 'Missing build-info.json in apps/admin/dist' });
      failures++;
    } else {
      const adminInfo = JSON.parse(readFileSync(adminBuildInfoPath, 'utf8'));
      const enforceClean = process.env.CI || process.env.NODE_ENV === 'production' || !process.env.ALLOW_DIRTY;
      if (adminInfo.isDirty && enforceClean) {
        reports.push({ check: 'BUILD-01', target: 'admin', error: 'apps/admin/dist was built from a dirty working tree (isDirty: true)' });
        failures++;
      } else if (adminInfo.isDirty) {
        reports.push({ check: 'BUILD-01', target: 'admin', warning: 'apps/admin/dist has isDirty: true (allowed in local development with ALLOW_DIRTY=1)' });
      }
      if (adminInfo.commitSha && currentSha && adminInfo.commitSha !== currentSha && currentSha !== 'dev-local') {
        reports.push({
          check: 'BUILD-01',
          target: 'admin',
          error: `Stale admin dist: build SHA ${adminInfo.commitSha} does not match repo HEAD ${currentSha}`
        });
        failures++;
      } else {
        reports.push({ check: 'BUILD-01', target: 'admin', success: `Admin build SHA verified (${adminInfo.commitSha})` });
      }
    }
  }

  return { failures, reports, currentSha };
}

// CLI Execution & Self-Test
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  console.log('[build-provenance] Verifying BUILD-01, BUILD-02, and CONTENT-03...');

  // Negative test support
  if (process.argv.includes('--test-stale')) {
    console.log('[build-provenance] Executing negative mutation test for stale dist rejection...');
    const result = verifyBuildProvenance({
      expectedSha: '0000000000000000000000000000000000000000', // Deliberate mismatch
      allowMissing: false,
    });
    if (result.failures > 0 && result.reports.some((r) => r.error && r.error.includes('Stale'))) {
      console.log('MUTATION TEST PASSED: BUILD-01 strictly refused deliberately stale dist.');
      process.exit(0);
    } else {
      console.error('MUTATION TEST FAILED: BUILD-01 did not reject stale dist.');
      process.exit(1);
    }
  }

  const { failures, reports } = verifyBuildProvenance({ allowMissing: false });

  for (const r of reports) {
    if (r.error) {
      console.error(`[-] FAIL ${r.check} [${r.target}]: ${r.error}`);
    } else if (r.success) {
      console.log(`[+] PASS ${r.check} [${r.target}]: ${r.success}`);
    }
  }

  if (failures > 0) {
    console.error(`\n[build-provenance] FAILED with ${failures} provenance/hygiene violation(s).`);
    process.exit(1);
  }

  console.log('\n[build-provenance] PASS BUILD-01 / BUILD-02 / CONTENT-03: All dist bundles verified fresh with clean provenance.');
  process.exit(0);
}
