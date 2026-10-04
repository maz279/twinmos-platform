# TwinMOS Corporate Website — SEO Migration Plan

**Document Reference:** TWN-MKT-SEO-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 30 April 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Marketing Director  
**Owner:** Marketing Director (SEO) / Dev A (Technical Implementation)  
**Audience:** Marketing, Development, Content, Executive Leadership  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0, RFP v3.0, Tech Stack v1.1, Content Map v1.0, Launch Plan v1.0, Forensic Audit v1.0

---

## 1. Executive Summary

The current TwinMOS.com suffers from **severe SEO deficiencies**: multiple 404 errors blocking crawlers, missing XML sitemap, no structured data, duplicate content, thin category pages, and zero organic search visibility (Forensic Audit v1.0 §5).

This SEO Migration Plan ensures the rebuilt TwinMOS.com:
- **Recovers** any residual SEO equity from legacy URLs via 301 redirects
- **Establishes** a best-practice technical SEO foundation
- **Optimizes** 287 content entries + 100+ SKU pages for organic discovery
- **Supports** 28 regional markets with hreflang and localized signals
- **Targets** 200% organic traffic growth within 12 months of launch

---

## 2. Current State SEO Assessment

### 2.1 Critical SEO Failures (Legacy Site)

| Issue | Severity | Evidence | Impact |
|-------|----------|----------|--------|
| Multiple 404 errors on core product pages | Critical | `/product-category/memory-module/` 404; product URLs 404 | Crawlers cannot index products; lost ranking equity |
| Server errors blocking crawlers | Critical | `/privacy-policy/`, `/support/`, `/warranty/` return errors | Poor indexation; potential de-indexing |
| No XML sitemap | Critical | No `/sitemap.xml` detected | Search engines cannot discover pages efficiently |
| Missing or poor meta descriptions | High | Generic "TwinMOS Technologies" titles across pages | Poor CTR from search results |
| Duplicate content | High | Same Taipei address on homepage, brand page, category pages | Potential duplicate content penalty |
| No Schema.org structured data | High | No rich snippet eligibility | Missed rich results (products, FAQs, breadcrumbs) |
| Thin content on category pages | High | SSD category has zero descriptive text | Google may classify as low-quality |
| No keyword-optimized product copy | High | Generic blurbs instead of keyword-rich copy | Poor ranking for product searches |
| Broken internal links | High | Category pages linking to non-existent products | Diluted page authority |
| No hreflang or canonical strategy | Medium | Single-language site with no localization signals | Cannot serve international markets |
| Missing Open Graph / Twitter Cards | Medium | No social sharing optimization | Weak social media presence |
| No robots.txt optimization | Medium | Unable to verify crawl directives | Potential indexing of private/broken pages |

### 2.2 SEO Baseline (Pre-Launch)

| Metric | Current Value | Target (Month 3) | Target (Month 12) |
|--------|---------------|------------------|-------------------|
| Indexed pages (Google) | ~15 (estimated; many broken) | 300+ | 400+ |
| Organic sessions/month | ~500 (estimated) | 2,000 | 5,000+ |
| Organic traffic share | ~20% | 35% | 50% |
| Bounce rate (organic) | > 70% | < 50% | < 40% |
| Average position (branded) | #3–5 | #1 | #1 |
| Average position (non-branded) | Not ranking | Page 2–3 | Page 1 |
| Domain authority | Low | Medium | Medium-High |
| Backlinks | Minimal | 50+ new quality links | 200+ |

---

## 3. SEO Migration Strategy

### 3.1 Migration Approach: "Clean Slate with Redirects"

Given the legacy site's extensive technical failures and minimal salvageable SEO equity, the strategy is:

1. **New URL architecture** — Clean, descriptive URLs (no WordPress parameter cruft).
2. **Comprehensive 301 redirects** — Every legacy URL mapped to its new equivalent.
3. **Fresh technical foundation** — Sitemap, structured data, canonicals, hreflang from day one.
4. **Content amplification** — 287 optimized pages with unique meta data and internal linking.

---

## 4. URL Architecture & Redirects

### 4.1 Legacy URL Patterns → New URLs

