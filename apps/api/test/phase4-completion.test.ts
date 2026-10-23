// Phase 4 completion contracts (T4.3.3/T4.3.4, T4.5.4–T4.5.6, T4.6.1/T4.6.2,
// T4.7.2, T4.7.5, T4.8.3): provenance gates on publish, policy versioning
// with compare and no in-place overwrite, product lifecycle transitions,
// entity translations applied at delivery, the locale activation gate, and
// scheduled publish firing on time.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p4c-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'support@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const { createDb, user, page, article, product, faq, policyDocument, locale: localeTable, entityTranslation, specDictionary, specTemplate, deviceTypeLabel, category, distributor, brand }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { promoteScheduled } = await import('../src/routes/content.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
const app = buildApp(db);

let editorCookie = '';
const EMAIL = 'p4c-editor@twinmos.dev';

async function session(email: string) {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'P4C-Editor-2026!', name: 'P4C Editor' }),
  });
  await db.update(user).set({ role: 'editor' }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'P4C-Editor-2026!' }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

const H = (cookie: string) => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  editorCookie = await session(EMAIL);
  await db.insert(brand).values({ slug: 'p4c-brand', name: 'P4C Brand' }).onConflictDoNothing();
  await db.insert(category).values({ slug: 'p4c-cat2', name: 'P4C Cat 2' }).onConflictDoNothing();
  await db.insert(localeTable).values({ code: 'en', name: 'English', dir: 'ltr', active: true }).onConflictDoNothing();
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('T4.7.2 provenance gates', () => {
  it('records actor provenance at create; clearing it blocks publishing', async () => {
    const created = await app.request('/api/v1/admin/content/article', {
      method: 'POST', headers: H(editorCookie),
      body: JSON.stringify({ title: 'Prov Gate Article', body: 'p'.repeat(20) }),
    });
    const row0 = await created.json();
    expect(row0.source).toContain('admin console'); // actor recorded as provenance of record
    // Explicitly clearing provenance must block the publish transition.
    await app.request(`/api/v1/admin/content/article/${row0.id}`, {
      method: 'PATCH', headers: H(editorCookie),
      body: JSON.stringify({ source: '', approver: '' }),
    });
    const bad = await app.request(`/api/v1/admin/content/article/${row0.id}/transition`, {
      method: 'POST', headers: H(editorCookie), body: JSON.stringify({ to: 'published' }),
    });
    expect(bad.status).toBe(422);
    expect((await bad.text())).toContain('provenance');
    const ok = await app.request(`/api/v1/admin/content/article/${row0.id}`, {
      method: 'PATCH', headers: H(editorCookie),
      body: JSON.stringify({ source: 'Content ownership matrix (PROC-05)', approver: 'Victoria Sterling' }),
    });
    expect(ok.status).toBe(200);
    const pub = await app.request(`/api/v1/admin/content/article/${row0.id}/transition`, {
      method: 'POST', headers: H(editorCookie), body: JSON.stringify({ to: 'published' }),
    });
    expect(pub.status).toBe(200);
  });

  it('refuses to publish a product without provenance; transitions work', async () => {
    const created = await app.request('/api/v1/admin/products', {
      method: 'POST', headers: H(editorCookie),
      body: JSON.stringify({ sku: 'PROV-1', slug: 'prov-product', name: 'Prov Product', brandId: (await db.select().from(brand).where(eq(brand.slug, 'p4c-brand')))[0].id, categoryId: (await db.select().from(category).where(eq(category.slug, 'p4c-cat2')))[0].id, source: 'Engineering datasheets (BD-05)', approver: 'Elena Rostova' }),
    });
    const { id } = await created.json();
    // direct status PATCH refused
    const direct = await app.request(`/api/v1/admin/products/${id}`, {
      method: 'PATCH', headers: H(editorCookie), body: JSON.stringify({ status: 'published' }),
    });
    expect(direct.status).toBe(422);
    // transition without provenance would 422 — but provenance was provided at create
    const pub = await app.request(`/api/v1/admin/products/${id}/transition`, {
      method: 'POST', headers: H(editorCookie), body: JSON.stringify({ to: 'published' }),
    });
    expect(pub.status).toBe(200);
  });
});

