// Test Suite for Milestone MS4.6 · Editorial workflow, pages module and first reflection tests
// Covers T4.6.1, T4.6.2, T4.6.3 (WF-01, Z-30, ADMIN-EDIT preview)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms46-wf-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, page, article, faq, newsPost, contentRevision, outbox, auditLog }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { promoteScheduled }: any = await import('../src/routes/content.ts');
const { eq, and, desc } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const { betterAuth } = await import('better-auth');
const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
import * as schema from '@twinmos/db';

const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});

// Create test accounts: author1, author2, editor, admin
await auth.api.signUpEmail({ body: { email: 'author1@twinmos.dev', password: 'Author1-Password-2026!', name: 'Author One' } });
await db.update(schema.user).set({ role: 'author' }).where(eq(schema.user.email, 'author1@twinmos.dev'));

await auth.api.signUpEmail({ body: { email: 'author2@twinmos.dev', password: 'Author2-Password-2026!', name: 'Author Two' } });
await db.update(schema.user).set({ role: 'author' }).where(eq(schema.user.email, 'author2@twinmos.dev'));

await auth.api.signUpEmail({ body: { email: 'editor@twinmos.dev', password: 'Editor-Password-2026!', name: 'Editor Staff' } });
await db.update(schema.user).set({ role: 'editor' }).where(eq(schema.user.email, 'editor@twinmos.dev'));

await auth.api.signUpEmail({ body: { email: 'admin@twinmos.dev', password: 'Admin-Password-2026!', name: 'Admin Staff' } });
await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.email, 'admin@twinmos.dev'));

let author1Cookie = '';
let author2Cookie = '';
let editorCookie = '';
let adminCookie = '';

const AUTH1_HDRS = () => ({ 'content-type': 'application/json', cookie: author1Cookie });
const AUTH2_HDRS = () => ({ 'content-type': 'application/json', cookie: author2Cookie });
const EDITOR_HDRS = () => ({ 'content-type': 'application/json', cookie: editorCookie });
const ADMIN_HDRS = () => ({ 'content-type': 'application/json', cookie: adminCookie });

beforeAll(async () => {
  const r1 = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'author1@twinmos.dev', password: 'Author1-Password-2026!' }),
  });
  author1Cookie = r1.headers.get('set-cookie')?.split(';')[0] ?? '';

  const r2 = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'author2@twinmos.dev', password: 'Author2-Password-2026!' }),
  });
  author2Cookie = r2.headers.get('set-cookie')?.split(';')[0] ?? '';

  const r3 = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'editor@twinmos.dev', password: 'Editor-Password-2026!' }),
  });
  editorCookie = r3.headers.get('set-cookie')?.split(';')[0] ?? '';

  const r4 = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@twinmos.dev', password: 'Admin-Password-2026!' }),
  });
  adminCookie = r4.headers.get('set-cookie')?.split(';')[0] ?? '';
});

afterAll(async () => {
  try {
    const client = (db as any).$client;
    if (client && typeof client.close === 'function') await client.close();
  } catch {}
  try {
    rmSync(TMP, { recursive: true, force: true });
  } catch {}
});

