# Request for Proposal (RFP)
# TwinMOS Technologies — Corporate Website Development Project

**RFP Reference:** TWN-RFP-2026-001  
**RFP Version:** 3.0 (Content-Aligned Edition)  
**Issue Date:** 30 April 2026  
**Issuing Entity:** TwinMOS Technologies Middle East FZE  
**Prepared by:** TwinMOS Digital Transformation Team  
**Classification:** CONFIDENTIAL — Vendor Distribution Only (NDA Required)  
**Document Status:** FINAL v3.0 — Aligned with BRD v3.0, URD v3.0, and Content Map v1.0; **v3.1 patches and v4.0 supersession review pending** (see Forensic Alignment Audit v3.0 §3)  
**Synchronized With:** BRD v3.0 (v3.1 patches applied), URD v3.1, Content Map v1.0, Implementation Roadmap v2.1 (15-Phase), Tech Stack v1.1, Implementation Strategy v3.0, `_master-sku-reference.md`, Forensic Alignment Audit v3.0, Company Profile v2.0  

> **v3.1 patch and v4.0 supersession notice (2 May 2026):** Forensic Alignment Audit v3.0 §3 identifies 63 findings against this document. **6 are CRITICAL and structural** (F-RFP-001/002/005/007/018/019), centring on a fundamental incompatibility between this RFP's vendor-procurement framing (§1, §14, §15, §16) and the Implementation Roadmap v2.1's solo-full-stack-developer model. The Roadmap was authored after this RFP; the project now operates on the Roadmap's solo-developer / own-cloud-server / Strapi+Astro+MeiliSearch / 18–24-month / 15-phase model. **Until reconciled, this RFP's procurement timeline (§16), budget structure (§15: $179K-$333K Phase 1), Phase 4.4 month-numbered phasing, §6.1 tech-stack candidate menu (Next.js/Contentful/Algolia/Vercel/Cloudinary), and §13 sub-phase week numbers are NOT to be relied upon.** v4.0 SOW supersession is recommended if sponsor confirms solo-developer model. Internal RFP errors corrected in v3.1: §3.1/Appendix A/C arithmetic (14 vs 16 features; 51 vs 64 critical issues), §16.1 issue date (29 vs 30 April), §4.2 inquiry-type count (7 vs 9), §5 missing 6 personas, §2 brand-table consolidation (18 rows → 11 master brand-lines), §11.2 KSA PDPL inclusion, TOC missing Appendix D entry — pending application alongside the strategic decision.

### Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | TwinMOS Digital Transformation Team | Initial release |
| 2.0 | 29 April 2026 | TwinMOS Digital Transformation Team | Comprehensive revision: factual alignment with Company Profile and BRD/URD; corrected ISO standard; added procurement protocol; added NDA, vendor Q&A, anti-counterfeit, data-residency, and CI/CD requirements |
| 3.0 | 30 April 2026 | TwinMOS Digital Transformation Team | Content-Aligned Edition: full alignment with `TwinMOS_Website_Content_Map.md` (287 entries) and `content/website-content/` (351 markdown files). Replaced Appendix B IA tree with the full 16-section content blueprint. Added 10 new feature ID ranges (RFP-FR-9 through RFP-FR-18) for Solutions, Technology/R&D, Learn Hub, expanded Localization, Careers, Marketing Programs, Compliance Hub, Anti-Counterfeit, Channel Programs, Press/IR. Updated content quantity estimates from 50→287 entries. Updated personas from 5→11. Updated regional landings from 3→28. Updated locale support from 6→9 active locales. Updated budget guidance to reflect expanded scope. |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [About TwinMOS Technologies](#2-about-twinmos-technologies)
3. [Project Background & Business Case](#3-project-background--business-case)
4. [Project Scope & Objectives](#4-project-scope--objectives)
5. [Target Audience & User Personas](#5-target-audience--user-personas)
6. [Technical Requirements](#6-technical-requirements)
7. [Design & UX Requirements](#7-design--ux-requirements)
8. [Feature Requirements (Competitor-Informed)](#8-feature-requirements-competitor-informed)
9. [Content Strategy & Requirements](#9-content-strategy--requirements)
10. [SEO, Performance & Analytics](#10-seo-performance--analytics)
11. [Security & Compliance](#11-security--compliance)
12. [Multi-Region & Localization](#12-multi-region--localization)
13. [Project Timeline & Milestones](#13-project-timeline--milestones)
14. [Vendor Evaluation Criteria](#14-vendor-evaluation-criteria)
15. [Budget Guidance](#15-budget-guidance)
16. [Proposal Submission Requirements](#16-proposal-submission-requirements)
17. [Appendix A: Competitor Feature Matrix](#appendix-a-competitor-feature-matrix)
18. [Appendix B: Proposed Information Architecture](#appendix-b-proposed-information-architecture)
19. [Appendix C: Current Website Forensic Summary](#appendix-c-current-website-forensic-summary)

---

## 1. Executive Summary

TwinMOS Technologies seeks proposals from qualified web development agencies to design, develop, and deploy a **world-class corporate website** that reflects our heritage of more than 27 years (since 1998), our global presence across 5 continents and 93+ countries, and our position as an established manufacturer and distributor of memory and storage solutions.

Our current website (twinmos.com) suffers from critical technical failures, broken functionality, factually inaccurate content, and zero competitive feature parity. This RFP is the result of an extensive forensic audit (`TwinMOS_Website_Forensic_Audit.md`) and competitive analysis of 10+ industry-leading memory and storage brand websites (Kingston, Corsair, G.Skill, ADATA, Crucial, Samsung, TEAMGROUP, Transcend, PNY, ADATA XPG).

**The goal is not merely a new website — it is a complete digital transformation** that will:
- Serve as the primary brand touchpoint for global customers, distributors, and partners
- Drive lead generation, partner recruitment, and direct sales inquiries
- Match or exceed the digital capabilities of Kingston, Corsair, G.Skill, ADATA, and other tier-1 competitors
- Establish a future-proof platform that supports phased rollout of multi-language content, partner portal, and (Phase 3) e-commerce

This RFP is companion to four internal documents that together form the authoritative specification suite:

- **Business Requirements Document (BRD v3.0)** — internal business rules, epics, acceptance criteria
- **User Requirements Document (URD v3.0)** — user-facing interaction specifications
- **TwinMOS Website Content Map v1.0** (`content/TwinMOS_Website_Content_Map.md`) — canonical content blueprint enumerating 287 distinct content entries across 16 top-level categories
- **TwinMOS Master SKU Reference** (`content/website-content/_master-sku-reference.md`) — canonical product registry

Successful vendors will be required to align all proposals with these documents. The Content Map is the **canonical IA and content scope** for this engagement; vendors must scope, design, and price for **all 16 sections** documented therein.

---

## 2. About TwinMOS Technologies

### Company Profile

| Attribute | Details |
|-----------|---------|
| **Legal Entity (Issuing)** | TwinMOS Technologies Middle East FZE |
| **Middle East Establishment** | 21 September 2001 (Dubai, UAE) |
| **Heritage** | 27+ years of memory and storage industry experience |
| **Operational HQ** | C-9, Dubai Airport Free Zone (DAFZA), Dubai, United Arab Emirates |
| **Manufacturing Footprint** | Taiwan-based manufacturing with regional partner facilities; rigorous pre-delivery testing |
| **Global Reach** | 93+ countries across 5 continents |
| **Estimated Employees** | 301–500 globally |
| **Estimated Revenue** | USD $17.5M – $50M (varies by source) |
| **Core Business** | DRAM modules (DDR3/DDR4/DDR5), Solid-State Drives (NVMe Gen 3/4/5, SATA III), portable storage, USB flash drives, USB hubs |
| **Motto** | "Innovation, Perfection, and Quality" |
| **Compliance & Certifications** | ISO 9001 (manufacturing partners), FCC, CE, UKCA, EAC, RoHS, REACH; JEDEC compliance for DRAM products |
| **Industry Identifiers** | USB Vendor ID `4719`; IEEE OUI `000B9D` |
| **Key Markets** | Middle East, Africa, South Asia, CIS, Europe, Southeast Asia |

### Brand & Product-Line Architecture

| Brand / Series | Category | Interface / Generation | Target Segment |
|----------------|----------|------------------------|----------------|
| **VOLTX DDR5 U-DIMM** | DDR5 Desktop DRAM | DDR5-5600 / DDR5-6000 | Enthusiasts, gamers, professionals |
| **VOLTX RGB DDR5 U-DIMM** | DDR5 Gaming DRAM (RGB) | DDR5-5600 / DDR5-6000 | Gaming community, content creators |
| **VOLTX DDR5 SO-DIMM** | DDR5 Laptop/Mobile DRAM | DDR5-5600 | Mobile professionals, laptop upgraders |
| **TornadoX7 Pro** | DDR4 Performance DRAM | DDR4-3200 CL16 | Performance desktops |
| **TornadoX7** | DDR4 Standard DRAM | DDR4-3200 CL22 | General consumers, office users |
| **Thunder GX** | DDR4 Gaming DRAM | DDR4-3200 | Budget gamers, mainstream users |
| **Concord RGB / Concord CL16 RGB** | DDR4 RGB Gaming DRAM | DDR4-3200 | Entry-level gamers |
| **DDR4 SO-DIMM (Laptop)** | DDR4 Laptop DRAM | 2666MHz / 3200MHz | Laptop upgraders |
| **DDR3 Series** | Legacy DRAM | 1333MHz / 1600MHz | Older systems, affordable segment |
| **CoreX Pro** | NVMe SSD (Flagship) | PCIe Gen 5.0 ×4 | Enthusiasts, workstations |
| **CoreX / Xtreme / Xtreme Pro** | NVMe SSD | PCIe Gen 4.0 ×4 | Gamers, content creators |
| **Alpha Pro / TW300** | NVMe SSD | PCIe Gen 3.0 ×4 | Budget-conscious upgraders |
| **Hyper H2 Ultra** | SATA III SSD (2.5") | SATA III | Legacy upgrades, budget segment |
| **M.2 2280 SATA III** | SATA III SSD (M.2) | SATA III | Mainstream upgraders |
| **ELITE Drive Pro** | Portable SSD | USB 3.2 Gen 2 / Type-C | Mobile professionals |
| **ProDrive Ultra** | Portable HDD | USB 3.0 | High-capacity portable storage |
| **Mobile Disk X3** | USB Flash Drive | USB 3.2 | Everyday consumers |
| **USB Hub (4-Port)** | Accessory | USB 2.0/3.0 | General accessory market |

### Key Distribution Partners (Authorized)
- **authorized regional distributor** — UAE
- Regional distributors across MEA, MENA, Africa, CIS, and South Asia

---

## 3. Project Background & Business Case

### 3.1 Current State — Critical Failures

A comprehensive forensic audit of twinmos.com (April 2026) revealed:

- **64 Critical Issues** across technical, UX, content, SEO, and strategic dimensions
- **Multiple 404 errors** on core product pages and legal pages
- **Broken image rendering** — product categories display empty placeholders
- **Factual inaccuracies** (About Us claims Taipei HQ; actual HQ is Dubai)
- **Zero lead generation capability** — no forms, no CTAs, no contact details
- **No competitive features** — missing all 14 standard features offered by competitors
- **Poor grammar and generic AI-style content** throughout

### 3.2 Business Drivers for Redevelopment

| Driver | Impact |
|--------|--------|
| **Brand Credibility** | A broken website actively damages trust among potential distributors, enterprise buyers, and consumers. |
| **Competitive Necessity** | Kingston, Corsair, G.Skill, ADATA, and TEAMGROUP all maintain feature-rich, professionally designed websites. TwinMOS is invisible by comparison. |
| **Lead Generation** | Zero conversion paths = 100% wasted traffic. Distributors, OEMs, and enterprise buyers cannot inquire. |
| **Product Showcase** | New DDR5 and PCIe Gen 5.0 products (CoreX Pro, VOLTX RGB) cannot be properly showcased on the current broken platform. |
| **Anti-Counterfeiting** | The current platform has no product-authentication facility; counterfeit products in unregulated markets erode brand trust. The new site must support serial-number verification (Phase 2). |

---

## 4. Project Scope & Objectives

### 4.1 Primary Objectives

1. **Rebuild from scratch** on a modern, scalable, secure technology stack
2. **Establish competitive parity** with Kingston, Corsair, G.Skill, and ADATA
3. **Enable global market expansion** with multi-language and multi-region support
4. **Drive measurable business outcomes**: leads, distributor inquiries, partner applications
5. **Create a future-proof platform** that supports e-commerce integration, partner portals, and regional microsites

### 4.2 In Scope

The Phase 1 scope spans the **16 top-level content categories** documented in the Content Map:

1. **Site-Wide Components** (header, footer, cookie banner, search, breadcrumb, language selector, trust bar, 404/500/maintenance pages, search results, skip links, microcopy glossary)
2. **Homepage** (hero carousel, category grid, featured products, trust band, gaming CTA, news teaser, distributor CTA, newsletter signup)
3. **About / Company** (overview, history, leadership, manufacturing, quality, certifications, awards, sustainability, CSR, global presence, corporate entities, why choose, mission/vision, press room, media kit, fact sheet, investor relations placeholder)
4. **Products — Catalog** (dual-axis: by Category × by Brand Line) (memory, SSD, portable, USB flash, accessories, brands hub, finder, datasheets)
5. **Solutions / Vertical Use Cases** (gaming, content creation, system builders, enterprise SMB, education, embedded/industrial, telco/BFSI/government, case studies)
6. **Gaming Hub — VOLTX Brand** (brand story, products, RGB showcase, RGB sync compatibility, overclocking, build gallery + submission, esports sponsorships, wallpapers, gaming news feed)
7. **Technology, R&D & Innovation** (R&D philosophy, DRAM, NAND, controllers, thermal, power, data security, data integrity, PCIe Gen 5 deep-dive, JEDEC compliance, patents, whitepapers hub)
8. **Support & Self-Service** (warranty registration / lookup / by-region / FAQ, RMA hub / submit / status / policy, downloads hub, firmware downloads + FAQ, manuals, quick-start guides, KB hub + 30+ articles, FAQs by product category, install guides, SN check, counterfeit policy, contact support, live chat widget, support SLA)
9. **Learn / Knowledge Hub** (buying guides, explained articles, benchmarks, glossary, stories, blog) — separate from Support
11. **News, Press & Events** (news hub, press release template, event templates, news categories, events hub, COMPUTEX 2025 article, GITEX Global, India IT Distributors article, anti-counterfeit launch article, website relaunch article, etc.; media coverage hub; newsletter archive)
12. **Regional / Localization Landings** (27 country/region pages: UAE-GCC, India, Pakistan, Saudi Arabia, Qatar, Egypt, Morocco, Algeria, South Africa, Nigeria, Kenya, Ghana, Ethiopia, Angola, Libya, Cameroon, Namibia, Rwanda, Senegal, Botswana–Lesotho, Russia–CIS, Europe, UK, Southeast Asia, Hong Kong, Taiwan, North America)
13. **Careers** (careers hub, life at TwinMOS, benefits, locations, departments, internships, job listing template, application form, applicant privacy, careers FAQ)
14. **Contact** (contact hub + 7 inquiry types: general, sales, technical support, distributor, OEM/ODM, quote request, media, warranty, feedback; office locations: Taipei HQ, Dubai, Cologne, San Jose, Dongguan; form-success template)
15. **Legal, Compliance & Trust** (privacy policy, cookie policy, terms of use, terms of sale, warranty policy, acceptable use, trademark policy, accessibility statement, imprint EU, supply chain disclosure, modern slavery statement, conflict minerals, product recalls, counterfeit policy, job applicant privacy, vendor code of conduct, data deletion request, cookie preferences, compliance hub: RoHS, REACH, CE, UKCA, FCC, EAC, ISO 9001, JEDEC, BIS India, WEEE, EPEAT; security disclosure; vulnerability program; sitemap)
16. **Marketing Programs & Campaigns** (newsletter signup/confirm/unsubscribe pages, promotions hub, promotion template, launch campaign for CoreX Pro, launch campaign for VOLTX RGB, India launch campaign, cross-sell banner copy, exit-intent popup; reserved: Loyalty Program, Referral Program)

Plus the cross-cutting platform deliverables:

- Complete website design (UI/UX, responsive, mobile-first)
- Front-end and back-end development
- Headless CMS implementation with intuitive admin interface
- Product catalog with filtering, comparison, and search (Algolia/Elasticsearch)
- System Compatibility Finder (RAM/SSD by laptop, desktop, motherboard)
- "Where to Buy" / distributor locator with map
- News & events center
- Support center (warranty, RMA, firmware, knowledge base)
- Gaming hub / sub-brand showcase for VOLTX
- Contact and inquiry forms (multi-type)
- Multi-language support (Phase 2 — Arabic, Hindi)
- Multi-region content with hreflang (28 country pages)
- SEO foundation and structured data (Schema.org per page-type)
- Analytics and tracking integration (GA4, GTM, GSC, Meta Pixel, LinkedIn Insight Tag)
- Content migration strategy (where applicable; legacy site has minimal salvageable content)
- Training and documentation for content managers

### 4.3 Out of Scope (Phase 1)

- Full e-commerce checkout and payment processing (deferred to Phase 3 evaluation)
- Custom native mobile applications (iOS/Android)
- Advanced conversational AI agents (basic chatbot or rules-based widget acceptable)
- Deep integration with ERP/CRM systems beyond standard form-to-email/REST API
- Anti-counterfeit serial-number verification portal (Phase 2)
- SSD management/firmware desktop applications (Phase 3 evaluation)

### 4.4 Phased Roadmap (Authoritative)

The phased rollout is the authoritative reference for both BRD and URD. All vendor proposals must respect the boundaries of Phase 1.

| Phase | Duration | Scope |
|-------|----------|-------|
| **Phase 1 — Core Website** | Weeks 1–20 (Months 1–5, public launch in Month 5) | Full website rebuild; English only; product catalog; compatibility finder; where-to-buy; news/events; support center (warranty registration, RMA, KB, firmware downloads); contact forms; gaming hub; CMS; basic chatbot |
| **Phase 2 — Localization & Partner Enablement** | Months 6–9 (post-launch) | Multi-language: Arabic, Hindi; partner/distributor portal; live-chat with agent routing; serial-number anti-counterfeit lookup |
| **Phase 3 — Commerce & Advanced Features** | Months 10–15 | E-commerce evaluation/MVP; SSD management software/firmware utilities; additional languages (Russian, Chinese-Simplified, French); advanced analytics & marketing automation |
| **Phase 4 — Ongoing Optimization** | Months 16+ | Spanish, Portuguese, German; continuous SEO; CRO; retargeting expansion |

---

## 5. Target Audience & User Personas

### Persona 1: "Enthusiast Gamer — Rahul"
- **Goals:** Find high-performance DDR5 RGB RAM and Gen 4/5 NVMe SSDs for gaming PC builds
- **Needs:** Product specs, RGB compatibility info, XMP/EXPO support details, benchmarks, where to buy locally
- **Devices:** Primarily mobile for browsing, desktop for detailed research

### Persona 2: "System Integrator — Kumar"
- **Demographics:** 35–50, India, runs local PC assembly business
- **Goals:** Source reliable, competitively priced RAM and SSDs in bulk; verify compatibility with motherboards
- **Needs:** Compatibility database, bulk pricing inquiry, warranty terms, distributor contacts
- **Devices:** Desktop, occasional mobile

### Persona 3: "Enterprise Procurement — Sarah"
- **Demographics:** 40–55, UAE/Saudi Arabia, IT procurement manager
- **Goals:** Purchase memory and storage for corporate fleet upgrades or data center projects
- **Needs:** Enterprise product lines, volume pricing, warranty terms, technical documentation, RFP response
- **Devices:** Desktop, tablet

### Persona 4: "Potential Distributor — Mr. Patel"
- **Demographics:** 45–60, India/Africa/CIS, exploring new brand partnerships
- **Goals:** Evaluate TwinMOS as a brand to distribute; understand margins, support, and exclusivity terms
- **Needs:** Company credibility, product portfolio depth, partner application form, contact with regional managers
- **Devices:** Desktop, mobile

### Persona 5: "Laptop Upgrader — Aisha"
- **Demographics:** 25–40, Middle East/South Asia
- **Goals:** Upgrade laptop RAM or replace HDD with SSD
- **Needs:** Simple compatibility checker, SO-DIMM options, installation guides, local retailers
- **Devices:** Mobile-first

---

## 6. Technical Requirements

### 6.1 Technology Stack Preferences

| Layer | Recommended Technology | Rationale |
|-------|----------------------|-----------|
| **Front-End Framework** | Next.js 15 (App Router) or Nuxt 3 | SSR/SSG for SEO, performance, modern React/Vue ecosystem |
| **CMS** | Headless CMS (Contentful, Sanity, Strapi, or Directus) | Decoupled architecture, multi-language support, scalable |
| **Styling** | Tailwind CSS + Framer Motion | Rapid development, consistent design system, smooth animations |
| **Hosting** | Vercel, Netlify, or AWS CloudFront + S3 | Global CDN, edge caching, 99.9%+ uptime SLA |
| **Database** | PostgreSQL (via Supabase or AWS RDS) | Reliable, scalable, supports complex product data |
| **Search** | Algolia or Elasticsearch | Instant product search, faceted filtering |
| **Image/Asset CDN** | Cloudinary or AWS CloudFront | Optimized image delivery, responsive images, WebP/AVIF |
| **Analytics** | Google Analytics 4 + Google Tag Manager | Standard, free, integrates with marketing tools |
| **Form Handling** | HubSpot Forms, Typeform, or custom API | Lead capture, CRM integration |

### 6.2 Performance Requirements

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| **Lighthouse Performance Score** | ≥ 90 | Google Lighthouse |
| **First Contentful Paint (FCP)** | < 1.2s | Chrome DevTools / WebPageTest |
| **Largest Contentful Paint (LCP)** | < 2.0s | Chrome DevTools / WebPageTest |
| **Time to Interactive (TTI)** | < 3.5s | Chrome DevTools |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Chrome DevTools |
| **Server Response Time** | < 200ms | WebPageTest |
| **Global CDN Coverage** | All target regions | GTmetrix multi-region |

### 6.3 Infrastructure Requirements

- **SSL/TLS:** Mandatory HTTPS (TLS 1.3) across all pages with HSTS preload headers
- **CDN:** Global edge caching with presence in Middle East, South Asia, Europe, and North America
- **Uptime SLA:** ≥ 99.9% (≤ 8.76 hours unscheduled downtime per year) with proactive monitoring and alerting
- **Backup:** Daily automated database and asset backups with 30-day retention; AES-256 backup encryption
- **Environments:** Three-tier — Development, Staging (UAT), Production — each isolated with separate domain/credentials
- **Version Control:** Git-based workflow (GitHub or GitLab) with branch protection rules and code review enforcement
- **CI/CD Pipeline:** Automated build, test, lint, accessibility scan (axe-core), security scan (Snyk/Dependabot), Lighthouse performance audit, and one-click deployment to Staging and Production. Mandatory automated rollback on failure
- **Observability:** Centralized error monitoring (Sentry or equivalent), real-user monitoring (RUM), and synthetic uptime checks from at least three target regions
- **Disaster Recovery:** RTO ≤ 4 hours, RPO ≤ 15 minutes for primary site; documented runbooks and at least one DR drill before launch
- **Accessibility:** WCAG 2.1 AA compliance minimum (validated by automated and manual screen-reader testing)
- **Data Residency:** Vendor must declare hosting region(s); UAE, EU, or hybrid options preferred. Personal data processing must comply with UAE Federal Data Protection Law, GDPR (where applicable), and India DPDP Act 2023

---

## 7. Design & UX Requirements

### 7.1 Design Philosophy

The website must balance **two distinct aesthetics**:

1. **Corporate / Enterprise** — Clean, professional, trustworthy for B2B buyers, distributors, and enterprise customers
2. **Gaming / Enthusiast** — Bold, dynamic, RGB-inspired for the VOLTX gaming brand and consumer segment

**Reference Designs:**
- **Corporate inspiration:** Kingston.com (clean, organized, trustworthy)
- **Gaming inspiration:** Corsair.com (dark mode, bold typography, dynamic elements)
- **Overall inspiration:** TEAMGROUP T-FORCE pages (product-centric, award showcase, tech-forward)

### 7.2 Core Design Requirements

| Requirement | Specification |
|-------------|---------------|
| **Responsive Breakpoints** | Mobile (320px–767px), Tablet (768px–1023px), Desktop (1024px–1439px), Wide (1440px+) |
| **Color Palette** | Primary: Deep Blue (#0A2540) or Black; Accent: Electric Blue or RGB gradient for gaming sections; White/Light Gray for corporate sections |
| **Typography** | Modern sans-serif (Inter, Roboto, or similar); Gaming sections may use display fonts for headers |
| **Dark/Light Mode** | Optional toggle for gaming sections; corporate sections light-mode preferred |
| **Animation** | Subtle micro-interactions, scroll-triggered reveals, product hover effects — never at the expense of performance |
| **Product Imagery** | High-resolution PNGs with transparent backgrounds; 360° product views where feasible; lifestyle photography for hero sections |

### 7.3 Key Page Templates Required

1. Homepage (hero carousel, product highlights, news, brand trust signals)
2. Product Category Listing (filterable grid)
3. Product Detail Page (specs, images, compatibility info, where to buy)
4. Product Comparison Page
5. System Compatibility Finder Page
6. Where to Buy / Distributor Locator Page
7. About Us / Company Story
8. News & Events Listing + Detail
9. Gaming Hub / VOLTX Brand Page
10. Support Center (warranty, RMA, firmware, FAQs)
11. Contact / Inquiry Forms (General, Distributor, OEM, Technical)
12. Partner Portal Login Page
13. Legal Pages (Privacy Policy, Terms, Cookie Policy)
14. 404 / Error Pages

---

## 8. Feature Requirements (Competitor-Informed)

> **Identifier convention:** Each feature carries a stable identifier in the form `RFP-FR-X.Y` (e.g., `RFP-FR-8.1`). The BRD and URD reference these identifiers for traceability.

### 8.1 Product Catalog & Discovery (RFP-FR-8.1)

| Feature ID | Feature | Priority | Competitor Reference | Description |
|------------|---------|----------|---------------------|-------------|
| RFP-FR-8.1.1 | **Product Listing with Filters** | P0 | Kingston, Corsair, ADATA | Filter by category (DRAM, SSD, Flash), type (DDR4/DDR5, SATA/NVMe), capacity, speed, interface |
| RFP-FR-8.1.2 | **Product Comparison Tool** | P1 | Kingston, Corsair | Side-by-side comparison of up to 4 products with spec tables |
| RFP-FR-8.1.3 | **Quick View Modal** | P1 | ADATA | Overlay with key specs without leaving category page |
| RFP-FR-8.1.4 | **Related Products** | P1 | All competitors | "You may also like" and "Compatible with" recommendations |
| RFP-FR-8.1.5 | **Product Availability Status** | P2 | Crucial | Show "In Stock" / "Coming Soon" / "Discontinued" indicators |
| RFP-FR-8.1.6 | **Downloadable Datasheet (PDF)** | P1 | Kingston, Corsair, ADATA | Per-product PDF datasheet, < 2MB, branded |

### 8.2 System Compatibility Finder 🔴 CRITICAL GAP (RFP-FR-8.2)

| Feature ID | Feature | Priority | Competitor Reference | Description |
|------------|---------|----------|---------------------|-------------|
| RFP-FR-8.2.1 | **RAM Compatibility by Device** | P0 | Kingston Product Finder, Crucial System Scanner | Search by laptop/desktop brand and model (e.g., "Dell XPS 15 9520") to find compatible RAM |
| RFP-FR-8.2.2 | **SSD Compatibility by Interface** | P0 | Kingston | Filter M.2/SATA by form factor and interface type |
| RFP-FR-8.2.3 | **Motherboard QVL Integration** | P1 | G.Skill | List of tested and validated motherboards per product |
| RFP-FR-8.2.4 | **XMP/EXPO Profile Information** | P1 | Corsair, G.Skill | Clear indication of supported overclocking profiles |

**This is the #1 missing feature** on the current TwinMOS site and is standard across ALL competitors.

### 8.3 Where to Buy / Distributor Locator 🔴 CRITICAL GAP (RFP-FR-8.3)

| Feature ID | Feature | Priority | Competitor Reference | Description |
|------------|---------|----------|---------------------|-------------|
| RFP-FR-8.3.1 | **Map-Based Locator** | P0 | ADATA Where to Buy | Interactive map showing distributors, retailers, and online partners by country |
| RFP-FR-8.3.2 | **Country/Region Selector** | P0 | Kingston, ADATA | Default to user's location; manual override available |
| RFP-FR-8.3.3 | **Retailer Type Filter** | P1 | ADATA | Filter by: Online Store, Physical Store, Distributor, System Builder |
| RFP-FR-8.3.4 | **Online Store Deep Links** | P1 | All competitors | Direct links to product pages on Amazon, local e-commerce sites |
| RFP-FR-8.3.6 | **Become-a-Distributor Inquiry** | P0 | Kingston, Corsair | Application form for prospective channel partners |

### 8.4 Support & Self-Service (RFP-FR-8.4)

| Feature ID | Feature | Priority | Competitor Reference | Description |
|------------|---------|----------|---------------------|-------------|
| RFP-FR-8.4.1 | **Warranty Registration** | P1 | Kingston, Corsair | Online form to register product purchase for warranty tracking |
| RFP-FR-8.4.2 | **RMA Request Portal** | P1 | Kingston, Corsair | Self-service return merchandise authorization with status tracking |
| RFP-FR-8.4.3 | **Firmware Download Center** | P1 | Samsung (Magician), Corsair | SSD firmware updates with serial-number validation |
| RFP-FR-8.4.4 | **Knowledge Base / FAQ** | P1 | All competitors | Searchable articles on installation, troubleshooting, compatibility |
| RFP-FR-8.4.5 | **Installation Guides** | P2 | Crucial | Step-by-step video and text guides for RAM/SSD installation |
| RFP-FR-8.4.6 | **Contact Support Form** | P0 | All competitors | Categorized inquiry forms (Technical, Sales, Warranty, Partnership) |
| RFP-FR-8.4.7 | **Live Chat Widget** | P2 | Kingston, Corsair | Online/offline widget with email fallback (Phase 2 for live agents) |

### 8.5 News, Events & Content (RFP-FR-8.5)

| Feature ID | Feature | Priority | Competitor Reference | Description |
|------------|---------|----------|---------------------|-------------|
| RFP-FR-8.5.1 | **News & Press Releases** | P0 | TEAMGROUP, G.Skill | Chronological news feed with categories (Product Launch, Event, Award, Partnership, Press Release, Company News) |
| RFP-FR-8.5.2 | **Event Showcase (COMPUTEX, CES)** | P1 | G.Skill, TEAMGROUP | Dedicated event pages with photo galleries, booth info, product demos |
| RFP-FR-8.5.3 | **Awards & Recognition Showcase** | P1 | TEAMGROUP | Display of ISO, CE, FCC, RoHS, and any industry awards (subject to verification) |
| RFP-FR-8.5.4 | **Video Content Integration** | P2 | Corsair, Samsung | YouTube/Vimeo embeds for product unboxings, reviews, installation guides |
| RFP-FR-8.5.5 | **Blog / Tech Insights** | P2 | Kingston Knowledge Center | SEO-optimized articles on memory technology, buying guides, comparisons |

### 8.6 Partner & Distributor Portal (RFP-FR-8.6) — Phase 2

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-8.6.1 | **Partner Login Area** | P2 | Password-protected area for authorized distributors with MFA-ready foundation |
| RFP-FR-8.6.2 | **Co-Branded Asset Library** | P2 | Downloadable logos, banners, product images, datasheets for partner marketing |
| RFP-FR-8.6.3 | **Price Lists (Login Required)** | P2 | Secure access to distributor pricing, MOQ, watermarked PDF/Excel |
| RFP-FR-8.6.4 | **Marketing Collateral** | P2 | POS materials, shelf talkers, display stand designs |

### 8.7 Gaming Hub — VOLTX Brand Experience (RFP-FR-8.7)

| Feature ID | Feature | Priority | Competitor Reference | Description |
|------------|---------|----------|---------------------|-------------|
| RFP-FR-8.7.1 | **Dedicated Gaming Landing Page** | P1 | Corsair, TEAMGROUP T-FORCE | Immersive dark-themed page for VOLTX and VOLTX RGB products |
| RFP-FR-8.7.2 | **RGB Showcase** | P2 | Corsair, G.Skill | Visualizer showing RGB lighting effects, sync compatibility (Aura Sync, RGB Fusion, Mystic Light, Polychrome) |
| RFP-FR-8.7.3 | **Build Gallery** | P3 | Corsair | User-submitted PC builds featuring TwinMOS products (moderated) |
| RFP-FR-8.7.4 | **Build Submit Form** | P3 | Corsair | Multi-image submission with moderation queue |
| RFP-FR-8.7.5 | **Overclocking Profiles** | P2 | G.Skill | XMP 3.0 and EXPO profile details, overclocking potential |
| RFP-FR-8.7.6 | **Wallpapers / Brand Assets** | P3 | Corsair | Downloadable VOLTX wallpapers in standard resolutions |
| RFP-FR-8.7.7 | **Esports Sponsorships** | P3 | Corsair, ASUS ROG | Sponsorship roster, team/player profiles, news |
| RFP-FR-8.7.8 | **Ambassador Program (Reserved)** | P3 | Corsair, HyperX | Application form & program details (Phase 3+) |
| RFP-FR-8.7.9 | **RGB Software Download (Reserved)** | P3 | Corsair iCUE | TwinMOS RGB control utility (if shipped) |

### 8.8 Brand Hub Architecture (RFP-FR-8.8) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-8.8.1 | **Brand Directory Page** | P1 | `/products/brands/` — central directory of all 11 brand lines with positioning, target audience, and link to each |
| RFP-FR-8.8.2 | **Brand Page Template** | P1 | Reusable template for VOLTX, TornadoX7, Thunder GX, Concord, CoreX Pro, Xtreme, Alpha Pro, Hyper H2 Ultra, ELITE Drive Pro, ProDrive Ultra, Mobile Disk X3 |
| RFP-FR-8.8.3 | **Cross-Axis Navigation** | P1 | Users can browse by Category (Memory/SSD/Portable/USB) OR by Brand — both axes link to the same SKUs |

### 8.9 Solutions / Vertical Use Cases (RFP-FR-9) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-9.1 | **Solutions Hub** | P1 | `/solutions/` — landing page with vertical-tile navigation |
| RFP-FR-9.2 | **Gaming Enthusiast Solution** | P1 | DDR5 RGB + Gen 4/5 NVMe recommendations |
| RFP-FR-9.3 | **Content Creation Solution** | P1 | High-bandwidth memory + Gen 5 NVMe + portable SSD |
| RFP-FR-9.4 | **System Builder Solution** | P1 | Bulk procurement, compatibility-finder integration, distributor inquiry |
| RFP-FR-9.5 | **Enterprise SMB Solution** | P1 | Office productivity, server-grade memory, support SLAs |
| RFP-FR-9.6 | **Education Solution** | P1 | Lab fleet upgrades, student-budget builds, education licensing |
| RFP-FR-9.7 | **Embedded / Industrial Solution** | P1 | Wide-temp memory, ruggedized SSDs, long-term supply |
| RFP-FR-9.8 | **Telco / BFSI / Government Solution** | P1 | Compliance-led messaging, BIS / FCC / RoHS / EAC trust signals |
| RFP-FR-9.9 | **Data Center Solution (Reserved)** | P3 | Activates when enterprise SSD line is launched |
| RFP-FR-9.10 | **Case Studies Hub + Template** | P1 | Library of customer success stories with template |

### 8.10 Technology, R&D & Innovation (RFP-FR-10) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-10.1 | **Technology Hub Landing** | P1 | `/technology/` |
| RFP-FR-10.2 | **R&D Philosophy** | P1 | TwinMOS R&D approach, market analysis, competitor analysis |
| RFP-FR-10.3 | **DRAM Technology Deep-Dive** | P1 | DDR5 architecture, on-die ECC, PMIC, JEDEC compliance |
| RFP-FR-10.4 | **NAND Flash Technology** | P1 | 3D TLC, controller integration, endurance |
| RFP-FR-10.5 | **Controller Technology** | P1 | SMI, Phison, in-house controllers |
| RFP-FR-10.6 | **Thermal Management** | P1 | Graphene, aluminum, MTCD |
| RFP-FR-10.7 | **Power Management** | P1 | DDR5 PMIC, low-voltage designs |
| RFP-FR-10.8 | **Data Security** | P1 | LDPC ECC, encryption-ready architecture |
| RFP-FR-10.9 | **Data Integrity** | P1 | Wear leveling, bad block management, S.M.A.R.T. |
| RFP-FR-10.10 | **PCIe Gen 5 Deep-Dive** | P1 | Bandwidth, controller architecture, real-world vs synthetic |
| RFP-FR-10.11 | **JEDEC Compliance** | P1 | Standards adherence per DRAM family |
| RFP-FR-10.12 | **Patents Page** | P2 | Filed and granted patents |
| RFP-FR-10.13 | **Roadmap (Reserved)** | P3 | Public technology roadmap |
| RFP-FR-10.14 | **Whitepapers Hub** | P1 | Technical whitepaper library with gated download |

### 8.11 Learn / Knowledge Hub (RFP-FR-11) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-11.1 | **Learn Hub Landing** | P1 | `/learn/` — top-of-funnel education content directory |
| RFP-FR-11.2 | **Buying Guides** | P1 | How to choose RAM, How to choose an SSD, NVMe vs SATA, PCIe Gen comparisons, SO-DIMM vs UDIMM, Portable SSD vs HDD, RGB RAM buyer's guide, best-RAM/SSD-for-X guides |
| RFP-FR-11.3 | **Build Guides** | P1 | Budget / Mid-Range / Flagship PC build guides; system-builder procurement guide; enterprise fleet upgrade guide |
| RFP-FR-11.4 | **Explained Articles Hub** | P1 | What is DDR/DDR5/DDR4/DDR3, DDR architecture, memory bandwidth, CAS latency, memory timings, prefetch buffer, on-die ECC, PMIC, XMP, AMD EXPO, NVMe, PCIe, SATA, 3D TLC NAND, DRAM cache, HMB, TRIM/garbage collection, wear leveling, S.M.A.R.T., RGB sync, graphene heatsink, ECC memory, M.2 2280 form factor, MTBF, power loss protection |
| RFP-FR-11.5 | **Benchmarks Hub** | P1 | Benchmark template + competitor comparisons (CoreX Pro vs competitors, VOLTX RGB vs competitors), real-world gaming benchmark, content creation benchmark |
| RFP-FR-11.6 | **Glossary** | P1 | Technical glossary of memory and storage terms |
| RFP-FR-11.7 | **Stories Hub** | P2 | Customer / professional case studies template |
| RFP-FR-11.8 | **Blog Hub** | P1 | Editorial blog with category taxonomy; launch posts for CoreX Pro and VOLTX RGB; COMPUTEX 2025 recap |

### 8.12 Multi-Region & Localization (Expanded — RFP-FR-12)

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-12.1 | **Language Switcher** | P0 (P2 for translations) | EN at launch; AR/BN/HI in Phase 2; RU/ZH/FR in Phase 3; ES/PT/DE in Phase 4 |
| RFP-FR-12.2 | **9 Active Locale Buckets** | P2+ | `_locales/{ar,bn,de,es,fr,hi,pt,ru,zh-CN}` |
| RFP-FR-12.3 | **27 Country/Region Landing Pages** | P1 | UAE-GCC, India, Pakistan, Saudi Arabia, Qatar, Egypt, Morocco, Algeria, South Africa, Nigeria, Kenya, Ghana, Ethiopia, Angola, Libya, Cameroon, Namibia, Rwanda, Senegal, Botswana–Lesotho, Russia–CIS, Europe, UK, Southeast Asia, Hong Kong, Taiwan, North America |
| RFP-FR-12.4 | **Hreflang Implementation** | P0 | Per-language URL structure with canonical tags |
| RFP-FR-12.5 | **Region Auto-Detection + Override** | P0 | IP-based geolocation with manual change |
| RFP-FR-12.6 | **RTL Layout (Arabic)** | P2 | Full right-to-left page mirroring |

### 8.13 Careers (RFP-FR-13) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-13.1 | **Careers Hub** | P1 | `/careers/` |
| RFP-FR-13.2 | **Life at TwinMOS** | P1 | Culture page |
| RFP-FR-13.3 | **Benefits** | P1 | Compensation philosophy, healthcare, etc. |
| RFP-FR-13.4 | **Locations** | P1 | Office maps and contacts |
| RFP-FR-13.5 | **Departments** | P1 | Engineering, Marketing, Sales, Operations, etc. |
| RFP-FR-13.6 | **Internships** | P1 | Student internship pathway |
| RFP-FR-13.7 | **Job Listing Template** | P1 | Per-role posting template with apply CTA |
| RFP-FR-13.8 | **Application Form** | P1 | Multi-step form with CV upload, GDPR consent |
| RFP-FR-13.9 | **Applicant Privacy Notice** | P0 | GDPR Art. 13 disclosures for recruitment |
| RFP-FR-13.10 | **Careers FAQ** | P1 | Common questions about hiring process |

### 8.14 Marketing Programs & Campaigns (RFP-FR-14) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-14.1 | **Newsletter Signup Page** | P1 | Standalone landing page beyond footer signup |
| RFP-FR-14.2 | **Newsletter Confirm Page** | P1 | Double opt-in confirmation |
| RFP-FR-14.3 | **Newsletter Unsubscribe Page** | P0 | One-click unsubscribe |
| RFP-FR-14.4 | **Promotions Hub** | P1 | Active promotions listing |
| RFP-FR-14.5 | **Promotion Template** | P1 | Reusable promo-page layout |
| RFP-FR-14.6 | **Launch Campaigns** | P1 | CoreX Pro launch, VOLTX RGB launch, India launch |
| RFP-FR-14.7 | **Cross-Sell Banner Copy** | P2 | Inline cross-sell components |
| RFP-FR-14.8 | **Exit-Intent Popup** | P2 | Newsletter or promotion capture on exit |
| RFP-FR-14.9 | **Loyalty Program (Reserved)** | P3 | Activates Phase 3+ |
| RFP-FR-14.10 | **Referral Program (Reserved)** | P3 | Activates Phase 3+ |

### 8.15 Compliance, Trust & Legal Hub (RFP-FR-15) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-15.1 | **Legal Hub Landing** | P0 | `/legal/` |
| RFP-FR-15.2 | **Privacy Policy** | P0 | GDPR / UAE / India DPDP / KSA PDPL compliant |
| RFP-FR-15.3 | **Cookie Policy + Cookie Preferences** | P0 | Granular consent management |
| RFP-FR-15.4 | **Terms of Use** | P0 | Site usage terms |
| RFP-FR-15.5 | **Terms of Sale** | P0 | Activates with e-commerce in Phase 3 |
| RFP-FR-15.6 | **Warranty Policy** | P0 | Per-product-line warranty terms |
| RFP-FR-15.7 | **Acceptable Use** | P1 | Forbidden uses, abuse policy |
| RFP-FR-15.8 | **Trademark Policy** | P1 | Partner usage of TwinMOS marks |
| RFP-FR-15.9 | **Accessibility Statement** | P0 | WCAG 2.1 AA conformance disclosure |
| RFP-FR-15.10 | **Imprint (EU)** | P0 | Required for German/EU operations |
| RFP-FR-15.11 | **Supply Chain Disclosure** | P1 | ESG transparency |
| RFP-FR-15.12 | **Modern Slavery Statement** | P1 | UK MSA / AU MSA compliance |
| RFP-FR-15.13 | **Conflict Minerals Disclosure** | P1 | SEC Section 1502 compliance |
| RFP-FR-15.14 | **Product Recalls** | P0 | Recall communication template |
| RFP-FR-15.15 | **Counterfeit Policy (Legal)** | P0 | Legal-side counterfeit policy (paired with `07-support/35`) |
| RFP-FR-15.16 | **Job Applicant Privacy** | P0 | Linked from Careers section |
| RFP-FR-15.17 | **Vendor Code of Conduct** | P1 | Supplier ESG and ethics |
| RFP-FR-15.18 | **Data Deletion Request** | P0 | GDPR Art. 17 right-to-erasure form |
| RFP-FR-15.19 | **Compliance Hub** | P1 | RoHS, REACH, CE, UKCA, FCC, EAC, ISO 9001, JEDEC, BIS India, WEEE, EPEAT |
| RFP-FR-15.20 | **Security Disclosure** | P1 | security@twinmos.com, responsible disclosure |
| RFP-FR-15.21 | **Vulnerability Program** | P1 | Bug bounty / coordinated disclosure |
| RFP-FR-15.22 | **Sitemap (HTML)** | P1 | Human-readable sitemap |

### 8.16 Anti-Counterfeit / Product Authentication (RFP-FR-16) — NEW IN v3.0 (Phase 2)

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-16.1 | **Serial-Number Verification (SN-Check)** | P2 | Lookup tool to verify authenticity |
| RFP-FR-16.2 | **Counterfeit Reporting Workflow** | P2 | Form for reporting counterfeit purchases |
| RFP-FR-16.3 | **Public Counterfeit Policy** | P0 | Linked from product pages and footer |
| RFP-FR-16.4 | **Backend Integration with Manufacturing** | P2 | Daily SN ingest |

### 8.17 Channel Programs (RFP-FR-17) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-17.1 | **Become a Distributor (page + form)** | P0 | Already in §8.3.6 — now formally part of channel-programs epic |
| RFP-FR-17.2 | **Become a Reseller** | P1 | Smaller-scale resellers (vs distributors) |
| RFP-FR-17.3 | **OEM/ODM Program** | P1 | OEM partner pitch + qualification |
| RFP-FR-17.4 | **System Builder Program** | P1 | Independent system builder enrolment |
| RFP-FR-17.5 | **Distributor Benefits** | P1 | What partners get |
| RFP-FR-17.6 | **Distributor Onboarding Process** | P1 | Step-by-step onboarding |
| RFP-FR-17.7 | **Distributor Responsibilities** | P1 | Code-of-conduct, MOQs, brand standards |
| RFP-FR-17.8 | **MDF Program (Reserved)** | P3 | Marketing Development Funds |
| RFP-FR-17.9 | **Distributor Success Stories** | P2 | Featured partner case studies |

### 8.18 Press Room & Investor Relations (RFP-FR-18) — NEW IN v3.0

| Feature ID | Feature | Priority | Description |
|------------|---------|----------|-------------|
| RFP-FR-18.1 | **Press Room** | P1 | Press release archive, media inquiry contact |
| RFP-FR-18.2 | **Media Kit** | P1 | Logos, brand guidelines, headshots, product imagery |
| RFP-FR-18.3 | **Corporate Fact Sheet** | P1 | Downloadable one-pager |
| RFP-FR-18.4 | **Investor Relations (Reserved)** | P4 | Reserved for future IPO / funding events |
| RFP-FR-18.5 | **Newsletter Archive** | P1 | Past newsletter editions |
| RFP-FR-18.6 | **Media Coverage Hub** | P2 | "In the news" external coverage mentions |

---

## 9. Content Strategy & Requirements

### 9.1 Content Migration

- Current website has **virtually no salvageable content** due to factual errors, poor grammar, and broken rendering
- **Content will be created fresh** by TwinMOS in collaboration with the selected agency
- Agency must provide **content templates and guidelines** for consistent product descriptions

### 9.2 Required Content Types (Aligned to Content Map v1.0)

> **Authoritative scope:** `content/TwinMOS_Website_Content_Map.md` — 287 unique content entries; the table below summarizes by section.

| Content Type | Quantity | Source |
|--------------|----------|--------|
| Site-Wide Components | 15 entries | UX + Marketing |
| Homepage Components | 9 entries | Marketing |
| About / Company Pages | 17 entries | Marketing + Legal + HR |
| Product Pages (catalog hub + memory + SSD + portable + USB + accessories + brands hub + finder + datasheets) | 50+ pages and 100+ SKU detail pages — see `_master-sku-reference.md` | Product Manager + Marketing |
| Solutions Pages | 11 entries | Marketing + Sales |
| Gaming Hub (VOLTX) | 14 entries | Marketing + Gaming Editorial |
| Technology / R&D Pages | 14 entries | Product + Engineering |
| Support Pages (warranty, RMA, KB, install guides, FAQs) | 39 hub pages + 30+ KB articles | Support + Product |
| Learn Hub Pages (buying guides, explained, benchmarks, glossary, blog, stories) | 64 entries | Marketing Editorial + Product |
| Where to Buy & Partners | 21+ entries | Sales + Channel Partner team |
| News & Events Pages | 19+ entries + 9+ historical articles + new articles ongoing | PR + Marketing |
| Regional Landings | 28 country pages + 9 active locales | Regional Marketing + Localization vendor |
| Careers | 10 entries | HR |
| Contact Pages | 16 entries | Customer Service + Marketing |
| Legal / Compliance | 34 pages | Legal + Compliance |
| Marketing Programs | 11 entries | Marketing |
| Datasheets (PDF) | 50+ PDFs | Product technical team |
| Video Content | 10+ videos | Marketing + Agency |
| **TOTAL** | **287 entries (per Content Map) + 100+ SKU detail pages** | Multiple owners — see Content Map "Owner" column |

### 9.3 Content Management Requirements

- Intuitive WYSIWYG editor for non-technical staff
- Scheduled publishing and content versioning
- Bulk upload capability for products
- Image optimization and alt-text management
- SEO metadata fields for every page (title, description, Open Graph, Twitter Cards)
- Multi-language content management (future-proofing)

---

## 10. SEO, Performance & Analytics

### 10.1 SEO Foundation

| Requirement | Implementation |
|-------------|----------------|
| **Custom Meta Titles/Descriptions** | Unique, keyword-optimized for every page |
| **Structured Data (Schema.org)** | Product, Organization, BreadcrumbList, FAQ, Article schemas |
| **XML Sitemap** | Auto-generated, submitted to Google/Bing |
| **Robots.txt** | Optimized crawl directives |
| **Canonical URLs** | Prevent duplicate content issues |
| **Hreflang Tags** | For multi-language pages (Phase 2) |
| **Internal Linking** | Contextual links between related products and content |
| **URL Structure** | Clean, descriptive URLs (e.g., `/products/voltx-ddr5-5600mhz-16gb`) |

### 10.2 Core Web Vitals Targets

| Metric | Target | Status |
|--------|--------|--------|
| **Largest Contentful Paint (LCP)** | ≤ 2.0s | Must Pass |
| **First Input Delay (FID)** | ≤ 100ms | Must Pass |
| **Cumulative Layout Shift (CLS)** | ≤ 0.1 | Must Pass |
| **Interaction to Next Paint (INP)** | ≤ 200ms | Must Pass |
| **Time to First Byte (TTFB)** | ≤ 200ms | Must Pass |

### 10.3 Analytics & Tracking

| Tool | Purpose |
|------|---------|
| **Google Analytics 4** | Traffic, behavior, conversion tracking |
| **Google Search Console** | Search performance, indexing issues |
| **Google Tag Manager** | Tag deployment without code changes |
| **Meta Pixel** | Facebook/Instagram retargeting |
| **LinkedIn Insight Tag** | B2B retargeting for distributor/partner campaigns |
| **Heatmap Tool** (Hotjar/Mouseflow) | User behavior analysis (optional, P2) |

### 10.4 Conversion Tracking

- Contact form submissions
- Distributor inquiry applications
- Warranty registrations
- Product page engagement (time on page, comparison usage)
- "Where to Buy" click-throughs
- Newsletter signups

---

## 11. Security & Compliance

### 11.1 Security Requirements

| Requirement | Standard |
|-------------|----------|
| **SSL Certificate** | Let's Encrypt or commercial wildcard SSL |
| **HTTPS Enforcement** | HSTS preload ready |
| **Content Security Policy (CSP)** | Configured to prevent XSS |
| **DDoS Protection** | Cloudflare or AWS Shield |
| **WAF (Web Application Firewall)** | OWASP Top 10 protection |
| **Form Spam Protection** | reCAPTCHA v3 or hCaptcha |
| **Regular Security Scanning** | Quarterly penetration testing |
| **Dependency Updates** | Automated vulnerability scanning |

### 11.2 Compliance Requirements

| Regulation | Requirement |
|------------|-------------|
| **GDPR (EU)** | Cookie consent banner, privacy policy, data deletion rights |
| **UAE Data Protection Law** | Compliance for Dubai HQ operations |
| **India DPDP Act 2023** | Consent management for Indian users |
| **Cookie Compliance** | Granular cookie consent with opt-in for analytics/marketing |
| **Accessibility** | WCAG 2.1 AA minimum |

---

## 12. Multi-Region & Localization

### 12.1 Language Support (Phased)

The phased language rollout is aligned with the authoritative roadmap defined in Section 4.4 of this RFP.

| Phase | Window | Languages | Priority |
|-------|--------|-----------|----------|
| **Phase 1 (Launch)** | Months 1–5 | English | P0 |
| **Phase 2 (Localization)** | Months 6–9 (post-launch) | Arabic (RTL), Hindi | P1 |
| **Phase 3 (Commerce & Advanced)** | Months 10–15 | Russian, Chinese (Simplified), French | P2 |
| **Phase 4 (Ongoing Optimization)** | Months 16+ | Spanish, Portuguese, German | P3 |

### 12.2 Regional Requirements

| Region | Specific Requirements |
|--------|----------------------|
| **Middle East / GCC** | Arabic RTL layout, local distributor contacts, AED pricing references |
| **Africa** | Regional distributor directory, multi-currency support (future) |
| **CIS** | Russian language, regional distributor contacts |

### 12.3 Technical Localization

- URL structure: `/en/products/`, `/ar/products/`, `/hi/products/`
- Hreflang tags for all language variants
- Locale-aware date, time, and number formatting
- Currency display (informational only in Phase 1)

---

## 13. Project Timeline & Milestones

### Phase 1 (Core Website) — Overall Duration: 16–20 Weeks (≈ 5 Months to Public Launch)

The five sub-phases below break down Phase 1 only. Phases 2–4 are governed by the roadmap in Section 4.4 and are out of scope for this engagement (separate engagement(s) to follow).

| Sub-Phase | Duration | Key Deliverables |
|-----------|----------|------------------|
| **1A. Discovery & Planning** | Weeks 1–3 | Stakeholder interviews, sitemap, wireframes, technical architecture, content audit, design brief |
| **1B. Design** | Weeks 4–7 | UI/UX design (mobile + desktop), design system, component library, interactive prototype, accessibility review |
| **1C. Development** | Weeks 8–14 | Front-end, back-end, CMS setup, feature development, content population, internal QA cycles |
| **1D. Testing & Launch** | Weeks 15–18 | Cross-browser QA, performance testing, security penetration test, UAT with stakeholders, soft launch, public launch |
| **1E. Post-Launch Support (Hypercare)** | Weeks 19–26 | Bug fixes, performance optimization, CMS training, technical documentation, knowledge transfer, Phase 2 planning |

### Key Milestones

| Milestone | Target Week | Success Criteria |
|-----------|-------------|------------------|
| Design Approval | Week 7 | Signed-off Figma/Adobe XD files |
| CMS Admin Ready | Week 10 | Content team can add/edit products |
| Beta Site Live | Week 14 | Staging site with all core features |
| UAT Complete | Week 16 | All critical bugs resolved |
| Public Launch | Week 18 | DNS cutover, monitoring active |
| Phase 1 Complete | Week 20 | All launch-critical features live and stable |

---

## 14. Vendor Evaluation Criteria

Proposals will be evaluated across the following criteria:

| Criteria | Weight | Description |
|----------|--------|-------------|
| **Technical Capability** | 25% | Modern stack expertise, performance optimization, security practices |
| **Industry Experience** | 20% | Prior work with technology, hardware, or B2B manufacturing brands |
| **Design Portfolio** | 20% | Quality of visual design, UX thinking, responsive execution |
| **Project Approach** | 15% | Methodology, communication plan, risk management, QA process |
| **Team Composition** | 10% | Seniority of assigned team, relevant expertise, availability |
| **Pricing & Value** | 10% | Competitive pricing, clear breakdown, value for money |

**Preferred Vendor Characteristics:**
- Experience with **headless CMS + Next.js/Nuxt** architectures
- Portfolio including **product-heavy websites** with filtering/comparison
- Demonstrated **SEO expertise** with measurable results
- **Multi-language website experience**
- Presence or experience in **Middle East or South Asia markets**
- Strong **post-launch support** offerings

---

## 15. Budget Guidance

TwinMOS has allocated a budget for this project. The v3.0 budget reflects the expanded scope formalized via Content Map alignment (287 content entries, 16 sections, 28 regional pages, 34 legal pages, 9 active locales, 11 personas).

| Component | Estimated Range (USD) — v3.0 | Notes |
|-----------|------------------------------|-------|
| **Discovery & Strategy** | $8,000 – $15,000 | Sitemap (16 sections), wireframes, content strategy, Content Map review |
| **UI/UX Design** | $25,000 – $45,000 | Full design system, ~20 distinct page templates, dual modes (Corporate/Gaming), mobile + desktop, accessibility |
| **Front-End Development** | $40,000 – $75,000 | Next.js 15 / Nuxt 3, responsive, animations, performance, dual themes, RTL support architecture |
| **Back-End & CMS** | $30,000 – $55,000 | Headless CMS setup with 16-section model, APIs, product catalog with dual-axis (category × brand), forms, partner-portal foundation, anti-counterfeit foundation |
| **Feature Development** | $35,000 – $65,000 | Compatibility finder (3 search types), where-to-buy with map, comparison, multi-language framework, search (Algolia), regional landings template |
| **Content Population (P1 entries)** | $12,000 – $25,000 | Initial content entry for 287 P1-flagged entries, formatting, image processing, alt-text, SEO metadata |
| **SEO & Analytics Setup** | $5,000 – $9,000 | Structured data per page-type (Product / Article / Organization / FAQ / BreadcrumbList), GA4, GTM, Search Console, hreflang for 28 regional pages |
| **Testing & QA** | $10,000 – $18,000 | Cross-browser (Chrome/Safari/Samsung Internet/Firefox/Edge), performance, security pen-test, WCAG 2.1 AA validation, multi-region CDN testing |
| **Training & Documentation** | $4,000 – $8,000 | CMS training (Admin/Editor/Author/Viewer roles), technical documentation, runbooks |
| **Post-Launch Hypercare (3 months)** | $10,000 – $18,000 | Bug fixes, minor enhancements, P1 → P2 transition planning |
| **TOTAL PHASE 1 (v3.0)** | **$179,000 – $333,000** | Reflects expanded scope vs v2.0's $105K–$201K |

**Phase 2 Budget** (multi-language launch for AR/BN/HI; partner portal full activation; anti-counterfeit SN-Check; live chat with agent routing): **$55,000 – $95,000**

**Phase 3 Budget** (e-commerce evaluation/MVP; RU/ZH/FR languages; advanced analytics; loyalty/referral programs): **$60,000 – $120,000**

**Phase 4 Budget** (ES/PT/DE languages; ongoing CRO/SEO retainer): **TBD per separate engagement**

**Payment Schedule:**
- 20% upon contract signing
- 20% upon design approval
- 20% upon beta delivery
- 20% upon launch
- 20% upon completion of post-launch support period

---

## 16. Proposal Submission Requirements

### 16.1 Procurement Timeline

| Milestone | Date |
|-----------|------|
| **RFP Issue Date** | 29 April 2026 |
| **Vendor Q&A Period Opens** | 5 May 2026 |
| **Vendor Q&A Period Closes** | 19 May 2026 (questions submitted via email) |
| **Consolidated Q&A Response Published** | 22 May 2026 |
| **Proposal Submission Deadline** | 09 June 2026 — 17:00 GST (Dubai time) |
| **Vendor Shortlist Notification** | 23 June 2026 |
| **Vendor Presentations / Pitch Sessions** | 24 June – 08 July 2026 |
| **Final Vendor Selection & Award** | 17 July 2026 |
| **Contract Signing & Project Kickoff** | 24 July 2026 |

*TwinMOS reserves the right to revise the procurement timeline. Vendors will be notified by email of any changes.*

### 16.2 Confidentiality and NDA

- All recipients of this RFP must execute a Non-Disclosure Agreement (NDA) before receiving the BRD, URD, Forensic Audit, or other supporting materials.
- Vendors must not publicly disclose receipt of this RFP, the contents of submitted proposals, or any TwinMOS data shared during the engagement.

### 16.3 Required Documents

1. **Company Profile** — Overview, team size, years in operation, relevant certifications (ISO 27001 preferred), tax/VAT details
2. **Portfolio** — Minimum 3 examples of product-centric or B2B technology websites with clearly stated outcomes
3. **Technical Approach** — Proposed stack, architecture diagram, hosting recommendation, CI/CD plan, observability plan, DR plan
4. **Design Approach** — Sample moodboard or design direction for TwinMOS (optional but preferred)
5. **Project Plan** — Detailed Gantt with milestones, deliverables, dependencies, and risk register
6. **Team Structure** — Key personnel, roles, time allocation, named seniority of leads, location/timezone
7. **Pricing** — Itemized breakdown by sub-phase with payment terms; specify currency (USD)
8. **Support & Maintenance Proposal** — 3-month hypercare offer plus 12-month maintenance retainer options
9. **References** — Minimum 2 client references from similar projects (with contact details)
10. **Compliance Statements** — GDPR, UAE Data Protection Law, India DPDP Act readiness; data-residency commitments
11. **Security Posture** — Approach to OWASP Top 10, dependency management, secrets handling, incident response
12. **Sub-Contractor Disclosure** — Any third-party developers, designers, or services with location and access scope

### 16.4 Submission Format

- PDF format, maximum 50 pages (excluding appendices)
- Include links to live portfolio examples and supporting case studies
- File name convention: `TwinMOS-RFP-Response-[VendorName]-[YYYYMMDD].pdf`
- **Submission email:** `procurement@twinmos.com` (CC: `digital-transformation@twinmos.com`)
- **Vendor questions:** `rfp-queries@twinmos.com` (during the Q&A window only)
- Late or incomplete submissions will be disqualified without further communication.

### 16.5 Evaluation Process

1. **Initial Screening** — Compliance with submission requirements (mandatory documents, NDA executed, format)
2. **Detailed Scoring** — Proposals scored against the criteria in Section 14 by a cross-functional panel
3. **Shortlist** — Top 3–5 vendors selected for presentation
4. **Vendor Presentations** — 60-minute pitch + 30-minute Q&A; remote (Microsoft Teams) acceptable
5. **Reference Checks** — TwinMOS will independently contact named client references
6. **Final Selection** — Based on aggregate evaluation score, references, and commercial negotiation
7. **Award Notification** — Selected vendor and unsuccessful vendors notified by email; debrief available on request

### 16.6 Vendor Eligibility & Disqualification

A proposal will be disqualified if the vendor:
- Has a current or pending legal action against TwinMOS or any TwinMOS group company.
- Cannot demonstrate at least 3 years of continuous operation as a digital agency or development firm.
- Has been banned from any procurement panel (UAE, EU, India) for unethical conduct.
- Fails to execute the NDA prior to receiving supporting materials.
- Submits incomplete or non-compliant documentation.

---

## Appendix A: Competitor Feature Matrix

| Feature | Kingston | Corsair | G.Skill | ADATA | Crucial | Samsung | TEAMGROUP | TwinMOS (Current) | TwinMOS (Target) |
|---------|----------|---------|---------|-------|---------|---------|-----------|-------------------|------------------|
| Product Finder by Device | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P0 |
| Product Comparison | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P0 |
| Where to Buy Locator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P0 |
| E-commerce/Direct Sales | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ P2 |
| Warranty Registration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P1 |
| RMA Portal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P1 |
| Firmware Downloads | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P1 |
| Knowledge Base | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P1 |
| Live Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ P2 |
| Gaming Brand Hub | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P1 |
| News & Events Center | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Broken | ✅ P0 |
| Awards Showcase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P1 |
| Partner Portal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ P2 |
| Multi-Language | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P1 |
| Product Videos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ P2 |
| SSD Management Software | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ P3 |

**Legend:** ✅ = Fully implemented | ⚠️ = Partial/Basic | ❌ = Missing | P0/P1/P2/P3 = Priority level

---

## Appendix B: Proposed Information Architecture (16-Section Model)

> **Authoritative source:** `content/TwinMOS_Website_Content_Map.md` — vendors must scope, design, and price for **all 16 top-level sections** below.

```
twinmos.com/
│
├─ / (Homepage)
│
├─ /products/  ── (Section 4: Products — Catalog Architecture)
│   ├── /products/  (catalog hub)
│   ├── /products/catalog/  (downloadable PDF catalog)
│   ├── /products/compare/  (product comparison page)
│   │
│   ├── /products/memory/
│   │   ├── /ddr5/
│   │   │   ├── /desktop/  (VOLTX, VOLTX RGB)
│   │   │   └── /laptop/   (VOLTX SO-DIMM)
│   │   ├── /ddr4/
│   │   │   ├── /desktop/  (TornadoX7 / TornadoX7 Pro / Thunder GX / Concord RGB)
│   │   │   └── /laptop/   (DDR4 SO-DIMM)
│   │   ├── /ddr3/        (legacy)
│   │   └── /server/      (server/ECC reserved)
│   │
│   ├── /products/ssd/
│   │   ├── /nvme-gen5/   (CoreX Pro)
│   │   ├── /nvme-gen4/   (Xtreme / CoreX / Xtreme Pro)
│   │   ├── /nvme-gen3/   (Alpha Pro / TW300)
│   │   ├── /sata/        (Hyper H2 Ultra / M.2 2280 SATA)
│   │   └── /enterprise/  (reserved)
│   │
│   ├── /products/portable-storage/  (ELITE Drive Pro / ProDrive Ultra; rugged & encrypted reserved)
│   ├── /products/usb-flash/         (Mobile Disk X3)
│   ├── /products/accessories/       (USB Hub 4-Port; card reader reserved)
│   │
│   ├── /products/brands/            ── BRAND-HUB AXIS (NEW IN v3.0)
│   │   ├── /voltx/
│   │   ├── /tornadox7/
│   │   ├── /thunder-gx/
│   │   ├── /concord/
│   │   ├── /corex-pro/
│   │   ├── /xtreme/
│   │   ├── /alpha-pro/
│   │   ├── /hyper-h2-ultra/
│   │   ├── /elite-drive-pro/
│   │   ├── /prodrive-ultra/
│   │   └── /mobile-disk-x3/
│   │
│   └── /products/finder/            ── COMPATIBILITY FINDER
│       ├── /finder-by-laptop/
│       ├── /finder-by-desktop/
│       └── /finder-by-motherboard/
│
├─ /solutions/  ── (Section 5: Vertical Use Cases — NEW IN v3.0)
│   ├── /gaming-enthusiast/
│   ├── /content-creation/
│   ├── /system-builders/
│   ├── /enterprise-smb/
│   ├── /education/
│   ├── /embedded-industrial/
│   ├── /telco-bfsi-government/
│   ├── /data-center/  (reserved)
│   ├── /case-studies/
│   └── /case-study/[slug]/  (template)
│
├─ /gaming/  ── (Section 6: Gaming Hub — VOLTX Brand)
│   ├── /voltx-brand-story/
│   ├── /voltx-products/
│   ├── /rgb-showcase/
│   ├── /rgb-sync-compatibility/
│   ├── /overclocking-xmp-expo/
│   ├── /build-gallery/
│   ├── /build-submit/
│   ├── /esports-sponsorships/
│   ├── /wallpapers/
│   ├── /news-feed/
│   ├── /ambassador-program/  (reserved)
│   └── /rgb-software/        (reserved)
│
├─ /technology/  ── (Section 7: Technology, R&D & Innovation — NEW IN v3.0)
│   ├── /rd-philosophy/
│   ├── /dram-technology/
│   ├── /nand-flash-technology/
│   ├── /controller-technology/
│   ├── /thermal-management/
│   ├── /power-management/
│   ├── /data-security/
│   ├── /data-integrity/
│   ├── /pcie-gen5-deepdive/
│   ├── /jedec-compliance/
│   ├── /patents/
│   ├── /roadmap/  (reserved)
│   └── /whitepapers/
│
├─ /support/  ── (Section 8: Support & Self-Service)
│   ├── /warranty/   (policy / register / lookup / by-region / FAQ)
│   ├── /rma/        (hub / submit / status / policy / out-of-warranty)
│   ├── /downloads/
│   │   ├── /firmware/  (+ FAQ)
│   │   ├── /manuals/
│   │   └── /quick-start-guides/
│   ├── /storage-toolbox/  (reserved)
│   ├── /knowledge-base/   (KB hub + 30+ articles + KB by category: Installation / Troubleshooting / Compatibility / Warranty / General)
│   ├── /faq/              (Memory / SSD / Portable / USB Flash / Warranty / RMA / Firmware / RGB)
│   ├── /install-guides/   (hub + template)
│   ├── /sn-check/         (anti-counterfeit serial number lookup; Phase 2)
│   ├── /counterfeit-policy/
│   ├── /contact-support/
│   ├── /live-chat/        (widget on all pages)
│   └── /support-sla/
│
├─ /learn/  ── (Section 9: Learn / Knowledge Hub — NEW IN v3.0)
│   ├── /buying-guide/    (How to choose RAM / SSD; DDR4 vs DDR5; NVMe vs SATA; PCIe Gen 3/4/5; SO-DIMM vs UDIMM; Portable SSD vs HDD; best-RAM-for-X / best-SSD-for-X; RGB RAM buyer's guide; budget/mid-range/flagship build guides; system-builder + enterprise-fleet procurement guides)
│   ├── /explained/       (What is DDR/DDR5/DDR4/DDR3; DDR architecture; memory bandwidth; CAS latency; memory timings; prefetch buffer; on-die ECC; PMIC; XMP; AMD EXPO; NVMe; PCIe; SATA; 3D TLC NAND; DRAM cache; HMB; TRIM/garbage collection; wear leveling; S.M.A.R.T.; RGB sync; graphene heatsink; ECC memory; M.2 2280; MTBF; power loss protection)
│   ├── /benchmarks/      (template + competitor comparisons + real-world gaming + content creation)
│   ├── /glossary/
│   ├── /stories/         (customer case studies)
│   └── /blog/            (editorial blog + launch posts + event recaps)
│
├─ /where-to-buy/  ── (Section 10a: Where to Buy)
│   ├── /online/
│   ├── /physical-stores/
│   ├── /distributors/
│   ├── /system-builders/
│   └── /retailer/[slug]/  (template + no-retailer state)
│
├─ /partners/  ── (Section 10b: Partners & Channel Programs — Expanded in v3.0)
│   ├── /become-distributor/
│   ├── /become-reseller/
│   ├── /oem-odm-program/
│   ├── /system-builder-program/
│   ├── /distributor-benefits/
│   ├── /distributor-onboarding/
│   ├── /distributor-responsibilities/
│   ├── /portal/  (login + dashboard)
│   ├── /portal/marketing-assets/
│   ├── /portal/price-lists/
│   ├── /portal/training/
│   ├── /portal/events/
│   ├── /mdf-program/  (reserved)
│   ├── /distributor-success-stories/
│   ├── /mea/           (MEA distributor hub)
│   ├── /africa/        (Africa distributor hub)
│   └── /cis/           (CIS distributor hub)
│
├─ /news/  ── (Section 11: News, Press & Events)
│   ├── /  (news hub)
│   ├── /article/[slug]/   (article template)
│   ├── /press-release/[slug]/  (PR template)
│   ├── /event/[slug]/     (event template)
│   ├── /category/product-launches/
│   ├── /category/events/
│   ├── /category/awards/
│   ├── /category/partnerships/
│   ├── /category/press-releases/
│   ├── /category/company-news/
│   ├── /events/  (events hub: COMPUTEX / GITEX / CES / CeBIT MEA / Saudi Tech / India IT Distributors)
│   ├── /media-coverage/
│   └── /newsletter-archive/
│
├─ /[country]/  ── (Section 12: 28 Regional / Localization Landings)
│   ├── /uae-gcc/
│   ├── /india/
│   ├── /pakistan/
│   ├── /saudi-arabia/
│   ├── /qatar/
│   ├── /egypt/
│   ├── /morocco/
│   ├── /algeria/
│   ├── /south-africa/
│   ├── /nigeria/
│   ├── /kenya/
│   ├── /ghana/
│   ├── /ethiopia/
│   ├── /angola/
│   ├── /libya/
│   ├── /cameroon/
│   ├── /namibia/
│   ├── /rwanda/
│   ├── /senegal/
│   ├── /botswana-lesotho/
│   ├── /russia-cis/
│   ├── /europe/
│   ├── /uk/
│   ├── /southeast-asia/
│   ├── /hong-kong/
│   ├── /taiwan/
│   └── /north-america/
│
├─ /careers/  ── (Section 13: Careers — NEW IN v3.0)
│   ├── /  (careers hub)
│   ├── /life-at-twinmos/
│   ├── /benefits/
│   ├── /locations/
│   ├── /departments/
│   ├── /internships/
│   ├── /role/[slug]/  (job listing template)
│   ├── /apply/        (application form)
│   ├── /applicant-privacy/
│   └── /faq/
│
├─ /contact/  ── (Section 14: Contact)
│   ├── /  (contact hub)
│   ├── /general-inquiry/
│   ├── /sales/
│   ├── /technical-support/
│   ├── /distributor/
│   ├── /oem-odm/
│   ├── /quote-request/
│   ├── /media/
│   ├── /warranty/
│   ├── /feedback/
│   ├── /office-locations/
│   │   ├── /dubai-hq/
│   │   ├── /taipei/
│   │   ├── /india/
│   └── /success/  (form-success template)
│
├─ /legal/  ── (Section 15: Legal, Compliance & Trust — Expanded in v3.0)
│   ├── /  (legal hub)
│   ├── /privacy-policy/
│   ├── /cookie-policy/
│   ├── /cookie-preferences/
│   ├── /terms-of-use/
│   ├── /terms-of-sale/
│   ├── /warranty-policy/
│   ├── /acceptable-use/
│   ├── /trademark-policy/
│   ├── /accessibility-statement/
│   ├── /imprint-eu/
│   ├── /supply-chain-disclosure/
│   ├── /modern-slavery-statement/
│   ├── /conflict-minerals/
│   ├── /product-recalls/
│   ├── /counterfeit-policy/
│   ├── /job-applicant-privacy/
│   ├── /vendor-code-of-conduct/
│   ├── /data-deletion-request/
│   ├── /compliance/
│   │   ├── /rohs/
│   │   ├── /reach/
│   │   ├── /ce-marking/
│   │   ├── /ukca-marking/
│   │   ├── /fcc/
│   │   ├── /eac/
│   │   ├── /iso-9001/
│   │   ├── /jedec/
│   │   ├── /bis-india/
│   │   ├── /weee/
│   │   └── /epeat/
│   ├── /security-disclosure/
│   ├── /vulnerability-program/
│   └── /sitemap/
│
├─ /promotions/  ── (Section 16: Marketing Programs & Campaigns — NEW IN v3.0)
│   ├── /  (promotions hub)
│   ├── /[promotion-slug]/  (promotion template)
│   ├── /newsletter/        (signup landing)
│   ├── /newsletter/confirm/
│   ├── /newsletter/unsubscribe/
│   ├── /campaign/corex-pro-launch/
│   ├── /campaign/voltx-rgb-launch/
│   ├── /campaign/india-launch/
│   ├── /loyalty/    (reserved)
│   └── /referral/   (reserved)
│
├─ /about/  ── (Section 3: About / Company)
│   ├── /
│   ├── /history/
│   ├── /leadership/
│   ├── /manufacturing/
│   ├── /quality/
│   ├── /certifications/
│   ├── /awards/
│   ├── /sustainability/
│   ├── /csr/
│   ├── /global-presence/
│   ├── /entities/
│   ├── /why-choose-us/
│   ├── /mission-vision/
│   ├── /press/
│   │   └── /media-kit/
│   ├── /fact-sheet/
│   └── /investors/  (reserved)
│
└─ Site-Wide Components (Section 1)
    ├── (header/navigation)
    ├── (footer)
    ├── (cookie banner)
    ├── (newsletter signup)
    ├── (search bar with results page)
    ├── (language selector — EN + 9 locale buckets)
    ├── (breadcrumb)
    ├── (where-to-buy CTA)
    ├── (trust bar: certifications + countries + heritage)
    ├── /404
    ├── /500
    ├── /maintenance (mode)
    ├── /search
    ├── (skip links)
    └── (microcopy glossary)
```

**Total:** 16 top-level sections, 287 unique content entries (per Content Map), 100+ SKU detail pages (per `_master-sku-reference.md`).

---

## Appendix C: Current Website Forensic Summary

For the complete forensic audit, refer to the companion document:
`TwinMOS_Website_Forensic_Audit.md` (located in the same project folder)

### Quick Reference: Critical Failures

| Category | Critical Count | Key Issues |
|----------|---------------|------------|
| **Technical Infrastructure** | 12 | 404 errors, server failures, broken images, missing legal pages |
| **UX/UI** | 10 | No navigation, empty product pages, no contact info, no CTAs |
| **Content** | 11 | Factual errors (HQ misstated as Taipei), poor grammar, empty sections, no product specs |
| **SEO** | 9 | Duplicate content, missing meta data, thin pages, no sitemap |
| **Missing Features** | 14 | Zero competitive feature parity across 14 standard capabilities |
| **Strategic** | 8 | Brand damage, India unreadiness, zero lead generation |

**Total Critical Issues:** 51 | **Total High-Priority Issues:** 23

---

## Appendix D: Companion Documents

| Document | Version | Purpose | Filename |
|----------|---------|---------|----------|
| TwinMOS Company Profile | 2.0 | Corporate intelligence and context | `TwinMOS_Company_Profile_Comprehensive.md` |
| TwinMOS Website Content Map | 1.0 | **Canonical content blueprint — 287 entries across 16 sections** | `content/TwinMOS_Website_Content_Map.md` |
| TwinMOS Master SKU Reference | 1.0 | Canonical product registry | `content/website-content/_master-sku-reference.md` |
| TwinMOS Forensic Audit (live site) | 1.0 | Current-state problems and gap analysis | `TwinMOS_Website_Forensic_Audit.md` |
| TwinMOS Documents Forensic Alignment Audit | 2.0 | v2.0→v3.0 alignment findings | `TwinMOS_Documents_Forensic_Alignment_Audit_v2.md` |
| TwinMOS Website BRD | 3.0 | Internal business requirements specification | `TwinMOS_Website_BRD.md` |
| TwinMOS Website URD | 3.0 | User-centric functional specifications | `TwinMOS_Website_URD.md` |
| TwinMOS Documents Alignment Changelog | 2.0 | Cross-document alignment history | `TwinMOS_Documents_Alignment_Changelog.md` |

**Source-of-Truth Hierarchy (v3.0):**

1. Company Profile (facts about TwinMOS)
2. Content Map (content scope and IA)
3. `_master-sku-reference.md` (SKU registry)
4. BRD (business rules and project scope)
5. URD (user-facing interaction details)
6. RFP (procurement and contractual scope)

In the event of any conflict between this RFP and the BRD/URD, **the BRD prevails for business scope and rules**, the **URD prevails for user-experience details**, and any unresolved discrepancy must be raised in writing during the Vendor Q&A period.

---

*This RFP is a living document. TwinMOS reserves the right to amend, clarify, or extend requirements during the vendor evaluation process. All information contained herein is confidential and proprietary to TwinMOS Technologies and is shared subject to executed NDA.*

**Document Version:** 3.0 (Content-Aligned Edition)  
**Last Updated:** 30 April 2026  
**Next Review:** Upon vendor shortlist completion (target: 23 June 2026)  
**Synchronized With:** BRD v3.0, URD v3.0, Content Map v1.0, `_master-sku-reference.md`, Forensic Audit v1.0, Documents Forensic Alignment Audit v2.0, Company Profile v2.0
