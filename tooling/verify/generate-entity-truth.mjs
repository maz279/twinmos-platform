// Generate the entity truth register from the CMS rows (MS4.7 T4.7.8).
// Each published truth-bearing row is canonicalised, hashed, and the whole
// register is HMAC-signed. Replaces hand-written "certified by" claims.
import { createHash, createHmac } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API = process.env.API_URL || 'http://127.0.0.1:8787';
const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@twinmos.dev';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';
const KEY = process.env.ENTITY_TRUTH_KEY || process.env.REVALIDATE_SECRET || 'dev-revalidate-secret';

async function signIn() {
  const res = await fetch(`${API}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:5173' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`sign-in ${res.status}`);
  const cookie = (res.headers.get('set-cookie') || '').match(/better-auth\.session_token=([^;]+)/);
  if (!cookie) throw new Error('no session cookie');
  return `better-auth.session_token=${cookie[1]}`;
}

const cookie = await signIn();
async function get(path) {
  const res = await fetch(`${API}/api/v1${path}`, { headers: { cookie } });
  if (!res.ok) return [];
  const body = await res.json();
  return body.items ?? body.data ?? [];
}

const [offices, testimonials, faqs, glossary, distributors] = await Promise.all([
  get('/admin/entities/offices'),
  get('/admin/entities/testimonials'),
  get('/admin/entities/faq'),
  get('/admin/entities/glossary'),
  get('/admin/entities/distributors'),
]);

const groups = [
  ['Offices', offices, (r) => r.title || r.name],
  ['Testimonials', testimonials, (r) => r.author],
  ['FAQs', faqs, (r) => r.question],
  ['Glossary terms', glossary, (r) => r.term],
  ['Distributors', distributors, (r) => r.name],
];

const lines = [];
let total = 0;
for (const [label, rows, nameOf] of groups) {
  const published = rows.filter((r) => (r.status ?? 'published') === 'published');
  lines.push(`\n## ${label} (${published.length} published)`);
  for (const row of published.sort((a, b) => String(nameOf(a)).localeCompare(String(nameOf(b))))) {
    const canonical = JSON.stringify({
      id: row.id,
      name: nameOf(row),
      source: row.source ?? null,
      approver: row.approver ?? null,
      status: row.status ?? null,
    });
    const hash = createHash('sha256').update(canonical).digest('hex');
    lines.push(`- **${nameOf(row)}** — source: ${row.source ?? '—'} · approver: ${row.approver ?? '—'} · sha256: \`${hash.slice(0, 16)}…\``);
    total++;
  }
}

const body = `# Entity Truth Register\n\n**Generated:** ${new Date().toISOString()}  \n**Generator:** \`tooling/verify/generate-entity-truth.mjs\`  \n**Rows covered:** ${total} published truth-bearing rows.\n\nThis register is generated from the CMS rows; each line records the row's source, approver and a SHA-256 digest of the canonical identity. The register digest is HMAC-signed with the deployment secret (key id: \`entity-truth\`).\n${lines.join('\n')}\n`;
const registerHash = createHash('sha256').update(body).digest('hex');
const signature = createHmac('sha256', KEY).update(body).digest('hex');
const finalDoc = `${body}\n---\n\n**Register SHA-256:** \`${registerHash}\`  \n**HMAC-SHA256 signature:** \`${signature}\`\n`;

writeFileSync(resolve(process.cwd(), 'docs/ENTITY_TRUTH.md'), finalDoc);
console.log(`[truth-register] wrote ${total} published rows; register sha256=${registerHash.slice(0, 16)}…`);