describe('T4.6.1 · Status changes only through transitions (Z-30)', () => {
  let articleId: number;

  it('1. Author creates a draft article', async () => {
    const res = await app.request('/api/v1/admin/content/article', {
      method: 'POST',
      headers: AUTH1_HDRS(),
      body: JSON.stringify({
        title: 'Author 1 First Post',
        slug: 'author-1-first-post',
        deck: 'Test article summary',
        body: '# Content here\n\nArticle body paragraph.',
        category: 'Guides',
        tags: ['memory', 'ddr5'],
        }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.status).toBe('draft');
    articleId = json.id;
  });

  it('2. Status CANNOT be modified directly via PATCH (returns 422)', async () => {
    const res = await app.request(`/api/v1/admin/content/article/${articleId}`, {
      method: 'PATCH',
      headers: AUTH1_HDRS(),
      body: JSON.stringify({
        title: 'Attempting Direct Publish',
        status: 'published',
        }),
    });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.title).toBe('Status transition required');
  });

  it('3. Author cannot directly transition to published or archived (returns 403)', async () => {
    const resPub = await app.request(`/api/v1/admin/content/article/${articleId}/transition`, {
      method: 'POST',
      headers: AUTH1_HDRS(),
      body: JSON.stringify({ to: 'published' }),
    });
    expect(resPub.status).toBe(403);

    const resArch = await app.request(`/api/v1/admin/content/article/${articleId}/transition`, {
      method: 'POST',
      headers: AUTH1_HDRS(),
      body: JSON.stringify({ to: 'archived' }),
    });
    expect(resArch.status).toBe(403);
  });

  it('4. Author cannot transition other authors content (ownership check returns 403)', async () => {
    // Author 2 attempts to transition Author 1's article to in_review
    const res = await app.request(`/api/v1/admin/content/article/${articleId}/transition`, {
      method: 'POST',
      headers: AUTH2_HDRS(),
      body: JSON.stringify({ to: 'in_review' }),
    });
    expect(res.status).toBe(403);
  });

  it('5. Author can submit their own draft to in_review, and revision is created', async () => {
    const res = await app.request(`/api/v1/admin/content/article/${articleId}/transition`, {
      method: 'POST',
      headers: AUTH1_HDRS(),
      body: JSON.stringify({ to: 'in_review' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('in_review');

    // Verify revision was created on transition
    const revs = await db.select().from(contentRevision).where(eq(contentRevision.entityId, articleId));
    expect(revs.length).toBeGreaterThanOrEqual(1);
  });

  it('6. Editor can publish the in_review article, creating another revision snapshot', async () => {
    const res = await app.request(`/api/v1/admin/content/article/${articleId}/transition`, {
      method: 'POST',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({ to: 'published' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('published');

    const revs = await db.select().from(contentRevision).where(eq(contentRevision.entityId, articleId));
    expect(revs.length).toBeGreaterThanOrEqual(2);
  });

  it('7. Editor can unpublish (published -> draft)', async () => {
    const res = await app.request(`/api/v1/admin/content/article/${articleId}/transition`, {
      method: 'POST',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({ to: 'draft' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('draft');
  });

  it('8. Editor can archive (draft -> archived or published -> archived)', async () => {
    const res = await app.request(`/api/v1/admin/content/article/${articleId}/transition`, {
      method: 'POST',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({ to: 'archived' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('archived');
  });
});

describe('T4.6.2 · Scheduling that fires & outbox integration (Z-30)', () => {
  it('1. Scheduled page publish fires and writes outbox event', async () => {
    // Create a scheduled page with publishAt in the past
    const pastDate = new Date(Date.now() - 10_000);
    const [createdPage] = await db.insert(page).values({
      slug: 'scheduled-test-page',
      title: 'Scheduled Launch Page',
      blocks: [{ type: 'hero', title: 'Launch Hero' }],
      status: 'scheduled',
      publishAt: pastDate,
      locale: 'en',
    }).returning();

    expect(createdPage.status).toBe('scheduled');

    // Run promoteScheduled sweep
    const promoted = await promoteScheduled(db, 'test_runner');
    expect(promoted).toBeGreaterThanOrEqual(1);

    // Verify page is now published
    const [refreshed] = await db.select().from(page).where(eq(page.id, createdPage.id));
    expect(refreshed.status).toBe('published');

    // Verify outbox row written
    const outboxRows = await db.select().from(outbox).where(eq(outbox.eventType, 'content.scheduled_publish'));
    expect(outboxRows.length).toBeGreaterThanOrEqual(1);
  });

  it('2. Scheduled page unpublish fires and transitions to draft', async () => {
    // Create a published page with unpublishAt in the past
    const pastDate = new Date(Date.now() - 5_000);
    const [createdPage] = await db.insert(page).values({
      slug: 'scheduled-unpublish-page',
      title: 'Temporary Flash Promo Page',
      blocks: [{ type: 'hero', title: 'Flash Promo' }],
      status: 'published',
      unpublishAt: pastDate,
      locale: 'en',
    }).returning();

    expect(createdPage.status).toBe('published');

    // Run promoteScheduled sweep
    const promoted = await promoteScheduled(db, 'test_unpublish');
    expect(promoted).toBeGreaterThanOrEqual(1);

    // Verify page transitioned to draft
    const [refreshed] = await db.select().from(page).where(eq(page.id, createdPage.id));
    expect(refreshed.status).toBe('draft');

    // Verify outbox row written
    const outboxRows = await db.select().from(outbox).where(eq(outbox.eventType, 'content.scheduled_unpublish'));
    expect(outboxRows.length).toBeGreaterThanOrEqual(1);
  });
});

describe('T4.6.3 · Concurrency without false conflicts & revisions restore (WF-01)', () => {
  let pageId: number;
  let initialUpdatedAt: string;

  beforeAll(async () => {
    const res = await app.request('/api/v1/admin/content/page', {
      method: 'POST',
      headers: ADMIN_HDRS(),
      body: JSON.stringify({
        title: 'Concurrency Benchmark Page',
        slug: 'concurrency-benchmark-page',
        path: '/concurrency-test',
        blocks: [],
        }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    pageId = json.id;
    initialUpdatedAt = json.updatedAt;
  });

  it('1. First save succeeds and returns updated timestamp and version', async () => {
    // Wait slightly so timestamp advances
    await new Promise((r) => setTimeout(r, 20));
    const res = await app.request(`/api/v1/admin/content/page/${pageId}`, {
      method: 'PATCH',
      headers: { ...ADMIN_HDRS(), 'if-match': initialUpdatedAt },
      body: JSON.stringify({
        title: 'Concurrency Benchmark Page — Edit 1',
        blocks: [{ type: 'hero', title: 'First edit hero title' }],
        }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe('Concurrency Benchmark Page — Edit 1');
    expect(json.version).toBe(2);
    // Updated timestamp is newer
    expect(new Date(json.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(initialUpdatedAt).getTime());

    // 2. Immediate second save with refreshed updatedAt succeeds (NO false 409!)
    await new Promise((r) => setTimeout(r, 20));
    const secondRes = await app.request(`/api/v1/admin/content/page/${pageId}`, {
      method: 'PATCH',
      headers: { ...ADMIN_HDRS(), 'if-match': json.updatedAt },
      body: JSON.stringify({
        title: 'Concurrency Benchmark Page — Edit 2',
        blocks: [{ type: 'hero', title: 'Second edit immediately' }],
        }),
    });
    expect(secondRes.status).toBe(200);
    const secondJson = await secondRes.json();
    expect(secondJson.title).toBe('Concurrency Benchmark Page — Edit 2');
    expect(secondJson.version).toBe(3);
  });

  it('3. Save with stale copy (old If-Match) triggers true 409 Conflict', async () => {
    const res = await app.request(`/api/v1/admin/content/page/${pageId}`, {
      method: 'PATCH',
      headers: { ...ADMIN_HDRS(), 'if-match': initialUpdatedAt }, // Stale!
      body: JSON.stringify({
        title: 'Stale Overwrite Attempt',
        }),
    });
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.title).toBe('Conflict');
  });

  it('4. Revision compare and restore', async () => {
    const [adminUser] = await db.select().from(schema.user).where(eq(schema.user.email, 'admin@twinmos.dev'));

    // Snapshot current state in contentRevision
    const [rev] = await db.insert(contentRevision).values({
      entity: 'page',
      entityId: pageId,
      snapshot: {
        title: 'Snapshot Version For Restore',
        blocks: [{ type: 'hero', title: 'Restored Hero' }],
      },
      actorId: adminUser.id,
    }).returning();

    // Call restore endpoint
    const restoreRes = await app.request(`/api/v1/admin/content/page/${pageId}/restore/${rev.id}`, {
      method: 'POST',
      headers: ADMIN_HDRS(),
    });
    expect(restoreRes.status).toBe(200);
    const restoredJson = await restoreRes.json();
    expect(restoredJson.title).toBe('Snapshot Version For Restore');
    expect(restoredJson.status).toBe('published');

    // Call diff endpoint
    const diffRes = await app.request(`/api/v1/admin/content/page/${pageId}/revisions/${rev.id}/diff`, {
      method: 'GET',
      headers: ADMIN_HDRS(),
    });
    expect(diffRes.status).toBe(200);
    const diffJson = await diffRes.json();
    expect(diffJson.revision.title).toBe('Snapshot Version For Restore');
  });
});

describe('T4.6.4 · Pages module & signed HMAC preview URL', () => {
  it('1. POST /content/page/:id/preview returns signed HMAC public URL', async () => {
    const [createdPage] = await db.insert(page).values({
      slug: 'preview-secret-page',
      path: '/preview-test',
      title: 'Secret Preview Page',
      blocks: [{ type: 'hero', title: 'Draft Preview' }],
      status: 'draft',
      locale: 'en',
    }).returning();

    const res = await app.request(`/api/v1/admin/content/page/${createdPage.id}/preview`, {
      method: 'POST',
      headers: ADMIN_HDRS(),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.previewUrl).toContain('/preview-test?preview=');
    expect(json.token).toBeTruthy();
  });
});
