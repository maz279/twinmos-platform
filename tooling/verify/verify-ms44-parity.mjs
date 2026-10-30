// tooling/verify/verify-ms44-parity.mjs
// Milestone MS4.4: Prototype Instances Parity Verification (Task T4.4.2 / Gate G-PARITY)
// Compares live CMS page blocks against the prototype instance inventory (R4 §3):
// 24 heroes, 2 sliders, 14 stats, 32 grids, 2 bento, 12 CTAs, 1 split, 1 timeline, 3 rich-text,
// plus UI components: 5 badge-strip, 4 steps, 1 kpi-meters, 17 callout, 10 link-chips/anchor-nav, 1 category-tiles.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8787';
const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@twinmos.dev';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';

console.log('================================================================');
console.log('  Milestone MS4.4: Prototype Instances Parity (T4.4.2 / G-PARITY)');
console.log('================================================================\n');

async function runParityCheck() {
  let failures = 0;

  // 1. Authenticate with admin API to retrieve all 28 canonical pages
  console.log('[*] Authenticating with Admin API...');
  const loginRes = await fetch(`${API_BASE}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:5173' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!loginRes.ok) {
    throw new Error(`Admin authentication failed: HTTP ${loginRes.status}`);
  }
  const cookie = loginRes.headers.get('set-cookie') || '';
  const tokenMatch = cookie.match(/better-auth\.session_token=([^;]+)/);
  if (!tokenMatch) {
    throw new Error('Failed to extract session token from cookies');
  }
  const token = tokenMatch[1];

  // 2. Fetch all pages
  console.log('[*] Fetching all pages from CMS (limit=100)...');
  const pagesRes = await fetch(`${API_BASE}/api/v1/admin/content/page?limit=100`, {
    headers: { cookie: `better-auth.session_token=${token}` },
  });
  if (!pagesRes.ok) {
    throw new Error(`Failed to fetch pages: HTTP ${pagesRes.status}`);
  }
  const json = await pagesRes.json();
  const pages = json.items || [];
  console.log(`    [+] Retrieved ${pages.length} pages (total: ${json.total}).`);

  if (pages.length !== 28) {
    console.error(`[-] FAIL PARITY-PAGES: Expected 28 canonical pages, found ${pages.length}`);
    failures++;
  } else {
    console.log('    [+] All 28 canonical prototype pages present in database.');
  }

  // 3. Count block instances across all pages
  const counts = {};
  for (const p of pages) {
    for (const b of (p.blocks || [])) {
      counts[b.type] = (counts[b.type] || 0) + 1;
    }
  }

  // 4. Verify T4.4.2 Target Volumes (Source C4b)
  const EXPECTED = [
    {
      group: 'heroes',
      target: 24,
      types: ['page-hero', 'error-hero', 'hero'],
      desc: '24 heroes (23 page-hero + 1 error-hero)',
    },
    {
      group: 'sliders',
      target: 2,
      types: ['hero-slider', 'slider'],
      desc: '2 sliders (gaming, index)',
    },
    {
      group: 'stats',
      target: 14,
      types: ['stats-tiles', 'stats-band-copy', 'stats-demo', 'statsCounter'],
      desc: '14 stats tiles/bands',
    },
    {
      group: 'grids',
      target: 32,
      types: ['card-grid', 'icon-card-grid', 'section-tiles', 'featureGrid'],
      desc: '32 feature/card grids',
    },
    {
      group: 'bento',
      target: 2,
      types: ['bento-grid', 'bentoGrid'],
      desc: '2 bento grids (gaming, index)',
    },
    {
      group: 'ctas',
      target: 12,
      types: ['cta-banner', 'cta-inline-card', 'promo-card', 'ctaBanner'],
      desc: '12 CTA banners',
    },
    {
      group: 'splitCta',
      target: 1,
      types: ['cta-split', 'splitCta'],
      desc: '1 split dual CTA (index)',
    },
    {
      group: 'timeline',
      target: 1,
      types: ['timeline'],
      desc: '1 timeline (about)',
    },
    {
      group: 'richText',
      target: 3,
      types: ['rich-text+factfile', 'text-columns', 'textMedia'],
      desc: '3 rich-text / factfiles (about, learn-benchmarks, learn-blog)',
    },
    // T4.4.3 UI components (Source C4d)
    {
      group: 'badgeStrip',
      target: 5,
      types: ['badge-strip', 'trust-badges', 'badgeStrip'],
      desc: '5 badge strips (gaming, index, solutions, support, where-to-buy)',
    },
    {
      group: 'steps',
      target: 4,
      types: ['steps'],
      desc: '4 step workflows (compatibility, partners, rma, solutions)',
    },
    {
      group: 'kpiMeters',
      target: 1,
      types: ['kpi-meters', 'kpi-meters+steps', 'kpiMeters'],
      desc: '1 KPI meter band (about)',
    },
    {
      group: 'callout',
      target: 17,
      types: ['callout'],
      desc: '17 callout boxes',
    },
    {
      group: 'linkChips/anchorNav',
      target: 10,
      types: ['link-chips', 'anchor-nav', 'linkChips', 'anchorNav'],
      desc: '10 link chips / anchor nav bars',
    },
    {
      group: 'categoryTiles',
      target: 1,
      types: ['category-tiles', 'categoryTiles'],
      desc: '1 category tiles section (index)',
    },
  ];

  console.log('\n[*] Checking Prototype Instance Parity (T4.4.2 & T4.4.3):');
  for (const exp of EXPECTED) {
    const sum = exp.types.reduce((acc, t) => acc + (counts[t] || 0), 0);
    if (sum === exp.target) {
      console.log(`    [+] PASS ${exp.group}: ${sum}/${exp.target} instances verified (${exp.desc})`);
    } else {
      console.error(`    [-] FAIL ${exp.group}: Found ${sum}, expected ${exp.target} (${exp.desc})`);
      failures++;
    }
  }

  // 5. Verify dynamic counts in categoryTiles (INV-2)
  console.log('\n[*] Verifying categoryTiles dynamic count requirement (INV-2)...');
  const indexPage = pages.find((p) => p.slug === 'index' || p.path === '/');
  if (!indexPage) {
    console.error('[-] FAIL: index page not found');
    failures++;
  } else {
    const catBlock = (indexPage.blocks || []).find((b) => b.type === 'category-tiles' || b.type === 'categoryTiles');
    if (!catBlock) {
      console.error('[-] FAIL: category-tiles block missing on index page');
      failures++;
    } else {
      // Must not contain hardcoded product counts
      const hasBakedCounts = JSON.stringify(catBlock).includes('"count":');
      if (hasBakedCounts) {
        console.error('[-] FAIL INV-2: categoryTiles contains baked-in "count" property!');
        failures++;
      } else {
        console.log('    [+] PASS INV-2: categoryTiles does NOT bake in count properties; product counts dynamically computed.');
      }
    }
  }

  console.log('\n================================================================');
  if (failures > 0) {
    console.error(`G-PARITY Prototype Instances Verification FAILED with ${failures} error(s).`);
    process.exit(1);
  }

  console.log('G-PARITY Prototype Instances Verification PASSED: 100% Parity.');
  console.log('================================================================');
  process.exit(0);
}

runParityCheck().catch((err) => {
  console.error(`Fatal error in verify-ms44-parity: ${err.message}`);
  process.exit(1);
});
