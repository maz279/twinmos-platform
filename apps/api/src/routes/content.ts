// P3 CMS content — CRUD for article/news/page/faq with the publishing workflow
// (draft → in_review → scheduled(publishAt) → published → archived), revision
// snapshots on publish with one-click rollback, TTL preview URLs, and a
// scheduled promoter. RBAC per docs/04: authors edit but cannot publish;
// editors publish; deletion is admin+; all mutations audited.
import { Hono } from 'hono';
import { and, count, desc, eq, ilike, isNull, lte, sql } from 'drizzle-orm';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';
import {
  articleCreateSchema, articleUpdateSchema, newsCreateSchema, newsUpdateSchema,
  pageCreateSchema, pageUpdateSchema, faqCreateSchema, faqUpdateSchema,
  contentTransitionSchema, contentRevertSchema, CONTENT_TRANSITIONS, CONTENT_ENTITY_SCHEMA,
  CONTENT_STATUS, problem, slugify, sameInstant,
} from '@twinmos/shared';
import { article, newsPost, page, faq, contentRevision, contentComment, auditLog, user } from '@twinmos/db';
import { IdempotencyStore } from '../idem.ts';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';
const TRANSITION_IDEM = new IdempotencyStore();

/** Phase 2 §2.3: review-comment body contract. */
const commentBodySchema = z.object({ body: z.string().trim().min(1).max(2000) });

/** Preview tokens: random, TTL-bounded, in-memory (Redis in prod). */
const PREVIEW_TTL_MS = Number(process.env.PREVIEW_TTL_MS ?? 30 * 60 * 1000);
const PREVIEWS = new Map<string, { entity: string; id: number; expiresAt: number }>();
function newPreviewToken(entity: string, id: number): string {
  const token = crypto.randomUUID() + crypto.randomUUID().slice(0, 8);
  PREVIEWS.set(token, { entity, id, expiresAt: Date.now() + previewTtlMs() });
  if (PREVIEWS.size > 1000) { // cheap bound
    for (const [k, v] of PREVIEWS) if (v.expiresAt < Date.now()) PREVIEWS.delete(k);
  }
  return token;
}
/** TTL is read per-mint so tests can shorten it via env without re-import. */
function previewTtlMs(): number {
  return Number(process.env.PREVIEW_TTL_MS ?? PREVIEW_TTL_MS);
}
/** Test hook: expire every currently-minted preview token immediately. */
export function __expirePreviewTokensForTest(): void {
  for (const [k, v] of PREVIEWS) v.expiresAt = Date.now() - 1;
}

const TABLES = { article, news: newsPost, page, faq } as const;
type EntityType = keyof typeof TABLES;
/** Generic per-entity table handle: columns differ (faq has no slug/deletedAt),
 *  so route access through one typed escape instead of fighting the union. */
const tableOf = (entity: EntityType): any => TABLES[entity];
const row0 = (rows: unknown[]): any => (rows as any[])[0];

