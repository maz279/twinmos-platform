# TwinMOS Corporate Website — Comprehensive Content Map

**Document Reference:** TWN-CONTENT-MAP-2026-001
**Document Version:** 1.1 (Tech-Stack Lockdown Propagation Applied)
**Issue Date:** 29 April 2026 (v1.0); 2 May 2026 (v1.1)
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** Marketing Director (content) / UX Lead (structure) / Product Manager (technical accuracy)
**Classification:** CONFIDENTIAL — Internal Use Only
**Synchronized With:** SOW v4.0, BRD v3.0 (v3.2 patches applied), URD v3.1, Tech Stack v1.2, Implementation Roadmap v2.2 (15-Phase), Implementation Strategy v4.0, Forensic Alignment Audit v3.0, Company Profile v2.0

> **v1.1 patch (2 May 2026):** Stale tech mentions corrected per Forensic Alignment Audit v3.0 §8 (F-CM-001 through F-CM-007) and Tech Stack v1.2 lockdown:
> - Frontmatter `template` field: was `# which Next.js / Nuxt template renders this`, now `# which Astro 5 template renders this`
> - Frontmatter `locale` enum: was `en | ar | bn | hi | ru | zh | ...`, now full 10-locale enum `en | ar | bn | hi | ru | zh-CN | fr | es | pt | de` (per Decision 5A)
> - Site-wide search reference: was "Algolia/Elasticsearch search", now "MeiliSearch"
> - CMS reference: was "the headless CMS (Contentful/Sanity/Strapi)", now "Strapi v5 (locked per ADR-001)"
> - Persona list: was 5 + Internal CMS user, now 11 personas + Internal CMS user (5 original — Rahul/Kumar/Sarah/Mr. Patel/Aisha — plus 6 v3.0 additions: Faisal/Embedded, Ms. Tan/Government, Mr. Rahman/Education IT, Mr. Wong/OEM-ODM, Lina/Media, Sara/Job Applicant)
> - Synchronized-With sibling versions all updated v2.0 → v3.x

---

## 0. About This Document

This is the **authoritative content blueprint** for the TwinMOS corporate website redevelopment. It enumerates every content file (Markdown / CMS entry) required to build a tier-1 memory and storage manufacturer website that matches or exceeds Kingston, Corsair, G.Skill, ADATA/XPG, Crucial, Samsung, TEAMGROUP, Transcend, and PNY.

For each content file the document provides:
- **File path / slug** — where the content lives in the CMS / repo
- **Page title (H1)** — the visible heading
- **URL** — the public path
- **Purpose** — why the page exists
- **Primary persona(s)** — full 11-persona register: Rahul (Enthusiast Gamer), Kumar (System Integrator), Sarah (Enterprise Procurement), Mr. Patel (Potential Distributor), Aisha (Laptop Upgrader), Faisal (Embedded/Industrial Engineer), Ms. Tan (Government/Regulated Enterprise IT), Mr. Rahman (Education IT Administrator), Mr. Wong (OEM/ODM Partner), Lina (Media/Industry Analyst), Sara (Job Applicant), plus Internal CMS user (Marketing Manager, Product Manager, Editor, Admin)
- **Key sections** — outline of content the page must contain
- **Source materials** — which existing TwinMOS document supplies facts
- **SEO meta title / description pattern**
- **Primary CTAs**
- **Cross-links** — what should link to / from this page
- **Word count target**
- **Launch phase** — P1 (Phase 1, Months 1–5), P2 (Phase 2, Months 6–9), P3 (Phase 3, Months 10–15), P4 (Phase 4, Months 16+)
- **Priority** — P0 (must-launch), P1, P2, P3
- **Owner** — who writes/maintains
- **Update frequency**

**Total file count:** 287 distinct content entries across 16 top-level categories.

---

## Table of Contents

