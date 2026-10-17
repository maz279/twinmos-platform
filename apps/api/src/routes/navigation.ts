// Navigation API (Tasks C2a, C2b, CMS-E2)
import { Hono } from 'hono';
import { eq, asc, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import type { DB } from '@twinmos/db';
import { navMenu, navItem, auditLog } from '@twinmos/db';
import { problem } from '@twinmos/shared';
import type { Role } from '@twinmos/shared';
import type { AuthSession } from '../auth.ts';
import { recordOutboxEvent } from '../services/outbox.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

const menuBaseSchema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[a-z0-9_-]+$/, 'Letters, digits, dash, underscore only'),
  title: z.string().trim().min(1).max(100),
  locale: z.string().trim(),
});

const menuCreateSchema = menuBaseSchema.extend({
  locale: z.string().trim().default('en'),
});

const menuUpdateSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  locale: z.string().trim().optional(),
});

const itemBaseSchema = z.object({
  parentId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(1).max(100),
  targetType: z.enum(['url', 'page', 'category', 'product', 'article']),
  targetUrl: z.string().trim().nullable().optional(),
  targetId: z.string().trim().nullable().optional(),
  sort: z.number().int(),
  metadata: z.record(z.string(), z.unknown()),
  icon: z.string().trim().nullable().optional(),
  badge: z.string().trim().nullable().optional(),
});

const itemCreateSchema = itemBaseSchema.extend({
  targetType: z.enum(['url', 'page', 'category', 'product', 'article']).default('url'),
  sort: z.number().int().default(0),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const itemUpdateSchema = itemBaseSchema.partial();

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.number().int().positive(),
    parentId: z.number().int().positive().nullable().optional(),
    sort: z.number().int(),
  })),
});

