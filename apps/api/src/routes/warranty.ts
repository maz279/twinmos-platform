// Warranty registration & lookup (BRD §F8.3, URD UR-6.1.7 / UR-6.4.3 / UR-17.1.5,
// BR-6.2). Public endpoints are captcha + form-token gated and rate-limited
// (app.ts /api/v1/warranty/*). Lookup is POST (serial + e-mail in the body, never
// in URLs) and answers a registration owned by someone else exactly like "not
// registered", so it cannot be used to discover who owns a serial.
import { Hono } from 'hono';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import {
  problem, warrantyRegisterSchema, warrantyLookupSchema, parseWarrantyTerm, warrantyExpiry, warrantyStatusOf,
  type WarrantyStatusName,
} from '@twinmos/shared';
import { auditLog, product, productRegistration, serialRegistry, snCheck } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';
import { turnstileBypassEnabled } from '../boot-config.ts';
import { verifyFormToken, verifyTurnstile } from './forms.ts';
import { SERIAL_ANOMALY_THRESHOLD } from './sncheck.ts';
import { sendCustomerConfirmation } from '../mailer.ts';

const P = 'application/problem+json';
type Guard = (req: Request) => Promise<AuthSession | null>;

export type ActiveRegistration = typeof productRegistration.$inferSelect;

/** The one active registration for a serial, if any. */
export async function activeRegistration(db: DB, serial: string): Promise<ActiveRegistration | null> {
  const rows = await db.select().from(productRegistration)
    .where(and(eq(productRegistration.serial, serial.toUpperCase()), eq(productRegistration.status, 'active'))).limit(1);
  return rows[0] ?? null;
}

/** Public, PII-free warranty status for a serial (SN-check enrichment, UR-17.1.5). */
export async function warrantyFor(db: DB, serial: string): Promise<{ status: WarrantyStatusName; expiresAt: string | null }> {
  const reg = await activeRegistration(db, serial);
  return { status: warrantyStatusOf(reg), expiresAt: reg?.warrantyExpiresAt ? new Date(reg.warrantyExpiresAt).toISOString() : null };
}

/** Is this serial currently showing the cloned-label pattern (same rule as SN-check)? */
async function serialLooksCloned(db: DB, serial: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 3600_000);
  const [a] = await db.select({
    ips: sql<number>`count(distinct ${snCheck.ip})`,
    countries: sql<number>`count(distinct ${snCheck.country})`,
  }).from(snCheck).where(and(eq(snCheck.serial, serial), sql`${snCheck.checkedAt} >= ${since}`));
  return Number(a?.ips ?? 0) > SERIAL_ANOMALY_THRESHOLD || Number(a?.countries ?? 0) > SERIAL_ANOMALY_THRESHOLD;
}

function publicView(reg: ActiveRegistration, productName: string | null) {
  return {
    serial: reg.serial,
    sku: reg.sku,
    product: productName,
    purchaseDate: reg.purchaseDate,
    warrantyTerm: reg.warrantyTerm,
    expiresAt: reg.warrantyExpiresAt ? new Date(reg.warrantyExpiresAt).toISOString() : null,
    status: warrantyStatusOf(reg),
    registeredAt: reg.createdAt,
  };
}

