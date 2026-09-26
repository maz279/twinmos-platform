// Public form intake — Zod-validated, Turnstile-gated, stored via parameter-bound Drizzle queries.
// P2 workstream: notification email (Resend) is wired in Phase 2 — see docs/00-MASTER-PLAN.md §4.2.
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { formSubmissionSchema, problem } from '@twinmos/shared';
import { formSubmission, rmaEvent, rmaRequest } from '@twinmos/db';
import type { DB } from '@twinmos/db';

const SAFE_CHARS = /[^A-Za-z0-9 @_.,:+\-()/#]/g;
function clean(value, max = 200) {
  return String(value ?? '').replace(SAFE_CHARS, '').slice(0, max);
}

export function formsRoute(db: DB) {
  const r = new Hono();

  r.post('/forms/:type', async (c) => {
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

    const refCode = 'FRM-' + new Date().getFullYear() + '-' + crypto.randomUUID().slice(0, 8);
    const rows = await db.insert(formSubmission).values({
      type, email, payload: { ...payload, ...(name ? { name } : {}) }, refCode,
      ip: c.req.header('cf-connecting-ip') ?? null, ua: c.req.header('user-agent') ?? null,
    }).returning({ id: formSubmission.id });

    return c.json({ id: rows[0].id, reference: refCode }, 201);
  });

  r.get('/rma/:number', async (c) => {
    const number = clean(c.req.param('number'), 24).toUpperCase();
    if (!/^(TM-)?RMA-\d{4}-\d{3,8}$/.test(number)) {
      return c.json(problem(400, 'Invalid RMA number format'), 400, { 'Content-Type': 'application/problem+json' });
    }
    const found = await db.select({ id: rmaRequest.id, number: rmaRequest.number, status: rmaRequest.status, createdAt: rmaRequest.createdAt })
      .from(rmaRequest).where(eq(rmaRequest.number, number)).limit(1);
    const rma = found[0];
    if (!rma) return c.json(problem(404, 'RMA not found'), 404, { 'Content-Type': 'application/problem+json' });
    const events = await db.select({ from: rmaEvent.fromStatus, to: rmaEvent.toStatus, at: rmaEvent.at })
      .from(rmaEvent).where(eq(rmaEvent.rmaId, rma.id));
    return c.json({ number: rma.number, status: rma.status, createdAt: rma.createdAt, timeline: events });
  });

  return r;
}

async function verifyTurnstile(token, ip) {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip ?? undefined }),
    });
    return (await res.json()).success === true;
  } catch { return false; }
}
