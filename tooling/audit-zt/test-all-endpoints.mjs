import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cwd = 'C:/Software_Project/TwinMOS_Corporate_Website/TwinMOS_Corporate_Website/twinmso_codebase';
const envContent = readFileSync(join(cwd, '.env'), 'utf8');
const email = envContent.match(/^SEED_ADMIN_EMAIL=(.+)$/m)?.[1]?.trim() || 'admin@twinmos.dev';
const password = envContent.match(/^SEED_ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim() || 'admin';

async function testExactEndpoints() {
  const authRes = await fetch('http://127.0.0.1:8787/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'http://localhost:5173' },
    body: JSON.stringify({ email, password })
  });
  const cookie = authRes.headers.get('set-cookie')?.split(';')[0];

  const endpoints = [
    { name: 'Delivery Products', url: '/api/v1/delivery/products' },
    { name: 'Delivery Facets (Categories & Brands)', url: '/api/v1/delivery/products/facets' },
    { name: 'Delivery Pages', url: '/api/v1/delivery/pages' },
    { name: 'Delivery Settings', url: '/api/v1/delivery/settings' },
    { name: 'Delivery Navigation', url: '/api/v1/delivery/navigation' },
    { name: 'Delivery Glossary', url: '/api/v1/delivery/glossary' },
    { name: 'Delivery Offices', url: '/api/v1/delivery/offices' },
    { name: 'Delivery Distributors', url: '/api/v1/delivery/distributors' },
    { name: 'Delivery Jobs', url: '/api/v1/delivery/jobs' },
    { name: 'Admin Taxonomy (Categories)', url: '/api/v1/admin/taxonomy', auth: true },
    { name: 'Admin Products', url: '/api/v1/admin/products', auth: true },
    { name: 'Admin Serials', url: '/api/v1/admin/serials', auth: true },
    { name: 'Admin RMA Tickets', url: '/api/v1/admin/rma', auth: true },
    { name: 'Admin Submissions', url: '/api/v1/admin/submissions', auth: true },
    { name: 'Admin Audit Log', url: '/api/v1/admin/audit', auth: true },
    { name: 'Admin Alerts', url: '/api/v1/admin/alerts', auth: true },
    { name: 'Admin Stats', url: '/api/v1/admin/stats', auth: true },
    { name: 'Admin Job Postings', url: '/api/v1/admin/job-postings', auth: true },
    { name: 'Admin Job Applications', url: '/api/v1/admin/job-applications', auth: true },
    { name: 'Admin Spec Dictionary', url: '/api/v1/admin/spec-dictionary', auth: true },
    { name: 'Admin Spec Templates', url: '/api/v1/admin/spec-templates', auth: true },
    { name: 'Admin Partner Orgs', url: '/api/v1/admin/partner-orgs', auth: true },
    { name: 'Admin Media', url: '/api/v1/admin/media', auth: true },
    { name: 'Admin Settings', url: '/api/v1/admin/settings', auth: true },
    { name: 'Admin Users', url: '/api/v1/admin/users', auth: true },
  ];

  console.log(`\nTesting all core API endpoints:`);
  let passed = 0;
  for (const ep of endpoints) {
    const headers = ep.auth ? { cookie } : {};
    const res = await fetch(`http://127.0.0.1:8787${ep.url}`, { headers });
    const data = await res.json().catch(() => null);
    const count = Array.isArray(data) ? data.length : (data?.items?.length ?? data?.categories?.length ?? data?.count ?? (data ? 'OK' : 'Empty'));
    const isOk = res.status >= 200 && res.status < 300;
    if (isOk) passed++;
    console.log(`  ${isOk ? '✅' : '❌'} ${ep.name.padEnd(38)} [${res.status}] -> ${count} items`);
  }
  console.log(`\nEndpoint audit summary: ${passed} / ${endpoints.length} passed.`);
}

testExactEndpoints();
