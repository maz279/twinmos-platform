import { z } from 'zod';

// ---- enums (mirror packages/db pg enums; single source for API + admin + web) ----
export const ROLES = ['super_admin', 'admin', 'editor', 'author', 'viewer', 'member'] as const;
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

// Authoritative TwinMOS currency set per FORENSIC_AUDIT_REPORT_2026-09-23#L43
export const AUTHORIZED_CURRENCIES = ['USD', 'EUR', 'AED', 'SAR', 'INR', 'RUB'] as const;
export type AuthorizedCurrency = (typeof AUTHORIZED_CURRENCIES)[number];
export const currencySchema = z.enum(AUTHORIZED_CURRENCIES);

// ---- admin CRUD contracts (product shown; others follow same shape in P2/P3) ----
export const productBaseSchema = z.object({
  sku: z.string().trim().regex(/^[A-Z0-9-]{3,40}$/),
  slug: z.string().trim().regex(/^[a-z0-9-]{3,80}$/),
  name: z.string().trim().min(2).max(160),
  brandId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  status: z.enum(CONTENT_STATUS),
  specs: z.record(z.string(), z.unknown()),
  // 0007: rich product fields — marketing copy + list pricing + media
  description: z.string().trim().max(8000),
  priceUsd: z.number().nonnegative().max(9_999_999).nullable(),
  currency: currencySchema,
  // 0015: public warranty terms ("3 Years" / "Lifetime" …), rendered on the PDP
  warranty: z.string().trim().max(80).nullable(),
  // 0016: storefront card line + shop facet values (gen/cap/interface/form —
  // controlled vocabularies rendered by the public grid + filters)
  shortSpec: z.string().trim().max(200).nullable(),
  facets: z.record(z.string(), z.string().trim().max(60)),
  heroMediaId: z.number().int().positive().nullable(),
  gallery: z.array(z.number().int().positive()).max(12),
  datasheets: z.array(z.object({ label: z.string().trim().min(1).max(80), url: z.url().max(500) })).max(6),
  badges: z.array(z.string().max(40)).max(8),
  featured: z.boolean(),
  launchDate: z.string().datetime().nullable().optional(),
  isComingSoon: z.boolean(),
  warrantyTier: z.enum(['standard', 'extended', 'lifetime', 'limited_lifetime', '1_year', '2_year', '3_year', '5_year', '10_year']).or(z.string()).nullable().optional(),
  specsDictionary: z.record(z.string(), z.unknown()),
  version: z.number().int().optional(),
});

export const productCreateSchema = productBaseSchema.extend({
  source: z.string().trim().max(300).nullable().optional(),
  approver: z.string().trim().max(120).nullable().optional(),
  translationGroup: z.string().trim().max(60).nullable().optional(),
  status: z.enum(CONTENT_STATUS).default('draft'),
  specs: z.record(z.string(), z.unknown()).default({}),
  description: z.string().trim().max(8000).default(''),
  priceUsd: z.number().nonnegative().max(9_999_999).nullable().default(null),
  currency: currencySchema.default('USD'),
  warranty: z.string().trim().max(80).nullable().default(null),
  shortSpec: z.string().trim().max(200).nullable().default(null),
  facets: z.record(z.string(), z.string().trim().max(60)).default({}),
  heroMediaId: z.number().int().positive().nullable().default(null),
  gallery: z.array(z.number().int().positive()).max(12).default([]),
  datasheets: z.array(z.object({ label: z.string().trim().min(1).max(80), url: z.url().max(500) })).max(6).default([]),
  badges: z.array(z.string().max(40)).max(8).default([]),
  featured: z.boolean().default(false),
  launchDate: z.string().datetime().nullable().optional().default(null),
  isComingSoon: z.boolean().default(false),
  warrantyTier: z.enum(['standard', 'extended', 'lifetime', 'limited_lifetime', '1_year', '2_year', '3_year', '5_year', '10_year']).or(z.string()).nullable().optional().default(null),
  specsDictionary: z.record(z.string(), z.unknown()).default({}),
  version: z.number().int().default(1),
});
export const productUpdateSchema = productBaseSchema.partial().extend({
  featured: z.boolean().optional(),
  launchDate: z.string().datetime().nullable().optional(),
  isComingSoon: z.boolean().optional(),
  warrantyTier: z.string().trim().max(40).nullable().optional(),
  specsDictionary: z.record(z.string(), z.unknown()).optional(),
  source: z.string().trim().max(300).nullable().optional(),
  approver: z.string().trim().max(120).nullable().optional(),
  translationGroup: z.string().trim().max(60).nullable().optional(),
});

