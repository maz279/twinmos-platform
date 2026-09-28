// TwinMOS platform schema — Postgres dialect (Drizzle).
// SECURITY: application code uses the Drizzle query builder only; every value is
// parameter-bound. Never assemble SQL from strings (repo lint + review enforce).
import { pgTable, pgEnum, text, varchar, integer, boolean, timestamp, jsonb, serial, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['super_admin', 'admin', 'editor', 'author', 'viewer']);
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
  role: roleEnum('role').notNull().default('viewer'),
  image: text('image'),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false), // P7+ MFA flag (Better Auth twoFactor plugin)
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
  ipAddress: text('ip_address'), userAgent: text('user_agent'), createdAt: ts(),
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
  meta: jsonb('meta').default({}), createdAt: ts(),
});
export const setting = pgTable('setting', { key: text('key').primaryKey(), value: jsonb('value').notNull(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow() });
export const redirect = pgTable('redirect', { id: serial('id').primaryKey(), from: text('from').notNull().unique(), to: text('to').notNull(), code: integer('code').notNull().default(301) });
export const locale = pgTable('locale', { code: varchar('code', { length: 10 }).primaryKey(), name: text('name').notNull(), dir: varchar('dir', { length: 3 }).notNull().default('ltr'), active: boolean('active').notNull().default(false) });

// ---- content ----
export const article = pgTable('article', {
  id: serial('id').primaryKey(), slug: varchar('slug', { length: 120 }).notNull(), locale: varchar('locale', { length: 10 }).notNull().default('en'),
  title: text('title').notNull(), deck: text('deck'), body: text('body').notNull().default(''),
  category: varchar('category', { length: 40 }).notNull().default('Article'), tags: text('tags').array().default([]),
  status: contentStatusEnum('status').notNull().default('draft'), publishAt: timestamp('publish_at', { withTimezone: true }),
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }), heroMediaId: integer('hero_media_id').references(() => mediaAsset.id, { onDelete: 'set null' }),
  seo: jsonb('seo').default({}), revisionOf: integer('revision_of'), createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [uniqueIndex('article_slug_locale_uq').on(t.slug, t.locale), index('article_status_idx').on(t.status, t.publishAt)]);

export const page = pgTable('page', {
  id: serial('id').primaryKey(), slug: varchar('slug', { length: 120 }).notNull(), locale: varchar('locale', { length: 10 }).notNull().default('en'),
  title: text('title').notNull(), blocks: jsonb('blocks').notNull().default([]), status: contentStatusEnum('status').notNull().default('draft'),
  seo: jsonb('seo').default({}), createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(), deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [uniqueIndex('page_slug_locale_uq').on(t.slug, t.locale)]);

export const newsPost = pgTable('news_post', {
  id: serial('id').primaryKey(), slug: varchar('slug', { length: 120 }).notNull(), locale: varchar('locale', { length: 10 }).notNull().default('en'),
  title: text('title').notNull(), body: text('body').notNull().default(''), tag: text('tag'), eventDate: timestamp('event_date', { withTimezone: true }),
  status: contentStatusEnum('status').notNull().default('draft'), publishAt: timestamp('publish_at', { withTimezone: true }), heroMediaId: integer('hero_media_id'),
  createdAt: ts(), deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [uniqueIndex('news_slug_locale_uq').on(t.slug, t.locale)]);

export const faq = pgTable('faq', {
  id: serial('id').primaryKey(), groupKey: varchar('group_key', { length: 40 }).notNull(), locale: varchar('locale', { length: 10 }).notNull().default('en'),
  question: text('question').notNull(), answer: text('answer').notNull(), sort: integer('sort').notNull().default(0),
  status: contentStatusEnum('status').notNull().default('published'), createdAt: ts(),
});

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
  status: contentStatusEnum('status').notNull().default('draft'), specs: jsonb('specs').notNull().default({}),
  heroMediaId: integer('hero_media_id').references(() => mediaAsset.id, { onDelete: 'set null' }),
  gallery: integer('gallery').array().default([]), datasheets: jsonb('datasheets').default([]), badges: text('badges').array().default([]),
  releasedAt: timestamp('released_at', { withTimezone: true }), createdAt: ts(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [index('product_status_idx').on(t.status), index('product_cat_idx').on(t.categoryId)]);
export const compatibilityRule = pgTable('compatibility_rule', {
  id: serial('id').primaryKey(), deviceBrand: text('device_brand').notNull(), deviceModel: text('device_model').notNull(),
  memoryGen: varchar('memory_gen', { length: 12 }), formFactor: varchar('form_factor', { length: 12 }), maxGb: integer('max_gb'), notes: text('notes'),
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
}, (t) => [index('distributor_region_idx').on(t.region, t.country)]);
export const marketplaceListing = pgTable('marketplace_listing', {
  id: serial('id').primaryKey(), platform: varchar('platform', { length: 40 }).notNull(), url: text('url').notNull(),
  country: varchar('country', { length: 60 }), verifiedAt: timestamp('verified_at', { withTimezone: true }), createdAt: ts(),
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
});
export const rmaEvent = pgTable('rma_event', {
  id: serial('id').primaryKey(), rmaId: integer('rma_id').notNull().references(() => rmaRequest.id, { onDelete: 'cascade' }),
  fromStatus: rmaStatusEnum('from_status').notNull(), toStatus: rmaStatusEnum('to_status').notNull(),
  actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }), note: text('note'), at: ts(),
});
export const serialRegistry = pgTable('serial_registry', {
  serial: varchar('serial', { length: 60 }).primaryKey(), sku: varchar('sku', { length: 40 }),
  manufacturedAt: timestamp('manufactured_at', { withTimezone: true }), verifiedCount: integer('verified_count').notNull().default(0),
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
export const snCheck = pgTable('sn_check', {
  id: serial('id').primaryKey(),
  serial: varchar('serial', { length: 60 }).notNull(), sku: varchar('sku', { length: 40 }),
  result: varchar('result', { length: 20 }).notNull(), // valid | unverified
  ip: text('ip'), ua: text('ua'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('sn_check_serial_idx').on(t.serial, t.checkedAt), index('sn_check_checked_at_idx').on(t.checkedAt)]);

// ---- careers ----
export const jobPosting = pgTable('job_posting', {
  id: serial('id').primaryKey(), title: text('title').notNull(), dept: varchar('dept', { length: 40 }).notNull(),
  location: varchar('location', { length: 60 }).notNull(), type: varchar('type', { length: 20 }).notNull().default('full-time'),
  level: varchar('level', { length: 20 }).notNull().default('mid'), status: contentStatusEnum('status').notNull().default('draft'),
  body: text('body').notNull().default(''), applyBy: timestamp('apply_by', { withTimezone: true }), createdAt: ts(), deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
export const jobApplication = pgTable('job_application', {
  id: serial('id').primaryKey(), postingId: integer('posting_id').references(() => jobPosting.id, { onDelete: 'set null' }),
  payload: jsonb('payload').notNull().default({}), email: text('email').notNull(), status: submissionStatusEnum('status').notNull().default('new'),
  refCode: varchar('ref_code', { length: 24 }).notNull().unique(), createdAt: ts(),
});