| Legacy URL Pattern | New URL | Redirect Type | Priority |
|--------------------|---------|---------------|----------|
| `/?page_id=123` (WordPress) | Relevant content page | 301 | High |
| `/product-category/[slug]/` | `/products/[category]/` | 301 | High |
| `/product/twinmos-[product-slug]/` | `/products/[category]/[product-slug]/` | 301 | High |
| `/product-brand/twinmos/` | `/products/brands/` | 301 | Medium |
| `/about-us/` | `/about/` | 301 | High |
| `/contact/` | `/contact/` | 301 (if same) or 301 to hub | High |
| `/category/product-news/` | `/news-events/` | 301 | Medium |
| `/twinmos-to-showcase-[event]/` | `/news-events/[event-slug]/` | 301 | Medium |
| `/privacy-policy/` | `/legal/privacy-policy/` | 301 | High |
| `/terms-and-conditions/` | `/legal/terms-of-use/` | 301 | High |
| `/warranty/[slug]/` | `/support/warranty/` | 301 | Medium |
| `/support/` | `/support/` | 301 (if same) or 301 to hub | High |
| `/product-category/memory-module/` (404) | `/products/memory/` | 301 | High |
| `/product-category/solid-state-drive/` (broken) | `/products/ssd/` | 301 | High |

### 4.2 Redirect Implementation

**Tool:** `strapi-plugin-redirect` (managed in Strapi admin) + Cloudflare Page Rules for bulk patterns.

**Redirect rules (examples):**

```
# WordPress product categories
Redirect 301 /product-category/memory-module/ /products/memory/
Redirect 301 /product-category/solid-state-drive/ /products/ssd/
Redirect 301 /product-category/usb-flash-drive/ /products/usb-flash/
Redirect 301 /product-category/portable-storage/ /products/portable-storage/

# WordPress product pages (pattern match)
RedirectMatch 301 ^/product/twinmos-(.+)$ /products/$1

# About and company
Redirect 301 /about-us/ /about/
Redirect 301 /about-us/history/ /about/history/

# News
Redirect 301 /category/product-news/ /news-events/
Redirect 301 /twinmos-to-showcase-(.+) /news-events/computex-2025/

# Support
Redirect 301 /warranty/product-lifetime/ /support/warranty/
Redirect 301 /support/ /support/

# Legal
Redirect 301 /privacy-policy/ /legal/privacy-policy/
Redirect 301 /terms-and-conditions/ /legal/terms-of-use/
```

**Validation:** Screaming Frog crawl of all legacy URLs to confirm 301 → 200 chain.

---

## 5. Technical SEO Implementation

### 5.1 XML Sitemap

**Auto-generation:** `@astrojs/sitemap` integration with i18n support.

**Sitemap structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://twinmos.com/sitemap-0.xml</loc>
    <lastmod>2026-05-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://twinmos.com/sitemap-products.xml</loc>
    <lastmod>2026-05-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://twinmos.com/sitemap-news.xml</loc>
    <lastmod>2026-05-15</lastmod>
  </sitemap>
</sitemapindex>
```

**Sitemap segmentation:**
| Sitemap | Contents | Priority | Changefreq |
|---------|----------|----------|------------|
| `sitemap-0.xml` | Static pages (home, about, support, contact, legal) | 1.0 | monthly |
| `sitemap-products.xml` | Product category + SKU pages | 0.9 | weekly |
| `sitemap-news.xml` | News articles, press releases, events | 0.8 | daily |
| `sitemap-regional.xml` | 28 country/region landing pages | 0.7 | monthly |
| `sitemap-learn.xml` | Learn hub articles, buying guides, glossary | 0.6 | monthly |

**Submission:**
- Google Search Console
- Bing Webmaster Tools
- Yandex Webmaster (CIS market)

### 5.2 robots.txt

```
User-agent: *
Allow: /

# Sitemap
Sitemap: https://twinmos.com/sitemap-index.xml

# Disallow admin and API
Disallow: /admin/
Disallow: /api/
Disallow: /preview/
Disallow: /legal/data-deletion-request/thank-you/

# Crawl delay for aggressive bots
User-agent: AhrefsBot
Crawl-delay: 2

