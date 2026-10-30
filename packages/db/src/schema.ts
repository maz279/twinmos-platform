// TwinMOS platform schema — Postgres dialect (Drizzle).
// SECURITY: application code uses the Drizzle query builder only; every value is
// parameter-bound. Never assemble SQL from strings (repo lint + review enforce).
import { pgTable, pgEnum, text, varchar, integer, boolean, timestamp, jsonb, serial, numeric, uniqueIndex, index, date } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['super_admin', 'admin', 'editor', 'author', 'viewer', 'member']);
export const contentStatusEnum = pgEnum('content_status', ['draft', 'in_review', 'scheduled', 'published', 'archived']);
export const rmaStatusEnum = pgEnum('rma_status', ['submitted', 'under_review', 'approved', 'in_repair', 'shipped', 'delivered', 'closed']);
export const submissionStatusEnum = pgEnum('submission_status', ['new', 'assigned', 'in_progress', 'resolved', 'closed', 'spam']);

const ts = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

// ---- auth (Better Auth managed tables + role) ----
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  role: roleEnum('role').notNull().default('member'),
  image: text('image'),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false), // P7+ MFA flag (Better Auth twoFactor plugin)
  // P1.4: invited accounts that received a system-generated temporary password
  // must rotate it before using the console (server-enforced in app.ts).
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires', { withTimezone: true }),
  failedLoginCount: integer('failed_login_count').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** P7+: per-user TOTP state (Better Auth twoFactor plugin table, migration 0006). */
export const twoFactor = pgTable('two_factor', {
  id: text('id').primaryKey(),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  verified: boolean('verified').notNull().default(true),
  failedVerificationCount: integer('failed_verification_count').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
}, (t) => [uniqueIndex('two_factor_user_id_unique').on(t.userId)]);
export const session = pgTable('session', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(), expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'), userAgent: text('user_agent'),
  impersonatedBy: text('impersonated_by'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const account = pgTable('account', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(), providerId: text('provider_id').notNull(),
  accessToken: text('access_token'), refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  idToken: text('id_token'),
  scope: text('scope'), password: text('password'), createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const verification = pgTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- platform ----
export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(), actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 60 }).notNull(), entity: varchar('entity', { length: 40 }).notNull(),
  entityId: text('entity_id'), diff: jsonb('diff'), requestId: text('request_id'), ip: text('ip'), at: ts(),
}, (t) => [index('audit_entity_idx').on(t.entity, t.entityId), index('audit_at_idx').on(t.at)]);

export const mediaAsset = pgTable('media_asset', {
  id: serial('id').primaryKey(), key: text('key').notNull().unique(), kind: varchar('kind', { length: 20 }).notNull().default('image'),
  width: integer('width'), height: integer('height'), alt: text('alt'), uploadedBy: text('uploaded_by').references(() => user.id, { onDelete: 'set null' }),
  folderId: integer('folder_id').references((): AnyPgColumn => mediaFolder.id, { onDelete: 'set null' }),
  variants: jsonb('variants').default({}),
  focalPoint: jsonb('focal_point').default({ x: 50, y: 50 }),
  isDecorative: boolean('is_decorative').notNull().default(false),
  meta: jsonb('meta').default({}), createdAt: ts(),
}, (t) => [index('media_asset_folder_idx').on(t.folderId)]);
// Phase 4.3 — virtual folder hierarchy for the media library (products/,
// banners/, news/…). Deleting a folder keeps its assets (folder_id → null).
export const mediaFolder = pgTable('media_folder', {
  id: serial('id').primaryKey(), name: text('name').notNull(),
  parentId: integer('parent_id').references((): AnyPgColumn => mediaFolder.id, { onDelete: 'cascade' }),
  createdAt: ts(),
}, (t) => [index('media_folder_parent_idx').on(t.parentId)]);
export const setting = pgTable('setting', { key: text('key').primaryKey(), value: jsonb('value').notNull(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow() });
export const redirect = pgTable('redirect', { id: serial('id').primaryKey(), from: text('from').notNull().unique(), to: text('to').notNull(), code: integer('code').notNull().default(301) });
export const locale = pgTable('locale', { code: varchar('code', { length: 10 }).primaryKey(), name: text('name').notNull(), dir: varchar('dir', { length: 3 }).notNull().default('ltr'), active: boolean('active').notNull().default(false) });

// ---- content ----
export const article = pgTable('article', {
  id: serial('id').primaryKey(), slug: varchar('slug', { length: 120 }).notNull(), locale: varchar('locale', { length: 10 }).notNull().default('en'),
  title: text('title').notNull(), deck: text('deck'), body: text('body').notNull().default(''),
  category: varchar('category', { length: 40 }).notNull().default('Article'), tags: text('tags').array().default([]),
  status: contentStatusEnum('status').notNull().default('draft'),
  publishAt: timestamp('publish_at', { withTimezone: true }),
  unpublishAt: timestamp('unpublish_at', { withTimezone: true }),
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }), heroMediaId: integer('hero_media_id').references(() => mediaAsset.id, { onDelete: 'set null' }),
  structuredBody: jsonb('structured_body').default([]),
  readingTimeMin: integer('reading_time_min'),
  version: integer('version').notNull().default(1),
  seo: jsonb('seo').default({}), revisionOf: integer('revision_of'), createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  source: text('source'),
  approver: text('approver'),
  translationGroup: varchar('translation_group', { length: 60 }),
}, (t) => [uniqueIndex('article_slug_locale_uq').on(t.slug, t.locale), index('article_status_idx').on(t.status, t.publishAt), index('article_translation_group_idx').on(t.translationGroup)]);

