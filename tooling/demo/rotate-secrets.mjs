// =============================================================================
// SYNTHETIC SIMULATION — LABELED PER RULE 4 / TASK R0.1
// This script generates synthetic data / simulation logic. It proves nothing about
// actual production operations or deployment health.
// =============================================================================

// Secret Rotation Automation & Validation Drill (HARD-01 / Task F3)
// Implements zero-downtime dual-key rotation for BETTER_AUTH_SECRET and REVALIDATION_SECRET.
import crypto from 'node:crypto';

export function signWithSecret(payload, secret) {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${Buffer.from(data).toString('base64url')}.${sig}`;
}

export function verifyWithDualSecret(token, activeSecret, fallbackSecrets = []) {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [dataB64, sig] = parts;
  const data = Buffer.from(dataB64, 'base64url').toString('utf8');

  // 1. Try active secret
  const expectedActiveSig = crypto.createHmac('sha256', activeSecret).update(data).digest('base64url');
  if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedActiveSig))) {
    return { data, key: 'active' };
  }

  // 2. Try fallback secrets
  for (const fallback of fallbackSecrets) {
    if (!fallback) continue;
    const expectedFallbackSig = crypto.createHmac('sha256', fallback).update(data).digest('base64url');
    if (sig.length === expectedFallbackSig.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedFallbackSig))) {
      return { data, key: 'fallback' };
    }
  }

  return null;
}

export async function runSecretRotationDrill() {
  console.log('--- Starting Dual-Key Secret Rotation Drill ---');
  
  // Phase 1: Baseline Generation
  const oldSecret = crypto.randomBytes(32).toString('hex');
  const sessionPayload = { userId: 'usr_staff_01', role: 'admin', iat: Date.now() };
  const oldToken = signWithSecret(sessionPayload, oldSecret);

  // Assert baseline verification
  const v1 = verifyWithDualSecret(oldToken, oldSecret, []);
  if (!v1 || v1.key !== 'active') throw new Error('Baseline secret verification failed');

  // Phase 2: Rotate to New Primary Secret while retaining Old Secret in fallback list
  const newSecret = crypto.randomBytes(32).toString('hex');
  const newToken = signWithSecret({ userId: 'usr_staff_02', role: 'editor', iat: Date.now() }, newSecret);

  // Assert both existing sessions and new sessions verify during transition
  const vOldDuringTransition = verifyWithDualSecret(oldToken, newSecret, [oldSecret]);
  if (!vOldDuringTransition || vOldDuringTransition.key !== 'fallback') {
    throw new Error('Old active session rejected during dual-secret transition window');
  }

  const vNewDuringTransition = verifyWithDualSecret(newToken, newSecret, [oldSecret]);
  if (!vNewDuringTransition || vNewDuringTransition.key !== 'active') {
    throw new Error('New active session failed verification against primary secret');
  }

  // Phase 3: Untrusted Secret Rejection
  const rogueSecret = crypto.randomBytes(32).toString('hex');
  const rogueToken = signWithSecret(sessionPayload, rogueSecret);
  const vRogue = verifyWithDualSecret(rogueToken, newSecret, [oldSecret]);
  if (vRogue !== null) {
    throw new Error('Rogue signature unexpectedly accepted');
  }

  // Phase 4: Old Secret Retirement
  const vOldAfterRetirement = verifyWithDualSecret(oldToken, newSecret, []);
  if (vOldAfterRetirement !== null) {
    throw new Error('Retired secret unexpectedly accepted after grace period retirement');
  }

  console.log('--- Secret Rotation Drill Passed (Zero Session Drop Demonstrated) ---');
  return {
    passed: true,
    oldSecretFingerprint: oldSecret.slice(0, 8),
    newSecretFingerprint: newSecret.slice(0, 8),
  };
}

if (process.argv[1] && process.argv[1].endsWith('rotate-secrets.mjs')) {
  runSecretRotationDrill()
    .then((r) => console.log('[*] Rotation Result:', r))
    .catch((err) => { console.error('[✗] Drill Failed:', err); process.exit(1); });
}

