// Phase 2 (Content Studio) — server gates:
//   §2.1 page-builder blocks round-trip (13 block types persist via page CRUD)
//   §2.3 review workflow: in_review transition, editorial comments (RBAC +
//        audit row + validation), and the comments list join
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p10-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'studio@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

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

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P10-Stu-' + new Date().getFullYear() + '!';
let cookie = '';
beforeAll(async () => {
  const su = await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p10@twinmos.dev', password: mkPass(), name: 'p10' }),
  });
  expect([200, 201]).toContain(su.status);
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'p10@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p10@twinmos.dev', password: mkPass() }),
  });
  expect(res.status, 'sign-in ' + (await res.text())).toBe(200);
  cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  expect(cookie.length).toBeGreaterThan(10);
});
afterAll(async () => { await db.$client.close(); rmSync(TMP, { recursive: true, force: true }); });

/** Headers factory — built AFTER beforeAll assigns the cookie (a module-level
 *  object literal would capture the empty string at import time). */
const H = () => ({ 'content-type': 'application/json', cookie });

/** One minimal instance of every registered builder block type (§2.1's 13). */
const ALL_BLOCKS = [
  { type: 'hero', title: 'Hero', ctaLabel: 'Buy', ctaHref: '/buy' },
  { type: 'textMedia', layout: 'right', markdown: 'copy', caption: 'c', badge: 'b' },
  { type: 'featureGrid', headline: 'F', columns: '3', items: [{ icon: '⚡', title: 'T', desc: 'D', href: '' }] },
  { type: 'productShowcase', headline: 'P', skus: [{ sku: 'VLT-DDR5-16G', note: '' }] },
  { type: 'specComparison', headline: 'S', columns: [{ name: 'A' }, { name: 'B' }], rows: [{ label: 'Speed', values: '1 | 2' }] },
  { type: 'whereToBuy', headline: 'W', regions: [{ region: 'EU', href: '' }] },
  { type: 'downloadDatasheet', headline: 'D', files: [{ label: 'DS', url: 'https://example.com/ds.pdf' }] },
  { type: 'qvlCompatibility', headline: 'Q', ctaLabel: 'Check', ctaHref: '/compatibility' },
  { type: 'testimonial', headline: 'T', items: [{ quote: 'q', author: 'a', company: 'c', verified: 'yes' }] },
  { type: 'ctaBanner', title: 'CTA', tone: 'brand', ctaLabel: 'Go', ctaHref: '/go' },
  { type: 'faqAccordion', headline: 'FAQ', items: [{ q: 'Q?', a: 'A.' }] },
  { type: 'statsCounter', headline: 'St', items: [{ value: '93', unit: '+', label: 'Countries' }] },
  { type: 'timeline', headline: 'Tl', items: [{ date: '2026', title: 'M', desc: 'd' }] },
];

describe('Phase 2 §2.1: visual page-builder blocks round-trip', () => {
  it('creates a page with one of every block type and reads them back intact', async () => {
    const res = await app.request('/api/v1/admin/content/page', {
      method: 'POST', headers: H(),
      body: JSON.stringify({ title: 'Builder probe page', blocks: ALL_BLOCKS }),
    });
    expect(res.status).toBe(201);
    const page = await res.json();
    expect(page.blocks).toHaveLength(13);
    expect(page.blocks.map((b: { type: string }) => b.type)).toEqual(ALL_BLOCKS.map((b) => b.type));

    const got = await (await app.request(`/api/v1/admin/content/page/${page.id}`, { headers: H() })).json();
    expect(got.blocks).toHaveLength(13);
    expect(got.blocks[0].title).toBe('Hero');
    expect(got.blocks[9].tone).toBe('brand');
    expect(got.blocks[11].items[0].value).toBe('93');
  });

  it('PATCH replaces the block list (edit → save → verify)', async () => {
    const page = await (await app.request('/api/v1/admin/content/page', {
      method: 'POST', headers: H(), body: JSON.stringify({ title: 'Editable page', blocks: ALL_BLOCKS }),
    })).json();
    const next = [
      { type: 'statsCounter', items: [{ value: '25', unit: '+', label: 'Years' }] },
      { type: 'ctaBanner', title: 'Rebuilt', tone: 'dark', ctaLabel: 'Go', ctaHref: '/go' },
    ];
    const res = await app.request(`/api/v1/admin/content/page/${page.id}`, {
      method: 'PATCH', headers: H(), body: JSON.stringify({ blocks: next }),
    });
    expect(res.status).toBe(200);
    const got = await (await app.request(`/api/v1/admin/content/page/${page.id}`, { headers: H() })).json();
    expect(got.blocks).toEqual(next);
  });
});

