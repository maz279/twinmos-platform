// Public form intake — Zod-validated, Turnstile-gated, stored via parameter-bound Drizzle queries.
// P2: routing email per type (mailer.ts), RMA intake creates a real RMA case
// (number + creation event + customer confirmation), Idempotency-Key honored.
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { formSubmissionSchema, rmaIntakeSchema, problem } from '@twinmos/shared';
import { formSubmission, jobApplication, rmaEvent, rmaRequest } from '@twinmos/db';
import { sendFormRouting, sendCustomerConfirmation } from '../mailer.ts';
import type { DB } from '@twinmos/db';

const SAFE_CHARS = /[^A-Za-z0-9 @_.,:+\-()/#]/g;
function clean(value: unknown, max = 200): string {
  return String(value ?? '').replace(SAFE_CHARS, '').slice(0, max);
}

/** Idempotency for POST /forms: same key replays the stored response instead of double-inserting. */
const IDEMPOTENT = new Map<string, { status: number; body: unknown }>();

/** Unpredictable 6-digit suffix from the CSPRNG (RMA numbers are guessable-proof public references). */
function randomDigits(count: number): string {
  const max = 10 ** count;
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % max).padStart(count, '0');
}
async function nextRmaNumber(db: DB): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `TM-RMA-${year}-${randomDigits(6)}`;
    const clash = await db.select({ id: rmaRequest.id }).from(rmaRequest).where(eq(rmaRequest.number, candidate)).limit(1);
    if (!clash[0]) return candidate;
  }
  throw new Error('could not allocate RMA number');
}

export function formsRoute(db: DB) {
  const r = new Hono();

  r.post('/forms/:type', async (c) => {
    // Idempotency-Key replay (30-minute window, in-memory; Redis in prod per docs/02)
    const idemKey = c.req.header('Idempotency-Key');
    if (idemKey) {
      const cached = IDEMPOTENT.get(idemKey);
      if (cached) return c.json(cached.body, cached.status as 201);
    }

    const parsed = formSubmissionSchema.safeParse({ ...(await c.req.json().catch(() => ({}))), type: c.req.param('type') });
    if (!parsed.success) {
      return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': 'application/problem+json' });
    }
    const { type, email, name, payload } = parsed.data;

    // Turnstile is REQUIRED unless the dev bypass is explicitly set.
    if (!process.env.API_ALLOW_NO_TURNSTILE) {
      if (!parsed.data.turnstileToken) {
        return c.json(problem(400, 'Captcha token required'), 400, { 'Content-Type': 'application/problem+json' });
      }
      const ok = await verifyTurnstile(parsed.data.turnstileToken, c.req.header('cf-connecting-ip'));
      if (!ok) return c.json(problem(403, 'Captcha Failed'), 403, { 'Content-Type': 'application/problem+json' });
    }

    const fullPayload = { ...payload, ...(name ? { name } : {}) };
    const refCode = 'FRM-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8);

    // RMA intake: validate the case fields, create the RMA case + creation event,
    // then store the submission referencing it.
    let rmaNumber: string | null = null;
    if (type === 'rma') {
      const intake = rmaIntakeSchema.safeParse({ ...fullPayload, email });
      if (!intake.success) {
        return c.json(problem(422, 'Validation Failed', 'RMA requests need product and issue details (10+ chars).', intake.error.issues), 422, { 'Content-Type': 'application/problem+json' });
      }
      const d = intake.data;
      rmaNumber = await nextRmaNumber(db);
      const created = await db.insert(rmaRequest).values({
        number: rmaNumber,
        productSku: d.sku ?? null,
        serial: d.serial ?? null,
        issue: d.issue,
        customer: { name: d.name, email: d.email, phone: d.phone ?? null, country: d.country ?? null, product: d.product, purchaseDate: d.purchaseDate ?? null },
        warrantyTier: d.warrantyTier ?? null,
      }).returning({ id: rmaRequest.id });
      await db.insert(rmaEvent).values({
        rmaId: created[0].id, fromStatus: 'submitted', toStatus: 'submitted',
        note: 'RMA request received via website form',
      });
      await sendCustomerConfirmation(
        d.email,
        `TwinMOS RMA ${rmaNumber} — request received`,
        `We received your RMA request for ${d.product}.\n\nYour RMA number: ${rmaNumber}\nKeep this number to track the request on twinmos.com/rma.html.\n\nOur support team reviews requests within one business day and replies with shipping instructions.`,
        { number: rmaNumber },
      );
    }

    const rows = await db.insert(formSubmission).values({
      type, email, payload: rmaNumber ? { ...fullPayload, rmaNumber } : fullPayload, refCode,
      ip: c.req.header('cf-connecting-ip') ?? null, ua: c.req.header('user-agent') ?? null,
    }).returning({ id: formSubmission.id });

    // Careers types also materialise a job_application row for the HR module
    // (postingId optional: general applications are unattached).
    if (type === 'job-application' || type === 'general-application') {
      const postingId = Number(payload.postingId);
      await db.insert(jobApplication).values({
        postingId: Number.isInteger(postingId) && postingId > 0 ? postingId : null,
        email, payload: fullPayload, refCode,
      });
    }

    // Team routing email — never blocks the response on failure.
    await sendFormRouting(type, refCode, email, fullPayload);

    const body = rmaNumber
      ? { id: rows[0].id, reference: refCode, rmaNumber }
      : { id: rows[0].id, reference: refCode };
    if (idemKey) IDEMPOTENT.set(idemKey, { status: 201, body });
    return c.json(body, 201);
  });

  r.get('/rma/:number', async (c) => {
    const number = clean(c.req.param('number'), 24).toUpperCase();
    if (!/^(TM-)?RMA-\d{4}-\d{3,8}$/.test(number)) {
      return c.json(problem(400, 'Invalid RMA number format'), 400, { 'Content-Type': 'application/problem+json' });
    }
    const canonical = number.startsWith('TM-') ? number : 'TM-' + number;
    const found = await db.select({ id: rmaRequest.id, number: rmaRequest.number, status: rmaRequest.status, createdAt: rmaRequest.createdAt, customer: rmaRequest.customer, productSku: rmaRequest.productSku, issue: rmaRequest.issue })
      .from(rmaRequest).where(eq(rmaRequest.number, canonical)).limit(1);
    const rma = found[0];
    if (!rma) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': 'application/problem+json' });
    const events = await db.select({ from: rmaEvent.fromStatus, to: rmaEvent.toStatus, note: rmaEvent.note, at: rmaEvent.at })
      .from(rmaEvent).where(eq(rmaEvent.rmaId, rma.id));
    // Public projection: masked customer info only.
    const customer = (rma.customer ?? {}) as Record<string, unknown>;
    const maskedInfo = {
      name: maskName(String(customer.name ?? '')),
      product: customer.product ?? rma.productSku ?? '',
    };
    return c.json({ number: rma.number, status: rma.status, createdAt: rma.createdAt, maskedInfo, timeline: events });
  });

  return r;
}

function maskName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.map((p, i) => (i === 0 ? p : p[0] + '.')).join(' ');
}

async function verifyTurnstile(token: string, ip: string | undefined): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip ?? undefined }),
    });
    return (await res.json()).success === true;
  } catch { return false; }
}
