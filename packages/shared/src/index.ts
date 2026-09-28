import { z } from 'zod';

// ---- enums (mirror packages/db pg enums; single source for API + admin + web) ----
export const ROLES = ['super_admin', 'admin', 'editor', 'author', 'viewer'] as const;
export const ROLE_SCHEMA = z.enum(ROLES);
export type Role = (typeof ROLES)[number];

export const CONTENT_STATUS = ['draft', 'in_review', 'scheduled', 'published', 'archived'] as const;
export const RMA_STATUS = ['submitted', 'under_review', 'approved', 'in_repair', 'shipped', 'delivered', 'closed'] as const;
// P6 (ADR-009): full lead-handling workflow — new → assigned → in_progress →
// resolved → closed, with spam as the side-track. Values are APPENDED to the
// P2 enum via migration 0005 (existing rows keep their states).
export const SUBMISSION_STATUS = ['new', 'assigned', 'in_progress', 'resolved', 'closed', 'spam'] as const;
export const SUBMISSION_PRIORITY = ['low', 'normal', 'high', 'urgent'] as const;
export const SUBMISSION_PRIORITY_SCHEMA = z.enum(SUBMISSION_PRIORITY);

/** Legal lead/submission state transitions (server-enforced like RMA). */
export const SUBMISSION_TRANSITIONS: Record<(typeof SUBMISSION_STATUS)[number], (typeof SUBMISSION_STATUS)[number][]> = {
  new: ['assigned', 'spam'],
  assigned: ['in_progress', 'resolved', 'spam'],
  in_progress: ['resolved', 'assigned', 'spam'],
  resolved: ['closed', 'in_progress'], // closed = terminal; reopen path back to in_progress
  closed: [],
  spam: ['new'], // un-marking spam returns the lead to the queue
};

/** First-response SLA per form family, in calendar hours (BR-4.2/4.3/4.4 —
 * "business hours" simplified to calendar hours, documented in docs/p6-evidence.md;
 * a business-hours calendar is a later operational refinement). */
export const SUBMISSION_SLA_HOURS: Record<string, number> = {
  quote: 24, contact: 24, partner_inquiry: 24, callback_request: 24,
  distributor_application: 48, report_counterfeit: 48, support_ticket: 48,
  job_application: 72, general_application: 72, event_rsvp: 72,
  press_request: 24, feedback: 72, build_submission: 24, newsletter: 24, rma: 24,
};
export const submissionSlaHours = (type: string): number =>
  SUBMISSION_SLA_HOURS[type.replace(/-/g, '_')] ?? 24;

/** Type-aware ticket prefixes (ADR-009); unknown types keep the P2 FRM- fallback. */
export const SUBMISSION_REF_PREFIX: Record<string, string> = {
  quote: 'QT', contact: 'CT', distributor_application: 'DS', partner_inquiry: 'PI',
  support_ticket: 'TS', report_counterfeit: 'BP', job_application: 'JB',
  general_application: 'JA', callback_request: 'CB', feedback: 'FB',
  press_request: 'PR', event_rsvp: 'EV', build_submission: 'BD', newsletter: 'NL', rma: 'RMA',
};
export const submissionRefPrefix = (type: string): string =>
  SUBMISSION_REF_PREFIX[type.replace(/-/g, '_')] ?? 'FRM';

/** Intake auto-priority (ADR-009): high-value channel forms route as high. */
export const submissionAutoPriority = (type: string): (typeof SUBMISSION_PRIORITY)[number] =>
  ['quote', 'distributor_application', 'partner_inquiry'].includes(type.replace(/-/g, '_')) ? 'high' : 'normal';

export const formNoteCreateSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

/** Legal RMA state transitions (RMA board enforces server-side too). */
export const RMA_TRANSITIONS: Record<(typeof RMA_STATUS)[number], (typeof RMA_STATUS)[number][]> = {
  submitted: ['under_review', 'closed'],
  under_review: ['approved', 'closed'],
  approved: ['in_repair', 'closed'],
  in_repair: ['shipped', 'closed'],
  shipped: ['delivered', 'closed'],
  delivered: ['closed'],
  closed: [],
};

// ---- public form contracts (15 registry types; representative set + open map) ----
export const FORM_TYPES = [
  'contact', 'quote', 'rma', 'distributor-application', 'partner-inquiry',
  'press-request', 'job-application', 'general-application', 'support-ticket',
  'callback-request', 'feedback', 'report-counterfeit', 'newsletter', 'event-rsvp', 'build-submission',
] as const;
export const FORM_TYPE_SCHEMA = z.enum(FORM_TYPES);

