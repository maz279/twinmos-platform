// STATIC-A: Static Sweep Verification Script
// 1. No credentials in README.md (V-10).
// 2. docs/runbooks/DEPLOY.md names PostgreSQL 18 and bootstrap seed (PG-06, SEED-02).
// 3. Auth configuration includes reset, verification, lockout, and MFA enforcement (A4a / S-04..S-07).
// 4. Rate-limiting and real-IP configurations are correctly wired (A5, A6).
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('[static-sweep] Running STATIC-A verification sweep...');

let failures = 0;

// 1. README.md check
const readmePath = resolve(process.cwd(), 'README.md');
const readme = readFileSync(readmePath, 'utf8');
if (readme.includes('DevOnly-ChangeMe') || readme.includes('admin@twinmos.dev /')) {
  console.error('[static-sweep] FAIL STATIC-A (1): README.md still contains literal development credentials.');
  failures++;
} else {
  console.log('[static-sweep] PASS STATIC-A (1): No literal credentials in README.md.');
}

// 2. Runbook DEPLOY.md check
const deployPath = resolve(process.cwd(), 'docs/runbooks/DEPLOY.md');
const deployDoc = readFileSync(deployPath, 'utf8');
if (!deployDoc.includes('Postgres 18') && !deployDoc.includes('PostgreSQL 18')) {
  console.error('[static-sweep] FAIL STATIC-A (2a): docs/runbooks/DEPLOY.md does not pin PostgreSQL 18.');
  failures++;
} else {
  console.log('[static-sweep] PASS STATIC-A (2a): docs/runbooks/DEPLOY.md pins PostgreSQL 18.');
}

if (!deployDoc.includes('BOOTSTRAP_SEED=1') && !deployDoc.includes('bootstrap seed')) {
  console.error('[static-sweep] FAIL STATIC-A (2b): docs/runbooks/DEPLOY.md does not specify bootstrap seed invocation.');
  failures++;
} else {
  console.log('[static-sweep] PASS STATIC-A (2b): docs/runbooks/DEPLOY.md specifies bootstrap seed.');
}

// 3. Auth configuration in apps/api/src/auth.ts and app.ts
const authPath = resolve(process.cwd(), 'apps/api/src/auth.ts');
const authCode = readFileSync(authPath, 'utf8');
const appPath = resolve(process.cwd(), 'apps/api/src/app.ts');
const appCode = readFileSync(appPath, 'utf8');

const hasPasswordReset = authCode.includes('sendResetPassword') || authCode.includes('reset-password');
const hasEmailVerification = authCode.includes('sendVerificationEmail') || authCode.includes('requireEmailVerification');
const hasLockout = appCode.includes('LOGIN_FAILURES') && appCode.includes('Account Locked');
const hasMfaGuard = appCode.includes('twoFactor') || appCode.includes('twoFactorEnabled') || appCode.includes('ENFORCE_MFA');

if (!hasPasswordReset) {
  console.error('[static-sweep] FAIL STATIC-A (3a): Missing password reset in auth configuration.');
  failures++;
} else {
  console.log('[static-sweep] PASS STATIC-A (3a): Password reset configured.');
}

if (!hasEmailVerification) {
  console.error('[static-sweep] FAIL STATIC-A (3b): Missing email verification in auth configuration.');
  failures++;
} else {
  console.log('[static-sweep] PASS STATIC-A (3b): Email verification configured.');
}

if (!hasLockout) {
  console.error('[static-sweep] FAIL STATIC-A (3c): Missing per-account lockout guard in app/auth.');
  failures++;
} else {
  console.log('[static-sweep] PASS STATIC-A (3c): Per-account lockout guard configured.');
}

if (!hasMfaGuard) {
  console.error('[static-sweep] FAIL STATIC-A (3d): Missing admin MFA enforcement guard.');
  failures++;
} else {
  console.log('[static-sweep] PASS STATIC-A (3d): Admin MFA enforcement guard configured.');
}

// 4. Edge real IP check
const realipConfPath = resolve(process.cwd(), 'deploy/nginx/realip_cloudflare.conf');
if (!existsSync(realipConfPath)) {
  console.error('[static-sweep] FAIL STATIC-A (4a): deploy/nginx/realip_cloudflare.conf missing.');
  failures++;
} else {
  const realipConf = readFileSync(realipConfPath, 'utf8');
  if (!realipConf.includes('set_real_ip_from 173.245.48.0/20;') || !realipConf.includes('real_ip_header CF-Connecting-IP;')) {
    console.error('[static-sweep] FAIL STATIC-A (4a): realip_cloudflare.conf does not contain Cloudflare ranges/header.');
    failures++;
  } else {
    console.log('[static-sweep] PASS STATIC-A (4a): Cloudflare Real-IP CIDRs and header present.');
  }
}

const twinmosConfPath = resolve(process.cwd(), 'deploy/nginx/twinmos.conf');
const twinmosConf = readFileSync(twinmosConfPath, 'utf8');
if (!twinmosConf.includes('realip_cloudflare.conf') || !twinmosConf.includes('proxy_set_header X-Real-IP $remote_addr;')) {
  console.error('[static-sweep] FAIL STATIC-A (4b): deploy/nginx/twinmos.conf missing include or X-Real-IP header.');
  failures++;
} else {
  console.log('[static-sweep] PASS STATIC-A (4b): nginx includes Cloudflare configuration and passes X-Real-IP.');
}

if (failures > 0) {
  console.error(`[static-sweep] STATIC-A FAILED with ${failures} error(s).`);
  process.exit(1);
}

console.log('[static-sweep] PASS STATIC-A: All Phase A static sweep checks passed cleanly.');
process.exit(0);
