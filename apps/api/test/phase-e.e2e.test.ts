import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-phase-e-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-phase-e-key-98765';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const {
  createDb,
  page,
  product,
  category,
  brand,
  user,
  newsletterSubscriber,
  formSubmission,
  jobApplication,
  auditLog,
}: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

let superAdminCookie = '';
let editorCookie = '';

async function setupAuth() {
  const mkPass = () => 'SecretPass-2026!';

  // 1. Super admin user
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'super-admin@twinmos.dev', password: mkPass(), name: 'Super Admin' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'super-admin@twinmos.dev'));
  const resSuper = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'super-admin@twinmos.dev', password: mkPass() }),
  });
  superAdminCookie = resSuper.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');

  // 2. Editor user (non super-admin)
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'editor@twinmos.dev', password: mkPass(), name: 'Editor User' }),
  });
  await db.update(user).set({ role: 'editor' }).where(eq(user.email, 'editor@twinmos.dev'));
  const resEditor = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'editor@twinmos.dev', password: mkPass() }),
  });
  editorCookie = resEditor.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  await setupAuth();

  // Seed sample data for sitemap
  await db.insert(brand).values({ name: 'TwinMOS', slug: 'twinmos' });
  await db.insert(category).values({ name: 'DRAM Modules', slug: 'dram-modules' });
  await db.insert(page).values([
    { slug: 'about', title: 'About Us', locale: 'en', status: 'published', blocks: [] },
    { slug: 'contact', title: 'Contact Us', locale: 'en', status: 'published', blocks: [] },
    { slug: 'about', title: 'عن الشركة', locale: 'ar', status: 'published', blocks: [] },
  ]);
  await db.insert(product).values([
    {
      sku: 'TEST-SSD-01',
      slug: 'nvme-ssd-2tb',
      name: 'NVMe SSD 2TB',
      brandId: 1,
      categoryId: 1,
      status: 'published',
      priceUsd: 120,
      currency: 'USD',
    },
  ]);
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('Phase E: SEO, i18n, Accessibility & Privacy Compliance (VC-D/E)', () => {
  describe('E1 / E2: Dynamic Delivery Sitemap', () => {
    it('GET /api/v1/delivery/sitemap returns published pages and products', async () => {
      const res = await app.request('/api/v1/delivery/sitemap');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.items)).toBe(true);

      const paths = data.items.map((i: any) => i.path);
      expect(paths).toContain('/');
      expect(paths).toContain('/about');
      expect(paths).toContain('/products/nvme-ssd-2tb');
    });

    it('GET /api/v1/delivery/sitemap?locale=ar filters by locale prefix', async () => {
      const res = await app.request('/api/v1/delivery/sitemap?locale=ar');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.items)).toBe(true);

      for (const item of data.items) {
        expect(item.path === '/ar' || item.path.startsWith('/ar/')).toBe(true);
      }
    });
  });

  describe('E3 / E4: RFC 9116 security.txt & Nginx 301 Migration Map', () => {
    it('deploy/nginx/twinmos-redirects.map exists with valid 301 legacy mappings', () => {
      const mapPath = join(dirname(dirname(process.cwd())), 'deploy', 'nginx', 'twinmos-redirects.map');
      expect(existsSync(mapPath)).toBe(true);
      const content = readFileSync(mapPath, 'utf8');

      expect(content).toContain('/product-category/solid-state-drive /shop.html?cat=ssd;');
      expect(content).toContain('/about-us /about.html;');
      expect(content).toContain('/career /careers.html;');
      expect(content).toContain('/warranty /legal.html#warranty;');
    });

    it('apps/web/public/.well-known/security.txt complies with RFC 9116', () => {
      const secPath = join(dirname(dirname(process.cwd())), 'apps', 'web', 'public', '.well-known', 'security.txt');
      expect(existsSync(secPath)).toBe(true);
      const sec = readFileSync(secPath, 'utf8');

      expect(sec).toContain('Contact: mailto:security@twinmos.com');
      expect(sec).toContain('Expires: 2027-12-31T23:59:59.000Z');
      expect(sec).toContain('Preferred-Languages:');
      expect(sec).toContain('Canonical: https://www.twinmos.com/.well-known/security.txt');
      expect(sec).toContain('Policy: https://www.twinmos.com/legal.html#security');
    });

    it('apps/web/public/humans.txt and the dynamic robots route exist', () => {
      // robots.txt is generated per-request (robots.txt.ts), not a static file.
      const humansPath = join(dirname(dirname(process.cwd())), 'apps', 'web', 'public', 'humans.txt');
      const robotsRoute = join(dirname(dirname(process.cwd())), 'apps', 'web', 'src', 'pages', 'robots.txt.ts');
      expect(existsSync(humansPath)).toBe(true);
      expect(existsSync(robotsRoute)).toBe(true);
    });
  });

  describe('E5b / PRIV-01: DSAR Export & Erase Operations', () => {
    const testEmail = 'dsar-subject@twinmos.dev';

    beforeAll(async () => {
      // Seed personal data across tables
      await db.insert(newsletterSubscriber).values({
        email: testEmail,
        status: 'active',
        source: 'footer',
      });
      await db.insert(formSubmission).values({
        type: 'contact',
        email: testEmail,
        refCode: 'CT-99901',
        payload: { message: 'Inquiry regarding memory chips' },
        ip: '203.0.113.195',
        ua: 'Mozilla/5.0 Test Browser',
      });
      await db.insert(jobApplication).values({
        email: testEmail,
        refCode: 'APP-99901',
        payload: { coverLetter: 'Senior Engineer application' },
      });
    });

    it('POST /api/v1/admin/privacy/dsar-export requires super_admin', async () => {
      // Unauthenticated
      const resUnauth = await app.request('/api/v1/admin/privacy/dsar-export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });
      expect(resUnauth.status).toBe(401);

      // Authenticated as editor
      const resEditor = await app.request('/api/v1/admin/privacy/dsar-export', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: editorCookie },
        body: JSON.stringify({ email: testEmail }),
      });
      expect(resEditor.status).toBe(403);
    });

    it('POST /api/v1/admin/privacy/dsar-export exports all personal records with audit trail', async () => {
      const res = await app.request('/api/v1/admin/privacy/dsar-export', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: superAdminCookie },
        body: JSON.stringify({ email: testEmail }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.email).toBe(testEmail);
      expect(data.records.subscribers.length).toBe(1);
      expect(data.records.submissions.length).toBe(1);
      expect(data.records.applications.length).toBe(1);

      // Verify audit log entry was created
      const logs = await db.select().from(auditLog).where(eq(auditLog.action, 'privacy.dsar_export'));
      expect(logs.length).toBeGreaterThan(0);
      expect((logs[0].diff as any).targetEmail).toBe(testEmail);
    });

    it('POST /api/v1/admin/privacy/dsar-erase anonymizes and removes personal data', async () => {
      const res = await app.request('/api/v1/admin/privacy/dsar-erase', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: superAdminCookie },
        body: JSON.stringify({ email: testEmail }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.erased).toBe(true);
      expect(data.summary.submissionsAnonymized).toBe(1);
      expect(data.summary.applicationsAnonymized).toBe(1);

      // Check subscriber is removed
      const subs = await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, testEmail));
      expect(subs.length).toBe(0);

      // Check form submissions are anonymized (email changed, IP/UA scrubbed)
      const oldSubs = await db.select().from(formSubmission).where(eq(formSubmission.email, testEmail));
      expect(oldSubs.length).toBe(0);

      const anonSubs = await db.select().from(formSubmission);
      const anonymized = anonSubs.find((s: any) => s.refCode === 'CT-99901');
      expect(anonymized).toBeDefined();
      expect(anonymized.email).toContain('@deleted.twinmos.local');
      expect(anonymized.ip).toBeNull();
      expect(anonymized.ua).toBeNull();

      // Verify audit log entry was created without personal data (T6.1.3 / Z-26)
      const logs = await db.select().from(auditLog).where(eq(auditLog.action, 'privacy.dsar_erase'));
      expect(logs.length).toBeGreaterThan(0);
      expect((logs[0].diff as any).targetHash).toBeDefined();
      expect((logs[0].diff as any).targetEmail).toBeUndefined();

      // Zero-leak check (T6.1.3): search for testEmail across all tables finds 0 rows
      const allAuditLogs = await db.select().from(auditLog);
      const leakedAudit = allAuditLogs.filter((l) => JSON.stringify(l.diff || {}).includes(testEmail));
      expect(leakedAudit.length).toBe(0);
      const remainingSubs = await db.select().from(formSubmission).where(eq(formSubmission.email, testEmail));
      expect(remainingSubs.length).toBe(0);
      const remainingApps = await db.select().from(jobApplication).where(eq(jobApplication.email, testEmail));
      expect(remainingApps.length).toBe(0);
      const remainingNl = await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, testEmail));
      expect(remainingNl.length).toBe(0);
    });

    it('POST /api/v1/admin/privacy/retention-sweep executes multi-table retention and logs audit', async () => {
      const res = await app.request('/api/v1/admin/privacy/retention-sweep', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.sweptAt).toBeDefined();
      expect(data.results).toHaveProperty('auditLog');
      expect(data.results).toHaveProperty('unconfirmedSubscribers');
      expect(data.results).toHaveProperty('oldSubmissions');

      // Verify retention sweep audit log
      const logs = await db.select().from(auditLog).where(eq(auditLog.action, 'privacy.retention_sweep'));
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
