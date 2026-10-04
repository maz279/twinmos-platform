# TwinMOS Corporate Website — Comprehensive Features Catalog

| Document Control | |
|---|---|
| **Reference** | TWN-FEATURES-CATALOG-2026-001 |
| **Version** | 1.1 |
| **Date** | 24 September 2026 |
| **Status** | Issued — supersedes v1.0 |
| **Classification** | Internal — project working document |
| **Prepared for** | TwinMOS Digital Transformation Program |
| **Review cycle** | Re-baseline at each phase gate; next review at Phase-1 launch gate (Feb–Mar 2027) |
| **Companion document** | `TwinMOS_Features_Catalog_Audit_Report_v1.1.md` (same folder) — audit findings applied in this revision |

**Revision History**

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-09-24 | Initial comprehensive catalog: 142 feature blocks, 33 categories, from full-corpus analysis |
| 1.1 | 2026-09-24 | Audit-driven revision: added both Technical + Non-technical function lists to all feature blocks (21 exceptions fixed); reconciled 445-vs-454 file-count contradiction; annotated ADR numbering collision; fixed heading hierarchy (Category 33) and a literal-`###` markdown defect; added Document Control, Revision History, Table of Contents, Methodology & Verification, persona register, data-freshness/presentation standards (new F29.4), pre-mortem cut-order table, external-benchmark validation, Acronyms & Glossary, Epic→Category traceability matrix, expanded Known Gaps, and Enhancement Recommendations; coverage additions (PDP social sharing, password strength meter, Apple/Google Pay, optional heatmaps, MDF pre-claim, corporate identifiers) |

**Prepared from** — full analysis of the entire project corpus: URD v3.1, BRD v3.0, RFP v3.0, SOW v4.0, Technology Stack v1.2, Implementation Strategy v4.0, 15-Phase Implementation Roadmap v3.0, Company Profile v2.0, Forensic Audit & Remediation Report (2026-09-23), Documents Alignment Changelog, Documentation Inventory v3.0; **445 content-architecture files on disk** (454 referenced in planning docs before the remediation deleted 10 — see §0.2 note); 323 project-documentation files (areas A–R); 4 marketing files; and the 3,001-file offline mirror of the live twinmos.com. Excluded as content-free: `.mimosa/` tool-state folder and two deliberately empty placeholder documents (F.1 Content Inventory, M.3 Analytics/KPI).

**Purpose** — single comprehensive inventory of **every feature** of the TwinMOS corporate website (the rebuild), organized into categories, with each feature's complete set of **technical functions** and **non-technical (business/user-facing) functions**, plus phase, priority, roles, KPIs, and source traceability.

---

## Table of Contents

- **How to Read This Catalog** · **Methodology & Verification**
- **PART 0 — PROJECT & WEBSITE CONTEXT** (0.1 company snapshot · 0.2 website at a glance · 0.3 user roles · 0.4 persona register)
- **PART I — VISITOR-FACING WEBSITE FEATURES**
  - Category 1 — Global / Site-Wide Features
  - Category 2 — Homepage
  - Category 3 — Corporate / About
  - Category 4 — Product Catalog & Discovery
  - Category 5 — System Compatibility Finder
  - Category 6 — Where to Buy & Channel Sales Enablement
  - Category 7 — Lead Generation, Contact & Forms Platform
  - Category 8 — Support & Customer Self-Service
  - Category 9 — Anti-Counterfeit & Product Authentication
  - Category 10 — Gaming Hub (VOLTX)
- **PART II — BUSINESS, CONTENT & OPERATIONS FEATURES**
  - Category 11 — Solutions & Vertical Use Cases
  - Category 12 — Technology, R&D & Innovation
  - Category 13 — Learn / Knowledge Hub
  - Category 14 — News, Events, PR & Media
  - Category 15 — Careers
  - Category 16 — Marketing Programs & Campaigns
  - Category 17 — Channel Programs & Partner Portal
  - Category 18 — Regionalization & Multilingual
  - Category 19 — User Accounts & Personalization
  - Category 20 — Content Management System (CMS)
  - Category 21 — E-Commerce (Phase 3)
- **PART III — PLATFORM & TECHNICAL CAPABILITY FEATURES**
  - Category 22 — Frontend Architecture, Design System & Responsive UI
  - Category 23 — SEO
  - Category 24 — Accessibility
  - Category 25 — Performance Engineering
  - Category 26 — Security, Privacy & Legal/Compliance
  - Category 27 — Analytics, Reporting & Experimentation
  - Category 28 — Integrations Platform
  - Category 29 — Data Layer & API Platform
  - Category 30 — Infrastructure, Hosting & DevOps
  - Category 31 — QA & Testing
- **PART IV — CURRENT LIVE SITE (AS-IS) & REFERENCE**
  - Category 32 — Current twinmos.com Features & Known Defects
  - Category 33 — Cross-Cutting Reference Tables (phase map · KPI ladder · cut order · source map · epic matrix · known gaps · enhancement recommendations · acronyms)

---

## How to Read This Catalog

**Feature block format** — every feature is documented as:

- **Description** — what the feature is
- **Technical functions** — engineering behaviors that implement it (frontend, backend, data, integration, performance, security mechanics)
- **Non-technical functions** — business, marketing, support, editorial, legal, and user-experience outcomes the feature delivers
- **Phase / Priority** — when it ships and how critical it is
- **Roles** — who uses or operates it
- **KPIs** — success measures where the source documents define them
- **Sources** — traceability to the governing documents

*v1.1 guarantee: all feature blocks carry both a Technical-functions and a Non-technical-functions list (script-verified).*

**Phasing key** (authoritative 15-phase roadmap; BRD phases map onto it):

| Roadmap phase | BRD phase | Scope window |
|---|---|---|
| Phases 1–8 | Phase 1 | Foundation → public launch, English-only (launch Feb–Mar 2027) |
| Phases 9–12 | Phase 2 | Localization AR/HI, partner portal, live chat, anti-counterfeit, RMA full workflow, ERP (ends ~Jun 2027) |
| Phases 13–14 | Phase 3 | E-commerce, RU/ZH-CN/FR locales, advanced analytics (Jun 2027–Jan 2028) |
| Phase 15 | Phase 3+ | Loyalty, referral, MDF, ES/PT/DE locales, handover (from Jan 2028) |
| Phase 4 retainer | Post-engagement | SEO/CRO, security updates, locale expansion |

**Priority key:** P0 = launch-critical · P1 = core value, first releases · P2 = differentiator · P3 = later/reserved.