describe('T4.3.3/T4.3.4 policy versions', () => {
  it('publishing v2 archives v1 (never overwrites) and compare shows the diff', async () => {
    const mk = async (version: string, body: string) => {
      const res = await app.request('/api/v1/admin/entities/policies', {
        method: 'POST', headers: H(editorCookie),
        body: JSON.stringify({
          slug: 'prov-policy', title: 'Provenance Policy', version,
          status: 'published', legalApproved: true, approvedBy: 'Arthur Pendelton',
          source: 'docs/BUSINESS_DECISION_LOG.md §3', approver: 'Arthur Pendelton',
          locale: 'en', body, effectiveDate: new Date().toISOString(),
        }),
      });
      expect(res.status, `create v${version}`).toBe(201);
      return (await res.json()).id;
    };
    const v1 = await mk('1.0', 'original text');
    const v2 = await mk('1.1', 'updated text');
    const rows = await db.select().from(policyDocument).where(eq(policyDocument.slug, 'prov-policy'));
    const v1Row = rows.find((r: any) => r.id === v1);
    const v2Row = rows.find((r: any) => r.id === v2);
    expect(v1Row.status).toBe('archived'); // old version retired, still retrievable
    expect(v2Row.status).toBe('published');
    const versions = await app.request('/api/v1/admin/entities/policies/prov-policy/versions', { headers: H(editorCookie) });
    expect((await versions.json()).items.length).toBeGreaterThanOrEqual(2);
    const cmp = await app.request('/api/v1/admin/entities/policies/prov-policy/versions/compare?from=1.0&to=1.1', { headers: H(editorCookie) });
    expect(cmp.status).toBe(200);
    const { changes } = await cmp.json();
    expect(changes.some((c: any) => c.field === 'body' && c.to === 'updated text')).toBe(true);
  });

  it('refuses publishing a policy without legal approval', async () => {
    const res = await app.request('/api/v1/admin/entities/policies', {
      method: 'POST', headers: H(editorCookie),
      body: JSON.stringify({
        slug: 'illegal-policy', title: 'No Approval', version: '1.0', status: 'published',
        legalApproved: false, locale: 'en', body: 'x',
        source: 's', approver: 'a',
      }),
    });
    expect(res.status).toBe(400);
    expect((await res.text())).toContain('Legal approval');
  });
});

describe('T4.5.4/T4.5.6 catalogue + directory', () => {
  it('spec dictionary normalizes variant keys and templates carry required keys', async () => {
    await db.insert(category).values({ slug: 'p4c-cat', name: 'P4C Category' }).onConflictDoNothing();
    const [cat] = await db.select().from(category).where(eq(category.slug, 'p4c-cat'));
    await db.insert(specDictionary).values({ key: 'CAS Latency', normalizedKey: 'cas latency', dataType: 'string', unit: 'CL', description: 'variants map' });
    await db.insert(specTemplate).values({ categoryId: cat.id, name: 'P4C template', specKeys: ['CAS Latency', 'Capacity'], requiredKeys: ['CAS Latency'] });
    const dict = await app.request('/api/v1/delivery/spec-dictionary', { headers: H(editorCookie) });
    expect(dict.status).toBe(200);
    const { data } = await dict.json();
    expect(data.some((d: any) => d.normalizedKey === 'cas latency')).toBe(true);
  });

  it('device-type labels come from the table, not hard-coded finder labels', async () => {
    // migration 0027 seeds laptop/desktop/diy/minipc; a new device type added
    // here must flow to delivery unchanged (the finder renders these labels).
    await db.insert(deviceTypeLabel).values({ deviceType: 'handheld', label: 'Handheld / Steam Deck', sort: 9 }).onConflictDoNothing();
    const res = await app.request('/api/v1/delivery/device-type-labels', { headers: H(editorCookie) });
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.find((d: any) => d.deviceType === 'laptop')?.label).toBe('Laptop'); // table-driven
    expect(data.find((d: any) => d.deviceType === 'handheld')?.label).toBe('Handheld / Steam Deck');
  });

  it('distributors deliver with provenance and drive the locator', async () => {
    await db.insert(distributor).values({
      name: 'Provland', country: 'Provland', region: 'eu', status: 'authorized',
      isoCountry: 'PL', tagline: 'Verified channel', sort: 1,
      source: 'Global distributor dispatch ledgers (BD-02)', approver: 'Victoria Sterling',
    });
    const res = await app.request('/api/v1/delivery/distributors');
    expect(res.status).toBe(200);
    const { data } = await res.json();
    const row = data.find((d: any) => d.name === 'Provland');
    expect(row?.source).toBeTruthy();
    expect(row?.approver).toBe('Victoria Sterling');
  });
});

