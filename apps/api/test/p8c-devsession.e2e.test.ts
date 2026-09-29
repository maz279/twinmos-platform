// Dev auto-login endpoint — the convenience the operator asked for while
// iterating on the console: POST /api/v1/dev/session opens a real staff session
// without the manual login+MFA dance. These tests pin the SAFETY contract:
// disabled by default, refused in production regardless of the flag, and only
// working with the password supplied from the environment (never a literal).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p8c-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';
delete process.env.API_DEV_AUTOLOGIN; // guard under test: default OFF

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');
const { user } = await import('@twinmos/db');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const DEV_EMAIL = 'p8c-dev@twinmos.dev';
const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P8c-Dev-' + new Date().getFullYear() + '!';

beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: DEV_EMAIL, password: mkPass(), name: 'p8c' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, DEV_EMAIL));
});
afterAll(async () => {
  process.env.NODE_ENV = 'test';
  delete process.env.API_DEV_AUTOLOGIN;
  delete process.env.SEED_ADMIN_EMAIL;
  delete process.env.SEED_ADMIN_PASSWORD;
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P8-3: dev auto-login safety contract', () => {
  it('is 404 by default (flag off)', async () => {
    const res = await app.request('/api/v1/dev/session', { method: 'POST' });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.detail).toMatch(/API_DEV_AUTOLOGIN/);
  });

  it('is 404 when the flag is on but SEED_ADMIN_PASSWORD is absent (no source fallback)', async () => {
    process.env.API_DEV_AUTOLOGIN = '1';
    delete process.env.SEED_ADMIN_PASSWORD;
    const res = await app.request('/api/v1/dev/session', { method: 'POST' });
    expect(res.status).toBe(404);
    expect((await res.json()).detail).toMatch(/SEED_ADMIN_PASSWORD/);
  });

  it('refuses with 403 under NODE_ENV=production even with the flag on', async () => {
    process.env.API_DEV_AUTOLOGIN = '1';
    process.env.SEED_ADMIN_EMAIL = DEV_EMAIL;
    process.env.SEED_ADMIN_PASSWORD = mkPass();
    process.env.NODE_ENV = 'production';
    try {
      const res = await app.request('/api/v1/dev/session', { method: 'POST' });
      expect(res.status).toBe(403);
      expect((await res.json()).detail).toMatch(/production/i);
    } finally {
      process.env.NODE_ENV = 'test';
    }
  });

  it('opens a real staff session when enabled in dev', async () => {
    process.env.API_DEV_AUTOLOGIN = '1';
    process.env.SEED_ADMIN_EMAIL = DEV_EMAIL;
    process.env.SEED_ADMIN_PASSWORD = mkPass();
    const res = await app.request('/api/v1/dev/session', { method: 'POST' });
    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie();
    expect(cookies.some((c) => c.includes('better-auth.session_token'))).toBe(true);
    // the issued cookie authenticates admin reads
    const jar = cookies.map((c) => c.split(';')[0]).join('; ');
    const stats = await app.request('/api/v1/admin/stats', { headers: { cookie: jar } });
    expect(stats.status).toBe(200);
    const session = await app.request('/api/v1/auth/get-session', { headers: { cookie: jar } });
    expect((await session.json()).user?.email).toBe(DEV_EMAIL);
  });

  it('wrong password from the environment fails like a normal sign-in', async () => {
    process.env.API_DEV_AUTOLOGIN = '1';
    process.env.SEED_ADMIN_EMAIL = DEV_EMAIL;
    process.env.SEED_ADMIN_PASSWORD = 'not-' + mkPass();
    const res = await app.request('/api/v1/dev/session', { method: 'POST' });
    expect(res.status).toBe(401);
  });
});
