// P3 settings — key/value settings (incl. menus as a settings key), redirects
// manager, locales. Settings/menus/redirects are super_admin/admin per the
// docs/04 RBAC matrix; locales read-only for admin+.
import { Hono } from 'hono';
import { asc, eq } from 'drizzle-orm';
import {
  redirectCreateSchema,
  redirectUpdateSchema,
  settingUpdateSchema,
  problem,
  SETTINGS_GROUP_SCHEMAS,
  normalizeSettingsGroup,
} from '@twinmos/shared';
import type { Role, SettingsGroupKey } from '@twinmos/shared';
import { setting, redirect, locale, auditLog } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';
import { recordOutboxEvent } from '../services/outbox.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

const RESERVED_LIVE_ROUTES = new Set([
  '/',
  '/shop',
  '/shop.html',
  '/product',
  '/product.html',
  '/where-to-buy',
  '/where-to-buy.html',
  '/compatibility',
  '/compatibility.html',
  '/support',
  '/support.html',
  '/rma',
  '/rma.html',
  '/careers',
  '/careers.html',
  '/partners',
  '/partners.html',
  '/quote',
  '/quote.html',
  '/contact',
  '/contact.html',
  '/about',
  '/about.html',
  '/technology',
  '/technology.html',
  '/gaming',
  '/gaming.html',
  '/solutions',
  '/solutions.html',
  '/learn',
  '/learn.html',
  '/learn-guides',
  '/learn-guides.html',
  '/learn-explained',
  '/learn-explained.html',
  '/learn-benchmarks',
  '/learn-benchmarks.html',
  '/learn-glossary',
  '/learn-glossary.html',
  '/learn-blog',
  '/learn-blog.html',
  '/news',
  '/news.html',
  '/legal',
  '/legal.html',
  '/compare',
  '/compare.html',
  '/search',
  '/search.html',
  '/sitemap.xml',
  '/robots.txt',
  '/internal',
]);

const SECRET_FIELD = /(secret|password|token|private|api[_-]?key)/i;

/**
 * Audit rows must never contain credential-shaped values. Whole secret-named
 * keys are redacted outright; object groups (integrations) keep their public
 * fields and redact credential-shaped members.
 */
function redactForAudit(key: string, value: unknown, isSecretKey: boolean) {
  if (isSecretKey) return { redacted: true };
  if (key === 'integrations' && value && typeof value === 'object' && !Array.isArray(value)) {
    const out: Record<string, unknown> = {};
    for (const [field, fieldValue] of Object.entries(value as Record<string, unknown>)) {
      out[field] = SECRET_FIELD.test(field) ? '[redacted]' : fieldValue;
    }
    return { value: out };
  }
  return { value };
}

function validateRedirectRules(from: string, to: string, existingRedirects: Array<{ id: number; from: string; to: string }>, currentId?: number) {  const normFrom = from.trim().toLowerCase();
  const normTo = to.trim().toLowerCase();

  if (normFrom === normTo) {
    return 'Self-redirect detected: source and destination cannot be identical.';
  }

  if (RESERVED_LIVE_ROUTES.has(normFrom) || normFrom.startsWith('/api') || normFrom.startsWith('/admin')) {
    return `Source path collides with an active system route (${from}).`;
  }

  for (const r of existingRedirects) {
    if (currentId !== undefined && r.id === currentId) continue;
    const rFrom = r.from.trim().toLowerCase();
    const rTo = r.to.trim().toLowerCase();

    // Loop detection: existing redirect in reverse direction
    if (rFrom === normTo && rTo === normFrom) {
      return `Redirect loop detected between '${from}' and '${to}'.`;
    }

    // Chain detection: target is already a source, or source is already a target
    if (rFrom === normTo) {
      return `Redirect chain detected: destination '${to}' is already a redirect source (to '${r.to}').`;
    }
    if (rTo === normFrom) {
      return `Redirect chain detected: source '${from}' is already a redirect destination (from '${r.from}').`;
    }
  }
  return null;
}

