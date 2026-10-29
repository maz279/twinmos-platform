import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const cwd = 'C:/Software_Project/TwinMOS_Corporate_Website/TwinMOS_Corporate_Website/twinmso_codebase';

// 1. Database Tables Inventory
const schemaContent = readFileSync(join(cwd, 'packages/db/src/schema.ts'), 'utf8');
const tables = [];
const tableRegex = /export const (\w+) = pgTable\('([^']+)'/g;
let match;
while ((match = tableRegex.exec(schemaContent)) !== null) {
  tables.push({ exportName: match[1], tableName: match[2] });
}

console.log(`\n================================================================`);
console.log(`  Phase 2: Database Schema & API Routes Inventory`);
console.log(`================================================================`);
console.log(`\n[Database Schema] Found ${tables.length} tables in packages/db/src/schema.ts:`);
tables.forEach((t, i) => {
  console.log(`  ${String(i + 1).padStart(2, ' ')}. ${t.tableName.padEnd(25)} (${t.exportName})`);
});

// 2. Query Row Counts via API / Admin
const envContent = readFileSync(join(cwd, '.env'), 'utf8');
const email = envContent.match(/^SEED_ADMIN_EMAIL=(.+)$/m)?.[1]?.trim() || 'admin@twinmos.dev';
const password = envContent.match(/^SEED_ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim() || 'admin';

async function auditLiveDatabase() {
  try {
    // Authenticate with admin API
    const authRes = await fetch('http://127.0.0.1:8787/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: 'http://localhost:5173' },
      body: JSON.stringify({ email, password })
    });
    const cookie = authRes.headers.get('set-cookie')?.split(';')[0];
    console.log(`\n[Auth Health] Admin sign-in status: ${authRes.status} (Cookie acquired: ${!!cookie})`);

    // Check key entity endpoints
    const endpointsToCheck = [
      { name: 'Products', url: '/api/v1/delivery/products' },
      { name: 'Categories', url: '/api/v1/delivery/categories' },
      { name: 'Pages', url: '/api/v1/delivery/pages' },
      { name: 'Settings', url: '/api/v1/delivery/settings' },
      { name: 'Serials (Admin)', url: '/api/v1/admin/serials?limit=5', auth: true },
      { name: 'RMA Tickets (Admin)', url: '/api/v1/admin/rma/requests?limit=5', auth: true },
      { name: 'Submissions (Admin)', url: '/api/v1/admin/submissions?limit=5', auth: true },
      { name: 'Audit Logs (Admin)', url: '/api/v1/admin/audit-logs?limit=5', auth: true },
      { name: 'Alerts (Admin)', url: '/api/v1/admin/alerts', auth: true },
    ];

    console.log(`\n[API Endpoints Health Check]:`);
    for (const ep of endpointsToCheck) {
      const headers = ep.auth ? { cookie } : {};
      const res = await fetch(`http://127.0.0.1:8787${ep.url}`, { headers });
      const data = await res.json().catch(() => null);
      const count = Array.isArray(data) ? data.length : (data?.items?.length ?? data?.count ?? (data ? 'OK' : 'Empty'));
      console.log(`  • ${ep.name.padEnd(25)} [${res.status}] -> items/state: ${count}`);
    }
  } catch (err) {
    console.error('Error auditing live database:', err);
  }
}

auditLiveDatabase();
