// Phase C Entities Admin API (Tasks C5a, C5b, C6a, C6b)
import { Hono } from 'hono';
import { eq, asc, desc, and, ilike, or } from 'drizzle-orm';
import { z } from 'zod';
import type { DB } from '@twinmos/db';
import {
  glossaryTerm,
  office,
  testimonial,
  policyDocument,
  formDefinition,
  formField,
  auditLog,
} from '@twinmos/db';
import { problem } from '@twinmos/shared';
import type { Role } from '@twinmos/shared';
import type { AuthSession } from '../auth.ts';
import { recordOutboxEvent } from '../services/outbox.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

// --- Validation Schemas ---
const glossaryBaseSchema = z.object({
  term: z.string().trim().min(1).max(200),
  definition: z.string().trim().min(1),
  letter: z.string().trim().min(1).max(2).optional(),
  explainerSlug: z.string().trim().nullable().optional(),
  locale: z.string().trim(),
  translationGroup: z.string().trim().optional(),
});
const glossaryCreateSchema = glossaryBaseSchema.extend({
  locale: z.string().trim().default('en'),
});
const glossaryUpdateSchema = glossaryBaseSchema.partial();

const officeBaseSchema = z.object({
  role: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1),
  entity: z.string().trim().min(1),
  address: z.string().trim().min(1),
  flag: z.string().trim().nullable().optional(),
  note: z.string().trim().nullable().optional(),
  sort: z.number().int(),
  locale: z.string().trim(),
});
const officeCreateSchema = officeBaseSchema.extend({
  sort: z.number().int().default(0),
  locale: z.string().trim().default('en'),
});
const officeUpdateSchema = officeBaseSchema.partial();

const testimonialBaseSchema = z.object({
  quote: z.string().trim().min(1),
  author: z.string().trim().min(1),
  role: z.string().trim().nullable().optional(),
  context: z.string().trim().nullable().optional(),
  sort: z.number().int(),
  permissionFlag: z.boolean(),
  locale: z.string().trim(),
});
const testimonialCreateSchema = testimonialBaseSchema.extend({
  sort: z.number().int().default(0),
  permissionFlag: z.boolean().default(true),
  locale: z.string().trim().default('en'),
});
const testimonialUpdateSchema = testimonialBaseSchema.partial();

const policyBaseSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1),
  version: z.string().trim(),
  status: z.enum(['draft', 'in_review', 'scheduled', 'published', 'archived']),
  effectiveDate: z.string().datetime().nullable().optional(),
  summary: z.string().trim().nullable().optional(),
  body: z.string(),
  cookieCategories: z.array(z.string()),
  locale: z.string().trim(),
  translationGroup: z.string().trim().optional(),
});
const policyCreateSchema = policyBaseSchema.extend({
  version: z.string().trim().default('1.0'),
  status: z.enum(['draft', 'in_review', 'scheduled', 'published', 'archived']).default('draft'),
  body: z.string().default(''),
  cookieCategories: z.array(z.string()).default([]),
  locale: z.string().trim().default('en'),
});
const policyUpdateSchema = policyBaseSchema.partial();

const formDefBaseSchema = z.object({
  type: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  successMessage: z.string().trim().nullable().optional(),
  routingEmail: z.string().email().nullable().optional(),
  privacyNotice: z.string().trim().nullable().optional(),
  isActive: z.boolean(),
});
const formDefCreateSchema = formDefBaseSchema.extend({
  isActive: z.boolean().default(true),
});
const formDefUpdateSchema = formDefBaseSchema.partial();

const formFieldBaseSchema = z.object({
  name: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1),
  type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox', 'radio', 'file', 'tel']),
  placeholder: z.string().trim().nullable().optional(),
  helpText: z.string().trim().nullable().optional(),
  required: z.boolean(),
  options: z.array(z.string()),
  sort: z.number().int(),
  validationRegex: z.string().trim().nullable().optional(),
});
const formFieldCreateSchema = formFieldBaseSchema.extend({
  type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox', 'radio', 'file', 'tel']).default('text'),
  required: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  sort: z.number().int().default(0),
});
const formFieldUpdateSchema = formFieldBaseSchema.partial();

