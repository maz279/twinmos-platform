import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms48-xliff-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-ms48-roundtrip-9988';
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.ENFORCE_MFA = '0';

const MIGRATIONS = existsSync(join(process.cwd(), 'packages', 'db', 'migrations'))
  ? join(process.cwd(), 'packages', 'db', 'migrations')
  : join(process.cwd(), '..', '..', 'packages', 'db', 'migrations');

const { createDb, user, brand, category, page, product, glossaryTerm, translation }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

let adminCookie = '';

async function makeSession(email: string, password: string, role?: string): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: email.split('@')[0] }),
  });
  if (role) await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  adminCookie = await makeSession('admin-ms48@twinmos.dev', 'P3-Admin-2026!', 'super_admin');
  await db.insert(brand).values({ name: 'TwinMOS', slug: 'twinmos' });
  await db.insert(category).values({ name: 'Storage', slug: 'storage' });
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('MS4.8 / T4.8.4: Full XLIFF Round-Trip (Page, Product, Glossary in Arabic)', () => {
  let pageId: number;
  let prodId: number;
  let glossId: number;

  it('1. Seeds a page, a product, and a glossary term in English', async () => {
    // 1. Page
    const pageRes = await app.request('/api/v1/admin/content/page', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        title: 'Enterprise Storage Architecture',
        slug: 'enterprise-storage-arch',
        path: '/solutions/enterprise-storage-arch',
        locale: 'en',
        status: 'published',
        blocks: [{ type: 'hero', title: 'Enterprise Storage Architecture' }],
        seo: { description: 'Enterprise SSDs and High-Density DRAM Solutions' },
        }),
    });
    expect(pageRes.status).toBe(201);
    const pageJson = await pageRes.json();
    pageId = pageJson.id;
    expect(pageId).toBeGreaterThan(0);

    // 2. Product
    const prodRes = await app.request('/api/v1/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        sku: 'TWN-COREX-4TB',
        slug: 'corex-pro-4tb-gen5',
        name: 'TwinMOS CoreX Pro 4TB NVMe SSD',
        brandId: 1,
        categoryId: 1,
        shortSpec: 'PCIe Gen 5.0 x4 M.2 2280',
        description: 'Ultra-high endurance flagship SSD for data centers',
        priceUsd: 399.99,
        currency: 'USD',
        status: 'published',
        }),
    });
    expect(prodRes.status).toBe(201);
    const prodJson = await prodRes.json();
    prodId = prodJson.id;
    expect(prodId).toBeGreaterThan(0);

    // 3. Glossary Term
    const glossRes = await app.request('/api/v1/admin/glossary', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        term: 'PCIe Gen 5.0',
        definition: 'Fifth-generation PCI Express standard delivering up to 32 GT/s per lane.',
        letter: 'P',
        locale: 'en',
      }),
    });
    expect(glossRes.status).toBe(201);
    const glossJson = await glossRes.json();
    glossId = glossJson.id;
    expect(glossId).toBeGreaterThan(0);
  });

  it('2. Exports entities into XLIFF containing Page, Product, and Glossary trans-units', async () => {
    const res = await app.request('/api/v1/admin/translations/entities/xliff?locale=ar', {
      headers: { cookie: adminCookie },
    });
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('xmlns="urn:oasis:names:tc:xliff:document:1.2"');
    expect(xml).toContain(`id="page:${pageId}:title"`);
    expect(xml).toContain(`id="product:${prodId}:name"`);
    expect(xml).toContain(`id="glossary:${glossId}:term"`);
    expect(xml).toContain('Enterprise Storage Architecture');
    expect(xml).toContain('TwinMOS CoreX Pro 4TB NVMe SSD');
    expect(xml).toContain('PCIe Gen 5.0');
  });

  it('3. Checks initial status flags all 7 target fields as missing', async () => {
    const res = await app.request('/api/v1/admin/translations/entities/status?locale=ar', {
      headers: { cookie: adminCookie },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.locale).toBe('ar');
    expect(json.summary.total).toBeGreaterThanOrEqual(7);

    const pageTitleItem = json.items.find((i: any) => i.id === `page:${pageId}:title`);
    expect(pageTitleItem.status).toBe('missing');
    expect(pageTitleItem.target).toBeNull();
  });

  it('4. Strictly rejects corrupted UTF encodings (??? or \\uFFFD) with HTTP 422 Problem JSON', async () => {
    const corruptXml = `<?xml version="1.0" encoding="UTF-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
  <file original="twinmos/entities" source-language="en" target-language="ar" datatype="plaintext">
    <body>
      <trans-unit id="page:${pageId}:title">
        <source xml:lang="en">Enterprise Storage Architecture</source>
        <target xml:lang="ar">??? \uFFFD بنية تخزين تالفة</target>
      </trans-unit>
    </body>
  </file>
</xliff>`;

    const res = await app.request('/api/v1/admin/translations/entities/xliff', {
      method: 'POST',
      headers: { 'content-type': 'application/xml', cookie: adminCookie },
      body: corruptXml,
    });
    expect(res.status).toBe(422);
    const err = await res.json();
    expect(err.title).toBe('Encoding Validation Failed');
    expect(err.detail).toContain('corrupted');
  });

  it('5. Imports translated Arabic XLIFF restoring authentic Arabic text', async () => {
    const translatedArabicXml = `<?xml version="1.0" encoding="UTF-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
  <file original="twinmos/entities" source-language="en" target-language="ar" datatype="plaintext">
    <body>
      <trans-unit id="page:${pageId}:title">
        <source xml:lang="en">Enterprise Storage Architecture</source>
        <target xml:lang="ar">بنية تخزين المؤسسات</target>
      </trans-unit>
      <trans-unit id="page:${pageId}:seoDescription">
        <source xml:lang="en">Enterprise SSDs and High-Density DRAM Solutions</source>
        <target xml:lang="ar">حلول محركات الأقراص الصلبة للمؤسسات وذاكرة عالية الكثافة</target>
      </trans-unit>
      <trans-unit id="product:${prodId}:name">
        <source xml:lang="en">TwinMOS CoreX Pro 4TB NVMe SSD</source>
        <target xml:lang="ar">قرص توين موس كور إكس برو 4 تيرابايت</target>
      </trans-unit>
      <trans-unit id="product:${prodId}:shortSpec">
        <source xml:lang="en">PCIe Gen 5.0 x4 M.2 2280</source>
        <target xml:lang="ar">منفذ الملحقات الإضافية السريع الجيل الخامس</target>
      </trans-unit>
      <trans-unit id="product:${prodId}:description">
        <source xml:lang="en">Ultra-high endurance flagship SSD for data centers</source>
        <target xml:lang="ar">قرص التخزين الرائد فائق التحمل لمراكز البيانات</target>
      </trans-unit>
      <trans-unit id="glossary:${glossId}:term">
        <source xml:lang="en">PCIe Gen 5.0</source>
        <target xml:lang="ar">الجيل الخامس من منفذ بي سي آي إكسبريس</target>
      </trans-unit>
      <trans-unit id="glossary:${glossId}:definition">
        <source xml:lang="en">Fifth-generation PCI Express standard delivering up to 32 GT/s per lane.</source>
        <target xml:lang="ar">معيار بي سي آي إكسبريس من الجيل الخامس يوفر ما يصل إلى 32 جيجاترانزفير/ثانية لكل مسار.</target>
      </trans-unit>
    </body>
  </file>
</xliff>`;

    const res = await app.request('/api/v1/admin/translations/entities/xliff', {
      method: 'POST',
      headers: { 'content-type': 'application/xml', cookie: adminCookie },
      body: translatedArabicXml,
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.locale).toBe('ar');
    expect(json.imported).toBe(7);
    expect(json.skippedEmpty).toBe(0);
  });

  it('6. Verifies per-field status reports all 7 fields as current with exact Arabic values', async () => {
    const res = await app.request('/api/v1/admin/translations/entities/status?locale=ar', {
      headers: { cookie: adminCookie },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary.current).toBeGreaterThanOrEqual(7);

    const pageTitleItem = json.items.find((i: any) => i.id === `page:${pageId}:title`);
    expect(pageTitleItem.status).toBe('current');
    expect(pageTitleItem.target).toBe('بنية تخزين المؤسسات');

    const prodNameItem = json.items.find((i: any) => i.id === `product:${prodId}:name`);
    expect(prodNameItem.status).toBe('current');
    expect(prodNameItem.target).toBe('قرص توين موس كور إكس برو 4 تيرابايت');

    const glossTermItem = json.items.find((i: any) => i.id === `glossary:${glossId}:term`);
    expect(glossTermItem.status).toBe('current');
    expect(glossTermItem.target).toBe('الجيل الخامس من منفذ بي سي آي إكسبريس');
  });

  it('7. Re-exports XLIFF and confirms perfect identical round-trip Arabic content', async () => {
    const res = await app.request('/api/v1/admin/translations/entities/xliff?locale=ar', {
      headers: { cookie: adminCookie },
    });
    expect(res.status).toBe(200);
    const xml = await res.text();

    // Verify all Arabic targets are identical in the re-exported round-trip XLIFF
    expect(xml).toContain('<target xml:lang="ar">بنية تخزين المؤسسات</target>');
    expect(xml).toContain('<target xml:lang="ar">حلول محركات الأقراص الصلبة للمؤسسات وذاكرة عالية الكثافة</target>');
    expect(xml).toContain('<target xml:lang="ar">قرص توين موس كور إكس برو 4 تيرابايت</target>');
    expect(xml).toContain('<target xml:lang="ar">منفذ الملحقات الإضافية السريع الجيل الخامس</target>');
    expect(xml).toContain('<target xml:lang="ar">قرص التخزين الرائد فائق التحمل لمراكز البيانات</target>');
    expect(xml).toContain('<target xml:lang="ar">الجيل الخامس من منفذ بي سي آي إكسبريس</target>');
    expect(xml).toContain('<target xml:lang="ar">معيار بي سي آي إكسبريس من الجيل الخامس يوفر ما يصل إلى 32 جيجاترانزفير/ثانية لكل مسار.</target>');
  });
});
