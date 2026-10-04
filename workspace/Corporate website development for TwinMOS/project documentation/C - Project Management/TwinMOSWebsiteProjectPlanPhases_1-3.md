# TwinMOS Corporate Website Redevelopment — Project Plan (Phases 1–3)

**Document Reference:** TWN-PM-PLAN-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Prepared by:** TwinMOS Digital Transformation Team  
**Audience:** Project Sponsor, Operational Sponsor, TwinMOS PM, Unisoft Engineering Team

---

## 1. Plan Overview

This document provides the detailed project plan for the TwinMOS corporate website redevelopment across three phases:
- **Phase 1:** Core Website (Months 1–5, ~20 weeks)
- **Phase 2:** Localization & Partner Enablement (Months 6–9, ~16 weeks)
- **Phase 3:** Commerce & Advanced Features (Months 10–15, ~24 weeks)

Total engagement: **15 months** | Team: **2 developers** | Total capacity: **120 person-weeks**

---

## 2. Phase 1 — Core Website (Months 1–5)

### 2.1 Phase 1 Goal
Deliver a public-facing, enterprise-quality corporate website with all 16 content sections, 287 content pages, 100+ SKU detail pages, 28 regional landing pages (English), and 34 legal pages. The site must achieve Lighthouse >= 90, WCAG 2.1 AA, and 99.9% uptime.

### 2.2 Phase 1 Work Breakdown Structure

#### Month 1 — Foundation (Weeks 1–4)

**Week 1–2: Setup & Architecture**

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P1-W1-01 | Stack selection sign-off and lock | Unisoft Team Lead | 4h | — |
| P1-W1-02 | GitHub private repos provisioned (Astro + Strapi) | Unisoft Team Lead | 4h | P1-W1-01 |
| P1-W1-03 | Hetzner VPS provisioned with Coolify | Unisoft Team Lead | 8h | P1-W1-01 |
| P1-W1-04 | Cloudflare Pages account + DNS setup | Unisoft Team Lead | 4h | P1-W1-01 |
| P1-W1-05 | Backblaze B2 bucket created | Unisoft Team Lead | 2h | P1-W1-01 |
| P1-W1-06 | SaaS accounts: Sentry, UptimeRobot, Resend, Plausible | Unisoft Senior Dev | 4h | P1-W1-01 |
| P1-W1-07 | Developer workstations imaged (Linux, VSCode, Docker, Node.js, pnpm) | Both devs | 8h | — |
| P1-W1-08 | Docker Compose local stack running (Astro + Strapi + Postgres + MeiliSearch + ImgProxy) | Both devs | 16h | P1-W1-07 |
| P1-W1-09 | ADR-001 (stack), ADR-002 (architecture), ADR-003 (folder structure) committed | Unisoft Team Lead | 8h | P1-W1-08 |
| P1-W1-10 | CI/CD baseline: GitHub Actions skeleton (lint + test + build + deploy preview) | Unisoft Team Lead | 12h | P1-W1-02 |
| P1-W1-11 | Content Map reviewed; 287 entries assigned phase flags | TwinMOS PM | 8h | — |
| P1-W1-12 | TwinMOS PM commits to bi-weekly demos and 24h decision turnaround | TwinMOS PM | 2h | — |
| P1-W1-13 | Backup developer (Unisoft bench) identified | Unisoft Team Lead | 2h | — |

