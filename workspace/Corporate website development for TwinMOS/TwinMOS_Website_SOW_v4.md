# Statement of Work (SOW) — TwinMOS Corporate Website Development
## v4.0 Supersession of RFP v3.0 (Solo-Developer Engagement)

**Document Reference:** TWN-SOW-2026-001
**Document Version:** 4.0 (Solo-Developer Edition — Supersedes RFP v3.0)
**Status:** FINAL — for TwinMOS Internal Engagement
**Date:** 2 May 2026
**Issuing Entity:** TwinMOS Technologies Middle East FZE
**Prepared by:** TwinMOS Digital Transformation Team
**Classification:** CONFIDENTIAL — TwinMOS Internal Use
**Synchronized With:** BRD v3.0 (v3.2 patches applied), URD v3.1, Tech Stack v1.2, Implementation Roadmap v2.2 (15-Phase), Content Map v1.0 (v1.1 pending), `_master-sku-reference.md`, Forensic Alignment Audit v3.0, Company Profile v2.0

---

## 1. Supersession Notice

This SOW supersedes [TwinMOS_Website_RFP.md v3.0](TwinMOS_Website_RFP.md) for procurement purposes. Per Forensic Alignment Audit v3.0 §3 Decision 1A (sponsor-confirmed 2 May 2026), the project is delivered by **a single solo full-stack developer × 18–24 months** rather than a vendor agency. The legacy v3.0 RFP is retained in the document tree for historical context but is no longer authoritative for engagement scope, budget, procurement timeline, or vendor evaluation.

The following v3.0 RFP sections are formally **superseded**:

| RFP v3.0 Section | Status | Superseded By |
|------------------|--------|---------------|
| §1 Executive Summary (vendor framing) | Superseded | This SOW §2 |
| §6.1 Technology Stack Preferences (Next.js/Contentful/Algolia/Vercel) | Superseded | Tech Stack v1.2 §1.1 |
| §13 Implementation Plan (Week 1–26 milestone table with Week 18 launch) | Superseded | Implementation Roadmap v2.2 (Weeks 1–80+ across 15 phases) |
| §14 Vendor Selection Criteria | Removed | n/a (no vendor) |
| §15 Budget Guidance ($179K-$333K Phase 1) | Superseded | This SOW §5 (single-resource cost model) |
| §16 Proposal Submission Requirements (NDA, Q&A, 12 docs, 50-page proposal, 6-step evaluation, disqualification) | Removed | n/a (no proposal cycle) |
| Appendix C "64 Critical Issues" arithmetic errors | Patched | This SOW §A1 |
| §3.1 / §11.2 various inconsistencies | Patched | This SOW §A1 |

The following v3.0 RFP sections are **retained** as authoritative inputs to this SOW:

- §2 Brand & Product-Line Architecture (with v3.1 patch consolidating 18 rows → 11 master brand-lines)
- §3.1 Forensic Audit Summary (with arithmetic patches)
- §4 Project Vision & Phased Approach (4-phase month-grouping retained as product/market view)
- §5 Personas (with v3.1 patch adding 6 missing personas to bring total to 11)
- §7 Brand & Design Direction
- §8 Functional Requirements (RFP-FR-1 through RFP-FR-18)
- §9 Content Inventory (287 entries, 100+ SKUs, 16 sections)
- §10 SEO & Performance Standards
- §11 Security & Compliance Requirements (with KSA PDPL added)
- §12 Multi-Region & Localization (9 active locales; 10 with EN; ES/PT/DE in-scope per Decision 5A)
- §17 Appendix B IA tree (16 sections)

---

## 2. Engagement Summary

TwinMOS Technologies engages a **single solo full-stack developer** (40 h/week) to design, develop, and deploy a tier-1 corporate website over **18–24 months** across **15 sequential phases** (Implementation Roadmap v2.2). The website covers all 287 content entries across 16 sections, 100+ SKU detail pages, 28 regional landings, 34 legal pages, **10 active locales by end of engagement** (EN, AR, BN, HI, RU, ZH-CN, FR, ES, PT, DE per Decision 5A), 15 form types, all application surfaces (catalog, compatibility finder, where-to-buy locator, partner portal, RMA 7-state workflow, anti-counterfeit SN-Check, gaming hub, e-commerce), and quality gates (Lighthouse ≥90 perf / ≥95 a11y/BP/SEO, **WCAG 2.2 AA** per Decision 6A, OWASP ZAP, third-party penetration test).

### 2.1 Engagement Profile

