// Admin CRUD — products (P0 reference module) + P2 modules: dashboard KPIs,
// submissions inbox, RMA board (server-enforced state machine), job applications.
// Every mutation: session + RBAC guard, Zod validation, parameter-bound Drizzle
// queries, audit row. Reads: any authenticated role; writes: editor+.
import { Hono } from 'hono';
import { and, asc, count, desc, eq, gte, ilike, inArray, isNull, lt, lte, isNotNull, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  jobApplicationUpdateSchema, productCreateSchema, productUpdateSchema, problem,
  rmaTransitionSchema, submissionUpdateSchema, formNoteCreateSchema,
  RMA_TRANSITIONS, SUBMISSION_STATUS, SUBMISSION_TRANSITIONS, SUBMISSION_PRIORITY, RMA_STATUS,
  variantCreateSchema, variantUpdateSchema, compatibilityCreateSchema, compatibilityUpdateSchema,
  COMPAT_DEVICE_TYPES, COMPAT_MEMORY_GENS, COMPAT_FORM_FACTORS,
  productImportSchema, PRODUCT_IMPORT_COLUMNS, AUTHORIZED_CURRENCIES, CONTENT_STATUS, sameInstant,
  jobPostingCreateSchema, jobPostingUpdateSchema, JOB_POSTING_STATUSES,
} from '@twinmos/shared';
import { auditLog, brand, category, compatibilityRule, formNote, formSubmission, jobApplication, jobPosting, product, productVariant, rmaEvent, rmaRequest, serialRegistry, snCheck, user, article, page, newsPost, faq, mediaAsset } from '@twinmos/db';
import { sendRmaStatusMail, sendCustomerConfirmation } from '../mailer.ts';
import { IdempotencyStore } from '../idem.ts';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';
import type { Role } from '@twinmos/shared';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';
/** Idempotency store for RMA transitions (TTL + bounded; Redis in prod per docs/02). */
const RMA_IDEM = new IdempotencyStore();

const submissionStatusQ = z.enum(SUBMISSION_STATUS);
const rmaStatusQ = z.enum(RMA_STATUS);
const submissionPriorityQ = z.enum(SUBMISSION_PRIORITY);

/** P6: SLA state derived from dueAt — only OPEN statuses carry an SLA clock. */
const OPEN_LEAD_STATES = ['new', 'assigned', 'in_progress'] as const;
function slaState(row: { status: string; dueAt: Date | null }, now = Date.now()): 'overdue' | 'due_soon' | 'on_track' | null {
  if (!row.dueAt || !(OPEN_LEAD_STATES as readonly string[]).includes(row.status)) return null;
  const due = new Date(row.dueAt).getTime();
  if (due < now) return 'overdue';
  if (due < now + 4 * 3600_000) return 'due_soon';
  return 'on_track';
}