export function contentRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  /** author+ guard (create/edit); returns session or 401/403 Response. */
  async function authorGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('author')(c.req.raw)) ? s : c.json(problem(403, 'Requires author role or above'), 403, { 'Content-Type': P });
  }
  /** editor+ guard (publish/revert). */
  async function editorGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('editor')(c.req.raw)) ? s : c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entity: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity, entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  function resolveEntity(c: any): EntityType | Response {
    const parsed = CONTENT_ENTITY_SCHEMA.safeParse(c.req.param('entity'));
    return parsed.success ? parsed.data : c.json(problem(404, 'Unknown content entity', "entity must be one of article, news, page, faq"), 404, { 'Content-Type': P });
  }

  const createSchemas = { article: articleCreateSchema, news: newsCreateSchema, page: pageCreateSchema, faq: faqCreateSchema };
  const updateSchemas = { article: articleUpdateSchema, news: newsUpdateSchema, page: pageUpdateSchema, faq: faqUpdateSchema };

  /** Maps a validated payload onto table columns (faq has no slug column;
   *  every entity starts as a draft regardless of table defaults). */
  function toColumns(entity: EntityType, data: Record<string, unknown>, actorId: string) {
    if (entity === 'article') return { ...data, authorId: actorId, status: 'draft' };
    if (entity === 'news') {
      // timestamp column needs a Date, not the ISO string the contract carries
      const { eventDate, ...rest } = data as Record<string, unknown>;
      return { ...rest, status: 'draft', eventDate: eventDate ? new Date(String(eventDate)) : null };
    }
    if (entity === 'page') return { ...data, status: 'draft' };
    const { locale, ...rest } = data as Record<string, unknown>;
    return { ...rest, locale: locale ?? 'en', status: 'draft' };
  }

  // ---------- list / detail ----------
  r.get('/content/:entity', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const limit = Math.min(Number(c.req.query('limit') ?? 25) || 25, 100);
    const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0);
    const q = (c.req.query('q') ?? '').trim();
    const statusQ = z.enum(CONTENT_STATUS).safeParse(c.req.query('status') ?? undefined);
    const t = tableOf(entity);
    // Library search: substring match on the display title (FAQ → question)
    const filters = [
      statusQ.success ? eq(t.status, statusQ.data) : undefined,
      entity !== 'faq' ? isNull(t.deletedAt) : undefined,
      q ? ilike(entity === 'faq' ? t.question : t.title, `%${q}%`) : undefined,
    ].filter((f) => f !== undefined);
    const where = filters.length ? and(...filters) : undefined;
    const rows = await (db.select().from(t) as any)
      .where(where).orderBy(desc(t.id)).limit(limit).offset(offset);
    // Total for pagination — the studio library pages through large draft backlogs
    const [{ n }] = await (db.select({ n: count() }).from(t) as any).where(where);
    return c.json({ items: rows, total: Number(n) });
  });

  r.get('/content/:entity/:id', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const rows = await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1);
    if (!row0(rows)) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });
    return c.json(row0(rows));
  });

  // ---------- create / update ----------
  r.post('/content/:entity', async (c) => {
    const guard = await authorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const parsed = createSchemas[entity].safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    let data = parsed.data as Record<string, unknown>;
    // allow slug to be derived from the title when omitted
    if (entity !== 'faq' && !data.slug && data.title) data = { ...data, slug: slugify(String(data.title)) };
    try {
      const rows = await (db.insert(tableOf(entity)) as any).values(toColumns(entity, data, guard.user.id)).returning();
      const created = row0(rows);
      await auditRow(c, guard.user.id, `${entity}.create`, entity, String(created.id), { slug: created.slug ?? String(created.question ?? '').slice(0, 60) });
      return c.json(created, 201);
    } catch (e: any) {
      if (String(e?.cause ?? e).includes('unique')) {
        return c.json(problem(409, 'Duplicate slug', 'A published or draft item already uses this slug in that locale.'), 409, { 'Content-Type': P });
      }
      throw e;
    }
  });

  r.patch('/content/:entity/:id', async (c) => {
    const guard = await authorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const parsed = updateSchemas[entity].safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const existing = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    if (!existing) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });
    // authors may only edit their own drafts; editor+ edits anything
    if (guard.user.role === 'author' && existing.authorId !== guard.user.id) {
      return c.json(problem(403, 'Authors may only edit their own content'), 403, { 'Content-Type': P });
    }
    // Phase 3.4: optimistic locking — a stale If-Match (the updatedAt the
    // editor loaded) means someone else saved first; refuse with 409.
    const ifMatch = c.req.header('if-match');
    if (ifMatch && !sameInstant(ifMatch, existing.updatedAt)) {
      return c.json(problem(409, 'Conflict', 'This item was modified by someone else after you loaded it. Reload the latest version and re-apply your changes.'), 409, { 'Content-Type': P });
    }

    const patch: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
    if ((parsed.data as any).eventDate !== undefined) patch.eventDate = (parsed.data as any).eventDate ? new Date((parsed.data as any).eventDate) : null;
    const rows = await (db.update(tableOf(entity)) as any).set(patch).where(eq(tableOf(entity).id, id)).returning();
    await auditRow(c, guard.user.id, `${entity}.update`, entity, String(id), parsed.data);
    return c.json(row0(rows));
  });

  // soft delete (admin+ per RBAC matrix)
  r.delete('/content/:entity/:id', async (c) => {
    const guard = await authed(c);
    if (guard instanceof Response) return guard;
    if (!(await deps.requireRole('admin')(c.req.raw))) {
      return c.json(problem(403, 'Requires admin role or above'), 403, { 'Content-Type': P });
    }
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const rows = await (db.update(tableOf(entity)) as any).set({ deletedAt: new Date() }).where(eq(tableOf(entity).id, id)).returning();
    if (!row0(rows)) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, `${entity}.delete`, entity, String(id), {});
    return c.json({ deleted: true });
  });

  // ---------- workflow ----------
  r.post('/content/:entity/:id/transition', async (c) => {
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));

    const idemKey = c.req.header('Idempotency-Key');
    if (idemKey) {
      const cached = TRANSITION_IDEM.get(idemKey) as { status: number; body: unknown } | undefined;
      if (cached) return c.json(cached.body, cached.status as 200);
    }

    const parsed = contentTransitionSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    // publishing/scheduling needs editor+; other moves (draft→in_review) author+
    const guard = parsed.data.to === 'published' || parsed.data.to === 'scheduled'
      ? await editorGuard(c) : await authorGuard(c);
    if (guard instanceof Response) return guard;

    const existing = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    if (!existing) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });

    const legal = CONTENT_TRANSITIONS[existing.status as keyof typeof CONTENT_TRANSITIONS] ?? [];
    if (!legal.includes(parsed.data.to)) {
      return c.json(problem(422, 'Illegal transition', `'${existing.status}' can move to: ${legal.join(', ') || 'none'}.`), 422, { 'Content-Type': P });
    }
    if (parsed.data.to === 'scheduled' && !parsed.data.publishAt) {
      return c.json(problem(422, 'Validation Failed', 'scheduled requires publishAt (ISO datetime).'), 422, { 'Content-Type': P });
    }

    const patch: Record<string, unknown> = { status: parsed.data.to, updatedAt: new Date() };
    if (parsed.data.publishAt) patch.publishAt = new Date(parsed.data.publishAt);

    // publishing snapshots the PRIOR version for rollback
    if (parsed.data.to === 'published') {
      await db.insert(contentRevision).values({ entity, entityId: id, snapshot: existing, actorId: guard.user.id });
      if (!existing.publishAt) patch.publishAt = new Date();
    }

    const rows = await (db.update(tableOf(entity)) as any).set(patch).where(eq(tableOf(entity).id, id)).returning();
    await auditRow(c, guard.user.id, `${entity}.transition`, entity, String(id), { from: existing.status, to: parsed.data.to, publishAt: patch.publishAt ?? null });
    const body = row0(rows);
    if (idemKey) TRANSITION_IDEM.set(idemKey, { status: 200, body });
    return c.json(body);
  });

  // ---------- revisions + revert ----------
  r.get('/content/:entity/:id/revisions', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const rows = await db.select({ id: contentRevision.id, actorId: contentRevision.actorId, createdAt: contentRevision.createdAt, snapshot: contentRevision.snapshot })
      .from(contentRevision).where(and(eq(contentRevision.entity, entity), eq(contentRevision.entityId, id)))
      .orderBy(desc(contentRevision.id)).limit(50);
    return c.json({ items: rows });
  });

  // ---- Phase 2 §2.3: editorial review comments (readers: any staff; posting: author+) ----
  r.get('/content/:entity/:id/comments', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    if (!Number.isFinite(id) || id <= 0) return c.json(problem(400, 'Invalid id'), 400, { 'Content-Type': P });
    const rows = await db.select({
      id: contentComment.id, body: contentComment.body, createdAt: contentComment.createdAt,
      authorId: contentComment.authorId, authorEmail: user.email, authorName: user.name,
    }).from(contentComment)
      .leftJoin(user, eq(contentComment.authorId, user.id))
      .where(and(eq(contentComment.entity, entity), eq(contentComment.entityId, id)))
      .orderBy(contentComment.id).limit(200);
    return c.json({ items: rows });
  });

  r.post('/content/:entity/:id/comments', async (c) => {
    const guard = await authorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    if (!Number.isFinite(id) || id <= 0) return c.json(problem(400, 'Invalid id'), 400, { 'Content-Type': P });
    const parsed = commentBodySchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.insert(contentComment).values({ entity, entityId: id, authorId: guard.user.id, body: parsed.data.body })
      .returning({ id: contentComment.id });
    await auditRow(c, guard.user.id, 'content.comment', entity, String(id), { commentId: rows[0]?.id, chars: parsed.data.body.length });
    return c.json({ id: rows[0]?.id, ok: true }, 201);
  });

  r.post('/content/:entity/:id/revert', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const parsed = contentRevertSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rev = (await db.select().from(contentRevision).where(eq(contentRevision.id, parsed.data.revisionId)).limit(1))[0];
    if (!rev || rev.entity !== entity || rev.entityId !== id) {
      return c.json(problem(404, 'Revision not found for this item'), 404, { 'Content-Type': P });
    }
    const snap = rev.snapshot as Record<string, unknown>;
    // snapshot the CURRENT state first so revert is itself reversible
    const current = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    await db.insert(contentRevision).values({ entity, entityId: id, snapshot: current, actorId: guard.user.id });
    const restore: Record<string, unknown> = { status: 'published', updatedAt: new Date() };
    for (const key of ['slug', 'title', 'deck', 'body', 'category', 'tags', 'tag', 'eventDate', 'blocks', 'seo', 'groupKey', 'question', 'answer', 'sort', 'locale']) {
      if (key in snap) (restore as any)[key] = snap[key];
    }
    const rows = await (db.update(tableOf(entity)) as any).set(restore).where(eq(tableOf(entity).id, id)).returning();
    await auditRow(c, guard.user.id, `${entity}.revert`, entity, String(id), { revisionId: parsed.data.revisionId });
    return c.json(row0(rows));
  });

  // ---------- preview URLs ----------
  r.post('/content/:entity/:id/preview', async (c) => {
    const guard = await authorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const found = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    if (!found) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });
    const token = newPreviewToken(entity, id);
    await auditRow(c, guard.user.id, `${entity}.preview`, entity, String(id), {});
    return c.json({ previewUrl: `/api/v1/preview/${token}` }, 201);
  });

  return r;
}