const contactField = z.string().trim().min(1).max(200);
export const formSubmissionSchema = z.object({
  type: FORM_TYPE_SCHEMA,
  email: z.string().email().max(254),
  name: contactField.optional(),
  payload: z.record(z.string(), z.union([z.string().max(5000), z.number(), z.boolean(), z.null()])).default({}),
  // privacy consent is mandatory on every public form
  consent: z.literal(true),
  // Cloudflare Turnstile token (skipped in dev via API_ALLOW_NO_TURNSTILE=1)
  turnstileToken: z.string().max(4096).optional(),
});
export type FormSubmissionInput = z.infer<typeof formSubmissionSchema>;

// ---- admin CRUD contracts (product shown; others follow same shape in P2/P3) ----
export const productCreateSchema = z.object({
  sku: z.string().trim().regex(/^[A-Z0-9-]{3,40}$/),
  slug: z.string().trim().regex(/^[a-z0-9-]{3,80}$/),
  name: z.string().trim().min(2).max(160),
  brandId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  status: z.enum(CONTENT_STATUS).default('draft'),
  specs: z.record(z.string(), z.unknown()).default({}),
  // 0007: rich product fields — marketing copy + list pricing + media
  description: z.string().trim().max(8000).default(''),
  priceUsd: z.number().nonnegative().max(9_999_999).nullable().default(null),
  currency: z.string().trim().length(3).default('USD'),
  heroMediaId: z.number().int().positive().nullable().default(null),
  gallery: z.array(z.number().int().positive()).max(12).default([]),
  datasheets: z.array(z.object({ label: z.string().trim().min(1).max(80), url: z.url().max(500) })).max(6).default([]),
  badges: z.array(z.string().max(40)).max(8).default([]),
});
export const productUpdateSchema = productCreateSchema.partial();

// ---- RFC 9457 problem details helper ----
export function problem(status: number, title: string, detail?: string, errors?: unknown) {
  return { type: 'about:blank', status, title, ...(detail ? { detail } : {}), ...(errors ? { errors } : {}) };
}

// ---- P2: RMA intake (payload of POST /forms/rma; also creates the RMA case) ----
export const rmaIntakeSchema = z.object({
  name: contactField,
  email: z.string().email().max(254),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(80).optional(),
  product: z.string().trim().min(1).max(200),
  sku: z.string().trim().max(40).optional(),
  serial: z.string().trim().max(60).optional(),
  purchaseDate: z.string().trim().max(30).optional(),
  warrantyTier: z.string().trim().max(20).optional(),
  issue: z.string().trim().min(10).max(4000),
});
export type RmaIntake = z.infer<typeof rmaIntakeSchema>;

// ---- P2: admin mutations ----
export const submissionUpdateSchema = z.object({
  status: z.enum(SUBMISSION_STATUS).optional(),
  assigneeId: z.string().max(128).nullable().optional(),
  priority: SUBMISSION_PRIORITY_SCHEMA.optional(), // P6 (ADR-009)
});
export const rmaTransitionSchema = z.object({
  to: z.enum(RMA_STATUS),
  note: z.string().trim().max(2000).optional(),
  notifyCustomer: z.boolean().default(false),
});
export const jobApplicationUpdateSchema = z.object({
  status: z.enum(SUBMISSION_STATUS),
});

// ---- P3: CMS content ----
export const CONTENT_ENTITIES = ['article', 'news', 'page', 'faq'] as const;
export const CONTENT_ENTITY_SCHEMA = z.enum(CONTENT_ENTITIES);

/** Legal publishing-workflow transitions (docs/04 §Publishing workflow). */
export const CONTENT_TRANSITIONS: Record<(typeof CONTENT_STATUS)[number], (typeof CONTENT_STATUS)[number][]> = {
  draft: ['in_review', 'published', 'archived'],
  in_review: ['scheduled', 'published', 'draft', 'archived'],
  scheduled: ['published', 'draft', 'archived'],
  published: ['archived'],
  archived: ['draft'],
};

const slugField = z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,118}$/, 'lowercase letters, digits and dashes');
const bodyField = z.string().max(200_000);
const localeField = z.string().trim().regex(/^[a-z]{2}(-[A-Za-z]{2,4})?$/, 'e.g. en, zh-cn').default('en');

export const articleCreateSchema = z.object({
  slug: slugField.optional(), // derived from title when omitted
  title: z.string().trim().min(2).max(200),
  deck: z.string().trim().max(400).optional(),
  body: bodyField.default(''),
  category: z.string().trim().max(40).default('Article'),
  tags: z.array(z.string().max(40)).max(12).default([]),
  locale: localeField,
  seo: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
});
export const articleUpdateSchema = articleCreateSchema.partial();

export const newsCreateSchema = z.object({
  slug: slugField.optional(),
  title: z.string().trim().min(2).max(200),
  body: bodyField.default(''),
  tag: z.string().trim().max(40).optional(),
  eventDate: z.string().datetime().optional(), // ISO — set for event-type posts
  locale: localeField,
});
export const newsUpdateSchema = newsCreateSchema.partial();

