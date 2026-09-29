// App factory — builds the full Hono app against a given DB handle.
// Kept separate from index.ts (the server entry) so tests can boot the whole
// API in-process with an isolated PGlite instance via app.request().
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { sql } from 'drizzle-orm';
import { problem } from '@twinmos/shared';
import { initAuth } from './auth.ts';
import { formsRoute } from './routes/forms.ts';
import { adminRoute } from './routes/admin.ts';
import { usersRoute } from './routes/users.ts';
import { contentRoute, previewRoute, promoteScheduled } from './routes/content.ts';
import { mediaRoute } from './routes/media.ts';
import { settingsRoute } from './routes/settings.ts';
import { translationsRoute, i18nPublicRoute } from './routes/translations.ts';
import { partnerRoute, partnerAdminRoute } from './routes/partner.ts';
import { snCheckRoute, snReportRoute } from './routes/sncheck.ts';
import { auditLog } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { Context } from 'hono';

/**
 * P7: client IP for rate limiting. Forwarded headers (cf-connecting-ip /
 * x-forwarded-for) are only trustworthy when traffic can ONLY arrive via the
 * proxy that sets them — trusting them blindly lets a client rotate the header
 * to dodge every bucket. Rule: header trust requires TRUST_PROXY=1 (set it in
 * dev/test/behind-Cloudflare staging+prod); in production WITHOUT the flag we
 * fall back to the socket address, and tests keep working because they run
 * with TRUST_PROXY=1 (see p*-*.e2e.test.ts env blocks).
 */
export function clientIp(c: Context): string {
  const trustHeader = process.env.TRUST_PROXY === '1' || process.env.NODE_ENV !== 'production';
  if (trustHeader) {
    return c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'local';
  }
  const addr = (c.env as { incoming?: { socket?: { remoteAddress?: string } } })?.incoming?.socket?.remoteAddress;
  return addr ?? 'unknown';
}

/**
 * P7: audit-log retention (docs/02 §audit — 12 months). Boot sweep + daily
 * interval; unref'd so the timer never holds the process open (tests, scripts).
 */
function startAuditRetention(db: DB): void {
  if (process.env.AUDIT_RETENTION_DISABLED === '1') return;
  const RETAIN_DAYS = Number(process.env.AUDIT_RETENTION_DAYS ?? 365);
  const sweep = async () => {
    try {
      const res = await db.execute(sql`DELETE FROM audit_log WHERE at < now() - (${RETAIN_DAYS} || ' days')::interval`);
      const n = (res as unknown as { rowCount?: number })?.rowCount ?? 0;
      if (n > 0) console.log(`[audit-retention] removed ${n} rows older than ${RETAIN_DAYS}d`);
    } catch { /* retention must never take the API down */ }
  };
  void sweep();
  const t = setInterval(sweep, 24 * 3600_000);
  t.unref?.();
}