// ---- Phase 3: catalog engineering contracts (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §3) ----
// 3.1 product variants — hardware attributes + per-variant pricing/inventory.
// Pricing & stock live inside the variant's jsonb attrs (the table's designed
// dumping ground), so no migration is required.
export const variantBaseSchema = z.object({
  attrs: z.object({
    capacity: z.string().trim().min(1).max(20),            // e.g. 16GB / 32GB / 1TB
    speed: z.string().trim().min(1).max(20).optional(),     // e.g. 6000MT/s
    finish: z.string().trim().min(1).max(20).optional(),    // Black / Titanium / White
    lighting: z.enum(['RGB', 'Non-RGB']).optional(),
  }),
  sku: z.string().trim().regex(/^[A-Z0-9-]{3,40}$/),
  priceUsd: z.number().nonnegative().max(9_999_999).nullable(),
  status: z.enum(['active', 'discontinued']),
  stock: z.number().int().min(0).max(9_999_999),
});
export const variantCreateSchema = variantBaseSchema.extend({
  priceUsd: z.number().nonnegative().max(9_999_999).nullable().default(null),
  status: z.enum(['active', 'discontinued']).default('active'),
  stock: z.number().int().min(0).max(9_999_999).default(0),
});
export const variantUpdateSchema = z.object({
  // partial INSIDE attrs too — a PATCH may touch only e.g. finish or stock
  attrs: variantBaseSchema.shape.attrs.partial(),
  sku: variantBaseSchema.shape.sku,
  priceUsd: variantBaseSchema.shape.priceUsd,
  status: variantBaseSchema.shape.status,
  stock: variantBaseSchema.shape.stock,
}).partial();
export type VariantInput = z.infer<typeof variantCreateSchema>;

// 3.2 QVL compatibility matrix — motherboard/laptop validation rules.
// NB: memory_gen and form_factor are varchar(12) columns — keep enum labels short.
export const COMPAT_MEMORY_GENS = ['DDR4', 'DDR5'] as const;
export const COMPAT_FORM_FACTORS = ['U-DIMM', 'SO-DIMM', 'M.2 2280 NVMe'] as const;
// 0017: finder hierarchy groups — the public compatibility page's type tabs.
export const COMPAT_DEVICE_TYPES = ['laptop', 'desktop', 'diy', 'minipc'] as const;
export const compatibilityBaseSchema = z.object({
  deviceBrand: z.string().trim().min(1).max(40),
  deviceModel: z.string().trim().min(1).max(80),
  memoryGen: z.enum(COMPAT_MEMORY_GENS).nullable(),
  formFactor: z.enum(COMPAT_FORM_FACTORS).nullable(),
  maxGb: z.number().int().positive().max(1024).nullable(),
  notes: z.string().trim().max(500).nullable(),
  // 0017 finder contract — slots/speed/SSD upgrade + recommendation categories
  deviceType: z.enum(COMPAT_DEVICE_TYPES),
  slots: z.number().int().positive().max(16).nullable(),
  speed: z.string().trim().max(30).nullable(),
  cats: z.array(z.string().trim().min(1).max(40)).max(8),
  ssdNote: z.string().trim().max(120).nullable(),
  ssdCats: z.array(z.string().trim().min(1).max(40)).max(8),
  qvlStatus: z.string().trim().max(30).default('certified'),
});
export const compatibilityCreateSchema = compatibilityBaseSchema.extend({
  memoryGen: z.enum(COMPAT_MEMORY_GENS).nullable().default(null),
  formFactor: z.enum(COMPAT_FORM_FACTORS).nullable().default(null),
  maxGb: z.number().int().positive().max(1024).nullable().default(null),
  notes: z.string().trim().max(500).nullable().default(null),
  deviceType: z.enum(COMPAT_DEVICE_TYPES).default('laptop'),
  slots: z.number().int().positive().max(16).nullable().default(null),
  speed: z.string().trim().max(30).nullable().default(null),
  cats: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  ssdNote: z.string().trim().max(120).nullable().default(null),
  ssdCats: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  qvlStatus: z.string().trim().max(30).default('certified'),
});
export const compatibilityUpdateSchema = compatibilityBaseSchema.partial();
export type CompatibilityInput = z.infer<typeof compatibilityCreateSchema>;