export const page = pgTable('page', {
  id: serial('id').primaryKey(), slug: varchar('slug', { length: 120 }).notNull(), locale: varchar('locale', { length: 10 }).notNull().default('en'),
  title: text('title').notNull(), blocks: jsonb('blocks').notNull().default([]), status: contentStatusEnum('status').notNull().default('draft'),
  path: varchar('path', { length: 200 }),
  template: varchar('template', { length: 60 }).notNull().default('default'),
  parentId: integer('parent_id').references((): AnyPgColumn => page.id, { onDelete: 'set null' }),
  sort: integer('sort').notNull().default(0),
  translationGroup: varchar('translation_group', { length: 60 }),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  ogMediaId: integer('og_media_id').references(() => mediaAsset.id, { onDelete: 'set null' }),
  noindex: boolean('noindex').notNull().default(false),
  legacyPaths: text('legacy_paths').array().default([]),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  publishAt: timestamp('publish_at', { withTimezone: true }),
  unpublishAt: timestamp('unpublish_at', { withTimezone: true }),
  version: integer('version').notNull().default(1),
  seo: jsonb('seo').default({}), createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(), deletedAt: timestamp('deleted_at', { withTimezone: true }),
  source: text('source'),
  approver: text('approver'),
}, (t) => [
  uniqueIndex('page_slug_locale_uq').on(t.slug, t.locale),
  uniqueIndex('page_locale_path_uq').on(t.locale, t.path),
  index('page_path_locale_idx').on(t.path, t.locale),
]);

export const newsPost = pgTable('news_post', {
  id: serial('id').primaryKey(), slug: varchar('slug', { length: 120 }).notNull(), locale: varchar('locale', { length: 10 }).notNull().default('en'),
  title: text('title').notNull(), body: text('body').notNull().default(''), tag: text('tag'), eventDate: timestamp('event_date', { withTimezone: true }),
  status: contentStatusEnum('status').notNull().default('draft'),
  publishAt: timestamp('publish_at', { withTimezone: true }),
  unpublishAt: timestamp('unpublish_at', { withTimezone: true }),
  heroMediaId: integer('hero_media_id'),
  createdAt: ts(), deletedAt: timestamp('deleted_at', { withTimezone: true }),
  seo: jsonb('seo').default({}),
  source: text('source'),
  approver: text('approver'),
  translationGroup: varchar('translation_group', { length: 60 }),
}, (t) => [uniqueIndex('news_slug_locale_uq').on(t.slug, t.locale), index('news_translation_group_idx').on(t.translationGroup)]);