export const pageCreateSchema = z.object({
  slug: slugField.optional(),
  title: z.string().trim().min(2).max(200),
  blocks: z.array(z.record(z.string(), z.unknown())).default([]),
  locale: localeField,
  seo: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
});
export const pageUpdateSchema = pageCreateSchema.partial();

export const faqCreateSchema = z.object({
  groupKey: z.string().trim().regex(/^[a-z0-9-]{2,40}$/),
  question: z.string().trim().min(4).max(500),
  answer: z.string().trim().min(1).max(20_000),
  sort: z.number().int().min(0).max(9999).default(0),
  locale: localeField,
});
export const faqUpdateSchema = faqCreateSchema.partial();

export const contentTransitionSchema = z.object({
  to: z.enum(CONTENT_STATUS),
  publishAt: z.string().datetime().optional(), // required when to=scheduled
});
export const contentRevertSchema = z.object({ revisionId: z.number().int().positive() });

export const redirectCreateSchema = z.object({
  from: z.string().trim().min(1).max(500).regex(/^\//, 'must start with /'),
  to: z.string().trim().min(1).max(500),
  code: z.union([z.literal(301), z.literal(302), z.literal(308)]).default(301),
});
export const redirectUpdateSchema = redirectCreateSchema.partial();

export const settingUpdateSchema = z.object({
  key: z.string().trim().min(1).max(80),
  value: z.unknown(),
});

/** URL-safe slug from a free-text title (used when slug is omitted). */
export function slugify(input: string): string {
  return input.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'untitled';
}

// ---- P4: localization ----
/** 9-locale reconciled plan (BN removed per the post-remediation fact base). */
export const LOCALES = ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'] as const;
export const LOCALE_SCHEMA = z.enum(LOCALES);
export const RTL_LOCALES = ['ar'] as const;
export function localeDir(locale: string): 'ltr' | 'rtl' {
  return (RTL_LOCALES as readonly string[]).includes(locale) ? 'rtl' : 'ltr';
}

const nsField = z.string().trim().regex(/^[a-z0-9-]{1,60}$/, 'namespace: lowercase/digits/dashes');
const keyField = z.string().trim().regex(/^[A-Za-z0-9_.\-]{1,120}$/, 'key: letters/digits/_ . -');

export const translationUpsertSchema = z.object({
  locale: LOCALE_SCHEMA,
  ns: nsField.default('common'),
  key: keyField,
  value: z.string().max(20_000),
});
export const translationImportSchema = z.object({
  locale: LOCALE_SCHEMA,
  ns: nsField.default('common'),
  strings: z.record(z.string().min(1).max(120), z.string().max(20_000)).refine(
    (o) => Object.keys(o).length <= 5000, 'max 5000 strings per import'
  ),
});
export const translationDeleteSchema = z.object({
  locale: LOCALE_SCHEMA,
  ns: nsField,
  key: keyField,
});

// ---- P5: partner portal + anti-counterfeit ----
export const PARTNER_TYPES = ['distributor', 'oem', 'si'] as const;
export const PARTNER_TYPE_SCHEMA = z.enum(PARTNER_TYPES);
export const PARTNER_STATUSES = ['pending', 'active', 'suspended'] as const;
export const PARTNER_STATUS_SCHEMA = z.enum(PARTNER_STATUSES);
export const PARTNER_ASSET_CATEGORIES = ['price_file', 'mdf', 'resource'] as const;
export const PARTNER_ASSET_CATEGORY_SCHEMA = z.enum(PARTNER_ASSET_CATEGORIES);

export const partnerOrgCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  type: PARTNER_TYPE_SCHEMA,
  country: z.string().trim().max(60).optional(),
  contactEmail: z.string().email().max(254).optional(),
  note: z.string().trim().max(2000).optional(),
});
export const partnerOrgUpdateSchema = z.object({
  status: PARTNER_STATUS_SCHEMA.optional(),
  name: z.string().trim().min(2).max(160).optional(),
  country: z.string().trim().max(60).optional(),
  contactEmail: z.string().email().max(254).optional(),
  note: z.string().trim().max(2000).optional(),
});
export const partnerMemberAddSchema = z.object({
  email: z.string().email().max(254), // must already have a site account
  role: z.enum(['owner', 'staff']).default('staff'),
});
export const partnerAssetVisibilitySchema = z.array(PARTNER_TYPE_SCHEMA).min(1).max(3)
  .default(['distributor', 'oem', 'si']);

export const snCheckSchema = z.object({
  serial: z.string().trim().min(4).max(60).regex(/^[A-Za-z0-9._-]+$/, 'letters, digits, dot, dash, underscore'),
});
