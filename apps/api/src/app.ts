// App factory — builds the full Hono app against a given DB handle.
// Kept separate from index.ts (the server entry) so tests can boot the whole
// API in-process with an isolated PGlite instance via app.request().
import { Hono } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'drizzle-orm';
import { problem } from '@twinmos/shared';
import { initAuth } from './auth.ts';
import { formsRoute } from './routes/forms.ts';
import { adminRoute } from './routes/admin.ts';
import { analyticsRoute } from './routes/analytics.ts';
import { usersRoute } from './routes/users.ts';
import { contentRoute, previewRoute, promoteScheduled } from './routes/content.ts';
import { mediaRoute, publicMediaRoute } from './routes/media.ts';
import { settingsRoute } from './routes/settings.ts';
import { translationsRoute, i18nPublicRoute } from './routes/translations.ts';
import { partnerRoute, partnerAdminRoute } from './routes/partner.ts';
import { snCheckRoute, snReportRoute, serialAdminRoute } from './routes/sncheck.ts';
import { navigationRoute } from './routes/navigation.ts';
import { entitiesRoute } from './routes/entities.ts';
import { privacyRoute } from './routes/privacy.ts';
import { makeDeliveryRouter } from './routes/delivery/index.ts';
import { dispatchOutbox } from './services/outbox.ts';
import { alertManager } from './services/alerts.ts';
import { sendMail } from './mailer.ts';
import { auditLog, user } from '@twinmos/db';
import { eq } from 'drizzle-orm';
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
/**
 * Real client IP resolution (T2.5.2 / S-10 / Z-28).
 * When TRUST_PROXY=1 (behind edge reverse proxy), trusts ONLY the validated
 * `x-real-ip` header written by nginx from trusted Cloudflare CIDRs.
 * Drops all `cf-connecting-ip` and `x-forwarded-for` fallbacks so forged headers
 * can never spoof the client key.
 * In untrusted environments (TRUST_PROXY !== '1'), strictly uses TCP socket remote address.
 */
export function clientIp(c: Context): string {
  if (process.env.TRUST_PROXY === '1') {
    return c.req.header('x-real-ip') ?? 'local';
  }
  const addr = (c.env as { incoming?: { socket?: { remoteAddress?: string } } })?.incoming?.socket?.remoteAddress;
  return addr ?? 'unknown';
}

/**
 * P7: audit-log retention (docs/02 §audit — 12 months). Boot sweep + daily
 * interval; unref'd so the timer never holds the process open (tests, scripts).
 * NF-09: audit_log table timestamp column is created_at (not at).
 */
