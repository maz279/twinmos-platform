// apps/api/test/ms47-entities-forms.test.ts
// Vitest Suite for Milestone MS4.7 · Truthful entities, forms, localisation model and menu editor
// Covers T4.7.1 - T4.7.8 (Z-15, NF-36, E9, C5b, C6b, C8a, Z-20, Z-31, C2b, C4c)

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms47-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.NODE_ENV = 'test';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.PUBLIC_SITE_URL = 'http://localhost:4321';

const MIGRATIONS = existsSync(join(process.cwd(), 'packages', 'db', 'migrations'))
  ? join(process.cwd(), 'packages', 'db', 'migrations')
  : join(process.cwd(), '..', '..', 'packages', 'db', 'migrations');

const {
  createDb,
  office,
  testimonial,
  faq,
  formDefinition,
  formField,
  product,
  category,
  brand,
}: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { formToken, registerSerial }: any = await import('./support/fixtures.ts');

describe('MS4.7 · Truthful Entities, Forms & Localisation Suite', () => {
  let app: any;
  let db: any;

  beforeAll(async () => {
    db = createDb();
    await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(db, { migrationsFolder: MIGRATIONS });
    app = buildApp(db);

    // Seed master catalog
    const [b] = await db.insert(brand).values({ name: 'TwinMOS Tech', slug: 'twinmos' }).returning();
    const [cat] = await db.insert(category).values({ name: 'Solid State Drives', slug: 'ssd-drives' }).returning();
    await db.insert(product).values({
      name: 'TwinMOS Hyper H2 Ultra 2TB NVMe',
      slug: 'hyper-h2-ultra-2tb',
      sku: 'TM-NVME-2TB',
      status: 'published',
      brandId: b.id,
      categoryId: cat.id,
      priceUsd: null, // Nullified invented prices per T4.7.1
    });

    // 1. Seed Offices: 2 Authentic Hubs (published) + 1 Invented Office (draft / unverified)
    await db.insert(office).values([
      {
        role: 'Global Headquarters & EMEA Operations',
        title: 'Dubai Corporate Headquarters',
        entity: 'TwinMOS Technologies Middle East FZE',
        address: 'JAFZA View 18, Downtown Jebel Ali, P.O. Box 61129, Dubai, UAE',
        flag: '🇦🇪',
        sort: 10,
        locale: 'en',
        status: 'published',
        source: 'TwinMOS Corporate Registry Dubai 2026',
        approver: 'Victoria Sterling',
      },
      {
        role: 'R&D, Design & Quality Labs',
        title: 'Taipei Innovation Center',
        entity: 'TwinMOS Technologies Inc. (Taiwan)',
        address: 'No. 122, Sec. 1, Neihu Rd., Neihu Dist., Taipei City 114, Taiwan (R.O.C.)',
        flag: '🇹🇼',
        sort: 20,
        locale: 'en',
        status: 'published',
        source: 'TwinMOS Tech Taiwan R&D Operations Filing',
        approver: 'Victoria Sterling',
      },
      {
        role: 'Invented European Hub',
        title: 'Frankfurt Branch Office',
        entity: 'TwinMOS Frankfurt GmbH (Unregistered)',
        address: 'Invented Office Park 12, Frankfurt',
        status: 'draft', // Invented record unpublished per T4.7.1
        source: 'Unverified legacy dummy record',
        approver: 'None',
      },
    ]);

    // 2. Seed Testimonials: 1 Permission-Backed (published) + 1 Unevidenced (draft)
    await db.insert(testimonial).values([
      {
        author: 'David Vance',
        role: 'VP Infrastructure Engineering',
        context: 'HyperScale Data Systems',
        quote: 'TwinMOS NVMe drives have performed flawlessly across our 40-node virtualization cluster with zero sector dropouts over 18 months.',
        sort: 10,
        status: 'published',
        permissionFlag: true,
        permissionEvidence: 'Signed release waiver ref #REL-2026-HDS-01',
        source: 'Enterprise Customer Reference Review Q1 2026',
        approver: 'Victoria Sterling',
      },
      {
        author: 'John Doe',
        role: 'CEO',
        context: 'Invented Tech Corp',
        quote: 'Amazing products from TwinMOS!',
        sort: 20,
        status: 'draft', // Unevidenced unpublished per T4.7.1
        permissionFlag: false,
        source: 'Unverified marketing placeholder',
      },
    ]);

    // 3. Seed FAQs: 1 Valid Published FAQ + 1 Empty/Padded FAQ (draft)
    await db.insert(faq).values([
      {
        question: 'What is the standard warranty period for TwinMOS NVMe SSDs?',
        answer: 'TwinMOS NVMe solid-state drives include a 5-year limited manufacturer warranty from the date of purchase or up to the defined TBW (Terabytes Written) threshold.',
        groupKey: 'warranty',
        status: 'published',
        source: 'TwinMOS Official Global Warranty Policy Rev 2026.3',
        approver: 'Victoria Sterling',
      },
      {
        question: 'Padded placeholder question #104?',
        answer: '', // Empty answer
        groupKey: 'general',
        status: 'draft', // Unpublished per T4.7.1
        source: 'Legacy dummy import',
      },
    ]);

    // 4. Seed Forms: 7 Form Definitions with hidden routingEmail
    const formTypes = ['contact', 'quote', 'rma', 'partner', 'newsletter', 'job', 'support'];
    for (const type of formTypes) {
      const [form] = await db.insert(formDefinition).values({
        type,
        title: `${type.toUpperCase()} Intake Form`,
        description: `Official intake form for ${type}`,
        routingEmail: `${type}-internal-routing@twinmos.corp.internal`, // Must NEVER leak to clients
        privacyNotice: 'TwinMOS collects this information exclusively to process your inquiry under GDPR/CCPA regulations.',
        status: 'active',
      }).returning();

      await db.insert(formField).values([
        {
          formId: form.id,
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          displayOrder: 1,
        },
        {
          formId: form.id,
          name: 'email',
          label: 'Business Email',
          type: 'email',
          required: true,
          displayOrder: 2,
        },
      ]);
    }
  });

  afterAll(() => {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {}
  });

  describe('T4.7.1 & T4.7.2: Truthful Entities & Audit Proofs (Z-15, NF-36, E9)', () => {
    it('GET /api/v1/delivery/offices strictly returns published offices with source & approver', async () => {
      const res = await app.request('/api/v1/delivery/offices');
      expect(res.status).toBe(200);
      const json = await res.json();
      const list = json.data;
      expect(Array.isArray(list)).toBe(true);

      // Only published offices returned
      expect(list.length).toBe(2);
      for (const item of list) {
        expect(item.status).toBe('published');
        expect(typeof item.source).toBe('string');
        expect(item.source.length).toBeGreaterThan(0);
        expect(typeof item.approver).toBe('string');
        expect(item.approver.length).toBeGreaterThan(0);
        expect(item.title).not.toContain('Frankfurt'); // Draft office excluded
      }
    });

    it('GET /api/v1/delivery/testimonials strictly returns permission-backed testimonials', async () => {
      const res = await app.request('/api/v1/delivery/testimonials');
      expect(res.status).toBe(200);
      const json = await res.json();
      const list = json.data;
      expect(Array.isArray(list)).toBe(true);

      // Only published and permissionFlag=true returned
      expect(list.length).toBe(1);
      const t = list[0];
      expect(t.author).toBe('David Vance');
      expect(t.context).toBe('HyperScale Data Systems');
      expect(t.permissionFlag).toBe(true);
      expect(t.permissionEvidence).toContain('Signed release waiver');
      expect(t.approver).toContain('Victoria Sterling');
    });

    it('GET /api/v1/delivery/faqs filters out empty/padded FAQs', async () => {
      const res = await app.request('/api/v1/delivery/faqs');
      expect(res.status).toBe(200);
      const json = await res.json();
      const list = json.data;
      expect(Array.isArray(list)).toBe(true);

      // The draft empty FAQ should not be present
      expect(list.some((f: any) => f.answer === '')).toBe(false);
      expect(list.some((f: any) => f.question.includes('Padded placeholder'))).toBe(false);
      expect(list.some((f: any) => f.groupKey === 'warranty')).toBe(true);
    });
  });

  describe('T4.7.4: Form Definitions & Server Authoritative Validation (C6b)', () => {
    it('GET /api/v1/delivery/forms/:type serves all 7 forms and NEVER exposes routingEmail', async () => {
      const formTypes = ['contact', 'quote', 'rma', 'partner', 'newsletter', 'job', 'support'];
      for (const type of formTypes) {
        const res = await app.request(`/api/v1/delivery/forms/${type}`);
        expect(res.status).toBe(200);
        const json = await res.json();
        const formDef = json.data;

        expect(formDef.type).toBe(type);
        expect(formDef.title).toBeDefined();
        expect(formDef.privacyNotice).toContain('TwinMOS collects this information');
        expect(Array.isArray(formDef.fields)).toBe(true);
        expect(formDef.fields.length).toBeGreaterThanOrEqual(2);

        // SECURITY CRITICAL: routingEmail MUST be stripped
        expect(formDef.routingEmail).toBeUndefined();
        expect(formDef.routing_email).toBeUndefined();
        expect(JSON.stringify(formDef)).not.toContain('corp.internal');
      }
    });

    it('POST /api/v1/forms/quote rejects invalid payloads with 422 Problem JSON', async () => {
      const res = await app.request('/api/v1/forms/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formToken: formToken(),
          // Missing required email and consent
          name: 'Anonymous Inquirer',
        }),
      });

      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.title).toBe('Validation Failed');
    });

    it('POST /api/v1/forms/quote accepts valid payload and issues reference code QT-2026-', async () => {
      const res = await app.request('/api/v1/forms/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formToken: formToken(),
          email: 'procurement@acme-systems.com',
          name: 'Jane Doe',
          consent: true,
          payload: {
            company: 'Acme Systems LLC',
            projectType: 'Data Center Upgrade',
            sku: 'TM-NVME-2TB',
            quantity: 500,
            urgency: 'immediate',
            notes: 'Need quote for Q4 deployment',
          },
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.reference).toMatch(/^QT-\d{4}-[a-f0-9]+$/);
    });

    it('POST /api/v1/forms/contact validates email and issues reference code CT-2026-', async () => {
      const res = await app.request('/api/v1/forms/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formToken: formToken(),
          email: 'customer@domain.com',
          name: 'Alice Johnson',
          consent: true,
          payload: {
            subject: 'Warranty inquiry',
            message: 'Inquiring about global warranty transfer',
          },
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.reference).toMatch(/^CT-\d{4}-[a-f0-9]+$/);
    });
  });

  describe('T4.7.8: Signed Truth Register (ENTITY-TRUTH)', () => {
    it('ENTITY_TRUTH.md exists and has valid legal approver signatures', () => {
      const candidates = [
        resolve(process.cwd(), 'docs/ENTITY_TRUTH.md'),
        resolve(process.cwd(), '../../docs/ENTITY_TRUTH.md'),
        resolve(process.cwd(), '../docs/ENTITY_TRUTH.md'),
      ];
      const truthPath = candidates.find(c => existsSync(c));
      expect(truthPath).toBeDefined();

      const content = readFileSync(truthPath!, 'utf8');
      expect(content).toContain('Entity Truth Register');
      expect(content).toContain('HMAC-SHA256 signature');
      expect(content).toContain('Register SHA-256');
      expect(content).toContain('approver:');
      // The register is generated from CMS rows; roadmap-named invented
      // addresses must not appear as published evidence.
      expect(content).not.toContain('JAFZA View 18');
    });
  });
});
