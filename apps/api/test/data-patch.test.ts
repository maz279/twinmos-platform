// Comprehensive regression suite for R0.4 (DATA-PATCH / Z-04)
// Validates that partial updates (PATCH and PUT) across all entities prune payloads
// to explicitly provided keys, preventing silent clobbering of defaults or unmentioned columns.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-r04-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const {
  createDb, user, brand, category, product, productVariant, compatibilityRule,
  distributor, marketplaceListing, glossaryTerm, office, testimonial,
  policyDocument, formDefinition, formField, navMenu, navItem, jobPosting,
  page, article, newsPost, faq,
}: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

let cookie = '';
let brandId = 1;
let catId = 1;

beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'r04-admin@twinmos.dev', password: 'R04-Admin-Password-2026!', name: 'R04 Admin' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'r04-admin@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'r04-admin@twinmos.dev', password: 'R04-Admin-Password-2026!' }),
  });
  cookie = res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');

  const [b] = await db.insert(brand).values({ slug: 'twinmos-brand', name: 'TwinMOS' }).returning();
  const [c] = await db.insert(category).values({ slug: 'dram-category', name: 'DRAM' }).returning();
  brandId = b.id;
  catId = c.id;
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('R0.4 Stop silent data changes on edit (Z-04 / DATA-PATCH)', () => {
  // 1. Page
  it('page edit retains published status, custom template, and noindex flag on both PATCH and PUT', async () => {
    const [p] = await db.insert(page).values({
      slug: 'test-landing',
      title: 'Original Title',
      path: '/test-landing',
      template: 'landing',
      noindex: true,
      status: 'published',
      body: 'Body text',
    }).returning();

    // PATCH
    const patchRes = await app.request(`/api/v1/admin/content/page/${p.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Patched Title' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(page).where(eq(page.id, p.id));
    expect(afterPatch.title).toBe('Patched Title');
    expect(afterPatch.status).toBe('published');
    expect(afterPatch.template).toBe('landing');
    expect(afterPatch.noindex).toBe(true);

    // PUT
    const putRes = await app.request(`/api/v1/admin/content/page/${p.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Put Title' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(page).where(eq(page.id, p.id));
    expect(afterPut.title).toBe('Put Title');
    expect(afterPut.status).toBe('published');
    expect(afterPut.template).toBe('landing');
    expect(afterPut.noindex).toBe(true);
  });

  // 2. Article
  it('article edit retains published status and custom deck on PATCH and PUT', async () => {
    const [art] = await db.insert(article).values({
      slug: 'test-article',
      title: 'Original Article',
      deck: 'Special Deck',
      body: 'Article content',
      status: 'published',
      locale: 'en',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/content/article/${art.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Patched Article' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(article).where(eq(article.id, art.id));
    expect(afterPatch.title).toBe('Patched Article');
    expect(afterPatch.status).toBe('published');
    expect(afterPatch.deck).toBe('Special Deck');

    const putRes = await app.request(`/api/v1/admin/content/article/${art.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Put Article' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(article).where(eq(article.id, art.id));
    expect(afterPut.title).toBe('Put Article');
    expect(afterPut.status).toBe('published');
  });

  // 3. News
  it('news edit retains published status and eventDate on PATCH and PUT', async () => {
    const originalDate = new Date('2026-10-15T10:00:00Z');
    const [n] = await db.insert(newsPost).values({
      slug: 'test-news',
      title: 'Original News',
      body: 'News content',
      status: 'published',
      eventDate: originalDate,
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/content/news/${n.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Patched News' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(newsPost).where(eq(newsPost.id, n.id));
    expect(afterPatch.title).toBe('Patched News');
    expect(afterPatch.status).toBe('published');
    expect(new Date(afterPatch.eventDate).toISOString()).toBe(originalDate.toISOString());

    const putRes = await app.request(`/api/v1/admin/content/news/${n.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Put News' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(newsPost).where(eq(newsPost.id, n.id));
    expect(afterPut.title).toBe('Put News');
    expect(afterPut.status).toBe('published');
  });

  // 4. FAQ
  it('faq edit retains published status on PATCH and PUT', async () => {
    const [f] = await db.insert(faq).values({
      groupKey: 'faq-r04-test',
      question: 'Original Question?',
      answer: 'Original Answer.',
      status: 'published',
      locale: 'en',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/content/faq/${f.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ answer: 'Patched Answer.' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(faq).where(eq(faq.id, f.id));
    expect(afterPatch.answer).toBe('Patched Answer.');
    expect(afterPatch.status).toBe('published');
    expect(afterPatch.question).toBe('Original Question?');

    const putRes = await app.request(`/api/v1/admin/content/faq/${f.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ answer: 'Put Answer.' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(faq).where(eq(faq.id, f.id));
    expect(afterPut.answer).toBe('Put Answer.');
    expect(afterPut.status).toBe('published');
  });

  // 5. Product
  it('product edit retains isComingSoon, featured, specs and published status on PATCH and PUT', async () => {
    const [prod] = await db.insert(product).values({
      sku: 'TM-PROD-TEST-1',
      slug: 'tm-prod-test-1',
      name: 'Original Product Name',
      brandId,
      categoryId: catId,
      status: 'published',
      featured: true,
      isComingSoon: true,
      specs: { Capacity: '32GB', Speed: '6400MHz' },
    }).returning();

    // PATCH
    const patchRes = await app.request(`/api/v1/admin/products/${prod.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ name: 'Patched Product Name' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(product).where(eq(product.id, prod.id));
    expect(afterPatch.name).toBe('Patched Product Name');
    expect(afterPatch.status).toBe('published');
    expect(afterPatch.featured).toBe(true);
    expect(afterPatch.isComingSoon).toBe(true);
    expect(afterPatch.specs).toEqual({ Capacity: '32GB', Speed: '6400MHz' });

    // PUT
    const putRes = await app.request(`/api/v1/admin/products/${prod.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ name: 'Put Product Name' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(product).where(eq(product.id, prod.id));
    expect(afterPut.name).toBe('Put Product Name');
    expect(afterPut.status).toBe('published');
    expect(afterPut.featured).toBe(true);
    expect(afterPut.isComingSoon).toBe(true);
  });

  // 6. Product Variant
  it('variant edit retains stock, status, and attrs on PATCH and PUT', async () => {
    const [prod] = await db.insert(product).values({
      sku: 'TM-VAR-PARENT',
      slug: 'tm-var-parent',
      name: 'Parent Product',
      brandId,
      categoryId: catId,
    }).returning();

    const [v] = await db.insert(productVariant).values({
      productId: prod.id,
      sku: 'TM-VAR-001',
      attrs: { capacity: '64GB', speed: '6000MT/s', finish: 'Black' },
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/products/${prod.id}/variants/${v.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ priceUsd: 149.99 }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(productVariant).where(eq(productVariant.id, v.id));
    expect(afterPatch.attrs.priceUsd).toBe(149.99);
    expect(afterPatch.attrs.capacity).toBe('64GB');
    expect(afterPatch.attrs.speed).toBe('6000MT/s');

    const putRes = await app.request(`/api/v1/admin/products/${prod.id}/variants/${v.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ priceUsd: 139.99 }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(productVariant).where(eq(productVariant.id, v.id));
    expect(afterPut.attrs.priceUsd).toBe(139.99);
    expect(afterPut.attrs.capacity).toBe('64GB');
  });

  // 7. Compatibility Rule
  it('compatibility edit retains memoryGen and maxGb on PATCH and PUT', async () => {
    const [rule] = await db.insert(compatibilityRule).values({
      deviceType: 'laptop',
      deviceBrand: 'Lenovo',
      deviceModel: 'ThinkPad T14',
      memoryGen: 'DDR5',
      maxGb: 64,
      speed: '4800',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/compatibility/${rule.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ speed: '5600' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(compatibilityRule).where(eq(compatibilityRule.id, rule.id));
    expect(afterPatch.speed).toBe('5600');
    expect(afterPatch.memoryGen).toBe('DDR5');
    expect(afterPatch.maxGb).toBe(64);

    const putRes = await app.request(`/api/v1/admin/compatibility/${rule.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ speed: '6400' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(compatibilityRule).where(eq(compatibilityRule.id, rule.id));
    expect(afterPut.speed).toBe('6400');
    expect(afterPut.memoryGen).toBe('DDR5');
  });

  // 8. Distributor
  it('distributor edit retains status, region, and cities on PATCH and PUT', async () => {
    const [dist] = await db.insert(distributor).values({
      name: 'Tokyo Distribution Hub',
      country: 'Japan',
      region: 'asia_pacific',
      status: 'active',
      cities: ['Tokyo', 'Osaka'],
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/distributors/${dist.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ name: 'Tokyo Distribution Hub North' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(distributor).where(eq(distributor.id, dist.id));
    expect(afterPatch.name).toBe('Tokyo Distribution Hub North');
    expect(afterPatch.status).toBe('active');
    expect(afterPatch.region).toBe('asia_pacific');
    expect(afterPatch.cities).toEqual(['Tokyo', 'Osaka']);

    const putRes = await app.request(`/api/v1/admin/distributors/${dist.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ name: 'Tokyo Distribution Hub Main' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(distributor).where(eq(distributor.id, dist.id));
    expect(afterPut.name).toBe('Tokyo Distribution Hub Main');
    expect(afterPut.status).toBe('active');
  });

  // 9. Marketplace Listing
  it('marketplace listing edit retains platform and country on PATCH and PUT', async () => {
    const [listing] = await db.insert(marketplaceListing).values({
      platform: 'Amazon',
      country: 'US',
      url: 'https://amazon.com/dp/B000000001',
      sellerName: 'TwinMOS Direct',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/marketplace-listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ url: 'https://amazon.com/dp/B000000002' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(marketplaceListing).where(eq(marketplaceListing.id, listing.id));
    expect(afterPatch.url).toBe('https://amazon.com/dp/B000000002');
    expect(afterPatch.platform).toBe('Amazon');
    expect(afterPatch.country).toBe('US');

    const putRes = await app.request(`/api/v1/admin/marketplace-listings/${listing.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ url: 'https://amazon.com/dp/B000000003' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(marketplaceListing).where(eq(marketplaceListing.id, listing.id));
    expect(afterPut.url).toBe('https://amazon.com/dp/B000000003');
    expect(afterPut.platform).toBe('Amazon');
  });

  // 10. Glossary Term
  it('glossary term edit retains category and locale on PATCH and PUT', async () => {
    const [g] = await db.insert(glossaryTerm).values({
      term: 'ECC',
      definition: 'Error-correcting code memory.',
      letter: 'E',
      explainerSlug: 'ecc-memory',
      locale: 'en',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/glossary/${g.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ definition: 'Patched ECC definition.' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(glossaryTerm).where(eq(glossaryTerm.id, g.id));
    expect(afterPatch.definition).toBe('Patched ECC definition.');
    expect(afterPatch.letter).toBe('E');
    expect(afterPatch.explainerSlug).toBe('ecc-memory');
    expect(afterPatch.locale).toBe('en');

    const putRes = await app.request(`/api/v1/admin/glossary/${g.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ definition: 'Put ECC definition.' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(glossaryTerm).where(eq(glossaryTerm.id, g.id));
    expect(afterPut.definition).toBe('Put ECC definition.');
    expect(afterPut.letter).toBe('E');
    expect(afterPut.explainerSlug).toBe('ecc-memory');
    expect(afterPut.locale).toBe('en');
  });

  // 11. Office Location (specifically verify sort and role are retained)
  it('office edit retains sort and role on PATCH and PUT', async () => {
    const [off] = await db.insert(office).values({
      role: 'Global HQ',
      title: 'Dubai Headquarters',
      entity: 'TwinMOS Technologies Middle East',
      address: 'JAFZA One, Tower A, Dubai',
      sort: 10,
      locale: 'en',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/offices/${off.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ address: 'JAFZA One, Tower B, Dubai' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(office).where(eq(office.id, off.id));
    expect(afterPatch.address).toBe('JAFZA One, Tower B, Dubai');
    expect(afterPatch.sort).toBe(10);
    expect(afterPatch.role).toBe('Global HQ');

    const putRes = await app.request(`/api/v1/admin/offices/${off.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ address: 'JAFZA One, Tower C, Dubai' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(office).where(eq(office.id, off.id));
    expect(afterPut.address).toBe('JAFZA One, Tower C, Dubai');
    expect(afterPut.sort).toBe(10);
    expect(afterPut.role).toBe('Global HQ');
  });

  // 12. Testimonial (specifically verify permissionFlag: true does NOT revert to false)
  it('testimonial edit retains permissionFlag: true and sort on PATCH and PUT (Probe X3b)', async () => {
    const [t] = await db.insert(testimonial).values({
      author: 'Sarah Jenkins',
      role: 'CTO',
      context: 'TechCorp',
      quote: 'Exceptional performance in our production servers.',
      sort: 5,
      permissionFlag: true,
      locale: 'en',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ quote: 'Even better performance in our servers.' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(testimonial).where(eq(testimonial.id, t.id));
    expect(afterPatch.quote).toBe('Even better performance in our servers.');
    expect(afterPatch.permissionFlag).toBe(true); // MUST NOT revert to false!
    expect(afterPatch.sort).toBe(5);
    expect(afterPatch.author).toBe('Sarah Jenkins');

    const putRes = await app.request(`/api/v1/admin/testimonials/${t.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ quote: 'World-class memory modules.' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(testimonial).where(eq(testimonial.id, t.id));
    expect(afterPut.quote).toBe('World-class memory modules.');
    expect(afterPut.permissionFlag).toBe(true);
    expect(afterPut.sort).toBe(5);
  });

  // 13. Policy (specifically verify published status does NOT revert to draft)
  it('policy edit retains status: published and version on PATCH and PUT (Probe X3)', async () => {
    const [pol] = await db.insert(policyDocument).values({
      slug: 'privacy-policy-r04',
      title: 'Privacy Policy',
      body: 'Standard privacy text.',
      version: '2.0',
      status: 'published',
      locale: 'en',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/policies/${pol.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ body: 'Updated privacy text with cookie details.' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(policyDocument).where(eq(policyDocument.id, pol.id));
    expect(afterPatch.body).toBe('Updated privacy text with cookie details.');
    expect(afterPatch.status).toBe('published'); // MUST NOT revert to 'draft'!
    expect(afterPatch.version).toBe('2.0');

    const putRes = await app.request(`/api/v1/admin/policies/${pol.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ body: 'Final privacy text revision.' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(policyDocument).where(eq(policyDocument.id, pol.id));
    expect(afterPut.body).toBe('Final privacy text revision.');
    expect(afterPut.status).toBe('published');
    expect(afterPut.version).toBe('2.0');
  });

  // 14. Custom Form Definition (isActive: false does not revert to true)
  it('custom form edit retains isActive: false and routingEmail on PATCH and PUT', async () => {
    const [f] = await db.insert(formDefinition).values({
      type: 'special_rma',
      title: 'Special RMA Form',
      routingEmail: 'support@twinmos.dev',
      isActive: false,
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/forms/${f.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Special RMA Intake Form' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(formDefinition).where(eq(formDefinition.id, f.id));
    expect(afterPatch.title).toBe('Special RMA Intake Form');
    expect(afterPatch.isActive).toBe(false); // MUST NOT revert to true!
    expect(afterPatch.routingEmail).toBe('support@twinmos.dev');

    const putRes = await app.request(`/api/v1/admin/forms/${f.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Special RMA Intake Form Put' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(formDefinition).where(eq(formDefinition.id, f.id));
    expect(afterPut.title).toBe('Special RMA Intake Form Put');
    expect(afterPut.isActive).toBe(false);
  });

  // 15. Form Field (required: true does not revert to false)
  it('form field edit retains required: true and type on PATCH and PUT', async () => {
    const [f] = await db.insert(formDefinition).values({
      type: 'feedback_form',
      title: 'Feedback Form',
      isActive: true,
    }).returning();

    const [field] = await db.insert(formField).values({
      formId: f.id,
      name: 'operating_system',
      label: 'Operating System',
      type: 'select',
      required: true,
      sort: 3,
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/forms/${f.id}/fields/${field.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ label: 'Client Operating System' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(formField).where(eq(formField.id, field.id));
    expect(afterPatch.label).toBe('Client Operating System');
    expect(afterPatch.required).toBe(true); // MUST NOT revert to false!
    expect(afterPatch.type).toBe('select');
    expect(afterPatch.sort).toBe(3);

    const putRes = await app.request(`/api/v1/admin/forms/${f.id}/fields/${field.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ label: 'Host Operating System' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(formField).where(eq(formField.id, field.id));
    expect(afterPut.label).toBe('Host Operating System');
    expect(afterPut.required).toBe(true);
  });



  // 16. Nav Menu
  it('nav menu edit retains locale: ar on PATCH and PUT', async () => {
    const [menu] = await db.insert(navMenu).values({
      code: 'footer-ar',
      title: 'Footer Arabic',
      locale: 'ar',
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/navigation/menus/${menu.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Footer Arabic Modified' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(navMenu).where(eq(navMenu.id, menu.id));
    expect(afterPatch.title).toBe('Footer Arabic Modified');
    expect(afterPatch.locale).toBe('ar'); // MUST NOT revert to default 'en'!

    const putRes = await app.request(`/api/v1/admin/navigation/menus/${menu.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Footer Arabic Final' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(navMenu).where(eq(navMenu.id, menu.id));
    expect(afterPut.title).toBe('Footer Arabic Final');
    expect(afterPut.locale).toBe('ar');
  });

  // 17. Nav Item (sort & metadata retained)
  it('nav item edit retains sort: 99, metadata and targetType on PATCH and PUT', async () => {
    const [menu] = await db.insert(navMenu).values({
      code: 'main-nav-test',
      title: 'Main Navigation',
    }).returning();

    const [item] = await db.insert(navItem).values({
      menuId: menu.id,
      title: 'Gaming Products',
      targetType: 'category',
      targetId: 'gaming',
      sort: 99,
      metadata: { badge: 'HOT', highlight: true },
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/navigation/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Gaming Hardware' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(navItem).where(eq(navItem.id, item.id));
    expect(afterPatch.title).toBe('Gaming Hardware');
    expect(afterPatch.sort).toBe(99); // MUST NOT revert to default 0!
    expect(afterPatch.metadata).toEqual({ badge: 'HOT', highlight: true }); // MUST NOT revert to default {}!
    expect(afterPatch.targetType).toBe('category');

    const putRes = await app.request(`/api/v1/admin/navigation/items/${item.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Gaming Gear' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(navItem).where(eq(navItem.id, item.id));
    expect(afterPut.title).toBe('Gaming Gear');
    expect(afterPut.sort).toBe(99);
    expect(afterPut.metadata).toEqual({ badge: 'HOT', highlight: true });
  });

  // 18. Job Posting
  it('job posting edit retains published status and equalOpportunity on PATCH and PUT', async () => {
    const [jp] = await db.insert(jobPosting).values({
      title: 'Senior Firmware Engineer',
      dept: 'Engineering',
      location: 'Dubai HQ',
      type: 'full_time',
      level: 'senior',
      status: 'published',
      body: 'Firmware development for next-gen NVMe SSDs.',
      equalOpportunity: true,
    }).returning();

    const patchRes = await app.request(`/api/v1/admin/job-postings/${jp.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Lead Firmware Engineer' }),
    });
    expect(patchRes.status).toBe(200);
    const [afterPatch] = await db.select().from(jobPosting).where(eq(jobPosting.id, jp.id));
    expect(afterPatch.title).toBe('Lead Firmware Engineer');
    expect(afterPatch.status).toBe('published'); // MUST NOT revert to 'draft'!
    expect(afterPatch.equalOpportunity).toBe(true);

    const putRes = await app.request(`/api/v1/admin/job-postings/${jp.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'Principal Firmware Engineer' }),
    });
    expect(putRes.status).toBe(200);
    const [afterPut] = await db.select().from(jobPosting).where(eq(jobPosting.id, jp.id));
    expect(afterPut.title).toBe('Principal Firmware Engineer');
    expect(afterPut.status).toBe('published');
    expect(afterPut.equalOpportunity).toBe(true);
  });
});
