// P1 — Critical fix-pack regression gates (REMEDIATION_PLAN TM-REM-2026-001).
// 1.2: API-side markdown rendering is sanitized (preview URLs cannot carry
//      hostile script even though the API CSP already neutralizes it).
// 1.4: invite temp-passwords are 100% CSPRNG + flagged must_change_password;
//      flagged accounts are refused by /admin (403) until they rotate.
// Fixture credentials are GENERATED at runtime — never literals.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p1-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';

const { createDb, user, article }: any = await import('@twinmos/db');
const { buildApp } = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

let db: any;
let app: any;
let auth: any;

const genPw = () => 'Tp1-' + crypto.randomUUID().replaceAll('-', '').slice(0, 16) + '!A9';
const pwAdmin = genPw();
const origin = 'http://localhost:5173';

beforeAll(async () => {
  db = createDb();
  // fresh TMP PGlite — apply the full migration chain first (suite convention)
  await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
  const { initAuth } = await import('../src/auth.ts');
  ({ auth } = initAuth(db));
  app = buildApp(db);
});

afterAll(async () => {
  const { releaseDataDirLock } = await import('@twinmos/db');
  releaseDataDirLock(process.env.PGLITE_DATA as string);
  rmSync(TMP, { recursive: true, force: true });
});

async function mkUser(email: string, password: string, role = 'viewer') {
  const res = await auth.api.createUser({ body: { email, password, name: email.split('@')[0], role } });
  return res.user ?? res;
}
async function cookieFor(email: string, password: string) {
  const r = await auth.handler(new Request(origin + '/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ email, password }),
  }));
  if (r.status !== 200) throw new Error('sign-in failed for fixture: ' + r.status);
  const set = r.headers.get('set-cookie') ?? '';
  return set.split(',').map((c) => c.split(';')[0]).join('; ');
}

describe('P1.2: sanitized markdown in server-rendered content', () => {
  it('strips script/event-handler payloads from preview HTML', async () => {
    await mkUser('p1-admin@twinmos.dev', pwAdmin, 'super_admin');
    const ck = await cookieFor('p1-admin@twinmos.dev', pwAdmin);
    const hostile = '# Title\n<img src=x onerror="window.__p1=1"><script>window.__p1=1</script>[ok](https://t.dev)';
    const create = await app.request('/api/v1/admin/content/article', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck },
      body: JSON.stringify({ slug: 'p1-sanitize-probe', title: 'P1 Sanitize Probe', body: hostile, status: 'published' }),
    });
    if (create.status !== 201 && create.status !== 200) {
      throw new Error('fixture article create failed: ' + create.status + ' ' + (await create.text()).slice(0, 200));
    }
    const row = (await db.select().from(article).where(eq(article.slug, 'p1-sanitize-probe')).limit(1))[0];
    const prev = await app.request('/api/v1/admin/content/article/' + row.id + '/preview', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck }, body: '{}',
    });
    const { previewUrl } = await prev.json();
    const page = await app.request(previewUrl.replace(/^https?:\/\/[^/]+/, ''));
    const html = await page.text();
    expect(html).toContain('Title');
    expect(html).not.toMatch(/<script>/);
    expect(html).not.toMatch(/onerror=/);
  });
});

describe('P1.4: crypto invite passwords + forced rotation', () => {
  it('generates CSPRNG-only temporary passwords (TwinMOS-<hex8>!<hex8>)', async () => {
    await mkUser('p1-inviter@twinmos.dev', pwAdmin, 'super_admin');
    const ck = await cookieFor('p1-inviter@twinmos.dev', pwAdmin);
    const r = await app.request('/api/v1/admin/users/invite', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck },
      body: JSON.stringify({ email: 'p1-invited@twinmos.dev', name: 'Invited', role: 'viewer' }),
    });
    expect(r.status).toBe(201);
    const { temporaryPassword } = await r.json();
    expect(temporaryPassword).toMatch(/^TwinMOS-[0-9a-f]{8}![0-9a-f]{8}$/);
  });

  it('full rotation flow: flagged → /admin 403 → change-password + accept → gate cleared', async () => {
    const inviterCk = await cookieFor('p1-inviter@twinmos.dev', pwAdmin);
    const inv = await app.request('/api/v1/admin/users/invite', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: inviterCk },
      body: JSON.stringify({ email: 'p1-rotate@twinmos.dev', name: 'Rotate', role: 'viewer' }),
    });
    const { temporaryPassword } = await inv.json();
    const ck = await cookieFor('p1-rotate@twinmos.dev', temporaryPassword);

    // flagged state visible; admin routes refused with the rotation problem
    const st = await app.request('/api/v1/admin/users/me/password-state', { headers: { cookie: ck } });
    expect(await st.json()).toEqual({ mustChangePassword: true });
    const blocked = await app.request('/api/v1/admin/stats', { headers: { cookie: ck } });
    expect(blocked.status).toBe(403);
    expect((await blocked.json()).title).toBe('Password change required');

    // rotate through Better Auth, then clear the flag (change-password rotates
    // the session token — sign in fresh with the new password first)
    const newPw = genPw();
    await auth.handler(new Request(origin + '/api/v1/auth/change-password', {
      method: 'POST', headers: { 'content-type': 'application/json', origin, cookie: ck },
      body: JSON.stringify({ currentPassword: temporaryPassword, newPassword: newPw, revokeOtherSessions: true }),
    }));
    const ck2 = await cookieFor('p1-rotate@twinmos.dev', newPw);
    const accept = await app.request('/api/v1/admin/users/me/accept-password', { method: 'POST', headers: { 'content-type': 'application/json', cookie: ck2 }, body: '{}' });
    expect(accept.status).toBe(200);

    // gate cleared — any remaining 403 must be role-based, not rotation-based
    const st2 = await app.request('/api/v1/admin/users/me/password-state', { headers: { cookie: ck2 } });
    expect(await st2.json()).toEqual({ mustChangePassword: false });
    const after = await app.request('/api/v1/admin/stats', { headers: { cookie: ck2 } });
    expect((await after.json()).title).not.toBe('Password change required');
  });
});
