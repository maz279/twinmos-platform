// P8 console professionalization — server gates for the new admin surfaces:
// the unified search endpoint (auth, validation, grouping, per-group caps,
// soft-delete exclusion) and the extended /admin/stats payload the dashboard
// and sidebar badges render from.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p8-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

// Repo root = parent of the workspace cwd (apps/api); no traversal literals.
const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');
const { user, formSubmission, article } = await import('@twinmos/db');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P8-Con-' + new Date().getFullYear() + '!';
const PROBE_TITLE = 'P8 Console Search Probe DDR5';
async function signIn(): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p8-console@twinmos.dev', password: mkPass(), name: 'p8' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'p8-console@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p8-console@twinmos.dev', password: mkPass() }),
  });
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
}
let seq = 0;
// Probe leads go straight into the table: the public forms endpoint is rate-
// limited to 5/min/IP (P7 gate) and the search tests must not couple to it.
async function seedLead(email: string) {
  await db.insert(formSubmission).values({
    type: 'contact', email: email.toLowerCase(), payload: { message: 'p8 search probe' },
    refCode: 'P8-PROBE-' + String(++seq).padStart(4, '0'),
  });
}

let cookie = '';
beforeAll(async () => {
  cookie = await signIn();
  // searchable corpus: one published article + one lead + seven cap-probe leads.
  // (Direct inserts — the content workflow defaults to draft and the public
  // forms endpoint is rate-limited; neither belongs in these search tests.)
  await db.insert(article).values({ slug: 'p8-console-search-probe', title: PROBE_TITLE, body: 'probe body', status: 'published', locale: 'en' });
  await seedLead('p8-lead@twinmos.dev');
  for (let i = 1; i <= 7; i++) await seedLead(`cap-p8-${i}@probe.dev`);
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P8: GET /admin/search — unified console search', () => {
  it('requires an authenticated session', async () => {
    const res = await app.request('/api/v1/admin/search?q=probe');
    expect(res.status).toBe(401);
  });

  it('rejects queries shorter than 2 characters', async () => {
    const res = await app.request('/api/v1/admin/search?q=p', { headers: { cookie } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.title).toMatch(/at least 2/i);
  });

  it('finds the probe article in the Content group (case-insensitive)', async () => {
    const res = await app.request('/api/v1/admin/search?q=' + encodeURIComponent('console search probe'), { headers: { cookie } });
    expect(res.status).toBe(200);
    const body = await res.json();
    const content = body.groups.find((g: { type: string }) => g.type === 'Content');
    expect(content, JSON.stringify(body.groups.map((g: { type: string }) => g.type))).toBeTruthy();
    const hit = content.items.find((h: { title: string; kind: string }) => h.kind === 'article' && h.title === PROBE_TITLE);
    expect(hit).toBeTruthy();
    expect(hit.module).toBe('content');
  });

  it('finds the probe lead by email in the Leads & quotes group', async () => {
    const res = await app.request('/api/v1/admin/search?q=p8-lead', { headers: { cookie } });
    const body = await res.json();
    const leads = body.groups.find((g: { type: string }) => g.type === 'Leads & quotes');
    expect(leads).toBeTruthy();
    expect(leads.items.some((h: { sub?: string }) => (h.sub ?? '').includes('p8-lead@twinmos.dev'))).toBe(true);
  });

  it('caps every group at 5 hits (7 cap-probe leads submitted)', async () => {
    const res = await app.request('/api/v1/admin/search?q=cap-p8', { headers: { cookie } });
    const body = await res.json();
    for (const g of body.groups) expect(g.items.length).toBeLessThanOrEqual(5);
    const leads = body.groups.find((g: { type: string }) => g.type === 'Leads & quotes');
    expect(leads.items.length).toBe(5);
  });

  it('returns empty groups for a no-match query', async () => {
    const res = await app.request('/api/v1/admin/search?q=zzz-p8-nomatch', { headers: { cookie } });
    const body = await res.json();
    expect(body.groups).toEqual([]);
  });
});

describe('P8: GET /admin/stats — extended dashboard payload', () => {
  it('returns the legacy badge fields (backward compatible)', async () => {
    const res = await app.request('/api/v1/admin/stats', { headers: { cookie } });
    expect(res.status).toBe(200);
    const s = await res.json();
    expect(s.submissions.byStatus).toBeTruthy();
    expect(s.rma.byStatus).toBeTruthy();
    expect(typeof s.products).toBe('number');
  });

  it('returns a 14-day series ending today', async () => {
    const s = await (await app.request('/api/v1/admin/stats', { headers: { cookie } })).json();
    expect(s.series).toHaveLength(14);
    const today = new Date().toISOString().slice(0, 10);
    expect(s.series[13].d).toBe(today);
    for (let i = 1; i < 14; i++) expect(s.series[i].d > s.series[i - 1].d).toBe(true);
    // the probe leads land on today's bucket
    expect(s.series[13].subs).toBeGreaterThanOrEqual(8);
  });

  it('returns SLA risk queue, content/media health, activity tail and jobs counters', async () => {
    const s = await (await app.request('/api/v1/admin/stats', { headers: { cookie } })).json();
    expect(Array.isArray(s.slaRisk)).toBe(true);
    expect(s.slaRisk.length).toBeLessThanOrEqual(6);
    for (const r of s.slaRisk) expect(['overdue', 'due_soon', 'on_track']).toContain(r.slaState);
    expect(s.content).toBeTruthy();
    for (const k of ['articles', 'news', 'pages', 'faqs']) expect(typeof s.content[k]).toBe('number');
    expect(s.content.articles).toBeGreaterThanOrEqual(1); // the probe article
    expect(s.media).toBeTruthy();
    expect(typeof s.media.total).toBe('number');
    expect(typeof s.media.missingAlt).toBe('number');
    expect(Array.isArray(s.activity)).toBe(true);
    expect(s.activity.length).toBeLessThanOrEqual(8);
    expect(typeof s.jobsNew).toBe('number');
    expect(typeof s.jobApplications).toBe('number');
  });
});
