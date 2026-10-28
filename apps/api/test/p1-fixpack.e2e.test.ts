// P1 — Critical fix-pack regression gates (REMEDIATION_PLAN TM-REM-2026-001).
// 1.2: API-side markdown rendering is sanitized (preview URLs cannot carry
//      hostile script even though the API CSP already neutralizes it).
// 1.4: invites disclose no credential (set-password link, ZT-014) and stay
//      flagged must_change_password; /admin answers 403 until accepted.
// Fixture credentials are GENERATED at runtime — never literals.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
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
    const { token } = await prev.json();
    const page = await app.request(`/api/v1/preview/${token}`);
    const html = await page.text();
    expect(html).toContain('Title');
    expect(html).not.toMatch(/<script>/);
    expect(html).not.toMatch(/onerror=/);
  });
});

// ZT-014: an invite never discloses a credential — not in the API response, not
// in e-mail. The invitee sets their own password through a single-use reset link;
// mustChangePassword stays as defence in depth until that has happened.
const latestResetToken = (to: string): string => {
  const dir = process.env.MAIL_OUTBOX_DIR!;
  const mails = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
    .filter((m: any) => m.to === to && /Password Reset/.test(m.subject ?? ''));
  const m = /reset-password\/([A-Za-z0-9_-]+)/.exec(mails.pop()?.text ?? '');
  return m?.[1] ?? '';
};

describe('P1.4: invites without disclosed credentials + forced rotation', () => {
  it('invite response and mail carry no password; a set-password link is sent', async () => {
    await mkUser('p1-inviter@twinmos.dev', pwAdmin, 'super_admin');
    const ck = await cookieFor('p1-inviter@twinmos.dev', pwAdmin);
    const r = await app.request('/api/v1/admin/users/invite', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck },
      body: JSON.stringify({ email: 'p1-invited@twinmos.dev', name: 'Invited', role: 'viewer' }),
    });
    expect(r.status).toBe(201);
    const body = await r.json();
    expect(body.temporaryPassword).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/password":/i);
    expect(body.setPasswordLinkSent).toBe(true);
    expect(latestResetToken('p1-invited@twinmos.dev')).toBeTruthy();
    const dir = process.env.MAIL_OUTBOX_DIR!;
    const invite = readdirSync(dir).map((f) => readFileSync(join(dir, f), 'utf8')).filter((t) => t.includes('p1-invited@twinmos.dev'));
    expect(invite.join(' ')).not.toMatch(/temporary password|TwinMOS-[0-9a-f]{8}!/i);
  });

  it('full rotation flow: set-password link → flagged → /admin 403 → accept → gate cleared', async () => {
    const inviterCk = await cookieFor('p1-inviter@twinmos.dev', pwAdmin);
    const inv = await app.request('/api/v1/admin/users/invite', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: inviterCk },
      body: JSON.stringify({ email: 'p1-rotate@twinmos.dev', name: 'Rotate', role: 'viewer' }),
    });
    expect(inv.status).toBe(201);
    const newPw = genPw();
    const reset = await auth.handler(new Request(origin + '/api/v1/auth/reset-password', {
      method: 'POST', headers: { 'content-type': 'application/json', origin },
      body: JSON.stringify({ token: latestResetToken('p1-rotate@twinmos.dev'), newPassword: newPw }),
    }));
    expect(reset.status).toBe(200);
    const ck = await cookieFor('p1-rotate@twinmos.dev', newPw);

    // still flagged until accepted; admin routes refused with the rotation problem
    const st = await app.request('/api/v1/admin/users/me/password-state', { headers: { cookie: ck } });
    expect(await st.json()).toEqual({ mustChangePassword: true });
    const blocked = await app.request('/api/v1/admin/stats', { headers: { cookie: ck } });
    expect(blocked.status).toBe(403);
    expect((await blocked.json()).title).toBe('Password change required');

    const accept = await app.request('/api/v1/admin/users/me/accept-password', { method: 'POST', headers: { 'content-type': 'application/json', cookie: ck }, body: '{}' });
    expect(accept.status).toBe(200);

    // gate cleared — any remaining 403 must be role-based, not rotation-based
    const st2 = await app.request('/api/v1/admin/users/me/password-state', { headers: { cookie: ck } });
    expect(await st2.json()).toEqual({ mustChangePassword: false });
    const after = await app.request('/api/v1/admin/stats', { headers: { cookie: ck } });
    expect((await after.json()).title).not.toBe('Password change required');
  });
});

