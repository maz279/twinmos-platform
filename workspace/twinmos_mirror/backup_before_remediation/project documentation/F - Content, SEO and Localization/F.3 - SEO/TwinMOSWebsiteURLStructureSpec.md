# TwinMOS Website — URL Structure Specification

**Document Reference:** TWN-F3-URL-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Front-End Lead / Marketing Director
**Relates To:** BRD §9.3; Tech Stack §12.4; RFP §9.3; TwinMOSWebsiteSEO_Strategy.md §4.3

---

## Table of Contents

1. [URL Design Principles](#1-url-design-principles)
2. [URL Syntax Rules](#2-url-syntax-rules)
3. [Complete URL Taxonomy](#3-complete-url-taxonomy)
4. [Locale Prefix Scheme](#4-locale-prefix-scheme)
5. [URL Patterns by Content Type](#5-url-patterns-by-content-type)
6. [Query Parameters Policy](#6-query-parameters-policy)
7. [Canonical URL Rules](#7-canonical-url-rules)
8. [Reserved Page Stubs](#8-reserved-page-stubs)
9. [Redirect Rules Summary](#9-redirect-rules-summary)
10. [URL Validation Checklist](#10-url-validation-checklist)

---

## 1. URL Design Principles

TwinMOS URLs are designed to be:

1. **Human-readable** — A person should be able to infer the page content from the URL alone.
2. **SEO-optimal** — Primary keywords appear in the URL where possible without forced keyword stuffing.
3. **Stable** — URLs should not change once published. Changing a URL requires a 301 redirect.
4. **Consistent** — The same path pattern is used across all pages of the same type.
5. **Locale-aware** — International URLs follow a predictable prefix pattern.
6. **Minimal** — No unnecessary path segments, no session IDs, no tracking parameters in canonical URLs.

---

## 2. URL Syntax Rules

| Rule | Correct | Incorrect |
|------|---------|-----------|
| Lowercase only | `/products/memory/ddr5/` | `/Products/Memory/DDR5/` |
| Hyphens, not underscores | `/learn/buying-guide/ddr5-vs-ddr4/` | `/learn/buying_guide/ddr5_vs_ddr4/` |
| Trailing slash on directory paths | `/products/memory/` | `/products/memory` |
| No trailing slash on terminal pages | `/products/memory/voltx-ddr5-6000mhz-32gb/` — trailing slash acceptable for consistency | `/products/memory/voltx-ddr5-6000mhz-32gb` |
| Maximum 60 characters per slug segment | `/products/memory/voltx-ddr5-6000mhz-32gb/` | `/products/memory/voltx-ddr5-u-dimm-6000mhz-cl40-32gb-desktop-kit/` (too long) |
| No stop words in URL unless required for meaning | `/products/ssd/nvme/` | `/products/ssd/nvme-solid-state-drives-for-gaming-and-desktop/` |
| No special characters or encoded spaces | `/products/ssd/` | `/products/ssd%20drives/` |
| No capital letters, even for brands | `/products/voltx-ddr5/` (slug) | `/products/VOLTX-DDR5/` |
| No `.html` or `.php` extensions | `/support/kb/install-m2-nvme/` | `/support/kb/install-m2-nvme.html` |
| www redirect to non-www | `https://twinmos.com/` | `https://www.twinmos.com/` |
| Always HTTPS | `https://twinmos.com/` | `http://twinmos.com/` |

---

## 3. Complete URL Taxonomy

### Section Overview

| Section | URL Prefix | Content Count | Notes |
|---------|-----------|--------------|-------|
| Homepage | `/` | 1 | Root |
| Products | `/products/` | 100+ | Full catalog |
| Solutions | `/solutions/` | 11 | B2B use-case pages |
| Gaming | `/gaming/` | 14 | VOLTX brand hub |
| Technology | `/technology/` | 14 | R&D and innovation |
| Support | `/support/` | 69+ | KB, warranty, RMA |
| Learn | `/learn/` | 64+ | Buying guides, explainers |
| Partners | `/partners/` | 21 | Distributor/OEM programs |
| Where to Buy | `/where-to-buy/` | 4 | Retail locator |
| News & Events | `/news/` | 29+ | Press releases, events |
| Regional | `/regional/` | 28 | Country landing pages |
| Careers | `/careers/` | 10 | Jobs and culture |
| Contact | `/contact/` | 16 | Forms and office info |
| About | `/about/` | 17 | Company info |
| Legal | `/legal/` | 34 | Policies and compliance |
| Marketing | `/marketing/` | 12 | Promotions, newsletter (mostly noindex) |
| Site-wide | Various | 15 | 404, search, breadcrumb |

### Full URL Tree

```
/ (Homepage)
├── /about/
│   ├── /about/company/
│   ├── /about/history/
│   ├── /about/leadership/
│   ├── /about/manufacturing/
│   ├── /about/quality/
│   ├── /about/certifications/
│   ├── /about/awards/
│   ├── /about/sustainability/
│   ├── /about/csr/
│   ├── /about/global-presence/
│   ├── /about/values/
│   ├── /about/why-twinmos/
│   ├── /about/mission-vision/
│   ├── /about/press-room/
│   ├── /about/media-kit/
│   ├── /about/corporate-responsibility/
│   └── /about/investor-relations/
│
├── /products/
│   ├── /products/memory/
│   │   ├── /products/memory/ddr5/
│   │   │   ├── /products/memory/voltx-ddr5-u-dimm/
│   │   │   │   ├── /products/memory/voltx-ddr5-4800mhz-16gb/
│   │   │   │   ├── /products/memory/voltx-ddr5-5600mhz-16gb/
│   │   │   │   ├── /products/memory/voltx-ddr5-6000mhz-16gb/
│   │   │   │   └── /products/memory/voltx-ddr5-6000mhz-32gb/
│   │   │   ├── /products/memory/voltx-rgb-ddr5-u-dimm/
│   │   │   │   ├── /products/memory/voltx-rgb-ddr5-5600mhz-16gb/
│   │   │   │   └── /products/memory/voltx-rgb-ddr5-6000mhz-32gb/
│   │   │   └── /products/memory/voltx-ddr5-so-dimm/
│   │   │       └── /products/memory/voltx-ddr5-so-dimm-5600mhz-16gb/
│   │   ├── /products/memory/ddr4/
│   │   │   ├── /products/memory/tornadox7-pro-ddr4/
│   │   │   ├── /products/memory/tornadox7-ddr4/
│   │   │   ├── /products/memory/thunder-gx-ddr4/
│   │   │   ├── /products/memory/concord-cl16-rgb-ddr4/
│   │   │   └── /products/memory/ddr4-so-dimm/
│   │   └── /products/memory/ddr3/
│   ├── /products/ssd/
│   │   ├── /products/ssd/nvme/
│   │   │   ├── /products/ssd/corex-pro-gen5/
│   │   │   ├── /products/ssd/xtreme-gen4/
│   │   │   ├── /products/ssd/corex-gen4/
│   │   │   ├── /products/ssd/xtreme-pro-gen4/
│   │   │   ├── /products/ssd/alpha-pro-gen3/
│   │   │   └── /products/ssd/tw300-gen3/
│   │   └── /products/ssd/sata/
│   │       ├── /products/ssd/hyper-h2-ultra/
│   │       └── /products/ssd/m2-sata/
│   ├── /products/portable/
│   │   ├── /products/portable/elite-drive-pro/
│   │   └── /products/portable/prodrive-ultra/
│   ├── /products/usb/
│   │   └── /products/usb/mobile-disk-x3/
│   ├── /products/accessories/
│   ├── /products/compare/
│   └── /products/finder/
│
├── /solutions/
│   ├── /solutions/gaming/
│   ├── /solutions/content-creation/
│   ├── /solutions/system-builders/
│   ├── /solutions/enterprise/
│   ├── /solutions/education/
│   ├── /solutions/embedded/
│   ├── /solutions/data-centre/
│   ├── /solutions/telecom/
│   └── /solutions/case-studies/
│
├── /gaming/
│   ├── /gaming/voltx/
│   ├── /gaming/rgb-showcase/
│   ├── /gaming/rgb-sync/
│   ├── /gaming/overclocking/
│   ├── /gaming/build-gallery/
│   ├── /gaming/esports/
│   ├── /gaming/wallpapers/
│   └── /gaming/ambassadors/
│
├── /technology/
│   ├── /technology/rd/
│   ├── /technology/dram-education/
│   ├── /technology/nand/
│   ├── /technology/controllers/
│   ├── /technology/thermal/
│   ├── /technology/power-efficiency/
│   ├── /technology/data-integrity/
│   ├── /technology/security/
│   ├── /technology/pcie-evolution/
│   ├── /technology/jedec/
│   ├── /technology/patents/
│   └── /technology/roadmap/
│
├── /support/
│   ├── /support/warranty/
│   ├── /support/rma/
│   │   ├── /support/rma/submit/
│   │   ├── /support/rma/status/
│   │   └── /support/rma/policy/
│   ├── /support/downloads/
│   ├── /support/firmware/
│   ├── /support/manuals/
│   ├── /support/kb/
│   │   ├── /support/kb/how-to-install-ddr5-ram/
│   │   ├── /support/kb/how-to-install-m2-nvme-ssd/
│   │   ├── /support/kb/ram-not-recognised/
│   │   ├── /support/kb/nvme-ssd-not-detected/
│   │   ├── /support/kb/enable-xmp-expo-bios/
│   │   └── /support/kb/[article-slug]/  (33+ articles)
│   ├── /support/faq/
│   ├── /support/compatibility-finder/
│   ├── /support/serial-number-checker/
│   ├── /support/counterfeit-detection/
│   └── /support/contact/
│
├── /learn/
│   ├── /learn/buying-guide/
│   │   ├── /learn/buying-guide/best-ddr5-ram/
│   │   ├── /learn/buying-guide/ddr5-vs-ddr4/
│   │   ├── /learn/buying-guide/best-nvme-ssd/
│   │   ├── /learn/buying-guide/nvme-vs-sata-ssd/
│   │   └── /learn/buying-guide/[guide-slug]/  (10+ guides)
│   ├── /learn/explainer/
│   │   ├── /learn/explainer/what-is-ddr5/
│   │   ├── /learn/explainer/cas-latency-explained/
│   │   ├── /learn/explainer/pcie-gen5-explained/
│   │   └── /learn/explainer/[explainer-slug]/
│   ├── /learn/benchmark/
│   │   └── /learn/benchmark/[benchmark-slug]/
│   └── /learn/glossary/
│
├── /partners/
│   ├── /partners/become-a-partner/
│   ├── /partners/oem-odm/
│   ├── /partners/system-integrators/
│   ├── /partners/distributors/
│   ├── /partners/locator/
│   ├── /partners/mdf/
│   └── /partners/regional/
│       ├── /partners/regional/india/
│       ├── /partners/regional/bangladesh/
│       ├── /partners/regional/mea/
│       └── /partners/regional/africa/
│
├── /where-to-buy/
│   ├── /where-to-buy/retailers/
│   ├── /where-to-buy/system-builders/
│   └── /where-to-buy/online/
│
├── /news/
│   ├── /news/press-releases/
│   │   └── /news/press-releases/[article-slug]/
│   ├── /news/articles/
│   │   └── /news/articles/[article-slug]/
│   └── /news/events/
│       └── /news/events/[event-slug]/
│
├── /regional/
│   ├── /regional/uae/
│   ├── /regional/india/
│   ├── /regional/bangladesh/
│   ├── /regional/pakistan/
│   ├── /regional/saudi-arabia/
│   ├── /regional/qatar/
│   ├── /regional/egypt/
│   ├── /regional/south-africa/
│   ├── /regional/nigeria/
│   └── /regional/[country-slug]/  (28 total)
│
├── /careers/
│   ├── /careers/life-at-twinmos/
│   ├── /careers/benefits/
│   ├── /careers/locations/
│   ├── /careers/departments/
│   ├── /careers/internships/
│   ├── /careers/jobs/
│   │   └── /careers/jobs/[job-slug]/
│   └── /careers/faq/
│
├── /contact/
│   ├── /contact/general/
│   ├── /contact/sales/
│   ├── /contact/technical/
│   ├── /contact/distributor/
│   ├── /contact/oem-odm/
│   ├── /contact/media/
│   └── /contact/offices/
│       ├── /contact/offices/dubai/
│       ├── /contact/offices/taipei/
│       └── /contact/offices/new-delhi/
│
├── /legal/
│   ├── /legal/privacy-policy/
│   ├── /legal/cookie-policy/
│   ├── /legal/terms-of-use/
│   ├── /legal/terms-of-service/
│   ├── /legal/warranty-policy/
│   ├── /legal/accessibility/
│   ├── /legal/rma-policy/
│   ├── /legal/trademark/
│   ├── /legal/security-disclosure/
│   ├── /legal/gdpr/
│   ├── /legal/dpdp/
│   ├── /legal/pdpl/
│   ├── /legal/rohs/
│   ├── /legal/reach/
│   ├── /legal/ce/
│   ├── /legal/fcc/
│   ├── /legal/iso-9001/
│   ├── /legal/jedec-compliance/
│   ├── /legal/sitemap/
│   └── /legal/[policy-slug]/
│
└── /search/  (search results page — noindex)
```

---

## 4. Locale Prefix Scheme

Locale prefixes are applied to all public-facing routes. English is the default (no prefix).

| Locale | Code | URL Prefix | Phase | Script |
|--------|------|-----------|-------|--------|
| English | `en` | `/` (no prefix) | P1 | Latin LTR |
| Arabic | `ar` | `/ar/` | P2 | Arabic RTL |
| Bengali | `bn` | `/bn/` | P2 | Bengali LTR |
| Hindi | `hi` | `/hi/` | P2 | Devanagari LTR |
| Russian | `ru` | `/ru/` | P3 | Cyrillic LTR |
| Chinese (Simplified) | `zh-CN` | `/zh-CN/` | P3 | Han LTR |
| French | `fr` | `/fr/` | P3 | Latin LTR |
| Spanish | `es` | `/es/` | P4 (out of scope) | Latin LTR |
| Portuguese | `pt` | `/pt/` | P4 (out of scope) | Latin LTR |
| German | `de` | `/de/` | P4 (out of scope) | Latin LTR |

**Locale URL examples:**
```
EN:    https://twinmos.com/products/memory/ddr5/
AR:    https://twinmos.com/ar/products/memory/ddr5/
BN:    https://twinmos.com/bn/products/memory/ddr5/
HI:    https://twinmos.com/hi/products/memory/ddr5/
RU:    https://twinmos.com/ru/products/memory/ddr5/
ZH-CN: https://twinmos.com/zh-CN/products/memory/ddr5/
FR:    https://twinmos.com/fr/products/memory/ddr5/
```

**Note on `zh-CN`:** The locale prefix uses the standard BCP 47 code `zh-CN` (with capital letters and hyphen) to match the `hreflang` attribute value. The Astro i18n config handles case-insensitive matching; the canonical URL uses `zh-CN` with the correct casing.

---

## 5. URL Patterns by Content Type

### 5.1 Product Pages

```
/products/{category}/{sub-category}/{product-slug}/

Examples:
/products/memory/ddr5/voltx-ddr5-6000mhz-32gb/
/products/ssd/nvme/corex-pro-gen5-1tb/
/products/portable/elite-drive-pro-1tb/
/products/usb/mobile-disk-x3-64gb/
```

**Product slug construction:** `{brand-slug}-{type}-{key-spec}-{capacity}`
- Brand slug: `voltx` / `corex-pro` / `tornadox7-pro` / `thunder-gx` etc.
- Type: `ddr5` / `ddr4` / `nvme` / `sata` / `ssd` / `hdd`
- Key spec: speed for RAM (e.g., `6000mhz`); generation for SSD (e.g., `gen5`)
- Capacity: `16gb` / `32gb` / `1tb` / `2tb`

### 5.2 Learn Hub

```
/learn/{content-type}/{article-slug}/

Content types:
  buying-guide   → /learn/buying-guide/ddr5-vs-ddr4/
  explainer      → /learn/explainer/what-is-nvme/
  benchmark      → /learn/benchmark/nvme-ssd-performance/
  glossary       → /learn/glossary/  (single page, not article-per-term)
```

### 5.3 Support KB Articles

```
/support/kb/{article-slug}/

Examples:
/support/kb/how-to-install-ddr5-ram/
/support/kb/nvme-ssd-not-detected/
/support/kb/enable-xmp-expo-bios/
/support/kb/check-ssd-health/
```

### 5.4 News and Events

```
/news/press-releases/{article-slug}/
/news/articles/{article-slug}/
/news/events/{event-slug}/

Examples:
/news/press-releases/twinmos-launches-voltx-ddr5-6000mhz/
/news/events/computex-2026/
/news/events/gitex-2026/
```

### 5.5 Regional Pages

```
/regional/{country-slug}/

Country slug is the ISO 3166-1 alpha-2 code name in lowercase:
/regional/uae/
/regional/india/
/regional/bangladesh/
/regional/saudi-arabia/
/regional/south-africa/
```

### 5.6 Careers

```
/careers/
/careers/jobs/
/careers/jobs/{job-slug}/

Job slug: {job-title-slug}-{location-slug}
Example: /careers/jobs/product-manager-dubai/
```

### 5.7 Legal Pages

```
/legal/{policy-slug}/

Examples:
/legal/privacy-policy/
/legal/cookie-policy/
/legal/terms-of-use/
/legal/gdpr/
/legal/iso-9001/
```

---

## 6. Query Parameters Policy

### 6.1 Allowed Parameters

| Parameter | Allowed | Purpose |
|-----------|---------|---------|
| `?q=` | Yes, with noindex for search results pages | Site search query |
| `?page=` | Yes, for paginated content | Pagination (see §7.2) |
| `?ref=` | No — strip at Cloudflare | Referral tracking (use UTM instead) |
| `?utm_*` | Stripped at Cloudflare edge | Marketing tracking (use UTM in campaigns only) |
| `?v=` | No | Version parameters are not used |
| `?lang=` | No | Language is controlled by URL prefix, not query param |
| `?sort=`, `?filter=` | Strapi handles faceted filtering — do not use query params; use Astro route segments for indexable facets | Faceted filtering |

### 6.2 Cloudflare URL Normalisation

The following Cloudflare Rules are configured:
- Strip `utm_*`, `ref`, `fbclid`, `gclid` parameters before caching (these params create duplicate URLs).
- Normalise trailing slashes (always append trailing slash).
- Force lowercase on all URLs (redirect any uppercase URL to lowercase equivalent).

### 6.3 Search Result Pages

- `/search/?q=…` pages are `noindex, follow`.
- Search result pages are not included in the sitemap.
- `rel="canonical"` on search result pages points to `/search/` (the hub page).

---

## 7. Canonical URL Rules

### 7.1 Every Page Must Have a Canonical

Every page served by the website must have a `<link rel="canonical">` tag pointing to the one definitive URL for that content.

- Product pages: canonical is the `/products/category/slug/` URL (not a locale-prefixed version — the EN URL is canonical for all locales; per-locale pages use `hreflang` for discovery).
- Wait — clarification: Each locale URL is its own canonical. The EN page at `/products/memory/ddr5/` has canonical `https://twinmos.com/products/memory/ddr5/`. The Arabic page at `/ar/products/memory/ddr5/` has canonical `https://twinmos.com/ar/products/memory/ddr5/`. Hreflang then cross-references all of them.

### 7.2 Pagination

For paginated content (e.g., blog listing pages, news listing pages):
- Page 1: canonical = `/news/articles/` (no `?page=1`).
- Page 2+: canonical = `/news/articles/page-2/` (path-based, not query-string).
- All paginated pages are indexable; only `/news/articles/page-2/` and beyond get lower priority in the sitemap.

### 7.3 Product Variants

Individual product variant pages (e.g., different capacities of the same product family) are distinct canonical pages with distinct URLs — they are not canonical-pointed to a parent.

Exception: If multiple SKUs share an identical content page (e.g., the same product with a different colour), use canonical to point to the primary variant.

---

## 8. Reserved Page Stubs

18 pages are reserved in the URL structure but are unpublished (no-index stubs) pending activation triggers. They are included in the sitemap only after activation (status → published).

| URL | Reserved Page | Activation Trigger |
|-----|-------------|--------------------|
| `/products/ssd/enterprise/` | Enterprise SSD Hub | TwinMOS launches enterprise SSD SKU |
| `/products/memory/ecc-server/` | ECC/Server Memory Hub | TwinMOS launches ECC server SKU |
| `/products/portable/rugged-ssd/` | Rugged Portable SSD | Product launch |
| `/products/portable/encrypted-ssd/` | Encrypted Portable SSD | Product launch |
| `/products/accessories/card-reader/` | Card Reader | Product launch |
| `/solutions/data-centre/` | Data Centre Solutions | Strategic partnership |
| `/gaming/oc-records/` | Overclocking Records Hub | First validated OC submission |
| `/gaming/ambassadors/` | Brand Ambassadors | First ambassador signed |
| `/gaming/rgb-software/` | RGB Software / SDK | TwinMOS releases SDK |
| `/technology/roadmap/` | Product Roadmap | Sponsor approval |
| `/support/toolbox/` | Storage Toolbox (Utility) | TwinMOS releases utility |
| `/partners/mdf/` | MDF Program | Phase 3 |
| `/news/events/computex-2026/` | COMPUTEX 2026 | Event announcement |
| `/news/events/gitex-2026/` | GITEX 2026 | Event announcement |
| `/news/events/ces-2027/` | CES 2027 | Event announcement |
| `/news/events/ifa-2026/` | IFA 2026 | Event announcement |
| `/marketing/loyalty/` | Loyalty Program | Phase 3 launch |
| `/marketing/referral/` | Referral Program | Phase 3 launch |

---

## 9. Redirect Rules Summary

Full redirect mapping in `TwinMOSWebsiteLegacyURLtoNewURL_Mapping.md` and implementation in `TwinMOSWebsite301RedirectPlan.md`.

### 9.1 Domain-Level Redirects

```
http://twinmos.com/         → https://twinmos.com/         (HTTPS upgrade)
http://www.twinmos.com/     → https://twinmos.com/         (www removal + HTTPS)
https://www.twinmos.com/    → https://twinmos.com/         (www removal)
```

### 9.2 URL Normalisation Redirects

```
/Products/Memory/           → /products/memory/             (lowercase)
/products/memory            → /products/memory/             (trailing slash)
/products/memory/?q=test    → /products/memory/             (strip params — Cloudflare)
```

---

## 10. URL Validation Checklist

Before any new URL goes live, validate:

- [ ] URL is all lowercase.
- [ ] URL uses hyphens, not underscores.
- [ ] URL is ≤60 characters per segment.
- [ ] URL follows the correct pattern for its content type (§5).
- [ ] URL contains the primary keyword.
- [ ] Canonical `<link>` tag is set to the correct absolute URL.
- [ ] Hreflang tags are generated for all active locales (if multi-locale).
- [ ] No conflicting redirect exists for this URL.
- [ ] Sitemap is regenerated after the new URL is published.
- [ ] Old URL (if replacing an existing page) has a 301 redirect configured.

---

*Related: [SEO Strategy](TwinMOSWebsiteSEO_Strategy.md) | [Legacy URL Mapping](TwinMOSWebsiteLegacyURLtoNewURL_Mapping.md) | [301 Redirect Plan](TwinMOSWebsite301RedirectPlan.md) | [Hreflang Implementation](TwinMOSWebsiteHreflang_Implementation.md)*