describe('Phase 2 §2.3: editorial review workflow', () => {
  it('submit for review: draft → in_review, and the item lands in the ?status=in_review queue', async () => {
    const art = await (await app.request('/api/v1/admin/content/article', {
      method: 'POST', headers: H(), body: JSON.stringify({ title: 'Review probe article', body: 'draft body' }),
    })).json();
    const t = await app.request(`/api/v1/admin/content/article/${art.id}/transition`, {
      method: 'POST', headers: H(), body: JSON.stringify({ to: 'in_review' }),
    });
    expect(t.status).toBe(200);
    expect((await t.json()).status).toBe('in_review');

    const queue = await (await app.request('/api/v1/admin/content/article?status=in_review', { headers: H() })).json();
    expect(queue.items.some((x: { id: number }) => x.id === art.id)).toBe(true);
  });

  it('comments: POST (author+) creates with audit row; GET lists with author join; validation + RBAC enforced', async () => {
    const art = await (await app.request('/api/v1/admin/content/article', {
      method: 'POST', headers: H(), body: JSON.stringify({ title: 'Comment probe', body: 'b' }),
    })).json();

    // anonymous → 401 on both
    expect((await app.request(`/api/v1/admin/content/article/${art.id}/comments`)).status).toBe(401);
    expect((await app.request(`/api/v1/admin/content/article/${art.id}/comments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ body: 'x' }) })).status).toBe(401);

    // empty body → 422
    expect((await app.request(`/api/v1/admin/content/article/${art.id}/comments`, { method: 'POST', headers: H(), body: JSON.stringify({ body: '   ' }) })).status).toBe(422);

    const post = await app.request(`/api/v1/admin/content/article/${art.id}/comments`, {
      method: 'POST', headers: H(), body: JSON.stringify({ body: 'Please tighten the intro paragraph before publishing.' }),
    });
    expect(post.status).toBe(201);

    const list = await (await app.request(`/api/v1/admin/content/article/${art.id}/comments`, { headers: H() })).json();
    expect(list.items).toHaveLength(1);
    expect(list.items[0].body).toContain('tighten the intro');
    expect(list.items[0].authorEmail).toBe('p10@twinmos.dev');

    // audit row written for content.comment
    const audit = await (await app.request('/api/v1/admin/audit?entity=article&action=comment', { headers: H() })).json();
    expect(audit.items.some((a: { action: string; entityId: string }) => a.action === 'content.comment' && a.entityId === String(art.id))).toBe(true);
  });

  it('viewer role cannot post comments (403) but can read them', async () => {
    const art = await (await app.request('/api/v1/admin/content/article', {
      method: 'POST', headers: H(), body: JSON.stringify({ title: 'RBAC probe', body: 'b' }),
    })).json();
    // create a viewer account
    await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'p10-viewer@twinmos.dev', password: mkPass() + 'v', name: 'viewer' }),
    });
    const vres = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'p10-viewer@twinmos.dev', password: mkPass() + 'v' }),
    });
    const vcookie = vres.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');

    const read = await app.request(`/api/v1/admin/content/article/${art.id}/comments`, { headers: { cookie: vcookie } });
    expect(read.status).toBe(200);
    const write = await app.request(`/api/v1/admin/content/article/${art.id}/comments`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: vcookie }, body: JSON.stringify({ body: 'hi' }),
    });
    expect(write.status).toBe(403);
  });
});
