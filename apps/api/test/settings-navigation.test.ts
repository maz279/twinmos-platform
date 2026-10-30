// Test Suite for Milestone MS4.2 · Site settings and navigation (T4.2.1–T4.2.4 / GREF-C)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms42-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, setting, navMenu, navItem, outbox, brand, category, product, article }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq, and, desc } = await import('drizzle-orm');
const { importPrototypeMenus }: any = await import('../scripts/import-prototype-menus.ts');
const shared: any = await import('@twinmos/shared');
const SETTINGS_GROUP_DEFAULTS = shared.SETTINGS_GROUP_DEFAULTS as Record<string, Record<string, unknown>>;
const SETTINGS_GROUP_KEYS = shared.SETTINGS_GROUP_KEYS as string[];

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

await auth.api.signUpEmail({ body: { email: 'ms42@twinmos.dev', password: 'MS42-Password-2026!', name: 'MS42 Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'ms42@twinmos.dev'));
await auth.api.signUpEmail({ body: { email: 'ms42-editor@twinmos.dev', password: 'MS42-Editor-2026!', name: 'MS42 Editor' } });
await db.update(schema.user).set({ role: 'editor' }).where(eq(schema.user.email, 'ms42-editor@twinmos.dev'));

let cookie = '';
let editorCookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });
const EDITOR_HDRS = () => ({ 'content-type': 'application/json', cookie: editorCookie });

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ms42@twinmos.dev', password: 'MS42-Password-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();

  const editorRes = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ms42-editor@twinmos.dev', password: 'MS42-Editor-2026!' }),
  });
  editorCookie = editorRes.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(editorCookie).toBeTruthy();
});

afterAll(() => {
  try {
    rmSync(TMP, { recursive: true, force: true });
  } catch {}
});

const GROUP_FIXTURES: Record<string, Record<string, unknown>> = {
  'site.brand': {
    name: 'TwinMOS Test Brand',
    tagline: 'Test tagline for G-REFLECT',
    logoUrl: '/assets/img/logo.webp',
    faviconUrl: '/favicon.ico',
    foundingYear: 2001,
  },
  'site.contact': {
    email: 'hello@twinmos.dev',
    supportEmail: 'help@twinmos.dev',
    salesEmail: 'sales2@twinmos.dev',
    phone: '+886 2 1234 5678',
    address: 'Test address, Taipei',
    country: 'Taiwan',
  },
  'site.social': {
    facebook: 'https://example.com/fb',
    instagram: 'https://example.com/ig',
    linkedin: 'https://example.com/li',
    x: 'https://example.com/x',
    youtube: 'https://example.com/yt',
    pinterest: 'https://example.com/pin',
  },
  'site.cookie': {
    title: 'Test Cookie Title',
    description: 'Test cookie description.',
    policyUrl: '/legal.html#cookies',
    essentialOnlyDefault: true,
  },
  'site.whatsapp': {
    phoneNumber: '886226590999',
    waUrl: 'https://wa.me/886226590999',
    defaultMessage: 'Hello TwinMOS',
  },
  'site.figures': { countriesCount: '97+', foundingYear: 2003, productCount: 41 },
  'seo.defaults': {
    titleTemplate: '%s | Test',
    defaultTitle: 'Test Title',
    defaultDescription: 'Test description',
    defaultOgImage: '/assets/img/og-cover.png',
    defaultRobots: 'index, follow',
  },
  integrations: {
    turnstileSiteKey: '0xTESTMS42KEY',
    analyticsEnabled: true,
    googleAnalyticsId: 'G-TESTMS42',
  },
};

