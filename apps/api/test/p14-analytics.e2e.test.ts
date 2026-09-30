// Phase 7 (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §7.1) — analytics endpoint gates:
// RBAC, lead funnel cumulative math, SLA bucketing, RMA status/category
// aggregation + resolution time, content velocity windows + translation
// coverage shape.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p14-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, user, brand, category, product, formSubmission, rmaRequest, article, translation }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P14-Ana-' + new Date().getFullYear() + '!';
let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p14@twinmos.dev', password: mkPass(), name: 'p14' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'p14@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p14@twinmos.dev', password: mkPass() }),
  });
  cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
});
afterAll(async () => { await db.$client.close(); rmSync(TMP, { recursive: true, force: true }); });

describe('P7.1: analytics RBAC', () => {
  it('all three endpoints reject anonymous callers', async () => {
    for (const p of ['/analytics/leads', '/analytics/rma', '/analytics/content']) {
      expect((await app.request('/api/v1/admin' + p)).status).toBe(401);
    }
  });
});

describe('P7.1: leads funnel + SLA gauge', () => {
  it('funnel counts are cumulative and spam is excluded', async () => {
    // 2 new, 1 assigned, 1 resolved, 1 spam + an OVERDUE open lead (due yesterday)
    const yesterday = new Date(Date.now() - 86400_000);
    const rows = [
      { type: 'quote', email: 'a@x.test', status: 'new', priority: 'high', dueAt: yesterday },
      { type: 'quote', email: 'b@x.test', status: 'new', priority: 'normal', dueAt: new Date(Date.now() + 7200_000) },
      { type: 'support-ticket', email: 'c@x.test', status: 'assigned', priority: 'urgent', dueAt: new Date(Date.now() + 7200_000) },
      { type: 'support-ticket', email: 'd@x.test', status: 'resolved', priority: 'low', dueAt: null },
      { type: 'support-ticket', email: 'e@x.test', status: 'spam', priority: 'normal', dueAt: null },
    ];
    for (let i = 0; i < rows.length; i++) {
      await db.insert(formSubmission).values({
        refCode: 'AN-' + String(i).padStart(4, '0'), payload: {}, createdAt: new Date(Date.now() - i * 3600_000),
        ...rows[i],
      });
    }
    const res = await app.request('/api/v1/admin/analytics/leads', { headers: { cookie } });
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.total).toBe(5);
    expect(d.spam).toBe(1);
    const f = Object.fromEntries(d.funnel.map((x: any) => [x.stage, x.count]));
    expect(f.new).toBe(4);          // 2 new + 1 assigned + 1 resolved (spam excluded)
    expect(f.assigned).toBe(2);     // 1 assigned + 1 resolved
    expect(f.in_progress).toBe(1);  // resolved passed through
    expect(f.resolved).toBe(1);
    expect(f.closed).toBe(0);
    // SLA gauge: 3 open leads — one overdue, two due within 4h (due_soon)
    expect(d.sla.open).toBe(3);
    expect(d.sla.overdue).toBe(1);
    expect(d.sla.dueSoon).toBe(2);
    expect(d.sla.onTrack).toBe(0);
    expect(d.sla.avgAgeDays).toBeGreaterThanOrEqual(0);
    expect(d.series).toHaveLength(14); // dense series with zero-fill
    expect(d.byType.some((x: any) => x.type === 'quote' && x.n === 2)).toBe(true);
  });
});