function prunePatch<T extends Record<string, unknown>>(rawJson: Record<string, unknown>, parsedData: T): Record<string, unknown> {
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of Object.keys(rawJson)) {
    if (key in parsedData && (parsedData as any)[key] !== undefined) {
      patch[key] = (parsedData as any)[key];
    }
  }
  return patch;
}

export function entitiesRoute(
  db: DB,
  deps: { requireRole: (r: Role) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }
) {
  const r = new Hono();

  async function authed(c: any, minRole: Role = 'viewer'): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    const ok = await deps.requireRole(minRole)(c.req.raw);
    return ok ? s : c.json(problem(403, `Requires ${minRole} role or above`), 403, { 'Content-Type': P });
  }

  async function editorGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('editor')(c.req.raw))
      ? s
      : c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
  }

  async function auditRow(c: any, actorId: string | undefined, action: string, entity: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null,
      action,
      entity,
      entityId,
      diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  // ==========================================
  // 1. Glossary Terms (Task C5a)
  // ==========================================
  const listGlossary = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const locale = c.req.query('locale') || 'en';
    const letter = c.req.query('letter');
    const q = c.req.query('q');

    const filters = [eq(glossaryTerm.locale, locale)];
    if (letter) filters.push(eq(glossaryTerm.letter, letter.toUpperCase()));
    if (q) filters.push(ilike(glossaryTerm.term, `%${q}%`));

    const rows = await db
      .select()
      .from(glossaryTerm)
      .where(and(...filters))
      .orderBy(asc(glossaryTerm.term));

    return c.json({ items: rows });
  };
  r.get('/entities/glossary', listGlossary);
  r.get('/glossary', listGlossary);

  const getGlossary = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(glossaryTerm).where(eq(glossaryTerm.id, id)).limit(1);
    if (!rows[0]) return c.json(problem(404, 'Glossary term not found'), 404, { 'Content-Type': P });
    return c.json(rows[0]);
  };
  r.get('/entities/glossary/:id', getGlossary);
  r.get('/glossary/:id', getGlossary);

  const createGlossary = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = glossaryCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const letter = parsed.data.letter || parsed.data.term.charAt(0).toUpperCase();
    const rows = await db.insert(glossaryTerm).values({ ...parsed.data, letter }).returning();
    const created = rows[0];

    await auditRow(c, guard.user.id, 'glossary.create', 'glossary', String(created.id), parsed.data);
    await recordOutboxEvent(db, 'glossary.change', { action: 'create', id: created.id, tags: ['glossary'] });
    return c.json(created, 201);
  };
  r.post('/entities/glossary', createGlossary);
  r.post('/glossary', createGlossary);

  const updateGlossary = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = glossaryUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const patch: any = prunePatch(rawJson, parsed.data);
    if (rawJson.term && !rawJson.letter && parsed.data.term) {
      patch.letter = parsed.data.term.charAt(0).toUpperCase();
    }

    const rows = await db.update(glossaryTerm).set(patch).where(eq(glossaryTerm.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Glossary term not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'glossary.update', 'glossary', String(id), parsed.data);
    await recordOutboxEvent(db, 'glossary.change', { action: 'update', id, tags: ['glossary'] });
    return c.json(rows[0]);
  };
  r.put('/entities/glossary/:id', updateGlossary);
  r.put('/glossary/:id', updateGlossary);
  r.patch('/entities/glossary/:id', updateGlossary);
  r.patch('/glossary/:id', updateGlossary);

  const deleteGlossary = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(glossaryTerm).where(eq(glossaryTerm.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Glossary term not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'glossary.delete', 'glossary', String(id), {});
    await recordOutboxEvent(db, 'glossary.change', { action: 'delete', id, tags: ['glossary'] });
    return c.json({ deleted: true });
  };
  r.delete('/entities/glossary/:id', deleteGlossary);
  r.delete('/glossary/:id', deleteGlossary);

  // ==========================================
  // 2. Offices (Task C5b)
  // ==========================================
  const listOffices = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const locale = c.req.query('locale') || 'en';
    const rows = await db.select().from(office).where(eq(office.locale, locale)).orderBy(asc(office.sort));
    return c.json({ items: rows });
  };
  r.get('/entities/offices', listOffices);
  r.get('/offices', listOffices);

  const createOffice = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = officeCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const rows = await db.insert(office).values(parsed.data).returning();
    const created = rows[0];
    await auditRow(c, guard.user.id, 'office.create', 'office', String(created.id), parsed.data);
    await recordOutboxEvent(db, 'office.change', { action: 'create', id: created.id, tags: ['offices'] });
    return c.json(created, 201);
  };
  r.post('/entities/offices', createOffice);
  r.post('/offices', createOffice);

  const updateOffice = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = officeUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const patch: any = prunePatch(rawJson, parsed.data);
    const rows = await db.update(office).set(patch).where(eq(office.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Office not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'office.update', 'office', String(id), parsed.data);
    await recordOutboxEvent(db, 'office.change', { action: 'update', id, tags: ['offices'] });
    return c.json(rows[0]);
  };
  r.put('/entities/offices/:id', updateOffice);
  r.put('/offices/:id', updateOffice);
  r.patch('/entities/offices/:id', updateOffice);
  r.patch('/offices/:id', updateOffice);

  const deleteOffice = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(office).where(eq(office.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Office not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'office.delete', 'office', String(id), {});
    await recordOutboxEvent(db, 'office.change', { action: 'delete', id, tags: ['offices'] });
    return c.json({ deleted: true });
  };
  r.delete('/entities/offices/:id', deleteOffice);
  r.delete('/offices/:id', deleteOffice);

  // ==========================================
  // 3. Testimonials (Task C5b)
  // ==========================================
  const listTestimonials = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const locale = c.req.query('locale') || 'en';
    const rows = await db.select().from(testimonial).where(eq(testimonial.locale, locale)).orderBy(asc(testimonial.sort));
    return c.json({ items: rows });
  };
  r.get('/entities/testimonials', listTestimonials);
  r.get('/testimonials', listTestimonials);

  const createTestimonial = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = testimonialCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const rows = await db.insert(testimonial).values(parsed.data).returning();
    const created = rows[0];
    await auditRow(c, guard.user.id, 'testimonial.create', 'testimonial', String(created.id), parsed.data);
    await recordOutboxEvent(db, 'testimonial.change', { action: 'create', id: created.id, tags: ['testimonials'] });
    return c.json(created, 201);
  };
  r.post('/entities/testimonials', createTestimonial);
  r.post('/testimonials', createTestimonial);

  const updateTestimonial = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = testimonialUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const patch: any = prunePatch(rawJson, parsed.data);
    const rows = await db.update(testimonial).set(patch).where(eq(testimonial.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Testimonial not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'testimonial.update', 'testimonial', String(id), parsed.data);
    await recordOutboxEvent(db, 'testimonial.change', { action: 'update', id, tags: ['testimonials'] });
    return c.json(rows[0]);
  };
  r.put('/entities/testimonials/:id', updateTestimonial);
  r.put('/testimonials/:id', updateTestimonial);
  r.patch('/entities/testimonials/:id', updateTestimonial);
  r.patch('/testimonials/:id', updateTestimonial);

  const deleteTestimonial = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(testimonial).where(eq(testimonial.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Testimonial not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'testimonial.delete', 'testimonial', String(id), {});
    await recordOutboxEvent(db, 'testimonial.change', { action: 'delete', id, tags: ['testimonials'] });
    return c.json({ deleted: true });
  };
  r.delete('/entities/testimonials/:id', deleteTestimonial);
  r.delete('/testimonials/:id', deleteTestimonial);

  // ==========================================
  // 4. Policy Documents (Task C6a)
  // ==========================================
  const listPolicies = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const locale = c.req.query('locale') || 'en';
    const rows = await db.select().from(policyDocument).where(eq(policyDocument.locale, locale)).orderBy(asc(policyDocument.slug));
    return c.json({ items: rows });
  };
  r.get('/entities/policies', listPolicies);
  r.get('/policies', listPolicies);

  const getPolicy = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(policyDocument).where(eq(policyDocument.id, id)).limit(1);
    if (!rows[0]) return c.json(problem(404, 'Policy not found'), 404, { 'Content-Type': P });
    return c.json(rows[0]);
  };
  r.get('/entities/policies/:id', getPolicy);
  r.get('/policies/:id', getPolicy);

  const createPolicy = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = policyCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const effectiveDate = parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : null;
    const rows = await db.insert(policyDocument).values({ ...parsed.data, effectiveDate }).returning();
    const created = rows[0];

    await auditRow(c, guard.user.id, 'policy.create', 'policy', String(created.id), parsed.data);
    await recordOutboxEvent(db, 'policy.change', { action: 'create', slug: created.slug, tags: ['policies', `policy:${created.slug}`] });
    return c.json(created, 201);
  };
  r.post('/entities/policies', createPolicy);
  r.post('/policies', createPolicy);

  const updatePolicy = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = policyUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const patch: any = prunePatch(rawJson, parsed.data);
    if (rawJson.effectiveDate !== undefined && parsed.data.effectiveDate !== undefined) {
      patch.effectiveDate = parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : null;
    }

    const rows = await db.update(policyDocument).set(patch).where(eq(policyDocument.id, id)).returning();
    const updated = rows[0];
    if (!updated) return c.json(problem(404, 'Policy not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'policy.update', 'policy', String(id), parsed.data);
    await recordOutboxEvent(db, 'policy.change', { action: 'update', slug: updated.slug, tags: ['policies', `policy:${updated.slug}`] });
    return c.json(updated);
  };
  r.put('/entities/policies/:id', updatePolicy);
  r.put('/policies/:id', updatePolicy);
  r.patch('/entities/policies/:id', updatePolicy);
  r.patch('/policies/:id', updatePolicy);

  const deletePolicy = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(policyDocument).where(eq(policyDocument.id, id)).returning();
    const deleted = rows[0];
    if (!deleted) return c.json(problem(404, 'Policy not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'policy.delete', 'policy', String(id), {});
    await recordOutboxEvent(db, 'policy.change', { action: 'delete', slug: deleted.slug, tags: ['policies', `policy:${deleted.slug}`] });
    return c.json({ deleted: true });
  };
  r.delete('/entities/policies/:id', deletePolicy);
  r.delete('/policies/:id', deletePolicy);

  // ==========================================
  // 5. Form Definitions & Fields (Task C6b)
  // ==========================================
  const listForms = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const forms = await db.select().from(formDefinition).orderBy(asc(formDefinition.id));
    return c.json({ items: forms });
  };
  r.get('/entities/forms', listForms);
  r.get('/forms', listForms);

  const getForm = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const formRows = await db.select().from(formDefinition).where(eq(formDefinition.id, id)).limit(1);
    const form = formRows[0];
    if (!form) return c.json(problem(404, 'Form definition not found'), 404, { 'Content-Type': P });

    const fields = await db
      .select()
      .from(formField)
      .where(eq(formField.formId, id))
      .orderBy(asc(formField.sort));

    return c.json({ ...form, fields });
  };
  r.get('/entities/forms/:id', getForm);
  r.get('/forms/:id', getForm);

  const createForm = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const body = await c.req.json().catch(() => ({}));
    const parsed = formDefCreateSchema.safeParse(body);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const rows = await db.insert(formDefinition).values(parsed.data).returning();
    const created = rows[0];

    if (Array.isArray(body.fields) && body.fields.length > 0) {
      for (const f of body.fields) {
        const fp = formFieldCreateSchema.safeParse(f);
        if (fp.success) {
          await db.insert(formField).values({ ...fp.data, formId: created.id });
        }
      }
    }

    await auditRow(c, guard.user.id, 'form_def.create', 'form_definition', String(created.id), parsed.data);
    await recordOutboxEvent(db, 'form.change', { action: 'create', type: created.type, tags: ['forms', `form:${created.type}`] });
    return c.json(created, 201);
  };
  r.post('/entities/forms', createForm);
  r.post('/forms', createForm);

  const updateForm = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = formDefUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const patch: any = prunePatch(rawJson, parsed.data);
    const rows = await db.update(formDefinition).set(patch).where(eq(formDefinition.id, id)).returning();
    const updated = rows[0];
    if (!updated) return c.json(problem(404, 'Form definition not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'form_def.update', 'form_definition', String(id), parsed.data);
    await recordOutboxEvent(db, 'form.change', { action: 'update', type: updated.type, tags: ['forms', `form:${updated.type}`] });
    return c.json(updated);
  };
  r.put('/entities/forms/:id', updateForm);
  r.put('/forms/:id', updateForm);
  r.patch('/entities/forms/:id', updateForm);
  r.patch('/forms/:id', updateForm);

  const deleteForm = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(formDefinition).where(eq(formDefinition.id, id)).returning();
    const deleted = rows[0];
    if (!deleted) return c.json(problem(404, 'Form definition not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'form_def.delete', 'form_definition', String(id), {});
    await recordOutboxEvent(db, 'form.change', { action: 'delete', type: deleted.type, tags: ['forms', `form:${deleted.type}`] });
    return c.json({ deleted: true });
  };
  r.delete('/entities/forms/:id', deleteForm);
  r.delete('/forms/:id', deleteForm);

  // --- Form Fields ---
  const addFormField = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const formId = Number(c.req.param('id'));

    const formRows = await db.select().from(formDefinition).where(eq(formDefinition.id, formId)).limit(1);
    if (!formRows[0]) return c.json(problem(404, 'Form definition not found'), 404, { 'Content-Type': P });

    const parsed = formFieldCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const rows = await db.insert(formField).values({ ...parsed.data, formId }).returning();
    const created = rows[0];

    await auditRow(c, guard.user.id, 'form_field.create', 'form_field', String(created.id), parsed.data);
    await recordOutboxEvent(db, 'form.change', { action: 'field_create', type: formRows[0].type, tags: ['forms', `form:${formRows[0].type}`] });
    return c.json(created, 201);
  };
  r.post('/entities/forms/:id/fields', addFormField);
  r.post('/forms/:id/fields', addFormField);

  const updateFormField = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const fieldId = Number(c.req.param('fieldId') || c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = formFieldUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const patch: any = prunePatch(rawJson, parsed.data);
    const rows = await db.update(formField).set(patch).where(eq(formField.id, fieldId)).returning();
    const updated = rows[0];
    if (!updated) return c.json(problem(404, 'Form field not found'), 404, { 'Content-Type': P });

    const formRows = await db.select().from(formDefinition).where(eq(formDefinition.id, updated.formId)).limit(1);
    await auditRow(c, guard.user.id, 'form_field.update', 'form_field', String(fieldId), parsed.data);
    await recordOutboxEvent(db, 'form.change', { action: 'field_update', type: formRows[0]?.type ?? 'custom', tags: ['forms'] });
    return c.json(updated);
  };
  r.put('/entities/forms/:formId/fields/:fieldId', updateFormField);
  r.put('/forms/:formId/fields/:fieldId', updateFormField);
  r.put('/entities/forms/fields/:fieldId', updateFormField);
  r.put('/forms/fields/:id', updateFormField);
  r.patch('/entities/forms/:formId/fields/:fieldId', updateFormField);
  r.patch('/forms/:formId/fields/:fieldId', updateFormField);
  r.patch('/entities/forms/fields/:fieldId', updateFormField);
  r.patch('/forms/fields/:id', updateFormField);

  const deleteFormField = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const fieldId = Number(c.req.param('fieldId') || c.req.param('id'));

    const rows = await db.delete(formField).where(eq(formField.id, fieldId)).returning();
    const deleted = rows[0];
    if (!deleted) return c.json(problem(404, 'Form field not found'), 404, { 'Content-Type': P });

    const formRows = await db.select().from(formDefinition).where(eq(formDefinition.id, deleted.formId)).limit(1);
    await auditRow(c, guard.user.id, 'form_field.delete', 'form_field', String(fieldId), {});
    await recordOutboxEvent(db, 'form.change', { action: 'field_delete', type: formRows[0]?.type ?? 'custom', tags: ['forms'] });
    return c.json({ deleted: true });
  };
  r.delete('/entities/forms/:formId/fields/:fieldId', deleteFormField);
  r.delete('/forms/:formId/fields/:fieldId', deleteFormField);
  r.delete('/entities/forms/fields/:fieldId', deleteFormField);
  r.delete('/forms/fields/:id', deleteFormField);

  return r;
}