**Week 3–4: Content Modeling**

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P1-W3-01 | Strapi collections modeled per BRD §19 (Product, SKU, Brand, Category, Retailer, Distributor, NewsArticle, Event, KBArticle, Page, MenuItem, FormSubmission, etc.) | Unisoft Senior Dev | 40h | P1-W1-08 |
| P1-W3-02 | Astro Content Collections schema (Zod) defined | Unisoft Team Lead | 24h | P1-W1-08 |
| P1-W3-03 | Migration script: 351 markdown files mapped to Astro Content Collections | Unisoft Team Lead | 32h | P1-W3-02 |
| P1-W3-04 | Page-template prototypes for 5 layouts (Hero+Body+CTA, Spec+Gallery, Article, Form, Locator) | Unisoft Team Lead | 24h | P1-W3-02 |
| P1-W3-05 | Tailwind configured with TwinMOS design tokens | Unisoft Team Lead | 16h | P1-W1-08 |
| P1-W3-06 | Site-wide components skeleton: header, footer, cookie banner, language selector, breadcrumb, search, 404, 500, maintenance, skip links | Both devs | 40h | P1-W3-04 |
| P1-W3-07 | First demo to TwinMOS: deployed staging URL + Strapi admin walkthrough | Both devs | 4h | P1-W3-06 |

#### Month 2 — Content Production (Weeks 5–8)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P1-W5-01 | All 17 About pages routed and styled | Unisoft Team Lead | 24h | P1-W3-03 |
| P1-W5-02 | All 14 Gaming Hub static pages | Unisoft Team Lead | 20h | P1-W3-03 |
| P1-W5-03 | All 14 Technology / R&D pages | Unisoft Team Lead | 20h | P1-W3-03 |
| P1-W5-04 | All 64 Learn Hub pages (buying guides, explained, benchmarks, glossary, stories, blog) | Unisoft Team Lead | 48h | P1-W3-03 |
| P1-W5-05 | All 11 Solutions pages | Unisoft Team Lead | 16h | P1-W3-03 |
| P1-W5-06 | All 11 Marketing pages (newsletter, promotions, campaigns) | Unisoft Team Lead | 16h | P1-W3-03 |
| P1-W5-07 | All 10 Careers pages | Unisoft Team Lead | 16h | P1-W3-03 |
| P1-W5-08 | All 16 Contact pages | Unisoft Team Lead | 16h | P1-W3-03 |
| P1-W5-09 | All 19+ News & Events pages (with templates for ongoing content) | Unisoft Senior Dev | 24h | P1-W3-01 |
| P1-W5-10 | All 28 Regional landing pages (EN content; locale stubs) | Unisoft Team Lead | 24h | P1-W3-03 |
| P1-W5-11 | 11 Brand pages (brand-hub + individual brand pages) | Unisoft Team Lead | 20h | P1-W3-03 |
| P1-W5-12 | 100+ SKU detail pages from _master-sku-reference.md | Unisoft Senior Dev | 40h | P1-W3-01 |
| P1-W5-13 | All 34 Legal & Compliance pages | Unisoft Team Lead | 24h | P1-W3-03 |

