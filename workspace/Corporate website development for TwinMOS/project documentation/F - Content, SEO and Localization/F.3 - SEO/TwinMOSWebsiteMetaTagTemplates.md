# TwinMOS Website — Meta Tag Templates

**Document Reference:** TWN-F3-META-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Front-End Lead / Marketing Director
**Relates To:** Tech Stack §12.2; TwinMOSWebsiteSEO_Strategy.md §5

---

## Table of Contents

1. [Meta Tag Architecture](#1-meta-tag-architecture)
2. [Title Tag Templates](#2-title-tag-templates)
3. [Meta Description Templates](#3-meta-description-templates)
4. [Canonical URL Tag](#4-canonical-url-tag)
5. [Open Graph Tags](#5-open-graph-tags)
6. [Twitter / X Card Tags](#6-twitter--x-card-tags)
7. [Robots Meta Directives](#7-robots-meta-directives)
8. [Locale-Specific Meta](#8-locale-specific-meta)
9. [Per-Locale `og:locale` Mapping](#9-per-locale-oglocale-mapping)
10. [Astro `<BaseHead />` Component Implementation](#10-astro-basehead--component-implementation)
11. [Strapi CMS SEO Field Mapping](#11-strapi-cms-seo-field-mapping)
12. [Validation and Testing](#12-validation-and-testing)

---

## 1. Meta Tag Architecture

All meta tags are rendered in the `<BaseHead />` Astro component, which is included in every page's `<head>`. Data is sourced from:

1. **Strapi CMS SEO field** — per-entry title, description, OG image, canonical override.
2. **Astro page frontmatter** — for static pages not managed by Strapi.
3. **Default fallbacks** — site-wide defaults from `seo.config.ts`.

Priority: Strapi CMS entry → Page frontmatter → Site defaults.

### 1.1 Complete Meta Tag Block (Template)

```html
<!-- Primary Meta Tags -->
<title>VOLTX DDR5 6000MHz 32GB U-DIMM | TwinMOS Memory</title>
<meta name="title" content="VOLTX DDR5 6000MHz 32GB U-DIMM | TwinMOS Memory" />
<meta name="description" content="VOLTX DDR5 U-DIMM, 6000MHz, 32GB (2×16GB), Intel XMP 3.0 and AMD EXPO, on-die ECC. 5-year warranty. Find authorised retailers." />

<!-- Canonical -->
<link rel="canonical" href="https://twinmos.com/products/memory/voltx-ddr5-6000mhz-32gb/" />

<!-- Robots -->
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="product" />
<meta property="og:url" content="https://twinmos.com/products/memory/voltx-ddr5-6000mhz-32gb/" />
<meta property="og:title" content="VOLTX DDR5 6000MHz 32GB U-DIMM | TwinMOS Memory" />
<meta property="og:description" content="VOLTX DDR5 U-DIMM, 6000MHz, 32GB (2×16GB), Intel XMP 3.0 and AMD EXPO, on-die ECC. 5-year warranty." />
<meta property="og:image" content="https://cdn.twinmos.com/og/og_voltx-ddr5-6000-32gb_1200x630.webp" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="VOLTX DDR5 6000MHz 32GB desktop memory module with black heatspreader" />
<meta property="og:site_name" content="TwinMOS Technologies" />
<meta property="og:locale" content="en_US" />

<!-- Twitter / X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@twinmos" />
<meta name="twitter:title" content="VOLTX DDR5 6000MHz 32GB U-DIMM | TwinMOS Memory" />
<meta name="twitter:description" content="VOLTX DDR5 U-DIMM, 6000MHz, 32GB (2×16GB), Intel XMP 3.0 and AMD EXPO, on-die ECC. 5-year warranty." />
<meta name="twitter:image" content="https://cdn.twinmos.com/og/og_voltx-ddr5-6000-32gb_1200x630.webp" />
<meta name="twitter:image:alt" content="VOLTX DDR5 6000MHz 32GB desktop memory module with black heatspreader" />

<!-- Hreflang (Phase 2+) -->
<link rel="alternate" hreflang="en" href="https://twinmos.com/products/memory/voltx-ddr5-6000mhz-32gb/" />
<link rel="alternate" hreflang="ar" href="https://twinmos.com/ar/products/memory/voltx-ddr5-6000mhz-32gb/" />
<link rel="alternate" hreflang="x-default" href="https://twinmos.com/products/memory/voltx-ddr5-6000mhz-32gb/" />
```

---

## 2. Title Tag Templates

### 2.1 Rules

- Maximum 60 characters (including the " | TwinMOS" or "— TwinMOS" suffix).
- Primary keyword appears as early as possible (typically first).
- Do not keyword-stuff — one clear value proposition per title.
- Every title must be unique across the site.
- The "| TwinMOS" brand suffix is always included (except on the homepage itself).

### 2.2 Templates by Page Type

#### Homepage
```
TwinMOS — High-Performance Memory & Storage Since 1998
```
(51 chars — no suffix needed; brand is in the main title)

#### Product Detail Page
```
{Product Name} {Key Spec} | TwinMOS
```
Examples:
- `VOLTX DDR5 6000MHz 32GB U-DIMM | TwinMOS` (41 chars ✓)
- `CoreX Pro Gen 5 NVMe SSD 1TB | TwinMOS` (39 chars ✓)
- `TornadoX7 Pro DDR4 3200MHz 32GB | TwinMOS` (42 chars ✓)

When the product name is long, abbreviate the spec:
- `Alpha Pro Gen 3 NVMe SSD 2TB | TwinMOS` (39 chars ✓)

#### Product Category Page
```
{Category} Memory & SSDs | TwinMOS
```
- `DDR5 RAM — Desktop & Laptop Memory | TwinMOS` (45 chars ✓)
- `NVMe SSD — PCIe Gen 4 & Gen 5 | TwinMOS` (41 chars ✓)
- `SATA SSD — Budget Storage | TwinMOS` (36 chars ✓)

#### Buying Guide
```
{Topic}: Complete Guide {Year} — TwinMOS
```
- `DDR5 vs DDR4: Complete Guide 2026 — TwinMOS` (44 chars ✓)
- `Best DDR5 RAM 2026: Buying Guide — TwinMOS` (43 chars ✓)
- `Best NVMe SSD 2026 — TwinMOS Learn Hub` (38 chars ✓)

#### Learn Hub Explainer
```
{Topic} Explained | TwinMOS Learn Hub
```
- `What Is NVMe? Explained | TwinMOS Learn` (40 chars ✓)
- `CAS Latency Explained — TwinMOS Learn` (37 chars ✓)

#### KB Article
```
How to {Action}: {Product Shortname} | TwinMOS
```
- `How to Install DDR5 RAM | TwinMOS Support` (41 chars ✓)
- `NVMe SSD Not Detected Fix | TwinMOS` (35 chars ✓)
- `Enable XMP / EXPO in BIOS | TwinMOS` (35 chars ✓)

#### News Article
```
{Headline (shortened)} — TwinMOS
```
- `TwinMOS Launches VOLTX DDR5 at COMPUTEX — TwinMOS` → shorten: `VOLTX DDR5 Launched at COMPUTEX 2026 — TwinMOS` (46 chars ✓)

#### Press Release
Same as News Article template.

#### Event Page
```
TwinMOS at {Event Name} {Year} | Booth & Highlights
```
- `TwinMOS at COMPUTEX 2026 | Products & Demo` (43 chars ✓)

#### Regional Landing Page
```
TwinMOS in {Country} — Memory & SSD
```
- `TwinMOS in UAE — Memory & SSD | Dubai HQ` (41 chars ✓)
- `TwinMOS in the Middle East — Memory & Storage` (45 chars ✓)

#### About Page
```
About TwinMOS — Memory Brand Since 1998
```
(39 chars ✓)

#### Careers Page
```
Careers at TwinMOS | Join Our Team
```
(34 chars ✓)

#### Legal / Policy Pages
```
{Policy Name} | TwinMOS Legal
```
- `Privacy Policy | TwinMOS Legal` (31 chars ✓)
- `Cookie Policy | TwinMOS Legal` (29 chars ✓)
- `Warranty Policy — 5-Year Coverage | TwinMOS` (43 chars ✓)

#### 404 Error Page
```
Page Not Found | TwinMOS
```
(24 chars ✓) — `noindex`

---

## 3. Meta Description Templates

### 3.1 Rules

- Maximum 160 characters.
- Include the primary keyword naturally.
- Include a key differentiator (5-year warranty, Taiwan-engineered, JEDEC-compliant, etc.).
- End with an implicit or explicit call to action.
- Unique per page — no two pages share the same description.

### 3.2 Templates by Page Type

#### Product Detail Page
```
{Product Name}, {key spec 1}, {key spec 2}. {Differentiator}. {CTA/Benefit}.
```
Example (155 chars):
> `VOLTX DDR5 U-DIMM, 6000MHz, 32GB (2×16GB). Intel XMP 3.0 and AMD EXPO. On-die ECC. 5-year warranty. Find authorised retailers near you.`

#### Product Category Page
```
{Category overview statement}. {Key products mention}. {Benefit/differentiator}. {CTA}.
```
Example (158 chars):
> `TwinMOS DDR5 RAM: VOLTX U-DIMM up to 6000MHz, VOLTX RGB DDR5, and SO-DIMM for laptops. Intel XMP 3.0 and AMD EXPO support. 5-year warranty. Shop now.`

#### Buying Guide / Learn Hub Article
```
{What the guide covers} in {word count target} words. {Key subtopics}. {Who it is for}.
```
Example (156 chars):
> `DDR5 vs DDR4: performance benchmarks, price comparison, platform compatibility, and our 2026 recommendation. Everything you need to choose the right RAM.`

#### KB Article
```
{Problem/task statement} in {N} steps. {What you will need}. {Expected outcome}.
```
Example (145 chars):
> `Install a DDR5 U-DIMM in your desktop in 5 steps. Covers slot selection, dual-channel setup, and enabling XMP or EXPO on first boot.`

#### News Article / Press Release
```
{Lead sentence from the article — who, what, when}. Read the full announcement.
```

#### Regional Landing Page
```
TwinMOS memory and SSD products in {Country}. {Local partner/distributor}. {Local certification}. Find authorised retailers.
```
Example (India, 143 chars):

#### About Page
> `TwinMOS Technologies has engineered high-performance memory and storage solutions since 1998. Distributed in 93 countries. ISO 9001 certified (TÜV SÜD, first certified 2002).` (148 chars)

#### Careers
> `Join TwinMOS Technologies — a global memory and storage brand with offices in Taipei, Dubai, and Cologne. View open roles in engineering, sales, and marketing.` (162 chars → trim by 2: "…and marketing.")

#### Homepage
> `TwinMOS — DDR5 RAM, NVMe SSD, USB drives and portable storage trusted since 1998. Distributed in 93 countries. 5-year warranty. Find your nearest retailer.` (157 chars)

---

## 4. Canonical URL Tag

### 4.1 Rule

Every indexable page must have exactly one `<link rel="canonical">` tag pointing to the definitive version of that URL.

```html
<link rel="canonical" href="https://twinmos.com/products/memory/ddr5/" />
```

### 4.2 Locale Canonicals

Each locale version of a page has its own canonical pointing to itself:
- EN: `<link rel="canonical" href="https://twinmos.com/products/memory/ddr5/" />`
- AR: `<link rel="canonical" href="https://twinmos.com/ar/products/memory/ddr5/" />`

Hreflang `<link>` tags then cross-reference all locale versions.

### 4.3 Paginated Pages

- Page 1 of a listing: canonical = the base URL (no page parameter).
- Page 2+: canonical = the path-based paginated URL (e.g., `/news/articles/page-2/`).

---

## 5. Open Graph Tags

### 5.1 `og:type` Values by Page Type

| Page Type | `og:type` Value |
|-----------|----------------|
| Homepage | `website` |
| Product detail | `product` |
| Article (buying guide, explainer) | `article` |
| News article / press release | `article` |
| About | `website` |
| Event | `event.listing` (fallback: `website`) |
| Any other page | `website` |

### 5.2 Product-Specific OG Tags

For product pages, add product-specific OG meta:
```html
<meta property="product:brand" content="VOLTX by TwinMOS" />
<meta property="product:availability" content="in stock" />
<meta property="product:condition" content="new" />
<meta property="product:price:amount" content="PRICE" />
<meta property="product:price:currency" content="USD" />
```

### 5.3 Article-Specific OG Tags

For news/articles:
```html
<meta property="article:published_time" content="2026-05-01T09:00:00+04:00" />
<meta property="article:modified_time" content="2026-05-01T09:00:00+04:00" />
<meta property="article:author" content="TwinMOS Technologies" />
<meta property="article:section" content="Press Release" />
```

### 5.4 OG Image Requirements

- Size: **1200 × 630 px** (enforced — images not meeting this size may not preview correctly).
- Format: WebP with JPEG fallback.
- Must include the TwinMOS logo in the image.
- Alt text must be provided via `og:image:alt`.
- Avoid text in the image that's too small to read at half-size (600 × 315 px).
- Store at: `/public/og/og_{page-slug}_1200x630.webp`

---

## 6. Twitter / X Card Tags

Always use `summary_large_image` card type for product pages, articles, and news. Use `summary` for small pages (careers, contact, legal).

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@twinmos" />
<meta name="twitter:creator" content="@twinmos" />
<meta name="twitter:title" content="..." />        <!-- Same as og:title; max 70 chars -->
<meta name="twitter:description" content="..." />  <!-- Same as og:description; max 200 chars -->
<meta name="twitter:image" content="..." />        <!-- Same as og:image URL -->
<meta name="twitter:image:alt" content="..." />    <!-- Same as og:image:alt -->
```

---

## 7. Robots Meta Directives

### 7.1 Default (Indexable Pages)

```html
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
```

### 7.2 Noindex Pages

Apply `noindex` to pages that should not appear in search results:

| Page Type | Directive |
|-----------|-----------|
| Search results (`/search/`) | `noindex, follow` |
| Form thank-you / confirmation pages | `noindex, nofollow` |
| Partner portal (Phase 2) | `noindex, nofollow` |
| Admin pages | Blocked by `robots.txt`; also `noindex` |
| Paginated pages beyond page 2 | `noindex, follow` |
| Preview / staging URLs | `noindex, nofollow` (Cloudflare preview URLs) |
| UTM landing pages | `noindex` if using separate UTM-specific landing pages |
| 404 error page | `noindex, nofollow` |
| 410 retired pages | `noindex, nofollow` |

```html
<!-- For noindex pages -->
<meta name="robots" content="noindex, nofollow" />
```

---

## 8. Locale-Specific Meta

### 8.1 `lang` Attribute on `<html>`

The HTML root element sets the language:
```html
<html lang="en">       <!-- English -->
<html lang="ar" dir="rtl">  <!-- Arabic RTL -->
<html lang="hi">       <!-- Hindi -->
<html lang="ru">       <!-- Russian -->
<html lang="zh-CN">    <!-- Chinese Simplified -->
<html lang="fr">       <!-- French -->
```

### 8.2 `og:locale` and `og:locale:alternate`

```html
<meta property="og:locale" content="en_US" />
<!-- Add one og:locale:alternate for each additional active locale: -->
<meta property="og:locale:alternate" content="ar_AE" />
<meta property="og:locale:alternate" content="bn_BD" />
<meta property="og:locale:alternate" content="hi_IN" />
```

---

## 9. Per-Locale `og:locale` Mapping

| Locale | `og:locale` Value | `html lang` |
|--------|------------------|-------------|
| English | `en_US` | `en` |
| Arabic | `ar_AE` | `ar` |
| Hindi | `hi_IN` | `hi` |
| Russian | `ru_RU` | `ru` |
| Chinese Simplified | `zh_CN` | `zh-CN` |
| French | `fr_FR` | `fr` |
| Spanish (P4) | `es_ES` | `es` |
| Portuguese (P4) | `pt_BR` | `pt` |
| German (P4) | `de_DE` | `de` |

---

## 10. Astro `<BaseHead />` Component Implementation

The `BaseHead.astro` component accepts these props and renders all meta tags:

```astro
---
// src/components/seo/BaseHead.astro
interface Props {
  title: string;           // Page title (≤60 chars)
  description: string;     // Meta description (≤160 chars)
  canonical?: string;      // Overrides auto-generated canonical
  ogImage?: string;        // Full CDN URL for OG image
  ogImageAlt?: string;     // Alt text for OG image
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;       // true = noindex, nofollow
  locale?: string;         // e.g., 'en', 'ar', 'hi'
  hreflangUrls?: Record<string, string>;  // locale → absolute URL map
}
---
```

### Usage in a Page

```astro
---
import BaseHead from '@/components/seo/BaseHead.astro';
---
<head>
  <BaseHead
    title="VOLTX DDR5 6000MHz 32GB U-DIMM | TwinMOS Memory"
    description="VOLTX DDR5 U-DIMM, 6000MHz, 32GB. XMP 3.0, EXPO, on-die ECC. 5-year warranty."
    ogImage="https://cdn.twinmos.com/og/og_voltx-ddr5-6000-32gb_1200x630.webp"
    ogImageAlt="VOLTX DDR5 6000MHz 32GB desktop memory module"
    ogType="product"
    locale="en"
  />
</head>
```

---

## 11. Strapi CMS SEO Field Mapping

Each Strapi content type has an `seo` component with these fields:

| Strapi Field | Meta Tag | Notes |
|-------------|---------|-------|
| `seo.metaTitle` | `<title>` and `og:title` | ≤60 chars; validated in Strapi |
| `seo.metaDescription` | `<meta name="description">` | ≤160 chars; validated |
| `seo.canonicalURL` | `<link rel="canonical">` | Optional override; auto-generated if blank |
| `seo.ogImage` | `og:image` | 1200×630 Strapi Media Library asset |
| `seo.ogImageAlt` | `og:image:alt` | Required if ogImage is set |
| `seo.noIndex` | `<meta name="robots">` | Boolean; defaults to false |
| `seo.keywords` | Not used (deprecated by Google) | Kept for internal reference/search only |

The `seo` component is a shared Strapi component reused across all content types: Article, Product, LandingPage, NewsItem, JobPosting, RegionalPage, KbArticle.

---

## 12. Validation and Testing

### 12.1 Automated Checks (CI)

- Lighthouse CI: SEO score ≥95 required on all pages in the test suite.
- Meta tag length validator script runs on build: fails if `<title>` > 70 chars or `<meta description>` > 170 chars (soft limits with buffer).
- OG image existence check: build fails if `og:image` URL returns non-200.

### 12.2 Manual Checks

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — test OG tags.
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) — test Twitter Card.
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — test LinkedIn sharing.
- [Google Rich Results Test](https://search.google.com/test/rich-results) — test structured data.

### 12.3 Pre-Launch Checklist

- [ ] Every page has a unique `<title>` (check via Screaming Frog — duplicate titles report).
- [ ] Every page has a unique `<meta description>` (Screaming Frog — duplicate descriptions).
- [ ] All `og:image` URLs return 200 (Screaming Frog custom extraction).
- [ ] All `og:image` dimensions are 1200×630.
- [ ] No `<title>` exceeds 60 characters.
- [ ] No `<meta description>` exceeds 160 characters.
- [ ] All product pages have `og:type = "product"`.
- [ ] Hreflang tags present on all pages with active locales.

---

*Related: [SEO Strategy](TwinMOSWebsiteSEO_Strategy.md) | [Schema JSON-LD Templates](TwinMOSWebsiteSchemaOrgJSONLDTemplates.md) | [Hreflang Implementation](TwinMOSWebsiteHreflang_Implementation.md)*
