import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { createDb } from '@twinmos/db';
import { auth, requireRole, sessionFromRequest } from './auth.ts';
import { formsRoute } from './routes/forms.ts';
import { adminRoute } from './routes/admin.ts';
import { problem } from '@twinmos/shared';

const db = createDb();
const app = new Hono();

app.use(logger());
// CORS for the admin SPA in local dev (ports differ). In production, admin is served
// same-origin by the API host, so set ALLOWED_ORIGIN to the public site only.
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

// ---- public form rate limit: 5 requests / minute / IP (in-memory; P2 moves to Redis) ----
const FORM_BUCKETS = new Map<string, { count: number; resetAt: number }>();
app.use('/api/v1/forms/*', async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'local';
  const now = Date.now();
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
  return c.json(problem(500, 'Internal Server Error', 'Unexpected error — see server logs (request id in header).'), 500, { 'Content-Type': 'application/problem+json' });
});
app.notFound((c) => c.json(problem(404, 'Not Found'), 404, { 'Content-Type': 'application/problem+json' }));

app.get('/api/v1/health', (c) => c.json({ status: 'ok', service: 'twinmos-api', version: '0.1.0', db: 'connected' }));
app.all('/api/v1/auth/*', (c) => auth.handler(c.req.raw));
app.route('/api/v1', formsRoute(db));
app.route('/api/v1/admin', adminRoute(db, { requireRole, sessionFromRequest }));

const port = Number(process.env.PORT ?? 8787);
const { serve } = await import('@hono/node-server');
const server = serve({ fetch: app.fetch, port }, () => console.log(`[api] http://127.0.0.1:${port}/api/v1/health`));

// Graceful shutdown — closing PGlite cleanly prevents the stale-lock/WASM-abort
// state that a force-killed dev server leaves behind (see scripts/reset.ts).
async function shutdown(signal: string) {
  console.log(`[api] ${signal} received — closing server and database`);
  server.close();
  try {
    const client = (db as any).$client;
    if (client && typeof client.close === 'function') await client.close();
  } catch { /* best effort */ }
  process.exit(0);
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
