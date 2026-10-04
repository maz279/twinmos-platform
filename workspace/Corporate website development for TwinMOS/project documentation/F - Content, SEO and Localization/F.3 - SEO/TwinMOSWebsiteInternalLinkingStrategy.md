# TwinMOS Website — Internal Linking Strategy

**Document Reference:** TWN-F3-INTLINK-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Marketing Director / Front-End Lead
**Relates To:** TwinMOSWebsiteSEO_Strategy.md §5.5; TwinMOSWebsiteURLStructureSpec.md

---

## Table of Contents

1. [Purpose and Principles](#1-purpose-and-principles)
2. [Hub-and-Spoke Architecture](#2-hub-and-spoke-architecture)
3. [Pillar–Cluster Model for Learn Hub](#3-pillarclu-model-for-learn-hub)
4. [Priority Link Flows](#4-priority-link-flows)
5. [Support Content Linking](#5-support-content-linking)
6. [Anchor Text Guidelines](#6-anchor-text-guidelines)
7. [Breadcrumb Implementation](#7-breadcrumb-implementation)
8. [Cross-Section Linking Rules](#8-cross-section-linking-rules)
9. [Footer Link Taxonomy](#9-footer-link-taxonomy)
10. [Related Products Widget](#10-related-products-widget)
11. [Internal Linking Audit Schedule](#11-internal-linking-audit-schedule)
12. [Orphan Page Detection](#12-orphan-page-detection)

---

## 1. Purpose and Principles

Internal links serve three functions simultaneously:
1. **Navigation** — help users discover relevant content.
2. **PageRank distribution** — pass authority from high-authority pages (homepage, category hubs) to conversion pages (product detail, KB articles).
3. **Topic signalling** — tell search engines which pages are most important and how content is related.

### 1.1 Core Principles

- **Every page must be reachable within 3 clicks from the homepage.**
- **Every page must have at least 1 internal link pointing to it** (no orphan pages).
- **Every key product page must have at least 5 internal links pointing to it** from category pages, hub pages, and Learn Hub articles.
- Anchor text must be descriptive — never "click here" or bare URLs.
- Internal links use relative paths (not absolute `https://twinmos.com/...`) in the codebase; canonical absolute URLs in sitemap and structured data.

---

## 2. Hub-and-Spoke Architecture

Each product category hub is the central "spoke" that links out to individual product pages and receives links from the homepage, navigation, and Learn Hub.

### 2.1 Architecture Diagram

```
Homepage (twinmos.com/)
│
├── /products/                        ← Products hub
│   ├── /products/memory/             ← Memory category hub
│   │   ├── /products/memory/ddr5/    ← DDR5 sub-hub
│   │   │   ├── Individual DDR5 product pages (8 pages)
│   │   ├── /products/memory/ddr4/    ← DDR4 sub-hub
│   │   │   ├── Individual DDR4 product pages (5 pages)
│   │   └── /products/memory/ddr3/
│   ├── /products/ssd/                ← SSD category hub
│   │   ├── /products/ssd/nvme/       ← NVMe sub-hub
│   │   │   ├── Individual NVMe SSD pages (6 pages)
│   │   └── /products/ssd/sata/
│   ├── /products/portable/
│   └── /products/usb/
│
├── /learn/                           ← Learn Hub (pillar–cluster)
│   ├── /learn/buying-guide/          ← Buying guide hub
│   │   └── Cluster articles linked to product pages
│   ├── /learn/explainer/
│   └── /learn/benchmark/
│
├── /support/                         ← Support hub
│   ├── /support/kb/                  ← KB hub
│   │   └── KB articles linked to product pages + warranty
│   ├── /support/warranty/
│   └── /support/rma/
│
└── /gaming/                          ← Gaming/VOLTX hub
    └── Links to VOLTX product pages + Learn Hub gaming articles
```

### 2.2 Link Counts by Page Type

| Page Type | Min Incoming Links | Min Outgoing Links |
|-----------|------------------|------------------|
| Homepage | N/A | 10+ (navigation + featured sections) |
| Product category hub | 3+ (homepage, nav, related hubs) | 10+ (all products in category + cross-links) |
| Product detail page | 5+ (category hub, Learn Hub, Support, Gaming) | 5+ (related products, Learn Hub, Where to Buy, Support) |
| Buying guide | 3+ (Learn Hub, category page, related guide) | 5+ (product pages, related guides) |
| KB article | 2+ (Support hub, product page) | 3+ (product page, warranty/RMA, related KB) |
| Regional landing page | 2+ (Where to Buy, Partners) | 5+ (products, distributor page, contact) |

---

## 3. Pillar–Cluster Model for Learn Hub

### 3.1 Structure

The Learn Hub uses a **pillar–cluster** model for topical authority:
- **Pillar page** (`/learn/buying-guide/[primary-topic]/`) = broad, comprehensive guide targeting a high-volume head term.
- **Cluster pages** (`/learn/[type]/[sub-topic]/`) = focused articles on specific long-tail terms, all linking back to the pillar and to each other.

### 3.2 DDR5 Content Cluster

**Pillar:** `/learn/buying-guide/best-ddr5-ram/` → Target keyword: "best DDR5 RAM"

Cluster articles that link TO the pillar and receive links FROM the pillar:

| Cluster Article URL | Links To Pillar? | Links From Pillar? | Also Links To |
|--------------------|-----------------|--------------------|--------------|
| `/learn/buying-guide/ddr5-vs-ddr4/` | ✓ | ✓ | `/products/memory/ddr5/`, `/products/memory/ddr4/` |
| `/learn/explainer/ddr5-6000mhz-sweet-spot/` | ✓ | ✓ | `/products/memory/voltx-ddr5-6000mhz-32gb/` |
| `/learn/explainer/amd-expo-vs-intel-xmp/` | ✓ | ✓ | `/products/memory/ddr5/`, `/support/kb/enable-xmp-expo-bios/` |
| `/learn/explainer/ddr5-on-die-ecc/` | ✓ | ✓ | `/products/memory/ddr5/` |
| `/learn/buying-guide/ddr5-ram-ryzen-7000/` | ✓ | ✓ | `/products/memory/voltx-ddr5-6000mhz-32gb/` |
| `/learn/buying-guide/ddr5-laptop-ram/` | ✓ | ✓ | `/products/memory/voltx-ddr5-so-dimm/` |
| `/support/kb/how-to-install-ddr5-ram/` | ✓ | ✓ | `/products/memory/ddr5/`, `/support/warranty/` |
| `/support/kb/enable-xmp-expo-bios/` | ✓ | ✓ | `/products/memory/ddr5/` |

### 3.3 NVMe SSD Content Cluster

**Pillar:** `/learn/buying-guide/best-nvme-ssd/` → Target keyword: "best NVMe SSD"

| Cluster Article | Key Internal Links |
|-----------------|-------------------|
| `/learn/buying-guide/nvme-vs-sata-ssd/` | `/products/ssd/nvme/`, `/products/ssd/sata/` |
| `/learn/explainer/pcie-gen5-explained/` | `/products/ssd/nvme/corex-pro-gen5/` |
| `/learn/explainer/m2-form-factor-guide/` | `/products/ssd/nvme/`, `/support/kb/how-to-install-m2-nvme-ssd/` |
| `/learn/benchmark/nvme-ssd-benchmarks/` | `/products/ssd/nvme/corex-pro-gen5/`, `/products/ssd/nvme/xtreme-gen4/` |
| `/support/kb/how-to-install-m2-nvme-ssd/` | `/products/ssd/nvme/`, `/support/warranty/` |
| `/support/kb/nvme-ssd-not-detected/` | `/products/ssd/nvme/`, `/support/kb/how-to-install-m2-nvme-ssd/` |

---

## 4. Priority Link Flows

### 4.1 Primary Purchase Funnel

```
Homepage → Products category hub → Product sub-category → Product detail → Where to Buy / Contact
```

Every product detail page must contain:
- A link to its parent category hub (via breadcrumb).
- A "Find Retailers" CTA link to `/where-to-buy/`.
- A "Get a Quote" or "Contact Sales" CTA to `/contact/sales/` (for B2B products).

### 4.2 Education → Purchase Funnel

```
Learn Hub article → Product detail page → Where to Buy
```

Buying guides must always end with a product recommendation section containing direct links to the recommended product pages.

Example from `/learn/buying-guide/best-ddr5-ram/`:
> "Our top pick is [VOLTX DDR5 6000MHz 32GB](/products/memory/voltx-ddr5-6000mhz-32gb/) for most gaming builds, with [VOLTX RGB DDR5 6000MHz](/products/memory/voltx-rgb-ddr5-6000mhz-32gb/) as the premium option."

### 4.3 Support → Product and Back

```
Product detail page → Support KB article → Back to product / Warranty / RMA
```

Every KB article must:
1. Link to the product page(s) it relates to (within the first 100 words).
2. End with a "Related products" or "Was this helpful?" section linking to warranty/RMA.

### 4.4 Regional → Products and Retailers

```
Regional landing page → Product category hub → Individual product → Where to Buy
```

---

## 5. Support Content Linking

### 5.1 Product Page → KB Article Links

Every product detail page includes a "Support Resources" section with links to:
- The primary installation guide for that product type (`/support/kb/how-to-install-ddr5-ram/`).
- The troubleshooting guide for common issues.
- The warranty page (`/support/warranty/`).
- The downloads page for firmware/drivers (`/support/downloads/`).

### 5.2 KB Article Linking Rules

KB articles must link to:
1. **The product page** for the product the article is about (anchor text = product name).
2. **The Support hub** (`/support/`) — breadcrumb provides this automatically.
3. **Related KB articles** — at least 1–2 "Related articles" links at the end of every KB.
4. **Warranty or RMA page** — for any article about product failure or defects.

---

## 6. Anchor Text Guidelines

### 6.1 Rules

- Anchor text must describe the destination content precisely.
- Include the primary keyword of the destination page in the anchor text where natural.
- Vary anchor text across multiple links to the same page (do not repeat the exact same anchor every time).
- Never use: "click here", "read more", "this page", "here", "link".
- Brand name as anchor is acceptable for navigational links (e.g., "TwinMOS warranty policy").

### 6.2 Correct vs Incorrect Anchor Text

| Destination | Correct Anchor Text | Incorrect |
|------------|---------------------|-----------|
| `/products/memory/voltx-ddr5-6000mhz-32gb/` | "VOLTX DDR5 6000MHz 32GB U-DIMM" | "click here" |
| `/learn/buying-guide/ddr5-vs-ddr4/` | "DDR5 vs DDR4 buying guide" | "read more" |
| `/support/kb/enable-xmp-expo-bios/` | "How to enable XMP or EXPO in BIOS" | "this support article" |
| `/support/warranty/` | "TwinMOS 5-year warranty" | "our warranty" |
| `/where-to-buy/` | "Find authorised TwinMOS retailers" | "buy here" |
| `/contact/sales/` | "Contact the TwinMOS sales team" | "contact us" |

### 6.3 Anchor Text Diversity

For high-priority pages that receive links from many sources, vary the anchor text:
- Product page `/products/memory/ddr5/`: use "DDR5 RAM", "VOLTX DDR5 memory", "DDR5 desktop memory", "TwinMOS DDR5" across different linking pages.

---

## 7. Breadcrumb Implementation

### 7.1 Breadcrumb Structure

Every non-homepage page displays a visible breadcrumb trail and has `BreadcrumbList` structured data (see `TwinMOSWebsiteSchemaOrgJSONLDTemplates.md §12`).

**Example breadcrumb for a product detail page:**
```
Home › Products › Memory › DDR5 › VOLTX DDR5 6000MHz 32GB
```

Each breadcrumb item is a clickable link (except the final, current page item).

### 7.2 Breadcrumb Generation

Breadcrumbs are auto-generated from the URL path structure by the Astro breadcrumb utility (`src/lib/breadcrumb.ts`), which:
1. Splits the pathname into segments.
2. Maps each segment to its display label using the Strapi content title for known routes.
3. Generates `BreadcrumbList` JSON-LD automatically.

### 7.3 Breadcrumb Display Rule

- Show breadcrumb on: all product pages, all support pages, all learn pages, all news pages, all legal pages, all regional pages.
- Do not show breadcrumb on: homepage, top-level hub pages that are effectively "level 2" (e.g., `/products/`, `/support/`).

---

## 8. Cross-Section Linking Rules

### 8.1 Gaming Hub ↔ Products

- Gaming Hub (`/gaming/`) links to: all VOLTX product pages, DDR5 category hub, relevant buying guides on Learn Hub.
- Every VOLTX product page links to: Gaming Hub, overclocking guide, RGB showcase (if applicable).

### 8.2 Learn Hub ↔ Products

- Every buying guide links to: at least 3 specific product pages with recommendation context.
- Every product detail page links to: 1–2 relevant Learn Hub articles (e.g., the product page for VOLTX DDR5 links to "DDR5 vs DDR4" and "How to enable XMP/EXPO").

### 8.3 Solutions Pages ↔ Products

- Each solutions page (`/solutions/gaming/`, `/solutions/enterprise/`, etc.) links to: relevant product category hub and 2–3 specific products.
- Enterprise-focused product pages (ECC, server memory — when launched) link to the Solutions enterprise page.

### 8.4 Technology Pages ↔ Learn Hub

- Technology hub pages (`/technology/pcie-evolution/`, `/technology/dram-education/`) link to relevant Learn Hub explainers that provide deeper dives.
- Learn Hub explainers on technical topics (PCIe Gen 5, on-die ECC) link back to the technology hub pages.

### 8.5 Regional Pages ↔ Products and Partners

- Each regional landing page links to: `/products/` hub, `/where-to-buy/`, `/partners/distributors/regional/{country}/`.
- The `/where-to-buy/` page links to all regional landing pages.

---

## 9. Footer Link Taxonomy

The global site footer includes a structured set of internal links present on every page — providing significant PageRank distribution benefit.

### 9.1 Footer Link Sections

**Products**
- Memory (DDR5) → `/products/memory/ddr5/`
- Memory (DDR4) → `/products/memory/ddr4/`
- NVMe SSD → `/products/ssd/nvme/`
- SATA SSD → `/products/ssd/sata/`
- Portable Storage → `/products/portable/`
- USB Flash Drives → `/products/usb/`

**Support**
- Support Hub → `/support/`
- Warranty → `/support/warranty/`
- RMA → `/support/rma/`
- Downloads → `/support/downloads/`
- Knowledge Base → `/support/kb/`
- Compatibility Finder → `/support/compatibility-finder/`

**Company**
- About TwinMOS → `/about/`
- Certifications → `/about/certifications/`
- Sustainability → `/about/sustainability/`
- Careers → `/careers/`
- Press Room → `/about/press-room/`

**Partners & Sales**
- Become a Distributor → `/partners/become-a-partner/`
- Where to Buy → `/where-to-buy/`
- OEM / ODM → `/partners/oem-odm/`
- Contact Sales → `/contact/sales/`

**Legal**
- Privacy Policy → `/legal/privacy-policy/`
- Cookie Policy → `/legal/cookie-policy/`
- Terms of Use → `/legal/terms-of-use/`
- Accessibility → `/legal/accessibility/`

### 9.2 Footer Link Rules

- Footer links use concise anchor text (2–4 words).
- Do not include more than 30 total footer links (Google may devalue footer links if too many).
- The footer must include the cookie consent preferences trigger link: "Cookie Preferences".
- Include the TwinMOS registered address and company number in the footer.

---

## 10. Related Products Widget

### 10.1 Placement

The "Related Products" widget appears on every product detail page, below the main product content and above the FAQ section.

### 10.2 Related Products Logic

Related products are determined by:
1. **Same product family** — other capacity/speed variants of the same product (highest priority).
2. **Same category** — products in the same sub-category (e.g., other DDR5 desktop modules).
3. **Complementary products** — an NVMe SSD page may include a related portable SSD.
4. **Manual override** — Product Manager can manually specify related products in Strapi.

### 10.3 Widget Specifications

- Shows 3–4 related products.
- Each card links to the product detail page using the product name as anchor text.
- Includes product image, name, key spec (e.g., "6000MHz / 32GB"), and a "View Product" CTA.
- Widget is rendered server-side (Astro static) — no JavaScript dependency.

---

## 11. Internal Linking Audit Schedule

| Audit Type | Tool | Frequency | Owner |
|------------|------|-----------|-------|
| Full site crawl for broken internal links | Screaming Frog | Quarterly | Front-End Lead |
| Orphan page detection (no inbound links) | Screaming Frog + Ahrefs | Quarterly | Marketing Director |
| Anchor text diversity report | Screaming Frog | Bi-annually | Marketing Director |
| Deep-link distribution analysis | Ahrefs Internal Links report | Bi-annually | Marketing Director |
| New content link integration check | Manual | On every new page publish | Content author |

### 11.1 Quarterly Audit Process

1. Run Screaming Frog crawl starting from `https://twinmos.com/`.
2. Export: All internal links → sort by destination URL → identify pages with fewer than 2 inbound links (orphan risk).
3. Export: Pages with broken internal links (404 target).
4. Export: Anchor text report → identify pages receiving only "click here" or "read more" anchors.
5. Create remediation tasks in project tracker for all P0 and P1 pages with <5 inbound links.

---

## 12. Orphan Page Detection and Remediation

### 12.1 Definition

An orphan page is any published page with zero or only one internal link pointing to it. Orphan pages:
- Cannot be easily discovered by users navigating the site.
- Receive little PageRank from other pages.
- May be ignored by search engine crawlers.

### 12.2 Orphan Page Remediation Process

1. Identify orphan pages from the quarterly Screaming Frog audit.
2. For each orphan page:
   - Identify the 2–3 most relevant existing pages that should link to it.
   - Add contextual links (not just footer links) from those pages to the orphan.
   - If no natural linking context exists, consider whether the page is needed — if not, archive it.
3. Common remediation: Add the page to a relevant hub page's "Related content" or "See also" section.

### 12.3 Pre-Launch Orphan Prevention

Before Phase 1 launch, run the orphan check against the staging environment. Every page in the sitemap must be reachable from the homepage via internal links within 3 hops.

---

*Related: [SEO Strategy](TwinMOSWebsiteSEO_Strategy.md) | [Schema JSON-LD Templates](TwinMOSWebsiteSchemaOrgJSONLDTemplates.md) | [Content Authoring Guide](../F.2%20-%20Editorial%20Standards/TwinMOSWebsiteContentAuthoringGuideforMarketing.md)*