User-agent: SemrushBot
Crawl-delay: 2
```

### 5.3 Canonical URLs

Every page includes a self-referencing canonical:
```html
<link rel="canonical" href="https://twinmos.com/products/memory/ddr5/voltx-udimm/" />
```

**Canonical rules:**
- Product pages with filters: canonical = base URL (no query params)
- Pagination: canonical = page N; rel=prev/next deprecated (Google no longer supports)
- Regional pages: canonical = language-specific URL

### 5.4 Hreflang Implementation

**28 regional pages × 9 locales = 252 hreflang combinations (stubs for Phase 2+).**

Example for product page:
```html
<link rel="alternate" hreflang="en" href="https://twinmos.com/products/voltx-ddr5-5600mhz-16gb/" />
<link rel="alternate" hreflang="ar" href="https://twinmos.com/ar/products/voltx-ddr5-5600mhz-16gb/" />
<link rel="alternate" hreflang="bn" href="https://twinmos.com/bn/products/voltx-ddr5-5600mhz-16gb/" />
<link rel="alternate" hreflang="hi" href="https://twinmos.com/hi/products/voltx-ddr5-5600mhz-16gb/" />
<link rel="alternate" hreflang="ru" href="https://twinmos.com/ru/products/voltx-ddr5-5600mhz-16gb/" />
<link rel="alternate" hreflang="zh-CN" href="https://twinmos.com/zh-CN/products/voltx-ddr5-5600mhz-16gb/" />
<link rel="alternate" hreflang="fr" href="https://twinmos.com/fr/products/voltx-ddr5-5600mhz-16gb/" />
<link rel="alternate" hreflang="x-default" href="https://twinmos.com/products/voltx-ddr5-5600mhz-16gb/" />
```

**Validation:** Google Search Console → International Targeting report.

---

## 6. Structured Data (Schema.org)

### 6.1 Schema Types by Page

| Page Type | Primary Schema | Secondary Schema |
|-----------|---------------|------------------|
| Homepage | `WebSite`, `Organization` | `SiteNavigationElement` |
| Product Detail | `Product` | `Offer`, `AggregateRating`, `FAQPage` |
| Product Category | `ItemList` | `BreadcrumbList` |
| About | `Organization` | `BreadcrumbList` |
| News Article | `NewsArticle` | `BreadcrumbList`, `Organization` |
| Press Release | `NewsArticle` | `BreadcrumbList` |
| Event | `Event` | `BreadcrumbList`, `Organization` |
| KB Article | `Article`, `HowTo` | `FAQPage` |
| FAQ Page | `FAQPage` | — |
| Contact / Office | `LocalBusiness` | `BreadcrumbList` |
| Careers | `JobPosting` (per role) | `Organization` |
| Leadership Profile | `Person` | `BreadcrumbList` |
| Review / Testimonial | `Review` | — |
| Where to Buy (retailer) | `LocalBusiness` | `BreadcrumbList` |

### 6.2 Product Schema Example (CoreX Pro)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "TwinMOS CoreX Pro 1TB PCIe Gen 5.0 NVMe M.2 SSD",
  "image": [
    "https://twinmos.com/images/products/corex-pro-1tb-hero.webp",
    "https://twinmos.com/images/products/corex-pro-1tb-gallery-1.webp"
  ],
  "description": "PCIe Gen 5.0 ×4 NVMe M.2 2280 SSD with read speeds up to 14,000 MB/s. DRAM cache, graphene heatsink, 5-year warranty.",
  "sku": "COREX-PRO-1TB-G5",
  "brand": {
    "@type": "Brand",
    "name": "TwinMOS"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://twinmos.com/products/ssd/corex-pro/",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "TwinMOS Technologies"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "128"
  }
}
```