// ---- 0020: where-to-buy directory (public locator) ----
// Region/status vocabularies mirror the public where-to-buy page's filter
// chips and card attributes (data-region / data-status).
export const DISTRIBUTOR_REGIONS = ['me', 'af', 'as', 'eu', 'cis', 'am'] as const;
export const DISTRIBUTOR_REGION_LABELS = {
  me: 'Middle East & GCC', af: 'Africa', as: 'Asia', eu: 'Europe', cis: 'CIS', am: 'Americas',
} as const;
export const DISTRIBUTOR_STATUSES = ['hub', 'authorized', 'expanding', 'seeking'] as const;
export const DISTRIBUTOR_STATUS_LABELS = {
  hub: 'TwinMOS hub', authorized: 'Authorized distribution', expanding: 'Expanding coverage', seeking: 'Seeking distributors',
} as const;
export const distributorBaseSchema = z.object({
  name: z.string().trim().min(2).max(120),            // country card title (e.g. "United Arab Emirates")
  country: z.string().trim().min(2).max(60),
  region: z.enum(DISTRIBUTOR_REGIONS),
  status: z.enum(DISTRIBUTOR_STATUSES),
  cities: z.array(z.string().trim().min(1).max(60)).max(20),
  contact: z.record(z.string(), z.string().max(300)), // {email, phone, website, tag}
  note: z.string().trim().max(1000).nullable(),
  isoCountry: z.string().trim().length(2).nullable().optional(),
  tagline: z.string().trim().max(300).nullable().optional(),
  ctaConfig: z.record(z.string(), z.unknown()).optional(),
  sort: z.number().int().default(0),
  source: z.string().trim().max(300).nullable().optional(),
  approver: z.string().trim().max(120).nullable().optional(),
});
export const distributorCreateSchema = distributorBaseSchema.extend({
  status: z.enum(DISTRIBUTOR_STATUSES).default('authorized'),
  cities: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  contact: z.record(z.string(), z.string().max(300)).default({}),
  note: z.string().trim().max(1000).nullable().default(null),
  isoCountry: z.string().trim().length(2).nullable().optional().default(null),
  tagline: z.string().trim().max(300).nullable().optional().default(null),
  ctaConfig: z.record(z.string(), z.unknown()).optional().default({}),
  sort: z.number().int().default(0),
});
export const distributorUpdateSchema = distributorBaseSchema.partial();
export const marketplaceListingBaseSchema = z.object({
  platform: z.string().trim().min(2).max(40),
  url: z.url().max(500),
  country: z.string().trim().max(60).nullable(),
  description: z.string().trim().max(500).nullable().optional(),
  ctaLabel: z.string().trim().max(60).nullable().optional(),
  sort: z.number().int().default(0),
});
export const marketplaceListingCreateSchema = marketplaceListingBaseSchema.extend({
  country: z.string().trim().max(60).nullable().default(null),
  description: z.string().trim().max(500).nullable().optional().default(null),
  ctaLabel: z.string().trim().max(60).nullable().optional().default(null),
  sort: z.number().int().default(0),
});
export const marketplaceListingUpdateSchema = marketplaceListingBaseSchema.partial();

// ---- MS4.5: Spec dictionary, Spec templates, Device type labels ----
export const specDictionaryBaseSchema = z.object({
  key: z.string().trim().min(1).max(80),
  normalizedKey: z.string().trim().min(1).max(80),
  categoryId: z.number().int().positive().nullable().optional(),
  dataType: z.enum(['string', 'number', 'boolean', 'array']).default('string'),
  unit: z.string().trim().max(20).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
});
export const specDictionaryCreateSchema = specDictionaryBaseSchema;
export const specDictionaryUpdateSchema = specDictionaryBaseSchema.partial();
export type SpecDictionaryInput = z.infer<typeof specDictionaryCreateSchema>;

export const specTemplateBaseSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().trim().min(1).max(80),
  specKeys: z.array(z.string().trim().min(1).max(80)).default([]),
  requiredKeys: z.array(z.string().trim().min(1).max(80)).default([]),
});
export const specTemplateCreateSchema = specTemplateBaseSchema;
export const specTemplateUpdateSchema = specTemplateBaseSchema.partial();
export type SpecTemplateInput = z.infer<typeof specTemplateCreateSchema>;

export const deviceTypeLabelBaseSchema = z.object({
  deviceType: z.string().trim().min(1).max(30),
  label: z.string().trim().min(1).max(80),
  sort: z.number().int().default(0),
});
export const deviceTypeLabelCreateSchema = deviceTypeLabelBaseSchema;
export const deviceTypeLabelUpdateSchema = deviceTypeLabelBaseSchema.partial();
export type DeviceTypeLabelInput = z.infer<typeof deviceTypeLabelCreateSchema>;

