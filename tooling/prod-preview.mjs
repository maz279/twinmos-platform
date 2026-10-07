// Local production-shape server (mirrors deploy/nginx/twinmos.conf):
// serves the BUILT site (apps/web/dist) statically and reverse-proxies
// /api/* to the API on :8787, so a same-origin build (PUBLIC_API_URL unset)
// works exactly as deployed behind nginx. `astro preview` does NOT support
// proxying (server.proxy/preview.proxy are dev-only/ignored) — that gap is
// why this exists.
//
// Usage: node tooling/prod-preview.mjs [port=4321] [apiPort=8787]
// Build first:  PUBLIC_API_URL= npm run build --workspace @twinmos/web
import { createServer, request as httpRequest } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.argv[2] ?? 4321);
const API_PORT = Number(process.argv[3] ?? 8787);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'web', 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf',
};

function sendFile(res, filePath, status = 200) {
  res.writeHead(status, {
    'content-type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'cache-control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);

  // reverse proxy — nginx: location /api/ { proxy_pass http://127.0.0.1:API_PORT; }
  if (urlPath.startsWith('/api/')) {
    const upstream = httpRequest(
      { host: '127.0.0.1', port: API_PORT, method: req.method, path: req.url, headers: req.headers },
      (up) => { res.writeHead(up.statusCode ?? 502, up.headers); up.pipe(res); },
    );
    upstream.on('error', () => res.writeHead(502, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'bad gateway', target: `127.0.0.1:${API_PORT}` })));
    req.pipe(upstream);
    return;
  }

  // static files — nginx: try_files $uri $uri/index.html $uri.html =404 (+ branded 404)
  const clean = normalize(urlPath).replaceAll('..', '');
  const candidate = join(ROOT, clean);
  if (!candidate.startsWith(ROOT + sep) && candidate !== ROOT) { res.writeHead(403).end(); return; }
  const tries = [candidate, join(ROOT, clean, 'index.html'), join(ROOT, clean + '.html')].filter((p) => existsSync(p) && statSync(p).isFile());
  if (tries.length > 0) { sendFile(res, tries[0]); return; }
  sendFile(res, join(ROOT, '404.html'), 404);
});

server.listen(PORT, () => console.log(`[prod-preview] http://localhost:${PORT} → static ${ROOT} + /api → 127.0.0.1:${API_PORT}`));

function dirname(p) { return p.slice(0, Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'))); }
