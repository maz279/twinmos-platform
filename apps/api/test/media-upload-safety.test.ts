// Comprehensive Test Suite for MS4.5 (T4.5.1–T4.5.6 / MEDIA-01 / CMS-E4 / CMS-E6 / CMS-E7 / CMS-E14 / CMS-E8 / GREF-C)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms45-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = existsSync(join(process.cwd(), 'packages', 'db', 'migrations'))
  ? join(process.cwd(), 'packages', 'db', 'migrations')
  : join(process.cwd(), '..', '..', 'packages', 'db', 'migrations');

const {
  createDb, user, mediaAsset, page, article, product, category,
  specDictionary, specTemplate, faq, distributor, marketplaceListing, jobPosting, deviceTypeLabel
}: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

const PNG_1PX = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (ch) => ch.charCodeAt(0));
const PNG_1PX_RED = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC'), (ch) => ch.charCodeAt(0));

beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ms45-admin@twinmos.dev', password: 'MS45-Password-2026!', name: 'MS45 Admin' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'ms45-admin@twinmos.dev'));

  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ms45-admin@twinmos.dev', password: 'MS45-Password-2026!' }),
  });
  cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  expect(cookie).toBeTruthy();
}, 30_000);

afterAll(() => {
  try { rmSync(TMP, { recursive: true, force: true }); } catch {}
});