// 3.3 bulk import envelope — the CSV text is parsed/validated server-side.
export const productImportSchema = z.object({
  csv: z.string().min(1).max(2_000_000),
  dryRun: z.boolean().default(true),
});/** Canonical import column order (also the export order + template header). */
export const PRODUCT_IMPORT_COLUMNS = ['sku', 'slug', 'name', 'brand', 'category', 'status', 'currency', 'priceUsd', 'description'] as const;

// 3.4 optimistic locking — compare an If-Match header (optionally quoted ISO
// timestamp) against the row's stored updatedAt. Returns true when equal OR
// when no header was supplied (guard not requested).
export function sameInstant(headerVal: string | undefined | null, dbVal: Date | string | null | undefined): boolean {
  if (!headerVal) return true;
  const parse = (v: string) => {
    const d = new Date(v.replace(/^"|"$/g, ''));
    return isNaN(d.getTime()) ? null : d.getTime();
  };
  const a = parse(headerVal);
  const b = dbVal == null ? null : parse(typeof dbVal === 'string' ? dbVal : dbVal.toISOString());
  return a != null && b != null && a === b;
}

// ---- RFC 9457 problem details helper ----
export function problem(status: number, title: string, detail?: string, errors?: unknown) {
  return {
    type: 'about:blank',
    status,
    title,
    ...(detail ? { detail } : {}),
    ...(errors ? { errors, invalid_params: errors } : {}),
  };
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

// ---- Warranty registration & lookup (BRD §F8.3, URD UR-6.x, BR-6.2) ----
const serialField = z.string().trim().min(4).max(60).regex(/^[A-Za-z0-9._-]+$/, 'letters, digits, dot, dash, underscore')
  .transform((s) => s.toUpperCase());
const isoDay = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');
export const warrantyRegisterSchema = z.object({
  serial: serialField,
  email: z.string().trim().toLowerCase().email().max(254),
  name: contactField,
  country: z.string().trim().max(80).optional(),
  purchaseDate: isoDay,
  retailer: z.string().trim().max(120).optional(),
  consent: z.literal(true),
  turnstileToken: z.string().max(4096).optional(),
  formToken: z.string().max(512).optional(),
});
export const warrantyLookupSchema = z.object({
  serial: serialField,
  email: z.string().trim().toLowerCase().email().max(254),
});
export const WARRANTY_STATUSES = ['active', 'expiring_soon', 'expired', 'lifetime', 'undetermined', 'not_registered'] as const;
export type WarrantyStatusName = (typeof WARRANTY_STATUSES)[number];
/** Days before expiry at which "Expiring soon" is shown (URD UR-6.1.7). */
export const WARRANTY_EXPIRING_SOON_DAYS = 60;

/** Parse a product's published warranty string ("5 Years", "Lifetime",
 *  "Product lifetime warranty", "18 months"). null = cannot be determined. */
export function parseWarrantyTerm(term: string | null | undefined): { kind: 'lifetime' } | { kind: 'months'; months: number } | null {
  const t = String(term ?? '').trim().toLowerCase();
  if (!t) return null;
  if (/lifetime/.test(t)) return { kind: 'lifetime' };
  const y = /(\d{1,2})\s*-?\s*(year|yr)/.exec(t);
  if (y) return { kind: 'months', months: Number(y[1]) * 12 };
  const m = /(\d{1,3})\s*-?\s*month/.exec(t);
  if (m) return { kind: 'months', months: Number(m[1]) };
  return null;
}

/** Expiry instant for a purchase day under a parsed term (null = no expiry / unknown). */
export function warrantyExpiry(purchaseDate: string, term: ReturnType<typeof parseWarrantyTerm>): Date | null {
  if (!term || term.kind === 'lifetime') return null;
  const d = new Date(`${purchaseDate}T23:59:59Z`);
  d.setUTCMonth(d.getUTCMonth() + term.months);
  return d;
}

export function warrantyStatusOf(reg: { warrantyTerm: string | null; warrantyExpiresAt: Date | string | null } | null, now = new Date()): WarrantyStatusName {
  if (!reg) return 'not_registered';
  const term = parseWarrantyTerm(reg.warrantyTerm);
  if (!term) return 'undetermined';
  if (term.kind === 'lifetime') return 'lifetime';
  const exp = reg.warrantyExpiresAt ? new Date(reg.warrantyExpiresAt) : null;
  if (!exp) return 'undetermined';
  if (exp.getTime() < now.getTime()) return 'expired';
  if (exp.getTime() - now.getTime() < WARRANTY_EXPIRING_SOON_DAYS * 86400_000) return 'expiring_soon';
  return 'active';
}

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
  published: ['archived', 'draft'],
  archived: ['draft'],
};

