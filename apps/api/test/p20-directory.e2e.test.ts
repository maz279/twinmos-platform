// 0020 where-to-buy directory gates:
//   • distributor CRUD + filters (q/region/status) + total
//   • CSV import: header contract, dry-run split, upsert by (name,country), dedupe
//   • marketplace listings: create (auto-verified) + delete
//   • RBAC: editor+ (viewer gets 403 even authenticated)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p20-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

// seed an editor (directory role) — mirrors seed.ts
const { betterAuth } = await import('better-auth');
const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
import * as schema from '@twinmos/db';
const { eq } = await import('drizzle-orm');
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});
await auth.api.signUpEmail({ body: { email: 'p20@twinmos.dev', password: 'P20-Dir-2026!', name: 'P20 Editor' } });
await db.update(schema.user).set({ role: 'editor' }).where(eq(schema.user.email, 'p20@twinmos.dev'));

let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p20@twinmos.dev', password: 'P20-Dir-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

const CSV_HEADER = 'name,country,region,status,cities,contactEmail,website,note';

describe('P20-1: distributor CRUD + filters', () => {
  it('creates with the full card contract and filters by region/status/q', async () => {
    const res = await app.request('/api/v1/admin/distributors', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({
        name: 'Acme Trading', country: 'Kenya', region: 'af', status: 'expanding',
        cities: ['Nairobi', 'Mombasa'], contact: { email: 'sales@acme.example', website: 'https://acme.example' },
        note: 'Regional consumer electronics distributor',
      }),
    });
    expect(res.status).toBe(201);
    const row = await res.json();
    expect(row.cities).toEqual(['Nairobi', 'Mombasa']);

    const byRegion = await (await app.request('/api/v1/admin/distributors?region=af', { headers: HDRS() })).json();
    expect(byRegion.total).toBe(1);
    const byQ = await (await app.request('/api/v1/admin/distributors?q=nairobi', { headers: HDRS() })).json();
    expect(byQ.total).toBe(1); // city text is searched
    expect((await (await app.request('/api/v1/admin/distributors?q=zzz', { headers: HDRS() })).json()).total).toBe(0);
  });

  it('rejects unknown region/status (zod enums)', async () => {
    const res = await app.request('/api/v1/admin/distributors', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ name: 'X', country: 'Y', region: 'antarctica', status: 'authorized' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('P20-2: batch CSV import', () => {
  it('dry-run reports the create/update split and row errors; commit upserts by name+country', async () => {
    const csv = [
      CSV_HEADER,
      'Beta Channels,Nigeria,af,authorized,"Lagos; Abuja",sales@beta.example,https://beta.example,West Africa hub',
      'Gamma Supply,Kenya,af,authorized,Nairobi,,,',
      'Bad Row,Nowhere,antarctica,authorized,,,,',
      'Beta Channels,Nigeria,af,authorized,"Lagos",,,duplicate',
    ].join('\n');
    const dry = await (await app.request('/api/v1/admin/distributors/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv, dryRun: true }),
    })).json();
    expect(dry.wouldCreate).toBe(2);
    expect(dry.errors.length).toBe(2); // bad region + duplicate name+country

    const commit = await (await app.request('/api/v1/admin/distributors/import', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ csv: CSV_HEADER + '\nBeta Channels,Nigeria,af,authorized,"Lagos; Abuja",sales@beta.example,,', dryRun: false }),
    })).json();
    expect(commit.imported).toBe(1);

    // same name+country again → update (status change lands), not a second row
    const again = await (await app.request('/api/v1/admin/distributors/import', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ csv: CSV_HEADER + '\nBeta Channels,Nigeria,af,seeking,Lagos,,,', dryRun: false }),
    })).json();
    expect(again.updated).toBe(1);
    expect(again.imported).toBe(0);

    const list = await (await app.request('/api/v1/admin/distributors?q=Beta', { headers: HDRS() })).json();
    expect(list.total).toBe(1);
    expect(list.items[0].status).toBe('seeking');
  });
});

describe('P20-3: marketplace listings + RBAC', () => {
  it('creates verified listings and deletes them', async () => {
    const res = await app.request('/api/v1/admin/marketplace-listings', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ platform: 'Amazon AE', url: 'https://www.amazon.ae', country: 'UAE' }),
    });
    expect(res.status).toBe(201);
    const row = await res.json();
    expect(row.verifiedAt).toBeTruthy();

    const del = await app.request('/api/v1/admin/marketplace-listings/' + row.id, { method: 'DELETE', headers: HDRS() });
    expect(del.status).toBe(200);
  });

  it('requires a session (401 anon) and editor+ role', async () => {
    expect((await app.request('/api/v1/admin/distributors')).status).toBe(401);
    // viewers are rejected — sign up a viewer and try
    await auth.api.signUpEmail({ body: { email: 'viewer20@twinmos.dev', password: 'P20-View-2026!', name: 'V' } });
    const vr = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'viewer20@twinmos.dev', password: 'P20-View-2026!' }),
    });
    const vcookie = vr.headers.get('set-cookie')?.split(';')[0] ?? '';
    const forbidden = await app.request('/api/v1/admin/distributors', { headers: { cookie: vcookie } });
    expect(forbidden.status).toBe(403);
  });
});