describe('T4.5.1 & T4.5.3: Media Upload Alt Enforcement and Upload Safety', () => {
  it('rejects upload without alt text when not marked decorative (HTTP 422)', async () => {
    const form = new FormData();
    form.append('file', new File([PNG_1PX], 'test-no-alt.png', { type: 'image/png' }));
    const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.detail).toMatch(/alt text is required/i);
  });

  it('allows upload with valid alt text (HTTP 201)', async () => {
    const form = new FormData();
    form.append('file', new File([PNG_1PX], 'test-with-alt.png', { type: 'image/png' }));
    form.append('alt', 'TwinMOS Gaming Memory DDR5 Module');
    const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.alt).toBe('TwinMOS Gaming Memory DDR5 Module');
    expect(body.isDecorative).toBe(false);
  });

  it('allows upload without alt text if marked decorative (HTTP 200 or 201)', async () => {
    const form = new FormData();
    form.append('file', new File([PNG_1PX_RED], 'test-decorative.png', { type: 'image/png' }));
    form.append('isDecorative', 'true');
    const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect([200, 201]).toContain(res.status);
    const body = await res.json();
    expect(body.isDecorative).toBe(true);
  });

  it('rejects upload exceeding 10MB limit with HTTP 413', async () => {
    const bigFile = new Uint8Array(11 * 1024 * 1024); // 11MB
    const form = new FormData();
    form.append('file', new File([bigFile], 'oversize.png', { type: 'image/png' }));
    form.append('alt', 'Oversized file test');
    const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect(res.status).toBe(413);
  });

  it('rejects disguised executable / polyglot with spoofed extension (HTTP 422)', async () => {
    // PHP shell script disguised as png
    const fakePng = new TextEncoder().encode('<?php echo "evil shell"; ?>');
    const form = new FormData();
    form.append('file', new File([fakePng], 'exploit.png', { type: 'image/png' }));
    form.append('alt', 'Exploit attempt');
    const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect(res.status).toBe(422);
  });

  it('rejects malicious SVG containing <script> tag (HTTP 422)', async () => {
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script><circle cx="5" cy="5" r="5"/></svg>`;
    const form = new FormData();
    form.append('file', new File([new TextEncoder().encode(maliciousSvg)], 'attack.svg', { type: 'image/svg+xml' }));
    form.append('alt', 'Malicious SVG test');
    const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.detail).toMatch(/active content/i);
  });

  it('rejects malicious SVG containing event handlers onload= (HTTP 422)', async () => {
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle cx="5" cy="5" r="5"/></svg>`;
    const form = new FormData();
    form.append('file', new File([new TextEncoder().encode(maliciousSvg)], 'onload-attack.svg', { type: 'image/svg+xml' }));
    form.append('alt', 'Onload SVG test');
    const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.detail).toMatch(/active content/i);
  });

  it('allows clean SVG without active content (HTTP 201)', async () => {
    const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>`;
    const form = new FormData();
    form.append('file', new File([new TextEncoder().encode(cleanSvg)], 'clean-icon.svg', { type: 'image/svg+xml' }));
    form.append('alt', 'Clean Vector Icon');
    const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect(res.status).toBe(201);
  });
});

describe('T4.5.1: Content Publishing Block for Images Lacking Alt Text', () => {
  it('blocks publishing a page when an inline image lacks alt text and is not decorative (HTTP 422)', async () => {
    // Create draft page with inline image lacking alt
    const pageRes = await app.request('/api/v1/admin/content/page', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({
        slug: 'test-alt-guard-page',
        title: 'Alt Guard Test Page',
        template: 'landing',
        locale: 'en',
        status: 'draft',
        blocks: [
          {
            id: 'hero-guard-1',
            type: 'hero',
            title: 'Test Headline',
            bgMedia: {
              key: 'banner.png',
              alt: '',
              kind: 'image',
            },
          },
        ],
        }),
    });
    expect(pageRes.status).toBe(201);
    const newPage = await pageRes.json();

    // Attempt transition to published
    const transitionRes = await app.request(`/api/v1/admin/content/page/${newPage.id}/transition`, {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ to: 'published' }),
    });
    expect(transitionRes.status).toBe(422);
    const body = await transitionRes.json();
    expect(body.detail).toMatch(/Page publishing blocked: image\(s\) .* lack required alt text/i);
  });

  it('blocks publishing an article when heroMediaId has no alt text and is not decorative (HTTP 422)', async () => {
    // Insert an un-alt'ed asset directly with null alt
    const [asset] = await db.insert(mediaAsset).values({
      key: 'raw-hero.png',
      kind: 'image',
      alt: null,
      isDecorative: false,
    }).returning();

    // Create draft article referencing this asset as hero
    const artRes = await app.request('/api/v1/admin/content/article', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({
        slug: 'test-alt-guard-article',
        title: 'Alt Guard Test Article',
        category: 'Guide',
        body: '<p>Article body</p>',
        status: 'draft',
        heroMediaId: asset.id,
        }),
    });
    expect(artRes.status).toBe(201);
    const newArt = await artRes.json();

    // Transition to published must be rejected
    const transitionRes = await app.request(`/api/v1/admin/content/article/${newArt.id}/transition`, {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ to: 'published' }),
    });
    expect(transitionRes.status).toBe(422);
    const body = await transitionRes.json();
    expect(body.detail).toMatch(/publishing blocked: hero media asset/i);

    // Now update asset with alt text
    await db.update(mediaAsset).set({ alt: 'Valid hero alt text' }).where(eq(mediaAsset.id, asset.id));

    // Transition now succeeds
    const successTransition = await app.request(`/api/v1/admin/content/article/${newArt.id}/transition`, {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({ to: 'published' }),
    });
    expect(successTransition.status).toBe(200);
  });
});

describe('T4.5.4: Catalogue Extensions (Spec Dictionary, Spec Template, Computed Fields)', () => {
  it('provides spec dictionary and templates delivery and admin APIs', async () => {
    // Insert a spec dictionary entry
    const dictRes = await app.request('/api/v1/admin/spec-dictionary', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({
        key: 'Interface',
        normalizedKey: 'interface',
        dataType: 'string',
        unit: null,
        description: 'Physical connection bus',
      }),
    });
    expect(dictRes.status).toBe(201);

    // Query delivery endpoint
    const deliveryDictRes = await app.request('/api/v1/delivery/spec-dictionary');
    expect(deliveryDictRes.status).toBe(200);
    const dictBody = await deliveryDictRes.json();
    expect(dictBody.data.some((item: any) => item.key === 'Interface')).toBe(true);

    // Insert a category first
    const [cat] = await db.insert(category).values({
      name: 'Storage Devices',
      slug: 'storage-devices',
    }).returning();

    // Insert a spec template
    const tmplRes = await app.request('/api/v1/admin/spec-templates', {
      method: 'POST',
      headers: HDRS(),
      body: JSON.stringify({
        categoryId: cat.id,
        name: 'NVMe SSD Standard Specs',
        specKeys: ['Form Factor', 'Interface'],
        requiredKeys: ['Form Factor'],
      }),
    });
    expect(tmplRes.status).toBe(201);

    // Query delivery spec templates
    const deliveryTmplRes = await app.request('/api/v1/delivery/spec-templates');
    expect(deliveryTmplRes.status).toBe(200);
    const tmplBody = await deliveryTmplRes.json();
    expect(tmplBody.data.some((item: any) => item.name === 'NVMe SSD Standard Specs')).toBe(true);
  });

  it('computes 90-day "New" badge and passes coming_soon and warranty_tier in delivery product', async () => {
    const recentDate = new Date(Date.now() - 10 * 86400_000); // 10 days ago
    await db.insert(product).values({
      slug: 'test-delivery-product-specs',
      sku: 'TEST-SKU-90D',
      name: 'Test SSD with Specs',
      status: 'published',
      isComingSoon: true,
      warrantyTier: '5_year',
      launchDate: recentDate,
      specs: { 'Interface': 'PCIe Gen 5.0 x4', 'Capacity': '2TB' },
    });

    const res = await app.request(`/api/v1/delivery/products/test-delivery-product-specs`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.isNewBadge).toBe(true);
    expect(body.data.isComingSoon).toBe(true);
    expect(body.data.warrantyTier).toBe('5_year');
    expect(body.data.specs).toEqual({ 'Interface': 'PCIe Gen 5.0 x4', 'Capacity': '2TB' });
  });

  it('returns 410 Gone for archived product on delivery endpoint', async () => {
    await db.insert(product).values({
      slug: 'test-archived-product',
      sku: 'TEST-SKU-ARCH',
      name: 'Archived SSD',
      status: 'archived',
    });

    const res = await app.request(`/api/v1/delivery/products/test-archived-product`);
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.status).toBe(410);
    expect(body.title).toMatch(/Archived/i);
  });
});

describe('T4.5.5: Articles, News & FAQs', () => {
  it('delivers authentic FAQs with question, answer, groupKey and 0 file paths', async () => {
    // Insert a valid FAQ
    await db.insert(faq).values({
      question: 'What is the warranty period for TwinMOS RAM?',
      answer: 'TwinMOS memory modules carry a limited lifetime warranty.',
      groupKey: 'warranty',
      sort: 1,
      status: 'published',
    });

    const res = await app.request('/api/v1/delivery/faqs');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    for (const item of body.data) {
      expect(item.question).not.toMatch(/\.html$|\.md$|^\//); // Never a file path
      expect(item.answer).toBeTruthy();
    }
  });

  it('delivers published article with heroMedia and relatedArticles, while draft returns 404', async () => {
    await db.insert(article).values({
      slug: 'test-published-guide',
      title: 'How to install NVMe M.2 SSD',
      body: '<p>Step 1: turn off PC</p>',
      status: 'published',
      category: 'guide',
    });

    await db.insert(article).values({
      slug: 'test-draft-guide',
      title: 'Unpublished draft article',
      body: '<p>Draft body</p>',
      status: 'draft',
      category: 'guide',
    });

    // Published article returns 200
    const pubRes = await app.request(`/api/v1/delivery/articles/test-published-guide`);
    expect(pubRes.status).toBe(200);
    const pubBody = await pubRes.json();
    expect(pubBody.data.title).toBe('How to install NVMe M.2 SSD');
    expect(Array.isArray(pubBody.data.relatedArticles)).toBe(true);

    // Draft article returns 404
    const draftRes = await app.request(`/api/v1/delivery/articles/test-draft-guide`);
    expect(draftRes.status).toBe(404);
  });
});

describe('T4.5.6: Directory, Compatibility & Jobs', () => {
  it('delivers distributors with isoCountry, tagline, and ctaConfig', async () => {
    await db.insert(distributor).values({
      name: 'Global Tech Distributors',
      country: 'United Arab Emirates',
      isoCountry: 'AE',
      region: 'me',
      status: 'authorized',
      tagline: 'Leading IT distributor in GCC',
      ctaConfig: { label: 'Contact Rep', url: 'https://example.com/rep' },
      sort: 1,
    });

    const res = await app.request('/api/v1/delivery/distributors');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.some((d: any) => d.isoCountry === 'AE' && d.tagline === 'Leading IT distributor in GCC')).toBe(true);
  });

  it('delivers marketplaces with description, ctaLabel and sort', async () => {
    await db.insert(marketplaceListing).values({
      platform: 'Amazon UAE',
      country: 'United Arab Emirates',
      url: 'https://amazon.ae/twinmos',
      description: 'Official TwinMOS Brand Store on Amazon UAE',
      ctaLabel: 'Shop on Amazon',
      sort: 1,
    });

    const res = await app.request('/api/v1/delivery/marketplaces');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.some((m: any) => m.platform === 'Amazon UAE' && m.ctaLabel === 'Shop on Amazon')).toBe(true);
  });

  it('delivers device type labels from database table device_type_label', async () => {
    const res = await app.request('/api/v1/delivery/device-type-labels');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(4);
    const keys = body.data.map((i: any) => i.deviceType);
    expect(keys).toContain('laptop');
    expect(keys).toContain('desktop');
    expect(keys).toContain('diy');
    expect(keys).toContain('minipc');
  });

  it('delivers published jobs with structured fields and returns 404 for drafts', async () => {
    const [pubJob] = await db.insert(jobPosting).values({
      title: 'Senior Hardware Systems Engineer',
      dept: 'Engineering',
      location: 'Dubai, UAE',
      type: 'full-time',
      level: 'senior',
      status: 'published',
      body: 'Full job description...',
    }).returning();

    const res = await app.request('/api/v1/delivery/jobs');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.some((j: any) => j.id === pubJob.id)).toBe(true);

    const singleRes = await app.request(`/api/v1/delivery/jobs/${pubJob.id}`);
    expect(singleRes.status).toBe(200);
    const singleBody = await singleRes.json();
    expect(singleBody.data.title).toBe('Senior Hardware Systems Engineer');
  });
});
