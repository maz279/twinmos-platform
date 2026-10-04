// P5 partner portal — channel organizations (Distributor/OEM/SI), membership
// gating, and protected downloads (price files, MDF docs, resources).
// Auth model: Better Auth sessions (existing machinery) + partner_member rows;
// documented in docs/p5-evidence.md as an alternative to the better-auth
// organization plugin (same capability, our migrations, no generated tables).
// Gating rules: org must be 'active'; the member's org type must appear in the
// asset's visibleToTypes; org-scoped assets only for that org.
import { Hono } from 'hono';
import { and, count, desc, eq, or, isNull, sql } from 'drizzle-orm';
import {
  partnerOrgCreateSchema, partnerOrgUpdateSchema, partnerMemberAddSchema,
  PARTNER_ASSET_CATEGORY_SCHEMA, problem,
  distributorCreateSchema, distributorUpdateSchema,
  marketplaceListingCreateSchema, marketplaceListingUpdateSchema,
  DISTRIBUTOR_REGIONS, DISTRIBUTOR_STATUSES,
} from '@twinmos/shared';
import { partnerOrg, partnerMember, partnerAsset, auditLog, distributor, marketplaceListing } from '@twinmos/db';
import { mkdirSync, writeFileSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, sep } from 'node:path';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

// Partner files are documents (price lists, MDF docs, resources) — the allowlist
// is document-oriented, unlike the image-centric media library. The mapped MIME
// is stored instead of the client-declared type so a renamed file cannot smuggle
// an executable content type into the download response.
const DEFAULT_ASSET_MAX_BYTES = 25 * 1024 * 1024;
const ASSET_EXTS: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.csv': 'text/csv',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

/** Resolves the caller's ACTIVE membership (org row + role) or null. */
async function activeMembership(db: DB, userId: string) {
  const rows = await db
    .select({ org: partnerOrg, role: partnerMember.role })
    .from(partnerMember)
    .innerJoin(partnerOrg, eq(partnerMember.orgId, partnerOrg.id))
    .where(and(eq(partnerMember.userId, userId), eq(partnerOrg.status, 'active')))
    .orderBy(partnerMember.id) // deterministic when a user belongs to several orgs
    .limit(1);
  return rows[0] ?? null;
}

export function partnerRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();
  const FILES_DIR = process.env.PARTNER_FILES_DIR ?? './data/partner-files';

  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  async function adminGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('admin')(c.req.raw)) ? s : c.json(problem(403, 'Requires admin role or above'), 403, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity: 'partner', entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  // ---------- portal (member) ----------
  r.get('/partner/me', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const m = await activeMembership(db, a.user.id);
    if (!m) return c.json(problem(403, 'No active partner membership', 'This account is not a member of an active partner organization.'), 403, { 'Content-Type': P });
    return c.json({ user: { id: a.user.id, email: a.user.email }, org: m.org, memberRole: m.role });
  });

  r.get('/partner/assets', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const m = await activeMembership(db, a.user.id);
    if (!m) return c.json(problem(403, 'No active partner membership'), 403, { 'Content-Type': P });
    // membership already guarantees the org is active; gating is scope + type
    const rows = await db.select({
      id: partnerAsset.id, category: partnerAsset.category, title: partnerAsset.title,
      mime: partnerAsset.mime, bytes: partnerAsset.bytes, createdAt: partnerAsset.createdAt,
    }).from(partnerAsset)
      .where(and(
        or(isNull(partnerAsset.orgId), eq(partnerAsset.orgId, m.org.id)),
        sql`${partnerAsset.visibleToTypes} @> ARRAY[${m.org.type}]::varchar[]`,
      ))
      .orderBy(desc(partnerAsset.id)).limit(200);
    return c.json({ org: { id: m.org.id, name: m.org.name, type: m.org.type }, items: rows });
  });

  r.get('/partner/assets/:id/download', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const m = await activeMembership(db, a.user.id);
    if (!m) return c.json(problem(403, 'No active partner membership'), 403, { 'Content-Type': P });
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(partnerAsset).where(eq(partnerAsset.id, id)).limit(1);
    const asset = rows[0];
    if (!asset) return c.json(problem(404, 'Asset not found'), 404, { 'Content-Type': P });
    // gating: org scope + type visibility
    if (asset.orgId != null && asset.orgId !== m.org.id) {
      return c.json(problem(403, 'Not available to your organization'), 403, { 'Content-Type': P });
    }
    if (!asset.visibleToTypes.includes(m.org.type)) {
      return c.json(problem(403, 'Not available to your partner type'), 403, { 'Content-Type': P });
    }
    // path-traversal guard (same pattern as media serving)
    const root = resolve(FILES_DIR);
    const target = resolve(join(FILES_DIR, asset.fileKey));
    if (!target.startsWith(root + sep)) return c.json(problem(400, 'Invalid asset key'), 400, { 'Content-Type': P });
    let bytes: Uint8Array;
    try {
      if (!statSync(target).isFile()) throw new Error('not a file');
      bytes = new Uint8Array(readFileSync(target));
    } catch {
      return c.json(problem(404, 'Asset file missing on disk'), 404, { 'Content-Type': P });
    }
    await auditRow(c, a.user.id, 'partner.download', String(id), { title: asset.title.slice(0, 80) });
    return c.body(bytes as any, 200, {
      'Content-Type': asset.mime,
      'Content-Disposition': 'attachment; filename="' + asset.fileKey + '"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
  });
  return r;
}


