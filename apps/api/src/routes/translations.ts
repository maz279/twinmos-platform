// P4 translations — string store behind the translation workflow (export →
// translate → import). Writes are super_admin (docs/04 Settings family); the
// public bundle endpoint serves the merged JSON the website consumes.
import { Hono } from 'hono';
import { and, asc, eq } from 'drizzle-orm';
import {
  translationUpsertSchema, translationImportSchema, translationDeleteSchema,
  LOCALE_SCHEMA, problem,
} from '@twinmos/shared';
import { translation, auditLog } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

export function translationsRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  async function superGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('super_admin')(c.req.raw)) ? s : c.json(problem(403, 'Requires super_admin role'), 403, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity: 'translation', entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  /** List strings for a locale (optionally one ns) — the export source. */
  r.get('/translations', async (c) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    const locale = LOCALE_SCHEMA.safeParse(c.req.query('locale') ?? undefined);
    if (!locale.success) return c.json(problem(422, 'Validation Failed', 'locale must be one of the 9 supported codes.'), 422, { 'Content-Type': P });
    const ns = c.req.query('ns');
    const filters = [
      eq(translation.locale, locale.data),
      ns ? eq(translation.ns, ns) : undefined,
    ].filter((f) => f !== undefined);
    const rows = await db.select().from(translation)
      .where(and(...filters)).orderBy(asc(translation.ns), asc(translation.key)).limit(5000);
    return c.json({ items: rows });
  });

  /** Upsert a single string. */
  r.put('/translations', async (c) => {
    const guard = await superGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = translationUpsertSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const { locale, ns, key, value } = parsed.data;
    await db.insert(translation).values({ locale, ns, key, value, updatedBy: guard.user.id })
      .onConflictDoUpdate({
        target: [translation.locale, translation.ns, translation.key],
        set: { value, updatedBy: guard.user.id, updatedAt: new Date() },
      });
    await auditRow(c, guard.user.id, 'translation.upsert', `${locale}:${ns}:${key}`, { len: value.length });
    return c.json({ locale, ns, key, stored: true });
  });

  /** Bulk import (translation workflow "import" leg) — upsert every pair. */
  r.post('/translations/import', async (c) => {
    const guard = await superGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = translationImportSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const { locale, ns, strings } = parsed.data;
    const entries = Object.entries(strings);
    let imported = 0;
    for (const [key, value] of entries) {
      await db.insert(translation).values({ locale, ns, key, updatedBy: guard.user.id, value })
        .onConflictDoUpdate({
          target: [translation.locale, translation.ns, translation.key],
          set: { value, updatedBy: guard.user.id, updatedAt: new Date() },
        });
      imported += 1;
    }
    await auditRow(c, guard.user.id, 'translation.import', `${locale}:${ns}`, { count: imported });
    return c.json({ locale, ns, imported });
  });

  r.delete('/translations', async (c) => {
    const guard = await superGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = translationDeleteSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const { locale, ns, key } = parsed.data;
    const rows = await db.delete(translation)
      .where(and(eq(translation.locale, locale), eq(translation.ns, ns), eq(translation.key, key)))
      .returning();
    if (!rows[0]) return c.json(problem(404, 'Translation not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'translation.delete', `${locale}:${ns}:${key}`, {});
    return c.json({ deleted: true });
  });

  return r;
}

/** Public i18n bundle the website boots with: { ns: { key: value } } merged. */
export function i18nPublicRoute(db: DB) {
  const r = new Hono();
  r.get('/i18n/:locale', async (c) => {
    const locale = LOCALE_SCHEMA.safeParse(c.req.param('locale'));
    if (!locale.success) return c.json(problem(404, 'Unknown locale'), 404, { 'Content-Type': P });
    const rows = await db.select().from(translation).where(eq(translation.locale, locale.data)).limit(5000);
    const bundle: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      (bundle[row.ns] ??= {})[row.key] = row.value;
    }
    c.header('Cache-Control', 'public, max-age=60');
    return c.json({ locale: locale.data, strings: bundle });
  });
  return r;
}
