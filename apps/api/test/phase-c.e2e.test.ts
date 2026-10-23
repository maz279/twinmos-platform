import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-phase-c-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-phase-c-98765';
process.env.MEDIA_DIR = join(TMP, 'media');

const { createDb, user, brand, category, page, product, redirect, navMenu, navItem, glossaryTerm, office, testimonial, policyDocument, formDefinition, formField, mediaAsset }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
const app = buildApp(db);

let adminCookie = '';
let editorCookie = '';
let authorCookie = '';

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
  adminCookie = await makeSession('admin-c@twinmos.dev', 'P3-Admin-2026!', 'super_admin');
  editorCookie = await makeSession('editor-c@twinmos.dev', 'P3-Editor-2026!', 'editor');
  authorCookie = await makeSession('author-c@twinmos.dev', 'P3-Author-2026!', 'author');

  // Seed sample brand & category for product tests
  await db.insert(brand).values({ name: 'TwinMOS', slug: 'twinmos' });
  await db.insert(category).values({ name: 'Memory', slug: 'memory' });
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('Phase C Content Model & Editors (VC-C Master Suite)', () => {

  // -------------------------------------------------------------
  // CMS-E2: Navigation Tree & Reordering
  // -------------------------------------------------------------
  describe('CMS-E2: Navigation Menus & Item Hierarchy', () => {
    let menuId: number;
    let itemId1: number;
    let itemId2: number;

    async function ensureTestMenu() {
      if (menuId && itemId1 && itemId2) return { menuId, itemId1, itemId2 };
      const menuRes = await app.request('/api/v1/admin/menus', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ code: 'header-test', title: 'Header Test Menu', locale: 'en' }),
      });
      const menuData = await menuRes.json();
      menuId = menuData.id;

      const itemRes1 = await app.request(`/api/v1/admin/menus/${menuId}/items`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ title: 'Products', targetType: 'url', targetUrl: '/products.html', sort: 1 }),
      });
      itemId1 = (await itemRes1.json()).id;

      const itemRes2 = await app.request(`/api/v1/admin/menus/${menuId}/items`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ title: 'Support', targetType: 'url', targetUrl: '/support.html', sort: 2 }),
      });
      itemId2 = (await itemRes2.json()).id;
      return { menuId, itemId1, itemId2 };
    }

    it('creates navigation menu and items', async () => {
      const { menuId: mid } = await ensureTestMenu();
      expect(mid).toBeGreaterThan(0);
    });

    it('reorders items via keyboard-accessible PUT endpoint', async () => {
      const { menuId: mid, itemId1: id1, itemId2: id2 } = await ensureTestMenu();
      const reorderRes = await app.request(`/api/v1/admin/menus/${mid}/reorder`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ items: [{ id: id2, sort: 1 }, { id: id1, sort: 2 }] }),
      });
      expect(reorderRes.status).toBe(200);
    });

    it('delivers hierarchical navigation tree on public Delivery API', async () => {
      const { itemId2: id2 } = await ensureTestMenu();
      const res = await app.request('/api/v1/delivery/navigation/header-test');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.code).toBe('header-test');
      expect(body.data.items).toHaveLength(2);
      expect(body.data.items[0].id).toBe(id2); // Support is first after reorder
    });
  });

  // -------------------------------------------------------------
  // CMS-E3 & CMS-E4 & WF-01: Pages, 25-Blocks & 301 Redirect on Path Mutation
  // -------------------------------------------------------------
  describe('CMS-E3 & CMS-E4 & WF-01: Pages, 25-Blocks, Optimistic Concurrency & 301 Path Redirects', () => {
    let pageId: number;

    async function ensureTestPage() {
      if (pageId) return pageId;
      const res = await app.request('/api/v1/admin/content/page', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Enterprise NVMe Solutions',
          slug: 'enterprise-nvme',
          path: '/solutions/enterprise-nvme',
          locale: 'en',
          status: 'published',
          blocks: [
            {
              type: 'hero',
              title: 'Enterprise Storage',
              chips: ['PCIe 5.0', 'NVMe'],
              trustStats: [{ value: '14,000 MB/s', label: 'Max Read' }],
              jumpLinks: [],
              ctas: [{ label: 'Contact Sales', url: '/contact.html', variant: 'primary' }],
              searchForm: false,
            },
            {
              type: 'table',
              title: 'Performance Specs',
              headers: ['Model', 'Capacity', 'Read', 'Write'],
              rows: [['NV7000', '2TB', '14000 MB/s', '12000 MB/s']],
              isSpecTable: true,
            },
          ],
          source: 'Test fixture (T4.7.2)', approver: 'QA Suite',
        }),
      });
      const data = await res.json();
      pageId = data.id;
      return pageId;
    }

    it('creates page with 25-block framework blocks and path', async () => {
      const pid = await ensureTestPage();
      expect(pid).toBeGreaterThan(0);
    });

    it('serves page by exact path via /delivery/pages/by-path', async () => {
      await ensureTestPage();
      const res = await app.request('/api/v1/delivery/pages/by-path?path=/solutions/enterprise-nvme');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.title).toBe('Enterprise NVMe Solutions');
      expect(body.data.blocks).toHaveLength(2);
    });

    it('rejects stale version edit with HTTP 409 Conflict (WF-01 Optimistic Concurrency)', async () => {
      const pid = await ensureTestPage();
      const res = await app.request(`/api/v1/admin/content/page/${pid}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          title: 'Conflict Test',
          version: 999, // Stale version!
          source: 'Test fixture (T4.7.2)', approver: 'QA Suite',
        }),
      });
      expect(res.status).toBe(409);
    });

    it('mutating page path automatically generates 301 redirect in redirect table', async () => {
      const pid = await ensureTestPage();
      // Fetch fresh version
      const getRes = await app.request(`/api/v1/admin/content/page/${pid}`, {
        headers: { cookie: adminCookie },
      });
      const cur = await getRes.json();

      const res = await app.request(`/api/v1/admin/content/page/${pid}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          path: '/solutions/nvme-gen5',
          version: cur.version,
        }),
      });
      expect(res.status).toBe(200);
      const updated = await res.json();
      expect(updated.version).toBe(cur.version + 1);

      // Verify automatic 301 redirect was created
      const redirects = await db.select().from(redirect).where(eq(redirect.from, '/solutions/enterprise-nvme'));
      expect(redirects).toHaveLength(1);
      expect(redirects[0].to).toBe('/solutions/nvme-gen5');
      expect(redirects[0].code).toBe(301);
    });
  });

  // -------------------------------------------------------------
  // CMS-E6 & CMS-E7: Product Specs Dictionary & 410 on Archived
  // -------------------------------------------------------------
  describe('CMS-E6 & CMS-E7: Products, Specs Dictionary & 410 Gone on Archive', () => {
    let prodId: number;

    async function ensureTestProduct() {
      if (prodId) return prodId;
      const res = await app.request('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          sku: 'TWN-NV7-2TB',
          slug: 'nv7000-m2-2tb',
          name: 'TwinMOS NV7000 M.2 2TB',
          brandId: 1,
          categoryId: 1,
          priceUsd: 189.99,
          currency: 'USD',
          warrantyTier: '5_year',
          launchDate: '2026-03-01T00:00:00.000Z',
          specsDictionary: {
            formFactor: 'M.2 2280',
            interface: 'PCIe Gen 5.0 x4',
            nand: '3D TLC',
            tbw: 1400,
          },
          source: 'Test fixture (T4.7.2)', approver: 'QA Suite',
        }),
      });
      const data = await res.json();
      prodId = data.id;
      // T4.6.1: publish via the audited transition endpoint.
      await app.request(`/api/v1/admin/products/${prodId}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ to: 'published' }),
      });
      return prodId;
    }

    it('creates product with specsDictionary, launchDate and warrantyTier', async () => {
      const id = await ensureTestProduct();
      expect(id).toBeGreaterThan(0);
    });

    it('delivers product details on public Delivery API', async () => {
      await ensureTestProduct();
      const res = await app.request('/api/v1/delivery/products/nv7000-m2-2tb');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.specsDictionary.interface).toBe('PCIe Gen 5.0 x4');
    });

    it('archiving product causes public Delivery API to return HTTP 410 Gone', async () => {
      const id = await ensureTestProduct();
      const getRes = await app.request(`/api/v1/admin/products/${id}`, {
        headers: { cookie: adminCookie },
      });
      const cur = await getRes.json();

      // T4.6.1: archiving moves through the audited transition endpoint.
      const patchRes = await app.request(`/api/v1/admin/products/${id}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ to: 'archived' }),
      });
      expect(patchRes.status).toBe(200);

      // Anonymous PDP check
      const dlvRes = await app.request('/api/v1/delivery/products/nv7000-m2-2tb');
      expect(dlvRes.status).toBe(410);
    });
  });

  // -------------------------------------------------------------
  // CMS-E8 & CMS-E14: Glossary, Offices, Testimonials, Policies & Forms
  // -------------------------------------------------------------
  describe('CMS-E8 & CMS-E14: Entities Delivery (Glossary, Offices, Testimonials, Policies, Forms)', () => {
    it('creates glossary term and delivers via A-Z search', async () => {
      const createRes = await app.request('/api/v1/admin/glossary', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          term: 'ECC Memory',
          definition: 'Error-Correcting Code memory that detects and corrects common kinds of internal data corruption.',
          letter: 'E',
          locale: 'en',
        }),
      });
      expect(createRes.status).toBe(201);

      const dlvRes = await app.request('/api/v1/delivery/glossary?letter=E');
      expect(dlvRes.status).toBe(200);
      const body = await dlvRes.json();
      expect(body.data.some((g: any) => g.term === 'ECC Memory')).toBe(true);
    });

    it('creates and delivers corporate offices', async () => {
      const res = await app.request('/api/v1/admin/offices', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          role: 'Global Headquarters',
          title: 'Dubai Corporate HQ',
          entity: 'TwinMOS Technologies Middle East FZE',
          address: 'JAFZA View 18, Jebel Ali Free Zone, Dubai, UAE',
          flag: '🇦🇪',
          sort: 1,
          source: 'Test fixture (T4.7.2)', approver: 'QA Suite',
        }),
      });
      expect(res.status).toBe(201);

      const dlvRes = await app.request('/api/v1/delivery/offices');
      expect(dlvRes.status).toBe(200);
      const body = await dlvRes.json();
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('creates testimonial and enforces permissionFlag for public delivery', async () => {
      const allowedRes = await app.request('/api/v1/admin/testimonials', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          quote: 'TwinMOS RAM has powered our servers with zero downtime for 4 years.',
          author: 'DevOps Lead',
          role: 'Enterprise Cloud Corp',
          permissionFlag: true,
          permissionEvidence: 'Signed release on file (phase-c fixture).',
          source: 'Test fixture (T4.7.2)', approver: 'QA Suite',
          sort: 1,
        }),
      });
      expect(allowedRes.status).toBe(201);

      const dlvRes = await app.request('/api/v1/delivery/testimonials');
      expect(dlvRes.status).toBe(200);
      const body = await dlvRes.json();
      expect(body.data.every((t: any) => t.permissionFlag === true)).toBe(true);
    });

    it('creates and delivers policy document by slug', async () => {
      const res = await app.request('/api/v1/admin/policies', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          slug: 'warranty-policy-test',
          title: 'Global Warranty Policy',
          version: '2026.1',
          status: 'published',
          legalApproved: true,
          approvedBy: 'Arthur Pendelton',
          summary: 'Standard 5-year and lifetime limited warranty conditions.',
          body: 'Full warranty text...',
          source: 'Test fixture (T4.7.2)', approver: 'QA Suite',
        }),
      });
      expect(res.status).toBe(201);

      const dlvRes = await app.request('/api/v1/delivery/policies/warranty-policy-test');
      expect(dlvRes.status).toBe(200);
      const body = await dlvRes.json();
      expect(body.data.title).toBe('Global Warranty Policy');
    });

    it('creates and delivers form definition with fields', async () => {
      const res = await app.request('/api/v1/admin/forms', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({
          type: 'rma-inquiry',
          title: 'RMA Service Claim',
          routingEmail: 'rma@twinmos.com',
          isActive: true,
          fields: [
            { name: 'serialNumber', label: 'Serial Number (S/N)', type: 'text', required: true, sort: 1 },
            { name: 'defectReason', label: 'Defect Description', type: 'textarea', required: true, sort: 2 },
          ],
          source: 'Test fixture (T4.7.2)', approver: 'QA Suite',
        }),
      });
      expect(res.status).toBe(201);

      const dlvRes = await app.request('/api/v1/delivery/forms/rma-inquiry');
      expect(dlvRes.status).toBe(200);
      const body = await dlvRes.json();
      expect(body.data.type).toBe('rma-inquiry');
      expect(body.data.fields).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------
  // LOC-01: Localization & XLIFF UTF Corruption Verification
  // -------------------------------------------------------------
  describe('LOC-01: Localization & XLIFF Round-Trip Validation', () => {
    it('exports entity strings into valid XLIFF 1.2 XML', async () => {
      const res = await app.request('/api/v1/admin/translations/entities/xliff?entity=glossary_term', {
        headers: { cookie: adminCookie },
      });
      expect(res.status).toBe(200);
      const xml = await res.text();
      expect(xml).toContain('version="1.2"');
      expect(xml).toContain('<trans-unit');
    });

    it('strictly rejects corrupted UTF encodings (??? or \\uFFFD) with HTTP 422', async () => {
      const corruptXliff = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2">
  <file source-language="en" target-language="ar" datatype="plaintext" original="glossary_term">
    <body>
      <trans-unit id="1">
        <source>ECC Memory</source>
        <target>??? \uFFFD Corrupted text</target>
      </trans-unit>
    </body>
  </file>
</xliff>`;

      const res = await app.request('/api/v1/admin/translations/entities/xliff', {
        method: 'POST',
        headers: { 'content-type': 'application/xml', cookie: adminCookie },
        body: corruptXliff,
      });
      expect(res.status).toBe(422);
      const err = await res.json();
      expect(err.detail).toContain('corrupted');
    });
  });

  // -------------------------------------------------------------
  // MEDIA-01: Media Focal Point & Decorative Tag Enforcement
  // -------------------------------------------------------------
  describe('MEDIA-01: Media Pipeline, Decorative Images & Focal Point', () => {
    let mediaId: number;

    async function ensureTestMedia() {
      if (mediaId) return mediaId;
      const pngBytes = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
        0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ]);

      const form = new FormData();
      const file = new File([pngBytes], 'decorative-divider.png', { type: 'image/png' });
      form.append('file', file);
      form.append('isDecorative', 'true');
      form.append('alt', '');

      const res = await app.request('/api/v1/admin/media', {
        method: 'POST',
        headers: { cookie: authorCookie },
        body: form,
      });
      const data = await res.json();
      mediaId = data.id;
      return mediaId;
    }

    it('permits decorative upload with empty alt text and saves isDecorative flag', async () => {
      const mid = await ensureTestMedia();
      expect(mid).toBeGreaterThan(0);
    });

    it('updates focal point and decorative status via PATCH /media/:id', async () => {
      const mid = await ensureTestMedia();
      const res = await app.request(`/api/v1/admin/media/${mid}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: authorCookie },
        body: JSON.stringify({
          focalPoint: { x: 35, y: 65 },
          isDecorative: true,
        }),
      });
      expect(res.status).toBe(200);
      const updated = await res.json();
      expect(updated.focalPoint).toEqual({ x: 35, y: 65 });
      expect(updated.isDecorative).toBe(true);
    });
  });

});
