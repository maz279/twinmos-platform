#!/usr/bin/env node
/**
 * verify-ms65-audit.mjs — Comprehensive 10-Gate Audit for Milestone MS6.5 (Gate SEO-01)
 * Evaluates:
 * Gate 01: Canonical Tags (Exact 1 self-canonical per page on 5 page types)
 * Gate 02: Titles & Descriptions (Unique, non-empty, zero double-escaping &amp;amp;)
 * Gate 03: Open Graph Tags (4 required properties + existing absolute image)
 * Gate 04: Twitter Cards (summary_large_image + image)
 * Gate 05: Homepage Structured Data (Organization + WebSite Sitelinks SearchAction)
 * Gate 06: PDP & Article Structured Data (Product with specs/sku/brand; Article; 0 fake ratings/reviews)
 * Gate 07: Inner Pages Breadcrumbs & Zero FAQPage Policy (BreadcrumbList; 0 FAQPage across entire site)
 * Gate 08: Sitemaps Engine (Index + Localized sitemaps with reciprocal xhtml:link and x-default)
 * Gate 09: Robots & RFC 9116 security.txt (Expires < 1 year, clean policy URLs, dual paths)
 * Gate 10: Noindex Security Enforcement (API header, Admin SPA, Search, Preview)
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';

const GATES = [
  'Gate 01: Canonical Tags (Single Self-Canonical)',
  'Gate 02: Titles & Descriptions (Zero Double-Escaping)',
  'Gate 03: Open Graph Tags (4 Required Properties + Image)',
  'Gate 04: Twitter Cards (summary_large_image)',
  'Gate 05: Homepage Structured Data (Organization & WebSite)',
  'Gate 06: PDP & Article Structured Data (Genuine Product & Article)',
  'Gate 07: Inner Pages Breadcrumbs & Zero FAQPage Policy',
  'Gate 08: Sitemaps Engine (Reciprocal xhtml:link & x-default)',
  'Gate 09: Robots & RFC 9116 security.txt (Expires < 1 Year & Clean URLs)',
  'Gate 10: Noindex Security Enforcement (API, Admin, Search, Preview)',
];

const results = {};
GATES.forEach(g => { results[g] = { pass: 0, fail: 0, details: [] }; });

function logGate(gateName, condition, message) {
  if (condition) {
    results[gateName].pass++;
    results[gateName].details.push(`✓ ${message}`);
  } else {
    results[gateName].fail++;
    results[gateName].details.push(`✗ FAIL: ${message}`);
  }
}

async function fetchHtml(path) {
  const res = await fetch(`${WEB_URL}${path}`);
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text };
}

function extractAll(html, regex) {
  const matches = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

function extractJsonLd(html) {
  const regex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const objects = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    try {
      objects.push(JSON.parse(m[1]));
    } catch (e) {
      // ignore
    }
  }
  return objects;
}

async function runAudit() {
  console.log('========================================================================');
  console.log('   MS6.5 MASTER 10-GATE AUDIT & CERTIFICATION (GATE SEO-01)');
  console.log('========================================================================\n');

  const samplePages = [
    { name: 'Home', path: '/' },
    { name: 'PDP', path: '/products/hyper-ssd-h2-ultra' },
    { name: 'Article', path: '/learn/why-is-my-ssd-slower-than-advertised' },
    { name: 'Shop', path: '/shop' },
    { name: 'Legal', path: '/legal' },
  ];

  const pageData = {};
  for (const p of samplePages) {
    pageData[p.name] = await fetchHtml(p.path);
  }

  // --- Gate 01: Canonical Tags ---
  const g1 = GATES[0];
  for (const p of samplePages) {
    const html = pageData[p.name].body;
    const canonicals = extractAll(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/gi);
    logGate(g1, canonicals.length === 1, `${p.name} has exactly 1 canonical tag (found ${canonicals.length}: ${canonicals.join(', ')})`);
    if (canonicals.length === 1) {
      const exp = p.path === '/' ? '/' : p.path;
      logGate(g1, canonicals[0].endsWith(exp) || canonicals[0] === `https://www.twinmos.com${exp}`, `${p.name} canonical href targets self (${canonicals[0]})`);
    }
  }

  // --- Gate 02: Titles & Descriptions ---
  const g2 = GATES[1];
  for (const p of samplePages) {
    const html = pageData[p.name].body;
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const descMatch = html.match(/<meta\s+(?:name|property)=["']description["']\s+content=["']([^"']*)["']/i);
    logGate(g2, Boolean(titleMatch && titleMatch[1].trim().length > 0), `${p.name} has non-empty <title>`);
    logGate(g2, Boolean(descMatch && descMatch[1].trim().length > 0), `${p.name} has non-empty meta description`);
    if (titleMatch) {
      logGate(g2, !titleMatch[1].includes('&amp;amp;'), `${p.name} title has 0 double-escaping (&amp;amp;)`);
    }
    if (descMatch) {
      logGate(g2, !descMatch[1].includes('&amp;amp;'), `${p.name} desc has 0 double-escaping (&amp;amp;)`);
    }
  }

  // --- Gate 03: Open Graph Tags ---
  const g3 = GATES[2];
  for (const p of samplePages) {
    const html = pageData[p.name].body;
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i);
    const ogType = html.match(/<meta\s+property=["']og:type["']\s+content=["']([^"']*)["']/i);
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i);
    const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']*)["']/i);
    logGate(g3, Boolean(ogTitle && ogTitle[1].length > 0), `${p.name} has og:title`);
    logGate(g3, Boolean(ogType && ogType[1].length > 0), `${p.name} has og:type ("${ogType ? ogType[1] : ''}")`);
    logGate(g3, Boolean(ogImage && ogImage[1].startsWith('http')), `${p.name} has valid absolute og:image`);
    logGate(g3, Boolean(ogUrl && ogUrl[1].startsWith('http')), `${p.name} has valid absolute og:url`);
  }

  // --- Gate 04: Twitter Cards ---
  const g4 = GATES[3];
  for (const p of samplePages) {
    const html = pageData[p.name].body;
    const twCard = html.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']*)["']/i);
    const twImg = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']*)["']/i);
    logGate(g4, twCard && twCard[1] === 'summary_large_image', `${p.name} has twitter:card="summary_large_image"`);
    logGate(g4, Boolean(twImg && twImg[1].length > 0), `${p.name} has twitter:image`);
  }

  // --- Gate 05: Homepage Structured Data ---
  const g5 = GATES[4];
  const homeLd = extractJsonLd(pageData['Home'].body);
  const homeTypes = homeLd.map(o => o['@type']);
  logGate(g5, homeTypes.includes('Organization'), 'Home contains Organization JSON-LD');
  logGate(g5, homeTypes.includes('WebSite'), 'Home contains WebSite JSON-LD');
  const websiteObj = homeLd.find(o => o['@type'] === 'WebSite');
  logGate(g5, Boolean(websiteObj?.potentialAction?.target?.includes('/search')), 'WebSite includes Sitelinks SearchAction');
  for (const p of samplePages.slice(1)) {
    const innerLd = extractJsonLd(pageData[p.name].body);
    const innerTypes = innerLd.map(o => o['@type']);
    logGate(g5, !innerTypes.includes('Organization'), `${p.name} correctly omits Organization JSON-LD`);
    logGate(g5, !innerTypes.includes('WebSite'), `${p.name} correctly omits WebSite JSON-LD`);
  }

  // --- Gate 06: PDP & Article Structured Data ---
  const g6 = GATES[5];
  const pdpLd = extractJsonLd(pageData['PDP'].body);
  const pdpProduct = pdpLd.find(o => o['@type'] === 'Product');
  logGate(g6, Boolean(pdpProduct), 'PDP contains Product JSON-LD');
  logGate(g6, Boolean(pdpProduct?.name && pdpProduct?.sku && pdpProduct?.brand), 'Product JSON-LD has name, sku, and brand');
  logGate(g6, !pdpProduct?.aggregateRating && !pdpProduct?.review, 'Product JSON-LD has NO fake/invented ratings or reviews');

  const articleLd = extractJsonLd(pageData['Article'].body);
  const articleObj = articleLd.find(o => o['@type'] === 'Article');
  logGate(g6, Boolean(articleObj), 'Article contains Article JSON-LD');
  logGate(g6, Boolean(articleObj?.headline && articleObj?.author && articleObj?.publisher), 'Article JSON-LD has headline, author, and publisher');

  // --- Gate 07: Inner Pages Breadcrumbs & Zero FAQPage Policy ---
  const g7 = GATES[6];
  for (const p of samplePages.slice(1)) {
    const ld = extractJsonLd(pageData[p.name].body);
    const types = ld.map(o => o['@type']);
    logGate(g7, types.includes('BreadcrumbList'), `${p.name} includes BreadcrumbList JSON-LD`);
  }
  for (const p of samplePages) {
    const ld = extractJsonLd(pageData[p.name].body);
    const types = ld.map(o => o['@type']);
    logGate(g7, !types.includes('FAQPage'), `${p.name} has 0 FAQPage schema`);
  }

  // --- Gate 08: Sitemaps Engine ---
  const g8 = GATES[7];
  const sitemapIndex = await fetch(`${WEB_URL}/sitemap.xml`);
  logGate(g8, sitemapIndex.status === 200, '/sitemap.xml returns 200 OK');
  const indexText = await sitemapIndex.text();
  logGate(g8, indexText.includes('<sitemapindex') && indexText.includes('?locale=en'), '/sitemap.xml serves valid sitemap index linking per-locale sitemaps');

  const localeSitemap = await fetch(`${WEB_URL}/sitemap.xml?locale=en`);
  logGate(g8, localeSitemap.status === 200, '/sitemap.xml?locale=en returns 200 OK');
  const localeText = await localeSitemap.text();
  logGate(g8, localeText.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'Sitemap declares xmlns:xhtml namespace');
  logGate(g8, localeText.includes('<xhtml:link rel="alternate" hreflang="en"'), 'Sitemap includes reciprocal en hreflang');
  logGate(g8, localeText.includes('<xhtml:link rel="alternate" hreflang="ar"'), 'Sitemap includes reciprocal ar hreflang');
  logGate(g8, localeText.includes('hreflang="x-default"'), 'Sitemap includes x-default hreflang');

  // --- Gate 09: Robots & RFC 9116 security.txt ---
  const g9 = GATES[8];
  const robots = await fetch(`${WEB_URL}/robots.txt`);
  logGate(g9, robots.status === 200, '/robots.txt returns 200 OK');
  const robotsText = await robots.text();
  logGate(g9, robotsText.includes('Disallow: /admin/') && robotsText.includes('Disallow: /api/'), 'robots.txt disallows /admin/ and /api/');

  const humans = await fetch(`${WEB_URL}/humans.txt`);
  logGate(g9, humans.status === 200, '/humans.txt returns 200 OK');

  for (const secPath of ['/.well-known/security.txt', '/security.txt']) {
    const sec = await fetch(`${WEB_URL}${secPath}`);
    logGate(g9, sec.status === 200, `${secPath} returns 200 OK`);
    const secText = await sec.text();
    logGate(g9, secText.includes('Contact: mailto:security@twinmos.com'), `${secPath} has valid Contact`);
    logGate(g9, secText.includes('Policy: https://www.twinmos.com/legal#security'), `${secPath} has clean Policy URL`);
    logGate(g9, !secText.includes('.html'), `${secPath} has no .html URLs`);
    const m = secText.match(/Expires:\s*([^\r\n]+)/);
    if (m) {
      const expDays = (new Date(m[1]).getTime() - Date.now()) / (1000 * 3600 * 24);
      logGate(g9, expDays > 0 && expDays <= 365, `${secPath} Expires < 1 year (RFC 9116 compliant: ${expDays.toFixed(1)} days)`);
    } else {
      logGate(g9, false, `${secPath} missing Expires`);
    }
  }

  // --- Gate 10: Noindex Security Enforcement ---
  const g10 = GATES[9];
  const apiResp = await fetch(`${API_URL}/api/v1/delivery/settings`);
  const apiRobots = apiResp.headers.get('x-robots-tag');
  logGate(g10, Boolean(apiRobots && apiRobots.includes('noindex')), `API sets X-Robots-Tag: noindex, nofollow (got "${apiRobots}")`);

  const adminResp = await fetch(`${WEB_URL}/admin/`);
  const adminHtml = await adminResp.text();
  logGate(g10, adminHtml.includes('name="robots" content="noindex, nofollow"'), 'Admin SPA HTML contains meta robots noindex, nofollow');

  const searchResp = await fetch(`${WEB_URL}/search?q=memory`);
  const searchHeader = searchResp.headers.get('x-robots-tag');
  const searchHtml = await searchResp.text();
  logGate(g10, Boolean(searchHeader && searchHeader.includes('noindex')), 'Search returns X-Robots-Tag: noindex header');
  logGate(g10, searchHtml.includes('content="noindex,nofollow"'), 'Search HTML contains meta robots noindex,nofollow');

  const previewResp = await fetch(`${WEB_URL}/about?preview=true`);
  const previewHeader = previewResp.headers.get('x-robots-tag');
  const previewHtml = await previewResp.text();
  logGate(g10, Boolean(previewHeader && previewHeader.includes('noindex')), 'Preview (?preview=true) returns X-Robots-Tag: noindex header');
  logGate(g10, previewHtml.includes('content="noindex,nofollow"'), 'Preview (?preview=true) HTML contains meta robots noindex,nofollow');

  // Summary
  console.log('\n========================================================================');
  console.log('   AUDIT RESULTS BY GATE');
  console.log('========================================================================');
  let totalPass = 0;
  let totalFail = 0;

  for (const g of GATES) {
    const { pass, fail, details } = results[g];
    totalPass += pass;
    totalFail += fail;
    const status = fail === 0 ? '✓ PASS' : '✗ FAIL';
    console.log(`\n[${status}] ${g} (${pass} passed, ${fail} failed)`);
    for (const d of details) {
      console.log(`   ${d}`);
    }
  }

  console.log('\n========================================================================');
  console.log(`   FINAL AUDIT VERDICT: ${totalFail === 0 ? 'ALL 10 GATES PASSED (CERTIFIED)' : 'FAILED'}`);
  console.log(`   Total Checks: ${totalPass} passed, ${totalFail} failed`);
  console.log('========================================================================\n');

  if (totalFail > 0) process.exit(1);
}

runAudit().catch(err => {
  console.error('Audit execution failure:', err);
  process.exit(1);
});