#### Month 3 — Application Surfaces (Weeks 9–12)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P1-W9-01 | Catalog with dual-axis navigation (category x brand) | Unisoft Team Lead | 32h | P1-W5-12 |
| P1-W9-02 | Filtering and sorting on category pages (MeiliSearch faceting) | Unisoft Senior Dev | 24h | P1-W9-01 |
| P1-W9-03 | Product Detail Pages with dynamic specs, gallery, datasheet PDF link, "Where to Buy" CTA, related products | Unisoft Team Lead | 32h | P1-W5-12 |
| P1-W9-04 | Product Comparison tool (up to 4 products, highlighted differences, shareable URL) | Unisoft Team Lead | 24h | P1-W9-03 |
| P1-W9-05 | Where-to-Buy Locator with Leaflet + retailer cards; country auto-detect; filter by retailer type | Unisoft Senior Dev | 32h | P1-W3-01 |
| P1-W9-06 | All multi-type contact forms with auto-routing (general, sales, technical, distributor, OEM/ODM, quote, media, warranty, feedback, newsletter) | Unisoft Senior Dev | 40h | P1-W3-01 |
| P1-W9-07 | Newsletter signup with double opt-in (Resend) | Unisoft Senior Dev | 16h | P1-W9-06 |
| P1-W9-08 | Warranty Registration form with serial validation + Strapi storage + auto-confirmation email | Unisoft Senior Dev | 24h | P1-W9-06 |
| P1-W9-09 | Compatibility Finder MVP (search by laptop/desktop brand+model OR motherboard; placeholder QVL data for top 100) | Unisoft Senior Dev | 32h | P1-W3-01 |
| P1-W9-10 | Knowledge Base with MeiliSearch + "Was this helpful?" rating + FAQ accordion + install guides | Unisoft Senior Dev | 24h | P1-W3-01 |
| P1-W9-11 | Gaming Hub static pages (interactive RGB visualizer placeholder for Phase 2) | Unisoft Team Lead | 16h | P1-W5-02 |
| P1-W9-12 | Anti-Counterfeit SN-Check page placeholder | Unisoft Team Lead | 8h | P1-W5-02 |
| P1-W9-13 | RMA Request form placeholder (data capture; full tracker deferred to Phase 2) | Unisoft Senior Dev | 12h | P1-W9-08 |
| P1-W9-14 | Firmware Download List page | Unisoft Senior Dev | 12h | P1-W9-10 |
| P1-W9-15 | Distributor Application form | Unisoft Senior Dev | 16h | P1-W9-06 |
| P1-W9-16 | Partner Portal login skeleton (placeholder — full activation in Phase 2) | Unisoft Senior Dev | 16h | P1-W3-01 |

#### Month 4 — Localization, Polish, Quality Gates (Weeks 13–16)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P1-W13-01 | 9-locale framework configured (Strapi i18n + Astro i18n routing); EN populated; others empty stubs | Unisoft Team Lead | 24h | P1-W5-10 |
| P1-W13-02 | RTL framework verified for Arabic (CSS direction, mirrored layouts, Noto Sans Arabic font) | Unisoft Team Lead | 16h | P1-W13-01 |
| P1-W13-03 | All hreflang tags + XML sitemap auto-generation | Unisoft Team Lead | 12h | P1-W13-01 |
| P1-W13-04 | Schema.org structured data per page-type (Product, Article, Organization, BreadcrumbList, FAQ, Event) | Unisoft Team Lead | 16h | All content tasks |
| P1-W13-05 | Performance pass: image budgets, font subsetting, third-party script audit, route-level code splitting | Unisoft Team Lead | 24h | All content tasks |
| P1-W13-06 | Accessibility pass: full axe-core review, manual NVDA/VoiceOver test on top 30 pages | Both devs | 24h | All content tasks |
| P1-W13-07 | Security pass: ZAP scan green, dependency vulnerabilities resolved, CSP tightened, rate limits applied | Unisoft Senior Dev | 24h | All content tasks |
| P1-W13-08 | Cross-browser QA: Chrome, Safari (iOS + macOS), Samsung Internet, Firefox, Edge | Both devs | 16h | All content tasks |
| P1-W13-09 | Mobile device QA on real devices | Both devs | 16h | All content tasks |
| P1-W13-10 | Third-party penetration test scheduled and executed | TwinMOS PM | 40h | P1-W13-07 |

