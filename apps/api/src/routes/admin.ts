// Admin CRUD — products (P0 reference module) + P2 modules: dashboard KPIs,
// submissions inbox, RMA board (server-enforced state machine), job applications.
// Every mutation: session + RBAC guard, Zod validation, parameter-bound Drizzle
// queries, audit row. Reads: any authenticated role; writes: editor+.
import { Hono } from 'hono';
import { and, count, desc, eq, ilike, lt } from 'drizzle-orm';
import { z } from 'zod';
import {
  jobApplicationUpdateSchema, productCreateSchema, productUpdateSchema, problem,
  rmaTransitionSchema, submissionUpdateSchema, RMA_TRANSITIONS, SUBMISSION_STATUS, RMA_STATUS,
} from '@twinmos/shared';
import { auditLog, formSubmission, jobApplication, jobPosting, product, rmaEvent, rmaRequest } from '@twinmos/db';
import { sendRmaStatusMail } from '../mailer.ts';
import { IdempotencyStore } from '../idem.ts';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';
import type { Role } from '@twinmos/shared';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';
/** Idempotency store for RMA transitions (TTL + bounded; Redis in prod per docs/02). */
const RMA_IDEM = new IdempotencyStore();

const submissionStatusQ = z.enum(SUBMISSION_STATUS);
const rmaStatusQ = z.enum(RMA_STATUS);

