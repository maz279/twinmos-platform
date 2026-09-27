// P4 localization end-to-end tests — translation CRUD/import/export source,
// RBAC (super_admin-only writes), the public i18n bundle endpoint, locale
// activation, and hreflang/dir assertions against the BUILT site output.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p4-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'support@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const { createDb, user, translation, locale }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
const app = buildApp(db);

let superCookie = '';
let adminCookie = '';
const SUPER_EMAIL = 'p4-super@twinmos.dev';
const ADMIN_EMAIL = 'p4-admin@twinmos.dev';
const mkPass = (label: string) => process.env.E2E_ADMIN_PASSWORD ?? 'P4-' + label + '-' + new Date().getFullYear() + '!';

async function makeSession(email: string, password: string, role?: string): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: email.split('@')[0] }),
  });
  if (role) await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  superCookie = await makeSession(SUPER_EMAIL, mkPass('Super'), 'super_admin');
  adminCookie = await makeSession(ADMIN_EMAIL, mkPass('Admin'), 'admin');
  await db.insert(locale).values([
    { code: 'en', name: 'English', dir: 'ltr', active: true },
    { code: 'ar', name: 'العربية', dir: 'rtl', active: false },
  ]).onConflictDoNothing();
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('translation workflow', () => {
  it('super_admin upserts single strings; repeated upsert updates in place', async () => {
    const first = await app.request('/api/v1/admin/translations', {
      method: 'PUT', headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ locale: 'ar', ns: 'common', key: 'nav.products', value: 'المنتجات' }),
    });
    expect(first.status).toBe(200);
    const second = await app.request('/api/v1/admin/translations', {
      method: 'PUT', headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ locale: 'ar', ns: 'common', key: 'nav.products', value: 'منتجات TwinMOS' }),
    });
    expect(second.status).toBe(200);
    const rows = await db.select().from(translation).where(eq(translation.key, 'nav.products'));
    expect(rows).toHaveLength(1); // upsert, not duplicate
    expect(rows[0].value).toBe('منتجات TwinMOS');
  });

  it('admin/editor are read-only on writes (RBAC: settings family = super_admin)', async () => {
    const denied = await app.request('/api/v1/admin/translations', {
      method: 'PUT', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ locale: 'ar', ns: 'common', key: 'x.y', value: 'v' }),
    });
    expect(denied.status).toBe(403);
    const deniedImport = await app.request('/api/v1/admin/translations/import', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ locale: 'ar', strings: {} }),
    });
    expect(deniedImport.status).toBe(403);
    // admin CAN read (list) — translations are visible for export
    const list = await app.request('/api/v1/admin/translations?locale=ar', { headers: { cookie: adminCookie } });
    expect(list.status).toBe(200);
  });

  it('bulk import upserts a namespace; export list reflects it', async () => {
    const res = await app.request('/api/v1/admin/translations/import', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({
        locale: 'ar', ns: 'common',
        strings: {
          'hero.eyebrow': 'علامة ذاكرة رائدة منذ 1998',
          'hero.title': 'ذاكرة وتخزين مصممان ليدوم',
          'hero.ctaShop': 'استكشف المنتجات',
          'landing.backToEn': 'المتابعة بالإنجليزية',
        },
      }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).imported).toBe(4);
    const list = await (await app.request('/api/v1/admin/translations?locale=ar&ns=common', { headers: { cookie: superCookie } })).json();
    expect(list.items.length).toBeGreaterThanOrEqual(5); // 4 imported + 1 earlier
  });

  it('invalid locale/keys rejected by the contract', async () => {
    const bad = await app.request('/api/v1/admin/translations', {
      method: 'PUT', headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ locale: 'xx', ns: 'common', key: 'k', value: 'v' }),
    });
    expect(bad.status).toBe(422); // 'xx' not in the 9-locale plan
    const badKey = await app.request('/api/v1/admin/translations', {
      method: 'PUT', headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ locale: 'ar', ns: 'common', key: 'bad key!', value: 'v' }),
    });
    expect(badKey.status).toBe(422);
  });

  it('public bundle /i18n/:locale merges namespaces; unknown locale 404', async () => {
    const bundle = await (await app.request('/api/v1/i18n/ar')).json();
    expect(bundle.locale).toBe('ar');
    expect(bundle.strings.common['nav.products']).toBe('منتجات TwinMOS');
    expect(bundle.strings.common['hero.eyebrow']).toContain('1998');
    expect((await app.request('/api/v1/i18n/xx')).status).toBe(404);
  });

  it('delete removes a single string; audit rows written for every mutation', async () => {
    const del = await app.request('/api/v1/admin/translations', {
      method: 'DELETE', headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ locale: 'ar', ns: 'common', key: 'landing.backToEn' }),
    });
    expect(del.status).toBe(200);
    const gone = await (await app.request('/api/v1/i18n/ar')).json();
    expect(gone.strings.common['landing.backToEn']).toBeUndefined();
    const { auditLog } = await import('@twinmos/db');
    const audits = await db.select().from(auditLog);
    const forTranslations = audits.filter((a: any) => a.entity === 'translation');
    expect(forTranslations.some((a: any) => a.action === 'translation.upsert')).toBe(true);
    expect(forTranslations.some((a: any) => a.action === 'translation.import')).toBe(true);
    expect(forTranslations.some((a: any) => a.action === 'translation.delete')).toBe(true);
  });

  it('locale activation remains super_admin-gated (9 seeded codes in plan)', async () => {
    const denied = await app.request('/api/v1/admin/locales/ar', {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ active: true }),
    });
    expect(denied.status).toBe(403);
    const ok = await app.request('/api/v1/admin/locales/ar', {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ active: true }),
    });
    expect(ok.status).toBe(200);
    expect((await ok.json()).dir).toBe('rtl');
  });
});