export function warrantyRoute(db: DB) {
  const r = new Hono();

  r.post('/warranty/register', async (c) => {
    const parsed = warrantyRegisterSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const d = parsed.data;

    if (!d.formToken) return c.json(problem(400, 'Form token required', 'Please refresh the page and try again.'), 400, { 'Content-Type': P });
    const tok = verifyFormToken(d.formToken);
    if (!tok.valid || tok.expired) return c.json(problem(400, 'Form session expired', 'Please refresh the page and try again.'), 400, { 'Content-Type': P });
    if (!turnstileBypassEnabled()) {
      if (!d.turnstileToken) return c.json(problem(400, 'Captcha token required'), 400, { 'Content-Type': P });
      if (!(await verifyTurnstile(d.turnstileToken, c.req.header('x-real-ip')))) return c.json(problem(403, 'Captcha Failed'), 403, { 'Content-Type': P });
    }

    const reg = (await db.select().from(serialRegistry).where(eq(serialRegistry.serial, d.serial)).limit(1))[0];
    if (!reg) {
      return c.json({ ...problem(422, 'Serial not recognised', 'This serial number is not in the TwinMOS factory registry. Check the label, or contact support with your proof of purchase.'), code: 'SERIAL_UNKNOWN' }, 422, { 'Content-Type': P });
    }
    if (await serialLooksCloned(db, d.serial)) {
      return c.json({ ...problem(422, 'Registration needs review', 'This serial cannot be registered online. Please contact TwinMOS support with your proof of purchase.'), code: 'SERIAL_SUSPICIOUS' }, 422, { 'Content-Type': P });
    }

    const today = new Date().toISOString().slice(0, 10);
    const mfg = reg.manufacturedAt ? new Date(reg.manufacturedAt).toISOString().slice(0, 10) : null;
    if (d.purchaseDate > today || d.purchaseDate < '1998-01-01' || (mfg && d.purchaseDate < mfg)) {
      return c.json(problem(422, 'Invalid purchase date', mfg
        ? `The purchase date must be between the manufacturing date (${mfg}) and today.`
        : 'The purchase date cannot be in the future.'), 422, { 'Content-Type': P });
    }

    const prod = reg.sku ? (await db.select({ name: product.name, warranty: product.warranty }).from(product).where(eq(product.sku, reg.sku)).limit(1))[0] : undefined;
    const term = prod?.warranty ?? null;
    const expiresAt = warrantyExpiry(d.purchaseDate, parseWarrantyTerm(term));

    let row: ActiveRegistration;
    try {
      [row] = await db.insert(productRegistration).values({
        serial: d.serial, sku: reg.sku ?? null, email: d.email, name: d.name, country: d.country ?? null,
        purchaseDate: d.purchaseDate, retailer: d.retailer ?? null, warrantyTerm: term, warrantyExpiresAt: expiresAt,
      }).returning();
    } catch (e) {
      if (String((e as { cause?: { code?: string } })?.cause?.code ?? (e as { code?: string })?.code) === '23505') {
        return c.json({ ...problem(409, 'Already registered', 'This serial is already registered. If you are the owner, contact TwinMOS support with your proof of purchase.'), code: 'ALREADY_REGISTERED' }, 409, { 'Content-Type': P });
      }
      throw e;
    }

    const view = publicView(row, prod?.name ?? null);
    const site = (process.env.PUBLIC_SITE_URL || 'https://www.twinmos.com').replace(/\/+$/, '');
    await sendCustomerConfirmation(
      d.email,
      `TwinMOS warranty registration — ${d.serial}`,
      `Thank you for registering your TwinMOS product.\n\nProduct: ${prod?.name ?? reg.sku ?? 'TwinMOS product'}\nSerial: ${d.serial}\nPurchase date: ${d.purchaseDate}\nWarranty: ${term ?? 'to be confirmed by TwinMOS support'}${expiresAt ? `\nCovered until: ${expiresAt.toISOString().slice(0, 10)}` : ''}\n\nCheck your warranty status any time at ${site}/support/warranty with this serial and e-mail address.`,
      { kind: 'warranty-registration', serial: d.serial },
    );
    return c.json(view, 201, { 'Cache-Control': 'no-store' });
  });

  r.post('/warranty/lookup', async (c) => {
    const parsed = warrantyLookupSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const reg = await activeRegistration(db, parsed.data.serial);
    if (!reg || reg.email !== parsed.data.email) {
      // same answer whether the serial is unregistered or registered to someone else
      return c.json({ serial: parsed.data.serial, status: 'not_registered' as WarrantyStatusName }, 200, { 'Cache-Control': 'no-store' });
    }
    const prod = reg.sku ? (await db.select({ name: product.name }).from(product).where(eq(product.sku, reg.sku)).limit(1))[0] : undefined;
    return c.json(publicView(reg, prod?.name ?? null), 200, { 'Cache-Control': 'no-store' });
  });

  return r;
}

/** Staff view: registrations list (viewer+) and void (editor+, audited). */
export function warrantyAdminRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();
  const guard = async (c: any, role: 'viewer' | 'editor') => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    if (!(await deps.requireRole(role)(c.req.raw))) return c.json(problem(403, `Requires ${role} role or above`), 403, { 'Content-Type': P });
    return s;
  };

  r.get('/warranty-registrations', async (c) => {
    const s = await guard(c, 'viewer');
    if (s instanceof Response) return s;
    const q = (c.req.query('q') ?? '').trim();
    const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 200);
    const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0);
    const where = q
      ? or(ilike(productRegistration.serial, `%${q.replace(/[\\%_]/g, (m) => '\\' + m)}%`), ilike(productRegistration.email, `%${q.replace(/[\\%_]/g, (m) => '\\' + m)}%`))
      : undefined;
    const rows = await db.select().from(productRegistration).where(where).orderBy(desc(productRegistration.id)).limit(limit).offset(offset);
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(productRegistration).where(where);
    return c.json({ items: rows.map((x) => ({ ...x, warrantyStatus: x.status === 'void' ? 'void' : warrantyStatusOf(x) })), total: Number(n) });
  });

  r.post('/warranty-registrations/:id/void', async (c) => {
    const s = await guard(c, 'editor');
    if (s instanceof Response) return s;
    const id = Number(c.req.param('id'));
    const body = await c.req.json().catch(() => ({}));
    const reason = String((body as { reason?: unknown }).reason ?? '').trim();
    if (!reason || reason.length > 500) return c.json(problem(422, 'Validation Failed', 'A reason (max 500 chars) is required.'), 422, { 'Content-Type': P });
    const rows = await db.update(productRegistration).set({ status: 'void', voidReason: reason, updatedAt: new Date() })
      .where(and(eq(productRegistration.id, id), eq(productRegistration.status, 'active'))).returning();
    if (!rows[0]) return c.json(problem(404, 'Active registration not found'), 404, { 'Content-Type': P });
    await db.insert(auditLog).values({
      actorId: s.user.id, action: 'warranty.void', entity: 'product_registration', entityId: String(id),
      diff: { serial: rows[0].serial, reason }, requestId: c.req.header('x-request-id') ?? null, ip: c.req.header('x-real-ip') ?? null,
    });
    return c.json(rows[0]);
  });

  return r;
}
