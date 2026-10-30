// Staff session helpers: real Better Auth sign-in through the edge, TOTP enrolment
// and challenge with otplib. Secrets for lab accounts live only in
// tooling/audit-zt/lab/.state/accounts.json (git-ignored, regenerated per lab).
import { authenticator } from 'otplib';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { edge, Jar, json } from './edge.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const STATE = join(here, '..', 'lab', '.state');
const ACCOUNTS = join(STATE, 'accounts.json');

export function loadAccounts() { return existsSync(ACCOUNTS) ? JSON.parse(readFileSync(ACCOUNTS, 'utf8')) : {}; }
export function saveAccounts(a) { mkdirSync(STATE, { recursive: true }); writeFileSync(ACCOUNTS, JSON.stringify(a, null, 2)); }

/** Sign in; answers the TOTP challenge when the account has MFA. Returns { jar, res, body }. */
export async function signIn(email, password, totpSecret) {
  const jar = new Jar();
  let res;
  // Sign-in is throttled (Better Auth + app limiter): honour Retry-After rather than hammer it.
  for (let attempt = 0; ; attempt++) {
    res = await edge('/api/v1/auth/sign-in/email', { method: 'POST', body: { email, password } }, { jar });
    if (res.status !== 429 || attempt >= 4) break;
    await res.arrayBuffer();
    const wait = Number(res.headers.get('retry-after') ?? 15);
    await new Promise((r) => setTimeout(r, (Math.min(wait, 70) + 1) * 1000));
  }
  const body = await json(res);
  if (res.status === 200 && body?.twoFactorRedirect) {
    if (!totpSecret) return { jar, res, body, mfaPending: true };
    const v = await edge('/api/v1/auth/two-factor/verify-totp', { method: 'POST', body: { code: authenticator.generate(totpSecret) } }, { jar });
    return { jar, res: v, body: await json(v) };
  }
  return { jar, res, body };
}

/** Enrol TOTP for a signed-in account; returns the base32 secret. */
export async function enrolTotp(jar, password) {
  const r = await edge('/api/v1/auth/two-factor/enable', { method: 'POST', body: { password } }, { jar });
  const b = await json(r);
  if (r.status !== 200 || !b.totpURI) throw new Error(`two-factor/enable ${r.status} ${JSON.stringify(b).slice(0, 200)}`);
  const secret = /secret=([A-Za-z2-7]+)/.exec(b.totpURI)[1];
  const v = await edge('/api/v1/auth/two-factor/verify-totp', { method: 'POST', body: { code: authenticator.generate(secret) } }, { jar });
  if (v.status !== 200) throw new Error(`verify-totp ${v.status} ${await v.text()}`);
  return secret;
}