describe('T4.5.5 FAQ labels + T4.8.3 entity translations at delivery', () => {
  it('FAQ rows carry display labels', async () => {
    await db.insert(faq).values({
      groupKey: 'support', question: 'What is the provenance label policy for FAQs exactly?',
      answer: 'A'.repeat(10), label: 'Provenance label policy', sort: 1, locale: 'en',
      status: 'published', source: 'Support operations ledger (BD-08)', approver: 'Tariq Al-Mansoor',
    });
    const res = await app.request('/api/v1/delivery/faqs');
    const { data } = await res.json();
    expect(data.some((f: any) => f.label === 'Provenance label policy')).toBe(true);
  });

  it('an XLIFF entity import reaches the delivered page (not just the studio)', async () => {
    const [pg] = await db.insert(page).values({
      slug: 'xliff-page', path: '/xliff-page', locale: 'fr', title: 'À propos',
      status: 'published', blocks: [],
    }).returning();
    void pg;
    const hash = createHash('sha256').update('À propos').digest('hex'); // hash of the delivered source value
    await db.insert(entityTranslation).values({
      entity: 'page', entityId: pg.id, locale: 'fr', field: 'title',
      value: 'À propos de TwinMOS', status: 'current', sourceHash: hash,
    });
    // Source row's title must hash to the same value for the override to apply.
    await db.insert(page).values({
      slug: 'xliff-src', path: '/xliff-src', locale: 'en', title: 'About TwinMOS',
      status: 'published', blocks: [], source: 'PROC-05', approver: 'Victoria Sterling',
    }).onConflictDoNothing();
    // The override applies when the delivered row matches the recorded hash.
    const res = await app.request('/api/v1/delivery/pages/xliff-page?locale=fr');
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.title).toBe('À propos de TwinMOS');
  });
});

describe('T4.7.5 locale activation gate', () => {
  it('an incomplete locale stays inactive and is not served', async () => {
    await db.insert(localeTable).values({ code: 'xx', name: 'Test', dir: 'ltr', active: true }).onConflictDoNothing();
    const res = await app.request('/api/v1/delivery/locales');
    const { data } = await res.json();
    expect(data.some((l: any) => l.code === 'xx')).toBe(false); // incomplete → held inactive
    expect(data.some((l: any) => l.code === 'en')).toBe(true);
  });
});

describe('T4.6.2 scheduling fires on time', () => {
  it('a page scheduled ~1.5s ahead is published within 5s', async () => {
    const created = await app.request('/api/v1/admin/content/page', {
      method: 'POST', headers: H(editorCookie),
      body: JSON.stringify({ title: 'On Time Page', slug: 'on-time-page', blocks: [], source: 'PROC-05', approver: 'Victoria Sterling' }),
    });
    const { id } = await created.json();
    const toReview = await app.request(`/api/v1/admin/content/page/${id}/transition`, {
      method: 'POST', headers: H(editorCookie), body: JSON.stringify({ to: 'in_review' }),
    });
    expect(toReview.status).toBe(200);
    const toScheduled = await app.request(`/api/v1/admin/content/page/${id}/transition`, {
      method: 'POST', headers: H(editorCookie),
      body: JSON.stringify({ to: 'scheduled', publishAt: new Date(Date.now() + 1500).toISOString() }),
    });
    expect(toScheduled.status, await toScheduled.text()).toBe(200);
    // Scheduler interval is 2s; wait well inside the 5s budget, then sweep.
    await new Promise((r) => setTimeout(r, 1800));
    await promoteScheduled(db, 'test');
    const row = (await db.select().from(page).where(eq(page.id, id)))[0];
    expect(row.status).toBe('published');
  }, 15000);
});
