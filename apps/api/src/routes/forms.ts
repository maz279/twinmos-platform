// Public form intake — Zod-validated, Turnstile-gated, stored via parameter-bound Drizzle queries.
// P2: routing email per type (mailer.ts), RMA intake creates a real RMA case
// (number + creation event + customer confirmation), Idempotency-Key honored.
import { Hono, type Context } from 'hono';
import { and, asc, eq, isNull, notInArray } from 'drizzle-orm';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import {
  formSubmissionSchema, rmaIntakeSchema, problem,
  submissionRefPrefix, submissionAutoPriority, submissionSlaHours, warrantyStatusOf,
} from '@twinmos/shared';
import { activeRegistration } from './warranty.ts';
import { formSubmission, jobApplication, rmaEvent, rmaRequest, newsletterSubscriber, contentFeedback, article, newsPost } from '@twinmos/db';
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
const IN_FLIGHT = new Set<string>();
/** Form tokens already spent on a "helpful" vote: one vote per token (ZT-072).
 *  TTL covers the token's own 30-minute validity. */
const VOTED_TOKENS = new IdempotencyStore(31 * 60_000, 100_000);

/** Pragmatic address check shared by the public forms (one @, a dot in the domain, no spaces). */
export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

const NEWSLETTER_CONFIRM_TTL_MS = 7 * 24 * 3600_000;

/** Public site origin for links in e-mails and redirects. */
function siteBaseUrl(): string {
  return (process.env.PUBLIC_SITE_URL || process.env.ORIGIN || 'https://www.twinmos.com').replace(/\/+$/, '');
}


/** HMAC key for form tokens: a deployment secret, never a literal in source
 *  (boot-config guarantees BETTER_AUTH_SECRET in production). */
function formTokenSecret(): string {
  const s = process.env.FORM_TOKEN_SECRET || process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRETS?.split(',')[0];
  if (s) return s;
  if (process.env.NODE_ENV === 'production') throw new Error('FORM_TOKEN_SECRET/BETTER_AUTH_SECRET missing');
  return 'dev-only-form-token-secret';
}

/** Form anti-spam token signed with 30-minute validity (T5.5.1). */
export function createFormToken(issuedAt: number = Date.now()): string {
  const secret = formTokenSecret();
  const payload = `${issuedAt}:${crypto.randomUUID().slice(0, 8)}`;
  const hmac = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifyFormToken(token: string): { valid: boolean; expired: boolean; ageMs: number } {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = raw.split(':');
    if (parts.length !== 3) return { valid: false, expired: false, ageMs: 0 };
    const [issuedAtStr, nonce, sig] = parts;
    const issuedAt = Number(issuedAtStr);
    if (!issuedAt || isNaN(issuedAt)) return { valid: false, expired: false, ageMs: 0 };

    const expectedSig = createHmac('sha256', formTokenSecret()).update(`${issuedAt}:${nonce}`).digest('hex').slice(0, 16);
    if (sig.length !== expectedSig.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return { valid: false, expired: false, ageMs: 0 };
    }

    const ageMs = Date.now() - issuedAt;
    const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes per T5.5.1
    if (ageMs > MAX_AGE_MS || ageMs < -60_000) {
      return { valid: true, expired: true, ageMs };
    }
    return { valid: true, expired: false, ageMs };
  } catch {
    return { valid: false, expired: false, ageMs: 0 };
  }
}

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

/** `ipOf` is app.ts clientIp(): the edge-stamped address. The raw
 *  cf-connecting-ip / x-real-ip request headers are client-forgeable (Z-28). */
