# Business Requirements Document (BRD)
# TwinMOS Technologies — Corporate Website Development Project

**Document Reference:** TWN-BRD-2026-001  
**Document Version:** 3.0 (Content-Aligned Edition)  
**Status:** FINAL  
**Date:** 30 April 2026  
**Prepared by:** TwinMOS Technologies — Digital Transformation Team  
**Owner:** Marketing Director (Functional) / IT Lead (Implementation)  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Distribution:** Executive Leadership, Project Management, Development Team, QA, Marketing, Sales  
**Synchronized With:** RFP v3.0, URD v3.0, Content Map v1.0, `_master-sku-reference.md`, Forensic Audit v1.0, Forensic Alignment Audit v3.0, Implementation Roadmap v2.1 (15-Phase), Tech Stack v1.1, Implementation Strategy v3.0, Company Profile v2.0  

> **v3.1 patch (2 May 2026):** Targeted forensic-audit corrections applied — BR-22.3 dangling reference at §16.2 acceptance criteria fixed to BR-16.4; brand_line enum at §8.5 expanded from 6 entries with "etc." to all 11 explicit values; RMA workflow state names at §13.3 US-6.4 aligned with Roadmap M11.1.01 (Submitted → Under Review → Approved → In Repair → Shipped → Delivered → Closed). See Forensic Alignment Audit v3.0 §4 for the complete 56-finding catalog and resolution roadmap.

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | April 2026 | TwinMOS Digital Transformation Team | Initial draft based on forensic audit and competitive research |
| 0.2 | April 2026 | TwinMOS Digital Transformation Team | Added user stories, acceptance criteria, data model |
| 1.0 | April 2026 | TwinMOS Digital Transformation Team | Final BRD incorporating RFP, audit, and business proposal inputs |
| 2.0 | 29 April 2026 | TwinMOS Digital Transformation Team | Comprehensive alignment revision: reverted ISO claim to the published TÜV SÜD ISO 9001:2000 (2002) certification; standardized heritage as "27+ years (since 1998)"; clarified manufacturing footprint; standardized phased roadmap; fixed API versioning consistency; clarified UAE Superbrand status; corrected dangling references; aligned warranty rules with Company Profile; resolved Phase-2 timing inconsistency |
| 3.0 | 30 April 2026 | TwinMOS Digital Transformation Team | Content-Aligned Edition: full alignment with `TwinMOS_Website_Content_Map.md` (287 entries) and the on-disk content corpus (351 markdown files across 16 sections). Added 8 new epics (Solutions, Technology/R&D, Learn Hub, Careers, Marketing Programs, Compliance Hub, Anti-Counterfeit, Channel Programs). Added 6 new personas (Embedded/Industrial Engineer, Government/Regulated Enterprise IT, Education IT Administrator, OEM/ODM Partner, Media/Industry Analyst, Job Applicant). Updated content quantity estimates (50→287 entries, 50→100+ SKUs). Updated regional landings (3→28 country pages, 6→9 active locales). Expanded compliance coverage from 9 to 22 trust/legal pages. Added Reserved/Conditional Scope appendix. Updated source-of-truth hierarchy to include Content Map and SKU registry. |

---

## Table of Contents

