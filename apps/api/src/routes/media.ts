// Phase 4 — Media DAM (TWN-ADMIN-CMS-AUDIT-PLAN §4): all bytes move through
// the pluggable StorageDriver (local disk dev/test; S3/R2/B2 in prod, env
// configured); raster uploads get Sharp-derived responsive variants
// (thumb/card/hero/full WebP + hero AVIF) with dimensions + color profile in
// meta; assets live in a virtual folder hierarchy (media_folder) with a
// referential in-use guard that blocks deleting assets referenced by
// products (hero/gallery), articles or news.
// Upload guards unchanged from P3: size cap, extension allow-list, magic-byte
// sniffing, SVG active-content rejection, mandatory alt text (docs/04 §Media).
import { Hono } from 'hono';
import { and, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import { problem } from '@twinmos/shared';
import { article, auditLog, mediaAsset, mediaFolder, newsPost, product } from '@twinmos/db';
import { getStorage } from '../storage.ts';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';
const MAX_BYTES = Number(process.env.MEDIA_MAX_BYTES ?? 10 * 1024 * 1024);
const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.pdf', '.webm', '.mp4']);

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.pdf': 'application/pdf',
  '.webm': 'video/webm', '.mp4': 'video/mp4',
};

/** Magic-byte sniffing — never trust the client-declared type alone. */
function sniffMime(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  if (b.length > 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
  if (b.length > 5 && b[0] === 0x3c && b[1] === 0x73 && b[2] === 0x76 && b[3] === 0x67) return 'image/svg+xml';
  if (b.length > 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'application/pdf';
  if (b.length > 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 && b[8] === 0x61 && b[9] === 0x76) return 'image/avif';
  return null;
}

/** Native dimension parsing (no deps) for PNG / GIF / JPEG / WebP — populates
 *  the width/height columns so the library can flag low-resolution assets. */
function sniffDimensions(bytes: Uint8Array, mime: string): { width: number; height: number } | null {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  try {
    if (mime === 'image/png' && bytes.length > 24) {
      return { width: dv.getUint32(16), height: dv.getUint32(20) };
    }
    if (mime === 'image/gif' && bytes.length > 10) {
      return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
    }
    if (mime === 'image/jpeg') {
      // walk JPEG segments to the first SOF marker
      let off = 2;
      while (off + 9 < bytes.length) {
        if (bytes[off] !== 0xff) { off++; continue; }
        const marker = bytes[off + 1];
        const len = dv.getUint16(off + 2);
        const isSof = (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
        if (isSof) return { height: dv.getUint16(off + 5), width: dv.getUint16(off + 7) };
        off += 2 + len;
      }
      return null;
    }
    if (mime === 'image/webp' && bytes.length > 30) {
      const format = String.fromCharCode(bytes[12], bytes[13], bytes[14]);
      if (format === 'VP8 ') return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
      if (format === 'VP8L') {
        const bits = dv.getUint32(21, true);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (format === 'VP8X') return { width: 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)), height: 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) };
    }
  } catch { /* truncated header — dimensions stay null */ }
  return null;
}

// ---------------- Phase 4.2: Sharp variant pipeline -------------------------
// Raster images (excluding SVG and animated GIF) are derived into responsive
// variants at upload; every byte lands in the storage driver alongside the
// original and the manifest is stored in media_asset.meta.variants.
type VariantSpec = { name: string; width: number; height: number; format: 'webp' | 'avif'; fit: 'cover' | 'inside'; quality: number; suffix: string };
const VARIANT_SPECS: VariantSpec[] = [
  { name: 'thumb', width: 150, height: 150, format: 'webp', fit: 'cover', quality: 80, suffix: '.thumb.webp' },
  { name: 'card', width: 400, height: 300, format: 'webp', fit: 'cover', quality: 82, suffix: '.card.webp' },
  { name: 'hero', width: 1200, height: 800, format: 'webp', fit: 'cover', quality: 85, suffix: '.hero.webp' },
  { name: 'heroAvif', width: 1200, height: 800, format: 'avif', fit: 'cover', quality: 60, suffix: '.hero.avif' },
  { name: 'full', width: 2560, height: 2560, format: 'webp', fit: 'inside', quality: 85, suffix: '.full.webp' },
];

async function deriveVariants(baseKey: string, bytes: Uint8Array, mime: string): Promise<{
  variants?: Record<string, { key: string; mime: string; bytes: number; width: number; height: number }>;
  profile?: { format: string; space: string; hasAlpha: boolean };
  variantError?: string;
}> {
  // SVG is vector (scale-free) and GIF may be animated — no raster pipeline.
  if (mime === 'image/svg+xml' || mime === 'image/gif') return {};
  try {
    const sharp = (await import('sharp')).default;
    const img = sharp(Buffer.from(bytes), { failOn: 'none' });
    const meta = await img.metadata();
    const out: Record<string, { key: string; mime: string; bytes: number; width: number; height: number }> = {};
    const storage = getStorage();
    for (const spec of VARIANT_SPECS) {
      const derived = await img.clone()
        .resize(spec.width, spec.height, { fit: spec.fit, withoutEnlargement: spec.fit === 'inside' })
        [spec.format]({ quality: spec.quality })
        .toBuffer({ resolveWithObject: true });
      const key = baseKey + spec.suffix;
      // mime from the SPEC, not sharp's info.format — sharp reports AVIF
      // derivatives with the container family name ('heif')
      const mime = spec.format === 'avif' ? 'image/avif' : 'image/webp';
      await storage.put(key, new Uint8Array(derived.data), mime);
      out[spec.name] = { key, mime, bytes: derived.data.byteLength, width: derived.info.width, height: derived.info.height };
    }
    return { variants: out, profile: { format: meta.format ?? 'unknown', space: meta.space ?? 'srgb', hasAlpha: !!meta.hasAlpha } };
  } catch (e) {
    // An image sharp cannot chew must still upload — the original is the
    // source of truth; the manifest records why derivatives are missing.
    return { variantError: e instanceof Error ? e.message.slice(0, 200) : 'variant derivation failed' };
  }
}

export function mediaRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  async function authorGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('author')(c.req.raw)) ? s : c.json(problem(403, 'Requires author role or above'), 403, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown, entity: string = 'media_asset') {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity, entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  /** Entities currently referencing an asset (in-use guard, §4.3). */
  async function usageOf(id: number): Promise<Array<{ entity: string; id: number; label: string }>> {
    const refs: Array<{ entity: string; id: number; label: string }> = [];
    const products = await db.select({ id: product.id, sku: product.sku, name: product.name })
      .from(product)
      .where(or(eq(product.heroMediaId, id), sql`${id} = ANY(${product.gallery})`))
      .limit(50);
    for (const p of products) refs.push({ entity: 'product', id: p.id, label: `${p.sku} — ${p.name}` });
    const articles = await db.select({ id: article.id, title: article.title }).from(article)
      .where(and(eq(article.heroMediaId, id), isNull(article.deletedAt))).limit(50);
    for (const a of articles) refs.push({ entity: 'article', id: a.id, label: a.title });
    const news = await db.select({ id: newsPost.id, title: newsPost.title }).from(newsPost)
      .where(and(eq(newsPost.heroMediaId, id), isNull(newsPost.deletedAt))).limit(50);
    for (const n of news) refs.push({ entity: 'news', id: n.id, label: n.title });
    return refs;
  }

  // ---------------- Phase 4.3: folder hierarchy ----------------
  /** §4.3 default structure — /products, /banners, /news, /branding,
   *  /datasheets — created idempotently (once per process) so every
   *  environment converges on the canonical roots without migration games. */
  const DEFAULT_FOLDERS = ['products', 'banners', 'news', 'branding', 'datasheets'] as const;
  let defaultsSeeded = false;
  async function seedDefaultFolders(): Promise<void> {
    if (defaultsSeeded) return;
    defaultsSeeded = true;
    const existing = await db.select({ name: mediaFolder.name }).from(mediaFolder);
    const have = new Set(existing.map((f) => f.name));
    const missing = DEFAULT_FOLDERS.filter((n) => !have.has(n));
    if (missing.length) await db.insert(mediaFolder).values(missing.map((name) => ({ name })));
  }

  r.get('/media-folders', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    await seedDefaultFolders();
    const folders = await db.select().from(mediaFolder).orderBy(mediaFolder.parentId, mediaFolder.name);
    const counts = await db.select({ folderId: mediaAsset.folderId, n: sql<number>`count(*)` })
      .from(mediaAsset).groupBy(mediaAsset.folderId);
    const byFolder = new Map(counts.map((x) => [x.folderId, Number(x.n)]));
    const unfiled = await db.select({ n: sql<number>`count(*)` }).from(mediaAsset).where(isNull(mediaAsset.folderId));
    return c.json({
      items: folders.map((f) => ({ ...f, assetCount: byFolder.get(f.id) ?? 0 })),
      unfiledCount: Number(unfiled[0]?.n ?? 0),
    });
  });

  r.post('/media-folders', async (c) => {
    const s = await authorGuard(c);
    if (s instanceof Response) return s;
    const body = await c.req.json().catch(() => ({}));
    const name = String((body as any).name ?? '').trim().slice(0, 60);
    const parentId = (body as any).parentId == null ? null : Number((body as any).parentId);
    if (!name) return c.json(problem(422, 'Validation Failed', 'Folder name is required.'), 422, { 'Content-Type': P });
    if (parentId != null) {
      if (!Number.isInteger(parentId) || !(await db.select({ id: mediaFolder.id }).from(mediaFolder).where(eq(mediaFolder.id, parentId)).limit(1))[0]) {
        return c.json(problem(422, 'Validation Failed', 'Parent folder does not exist.'), 422, { 'Content-Type': P });
      }
    }
    const rows = await db.insert(mediaFolder).values({ name, parentId }).returning();
    await auditRow(c, s.user.id, 'media.folder.create', String(rows[0].id), { name, parentId }, 'media_folder');
    return c.json(rows[0], 201);
  });

  r.patch('/media-folders/:id', async (c) => {
    const s = await authorGuard(c);
    if (s instanceof Response) return s;
    const id = Number(c.req.param('id'));
    const body = await c.req.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};
    if ((body as any).name !== undefined) {
      const name = String((body as any).name ?? '').trim().slice(0, 60);
      if (!name) return c.json(problem(422, 'Validation Failed', 'Folder name cannot be empty.'), 422, { 'Content-Type': P });
      patch.name = name;
    }
    if ((body as any).parentId !== undefined) {
      const parentId = (body as any).parentId == null ? null : Number((body as any).parentId);
      if (parentId != null) {
        if (parentId === id) return c.json(problem(422, 'Validation Failed', 'A folder cannot be its own parent.'), 422, { 'Content-Type': P });
        // walk up from the new parent — it must not pass through this folder
        let cursor: number | null = parentId;
        const seen = new Set<number>();
        while (cursor != null && !seen.has(cursor)) {
          seen.add(cursor);
          if (cursor === id) return c.json(problem(422, 'Validation Failed', 'Cannot move a folder inside its own subtree.'), 422, { 'Content-Type': P });
          const row: { parentId: number | null } | undefined = (await db.select({ parentId: mediaFolder.parentId }).from(mediaFolder).where(eq(mediaFolder.id, cursor)).limit(1))[0];
          cursor = row?.parentId ?? null;
        }
      }
      patch.parentId = parentId;
    }
    const rows = await db.update(mediaFolder).set(patch).where(eq(mediaFolder.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Folder not found'), 404, { 'Content-Type': P });
    await auditRow(c, s.user.id, 'media.folder.update', String(id), patch, 'media_folder');
    return c.json(rows[0]);
  });

  r.delete('/media-folders/:id', async (c) => {
    const s = await authorGuard(c);
    if (s instanceof Response) return s;
    const id = Number(c.req.param('id'));
    const childCount = await db.select({ n: sql<number>`count(*)` }).from(mediaFolder).where(eq(mediaFolder.parentId, id));
    const assetCount = await db.select({ n: sql<number>`count(*)` }).from(mediaAsset).where(eq(mediaAsset.folderId, id));
    if (Number(childCount[0]?.n ?? 0) > 0) {
      return c.json(problem(409, 'Conflict', 'Folder still contains sub-folders — delete or move them first.'), 409, { 'Content-Type': P });
    }
    if (Number(assetCount[0]?.n ?? 0) > 0) {
      return c.json(problem(409, 'Conflict', `Folder still contains ${assetCount[0].n} asset(s) — move them elsewhere first.`), 409, { 'Content-Type': P });
    }
    const rows = await db.delete(mediaFolder).where(eq(mediaFolder.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Folder not found'), 404, { 'Content-Type': P });
    await auditRow(c, s.user.id, 'media.folder.delete', String(id), { name: rows[0].name }, 'media_folder');
    return c.json({ deleted: true });
  });

  // ---------------- assets ----------------
  r.get('/media', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const q = c.req.query('q');
    const folder = c.req.query('folder');
    const kind = (c.req.query('kind') ?? '').trim();
    const missingAlt = c.req.query('missingAlt') === '1';
    const filters = [];
    // 0023: search across key AND alt text (metadata searchability, DAM §search)
    if (q) filters.push(or(
      ilike(mediaAsset.key, `%${q.replace(/[%_]/g, '')}%`),
      ilike(mediaAsset.alt, `%${q.replace(/[%_]/g, '')}%`),
    ));
    if (folder === 'none') filters.push(isNull(mediaAsset.folderId));
    else if (folder && Number.isInteger(Number(folder))) filters.push(eq(mediaAsset.folderId, Number(folder)));
    if (['image', 'video', 'document'].includes(kind)) filters.push(eq(mediaAsset.kind, kind));
    if (missingAlt) filters.push(isNull(mediaAsset.alt));
    const where = filters.length ? and(...filters) : undefined;
    const rows = await db.select().from(mediaAsset)
      .where(where)
      .orderBy(desc(mediaAsset.id)).limit(200);
    const [{ n: total }] = await db.select({ n: sql<number>`count(*)` }).from(mediaAsset).where(where);
    return c.json({ items: rows, total: Number(total) });
  });

  /** 0023: library analytics — DAM health dashboard: totals by kind, alt-text
   *  compliance, storage footprint, responsive-variant coverage, 14d uploads. */
  r.get('/media-analytics', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const byKind = await db.select({
      kind: mediaAsset.kind, n: sql<number>`count(*)`, bytes: sql<number>`coalesce(sum((meta->>'bytes')::bigint),0)`,
    }).from(mediaAsset).groupBy(mediaAsset.kind);
    const [alt] = await db.select({
      total: sql<number>`count(*)`,
      withAlt: sql<number>`count(${mediaAsset.alt})`,
      lowRes: sql<number>`count(*) filter (where width is not null and width < 1200)`,
      withVariants: sql<number>`count(*) filter (where meta ? 'variants')`,
    }).from(mediaAsset);
    const arrivals = await db.select({ d: sql<string>`to_char(${mediaAsset.createdAt}, 'YYYY-MM-DD')`, n: sql<number>`count(*)` })
      .from(mediaAsset)
      .where(sql`${mediaAsset.createdAt} > now() - interval '13 days'`)
      .groupBy(sql`to_char(${mediaAsset.createdAt}, 'YYYY-MM-DD')`);
    const series: Array<{ d: string; n: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      series.push({ d: key, n: Number(arrivals.find((x) => x.d === key)?.n ?? 0) });
    }
    const total = Number(alt?.total ?? 0) || 1;
    return c.json({
      total: Number(alt?.total ?? 0),
      byKind: byKind.map((x) => ({ kind: x.kind, n: Number(x.n), bytes: Number(x.bytes) })),
      withAlt: Number(alt?.withAlt ?? 0),
      altCompliance: Math.round((Number(alt?.withAlt ?? 0) / total) * 100),
      lowRes: Number(alt?.lowRes ?? 0),
      variantCoverage: Math.round((Number(alt?.withVariants ?? 0) / total) * 100),
      storageBytes: byKind.reduce((s, x) => s + Number(x.bytes), 0),
      series,
    });
  });

  r.post('/media', async (c) => {
    const s = await authorGuard(c);
    if (s instanceof Response) return s;

    const form = await c.req.formData().catch(() => null);
    const file = form?.get('file');
    const alt = String(form?.get('alt') ?? '').trim();
    if (!(file instanceof File)) return c.json(problem(422, 'Validation Failed', 'multipart field "file" is required.'), 422, { 'Content-Type': P });
    if (!alt) return c.json(problem(422, 'Validation Failed', 'alt text is required (accessibility).'), 422, { 'Content-Type': P });
    if (file.size > MAX_BYTES) {
      return c.json(problem(413, 'File too large', `Limit is ${Math.round(MAX_BYTES / 1024 / 1024)} MB.`), 413, { 'Content-Type': P });
    }
    const dot = file.name.lastIndexOf('.');
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
    if (!ALLOWED.has(ext)) {
      const allowedList = Array.from(ALLOWED).join(', ');
      const shown = ext || '(none)';
      return c.json(problem(422, 'Validation Failed', 'Extension "' + shown + '" not allowed. Allowed: ' + allowedList), 422, { 'Content-Type': P });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const sniffed = sniffMime(bytes) ?? (ext === '.svg' ? 'image/svg+xml' : null);
    if (!sniffed) return c.json(problem(422, 'Validation Failed', 'File content does not look like an allowed media type.'), 422, { 'Content-Type': P });
    if (ext === '.svg') {
      const text = new TextDecoder().decode(bytes).toLowerCase();
      if (text.includes('<script') || text.includes('onload=')) {
        return c.json(problem(422, 'Validation Failed', 'SVG contains active content and was rejected.'), 422, { 'Content-Type': P });
      }
    }
    const kind = sniffed.startsWith('video/') ? 'video' : sniffed === 'application/pdf' ? 'document' : 'image';

    // folder assignment (optional; folder must exist)
    let folderId: number | null = null;
    const rawFolder = form?.get('folderId');
    if (rawFolder != null && String(rawFolder) !== '') {
      const fid = Number(rawFolder);
      const exists = Number.isInteger(fid) && (await db.select({ id: mediaFolder.id }).from(mediaFolder).where(eq(mediaFolder.id, fid)).limit(1))[0];
      if (!exists) return c.json(problem(422, 'Validation Failed', 'Target folder does not exist.'), 422, { 'Content-Type': P });
      folderId = fid;
    }

    const storage = getStorage();
    const hash = (await import('node:crypto')).createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const stored = `${hash}${ext}`;
    await storage.put(stored, bytes, sniffed);

    // Phase 4.2: responsive variants + colour profile (best-effort)
    const derived = kind === 'image' ? await deriveVariants(stored, bytes, sniffed) : {};
    const dims = sniffDimensions(bytes, sniffed);

    const meta: Record<string, unknown> = {
      origName: file.name.slice(0, 180), mime: sniffed, bytes: file.size,
      ...(derived.variants ? { variants: derived.variants } : {}),
      ...(derived.profile ? { profile: derived.profile } : {}),
      ...(derived.variantError ? { variantError: derived.variantError } : {}),
    };
    try {
      const rows = await db.insert(mediaAsset).values({
        key: stored, kind,
        alt: alt.slice(0, 500),
        width: dims?.width ?? null,
        height: dims?.height ?? null,
        folderId,
        meta,
        uploadedBy: s.user.id,
      }).returning();
      await auditRow(c, s.user.id, 'media.create', String(rows[0].id), { key: stored, kind, bytes: file.size, folderId });
      return c.json(rows[0], 201);
    } catch (e) {
      // Content-addressed keys: identical bytes already stored → dedupe.
      // The fresh upload wins on alt/folder (latest user intent) and the
      // existing asset (with its variants) is returned instead of erroring.
      // Drizzle wraps driver errors — match message, cause chain AND SQLSTATE.
      const isDup = [
        String((e as Error)?.message ?? ''),
        String((e as { cause?: { message?: string } })?.cause?.message ?? ''),
        String((e as { code?: string })?.code ?? ''),
      ].some((s) => /unique|duplicate|23505/i.test(s));
      if (isDup) {
        const existing = (await db.select().from(mediaAsset).where(eq(mediaAsset.key, stored)).limit(1))[0];
        if (existing) {
          const patch: Record<string, unknown> = {};
          if (alt.slice(0, 500) !== existing.alt) patch.alt = alt.slice(0, 500);
          if (folderId !== existing.folderId) patch.folderId = folderId;
          const rows = Object.keys(patch).length
            ? await db.update(mediaAsset).set(patch).where(eq(mediaAsset.id, existing.id)).returning()
            : [existing];
          await auditRow(c, s.user.id, 'media.dedupe', String(existing.id), { key: stored, patch });
          return c.json({ ...rows[0], deduplicated: true }, 200);
        }
      }
      throw e;
    }
  });

  r.get('/media/:id/file', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const variant = c.req.query('variant');
    const rows = await db.select().from(mediaAsset).where(eq(mediaAsset.id, id)).limit(1);
    const asset = rows[0];
    if (!asset) return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });

    let key = asset.key;
    let mime = String((asset.meta as any)?.mime ?? 'application/octet-stream');
    let immutable = false;
    if (variant) {
      const spec = VARIANT_SPECS.find((v) => v.name === variant);
      if (!spec) return c.json(problem(404, 'Unknown variant'), 404, { 'Content-Type': P });
      const target = (((asset.meta as any)?.variants ?? {}) as Record<string, { key: string; mime: string }>)[variant];
      if (target) {
        key = target.key;
        mime = target.mime;
        immutable = true; // derivative bytes never change for a given key
      }
      // no manifest entry (legacy asset, SVG, animated GIF) → fall back to the
      // original so thumbnails never 404 for pre-DAM uploads
    }

    const obj = await getStorage().get(key);
    if (!obj) return c.json(problem(404, 'Media file missing in storage'), 404, { 'Content-Type': P });
    const serveMime = variant ? mime : (obj.mime === 'application/octet-stream' ? mime : obj.mime);
    if (serveMime === 'image/svg+xml') {
      c.header('Content-Disposition', 'attachment; filename="' + asset.key + '"'); // SVG never renders inline here
    }
    return c.body(obj.bytes as any, 200, {
      'Content-Type': serveMime,
      'Cache-Control': immutable ? 'private, max-age=86400, immutable' : 'private, max-age=60',
    });
  });

  /** 0023: per-asset usage — where this file is referenced (products/articles/
   *  news), plus its admin and public URLs. The same in-use guard data the
   *  delete route checks, surfaced proactively (DAM usage-tracking practice). */
  r.get('/media/:id/usage', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const row = (await db.select().from(mediaAsset).where(eq(mediaAsset.id, id)).limit(1))[0];
    if (!row) return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });
    return c.json({
      id,
      usage: await usageOf(id),
      urls: {
        admin: '/api/v1/admin/media/' + id + '/file',
        public: '/api/v1/media/' + id + '/file',
        variants: Object.keys((row.meta as any)?.variants ?? {}),
      },
    });
  });

  r.patch('/media/:id', async (c) => {
    const s = await authorGuard(c);
    if (s instanceof Response) return s;
    const id = Number(c.req.param('id'));
    const body = await c.req.json().catch(() => ({}));
    const patch: Record<string, unknown> = {};
    if ((body as any).alt !== undefined) {
      const alt = String((body as any).alt ?? '').trim();
      if (!alt) return c.json(problem(422, 'Validation Failed', 'alt text cannot be empty.'), 422, { 'Content-Type': P });
      patch.alt = alt.slice(0, 500);
    }
    if ((body as any).folderId !== undefined) {
      const folderId = (body as any).folderId == null ? null : Number((body as any).folderId);
      if (folderId != null) {
        const exists = Number.isInteger(folderId) && (await db.select({ id: mediaFolder.id }).from(mediaFolder).where(eq(mediaFolder.id, folderId)).limit(1))[0];
        if (!exists) return c.json(problem(422, 'Validation Failed', 'Target folder does not exist.'), 422, { 'Content-Type': P });
      }
      patch.folderId = folderId;
    }
    if (!Object.keys(patch).length) return c.json(problem(422, 'Validation Failed', 'Nothing to update (alt and/or folderId).'), 422, { 'Content-Type': P });
    const rows = await db.update(mediaAsset).set(patch).where(eq(mediaAsset.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });
    await auditRow(c, s.user.id, 'media.update', String(id), patch);
    return c.json(rows[0]);
  });

  r.delete('/media/:id', async (c) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    if (!(await deps.requireRole('admin')(c.req.raw))) return c.json(problem(403, 'Requires admin role or above'), 403, { 'Content-Type': P });
    const id = Number(c.req.param('id'));

    const rows = await db.select().from(mediaAsset).where(eq(mediaAsset.id, id)).limit(1);
    const asset = rows[0];
    if (!asset) return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });

    // Phase 4.3: referential integrity — refuse to delete an asset that is
    // still the hero or gallery image of a live product/article/news item.
    const usage = await usageOf(id);
    if (usage.length) {
      const listing = usage.slice(0, 8).map((u) => `${u.entity} #${u.id} (${u.label})`).join('; ');
      return c.json(problem(409, 'In use', `Asset is referenced by ${usage.length} item(s): ${listing}${usage.length > 8 ? ' …' : ''}`), 409, { 'Content-Type': P });
    }

    const storage = getStorage();
    await storage.delete(asset.key);
    const variants = ((asset.meta as any)?.variants ?? {}) as Record<string, { key: string }>;
    for (const v of Object.values(variants)) await storage.delete(v.key);

    await db.delete(mediaAsset).where(eq(mediaAsset.id, id));
    await auditRow(c, s.user.id, 'media.delete', String(id), { key: asset.key, variants: Object.keys(variants) });
    return c.json({ deleted: true });
  });

  return r;
}

