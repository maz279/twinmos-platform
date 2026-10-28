// Prints every route registered on the real Hono app as JSON lines.
// Runs INSIDE the api container (same code, same env) so the list is exact.
import { createDb } from '@twinmos/db';
import { buildApp } from '../../../apps/api/src/app.ts';
const app = buildApp(createDb());
const seen = new Set<string>();
for (const r of (app as any).routes as Array<{ method: string; path: string }>) {
  if (r.method === 'ALL' && r.path.endsWith('/*')) continue; // middleware
  const k = r.method + ' ' + r.path;
  if (seen.has(k)) continue;
  seen.add(k);
  console.log(JSON.stringify({ method: r.method, path: r.path }));
}
process.exit(0);
