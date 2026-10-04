// 0023 media console gates:
//   • list: q across key+alt, kind filter, missingAlt filter, total
//   • analytics: totals by kind, alt compliance, variant coverage, storage, series
//   • usage endpoint: references (product/article/news) + admin/public URLs
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p22-'));
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
await auth.api.signUpEmail({ body: { email: 'p22@twinmos.dev', password: 'P22-Media-2026!', name: 'P22 Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'p22@twinmos.dev'));

let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

// 1×1 PNG uploaded through the real endpoint (magic-byte sniffing + variants)
const PNG = Uint8Array.from(Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));

async function upload(name: string, alt: string): Promise<number> {
  const form = new FormData();
  form.append('file', new File([PNG], name, { type: 'image/png' }));
  form.append('alt', alt);
  const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
  // 201 = created; 200 = content-hash dedupe returned the existing asset (same PNG bytes)
  expect([200, 201]).toContain(res.status);
  return (await res.json()).id as number;
}

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p22@twinmos.dev', password: 'P22-Media-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P22-1: list filters', () => {
  it('searches across alt text, filters by kind and missing-alt', async () => {
    // one real upload (derives variants) + two direct rows so each asset is distinct
    await upload('hero-banner.png', 'Product hero banner for the VOLTX launch');
    const { mediaAsset } = await import('@twinmos/db');
    await db.insert(mediaAsset).values([
      { key: 'p22/diagram.png', kind: 'image', alt: 'Thermal test diagram', width: 800, height: 600, meta: { mime: 'image/png' } },
      { key: 'p22/noalt.png', kind: 'image', meta: { mime: 'image/png' } },
    ]);

    const byAlt = await (await app.request('/api/v1/admin/media?q=thermal', { headers: HDRS() })).json();
    expect(byAlt.total).toBe(1);
    expect(byAlt.items[0].alt).toContain('Thermal');

    const images = await (await app.request('/api/v1/admin/media?kind=image', { headers: HDRS() })).json();
    expect(images.total).toBe(3);

    const missing = await (await app.request('/api/v1/admin/media?missingAlt=1', { headers: HDRS() })).json();
    expect(missing.total).toBe(1);
    expect(missing.items[0].alt).toBeNull();
  });
});

describe('P22-2: analytics', () => {
  it('reports totals, compliance, variant coverage and storage', async () => {
    const a = await (await app.request('/api/v1/admin/media-analytics', { headers: HDRS() })).json();
    expect(a.total).toBeGreaterThanOrEqual(3);
    expect(a.altCompliance).toBeGreaterThanOrEqual(66); // 2/3
    expect(a.variantCoverage).toBeGreaterThanOrEqual(30); // 1/3 — only the real upload derives variants
    expect(a.byKind.some((k: any) => k.kind === 'image' && k.n >= 3)).toBe(true);
    expect(a.series.length).toBe(14);
  });
});

describe('P22-3: usage endpoint', () => {
  it('lists references and both URL forms', async () => {
    const id = await upload('usage-test.png', 'Usage test asset');
    // reference it from a product hero to make it in-use
    const { brand, category, product } = await import('@twinmos/db');
    const [b] = await db.insert(brand).values({ slug: 'p22b', name: 'P22 Brand' }).returning();
    const [c] = await db.insert(category).values({ slug: 'p22c', name: 'P22 Cat' }).returning();
    await db.insert(product).values({
      sku: 'P22-SKU-1', slug: 'p22-sku-1', name: 'P22 Product', brandId: b.id, categoryId: c.id,
      heroMediaId: id, specs: {},
    });
    const u = await (await app.request('/api/v1/admin/media/' + id + '/usage', { headers: HDRS() })).json();
    expect(u.usage.length).toBe(1);
    expect(u.usage[0].entity).toBe('product');
    expect(u.usage[0].label).toContain('P22 Product');
    expect(u.urls.admin).toBe('/api/v1/admin/media/' + id + '/file');
    expect(u.urls.public).toBe('/api/v1/media/' + id + '/file');
    expect(Array.isArray(u.urls.variants)).toBe(true);
  });
});