export function partnerAdminRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();
  const FILES_DIR = process.env.PARTNER_FILES_DIR ?? './data/partner-files';

  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  async function adminGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('admin')(c.req.raw)) ? s : c.json(problem(403, 'Requires admin role or above'), 403, { 'Content-Type': P });
  }
  /** 0020: directory CRUD is editor+ (channel data maintenance, not governance). */
  async function editorGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('editor')(c.req.raw)) ? s : c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity: 'partner', entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }


  // ---------- admin: orgs ----------
  r.get('/partner-orgs', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const typeQ = c.req.query('type');
    const statusQ = c.req.query('status');
    const q = (c.req.query('q') ?? '').trim();
    const rows = await db.select().from(partnerOrg)
      .where(and(
        typeQ ? eq(partnerOrg.type, typeQ) : undefined,
        statusQ ? eq(partnerOrg.status, statusQ) : undefined,
        // 0020: org search — name, country or contact email
        q ? or(sql`${partnerOrg.name} ilike ${'%' + q + '%'}`, sql`coalesce(${partnerOrg.country}, '') ilike ${'%' + q + '%'}`, sql`coalesce(${partnerOrg.contactEmail}, '') ilike ${'%' + q + '%'}`)! : undefined,
      ) ?? undefined)
      .orderBy(desc(partnerOrg.id)).limit(200);
    const counts = await db.select({ orgId: partnerMember.orgId, id: partnerMember.id }).from(partnerMember);
    const byOrg: Record<number, number> = {};
    counts.forEach((x: any) => { byOrg[x.orgId] = (byOrg[x.orgId] ?? 0) + 1; });
    return c.json({ items: rows.map((o: any) => ({ ...o, memberCount: byOrg[o.id] ?? 0 })) });
  });

  r.post('/partner-orgs', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = partnerOrgCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.insert(partnerOrg).values({ ...parsed.data, status: 'pending' }).returning();
    await auditRow(c, guard.user.id, 'partnerOrg.create', String(rows[0].id), parsed.data);
    return c.json(rows[0], 201);
  });

  r.patch('/partner-orgs/:id', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = partnerOrgUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(partnerOrg).set(parsed.data).where(eq(partnerOrg.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Organization not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'partnerOrg.update', String(id), parsed.data);
    return c.json(rows[0]);
  });

  /** 0020: org deletion — admin+, refused while members exist (empty-delete
   *  guard, same discipline as media folders). Assets cascade via FK. */
  r.delete('/partner-orgs/:id', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const members = await db.select({ id: partnerMember.id }).from(partnerMember).where(eq(partnerMember.orgId, id)).limit(1);
    if (members.length) {
      return c.json(problem(409, 'Organization still has members', 'Remove all member accounts before deleting the organization.'), 409, { 'Content-Type': P });
    }
    const rows = await db.delete(partnerOrg).where(eq(partnerOrg.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Organization not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'partnerOrg.delete', String(id), { name: rows[0].name });
    return c.json({ deleted: true });
  });

  // ---------- admin: members ----------
  r.post('/partner-orgs/:id/members', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = partnerMemberAddSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const { user } = await import('@twinmos/db');
    const found = await db.select({ id: user.id }).from(user).where(eq(user.email, parsed.data.email)).limit(1);
    if (!found[0]) {
      return c.json(problem(404, 'No account with that email', 'The partner must create a site account first (sign-up), then be added.'), 404, { 'Content-Type': P });
    }
    const rows = await db.insert(partnerMember)
      .values({ orgId: id, userId: found[0].id, role: parsed.data.role })
      .onConflictDoNothing().returning();
    if (!rows[0]) return c.json(problem(409, 'Already a member of this organization'), 409, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'partnerMember.add', String(id), { email: parsed.data.email, role: parsed.data.role });
    return c.json(rows[0], 201);
  });

  r.get('/partner-orgs/:id/members', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const { user } = await import('@twinmos/db');
    const rows = await db.select({ id: partnerMember.id, role: partnerMember.role, userId: partnerMember.userId, email: user.email })
      .from(partnerMember).innerJoin(user, eq(partnerMember.userId, user.id))
      .where(eq(partnerMember.orgId, id));
    return c.json({ items: rows });
  });

  r.delete('/partner-orgs/:id/members/:memberId', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const memberId = Number(c.req.param('memberId'));
    const rows = await db.select().from(partnerMember)
      .where(and(eq(partnerMember.id, memberId), eq(partnerMember.orgId, id))).limit(1);
    if (!rows[0]) return c.json(problem(404, 'Membership not found'), 404, { 'Content-Type': P });
    if (rows[0].role === 'owner') {
      const owners = await db.select({ id: partnerMember.id }).from(partnerMember)
        .where(and(eq(partnerMember.orgId, id), eq(partnerMember.role, 'owner')));
      if (owners.length <= 1) {
        return c.json(problem(409, 'Cannot remove the only owner', 'Promote another member to owner first, or suspend the organization.'), 409, { 'Content-Type': P });
      }
    }
    await db.delete(partnerMember).where(eq(partnerMember.id, memberId));
    await auditRow(c, guard.user.id, 'partnerMember.remove', String(id), { memberId, userId: rows[0].userId });
    return c.json({ deleted: true });
  });

  // ---------- admin: assets ----------
  r.get('/partner-assets', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const org = c.req.query('org');
    const category = c.req.query('category');
    const rows = await db.select().from(partnerAsset)
      .where(and(
        org ? eq(partnerAsset.orgId, Number(org)) : undefined,
        category ? eq(partnerAsset.category, category) : undefined,
      ) ?? undefined)
      .orderBy(desc(partnerAsset.id)).limit(200);
    return c.json({ items: rows });
  });

  r.post('/partner-orgs/:id/assets', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const idParam = Number(c.req.param('id')); // 0 = global (all orgs of visible types)
    const form = await c.req.formData().catch(() => null);
    const file = form?.get('file');
    const title = String(form?.get('title') ?? '').trim();
    const category = PARTNER_ASSET_CATEGORY_SCHEMA.safeParse(String(form?.get('category') ?? ''));
    const rawTypes = String(form?.get('visibleToTypes') ?? 'distributor,oem,si').split(',').map((s) => s.trim()).filter(Boolean);
    if (!(file instanceof File)) return c.json(problem(422, 'Validation Failed', 'multipart field "file" required.'), 422, { 'Content-Type': P });
    if (!title) return c.json(problem(422, 'Validation Failed', 'title required.'), 422, { 'Content-Type': P });
    if (!category.success) return c.json(problem(422, 'Validation Failed', 'category must be price_file | mdf | resource'), 422, { 'Content-Type': P });
    const maxBytes = Number(process.env.PARTNER_MAX_BYTES ?? DEFAULT_ASSET_MAX_BYTES);
    if (file.size > maxBytes) {
      return c.json(problem(413, 'File too large', `Limit is ${Math.round(maxBytes / 1024 / 1024)} MB.`), 413, { 'Content-Type': P });
    }
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const safeMime = ASSET_EXTS[ext];
    if (!safeMime) {
      return c.json(problem(422, 'Validation Failed', `File type not allowed. Allowed extensions: ${Object.keys(ASSET_EXTS).join(', ')}.`), 422, { 'Content-Type': P });
    }
    const { PARTNER_TYPES } = await import('@twinmos/shared');
    const types = rawTypes.filter((t): t is (typeof PARTNER_TYPES)[number] => (PARTNER_TYPES as readonly string[]).includes(t));
    if (!types.length) return c.json(problem(422, 'Validation Failed', 'visibleToTypes must include at least one of distributor/oem/si'), 422, { 'Content-Type': P });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const stored = hash + '-' + file.name.replace(/[^\w.-]+/g, '_').slice(-80);
    mkdirSync(FILES_DIR, { recursive: true });
    writeFileSync(join(FILES_DIR, stored), bytes);

    const rows = await db.insert(partnerAsset).values({
      orgId: idParam > 0 ? idParam : null,
      category: category.data, title: title.slice(0, 200), fileKey: stored,
      mime: safeMime, bytes: file.size,
      visibleToTypes: types, uploadedBy: guard.user.id,
    }).returning();
    await auditRow(c, guard.user.id, 'partnerAsset.create', String(rows[0].id), { title: title.slice(0, 80), category: category.data, types });
    return c.json(rows[0], 201);
  });

  r.delete('/partner-assets/:id', async (c) => {
    const guard = await adminGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(partnerAsset).where(eq(partnerAsset.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Asset not found'), 404, { 'Content-Type': P });
    try { unlinkSync(join(FILES_DIR, rows[0].fileKey)); } catch { /* file already gone — row removal is the source of truth */ }
    await auditRow(c, guard.user.id, 'partnerAsset.delete', String(id), {});
    return c.json({ deleted: true });
  });

  // ---------- 0020: where-to-buy directory (public locator source) ----------
  // CRUD + batch CSV import over the distributor directory that feeds the
  // public where-to-buy page through the export/merge bridge. editor+.

  r.get('/distributors', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const q = (c.req.query('q') ?? '').trim();
    const region = c.req.query('region') ?? '';
    const status = c.req.query('status') ?? '';
    const filters = [
      q ? or(sql`${distributor.name} ilike ${'%' + q + '%'}`, sql`${distributor.country} ilike ${'%' + q + '%'}`, sql`array_to_string(${distributor.cities}, ' ') ilike ${'%' + q + '%'}`)! : undefined,
      (DISTRIBUTOR_REGIONS as readonly string[]).includes(region) ? eq(distributor.region, region as (typeof DISTRIBUTOR_REGIONS)[number]) : undefined,
      (DISTRIBUTOR_STATUSES as readonly string[]).includes(status) ? eq(distributor.status, status as (typeof DISTRIBUTOR_STATUSES)[number]) : undefined,
    ].filter((f) => f !== undefined);
    const where = filters.length ? and(...filters) : undefined;
    const rows = await db.select().from(distributor)
      .where(where).orderBy(desc(distributor.id)).limit(300);
    const [{ n }] = await db.select({ n: count() }).from(distributor).where(where);
    return c.json({ items: rows, total: Number(n) });
  });

  r.post('/distributors', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = distributorCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.insert(distributor).values(parsed.data as any).returning();
    await auditRow(c, guard.user.id, 'distributor.create', String(rows[0].id), parsed.data);
    return c.json(rows[0], 201);
  });

  r.patch('/distributors/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = distributorUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(distributor).set(parsed.data as any).where(eq(distributor.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Distributor not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'distributor.update', String(id), parsed.data);
    return c.json(rows[0]);
  });

  r.delete('/distributors/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(distributor).where(eq(distributor.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Distributor not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'distributor.delete', String(id), { name: rows[0].name, country: rows[0].country });
    return c.json({ deleted: true });
  });

  /** Batch CSV import — columns: name,country,region,status,cities,contactEmail,website,note
   *  (cities are ';'-separated). Upsert by (name, country). */
  r.post('/distributors/import', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const body = await c.req.json().catch(() => ({}));
    const csv = String((body as any).csv ?? '');
    const dryRun = (body as any).dryRun !== false;
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return c.json(problem(422, 'Validation Failed', 'CSV needs a header and at least one row.'), 422, { 'Content-Type': P });
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const COLS = ['name', 'country', 'region', 'status', 'cities', 'contactemail', 'website', 'note'];
    if (header.join(',') !== COLS.join(',')) {
      return c.json(problem(422, 'Validation Failed', 'Header must be exactly: ' + COLS.join(',')), 422, { 'Content-Type': P });
    }
    const existing = await db.select().from(distributor);
    const keyOf = (x: any) => `${x.name.toLowerCase()}|${x.country.toLowerCase()}`;
    const byKey = new Map(existing.map((x: any) => [keyOf(x), x]));
    const seen = new Set<string>();
    const valid: Array<{ key: string; id?: number; values: Record<string, unknown> }> = [];
    const errors: Array<{ line: number; message: string }> = [];
    for (let i = 1; i < lines.length; i++) {
      const lineNo = i + 1;
      // quoted-field aware split (cities/note can carry commas)
      const cols: string[] = []; let cur = ''; let inQ = false;
      for (const ch of lines[i]) {
        if (inQ) { if (ch === '"') inQ = false; else cur += ch; }
        else if (ch === '"') inQ = true;
        else if (ch === ',') { cols.push(cur); cur = ''; }
        else cur += ch;
      }
      cols.push(cur);
      const [name, country, region, status, cities, contactEmail, website, note] = cols.map((s) => s.trim());
      const fail = (message: string) => errors.push({ line: lineNo, message });
      if (!name || !country) { fail('name and country are required.'); continue; }
      if (!(DISTRIBUTOR_REGIONS as readonly string[]).includes(region)) { fail(`region must be one of ${DISTRIBUTOR_REGIONS.join(', ')}.`); continue; }
      if (!(DISTRIBUTOR_STATUSES as readonly string[]).includes(status)) { fail(`status must be one of ${DISTRIBUTOR_STATUSES.join(', ')}.`); continue; }
      const key = keyOf({ name, country });
      if (seen.has(key)) { fail('Duplicate name+country earlier in this file.'); continue; }
      seen.add(key);
      const contact: Record<string, string> = {};
      if (contactEmail) contact.email = contactEmail;
      if (website) contact.website = website;
      const values = {
        name, country, region, status,
        cities: cities ? cities.split(';').map((s) => s.trim()).filter(Boolean).slice(0, 20) : [],
        contact, note: note || null,
      };
      const match = byKey.get(key);
      valid.push({ key, id: match?.id, values });
    }
    if (dryRun) {
      return c.json({
        dryRun: true,
        wouldCreate: valid.filter((v) => !v.id).length,
        wouldUpdate: valid.filter((v) => v.id).length,
        errors,
      });
    }
    if (errors.length) return c.json(problem(422, 'Validation Failed', errors.length + ' row(s) failed — fix and re-run.', errors), 422, { 'Content-Type': P });
    for (const v of valid) {
      if (v.id != null) await db.update(distributor).set(v.values as any).where(eq(distributor.id, v.id));
      else await db.insert(distributor).values(v.values as any);
    }
    await auditRow(c, guard.user.id, 'distributor.import', 'batch', {
      created: valid.filter((v) => v.id == null).length,
      updated: valid.filter((v) => v.id != null).length,
    });
    return c.json({
      dryRun: false,
      imported: valid.filter((v) => v.id == null).length,
      updated: valid.filter((v) => v.id != null).length,
    });
  });

  // ---------- 0020: verified marketplace listings ----------
  r.get('/marketplace-listings', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const rows = await db.select().from(marketplaceListing).orderBy(desc(marketplaceListing.id)).limit(200);
    return c.json({ items: rows });
  });

  r.post('/marketplace-listings', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = marketplaceListingCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.insert(marketplaceListing).values({ ...parsed.data, verifiedAt: new Date() }).returning();
    await auditRow(c, guard.user.id, 'marketplace.create', String(rows[0].id), parsed.data);
    return c.json(rows[0], 201);
  });

  r.delete('/marketplace-listings/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(marketplaceListing).where(eq(marketplaceListing.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Listing not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'marketplace.delete', String(id), { platform: rows[0].platform });
    return c.json({ deleted: true });
  });

  return r;
}
