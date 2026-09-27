// P3 settings — key/value settings (incl. menus as a settings key), redirects
// manager, locales. Settings/menus/redirects are super_admin/admin per the
// docs/04 RBAC matrix; locales read-only for admin+.
import { Hono } from 'hono';
import { asc, eq } from 'drizzle-orm';
import { redirectCreateSchema, redirectUpdateSchema, settingUpdateSchema, problem } from '@twinmos/shared';
import { setting, redirect, locale, auditLog } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

export function settingsRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  async function roleGuard(c: any, role: string): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole(role)(c.req.raw)) ? s : c.json(problem(403, `Requires ${role} role or above`), 403, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entity: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity, entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  // ---------- settings (menus live under the 'menus' key) ----------
  r.get('/settings', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const rows = await db.select().from(setting);
    return c.json({ items: rows });
  });

  r.put('/settings', async (c) => {
    const guard = await roleGuard(c, 'admin'); // settings/integrations = super_admin per docs/04; admin manages menus/redirects keys
    if (guard instanceof Response) return guard;
    const parsed = settingUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    // secret-shaped keys are write-only: never returned, only acknowledged
    const isSecret = /key|secret|password|token/i.test(parsed.data.key);
    await db.insert(setting).values({ key: parsed.data.key, value: parsed.data.value as any, updatedAt: new Date() })
      .onConflictDoUpdate({ target: setting.key, set: { value: parsed.data.value as any, updatedAt: new Date() } });
    await auditRow(c, guard.user.id, 'setting.update', 'setting', parsed.data.key, isSecret ? { redacted: true } : { value: parsed.data.value });
    return c.json({ key: parsed.data.key, stored: true, secret: isSecret });
  });

  // ---------- redirects ----------
  r.get('/redirects', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const rows = await db.select().from(redirect).orderBy(asc(redirect.id));
    return c.json({ items: rows });
  });

  r.post('/redirects', async (c) => {
    const guard = await roleGuard(c, 'admin');
    if (guard instanceof Response) return guard;
    const parsed = redirectCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    try {
      const rows = await db.insert(redirect).values(parsed.data).returning();
      await auditRow(c, guard.user.id, 'redirect.create', 'redirect', String(rows[0].id), parsed.data);
      return c.json(rows[0], 201);
    } catch (e: any) {
      if (String(e?.cause ?? e).includes('unique')) {
        return c.json(problem(409, 'Duplicate redirect', 'A redirect from this path already exists.'), 409, { 'Content-Type': P });
      }
      throw e;
    }
  });

  r.patch('/redirects/:id', async (c) => {
    const guard = await roleGuard(c, 'admin');
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = redirectUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(redirect).set(parsed.data).where(eq(redirect.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Redirect not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'redirect.update', 'redirect', String(id), parsed.data);
    return c.json(rows[0]);
  });

  r.delete('/redirects/:id', async (c) => {
    const guard = await roleGuard(c, 'admin');
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(redirect).where(eq(redirect.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Redirect not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'redirect.delete', 'redirect', String(id), {});
    return c.json({ deleted: true });
  });

  // ---------- locales ----------
  r.get('/locales', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const rows = await db.select().from(locale);
    return c.json({ items: rows });
  });

  r.patch('/locales/:code', async (c) => {
    const guard = await roleGuard(c, 'super_admin');
    if (guard instanceof Response) return guard;
    const code = c.req.param('code');
    const active = (await c.req.json().catch(() => ({}))).active;
    if (typeof active !== 'boolean') return c.json(problem(422, 'Validation Failed', 'active must be boolean.'), 422, { 'Content-Type': P });
    const rows = await db.update(locale).set({ active }).where(eq(locale.code, code)).returning();
    if (!rows[0]) return c.json(problem(404, 'Locale not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'locale.update', 'locale', code, { active });
    return c.json(rows[0]);
  });

  return r;
}