#### Month 5 — Stabilization & Launch (Weeks 17–20)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P1-W17-01 | CMS training session for TwinMOS Marketing (recorded video + written guide) | Unisoft Senior Dev | 16h | All content tasks |
| P1-W17-02 | Runbooks completed: deployment, incident response, content publishing, backup/restore, developer onboarding | Unisoft Team Lead | 24h | All prior tasks |
| P1-W17-03 | DR drill executed; RTO <= 4h verified | Unisoft Team Lead | 16h | P1-W17-02 |
| P1-W17-04 | Load test (k6) at 5,000 concurrent users; bottlenecks resolved | Unisoft Senior Dev | 16h | All prior tasks |
| P1-W17-05 | Third-party penetration test findings remediated | Unisoft Senior Dev | 24h | P1-W13-10 |
| P1-W17-06 | UAT with TwinMOS stakeholders (3-day window + 3 days for fixes) | TwinMOS PM + Both devs | 48h | All prior tasks |
| P1-W17-07 | Soft launch to limited audience (TwinMOS staff, key distributors) | Both devs | 16h | P1-W17-06 |
| P1-W19-01 | DNS cutover; production live | Unisoft Team Lead | 8h | P1-W17-07 |
| P1-W19-02 | Monitoring alerts active; daily metrics review for first 14 days | Both devs | 20h | P1-W19-01 |
| P1-W19-03 | Phase 1 retro with TwinMOS sponsor | TwinMOS PM | 4h | P1-W19-01 |
| P1-W19-04 | Phase 2 sprint plan locked | Both devs + TwinMOS PM | 8h | P1-W19-03 |

---

## 3. Phase 2 — Localization & Partner Enablement (Months 6–9)

### 3.1 Phase 2 Goal
Launch Arabic (RTL) and Hindi translations; fully activate the Partner Portal with asset library and watermarked price lists; complete RMA workflow, anti-counterfeit SN-check, live chat, and full compatibility finder algorithm.

### 3.2 Phase 2 Work Breakdown Structure

#### Month 6 — Translation Foundation & Partner Portal (Weeks 21–24)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P2-W21-01 | Translation vendor engaged for AR / BN / HI; delivery plan agreed | TwinMOS PM | 16h | Phase 1 complete |
| P2-W21-02 | Partner Portal: Better Auth + Strapi roles fully wired | Unisoft Senior Dev | 40h | Phase 1 complete |
| P2-W21-03 | Distributor / OEM-ODM / System Builder / Reseller programs published | Unisoft Senior Dev | 24h | P2-W21-02 |
| P2-W21-04 | Partner asset library (co-branded banners, datasheets, logos, POS materials) | Unisoft Senior Dev | 24h | P2-W21-02 |
| P2-W21-05 | Partner price list module (gated, watermarked PDF/Excel export) | Unisoft Senior Dev | 32h | P2-W21-02 |
| P2-W21-06 | Anti-counterfeit SN-Check fully activated: Strapi valid_serials collection populated from manufacturing daily ingest | Unisoft Senior Dev | 32h | Phase 1 complete |
| P2-W21-07 | Public-facing counterfeit policy paired across /support/ and /legal/ | Unisoft Team Lead | 8h | P2-W21-06 |

#### Month 7 — RMA Portal & Compatibility Finder (Weeks 25–28)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P2-W25-01 | RMA Portal full workflow: form -> warranty check -> RMA number -> status tracker (7 states) -> email notifications | Unisoft Senior Dev | 40h | P2-W21-02 |
| P2-W25-02 | Compatibility Finder full algorithm: QVL data ingested for top 500 motherboards/laptops/desktops | Unisoft Senior Dev | 40h | Phase 1 complete |
| P2-W25-03 | Firmware Download Center with serial validation gate + checksum display | Unisoft Senior Dev | 24h | P2-W25-01 |
| P2-W25-04 | TwinMOS ERP integration (read-only API for product master + pricing sync) | Unisoft Senior Dev | 32h | Phase 1 complete |

#### Month 8 — Live Chat & Gaming Interactive (Weeks 29–32)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P2-W29-01 | Live Chat: Chatwoot self-hosted on Hetzner; Astro widget integration; agent routing; offline-mode email capture | Unisoft Senior Dev | 40h | Phase 1 complete |
| P2-W29-02 | Gaming Hub interactive: RGB visualizer (interactive lighting presets) | Unisoft Team Lead | 32h | Phase 1 complete |
| P2-W29-03 | Build Gallery + Submission form with moderation queue | Unisoft Team Lead | 24h | P2-W29-02 |
| P2-W29-04 | Sync compatibility badges (Aura Sync / RGB Fusion / Mystic Light / Polychrome) | Unisoft Team Lead | 16h | P2-W29-02 |
| P2-W29-05 | Whitepaper gating (Marketing CRM lead capture) | Unisoft Senior Dev | 16h | P2-W21-02 |

