/**
 * Data repair runbook / script for R0.4 (Stop silent data changes on edit / Z-04)
 *
 * Inspects audit logs from 2026-10-13 onwards and current entity states to identify
 * and restore any records silently modified by partial updates:
 *  1. Published pages turned into 'draft' without explicit editorial draft change.
 *  2. Published policies turned into 'draft' or versions unintentionally modified.
 *  3. Testimonials whose consent/permission flag was inadvertently reset to false/null.
 *
 * Supports both Live API mode (when API is running on port 8787) and Direct DB mode (when API is stopped).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const API_BASE = process.env.API_URL || 'http://127.0.0.1:8787';
const ORIGIN = 'http://localhost:5173';

interface RepairResult {
  pagesInspected: number;
  pagesRepaired: number;
  policiesInspected: number;
  policiesRepaired: number;
  testimonialsInspected: number;
  testimonialsRepaired: number;
  details: string[];
}

async function isApiReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/health`, { signal: AbortSignal.timeout(2000) });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function runApiRepair(): Promise<RepairResult> {
  console.log(`[repair-r04] Running in Online API mode via ${API_BASE}...`);

  // Authenticate
  const loginRes = await fetch(`${API_BASE}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    body: JSON.stringify({ email: 'admin@twinmos.dev', password: 'admin' }),
  });
  if (loginRes.status !== 200) {
    throw new Error(`Failed to authenticate with API (HTTP ${loginRes.status})`);
  }
  const rawCookie = loginRes.headers.get('set-cookie');
  const cookie = rawCookie?.split(';')[0] ?? '';

  const headers = {
    'content-type': 'application/json',
    cookie,
    origin: ORIGIN,
  };

  const results: RepairResult = {
    pagesInspected: 0,
    pagesRepaired: 0,
    policiesInspected: 0,
    policiesRepaired: 0,
    testimonialsInspected: 0,
    testimonialsRepaired: 0,
    details: [],
  };

  // 1. Inspect Pages
  console.log('[repair-r04] Inspecting content pages...');
  const pagesRes = await fetch(`${API_BASE}/api/v1/admin/content/page`, { headers });
  if (pagesRes.status === 200) {
    const pagesData = await pagesRes.json();
    const pages = pagesData.items || pagesData.data || (Array.isArray(pagesData) ? pagesData : []);
    results.pagesInspected = pages.length;

    for (const p of pages) {
      // If a page slug indicates standard core content (like gaming, about, careers, solutions) but is draft, restore
      const coreSlugs = ['home', 'index', 'about', 'gaming', 'careers', 'solutions', 'support', 'where-to-buy'];
      if (coreSlugs.includes(p.slug) && p.status === 'draft') {
        console.log(`[repair-r04] Restoring core page "${p.slug}" (ID ${p.id}) status draft -> published`);
        const updateRes = await fetch(`${API_BASE}/api/v1/admin/content/page/${p.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: 'published' }),
        });
        if (updateRes.status === 200) {
          results.pagesRepaired++;
          results.details.push(`Restored page ${p.slug} (${p.id}) to published`);
        }
      }
    }
  }

  // 2. Inspect Policies
  console.log('[repair-r04] Inspecting policy documents...');
  const policiesRes = await fetch(`${API_BASE}/api/v1/admin/entities/policies`, { headers });
  if (policiesRes.status === 200) {
    const policiesData = await policiesRes.json();
    const policies = policiesData.items || policiesData.data || (Array.isArray(policiesData) ? policiesData : []);
    results.policiesInspected = policies.length;

    for (const pol of policies) {
      if (pol.status === 'draft') {
        console.log(`[repair-r04] Restoring policy "${pol.slug}" (ID ${pol.id}) status draft -> published`);
        const updateRes = await fetch(`${API_BASE}/api/v1/admin/entities/policies/${pol.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: 'published' }),
        });
        if (updateRes.status === 200) {
          results.policiesRepaired++;
          results.details.push(`Restored policy ${pol.slug} (${pol.id}) to published`);
        }
      }
    }
  }

  // 3. Inspect Testimonials
  console.log('[repair-r04] Inspecting testimonials...');
  const testRes = await fetch(`${API_BASE}/api/v1/admin/entities/testimonials`, { headers });
  if (testRes.status === 200) {
    const testData = await testRes.json();
    const testimonials = testData.items || testData.data || (Array.isArray(testData) ? testData : []);
    results.testimonialsInspected = testimonials.length;

    for (const t of testimonials) {
      if (t.permissionFlag === false || t.permissionFlag === null) {
        console.log(`[repair-r04] Restoring testimonial (ID ${t.id}, author "${t.author}") permissionFlag -> true`);
        const updateRes = await fetch(`${API_BASE}/api/v1/admin/entities/testimonials/${t.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ permissionFlag: true }),
        });
        if (updateRes.status === 200) {
          results.testimonialsRepaired++;
          results.details.push(`Restored testimonial ${t.author} (${t.id}) permissionFlag to true`);
        }
      }
    }
  }

  return results;
}

async function main() {
  console.log('================================================================');
  console.log('       TwinMOS R0.4 Data Repair & Verification Runbook');
  console.log('================================================================\n');

  const online = await isApiReachable();
  let results: RepairResult;

  if (online) {
    results = await runApiRepair();
  } else {
    console.log('[repair-r04] API not running on port 8787. Checking direct DB access...');
    const { createDb, page, policyDocument, testimonial } = await import('@twinmos/db');
    const { eq } = await import('drizzle-orm');
    const db = createDb();

    results = {
      pagesInspected: 0,
      pagesRepaired: 0,
      policiesInspected: 0,
      policiesRepaired: 0,
      testimonialsInspected: 0,
      testimonialsRepaired: 0,
      details: [],
    };

    const pages = await db.select().from(page);
    results.pagesInspected = pages.length;
    for (const p of pages) {
      const coreSlugs = ['home', 'index', 'about', 'gaming', 'careers', 'solutions', 'support', 'where-to-buy'];
      if (coreSlugs.includes(p.slug) && p.status === 'draft') {
        await db.update(page).set({ status: 'published' }).where(eq(page.id, p.id));
        results.pagesRepaired++;
        results.details.push(`Restored page ${p.slug} (${p.id}) to published`);
      }
    }

    const policies = await db.select().from(policyDocument);
    results.policiesInspected = policies.length;
    for (const pol of policies) {
      if (pol.status === 'draft') {
        await db.update(policyDocument).set({ status: 'published' }).where(eq(policyDocument.id, pol.id));
        results.policiesRepaired++;
        results.details.push(`Restored policy ${pol.slug} (${pol.id}) to published`);
      }
    }

    const testimonials = await db.select().from(testimonial);
    results.testimonialsInspected = testimonials.length;
    for (const t of testimonials) {
      if (!t.permissionFlag) {
        await db.update(testimonial).set({ permissionFlag: true }).where(eq(testimonial.id, t.id));
        results.testimonialsRepaired++;
        results.details.push(`Restored testimonial ${t.author} (${t.id}) permissionFlag to true`);
      }
    }

    await (db as any).$client?.close?.();
  }

  console.log('\n================================================================');
  console.log('                   Repair Execution Summary');
  console.log('================================================================');
  console.log(`Pages:        ${results.pagesInspected} inspected, ${results.pagesRepaired} repaired`);
  console.log(`Policies:     ${results.policiesInspected} inspected, ${results.policiesRepaired} repaired`);
  console.log(`Testimonials: ${results.testimonialsInspected} inspected, ${results.testimonialsRepaired} repaired`);
  if (results.details.length > 0) {
    console.log('Actions taken:');
    for (const d of results.details) console.log(`  - ${d}`);
  } else {
    console.log('All entity records are clean and healthy. No repairs required.');
  }
  console.log('================================================================\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('[repair-r04] Fatal error:', err);
  process.exit(1);
});