describe('built-site hreflang and RTL (static output assertions)', () => {
  const WEB = join(import.meta.dirname, '..', '..', '..', 'apps', 'web');
  // These assertions read apps/web/dist — built by `npm run build -w @twinmos/web`
  // (root `npm run test:ci` does this before vitest). On a bare `npm test` from a
  // fresh checkout (no dist yet) we skip LOUDLY rather than false-fail; the
  // CI ordering guarantees the build exists.
  const hasDist = existsSync(join(WEB, 'dist', 'ar.html'));
  const maybeIt = hasDist ? it : it.skip;
  if (!hasDist) {
    console.warn('[p4-i18n] apps/web/dist not built — built-site assertions SKIPPED. Run `npm run test:ci` (builds web first) to cover them.');
  }

  maybeIt('landing pages exist for all 8 non-EN locales with correct lang/dir', () => {
    const dirs: Record<string, string> = { ar: 'rtl' };
    for (const code of ['ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de']) {
      const f = join(WEB, 'dist', `${code}.html`);
      expect(existsSync(f), `${f} missing`).toBe(true);
      const html = readFileSync(f, 'utf8');
      const want = `lang="${code}" dir="${dirs[code] ?? 'ltr'}"`;
      expect(html).toContain(want);
      expect(html).toContain('rtl.css'); // rtl stylesheet linked on ar
    }
  });

  maybeIt('landing carries the full 9-locale hreflang grid with x-default → EN root', () => {
    const html = readFileSync(join(WEB, 'dist', 'ar.html'), 'utf8');
    for (const code of ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de']) {
      expect(html).toContain(`hreflang="${code}"`);
    }
    expect(html).toContain('hreflang="x-default" href="https://www.twinmos.com/"');
    expect(html).toContain('hreflang="en" href="https://www.twinmos.com/"');
  });

  maybeIt('EN pages keep plain en+x-default (no grid on prototype URLs)', () => {
    const html = readFileSync(join(WEB, 'dist', 'index.html'), 'utf8');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('hreflang="x-default"');
    expect(html).not.toContain('hreflang="de"'); // grid only on landings
    expect(html).toContain('<html lang="en" dir="ltr">'); // dir now explicit
  });

  maybeIt('sitemap lists all 8 locale landings', () => {
    const xml = readFileSync(join(WEB, 'dist', 'sitemap.xml'), 'utf8');
    for (const code of ['ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de']) {
      expect(xml, `sitemap missing ${code}`).toContain(`/${code}.html`);
    }
    expect(xml).not.toContain('hreflang'); // sitemap is loc-only; hreflang lives in heads
  });
});
