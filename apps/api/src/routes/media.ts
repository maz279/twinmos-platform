// P3 media library — multipart upload to MEDIA_DIR (dev: local disk; the prod
// driver swaps to object storage without touching callers). Guards: size cap,
// extension allow-list, content sniffed from the bytes, alt-text required for
// accessibility compliance (docs/04 §Media). Columns align to media_asset:
// key (stored name) · kind · alt · meta{origName,mime,bytes,folder} · uploadedBy.
import { Hono } from 'hono';
import { desc, eq, like } from 'drizzle-orm';
import { problem } from '@twinmos/shared';
import { mediaAsset, auditLog } from '@twinmos/db';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
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

export function mediaRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();
  const MEDIA_DIR = process.env.MEDIA_DIR ?? './data/media';

  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity: 'media_asset', entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  r.get('/media', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const q = c.req.query('q');
    const rows = await db.select().from(mediaAsset)
      .where(q ? like(mediaAsset.key, `%${q.replace(/[%_]/g, '')}%`) : undefined)
      .orderBy(desc(mediaAsset.id)).limit(100);
    return c.json({ items: rows });
  });

  r.post('/media', async (c) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    if (!(await deps.requireRole('author')(c.req.raw))) return c.json(problem(403, 'Requires author role or above'), 403, { 'Content-Type': P });

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
    if (sniffed.startsWith('video/')) { /* mp4/webm magic is codec-varied; extension allow-list governs */ }
    if (ext === '.svg') {
      const text = new TextDecoder().decode(bytes).toLowerCase();
      if (text.includes('<script') || text.includes('onload=')) {
        return c.json(problem(422, 'Validation Failed', 'SVG contains active content and was rejected.'), 422, { 'Content-Type': P });
      }
    }
    const kind = sniffed.startsWith('video/') ? 'video' : sniffed === 'application/pdf' ? 'document' : 'image';

    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const stored = `${hash}${ext}`;
    mkdirSync(MEDIA_DIR, { recursive: true });
    writeFileSync(join(MEDIA_DIR, stored), bytes);

    const folder = String(form?.get('folder') ?? 'uploads').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'uploads';
    const rows = await db.insert(mediaAsset).values({
      key: stored, kind,
      alt: alt.slice(0, 500),
      meta: { origName: file.name.slice(0, 180), mime: sniffed, bytes: file.size, folder },
      uploadedBy: s.user.id,
    }).returning();
    await auditRow(c, s.user.id, 'media.create', String(rows[0].id), { key: stored, kind, bytes: file.size });
    return c.json(rows[0], 201);
  });

  r.patch('/media/:id', async (c) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    if (!(await deps.requireRole('author')(c.req.raw))) return c.json(problem(403, 'Requires author role or above'), 403, { 'Content-Type': P });
    const id = Number(c.req.param('id'));
    const alt = String((await c.req.json().catch(() => ({}))).alt ?? '').trim();
    if (!alt) return c.json(problem(422, 'Validation Failed', 'alt text cannot be empty.'), 422, { 'Content-Type': P });
    const rows = await db.update(mediaAsset).set({ alt: alt.slice(0, 500) }).where(eq(mediaAsset.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });
    await auditRow(c, s.user.id, 'media.update', String(id), { alt: alt.slice(0, 80) });
    return c.json(rows[0]);
  });

  r.delete('/media/:id', async (c) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    if (!(await deps.requireRole('admin')(c.req.raw))) return c.json(problem(403, 'Requires admin role or above'), 403, { 'Content-Type': P });
    const id = Number(c.req.param('id'));
    const rows = await db.delete(mediaAsset).where(eq(mediaAsset.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Media not found'), 404, { 'Content-Type': P });
    await auditRow(c, s.user.id, 'media.delete', String(id), {});
    return c.json({ deleted: true });
  });

  return r;
}