export const faq = pgTable('faq', {
  id: serial('id').primaryKey(), groupKey: varchar('group_key', { length: 40 }).notNull(), locale: varchar('locale', { length: 10 }).notNull().default('en'),
  question: text('question').notNull(), answer: text('answer').notNull(), label: varchar('label', { length: 120 }), sort: integer('sort').notNull().default(0),
  status: contentStatusEnum('status').notNull().default('published'),
  publishAt: timestamp('publish_at', { withTimezone: true }),
  unpublishAt: timestamp('unpublish_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  source: text('source'),
  approver: text('approver'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  version: integer('version').notNull().default(1),
}, (t) => [
  uniqueIndex('faq_question_locale_uq').on(t.question, t.locale),
  index('faq_group_locale_idx').on(t.groupKey, t.locale),
]);

// P3: immutable snapshot taken on every publish — enables one-click rollback.
export const contentRevision = pgTable('content_revision', {
  id: serial('id').primaryKey(),
  entity: varchar('entity', { length: 20 }).notNull(), // article | news | page | faq
  entityId: integer('entity_id').notNull(),
  snapshot: jsonb('snapshot').notNull(),
  actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt: ts(),
}, (t) => [index('content_revision_entity_idx').on(t.entity, t.entityId)]);

// P4: translation strings — (locale, ns, key) unique; ns defaults to 'common'.
export const translation = pgTable('translation', {
  id: serial('id').primaryKey(),
  locale: varchar('locale', { length: 10 }).notNull(),
  ns: varchar('ns', { length: 60 }).notNull().default('common'),
  key: varchar('key', { length: 120 }).notNull(),
  value: text('value').notNull(),
  updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('translation_locale_ns_key_uq').on(t.locale, t.ns, t.key)]);

// ---- catalog ----
export const brand = pgTable('brand', { id: serial('id').primaryKey(), slug: varchar('slug', { length: 60 }).notNull().unique(), name: text('name').notNull() });
export const category = pgTable('category', {
  id: serial('id').primaryKey(), slug: varchar('slug', { length: 60 }).notNull().unique(), name: text('name').notNull(),
  parentId: integer('parent_id'), sort: integer('sort').notNull().default(0),
});
export const product = pgTable('product', {
  id: serial('id').primaryKey(), sku: varchar('sku', { length: 40 }).notNull().unique(), slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: text('name').notNull(), brandId: integer('brand_id').references(() => brand.id, { onDelete: 'restrict' }),
  categoryId: integer('category_id').references(() => category.id, { onDelete: 'restrict' }),
  status: contentStatusEnum('status').notNull().default('draft'),
  publishAt: timestamp('publish_at', { withTimezone: true }),
  unpublishAt: timestamp('unpublish_at', { withTimezone: true }),
  specs: jsonb('specs').notNull().default({}),
  // 0007: rich product management — marketing copy + list pricing
  description: text('description').notNull().default(''),
  priceUsd: numeric('price_usd', { precision: 10, scale: 2 }), currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  // 0015: public warranty terms (mirrors the prototype catalog's "warranty" string,
  // e.g. "3 Years" / "Lifetime") — surfaced on the PDP via the CMS merge layer.
  warranty: varchar('warranty', { length: 80 }),
  // 0016: storefront card line + shop facets — the fields the public grid/filter
  // UI renders (TM.products: shortSpec, gen, cap, interface, form). Facets use a
  // jsonb bag so the vocabulary can grow without migrations.
  shortSpec: text('short_spec'), facets: jsonb('facets').notNull().default({}),
  heroMediaId: integer('hero_media_id').references(() => mediaAsset.id, { onDelete: 'set null' }),
  gallery: integer('gallery').array().default([]), datasheets: jsonb('datasheets').default([]), badges: text('badges').array().default([]),
  featured: boolean('featured').notNull().default(false),
  launchDate: timestamp('launch_date', { withTimezone: true }),
  isComingSoon: boolean('is_coming_soon').notNull().default(false),
  warrantyTier: varchar('warranty_tier', { length: 40 }),
  specsDictionary: jsonb('specs_dictionary').default({}),
  version: integer('version').notNull().default(1),
  releasedAt: timestamp('released_at', { withTimezone: true }), createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  source: text('source'),
  approver: text('approver'),
  translationGroup: varchar('translation_group', { length: 60 }),
}, (t) => [index('product_status_idx').on(t.status), index('product_cat_idx').on(t.categoryId), index('product_translation_group_idx').on(t.translationGroup)]);
export const compatibilityRule = pgTable('compatibility_rule', {
  id: serial('id').primaryKey(), deviceBrand: text('device_brand').notNull(), deviceModel: text('device_model').notNull(),
  memoryGen: varchar('memory_gen', { length: 12 }), formFactor: varchar('form_factor', { length: 24 }), maxGb: integer('max_gb'), notes: text('notes'),
  // 0017: full finder contract — the public compatibility page renders
  // {type → brand → model{slots, speed, recommended cats, SSD upgrade}}.
  deviceType: varchar('device_type', { length: 20 }).notNull().default('laptop'),
  slots: integer('slots'), speed: varchar('speed', { length: 30 }),
  cats: text('cats').array().notNull().default([]),
  ssdNote: varchar('ssd_note', { length: 120 }), ssdCats: text('ssd_cats').array().notNull().default([]),
  qvlStatus: varchar('qvl_status', { length: 30 }).notNull().default('certified'),
}, (t) => [index('compat_device_idx').on(t.deviceBrand, t.deviceModel)]);
export const productVariant = pgTable('product_variant', {
  id: serial('id').primaryKey(), productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  attrs: jsonb('attrs').notNull().default({}), sku: varchar('sku', { length: 40 }).notNull().unique(),
});

// ---- channel ----
export const distributor = pgTable('distributor', {
  id: serial('id').primaryKey(), name: text('name').notNull(), country: varchar('country', { length: 60 }).notNull(),
  region: varchar('region', { length: 30 }).notNull(), status: varchar('status', { length: 20 }).notNull().default('authorized'),
  cities: text('cities').array().default([]), contact: jsonb('contact').default({}), note: text('note'), createdAt: ts(),
  isoCountry: varchar('iso_country', { length: 2 }),
  tagline: text('tagline'),
  ctaConfig: jsonb('cta_config').default({}),
  sort: integer('sort').notNull().default(0),
  source: text('source'),
  approver: text('approver'),
}, (t) => [index('distributor_region_idx').on(t.region, t.country)]);
export const marketplaceListing = pgTable('marketplace_listing', {
  id: serial('id').primaryKey(), platform: varchar('platform', { length: 40 }).notNull(), url: text('url').notNull(),
  country: varchar('country', { length: 60 }), verifiedAt: timestamp('verified_at', { withTimezone: true }), createdAt: ts(),
  description: text('description'),
  ctaLabel: varchar('cta_label', { length: 60 }),
  sort: integer('sort').notNull().default(0),
});

// ---- support ----
export const formSubmission = pgTable('form_submission', {
  id: serial('id').primaryKey(), type: varchar('type', { length: 40 }).notNull(), payload: jsonb('payload').notNull().default({}),
  email: text('email').notNull(), status: submissionStatusEnum('status').notNull().default('new'),
  assigneeId: text('assignee_id').references(() => user.id, { onDelete: 'set null' }),
  refCode: varchar('ref_code', { length: 24 }).notNull().unique(), ip: text('ip'), ua: text('ua'), createdAt: ts(),
  // P6 (ADR-009): lead-handling — intake priority + first-response SLA deadline
  priority: varchar('priority', { length: 12 }).notNull().default('normal'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  // 0018: speed-to-lead KPI — when a staff reply first went out to the lead
  firstRespondedAt: timestamp('first_responded_at', { withTimezone: true }),
}, (t) => [index('submission_type_status_idx').on(t.type, t.status)]);

/** P6: internal collaboration notes on a lead/submission (audited). */
export const formNote = pgTable('form_note', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id').notNull().references(() => formSubmission.id, { onDelete: 'cascade' }),
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
  body: text('body').notNull(), createdAt: ts(),
}, (t) => [index('form_note_submission_idx').on(t.submissionId)]);
export const rmaRequest = pgTable('rma_request', {
  id: serial('id').primaryKey(), number: varchar('number', { length: 24 }).notNull().unique(),
  productSku: varchar('product_sku', { length: 40 }), serial: varchar('serial', { length: 60 }), issue: text('issue').notNull().default(''),
  status: rmaStatusEnum('status').notNull().default('submitted'), customer: jsonb('customer').notNull().default({}),
  warrantyTier: varchar('warranty_tier', { length: 20 }), createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  // Phase 6 completion (§6.6 card chip): the assigned technician
  assigneeId: text('assignee_id').references(() => user.id, { onDelete: 'set null' }),
}, (t) => [
  index('rma_assignee_idx').on(t.assigneeId),
  // 0035 (ZT-068): one open case per serial, enforced by the database
  uniqueIndex('rma_request_open_serial_uq').on(t.serial).where(sql`${t.serial} is not null and ${t.status} not in ('closed', 'delivered')`),
]);
export const rmaEvent = pgTable('rma_event', {
  id: serial('id').primaryKey(), rmaId: integer('rma_id').notNull().references(() => rmaRequest.id, { onDelete: 'cascade' }),
  fromStatus: rmaStatusEnum('from_status').notNull(), toStatus: rmaStatusEnum('to_status').notNull(),
  actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }), note: text('note'), at: ts(),
});
export const serialRegistry = pgTable('serial_registry', {
  serial: varchar('serial', { length: 60 }).primaryKey(), sku: varchar('sku', { length: 40 }),
  manufacturedAt: timestamp('manufactured_at', { withTimezone: true }), verifiedCount: integer('verified_count').notNull().default(0),
  // Phase 5.3: factory batch tag from the CSV ingest (§5.3 "Factory Batch")
  batch: varchar('batch', { length: 40 }),
});

