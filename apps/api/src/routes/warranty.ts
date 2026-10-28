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
import { auditLog, product, productRegistration, serialRegistry } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';
import { turnstileBypassEnabled } from '../boot-config.ts';
import { verifyFormToken, verifyTurnstile } from './forms.ts';
import { routeRecipient, sendCustomerConfirmation, sendMail } from '../mailer.ts';

const P = 'application/problem+json';
type Guard = (req: Request) => Promise<AuthSession | null>;

export type ActiveRegistration = typeof productRegistration.$inferSelect;

/** The one active registration for a serial, if any. */
export async function activeRegistration(db: DB, serial: string): Promise<ActiveRegistration | null> {
  const rows = await db.select().from(productRegistration)
    .where(and(eq(productRegistration.serial, serial.toUpperCase()), eq(productRegistration.status, 'active'))).limit(1);
  return rows[0] ?? null;
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

  // Registration is a two-step, e-mail-verified flow (ZT-045/046/047):
  //  1. POST /warranty/register validates and stores a PENDING row, then mails a
  //     single-use confirmation link. Answer AND mail are identical whether or
  //     not the serial is already registered (the requester picks the mailbox,
  //     so a different mail would be an oracle — ZT-065).
  //  2. POST /warranty/confirm {token} activates it (a link scanner opening the
  //     mail cannot: the link lands on a page with a confirm button). A serial
  //     already active under another address answers 409 and alerts support,
  //     who resolve the claim on proof of purchase (serials are printed on retail
  //     packaging, so first-to-confirm is not proof of ownership — ZT-066).
  // Pending rows never block anyone; the partial unique index covers 'active'.
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

    // "today" in the furthest-ahead time zone (UTC+14): a buyer in Taipei
    // registering a same-day purchase before 08:00 is not "in the future".
    const today = new Date(Date.now() + 14 * 3600_000).toISOString().slice(0, 10);
    const mfg = reg.manufacturedAt ? new Date(reg.manufacturedAt).toISOString().slice(0, 10) : null;
    if (d.purchaseDate > today || d.purchaseDate < '1998-01-01' || (mfg && d.purchaseDate < mfg)) {
      return c.json(problem(422, 'Invalid purchase date', mfg
        ? `The purchase date must be between the manufacturing date (${mfg}) and today.`
        : 'The purchase date cannot be in the future.'), 422, { 'Content-Type': P });
    }

    const prod = reg.sku ? (await db.select({ name: product.name, warranty: product.warranty }).from(product).where(eq(product.sku, reg.sku)).limit(1))[0] : undefined;
    const term = prod?.warranty ?? null;
    const expiresAt = warrantyExpiry(d.purchaseDate, parseWarrantyTerm(term));
    const site = (process.env.PUBLIC_SITE_URL || 'https://www.twinmos.com').replace(/\/+$/, '');
    const accepted = () => c.json({ status: 'pending_confirmation', message: 'Check your inbox: open the confirmation link we sent to finish the registration.' }, 202, { 'Cache-Control': 'no-store' });

    const confirmToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    await db.insert(productRegistration).values({
      serial: d.serial, sku: reg.sku ?? null, email: d.email, name: d.name, country: d.country ?? null,
      purchaseDate: d.purchaseDate, retailer: d.retailer ?? null, warrantyTerm: term, warrantyExpiresAt: expiresAt,
      status: 'pending', confirmToken, confirmExpiresAt: new Date(Date.now() + 48 * 3600_000), purchaseDateSource: 'self-declared',
    });
    await sendCustomerConfirmation(
      d.email,
      `Confirm your TwinMOS warranty registration — ${d.serial}`,
      `Please confirm the warranty registration for your TwinMOS product (link valid for 48 hours):\n\n${site}/support/warranty?confirm=${confirmToken}\n\nProduct: ${prod?.name ?? reg.sku ?? 'TwinMOS product'}\nSerial: ${d.serial}\nPurchase date (as declared): ${d.purchaseDate}\nWarranty: ${term ?? 'to be confirmed by TwinMOS support'}${expiresAt ? `\nCovered until: ${expiresAt.toISOString().slice(0, 10)}` : ''}\n\nKeep your proof of purchase: TwinMOS support may ask for it when you open an RMA.\nIf you did not request this, ignore this e-mail.`,
      { kind: 'warranty-registration-confirm' },
    );
    return accepted();
  });

  r.post('/warranty/confirm', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!/^[a-f0-9]{64}$/.test(token)) return c.json(problem(400, 'Invalid confirmation link'), 400, { 'Content-Type': P });
    const pending = (await db.select().from(productRegistration)
      .where(and(eq(productRegistration.confirmToken, token), eq(productRegistration.status, 'pending'))).limit(1))[0];
    if (!pending || !pending.confirmExpiresAt || pending.confirmExpiresAt.getTime() < Date.now()) {
      return c.json(problem(404, 'Link expired or already used', 'Register the product again to receive a new confirmation link.'), 404, { 'Content-Type': P });
    }
    let row: ActiveRegistration;
    try {
      [row] = await db.update(productRegistration)
        .set({ status: 'active', confirmToken: null, confirmExpiresAt: null, updatedAt: new Date() })
        .where(and(eq(productRegistration.id, pending.id), eq(productRegistration.status, 'pending'))).returning();
    } catch (e) {
      if (String((e as { cause?: { code?: string } })?.cause?.code ?? (e as { code?: string })?.code) === '23505') {
        const holder = await activeRegistration(db, pending.serial);
        const to = routeRecipient('warranty-dispute');
        if (to) {
          await sendMail({
            to,
            subject: `Warranty registration dispute — ${pending.serial}`,
            text: `A second, e-mail-verified claimant tried to register serial ${pending.serial}.

Active registration: #${holder?.id ?? '?'} (${holder?.email ?? 'unknown'}, purchase ${holder?.purchaseDate ?? '?'})
Claimant: pending #${pending.id} (${pending.email}, purchase ${pending.purchaseDate}, retailer ${pending.retailer ?? 'n/a'})

Ask both for proof of purchase; void the wrong registration in the admin console (SN-check → Warranty registrations).`,
            replyTo: pending.email,
          });
        }
        return c.json({ ...problem(409, 'Already registered', 'This serial is already registered to another owner. TwinMOS support has been notified and will contact you about your proof of purchase.'), code: 'ALREADY_REGISTERED' }, 409, { 'Content-Type': P });
      }
      throw e;
    }
    if (!row) return c.json(problem(404, 'Link expired or already used'), 404, { 'Content-Type': P });
    const prod = row.sku ? (await db.select({ name: product.name }).from(product).where(eq(product.sku, row.sku)).limit(1))[0] : undefined;
    return c.json(publicView(row, prod?.name ?? null), 200, { 'Cache-Control': 'no-store' });
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

