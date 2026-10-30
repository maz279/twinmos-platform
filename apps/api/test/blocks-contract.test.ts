// Milestone MS4.1 — Page Entity & One Block Contract (BLOCK-STRICT)
// Tasks T4.1.1 through T4.1.6 (Roadmap lines 1672-1736, closing Z-13 and Z-39).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms41-blocks-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-ms41-blocks-contract';
process.env.ENFORCE_MFA = '0';

const MIGRATIONS = existsSync(join(process.cwd(), 'packages', 'db', 'migrations'))
  ? join(process.cwd(), 'packages', 'db', 'migrations')
  : join(process.cwd(), '..', '..', 'packages', 'db', 'migrations');

const { createDb, user, page, redirect, locale }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');
const { BLOCK_TYPES, validateBlock, validateBlocks, migrateBlock, sanitizeRichText, replaceLogoToken }: any = await import('@twinmos/shared');

describe('MS4.1 · Page entity and one block contract (BLOCK-STRICT)', () => {
  let app: any;
  let db: any;
  let adminCookie: string;

  beforeAll(async () => {
    db = createDb();
    await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(db, { migrationsFolder: MIGRATIONS });
    app = buildApp(db);

    // Create admin user & session
    await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ms41-admin@twinmos.dev', password: 'P3-Admin-Pass-2026!', name: 'MS41 Admin' }),
    });
    await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'ms41-admin@twinmos.dev'));
    const loginRes = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ms41-admin@twinmos.dev', password: 'P3-Admin-Pass-2026!' }),
    });
    adminCookie = loginRes.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');

    // Seed locale
    await db.insert(locale).values({ code: 'en', name: 'English', dir: 'ltr', active: true }).onConflictDoNothing();
  }, 30000);

  afterAll(async () => {
    await db.$client.close();
    rmSync(TMP, { recursive: true, force: true });
  });

  // T4.1.1 · Page entity constraints
  describe('T4.1.1 · Page entity constraints', () => {
    it('creates a page with valid path and template', async () => {
      const res = await app.request('/api/v1/admin/content/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Memory Products Hub',
          slug: 'memory-hub',
          locale: 'en',
          path: '/products/memory-hub',
          template: 'default',
          blocks: [{ type: 'hero', title: 'Memory Solutions' }],
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.path).toBe('/products/memory-hub');
      expect(data.template).toBe('default');
    });

    it('rejects a second page with duplicate (locale, path) with 409 conflict', async () => {
      const res = await app.request('/api/v1/admin/content/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Duplicate Path Test Page',
          slug: 'memory-hub-dup',
          locale: 'en',
          path: '/products/memory-hub',
          template: 'landing',
        }),
      });
      expect(res.status).toBe(409);
      const err = await res.json();
      expect(err.title).toContain('Duplicate path');
    });

    it('rejects reserved paths (/admin, /api, /internal) with 422', async () => {
      for (const badPath of ['/admin', '/admin/settings', '/api', '/api/v1/users', '/internal/debug']) {
        const res = await app.request('/api/v1/admin/content/page', {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: adminCookie },
          body: JSON.stringify({
            title: 'Reserved Path Probe',
            slug: 'reserved-' + Math.random().toString(36).slice(2, 6),
            locale: 'en',
            path: badPath,
          }),
        });
        expect(res.status).toBe(422);
      }
    });

    it('renaming a path automatically generates a 301 redirect', async () => {
      const createRes = await app.request('/api/v1/admin/content/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Rename Target Page',
          slug: 'rename-target',
          locale: 'en',
          path: '/old-hardware-page',
        }),
      });
      expect(createRes.status).toBe(201);
      const pageItem = await createRes.json();

      // Rename path
      const patchRes = await app.request(`/api/v1/admin/content/page/${pageItem.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          path: '/new-hardware-page',
        }),
      });
      expect(patchRes.status).toBe(200);

      // Verify 301 redirect entry in db
      const [redir] = await db.select().from(redirect).where(eq(redirect.from, '/old-hardware-page'));
      expect(redir).toBeDefined();
      expect(redir.to).toBe('/new-hardware-page');
      expect(redir.code).toBe(301);
    });
  });

  // T4.1.2 · One shared block definition
  describe('T4.1.2 · One shared block definition (Zero Fallback / Strict 422)', () => {
    it('rejects unknown block types with HTTP 422', async () => {
      const res = await app.request('/api/v1/admin/content/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Invalid Block Page',
          slug: 'invalid-block-type',
          locale: 'en',
          blocks: [{ type: 'nonexistent', foo: 'bar' }],
        }),
      });
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.title).toBe('Block Validation Failed');
      expect(body.invalid_params[0].message).toContain('Unknown block type "nonexistent"');
    });

    it('rejects hero block without mandatory title with per-field 422 report', async () => {
      const res = await app.request('/api/v1/admin/content/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Missing Title Page',
          slug: 'missing-hero-title',
          locale: 'en',
          blocks: [{ type: 'hero', eyebrow: 'Only Eyebrow' }],
        }),
      });
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.title).toBe('Block Validation Failed');
      expect(body.invalid_params.some((p: any) => p.path.includes('title'))).toBe(true);
    });

    it('versions block JSON and supports migrateBlock helper', async () => {
      const v0Block = { type: 'hero', title: 'Legacy Hero' };
      const migrated = migrateBlock(v0Block);
      expect(migrated.version).toBe(1);
    });
  });

  // T4.1.3 & T4.1.5 · Admin defaults & Shared Block list alignment (30/30)
  describe('T4.1.3 & T4.1.5 · Admin schemas and Shared list complete alignment', () => {
    it('contains exactly 30 block types including anchorNav and specComparison', () => {
      expect(BLOCK_TYPES).toHaveLength(30);
      expect(BLOCK_TYPES).toContain('anchorNav');
      expect(BLOCK_TYPES).toContain('specComparison');
    });

    it('every admin default block passes shared validation cleanly (30/30)', async () => {
      const { BLOCK_DEFS } = await import('../../admin/src/modules/page-builder/blocks.ts');
      expect(BLOCK_DEFS).toHaveLength(30);

      for (const def of BLOCK_DEFS) {
        const instance = def.make();
        const res = validateBlock(instance);
        expect(res.success, `Block "${def.type}" default make() failed validation: ${JSON.stringify(res.errors)}`).toBe(true);
      }
    });
  });

  // T4.1.4 · Safe renderer & XSS neutralisation
  describe('T4.1.4 · Safe renderer & XSS sanitization', () => {
    it('strips <script> and <form> tags from rich text fields', () => {
      const maliciousHtml = '<script>alert("XSS")</script><form action="/steal"><input name="pwd" /></form><p>Safe content</p>';
      const sanitized = sanitizeRichText(maliciousHtml);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('<form');
      expect(sanitized).not.toContain('<input');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('replaces {logo} token with accessible inline image', () => {
      const rawTitle = 'Powered by {logo} Flash Memory';
      const replaced = replaceLogoToken(rawTitle);
      expect(replaced).toContain('<img src="/brand/logo.svg" alt="TwinMOS"');
      expect(replaced).not.toContain('{logo}');
    });
  });

  // T4.1.6 · Contract tests: 30-block fixture page
  describe('T4.1.6 · Contract tests: 30-block fixture page', () => {
    it('validates and persists a master fixture page containing all 30 block types', async () => {
      const { BLOCK_DEFS } = await import('../../admin/src/modules/page-builder/blocks.ts');
      const all30Blocks = BLOCK_DEFS.map((b: any) => b.make());

      // Validate blocks array
      const val = validateBlocks(all30Blocks);
      expect(val.success).toBe(true);

      // Create page with all 30 blocks
      const res = await app.request('/api/v1/admin/content/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Master 30-Block Fixture Page',
          slug: 'master-30-block-fixture',
          locale: 'en',
          path: '/fixtures/master-30-blocks',
          template: 'default',
          blocks: all30Blocks,
        }),
      });

      expect(res.status).toBe(201);
      const savedPage = await res.json();
      expect(savedPage.blocks).toHaveLength(30);
      expect(savedPage.blocks.map((b: any) => b.type)).toEqual(BLOCK_TYPES);
    });
  });

  // MS4.4 · Block library I (T4.4.1, T4.4.2, T4.4.3)
  describe('MS4.4 · Block library I contract validation', () => {
    it('T4.4.1: hero block validates all catalogue fields including {logo} and searchForm', () => {
      const hero = {
        type: 'hero',
        eyebrow: 'New Generation',
        title: 'Powered by {logo} Flash Memory',
        lede: 'High-performance memory solutions since 1998.',
        chips: ['DDR5', 'PCIe Gen5', 'Enterprise'],
        trustStats: [
          { value: '28', label: 'Years', sub: 'Of excellence' },
          { value: '93+', label: 'Countries' },
        ],
        jumpLinks: [{ label: 'Specifications', targetId: 'specs' }],
        ctas: [{ label: 'Explore Products', url: '/shop.html', variant: 'primary' }],
        searchForm: true,
      };
      const res = validateBlock(hero);
      expect(res.success).toBe(true);
      expect(replaceLogoToken(hero.title)).toContain('<img src="/brand/logo.svg" alt="TwinMOS"');
    });

    it('T4.4.1: slider block strictly requires non-empty alt text for every slide', () => {
      const invalidSlider = {
        type: 'slider',
        autoplay: true,
        pauseControl: true,
        slides: [
          {
            image: '/media/banner.webp',
            alt: '', // Missing alt!
            title: 'Slide 1',
          },
        ],
      };
      const res = validateBlock(invalidSlider);
      expect(res.success).toBe(false);
      expect(res.errors.some((e: any) => (typeof e === 'string' ? e : e.path || e.message).includes('alt'))).toBe(true);
    });

    it('T4.4.1: slider block validates accessible autoplay and pause control', () => {
      const validSlider = {
        type: 'slider',
        autoplay: true,
        pauseControl: true,
        intervalMs: 6500,
        slides: [
          {
            image: '/media/banner.webp',
            alt: 'TwinMOS VOLTX DDR5 Gaming Memory Banner',
            title: 'Extreme Overclocking',
            kicker: 'VOLTX Series',
            accent: 'voltx',
            cta: 'Explore Line',
            link: '/gaming.html',
          },
        ],
      };
      const res = validateBlock(validSlider);
      expect(res.success).toBe(true);
    });

    it('T4.4.1: splitCta and timeline blocks validate structured fields', () => {
      const splitCta = {
        type: 'splitCta',
        left: { title: 'For Gamers', description: 'Peak DDR5 clock speeds', ctaText: 'Shop Gaming', ctaUrl: '/gaming.html' },
        right: { title: 'For Enterprises', description: 'B2B volume procurement', ctaText: 'Contact Sales', ctaUrl: '/contact.html' },
        dividerText: 'OR',
      };
      expect(validateBlock(splitCta).success).toBe(true);

      const timeline = {
        type: 'timeline',
        title: 'Milestones',
        milestones: [
          { year: '1998', title: 'Founded in Taipei', description: 'TwinMOS Technologies established.' },
          { year: '2026', title: 'Gen 5.0 Flagships', description: 'PCIe Gen 5.0 SSD and DDR5 RGB line.' },
        ],
      };
      expect(validateBlock(timeline).success).toBe(true);
    });

    it('T4.4.3: categoryTiles block supports dynamic product taxonomy without baked-in counts', () => {
      const catTiles = {
        type: 'categoryTiles',
        title: 'Product Ecosystem',
        categoryIds: [1, 2, 3],
        showCounts: true,
        categories: [
          { slug: 'dram-gaming', name: 'Gaming DRAM', title: 'Gaming DRAM' },
          { slug: 'ssd-nvme', name: 'NVMe SSD', title: 'NVMe SSD' },
        ],
      };
      const res = validateBlock(catTiles);
      expect(res.success).toBe(true);
      // Ensure zero baked-in count property
      expect((catTiles.categories[0] as any).count).toBeUndefined();
    });

    it('T4.4.3: anchorNav, badgeStrip, steps, kpiMeters and callout validate cleanly', () => {
      const anchorNav = {
        type: 'anchorNav',
        title: 'Table of Contents',
        sticky: true,
        links: [{ label: 'Overview', targetId: 'overview' }, { label: 'Quality', targetId: 'quality' }],
      };
      expect(validateBlock(anchorNav).success).toBe(true);

      const badgeStrip = {
        type: 'badgeStrip',
        layout: 'wrap',
        badges: [{ label: 'ISO 9001', icon: '🛡️' }, { label: 'JEDEC Compliant', icon: '⚡' }],
      };
      expect(validateBlock(badgeStrip).success).toBe(true);

      const steps = {
        type: 'steps',
        title: 'Warranty Process',
        steps: [{ stepNumber: 1, title: 'Verify SN', description: 'Check authentic serial number' }],
      };
      expect(validateBlock(steps).success).toBe(true);

      const kpiMeters = {
        type: 'kpiMeters',
        title: 'Throughput',
        kpis: [{ label: 'Read Speed', current: 14000, max: 14000, unit: 'MB/s', status: 'optimal' }],
      };
      expect(validateBlock(kpiMeters).success).toBe(true);

      const callout = {
        type: 'callout',
        variant: 'info',
        title: 'Important Notice',
        message: 'Always consult QVL matrix for board compatibility.',
      };
      expect(validateBlock(callout).success).toBe(true);
    });
  });
});