// ---- P5: partner portal + anti-counterfeit ----
/** Channel org types (docs/04 §Channel; master plan P5). */
export const PARTNER_ORG_TYPES = ['distributor', 'oem', 'si'] as const;
export const PARTNER_ORG_STATUSES = ['pending', 'active', 'suspended'] as const;

export const partnerOrg = pgTable('partner_org', {
  id: serial('id').primaryKey(), name: text('name').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // distributor | oem | si
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending | active | suspended
  country: varchar('country', { length: 60 }), contactEmail: text('contact_email'), note: text('note'),
  createdAt: ts(),
}, (t) => [index('partner_org_type_status_idx').on(t.type, t.status)]);

export const partnerMember = pgTable('partner_member', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').notNull().references(() => partnerOrg.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('staff'), // owner | staff
  createdAt: ts(),
}, (t) => [uniqueIndex('partner_member_org_user_uq').on(t.orgId, t.userId)]);

/** Gated content: price files, MDF docs, portal resources. */
export const partnerAsset = pgTable('partner_asset', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => partnerOrg.id, { onDelete: 'cascade' }), // null = all orgs of the visible types
  category: varchar('category', { length: 30 }).notNull(), // price_file | mdf | resource
  title: text('title').notNull(), fileKey: text('file_key').notNull(),
  mime: varchar('mime', { length: 120 }).notNull().default('application/octet-stream'),
  bytes: integer('bytes').notNull().default(0),
  visibleToTypes: text('visible_to_types').array().notNull().default(['distributor', 'oem', 'si']),
  uploadedBy: text('uploaded_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: ts(),
}, (t) => [index('partner_asset_category_idx').on(t.category, t.orgId)]);