function startAuditRetention(db: DB): void {
  if (process.env.AUDIT_RETENTION_DISABLED === '1') return;
  const RETAIN_DAYS = Number(process.env.AUDIT_RETENTION_DAYS ?? 365);
  const sweep = async () => {
    try {
      const res = await db.execute(sql`DELETE FROM audit_log WHERE created_at < now() - (${RETAIN_DAYS} || ' days')::interval`);
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
  const allowedOrigins = (process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // NF-33 / A8: Run cors() only for allow-listed origins so disallowed origins get neither ACAO nor ACAC.
  app.use('/api/v1/*', async (c, next) => {
    const reqOrigin = c.req.header('origin');
    if (!reqOrigin || !allowedOrigins.includes(reqOrigin)) {
      return next();
    }
    return cors({
      origin: reqOrigin,
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Idempotency-Key'],
      credentials: true,
      maxAge: 600,
    })(c, next);
  });
  app.use('*', async (c, next) => {
    const requestId = crypto.randomUUID();
    c.set('requestId', requestId);
    c.header('X-Request-Id', requestId);
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    alertManager.recordRequest(c.res.status, duration);
  });

  // Tiered body limit middleware (NF-18, NEW-05, V-14, T2.5.5, Z-32)
  // Ensures 3-layer tier agreement: nginx cap >= API tier >= handler limit.
  // Handler limits: media 10 MB, serials 10 MB, partner assets 25 MB.
  // API tiers provide headroom for multipart boundaries & headers.
  app.use('/api/v1/*', async (c, next) => {
    const p = c.req.path;
    let maxSize = 256 * 1024; // 256 KB default
    if (p.startsWith('/api/v1/admin/media') || p.startsWith('/api/v1/admin/serials/import')) {
      maxSize = 12 * 1024 * 1024; // 12 MB (handler 10 MB + multipart/CSV overhead; nginx cap 15 MB)
    } else if (p.startsWith('/api/v1/admin/partner-orgs/') && p.endsWith('/assets')) {
      maxSize = 28 * 1024 * 1024; // 28 MB (handler 25 MB + multipart overhead; nginx cap 30 MB)
    } else if (p.startsWith('/api/v1/auth')) {
      maxSize = 64 * 1024; // 64 KB auth (nginx cap 1 MB)
    }

    return bodyLimit({
      maxSize,
      onError: (ctx) => ctx.json(
        problem(413, 'Payload Too Large', `Request body exceeds size limit of ${Math.round(maxSize / 1024)} KB.`),
        413,
        { 'Content-Type': 'application/problem+json' },
      ),
    })(c, next);
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


  // Reject non-JSON content types on /api/v1/auth/* POST routes (415) to eliminate lockout bypass
  app.post('/api/v1/auth/*', async (c, next) => {
    const contentType = c.req.header('content-type') || '';
    if (!contentType.includes('application/json')) {
      return c.json(
        problem(415, 'Unsupported Media Type', 'Content-Type must be application/json'),
        415,
        { 'Content-Type': 'application/problem+json' }
      );
    }
    return next();
  });

  // ---- Sign-in rate limit: 3-5 requests / minute / client IP (S-09, S-10, T2.5.3, T2.5.4) ----
  const SIGNIN_BUCKETS = new Map<string, { count: number; resetAt: number }>();
  app.use('/api/v1/auth/sign-in/*', async (c, next) => {
    const ip = clientIp(c);
    const now = Date.now();
    if (now > bucketSweepAt) {
      bucketSweepAt = now + 60_000;
      for (const [k, v] of SIGNIN_BUCKETS) {
        if (v.resetAt < now) SIGNIN_BUCKETS.delete(k);
      }
    }
    const limit = Number(process.env.AUTH_SIGNIN_LIMIT ?? 3);
    const bucket = SIGNIN_BUCKETS.get(ip);
    if (!bucket || bucket.resetAt < now) {
      SIGNIN_BUCKETS.set(ip, { count: 1, resetAt: now + 60_000 });
      await next();
      if (c.res?.status === 200) {
        SIGNIN_BUCKETS.delete(ip);
      }
      return;
    }
    bucket.count += 1;
    if (bucket.count > limit) {
      const waitSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      c.header('Retry-After', String(waitSec));
      return c.json(
        problem(429, 'Too Many Requests', `Sign-in limit exceeded. Limit is ${limit} attempts per minute.`),
        429,
        { 'Content-Type': 'application/problem+json' }
      );
    }
    await next();
    if (c.res?.status === 200) {
      SIGNIN_BUCKETS.delete(ip);
    }
  });

  // ---- error envelope: RFC 9457 problem+json on every API error ----
  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      const res = err.getResponse();
      if (res.headers.get('content-type')?.includes('application/problem+json')) {
        return res;
      }
      return c.json(
        problem(err.status, err.message || (err.status === 413 ? 'Payload Too Large' : 'HTTP Error')),
        err.status,
        { 'Content-Type': 'application/problem+json' }
      );
    }
    console.error('[api]', err);
    return c.json(problem(500, 'Internal Server Error', 'Unexpected — see server logs (request id in header).'), 500, { 'Content-Type': 'application/problem+json' });
  });
  app.notFound((c) => c.json(problem(404, 'Not Found'), 404, { 'Content-Type': 'application/problem+json' }));

  // P0.2 truthful health: ping the database for real. The canned
  // "db: connected" once masked a corrupted PGlite store (incident
  // 2026-10-06) — health must degrade loudly (503) when the DB is unreachable.
  app.get('/api/v1/health', async (c) => {
    try {
      await db.execute(sql`select 1`);
      return c.json({ status: 'ok', service: 'twinmos-api', version: '0.3.0', db: 'connected' });
    } catch {
      return c.json(
        { status: 'degraded', service: 'twinmos-api', version: '0.3.0', db: 'unreachable' },
        503,
      );
    }
  });

  // Task F2 / OBS-01: Deep health inspection with component diagnostics & latency
  app.get('/api/v1/health/deep', async (c) => {
    // Security (Roadmap R0.3 / Z-29 / P7): require viewer+ session or internal secret, else 401
    const internalSecret = c.req.header('x-internal-secret');
    let isInternal = false;
    const internalExpected = process.env.REVALIDATE_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-revalidate-secret' : undefined);
    if (internalSecret && internalExpected) {
      const provBuf = Buffer.from(internalSecret, 'utf8');
      const expBuf = Buffer.from(internalExpected, 'utf8');
      if (provBuf.length === expBuf.length && timingSafeEqual(provBuf, expBuf)) {
        isInternal = true;
      }
    }

    if (!isInternal) {
      const sess = await sessionFromRequest(c.req.raw);
      if (!sess?.user || !['super_admin', 'admin', 'editor', 'author', 'viewer'].includes(sess.user.role)) {
        return c.json(problem(401, 'Unauthorized', 'Viewer+ session required'), 401, {
          'Content-Type': 'application/problem+json',
        });
      }
    }

    const t0 = Date.now();
    let dbStatus = 'connected';
    let dbLatencyMs = 0;
    let outboxQueueDepth = 0;
    try {
      await db.execute(sql`select 1`);
      dbLatencyMs = Date.now() - t0;
    } catch {
      dbStatus = 'unreachable';
    }

    try {
      const outboxRes: any = await db.execute(sql`SELECT count(*)::int as cnt FROM outbox WHERE processed_at IS NULL`);
      const rows = Array.isArray(outboxRes) ? outboxRes : (outboxRes?.rows ?? []);
      outboxQueueDepth = Number(rows[0]?.cnt ?? 0);
    } catch {
      // Outbox query optional if table uninitialized in non-outbox tests
    }

    const metrics = alertManager.getMetrics();
    const firingAlerts = alertManager.getFiringCount();
    // Roadmap R0.3: never degrade health on alert count
    const isDegraded = dbStatus !== 'connected';

    return c.json({
      status: isDegraded ? 'degraded' : 'ok',
      service: 'twinmos-api',
      version: '0.3.0',
      uptimeSec: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      components: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
        outbox: { status: outboxQueueDepth > 100 ? 'backlogged' : 'healthy', pendingCount: outboxQueueDepth },
        alerts: { firingCount: firingAlerts, metrics },
      },
    }, isDegraded ? 503 : 200);
  });

  // Per-account login lockout guard (T2.4.5 / S-06 / LOCK-CT / A4a):
  // Tracks consecutive failed login attempts by email address in PostgreSQL (`failed_login_count`,
  // `locked_until` on `user` table), surviving API process restarts. Non-existent accounts fall back
  // to in-memory tracking to throttle enumeration without DB write amplification.
  const MEMORY_LOGIN_FAILURES = new Map<string, { count: number; lockedUntil: number }>();


  app.post('/api/v1/auth/sign-in/email', async (c) => {
    let email = '';
    try {
      const cloned = c.req.raw.clone();
      const body = await cloned.json();
      if (typeof body?.email === 'string') email = body.email.toLowerCase().trim();
    } catch { /* proceed */ }

    const now = Date.now();
    let dbUser: { id: string; emailVerified: boolean; failedLoginCount: number; lockedUntil: Date | null } | undefined;
    if (email) {
      try {
        const rows = await db.select({
          id: user.id,
          emailVerified: user.emailVerified,
          failedLoginCount: user.failedLoginCount,
          lockedUntil: user.lockedUntil,
        }).from(user).where(eq(sql`lower(${user.email})`, email)).limit(1);
        dbUser = rows[0];
      } catch (err) {
        console.warn('[auth.lockout] DB lookup error:', err);
      }

      const isDbLocked = dbUser?.lockedUntil && dbUser.lockedUntil.getTime() > now;
      const memRec = MEMORY_LOGIN_FAILURES.get(email);
      const isMemLocked = memRec && memRec.lockedUntil > now;

      if (isDbLocked || isMemLocked) {
        const lockExpiry = isDbLocked ? dbUser!.lockedUntil!.getTime() : memRec!.lockedUntil;
        const waitSec = Math.max(1, Math.ceil((lockExpiry - now) / 1000));
        c.header('Retry-After', String(waitSec));
        return c.json(
          problem(401, 'Account Locked', 'Account is temporarily locked due to too many failed attempts. Try again later.'),
          401,
          { 'Content-Type': 'application/problem+json' }
        );
      }
    }

    const res = await auth.handler(c.req.raw);
    if (email) {
      if (res.status === 200) {
        // Successful sign-in: reset failure count and lockout in DB and memory
        if (dbUser && (dbUser.failedLoginCount > 0 || dbUser.lockedUntil !== null)) {
          try {
            await db.update(user).set({
              failedLoginCount: 0,
              lockedUntil: null,
              updatedAt: new Date(),
            }).where(eq(user.id, dbUser.id));
          } catch { /* non-fatal */ }
        }
        MEMORY_LOGIN_FAILURES.delete(email);

        // Security (Roadmap MS2.4 / T2.4.1 / S-05): unverified sign-in rejection
        const requireEmailVerification = process.env.NODE_ENV === 'production' || process.env.REQUIRE_EMAIL_VERIFICATION === '1';
        if (requireEmailVerification && dbUser && !dbUser.emailVerified) {
          return c.json(
            {
              ...problem(403, 'Email Not Verified', 'Your email address has not been verified. Please check your inbox for the verification link.'),
              code: 'EMAIL_NOT_VERIFIED',
            },
            403,
            { 'Content-Type': 'application/problem+json' }
          );
        }
      } else if (res.status === 401) {
        if (dbUser) {
          const newCount = (dbUser.failedLoginCount ?? 0) + 1;
          let newLockedUntil: Date | null = null;
          if (newCount >= 5) {
            newLockedUntil = new Date(now + 15 * 60_000);
            console.warn(`[auth] Account locked for ${email} after ${newCount} failed attempts (persisted to DB)`);
            alertManager.recordLockout(email, clientIp(c), newCount);
          }
          try {
            await db.update(user).set({
              failedLoginCount: newCount,
              lockedUntil: newLockedUntil,
              updatedAt: new Date(),
            }).where(eq(user.id, dbUser.id));
          } catch (err) {
            console.warn('[auth.lockout] DB update error:', err);
          }
        } else {
          const mem = MEMORY_LOGIN_FAILURES.get(email) ?? { count: 0, lockedUntil: 0 };
          mem.count += 1;
          if (mem.count >= 5) {
            mem.lockedUntil = now + 15 * 60_000;
            console.warn(`[auth] Non-existent account locked for ${email} after 5 failed attempts`);
            alertManager.recordLockout(email, clientIp(c), mem.count);
          }
          MEMORY_LOGIN_FAILURES.set(email, mem);
        }
      }
    }
    return res;
  });

  // Password reset bridge: maps /forget-password to Better Auth /request-password-reset
  app.post('/api/v1/auth/forget-password', async (c) => {
    let bodyJson: any = {};
    try {
      bodyJson = await c.req.raw.clone().json();
    } catch { /* empty */ }
    const email = bodyJson?.email ?? '';
    const redirectTo = bodyJson?.redirectTo ?? '';
    const origin = (process.env.BETTER_AUTH_URL ?? 'http://127.0.0.1:8787').replace(/\/$/, '');
    const resetReq = new Request(`${origin}/api/v1/auth/request-password-reset`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(c.req.header('x-real-ip') ? { 'x-real-ip': c.req.header('x-real-ip')! } : {}),
      },
      body: JSON.stringify({ email, redirectTo }),
    });
    return auth.handler(resetReq);
  });

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
  app.route('/api/v1/delivery', makeDeliveryRouter(db, sessionFromRequest)); // Phase B Task B3 Delivery API
  // ---- P1.4: forced password rotation guard + member role restriction ------
  // Accounts invited with a system-generated temporary credential are refused
  // by every /admin route until they set their own password.
  // Furthermore, role 'member' (e.g. partner portal users) is blocked from all
  // /admin routes (must have role viewer or above).
  // Registered BEFORE any /admin router mounts (Hono runs handlers in registration
  // order) so no admin handler can respond ahead of the gate.
  // Allowlisted: the two me/password endpoints that power the rotation screen.
  app.use('/api/v1/admin/*', async (c, next) => {
    const p = c.req.path;
    if (p === '/api/v1/admin/users/me/password-state' || p === '/api/v1/admin/users/me/accept-password') return next();
    const s = await sessionFromRequest(c.req.raw);
    if (!s) return next(); // unauthenticated — each router enforces its own 401
    if (!(await requireRole('viewer')(c.req.raw))) {
      return c.json(
        problem(403, 'Forbidden', 'Console access requires staff credentials (viewer or above).'),
        403,
        { 'Content-Type': 'application/problem+json' },
      );
    }
    const row = (await db.select({ f: user.mustChangePassword, mfa: user.twoFactorEnabled }).from(user).where(eq(user.id, s.user.id)).limit(1))[0];
    if (row?.f) {
      return c.json(
        problem(403, 'Password change required', 'This account was invited with a temporary password — set a new password before using the console.'),
        403,
        { 'Content-Type': 'application/problem+json' },
      );
    }
    // S-07 / T2.4.6 / A4a: MFA enforcement on all /admin routes (including GET) for editor and above
    const enforceMfa = process.env.NODE_ENV === 'production' || process.env.ENFORCE_MFA !== '0';
    if (enforceMfa) {
      if (!row?.mfa && ['super_admin', 'admin', 'editor'].includes(s.user.role)) {
        return c.json(
          {
            ...problem(403, 'MFA Enrollment Required', 'Two-factor authentication must be enrolled before accessing the administrative console.'),
            code: 'MFA_REQUIRED',
          },
          403,
          { 'Content-Type': 'application/problem+json' }
        );
      }
    }
    return next();
  });
  app.route('/api/v1/admin', adminRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', analyticsRoute(db, { requireRole, sessionFromRequest })); // Phase 7.1 dashboards
  app.route('/api/v1/admin', usersRoute(db, { requireRole, sessionFromRequest, auth }));
  app.route('/api/v1/admin', contentRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', mediaRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', settingsRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', navigationRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', entitiesRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', translationsRoute(db, { requireRole, sessionFromRequest })); // P4
  app.route('/api/v1/admin/privacy', privacyRoute(db, { requireRole, sessionFromRequest })); // Phase E DSAR & Retention Operations
  app.route('/api/v1', i18nPublicRoute(db)); // public i18n bundles (P4)
  app.route('/api/v1', publicMediaRoute(db)); // P8 imagery bridge — public read-only product imagery
  app.route('/api/v1', partnerRoute(db, { requireRole, sessionFromRequest })); // P5 portal (member)
  app.route('/api/v1/admin', partnerAdminRoute(db, { requireRole, sessionFromRequest, auth })); // P5 portal (admin)
  app.route('/api/v1', snCheckRoute(db)); // P5 public anti-counterfeit check
  app.route('/api/v1/admin', snReportRoute(db, { requireRole, sessionFromRequest })); // P5 reporting
  // Phase 5.3: serial registry management — batch CSV ingest, search and the
  // >5-distinct-IPs/24h counterfeit anomaly scan. Ops alert recipient comes
  // from env (SERIAL_ALERT_TO, falling back to FORMS_TO) — never a literal.
  app.route('/api/v1/admin', serialAdminRoute(db, { requireRole, sessionFromRequest }, {
    sendOpsAlert: async (subject, text) => {
      const to = process.env.SERIAL_ALERT_TO ?? process.env.FORMS_TO;
      if (!to) return false;
      return sendMail({ to, subject, text, meta: { kind: 'serial-anomaly' } });
    },
  }));

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

  // Outbox revalidation dispatch endpoint (Phase B Task B7)
  app.post('/api/v1/admin/cron/dispatch-outbox', async (c) => {
    const s = await sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': 'application/problem+json' });
    if (!(await requireRole('editor')(c.req.raw))) {
      return c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': 'application/problem+json' });
    }
    const result = await dispatchOutbox(db);
    return c.json(result);
  });

  // Task F2 / OBS-01: Admin Alert Management endpoints
  app.get('/api/v1/admin/alerts', async (c) => {
    const s = await sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': 'application/problem+json' });
    if (!(await requireRole('viewer')(c.req.raw))) {
      return c.json(problem(403, 'Forbidden', 'Requires viewer or above'), 403, { 'Content-Type': 'application/problem+json' });
    }
    return c.json({
      alerts: alertManager.getAlerts(),
      summary: alertManager.getSummary(),
    });
  });

  app.post('/api/v1/admin/alerts/test', async (c) => {
    const s = await sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': 'application/problem+json' });
    if (!(await requireRole('admin')(c.req.raw))) {
      return c.json(problem(403, 'Forbidden', 'Requires admin role'), 403, { 'Content-Type': 'application/problem+json' });
    }
    const alert = alertManager.recordAlert('manual.test', 'Manual Ops Alert Test', 'Verification ping from admin console', 'info', { triggeredBy: s.user.email });
    return c.json({ triggered: true, alert });
  });

  app.post('/api/v1/admin/alerts/:id/resolve', async (c) => {
    const s = await sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': 'application/problem+json' });
    if (!(await requireRole('admin')(c.req.raw))) {
      return c.json(problem(403, 'Forbidden', 'Requires admin role'), 403, { 'Content-Type': 'application/problem+json' });
    }
    const id = c.req.param('id');
    const resolved = alertManager.resolveAlert(id);
    return c.json({ resolved, id });
  });

  return app;
}