| Attribute | Value |
|-----------|-------|
| Engagement type | Internal SOW (no external agency) |
| Resource | 1 solo full-stack developer |
| Capacity | 40 h/week × ~80–95 weeks = ~3,200–3,800 person-hours |
| Workstation | Linux desktop with all-local development (PostgreSQL 16 + Strapi v5 + Astro 5 + Vite + MeiliSearch local; deploy to TwinMOS own cloud server origin behind Cloudflare DNS/WAF/CDN edge per Decision 2B) |
| Project kickoff | 24 July 2026 |
| Phase 1 public launch | Feb–Mar 2027 (Roadmap Phase 8 Weeks 29–32 per Decision 4A) |
| Phase 2 (BRD scope) launch | Jun 2027 (Roadmap Phase 12 Weeks 45–48) |
| Phase 3 (BRD scope) launch | Jan 2028 (Roadmap Phase 14 Weeks 65–79) |
| Phase 15 closeout (Loyalty / Referral / ES/PT/DE / Handover) | From Jan 2028 onwards (Roadmap Phase 15 Weeks 80+) |
| Phase 4 retainer | Post-handover ongoing |

### 2.2 Deliverables

Per Implementation Roadmap v2.2:
- 15 Phase Gate Reviews signed by stakeholders
- 150 Milestones (10 per phase) signed individually
- ~600 Tasks completed and demoed bi-weekly
- 8 ADRs signed (Stack / Repos / Build Pipeline / React 19 / HubSpot / Cookie Consent / E-Commerce / Node 24 LTS Migration)
- All quality gates met (Lighthouse, WCAG 2.2 AA, OWASP ZAP, pen-test)
- Phase 1 / 2 / 3 launches per schedule
- Knowledge transfer + documentation handover at Phase 15 closeout

---

## 3. Solo-Developer Operating Model

### 3.1 Workstation & Local Stack

- Linux desktop workstation with Node.js 22 LTS (migrated to Node.js 24 LTS in Phase 13 per ADR-008)
- pnpm package manager
- Local PostgreSQL 16 + Strapi v5 + Astro 5 + Vite + MeiliSearch
- VS Code with Astro / Strapi / Tailwind / ESLint / Prettier extensions
- Chrome with DevTools for browser preview and Lighthouse audits

### 3.2 Repository Structure (per Decision 3A)

Two-repo architecture per Roadmap T-1.1.02:
- `twinmos-website-frontend` (Astro 5 + React 19 islands + Tailwind CSS 4)
- `twinmos-website-backend` (Strapi v5 + PostgreSQL 16 + plugins)

Solo dev maintains both repos. Cross-cutting changes coordinated via shared TypeScript types repo (deferred to Phase 2 per ADR-008 in Tech Stack §3.2).

### 3.3 Cadence

- **40 h/week capacity** with bi-weekly TwinMOS PM demos (24-hour decision turnaround commitment)
- **Daily commits** to both repos (continuity and capacity-risk mitigation)
- **Weekly status report** to TwinMOS Sponsor and IT Lead
- **Phase Gate Reviews** at end of each of 15 phases — sign-off required before next phase

### 3.4 Solo-Developer Risk Mitigation

Per Roadmap Risk Register R-01 / R-02:
- M1.8.03: Developer absence ≥ 2-week contingency plan documented
- Daily commits ensure continuity if developer unavailable
- Detailed ADRs mean any successor can pick up the codebase
- TwinMOS escalation contact identified at engagement start
- AI-assisted development (Copilot or Claude) used as productivity multiplier

---

## 4. Hosting & Infrastructure (per Decision 2B)

### 4.1 Production Origin

**TwinMOS-owned Linux Virtual Machine** (single VM for Phases 1–12 baseline; upgraded for Phase 13 e-commerce + PostHog OSS load):

| Phase | vCPU | RAM | Storage | Workloads |
|-------|------|-----|---------|-----------|
| Phases 1–12 | 4 | 16 GB | 100 GB SSD | Astro static + Strapi + PostgreSQL 16 + MeiliSearch + ImgProxy + Resend webhook + Sentry agent |
| Phase 13+ (upgrade) | 8 | 32 GB | 500 GB SSD | + Chatwoot self-hosted + PostHog OSS self-hosted + Medusa.js (if ADR-007 picks Medusa) |
| Phase 15+ (optional second VM) | 4 | 16 GB | 100 GB SSD | Optional separate VM for Chatwoot/PostHog isolation (per Tech Stack §14.1) |

### 4.2 Cloudflare Edge (front of TwinMOS origin per Decision 2B)

- **DNS** — twinmos.com nameservers on Cloudflare
- **WAF** — OWASP rule sets + custom rules (rate limiting, bot protection, geo-restriction if needed)
- **CDN** — edge caching for static assets, HTML for Astro static pages
- **DDoS protection** — Cloudflare's standard mitigation
- **cf-ipcountry header** — used for IP-geolocation per RFP-FR-12.1 (regional landing auto-detect)
- **NOT used for compute** — no Cloudflare Pages, no Cloudflare Workers (compute remains on TwinMOS origin)
- **Cost** — ~$20/mo (Cloudflare Pro tier) for WAF + image-transform features

### 4.3 Backup & DR

- Primary: TwinMOS VM SSD with daily PostgreSQL `pg_dump` to /var/backups
- Offsite: Backblaze B2 nightly encrypted backup (per Tech Stack §6.1)
- DR Drill: Quarterly + before each phase launch (Roadmap M8.7)
- RTO/RPO: Site < 4h / DB < 1h / RPO < 15 min (per BRD §23.3)

