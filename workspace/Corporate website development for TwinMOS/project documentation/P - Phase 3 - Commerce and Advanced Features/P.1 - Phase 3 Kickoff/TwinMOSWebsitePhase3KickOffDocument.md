# TwinMOS Technologies Corporate Website
# Phase 3 Kickoff Document

| Field | Value |
|---|---|
| **Document Reference** | TWN-P3-KICK-2026-001 |
| **Version** | 1.0 |
| **Status** | FINAL |
| **Date** | 1 May 2026 |
| **Author** | TwinMOS Project Management Office |
| **Owner** | TwinMOS PM |
| **Classification** | Internal — Confidential |
| **Related Documents** | TWN-BRD-2026-001 v3.0, TWN-TECHSTACK-2026-001 v1.1, TWN-PM-PLAN-2026-001 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase 3 Objectives](#2-phase-3-objectives)
3. [Phase 3 Scope](#3-phase-3-scope)
4. [Prerequisites from Phase 2](#4-prerequisites-from-phase-2)
5. [Team Roster and Responsibilities](#5-team-roster-and-responsibilities)
6. [Phase 3 Timeline](#6-phase-3-timeline)
7. [Key Deliverables Table](#7-key-deliverables-table)
8. [Success Criteria](#8-success-criteria)
9. [KPIs for Phase 3](#9-kpis-for-phase-3)
10. [Risk Register](#10-risk-register)
11. [Dependencies](#11-dependencies)
12. [Phase Gate Criteria](#12-phase-gate-criteria)
13. [Sprint Plan Overview](#13-sprint-plan-overview)
14. [Communication Plan](#14-communication-plan)
15. [Sign-Off Table](#15-sign-off-table)

---

## 1. Executive Summary

Phase 3 of the TwinMOS Technologies corporate website project marks the transition from a high-quality informational and partner-facing platform into a fully operational direct-to-consumer and business-to-business e-commerce ecosystem. Building upon the solid foundations established in Phase 1 (core website architecture, Strapi CMS, Astro 5 frontend, PostgreSQL, Cloudflare Pages, Hetzner hosting via Coolify) and Phase 2 (multi-language localization, partner portal, Better Auth, RU/ZH-CN/FR translation readiness), Phase 3 delivers the commercial engine and advanced engagement capabilities required to serve TwinMOS's global customer base directly.

TwinMOS Technologies has operated as a memory and storage hardware manufacturer since 1998, with its headquarters in Dubai Airport Free Zone (DAFZA), UAE, and a commercial footprint across 93+ countries. To date, the primary go-to-market channel has been through distribution networks and channel partners. Phase 3 introduces a direct commerce capability, enabling TwinMOS to sell VOLTX DDR5, VOLTX RGB DDR5, TornadoX7 DDR4, Thunder GX DDR4, CoreX Pro Gen5 NVMe SSD, Xtreme Gen4 NVMe SSD, Elite Drive SATA SSD, portable SSDs, and USB flash drives directly to end consumers and resellers across the UAE, India, Bangladesh, KSA, and international markets.

The Phase 3 scope encompasses six primary capability clusters:

1. **E-Commerce Platform Launch** — Medusa.js v2 integrated with Strapi v5 and Stripe Checkout, supporting multi-currency pricing, tax compliance (UAE VAT, India GST, KSA VAT), and multi-carrier shipping (Aramex, FedEx, DHL, local couriers).
2. **New Locale Activation** — Import of Russian (RU), Simplified Chinese (ZH-CN), and French (FR) translations prepared during Phase 2, enabling full storefront and CMS content delivery in these languages.
3. **Advanced Analytics** — PostHog OSS self-hosted deployment for session replay, funnel analysis, feature flags, and A/B testing, replacing or supplementing basic web analytics.
4. **Marketing Automation** — HubSpot CRM integration with Resend transactional email for abandoned cart recovery, post-purchase nurturing, cross-sell campaigns, and lifecycle communications.
5. **Loyalty and Referral Programs** — A points-per-purchase loyalty tier system and an invite-a-friend referral programme designed to drive repeat purchases and new customer acquisition.
6. **Marketing Development Funds (MDF) Programme** — A structured MDF portal for distributors and channel partners, tracking fund allocation, campaign submissions, and claim processing.

Phase 3 runs from Month 10 through Month 15 (24 weeks), concluding with a formal go-live, disaster recovery drill, penetration test, and operational handoff to TwinMOS internal teams.

This kickoff document formalises the start of Phase 3, aligns all stakeholders on scope, timeline, roles, and success criteria, and establishes the governance and communication structures that will govern the next 24 weeks of delivery.

---

## 2. Phase 3 Objectives

### 2.1 Primary Objectives

| ID | Objective | Measurable Target |
|---|---|---|
| OBJ-01 | Launch direct e-commerce capability across 4 primary markets | UAE, India, Bangladesh, KSA live at go-live |
| OBJ-02 | Achieve PCI DSS SAQ A compliance for payment processing | Zero card data stored or transmitted by TwinMOS systems |
| OBJ-03 | Activate 3 new language locales | RU, ZH-CN, FR fully live with translated content |
| OBJ-04 | Deploy self-hosted PostHog analytics | 100% of storefront events captured from day 1 |
| OBJ-05 | Launch loyalty programme with measurable enrollment | 100+ enrolled users within 30 days of launch |
| OBJ-06 | Activate referral programme | First referral conversion within 60 days of launch |
| OBJ-07 | Deploy MDF portal for distributors | MDF portal accessible to all approved distributors |
| OBJ-08 | Integrate HubSpot + Resend marketing automation | Abandoned cart email firing within 24h of abandonment |

### 2.2 Strategic Objectives

- **Reduce channel dependence** by enabling TwinMOS to transact directly with end consumers, reducing margin given to distribution.
- **Capture first-party customer data** for future direct marketing, product research, and lifecycle nurturing.
- **Strengthen partner relationships** via the MDF programme, making TwinMOS a more commercially attractive partner compared to competing memory manufacturers.
- **Improve conversion and retention** via data-driven A/B testing enabled by PostHog's feature flag and experimentation infrastructure.
- **Scale into new language markets** (Russian-speaking CIS, Chinese-speaking APAC, Francophone Africa and Europe) using the translation assets prepared in Phase 2.

### 2.3 Technical Objectives

- Deploy and stabilise Medusa.js v2 as the commerce layer, fully integrated with Strapi v5 for product content and Better Auth for customer accounts.
- Implement Stripe Checkout with multi-currency and multi-region support, plus Stripe Tax for automated VAT/GST calculation.
- Integrate Aramex, FedEx, and DHL shipping rate APIs for real-time carrier selection at checkout.
- Maintain Lighthouse performance scores (LCP ≤2.5s on checkout pages) after adding commerce components.
- Implement comprehensive webhook handling for all Stripe and Medusa lifecycle events.

---

## 3. Phase 3 Scope

### 3.1 In Scope

| Category | Item |
|---|---|
| E-Commerce | Medusa.js v2 installation, configuration, and Strapi integration |
| E-Commerce | Stripe Checkout integration (primary payment flow) |
| E-Commerce | Multi-currency pricing: AED, INR, BDT, SAR, USD |
| E-Commerce | Tax configuration: UAE 5% VAT, India 18% GST, KSA 15% VAT via Stripe Tax |
| E-Commerce | Shipping integrations: Aramex, FedEx, DHL API connections |
| E-Commerce | Customer accounts via Better Auth (shared with partner portal) |
| E-Commerce | Cart: mini-cart, full cart page, localStorage persistence, server-side merge |
| E-Commerce | Checkout: 4-step flow, guest and registered, address validation |
| E-Commerce | Order management: confirmation emails, order history, reorder |
| E-Commerce | Admin: Medusa Admin panel, Strapi CMS product management |
| Localization | Import and activate RU, ZH-CN, FR translations in Strapi |
| Localization | RTL layout for Arabic e-commerce pages (/ar/ locale) |
| Analytics | PostHog OSS self-hosted on Hetzner CX42 via Coolify |
| Analytics | Session replay, funnel tracking, feature flags, A/B testing |
| Analytics | Custom event tracking for all e-commerce funnel steps |
| Marketing Automation | HubSpot CRM integration with contact sync |
| Marketing Automation | Resend transactional emails: abandoned cart, order confirmation, post-purchase |
| Marketing Automation | Abandoned cart email sequence (24h, 48h, 72h) |
| Marketing Automation | Post-purchase nurture sequence (review request, cross-sell) |
| Loyalty Programme | Points-per-purchase system with tier structure |
| Loyalty Programme | Points balance display in customer account |
| Loyalty Programme | Points redemption at checkout |
| Referral Programme | Invite-a-friend with unique referral link generation |
| Referral Programme | Referral tracking, attribution, and reward fulfilment |
| MDF Programme | Distributor MDF application portal (via partner portal) |
| MDF Programme | Campaign submission, approval workflow, claim processing |
| Security | Penetration test (Phase 3 pre-launch) |
| Security | Disaster recovery drill |
| Performance | Checkout LCP ≤2.5s, Time to Interactive ≤3s |

### 3.2 Out of Scope for Phase 3

| Item | Rationale / Planned Phase |
|---|---|
| PayPal payment method | Phase 4 |
| bKash integration (Bangladesh) | Phase 4 |
| KNET integration (Kuwait) | Phase 4 |
| ERP (SAP/Oracle) two-way integration | Requires separate ERP project scoping |
| B2B bulk ordering / quote workflow | Phase 4 |
| Marketplace integrations (Amazon, Noon) | Not currently in roadmap |
| Mobile application (iOS/Android) | Out of website project scope |
| Product reviews and ratings system | Phase 4 |
| Live chat / customer support widget | Phase 4 |
| Advanced subscription / recurring orders | Phase 4 |
| Stripe Billing / subscription management | Phase 4 |

### 3.3 Assumptions

- Stripe account(s) will be approved and fully operational for all target markets before Month 10, Week 4.
- Translation vendor will deliver final RU/ZH-CN/FR content files by Month 11, Week 2.
- Aramex, FedEx, and DHL API credentials are procured by TwinMOS by Month 10, Week 3.
- Phase 2 has been formally closed and signed off before Phase 3 kickoff.
- Hetzner CX42 server provisioned via Coolify is operational and has sufficient capacity for Phase 3 workloads; capacity upgrade to CX52 is pre-approved if required.
- TwinMOS marketing team will supply loyalty programme tier names, branding, and reward rules by Month 11, Week 2.
- HubSpot instance is live and accessible; API keys are available to Dev B by Month 12, Week 1.

---

## 4. Prerequisites from Phase 2

Before Phase 3 work commences, the following Phase 2 deliverables must be formally verified as complete and operational:

| ID | Prerequisite | Verification Method | Owner |
|---|---|---|---|
| PRE-01 | Better Auth authentication service live in production | Login/registration functional on production URL | Dev B |
| PRE-02 | Partner portal fully operational | Partner login, resource download, and lead submission tested | Dev B |
| PRE-03 | Strapi v5 CMS operational with all Phase 1-2 content types | Content types audited, API accessible | Dev B |
| PRE-04 | PostgreSQL 16 database operational on Hetzner via Coolify | Database health check pass, backup verified | Dev B |
| PRE-05 | Cloudflare Pages production deployment pipeline stable | Last 5 deployments successful with no rollbacks | Dev A |
| PRE-06 | MeiliSearch search index operational | Product and blog search returning results | Dev A |
| PRE-07 | RU/ZH-CN/FR translation strings prepared and in Strapi staging | Translation coverage >90% verified in Strapi | TwinMOS PM |
| PRE-08 | Arabic (AR) locale active with RTL layout verified | /ar/ URLs rendering correctly | Dev A |
| PRE-09 | Backblaze B2 media storage operational | Image upload/retrieval working | Dev B |
| PRE-10 | Resend email integration live (transactional emails for Phase 2) | Password reset email delivery verified | Dev B |
| PRE-11 | Phase 2 UAT signed off by TwinMOS stakeholders | UAT sign-off document on file | TwinMOS PM |
| PRE-12 | Phase 2 lessons learned documented | Retrospective document shared with team | TwinMOS PM |

**Prerequisite Gate:** Phase 3 development work on e-commerce shall not commence until PRE-01 through PRE-06 are confirmed green. PRE-07 can be in progress during Months 10-11.

---

## 5. Team Roster and Responsibilities

### 5.1 Core Team

| Role | Individual / Entity | Responsibilities |
|---|---|---|
| **TwinMOS Project Manager (PM)** | TwinMOS PMO | Overall project governance, stakeholder communication, sprint planning, risk management, phase gate sign-off, vendor coordination |
| **Dev A — Astro Frontend** | Unisoft Engineering | Astro 5 storefront development, product pages, cart UI, checkout UI, PostHog integration, A/B test implementation, performance optimisation, accessibility |
| **Dev B — Strapi + Medusa Backend** | Unisoft Engineering | Medusa.js v2 setup and configuration, Strapi content type extensions, Stripe webhook handling, Better Auth e-commerce scopes, shipping API integration, email automation, loyalty/referral backend, MDF portal backend |
| **TwinMOS Marketing** | TwinMOS Internal | Loyalty programme rules definition, referral programme design, HubSpot campaign configuration, MDF programme business rules, content approval, promotional copy |

### 5.2 Extended Stakeholders

| Role | Responsibilities |
|---|---|
| **TwinMOS Finance** | UAE VAT registration details, invoice requirements, payout reconciliation approval |
| **TwinMOS Legal** | Terms and conditions for e-commerce, GDPR/privacy policy review, KSA/UAE e-commerce compliance |
| **TwinMOS Logistics** | Shipping carrier account numbers, warehouse address for origin shipping, return address |
| **Stripe Account Manager** | Account setup, merchant verification, multi-currency enablement |
| **Aramex / FedEx / DHL Account Manager** | API credential provisioning, rate negotiation, test environment access |
| **Translation Vendor** | Delivery of RU/ZH-CN/FR translation files on schedule |

### 5.3 RACI Matrix

| Deliverable | TwinMOS PM | Dev A | Dev B | TwinMOS Marketing |
|---|---|---|---|---|
| Medusa.js v2 Setup | A | I | R | I |
| Stripe Integration | A | C | R | I |
| Storefront Cart/Checkout UI | A | R | C | I |
| PostHog Deployment | A | R | C | I |
| HubSpot Integration | A | C | R | C |
| Loyalty Programme Backend | A | C | R | C |
| Loyalty Programme UX | A | R | C | R |
| MDF Portal | A | C | R | C |
| RU/ZH-CN/FR Locale Activation | A | R | C | C |
| UAT Coordination | R | C | C | C |
| Go-Live Approval | R | I | I | I |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

---

## 6. Phase 3 Timeline

### 6.1 High-Level Milestone Overview

| Month | Period | Theme | Key Outputs |
|---|---|---|---|
| Month 10 | Weeks 1-4 | E-Commerce Foundation I | Medusa setup, Stripe connected, product sync, cart working |
| Month 11 | Weeks 5-8 | E-Commerce Foundation II | Checkout live (staging), tax/shipping APIs, customer accounts |
| Month 12 | Weeks 9-12 | E-Commerce Hardening + Locales | Load testing, bug fixing, RU/ZH-CN/FR import, AR checkout |
| Month 13 | Weeks 13-16 | Analytics + Marketing Automation | PostHog live, HubSpot sync, abandoned cart, post-purchase email |
| Month 14 | Weeks 17-20 | Loyalty + Referral + MDF | Loyalty programme, referral programme, MDF portal |
| Month 15 | Weeks 21-24 | Launch Preparation + Go-Live | DR drill, pen test, UAT, go-live, handoff |

### 6.2 Month 10: E-Commerce Foundation I (Weeks 1–4)

**Theme:** Establish the Medusa.js v2 commerce backend, connect it to Strapi and Stripe, and get the first product purchasable end-to-end on staging.

| Week | Key Activities | Deliverable |
|---|---|---|
| W1 | Medusa.js v2 installation on Hetzner (staging); configure PostgreSQL schema; Medusa admin panel access | Medusa staging environment running |
| W1 | Review and confirm ADR-019: Stripe Checkout redirect vs Stripe Elements embedded | ADR-019 decision recorded |
| W2 | Install and configure `medusa-plugin-strapi`; map Strapi product content types to Medusa product schema | Product sync pipeline (Strapi → Medusa) working for ≥1 product |
| W2 | Stripe account connection to Medusa staging; test payment in Stripe test mode | Stripe test checkout completing |
| W3 | Astro product detail pages (/products/{slug}) pulling price and availability from Medusa API | Product pages rendering live prices |
| W3 | Cart API integration: add to cart, update quantity, remove item | Cart CRUD operations functional |
| W4 | Mini-cart sidebar UI (Astro component + Server Island cart count badge) | Mini-cart rendering with real-time badge |
| W4 | Sprint 1 review and retrospective | Sprint 1 demo to TwinMOS PM |

**Month 10 Exit Criteria:**
- At least 3 products synced from Strapi to Medusa with prices in AED and USD
- Guest can add to cart and reach Stripe test checkout on staging
- Cart badge updates without full page reload

### 6.3 Month 11: E-Commerce Foundation II (Weeks 5–8)

**Theme:** Complete the full checkout flow including shipping integration, tax calculation, order confirmation, and customer account order history.

| Week | Key Activities | Deliverable |
|---|---|---|
| W5 | 4-step checkout flow: contact info → shipping address → shipping method → payment + review | Checkout flow navigable on staging |
| W5 | Guest checkout path: email capture, no account required | Guest checkout completing to order confirmation |
| W6 | Better Auth integration for registered checkout: pre-filled address, account order history | Registered checkout completing |
| W6 | Stripe Tax configuration for UAE 5% VAT, India 18% GST, KSA 15% VAT | Tax calculation correct in test for all regions |
| W7 | Aramex shipping rate API integration; real-time rate retrieval at checkout | Aramex rates appearing in shipping method step |
| W7 | FedEx and DHL shipping rate API integration | FedEx/DHL rates appearing alongside Aramex |
| W8 | Resend order confirmation email: order number, line items, estimated delivery, tracking link placeholder | Order confirmation email delivered on test checkout |
| W8 | /account/orders page: order list, order detail view, reorder button | Account order history functional |
| W8 | Sprint 2 review and retrospective | Sprint 2 demo to TwinMOS PM |

**Month 11 Exit Criteria:**
- Full guest checkout completable end-to-end on staging (AED and INR)
- Registered checkout completable with pre-filled details
- Tax displayed correctly for UAE, India, KSA test checkouts
- Order confirmation email delivered within 2 minutes of checkout completion

### 6.4 Month 12: E-Commerce Hardening + Locale Import (Weeks 9–12)

**Theme:** Stabilise the e-commerce stack through load testing and systematic bug-fixing, while simultaneously activating the RU/ZH-CN/FR locales and ensuring the Arabic checkout is RTL-compliant.

| Week | Key Activities | Deliverable |
|---|---|---|
| W9 | Load testing: simulate 200 concurrent checkout sessions using k6; identify and fix bottlenecks | Load test report; performance within targets |
| W9 | Webhook reliability: ensure all Stripe webhooks reliably processed with idempotency keys | Webhook handler unit tests >90% coverage |
| W10 | Import RU/ZH-CN/FR translation files into Strapi; activate locales | 3 new locales browsable on staging storefront |
| W10 | Checkout error state testing: out-of-stock, payment decline, address validation failure, session timeout | All error states display correct UX and messaging |
| W11 | RTL layout verification for AR checkout pages; keyboard navigation testing | /ar/ checkout passes RTL visual review |
| W11 | Multi-currency display audit: AED/INR/BDT/SAR/USD correct decimal places and symbols | Currency display audit sign-off |
| W12 | Full regression test of all checkout paths (guest, registered, all currencies, all locales tested) | Regression test report; <5 open critical bugs |
| W12 | Sprint 3 review and retrospective | Sprint 3 demo including locale demo |

**Month 12 Exit Criteria:**
- All 4 markets (UAE/India/Bangladesh/KSA) checkout tested and passing
- RU, ZH-CN, FR locales active on staging
- Load test: 200 concurrent sessions with P95 checkout page load ≤3s
- Zero P1 bugs open

### 6.5 Month 13: PostHog + Marketing Automation (Weeks 13–16)

**Theme:** Deploy self-hosted PostHog for advanced analytics, integrate HubSpot CRM, and activate the marketing automation sequences for abandoned cart and post-purchase nurturing.

| Week | Key Activities | Deliverable |
|---|---|---|
| W13 | PostHog OSS deployment on Hetzner CX42 via Coolify; configure ingestion endpoint | PostHog UI accessible, events ingesting from staging storefront |
| W13 | Custom event tracking: page views, product views, add-to-cart, checkout step entered, purchase completed | PostHog dashboard showing funnel from browse to purchase |
| W14 | Session replay configuration: mask PII fields (card, email), retention policy | Session replay recording on staging (non-PII) |
| W14 | Feature flags setup: flag structure for A/B tests (checkout CTA copy, product page layout variants) | Feature flags operational in PostHog |
| W15 | HubSpot CRM contact sync: new customer account → HubSpot contact created | HubSpot contact created for each test registration |
| W15 | Abandoned cart trigger: cart inactive 24h → HubSpot workflow → Resend email | Abandoned cart email received in test within 24h |
| W16 | Post-purchase email sequence: review request (7 days), cross-sell recommendation (14 days) | Post-purchase emails delivered in test |
| W16 | HubSpot pipeline: order completed → deal created in HubSpot | Order-to-deal sync confirmed |
| W16 | Sprint 4 review and retrospective | Sprint 4 demo: PostHog funnel + abandoned cart live demo |

**Month 13 Exit Criteria:**
- PostHog capturing all defined events on staging with <1% event loss
- Abandoned cart email firing within 25 hours of simulated abandonment
- Post-purchase sequence delivering all 2 emails on schedule
- HubSpot contacts created for all test registrations

### 6.6 Month 14: Loyalty + Referral + MDF Programmes (Weeks 17–20)

**Theme:** Build and launch the three engagement and partner programmes: loyalty points, referral invite-a-friend, and the distributor MDF portal.

| Week | Key Activities | Deliverable |
|---|---|---|
| W17 | Loyalty programme backend: points accrual on purchase (1 point per USD 1 equivalent), tier logic (Bronze/Silver/Gold) | Points awarded correctly on test purchase |
| W17 | Loyalty programme frontend: points balance in account dashboard, tier badge | Customer account shows balance and tier |
| W18 | Loyalty points redemption at checkout: toggle to apply points toward order total; min 100 points = USD 1 discount | Redemption works at checkout with correct deduction |
| W18 | Referral programme: unique referral link generation, referral tracking cookie, reward on referee's first purchase | Referral flow testable end-to-end on staging |
| W19 | Referral programme dashboard: referrer's invite history, pending rewards, credited rewards | Referral dashboard accessible in account |
| W19 | MDF portal backend: application submission, budget allocation, campaign types, approval workflow | PM can approve/reject MDF applications in admin |
| W20 | MDF portal frontend: distributor view (submit application, view status, upload receipts, submit claim) | Distributor can submit MDF application end-to-end |
| W20 | Sprint 5 review and retrospective | Sprint 5 demo: loyalty purchase, referral invite, MDF application |

**Month 14 Exit Criteria:**
- Loyalty points correctly awarded and redeemable on staging
- Referral link generates unique code; referee first purchase triggers referrer reward
- MDF application submittable by distributor and approvable by TwinMOS admin

### 6.7 Month 15: Phase 3 Launch Preparation + Go-Live (Weeks 21–24)

**Theme:** Execute all pre-launch checks, obtain stakeholder sign-off, run the disaster recovery drill and penetration test, conduct UAT, and go live.

| Week | Key Activities | Deliverable |
|---|---|---|
| W21 | Production environment preparation: Medusa production deployment, Stripe live mode configuration, DNS/Cloudflare settings | Production environment ready for UAT |
| W21 | Disaster recovery drill: simulate database failure, verify restore procedure, document RTO/RPO | DR drill report; RTO ≤4h confirmed |
| W22 | Penetration test: external pen test firm engaged; scope covers checkout, Stripe webhooks, auth, loyalty API | Pen test report; all Critical/High findings remediated |
| W22 | User Acceptance Testing (UAT): TwinMOS PM + Marketing conduct structured UAT on production (Stripe test mode) | UAT sign-off sheet completed |
| W23 | UAT bug fixes; final content review (prices, VAT numbers, terms); SEO metadata for e-commerce pages | UAT bug backlog cleared; content approved |
| W23 | Go-live checklist completed: DNS cutover plan, rollback procedure documented, Stripe live mode enabled | Go-live checklist signed off |
| W24 | **GO-LIVE**: Stripe live mode enabled, production traffic, monitoring dashboards active | E-commerce live in UAE, India, Bangladesh, KSA, International |
| W24 | Post-launch hyper-care: 48h monitoring, bug triage, performance watch | Hyper-care report at end of W24 |
| W24 | Phase 3 handoff: runbook delivery, team training, documentation handoff | Phase 3 closure document signed |

**Month 15 Exit Criteria / Go-Live Gate:**
- Zero Critical or High security findings from pen test unresolved
- UAT signed off with zero blocking defects
- DR drill passed: restore completed within 4 hours
- Stripe live mode first successful real transaction
- PostHog capturing live events from production

---

## 7. Key Deliverables Table

| ID | Deliverable | Owner | Due Date (Approx.) | Acceptance Criteria |
|---|---|---|---|---|
| D-01 | Medusa.js v2 staging environment | Dev B | Month 10, W1 | Admin panel accessible, PostgreSQL connected |
| D-02 | Strapi ↔ Medusa product sync | Dev B | Month 10, W2 | 20+ products synced with prices |
| D-03 | Stripe test checkout integration | Dev B | Month 10, W2 | Test payment completes, order created in Medusa |
| D-04 | Product detail pages (Astro) | Dev A | Month 10, W3 | Live prices, stock status, add to cart |
| D-05 | Cart UI (mini + full page) | Dev A | Month 10-11, W4 | Add/remove/update; badge updates |
| D-06 | Full 4-step checkout flow | Dev A + Dev B | Month 11, W5 | Guest checkout completable on staging |
| D-07 | Better Auth registered checkout | Dev B | Month 11, W6 | Registered user pre-filled checkout |
| D-08 | Stripe Tax configuration | Dev B | Month 11, W6 | Correct tax per market |
| D-09 | Shipping rate APIs (Aramex/FedEx/DHL) | Dev B | Month 11, W7 | Live rates at checkout |
| D-10 | Order confirmation email (Resend) | Dev B | Month 11, W8 | Email delivered <2 min |
| D-11 | Account order history page | Dev A + Dev B | Month 11, W8 | Orders list and detail view |
| D-12 | Load test report | Dev A + Dev B | Month 12, W9 | P95 ≤3s at 200 concurrent |
| D-13 | RU/ZH-CN/FR locale activation | Dev A + TwinMOS PM | Month 12, W10 | Locales browsable on staging |
| D-14 | RTL AR checkout verification | Dev A | Month 12, W11 | RTL review passed |
| D-15 | PostHog OSS deployment | Dev B | Month 13, W13 | Events ingesting, UI accessible |
| D-16 | E-commerce event tracking | Dev A | Month 13, W13 | All funnel events visible in PostHog |
| D-17 | Session replay + feature flags | Dev A + Dev B | Month 13, W14 | Replay recording, flags operational |
| D-18 | HubSpot contact sync | Dev B | Month 13, W15 | Contacts created on registration |
| D-19 | Abandoned cart email | Dev B | Month 13, W15 | Email received within 25h |
| D-20 | Post-purchase email sequence | Dev B | Month 13, W16 | Both emails delivered on schedule |
| D-21 | Loyalty programme (backend) | Dev B | Month 14, W17 | Points awarded on purchase |
| D-22 | Loyalty programme (frontend) | Dev A | Month 14, W17 | Balance/tier visible in account |
| D-23 | Loyalty redemption at checkout | Dev A + Dev B | Month 14, W18 | Redemption applied correctly |
| D-24 | Referral programme | Dev A + Dev B | Month 14, W18-19 | Full referral flow testable |
| D-25 | MDF portal (backend) | Dev B | Month 14, W19-20 | Application/approval workflow |
| D-26 | MDF portal (frontend) | Dev A | Month 14, W20 | Distributor can submit application |
| D-27 | Disaster recovery drill | Dev B + TwinMOS PM | Month 15, W21 | RTO ≤4h confirmed |
| D-28 | Penetration test + remediation | External + Dev B | Month 15, W22 | Zero Critical/High open |
| D-29 | UAT sign-off | TwinMOS PM + Marketing | Month 15, W22 | UAT sign-off document |
| D-30 | Production go-live | Dev A + Dev B | Month 15, W24 | Real transaction successful |
| D-31 | Phase 3 handoff documentation | TwinMOS PM | Month 15, W24 | Runbook delivered and accepted |

---

## 8. Success Criteria

### 8.1 Go-Live Success Criteria

The following criteria must ALL be met for Phase 3 to be declared successfully launched:

| ID | Criterion | Target | Verification Method |
|---|---|---|---|
| SC-01 | E-commerce live in 4 primary markets | UAE, India, Bangladesh, KSA accepting real orders | First real transaction in each currency |
| SC-02 | International (USD) orders accepted | USD checkout completing | Test transaction in USD |
| SC-03 | 3 new locales active | RU, ZH-CN, FR locale pages fully accessible | URL verification + content spot check |
| SC-04 | PostHog capturing all defined events | 100% event capture rate (measured vs expected) | PostHog event volume vs test sessions |
| SC-05 | Loyalty programme enrolled users | 100+ users enrolled within 30 days post-launch | Medusa admin loyalty report |
| SC-06 | Marketing automation active | Abandoned cart email firing; post-purchase firing | Resend delivery logs |
| SC-07 | PCI SAQ A compliance | No card data in TwinMOS systems; Stripe handling all | SAQ A self-assessment completed |
| SC-08 | Zero Critical/High pen test findings | All Critical/High remediated before go-live | Pen test report sign-off |
| SC-09 | Checkout LCP ≤2.5s | Measured on production via PageSpeed Insights | LCP measurement logged |
| SC-10 | DR drill passed | Database restore completed in ≤4 hours | DR drill report |

### 8.2 30-Day Post-Launch Success Criteria

| ID | Criterion | Target |
|---|---|---|
| SC-11 | Referral programme first conversion | ≥1 referred customer completes first purchase |
| SC-12 | Loyalty tier achieved | ≥5 users reach Silver tier |
| SC-13 | MDF application submitted | ≥1 distributor MDF application received |
| SC-14 | No P1 production incidents | Zero payment processing outages >15 minutes |
| SC-15 | Cart abandonment rate baseline established | Baseline measured in PostHog |

---

## 9. KPIs for Phase 3

### 9.1 Commerce KPIs

| KPI | Target | Measurement Tool | Frequency |
|---|---|---|---|
| Conversion Rate (visit to purchase) | ≥2% | PostHog funnel analysis | Weekly |
| Cart Abandonment Rate | <60% | PostHog | Weekly |
| Checkout Completion Rate | ≥75% of initiated checkouts | PostHog | Weekly |
| Average Order Value (AoV) | Establish baseline in first 30 days | Medusa admin | Weekly |
| Checkout Error Rate | <1% of initiated checkouts | PostHog + Stripe Dashboard | Daily |
| Stripe Payment Success Rate | ≥97% | Stripe Dashboard | Daily |

### 9.2 Platform KPIs

| KPI | Target | Measurement Tool | Frequency |
|---|---|---|---|
| Checkout Page LCP | ≤2.5s | PageSpeed Insights / PostHog | Monthly |
| Checkout Time to Interactive | ≤3s | Lighthouse | Monthly |
| API Error Rate (Medusa) | <0.5% | Coolify logs / PostHog | Daily |
| Webhook Processing Failure Rate | <0.1% | Stripe Dashboard | Daily |
| Uptime (Medusa + Storefront) | ≥99.9% | Coolify uptime monitor | Monthly |

### 9.3 Engagement KPIs

| KPI | Target | Measurement Tool | Frequency |
|---|---|---|---|
| Loyalty Programme Enrollment | 100+ users in 30 days | Medusa loyalty admin | Monthly |
| Loyalty Points Redemption Rate | ≥10% of eligible users redeem within 90 days | Loyalty admin | Monthly |
| Referral Programme Click-Through | ≥50 referral link clicks in 30 days | PostHog | Monthly |
| Referral Conversion Rate | ≥15% of referred clicks convert | PostHog + Medusa | Monthly |
| Abandoned Cart Email Open Rate | ≥20% | Resend analytics | Weekly |
| Abandoned Cart Email Recovery Rate | ≥5% of abandoned carts recovered | Resend + Medusa | Weekly |

### 9.4 Marketing KPIs

| KPI | Target | Measurement Tool | Frequency |
|---|---|---|---|
| HubSpot Contacts Created (new customers) | Growing week-over-week | HubSpot | Weekly |
| Post-Purchase Email Open Rate | ≥25% | Resend analytics | Monthly |
| MDF Applications Submitted | ≥5 in first 90 days | MDF portal admin | Monthly |

---

## 10. Risk Register

### 10.1 Risk Scoring

**Likelihood:** 1 (Rare) — 2 (Unlikely) — 3 (Possible) — 4 (Likely) — 5 (Almost Certain)
**Impact:** 1 (Negligible) — 2 (Minor) — 3 (Moderate) — 4 (Major) — 5 (Critical)
**Risk Score = Likelihood × Impact**

### 10.2 Top 10 Phase 3 Risks

| ID | Risk | Likelihood | Impact | Score | Mitigation |
|---|---|---|---|---|---|
| R-01 | **Stripe account approval delayed** — Stripe merchant verification for UAE/India/KSA takes longer than expected, blocking live payment processing | 3 | 5 | 15 | Initiate Stripe application immediately at Phase 3 kickoff; maintain Stripe test mode for staging; identify backup PSP (PayTabs) if Stripe UAE delayed beyond M10W4 |
| R-02 | **Medusa.js v2 Strapi integration stability** — `medusa-plugin-strapi` compatibility issues with Strapi v5; sync failures or data corruption | 3 | 4 | 12 | Conduct integration spike in M10W1; maintain manual product import fallback; pin plugin versions; set up sync monitoring alerts |
| R-03 | **Shipping API rate limits or outages** — Aramex/FedEx/DHL API unavailable during checkout, breaking shipping method selection | 3 | 4 | 12 | Implement rate caching (15-min TTL); fallback to flat-rate shipping when API fails; circuit breaker pattern; health checks for shipping APIs |
| R-04 | **Translation quality for RU/ZH-CN/FR** — Machine-translated or low-quality content reaches production, damaging brand in new locales | 2 | 4 | 8 | TwinMOS marketing reviews all translated content before import; native-speaker spot check for each locale; soft-launch new locales before indexing for SEO |
| R-05 | **PCI compliance scope creep** — Developer inadvertently logs or stores card-related data (partial card numbers, error responses containing card info) | 2 | 5 | 10 | SAQ A compliance review before go-live; automated log scanning for PCI-sensitive patterns; Dev B trained on Stripe webhook response sanitisation |
| R-06 | **PostHog data volume / storage** — Self-hosted PostHog on Hetzner CX42 runs out of disk space as event volume grows | 3 | 3 | 9 | Set up disk usage monitoring alert at 70%; pre-approve Hetzner CX52 upgrade; configure PostHog data retention policy (90 days session replay, 12 months events) |
| R-07 | **Tax miscalculation in multi-region checkout** — Stripe Tax or TaxJar not correctly applying VAT/GST for specific product categories or regions | 2 | 4 | 8 | Tax configuration testing checklist for each market/product combination; finance team review before go-live; Stripe Tax audit dashboard monitored post-launch |
| R-08 | **Loyalty programme abuse** — Users exploit points system (create multiple accounts, exploit referral for self-referral) | 3 | 3 | 9 | Email uniqueness enforced at Better Auth; referral self-referral detection (same IP + email domain check); points held for 7 days pending fraud review before credited |
| R-09 | **Performance regression post e-commerce** — Adding Medusa API calls slows storefront LCP beyond 2.5s on product and checkout pages | 3 | 3 | 9 | Implement API response caching (product prices, shipping rates); load test in M12; Astro Server Islands for dynamic commerce data; CDN caching for static assets |
| R-10 | **Phase 3 scope creep** — Stakeholder requests for features not in Phase 3 scope (e.g., product reviews, PayPal, B2B quotes) during UAT | 4 | 3 | 12 | Strict change control: all scope change requests require TwinMOS PM approval and go to a Phase 4 backlog; scope boundary document signed at kickoff |

### 10.3 Contingency Plans

| Risk | Contingency |
|---|---|
| R-01 (Stripe delay) | Launch UAE-only with PayTabs as fallback PSP; delay India/KSA until Stripe approved |
| R-02 (Medusa-Strapi) | Manual CSV product import to Medusa; defer plugin sync; Dev B spends sprint on custom sync endpoint |
| R-03 (Shipping API) | Ship with flat-rate shipping table for first 2 weeks; carrier APIs integrated in hotfix release |

---

## 11. Dependencies

### 11.1 External Dependencies

| ID | Dependency | Owner | Required By | Status |
|---|---|---|---|---|
| DEP-01 | Stripe merchant account approved (UAE + India + KSA + International) | TwinMOS Finance + Stripe | Month 10, Week 4 | Action required: Apply immediately |
| DEP-02 | Aramex API credentials (production) | TwinMOS Logistics | Month 11, Week 7 | Action required: Contact Aramex account manager |
| DEP-03 | FedEx API credentials (production) | TwinMOS Logistics | Month 11, Week 7 | Action required: FedEx developer portal registration |
| DEP-04 | DHL API credentials (production) | TwinMOS Logistics | Month 11, Week 7 | Action required: DHL eCommerce developer onboarding |
| DEP-05 | RU/ZH-CN/FR translation files (final) | Translation vendor / TwinMOS Marketing | Month 11, Week 2 | In progress from Phase 2 |
| DEP-06 | HubSpot API key and pipeline configuration | TwinMOS Marketing | Month 13, Week 1 | Action required: HubSpot admin setup |
| DEP-07 | UAE VAT registration number for invoicing | TwinMOS Finance | Month 11, Week 4 | Must be confirmed for correct invoices |
| DEP-08 | KSA VAT registration number | TwinMOS Finance | Month 11, Week 4 | Must be confirmed for KSA market |
| DEP-09 | India GST registration / GSTIN | TwinMOS Finance | Month 11, Week 4 | Required for Indian invoice compliance |
| DEP-10 | Pen test firm engagement | TwinMOS PM | Month 14, Week 4 | Procure by Month 14 start |
| DEP-11 | Backblaze B2 bucket for invoice PDF storage | Dev B | Month 11, Week 8 | New bucket required for invoice archival |
| DEP-12 | TwinMOS loyalty programme rules (tiers, points per unit) | TwinMOS Marketing | Month 13, Week 4 | Decision document required |
| DEP-13 | MDF programme business rules and budget cap | TwinMOS Finance + Marketing | Month 13, Week 4 | Policy document required |
| DEP-14 | Referral reward value and conditions | TwinMOS Marketing | Month 13, Week 4 | Decision document required |

### 11.2 Internal Technical Dependencies

| ID | Dependency | Depends On | Risk if Delayed |
|---|---|---|---|
| IDEP-01 | Loyalty redemption at checkout | Loyalty programme backend complete | Checkout cannot offer points redemption |
| IDEP-02 | Abandoned cart email | HubSpot sync + Resend configured | No abandoned cart recovery |
| IDEP-03 | RU/ZH-CN/FR storefront activation | Strapi locale content imported | New locales not accessible |
| IDEP-04 | MDF portal frontend | Better Auth partner roles configured (Phase 2) | Distributors cannot access MDF portal |
| IDEP-05 | PostHog A/B testing | Feature flags configured | No experimentation capability at launch |

---

## 12. Phase Gate Criteria

Phase 3 will be governed by formal phase gates. Each gate requires TwinMOS PM sign-off before proceeding.

### Gate 1: E-Commerce Staging Ready (End of Month 11)

| Criterion | Pass/Fail |
|---|---|
| Guest checkout completable end-to-end on staging | Pass required |
| Registered checkout completable | Pass required |
| Tax correctly calculated for UAE, India, KSA | Pass required |
| At least 2 shipping carriers returning live rates | Pass required |
| Order confirmation email delivered | Pass required |
| Zero P1 (Blocker) bugs in checkout flow | Pass required |

### Gate 2: E-Commerce Hardened (End of Month 12)

| Criterion | Pass/Fail |
|---|---|
| Load test passed (P95 ≤3s at 200 concurrent) | Pass required |
| All 4 markets tested | Pass required |
| RU/ZH-CN/FR locales live on staging | Pass required |
| RTL checkout verified | Pass required |
| Webhook reliability confirmed (>99.5% delivery) | Pass required |

### Gate 3: Full Phase 3 Feature Complete (End of Month 14)

| Criterion | Pass/Fail |
|---|---|
| PostHog capturing all defined events | Pass required |
| Abandoned cart email operational | Pass required |
| Loyalty programme operational end-to-end | Pass required |
| Referral programme operational end-to-end | Pass required |
| MDF portal operational end-to-end | Pass required |
| HubSpot contact sync operational | Pass required |

### Gate 4: Go-Live (End of Month 15, Week 23)

| Criterion | Pass/Fail |
|---|---|
| Penetration test: zero Critical/High open | Pass required |
| UAT signed off by TwinMOS PM + Marketing | Pass required |
| DR drill passed (RTO ≤4h) | Pass required |
| SAQ A self-assessment completed | Pass required |
| Production environment health checks all green | Pass required |
| Rollback plan documented and tested | Pass required |
| Go-live communication sent to TwinMOS chairman | Pass required |

---

## 13. Sprint Plan Overview

Phase 3 is delivered in **6 sprints of 4 weeks each** (aligned with the monthly breakdown). Each sprint follows a consistent cadence.

### Sprint Cadence

| Event | Frequency | Duration | Participants |
|---|---|---|---|
| Sprint Planning | Start of each month | 2 hours | TwinMOS PM, Dev A, Dev B |
| Daily Standup | Daily (Mon-Fri) | 15 minutes | Dev A, Dev B (async via shared channel) |
| Weekly Status Update | Every Friday | 30 min | TwinMOS PM, Dev A, Dev B |
| Sprint Review / Demo | End of each month | 1.5 hours | TwinMOS PM, Marketing, Dev A, Dev B |
| Sprint Retrospective | End of each month (after review) | 1 hour | Dev A, Dev B, TwinMOS PM |

### Sprint Summary Table

| Sprint | Month | Theme | Key Deliverables |
|---|---|---|---|
| Sprint 1 | Month 10 | E-Commerce Foundation I | Medusa setup, Stripe test, product sync, cart |
| Sprint 2 | Month 11 | E-Commerce Foundation II | Full checkout, tax, shipping, order confirmation |
| Sprint 3 | Month 12 | Hardening + Locales | Load test, bug fix, RU/ZH-CN/FR, RTL |
| Sprint 4 | Month 13 | Analytics + Automation | PostHog, HubSpot, abandoned cart, post-purchase |
| Sprint 5 | Month 14 | Engagement Programmes | Loyalty, referral, MDF portal |
| Sprint 6 | Month 15 | Launch | DR drill, pen test, UAT, go-live, handoff |

### Sprint Velocity Targets

- Dev A: 20-25 story points per sprint (frontend-heavy)
- Dev B: 20-25 story points per sprint (backend-heavy)
- Shared/integration stories: tracked jointly with dual owner

### Bug Triage Protocol

| Severity | Definition | SLA |
|---|---|---|
| P1 — Blocker | Payment failure, data loss, security breach | Fix within 24 hours |
| P2 — Critical | Checkout inaccessible, cart data lost | Fix within 48 hours |
| P3 — Major | Feature broken but workaround exists | Fix within current sprint |
| P4 — Minor | UI cosmetic, non-blocking copy error | Fix in next sprint backlog |

---

## 14. Communication Plan

### 14.1 Routine Communications

| Communication | Audience | Frequency | Channel | Owner |
|---|---|---|---|---|
| Daily async standup | Dev A, Dev B | Daily | WhatsApp / Slack | Devs self-reporting |
| Weekly status report | TwinMOS PM, Chairman (cc) | Weekly (Friday) | Email | TwinMOS PM |
| Sprint review presentation | TwinMOS PM, Marketing, Chairman | Monthly | Video call + shared deck | TwinMOS PM |
| Risk register update | TwinMOS PM | Bi-weekly | Project documentation | TwinMOS PM |
| Milestone completion notice | TwinMOS PM, Chairman | Per milestone | Email | TwinMOS PM |

### 14.2 Escalation Path

```
Developer Issue
      ↓
Dev A / Dev B → resolve within 24h
      ↓ (if unresolved)
TwinMOS PM → 48h resolution window
      ↓ (if unresolved / high-impact)
TwinMOS Chairman / Executive Decision
```

### 14.3 Change Control Process

1. Requester submits **Change Request Form** to TwinMOS PM
2. TwinMOS PM assesses impact (scope, timeline, budget)
3. If change is minor (≤4 hours effort): PM approves unilaterally and updates sprint backlog
4. If change is major (>4 hours or scope change): PM presents to Chairman for approval
5. Approved changes documented in change log; rejected changes go to Phase 4 backlog
6. All scope changes communicated to Dev A and Dev B within 24 hours of decision

### 14.4 Documentation Repository

All project documentation is stored in:
`C:\software_project\TwinMOS\Corporate website development for TwinMOS\project documentation\`

Naming convention: `TwinMOS[DocumentName][Descriptor].md`
Version control: Git repository managed by TwinMOS PM

---

## 15. Sign-Off Table

By signing below, each stakeholder confirms they have read, understood, and agreed to the Phase 3 scope, timeline, responsibilities, and success criteria documented herein.

| Role | Name | Signature | Date |
|---|---|---|---|
| TwinMOS Project Manager | [PM Name] | ___________________ | __________ |
| Dev A — Astro Frontend (Unisoft) | [Dev A Name] | ___________________ | __________ |
| Dev B — Strapi + Medusa Backend (Unisoft) | [Dev B Name] | ___________________ | __________ |
| TwinMOS Marketing Lead | [Marketing Lead Name] | ___________________ | __________ |
| TwinMOS Finance Representative | [Finance Rep Name] | ___________________ | __________ |

---

**Document Control**

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 20 Apr 2026 | TwinMOS PM | Initial draft for review |
| 0.2 | 25 Apr 2026 | TwinMOS PM | Incorporated Dev A/Dev B feedback on timeline |
| 0.3 | 28 Apr 2026 | TwinMOS PM | Risk register expanded; Phase 2 prerequisites added |
| 1.0 | 1 May 2026 | TwinMOS PM | FINAL — approved for kickoff |

---

*TwinMOS Technologies — Corporate Website Phase 3 Kickoff Document*
*Reference: TWN-P3-KICK-2026-001 v1.0 | FINAL | 1 May 2026*
*Classification: Internal — Confidential*
