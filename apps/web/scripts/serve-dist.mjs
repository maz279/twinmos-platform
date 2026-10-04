// Static server for apps/web/dist — used when `astro dev`/`astro preview`
// cannot run because a machine Application Control policy blocks Astro's
// native compiler binding (@astrojs/compiler-binding-win32-x64-msvc).
// The site is output:'static' + build.format:'file', so dist/ is fully
// self-contained: serving it 1:1 reproduces `astro preview` for browsing.
// Usage: node scripts/serve-dist.mjs [port]   (default 4321)
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4321);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.map': 'application/json; charset=utf-8',
};

/** Resolve a URL path inside ROOT, honoring Astro's file format
 *  (`/page.html`): extensionless paths try `<p>.html` then `<p>/index.html`.
 *  Returns null when nothing exists — caller falls back to 404.html. */
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const safe = normalize(clean).replaceAll('\\', '/').replace(/^(\.\.[/\\])+/, '');
  const base = join(ROOT, safe);
  // containment: never serve outside dist (traversal, absolute-root tricks)
  if (resolve(base) !== ROOT && !resolve(base).startsWith(ROOT + sep)) return null;
  const candidates = [base, base + '.html', join(base, 'index.html')];
  for (const c of candidates) {
    try {
      if (statSync(c).isFile()) return c;
    } catch { /* not present — try next */ }
  }
  return null;
}

createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain', Allow: 'GET, HEAD' });
    res.end('405 Method Not Allowed');
    return;
  }
  const file = resolveFile(req.url ?? '/');
  if (!file) {
    const nf = resolveFile('/404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    if (nf) createReadStream(nf).pipe(res);
    else res.end('404 Not Found');
    return;
  }
  const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
  const hashedAsset = file.includes(`${sep}assets${sep}`) || file.includes(`${sep}_astro${sep}`);
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': hashedAsset ? 'public, max-age=3600' : 'no-cache',
  });
  if (req.method === 'HEAD') { res.end(); return; }
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`[serve-dist] ${ROOT} -> http://localhost:${PORT}/`);
});
