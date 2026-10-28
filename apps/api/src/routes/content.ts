// P3 CMS content — CRUD for article/news/page/faq with the publishing workflow
// (draft → in_review → scheduled(publishAt) → published → archived), revision
// snapshots on publish with one-click rollback, TTL preview URLs, and a
// scheduled promoter. RBAC per docs/04: authors edit but cannot publish;
// editors publish; deletion is admin+; all mutations audited.
import { Hono } from 'hono';
import { and, count, desc, eq, ilike, isNull, lte, sql } from 'drizzle-orm';
import { marked } from 'marked';
import { verifyPreviewToken } from './delivery/preview.ts';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';
import {
  articleCreateSchema, articleUpdateSchema, newsCreateSchema, newsUpdateSchema,
  pageCreateSchema, pageUpdateSchema, faqCreateSchema, faqUpdateSchema,
  contentTransitionSchema, contentRevertSchema, CONTENT_TRANSITIONS, CONTENT_ENTITY_SCHEMA,
  CONTENT_STATUS, problem, slugify, sameInstant, validateBlocks, isReservedPagePath,
} from '@twinmos/shared';
import type { Role } from '@twinmos/shared';
import { article, newsPost, page, faq, contentRevision, contentComment, auditLog, user, redirect, mediaAsset, product } from '@twinmos/db';
import { createPreviewToken } from './delivery/preview.ts';
import { IdempotencyStore } from '../idem.ts';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';
import { recordOutboxEvent } from '../services/outbox.ts';
import { provenanceIssue } from '../lib/provenance.ts';

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

export function getContentInvalidation(entity: string, slugVal: string): { paths: string[]; tags: string[] } {
  const isArticle = entity === 'article';
  const isNews = entity === 'news';
  const isPage = entity === 'page';
  const isFaq = entity === 'faq';

  const paths: string[] = [];
  const tags: string[] = [entity, `${entity}s`, `${entity}:${slugVal}`, 'sitemap'];

  if (isArticle) {
    paths.push(`/learn/${slugVal}`, `/learn/${slugVal}.html`, `/article/${slugVal}.html`);
    tags.push('articles', 'learn', `article:${slugVal}`);
  } else if (isNews) {
    paths.push(`/news/${slugVal}`, `/news/${slugVal}.html`);
    tags.push('news', `news:${slugVal}`);
  } else if (isPage) {
    paths.push(`/${slugVal}`, `/${slugVal}.html`);
    tags.push('page', 'pages', `page:${slugVal}`);
  } else if (isFaq) {
    paths.push('/support/faq', '/faq');
    tags.push('faq', 'faqs');
  }

  return { paths, tags: Array.from(new Set(tags)) };
}

