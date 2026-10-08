// P3 — CMS Completeness Bridges regression gates (REMEDIATION_PLAN
// TM-REM-2026-001). 3.1: the bridge carries published EN FAQs. 3.5: the
// bridge carries the canonical offices list. Both asserted against the export
// endpoint's written file (CONTENT_OUT-isolated). Sitemap deep-URL generation
// is covered by the gen_sitemap.py run in the CLI (validated live).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p3-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';
// Tree-shaped so the dual-write mirror path (<base>/public/assets/js →
// <base>/dist/assets/js) stays inside this TMP — flat layouts place the
// mirror outside TMP where existsSync() correctly skips it.
process.env.CONTENT_OUT = join(TMP, 'public', 'assets', 'js', 'cms-content.js');
import { mkdirSync } from 'node:fs';
mkdirSync(join(TMP, 'dist'), { recursive: true });

const { createDb, user, faq, newsPost }: any = await import('@twinmos/db');
const { buildApp } = await import('../src/app.ts');

let db: any;
let app: any;
let auth: any;
const pw = 'T3-' + crypto.randomUUID().replaceAll('-', '').slice(0, 16) + '!D5';

beforeAll(async () => {
  db = createDb();
  await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
  const { initAuth } = await import('../src/auth.ts');
  ({ auth } = initAuth(db));
  app = buildApp(db);
  await auth.api.createUser({ body: { email: 'p3-editor@twinmos.dev', password: pw, name: 'P3', role: 'editor' } });
  // fixtures: a published EN faq, a draft faq (must be excluded), a non-EN faq
  await db.insert(faq).values([
    { groupKey: '07-support', locale: 'en', question: 'P3 published question?', answer: 'Bridge answer.', sort: 1, status: 'published' },
    { groupKey: '07-support', locale: 'en', question: 'P3 draft question?', answer: 'Hidden.', sort: 2, status: 'draft' },
    { groupKey: '07-support', locale: 'ar', question: 'P3 localized question?', answer: 'AR-only.', sort: 3, status: 'published' },
  ]);
  await db.insert(newsPost).values({ slug: 'p3-news-probe', title: 'P3 News Probe', body: 'Body.', status: 'published' });
});

afterAll(async () => {
  const { releaseDataDirLock } = await import('@twinmos/db');
  releaseDataDirLock(process.env.PGLITE_DATA as string);
  rmSync(TMP, { recursive: true, force: true });
});

async function editorCookie() {
  const origin = 'http://localhost:5173';
  const r = await auth.handler(new Request(origin + '/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ email: 'p3-editor@twinmos.dev', password: pw }),
  }));
  if (r.status !== 200) throw new Error('fixture sign-in failed');
  return (r.headers.get('set-cookie') ?? '').split(',').map((c) => c.split(';')[0]).join('; ');
}

describe('P3 bridges: faqs + offices in the exported bundle', () => {
  it('carries published EN FAQs and excludes draft/non-EN rows', async () => {
    const ck = await editorCookie();
    const res = await app.request('/api/v1/admin/content/export', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck }, body: '{}',
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.counts.faqs).toBe(1);
    const text = readFileSync(body.out, 'utf8');
    expect(text).toContain('P3 published question?');
    expect(text).not.toContain('P3 draft question?');
    expect(text).not.toContain('P3 localized question?');
  });

  it('carries the canonical offices list for the page-sync pass', async () => {
    const ck = await editorCookie();
    const res = await app.request('/api/v1/admin/content/export', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck }, body: '{}',
    });
    const { out } = await res.json();
    const box: any = {};
    new Function('window', readFileSync(out, 'utf8'))(box);
    const offices = box.CMS_CONTENT.offices;
    expect(Array.isArray(offices)).toBe(true);
    expect(offices.length).toBe(5);
    expect(offices[0]).toMatchObject({ role: 'Taiwan', entity: 'TwinMOS Technologies Ltd.' });
    expect(String(offices[4].address)).toContain('San Jose');
  });

  it('publishes news through the workflow so the home strip has data', async () => {
    const ck = await editorCookie();
    const res = await app.request('/api/v1/admin/content/export', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck }, body: '{}',
    });
    const { counts } = await res.json();
    expect(counts.news).toBeGreaterThanOrEqual(1);
  });

  it('dual-writes the bridge into the dist tree (production-audit fix)', async () => {
    // The dist mirror is derived from the out path (js → assets → public →
    // dist). With the old two-hop resolve it pointed at public/dist, which
    // never exists — the existsSync guard silently skipped the dual-write and
    // the built site kept serving stale bridge content (2026-10-08 audit).
    const ck = await editorCookie();
    const res = await app.request('/api/v1/admin/content/export', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck }, body: '{}',
    });
    expect(res.status).toBe(200);
    const { out } = await res.json();
    const mirror = join(TMP, 'dist', 'assets', 'js', 'cms-content.js');
    expect(readFileSync(mirror, 'utf8')).toBe(readFileSync(out, 'utf8'));
    expect(readFileSync(mirror, 'utf8')).toContain('P3 published question?');
  });
});
