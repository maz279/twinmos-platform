// Admin CRUD (products shown as the reference module; other entities follow this pattern in P2/P3).
// Every mutation: session + RBAC guard, Zod validation, parameter-bound Drizzle queries, audit row.
import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { productCreateSchema, productUpdateSchema, problem } from '@twinmos/shared';
import { auditLog, product } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

export function adminRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  async function actor(c: any) {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) { c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P }); return null; }
    return s;
  }
  async function audit(actorId: string | undefined, action: string, entityId: string, diff: unknown, c: any) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity: 'product', entityId,
      diff: diff ?? null, requestId: c.req.header('X-Request-Id') ?? null, ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  r.use('*', async (c, next) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    await next();
  });

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
    const a = await actor(c); if (!a) return null as any;
    const guard = await deps.requireRole('editor')(c.req.raw);
    if (!guard) return c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
    const parsed = productCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.insert(product).values(parsed.data).returning();
    await audit(a.user.id, 'product.create', String(rows[0].id), parsed.data, c);
    return c.json(rows[0], 201);
  });

  r.patch('/products/:id', async (c) => {
    const a = await actor(c); if (!a) return null as any;
    const guard = await deps.requireRole('editor')(c.req.raw);
    if (!guard) return c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
    const id = Number(c.req.param('id'));
    const parsed = productUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(product).set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(product.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': P });
    await audit(a.user.id, 'product.update', String(id), parsed.data, c);
    return c.json(rows[0]);
  });

  r.get('/audit', async (c) => {
    const a = await actor(c); if (!a) return null as any;
    const guard = await deps.requireRole('admin')(c.req.raw);
    if (!guard) return c.json(problem(403, 'Requires admin role or above'), 403, { 'Content-Type': P });
    const rows = await db.select().from(auditLog).orderBy(desc(auditLog.id)).limit(100);
    return c.json({ items: rows });
  });

  return r;
}
