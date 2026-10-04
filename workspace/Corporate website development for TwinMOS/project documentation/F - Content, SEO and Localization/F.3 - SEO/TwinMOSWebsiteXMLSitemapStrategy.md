# TwinMOS Website — XML Sitemap Strategy

**Document Reference:** TWN-F3-SITEMAP-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Front-End Lead
**Relates To:** Tech Stack §12.3; TwinMOSWebsiteSEO_Strategy.md §4.2

---

## Table of Contents

1. [Sitemap Architecture](#1-sitemap-architecture)
2. [Priority and Changefreq Assignments](#2-priority-and-changefreq-assignments)
3. [Exclusion List](#3-exclusion-list)
4. [robots.txt Policy](#4-robotstxt-policy)
5. [Astro `@astrojs/sitemap` Configuration](#5-astro-astrojssitemap-configuration)
6. [Sitemap Index Structure](#6-sitemap-index-structure)
7. [Per-Locale Sitemap and Hreflang in Sitemap](#7-per-locale-sitemap-and-hreflang-in-sitemap)
8. [News Sitemap (Phase 2)](#8-news-sitemap-phase-2)
9. [Image Sitemap](#9-image-sitemap)
10. [Submission to Search Engines](#10-submission-to-search-engines)
11. [Sitemap Validation](#11-sitemap-validation)
12. [Monitoring and Maintenance](#12-monitoring-and-maintenance)

---

## 1. Sitemap Architecture

TwinMOS uses a **sitemap index** that references multiple per-locale and per-type sitemaps. This keeps individual sitemap files under the 50 MB / 50,000 URL limits.

```
https://twinmos.com/sitemap-index.xml
│
├── https://twinmos.com/sitemap-en.xml          (EN pages — P1+)
├── https://twinmos.com/sitemap-ar.xml          (AR pages — P2+)
├── https://twinmos.com/sitemap-bn.xml          (BN pages — P2+)
├── https://twinmos.com/sitemap-hi.xml          (HI pages — P2+)
├── https://twinmos.com/sitemap-ru.xml          (RU pages — P3+)
├── https://twinmos.com/sitemap-zh-CN.xml       (ZH-CN pages — P3+)
├── https://twinmos.com/sitemap-fr.xml          (FR pages — P3+)
├── https://twinmos.com/sitemap-images.xml      (Image sitemap — P1+)
└── https://twinmos.com/sitemap-news.xml        (News sitemap — P2+, Strapi plugin)
```

**P1 Launch:** `sitemap-index.xml` → `sitemap-en.xml` + `sitemap-images.xml`
**P2 Launch:** Add `sitemap-ar.xml`, `sitemap-bn.xml`, `sitemap-hi.xml`, `sitemap-news.xml`
**P3 Launch:** Add `sitemap-ru.xml`, `sitemap-zh-CN.xml`, `sitemap-fr.xml`

---

## 2. Priority and Changefreq Assignments

### 2.1 Priority Values

`<priority>` is a hint to crawlers about relative importance (0.0–1.0). Google ignores changefreq but does use priority hints.

| Page Type | Priority | Rationale |
|-----------|---------|-----------|
| Homepage | 1.0 | Most important page |
| Product category hubs | 0.9 | High commercial intent; frequently crawled |
| Individual product detail pages | 0.8 | Core conversion pages |
| Buying guides (Learn Hub) | 0.8 | High-value SEO content |
| Gaming Hub | 0.8 | Brand hub |
| Support KB articles | 0.7 | High utility; traffic deflection |
| Solutions pages | 0.7 | B2B conversion |
| Technology pages | 0.7 | Brand authority |
| News / press releases | 0.6 | Regularly updated |
| Regional landing pages | 0.7 | Local SEO authority |
| About pages | 0.5 | Company info |
| Careers | 0.6 | Active hiring pages |
| Contact pages | 0.5 | Utility |
| Legal pages | 0.3 | Required but not SEO-priority |
| Learn Hub explainers | 0.7 | Topical authority |
| Partners pages | 0.6 | B2B audience |
| Where to Buy | 0.7 | High-intent commercial |

### 2.2 Changefreq Values

While Google largely ignores `<changefreq>`, it is included for legacy crawler compatibility and Bing.

| Page Type | Changefreq |
|-----------|-----------|
| Homepage | `daily` |
| Product category pages | `weekly` |
| Product detail pages | `monthly` |
| News / press releases | `weekly` |
| Events | `weekly` (until event date), then `yearly` |
| KB articles | `monthly` |
| Buying guides | `monthly` |
| Legal pages | `yearly` |
| About pages | `yearly` |
| Careers (job listings) | `weekly` |
| Regional pages | `monthly` |

---

## 3. Exclusion List

These URLs are excluded from all sitemaps (either via `@astrojs/sitemap` exclude pattern or by returning `noindex` via meta robots):

| URL Pattern | Reason |
|-------------|--------|
| `/admin/*` | CMS admin — blocked by `robots.txt` |
| `/api/*` | API endpoints — not for human/crawler consumption |
| `/partner/*` | Partner portal (Phase 2) — requires login |
| `/search/` | Search results page — `noindex` |
| `/*?q=*` | Search query URLs — `noindex`; blocked in `robots.txt` |
| `/marketing/newsletter/unsubscribe/` | Noindex |
| `/contact/*/confirm/` | Form confirmation pages — `noindex` |
| `/legal/sitemap/` | Human-readable sitemap — excluded (duplicate of XML sitemap) |
| `/products/compare/` (empty comparison) | Dynamic tool — `noindex` |
| Paginated pages beyond page 2 | `noindex` |
| Reserved stub pages (not yet published) | Unpublished in Strapi — not in build output |

---

## 4. robots.txt Policy

The `/robots.txt` file is a static Astro asset at `/public/robots.txt`:

```
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /partner/
Disallow: /*?q=*
Disallow: /search/

# Block aggressive AI scrapers (update periodically)
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://twinmos.com/sitemap-index.xml
```

### 4.1 Crawler-Specific Rules

| Crawler | Policy | Rationale |
|---------|--------|-----------|
| Googlebot | Allow all public content | Primary search engine |
| Bingbot | Allow all public content | Secondary search engine |
| GPTBot (OpenAI) | Disallow | Prevent AI training on product content |
| Google-Extended | Allow | Enables Google AI Overviews (beneficial) |
| CCBot (Common Crawl) | Disallow | Prevent AI training |
| Bytespider (TikTok) | Disallow | No benefit; bandwidth cost |

### 4.2 robots.txt Update Process

Any change to `robots.txt` requires:
1. Marketing Director approval.
2. Front-End Lead code review.
3. Post-deployment verification that the file is served correctly (`curl https://twinmos.com/robots.txt`).
4. Google Search Console notification (GSC auto-detects but verify in "robots.txt" report).

---

## 5. Astro `@astrojs/sitemap` Configuration

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://twinmos.com',
  integrations: [
    sitemap({
      // Exclude patterns
      filter: (page) => {
        const excluded = [
          '/admin/',
          '/api/',
          '/partner/',
          '/search/',
          '/contact/*/confirm/',
        ];
        return !excluded.some(pattern => page.includes(pattern));
      },
      // Custom priority per URL
      customPages: [],
      // i18n locale config (generates per-locale sitemaps)
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          ar: 'ar',
          bn: 'bn',
          hi: 'hi',
          ru: 'ru',            // Phase 3
          'zh-CN': 'zh-CN',   // Phase 3
          fr: 'fr',           // Phase 3
        }
      },
      // Serialize for custom priority and changefreq
      serialize(item) {
        // Homepage
        if (item.url === 'https://twinmos.com/') {
          return { ...item, priority: 1.0, changefreq: 'daily' };
        }
        // Product category pages
        if (/\/products\/(memory|ssd|portable|usb)\/$/.test(item.url)) {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        // Product detail pages
        if (/\/products\/.*\/[^/]+\/$/.test(item.url)) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        // Buying guides
        if (item.url.includes('/learn/buying-guide/')) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        // Support KB
        if (item.url.includes('/support/kb/')) {
          return { ...item, priority: 0.7, changefreq: 'monthly' };
        }
        // News
        if (item.url.includes('/news/')) {
          return { ...item, priority: 0.6, changefreq: 'weekly' };
        }
        // Legal
        if (item.url.includes('/legal/')) {
          return { ...item, priority: 0.3, changefreq: 'yearly' };
        }
        // Default
        return { ...item, priority: 0.5, changefreq: 'monthly' };
      }
    })
  ]
});
```

---

## 6. Sitemap Index Structure

The `sitemap-index.xml` generated by `@astrojs/sitemap`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://twinmos.com/sitemap-en.xml</loc>
    <lastmod>2026-05-01</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://twinmos.com/sitemap-ar.xml</loc>
    <lastmod>2026-09-01</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://twinmos.com/sitemap-images.xml</loc>
    <lastmod>2026-05-01</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://twinmos.com/sitemap-news.xml</loc>
    <lastmod>2026-09-01</lastmod>
  </sitemap>
</sitemapindex>
```

---

## 7. Per-Locale Sitemap and Hreflang in Sitemap

For each locale URL in the sitemap, include `<xhtml:link>` elements that mirror the hreflang `<link>` tags from the `<head>`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://twinmos.com/products/memory/ddr5/</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en"
                href="https://twinmos.com/products/memory/ddr5/" />
    <xhtml:link rel="alternate" hreflang="ar"
                href="https://twinmos.com/ar/products/memory/ddr5/" />
    <xhtml:link rel="alternate" hreflang="bn"
                href="https://twinmos.com/bn/products/memory/ddr5/" />
    <xhtml:link rel="alternate" hreflang="hi"
                href="https://twinmos.com/hi/products/memory/ddr5/" />
    <xhtml:link rel="alternate" hreflang="x-default"
                href="https://twinmos.com/products/memory/ddr5/" />
  </url>
</urlset>
```

`@astrojs/sitemap` with the `i18n` configuration generates `<xhtml:link>` entries automatically when locale routes are present.

---

## 8. News Sitemap (Phase 2)

The news sitemap is generated by the `strapi-sitemap-plugin` for news content types. It is separate from the main sitemap to comply with Google News Sitemap format requirements.

**Format:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://twinmos.com/news/press-releases/twinmos-voltx-ddr5-launch/</loc>
    <news:news>
      <news:publication>
        <news:name>TwinMOS Technologies</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2026-06-03T09:00:00+04:00</news:publication_date>
      <news:title>TwinMOS Launches VOLTX DDR5 6000MHz at COMPUTEX 2026</news:title>
    </news:news>
  </url>
</urlset>
```

**Rules:**
- Only articles published within the last 2 days are eligible for Google News Sitemap.
- The news sitemap is updated dynamically via Strapi lifecycle hooks.
- Maximum 1,000 URLs per news sitemap.

---

## 9. Image Sitemap

The image sitemap helps Google index product images for Google Image Search.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://twinmos.com/products/memory/voltx-ddr5-6000mhz-32gb/</loc>
    <image:image>
      <image:loc>https://cdn.twinmos.com/images/products/memory/ddr5/voltx-ddr5-6000-32gb_hero_black_1200x900@1x.webp</image:loc>
      <image:title>VOLTX DDR5 6000MHz 32GB U-DIMM Desktop Memory</image:title>
      <image:caption>VOLTX DDR5 U-DIMM running at 6000MHz with CL40 latency and Intel XMP 3.0 support</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://cdn.twinmos.com/images/products/memory/ddr5/voltx-ddr5-6000-32gb_pcb-top_black_800x600@1x.webp</image:loc>
      <image:title>VOLTX DDR5 PCB Top View</image:title>
    </image:image>
  </url>
</urlset>
```

The image sitemap is generated by the Astro build process, pulling image URLs from Strapi product entries.

---

## 10. Submission to Search Engines

### 10.1 Google Search Console

1. Verify the `twinmos.com` property in GSC (Domain property + URL prefix).
2. Navigate to: **Sitemaps** (left sidebar).
3. Enter: `sitemap-index.xml` → Submit.
4. GSC will auto-discover and process all linked child sitemaps.

### 10.2 Bing Webmaster Tools

1. Verify the `twinmos.com` property in Bing Webmaster Tools.
2. Navigate to: **Sitemaps**.
3. Submit: `https://twinmos.com/sitemap-index.xml`.

### 10.3 Automatic Discovery

Include the sitemap reference in `robots.txt`:
```
Sitemap: https://twinmos.com/sitemap-index.xml
```
This allows all crawlers (including those not listed in GSC/BWT) to discover the sitemap automatically.

### 10.4 Submit Individual Sitemaps on Phase Launch

When Phase 2 (AR/BN/HI) and Phase 3 (RU/ZH-CN/FR) sitemaps are added:
1. Update the `sitemap-index.xml` (automatic on deploy).
2. Re-ping GSC: **Sitemaps → Resubmit** or GSC auto-detects on next crawl.

---

## 11. Sitemap Validation

### 11.1 Automated Validation (CI)

A GitHub Actions workflow validates the sitemap on every production build:

```yaml
# .github/workflows/sitemap-validate.yml
- name: Validate sitemap
  run: |
    curl -f https://twinmos.com/sitemap-index.xml | xmllint --noout -
    echo "Sitemap index is valid XML"
```

### 11.2 Manual Validation Tools

- [Google Search Console Sitemap Report](https://search.google.com/search-console/sitemaps) — primary validation.
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html) — standalone validation.
- [Bing Webmaster Tools Sitemap Report](https://www.bing.com/webmasters/sitemap) — Bing-specific validation.
- [Screaming Frog Sitemap validation mode](https://www.screamingfrog.co.uk/seo-spider/) — crawl from sitemap and verify all URLs return 200.

### 11.3 Pre-Launch Checklist

- [ ] `sitemap-index.xml` is accessible at `https://twinmos.com/sitemap-index.xml`.
- [ ] All child sitemaps listed in the index are accessible.
- [ ] No URLs in the sitemap return 4xx or 5xx status codes.
- [ ] No `noindex` pages are included in the sitemap.
- [ ] All `<loc>` URLs use `https://` (not `http://`).
- [ ] All `<lastmod>` dates are in ISO 8601 format (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS+TZ`).
- [ ] Priority values are between 0.0 and 1.0.
- [ ] Hreflang `<xhtml:link>` entries are present for all active locales.
- [ ] Sitemap reference is present in `robots.txt`.
- [ ] Sitemap submitted to Google Search Console.
- [ ] Sitemap submitted to Bing Webmaster Tools.

---

## 12. Monitoring and Maintenance

### 12.1 Search Console Sitemap Report (Monthly)

- **Submitted URLs** vs **Indexed URLs** — a large gap indicates crawl issues or canonicalisation problems.
- **Errors** — any URL in the sitemap that returns an error code.
- **Warnings** — noindex pages in sitemap (fix by removing from sitemap or removing noindex).

### 12.2 Sitemap Regeneration Trigger

The sitemap is regenerated on every Cloudflare Pages production build (triggered by merges to `main`). This means:
- New product pages added to Strapi → sitemap updated on next deploy.
- Archived pages → removed from sitemap on next deploy.

For urgent sitemap updates (e.g., major product launch), trigger a manual Cloudflare Pages deployment from the dashboard.

### 12.3 Annual Sitemap Audit

Once per year (January), run a full sitemap audit:
1. Extract all URLs from `sitemap-en.xml`.
2. Crawl each URL with Screaming Frog — verify 200 status and no noindex.
3. Compare against actual Strapi published content to identify orphan pages.
4. Compare Search Console indexed pages against sitemap URLs — identify pages Google found but are not in the sitemap.

---

*Related: [SEO Strategy](TwinMOSWebsiteSEO_Strategy.md) | [Hreflang Implementation](TwinMOSWebsiteHreflang_Implementation.md) | [URL Structure Spec](TwinMOSWebsiteURLStructureSpec.md) | [Search Console Setup Guide](TwinMOSWebsiteSearchConsoleSetup_Guide.md)*
