import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-c11b-reflect-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-c11b-reflection-12345';
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.ENFORCE_MFA = '0';

const MIGRATIONS = existsSync(join(process.cwd(), 'packages', 'db', 'migrations'))
  ? join(process.cwd(), 'packages', 'db', 'migrations')
  : join(process.cwd(), '..', '..', 'packages', 'db', 'migrations');

const { createDb, user, brand, category, page, product, glossaryTerm, office, testimonial, policyDocument, formDefinition }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

let adminCookie = '';

async function makeSession(email: string, password: string, role?: string): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: email.split('@')[0] }),
  });
  if (role) await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  adminCookie = await makeSession('admin-c11b@twinmos.dev', 'P3-Admin-2026!', 'super_admin');
  await db.insert(brand).values({ name: 'TwinMOS', slug: 'twinmos' });
  await db.insert(category).values({ name: 'Memory', slug: 'memory' });
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('MS4.8 / T4.8.5: Full Component Reflection (25 Blocks and Every Entity Type)', () => {
  // ------------------------------------------------------------------------
  // 1. All 25 Blocks in Page Reflection
  // ------------------------------------------------------------------------
  describe('25-Block Framework Page Reflection', () => {
    const all25Blocks = [
      { type: 'hero', title: 'Flagship Hero', eyebrow: 'Flagship', lede: 'Next-gen storage' },
      { type: 'slider', title: 'Hero Carousel', slides: [{ image: '/img/slide1.webp', alt: 'Slide 1 Alt Text', title: 'Slide 1' }] },
      { type: 'statsCounter', title: 'Performance Stats', stats: [{ label: 'Speed', value: '14,000 MB/s' }] },
      { type: 'featureGrid', title: 'Key Features', items: [{ title: 'Gen5 Speed', description: 'Up to 14,000 MB/s' }] },
      { type: 'bentoGrid', title: 'Technology Grid', items: [{ title: 'Graphene Pad', description: 'Thermal dissipation' }] },
      { type: 'ctaBanner', title: 'Ready to Upgrade', ctas: [{ label: 'Explore Products', url: '/products' }] },
      {
        type: 'splitCta',
        left: { title: 'Consumer', description: 'Gaming SSDs', ctaText: 'View SSDs', ctaUrl: '/products/ssd' },
        right: { title: 'Enterprise', description: 'Datacenter', ctaText: 'Contact Sales', ctaUrl: '/contact' },
      },
      { type: 'timeline', title: 'Engineering Milestones', milestones: [{ year: '2026', title: 'Gen5 SSD', description: 'Flagship Launch' }] },
      { type: 'textMedia', title: 'Graphene Cooling Tech', body: 'Advanced heat dissipation.' },
      { type: 'faqAccordion', title: 'Frequently Asked Questions', items: [{ question: 'What is PCIe 5.0?', answer: 'The fastest bus standard.' }] },
      { type: 'table', title: 'Interface Comparison Table', headers: ['Model', 'Speed'], rows: [['Gen5', '14,000 MB/s']] },
      { type: 'productShowcase', title: 'Flagship SSD Showcase' },
      { type: 'whereToBuy', title: 'Authorized Retail Channels' },
      { type: 'downloadDatasheet', title: 'Technical Documentation & Whitepapers' },
      { type: 'qvlCompatibility', title: 'Motherboard QVL Compatibility Matrix' },
      { type: 'testimonial', quote: 'TwinMOS DRAM delivered 100% stability.', author: 'Lead Architect' },
      { type: 'badgeStrip', title: 'Global Certifications', badges: [{ label: 'ISO 9001' }, { label: 'CE' }] },
      { type: 'steps', title: 'Easy 3-Step SSD Installation', steps: [{ stepNumber: 1, title: 'Insert', description: 'Mount M.2 SSD' }] },
      { type: 'kpiMeters', title: 'Sustained Sequential Throughput', kpis: [{ label: 'Speed', current: 7000, max: 14000 }] },
      { type: 'callout', title: 'Important Thermal Notice', message: 'Ensure adequate chassis airflow.' },
      { type: 'linkChips', title: 'Related Technologies', chips: [{ label: 'PCIe 5.0', url: '/tech/pcie5' }] },
      { type: 'categoryTiles', title: 'Explore Product Lines', showCounts: true },
      { type: 'policyTabs', title: 'Legal & Compliance Policies', defaultSlug: 'warranty' },
      { type: 'form', formType: 'contact', title: 'Customer Support Inquiry' },
      { type: 'officeCards', title: 'Global Headquarters & Regional Hubs' },
    ];

    let testPageId: number;

    it('creates and publishes page with all 25 block types', async () => {
      const res = await app.request('/api/v1/admin/content/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Full 25-Block Master Architecture',
          slug: 'master-25-blocks',
          path: '/solutions/master-25-blocks',
          locale: 'en',
          status: 'published',
          blocks: all25Blocks,
        }),
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      testPageId = json.id;
      expect(testPageId).toBeGreaterThan(0);
    });

    it('delivers all 25 blocks to anonymous callers within SLA', async () => {
      const start = Date.now();
      const res = await app.request('/api/v1/delivery/pages/by-path?path=/solutions/master-25-blocks');
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(5000); // 5s SLA
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.blocks).toHaveLength(25);
      const deliveredTypes = json.data.blocks.map((b: any) => b.type);
      for (const b of all25Blocks) {
        expect(deliveredTypes).toContain(b.type);
      }
    });

    it('unpublishing page immediately removes it from anonymous delivery (404)', async () => {
      const transRes = await app.request(`/api/v1/admin/content/page/${testPageId}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ to: 'draft' }),
      });
      expect(transRes.status).toBe(200);

      const dlvRes = await app.request('/api/v1/delivery/pages/by-path?path=/solutions/master-25-blocks');
      expect(dlvRes.status).toBe(404);
    });
  });

  // ------------------------------------------------------------------------
  // 2. Product Reflection & Archival (HTTP 410)
  // ------------------------------------------------------------------------
  describe('Product Reflection & Archival Lifecycle', () => {
    let pId: number;

    it('publishes product and reflects in delivery', async () => {
      const res = await app.request('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          sku: 'TWN-REFL-1TB',
          slug: 'refl-gen5-1tb',
          name: 'TwinMOS Reflection 1TB SSD',
          brandId: 1,
          categoryId: 1,
          priceUsd: 149.99,
          currency: 'USD',
        }),
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      pId = json.id;
      // T4.6.1: publish via the audited transition endpoint.
      await app.request(`/api/v1/admin/products/${pId}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ to: 'published' }),
      });

      const dlv = await app.request('/api/v1/delivery/products/refl-gen5-1tb');
      expect(dlv.status).toBe(200);
      const dlvJson = await dlv.json();
      expect(dlvJson.data.name).toBe('TwinMOS Reflection 1TB SSD');
    });

    it('unpublishing product to draft removes it from delivery (404)', async () => {
      // T4.6.1: unpublish moves through the audited transition endpoint.
      const patchRes = await app.request(`/api/v1/admin/products/${pId}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ to: 'draft' }),
      });
      expect(patchRes.status).toBe(200);

      const dlv = await app.request('/api/v1/delivery/products/refl-gen5-1tb');
      expect(dlv.status).toBe(404);
    });

    it('archiving product reflects as HTTP 410 Gone on anonymous delivery', async () => {
      // T4.6.1: archive moves through the audited transition endpoint.
      const patchRes = await app.request(`/api/v1/admin/products/${pId}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ to: 'archived' }),
      });
      expect(patchRes.status).toBe(200);

      const dlv = await app.request('/api/v1/delivery/products/refl-gen5-1tb');
      expect(dlv.status).toBe(410);
    });
  });

  // ------------------------------------------------------------------------
  // 3. Glossary, Office, Testimonial, Policy & Form Lifecycle
  // ------------------------------------------------------------------------
  describe('Entities Lifecycle & Anonymous Reflection', () => {
    it('glossary term creates, delivers, and deletes cleanly', async () => {
      const createRes = await app.request('/api/v1/admin/glossary', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          term: 'NVMe 2.0 Spec',
          definition: 'Non-Volatile Memory Express specification revision 2.0.',
          letter: 'N',
          locale: 'en',
        }),
      });
      expect(createRes.status).toBe(201);
      const json = await createRes.json();
      const gId = json.id;

      const dlvRes = await app.request('/api/v1/delivery/glossary?search=NVMe');
      expect(dlvRes.status).toBe(200);
      const dlvJson = await dlvRes.json();
      expect(dlvJson.data.some((x: any) => x.term === 'NVMe 2.0 Spec')).toBe(true);

      const delRes = await app.request(`/api/v1/admin/glossary/${gId}`, {
        method: 'DELETE',
        headers: { cookie: adminCookie },
      });
      expect(delRes.status).toBe(200);

      const dlvAfter = await app.request('/api/v1/delivery/glossary?search=NVMe+2.0');
      const dlvAfterJson = await dlvAfter.json();
      expect(dlvAfterJson.data.some((x: any) => x.id === gId)).toBe(false);
    });

    it('office creates, delivers, and deletes cleanly', async () => {
      const res = await app.request('/api/v1/admin/offices', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Tokyo Innovation Center',
          role: 'R&D Center',
          entity: 'TwinMOS Japan Ltd.',
          address: 'Chiyoda-ku, Tokyo 100-0001',
          flag: '🇯🇵',
          sort: 1,
          locale: 'en',
          source: 'Test fixture — T4.7.2 provenance gate',
          approver: 'MS4.8 Test Suite',
        }),
      });
      expect(res.status).toBe(201);
      const { id } = await res.json();

      const dlv = await app.request('/api/v1/delivery/offices');
      const dlvJson = await dlv.json();
      expect(dlvJson.data.some((o: any) => o.title === 'Tokyo Innovation Center')).toBe(true);

      await app.request(`/api/v1/admin/offices/${id}`, {
        method: 'DELETE',
        headers: { cookie: adminCookie },
      });
    });

    it('policy publishes and unpublishes cleanly', async () => {
      const res = await app.request('/api/v1/admin/policies', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          slug: 'iso-certification-policy',
          title: 'ISO 9001 Quality Policy',
          version: '1.0',
          body: '<p>Quality management standards followed by TwinMOS manufacturing facilities.</p>',
          summary: 'ISO 9001 Quality standards policy for manufacturing.',
          legalApproved: true,
          status: 'published',
          locale: 'en',
        }),
      });
      expect(res.status).toBe(201);
      const { id } = await res.json();

      const dlv = await app.request('/api/v1/delivery/policies/iso-certification-policy');
      expect(dlv.status).toBe(200);

      // Unpublish policy
      await app.request(`/api/v1/admin/policies/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ status: 'draft' }),
      });

      const dlvDraft = await app.request('/api/v1/delivery/policies/iso-certification-policy');
      expect(dlvDraft.status).toBe(404);
    });

    it('form definition creates and reflects in delivery', async () => {
      const res = await app.request('/api/v1/admin/forms', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          type: 'wholesale-partner',
          title: 'Wholesale Partner Application',
          routingEmail: 'b2b@twinmos.com',
          isActive: true,
          fields: [
            { name: 'businessName', label: 'Registered Business Name', type: 'text', required: true, sort: 1 },
            { name: 'taxId', label: 'VAT / Tax Registration Number', type: 'text', required: true, sort: 2 },
          ],
        }),
      });
      expect(res.status).toBe(201);

      const dlv = await app.request('/api/v1/delivery/forms/wholesale-partner');
      expect(dlv.status).toBe(200);
      const dlvJson = await dlv.json();
      expect(dlvJson.data.title).toBe('Wholesale Partner Application');
      expect(dlvJson.data.fields).toHaveLength(2);
    });
  });
});
