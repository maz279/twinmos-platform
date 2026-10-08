// P3 content exporter — regenerates apps/web/public/assets/js/cms-content.js
// from the DB (published + due only). The site merge layer (cms-merge.js) adds
// ONLY slugs not already present in the prototype data.js, so a corpus import
// can never duplicate what the prototype already renders — parity by design.
//
// P2.2: the payload builder lives in content-payload.mjs (shared with the
// API's POST /admin/content/export). Prefer the API route when the API is
// running — this CLI opens its OWN PGlite handle, which the single-writer
// lock correctly refuses while the API owns the data dir.
// Run from repo root:  node --experimental-strip-types --no-warnings tooling/export-content.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb } from './db-bridge.ts';
import { buildContentPayload, contentScriptText, contentOutPath } from './content-payload.ts';

const HERE = dirname(fileURLToPath(import.meta.url)); // .../twinmso_codebase/tooling
const OUT = contentOutPath();

const db = createDb();
const { counts, payload } = await buildContentPayload(db);

mkdirSync(dirname(OUT), { recursive: true });
const scriptText = contentScriptText(payload);
writeFileSync(OUT, scriptText, 'utf8');
if (!process.env.CONTENT_OUT) {
  try {
    const { existsSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const distDir = resolve(dirname(OUT), '..', '..', 'dist');
    if (existsSync(distDir)) {
      const distJsDir = resolve(distDir, 'assets', 'js');
      mkdirSync(distJsDir, { recursive: true });
      writeFileSync(resolve(distJsDir, 'cms-content.js'), scriptText, 'utf8');
    }
  } catch {
    // non-blocking
  }
}
// P2.1: name the data dir this bundle came from — a silent mismatch between
// the exporter's database and the live API database is exactly how the stale
// cms-content.js shipped (audit U-12). Explicit PGLITE_DATA wins for tooling.
console.log(`[export-content] data dir: ${process.env.PGLITE_DATA ?? '<repo-anchored apps/api/data/dev.pgdata>'}`);
console.log(`[export-content] cms-content.js: articles=${counts.articles} news=${counts.news} faqs=${counts.faqs} products=${counts.products}`);
await db.$client.close();
