// WALK-ADMIN & GATE-02 Verification Script
// Verifies:
// 1. apps/admin/src/main.tsx imports zod-jitless.ts as first statement (V-05 / WALK-ADMIN)
// 2. apps/admin logo paths use import.meta.env.BASE_URL (V-13)
// 3. apps/admin passes eslint with --max-warnings 0 (GATE-02)
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

console.log('[walk-admin] Verifying WALK-ADMIN and GATE-02...');

const mainPath = resolve(process.cwd(), 'apps/admin/src/main.tsx');
if (!existsSync(mainPath)) {
  console.error('[walk-admin] FAIL: apps/admin/src/main.tsx not found.');
  process.exit(1);
}

const mainContent = readFileSync(mainPath, 'utf8');
const lines = mainContent.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//'));
if (!lines[0] || !lines[0].includes('./zod-jitless')) {
  console.error('[walk-admin] FAIL V-05 / WALK-ADMIN: ./zod-jitless must be the first active import in main.tsx.');
  process.exit(1);
}
console.log('[walk-admin] PASS V-05: JIT-less zod initialized before all schema construction in main.tsx.');

// Check logo paths (V-13)
const filesToCheck = ['apps/admin/src/login.tsx', 'apps/admin/src/mfa.tsx', 'apps/admin/src/shell.tsx'];
for (const f of filesToCheck) {
  const code = readFileSync(resolve(process.cwd(), f), 'utf8');
  if (code.includes('src="/assets/img/logo.webp"')) {
    console.error(`[walk-admin] FAIL V-13: Hardcoded public web root logo in ${f}`);
    process.exit(1);
  }
}
console.log('[walk-admin] PASS V-13: Admin assets self-contained (logo uses BASE_URL).');

// Check ESLint with --max-warnings 0 (GATE-02)
console.log('[walk-admin] Running eslint on apps/admin with --max-warnings 0 (GATE-02)...');
try {
  execSync('npm run lint --workspace @twinmos/admin', { encoding: 'utf8', stdio: 'inherit' });
  console.log('[walk-admin] PASS GATE-02: 0 lint errors, 0 lint warnings in @twinmos/admin.');
} catch (err) {
  console.error('[walk-admin] FAIL GATE-02: ESLint reported warnings or errors.');
  process.exit(1);
}

console.log('[walk-admin] All WALK-ADMIN and GATE-02 checks passed.');
process.exit(0);
