// Fallback when export-content cannot run (e.g. no DB content yet, locked
// PGlite): guarantees cms-content.js exists so the boot chain never 404s.
// NOTE: paths must be anchored to THIS file, never process.cwd() — the web
// prebuild runs with cwd=apps/web, and a cwd-relative path here produced the
// stray nested apps/web/apps/web/... stub (found in the P5 audit iteration).
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)); // .../twinmso_codebase/tooling
const out = join(HERE, '..', 'apps', 'web', 'public', 'assets', 'js', 'cms-content.js');
if (!existsSync(out)) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, 'window.CMS_CONTENT = { articles: [], news: [], faqs: [], generatedAt: null };\n', 'utf8');
  console.log('[export-fallback] wrote empty cms-content.js');
} else {
  console.log('[export-fallback] cms-content.js already present — kept');
}