export function contentRoute(db: DB, deps: { requireRole: (r: Role) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  /** Session + RBAC guard (defaults to viewer; returns session or 401/403). */
  async function authed(c: any, minRole: Role = 'viewer'): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    const ok = await deps.requireRole(minRole)(c.req.raw);
    return ok ? s : c.json(problem(403, `Requires ${minRole} role or above`), 403, { 'Content-Type': P });
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
   *  defaults to draft unless explicitly specified). */
  function toColumns(entity: EntityType, data: Record<string, unknown>, actorId: string) {
    // T4.7.2: every row carries provenance — when the console payload omits it,
    // the creating actor is recorded as the source/approver of record.
    const withProvenance = {
      source: (data.source as string) ?? `admin console (actor ${actorId})`,
      approver: (data.approver as string) ?? `actor ${actorId}`,
      ...data,
    };
    data = withProvenance;
    if (entity === 'article') return { ...data, authorId: actorId, status: (data.status as string) || 'draft' };
    if (entity === 'news') {
      // timestamp column needs a Date, not the ISO string the contract carries
      const { eventDate, ...rest } = data as Record<string, unknown>;
      return { ...rest, status: (data.status as string) || 'draft', eventDate: eventDate ? new Date(String(eventDate)) : null };
    }
    if (entity === 'page') return { ...data, status: (data.status as string) || 'draft' };
    const { locale, ...rest } = data as Record<string, unknown>;
    return { ...rest, locale: locale ?? 'en', status: (data.status as string) || 'draft' };
  }

  // ---------- P2.2: server-side content-bridge refresh (RETIRED MS5.6) -------
  // POST /admin/content/export is retired. All site content is served dynamically
  // via Delivery API (/api/v1/delivery/...) and typed blocks.
  r.post('/content/export', async (c) => {
    return c.json({ ok: false, error: 'Bridge retired: all pages render via typed blocks and /api/v1/delivery' }, 410);
  });

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
    if (entity === 'page' && data.path && isReservedPagePath(String(data.path))) {
      return c.json(problem(422, 'Reserved path', 'Path cannot use reserved prefixes /admin, /api, /internal'), 422, { 'Content-Type': P });
    }
    if (entity === 'page' && Array.isArray(data.blocks) && data.blocks.length > 0) {
      const v = validateBlocks(data.blocks);
      if (!v.success) {
        return c.json(
          problem(
            422,
            'Block Validation Failed',
            'One or more page blocks failed validation.',
            Object.entries(v.errors).flatMap(([idx, errs]: [string, string[]]) =>
              errs.map((e) => {
                const colon = e.indexOf(':');
                const field = colon > -1 ? e.slice(0, colon).trim() : 'root';
                const msg = colon > -1 ? e.slice(colon + 1).trim() : e;
                return {
                  path: ['blocks', Number(idx), ...(field !== 'root' ? field.split('.') : [])],
                  message: msg,
                };
              })
            )
          ),
          422,
          { 'Content-Type': P }
        );
      }
    }
    // T4.7.2: every row carries provenance — when the console payload omits
    // it, the creating actor is the source/approver of record.
    data = {
      source: (data.source as string) ?? `admin console (actor ${guard.user.id})`,
      approver: (data.approver as string) ?? `actor ${guard.user.id}`,
      ...data,
    };
    const provIssue = provenanceIssue(data, String(data.status ?? 'draft'));
    if (provIssue) {
      return c.json(problem(422, 'Missing provenance', provIssue.message, [provIssue]), 422, { 'Content-Type': P });
    }
    try {
      const rows = await (db.insert(tableOf(entity)) as any).values(toColumns(entity, data, guard.user.id)).returning();
      const created = row0(rows);
      await auditRow(c, guard.user.id, `${entity}.create`, entity, String(created.id), { slug: created.slug ?? String(created.question ?? '').slice(0, 60) });
      return c.json(created, 201);
    } catch (e: any) {
      const errStr = String(e?.cause ?? e);
      if (errStr.includes('page_locale_path_uq') || (errStr.includes('unique') && errStr.includes('path'))) {
        return c.json(problem(409, 'Duplicate path', 'A page already uses this path in that locale.'), 409, { 'Content-Type': P });
      }
      if (errStr.includes('unique')) {
        return c.json(problem(409, 'Duplicate slug', 'A published or draft item already uses this slug in that locale.'), 409, { 'Content-Type': P });
      }
      throw e;
    }
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

  const updateContent = async (c: any) => {
    const guard = await authorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const rawJson = await c.req.json().catch(() => ({}));
    if (rawJson.status !== undefined) {
      return c.json(
        problem(422, 'Status transition required', 'Status cannot be updated directly via PATCH. Use POST /content/:entity/:id/transition instead.'),
        422,
        { 'Content-Type': P }
      );
    }
    const parsed = updateSchemas[entity].safeParse(rawJson);
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const existing = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    if (!existing) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });
    // authors may only edit their own drafts; editor+ edits anything
    if (guard.user.role === 'author' && existing.authorId !== guard.user.id) {
      return c.json(problem(403, 'Authors may only edit their own content'), 403, { 'Content-Type': P });
    }
    // Phase 3.4 & Phase C (WF-01): optimistic locking — check If-Match header and numeric version
    const ifMatch = c.req.header('if-match');
    if (ifMatch && !sameInstant(ifMatch, existing.updatedAt)) {
      return c.json(problem(409, 'Conflict', 'This item was modified by someone else after you loaded it. Reload the latest version and re-apply your changes.'), 409, { 'Content-Type': P });
    }
    if (rawJson.version !== undefined && existing.version !== undefined && rawJson.version !== existing.version) {
      return c.json(problem(409, 'Conflict', 'Version conflict: this item was modified by someone else.'), 409, { 'Content-Type': P });
    }

    const patchData = prunePatch(rawJson, parsed.data as Record<string, unknown>);
    delete (patchData as any).status;
    delete (patchData as any).id;
    delete (patchData as any).createdAt;

    if (entity === 'page' && (patchData as any).path && isReservedPagePath((patchData as any).path)) {
      return c.json(problem(422, 'Reserved path', 'Path cannot use reserved prefixes /admin, /api, /internal'), 422, { 'Content-Type': P });
    }

    if (entity === 'page' && Array.isArray((patchData as any).blocks) && (patchData as any).blocks.length > 0) {
      const v = validateBlocks((patchData as any).blocks);
      if (!v.success) {
        return c.json(
          problem(
            422,
            'Block Validation Failed',
            'One or more page blocks failed validation.',
            Object.entries(v.errors).flatMap(([idx, errs]: [string, string[]]) =>
              errs.map((e) => {
                const colon = e.indexOf(':');
                const field = colon > -1 ? e.slice(0, colon).trim() : 'root';
                const msg = colon > -1 ? e.slice(colon + 1).trim() : e;
                return {
                  path: ['blocks', Number(idx), ...(field !== 'root' ? field.split('.') : [])],
                  message: msg,
                };
              })
            )
          ),
          422,
          { 'Content-Type': P }
        );
      }
    }

    const patch: Record<string, unknown> = { ...patchData, updatedAt: new Date() };
    if (existing.version !== undefined) {
      patch.version = (existing.version ?? 1) + 1;
    }
    if ((patchData as any).eventDate !== undefined) patch.eventDate = (patchData as any).eventDate ? new Date((patchData as any).eventDate) : null;

    // Phase C (CMS-E4): automated 301 redirect on page path change
    if (entity === 'page' && (patchData as any).path && existing.path && (patchData as any).path !== existing.path) {
      await db.insert(redirect).values({
        from: existing.path,
        to: (patchData as any).path,
        code: 301,
      }).onConflictDoUpdate({
        target: [redirect.from],
        set: { to: (patchData as any).path, code: 301 },
      });
      const leg = Array.isArray(existing.legacyPaths) ? [...existing.legacyPaths] : [];
      if (!leg.includes(existing.path)) {
        leg.push(existing.path);
        patch.legacyPaths = leg;
      }
    }

    let rows: any[];
    try {
      rows = await (db.update(tableOf(entity)) as any).set(patch).where(eq(tableOf(entity).id, id)).returning();
    } catch (e: any) {
      const errStr = String(e?.cause ?? e);
      if (errStr.includes('page_locale_path_uq') || (errStr.includes('unique') && errStr.includes('path'))) {
        return c.json(problem(409, 'Duplicate path', 'A page already uses this path in that locale.'), 409, { 'Content-Type': P });
      }
      if (errStr.includes('unique')) {
        return c.json(problem(409, 'Duplicate slug', 'A published or draft item already uses this slug in that locale.'), 409, { 'Content-Type': P });
      }
      throw e;
    }
    await auditRow(c, guard.user.id, `${entity}.update`, entity, String(id), patchData);

    // Phase B (Task T3.5.3): record outbox event if published content updated
    if (existing.status === 'published') {
      try {
        const slugVal = existing.slug || String(id);
        const { paths, tags } = getContentInvalidation(entity, slugVal);
        await recordOutboxEvent(db, `${entity}.update`, {
          entityType: entity,
          entityId: id,
          slug: slugVal,
          action: 'update',
          tags,
          paths,
        });
      } catch {}
    }

    return c.json(row0(rows));
  };

  r.patch('/content/:entity/:id', updateContent);
  r.put('/content/:entity/:id', updateContent);

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
    try {
      const slugVal = (rows[0] as any)?.slug || String(id);
      const { paths, tags } = getContentInvalidation(entity, slugVal);
      await recordOutboxEvent(db, 'content.delete', {
        entityType: entity,
        entityId: id,
        slug: slugVal,
        action: 'delete',
        tags,
        paths,
      });
    } catch {}
    return c.json({ deleted: true });
  });

  // ---------- workflow ----------
  async function checkPublishingAltText(dbInstance: DB, ent: string, record: any): Promise<string | null> {
    if (ent === 'page' && Array.isArray(record.blocks)) {
      const mediaIdsToFetch = new Set<number>();
      const inlineMissingAlt: string[] = [];

      function walk(node: any) {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          for (const item of node) walk(item);
          return;
        }
        if (typeof node.mediaId === 'number') mediaIdsToFetch.add(node.mediaId);
        if (typeof node.mediaAssetId === 'number') mediaIdsToFetch.add(node.mediaAssetId);

        const isImg = (typeof node.image === 'string' && node.image.trim().length > 0) ||
                      (typeof node.src === 'string' && node.src.trim().length > 0 && /\.(png|jpe?g|webp|avif|gif|svg)/i.test(node.src)) ||
                      (node.kind === 'image' && typeof node.url === 'string' && node.url.trim().length > 0) ||
                      (node.kind === 'image' && typeof node.key === 'string' && node.key.trim().length > 0) ||
                      (typeof node.key === 'string' && node.key.trim().length > 0 && /\.(png|jpe?g|webp|avif|gif|svg)/i.test(node.key));
        if (isImg) {
          const isDecorative = node.isDecorative === true || node.decorative === true;
          const alt = typeof node.alt === 'string' ? node.alt.trim() : '';
          if (!isDecorative && !alt) {
            inlineMissingAlt.push(node.image || node.src || node.url || node.key);
          }
        }

        for (const [k, v] of Object.entries(node)) {
          if (typeof v === 'object' && v !== null) {
            walk(v);
          }
        }
      }

      walk(record.blocks);

      if (inlineMissingAlt.length > 0) {
        return `Page publishing blocked: image(s) [${inlineMissingAlt.slice(0, 3).join(', ')}] lack required alt text and are not marked decorative.`;
      }

      if (mediaIdsToFetch.size > 0) {
        const ids = Array.from(mediaIdsToFetch);
        for (const mId of ids) {
          const assets = await dbInstance.select().from(mediaAsset).where(eq(mediaAsset.id, mId)).limit(1);
          if (assets[0] && !assets[0].isDecorative && (!assets[0].alt || !assets[0].alt.trim())) {
            return `Page publishing blocked: media asset #${assets[0].id} (${assets[0].key}) lacks required alt text and is not marked decorative.`;
          }
        }
      }
    }

    if ((ent === 'article' || ent === 'news') && record.heroMediaId) {
      const assets = await dbInstance.select().from(mediaAsset).where(eq(mediaAsset.id, record.heroMediaId)).limit(1);
      if (assets[0] && !assets[0].isDecorative && (!assets[0].alt || !assets[0].alt.trim())) {
        return `${ent} publishing blocked: hero media asset #${assets[0].id} (${assets[0].key}) lacks required alt text and is not marked decorative.`;
      }
    }

    return null;
  }

  r.post('/content/:entity/:id/transition', async (c) => {
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));

    // Idempotency replay happens AFTER authz (below) so an unauthenticated or
    // under-privileged caller holding a captured key cannot read the cached
    // transition result (deny-by-default; mirrors the RMA transition ordering).
    // The cache key is scoped to this entity row so one client's key can never
    // be replayed against a different row's transition.
    const idemKey = c.req.header('Idempotency-Key');
    const idemScopedKey = idemKey ? `${entity}:${id}:${idemKey}` : null;

    const parsed = contentTransitionSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const existing = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    if (!existing) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });

    // T4.6.1: Role-based transitions: an author submits (to in_review); an editor publishes, unpublishes or archives.
    const requiresEditor = parsed.data.to === 'published'
      || parsed.data.to === 'scheduled'
      || parsed.data.to === 'archived'
      || (existing.status === 'published' && parsed.data.to === 'draft');

    const guard = requiresEditor ? await editorGuard(c) : await authorGuard(c);
    if (guard instanceof Response) return guard;

    // T4.6.1: Ownership check: authors cannot archive other people's items (or transition items they do not own)
    if (guard.user.role === 'author') {
      if (existing.authorId && existing.authorId !== guard.user.id) {
        return c.json(problem(403, 'Forbidden', 'Authors may only transition their own content'), 403, { 'Content-Type': P });
      }
    }

    if (idemScopedKey) {
      const cached = TRANSITION_IDEM.get(idemScopedKey) as { status: number; body: unknown } | undefined;
      if (cached) return c.json(cached.body, cached.status as 200);
    }

    const legal = CONTENT_TRANSITIONS[existing.status as keyof typeof CONTENT_TRANSITIONS] ?? [];
    if (!legal.includes(parsed.data.to)) {
      return c.json(problem(422, 'Illegal transition', `'${existing.status}' can move to: ${legal.join(', ') || 'none'}.`), 422, { 'Content-Type': P });
    }
    if (parsed.data.to === 'scheduled' && !parsed.data.publishAt) {
      return c.json(problem(422, 'Validation Failed', 'scheduled requires publishAt (ISO datetime).'), 422, { 'Content-Type': P });
    }

    if (parsed.data.to === 'published' || parsed.data.to === 'scheduled') {
      const altError = await checkPublishingAltText(db, entity, existing);
      if (altError) {
        return c.json(problem(422, 'Publishing Blocked', altError), 422, { 'Content-Type': P });
      }
    }

    const patch: Record<string, unknown> = { status: parsed.data.to, updatedAt: new Date() };
    if (parsed.data.publishAt) patch.publishAt = new Date(parsed.data.publishAt);
    if (parsed.data.unpublishAt) patch.unpublishAt = new Date(parsed.data.unpublishAt);

    // T4.7.2: publishing requires recorded provenance.
    if (parsed.data.to === 'published' || parsed.data.to === 'scheduled') {
      const provIssue = provenanceIssue({ ...existing, ...patch });
      if (provIssue) {
        return c.json(problem(422, 'Missing provenance', provIssue.message, [provIssue]), 422, { 'Content-Type': P });
      }
    }

    // T4.6.1: Every transition is audited and creates a revision snapshot
    await db.insert(contentRevision).values({ entity, entityId: id, snapshot: existing, actorId: guard.user.id });
    if (parsed.data.to === 'published' && !existing.publishAt) {
      patch.publishAt = new Date();
    }

    const rows = await (db.update(tableOf(entity)) as any).set(patch).where(eq(tableOf(entity).id, id)).returning();
    await auditRow(c, guard.user.id, `${entity}.transition`, entity, String(id), { from: existing.status, to: parsed.data.to, publishAt: patch.publishAt ?? null });
    
    // Phase B (Task B7): record publish/unpublish/archive outbox event
    try {
      const slugVal = existing.slug || String(id);
      const { paths, tags } = getContentInvalidation(entity, slugVal);
      await recordOutboxEvent(db, `content.${parsed.data.to}`, {
        entityType: entity,
        entityId: id,
        slug: slugVal,
        action: parsed.data.to as any,
        tags,
        paths,
      });
    } catch {}

    const body = row0(rows);
    if (idemScopedKey) TRANSITION_IDEM.set(idemScopedKey, { status: 200, body });
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
    const updated = row0(rows);
    await auditRow(c, guard.user.id, `${entity}.revert`, entity, String(id), { revisionId: parsed.data.revisionId });

    // Phase B (Task T3.5.3): record outbox event on revert
    try {
      const slugVal = (updated as any)?.slug || (snap as any)?.slug || String(id);
      const { paths, tags } = getContentInvalidation(entity, slugVal);
      await recordOutboxEvent(db, 'content.revert', {
        entityType: entity,
        entityId: id,
        slug: slugVal,
        action: 'publish',
        tags,
        paths,
      });
    } catch {}

    return c.json(updated);
  });

  // ---------- restore & diff endpoints (T4.6.3 / WF-01) ----------
  r.post('/content/:entity/:id/restore/:revisionId', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const revId = Number(c.req.param('revisionId'));
    const rev = (await db.select().from(contentRevision).where(eq(contentRevision.id, revId)).limit(1))[0];
    if (!rev || rev.entity !== entity || rev.entityId !== id) {
      return c.json(problem(404, 'Revision not found for this item'), 404, { 'Content-Type': P });
    }
    const snap = rev.snapshot as Record<string, unknown>;
    const current = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    await db.insert(contentRevision).values({ entity, entityId: id, snapshot: current, actorId: guard.user.id });
    const restore: Record<string, unknown> = { status: 'published', updatedAt: new Date() };
    for (const key of ['slug', 'title', 'deck', 'body', 'category', 'tags', 'tag', 'eventDate', 'blocks', 'seo', 'groupKey', 'question', 'answer', 'sort', 'locale', 'path', 'template', 'seoTitle', 'seoDescription', 'ogMediaId', 'noindex', 'legacyPaths']) {
      if (key in snap) (restore as any)[key] = snap[key];
    }
    const rows = await (db.update(tableOf(entity)) as any).set(restore).where(eq(tableOf(entity).id, id)).returning();
    const updated = row0(rows);
    await auditRow(c, guard.user.id, `${entity}.restore`, entity, String(id), { revisionId: revId });
    try {
      const slugVal = (updated as any)?.slug || (snap as any)?.slug || String(id);
      const { paths, tags } = getContentInvalidation(entity, slugVal);
      await recordOutboxEvent(db, 'content.restore', {
        entityType: entity,
        entityId: id,
        slug: slugVal,
        action: 'publish',
        tags,
        paths,
      });
    } catch {}
    return c.json(updated);
  });

  r.get('/content/:entity/:id/revisions/:revisionId/diff', async (c) => {
    const guard = await authorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const revId = Number(c.req.param('revisionId'));
    const current = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    if (!current) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });
    const rev = (await db.select().from(contentRevision).where(eq(contentRevision.id, revId)).limit(1))[0];
    if (!rev || rev.entity !== entity || rev.entityId !== id) {
      return c.json(problem(404, 'Revision not found for this item'), 404, { 'Content-Type': P });
    }
    return c.json({ current, revision: rev.snapshot, revisionCreatedAt: rev.createdAt, actorId: rev.actorId });
  });

  // ---------- manual / cron sweep trigger (T4.6.2) ----------
  r.post('/content/scheduled/sweep', async (c) => {
    const guard = await authorGuard(c);
    if (guard instanceof Response) return guard;
    const n = await promoteScheduled(db, `manual_${guard.user.id}`);
    return c.json({ promoted: n, ok: true });
  });

  // ---------- preview URLs (T4.6.4: Signed HMAC public preview) ----------
  r.post('/content/:entity/:id/preview', async (c) => {
    const guard = await authorGuard(c);
    if (guard instanceof Response) return guard;
    const entity = resolveEntity(c);
    if (entity instanceof Response) return entity;
    const id = Number(c.req.param('id'));
    const found = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, id)).limit(1));
    if (!found) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': P });

    if (guard.user.role === 'author' && found.authorId && found.authorId !== guard.user.id) {
      return c.json(problem(403, 'Forbidden', 'Authors may only preview their own content'), 403, { 'Content-Type': P });
    }

    const token = createPreviewToken(entity as any, id, found.slug, 3600, found.locale ?? 'en');
    await auditRow(c, guard.user.id, `${entity}.preview`, entity, String(id), {});

    const webOrigin = process.env.PUBLIC_WEB_URL || process.env.WEB_ORIGIN || 'http://127.0.0.1:4321';
    let path = '';
    if (entity === 'page') {
      path = found.path || (found.slug === 'index' ? '/' : `/${found.slug}`);
    } else if (entity === 'article') {
      path = `/learn/${found.slug}`;
    } else if (entity === 'news') {
      path = `/news/${found.slug}`;
    } else if (entity === 'faq') {
      path = `/support`;
    }
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    const previewUrl = `${webOrigin}${cleanPath}${cleanPath.includes('?') ? '&' : '?'}preview=${token}`;

    return c.json({ previewUrl, token, path: cleanPath }, 201);
  });

  return r;
}