/** Staff view: registrations list and void (editor+, void audited). */
export function warrantyAdminRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();
  const guard = async (c: any, role: 'viewer' | 'editor') => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    if (!(await deps.requireRole(role)(c.req.raw))) return c.json(problem(403, `Requires ${role} role or above`), 403, { 'Content-Type': P });
    return s;
  };

  r.get('/warranty-registrations', async (c) => {
    const s = await guard(c, 'editor'); // registrant PII: editor+ like the RMA board (ZT-050)
    if (s instanceof Response) return s;
    const q = (c.req.query('q') ?? '').trim();
    const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 200);
    const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0);
    const where = q
      ? or(ilike(productRegistration.serial, `%${q.replace(/[\\%_]/g, (m) => '\\' + m)}%`), ilike(productRegistration.email, `%${q.replace(/[\\%_]/g, (m) => '\\' + m)}%`))
      : undefined;
    const rows = await db.select().from(productRegistration).where(where).orderBy(desc(productRegistration.id)).limit(limit).offset(offset);
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(productRegistration).where(where);
    // the confirmation token is the registrant's credential, never shown to staff (ZT-067)
    return c.json({
      items: rows.map(({ confirmToken: _t, ...x }) => ({ ...x, warrantyStatus: x.status === 'active' ? warrantyStatusOf(x) : x.status })),
      total: Number(n),
    });
  });

  r.post('/warranty-registrations/:id/void', async (c) => {
    const s = await guard(c, 'editor');
    if (s instanceof Response) return s;
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) return c.json(problem(400, 'Invalid id'), 400, { 'Content-Type': P });
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
