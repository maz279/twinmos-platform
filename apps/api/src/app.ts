// App factory — builds the full Hono app against a given DB handle.
// Kept separate from index.ts (the server entry) so tests can boot the whole
// API in-process with an isolated PGlite instance via app.request().
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { problem } from '@twinmos/shared';
import { initAuth } from './auth.ts';
import { formsRoute } from './routes/forms.ts';
import { adminRoute } from './routes/admin.ts';
import { contentRoute, previewRoute, promoteScheduled } from './routes/content.ts';
import { mediaRoute } from './routes/media.ts';
import { settingsRoute } from './routes/settings.ts';
import type { DB } from '@twinmos/db';

export function buildApp(db: DB) {
  const { auth, requireRole, sessionFromRequest } = initAuth(db);
  const app = new Hono<{ Variables: { requestId: string } }>();

  if (process.env.NODE_ENV !== 'test') app.use(logger());
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

  // ---- public form rate limit: 5 requests / minute / IP (in-memory; Redis in prod) ----
  const FORM_BUCKETS = new Map<string, { count: number; resetAt: number }>();
  let bucketSweepAt = 0;
  app.use('/api/v1/forms/*', async (c, next) => {
    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'local';
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

  // ---- error envelope: RFC 9457 problem+json on every API error ----
  app.onError((err, c) => {
    console.error('[api]', err);
    return c.json(problem(500, 'Internal Server Error', 'Unexpected — see server logs (request id in header).'), 500, { 'Content-Type': 'application/problem+json' });
  });
  app.notFound((c) => c.json(problem(404, 'Not Found'), 404, { 'Content-Type': 'application/problem+json' }));

  app.get('/api/v1/health', (c) => c.json({ status: 'ok', service: 'twinmos-api', version: '0.3.0', db: 'connected' }));
  app.all('/api/v1/auth/*', (c) => auth.handler(c.req.raw));
  app.route('/api/v1', formsRoute(db));
  app.route('/api/v1', previewRoute(db)); // public, token-gated draft previews
  app.route('/api/v1/admin', adminRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', contentRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', mediaRoute(db, { requireRole, sessionFromRequest }));
  app.route('/api/v1/admin', settingsRoute(db, { requireRole, sessionFromRequest }));

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