describe('MS4.2 · T4.2.1 Typed Settings Groups & Delivery', () => {
  it('delivers all 8 typed groups with default values and site cache tag', async () => {
    const res = await app.request('/api/v1/delivery/settings');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-tag')).toContain('site');

    const json = await res.json();
    const keys = Object.keys(json.data);
    expect(keys).toContain('site.brand');
    expect(keys).toContain('site.contact');
    expect(keys).toContain('site.social');
    expect(keys).toContain('site.cookie');
    expect(keys).toContain('site.whatsapp');
    expect(keys).toContain('site.figures');
    expect(keys).toContain('seo.defaults');
    expect(keys).toContain('integrations');

    // site.figures dynamic computation
    const fig = json.data['site.figures'];
    expect(fig.foundingYear).toBe(1998);
    expect(fig.productCount).toBe(39); // the 39 products itemised in twinmos_mirror/authoritative_facts.md
    expect(fig.countriesCount).toBe('93+');
    const currentYear = new Date().getFullYear();
    expect(fig.years).toBe(currentYear - 1998);
    expect(fig.yearsFormatted).toBe(`${currentYear - 1998} years`);
  });

  it('returns schema defaults from the admin endpoint for every unset group (including site.whatsapp)', async () => {
    for (const key of SETTINGS_GROUP_KEYS) {
      await db.delete(setting).where(eq(setting.key, key));
      const res = await app.request(`/api/v1/admin/settings/${key}`, { headers: HDRS() });
      expect(res.status, key).toBe(200);
      const json = await res.json();
      expect(json.isDefault, key).toBe(true);
      expect(json.value, key).toEqual(SETTINGS_GROUP_DEFAULTS[key]);
    }
    const missing = await app.request('/api/v1/admin/settings/site.unknown', { headers: HDRS() });
    expect(missing.status).toBe(404);
  });

  it('G-REFLECT: every typed group saves and is delivered anonymously with its cache tag', async () => {
    for (const key of SETTINGS_GROUP_KEYS) {
      const fixture = GROUP_FIXTURES[key];
      const putRes = await app.request('/api/v1/admin/settings', {
        method: 'PUT',
        headers: HDRS(),
        body: JSON.stringify({ key, value: fixture }),
      });
      expect(putRes.status, key).toBe(200);

      const res = await app.request(`/api/v1/delivery/settings/${encodeURIComponent(key)}`);
      expect(res.status, key).toBe(200);
      const tag = res.headers.get('cache-tag') || '';
      expect(tag, key).toContain('site');
      expect(tag, key).toContain('settings');
      expect(tag, key).toContain(`settings:${key}`);

      const json = await res.json();
      for (const [field, value] of Object.entries(fixture)) {
        expect(json.data[field], `${key}.${field}`).toEqual(value);
      }
      if (key === 'site.figures') {
        const expectedYears = new Date().getFullYear() - (fixture.foundingYear as number);
        expect(json.data.years).toBe(expectedYears);
        expect(json.data.yearsFormatted).toBe(`${expectedYears} years`);
      }

      // Restore canonical defaults so later assertions start clean.
      const restore = await app.request('/api/v1/admin/settings', {
        method: 'PUT',
        headers: HDRS(),
        body: JSON.stringify({ key, value: SETTINGS_GROUP_DEFAULTS[key] }),
      });
      expect(restore.status, key).toBe(200);
    }
  });

  it('returns 404 for an unknown delivery settings group', async () => {
    const res = await app.request('/api/v1/delivery/settings/site.unknown');
    expect(res.status).toBe(404);
  });

  it('refuses admin writes from non-super_admin roles', async () => {
    const res = await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: EDITOR_HDRS(),
      body: JSON.stringify({ key: 'site.figures', value: GROUP_FIXTURES['site.figures'] }),
    });
    expect(res.status).toBe(403);
  });

  it('records a settings outbox event tagged for the site cache', async () => {
    const putRes = await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: HDRS(),
      body: JSON.stringify({ key: 'site.figures', value: GROUP_FIXTURES['site.figures'] }),
    });
    expect(putRes.status).toBe(200);

    const rows = await db.select().from(outbox).orderBy(desc(outbox.id)).limit(1);
    expect(rows[0]?.eventType).toBe('settings.update');
    expect(rows[0]?.payload?.tags).toContain('site');

    await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: HDRS(),
      body: JSON.stringify({ key: 'site.figures', value: SETTINGS_GROUP_DEFAULTS['site.figures'] }),
    });
  });

  it('merges defaults into a partial group instead of erasing fields', async () => {
    const putRes = await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: HDRS(),
      body: JSON.stringify({ key: 'site.brand', value: { name: 'Partial Brand' } }),
    });
    expect(putRes.status).toBe(200);

    const res = await app.request('/api/v1/delivery/settings/site.brand');
    const json = await res.json();
    expect(json.data.name).toBe('Partial Brand');
    expect(json.data.tagline).toBe(SETTINGS_GROUP_DEFAULTS['site.brand'].tagline);
    expect(json.data.logoUrl).toBe(SETTINGS_GROUP_DEFAULTS['site.brand'].logoUrl);
    expect(json.data.foundingYear).toBe(SETTINGS_GROUP_DEFAULTS['site.brand'].foundingYear);

    await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: HDRS(),
      body: JSON.stringify({ key: 'site.brand', value: SETTINGS_GROUP_DEFAULTS['site.brand'] }),
    });
  });

  it('rejects invalid settings payloads with 422', async () => {
    const cases: Array<[string, unknown]> = [
      ['site.whatsapp', { phoneNumber: '1234567890', waUrl: 'https://invalid-whatsapp-domain.com/chat' }],
      ['site.contact', { email: 'not-an-email', phone: '+886 2 2659 0880', address: 'Taipei' }],
      ['site.brand', { name: 'TwinMOS', foundingYear: 1800 }],
      ['site.social', { facebook: 'not-a-url', instagram: 'https://example.com/ig', linkedin: 'https://example.com/li', x: 'https://example.com/x', youtube: 'https://example.com/yt' }],
      ['site.cookie', { title: '', description: 'Description', policyUrl: '/legal.html#cookies', essentialOnlyDefault: true }],
      ['seo.defaults', { defaultTitle: '' }],
      ['integrations', { turnstileSiteKey: '0xKEY', analyticsEnabled: 'yes', googleAnalyticsId: '' }],
      ['site.figures', { countriesCount: '93+', foundingYear: 1998, productCount: 0 }],
    ];

    for (const [key, value] of cases) {
      const res = await app.request('/api/v1/admin/settings', {
        method: 'PUT',
        headers: HDRS(),
        body: JSON.stringify({ key, value }),
      });
      expect(res.status, key).toBe(422);
      expect(res.headers.get('content-type') || '').toContain('application/problem+json');
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors.length, key).toBeGreaterThan(0);
    }
  });

  it('G-REFLECT: updating founding year updates dynamic "N years" string', async () => {
    // Update founding year to 1990
    const putRes = await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: HDRS(),
      body: JSON.stringify({
        key: 'site.figures',
        value: {
          countriesCount: '95+',
          foundingYear: 1990,
          productCount: 42,
        },
      }),
    });
    expect(putRes.status).toBe(200);

    // Anonymous delivery reflects computed "N years"
    const dlvRes = await app.request('/api/v1/delivery/settings');
    expect(dlvRes.status).toBe(200);
    const dlvJson = await dlvRes.json();
    const fig = dlvJson.data['site.figures'];
    const currentYear = new Date().getFullYear();
    const expectedYears = currentYear - 1990;
    expect(fig.foundingYear).toBe(1990);
    expect(fig.years).toBe(expectedYears);
    expect(fig.yearsFormatted).toBe(`${expectedYears} years`);
    expect(fig.yearsLabel).toBe(`${expectedYears}-year`);

    // Reset back to canonical 1998
    await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: HDRS(),
      body: JSON.stringify({
        key: 'site.figures',
        value: {
          countriesCount: '93+',
          foundingYear: 1998,
          productCount: 39,
        },
      }),
    });
  });

  it('integrations endpoint redacts secrets and exposes public fields only', async () => {
    const putRes = await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: HDRS(),
      body: JSON.stringify({
        key: 'integrations',
        value: {
          turnstileSiteKey: '0x4AAAAAAA_test_key',
          analyticsEnabled: true,
          googleAnalyticsId: 'G-TEST123456',
          secretAdminApiKey: 'SECRET_NEVER_EXPOSE',
        },
      }),
    });
    expect(putRes.status).toBe(200);

    const dlvRes = await app.request('/api/v1/delivery/settings');
    const dlvJson = await dlvRes.json();
    const integ = dlvJson.data['integrations'];
    expect(integ.turnstileSiteKey).toBe('0x4AAAAAAA_test_key');
    expect(integ.analyticsEnabled).toBe(true);
    expect(integ.googleAnalyticsId).toBe('G-TEST123456');
    expect(integ.secretAdminApiKey).toBeUndefined();

    // The audit row must not contain the credential-shaped value in clear text.
    const auditRows = await db.select().from(schema.auditLog).orderBy(desc(schema.auditLog.id)).limit(1);
    const diff = JSON.stringify(auditRows[0]?.diff ?? {});
    expect(diff).not.toContain('SECRET_NEVER_EXPOSE');

    await app.request('/api/v1/admin/settings', {
      method: 'PUT',
      headers: HDRS(),
      body: JSON.stringify({ key: 'integrations', value: SETTINGS_GROUP_DEFAULTS['integrations'] }),
    });
  });
});

