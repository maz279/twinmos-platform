# TwinMOS Corporate Website — Phase 2 Kick-Off Document

**Document Reference:** TWN-P2-KICKOFF-2027-001  
**Document Version:** 1.0  
**Status:** APPROVED — For team distribution and sponsor sign-off  
**Phase:** Phase 2 — Localization & Partner Enablement  
**Planned Start:** January 2027 (Month 6)  
**Planned End:** April 2027 (Month 9)  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Audience:** TwinMOS Leadership, Unisoft Engineering Team, Marketing, Legal, Partner Ops  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** RFP v3.0, BRD v3.0, URD v3.0, Tech Stack v1.1, Implementation Strategy v3.0

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Marketing Director | (TBC) | _______________ | _________ |
| IT / Technical Lead | (TBC) | _______________ | _________ |
| Legal Counsel | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Dev A (Frontend) | (TBC) | _______________ | _________ |
| Unisoft Dev B (Backend) | (TBC) | _______________ | _________ |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase 2 Scope & Objectives](#2-phase-2-scope--objectives)
3. [Phase 1 Completion Gate](#3-phase-1-completion-gate)
4. [Timeline & Milestones](#4-timeline--milestones)
5. [Team Structure & RACI](#5-team-structure--raci)
6. [Feature Delivery Plan](#6-feature-delivery-plan)
7. [Technical Architecture — Phase 2 Additions](#7-technical-architecture--phase-2-additions)
8. [Localization Strategy](#8-localization-strategy)
9. [Partner Portal Rollout Plan](#9-partner-portal-rollout-plan)
10. [Anti-Counterfeit & RMA Activation](#10-anti-counterfeit--rma-activation)
11. [Gaming & RGB Feature Activation](#11-gaming--rgb-feature-activation)
12. [Dependencies & Blockers](#12-dependencies--blockers)
13. [Risk Register](#13-risk-register)
14. [Budget & Resource Allocation](#14-budget--resource-allocation)
15. [Communication Plan](#15-communication-plan)
16. [Success Criteria & KPIs](#16-success-criteria--kpis)
17. [Phase 2 Sign-Off & Go/No-Go Gate](#17-phase-2-sign-off--gono-go-gate)

---

## 1. Executive Summary

Phase 2 of the TwinMOS Corporate Website project transforms the English-only Phase 1 foundation into a **fully multilingual, partner-enabled, and feature-complete platform**. This phase spans Months 6–9 (January–April 2027) and delivers nine distinct capability areas on top of the Phase 1 live site.

**Phase 2 is the most operationally complex phase of the engagement.** It introduces:

- **9-locale localization** — activating Arabic (RTL), Bengali, and Hindi in Phase 2, with Russian, Chinese-Simplified, and French deferred to Phase 3 per Implementation Strategy v3.0 §11.1
- **Partner Portal** — a fully authenticated distributor/OEM/reseller portal using Better Auth with MFA, watermarked price-list PDFs, marketing asset downloads, and order management visibility
- **Anti-Counterfeit Engine** — serial-number verification system with manufacturing system ingest
- **RMA Workflow** — 7-state machine integrated with Strapi, customer-facing status tracking, and Slack/email notifications
- **Live Chat (Chatwoot)** — self-hosted, multilingual, agent-routed live support widget
- **Compatibility Finder Expansion** — QVL database scaled from top-100 to top-500+ motherboards via Phase 2 bulk import pipeline
- **RGB Visualizer** — WebGL-based interactive 3D module viewer with lighting effect simulation
- **Build Gallery Moderation** — moderator queue and approval/rejection workflow for community build submissions
- **ERP Integration** — product master and pricing sync from TwinMOS ERP system (ADR confirmed in Phase 1 Week 4)

**Target Phase 2 Launch:** April 2027 (Month 9 completion, with Weeks 35–36 reserved for hypercare).

**Budget Reference:** $55,000–$95,000 (per RFP v3.0 Phase 2 allocation).

---

## 2. Phase 2 Scope & Objectives

### 2.1 In-Scope Deliverables

| # | Feature Area | Specification Document | Priority |
|---|--------------|------------------------|----------|
| 1 | Localization — Arabic (RTL), Bengali, Hindi | Tech Stack §11; Content Map §H | P2-P0 |
| 2 | Partner Portal (Better Auth + MFA) | `TwinMOSWebsitePartnerPortalFunctional_Spec.md` | P2-P0 |
| 3 | Watermarked PDF Generation for Price Lists | `TwinMOSWebsiteWatermarkedPDFGeneration_Spec.md` | P2-P0 |
| 4 | Anti-Counterfeit Serial Number Engine | `TwinMOSWebsiteAntiCounterfeitSystem_Spec.md` | P2-P0 |
| 5 | RMA Workflow (7-state machine) | `TwinMOSWebsiteRMAWorkflowSpecification.md` | P2-P0 |
| 6 | Live Chat — Chatwoot self-hosted | Tech Stack §14 | P2-P1 |
| 7 | QVL Ingest Pipeline Expansion | `TwinMOSWebsiteQVLDataIngest_Specification.md` | P2-P1 |
| 8 | Compatibility Finder Algorithm (full) | `TwinMOSWebsiteCompatibilityFinderAlgorithm_Spec.md` | P2-P1 |
| 9 | RGB Visualizer (WebGL) | `TwinMOSWebsiteRGBVisualizerFunctional_Spec.md` | P2-P1 |
| 10 | Build Gallery Moderation | `TwinMOSWebsiteBuildSubmissionModeration_Spec.md` | P2-P1 |
| 11 | ERP Integration (product + pricing sync) | Tech Stack §14.5; BRD §25.1 | P2-P1 |
| 12 | Redis Cache Layer | Tech Stack §6.1 | P2-P2 |
| 13 | MapLibre upgrade (optional) | Tech Stack §13.2 | P2-P3 |
| 14 | News sitemap (Phase 2 SEO) | Tech Stack §12.3 | P2-P2 |
| 15 | Phase 2 reserved page activations | Tech Stack §12.5 (Table rows 1–5) | P2-P2 |

### 2.2 Out-of-Scope for Phase 2

The following items are explicitly deferred to Phase 3 or beyond:
- Russian, Chinese-Simplified, French localization (Phase 3)
- Spanish, Portuguese, German localization (Phase 4 — out of engagement)
- E-commerce / Medusa.js / Stripe (Phase 3)
- Loyalty and Referral Programs (Phase 3)
- MDF (Marketing Development Funds) portal module (Phase 3)
- Session replay / PostHog OSS analytics (Phase 3)
- OC Records Hub, Brand Ambassador pages, RGB Software SDK (Phase 3 conditional)

### 2.3 Phase 2 Strategic Objectives

| Objective | Metric | Target |
|-----------|--------|--------|
| Multilingual reach | Active locales with published content | 4 (EN + AR + BN + HI) |
| Partner self-service adoption | % of distributors using portal monthly | ≥ 60% within 60 days of launch |
| Anti-counterfeit lookup volume | Serial checks per month | Track only (no target set Phase 2) |
| RMA digital submission rate | RMA requests submitted online vs. email | ≥ 50% online by end of Phase 2 |
| Live chat CSAT | Post-chat satisfaction score | ≥ 4.0/5.0 |
| QVL database coverage | Motherboard models with QVL entries | ≥ 500 |

---

## 3. Phase 1 Completion Gate

Phase 2 cannot commence until the following Phase 1 deliverables are confirmed DONE and the Phase 1 launch has entered the hypercare period:

| Gate Item | Owner | Required Status |
|-----------|-------|-----------------|
| Core website (English) live at twinmos.com | Unisoft Dev A + B | LIVE — verified in production |
| Strapi v5 CMS stable with all 16-section content loaded | Dev B | DONE |
| 287 content pages published in Strapi | Marketing | DONE |
| Master SKU reference fully imported (100+ SKUs) | Product team | DONE |
| Phase 1 partner portal login page deployed (stub) | Dev A | DONE |
| Warranty registration form live and routing correctly | Dev A + B | DONE |
| Compatibility Finder (top-100 motherboard MVP) live | Dev A + B | DONE |
| All P0 legal pages published | Legal | DONE |
| CI/CD pipeline stable with pre-commit hooks passing | Dev B | DONE |
| Lighthouse scores ≥ 90 on all page types (production) | Dev A | DONE |
| CRM ADR finalized (HubSpot or Zoho selection) | TwinMOS IT Lead | DONE |
| ERP system audit completed (system identified, API documented) | TwinMOS IT Lead | DONE |
| Better Auth library GA status verified (TRISK-8 resolved) | Dev B | DONE |
| Translation vendor selected and XLIFF workflow tested | Marketing | DONE |
| Phase 1 Hypercare complete (Weeks 19–20 post-launch) | PM | DONE |

**Go / No-Go meeting:** Scheduled for end of Month 5 (Week 20). All items above must be GREEN before Phase 2 sprint planning begins.

---

## 4. Timeline & Milestones

### 4.1 Phase 2 Calendar (January 2027 – April 2027)

| Month | Weeks | Sprint Focus | Key Milestones |
|-------|-------|--------------|----------------|
| **Month 6** (Jan 2027) | W21–24 | Sprint 6A: Localization foundation + Partner Portal auth | AR/BN/HI locale routes activated; Better Auth deployed; Partner Portal login live (MFA) |
| **Month 7** (Feb 2027) | W25–28 | Sprint 6B: Partner Portal features + Anti-Counterfeit | Partner Dashboard, Price List PDF, Marketing Assets; Anti-Counterfeit engine live |
| **Month 8** (Mar 2027) | W29–32 | Sprint 7: RMA + Chatwoot + QVL expansion | RMA workflow live; Live chat widget deployed; QVL pipeline (500+ boards) operational |
| **Month 9** (Apr 2027) | W33–36 | Sprint 8: RGB Visualizer + Build Moderation + ERP + P2 launch hardening | RGB Visualizer live; Build Gallery moderation active; ERP sync stable; Phase 2 go-live |

### 4.2 Key Milestones

| Date | Milestone | Owner |
|------|-----------|-------|
| Jan 3, 2027 | Phase 2 Kick-Off meeting — this document signed off | PM |
| Jan 10, 2027 | Dev environments updated with Phase 2 dependencies | Dev A + B |
| Jan 17, 2027 | Better Auth deployed to staging; partner login testable | Dev B |
| Jan 24, 2027 | Arabic RTL routes live in staging; RTL QA begins | Dev A |
| Feb 7, 2027 | Partner Portal features complete in staging | Dev A + B |
| Feb 14, 2027 | Anti-Counterfeit engine UAT with manufacturing team | Product + TwinMOS IT |
| Mar 7, 2027 | RMA workflow UAT with Support team | Support + Dev B |
| Mar 14, 2027 | Chatwoot live in staging; agent training begins | Dev B + Support Ops |
| Mar 21, 2027 | QVL bulk import (500 boards) validated | Product team |
| Apr 4, 2027 | RGB Visualizer + Build Moderation feature-complete | Dev A |
| Apr 11, 2027 | Phase 2 full regression testing complete | QA |
| Apr 18, 2027 | Phase 2 soft-launch (partner portal + anti-counterfeit) | PM |
| Apr 25, 2027 | Phase 2 full public launch | PM + Marketing |

### 4.3 Sprint Capacity

| Resource | Phase 2 Allocation | Notes |
|----------|--------------------|-------|
| Dev A (Frontend — Astro/React) | Full time (4 months × ~2 weeks/sprint) | RTL CSS, Better Auth UI, RGB WebGL, Build Gallery UI |
| Dev B (Backend — Strapi/Node) | Full time (4 months × ~2 weeks/sprint) | Better Auth backend, RMA state machine, anti-counterfeit, QVL pipeline, ERP integration |
| TwinMOS Marketing | 8 hrs/week | Translation review, content approval, partner portal UAT |
| TwinMOS IT Lead | 4 hrs/week | ERP API access, manufacturing data liaison, security sign-offs |
| TwinMOS Support Ops | 4 hrs/week | RMA workflow UAT, Chatwoot agent training |
| Translation Vendor | TBD | AR/BN/HI translation of ~200 priority pages |

**TRISK-21 note:** Upper-bound Phase 2 effort estimate is ~35 person-weeks. Phase 2 over-allocation risk is tracked in Tech Stack §28 as TRISK-21. Mitigation: MapLibre upgrade and MDF portal deferred; Phase 2 reserved pages (items 1–5 in §12.5) activated on-demand only.

---

## 5. Team Structure & RACI

### 5.1 Core Team

| Role | Person | Company |
|------|--------|---------|
| Project Manager | (TBC) | TwinMOS / Unisoft |
| Lead Frontend Dev (Dev A) | (TBC) | Unisoft |
| Lead Backend Dev (Dev B) | (TBC) | Unisoft |
| Marketing Lead | (TBC) | TwinMOS |
| IT / Technical Lead | (TBC) | TwinMOS |
| Support Operations Lead | (TBC) | TwinMOS |
| Legal Counsel | (TBC) | TwinMOS |
| Translation Vendor PM | (TBC) | External |

### 5.2 RACI Matrix — Phase 2 Key Activities

| Activity | Sponsor | PM | Dev A | Dev B | Marketing | IT Lead | Support |
|----------|---------|-----|-------|-------|-----------|---------|---------|
| Localization routing (AR/BN/HI) | I | A | R | C | I | I | I |
| RTL CSS / layout verification | I | A | R | I | C | I | I |
| Translation vendor coordination | I | A | C | I | R | I | I |
| Translation QA (native review) | I | C | I | I | R | I | I |
| Better Auth backend setup | I | A | C | R | I | C | I |
| Partner Portal UI | I | A | R | C | C | I | I |
| Watermarked PDF generation | I | A | C | R | C | I | I |
| Anti-Counterfeit engine | I | A | C | R | I | C | I |
| Manufacturing data ingest (CSV) | I | C | I | R | I | R | I |
| RMA workflow (Strapi state machine) | I | A | C | R | I | I | C |
| RMA UAT | I | A | I | C | I | I | R |
| Chatwoot deployment | I | A | C | R | I | C | I |
| Chatwoot agent training | I | A | I | I | I | I | R |
| QVL bulk import pipeline | I | A | I | R | I | C | I |
| QVL data preparation (500 boards) | I | C | I | C | I | R | I |
| RGB Visualizer (WebGL) | I | A | R | I | C | I | I |
| Build Gallery moderation system | I | A | R | C | C | I | I |
| ERP integration | I | A | I | R | I | R | I |
| Phase 2 QA / Lighthouse CI | I | A | C | C | I | I | I |
| Phase 2 launch approval | R | C | I | I | C | I | I |

---

## 6. Feature Delivery Plan

### 6.1 Sprint 6A — Localization Foundation + Partner Auth (Jan 2027)

**Dev A deliverables:**
- Activate `ar`, `bn`, `hi` Astro i18n locale routes
- Implement RTL layout using Tailwind `rtl:` modifiers + `dir="rtl"` on `<html>` for Arabic
- Noto Sans Arabic / Noto Sans Bengali / Noto Sans Devanagari font loading
- Partner Portal login page (Better Auth UI integration)
- Locale switcher island updated for Phase 2 locales

**Dev B deliverables:**
- Deploy Better Auth `^1.x` to Hetzner; configure `sessions_*` schema in PostgreSQL
- TOTP MFA enforcement for distributor accounts
- Strapi partner role expansion: `Partner Marketing` + `Partner Procurement` roles per §5.3
- Translation CSV export workflow tested with translation vendor

**QA gate:** Arabic homepage passes WCAG 2.1 AA in RTL; Partner login form with MFA works end-to-end in staging.

### 6.2 Sprint 6B — Partner Portal Features + Anti-Counterfeit (Feb 2027)

**Dev A deliverables:**
- Partner Dashboard UI (order summary, notifications, account summary)
- Marketing Assets download page (role-gated)
- Price List page (watermarked PDF generation trigger)
- Training Resources page (certification tracking UI)

**Dev B deliverables:**
- Watermarked PDF generation service (Puppeteer-based; embeds partner name + date + session token)
- Anti-Counterfeit Strapi `valid_serials` collection + daily CSV ingest job
- Serial Number Check API endpoint (`/api/v1/serial/check`)
- Rate limiting (5 lookups/IP/min + Turnstile after 3)
- CounterfeitReport collection + legal queue routing

**QA gate:** Partner with `Procurement` role can download watermarked PDF price list; serial check returns correct response classes.

### 6.3 Sprint 7 — RMA + Chatwoot + QVL Expansion (Mar 2027)

**Dev A deliverables:**
- RMA submission form (`<RMARequest />` React island)
- RMA status tracking page (customer-facing; `/support/rma/status?rma=...`)
- Live Chat widget (`<ChatwootWidget />` island, lazy-loaded)

**Dev B deliverables:**
- RMA 7-state machine in Strapi (`RMARequest` collection + lifecycle hooks)
- Customer + Slack + audit notifications for each RMA state transition
- Chatwoot self-hosted deployment on Hetzner via Coolify
- QVL bulk import pipeline (CSV → Strapi `Compatibility` collection)
- Redis cache layer activation via Coolify

**QA gate:** RMA submission → Approved → Ship → Received → Replacement Shipped → Closed full journey tested; Chatwoot agent can respond to live chat in English and Arabic.

### 6.4 Sprint 8 — RGB, Build Gallery, ERP, Launch Hardening (Apr 2027)

**Dev A deliverables:**
- RGB Visualizer WebGL component (Three.js; phase-gated from P1 static showcase to P2 interactive)
- Build Gallery moderation admin view in Strapi
- Build submission form → moderation queue workflow

**Dev B deliverables:**
- ERP integration: daily batch + on-demand webhook (SKU master + pricing sync to Strapi)
- News sitemap (`/sitemap-news.xml`) generation
- Phase 2 reserved page activations per BRD §35A triggers received from Marketing
- Phase 2 regression testing + Lighthouse CI gate

**QA gate:** Full Lighthouse ≥ 90 regression on all 9 locales; partner portal end-to-end UAT signed off by TwinMOS Marketing.

---

## 7. Technical Architecture — Phase 2 Additions

### 7.1 New Services Activated in Phase 2

| Service | Phase 1 State | Phase 2 State |
|---------|--------------|--------------|
| Better Auth | Not deployed | Deployed on Hetzner; `sessions_*` DB schema active |
| Chatwoot | Not deployed | Self-hosted on Hetzner CX42 via Coolify |
| Redis | Not deployed | Added to Hetzner VPS via Coolify; Strapi cache enabled |
| Watermarked PDF Service | Not deployed | Puppeteer-based Node.js service on Hetzner |
| ERP Sync Worker | Not deployed | Strapi `ERPSyncJob` cron + webhook receiver |
| `valid_serials` MeiliSearch index | Empty | Populated by daily manufacturing ingest |
| `compatibility` MeiliSearch index | 100 boards | Expanded to 500+ boards |

### 7.2 Phase 2 Infrastructure Spec

| Component | Phase 1 | Phase 2 |
|-----------|---------|---------|
| Hetzner VPS tier | CX32 | CX32 → **CX42 upgrade** (triggered by Chatwoot + Redis memory requirements) |
| PostgreSQL DBs | `strapi`, `plausible` | + `sessions` (Better Auth), `chatwoot` |
| Memory headroom | ~6 GB used of 8 GB | CX42 = 16 GB RAM; comfortable headroom |
| Cloudflare Pages | Static (English only) | + `ar/`, `bn/`, `hi/` routes (~1,548 additional routes) |

### 7.3 Updated Data Flow — Partner Portal

```
Partner User → Astro /partner/login (React island)
    → POST /api/auth/login → Better Auth (Hetzner)
    → Password check → TOTP MFA challenge
    → Session created in `sessions_*` DB
    → HttpOnly cookie __Host-twinmos-session set
Partner User → /partner/dashboard (Astro Server Island)
    → Validates session cookie
    → Strapi API call (Authorization: Bearer partner_jwt)
    → RBAC check: role = Distributor | OEM | Reseller
    → Returns role-scoped data (price list, assets, orders)
```

---

## 8. Localization Strategy

### 8.1 Locale Activation Sequence (Phase 2)

| Locale | Code | Script | Direction | Priority Pages |
|--------|------|--------|-----------|----------------|
| Arabic | `ar` | Arabic | **RTL** | Homepage, Products top-20 SKUs, Support, Contact, About |
| Bengali | `bn` | Bengali | LTR | Homepage, Products top-20 SKUs, Support, Contact |
| Hindi | `hi` | Devanagari | LTR | Homepage, Products top-20 SKUs, Support, Contact |

**Full-site translation target:** All 287 content pages by Phase 2 end for AR; top-100 priority pages for BN/HI. Remaining pages display English fallback with locale switcher note.

### 8.2 Translation Pipeline

```
Strapi content (EN) → CSV/XLIFF export via strapi-plugin-import-export-entries
    → Translation vendor (native speaker: AR / BN / HI)
    → TwinMOS regional team review (content accuracy + brand tone)
    → Approved XLIFF/CSV re-import → Strapi locale variant published
    → Astro rebuild → Cloudflare Pages deploy
```

**Estimated translation volume:** ~80,000 source words for Phase 2 priority pages.

### 8.3 RTL-Specific Engineering Checklist

| Layer | Implementation | Owner |
|-------|----------------|-------|
| HTML direction | `<html dir="rtl" lang="ar">` set per route | Dev A |
| Tailwind RTL | `rtl:` modifier used on all directional utilities | Dev A |
| Logical CSS properties | `margin-inline-start` replaces `margin-left` throughout | Dev A |
| Chevron / arrow icons | `transform: scaleX(-1)` via CSS | Dev A |
| Floating UI | Placement props swapped for dropdowns/tooltips | Dev A |
| Typography | Noto Sans Arabic subset loaded | Dev A |
| Number formatting | `Intl.NumberFormat('ar-EG')` with Western digits default for specs | Dev A |
| LTR fragments inside RTL | `<span dir="ltr">` wrapping for SKUs, URLs, emails, brand names | Dev A |
| Forms | `text-align: start` applied (auto-flips per direction) | Dev A |
| Tables | `dir="rtl"` cascade tested | Dev A |
| Hreflang tags | `ar` added to all existing hreflang sets | Dev A |

---

## 9. Partner Portal Rollout Plan

### 9.1 Rollout Phases

| Stage | Scope | Timeline |
|-------|-------|----------|
| **Alpha** | TwinMOS internal team (5 accounts) | Feb 7–14, 2027 |
| **Closed Beta** | Top 10 distributors (UAE, India, Bangladesh) | Feb 14–28, 2027 |
| **Soft Launch** | All current active distributors (50+ accounts) | Mar 7, 2027 |
| **Full Launch** | Public partner signup workflow enabled | Apr 2027 |

### 9.2 Partner Onboarding Communication

- One-page PDF quick-start guide (produced by Marketing)
- 30-minute onboarding webinar per region (UAE, India, Bangladesh)
- Partner support hotline for Phase 2: partner-support@twinmos.com (Sunday–Thursday 9AM–6PM GST)

---

## 10. Anti-Counterfeit & RMA Activation

### 10.1 Anti-Counterfeit Activation Requirements

Before going live, the manufacturing team must provide:
- [ ] CSV export of all valid serial numbers (estimated 200,000–500,000 records)
- [ ] Definition of serial number format/regex pattern
- [ ] Agreement on daily ingest cadence (nightly 03:00 UTC recommended)
- [ ] Legal team sign-off on `SUSPECTED_COUNTERFEIT` response language
- [ ] Contact email for counterfeit reports escalated beyond 5-day SLA

### 10.2 RMA Activation Requirements

Before going live, the Support team must:
- [ ] Define RMA reference number format (e.g., `TWN-RMA-2027-XXXXXX`)
- [ ] Confirm email templates for each of the 7 state transitions (see RMA Workflow Spec)
- [ ] Assign Slack channel for RMA notifications (`#support-rma`)
- [ ] Train support agents on Strapi RMA admin view
- [ ] Set SLA targets per RMA state (documented in RMA Workflow Spec §6)

---

## 11. Gaming & RGB Feature Activation

### 11.1 RGB Visualizer

- Phase 1 delivered a **static RGB showcase** page (content already live)
- Phase 2 upgrades to a **WebGL 3D interactive visualizer** (`<RGBVisualizer />` React island)
- Asset requirements (from Marketing before Sprint 8):
  - [ ] VOLTX DDR5 RGB module 3D model in GLTF/GLB format (or approved 2D sprites)
  - [ ] 10 lighting effect video loops (5s WebM + MP4 fallback, 1920×1080)
  - [ ] Approval of WebGL colour accuracy against real module photography

### 11.2 Build Gallery

- Phase 1 delivered the Build Gallery static page and submission form (content live)
- Phase 2 activates:
  - Submission moderation queue in Strapi admin
  - Email notifications for submission status
  - Approved build publication workflow
  - First community builds targeted for live gallery by end of Sprint 7

---

## 12. Dependencies & Blockers

| Dependency | Owner | Required By | Status |
|------------|-------|-------------|--------|
| Better Auth `^1.x` confirmed GA (TRISK-8) | Dev B | Jan 10, 2027 | Monitor |
| Hetzner CX32 → CX42 upgrade approved | TwinMOS IT | Jan 17, 2027 | Pending |
| Manufacturing system API / CSV format documented | TwinMOS IT + Procurement | Feb 1, 2027 | Pending |
| ERP system identified + API docs received | TwinMOS IT | Feb 7, 2027 | Pending |
| Translation vendor contracted + XLIFF workflow tested | Marketing | Jan 17, 2027 | Pending |
| Top-10 distributor accounts created in Better Auth (beta) | TwinMOS Marketing | Feb 7, 2027 | Pending |
| 500 QVL board entries prepared as CSV | TwinMOS Product team | Mar 7, 2027 | Pending |
| VOLTX 3D module GLTF asset approved | Marketing + Design | Apr 1, 2027 | Pending |
| Chatwoot agent accounts created + routing rules configured | Support Ops | Mar 14, 2027 | Pending |
| Legal review of anti-counterfeit response language | Legal | Feb 7, 2027 | Pending |

---

## 13. Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| P2-R01 | Better Auth `^1.x` not GA by Jan 2027 (TRISK-8) | Medium | High | Pin to latest RC; evaluate Lucia Auth v3 as fallback; decision by Jan 10 |
| P2-R02 | ERP API not available / poorly documented | Medium | High | Phase 2 launches with Strapi-only product master; ERP integration slips to Phase 3 |
| P2-R03 | Coolify v4 → v5 migration during Phase 2 (TRISK-22) | Low | High | Stay on Coolify v4 for Phase 2; v5 upgrade post-Phase 3 launch |
| P2-R04 | Translation vendor delays for AR/BN/HI | Medium | Medium | Pre-translate top-50 priority pages in Sprint 6A; fallback to EN for remaining pages |
| P2-R05 | Manufacturing CSV schema incompatible with Strapi import | Medium | Medium | Dev B validates format in Sprint 6B before full import |
| P2-R06 | RTL layout regressions in Phase 1 English pages | Medium | Medium | Lighthouse CI + RTL smoke tests run against all English routes after RTL CSS changes |
| P2-R07 | Chatwoot agent staffing insufficient for 4-language support | Medium | Medium | Phase 2 launch with English-only agents; AR/BN/HI escalation to email fallback |
| P2-R08 | WebGL RGB Visualizer performance on mobile devices | Low | Medium | Detect device capability; fall back to static carousel for mobile and low-powered devices |
| P2-R09 | Phase 2 effort exceeds 35 person-weeks (TRISK-21) | Medium | High | De-scope MapLibre upgrade + MDF portal; escalate to PM week 2 if behind schedule |
| P2-R10 | QVL data not available for 500+ boards by Sprint 7 | Medium | Low | Finder continues to operate on Phase 1 (100 boards) data; expanded dataset added when ready |

---

## 14. Budget & Resource Allocation

### 14.1 Phase 2 Budget Reference

| Budget Line | Estimate | Source |
|-------------|----------|--------|
| Development (Unisoft — 2 devs × 4 months) | $40,000–$60,000 | RFP v3.0 Phase 2 allocation |
| Translation (AR/BN/HI — 80K words) | $8,000–$18,000 | $0.10–$0.22/word (market rate) |
| Infrastructure upgrade (CX32 → CX42) | $24/month | Hetzner pricing (EUR ~€22) |
| Chatwoot hosting (additional resource) | Included in Hetzner upgrade | — |
| Translation tools / XLIFF tooling | $0–$2,000 | Open-source preferred |
| QA and testing tools (Phase 2 addons) | $0 (existing CI) | — |
| **Total Phase 2 Budget** | **$55,000–$95,000** | RFP v3.0 |

### 14.2 Infrastructure Cost Change

| Component | Monthly Cost (Phase 1) | Monthly Cost (Phase 2) |
|-----------|----------------------|----------------------|
| Hetzner CX32 | ~$13/mo | Upgrade to **CX42 ~$25/mo** |
| Cloudflare Pages | Free (< 500k builds/mo) | Free |
| Backblaze B2 (increased storage) | ~$2/mo | ~$5/mo (more assets) |
| Resend (increased email volume) | Free (< 3K/mo) | $20/mo Pro (10K+) |
| Plausible | $9/mo (self-hosted) | $9/mo |
| Sentry | Free (developer tier) | Free |
| **Phase 2 Monthly Infra Total** | ~$34/mo | ~$60/mo |

---

## 15. Communication Plan

### 15.1 Regular Meetings

| Meeting | Cadence | Attendees | Purpose |
|---------|---------|-----------|---------|
| Sprint Planning | Bi-weekly (start of sprint) | Dev A, Dev B, PM, Marketing | Prioritize backlog; confirm sprint goals |
| Sprint Demo | Bi-weekly (end of sprint) | Dev A, Dev B, PM, Marketing, IT Lead | Demo completed features in staging |
| Weekly Status | Weekly | PM + Sponsors | Project health, blockers, budget |
| Phase 2 Kick-Off | Once (Jan 3, 2027) | All stakeholders | This document reviewed and signed |
| Phase 2 Go-Live Planning | Apr 14, 2027 | PM + Marketing + Sponsors | Final go-live checklist review |

### 15.2 Communication Channels

| Channel | Purpose |
|---------|---------|
| Slack #twinmos-website-p2 | Day-to-day updates, code review alerts, CI notifications |
| Slack #twinmos-support-rma | RMA state-change notifications (Phase 2 activation) |
| Slack #twinmos-ops | Infrastructure alerts, ERP sync failures, counterfeit flags |
| Email | Formal sign-off, vendor communication, distributor onboarding |
| GitHub Issues + Milestones | Feature tracking, bug reports, sprint planning |
| Loom / Zoom | Sprint demos, stakeholder presentations |

---

## 16. Success Criteria & KPIs

### 16.1 Technical KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Lighthouse Performance (all locales) | ≥ 90 | Lighthouse CI in GitHub Actions |
| LCP (all pages, all locales) | ≤ 1.8 s (target) / 2.5 s (max) | Web Vitals field data (Plausible) |
| RTL layout issues at launch | 0 critical, ≤ 5 minor | Manual QA + axe-core |
| Partner Portal login success rate | ≥ 99% (no false lockouts) | Sentry + Better Auth logs |
| Anti-counterfeit API response time | < 200 ms p99 | Sentry performance |
| RMA form submission success rate | ≥ 99% | Sentry |
| Phase 2 build time (Cloudflare Pages) | < 5 minutes | CI logs |

### 16.2 Business KPIs

| KPI | Target | Measurement Method |
|-----|--------|--------------------|
| Multilingual sessions (AR/BN/HI) | ≥ 15% of total sessions within 60 days | Plausible locale breakdown |
| Partner Portal active monthly users | ≥ 60% of registered distributors | Better Auth session analytics |
| Watermarked PDF downloads per month | Track only | Strapi download log |
| Anti-counterfeit lookups per month | Track only | API access log |
| Online RMA submission rate | ≥ 50% of all RMAs | Strapi RMARequest stats |
| Live Chat CSAT | ≥ 4.0 / 5.0 | Chatwoot built-in CSAT survey |
| Build Gallery submissions (monthly) | ≥ 10 | Strapi BuildSubmission count |

---

## 17. Phase 2 Sign-Off & Go/No-Go Gate

### 17.1 Phase 2 Launch Go/No-Go Checklist

Before the April 25, 2027 Phase 2 public launch, the following must be confirmed:

**Technical:**
- [ ] All Phase 2 features deployed and stable in production for ≥ 48 hours
- [ ] Lighthouse ≥ 90 on all key pages across EN/AR/BN/HI
- [ ] RTL layout: no WCAG 2.1 AA failures on Arabic pages
- [ ] Partner Portal: end-to-end UAT signed off by TwinMOS Marketing
- [ ] Anti-Counterfeit: manufacturing team has validated 100 test serials
- [ ] RMA workflow: full journey test (Submitted → Closed) passed in production
- [ ] Chatwoot: agents trained and online for business-hour coverage
- [ ] ERP sync: one full cycle completed without errors (or formally deferred to Phase 3)
- [ ] Redis cache: Strapi response times stable under staging load test
- [ ] OWASP ZAP scan completed; no Critical or High findings unresolved

**Content:**
- [ ] Arabic homepage, product top-20, support pages published and reviewed by native speaker
- [ ] Bengali and Hindi top-100 priority pages translated and published
- [ ] All hreflang tags verified by screaming-frog crawl

**Compliance:**
- [ ] DPA/GDPR consent mechanisms verified for 4 active locales
- [ ] UAE PDPL, India DPDP, KSA PDPL privacy notices updated for AR/BN/HI pages
- [ ] Legal review of anti-counterfeit response language complete
- [ ] Better Auth session cookie meets GDPR cookie requirements

**Partner Operations:**
- [ ] All existing distributors notified of Partner Portal launch (email campaign)
- [ ] Partner Portal quick-start guide distributed
- [ ] Partner support email alias (partner-support@twinmos.com) monitored and staffed

### 17.2 Final Sign-Off

| Approver | Role | Signature | Date |
|----------|------|-----------|------|
| (TBC) | IT / Technical Lead | _______ | _____ |
| (TBC) | Marketing Lead | _______ | _____ |
| (TBC) | Unisoft Team Lead | _______ | _____ |

---

*Phase 2 Kick-Off Document v1.0 | TwinMOS Technologies | January 2027*  
*Synchronized with: RFP v3.0 · BRD v3.0 · URD v3.0 · Tech Stack v1.1 · Implementation Strategy v3.0*
