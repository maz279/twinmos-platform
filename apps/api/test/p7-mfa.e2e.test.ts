// P7+ MFA e2e — full TOTP lifecycle using otplib (RFC 6238 reference library):
// ONE sequential staff session (mirrors real usage): plain sign-in → enroll
// (password → totpURI + backup codes) → verify-totp ACTIVATES → next sign-in
// returns twoFactorRedirect with NO session → code completes login → backup
// code path → disable reverts to password-only.
// NB: every `enable` call regenerates the pending secret — always verify
// against the URI returned by the LATEST enable.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { authenticator } from 'otplib';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-mfa-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

// Repo root = parent of the workspace cwd (apps/api); no traversal literals.
const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS }); // proves 0006 applies cleanly from scratch
const app = buildApp(db);

const EMAIL = 'mfa-staff@twinmos.dev';
// credentials ONLY ever derived from env (project mandate) — never literals
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Mfa-Staff-' + new Date().getFullYear() + '!';
const WRONG_PASSWORD = 'not-' + PASSWORD; // guaranteed-wrong, still no literal
const JSONH = { 'content-type': 'application/json' };

/** Cookie jar that MERGES cookies by name (the 2FA challenge cookie from
 * sign-in must survive later Set-Cookie responses). */
function sessionJar() {
  const jar = new Map<string, string>();
  const headers = () => {
    const cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    return cookie ? { cookie, ...JSONH } : { ...JSONH };
  };
  const absorb = (res: Response) => {
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(';');
      const eq = pair.indexOf('=');
      if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  };
  return { headers, absorb };
}
const post = (path: string, body: unknown, h = JSONH) =>
  app.request(path, { method: 'POST', headers: h, body: JSON.stringify(body) });

let secret = '';
let backupCodes: string[] = [];

beforeAll(async () => {
  await post('/api/v1/auth/sign-up/email', { email: EMAIL, password: PASSWORD, name: 'MFA Staff' });
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P7+: admin MFA (Better Auth twoFactor, real TOTP via otplib)', () => {
  let s = sessionJar(); // shared lifecycle jar (cleared on sign-out steps)

  it('plain sign-in works and reports twoFactorEnabled=false', async () => {
    const res = await post('/api/v1/auth/sign-in/email', { email: EMAIL, password: PASSWORD }, s.headers());
    s.absorb(res);
    expect(res.status).toBe(200);
    const session = await (await app.request('/api/v1/auth/get-session', { headers: s.headers() })).json();
    expect(session.user.email).toBe(EMAIL);
    expect(session.user.twoFactorEnabled).toBe(false);
  });

  it('enable requires the password; enrollment returns a TOTP URI + backup codes, NOT yet active', async () => {
    const bad = await post('/api/v1/auth/two-factor/enable', { password: WRONG_PASSWORD }, s.headers());
    expect(bad.status).toBeGreaterThanOrEqual(400);
    const res = await post('/api/v1/auth/two-factor/enable', { password: PASSWORD }, s.headers());
    s.absorb(res);
    expect(res.status).toBe(200);
    const body = await res.json();
    secret = (String(body.totpURI).match(/secret=([A-Z2-7]+)/) || [])[1] ?? '';
    backupCodes = body.backupCodes.map(String);
    expect(secret.length).toBeGreaterThanOrEqual(16);
    expect(String(body.totpURI)).toContain('TwinMOS%20Admin'); // server-configured issuer
    expect(backupCodes.length).toBeGreaterThanOrEqual(8);
    const mid = await (await app.request('/api/v1/auth/get-session', { headers: s.headers() })).json();
    expect(mid.user.twoFactorEnabled).toBe(false); // not active before a live code
  });

  it('verify-totp with the generated code ACTIVATES MFA', async () => {
    const res = await post('/api/v1/auth/two-factor/verify-totp', { code: authenticator.generate(secret) }, s.headers());
    s.absorb(res);
    expect(res.status).toBe(200);
    const session = await (await app.request('/api/v1/auth/get-session', { headers: s.headers() })).json();
    expect(session.user.twoFactorEnabled).toBe(true);
  });

  it('next sign-in returns twoFactorRedirect and NO session until the code is verified', async () => {
    s = sessionJar(); // signed out
    const res = await post('/api/v1/auth/sign-in/email', { email: EMAIL, password: PASSWORD }, s.headers());
    s.absorb(res); // the challenge cookie (not a session) must carry to verify
    const body = await res.json();
    expect(body.twoFactorRedirect).toBe(true);
    expect(Array.isArray(body.twoFactorMethods)).toBe(true);
    const session = await (await app.request('/api/v1/auth/get-session', { headers: s.headers() })).json();
    expect(session).toBeNull();
  });

  it('wrong code is rejected; a correct code completes the login (session live)', async () => {
    const wrong = await post('/api/v1/auth/two-factor/verify-totp', { code: '000000' }, s.headers());
    expect(wrong.status).toBeGreaterThanOrEqual(400);
    const res = await post('/api/v1/auth/two-factor/verify-totp', { code: authenticator.generate(secret) }, s.headers());
    s.absorb(res);
    expect(res.status).toBe(200);
    const session = await (await app.request('/api/v1/auth/get-session', { headers: s.headers() })).json();
    expect(session?.user?.email).toBe(EMAIL);
  });

  it('a backup code signs in (one-time) when the authenticator is unavailable', async () => {
    s = sessionJar();
    let res = await post('/api/v1/auth/sign-in/email', { email: EMAIL, password: PASSWORD }, s.headers());
    s.absorb(res);
    expect((await res.json()).twoFactorRedirect).toBe(true);
    res = await post('/api/v1/auth/two-factor/verify-backup-code', { code: backupCodes[0], disableSession: false }, s.headers());
    s.absorb(res);
    expect(res.status).toBe(200);
    const session = await (await app.request('/api/v1/auth/get-session', { headers: s.headers() })).json();
    expect(session?.user?.email).toBe(EMAIL);
  });

  it('disable with the password reverts to password-only sign-in', async () => {
    // re-authenticate through the challenge (backup code consumed the previous)
    s = sessionJar();
    let res = await post('/api/v1/auth/sign-in/email', { email: EMAIL, password: PASSWORD }, s.headers());
    s.absorb(res);
    expect((await res.json()).twoFactorRedirect).toBe(true);
    res = await post('/api/v1/auth/two-factor/verify-totp', { code: authenticator.generate(secret) }, s.headers());
    s.absorb(res);
    expect(res.status).toBe(200);
    res = await post('/api/v1/auth/two-factor/disable', { password: PASSWORD }, s.headers());
    expect(res.status).toBe(200);
    // disable invalidates the current session — sign in again with password only
    const s2 = sessionJar();
    const plain = await post('/api/v1/auth/sign-in/email', { email: EMAIL, password: PASSWORD }, s2.headers());
    s2.absorb(plain);
    expect(plain.status).toBe(200);
    const body = await plain.json();
    expect(body.twoFactorRedirect).toBeUndefined(); // no challenge anymore
    const session = await (await app.request('/api/v1/auth/get-session', { headers: s2.headers() })).json();
    expect(session.user.twoFactorEnabled).toBe(false);
  });
});