describe('MS4.2 · T4.2.3 Menus Per Locale', () => {
  it('allows identical menu code once per locale', async () => {
    // 1. Create header menu in English
    const resEn = await app.request('/api/v1/admin/navigation/menus', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ code: 'global_header', title: 'Global Header (EN)', locale: 'en' }),
    });
    expect(resEn.status).toBe(201);

    // 2. Create header menu with same code in Arabic
    const resAr = await app.request('/api/v1/admin/navigation/menus', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ code: 'global_header', title: 'Global Header (AR)', locale: 'ar' }),
    });
    expect(resAr.status).toBe(201);

    // 3. Attempting to create duplicate code in same locale fails with 409
    const resDup = await app.request('/api/v1/admin/navigation/menus', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ code: 'global_header', title: 'Duplicate Header', locale: 'en' }),
    });
    expect(resDup.status).toBe(409);
  });
});

describe('MS4.2 · T4.2.3 Menus Per Locale — delivery', () => {
  it('delivers the requested locale and falls back to English', async () => {
    const enRes = await app.request('/api/v1/admin/navigation/menus', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ code: 'loc_nav', title: 'Localized EN', locale: 'en' }),
    });
    expect(enRes.status).toBe(201);

    const arRes = await app.request('/api/v1/admin/navigation/menus', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ code: 'loc_nav', title: 'Localized AR', locale: 'ar' }),
    });
    expect(arRes.status).toBe(201);
    const arMenu = await arRes.json();

    const itemRes = await app.request(`/api/v1/admin/navigation/menus/${arMenu.id}/items`, {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ title: 'المنتجات', targetType: 'url', targetUrl: '/ar.html', sort: 0 }),
    });
    expect(itemRes.status).toBe(201);

    const arDlv = await app.request('/api/v1/delivery/navigation/loc_nav?locale=ar');
    expect(arDlv.status).toBe(200);
    const arJson = await arDlv.json();
    expect(arJson.data.locale).toBe('ar');
    expect(arJson.data.items[0].title).toBe('المنتجات');
    expect(arDlv.headers.get('cache-tag') || '').toContain('nav');

    // No French menu exists: delivery falls back to the English menu.
    const frDlv = await app.request('/api/v1/delivery/navigation/loc_nav?locale=fr');
    const frJson = await frDlv.json();
    expect(frJson.data.locale).toBe('en');

    // The menu list is filtered by locale.
    const listRes = await app.request('/api/v1/delivery/navigation?locale=ar');
    const listJson = await listRes.json();
    expect(listJson.data.some((m: any) => m.code === 'loc_nav')).toBe(true);
    expect(listJson.data.every((m: any) => m.locale === 'ar')).toBe(true);
  });

  it('404s an unknown menu code', async () => {
    const res = await app.request('/api/v1/delivery/navigation/not_a_menu');
    expect(res.status).toBe(404);
  });
});