/** Public, token-gated draft preview: markdown rendered server-side. */
export function previewRoute(db: DB) {
  const r = new Hono();
  r.get('/preview/:token', async (c) => {
    const token = c.req.param('token');
    const entry = PREVIEWS.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      PREVIEWS.delete(token);
      return c.json(problem(404, 'Preview not found or expired'), 404, { 'Content-Type': P });
    }
    const entity: EntityType = CONTENT_ENTITY_SCHEMA.parse(entry.entity);
    const row = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, entry.id)).limit(1));
    if (!row) return c.json(problem(404, 'Preview content not found'), 404, { 'Content-Type': P });
    const html = await renderContent(entity, row);
    return c.html(wrapPage(html, row, entity));
  });
  return r;
}

export async function renderContent(entity: EntityType, row: Record<string, unknown>): Promise<string> {
  // P1.2 defense-in-depth: marked performs no sanitization, and this HTML is
  // served to browsers (preview URLs). The API origin's CSP (default-src
  // 'none') already neutralizes script; DOMPurify makes the markup itself
  // clean regardless of which origin or header path serves it.
  const md = (raw: unknown) => DOMPurify.sanitize(String(marked.parse(String(raw ?? ''))));
  if (entity === 'faq') {
    return `<h1>${esc(String(row.question))}</h1><p>${await md(row.answer)}</p>`;
  }
  if (entity === 'page') {
    const blocks = (row.blocks as Array<Record<string, unknown>>) ?? [];
    return `<h1>${esc(String(row.title))}</h1>` + blocks.map((b) => `<section><pre>${esc(JSON.stringify(b, null, 2))}</pre></section>`).join('');
  }
  const deck = row.deck ? `<p class="deck">${esc(String(row.deck))}</p>` : '';
  const meta = row.eventDate ? `<p class="meta">Event date: ${esc(String(row.eventDate))}</p>` : '';
  return `<h1>${esc(String(row.title))}</h1>${deck}${meta}${await md(row.body)}`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapPage(bodyHtml: string, row: Record<string, unknown>, entity: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Preview — ${esc(String(row.title ?? 'untitled'))}</title>
<style>body{font:16px/1.65 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#0A2540}
.deck{color:#5E7691;font-size:18px}pre{background:#F1F5F9;padding:12px;border-radius:8px;overflow:auto}
.banner{background:#FFB800;color:#0A2540;padding:8px 14px;border-radius:8px;font-weight:700;font-size:13px}</style></head>
<body><p class="banner">DRAFT PREVIEW — ${esc(entity)} · not published</p>${bodyHtml}</body></html>`;
}

/**
 * Scheduled promoter — moves due `scheduled` content to `published` with a
 * revision snapshot. Runs on boot + interval in the API, and is exposed as a
 * manual trigger for external cron in production.
 */
export async function promoteScheduled(db: DB, actorLabel = 'scheduler'): Promise<number> {
  let promoted = 0;
  // page/faq carry no publishAt column — only article and news participate
  for (const entity of ['article', 'news'] as EntityType[]) {
    const due = await (db.select().from(tableOf(entity)) as any)
      .where(and(eq(tableOf(entity).status, 'scheduled'), lte(tableOf(entity).publishAt, new Date()), isNull(tableOf(entity).deletedAt)))
      .limit(100);
    for (const row of due) {
      await db.insert(contentRevision).values({ entity, entityId: row.id, snapshot: row, actorId: null });
      await (db.update(tableOf(entity)) as any).set({ status: 'published', updatedAt: new Date() }).where(eq(tableOf(entity).id, row.id));
      await db.insert(auditLog).values({ actorId: null, action: `${entity}.transition`, entity, entityId: String(row.id), diff: { from: 'scheduled', to: 'published', via: actorLabel } });
      promoted += 1;
    }
  }
  return promoted;
}

export function startScheduler(db: DB): ReturnType<typeof setInterval> {
  const everyMs = Number(process.env.SCHEDULER_INTERVAL_MS ?? 60_000);
  const tick = async () => {
    try { const n = await promoteScheduled(db); if (n) console.log(`[scheduler] promoted ${n} scheduled item(s)`); } catch (e) { console.error('[scheduler]', e); }
  };
  void tick(); // run once at boot
  return setInterval(tick, everyMs);
}