/** Public, token-gated draft preview: markdown rendered server-side. */
export function previewRoute(db: DB) {
  const r = new Hono();
  r.get('/preview/:token', async (c) => {
    const token = c.req.param('token');
    const payload = verifyPreviewToken(token);
    if (!payload) {
      return c.json(problem(404, 'Preview not found or expired'), 404, { 'Content-Type': P });
    }
    const entity: EntityType = CONTENT_ENTITY_SCHEMA.parse(payload.entityType);
    const row = row0(await (db.select().from(tableOf(entity)) as any).where(eq(tableOf(entity).id, Number(payload.entityId))).limit(1));
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
  const now = new Date();

  // All content entities that support scheduling: article, news, page, faq (T4.6.2 / Z-30)
  for (const entity of ['article', 'news', 'page', 'faq'] as EntityType[]) {
    // 1. Scheduled publish
    const duePublish = await (db.select().from(tableOf(entity)) as any)
      .where(and(
        eq(tableOf(entity).status, 'scheduled'),
        lte(tableOf(entity).publishAt, now),
        tableOf(entity).deletedAt ? isNull(tableOf(entity).deletedAt) : sql`TRUE`
      ))
      .limit(100);

    for (const row of duePublish) {
      await db.insert(contentRevision).values({ entity, entityId: row.id, snapshot: row, actorId: null });
      await (db.update(tableOf(entity)) as any).set({ status: 'published', updatedAt: new Date() }).where(eq(tableOf(entity).id, row.id));
      await db.insert(auditLog).values({ actorId: null, action: `${entity}.transition`, entity, entityId: String(row.id), diff: { from: 'scheduled', to: 'published', via: actorLabel } });
      
      try {
        const slugVal = row.slug || String(row.id);
        const { paths, tags } = getContentInvalidation(entity, slugVal);
        await recordOutboxEvent(db, 'content.scheduled_publish', {
          entityType: entity,
          entityId: row.id,
          slug: slugVal,
          action: 'publish',
          tags,
          paths,
        });
      } catch {}

      promoted += 1;
    }

    // 2. Scheduled unpublish
    const dueUnpublish = await (db.select().from(tableOf(entity)) as any)
      .where(and(
        eq(tableOf(entity).status, 'published'),
        lte(tableOf(entity).unpublishAt, now),
        tableOf(entity).deletedAt ? isNull(tableOf(entity).deletedAt) : sql`TRUE`
      ))
      .limit(100);

    for (const row of dueUnpublish) {
      await db.insert(contentRevision).values({ entity, entityId: row.id, snapshot: row, actorId: null });
      await (db.update(tableOf(entity)) as any).set({ status: 'draft', updatedAt: new Date() }).where(eq(tableOf(entity).id, row.id));
      await db.insert(auditLog).values({ actorId: null, action: `${entity}.transition`, entity, entityId: String(row.id), diff: { from: 'published', to: 'draft', via: `${actorLabel}_unpublish` } });

      try {
        const slugVal = row.slug || String(row.id);
        const { paths, tags } = getContentInvalidation(entity, slugVal);
        await recordOutboxEvent(db, 'content.scheduled_unpublish', {
          entityType: entity,
          entityId: row.id,
          slug: slugVal,
          action: 'unpublish',
          tags,
          paths,
        });
      } catch {}

      promoted += 1;
    }
  }

  // 3. Product scheduled publish/unpublish sweep
  try {
    const dueProducts = await db.select().from(product)
      .where(and(
        eq(product.status, 'scheduled'),
        lte(product.publishAt, now),
        isNull(product.deletedAt)
      ))
      .limit(100);
    for (const row of dueProducts) {
      await db.update(product).set({ status: 'published', updatedAt: new Date() }).where(eq(product.id, row.id));
      await db.insert(auditLog).values({ actorId: null, action: 'product.transition', entity: 'product', entityId: String(row.id), diff: { from: 'scheduled', to: 'published', via: actorLabel } });
      try {
        await recordOutboxEvent(db, 'product.scheduled_publish', {
          entityType: 'product',
          entityId: row.id,
          slug: row.slug,
          action: 'publish',
          tags: ['products', `product:${row.slug}`],
          paths: [`/products/${row.slug}`],
        });
      } catch {}
      promoted += 1;
    }

    const dueUnpublishProducts = await db.select().from(product)
      .where(and(
        eq(product.status, 'published'),
        lte(product.unpublishAt, now),
        isNull(product.deletedAt)
      ))
      .limit(100);
    for (const row of dueUnpublishProducts) {
      await db.update(product).set({ status: 'draft', updatedAt: new Date() }).where(eq(product.id, row.id));
      await db.insert(auditLog).values({ actorId: null, action: 'product.transition', entity: 'product', entityId: String(row.id), diff: { from: 'published', to: 'draft', via: `${actorLabel}_unpublish` } });
      try {
        await recordOutboxEvent(db, 'product.scheduled_unpublish', {
          entityType: 'product',
          entityId: row.id,
          slug: row.slug,
          action: 'unpublish',
          tags: ['products', `product:${row.slug}`],
          paths: [`/products/${row.slug}`],
        });
      } catch {}
      promoted += 1;
    }
  } catch {}

  return promoted;
}

export function startScheduler(db: DB): ReturnType<typeof setInterval> {
  // T4.6.2: a scheduled item must be live within 5 s. The outbox dispatcher
  // runs every 2 s, so a 2 s promoter keeps worst-case publish→visible ≈ 4 s.
  const everyMs = Number(process.env.SCHEDULER_INTERVAL_MS ?? 2_000);
  const tick = async () => {
    try { const n = await promoteScheduled(db); if (n) console.log(`[scheduler] promoted ${n} scheduled item(s)`); } catch (e) { console.error('[scheduler]', e); }
  };
  void tick(); // run once at boot
  return setInterval(tick, everyMs);
}