1. [Site-Wide / Global Components](#1-site-wide--global-components)
2. [Homepage](#2-homepage)
3. [About / Company](#3-about--company)
4. [Products — Catalog Architecture](#4-products--catalog-architecture)
5. [Solutions / Use Cases](#5-solutions--use-cases)
6. [Gaming Hub — VOLTX Brand](#6-gaming-hub--voltx-brand)
7. [Technology, R&D & Innovation](#7-technology-rd--innovation)
8. [Support & Self-Service](#8-support--self-service)
9. [Learn / Knowledge Hub](#9-learn--knowledge-hub)
10. [Where to Buy & Partners](#10-where-to-buy--partners)
11. [News, Press & Events](#11-news-press--events)
12. [Regional / Localization Landings](#12-regional--localization-landings)
13. [Careers](#13-careers)
14. [Contact](#14-contact)
15. [Legal, Compliance & Trust](#15-legal-compliance--trust)
16. [Marketing Programs & Campaigns](#16-marketing-programs--campaigns)
17. [Appendices](#17-appendices)

---

## Source-Material Cross-Reference Key

When a content file says "Source: …" it refers to one of these documents in `C:\software_project\TwinMOS\`:

| Code | Source Document |
|------|-----------------|
| **CP** | [TwinMOS_Company_Profile_Comprehensive.md](../Corporate%20website%20development%20for%20TwinMOS/TwinMOS_Company_Profile_Comprehensive.md) — authoritative facts |
| **WC** | TwinMos Technologies Website Content.docx — existing draft copy, awards list, distributor list |
| **DDR** | A GUIDE BOOK ON ddr MEMORY.docx — DRAM education content |
| **AFR** | Guide to expand business in african region.docx + guide to expanding twinmos business.docx (identical) |
| **CTRY** | Countrywise Companies in Africa.docx + distributor selction in african region.docx (identical) — 15-country distributor list |
| **EGY** | target distributor in egypt.docx |
| **MAR** | customer target morocco.docx |
| **AF2** | customer in africa region 2.docx |
| **HPE** | Enterprise Solution (HPE) Presentation V1.1[1].pptx + twinmos 2024 business plan.pptx (identical; both about STBL/HPE in Bangladesh — for reference only, not TwinMOS-branded enterprise content) |
| **AUDIT** | TwinMOS_Website_Forensic_Audit.md |
| **RFP** | TwinMOS_Website_RFP.md (v2.0) |
| **BRD** | TwinMOS_Website_BRD.md (v2.0) |
| **URD** | TwinMOS_Website_URD.md (v2.0) |

### Critical Source Caveats — Read Before Authoring

2. **Manufacturing footprint:** WC names "Hsinchu, Taiwan; Dongguan and Xinjiang, China". For public-facing copy, use the politically/factually neutral phrasing per BRD §22.3: "Taiwan-based manufacturing with regional partner facilities" — avoid Xinjiang specifically because of geopolitical sensitivity in Western markets.
3. **ISO standard:** WC says "ISO 9001:2000 received in 2002". This is outdated. Per BRD §22.3 use **ISO 9001** with a quarterly re-verification rule.
4. **Awards list (18 entries 2001–2023 from WC):** Each award must have a stored certificate or photograph in the CMS before publication (BR-5.5). Awards without proof MUST NOT be published.
6. **DDR Guide:** Extracted content covers Introduction, Chapter 1, partial Chapter 2 (CL definition mid-sentence). The remaining chapters need a richer extraction pass before authoring the full Knowledge Hub series.
7. **Country docs:** Several have anomalies (Cameroon Global Link Computers has Canadian numbers; Egypt Pro Center has Amman/Jordan address; one Algeria distributor has founding-year inconsistencies). Verify each retailer record in the CMS.
8. **Placeholder addresses in WC:** USA office "12345 Silicon Valley Blvd" is clearly a placeholder. Verify or remove before publication.

---

## File Naming Convention

```
Pattern:  ##-{section-slug}/##-{file-slug}.md
Example:  03-products/01-memory/02-ddr5-desktop-voltx.md
```

- Two-digit prefix preserves natural sort order in IDEs and the CMS
- All slugs are lowercase, hyphenated, no spaces
- Markdown is the storage format; Strapi v5 (locked per ADR-001) imports/exports as `.md` with frontmatter
- Per-file frontmatter template:

```yaml
---
title: ""           # H1 / page title
slug: ""            # URL slug
url: ""             # absolute URL path
template: ""        # which Astro 5 template renders this (e.g. hero-body-cta, spec-gallery, article, form, locator)
description: ""     # SEO meta description (≤ 160 chars)
keywords: []        # SEO keyword set
persona: []         # primary persona(s)
phase: P1           # P1 | P2 | P3 | P4
priority: P0        # P0 | P1 | P2 | P3
owner: ""           # marketing | product | legal | technical | hr
status: draft       # draft | review | published | archived
last_reviewed: ""   # ISO date
locale: en          # en | ar | bn | hi | ru | zh-CN | fr | es | pt | de  (10 active locales by Phase 15 per Decision 5A)
hreflang: []        # canonical alternates
schema: ""          # Schema.org type: Product, Article, Organization...
ctas: []            # primary CTAs on this page
cross_links: []     # related pages
sources: []         # CP | WC | DDR | etc.
---
```

---

# 1. Site-Wide / Global Components

> **Folder:** `00-site-wide/`
> **Purpose:** Components and copy that appear across every page of the site.

| # | File | URL / Component | Purpose | Key Sections | Persona | Phase | Priority | Owner | Sources |
|---|------|-----------------|---------|--------------|---------|-------|----------|-------|---------|
| 1.1 | `00-site-wide/01-header-navigation.md` | (component) | Primary nav copy: Products, Solutions, Gaming, Support, Learn, Where to Buy, About, Contact | Mega-menu structure, search placeholder text, language selector labels, region badge | All | P1 | P0 | Marketing | URD §22.6 |
| 1.2 | `00-site-wide/02-footer.md` | (component) | Standard footer | 4-column layout: Products / Support / Company / Connect; newsletter signup, social icons, legal links, certification badges, language selector, "© 2026 TwinMOS Technologies ME FZE" | All | P1 | P0 | Marketing | URD §22.6 |
| 1.3 | `00-site-wide/03-cookie-banner.md` | (component) | GDPR-compliant cookie banner | Accept all / Reject non-essential / Customize; granular categories: Strictly Necessary, Analytics, Marketing, Personalization | All | P1 | P0 | Legal | BRD §22.1 |
| 1.4 | `00-site-wide/04-newsletter-signup.md` | (component) | Email capture | Headline, subhead, email field, country (optional), product interests checkboxes, GDPR consent (EU), submit | All | P1 | P0 | Marketing | URD UR-4.3 |
| 1.5 | `00-site-wide/05-search-bar.md` | (component) | MeiliSearch site-wide search (locked per ADR-001) | Placeholder, recent searches, popular queries, category filter chips, no-results state, autosuggest formatting | All | P1 | P0 | Tech | URD §6.2 |
| 1.6 | `00-site-wide/06-language-selector.md` | (component) | Language + region picker | EN at launch; AR/BN/HI Phase 2; RU/ZH/FR Phase 3; ES/PT/DE Phase 4. Display native script alongside English name | All | P1 | P0 | UX | URD UR-9.1 |
| 1.7 | `00-site-wide/07-breadcrumb.md` | (component) | Breadcrumb pattern | Home > Section > Subsection > Page; truncate with "…" on mobile | All | P1 | P0 | UX | URD §22.6 |
| 1.8 | `00-site-wide/08-cta-where-to-buy.md` | (component) | Sticky/inline "Where to Buy" CTA | Country-aware label ("Buy in India", "Buy in UAE"), retailer logos | All | P1 | P0 | Marketing | URD UR-3.1 |
| 1.9 | `00-site-wide/09-trust-bar.md` | (component) | Certification & trust strip | ISO 9001, CE, UKCA, FCC, RoHS, REACH, JEDEC, EAC; 27+ years; 93+ countries | All | P1 | P1 | Marketing | CP §8 |
| 1.10 | `00-site-wide/10-404-page.md` | `/404` | Friendly 404 | Illustration, message, search bar, quick links to Products / Support / Contact / Home | All | P1 | P0 | Content | URD §21.14 |
| 1.11 | `00-site-wide/11-500-error-page.md` | `/500` | Server error | Apology copy, "Try again" CTA, support contact | All | P1 | P0 | Content | URD §27 |
| 1.12 | `00-site-wide/12-maintenance-page.md` | (mode) | Scheduled-maintenance shell | ETA, status link, social channels for updates | All | P1 | P1 | Tech | BRD §23.1 |
| 1.13 | `00-site-wide/13-search-results.md` | `/search` | Site-wide search results template | Filter facets (Products, News, Support, KB), result cards, "No results" empty state | All | P1 | P1 | UX | — |
| 1.14 | `00-site-wide/14-skip-links.md` | (component) | Accessibility skip-to-content links | "Skip to main content", "Skip to navigation", "Skip to footer" — visually hidden until focused | All | P1 | P0 | UX | URD §33.1 |
| 1.15 | `00-site-wide/15-microcopy-glossary.md` | (asset) | Reusable button/link/error microcopy | Submit, Cancel, Retry, Loading…, Saving…, Saved, Required, Optional, etc. | All | P1 | P0 | UX | URD §27.1 |

---

# 2. Homepage

> **Folder:** `01-homepage/`
> **Purpose:** First-impression page that communicates who TwinMOS is, what it sells, and why it matters.

| # | File | URL | Purpose | Key Sections | Persona | Phase | Priority | Owner | Sources |
|---|------|-----|---------|--------------|---------|-------|----------|-------|---------|
| 2.1 | `01-homepage/01-homepage.md` | `/` | Brand front door — convert anonymous visitors into product explorers, distributor leads, or media inquirers within 5 seconds | (a) Hero carousel: 3 slides max — VOLTX RGB DDR5, CoreX Pro Gen 5 NVMe, COMPUTEX 2025 highlight; (b) Product Categories grid (Memory / SSD / Portable / USB / Accessories); (c) Featured Products carousel (4 cards); (d) "Trusted in 93+ countries since 1998" trust band with certification logos; (e) Gaming Hub CTA card (dark theme); (f) News Teaser (3 latest); (g) Become a Distributor CTA; (h) Newsletter signup; (i) Footer | All | P1 | P0 | Marketing | CP, WC, RFP §7.3, URD §21.1 |
| 2.2 | `01-homepage/02-hero-slide-voltx-ddr5.md` | (slot) | Hero slide for VOLTX RGB DDR5 | Headline ("Speed Meets Spectacle"), subhead, product image, "Explore VOLTX" CTA | Rahul | P1 | P0 | Marketing | CP §5.1 |
| 2.3 | `01-homepage/03-hero-slide-corex-pro.md` | (slot) | Hero slide for CoreX Pro Gen 5 NVMe | Headline ("PCIe Gen 5.0 — Up to 14,000 MB/s"), subhead, product image, "Discover CoreX Pro" CTA | Rahul, Kumar | P1 | P0 | Marketing | CP §5.2 |
| 2.4 | `01-homepage/04-hero-slide-elite-drive.md` | (slot) | Hero slide for ELITE Drive Pro Portable SSD | Headline ("Your Vault in Your Pocket"), subhead, product image, CTA | Aisha, Rahul | P1 | P1 | Marketing | CP §5.3 |
| 2.5 | `01-homepage/05-hero-slide-distributor.md` | (slot) | Hero slide for partner recruitment | Headline ("Build the Future of Memory & Storage with Us"), CTA: "Become a Distributor" | Mr. Patel | P1 | P0 | Marketing | AFR |
| 2.6 | `01-homepage/06-trust-band-copy.md` | (component) | Below-hero trust strip | "27+ years (since 1998) · 93+ countries · rigorous pre-delivery testing · Dubai HQ" | All | P1 | P0 | Marketing | CP §1, §6 |
| 2.7 | `01-homepage/07-featured-product-cards.md` | (component) | 4 spotlighted SKUs, rotating monthly | Card spec: image, name, key specs, price (informational), CTA | All | P1 | P0 | Marketing | CP §5 |
| 2.8 | `01-homepage/08-category-grid-icons.md` | (component) | 5 category cards with icons | Memory (RAM), SSD, Portable Storage, USB Flash, Accessories | All | P1 | P0 | UX | CP §5 |
| 2.9 | `01-homepage/09-testimonials-block.md` | (component) | 3 rotating customer/distributor testimonials | Quote, name, title, company, headshot/logo | All | P1 | P1 | Marketing | WC (verify each quote) |

---

# 3. About / Company

> **Folder:** `02-about/`
> **URL prefix:** `/about/`
> **Purpose:** Establish credibility, heritage, leadership, manufacturing depth, and corporate values.

| # | File | URL | Purpose | Key Sections | Persona | Phase | Priority | Owner | Sources |
|---|------|-----|---------|--------------|---------|-------|----------|-------|---------|
| 3.1 | `02-about/01-overview.md` | `/about/` | Company overview landing | Mission ("Innovation, Perfection, and Quality"), vision, what we do (one-paragraph), 27+ years headline, 93+ countries map, 100+ products, sub-page tile grid (History, Leadership, Manufacturing, Quality, Awards, Sustainability, Press, Careers, Contact) | All | P1 | P0 | Marketing | CP, WC §1 |
| 3.4 | `02-about/04-manufacturing.md` | `/about/manufacturing/` | Manufacturing & supply-chain capabilities | Taiwan-based manufacturing with regional partner facilities · rigorous pre-delivery product testing · multi-stage QC · NAND/controller supply-chain partners (Micron, SK Hynix, Silicon Motion, Phison) · graphene & aluminum thermal solutions · clean-room class · production capacity overview (general, no proprietary numbers) | Sarah, Mr. Patel | P1 | P1 | Marketing + Operations | CP §6, BRD §22.3 — politically neutral phrasing |
| 3.5 | `02-about/05-quality-assurance.md` | `/about/quality/` | Quality engineering process | Component sourcing standards · IQC (Incoming QC) · in-process QC · functional testing · burn-in · FQC (Final QC) · OQC (Outgoing QC) · MTBF testing · stress testing · compatibility testing · failure analysis lab · ISO 9001 framework | Sarah, Kumar, Mr. Patel | P1 | P1 | Product / Quality | CP §6 |
| 3.6 | `02-about/06-certifications.md` | `/about/certifications/` | Compliance certifications hub | ISO 9001 (mfg partners) · CE · UKCA · FCC · EAC · RoHS · REACH · JEDEC compliance for DRAM products · BIS (India Phase 2) — each badge links to certificate image / verification page | Sarah, Mr. Patel, Kumar | P1 | P0 | Compliance | CP §8, BRD §22.3 |
| 3.7 | `02-about/07-awards.md` | `/about/awards/` | Awards & Recognition gallery | Published recognition only: **Best SSD Manufacturer 2023** (twinmos.com announcement) + verified credentials (ISO 9001:2000 TÜV SÜD 2002, RoHS, CE, FCC, EPEAT, JEDEC, USB-IF VID 4719, IEEE OUI 000B9D). Previously drafted 2001–2022 award timeline removed 2026-09 as unverifiable; add awards only with certificate per BR-5.5 | All | P1 | P1 | Marketing + Legal | twinmos.com, BRD §22.4 |
| 3.8 | `02-about/08-sustainability.md` | `/about/sustainability/` | ESG / sustainability statement | Green manufacturing pillars · WEEE compliance · packaging reduction · energy-efficient products (DDR5 1.1V vs DDR4 1.2V vs DDR3 1.5V) · materials transparency · partner sustainability commitments · planned ESG report (Phase 2) | All | P1 | P1 | Marketing + Operations | CP §6 strategic outlook, WC awards 2008/2021 |
| 3.9 | `02-about/09-csr-community.md` | `/about/csr/` | Corporate Social Responsibility programs | Community engagement · STEM education partnerships · regional sponsorships · disaster-response donations · employee volunteering | All | P2 | P2 | Marketing | — (author fresh) |
| 3.11 | `02-about/11-corporate-entities.md` | `/about/entities/` | Legal-entity disclosure | TwinMOS Technologies Ltd. (Taipei HQ & R&D) | TwinMOS Technologies (Dubai DAFZA international office) | TwinMOS Technologies Co., Ltd. (Dongguan manufacturing) | TwinMOS Europe GmbH (Cologne) | TwinMOS America Inc. (San Jose) | independent company, no parent/holding | USB Vendor ID 4719 | IEEE OUI 000B9D | Sarah, Mr. Patel, Legal | P1 | P1 | Legal | CP §3 |
| 3.12 | `02-about/12-why-choose-twinmos.md` | `/about/why-choose-us/` | Brand manifesto / "Why TwinMOS" | 5–6 pillars: Heritage (27+ years) · Quality (rigorous pre-delivery testing) · Reach (93+ countries) · Range (full DRAM/SSD/portable portfolio) · Price-Performance (80–90% flagship perf @ 60–70% price per CP §9) · Service (24/7 support, regional teams) | All | P1 | P0 | Marketing | CP §9 |
| 3.13 | `02-about/13-mission-vision-values.md` | `/about/mission-vision/` | Mission / Vision / Values statement | Mission: Customer Empowerment, Quality Excellence, Innovation Leadership, Customer Service · Vision: Technological Advancement, Industry Leadership, Customer-Centric Approach, Sustainable Growth · Values: Integrity, Quality, Innovation, Collaboration | All | P1 | P1 | Marketing | WC mission/vision sections |
| 3.14 | `02-about/14-press-room.md` | `/about/press/` | Press / Media center landing | Press releases archive · Media kit (logos, brand guidelines, executive headshots) · "In the news" external coverage · media inquiry form · press contact (press@twinmos.com) | Media | P1 | P1 | PR | RFP Appendix C |
| 3.15 | `02-about/15-media-kit.md` | `/about/press/media-kit/` | Downloadable brand assets | Logo (PNG/SVG/EPS, light & dark) · brand guidelines PDF · executive headshots · product hero shots · brand colors & typography reference · trademark usage policy | Media, Distributors | P1 | P1 | Marketing | — |
| 3.16 | `02-about/16-corporate-fact-sheet.md` | `/about/fact-sheet/` | One-page downloadable fact sheet (PDF) | Founded · HQ · global reach · employees · revenue band · product range · certifications · top distributors · key contacts | Media, Mr. Patel | P1 | P1 | Marketing | CP |
| 3.17 | `02-about/17-investor-relations.md` | `/about/investors/` | (Placeholder if private-company; activate if/when relevant) | Currently a private company; page reserved for future IPO/funding-event use | Investors | P4 | P3 | Finance | — |

---

# 4. Products — Catalog Architecture

> **Folder:** `03-products/`
> **URL prefix:** `/products/`
> **Purpose:** Comprehensive product discovery, evaluation, and conversion.
>
> **Architecture (dual-axis per TEAMGROUP pattern, RFP §2):**
> - **Axis 1: By Category** (Memory → SSD → Portable Storage → USB Flash → Accessories)
> - **Axis 2: By Brand Line** (VOLTX, TornadoX7, Thunder GX, Concord, CoreX Pro, Xtreme, Alpha Pro, Hyper H2 Ultra, ELITE Drive Pro, ProDrive Ultra, Mobile Disk X3, Mobile Hub)
>
> **Templates:** Category Landing → Subcategory → Family → SKU Detail (with Specs / Features / Compatible Systems / Awards / Reviews / Datasheet / Where to Buy)

## 4.1 Product Catalog Hub

| # | File | URL | Purpose | Key Sections | Persona | Phase | Priority |
|---|------|-----|---------|--------------|---------|-------|----------|
| 4.1.1 | `03-products/00-products-hub.md` | `/products/` | All-products landing | Category cards (Memory / SSD / Portable / USB / Accessories) · Brand cards (VOLTX / TornadoX7 / Thunder GX / etc.) · Featured products · "Find by device" CTA · Catalog PDF download | All | P1 | P0 |
| 4.1.2 | `03-products/00-catalog-pdf-h1-2026.md` | `/products/catalog/` | Downloadable half-yearly catalog (XPG/TEAMGROUP pattern) | PDF asset listing all SKUs, distributor-friendly | Mr. Patel, Kumar | P1 | P1 |
| 4.1.3 | `03-products/00-product-comparison.md` | `/products/compare/` | Side-by-side product comparison | Up to 4 products, highlighted-difference cells, print, share | Rahul, Kumar | P1 | P1 |

## 4.2 Memory (RAM)

> URL: `/products/memory/`

| # | File | URL | Purpose | Key Sections | Persona | Phase | Priority |
|---|------|-----|---------|--------------|---------|-------|----------|
| 4.2.1 | `03-products/01-memory/00-memory-hub.md` | `/products/memory/` | Memory category landing | DDR5/DDR4/DDR3 sub-cards · Desktop vs Laptop split · "RAM Compatibility Finder" CTA · "What is RAM?" link | All | P1 | P0 |
| 4.2.2 | `03-products/01-memory/01-ddr5-desktop-hub.md` | `/products/memory/ddr5/desktop/` | DDR5 desktop landing | Filter sidebar (capacity, speed, RGB) · grid of VOLTX, VOLTX RGB SKUs · "Why DDR5?" sidebar | Rahul, Kumar, Sarah | P1 | P0 |
| 4.2.3 | `03-products/01-memory/02-ddr5-voltx-udimm.md` | `/products/memory/ddr5/voltx-udimm/` | VOLTX DDR5 U-DIMM family page | Family overview · variants (5600/6000 MHz × 8/16/32GB) · Intel XMP 3.0 / On-die ECC / 1.1–1.35V · black aluminum heatsink · key features · warranty (Limited Lifetime per BR-6.1) | Rahul, Kumar | P1 | P0 |
| 4.2.4 | `03-products/01-memory/03-ddr5-voltx-rgb-udimm.md` | `/products/memory/ddr5/voltx-rgb-udimm/` | VOLTX RGB DDR5 U-DIMM family page | RGB lighting visualizer embed · sync compatibility (Aura Sync, RGB Fusion, Mystic Light, Polychrome) · variants 5600/6000 × 16/32GB kits | Rahul | P1 | P0 |
| 4.2.5 | `03-products/01-memory/04-ddr5-laptop-sodimm.md` | `/products/memory/ddr5/laptop-sodimm/` | DDR5 SO-DIMM family page | VOLTX DDR5 SO-DIMM 5600 16GB · MTCD thermal tech · device compatibility teaser | Aisha, Rahul | P1 | P0 |
| 4.2.6 | `03-products/01-memory/05-ddr4-desktop-hub.md` | `/products/memory/ddr4/desktop/` | DDR4 desktop landing | TornadoX7 Pro · TornadoX7 · Thunder GX · Concord RGB · "Generic" 3200MHz | Kumar, Rahul, Aisha | P1 | P0 |
| 4.2.7 | `03-products/01-memory/06-ddr4-tornadox7-pro.md` | `/products/memory/ddr4/tornadox7-pro/` | TornadoX7 Pro family | 3200MHz CL16, 8/16GB U-DIMM | Kumar | P1 | P0 |
| 4.2.8 | `03-products/01-memory/07-ddr4-tornadox7.md` | `/products/memory/ddr4/tornadox7/` | TornadoX7 standard family | 3200MHz CL22, 8/16GB | Kumar, Aisha | P1 | P0 |
| 4.2.9 | `03-products/01-memory/08-ddr4-thunder-gx.md` | `/products/memory/ddr4/thunder-gx/` | Thunder GX gaming family | 3200MHz, 8/16GB, gaming-focused | Rahul (budget) | P1 | P0 |
| 4.2.10 | `03-products/01-memory/09-ddr4-concord-rgb.md` | `/products/memory/ddr4/concord-rgb/` | Concord CL16 RGB family | RGB DDR4-3200, 16GB kit | Rahul (entry-RGB) | P1 | P0 |
| 4.2.11 | `03-products/01-memory/10-ddr4-laptop-sodimm.md` | `/products/memory/ddr4/laptop-sodimm/` | DDR4 SO-DIMM family page | 2666 / 3200 MHz, 4/8/16GB | Aisha | P1 | P0 |
| 4.2.12 | `03-products/01-memory/11-ddr3-legacy.md` | `/products/memory/ddr3/` | DDR3 legacy family | 1333/1600 MHz, 4/8GB; "for older systems" framing | Kumar, Aisha | P1 | P1 |
| 4.2.13 | `03-products/01-memory/12-server-ecc-memory.md` | `/products/memory/server/` | Server / ECC memory hub *(reserved if SKU available)* | Conditional — only publish if TwinMOS adds RDIMM/UDIMM ECC line | Sarah | P2 | P2 |
| 4.2.14 | `03-products/01-memory/_template-product-detail.md` | (template) | Product Detail Page template | Hero image, name, SKU, short description, key specs, full spec table (organized: General · Performance · Physical · Compatibility · Warranty), feature bullets, image gallery, datasheet PDF, awards, compatible-systems tab, Where-to-Buy section, related products, social share | All | P1 | P0 |

## 4.3 Solid-State Drives (SSD)

> URL: `/products/ssd/`

| # | File | URL | Purpose | Key Sections | Persona | Phase | Priority |
|---|------|-----|---------|--------------|---------|-------|----------|
| 4.3.1 | `03-products/02-ssd/00-ssd-hub.md` | `/products/ssd/` | SSD category landing | NVMe Gen 5 / Gen 4 / Gen 3 / SATA III split · "What is NVMe?" sidebar · SSD compatibility finder CTA | All | P1 | P0 |
| 4.3.2 | `03-products/02-ssd/01-nvme-gen5-hub.md` | `/products/ssd/nvme-gen5/` | PCIe Gen 5.0 NVMe landing | CoreX Pro flagship feature · "up to 14,000 MB/s" · graphene heatsink · DRAM cache | Rahul, Kumar | P1 | P0 |
| 4.3.3 | `03-products/02-ssd/02-corex-pro-gen5.md` | `/products/ssd/corex-pro/` | CoreX Pro M.2 PCIe Gen 5.0 family | Variants 1/2/4TB · read up to 14,000 MB/s · write up to 10,000–13,000 MB/s · Micron/Hynix TLC NAND · 5-year warranty | Rahul, Kumar | P1 | P0 |
| 4.3.4 | `03-products/02-ssd/03-nvme-gen4-hub.md` | `/products/ssd/nvme-gen4/` | PCIe Gen 4.0 NVMe landing | Xtreme · CoreX · Xtreme Pro families | Rahul, Kumar, Sarah | P1 | P0 |
| 4.3.5 | `03-products/02-ssd/04-xtreme-gen4.md` | `/products/ssd/xtreme/` | Xtreme M.2 Gen 4.0 family | 1/2TB, ~7,500/6,800 MB/s, graphene heatsheet, SMI controller, 2GB cache (2TB) | Rahul, Kumar | P1 | P0 |
| 4.3.6 | `03-products/02-ssd/05-corex-gen4.md` | `/products/ssd/corex/` | CoreX M.2 Gen 4.0 family | Mainstream Gen 4 performance line | Kumar | P1 | P0 |
| 4.3.7 | `03-products/02-ssd/06-xtreme-pro-gen4.md` | `/products/ssd/xtreme-pro/` | Xtreme Pro M.2 Gen 4.0 family | Gaming & content creation focused | Rahul | P1 | P0 |
| 4.3.8 | `03-products/02-ssd/07-nvme-gen3-hub.md` | `/products/ssd/nvme-gen3/` | PCIe Gen 3.0 NVMe landing | Alpha Pro · TW300 · standard NVMe | Aisha, Kumar | P1 | P0 |
| 4.3.9 | `03-products/02-ssd/08-alpha-pro-gen3.md` | `/products/ssd/alpha-pro/` | Alpha Pro M.2 Gen 3.0 family | 256/512GB · 3,600/3,250 MB/s · 3D TLC NAND · SMI controller · HMB | Aisha | P1 | P0 |
| 4.3.10 | `03-products/02-ssd/09-tw300-gen3.md` | `/products/ssd/tw300/` | TW300 M.2 Gen 3.0 family | 256/512GB/1TB · ~3,500/3,000 MB/s · budget NVMe | Aisha | P1 | P0 |
| 4.3.11 | `03-products/02-ssd/10-sata-hub.md` | `/products/ssd/sata/` | SATA III SSD landing | Hyper H2 Ultra · M.2 2280 SATA III | Aisha, Kumar | P1 | P0 |
| 4.3.12 | `03-products/02-ssd/11-hyper-h2-ultra.md` | `/products/ssd/hyper-h2-ultra/` | Hyper H2 Ultra 2.5" SATA III family | 128GB–1TB · 580/550 MB/s · dark grey & rose gold variants | Aisha, Kumar | P1 | P0 |
| 4.3.13 | `03-products/02-ssd/12-m2-2280-sata.md` | `/products/ssd/m2-2280-sata/` | M.2 2280 SATA III family | 128–512GB · 530/450 MB/s | Aisha | P1 | P0 |
| 4.3.14 | `03-products/02-ssd/13-enterprise-ssd-reserved.md` | `/products/ssd/enterprise/` | Enterprise / data-center SSD page *(reserved)* | Only publish when SKU is launched | Sarah | P3 | P3 |

## 4.4 Portable Storage

> URL: `/products/portable-storage/`

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 4.4.1 | `03-products/03-portable/00-portable-hub.md` | `/products/portable-storage/` | Portable storage category landing | Aisha, Rahul | P1 | P0 |
| 4.4.2 | `03-products/03-portable/01-elite-drive-pro.md` | `/products/portable-storage/elite-drive-pro/` | ELITE Drive Pro Portable SSD family — USB 3.2 Gen 2 / Type-C, 500GB–2TB | Aisha, Rahul | P1 | P0 |
| 4.4.3 | `03-products/03-portable/02-prodrive-ultra.md` | `/products/portable-storage/prodrive-ultra/` | ProDrive Ultra Portable HDD family — USB 3.0, 1–4TB | Aisha | P1 | P0 |
| 4.4.4 | `03-products/03-portable/03-rugged-portable-reserved.md` | `/products/portable-storage/rugged/` | Rugged portable SSD page *(reserved if SKU exists)* — WC mentions "Rugged USB-C 1TB / 2TB" | Aisha, field workers | P2 | P2 |
| 4.4.5 | `03-products/03-portable/04-encrypted-ssd-reserved.md` | `/products/portable-storage/encrypted/` | Encrypted SSD page *(reserved)* — WC mentions Encrypted SSD 500GB / 1TB | Sarah, security | P2 | P2 |

## 4.5 USB Flash Drives & Accessories

> URL: `/products/usb-flash/` and `/products/accessories/`

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 4.5.1 | `03-products/04-usb-flash/00-usb-flash-hub.md` | `/products/usb-flash/` | USB flash category landing | All | P1 | P0 |
| 4.5.2 | `03-products/04-usb-flash/01-mobile-disk-x3.md` | `/products/usb-flash/mobile-disk-x3/` | Mobile Disk X3 USB 3.2 family — 64/128GB | Aisha, all | P1 | P0 |
| 4.5.3 | `03-products/05-accessories/00-accessories-hub.md` | `/products/accessories/` | Accessories category landing | All | P1 | P1 |
| 4.5.4 | `03-products/05-accessories/01-usb-hub-4-port.md` | `/products/accessories/usb-hub-4-port/` | USB Hub 4-Port (S-shape design) | All | P1 | P1 |
| 4.5.5 | `03-products/05-accessories/02-card-reader-reserved.md` | `/products/accessories/card-reader/` | Card-reader page *(reserved if SKU)* | Aisha, content creators | P3 | P3 |

## 4.6 By-Brand Hubs (Cross-Cut Navigation)

> URL: `/products/brands/`

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 4.6.1 | `03-products/06-brands/00-brands-hub.md` | `/products/brands/` | Brand-line directory | All | P1 | P1 |
| 4.6.2 | `03-products/06-brands/01-voltx.md` | `/products/brands/voltx/` | VOLTX gaming DRAM brand hub (links to Gaming Hub §6) | Rahul | P1 | P0 |
| 4.6.3 | `03-products/06-brands/02-tornadox7.md` | `/products/brands/tornadox7/` | TornadoX7 brand hub | Kumar, Aisha | P1 | P1 |
| 4.6.4 | `03-products/06-brands/03-thunder-gx.md` | `/products/brands/thunder-gx/` | Thunder GX brand hub | Rahul (budget) | P1 | P1 |
| 4.6.5 | `03-products/06-brands/04-concord.md` | `/products/brands/concord/` | Concord brand hub | Rahul | P1 | P1 |
| 4.6.6 | `03-products/06-brands/05-corex-pro.md` | `/products/brands/corex-pro/` | CoreX Pro brand hub | Rahul, Kumar | P1 | P1 |
| 4.6.7 | `03-products/06-brands/06-xtreme.md` | `/products/brands/xtreme/` | Xtreme/Xtreme Pro brand hub | Rahul, Kumar | P1 | P1 |
| 4.6.8 | `03-products/06-brands/07-alpha-pro.md` | `/products/brands/alpha-pro/` | Alpha Pro brand hub | Aisha | P1 | P1 |
| 4.6.9 | `03-products/06-brands/08-hyper-h2-ultra.md` | `/products/brands/hyper-h2-ultra/` | Hyper H2 Ultra brand hub | Aisha, Kumar | P1 | P1 |
| 4.6.10 | `03-products/06-brands/09-elite-drive-pro.md` | `/products/brands/elite-drive-pro/` | ELITE Drive Pro brand hub | Aisha, Rahul | P1 | P1 |
| 4.6.11 | `03-products/06-brands/10-prodrive-ultra.md` | `/products/brands/prodrive-ultra/` | ProDrive Ultra brand hub | Aisha | P1 | P1 |
| 4.6.12 | `03-products/06-brands/11-mobile-disk-x3.md` | `/products/brands/mobile-disk-x3/` | Mobile Disk X3 brand hub | All | P1 | P1 |

## 4.7 Compatibility Finder

> URL: `/compatibility-finder/`
> See also URD UR-Epic 2.

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 4.7.1 | `03-products/07-finder/00-compatibility-finder.md` | `/compatibility-finder/` | Find compatible RAM/SSD by laptop, desktop, or motherboard model | Aisha, Rahul, Kumar | P1 | P0 |
| 4.7.2 | `03-products/07-finder/01-finder-by-laptop.md` | `/compatibility-finder/laptop/` | Laptop search tab | Aisha | P1 | P0 |
| 4.7.3 | `03-products/07-finder/02-finder-by-desktop.md` | `/compatibility-finder/desktop/` | Desktop search tab | Aisha, Kumar | P1 | P0 |
| 4.7.4 | `03-products/07-finder/03-finder-by-motherboard.md` | `/compatibility-finder/motherboard/` | Motherboard / QVL search tab | Rahul, Kumar | P1 | P0 |
| 4.7.5 | `03-products/07-finder/04-finder-results-template.md` | (template) | Results page template — device specs card, compatible products grouped by category, "Not Verified" reassurance copy | All | P1 | P0 |
| 4.7.6 | `03-products/07-finder/05-finder-no-results.md` | (template) | "No compatible products listed yet" empty state with contact-support fallback | All | P1 | P0 |

## 4.8 Datasheets (auto-generated PDFs)

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 4.8.1 | `03-products/08-datasheets/_index.md` | `/products/datasheets/` | Datasheet directory | P1 | P1 |
| 4.8.2 | `03-products/08-datasheets/_template.md` | (template) | PDF datasheet template — branded layout: hero image, specs table, features, certifications, part number, warranty, contact (< 2MB) | P1 | P0 |
| (n) | One PDF per active SKU (~50+) | (asset) | Auto-generated from CMS product data | P1 | P0 |

---

# 5. Solutions / Use Cases

> **Folder:** `04-solutions/`
> **URL prefix:** `/solutions/`
> **Purpose:** Guide buyers from job-to-be-done to relevant TwinMOS products. Models the Kingston "/solutions/" + Samsung "Applications" cross-cut.

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 5.1 | `04-solutions/00-solutions-hub.md` | `/solutions/` | Solutions landing — 7 use-case tiles | All | P1 | P0 |
| 5.2 | `04-solutions/01-gaming-enthusiast.md` | `/solutions/gaming/` | Gaming PC build solutions (links into Gaming Hub §6) | Rahul | P1 | P0 |
| 5.3 | `04-solutions/02-content-creation.md` | `/solutions/content-creation/` | 4K/8K editing, 3D, streaming workflows · CoreX Pro Gen 5 NVMe + VOLTX 32GB+ | Rahul, creators | P1 | P1 |
| 5.4 | `04-solutions/03-system-builders.md` | `/solutions/system-builders/` | OEM/SI program — bulk procurement, technical resources, partner program | Kumar, OEMs | P1 | P0 |
| 5.5 | `04-solutions/04-enterprise-smb.md` | `/solutions/enterprise/` | Corporate fleet upgrades — desktop/laptop refresh programs · Hyper H2 Ultra · DDR4 SO-DIMM | Sarah | P1 | P0 |
| 5.6 | `04-solutions/05-education.md` | `/solutions/education/` | Student laptops, school IT, university IT (DDR4/DDR5 SO-DIMM, M.2 SATA SSDs) | Sarah, Aisha | P2 | P2 |
| 5.7 | `04-solutions/06-embedded-industrial.md` | `/solutions/embedded-industrial/` | Embedded compute / industrial PCs — long-life SKUs (relevant to Hyper H2 Ultra) | Industrial buyers | P3 | P3 |
| 5.8 | `04-solutions/07-data-center-reserved.md` | `/solutions/data-center/` | Data-center / server SSD landing *(reserved — Phase 3+)* | Sarah, IT architects | P3 | P3 |
| 5.9 | `04-solutions/08-telco-bfsi-government.md` | `/solutions/telco-bfsi-government/` | Vertical-specific page reflecting STBL/HPE-style language (telco / banking / government tenders) | Sarah, gov buyers | P2 | P2 |
| 5.10 | `04-solutions/09-case-studies-hub.md` | `/solutions/case-studies/` | Customer success stories landing | Sarah, Mr. Patel, Kumar | P2 | P1 |
| 5.11 | `04-solutions/10-case-study-template.md` | (template) | Case-study template: Customer, Challenge, Solution, Result, Quote, KPIs | — | P2 | P1 |

---

# 6. Gaming Hub — VOLTX Brand

> **Folder:** `05-gaming/`
> **URL prefix:** `/gaming/`
> **Purpose:** Immersive sub-brand experience modeled on Kingston FURY, XPG, T-FORCE, G.SKILL Trident. Dark theme, dynamic, RGB-rich.

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 6.1 | `05-gaming/00-gaming-hub.md` | `/gaming/` | VOLTX gaming hub landing | Rahul | P1 | P0 |
| 6.2 | `05-gaming/01-voltx-brand-story.md` | `/gaming/voltx-story/` | VOLTX brand identity & manifesto | Rahul | P1 | P1 |
| 6.3 | `05-gaming/02-voltx-products.md` | `/gaming/products/` | VOLTX product showcase grid | Rahul | P1 | P0 |
| 6.4 | `05-gaming/03-rgb-showcase.md` | `/gaming/rgb-showcase/` | Interactive RGB lighting visualizer | Rahul | P2 | P1 |
| 6.5 | `05-gaming/04-rgb-sync-compatibility.md` | `/gaming/rgb-sync/` | RGB sync compatibility — Aura Sync, RGB Fusion, Mystic Light, Polychrome | Rahul | P1 | P1 |
| 6.6 | `05-gaming/05-overclocking-xmp-expo.md` | `/gaming/overclocking/` | Overclocking guide — XMP 3.0, AMD EXPO profiles, voltage tuning | Rahul | P1 | P1 |
| 6.7 | `05-gaming/06-build-gallery.md` | `/gaming/build-gallery/` | Community PC-build gallery | Rahul | P3 | P3 |
| 6.8 | `05-gaming/07-build-submit-form.md` | `/gaming/submit-build/` | Submit-your-build form | Rahul | P3 | P3 |
| 6.9 | `05-gaming/08-esports-sponsorships.md` | `/gaming/esports/` | Esports & influencer partnerships | Rahul | P2 | P2 |
| 6.10 | `05-gaming/09-overclocking-records-reserved.md` | `/gaming/overclock-records/` | Overclocking world records page (G.SKILL OC World Cup style) *(reserved)* | Rahul, OC enthusiasts | P3 | P3 |
| 6.11 | `05-gaming/10-wallpapers.md` | `/gaming/wallpapers/` | Branded creative downloads | Rahul | P2 | P2 |
| 6.12 | `05-gaming/11-gaming-news-feed.md` | `/gaming/news/` | Gaming-only news & event feed | Rahul | P2 | P2 |
| 6.13 | `05-gaming/12-ambassador-program-reserved.md` | `/gaming/ambassadors/` | Ambassador / modder program *(reserved Phase 3)* | Rahul, content creators | P3 | P3 |
| 6.14 | `05-gaming/13-rgb-software-download-reserved.md` | `/gaming/voltx-control/` | TwinMOS-branded RGB control software *(reserved Phase 3)* | Rahul | P3 | P3 |

---

# 7. Technology, R&D & Innovation

> **Folder:** `06-technology/`
> **URL prefix:** `/technology/`
> **Purpose:** Demonstrate engineering depth, attract distributors and enterprise buyers, and serve SEO long-tail.

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 7.1 | `06-technology/00-technology-hub.md` | `/technology/` | Technology landing | All | P1 | P1 |
| 7.2 | `06-technology/01-rd-philosophy.md` | `/technology/rd/` | R&D philosophy — extensive R&D, market analysis, competitor analysis, rigorous testing | Sarah, Mr. Patel | P1 | P1 |
| 7.3 | `06-technology/02-dram-technology.md` | `/technology/dram/` | DRAM technology overview — chip-density, prefetch, on-die ECC | Kumar, Sarah | P1 | P1 |
| 7.4 | `06-technology/03-nand-flash-technology.md` | `/technology/nand/` | NAND flash explainer — 3D TLC, wear leveling, LDPC ECC | Kumar, Rahul | P1 | P1 |
| 7.5 | `06-technology/04-controller-technology.md` | `/technology/ssd-controllers/` | SSD controller technology — SMI, Phison | Rahul, Kumar | P1 | P1 |
| 7.6 | `06-technology/05-thermal-management.md` | `/technology/thermal/` | Graphene heatsinks, aluminum heatsinks, MTCD thermal | Rahul, Kumar | P1 | P1 |
| 7.7 | `06-technology/06-power-management.md` | `/technology/power-management/` | PMIC on DDR5 modules, voltage regulation, power-loss protection | Sarah, Kumar | P1 | P1 |
| 7.8 | `06-technology/07-data-security.md` | `/technology/data-security/` | Hardware encryption, data security protocols (CP §6) | Sarah | P2 | P2 |
| 7.9 | `06-technology/08-data-integrity.md` | `/technology/data-integrity/` | S.M.A.R.T., NCQ, TRIM, bad block management, ECC | Kumar, Sarah | P1 | P1 |
| 7.10 | `06-technology/09-pcie-gen5-deepdive.md` | `/technology/pcie-gen5/` | PCIe Gen 5.0 deep dive — bandwidth, signaling, thermal | Rahul, Kumar | P1 | P1 |
| 7.11 | `06-technology/10-jedec-compliance.md` | `/technology/jedec/` | JEDEC standards we comply with | Sarah, Kumar | P1 | P2 |
| 7.12 | `06-technology/11-patents.md` | `/technology/patents/` | Patents in advanced memory architecture, thermal, security (per CP §6) — author only when verified | Sarah | P2 | P2 |
| 7.13 | `06-technology/12-roadmap-reserved.md` | `/technology/roadmap/` | Forward-looking roadmap *(NDA-gated, partner portal)* | Mr. Patel | P2 | P2 |
| 7.14 | `06-technology/13-whitepapers-hub.md` | `/technology/whitepapers/` | Whitepaper download hub | Sarah, Kumar | P2 | P2 |

---

# 8. Support & Self-Service

> **Folder:** `07-support/`
> **URL prefix:** `/support/`
> **Purpose:** Reduce manual support burden and meet competitive parity (Kingston, Crucial, Samsung Magician, Corsair).

## 8.1 Support Landing & Warranty

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 8.1.1 | `07-support/00-support-hub.md` | `/support/` | Support center landing | All | P1 | P0 |
| 8.1.2 | `07-support/01-warranty-policy.md` | `/support/warranty/` | Warranty policy umbrella page (CMS-driven per BR-6.1: Limited Lifetime DRAM, 5y NVMe, 3y SATA) | All | P1 | P0 |
| 8.1.3 | `07-support/02-warranty-registration.md` | `/support/warranty/register/` | Online warranty registration form | Registered owner | P1 | P0 |
| 8.1.4 | `07-support/03-warranty-lookup.md` | `/support/warranty/lookup/` | Lookup existing registration by email + serial | Registered owner | P1 | P0 |
| 8.1.5 | `07-support/04-warranty-by-region.md` | `/support/warranty/regions/` | Region-specific warranty terms (UAE / India / EU / South Asia) | All | P2 | P1 |
| 8.1.6 | `07-support/05-warranty-faq.md` | `/support/warranty/faq/` | Warranty FAQ | All | P1 | P0 |

## 8.2 RMA & Returns

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 8.2.1 | `07-support/06-rma-hub.md` | `/support/rma/` | RMA / returns landing | Registered owner | P1 | P0 |
| 8.2.2 | `07-support/07-rma-submit.md` | `/support/rma/submit/` | Submit RMA request | Registered owner | P1 | P0 |
| 8.2.3 | `07-support/08-rma-status.md` | `/support/rma/status/` | RMA status tracker | Registered owner | P1 | P0 |
| 8.2.4 | `07-support/09-rma-policy.md` | `/support/rma/policy/` | RMA policy & terms | All | P1 | P1 |
| 8.2.5 | `07-support/10-out-of-warranty.md` | `/support/rma/out-of-warranty/` | Paid-repair / replacement options page | Registered owner | P2 | P2 |

## 8.3 Downloads — Firmware, Software, Drivers, Manuals

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 8.3.1 | `07-support/11-downloads-hub.md` | `/support/downloads/` | Downloads center landing | All | P1 | P0 |
| 8.3.2 | `07-support/12-firmware-downloads.md` | `/support/downloads/firmware/` | Firmware downloads — by category → product line → model (serial-validated) | Registered owner | P1 | P0 |
| 8.3.3 | `07-support/13-firmware-faq.md` | `/support/downloads/firmware/faq/` | Firmware update FAQ + safety warnings | Registered owner | P1 | P0 |
| 8.3.4 | `07-support/14-manuals.md` | `/support/downloads/manuals/` | Product manuals (PDF) | All | P1 | P1 |
| 8.3.5 | `07-support/15-quick-start-guides.md` | `/support/downloads/quick-start/` | Quick-start guides | All | P1 | P1 |
| 8.3.6 | `07-support/16-twinmos-storage-toolbox-reserved.md` | `/support/downloads/storage-toolbox/` | TwinMOS Storage Toolbox software *(reserved — Phase 3, à la Samsung Magician)* | Registered owner | P3 | P3 |

## 8.4 Knowledge Base & FAQs

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 8.4.1 | `07-support/17-kb-hub.md` | `/support/knowledge-base/` | KB landing — searchable + categorized | All | P1 | P0 |
| 8.4.2 | `07-support/18-kb-installation-hub.md` | `/support/knowledge-base/installation/` | Installation articles category | All | P1 | P0 |
| 8.4.3 | `07-support/19-kb-troubleshooting-hub.md` | `/support/knowledge-base/troubleshooting/` | Troubleshooting articles category | All | P1 | P0 |
| 8.4.4 | `07-support/20-kb-compatibility-hub.md` | `/support/knowledge-base/compatibility/` | Compatibility articles category | All | P1 | P0 |
| 8.4.5 | `07-support/21-kb-warranty-hub.md` | `/support/knowledge-base/warranty/` | Warranty articles category | All | P1 | P0 |
| 8.4.6 | `07-support/22-kb-general-hub.md` | `/support/knowledge-base/general/` | General articles category | All | P1 | P0 |
| 8.4.7 | `07-support/23-faq-memory.md` | `/support/faq/memory/` | Memory-specific FAQ | All | P1 | P0 |
| 8.4.8 | `07-support/24-faq-ssd.md` | `/support/faq/ssd/` | SSD-specific FAQ | All | P1 | P0 |
| 8.4.9 | `07-support/25-faq-portable-storage.md` | `/support/faq/portable-storage/` | Portable storage FAQ | All | P1 | P0 |
| 8.4.10 | `07-support/26-faq-usb-flash.md` | `/support/faq/usb-flash/` | USB flash FAQ | All | P1 | P0 |
| 8.4.11 | `07-support/27-faq-warranty.md` | `/support/faq/warranty/` | Warranty FAQ | All | P1 | P0 |
| 8.4.12 | `07-support/28-faq-rma.md` | `/support/faq/rma/` | RMA FAQ | All | P1 | P0 |
| 8.4.13 | `07-support/29-faq-firmware.md` | `/support/faq/firmware/` | Firmware update FAQ | All | P1 | P1 |
| 8.4.14 | `07-support/30-faq-rgb.md` | `/support/faq/rgb/` | RGB / VOLTX FAQ | Rahul | P1 | P1 |
| 8.4.15 | `07-support/31-kb-article-template.md` | (template) | KB article template — title, last-updated, body, related, "Was this helpful?" | — | P1 | P0 |

### 8.4.16 Seed KB Articles (initial 30 — Phase 1 launch set)

> Each is its own file. Owner: Product / Support. All P1.

```
07-support/kb-articles/
├── ddr5-installation-desktop.md
├── ddr5-installation-laptop.md
├── ddr4-installation-desktop.md
├── ddr4-installation-laptop.md
├── how-to-install-m2-nvme-ssd.md
├── how-to-install-2.5-sata-ssd.md
├── how-to-clone-windows-to-new-ssd.md
├── how-to-initialize-an-ssd-windows.md
├── how-to-format-portable-ssd.md
├── how-to-update-ssd-firmware-safely.md
├── how-to-enable-xmp-bios.md
├── how-to-enable-amd-expo-bios.md
├── how-to-troubleshoot-ram-not-detected.md
├── how-to-troubleshoot-pc-wont-post.md
├── how-to-troubleshoot-bsod-after-ram-upgrade.md
├── how-to-check-ssd-health-smart.md
├── how-to-check-ram-speed-windows.md
├── how-to-verify-ddr5-on-die-ecc.md
├── why-is-my-ssd-slower-than-advertised.md
├── why-is-my-ram-running-at-2133mhz.md
├── how-to-find-my-laptop-ram-spec.md
├── how-to-find-my-motherboard-qvl.md
├── how-to-pair-rgb-with-aura-sync.md
├── how-to-pair-rgb-with-mystic-light.md
├── how-to-pair-rgb-with-rgb-fusion.md
├── how-to-pair-rgb-with-polychrome.md
├── how-to-claim-warranty.md
├── how-to-find-serial-number.md
├── what-to-do-if-ssd-is-not-recognized.md
└── what-to-do-if-portable-ssd-is-write-protected.md
```

## 8.5 Installation & Video Guides

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 8.5.1 | `07-support/32-install-guides-hub.md` | `/support/install-guides/` | Video + text install guide hub | Aisha, all | P1 | P1 |
| 8.5.2 | `07-support/33-install-guide-template.md` | (template) | Step-by-step install template — tools, steps, video, common pitfalls | — | P1 | P1 |

## 8.6 Anti-Counterfeit / SN Check (Phase 2)

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 8.6.1 | `07-support/34-sn-check.md` | `/support/sn-check/` | Authenticity / serial-number lookup (G.SKILL SN Check pattern) — high value in MEA grey-market | All | P2 | P1 |
| 8.6.2 | `07-support/35-counterfeit-policy.md` | `/support/counterfeit/` | Anti-counterfeit policy & how to report | All | P2 | P1 |

## 8.7 Contact Support

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 8.7.1 | `07-support/36-contact-support.md` | `/support/contact/` | Categorized support contact form | All | P1 | P0 |
| 8.7.2 | `07-support/37-live-chat-widget.md` | (component) | Live-chat widget — online/offline modes, Dubai business hours | All | P2 | P1 |
| 8.7.3 | `07-support/38-support-sla.md` | `/support/sla/` | Response-time SLA disclosure | All | P1 | P1 |

---

# 9. Learn / Knowledge Hub

> **Folder:** `08-learn/`
> **URL prefix:** `/learn/`
> **Purpose:** SEO long-tail, authority building, helping prospects make educated purchases. Modeled on Kingston Knowledge Center, Crucial Articles, PNY Glossary.

## 9.1 Learn Landing

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 9.1.1 | `08-learn/00-learn-hub.md` | `/learn/` | Knowledge hub landing — Buying Guides, Tech Explainers, Customer Stories, Glossary | All | P1 | P0 |

## 9.2 Buying Guides

> URL: `/learn/buying-guides/`. Rich-snippet eligible (HowTo / FAQ schema).

| # | File | URL | Persona | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 9.2.1 | `08-learn/01-buying-guide-hub.md` | `/learn/buying-guides/` | All | P1 | P0 |
| 9.2.2 | `08-learn/02-how-to-choose-ram.md` | `/learn/buying-guides/how-to-choose-ram/` | All | P1 | P0 |
| 9.2.3 | `08-learn/03-ddr4-vs-ddr5.md` | `/learn/buying-guides/ddr4-vs-ddr5/` | All | P1 | P0 |
| 9.2.4 | `08-learn/04-how-to-choose-an-ssd.md` | `/learn/buying-guides/how-to-choose-an-ssd/` | All | P1 | P0 |
| 9.2.5 | `08-learn/05-nvme-vs-sata-ssd.md` | `/learn/buying-guides/nvme-vs-sata-ssd/` | All | P1 | P0 |
| 9.2.6 | `08-learn/06-pcie-gen3-vs-gen4-vs-gen5.md` | `/learn/buying-guides/pcie-gen-comparison/` | Rahul, Kumar | P1 | P0 |
| 9.2.7 | `08-learn/07-so-dimm-vs-udimm.md` | `/learn/buying-guides/so-dimm-vs-udimm/` | Aisha | P1 | P0 |
| 9.2.8 | `08-learn/08-portable-ssd-vs-external-hdd.md` | `/learn/buying-guides/portable-ssd-vs-external-hdd/` | Aisha | P1 | P0 |
| 9.2.9 | `08-learn/09-best-ram-for-gaming.md` | `/learn/buying-guides/best-ram-for-gaming/` | Rahul | P1 | P0 |
| 9.2.10 | `08-learn/10-best-ssd-for-gaming.md` | `/learn/buying-guides/best-ssd-for-gaming/` | Rahul | P1 | P0 |
| 9.2.11 | `08-learn/11-best-ram-for-content-creators.md` | `/learn/buying-guides/best-ram-for-creators/` | Creators | P1 | P1 |
| 9.2.12 | `08-learn/12-best-ssd-for-laptops.md` | `/learn/buying-guides/best-ssd-for-laptops/` | Aisha | P1 | P1 |
| 9.2.13 | `08-learn/13-best-portable-ssd.md` | `/learn/buying-guides/best-portable-ssd/` | Aisha, Rahul | P1 | P1 |
| 9.2.14 | `08-learn/14-rgb-ram-buyers-guide.md` | `/learn/buying-guides/rgb-ram/` | Rahul | P1 | P1 |
| 9.2.15 | `08-learn/15-budget-pc-build-guide.md` | `/learn/buying-guides/budget-build/` | Aisha, Rahul | P1 | P1 |
| 9.2.16 | `08-learn/16-mid-range-pc-build-guide.md` | `/learn/buying-guides/mid-range-build/` | Rahul | P1 | P1 |
| 9.2.17 | `08-learn/17-flagship-pc-build-guide.md` | `/learn/buying-guides/flagship-build/` | Rahul | P1 | P1 |
| 9.2.18 | `08-learn/18-system-builder-procurement-guide.md` | `/learn/buying-guides/system-builder/` | Kumar | P1 | P1 |
| 9.2.19 | `08-learn/19-enterprise-fleet-upgrade-guide.md` | `/learn/buying-guides/enterprise-fleet/` | Sarah | P1 | P1 |

## 9.3 Technology Explainers ("What is …")

> URL: `/learn/explained/`. Sourced primarily from DDR (DDR Guide Book) plus authored fresh.

| # | File | URL | Source | Phase | Priority |
|---|------|-----|--------|-------|----------|
| 9.3.1 | `08-learn/20-explained-hub.md` | `/learn/explained/` | — | P1 | P0 |
| 9.3.2 | `08-learn/21-what-is-ddr.md` | `/learn/explained/what-is-ddr/` | DDR §Intro | P1 | P0 |
| 9.3.3 | `08-learn/22-history-of-ddr.md` | `/learn/explained/history-of-ddr/` | DDR §Intro | P1 | P0 |
| 9.3.4 | `08-learn/23-what-is-ddr5.md` | `/learn/explained/what-is-ddr5/` | DDR §1 | P1 | P0 |
| 9.3.5 | `08-learn/24-what-is-ddr4.md` | `/learn/explained/what-is-ddr4/` | DDR §1 | P1 | P0 |
| 9.3.6 | `08-learn/25-what-is-ddr3.md` | `/learn/explained/what-is-ddr3/` | DDR §1 | P1 | P1 |
| 9.3.7 | `08-learn/26-ddr-architecture.md` | `/learn/explained/ddr-architecture/` | DDR §2 | P1 | P1 |
| 9.3.8 | `08-learn/27-memory-bandwidth-explained.md` | `/learn/explained/memory-bandwidth/` | DDR §2 | P1 | P1 |
| 9.3.9 | `08-learn/28-cas-latency-explained.md` | `/learn/explained/cas-latency/` | DDR §2 | P1 | P1 |
| 9.3.10 | `08-learn/29-memory-timings-explained.md` | `/learn/explained/memory-timings/` | DDR §2 | P1 | P1 |
| 9.3.11 | `08-learn/30-prefetch-buffer-explained.md` | `/learn/explained/prefetch/` | DDR §2 | P1 | P2 |
| 9.3.12 | `08-learn/31-on-die-ecc.md` | `/learn/explained/on-die-ecc/` | DDR | P1 | P1 |
| 9.3.13 | `08-learn/32-pmic-explained.md` | `/learn/explained/pmic/` | DDR | P1 | P2 |
| 9.3.14 | `08-learn/33-what-is-xmp.md` | `/learn/explained/what-is-xmp/` | — | P1 | P0 |
| 9.3.15 | `08-learn/34-what-is-amd-expo.md` | `/learn/explained/what-is-expo/` | — | P1 | P0 |
| 9.3.16 | `08-learn/35-what-is-nvme.md` | `/learn/explained/what-is-nvme/` | — | P1 | P0 |
| 9.3.17 | `08-learn/36-what-is-pcie.md` | `/learn/explained/what-is-pcie/` | — | P1 | P0 |
| 9.3.18 | `08-learn/37-what-is-sata-ssd.md` | `/learn/explained/what-is-sata-ssd/` | — | P1 | P1 |
| 9.3.19 | `08-learn/38-what-is-3d-tlc-nand.md` | `/learn/explained/3d-tlc-nand/` | — | P1 | P1 |
| 9.3.20 | `08-learn/39-what-is-dram-cache-on-ssd.md` | `/learn/explained/dram-cache/` | — | P1 | P1 |
| 9.3.21 | `08-learn/40-what-is-hmb.md` | `/learn/explained/host-memory-buffer/` | — | P1 | P2 |
| 9.3.22 | `08-learn/41-what-is-trim-and-garbage-collection.md` | `/learn/explained/trim-garbage-collection/` | — | P1 | P2 |
| 9.3.23 | `08-learn/42-what-is-wear-leveling.md` | `/learn/explained/wear-leveling/` | — | P1 | P2 |
| 9.3.24 | `08-learn/43-what-is-smart-monitoring.md` | `/learn/explained/smart-monitoring/` | — | P1 | P2 |
| 9.3.25 | `08-learn/44-what-is-rgb-sync.md` | `/learn/explained/rgb-sync/` | — | P1 | P1 |
| 9.3.26 | `08-learn/45-what-is-graphene-heatsink.md` | `/learn/explained/graphene-heatsink/` | — | P1 | P2 |
| 9.3.27 | `08-learn/46-what-is-ecc-memory.md` | `/learn/explained/ecc-memory/` | — | P1 | P1 |
| 9.3.28 | `08-learn/47-what-is-form-factor-2280.md` | `/learn/explained/form-factor-m2-2280/` | — | P1 | P2 |
| 9.3.29 | `08-learn/48-what-is-mtbf.md` | `/learn/explained/mtbf/` | — | P1 | P2 |
| 9.3.30 | `08-learn/49-power-loss-protection.md` | `/learn/explained/power-loss-protection/` | — | P1 | P2 |

## 9.4 Performance & Benchmarks

| # | File | URL | Phase | Priority |
|---|------|-----|-------|----------|
| 9.4.1 | `08-learn/50-benchmarks-hub.md` | `/learn/benchmarks/` | P1 | P1 |
| 9.4.2 | `08-learn/51-benchmark-template.md` | (template) | P1 | P1 |
| 9.4.3 | `08-learn/52-benchmark-corex-pro-vs-competitors.md` | `/learn/benchmarks/corex-pro-comparison/` | P1 | P1 |
| 9.4.4 | `08-learn/53-benchmark-voltx-rgb-vs-competitors.md` | `/learn/benchmarks/voltx-rgb-comparison/` | P1 | P1 |
| 9.4.5 | `08-learn/54-benchmark-real-world-gaming.md` | `/learn/benchmarks/real-world-gaming/` | P1 | P1 |
| 9.4.6 | `08-learn/55-benchmark-content-creation.md` | `/learn/benchmarks/content-creation/` | P2 | P2 |

## 9.5 Glossary

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 9.5.1 | `08-learn/56-glossary.md` | `/learn/glossary/` | A–Z technology glossary (PNY pattern) | P1 | P1 |

## 9.6 Customer Stories

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 9.6.1 | `08-learn/57-stories-hub.md` | `/learn/stories/` | Customer success stories landing | P2 | P2 |
| 9.6.2 | `08-learn/58-stories-template.md` | (template) | Story template | P2 | P2 |

## 9.7 Tech Insights / Blog

| # | File | URL | Phase | Priority |
|---|------|-----|-------|----------|
| 9.7.1 | `08-learn/59-blog-hub.md` | `/learn/blog/` | P1 | P1 |
| 9.7.2 | `08-learn/60-blog-template.md` | (template) | P1 | P1 |
| 9.7.3 | `08-learn/61-launch-post-corex-pro.md` | `/learn/blog/launching-corex-pro-gen5/` | P1 | P1 |
| 9.7.4 | `08-learn/62-launch-post-voltx-rgb.md` | `/learn/blog/launching-voltx-rgb/` | P1 | P1 |
| 9.7.5 | `08-learn/63-blog-computex-2025-recap.md` | `/learn/blog/computex-2025-recap/` | P1 | P1 |

---

# 10. Where to Buy & Partners

> **Folder:** `09-where-to-buy/` and `09-partners/`
> **URL prefixes:** `/where-to-buy/`, `/partners/`

## 10.1 Where to Buy

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 10.1.1 | `09-where-to-buy/00-where-to-buy-hub.md` | `/where-to-buy/` | Map-based + list-based locator | All | P1 | P0 |
| 10.1.2 | `09-where-to-buy/01-online-stores.md` | `/where-to-buy/online/` | Online retailers (Amazon, Flipkart, etc.) | All | P1 | P0 |
| 10.1.3 | `09-where-to-buy/02-physical-stores.md` | `/where-to-buy/physical/` | Brick-and-mortar retailers | All | P1 | P0 |
| 10.1.4 | `09-where-to-buy/03-distributors.md` | `/where-to-buy/distributors/` | Authorized distributor directory | Mr. Patel, Kumar | P1 | P0 |
| 10.1.5 | `09-where-to-buy/04-system-builders.md` | `/where-to-buy/system-builders/` | Authorized SI directory | Aisha (PC builds) | P1 | P1 |
| 10.1.6 | `09-where-to-buy/05-retailer-detail-template.md` | (template) | Per-retailer profile template — logo, address, phone, website, hours, categories carried, "Get Directions" | All | P1 | P0 |
| 10.1.7 | `09-where-to-buy/06-no-retailer-state.md` | (template) | "No retailers in your country" — distributor inquiry CTA | All | P1 | P0 |

## 10.2 Partners (Become / Programs / Portal)

| # | File | URL | Purpose | Persona | Phase | Priority |
|---|------|-----|---------|---------|-------|----------|
| 10.2.1 | `09-partners/00-partners-hub.md` | `/partners/` | Partners landing — Distributor / Reseller / OEM-ODM / SI / Retailer paths | Mr. Patel, Kumar | P1 | P0 |
| 10.2.2 | `09-partners/01-become-distributor.md` | `/partners/become-a-distributor/` | Distributor inquiry form + benefits | Mr. Patel | P1 | P0 |
| 10.2.3 | `09-partners/02-become-reseller.md` | `/partners/become-a-reseller/` | Reseller inquiry form | Kumar | P1 | P1 |
| 10.2.4 | `09-partners/03-oem-odm-program.md` | `/partners/oem-odm/` | OEM/ODM program — TwinMOS as a custom-manufacturing partner (per CP "Acts as both branded vendor and OEM provider") | Sarah, OEMs | P1 | P1 |
| 10.2.5 | `09-partners/04-system-builder-program.md` | `/partners/system-builder-program/` | System Builder benefits & enrollment | Kumar | P1 | P1 |
| 10.2.6 | `09-partners/05-distributor-benefits.md` | `/partners/distributor-benefits/` | Why partner with TwinMOS — margins, exclusivity, regional support, marketing co-investment | Mr. Patel | P1 | P1 |
| 10.2.7 | `09-partners/06-distributor-onboarding-process.md` | `/partners/onboarding-process/` | 6-step onboarding (per AFR doc) — research, application, evaluation, agreement, integration, monitoring | Mr. Patel | P1 | P1 |
| 10.2.8 | `09-partners/07-distributor-responsibilities.md` | `/partners/responsibilities/` | Distributor responsibilities (per AFR doc) | Mr. Patel | P1 | P1 |
| 10.2.9 | `09-partners/08-partner-portal-login.md` | `/partners/login/` | Partner portal login page | Authorized distributor | P2 | P1 |
| 10.2.10 | `09-partners/09-partner-portal-dashboard.md` | `/partners/dashboard/` | Partner portal home (Phase 2) | Authorized distributor | P2 | P1 |
| 10.2.11 | `09-partners/10-partner-marketing-assets.md` | `/partners/assets/` | Co-branded marketing asset library | Authorized distributor | P2 | P1 |
| 10.2.12 | `09-partners/11-partner-price-lists.md` | `/partners/pricing/` | Watermarked distributor price lists | Authorized distributor | P2 | P1 |
| 10.2.13 | `09-partners/12-partner-training-resources.md` | `/partners/training/` | Sales & technical training resources | Authorized distributor | P2 | P2 |
| 10.2.14 | `09-partners/13-partner-events-calendar.md` | `/partners/events/` | Partner-only events | Authorized distributor | P2 | P2 |
| 10.2.15 | `09-partners/14-mdf-program-reserved.md` | `/partners/mdf/` | Marketing Development Funds program *(reserved Phase 3)* | Authorized distributor | P3 | P3 |
| 10.2.16 | `09-partners/15-distributor-success-stories.md` | `/partners/success-stories/` | Distributor case studies | Mr. Patel | P2 | P2 |
| 10.2.19 | `09-partners/18-mea-distributor-hub.md` | `/partners/mea/` | Middle East / Africa distributor hub — regional directory | MEA distributors | P1 | P1 |
| 10.2.20 | `09-partners/19-africa-distributor-hub.md` | `/partners/africa/` | Africa distributor hub linking to country pages (§12) | African distributors | P1 | P1 |
| 10.2.21 | `09-partners/20-cis-distributor-hub.md` | `/partners/cis/` | CIS / Eastern Europe distributor hub | CIS distributors | P2 | P2 |

---

# 11. News, Press & Events

> **Folder:** `10-news-events/`
> **URL prefix:** `/news/`

## 11.1 News Listing & Templates

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 11.1.1 | `10-news-events/00-news-hub.md` | `/news/` | News listing — chronological, filterable by category | P1 | P0 |
| 11.1.2 | `10-news-events/01-news-article-template.md` | (template) | Article template — title, author, date, hero, body, social share, related | P1 | P0 |
| 11.1.3 | `10-news-events/02-press-release-template.md` | (template) | Press-release template with boilerplate (per BR-5.4) | P1 | P0 |
| 11.1.4 | `10-news-events/03-event-page-template.md` | (template) | Event template — name, date, location, booth, photo gallery, video embeds, products showcased, "contact us at the event" CTA | P1 | P1 |

## 11.2 News Categories (Index Pages)

| # | File | URL | Phase | Priority |
|---|------|-----|-------|----------|
| 11.2.1 | `10-news-events/04-category-product-launches.md` | `/news/category/product-launches/` | P1 | P0 |
| 11.2.2 | `10-news-events/05-category-events.md` | `/news/category/events/` | P1 | P0 |
| 11.2.3 | `10-news-events/06-category-awards.md` | `/news/category/awards/` | P1 | P0 |
| 11.2.4 | `10-news-events/07-category-partnerships.md` | `/news/category/partnerships/` | P1 | P0 |
| 11.2.5 | `10-news-events/08-category-press-releases.md` | `/news/category/press-releases/` | P1 | P0 |
| 11.2.6 | `10-news-events/09-category-company-news.md` | `/news/category/company-news/` | P1 | P0 |

## 11.3 Initial Launch-Set News Articles (Phase 1)

> Each is its own file. Author: Marketing.

```
10-news-events/articles/
├── 2025-05-computex-2025-twinmos-showcase.md       # Booth I1431, Nangang Hall 1
├── 2025-q3-corex-pro-gen5-launch.md
├── 2025-q4-voltx-rgb-ddr5-6000-launch.md
├── 2026-q2-website-relaunch.md
├── 2026-q2-anti-counterfeit-program.md
```

## 11.4 Events Hub & Sub-Pages

| # | File | URL | Phase | Priority |
|---|------|-----|-------|----------|
| 11.4.1 | `10-news-events/10-events-hub.md` | `/events/` | P1 | P1 |
| 11.4.2 | `10-news-events/11-event-computex-2025.md` | `/events/computex-2025/` | P1 | P1 |
| 11.4.3 | `10-news-events/12-event-computex-2026-reserved.md` | `/events/computex-2026/` | P1 | P1 |
| 11.4.4 | `10-news-events/13-event-gitex-global-reserved.md` | `/events/gitex-global/` | P2 | P2 |
| 11.4.5 | `10-news-events/14-event-ces-reserved.md` | `/events/ces/` | P2 | P2 |
| 11.4.6 | `10-news-events/15-event-cebit-mea-reserved.md` | `/events/cebit-mea/` | P2 | P2 |
| 11.4.7 | `10-news-events/16-event-saudi-tech-reserved.md` | `/events/saudi-tech/` | P3 | P3 |
| 11.4.8 | `10-news-events/17-event-india-it-distributors.md` | `/events/india-it-distributors/` | P2 | P2 |

## 11.5 Media Coverage / In-the-News

| # | File | URL | Phase | Priority |
|---|------|-----|-------|----------|
| 11.5.1 | `10-news-events/18-media-coverage-hub.md` | `/news/media-coverage/` | P2 | P2 |
| 11.5.2 | `10-news-events/19-newsletter-archive.md` | `/news/newsletters/` | P2 | P2 |

---

# 12. Regional / Localization Landings

> **Folder:** `11-regional/`
> **URL pattern:** `/{lang}/{region-slug}/` for localized · `/regions/{region-slug}/` for regional landings within EN

## 12.1 Regional Landings (English baseline; mirrored in localized langs Phase 2+)

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 12.1.1 | `11-regional/00-regions-hub.md` | `/regions/` | Region selector | P1 | P0 |
| 12.1.2 | `11-regional/01-uae-gcc.md` | `/regions/uae-gcc/` | UAE / GCC landing — DAFZA office, AED reference, authorized distributor directory | P1 | P0 |
| 12.1.5 | `11-regional/04-pakistan.md` | `/regions/pakistan/` | Pakistan landing | P2 | P2 |
| 12.1.6 | `11-regional/05-saudi-arabia.md` | `/regions/saudi-arabia/` | KSA landing — PDPL, authorized regional distributor | P1 | P1 |
| 12.1.7 | `11-regional/06-qatar.md` | `/regions/qatar/` | Qatar landing — authorized regional retailer | P2 | P2 |
| 12.1.8 | `11-regional/07-egypt.md` | `/regions/egypt/` | Egypt landing — market availability and support | P1 | P1 |
| 12.1.9 | `11-regional/08-morocco.md` | `/regions/morocco/` | Morocco landing — authorized regional distributor, authorized regional distributor, authorized regional distributor, authorized regional distributor | P1 | P1 |
| 12.1.10 | `11-regional/09-algeria.md` | `/regions/algeria/` | Algeria landing — ABM, NCIS, IT Expert, MID-DZ, Alcom | P2 | P2 |
| 12.1.11 | `11-regional/10-south-africa.md` | `/regions/south-africa/` | South Africa landing — market availability and support | P1 | P1 |
| 12.1.12 | `11-regional/11-nigeria.md` | `/regions/nigeria/` | Nigeria landing — market availability and support | P2 | P2 |
| 12.1.13 | `11-regional/12-kenya.md` | `/regions/kenya/` | Kenya landing — market availability and support | P2 | P2 |
| 12.1.14 | `11-regional/13-ghana.md` | `/regions/ghana/` | Ghana landing — market availability and support | P2 | P2 |
| 12.1.15 | `11-regional/14-ethiopia.md` | `/regions/ethiopia/` | Ethiopia landing — market availability and support | P3 | P3 |
| 12.1.16 | `11-regional/15-angola.md` | `/regions/angola/` | Angola landing — authorized regional distributor | P3 | P3 |
| 12.1.17 | `11-regional/16-libya.md` | `/regions/libya/` | Libya landing — authorized regional distributor, Al Thiqa, Uranisgt | P3 | P3 |
| 12.1.18 | `11-regional/17-cameroon.md` | `/regions/cameroon/` | Cameroon landing | P3 | P3 |
| 12.1.19 | `11-regional/18-namibia.md` | `/regions/namibia/` | Namibia landing — Royal, Tech Distributors, DICT | P3 | P3 |
| 12.1.20 | `11-regional/19-rwanda.md` | `/regions/rwanda/` | Rwanda landing — Microzone, YAKIN, IHAHA, Connect | P3 | P3 |
| 12.1.21 | `11-regional/20-senegal.md` | `/regions/senegal/` | Senegal landing — CS Global, Touré, Office Equipements | P3 | P3 |
| 12.1.22 | `11-regional/21-botswana-lesotho.md` | `/regions/southern-africa/` | Combined Botswana / Lesotho landing | P3 | P3 |
| 12.1.23 | `11-regional/22-russia-cis.md` | `/regions/russia-cis/` | Russia / CIS landing — EAC | P2 | P2 |
| 12.1.24 | `11-regional/23-europe.md` | `/regions/europe/` | EU landing — GDPR, UKCA, REACH compliance focus | P1 | P1 |
| 12.1.25 | `11-regional/24-uk.md` | `/regions/uk/` | UK landing — UKCA | P2 | P2 |
| 12.1.26 | `11-regional/25-southeast-asia.md` | `/regions/southeast-asia/` | SEA landing — regional compliance and availability | P2 | P2 |
| 12.1.27 | `11-regional/26-hong-kong.md` | `/regions/hong-kong/` | Hong Kong landing — availability and support | P2 | P2 |
| 12.1.28 | `11-regional/27-taiwan.md` | `/regions/taiwan/` | Taiwan landing — Taipei HQ & R&D Center | P2 | P2 |
| 12.1.29 | `11-regional/28-north-america.md` | `/regions/north-america/` | NA landing — selective distribution | P2 | P2 |

## 12.2 Localized Versions (Phase 2 +)

> **Folder pattern:** `11-regional/_locales/{lang}/...` mirrors all regional landing pages plus Home, About, Products, Support, Contact, Legal.

| # | File | URL pattern | Phase | Priority |
|---|------|-------------|-------|----------|
| 12.2.1 | `11-regional/_locales/ar/...` | `/ar/...` | Arabic (RTL) full mirror | P2 | P1 |
| 12.2.3 | `11-regional/_locales/hi/...` | `/hi/...` | Hindi full mirror | P2 | P1 |
| 12.2.4 | `11-regional/_locales/ru/...` | `/ru/...` | Russian full mirror | P3 | P2 |
| 12.2.5 | `11-regional/_locales/zh-CN/...` | `/zh-CN/...` | Simplified Chinese full mirror | P3 | P2 |
| 12.2.6 | `11-regional/_locales/fr/...` | `/fr/...` | French full mirror | P3 | P2 |
| 12.2.7 | `11-regional/_locales/es/...` | `/es/...` | Spanish full mirror | P4 | P3 |
| 12.2.8 | `11-regional/_locales/pt/...` | `/pt/...` | Portuguese full mirror | P4 | P3 |
| 12.2.9 | `11-regional/_locales/de/...` | `/de/...` | German full mirror | P4 | P3 |

---

# 13. Careers

> **Folder:** `12-careers/`
> **URL prefix:** `/careers/`

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 13.1 | `12-careers/00-careers-hub.md` | `/careers/` | Careers landing — culture, benefits, open roles | P1 | P1 |
| 13.2 | `12-careers/01-life-at-twinmos.md` | `/careers/life/` | Life at TwinMOS — culture, values, photos | P1 | P2 |
| 13.3 | `12-careers/02-benefits.md` | `/careers/benefits/` | Compensation, healthcare, learning, time off | P1 | P2 |
| 13.4 | `12-careers/03-locations.md` | `/careers/locations/` | Office locations & remote-friendly info | P1 | P2 |
| 13.5 | `12-careers/04-departments.md` | `/careers/departments/` | Engineering / Sales / Marketing / Operations / Quality / Customer Service | P1 | P2 |
| 13.6 | `12-careers/05-internships.md` | `/careers/internships/` | Internship & graduate program | P2 | P2 |
| 13.7 | `12-careers/06-job-listing-template.md` | (template) | Job posting template — title, location, function, responsibilities, requirements, "Apply" | P1 | P1 |
| 13.8 | `12-careers/07-application-form.md` | `/careers/apply/` | General application form | P1 | P1 |
| 13.9 | `12-careers/08-applicant-privacy.md` | `/careers/applicant-privacy/` | Job-applicant privacy notice (PNY pattern) | P1 | P1 |
| 13.10 | `12-careers/09-careers-faq.md` | `/careers/faq/` | Recruitment FAQ | P2 | P2 |

---

# 14. Contact

> **Folder:** `13-contact/`
> **URL prefix:** `/contact/`

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 14.1 | `13-contact/00-contact-hub.md` | `/contact/` | Contact landing — categorized contact options | P1 | P0 |
| 14.2 | `13-contact/01-general-inquiry.md` | `/contact/general/` | General inquiry form | P1 | P0 |
| 14.3 | `13-contact/02-sales-inquiry.md` | `/contact/sales/` | Sales contact form | P1 | P0 |
| 14.4 | `13-contact/03-technical-support.md` | `/contact/technical-support/` | Technical support form | P1 | P0 |
| 14.5 | `13-contact/04-distributor-inquiry.md` | `/contact/distributor/` | Become-a-distributor form | P1 | P0 |
| 14.6 | `13-contact/05-oem-odm-inquiry.md` | `/contact/oem-odm/` | OEM / ODM inquiry form | P1 | P1 |
| 14.7 | `13-contact/06-quote-request.md` | `/contact/quote-request/` | Bulk / enterprise quote form (with file upload) | P1 | P0 |
| 14.8 | `13-contact/07-media-inquiry.md` | `/contact/media/` | Media / press inquiry form | P1 | P1 |
| 14.9 | `13-contact/08-warranty-inquiry.md` | `/contact/warranty/` | Warranty-specific inquiry (links to /support/warranty) | P1 | P1 |
| 14.10 | `13-contact/09-feedback-form.md` | `/contact/feedback/` | Customer feedback form | P2 | P2 |
| 14.11 | `13-contact/10-office-locations.md` | `/contact/locations/` | Global office directory | P1 | P0 |
| 14.12 | `13-contact/11-office-dubai-hq.md` | `/contact/locations/dubai/` | Dubai HQ — C-9 DAFZA, P.O. Box 54278, +971-4-2996421/22 | P1 | P0 |
| 14.13 | `13-contact/12-office-taipei.md` | `/contact/locations/taipei/` | Taipei office | P1 | P1 |
| 14.16 | `13-contact/15-form-success-template.md` | (template) | Form-submission success page — ticket #, response-time SLA, next steps | P1 | P0 |

---

# 15. Legal, Compliance & Trust

> **Folder:** `14-legal/`
> **URL prefix:** `/legal/`

## 15.1 Legal & Privacy

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 15.1.1 | `14-legal/00-legal-hub.md` | `/legal/` | Legal index | P1 | P0 |
| 15.1.2 | `14-legal/01-privacy-policy.md` | `/legal/privacy-policy/` | Privacy policy — GDPR / UAE / India DPDP / KSA PDPL | P1 | P0 |
| 15.1.3 | `14-legal/02-cookie-policy.md` | `/legal/cookie-policy/` | Cookie policy + granular categories | P1 | P0 |
| 15.1.4 | `14-legal/03-terms-of-use.md` | `/legal/terms-of-use/` | Terms of use | P1 | P0 |
| 15.1.5 | `14-legal/04-terms-of-sale.md` | `/legal/terms-of-sale/` | Terms of sale (Phase 3 once e-commerce active) | P3 | P1 |
| 15.1.6 | `14-legal/05-warranty-policy.md` | `/legal/warranty-policy/` | Master warranty policy (links from /support/warranty) | P1 | P0 |
| 15.1.7 | `14-legal/06-acceptable-use.md` | `/legal/acceptable-use/` | Acceptable-use policy | P1 | P1 |
| 15.1.8 | `14-legal/07-trademark-policy.md` | `/legal/trademarks/` | Trademark / IP usage policy | P1 | P1 |
| 15.1.9 | `14-legal/08-accessibility-statement.md` | `/legal/accessibility/` | WCAG 2.1 AA conformance statement (PNY/Samsung pattern) | P1 | P0 |
| 15.1.10 | `14-legal/09-imprint-eu.md` | `/legal/imprint/` | EU Imprint / Impressum | P1 | P1 |
| 15.1.11 | `14-legal/10-supply-chain-disclosure.md` | `/legal/supply-chain/` | Supply-chain transparency statement (Corsair pattern) | P2 | P2 |
| 15.1.12 | `14-legal/11-modern-slavery-statement.md` | `/legal/modern-slavery/` | UK Modern Slavery Act statement | P2 | P2 |
| 15.1.13 | `14-legal/12-conflict-minerals.md` | `/legal/conflict-minerals/` | Conflict-minerals policy | P2 | P2 |
| 15.1.14 | `14-legal/13-product-recalls.md` | `/legal/product-recalls/` | Product recalls history (PNY pattern) | P2 | P2 |
| 15.1.15 | `14-legal/14-counterfeit-policy.md` | `/legal/counterfeit-policy/` | Anti-counterfeit policy & reporting | P2 | P1 |
| 15.1.16 | `14-legal/15-job-applicant-privacy.md` | `/legal/applicant-privacy/` | Job applicant privacy (used from /careers) | P1 | P1 |
| 15.1.17 | `14-legal/16-vendor-code-of-conduct.md` | `/legal/vendor-conduct/` | Vendor / supplier code of conduct | P2 | P2 |
| 15.1.18 | `14-legal/17-data-deletion-request.md` | `/legal/data-deletion/` | GDPR / DPDP data-deletion request form | P1 | P0 |
| 15.1.19 | `14-legal/18-cookie-preferences.md` | `/legal/cookie-preferences/` | User cookie-preference management page | P1 | P0 |

## 15.2 Compliance & Standards

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 15.2.1 | `14-legal/19-compliance-hub.md` | `/legal/compliance/` | Compliance hub linking each cert | P1 | P1 |
| 15.2.2 | `14-legal/20-rohs.md` | `/legal/compliance/rohs/` | RoHS statement | P1 | P1 |
| 15.2.3 | `14-legal/21-reach.md` | `/legal/compliance/reach/` | REACH statement | P1 | P1 |
| 15.2.4 | `14-legal/22-ce-marking.md` | `/legal/compliance/ce/` | CE Declaration of Conformity | P1 | P1 |
| 15.2.5 | `14-legal/23-ukca-marking.md` | `/legal/compliance/ukca/` | UKCA Declaration of Conformity | P1 | P1 |
| 15.2.6 | `14-legal/24-fcc.md` | `/legal/compliance/fcc/` | FCC compliance | P1 | P1 |
| 15.2.7 | `14-legal/25-eac.md` | `/legal/compliance/eac/` | EAC (Russia / CIS) compliance | P1 | P1 |
| 15.2.8 | `14-legal/26-iso-9001.md` | `/legal/compliance/iso-9001/` | ISO 9001 statement | P1 | P1 |
| 15.2.9 | `14-legal/27-jedec.md` | `/legal/compliance/jedec/` | JEDEC compliance for DRAM | P1 | P1 |
| 15.2.10 | `14-legal/28-bis-india.md` | `/legal/compliance/bis-india/` | BIS (India) compliance — Phase 2 | P2 | P1 |
| 15.2.11 | `14-legal/29-weee.md` | `/legal/compliance/weee/` | WEEE / e-waste compliance | P2 | P2 |
| 15.2.12 | `14-legal/30-epeat.md` | `/legal/compliance/epeat/` | EPEAT compliance (per WC) — verify before publishing | P2 | P2 |

## 15.3 Trust Signals

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 15.3.1 | `14-legal/31-security-disclosure.md` | `/legal/security/` | Security & responsible-disclosure policy | P1 | P1 |
| 15.3.2 | `14-legal/32-vulnerability-program.md` | `/legal/security/vulnerability-program/` | Bug-bounty / vulnerability disclosure program | P2 | P2 |
| 15.3.3 | `14-legal/33-sitemap.md` | `/sitemap/` | Human-readable sitemap | P1 | P1 |

---

# 16. Marketing Programs & Campaigns

> **Folder:** `15-marketing/`
> **URL prefix:** various

| # | File | URL | Purpose | Phase | Priority |
|---|------|-----|---------|-------|----------|
| 16.1 | `15-marketing/00-newsletter-signup-page.md` | `/newsletter/` | Newsletter signup landing | P1 | P1 |
| 16.2 | `15-marketing/01-newsletter-confirm.md` | `/newsletter/confirm/` | Double-opt-in confirmation page | P1 | P0 |
| 16.3 | `15-marketing/02-newsletter-unsubscribe.md` | `/newsletter/unsubscribe/` | Unsubscribe page | P1 | P0 |
| 16.4 | `15-marketing/03-promotions-hub.md` | `/promotions/` | Active promotions landing | P2 | P2 |
| 16.5 | `15-marketing/04-promotion-template.md` | (template) | Promo template — banner, terms, eligible products, expiration | P2 | P2 |
| 16.6 | `15-marketing/05-loyalty-program-reserved.md` | `/membership/` | Loyalty / membership program *(reserved Phase 3 — XPG PRIME, ADATA A+ Member pattern)* | P3 | P3 |
| 16.7 | `15-marketing/06-referral-program-reserved.md` | `/referral/` | Distributor referral program *(reserved Phase 3)* | P3 | P3 |
| 16.8 | `15-marketing/07-launch-campaign-corex-pro.md` | `/campaigns/corex-pro-gen5/` | CoreX Pro Gen 5 launch campaign LP | P1 | P1 |
| 16.9 | `15-marketing/08-launch-campaign-voltx-rgb.md` | `/campaigns/voltx-rgb/` | VOLTX RGB launch campaign LP | P1 | P1 |
| 16.11 | `15-marketing/10-cross-sell-banner-copy.md` | (component) | Cross-sell banner copy bank | P1 | P1 |
| 16.12 | `15-marketing/11-exit-intent-popup.md` | (component) | Exit-intent popup — 10% discount tease, newsletter capture | P2 | P2 |

---

# 17. Appendices

## A. Page-Type → Template Map

| Page Type | Count | Template |
|-----------|-------|----------|
| Product Detail Page (PDP) | ~50 SKUs at launch | `_template-product-detail.md` |
| Product Family Page | ~25 | `_template-product-family.md` (combine PDP-like) |
| Category Page | 18 | Generic category template |
| Brand Hub Page | 11 | Generic brand template (light variant) + VOLTX dark variant |
| Article (KB / Blog / Buying Guide / Explainer) | ~85 | `_template-article.md` |
| News Article | 8+ at launch (rolling) | `01-news-article-template.md` |
| Press Release | 2–3 at launch | `02-press-release-template.md` |
| Event Page | 3+ at launch | `03-event-page-template.md` |
| Customer / Distributor Story | 3 at launch (rolling) | `02-stories-template.md` |
| Form Page | ~12 | `15-form-success-template.md` + form components |
| Regional / Country Page | 29 (English baseline) | Generic regional template |
| Localized mirror | × 9 languages | Per-locale folder mirror |
| Legal Page | 33 | Generic legal template (TOC sidebar, last-updated, print-friendly) |
| Office Page | 5 | Generic office template (map, address, phone, hours) |

## B. Phase / Priority Distribution Summary

| Bucket | Count |
|--------|-------|
| Phase 1 (Months 1–5) launch-set, P0 | ~110 files |
| Phase 1 launch-set, P1 | ~95 files |
| Phase 2 (Months 6–9) | ~50 files (incl. localization spine for AR/BN/HI) |
| Phase 3 (Months 10–15) | ~20 files (incl. RU/ZH/FR localization, e-commerce-related) |
| Phase 4 (Months 16+) | ~12 files (ES/PT/DE localization) |
| **Total distinct files (English baseline)** | **~287** |
| Total when × 9 locales fully rolled out | ~2,500 |

## C. Owner-Responsibility Matrix

| Owner | Files Owned (count) | Examples |
|-------|---------------------|----------|
| Marketing | ~120 | Homepage, About, Brand pages, News, Press, Events, Buying Guides, Blog, Campaigns |
| Product Management | ~75 | All Product Detail, Family, Category pages; Compatibility data |
| Support / Customer Success | ~50 | Warranty, RMA, KB, FAQs, Install Guides, Firmware |
| Legal / Compliance | ~25 | Privacy, Terms, Cookies, Compliance pages, Recalls |
| HR | ~10 | Careers, Applicant Privacy, Internships |
| Operations / Quality | ~5 | Manufacturing, Quality, Sustainability |
| Tech / DevOps | ~5 | Search results, error pages, sitemap |

## D. SEO & Schema.org Type Mapping

| Page Type | Schema.org Type |
|-----------|----------------|
| Homepage | `WebSite` + `Organization` + `SiteNavigationElement` |
| Product Detail | `Product` + `Offer` + `AggregateRating` (when reviews enabled) |
| Article (Buying Guide / Explainer) | `Article` + `FAQPage` (where applicable) |
| Knowledge Base Article | `Article` + `HowTo` |
| News Article | `NewsArticle` |
| Press Release | `NewsArticle` + `PressRelease` |
| Event | `Event` |
| FAQ | `FAQPage` |
| Person (Leadership) | `Person` |
| Organization (About) | `Organization` |
| Local Business (Office, Retailer) | `LocalBusiness` |
| Job Posting (Careers) | `JobPosting` |
| Review / Testimonial | `Review` |

## E. Critical-Path Content Dependencies (Phase 1 must-launch)

The following 28 files are **non-negotiable for launch**. Without them, the website cannot meet BRD Section 28.1 launch-readiness criteria.

```
01-homepage/01-homepage.md
02-about/01-overview.md
02-about/02-history.md
02-about/03-leadership.md
02-about/06-certifications.md
02-about/12-why-choose-twinmos.md
02-about/13-mission-vision-values.md
03-products/00-products-hub.md
03-products/01-memory/00-memory-hub.md
03-products/01-memory/01-ddr5-desktop-hub.md
03-products/02-ssd/00-ssd-hub.md
03-products/02-ssd/01-nvme-gen5-hub.md
03-products/07-finder/00-compatibility-finder.md
05-gaming/00-gaming-hub.md
07-support/00-support-hub.md
07-support/01-warranty-policy.md
07-support/02-warranty-registration.md
07-support/06-rma-hub.md
07-support/17-kb-hub.md
07-support/36-contact-support.md
09-where-to-buy/00-where-to-buy-hub.md
09-partners/00-partners-hub.md
09-partners/01-become-distributor.md
10-news-events/00-news-hub.md
13-contact/00-contact-hub.md
13-contact/10-office-locations.md
14-legal/01-privacy-policy.md
14-legal/03-terms-of-use.md
```

## F. Initial Content-Population Estimate (Phase 1)

| Category | Word Count Estimate | Author Days (1,000 wpd) |
|----------|--------------------:|------------------------:|
| Homepage + About (15 pages) | 12,000 | 12 |
| Products (50 SKUs × 600 words avg) | 30,000 | 30 |
| Solutions / Use Cases (8) | 8,000 | 8 |
| Gaming Hub (8) | 6,000 | 6 |
| Technology (12) | 12,000 | 12 |
| Support landing + 30 KB articles | 30,000 | 30 |
| Learn (Buying Guides 18 + Explainers 30 + Glossary) | 50,000 | 50 |
| News / Press launch set | 5,000 | 5 |
| Regional landings (8 priority countries) | 6,000 | 6 |
| Careers (3 active roles + intros) | 4,000 | 4 |
| Contact / Forms (success copy etc.) | 2,500 | 2.5 |
| Legal (15 must-have pages) | 25,000 | 25 (legal review) |
| Marketing campaign LPs (3) | 4,500 | 4.5 |
| **Phase 1 Total** | **~195,000 words** | **~195 author days** |

Recommendation: a 4-person content squad (1 lead copywriter, 1 product copywriter, 1 technical writer, 1 legal-savvy editor) can deliver Phase 1 over ~12 weeks with TwinMOS SME review cycles in parallel.

## G. Content QA Checklist (per page, before publish)

- [ ] Title (≤ 60 chars), meta description (≤ 160 chars), Open Graph image (1200×630), canonical URL set
- [ ] H1 unique on page, logical H2/H3 hierarchy, no skipped levels
- [ ] All facts cited from CP / source documents; new claims approved by SME
- [ ] All product specs match the CMS product master (BR-1.1 SKU uniqueness)
- [ ] All images have descriptive alt text; decorative images have empty alt
- [ ] All external links open in new tab (BR-GLOBAL-6)
- [ ] All form CTAs route to correct backend (test in staging)
- [ ] Schema.org structured data validates in Rich Results Test
- [ ] Page passes WCAG 2.1 AA automated check (axe-core) and manual screen-reader test
- [ ] Page passes Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- [ ] Page tested in Chrome, Safari (incl. iOS), Firefox, Edge, Samsung Internet (per URD §7.2)
- [ ] No grammar errors (Grammarly + native-speaker review)
- [ ] All warranty / spec / pricing claims match CMS configuration (BR-6.5)
- [ ] Cross-links to related pages live and not 404
- [ ] Hreflang tags present for any localized siblings
- [ ] Last-reviewed date stamped in frontmatter
- [ ] Reviewed by second person (BR-5.1) before publish

## H. Localization Authoring Rules

- **English is the source of truth (BR-9.1).** All other languages translate from English only.
- **Translation workflow:** Native-speaker translation → native-speaker review → marketing approval → publish.
- **Untranslated state:** When a localized version isn't ready, fall back to English with a small "Translation pending" badge per UR-9.1.9 — never publish auto-translated content.
- **RTL specifics for Arabic:** Mirror layout, text aligns right, navigation flips, but keep numerics, SKUs, and Latin-letter product names left-to-right inline (CSS `dir="ltr"` on the relevant inline elements).
- **Cultural review:** Each locale must be reviewed for cultural appropriateness — e.g., remove Western holiday references for KSA; adjust gender/family imagery for India.
- **Hreflang declarations:** Every localized page must list itself + every alternate locale + `x-default`.

## I. Content Governance & Lifecycle

| Lifecycle Stage | Trigger | Action |
|-----------------|---------|--------|
| **Draft** | Author starts page | CMS status "draft", not in sitemap |
| **In Review** | Author submits | SME review queued; auto-notification to reviewer per BR-5.1 |
| **Approved** | Reviewer signs off | Publish-ready; can be scheduled |
| **Published** | Live | Indexed, in sitemap, Schema.org structured data live |
| **Stale** | Auto-flag at last_reviewed > 12 months | Notify owner; require refresh or archival |
| **Archived** | Owner archives | 301 redirect to closest live page; soft-deleted for 30 days (BR-10.4) |
| **Deleted** | After 30-day soft-delete | Removed from CMS; sitemap removal; redirect maintained |

## J. Source-Document Audit Notes (Open Items)

These items came up during research and need TwinMOS executive resolution before content goes live:

2. **Manufacturing locations** — Drop Xinjiang reference for public-facing copy; use "Taiwan-based with regional partner facilities".
3. **ISO 9001 version** — Update from 2000 to 2015; obtain current TUV SUD certificate or equivalent.
4. **18 awards 2001–2023** — Verify each with Marketing; only publish those with stored certificate evidence.
5. **UAE Superbrand 2022** — Verify; if unverified, omit per BR-5.5.
6. **EPEAT certification** (mentioned in WC) — Confirm current status; if not active, omit.
7. **USA office address** — "12345 Silicon Valley Blvd" is a placeholder; obtain real address or remove.
8. **DDR Guide (`A GUIDE BOOK ON ddr MEMORY.docx`)** — Re-extract beyond Chapter 2 with `python-docx`; confirms full coverage of generations and ECC for Knowledge Hub.
9. **HPE/2024 deck** — Confirmed not TwinMOS — do NOT use for TwinMOS-branded enterprise copy. May inform STBL-related case study with permission.
10. **Country distributor anomalies** — Verify each retailer record (Cameroon Canadian phone numbers, Egypt Pro Center Amman address, Algeria founding-year inconsistencies) before regional pages launch.
11. **Patents claim** (CP §6) — Confirm with R&D; only publish patent page when patents and grant numbers are verified.
12. **Customer testimonials in WC** — Verify each named individual (Mark R., Jane D., Alex L., Sarah W.) consents to publication and re-attribution; otherwise replace with new sourced testimonials.
14. **responsive customer service** claim (CP §2) — Verify operational coverage; align FAQ + chat-widget hours accordingly.
15. **"rigorous pre-delivery testing"** claim (CP §6) — Verify with Quality team; adjust copy if scope narrower in practice.

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 29 April 2026 | TwinMOS Digital Transformation Team | Initial comprehensive content map covering 287 distinct content entries across 16 top-level categories, synchronized with RFP v2.0 / BRD v2.0 / URD v2.0 / Company Profile v2.0 / Forensic Audit v1.0; informed by competitive research of 9 leading memory/storage brand websites (Kingston, Corsair, G.Skill, ADATA/XPG, Crucial, Samsung, TEAMGROUP, Transcend, PNY) and extraction of all TwinMOS source documents (existing website draft, DDR guide, Africa expansion strategy, country-wise distributor lists). |

---

**Synchronized With:** RFP v2.0, BRD v2.0, URD v2.0, Forensic Audit v1.0, Company Profile v2.0
**Next Review:** Upon design-phase kickoff and after first SME pass on the 15 open audit items in Appendix J.
**Filename:** `TwinMOS_Website_Content_Map.md`
**Location:** `C:\software_project\TwinMOS\content\`

*© 2026 TwinMOS Technologies Middle East FZE. All rights reserved. This document contains confidential and proprietary information.*