const slugField = z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,118}$/, 'lowercase letters, digits and dashes');
const bodyField = z.string().max(200_000);
const localeField = z.string().trim().regex(/^[a-z]{2}(-[A-Za-z]{2,4})?$/, 'e.g. en, zh-cn');

export const articleBaseSchema = z.object({
  slug: slugField.optional(), // derived from title when omitted
  title: z.string().trim().min(2).max(200),
  deck: z.string().trim().max(400).optional(),
  heroMediaId: z.number().int().positive().nullable().optional(),
  body: bodyField,
  category: z.string().trim().max(40),
  tags: z.array(z.string().max(40)).max(12),
  locale: localeField,
  seo: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  structuredBody: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
  readingTimeMin: z.number().int().min(0).nullable().optional(),
  source: z.string().trim().max(300).nullable().optional(),
  approver: z.string().trim().max(120).nullable().optional(),
  translationGroup: z.string().trim().max(60).nullable().optional(),
  version: z.number().int().optional(),
});
export const articleCreateSchema = articleBaseSchema.extend({
  heroMediaId: z.number().int().positive().nullable().optional().default(null),
  body: bodyField.default(''),
  category: z.string().trim().max(40).default('Article'),
  tags: z.array(z.string().max(40)).max(12).default([]),
  locale: localeField.default('en'),
  seo: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
  structuredBody: z.array(z.record(z.string(), z.unknown())).nullable().optional().default(null),
  readingTimeMin: z.number().int().min(0).nullable().optional().default(null),
  version: z.number().int().default(1),
});
export const articleUpdateSchema = articleBaseSchema.partial();

export const newsBaseSchema = z.object({
  slug: slugField.optional(),
  title: z.string().trim().min(2).max(200),
  heroMediaId: z.number().int().positive().nullable().optional(),
  body: bodyField,
  tag: z.string().trim().max(40).optional(),
  eventDate: z.string().datetime().optional(), // ISO — set for event-type posts
  locale: localeField,
  seo: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
  source: z.string().trim().max(300).nullable().optional(),
  approver: z.string().trim().max(120).nullable().optional(),
  translationGroup: z.string().trim().max(60).nullable().optional(),
});
export const newsCreateSchema = newsBaseSchema.extend({
  heroMediaId: z.number().int().positive().nullable().optional().default(null),
  body: bodyField.default(''),
  locale: localeField.default('en'),
});
export const newsUpdateSchema = newsBaseSchema.partial();

export const RESERVED_PAGE_PATHS = ['/admin', '/api', '/internal'] as const;

export function isReservedPagePath(path?: string | null): boolean {
  if (!path) return false;
  const norm = '/' + path.replace(/^\/+/, '').toLowerCase();
  return RESERVED_PAGE_PATHS.some((res) => norm === res || norm.startsWith(res + '/'));
}

export const pagePathSchema = z.string().trim().regex(/^\/[a-zA-Z0-9_\-\/]*$/, 'Must start with /')
  .refine((p) => !isReservedPagePath(p), {
    message: 'Path cannot use reserved prefixes (/admin, /api, /internal)',
  });

