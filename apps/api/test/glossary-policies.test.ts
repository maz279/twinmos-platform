// Test Suite for Milestone MS4.3 · Glossary and versioned policies (T4.3.1–T4.3.4 / GREF-C / ENTITY-TRUTH)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms43-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, glossaryTerm, policyDocument, outbox }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq, and, desc, sql } = await import('drizzle-orm');
const { importPrototypeGlossary }: any = await import('../scripts/import-prototype-glossary.ts');
import * as schema from '@twinmos/db';

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const { betterAuth } = await import('better-auth');
const { drizzleAdapter } = await import('better-auth/adapters/drizzle');

const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});

await auth.api.signUpEmail({ body: { email: 'ms43-admin@twinmos.dev', password: 'MS43-Password-2026!', name: 'MS43 Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'ms43-admin@twinmos.dev'));
await auth.api.signUpEmail({ body: { email: 'ms43-editor@twinmos.dev', password: 'MS43-Editor-2026!', name: 'MS43 Editor' } });
await db.update(schema.user).set({ role: 'editor' }).where(eq(schema.user.email, 'ms43-editor@twinmos.dev'));

let cookie = '';
let editorCookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });
const EDITOR_HDRS = () => ({ 'content-type': 'application/json', cookie: editorCookie });

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ms43-admin@twinmos.dev', password: 'MS43-Password-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();

  const resEditor = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ms43-editor@twinmos.dev', password: 'MS43-Editor-2026!' }),
  });
  editorCookie = resEditor.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(editorCookie).toBeTruthy();
});

afterAll(async () => {
  try {
    const client = (db as any).$client;
    if (client && typeof client.close === 'function') await client.close();
    rmSync(TMP, { recursive: true, force: true });
  } catch {}
});

describe('MS4.3 · T4.3.1 & T4.3.2 Glossary Import, Cleansing & Delivery API', () => {
  it('imports authentic 113 terms from prototype and unpublishes mock terms', async () => {
    // Insert mock term before import to verify cleansing
    await db.insert(glossaryTerm).values({
      term: 'Fake invented term 999',
      definition: 'Should be removed or unpublished',
      letter: 'F',
      status: 'published',
      locale: 'en',
    });

    const result = await importPrototypeGlossary(db);
    expect(result.total).toBe(113);
    expect(result.explainerCount).toBe(18);

    // Verify exactly 113 terms are published
    const publishedRows = await db
      .select()
      .from(glossaryTerm)
      .where(eq(glossaryTerm.status, 'published'));
    expect(publishedRows.length).toBe(113);

    // Verify invented term is unpublished or deleted
    const fakeTerm = await db
      .select()
      .from(glossaryTerm)
      .where(eq(glossaryTerm.term, 'Fake invented term 999'));
    expect(fakeTerm.length === 0 || fakeTerm[0].status !== 'published').toBe(true);
  });

  it('delivers 113 glossary terms via public delivery API', async () => {
    const res = await app.request('/api/v1/delivery/glossary');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta.total).toBe(113);
    expect(json.data.length).toBe(113);

    // Check first and last alphabetical sorting
    expect(json.data[0].term).toBe('AFR');
    expect(json.data[json.data.length - 1].term).toBe('Zstd');
  });

  it('filters glossary by letter correctly', async () => {
    const res = await app.request('/api/v1/delivery/glossary?letter=D');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBe(8);
    for (const term of json.data) {
      expect(term.letter).toBe('D');
    }
  });

  it('filters glossary by search keyword correctly', async () => {
    const res = await app.request('/api/v1/delivery/glossary?search=latency');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(2);
    const terms = json.data.map((t: any) => t.term);
    expect(terms).toContain('CAS Latency (CL)');
    expect(terms).toContain('Latency');
  });

  it('verifies 18 explainer references are mapped in delivery', async () => {
    const res = await app.request('/api/v1/delivery/glossary');
    const json = await res.json();
    const withExplainers = json.data.filter((t: any) => t.explainerSlug);
    expect(withExplainers.length).toBe(18);

    const xmp = json.data.find((t: any) => t.term === 'XMP');
    expect(xmp).toBeTruthy();
    expect(xmp.explainerSlug).toBe('what-is-xmp');
  });
});

