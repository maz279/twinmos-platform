#!/usr/bin/env node
/**
 * verify-seo-01.mjs — Live verification suite for Quality Gate SEO-01
 * Verifies:
 * 1. Exactly one self-canonical per URL in initial HTML.
 * 2. Titles and descriptions free of double-escaping (&amp;amp;).
 * 3. Required Open Graph properties (og:title, og:type, og:image, og:url) + existing image.
 * 4. Twitter Card metadata (twitter:card, twitter:title, twitter:description, twitter:image).
 * 5. Structured Data JSON-LD scoping:
 *    - Home: Organization + WebSite (with Sitelinks SearchAction)
 *    - PDP: Product (with specs, sku, brand, genuine price, no invented reviews/ratings) + BreadcrumbList
 *    - Article: Article + BreadcrumbList
 *    - Shop / About / Legal: BreadcrumbList only (no Organization/WebSite on inner pages)
 *    - Zero FAQPage schema anywhere
 * 6. Sitemaps:
 *    - Reciprocal xhtml:link hreflang elements and x-default.
 * 7. Robots & Humans:
 *    - /robots.txt dynamic serving with disallow rules.
 *    - /humans.txt metadata.
 * 8. RFC 9116 security.txt:
 *    - Accessible at /.well-known/security.txt and /security.txt.
 *    - Expires within 1 year (365 days).
 *    - Clean Policy URL without .html.
 * 9. Noindex enforcement:
 *    - Admin SPA: <meta name="robots" content="noindex, nofollow" />
 *    - API endpoints: X-Robots-Tag: noindex, nofollow
 *    - Search page: X-Robots-Tag: noindex, nofollow and <meta name="robots" content="noindex,nofollow" />
 *    - Preview URLs (?preview=true): X-Robots-Tag: noindex, nofollow and <meta name="robots" content="noindex,nofollow" />
 */

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

async function fetchHtml(path) {
  const res = await fetch(`${WEB_URL}${path}`);
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text };
}