#### Month 9 — Localization Launch & Phase 2 Stabilization (Weeks 33–36)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P2-W33-01 | AR / BN / HI translations imported into Strapi | Unisoft Team Lead | 24h | P2-W21-01 |
| P2-W33-02 | RTL layout verified across all 287 pages | Unisoft Team Lead | 24h | P2-W33-01 |
| P2-W33-03 | Locale-specific testing (NVDA/VoiceOver in Arabic; native-speaker review in BN and HI) | Both devs | 24h | P2-W33-02 |
| P2-W33-04 | Phase 2 DR drill | Unisoft Team Lead | 16h | P2-W33-03 |
| P2-W33-05 | Phase 2 penetration test (delta from Phase 1) | TwinMOS PM | 32h | P2-W33-03 |
| P2-W33-06 | UAT with TwinMOS stakeholders | TwinMOS PM + Both devs | 32h | P2-W33-05 |
| P2-W33-07 | Phase 2 launch (multi-language go-live) | Both devs | 16h | P2-W33-06 |
| P2-W33-08 | Phase 2 retro; Phase 3 sprint plan locked | All | 8h | P2-W33-07 |

---

## 4. Phase 3 — Commerce & Advanced Features (Months 10–15)

### 4.1 Phase 3 Goal
Launch e-commerce MVP with Medusa.js + Stripe Checkout, Russian/Chinese/French translations, advanced analytics, marketing automation, and loyalty/referral programs.

### 4.2 Phase 3 Work Breakdown Structure

#### Months 10–11 — E-Commerce Foundation (Weeks 37–44)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P3-W37-01 | E-commerce stack decision (Stripe Checkout vs Medusa.js) finalized in ADR | Unisoft Team Lead | 8h | Phase 2 complete |
| P3-W37-02 | E-commerce schema modeled in Strapi (orders, customers, payments, shipping, tax) | Unisoft Senior Dev | 32h | P3-W37-01 |
| P3-W37-03 | Stripe / Medusa integration wired | Unisoft Senior Dev | 40h | P3-W37-02 |
| P3-W37-04 | Cart UI, checkout flow, order confirmation, payment success/failure pages | Unisoft Team Lead | 40h | P3-W37-03 |
| P3-W37-05 | Customer accounts (using Better Auth foundation from Phase 2) | Unisoft Senior Dev | 24h | P3-W37-03 |
| P3-W37-06 | Tax/shipping rules per region (UAE, India, KSA as initial markets) | Unisoft Senior Dev | 24h | P3-W37-03 |
| P3-W37-07 | Terms of Sale legal page activated | Unisoft Team Lead | 8h | P3-W37-04 |

#### Month 12 — E-Commerce Hardening + RU/ZH/FR Translation (Weeks 45–48)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P3-W45-01 | E-commerce security pass (PCI considerations, fraud rules, rate limits on checkout) | Unisoft Senior Dev | 24h | P3-W37-04 |
| P3-W45-02 | E-commerce performance pass (cart performance, checkout LCP) | Unisoft Team Lead | 16h | P3-W37-04 |
| P3-W45-03 | Order management admin UI (Strapi) | Unisoft Senior Dev | 24h | P3-W37-04 |
| P3-W45-04 | Email templates for order lifecycle (Resend) | Unisoft Senior Dev | 16h | P3-W37-04 |
| P3-W45-05 | Translation vendor engaged for RU / ZH / FR; delivery in Month 12 | TwinMOS PM | 16h | Phase 2 complete |
| P3-W45-06 | RU / ZH / FR translations imported | Unisoft Team Lead | 24h | P3-W45-05 |