export function formsRoute(db: DB, ipOf: (c: Context) => string) {
  const r = new Hono();

  // Public CSRF/Anti-spam token with 30-minute expiry (T5.5.1)
  r.get('/forms/token', (c) => {
    const token = createFormToken();
    return c.json({ ok: true, token, expiresInMs: 30 * 60 * 1000 });
  });

  // --- Newsletter Double Opt-in (Task D6: FORMS-01, R0.3: Z-21, ZT-033/048) ---
  // One answer for every address (new, pending or already active), so the form
  // is no subscription oracle. State changes only on POST: the e-mailed links
  // open /newsletter, whose button POSTs — mail link scanners cannot confirm or
  // unsubscribe anyone by fetching a URL.
  r.post('/forms/newsletter', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const rawEmail = String(body.email ?? '').trim();
    const email = rawEmail.toLowerCase();
    const honeypot = body.website || body.hp;
    const fillTimeMs = Number(body.fillTimeMs || 0);
    const source = String(body.source || 'site_footer').slice(0, 100);
    const pendingAnswer = () => c.json({ ok: true, requiresConfirmation: true, status: 'pending', message: 'Please check your inbox to confirm your subscription.' }, 201);

    // Spam guards: honeypot + timing (must take >= 1s to fill)
    if (honeypot) return pendingAnswer();
    if (fillTimeMs > 0 && fillTimeMs < 800) {
      return c.json(problem(400, 'Suspicious submission speed'), 400, { 'Content-Type': 'application/problem+json' });
    }
    const ft = body.formToken ? verifyFormToken(String(body.formToken)) : null;
    if (!ft || !ft.valid || ft.expired) {
      return c.json(problem(400, 'Form token required', 'Please refresh the page and try again.'), 400, { 'Content-Type': 'application/problem+json' });
    }

    // Turnstile is REQUIRED unless the dev bypass is explicitly set to '1' in non-production.
    if (!turnstileBypassEnabled()) {
      const turnstileToken = body.turnstileToken || body['cf-turnstile-response'];
      if (!turnstileToken) {
        return c.json(problem(400, 'Captcha token required'), 400, { 'Content-Type': 'application/problem+json' });
      }
      const ok = await verifyTurnstile(turnstileToken, ipOf(c));
      if (!ok) return c.json(problem(403, 'Captcha Failed'), 403, { 'Content-Type': 'application/problem+json' });
    }

    if (email.length > 254 || !EMAIL_RE.test(email)) {
      return c.json(problem(422, 'Invalid email address'), 422, { 'Content-Type': 'application/problem+json' });
    }

    const newToken = () => crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const ip = ipOf(c);
    const existing = (await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, email)).limit(1))[0];
    if (existing?.status === 'active') return pendingAnswer(); // already confirmed: nothing to send

    // A still-valid pending link is re-sent, never rotated (a third party
    // re-submitting someone's address must not kill their confirmation link).
    const reuse = existing?.status === 'pending' && existing.token && existing.tokenExpiresAt && existing.tokenExpiresAt.getTime() > Date.now();
    const token = reuse ? existing.token! : newToken();
    const tokenExpiresAt = reuse ? existing.tokenExpiresAt! : new Date(Date.now() + NEWSLETTER_CONFIRM_TTL_MS);
    const unsubscribeToken = existing?.unsubscribeToken && existing.unsubscribeToken !== existing.token ? existing.unsubscribeToken : newToken();
    if (existing) {
      if (!reuse) {
        await db.update(newsletterSubscriber)
          .set({ token, tokenExpiresAt, unsubscribeToken, status: 'pending', source, ip, updatedAt: new Date() })
          .where(eq(newsletterSubscriber.id, existing.id));
      }
    } else {
      await db.insert(newsletterSubscriber).values({ email, token, tokenExpiresAt, unsubscribeToken, status: 'pending', source, ip });
    }

    const baseUrl = siteBaseUrl();
    const confirmUrl = `${baseUrl}/newsletter?confirm=${token}`;
    const unsubPageUrl = `${baseUrl}/newsletter?unsubscribe=${unsubscribeToken}`;
    const oneClickUrl = `${baseUrl}/api/v1/forms/newsletter/unsubscribe?token=${unsubscribeToken}`;
    // Mail goes out after the answer (not awaited): waiting on the provider made
    // new/pending addresses measurably slower than active ones (ZT-071 oracle).
    void sendCustomerConfirmation(
      email,
      'Confirm your TwinMOS newsletter subscription',
      `Please confirm your subscription to the TwinMOS newsletter (link valid for 7 days):\n\n${confirmUrl}\n\nTo unsubscribe or cancel this request at any time:\n${unsubPageUrl}\n\nIf you did not request this, you can ignore this message.`,
      {
        kind: 'newsletter-opt-in',
        headers: {
          'List-Unsubscribe': `<${oneClickUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      },
    );

    if (!existing) {
      const refCode = 'NL-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8);
      await db.insert(formSubmission).values({
        type: 'newsletter', refCode, status: 'new', priority: 'low',
        dueAt: new Date(Date.now() + 24 * 3600_000), email,
        payload: { source: body.source ?? 'newsletter' }, ip, ua: c.req.header('user-agent') ?? null,
      });
      void sendFormRouting('newsletter', refCode, email, { source: body.source ?? 'newsletter' });
    }
    return pendingAnswer();
  });

  // Confirmation is a POST from the /newsletter page (button), never a GET.
  r.post('/forms/newsletter/confirm', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const token = String(body.token ?? c.req.query('token') ?? '').trim();
    const sub = token ? (await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.token, token)).limit(1))[0] : undefined;
    if (!sub || sub.status !== 'pending' || !sub.tokenExpiresAt || sub.tokenExpiresAt.getTime() < Date.now()) {
      return c.json(problem(404, 'Invalid or expired confirmation token'), 404, { 'Content-Type': 'application/problem+json' });
    }
    // one-time: the confirmation token is consumed; only the unsubscribe token lives on
    await db.update(newsletterSubscriber)
      .set({ status: 'active', confirmedAt: new Date(), token: null, tokenExpiresAt: null, updatedAt: new Date() })
      .where(eq(newsletterSubscriber.id, sub.id));
    return c.json({ ok: true, confirmed: true, status: 'active', message: 'Thank you! Your TwinMOS newsletter subscription has been confirmed.' });
  });
  // Old-style links (and link scanners) land on the page, which asks for a click.
  r.get('/forms/newsletter/confirm', (c) => c.redirect(`${siteBaseUrl()}/newsletter?confirm=${encodeURIComponent(c.req.query('token') ?? '')}`, 303));

  // RFC 8058 one-click unsubscribe is a POST with the token; a GET opens the page.
  r.post('/forms/newsletter/unsubscribe', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const token = String(c.req.query('token') ?? body.token ?? '').trim();
    if (!token) return c.json(problem(400, 'Unsubscribe token required'), 400, { 'Content-Type': 'application/problem+json' });
    const sub = (await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.unsubscribeToken, token)).limit(1))[0];
    if (!sub) return c.json(problem(404, 'Invalid or expired unsubscribe token'), 404, { 'Content-Type': 'application/problem+json' });
    await db.update(newsletterSubscriber)
      .set({ status: 'unsubscribed', unsubscribedAt: new Date(), token: null, tokenExpiresAt: null, updatedAt: new Date() })
      .where(eq(newsletterSubscriber.id, sub.id));
    return c.json({ ok: true, unsubscribed: true, status: 'unsubscribed', message: 'You have been successfully unsubscribed from the TwinMOS newsletter.' });
  });
  r.get('/forms/newsletter/unsubscribe', (c) => c.redirect(`${siteBaseUrl()}/newsletter?unsubscribe=${encodeURIComponent(c.req.query('token') ?? '')}`, 303));

  // "Was this helpful?" votes (ZT-034). Registered before /forms/:type so it is
  // not taken for a form type; inherits the 5/min/IP forms limiter (app.ts).
  // Stores only entity + slug + locale + vote — no IP, no user agent.
  r.post('/forms/content-feedback', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const ft = body.formToken ? verifyFormToken(String(body.formToken)) : null;
    if (!ft || !ft.valid || ft.expired) return c.json(problem(400, 'Form token required', 'Please refresh the page and try again.'), 400, { 'Content-Type': 'application/problem+json' });
    // one vote per token: stuffing needs a fresh token (and the token endpoint
    // shares the per-IP forms limiter's budget of votes)
    if (VOTED_TOKENS.get(String(body.formToken))) return c.json(problem(409, 'Already recorded', 'Thanks — your vote for this page was already recorded.'), 409, { 'Content-Type': 'application/problem+json' });
    const entity = body.entity === 'news' ? 'news' : body.entity === 'article' ? 'article' : null;
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    if (!entity || !/^[a-z0-9-]{1,200}$/.test(slug) || typeof body.helpful !== 'boolean') {
      return c.json(problem(422, 'Validation Failed', 'entity (article|news), slug and helpful (boolean) are required.'), 422, { 'Content-Type': 'application/problem+json' });
    }
    const locale = typeof body.locale === 'string' && /^[a-z]{2}(-[a-z]{2})?$/.test(body.locale) ? body.locale : 'en';
    const table = entity === 'news' ? newsPost : article;
    const found = await db.select({ id: table.id }).from(table)
      .where(and(eq(table.slug, slug), eq(table.status, 'published'), isNull(table.deletedAt))).limit(1);
    if (!found[0]) return c.json(problem(404, 'Not found'), 404, { 'Content-Type': 'application/problem+json' });
    VOTED_TOKENS.set(String(body.formToken), true);
    await db.insert(contentFeedback).values({ entity, slug, locale, helpful: body.helpful });
    return c.json({ ok: true, recorded: true }, 201);
  });

  r.post('/forms/:type', async (c) => {
    const rawBody = await c.req.json().catch(() => ({}));
    // Idempotency-Key replay (TTL-bounded window; Redis in prod per docs/02).
    // The cache key binds the client's key to the exact request (type + body),
    // so a key observed or guessed elsewhere can never return another visitor's
    // submission reference (ZT-029) — it only dedupes true retries.
    const idemHeader = c.req.header('Idempotency-Key');
    const idemKey = idemHeader
      ? `${idemHeader}:${createHash('sha256').update(c.req.param('type') + '\n' + JSON.stringify(rawBody)).digest('hex')}`
      : null;
    if (idemKey) {
      const cached = IDEMPOTENT.get(idemKey) as { status: number; body: unknown } | undefined;
      if (cached) return c.json(cached.body, cached.status as 201);
      // a retry that races the first request must not create a second case
      if (IN_FLIGHT.has(idemKey)) return c.json(problem(409, 'Request in progress', 'This submission is already being processed.'), 409, { 'Content-Type': 'application/problem+json' });
      IN_FLIGHT.add(idemKey);
    }
    try {

    const honeypot = rawBody.website || rawBody.hp;
    const fillTimeMs = Number(rawBody.fillTimeMs || 0);
    const formToken = rawBody.formToken || rawBody.token;

    // Spam guard: honeypot (silent success to deceive automated bots)
    if (honeypot) {
      return c.json({
        id: 0,
        reference: 'TM-SPAM-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8),
        ok: true,
      }, 201);
    }

    // Spam guard: minimum fill time (humans take >= 800ms)
    if (fillTimeMs > 0 && fillTimeMs < 800) {
      return c.json(problem(400, 'Suspicious submission speed'), 400, { 'Content-Type': 'application/problem+json' });
    }

    // Spam guard: signed token expiring after 30 minutes (T5.5.1). Mandatory —
    // an optional guard is no guard (ZT-028). Every site form carries one
    // (BlockDispatcher hidden input + forms.js fetch of /forms/token).
    if (!formToken) {
      return c.json(problem(400, 'Form token required', 'Please refresh the page and try again.'), 400, { 'Content-Type': 'application/problem+json' });
    }
    {
      const parsedToken = verifyFormToken(formToken);
      if (parsedToken.expired) {
        return c.json(problem(400, 'Form session expired. Please refresh the page and try again.'), 400, { 'Content-Type': 'application/problem+json' });
      }
      if (!parsedToken.valid) {
        return c.json(problem(400, 'Invalid form token'), 400, { 'Content-Type': 'application/problem+json' });
      }
    }

    const parsed = formSubmissionSchema.safeParse({ ...rawBody, type: c.req.param('type') });
    if (!parsed.success) {
      return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': 'application/problem+json' });
    }
    const { type, email, name, payload } = parsed.data;

    // Turnstile is REQUIRED unless the dev bypass is explicitly set to '1' in non-production.
    if (!turnstileBypassEnabled()) {
      if (!parsed.data.turnstileToken) {
        return c.json(problem(400, 'Captcha token required'), 400, { 'Content-Type': 'application/problem+json' });
      }
      const ok = await verifyTurnstile(parsed.data.turnstileToken, ipOf(c));
      if (!ok) return c.json(problem(403, 'Captcha Failed'), 403, { 'Content-Type': 'application/problem+json' });
    }

    const fullPayload = {
      ...payload,
      ...(name ? { name } : {}),
      ...(rawBody.leadSource ? { leadSource: clean(rawBody.leadSource, 200) } : {}),
      ...(rawBody.utm ? { utm: rawBody.utm } : {}),
    };
    // P6 (ADR-009): type-aware ticket prefix + intake priority + SLA due date.
    const prefix = submissionRefPrefix(type);
    const refCode = prefix + '-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8);
    const priority = submissionAutoPriority(type);
    const dueAt = new Date(Date.now() + submissionSlaHours(type) * 3600_000);

    // RMA intake: validate the case fields, create the RMA case + creation event,
    // then store the submission referencing it.
    let rmaNumber: string | null = null;
    let submissionId: number | null = null;
    if (type === 'rma') {
      const normalizedRma = {
        ...fullPayload,
        name: (fullPayload as any).name || (fullPayload as any).customerName || (fullPayload as any).fullName || name,
        email: email || (fullPayload as any).email || (fullPayload as any).customerEmail,
        product: (fullPayload as any).product || (fullPayload as any).productModel || (fullPayload as any).model,
        serial: (fullPayload as any).serial || (fullPayload as any).serialNumber,
        issue: (fullPayload as any).issue || (fullPayload as any).defectDescription || (fullPayload as any).faultDescription || (fullPayload as any).message,
        phone: (fullPayload as any).phone || (fullPayload as any).phoneNumber,
        country: (fullPayload as any).country || (fullPayload as any).countryRegion,
        purchaseDate: (fullPayload as any).purchaseDate,
        warrantyTier: (fullPayload as any).warrantyTier,
      };
      const intake = rmaIntakeSchema.safeParse(normalizedRma);
      if (!intake.success) {
        return c.json(problem(422, 'Validation Failed', 'RMA requests need product and issue details (10+ chars).', intake.error.issues), 422, { 'Content-Type': 'application/problem+json' });
      }
      const d = intake.data;
      // BR-6.2 (ZT-027): no RMA for unregistered or out-of-warranty products.
      // The warranty tier is derived from the registration, never taken from
      // the client (it used to store whatever the form posted).
      const site = siteBaseUrl();
      const serialNo = String(d.serial ?? '').trim().toUpperCase();
      if (!serialNo) {
        return c.json({ ...problem(422, 'Serial number required', 'Enter the serial number printed on the product label.'), code: 'SERIAL_REQUIRED' }, 422, { 'Content-Type': 'application/problem+json' });
      }
      const registration = await activeRegistration(db, serialNo);
      if (!registration || registration.email !== d.email.trim().toLowerCase()) {
        return c.json({ ...problem(422, 'Please register your product first', `RMA requests need a warranty registration for this serial under your e-mail address. Register at ${site}/support/warranty, then submit the RMA.`), code: 'NOT_REGISTERED' }, 422, { 'Content-Type': 'application/problem+json' });
      }
      const wStatus = warrantyStatusOf(registration);
      if (wStatus === 'expired') {
        return c.json({ ...problem(422, 'Warranty expired', `The warranty for ${serialNo} ended on ${new Date(registration.warrantyExpiresAt!).toISOString().slice(0, 10)}. Contact TwinMOS support for out-of-warranty service options.`), code: 'WARRANTY_EXPIRED' }, 422, { 'Content-Type': 'application/problem+json' });
      }
      // One open case per serial: a second request while one is in progress
      // would fork the service history (closed/delivered cases do not count).
      const open = await db.select({ number: rmaRequest.number }).from(rmaRequest)
        .where(and(eq(rmaRequest.serial, serialNo), notInArray(rmaRequest.status, ['closed', 'delivered']))).limit(1);
      if (open[0]) {
        return c.json({ ...problem(409, 'An RMA is already open for this serial', `Track it with the number in your confirmation e-mail (${open[0].number.slice(0, 7)}…) at ${site}/rma.`), code: 'RMA_OPEN' }, 409, { 'Content-Type': 'application/problem+json' });
      }
      // Tier, SKU and the purchase basis come from the registration, never the
      // client; an undetermined term is admitted and flagged for staff review.
      d.warrantyTier = (registration.warrantyTerm ?? 'undetermined').slice(0, 20);
      d.sku = registration.sku ?? undefined;
      d.serial = serialNo;
      const reviewNote = [
        `Warranty: ${wStatus}${registration.warrantyExpiresAt ? ` until ${new Date(registration.warrantyExpiresAt).toISOString().slice(0, 10)}` : ''}`,
        `purchase date ${registration.purchaseDate} (${registration.purchaseDateSource}) — request proof of purchase`,
        ...(wStatus === 'undetermined' ? ['warranty term undetermined: staff review required'] : []),
      ].join('; ');
      rmaNumber = await nextRmaNumber(db);
      // case + creation event + submission record commit together or not at all
      // (ZT-070), and the partial unique index decides a concurrent duplicate
      // for the same serial (ZT-068) — the check above is only the fast path.
      try {
      await db.transaction(async (tx) => {
        const created = await tx.insert(rmaRequest).values({
          number: rmaNumber!,
          productSku: d.sku ?? null,
          serial: d.serial ?? null,
          issue: d.issue,
          customer: { name: d.name, email: d.email, phone: d.phone ?? null, country: d.country ?? null, product: d.product, purchaseDate: registration.purchaseDate },
          warrantyTier: d.warrantyTier ?? null,
        }).returning({ id: rmaRequest.id });
        await tx.insert(rmaEvent).values({
          rmaId: created[0].id, fromStatus: 'submitted', toStatus: 'submitted',
          note: `RMA request received via website form. ${reviewNote}`,
        });
        const sub = await tx.insert(formSubmission).values({
          type, email, payload: { ...fullPayload, rmaNumber }, refCode, priority, dueAt,
          ip: ipOf(c), ua: c.req.header('user-agent') ?? null,
        }).returning({ id: formSubmission.id });
        submissionId = sub[0].id;
      });
      } catch (e) {
        if (String((e as { cause?: { code?: string } })?.cause?.code ?? (e as { code?: string })?.code) === '23505') {
          return c.json({ ...problem(409, 'An RMA is already open for this serial', `Track it with the number in your confirmation e-mail at ${site}/rma.`), code: 'RMA_OPEN' }, 409, { 'Content-Type': 'application/problem+json' });
        }
        throw e;
      }
      await sendCustomerConfirmation(
        d.email,
        `TwinMOS RMA ${rmaNumber} — request received`,
        `We received your RMA request for ${d.product}.\n\nYour RMA number: ${rmaNumber}\nTrack it any time at ${siteBaseUrl()}/rma with this number and this e-mail address.\n\nOur support team reviews requests within one business day and replies with shipping instructions.`,
        { number: rmaNumber },
      );
    }

    const rows = submissionId !== null ? [{ id: submissionId }] : await db.insert(formSubmission).values({
      type, email, payload: fullPayload, refCode,
      priority, dueAt,
      ip: ipOf(c), ua: c.req.header('user-agent') ?? null,
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
    if (idemKey) IDEMPOTENT.set(idemKey, { status: 201, body });
    return c.json(body, 201);
    } finally {
      if (idemKey) IN_FLIGHT.delete(idemKey);
    }
  });

  // Public RMA tracking (zero-trust audit ZT-025/026). Ownership proof is the RMA
  // number PLUS the e-mail the case was opened with, sent in a POST body so
  // neither lands in URLs or access logs. A wrong pair answers exactly like an
  // unknown number (no oracle). The timeline is the public projection only:
  // status steps and dates — staff replies and internal notes never leave the
  // console. Rate-limited with the rest of /api/v1/rma/* (app.ts).
  r.post('/rma/track', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const number = clean(body.number, 24).toUpperCase();
    const email = String(body.email ?? '').trim().toLowerCase();
    if (!/^(TM-)?RMA-\d{4}-\d{6}$/.test(number) || !EMAIL_RE.test(email)) {
      return c.json(problem(400, 'Invalid request', 'Enter the RMA number from your confirmation e-mail and the e-mail address you used.'), 400, { 'Content-Type': 'application/problem+json' });
    }
    const canonical = number.startsWith('TM-') ? number : 'TM-' + number;
    const found = await db.select({ id: rmaRequest.id, number: rmaRequest.number, status: rmaRequest.status, createdAt: rmaRequest.createdAt, customer: rmaRequest.customer, productSku: rmaRequest.productSku })
      .from(rmaRequest).where(eq(rmaRequest.number, canonical)).limit(1);
    const rma = found[0];
    const customer = (rma?.customer ?? {}) as Record<string, unknown>;
    if (!rma || String(customer.email ?? '').trim().toLowerCase() !== email) {
      return c.json(problem(404, 'RMA not found', 'No case matches that RMA number and e-mail address.'), 404, { 'Content-Type': 'application/problem+json' });
    }
    const events = await db.select({ from: rmaEvent.fromStatus, to: rmaEvent.toStatus, at: rmaEvent.at })
      .from(rmaEvent).where(eq(rmaEvent.rmaId, rma.id)).orderBy(asc(rmaEvent.at), asc(rmaEvent.id));
    // Creation event (submitted→submitted) plus real status changes; same-state
    // rows are staff annotations/replies and stay private.
    const timeline = events.filter((e, i) => i === 0 || e.from !== e.to);
    return c.json({
      number: rma.number, status: rma.status, createdAt: rma.createdAt,
      maskedInfo: { name: maskName(String(customer.name ?? '')), product: customer.product ?? rma.productSku ?? '' },
      timeline,
    }, 200, { 'Cache-Control': 'no-store' });
  });
  // The old number-only GET lookups exposed case data to anyone holding a number.
  const gone = (c: any) => c.json(problem(410, 'Gone', 'Use POST /api/v1/rma/track with the RMA number and your e-mail address.'), 410, { 'Content-Type': 'application/problem+json' });
  r.get('/rma/:number', gone);
  r.get('/forms/rma/:number', gone);

  return r;
}

function maskName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.map((p, i) => (i === 0 ? p : p[0] + '.')).join(' ');
}

export async function verifyTurnstile(token: string, ip: string | undefined): Promise<boolean> {
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