export function settingsRoute(db: DB, deps: { requireRole: (r: Role) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  /** Session + RBAC guard (defaults to viewer; returns session or 401/403). */
  async function authed(c: any, minRole: Role = 'viewer'): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    const ok = await deps.requireRole(minRole)(c.req.raw);
    return ok ? s : c.json(problem(403, `Requires ${minRole} role or above`), 403, { 'Content-Type': P });
  }
  async function roleGuard(c: any, role: Role): Promise<Exclude<AuthSession, null> | Response> {
    return authed(c, role);
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

  r.get('/settings/:key', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const key = c.req.param('key');
    const rows = await db.select().from(setting).where(eq(setting.key, key)).limit(1);
    if (!rows[0]) {
      // Known typed group with no stored row: return the schema defaults.
      if (key in SETTINGS_GROUP_SCHEMAS) {
        try {
          const defaultVal = normalizeSettingsGroup(key as SettingsGroupKey, {});
          return c.json({ key, value: defaultVal, isDefault: true });
        } catch {
          return c.json({ key, value: null, isDefault: true, invalid: true });
        }
      }
      return c.json(problem(404, 'Setting not found'), 404, { 'Content-Type': P });
    }
    return c.json(rows[0]);
  });

  r.put('/settings', async (c) => {
    const guard = await roleGuard(c, 'super_admin'); // docs/04 RBAC: Settings/integrations = super_admin only
    if (guard instanceof Response) return guard;
    const parsed = settingUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    // Validate typed settings group schemas (MS4.2 / T4.2.1) and normalise the
    // value so a partial PUT keeps the group defaults instead of erasing them.
    let storedValue: unknown = parsed.data.value;
    if (parsed.data.key in SETTINGS_GROUP_SCHEMAS) {
      const groupSchema = SETTINGS_GROUP_SCHEMAS[parsed.data.key as SettingsGroupKey];
      const groupParsed = groupSchema.safeParse(parsed.data.value);
      if (!groupParsed.success) {
        return c.json(
          problem(422, 'Invalid settings group value', `Validation failed for group '${parsed.data.key}'`, groupParsed.error.issues),
          422,
          { 'Content-Type': P }
        );
      }
      storedValue = normalizeSettingsGroup(parsed.data.key as SettingsGroupKey, parsed.data.value);
    }

    // secret-shaped keys are write-only: never returned, only acknowledged
    const isSecret = /key|secret|password|token/i.test(parsed.data.key);
    await db.insert(setting).values({ key: parsed.data.key, value: storedValue as any, updatedAt: new Date() })
      .onConflictDoUpdate({ target: setting.key, set: { value: storedValue as any, updatedAt: new Date() } });
    await auditRow(c, guard.user.id, 'setting.update', 'setting', parsed.data.key, redactForAudit(parsed.data.key, storedValue, isSecret));

    // Task T3.5.3: record outbox row for settings / menus change
    try {
      const isMenu = parsed.data.key === 'menus' || parsed.data.key.startsWith('menus.');
      const isSiteSetting = parsed.data.key.startsWith('site.') || parsed.data.key === 'seo.defaults' || parsed.data.key === 'integrations';
      const tags = isMenu ? ['menus', 'header', 'footer', 'nav'] : isSiteSetting ? ['settings', 'site'] : ['settings', 'robots'];
      await recordOutboxEvent(db, isMenu ? 'menu.update' : 'settings.update', {
        entityType: 'setting',
        entityId: parsed.data.key,
        action: 'update',
        tags,
        paths: ['/'],
      });
    } catch {}

    return c.json({ key: parsed.data.key, stored: true, secret: isSecret, value: storedValue });
  });

  r.put('/settings/:key', async (c) => {
    const guard = await roleGuard(c, 'super_admin');
    if (guard instanceof Response) return guard;
    const key = c.req.param('key');
    const raw = await c.req.json().catch(() => ({}));
    const val = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw;
    const parsed = settingUpdateSchema.safeParse({ key, value: val });
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    let storedValue: unknown = parsed.data.value;
    if (key in SETTINGS_GROUP_SCHEMAS) {
      const groupSchema = SETTINGS_GROUP_SCHEMAS[key as SettingsGroupKey];
      const groupParsed = groupSchema.safeParse(parsed.data.value);
      if (!groupParsed.success) {
        return c.json(
          problem(422, 'Invalid settings group value', `Validation failed for group '${key}'`, groupParsed.error.issues),
          422,
          { 'Content-Type': P }
        );
      }
      storedValue = normalizeSettingsGroup(key as SettingsGroupKey, parsed.data.value);
    }

    const isSecret = /key|secret|password|token/i.test(key);
    await db.insert(setting).values({ key, value: storedValue as any, updatedAt: new Date() })
      .onConflictDoUpdate({ target: setting.key, set: { value: storedValue as any, updatedAt: new Date() } });
    await auditRow(c, guard.user.id, 'setting.update', 'setting', key, redactForAudit(key, storedValue, isSecret));

    try {
      const isMenu = key === 'menus' || key.startsWith('menus.');
      const isSiteSetting = key.startsWith('site.') || key === 'seo.defaults' || key === 'integrations';
      const tags = isMenu ? ['menus', 'header', 'footer', 'nav'] : isSiteSetting ? ['settings', 'site'] : ['settings', 'robots'];
      await recordOutboxEvent(db, isMenu ? 'menu.update' : 'settings.update', {
        entityType: 'setting',
        entityId: key,
        action: 'update',
        tags,
        paths: ['/'],
      });
    } catch {}

    return c.json({ key, stored: true, secret: isSecret, value: storedValue });
  });

  function prunePatch<T extends Record<string, any>>(raw: any, parsed: T): Partial<T> {
    const out: any = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    for (const k of Object.keys(parsed)) {
      if (Object.prototype.hasOwnProperty.call(raw, k)) {
        out[k] = (parsed as any)[k];
      }
    }
    return out;
  }

  // ---------- redirects ----------
  r.get('/redirects', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const rows = await db.select().from(redirect).orderBy(asc(redirect.id));
    return c.json({ items: rows });
  });

  r.post('/redirects', async (c) => {
    const guard = await roleGuard(c, 'super_admin');
    if (guard instanceof Response) return guard;
    const parsed = redirectCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    
    const existing = await db.select().from(redirect);
    const err = validateRedirectRules(parsed.data.from, parsed.data.to, existing);
    if (err) return c.json(problem(422, 'Invalid Redirect', err), 422, { 'Content-Type': P });

    try {
      const rows = await db.insert(redirect).values(parsed.data).returning();
      await auditRow(c, guard.user.id, 'redirect.create', 'redirect', String(rows[0].id), parsed.data);

      // Task T3.5.3 & T3.5.7: Cache results under tag 'redirects'; outbox invalidates it
      try {
        await recordOutboxEvent(db, 'redirect.create', {
          entityType: 'redirect',
          entityId: rows[0].id,
          action: 'create',
          tags: ['redirects'],
          paths: [parsed.data.from],
        });
      } catch {}

      return c.json(rows[0], 201);
    } catch (e: any) {
      if (String(e?.cause ?? e).includes('unique')) {
        return c.json(problem(409, 'Duplicate redirect', 'A redirect from this path already exists.'), 409, { 'Content-Type': P });
      }
      throw e;
    }
  });

  const updateRedirect = async (c: any) => {
    const guard = await roleGuard(c, 'super_admin');
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = redirectUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    
    const existing = await db.select().from(redirect);
    const targetRow = existing.find(r => r.id === id);
    if (!targetRow) return c.json(problem(404, 'Redirect not found'), 404, { 'Content-Type': P });

    const patchData = prunePatch(rawJson, parsed.data);
    const newFrom = patchData.from ?? targetRow.from;
    const newTo = patchData.to ?? targetRow.to;
    const err = validateRedirectRules(newFrom, newTo, existing, id);
    if (err) return c.json(problem(422, 'Invalid Redirect', err), 422, { 'Content-Type': P });

    const rows = await db.update(redirect).set(patchData).where(eq(redirect.id, id)).returning();
    await auditRow(c, guard.user.id, 'redirect.update', 'redirect', String(id), patchData);

    // Task T3.5.3 & T3.5.7: Cache results under tag 'redirects'; outbox invalidates it
    try {
      await recordOutboxEvent(db, 'redirect.update', {
        entityType: 'redirect',
        entityId: id,
        action: 'update',
        tags: ['redirects'],
        paths: Array.from(new Set([newFrom, targetRow.from, newTo, targetRow.to].filter(Boolean) as string[])),
      });
    } catch {}

    return c.json(rows[0]);
  };
  r.patch('/redirects/:id', updateRedirect);
  r.put('/redirects/:id', updateRedirect);

  r.delete('/redirects/:id', async (c) => {
    const guard = await roleGuard(c, 'super_admin');
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(redirect).where(eq(redirect.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Redirect not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'redirect.delete', 'redirect', String(id), {});

    // Task T3.5.3 & T3.5.7: Cache results under tag 'redirects'; outbox invalidates it
    try {
      await recordOutboxEvent(db, 'redirect.delete', {
        entityType: 'redirect',
        entityId: id,
        action: 'delete',
        tags: ['redirects'],
        paths: [rows[0].from],
      });
    } catch {}

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
