// Public consent route — Records GDPR/ePrivacy user consent choices (T6.3.2 / CONSENT-01).
// Each user choice records a random ID, ISO timestamp, policy version, and granular choices.
import { Hono } from 'hono';
import { problem } from '@twinmos/shared';
import { auditLog } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { Context } from 'hono';

const P = 'application/problem+json';

export interface ConsentChoices {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface ConsentRecordPayload {
  id?: string;
  /** Legacy client field name for id — normalised on read. */
  consentId?: string;
  timestamp?: string;
  policyVersion?: string;
  choices?: Partial<ConsentChoices>;
}

export function consentRoute(db: DB, getClientIp?: (c: Context) => string) {
  const r = new Hono();

  // POST /api/v1/consent — Store visitor consent choices
  r.post('/', async (c) => {
    let body: ConsentRecordPayload;
    try {
      body = await c.req.json();
    } catch {
      return c.json(problem(400, 'Bad Request', 'Invalid JSON body in consent submission'), 400, { 'Content-Type': P });
    }

    if (!body || typeof body !== 'object') {
      return c.json(problem(400, 'Bad Request', 'Consent payload must be an object'), 400, { 'Content-Type': P });
    }

    if (!body.choices || typeof body.choices !== 'object') {
      return c.json(problem(400, 'Bad Request', 'Missing required choices object in consent submission'), 400, { 'Content-Type': P });
    }

    const consentId = String(body.id || body.consentId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`)).slice(0, 100);
    const policyVersion = String(body.policyVersion || '2026.1').slice(0, 20);
    const timestamp = body.timestamp && !isNaN(Date.parse(body.timestamp)) ? new Date(body.timestamp).toISOString() : new Date().toISOString();

    const rawChoices = body.choices || {};
    const choices: ConsentChoices = {
      essential: true, // Strictly necessary cookies are mandatory and locked
      analytics: Boolean(rawChoices.analytics),
      marketing: Boolean(rawChoices.marketing),
      preferences: Boolean(rawChoices.preferences),
    };

    const ip = getClientIp ? getClientIp(c) : (c.req.header('x-real-ip') || 'unknown');
    const userAgent = c.req.header('user-agent') || 'unknown';

    try {
      await db.insert(auditLog).values({
        actorId: null,
        entity: 'consent',
        entityId: consentId,
        action: 'privacy.consent',
        // audit_log carries a single jsonb `diff` column; the after-state IS
        // the record here (nothing existed before this consent event).
        diff: {
          timestamp,
          policyVersion,
          choices,
          ip,
          userAgent,
        },
      });

      return c.json({
        ok: true,
        success: true,
        id: consentId,
        consentId,
        policyVersion,
        choices,
        recordedAt: timestamp,
      }, 201);
    } catch (err: any) {
      console.error('[consent] Failed to write consent record:', err);
      return c.json(problem(500, 'Internal Server Error', 'Could not record consent choice'), 500, { 'Content-Type': P });
    }
  });

  // GET /api/v1/consent/health — Ping endpoint for automated tests & uptime monitoring
  r.get('/health', (c) => {
    return c.json({ status: 'ok', service: 'consent-record-collector', version: '2026.1' });
  });

  return r;
}
