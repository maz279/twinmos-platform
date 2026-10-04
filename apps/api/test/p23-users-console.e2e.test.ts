// 0024 user console gates:
//   • analytics: role distribution, MFA coverage, active sessions, suspended, series
//   • activity: per-user security profile (sessions + recent audited actions)
//   • RBAC: super_admin only (admin gets 403, anon 401)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p23-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, auditLog }: any = await import('@twinmos/db');
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
await auth.api.signUpEmail({ body: { email: 'p23@twinmos.dev', password: 'P23-Users-2026!', name: 'P23 Super' } });
await auth.api.signUpEmail({ body: { email: 'viewer23@twinmos.dev', password: 'P23-View-2026!', name: 'V23' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'p23@twinmos.dev'));
const superId = (await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, 'p23@twinmos.dev')).limit(1))[0].id;

let cookie = '';
let viewerCookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p23@twinmos.dev', password: 'P23-Users-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();
  const vr = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'viewer23@twinmos.dev', password: 'P23-View-2026!' }),
  });
  viewerCookie = vr.headers.get('set-cookie')?.split(';')[0] ?? '';
  // seed some audited activity for the super admin
  await db.insert(auditLog).values([
    { actorId: superId, action: 'user.invite', entity: 'user', entityId: 'x1', ip: '203.0.113.9' },
    { actorId: superId, action: 'user.role', entity: 'user', entityId: 'x2', ip: '203.0.113.9' },
  ]);
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P23-1: directory analytics', () => {
  it('reports role distribution, MFA coverage, sessions and the join series', async () => {
    const a = await (await app.request('/api/v1/admin/users/analytics', { headers: HDRS() })).json();
    expect(a.total).toBe(2);
    expect(a.byRole.some((r: any) => r.role === 'super_admin' && r.n === 1)).toBe(true);
    expect(a.byRole.some((r: any) => r.role === 'viewer' && r.n === 1)).toBe(true);
    expect(a.mfaCoverage).toBe(0); // neither has MFA
    expect(a.activeSessions).toBeGreaterThanOrEqual(2); // both signed in
    expect(a.suspended).toBe(0);
    expect(a.series.length).toBe(14);
    expect(a.series[13].n).toBe(2); // both joined today
  });

  it('is super_admin only', async () => {
    expect((await app.request('/api/v1/admin/users/analytics')).status).toBe(401);
    expect((await app.request('/api/v1/admin/users/analytics', { headers: { cookie: viewerCookie } })).status).toBe(403);
  });
});

describe('P23-2: per-user security profile', () => {
  it('returns the account summary, live session count and recent audited actions', async () => {
    const p = await (await app.request('/api/v1/admin/users/' + superId + '/activity', { headers: HDRS() })).json();
    expect(p.email).toBe('p23@twinmos.dev');
    expect(p.role).toBe('super_admin');
    expect(p.activeSessions).toBeGreaterThanOrEqual(1);
    expect(p.activity.length).toBe(2);
    expect(p.activity.some((a: any) => a.action === 'user.invite' && a.ip === '203.0.113.9')).toBe(true);
  });

  it('404s for unknown ids and is super_admin only', async () => {
    expect((await app.request('/api/v1/admin/users/nope/activity', { headers: HDRS() })).status).toBe(404);
    expect((await app.request('/api/v1/admin/users/' + superId + '/activity', { headers: { cookie: viewerCookie } })).status).toBe(403);
  });
});