export function adminRoute(db: DB, deps: { requireRole: (r: Role) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  /** Session or a ready 401 Response (AuthSession is null-able; we narrow here). */
  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  /** Editor+ write guard: session + RBAC, or a ready 401/403 Response. */
  async function editorGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    const ok = await deps.requireRole('editor')(c.req.raw);
    return ok ? s : c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
  }

  async function auditRow(c: any, actorId: string | undefined, action: string, entity: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity, entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  r.use('*', async (c, next) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    await next();
  });

  // ==================== products (P0 reference module) ====================
  r.get('/products', async (c) => {
    const rows = await db.select().from(product).orderBy(desc(product.id)).limit(100);
    return c.json({ items: rows, cursor: null });
  });

  r.get('/products/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(product).where(eq(product.id, id)).limit(1);
    if (!rows[0]) return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': P });
    return c.json(rows[0]);
  });

  r.post('/products', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = productCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.insert(product).values(parsed.data).returning();
    await auditRow(c, guard.user.id, 'product.create', 'product', String(rows[0].id), parsed.data);
    return c.json(rows[0], 201);
  });

  r.patch('/products/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = productUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(product).set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(product.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'product.update', 'product', String(id), parsed.data);
    return c.json(rows[0]);
  });

  r.get('/audit', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const ok = await deps.requireRole('admin')(c.req.raw);
    if (!ok) return c.json(problem(403, 'Requires admin role or above'), 403, { 'Content-Type': P });
    const rows = await db.select().from(auditLog).orderBy(desc(auditLog.id)).limit(100);
    return c.json({ items: rows });
  });

  // ==================== P2: dashboard KPIs ====================
  r.get('/stats', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const [subsByStatus, subsByType, rmaByStatus, jobs, products] = await Promise.all([
      db.select({ status: formSubmission.status, n: count() }).from(formSubmission).groupBy(formSubmission.status),
      db.select({ type: formSubmission.type, n: count() }).from(formSubmission).groupBy(formSubmission.type),
      db.select({ status: rmaRequest.status, n: count() }).from(rmaRequest).groupBy(rmaRequest.status),
      db.select({ n: count() }).from(jobApplication),
      db.select({ n: count() }).from(product),
    ]);
    const total = (rows: { n: number }[]) => rows.reduce((s, x) => s + Number(x.n), 0);
    const byKey = (rows: Array<{ n: number; [k: string]: unknown }>, key: string) =>
      Object.fromEntries(rows.map((x) => [String(x[key]), Number(x.n)]));
    return c.json({
      submissions: { total: total(subsByStatus), byStatus: byKey(subsByStatus, 'status'), byType: byKey(subsByType, 'type') },
      rma: {
        total: total(rmaByStatus),
        open: rmaByStatus.filter((x) => x.status !== 'closed' && x.status !== 'delivered').reduce((s, x) => s + Number(x.n), 0),
        byStatus: byKey(rmaByStatus, 'status'),
      },
      jobApplications: total(jobs),
      products: total(products),
    });
  });

  // ==================== P2: submissions inbox ====================
  r.get('/submissions', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const limit = Math.min(Number(c.req.query('limit') ?? 25) || 25, 100);
    const cursor = Number(c.req.query('cursor') ?? 0) || 0;
    const type = c.req.query('type');
    const status = submissionStatusQ.safeParse(c.req.query('status') ?? undefined);
    const filters = [
      type ? eq(formSubmission.type, type) : undefined,
      status.success ? eq(formSubmission.status, status.data) : undefined,
      cursor ? lt(formSubmission.id, cursor) : undefined,
    ].filter((f) => f !== undefined);
    const rows = await db.select().from(formSubmission)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(formSubmission.id)).limit(limit + 1);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return c.json({ items, nextCursor: hasMore ? items[items.length - 1].id : null });
  });

  r.get('/submissions/:id', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(formSubmission).where(eq(formSubmission.id, id)).limit(1);
    if (!rows[0]) return c.json(problem(404, 'Submission not found'), 404, { 'Content-Type': P });
    return c.json(rows[0]);
  });

  r.patch('/submissions/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = submissionUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(formSubmission)
      .set({
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.assigneeId !== undefined ? { assigneeId: parsed.data.assigneeId } : {}),
      })
      .where(eq(formSubmission.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Submission not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'submission.update', 'form_submission', String(id), parsed.data);
    return c.json(rows[0]);
  });

  // ==================== P2: RMA board ====================
  r.get('/rma', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 100);
    const status = rmaStatusQ.safeParse(c.req.query('status') ?? undefined);
    const q = c.req.query('q');
    const filters = [
      status.success ? eq(rmaRequest.status, status.data) : undefined,
      q ? ilike(rmaRequest.number, `%${q.replace(/[%_]/g, '')}%`) : undefined,
    ].filter((f) => f !== undefined);
    const rows = await db.select().from(rmaRequest)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(rmaRequest.id)).limit(limit);
    return c.json({ items: rows });
  });

  r.get('/rma/:id', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(rmaRequest).where(eq(rmaRequest.id, id)).limit(1);
    if (!rows[0]) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': P });
    const events = await db.select().from(rmaEvent).where(eq(rmaEvent.rmaId, id)).orderBy(rmaEvent.id);
    return c.json({ ...rows[0], timeline: events });
  });

  r.post('/rma/:id/transition', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));

    const idemKey = c.req.header('Idempotency-Key');
    if (idemKey) {
      const cached = RMA_IDEM.get(idemKey) as { status: number; body: unknown } | undefined;
      if (cached) return c.json(cached.body, cached.status as 200);
    }

    const parsed = rmaTransitionSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.select().from(rmaRequest).where(eq(rmaRequest.id, id)).limit(1);
    const rma = rows[0];
    if (!rma) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': P });

    const legal = RMA_TRANSITIONS[rma.status] ?? [];
    if (!legal.includes(parsed.data.to)) {
      return c.json(problem(422, 'Illegal transition', `RMA ${rma.number} is '${rma.status}'; legal next states: ${legal.join(', ') || 'none'}.`), 422, { 'Content-Type': P });
    }

    const updated = await db.update(rmaRequest)
      .set({ status: parsed.data.to, updatedAt: new Date() })
      .where(eq(rmaRequest.id, id)).returning();
    await db.insert(rmaEvent).values({ rmaId: id, fromStatus: rma.status, toStatus: parsed.data.to, actorId: guard.user.id, note: parsed.data.note ?? null });
    await auditRow(c, guard.user.id, 'rma.transition', 'rma_request', String(id), { from: rma.status, to: parsed.data.to, note: parsed.data.note ?? null });

    if (parsed.data.notifyCustomer) {
      const customer = (rma.customer ?? {}) as Record<string, unknown>;
      if (customer.email) await sendRmaStatusMail(String(customer.email), rma.number, rma.status, parsed.data.to, parsed.data.note);
    }
    const body = updated[0];
    if (idemKey) RMA_IDEM.set(idemKey, { status: 200, body });
    return c.json(body);
  });

  // ==================== P2: job applications (HR) ====================
  r.get('/job-applications', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 100);
    const status = submissionStatusQ.safeParse(c.req.query('status') ?? undefined);
    const rows = await db.select({
      id: jobApplication.id, postingId: jobApplication.postingId, postingTitle: jobPosting.title,
      email: jobApplication.email, payload: jobApplication.payload, status: jobApplication.status,
      refCode: jobApplication.refCode, createdAt: jobApplication.createdAt,
    }).from(jobApplication)
      .leftJoin(jobPosting, eq(jobApplication.postingId, jobPosting.id))
      .where(status.success ? eq(jobApplication.status, status.data) : undefined)
      .orderBy(desc(jobApplication.id)).limit(limit);
    return c.json({ items: rows });
  });

  r.patch('/job-applications/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = jobApplicationUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(jobApplication).set({ status: parsed.data.status }).where(eq(jobApplication.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Application not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'job_application.update', 'job_application', String(id), parsed.data);
    return c.json(rows[0]);
  });

  return r;
}