export function navigationRoute(
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

  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null,
      action,
      entity: 'nav_menu',
      entityId,
      diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  // --- 1. List Menus ---
  const listMenus = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;

    const locale = c.req.query('locale');
    const query = locale
      ? db.select().from(navMenu).where(eq(navMenu.locale, locale)).orderBy(asc(navMenu.code))
      : db.select().from(navMenu).orderBy(asc(navMenu.code));

    const menus = await query;
    return c.json({ items: menus });
  };
  r.get('/navigation/menus', listMenus);
  r.get('/menus', listMenus);

  // --- 2. Get Menu by ID (with nested tree) ---
  const getMenu = async (c: any) => {
    const a = await authed(c);
    if (a instanceof Response) return a;

    const id = Number(c.req.param('id'));
    const rows = await db.select().from(navMenu).where(eq(navMenu.id, id)).limit(1);
    const menu = rows[0];
    if (!menu) return c.json(problem(404, 'Menu not found'), 404, { 'Content-Type': P });

    const items = await db
      .select()
      .from(navItem)
      .where(eq(navItem.menuId, id))
      .orderBy(asc(navItem.sort), asc(navItem.id));

    // Nest into tree
    const itemMap = new Map<number, any>();
    const roots: any[] = [];
    for (const item of items) {
      itemMap.set(item.id, { ...item, children: [] });
    }
    for (const item of items) {
      const node = itemMap.get(item.id)!;
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return c.json({ ...menu, items: roots, flatItems: items });
  };
  r.get('/navigation/menus/:id', getMenu);
  r.get('/menus/:id', getMenu);

  // --- 3. Create Menu ---
  const createMenu = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;

    const parsed = menuCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    try {
      const rows = await db.insert(navMenu).values(parsed.data).returning();
      const created = rows[0];
      await auditRow(c, guard.user.id, 'nav_menu.create', String(created.id), parsed.data);
      await recordOutboxEvent(db, 'nav.change', {
        action: 'create',
        menuId: created.id,
        code: created.code,
        tags: ['nav', 'menus'],
      });
      return c.json(created, 201);
    } catch (e: any) {
      if (String(e?.cause ?? e).includes('unique')) {
        return c.json(problem(409, 'Duplicate code', 'A menu with this code already exists.'), 409, { 'Content-Type': P });
      }
      throw e;
    }
  };
  r.post('/navigation/menus', createMenu);
  r.post('/menus', createMenu);

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

  // --- 4. Update Menu ---
  const updateMenu = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;

    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = menuUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const patchData = prunePatch(rawJson, parsed.data);
    const rows = await db
      .update(navMenu)
      .set({ ...patchData, updatedAt: new Date() })
      .where(eq(navMenu.id, id))
      .returning();

    const updated = rows[0];
    if (!updated) return c.json(problem(404, 'Menu not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'nav_menu.update', String(id), patchData);
    await recordOutboxEvent(db, 'nav.change', {
      action: 'update',
      menuId: updated.id,
      code: updated.code,
      tags: ['nav', 'menus'],
    });

    return c.json(updated);
  };
  r.put('/navigation/menus/:id', updateMenu);
  r.patch('/navigation/menus/:id', updateMenu);
  r.put('/menus/:id', updateMenu);
  r.patch('/menus/:id', updateMenu);

  // --- 5. Delete Menu ---
  const deleteMenu = async (c: any) => {
    const guard = await authed(c, 'admin');
    if (guard instanceof Response) return guard;

    const id = Number(c.req.param('id'));
    const rows = await db.delete(navMenu).where(eq(navMenu.id, id)).returning();
    const deleted = rows[0];
    if (!deleted) return c.json(problem(404, 'Menu not found'), 404, { 'Content-Type': P });

    await auditRow(c, guard.user.id, 'nav_menu.delete', String(id), {});
    await recordOutboxEvent(db, 'nav.change', {
      action: 'delete',
      menuId: deleted.id,
      code: deleted.code,
      tags: ['nav', 'menus'],
    });

    return c.json({ deleted: true });
  };
  r.delete('/navigation/menus/:id', deleteMenu);
  r.delete('/menus/:id', deleteMenu);

  // --- 6. Add Item to Menu ---
  const addItem = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;

    const menuId = Number(c.req.param('id'));
    const menuRows = await db.select().from(navMenu).where(eq(navMenu.id, menuId)).limit(1);
    if (!menuRows[0]) return c.json(problem(404, 'Menu not found'), 404, { 'Content-Type': P });

    const parsed = itemCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const rows = await db
      .insert(navItem)
      .values({ ...parsed.data, menuId })
      .returning();

    const item = rows[0];
    await auditRow(c, guard.user.id, 'nav_item.create', String(item.id), parsed.data);
    await recordOutboxEvent(db, 'nav.change', {
      action: 'item_create',
      menuId,
      code: menuRows[0].code,
      tags: ['nav', 'menus'],
    });

    return c.json(item, 201);
  };
  r.post('/navigation/menus/:id/items', addItem);
  r.post('/menus/:id/items', addItem);

  // --- 7. Update Item ---
  const updateItem = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;

    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    const parsed = itemUpdateSchema.safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const existingRows = await db.select().from(navItem).where(eq(navItem.id, id)).limit(1);
    const existing = existingRows[0];
    if (!existing) return c.json(problem(404, 'Item not found'), 404, { 'Content-Type': P });

    const patchData = prunePatch(rawJson, parsed.data);
    const rows = await db.update(navItem).set(patchData).where(eq(navItem.id, id)).returning();
    const updated = rows[0];

    const menuRows = await db.select().from(navMenu).where(eq(navMenu.id, existing.menuId)).limit(1);
    await auditRow(c, guard.user.id, 'nav_item.update', String(id), patchData);
    await recordOutboxEvent(db, 'nav.change', {
      action: 'item_update',
      menuId: existing.menuId,
      code: menuRows[0]?.code ?? 'menu',
      tags: ['nav', 'menus'],
    });

    return c.json(updated);
  };
  r.put('/navigation/items/:id', updateItem);
  r.patch('/navigation/items/:id', updateItem);
  r.put('/items/:id', updateItem);
  r.patch('/items/:id', updateItem);

  // --- 8. Delete Item ---
  const deleteItem = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;

    const id = Number(c.req.param('id'));
    const rows = await db.delete(navItem).where(eq(navItem.id, id)).returning();
    const deleted = rows[0];
    if (!deleted) return c.json(problem(404, 'Item not found'), 404, { 'Content-Type': P });

    const menuRows = await db.select().from(navMenu).where(eq(navMenu.id, deleted.menuId)).limit(1);
    await auditRow(c, guard.user.id, 'nav_item.delete', String(id), {});
    await recordOutboxEvent(db, 'nav.change', {
      action: 'item_delete',
      menuId: deleted.menuId,
      code: menuRows[0]?.code ?? 'menu',
      tags: ['nav', 'menus'],
    });

    return c.json({ deleted: true });
  };
  r.delete('/navigation/items/:id', deleteItem);
  r.delete('/items/:id', deleteItem);

  // --- 9. Reorder Items in Menu (Keyboard & Drag support, SC 2.5.7) ---
  const reorderItems = async (c: any) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;

    const menuId = Number(c.req.param('id'));
    const menuRows = await db.select().from(navMenu).where(eq(navMenu.id, menuId)).limit(1);
    if (!menuRows[0]) return c.json(problem(404, 'Menu not found'), 404, { 'Content-Type': P });

    const parsed = reorderSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    for (const update of parsed.data.items) {
      await db
        .update(navItem)
        .set({
          sort: update.sort,
          parentId: update.parentId !== undefined ? update.parentId : undefined,
        })
        .where(and(eq(navItem.id, update.id), eq(navItem.menuId, menuId)));
    }

    await auditRow(c, guard.user.id, 'nav_menu.reorder', String(menuId), { count: parsed.data.items.length });
    await recordOutboxEvent(db, 'nav.change', {
      action: 'reorder',
      menuId,
      code: menuRows[0].code,
      tags: ['nav', 'menus'],
    });

    return c.json({ reordered: true, count: parsed.data.items.length });
  };
  r.put('/navigation/menus/:id/reorder', reorderItems);
  r.put('/menus/:id/reorder', reorderItems);

  return r;
}