**Document authority note:** where documents conflict, the SOW v4.0 and Roadmap v3.0 govern (they supersede RFP v3.0's procurement, stack and timeline). Key authoritative rulings applied throughout: stack = Astro 5 + React 19 + Strapi v5 + PostgreSQL 16 + MeiliSearch on a TwinMOS-owned VM behind Cloudflare Pro; accessibility = **WCAG 2.2 AA**; maps = Leaflet/MapLibre (not Google Maps); search = MeiliSearch (not Algolia); e-commerce decision deferred to ADR-007 (Medusa.js v2 or Stripe Checkout). Post-remediation facts (2026-09-23 forensic sweep) also govern: **Bengali was removed from the locale plan; 27 regional pages remain; no named executives may be published; only live-verified marketplace entries (Amazon.ae, Newegg) may be shown.** Some older passages still cite "10 locales incl. BN" — the reconciled plan is **EN + AR + HI + RU + ZH-CN + FR + ES + PT + DE (9 locales)** unless TwinMOS re-adds a tenth.

**ADR numbering caution:** two ADR registries coexist — the root documents reference an **8-ADR set** (stack, islands, repos/build, React 19, HubSpot, custom CMP, e-commerce stub, Node LTS path), while `project documentation/D.5` holds an **18-ADR registry with different numbering** (e.g., ADR-005 = MeiliSearch there, but "ADR-005 = HubSpot" in root docs; ADR-012 HubSpot / ADR-014 Medusa / ADR-015 Better Auth / ADR-016 Chatwoot in D.5). This catalog cites decisions **by name** and annotates the registry where a number is used. The collision is flagged for the document owner in Known Gaps (G-10).

## Methodology & Verification

1. **Corpus analysis** — six parallel deep-analysis passes over the full corpus (URD; BRD+RFP+SOW; Tech-Stack+Strategy+Roadmap; content architecture; live-site mirror; project-documentation tree A–R), plus direct reading of the company profile, forensic-audit report, alignment changelog and documentation inventory.
2. **Fact reconciliation** — every numeric/factual claim cross-checked against the post-remediation fact base; contradictions either reconciled with a note or listed in Known Gaps.
3. **External benchmark validation** (v1.1) — compatibility-finder framing validated against [Kingston's "Search by System/Device"](https://www.kingston.com); llms.txt status researched (proposed standard, niche adoption, major AI crawlers largely ignore it — see Enhancement R-1).
4. **Automated structural checks** (v1.1) — scripted verification that every `### F*` block contains both function lists and that heading levels are consistent; re-run after each future revision (script described in the companion audit report).

---

# PART 0 — PROJECT & WEBSITE CONTEXT

## 0.1 Company snapshot (verified fact base)

- **Company:** TwinMOS Technologies — independent memory & storage manufacturer, founded **1998, Taipei**; brand line "Legendary Memory Brand Since 1998". No parent company, holding group, or outside owner; no named executives are published and **none may be published without written TwinMOS verification** (BR-5.5 governance).
- **Offices (5 verified):** Taipei (global HQ & R&D), Dubai DAFZA C-9 (international office — MEA/CIS/South Asia), Dongguan (manufacturing; also Hsinchu Taiwan), Cologne (TwinMOS Europe GmbH), San Jose (TwinMOS America Inc.).
- **Corporate identifiers:** USB Vendor ID **4719** (TwinMOS Technologies ME FZE, USB.org); IEEE OUI **000B9D**.
- **Reach:** 93+ countries, 5 continents, 100+ products (38–40 in the authoritative catalog), 27+ years heritage.
- **Portfolio:** DRAM modules (DDR5/DDR4/DDR3, desktop/laptop/server-ECC reserved), SSDs (NVMe PCIe Gen 5/4/3, SATA), portable storage (PSSD/HDD), USB flash drives, accessories (USB hub; card reader reserved), power supplies (live-site category — see Known Gap G-6). **11 master brand lines:** VOLTX, TornadoX7, Thunder GX, Concord, CoreX Pro, Xtreme, Alpha Pro, Hyper H2 Ultra, ELITE Drive Pro, ProDrive Ultra, Mobile Disk X3.
- **Certifications:** ISO 9001 (TÜV SÜD, 2002; manufacturing partners), FCC, CE, UKCA, EAC, RoHS, REACH, JEDEC, EPEAT; BIS India (Phase 2 page).
- **Warranty (live policy, CMS-driven per BR-6.1/BR-6.5):** Lifetime = memory modules; 5 years = NVMe SSD (all gens), flash cards, USB drives; 3 years = SATA SSD; 1 year = computer accessories. EOL products excluded; 3-month EOL notice commitment.
- **Competitors benchmarked:** Kingston, Corsair, Crucial, Samsung, WD/SanDisk, ADATA/XPG, TeamGroup, Transcend, PNY — the rebuild closes 14 competitor-standard feature gaps (externally validated: Kingston's homepage system-finder is the benchmark the Compatibility Finder emulates).

## 0.2 Website at a glance (target scale)

- **Content:** 287 unique content entries across **16 numbered content sections (00–15)** — **445 markdown files currently on disk** (planning documents reference 454; the 2026-09-23 forensic remediation deleted 10 fabricated files inside `content/website-content/`, and the planning figure was never re-baselined); 100+ SKU product pages; 11 brand pages; 27 regional landing pages; 34 legal pages; ~30–64 Learn Hub entries (largest section); 30+ KB articles (growing to 50+); 15–17 form types; 18 reserved/future pages.
- **Locales:** 9 active by engagement end (EN launch; AR+HI Phase 2; RU+ZH-CN+FR Phase 3; ES+PT+DE Phase 15) → ~3,500 static routes at full localization.
- **Capacity targets:** 50K→500K pageviews/mo; 500→5,000 concurrent (10,000 COMPUTEX peak); 99.9% uptime; Lighthouse ≥90 perf / ≥95 a11y-BP-SEO.
- **Team & timeline:** solo full-stack developer × 18–24 months, 15 phases, 150 milestones, ~600–689 tasks, 8 root-doc ADRs signed at Phase-1 start (18-entry ADR registry in D.5 — see numbering caution above).

## 0.3 User roles

Anonymous Visitor (~85–90% of traffic) · Registered Product Owner (email-based light auth, 5–8%) · Authorized Distributor / Channel Partner (invitation-only portal, <1%) · CMS User (Super Admin / Admin / Editor / Author / Viewer) · Staff operators (Support, Brand Protection, Sales, HR, Finance) · Job Applicant · Media/Analyst.

## 0.4 Persona register (URD §5 — governs feature rationale)

| Persona | Profile | Primary features serving them |
|---|---|---|
| Rahul | Gamer, RGB enthusiast | Gaming hub (Cat 10), comparison, VOLTX brand axis |
| Kumar | System integrator | Compatibility finder, datasheets, bulk quote |
| Sarah | Enterprise procurement | Solutions/Enterprise, compliance hub, quote request |
| Mr. Patel | Prospective distributor | Become-a-Distributor, partner portal, price lists |
| Aisha | Laptop upgrader (non-technical) | Compatibility finder by model, Learn guides, SN-Check |
| Faisal | Embedded engineer | Embedded/Industrial solutions, technology hub, specs |
| Ms. Tan | Government/regulated IT | Telco/BFSI/Gov solutions, certifications, EAC |
| Mr. Rahman | Education IT | Education solutions, fleet-upgrade guide |
| Mr. Wong | OEM/ODM | OEM/ODM program, NDA path, custom-spec disclosure |
| Lina | Media/analyst | Press room, media kit, news hub, benchmarks |
| Sara | Job applicant (60% mobile) | Careers hub, multi-step application |

---

# PART I — VISITOR-FACING WEBSITE FEATURES

## Category 1 — Global / Site-Wide Features

### F1.1 Global Header & Main Navigation (Mega-Menu)
**Phase 1 · P0 · All visitors**
**Description:** Sticky site header (64px desktop / 56px mobile) with logo left, center navigation — **Products | Solutions | Where to Buy | Support | About | News | Contact** — and right-side utilities: search icon (keyboard shortcut `/`), language selector, persistent "Contact"/"Where to Buy" CTA. Fixes the #1 audit finding of the current live site (no visible category navigation).
**Technical functions:**
- React island (`client:idle`, ~15KB budget) with dropdown menus; 3-column **Products mega-menu** (DRAM / SSD / Portable+USB) with featured promo card, footer links (View All, Comparison, Compatibility Finder), hover-lazy-loaded and CDN-cached
- Desktop dropdowns + Wide-breakpoint mega-menu; mobile full-screen overlay menu (see F1.2); ARIA menu-expansion announcements (UC-26)
- Category navigation visible on every page (UR-1.1.1); sticky behavior on scroll
**Non-technical functions:**
- Primary wayfinding and product-discovery entry point; consistent navigation across all pages (accessibility/cognitive)
- Communicates full product breadth in one hover; promotes featured lines and key tools
- KPI: bounce <40%; pages/session 3.0→4.0
**Sources:** URD §21/§22.6/§23.3, UR-1.1.1, UC-26; RFP §4.2.1, App. B; content `00-site-wide/01-header-navigation.md`

### F1.2 Mobile Menu
**Phase 1 · P0 · Mobile visitors**
**Description:** Full-screen overlay sliding from the right with accordion category sections.
**Technical functions:** Slide-in overlay; accordion expansion; close button + swipe-to-close gesture; focus trapping (AF-3); 56px header height on mobile; touch targets ≥44×44px.
**Non-technical functions:** Mobile-first navigation for ≥60% mobile audience; parity with desktop wayfinding.
**Sources:** URD §22.6, UC-1 AF-3

### F1.3 Breadcrumbs
**Phase 1 · P1 · All visitors**
**Description:** Hierarchical trail (Home > Products > Memory > DDR5 Desktop); current page non-clickable; truncated with "…" on mobile.
**Technical functions:** Breadcrumb component on all content pages; **BreadcrumbList JSON-LD schema** emitted per page.
**Non-technical functions:** Orientation aid; SEO rich-result eligibility (Lighthouse SEO ≥95 gate).
**Sources:** URD UR-1.1.6; RFP site-wide components; F.3 SEO templates

### F1.4 Global Footer
**Phase 1 · P0 · All visitors; marketing**
**Description:** 4-column footer (Products, Support, Company, Connect) on dark background (#0A2540) with newsletter signup, "Become a Distributor" link, legal links, social icons (verified canonicals: facebook.com/twinmos.tech, instagram.com/twinmos.tech, linkedin.com/company/twinmos-technologies, x.com/twinmos, youtube.com/c/TwinMOStech, pinterest.com/twinmos), certification/trust marks, and contact info.
**Technical functions:** Componentized footer with CMS-managed link lists; embedded newsletter form island; social links with correct rel/target attributes.
**Non-technical functions:** Lead capture on every page; trust signals; legal compliance links (privacy/terms/cookie); channel recruitment CTA (KPI: 20+ distributor inquiries/quarter).
**Sources:** URD §21, UR-3.3.1; RFP App. B; content `00-site-wide/02-footer.md`

### F1.5 Site-Wide Search (Header Search + Results Page)
**Phase 1 (search UI P0) · P0 · All visitors**
**Description:** Header search icon (mobile expandable / desktop persistent input) opening a results page at `/search` with instant, faceted results across products and content.
**Technical functions:**
- **MeiliSearch** self-hosted (locked by SOW; native Arabic/CJK tokenization) with 12+ indexes: products, articles, kb_articles, news, events, solutions, learn_hub, compatibility, retailers, partners, valid_serials (P2), medusa_products (P3)
- Auto-indexing via Strapi lifecycle hooks on create/update/delete; server-side proxying (public read-only key; admin keys never exposed)
- Debounced auto-suggest with keyboard navigation and highlighted matches, <100ms per keystroke; search endpoint <100ms target; typo tolerance; product-name boosting, exact-match priority; per-locale ranking rules, stop-words and synonym dictionaries ("RAM"↔"memory"↔"DRAM", Arabic transliterations)
- Zero-result query tracking feeding content-gap fixes; graceful degradation chain (instant → server-side → static dropdown)
**Non-technical functions:** Product/content discovery for every persona; replaces the current site's weak product search; supports the "find within 5 seconds" homepage goal; search-driven product page views KPI.
**Sources:** URD §22.6, §27; BRD §20.2, §25.2; SOW §3.1; Tech Stack §search; content `00-site-wide/05-search-bar.md`, `13-search-results.md`

### F1.6 Language Selector & Locale Switching
**Phase 1 (EN UI) / Phase 2+ (translations) · P0 · All visitors**
**Description:** Header dropdown on every page showing bilingual labels (e.g., "Arabic — العربية"); supports 9 locales rolled out in phases. *(Note: the URD's selector example still lists Bengali — a pre-remediation artifact; the launch dropdown ships EN with locale stubs per the corrected plan.)*
**Technical functions:**
- Astro i18n routing with locale-prefixed URLs (`/en/`, `/ar/`, `/hi/`, `/ru/`, `/zh-CN/`, `/fr/`, `/es/`, `/pt/`, `/de/`); Strapi i18n plugin with per-locale draft/publish
- Preference persistence (localStorage + cookie) with SSR locale negotiation; language switch preserves page context; EN fallback with "Translation pending" indicator
- **Arabic RTL support:** `dir="rtl"` mirrored layouts via CSS logical properties + Tailwind RTL plugin, right-aligned text, Noto Sans Arabic font stack
- hreflang + canonical tags for every variant with `x-default` → EN; per-locale sitemaps
**Non-technical functions:** Native-language access for MEA/South Asia/CIS/Europe audiences (BO-08: 3 additional languages live ≤6 months post-launch); locale-aware dates/numbers/currency display.
**Sources:** URD UR-9.1, UC-19; RFP-FR-12.1/12.4/12.6; content `00-site-wide/06-language-selector.md`

### F1.7 Cookie Consent Banner & Preference Center
**Phase 1 · P0 (legal necessity) · All users; legal**
**Description:** First-visit banner (Accept all / reject non-essential / customize) plus a granular Cookie Preferences UI reachable from footer and legal hub.
**Technical functions:** Custom consent-management platform (custom-CMP decision); consent categories (Strictly Necessary, Analytics, Marketing, Personalization); consent-state storage; **consent-gated loading** of GA4/GTM, Meta Pixel, LinkedIn Insight via Partytown; Global Privacy Control (GPC) support; re-prompt after 12 months.
**Non-technical functions:** GDPR / UAE PDPL / India DPDP / KSA PDPL / ePrivacy-UK PECR compliance; user trust; analytics opt-out control.
**Sources:** URD §34.2, UC-44, BR-GLOBAL-5; BRD-FR-15.3, §16; content `00-site-wide/03-cookie-banner.md`, legal `19-cookie-preferences.md`

### F1.8 Trust Bar
**Phase 1 · P1 · All visitors**
**Description:** Site-wide band with certification badges (ISO 9001, CE, UKCA, FCC, RoHS, REACH, JEDEC, EAC), "93+ countries" and "27+ years heritage" claims.
**Technical functions:** Static/CMS-driven component; lazy-loaded badge images.
**Non-technical functions:** Brand-trust restoration; due-diligence support for B2B buyers; only verified claims displayed (forensic-audit rule).
**Sources:** RFP App. B; content `00-site-wide/09-trust-bar.md`

### F1.9 Error & System Pages (404 / 500 / Maintenance)
**Phase 1 · P0 · All visitors; admin**
**Description:** Friendly, on-brand 404 with prominent search bar and quick links (Products/Support/Contact/Home); 500 with contact info; maintenance page with ETA and status link. Full error taxonomy covers 15+ states (product-not-found, form validation, rate-limited, file-too-large, session expired, account locked, out-of-warranty, no-search-results, no-compatible-products, retailer-not-found, CMS permission denied…) each with specified message + recovery action.
**Technical functions:** Custom templates per error class; zero-404 promise on core pages (BO-01); 301 redirect engine protects legacy URLs; maintenance-mode toggle.
**Non-technical functions:** Graceful outage communication; recovers lost users into search/browse paths; no-jargon messaging.
**Sources:** URD §21.14, §27.1; BRD §36; content `00-site-wide/10/11/12-*.md`

### F1.10 Toast Notifications
**Phase 1 · P1 · All visitors**
**Description:** Non-blocking notifications (top-right desktop / bottom-center mobile), 5s auto-dismiss, 4 types, swipe dismiss, ARIA live announcements.
**Technical functions:** Toast queue system; used for compare add/remove, language switch, download start, CMS publish; **10-second Undo** on destructive actions (§28.4).
**Non-technical functions:** Feedback without interruption; error prevention on destructive actions.
**Sources:** URD §27.2, §28

### F1.11 Skip Links & Microcopy Glossary
**Phase 1 · P0 · Accessibility / all visitors**
**Description:** "Skip to main content" as first focusable element; standardized UI microcopy glossary across the site.
**Technical functions:** Skip-link target wiring; microcopy registry consumed by components.
**Non-technical functions:** WCAG 2.2 AA compliance; consistent terminology (BR-13.4 site-wide glossary alignment).
**Sources:** URD §33.1; content `00-site-wide/14/15-*.md`

### F1.12 Client State & Comparison Tray Persistence
**Phase 1 · P1 · All visitors**
**Description:** Site-wide client-side state: language preference, country/region, compare list (localStorage); form drafts (sessionStorage, saved every 5s); filter state in URL params; cart/wishlist placeholders (Phase 1) in localStorage.
**Technical functions:** Nanostores cross-island state; localStorage/sessionStorage strategies; URL-parameter (de)serialization.
**Non-technical functions:** Session continuity; shareable filtered views; resilience against connection drops (form data preserved).
**Sources:** URD §31.1

---

## Category 2 — Homepage

### F2.1 Hero Carousel
**Phase 1 · P0 · All visitors**
**Description:** Full-width hero carousel, max 3–4 slides (VOLTX DDR5, CoreX Pro Gen5, ELITE Drive Pro, Distributor recruitment), communicating "who TwinMOS is" within 5 seconds.
**Technical functions:** Auto-advance 6s; manual controls; pause on hover/focus; swipe on mobile; a11y live regions; LCP <1.8s with hero preload (`fetchpriority="high"`, ≤200KB image); `prefers-reduced-motion` respected.
**Non-technical functions:** First-impression brand repair (current homepage renders empty placeholders); flagship product marketing; distributor recruitment messaging.
**Sources:** URD §21.1, UR-1.1.2; content `01-homepage/02-05-hero-slides.md`

### F2.2 Product Category Grid
**Phase 1 · P0 · All visitors**
**Description:** 5 cards (Memory, SSD, Portable Storage, USB Flash, Accessories) with icon, label, product counts, hover lift; click-through to category pages.
**Technical functions:** CMS-driven cards with counts; lazy images.
**Non-technical functions:** Instant catalog orientation; primary funnel entry.
**Sources:** URD §21.1; content `01-homepage/07-category-grid.md`

### F2.3 Featured Products Rail
**Phase 1 · P0 · All visitors**
**Description:** 4 product cards (horizontal scroll on mobile) with quick-view and compare hooks; "View All" link.
**Technical functions:** Product card component (16:10 image, title, specs, ghost CTA); Quick View modal island.
**Non-technical functions:** Merchandising of flagship/new SKUs (CMS `is_featured` flag); engagement KPI (CTR >4% target).
**Sources:** URD §21.1; content `01-homepage/06-featured-products.md`

### F2.4 Trust Band
**Phase 1 · P1 · All visitors**
**Description:** "Trusted in 93+ countries", partner/distributor counts, certification badges, staggered animation.
**Technical functions:** CMS-driven stats; animation within 60fps budget.
**Non-technical functions:** Credibility; supports bounce <35% goal.
**Sources:** URD §21.1; content `01-homepage/08-trust-band.md`

### F2.5 "Why TwinMOS" Pillars & Global Reach Map
**Phase 1 · P1 · All visitors**
**Description:** 3 value pillars + interactive world map of reach/offices.
**Technical functions:** Lightweight map visualization with static-image fallback.
**Non-technical functions:** Brand storytelling; global-footprint proof.
**Sources:** content `01-homepage/` sections

### F2.6 Testimonials Carousel
**Phase 1 · P1 · All visitors**
**Description:** Customer testimonials carousel — **placeholder attribution only** until written releases exist (BR-14.2 governance; fabricated testimonials removed in remediation).
**Technical functions:** Carousel component; CMS entries with consent flags.
**Non-technical functions:** Social proof with verified-only publishing rule.
**Sources:** content `01-homepage/09-testimonials-block.md`

### F2.7 News Teaser + Gaming Hub CTA + Newsletter Band
**Phase 1 · P1 · All visitors**
**Description:** 3 latest news cards (image, title, date); dark-themed VOLTX gaming CTA card; newsletter signup band.
**Technical functions:** Auto-fed from news collection; CTA analytics events; newsletter island (`client:idle`).
**Non-technical functions:** Freshness signal; funnel to gaming hub; list growth (200→1,000 subscribers/mo target).
**Sources:** URD §21.1; content `01-homepage/`

---

## Category 3 — Corporate / About (17 pages)

### F3.1 Company Story & History Timeline
**Phase 1 · P0 · All visitors; marketing**
**Description:** Heritage narrative "since 1998, 27+ years" with milestone timeline (1998 founding → 2001 Dubai FZE → 2002 ISO 9001 → present), built on the verified fact base (Taipei HQ corrected; fabricated award timeline removed).
**Technical functions:** Timeline CMS block; audit-verified content workflow.
**Non-technical functions:** Brand-trust repair (replaces factually-wrong current content); due-diligence narrative for buyers/distributors.
**Sources:** RFP §4.2.3; content `02-about/02-history.md`

### F3.2 Leadership & Governance Page
**Phase 1 · P1 · All visitors**
**Description:** Governance structure page with **no named executives** — verified-profile placeholder templates only; Person schema replaced with Organization schema until TwinMOS provides verified profiles with written approval (BR-5.5).
**Technical functions:** Placeholder templates; schema guidance (Organization in place of Person).
**Non-technical functions:** Trust without unverifiable claims.
**Sources:** content `02-about/03-leadership.md`; Forensic Audit §5

### F3.3 Manufacturing, Quality Assurance & R&D Pages
**Phase 1 · P1 · Buyers/distributors**
**Description:** Taiwan-based manufacturing + regional partner facilities narrative; multi-stage QC and pre-delivery testing story.
**Technical functions:** CMS templates; image galleries.
**Non-technical functions:** Supply-chain due diligence for Sarah (enterprise) / Mr. Patel (distributor) personas.
**Sources:** RFP App. B `/about/`; content `02-about/04-06-*.md`

### F3.4 Certifications & Awards Pages
**Phase 1 · P1 · All visitors**
**Description:** Filterable awards gallery (by year/category) and certification badge grid. **Rule:** no award published without certificate image + verified date/body (UAE Superbrand 2022 conditional only); only verified recognition retained (Best SSD Manufacturer 2023).
**Technical functions:** CMS fields for certificate evidence; verification-date gates; badge click-through to certificate details.
**Non-technical functions:** Eliminates "empty awards" audit issue; procurement-grade proof.
**Sources:** URD UR-5.3, BR-5.5; content `02-about/06-07-*.md`

### F3.5 Global Presence, Corporate Entities & Fact Sheet
**Phase 1 · P1 · All visitors; B2B**
**Description:** Office map (5 verified offices), corporate-entity tree, downloadable one-page corporate fact sheet.
**Technical functions:** Map component; PDF generation/download; LocalBusiness/Organization schema.
**Non-technical functions:** Sales enablement; geographic credibility.
**Sources:** content `02-about/10/11/16-*.md`

### F3.6 Press Room & Media Kit
**Phase 1 · P1 · Media/analysts (Lina persona)**
**Description:** Asset library — logos (PNG/SVG/EPS), brand guidelines, executive headshots (verified only), product imagery — "Download all as ZIP", press@twinmos.com contact, press releases, newsletter archive, media-coverage hub.
**Technical functions:** ZIP bulk download; media library with format variants; public access (no gating).
**Non-technical functions:** Serves journalists/analysts; controls brand consistency in coverage.
**Sources:** URD UC-49; RFP App. B; content `02-about/14-15-*.md`

### F3.7 Sustainability, CSR, Mission/Vision, Why Choose Us, Investor Relations (reserved P4)
**Phase 1 (P1 pages) / P4 (IR) · All visitors**
**Description:** ESG narrative pages: Supply Chain Disclosure, CSR/community, mission-vision-values, differentiators; IR page reserved until IPO/funding trigger.
**Technical functions:** CMS pages; reserved-page system (hidden from nav/sitemap, 404 until activated).
**Non-technical functions:** ESG storytelling with annual update cadence (BR-16.3).
**Sources:** content `02-about/08-13,17-*.md`; BRD §35A reserved pages

---

## Category 4 — Product Catalog & Discovery

### F4.1 Category & Sub-Category Browsing
**Phase 1 · P0 · All visitors**
**Description:** Plain-language category pages — Memory (RAM), SSDs, Portable Storage, USB Flash Drives, Accessories — with sub-category cards (Memory → DDR5/DDR4/DDR3 desktop & laptop; SSD → NVMe Gen 3/4/5, SATA). Empty categories auto-hidden (UR-1.1.7).
**Technical functions:** Category pages <1.5s load; unique SEO titles/meta per category; product grid 3-col desktop / 2 tablet / 1 mobile; sort dropdown; pagination/load-more (infinite scroll with accessible fallback); empty state with suggestions; 16-category live-site hierarchy (DRAM>Desktop/Gaming/Notebook, SSD>NVMe/SATA, Portable>HDD/SSD, Flash, MicroSD, Power Supply, USB Hub) as migration reference — see Gap G-6 on MicroSD/Power Supply.
**Non-technical functions:** #1 visit reason on hardware sites (product page views 5K→30K/mo KPI); browse-first discovery for non-search users.
**Sources:** URD UR-1.1, UC-1, §21.2; RFP-FR-8.1.1; content `03-products/` hubs

### F4.2 Product Filtering & Sorting
**Phase 1 · P0 · All visitors**
**Description:** Instant AJAX faceted filtering on category pages. Memory filters: Type DDR3/4/5, Capacity 4–64GB, Speed 1333–6000MHz, Form Factor UDIMM/SO-DIMM, RGB Y/N. SSD filters: Interface SATA/NVMe, PCIe Gen 3/4/5, Capacity 128GB–4TB, Form Factor 2.5"/M.2 2280.
**Technical functions:**
- Grid update <200ms without page reload; filter facets from MeiliSearch; real-time result count ("Showing 12 of 47")
- Removable active-filter pills + "Clear All"; **filter state reflected in URL** (shareable/bookmarkable, e.g., `?capacity=32gb&rgb=yes`)
- Left sidebar desktop / bottom-sheet drawer on mobile with Apply; sort options: Relevance, Name A–Z, Price, Capacity, Speed (Best Selling deferred to Phase 3 with order data)
- No-match state suggests removing a specific filter (AF-1)
**Non-technical functions:** Self-service narrowing; reduces pre-sales support burden; competitive parity (live site already has 10 layered-nav widgets — rebuilt cleaner).
**Sources:** URD UR-1.2, UC-2; RFP-FR-8.1.x; Roadmap Ph.5

### F4.3 Product Status Badges & Lifecycle States
**Phase 1 · P0–P2 · All visitors; PM**
**Description:** Automated product lifecycle presentation: **"New"** badge auto-applied 90 days from release (no manual CMS action); **"Featured"**; **"Coming Soon"** with "Notify Me" email capture; **"Discontinued"** badge with replacement suggestions and hidden Where-to-Buy CTA; not-found → 404 with suggested products.
**Technical functions:** `is_new` auto-computed from release_date; status enum active/discontinued/coming_soon; notify-me signup endpoint; discontinued→replacement cross-links; EOL handling aligned to 3-month EOL-notice commitment (live EOL PDF program).
**Non-technical functions:** Expectation setting; upgrade-path communication; EOL transparency (reduces support disputes).
**Sources:** URD §26.4, BR-1.4/1.5, BR-GLOBAL-8/9; RFP-FR-8.1.5

### F4.4 Product Detail Page (PDP)
**Phase 1 · P0 · All visitors**
**Description:** The evaluation/purchase-decision hub for 100+ SKUs. Above the fold: hero image (~50%), name, SKU/model, short description, key spec summary, warranty badge, "Where to Buy" CTA.
**Technical functions:**
- **Image gallery:** ≥3 images (hero/angle/detail), thumbnail nav, click-to-zoom lightbox (ESC/arrow keys, swipe), srcset/WebP/AVIF via Sharp+ImgProxy, min 1200×1200 transparent PNG sources
- **Spec table** grouped (General/Performance/Physical/Compatibility/Warranty), responsive to cards on mobile, dash-for-empty; structured JSON spec fields; 19-attribute depth on live-site parity (NAND type/brand, controller brand, endurance TBW, MTBF, heat sink, LDPC, SMART, wear leveling…)
- **Tabs:** Specifications / Features / Compatible Systems / Downloads / Reviews (if applicable; Review + AggregateRating schema P2)
- **Social sharing:** one-click WhatsApp, Twitter/X, Facebook, Email, Copy Link (UR-1.3)
- **Quick View modal** from category grid (key specs without leaving page)
- Datasheet download button (F4.6); SKU in monospace with copy button; mobile sticky bottom CTA
- Performance: full page <2.0s, above-fold <1.0s, gallery nav <100ms; Product+Offer JSON-LD (price 0 until commerce); empty-data fallbacks (placeholder image, "description coming soon", disabled datasheet with tooltip)
**Non-technical functions:** Reduces returns and pre-sales questions; comparison-shopping positioning vs competitors; warranty transparency (CMS-driven terms per BR-6.5); shareable product advocacy.
**Sources:** URD UR-1.3, UC-3, §21.3, §29.4; RFP-FR-8.1.x; Roadmap Ph.5

### F4.5 Related Products & Cross-Sell Recommendations
**Phase 1 · P1 · All visitors**
**Description:** "You may also like" (same category, similar specs) + "Compatible with" recommendations on PDPs.
**Technical functions:** Related-products M2M relation + compatibility-driven suggestions; horizontal scroll rail (3–4 items).
**Non-technical functions:** Cross-sell/upsell; increases pages/session KPI.
**Sources:** RFP-FR-8.1.4; URD §21.3

### F4.6 Datasheet Download & Datasheet Library
**Phase 1 · P1 · Integrators/enterprise buyers**
**Description:** Branded PDF datasheet on every PDP (<2MB: image, full specs, features, warranty, certifications, part number); central datasheet library index with version + release-date columns; auto-generated from product data.
**Technical functions:** PDF generation pipeline from Strapi product data; new-tab/download behavior; mobile cloud-save; "coming soon" fallback; download event tracked in analytics; 21+ datasheet pages in content corpus; 29 PDFs on live site as ground truth.
**Non-technical functions:** Procurement document inclusion (Kumar/Sarah personas); enterprise credibility.
**Sources:** URD UR-1.5, UC-5; content `03-products/08-datasheets/`

### F4.7 Product Comparison Tool
**Phase 1 · P0 · All visitors**
**Description:** Compare up to 4 products side-by-side with spec-diff highlighting.
**Technical functions:**
- "Add to Compare" on grid + PDP; sticky bottom compare bar with count; 5th product blocked with message
- Products-in-columns/specs-in-rows table; **differing values highlighted (#E6F7FF)**; dash distinct from zero; sticky first column; horizontal scroll on mobile
- localStorage persistence across session; **shareable deep-link URL** (`/compare/?products=...`); printable clean stylesheet; handles discontinued products + invalid IDs; Undo toast on removal; PDF export/share (content spec)
**Non-technical functions:** Informed choice vs competitors (Rahul gamer / Kumar integrator personas); competitive-parity feature #2 (BO-02).
**Sources:** URD UR-1.4, UC-4, UC-28, §21.4; RFP-FR-8.1.2; content `03-products/00-product-comparison.md`

### F4.8 Brand-Line Axis Navigation (11 Brand Hubs)
**Phase 1 · P1 · All visitors**
**Description:** `/products/brands/` directory + 11 reusable brand pages (VOLTX, TornadoX7, Thunder GX, Concord, CoreX Pro, Xtreme, Alpha Pro, Hyper H2 Ultra, ELITE Drive Pro, ProDrive Ultra, Mobile Disk X3); **dual-axis navigation (Category × Brand)** linking the same SKUs bidirectionally.
**Technical functions:** Brand entity; axis-aware breadcrumbs; reusable brand template; brand filter facet.
**Non-technical functions:** Brand-line marketing and loyalty browsing; differentiates 11 master lines.
**Sources:** RFP-FR-8.8.1–3; content `03-products/06-brands/`

### F4.9 Downloadable PDF Catalog
**Phase 1 · P1 · Partners/buyers**
**Description:** Generated full-product catalog PDF (full/memory/SSD splits) at `/products/catalog/` (live-site parity: COMPUTEX-2026 catalog PDF).
**Technical functions:** Catalog generation from product master; PDF hosting on B2 with signed URLs.
**Non-technical functions:** Offline channel enablement (trade shows, distributors).
**Sources:** content `03-products/00-catalog-pdf-h1-2026.md`

### F4.10 Product Videos
**Phase 2 · P2 · All visitors**
**Description:** YouTube/Vimeo embeds on PDPs and brand pages (unboxings/reviews).
**Technical functions:** Lazy, privacy-enhanced embeds; responsive aspect ratios; no autoplay-with-sound.
**Non-technical functions:** Engagement; competitor parity.
**Sources:** RFP-FR-8.5.4

### F4.11 Reserved Product Families (Trigger-Gated)
**Phase 2–3 · Reserved · PM**
**Description:** 18 reserved pages hidden until business trigger: Server/ECC memory, Enterprise SSD, Rugged Portable SSD, Encrypted Portable SSD, Card Reader, Data Center, OC Records, Ambassadors, RGB SDK, Roadmap, Storage Toolbox, Investor Relations, etc.
**Technical functions:** `status: reserved` Strapi entries — hidden from nav, excluded from sitemap, URL 404s until activation; activation = CMS action triggering ISR rebuild + sitemap regen.
**Non-technical functions:** Future-line readiness without broken links (BR-11.3-style governance).
**Sources:** BRD §35A; content `-reserved` files

---

## Category 5 — System Compatibility Finder (Flagship Tool)

### F5.1 Search by Laptop/Desktop Model
**Phase 1 MVP (top 100 devices) → Phase 2 (500+) · P0 · Upgraders/gamers (Aisha/Rahul)**
**Description:** The #1 competitive-gap feature: brand dropdown (Dell, HP, Lenovo, ASUS, Acer, Apple, MSI — no free text) + model input with auto-suggest; returns grouped "Compatible RAM"/"Compatible SSD" results. *(Externally validated benchmark: Kingston's homepage "Search by System/Device" is the pattern this emulates.)*
**Technical functions:**
- Auto-suggest after 2 chars (<100ms/keystroke, `device_typeahead` index); results without page reload; results <2s (BR-2.4)
- Each result: image, name, key specs, View Product link; **device info card** (max capacity, max speed, slots, supported types)
- No-result states (model not found → manual inquiry; no compatible products → support contact); mobile-native inputs
- SEO landing pages targeting "[model] RAM upgrade" queries with below-fold explanatory content
- Compatibility scoring formula (Phase 2 spec): QVL rank×20 (max 100) + speed match 30 + capacity 20 + dual-channel 10 + XMP/EXPO 5+5
**Non-technical functions:** Removes purchase hesitation and returns; captures high-intent SEO traffic (compatibility searches 500→5,000/mo KPI); serves the largest visitor persona (laptop upgraders).
**Sources:** URD UR-2.1, UC-6, §21.5, §26.1; BRD Epic 2; RFP-FR-8.2.1; Phase-2 spec `O/`; kingston.com benchmark

### F5.2 Search by Motherboard (QVL)
**Phase 1–2 · P1 · Builders/integrators**
**Description:** Motherboard brand+model search with QVL status badges: **"QVL Verified" / "Tested by TwinMOS" / "Not Verified"** (6-level hierarchy in Phase 2: Certified/Tested/Reported-Working/Spec-Compatible/Reported-Issue/Not-Compatible) — "Not Verified ≠ Incompatible" messaging (BR-2.2).
**Technical functions:** Supported speeds/max capacity display; XMP 3.0/EXPO badges; link to manufacturer's QVL page (new tab); tab switcher "By Laptop/Desktop" / "By Motherboard"; SSD compatibility by interface/form factor (RFP-FR-8.2.2).
**Non-technical functions:** Enthusiast/integrator trust (Kumar persona); lab-verified data only (BR-2.1).
**Sources:** URD UR-2.2, UC-7; RFP-FR-8.2.3/8.2.4

### F5.3 "Compatible Systems" Tab on PDP
**Phase 1–2 · P1 · All visitors**
**Description:** Per-product list of verified motherboards/devices with verified speed.
**Technical functions:** Pagination/virtual scroll for 50+ items; search-within-list; last-verified date display.
**Non-technical functions:** Purchase confidence; reduces compatibility returns.
**Sources:** URD UR-2.3

### F5.4 Compatibility Data Pipeline (QVL Ingest)
**Phase 1–2 · P0-data · PM/engineering**
**Description:** Four-source ingest: internal QA lab (top-100 Phase 1), manufacturing monthly CSV (top-500 Phase 2), customer submissions (moderated), quarterly vendor-QVL scrapes (ASUS/MSI/GIGABYTE/Lenovo/Dell/HP). ~5,000 initial records, +2,000/yr.
**Technical functions:** CSV batch upload with template/validation/error reporting; validation rules (SKU existence, normalized device names, enum statuses, tested_speed ∈ SKU speeds, duplicate detection); `findOrCreateDevice` normalization; ingest job records + Slack notifications; source-authority hierarchy + dedup decision matrix; incremental/full re-index triggers; crowdsourced/community submission feature (R-04 mitigation); quarterly updates.
**Non-technical functions:** Sustains the finder's accuracy moat; lab verification governance (BR-2.1); device max from manufacturer specs (BR-2.3).
**Sources:** Tech Stack §QVL; Phase-2 QVL ingest spec; BRD §29 R-04

---

## Category 6 — Where to Buy & Channel Sales Enablement

### F6.1 Retailer / Distributor Locator
**Phase 1 · P0 · Consumers; channel team**
**Description:** Interactive map + list of authorized retailers/distributors by country.
**Technical functions:**
- **IP-geolocation auto-detect** via Cloudflare `cf-ipcountry` with visible "Detected: X — Not correct? Change" override (VPN misdetection handled)
- **Leaflet + OpenStreetMap** (SOW-locked; MapLibre GL vector tiles optional Phase 2) with pin clustering, popup cards (name, address, phone, website, distance); OSM tiles cached at edge 24h; static `world-map.png` fallback → list fallback (graceful degradation)
- List/map toggle; sort by distance (with permission) or alphabetically; filter by retailer type (Online Store / Physical Store / Distributor / System Builder); per-retailer product-category tags; "Get Directions" deep link; map <3.0s load; mobile gesture-friendly; featured/verified regional distributors highlighted
- Channel pages: `/where-to-buy/{online|physical-stores|distributors|system-builders}`; retailer detail template; no-retailer state → distributor inquiry CTA
**Non-technical functions:** Bridges discovery→purchase (the core conversion path); showcases network strength (BO-03); authorized-partners-only rule (BR-3.1) with quarterly data review (BR-3.2) and grey-market exclusion (BR-3.4); named partners require written TwinMOS confirmation (post-remediation rule).
**Sources:** URD UR-3.1, UC-8, §21.6; RFP-FR-8.3.x; SOW §4.2

### F6.2 "Buy Online" Deep Links
**Phase 1 (links) / Phase 2 (affiliate) · P1 · Consumers**
**Description:** Retailer logos with deep links to partner **product pages** (never homepages), opening in new tab; country-aware (India → Amazon.in/Flipkart; UAE → local); "Out of stock"/"Not available online in your country" messaging.
**Technical functions:** Country-aware retailer resolution; new-tab links; affiliate tracking parameters Phase 2; only live-verified marketplaces shown by default (Amazon.ae, Newegg verified 2026-09; others "verify before publish").
**Non-technical functions:** Routes buyers to legitimate channels; protects against grey market; Where-to-Buy click-through conversion tracking.
**Sources:** URD UR-3.2; Forensic Audit Iteration 2

### F6.3 Become-a-Distributor Inquiry Form
**Phase 1 · P0 · Prospective partners (Mr. Patel persona); sales**
**Description:** Application form (footer, `/partners/`, `/where-to-buy/`): Company Name, Country, Contact Name, Email, Phone, Website (optional), Years in Business, Current Brands Distributed, Estimated Monthly Volume, Message.
**Technical functions:** Real-time email validation; submit disabled until valid; invisible reCAPTCHA/Turnstile; notification to sales@twinmos.com + regional manager; auto-reply email (48h SLA promise); DB storage with status tracking (New/Contacted/Qualified/Rejected).
**Non-technical functions:** Channel recruitment funnel (KPI 20–25 inquiries/quarter at 12 months; $200K–$1M/yr incremental distributor revenue).
**Sources:** URD UR-3.3, UC-9; BRD US-3.3; RFP-FR-8.3.6

---

## Category 7 — Lead Generation, Contact & Forms Platform

### F7.1 Contact Hub & 9 Typed Inquiry Forms (15–17 Form Types Total)
**Phase 1 · P0 · All visitors; sales/support**
**Description:** `/contact/` hub + typed pages and forms: General, Sales, Technical Support, Distributor, OEM/ODM, **Bulk/Enterprise Quote Request**, Media, Warranty, Feedback (+ form-success template). Offices directory (Dubai DAFZA, Taipei, Cologne, San Jose, Dongguan).
**Technical functions:**
- Reusable form library: **react-hook-form + Zod dual-side validation** (forms ADR), Turnstile + honeypot anti-spam, RFC 9457 error envelopes
- Validation timing (on-blur / on-input / on-submit / on-file-select); field rules (Name 2–100, Email RFC 5322, Phone E.164, Message 10–5000, Serial per product format, Purchase Date bounds, Quantity ≤1,000,000, files ≤10MB PDF/DOC/XLS/PNG/JPG); **4-level password strength indicator (Weak/Fair/Good/Strong, URD §30.5)**; accessible errors (aria-live, aria-describedby, scroll-to-first-error, red border #FF1744, valid input preserved)
- Routing by subject/type to appropriate mailbox; FormSubmission entity (type, status new→assigned→in_progress→resolved→closed, priority, ticket number, assignment); localStorage drafts every 5s; form-session timeout — **10-minute inactivity warning (URD §21.9) / 30-minute session cap (Tech Stack, Roadmap Ph.6 — figures differ by source, implement the stricter UX)**; double-submission prevention; 10/min/IP rate limit
- **SLA automation:** auto-reply ≤5 min with ticket number (BR-4.1); sales 24 business hours (BR-4.2); support 48 hours (BR-4.3); distributor 48 hours (BR-4.4)
- Upload security: MIME/magic-byte verification, 10MB cap, ClamAV scan
**Non-technical functions:** Converts previously wasted traffic into qualified leads (target 100+ leads/mo at 6 months, ~$500 avg value, ~$600K/yr); zero inquiries lost; expectation-setting via SLAs.
**Sources:** URD UR-4.1, UC-10, §21.9, §30; BRD Epic 4; RFP §4.2.14; content `13-contact/`

### F7.2 Bulk / Enterprise Quote Request
**Phase 1 · P0 · Enterprise/SI buyers (Sarah/Kumar)**
**Description:** Quote form with company/contact/email/phone/country/product interest/quantity/target price (optional)/delivery timeline/message + **RFP/RFQ document upload** (≤10MB).
**Technical functions:** File upload with validation; high-priority routing flag to sales@; 24-business-hour auto-reply.
**Non-technical functions:** B2B revenue enabler; the Phase 1–2 substitute for e-commerce cart (constraint C-02: lead-gen focus).
**Sources:** URD UR-4.2, UC-11

### F7.3 Newsletter Subscription (Lifecycle)
**Phase 1 · P0/P1 · All visitors; marketing**
**Description:** Footer (every page) + news pages + dedicated landing page: signup → confirm → unsubscribe lifecycle.
**Technical functions:** Minimal fields (Email + optional Country + Product Interests); **double opt-in** (BR-4.5); one-click unsubscribe (RFC 8058) in every email, no login; GDPR consent checkbox (unchecked default EU); Resend (P1) / Mailchimp/SendGrid (P2) integration; preference management; NewsletterSubscriber entity with consent storage.
**Non-technical functions:** List growth 200→1,000/mo; GDPR/CAN-SPAM/UAE/India compliance (BR-15.4, BR-GLOBAL-10).
**Sources:** URD UR-4.3, UC-12, UR-15.1; content `15-marketing/01-03-*.md`

### F7.4 Live Chat Widget
**Phase 1 (basic widget/rules-based) → Phase 2 (Chatwoot full) · P2 · All visitors; support agents**
**Description:** Bottom-right widget on all pages; online/offline status; business hours (Dubai timezone, Sun–Thu 9AM–6PM GST).
**Technical functions:**
- **Chatwoot OSS self-hosted** (Phase 12): country-based agent routing, queue display with expected wait, canned responses, chat-to-ticket, visitor context pane (page, country, browser, history) with sensitive-data masking; transcripts emailed; consent-aware + per-locale widget; lazy-loaded (~10KB)
- Offline capture (Name, Email, Message) with 24-h SLA auto-reply; dismissible; no auto-open/sounds (accessibility)
**Non-technical functions:** Immediate assistance; lead capture; deflects simple pre-sales questions. Advanced conversational AI explicitly out of scope Phase 1.
**Sources:** URD UR-4.4, UC-25; BRD US-4.4; RFP §4.3/FR-8.4.7; Phase-12 spec

### F7.5 Office Locations Directory
**Phase 1 · P1 · All visitors**
**Description:** 5 verified offices with addresses, phones, emails; office detail pages (Dubai HQ DAFZA, Taipei).
**Technical functions:** LocalBusiness schema; map embeds.
**Non-technical functions:** Trust and contactability; replaces fabricated office lists (remediation).
**Sources:** content `13-contact/11-13-*.md`

---

## Category 8 — Support & Customer Self-Service (69 pages)

### F8.1 Support Center Landing
**Phase 1 · P0 · Product owners**
**Description:** Hub with prominent search ("Search help articles…"), 6 category cards (Warranty, RMA, Firmware, KB, Installation Guides, Contact), quick links (most-viewed articles, popular FAQs), contact CTA.
**Technical functions:** Support-scoped MeiliSearch (kb_articles index); card grid CMS-managed.
**Non-technical functions:** Self-service deflection entry (30% support-email reduction in 6 months, BO-07).
**Sources:** URD §21.8; content `07-support/`

### F8.2 Warranty Registration
**Phase 1 · P1 · Product owners**
**Description:** Register products: Product dropdown/search, Serial Number, Purchase Date, Retailer, optional receipt upload; confirmation email with expiration date + lookup link.
**Technical functions:**
- Real-time serial-format validation; date bounds (not future, not >2 years past); WarrantyRegistration entity with computed expiry + status (Active/Expired/Expiring Soon)
- Registered-products dashboard (for logged-in owners); lookup by email+serial; already-registered state with View Registration link; register-without-receipt flow with "upload within 30 days" note; certificate PDF generation
- Warranty terms per product line **CMS-driven** (BR-6.1/BR-6.5 — never hard-coded): reference = Lifetime DRAM, 5yr NVMe/flash/USB, 3yr SATA SSD, 1yr accessories
**Non-technical functions:** Activates warranty; builds registration DB (100→500/mo KPI); reduces disputes.
**Sources:** URD UR-6.1, UC-13; content `07-support/01-warranty/`

### F8.3 Warranty Lookup / Policy / By-Region / FAQ
**Phase 1 · P0 policy / P1 tools · Product owners**
**Description:** API-driven warranty lookup; per-region terms; full warranty policy page; warranty FAQ.
**Technical functions:** `/warranty/lookup` API; TBW tables; exclusions (crypto-mining, unauthorized repair, EOL products).
**Non-technical functions:** Transparency; EOL program alignment (3-month notice, EOL PDF).
**Sources:** RFP App. B `/support/`; content `07-support/01-warranty/`

### F8.4 RMA Portal (7–9 State Workflow)
**Phase 1 (data capture + tracker placeholder) → Phase 2 (full workflow) · P1 · Product owners; support**
**Description:** Return-merchandise authorization: form (Product, Serial, Purchase Date, Issue Description, optional photo/video ≤5MB) → automatic warranty-status check from serial ("Warranty Active — Expires [Date]") → **RMA number generated immediately** (e.g., RMA-2026-001234) → status tracking.
**Technical functions:**
- **State machine:** Submitted → Under Review → Approved → (Rejected branch) → Ship to TwinMOS → Received → Testing/In Repair → Replacement Shipped → Delivered → Closed. *(Source variance, preserved: URD lists a 7-state customer view; BRD labels 7 states as Submitted→Under Review→Approved→In Repair→Shipped→Delivered→Closed; the Phase-2 spec defines the full 9-state admin model. Implementation follows the Phase-2 spec.)*
- Email notification at every status change (Resend branded templates); customer status page `/support/rma/status?rma=...` with timeline + next-step guidance (data-leak prevention); admin list/detail/bulk actions; daily backup, 30-day retention; out-of-warranty path with paid-repair/replacement alternatives; RMA ops runbook (J.3)
**Non-technical functions:** Self-service replacement under warranty; support-ticket reduction 30%/6 months; expectation management.
**Sources:** URD UR-6.4, UC-14; SOW §2; Phase-2 RMA spec `O/`; content `07-support/02-rma/`

### F8.5 Firmware & Software Download Center
**Phase 2 (full center; serial-gated) · P1 · Product owners**
**Description:** Organized Category → Product Line → Model; each item: version, release date, file size, changelog, compatibility list.
**Technical functions:**
- **Serial-number validation gate before download** (anti-piracy, BR-6.3); copyable MD5/SHA256 checksums; data-backup warning banner; visible progress; resumable downloads for large files; "firmware up to date" state; admin upload interface; download logging for support tracking; compatibility matrix
**Non-technical functions:** Performance/security maintenance enabler; competitor parity; protects proprietary firmware.
**Sources:** URD UR-6.2, UC-27; Roadmap Ph.11; content `07-support/03-downloads/`

### F8.6 Manuals & Quick-Start Guide Downloads
**Phase 1 · P1 · Product owners**
**Description:** File library of manuals and quick-start guides; install-guide hub (5 step-by-step video+text guides with print stylesheet).
**Technical functions:** File library with filters; print stylesheet; video embeds with captions.
**Non-technical functions:** Onboarding confidence for non-technical upgraders (Aisha persona).
**Sources:** RFP-FR-8.4.5; content `07-support/03-downloads/`, `07-support/05-install-guides/`

### F8.7 Knowledge Base (30→50+ Articles)
**Phase 1 (30 seed) → Phase 2 (50+) · P1 · Public; support**
**Description:** Searchable KB with categories (Installation, Troubleshooting, Compatibility, Warranty, General); article template with related-articles sidebar and "Was this helpful?" rating; embedded video tutorials with captions; "Still need help?" CTA; no-results state.
**Technical functions:** MeiliSearch kb index; helpfulness ratings recorded to analytics; quarterly review flag (>90 days); HowTo/Article schema; feedback dashboard (Phase 11).
**Non-technical functions:** 30% support-email reduction (BO-07); SEO long-tail traffic.
**Sources:** URD UR-6.3, UC-15; BR-6.4; content `07-support/04-kb/` + `kb-articles/` (30 written)

### F8.8 FAQ System (8 Topic Sets)
**Phase 1 · P1 · Public**
**Description:** Accordion FAQs for Memory, SSD, Portable Storage, USB Flash, Warranty, RMA, Firmware, RGB.
**Technical functions:** Accessible accordion (Enter/Space/arrows); **FAQPage schema**; CMS-managed Q&A.
**Non-technical functions:** Fast answers (fixes live site's broken FAQ rendering).
**Sources:** content `07-support/faqs/`; Roadmap Ph.6

### F8.9 Support SLA Page & Contact Support
**Phase 1 · P0 · Public**
**Description:** Published response-time SLAs; categorized contact-support form.
**Technical functions:** SLA content page wired to the same routing/notification pipeline as F7.1.
**Non-technical functions:** Expectation management; trust (48-business-hour support SLA).
**Sources:** RFP App. B; content `07-support/19-21-*.md`

---

## Category 9 — Anti-Counterfeit & Product Authentication

### F9.1 SN-Check (Serial Verification)
**Phase 2 · P2 (strategic) · Consumers (Aisha), integrators, distributors**
**Description:** `/support/sn-check/` — single serial input + optional product family; three results: **VERIFIED GENUINE** (optional warranty status) / **SERIAL NOT FOUND** / **SUSPECTED COUNTERFEIT** (→ report form).
**Technical functions:**
- `valid_serials` collection (1M+ capacity) with **daily manufacturing CSV ingest** + cron + monitoring dashboard; serial format TW-{PRODUCT_CODE}-{YYYYMM}-{8-digit}; endpoint `/api/v1/serial/check` ≤500ms; masked serial display (TW***4567)
- **Anti-enumeration:** rate limit 100 lookups/hour/IP (BR-17.1) + 5/min with Turnstile after 3; suspicious-pattern detection + activity alerting; privacy-preserving lookup logging for trend analysis
**Non-technical functions:** Brand protection in unregulated markets (a top-3 strategic threat); erodes counterfeit trust damage; linked from packaging + product pages.
**Sources:** URD UR-17.1, UC-45/46; BRD Epic 17; RFP-FR-16.1/16.4; Phase-10 spec

### F9.2 Counterfeit Reporting Workflow
**Phase 2 · P2 · Consumers; brand-protection team**
**Description:** Report form (contact info, serial, retailer, photos, description); immediate Brand Protection team notification; auto-reply with reference number; **5-business-day SLA** (BR-17.2); triage runbook.
**Technical functions:** Photo uploads; notification routing; reference-number generation; legal-review workflow with escalation.
**Non-technical functions:** Community-policing of the brand; evidence gathering.
**Sources:** RFP-FR-16.2; J.3 anti-counterfeit ops

### F9.3 Counterfeit Policy (Paired Pages)
**Phase 2 · P0 content · Public**
**Description:** Identical policy published at `/support/counterfeit-policy/` **and** `/legal/counterfeit-policy/` (BR-17.3), linked from PDPs + footer.
**Technical functions:** Paired-content pattern (single CMS source, two routes) to keep both URLs in sync.
**Non-technical functions:** Public deterrence; legal positioning.
**Sources:** RFP-FR-16.3

---

## Category 10 — Gaming Hub (VOLTX Brand)

### F10.1 VOLTX Immersive Landing
**Phase 1 · P1 · Gamers/builders (Rahul)**
**Description:** Dark-themed hub (palette #0D0D0D surfaces + neon cyan/magenta/purple, animated RGB gradient 8s loop) with hero video/animation, VOLTX + VOLTX RGB product grid with glow/scale hover, link to gaming news/community, "Explore Products" CTA.
**Technical functions:**
- Hero video lazy/compressed (BR-8.1); slow-connection fallback (static hero + Play Video); mobile simplified (GIF/static); video must not block interactivity
- **Animation safety rules:** no flashing >3Hz (seizure), `prefers-reduced-motion` respected, no autoplay-with-sound, heavy animations pause on `visibilitychange`, RGB glow CSS-only preferred, 60fps desktop
**Non-technical functions:** Differentiates VOLTX vs Corsair/G.Skill; shareable influencer content; brand-elevation strategy.
**Sources:** URD UR-8.1, UC-18, §21.7, §24.5; RFP-FR-8.7.1; content `05-gaming/`

### F10.2 RGB Lighting Showcase & Visualizer
**Phase 2 · P2 · Gamers**
**Description:** Interactive module visualization with presets (**Static, Breathing, Rainbow, Wave, Pulse**); sync-compatibility badges: **ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light, ASRock Polychrome** (with tooltips); embedded real-build video demos.
**Technical functions:**
- Phase-2 upgrade spec: **WebGL Three.js GLTF module render**, per-LED animation, motherboard sync simulation, 35KB budget; mobile/low-power → swipeable carousel fallback; CSS fallback per pre-mortem cut order (Category 33.3)
**Non-technical functions:** Configurability storytelling pre-purchase; ecosystem-compatibility reassurance.
**Sources:** URD UR-8.2, UC-23; RFP-FR-8.7.2; Phase-2 RGB spec; Roadmap Ph.12

### F10.3 Build Gallery & Submission (UGC)
**Phase 3 · P3 · Community; moderator**
**Description:** Community build showcase: submission form (Name, Location, Build Specs, ≤5 photos @5MB), **"Pending Moderation"** message, admin moderation queue before publication (BR-8.2), rejection email with feedback, filterable approved-builds grid (filter by product), per-build social sharing + OG tags, report/flag.
**Technical functions:** 5-step progressive-disclosure form (React Hook Form + Zod); upload pipeline (client pre-process → server process → post-approval storage, quotas); build-submission entity + BuildPhoto + RejectionReason; `build_gallery` MeiliSearch index; submission state machine with SLAs.
**Non-technical functions:** Community engagement; authentic social proof; UGC content engine.
**Sources:** URD UR-8.3, UC-22/UC-30; Phase-2/3 build submission spec; content `05-gaming/07-08-*.md`

### F10.4 Overclocking Hub (XMP/EXPO)
**Phase 2 · P2 · Enthusiasts**
**Description:** XMP 3.0 / EXPO profile details, OC potential; **Overclocking Records page reserved P3**.
**Technical functions:** Profile tables per SKU; cross-links to PDP spec tabs; reserved-page gating for the records page.
**Non-technical functions:** Enthusiast credibility; performance positioning.
**Sources:** RFP-FR-8.7.5; content `05-gaming/06-overclocking.md`

### F10.5 Gaming Extras
**Phase 2–3 · P2/P3 · Gamers**
**Description:** VOLTX-vs-competitor spec comparison table; social proof (review quotes, verified awards, influencer mentions); wallpapers downloads; esports sponsorships (roster/team profiles); Ambassador Program (reserved); RGB Software download (reserved); gaming news feed.
**Technical functions:** Wallpapers as 400×225 WebP+JPG; news feed filter from news collection; reserved-page gating for ambassador/RGB-SDK pages.
**Non-technical functions:** Fandom building; repeat visits.
**Sources:** URD §21.7; content `05-gaming/09-13-*.md`

---

## Category 11 — Solutions & Vertical Use Cases

### F11.1 Solutions Hub
**Phase 1 · P1 · B2B buyers (Faisal, Ms. Tan, Mr. Rahman, Sarah)**
**Description:** `/solutions/` hub with vertical tiles (industry icon, name, one-line value prop) for 7 active verticals: **Gaming Enthusiast, Content Creation, System Builders, Enterprise SMB, Education, Embedded/Industrial, Telco/BFSI/Government**; Data Center reserved P3. Load <1.5s.
**Technical functions:** Tile grid CMS-driven; reserved verticals hidden until activated (BR-11.3).
**Non-technical functions:** Shortcuts B2B discovery by industry (mirrors Kingston/ADATA patterns); positions TwinMOS beyond commodity retail.
**Sources:** URD UR-11.1, UC-33; RFP-FR-9.1–9.9; content `04-solutions/`

### F11.2 Vertical Solution Pages
**Phase 1 · P1 · B2B buyers**
**Description:** Per-vertical pages with industry context, recommended product bundles, vertical-relevant certification highlights (FCC/RoHS/EAC telco; BIS India; JEDEC embedded; −40°C to 85°C / 20G vibration industrial), case-study links, contact CTA.
**Technical functions:** Bundle cross-links to real SKU pages (no orphan links); **rule BR-11.1: ≥3 specific SKUs per page**.
**Non-technical functions:** Speaks buyer language (Win10-EOL refresh for enterprise; durability for embedded).
**Sources:** URD UR-11.1, UC-34; content `04-solutions/02-09-*.md`

### F11.3 Case Studies Hub & Template
**Phase 1 · P1 · B2B buyers; marketing**
**Description:** Case studies filterable by vertical, region, product family; template: customer profile (At-a-Glance), challenge, TwinMOS solution, products deployed, metrics, customer quote, downloadable PDF.
**Technical functions:** Filter facets; PDF download; **signed customer release required before publication (BR-11.2)**; anonymized/illustrative stories until releases exist.
**Non-technical functions:** Proof of deployment; sales-enablement asset.
**Sources:** URD UR-11.2; RFP-FR-9.10; content `04-solutions/10-11-*.md`

---

## Category 12 — Technology, R&D & Innovation

### F12.1 Technology Hub
**Phase 1 · P1 · Technical evaluators, distributors, analysts**
**Description:** `/technology/` hub with rich-content sub-pages: R&D Philosophy, DRAM Technology, NAND Flash, Controller, Thermal Management, Power Management, Data Security, Data Integrity, PCIe Gen 5 Deep-Dive, JEDEC Compliance.
**Technical functions:** Diagrams, code blocks, benchmark tables, embedded videos; cross-links to products and Learn Hub; SEO-optimized for technical queries; **engineering-reviewed content (BR-12.1)**.
**Non-technical functions:** Engineering credibility for B2B partner recruitment and enterprise due diligence.
**Sources:** URD UR-12.1, UC-35; RFP-FR-10.x; content `06-technology/`

### F12.2 Whitepapers Hub
**Phase 1 (open) → Phase 2 (gated) · P1 · Technical evaluators**
**Description:** Whitepapers with title, abstract, author, publish date, PDF download; **optional email+company gating Phase 2** with emailed link and tracking dashboard.
**Technical functions:** Gated-download lead capture; per-whitepaper download events in analytics; hero A/B framework (Phase 12); legal review for forward-looking statements (BR-12.2).
**Non-technical functions:** Thought leadership; lead generation for B2B funnel.
**Sources:** URD UR-12.2, UC-36; content `06-technology/14-whitepapers.md`

### F12.3 Patents Page & Reserved Roadmap
**Phase 2 · P2 · Public**
**Description:** Patents: number, title, jurisdiction, status, filing date, optional USPTO/EPO/CNIPA links; quarterly updates (BR-12.3). Product Roadmap page reserved P3 behind executive approval (BR-12.4).
**Technical functions:** Patents CMS collection with jurisdiction/status enums; external-link management; reserved-page gating for the roadmap page.
**Non-technical functions:** Innovation proof-point.
**Sources:** URD UR-12.3; content `06-technology/12-13-*.md`

---

## Category 13 — Learn / Knowledge Hub (64 entries — largest section)

### F13.1 Buying Guide Hub (18 Guides)
**Phase 1 · P1 · Upgraders/gamers (Aisha/Rahul) — top-of-funnel SEO engine**
**Description:** Named guides: How to Choose RAM/SSD, NVMe vs SATA, PCIe Gen 3 vs 4 vs 5, SO-DIMM vs UDIMM, Portable SSD vs External HDD, RGB RAM Buyer's Guide, Best RAM/SSD for Gaming/Content/Laptops, Build Guides (Budget/Mid/Flagship), System Builder Procurement Guide, Enterprise Fleet Upgrade Guide, DDR4 vs DDR5.
**Technical functions:** Sidebar CTA cross-links to TwinMOS products; 2,500–4,000-word depth minimums (SEO spec); quarterly model refresh (BR-13.2).
**Non-technical functions:** "Primary organic-traffic engine" — organic share 10%→50% of 50K sessions/mo target; educates before purchase.
**Sources:** URD UR-13.1; RFP-FR-11.1–11.3; content `08-learn/02-buying-guide/`

### F13.2 "Explained" Hub (29–30 Explainers)
**Phase 1 · P1 · Learners**
**Description:** Plain-language articles (What-is DDR/DDR3/4/5, XMP, EXPO, NVMe, PCIe, SATA, 3D TLC NAND, DRAM cache, HMB, TRIM, wear leveling, SMART, RGB sync, graphene heatsink, ECC, 2280, MTBF, power-loss protection, timings/latency/bandwidth, PMIC, on-die ECC…) with optional "deep dive" expandable sections.
**Technical functions:** Expandable sections; bidirectional glossary term links (BR-13.4).
**Non-technical functions:** Democratizes tech specs for non-technical buyers; glossary parity with live-site attribute terms.
**Sources:** URD UR-13.2; content `08-learn/03-explained/`

### F13.3 Benchmarks Hub
**Phase 1 · P1 · Enthusiasts/press**
**Description:** Benchmark articles (CoreX Pro vs Competitors, VOLTX RGB vs Competitors, Real-World Gaming, Content Creation) with **mandatory methodology disclosure** (test rig, runs — BR-13.3), results tables, charts, conclusions.
**Technical functions:** Comparison tables; charts; Article schema.
**Non-technical functions:** Evidence-based performance claims; press/influencer source material.
**Sources:** URD UR-13.3; content `08-learn/05-benchmarks/`

### F13.4 Glossary (A–Z)
**Phase 1 · P1 · All learners**
**Description:** Alphabetical glossary; each term links to its Explained article; site-wide terminology consistency (BR-13.4).
**Technical functions:** Alphabet navigation; term cross-linking.
**Non-technical functions:** SEO internal-linking mesh; consistent vocabulary across site.
**Sources:** content `08-learn/06-glossary.md`

### F13.5 Stories & Blog
**Phase 1–2 · P1/P2 · Public**
**Description:** Stories hub + blog with consistent cadence (target 2 posts/week), categories (Launch Posts, Event Recaps, Industry Analysis), author byline + date on every post (BR-13.5); PM accuracy review (BR-13.1).
**Technical functions:** Blog templates; NewsArticle/Article schema; dated slug convention.
**Non-technical functions:** Freshness/SEO momentum signal to distributors and search engines.
**Sources:** URD UR-13.5; content `08-learn/07-09-*.md`

---

## Category 14 — News, Events, PR & Media

### F14.1 News Hub & Article System
**Phase 1 · P0 · Public; media**
**Description:** Reverse-chronological news feed with **6 category filters** (Product Launch, Event, Award, Partnership, Press Release, Company News); cards (image, title, 2-line excerpt, date, category tag); article page with author, publish date, category, featured image, body, social sharing, related articles, lightbox images, responsive YouTube/Vimeo embeds; article page <2s.
**Technical functions:**
- Rich-text editor (image upload, video embed, headings); metadata (title, slug, excerpt, author, date, category, tags, featured image); scheduling; preview; SEO fields per article
- **Press-boilerplate enforced on press releases (BR-5.4)** with FOR IMMEDIATE RELEASE structure, exec quote, "About TwinMOS" boilerplate, the traditional three-hash end marker, PDF download CTA
- CMS **two-person review rule (BR-5.1)**; 48-hour publish guideline (BR-5.2); WebP with JPEG fallback (BR-5.3); NewsArticle schema; ISR 60s revalidation
**Non-technical functions:** Freshness/SEO (+200% organic YoY); momentum signal to distributors/investors; replaces 2011–2026 mixed blog archive with curated hub.
**Sources:** URD UR-5.1, UC-20, §21.11; content `10-news-events/`

### F14.2 Event Pages & Archive
**Phase 1 · P1 · Public; partners**
**Description:** Event template: name, date, location, booth number (e.g., COMPUTEX 2025 booth I1431), description, status lifecycle (Upcoming/Ongoing/Completed/Cancelled/Postponed), lightbox photo gallery, non-autoplay video embeds, product showcase links, "Schedule a Meeting"/"Contact us at the event" CTA, chronological past-events archive.
**Technical functions:** Event schema; reserved placeholders for unconfirmed events (COMPUTEX 2026, GITEX, CES, CEBIT MEA, Saudi Tech — hidden until participation confirmed); booth CTA mailto.
**Non-technical functions:** Trade-show presence amplification; pre-show meeting booking.
**Sources:** URD UR-5.2; RFP-FR-8.5.2; content `10-news-events/`

### F14.3 Media Coverage Hub & Newsletter Archive
**Phase 1–2 · P1/P2 · Media/analysts**
**Description:** "In the news" external-mentions hub; newsletter archive of past issues.
**Technical functions:** Curated external-link collection (CMS-managed, rel/target hygiene); archive listing of sent campaigns.
**Non-technical functions:** Third-party validation; press self-service.
**Sources:** RFP-FR-18.5/18.6; content `10-news-events/23-24-*.md`

---

## Category 15 — Careers

### F15.1 Careers Hub & Job Listings
**Phase 1 · P1 · Job applicants (Sara persona — 60% mobile); HR**
**Description:** Job listings filtered by location, department, level; role page (title, location, department, summary, full description, requirements, Apply CTA); auto-archive when filled; "role filled mid-application" graceful state; **mandatory salary band where legally required + equal-opportunity statement (BR-14.1)**.
**Technical functions:** JobListing entity + filters; **JobPosting schema**; archive automation.
**Non-technical functions:** Talent attraction (Company Profile §12 strategy).
**Sources:** URD UR-14.1, UC-40; RFP-FR-13.x; content `12-careers/`

### F15.2 Job Application Form
**Phase 1 · P1 · Applicants; HR**
**Description:** Multi-step application with "Step X of Y" progress indicator; CV upload (PDF/DOC ≤10MB); GDPR Art. 13 consent checkbox + Job Applicant Privacy Notice link (EU: submit disabled without consent); auto-confirmation email with reference number; optional job-alerts subscription; **24-month data retention with auto-purge (BR-14.3)**.
**Technical functions:** Multi-step wizard; upload validation; ATS routing or CMS storage; consent logging.
**Non-technical functions:** Compliant hiring funnel; candidate experience.
**Sources:** URD UR-14.2, §33.4; content `12-careers/07-application-form.md`

### F15.3 Employer-Brand Pages
**Phase 1 · P1 · Candidates**
**Description:** Life at TwinMOS (culture, photos, testimonials **with signed releases** BR-14.2), Benefits, Locations (Taipei/Dubai/Cologne/San Jose maps), Departments, Internships, Careers FAQ.
**Technical functions:** CMS templates; map embeds; consent-gated testimonial publishing; FAQ accordion reuse.
**Non-technical functions:** Employer branding; reduces drop-off.
**Sources:** URD UR-14.3; content `12-careers/02-06,10-*.md`

---

## Category 16 — Marketing Programs & Campaigns

### F16.1 Newsletter Lifecycle Pages
**Phase 1 · P0/P1 · Subscribers; marketing**
**Description:** Signup landing → Confirm (double opt-in) → Unsubscribe (one-click, no login); GDPR/CAN-SPAM/UAE/India compliant.
**Technical functions:** Landing/confirm/unsubscribe routes; consent storage; Resend/Mailchimp integration.
**Non-technical functions:** List growth (200→1,000/mo); legal compliance.
**Sources:** URD UR-15.1; content `15-marketing/01-03-*.md`

### F16.2 Promotions Hub
**Phase 1 · P1 · Consumers; channel**
**Description:** Each promotion: title, eligible products, terms, start/end dates, CTA, redeem mechanics, regional restrictions (e.g., India-only); bundle deals, back-to-school, gamer upgrade month, tiered distributor rebates.
**Technical functions:** **Geo-targeting per promotion**; auto-archive of expired promos (BR-15.1).
**Non-technical functions:** Price-promotion coordination with channel; urgency drivers.
**Sources:** URD UR-15.2; content `15-marketing/04-05-*.md`

### F16.3 Launch Campaign Microsites
**Phase 1 · P1 · Gamers/press**
**Description:** Campaign landing pages (CoreX Pro, VOLTX RGB): hero, story, product showcase, technical highlights, where-to-buy, social sharing; competitive positioning vs Crucial T705 / Samsung 990 Pro / WD SN850X.
**Technical functions:** Reusable campaign template (`LayoutHero` family); CMS-managed showcase blocks; share/OG tags.
**Non-technical functions:** Flagship launch moments; cross-channel campaign anchors.
**Sources:** URD UR-15.3; content `15-marketing/07-08-*.md`

### F16.4 Cross-Sell Banners & Exit-Intent Popup
**Phase 2 · P2 · Visitors**
**Description:** CMS-managed cross-sell banners configurable per page-type; exit-intent popup (newsletter capture or promo CTA); ≤1/session frequency; **dismissal cookied ≥24h (BR-15.2)**.
**Technical functions:** Page-type banner slots; exit-intent detection; cookie-gated frequency; consent-aware.
**Non-technical functions:** Conversion-rate optimization; list growth without annoyance.
**Sources:** URD UR-15.4; content `15-marketing/09-10-*.md`

### F16.5 Loyalty, Referral & MDF Programs (Reserved → Phase 15)
**Phase 15 (MDF pre-claim from Phase 10) · P3 · Customers; partners**
**Description:** Placeholder-only pages until legal/KYC/finance gates clear (BR-15.3, BR-18.4), then full activation in Phase 15 (**MDF pre-claim form + status tracking lands earlier, in Phase 10**):
- **Loyalty:** Bronze/Silver/Gold tiers (rolling-12-month points 0–999/1,000–4,999/5,000+), earn rates 1x/1.5x/2x, gaming-category bonuses +5%/+10%, free shipping at Gold, points for purchase/registration 50/profile 25/first purchase 100/birthday 50/referral 200≤50yr/review 30 P4/welcome 100; monthly tier evaluation (upgrade immediate, downgrade grace); redemption = discounts/free shipping/exclusive products; points engine + checkout integration; customer dashboard
- **Referral:** unique-code links, attribution window, minimum order value, referrer/referee rewards, reward hold period + confirmation job; referral dashboard (shares/clicks/conversions/rewards)
- **MDF:** partner eligibility/tiers, annual budget allocation + proration, utilization tracking, eligible-activity categories, **5-stage claim workflow** (submit→review→approve→fund→report) with SLA tracking and fund-tracking dashboard
**Technical functions:** Strapi tracking entities (ReferralCode/ReferralEvent, MDF claims); job-based confirmation workflows; legal-review gates.
**Non-technical functions:** Retention and channel-marketing co-op funding; distributor stickiness.
**Sources:** URD UR-18.4; P.3 Phase-3 commerce specs (Loyalty/Referral/MDF); Roadmap Ph.10 (MDF pre-claim) and Ph.15

---

## Category 17 — Channel Programs & Partner Portal

### F17.1 Program Application Forms (4 Programs)
**Phase 1–2 · P0/P1 · Prospective partners; sales**
**Description:** Tailored applications: **Become a Distributor (P0), Become a Reseller, OEM/ODM Program** (NDA-protected commercial path, engineering-support contact, custom-spec disclosure), **System Builder Program**; each routes to Sales high-priority; auto-reply ≤5 min; **48-business-hour review SLA (BR-18.1)**.
**Technical functions:** Form library reuse; CRM webhook lead creation; status tracking.
**Non-technical functions:** Channel recruitment funnel at scale (BO-03).
**Sources:** URD UR-18.1, UC-47; RFP-FR-17.1–17.4; content `09-partners/02-05-*.md`

### F17.2 Partner Playbook Pages
**Phase 1 · P1 · Partners**
**Description:** Distributor Benefits, Onboarding Process, Responsibilities, Success Stories (verified/illustrative only), **Partner Events Calendar, Partner Training Resources**.
**Technical functions:** CMS page templates; events calendar reuses Event entity filtered to partner-audience; verified-only publishing gate on success stories.
**Non-technical functions:** Partner expectation-setting; self-onboarding.
**Sources:** URD UR-18.2; content `09-partners/06-10,15-*.md`

### F17.3 Regional Distributor Hubs
**Phase 1 · P1 · Regional partners/buyers**
**Description:** MEA / Africa / CIS hubs with featured distributors, product availability, local promotions, regional-manager contact; **activate on partnership agreement (BR-18.2)**; inactive → generic placeholder (no broken links).
**Technical functions:** Hub templates with partnership-status flag gating content activation; placeholder fallback route.
**Non-technical functions:** Local network visibility; regional campaign anchor.
**Sources:** URD UR-18.3; content `09-partners/16-18-*.md`

### F17.4 Partner Portal — Authentication & Security
**Phase 2 · P2 · Authorized distributors (<1% of users)**
**Description:** `/partners/login/` — invitation-only (**no self-registration, BR-7.1**); visually distinct from public site (watermark, different header).
**Technical functions:**
- **Better Auth** (decision name; numbered ADR-015 in the D.5 registry): DB sessions with rotating `__Host-twinmos-session` cookies; **TOTP MFA** (mandatory for portal + admins) + recovery codes; optional WebAuthn passkeys; OAuth (Google/Microsoft); magic links
- Session timeout 30 min with warning at 25 min; lockout 30 min after 5 failed attempts; forgot-password email ≤2 min (reset link 24h; generic "if an account exists" message); JWT RS256 (1h access + rotating refresh with reuse detection)
- PartnerUser roles: viewer/marketing/procurement/admin; PartnerCompany entity (territory[], partner_type, status pending/approved/suspended, credit_limit, payment_terms); team invites; auth decision tree (§26.3)
**Non-technical functions:** Confidential access control for pricing/assets; partner data isolation (Partner A cannot see Partner B data — Phase 11 security audit gate).
**Sources:** URD UR-7.1, UC-16/UC-31; BRD §21.2; Phase-9/10 specs; D.5 ADR registry

### F17.5 Partner Portal — Marketing Asset Library
**Phase 2 · P2 · Distributor marketing managers**
**Description:** Organized library: Product Images, Banners (web+print), Datasheets, Videos, POS Materials (shelf talkers, display stands), Logos; filter by product, language, format.
**Technical functions:**
- Preview before download; **bulk ZIP download** (500MB cap guidance); per-user download history logged for audit; not-localized → English fallback; asset metadata schema; auth-only access
**Non-technical functions:** Co-branded local campaign enablement; ends manual asset distribution.
**Sources:** URD UR-7.2, UC-32; RFP-FR-8.6.2/8.6.4

### F17.6 Partner Portal — Price Lists (Watermarked)
**Phase 2 · P2 · Distributor procurement; finance**
**Description:** Login-gated price lists: SKU, Description, Unit Price, **MOQ, Volume Tier Pricing**; currency per distributor's registered region; effective date + revision history.
**Technical functions:**
- Excel/PDF download; **PDF watermarked per distributor** (partner name + date + confidential notice + session trace per BR-7.2) via Puppeteer + pdf-lib async generation (trigger → status check → download redirect); B2 temp storage; Finance→Sales Director publish workflow
- ERP-driven pricing sync (Phase 2); expired-list handling; role-based access denial
**Non-technical functions:** Margin/inventory planning; confidentiality (anti-leak deterrent).
**Sources:** URD UR-7.3, UC-17; Phase-2 watermarked-PDF spec

### F17.7 Partner Portal — Dashboard, Training & Events
**Phase 2 · P2 · Partners**
**Description:** `/partner/dashboard` with role-gated content; **training & certification module** (progress tracking, expiry notifications) at `/partner/portal/training/`; partner events calendar at `/portal/events/`; read-only order management (Phase 3); tier/points view (Phase 15); profile management; partner onboarding email sequence (Day 0/3/7/14/30 with UTM).
**Technical functions:** Role-gated dashboard widgets; training progress entities with expiry-notification cron; read-only order API view onto Medusa data (Phase 3).
**Non-technical functions:** Partner enablement and retention; portal adoption KPI (0→100+ users).
**Sources:** Phase-10 partner self-service; content `09-partners/09-15-*.md`

---

## Category 18 — Regionalization & Multilingual

### F18.1 Locale Architecture & Translations
**Phase 2–15 · P0 (switcher) · Regional visitors; localization vendor**
**Description:** 9-locale program: EN (launch) → **AR (full RTL) + HI** (Phase 2) → **RU + ZH-CN + FR** (Phase 3) → **ES + PT + DE** (Phase 15). (Bengali removed from scope 2026-09-23; some documents still cite a 10-locale incl.-BN plan.)
**Technical functions:**
- Strapi i18n plugin (per-locale draft/publish, translation status panel ✅/🟡/⬜, XLIFF export/import); Astro i18n routing with locale prefixes; ~3,500 static routes at full localization; builds <5min via Astro incremental
- Locale detection: `Accept-Language` → `twinmos_locale` cookie → EN; **no forced geo-redirect**
- Translation pipeline: external vendor ($3,000–8,000/locale; $18K–48K total) with CAT tools (memoQ/Trados/Smartcat/Crowdin), 200+ term technical glossary (TBX), translation memory (TMX), native translate → different native reviewer → Marketing approval → staging → production; optional AI pre-translation (5–10× speedup) with mandatory human review
- RTL framework: `dir="rtl"`, mirrored layouts, Noto Sans Arabic, LTR fragments for codes/numbers; locale-aware dates/numbers/currency formatting; per-locale fonts (Noto Sans family; Inter+Cyrillic), ≤80KB/locale
**Non-technical functions:** Native-market access (BO-08); brand respect in Arabic/Hindi markets; cultural adaptation per region (register, imagery, color symbolism, compliance marks).
**Sources:** URD UR-9.1, UC-19; SOW Decision 5A; F.4 Localization; Forensic Audit (BN removal)

### F18.2 Region Auto-Detection & 27 Country Landing Pages
**Phase 1 (detect) / Phase 1 (pages) · P0/P1 · Regional visitors**
**Description:** IP-based country detection with manual override; welcome banner ("Welcome — Nigeria. View regional content?"); **27 country/region landing pages** (UAE-GCC, India, Pakistan, Saudi Arabia, Qatar, Egypt, Morocco, Algeria, South Africa, Nigeria, Kenya, Ghana, Ethiopia, Angola, Libya, Cameroon, Namibia, Rwanda, Senegal, Botswana–Lesotho, Russia–CIS, Europe, UK, Southeast Asia, Hong Kong, Taiwan, North America) showing verified local distributors, local pricing references, local certifications (BIS India, NCC Nigeria, EAC), regional news/events, regional contact. *(Count variance noted: RFP-FR-12.3 cites 27 country pages; the content folder holds a regions hub + 28 files — the extra file is the hub; BD was removed. Treated as 27 market pages + hub.)*
**Technical functions:**
- `cf-ipcountry` header; localStorage country persistence; LocalBusiness schema per page; hreflang across variants; countries outside list → global content + "Find a distributor"; currency **informational-only** with disclaimer until Phase 3 (BR-9.3)
- Post-remediation governance: **no named local distributors without written TwinMOS confirmation**; only live-verified marketplace links
**Non-technical functions:** Local relevance at scale (India page target: top-5 country page, 1,000→8,000 views/mo); regional campaign landing surface.
**Sources:** URD UR-9.2, UC-24, UC-50; RFP-FR-12.3/12.5; content `11-regional/`

### F18.3 Regional Network & Content Adaptation
**Phase 1–3 · P1 · Emerging-market visitors**
**Description:** Regional network adaptation — aggressive lazy-loading for India Tier 2/3 networks; lightweight minimal-JS pages for Africa; CDN edge caching with documented KSA data-residency transfer impact.
**Technical functions:** Adaptive asset strategies keyed to locale/region; edge cache rules; documented transfer-impact assessment for KSA.
**Non-technical functions:** Serves price-sensitive, bandwidth-constrained core markets (MEA/South Asia = TwinMOS strongholds).
**Sources:** URD §7.3; Tech Stack data-residency section

---

## Category 19 — User Accounts & Personalization

### F19.1 Registered Product Owner Account (Light Auth)
**Phase 1–2 · P1 · Product owners (5–8% of traffic)**
**Description:** Email-based light authentication unlocking warranty registration, RMA submission, firmware downloads, and a registered-products dashboard (status Active/Expired/Expiring Soon); **no full consumer account system in Phases 1–2** (e-commerce customer accounts arrive Phase 3).
**Technical functions:** Better Auth foundation (Phase 2); HTTP-only cookie JWT sessions; warranty lookup by email+serial; ticket-status tracking via email links.
**Non-technical functions:** Friction-minimal after-sales self-service.
**Sources:** URD §6, §31.2

### F19.2 Personalization & Preference State
**Phase 1+ · P1 · All visitors**
**Description:** Light personalization: language/country persistence, comparison tray, region-aware retailers/currency display, exit-intent dismissal memory, newsletter preferences; **no pricing shown to unauthenticated users in Phase 1 (BR-GLOBAL-7)**; personal data auto-purge 24 months after last activity (BR-GLOBAL-3).
**Technical functions:** localStorage/cookie strategies; server islands for auth-aware holes (cart badge).
**Non-technical functions:** Convenience without privacy burden; GDPR data-minimization posture.
**Sources:** BRD §26 personalization; URD §31

---

# PART II — BUSINESS, CONTENT & OPERATIONS FEATURES

## Category 20 — Content Management System (Strapi v5 Headless CMS)

### F20.1 CMS Platform & Admin Application
**Phase 1 (end of Phase 1 self-service goal) · P0 · CMS users (Admin/Editor/Author/Viewer)**
**Description:** Headless Strapi v5 Community Edition admin at `admin.twinmos.com` giving Marketing self-service editing without developer help; ~500-plugin ecosystem; zero license cost.
**Technical functions:**
- Core i18n via Unified Document System; REST API default + optional GraphQL Phase 2; **admin routes geo-blocked** (office IPs + VPN only) behind WAF; admin load <1.0s
- Plugins: users-permissions, i18n, SEO (meta/OG per entity), color-picker, **audit-log** (User/Action/Item/Timestamp + JSON diff, IP, user-agent, request-id; 12-month online + 24-month B2 archive), config-sync (dev→staging→prod), publisher (scheduled publish/unpublish), meilisearch (lifecycle auto-indexing), import-export-entries (CSV/Excel bulk), redirect (10,000+ legacy 301/302), sitemap (hreflang), Dynamic Zones + component page blocks, soft-delete, comments (P2), protected-populate (field-level RBAC, P2)
**Non-technical functions:** Marketing independence (posts, products, banners without dev); $0 license vs $99–949/mo SaaS CMS.
**Sources:** Tech Stack §Strapi; BRD §17; Roadmap Ph.1–2

### F20.2 Product Management (Back-Office)
**Phase 1 · P0 · Product Manager, Editor, Admin**
**Description:** Full product CRUD: single/multi-step form (UUID, unique SKU, localized name/slug/descriptions, category FKs, brand_line enum of 11 values, gallery, datasheet PDF, JSON specs, warranty months, status, `is_new` auto-90-day, `is_featured`, release_date).
**Technical functions:**
- Drag-drop image upload with auto-resize (thumb/gallery/hero) + validation (≥1200×1200); rich-text editor (no code); structured JSON spec fields; **CSV/Excel bulk import/export with validation preview**
- Status workflow Draft→Scheduled→Published→Discontinued; public-accurate preview mode; product cloning ("Copy of"); spec changes reviewed before live (BR-10.2); URL pattern validation `/products/{category}/{product-slug}`
- Lifecycle hooks: create/update → MeiliSearch reindex + ISR invalidate + audit log
- **Optimistic locking:** `updatedAt` snapshot as If-Match; mismatch → 409 + side-by-side diff + "reload or override" (URD §31.3)
**Non-technical functions:** PM keeps catalog current without dev help; faster time-to-market for launches; workflow Draft → PM Review → Marketing Review → Legal (if claims) → Published (BRD §18.2).
**Sources:** URD UR-10.1, UC-21; BRD §8.4–8.5; content `_template-product-detail.md`

### F20.3 Page Builder & Content Management
**Phase 1 · P0 · Editors, marketing**
**Description:** Page builder with pre-built components (**Hero, Text+Image, Feature Grid, Feature Item, Testimonials, CTA, FAQ, Stats, Team, Timeline**); 5 core + 4 utility page templates covering all ~287 pages.
**Technical functions:**
- Drag-drop or add-by-click; per-page SEO fields (Meta Title, Meta Description, OG image); desktop + mobile preview; revision history with revert; publish-now or scheduled; draft-first protection (BR-10.3); soft delete recoverable 30 days (BR-10.4) + 10s undo; 9 page-template layouts (`LayoutHero` ~70 pages, `LayoutContent` ~150, `LayoutProductDetail` 100+, `LayoutLegal` 34, `LayoutForm` 16+, Locator/Catalog/Comparison/Checkout)
**Non-technical functions:** Landing-page autonomy for campaigns; brand consistency via constrained blocks.
**Sources:** URD UR-10.2, UC-20; Tech Stack templates

### F20.4 User, Role & Permission Management
**Phase 1 · P0 · Admins**
**Description:** CMS user list (Name, Email, Role, Last Login, Status); **RBAC roles Super Admin / Admin / Editor / Author / Viewer** (+ Partner Marketing/Procurement read-only Phase 2) with permission matrix across Products, Content, Forms, Users, Settings, Analytics; only Admins create users (BR-10.1); password policy ≥12 chars mixed + 90-day admin rotation.
**Technical functions:** Permission matrix per collection; activity log; MFA TOTP mandatory for Super Admin/Admin.
**Non-technical functions:** Least-privilege governance; accountability.
**Sources:** URD UR-10.3; D.2 §7 permission matrix

### F20.5 Review & Approval Workflow
**Phase 1 · P0 · Editors/authors/admin**
**Description:** Creation → Review & Approval → Publication → Verification; email notification of pending review; Review Queue; Approve-and-Publish or Request Changes with comments (author notified); emergency admin override; **two-person review rule BR-5.1**; special flows for product spec changes, legal content, emergency removal, rollback.
**Technical functions:** Workflow states on content entities; notification hooks; override logging in audit log.
**Non-technical functions:** Quality gate on public content; legal safety for claims.
**Sources:** URD UC-29; F.2/J.2 publishing workflow

### F20.6 Inquiry & Lead Management (CMS)
**Phase 1 · P0 · Sales/support/admin**
**Description:** Submissions stored with status tracking (New/Contacted/Qualified/Rejected for distributor inquiries; new→assigned→in_progress→resolved→closed for tickets); CMS users respond, generate reports; lead dashboard with CSV export (Phase 12 HubSpot); form-abandonment analytics (fields >50% abandonment flagged).
**Technical functions:** FormSubmission entity; routing logic; CRM webhook sync; abandonment events.
**Non-technical functions:** Zero-lost-leads operations; response-SLA enforcement.
**Sources:** URD §6.4; Roadmap Ph.6/12

### F20.7 Media Library & Asset Governance
**Phase 1 · P1 · Editors**
**Description:** Format specs per image type (product/hero/OG/article); bulk upload; folder organization; **alt-text enforcement**; automatic optimization (ImgProxy WebP/AVIF, presets, srcset); image asset naming convention.
**Technical functions:** B2-backed storage with signed URLs; HMAC-signed ImgProxy URLs; ETag/TTL caching.
**Non-technical functions:** Consistent, performant, accessible imagery.
**Sources:** J.2 media library; L image-optimization specs

### F20.8 Bulk Import/Export & Data Operations
**Phase 1–2 · P0 · Admin/PM**
**Description:** Bulk operations: product catalog (Excel/CSV from PM with validation against BR-1.1/BR-1.2), retailer/distributor lists, QVL compatibility, serial-number ingest (with monitoring), distributor pricing (SKU, unit price, MOQ, volume tiers), exports for translation/product data/form submissions.
**Technical functions:** import-export-entries plugin; validation reports; job dashboards.
**Non-technical functions:** Scales content ops without manual entry.
**Sources:** Tech Stack §migration; Roadmap Ph.5/10/11

### F20.9 Editorial Standards & Governance Content Features
**Phase 1 · P1 · Editorial team**
**Description:** Editorial style guide (canonical product-name table, capacity/speed formatting, Oxford comma, number/spec/date rules); tone-of-voice guide; content brief template; scheduled publishing; archiving; **microcopy glossary**; verified-only claims enforcement (awards, testimonials, stats, partners) inherited from forensic remediation.
**Technical functions:** Style rules encoded in CMS validation where automatable (product-name table, spec formatting); governance checklists in publishing flow.
**Non-technical functions:** Consistent brand voice; factual integrity guarantee.
**Sources:** F.2 Editorial (4 docs); content `00-site-wide/15-microcopy-glossary.md`

### F20.10 Business Operations Runbooks (Operated Features)
**Phase 2–3 · P1/P2 · Staff**
**Description:** Documented ops features: anti-counterfeit triage, build-gallery moderation, support playbook, form lead routing, live-chat agent guide, RMA ops, warranty-registration ops, order fulfillment, refunds/cancellations, loyalty ops, partner-portal admin, e-commerce admin.
**Technical functions:** Runbook documents versioned with the repos; operational dashboards/queues backing each runbook (moderation queue, RMA list, lead routing view).
**Non-technical functions:** Operational readiness for every launched feature.
**Sources:** J.3 business ops guides

---

## Category 21 — E-Commerce (Phase 3; Phase 1–2 Substituted by Quote/Channel)

### F21.1 Commerce Engine & Storefront
**Phase 3 (Roadmap Ph.13, 16 weeks) · P3 · Consumers; e-commerce ops**
**Description:** Direct-to-consumer sales via **Medusa.js v2 self-hosted OR Stripe Checkout-only fallback (e-commerce ADR — "ADR-007" in root docs / ADR-014 in D.5 registry)**; UAE/KSA soft launch → India-region → public; markets: UAE/India/KSA/International with AED/INR/SAR/USD (EUR/RUB display) — **4 transactional currencies on Stripe at launch**; Terms of Sale page activates; currency converts informational→transactional.
**Technical functions:**
- Medusa Storefront API at `shop.twinmos.com`; two-way Strapi↔Medusa product sync (`medusa-plugin-strapi`); commerce collections (Order, OrderItem, Cart, Payment, Shipment, TaxRule)
- Add-to-Cart wiring (price, qty, availability); **inventory reservation** on checkout start (released on timeout/cancel); order idempotency keys
- PCI scope minimization (Stripe Checkout/Elements = SAQ A; **no card data touches servers**); **Stripe wallet payments — Apple Pay, Google Pay** — plus cards; Stripe Radar + 3DS quarterly tuning; Stripe Tax; webhook signature verification + retry + idempotency
**Non-technical functions:** Direct sales channel parity (all 7 competitors have it); controlled market-by-market rollout.
**Sources:** SOW §5.1; P.1/P.2 Phase-3 specs; Roadmap Ph.13

### F21.2 Cart Experience
**Phase 3 · P3 · Shoppers**
**Description:** Mini-cart drawer + badge (server island), full cart page with empty state, quantity editing, **promo/discount codes**, localStorage + backend sync, guest→registered cart merge.
**Technical functions:** Cart island (`client:load`, 40KB budget); Medusa promotion engine.
**Non-technical functions:** Frictionless path to purchase; abandoned-cart capture (marketing automation workflow).
**Sources:** P.2 cart/checkout spec

### F21.3 Checkout Flow (4 Steps)
**Phase 3 · P3 · Shoppers**
**Description:** Contact → Shipping address → Shipping method → Payment/review; guest checkout with post-order account prompt; saved addresses; address autocomplete (UAE/KSA/BH/KW/OM/QA/IN); checkout LCP ≤2.0s.
**Technical functions:** Stripe Checkout integration; region tax calculation; free-shipping thresholds; order confirmation page + branded emails.
**Non-technical functions:** Highest-UX-criticality flow; 1,000-concurrent-checkout load-tested.
**Sources:** P.2; Roadmap Ph.13 hardening

### F21.4 Order Management & Post-Purchase
**Phase 3 · P3 · Customers; ops**
**Description:** Order confirmation/shipped/payment-failed email matrix; authenticated order tracking + **guest order tracking**; return-request flow (**14-day return-merchandise distinct from RMA**); 30-min customer cancellation window → Stripe refund + inventory release + email; full/partial refund flow (idempotent) via Strapi admin with labels; order list/filter/CSV in admin.
**Technical functions:** Medusa order state machine workflows; Stripe refund API; tracking numbers.
**Non-technical functions:** Post-purchase trust; compliance with consumer-protection norms.
**Sources:** P.2 order lifecycle; Tech Stack §commerce

### F21.5 Shipping & Tax Engine
**Phase 3 · P3 · Ops**
**Description:** 5 shipping zones per the Phase-3 spec (UAE / India / KSA / International + a Bangladesh-market zone retained in the spec — **note: BDT display and the BN locale were removed by the 2026-09-23 remediation; market scope must be reconfirmed with TwinMOS before Phase 13**); carriers **Aramex, FedEx, DHL** (+ regional couriers in specs); flat-rate → weight-based with dimensional weight; Standard/Express/Same-Day with cost+ETA; label generation where carrier API available.
**Technical functions:** Tax engine: 5% VAT UAE/Bahrain/Oman, 15% KSA, 18% GST India default (5% portable storage), 0% export; `tax-table.json` with effective dates + FTA/CBIC/ZATCA citations, quarterly review; Stripe Tax primary / TaxJar fallback; compliant tax-invoice formats; 7-year invoice retention (UAE VAT) on B2/Glacier.
**Non-technical functions:** Legal tax compliance per market; delivery expectation-setting.
**Sources:** Tech Stack §tax; P.2 shipping/tax specs

### F21.6 Customer Accounts (Commerce)
**Phase 3 · P3 · Shoppers**
**Description:** Better Auth `customer` role: dashboard with order history, address book, Stripe saved payment methods (Customer Portal), linked warranties; email verification (24h expiry) before ordering; **GDPR Art. 20 export (ZIP ≤30 days)** and Art. 17 deletion (7-year anonymized tax retention).
**Technical functions:** Role extension on the same Better Auth foundation as the partner portal (F17.4); Stripe Customer Portal integration; verification + deletion jobs.
**Non-technical functions:** Full account-based shopping; data rights compliance.
**Sources:** Roadmap Ph.13; Tech Stack

### F21.7 Out-of-Stock & Back-in-Stock Notifications
**Phase 3 · P3 · Shoppers**
**Description:** Stock-status rules/calculation/display on product pages; out-of-stock notification signup.
**Technical functions:** InventoryLevel sync layer; ERP batch + webhook sync with conflict resolution.
**Non-technical functions:** Demand capture when supply gaps.
**Sources:** P.2 inventory spec

---

# PART III — PLATFORM & TECHNICAL CAPABILITY FEATURES

## Category 22 — Frontend Architecture, Design System & Responsive UI

### F22.1 Static-First Frontend Architecture (Astro 5 + React 19 Islands)
**Phase 1 · P0 · Platform**
**Description:** Astro 5 SSG default with per-route SSR opt-in, ISR via webhook-triggered cache invalidation (60s news revalidation), and **React 19 selective-hydration islands** — 18–19 interactive components with per-island hydration hints and KB budgets (HeaderNavigation 15KB `client:idle`; SearchBar/ProductFilter/Compare/Finder/Locator/Forms 20–30KB `client:visible`; CookieBanner `client:load`; P2/P3 islands lazy; total initial JS ≤150KB gzip; Astro shell <80KB CI-checked).
**Technical functions:** Near-zero JS by default (Lighthouse 95–100); Content Layer API reads the content corpus directly (**454 files referenced in planning; 445 on disk post-remediation — see §0.2**) with Zod-validated frontmatter, saving 4–8 weeks migration; View Transitions API; Server Islands for auth-aware holes; Nanostores cross-island state; Vite 5 dev server <30s rebuilds; `@astrojs/cloudflare` adapter.
**Non-technical functions:** Speed = brand quality perception; content team's existing markdown corpus becomes routes day one.
**Sources:** Tech Stack §frontend; islands/build ADRs (root registry); Roadmap Ph.2

### F22.2 Dual-Aesthetic Design System
**Phase 1–2 · P0 · UX/design; all visitors**
**Description:** **Corporate light theme** (deep blue #0A2540 / electric blue accent #00A3E0, Kingston-inspired) + **Gaming dark theme** (VOLTX: #0D0D0D surfaces, neon cyan/magenta/purple, Corsair-inspired, animated RGB gradient token, gaming hub only) via CSS custom properties; optional dark/light toggle (persisted, `prefers-color-scheme` aware).
**Technical functions:**
- Design tokens: 8-pt spacing grid; type scale Display 64→Caption 12px; shadows/elevation, radius, z-index scales; contrast ≥4.5:1 enforced by Tailwind tokens; touch targets ≥44×44 via Tailwind plugin; 2px focus outline
- Typography: Inter (Latin/Cyrillic) + Noto Sans (Arabic/Devanagari/CJK); self-hosted subsets ~30KB each, ≤80KB/locale, `font-display: swap`, preload 400/700
- Component library (Figma→code): Button (5 variants × 3 sizes), Input, Badge, Product Card, Search Bar, Header/Footer/Hero organisms, tables, modals, loading/empty states, FAQ accordion, Spec Table, News Card
- Animation system: micro 150–200ms / macro 300–400ms, transform/opacity only, 60fps, reduced-motion kill-switch
**Non-technical functions:** One brand system serving corporate trust and gaming energy; design-to-code consistency (±5% pixel-perfect acceptance vs Figma).
**Sources:** E.1 Design System (11 docs); URD §20, §22, §24; RFP §7

### F22.3 Responsive & Mobile-First Behavior
**Phase 1 · P0 · All devices**
**Description:** Mobile-first at 4 breakpoints (320–767 / 768–1023 / 1024–1439 / 1440+); per-component adaptation patterns; cross-browser Chrome/Firefox/Safari/Edge latest-2 (BrowserStack weekly bursts + real devices).
**Technical functions:** Breakpoint strategy tokens; mobile filter drawer; bottom-sheet patterns; sticky mobile CTAs.
**Non-technical functions:** ≥60% mobile sessions served; Sara persona (mobile applicant) parity.
**Sources:** E.3 responsive docs; RFP §7; G cross-browser matrices

### F22.4 Image & Media Pipeline
**Phase 1 · P0 · Platform**
**Description:** Build-time Sharp + runtime **ImgProxy** (self-hosted, HMAC-signed URLs): WebP/AVIF transforms, responsive srcset/sizes/DPR strategy, JPEG q:85 fallback (BR-GLOBAL-4), hero ≤200KB, gallery ≤100KB, lazy loading below-fold + blur-up, hero preloading, OG 1200×630, 360° product views as low-bitrate WebP/MP4, privacy-enhanced lazy YouTube/Vimeo, **alt text required CMS field**.
**Technical functions:** Transform presets; ETag/TTL caching; B2 origin; signed-URL generation.
**Non-technical functions:** Fast visual richness on emerging-market bandwidth; accessibility compliance (alt text).
**Sources:** Tech Stack; L.8/L.9 performance docs; BR-GLOBAL-4

### F22.5 PWA / Offline Support (Service Worker)
**Phase 2 · P2 · Mobile visitors**
**Description:** Workbox service-worker offline support for visited pages.
**Technical functions:** Workbox precache/runtime-caching strategies; offline fallback page; installable PWA shell.
**Non-technical functions:** Resilience on poor networks in core emerging markets.
**Sources:** Tech Stack frontend section

---

## Category 23 — SEO Features

### F23.1 Technical SEO Platform
**Phase 1 · P0 · SEO specialist; editors**
**Description:** Full technical SEO stack targeting +200% organic sessions in 12 months (BO-06) and Lighthouse SEO ≥95.
**Technical functions:**
- **Schema.org JSON-LD per page type** via typed `<JsonLd/>` component: WebSite+Organization+SiteNavigationElement, Product+Offer(+AggregateRating P2), Article, HowTo (KB), NewsArticle, Event, FAQPage, Person (only verified leadership), LocalBusiness (offices/retailers), JobPosting, Review (P2), BreadcrumbList, ItemList (P3)
- Meta management: titles ≤60 chars ("[Product Name] — [Key Specs] | TwinMOS"), descriptions ≤160, canonical per page, OG + twitter:card, validated by Schema.org Validator + Screaming Frog + Rich Results Test; source of truth = Strapi `seo` field
- **Sitemaps:** `sitemap-index.xml` + per-locale sitemaps + news sitemap (P2) + image sitemap; auto-update on publish; submitted to Search Console + Bing
- **Hreflang** auto-alternates for every locale + `x-default`→EN; verified at each locale launch
- robots.txt (disallow /admin/, /api/, /partner/, `?q=` params) + humans.txt + security.txt + ads.txt placeholder; lowercase hyphenated URLs ≤60 chars with canonical hierarchy; www→non-www; HTTPS/HSTS
- **301 redirect engine** (`strapi-plugin-redirect`, 10,000+ legacy URLs, hit-count tracking; redirects.csv; R-06 migration protection); Search Console monitoring + 6-month per-locale keyword review (M15.6)
- Reserved pages excluded from sitemaps; thank-you/paginated-search pages noindexed
**Non-technical functions:** Recovers and grows organic reach (organic share 10%→50% KPI); protects existing rankings through relaunch.
**Sources:** F.3 SEO (11 docs); RFP §10.1; BRD §28.1/§32.1; Roadmap Ph.4

### F23.2 Content SEO Programs
**Phase 1+ · P1 · Editorial/SEO**
**Description:** Keyword mapping (1 primary + ≤3 secondary per page); title-tag formulas per page type; pillar/cluster content model (DDR5/DDR4/NVMe/Gaming/Learn/Support hubs with defined clusters, e.g., 12-article DDR5 cluster); compatibility-finder landing pages for "[model] RAM upgrade"; contextual internal linking (hub-and-spoke); content depth minimums (buying guides 2,500–4,000 words); Baidu setup for zh-CN; GBP listing for Dubai HQ.
**Technical functions:** Keyword-to-page mapping registry consumed by CMS SEO fields; internal-link validation (no orphans); cluster taxonomies.
**Non-technical functions:** Top-of-funnel education engine feeding product funnels.
**Sources:** F.3 keyword/linking docs; BRD §29 R-04

---

## Category 24 — Accessibility (WCAG 2.2 AA + EN 301 549)

### F24.1 Comprehensive Accessibility Compliance
**Phase 1 (gate) · P0 · Users with disabilities; QA/UX**
**Description:** **WCAG 2.2 AA** (SOW Decision 6A — supersedes RFP's 2.1) + EN 301 549 + EU Accessibility Act (EAA, since 28 Jun 2025) + ADA equivalence.
**Technical functions:**
- Screen readers (NVDA, JAWS, VoiceOver, TalkBack): semantic landmarks, alt-text rules per image type, aria-labels, **aria-live regions** for search/filter/errors, table headers with scope, dialog roles + focus traps, status announcements
- Keyboard: full-site navigability; skip links; defined behaviors for nav/menus, product grid, filters, modals, carousel (pause on focus), accordions, tabs, forms; no keyboard traps
- Visual: contrast ≥4.5:1 (3:1 large); visible 2px focus outline; 200% zoom reflow; color-independence (error = border+icon+text); no flashing >3Hz
- WCAG 2.2-specific: focus-not-obscured (2.4.11), accessible authentication (3.3.8 — CAPTCHA assistive fallback), target size ≥24×24 (2.5.8) beyond 44×44 tokens
- Cognitive: consistent navigation, destructive-action confirmation, simple language, multi-step progress indicators, no reading timeouts
- **Tooling:** axe-core in CI on every PR (0 critical/serious) + top-30 pages axe-playwright; monthly manual NVDA/JAWS/VoiceOver, quarterly TalkBack incl. **Arabic RTL screen-reader testing**; Lighthouse a11y ≥95 gate; Accessibility Statement page + accessibility@twinmos.com
**Non-technical functions:** Legal compliance (EAA); audience expansion; brand quality.
**Sources:** SOW Decision 6A; URD §33 + App. C; E.3 WCAG spec; G.11

---

## Category 25 — Performance Engineering

### F25.1 Core Web Vitals & Performance Budget System
**Phase 1 (launch gate) · P0 · All visitors**
**Description:** CWV targets enforced in CI: **FCP <1.0s, LCP <1.8s, FID <50ms, INP <150ms, CLS <0.05, TTFB <150ms, TBT <150ms** *(Tech-Stack strict targets; the Roadmap budget table carries its own tolerances — LCP ≤2.0s, INP ≤200ms, TTFB ≤200ms — treat Tech-Stack as the gate and Roadmap as the ceiling)*; Lighthouse Performance ≥90 gate on every PR.
**Technical functions:**
- Page-type budgets: Homepage ≤1.5MB / PLP ≤1.8MB / PDP ≤2.0MB / Article ≤1.0MB / Forms ≤800KB / Locator ≤2.5MB / Checkout ≤1.5MB; asset budgets (hero ≤200KB, initial JS ≤150KB gzip, island ≤50KB each, critical CSS ≤30KB, fonts ≤80KB/locale, shell <80KB)
- API p95 targets: product list <200ms, detail <150ms, compatibility <300ms, locator <250ms, search <100ms, forms <500ms, CMS admin <1s
- Optimization: per-route code splitting, tree shaking, bundle visualizer gates, font subsetting, critical-CSS inlining, preconnect/preload, Brotli + HTTP/3, skeleton screens, hover prefetch, lazy loading
- CDN caching: ≥85% static-asset hit, ≥70% HTML, ≥80% origin offload; Redis hot-endpoint cache (Phase 2); `Vary: Accept-Language`
- **Concurrency plan:** normal 500 / launch 2,000 / COMPUTEX 5,000 (peak 10K) with pre-event upgrade runbook; Black Friday read-replica strategy; k6 load tests at 500/5,000/10,000
- Slow-network resilience: form data preserved on drop, CDN edge failure fallback, third-party graceful degradation table (map→static→list; chat→offline form→email; RGB→GIF→static; video→thumbnail+link; comparison→stacked→PDPs)
**Non-technical functions:** CWV pass = launch gate; supports +200% organic growth; serves bandwidth-poor core markets.
**Sources:** BRD §20; RFP §6.2/10.2; L folder (9 docs); Roadmap App. H budgets; URD §32/§24.1

---

## Category 26 — Security, Privacy & Legal/Compliance

### F26.1 Application & Edge Security
**Phase 1 (Week 1) · P0 · Platform; all users**
**Description:** Defense-in-depth from edge to database.
**Technical functions:**
- **Cloudflare Pro edge:** TLS 1.3, HSTS preload, WAF (OWASP CRS + custom rules: rate limiting, bot protection, geo-restriction), unmetered DDoS L3/4/7, Bot Fight Mode + **Turnstile**, `cf-ipcountry`, HTTP/3/QUIC, Brotli
- Strict CSP (script-src challenges.cloudflare.com+plausible; frame-ancestors 'none'; report-uri Sentry; nonce refactor P2); X-Frame-Options DENY; nosniff; Referrer-Policy; verified via Mozilla Observatory
- App security: parameterized ORM (SQLi), auto-escaping+CSP (XSS), double-submit cookie + SameSite=Strict (CSRF), open-redirect whitelist, file-upload whitelist + MIME/magic-byte + ClamAV, honeypots, Zod dual-side validation
- AuthN/AuthZ: password policy (12-char, 90-day admin rotation), 5-fail lockout 30 min, 30-min idle/8-h absolute sessions, **MFA TOTP for Admin + Partner Portal**, JWT RS256 1h + rotating refresh with reuse detection + blacklist, public key at `/.well-known/jwks.json`
- Dependencies: Snyk + Dependabot weekly, Trivy image scans, GitGuardian secrets scan; zero high/critical CVE gate
- **OWASP ZAP weekly DAST in CI (zero high/critical gate)** + `.zap-allowlist`; **third-party penetration test** pre-Phase-1, pre-Phase-2, pre-Phase-3, then quarterly/annual ($3K–8K/cycle); 90-day coordinated disclosure (BR-16.5)
- Rate limiting: 100/min public, 1,000/min authed APIs; forms 10/IP/10min; SN-Check 100/h/IP; login 10/h after 5 fails
**Non-technical functions:** Brand and customer protection; enterprise-trust requirement; uptime protection.
**Sources:** BRD §21–22; I folder (18 docs); Tech Stack §security; SOW §4.2

### F26.2 Privacy Compliance Program
**Phase 1+ · P0 · Legal/DPO; all users**
**Description:** Multi-regime compliance: **GDPR** (consent, erasure, portability, 72-h breach notice, DSAR 30 days, EU forms explicit consent BR-GLOBAL-5), **UAE PDPL** (DPO contact, local processing notice), **India DPDP 2023** (Grievance Officer, CERT-In timelines), **KSA PDPL** (cross-border restrictions, Riyadh edge caching with transfer impact assessment), ePrivacy/UK PECR + GPC; optional-by-design: Nigeria NDPA, POPIA, UK DUAA 2025, CCPA/CPRA, EU GPSR.
**Technical functions:** Cookie audit + granular CMP; DPIA; DSAR workflow; GDPR Art. 30 records (audit log as evidence); data classification (PII/Financial/Sensitive/Public) with retention (PII 12–36mo anonymize; Financial 7yr; Sensitive 24mo); data-deletion request form (Art. 17) with PII anonymization preserving 7-year tax records; Art. 20 ZIP export ≤30 days; data-minimization matrix per form (URD §34.3).
**Non-technical functions:** Legal safety across 93+ country footprint; user trust signals (SSL, policy links, response-time commitments).
**Sources:** BRD §16/§22; I.2 privacy docs; URD §34

### F26.3 Legal Hub — 34 Legal & Trust Pages
**Phase 1 · P0-heavy · Legal; all users**
**Description:** Legal hub in 4 groups (Legal & Privacy / Data Rights / Compliance & Certifications / Supply Chain + Security): Privacy Policy, Cookie Policy + Preferences, Terms of Use, **Terms of Sale (Phase 3)**, Warranty Policy, Acceptable Use, Trademark Policy, Accessibility Statement, EU Imprint (GPSR Responsible Person), Supply Chain Disclosure (CSDDD), Modern Slavery (s.54), Conflict Minerals (3TG/RMAP), Product Recalls, Counterfeit Policy, Job Applicant Privacy, Vendor Code of Conduct (RBA v8.0), Data Deletion Request, HTML sitemap.
**Technical functions:** Legal page pattern (TOC sidebar, heading hierarchy, **Last Updated date BR-16.1**, print-friendly); **Compliance Hub** with 12 certification sub-pages (RoHS, REACH/SCIP, CE, UKCA, FCC, EAC, ISO 9001, JEDEC, BIS India, WEEE, EPEAT) with downloadable certificate PDFs and **quarterly re-verification with automated expiry triggers (BR-16.4)**; Security Disclosure page (security@ + PGP) + Vulnerability Program (scope, SLAs, Hall of Fame).
**Non-technical functions:** Procurement-grade compliance evidence; 30-day policy-change notification (BR-16.2); annual ESG updates (BR-16.3).
**Sources:** URD Epic 16, UC-43/44; BRD §22.5; content `14-legal/` (34 files)

### F26.4 Backups & Disaster Recovery
**Phase 1+ · P0 · Ops**
**Description:** Nightly AES-256 encrypted `pg_dump` to Backblaze B2 (30-day daily/12-month monthly), WAL streaming every 15 min (**RPO ≤15 min**), uploads mirrored on write, weekly config backup (90 days), 7-year compliance archive, quarterly replication to Glacier Deep Archive.
**Technical functions:** RTO targets — DB <1h, CMS <2h, frontend <30min, storage <4h, overall ≤4h; **8-step DR drill** (simulate → provision → restore → redeploy → DNS → cache purge → smoke+Lighthouse+axe → document) before each phase launch + quarterly; 99.9% uptime SLA (<8.76h/yr); planned maintenance <4h/mo off-peak.
**Non-technical functions:** Business continuity; launch-gate requirement.
**Sources:** Tech Stack §backup; H runbooks; SOW §3

---

## Category 27 — Analytics, Reporting & Experimentation

### F27.1 Privacy-First Analytics Stack
**Phase 1 → Phase 3 · P0 · Marketing; admin**
**Description:** Two-tier analytics: **Plausible self-hosted** (cookieless, <1KB, primary — GDPR/PDPL/DPDP-clean) + **GA4 + GTM** (consent-gated, IP-anonymized, Partytown-loaded — RFP P0 requirement); Google Search Console; Sentry RUM (Web Vitals per page per locale); **optional heatmaps (Hotjar/Mouseflow, P2)**.
**Technical functions:** Custom events (CTA clicks, form submits, search queries, finder lookups, where-to-buy clicks, file downloads, product views); conversion events (contact submissions, distributor applications, warranty registrations, comparison usage, newsletter signups, whitepaper downloads); zero-result query tracking; admin analytics dashboard API (`/api/v1/admin/analytics`, JWT Admin).
**Non-technical functions:** KPI ladder governance (sessions 2K→50K/mo; organic 10%→50%; bounce 80%→40%; leads 0→100/mo) with 30/90/180-day recalibration.
**Sources:** SOW §5.1; BRD §28.2; RFP §10.3–10.4

### F27.2 Session Replay, Feature Flags & A/B Testing (PostHog OSS)
**Phase 3 · P2 · Marketing/CRO**
**Description:** Self-hosted PostHog: privacy-masked session replay, feature flags (locale/user-type/URL targeting), **A/B testing with random variant assignment + results dashboard**, cohorts, funnels, retention curves per persona; nightly Parquet/CSV export to B2 (>90-day warehouse).
**Technical functions:** GDPR retention policy; Plausible coexistence; 6-experiment Phase-3 backlog (checkout one-page vs multi-step, cart CTA copy, price position, loyalty banner, referral placement, homepage hero).
**Non-technical functions:** CRO engine for the Phase 4 retainer; cart-abandonment funnel analysis.
**Sources:** Roadmap Ph.14; P.4 PostHog specs

### F27.3 Dashboards & Alerting
**Phase 3 · P2 · Marketing/ops**
**Description:** Real-time marketing dashboard (traffic/conversions/top pages, locale+date filters); e-commerce funnel dashboard (view→cart→checkout→purchase drop-offs); content-performance dashboard (top articles, bounce by section, search terms, zero-result queries); weekly automated summary email; form-abandonment analytics.
**Technical functions:** Sentry alerts (email + Slack); UptimeRobot 5-min multi-region checks (5 monitors; >1% 30-day downtime → PagerDuty); 30-min production Playwright smoke; weekly Lighthouse runs; ERP-sync staleness health endpoint.
**Non-technical functions:** Operational visibility; weekly Marketing export rhythm.
**Sources:** Tech Stack §monitoring; Roadmap Ph.14

---

## Category 28 — Integrations Platform

### F28.1 Integration Catalog (19 Systems)
**Phase 1–3 · P0–P3 · Platform**

| Integration | Phase | Functions |
|---|---|---|
| **MeiliSearch** | P1 | Search engine (see F1.5) — native Arabic/CJK tokenization; self-hosted; Cloud fallback (R-09) |
| **Cloudflare (Pro)** | P1 | DNS/WAF/CDN/DDoS/Turnstile/geo/HTTP3; no edge compute (Decision 2B) |
| **Backblaze B2** | P1 | 4 buckets: public assets, documents (presigned), uploads (RMA/receipts), backups; Frankfurt region; zero-egress via Bandwidth Alliance |
| **Resend** | P1 | Transactional email (React Email JSX templates in repo); SPF/DKIM/DMARC (p=quarantine→reject); RFC 8058 one-click unsub; bounce webhooks → suppression; SMTP fallback (SES per R-09) |
| **ImgProxy** | P1 | On-demand image transforms, HMAC-signed |
| **OpenStreetMap/Leaflet → MapLibre** | P1→P2 | Locator maps (42KB bundle; clustering; tile caching) |
| **Cloudflare Turnstile** | P1 | Bot protection on all public forms (managed widget; 300s single-use token; server-verified) |
| **Sentry** | P1 | Errors + performance + RUM + sampled replay; source maps; release tracking; Slack alerts |
| **UptimeRobot** | P1 | Uptime SLA verification |
| **HubSpot CRM** | P2 (locked; "ADR-005" root / ADR-012 D.5) | Form→contact/deal creation (bi-directional); consent timestamp+IP; dedup by email; lead-source attribution (form type/page/UTM/referrer); segmentation + lifecycle workflows (welcome, sales follow-up, partner onboarding); OAuth2 + quarterly secret rotation; retry queue + Slack after 3 failures; covers inquiry/quote/distributor/OEM/partner/whitepaper/newsletter leads; alternates Zoho or existing TwinMOS CRM |
| **Chatwoot** | P2 | Live chat/helpdesk (see F7.4) |
| **Better Auth** | P2/P3 | Portal + commerce auth (see F17.4) |
| **Manufacturing serial ingest** | P2 | Daily/monthly CSV → valid_serials + index (monitored) |
| **ERP (SAP B1/Dynamics/Odoo TBD)** | P2–P3 | P2: read-only daily batch + on-demand webhook for product master/pricing (mTLS or signed keys, 90-day rotation, 3× retry, >20% price-change discrepancy flag, pricing audit trail, health endpoint); P3: order write-back |
| **Medusa.js v2 + Stripe** | P3 | Commerce (see Category 21) |
| **PostHog OSS** | P3 | Experimentation (see F27.2) |
| **Marketing pixels** | P1–P3 | Meta Pixel (P1), LinkedIn Insight (P1), Google Ads (P2), TikTok (P3) — all consent-gated |
| **Carriers** | P3 | Aramex/FedEx/DHL (+regional) shipping |
| **Translation vendor/CAT** | P2–P15 | XLIFF round-trip, TM, glossary |

**Technical functions (cross-cutting):** HMAC-SHA256-signed webhooks (product.*, form.*, content.*, distribution.*) with retries/backoff/idempotency/DLQ; consumers include Cloudflare ISR, HubSpot, Resend, Slack; Slack channels #alerts/#ops/#support/#incident/#audit.
**Non-technical functions:** Each integration maps to a business capability (leads, chat, pricing, payments); SaaS ownership transfer list at handover (M15.9.04).
**Sources:** D.4 (13 integration specs); Tech Stack; ADR registries (root + D.5)

---

## Category 29 — Data Layer & API Platform

### F29.1 Headless API Platform (REST v1)
**Phase 1 · P0 · Platform/integrators**
**Description:** Strapi-powered public + admin REST API (`/api/v1`, URL-versioned, JSON, **RFC 9457 problem-details errors**, cursor pagination, CORS locked to twinmos.com + admin subdomain).
**Technical functions:**
- Public endpoints: products (filters category/brand/status, populate, sort, pagination ≤100, locale), categories, brands, compatibility search (by productSlug or motherboard make/model/socket), distributors (country filters, lat/lng sparse fieldsets), retailers, form-submissions POST (Turnstile), news-articles, content-pages, regional-pages, search proxy (MeiliSearch, ≤25 results, `_rankingScore`), warranty registrations, RMA submit/status, serial-check (P2)
- Admin API (JWT): CRUD products/content/inquiries/users/retailers/RMA + analytics dashboard
- API key tiers (publishable/secret); OpenAPI 3 spec (1,526 lines, 20 paths); GraphQL deferred to Phase 4 (depth limit 7, introspection off)
**Non-technical functions:** Future-proofs channel apps/feeds; documented contract for QA (Bruno) and vendors.
**Sources:** D.3 API specs; BRD §19/§26

### F29.2 Data Model (24 Collections + 5 Single Types)
**Phase 1–3 · P0 · Platform**
**Description:** PostgreSQL 16 relational model behind Strapi: **Product** (sku/slug/localized fields/category/brand/images/specs O2M/compatibility O2M/related M2M/status/soft-delete), ProductSpec+spec-group, ProductImage, Category (self-referencing), Brand, Compatibility-entry (QVL enum), Motherboard, Distributor (tier platinum/gold/standard, is_verified), Retailer (lat/lng), FormSubmission, WarrantyRegistration (computed expiry), RMARequest (state machine + resolution repair/replace/refund + tracking in/out), serial-number (1M+), ContentPage (dynamic zones), NewsArticle, regional-page, legal-page, PartnerUser/PartnerCompany, newsletter-subscriber, redirect (hit_count), audit-log, build-submission (+photos/categories/rejections), Order/OrderItem/Cart/Payment/Shipment/TaxRule (P3); single types: global, homepage, navigation, seo-defaults, cookie-consent.
**Technical functions:** pgcrypto/uuid-ossp/pg_trgm extensions; `pg_stat_statements`; logical schemas (strapi_*, medusa_*, sessions_*, analytics_*, chatwoot_*); capacity plan <5GB→<50GB with read-replica path; lifecycle hooks (see F20.2); RBAC per collection; data-ownership matrix (SerialNumber→Manufacturing; Order→Medusa; PartnerUser→Better Auth).
**Non-technical functions:** Single source of truth for catalog/compat/channel data; GDPR-compliant retention per class.
**Sources:** D.2 (7 docs); Tech Stack §database

### F29.3 Content Migration & Markdown Reuse
**Phase 1–2 · P0 · Platform**
**Description:** The content corpus is read directly by Astro Content Layer (no bulk migration script); frontmatter (25+ fields: title, slug, url, template enum 33 values, phase, priority, status incl. `reserved`, locale, ctas, cross_links, og_*, canonical, hreflang, analytics_tracking, schema blocks with sku/mpn/gtin13/offers) maps 1:1 into Zod schemas; Sprint-0 dry-run validation over all files (TRISK-1).
**Technical functions:** Product data import (Excel/CSV → validation → images → datasheet auto-generation); QVL ingest; serial/pricing imports; redirect map; translation import (XLIFF/JSON); GDPR migration tooling.
**Non-technical functions:** Saves 4–8 weeks; preserves editorial investment.
**Sources:** Tech Stack §migration; Roadmap Ph.2

### F29.4 Data Quality, Freshness & Presentation Standards
**Phase 1+ · P0 · Platform; PM/support**
**Description:** Cross-cutting data-governance feature (URD §29): every data class carries a freshness SLA and a presentation standard, with completeness matrix per page (100% required fields for product/category/compatibility/retailer/event/support data).
**Technical functions:**
- **Freshness SLAs:** catalog real-time; indicative pricing 30 days; compatibility DB quarterly; retailer list 90 days; firmware real-time; partner price lists per effective date; KB quarterly-review flag (>90 days)
- **Presentation formats (locale-aware):** capacity (GB/TB), speed with thousands comma (6,000 MHz), dimensions L×W×H mm, weight, warranty rendered "5 Years (60 months)", price with currency symbol + disclaimer, locale dates ("April 29, 2026" EN / Arabic-Indic numerals AR), SKU in monospace with copy button
- **Empty-data fallbacks** for 9 field types (placeholder image, "coming soon", disabled buttons with tooltips, "contact support" paths)
**Non-technical functions:** Consistent, trustworthy data display across all locales; prevents stale-pricing disputes; underpins the "no inaccurate content" brand-repair goal.
**Sources:** URD §29 (data requirements, freshness, presentation, empty-data)

---

## Category 30 — Infrastructure, Hosting & DevOps

### F30.1 Hosting Topology
**Phase 1–15 · P0 · Ops**
**Description:** **TwinMOS-owned Linux VM origin** (4 vCPU/16GB/100GB SSD Phases 1–12 → 8 vCPU/32GB/500GB Phase 13+; optional 2nd VM Phase 15) behind **Cloudflare Pro** edge; Nginx/Caddy reverse proxy; subdomains: admin/api/search/imgproxy/chat/shop/partner; Tech-Stack variant documented with Hetzner CX32/CX42 + Coolify v4 self-hosted PaaS (container health checks, rolling deploys, metrics/logs dashboards, scheduled backups).
**Technical functions:** Static Astro build + Node services on origin; environments Local (Docker Compose full stack) / dev / staging (prod-sized for load tests) / production, each with independent domain, credentials, DB, B2 bucket, Resend domain, Sentry project.
**Non-technical functions:** Data sovereignty; $45–60/mo (P1) → $180–230/mo (P3) cost envelope (saves $4K–34K vs conceptual RFP stack).
**Sources:** SOW Decision 2B; Tech Stack; ADR-001/003/007 (root registry)

### F30.2 CI/CD & Quality Gates
**Phase 1 · P0 · Developer**
**Description:** Two repos (`twinmos-website-frontend`, `twinmos-website-backend`) with trunk-based protected `main`, PR + linear history + signed commits, CODEOWNERS (PM on /docs/adr/ and /legal/).
**Technical functions:**
- Frontend pipeline: ESLint/Prettier/Stylelint → TypeScript strict → Vitest unit → Playwright E2E (staging) → axe-core top-30 → Lighthouse CI (90/95/95/95) → build → **PR preview deploy** → production
- Backend pipeline: lint → unit → integration (Postgres service container) → schema-diff → Docker multi-stage → Trivy → staging via webhook → **gated production deploy (manual approval)** → Strapi auto-migrations; zero-downtime rollback to previous image
- Security workflow: weekly Snyk/Dependabot/ZAP/GitGuardian cron
- Quality gates: 0 lint/TS errors; coverage ≥70% (100% business logic); 0 critical axe; 0 high/critical ZAP-Snyk-Trivy; bundle budgets; Husky + lint-staged + Commitlint conventional commits
- Node 22 LTS → **Node 24 LTS migration Phase 13 (Node-24 decision; "ADR-008" root registry)** before Node 22 EOL 30 Apr 2027, with full E2E + Lighthouse regression verification; pnpm 9
**Non-technical functions:** Predictable releases; bi-weekly demo cadence; regression safety for a solo developer.
**Sources:** Tech Stack §CI/CD; root ADR registry; H folder

### F30.3 Observability & Runbooks
**Phase 1+ · P0 · Ops**
**Description:** Sentry (errors/perf/RUM/releases), UptimeRobot, Plausible, Slack alerting, Coolify/VM dashboards, log retention; runbooks: deployment, backup/restore, scaling, incident response (Sev1 15-min ack/1-h fix … Sev4 best-effort), rollback, DR, partner-portal admin, RMA workflow, e-commerce admin, content management; ADR registry (root 8-ADR set + D.5 18-entry registry); OpenAPI docs; TypeDoc/Storybook optional.
**Technical functions:** Alert routing to Slack/PagerDuty; release-tag correlation in Sentry; per-service log aggregation; runbook docs versioned with repos.
**Non-technical functions:** Solo-developer operability; handover-ready documentation (Phase 15 knowledge transfer + SaaS ownership transfer).
**Sources:** H/J folders; SOW §7; Roadmap Ph.15

---

## Category 31 — QA & Testing (Assurance Features)

### F31.1 Multi-Level Test Automation
**Phase 1 (gates) · P0 · QA**
**Description:** What is tested defines what exists — the test suite encodes every feature above.
**Technical functions:**
- **E2E Playwright journeys — 15 scenarios in the QA plan (G folder; the Tech-Stack doc lists 10 critical journeys — the G-folder suite is the superset and governs):** search→PDP→datasheet; compatibility (motherboard + empty state); where-to-buy (country filter + map pin); contact form (auto-reply + validation); warranty registration + certificate; **RMA full 7-state workflow**; partner login + watermarked price list; Stripe checkout; **Arabic switch with RTL validation**; serial lookup; 4-SKU comparison; newsletter double opt-in; KB search + rating; careers application + CV upload; cookie-consent granular preferences — each with axe a11y assertions; browser matrix Chromium/Firefox/WebKit/Pixel 7/iPhone 14
- Unit (Vitest), component (Testing Library + Astro Container), integration (Supertest), API (Bruno/Newman), visual regression (P2), k6 load/stress/spike (500/5K/10K), Lighthouse CI, ZAP, BrowserStack weekly (50 critical pages) + real devices; smoke every 30 min against production post-launch
- Test-data strategy (regenerate clean fixtures — placeholder personas flagged by audit); bug severity definitions (Critical ≤4h / High ≤24h / Medium ≤3d) + triage; per-phase exit criteria
**Non-technical functions:** Launch-quality bar; protects 15-phase solo delivery (~75–90% delivery probability per Strategy).
**Sources:** G folder (21 docs); Tech Stack §testing; Roadmap Ph.7

### F31.2 UAT & Launch Governance
**Phase 7–8+ · P0 · Sponsor/stakeholders**
**Description:** UAT cycles Alpha (team, 1 wk) → Beta (Marketing/Sales/Product, 1 wk) → Stakeholder (Chairman, 3 days) → soft launch → public; **10-point launch-readiness gate** (zero critical bugs; Lighthouse ≥90; 14 competitor features done; pen-test pass; content populated; forms tested; SEO metadata; analytics verified in GA4 debug; stakeholder UAT; DR tested); **10-point per-feature acceptance template** (functional, design ±5%, responsive, performance, a11y, SEO, ZAP, cross-browser, content, analytics events); 15 phase-gate sign-offs; hypercare post-launch (24/7 week-1 monitoring, bug triage SLAs, CMS training videos, documentation handover).
**Technical functions:** Gate checklists executed as scripts/CI jobs where automatable; UAT script library; sign-off records per phase gate.
**Non-technical functions:** Chairman-level confidence; defined acceptance for every feature.
**Sources:** BRD §28/§29; M.1 launch docs; Roadmap Ph.7–8

---

# PART IV — CURRENT LIVE SITE (AS-IS) & REFERENCE

## Category 32 — Current twinmos.com Features (Baseline Being Replaced)

The offline mirror (3,001 files, 311 HTML pages, captured 2026-09-23) documents the **existing WordPress site** — the baseline the rebuild must match and exceed. Key as-is features:

| # | Live-site feature | Detail (from crawl evidence) |
|---|---|---|
| 32.1 | WordPress 7.1.2 + WooCommerce (catalog mode) | Razox theme + child; 40 products, 16 categories, variable products with capacity variants (ProductGroup JSON-LD) |
| 32.2 | 3-tier Elementor header | Top bar (socials + currency menu), main bar (logo, product search with category dropdown, account, cart, hamburger), nav bar with off-canvas mega-menus grouped Memories/Internal/Portable/Flash/Accessories + promo banner |
| 32.3 | Shop/category browsing | Result counts, sort (popularity/rating/latest/price), grid/list toggle, per-page selector, pagination, 10 layered-nav filter widgets |
| 32.4 | Product pages | Gallery with srcset, variation swatches, 19-attribute spec table, Description/Additional info/Reviews tabs, Download Datasheet PDF, related products, breadcrumbs + Product schema |
| 32.5 | Datasheet & document library | 29 PDFs (27 datasheets + EOL Details V23 + COMPUTEX-2026 catalog) |
| 32.6 | E-commerce shells | Cart/checkout/my-account/wishlist pages exist; price hidden (catalog-mode plugin + CSS); JSON-LD offers price 0; no guest purchase flow |
| 32.7 | WhatsApp Click-to-Chat | Floating button (wa.me/+886970368077) on all pages + product-page placement — the de-facto inquiry channel |
| 32.8 | Blog/media | /blog/ (8 pages) + 3 categories + 38 tag archives + RSS feed + comment feeds; Media & Events page; COMPUTEX 2026 event landing (catalog download + book-a-meeting) |
| 32.9 | Support surface | /support/ hub, warranty policy (live tiers: Lifetime memory; 5yr NVMe/flash cards/USB; 3yr SATA SSD; 1yr accessories), 4 FAQ pages (bodies JS-rendered), EOL program PDF |
| 32.10 | WooCommerce attribute archives | ~35 spec-taxonomy filter archives (warranty, wear-leveling, CAS latency, NAND type, controller brand, speeds, compatible-OS…) doubling as technical landing pages |
| 32.11 | SEO stack | Rank Math (8 sitemaps, full JSON-LD @graph, related posts, llms.txt, locations.kml), LiteSpeed Cache + WebP, oEmbed, exposed wp-json REST (1,380 routes, 60+ namespaces incl. wc/store) |
| 32.12 | Plugin feature set | Elementor Pro, Slider Revolution, CF7, Mailchimp-for-WP (rendered form is Zoho Campaigns), Site Kit, PixelYourSite PRO (GA4 G-8F2ZRWGJ60, GTM-TR4PSX2), Wordfence, hide-price plugin, variation swatches; REST-only evidence: Jetpack, Hostinger suite, WPForms, WooCommerce POS/analytics, NPS Survey |
| 32.13 | Account infra | AJAX login/register form, lost-password; /since1998/ mirrors wp-login |
| 32.14 | Footer | Zoho newsletter, 4 columns (12 product links, About, Support, Taipei address + hours), 6 social icons, copyright |

### 32.15 Known Live-Site Defects (Rebuild Quick Wins)
- Un-rendered JS template placeholders `{{{data.title}}}`/`{{{data.url}}}` in footer/product cards → ~319 live 404s
- `/request-a-quote/` renders a raw Addify shortcode (broken plugin)
- Wishlist page empty (no plugin); cart/checkout empty shells; currency switcher inert (`#` links)
- **Language switcher styled in CSS but no multilingual plugin exists** (absent feature)
- FAQ bodies not statically rendered; no rendered contact form on /contact/
- **No social-share buttons on blog posts** (audited v1.1 — rebuild adds sharing in F14.1)
- WordPress/Elementor generator metas exposed; xmlrpc.php present; REST API fully exposed (attack surface)
- hcdn JS anti-bot challenge in front of the whole site (crawl friction; possibly intentional WAF)
- Homepage/inner pages render empty placeholders in places (BRD top-10 issue #1); no visible category navigation on some templates

---

## Category 33 — Cross-Cutting Reference Tables

### 33.1 Feature → Phase Quick Map

| Delivery wave | Features |
|---|---|
| **Phase 1 launch (Roadmap Ph.1–8, Feb–Mar 2027)** | All P0: navigation/search/footer/cookie, homepage, 100+ PDPs + catalog + filtering + comparison, compatibility finder MVP (top-100 devices), where-to-buy locator + distributor form, 15 form types + SLAs, support center + warranty + RMA capture + KB(30) + FAQs, news/events, gaming hub (static), solutions, technology, learn hub, careers, contact, 34 legal pages, 27 regional pages, CMS, SEO platform, analytics, WCAG 2.2 AA, performance gates, security gates |
| **Phase 2 (Ph.9–12, ~Jun 2027)** | AR+HI locales + RTL, Better Auth partner portal (assets, watermarked price lists, training), Chatwoot live chat, SN-Check + counterfeit workflow, RMA full 7-state workflow + status page, firmware center (serial-gated), compatibility 500+ devices + QVL ingest, ERP read-only sync, HubSpot CRM, RGB visualizer, build gallery submission, whitepaper gating, marketing automation, MDF pre-claim |
| **Phase 3 (Ph.13–14, Jun 2027–Jan 2028)** | E-commerce (Medusa/Stripe: cart, checkout, orders, payments incl. Apple/Google Pay, shipping, tax, customer accounts), RU/ZH-CN/FR locales, PostHog (replay, flags, A/B), dashboards, Node 24 migration |
| **Phase 15 (from Jan 2028)** | Loyalty, referral, MDF full activation, ES/PT/DE (→9 locales), CRO program, 18 reserved-page activations, knowledge transfer + handover + Phase-4 retainer |

### 33.2 KPI Ladder (business outcomes the features exist to move)

| Metric | Baseline → Target |
|---|---|
| Sessions/mo | 2K → 50K |
| Organic share | 10% → 50% |
| Bounce rate | 80% → 40% |
| Qualified leads/mo | 0 → 100 (~$600K/yr pipeline) |
| Distributor inquiries/qtr | 0 → 20–25 |
| Warranty registrations/mo | 100 → 500 |
| Compatibility searches/mo | 500 → 5,000 |
| Product page views/mo | 5K → 30K |
| Newsletter subscribers/mo | 200 → 1,000 |
| Support emails | −30% in 6 months |
| Uptime | ≥99.9% |

### 33.3 Pre-Mortem Cut Order (Delivery Contingency, Strategy §12.4)

If capacity tightens, features are cut in this order (first cut first):

| Order | Feature cut | Fallback |
|---|---|---|
| 1 | MDF program | Placeholder page only |
| 2 | Loyalty / Referral | Placeholder pages only |
| 3 | RU/ZH/FR locales | Slip 1–2 months |
| 4 | RGB visualizer | CSS-animated fallback |
| 5 | Live-chat agent routing | Email-only capture |
| 6 | Compatibility-finder full algorithm | Already-planned top-100/500 MVP scope |

### 33.4 Source Document Map

| Source | Role in this catalog |
|---|---|
| `TwinMOS_Website_URD.md` v3.1 | Primary feature/UX source: 18 UR-Epics, 50 use cases, UI specs, validation, state, a11y, performance (Part I backbone) |
| `TwinMOS_Website_BRD.md` v3.0 | Business rules (BR-x.y), user stories, KPIs, NFRs, entities (priorities & rationale) |
| `TwinMOS_Website_RFP.md` v3.0 | 18 feature-requirement groups (RFP-FR-…), competitor-gap framing (superseded on stack/timeline by SOW) |
| `TwinMOS_Website_SOW_v4.md` | Authoritative engagement scope, quality gates, stack decisions (2B/5A/6A/7A) |
| `TwinMOS_Website_Technology_Stack.md` v1.2 | All Part III technical capability detail |
| `TwinMOS_Website_Implementation_Strategy.md` v4.0 / `_Roadmap_15_Phase.md` v3.0 | Phasing, 15-phase feature scope, budgets, delivery model, cut order |
| `TwinMOS_Company_Profile_Comprehensive.md` v2.0 | Verified company facts (Part 0) |
| `FORENSIC_AUDIT_REPORT_2026-09-23.md` + `Alignment Changelog` | Fact corrections applied: locales, regional count, warranty tiers, verified-only claims, social URLs |
| `content/website-content/` (445 files on disk) | Page-level feature evidence, IA, front-matter/CMS conventions |
| `project documentation/` A–R (323 files) | Design system, wireframes, data/API/integration specs, ADR registry (18 in D.5), SEO/localization/QA/ops specifics |
| `twinmos_website_offline/` (3,001 files) | Current-site baseline (Category 32) + structured product data (products.json/categories.json) |
| `marketing/` (2 .docx + generators) | White paper & brochure positioning of the feature set |
| External research (v1.1) | Kingston system-finder benchmark; llms.txt standard status — see §Methodology |

### 33.5 Epic → Category Traceability Matrix

| Epic (BRD/URD) | Theme | Primary categories in this catalog |
|---|---|---|
| Epic 1 | Product catalog & discovery | Cat 4 (+F1.5 search) |
| Epic 2 | Compatibility finder | Cat 5 |
| Epic 3 | Where to buy | Cat 6 |
| Epic 4 | Lead generation & contact | Cat 7 (+F1.4 footer) |
| Epic 5 | News, events & awards | Cat 14 (+F3.4 awards) |
| Epic 6 | Support & self-service | Cat 8 |
| Epic 7 | Partner portal | Cat 17 |
| Epic 8 | Gaming hub (VOLTX) | Cat 10 |
| Epic 9 | Localization & regionalization | Cat 18 (+F1.6) |
| Epic 10 | CMS | Cat 20 |
| Epic 11 | Solutions | Cat 11 |
| Epic 12 | Technology & R&D | Cat 12 |
| Epic 13 | Learn hub | Cat 13 |
| Epic 14 | Careers | Cat 15 |
| Epic 15 | Marketing programs | Cat 16 (+F7.3) |
| Epic 16 | Compliance & legal | Cat 26 (+F3.7 ESG) |
| Epic 17 | Anti-counterfeit | Cat 9 |
| Epic 18 | Channel programs | Cat 17 |
| *(missing)* Epic 19 | E-commerce — not authored in URD v3.1 (documented gap G-1) | Cat 21 (from BRD/Roadmap/Phase-3 specs) |
| — | Cross-cutting NFRs & platform | Cat 1, 2, 3, 19, 22–31 |

### 33.6 Known Gaps & Discrepancies (flagged for the document owner)

| # | Gap | Impact / required action |
|---|---|---|
| G-1 | **E-commerce epic (UR-Epic 19) missing from URD v3.1** — commerce specified only via BRD/Roadmap/Phase-3 specs | Author UR-Epic 19 before Phase 13 |
| G-2 | 15-form-type catalog not enumerated in URD (reconstructed here from content corpus + RFP) | Enumerate in URD appendix |
| G-3 | `F.1 Content Inventory` and `M.3 Analytics/KPI` documentation folders are empty | Populate before the related phases |
| G-4 | Pre-remediation artifacts persist in root docs: "10 locales incl. Bengali", 28 regional pages, `/bn/` references | Patch URD/BRD/Tech-Stack to the corrected 9-locale / 27-page base |
| G-5 | No standalone wishlist feature specified (live wishlist page is broken; compare-tray is the Phase 1–2 analog) | Explicit product decision (see R-5) |
| G-6 | **Taxonomy gap:** live site sells MicroSD Cards and Power Supplies (Power Supplies are named core business in the Company Profile); neither exists in the rebuild content IA (5 categories) | Confirm whether these lines migrate, get reserved pages, or are dropped |
| G-7 | RSS: live site publishes `/feed/`; rebuild docs are silent | Product decision (see R-4) |
| G-8 | Regional page count variance: RFP cites 27 country pages; content folder holds hub + 28 files | Reconcile count with final IA |
| G-9 | Form-timeout figures differ: URD 10-min warning vs Tech-Stack/Roadmap 30-min session | Standardize (implement the stricter UX) |
| G-10 | **ADR numbering collision** between root-doc 8-ADR set and D.5's 18-ADR registry (e.g., ADR-005 = HubSpot vs MeiliSearch) | Re-number one registry; update cross-references |
| G-11 | Content-file baseline never re-baselined post-remediation (docs say 454; disk has 445) | Re-baseline count in Tech-Stack/Roadmap |

### 33.7 Enhancement Recommendations (from audit + external research)

| # | Recommendation | Rationale |
|---|---|---|
| R-1 | **Carry over `llms.txt` from the live site** (low cost) while treating it as insurance, not a lever | External research (2025–2026): proposed open standard; niche adoption; [major AI crawlers largely ignore it](https://seranking.com) — clean structured HTML + schema (already in F23.1) remain the primary AI-visibility levers. The live site already ships one; dropping it silently would be a regression |
| R-2 | **Public status/uptime page** (e.g., status.twinmos.com fed by UptimeRobot) | Docs keep uptime internal-only; enterprise buyers and distributors increasingly expect transparent status; near-zero marginal cost on existing monitoring |
| R-3 | **Decide the MicroSD / Power Supply taxonomy** (Gap G-6) | Avoids silently shrinking the visible catalog vs the live site at launch |
| R-4 | **Decide RSS** (keep, redirect to newsletter, or drop with 301s) | Live subscribers exist; silent removal breaks feed readers |
| R-5 | **Decide wishlist** (defer to Phase 3 commerce, or ship a light "saved products" list Phase 1) | Live site promises a wishlist affordance (broken); rebuild currently unspecified |
| R-6 | **Reconcile the two ADR registries** (Gap G-10) | Prevents wrong-decision citations during implementation |
| R-7 | **Re-baseline the content-file count and URD locale list** (Gaps G-4/G-11) | Keeps the planning docs truthful post-remediation |
| R-8 | **Add this catalog's automated checks (label completeness, heading hierarchy, fact strings) to the docs CI** | Keeps the catalog audit-clean through 15 phases of edits |

### 33.8 Acronyms & Glossary

| Term | Meaning |
|---|---|
| ADR | Architecture Decision Record |
| AED/INR/SAR/BDT | UAE Dirham / Indian Rupee / Saudi Riyal / Bangladeshi Taka (BDT removed from scope) |
| BR-x.y | Business Rule identifier (BRD) |
| BRD / RFP / SOW / URD | Business Requirements Doc / Request for Proposal / Statement of Work / User Requirements Doc |
| CAS / CL | Column Address Strobe / CAS Latency (memory timing) |
| CMP | Consent Management Platform (cookies) |
| CMS | Content Management System (Strapi v5) |
| CWV | Core Web Vitals (FCP, LCP, INP, CLS, TBT) |
| DAFZA | Dubai Airport Free Zone (international office) |
| DPDP / PDPL | India Digital Personal Data Protection Act / UAE–KSA Personal Data Protection Law |
| DR / RTO / RPO | Disaster Recovery / Recovery Time Objective / Recovery Point Objective |
| EAA / EN 301 549 | EU Accessibility Act / EU accessibility standard |
| ECC / EOL | Error-Correcting Code (memory) / End Of Life |
| ERP | Enterprise Resource Planning (SAP B1/Dynamics/Odoo TBD) |
| ESG | Environmental, Social, Governance |
| FCP / LCP / INP / CLS / TBT / TTFB | First Contentful Paint / Largest Contentful Paint / Interaction to Next Paint / Cumulative Layout Shift / Total Blocking Time / Time To First Byte |
| GTM / GA4 | Google Tag Manager / Google Analytics 4 |
| HMB / LDPC | Host Memory Buffer / Low-Density Parity-Check (ECC) |
| hreflang | HTML attribute linking locale variants for SEO |
| ISR / SSG / SSR | Incremental Static Regeneration / Static Site Generation / Server-Side Rendering |
| JSON-LD | Linked-Data structured data format (schema.org) |
| JWT / RBAC / MFA / TOTP | JSON Web Token / Role-Based Access Control / Multi-Factor Auth / Time-based One-Time Password |
| KB / FAQ | Knowledge Base / Frequently Asked Questions |
| KPI / SLA / MTTR / MTBF | Key Performance Indicator / Service-Level Agreement / Mean Time To Repair / Mean Time Between Failures |
| MDF | Market Development Funds (channel co-op marketing) |
| MOQ | Minimum Order Quantity |
| NVMe / SATA / PCIe Gen x | Solid-state interface standards / PCIe generations 3/4/5 |
| PDP / PLP | Product Detail Page / Product Listing (category) Page |
| PIM | Product Information Management |
| PLP/PSSD | (see PDP) / Portable SSD |
| QVL | Qualified Vendor List (motherboard compatibility) |
| RMA | Return Merchandise Authorization |
| RTL | Right-To-Left (Arabic layout) |
| SKU / EAN / MPN | Stock Keeping Unit / European Article Number / Manufacturer Part Number |
| SN-Check | Serial-number authenticity check (anti-counterfeit) |
| S.M.A.R.T. / TRIM / TBW | SSD health/self-monitoring / SSD trim command / Terabytes Written (endurance) |
| UAT | User Acceptance Testing |
| UDIMM / SO-DIMM | Desktop / laptop memory module form factors |
| UGC | User-Generated Content (build gallery) |
| XMP / EXPO | Intel / AMD memory overclocking profiles |

---

## Catalog Statistics

- **33 categories** total: 31 feature categories (Parts I–III) + current-state baseline (Category 32) + reference tables (Category 33)
- **143 numbered feature blocks** (F1.1–F31.2), each carrying both Technical and Non-technical function lists (script-verified in v1.1) + 32.1–32.15 as-is baseline items
- Traceable to 18 UR-Epics / 18 BRD Epics / 18 RFP FR groups / 50 use cases / 15 roadmap phases / 2 ADR registries
- Companion: `TwinMOS_Features_Catalog_Audit_Report_v1.1.md` (audit method, 24 findings, compliance verdict)

*End of catalog — v1.1, 24 September 2026.*