/** Anti-counterfeit verification log (public SN-check writes here). */
/** 0033: customer warranty registration (BRD §F8.3, BR-6.2). One ACTIVE row per
 *  serial (partial unique index in the migration). warrantyTerm is copied from
 *  the product at registration; warrantyExpiresAt null = lifetime/undetermined. */
export const productRegistration = pgTable('product_registration', {
  id: serial('id').primaryKey(),
  serial: varchar('serial', { length: 60 }).notNull().references(() => serialRegistry.serial, { onDelete: 'restrict' }),
  sku: varchar('sku', { length: 40 }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  country: varchar('country', { length: 80 }),
  purchaseDate: date('purchase_date', { mode: 'string' }).notNull(),
  retailer: varchar('retailer', { length: 120 }),
  warrantyTerm: varchar('warranty_term', { length: 80 }),
  warrantyExpiresAt: timestamp('warranty_expires_at', { withTimezone: true }),
  status: varchar('status', { length: 20 }).notNull().default('active'), // pending | active | void
  voidReason: text('void_reason'),
  // 0034 (ZT-046): e-mail ownership proof before a registration becomes active
  confirmToken: varchar('confirm_token', { length: 64 }),
  confirmExpiresAt: timestamp('confirm_expires_at', { withTimezone: true }),
  purchaseDateSource: varchar('purchase_date_source', { length: 20 }).notNull().default('self-declared'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('product_registration_email_idx').on(t.email)]);

export const snCheck = pgTable('sn_check', {
  id: serial('id').primaryKey(),
  serial: varchar('serial', { length: 60 }).notNull(), sku: varchar('sku', { length: 40 }),
  result: varchar('result', { length: 20 }).notNull(), // valid | unverified
  ip: text('ip'), ua: text('ua'),
  // Phase 5.3: ISO country from CF-IPCountry — the second anomaly signal
  // (§5.3 ">5 distinct IPs OR distinct country codes")
  country: varchar('country', { length: 8 }),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('sn_check_serial_idx').on(t.serial, t.checkedAt), index('sn_check_checked_at_idx').on(t.checkedAt), index('sn_check_country_idx').on(t.country)]);

// ---- careers ----
export const jobPosting = pgTable('job_posting', {
  id: serial('id').primaryKey(), title: text('title').notNull(), dept: varchar('dept', { length: 40 }).notNull(),
  location: varchar('location', { length: 60 }).notNull(), type: varchar('type', { length: 20 }).notNull().default('full-time'),
  level: varchar('level', { length: 20 }).notNull().default('mid'), status: contentStatusEnum('status').notNull().default('draft'),
  body: text('body').notNull().default(''), applyBy: timestamp('apply_by', { withTimezone: true }), createdAt: ts(), deletedAt: timestamp('deleted_at', { withTimezone: true }),
  // Phase 5.2: salary disclosure (BR-14.1, where legally required) + EO statement
  salaryBand: varchar('salary_band', { length: 80 }), equalOpportunity: boolean('equal_opportunity').notNull().default(true),
}, (t) => [index('job_posting_status_idx').on(t.status)]);
export const jobApplication = pgTable('job_application', {
  id: serial('id').primaryKey(), postingId: integer('posting_id').references(() => jobPosting.id, { onDelete: 'set null' }),
  payload: jsonb('payload').notNull().default({}), email: text('email').notNull(), status: submissionStatusEnum('status').notNull().default('new'),
  refCode: varchar('ref_code', { length: 24 }).notNull().unique(), createdAt: ts(),
});

/** Phase 2 §2.3: editorial review comments on content entities (migration 0009). */
export const contentComment = pgTable('content_comment', {
  id: serial('id').primaryKey(),
  entity: varchar('entity', { length: 20 }).notNull(),
  entityId: integer('entity_id').notNull(),
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
  body: text('body').notNull(),
  createdAt: ts(),
}, (t) => [index('content_comment_target_idx').on(t.entity, t.entityId)]);

/** Phase B (Task B7): outbox table for reliable publish -> revalidate pipeline */
export const outbox = pgTable('outbox', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 60 }).notNull(),
  payload: jsonb('payload').notNull().default({}),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  createdAt: ts(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
}, (t) => [
  index('outbox_status_idx').on(t.status),
  index('outbox_created_at_idx').on(t.createdAt),
]);

