// 0021 serial console gates:
//   • registry list: batch filter + total
//   • analytics: registry size, 24h/7d volume, valid rate, top SKUs/countries
//   • drill-down: registry row + 24h distinct-source activity + verdict + history
//   • delete: removes the registry row (verification history stays), audited
//   • export.csv: the filtered set, audited
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p21-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, serialRegistry, snCheck }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

// seed the first admin (Better Auth) — mirrors seed.ts
const { betterAuth } = await import('better-auth');
const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
import * as schema from '@twinmos/db';
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});
await auth.api.signUpEmail({ body: { email: 'p21@twinmos.dev', password: 'P21-SN-2026!', name: 'P21 Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'p21@twinmos.dev'));

let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

const OK_SERIAL = 'P21-OK-0001';
const SUSPICIOUS_SERIAL = 'P21-SUS-0002';

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p21@twinmos.dev', password: 'P21-SN-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();

  await db.insert(serialRegistry).values([
    { serial: OK_SERIAL, sku: 'VLT-DDR5-16G', batch: 'P21A' },
    { serial: SUSPICIOUS_SERIAL, sku: 'VLT-SSD-1TB', batch: 'P21B' },
  ]);
  for (let i = 1; i <= 7; i++) {
    await db.insert(snCheck).values({ serial: SUSPICIOUS_SERIAL, sku: 'VLT-SSD-1TB', result: 'valid', ip: `198.51.100.${i}`, country: 'YY' });
  }
  await db.insert(snCheck).values({ serial: OK_SERIAL, sku: 'VLT-DDR5-16G', result: 'valid', ip: '198.51.100.99', country: 'ZZ' });
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P21-1: registry list with batch filter + total', () => {
  it('filters by batch and reports the total', async () => {
    const all = await (await app.request('/api/v1/admin/serials', { headers: HDRS() })).json();
    expect(all.total).toBeGreaterThanOrEqual(2);
    const byBatch = await (await app.request('/api/v1/admin/serials?batch=P21B', { headers: HDRS() })).json();
    expect(byBatch.total).toBe(1);
    expect(byBatch.items[0].serial).toBe(SUSPICIOUS_SERIAL);
  });
});

describe('P21-2: analytics', () => {
  it('reports registry size, volumes, valid rate and top SKUs', async () => {
    const a = await (await app.request('/api/v1/admin/serials/analytics', { headers: HDRS() })).json();
    expect(a.registry).toBeGreaterThanOrEqual(2);
    expect(a.checks7d).toBeGreaterThanOrEqual(8);
    expect(a.validRate7d).toBe(100); // all seeded checks are valid
    expect(a.topSkus.length).toBeGreaterThanOrEqual(1);
    expect(a.countries.length).toBeGreaterThanOrEqual(1);
  });
});

describe('P21-3: drill-down + delete', () => {
  it('drills into a verified serial with 24h activity and history', async () => {
    const d = await (await app.request('/api/v1/admin/serials/' + OK_SERIAL, { headers: HDRS() })).json();
    expect(d.verdict).toBe('verified');
    expect(d.registry.sku).toBe('VLT-DDR5-16G');
    expect(d.last24h.checks).toBe(1);
    expect(d.history.length).toBe(1);
  });

  it('drills into a suspicious serial (7 IPs/24h)', async () => {
    const d = await (await app.request('/api/v1/admin/serials/' + SUSPICIOUS_SERIAL, { headers: HDRS() })).json();
    expect(d.verdict).toBe('suspicious');
    expect(d.last24h.distinctIps).toBe(7);
  });

  it('deletes a registry row but keeps verification history; re-delete 404s', async () => {
    const del = await app.request('/api/v1/admin/serials/' + OK_SERIAL, { method: 'DELETE', headers: HDRS() });
    expect(del.status).toBe(200);
    // drill-down still answers (history is preserved) but registry is null
    const gone = await (await app.request('/api/v1/admin/serials/' + OK_SERIAL, { headers: HDRS() })).json();
    expect(gone.registry).toBeNull();
    expect(gone.verdict).toBe('unknown');
    expect(gone.history.length).toBe(1);
    const again = await app.request('/api/v1/admin/serials/' + OK_SERIAL, { method: 'DELETE', headers: HDRS() });
    expect(again.status).toBe(404);
  });
});

describe('P21-4: registry export', () => {
  it('exports the filtered registry as CSV with the canonical header', async () => {
    const res = await app.request('/api/v1/admin/serials/export.csv?batch=P21B', { headers: HDRS() });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    const text = await res.text();
    expect(text.split('\r\n')[0]).toBe('serial,sku,manufacturedat,batch');
    expect(text).toContain(SUSPICIOUS_SERIAL);
    expect(text).not.toContain(OK_SERIAL); // deleted above
  });
});