### Part 1: Business Context
1. [Executive Summary](#1-executive-summary)
2. [Business Objectives & Success Criteria](#2-business-objectives--success-criteria)
3. [Stakeholder Register](#3-stakeholder-register)
4. [Current State Assessment](#4-current-state-assessment)
5. [Future State Vision](#5-future-state-vision)
6. [Business Case & ROI Framework](#6-business-case--roi-framework)

### Part 2: Functional Requirements
7. [User Personas & Journey Maps](#7-user-personas--journey-maps)
8. [Epic 1: Product Discovery & Catalog](#8-epic-1-product-discovery--catalog)
9. [Epic 2: System Compatibility Finder](#9-epic-2-system-compatibility-finder)
10. [Epic 3: Where to Buy / Distributor Locator](#10-epic-3-where-to-buy--distributor-locator)
11. [Epic 4: Lead Generation & Contact Management](#11-epic-4-lead-generation--contact-management)
12. [Epic 5: Content Management](#12-epic-5-content-management)
13. [Epic 6: Support & Self-Service](#13-epic-6-support--self-service)
14. [Epic 7: Partner / Distributor Portal](#14-epic-7-partner--distributor-portal)
15. [Epic 8: Gaming Hub (VOLTX Brand)](#15-epic-8-gaming-hub-voltx-brand)
16. [Epic 9: Multi-Language & Regionalization](#16-epic-9-multi-language--regionalization)
17. [Epic 10: Admin & CMS](#17-epic-10-admin--cms)
18. [Business Rules & Logic](#18-business-rules--logic)
19. [Data Requirements & Entity Model](#19-data-requirements--entity-model)

### Part 3: Non-Functional Requirements
20. [Performance Requirements](#20-performance-requirements)
21. [Security Requirements](#21-security-requirements)
22. [Compliance Requirements](#22-compliance-requirements)
23. [Scalability & Availability](#23-scalability--availability)
24. [Accessibility Requirements](#24-accessibility-requirements)

### Part 4: Integration & Technical
25. [System Integration Requirements](#25-system-integration-requirements)
26. [API Requirements](#26-api-requirements)
27. [Third-Party Services](#27-third-party-services)

### Part 5: Project Management
28. [Success Criteria & KPIs](#28-success-criteria--kpis)
29. [Risk Register](#29-risk-register)
30. [Assumptions & Constraints](#30-assumptions--constraints)
31. [Dependencies](#31-dependencies)
32. [Acceptance Criteria](#32-acceptance-criteria)

### Part 6: Appendices
33. [Appendix A: Glossary](#33-appendix-a-glossary)
34. [Appendix B: Reference Documents](#34-appendix-b-reference-documents)
35. [Appendix C: Competitor Benchmark Summary](#35-appendix-c-competitor-benchmark-summary)
36. [Appendix D: Current Website Issue Log](#36-appendix-d-current-website-issue-log)

---

## 1. Executive Summary

TwinMOS Technologies requires a comprehensive digital transformation of its corporate website (twinmos.com). The current platform is **functionally broken**, with 51 critical issues and 23 high-priority issues (74 total) spanning technical failures, broken user experiences, factually inaccurate content, and zero competitive feature parity.

This Business Requirements Document (BRD) serves as the **authoritative internal specification** for the website redevelopment project. It translates the procurement-focused RFP (`TwinMOS_Website_RFP.md`) into actionable functional and non-functional requirements, complete with user stories, acceptance criteria, business rules, data models, and risk frameworks. The companion User Requirements Document (`TwinMOS_Website_URD.md`) translates these requirements into user-facing interaction specifications.

**Project Mission:** Build a world-class digital platform that matches or exceeds the capabilities of Kingston, Corsair, G.Skill, and ADATA while supporting TwinMOS's strategic expansion into India and other growth markets.

**Business Impact:**
- Transform the website from a brand liability into a competitive asset
- Enable distributor recruitment and partner onboarding at scale
- Drive measurable lead generation and sales inquiry volume
- Establish digital credibility commensurate with **27+ years of industry heritage (since 1998)**

**Source-of-Truth Hierarchy (v3.0):** When resolving any ambiguity, the order of precedence is:
1. Company Profile (`TwinMOS_Company_Profile_Comprehensive.md`) — for facts about TwinMOS
2. **TwinMOS Website Content Map** (`content/TwinMOS_Website_Content_Map.md`) — for content scope, IA, and per-page ownership/phasing **(NEW IN v3.0)**
3. **`_master-sku-reference.md`** — for canonical SKU registry **(NEW IN v3.0)**
4. This BRD — for business rules and scope
5. URD — for user-facing interaction details
6. RFP — for procurement and contractual scope

The Content Map enumerates **287 distinct content entries across 16 top-level categories**. Vendors and the internal team must scope, design, and execute against the Content Map's canonical IA. Where the BRD's older sections describe a 9-section view, the v3.0 expansion below restores parity with the 16-section reality.

---

## 2. Business Objectives & Success Criteria

### 2.1 Primary Business Objectives

| ID | Objective | Priority | Measurement |
|----|-----------|----------|-------------|
| BO-01 | Replace the broken website with a stable, professional platform | P0 | Zero 404 errors on core pages; 99.9% uptime SLA |
| BO-02 | Achieve competitive parity with tier-1 memory brand websites | P0 | 14/14 standard features implemented (see Appendix C) |
| BO-03 | Enable lead generation and distributor recruitment | P0 | 100+ qualified leads/month within 6 months of launch |
| BO-05 | Improve brand credibility and trust signals | P1 | Positive user sentiment in post-launch surveys; reduced bounce rate |
| BO-06 | Drive organic search traffic growth | P1 | 200% increase in organic sessions within 12 months |
| BO-07 | Enable self-service support to reduce manual support burden | P1 | 30% reduction in direct support emails within 6 months |
| BO-08 | Support multi-language expansion | P2 | 3 additional languages live within 6 months of launch |

### 2.2 SMART Success Criteria

| Criterion | Target | Timeline | Owner |
|-----------|--------|----------|-------|
| **Website Uptime** | ≥ 99.9% | Ongoing | DevOps |
| **Page Load Speed (LCP)** | ≤ 2.0 seconds | At launch | Development |
| **Lighthouse Performance Score** | ≥ 90 | At launch | Development |
| **Organic Traffic Growth** | +200% YoY | 12 months post-launch | Marketing |
| **Lead Generation Volume** | 100+ qualified leads/month | 6 months post-launch | Marketing/Sales |
| **Distributor Inquiries** | 20+ qualified inquiries/quarter | 6 months post-launch | Business Development |
| **Bounce Rate** | < 40% | 3 months post-launch | Marketing |
| **Support Ticket Reduction** | 30% reduction | 6 months post-launch | Support |
| **Mobile Traffic Share** | ≥ 60% sessions on mobile | 3 months post-launch | UX/Design |
| **India Page Engagement** | Top 5 most visited country pages | 6 months post-launch | Marketing |

---

## 3. Stakeholder Register

| ID | Stakeholder | Role | Interest | Influence | Engagement Strategy |
|----|-------------|------|----------|-----------|---------------------|
| ST-04 | Marketing Director | Functional Owner | Brand positioning, content, campaigns | High | Weekly working sessions |
| ST-05 | Sales Director | Revenue Stakeholder | Lead quality, distributor onboarding | High | Bi-weekly pipeline reviews |
| ST-06 | Product Manager | Technical Stakeholder | Product accuracy, specs, compatibility | High | Sprint reviews, content validation |
| ST-07 | IT/Technical Lead | Implementation Owner | Architecture, security, maintenance | High | Daily standups during development |
| ST-08 | QA Lead | Quality Stakeholder | Testing, acceptance criteria | Medium | Sprint planning, UAT coordination |
| ST-09 | Legal/Compliance | Risk Stakeholder | Privacy policy, terms, regulatory compliance | Medium | Milestone sign-offs |
| ST-12 | End Users (Gamers, PC Builders) | Customer Stakeholder | Product discovery, compatibility, purchase | High | UX testing, feedback surveys |

---

## 4. Current State Assessment

### 4.1 Executive Summary of Current State

The existing TwinMOS website (twinmos.com) was built on WordPress/WooCommerce but has been **critically neglected**. It fails at the most fundamental level: informing visitors who TwinMOS is, what products are offered, and how to engage with the company.

### 4.2 Critical Findings Summary

> Source: `TwinMOS_Website_Forensic_Audit.md` (April 2026). Total: 51 critical, 23 high-priority issues.

| Domain | Severity | Count | Most Critical Finding |
|--------|----------|-------|----------------------|
| **Technical Infrastructure** | 🔴 CRITICAL | 12 | Multiple 404 errors on core product pages; server errors on warranty/support pages; broken image rendering across all category pages |
| **User Experience** | 🔴 CRITICAL | 10 | No visible navigation; empty product brand pages; no contact information; no CTAs; no search functionality |
| **Content Quality** | 🔴 CRITICAL | 11 | Factually incorrect HQ location (current site claims Taipei; actual operational HQ is DAFZA, Dubai); poor English grammar; empty awards section; no product specifications |
| **SEO & Discoverability** | 🟠 HIGH | 9 | Duplicate content; missing meta descriptions; no structured data; thin category pages; broken internal links |
| **Missing Features** | 🟠 HIGH | 14 | Zero of 14 standard competitor features present (compatibility finder, where-to-buy, warranty registration, etc.) |
| **Strategic Impact** | 🔴 CRITICAL | 8 | Active brand damage; zero lead generation; India market unreadiness; no distributor support |

### 4.3 Business Impact of Current State

| Impact Area | Current Consequence | Quantified Risk |
|-------------|---------------------|-----------------|
| **Brand Perception** | Broken website signals broken company | Distributors question partnership viability |
| **Lead Generation** | 100% of website traffic wasted | Estimated 500+ lost leads/quarter |
| **Competitive Position** | Invisible vs. Kingston, Corsair, ADATA | Market share erosion in all regions |
| **Support Costs** | No self-service options | High manual support burden on Dubai HQ |
| **SEO Equity** | Poor indexing, broken pages | Near-zero organic search visibility |

### 4.4 Salvageable Assets

| Asset | Status | Action |
|-------|--------|--------|
| Domain name (twinmos.com) | ✅ Retain | Keep, improve DNS/SSL |
| Product photography (some) | ⚠️ Review | Audit quality, reshoot if needed |
| Corporate brand assets (logo) | ✅ Retain | May need vector refresh |
| News content (COMPUTEX 2025) | ⚠️ Rewrite | Fact-check, expand, professionalize |
| Product datasheets (PDFs) | ⚠️ Review | Verify accuracy, redesign layout |

**Decision: Complete rebuild required.** Incremental fixes are not viable given the breadth and depth of failures.

---

## 5. Future State Vision

### 5.1 Vision Statement

> "TwinMOS.com will be the definitive digital destination for memory and storage solutions across 93+ countries — a platform that builds trust with enterprise buyers, inspires gamers, empowers distributors, and converts curiosity into commerce."

### 5.2 Future State Capabilities

| Capability | Current State | Future State | Priority |
|------------|---------------|--------------|----------|
| **Product Discovery** | Broken image placeholders | Filterable catalog with specs, comparison, quick view | P0 |
| **Compatibility Checking** | Non-existent | Search by device model or motherboard; QVL integration | P0 |
| **Purchase Path** | Non-existent | "Where to Buy" locator with map, filters, deep links | P0 |
| **Lead Capture** | Zero forms | Multi-type inquiry forms, newsletter, chat | P0 |
| **Distributor Support** | Non-existent | Partner portal, co-branded assets, price lists | P2 |
| **Self-Service Support** | 404 errors | Warranty registration, RMA, firmware, KB, guides | P1 |
| **Content Publishing** | Broken CMS | Intuitive headless CMS with scheduling, versioning | P0 |
| **Multi-Language** | English only | EN, AR, BN, HI, RU, ZH phased rollout | P1 |
| **Gaming Brand Hub** | Non-existent | Immersive VOLTX showcase with RGB, build gallery | P1 |
| **Analytics & Insights** | Non-existent | GA4, GTM, conversion tracking, heatmaps | P1 |

### 5.3 Future State Architecture (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN (Global Edge)                         │
│         Cloudflare / AWS CloudFront / Vercel Edge           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              Front-End (Next.js 15 / App Router)             │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│    │  Corporate  │  │   Gaming    │  │  Partner Portal │   │
│    │   (Light)   │  │   (Dark)    │  │   (Secure)      │   │
│    └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              Headless CMS (Contentful / Sanity)              │
│    Products │ News │ Pages │ Forms │ Assets │ Localization  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Next.js API Routes / tRPC)           │
│    Products │ Compatibility │ Distributors │ Forms │ Auth    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              Data Layer                                      │
│    PostgreSQL │ Algolia Search │ Redis Cache │ File Storage  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Business Case & ROI Framework

### 6.1 Investment Summary

> The phased roadmap below is the authoritative timeline. It must align with RFP §4.4 and URD §1.2.

| Phase | Investment (USD) | Timeline | Scope Highlights |
|-------|------------------|----------|------------------|
| **Phase 1: Core Website** | Solo-developer single-resource cost model (consult TwinMOS PM for monthly rate × duration) | Months 1–8 (Roadmap Phases 1–8; **public launch Feb–Mar 2027** per Roadmap Phase 8 Weeks 29–32) | Full website rebuild; English only; product catalog; compatibility finder; where-to-buy; news/events; support center; contact forms; gaming hub; CMS |
| **Phase 2: Localization & Partner Enablement** | Solo-developer single-resource cost (continuation) | Months 9–12 (Roadmap Phases 9–12; ends ~Jun 2027) | Multi-language (Arabic, Hindi); partner/distributor portal; live chat (Chatwoot); serial-number anti-counterfeit lookup; ERP integration; RMA full workflow; HubSpot CRM; gaming hub interactives |
| **Phase 3: Commerce & Advanced Features** | Solo-developer single-resource cost (continuation) | Months 13–18 (Roadmap Phases 13–14; Jun 2027 – Jan 2028) | E-commerce (Medusa.js v2 or Stripe Checkout per ADR-007); Russian/Chinese-Simplified/French translations; PostHog OSS self-hosted analytics + session replay + A/B testing; Node.js 24 LTS migration per ADR-008 |
| **Phase 3+ / Phase 15: Optimization, Loyalty, ES/PT/DE Launch & Handover** | Solo-developer single-resource cost (continuation) | Months 19+ (Roadmap Phase 15; from Jan 2028) | Loyalty program; referral program; MDF full activation; **ES/PT/DE full launch (per Decision 5A)**; knowledge transfer; Phase 4 retainer transition |
| **Phase 4: Ongoing Retainer** | Retainer (TBD) | Phase 4 retainer scope only | Continuous SEO; CRO; ongoing security updates; further locale expansion; bug fixes |

> **Budget model note (v3.1 patch per Decision 1A):** This BRD was originally budgeted for a vendor/agency engagement at $105K-$201K Phase 1. The Implementation Roadmap v2.1 commits the project to a single solo full-stack developer × 18–24 months. Budget is now expressed as a single-resource cost model — consult TwinMOS PM for the monthly contractor/employment rate. The four-phase month grouping above maps to the 15-phase Roadmap as: Phase 1 ↔ Roadmap Phases 1–8 (Foundation through Phase 1 Launch & Hypercare); Phase 2 ↔ Roadmap Phases 9–12 (Localization Foundation through Phase 2 Launch); Phase 3 ↔ Roadmap Phases 13–14 (E-Commerce + Analytics + RU/ZH/FR); Phase 3+/15 ↔ Roadmap Phase 15 (Optimization + Loyalty + ES/PT/DE launch + Handover); Phase 4 ↔ retainer scope post-handover.
| **Total 15-Month Investment (Phases 1–3)** | **$175,000 – $341,000** | | |

### 6.2 Expected Returns

| Return Category | Conservative | Moderate | Aggressive |
|-----------------|-------------|----------|------------|
| **Incremental Distributor Revenue** (new partnerships) | $200K/year | $500K/year | $1M/year |
| **Direct Lead Value** (100 leads/month × $500 avg) | $600K/year | $600K/year | $600K/year |
| **Support Cost Savings** (30% reduction) | $30K/year | $30K/year | $30K/year |
| **Marketing Efficiency** (organic traffic growth) | $50K/year | $100K/year | $200K/year |
| **Total Annual Benefit** | $880K | $1.23M | $1.83M |
| **Payback Period** | 2.3–3.8 months | 1.7–2.9 months | 1.1–2.2 months |

### 6.3 Intangible Benefits

- **Brand Equity Restoration:** Elimination of active brand damage from broken website
- **Competitive Positioning:** Ability to compete with Kingston, Corsair, G.Skill in digital channels
- **Partner Confidence:** Professional platform that signals company stability and investment
- **Talent Attraction:** Modern digital presence aids recruitment of top-tier distributors and employees

---

## 7. User Personas & Journey Maps

### 7.1 Persona 1: Enthusiast Gamer — "Rahul"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 22–30 years old, India, UAE, Saudi Arabia |
| **Role** | PC gaming enthusiast, system builder, content consumer |
| **Goals** | Build high-performance gaming PC with RGB DDR5 RAM and fast NVMe SSD |
| **Pain Points** | Can't verify if RAM works with motherboard; can't find local retailers; no RGB compatibility info |
| **Devices** | Mobile for discovery (60%), Desktop for research (40%) |
| **Key Needs** | Product specs, benchmarks, RGB sync compatibility, local pricing, where to buy |

**Journey Map:**
1. **Awareness:** Sees TwinMOS VOLTX RGB on YouTube review or gaming forum
2. **Discovery:** Visits twinmos.com on mobile → **CURRENT BARRIER:** Broken homepage, no product info
3. **Evaluation:** Wants to compare VOLTX RGB vs. competitors → **NEEDS:** Product comparison tool, spec tables
4. **Verification:** Needs to confirm compatibility with ASUS ROG motherboard → **NEEDS:** Compatibility finder
5. **Purchase Decision:** Wants to buy locally in Mumbai → **NEEDS:** Where-to-buy with India filter
6. **Post-Purchase:** Wants to register warranty, share build → **NEEDS:** Warranty registration, social sharing

### 7.2 Persona 2: System Integrator — "Kumar"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 35–50 years old, India, runs local PC assembly shop |
| **Role** | SMB owner, bulk buyer, channel partner candidate |
| **Goals** | Source reliable, competitively priced RAM and SSDs in volume; verify motherboard compatibility for customers |
| **Pain Points** | No bulk pricing info; no compatibility database; difficult to reach sales team |
| **Devices** | Desktop (80%), Mobile (20%) |
| **Key Needs** | Compatibility database, bulk pricing inquiry, warranty terms, distributor contact |

**Journey Map:**
1. **Awareness:** Hears about TwinMOS from competitor analysis or trade show
2. **Discovery:** Visits website to evaluate product range → **CURRENT BARRIER:** No product specs, no pricing
3. **Evaluation:** Needs to verify compatibility across 20+ motherboards → **NEEDS:** Bulk compatibility checker
4. **Engagement:** Wants to request bulk pricing → **NEEDS:** "Request Quote" form with volume fields
5. **Partnership:** Interested in becoming authorized dealer → **NEEDS:** "Become a Distributor" application
6. **Ongoing:** Needs marketing materials for shop → **NEEDS:** Partner portal with downloadable assets

### 7.3 Persona 3: Enterprise Procurement — "Sarah"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 40–55 years old, UAE, Saudi Arabia, IT procurement manager |
| **Role** | Corporate buyer, fleet upgrade manager, RFP responder |
| **Goals** | Purchase memory and storage for corporate PC fleet or data center |
| **Pain Points** | No enterprise product section; no volume pricing; no technical documentation |
| **Devices** | Desktop (70%), Tablet (30%) |
| **Key Needs** | Enterprise SKUs, volume pricing, warranty terms, technical docs, RFP response support |

**Journey Map:**
1. **Awareness:** IT director requests memory vendor evaluation
2. **Discovery:** Visits website for company credibility → **CURRENT BARRIER:** Factually incorrect HQ info, broken pages
3. **Evaluation:** Needs enterprise product specs and certifications → **NEEDS:** ISO/RoHS/CE documentation, enterprise product filter
4. **Engagement:** Wants to request formal quote for 500 units → **NEEDS:** Enterprise inquiry form with quantity fields
5. **Decision:** Needs to verify company legitimacy → **NEEDS:** Accurate About Us, leadership info, Dubai HQ confirmation
6. **Ongoing:** Needs warranty and support for purchased units → **NEEDS:** Enterprise support portal

### 7.4 Persona 4: Potential Distributor — "Mr. Patel"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 45–60 years old, India, Africa, CIS, exploring new brand partnerships |
| **Role** | Distribution company owner, portfolio expansion seeker |
| **Goals** | Evaluate TwinMOS as brand to distribute; understand margins, support, exclusivity |
| **Pain Points** | Cannot verify company credibility from website; no partner application; no regional manager contact |
| **Devices** | Desktop (90%), Mobile (10%) |
| **Key Needs** | Company credibility, product portfolio depth, margin structure, partner application, regional contact |

**Journey Map:**
1. **Awareness:** Learns about TwinMOS at COMPUTEX or through industry contacts
2. **Discovery:** Visits website to evaluate brand strength → **CURRENT BARRIER:** Broken site undermines credibility
3. **Evaluation:** Reviews product range and market positioning → **NEEDS:** Complete product catalog with competitive positioning
4. **Engagement:** Wants to apply for distributorship → **NEEDS:** "Become a Distributor" form with territory, company size, experience fields
5. **Due Diligence:** Verifies company history and certifications → **NEEDS:** Accurate About Us, awards, ISO certs
6. **Onboarding:** Needs contracts, price lists, marketing materials → **NEEDS:** Partner portal with secure document access

### 7.5A New Personas Added in v3.0 (Personas 6–11)

The following six personas are added to address the actual content scope (Solutions, Careers, Press, OEM/ODM, etc.) that v2.0 omitted.

#### 7.5.1 Persona 6: Embedded / Industrial Engineer — "Faisal"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 30–55, Middle East, India, light-industry / IoT integration firms |
| **Role** | Embedded systems engineer or industrial-IT specialist |
| **Goals** | Source memory and storage with wide-temperature operation, long-term supply commitments, JEDEC compliance for industrial qualification |
| **Pain Points** | Most tier-1 brands deprecate industrial SKUs after a few years; difficult to find SKUs with supply commitments |
| **Devices** | Desktop 90%, mobile 10% |
| **Key Needs** | Industrial / wide-temp SKU pages, long-term supply assurance, JEDEC and certification documentation, high-MTBF data |
| **Solutions Page Driving:** | `/solutions/embedded-industrial/` |

#### 7.5.2 Persona 7: Government / Regulated Enterprise IT — "Ms. Tan"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 40–55, Telco / BFSI / Government IT in MEA, India, Southeast Asia |
| **Role** | Enterprise IT decision-maker in regulated industry |
| **Goals** | Procure compliant memory and storage with FCC / RoHS / EAC / BIS approvals; ESG documentation; data protection assurances |
| **Pain Points** | Compliance certificates are often hard to find on vendor sites; ESG disclosures absent or generic |
| **Devices** | Desktop 80%, tablet 20% |
| **Key Needs** | Comprehensive Compliance Hub; Modern Slavery, Conflict Minerals, Vendor Code of Conduct disclosures; data security & data integrity technology pages; named compliance certificates |
| **Solutions Page Driving:** | `/solutions/telco-bfsi-government/` |

#### 7.5.3 Persona 8: Education IT Administrator — "Mr. Rahman"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 35–55, education-sector IT (universities, technical institutes, K-12 districts) |
| **Role** | Procurement & support of student/lab/staff devices |
| **Goals** | Bulk procurement of laptop SO-DIMM RAM, SATA SSDs, NVMe SSDs for fleet upgrades; multi-year warranty for school assets |
| **Pain Points** | Educational discount opacity; difficult to negotiate volume terms; warranty doesn't always survive school IT lifecycles |
| **Devices** | Desktop 75%, tablet 25% |
| **Key Needs** | Education Solution page, bulk-quote workflow, school-specific procurement documentation, simple compatibility checking for student devices |
| **Solutions Page Driving:** | `/solutions/education/` |

#### 7.5.4 Persona 9: OEM/ODM Partner — "Mr. Wong"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 40–60, OEM / ODM device manufacturer in Taiwan, China, India, SEA |
| **Role** | Component-sourcing executive for laptop / SBC / industrial-PC OEM |
| **Goals** | Co-engineer or co-brand TwinMOS modules for inclusion in OEM products |
| **Pain Points** | Hard to access OEM-specific datasheets, MOQ terms, and engineering-support contacts |
| **Devices** | Desktop 95%, mobile 5% |
| **Key Needs** | OEM/ODM Program page, engineering-support contact, custom-spec capability disclosure, NDA-protected commercial discussion path |
| **Channel Program Driving:** | `/partners/oem-odm-program/` |

#### 7.5.5 Persona 10: Media / Industry Analyst — "Lina"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 28–45, technology journalist, industry analyst, reviewer, influencer |
| **Role** | Reports on memory / storage industry; needs accurate facts, brand assets, executive bios |
| **Goals** | Quickly find latest TwinMOS press releases, brand assets, and executive contact for interviews |
| **Pain Points** | Most brand sites bury press contacts; brand-asset packages are often outdated |
| **Devices** | Desktop 70%, mobile 30% |
| **Key Needs** | Press Room, Media Kit (logos, brand guidelines, executive headshots), Newsletter Archive, Media Coverage hub, dedicated press@twinmos.com contact |
| **Section Driving:** | `/about/press/` |

#### 7.5.6 Persona 11: Job Applicant — "Sara"
| Attribute | Detail |
|-----------|--------|
| **Demographics** | 22–45, varied geography, varied technical backgrounds |
| **Role** | Active or passive candidate exploring TwinMOS as a workplace |
| **Goals** | Browse open roles, understand culture and benefits, apply with minimal friction |
| **Pain Points** | Long, broken application forms; lack of culture/benefits information; unclear hiring timeline |
| **Devices** | Mobile 60%, desktop 40% |
| **Key Needs** | Careers Hub, Life at TwinMOS, Benefits, Locations, Departments, Internships, role listings, simple application form, Job Applicant Privacy Notice, Careers FAQ |
| **Section Driving:** | `/careers/` |

---

### 7.5 Persona 5: Laptop Upgrader — "Aisha"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 25–40 years old, Middle East, South Asia, non-technical consumer |
| **Role** | Office worker, student, casual user |
| **Goals** | Upgrade laptop RAM or replace HDD with SSD |
| **Pain Points** | Doesn't know which RAM type her laptop needs; afraid of buying wrong product; no local retailer info |
| **Devices** | Mobile (80%), Desktop (20%) |
| **Key Needs** | Simple compatibility checker, SO-DIMM options, installation guides, local retailers |

**Journey Map:**
1. **Awareness:** Laptop is slow; friend suggests RAM/SSD upgrade
2. **Discovery:** Searches "DDR4 laptop RAM Dubai" → lands on TwinMOS → **CURRENT BARRIER:** No product info, no search
3. **Evaluation:** Needs to know what fits her Dell Inspiron → **NEEDS:** Compatibility finder by laptop model
4. **Confidence:** Wants installation guidance → **NEEDS:** Simple video/text installation guide
5. **Purchase:** Wants to buy from local store → **NEEDS:** "Where to Buy" with Dubai filter
6. **Support:** Needs warranty help if product doesn't work → **NEEDS:** Easy warranty claim process

---

## 8. Epic 1: Product Discovery & Catalog

### 8.1 Epic Description
Enable users to discover, explore, compare, and evaluate TwinMOS products through a comprehensive, filterable, and visually rich product catalog.

### 8.2 Business Value
- **Primary:** Product discovery is the #1 reason users visit hardware brand websites
- **Secondary:** Reduce pre-sales support burden through self-service spec access
- **Tertiary:** Enable comparison shopping to position TwinMOS competitively

### 8.3 User Stories

#### US-1.1: Browse Product Categories
> **As a** website visitor,  
> **I want to** browse products by category (Memory, SSD, Portable Storage, USB),  
> **So that** I can quickly find the type of product I'm looking for.

**Acceptance Criteria:**
- [ ] Category navigation is visible in main menu and homepage
- [ ] Categories include: Memory (DDR3/DDR4/DDR5, Desktop/Laptop), SSD (NVMe Gen 3/4/5, SATA), Portable Storage, USB Flash, Accessories
- [ ] Each category page shows sub-categories as clickable cards
- [ ] Category pages load in < 1.5 seconds
- [ ] Category pages are SEO-optimized with unique titles and meta descriptions

#### US-1.2: Filter and Sort Products
> **As a** website visitor,  
> **I want to** filter products by specifications (capacity, speed, interface, type),  
> **So that** I can narrow down to products that meet my needs.

**Acceptance Criteria:**
- [ ] Filter sidebar/panel available on all category pages
- [ ] Memory filters: Type (DDR3/DDR4/DDR5), Capacity (4GB–64GB), Speed (1333MHz–6000MHz), Form Factor (UDIMM/SODIMM), RGB (Yes/No)
- [ ] SSD filters: Interface (SATA/NVMe), Generation (Gen 3/4/5), Capacity (128GB–4TB), Form Factor (2.5"/M.2 2280)
- [ ] Filters update results instantly (AJAX) without full page reload
- [ ] Active filters are shown as removable tags
- [ ] Sort options: Relevance, Price (Low–High), Capacity (Low–High), Speed (High–Low)
- [ ] Filter state is reflected in URL for shareability

#### US-1.3: View Product Detail Page
> **As a** website visitor,  
> **I want to** view detailed specifications and images for a specific product,  
> **So that** I can evaluate whether it meets my requirements.

**Acceptance Criteria:**
- [ ] Product detail page includes: Hero image, product name, model number, short description, full spec table
- [ ] Spec table includes all relevant fields (see business rules)
- [ ] Image gallery with zoom capability; minimum 3 images per product
- [ ] Key features listed as bullet points
- [ ] Warranty information displayed prominently
- [ ] "Where to Buy" CTA visible above the fold
- [ ] Related products section (same category, similar specs)
- [ ] Social sharing buttons
- [ ] Page loads in < 2.0 seconds

#### US-1.4: Compare Products
> **As a** website visitor,  
> **I want to** compare up to 4 products side-by-side,  
> **So that** I can evaluate differences in specifications and make an informed choice.

**Acceptance Criteria:**
- [ ] "Add to Compare" checkbox/button on category and product pages
- [ ] Comparison page shows products in columns with specs in rows
- [ ] Highlighted differences (cells with different values highlighted)
- [ ] Ability to remove products from comparison
- [ ] "Add to Compare" persists across session (localStorage)
- [ ] Comparison page is printable
- [ ] Comparison page is shareable via URL

#### US-1.5: Download Product Datasheet
> **As a** system integrator or enterprise buyer,  
> **I want to** download a PDF datasheet for any product,  
> **So that** I can include it in procurement documents or share with clients.

**Acceptance Criteria:**
- [ ] "Download Datasheet" button visible on all product detail pages
- [ ] PDF includes: Product image, full specifications, features, warranty info, certifications, part number
- [ ] PDF is professionally designed with TwinMOS branding
- [ ] PDF file size < 2MB for fast download
- [ ] PDF is available in English (other languages Phase 2)

### 8.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-1.1 | Every product must have a unique SKU/part number | CMS validation |
| BR-1.2 | Product images must be minimum 1200×1200px, transparent PNG preferred | CMS validation |
| BR-1.3 | Spec tables must include all fields defined in the Product Data Standard | CMS validation |
| BR-1.4 | Discontinued products remain visible but marked "Discontinued" | Auto-status based on date |
| BR-1.5 | New products show "New" badge for first 90 days | Auto-calculation |
| BR-1.6 | Product URLs must follow pattern: `/products/{category}/{product-slug}` | URL generation rule |

### 8.5 Data Requirements

**Product Entity:**
- product_id (UUID)
- sku (string, unique)
- name (string, localized)
- slug (string, unique)
- category_id (FK)
- sub_category_id (FK)
- brand_line (enum: VOLTX, TornadoX7, Thunder_GX, Concord, CoreX_Pro, Xtreme, Alpha_Pro, Hyper_H2_Ultra, ELITE_Drive_Pro, ProDrive_Ultra, Mobile_Disk_X3) — 11 explicit values per Roadmap M2.1.01 / M4.3
- short_description (text, localized)
- long_description (text, localized)
- hero_image (asset)
- gallery_images (array of assets)
- datasheet_pdf (asset)
- specifications (JSON)
- features (array of strings, localized)
- warranty_period_months (integer)
- status (enum: active, discontinued, coming_soon)
- is_new (boolean, auto-calculated)
- is_featured (boolean)
- release_date (date)
- created_at, updated_at (timestamps)

---

## 9. Epic 2: System Compatibility Finder

### 9.1 Epic Description
Enable users to find TwinMOS products compatible with their specific computer system, motherboard, or laptop model. This is the #1 competitive gap identified in the forensic audit.

### 9.2 Business Value
- **Primary:** Reduce purchase hesitation and product returns due to incompatibility
- **Secondary:** Match industry-standard feature offered by ALL competitors
- **Tertiary:** Capture high-intent traffic searching for "[laptop model] RAM upgrade"

### 9.3 User Stories

#### US-2.1: Search by Laptop/Desktop Model
> **As a** laptop or desktop owner,  
> **I want to** enter my computer's brand and model number,  
> **So that** I can see compatible RAM and SSD upgrade options.

**Acceptance Criteria:**
- [ ] Search interface accepts: Brand dropdown (Dell, HP, Lenovo, ASUS, Acer, Apple, etc.) + Model text input
- [ ] Auto-suggest model names as user types (powered by Algolia/Elasticsearch)
- [ ] Results page shows compatible products grouped by category (RAM, SSD)
- [ ] Each result shows: Product image, name, key specs, "View Product" link
- [ ] Results include maximum supported capacity and speed for the device
- [ ] Search works on mobile with native-friendly inputs
- [ ] Search page is SEO-optimized for "[model] RAM upgrade" queries

#### US-2.2: Search by Motherboard Model
> **As a** PC builder or enthusiast,  
> **I want to** enter my motherboard model,  
> **So that** I can find compatible DDR5/DDR4 RAM with verified QVL support.

**Acceptance Criteria:**
- [ ] Search accepts motherboard brand + model (e.g., "ASUS ROG STRIX Z790-E")
- [ ] Results show RAM products with explicit QVL (Qualified Vendor List) status
- [ ] Results indicate supported speeds and capacities for the motherboard
- [ ] XMP/EXPO profile compatibility is displayed
- [ ] Link to motherboard manufacturer's QVL page provided where available

#### US-2.3: Browse Compatible Products from Product Page
> **As a** product researcher,  
> **I want to** see a list of systems/motherboards verified compatible with a specific TwinMOS product,  
> **So that** I can confirm it will work with my setup.

**Acceptance Criteria:**
- [ ] Product detail page includes "Compatible Systems" tab/section
- [ ] List shows motherboard brand, model, and verified speed
- [ ] Pagination for long lists (50+ items)
- [ ] Search within compatible systems list
- [ ] Data sourced from TwinMOS testing lab and motherboard QVLs

### 9.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-2.1 | Compatibility data must be verified by TwinMOS testing lab before publication | Workflow approval |
| BR-2.2 | If a product is NOT tested with a specific motherboard, show "Not Verified" rather than "Incompatible" | Display logic |
| BR-2.3 | Maximum supported capacity/speed for a device is based on manufacturer specs, not TwinMOS product availability | Data sourcing |
| BR-2.4 | Compatibility search results must load in < 2 seconds | Performance monitoring |

### 9.5 Data Requirements

**Compatibility Entity:**
- compatibility_id (UUID)
- product_id (FK)
- device_type (enum: laptop, desktop, motherboard)
- device_brand (string)
- device_model (string)
- device_model_variant (string, optional)
- max_ram_capacity_gb (integer)
- max_ram_speed_mhz (integer)
- supported_ram_types (array: DDR3, DDR4, DDR5)
- qvl_status (enum: tested, not_tested, incompatible)
- tested_speed_mhz (integer, optional)
| tested_capacity_gb (integer, optional)
| notes (text)
| verified_date (date)
| verified_by (string)

---

## 10. Epic 3: Where to Buy / Distributor Locator

### 10.1 Epic Description
Enable users to find authorized TwinMOS retailers, distributors, and online partners in their country or region. Critical for converting product interest into actual sales.

### 10.2 Business Value
- **Primary:** Bridge the gap between product discovery and purchase
- **Secondary:** Showcase distributor network strength to potential partners
- **Tertiary:** Support regional marketing campaigns with localized retailer info

### 10.3 User Stories

#### US-3.1: Find Local Retailers by Country
> **As a** consumer,  
> **I want to** see a map or list of stores in my country that sell TwinMOS products,  
> **So that** I can purchase from a local, authorized retailer.

**Acceptance Criteria:**
- [ ] Page auto-detects user's country via IP geolocation (with manual override)
- [ ] Results shown on interactive map (Google Maps or Mapbox) and list view
- [ ] List view shows: Store name, address, phone, website link, distance
- [ ] Filter by retailer type: Online Store, Physical Store, Distributor, System Builder
- [ ] Each retailer shows which product categories they carry

#### US-3.2: Find Online Purchase Links
> **As a** online shopper,  
> **I want to** click directly to product pages on Amazon, Flipkart, or local e-commerce sites,  
> **So that** I can purchase TwinMOS products from my preferred online retailer.

**Acceptance Criteria:**
- [ ] Product detail page includes "Buy Online" section with retailer logos
- [ ] Deep links to specific product pages on partner sites where available
- [ ] Links open in new tab
- [ ] Affiliate tracking parameters included where applicable (Phase 2)
- [ ] "Buy Online" section is country-aware (shows relevant retailers)

#### US-3.3: Become a Distributor Inquiry
> **As a** business owner,  
> **I want to** submit an inquiry to become an authorized TwinMOS distributor,  
> **So that** I can explore a partnership opportunity.

**Acceptance Criteria:**
- [ ] "Become a Distributor" form accessible from footer, partner page, and Where to Buy page
- [ ] Form fields: Company name, country, contact name, email, phone, website, years in business, current brands distributed, estimated monthly volume, message
- [ ] Form validates email format and required fields
- [ ] Submission sends notification to sales@twinmos.com and regional manager
- [ ] Auto-reply confirmation email to submitter with expected response time (48 hours)
- [ ] Submissions stored in CMS/database with status tracking (New, Contacted, Qualified, Rejected)

### 10.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-3.1 | Only authorized distributors/retailers may be listed | Partner verification workflow |
| BR-3.2 | Distributor information must be reviewed quarterly for accuracy | Calendar reminder + CMS workflow |
| BR-3.4 | Grey market sellers must NOT be listed | Partner verification |

### 10.5 Data Requirements

**Retailer/Distributor Entity:**
- retailer_id (UUID)
- company_name (string)
- type (enum: online_store, physical_store, distributor, system_builder)
- country_code (ISO 3166-1 alpha-2)
| city (string)
| address (string)
| phone (string)
| email (string)
| website_url (string)
| latitude, longitude (decimal)
| product_categories (array of FKs)
| is_authorized (boolean)
| is_featured (boolean)
| status (enum: active, pending, inactive)

---

## 11. Epic 4: Lead Generation & Contact Management

### 11.1 Epic Description
Capture, route, and track inquiries from customers, distributors, and partners through a comprehensive form and contact management system.

### 11.2 Business Value
- **Primary:** Convert website traffic into actionable business opportunities
- **Secondary:** Ensure no inquiry falls through cracks via systematic tracking
- **Tertiary:** Build email marketing list for newsletters and product announcements

### 11.3 User Stories

#### US-4.1: Submit General Inquiry
> **As a** website visitor,  
> **I want to** submit a general question or inquiry through a contact form,  
> **So that** I can receive a response from TwinMOS.

**Acceptance Criteria:**
- [ ] Contact form accessible from main navigation and footer
- [ ] Fields: Name, Email, Country, Subject (dropdown), Message, reCAPTCHA
- [ ] Subject options: General Inquiry, Product Question, Technical Support, Sales, Partnership, Media
- [ ] Form routes to appropriate email based on subject selection
- [ ] Auto-reply confirmation within 5 minutes
- [ ] Submission stored in database with ticket number

#### US-4.2: Request Bulk/Enterprise Quote
> **As a** system integrator or enterprise buyer,  
> **I want to** request a volume pricing quote,  
> **So that** I can evaluate TwinMOS for bulk procurement.

**Acceptance Criteria:**
- [ ] "Request a Quote" form with fields: Company, Contact Name, Email, Phone, Country, Product Interest, Quantity, Target Price (optional), Delivery Timeline, Message
- [ ] File upload for RFP documents (optional, max 10MB)
- [ ] Routes to sales@twinmos.com with high-priority flag
- [ ] Auto-reply with expected response time (24 hours for quotes)

#### US-4.3: Subscribe to Newsletter
> **As a** technology enthusiast,  
> **I want to** subscribe to TwinMOS news and product updates,  
> **So that** I stay informed about new releases and promotions.

**Acceptance Criteria:**
- [ ] Newsletter signup form in footer and on news pages
- [ ] Fields: Email, Country (optional), Product Interests (checkboxes)
- [ ] Double opt-in confirmation email
- [ ] GDPR-compliant unsubscribe link in every email
- [ ] Integration with email marketing platform (Mailchimp/SendGrid)

#### US-4.4: Live Chat Support
> **As a** website visitor with a quick question,  
> **I want to** start a live chat with a support agent,  
> **So that** I can get immediate assistance.

**Acceptance Criteria:**
- [ ] Chat widget visible on all pages (bottom-right)
- [ ] Business hours display (based on Dubai timezone)
- [ ] Offline mode captures email for follow-up
- [ ] Chat transcripts emailed to visitor
- [ ] Integration with support ticket system

### 11.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-4.1 | All form submissions must receive auto-reply within 5 minutes | System automation |
| BR-4.2 | Sales inquiries must be responded to within 24 business hours | SLA monitoring |
| BR-4.3 | Support inquiries must be responded to within 48 business hours | SLA monitoring |
| BR-4.4 | Distributor inquiries must be responded to within 48 business hours | SLA monitoring |
| BR-4.5 | Newsletter subscribers must confirm opt-in before receiving emails | Double opt-in workflow |
| BR-4.6 | All personal data collection must comply with GDPR/UAE/India regulations | Privacy policy + consent |

### 11.5 Data Requirements

**Inquiry Entity:**
- inquiry_id (UUID)
- inquiry_type (enum: general, sales, support, partnership, media, quote)
| submitter_name (string)
| submitter_email (string)
| submitter_phone (string, optional)
| submitter_company (string, optional)
| submitter_country (string)
| subject (string)
| message (text)
| product_interest (array of FKs, optional)
| quantity (integer, optional)
| attachment_url (string, optional)
| status (enum: new, assigned, in_progress, resolved, closed)
| assigned_to (string)
| priority (enum: low, medium, high, urgent)
| ticket_number (string, unique)
| created_at, updated_at (timestamps)

---

## 12. Epic 5: Content Management

### 12.1 Epic Description
Enable TwinMOS marketing and communications teams to publish, manage, and distribute content including news, press releases, event coverage, and awards.

### 12.2 Business Value
- **Primary:** Establish thought leadership and keep the website fresh
- **Secondary:** Support SEO through regular, keyword-optimized content
- **Tertiary:** Showcase company activity and momentum to distributors and investors

### 12.3 User Stories

#### US-5.1: Publish News Article
> **As a** marketing manager,  
> **I want to** publish news articles with images, videos, and formatted text,  
> **So that** I can communicate product launches, partnerships, and events.

**Acceptance Criteria:**
- [ ] Rich text editor with image upload, video embed, heading styles
- [ ] Article metadata: Title, slug, excerpt, author, publish date, category, tags, featured image
- [ ] Scheduling: Publish immediately or schedule for future date
- [ ] Preview mode before publishing
- [ ] SEO fields: Meta title, meta description, Open Graph image
- [ ] Category options: Product Launch, Event, Award, Partnership, Press Release, Company News

#### US-5.2: Manage Event Pages
> **As a** marketing manager,  
> **I want to** create dedicated pages for trade shows and events (e.g., COMPUTEX),  
> **So that** I can showcase booth info, product demos, and photo galleries.

**Acceptance Criteria:**
- [ ] Event template includes: Event name, date, location, booth number, description
- [ ] Photo gallery with lightbox viewer
- [ ] Video embeds (YouTube/Vimeo)
- [ ] Product showcase section linking to featured products
- [ ] "Contact us at the event" CTA
- [ ] Past events archived in chronological order

#### US-5.3: Showcase Awards & Certifications
> **As a** marketing manager,  
> **I want to** display company awards and product certifications,  
> **So that** I can build trust and credibility with visitors.

**Acceptance Criteria:**
- [ ] Awards page with: Award name, awarding body, year, category, description, image of award/certificate
- [ ] Certification badges displayed on relevant product pages (ISO 9001, CE, UKCA, FCC, RoHS, REACH; JEDEC for DRAM)
- [ ] Filterable by year and category
- [ ] Each award entry must include a stored image of the certificate or trophy in the CMS — no award is published without verification (see BR-5.5)
- [ ] If UAE Superbrand 2022 is verified by Marketing, it is featured prominently; otherwise it is omitted

### 12.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-5.1 | All published content must be reviewed by a second person before going live | CMS workflow (draft → review → published) |
| BR-5.2 | News articles should be published within 48 hours of the event/announcement | Editorial guideline |
| BR-5.3 | Images in articles must be WebP format with JPEG fallback | CMS image processing |
| BR-5.4 | Press releases must include boilerplate company description at bottom | Template enforcement |
| BR-5.5 | Awards may not be published without an attached image of the certificate/trophy and a verified date and awarding body | CMS field validation + Marketing approval |

---

## 13. Epic 6: Support & Self-Service

### 13.1 Epic Description
Enable users to self-serve for warranty registration, firmware downloads, troubleshooting, and support inquiries — reducing manual support burden on TwinMOS staff.

### 13.2 Business Value
- **Primary:** Reduce support email volume and response time
- **Secondary:** Improve customer satisfaction through instant self-service
- **Tertiary:** Build product registration database for warranty tracking

### 13.3 User Stories

#### US-6.1: Register Product Warranty
> **As a** product owner,  
> **I want to** register my TwinMOS product purchase online,  
> **So that** I can activate my warranty and receive support.

**Acceptance Criteria:**
- [ ] Warranty registration form: Product (dropdown), Serial Number, Purchase Date, Retailer, Upload Receipt (optional)
- [ ] Auto-confirmation email with registration details and warranty expiration
- [ ] Registration lookup by email + serial number
- [ ] Dashboard showing registered products and warranty status

#### US-6.2: Download Firmware & Software
> **As a** product owner,  
> **I want to** download the latest firmware and management software for my SSD,  
> **So that** I can maintain optimal performance and security.

**Acceptance Criteria:**
- [ ] Firmware download center organized by product category and model
- [ ] Each download shows: Version, release date, file size, changelog, compatibility
- [ ] Download requires serial number validation (anti-piracy)
- [ ] Checksum (MD5/SHA256) provided for verification
- [ ] Warning/disclaimer about backup before firmware update

#### US-6.3: Browse Knowledge Base
> **As a** product user,  
> **I want to** search a knowledge base for troubleshooting articles and FAQs,  
> **So that** I can resolve issues without contacting support.

**Acceptance Criteria:**
- [ ] Searchable KB with categories: Installation, Troubleshooting, Compatibility, Warranty, General
- [ ] Article ratings ("Was this helpful?") for feedback
- [ ] Related articles at bottom of each page
- [ ] Video tutorials embedded where available
- [ ] FAQ page with accordion-style Q&A

#### US-6.4: Submit RMA Request
> **As a** product owner with a defective unit,  
> **I want to** submit a return merchandise authorization request,  
> **So that** I can get a replacement under warranty.

**Acceptance Criteria:**
- [ ] RMA form: Product, Serial Number, Purchase Date, Issue Description, Upload Photo/Video (optional)
- [ ] Auto-check of warranty status based on registration data
- [ ] RMA number generated upon submission
- [ ] Status tracking page (7-state customer-facing workflow): Submitted → Under Review → Approved → In Repair → Shipped → Delivered → Closed (per Roadmap M11.1.01)
- [ ] Email notifications at each status change (Resend branded templates per Roadmap T-11.1.04)

### 13.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-6.1 | Warranty period is configured per product line; current standard = **Limited Lifetime** for DRAM modules, **5 years** for NVMe SSDs, **3 years** for SATA SSDs and portable storage. Final warranty terms must be confirmed with TwinMOS before launch and reflected in product CMS data. | Product data rule + final sign-off by Product Manager |
| BR-6.2 | RMA is only processed if product is within warranty period | System validation |
| BR-6.3 | Firmware downloads require valid serial number | Form validation |
| BR-6.4 | KB articles must be reviewed quarterly for accuracy | Editorial calendar |
| BR-6.5 | Product page must display the exact warranty term as configured in the CMS — never an aspirational or hard-coded value | CMS-driven display |

---

## 14. Epic 7: Partner / Distributor Portal

### 14.1 Epic Description
Provide a secure, password-protected portal for authorized distributors to access co-branded marketing assets, price lists, and partner resources.

### 14.2 Business Value
- **Primary:** Empower distributors with self-service marketing tools
- **Secondary:** Reduce manual asset distribution by TwinMOS staff
- **Tertiary:** Strengthen distributor loyalty through exclusive access

### 14.3 User Stories

#### US-7.1: Access Partner Portal
> **As an** authorized distributor,  
> **I want to** log in to a secure partner portal,  
> **So that** I can access confidential pricing and marketing materials.

**Acceptance Criteria:**
- [ ] Login page with email + password
- [ ] Password reset via email
- [ ] Two-factor authentication (optional, P2)
- [ ] Session timeout after 30 minutes of inactivity
- [ ] Account lockout after 5 failed attempts

#### US-7.2: Download Marketing Assets
> **As a** distributor marketing manager,  
> **I want to** download co-branded banners, product images, and datasheets,  
> **So that** I can use them in my local marketing campaigns.

**Acceptance Criteria:**
- [ ] Asset library organized by: Product Images, Banners (web/print), Datasheets, Videos, POS Materials, Logos
- [ ] Filter by product, language, format
- [ ] Bulk download as ZIP
- [ ] Preview before download

#### US-7.3: Access Price Lists
> **As a** distributor procurement manager,  
> **I want to** view current distributor pricing and MOQ information,  
> **So that** I can plan my inventory and margins.

**Acceptance Criteria:**
- [ ] Price list viewable only to logged-in authorized distributors
- [ ] Organized by product category with SKU, description, unit price, MOQ, volume tiers
- [ ] Currency display based on distributor region
- [ ] Effective date and revision history visible
- [ ] Download as Excel/PDF

### 14.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-7.1 | Portal access is by invitation only; self-registration not permitted | Admin-only account creation |
| BR-7.2 | Price lists are confidential and watermarked with distributor name | PDF watermarking |
| BR-7.3 | Marketing assets may be used only by authorized distributors for TwinMOS product promotion | Terms of use acceptance |

---

## 15. Epic 8: Gaming Hub (VOLTX Brand)

### 15.1 Epic Description
Create an immersive, visually striking subsection of the website dedicated to the VOLTX gaming brand — showcasing RGB products, overclocking capabilities, and gaming community content.

### 15.2 Business Value
- **Primary:** Differentiate VOLTX in the competitive gaming memory market
- **Secondary:** Inspire gamers and system builders with visual content
- **Tertiary:** Support social media and influencer marketing with shareable content

### 15.3 User Stories

#### US-8.1: Explore VOLTX Brand Page
> **As a** gamer,  
> **I want to** explore a dedicated VOLTX brand page with dark, immersive design,  
> **So that** I can experience the gaming brand identity and see products in context.

**Acceptance Criteria:**
- [ ] Dark-themed landing page with bold typography, RGB accents, animated elements
- [ ] Hero section with VOLTX product showcase video or animation
- [ ] Product grid showing VOLTX and VOLTX RGB lines
- [ ] "Build Your RGB Setup" visualizer (P2)
- [ ] Link to gaming news and community content

#### US-8.2: View RGB Lighting Showcase
> **As a** RGB enthusiast,  
> **I want to** see how VOLTX RGB memory looks with different lighting effects,  
> **So that** I can imagine it in my build.

**Acceptance Criteria:**
- [ ] Interactive RGB showcase showing memory modules with different lighting presets
- [ ] Sync compatibility badges: ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light, ASRock Polychrome
- [ ] Video demonstrations of RGB effects in real builds

#### US-8.3: Submit Build Gallery Entry
> **As a** proud VOLTX owner,  
> **I want to** submit a photo of my PC build featuring TwinMOS products,  
> **So that** I can be featured in the community gallery.

**Acceptance Criteria:**
- [ ] Submission form: Name, Location, Build Specs, Photo Upload (max 5 images)
- [ ] Admin moderation before publication
- [ ] Gallery page with filterable grid
- [ ] Social sharing for individual builds

### 15.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-8.1 | Gaming hub must load performance-optimized assets (compressed videos, lazy-loaded images) | Performance budgets |
| BR-8.2 | Build gallery submissions must be moderated before publication | CMS workflow |
| BR-8.3 | RGB showcase must work on mobile (simplified version acceptable) | Responsive design |

---

## 16. Epic 9: Multi-Language & Regionalization

### 16.1 Epic Description
Support multiple languages and regional content to serve TwinMOS's global audience across 93+ countries.

### 16.2 Business Value
- **Primary:** Serve core markets in native languages (Arabic, Hindi)
- **Secondary:** Improve SEO in non-English markets
- **Tertiary:** Demonstrate global commitment to distributors and partners

### 16.3 User Stories

#### US-9.1: Switch Website Language
> **As a** non-English speaker,  
> **I want to** switch the website to my preferred language,  
> **So that** I can understand product information in my native language.

**Acceptance Criteria:**
- [ ] Language selector in header (dropdown or flags)
- [ ] Languages: English (default), Arabic, Hindi, Russian, Chinese (Simplified)
- [ ] Language preference persists across sessions (localStorage/cookie)
- [ ] URL structure: `/en/products/`, `/ar/products/`, `/hi/products/`
- [ ] Hreflang tags implemented for all language variants

#### US-9.2: View Region-Specific Content
> **As a** visitor from India,  
> **I want to** see India-specific content including local distributor and pricing,  
> **So that** I can make purchase decisions relevant to my market.

**Acceptance Criteria:**
- [ ] Auto-detect country and show regional content
- [ ] Regional landing pages: verified local distributor and pricing information
- [ ] Middle East page: Arabic content, local distributor list
- [ ] Manual country override available

### 16.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-9.1 | English content is the source of truth; translations must be reviewed by native speakers | Editorial workflow |
| BR-9.2 | RTL (right-to-left) layout required for Arabic | CSS direction handling |
| BR-9.3 | Currency is informational only in Phase 1; actual e-commerce in Phase 3 | Display logic |
| BR-9.4 | All language variants must have unique URLs and canonical tags | SEO rule |

---

## 17. Epic 10: Admin & CMS

### 17.1 Epic Description
Provide TwinMOS staff with an intuitive content management system to manage products, content, users, and website configuration without developer intervention.

### 17.2 Business Value
- **Primary:** Empower non-technical staff to manage website content
- **Secondary:** Reduce time-to-market for new product launches
- **Tertiary:** Enable content scheduling and workflow management

### 17.3 User Stories

#### US-10.1: Manage Products
> **As a** product manager,  
> **I want to** add, edit, and remove products from the catalog,  
> **So that** the website always reflects current product availability.

**Acceptance Criteria:**
- [ ] Product creation form with all required fields (see Epic 1 data model)
- [ ] Image upload with automatic resize (thumbnail, gallery, hero)
- [ ] Rich text editor for descriptions
- [ ] JSON editor for structured specifications
- [ ] Bulk import/export via CSV/Excel
- [ ] Product status: Draft, Scheduled, Published, Discontinued

#### US-10.2: Manage Content Pages
> **As a** marketing manager,  
> **I want to** create and edit website pages without coding,  
> **So that** I can publish marketing content quickly.

**Acceptance Criteria:**
- [ ] Visual page builder or structured content editor
- [ ] Pre-built component library: Hero, Text+Image, Feature Grid, Testimonials, CTA, FAQ
- [ ] SEO metadata fields for every page
- [ ] Preview before publish
- [ ] Revision history with ability to revert
- [ ] Scheduling: Publish now or future date

#### US-10.3: Manage User Accounts
> **As an** admin,  
> **I want to** create and manage CMS user accounts with role-based permissions,  
> **So that** team members have appropriate access levels.

**Acceptance Criteria:**
- [ ] Roles: Admin, Editor, Author, Viewer
- [ ] Permission matrix: Products, Content, Forms, Users, Settings, Analytics
- [ ] Activity log showing who changed what and when
- [ ] Password policy enforcement

### 17.4 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-10.1 | Only Admins can create new user accounts | RBAC |
| BR-10.2 | Product changes affecting specifications require approval | Workflow |
| BR-10.3 | Content must be saved as draft before publishing | CMS validation |
| BR-10.4 | Deleted content is soft-deleted (recoverable for 30 days) | Data retention |

---

## 17A. Epics 11–18 — Content-Map Aligned Scope (NEW IN v3.0)

> The eight epics below were added in v3.0 to align the BRD with the canonical Content Map. They formalize content domains that v2.0 either omitted entirely or treated implicitly. Acceptance criteria use the same template as Epics 1–10 and reference the Content Map sections by number.

---

## 11. Epic 11: Solutions / Vertical Use Cases

> **Content Map:** §5 (`04-solutions/`, 11 entries)
> **RFP Ref:** RFP-FR-9
> **Primary Personas:** Sarah (Enterprise), Mr. Patel (Distributor), plus new personas: Embedded/Industrial Engineer, Telco/BFSI/Government IT, Education IT Administrator
> **Priority:** P1 (Phase 1)

### 11.1 Description
Vertical use-case landing pages that translate TwinMOS's product portfolio into industry-specific value propositions. Mirrors competitor pattern (Kingston Solutions, ADATA Industrial, Crucial Workstation/Server).

### 11.2 User Stories

#### US-11.1: Browse Solutions by Vertical
> **As a** B2B buyer in a specific industry,
> **I want to** see TwinMOS products and bundles tailored to my industry,
> **So that** I can shortcut the discovery process.

**Acceptance Criteria:**
- [ ] Solutions Hub at `/solutions/` with vertical-tile navigation
- [ ] Verticals: Gaming Enthusiast, Content Creation, System Builders, Enterprise SMB, Education, Embedded/Industrial, Telco/BFSI/Government
- [ ] Each vertical page includes: industry context, recommended product bundles, certification highlights relevant to that vertical (e.g., FCC + RoHS + EAC for telco), case-study links, contact CTA
- [ ] Cross-link to Case Studies Hub
- [ ] Reserved: Data Center Solution (activates when enterprise SSD line is launched — Phase 3+)

#### US-11.2: Read Case Studies
> **As a** prospective customer or partner,
> **I want to** see how other organizations use TwinMOS products,
> **So that** I gain confidence the brand is viable for my use case.

**Acceptance Criteria:**
- [ ] Case Studies Hub at `/solutions/case-studies/`
- [ ] Case Study Template includes: customer profile, challenge, TwinMOS solution, products deployed, metrics/outcomes, customer quote, downloadable PDF
- [ ] Filter by vertical, region, product family

### 11.3 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-11.1 | Each Solutions page must reference at least 3 specific TwinMOS SKUs | CMS validation |
| BR-11.2 | Case studies require explicit customer approval (signed release) before publication | Editorial workflow |
| BR-11.3 | Reserved Solutions (Data Center) must not be linked from main navigation until activated | Status-based visibility |

---

## 12. Epic 12: Technology, R&D & Innovation

> **Content Map:** §7 (`06-technology/`, 14 entries)
> **RFP Ref:** RFP-FR-10
> **Primary Personas:** Mr. Patel (Distributor), Sarah (Enterprise), Kumar (System Integrator)
> **Priority:** P1 (Phase 1)

### 12.1 Description
A credibility-and-thought-leadership hub showcasing TwinMOS R&D investment, technology architecture, and engineering depth. Critical for B2B partner-recruitment and enterprise procurement due-diligence.

### 12.2 User Stories

#### US-12.1: Read Technology Article
> **As a** technically-inclined visitor,
> **I want to** understand TwinMOS's approach to memory and storage technology,
> **So that** I can assess the brand's technical maturity.

**Acceptance Criteria:**
- [ ] Technology Hub at `/technology/` with tile navigation
- [ ] Sub-pages: R&D Philosophy, DRAM Technology, NAND Flash Technology, Controller Technology, Thermal Management, Power Management, Data Security, Data Integrity, PCIe Gen 5 Deep-Dive, JEDEC Compliance
- [ ] Each article supports rich content: diagrams, code blocks, benchmark tables, embedded videos
- [ ] Each article cross-links to relevant products
- [ ] SEO-optimized for technical search queries

#### US-12.2: Download Whitepaper
> **As a** technical evaluator,
> **I want to** download in-depth whitepapers,
> **So that** I can study TwinMOS technology offline or share with my team.

**Acceptance Criteria:**
- [ ] Whitepapers Hub at `/technology/whitepapers/`
- [ ] Each whitepaper: title, abstract, author, publish date, PDF download
- [ ] Optional gating (email + company) for premium whitepapers — Phase 2
- [ ] Track downloads per whitepaper in analytics

#### US-12.3: View Patents
> **As a** distributor or competitor analyst,
> **I want to** see TwinMOS's IP portfolio,
> **So that** I understand the depth of innovation.

**Acceptance Criteria:**
- [ ] Patents page lists patent number, title, jurisdiction, status, filing date
- [ ] Optional links to USPTO / EPO / CNIPA records

### 12.3 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-12.1 | All technology claims must be substantiated by engineering review before publication | Editorial workflow |
| BR-12.2 | Whitepapers must pass legal review for any forward-looking statements | Legal sign-off |
| BR-12.3 | Patents page must be updated quarterly | Calendar reminder |
| BR-12.4 | Reserved: Roadmap page activates only with executive approval (commercial-sensitive) | Status flag |

---

## 13. Epic 13: Learn / Knowledge Hub

> **Content Map:** §9 (`08-learn/`, 64 entries — the largest section)
> **RFP Ref:** RFP-FR-11
> **Primary Personas:** All — but especially Aisha (Laptop Upgrader) and Rahul (Gamer) for top-of-funnel SEO
> **Priority:** P1 (Phase 1)

### 13.1 Description
The Learn Hub is the website's primary organic-traffic engine. It is **separate from Support** (which handles transactional KB/troubleshooting) and contains evergreen educational content: buying guides, explained articles, benchmarks, glossary, stories, and blog.

### 13.2 User Stories

#### US-13.1: Read Buying Guide
> **As a** prospective buyer,
> **I want to** read a guide that helps me choose the right product,
> **So that** I can purchase with confidence.

**Acceptance Criteria:**
- [ ] Buying Guide Hub at `/learn/buying-guide/`
- [ ] Articles: How to Choose RAM, How to Choose an SSD, NVMe vs SATA, PCIe Gen 3 vs 4 vs 5, SO-DIMM vs UDIMM, Portable SSD vs HDD, RGB RAM Buyer's Guide, Best RAM/SSD for Gaming/Content/Laptops, Build Guides (Budget / Mid-Range / Flagship), System Builder Procurement Guide, Enterprise Fleet Upgrade Guide, DDR4 vs DDR5
- [ ] Each guide cross-links to relevant TwinMOS products (call-to-action sidebar)

#### US-13.2: Read "Explained" Article
> **As a** curious or new visitor,
> **I want to** understand a specific technical concept,
> **So that** I can make informed decisions.

**Acceptance Criteria:**
- [ ] Explained Hub at `/learn/explained/`
- [ ] Articles: What is DDR / DDR3 / DDR4 / DDR5; DDR architecture; memory bandwidth; CAS latency; memory timings; prefetch buffer; on-die ECC; PMIC; XMP; AMD EXPO; NVMe; PCIe; SATA SSD; 3D TLC NAND; DRAM cache on SSD; HMB; TRIM and garbage collection; wear leveling; S.M.A.R.T. monitoring; RGB sync; graphene heatsink; ECC memory; M.2 2280 form factor; MTBF; power-loss protection
- [ ] Each article uses plain language (Aisha-readable) with optional "deep dive" expansion
- [ ] Glossary terms link bidirectionally

#### US-13.3: View Benchmarks
> **As a** performance-conscious buyer,
> **I want to** see independent or in-house benchmarks,
> **So that** I can compare TwinMOS performance against competitors.

**Acceptance Criteria:**
- [ ] Benchmarks Hub at `/learn/benchmarks/`
- [ ] Benchmark template includes: methodology, test rig, results table, charts, conclusions, methodology disclosure
- [ ] Comparisons: CoreX Pro vs Competitors, VOLTX RGB vs Competitors, Real-World Gaming, Content Creation
- [ ] All benchmarks must disclose methodology (BR-13.3)

#### US-13.4: Read Stories / Blog
> **As a** brand follower,
> **I want to** read the company blog,
> **So that** I stay engaged.

**Acceptance Criteria:**
- [ ] Blog at `/learn/blog/`
- [ ] Stories at `/learn/stories/`
- [ ] Editorial calendar with consistent publishing cadence (target: 2 posts/week minimum after launch)
- [ ] Categories include: Launch Posts (CoreX Pro, VOLTX RGB), Event Recaps (COMPUTEX 2025), Industry Analysis

### 13.3 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-13.1 | Learn Hub content must be reviewed for technical accuracy by Product Manager before publication | Editorial workflow |
| BR-13.2 | Buying guides must include current model recommendations updated quarterly | Calendar reminder |
| BR-13.3 | All benchmarks must disclose hardware test rig, methodology, and test runs | Template enforcement |
| BR-13.4 | Glossary entries must use consistent terminology with product spec tables | Cross-reference check |
| BR-13.5 | Blog posts must include author byline and publish date | Template enforcement |

---

## 14. Epic 14: Careers

> **Content Map:** §13 (`12-careers/`, 10 entries)
> **RFP Ref:** RFP-FR-13
> **Primary Persona:** Job Applicant (NEW)
> **Priority:** P1 (Phase 1)

### 14.1 Description
Recruitment and employer-brand microsite. Supports the strategic outlook of "talent attraction" stated in Company Profile §12.

### 14.2 User Stories

#### US-14.1: Browse Open Roles
> **As a** job seeker,
> **I want to** see all open positions at TwinMOS,
> **So that** I can apply to roles matching my skills.

**Acceptance Criteria:**
- [ ] Job listings page with filters by location, department, level
- [ ] Each role shows: title, location, department, summary, full description, requirements, apply CTA
- [ ] Listings can be archived after position is filled

#### US-14.2: Submit Application
> **As a** job seeker,
> **I want to** apply to a role,
> **So that** TwinMOS HR can evaluate my candidacy.

**Acceptance Criteria:**
- [ ] Multi-step application form with CV upload (PDF/DOC, max 10MB)
- [ ] GDPR consent + Job Applicant Privacy Notice disclosure before submission
- [ ] Auto-confirmation email to applicant
- [ ] Application stored in CMS or routed to ATS (if integration exists)
- [ ] Optional: subscribe-to-job-alerts checkbox

#### US-14.3: Read Life at TwinMOS / Benefits / Internships
> **As a** prospective candidate,
> **I want to** understand the company culture and benefits,
> **So that** I can decide whether TwinMOS is a fit.

**Acceptance Criteria:**
- [ ] Life at TwinMOS page with culture story, photos, employee testimonials (signed release required per BR-14.2)
- [ ] Benefits page with healthcare, retirement, time-off, learning programs
- [ ] Internships page with student-focused content and applicant pathway
- [ ] Locations page with map and office summaries (Taipei HQ, Dubai, Cologne, San Jose)
- [ ] Departments page with Engineering, Marketing, Sales, Operations, etc.
- [ ] Careers FAQ page

### 14.3 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-14.1 | All job listings must include location, salary band (where required by law), and equal-opportunity statement | Template enforcement |
| BR-14.2 | Employee testimonials require signed release before publication | Editorial workflow |
| BR-14.3 | Application data is retained per Applicant Privacy Notice (default 24 months) | Automated purge |
| BR-14.4 | Application submissions in EU require explicit consent checkbox per GDPR Art. 13 | Form design |

---

## 15. Epic 15: Marketing Programs & Campaigns

> **Content Map:** §16 (`15-marketing/`, 11 entries)
> **RFP Ref:** RFP-FR-14
> **Primary Personas:** All — campaign-specific
> **Priority:** P1 (Phase 1) for newsletter/promotions; P2/P3 for loyalty/referral

### 15.1 Description
Newsletter lifecycle pages, promotions hub, launch campaigns, cross-sell components, exit-intent popup, plus reserved Loyalty / Referral programs (Phase 3+).

### 15.2 User Stories

#### US-15.1: Subscribe / Confirm / Unsubscribe Newsletter
> **As a** website visitor,
> **I want to** manage my newsletter subscription,
> **So that** I receive only the content I want.

**Acceptance Criteria:**
- [ ] Newsletter Signup landing page beyond footer signup
- [ ] Newsletter Confirm page handles double opt-in confirmation
- [ ] Newsletter Unsubscribe page with one-click unsubscribe
- [ ] All flows comply with GDPR / CAN-SPAM / UAE / India regulations

#### US-15.2: Browse Promotions
> **As a** deal-seeking visitor,
> **I want to** see active promotions,
> **So that** I can save money on TwinMOS purchases.

**Acceptance Criteria:**
- [ ] Promotions Hub at `/promotions/`
- [ ] Promotion Template includes: title, eligible products, terms, start/end date, CTA
- [ ] Geographic targeting per promotion (e.g., India-only)

#### US-15.3: View Launch Campaign
> **As a** product-launch follower,
> **I want to** see the dedicated launch microsite,
> **So that** I can engage with the new product story.

**Acceptance Criteria:**
- [ ] Launch campaigns: CoreX Pro, VOLTX RGB, India Launch
- [ ] Each campaign includes: hero, story, product showcase, technical highlights, where-to-buy, social sharing

#### US-15.4: Cross-Sell & Exit-Intent
> **As a** marketing manager,
> **I want to** present cross-sell banners and exit-intent popups,
> **So that** the website maximizes engagement and lead capture.

**Acceptance Criteria:**
- [ ] Cross-sell banner copy as a CMS-managed component
- [ ] Exit-intent popup with newsletter capture or featured-promotion CTA; respects user dismissal preference
- [ ] Frequency capping: exit-intent shown at most once per session

### 15.3 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-15.1 | Promotions must have explicit start and end dates; expired promotions auto-archive | Status-based visibility |
| BR-15.2 | Exit-intent popup must respect user dismissal for at least 24 hours | Cookie-based |
| BR-15.3 | Loyalty / Referral programs (reserved) require legal review and KYC framework before activation | Phase 3+ gate |
| BR-15.4 | Newsletter and campaign content must comply with regional anti-spam regulations | Editorial workflow |

---

## 16. Epic 16: Compliance, Trust & Legal Hub

> **Content Map:** §15 (`14-legal/`, 34 entries)
> **RFP Ref:** RFP-FR-15
> **Primary Personas:** Sarah (Enterprise), Mr. Patel (Distributor), Legal/Compliance teams, all users for Privacy/Cookies
> **Priority:** P0 — Legal / Regulatory necessity

### 16.1 Description
Comprehensive legal, compliance, and trust pages. Many are mandatory disclosures in specific jurisdictions; failing to publish creates regulatory exposure.

### 16.2 User Stories

#### US-16.1: Read Privacy / Cookie / Terms Pages
> **As a** website visitor,
> **I want to** understand how my data is handled,
> **So that** I can make informed consent decisions.

**Acceptance Criteria:**
- [ ] Privacy Policy compliant with GDPR, UAE DPL, India DPDP, KSA PDPL
- [ ] Cookie Policy + Cookie Preferences page with granular consent management
- [ ] Terms of Use (current) + Terms of Sale (Phase 3 with e-commerce)
- [ ] Acceptable Use, Trademark Policy, Accessibility Statement
- [ ] Data Deletion Request form (GDPR Art. 17)

#### US-16.2: Verify Compliance Certifications
> **As a** procurement professional,
> **I want to** verify TwinMOS compliance certifications,
> **So that** I can include them in vendor evaluations.

**Acceptance Criteria:**
- [ ] Compliance Hub at `/legal/compliance/`
- [ ] Sub-pages: RoHS, REACH, CE Marking, UKCA Marking, FCC, EAC, ISO 9001, JEDEC, BIS India, WEEE, EPEAT
- [ ] Each compliance page links to certificate evidence (PDF) where available
- [ ] Quarterly verification cadence (BR-16.4 already governs)

#### US-16.3: Read ESG / Sustainability Disclosures
> **As an** ESG analyst or enterprise procurement,
> **I want to** review TwinMOS ESG disclosures,
> **So that** I can include them in vendor evaluations.

**Acceptance Criteria:**
- [ ] Supply Chain Disclosure
- [ ] Modern Slavery Statement (UK MSA, AU MSA)
- [ ] Conflict Minerals Disclosure (SEC §1502)
- [ ] Vendor Code of Conduct
- [ ] Imprint EU (German/EU regulatory disclosure)
- [ ] Each page reviewed and updated annually (or per regulation cycle)

#### US-16.4: Read Security & Vulnerability Disclosures
> **As a** security researcher or enterprise security officer,
> **I want to** report vulnerabilities responsibly,
> **So that** TwinMOS can address them and I can verify their security posture.

**Acceptance Criteria:**
- [ ] Security Disclosure page with PGP key (optional), security@twinmos.com contact
- [ ] Vulnerability Program page describing scope, response SLAs, recognition policy

#### US-16.5: View Product Recalls
> **As a** product owner,
> **I want to** check for any active recalls of TwinMOS products,
> **So that** I can take corrective action.

**Acceptance Criteria:**
- [ ] Product Recalls page lists active and historical recalls
- [ ] Each recall: affected SKUs/serial-number ranges, issue description, remediation, contact

### 16.3 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-16.1 | All legal pages must show "Last Updated" date | Template enforcement |
| BR-16.2 | Privacy / Cookie / Terms updates require Legal sign-off and 30-day notification on the site | Workflow |
| BR-16.3 | Modern Slavery & Conflict Minerals statements must be updated annually | Calendar |
| BR-16.4 | Compliance certifications must be re-verified quarterly; expired certs trigger immediate site update | Calendar + automated check |
| BR-16.5 | Vulnerability disclosures coordinated per published policy (typical 90-day responsible disclosure) | Security workflow |

---

## 17. Epic 17: Anti-Counterfeit / Product Authentication (Phase 2)

> **Content Map:** §8 (`07-support/34-sn-check.md`, `35-counterfeit-policy.md`); §15 (`14-legal/14-counterfeit-policy.md`)
> **RFP Ref:** RFP-FR-16
> **Primary Personas:** Aisha (Laptop Upgrader, suspect counterfeit), Kumar (System Integrator), Mr. Patel (Distributor)
> **Priority:** P2 (Phase 2)

### 17.1 Description
Brand-protection feature suite. Driven by RFP §3.2 anti-counterfeit business case. Includes a serial-number lookup tool, a counterfeit reporting workflow, and the public-facing counterfeit policy.

### 17.2 User Stories

#### US-17.1: Verify Serial Number (SN-Check)
> **As a** product purchaser,
> **I want to** verify my product's serial number,
> **So that** I can confirm I bought a genuine TwinMOS product.

**Acceptance Criteria:**
- [ ] SN-Check page at `/support/sn-check/`
- [ ] Single input: serial number; optional: product family
- [ ] Result categories: VERIFIED GENUINE / SERIAL NOT FOUND / SUSPECTED COUNTERFEIT (with suspicious-pattern detection)
- [ ] All lookups logged for trend analysis (privacy-preserving)
- [ ] Linked from product packaging and product detail pages

#### US-17.2: Report Counterfeit
> **As a** consumer who believes they purchased counterfeit,
> **I want to** report it to TwinMOS,
> **So that** the brand can investigate the source.

**Acceptance Criteria:**
- [ ] Reporting form: contact info, serial number, retailer, photos, story
- [ ] Brand-protection team notified immediately
- [ ] Auto-reply with reporting reference number

#### US-17.3: Read Counterfeit Policy
> **As a** distributor or consumer,
> **I want to** understand TwinMOS's counterfeit policy,
> **So that** I know what protections and recourse exist.

**Acceptance Criteria:**
- [ ] Counterfeit Policy page in both Support (`/support/counterfeit-policy/`) and Legal (`/legal/counterfeit-policy/`) — content paired
- [ ] Linked prominently from product pages and footer

### 17.3 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-17.1 | Serial number lookups must be rate-limited (max 100/hour per IP) to prevent enumeration | API throttling |
| BR-17.2 | Counterfeit reports trigger Brand Protection team SLA (response within 5 business days) | SLA monitoring |
| BR-17.3 | Counterfeit policy content must be identical (or content-paired) across Support and Legal locations | Editorial workflow |
| BR-17.4 | Backend ingestion of valid SNs from manufacturing must be daily | Integration monitoring |

---

## 18. Epic 18: Channel Programs (OEM/ODM, System Builder, MDF, Regional Hubs)

> **Content Map:** §10 (`09-partners/`, 21 entries)
> **RFP Ref:** RFP-FR-17
> **Primary Personas:** Mr. Patel (Distributor), Kumar (System Integrator), OEM/ODM Partner (NEW)
> **Priority:** P0 for distributor/reseller/OEM/ODM/System-Builder; P2 for portal; P3 for MDF (reserved)

### 18.1 Description

### 18.2 User Stories

#### US-18.1: Apply to a Channel Program
> **As a** prospective partner,
> **I want to** apply to the right channel program for my business,
> **So that** I can join the TwinMOS distribution network.

**Acceptance Criteria:**
- [ ] Become a Distributor (already covered by US-3.3)
- [ ] Become a Reseller (smaller-scale partners)
- [ ] OEM/ODM Program (B2B integration partners)
- [ ] System Builder Program (independent system builders)
- [ ] Each program has its own tailored application form

#### US-18.2: Browse Distributor Benefits / Onboarding / Responsibilities
> **As a** prospective partner evaluating TwinMOS,
> **I want to** read the full partner playbook,
> **So that** I know what to expect.

**Acceptance Criteria:**
- [ ] Distributor Benefits, Onboarding Process, Responsibilities pages
- [ ] Distributor Success Stories (case studies of existing partners)
- [ ] Partner Events Calendar
- [ ] Partner Training Resources

#### US-18.3: Visit Regional Distributor Hubs
> **As a** regional partner or buyer,
> **I want to** see the partner network in my region,
> **So that** I can engage with local distribution.

**Acceptance Criteria:**
- [ ] MEA Distributor Hub
- [ ] Africa Distributor Hub
- [ ] CIS Distributor Hub

#### US-18.4: MDF Program (Reserved)
> **As a** distributor,
> **I want to** access MDF (Marketing Development Funds),
> **So that** I can run co-branded local marketing.

**Acceptance Criteria:** Reserved for Phase 3+. Currently a placeholder page documenting the future program.

### 18.3 Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-18.1 | All partner-program applications must be reviewed by Sales within 48 business hours | SLA |
| BR-18.2 | Regional Distributor Hubs activate per official partnership agreement signing | Status flag |
| BR-18.4 | MDF program activation requires legal framework + finance integration before launch | Phase 3+ gate |

---

## 18. Business Rules & Logic

### 18.1 Cross-Cutting Business Rules

| Rule ID | Rule | Applies To | Enforcement |
|---------|------|-----------|-------------|
| BR-GLOBAL-1 | All product SKUs must be globally unique | Product Catalog | Database unique constraint |
| BR-GLOBAL-2 | All published pages must have SEO metadata | Content | CMS validation |
| BR-GLOBAL-3 | User personal data must not be retained longer than 24 months after last activity | All forms | Automated data purge |
| BR-GLOBAL-4 | Images must be served in WebP with JPEG fallback | All pages | Image CDN processing |
| BR-GLOBAL-5 | Form submissions from EU users require explicit consent | All forms | GDPR consent checkbox |
| BR-GLOBAL-6 | All external links must open in new tab | Content | CMS default behavior |
| BR-GLOBAL-7 | Product pricing is never displayed to unauthenticated users (Phase 1) | Product Pages | Display logic |
| BR-GLOBAL-8 | "New" badge auto-appears for 90 days after release_date | Product Catalog | Auto-calculation |
| BR-GLOBAL-9 | "Coming Soon" products are visible but not purchasable | Product Catalog | Status-based filtering |
| BR-GLOBAL-10 | All email communications include unsubscribe link | Email | Template enforcement |

### 18.2 Workflow Rules

| Workflow | Steps | Approvers |
|----------|-------|-----------|
| **New Product Publication** | Draft → Product Manager Review → Marketing Review → Legal Review (if claims) → Published | Product Manager, Marketing Director |
| **News Article Publication** | Draft → Editor Review → SEO Review → Scheduled/Published | Editor, Marketing Manager |
| **Compatibility Data Update** | Data Entry → Testing Lab Verification → Published | Product Manager |
| **Distributor Onboarding** | Application → Sales Review → Background Check → Legal Review → Approved/Rejected | Sales Director, Legal |
| **Price List Update** | Draft → Finance Review → Sales Director Approval → Published to Portal | Finance, Sales Director |

---

## 19. Data Requirements & Entity Model

### 19.1 Entity Relationship Diagram (Conceptual)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Product      │────<│  ProductSpec    │     │  Category       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ product_id (PK) │     │ spec_id (PK)    │     │ category_id(PK) │
│ sku (unique)    │     │ product_id (FK) │     │ name            │
│ name            │     │ spec_key        │     │ slug            │
│ slug            │     │ spec_value      │     │ parent_id (FK)  │
│ category_id(FK) │     │ spec_unit       │     │ sort_order      │
│ brand_line      │     └─────────────────┘     └─────────────────┘
│ description     │
│ hero_image      │     ┌─────────────────┐     ┌─────────────────┐
│ gallery[]       │────<│ ProductImage    │     │  Compatibility  │
│ datasheet       │     ├─────────────────┤     ├─────────────────┤
│ warranty_months │     │ image_id (PK)   │     │ compat_id (PK)  │
│ status          │     │ product_id (FK) │     │ product_id (FK) │
│ release_date    │     │ url             │     │ device_brand    │
└─────────────────┘     │ alt_text        │     │ device_model    │
                        │ sort_order      │     │ qvl_status      │
                        └─────────────────┘     │ max_capacity    │
                                                │ tested_speed    │
┌─────────────────┐     ┌─────────────────┐     └─────────────────┘
│   Retailer      │     │    Inquiry      │
├─────────────────┤     ├─────────────────┤     ┌─────────────────┐
│ retailer_id(PK) │     │ inquiry_id (PK) │     │   ContentPage   │
│ company_name    │     │ inquiry_type    │     ├─────────────────┤
│ type            │     │ submitter_name  │     │ page_id (PK)    │
│ country_code    │     │ submitter_email │     │ title           │
│ city            │     │ message         │     │ slug            │
│ address         │     │ status          │     │ body            │
│ phone           │     │ priority        │     │ excerpt         │
│ website_url     │     │ ticket_number   │     │ category        │
│ lat, lng        │     │ assigned_to     │     │ author          │
│ is_authorized   │     │ created_at      │     │ status          │
│ is_featured     │     └─────────────────┘     │ publish_date    │
└─────────────────┘                             │ seo_title       │
                                                │ seo_description │
┌─────────────────┐                             └─────────────────┘
│   CMSUser       │
├─────────────────┤     ┌─────────────────┐
│ user_id (PK)    │     │  WarrantyReg    │
│ email           │     ├─────────────────┤
│ name            │     │ reg_id (PK)     │
│ role            │     │ product_id (FK) │
│ is_active       │     │ serial_number   │
│ last_login      │     │ purchase_date   │
└─────────────────┘     │ retailer        │
                        │ submitter_email │
                        │ status          │
                        └─────────────────┘
```

### 19.2 Data Volume Estimates

| Entity | Initial Volume | 12-Month Growth | Storage Estimate |
|--------|---------------|-----------------|------------------|
| Products | 50 | +20/year | < 50MB |
| Product Images | 200 | +100/year | ~2GB |
| Compatibility Records | 5,000 | +2,000/year | < 10MB |
| Retailers/Distributors | 100 | +50/year | < 5MB |
| Inquiries/Year | 1,200 | +50% YoY | < 50MB |
| Content Pages | 50 | +100/year | < 20MB |
| Warranty Registrations/Year | 5,000 | +50% YoY | < 100MB |
| **Total Estimated Storage** | | | **~5GB** |

---

## 20. Performance Requirements

### 20.1 Page Load Performance

| Metric | Target | Maximum Acceptable | Measurement Tool |
|--------|--------|-------------------|------------------|
| First Contentful Paint (FCP) | < 1.0s | 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 1.8s | 2.5s | Lighthouse |
| First Input Delay (FID) | < 50ms | 100ms | Chrome UX Report |
| Interaction to Next Paint (INP) | < 150ms | 200ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.05 | 0.1 | Lighthouse |
| Time to First Byte (TTFB) | < 150ms | 300ms | WebPageTest |
| Total Blocking Time (TBT) | < 150ms | 300ms | Lighthouse |

### 20.2 API Performance

| Endpoint | Target Response Time | Maximum |
|----------|---------------------|---------|
| Product List (paginated) | < 200ms | 500ms |
| Product Detail | < 150ms | 300ms |
| Compatibility Search | < 300ms | 800ms |
| Retailer Locator | < 250ms | 500ms |
| Search (Algolia) | < 100ms | 200ms |
| Form Submission | < 500ms | 1s |
| CMS Admin Load | < 1s | 2s |

### 20.3 Concurrent User Capacity

| Scenario | Target Concurrent Users | Expected Peak |
|----------|------------------------|---------------|
| Normal Operations | 500 | 1,000 |
| Product Launch Day | 2,000 | 5,000 |
| COMPUTEX Event Traffic | 5,000 | 10,000 |
| Black Friday / Regional Sales | 3,000 | 8,000 |

---

## 21. Security Requirements

### 21.1 Application Security

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| HTTPS Everywhere | TLS 1.3 | Mandatory across all pages and assets |
| HSTS | max-age=31536000; includeSubDomains | Prevent downgrade attacks |
| Content Security Policy (CSP) | Strict | Prevent XSS, clickjacking |
| Secure Cookies | HttpOnly, Secure, SameSite=Strict | Session protection |
| SQL Injection Prevention | Parameterized Queries | ORM-level enforcement |
| XSS Prevention | Output Encoding | React/Vue auto-escaping + CSP |
| CSRF Protection | Token-based | All state-changing endpoints |
| File Upload Security | Type validation, size limits, malware scan | CMS upload handler |

### 21.2 Authentication & Authorization

| Requirement | Standard |
|-------------|----------|
| Password Policy | Min 12 chars, mixed case, number, symbol; 90-day rotation for admins |
| Account Lockout | 5 failed attempts = 30-minute lockout |
| Session Timeout | 30 minutes idle timeout; max 8 hours absolute |
| MFA | Required for Admin and Partner Portal users (TOTP) |
| Role-Based Access Control | Admin, Editor, Author, Viewer, Partner |
| API Authentication | JWT tokens with 1-hour expiry, refresh token rotation |

### 21.3 Infrastructure Security

| Requirement | Standard |
|-------------|----------|
| DDoS Protection | Cloudflare Pro or AWS Shield Standard |
| WAF | OWASP Core Rule Set, custom rules for CMS |
| Security Headers | X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Vulnerability Scanning | Weekly automated scans (Snyk, Dependabot) |
| Penetration Testing | Quarterly third-party penetration tests |
| Backup Encryption | AES-256 for all backups |

---

## 22. Compliance Requirements

### 22.1 Data Protection Regulations

| Regulation | Jurisdiction | Key Requirements | Implementation |
|------------|-------------|------------------|----------------|
| **GDPR** | European Union | Consent, right to erasure, data portability, breach notification | Cookie consent banner, privacy policy, data export/ deletion APIs |
| **UAE Data Protection Law** | UAE | Lawful processing, data minimization, security | Local data processing notice, DPO contact |
| **India DPDP Act 2023** | India | Consent-based processing, data principal rights | Explicit consent for Indian users, grievance officer |
| **PDPL (Saudi Arabia)** | KSA | Cross-border transfer restrictions | Local CDN caching, data residency options |

### 22.2 Accessibility Compliance

| Standard | Level | Requirements |
|----------|-------|-------------|
| **WCAG 2.1** | AA | Color contrast 4.5:1, keyboard navigation, screen reader support, alt text, focus indicators |
| **ADA (USA)** | — | Equivalent to WCAG 2.2 AA |
| **EN 301 549 (EU)** | — | Public sector accessibility standard |

### 22.3 Industry Certifications Display

> Certifications listed below are inherited from TwinMOS manufacturing partners and the company's compliance program. The CMS must support adding/removing certifications without code changes; only verified, current certifications may be displayed.

| Certification | Display Location | Validation |
|---------------|-----------------|------------|
| **ISO 9001** (manufacturing partners) | Footer, About page, Product pages | Link to current TUV SUD or equivalent certificate; verify validity quarterly |
| **CE Marking** | Product pages, footer | Declaration of Conformity reference |
| **UKCA Marking** | Product pages (UK-bound), footer | Declaration of Conformity reference |
| **FCC** | Product pages (US-bound products) | Certification number |
| **RoHS** | Product pages, footer | Compliance statement |
| **REACH** | Footer, sustainability statement | Compliance statement |
| **EAC** | Product pages (CIS market) | Certificate reference |
| **JEDEC compliance** | Product pages (DRAM products) | Standard reference (e.g., JEDEC DDR5 specification) |
| **BIS** *(India, Phase 2)* | India page, applicable products | BIS R-number when registration is completed |

### 22.4 Awards & Recognition Display

| Award | Status | Action |
|-------|--------|--------|
| **UAE Superbrand 2022** | Subject to verification before publication | Marketing must produce certificate or official confirmation; if unverifiable, remove from display |
| **Other industry awards** | Treat all awards as illustrative until evidence is filed in CMS | Each award entry in the CMS must store an image of the certificate/trophy; entries without proof may not be published |

### 22.5 Comprehensive Legal & Trust Page Inventory (NEW IN v3.0)

> **Source:** Content Map §15 (`14-legal/`, 34 entries). Pages below are scoped under Epic 16. Section 22.1 lists data-protection regulations; this section enumerates the corresponding **public-facing pages**.

| # | Legal/Trust Page | Slug | Phase | Owner | Notes |
|---|------------------|------|-------|-------|-------|
| 22.5.1 | Legal Hub | `/legal/` | P1 | Legal | Directory page |
| 22.5.2 | Privacy Policy | `/legal/privacy-policy/` | P0 | Legal | GDPR/UAE/India/KSA compliant |
| 22.5.3 | Cookie Policy | `/legal/cookie-policy/` | P0 | Legal | Granular consent management |
| 22.5.4 | Cookie Preferences | `/legal/cookie-preferences/` | P0 | Legal/Tech | Toggleable consent UI |
| 22.5.5 | Terms of Use | `/legal/terms-of-use/` | P0 | Legal | Site usage terms |
| 22.5.6 | Terms of Sale | `/legal/terms-of-sale/` | P3 | Legal | Activates with e-commerce |
| 22.5.7 | Warranty Policy | `/legal/warranty-policy/` | P0 | Legal/Product | Per-product-line terms (BR-6.1) |
| 22.5.8 | Acceptable Use | `/legal/acceptable-use/` | P1 | Legal | Forbidden uses |
| 22.5.9 | Trademark Policy | `/legal/trademark-policy/` | P1 | Legal | Partner usage of marks |
| 22.5.10 | Accessibility Statement | `/legal/accessibility-statement/` | P0 | Legal/UX | WCAG 2.2 AA conformance |
| 22.5.11 | Imprint (EU) | `/legal/imprint-eu/` | P0 | Legal | Required for EU/Germany |
| 22.5.12 | Supply Chain Disclosure | `/legal/supply-chain-disclosure/` | P1 | Legal/ESG | Transparency |
| 22.5.13 | Modern Slavery Statement | `/legal/modern-slavery-statement/` | P1 | Legal | UK MSA / AU MSA |
| 22.5.14 | Conflict Minerals | `/legal/conflict-minerals/` | P1 | Legal | SEC §1502 |
| 22.5.15 | Product Recalls | `/legal/product-recalls/` | P0 | Legal/Product | Recall communication |
| 22.5.16 | Counterfeit Policy (Legal) | `/legal/counterfeit-policy/` | P0 | Legal | Paired with `/support/counterfeit-policy/` |
| 22.5.17 | Job Applicant Privacy | `/legal/job-applicant-privacy/` | P0 | Legal/HR | GDPR Art. 13 |
| 22.5.18 | Vendor Code of Conduct | `/legal/vendor-code-of-conduct/` | P1 | Legal/Procurement | Supplier ESG/ethics |
| 22.5.19 | Data Deletion Request | `/legal/data-deletion-request/` | P0 | Legal | GDPR Art. 17 |
| 22.5.20 | Compliance Hub | `/legal/compliance/` | P1 | Compliance | Index of certifications |
| 22.5.21 | RoHS | `/legal/compliance/rohs/` | P1 | Compliance | |
| 22.5.22 | REACH | `/legal/compliance/reach/` | P1 | Compliance | |
| 22.5.23 | CE Marking | `/legal/compliance/ce-marking/` | P1 | Compliance | |
| 22.5.24 | UKCA Marking | `/legal/compliance/ukca-marking/` | P1 | Compliance | |
| 22.5.25 | FCC | `/legal/compliance/fcc/` | P1 | Compliance | |
| 22.5.26 | EAC | `/legal/compliance/eac/` | P1 | Compliance | |
| 22.5.27 | ISO 9001 | `/legal/compliance/iso-9001/` | P1 | Compliance | ISO 9001 |
| 22.5.28 | JEDEC | `/legal/compliance/jedec/` | P1 | Compliance | DRAM standards |
| 22.5.29 | BIS India | `/legal/compliance/bis-india/` | P2 | Compliance | India market |
| 22.5.30 | WEEE | `/legal/compliance/weee/` | P1 | Compliance | EU e-waste |
| 22.5.31 | EPEAT | `/legal/compliance/epeat/` | P2 | Compliance | Sustainability |
| 22.5.32 | Security Disclosure | `/legal/security-disclosure/` | P1 | Security | security@twinmos.com, PGP key |
| 22.5.33 | Vulnerability Program | `/legal/vulnerability-program/` | P1 | Security | Coordinated disclosure |
| 22.5.34 | Sitemap (HTML) | `/legal/sitemap/` | P1 | Tech/UX | Human-readable sitemap |

---

## 23. Scalability & Availability

### 23.1 Uptime & Availability

| Metric | Target | SLA |
|--------|--------|-----|
| **Uptime** | 99.9% | < 8.76 hours downtime/year |
| **Planned Maintenance Windows** | < 4 hours/month | Off-peak hours (GMT 02:00–06:00) |
| **Mean Time to Recovery (MTTR)** | < 30 minutes | Automated alerting + runbooks |
| **Mean Time Between Failures (MTBF)** | > 720 hours | Proactive monitoring |

### 23.2 Scalability Targets

| Dimension | Current Need | 3-Year Projection |
|-----------|-------------|-------------------|
| **Page Views / Month** | 50,000 | 500,000 |
| **Concurrent Users** | 500 | 5,000 |
| **Products** | 50 | 100+ |
| **Languages** | 1 (English) | 6+ |
| **CMS Users** | 5 | 20 |
| **Partner Portal Users** | 0 | 100+ |
| **Data Storage** | < 5GB | < 50GB |

### 23.3 Disaster Recovery

| Scenario | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|----------|------------------------------|-------------------------------|
| **Database Failure** | < 1 hour | < 15 minutes |
| **CMS Content Loss** | < 2 hours | < 1 hour |
| **Complete Site Outage** | < 4 hours | < 15 minutes |
| **CDN/Edge Failure** | < 30 minutes | N/A (static assets) |

---

## 24. Accessibility Requirements

### 24.1 WCAG 2.2 AA Compliance Checklist

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| **1.1 Text Alternatives** | All images have alt text | CMS mandatory field |
| **1.2 Time-based Media** | Videos have captions/transcripts | Video hosting platform integration |
| **1.3 Adaptable** | Content readable without CSS; semantic HTML | Component library standards |
| **1.4 Distinguishable** | Color contrast ≥ 4.5:1; text resizable to 200% | Design system tokens |
| **2.1 Keyboard Accessible** | All functionality available via keyboard | Tabindex management, focus trapping |
| **2.2 Enough Time** | No auto-refresh; user controls for carousels | Carousel pause/play controls |
| **2.3 Seizures** | No flashing content > 3Hz | Animation guidelines |
| **2.4 Navigable** | Skip links, page titles, breadcrumb, focus visible | Navigation component standards |
| **3.1 Readable** | Language attribute on HTML; simple language | i18n framework |
| **3.2 Predictable** | Consistent navigation, predictable form behavior | Component consistency |
| **3.3 Input Assistance** | Error prevention, clear labels, helpful error messages | Form validation framework |
| **4.1 Compatible** | Valid HTML, ARIA labels, screen reader tested | Automated + manual testing |

### 24.2 Assistive Technology Support

| Technology | Minimum Version | Testing Frequency |
|------------|----------------|-------------------|
| NVDA (Windows) | Latest | Monthly |
| JAWS (Windows) | 2024+ | Monthly |
| VoiceOver (macOS/iOS) | Latest | Monthly |
| TalkBack (Android) | Latest | Quarterly |
| Keyboard-only Navigation | N/A | Every sprint |

---

## 25. System Integration Requirements

### 25.1 Internal Systems

| System | Integration Type | Data Flow | Priority |
|--------|-----------------|-----------|----------|
| **TwinMOS ERP (if exists)** | API | Product master data, pricing (Phase 2) | P2 |
| **TwinMOS CRM** | API / Webhook | Lead data, inquiry routing | P1 |
| **Email Service** | SMTP / API | Transactional emails, newsletters | P0 |
| **Partner Portal Auth** | OAuth 2.0 / JWT | Distributor authentication | P2 |

### 25.2 External Systems

| System | Integration Type | Purpose | Priority |
|--------|-----------------|---------|----------|
| **Google Analytics 4** | JavaScript SDK | Traffic, behavior, conversion tracking | P0 |
| **Google Tag Manager** | JavaScript | Tag deployment | P0 |
| **Google Search Console** | API | Indexing, search performance | P1 |
| **Meta (Facebook) Pixel** | JavaScript | Social media retargeting | P1 |
| **LinkedIn Insight Tag** | JavaScript | B2B retargeting | P1 |
| **Algolia / Elasticsearch** | REST API | Product search | P0 |
| **reCAPTCHA v3** | JavaScript | Form spam protection | P0 |
| **Mailchimp / SendGrid** | REST API | Newsletter, transactional email | P1 |
| **Cloudinary / AWS S3** | SDK / API | Image/asset storage and delivery | P0 |
| **Mapbox / Google Maps** | JavaScript API | Distributor locator map | P1 |

---

## 26. API Requirements

### 26.1 Public API Endpoints

> All endpoints follow the URL-versioning convention defined in §26.3 (`/api/v1/...`). New major versions get a new prefix (`/api/v2/...`); minor changes are backward-compatible.

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/products` | GET | List products with filtering | None |
| `/api/v1/products/{slug}` | GET | Product detail | None |
| `/api/v1/categories` | GET | List categories | None |
| `/api/v1/compatibility` | GET | Search compatibility by device | None |
| `/api/v1/retailers` | GET | List retailers by country | None |
| `/api/v1/news` | GET | List news articles | None |
| `/api/v1/news/{slug}` | GET | News article detail | None |
| `/api/v1/inquiries` | POST | Submit inquiry form | None (reCAPTCHA) |
| `/api/v1/warranty/register` | POST | Register product warranty | None |
| `/api/v1/warranty/lookup` | GET | Lookup warranty status | None |
| `/api/v1/firmware/download` | POST | Request firmware download (serial-validated) | None |
| `/api/v1/rma/submit` | POST | Submit RMA request | None |
| `/api/v1/rma/status` | GET | Lookup RMA status | None |

### 26.2 Admin API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/admin/products` | CRUD | Product management | JWT (Admin/Editor) |
| `/api/v1/admin/content` | CRUD | Content page management | JWT (Admin/Editor) |
| `/api/v1/admin/inquiries` | CRUD | Inquiry management | JWT (Admin/Editor) |
| `/api/v1/admin/users` | CRUD | User management | JWT (Admin only) |
| `/api/v1/admin/retailers` | CRUD | Retailer management | JWT (Admin/Editor) |
| `/api/v1/admin/rma` | CRUD | RMA workflow management | JWT (Admin/Editor) |
| `/api/v1/admin/analytics` | GET | Dashboard data | JWT (Admin) |

### 26.3 API Standards

- **Format:** JSON
- **Versioning:** URL-based (`/api/v1/products`)
- **Pagination:** Cursor-based for large lists; limit/offset for smaller
- **Rate Limiting:** 100 requests/minute for public; 1000/minute for authenticated
- **Error Format:** RFC 7807 Problem Details
- **CORS:** Configured for twinmos.com and admin subdomain only

---

## 27. Third-Party Services

### 27.1 Required Services (v3.2 — Tech Stack v1.1 lockdown)

| Service | Purpose | Estimated Cost/Month |
|---------|---------|---------------------|
| **TwinMOS own cloud server (Linux VM)** | Origin hosting for Astro frontend + Strapi backend + PostgreSQL 16 + MeiliSearch + ImgProxy | TwinMOS-internal infra cost |
| **Cloudflare** | DNS + WAF (OWASP) + CDN edge caching + DDoS protection (front of TwinMOS origin per Decision 2B) | $20/mo (Pro) |
| **Strapi v5** | Headless CMS (self-hosted) | $0 (open-source) |
| **Astro 5** | Static-site generator + interactive islands (React 19) | $0 (open-source) |
| **MeiliSearch** | Product/content search (locally hosted in dev; MeiliSearch Cloud or self-host on cloud server in prod) | $0–$30 |
| **ImgProxy** | Image optimization (WebP/AVIF, responsive srcset, self-hosted) | $0 (self-hosted) |
| **Resend** | Transactional email + audience (newsletter) | $0–$20 (Pro at scale) |
| **Better Auth** | Auth library (integrated with Strapi RBAC) | $0 (open-source) |
| **Plausible Analytics** | Privacy-compliant cookieless analytics | $9–$19 |
| **Sentry** | Error monitoring (Astro client + Strapi server) | $0–$26 |
| **UptimeRobot** | Uptime monitoring | $0 (free tier) |
| **GA4 + Google Tag Manager + Google Search Console** | SEO/marketing analytics + tag management + indexing visibility | $0 (free) |
| **Backblaze B2** | S3-compatible nightly encrypted backup target | ~$5/mo for 100GB |
| **hCaptcha or Cloudflare Turnstile** | Bot protection | $0 (free tiers) |

### 27.2 Phase-2+ Services (Tech Stack-locked)

| Service | Purpose | Phase |
|---------|---------|-------|
| **Chatwoot OSS (self-hosted)** | Live chat with agent routing | Roadmap Phase 12 |
| **HubSpot CRM** | Lead management (locked per ADR-005) | Roadmap Phase 12 |
| **PostHog OSS (self-hosted)** | Session replay + feature flags + A/B testing | Roadmap Phase 14 |
| **Stripe** | E-commerce payments + Stripe Checkout/Elements (PCI scope minimization) | Roadmap Phase 13 |
| **Medusa.js v2 (self-hosted)** | E-commerce platform (OR Stripe Checkout-only fallback per ADR-007) | Roadmap Phase 13 |
| **Leaflet / MapLibre** | Where-to-buy locator map (no API key dependency) | Roadmap Phase 5 |
| **Bruno / Postman** | API testing | Roadmap Phase 1 onwards |

---

## 28. Success Criteria & KPIs

### 28.1 Launch Readiness Criteria

The website will NOT launch until ALL of the following are met:

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | Zero critical or high-severity bugs in QA | Jira bug report + QA sign-off |
| 2 | Lighthouse Performance Score ≥ 90 on all core pages | Lighthouse CI report |
| 3 | All 14 competitor-standard features implemented | Feature checklist review |
| 4 | Security penetration test passed | Third-party pen test report |
| 5 | Content populated for all active products | Content audit checklist |
| 6 | All forms tested and routing correctly | End-to-end form testing |
| 7 | SEO metadata present on all public pages | Screaming Frog crawl |
| 8 | Analytics and tracking verified | GA4 real-time report |
| 9 | Stakeholder UAT sign-off from Marketing, Sales, Product | Signed UAT document |
| 10 | Disaster recovery plan tested and documented | DR drill report |

### 28.2 Post-Launch KPIs

> **Baseline note:** All baseline figures below are *current-state estimates* derived from the forensic audit and informed-judgment of marketing leadership. Final baselines must be re-measured against the production analytics platform (GA4) within the first 30 days post-launch. Targets will be re-calibrated at the 30-day, 90-day, and 180-day reviews.

| KPI | Baseline (estimated) | 3-Month Target | 6-Month Target | 12-Month Target |
|-----|---------------------|---------------|---------------|----------------|
| **Monthly Website Sessions** | ~2,000 | 10,000 | 25,000 | 50,000 |
| **Organic Search Traffic %** | ~10% | 30% | 40% | 50% |
| **Bounce Rate** | ~80% | 50% | 45% | 40% |
| **Average Session Duration** | ~30s | 2:00 | 2:30 | 3:00 |
| **Pages per Session** | ~1.2 | 3.0 | 3.5 | 4.0 |
| **Contact Form Submissions/Month** | ~0 | 20 | 50 | 100 |
| **Distributor Inquiries/Quarter** | ~0 | 5 | 15 | 25 |
| **Warranty Registrations/Month** | ~0 | 100 | 300 | 500 |
| **Newsletter Subscribers/Month** | ~0 | 200 | 500 | 1,000 |
| **Product Page Views** | ~0 | 5,000 | 15,000 | 30,000 |
| **Compatibility Searches/Month** | ~0 | 500 | 2,000 | 5,000 |
| **India Page Views/Month** | ~0 | 1,000 | 3,000 | 8,000 |

---

## 29. Risk Register

| ID | Risk | Probability | Impact | Mitigation Strategy | Owner |
|----|------|-------------|--------|---------------------|-------|
| R-01 | **Solo-developer capacity constraint** (per Decision 1A — single resource × 18–24 months for full Phases 1–3+15 scope) | High | High | Scope-trim list maintained; AI-assisted dev (Copilot/Claude); markdown reuse; phased go-live to de-risk; bi-weekly demos with 24h decision turnaround | Project Manager |
| R-02 | **Solo-developer absence ≥ 2 weeks** (illness, leave) — critical solo-dev risk | Medium | High | Solo-dev contingency plan documented (M1.8.03); daily commits; detailed ADRs; documented handover package; identified TwinMOS escalation contact | Project Manager |
| R-03 | Content authoring lags developer pace | High | High | Begin content creation in parallel with Phase 2 development; engage copywriter; reuse existing accurate content; placeholder-then-replace pattern | Marketing |
| R-04 | Compatibility database incomplete at launch | Medium | High | Launch MVP with top 100 devices in Phase 6; expand to 500+ in Phase 11; crowdsourced/community submission feature; quarterly updates | Product Manager |
| R-05 | Performance targets not met | Medium | High | Performance budgets in CI/CD; regular Lighthouse audits; Cloudflare CDN edge caching; ImgProxy image optimization | Tech Lead |
| R-06 | SEO rankings drop during migration | Low | High | 301 redirects for all existing URLs; maintain old URLs during transition; Search Console monitoring | SEO Specialist |
| R-07 | Security breach post-launch | Low | Critical | Penetration testing; Cloudflare WAF + OWASP rule sets; regular Snyk/Dependabot updates; Sentry monitoring; incident response plan | Security Lead |
| R-08 | Translation vendor late or poor quality (Phases 9, 12, 14, 15) | Medium | Medium | Staged delivery; secondary vendor on standby; EN fallback; native-speaker review gate before publication | Marketing |
| R-09 | Third-party service outages (Cloudflare, Stripe, Resend, MeiliSearch Cloud) | Medium | Medium | SLA monitoring via UptimeRobot; fallback strategies (Cloudflare graceful degradation, Resend → SES backup, MeiliSearch local fallback) | DevOps |
| R-10 | Accessibility compliance gaps (WCAG 2.2 AA) | Medium | Medium | Automated a11y testing in CI (axe-core); manual audits with NVDA/VoiceOver every sprint; EU Accessibility Act compliance for EU regional pages | QA Lead |

> **Risk Register note (v3.2 patch per Decision 1A):** This register has been re-keyed from the original vendor-procurement framing to the solo-developer framing established by Roadmap v2.2. R-01 ("Vendor fails to deliver") and R-02 ("Content delays") have been replaced/reframed. R-04 (compatibility) and R-05 (performance) absorbed Cloudflare-as-edge-CDN per Decision 2B. R-09 expanded to enumerate specific third-party dependencies. R-10 explicitly cites WCAG 2.2 AA per Decision 6A. Strategy v4.0 risks RISK-11..18 will extend this register as R-11..R-18 in the consolidated `Risk_Register_v1.0.md` standalone document (Decision 8 pending).

---

## 30. Assumptions & Constraints

### 30.1 Assumptions

| ID | Assumption | Impact if False |
|----|-----------|-----------------|
| A-01 | TwinMOS will provide accurate product data, specs, and images | Development delays; inaccurate product info |
| A-02 | TwinMOS will provide distributor/retailer contact data for "Where to Buy" | Feature cannot launch |
| A-03 | Compatibility data can be sourced from motherboard QVLs + internal testing | Manual data entry required; delays |
| A-04 | Marketing team will dedicate 0.5 FTE to content creation during project | Content delays; launch postponement |
| A-05 | Solo-developer single-resource budget is approved (per Decision 1A — replaces v3.0 vendor budget assumption of $105K-$201K) | Project cannot proceed |
| A-06 | Domain (twinmos.com) and DNS control are available | Re-domain required |

### 30.2 Constraints

| ID | Constraint | Implication |
|----|-----------|-------------|
| C-01 | Phase 1 (BRD scope = Roadmap Phases 1–8) launches within ~8 months of project kickoff (24 Jul 2026 → Feb–Mar 2027 per Roadmap Phase 8 Weeks 29–32, Decision 4A) | Solo-developer realistic timeline; bi-weekly demo cadence enforces visibility |
| C-02 | No e-commerce checkout in Phase 1 | Focus on lead generation, not direct sales |
| C-03 | Must reuse twinmos.com domain | SEO migration planning required |
| C-04 | CMS must be usable by non-technical marketing staff | No-code/low-code CMS requirement |
| C-05 | Hosting must support Middle East, South Asia, and Europe edge locations | CDN selection constraint |
| C-06 | Partner Portal must be separate from public site (subdomain or path) | Security architecture decision |

---

## 31. Dependencies

### 31.1 Internal Dependencies

| Dependency | Required By | Owner | Status |
|------------|-------------|-------|--------|
| Product master data (Excel/CSV) | Product catalog, compatibility finder | Product Manager | Needed by Week 4 |
| High-resolution product images | Product catalog, gaming hub | Marketing | Needed by Week 6 |
| Distributor/retailer contact list | Where to Buy locator | Sales | Needed by Week 8 |
| Legal pages (Privacy, Terms) | Launch readiness | Legal | Needed by Week 14 |
| Compatibility test data | Compatibility finder | Product/Testing | Needed by Week 10 |
| Brand guidelines | Design phase | Marketing | Needed by Week 3 |
| CMS content population | Launch readiness | Marketing | Needed by Week 15 |

### 31.2 External Dependencies

| Dependency | Required By | Owner | Status |
|------------|-------------|-------|--------|
| Vendor selection and contract | Development start | Procurement | Week 0 |
| Domain/DNS access | Hosting setup | IT | Week 1 |
| SSL certificate | Security compliance | DevOps | Week 2 |
| Third-party service accounts (GA4, GTM, Algolia, etc.) | Integration | Marketing/IT | Week 3 |

---

## 32. Acceptance Criteria

### 32.1 Feature Acceptance Criteria Template

Every feature must meet the following before acceptance:

1. **Functional:** Meets all acceptance criteria in the user story
2. **Design:** Matches approved Figma/Adobe XD designs (pixel-perfect ± 5%)
3. **Responsive:** Works correctly on mobile, tablet, and desktop breakpoints
4. **Performance:** Meets performance targets defined in Section 20
5. **Accessibility:** Passes automated a11y tests (axe-core) and manual screen reader test
6. **SEO:** Has unique meta title, description, canonical URL, and structured data where applicable
7. **Security:** Passes OWASP ZAP scan with no high/critical findings
8. **Cross-Browser:** Works on Chrome, Firefox, Safari, Edge (latest 2 versions)
9. **Content:** Populated with accurate, reviewed content
10. **Analytics:** Tracking events implemented and verified in GA4 debug mode

### 32.2 UAT Process

| Phase | Participants | Duration | Sign-off Required |
|-------|-------------|----------|-------------------|
| **Alpha UAT** | Project team, QA | 1 week | Tech Lead |
| **Beta UAT** | Marketing, Sales, Product | 1 week | Marketing Director, Sales Director |
| **Stakeholder UAT** | Executive team, external partners | 1 week | Chairman (or delegate) |
| **Soft Launch** | Limited public audience | 1 week | Project Manager |

---

## 33. Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **BRD** | Business Requirements Document |
| **CMS** | Content Management System |
| **CDN** | Content Delivery Network |
| **CLS** | Cumulative Layout Shift (Core Web Vital) |
| **CRUD** | Create, Read, Update, Delete |
| **DDR** | Double Data Rate (memory technology) |
| **FCP** | First Contentful Paint (Core Web Vital) |
| **GDPR** | General Data Protection Regulation (EU) |
| **HMB** | Host Memory Buffer (SSD technology) |
| **INP** | Interaction to Next Paint (Core Web Vital) |
| **JEDEC** | Joint Electron Device Engineering Council |
| **LCP** | Largest Contentful Paint (Core Web Vital) |
| **MOQ** | Minimum Order Quantity |
| **NVMe** | Non-Volatile Memory Express (SSD interface) |
| **PMIC** | Power Management Integrated Circuit |
| **QVL** | Qualified Vendor List |
| **RMA** | Return Merchandise Authorization |
| **ROI** | Return on Investment |
| **RTL** | Right-to-Left (text direction) |
| **SEO** | Search Engine Optimization |
| **SKU** | Stock Keeping Unit |
| **SLA** | Service Level Agreement |
| **SO-DIMM** | Small Outline Dual In-line Memory Module |
| **SSD** | Solid State Drive |
| **TTFB** | Time to First Byte |
| **UAT** | User Acceptance Testing |
| **UDIMM** | Unbuffered Dual In-line Memory Module |
| **WCAG** | Web Content Accessibility Guidelines |
| **XMP** | Extreme Memory Profile (Intel overclocking) |
| **EXPO** | Extended Profiles for Overclocking (AMD) |

---

## 34. Appendix B: Reference Documents

| Document | Version | Location | Purpose |
|----------|---------|----------|---------|
| TwinMOS Company Profile | 2.0 | `TwinMOS_Company_Profile_Comprehensive.md` | Company background, product portfolio, leadership, market presence |
| **TwinMOS Website Content Map** | **1.0** | **`content/TwinMOS_Website_Content_Map.md`** | **Canonical content blueprint — 287 entries across 16 sections (NEW IN v3.0)** |
| **TwinMOS Master SKU Reference** | **1.0** | **`content/website-content/_master-sku-reference.md`** | **Canonical product registry (NEW IN v3.0)** |
| TwinMOS Website Forensic Audit (live site) | 1.0 | `TwinMOS_Website_Forensic_Audit.md` | Current-state problems and gap analysis |
| TwinMOS Documents Forensic Alignment Audit | 2.0 | `TwinMOS_Documents_Forensic_Alignment_Audit_v2.md` | v2.0→v3.0 alignment findings (NEW IN v3.0) |
| TwinMOS Website RFP | 3.0 | `TwinMOS_Website_RFP.md` | Procurement document for vendors |
| TwinMOS Website URD | 3.0 | `TwinMOS_Website_URD.md` | User-centric functional specifications |
| TwinMOS Documents Alignment Changelog | 2.0 | `TwinMOS_Documents_Alignment_Changelog.md` | Cross-document alignment history |

---

## 35. Appendix C: Competitor Benchmark Summary

| Feature | Kingston | Corsair | G.Skill | ADATA | Crucial | Samsung | TEAMGROUP | TwinMOS Target |
|---------|----------|---------|---------|-------|---------|---------|-----------|----------------|
| Product Finder by Device | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P0 |
| Product Comparison | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P0 |
| Where to Buy Locator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P0 |
| E-commerce/Direct Sales | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P3 |
| Warranty Registration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P1 |
| RMA Portal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P1 |
| Firmware Downloads | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P1 |
| Knowledge Base | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P1 |
| Live Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P2 |
| Gaming Brand Hub | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P1 |
| News & Events Center | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P0 |
| Awards Showcase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P1 |
| Partner Portal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P2 |
| Multi-Language | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P1 |
| Product Videos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | P2 |
| SSD Management Software | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | P3 |

---

## 35A. Appendix D′: Reserved / Conditional Scope (NEW IN v3.0)

> The following 18 content entries are flagged `*-reserved.md` in the content folder. Each activates only when its trigger condition is met. Phase indicates the earliest phase in which activation is expected.

| # | Page | Trigger | Phase |
|---|------|---------|-------|
| 1 | Server / ECC Memory | TwinMOS adds RDIMM/UDIMM ECC line | P2+ |
| 2 | Enterprise SSD | Enterprise SSD product launched | P3 |
| 3 | Rugged Portable SSD | Rugged SKU introduced (e.g., USB-C 1TB/2TB) | P2 |
| 4 | Encrypted Portable SSD | Encrypted SSD SKU introduced (500GB / 1TB) | P2 |
| 5 | Card Reader | Card reader SKU introduced | P3 |
| 6 | Data Center Solution | Enterprise/data-center SSD line launched | P3 |
| 7 | Overclocking Records | TwinMOS hosts/sponsors OC competition | P3 |
| 8 | Ambassador Program | Program launched | P3 |
| 9 | RGB Software Download | TwinMOS ships RGB control utility | P3 |
| 10 | Technology Roadmap | Executive approval of public roadmap | P3 |
| 11 | TwinMOS Storage Toolbox | Software utility shipped | P3 |
| 12 | MDF Program | Legal framework + finance integration in place | P3 |
| 13 | Event: COMPUTEX 2026 | After event participation confirmed | P2 |
| 14 | Event: GITEX Global | Event participation confirmed | P2 |
| 15 | Event: CES | Event participation confirmed | P2 |
| 16 | Event: CeBIT MEA | Event participation confirmed | P2 |
| 17 | Event: Saudi Tech | Event participation confirmed | P2 |
| 18 | Loyalty / Referral Programs | Legal framework + KYC ready | P3 |

Reserved pages must not be linked from main navigation until activated. Activation requires a trigger event, content authoring, and approval through the standard editorial workflow.

---

## 36. Appendix D: Current Website Issue Log

For the complete forensic audit with 64 critical issues, refer to:
`TwinMOS_Website_Forensic_Audit.md`

### Top 10 Issues Requiring Immediate Resolution

| Rank | Issue | Business Impact | Resolution in New Site |
|------|-------|----------------|------------------------|
| 1 | Homepage renders as empty image placeholders | Visitors cannot understand what TwinMOS does | Full homepage with hero, products, news, trust signals |
| 2 | Product pages return 404 errors | Zero product discovery capability | Complete product catalog with detail pages |
| 3 | About Us claims wrong HQ location | Active misinformation damages credibility | Accurate content with Dubai HQ prominently displayed |
| 4 | No contact forms or lead capture | 100% of traffic wasted | Multi-type inquiry forms with auto-routing |
| 5 | Category pages show broken images only | Cannot browse products | Filterable product grids with specs and images |
| 6 | No compatibility finder | Users cannot verify purchases | System/device-based compatibility search |
| 7 | No "Where to Buy" information | Cannot convert interest to sales | Map-based retailer/distributor locator |
| 8 | Privacy Policy and Terms return 404 | Legal non-compliance | Properly drafted legal pages |
| 9 | Poor grammar and generic content | Unprofessional brand image | Professionally written, accurate copy |
| 10 | No mobile-friendly structure | Lost mobile traffic majority | Mobile-first responsive design |

---

*This BRD is a living document. All changes must be logged in the Document Control table. For questions or clarifications, contact the Project Manager or Technical Lead.*

**Document Version:** 3.0 (Content-Aligned Edition)  
**Last Updated:** 30 April 2026  
**Next Review:** Upon vendor selection and project kickoff (target: 24 July 2026)  
**Synchronized With:** RFP v3.0, URD v3.0, Content Map v1.0, `_master-sku-reference.md`, Forensic Audit v1.0, Documents Forensic Alignment Audit v2.0, Company Profile v2.0
