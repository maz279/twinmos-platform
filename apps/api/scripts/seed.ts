// Seeds the dev database: first admin user (Better Auth-managed password) + reference catalog rows.
// Credentials come from env: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (defaults are DEV ONLY).
// Usage: npm run db:seed
import { eq } from 'drizzle-orm';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb, brand, category, locale, product, user } from '@twinmos/db';
import * as schema from '@twinmos/db';

const db = createDb();

const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});

const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@twinmos.dev';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'DevOnly-ChangeMe-2026!';

// 1) first admin user — created through Better Auth so the password hash format is correct
const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
if (existing.length === 0) {
  await auth.api.signUpEmail({ body: { email, password, name: 'Platform Admin' } });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, email));
  console.log('[seed] admin user created: ' + email + ' (super_admin)');
} else {
  console.log('[seed] admin user already present: ' + email);
}

// 2) reference locale rows (Phase 4 activates more)
const en = await db.select().from(locale).limit(1);
if (en.length === 0) {
  await db.insert(locale).values([
    // 9-locale reconciled plan (BN removed per post-remediation fact base)
    { code: 'en', name: 'English', dir: 'ltr', active: true },
    { code: 'ar', name: 'العربية', dir: 'rtl', active: false },
    { code: 'hi', name: 'हिन्दी', dir: 'ltr', active: false },
    { code: 'ru', name: 'Русский', dir: 'ltr', active: false },
    { code: 'zh-cn', name: '简体中文', dir: 'ltr', active: false },
    { code: 'fr', name: 'Français', dir: 'ltr', active: false },
    { code: 'es', name: 'Español', dir: 'ltr', active: false },
    { code: 'pt', name: 'Português', dir: 'ltr', active: false },
    { code: 'de', name: 'Deutsch', dir: 'ltr', active: false },
  ]);
  console.log('[seed] locale rows created');
}

// 3) reference catalog rows (Phase 1 replaces with the full products.json import)
const anyProduct = await db.select({ id: product.id }).from(product).limit(1);
if (anyProduct.length === 0) {
  const [b] = await db.insert(brand).values({ slug: 'voltx', name: 'VOLTX' }).returning({ id: brand.id });
  const [c] = await db.insert(category).values({ slug: 'dram-gaming', name: 'Gaming DRAM' }).returning({ id: category.id });
  await db.insert(product).values([
    { sku: 'VLT-DDR5-16G', slug: 'voltx-ddr5-udimm-16gb', name: 'VOLTX DDR5 U-DIMM 16GB', brandId: b.id, categoryId: c.id, status: 'published', specs: { capacity: '16GB', speed: '6000MT/s' }, badges: ['XMP 3.0'] },
    { sku: 'VLT-DDR5-32G', slug: 'voltx-ddr5-udimm-32gb', name: 'VOLTX DDR5 U-DIMM 32GB', brandId: b.id, categoryId: c.id, status: 'draft', specs: { capacity: '32GB', speed: '6000MT/s' }, badges: [] },
  ]);
  console.log('[seed] reference brand/category/products created');
}

// 4) P5 demo partner org + member + gated asset + registry serials (dev only).
const { partnerOrg, partnerMember, partnerAsset, serialRegistry } = await import('@twinmos/db');
const anyOrg = await db.select({ id: partnerOrg.id }).from(partnerOrg).limit(1);
if (anyOrg.length === 0) {
  const [org] = await db.insert(partnerOrg).values({
    name: 'Gulf Channel Trading (demo)', type: 'distributor', status: 'active',
    country: 'United Arab Emirates', contactEmail: 'channel@example.com',
    note: 'Seeded demo distributor for portal verification.',
  }).returning();
  // attach the seeded admin as the org owner so the demo login works out of the box
  const adminRow = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (adminRow[0]) {
    await db.insert(partnerMember).values({ orgId: org.id, userId: adminRow[0].id, role: 'owner' }).onConflictDoNothing();
  }
  // a global price-file asset visible to distributors (file itself lands on first admin upload in dev flows)
  await db.insert(partnerAsset).values({
    orgId: null, category: 'price_file', title: 'Q4 2026 Distributor Price List (demo)',
    fileKey: 'demo-price-list.pdf', mime: 'application/pdf', bytes: 0,
    visibleToTypes: ['distributor'],
  });
  // registry serials for the anti-counterfeit demo
  await db.insert(serialRegistry).values([
    { serial: 'TM-DEMO-0001', sku: 'VLT-DDR5-32G', manufacturedAt: new Date('2026-06-01') },
    { serial: 'TM-DEMO-0002', sku: 'NVCXP2TBG52280', manufacturedAt: new Date('2026-07-15') },
  ]).onConflictDoNothing();
  console.log('[seed] demo partner org + member + price asset + 2 serials created');
}

// 5) RTL demo strings — tooling/seed-ar.json (Arabic hero/landing) so a fresh
// dev DB renders the /ar.html demo WITHOUT a manual admin import. Found in the
// P5 audit iteration: the demo lived only in whatever DB the P4 loop used and
// silently vanished on re-seed (i18n bundle returned strings:{}).
{
  const { translation } = schema;
  const existing = await db.select({ k: translation.key }).from(translation).where(eq(translation.locale, 'ar')).limit(1);
  if (existing.length === 0) {
    try {
      const { readFileSync } = await import('node:fs');
      const { join, dirname } = await import('node:path');
      const { fileURLToPath } = await import('node:url');
      const arPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'tooling', 'seed-ar.json');
      const ar = JSON.parse(readFileSync(arPath, 'utf8')) as { locale: string; ns?: string; strings: Record<string, string> };
      const ns = ar.ns ?? 'common';
      const rows = Object.entries(ar.strings).map(([key, value]) => ({ locale: 'ar', ns, key, value }));
      if (rows.length) {
        await db.insert(translation).values(rows).onConflictDoNothing();
        console.log(`[seed] ar demo translations imported (${rows.length} strings)`);
      }
    } catch {
      console.log('[seed] seed-ar.json not found or unreadable — skipping ar demo strings');
    }
  }
}
console.log('[seed] done');
process.exit(0);
