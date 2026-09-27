// Fallback when export-content cannot run (e.g. no DB content yet, locked
// PGlite): guarantees cms-content.js exists so the boot chain never 404s.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = join('apps', 'web', 'public', 'assets', 'js', 'cms-content.js');
if (!existsSync(out)) {
  mkdirSync(join('apps', 'web', 'public', 'assets', 'js'), { recursive: true });
  writeFileSync(out, 'window.CMS_CONTENT = { articles: [], news: [], faqs: [], generatedAt: null };\n', 'utf8');
  console.log('[export-fallback] wrote empty cms-content.js');
} else {
  console.log('[export-fallback] cms-content.js already present — kept');
}