### 6.3 Organization Schema (Global)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TwinMOS Technologies",
  "url": "https://twinmos.com",
  "logo": "https://twinmos.com/assets/logo-twinmos.svg",
  "sameAs": [
    "https://www.linkedin.com/company/twinmos-technologies/",
    "https://www.facebook.com/twinmos.tech",
    "https://twitter.com/twinmos"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+971-4-2996421",
    "contactType": "customer service",
    "areaServed": "AE,BD,IN,SA,QA,EG,ZA,NG,KE,RU",
    "availableLanguage": ["English", "Arabic", "Hindi"]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "C-9, Dubai Airport Free Zone (DAFZA)",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  }
}
```

---

## 7. On-Page SEO

### 7.1 Meta Data Standards

| Element | Specification | Example |
|---------|---------------|---------|
| Title tag | ≤ 60 chars; unique; keyword-first; brand at end | `VOLTX DDR5 6000MHz 32GB RAM | TwinMOS` |
| Meta description | ≤ 160 chars; unique; CTA; value proposition | `Upgrade with VOLTX DDR5 6000MHz 32GB U-DIMM. Intel XMP 3.0, on-die ECC, lifetime warranty. Shop authorized retailers worldwide.` |
| Canonical URL | Absolute URL; self-referencing | `https://twinmos.com/products/memory/ddr5/voltx-udimm/` |
| OG title | Matches page title | Same as title |
| OG description | Matches meta description | Same as description |
| OG image | 1200×630px; unique per page type | `/og/voltx-ddr5-6000-32gb.jpg` |
| Twitter card | `summary_large_image` | — |

### 7.2 Keyword Strategy

**Primary keywords per section:**

| Section | Primary Keywords | Long-Tail Targets |
|---------|-----------------|-------------------|
| DDR5 Memory | "DDR5 RAM", "DDR5 memory module" | "best DDR5 RAM for gaming", "DDR5 6000MHz 32GB" |
| DDR4 Memory | "DDR4 RAM", "DDR4 memory" | "DDR4 3200MHz 16GB", "budget DDR4 RAM" |
| NVMe SSD | "NVMe SSD", "M.2 SSD", "PCIe Gen 4 SSD" | "best NVMe SSD 2026", "1TB NVMe Gen 5 SSD" |
| SATA SSD | "SATA SSD", "2.5 inch SSD" | "upgrade laptop to SSD", "budget SATA SSD 1TB" |
| Portable SSD | "portable SSD", "external SSD" | "best portable SSD for video editing" |
| Gaming | "gaming RAM", "RGB RAM", "gaming SSD" | "best RAM for RGB build", "DDR5 RGB 6000MHz" |
| Support | "RAM compatibility", "SSD warranty" | "how to check RAM compatibility", "TwinMOS warranty check" |

### 7.3 Internal Linking Strategy

**Hub-and-spoke model:**
- **Hubs:** Product category pages, Solutions hub, Learn hub
- **Spokes:** SKU pages, buying guides, FAQ articles, case studies

**Linking rules:**
- Every SKU page links to its category hub and related SKUs (3–5).
- Every article links to relevant product pages and other articles.
- Breadcrumb navigation on all pages (except homepage).
- Footer links to top-level categories.

---

## 8. Content SEO

### 8.1 Content Optimization Checklist (Per Page)

| # | Item | Standard |
|---|------|----------|
| 8.1.1 | Unique H1 | One per page; includes primary keyword |
| 8.1.2 | H2–H6 structure | Logical hierarchy; keywords in subheadings |
| 8.1.3 | First paragraph | Primary keyword in first 100 words |
| 8.1.4 | Image alt text | Descriptive; keyword where natural |
| 8.1.5 | Internal links | 3–5 per page to relevant pages |
| 8.1.6 | Word count | Product pages: 300–500 words; articles: 800–2,000 words |
| 8.1.7 | Readability | Flesch-Kincaid 60–70 (accessible to non-native speakers) |
| 8.1.8 | FAQ sections | Expandable accordion; targets voice search |
| 8.1.9 | Video embeds | YouTube with schema markup; lazy-loaded |
| 8.1.10 | Update frequency | News: weekly; products: monthly; legal: annually |

### 8.2 Content Quantity Targets

| Content Type | Launch (P1) | Month 3 | Month 6 | Month 12 |
|--------------|-------------|---------|---------|----------|
| Product pages | 100+ | 120+ | 150+ | 200+ |
| News articles | 3+ | 10+ | 20+ | 40+ |
| Learn hub articles | 64 | 70 | 80 | 100+ |
| Case studies | 0 (P2) | 2 | 5 | 10+ |
| Video content | 0 | 3 | 8 | 15+ |

---

## 9. Regional & Multi-Language SEO

### 9.1 Regional Page Strategy

**27 country/region pages** targeting local search intent:

