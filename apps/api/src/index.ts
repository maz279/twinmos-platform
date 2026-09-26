import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { createDb } from '@twinmos/db';
import { auth, requireRole, sessionFromRequest } from './auth.ts';
import { formsRoute } from './routes/forms.ts';
import { adminRoute } from './routes/admin.ts';
import { problem } from '@twinmos/shared';

const db = createDb();
const app = new Hono();

app.use(logger());
app.use('*', async (c, next) => {
  c.header('X-Request-Id', crypto.randomUUID());
  await next();
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
serve({ fetch: app.fetch, port }, () => console.log(`[api] http://127.0.0.1:${port}/api/v1/health`));