// ---- Phase C: Content Model Entities (C2..C6) ----
export const navMenu = pgTable('nav_menu', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 40 }).notNull(),
  title: text('title').notNull(),
  locale: varchar('locale', { length: 10 }).notNull().default('en'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('nav_menu_code_locale_uq').on(t.code, t.locale),
]);

export const navItem = pgTable('nav_item', {
  id: serial('id').primaryKey(),
  menuId: integer('menu_id').notNull().references(() => navMenu.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id').references((): AnyPgColumn => navItem.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  targetType: varchar('target_type', { length: 30 }).notNull().default('url'),
  targetUrl: text('target_url'),
  targetId: text('target_id'),
  sort: integer('sort').notNull().default(0),
  metadata: jsonb('metadata').notNull().default({}),
  icon: varchar('icon', { length: 60 }),
  badge: varchar('badge', { length: 40 }),
}, (t) => [
  uniqueIndex('nav_item_menu_parent_sort_uq').on(t.menuId, t.parentId, t.sort),
  index('nav_item_menu_idx').on(t.menuId),
  index('nav_item_parent_idx').on(t.parentId),
]);

export const glossaryTerm = pgTable('glossary_term', {
  id: serial('id').primaryKey(),
  term: text('term').notNull(),
  definition: text('definition').notNull(),
  letter: varchar('letter', { length: 2 }).notNull(),
  explainerSlug: text('explainer_slug'),
  status: contentStatusEnum('status').notNull().default('published'),
  locale: varchar('locale', { length: 10 }).notNull().default('en'),
  translationGroup: varchar('translation_group', { length: 60 }),
  source: text('source'),
  approver: text('approver'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('glossary_term_uq').on(t.term, t.locale),
  index('glossary_term_letter_idx').on(t.letter, t.locale),
  index('glossary_term_group_idx').on(t.translationGroup),
  index('glossary_term_status_idx').on(t.status),
]);

export const office = pgTable('office', {
  id: serial('id').primaryKey(),
  role: varchar('role', { length: 60 }).notNull(),
  title: text('title').notNull(),
  entity: text('entity').notNull(),
  address: text('address').notNull(),
  flag: varchar('flag', { length: 20 }),
  note: text('note'),
  sort: integer('sort').notNull().default(0),
  locale: varchar('locale', { length: 10 }).notNull().default('en'),
  status: varchar('status', { length: 20 }).notNull().default('published'),
  source: text('source'),
  approver: text('approver'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('office_title_locale_uq').on(t.title, t.locale),
  index('office_locale_sort_idx').on(t.locale, t.sort),
  index('office_status_idx').on(t.status),
]);

export const testimonial = pgTable('testimonial', {
  id: serial('id').primaryKey(),
  quote: text('quote').notNull(),
  author: text('author').notNull(),
  role: text('role'),
  context: text('context'),
  sort: integer('sort').notNull().default(0),
  permissionFlag: boolean('permission_flag').notNull().default(true),
  locale: varchar('locale', { length: 10 }).notNull().default('en'),
  status: varchar('status', { length: 20 }).notNull().default('published'),
  source: text('source'),
  approver: text('approver'),
  permissionEvidence: text('permission_evidence'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('testimonial_author_locale_uq').on(t.author, t.locale),
  index('testimonial_locale_sort_idx').on(t.locale, t.sort),
  index('testimonial_status_idx').on(t.status),
]);

export const policyDocument = pgTable('policy_document', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull(),
  title: text('title').notNull(),
  version: varchar('version', { length: 20 }).notNull().default('1.0'),
  status: contentStatusEnum('status').notNull().default('draft'),
  effectiveDate: timestamp('effective_date', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  legalApproved: boolean('legal_approved').notNull().default(false),
  approvedBy: text('approved_by'),
  changeSummary: text('change_summary'),
  summary: text('summary'),
  body: text('body').notNull().default(''),
  cookieCategories: jsonb('cookie_categories').default([]),
  locale: varchar('locale', { length: 10 }).notNull().default('en'),
  translationGroup: varchar('translation_group', { length: 60 }),
  source: text('source'),
  approver: text('approver'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('policy_doc_slug_locale_ver_uq').on(t.slug, t.locale, t.version),
  index('policy_doc_slug_locale_idx').on(t.slug, t.locale),
  index('policy_doc_status_idx').on(t.status),
  index('policy_doc_legal_idx').on(t.legalApproved),
]);

/** MS4.8: per-field entity translations applied to delivery (not just UI strings). */
export const entityTranslation = pgTable('entity_translation', {
  id: serial('id').primaryKey(),
  entity: varchar('entity', { length: 20 }).notNull(),
  entityId: integer('entity_id').notNull(),
  locale: varchar('locale', { length: 10 }).notNull(),
  field: varchar('field', { length: 60 }).notNull(),
  value: text('value').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('current'),
  sourceHash: varchar('source_hash', { length: 64 }),
  updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('entity_translation_uq').on(t.entity, t.entityId, t.locale, t.field),
  index('entity_translation_locale_idx').on(t.entity, t.locale),
]);

export const formDefinition = pgTable('form_definition', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 40 }).notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  successMessage: text('success_message'),
  errorMessage: text('error_message'),
  routingEmail: text('routing_email'),
  privacyNotice: text('privacy_notice'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const formField = pgTable('form_field', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => formDefinition.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 60 }).notNull(),
  label: text('label').notNull(),
  type: varchar('type', { length: 30 }).notNull().default('text'),
  placeholder: text('placeholder'),
  helpText: text('help_text'),
  required: boolean('required').notNull().default(false),
  options: jsonb('options').default([]),
  sort: integer('sort').notNull().default(0),
  validationRegex: text('validation_regex'),
}, (t) => [
  uniqueIndex('form_field_form_name_uq').on(t.formId, t.name),
  index('form_field_form_idx').on(t.formId, t.sort),
]);

// ---- Phase D: Search & Newsletter Subscribers ----
export const newsletterSubscriber = pgTable('newsletter_subscriber', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending | active | unsubscribed
  token: varchar('token', { length: 64 }), // one-time confirmation token (cleared on confirm)
  // 0032 (ZT-033): separate unsubscribe token + confirmation expiry
  unsubscribeToken: varchar('unsubscribe_token', { length: 64 }),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  source: varchar('source', { length: 100 }).default('site_footer'),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  ip: text('ip'),
  createdAt: ts(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('newsletter_sub_status_idx').on(t.status),
  index('newsletter_sub_token_idx').on(t.token),
  index('newsletter_sub_unsub_token_idx').on(t.unsubscribeToken),
]);

/** 0032 (ZT-034): "Was this helpful?" votes on articles/news — no PII stored. */
export const contentFeedback = pgTable('content_feedback', {
  id: serial('id').primaryKey(),
  entity: varchar('entity', { length: 20 }).notNull(), // article | news
  slug: varchar('slug', { length: 200 }).notNull(),
  locale: varchar('locale', { length: 10 }).notNull().default('en'),
  helpful: boolean('helpful').notNull(),
  createdAt: ts(),
}, (t) => [index('content_feedback_entity_slug_idx').on(t.entity, t.slug)]);

export const searchQueryLog = pgTable('search_query_log', {
  id: serial('id').primaryKey(),
  query: text('query').notNull(),
  locale: varchar('locale', { length: 10 }).notNull().default('en'),
  resultsCount: integer('results_count').notNull().default(0),
  createdAt: ts(),
}, (t) => [
  index('search_log_created_idx').on(t.createdAt),
]);

// ---- Phase D / MS4.5: Spec dictionary, Spec templates, Device type labels ----
export const specDictionary = pgTable('spec_dictionary', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 80 }).notNull(),
  normalizedKey: varchar('normalized_key', { length: 80 }).notNull(),
  categoryId: integer('category_id').references(() => category.id, { onDelete: 'set null' }),
  dataType: varchar('data_type', { length: 30 }).notNull().default('string'),
  unit: varchar('unit', { length: 20 }),
  description: text('description'),
  createdAt: ts(),
}, (t) => [
  index('spec_dictionary_norm_idx').on(t.normalizedKey),
  index('spec_dictionary_cat_idx').on(t.categoryId),
]);

export const specTemplate = pgTable('spec_template', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => category.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 80 }).notNull(),
  specKeys: text('spec_keys').array().notNull().default([]),
  requiredKeys: text('required_keys').array().notNull().default([]),
  createdAt: ts(),
}, (t) => [
  index('spec_template_cat_idx').on(t.categoryId),
]);

export const deviceTypeLabel = pgTable('device_type_label', {
  id: serial('id').primaryKey(),
  deviceType: varchar('device_type', { length: 30 }).notNull().unique(),
  label: varchar('label', { length: 80 }).notNull(),
  sort: integer('sort').notNull().default(0),
  createdAt: ts(),
});



