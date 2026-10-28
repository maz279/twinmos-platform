// Lab-only stand-in for the Resend HTTP API (RESEND_BASE_URL points here).
// Stores every message as JSON so tests can assert real delivery attempts.
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
const dir = '/mail';
mkdirSync(dir, { recursive: true });
let n = 0;
createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/_messages') {
    const all = readdirSync(dir).sort().map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(all));
  }
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const id = `${Date.now()}-${String(n++).padStart(5, '0')}`;
    writeFileSync(`${dir}/${id}.json`, JSON.stringify({ id, method: req.method, url: req.url, auth: req.headers.authorization ? 'present' : 'missing', body: body ? JSON.parse(body) : null }));
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ id }));
  });
}).listen(3000, () => console.log('mailmock :3000'));