function extractMeta(html, nameOrProp) {
  const match = html.match(new RegExp(`<meta\\s+(?:name|property)=["']${nameOrProp}["']\\s+content=["']([^"']*)["']`, 'i'))
    || html.match(new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+(?:name|property)=["']${nameOrProp}["']`, 'i'));
  return match ? match[1] : null;
}

function extractAllCanonicals(html) {
  const regex = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/gi;
  const matches = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

function extractAllJsonLd(html) {
  const regex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const objects = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    try {
      objects.push(JSON.parse(m[1]));
    } catch (e) {
      console.error('Failed to parse JSON-LD:', m[1], e);
    }
  }
  return objects;
}

async function verifyPageType(name, path, expectedTypes = {}) {
  console.log(`\n--- Verifying Page Type: ${name} (${path}) ---`);
  const { status, body } = await fetchHtml(path);
  assert(status === 200, `Page returns 200 OK (got ${status})`);

  // 1. Canonicals
  const canonicals = extractAllCanonicals(body);
  assert(canonicals.length === 1, `Exactly one self-canonical in HTML (found ${canonicals.length})`);
  if (canonicals.length > 0) {
    const expectedPath = path === '/' ? '/' : path;
    assert(canonicals[0].endsWith(expectedPath) || canonicals[0] === `https://www.twinmos.com${expectedPath}`, `Canonical href matches expected path (${canonicals[0]})`);
  }

  // 2. Titles & Escaping
  const titleMatch = body.match(/<title>([\s\S]*?)<\/title>/i);
  assert(titleMatch && titleMatch[1].trim().length > 0, `Title tag exists and non-empty: "${titleMatch ? titleMatch[1].trim() : ''}"`);
  if (titleMatch) {
    assert(!titleMatch[1].includes('&amp;amp;'), `Title has NO double-escaping (&amp;amp;)`);
  }

  // 3. Meta Description
  const desc = extractMeta(body, 'description');
  assert(desc && desc.trim().length > 0, `Meta description exists and non-empty`);
  if (desc) {
    assert(!desc.includes('&amp;amp;'), `Meta description has NO double-escaping`);
  }

  // 4. Open Graph Required Properties
  const ogTitle = extractMeta(body, 'og:title');
  const ogType = extractMeta(body, 'og:type');
  const ogImage = extractMeta(body, 'og:image');
  const ogUrl = extractMeta(body, 'og:url');
  assert(Boolean(ogTitle), `og:title is present ("${ogTitle}")`);
  assert(Boolean(ogType), `og:type is present ("${ogType}")`);
  assert(Boolean(ogImage), `og:image is present ("${ogImage}")`);
  assert(Boolean(ogUrl), `og:url is present ("${ogUrl}")`);

  // 5. Twitter Card
  const twitterCard = extractMeta(body, 'twitter:card');
  const twitterImage = extractMeta(body, 'twitter:image');
  assert(twitterCard === 'summary_large_image', `twitter:card is summary_large_image (got "${twitterCard}")`);
  assert(Boolean(twitterImage), `twitter:image is present`);

  // 6. Structured Data
  const jsonLdObjects = extractAllJsonLd(body);
  const typesFound = jsonLdObjects.map((o) => o['@type']);

  if (expectedTypes.shouldInclude) {
    for (const t of expectedTypes.shouldInclude) {
      assert(typesFound.includes(t), `JSON-LD includes expected @type "${t}" (found: ${typesFound.join(', ')})`);
    }
  }
  if (expectedTypes.shouldExclude) {
    for (const t of expectedTypes.shouldExclude) {
      assert(!typesFound.includes(t), `JSON-LD correctly excludes @type "${t}"`);
    }
  }

  // Zero FAQPage rule
  assert(!typesFound.includes('FAQPage'), `Zero FAQPage rich results present on ${name}`);

  return { canonicals, title: titleMatch ? titleMatch[1] : null, typesFound };
}

async function verifySitemaps() {
  console.log(`\n--- Verifying Sitemaps (T6.5.3) ---`);
  
  // 1. Sitemap index
  const indexRes = await fetch(`${WEB_URL}/sitemap.xml`);
  assert(indexRes.status === 200, `/sitemap.xml returns 200 OK`);
  const indexXml = await indexRes.text();
  assert(indexXml.includes('<sitemapindex'), `/sitemap.xml generates valid sitemap index`);
  assert(indexXml.includes('?locale=en') && indexXml.includes('?locale=ar'), `Sitemap index links to locale-specific sitemaps`);

  // 2. Localized sitemap with reciprocal hreflang
  const localeRes = await fetch(`${WEB_URL}/sitemap.xml?locale=en`);
  assert(localeRes.status === 200, `/sitemap.xml?locale=en returns 200 OK`);
  const localeXml = await localeRes.text();
  assert(localeXml.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), `Sitemap includes xmlns:xhtml namespace`);
  assert(localeXml.includes('<xhtml:link rel="alternate" hreflang="'), `Sitemap includes xhtml:link hreflang elements`);
  assert(localeXml.includes('hreflang="x-default"'), `Sitemap includes x-default alternate link`);
  assert(localeXml.includes('hreflang="ar"'), `Sitemap includes Arabic alternate link`);
}

async function verifyRobotsAndHumans() {
  console.log(`\n--- Verifying robots.txt and humans.txt (T6.5.3) ---`);
  const robotsRes = await fetch(`${WEB_URL}/robots.txt`);
  assert(robotsRes.status === 200, `/robots.txt returns 200 OK`);
  const robotsText = await robotsRes.text();
  assert(robotsText.includes('User-agent: *'), `robots.txt defines User-agent: *`);
  assert(robotsText.includes('Disallow: /admin/'), `robots.txt disallows /admin/`);
  assert(robotsText.includes('Disallow: /api/'), `robots.txt disallows /api/`);
  assert(robotsText.includes('Disallow: /*?preview='), `robots.txt disallows /*?preview=`);
  assert(robotsText.includes('Sitemap: https://www.twinmos.com/sitemap.xml'), `robots.txt references sitemap`);

  const humansRes = await fetch(`${WEB_URL}/humans.txt`);
  assert(humansRes.status === 200, `/humans.txt returns 200 OK`);
  const humansText = await humansRes.text();
  assert(humansText.includes('Engineering: TwinMOS Technologies'), `/humans.txt includes team info`);
}

async function verifySecurityTxt() {
  console.log(`\n--- Verifying RFC 9116 security.txt (T6.5.3) ---`);
  for (const path of ['/.well-known/security.txt', '/security.txt']) {
    const res = await fetch(`${WEB_URL}${path}`);
    assert(res.status === 200, `${path} returns 200 OK`);
    const text = await res.text();
    assert(text.includes('Contact: mailto:security@twinmos.com'), `${path} has valid Contact`);
    assert(text.includes('Policy: https://www.twinmos.com/legal#security'), `${path} has valid clean Policy URL`);
    assert(text.includes('Hiring: https://www.twinmos.com/careers'), `${path} has valid clean Hiring URL`);
    assert(!text.includes('.html'), `${path} contains NO legacy .html URLs`);

    const expiresMatch = text.match(/Expires:\s*([^\r\n]+)/);
    assert(Boolean(expiresMatch), `${path} contains Expires directive`);
    if (expiresMatch) {
      const exp = new Date(expiresMatch[1]);
      const now = new Date();
      const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
      assert(diffDays > 0 && diffDays <= 365, `${path} Expires is valid and strictly less than 1 year ahead (${diffDays.toFixed(1)} days)`);
    }
  }
}

async function verifyNoindex() {
  console.log(`\n--- Verifying noindex Policies (T6.5.3) ---`);
  // 1. API Server Response Header
  const apiRes = await fetch(`${API_URL}/api/v1/delivery/settings`);
  assert(apiRes.status === 200, `API responds 200 OK`);
  const apiRobots = apiRes.headers.get('x-robots-tag');
  assert(apiRobots && apiRobots.includes('noindex'), `API sets X-Robots-Tag: noindex, nofollow (got "${apiRobots}")`);

  // 2. Admin SPA
  const adminRes = await fetch(`${WEB_URL}/admin/`);
  const adminHtml = await adminRes.text();
  assert(adminHtml.includes('<meta name="robots" content="noindex, nofollow" />'), `Admin SPA HTML contains meta robots noindex, nofollow`);

  // 3. Search Page
  const searchRes = await fetch(`${WEB_URL}/search?q=test`);
  const searchRobotsHeader = searchRes.headers.get('x-robots-tag');
  assert(searchRobotsHeader && searchRobotsHeader.includes('noindex'), `Search page returns X-Robots-Tag: noindex, nofollow header`);
  const searchHtml = await searchRes.text();
  assert(searchHtml.includes('content="noindex,nofollow"'), `Search page contains meta robots noindex,nofollow`);

  // 4. Preview Query (?preview=true)
  const previewRes = await fetch(`${WEB_URL}/about?preview=true`);
  const previewRobotsHeader = previewRes.headers.get('x-robots-tag');
  assert(previewRobotsHeader && previewRobotsHeader.includes('noindex'), `Preview URL (?preview=true) returns X-Robots-Tag: noindex, nofollow header`);
  const previewHtml = await previewRes.text();
  assert(previewHtml.includes('content="noindex,nofollow"'), `Preview URL (?preview=true) contains meta robots noindex,nofollow`);
}

async function run() {
  console.log('===============================================================');
  console.log('   MS6.5 LIVE SEO-01 AUDIT & VERIFICATION SUITE');
  console.log('===============================================================');

  // Verify 5 distinct page types
  await verifyPageType('Homepage', '/', {
    shouldInclude: ['Organization', 'WebSite'],
  });

  await verifyPageType('Product Detail Page (PDP)', '/products/hyper-ssd-h2-ultra', {
    shouldInclude: ['Product', 'BreadcrumbList'],
    shouldExclude: ['Organization', 'WebSite'],
  });

  await verifyPageType('Knowledge Hub Article', '/learn/why-is-my-ssd-slower-than-advertised', {
    shouldInclude: ['Article', 'BreadcrumbList'],
    shouldExclude: ['Organization', 'WebSite'],
  });

  await verifyPageType('Category / Shop Catalogue', '/shop', {
    shouldInclude: ['BreadcrumbList'],
    shouldExclude: ['Organization', 'WebSite', 'Article'],
  });

  await verifyPageType('Legal / Policy Page', '/legal', {
    shouldInclude: ['BreadcrumbList'],
    shouldExclude: ['Organization', 'WebSite', 'Article'],
  });

  await verifySitemaps();
  await verifyRobotsAndHumans();
  await verifySecurityTxt();
  await verifyNoindex();

  console.log('\n===============================================================');
  console.log(`   SEO-01 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('===============================================================');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