export function adminRoute(db: DB, deps: { requireRole: (r: Role) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  /** Session or a ready 401 Response (AuthSession is null-able; we narrow here). */
  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  /** Editor+ write guard: session + RBAC, or a ready 401/403 Response. */
  async function editorGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    const ok = await deps.requireRole('editor')(c.req.raw);
    return ok ? s : c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
  }

  async function auditRow(c: any, actorId: string | undefined, action: string, entity: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity, entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  r.use('*', async (c, next) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    await next();
  });

  // ==================== products (P0 reference module) ====================
  r.get('/products', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    // P8: console filters — q matches name or SKU (parameter-bound ilike);
    // category (§6.5 three-level nav) filters by taxonomy id
    const q = (c.req.query('q') ?? '').trim();
    const status = c.req.query('status');
    const category = c.req.query('category');
    const filters = [isNull(product.deletedAt)];
    if (q) filters.push(or(ilike(product.name, `%${q}%`), ilike(product.sku, `%${q}%`))!);
    if (status && ['draft', 'in_review', 'scheduled', 'published', 'archived'].includes(status)) {
      filters.push(eq(product.status, status as 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived'));
    }
    if (category && Number.isInteger(Number(category)) && Number(category) > 0) {
      filters.push(eq(product.categoryId, Number(category)));
    }
    const rows = await db.select().from(product).where(and(...filters)).orderBy(desc(product.id)).limit(100);
    return c.json({ items: rows, cursor: null });
  });

  r.get('/taxonomy', async (c) => {
    // brand/category options for the product editor (read, any authenticated role)
    const a = await authed(c);
    if (a instanceof Response) return a;
    const [brands, categories] = await Promise.all([
      db.select().from(brand).orderBy(asc(brand.name)),
      db.select().from(category).orderBy(asc(category.sort), asc(category.name)),
    ]);
    return c.json({ brands, categories });
  });

  // Phase 3.3 CSV endpoints MUST be registered before /products/:id —
  // otherwise "export.csv" matches the :id param and Number() yields NaN.
  /** CSV-cell hardening (same policy as audit.csv): quote-escape and neutralise
   *  spreadsheet formula injection even behind leading whitespace. */
  const csvCell = (v: unknown) => {
    let s = (typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '')).replace(/"/g, '""').slice(0, 1000);
    const trimmed = s.trimStart();
    if (/^[=+\-@\t\r|%']/.test(trimmed)) s = "'" + s;
    return '"' + s + '"';
  };

  r.get('/products/export.csv', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const rows = await db.select({
      sku: product.sku, slug: product.slug, name: product.name,
      brand: brand.slug, category: category.slug, status: product.status,
      currency: product.currency, priceUsd: product.priceUsd, description: product.description,
    }).from(product)
      .innerJoin(brand, eq(product.brandId, brand.id))
      .innerJoin(category, eq(product.categoryId, category.id))
      .where(isNull(product.deletedAt)).orderBy(asc(product.sku)).limit(5000);
    const lines = [PRODUCT_IMPORT_COLUMNS.join(',')];
    for (const row of rows) lines.push([row.sku, row.slug, row.name, row.brand, row.category, row.status, row.currency, row.priceUsd ?? '', row.description].map(csvCell).join(','));
    return c.body(lines.join('\r\n') + '\r\n', 200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="twinmos-products.csv"' });
  });

  r.get('/products/import-template.csv', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const lines = [
      PRODUCT_IMPORT_COLUMNS.join(','),
      'VLT-DDR5-6000-16G,voltx-ddr5-6000-16g,VOLTX DDR5 6000MT/s 16GB,voltx,gaming-dram,draft,USD,59.9,Example DDR5 module',
      'VLT-SSD-1TB,voltx-ssd-1tb,VOLTX NVMe SSD 1TB,voltx,solid-state-drives,draft,USD,79.0,Example NVMe drive',
    ];
    return c.body(lines.join('\r\n') + '\r\n', 200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="twinmos-products-template.csv"' });
  });

  r.get('/products/:id', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(product).where(eq(product.id, id)).limit(1);
    if (!rows[0]) return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': P });
    return c.json(rows[0]);
  });

  /** 0007: numeric(10,2) columns are string-typed in Drizzle — map the Zod number. */
  const productValues = <T extends { priceUsd?: number | null }>(d: T): Omit<T, 'priceUsd'> & { priceUsd?: string | null } => {
    if (d.priceUsd === undefined) {
      const { priceUsd, ...rest } = d;
      return rest as any;
    }
    return { ...d, priceUsd: d.priceUsd === null ? null : String(d.priceUsd) };
  };

  r.post('/products', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = productCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.insert(product).values(productValues(parsed.data)).returning();
    await auditRow(c, guard.user.id, 'product.create', 'product', String(rows[0].id), parsed.data);
    return c.json(rows[0], 201);
  });

  r.patch('/products/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = productUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    // Phase 3.4: optimistic locking — a stale If-Match (the updatedAt the
    // editor loaded) means someone else saved first; refuse with 409 instead
    // of silently overwriting their work.
    const ifMatch = c.req.header('if-match');
    const current = (await db.select({ updatedAt: product.updatedAt }).from(product).where(eq(product.id, id)).limit(1))[0];
    if (!current) return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': P });
    if (ifMatch && !sameInstant(ifMatch, current.updatedAt)) {
      return c.json(problem(409, 'Conflict', 'This product was modified by someone else after you loaded it. Reload the latest version and re-apply your changes.'), 409, { 'Content-Type': P });
    }
    const rows = await db.update(product).set({ ...productValues(parsed.data), updatedAt: new Date() })
      .where(eq(product.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'product.update', 'product', String(id), parsed.data);
    return c.json(rows[0]);
  });

  // ==================== Phase 3.1: product variants ====================
  // Variants carry hardware attributes (capacity/speed/finish/lighting) plus
  // per-variant price, stock and lifecycle status inside the jsonb attrs —
  // the table's designed extension point, so no migration was needed.

  r.get('/products/:id/variants', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(productVariant).where(eq(productVariant.productId, id)).orderBy(asc(productVariant.id));
    return c.json({ items: rows });
  });

  const variantAttrs = (d: { attrs: Record<string, unknown>; priceUsd: number | null; status: string; stock: number }) =>
    ({ ...d.attrs, priceUsd: d.priceUsd, status: d.status, stock: d.stock });

  /** PGlite surfaces unique violations with varying shapes — match message,
   *  cause chain and SQLSTATE 23505 so callers always see a clean 409. */
  const isUniqueViolation = (e: unknown): boolean => {
    const parts = [
      String((e as Error)?.message ?? ''),
      String((e as { cause?: { message?: string } })?.cause?.message ?? ''),
      String((e as { code?: string })?.code ?? ''),
    ];
    return parts.some((s) => /unique|duplicate|23505/i.test(s));
  };

  r.post('/products/:id/variants', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const exists = (await db.select({ id: product.id }).from(product).where(eq(product.id, id)).limit(1))[0];
    if (!exists) return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': P });
    const parsed = variantCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    try {
      const rows = await db.insert(productVariant).values({ productId: id, sku: parsed.data.sku, attrs: variantAttrs(parsed.data) }).returning();
      await auditRow(c, guard.user.id, 'product.variant.create', 'product_variant', String(rows[0].id), parsed.data);
      return c.json(rows[0], 201);
    } catch (e) {
      if (isUniqueViolation(e)) {
        return c.json(problem(409, 'Conflict', `Variant SKU ${parsed.data.sku} already exists.`), 409, { 'Content-Type': P });
      }
      throw e;
    }
  });

  r.patch('/products/:id/variants/:varId', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const varId = Number(c.req.param('varId'));
    const parsed = variantUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    // narrow the partial() inference to an explicit shape (nested attrs makes
    // the inferred union awkward to index)
    const data = parsed.data as Partial<{ attrs: Partial<Record<'capacity' | 'speed' | 'finish' | 'lighting', string>>; sku: string; priceUsd: number | null; status: 'active' | 'discontinued'; stock: number }>;
    const existing = (await db.select().from(productVariant).where(and(eq(productVariant.id, varId), eq(productVariant.productId, id))).limit(1))[0];
    if (!existing) return c.json(problem(404, 'Variant not found'), 404, { 'Content-Type': P });
    const merged: Record<string, unknown> = { ...(existing.attrs as Record<string, unknown>) };
    if (data.attrs) Object.assign(merged, data.attrs);
    if (data.priceUsd !== undefined) merged.priceUsd = data.priceUsd;
    if (data.status !== undefined) merged.status = data.status;
    if (data.stock !== undefined) merged.stock = data.stock;
    try {
      const rows = await db.update(productVariant)
        .set({ ...(data.sku !== undefined ? { sku: data.sku } : {}), attrs: merged })
        .where(and(eq(productVariant.id, varId), eq(productVariant.productId, id))).returning();
      await auditRow(c, guard.user.id, 'product.variant.update', 'product_variant', String(varId), data);
      return c.json(rows[0]);
    } catch (e) {
      if (isUniqueViolation(e)) {
        return c.json(problem(409, 'Conflict', `Variant SKU ${data.sku} already exists.`), 409, { 'Content-Type': P });
      }
      throw e;
    }
  });

  r.delete('/products/:id/variants/:varId', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const varId = Number(c.req.param('varId'));
    const rows = await db.delete(productVariant).where(and(eq(productVariant.id, varId), eq(productVariant.productId, id))).returning();
    if (!rows[0]) return c.json(problem(404, 'Variant not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'product.variant.delete', 'product_variant', String(varId), rows[0].sku);
    return c.json({ ok: true });
  });

  // ==================== Phase 3.2: QVL compatibility matrix ====================
  r.get('/compatibility', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const q = (c.req.query('q') ?? '').trim();
    const gen = c.req.query('memoryGen');
    const type = c.req.query('deviceType');
    const filters = [];
    if (q) filters.push(or(ilike(compatibilityRule.deviceBrand, `%${q}%`), ilike(compatibilityRule.deviceModel, `%${q}%`))!);
    if (gen === 'DDR4' || gen === 'DDR5') filters.push(eq(compatibilityRule.memoryGen, gen));
    if ((COMPAT_DEVICE_TYPES as readonly string[]).includes(type ?? '')) {
      filters.push(eq(compatibilityRule.deviceType, type as (typeof COMPAT_DEVICE_TYPES)[number]));
    }
    const rows = await db.select().from(compatibilityRule)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(asc(compatibilityRule.deviceType), asc(compatibilityRule.deviceBrand), asc(compatibilityRule.deviceModel)).limit(500);
    return c.json({ items: rows });
  });

  r.post('/compatibility', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = compatibilityCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.insert(compatibilityRule).values(parsed.data).returning();
    await auditRow(c, guard.user.id, 'compatibility.create', 'compatibility_rule', String(rows[0].id), parsed.data);
    return c.json(rows[0], 201);
  });

  r.patch('/compatibility/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = compatibilityUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(compatibilityRule).set(parsed.data).where(eq(compatibilityRule.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Compatibility rule not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'compatibility.update', 'compatibility_rule', String(id), parsed.data);
    return c.json(rows[0]);
  });

  r.delete('/compatibility/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.delete(compatibilityRule).where(eq(compatibilityRule.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Compatibility rule not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'compatibility.delete', 'compatibility_rule', String(id), rows[0].deviceBrand + ' ' + rows[0].deviceModel);
    return c.json({ ok: true });
  });

  // ---- 0017: QVL batch CSV import (dry-run first, upsert by natural key) ----
  // Columns: deviceType,deviceBrand,deviceModel,memoryGen,formFactor,maxGb,slots,speed,cats,ssdNote,ssdCats,notes
  // cats / ssdCats are ';'-separated inside the cell (CSV commas are delimiters).
  const COMPAT_IMPORT_COLUMNS = ['devicetype', 'devicebrand', 'devicemodel', 'memorygen', 'formfactor', 'maxgb', 'slots', 'speed', 'cats', 'ssdnote', 'ssdcats', 'notes'] as const;

  r.post('/compatibility/import', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const body = await c.req.json().catch(() => ({}));
    const csv = String((body as any).csv ?? '');
    const dryRun = (body as any).dryRun !== false;
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return c.json(problem(422, 'Validation Failed', 'CSV needs a header and at least one row.'), 422, { 'Content-Type': P });
    const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    if (header.join(',') !== COMPAT_IMPORT_COLUMNS.join(',')) {
      return c.json(problem(422, 'Validation Failed', 'Header must be exactly: ' + COMPAT_IMPORT_COLUMNS.join(',')), 422, { 'Content-Type': P });
    }

    const existing = await db.select().from(compatibilityRule);
    const keyOf = (r: { deviceType: string; deviceBrand: string; deviceModel: string; memoryGen: string | null; formFactor: string | null }) =>
      `${r.deviceType}|${r.deviceBrand.toLowerCase()}|${r.deviceModel.toLowerCase()}|${r.memoryGen ?? ''}|${r.formFactor ?? ''}`;
    const existingByKey = new Map(existing.map((r) => [keyOf(r), r]));
    const seen = new Set<string>();

    type Parsed = {
      key: string; action: 'create' | 'update'; id?: number;
      values: Record<string, unknown>;
    };
    const valid: Parsed[] = [];
    const errors: Array<{ line: number; message: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const lineNo = i + 1;
      const cols = parseCsvLine(lines[i]);
      const [deviceType, deviceBrand, deviceModel, memoryGen, formFactor, maxGb, slots, speed, cats, ssdNote, ssdCats, notes] = cols;
      const fail = (message: string) => errors.push({ line: lineNo, message });
      if (!(COMPAT_DEVICE_TYPES as readonly string[]).includes(deviceType)) { fail(`deviceType must be one of ${COMPAT_DEVICE_TYPES.join(', ')}.`); continue; }
      if (!deviceBrand || deviceBrand.length > 40) { fail('deviceBrand is required (max 40 chars).'); continue; }
      if (!deviceModel || deviceModel.length > 80) { fail('deviceModel is required (max 80 chars).'); continue; }
      if (memoryGen && !(COMPAT_MEMORY_GENS as readonly string[]).includes(memoryGen)) { fail(`memoryGen must be ${COMPAT_MEMORY_GENS.join(' or ')} (or empty).`); continue; }
      if (formFactor && !(COMPAT_FORM_FACTORS as readonly string[]).includes(formFactor)) { fail(`formFactor must be one of ${COMPAT_FORM_FACTORS.join(', ')} (or empty).`); continue; }
      const gb = maxGb ? Number(maxGb) : null;
      if (gb != null && (!Number.isInteger(gb) || gb < 1 || gb > 1024)) { fail('maxGb must be a whole number 1-1024 (or empty).'); continue; }
      const slotCount = slots ? Number(slots) : null;
      if (slotCount != null && (!Number.isInteger(slotCount) || slotCount < 1 || slotCount > 16)) { fail('slots must be a whole number 1-16 (or empty).'); continue; }
      const splitCats = (s: string) => s ? s.split(';').map((x) => x.trim()).filter(Boolean).slice(0, 8) : [];

      const values = {
        deviceType, deviceBrand, deviceModel,
        memoryGen: memoryGen || null, formFactor: formFactor || null,
        maxGb: gb, slots: slotCount,
        speed: speed || null,
        cats: splitCats(cats),
        ssdNote: ssdNote || null,
        ssdCats: splitCats(ssdCats),
        notes: notes || null,
      };
      const key = keyOf(values as any);
      if (seen.has(key)) { fail('Duplicate row (same type/brand/model/gen/form) earlier in this file.'); continue; }
      seen.add(key);
      const match = existingByKey.get(key);
      valid.push({ key, action: match ? 'update' : 'create', id: match?.id, values });
    }

    if (dryRun) {
      return c.json({
        dryRun: true,
        wouldCreate: valid.filter((v) => v.action === 'create').length,
        wouldUpdate: valid.filter((v) => v.action === 'update').length,
        errors,
      });
    }
    if (errors.length) return c.json(problem(422, 'Validation Failed', errors.length + ' row(s) failed — fix and re-run.', errors), 422, { 'Content-Type': P });
    for (const v of valid) {
      if (v.id != null) await db.update(compatibilityRule).set(v.values).where(eq(compatibilityRule.id, v.id));
      else await db.insert(compatibilityRule).values(v.values as any);
    }
    await auditRow(c, guard.user.id, 'compatibility.import', 'compatibility_rule', 'batch', {
      created: valid.filter((v) => v.action === 'create').length,
      updated: valid.filter((v) => v.action === 'update').length,
    });
    return c.json({
      dryRun: false,
      imported: valid.filter((v) => v.action === 'create').length,
      updated: valid.filter((v) => v.action === 'update').length,
    });
  });

  // ==================== Phase 3.3: bulk CSV import (export/template live above
  // the /products/:id route — see the ordering note there) ====================

  /** Minimal quoted-field-aware single-line CSV parser (RFC 4180 subset). */
  function parseCsvLine(line: string): string[] {
    const out: string[] = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  }

  r.post('/products/import', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = productImportSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const rawLines = parsed.data.csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (rawLines.length < 2) return c.json(problem(422, 'Validation Failed', 'CSV needs a header row and at least one data row.'), 422, { 'Content-Type': P });
    // case-insensitive on both sides — toLowerCase() would mangle priceUsd
    const header = parseCsvLine(rawLines[0]).map((h) => h.trim().toLowerCase());
    if (header.join(',') !== PRODUCT_IMPORT_COLUMNS.map((h) => h.toLowerCase()).join(',')) {
      return c.json(problem(422, 'Validation Failed', `Header must be exactly: ${PRODUCT_IMPORT_COLUMNS.join(',')}. Use the downloadable template.`), 422, { 'Content-Type': P });
    }

    // Reference data for by-slug validation (small tables, loaded once)
    const [brands, cats, existing] = await Promise.all([
      db.select({ id: brand.id, slug: brand.slug }).from(brand),
      db.select({ id: category.id, slug: category.slug }).from(category),
      db.select({ id: product.id, sku: product.sku }).from(product).where(isNull(product.deletedAt)),
    ]);
    const brandBySlug = new Map(brands.map((b) => [b.slug, b.id]));
    const catBySlug = new Map(cats.map((x) => [x.slug, x.id]));
    const existingBySku = new Map(existing.map((x) => [x.sku, x.id]));
    const seenSkus = new Set<string>();

    type ValidRow = { line: number; action: 'create' | 'update'; sku: string; name: string; brandId: number; categoryId: number; values: Record<string, unknown> };
    const valid: ValidRow[] = [];
    const errors: Array<{ line: number; sku?: string; message: string }> = [];

    for (let i = 1; i < rawLines.length; i++) {
      const lineNo = i + 1;
      const cols = parseCsvLine(rawLines[i]);
      const [sku, slug, name, brandSlug, catSlug, status, currency, priceUsd, description] = cols;
      const fail = (message: string) => errors.push({ line: lineNo, sku: sku || undefined, message });
      if (!/^[A-Z0-9-]{3,40}$/.test(sku)) { fail('SKU must be 3-40 chars of A-Z, 0-9 and dashes.'); continue; }
      if (seenSkus.has(sku)) { fail(`Duplicate SKU ${sku} within this file.`); continue; }
      seenSkus.add(sku);
      if (!/^[a-z0-9-]{3,80}$/.test(slug)) { fail('Slug must be 3-80 chars of a-z, 0-9 and dashes.'); continue; }
      if (!name || name.length < 2 || name.length > 160) { fail('Name must be 2-160 characters.'); continue; }
      const brandId = brandBySlug.get(brandSlug);
      if (!brandId) { fail(`Unknown brand slug "${brandSlug}".`); continue; }
      const categoryId = catBySlug.get(catSlug);
      if (!categoryId) { fail(`Unknown category slug "${catSlug}".`); continue; }
      if (!(CONTENT_STATUS as readonly string[]).includes(status)) { fail(`Status must be one of ${CONTENT_STATUS.join(', ')}.`); continue; }
      const cur = currency || 'USD';
      if (!(AUTHORIZED_CURRENCIES as readonly string[]).includes(cur)) { fail(`Currency must be one of ${AUTHORIZED_CURRENCIES.join(', ')} (forensic audit compliance — no BDT).`); continue; }
      let price: number | null = null;
      if (priceUsd !== '') {
        price = Number(priceUsd);
        if (!Number.isFinite(price) || price < 0 || price > 9_999_999) { fail('priceUsd must be empty or a number between 0 and 9,999,999.'); continue; }
      }
      if (description && description.length > 8000) { fail('Description exceeds 8000 characters.'); continue; }

      const prev = existingBySku.get(sku);
      valid.push({
        line: lineNo, action: prev ? 'update' : 'create', sku, name, brandId, categoryId,
        values: {
          sku, slug, name, brandId, categoryId,
          status: status as (typeof CONTENT_STATUS)[number],
          specs: {}, description: description ?? '', priceUsd: price, currency: cur,
          heroMediaId: null, gallery: [], datasheets: [], badges: [],
        },
      });
    }

    if (parsed.data.dryRun) {
      return c.json({
        dryRun: true, committed: false, total: rawLines.length - 1,
        validCount: valid.length, updateCount: valid.filter((v) => v.action === 'update').length,
        createCount: valid.filter((v) => v.action === 'create').length,
        rows: valid.map(({ line, action, sku, name }) => ({ line, action, sku, name })),
        errors,
      });
    }
    if (errors.length) {
      return c.json(problem(422, 'Validation Failed', `${errors.length} row(s) failed validation — fix them and re-run (dry-run first is recommended).`, errors), 422, { 'Content-Type': P });
    }

    let created = 0; let updated = 0;
    await db.transaction(async (tx) => {
      for (const v of valid) {
        if (v.action === 'update') {
          const id = existingBySku.get(v.sku)!;
          // CSV-representable fields ONLY — the import must never clobber
          // rich fields it cannot express (specs, hero, gallery, datasheets,
          // badges); those survive re-imports untouched.
          const { specs, heroMediaId, gallery, datasheets, badges, ...csvFields } = v.values as Record<string, unknown>;
          void specs; void heroMediaId; void gallery; void datasheets; void badges;
          await tx.update(product).set({ ...productValues(csvFields as { priceUsd?: number | null }), updatedAt: new Date() }).where(eq(product.id, id));
          updated++;
        } else {
          // the full row shape is validated above; the numeric priceUsd mapper's
          // generic return defeats the insert overload, so hand it the concrete row
          await tx.insert(product).values(productValues(v.values as { priceUsd?: number | null }) as typeof product.$inferInsert);
          created++;
        }
      }
    });
    await auditRow(c, guard.user.id, 'product.import', 'product', 'bulk', { total: valid.length, created, updated });
    return c.json({
      dryRun: false, committed: true, total: valid.length, validCount: valid.length,
      updateCount: updated, createCount: created,
      rows: valid.map(({ line, action, sku, name }) => ({ line, action, sku, name })),
      errors: [],
    });
  });


  /** Distinct actors who have audited events, joined with user for name/email (editor+). */
  r.get('/audit/actors', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const ok = await deps.requireRole('editor')(c.req.raw);
    if (!ok) return c.json(problem(403, 'Requires editor role or above (read)'), 403, { 'Content-Type': P });

    const rows = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
    }).from(user)
      .innerJoin(auditLog, eq(user.id, auditLog.actorId))
      .groupBy(user.id, user.name, user.email)
      .orderBy(asc(user.name));

    return c.json({ items: rows });
  });

  r.get('/audit', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    // docs/04 RBAC: audit log — admin full, editor read
    const ok = await deps.requireRole('editor')(c.req.raw);
    if (!ok) return c.json(problem(403, 'Requires editor role or above (read)'), 403, { 'Content-Type': P });

    const actorId = c.req.query('actorId');
    const entity = c.req.query('entity');
    const action = c.req.query('action');
    const from = c.req.query('from');
    const to = c.req.query('to');
    const cursor = c.req.query('cursor');
    const limit = Math.min(Number(c.req.query('limit') ?? 100) || 100, 200);

    const filters = [];
    if (actorId) filters.push(eq(auditLog.actorId, actorId));
    if (entity && entity !== 'all') filters.push(eq(auditLog.entity, entity));
    if (action && action !== 'all') {
      filters.push(ilike(auditLog.action, `%${action.replace(/[%_]/g, '')}%`));
    }
    if (from) {
      const fromDate = new Date(from.length === 10 ? from + 'T00:00:00.000Z' : from);
      if (!isNaN(fromDate.getTime())) filters.push(gte(auditLog.at, fromDate));
    }
    if (to) {
      const toDate = new Date(to.length === 10 ? to + 'T23:59:59.999Z' : to);
      if (!isNaN(toDate.getTime())) filters.push(lte(auditLog.at, toDate));
    }
    if (cursor) {
      const cursorId = Number(cursor);
      if (!isNaN(cursorId) && cursorId > 0) filters.push(lt(auditLog.id, cursorId));
    }

    const rows = await db.select({
      id: auditLog.id,
      actorId: auditLog.actorId,
      actorEmail: user.email,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      diff: auditLog.diff,
      requestId: auditLog.requestId,
      ip: auditLog.ip,
      at: auditLog.at,
    }).from(auditLog)
      .leftJoin(user, eq(auditLog.actorId, user.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(auditLog.id))
      .limit(limit);

    return c.json({ items: rows, cursor: rows.length === limit ? rows[rows.length - 1].id : null });
  });

  /** Audit log CSV export with formula-injection prevention (editor+; compliance/archiving). */
  r.get('/audit.csv', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const ok = await deps.requireRole('editor')(c.req.raw);
    if (!ok) return c.json(problem(403, 'Requires editor role or above (read)'), 403, { 'Content-Type': P });

    const actorId = c.req.query('actorId');
    const entity = c.req.query('entity');
    const action = c.req.query('action');
    const from = c.req.query('from');
    const to = c.req.query('to');

    const filters = [];
    if (actorId) filters.push(eq(auditLog.actorId, actorId));
    if (entity && entity !== 'all') filters.push(eq(auditLog.entity, entity));
    if (action && action !== 'all') {
      filters.push(ilike(auditLog.action, `%${action.replace(/[%_]/g, '')}%`));
    }
    if (from) {
      const fromDate = new Date(from.length === 10 ? from + 'T00:00:00.000Z' : from);
      if (!isNaN(fromDate.getTime())) filters.push(gte(auditLog.at, fromDate));
    }
    if (to) {
      const toDate = new Date(to.length === 10 ? to + 'T23:59:59.999Z' : to);
      if (!isNaN(toDate.getTime())) filters.push(lte(auditLog.at, toDate));
    }

    const rows = await db.select({
      id: auditLog.id,
      actorId: auditLog.actorId,
      actorEmail: user.email,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      diff: auditLog.diff,
      requestId: auditLog.requestId,
      ip: auditLog.ip,
      at: auditLog.at,
    }).from(auditLog)
      .leftJoin(user, eq(auditLog.actorId, user.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(auditLog.id))
      .limit(5000);

    // CSV-cell hardening: formula injection prevention:
    // neutralise spreadsheet formula injection (=, +, -, @, ', |, %, TAB, CR leading chars)
    // even when prefixed by whitespace, by prefixing an apostrophe.
    const cell = (v: unknown) => {
      let s = (typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '')).replace(/"/g, '""').slice(0, 1000);
      const trimmed = s.trimStart();
      if (/^[=+\-@\t\r|%']/.test(trimmed)) s = "'" + s;
      return '"' + s + '"';
    };

    const lines = ['id,at,actor_id,actor_email,action,entity,entity_id,ip,request_id,diff'];
    for (const row of rows) {
      lines.push([
        row.id,
        row.at ? new Date(row.at).toISOString() : '',
        row.actorId ?? '',
        row.actorEmail ?? '',
        row.action,
        row.entity,
        row.entityId ?? '',
        row.ip ?? '',
        row.requestId ?? '',
        row.diff ? JSON.stringify(row.diff) : '',
      ].map(cell).join(','));
    }

    await auditRow(c, a.user.id, 'audit.export', 'audit_log', 'csv', { rows: rows.length });
    return c.body(lines.join('\r\n') + '\r\n', 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="twinmos-audit-log.csv"',
      'Cache-Control': 'no-store',
    });
  });

  // ==================== P2: dashboard KPIs ====================
  r.get('/stats', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const [subsByStatus, subsByType, rmaByStatus, jobs, products, variants] = await Promise.all([
      db.select({ status: formSubmission.status, n: count() }).from(formSubmission).groupBy(formSubmission.status),
      db.select({ type: formSubmission.type, n: count() }).from(formSubmission).groupBy(formSubmission.type),
      db.select({ status: rmaRequest.status, n: count() }).from(rmaRequest).groupBy(rmaRequest.status),
      db.select({ n: count() }).from(jobApplication),
      db.select({ n: count() }).from(product),
      db.select({ n: count() }).from(productVariant),
    ]);
    const total = (rows: { n: number }[]) => rows.reduce((s, x) => s + Number(x.n), 0);
    const byKey = (rows: Array<{ n: number; [k: string]: unknown }>, key: string) =>
      Object.fromEntries(rows.map((x) => [String(x[key]), Number(x.n)]));
    // P6: open-lead SLA health (overdue = past dueAt while still open)
    const [overdue] = await db.select({ n: count() }).from(formSubmission)
      .where(and(
        isNotNull(formSubmission.dueAt),
        inArray(formSubmission.status, [...OPEN_LEAD_STATES]),
        lte(formSubmission.dueAt, new Date()),
      ));
    // P8 console: trend series, SLA risk queue, content/media health and activity tail
    const since = new Date(Date.now() - 13 * 86400_000); since.setUTCHours(0, 0, 0, 0);
    const day = sql<string>`to_char(${formSubmission.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
    const rmaDay = sql<string>`to_char(${rmaRequest.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
    const [subsDaily, rmaDaily, slaRisk, contentCounts, mediaCounts, jobsNew, activity] = await Promise.all([
      db.select({ d: day, n: count() }).from(formSubmission)
        .where(and(sql`${formSubmission.createdAt} >= ${since}`, lt(sql`${formSubmission.createdAt}`, new Date(Date.now() + 86400_000))))
        .groupBy(day),
      db.select({ d: rmaDay, n: count() }).from(rmaRequest)
        .where(and(sql`${rmaRequest.createdAt} >= ${since}`, lt(sql`${rmaRequest.createdAt}`, new Date(Date.now() + 86400_000))))
        .groupBy(rmaDay),
      db.select({ id: formSubmission.id, refCode: formSubmission.refCode, type: formSubmission.type, status: formSubmission.status, dueAt: formSubmission.dueAt, email: formSubmission.email })
        .from(formSubmission)
        .where(and(inArray(formSubmission.status, [...OPEN_LEAD_STATES]), isNotNull(formSubmission.dueAt)))
        .orderBy(asc(formSubmission.dueAt)).limit(6),
      Promise.all([
        db.select({ n: count() }).from(article).where(and(eq(article.status, 'published'), sql`${article.deletedAt} is null`)),
        db.select({ n: count() }).from(newsPost).where(and(eq(newsPost.status, 'published'), sql`${newsPost.deletedAt} is null`)),
        db.select({ n: count() }).from(page).where(and(eq(page.status, 'published'), sql`${page.deletedAt} is null`)),
        db.select({ n: count() }).from(faq).where(eq(faq.status, 'published')),
      ]),
      Promise.all([
        db.select({ n: count() }).from(mediaAsset),
        db.select({ n: count() }).from(mediaAsset).where(sql`${mediaAsset.alt} is null or ${mediaAsset.alt} = ''`),
      ]),
      db.select({ n: count() }).from(jobApplication).where(eq(jobApplication.status, 'new')),
      db.select({ id: auditLog.id, action: auditLog.action, entity: auditLog.entity, entityId: auditLog.entityId, at: auditLog.at, actor: user.email })
        .from(auditLog).leftJoin(user, eq(auditLog.actorId, user.id))
        .orderBy(desc(auditLog.id)).limit(8),
    ]);
    const series: Array<{ d: string; subs: number; rmas: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      series.push({ d, subs: Number(subsDaily.find((x) => x.d === d)?.n ?? 0), rmas: Number(rmaDaily.find((x) => x.d === d)?.n ?? 0) });
    }
    const now = Date.now();
    return c.json({
      submissions: {
        total: total(subsByStatus), byStatus: byKey(subsByStatus, 'status'), byType: byKey(subsByType, 'type'),
        open: subsByStatus.filter((x) => (OPEN_LEAD_STATES as readonly string[]).includes(x.status)).reduce((s, x) => s + Number(x.n), 0),
        overdue: Number(overdue?.n ?? 0),
      },
      rma: {
        total: total(rmaByStatus),
        open: rmaByStatus.filter((x) => x.status !== 'closed' && x.status !== 'delivered').reduce((s, x) => s + Number(x.n), 0),
        byStatus: byKey(rmaByStatus, 'status'),
      },
      jobApplications: total(jobs),
      jobsNew: Number(jobsNew[0]?.n ?? 0),
      products: total(products),
      variants: total(variants),
      series,
      slaRisk: slaRisk.map((s) => ({ ...s, slaState: slaState({ status: s.status, dueAt: s.dueAt }, now) })),
      content: {
        articles: Number(contentCounts[0][0]?.n ?? 0), news: Number(contentCounts[1][0]?.n ?? 0),
        pages: Number(contentCounts[2][0]?.n ?? 0), faqs: Number(contentCounts[3][0]?.n ?? 0),
      },
      media: { total: Number(mediaCounts[0][0]?.n ?? 0), missingAlt: Number(mediaCounts[1][0]?.n ?? 0) },
      activity,
    });
  });

  // ==================== P8 console: unified global search (⌘K palette) ====================
  // Grouped ilike search across every manageable entity; reads are parameter-bound
  // and capped (≤5/group) so the palette can never dump a whole table.
  r.get('/search', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const q = (c.req.query('q') ?? '').trim();
    if (q.length < 2) return c.json(problem(400, 'Search query must be at least 2 characters.'), 400, { 'Content-Type': P });
    const like = `%${q}%`;
    const CAP = 5;
    const live = sql`is null`; // soft-delete guard fragment
    const [articles, pages, news, faqs, products, subs, rmas, apps, postings, assets, compat, serials] = await Promise.all([
      db.select({ id: article.id, title: article.title, status: article.status, locale: article.locale })
        .from(article).where(and(ilike(article.title, like), sql`${article.deletedAt} ${live}`))
        .orderBy(desc(article.updatedAt)).limit(CAP),
      db.select({ id: page.id, title: page.title, status: page.status, locale: page.locale })
        .from(page).where(and(ilike(page.title, like), sql`${page.deletedAt} ${live}`))
        .orderBy(desc(page.updatedAt)).limit(CAP),
      db.select({ id: newsPost.id, title: newsPost.title, status: newsPost.status, locale: newsPost.locale })
        .from(newsPost).where(and(ilike(newsPost.title, like), sql`${newsPost.deletedAt} ${live}`))
        .orderBy(desc(newsPost.createdAt)).limit(CAP),
      db.select({ id: faq.id, title: faq.question, status: faq.status, locale: faq.locale })
        .from(faq).where(ilike(faq.question, like)).limit(CAP),
      db.select({ id: product.id, title: product.name, status: product.status, sku: product.sku })
        .from(product).where(and(or(ilike(product.name, like), ilike(product.sku, like)), sql`${product.deletedAt} ${live}`))
        .limit(CAP),
      db.select({ id: formSubmission.id, title: formSubmission.refCode, status: formSubmission.status, email: formSubmission.email, type: formSubmission.type })
        .from(formSubmission).where(or(ilike(formSubmission.refCode, like), ilike(formSubmission.email, like)))
        .orderBy(desc(formSubmission.id)).limit(CAP),
      db.select({ id: rmaRequest.id, title: rmaRequest.number, status: rmaRequest.status, sku: rmaRequest.productSku })
        .from(rmaRequest).where(or(ilike(rmaRequest.number, like), ilike(rmaRequest.productSku, like)))
        .orderBy(desc(rmaRequest.id)).limit(CAP),
      db.select({ id: jobApplication.id, title: jobApplication.refCode, status: jobApplication.status, email: jobApplication.email })
        .from(jobApplication).where(or(ilike(jobApplication.refCode, like), ilike(jobApplication.email, like)))
        .orderBy(desc(jobApplication.id)).limit(CAP),
      db.select({ id: jobPosting.id, title: jobPosting.title, status: jobPosting.status })
        .from(jobPosting).where(ilike(jobPosting.title, like)).limit(CAP),
      db.select({ id: mediaAsset.id, title: mediaAsset.key, alt: mediaAsset.alt })
        .from(mediaAsset).where(or(ilike(mediaAsset.key, like), ilike(mediaAsset.alt, like)))
        .orderBy(desc(mediaAsset.id)).limit(CAP),
      db.select({ id: compatibilityRule.id, brand: compatibilityRule.deviceBrand, model: compatibilityRule.deviceModel, gen: compatibilityRule.memoryGen, ff: compatibilityRule.formFactor })
        .from(compatibilityRule).where(or(ilike(compatibilityRule.deviceBrand, like), ilike(compatibilityRule.deviceModel, like)))
        .orderBy(asc(compatibilityRule.deviceBrand)).limit(CAP),
      db.select({ serial: serialRegistry.serial, sku: serialRegistry.sku })
        .from(serialRegistry).where(or(ilike(serialRegistry.serial, like), ilike(serialRegistry.sku, like)))
        .orderBy(desc(serialRegistry.serial)).limit(CAP),
    ]);
    type Hit = { id: number; title: string; sub?: string; module: string; kind: string };
    const groups: Array<{ type: string; items: Hit[] }> = [];
    const push = (type: string, items: Hit[]) => { if (items.length) groups.push({ type, items }); };
    // the four content entities share ONE "Content" group (duplicate group labels
    // would render duplicate filter chips and break type filtering client-side)
    const contentHits: Hit[] = [
      ...articles.map((x) => ({ id: x.id, title: x.title, sub: `article · ${x.status}${x.locale ? ' · ' + x.locale : ''}`, module: 'content', kind: 'article' })),
      ...pages.map((x) => ({ id: x.id, title: x.title, sub: `page · ${x.status}${x.locale ? ' · ' + x.locale : ''}`, module: 'content', kind: 'page' })),
      ...news.map((x) => ({ id: x.id, title: x.title, sub: `news · ${x.status}`, module: 'content', kind: 'news' })),
      ...faqs.map((x) => ({ id: x.id, title: x.title, sub: `faq · ${x.status}`, module: 'content', kind: 'faq' })),
    ];
    push('Content', contentHits.slice(0, CAP));
    push('Products', products.map((x) => ({ id: x.id, title: x.title, sub: `${x.sku} · ${x.status}`, module: 'products', kind: 'product' })));
    push('Leads & quotes', subs.map((x) => ({ id: x.id, title: x.title, sub: `${x.type} · ${x.email}`, module: 'submissions', kind: 'lead' })));
    push('RMA', rmas.map((x) => ({ id: x.id, title: x.title, sub: `${x.sku ?? '—'} · ${x.status}`, module: 'rma', kind: 'rma' })));
    push('Careers', [...apps.map((x) => ({ id: x.id, title: x.title, sub: x.email, module: 'jobs', kind: 'application' })), ...postings.map((x) => ({ id: x.id, title: x.title, sub: `posting · ${x.status}`, module: 'jobs', kind: 'posting' }))].slice(0, CAP));
    push('Media', assets.map((x) => ({ id: x.id, title: x.title, sub: x.alt ?? 'no alt text', module: 'media', kind: 'media' })));
    push('Compatibility', compat.map((x) => ({ id: x.id, title: `${x.brand} ${x.model}`, sub: `QVL · ${x.gen ?? '—'} · ${x.ff ?? '—'}`, module: 'compatibility', kind: 'compat' })));
    push('Serials', serials.map((x) => ({ id: 1, title: x.serial, sub: `registry · ${x.sku ?? 'no SKU'}`, module: 'partners', kind: 'serial' })));
    return c.json({ q, groups });
  });

  // ==================== P2: submissions inbox · P6: lead board (ADR-009) ====================
  r.get('/submissions', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const limit = Math.min(Number(c.req.query('limit') ?? 25) || 25, 100);
    const cursor = Number(c.req.query('cursor') ?? 0) || 0;
    const type = c.req.query('type');
    const q = (c.req.query('q') ?? '').trim();
    const assignee = c.req.query('assignee') ?? '';
    const status = submissionStatusQ.safeParse(c.req.query('status') ?? undefined);
    const priority = submissionPriorityQ.safeParse(c.req.query('priority') ?? undefined);
    const sla = z.enum(['overdue', 'due_soon']).safeParse(c.req.query('sla') ?? undefined);
    const filters = [
      type ? eq(formSubmission.type, type) : undefined,
      status.success ? eq(formSubmission.status, status.data) : undefined,
      priority.success ? eq(formSubmission.priority, priority.data) : undefined,
      // 0018: ownership routing — "mine", the unassigned queue, or a specific owner
      assignee === 'unassigned' ? isNull(formSubmission.assigneeId) : undefined,
      assignee && assignee !== 'unassigned' ? eq(formSubmission.assigneeId, assignee) : undefined,
      // 0018: free-text search across email, refCode and the payload body
      q ? or(
        ilike(formSubmission.email, `%${q}%`),
        ilike(formSubmission.refCode, `%${q}%`),
        sql`${formSubmission.payload}::text ilike ${'%' + q + '%'}`,
      )! : undefined,
      sla.success
        ? and(
            isNotNull(formSubmission.dueAt),
            inArray(formSubmission.status, [...OPEN_LEAD_STATES]),
            sla.data === 'overdue'
              ? lte(formSubmission.dueAt, new Date())
              : lte(formSubmission.dueAt, new Date(Date.now() + 4 * 3600_000)),
          )
        : undefined,
    ].filter((f) => f !== undefined);
    const where = filters.length ? and(...filters) : undefined;
    const rows = await db.select({
      sub: formSubmission, assigneeEmail: user.email,
    }).from(formSubmission)
      .leftJoin(user, eq(formSubmission.assigneeId, user.id))
      .where(cursor ? and(...filters, lt(formSubmission.id, cursor)) : where)
      .orderBy(desc(formSubmission.id)).limit(limit + 1);
    const hasMore = rows.length > limit;
    const items = (hasMore ? rows.slice(0, limit) : rows)
      .map(({ sub, assigneeEmail }) => ({ ...sub, assigneeEmail: assigneeEmail ?? null, slaState: slaState(sub) }));
    // 0018: total for the active filter set (paging cursor excluded by construction)
    const [{ n: total }] = await db.select({ n: count() }).from(formSubmission).where(where);
    return c.json({ items, nextCursor: hasMore ? items[items.length - 1].id : null, total: Number(total) });
  });

  /** 0018: minimal staff options for the assignment dropdown — id/email/role for
   * editor-and-above roles only (the full /users directory stays super_admin). */
  r.get('/staff-options', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const rows = await db.select({ id: user.id, email: user.email, role: user.role })
      .from(user).where(inArray(user.role, ['editor', 'admin', 'super_admin']))
      .orderBy(asc(user.email)).limit(200);
    return c.json({ items: rows });
  });

  /** P6: CSV export of the filtered lead set (editor+; ops/CRM handoff). */
  r.get('/submissions.csv', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const type = c.req.query('type');
    const status = submissionStatusQ.safeParse(c.req.query('status') ?? undefined);
    const priority = submissionPriorityQ.safeParse(c.req.query('priority') ?? undefined);
    const filters = [
      type ? eq(formSubmission.type, type) : undefined,
      status.success ? eq(formSubmission.status, status.data) : undefined,
      priority.success ? eq(formSubmission.priority, priority.data) : undefined,
    ].filter((f) => f !== undefined);
    const rows = await db.select({
      sub: formSubmission, assigneeEmail: user.email,
    }).from(formSubmission)
      .leftJoin(user, eq(formSubmission.assigneeId, user.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(formSubmission.id)).limit(5000);
    // CSV-cell hardening: quote-wrap + escape embedded quotes, and neutralise
    // spreadsheet formula injection (= + - @ TAB CR leading chars) by prefixing
    // an apostrophe — user payloads are untrusted input that ops will open in Excel.
    const cell = (v: unknown) => {
      let s = String(v ?? '').replace(/"/g, '""').slice(0, 500);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '"' + s + '"';
    };
    // structured lead fields live in the jsonb payload (company/country/product/quantity)
    const p = (sub: typeof rows[number]['sub'], keys: string[]) => {
      for (const k of keys) {
        const v = (sub.payload as Record<string, unknown>)[k];
        if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
      }
      return '';
    };
    const lines = ['ref,type,status,priority,email,company,country,product,quantity,due_at,created_at,assignee'];
    for (const { sub: row, assigneeEmail } of rows) {
      lines.push([
        row.refCode, row.type, row.status, row.priority, row.email,
        p(row, ['company', 'organization']), p(row, ['country']),
        p(row, ['product', 'product_interest', 'interest']), p(row, ['quantity', 'estimated_quantity', 'volume']),
        row.dueAt ? new Date(row.dueAt).toISOString() : '', new Date(row.createdAt).toISOString(),
        assigneeEmail ?? row.assigneeId ?? '',
      ].map(cell).join(','));
    }
    await auditRow(c, guard.user.id, 'submissions.export', 'form_submission', 'csv', { rows: rows.length });
    return c.body(lines.join('\r\n') + '\r\n', 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="twinmos-leads.csv"',
      'Cache-Control': 'no-store',
    });
  });

  r.get('/submissions/:id', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select({ sub: formSubmission, assigneeEmail: user.email })
      .from(formSubmission).leftJoin(user, eq(formSubmission.assigneeId, user.id))
      .where(eq(formSubmission.id, id)).limit(1);
    if (!rows[0]) return c.json(problem(404, 'Submission not found'), 404, { 'Content-Type': P });
    const { sub, assigneeEmail } = rows[0];
    // P6: collaboration notes with author emails (newest first)
    const notes = await db.select({ id: formNote.id, body: formNote.body, createdAt: formNote.createdAt, author: user.email })
      .from(formNote).leftJoin(user, eq(formNote.authorId, user.id))
      .where(eq(formNote.submissionId, id)).orderBy(desc(formNote.id)).limit(100);
    return c.json({ ...sub, assigneeEmail: assigneeEmail ?? null, slaState: slaState(sub), notes });
  });

  r.patch('/submissions/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = submissionUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const existing = await db.select().from(formSubmission).where(eq(formSubmission.id, id)).limit(1);
    if (!existing[0]) return c.json(problem(404, 'Submission not found'), 404, { 'Content-Type': P });
    // P6: server-enforced lead state machine (same discipline as the RMA board)
    let status = parsed.data.status;
    if (status && status !== existing[0].status) {
      const legal = SUBMISSION_TRANSITIONS[existing[0].status as keyof typeof SUBMISSION_TRANSITIONS] ?? [];
      if (!legal.includes(status)) {
        return c.json(problem(422, 'Illegal transition', `Cannot move ${existing[0].status} → ${status}. Legal: ${legal.join(', ') || 'none (terminal)'}.`), 422, { 'Content-Type': P });
      }
    }
    // assigning an unowned NEW lead advances it to 'assigned' (workflow intent)
    if (!status && parsed.data.assigneeId && existing[0].status === 'new') status = 'assigned';
    const rows = await db.update(formSubmission)
      .set({
        ...(status ? { status } : {}),
        ...(parsed.data.assigneeId !== undefined ? { assigneeId: parsed.data.assigneeId } : {}),
        ...(parsed.data.priority ? { priority: parsed.data.priority } : {}),
      })
      .where(eq(formSubmission.id, id)).returning();
    await auditRow(c, guard.user.id, 'submission.update', 'form_submission', String(id), parsed.data);
    return c.json({ ...rows[0], slaState: slaState(rows[0]) });
  });

  /** P6: internal note on a lead (editor+; collaboration trail, audited). */
  r.post('/submissions/:id/notes', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = formNoteCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const lead = await db.select({ id: formSubmission.id }).from(formSubmission).where(eq(formSubmission.id, id)).limit(1);
    if (!lead[0]) return c.json(problem(404, 'Submission not found'), 404, { 'Content-Type': P });
    const rows = await db.insert(formNote)
      .values({ submissionId: id, authorId: guard.user.id, body: parsed.data.body })
      .returning();
    await auditRow(c, guard.user.id, 'submission.note', 'form_submission', String(id), { noteId: rows[0].id });
    return c.json(rows[0], 201);
  });

  /** 0018: staff reply to the lead — speed-to-lead in one click. Sends the
   * customer email via the mailer (dev driver → outbox JSON), stamps
   * first_responded_at on the first reply, logs an internal note so the trail
   * shows what the customer was told, and audits. Editor+ only. */
  r.post('/submissions/:id/reply', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const body = await c.req.json().catch(() => ({}));
    const text = String((body as any).text ?? '').trim();
    if (!text || text.length > 8000) {
      return c.json(problem(422, 'Validation Failed', 'Reply text is required (max 8000 chars).'), 422, { 'Content-Type': P });
    }
    const rows = await db.select().from(formSubmission).where(eq(formSubmission.id, id)).limit(1);
    const lead = rows[0];
    if (!lead) return c.json(problem(404, 'Submission not found'), 404, { 'Content-Type': P });

    const sent = await sendCustomerConfirmation(
      lead.email,
      `Re: TwinMOS request ${lead.refCode} — ${lead.type.replace(/-/g, ' ')}`,
      `${text}\n\n— TwinMOS team\nReference: ${lead.refCode}`,
      { kind: 'staff-reply', refCode: lead.refCode, leadId: id, by: guard.user.email },
    );

    const stamp = lead.firstRespondedAt ? {} : { firstRespondedAt: new Date() };
    if (Object.keys(stamp).length || !lead.assigneeId) {
      await db.update(formSubmission).set({
        ...stamp,
        // replying claims an unowned lead (workflow intent, same rule as assignment)
        ...(!lead.assigneeId ? { assigneeId: guard.user.id, ...(lead.status === 'new' ? { status: 'assigned' as const } : {}) } : {}),
      }).where(eq(formSubmission.id, id));
    }
    await db.insert(formNote).values({
      submissionId: id, authorId: guard.user.id,
      body: `↩ Reply sent to ${lead.email}${sent ? '' : ' (mail delivery failed — check mailer logs)'}:\n${text.slice(0, 4000)}`,
    });
    await auditRow(c, guard.user.id, 'submission.reply', 'form_submission', String(id), { sent, chars: text.length });
    const fresh = (await db.select().from(formSubmission).where(eq(formSubmission.id, id)).limit(1))[0];
    return c.json({ sent, firstRespondedAt: fresh.firstRespondedAt, status: fresh.status, assigneeId: fresh.assigneeId }, 201);
  });

  // ==================== P2: RMA board ====================
  r.get('/rma', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 100);
    const status = rmaStatusQ.safeParse(c.req.query('status') ?? undefined);
    const q = (c.req.query('q') ?? '').trim();
    const assignee = c.req.query('assignee') ?? '';
    const filters = [
      status.success ? eq(rmaRequest.status, status.data) : undefined,
      // 0019: search across the whole case identity, not just the RMA number
      q ? or(
        ilike(rmaRequest.number, `%${q.replace(/[%_]/g, '')}%`),
        ilike(rmaRequest.productSku, `%${q}%`),
        ilike(rmaRequest.serial, `%${q}%`),
        sql`${rmaRequest.customer}::text ilike ${'%' + q + '%'}`,
      )! : undefined,
      // 0019: technician routing — my cases / unassigned queue / specific owner
      assignee === 'unassigned' ? isNull(rmaRequest.assigneeId) : undefined,
      assignee && assignee !== 'unassigned' ? eq(rmaRequest.assigneeId, assignee) : undefined,
    ].filter((f) => f !== undefined);
    const where = filters.length ? and(...filters) : undefined;
    // §6.6 completion: the card's assigned-technician chip — join the staff
    // account so the board renders a name, not a raw user id.
    const rows = await db.select({
      id: rmaRequest.id, number: rmaRequest.number, productSku: rmaRequest.productSku,
      serial: rmaRequest.serial, issue: rmaRequest.issue, status: rmaRequest.status,
      customer: rmaRequest.customer, warrantyTier: rmaRequest.warrantyTier,
      assigneeId: rmaRequest.assigneeId, assigneeEmail: user.email,
      createdAt: rmaRequest.createdAt, updatedAt: rmaRequest.updatedAt,
    }).from(rmaRequest)
      .leftJoin(user, eq(rmaRequest.assigneeId, user.id))
      .where(where)
      .orderBy(desc(rmaRequest.id)).limit(limit);
    const [{ n: total }] = await db.select({ n: count() }).from(rmaRequest).where(where);
    return c.json({ items: rows, total: Number(total) });
  });

  r.get('/rma/:id', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(rmaRequest).where(eq(rmaRequest.id, id)).limit(1);
    if (!rows[0]) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': P });
    const events = await db.select().from(rmaEvent).where(eq(rmaEvent.rmaId, id)).orderBy(rmaEvent.id);
    const assignee = rows[0].assigneeId
      ? (await db.select({ email: user.email }).from(user).where(eq(user.id, rows[0].assigneeId)).limit(1))[0]
      : null;
    return c.json({ ...rows[0], assigneeEmail: assignee?.email ?? null, timeline: events });
  });

  /** 0019: serial authenticity check for a case — verify the claimed serial
   * against the anti-counterfeit registry and the last 24h of public SN-checks
   * (the same >5-distinct-sources anomaly rule as the counterfeit scan) BEFORE
   * warranty service is approved. Read-only; authed. */
  r.get('/rma/:id/serial-check', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const id = Number(c.req.param('id'));
    const rows = await db.select().from(rmaRequest).where(eq(rmaRequest.id, id)).limit(1);
    const rma = rows[0];
    if (!rma) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': P });
    const serial = (rma.serial ?? '').trim().toUpperCase();
    if (!serial) return c.json({ serial: null, verdict: 'no_serial' });

    const reg = (await db.select().from(serialRegistry).where(eq(serialRegistry.serial, serial)).limit(1))[0] ?? null;
    const since = new Date(Date.now() - 24 * 3600_000);
    const [activity] = await db.select({
      checks: count(),
      distinctIps: sql<number>`count(distinct ${snCheck.ip})`,
      distinctCountries: sql<number>`count(distinct ${snCheck.country})`,
    }).from(snCheck).where(and(eq(snCheck.serial, serial), gte(snCheck.checkedAt, since)));
    const ips = Number(activity?.distinctIps ?? 0);
    const countries = Number(activity?.distinctCountries ?? 0);

    const verdict = !reg
      ? 'unknown' // not in the factory registry — needs manual confirmation
      : ips > 5 || countries > 5
        ? 'suspicious' // registry hit but the distribution pattern of a leaked/counterfeit serial
        : 'verified';
    // the case SKU may live on the column or in the intake payload (customer.product)
    const caseSku = (rma.productSku ?? String(((rma.customer ?? {}) as Record<string, unknown>).product ?? '')).trim().toUpperCase();
    return c.json({
      serial,
      verdict,
      registry: reg ? { sku: reg.sku, batch: reg.batch, manufacturedAt: reg.manufacturedAt, priorChecks: reg.verifiedCount } : null,
      last24h: { checks: Number(activity?.checks ?? 0), distinctIps: ips, distinctCountries: countries },
      skuMatch: reg?.sku && caseSku ? reg.sku.trim().toUpperCase() === caseSku : null,
    });
  });

  /** 0019: free-form staff reply to the RMA customer — the missing
   * communication piece next to status-transition emails. Sends via the
   * mailer, logs a same-state timeline event (rendered as the reply text) and
   * audits. Editor+. */
  r.post('/rma/:id/reply', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const body = await c.req.json().catch(() => ({}));
    const text = String((body as any).text ?? '').trim();
    if (!text || text.length > 8000) {
      return c.json(problem(422, 'Validation Failed', 'Reply text is required (max 8000 chars).'), 422, { 'Content-Type': P });
    }
    const rows = await db.select().from(rmaRequest).where(eq(rmaRequest.id, id)).limit(1);
    const rma = rows[0];
    if (!rma) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': P });
    const customer = (rma.customer ?? {}) as Record<string, unknown>;
    const to = String(customer.email ?? '').trim();
    if (!to) return c.json(problem(422, 'Validation Failed', 'This case has no customer email on file.'), 422, { 'Content-Type': P });

    const sent = await sendCustomerConfirmation(
      to,
      `Re: TwinMOS RMA ${rma.number} — status ${rma.status.replace(/_/g, ' ')}`,
      `${text}\n\n— TwinMOS service team\nRMA reference: ${rma.number} (track anytime: /rma.html with this number)`,
      { kind: 'rma-staff-reply', rma: rma.number, by: guard.user.email },
    );
    // same-state event = timeline annotation (the panel renders from==to rows
    // as notes; ↩-prefixed notes render as replies)
    await db.insert(rmaEvent).values({
      rmaId: id, fromStatus: rma.status, toStatus: rma.status, actorId: guard.user.id,
      note: `↩ Reply sent to ${to}${sent ? '' : ' (mail delivery failed — check mailer logs)'}:\n${text.slice(0, 3500)}`,
    });
    await auditRow(c, guard.user.id, 'rma.reply', 'rma_request', String(id), { sent, chars: text.length });
    return c.json({ sent }, 201);
  });

  /** §6.6 completion: assign/reassign the technician on a case (editor+,
   *  audited). assigneeId null unassigns; the id must reference staff. */
  r.patch('/rma/:id/assign', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const body = await c.req.json().catch(() => ({}));
    const assigneeId = (body as any).assigneeId === null || (body as any).assigneeId === undefined
      ? null : String((body as any).assigneeId);
    if (assigneeId !== null) {
      const staff = (await db.select({ id: user.id }).from(user).where(eq(user.id, assigneeId)).limit(1))[0];
      if (!staff) return c.json(problem(422, 'Validation Failed', 'assigneeId must reference a staff account (or null to unassign).'), 422, { 'Content-Type': P });
    }
    const rows = await db.update(rmaRequest).set({ assigneeId, updatedAt: new Date() })
      .where(eq(rmaRequest.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'rma.assign', 'rma_request', String(id), { assigneeId });
    return c.json(rows[0]);
  });

  r.post('/rma/:id/transition', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));

    const idemKey = c.req.header('Idempotency-Key');
    if (idemKey) {
      const cached = RMA_IDEM.get(idemKey) as { status: number; body: unknown } | undefined;
      if (cached) return c.json(cached.body, cached.status as 200);
    }

    const parsed = rmaTransitionSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.select().from(rmaRequest).where(eq(rmaRequest.id, id)).limit(1);
    const rma = rows[0];
    if (!rma) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': P });

    const legal = RMA_TRANSITIONS[rma.status] ?? [];
    if (!legal.includes(parsed.data.to)) {
      return c.json(problem(422, 'Illegal transition', `RMA ${rma.number} is '${rma.status}'; legal next states: ${legal.join(', ') || 'none'}.`), 422, { 'Content-Type': P });
    }

    const updated = await db.update(rmaRequest)
      .set({ status: parsed.data.to, updatedAt: new Date() })
      .where(eq(rmaRequest.id, id)).returning();
    await db.insert(rmaEvent).values({ rmaId: id, fromStatus: rma.status, toStatus: parsed.data.to, actorId: guard.user.id, note: parsed.data.note ?? null });
    await auditRow(c, guard.user.id, 'rma.transition', 'rma_request', String(id), { from: rma.status, to: parsed.data.to, note: parsed.data.note ?? null });

    if (parsed.data.notifyCustomer) {
      const customer = (rma.customer ?? {}) as Record<string, unknown>;
      if (customer.email) await sendRmaStatusMail(String(customer.email), rma.number, rma.status, parsed.data.to, parsed.data.note);
    }
    const body = updated[0];
    if (idemKey) RMA_IDEM.set(idemKey, { status: 200, body });
    return c.json(body);
  });

  // ==================== Phase 5.2: job postings CRUD (careers) ====================
  // Authors+ manage postings (draft → published → closed/archived); every
  // mutation is audited. Applications link via postingId (set-null on delete).
  r.get('/job-postings', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const status = c.req.query('status');
    const dept = (c.req.query('dept') ?? '').trim();
    const q = (c.req.query('q') ?? '').trim();
    const where = and(
      isNull(jobPosting.deletedAt),
      status && (JOB_POSTING_STATUSES as readonly string[]).includes(status) ? eq(jobPosting.status, status as 'draft') : undefined,
      dept ? eq(jobPosting.dept, dept) : undefined,
      // 0022: free-text across title/location/body
      q ? or(ilike(jobPosting.title, `%${q}%`), ilike(jobPosting.location, `%${q}%`), ilike(jobPosting.body, `%${q}%`))! : undefined,
    );
    const rows = await db.select({
      id: jobPosting.id, title: jobPosting.title, dept: jobPosting.dept, location: jobPosting.location,
      type: jobPosting.type, level: jobPosting.level, status: jobPosting.status,
      body: jobPosting.body, applyBy: jobPosting.applyBy, salaryBand: jobPosting.salaryBand,
      equalOpportunity: jobPosting.equalOpportunity, createdAt: jobPosting.createdAt,
      applicationCount: sql<number>`(select count(*) from ${jobApplication} where ${jobApplication.postingId} = ${jobPosting.id})`,
    }).from(jobPosting)
      .where(where)
      .orderBy(desc(jobPosting.id)).limit(200);
    return c.json({ items: rows.map((r2) => ({ ...r2, applicationCount: Number(r2.applicationCount) })) });
  });

  /** 0022: careers analytics — postings by status, applications by status,
   *  top postings by application count, 14-day arrival trend. */
  r.get('/job-analytics', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const now = Date.now();
    const [byStatus, appsByStatus, topPostings, arrivals] = await Promise.all([
      db.select({ status: jobPosting.status, n: count() }).from(jobPosting).where(isNull(jobPosting.deletedAt)).groupBy(jobPosting.status),
      db.select({ status: jobApplication.status, n: count() }).from(jobApplication).groupBy(jobApplication.status),
      db.select({ id: jobPosting.id, title: jobPosting.title, n: sql<number>`count(${jobApplication.id})` })
        .from(jobPosting).leftJoin(jobApplication, eq(jobApplication.postingId, jobPosting.id))
        .where(and(isNull(jobPosting.deletedAt), eq(jobPosting.status, 'published')))
        .groupBy(jobPosting.id, jobPosting.title).orderBy(desc(sql`count(${jobApplication.id})`)).limit(5),
      db.select({ d: sql<string>`to_char(${jobApplication.createdAt}, 'YYYY-MM-DD')`, n: count() })
        .from(jobApplication).where(gte(jobApplication.createdAt, new Date(now - 13 * 86400_000)))
        .groupBy(sql`to_char(${jobApplication.createdAt}, 'YYYY-MM-DD')`),
    ]);
    const series: Array<{ d: string; n: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const key = new Date(now - i * 86400_000).toISOString().slice(0, 10);
      series.push({ d: key, n: Number(arrivals.find((x: any) => x.d === key)?.n ?? 0) });
    }
    return c.json({
      postings: byStatus.map((x: any) => ({ status: x.status, n: Number(x.n) })),
      applications: appsByStatus.map((x: any) => ({ status: x.status, n: Number(x.n) })),
      topPostings: topPostings.map((x: any) => ({ id: x.id, title: x.title, n: Number(x.n) })),
      series,
    });
  });

  r.post('/job-postings', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const parsed = jobPostingCreateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const d = parsed.data;
    const rows = await db.insert(jobPosting).values({
      title: d.title, dept: d.dept, location: d.location, type: d.type, level: d.level,
      status: d.status as 'draft', body: d.body,
      applyBy: d.applyBy ? new Date(d.applyBy) : null,
      salaryBand: d.salaryBand ?? null, equalOpportunity: d.equalOpportunity,
    }).returning();
    await auditRow(c, guard.user.id, 'job_posting.create', 'job_posting', String(rows[0].id), d);
    return c.json(rows[0], 201);
  });

  r.patch('/job-postings/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = jobPostingUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const d = parsed.data as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    for (const k of ['title', 'dept', 'location', 'type', 'level', 'body', 'salaryBand', 'equalOpportunity'] as const) {
      if (d[k] !== undefined) patch[k] = d[k];
    }
    if (d.status !== undefined) patch.status = d.status;
    if (d.applyBy !== undefined) patch.applyBy = d.applyBy ? new Date(String(d.applyBy)) : null;
    if (!Object.keys(patch).length) return c.json(problem(422, 'Validation Failed', 'Nothing to update.'), 422, { 'Content-Type': P });
    const rows = await db.update(jobPosting).set(patch).where(and(eq(jobPosting.id, id), isNull(jobPosting.deletedAt))).returning();
    if (!rows[0]) return c.json(problem(404, 'Job posting not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'job_posting.update', 'job_posting', String(id), patch);
    return c.json(rows[0]);
  });

  r.delete('/job-postings/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const rows = await db.update(jobPosting).set({ deletedAt: new Date() })
      .where(and(eq(jobPosting.id, id), isNull(jobPosting.deletedAt))).returning();
    if (!rows[0]) return c.json(problem(404, 'Job posting not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'job_posting.delete', 'job_posting', String(id), { title: rows[0].title });
    return c.json({ deleted: true });
  });

  // ==================== P2: job applications (HR) ====================
  r.get('/job-applications', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 100);
    const status = submissionStatusQ.safeParse(c.req.query('status') ?? undefined);
    const postingId = Number(c.req.query('postingId') ?? 0) || 0;
    const q = (c.req.query('q') ?? '').trim();
    const where = and(
      status.success ? eq(jobApplication.status, status.data) : undefined,
      // 0022: filter by posting + free-text across email/refCode/payload
      postingId ? eq(jobApplication.postingId, postingId) : undefined,
      q ? or(ilike(jobApplication.email, `%${q}%`), ilike(jobApplication.refCode, `%${q}%`), sql`${jobApplication.payload}::text ilike ${'%' + q + '%'}`)! : undefined,
    );
    const rows = await db.select({
      id: jobApplication.id, postingId: jobApplication.postingId, postingTitle: jobPosting.title,
      email: jobApplication.email, payload: jobApplication.payload, status: jobApplication.status,
      refCode: jobApplication.refCode, createdAt: jobApplication.createdAt,
    }).from(jobApplication)
      .leftJoin(jobPosting, eq(jobApplication.postingId, jobPosting.id))
      .where(where)
      .orderBy(desc(jobApplication.id)).limit(limit);
    const [{ n: total }] = await db.select({ n: count() }).from(jobApplication)
      .leftJoin(jobPosting, eq(jobApplication.postingId, jobPosting.id)).where(where);
    return c.json({ items: rows, total: Number(total) });
  });

  r.patch('/job-applications/:id', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const parsed = jobApplicationUpdateSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const rows = await db.update(jobApplication).set({ status: parsed.data.status }).where(eq(jobApplication.id, id)).returning();
    if (!rows[0]) return c.json(problem(404, 'Application not found'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'job_application.update', 'job_application', String(id), parsed.data);
    return c.json(rows[0]);
  });

  /** 0022: reply to a candidate — the missing communication piece (ATS
   *  candidate-experience practice). Sends via the mailer, sets the
   *  application in progress when it is still new, and audits. Editor+. */
  r.post('/job-applications/:id/reply', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const id = Number(c.req.param('id'));
    const body = await c.req.json().catch(() => ({}));
    const text = String((body as any).text ?? '').trim();
    if (!text || text.length > 8000) {
      return c.json(problem(422, 'Validation Failed', 'Reply text is required (max 8000 chars).'), 422, { 'Content-Type': P });
    }
    const rows = await db.select().from(jobApplication).where(eq(jobApplication.id, id)).limit(1);
    const app = rows[0];
    if (!app) return c.json(problem(404, 'Application not found'), 404, { 'Content-Type': P });
    const name = String((app.payload as Record<string, unknown>)?.name ?? 'candidate');
    const sent = await sendCustomerConfirmation(
      app.email,
      `Re: TwinMOS application ${app.refCode} — ${name}`,
      `${text}\n\n— TwinMOS Careers\nReference: ${app.refCode}`,
      { kind: 'job-reply', refCode: app.refCode, by: guard.user.email },
    );
    // a reply means the pipeline is moving: new → assigned (in review)
    if (app.status === 'new') {
      await db.update(jobApplication).set({ status: 'assigned' }).where(eq(jobApplication.id, id));
    }
    await auditRow(c, guard.user.id, 'job_application.reply', 'job_application', String(id), { sent, chars: text.length });
    const fresh = (await db.select().from(jobApplication).where(eq(jobApplication.id, id)).limit(1))[0];
    return c.json({ sent, status: fresh.status }, 201);
  });

  return r;
}
