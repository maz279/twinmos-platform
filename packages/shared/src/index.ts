import { z } from 'zod';

// ---- enums (mirror packages/db pg enums; single source for API + admin + web) ----
export const ROLES = ['super_admin', 'admin', 'editor', 'author', 'viewer'] as const;
export const ROLE_SCHEMA = z.enum(ROLES);
export type Role = (typeof ROLES)[number];

export const CONTENT_STATUS = ['draft', 'in_review', 'scheduled', 'published', 'archived'] as const;
export const RMA_STATUS = ['submitted', 'under_review', 'approved', 'in_repair', 'shipped', 'delivered', 'closed'] as const;
export const SUBMISSION_STATUS = ['new', 'assigned', 'resolved', 'spam'] as const;

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
});
export const rmaTransitionSchema = z.object({
  to: z.enum(RMA_STATUS),
  note: z.string().trim().max(2000).optional(),
  notifyCustomer: z.boolean().default(false),
});
export const jobApplicationUpdateSchema = z.object({
  status: z.enum(SUBMISSION_STATUS),
});
