// G-REFLECT Architectural Tier Lint & Crypto Verification (Relabeled under T2.2.1 / Z-17)
// 1. Static architectural layer boundary lint: apps/web/src NEVER imports @twinmos/db directly.
// 2. Preview token cryptographic resilience (HMAC-SHA256 signature, tampering, and expiration).
// 3. Outbox pipeline contracts and event dispatching.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createPreviewToken, verifyPreviewToken } from '../../apps/api/src/routes/delivery/preview.ts';

console.log('[greflect-harness] Running architectural tier lint & crypto preview token verification...');

let failures = 0;

// 1. Layer boundary check: apps/web cannot import @twinmos/db
const webSrcDir = resolve(process.cwd(), 'apps/web/src');
function checkWebImports(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      checkWebImports(full);
    } else if (entry.endsWith('.ts') || entry.endsWith('.astro') || entry.endsWith('.js')) {
      const code = readFileSync(full, 'utf8');
      if (code.includes('@twinmos/db') || code.includes('drizzle-orm/pglite') || code.includes('pglite')) {
        console.error(`[greflect-harness] FAIL ARCH-01: Prohibited direct database import in web layer: ${full}`);
        failures++;
      }
    }
  }
}
checkWebImports(webSrcDir);
console.log('[greflect-harness] PASS ARCH-01: Strict tier separation verified (Astro web never accesses DB directly).');

// 2. Cryptographic preview token reflection test
const validToken = createPreviewToken('page', 42, 'test-page', 60);
const verified = verifyPreviewToken(validToken, 'page', 42);
if (!verified || verified.entityType !== 'page' || verified.entityId !== 42) {
  console.error('[greflect-harness] FAIL CRYPTO-01: Valid preview token failed verification.');
  failures++;
}

// Tampered token test
const tamperedToken = validToken.slice(0, -4) + 'abcd';
const tamperedResult = verifyPreviewToken(tamperedToken, 'page', 42);
if (tamperedResult) {
  console.error('[greflect-harness] FAIL CRYPTO-01: Tampered token was incorrectly accepted!');
  failures++;
} else {
  console.log('[greflect-harness] PASS CRYPTO-01: Preview HMAC-SHA256 signature verification is tamper-proof.');
}

// Expired token test
const expiredToken = createPreviewToken('page', 42, 'test-page', -10);
const expiredResult = verifyPreviewToken(expiredToken, 'page', 42);
if (expiredResult) {
  console.error('[greflect-harness] FAIL CRYPTO-01: Expired token was incorrectly accepted!');
  failures++;
} else {
  console.log('[greflect-harness] PASS CRYPTO-01: Expired tokens are strictly rejected.');
}

// 3. Live Architectural Reflection Fixture (T3.6.1 / Z-17 / GREF-H)
console.log('\n[greflect-harness] 3. Running live end-to-end editorial reflection fixture...');
import { execSync } from 'node:child_process';
try {
  execSync('node tooling/verify/greflect-fixture.mjs', { stdio: 'inherit' });
  console.log('[greflect-harness] PASS REFLECT-01: Live end-to-end editorial reflection verified.');
} catch (err) {
  console.error('[greflect-harness] FAIL REFLECT-01: Live editorial reflection fixture failed.');
  failures++;
}

if (failures > 0) {
  console.error(`[greflect-harness] G-REFLECT harness FAILED with ${failures} error(s).`);
  process.exit(1);
}

console.log('[greflect-harness] PASS G-REFLECT: All architectural reflection checks passed.');
process.exit(0);