// ---- P8 imagery bridge: public, read-only image serving ---------------------
// The storefront catalog bridge (export-content → cms-merge) references media
// by URL so admin-managed product imagery renders on the public site. Same
// lookup discipline as the admin route (DB id → storage key → driver; a client
// can never pass a path), restricted to raster images — SVG and non-image
// kinds stay admin-only. Unauthenticated by design; global rate limiting and
// the RFC 9457 envelope still apply.
export function publicMediaRoute(db: DB) {
  const r = new Hono();

  r.get('/media/:id/file', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });
    const rows = await db.select().from(mediaAsset).where(eq(mediaAsset.id, id)).limit(1);
    const asset = rows[0];
    if (!asset || asset.kind !== 'image') return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });

    let key = asset.key;
    let mime = String((asset.meta as any)?.mime ?? 'application/octet-stream');
    let immutable = false;
    const variant = c.req.query('variant');
    if (variant) {
      if (!VARIANT_SPECS.some((v) => v.name === variant)) return c.json(problem(404, 'Unknown variant'), 404, { 'Content-Type': P });
      const target = (((asset.meta as any)?.variants ?? {}) as Record<string, { key: string; mime: string }>)[variant];
      if (target) { key = target.key; mime = target.mime; immutable = true; }
      // no manifest entry (legacy asset, animated GIF) → serve the original
    }
    // SVG never renders on the public surface (stored-script risk) — admin-only.
    if (mime === 'image/svg+xml') return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });

    const obj = await getStorage().get(key);
    if (!obj) return c.json(problem(404, 'Media file missing in storage'), 404, { 'Content-Type': P });
    const serveMime = obj.mime && obj.mime !== 'application/octet-stream' ? obj.mime : mime;
    return c.body(obj.bytes as any, 200, {
      'Content-Type': serveMime,
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
    });
  });

  return r;
}
