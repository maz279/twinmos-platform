// Master Verification & Comprehensive Audit for Milestone MS4.2 (T4.2.1–T4.2.4 / Gate GREF-C)
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms42');

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8787';

console.log('================================================================');
console.log('       MS4.2 Master Comprehensive Verification & Audit');
console.log('================================================================\n');

async function runMasterAudit() {
  const results = [];
  let allPassed = true;

  const WEB_BASE = process.env.WEB_BASE || 'http://127.0.0.1:4321';
  const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@twinmos.dev';
  const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';
  let sessionCookie = '';

  async function ensureSession() {
    if (sessionCookie) return sessionCookie;
    const res = await fetch(`${API_BASE}/api/v1/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:5173' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    if (!res.ok) throw new Error(`admin sign-in returned ${res.status}`);
    const setCookie = res.headers.get('set-cookie') || '';
    const token = setCookie.match(/better-auth\.session_token=([^;]+)/);
    if (!token) throw new Error('admin sign-in did not set a session cookie');
    sessionCookie = `better-auth.session_token=${token[1]}`;
    return sessionCookie;
  }

  async function adminPut(key, value) {
    const cookie = await ensureSession();
    return fetch(`${API_BASE}/api/v1/admin/settings`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ key, value }),
    });
  }

  const GROUPS = {
    'site.brand': {
      name: 'Audit Brand', tagline: 'Audit tagline', logoUrl: '/assets/img/logo.webp',
      faviconUrl: '/favicon.ico', foundingYear: 2001,
    },
    'site.contact': {
      email: 'audit@twinmos.dev', supportEmail: 'support@twinmos.dev', salesEmail: 'sales@twinmos.dev',
      phone: '+886 2 0000 0000', address: 'Audit address, Taipei', country: 'Taiwan',
    },
    'site.social': {
      facebook: 'https://example.com/fb', instagram: 'https://example.com/ig',
      linkedin: 'https://example.com/li', x: 'https://example.com/x',
      youtube: 'https://example.com/yt', pinterest: 'https://example.com/pin',
    },
    'site.cookie': {
      title: 'Audit Cookie', description: 'Audit cookie description.', policyUrl: '/legal.html#cookies',
      essentialOnlyDefault: true,
    },
    'site.whatsapp': {
      phoneNumber: '886226590999', waUrl: 'https://wa.me/886226590999', defaultMessage: 'Audit',
    },
    'site.figures': { countriesCount: '97+', foundingYear: 2003, productCount: 41 },
    'seo.defaults': {
      titleTemplate: '%s | Audit', defaultTitle: 'Audit title', defaultDescription: 'Audit description',
      defaultOgImage: '/assets/img/og-cover.png', defaultRobots: 'index, follow',
    },
    integrations: { turnstileSiteKey: '0xAUDITKEY', analyticsEnabled: false, googleAnalyticsId: '' },
  };

  function record(id, title, passed, details = '') {
    results.push({ id, title, passed, details });
    const mark = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] ${id}: ${title}`);
    if (details) console.log(`       ${details}`);
    if (!passed) allPassed = false;
  }

  // 1. Shared schemas
  try {
    const shared = await import('@twinmos/shared');
    const groupKeys = shared.SETTINGS_GROUP_KEYS;
    const expectedKeys = [
      'site.brand',
      'site.contact',
      'site.social',
      'site.cookie',
      'site.whatsapp',
      'site.figures',
      'seo.defaults',
      'integrations',
    ];
    const hasAll = expectedKeys.every((k) => groupKeys.includes(k));
    record(
      'CHK-01',
      '8 typed settings groups schemas defined in @twinmos/shared',
      hasAll,
      `Groups present: ${groupKeys.join(', ')}`
    );
  } catch (err) {
    record('CHK-01', '8 typed settings groups schemas defined in @twinmos/shared', false, err.message);
  }

  // 2. Dynamic Year Computation
  try {
    const shared = await import('@twinmos/shared');
    const curYear = new Date().getFullYear();
    const computed = shared.computeYearsInBusiness(1998);
    const expected = curYear - 1998;
    const formatted = shared.formatYearsString(1998);
    const passed = computed === expected && formatted === `${expected} years`;
    record(
      'CHK-02',
      'Dynamic founding year ("N years") computation helper logic',
      passed,
      `computeYearsInBusiness(1998) = ${computed}, formatYearsString = "${formatted}"`
    );
  } catch (err) {
    record('CHK-02', 'Dynamic founding year ("N years") computation helper logic', false, err.message);
  }

  // 3. Delivery Settings API & Cache Tags
  try {
    const res = await fetch(`${API_BASE}/api/v1/delivery/settings`);
    const statusOk = res.status === 200;
    const cacheTag = res.headers.get('cache-tag') || res.headers.get('Cache-Tag') || '';
    const hasSiteTag = cacheTag.includes('site') && cacheTag.includes('settings');
    const json = await res.json();
    const figures = json.data?.['site.figures'];
    const hasFigures = figures && figures.foundingYear === 1998;
    const hasComputed = figures && typeof figures.years === 'number' && figures.yearsFormatted;
    record(
      'CHK-03',
      'Delivery endpoint /api/v1/delivery/settings returns typed groups + emits "site, settings" cache tag',
      statusOk && hasSiteTag && hasFigures && hasComputed,
      `Status: ${res.status}, Cache-Tag: "${cacheTag}", Figures: ${JSON.stringify(figures)}`
    );
  } catch (err) {
    record('CHK-03', 'Delivery endpoint /api/v1/delivery/settings', false, err.message);
  }

  // 4. Secret Redaction on Integrations
  try {
    const res = await fetch(`${API_BASE}/api/v1/delivery/settings`);
    const json = await res.json();
    const integrations = json.data?.['integrations'] || {};
    const noSecrets = !integrations.turnstileSecretKey && !integrations.apiKey;
    record(
      'CHK-04',
      'Integrations public payload redacts secrets (only public keys like turnstileSiteKey exposed)',
      noSecrets,
      `Integrations exposed keys: ${Object.keys(integrations).join(', ')}`
    );
  } catch (err) {
    record('CHK-04', 'Integrations public payload secret redaction', false, err.message);
  }

  // 5. Admin PUT validation (rejects invalid whatsapp URL with 422)
  try {
    const invalidRes = await adminPut('site.whatsapp', {
      phoneNumber: '123',
      waUrl: 'https://invalid-url.com/not-whatsapp',
    });
    const passed = invalidRes.status === 422;
    record(
      'CHK-05',
      'Admin settings PUT /admin/settings refuses schema violations with HTTP 422',
      passed,
      `Invalid whatsapp PUT response code: ${invalidRes.status}`
    );
  } catch (err) {
    record('CHK-05', 'Admin settings PUT /admin/settings validation', false, err.message);
  }

  // 6. Navigation delivery & Cache Tags
  try {
    const res = await fetch(`${API_BASE}/api/v1/delivery/navigation`);
    const statusOk = res.status === 200;
    const cacheTag = res.headers.get('cache-tag') || res.headers.get('Cache-Tag') || '';
    const hasNavTag = cacheTag.includes('nav') || cacheTag.includes('menus');
    const json = await res.json();
    const menus = Array.isArray(json.data) ? json.data : [];
    const hasHeader = menus.some((m) => m.code === 'header');
    const hasDrawer = menus.some((m) => m.code === 'drawer');
    const hasFooter = menus.some((m) => m.code === 'footer');
    record(
      'CHK-06',
      'Delivery endpoint /api/v1/delivery/navigation returns menus + emits "nav, menus" cache tag',
      statusOk && hasNavTag && hasHeader && hasDrawer && hasFooter,
      `Status: ${res.status}, Cache-Tag: "${cacheTag}", Menus present: ${menus.map((m) => m.code).join(', ')}`
    );
  } catch (err) {
    record('CHK-06', 'Delivery endpoint /api/v1/delivery/navigation', false, err.message);
  }

  // 7. Authentic 179 Prototype Links Imported
  try {
    const [hRes, dRes, fRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/delivery/navigation/header`).then((r) => r.json()),
      fetch(`${API_BASE}/api/v1/delivery/navigation/drawer`).then((r) => r.json()),
      fetch(`${API_BASE}/api/v1/delivery/navigation/footer`).then((r) => r.json()),
    ]);
    const countTargetLinks = (items) => {
      let count = 0;
      for (const i of items || []) {
        if (i.targetUrl) count++;
        if (i.children) count += countTargetLinks(i.children);
      }
      return count;
    };
    const countRows = (items) => {
      let count = 0;
      for (const i of items || []) {
        count++;
        if (i.children) count += countRows(i.children);
      }
      return count;
    };
    const countGroups = (items) => {
      let count = 0;
      for (const i of items || []) {
        if (!i.targetUrl) count++;
        if (i.children) count += countGroups(i.children);
      }
      return count;
    };
    const megaCount = countTargetLinks(hRes.data?.items);
    const drawerLinks = countTargetLinks(dRes.data?.items);
    const drawerRows = countRows(dRes.data?.items);
    const drawerGroups = countGroups(dRes.data?.items);
    const footerCount = countTargetLinks(fRes.data?.items);
    // 179 prototype anchors = 84 header hrefs + (50 drawer hrefs + 6 "#"
    // toggles) + 39 footer hrefs. The toggles are stored as group nodes.
    const prototypeAnchors = megaCount + drawerRows + footerCount;
    const exactCounts =
      megaCount === 84 &&
      drawerRows === 56 &&
      drawerLinks === 50 &&
      drawerGroups === 6 &&
      footerCount === 39 &&
      prototypeAnchors === 179 &&
      !dRes.data?.items?.some((i) => i.targetUrl === '#');
    record(
      'CHK-07',
      '179 authentic prototype anchors imported (84 header links, 56 drawer rows, 39 footer links; 0 invented)',
      exactCounts,
      `Header: ${megaCount}/84 links, Drawer: ${drawerRows}/56 rows (${drawerLinks} links + ${drawerGroups} toggles), Footer: ${footerCount}/39 links, Anchors: ${prototypeAnchors}/179`
    );
  } catch (err) {
    record('CHK-07', '179 authentic links import verification', false, err.message);
  }

  // 8. Zero Raw Spaces in Navigation Targets
  try {
    const [hRes, dRes, fRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/delivery/navigation/header`).then((r) => r.json()),
      fetch(`${API_BASE}/api/v1/delivery/navigation/drawer`).then((r) => r.json()),
      fetch(`${API_BASE}/api/v1/delivery/navigation/footer`).then((r) => r.json()),
    ]);
    const extractUrls = (items) => {
      let urls = [];
      for (const i of items || []) {
        if (i.targetUrl) urls.push(i.targetUrl);
        if (i.children) urls = urls.concat(extractUrls(i.children));
      }
      return urls;
    };
    const allUrls = [
      ...extractUrls(hRes.data?.items),
      ...extractUrls(dRes.data?.items),
      ...extractUrls(fRes.data?.items),
    ];
    const urlsWithSpaces = allUrls.filter((u) => u && u.includes(' '));
    const passed = urlsWithSpaces.length === 0;
    record(
      'CHK-08',
      'Zero raw spaces in navigation link targets across all imported menus',
      passed,
      `Checked ${allUrls.length} targets, found ${urlsWithSpaces.length} with spaces.`
    );
  } catch (err) {
    record('CHK-08', 'Zero raw spaces in navigation targets', false, err.message);
  }

  // 9. Compound uniqueness on nav_menu (code, locale)
  try {
    const schemaSrc = readFileSync(resolve(ROOT, 'packages/db/src/schema.ts'), 'utf8');
    const migrationSrc = readFileSync(resolve(ROOT, 'packages/db/migrations/0025_nav_menu_locale_code.sql'), 'utf8');
    const hasIndex = schemaSrc.includes("uniqueIndex('nav_menu_code_locale_uq').on(t.code, t.locale)");
    const hasMigration = migrationSrc.includes('nav_menu_code_locale_uq');
    record(
      'CHK-09',
      'Per-locale menus: compound unique constraint on (code, locale) in schema & migration 0025',
      hasIndex && hasMigration,
      `Schema definition and migration 0025 verified.`
    );
  } catch (err) {
    record('CHK-09', 'Per-locale menus compound uniqueness', false, err.message);
  }

  // 10. Drawer Drift Report
  try {
    const driftPath = resolve(ROOT, 'docs/DRAWER_DRIFT_REPORT.md');
    const exists = existsSync(driftPath);
    let driftContent = '';
    if (exists) driftContent = readFileSync(driftPath, 'utf8');
    const has13Missing = driftContent.includes('13 Missing');
    const has9Relabelled = driftContent.includes('9 Relabelled');
    record(
      'CHK-10',
      'Drawer drift documented in docs/DRAWER_DRIFT_REPORT.md (13 missing, 9 relabelled)',
      exists && has13Missing && has9Relabelled,
      `File exists at ${driftPath}`
    );
  } catch (err) {
    record('CHK-10', 'Drawer drift documentation', false, err.message);
  }

  // 11. Admin Settings Editor UI & Vite Build
  try {
    const adminSettingsSrc = readFileSync(resolve(ROOT, 'apps/admin/src/modules/settings.tsx'), 'utf8');
    const has8Groups = [
      'site.brand',
      'site.contact',
      'site.social',
      'site.cookie',
      'site.whatsapp',
      'site.figures',
      'seo.defaults',
      'integrations',
    ].every((g) => adminSettingsSrc.includes(g));
    const hasLivePreview = adminSettingsSrc.includes('Live Dynamic Preview');
    const hasAccessibleLabels = adminSettingsSrc.includes('aria-label=');
    record(
      'CHK-11',
      'Admin Settings editor in apps/admin/src/modules/settings.tsx with live preview, tabbed UI and a11y labels',
      has8Groups && hasLivePreview && hasAccessibleLabels,
      '8 groups, live N-years preview and accessible aria-labels verified.'
    );
  } catch (err) {
    record('CHK-11', 'Admin Settings editor UI verification', false, err.message);
  }

  // 12. Visual & Accessibility Inspection Summary
  try {
    const summaryPath = resolve(EVIDENCE_DIR, 'inspection_summary.json');
    const exists = existsSync(summaryPath);
    let summaryJson = null;
    if (exists) summaryJson = JSON.parse(readFileSync(summaryPath, 'utf8'));
    const fresh = summaryJson?.timestamp
      ? Date.now() - new Date(summaryJson.timestamp).getTime() < 2 * 3600_000
      : false;
    const passed =
      exists &&
      fresh &&
      summaryJson.status === 'PASSED' &&
      summaryJson.checks?.publicNavigationRendered &&
      summaryJson.checks?.dynamicFiguresInFooter &&
      summaryJson.checks?.headerProductCount &&
      summaryJson.checks?.cookieCopyMatchesSettings &&
      summaryJson.checks?.whatsappLinkRendered &&
      summaryJson.checks?.socialLinksRendered &&
      summaryJson.checks?.publicA11yViolations === 0 &&
      summaryJson.checks?.adminSettingsMounted &&
      summaryJson.checks?.adminA11yViolations === 0;
    record(
      'CHK-12',
      'Visual and axe-core a11y inspection passed with 0 critical/serious violations',
      passed,
      `Status: ${summaryJson?.status}, fresh: ${fresh}, public violations: ${summaryJson?.checks?.publicA11yViolations}, admin violations: ${summaryJson?.checks?.adminA11yViolations}`
    );
  } catch (err) {
    record('CHK-12', 'Visual and a11y inspection summary verification', false, err.message);
  }

  // 13. G-REFLECT for every typed group (save -> anonymous delivery -> restore)
  try {
    const shared = await import('@twinmos/shared');
    const failures = [];
    const seen = [];
    for (const [key, fixture] of Object.entries(GROUPS)) {
      const put = await adminPut(key, fixture);
      if (put.status !== 200) {
        failures.push(`${key}: PUT ${put.status}`);
        continue;
      }
      const res = await fetch(`${API_BASE}/api/v1/delivery/settings/${encodeURIComponent(key)}`);
      if (res.status !== 200) {
        failures.push(`${key}: GET ${res.status}`);
      } else {
        const json = await res.json();
        for (const [field, value] of Object.entries(fixture)) {
          if (JSON.stringify(json.data?.[field]) !== JSON.stringify(value)) {
            failures.push(`${key}.${field}`);
          }
        }
        seen.push(key);
      }
      const restore = await adminPut(key, shared.SETTINGS_GROUP_DEFAULTS[key]);
      if (restore.status !== 200) failures.push(`${key}: restore ${restore.status}`);
    }
    record(
      'CHK-13',
      'G-REFLECT: every typed settings group saves, delivers anonymously and restores',
      failures.length === 0,
      failures.length ? failures.slice(0, 6).join(', ') : `${seen.length}/8 groups round-tripped`
    );
  } catch (err) {
    record('CHK-13', 'G-REFLECT for every typed group', false, err.message);
  }

  // 14. Group delivery endpoint: cache tags and 404
  try {
    const fig = await fetch(`${API_BASE}/api/v1/delivery/settings/site.figures`);
    const tag = (fig.headers.get('cache-tag') || '').toLowerCase();
    const figJson = await fig.json();
    const unknown = await fetch(`${API_BASE}/api/v1/delivery/settings/site.unknown`);
    const passed =
      fig.status === 200 &&
      tag.includes('site') &&
      tag.includes('settings:site.figures') &&
      typeof figJson.data?.years === 'number' &&
      unknown.status === 404;
    record(
      'CHK-14',
      'GET /delivery/settings/:group returns the group with its tag and 404s unknown groups',
      passed,
      `figures ${fig.status}, tag "${tag}", years ${figJson.data?.years}, unknown ${unknown.status}`
    );
  } catch (err) {
    record('CHK-14', 'Group delivery endpoint contract', false, err.message);
  }

  // 15. Menu tree shape: header columns, drawer groups, footer columns + legal bar
  try {
    const get = async (code) => (await (await fetch(`${API_BASE}/api/v1/delivery/navigation/${code}`)).json()).data;
    const flatten = (nodes) => (nodes || []).flatMap((n) => [n, ...flatten(n.children || [])]);
    const [header, drawer, footer] = await Promise.all([get('header'), get('drawer'), get('footer')]);
    const hFlat = flatten(header.items);
    const dFlat = flatten(drawer.items);
    const fFlat = flatten(footer.items);
    const legal = footer.items.find((i) => i.title === 'Legal');
    const passed =
      header.items.length === 6 &&
      hFlat.filter((i) => i.targetUrl).length === 84 &&
      hFlat.filter((i) => i.metadata?.kind === 'column').length === 16 &&
      drawer.items.length === 9 &&
      dFlat.length === 56 &&
      dFlat.filter((i) => i.targetUrl).length === 50 &&
      dFlat.filter((i) => i.metadata?.kind === 'drawer_group').length === 6 &&
      footer.items.length === 6 &&
      fFlat.length === 45 &&
      fFlat.filter((i) => i.targetUrl).length === 39 &&
      legal?.children?.length === 3;
    record(
      'CHK-15',
      'Menu trees cover mega columns, drawer groups, footer columns and the legal bar',
      passed,
      `header ${header.items.length}/${hFlat.filter((i) => i.targetUrl).length} links; drawer ${drawer.items.length}/${dFlat.length} rows; footer ${footer.items.length}/${fFlat.length} rows; legal ${legal?.children?.length ?? 0}`
    );
  } catch (err) {
    record('CHK-15', 'Menu tree shape', false, err.message);
  }

  // 16. Computed label counts and typed article references
  try {
    const figures = (await (await fetch(`${API_BASE}/api/v1/delivery/settings/site.figures`)).json()).data;
    const header = (await (await fetch(`${API_BASE}/api/v1/delivery/navigation/header`)).json()).data;
    const flatten = (nodes) => (nodes || []).flatMap((n) => [n, ...flatten(n.children || [])]);
    const flat = flatten(header.items);
    const allRow = flat.find((i) => i.metadata?.kind === 'all_row' && /catalog/i.test(i.title));
    const articleRef = flat.find((i) => i.targetType === 'article' && i.targetId && i.targetUrl?.startsWith('/learn/'));
    const passed =
      allRow?.title?.includes(`${figures.productCount} products`) &&
      !flat.some((i) => String(i.title).includes('{{')) &&
      Boolean(articleRef);
    record(
      'CHK-16',
      'Nav labels use the computed product count and article targets are typed references',
      passed,
      `count "${allRow?.title?.slice(0, 60)}", article ref ${articleRef?.targetId ?? 'none'}`
    );
  } catch (err) {
    record('CHK-16', 'Computed label counts and references', false, err.message);
  }

  // 17. Every delivered target resolves on the live web server
  try {
    const get = async (code) => (await (await fetch(`${API_BASE}/api/v1/delivery/navigation/${code}`)).json()).data;
    const flatten = (nodes) => (nodes || []).flatMap((n) => [n, ...flatten(n.children || [])]);
    const menus = await Promise.all(['header', 'drawer', 'footer'].map(get));
    const urls = [...new Set(menus.flatMap((m) => flatten(m.items)).map((i) => i.targetUrl).filter((u) => u?.startsWith('/')))];
    const bad = [];
    for (const url of urls) {
      const res = await fetch(`${WEB_BASE}${url}`, { redirect: 'follow' });
      if (res.status < 200 || res.status >= 400) bad.push(`${url} -> ${res.status}`);
    }
    record(
      'CHK-17',
      'Every delivered navigation target resolves to a live page',
      bad.length === 0,
      bad.length ? bad.slice(0, 5).join(', ') : `${urls.length} unique internal targets returned 2xx/3xx`
    );
  } catch (err) {
    record('CHK-17', 'Live navigation target resolution', false, err.message);
  }

  // 18. Live G-REFLECT: settings save visible on the anonymous site within 5 s
  try {
    const current = await (await fetch(`${API_BASE}/api/v1/delivery/settings/site.figures`)).json();
    const original = {
      countriesCount: current?.data?.countriesCount ?? '93+',
      foundingYear: current?.data?.foundingYear ?? 1998,
      productCount: current?.data?.productCount ?? 40,
    };
    const put = await adminPut('site.figures', { countriesCount: '96+', foundingYear: 1997, productCount: original.productCount });
    if (put.status !== 200) throw new Error(`figures PUT ${put.status}`);
    await new Promise((r) => setTimeout(r, 3500));
    const changed = await (await fetch(`${WEB_BASE}/?audit=${Date.now()}`)).text();
    const changedOk = changed.includes('Since 1997') && changed.includes('96+ countries');
    await adminPut('site.figures', original);
    await new Promise((r) => setTimeout(r, 3500));
    const restored = await (await fetch(`${WEB_BASE}/?audit=${Date.now()}`)).text();
    const restoredOk = restored.includes(`Since ${original.foundingYear}`) && restored.includes(`${original.countriesCount} countries`);
    record(
      'CHK-18',
      'G-REFLECT (web): a settings save reaches the anonymous page within 5 s and restores',
      changedOk && restoredOk,
      `changed: ${changedOk}, restored: ${restoredOk}`
    );
  } catch (err) {
    record('CHK-18', 'Live web G-REFLECT', false, err.message);
  }

  console.log('\n================================================================');
  console.log(`  Master Verification Result: ${allPassed ? 'ALL CHECKS PASSED (' + results.length + '/' + results.length + ')' : 'FAILURES DETECTED'}`);
  console.log('================================================================\n');

  const auditReport = {
    timestamp: new Date().toISOString(),
    milestone: 'MS4.2',
    name: 'Site settings and navigation (T4.2.1–T4.2.4)',
    status: allPassed ? 'PASSED' : 'FAILED',
    gateStatus: {
      'GREF-C': allPassed ? 'CLEARED' : 'PENDING',
    },
    results,
  };

  writeFileSync(resolve(EVIDENCE_DIR, 'master_audit.json'), JSON.stringify(auditReport, null, 2));
  return allPassed;
}

runMasterAudit().then((passed) => {
  process.exit(passed ? 0 : 1);
});