const flattenNav = (nodes: any[]): any[] =>
  (nodes || []).flatMap((node) => [node, ...flattenNav(node.children || [])]);

// Canonical clean routes plus the legacy .html aliases the importer used to
// emit; both must resolve (the aliases 301 in the web app).
const STATIC_NAV_ROUTES = new Set([
  '/', '/about', '/careers', '/compare', '/compatibility', '/contact', '/gaming',
  '/learn-benchmarks', '/learn-blog', '/learn-explained', '/learn-glossary',
  '/learn-guides', '/learn', '/legal', '/news', '/partners', '/quote', '/rma',
  '/shop', '/sitemap', '/solutions', '/support', '/technology', '/where-to-buy',
  '/index.html', '/about.html', '/careers.html', '/compare.html', '/compatibility.html',
  '/contact.html', '/gaming.html', '/learn-benchmarks.html', '/learn-blog.html',
  '/learn-explained.html', '/learn-glossary.html', '/learn-guides.html', '/learn.html',
  '/legal.html', '/news.html', '/partners.html', '/quote.html', '/rma.html', '/shop.html',
  '/sitemap.html', '/solutions.html', '/support.html', '/technology.html', '/where-to-buy.html',
]);

describe('MS4.2 · T4.2.4 Import the Real 179 Links', () => {
  it('imports 179 prototype anchors as 173 links + 6 drawer toggles, idempotently', async () => {
    const first = await importPrototypeMenus(db);
    expect(first.total).toBe(179);
    expect(first.mega).toBe(84);
    expect(first.drawer).toBe(56);
    expect(first.footer).toBe(39);
    expect(first.links).toBe(173);
    expect(first.groups).toBe(28);
    expect(first.drawerToggles).toBe(6);

    const second = await importPrototypeMenus(db);
    expect(second.rows).toBe(first.rows);

    const menus = await db.select().from(navMenu);
    for (const code of ['header', 'drawer', 'footer']) {
      expect(menus.filter((m: any) => m.code === code && m.locale === 'en').length, code).toBe(1);
    }
    // The invented legacy `legal` menu must not survive the import.
    expect(menus.some((m: any) => m.code === 'legal')).toBe(false);

    const headerMenu = menus.find((m: any) => m.code === 'header' && m.locale === 'en');
    const drawerMenu = menus.find((m: any) => m.code === 'drawer' && m.locale === 'en');
    const footerMenu = menus.find((m: any) => m.code === 'footer' && m.locale === 'en');
    const headerRows = await db.select().from(navItem).where(eq(navItem.menuId, headerMenu.id));
    const drawerRows = await db.select().from(navItem).where(eq(navItem.menuId, drawerMenu.id));
    const footerRows = await db.select().from(navItem).where(eq(navItem.menuId, footerMenu.id));
    expect(headerRows.length).toBe(100);
    expect(drawerRows.length).toBe(56);
    expect(footerRows.length).toBe(45);
    expect(headerRows.filter((i: any) => i.targetUrl).length).toBe(84);
    expect(drawerRows.filter((i: any) => i.targetUrl).length).toBe(50);
    expect(footerRows.filter((i: any) => i.targetUrl).length).toBe(39);

    for (const item of [...headerRows, ...drawerRows, ...footerRows]) {
      if (!item.targetUrl) continue;
      expect(item.targetUrl).not.toBe('#');
      expect(/\s/.test(item.targetUrl)).toBe(false);
      if (!/^https?:\/\//.test(item.targetUrl)) {
        expect(item.targetUrl.startsWith('/')).toBe(true);
        const path = item.targetUrl.split('#')[0].split('?')[0];
        const known =
          STATIC_NAV_ROUTES.has(path) ||
          path.startsWith('/products/') ||
          path.startsWith('/learn/');
        expect(known, `${item.targetUrl} should resolve to a site route`).toBe(true);
      }
    }
  });

  it('builds the header mega-menu tree (columns, feature panels, all rows)', async () => {
    const res = await app.request('/api/v1/delivery/navigation/header');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-tag')).toContain('nav');
    const json = await res.json();
    const roots = json.data.items;
    expect(roots.length).toBe(6);
    const flat = flattenNav(roots);
    expect(flat.filter((i) => i.targetUrl).length).toBe(84);
    expect(flat.filter((i) => i.metadata?.kind === 'column').length).toBe(16);
    expect(flat.filter((i) => i.metadata?.kind === 'feature_panel').length).toBe(6);
    expect(flat.filter((i) => i.metadata?.kind === 'all_row').length).toBe(7);
    const allRow = flat.find((i) => i.metadata?.kind === 'all_row' && /catalog/i.test(i.title));
    expect(allRow?.title).toContain('39 products');
    expect(flat.some((i) => i.title.includes('{{products}}'))).toBe(false);
  });

  it('builds drawer and footer trees including columns and the legal bar', async () => {
    const drawerRes = await app.request('/api/v1/delivery/navigation/drawer');
    const drawer = (await drawerRes.json()).data;
    expect(drawer.items.length).toBe(9);
    const drawerFlat = flattenNav(drawer.items);
    expect(drawerFlat.length).toBe(56);
    expect(drawerFlat.filter((i) => i.targetUrl).length).toBe(50);
    expect(drawerFlat.filter((i) => i.metadata?.kind === 'drawer_group').length).toBe(6);
    expect(drawerFlat.some((i) => i.targetUrl === '#')).toBe(false);

    const footerRes = await app.request('/api/v1/delivery/navigation/footer');
    const footer = (await footerRes.json()).data;
    const footerRootTitles = footer.items.map((i: any) => i.title);
    expect(footerRootTitles).toEqual(['Social', 'Products', 'Company', 'Support', 'Contact', 'Legal']);
    const footerFlat = flattenNav(footer.items);
    expect(footerFlat.length).toBe(45);
    expect(footerFlat.filter((i) => i.targetUrl).length).toBe(39);
    const legal = footer.items.find((i: any) => i.title === 'Legal');
    expect(legal.children.length).toBe(3);
    const products = footer.items.find((i: any) => i.title === 'Products');
    expect(products.children.length).toBe(11);
  });

  it('rejects invalid or unresolved navigation targets', async () => {
    const menuRes = await app.request('/api/v1/admin/navigation/menus', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ code: 'validation_nav', title: 'Validation', locale: 'en' }),
    });
    expect(menuRes.status).toBe(201);
    const menu = await menuRes.json();

    const badTargets = [
      'javascript:alert(1)',
      'https://example.com/a b',
      'example.html',
      '//evil.example/x',
     
      '/../etc/passwd',
      'data:text/html,<script>alert(1)</script>',
    ];
    for (const targetUrl of badTargets) {
      const res = await app.request(`/api/v1/admin/navigation/menus/${menu.id}/items`, {
        method: 'POST',
        headers: HDRS(),
        body: JSON.stringify({ title: 'Bad', targetType: 'url', targetUrl, sort: 0 }),
      });
      expect(res.status, targetUrl).toBe(422);
    }

    const missingRef = await app.request(`/api/v1/admin/navigation/menus/${menu.id}/items`, {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ title: 'Missing product', targetType: 'product', targetId: 'does-not-exist', sort: 0 }),
    });
    expect(missingRef.status).toBe(422);

    const okPath = await app.request(`/api/v1/admin/navigation/menus/${menu.id}/items`, {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ title: 'About quality', targetType: 'url', targetUrl: '/about.html#quality', sort: 0 }),
    });
    expect(okPath.status).toBe(201);

    const okExternal = await app.request(`/api/v1/admin/navigation/menus/${menu.id}/items`, {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ title: 'External', targetType: 'url', targetUrl: 'https://example.com/x', sort: 1 }),
    });
    expect(okExternal.status).toBe(201);
  });
});