| Region | Local Keyword Angle | Hreflang |
|--------|---------------------|----------|
| UAE-GCC | "RAM Dubai", "SSD UAE" | `en-AE`, `ar-AE` (P2) |
| India | "DDR5 RAM India", "NVMe SSD price India" | `en-IN`, `hi-IN` (P2) |
| Saudi Arabia | "RAM KSA", "SSD Saudi Arabia" | `en-SA`, `ar-SA` (P2) |
| Russia-CIS | "Оперативная память DDR5", "SSD NVMe купить" | `ru-RU` (P3) |
| Europe | "DDR5 RAM Europe", "SSD EU" | `en-GB`, `fr-FR` (P3) |

### 9.2 Local Business Schema (Regional Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "TwinMOS Technologies Middle East FZE",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "C-9, DAFZA",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  },
  "telephone": "+971-4-2996421",
  "url": "https://twinmos.com/regional/uae-gcc/"
}
```

---

## 10. Post-Launch SEO Monitoring

### 10.1 Week 1 (Critical Period)

| Task | Frequency | Tool | Owner |
|------|-----------|------|-------|
| Google Search Console coverage report | Daily | GSC | Marketing |
| Index status check | Daily | `site:twinmos.com` | Marketing |
| 404 crawl errors | Daily | GSC + Screaming Frog | Dev A |
| Structured data validation | Daily | GSC + Rich Results Test | Marketing |
| Core Web Vitals field data | Daily | GSC + CrUX | Dev A |

### 10.2 Month 1–3 (Establishment)

| Task | Frequency | Tool | Owner |
|------|-----------|------|-------|
| Rank tracking (20 keywords) | Weekly | SEMrush / Ahrefs | Marketing |
| Backlink monitoring | Weekly | Ahrefs / Moz | Marketing |
| Content gap analysis | Bi-weekly | Ahrefs Content Gap | Marketing |
| Competitor SEO tracking | Monthly | SEMrush | Marketing |
| Internal link audit | Monthly | Screaming Frog | Dev A |
| Page speed monitoring | Monthly | Lighthouse CI | Dev A |

### 10.3 Month 6–12 (Growth)

| Task | Frequency | Tool | Owner |
|------|-----------|------|-------|
| Full SEO audit | Quarterly | Multiple | Marketing |
| Content refresh (top 20 pages) | Quarterly | GA4 + GSC | Marketing |
| New keyword targeting | Quarterly | Keyword research | Marketing |
| Link building outreach | Ongoing | Manual | Marketing |

---

## 11. SEO Success Metrics (KPIs)

| Metric | Baseline | Month 3 | Month 6 | Month 12 |
|--------|----------|---------|---------|----------|
| Indexed pages | ~15 | 300+ | 350+ | 400+ |
| Organic sessions/month | ~500 | 2,000 | 3,500 | 5,000+ |
| Organic traffic growth | — | +100% | +150% | +200% |
| Branded search position | #3–5 | #1 | #1 | #1 |
| Non-branded keywords in top 10 | 0 | 20 | 50 | 100+ |
| Featured snippets | 0 | 2 | 5 | 10+ |
| Rich results eligibility | 0% | 50% | 80% | 95% |
| Backlinks (new) | — | 20 | 50 | 100+ |
| Domain rating (Ahrefs) | Low | 30 | 40 | 50+ |
| Core Web Vitals (Good) | 0% | 80% | 90% | 95% |

---

## 12. Risk Register

| ID | Risk | Mitigation |
|----|------|------------|
| R-SEO-1 | Google de-indexes due to mass URL changes | Comprehensive 301 redirects; sitemap submitted immediately; fetch-as-Google for key pages |
| R-SEO-2 | Duplicate content across 28 regional pages | Unique content per region; canonical + hreflang; no template duplication |
| R-SEO-3 | Slow indexation of 287 pages | XML sitemap segmented; internal linking; fetch-as-Google; GSC URL inspection |
| R-SEO-4 | Ranking drop for any residual branded terms | Monitor GSC; 301 redirects preserve equity; branded PPC as safety net |
| R-SEO-5 | Hreflang errors causing international targeting issues | Validate with GSC International Targeting; test with hreflang checker tools |
| R-SEO-6 | Structured data penalties (spammy markup) | Strict schema validation; only verified reviews; no fake aggregate ratings |

---

*This plan is a sub-document of the Master Launch Plan (`TwinMOSWebsiteLaunch_Plan.md`). SEO performance is reported weekly during hypercare and monthly thereafter.*
