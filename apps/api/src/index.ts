// API server entry — builds the app and serves it; graceful PGlite shutdown.
import { createDb } from '@twinmos/db';
import { buildApp } from './app.ts';

const db = createDb();
const app = buildApp(db);

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