describe('MS4.2 · T4.2.4 Reference resolution', () => {
  it('resolves typed product/article/category references at delivery', async () => {
    const [b] = await db.insert(brand).values({ slug: 'ref-brand', name: 'Ref Brand' }).returning();
    const [c] = await db.insert(category).values({ slug: 'ref-cat', name: 'Ref Cat' }).returning();
    await db.insert(product).values({
      sku: 'REF-1', slug: 'ref-product', name: 'Ref Product', brandId: b.id, categoryId: c.id, status: 'published',
    });
    await db.insert(article).values({ slug: 'ref-article', locale: 'en', title: 'Ref Article', body: 'Body', status: 'published' });

    const menuRes = await app.request('/api/v1/admin/navigation/menus', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ code: 'ref_nav', title: 'Reference nav', locale: 'en' }),
    });
    expect(menuRes.status).toBe(201);
    const menu = await menuRes.json();

    const items: Array<Record<string, unknown>> = [
      { title: 'Product ref', targetType: 'product', targetId: 'ref-product', sort: 0 },
      { title: 'Article ref', targetType: 'article', targetId: 'ref-article', sort: 1 },
      { title: 'Category ref', targetType: 'category', targetId: 'ref-cat', sort: 2 },
    ];
    for (const item of items) {
      const res = await app.request(`/api/v1/admin/navigation/menus/${menu.id}/items`, {
        method: 'POST',
        headers: HDRS(),
        body: JSON.stringify(item),
      });
      expect(res.status, String(item.title)).toBe(201);
    }

    const dlv = await app.request('/api/v1/delivery/navigation/ref_nav');
    const data = (await dlv.json()).data;
    const byTitle = new Map(data.items.map((i: any) => [i.title, i]));
    expect(byTitle.get('Product ref').targetUrl).toBe('/products/ref-product');
    expect(byTitle.get('Product ref').targetId).toBe('ref-product');
    expect(byTitle.get('Article ref').targetUrl).toBe('/learn/ref-article');
    expect(byTitle.get('Category ref').targetUrl).toBe('/shop?cat=ref-cat');
  });
});