#### Month 13 — Advanced Analytics & Marketing Automation (Weeks 49–52)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P3-W49-01 | PostHog OSS self-hosted (session replay, feature flags, A/B testing) | Unisoft Senior Dev | 32h | Phase 2 complete |
| P3-W49-02 | Marketing automation: cross-sell banners, exit-intent popup, abandoned cart email | Unisoft Team Lead | 24h | P3-W49-01 |
| P3-W49-03 | Post-purchase email automation | Unisoft Senior Dev | 16h | P3-W49-02 |
| P3-W49-04 | Customer Data Platform integration (HubSpot) | Unisoft Senior Dev | 24h | P3-W49-01 |
| P3-W49-05 | Advanced reporting dashboards for Marketing team | Unisoft Team Lead | 24h | P3-W49-04 |

#### Month 14 — Loyalty / Referral / MDF Programs (Weeks 53–56)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P3-W53-01 | Loyalty program: points-per-purchase, tier system, redemption flow | Unisoft Senior Dev | 40h | P3-W37-04 |
| P3-W53-02 | Referral program: invite-a-friend with discount codes | Unisoft Senior Dev | 24h | P3-W53-01 |
| P3-W53-03 | MDF (Marketing Development Funds) program for distributors: claim form, approval workflow | Unisoft Senior Dev | 32h | P3-W53-01 |
| P3-W53-04 | Distributor success stories published as case studies | TwinMOS PM | 16h | P3-W53-03 |

#### Month 15 — Phase 3 Launch & Engagement Wrap (Weeks 57–60)

| Task ID | Task | Owner | Effort | Dependencies |
|---------|------|-------|--------|-------------|
| P3-W57-01 | RU / ZH / FR translations verified and live | Unisoft Team Lead | 16h | P3-W45-06 |
| P3-W57-02 | Phase 3 DR drill | Unisoft Team Lead | 16h | P3-W57-01 |
| P3-W57-03 | Phase 3 penetration test (e-commerce focused) | TwinMOS PM | 32h | P3-W57-02 |
| P3-W57-04 | UAT with TwinMOS stakeholders | TwinMOS PM + Both devs | 32h | P3-W57-03 |
| P3-W57-05 | Phase 3 launch (e-commerce go-live + 3 new locales + advanced features) | Both devs | 16h | P3-W57-04 |
| P3-W57-06 | Phase 4 handoff package: open documentation, Phase 4 backlog, retainer scope | Both devs | 24h | P3-W57-05 |
| P3-W57-07 | Final retro with TwinMOS sponsor | All | 4h | P3-W57-05 |
| P3-W57-08 | Engagement closeout | All | 8h | P3-W57-07 |

---

## 5. Dependencies and Critical Path

### 5.1 Cross-Phase Dependencies

```
Phase 1 (Months 1-5)
  |
  ├──> Phase 2 (Months 6-9) [Hard dependency: Phase 1 public launch]
  |      |
  |      ├──> Phase 3 (Months 10-15) [Hard dependency: Phase 2 multi-language launch]
  |
  └──> Phase 4 (Months 16+) [Soft dependency: Phase 3 e-commerce live]
```

### 5.2 Critical Path (Phase 1)

```
Week 1: Stack lock -> Repos provisioned -> VPS provisioned -> Docker Compose running
  |
Week 3: Content modeling complete -> Page templates ready
  |
Week 5: Content pages routed -> SKU pages live
  |
Week 9: Application surfaces complete (catalog, forms, finder, locator)
  |
Week 13: Quality gates pass (performance, accessibility, security)
  |
Week 17: UAT complete -> Pen-test findings remediated
  |
Week 19: Public launch
```

### 5.3 Key External Dependencies

