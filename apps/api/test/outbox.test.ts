import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { eq, desc } from 'drizzle-orm';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-outbox-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-outbox-key-12345';

const MIGRATIONS = existsSync(join(process.cwd(), 'packages', 'db', 'migrations'))
  ? join(process.cwd(), 'packages', 'db', 'migrations')
  : join(process.cwd(), '..', '..', 'packages', 'db', 'migrations');

const { createDb, user, outbox, category, brand }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { recordOutboxEvent, dispatchOutbox } = await import('../src/services/outbox.ts');
const { promoteScheduled } = await import('../src/routes/content.ts');

describe('Task T3.5.3: Outbox rows for all content events', () => {
  let app: any;
  let db: any;
  let superCookie: string;
  let editorCookie: string;
  let catId: number;
  let brandId: number;

  beforeAll(async () => {
    db = createDb();
    await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(db, { migrationsFolder: MIGRATIONS });
    app = buildApp(db);

    // Register super_admin
    const superSignup = await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'super-outbox@twinmos.dev',
        password: 'Password123!@#',
        name: 'Super Outbox',
      }),
    });
    expect(superSignup.status).toBe(200);
    superCookie = (superSignup.headers.get('set-cookie') ?? '').split(';')[0];
    await db.update(user).set({ role: 'super_admin', emailVerified: true, twoFactorEnabled: true }).where(eq(user.email, 'super-outbox@twinmos.dev'));

    // Register editor
    const editorSignup = await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'editor-outbox@twinmos.dev',
        password: 'Password123!@#',
        name: 'Editor Outbox',
      }),
    });
    expect(editorSignup.status).toBe(200);
    editorCookie = (editorSignup.headers.get('set-cookie') ?? '').split(';')[0];
    await db.update(user).set({ role: 'editor', emailVerified: true, twoFactorEnabled: true }).where(eq(user.email, 'editor-outbox@twinmos.dev'));

    // Seed test category and brand for products
    const [insertedCat] = await db.insert(category).values({
      slug: 'outbox-cat',
      name: 'Outbox Category',
    }).returning();
    catId = insertedCat.id;

    const [insertedBrand] = await db.insert(brand).values({
      name: 'TwinMOS Outbox',
      slug: 'twinmos-outbox',
    }).returning();
    brandId = insertedBrand.id;
  }, 60_000);

  afterAll(() => {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {}
  });

  it('records outbox row for publish, unpublish, and archive transitions', async () => {
    // 1. Create article as draft
    const createRes = await app.request('/api/v1/admin/content/article', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({
        slug: 'outbox-test-article',
        title: 'Outbox Test Article',
        body: 'Hello world outbox test',
        locale: 'en',
        }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();

    // 2. Publish transition (draft -> published)
    const pubRes = await app.request(`/api/v1/admin/content/article/${created.id}/transition`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ to: 'published' }),
    });
    expect(pubRes.status).toBe(200);

    const pubRows = await db.select().from(outbox).where(eq(outbox.eventType, 'content.published')).orderBy(desc(outbox.id)).limit(1);
    expect(pubRows.length).toBe(1);
    expect(pubRows[0].payload.entityType).toBe('article');
    expect(pubRows[0].payload.tags).toContain('sitemap');

    // 3. Archive transition (published -> archived)
    const archRes = await app.request(`/api/v1/admin/content/article/${created.id}/transition`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ to: 'archived' }),
    });
    expect(archRes.status).toBe(200);

    const archRows = await db.select().from(outbox).where(eq(outbox.eventType, 'content.archived')).orderBy(desc(outbox.id)).limit(1);
    expect(archRows.length).toBe(1);

    // 4. Unpublish transition (archived -> draft)
    const unpubRes = await app.request(`/api/v1/admin/content/article/${created.id}/transition`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ to: 'draft' }),
    });
    expect(unpubRes.status).toBe(200);

    const unpubRows = await db.select().from(outbox).where(eq(outbox.eventType, 'content.draft')).orderBy(desc(outbox.id)).limit(1);
    expect(unpubRows.length).toBe(1);
  });

  it('records outbox row for content delete', async () => {
    // Create and delete a page
    const createRes = await app.request('/api/v1/admin/content/page', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({
        slug: 'page-to-delete',
        title: 'Page To Delete',
        locale: 'en',
        }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();

    const delRes = await app.request(`/api/v1/admin/content/page/${created.id}`, {
      method: 'DELETE',
      headers: { cookie: superCookie },
    });
    expect(delRes.status).toBe(200);

    const delRows = await db.select().from(outbox).where(eq(outbox.eventType, 'content.delete')).orderBy(desc(outbox.id)).limit(1);
    expect(delRows.length).toBe(1);
    expect(delRows[0].payload.entityType).toBe('page');
  });

  it('records outbox row for content revert', async () => {
    // 1. Create article and publish
    const createRes = await app.request('/api/v1/admin/content/article', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({
        slug: 'article-revert-test',
        title: 'Original Title',
        body: 'Body v1',
        locale: 'en',
        }),
    });
    const created = await createRes.json();

    await app.request(`/api/v1/admin/content/article/${created.id}/transition`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ to: 'published' }),
    });

    // 2. Edit article to create revision
    await app.request(`/api/v1/admin/content/article/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ title: 'Modified Title',
        }),
    });

    // 3. Get revisions
    const revsRes = await app.request(`/api/v1/admin/content/article/${created.id}/revisions`, {
      headers: { cookie: editorCookie },
    });
    const revs = await revsRes.json();
    expect(revs.items.length).toBeGreaterThan(0);

    // 4. Revert
    const revertRes = await app.request(`/api/v1/admin/content/article/${created.id}/revert`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ revisionId: revs.items[0].id }),
    });
    expect(revertRes.status).toBe(200);

    const revertRows = await db.select().from(outbox).where(eq(outbox.eventType, 'content.revert')).orderBy(desc(outbox.id)).limit(1);
    expect(revertRows.length).toBe(1);
    expect(revertRows[0].payload.entityType).toBe('article');
  });

  it('records outbox row for scheduled publish going live', async () => {
    // 1. Create article as draft
    const pastDate = new Date(Date.now() - 60_000).toISOString();
    const createRes = await app.request('/api/v1/admin/content/article', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({
        slug: 'scheduled-article-test',
        title: 'Scheduled Article',
        body: 'Scheduled body',
        locale: 'en',
        }),
    });
    const created = await createRes.json();

    // 2. Move to in_review first
    const reviewRes = await app.request(`/api/v1/admin/content/article/${created.id}/transition`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ to: 'in_review' }),
    });
    expect(reviewRes.status).toBe(200);

    // 3. Move to scheduled with publishAt in the past
    const schedRes = await app.request(`/api/v1/admin/content/article/${created.id}/transition`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ to: 'scheduled', publishAt: pastDate }),
    });
    expect(schedRes.status).toBe(200);

    // 4. Run promoteScheduled
    const count = await promoteScheduled(db, 'test-scheduler');
    expect(count).toBeGreaterThanOrEqual(1);

    const schedRows = await db.select().from(outbox).where(eq(outbox.eventType, 'content.scheduled_publish')).orderBy(desc(outbox.id)).limit(1);
    expect(schedRows.length).toBe(1);
    expect(schedRows[0].payload.entityType).toBe('article');
  });

  it('records outbox row for product changes', async () => {
    const res = await app.request('/api/v1/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({
        sku: 'TM-OUTBOX-1',
        slug: 'tm-outbox-1',
        name: 'Outbox RAM Module',
        brandId,
        categoryId: catId,
        status: 'published',
        }),
    });
    expect(res.status).toBe(201);

    const prodRows = await db.select().from(outbox).where(eq(outbox.eventType, 'product.create')).orderBy(desc(outbox.id)).limit(1);
    expect(prodRows.length).toBe(1);
    expect(prodRows[0].payload.entityType).toBe('product');
    expect(prodRows[0].payload.tags).toContain('catalog');
  });

  it('records outbox row for settings, menus, and redirect changes', async () => {
    // 1. Settings update
    const setRes = await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ key: 'site_notice', value: { text: 'Maintenance Notice' } }),
    });
    expect(setRes.status).toBe(200);

    const setRows = await db.select().from(outbox).where(eq(outbox.eventType, 'settings.update')).orderBy(desc(outbox.id)).limit(1);
    expect(setRows.length).toBe(1);
    expect(setRows[0].payload.tags).toContain('settings');

    // 2. Menu update
    const menuRes = await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ key: 'menus', value: [{ label: 'Gaming', path: '/gaming' }] }),
    });
    expect(menuRes.status).toBe(200);

    const menuRows = await db.select().from(outbox).where(eq(outbox.eventType, 'menu.update')).orderBy(desc(outbox.id)).limit(1);
    expect(menuRows.length).toBe(1);
    expect(menuRows[0].payload.tags).toContain('menus');

    // 3. Redirect creation
    const redirRes = await app.request('/api/v1/admin/redirects', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ from: '/old-path-outbox', to: '/new-path-outbox', code: 301 }),
    });
    expect(redirRes.status).toBe(201);

    const redirRows = await db.select().from(outbox).where(eq(outbox.eventType, 'redirect.create')).orderBy(desc(outbox.id)).limit(1);
    expect(redirRows.length).toBe(1);
    expect(redirRows[0].payload.tags).toContain('redirects');
  });

  it('T3.5.4: enforces INTERNAL_WEB_URL in production', async () => {
    const oldEnv = process.env.NODE_ENV;
    const oldUrl = process.env.INTERNAL_WEB_URL;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.INTERNAL_WEB_URL;
      await expect(dispatchOutbox(db)).rejects.toThrow(/INTERNAL_WEB_URL/);
    } finally {
      process.env.NODE_ENV = oldEnv;
      if (oldUrl) process.env.INTERNAL_WEB_URL = oldUrl;
    }
  });
});