describe('MS4.3 · T4.3.3 Policy Versioning & Compound Key Retention', () => {
  it('allows multiple versions for the same slug and locale', async () => {
    // Create Warranty v1.0
    const res1 = await app.request('/api/v1/admin/policies', {
      method: 'POST',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({
        slug: 'warranty',
        title: 'TwinMOS Global Warranty Policy',
        version: '1.0',
        status: 'published',
        legalApproved: true,
        approvedBy: 'Legal Counsel',
        effectiveDate: '2026-01-01T00:00:00Z',
        summary: 'Version 1.0 warranty policy',
        body: '<p>Operative warranty text v1.0</p>',
        cookieCategories: [],
        locale: 'en',
        }),
    });
    expect(res1.status).toBe(201);
    const doc1 = await res1.json();
    expect(doc1.version).toBe('1.0');
    expect(doc1.legalApproved).toBe(true);

    // Create Warranty v1.1 without overwriting v1.0
    const res2 = await app.request('/api/v1/admin/policies', {
      method: 'POST',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({
        slug: 'warranty',
        title: 'TwinMOS Global Warranty Policy',
        version: '1.1',
        status: 'published',
        legalApproved: true,
        approvedBy: 'Legal Counsel',
        effectiveDate: '2026-03-01T00:00:00Z',
        summary: 'Version 1.1 warranty policy with Gen 5 updates',
        body: '<p>Operative warranty text v1.1 with Gen 5 updates</p>',
        cookieCategories: [],
        locale: 'en',
        changeSummary: 'Added PCIe Gen 5 TBW coverage metrics',
        }),
    });
    expect(res2.status).toBe(201);
    const doc2 = await res2.json();
    expect(doc2.version).toBe('1.1');
    expect(doc2.id).not.toBe(doc1.id);

    // Check version list endpoint in admin API
    const versionsRes = await app.request('/api/v1/admin/policies/warranty/versions', {
      headers: HDRS(),
    });
    expect(versionsRes.status).toBe(200);
    const versionsJson = await versionsRes.json();
    expect(versionsJson.items.length).toBe(2);
    expect(versionsJson.items[0].version).toBe('1.1');
    expect(versionsJson.items[1].version).toBe('1.0');
  });

  it('retrieves latest policy version by default in delivery API', async () => {
    const res = await app.request('/api/v1/delivery/policies/warranty');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.version).toBe('1.1');
    expect(json.data.effectiveDate).toBe('2026-03-01T00:00:00.000Z');
    expect(json.meta.version).toBe('1.1');
  });

  it('retrieves older policy version when requested explicitly', async () => {
    const res = await app.request('/api/v1/delivery/policies/warranty?version=1.0');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.version).toBe('1.0');
    expect(json.data.effectiveDate).toBe('2026-01-01T00:00:00.000Z');
    expect(json.meta.version).toBe('1.0');
  });

  it('enforces compound uniqueness on (slug, locale, version)', async () => {
    // Attempt duplicate version 1.0 for warranty
    const res = await app.request('/api/v1/admin/policies', {
      method: 'POST',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({
        slug: 'warranty',
        title: 'Duplicate version',
        version: '1.0',
        status: 'published',
        legalApproved: true,
        body: 'Duplicate body',
        cookieCategories: [],
        locale: 'en',
        }),
    });
    // Should fail at database level or route level due to compound unique index
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('MS4.3 · T4.3.4 Legal Gating & Unapproved Policies Protection', () => {
  it('blocks publishing a policy without legal counsel approval', async () => {
    const res = await app.request('/api/v1/admin/policies', {
      method: 'POST',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({
        slug: 'terms',
        title: 'Website Terms of Service',
        version: '1.0',
        status: 'published', // PUBLISHED WITHOUT LEGAL APPROVAL!
        legalApproved: false,
        body: 'One paragraph placeholder terms',
        cookieCategories: [],
        locale: 'en',
        }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.title).toBe('Legal approval required');
  });

  it('allows saving unapproved policies as draft', async () => {
    const res = await app.request('/api/v1/admin/policies', {
      method: 'POST',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({
        slug: 'terms',
        title: 'Website Terms of Service',
        version: '0.1-draft',
        status: 'draft',
        legalApproved: false,
        body: 'One paragraph placeholder terms pending review',
        cookieCategories: [],
        locale: 'en',
        }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.status).toBe('draft');
    expect(json.legalApproved).toBe(false);
  });

  it('hides unapproved draft policies from delivery API', async () => {
    // Single policy lookup returns 404
    const resSingle = await app.request('/api/v1/delivery/policies/terms');
    expect(resSingle.status).toBe(404);

    // List policies does not include terms
    const resList = await app.request('/api/v1/delivery/policies');
    expect(resList.status).toBe(200);
    const jsonList = await resList.json();
    const slugs = jsonList.data.map((p: any) => p.slug);
    expect(slugs).not.toContain('terms');
  });

  it('blocks updating an unapproved draft policy to published without legal approval', async () => {
    const draftRes = await db.select().from(policyDocument).where(eq(policyDocument.slug, 'terms')).limit(1);
    const draftId = draftRes[0].id;

    const res = await app.request(`/api/v1/admin/policies/${draftId}`, {
      method: 'PATCH',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({
        status: 'published', // Try to publish without legalApproved
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.title).toBe('Legal approval required');
  });

  it('publishes policy immediately once legal counsel signs off', async () => {
    const draftRes = await db.select().from(policyDocument).where(eq(policyDocument.slug, 'terms')).limit(1);
    const draftId = draftRes[0].id;

    const res = await app.request(`/api/v1/admin/policies/${draftId}`, {
      method: 'PATCH',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({
        status: 'published',
        legalApproved: true,
        approvedBy: 'Lead Legal Counsel (Taipei)',
        effectiveDate: '2026-04-01T00:00:00Z',
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('published');
    expect(json.legalApproved).toBe(true);
    expect(json.publishedAt).toBeTruthy();

    // Now it appears in delivery API!
    const deliveryRes = await app.request('/api/v1/delivery/policies/terms');
    expect(deliveryRes.status).toBe(200);
    const delJson = await deliveryRes.json();
    expect(delJson.data.slug).toBe('terms');
    expect(delJson.data.legalApproved).toBe(true);
  });
});
