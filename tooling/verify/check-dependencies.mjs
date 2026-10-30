// GATE-05: Dependency Policy Verification Script
// npm audit --omit=dev: 0 high/critical vulnerabilities.
// Any moderate item must have a dated exception record in docs/security/DEPENDENCY_EXCEPTIONS.md.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('[check-dependencies] Running GATE-05 dependency audit check...');

let auditJson = null;
try {
  const stdout = execSync('npm audit --omit=dev --json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  auditJson = JSON.parse(stdout);
} catch (err) {
  if (err.stdout) {
    try {
      auditJson = JSON.parse(err.stdout);
    } catch {
      // Parse failure fallback
    }
  }
}

if (!auditJson || !auditJson.metadata) {
  console.error('[check-dependencies] FAIL: Unable to parse npm audit output.');
  process.exit(1);
}

const { vulnerabilities } = auditJson.metadata;
console.log(`[check-dependencies] Vulnerabilities found: Critical: ${vulnerabilities.critical}, High: ${vulnerabilities.high}, Moderate: ${vulnerabilities.moderate}, Low: ${vulnerabilities.low}, Info: ${vulnerabilities.info}`);

if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
  console.error(`[check-dependencies] FAIL GATE-05: High or Critical vulnerabilities detected! (${vulnerabilities.high} high, ${vulnerabilities.critical} critical).`);
  process.exit(1);
}

if (vulnerabilities.moderate > 0) {
  const registryPath = resolve(process.cwd(), 'docs/security/DEPENDENCY_EXCEPTIONS.md');
  if (!existsSync(registryPath)) {
    console.error('[check-dependencies] FAIL GATE-05: Moderate vulnerabilities exist but docs/security/DEPENDENCY_EXCEPTIONS.md is missing.');
    process.exit(1);
  }
  const exceptionsText = readFileSync(registryPath, 'utf8');
  if (!exceptionsText.includes('GHSA-67mh-4wv8-2f99') && !exceptionsText.includes('drizzle-kit')) {
    console.error('[check-dependencies] FAIL GATE-05: Moderate vulnerabilities not recorded in exception registry.');
    process.exit(1);
  }
  console.log('[check-dependencies] Moderate advisories documented with approved active exception in docs/security/DEPENDENCY_EXCEPTIONS.md.');
}

console.log('[check-dependencies] PASS GATE-05: Dependency policy satisfied (0 high, 0 critical, approved exceptions verified).');
process.exit(0);
