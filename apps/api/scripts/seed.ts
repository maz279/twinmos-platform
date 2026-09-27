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
console.log('[seed] done');
process.exit(0);
