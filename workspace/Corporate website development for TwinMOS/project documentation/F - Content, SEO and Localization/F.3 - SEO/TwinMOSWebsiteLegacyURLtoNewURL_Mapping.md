# TwinMOS Website — Legacy URL to New URL Mapping

**Document Reference:** TWN-F3-URLMAP-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Front-End Lead / Marketing Director
**Relates To:** TwinMOSWebsiteURLStructureSpec.md; TwinMOSWebsite301RedirectPlan.md; Tech Stack §12.4

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Audit Findings Summary](#2-audit-findings-summary)
3. [URL Mapping Table — Products](#3-url-mapping-table--products)
4. [URL Mapping Table — Support](#4-url-mapping-table--support)
5. [URL Mapping Table — About and Company](#5-url-mapping-table--about-and-company)
6. [URL Mapping Table — Contact and Partners](#6-url-mapping-table--contact-and-partners)
7. [URL Mapping Table — Legal and Compliance](#7-url-mapping-table--legal-and-compliance)
8. [URL Mapping Table — News and Events](#8-url-mapping-table--news-and-events)
9. [Canonicalisation Decisions](#9-canonicalisation-decisions)
10. [Pages Being Retired (410 Gone)](#10-pages-being-retired-410-gone)
11. [Pages Being Consolidated](#11-pages-being-consolidated)
12. [Priority Order for Redirect Implementation](#12-priority-order-for-redirect-implementation)
13. [Testing Protocol](#13-testing-protocol)

---

## 1. Purpose and Scope

This document maps all known legacy `twinmos.com` URLs (current live website, crawled April 2026) to their new canonical URLs in the redesigned platform.

**Three possible outcomes for each legacy URL:**

| Outcome | Code | Action |
|---------|------|--------|
| Permanent redirect to new URL | 301 | Implement in `_redirects` + Strapi redirect plugin |
| Temporary redirect (holds during migration) | 302 | Convert to 301 after launch confirmation |
| Retired — no content equivalent | 410 | Return HTTP 410 Gone |
| Canonical consolidation | 301 | Multiple old URLs → one new canonical URL |

**Source of legacy URLs:** Screaming Frog crawl of `twinmos.com` (April 2026), supplemented by Google Search Console "Pages" report for indexed URLs and Ahrefs backlink report for externally linked URLs.

---

## 2. Audit Findings Summary

| Category | URLs Found | 301 Redirects | 410 Gone | Notes |
|----------|-----------|--------------|---------|-------|
| Product pages | ~120 | ~100 | ~20 | Many old URL patterns use WooCommerce paths |
| Support / downloads | ~40 | ~35 | ~5 | Legacy PDF links need redirect to new download page |
| About / company | ~15 | ~12 | ~3 | Old "about-us" slug → new `/about/` hierarchy |
| Contact | ~8 | ~8 | 0 | |
| News / blog | ~25 | ~20 | ~5 | Old blog posts without equivalents → 410 |
| Legal | ~10 | ~10 | 0 | |
| Partners / distributors | ~12 | ~10 | ~2 | |
| Technical resources | ~15 | ~12 | ~3 | |
| **Total** | **~245** | **~207** | **~38** | |

---

## 3. URL Mapping Table — Products

> **Pattern note:** The current twinmos.com uses WooCommerce at `/product/` (singular) and `/product-category/`. The new site uses `/products/` (plural) with a category hierarchy.

### 3.1 Memory — DDR5

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/product/twinmos-voltx-ddr5-u-dimm-for-desktop/` | `/products/memory/ddr5/` | 301 | P0 |
| `/product/twinmos-voltx-ddr5-so-dimm-for-laptop/` | `/products/memory/voltx-ddr5-so-dimm/` | 301 | P0 |
| `/product/twinmos-voltx-rgb-ddr5-u-dimm-for-desktop/` | `/products/memory/voltx-rgb-ddr5-u-dimm/` | 301 | P0 |
| `/product-category/dram-module/ddr5/` | `/products/memory/ddr5/` | 301 | P0 |
| `/product/voltx-ddr5-4800mhz/` | `/products/memory/voltx-ddr5-u-dimm/` | 301 | P1 |
| `/product/voltx-ddr5-5600mhz/` | `/products/memory/voltx-ddr5-u-dimm/` | 301 | P1 |
| `/product/voltx-ddr5-6000mhz/` | `/products/memory/voltx-ddr5-6000mhz-32gb/` | 301 | P0 |

### 3.2 Memory — DDR4

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/product/twinmos-tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop/` | `/products/memory/tornadox7-pro-ddr4/` | 301 | P0 |
| `/product/twinmos-thunder-gx-ddr4-u-dimm-for-desktop/` | `/products/memory/thunder-gx-ddr4/` | 301 | P0 |
| `/product/twinmos-alphapro-nvme-m-2-2280-new-ssd/` | `/products/ssd/nvme/alpha-pro-gen3/` | 301 | P0 |
| `/product-category/dram-module/ddr4/` | `/products/memory/ddr4/` | 301 | P0 |
| `/product-category/dram-module/` | `/products/memory/` | 301 | P0 |
| `/product/tornadox7-ddr4/` | `/products/memory/tornadox7-ddr4/` | 301 | P1 |
| `/product/concord-rgb-ddr4/` | `/products/memory/concord-cl16-rgb-ddr4/` | 301 | P1 |
| `/product/ddr4-so-dimm/` | `/products/memory/ddr4-so-dimm/` | 301 | P1 |
| `/product/ddr3-module/` | `/products/memory/ddr3/` | 301 | P2 |

### 3.3 SSD — NVMe

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/product/twinmos-corex-m-2-pcie-gen-4-0-nvme-ssd/` | `/products/ssd/nvme/corex-gen4/` | 301 | P0 |
| `/product/twinmos-alphapro-nvme-m-2-2280-new-ssd/` | `/products/ssd/nvme/alpha-pro-gen3/` | 301 | P0 |
| `/product-category/solid-state-drive/nvme/` | `/products/ssd/nvme/` | 301 | P0 |
| `/product-category/solid-state-drive/` | `/products/ssd/` | 301 | P0 |
| `/product/corex-pro-gen5/` | `/products/ssd/nvme/corex-pro-gen5/` | 301 | P0 |
| `/product/xtreme-gen4/` | `/products/ssd/nvme/xtreme-gen4/` | 301 | P0 |
| `/product/xtreme-pro-gen4/` | `/products/ssd/nvme/xtreme-pro-gen4/` | 301 | P1 |
| `/product/tw300-gen3/` | `/products/ssd/nvme/tw300-gen3/` | 301 | P1 |

### 3.4 SSD — SATA

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/product/hyper-h2-ultra-sata/` | `/products/ssd/sata/hyper-h2-ultra/` | 301 | P1 |
| `/product/m2-sata/` | `/products/ssd/sata/m2-sata/` | 301 | P1 |
| `/product-category/solid-state-drive/sata/` | `/products/ssd/sata/` | 301 | P1 |

### 3.5 Portable and USB

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/product-category/portable-drive/` | `/products/portable/` | 301 | P1 |
| `/product/elite-drive-pro/` | `/products/portable/elite-drive-pro/` | 301 | P1 |
| `/product/prodrive-ultra/` | `/products/portable/prodrive-ultra/` | 301 | P1 |
| `/product-category/usb-flash-drive/` | `/products/usb/` | 301 | P1 |
| `/product/mobile-disk-x3/` | `/products/usb/mobile-disk-x3/` | 301 | P1 |

### 3.6 Product Archive / Shop

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/shop/` | `/products/` | 301 | P0 |
| `/products/` (WooCommerce plural) | `/products/` | Canonical (same URL) | — |
| `/product-category/` | `/products/` | 301 | P0 |
| `/?post_type=product` | `/products/` | 301 | P0 |
| `/shop/page/2/` | `/products/` | 301 | P1 |

---

## 4. URL Mapping Table — Support

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/support/` | `/support/` | Canonical (same URL) | — |
| `/support/warranty/` | `/support/warranty/` | Canonical | — |
| `/warranty/` (root-level) | `/support/warranty/` | 301 | P0 |
| `/rma/` | `/support/rma/` | 301 | P0 |
| `/rma-form/` | `/support/rma/submit/` | 301 | P0 |
| `/downloads/` | `/support/downloads/` | 301 | P0 |
| `/firmware/` | `/support/firmware/` | 301 | P1 |
| `/manuals/` | `/support/manuals/` | 301 | P1 |
| `/faq/` | `/support/faq/` | 301 | P0 |
| `/technical-support/` | `/support/contact/` | 301 | P0 |
| `/knowledgebase/` | `/support/kb/` | 301 | P0 |
| `/kb/` | `/support/kb/` | 301 | P0 |
| `/compatibility/` | `/support/compatibility-finder/` | 301 | P0 |
| `/serial-number/` | `/support/serial-number-checker/` | 301 | P1 |
| `/counterfeit/` | `/support/counterfeit-detection/` | 301 | P1 |
| `/driver/` | `/support/downloads/` | 301 | P1 |

---

## 5. URL Mapping Table — About and Company

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/about-us/` | `/about/` | 301 | P0 |
| `/about/` | `/about/` | Canonical | — |
| `/company/` | `/about/company/` | 301 | P0 |
| `/history/` | `/about/history/` | 301 | P1 |
| `/leadership/` | `/about/leadership/` | 301 | P1 |
| `/team/` | `/about/leadership/` | 301 | P1 |
| `/manufacturing/` | `/about/manufacturing/` | 301 | P1 |
| `/quality/` | `/about/quality/` | 301 | P1 |
| `/certifications/` | `/about/certifications/` | 301 | P1 |
| `/awards/` | `/about/awards/` | 301 | P2 |
| `/sustainability/` | `/about/sustainability/` | 301 | P2 |
| `/csr/` | `/about/csr/` | 301 | P2 |
| `/press-room/` | `/about/press-room/` | 301 | P1 |
| `/media-kit/` | `/about/media-kit/` | 301 | P1 |
| `/investor-relations/` | `/about/investor-relations/` | 301 | P2 |

---

## 6. URL Mapping Table — Contact and Partners

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/contact-us/` | `/contact/` | 301 | P0 |
| `/contact/` | `/contact/` | Canonical | — |
| `/contact/sales` | `/contact/sales/` | 301 (trailing slash) | P0 |
| `/distributors/` | `/partners/distributors/` | 301 | P0 |
| `/partners/` | `/partners/` | Canonical | — |
| `/become-a-partner/` | `/partners/become-a-partner/` | 301 | P1 |
| `/dealer-locator/` | `/where-to-buy/` | 301 | P0 |
| `/where-to-buy/` | `/where-to-buy/` | Canonical | — |
| `/resellers/` | `/where-to-buy/retailers/` | 301 | P1 |
| `/oem/` | `/partners/oem-odm/` | 301 | P1 |
| `/offices/` | `/contact/offices/` | 301 | P1 |

---

## 7. URL Mapping Table — Legal and Compliance

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/privacy-policy/` | `/legal/privacy-policy/` | 301 | P0 |
| `/terms-of-use/` | `/legal/terms-of-use/` | 301 | P0 |
| `/terms-and-conditions/` | `/legal/terms-of-service/` | 301 | P0 |
| `/cookie-policy/` | `/legal/cookie-policy/` | 301 | P0 |
| `/warranty-terms/` | `/legal/warranty-policy/` | 301 | P0 |
| `/warranty-policy/` | `/legal/warranty-policy/` | Canonical | — |
| `/gdpr/` | `/legal/gdpr/` | 301 | P0 |
| `/rohs/` | `/legal/rohs/` | 301 | P1 |
| `/compliance/` | `/legal/` | 301 | P1 |
| `/sitemap/` | `/legal/sitemap/` | 301 | P2 |

---

## 8. URL Mapping Table — News and Events

| Legacy URL (Current) | New URL | Redirect Type | Priority |
|---------------------|---------|--------------|---------|
| `/news/` | `/news/articles/` | 301 | P0 |
| `/blog/` | `/news/articles/` | 301 | P0 |
| `/press-releases/` | `/news/press-releases/` | 301 | P0 |
| `/events/` | `/news/events/` | 301 | P1 |
| `/news/computex-2024/` | `/news/events/computex-2024/` | 301 | P2 |
| `/news/gitex-2024/` | `/news/events/gitex-2024/` | 301 | P2 |
| `/blog/{old-slug}/` | `/news/articles/{new-slug}/` | 301 per article | P1 |

**Note:** Each legacy blog/news article requires its own individual redirect entry. A full per-article mapping is maintained in the Strapi redirect plugin's admin UI.

---

## 9. Canonicalisation Decisions

### 9.1 Product Variant Consolidation

Multiple legacy URLs for the same product family are consolidated to the new family landing page. Individual capacity/speed variants get their own URLs under the new structure.

| Scenario | Decision |
|----------|----------|
| Legacy product page with no spec detail | 301 → product family page |
| Legacy product page with good organic traffic | 301 → most relevant new individual product page |
| Legacy category page | 301 → equivalent new category page |

### 9.2 Duplicate Content Elimination

The legacy site had several near-duplicate pages (e.g., `/ddr4/` and `/ddr4-memory/` both existing). These are consolidated:

| Duplicate URLs | Canonical | Others Redirect |
|--------------|-----------|----------------|
| `/ddr4/` and `/ddr4-memory/` and `/product-category/dram-module/ddr4/` | `/products/memory/ddr4/` | 301 all to canonical |
| `/nvme-ssd/` and `/nvme/` and `/m2-ssd/` | `/products/ssd/nvme/` | 301 all to canonical |

---

## 10. Pages Being Retired (410 Gone)

These pages have no equivalent in the new structure and no significant inbound links or organic traffic. They return HTTP 410 (Gone) rather than 301 or 404.

| Legacy URL | Reason for Retirement |
|-----------|----------------------|
| `/sample-page/` | WordPress default page — no content |
| `/hello-world/` | WordPress default post — no content |
| `/cart/` | WooCommerce cart — Phase 3 feature; not available at P1 launch |
| `/checkout/` | WooCommerce checkout — Phase 3 |
| `/my-account/` | WooCommerce account — Phase 3 |
| `/compare/` (old product compare) | Replaced by new `/products/compare/` |
| `/wishlist/` | WooCommerce feature — not in P1 scope |
| `/tag/{tag-slug}/` | WordPress tags — no equivalent in new IA |
| Old press release pages with no traffic | Retired with 410 after 6 months |

---

## 11. Pages Being Consolidated

Pages being merged into a single, richer destination page:

| Legacy URLs | Consolidated Into | Rationale |
|------------|------------------|-----------|
| `/quality/`, `/iso-9001/`, `/quality-assurance/` | `/about/quality/` | Single authoritative quality page |
| `/certifications/`, `/rohs-compliance/`, `/ce-marking/` | `/about/certifications/` + `/legal/rohs/` etc. | Compliance content split to About and Legal |
| `/faq/`, `/faq/products/`, `/faq/shipping/` | `/support/faq/` | Unified FAQ hub |
| `/contact/`, `/contact-us/`, `/get-in-touch/` | `/contact/` | Single contact hub |
| `/news/`, `/blog/`, `/news-events/` | `/news/articles/` | Unified news hub |

**Redirect chain flattening:** All consolidation redirects are implemented as direct 301s from old URL to new URL. No chains (old → intermediate → new) are permitted — maximum one hop.

---

## 12. Priority Order for Redirect Implementation

Redirects are implemented in priority order to protect organic traffic from high-value legacy URLs.

| Priority | Implementation Criteria |
|----------|------------------------|
| P0 | Pages with >100 organic sessions/month in GSC; pages with >5 external backlinks; core product category pages |
| P1 | Pages with 20–100 organic sessions/month; individual product pages; support pages |
| P2 | Pages with <20 organic sessions/month; blog/news articles; secondary pages |
| P3 | Retired pages (410 implementation); low-traffic edge cases |

**All P0 redirects must be live before the domain cutover.** P1 within 72 hours. P2 within 1 week. P3 within 2 weeks.

---

## 13. Testing Protocol

### Pre-Launch Checklist

1. Export all 207 redirect rules to a spreadsheet.
2. Run Screaming Frog Spider against the staging environment with the `_redirects` file applied.
3. Verify each legacy URL returns HTTP 301 (or 410 for retired pages).
4. Confirm redirect destination URL returns HTTP 200.
5. Check for redirect chains — no URL should require more than one hop.
6. Check for redirect loops — flag any circular redirect pairs.
7. Verify no P0 product page returns 404 after cutover.

### Post-Launch Monitoring (First 30 days)

1. Google Search Console → Coverage report → "Not found (404)" — investigate any spikes.
2. GA4 → Site content → Pages with high 404 rate — add redirects for any missed legacy URLs.
3. Ahrefs → Site Audit → Broken backlinks — redirect any 404 URL with external backlinks.
4. Weekly crawl of legacy URL list to confirm all redirects remain functional.

---

*Related: [URL Structure Spec](TwinMOSWebsiteURLStructureSpec.md) | [301 Redirect Plan](TwinMOSWebsite301RedirectPlan.md) | [SEO Strategy](TwinMOSWebsiteSEO_Strategy.md)*