| Dependency | Owner | Lead Time | Impact if Delayed |
|------------|-------|-----------|-------------------|
| TwinMOS product data (SKUs, specs, images) | TwinMOS Product Manager | 2 weeks | Blocks SKU pages, catalog, compatibility finder |
| TwinMOS DNS/domain access | TwinMOS IT Lead | 1 week | Blocks production deployment |
| Translation vendor contracts | TwinMOS PM | 4 weeks | Blocks Phase 2 localization |
| Penetration test vendor | TwinMOS PM | 2 weeks | Blocks phase launch |
| Manufacturing serial data for anti-counterfeit | TwinMOS Operations | 4 weeks | Blocks Phase 2 SN-check |
| ERP system audit and API access | TwinMOS IT Lead | 4 weeks | Blocks Phase 2 ERP integration |
| HubSpot CRM setup and API keys | TwinMOS Sales Director | 2 weeks | Blocks Phase 1 CRM integration |

---

## 6. Resource Allocation

### 6.1 Effort Summary by Phase

| Phase | Realistic Effort | Team Capacity | Margin |
|-------|------------------|---------------|--------|
| Phase 1 | 90–110 person-weeks | 100 weeks (2 devs x 25 weeks) | Comfortable |
| Phase 2 | 70–85 person-weeks | 64 weeks (2 devs x 16 weeks) | Adequate |
| Phase 3 | 90–110 person-weeks | 96 weeks (2 devs x 24 weeks) | Comfortable |
| **Total** | **250–305 person-weeks** | **260 weeks** | **Adequate** |

### 6.2 Monthly Capacity Plan

| Month | Dev A (Team Lead) | Dev B (Senior) | Total | Notes |
|-------|-------------------|----------------|-------|-------|
| 1 | 160h | 160h | 320h | Setup, architecture, content modeling |
| 2 | 160h | 160h | 320h | Content production |
| 3 | 160h | 160h | 320h | Application surfaces |
| 4 | 160h | 160h | 320h | Quality gates |
| 5 | 160h | 160h | 320h | Stabilization, launch, hypercare |
| 6 | 160h | 160h | 320h | Translation, partner portal |
| 7 | 160h | 160h | 320h | RMA, compatibility finder |
| 8 | 160h | 160h | 320h | Live chat, gaming interactive |
| 9 | 160h | 160h | 320h | Localization launch |
| 10 | 160h | 160h | 320h | E-commerce foundation |
| 11 | 160h | 160h | 320h | E-commerce hardening |
| 12 | 160h | 160h | 320h | Translations, analytics |
| 13 | 160h | 160h | 320h | Marketing automation |
| 14 | 160h | 160h | 320h | Loyalty, referral, MDF |
| 15 | 160h | 160h | 320h | Launch, handoff, closeout |

---

## 7. Quality Gates

### 7.1 Phase Gate Criteria

| Gate | Criteria | Verification Method |
|------|----------|---------------------|
| **Design Approval** (Week 7) | Figma files signed off by Marketing Director; design system documented; accessibility review complete | Sign-off form + Design Review Checklist |
| **Beta Delivery** (Week 14) | All core features functional on staging; CMS admin ready; content populated; internal QA complete | Beta Acceptance Checklist + Test Report |
| **UAT Complete** (Week 16) | All critical bugs resolved; stakeholder sign-off; soft launch successful | UAT Sign-Off Form + Bug Report |
| **Public Launch** (Week 18) | DNS cutover complete; monitoring active; load test passed; pen-test green | Launch Checklist + Go/No-Go Decision |
| **Phase Complete** (Week 20/26/60) | All phase deliverables accepted; documentation complete; retro conducted; next phase plan locked | Phase Gate Review Template |

### 7.2 Continuous Quality Metrics

| Metric | Target | Measurement Frequency |
|--------|--------|----------------------|
| Lighthouse Performance | >= 90 | Every PR (CI) |
| Lighthouse Accessibility | >= 95 | Every PR (CI) |
| axe-core critical/serious | 0 | Every PR (CI) |
| OWASP ZAP high/critical | 0 | Weekly |
| Unit test coverage | >= 70% overall, 100% business logic | Every PR (CI) |
| Bundle size (Astro shell) | < 80 KB JS | Every PR (CI) |
| Uptime | >= 99.9% | Continuous (UptimeRobot) |