---

## 5. Cost Model

This SOW operates on a **single-resource cost model** rather than the vendor-agency milestone-payment model in v3.0 RFP §15. The cost is the developer's monthly contractor or employment compensation × engagement duration.

### 5.1 Single-Resource Cost Components

| Component | Type | Notes |
|-----------|------|-------|
| Solo developer compensation | Monthly (consult TwinMOS PM) | 40 h/week × ~80–95 weeks for Phases 1–14; Phase 15 open-ended |
| Cloud server (TwinMOS-owned VM) | TwinMOS-internal infra cost | Phase 1–12 baseline + Phase 13 upgrade |
| Cloudflare Pro | $20/mo | DNS + WAF + CDN |
| MeiliSearch Cloud (or self-host on cloud server) | $0–$30/mo | Search indexing |
| Resend (email) | $0–$20/mo | Free tier 3k emails; Pro 50k emails $20/mo |
| Plausible Analytics | $9–$19/mo | Cookieless privacy analytics |
| Sentry | $0–$26/mo | Error monitoring |
| UptimeRobot | $0/mo | Free tier sufficient |
| Backblaze B2 | ~$5/mo | Encrypted backup target |
| Translation vendors (Phases 9, 12, 14, 15) | Variable | 9 languages × content corpus |
| Stripe (Phase 13+) | Per transaction | 2.9% + $0.30 per transaction |
| Penetration test (Phase 7) | Per engagement | Third-party vendor quote |
| Domain (twinmos.com) | Annual | Existing |
| **Total non-developer recurring** | **~$70–$150/mo** | Excluding translation, pen-test, transactions |

### 5.2 Payment Schedule

Aligned to Roadmap Phase Gate Reviews rather than agency milestones. Sponsor authorizes:
- Monthly / bi-weekly developer compensation per employment contract
- Lump-sum reimbursements for SaaS subscriptions (Cloudflare, Plausible, Sentry, Backblaze, Resend Pro tier when triggered)
- Per-engagement reimbursements for pen-test (Phase 7), translation (Phases 9, 12, 14, 15)

---

## 6. Procurement & Vendor Selection (Removed)

The v3.0 RFP §16 procurement timeline (RFP issuance 30 April → Vendor Q&A → 12 required documents → 50-page PDF proposals → 6-step evaluation → contract signing 24 July → vendor disqualification criteria) is **removed in its entirety**. This SOW is an internal engagement; no external vendor selection process applies.

The 24 July 2026 project kickoff date is retained as the binding Phase 1 start date per Roadmap.

---

## 7. Acceptance & Sign-Off

### 7.1 Phase-Gate Acceptance

Each of the 15 Phase Gate Reviews requires sign-off per Implementation Roadmap §M{N}.10. Phase 1 Complete milestone (Phase 8 close) requires Sponsor (Chairman) signature.

### 7.2 Final Acceptance

Phase 15 closeout per Roadmap M15.10 includes:
- All Phase 1–3 + Phase 15 deliverables accepted
- Final budget reconciliation
- Stakeholder satisfaction survey
- Final project retrospective
- Phase 4 retainer agreement signed
- Project closeout approved by Project Sponsor (Chairman)
- All repository ownership and SaaS account administration transferred to TwinMOS IT

---

## A1. Patches Applied to RFP v3.0 (Documented for Traceability)

| ID | Issue | Patch |
|----|-------|-------|
| F-RFP-017 | Header says 30 April; §16.1 says 29 April | RFP §16 superseded; date harmonized to 30 April 2026 |
| F-RFP-021 | DocControl claims 11 personas; §5 had 5 | RFP §5 to be patched in v4.0 (this SOW) — full 11 personas inherited from BRD §7.5 |
| F-RFP-024 | "11 brand lines" claimed; §2 table had 18 rows | RFP §2 patched: 18 product-series rows annotated to roll up to 11 master brand-lines |
| F-RFP-041 | "7 inquiry types" stated; 9 enumerated; Roadmap says 15 forms | Reconciled to 15 form types per Roadmap M6 |
| F-RFP-046 | §11.2 missing KSA PDPL | KSA PDPL added |
| F-RFP-047 | TOC missing Appendix D entry | Appendix D added to TOC |
| F-RFP-048 | "64 Critical Issues" (§3.1) vs "51" (Appendix C) | Replaced 51 with 64 |
| F-RFP-049/050 | "14 features" vs Appendix A 16 rows | Reconciled to 14 (Phase-1 launch criteria); 2 Appendix A rows marked "Future Phase" |

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Marketing Director | (TBC) | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Solo Full-Stack Developer | (TBC) | _______________ | _________ |
| Legal/Compliance | (TBC) | _______________ | _________ |

---

**Document Version:** 4.0
**Last Updated:** 2 May 2026
**Supersedes:** TwinMOS_Website_RFP.md v3.0
**Synchronized With:** BRD v3.0 (v3.2 patches), URD v3.1, Tech Stack v1.2, Implementation Roadmap v2.2 (15-Phase), Forensic Alignment Audit v3.0