export const pageBaseSchema = z.object({
  slug: slugField.optional(),
  path: pagePathSchema.nullable().optional(),
  template: z.enum(['default', 'landing', 'full_width', 'legal', 'category', 'product_detail', 'support_portal']),
  parentId: z.number().int().positive().nullable().optional(),
  translationGroup: z.string().trim().nullable().optional(),
  title: z.string().trim().min(2).max(200),
  blocks: z.array(z.record(z.string(), z.unknown())),
  locale: localeField,
  seo: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
  ogMediaId: z.number().int().positive().nullable().optional(),
  noindex: z.boolean(),
  legacyPaths: z.array(z.string()),
  sort: z.number().int().min(0).max(9999).optional(),
  status: z.enum(CONTENT_STATUS),
  source: z.string().trim().max(300).nullable().optional(),
  approver: z.string().trim().max(120).nullable().optional(),
  version: z.number().int().optional(),
});
export const pageCreateSchema = pageBaseSchema.extend({
  blocks: z.array(z.record(z.string(), z.unknown())).default([]),
  locale: localeField.default('en'),
  seo: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
  path: pagePathSchema.nullable().optional().default(null),
  template: z.enum(['default', 'landing', 'full_width', 'legal', 'category', 'product_detail', 'support_portal']).default('default'),
  parentId: z.number().int().positive().nullable().optional().default(null),
  translationGroup: z.string().trim().nullable().optional().default(null),
  seoTitle: z.string().trim().max(160).nullable().optional().default(null),
  seoDescription: z.string().trim().max(320).nullable().optional().default(null),
  ogMediaId: z.number().int().positive().nullable().optional().default(null),
  noindex: z.boolean().default(false),
  legacyPaths: z.array(z.string()).default([]),
  status: z.enum(CONTENT_STATUS).default('draft'),
  version: z.number().int().default(1),
});
export const pageUpdateSchema = pageBaseSchema.partial();

export const faqBaseSchema = z.object({
  groupKey: z.string().trim().regex(/^[a-z0-9-]{2,40}$/),
  question: z.string().trim().min(4).max(500),
  answer: z.string().trim().min(1).max(20_000),
  sort: z.number().int().min(0).max(9999),
  label: z.string().trim().max(120).nullable().optional(),
  locale: localeField,
  source: z.string().trim().max(300).nullable().optional(),
  approver: z.string().trim().max(120).nullable().optional(),
  version: z.number().int().optional(),
});
export const faqCreateSchema = faqBaseSchema.extend({
  sort: z.number().int().min(0).max(9999).default(0),
  locale: localeField.default('en'),
  version: z.number().int().default(1),
});
export const faqUpdateSchema = faqBaseSchema.partial();

export const contentTransitionSchema = z.object({
  to: z.enum(CONTENT_STATUS),
  publishAt: z.string().datetime().optional(), // required when to=scheduled
  unpublishAt: z.string().datetime().optional(), // optional scheduled unpublish
});
export const contentRevertSchema = z.object({ revisionId: z.number().int().positive() });

export const redirectBaseSchema = z.object({
  from: z.string().trim().min(1).max(500).regex(/^\//, 'must start with /'),
  to: z.string().trim().min(1).max(500),
  code: z.union([z.literal(301), z.literal(302), z.literal(308)]),
});
export const redirectCreateSchema = redirectBaseSchema.extend({
  code: z.union([z.literal(301), z.literal(302), z.literal(308)]).default(301),
});
export const redirectUpdateSchema = redirectBaseSchema.partial();

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

// ---- Phase 5.2: careers job postings ----
export const JOB_DEPARTMENTS = ['R&D', 'Sales', 'Marketing', 'Operations', 'Support', 'QA'] as const;
export const JOB_LOCATIONS = ['Taipei', 'Dubai', 'Cologne', 'San Jose', 'Remote'] as const;
export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'] as const;
export const JOB_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'] as const;
export const JOB_POSTING_STATUSES = ['draft', 'published', 'closed', 'archived'] as const;
export const jobPostingBaseSchema = z.object({
  title: z.string().trim().min(2).max(160),
  dept: z.enum(JOB_DEPARTMENTS),
  location: z.enum(JOB_LOCATIONS),
  type: z.enum(JOB_TYPES),
  level: z.enum(JOB_LEVELS),
  status: z.enum(JOB_POSTING_STATUSES),
  body: z.string().trim().max(20_000),
  applyBy: z.string().datetime().nullable(),
  salaryBand: z.string().trim().max(80).nullable(),
  equalOpportunity: z.boolean(),
});
export const jobPostingCreateSchema = jobPostingBaseSchema.extend({
  type: z.enum(JOB_TYPES).default('full-time'),
  level: z.enum(JOB_LEVELS).default('mid'),
  status: z.enum(JOB_POSTING_STATUSES).default('draft'),
  body: z.string().trim().max(20_000).default(''),
  applyBy: z.string().datetime().nullable().default(null),
  salaryBand: z.string().trim().max(80).nullable().default(null),
  equalOpportunity: z.boolean().default(true),
});
export const jobPostingUpdateSchema = jobPostingBaseSchema.partial();
export type JobPostingInput = z.infer<typeof jobPostingCreateSchema>;

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

export * from './delivery.ts';
export * from './blocks.ts';
export * from './widgets.ts';
export * from './sanitize.ts';
export * from './settings.ts';