describe('P7.1: RMA distribution + reasons + resolution', () => {
  it('aggregates status counts, joins SKU→category and averages closed resolution', async () => {
    // taxonomy + products in two categories so the reason join is meaningful
    await db.insert(brand).values({ slug: 'voltx', name: 'VOLTX' });
    const [catA] = await db.insert(category).values({ slug: 'dram', name: 'DRAM' }).returning();
    const [catB] = await db.insert(category).values({ slug: 'ssd', name: 'SSD' }).returning();
    const [pA] = await db.insert(product).values({ sku: 'AN-RAM-1', slug: 'an-ram-1', name: 'RAM mod', brandId: 1, categoryId: catA.id, status: 'draft' }).returning();
    const [pB] = await db.insert(product).values({ sku: 'AN-SSD-1', slug: 'an-ssd-1', name: 'SSD drv', brandId: 1, categoryId: catB.id, status: 'draft' }).returning();
    void pA; void pB;

    const base = Date.now();
    await db.insert(rmaRequest).values([
      { number: 'RMA-A1', productSku: 'AN-RAM-1', issue: 'dead module', status: 'submitted', customer: {}, createdAt: new Date(base - 10 * 86400_000), updatedAt: new Date(base - 10 * 86400_000) },
      { number: 'RMA-A2', productSku: 'AN-RAM-1', issue: 'boot failure', status: 'under_review', customer: {}, createdAt: new Date(base - 5 * 86400_000), updatedAt: new Date(base - 5 * 86400_000) },
      { number: 'RMA-B1', productSku: 'AN-SSD-1', issue: 'not detected', status: 'closed', customer: {}, createdAt: new Date(base - 10 * 86400_000), updatedAt: new Date(base - 3 * 86400_000) }, // 7 days to resolve
      { number: 'RMA-B2', productSku: 'UNKNOWN-SKU', issue: 'x', status: 'delivered', customer: {}, createdAt: new Date(base - 2 * 86400_000), updatedAt: new Date(base - 86400_000) },
    ]);

    const res = await app.request('/api/v1/admin/analytics/rma', { headers: { cookie } });
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.total).toBe(4);
    expect(d.open).toBe(2); // submitted + under_review (delivered and closed are terminal-ish)
    const st = Object.fromEntries(d.byStatus.map((x: any) => [x.status, x.n]));
    expect(st.submitted).toBe(1);
    expect(st.closed).toBe(1);
    const reasons = Object.fromEntries(d.reasons.map((x: any) => [x.category, x.n]));
    expect(reasons['DRAM']).toBe(2);
    expect(reasons['SSD']).toBe(1);
    expect(reasons['Uncategorized']).toBe(1); // UNKNOWN-SKU has no product row
    expect(d.avgResolutionDays).toBe(7); // the one closed case
    expect(d.trend).toHaveLength(6);
  });
});

describe('P7.1: content velocity + translation coverage', () => {
  it('buckets published items into trailing weekly buckets and reports key-exact coverage', async () => {
    // one article published NOW (this ISO week), one 20 days ago (an older
    // bucket), plus a draft (excluded) — NOW keeps the bucket assignment
    // deterministic regardless of today's weekday.
    await db.insert(article).values([
      { slug: 'an-week-now', title: 'now', status: 'published', publishAt: new Date() },
      { slug: 'an-week-old', title: 'old', status: 'published', publishAt: new Date(Date.now() - 20 * 86400_000) },
      { slug: 'an-draft', title: 'draft', status: 'draft', publishAt: null },
    ]);
    // EN keys + one AR translation of only the first key
    for (const [key, value] of [['hero.title', 'Memory'], ['hero.sub', 'Scale']] as const) {
      await app.request('/api/v1/admin/translations', {
        method: 'PUT', headers: HDRS(), body: JSON.stringify({ locale: 'en', ns: 'home', key, value }),
      });
    }
    await app.request('/api/v1/admin/translations', {
      method: 'PUT', headers: HDRS(), body: JSON.stringify({ locale: 'ar', ns: 'home', key: 'hero.title', value: 'ذاكرة' }),
    });

    const res = await app.request('/api/v1/admin/analytics/content', { headers: { cookie } });
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.weeks).toHaveLength(12);
    const articles = d.velocity.reduce((s: number, w: any) => s + w.article, 0);
    expect(articles).toBe(2); // exactly the two published ones
    const lastBucket = d.velocity[d.velocity.length - 1];
    expect(lastBucket.article).toBe(1); // the 3-day-old one lands in the current week
    const pipelineArt = d.pipeline.find((p: any) => p.entity === 'article');
    expect(pipelineArt.byStatus['published']).toBe(2);
    expect(pipelineArt.byStatus['draft']).toBe(1);
    // key-exact coverage: ar = 1/2 EN keys in home ns → 50%
    expect(d.translationCoverage.namespaces).toContain('home');
    expect(d.translationCoverage.coverage.ar.home).toBe(50);
    expect(d.translationCoverage.coverage.en.home).toBe(100);
  });
});