---

## 8. Communication and Reporting

### 8.1 Regular Cadence

| Meeting | Frequency | Duration | Participants | Purpose |
|---------|-----------|----------|--------------|---------|
| Daily Standup | Daily | 15 min | Both devs (async-friendly) | Blockers, progress, coordination |
| Sprint Planning | Bi-weekly | 90 min | Both devs + TwinMOS PM | Task assignment, estimation |
| Sprint Review | Bi-weekly | 60 min | Both devs + TwinMOS PM + stakeholders | Demo, feedback, acceptance |
| Bi-weekly Status Report | Bi-weekly | — | All stakeholders | Written status update |
| Phase Gate Review | Per phase | 2 hours | All key stakeholders | Go/no-go decision |
| Monthly Business Review | Monthly | 1 hour | Sponsor + Operational Sponsor + PM | Budget, risks, strategic alignment |

### 8.2 Reporting Structure

- **Daily:** Standup notes in Slack/project channel
- **Bi-weekly:** Status Report using TwinMOSWebsiteStatusReportTemplate.md
- **Monthly:** Executive summary to Project Sponsor
- **Per-phase:** Phase Gate Review using TwinMOSWebsitePhaseGateReview_Template.md
- **Ad-hoc:** Issue Log and Decision Log updates as events occur

---

## 9. Risk Management

### 9.1 Top Risks by Phase

| Phase | Top Risk | Contingency |
|-------|----------|-------------|
| Phase 1 | Content authoring lags developer pace | Front-load templates; CMS training Week 16; marketing self-serves from launch |
| Phase 1 | One developer absent >= 2 weeks | Daily commits; ADRs ensure continuity; backup dev on bench |
| Phase 2 | Translation vendor delivers late | Engage vendor by Phase 1 Week 12; staged delivery; English fallback |
| Phase 2 | QVL data not ready for compatibility finder | Begin collection in Phase 1; Product team owner assigned |
| Phase 3 | E-commerce scope creep (PCI, fraud, tax) | Stripe Checkout shifts PCI burden; Medusa handles fraud; TaxJar for tax |
| Phase 3 | Traffic exceeds Hetzner CX42 capacity | Postgres read replica; Stripe absorbs checkout; Cloudflare cache aggressive |

*Full Risk Register maintained in TwinMOSWebsiteRiskRegisterConsolidated.md*

---

## 10. Change Control

All scope, timeline, or budget changes must follow the Change Request Process documented in TwinMOSWebsiteChangeRequestProcess.md. Key thresholds:

| Change Type | Approval Required |
|-------------|-------------------|
| Effort < 8 hours | Unisoft Team Lead + TwinMOS PM |
| Effort 8–40 hours | Operational Sponsor |
| Effort > 40 hours or budget > $5K | Project Sponsor |
| New epic or phase delay > 2 weeks | Project Sponsor |
| Technology stack change | Operational Sponsor + TwinMOS IT Lead |

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial plan |

**Next Review:** Upon Sprint 0 close (Week 2) and at each phase boundary (Months 5, 9, 15)

**Related Documents:**
- TwinMOSWebsiteProject_Charter.md
- TwinMOSWebsiteSprintBacklogPhase_1.md
- TwinMOSWebsiteSprintBacklogPhase_2.md
- TwinMOSWebsiteSprintBacklogPhase_3.md
- TwinMOSWebsiteMilestone_Schedule.md
- TwinMOSWebsiteRiskRegisterConsolidated.md
- TwinMOSWebsiteChangeRequestProcess.md

---

*This Project Plan is a living document. Changes require written approval per the Change Request Process and must be logged in the Decision Log.*
