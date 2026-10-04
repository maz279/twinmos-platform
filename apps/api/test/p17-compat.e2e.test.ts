// 0017 compat gates — the QVL finder contract:
//   • CRUD carries the full finder field set (type/slots/speed/cats/SSD)
//   • list filters by deviceType + memoryGen + free-text q
//   • CSV import validates (dry-run report), dedupes by natural key,
//     and upserts on commit; bad headers/rows are refused without writes
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p17-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, compatibilityRule }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

// seed the first admin directly (Better Auth-registered) — mirrors seed.ts
const { betterAuth } = await import('better-auth');
const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
import * as schema from '@twinmos/db';
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});
await auth.api.signUpEmail({ body: { email: 'p17@twinmos.dev', password: 'P17-Compat-2026!', name: 'P17 Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where((await import('drizzle-orm')).eq(schema.user.email, 'p17@twinmos.dev'));

let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p17@twinmos.dev', password: 'P17-Compat-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

const CSV_HEADER = 'deviceType,deviceBrand,deviceModel,memoryGen,formFactor,maxGb,slots,speed,cats,ssdNote,ssdCats,notes';

describe('P17-1: compatibility CRUD with the finder contract', () => {
  it('creates a rule carrying the full field set and filters by deviceType', async () => {
    const res = await app.request('/api/v1/admin/compatibility', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({
        deviceType: 'diy', deviceBrand: 'ASUS', deviceModel: 'ROG STRIX Z790-E',
        memoryGen: 'DDR5', formFactor: 'U-DIMM', maxGb: 128, slots: 4, speed: 'DDR5-7200',
        cats: ['dram-gaming', 'dram-desktop'], ssdNote: 'M.2 2280 NVMe x4', ssdCats: ['ssd-nvme'],
        notes: 'Validated with XMP 3.0',
      }),
    });
    expect(res.status).toBe(201);
    const row = await res.json();
    expect(row.deviceType).toBe('diy');
    expect(row.slots).toBe(4);
    expect(row.cats).toEqual(['dram-gaming', 'dram-desktop']);

    const list = await (await app.request('/api/v1/admin/compatibility?deviceType=diy', { headers: HDRS() })).json();
    expect(list.items.every((r: any) => r.deviceType === 'diy')).toBe(true);
    expect(list.items.some((r: any) => r.deviceModel === 'ROG STRIX Z790-E')).toBe(true);
  });

  it('rejects an unknown deviceType (zod enum)', async () => {
    const res = await app.request('/api/v1/admin/compatibility', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ deviceBrand: 'X', deviceModel: 'Y', deviceType: 'toaster' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('P17-2: QVL batch CSV import', () => {
  it('refuses a bad header without touching anything', async () => {
    const res = await app.request('/api/v1/admin/compatibility/import', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ csv: 'a,b,c\n1,2,3', dryRun: false }),
    });
    expect(res.status).toBe(422);
    const count = await (await app.request('/api/v1/admin/compatibility', { headers: HDRS() })).json();
    expect(count.items.filter((r: any) => r.deviceBrand === 'Acer').length).toBe(0);
  });

  it('dry-run reports create/update split and row errors; commit upserts by natural key', async () => {
    const csv = [
      CSV_HEADER,
      'laptop,Acer,Aspire 5 (DDR4),DDR4,SO-DIMM,32,2,DDR4-3200,dram-notebook,M.2 2280 NVMe,ssd-nvme,',
      'laptop,Acer,Aspire 5 (DDR4),DDR4,SO-DIMM,32,2,DDR4-3200,dram-notebook,M.2 2280 NVMe,ssd-nvme,dup row',
      'toaster,Bad,Row,DDR4,,16,,,,,',
    ].join('\n');
    const dry = await (await app.request('/api/v1/admin/compatibility/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv, dryRun: true }),
    })).json();
    expect(dry.dryRun).toBe(true);
    expect(dry.wouldCreate).toBe(1);
    expect(dry.errors.length).toBe(2); // duplicate row + bad type

    const commit = await (await app.request('/api/v1/admin/compatibility/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv: CSV_HEADER + '\nlaptop,Acer,Aspire 5 (DDR4),DDR4,SO-DIMM,32,2,DDR4-3200,dram-notebook; dram-gaming,M.2 2280 NVMe,ssd-nvme,', dryRun: false }),
    })).json();
    expect(commit.imported).toBe(1);

    // same key again → update, not a second row
    const again = await (await app.request('/api/v1/admin/compatibility/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv: CSV_HEADER + '\nlaptop,Acer,Aspire 5 (DDR4),DDR4,SO-DIMM,64,2,DDR4-3200,dram-notebook,M.2 2280 NVMe,ssd-nvme,', dryRun: false }),
    })).json();
    expect(again.updated).toBe(1);
    expect(again.imported).toBe(0);

    const rows = await db.select().from(compatibilityRule).where((await import('drizzle-orm')).eq(compatibilityRule.deviceBrand, 'Acer'));
    expect(rows.length).toBe(1);
    expect(rows[0].maxGb).toBe(64); // upserted, not duplicated
    expect(rows[0].cats).toEqual(['dram-notebook']); // row values are replaced on update
  });
});
