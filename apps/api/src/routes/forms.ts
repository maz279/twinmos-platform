// Public form intake — Zod-validated, Turnstile-gated, stored via parameter-bound Drizzle queries.
// P2: routing email per type (mailer.ts), RMA intake creates a real RMA case
// (number + creation event + customer confirmation), Idempotency-Key honored.
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import {
  formSubmissionSchema, rmaIntakeSchema, problem,
  submissionRefPrefix, submissionAutoPriority, submissionSlaHours,
} from '@twinmos/shared';
import { formSubmission, jobApplication, rmaEvent, rmaRequest, newsletterSubscriber } from '@twinmos/db';
import { sendFormRouting, sendCustomerConfirmation } from '../mailer.ts';
import { alertManager } from '../services/alerts.ts';
import { IdempotencyStore } from '../idem.ts';
import { turnstileBypassEnabled } from '../boot-config.ts';
import type { DB } from '@twinmos/db';

const SAFE_CHARS = /[^A-Za-z0-9 @_.,:+\-()/#]/g;
function clean(value: unknown, max = 200): string {
  return String(value ?? '').replace(SAFE_CHARS, '').slice(0, max);
}

/** Idempotency for POST /forms (TTL + bounded; Redis in prod per docs/02). */
const IDEMPOTENT = new IdempotencyStore();

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

  // --- Newsletter Double Opt-in (Task D6: FORMS-01) ---
  r.post('/forms/newsletter', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    let email = body.email;
    const honeypot = body.website || body.hp;
    const fillTimeMs = Number(body.fillTimeMs || 0);
    const source = String(body.source || 'site_footer').slice(0, 100);

    // Spam guards: honeypot + timing (must take >= 1s to fill)
    if (honeypot) {
      return c.json({ ok: true, requiresConfirmation: true, status: 'pending', message: 'Verification link sent if email is valid.' }, 200);
    }
    if (fillTimeMs > 0 && fillTimeMs < 800) {
      return c.json(problem(400, 'Suspicious submission speed'), 400, { 'Content-Type': 'application/problem+json' });
    }

    if (!email || !email.includes('@') || email.length > 255) {
      return c.json(problem(422, 'Invalid email address'), 422, { 'Content-Type': 'application/problem+json' });
    }

    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const ip = c.req.header('cf-connecting-ip') ?? null;

    const existing = await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, email)).limit(1);
    if (existing[0]) {
      if (existing[0].status === 'active') {
        return c.json({ ok: true, requiresConfirmation: false, status: 'active', message: 'You are already subscribed to the TwinMOS newsletter.' });
      }
      await db.update(newsletterSubscriber)
        .set({ token, status: 'pending', source, ip, updatedAt: new Date() })
        .where(eq(newsletterSubscriber.id, existing[0].id));
    } else {
      await db.insert(newsletterSubscriber).values({
        email, token, status: 'pending', source, ip,
      });
    }

    // Send confirmation link
    const confirmUrl = `/api/v1/forms/newsletter/confirm?token=${token}`;
    await sendCustomerConfirmation(
      email,
      'Confirm your TwinMOS newsletter subscription',
      `Please confirm your subscription to the TwinMOS newsletter by clicking the link below:\n\n${confirmUrl}\n\nIf you did not request this, you can ignore this message.`,
      { kind: 'newsletter-opt-in', token }
    );

    const prefix = 'NL';
    const refCode = prefix + '-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8);

    await db.insert(formSubmission).values({
      type: 'newsletter',
      refCode,
      status: 'new',
      priority: 'low',
      dueAt: new Date(Date.now() + 24 * 3600_000),
      email,
      payload: { source: body.source ?? 'newsletter' },
      ip: ip ?? null,
      ua: c.req.header('user-agent') ?? null,
    });

    await sendFormRouting('newsletter', refCode, email, { source: body.source ?? 'newsletter' });

    return c.json({
      ok: true,
      reference: refCode,
      requiresConfirmation: true,
      status: 'pending',
      message: 'Subscription initiated. Please check your inbox to confirm your email.',
      confirmUrl,
    }, 201);
  });

  r.get('/forms/newsletter/confirm', async (c) => {
    const token = c.req.query('token');
    if (!token) {
      return c.json(problem(400, 'Confirmation token required'), 400, { 'Content-Type': 'application/problem+json' });
    }

    const sub = await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.token, token)).limit(1);
    if (!sub[0]) {
      return c.json(problem(404, 'Invalid or expired confirmation token'), 404, { 'Content-Type': 'application/problem+json' });
    }

    await db.update(newsletterSubscriber)
      .set({ status: 'active', confirmedAt: new Date(), updatedAt: new Date() })
      .where(eq(newsletterSubscriber.id, sub[0].id));

    return c.json({
      ok: true,
      confirmed: true,
      status: 'active',
      message: 'Thank you! Your TwinMOS newsletter subscription has been confirmed.',
    });
  });

  const handleUnsubscribe = async (c: any) => {
    const token = c.req.query('token');
    let email = c.req.query('email');
    if (!email && !token) {
      const body = await c.req.json().catch(() => ({}));
      email = body.email;
    }
    if (token) {
      const sub = await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.token, token)).limit(1);
      if (sub[0]) {
        await db.update(newsletterSubscriber)
          .set({ status: 'unsubscribed', unsubscribedAt: new Date(), updatedAt: new Date() })
          .where(eq(newsletterSubscriber.id, sub[0].id));
        return c.json({
          ok: true,
          unsubscribed: true,
          status: 'unsubscribed',
          message: 'You have been successfully unsubscribed from the TwinMOS newsletter.',
        });
      }
    }
    if (!email) {
      return c.json(problem(400, 'Email address or token required'), 400, { 'Content-Type': 'application/problem+json' });
    }
    email = String(email).trim().toLowerCase();

    await db.update(newsletterSubscriber)
      .set({ status: 'unsubscribed', unsubscribedAt: new Date(), updatedAt: new Date() })
      .where(eq(newsletterSubscriber.email, email));

    return c.json({
      ok: true,
      unsubscribed: true,
      status: 'unsubscribed',
      message: 'You have been successfully unsubscribed from the TwinMOS newsletter.',
    });
  };

  r.post('/forms/newsletter/unsubscribe', handleUnsubscribe);
  r.get('/forms/newsletter/unsubscribe', handleUnsubscribe);

  r.post('/forms/:type', async (c) => {
    // Idempotency-Key replay (TTL-bounded window; Redis in prod per docs/02)
    const idemKey = c.req.header('Idempotency-Key');
    if (idemKey) {
      const cached = IDEMPOTENT.get(idemKey) as { status: number; body: unknown } | undefined;
      if (cached) return c.json(cached.body, cached.status as 201);
    }

    const parsed = formSubmissionSchema.safeParse({ ...(await c.req.json().catch(() => ({}))), type: c.req.param('type') });
    if (!parsed.success) {
      return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': 'application/problem+json' });
    }
    const { type, email, name, payload } = parsed.data;

    // Turnstile is REQUIRED unless the dev bypass is explicitly set to '1' in non-production.
    if (!turnstileBypassEnabled()) {
      if (!parsed.data.turnstileToken) {
        return c.json(problem(400, 'Captcha token required'), 400, { 'Content-Type': 'application/problem+json' });
      }
      const ok = await verifyTurnstile(parsed.data.turnstileToken, c.req.header('cf-connecting-ip'));
      if (!ok) return c.json(problem(403, 'Captcha Failed'), 403, { 'Content-Type': 'application/problem+json' });
    }

    const fullPayload = { ...payload, ...(name ? { name } : {}) };
    // P6 (ADR-009): type-aware ticket prefix + intake priority + SLA due date.
    const prefix = submissionRefPrefix(type);
    const refCode = prefix + '-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8);
    const priority = submissionAutoPriority(type);
    const dueAt = new Date(Date.now() + submissionSlaHours(type) * 3600_000);

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
      priority, dueAt,
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
    const routingOk = await sendFormRouting(type, refCode, email, fullPayload);
    if (!routingOk) {
      alertManager.recordMailFailure(type, refCode, 'Internal form routing mail delivery failed');
    }

    // P6 (ADR-009, BR-4.1): ticketed auto-reply for every form family — RMA
    // already carries its own dedicated confirmation with the RMA number.
    if (!rmaNumber) {
      const confirmOk = await sendCustomerConfirmation(
        email,
        `TwinMOS request ${refCode} — we received your ${type.replace(/-/g, ' ')}`,
        `Thank you for contacting TwinMOS.\n\nYour reference: ${refCode}\nKeep it for any follow-up with our team.\n\nOur ${type === 'quote' ? 'regional sales office replies within one business day' : 'team replies within ' + Math.round(submissionSlaHours(type) / 24) + ' business day(s)'}.\n\nTwinMOS Technologies — Dubai DAFZA · Taipei · Cologne · San Jose · Dongguan`,
        { kind: 'submission-auto-reply', refCode, type },
      );
      if (!confirmOk) {
        alertManager.recordMailFailure(type, refCode, 'Customer confirmation auto-reply delivery failed');
      }
    }

    const body = rmaNumber
      ? { id: rows[0].id, reference: refCode, rmaNumber }
      : { id: rows[0].id, reference: refCode };
    if (idemKey) IDEMPOTENT.set(idemKey, { status: 201, body });    return c.json(body, 201);
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
    const data = await res.json() as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      console.warn('[forms] turnstile verification failed:', data['error-codes'] ?? 'unspecified');
      return false;
    }
    return true;
  } catch (err) {
    console.error('[forms] turnstile siteverify request error:', err);
    return false;
  }
}
