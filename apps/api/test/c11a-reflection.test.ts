// Test Suite for Milestone MS4.6 · T4.6.5 (Pass Gate C11a: G-REFLECT settings, menus, pages)
// 1. One test per settings group (8 groups)
// 2. One test per menu kind (3 kinds: header, drawer, footer)
// 3. One test per page template (7 templates: default, landing, full_width, legal, category, product_detail, support_portal)
//    including full lifecycle: draft -> published -> unpublish (draft) -> archive
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms46-c11a-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, setting, navMenu, navItem, page, outbox }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');
const { SETTINGS_GROUP_KEYS, SETTINGS_GROUP_DEFAULTS } = await import('@twinmos/shared');

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

await auth.api.signUpEmail({ body: { email: 'c11a-admin@twinmos.dev', password: 'C11a-Admin-Pass-2026!', name: 'C11a Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'c11a-admin@twinmos.dev'));

let adminCookie = '';
const ADMIN_HDRS = () => ({ 'content-type': 'application/json', cookie: adminCookie });

beforeAll(async () => {
  const r = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'c11a-admin@twinmos.dev', password: 'C11a-Admin-Pass-2026!' }),
  });
  adminCookie = r.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(adminCookie).toBeTruthy();
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

describe('C11a · Reflection Tests for Settings (8 Groups)', () => {
  const groupsToTest = [
    { key: 'site.brand', update: { name: 'TwinMOS HyperSpeed', tagline: 'Unleash Peak Performance' }, checkKey: 'name', checkVal: 'TwinMOS HyperSpeed' },
    { key: 'site.contact', update: { email: 'press@twinmos.com', phone: '+886 2 2659 9999' }, checkKey: 'email', checkVal: 'press@twinmos.com' },
    { key: 'site.social', update: { facebook: 'https://facebook.com/twinmos.hyper', x: 'https://x.com/twinmos_tech' }, checkKey: 'x', checkVal: 'https://x.com/twinmos_tech' },
    { key: 'site.cookie', update: { title: 'Privacy Shield Settings', essentialOnlyDefault: true }, checkKey: 'title', checkVal: 'Privacy Shield Settings' },
    { key: 'site.whatsapp', update: { phoneNumber: '886912345678', waUrl: 'https://wa.me/886912345678' }, checkKey: 'phoneNumber', checkVal: '886912345678' },
    { key: 'site.figures', update: { countriesCount: '100+', foundingYear: 1998, productCount: 42 }, checkKey: 'countriesCount', checkVal: '100+' },
    { key: 'seo.defaults', update: { defaultTitle: 'TwinMOS — Cutting Edge Tech', defaultRobots: 'index, follow' }, checkKey: 'defaultTitle', checkVal: 'TwinMOS — Cutting Edge Tech' },
    { key: 'integrations', update: { turnstileSiteKey: '0x4AAAAAAATestKey', analyticsEnabled: true }, checkKey: 'turnstileSiteKey', checkVal: '0x4AAAAAAATestKey' },
  ];

  for (const g of groupsToTest) {
    it(`reflects settings update for group: ${g.key}`, async () => {
      // 1. Update setting via admin PUT /api/v1/admin/settings/:key
      const currentDef = SETTINGS_GROUP_DEFAULTS[g.key as any] ?? {};
      const putRes = await app.request(`/api/v1/admin/settings/${g.key}`, {
        method: 'PUT',
        headers: ADMIN_HDRS(),
        body: JSON.stringify({ value: { ...currentDef, ...g.update } }),
      });
      expect(putRes.status).toBe(200);

      // 2. Fetch public Delivery API /api/v1/delivery/settings
      const dlvRes = await app.request('/api/v1/delivery/settings', { method: 'GET' });
      expect(dlvRes.status).toBe(200);
      const dlvJson = await dlvRes.json();

      expect(dlvJson.data[g.key]).toBeDefined();
      expect(dlvJson.data[g.key][g.checkKey]).toBe(g.checkVal);
    });
  }
});

describe('C11a · Reflection Tests for Menus (3 Kinds)', () => {
  const menuKinds = ['header', 'drawer', 'footer'] as const;

  for (const kind of menuKinds) {
    it(`reflects navigation menu items for kind: ${kind}`, async () => {
      // 1. Ensure navMenu exists in db for code and locale 'en'
      let [menu] = await db.select().from(navMenu).where(eq(navMenu.code, kind)).limit(1);
      if (!menu) {
        [menu] = await db.insert(navMenu).values({
          code: kind,
          locale: 'en',
          title: `${kind} Main Menu`,
        }).returning();
      }

      // 2. Insert item into menu
      await db.insert(navItem).values({
        menuId: menu.id,
        title: `Test Link ${kind}`,
        targetUrl: `/test-${kind}-link`,
        targetType: 'url',
        sort: 1,
      });

      // 3. Fetch public delivery for menu kind: /api/v1/delivery/menus/:kind
      const res = await app.request(`/api/v1/delivery/menus/${kind}?locale=en`, { method: 'GET' });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(json.data.code).toBe(kind);
      expect(json.data.items.some((it: any) => it.title === `Test Link ${kind}` && it.targetUrl === `/test-${kind}-link`)).toBe(true);
    });
  }
});

describe('C11a · Reflection Tests for Page Templates (7 Templates)', () => {
  const templates = [
    'default',
    'landing',
    'full_width',
    'legal',
    'category',
    'product_detail',
    'support_portal',
  ] as const;

  for (const template of templates) {
    describe(`Template: ${template}`, () => {
      const slug = `reflect-test-${template.replace(/_/g, '-')}-${Math.random().toString(36).slice(2, 6)}`;
      let pageId: number;

      it(`1. Create draft page with template "${template}" (Delivery returns 404)`, async () => {
        const createRes = await app.request('/api/v1/admin/content/page', {
          method: 'POST',
          headers: ADMIN_HDRS(),
          body: JSON.stringify({
            title: `Reflection Page for ${template}`,
            slug,
            path: `/${slug}`,
            template,
            blocks: [{ type: 'hero', title: `Hero for ${template}` }],
        }),
        });
        expect(createRes.status).toBe(201);
        const created = await createRes.json();
        pageId = created.id;
        expect(created.template).toBe(template);
        expect(created.status).toBe('draft');

        // Anonymous delivery must NOT see draft
        const dlvRes = await app.request(`/api/v1/delivery/pages/${slug}`, { method: 'GET' });
        expect(dlvRes.status).toBe(404);
      });

      it(`2. Publish page: Delivery immediately reflects 200 with template "${template}"`, async () => {
        const transRes = await app.request(`/api/v1/admin/content/page/${pageId}/transition`, {
          method: 'POST',
          headers: ADMIN_HDRS(),
          body: JSON.stringify({ to: 'published' }),
        });
        expect(transRes.status).toBe(200);

        // Anonymous delivery immediately returns 200
        const dlvRes = await app.request(`/api/v1/delivery/pages/${slug}`, { method: 'GET' });
        expect(dlvRes.status).toBe(200);
        const dlvJson = await dlvRes.json();
        expect(dlvJson.data.slug).toBe(slug);
        expect(dlvJson.data.template).toBe(template);
        expect(dlvJson.data.status).toBe('published');
        expect(dlvJson.data.blocks.length).toBeGreaterThan(0);
      });

      it(`3. Unpublish page (published -> draft): Delivery immediately removes page (returns 404)`, async () => {
        const transRes = await app.request(`/api/v1/admin/content/page/${pageId}/transition`, {
          method: 'POST',
          headers: ADMIN_HDRS(),
          body: JSON.stringify({ to: 'draft' }),
        });
        expect(transRes.status).toBe(200);

        // Anonymous delivery must NOT see unpublished page
        const dlvRes = await app.request(`/api/v1/delivery/pages/${slug}`, { method: 'GET' });
        expect(dlvRes.status).toBe(404);
      });

      it(`4. Re-publish then archive: Delivery removes page (returns 404)`, async () => {
        // Re-publish
        await app.request(`/api/v1/admin/content/page/${pageId}/transition`, {
          method: 'POST',
          headers: ADMIN_HDRS(),
          body: JSON.stringify({ to: 'published' }),
        });

        // Archive
        const archRes = await app.request(`/api/v1/admin/content/page/${pageId}/transition`, {
          method: 'POST',
          headers: ADMIN_HDRS(),
          body: JSON.stringify({ to: 'archived' }),
        });
        expect(archRes.status).toBe(200);

        // Anonymous delivery must NOT see archived page
        const dlvRes = await app.request(`/api/v1/delivery/pages/${slug}`, { method: 'GET' });
        expect(dlvRes.status).toBe(404);
      });
    });
  }
});
