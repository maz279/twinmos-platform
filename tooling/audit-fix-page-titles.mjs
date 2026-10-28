// Zero-trust audit fix (D4): the 28 CMS page rows carry slug-derived titles
// ("index — TwinMOS") that override each page's hand-written fallback title.
// PATCHes every page row to the intended title from the page sources.
// Run with the API up: node tooling/audit-fix-page-titles.mjs
const API = 'http://127.0.0.1:8787/api/v1';
const ROOT = 'C:/Software_Project/TwinMOS_Corporate_Website/TwinMOS_Corporate_Website/twinmso_codebase';
import { readFileSync } from 'node:fs';

const env = readFileSync(ROOT + '/.env', 'utf8');
const EMAIL = /^SEED_ADMIN_EMAIL=(.+)$/m.exec(env)[1].trim();
const PASS = /^SEED_ADMIN_PASSWORD=(.+)$/m.exec(env)[1].trim();

const TITLES = {
  'index': 'TwinMOS — Memory & Storage Solutions Since 1998',
  'about': 'About TwinMOS — Since 1998',
  'shop': 'Shop All Products — TwinMOS',
  'products': 'Products Catalogue — TwinMOS',
  'product': 'Products — TwinMOS',
  'article': 'Articles — TwinMOS',
  'gaming': 'VOLTX Gaming Hub — TwinMOS',
  'solutions': 'B2B & OEM Memory Solutions — TwinMOS',
  'technology': 'Technology & R&D — TwinMOS',
  'learn': 'Knowledge Hub — Learn Memory & Storage — TwinMOS',
  'learn-blog': 'Tech Insights & Blog — TwinMOS',
  'learn-explained': 'Technology Explainers — Memory & Storage — TwinMOS',
  'learn-guides': 'Buying Guides — Memory & Storage — TwinMOS',
  'learn-benchmarks': 'Benchmarks — Real-World Performance — TwinMOS',
  'learn-glossary': 'Glossary A–Z — Memory & Storage Terms — TwinMOS',
  'news': 'Newsroom & Events — TwinMOS',
  'careers': 'Careers at TwinMOS — Open roles, benefits & internships',
  'partners': 'Partner Program — TwinMOS',
  'where-to-buy': 'Where to Buy — TwinMOS',
  'support': 'Support Center — TwinMOS',
  'rma': 'RMA Center — TwinMOS',
  'compatibility': 'Hardware Compatibility Finder — TwinMOS',
  'compare': 'Compare Products — TwinMOS',
  'quote': 'Request a Quote — TwinMOS',
  'contact': 'Contact TwinMOS',
  'legal': 'Legal & Warranty Policy — TwinMOS',
  'search': 'Search — TwinMOS',
  'sitemap': 'Sitemap — TwinMOS',
  '404': 'Page not found — TwinMOS',
};

const signIn = await fetch(API + '/auth/sign-in/email', {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'http://localhost:5173' },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
});
const cookie = (signIn.headers.get('set-cookie') ?? '').split(';')[0];
if (!cookie) { console.error('sign-in failed', signIn.status, await signIn.text()); process.exit(1); }

const list = await (await fetch(API + '/admin/content/page?limit=100', { headers: { cookie } })).json();
let fixed = 0, skipped = 0, missed = [];
for (const p of list.items) {
  const intended = TITLES[p.slug];
  if (!intended) { missed.push(p.slug); continue; }
  if (p.title === intended) { skipped++; continue; }
  const res = await fetch(`${API}/admin/content/page/${p.id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ title: intended }),
  });
  if (res.status !== 200) { console.error(`FAIL ${p.slug}: ${res.status}`, await res.text().slice(0, 200)); }
  else { fixed++; console.log(`fixed ${p.slug}: "${intended}"`); }
}
console.log(`done: ${fixed} fixed, ${skipped} already correct, unmatched slugs: ${missed.join(', ') || 'none'}`);
