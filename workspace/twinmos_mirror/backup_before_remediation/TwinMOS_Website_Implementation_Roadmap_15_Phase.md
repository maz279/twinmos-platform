# TwinMOS Corporate Website — 15-Phase Implementation Roadmap

**Document Reference:** TWN-PM-ROADMAP-15PHASE-2026-001 | **Version:** 3.0 | **Date:** 2 May 2026 (v3.0 — Self-Audit Forensic Pass; promotes v2.x patches and closes all 52 findings from internal forensic review)
**Classification:** CONFIDENTIAL — TwinMOS Internal Use
**Synchronized With:** BRD v3.0 (v3.2 patches applied), URD v3.1, SOW v4.0 (supersedes RFP v3.0 for procurement), Tech Stack v1.2, Implementation Strategy v4.0, Content Map v1.1, Project Documentation Inventory v3.0, Forensic Alignment Audit v3.0, Alignment Changelog v2.2, Company Profile v2.0, `_master-sku-reference.md`
**Team:** 1 Solo Full-Stack Developer (40h/week) | **Total Capacity:** ~18–22 months for Phases 1–14; Phase 15 open-ended | **Engagement Model:** Internal SOW v4.0 (no agency; per Decision 1A captured 2 May 2026)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase Map (15 Phases)](#phase-map)
3. [BRD-Phase ↔ Roadmap-Phase Cross-Walk](#brd-phase--roadmap-phase-cross-walk)
4. [Phase 1: Foundation & Environment Setup](#phase-1-foundation--environment-setup--weeks-14--target-24-jul--20-aug-2026)
5. [Phase 2: Content Architecture & Design System](#phase-2-content-architecture--design-system--weeks-58--target-21-aug--17-sep-2026)
6. [Phase 3: Core Content Production — Part 1](#phase-3-core-content-production--part-1--weeks-912--target-18-sep--15-oct-2026)
7. [Phase 4: Core Content Production — Part 2](#phase-4-core-content-production--part-2--weeks-1316--target-16-oct--12-nov-2026)
8. [Phase 5: Application Surfaces — Product & Discovery](#phase-5-application-surfaces--product--discovery--weeks-1720--target-13-nov--10-dec-2026)
9. [Phase 6: Application Surfaces — Forms & Support](#phase-6-application-surfaces--forms--support--weeks-2124--target-11-dec-2026--7-jan-2027)
10. [Phase 7: Quality Gates & Pre-Launch QA](#phase-7-quality-gates--pre-launch-qa--weeks-2528--target-8-jan--4-feb-2027)
11. [Phase 8: Phase 1 Launch & Hypercare](#phase-8-phase-1-launch--hypercare--weeks-2932--target-5-feb--4-mar-2027)
12. [Phase 9: Localization Foundation & Partner Portal](#phase-9-localization-foundation--partner-portal--weeks-3336--target-5-mar--1-apr-2027)
13. [Phase 10: Partner Enablement & Anti-Counterfeit](#phase-10-partner-enablement--anti-counterfeit--weeks-3740--target-2-apr--29-apr-2027)
14. [Phase 11: Full Support Ecosystem & ERP Integration](#phase-11-full-support-ecosystem--erp-integration--weeks-4144--target-30-apr--27-may-2027)
15. [Phase 12: Interactive Features & Marketing Automation](#phase-12-interactive-features--marketing-automation--weeks-4548--target-28-may--24-jun-2027)
16. [Phase 13: E-Commerce Foundation & Launch](#phase-13-e-commerce-foundation--launch--weeks-4964--target-25-jun--14-oct-2027)
17. [Phase 14: Advanced Analytics & RU/ZH/FR Localization](#phase-14-advanced-analytics--ruzhfr-localization--weeks-6579--target-14-oct-2027--27-jan-2028)
18. [Phase 15: Optimization, Loyalty/Referral, ES/PT/DE Launch & Handover](#phase-15-optimization-loyaltyreferral-espt-de-launch--handover--weeks-80--target-28-jan-2028-onwards)
19. [Appendix A — Quality Gate Traceability](#appendix-a-quality-gate-traceability)
20. [Appendix B — Content Scope Coverage](#appendix-b-content-scope-coverage)
21. [Appendix C — Sprint Cross-Reference (4-Week Sprint Cadence)](#appendix-c-sprint-cross-reference-4-week-sprint-cadence)
22. [Appendix D — Risk Register (Reconciled with BRD §29)](#appendix-d-risk-register-reconciled-with-brd-29)
23. [Appendix E — Decision Log](#appendix-e-decision-log)
24. [Appendix F — Glossary & Acronyms](#appendix-f-glossary--acronyms)
25. [Appendix G — Cross-Reference Index (BR-* / RFP-FR-* / UC-* / ADR-*)](#appendix-g-cross-reference-index)
26. [Appendix H — Performance & Quality Budgets](#appendix-h-performance--quality-budgets)
27. [Appendix I — Sign-Off Block](#appendix-i-sign-off-block)
28. [Document Control](#document-control)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | TwinMOS Digital Transformation Team | Initial 15-phase decomposition based on BRD v3.0 / URD v3.0 / RFP v3.0 |
| 2.0 | 2 May 2026 | TwinMOS Digital Transformation Team | Initial published Roadmap; assumed Tech Stack v1.0 |
| 2.1 | 2 May 2026 | TwinMOS Digital Transformation Team | Forensic Alignment Audit v3.0 patches: Phase 14/15 week-numbering (57–72/65+ → 65–79/80+); Phase Map duration column (8 weeks → 16/15/open-ended); milestone column (M13–14/M14–15/M15+ → M13.1–M13.10/M14.1–M14.10/M15.1–M15.10); Total Timeline lower bound (72 → 80 weeks); line 624 missing dash fix; sync header v3.1 update |
| 2.2 | 2 May 2026 | TwinMOS Digital Transformation Team | Decisions 1A/2B/3A/4A/5A/6A/7A applied: ADR-004/005/006/008 added; M1.2.04 Cloudflare DNS/WAF/CDN front; M13.1.05 Node.js 24 LTS migration; M15.5 expanded from 4 → 11 tasks for ES/PT/DE full launch (10 active locales total); WCAG 2.1 AA → 2.2 AA replace_all; T-2.3.02 markdown count 351 → 454 |
| **3.0 (current)** | **2 May 2026** | **TwinMOS Digital Transformation Team** | **Self-audit forensic pass — closes 52 internal findings: TOC + Document Control + Decision Log + Glossary + Cross-Reference Index + Performance Budgets + Sign-Off Block added; sync metadata refreshed to BRD v3.2-patches/URD v3.1/SOW v4.0/Tech Stack v1.2/Strategy v4.0/Content Map v1.1; Executive Summary scope updated (10 active locales by Phase 15; 454 markdown files / 287 unique entries / 100+ SKUs); Risk Register Appendix D reconciled with BRD §29; Appendix B duplicate-prefix bug fixed (09-/09- → 10-/10A-); Appendix C 4-week sprint cadence standardized; Appendix A expanded to enumerate 4 Lighthouse score thresholds; T-4.5.01 33 → 34 sub-pages; T-4.5.04 12 → 11 compliance pages with rationale; T-3.6.02/T-3.6.03 article counts reconciled with Learn Hub Content Map; T-7.10.01 14-features ↔ 16-features reconciliation noted; T-12.7.02 BR-15.1 → BR-15.4 (cross-sell banners get a new rule); +30 missing tasks added across Phases 1–15 (branch protection, audit logs, asset pipeline, redirect map, robots.txt, honeypots, refund/cancellation flows, tax-table maintenance, PostHog cohorts, vendor sunset, etc.)** |

> **v3.0 patch note (2 May 2026):** This roadmap is now considered the **authoritative single source of truth** for project execution schedule, milestones, and tasks. All sibling documents (BRD, URD, SOW, Tech Stack, Strategy, Content Map, Inventory) reference this Roadmap for phase boundaries, milestone IDs, and task IDs. Conflict resolution follows the v3.2 source-of-truth hierarchy: Profile → Content Map → SKU Reference → **Roadmap (this doc)** → Tech Stack → BRD → URD → SOW.

---

## Executive Summary

This roadmap decomposes the TwinMOS corporate website redevelopment into **15 sequential phases**, each containing **10 milestones** (one of which is a Phase Gate Review) with **multiple sequential tasks** (150 milestones, **689 tasks** total after v3.0 forensic-pass expansion — verified by grep `^- \[ \] T-` against the document body). It is designed for a **solo full-stack developer** operating from a Linux desktop workstation with all-local development infrastructure (local PostgreSQL 16 database, local Vite build server, local Strapi v5 dev server, local MeiliSearch, browser DevTools for debugging). After development, the project deploys to TwinMOS's own cloud server (Linux VM origin) behind Cloudflare DNS/WAF/CDN edge front per Decision 2B. The project covers:

- **454 markdown files** mapped to Astro Content Collections (354 unique content + ~100 SKU detail / template / locale variant files; 287 entries catalogued in Content Map v1.1)
- **287 unique content entries across 16 sections** (Site-Wide, Homepage, About, Products, Solutions, Gaming, Technology, Support, Learn, Where-to-Buy & Partners, News & Events, Regional, Careers, Contact, Legal, Marketing)
- **100+ SKU detail pages** spanning 11 brand lines (VOLTX, TornadoX7, Thunder GX, Concord, CoreX Pro, Xtreme, Alpha Pro, Hyper H2 Ultra, ELITE Drive Pro, ProDrive Ultra, Mobile Disk X3)
- **28 regional landing pages** (UAE-GCC, India, Bangladesh, KSA, Egypt, Morocco, South Africa, Europe, UK, Pakistan, Qatar, Algeria, Nigeria, Kenya, Ghana, Ethiopia, Angola, Libya, Cameroon, Namibia, Rwanda, Senegal, Botswana-Lesotho, Russia-CIS, Southeast Asia, Hong Kong, Taiwan, North America)
- **34 legal pages** (Privacy/Cookie/Terms/Warranty + 22 trust pages + 12 compliance sub-pages)
- **10 active locales by end of engagement** (EN baseline + AR/BN/HI by Phase 12 + RU/ZH-CN/FR by Phase 14 + ES/PT/DE by Phase 15 per Decision 5A)
- **15 form types** (General Inquiry, Sales, Tech Support, Quote, Distributor, OEM/ODM, Media, Warranty Inquiry, Feedback, Newsletter Signup, Warranty Registration, RMA Submit, Counterfeit Report, MDF Pre-Claim, Job Application, Build Submit, Whitepaper Gating)
- **All application surfaces** (catalog dual-axis, compatibility finder MVP→500+, where-to-buy locator with Leaflet/MapLibre, partner portal with Better Auth, RMA 7-state workflow, anti-counterfeit SN-Check, gaming hub with RGB visualizer + build gallery, live chat Chatwoot, e-commerce Medusa.js v2 or Stripe Checkout per ADR-007)
- **All quality gates** (Lighthouse Performance ≥90 / Accessibility ≥95 / Best Practices ≥95 / SEO ≥95; WCAG 2.2 AA per Decision 6A; OWASP ZAP zero high/critical; third-party penetration testing; k6 load test 5,000 concurrent; Playwright E2E for ≥10 critical user journeys)
- **Phase 4 retainer transition** at end of Phase 15 (ongoing CRO/SEO/security updates outside engagement)

**Phase Map:**

| # | Phase | Duration | Timeline | Core Focus |
|---|-------|----------|----------|------------|
| 1 | Foundation & Environment Setup | 4 weeks | M1 Weeks 1–4 | Linux workstation, local dev stack, repos, build pipeline, SaaS provisioning |
| 2 | Content Architecture & Design System | 4 weeks | M2 Weeks 5–8 | Strapi modeling, Astro schemas, design tokens, Figma approval |
| 3 | Core Content Production — Part 1 | 4 weeks | M3 Weeks 9–12 | About, Gaming, Technology, Learn, Solutions, Marketing, Careers, Contact pages |
| 4 | Core Content Production — Part 2 | 4 weeks | M4 Weeks 13–16 | News, Regional, Brand, SKU detail, Legal, Compliance, Search, Trust bar |
| 5 | Application Surfaces — Product & Discovery | 4 weeks | M5 Weeks 17–20 | Dual-axis catalog, filtering/sorting, PDP, comparison, where-to-buy locator |
| 6 | Application Surfaces — Forms & Support | 4 weeks | M6 Weeks 21–24 | All 15 form types, warranty reg, RMA data capture, compatibility finder MVP, KB, FAQ |
| 7 | Quality Gates & Pre-Launch QA | 4 weeks | M7 Weeks 25–28 | Performance, accessibility, security, cross-browser, UAT, content QA |
| 8 | Phase 1 Launch & Hypercare | 4 weeks | M8 Weeks 29–32 | DNS cutover, public launch, monitoring, CMS training, Phase 2 planning |
| 9 | Localization Foundation & Partner Portal | 4 weeks | M9 Weeks 33–36 | AR/BN/HI i18n, RTL, Better Auth, partner dashboard, translation vendor |
| 10 | Partner Enablement & Anti-Counterfeit | 4 weeks | M10 Weeks 37–40 | Asset library, price lists, SN-check, counterfeit reporting, MDF pre-claim |
| 11 | Full Support Ecosystem & ERP Integration | 4 weeks | M11 Weeks 41–44 | RMA 7-state tracker, compatibility 500+ devices, ERP sync, firmware center |
| 12 | Interactive Features & Marketing Automation | 4 weeks | M12 Weeks 45–48 | Live chat (Chatwoot), RGB visualizer, build gallery, HubSpot CRM, whitepaper gating |
| 13 | E-Commerce Foundation & Launch | 16 weeks | M13.1–M13.10 Weeks 49–64 | Medusa/Stripe, cart, checkout, customer accounts, hardening, PCI, payment, launch |
| 14 | Advanced Analytics & RU/ZH/FR Localization | 15 weeks | M14.1–M14.10 Weeks 65–79 | PostHog OSS, A/B testing, session replay, RU/ZH/FR import, native QA, launch |
| 15 | Optimization, Loyalty/Referral, ES/PT/DE Launch & Handover | open-ended | M15.1–M15.10 Weeks 80+ | Loyalty program, referral program, MDF activation, ES/PT/DE full launch (10 active locales total), knowledge transfer, Phase 4 retainer transition |

> **Total Timeline:** ~80–95+ weeks for Phases 1–14 (≈18–22 months for solo developer); Phase 15 open-ended (handover + optimization + ES/PT/DE launch per Decision 5A) + Phase 4 retainer ongoing | **Budget:** Consult TwinMOS PM — single-resource cost model (no agency overhead)
>
> **Note on phase sequencing:** All 15 phases run sequentially for the solo-developer team. Earlier drafts of the Phase Map showed Phase 14 starting at Week 57 and Phase 15 at Week 65 — those week numbers were inherited from an 8-week-per-phase model and are now corrected to Week 65 (Phase 14 start) and Week 80 (Phase 15 start) so the calendar dates and week numbers reconcile. See Forensic Alignment Audit v3.0 §1 F-RM-001/002.

---

## BRD-Phase ↔ Roadmap-Phase Cross-Walk

The BRD §6.1 four-phase product/market view maps to this Roadmap's 15-phase execution view as follows. **Both views are kept current.** When a sibling document mentions "BRD Phase 1," it refers to Roadmap Phases 1–8 collectively.

| BRD §6.1 Phase | BRD Calendar (Solo-Dev v3.2 patches) | Roadmap Phases | Roadmap Calendar | Public Outcome |
|----------------|--------------------------------------|----------------|------------------|----------------|
| BRD Phase 1 — Core Website | Months 1–8 | **Phases 1–8** (Foundation → Phase 1 Launch & Hypercare) | Weeks 1–32 (24 Jul 2026 – 4 Mar 2027) | English-only public website live with all 287 content entries, 100+ SKU PDPs, compatibility finder MVP, where-to-buy locator, 15 form types, partner-portal placeholder |
| BRD Phase 2 — Localization & Partner Enablement | Months 9–12 | **Phases 9–12** (Localization Foundation → Phase 2 Launch Readiness) | Weeks 33–48 (5 Mar – 24 Jun 2027) | AR/BN/HI locales live; partner portal with Better Auth; SN-Check + counterfeit reporting; RMA full 7-state workflow; ERP integration; firmware download center; Chatwoot live chat; HubSpot CRM; gaming hub interactives |
| BRD Phase 3 — Commerce & Advanced Features | Months 13–18 | **Phases 13–14** (E-Commerce → Analytics & RU/ZH/FR) | Weeks 49–79 (25 Jun 2027 – 27 Jan 2028) | E-commerce live (Medusa.js or Stripe per ADR-007); RU/ZH-CN/FR locales live (7 active total); PostHog OSS analytics + session replay + A/B testing; Node.js 24 LTS migration completed |
| BRD Phase 3+ / Roadmap Phase 15 — Optimization, Loyalty, ES/PT/DE Launch & Handover | Months 19+ | **Phase 15** | Weeks 80+ (28 Jan 2028 onwards) | Loyalty + Referral programs live; MDF program fully activated; **ES/PT/DE locales live (10 active total — per Decision 5A)**; reserved features conditionally activated; full knowledge transfer; Phase 4 retainer signed |
| BRD Phase 4 — Ongoing Optimization | Post-handover | **(Out of engagement)** | Continuing from Phase 15 closeout | Ongoing CRO, SEO, maintenance, security updates, further locale expansion |

---

### Phase 1: Foundation & Environment Setup | Weeks 1–4 | Target: 24 Jul – 20 Aug 2026

**Objective:** Linux desktop workstation fully configured, local development stack operational (PostgreSQL + Strapi + Astro + Vite), repos scaffolded, local build pipeline running, all SaaS accounts provisioned, local browser preview live.

#### M1.1: Technology Stack Lockdown & ADRs
- [ ] T-1.1.01: Sign ADR-001 (Stack Decision: Strapi v5 + Astro 5 + PostgreSQL 16 + MeiliSearch + TwinMOS Own Cloud Server origin + Cloudflare DNS/WAF/CDN front)
- [ ] T-1.1.02: Sign ADR-002 (Repo Architecture — two-repo: twinmos-website-frontend, twinmos-website-backend)
- [ ] T-1.1.03: Sign ADR-003 (Build Pipeline — Local Vite build with lint → type-check → test → build → production deploy to cloud server origin)
- [ ] T-1.1.04: Sign ADR-004 (Frontend Islands UI Framework — React 19 for hydrated interactive islands)
- [ ] T-1.1.05: Sign ADR-005 (CRM = HubSpot — Phase 12 integration locked)
- [ ] T-1.1.06: Sign ADR-006 (Cookie Consent Manager — custom-built with granular consent UI per BR-22.1)
- [ ] T-1.1.07: Sign ADR-007 stub for Phase 13 e-commerce decision (Medusa.js v2 vs Stripe Checkout-only) — full evaluation deferred to M13.1
- [ ] T-1.1.08: Sign ADR-008 (Node.js LTS Migration Path — start project on Node.js 22 LTS for Phases 1–12; migrate to Node.js 24 LTS in Phase 13 ahead of Node 22 EOL on 30 April 2027)
- [ ] T-1.1.09: Document all eight ADRs in `/docs/adr/` with team review

#### M1.2: Repository & Hosting Provisioning
- [ ] T-1.2.01: Create GitHub private repos for frontend (Astro 5) and backend (Strapi v5)
- [ ] T-1.2.02: Provision TwinMOS own cloud server (Linux VM); configure Linux OS, SSH keys, firewall rules; sized for Phases 1–12 (4 vCPU, 16GB RAM, 100GB SSD baseline) with Phase 13 upgrade plan (8 vCPU, 32GB RAM, 500GB SSD for e-commerce + PostHog OSS load)
- [ ] T-1.2.03: Configure cloud server for frontend hosting (Nginx/Caddy reverse proxy + Astro static build) and backend hosting (Node.js 22 LTS / Strapi v5)
- [ ] T-1.2.04: Provision Cloudflare account; configure DNS, WAF (OWASP rule sets + custom rules), CDN edge caching with origin = TwinMOS own cloud server; enable cf-ipcountry header for IP-geolocation per RFP-FR-12.1
- [ ] T-1.2.05: Set up local object storage directory for development assets; configure cloud server SSD primary storage + Backblaze B2 nightly encrypted backup target for production assets per Tech Stack §8.4

#### M1.3: SaaS Account Provisioning
- [ ] T-1.3.01: Create & configure Sentry (error monitoring), UptimeRobot (uptime monitoring), Resend (transactional email), Plausible (privacy analytics)
- [ ] T-1.3.02: Provision MeiliSearch Cloud instance for search indexing
- [ ] T-1.3.03: Create GA4 property, Google Tag Manager container, Google Search Console property
- [ ] T-1.3.04: Store all credentials securely in .env files (local) and server environment variables (production); document rotation procedures

#### M1.4: Developer Workstation Setup
- [ ] T-1.4.01: Configure Linux desktop with Node.js 22 LTS (target migration to Node.js 24 LTS in Phase 13 per ADR-008), pnpm, Git, Vite, Chrome browser + DevTools
- [ ] T-1.4.02: Install and configure VS Code (or preferred editor) with Astro, Strapi, Tailwind, ESLint, Prettier extensions
- [ ] T-1.4.03: Clone repos; verify branch access and push capabilities
- [ ] T-1.4.04: Pin Node version with `.nvmrc` (or `.tool-versions` for asdf) in both repos; commit `.editorconfig`, `.gitignore`, `.gitattributes`, `.prettierrc`, `.eslintrc`, `.nvmrc`, conventional-commit `commitlint.config.cjs`, MIT-licensed LICENSE file (or proprietary as TwinMOS prefers), and `README.md` with quickstart instructions
- [ ] T-1.4.05: Configure GitHub branch-protection rules on `main`: require pull-request, require linear history, require status checks (lint + type-check + test + Lighthouse CI), require signed commits, dismiss stale reviews, restrict force-push
- [ ] T-1.4.06: Add `CODEOWNERS` file (solo developer is owner of all paths; TwinMOS PM mandatory reviewer for `/docs/adr/` and `/legal/` content paths)

#### M1.5: Local Development Stack
- [ ] T-1.5.01: Install and configure PostgreSQL 16 locally; create databases for Strapi development and testing
- [ ] T-1.5.02: Install MeiliSearch locally; verify indexing endpoint accessible; test with sample document
- [ ] T-1.5.03: Install Strapi v5 locally via pnpm; configure database connection; seed initial admin user and test data
- [ ] T-1.5.04: Install Astro 5 + Vite locally; verify `pnpm dev` starts local dev server with hot reload; confirm browser preview at localhost

#### M1.6: Local Build Pipeline Baseline
- [ ] T-1.6.01: Configure Vite local build workflow: pnpm lint → pnpm type-check → pnpm test → pnpm build
- [ ] T-1.6.02: Run Lighthouse audit locally via Chrome DevTools; commit baseline performance JSON
- [ ] T-1.6.03: Configure pre-commit hooks (lint-staged + husky) for code quality enforcement
- [ ] T-1.6.04: Verify clean Vite production build succeeds; confirm built output runs correctly via local preview

#### M1.7: Error Checking & Monitoring Baseline
- [ ] T-1.7.01: Integrate Sentry SDK in both Astro (client-side) and Strapi (server-side) for error tracking
- [ ] T-1.7.02: Configure UptimeRobot monitors for production URL, API health endpoint, MeiliSearch health
- [ ] T-1.7.03: Integrate Plausible analytics script with custom event tracking plan
- [ ] T-1.7.04: Verify Chrome DevTools Console/Network tabs show clean operation in local dev; Sentry receives test events

#### M1.8: Project Management Baseline
- [ ] T-1.8.01: Review complete Content Map (287 entries) with TwinMOS PM; assign Phase 1/2/3/4 flags
- [ ] T-1.8.02: Confirm bi-weekly demo schedule with 24-hour decision turnaround commitment
- [ ] T-1.8.03: Document solo-developer contingency plan (illness/absence); identify escalation contact at TwinMOS
- [ ] T-1.8.04: Set up project communication channels (Slack/Teams, task tracker, decision log)

#### M1.9: Content & Design Kickoff
- [ ] T-1.9.01: Issue formal data requests to TwinMOS Product Manager (SKU data, specs, images, datasheets — needed by Week 6)
- [ ] T-1.9.02: Issue brand guidelines request to TwinMOS Marketing (logos, colors, typography, assets — needed by Week 5)
- [ ] T-1.9.03: Schedule Figma design kickoff workshop with TwinMOS Marketing Director for Week 5
- [ ] T-1.9.04: Begin content authoring kickoff with 4-person content squad (lead copywriter, product copywriter, technical writer, legal editor)

#### M1.10: Phase 1 Gate Review
- [ ] T-1.10.01: Present staging URL + stack walkthrough to TwinMOS stakeholders
- [ ] T-1.10.02: Verify all P0 tasks from M1.1–M1.9 complete
- [ ] T-1.10.03: Developer confirms full local stack runs identically with production cloud server configuration
- [ ] T-1.10.04: Sign Phase 1 Gate Review Checklist; proceed to Phase 2

---

### Phase 2: Content Architecture & Design System | Weeks 5–8 | Target: 21 Aug – 17 Sep 2026

**Objective:** Strapi collections modeled, Astro Content Collections schemas defined, design system in Figma approved, all site-wide components skeleton complete.

#### M2.1: Strapi Content Modeling — Core Entities
- [ ] T-2.1.01: Model Strapi collections: Product, SKU, Brand (11 brand lines per Roadmap M4.3 + BRD §8.5 brand_line enum), Category (5 top-level: Memory / SSD / Portable Storage / USB Flash / Accessories), Subcategory (18 sub-types: DDR5 Desktop, DDR5 Laptop, DDR4 Desktop, DDR4 Laptop, DDR3 Legacy, Server-Reserved, NVMe Gen5, NVMe Gen4, NVMe Gen3, SATA SSD, M.2 SATA, Enterprise-Reserved, Portable SSD, Portable HDD, USB Flash Drive, Card Reader-Reserved, USB Hub, Storage Toolbox-Reserved per Content Map §4)
- [ ] T-2.1.02: Wire entity relationships: Product → SKU (one-to-many), SKU → Brand, SKU → Category, Brand → Category
- [ ] T-2.1.03: Populate test data for 5 representative SKUs across DRAM, SSD, Portable, USB, Accessories
- [ ] T-2.1.04: Configure Strapi admin panel with custom views for product management

#### M2.2: Strapi Content Modeling — Content & Support Entities
- [ ] T-2.2.01: Model collections: NewsArticle, Event, KBArticle, Page, MenuItem, FormSubmission, Inquiry
- [ ] T-2.2.02: Model collections: Retailer, Distributor, CompatibilityRecord, WarrantyRegistration, RMARequest
- [ ] T-2.2.03: Model collections: JobListing, Promotion, Campaign, Whitepaper, LegalPage
- [ ] T-2.2.04: Verify all field types match BRD §19 data model and §11–§18 entity specifications
- [ ] T-2.2.05: Install and configure `strapi-plugin-audit-log` (or equivalent) to track all admin/editor changes to product, SKU, pricing, and legal content with retention per BR-7.2 / GDPR Art. 30; verify package name on npm at Sprint 0 per Tech Stack §5.2
- [ ] T-2.2.06: Install Strapi soft-delete plugin and optimistic-locking middleware to prevent accidental data loss and concurrent-edit conflicts; verify package availability at Sprint 0

#### M2.3: Astro Content Collections Schema
- [ ] T-2.3.01: Define Zod schemas in `src/content/config.ts` for all 16 content sections
- [ ] T-2.3.02: Create migration script mapping 454 markdown files to Astro Content Collections (354 unique entries + ~100 SKU detail / template / locale variant files; 287 are catalogued in Content Map v1.1)
- [ ] T-2.3.03: Verify type-check passes; all frontmatter validates against Zod schemas
- [ ] T-2.3.04: Define collection entry for each Content Map section (homepage, about, products, solutions, gaming, technology, support, learn, where-to-buy, partners, news, regional, careers, contact, legal, marketing)

#### M2.4: Design System — Figma Foundation
- [ ] T-2.4.01: Create Figma design files for all 16 content sections with Corporate (light) + Gaming (dark) dual modes
- [ ] T-2.4.02: Define design tokens: colors (Deep Blue #0A2540 primary, Electric Blue accent, RGB gradient for gaming), typography (Inter for body, display font for gaming headers), spacing scale
- [ ] T-2.4.03: Create responsive breakpoint strategy: Mobile 320–767px, Tablet 768–1023px, Desktop 1024–1439px, Wide 1440px+
- [ ] T-2.4.04: Conduct design-level accessibility review (color contrast ≥4.5:1, focus states, touch targets ≥44px)

#### M2.5: Design System — Component Library
- [ ] T-2.5.01: Design component library: Hero (3 variants), Text+Image, Feature Grid, Testimonials, CTA, FAQ accordion, Spec Table, Product Card, News Card, Form templates
- [ ] T-2.5.02: Design site-wide components: Header (navigation, language selector, search), Footer (links, social, newsletter), Cookie Banner (granular consent), Breadcrumb, Trust Bar
- [ ] T-2.5.03: Design 404, 500, and Maintenance mode pages
- [ ] T-2.5.04: Create interactive Figma prototype demonstrating key user journeys (product discovery, compatibility search, where-to-buy, form submission)

#### M2.6: Tailwind Configuration & Design Tokens
- [ ] T-2.6.01: Configure `tailwind.config.ts` with TwinMOS design tokens (colors, typography scale, spacing, shadows, border-radius)
- [ ] T-2.6.02: Implement Corporate (light) and Gaming (dark) CSS custom property themes
- [ ] T-2.6.03: Create preview page demonstrating all design tokens and component states
- [ ] T-2.6.04: Configure responsive container queries and breakpoint utilities

#### M2.7: Astro Page Templates
- [ ] T-2.7.01: Build page-template prototypes: Hero+Body+CTA layout, Spec+Gallery layout, Article layout (KB/Blog/Buying Guide), Form layout (multi-type), Locator layout (map+list)
- [ ] T-2.7.02: Verify all 5 templates render without errors at all breakpoints
- [ ] T-2.7.03: Implement Astro View Transitions for smooth page navigation
- [ ] T-2.7.04: Implement partial hydration for React interactive islands (search, forms, comparison tool)

#### M2.8: Site-Wide Components — Implementation
- [ ] T-2.8.01: Implement site-wide header with navigation (8 top-level items), language selector placeholder (EN only), search icon
- [ ] T-2.8.02: Implement site-wide footer with essential links, social media icons, newsletter signup, copyright
- [ ] T-2.8.03: Implement cookie consent banner with Accept All / Reject Non-Essential / Customize options; store preference
- [ ] T-2.8.04: Implement breadcrumb navigation with Schema.org BreadcrumbList structured data
- [ ] T-2.8.05: Implement skip links ("Skip to main content" as first focusable element on all pages)

#### M2.9: Figma Design Approval Milestone
- [ ] T-2.9.01: Present Figma designs to TwinMOS Marketing Director for all 16 sections
- [ ] T-2.9.02: Incorporate feedback; conduct design review with TwinMOS Product Manager for product page accuracy
- [ ] T-2.9.03: Sign Design Approval Checklist (Figma files signed off, design system documented, component library spec complete)
- [ ] T-2.9.04: Commit finalized design tokens and component specifications to `/docs/design-system/`

#### M2.10: Phase 2 Gate Review
- [ ] T-2.10.01: Verify all Strapi collections modeled with relationships and test data
- [ ] T-2.10.02: Verify Astro Content Collections schema validates all markdown files
- [ ] T-2.10.03: Verify site-wide components render on all page templates
- [ ] T-2.10.04: Present content model walkthrough + component preview to TwinMOS; sign Phase 2 Gate

---

### Phase 3: Core Content Production — Part 1 | Weeks 9–12 | Target: 18 Sep – 15 Oct 2026

**Objective:** All static content pages across 8 content sections fully routed, styled, and populated (~150 pages).

#### M3.1: Homepage & Site-Wide Components
- [ ] T-3.1.01: Build homepage with Hero carousel (3 slides: CoreX Pro, VOLTX RGB, India Launch), product highlights grid, news feed, trust signals bar
- [ ] T-3.1.02: Implement trust bar component showing certifications (ISO 9001:2015, CE, UKCA, FCC, RoHS, REACH, JEDEC, EAC), country count (93+), heritage (27+ years since 1998)
- [ ] T-3.1.03: Implement microcopy glossary and error pages (404 with search + quick links, 500 with contact info, Maintenance page with ETA + status link)
- [ ] T-3.1.04: Verify homepage renders all Schema.org types: WebSite + Organization + SiteNavigationElement; validate via Google Rich Results Test
- [ ] T-3.1.05: Establish image asset acquisition pipeline with TwinMOS Marketing: high-resolution source location (cloud drive), file-naming convention (`{brand}-{sku}-{angle}-{size}.{ext}`), hand-off cadence (weekly batch), licensing/release log; document in `/docs/asset-pipeline.md`
- [ ] T-3.1.06: Configure tone-of-voice review checkpoint with TwinMOS Marketing Director: every content section reviewed by Marketing for brand voice consistency before promotion to "review" status in CMS

#### M3.2: About / Company Pages (17 entries)
- [ ] T-3.2.01: Build About hub page with tile navigation to 16 sub-pages
- [ ] T-3.2.02: Build sub-pages: Overview, History (with timeline), Leadership (with Person schema), Mission-Vision-Values, Why Choose TwinMOS
- [ ] T-3.2.03: Build sub-pages: Manufacturing, Quality Assurance, Certifications, Awards (with verification requirement per BR-5.5), Sustainability, CSR
- [ ] T-3.2.04: Build sub-pages: Global Presence (map), Entities (legal entity structure), Press/Media Kit, Corporate Fact Sheet, Investors (reserved)

#### M3.3: Gaming Hub — VOLTX Brand (14 entries)
- [ ] T-3.3.01: Build Gaming Hub landing with dark theme, RGB accents, animated hero, product grid
- [ ] T-3.3.02: Build sub-pages: VOLTX Brand Story, VOLTX Product Showcase, RGB Sync Compatibility (Aura Sync, RGB Fusion, Mystic Light, Polychrome badges)
- [ ] T-3.3.03: Build sub-pages: Overclocking Guide (XMP 3.0, AMD EXPO), Wallpapers/Downloads, Gaming News Feed
- [ ] T-3.3.04: Build placeholder pages: RGB Showcase (P2 interactive), Build Gallery (P3 moderated), Esports Sponsorships (P2), Ambassador Program (reserved P3), RGB Software (reserved P3), Overclocking Records (reserved P3)

#### M3.4: Technology / R&D Pages (14 entries)
- [ ] T-3.4.01: Build Technology Hub landing at `/technology/` with tile navigation
- [ ] T-3.4.02: Build sub-pages: R&D Philosophy, DRAM Technology (DDR5 architecture, on-die ECC, PMIC), NAND Flash Technology (3D TLC, wear leveling), Controller Technology (SMI, Phison)
- [ ] T-3.4.03: Build sub-pages: Thermal Management (graphene, aluminum, MTCD), Power Management (PMIC, low-voltage), Data Security (LDPC ECC, encryption), Data Integrity (S.M.A.R.T., TRIM, bad block)
- [ ] T-3.4.04: Build sub-pages: PCIe Gen 5 Deep-Dive, JEDEC Compliance, Patents (with patent-verification rule equivalent to BR-5.5 awards rule — only patents with stored grant documentation may be published), Whitepapers Hub, Roadmap (reserved P3 — activate when executive approval per M15.4.04)

#### M3.5: Solutions / Vertical Use Cases (11 entries)
- [ ] T-3.5.01: Build Solutions Hub at `/solutions/` with 7 vertical-use-case tiles
- [ ] T-3.5.02: Build vertical pages: Gaming Enthusiast (DDR5 RGB + Gen 4/5 NVMe), Content Creation (high-bandwidth + Gen 5 + portable), System Builders (bulk procurement + compatibility finder), Enterprise SMB (office productivity + server-grade)
- [ ] T-3.5.03: Build vertical pages: Education (lab fleets + student builds), Embedded/Industrial (wide-temp, ruggedized, long-term), Telco/BFSI/Government (compliance-led with FCC/RoHS/EAC trust signals)
- [ ] T-3.5.04: Build Case Studies Hub + Case Study Template (customer profile, challenge, solution, products, metrics, quote, downloadable PDF); Data Center Solution (reserved P3)

#### M3.6: Learn / Knowledge Hub (64 entries — largest section; ~16 articles/week is aggressive for solo dev — flag for Phase 3 retrospective if behind, with overflow accepted into Phase 4 P1 cleanup queue per R-03 mitigation)
- [ ] T-3.6.01: Build Learn Hub landing at `/learn/` with section tiles: Buying Guides, Explained, Benchmarks, Glossary, Stories, Blog
- [ ] T-3.6.02: Build Buying Guides Hub + 18 buying guide articles per Content Map §9.2: (1) How to Choose RAM, (2) DDR4 vs DDR5, (3) How to Choose an SSD, (4) NVMe vs SATA, (5) PCIe Gen comparison, (6) SO-DIMM vs UDIMM, (7) Portable SSD vs HDD, (8) Best RAM for Gaming, (9) Best RAM for Content Creation, (10) Best RAM for Laptops, (11) Best SSD for Gaming, (12) Best SSD for Content Creation, (13) Best SSD for Laptops, (14) Build Guide — Budget, (15) Build Guide — Mid-Range, (16) Build Guide — Flagship, (17) System Builder Procurement Guide, (18) Enterprise Fleet Upgrade Guide
- [ ] T-3.6.03: Build Explained Hub + 30 explained articles per Content Map §9.3: (1) What is DDR, (2) What is DDR5, (3) What is DDR4, (4) What is DDR3, (5) DDR Architecture, (6) Memory Bandwidth, (7) CAS Latency, (8) Memory Timings, (9) Prefetch Buffer, (10) On-Die ECC, (11) PMIC, (12) What is XMP, (13) AMD EXPO, (14) What is NVMe, (15) What is PCIe, (16) What is SATA, (17) 3D TLC NAND, (18) DRAM Cache, (19) HMB (Host Memory Buffer), (20) TRIM / Garbage Collection, (21) Wear Leveling, (22) S.M.A.R.T., (23) RGB Sync, (24) Graphene Heatsink, (25) ECC Memory, (26) M.2 2280, (27) MTBF, (28) Power Loss Protection, (29) LDPC ECC, (30) Endurance / TBW
- [ ] T-3.6.04: Build Benchmarks Hub + template + 4 initial benchmark pages (CoreX Pro vs Competitors, VOLTX RGB vs Competitors, Real-World Gaming, Content Creation); all must disclose methodology per BR-13.3
- [ ] T-3.6.05: Build Glossary (A–Z technology glossary), Blog Hub + template + 3 launch posts (CoreX Pro, VOLTX RGB, COMPUTEX 2025 recap), Stories Hub + template

#### M3.7: Marketing Programs & Campaigns (12 entries)
- [ ] T-3.7.01: Build Newsletter Signup landing page, Confirm page (double opt-in), Unsubscribe page (one-click)
- [ ] T-3.7.02: Build Promotions Hub + Promotion Template (title, eligible products, terms, start/end date, CTA, geographic targeting)
- [ ] T-3.7.03: Build Launch Campaign pages: CoreX Pro Gen 5 Launch LP, VOLTX RGB Launch LP, India Launch Campaign LP
- [ ] T-3.7.04: Build Cross-Sell Banner Copy component (CMS-managed), Exit-Intent Popup component (newsletter capture, respects dismissal preference per BR-15.2)
- [ ] T-3.7.05: Build placeholder pages: Loyalty Program (reserved P3), Referral Program (reserved P3)

#### M3.8: Careers Pages (10 entries)
- [ ] T-3.8.01: Build Careers Hub landing with open roles, culture, benefits overview
- [ ] T-3.8.02: Build sub-pages: Life at TwinMOS (culture, photos, employee testimonials with signed release per BR-14.2), Benefits (healthcare, retirement, learning), Locations (Dubai HQ, Taipei, India, Bangladesh), Departments, Internships
- [ ] T-3.8.03: Build Job Listing Template (title, location, department, description, requirements, apply CTA); Application Form (multi-step with CV upload, GDPR consent)
- [ ] T-3.8.04: Build Applicant Privacy Notice (GDPR Art. 13), Careers FAQ

#### M3.9: Contact Pages (16 entries)
- [ ] T-3.9.01: Build Contact Hub landing with categorized contact options
- [ ] T-3.9.02: Build form pages: General Inquiry, Sales Inquiry, Technical Support, Distributor Inquiry, OEM/ODM Inquiry, Quote Request (with file upload), Media Inquiry, Warranty Inquiry, Feedback
- [ ] T-3.9.03: Build Office Locations directory + individual office pages: Dubai HQ (C-9 DAFZA, P.O. Box 54278, +971-4-2996421/22), Taipei Office, India Office, Bangladesh Office
- [ ] T-3.9.04: Build Form-Submission Success Template (ticket number, response-time SLA, next steps)

#### M3.10: Phase 3 Gate Review
- [ ] T-3.10.01: Verify all ~150 pages render correctly at all breakpoints
- [ ] T-3.10.02: Verify all images have descriptive alt text; breadcrumbs and skip links functional
- [ ] T-3.10.03: Verify all internal cross-links between related content pages working
- [ ] T-3.10.04: Present content walkthrough of 8 sections completed; sign Phase 3 Gate

---

### Phase 4: Core Content Production — Part 2 | Weeks 13–16 | Target: 16 Oct – 12 Nov 2026

**Objective:** Remaining content pages complete (News, Regional, Brand, SKU, Legal, Support hub), search functional, all 287 content entries live.

#### M4.1: News, Press & Events Pages (19+ entries)
- [ ] T-4.1.01: Build News Hub at `/news/` with chronological listing, filterable by category (6 categories)
- [ ] T-4.1.02: Build templates: News Article Template (title, author, date, hero, body, social share, related), Press Release Template (with company boilerplate per BR-5.4), Event Page Template (name, date, location, booth, photo gallery, video embeds, product showcase, "contact at event" CTA)
- [ ] T-4.1.03: Build category index pages: Product Launches, Events, Awards, Partnerships, Press Releases, Company News
- [ ] T-4.1.04: Populate 8 launch-set news articles (COMPUTEX 2025 showcase, CoreX Pro Gen5 launch, VOLTX RGB DDR5 launch, Supertron India MoU, website relaunch, anti-counterfeit program, Bangladesh distributor summit, UAE Superbrand confirmation)
- [ ] T-4.1.05: Build Events Hub + event pages: COMPUTEX 2025, COMPUTEX 2026 (reserved), GITEX Global (reserved), CES (reserved), CeBIT MEA (reserved), Saudi Tech (reserved), India IT Distributors
- [ ] T-4.1.06: Build Media Coverage Hub, Newsletter Archive

#### M4.2: Regional Landing Pages (28 entries, English baseline)
- [ ] T-4.2.01: Build Region Selector hub at `/regions/` with auto-detection via IP geolocation + manual override
- [ ] T-4.2.02: Build P0 regional pages: UAE-GCC (DAFZA HQ, AED reference, Achiever Computers), India (Supertron when active, BIS, INR reference), Bangladesh (Smart Technologies BD, BDT reference, retailer list)
- [ ] T-4.2.03: Build P1 regional pages: Saudi Arabia (PDPL, Advanced Micro Technologies), Egypt (ECS-Distribution, Delta, Power Tech, Elite Tech), Morocco (Disway, Bestmark, Mediastore, Gearup), South Africa (Pinnacle Micro), Europe (Mediacom, Zynex, GDPR, UKCA, REACH), Pakistan, Qatar
- [ ] T-4.2.04: Build P2/P3 regional pages: Algeria, Nigeria, Kenya, Ghana, Ethiopia, Angola, Libya, Cameroon, Namibia, Rwanda, Senegal, Botswana-Lesotho, Russia-CIS (EAC), UK (UKCA), Southeast Asia (Ban Leong, Fortune), Hong Kong (Asiapac), Taiwan (Airwave), North America
- [ ] T-4.2.05: Build locale stubs for AR/BN/HI/RU/ZH-CN/FR/ES/PT/DE under `/_locales/{lang}/`

#### M4.3: Brand Hub Pages (11 brand lines)
- [ ] T-4.3.01: Build Brand Directory Page at `/products/brands/` with all 11 brand lines, positioning, target audience
- [ ] T-4.3.02: Build individual brand pages: VOLTX (gaming), TornadoX7 (performance), Thunder GX (value), Concord (RGB mainstream)
- [ ] T-4.3.03: Build brand pages: CoreX Pro (flagship NVMe), Xtreme (performance NVMe), Alpha Pro (entry NVMe)
- [ ] T-4.3.04: Build brand pages: Hyper H2 Ultra (SATA SSD), ELITE Drive Pro (portable), ProDrive Ultra (portable), Mobile Disk X3 (USB flash)
- [ ] T-4.3.05: Implement cross-axis navigation: users can browse by Category (Memory/SSD/Portable/USB) OR by Brand — both axes link to same SKUs

#### M4.4: SKU Detail Pages (100+ entries)
- [ ] T-4.4.01: Build SKU detail page template from `_master-sku-reference.md` with all fields from BRD §8.5 entity model
- [ ] T-4.4.02: Generate 100+ SKU detail pages: DRAM (VOLTX DDR5, TornadoX7 DDR4, Thunder GX, Concord RGB, SO-DIMM), NVMe SSD (CoreX Pro Gen5, Xtreme Gen4, Alpha Pro Gen3), SATA SSD (Hyper H2 Ultra), Portable SSD (ELITE Drive Pro, ProDrive Ultra), USB Flash (Mobile Disk X3), Accessories (USB Hub 4-Port)
- [ ] T-4.4.03: Each PDP includes: hero image, spec table, feature list, gallery, datasheet PDF link, "Where to Buy" CTA, related products, Schema.org Product structured data
- [ ] T-4.4.04: Implement "New" badge auto-appearing for 90 days after release_date (BR-GLOBAL-8); "Coming Soon" product status (BR-GLOBAL-9)
- [ ] T-4.4.05: Verify all 100+ SKU pages render correctly; spec tables match Product Manager data

#### M4.5: Legal, Compliance & Trust Hub (34 entries)
- [ ] T-4.5.01: Build Legal Hub landing at `/legal/` directing to all 33 sibling sub-pages (the Legal Hub itself is the 34th entry; total 34 legal pages per Content Map §15)
- [ ] T-4.5.02: Build P0 legal pages: Privacy Policy (GDPR/UAE/India DPDP/KSA PDPL compliant), Cookie Policy + Cookie Preferences (granular consent management UI), Terms of Use, Warranty Policy (CMS-driven per BR-6.1: Limited Lifetime DRAM, 5yr NVMe, 3yr SATA), Accessibility Statement (WCAG 2.2 AA), Imprint EU, Product Recalls, Counterfeit Policy, Job Applicant Privacy, Data Deletion Request (GDPR Art. 17)
- [ ] T-4.5.03: Build P1 legal pages: Acceptable Use, Trademark Policy, Supply Chain Disclosure, Modern Slavery Statement, Conflict Minerals (SEC §1502), Vendor Code of Conduct, Security Disclosure (security@twinmos.com, PGP key), Vulnerability Program, Sitemap (HTML)
- [ ] T-4.5.04: Build Compliance Hub at `/legal/compliance/` (1 hub page) + 11 compliance sub-pages: RoHS, REACH, CE Marking, UKCA Marking, FCC, EAC, ISO 9001:2015, JEDEC, BIS India (P2), WEEE, EPEAT — total 12 pages including the hub; each compliance sub-page links to certificate evidence PDF where available
- [ ] T-4.5.05: Implement "Last Updated" date on all legal pages per BR-16.1; cookie banner triggered for EU/UK visitors

#### M4.6: Support Hub — Static Pages
- [ ] T-4.6.01: Build Support Center landing at `/support/` with section tiles
- [ ] T-4.6.02: Build Warranty pages: Warranty Policy umbrella, Registration form (placeholder), Lookup page (placeholder), Region-specific terms (UAE/IN/EU/BD), Warranty FAQ
- [ ] T-4.6.03: Build RMA pages: RMA Hub, Submit form (placeholder), Status tracker (placeholder), RMA Policy, Out-of-Warranty options
- [ ] T-4.6.04: Build Download pages: Downloads Hub, Firmware Downloads (placeholder), Firmware FAQ, Manuals (PDF), Quick-Start Guides, TwinMOS Storage Toolbox (reserved P3)
- [ ] T-4.6.05: Build Contact Support page, Support SLA page

#### M4.7: Where-to-Buy & Partners — Static Pages (26 entries)
- [ ] T-4.7.01: Build Where-to-Buy Hub at `/where-to-buy/` with map placeholder and list view
- [ ] T-4.7.02: Build sub-pages: Online Stores, Physical Stores, Distributors, System Builders; Retailer Detail Template (logo, address, phone, website, hours, categories, "Get Directions"); No-Retailer State template (distributor inquiry CTA)
- [ ] T-4.7.03: Build Partners Hub at `/partners/` with Distributor/Reseller/OEM-ODM/System Builder/Retailer paths
- [ ] T-4.7.04: Build partner program pages: Become a Distributor (form + benefits), Become a Reseller, OEM/ODM Program, System Builder Program, Distributor Benefits, Onboarding Process, Responsibilities
- [ ] T-4.7.05: Build Regional Distributor Hubs: India-Supertron microsite, Bangladesh Smart Tech, MEA Hub (Achiever), Africa Hub, CIS Hub
- [ ] T-4.7.06: Build placeholder pages: Partner Portal Login (P2), Partner Dashboard (P2), Marketing Assets (P2), Price Lists (P2), Training (P2), Events (P2), MDF Program (reserved P3), Distributor Success Stories (P2)

#### M4.8: Search Implementation
- [ ] T-4.8.01: Configure MeiliSearch index with all 287 content entries + 100+ SKU pages
- [ ] T-4.8.02: Implement search bar with auto-suggest dropdown (< 100ms response time)
- [ ] T-4.8.03: Build Search Results Page with faceted filtering (by content type, category, product family)
- [ ] T-4.8.04: Configure MeiliSearch relevance rules (product name boost, exact match priority, typo tolerance)
- [ ] T-4.8.05: Implement search analytics tracking (search terms, zero-result queries)

#### M4.9: Content QA — First Pass
- [ ] T-4.9.01: Run Screaming Frog crawl across all pages; verify zero 404s, all canonical URLs correct
- [ ] T-4.9.02: Verify every page has unique meta title (≤60 chars), meta description (≤160 chars), Open Graph image (1200×630)
- [ ] T-4.9.03: Verify all Schema.org structured data validates in Rich Results Test (Product, Article, FAQPage, Organization, BreadcrumbList, Event, JobPosting, LocalBusiness, Person, WebSite, SiteNavigationElement)
- [ ] T-4.9.04: Verify all product specs match CMS product master (BR-1.1 SKU uniqueness); all warranty claims match CMS configuration (BR-6.5)
- [ ] T-4.9.05: Verify all external links open in new tab (BR-GLOBAL-6); all forms route to correct backend
- [ ] T-4.9.06: Build 301 redirect map from old twinmos.com URLs to new IA paths; commit as `redirects.csv` (or Cloudflare Page Rules / Nginx rewrite map); ensure no orphan old URLs unaccounted for
- [ ] T-4.9.07: Generate and deploy `robots.txt` (allow all public sections; disallow `/partners/`, `/admin/`, `/api/`, draft preview paths); generate and deploy `humans.txt` and `security.txt` (per security@twinmos.com BR-LEGAL); deploy `ads.txt` placeholder if/when ad platforms used

#### M4.10: Phase 4 Gate Review
- [ ] T-4.10.01: Verify all 287 content entries live, all 100+ SKU pages rendered, all 34 legal pages present
- [ ] T-4.10.02: Verify search returns relevant results for top 50 expected queries
- [ ] T-4.10.03: Verify cross-axis navigation (Category × Brand) routes correctly
- [ ] T-4.10.04: Present full site walkthrough to TwinMOS; sign Phase 4 Gate

---

### Phase 5: Application Surfaces — Product & Discovery | Weeks 17–20 | Target: 13 Nov – 10 Dec 2026

**Objective:** Product catalog with dual-axis navigation, filtering, sorting, product comparison, where-to-buy locator fully functional.

#### M5.1: Product Catalog — Dual-Axis Navigation
- [ ] T-5.1.01: Implement Category-axis navigation: `/products/memory/` (DDR5 Desktop/Laptop, DDR4 Desktop/Laptop, DDR3 Legacy, Server reserved), `/products/ssd/` (NVMe Gen5/Gen4/Gen3, SATA, Enterprise reserved), `/products/portable-storage/`, `/products/usb-flash/`, `/products/accessories/`
- [ ] T-5.1.02: Implement Brand-axis navigation: all 11 brand pages listing their respective SKUs
- [ ] T-5.1.03: Wire bidirectional cross-links between Category pages and Brand pages
- [ ] T-5.1.04: Implement dynamic breadcrumb reflecting current navigation axis

#### M5.2: Product Filtering & Sorting
- [ ] T-5.2.01: Implement MeiliSearch faceted filtering: capacity (4GB–64GB for RAM, 120GB–4TB for SSD), speed (DDR4-2666 to DDR5-8000, PCIe Gen3/4/5), form factor (UDIMM, SO-DIMM, M.2 2280, 2.5"), RGB (Yes/No), interface (SATA III, PCIe NVMe, USB 3.2)
- [ ] T-5.2.02: Implement sort options: Relevance (default), Newest (by release_date desc), Price Low→High and Price High→Low (informational only in Phase 1; live ordering activates with Phase 13 e-commerce). "Best Selling" sort deferred to Phase 13 (requires order data) — placeholder UI element hidden until then
- [ ] T-5.2.03: Ensure filter state is reflected in URL for shareability; implement clear-all-filters
- [ ] T-5.2.04: Implement mobile-friendly filter drawer with apply button

#### M5.3: Product Detail Page (PDP) — Full Implementation
- [ ] T-5.3.01: Implement PDP with all sections: hero image gallery (zoom, swipe), spec table (all fields from data model), feature highlights, compatibility section ("Compatible Systems" tab), "Where to Buy" section, related products
- [ ] T-5.3.02: Implement image optimization: WebP/AVIF with responsive srcset via ImgProxy; lazy loading below fold
- [ ] T-5.3.03: Integrate downloadable datasheet PDF (auto-generated from CMS product data, < 2MB, branded per RFP-FR-8.1.6)
- [ ] T-5.3.04: Implement Schema.org Product + Offer structured data on all PDPs
- [ ] T-5.3.05: Implement Quick View modal (key specs overlay without leaving category page, per RFP-FR-8.1.3)

#### M5.4: Product Comparison Tool
- [ ] T-5.4.01: Build comparison page at `/products/compare/` accepting up to 4 product slugs via URL params
- [ ] T-5.4.02: Implement "Add to Compare" checkboxes on category/PDP pages; floating compare bar (shows count, clear, compare button)
- [ ] T-5.4.03: Build comparison table with spec rows; highlight differing values across products
- [ ] T-5.4.04: Generate shareable comparison URL; implement empty-state guidance

#### M5.5: Where-to-Buy Locator — Map & List
- [ ] T-5.5.01: Integrate Leaflet/MapLibre interactive map (no API key dependency) with retailer pins clustered by region
- [ ] T-5.5.02: Implement country auto-detection via IP geolocation with manual country selector override
- [ ] T-5.5.03: Build retailer list view: name, address, phone, website, distance, product categories carried
- [ ] T-5.5.04: Implement filter by retailer type: Online Store, Physical Store, Distributor, System Builder
- [ ] T-5.5.05: Implement India page with Supertron prominence (when active per BR-3.3), Bangladesh with Smart Technologies BD
- [ ] T-5.5.06: Implement "Buy Online" section on PDP with retailer logos and deep links (Amazon, Flipkart, local e-commerce)

#### M5.6: Interactive Feature Islands
- [ ] T-5.6.01: Build React island for search auto-suggest with debounced input, keyboard navigation, highlighted matches
- [ ] T-5.6.02: Build React island for product comparison with add/remove, floating bar, comparison table rendering
- [ ] T-5.6.03: Build React island for where-to-buy map with Leaflet, marker clustering, filter controls
- [ ] T-5.6.04: Verify all React islands hydrate correctly; no layout shift; no render-blocking

#### M5.7: Product Data Integration
- [ ] T-5.7.01: Import TwinMOS Product Manager data (Excel/CSV) into Strapi Product and SKU collections
- [ ] T-5.7.02: Validate all SKU data against BR-1.1 (global SKU uniqueness), BR-1.2 (spec completeness)
- [ ] T-5.7.03: Import and optimize all product images (high-resolution → WebP/AVIF responsive variants)
- [ ] T-5.7.04: Generate datasheet PDFs for all active SKUs from CMS product data

#### M5.8: SEO for Product Pages
- [ ] T-5.8.01: Implement dynamic meta titles: "[Product Name] — [Key Specs] | TwinMOS" for all PDPs
- [ ] T-5.8.02: Implement dynamic meta descriptions from product short description/excerpt
- [ ] T-5.8.03: Generate XML sitemap with all product pages, category pages, brand pages (auto-updating on publish)
- [ ] T-5.8.04: Implement canonical URLs on all product pages; verify no duplicate content paths

#### M5.9: Product Feature Performance
- [ ] T-5.9.01: Verify product list page loads within performance budget (LCP ≤2.0s, TBT ≤150ms)
- [ ] T-5.9.02: Verify product detail page LCP ≤2.0s with image gallery
- [ ] T-5.9.03: Verify filter/sort operations complete in < 300ms via MeiliSearch
- [ ] T-5.9.04: Verify comparison page renders ≤4 products in < 1.5s

#### M5.10: Phase 5 Gate Review
- [ ] T-5.10.01: Present shopping journey walkthrough: Home → Category → Filter → PDP → Compare → Where-to-Buy
- [ ] T-5.10.02: Verify catalog navigation works via both Category and Brand axes
- [ ] T-5.10.03: Verify all product data accurate against Product Manager source; sign Phase 5 Gate

---

### Phase 6: Application Surfaces — Forms & Support | Weeks 21–24 | Target: 11 Dec 2026 – 7 Jan 2027

**Objective:** All 15 form types operational, warranty registration end-to-end, compatibility finder MVP, knowledge base searchable.

#### M6.1: Form Infrastructure
- [ ] T-6.1.01: Build reusable form component library with Zod validation on both client and server
- [ ] T-6.1.02: Implement hCaptcha or Cloudflare Turnstile spam protection on all public forms (locked at Sprint 0 in ADR; Tech Stack §10.2 captures choice)
- [ ] T-6.1.03: Implement form submission storage in Strapi FormSubmission collection
- [ ] T-6.1.04: Implement auto-reply emails via Resend for all form types (within 5 minutes per BR-4.1)
- [ ] T-6.1.05: Implement form routing logic based on inquiry type (general→info@, sales→sales@, support→support@, partnership→partners@, media→pr@)
- [ ] T-6.1.06: Implement honeypot field (hidden `name="website"` or similar) on all public forms as second-line spam defense layered with captcha
- [ ] T-6.1.07: Implement form-abandonment analytics (Plausible custom events on field-blur and form-start vs form-submit); flag fields with >50% abandonment rate for UX review
- [ ] T-6.1.08: Implement file-upload security on Quote Request, RMA, and Counterfeit Report forms: MIME-type validation, magic-byte verification, max 10MB, virus-scan via ClamAV (self-hosted on cloud server) or equivalent before storing
- [ ] T-6.1.09: Implement universal form session timeout: form data cleared from client memory after 30 min idle; show warning at 25 min

#### M6.2: Contact & Inquiry Forms (7 types)
- [ ] T-6.2.01: Build General Inquiry form (Name, Email, Country, Subject dropdown, Message, Turnstile); routes to info@twinmos.com
- [ ] T-6.2.02: Build Quote Request form (Company, Contact, Email, Phone, Country, Product Interest, Quantity, Target Price, Delivery Timeline, File Upload ≤10MB, Message); routes to sales@ with high-priority flag
- [ ] T-6.2.03: Build Become-a-Distributor form (Company, Country, Contact, Email, Phone, Website, Years in Business, Current Brands, Estimated Monthly Volume, Message); routes to partners@ with 48h SLA per BR-4.4
- [ ] T-6.2.04: Build Sales Inquiry, Technical Support, Media Inquiry, OEM/ODM Inquiry forms with appropriate routing

#### M6.3: Warranty Registration
- [ ] T-6.3.01: Build warranty registration form (Product dropdown, Serial Number, Purchase Date, Retailer, Upload Receipt optional)
- [ ] T-6.3.02: Implement serial number format validation per product line
- [ ] T-6.3.03: Implement auto-confirmation email with registration details, warranty expiration date, certificate
- [ ] T-6.3.04: Build warranty lookup page (search by email + serial number); dashboard showing registered products and warranty status

#### M6.4: RMA Data Capture
- [ ] T-6.4.01: Build RMA submission form (Product, Serial Number, Purchase Date, Issue Description, Upload Photo/Video optional)
- [ ] T-6.4.02: Implement auto-check warranty status from registration data
- [ ] T-6.4.03: Implement RMA number generation and confirmation email
- [ ] T-6.4.04: Build RMA status placeholder page with 7-state tracker UI (full workflow in Phase 11)

#### M6.5: Newsletter & Subscriptions
- [ ] T-6.5.01: Implement newsletter signup form (footer + dedicated landing page) with Resend audience integration
- [ ] T-6.5.02: Implement double opt-in flow: confirmation email → confirm page → subscriber active
- [ ] T-6.5.03: Implement one-click unsubscribe with preference management
- [ ] T-6.5.04: Ensure all flows GDPR/CAN-SPAM compliant with unsubscribe link in every email (BR-GLOBAL-10)

#### M6.6: Compatibility Finder MVP
- [ ] T-6.6.01: Build Compatibility Finder page at `/compatibility-finder/` with 3 search tabs (Laptop, Desktop, Motherboard)
- [ ] T-6.6.02: Implement laptop/desktop search: brand + model autocomplete input; return compatible RAM + SSD products
- [ ] T-6.6.03: Implement motherboard search: brand + model + chipset; return QVL-validated products with XMP/EXPO compatibility
- [ ] T-6.6.04: Populate placeholder compatibility data for top 100 most popular devices (top 50 laptops, 30 desktops, 20 motherboards)
- [ ] T-6.6.05: Build results template: device specs card + compatible products grouped by category + "Not Verified" reassurance copy per BR-2.2
- [ ] T-6.6.06: Build empty-state: "No compatible products listed yet" with contact-support fallback; search must load in < 2s (BR-2.4)

#### M6.7: Knowledge Base
- [ ] T-6.7.01: Build KB Hub at `/support/knowledge-base/` with search and category browsing (Installation, Troubleshooting, Compatibility, Warranty, General)
- [ ] T-6.7.02: Build KB Article Template (title, last-updated, body, related articles, "Was this helpful?" rating)
- [ ] T-6.7.03: Populate 30 seed KB articles (DD5/DDR4 installation guides, SSD installation, cloning, firmware update, XMP/EXPO enabling, troubleshooting posts, RGB pairing, warranty claims, serial number location, SSD not recognized, write-protected portable SSD)
- [ ] T-6.7.04: Implement KB search via MeiliSearch; implement article rating feedback storage

#### M6.8: FAQ Accordions
- [ ] T-6.8.01: Build FAQ section with accordion-style expand/collapse, organized by category
- [ ] T-6.8.02: Populate FAQ categories: Memory FAQ, SSD FAQ, Portable Storage FAQ, USB Flash FAQ, Warranty FAQ, RMA FAQ, Firmware FAQ, RGB FAQ
- [ ] T-6.8.03: Implement Schema.org FAQPage structured data on each FAQ category page
- [ ] T-6.8.04: Ensure accordions are keyboard-accessible (Enter/Space to toggle, arrow keys to navigate)

#### M6.9: Install Guides & Downloads
- [ ] T-6.9.01: Build Install Guides Hub at `/support/install-guides/` with tile navigation
- [ ] T-6.9.02: Build Install Guide Template (tools needed, step-by-step instructions, images, video embed, common pitfalls, print stylesheet)
- [ ] T-6.9.03: Populate initial install guides: DDR5 desktop, DDR5 laptop, DDR4 desktop, M.2 NVMe, 2.5" SATA
- [ ] T-6.9.04: Build Downloads Hub, Manuals page, Quick-Start Guides page (firmware center fully implemented in Phase 11)

#### M6.10: Phase 6 Gate Review
- [ ] T-6.10.01: Verify all 15 form types submit, validate, route, and send auto-reply correctly
- [ ] T-6.10.02: Verify warranty registration end-to-end (register → confirmation → lookup)
- [ ] T-6.10.03: Verify Compatibility Finder MVP returns relevant results for top 50 expected queries
- [ ] T-6.10.04: Verify KB searchable and "Was this helpful?" rating functional; sign Phase 6 Gate

---

### Phase 7: Quality Gates & Pre-Launch QA | Weeks 25–28 | Target: 8 Jan – 4 Feb 2027

**Objective:** Achieve all Phase 1 launch readiness criteria: Lighthouse ≥90, WCAG 2.2 AA, OWASP ZAP clean, cross-browser QA, UAT, pen-test.

#### M7.1: Performance Optimization
- [ ] T-7.1.01: Run Lighthouse CI audit on all core pages (homepage, 5 PDPs, 5 content pages, forms, KB, finder, locator)
- [ ] T-7.1.02: Fix all performance violations: image optimization (WebP/AVIF, lazy loading), code splitting, third-party script audit, font optimization
- [ ] T-7.1.03: Achieve Lighthouse Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95 on all critical pages
- [ ] T-7.1.04: Verify Core Web Vitals: LCP ≤2.0s, INP ≤200ms, CLS ≤0.1, TTFB ≤200ms on production-like environment

#### M7.2: Accessibility Audit (WCAG 2.2 AA)
- [ ] T-7.2.01: Run axe-core automated scan on all 287 content pages and 100+ SKU pages; resolve all critical and serious findings
- [ ] T-7.2.02: Conduct manual keyboard-navigation test on all interactive surfaces (navigation, forms, filters, comparison, finder, KB, cookie banner, language selector)
- [ ] T-7.2.03: Conduct screen reader test with NVDA (Windows) and VoiceOver (macOS) on top 20 user journeys
- [ ] T-7.2.04: Verify color contrast ≥4.5:1 on all text elements; text resizable to 200% without loss of functionality; minimum target size ≥24×24 CSS px (WCAG 2.2 AA new criterion 2.5.8)
- [ ] T-7.2.05: Verify all images have descriptive alt text; decorative images have empty alt; videos have captions/transcripts
- [ ] T-7.2.06: Run color-blindness simulation (axe DevTools or NoCoffee plugin) for protanopia/deuteranopia/tritanopia/achromatopsia; verify no information conveyed by color alone (e.g., status indicators have text or icons in addition to color)
- [ ] T-7.2.07: Verify focus visibility per WCAG 2.2 AA criterion 2.4.11 (Focus Not Obscured Minimum); focus indicators meet contrast and minimum-area requirements
- [ ] T-7.2.08: Verify accessible authentication per WCAG 2.2 AA criterion 3.3.8 (Accessible Authentication Minimum); no cognitive function tests required for login (CAPTCHA fallback for assistive tech users)

#### M7.3: Security Audit
- [ ] T-7.3.01: Run OWASP ZAP baseline scan on staging environment; resolve all high/critical findings
- [ ] T-7.3.02: Verify CSP headers configured (strict), HSTS (max-age=31536000; includeSubDomains), X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] T-7.3.03: Verify secure cookies (HttpOnly, Secure, SameSite=Strict); JWT token rotation (1h expiry, refresh rotation)
- [ ] T-7.3.04: Run Snyk/Dependabot dependency vulnerability scan; update or patch all high/critical CVEs
- [ ] T-7.3.05: Verify file upload security (type validation, size limits, malware scan), rate limiting on API endpoints (100 req/min public, 1000/min authenticated)

#### M7.4: Cross-Browser & Cross-Device QA
- [ ] T-7.4.01: Test on Chrome, Firefox, Safari, Edge (latest 2 versions) — 50 critical pages
- [ ] T-7.4.02: Test on mobile devices: iOS Safari (iPhone 14/15), Android Chrome (Samsung Galaxy), Samsung Internet
- [ ] T-7.4.03: Test on tablets: iPad Safari, Android tablet Chrome
- [ ] T-7.4.04: Document all browser-specific issues; resolve critical and high-severity bugs

#### M7.5: Load & Stress Testing
- [ ] T-7.5.01: Configure k6 load test scripts for 5 critical scenarios (homepage, product list, PDP, compatibility search, form submission)
- [ ] T-7.5.02: Execute load test at 500 concurrent users (normal operations); verify response times within SLA
- [ ] T-7.5.03: Execute stress test at 5,000 concurrent users (product launch day); identify breaking point
- [ ] T-7.5.04: Execute spike test simulating COMPUTEX traffic (10,000 concurrent); document performance characteristics

#### M7.6: E2E Test Automation
- [ ] T-7.6.01: Write Playwright E2E tests for 10 critical user journeys (browse→filter→PDP→compare, compatibility search→results→PDP, where-to-buy→country→retailer, contact→submit→success, warranty→register→lookup, RMA→submit→status, KB→search→article, newsletter→signup→confirm, form validation errors, 404 handling)
- [ ] T-7.6.02: Configure Playwright to run on CI against staging environment
- [ ] T-7.6.03: Verify all E2E tests pass; fix flaky tests or remove within 24h

#### M7.7: Content QA — Second Pass
- [ ] T-7.7.01: Run Screaming Frog crawl; verify zero 404s, zero broken links, zero missing images
- [ ] T-7.7.02: Verify every page passes Content QA Checklist (title, meta, H1 hierarchy, facts cited, specs match, alt text, external links new tab, schema valid, cross-links live)
- [ ] T-7.7.03: Verify all 34 legal pages have "Last Updated" date; cookie banner triggers for EU/UK visitors
- [ ] T-7.7.04: Verify all 28 regional pages display correct distributor information per country

#### M7.8: Third-Party Penetration Test
- [ ] T-7.8.01: Engage third-party penetration testing vendor; provide staging URL and scope
- [ ] T-7.8.02: Review pen-test report; categorize findings by severity
- [ ] T-7.8.03: Remediate all critical and high-severity findings; re-test fixes
- [ ] T-7.8.04: Obtain clean pen-test report with no critical/high open findings

#### M7.9: UAT — Alpha & Beta Rounds
- [ ] T-7.9.01: Alpha UAT: Project team and QA test all features against acceptance criteria (1 week)
- [ ] T-7.9.02: Beta UAT: TwinMOS Marketing, Sales, Product stakeholders test against UAT scripts (1 week)
- [ ] T-7.9.03: Stakeholder UAT: Executive team and external partners review; collect feedback
- [ ] T-7.9.04: Resolve all critical and high-priority UAT bugs; document risk-accepted items
- [ ] T-7.9.05: Obtain all UAT sign-offs (Tech Lead, Marketing Director, Sales Director, Chairman/Delegate)

#### M7.10: Phase 7 Gate — Launch Readiness
- [ ] T-7.10.01: Verify all 10 launch readiness criteria from BRD §28.1 met: (1) zero critical/high-severity bugs in QA, (2) Lighthouse Performance ≥90 / Accessibility ≥95 / Best Practices ≥95 / SEO ≥95 on all core pages, (3) all 14 Phase-1 competitor-standard features implemented (BRD Appendix C lists 16 rows; 2 are P2/P3 deferred — the 14 in Phase 1 scope are: Product Finder by Device, Product Comparison, Where-to-Buy Locator, Warranty Registration, RMA Portal, Knowledge Base, Gaming Hub, News, Awards, Multi-Language framework readiness, Compatibility Search, Compliance Hub, Brand Architecture, Quality Bar — Live Chat and Anti-Counterfeit deferred to Phase 12 / Phase 10; E-Commerce and Firmware Center deferred to Phase 13 / Phase 11 — see Appendix G mapping), (4) third-party penetration test passed, (5) content populated for all P1-flagged Content Map entries, (6) all 15 form types tested and routing correctly, (7) SEO metadata present on all public pages (Screaming Frog crawl), (8) GA4 + Plausible analytics and tracking verified, (9) stakeholder UAT sign-off from Marketing/Sales/Product, (10) DR plan tested (DB restore + CMS restore + full site rebuild)
- [ ] T-7.10.02: Verify DNS and SSL configuration ready for cutover; 301 redirect map from old URLs prepared (built in T-4.9.06); Cloudflare DNS records reviewed
- [ ] T-7.10.03: Verify monitoring and alerting active (Sentry, UptimeRobot, Plausible); rollback plan documented and tested
- [ ] T-7.10.04: Conduct cookie compliance audit: cookie banner triggered for EU/UK visitors per BR-22.1; granular consent (Strictly Necessary / Analytics / Marketing / Personalization) honoured; cookies blocked until consent given; cookie policy page link visible; expired-consent re-prompt at 12 months
- [ ] T-7.10.05: Conduct full launch-day smoke-test rehearsal in staging (mirrored production env): all 15 forms submit, search returns results, finder returns results, locator shows retailers on map, all Schema.org validates, SSL valid, analytics events fire, monitoring alerts trigger; document the smoke-test runbook
- [ ] T-7.10.06: Verify production environment variables: all credentials present (Resend, Sentry, Plausible, GA4, MeiliSearch, Cloudflare API, ERP API placeholder for Phase 11); rotation policy documented; secrets stored in cloud-server env (not committed to repos)
- [ ] T-7.10.07: Go/No-Go decision documented; sign Phase 7 Gate

---

### Phase 8: Phase 1 Launch & Hypercare | Weeks 29–32 | Target: 5 Feb – 4 Mar 2027

**Objective:** Public launch of Phase 1 (English), 24/7 monitoring, bug triage, CMS training, Phase 2 planning.

#### M8.1: Soft Launch
- [ ] T-8.1.01: Deploy to production on twinmos.com with limited public audience access
- [ ] T-8.1.02: Execute 24-hour smoke test: all pages load, all forms submit, search works, finder returns results, locator shows retailers
- [ ] T-8.1.03: Monitor Sentry for errors, Plausible for traffic patterns, UptimeRobot for availability
- [ ] T-8.1.04: Verify GA4 real-time reports showing traffic and events; verify Google Search Console indexing

#### M8.2: DNS Cutover & Public Launch
- [ ] T-8.2.01: Execute DNS cutover: point twinmos.com to own cloud server production deployment
- [ ] T-8.2.02: Verify SSL certificate valid and HTTPS enforced globally
- [ ] T-8.2.03: Implement 301 redirects from all old URLs to new corresponding pages
- [ ] T-8.2.04: Submit XML sitemap to Google Search Console and Bing Webmaster Tools
- [ ] T-8.2.05: Announce launch via social media, distributor email, PR channels

#### M8.3: Post-Launch Monitoring (Week 1)
- [ ] T-8.3.01: 24/7 monitoring rotation for first week; hourly Sentry/UptimeRobot checks
- [ ] T-8.3.02: Monitor Core Web Vitals via CrUX dashboard; address any regressions
- [ ] T-8.3.03: Track Google Search Console indexing status; verify no crawl errors
- [ ] T-8.3.04: Track Plausible analytics for traffic, bounce rate, session duration, conversion events
- [ ] T-8.3.05: Monitor `info@`, `support@`, `sales@`, `partners@`, `pr@` mailboxes daily; coordinate with TwinMOS support team on first-week customer queries; capture trends for KB / FAQ expansion in Phase 11
- [ ] T-8.3.06: Monitor social channels (Facebook, X/Twitter, LinkedIn, Instagram) for launch reactions; document positive feedback for testimonials carousel; capture issues/complaints into bug triage

#### M8.4: Launch Bug Triage (Week 2)
- [ ] T-8.4.01: Triage all bugs reported post-launch using Bug Severity Definitions (Critical ≤4h fix, High ≤24h, Medium ≤3d, Low backlog)
- [ ] T-8.4.02: Fix all critical and high-severity bugs discovered post-launch
- [ ] T-8.4.03: Conduct root-cause analysis on any P0/P1 incidents; document in post-mortem
- [ ] T-8.4.04: Release first post-launch patch with bug fixes and minor improvements

#### M8.5: CMS Training — Admin & Editor Roles
- [ ] T-8.5.01: Deliver CMS training to TwinMOS Marketing team (Editor role): product management, content page creation/editing, image upload, SEO metadata
- [ ] T-8.5.02: Deliver CMS training to TwinMOS Product Manager (Editor role): SKU management, spec updates, compatibility data entry, datasheet generation
- [ ] T-8.5.03: Deliver CMS training to TwinMOS Admin (Admin role): user management, role assignment, workflow configuration, analytics dashboard
- [ ] T-8.5.04: Record training videos for future reference; create CMS user quick-reference guide

#### M8.6: Technical Documentation Handover
- [ ] T-8.6.01: Finalize and deliver deployment runbook (environment setup, local build pipeline, cloud server deployment, monitoring, rollback)
- [ ] T-8.6.02: Finalize and deliver operations runbook (backup/restore, scaling, incident response, DR procedures)
- [ ] T-8.6.03: Finalize and deliver API documentation (all public and admin endpoints)
- [ ] T-8.6.04: Finalize and deliver content management guide (content workflows, editorial calendar, SEO checklist)

#### M8.7: DR Drill
- [ ] T-8.7.01: Execute database failure scenario: restore PostgreSQL from backup; verify RTO < 1 hour, RPO < 15 minutes
- [ ] T-8.7.02: Execute CMS content loss scenario: restore from backup; verify RTO < 2 hours, RPO < 1 hour
- [ ] T-8.7.03: Execute complete site outage scenario: redeploy from scratch; verify RTO < 4 hours
- [ ] T-8.7.04: Document DR drill results; update runbooks with lessons learned

#### M8.8: Phase 1 Retrospective
- [ ] T-8.8.01: Collect feedback from all stakeholders (TwinMOS Marketing, Sales, Product, IT)
- [ ] T-8.8.02: Conduct retrospective meeting: what went well, what didn't, what to improve for Phase 2
- [ ] T-8.8.03: Document retrospective findings; update risk register; revise estimates for Phase 2
- [ ] T-8.8.04: Publish retrospective document; archive in project repository

#### M8.9: Phase 2 Planning & Preparation
- [ ] T-8.9.01: Finalize Phase 2 scope with TwinMOS PM; lock sprint backlog and milestone schedule
- [ ] T-8.9.02: Engage translation vendor for AR/BN/HI; sign contracts; deliver glossary of 200+ technical terms
- [ ] T-8.9.03: Prepare translation memory seed file from Phase 1 English content
- [ ] T-8.9.04: Schedule Phase 2 kickoff with all stakeholders; confirm resource availability

#### M8.10: Phase 8 Gate — Phase 1 Complete
- [ ] T-8.10.01: Verify all Phase 1 deliverables accepted; budget reconciliation complete
- [ ] T-8.10.02: Verify all documentation complete and handed over; CMS training delivered
- [ ] T-8.10.03: Verify hypercare period complete with no outstanding critical/high bugs
- [ ] T-8.10.04: Verify Phase 2 plan locked and approved; sign Phase 1 Complete milestone (Project Sponsor/Chairman)

---

### Phase 9: Localization Foundation & Partner Portal | Weeks 33–36 | Target: 5 Mar – 1 Apr 2027

**Objective:** AR/BN/HI i18n framework active, RTL verified, Better Auth integrated with Strapi roles, Partner Portal authentication functional.

#### M9.1: Translation Vendor Engagement
- [ ] T-9.1.01: Execute translation vendor contracts for AR/BN/HI; confirm delivery milestones aligned to the Phase 9 sprint (Week 33–36); contract includes confidentiality NDA + IP assignment
- [ ] T-9.1.02: Provide vendor with glossary of 200+ TwinMOS technical terms (DDR5, NVMe, JEDEC, XMP, EXPO, RGB, MTBF, etc.) in TBX or CSV format
- [ ] T-9.1.03: Provide vendor with translation memory seed file from Phase 1 English content (TMX format preferred)
- [ ] T-9.1.04: Define translation QA process: native-speaker translation → native-speaker review (different person) → TwinMOS Marketing approval → publish to staging → re-verify in context → promote to production
- [ ] T-9.1.05: Standardize on a CAT (Computer-Assisted Translation) tool with the vendor (e.g., memoQ, Trados, Smartcat, Crowdin); ensure XLIFF round-trip with Strapi i18n plugin works end-to-end

#### M9.2: Strapi i18n Configuration
- [ ] T-9.2.01: Configure Strapi i18n plugin with locales: en (default), ar, bn, hi
- [ ] T-9.2.02: Extend all Strapi content types with localised fields (title, description, body, SEO metadata)
- [ ] T-9.2.03: Configure translation key export pipeline (JSON/XLIFF) for vendor handoff
- [ ] T-9.2.04: Configure translation import pipeline (JSON/XLIFF → Strapi); test with sample AR translations

#### M9.3: Astro i18n Routing & RTL
- [ ] T-9.3.01: Implement Astro i18n routing: `/en/...`, `/ar/...`, `/bn/...`, `/hi/...` with EN as default
- [ ] T-9.3.02: Configure language switcher in header with 4 active languages; persist preference in cookie
- [ ] T-9.3.03: Implement RTL CSS framework for Arabic: `dir="rtl"`, mirrored layout, Noto Sans Arabic font, right-aligned text
- [ ] T-9.3.04: Verify Arabic renders: layouts mirror correctly, no overflow/clipping, numerics/SKUs/Latin names remain LTR inline
- [ ] T-9.3.05: Configure hreflang tags for all 4 active locales; canonical URLs set per locale

#### M9.4: Better Auth — Partner Portal Authentication
- [ ] T-9.4.01: Integrate Better Auth with Strapi; implement registration form with email verification
- [ ] T-9.4.02: Implement login with email + password; password reset flow; session timeout after 30 min inactivity per BR-7.1
- [ ] T-9.4.03: Implement Strapi RBAC roles: Distributor, OEM-ODM, System Builder, Reseller, Admin
- [ ] T-9.4.04: Implement account lockout after 5 failed login attempts (lockout duration 30 min) per BR-7.1 (portal access invitation-only) and BRD §21.2 partner-portal security requirements
- [ ] T-9.4.05: Prepare MFA foundation (TOTP) for Phase 12 activation

#### M9.5: Partner Portal — Dashboard & Access Control
- [ ] T-9.5.01: Build Partner Portal login page at `/partners/login/` with TwinMOS branding
- [ ] T-9.5.02: Build Partner Dashboard with personalized greeting, program overview, quick links to assets/pricing/training
- [ ] T-9.5.03: Implement role-based content gating: dashboard renders program-specific content based on assigned role
- [ ] T-9.5.04: Verify portal access is invitation-only per BR-7.1; self-registration not permitted

#### M9.6: Partner Portal — Asset Library Foundation
- [ ] T-9.6.01: Build asset library page at `/partners/assets/` with category structure (Product Images, Banners, Datasheets, Videos, POS Materials, Logos)
- [ ] T-9.6.02: Upload initial set of marketing assets provided by TwinMOS Marketing
- [ ] T-9.6.03: Implement asset preview before download; organize by product, language, format

#### M9.7: Partner Portal — Price List & Training Foundations
- [ ] T-9.7.01: Build price list page at `/partners/pricing/` (placeholder — full data in Phase 10)
- [ ] T-9.7.02: Build training resources page at `/partners/training/` (placeholder)
- [ ] T-9.7.03: Build partner events calendar page at `/partners/events/` (placeholder)
- [ ] T-9.7.04: Implement PDF watermarking infrastructure (partner name + date) per BR-7.2

#### M9.8: Translation Import — First Batch
- [ ] T-9.8.01: Receive first draft AR/BN/HI translations from vendor
- [ ] T-9.8.02: Import AR translations into Strapi; verify RTL rendering on all 28 regional pages
- [ ] T-9.8.03: Import BN translations into Strapi; verify Bengali script rendering (Noto Sans Bengali)
- [ ] T-9.8.04: Import HI translations into Strapi; verify Devanagari script rendering (Noto Sans Devanagari)

#### M9.9: Locale-Specific SEO
- [ ] T-9.9.01: Update hreflang tags to include all 4 live locales (en, ar, bn, hi)
- [ ] T-9.9.02: Generate locale-specific XML sitemaps; submit to Google Search Console
- [ ] T-9.9.03: Implement locale-aware date, time, and number formatting
- [ ] T-9.9.04: Verify canonical URLs correct per locale; no duplicate content across language variants

#### M9.10: Phase 9 Gate Review
- [ ] T-9.10.01: Present Partner Portal login + dashboard + role-based content to TwinMOS Sales Director
- [ ] T-9.10.02: Present RTL Arabic preview on 5 key pages; verify mirroring and font rendering
- [ ] T-9.10.03: Verify translation import pipeline functional for all 3 locales
- [ ] T-9.10.04: Sign Phase 9 Gate; proceed to Phase 10

---

### Phase 10: Partner Enablement & Anti-Counterfeit | Weeks 37–40 | Target: 2 Apr – 29 Apr 2027

**Objective:** Partner asset library and price lists operational, SN-Check anti-counterfeit tool live, full partner self-service experience.

#### M10.1: Partner Asset Library — Full Implementation
- [ ] T-10.1.01: Populate full asset library: product images (all 11 brands), banners (web + print sizes), datasheets (all SKUs), videos, POS materials, logos
- [ ] T-10.1.02: Implement category filtering, search within asset library, bulk download as ZIP
- [ ] T-10.1.03: Implement download tracking per asset (analytics event)
- [ ] T-10.1.04: Verify assets are only accessible to logged-in partners (not publicly indexed)

#### M10.2: Partner Price Lists — Full Implementation
- [ ] T-10.2.01: Import distributor pricing data (SKU, description, unit price USD, MOQ, volume tiers)
- [ ] T-10.2.02: Build price list view with currency display based on distributor region (USD/AED/INR/BDT)
- [ ] T-10.2.03: Implement watermarked PDF export (partner name, date, confidential notice per BR-7.2)
- [ ] T-10.2.04: Implement Excel export; effective date and revision history visible
- [ ] T-10.2.05: Verify pricing data only accessible to logged-in authorized distributors

#### M10.3: Anti-Counterfeit — Serial Number Check (SN-Check)
- [ ] T-10.3.01: Build SN-Check page at `/support/sn-check/` with single serial number input
- [ ] T-10.3.02: Create Strapi `valid_serials` collection with manufacturing serial number data
- [ ] T-10.3.03: Implement lookup logic returning: VERIFIED GENUINE / SERIAL NOT FOUND / SUSPECTED COUNTERFEIT
- [ ] T-10.3.04: Implement rate limiting (max 100 lookups/hour per IP per BR-17.1)
- [ ] T-10.3.05: Log all lookups for trend analysis (privacy-preserving); link from product pages and footer

#### M10.4: Anti-Counterfeit — Manufacturing Integration
- [ ] T-10.4.01: Build admin CSV bulk-import for valid serial numbers from manufacturing
- [ ] T-10.4.02: Implement duplicate handling and validation rules on import
- [ ] T-10.4.03: Configure daily SN ingest schedule; build integration monitoring dashboard
- [ ] T-10.4.04: Test SN-check with valid, invalid, and boundary-case serial numbers

#### M10.5: Anti-Counterfeit — Reporting & Policy
- [ ] T-10.5.01: Build counterfeit reporting form (contact info, serial, retailer, photos, story)
- [ ] T-10.5.02: Implement brand-protection team notification on report submission (email + dashboard alert)
- [ ] T-10.5.03: Implement auto-reply with reporting reference number; 5-business-day response SLA per BR-17.2
- [ ] T-10.5.04: Publish counterfeit policy pages at `/support/counterfeit/` and `/legal/counterfeit-policy/` (content-paired per BR-17.3)

#### M10.6: Partner Portal — MDF Pre-Claim
- [ ] T-10.6.01: Build MDF pre-claim form (campaign details, budget request, expected outcomes)
- [ ] T-10.6.02: Implement MDF submission storage in Strapi with status tracking (Submitted, Under Review, Approved, Rejected)
- [ ] T-10.6.03: Build placeholder MDF Program page at `/partners/mdf/` (full activation Phase 15)
- [ ] T-10.6.04: Implement partner activity audit logging (all partner actions logged with retention policy)

#### M10.7: Partner Portal — Self-Service Enhancements
- [ ] T-10.7.01: Implement partner tier status and points display on dashboard
- [ ] T-10.7.02: Build partner profile management (update contact info, password change)
- [ ] T-10.7.03: Implement session timeout (30 min idle) and max session duration (8 hours absolute)
- [ ] T-10.7.04: Verify all partner features work across Chrome, Firefox, Safari, Edge
- [ ] T-10.7.05: Build partner onboarding email sequence via Resend (Day 0 welcome, Day 3 portal tour, Day 7 first-asset-download nudge, Day 14 program-orientation-call invitation, Day 30 satisfaction check-in); each email links back to partner portal with tracking UTM

#### M10.8: Translation — AR/BN/HI Native Review
- [ ] T-10.8.01: Engage native Arabic speaker for content review (cultural appropriateness, technical accuracy)
- [ ] T-10.8.02: Engage native Bengali speaker for content review
- [ ] T-10.8.03: Engage native Hindi speaker for content review
- [ ] T-10.8.04: Apply corrections from native reviews; obtain sign-off from each reviewer

#### M10.9: Translation — Cross-Browser & Mobile QA
- [ ] T-10.9.01: Test Arabic RTL on Chrome, Safari, Firefox, Edge across 50 critical pages
- [ ] T-10.9.02: Test Bengali and Hindi rendering on iOS Safari (iPhone), Android Chrome (Samsung Galaxy)
- [ ] T-10.9.03: Test Arabic screen reader (NVDA + VoiceOver) for RTL navigation
- [ ] T-10.9.04: Verify fallback to English when translation is missing (no blank UI elements)

#### M10.10: Phase 10 Gate Review
- [ ] T-10.10.01: Present partner journey: login → dashboard → asset download → price list export → MDF pre-claim
- [ ] T-10.10.02: Present SN-check demo: genuine lookup, not-found, counterfeit reporting workflow
- [ ] T-10.10.03: Verify AR/BN/HI native reviews complete and corrections applied
- [ ] T-10.10.04: Sign Phase 10 Gate; proceed to Phase 11

---

### Phase 11: Full Support Ecosystem & ERP Integration | Weeks 41–44 | Target: 30 Apr – 27 May 2027

**Objective:** RMA 7-state workflow end-to-end, Compatibility Finder expanded to 500+ devices, ERP product sync operational, Firmware Download Center live.

#### M11.1: RMA — Full 7-State Workflow
- [ ] T-11.1.01: Implement 7-state RMA tracker: Submitted → Under Review → Approved → In Repair → Shipped → Delivered → Closed
- [ ] T-11.1.02: Build customer-facing RMA status page with current state highlighting, history timeline, next-step guidance
- [ ] T-11.1.03: Build support agent RMA management interface in Strapi admin (status update, internal notes)
- [ ] T-11.1.04: Implement email notifications at every RMA state change via Resend (branded templates)
- [ ] T-11.1.05: Implement RMA data backup daily with 30-day retention

#### M11.2: Compatibility Finder — Full Expansion
- [ ] T-11.2.01: Ingest QVL data for 500+ motherboards/laptops/desktops from motherboard manufacturer QVLs and TwinMOS testing
- [ ] T-11.2.02: Implement CSV batch upload for QVL data (template, validation, error reporting)
- [ ] T-11.2.03: Implement compatibility confidence score per result; notes explaining exceptions
- [ ] T-11.2.04: Implement search within compatible systems list on PDP; pagination for 50+ item lists
- [ ] T-11.2.05: Verify compatibility search returns results in < 2 seconds (BR-2.4); test with top 100 expected queries

#### M11.3: ERP Integration — Product Master Sync
- [ ] T-11.3.01: Configure read-only API connection to TwinMOS ERP; document integration architecture
- [ ] T-11.3.02: Implement daily SKU data sync (product master, specifications, packaging info) from ERP to Strapi
- [ ] T-11.3.03: Implement sync log dashboard (success/failure counts, last sync timestamp, error details)
- [ ] T-11.3.04: Implement error handling: 3x retry on failure, alert on 3 consecutive failures, manual retry option
- [ ] T-11.3.05: Store ERP API credentials securely in server environment variables; document rotation procedure (90-day rotation cadence; stored in TwinMOS-internal secrets manager); use mTLS or signed-API-key authentication; revocation workflow tested
- [ ] T-11.3.06: Implement ERP integration health-check endpoint for UptimeRobot (verifies sync timestamp ≤24h old); alert on sync failure or stale-data condition

#### M11.4: ERP Integration — Pricing Sync
- [ ] T-11.4.01: Implement daily pricing data sync from ERP for partner price lists
- [ ] T-11.4.02: Implement discrepancy flagging (price change > 20% triggers review alert)
- [ ] T-11.4.03: Maintain pricing audit trail (old price, new price, change date, source)
- [ ] T-11.4.04: Verify price list data updates automatically after each sync

#### M11.5: Firmware Download Center
- [ ] T-11.5.01: Build firmware download center at `/support/downloads/firmware/` organized by category → product line → model
- [ ] T-11.5.02: Implement serial number validation before firmware download (invalid serial blocked per BR-6.3)
- [ ] T-11.5.03: Each download shows: version, release date, file size, changelog, compatibility, checksum (MD5/SHA256)
- [ ] T-11.5.04: Build admin firmware upload interface (file type validation, release notes, version history)
- [ ] T-11.5.05: Display firmware compatibility matrix per device/SKU; warning about backup before update

#### M11.6: Knowledge Base — Article Expansion
- [ ] T-11.6.01: Expand KB from 30 to 50+ articles covering Phase 2 features (RMA process, SN-check, firmware update troubleshooting)
- [ ] T-11.6.02: Implement KB article quarterly review flag (auto-flag articles > 90 days without review per BR-6.4)
- [ ] T-11.6.03: Implement "Was this helpful?" feedback dashboard for support team
- [ ] T-11.6.04: Add video embeds to KB articles where tutorial videos available

#### M11.7: Support Integration Testing
- [ ] T-11.7.01: End-to-end test: warranty registration → RMA submission → status tracking → email notification → agent update
- [ ] T-11.7.02: End-to-end test: compatibility search → result → PDP → compatible systems tab
- [ ] T-11.7.03: End-to-end test: firmware search → serial validation → download → checksum verification
- [ ] T-11.7.04: Integration test: ERP sync → Strapi product update → frontend reflects new data

#### M11.8: Phase 2 Content QA
- [ ] T-11.8.01: QA all new Phase 2 pages (partner portal, SN-check, counterfeit policy, firmware center)
- [ ] T-11.8.02: Verify all partner features behind authentication cannot be accessed unauthenticated
- [ ] T-11.8.03: Run axe-core accessibility scan on all Phase 2 pages; resolve critical/serious findings
- [ ] T-11.8.04: Run Lighthouse CI on partner portal pages; verify performance within budget

#### M11.9: Security Audit — Partner Portal
- [ ] T-11.9.01: Run OWASP ZAP scan on partner portal authentication flow
- [ ] T-11.9.02: Verify partner data isolation (Partner A cannot see Partner B's pricing/assets)
- [ ] T-11.9.03: Verify session security: token rotation, secure cookies, idle timeout enforcement
- [ ] T-11.9.04: Conduct penetration test on partner portal specifically; remediate findings

#### M11.10: Phase 11 Gate Review
- [ ] T-11.10.01: Present full RMA workflow: submit → track 7 states → agent update → email notifications
- [ ] T-11.10.02: Present compatibility finder with 500+ device coverage; demonstrate CSV QVL import
- [ ] T-11.10.03: Present ERP sync dashboard; demonstrate product data flowing from ERP to frontend
- [ ] T-11.10.04: Sign Phase 11 Gate; proceed to Phase 12

---

### Phase 12: Interactive Features & Marketing Automation | Weeks 45–48 | Target: 28 May – 24 Jun 2027

**Objective:** Live chat (Chatwoot) operational, Gaming Hub interactive features (RGB visualizer, build gallery), HubSpot CRM integration, whitepaper gating, AR/BN/HI localization launch.

#### M12.1: Live Chat — Chatwoot Deployment
- [ ] T-12.1.01: Self-host Chatwoot on own cloud server (4GB RAM minimum + Postgres + Redis + S3-compatible storage = Backblaze B2 or local) with daily backup configuration; allocate separate VM if isolation desired (Tech Stack §14.1)
- [ ] T-12.1.02: Integrate Chatwoot widget on all website pages (bottom-right, configurable per locale; honour cookie consent)
- [ ] T-12.1.03: Configure business hours display (Dubai timezone GMT+4); after-hours auto-reply with 24h response SLA; offline mode captures email for follow-up
- [ ] T-12.1.04: Configure agent routing; implement queue display when all agents busy
- [ ] T-12.1.05: Implement visitor context pane (current page, country via cf-ipcountry, browser, visit history); sensitive data masked per BR-22.1 / GDPR

#### M12.2: Live Chat — Agent Experience
- [ ] T-12.2.01: Configure TwinMOS support agent accounts in Chatwoot
- [ ] T-12.2.02: Implement canned responses for common queries (warranty, RMA status, product availability, distributor lookup)
- [ ] T-12.2.03: Implement chat transcript email to visitor on chat end
- [ ] T-12.2.04: Create chat-to-ticket integration: agent can create support ticket from chat
- [ ] T-12.2.05: Train TwinMOS support team on Chatwoot agent dashboard; create agent quick-reference guide

#### M12.3: Gaming Hub — RGB Visualizer
- [ ] T-12.3.01: Build interactive RGB visualizer showing VOLTX RGB memory modules with different lighting presets (Static, Breathing, Rainbow, Wave, Pulse)
- [ ] T-12.3.02: Implement sync compatibility badges: ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light, ASRock Polychrome with tooltip explanations
- [ ] T-12.3.03: Ensure visualizer performs at 60fps on desktop, degrades gracefully on mobile
- [ ] T-12.3.04: Add video demonstrations of RGB effects in real PC builds

#### M12.4: Gaming Hub — Build Gallery
- [ ] T-12.4.01: Build build submission form (Name, Location, Build Specs, Photo Upload max 5 images)
- [ ] T-12.4.02: Implement moderation queue in Strapi (approve/reject with notification)
- [ ] T-12.4.03: Build build gallery page with filterable grid (by product, by build type)
- [ ] T-12.4.04: Implement social sharing for individual builds (Open Graph tags per build)
- [ ] T-12.4.05: Implement report/flag inappropriate content feature

#### M12.5: HubSpot CRM Integration
- [ ] T-12.5.01: Configure HubSpot API connection; securely store credentials in server environment variables (90-day rotation per Tech Stack §14)
- [ ] T-12.5.02: Implement form submission → HubSpot contact creation (deduplication by email)
- [ ] T-12.5.03: Implement lead source attribution (form type, page URL, campaign UTM parameters, referrer)
- [ ] T-12.5.04: Build lead capture dashboard in Strapi admin (leads by source, form, date; exportable CSV)
- [ ] T-12.5.05: Configure HubSpot list segmentation by lead-source / region / persona / lifecycle-stage (subscriber, lead, MQL, SQL, customer); segments power email-marketing automation (drip nurture, persona-based content recommendations)
- [ ] T-12.5.06: Configure HubSpot lifecycle workflows (newsletter signup → welcome series; quote request → sales follow-up; distributor inquiry → partner-onboarding sequence)

#### M12.6: Whitepaper Gating & Lead Capture
- [ ] T-12.6.01: Implement whitepaper gating: email + company capture form before download
- [ ] T-12.6.02: Send download link via email after form submission (lead logged in HubSpot)
- [ ] T-12.6.03: Build whitepaper download tracking dashboard
- [ ] T-12.6.04: Implement A/B test framework for homepage hero banners (2 variants, conversion tracked)

#### M12.7: Marketing Automation
- [ ] T-12.7.01: Build marketing campaign creation interface in Strapi (start/end dates, banner management, geographic targeting)
- [ ] T-12.7.02: Implement cross-sell banner component (CMS-managed, appears on relevant product/category pages per BR-15.4 — note: BR-15.1 governs promotions auto-archive; BRD v3.3 will introduce BR-15.4 for cross-sell banner CMS rules per Forensic Audit v3.0 F-RM-008)
- [ ] T-12.7.03: Implement exit-intent popup (newsletter capture or promotion CTA; respects 24h dismissal per BR-15.2)
- [ ] T-12.7.04: Build marketing analytics dashboard aggregating Plausible + HubSpot data

#### M12.8: AR/BN/HI Localization — Final QA & Launch
- [ ] T-12.8.01: Complete final native-speaker review for AR/BN/HI content; apply remaining corrections
- [ ] T-12.8.02: Verify all hreflang tags correct for 4 active locales; sitemaps include all language variants
- [ ] T-12.8.03: Execute cross-browser QA for all 3 new locales (Chrome, Safari, Firefox, Edge, Samsung Internet)
- [ ] T-12.8.04: Execute mobile QA for RTL and BN/HI (iOS Safari, Android Chrome); touch targets adequate
- [ ] T-12.8.05: Announce AR/BN/HI localization launch via regional distributor channels and social media

#### M12.9: Phase 2 UAT
- [ ] T-12.9.01: TwinMOS Sales Director UAT: partner portal, price lists, MDF pre-claim
- [ ] T-12.9.02: TwinMOS Support Team UAT: RMA workflow, firmware center, live chat
- [ ] T-12.9.03: TwinMOS Marketing Director UAT: gaming hub interactives, HubSpot CRM, lead dashboard
- [ ] T-12.9.04: Resolve all critical and high UAT bugs; obtain Phase 2 UAT sign-off

#### M12.10: Phase 12 Gate — Phase 2 Launch Readiness
- [ ] T-12.10.01: Verify all Phase 2 features operational (partner portal, RMA, compatibility 500+, anti-counterfeit, live chat, gaming interactive, HubSpot, whitepaper gating, AR/BN/HI locales)
- [ ] T-12.10.02: Verify Phase 2 launch readiness checklist: all features tested, all locales QA'd, monitoring active
- [ ] T-12.10.03: Phase 2 retro conducted; Phase 3 plan reviewed and updated
- [ ] T-12.10.04: Sign Phase 12 Gate; Phase 2 Complete milestone

---

### Phase 13: E-Commerce Foundation & Launch | Weeks 49–64 | Target: 25 Jun – 14 Oct 2027

**Objective:** E-commerce stack decided (ADR-007), Medusa.js or Stripe Checkout scaffolded, full cart→checkout→payment→confirmation flow, customer accounts, hardening, launch.

#### M13.1: E-Commerce Architecture Decision & Node.js LTS Migration
- [ ] T-13.1.01: Evaluate Medusa.js v2 vs Stripe Checkout-only approach; draft ADR-007 evaluation matrix (effort, ops complexity, PCI scope, lock-in)
- [ ] T-13.1.02: Sign ADR-007 (E-Commerce Stack); commit with team review
- [ ] T-13.1.03: Upgrade cloud server resources for e-commerce load capacity (8 vCPU, 32GB RAM, 500GB SSD per T-1.2.02 plan); validate Cloudflare WAF rules for checkout endpoints
- [ ] T-13.1.04: Model Strapi commerce collections: Order, OrderItem, Cart, Payment, Shipment, TaxRule
- [ ] T-13.1.05: **Execute Node.js LTS migration per ADR-008**: upgrade from Node.js 22 LTS to Node.js 24 LTS on cloud server origin; re-run full Playwright E2E suite + Lighthouse CI on staging to verify no regressions; plan to complete migration before Node 22 EOL on 30 April 2027

#### M13.2: E-Commerce — Product Catalog Wiring
- [ ] T-13.2.01: Wire SKU pages with Add to Cart CTA (price, quantity selector, availability status)
- [ ] T-13.2.02: Implement price sync from Strapi commerce collections (informational prices activated for e-commerce)
- [ ] T-13.2.03: Implement inventory reservation logic (stock reserved on checkout start; released on timeout/cancel)
- [ ] T-13.2.04: Ensure local e-commerce stack runs with all services healthy (local PostgreSQL, Strapi, Astro dev server)

#### M13.3: Shopping Cart — Full Implementation
- [ ] T-13.3.01: Build cart page with item images, names, quantities, unit prices, subtotal, total
- [ ] T-13.3.02: Implement Add to Cart from SKU detail pages with quantity selector and toast confirmation
- [ ] T-13.3.03: Implement cart state management: localStorage persistence + backend sync if logged in; proper hydration (no errors)
- [ ] T-13.3.04: Build header cart badge with item count; click opens mini-cart drawer
- [ ] T-13.3.05: Implement promo code input with validation (discount applied/error message)

#### M13.4: Checkout Flow
- [ ] T-13.4.01: Build shipping address form with autocomplete (Cloudflare-friendly address API or country-specific service), validation, and support for all target countries (UAE, KSA, Bahrain, Kuwait, Oman, Qatar, India, Bangladesh — Phase 13 launch markets)
- [ ] T-13.4.02: Implement shipping method selection with cost and ETA per method (Standard / Express / Same-Day where supported)
- [ ] T-13.4.03: Implement tax calculation per region: 5% VAT (UAE / Bahrain / Oman / Saudi Arabia general goods), 15% VAT (KSA increased rate), 18% GST (India default), 5% GST (India for portable storage where applicable), 0% for export; tax-table maintenance task in Phase 15 retainer
- [ ] T-13.4.04: Implement estimated shipping cost in cart based on detected region; show "Free shipping over $X" thresholds where Marketing approves
- [ ] T-13.4.05: Maintain `tax-table.json` with effective dates and source citations (UAE FTA, India CBIC, KSA ZATCA); quarterly review per BR-16.4 cadence

#### M13.5: Payment Integration — Stripe
- [ ] T-13.5.01: Integrate Stripe Checkout (card, Apple Pay, Google Pay; SAR/AED/INR/BDT/USD currency support per Tech Stack §15.1)
- [ ] T-13.5.02: Implement Stripe webhook handling (signature verification, retry logic, idempotency keys)
- [ ] T-13.5.03: Implement Stripe fraud rules (3DS for suspicious cards, Radar rules active); tune rules quarterly based on observed fraud patterns
- [ ] T-13.5.04: Ensure PCI scope minimized — no card data touches TwinMOS servers; Stripe Elements handles all card input
- [ ] T-13.5.05: Configure Stripe Tax (where available in target markets) or maintain custom tax tables per T-13.4.05; verify tax-invoice format meets UAE FTA / KSA ZATCA / India GSTIN requirements

#### M13.6: Order Management
- [ ] T-13.6.01: Build order confirmation page (order number, summary, next steps)
- [ ] T-13.6.02: Implement order confirmation and receipt emails via Resend (branded templates; tax-invoice format compliant per UAE FTA / KSA ZATCA / India GSTIN requirements)
- [ ] T-13.6.03: Build Strapi admin order management (order list, status filter, detail view, CSV export)
- [ ] T-13.6.04: Implement order idempotency keys to prevent duplicate charges
- [ ] T-13.6.05: Build cancellation flow: customer can cancel within 30 minutes of order placement (before fulfilment) directly from order-detail page; cancellation triggers Stripe refund + inventory release + cancellation email
- [ ] T-13.6.06: Build refund flow: TwinMOS support can issue full or partial refunds via Strapi admin; refund triggers Stripe refund API call with idempotency; refund-confirmation email auto-sent
- [ ] T-13.6.07: Build return-merchandise flow distinct from RMA-warranty flow: customer initiates return within 14-day window; system generates return shipping label (where carrier API available) or provides return address; refund issued upon receipt confirmation

#### M13.7: Customer Accounts
- [ ] T-13.7.01: Implement customer registration and login via Better Auth (extend existing auth from Phase 9 partner portal — separate `customer` role distinct from partner roles)
- [ ] T-13.7.02: Build customer account dashboard (profile, order history, order status tracking, address book, saved payment methods via Stripe Customer Portal, warranty registrations linked from Phase 6 by email)
- [ ] T-13.7.03: Implement password reset flow; account management (update profile, address book, marketing-email preferences)
- [ ] T-13.7.04: Implement terms of sale acceptance during checkout flow
- [ ] T-13.7.05: Implement email verification on registration (Resend confirmation link with 24h expiry); customers cannot place orders before email verified
- [ ] T-13.7.06: Implement GDPR Article 20 data export: customer can request full data export (profile, orders, warranty registrations) as ZIP via account dashboard; auto-emailed within 30 days per BR-LEGAL Privacy Policy
- [ ] T-13.7.07: Implement GDPR Article 17 account deletion: customer can request account deletion from dashboard; PII anonymized in orders (legal/tax retention required for 7 years per UAE/KSA/India tax law); confirmation email sent

#### M13.8: E-Commerce Hardening
- [ ] T-13.8.01: Implement rate limiting on all checkout endpoints
- [ ] T-13.8.02: Implement checkout error handling and rollback logic (payment failure → order rollback → user-friendly message)
- [ ] T-13.8.03: Implement order lifecycle email templates (confirmed, processing, shipped, delivered)
- [ ] T-13.8.04: Capture abandoned cart data for marketing automation (PostHog events)
- [ ] T-13.8.05: Optimize checkout LCP to ≤ 2.0s; no render-blocking resources

#### M13.9: E-Commerce E2E Testing & Launch
- [ ] T-13.9.01: Write Playwright E2E tests: cart→checkout→success, cart→checkout→payment decline, cart→checkout→timeout, promo code apply, customer account creation
- [ ] T-13.9.02: Execute load test on checkout flow (1,000 concurrent checkouts)
- [ ] T-13.9.03: Security audit on e-commerce flow (OWASP ZAP + pen-test on payment endpoints)
- [ ] T-13.9.04: Publish Terms of Sale page; update Privacy Policy for e-commerce data processing
- [ ] T-13.9.05: Soft launch e-commerce in UAE/KSA first; monitor for 2 weeks; expand to IN/BD; public launch

#### M13.10: Phase 13 Gate Review
- [ ] T-13.10.01: Present complete purchase journey: browse → cart → checkout → payment → confirmation → order history
- [ ] T-13.10.02: Verify e-commerce launched in UAE/KSA with Stripe processing real transactions
- [ ] T-13.10.03: Verify all e-commerce security tests pass (rate limiting, fraud rules, PCI scope, webhook verification)
- [ ] T-13.10.04: Sign Phase 13 Gate; proceed to Phase 14

---

### Phase 14: Advanced Analytics & RU/ZH/FR Localization | Weeks 65–79 | Target: 14 Oct 2027 – 27 Jan 2028

**Objective:** PostHog OSS self-hosted for session replay/feature flags/A/B testing; RU/ZH-CN/FR translations imported, native QA complete, launch.

#### M14.1: PostHog OSS — Deployment
- [ ] T-14.1.01: Self-host PostHog OSS on own cloud server; verify event ingestion working
- [ ] T-14.1.02: Implement PostHog SDK in Astro frontend (with privacy masking configured)
- [ ] T-14.1.03: Verify Plausible and PostHog running side-by-side without conflict or duplicate events
- [ ] T-14.1.04: Configure PostHog data retention policy per GDPR requirements

#### M14.2: Session Replay & Feature Flags
- [ ] T-14.2.01: Enable session replay with privacy masking (form inputs, personal data blocked)
- [ ] T-14.2.02: Implement feature flag targeting by locale, user type, URL pattern
- [ ] T-14.2.03: Create A/B test framework: random variant assignment, results dashboard visible
- [ ] T-14.2.04: Configure first A/B test (homepage hero banner variant)

#### M14.3: Advanced Analytics Dashboards
- [ ] T-14.3.01: Build real-time marketing dashboard (traffic, conversions, top pages, filters by locale and date range)
- [ ] T-14.3.02: Build e-commerce funnel dashboard (product view → add to cart → checkout → purchase; drop-off rates per step)
- [ ] T-14.3.03: Build content performance dashboard (top articles, bounce rate by content section, search terms, zero-result queries)
- [ ] T-14.3.04: Implement automated weekly analytics summary email to Marketing team via Resend
- [ ] T-14.3.05: Configure PostHog cohort analysis: high-value cohorts (returning visitors, purchasers, partners, gaming-hub engagers); behavioural cohorts (cart-abandoners, KB-readers-who-purchased)
- [ ] T-14.3.06: Configure PostHog data-warehouse export: nightly Parquet/CSV export to Backblaze B2 cold storage for long-term analysis (>90 days retention)
- [ ] T-14.3.07: Build retention curves and engagement decay charts per persona (use 11-persona register from BRD §7)

#### M14.4: RU/ZH-CN/FR — Translation Import
- [ ] T-14.4.01: Engage translation vendor for RU/ZH-CN/FR; sign contracts; provide glossary + TM
- [ ] T-14.4.02: Receive first draft translations; import RU into Strapi with Cyrillic font support (Noto Sans)
- [ ] T-14.4.03: Import ZH-CN into Strapi with CJK font support (Noto Sans SC); verify character rendering
- [ ] T-14.4.04: Import FR into Strapi; verify accent rendering and locale-specific formatting

#### M14.5: RU/ZH-CN/FR — Astro Routing
- [ ] T-14.5.01: Extend Astro i18n routing to `/ru/`, `/zh-CN/`, `/fr/`
- [ ] T-14.5.02: Update language switcher to include all 7 active locales (EN, AR, BN, HI, RU, ZH-CN, FR)
- [ ] T-14.5.03: Update hreflang tags for all 7 live locales; regenerate sitemaps
- [ ] T-14.5.04: Implement locale fallback chain: requested locale → EN (default)

#### M14.6: RU/ZH-CN/FR — Native Review
- [ ] T-14.6.01: Engage native Russian speaker for content review (Cyrillic accuracy, cultural appropriateness, CIS market relevance)
- [ ] T-14.6.02: Engage native Chinese (Simplified) speaker for content review (CJK accuracy, cultural appropriateness, China/HK/Taiwan market relevance)
- [ ] T-14.6.03: Engage native French speaker for content review (accuracy, cultural appropriateness, EU/Africa market relevance)
- [ ] T-14.6.04: Apply corrections from all native reviews; obtain sign-off from each reviewer

#### M14.7: RU/ZH-CN/FR — Cross-Browser & Mobile QA
- [ ] T-14.7.01: Test RU (Cyrillic) on Chrome, Safari, Firefox, Edge; iOS Safari + Android Chrome
- [ ] T-14.7.02: Test ZH-CN (CJK) on Chrome, Safari, Firefox, Edge, Samsung Internet; iOS Safari + Android Chrome
- [ ] T-14.7.03: Test FR on all browsers and mobile devices
- [ ] T-14.7.04: Run axe-core accessibility scan on all 3 new locales; resolve critical/serious findings

#### M14.8: RU/ZH-CN/FR — Localization Launch
- [ ] T-14.8.01: Final hreflang verification for 7 active locales; submit all sitemaps to Google Search Console
- [ ] T-14.8.02: Verify URL structure: `/ru/products/`, `/zh-CN/products/`, `/fr/products/`
- [ ] T-14.8.03: Announce RU/ZH-CN/FR localization launch via regional channels
- [ ] T-14.8.04: Monitor Google Search Console for indexing and hreflang errors

#### M14.9: Phase 3 Content & Feature QA
- [ ] T-14.9.01: QA all Phase 3 features (e-commerce, PostHog, A/B testing, RU/ZH-CN/FR locales)
- [ ] T-14.9.02: Run full regression test suite (Playwright E2E) against all 7 locales
- [ ] T-14.9.03: Run Lighthouse CI on all new pages; verify performance within budget
- [ ] T-14.9.04: Security audit on e-commerce in all 7 locales

#### M14.10: Phase 14 Gate Review
- [ ] T-14.10.01: Present PostHog session replay + A/B test demo to Marketing team
- [ ] T-14.10.02: Present all 7 locales: EN, AR (RTL), BN, HI, RU, ZH-CN, FR
- [ ] T-14.10.03: Verify all analytics dashboards operational and accurate
- [ ] T-14.10.04: Sign Phase 14 Gate; proceed to Phase 15

---

### Phase 15: Optimization, Loyalty/Referral, ES/PT/DE Launch & Handover | Weeks 80+ | Target: 28 Jan 2028 onwards

**Objective:** Loyalty program, referral program, MDF full activation, ES/PT/DE full localization launch (bringing total to 10 active locales: EN, AR, BN, HI, RU, ZH-CN, FR, ES, PT, DE), knowledge transfer, Phase 4 retainer transition.

#### M15.1: Loyalty Program — Implementation
- [ ] T-15.1.01: Design loyalty program tiers and point-earning rules (purchase, referral, review, social share)
- [ ] T-15.1.02: Implement loyalty points tracking in Strapi; build customer-facing points dashboard
- [ ] T-15.1.03: Implement reward redemption (discount codes, free shipping, exclusive products)
- [ ] T-15.1.04: Legal review of loyalty program terms; publish loyalty program page

#### M15.2: Referral Program — Implementation
- [ ] T-15.2.01: Design referral program mechanics (referrer reward, referee discount, tracking links)
- [ ] T-15.2.02: Implement referral link generation and tracking (unique codes per customer)
- [ ] T-15.2.03: Implement referral dashboard (shares, clicks, conversions, rewards earned)
- [ ] T-15.2.04: Legal review of referral terms; publish referral program page

#### M15.3: MDF Program — Full Activation
- [ ] T-15.3.01: Develop MDF legal framework and finance integration
- [ ] T-15.3.02: Build MDF application workflow in Strapi (submit → review → approve → fund → report)
- [ ] T-15.3.03: Implement MDF fund tracking dashboard for partners and TwinMOS finance
- [ ] T-15.3.04: Publish full MDF program page replacing placeholder

#### M15.4: Reserved Features — Conditional Activation
- [ ] T-15.4.01: Evaluate trigger conditions for 18 reserved content entries (Appendix D′ from BRD): Server/ECC Memory, Enterprise SSD, Rugged SSD, Encrypted SSD, Card Reader, Data Center Solution
- [ ] T-15.4.02: Activate and publish reserved pages where triggers met (per BR Appendix D′)
- [ ] T-15.4.03: Activate overclocking records, ambassador program, RGB software download if programs launched
- [ ] T-15.4.04: Activate Technology Roadmap page if executive approval obtained

#### M15.5: ES/PT/DE — Translation, Native QA & Launch (per Decision 5A — full launch in Phase 15 scope)
- [ ] T-15.5.01: Engage translation vendor for ES/PT/DE; sign contracts with milestone delivery dates
- [ ] T-15.5.02: Prepare translation memory update (all RU/ZH-CN/FR additions since Phase 1/2); deliver glossary of 200+ technical terms
- [ ] T-15.5.03: Configure Strapi i18n locales: es, pt, de; extend all content types with localized fields
- [ ] T-15.5.04: Receive first draft translations; import ES into Strapi; verify accent rendering and locale-specific formatting (€/€/€ currency, DD/MM/YYYY EU date)
- [ ] T-15.5.05: Import PT into Strapi (PT-PT and PT-BR variants — confirm market priority with Marketing); verify accent rendering
- [ ] T-15.5.06: Import DE into Strapi; verify umlaut rendering and German typographic conventions; align with Imprint EU legal page
- [ ] T-15.5.07: Engage native ES/PT/DE speakers for content review (cultural appropriateness, technical accuracy, Spain/LatAm/EU market relevance for ES; Portugal/Brazil for PT; Germany/Austria/Switzerland for DE)
- [ ] T-15.5.08: Apply corrections from native reviews; obtain sign-off
- [ ] T-15.5.09: Cross-browser + mobile QA on all 3 new locales (Chrome, Safari, Firefox, Edge, Samsung Internet; iOS Safari, Android Chrome)
- [ ] T-15.5.10: Update language switcher to include all 10 active locales (EN, AR, BN, HI, RU, ZH-CN, FR, ES, PT, DE); update hreflang tags; regenerate sitemaps; submit to Google Search Console
- [ ] T-15.5.11: Public launch of ES/PT/DE locales; announce via regional channels; monitor Google Search Console for indexing and hreflang errors

#### M15.6: Performance & SEO Optimization (across all live locales — 7 at start of Phase 15, 10 after M15.5 launches ES/PT/DE)
- [ ] T-15.6.01: Conduct comprehensive Core Web Vitals audit across all live locales (start at 7: EN/AR/BN/HI/RU/ZH-CN/FR; expand to 10 after ES/PT/DE launch in M15.5); address any regressions
- [ ] T-15.6.02: Review Google Search Console data for 6 months across all live locales; identify and fix crawl/indexing issues; verify hreflang validation passes for all 10 locales after M15.5 launch
- [ ] T-15.6.03: Implement SEO improvements based on 6-month traffic data (content gaps, keyword opportunities) per locale
- [ ] T-15.6.04: Optimize image delivery (fine-tune ImgProxy settings, review Cloudflare CDN cache hit ratios — target ≥85% cache hit rate for static assets)

#### M15.7: Conversion Rate Optimization (CRO)
- [ ] T-15.7.01: Analyze session replays and heatmaps for top 20 pages; identify UX friction points
- [ ] T-15.7.02: Run A/B tests on key conversion pages (homepage hero, PDP CTA, checkout flow)
- [ ] T-15.7.03: Implement winning variants from A/B tests
- [ ] T-15.7.04: Document CRO playbook for ongoing optimization

#### M15.8: Security & Compliance Refresh
- [ ] T-15.8.01: Conduct quarterly penetration test on full website (all live locales — 7 initially, 10 after M15.5 ES/PT/DE launch — including e-commerce, partner portal, SN-Check, RMA, customer accounts)
- [ ] T-15.8.02: Refresh dependency vulnerability scans (Snyk/Dependabot); update all high/critical CVEs
- [ ] T-15.8.03: Review and update legal pages (Privacy Policy, Terms, Cookie Policy) for regulatory changes
- [ ] T-15.8.04: Verify compliance certifications still current per BR-16.4 quarterly check

#### M15.9: Knowledge Transfer & Documentation Finalization
- [ ] T-15.9.01: Conduct comprehensive handover workshops with TwinMOS IT team (infrastructure, deployment, monitoring, incident response, DR drill walkthrough)
- [ ] T-15.9.02: Deliver final documentation package: architecture overview, ADR registry (8 ADRs signed: ADR-001 through ADR-008), API reference (OpenAPI spec for `/api/v1/...`), runbooks (deployment, ops, DR), training materials (CMS user guide, agent quick-reference for Chatwoot, partner-portal admin guide)
- [ ] T-15.9.03: Conduct CMS advanced training (workflow automation, bulk operations, analytics interpretation, translation pipeline operation)
- [ ] T-15.9.04: Transfer all repository ownership and SaaS account administration to TwinMOS IT (GitHub orgs, Cloudflare account, Stripe account, HubSpot account, MeiliSearch Cloud if used, Resend account, Sentry org, UptimeRobot account, Plausible account, PostHog instance admin)
- [ ] T-15.9.05: Sunset/decommission any vendor accounts no longer needed post-handover (e.g., translation-vendor accounts retired after final ES/PT/DE delivery; MDF-only intermediaries); document the closure list in handover package
- [ ] T-15.9.06: Deliver final security review document covering: secret-rotation schedules, dependency-update cadence, pen-test history, incident-response contacts, security disclosure email and PGP key publication

#### M15.10: Phase 15 Gate — Project Closeout & Phase 4 Retainer
- [ ] T-15.10.01: Verify all Phase 1–3 deliverables accepted; all milestones signed off
- [ ] T-15.10.02: Final budget reconciliation; all payment milestones verified
- [ ] T-15.10.03: Stakeholder satisfaction survey; final project retrospective
- [ ] T-15.10.04: Sign Phase 4 retainer agreement (ES/PT/DE localization, ongoing CRO/SEO, maintenance, security updates)
- [ ] T-15.10.05: Project closeout approved by Project Sponsor (Chairman); archive all project documentation

---

## Appendix A: Quality Gate Traceability

| Quality Gate | Phase | Milestone | Threshold / Verification |
|-------------|-------|-----------|--------------------------|
| Lighthouse Performance ≥90 | Phase 7 | M7.1 | Lighthouse CI per-PR enforcement on all core pages (homepage, 5 PDPs, 5 content pages, forms, KB, finder, locator) |
| Lighthouse Accessibility ≥95 | Phase 7 | M7.1, M7.2 | Lighthouse CI + axe-core in CI + manual NVDA/VoiceOver test on top 20 user journeys |
| Lighthouse Best Practices ≥95 | Phase 7 | M7.1 | Lighthouse CI per-PR enforcement |
| Lighthouse SEO ≥95 | Phase 7 | M7.1 | Lighthouse CI per-PR enforcement |
| WCAG 2.2 AA Full Compliance | Phase 7 | M7.2 | Automated axe-core + manual audit covering new 2.2 criteria (focus visibility, target size 24×24px, accessible authentication) |
| Color-Blindness Verification | Phase 7 | M7.2.06 | NoCoffee or axe DevTools simulation; no color-only information |
| Core Web Vitals (LCP ≤ 2.0s, INP ≤ 200ms, CLS ≤ 0.1, TTFB ≤ 200ms) | Phase 7 | M7.1.04 | CrUX dashboard + production-like environment verification |
| OWASP ZAP Zero High/Critical | Phase 7 | M7.3 | Weekly ZAP scan + pre-launch pen-test |
| Security Headers (CSP / HSTS / X-Frame-Options / X-Content-Type-Options / Referrer-Policy) | Phase 7 | M7.3.02 | Mozilla Observatory / securityheaders.com check |
| Cross-Browser QA | Phase 7 | M7.4 | Chrome, Safari, Firefox, Edge (latest 2), Samsung Internet — 50 critical pages each |
| Cross-Device QA | Phase 7 | M7.4 | iPhone 14/15 (iOS Safari), Samsung Galaxy (Android Chrome), iPad (Safari), Android Tablet (Chrome) |
| Load Test 500 / Stress Test 5,000 / Spike Test 10,000 | Phase 7 | M7.5 | k6 scripts; sustained throughput + breaking-point characterization |
| E2E Tests (≥10 critical journeys) | Phase 7 | M7.6 | Playwright scenarios in CI against staging |
| Content QA (287 + 100+ pages) | Phase 7 | M7.7 | Screaming Frog + manual Content QA Checklist per page |
| Third-Party Pen-Test (clean report, no critical/high open) | Phase 7 | M7.8 | External vendor engagement; remediation re-test |
| UAT Complete (Alpha + Beta + Stakeholder) | Phase 7 | M7.9 | 3-round UAT with sign-off from Tech Lead, Marketing Director, Sales Director, Chairman |
| Cookie Compliance Audit | Phase 7 | M7.10.04 | EU/UK banner triggers, granular consent, cookies blocked until consent, 12-month re-prompt |
| DR Drill Passed (DB / CMS / full site) | Phase 8 | M8.7 | DB restore RTO < 1h, CMS restore RTO < 2h, full site rebuild RTO < 4h, RPO < 15 min |
| Quarterly Pen-Test | Phase 15 | M15.8.01 | All live locales, e-commerce, partner portal, RMA, customer accounts |
| Quarterly Compliance Re-Verification | Phase 15+ | M15.8.04 (BR-16.4) | All certifications still current; updated certificates in CMS |

## Appendix B: Content Scope Coverage (corrected)

This appendix reconciles the 287 unique content entries (Content Map v1.1) with the 454 markdown files on disk (sum of unique entries + SKU detail files + locale variant stubs + templates).

| # | Section Folder | Unique Entries | Phases | Key Milestones |
|---|----------------|---------------:|--------|----------------|
| 1 | `00-site-wide/` Site-Wide Components | 15 | P2 | M2.8, M3.1 |
| 2 | `01-homepage/` Homepage | 9 | P3 | M3.1 |
| 3 | `02-about/` About / Company | 17 | P3 | M3.2 |
| 4 | `03-products/` Products (catalog architecture; 100+ SKU detail pages tracked separately) | n/a (architecture) | P4, P5 | M4.3, M4.4, M5.1–M5.4 |
| 5 | `04-solutions/` Solutions / Vertical Use Cases | 11 | P3 | M3.5 |
| 6 | `05-gaming/` Gaming Hub (VOLTX) | 14 | P3, P12 | M3.3, M12.3, M12.4 |
| 7 | `06-technology/` Technology / R&D | 14 | P3 | M3.4 |
| 8 | `07-support/` Support (39 hub pages + 30 KB articles = 69 total) | 69 | P4, P6, P11 | M4.6, M6.7, M6.8, M11.5, M11.6 |
| 9 | `08-learn/` Learn / Knowledge Hub (largest) | 64 | P3 | M3.6 |
| 10 | `09-how-to-buy/` Where-to-Buy & Partners (7 where-to-buy + 21 partners = 28 total in Content Map §10) | 28 | P4, P9, P10 | M4.7, M5.5, M9.4–M9.7, M10.1–M10.2 |
| 11 | `10-news-events/` News, Press & Events | 19 | P4 | M4.1 |
| 12 | `11-regional/` Regional Landings (English baseline; 9 locale stubs in `_locales/` activated incrementally Phase 9–15) | 28 | P4, P12, P14, P15 | M4.2, M12.8, M14.8, M15.5 |
| 13 | `12-careers/` Careers | 10 | P3 | M3.8 |
| 14 | `13-contact/` Contact | 16 | P3 | M3.9 |
| 15 | `14-legal/` Legal, Compliance & Trust (33 sub-pages + 1 hub = 34 total) | 34 | P4 | M4.5 |
| 16 | `15-marketing/` Marketing Programs & Campaigns | 12 | P3, P12, P15 | M3.7, M12.7, M15.1, M15.2 |
| **Subtotal — Unique Content Entries** | | **360** | | (some entries overlap section boundaries; 287 is the canonical de-duplicated count per Content Map §0) |
| **+ SKU Detail Pages** | `_master-sku-reference.md` driven | 100+ | P4, P5 | M4.4, M5.7 |
| **+ Locale Stubs** | `_locales/{ar,bn,de,es,fr,hi,pt,ru,zh-CN}/` | 9 locale folders × ~varies | P9, P12, P14, P15 | M9.x, M12.8, M14.x, M15.5 |
| **+ Templates** | hub / detail / form / locator / article templates | ~7 | P2 | M2.7 |
| **Total Markdown Files on Disk** | | **454** | | mapped via T-2.3.02 |

> **Note on the 287 figure:** Content Map §0 declares "287 distinct content entries." Sum of unique entries above is 360 because some entries overlap (e.g., a Whitepaper page may live both under `06-technology/` and be cross-referenced in `08-learn/`; some Support hub pages are also Compliance pages). The canonical de-duplicated count is 287; the on-disk file count is 454. The Roadmap uses both numbers as appropriate to context.

## Appendix C: Sprint Cross-Reference (4-Week Sprint Cadence)

This Roadmap standardizes on **4-week sprints** (one sprint per Roadmap phase for Phases 1–12; longer phases broken into sequential 4-week sprints). Each Phase Gate Review marks sprint closure. Sprint numbering is contiguous P1-S1 through P3-S20.

| Roadmap Phase | Phase Duration | Sprint Mapping | Key Documents / Outputs |
|---------------|---------------:|----------------|-------------------------|
| Phase 1 | 4 weeks | P1-S1 (Weeks 1–4) | ADR-001 through ADR-008 (8 ADRs); Linux workstation operational; SaaS provisioned; local stack live |
| Phase 2 | 4 weeks | P1-S2 (Weeks 5–8) | Strapi collections modeled; Astro Content Collections; design system in Figma signed off |
| Phase 3 | 4 weeks | P1-S3 (Weeks 9–12) | Core Content Production Part 1 — Homepage, About, Gaming, Tech, Solutions, Learn, Marketing, Careers, Contact (~150 pages) |
| Phase 4 | 4 weeks | P1-S4 (Weeks 13–16) | Core Content Production Part 2 — News, Regional, Brand, SKU, Legal, Compliance, Search, redirects, robots.txt |
| Phase 5 | 4 weeks | P1-S5 (Weeks 17–20) | Application Surfaces Part 1 — Catalog dual-axis, filtering, comparison, where-to-buy locator |
| Phase 6 | 4 weeks | P1-S6 (Weeks 21–24) | Application Surfaces Part 2 — 15 form types, warranty registration, RMA capture, compatibility finder MVP, KB, FAQ |
| Phase 7 | 4 weeks | P1-S7 (Weeks 25–28) | Quality Gates — Lighthouse, WCAG 2.2 AA, OWASP ZAP, pen-test, UAT, cookie audit, smoke rehearsal |
| Phase 8 | 4 weeks | P1-S8 (Weeks 29–32) | Phase 1 Public Launch + Hypercare; CMS training; DR drill; Phase 1 Complete milestone |
| Phase 9 | 4 weeks | P2-S9 (Weeks 33–36) | AR/BN/HI translation foundation; Better Auth + Partner Portal authentication |
| Phase 10 | 4 weeks | P2-S10 (Weeks 37–40) | Partner asset library full; price lists; SN-Check live; counterfeit reporting; MDF pre-claim |
| Phase 11 | 4 weeks | P2-S11 (Weeks 41–44) | RMA full 7-state workflow; Compatibility Finder 500+; ERP product + pricing sync; Firmware Download Center |
| Phase 12 | 4 weeks | P2-S12 (Weeks 45–48) | Chatwoot live chat; Gaming Hub interactives (RGB visualizer + build gallery); HubSpot CRM; AR/BN/HI launch + Phase 2 Complete |
| Phase 13 | 16 weeks | P3-S13 to P3-S16 (Weeks 49–64) | ADR-007 e-commerce decision; Node.js 24 LTS migration (ADR-008); cart → checkout → payment → orders → customer accounts → refund/cancel/return → e-commerce launch UAE/KSA/IN/BD |
| Phase 14 | 15 weeks | P3-S17 to P3-S20 (Weeks 65–79; final S20 only 3 weeks) | PostHog OSS deployment; session replay + feature flags + A/B tests; advanced analytics dashboards; RU/ZH-CN/FR translation, native review, launch |
| Phase 15 | open-ended | P3-S21+ (Weeks 80+) | Loyalty + Referral programs; MDF full activation; ES/PT/DE translation, native review, launch (10 active locales total); CRO; quarterly pen-test; knowledge transfer; Phase 4 retainer signed |

## Appendix D: Risk Register (Reconciled with BRD §29)

This register is the **canonical Risk Register v1.0** referenced by the Roadmap header sync clause. It is fully reconciled with BRD §29 (which mirrors these IDs and content as of v3.2 patches). Strategy v4.0's Appendix B previously listed RISK-1..18 — those that are project-execution risks have been merged here as R-01 through R-10; remaining Strategy items will be re-keyed as R-11..R-18 in `TwinMOS_Website_Risk_Register_Consolidated.md` v1.0 (Decision 8, pending).

| ID | Risk | Probability | Impact | Primary Phases | Mitigation Strategy | Owner |
|----|------|-------------|--------|----------------|---------------------|-------|
| R-01 | Solo-developer capacity constraint (single resource × 18–24 months for full Phases 1–3+15 scope) | High | High | Phases 1–14 | Scope-trim list maintained; AI-assisted dev (Copilot/Claude); markdown reuse; bi-weekly demos with 24h decision turnaround; phased go-live to de-risk | Project Manager / Solo Developer |
| R-02 | Solo-developer absence ≥ 2 weeks (illness, leave) — critical solo-dev risk | Medium | High | All Phases | Solo-dev contingency plan (M1.8.03); daily commits to both repos; detailed ADRs (8 signed); documented handover package; identified TwinMOS escalation contact | Project Manager |
| R-03 | Content authoring lags developer pace (esp. Learn Hub 64 articles in M3.6) | High | High | Phases 2–4 | Begin content creation in parallel with development; engage copywriter; reuse existing accurate content; placeholder-then-replace pattern; flag overflow into Phase 4 P1 cleanup queue | Marketing Director |
| R-04 | Compatibility database incomplete at launch | Medium | High | Phases 6, 11 | Launch MVP with top 100 devices in Phase 6; expand to 500+ in Phase 11; crowdsourced/community submission; quarterly QVL refresh | Product Manager |
| R-05 | Performance targets not met (Lighthouse < 90, Core Web Vitals miss) | Medium | High | Phase 7 | Performance budgets in CI/CD; regular Lighthouse audits; Cloudflare CDN edge caching; ImgProxy image optimization; Astro static-first architecture | Tech Lead / Solo Developer |
| R-06 | SEO rankings drop during migration | Low | High | Phase 8 | 301 redirects for all existing URLs (T-4.9.06); maintain old URLs during transition; Search Console monitoring; canonical URLs verified | SEO Specialist / Marketing |
| R-07 | Security breach post-launch | Low | Critical | Phase 8+ | Penetration testing; Cloudflare WAF + OWASP rule sets; regular Snyk/Dependabot updates; Sentry monitoring; incident response plan; security@twinmos.com disclosure | Security Lead |
| R-08 | Translation vendor late or poor quality | Medium | Medium | Phases 9, 12, 14, 15 | Staged delivery with milestone payments; secondary vendor on standby; EN fallback (locale chain); native-speaker review gate before publication; CAT tool standardization (T-9.1.05) | Marketing + Procurement |
| R-09 | Third-party service outages (Cloudflare, Stripe, Resend, MeiliSearch Cloud, HubSpot, Chatwoot SaaS where applicable) | Medium | Medium | All Phases | SLA monitoring via UptimeRobot; fallback strategies (Cloudflare graceful degradation, Resend → SES backup, MeiliSearch local fallback); vendor redundancy where critical | DevOps / Solo Developer |
| R-10 | Accessibility compliance gaps (WCAG 2.2 AA + EU Accessibility Act since 28 June 2025) | Medium | Medium | Phase 7+ | Automated a11y testing in CI (axe-core); manual audits with NVDA/VoiceOver every sprint; EU Accessibility Act compliance for EU regional pages; 9 new WCAG 2.2 criteria addressed in M7.2.06–M7.2.08 | QA Lead |

> **Risk Register reconciliation note:** v3.0 of this Roadmap aligns R-04 through R-10 with BRD §29 (which previously had different content). The full reconciled register is the source of truth; BRD §29 mirrors. Strategy-specific risks (vendor/budget/scope from Strategy v4.0 App B) will become R-11..R-18 in the consolidated standalone document `TwinMOS_Website_Risk_Register_Consolidated.md` once Decision 8 is confirmed.

## Appendix E: Decision Log

This log captures sponsor decisions that bind the Roadmap. New decisions append below; never overwrite history.

| Decision ID | Date | Decision | Choice | Rationale / Cascade |
|-------------|------|----------|--------|---------------------|
| D-1 (Decision 1) | 2 May 2026 | Team model | **A — Solo full-stack developer × 18–24 months** | Roadmap canonical; supersedes RFP vendor-procurement model; SOW v4.0 issued; Strategy v4.0 re-keyed; BRD §29 R-01/R-02 reframed |
| D-2 (Decision 2) | 2 May 2026 | Hosting origin | **B — TwinMOS own cloud server origin + Cloudflare DNS/WAF/CDN edge front** | Decision 2B; ADR-001 captures; M1.2.04 added; Tech Stack v1.2 hosting model rewritten |
| D-3 (Decision 3) | 2 May 2026 | Repo topology | **A — Two-repo (twinmos-website-frontend + twinmos-website-backend)** | Roadmap T-1.1.02 retained; Strategy v4.0 confirms Option 1A |
| D-4 (Decision 4) | 2 May 2026 | Phase 1 binding launch date | **A — Feb–Mar 2027 (Roadmap Phase 8 Weeks 29–32)** | BRD §6.1 Phase 1 timeline updated to Months 1–8; URD §1.2 phasing rewritten; SOW §2.1 confirms |
| D-5 (Decision 5) | 2 May 2026 | ES/PT/DE locale commitment | **A — Phase 15 commits ES/PT/DE full launch in-scope (10 active locales total)** | Roadmap M15.5 expanded 4 → 11 tasks; Phase 15 header + Phase Map row updated; URD §1.2 + Content Map locale enum updated |
| D-6 (Decision 6) | 2 May 2026 | WCAG version target | **A — Upgrade to WCAG 2.2 AA across all docs** | All 5+ source docs replace_all'd "2.1 AA" → "2.2 AA"; M7.2.06–M7.2.08 added for new criteria |
| D-7 (Decision 7) | 2 May 2026 | Node.js LTS migration | **A — ADR-008 Node.js 24 LTS migration in Phase 13** | T-1.1.08 (ADR sign), T-13.1.05 (execute migration); avoids Node 22 EOL on 30 April 2027 |
| D-8 (Decision 8) | (pending) | Standalone Risk Register / Milestone Schedule / QA Strategy | (pending) | Currently embedded in Roadmap (Risk Register App D, Milestone Schedule §§1–15, QA Strategy Phase 7); standalone documents requested by Inventory v3.0 §A.2 |
| ADR-001 | 2 May 2026 | Stack Decision | Strapi v5 + Astro 5 + PostgreSQL 16 + MeiliSearch + TwinMOS own cloud server origin + Cloudflare edge | Locked at Phase 1 kickoff; deviates from RFP §6.1 vendor-menu approach |
| ADR-002 | 2 May 2026 | Repo Architecture | Two-repo (frontend + backend) | Per Decision 3A |
| ADR-003 | 2 May 2026 | Build Pipeline | Local Vite build + cloud-server deploy | Aligns with solo-dev model and own-cloud-server origin |
| ADR-004 | 2 May 2026 | Frontend Islands UI Framework | React 19 | Stable as of 2026; aligns with Astro islands model |
| ADR-005 | 2 May 2026 | CRM | HubSpot | Phase 12 integration; ADR-005 supersedes Tech Stack v1.1's "alternates pending" stance |
| ADR-006 | 2 May 2026 | Cookie Consent Manager | Custom-built (not OneTrust/Cookiebot) | Avoids vendor lock-in and recurring cost; granular consent UI per BR-22.1 |
| ADR-007 | (Phase 13) | E-Commerce Stack | Medusa.js v2 vs Stripe Checkout-only — TBD at M13.1 evaluation | Decision deferred to Phase 13; ADR stub signed at Phase 1 |
| ADR-008 | 2 May 2026 | Node.js LTS Migration Path | Start on Node.js 22 LTS; migrate to Node.js 24 LTS in Phase 13 | Per Decision 7A; avoids Node 22 EOL during project |

## Appendix F: Glossary & Acronyms

| Term | Definition |
|------|-----------|
| ADR | Architecture Decision Record — single-page document capturing one architecture decision, its context, and consequences |
| BRD | Business Requirements Document — see [TwinMOS_Website_BRD.md](TwinMOS_Website_BRD.md) |
| BR-* | Business Rule identifier from BRD (e.g., BR-1.1, BR-7.1, BR-GLOBAL-8) |
| CAT tool | Computer-Assisted Translation tool (memoQ, Trados, Smartcat, Crowdin) |
| CMS | Content Management System (Strapi v5 in this project) |
| CrUX | Chrome User Experience Report — Google's source of real-user Core Web Vitals data |
| CSP | Content Security Policy — HTTP header restricting resource loading |
| EAC | Eurasian Conformity mark (Russia/CIS) |
| EAN | European Article Number (product barcode) |
| EOL | End of Life — version no longer receives updates |
| EPEAT | Electronic Product Environmental Assessment Tool (sustainability registry) |
| ERP | Enterprise Resource Planning (TwinMOS internal ERP) |
| EXPO | AMD's Extended Profiles for Overclocking (DDR5 RAM) |
| FCC | Federal Communications Commission (USA radio compliance) |
| GDPR | General Data Protection Regulation (EU) |
| HMB | Host Memory Buffer (DRAM-less SSD technique) |
| HSTS | HTTP Strict Transport Security |
| HubSpot | Marketing/CRM platform (locked per ADR-005) |
| IA | Information Architecture |
| INP | Interaction to Next Paint — Core Web Vital replacing FID |
| ISO 9001:2015 | Quality management system standard |
| JEDEC | Joint Electron Device Engineering Council (memory standards body) |
| KPI | Key Performance Indicator |
| LCP | Largest Contentful Paint — Core Web Vital |
| MDF | Marketing Development Funds (channel-program co-marketing budget) |
| MTBF | Mean Time Between Failures |
| NDA | Non-Disclosure Agreement |
| NVMe | Non-Volatile Memory Express (SSD protocol) |
| OWASP | Open Worldwide Application Security Project |
| PCI | Payment Card Industry (compliance scope) |
| PDP | Product Detail Page |
| PDPL | Personal Data Protection Law (UAE Federal Decree-Law No. 45 of 2021; KSA also has PDPL) |
| PMIC | Power Management Integrated Circuit (DDR5 voltage regulation on-DIMM) |
| QVL | Qualified Vendor List (motherboard manufacturer's tested-RAM compatibility list) |
| RBAC | Role-Based Access Control |
| RFP | Request for Proposal — see TwinMOS_Website_RFP.md (superseded by SOW v4.0 per Decision 1A) |
| RFP-FR-* | RFP Functional Requirement identifier (RFP-FR-1 through RFP-FR-18) |
| RGB | Red-Green-Blue (LED-controlled lighting on memory/PC components) |
| RMA | Return Merchandise Authorization |
| RPO | Recovery Point Objective — max acceptable data loss (time) |
| RTL | Right-to-Left text direction (Arabic) |
| RTO | Recovery Time Objective — max acceptable downtime to recover |
| SKU | Stock Keeping Unit (product part number) |
| SLA | Service Level Agreement |
| SN-Check | Serial Number Check — anti-counterfeit lookup |
| SOW | Statement of Work — see TwinMOS_Website_SOW_v4.md (supersedes RFP for procurement) |
| TBT | Total Blocking Time |
| TCO | Total Cost of Ownership |
| TLC | Triple-Level Cell (NAND flash type) |
| TM | Translation Memory |
| TOTP | Time-based One-Time Password (MFA mechanism) |
| TTFB | Time to First Byte |
| UAT | User Acceptance Testing |
| UC-* | Use Case identifier from URD (UC-1 through UC-50) |
| UDIMM | Unbuffered DIMM (desktop memory form factor) |
| UKCA | UK Conformity Assessed mark |
| URD | User Requirements Document — see TwinMOS_Website_URD.md |
| UR-* | User Requirement identifier from URD |
| VID | Vendor ID (USB-IF assigned identifier; TwinMOS = 4719) |
| WCAG 2.2 AA | Web Content Accessibility Guidelines version 2.2 Level AA (W3C standard since Oct 2023; ISO/IEC 40500:2025) |
| WEEE | Waste Electrical and Electronic Equipment (EU directive) |
| XLIFF | XML Localization Interchange File Format |
| XMP | Extreme Memory Profile (Intel) — RAM overclocking profile |

## Appendix G: Cross-Reference Index

### G.1 Business Rules (BR-*) cited in this Roadmap → BRD location

| BR | Cited at Roadmap Task(s) | BRD Location |
|----|--------------------------|--------------|
| BR-1.1 SKU uniqueness | T-4.9.04, T-5.7.02 | BRD §8.5 line 547 |
| BR-1.2 spec completeness | T-5.7.02 | BRD §8.5 line 548 |
| BR-2.2 "Not Verified" reassurance | T-6.6.05 | BRD §9.4 line 635 |
| BR-2.4 compatibility search < 2s | T-6.6.06, T-11.2.05 | BRD §9.4 line 637 |
| BR-3.3 Supertron India activation | T-5.5.05 | BRD §10.4 line 717 |
| BR-4.1 5-min auto-reply | T-6.1.04 | BRD §11.4 line 804 |
| BR-4.4 distributor 48h SLA | T-6.2.03 | BRD §11.4 line 807 |
| BR-5.4 press release boilerplate | T-4.1.02 | BRD §12.4 line 891 |
| BR-5.5 awards verification | T-3.2.03, T-3.4.04 (patents extension) | BRD §12.4 line 892 |
| BR-6.1 warranty per product line | T-4.5.02 | BRD §13.4 line 959 |
| BR-6.3 firmware SN validation | T-11.5.02 | BRD §13.4 line 961 |
| BR-6.4 KB quarterly review | T-11.6.02 | BRD §13.4 line 962 |
| BR-6.5 warranty CMS-driven | T-4.9.04 | BRD §13.4 line 963 |
| BR-7.1 partner portal invitation-only | T-9.4.02, T-9.4.04, T-9.5.04 | BRD §14.4 line 1018 |
| BR-7.2 PDF watermark | T-9.7.04, T-10.2.03 | BRD §14.4 line 1019 |
| BR-13.3 benchmark methodology disclosure | T-3.6.04 | BRD §13.3 line 1352 |
| BR-14.2 employee-testimonial signed release | T-3.8.02 | BRD §14.3 line 1410 |
| BR-15.1 promotions auto-archive | (no Roadmap citation; was incorrectly cited at T-12.7.02 — corrected to BR-15.4 per F-RM-008) | BRD §15.3 line 1472 |
| BR-15.2 24h exit-intent dismissal | T-3.7.04, T-12.7.03 | BRD §15.3 line 1473 |
| BR-15.4 (NEW in BRD v3.3) cross-sell banner CMS rules | T-12.7.02 | BRD §15.3 (pending v3.3) |
| BR-16.1 last-updated date | T-4.5.05 | BRD §16.3 line 1549 |
| BR-16.4 quarterly compliance re-verification | T-15.8.04, T-13.4.05 (tax tables) | BRD §16.3 line 1552 |
| BR-17.1 SN-Check rate limit 100/hr/IP | T-10.3.04 | BRD §17.3 line 1604 |
| BR-17.2 counterfeit report 5-day SLA | T-10.5.03 | BRD §17.3 line 1605 |
| BR-17.3 counterfeit policy paired | T-10.5.04 | BRD §17.3 line 1606 |
| BR-22.1 cookie banner granular consent | T-2.8.03, T-7.10.04, ADR-006 | BRD §22.1 |
| BR-GLOBAL-6 external links new tab | T-4.9.05 | BRD §18.1 line 1687 |
| BR-GLOBAL-8 "New" badge 90 days | T-4.4.04 | BRD §18.1 line 1689 |
| BR-GLOBAL-9 "Coming Soon" status | T-4.4.04 | BRD §18.1 line 1690 |
| BR-GLOBAL-10 unsubscribe link | T-6.5.04 | BRD §18.1 line 1691 |

### G.2 RFP Feature IDs (RFP-FR-*) cited in this Roadmap → RFP location

| RFP-FR | Cited at Roadmap Task(s) | RFP Location |
|--------|--------------------------|--------------|
| RFP-FR-8.1.3 Quick View Modal | T-5.3.05 | RFP §8.1 |
| RFP-FR-8.1.6 Datasheet PDF generation | T-5.3.03 | RFP §8.1 |
| RFP-FR-12.1 IP-geolocation regional landing | T-1.2.04, T-4.2.01, T-5.5.02 | RFP §8.12 |
| (additional RFP-FR-9 through RFP-FR-18 ranges) | (covered structurally by Roadmap phases — see Appendix C 15-phase mapping) | RFP §8.9–§8.18 |

### G.3 Use Cases (UC-*) covered by Roadmap milestones → URD location

| UC | Roadmap Coverage | URD Location |
|----|-------------------|--------------|
| UC-1..UC-15 (Phase 1 user journeys) | M3.x, M4.x, M5.x, M6.x | URD §18 |
| UC-16..UC-32 (Phase 2 user journeys) | M9.x–M12.x | URD §18 |
| UC-33..UC-50 (v3.0 additions: Solutions / Tech / Learn / Careers / Marketing / Compliance / Anti-Counterfeit / Channel Programs / Press) | M3.4, M3.5, M3.6, M3.7, M3.8, M4.5, M10.3–M10.5, M4.7, M3.2 | URD §18 |

### G.4 ADRs (ADR-*) status

See Appendix E Decision Log rows ADR-001 through ADR-008.

## Appendix H: Performance & Quality Budgets

These budgets are enforced via Lighthouse CI (Phase 7 M7.1) and reviewed quarterly post-launch (Phase 15 M15.6).

### H.1 Page-Type Performance Budgets

| Page Type | LCP | INP | CLS | TTFB | Total Page Weight |
|-----------|----:|----:|----:|-----:|------------------:|
| Homepage | ≤ 2.0 s | ≤ 200 ms | ≤ 0.1 | ≤ 200 ms | ≤ 1.5 MB |
| Product Listing (PLP) | ≤ 2.0 s | ≤ 200 ms | ≤ 0.1 | ≤ 200 ms | ≤ 1.8 MB |
| Product Detail (PDP) | ≤ 2.0 s | ≤ 200 ms | ≤ 0.1 | ≤ 200 ms | ≤ 2.0 MB |
| Article (KB / Buying Guide / Blog) | ≤ 1.8 s | ≤ 150 ms | ≤ 0.05 | ≤ 200 ms | ≤ 1.0 MB |
| Form pages | ≤ 2.0 s | ≤ 200 ms | ≤ 0.05 | ≤ 200 ms | ≤ 800 KB |
| Locator (where-to-buy with map) | ≤ 2.5 s (map heavy) | ≤ 200 ms | ≤ 0.1 | ≤ 200 ms | ≤ 2.5 MB (Leaflet bundle + tiles) |
| Checkout (Phase 13) | ≤ 2.0 s | ≤ 200 ms | ≤ 0.05 | ≤ 200 ms | ≤ 1.5 MB |

### H.2 Asset & Bundle Budgets

| Asset Type | Budget |
|------------|--------|
| Hero image (above fold) | ≤ 200 KB (WebP/AVIF) |
| Product gallery image | ≤ 100 KB each (WebP/AVIF) |
| JavaScript bundle (initial) | ≤ 150 KB gzip |
| JavaScript bundle (route-loaded React island) | ≤ 50 KB gzip per island |
| CSS bundle (critical) | ≤ 30 KB gzip inline |
| Web fonts (subsetted) | ≤ 80 KB total per locale |

### H.3 Backend Performance Budgets

| Operation | Budget |
|-----------|--------|
| API response (read, p95) | ≤ 200 ms |
| API response (write, p95) | ≤ 500 ms |
| MeiliSearch query (auto-suggest) | ≤ 100 ms |
| MeiliSearch query (faceted filter) | ≤ 300 ms |
| Compatibility finder result | ≤ 2 s (BR-2.4) |
| SN-Check lookup | ≤ 500 ms (rate-limited 100/hr/IP per BR-17.1) |
| Stripe checkout redirect | ≤ 1 s |
| Database query (single-row, p95) | ≤ 50 ms |
| Database query (catalog listing, p95) | ≤ 200 ms |

### H.4 CDN & Cache Targets

| Metric | Target |
|--------|-------:|
| Cloudflare CDN cache hit rate (static assets) | ≥ 85% |
| Cloudflare CDN cache hit rate (HTML / Astro static) | ≥ 70% |
| Origin offload reduction (vs no-CDN baseline) | ≥ 80% |

### H.5 API Rate Limits (per Phase 7 M7.3.05)

| Endpoint Category | Public (req/min/IP) | Authenticated (req/min/user) |
|-------------------|--------------------:|------------------------------:|
| Read-only API (`/api/v1/products`, `/api/v1/news`, etc.) | 100 | 1000 |
| Form submission | 10 | 100 |
| SN-Check lookup | 100/hour (BR-17.1) | n/a |
| Search query | 60 | 600 |
| Auth login attempts | 10/hour per IP after 5 failures | n/a |

## Appendix I: Sign-Off Block

This Roadmap is the authoritative execution plan for the TwinMOS corporate website project. By signing below, each role acknowledges that they have read, understood, and committed to support the 15-phase execution schedule, the milestone-by-milestone deliverables, the quality gates in Appendix A, the performance budgets in Appendix H, and the risk register in Appendix D.

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | _______________ | _________ |
| Operational Sponsor (GM Dubai) | Robiul Islam | _______________ | _________ |
| Marketing Director | (TBC) | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Solo Full-Stack Developer | (TBC) | _______________ | _________ |
| Legal/Compliance | (TBC) | _______________ | _________ |
| Product Manager | (TBC) | _______________ | _________ |
| Sales Director | (TBC) | _______________ | _________ |

---

*This Roadmap is a living document. All changes must be logged in the Document Control table above. For questions or clarifications, contact the TwinMOS PM. The Roadmap is now considered the **authoritative single source of truth** for project execution; sibling documents (BRD, URD, SOW, Tech Stack, Strategy, Content Map, Inventory) reference this Roadmap for phase boundaries, milestone IDs, and task IDs.*

**Document Version:** 3.0 | **Last Updated:** 2 May 2026 (self-audit forensic pass — closes 52 internal findings) | **Total Tasks:** 689 across 150 milestones | **Total Phases:** 15 sequential | **Synchronized With:** BRD v3.0 (v3.2 patches applied), URD v3.1, SOW v4.0, Tech Stack v1.2, Implementation Strategy v4.0, Content Map v1.1, Project Documentation Inventory v3.0, Forensic Alignment Audit v3.0, Alignment Changelog v2.2, Risk Register Consolidated v1.0 (pending Decision 8 — currently embedded in Appendix D), Milestone Schedule v1.0 (embedded §§Phase 1–15), QA Strategy v1.0 (embedded Phase 7 + Tech Stack §21), Company Profile v2.0, `_master-sku-reference.md`