export function buildApp(db: DB) {
  const { auth, requireRole, sessionFromRequest } = initAuth(db);
  const app = new Hono<{ Variables: { requestId: string } }>();

  if (process.env.NODE_ENV !== 'test') app.use(logger());
  // ---- P7: security headers on every API response (OWASP secure-headers) ----
  app.use('*', async (c, next) => {
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    // API responses are JSON — a locked-down CSP also neutralises any future
    // HTML echo; frame-ancestors blocks clickjacking of any error pages.
    c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    // HSTS only when we know we're behind TLS (prod behind Cloudflare/nginx).
    if (process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production') {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    await next();
  });
  // CORS for the admin SPA and the website in local dev (ports differ). In
  // production both are served same-origin by the API host; set ALLOWED_ORIGIN
  // to the public origins only.
  app.use('/api/v1/*', cors({
    origin: (process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173').split(','),
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Idempotency-Key'],
    credentials: true,
    maxAge: 600,
  }));
  app.use('*', async (c, next) => {
    const requestId = crypto.randomUUID();
    c.set('requestId', requestId);
    c.header('X-Request-Id', requestId);
    await next();
  });
  startAuditRetention(db);

  // ---- public form rate limit: 5 requests / minute / IP (in-memory; Redis in prod) ----
  const FORM_BUCKETS = new Map<string, { count: number; resetAt: number }>();
  let bucketSweepAt = 0;
  app.use('/api/v1/forms/*', async (c, next) => {
    const ip = clientIp(c);
    const now = Date.now();
    // periodic sweep: IPs that never return must not accumulate forever
    if (now > bucketSweepAt) {
      bucketSweepAt = now + 60_000;
      for (const [k, v] of FORM_BUCKETS) {
        if (v.resetAt < now) FORM_BUCKETS.delete(k);
      }
    }
    const bucket = FORM_BUCKETS.get(ip);
    if (!bucket || bucket.resetAt < now) {
      FORM_BUCKETS.set(ip, { count: 1, resetAt: now + 60_000 });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > 5) {
      c.header('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return c.json(problem(429, 'Too Many Requests', 'Limit is 5 submissions per minute.'), 429, { 'Content-Type': 'application/problem+json' });
    }
    return next();
  });

  // ---- P5 SN-check rate limit: 10/min/IP (sweeping shared with forms buckets) ----
  app.use('/api/v1/sn-check', async (c, next) => {
    const ip = clientIp(c);
    const now = Date.now();
    if (now > bucketSweepAt) {
      bucketSweepAt = now + 60_000;
      for (const [k, v] of FORM_BUCKETS) {
        if (v.resetAt < now) FORM_BUCKETS.delete(k);
      }
    }
    const key = 'sn:' + ip;
    const bucket = FORM_BUCKETS.get(key);
    if (!bucket || bucket.resetAt < now) {
      FORM_BUCKETS.set(key, { count: 1, resetAt: now + 60_000 });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > 10) {
      c.header('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return c.json(problem(429, 'Too Many Requests', 'Limit is 10 serial checks per minute.'), 429, { 'Content-Type': 'application/problem+json' });
    }
    return next();
  });

  // ---- error envelope: RFC 9457 problem+json on every API error ----
  app.onError((err, c) => {
    console.error('[api]', err);
    return c.json(problem(500, 'Internal Server Error', 'Unexpected — see server logs (request id in header).'), 500, { 'Content-Type': 'application/problem+json' });
  });
  app.notFound((c) => c.json(problem(404, 'Not Found'), 404, { 'Content-Type': 'application/problem+json' }));

  app.get('/api/v1/health', (c) => c.json({ status: 'ok', service: 'twinmos-api', version: '0.3.0', db: 'connected' }));
  app.all('/api/v1/auth/*', (c) => auth.handler(c.req.raw));

  // ---- dev-only auto-login (operator convenience during console iteration) ----
  // Opens a REAL staff session for the seed admin so the console loads straight
  // in during development. Triple-guarded: requires API_DEV_AUTOLOGIN=1, refuses
  // when NODE_ENV=production regardless of the flag, and needs the password from
  // SEED_ADMIN_PASSWORD (no credential fallback in source). It replays the normal
  // sign-in handler, so sessions/cookies/audit behave exactly like a manual login.
  app.post('/api/v1/dev/session', async (c) => {
    if (process.env.NODE_ENV === 'production') {
      return c.json(problem(403, 'Forbidden', 'Dev auto-login can never run in production.'), 403, { 'Content-Type': 'application/problem+json' });
    }
    if (process.env.API_DEV_AUTOLOGIN !== '1') {
      return c.json(problem(404, 'Not Found', 'Dev auto-login is disabled (set API_DEV_AUTOLOGIN=1 in dev only).'), 404, { 'Content-Type': 'application/problem+json' });
    }
    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@twinmos.dev';
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!password) {
      return c.json(problem(404, 'Not Found', 'SEED_ADMIN_PASSWORD is not set — dev auto-login needs it from the environment.'), 404, { 'Content-Type': 'application/problem+json' });
    }
    const origin = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)[0] ?? 'http://localhost:5174';
    const signIn = await auth.handler(new Request(origin + '/api/v1/auth/sign-in/email', {
      method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ email, password }),
    }));
    return new Response(signIn.body, { status: signIn.status, headers: signIn.headers });
  });

  app.route('/api/v1', formsRoute(db));
  app.route('/api/v1', previewRoute(db)); // public, token-gated draft previews
  app.route('/api/v1/admin', adminRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', usersRoute(db, { requireRole, sessionFromRequest, auth }));
  app.route('/api/v1/admin', contentRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', mediaRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', settingsRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', translationsRoute(db, { requireRole, sessionFromRequest })); // P4
  app.route('/api/v1', i18nPublicRoute(db)); // public i18n bundles (P4)
  app.route('/api/v1', partnerRoute(db, { requireRole, sessionFromRequest })); // P5 portal (member)
  app.route('/api/v1/admin', partnerAdminRoute(db, { requireRole, sessionFromRequest })); // P5 portal (admin)
  app.route('/api/v1', snCheckRoute(db)); // P5 public anti-counterfeit check
  app.route('/api/v1/admin', snReportRoute(db, { requireRole, sessionFromRequest })); // P5 reporting

  // Manual trigger for external cron (production); the in-process scheduler
  // lives in index.ts so tests never inherit an interval.
  app.post('/api/v1/admin/cron/publish-due', async (c) => {
    const s = await sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': 'application/problem+json' });
    if (!(await requireRole('admin')(c.req.raw))) {
      return c.json(problem(403, 'Requires admin role or above'), 403, { 'Content-Type': 'application/problem+json' });
    }
    const promoted = await promoteScheduled(db, 'cron');
    return c.json({ promoted });
  });

  return app;
}
