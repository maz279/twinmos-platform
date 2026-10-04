// 0025 settings console gates — the menus document round-trips through the
// visual builder shape, redirects validation is client-tested (server zod
// already gates), locale search is client-side. These tests pin the API
// contract the redesigned module depends on.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p24-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, setting, redirect, locale }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const { betterAuth } = await import('better-auth');
const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
import * as schema from '@twinmos/db';
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});
await auth.api.signUpEmail({ body: { email: 'p24@twinmos.dev', password: 'P24-Set-2026!', name: 'P24 Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'p24@twinmos.dev'));

let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

const MENU_DOC = {
  main: [
    { label: 'Products', url: '/shop.html' },
    { label: 'Support', url: '/support.html' },
  ],
  legal: [{ label: 'Privacy', url: '/legal.html' }],
};

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p24@twinmos.dev', password: 'P24-Set-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();
  await db.insert(locale).values({ code: 'en', name: 'English', dir: 'ltr', active: true });
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P24-1: menus document round-trip', () => {
  it('saves and reads back the visual-builder shape (groups → label/url rows)', async () => {
    const put = await app.request('/api/v1/admin/settings', {
      method: 'PUT', headers: HDRS(), body: JSON.stringify({ key: 'menus', value: MENU_DOC }),
    });
    expect(put.status).toBe(200);
    const list = await (await app.request('/api/v1/admin/settings', { headers: HDRS() })).json();
    const menus = list.items.find((s: any) => s.key === 'menus');
    expect(menus).toBeTruthy();
    expect(menus.value.main.length).toBe(2);
    expect(menus.value.main[0]).toEqual({ label: 'Products', url: '/shop.html' });
    expect(menus.value.legal[0].url).toBe('/legal.html');
  });

  it('rejects malformed settings writes (422 zod)', async () => {
    const bad = await app.request('/api/v1/admin/settings', {
      method: 'PUT', headers: HDRS(), body: JSON.stringify({ value: MENU_DOC }), // no key
    });
    expect(bad.status).toBe(422);
  });
});

describe('P24-2: redirects contract', () => {
  it('creates, lists and deletes with the code preserved', async () => {
    const create = await app.request('/api/v1/admin/redirects', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ from: '/legacy-path', to: '/shop.html', code: 301 }),
    });
    expect(create.status).toBe(201);
    const list = await (await app.request('/api/v1/admin/redirects', { headers: HDRS() })).json();
    const row = list.items.find((r: any) => r.from === '/legacy-path');
    expect(row).toBeTruthy();
    expect(row.code).toBe(301);
    const del = await app.request('/api/v1/admin/redirects/' + row.id, { method: 'DELETE', headers: HDRS() });
    expect(del.status).toBe(200);
  });

  it('rejects a bad redirect code (zod enum)', async () => {
    const bad = await app.request('/api/v1/admin/redirects', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ from: '/x', to: '/y', code: 418 }),
    });
    expect(bad.status).toBe(422);
  });
});

describe('P24-3: locales contract', () => {
  it('lists seeded locales and toggles activation', async () => {
    const list = await (await app.request('/api/v1/admin/locales', { headers: HDRS() })).json();
    expect(list.items.length).toBeGreaterThanOrEqual(1);
    expect(list.items.some((l: any) => l.code === 'en' && l.active)).toBe(true);
    const off = await app.request('/api/v1/admin/locales/en', { method: 'PATCH', headers: HDRS(), body: JSON.stringify({ active: false }) });
    expect(off.status).toBe(200);
    const after = (await (await app.request('/api/v1/admin/locales', { headers: HDRS() })).json()).items.find((l: any) => l.code === 'en');
    expect(after.active).toBe(false);
    await app.request('/api/v1/admin/locales/en', { method: 'PATCH', headers: HDRS(), body: JSON.stringify({ active: true }) });
  });
});
