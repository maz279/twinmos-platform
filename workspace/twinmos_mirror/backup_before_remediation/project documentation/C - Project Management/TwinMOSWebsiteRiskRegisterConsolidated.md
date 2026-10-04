# TwinMOS Corporate Website — Risk Register (Consolidated)

**Document Reference:** TWN-PM-RISK-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** TwinMOS PM  
**Audience:** Project Sponsor, Operational Sponsor, TwinMOS PM, Unisoft Engineering Team

---

## 1. Risk Register Overview

This consolidated risk register combines risks identified in the BRD, Implementation Strategy, and project planning process. Risks are tracked across all three phases with ownership, mitigation strategies, and contingency plans.

**Risk Count:** 20 identified risks  
**Categories:** Technical, Resource, Schedule, Budget, External, Compliance

---

## 2. Risk Scoring Matrix

| Likelihood / Impact | Low (1) | Medium (2) | High (3) |
|---------------------|---------|------------|----------|
| **High (3)** | 3 — Moderate | 6 — Significant | 9 — Critical |
| **Medium (2)** | 2 — Minor | 4 — Moderate | 6 — Significant |
| **Low (1)** | 1 — Negligible | 2 — Minor | 3 — Moderate |

**Risk Score Interpretation:**
- **9 (Critical):** Immediate action required; escalate to sponsor
- **6 (Significant):** Active mitigation required; monitor weekly
- **4 (Moderate):** Mitigation plan in place; monitor bi-weekly
- **3 (Moderate):** Monitor in regular status meetings
- **2 (Minor):** Accept and monitor
- **1 (Negligible):** Accept

---

## 3. Risk Register

### R-01: Phase 1 Effort at Upper Estimate (Capacity Strain)

| Field | Detail |
|-------|--------|
| **Category** | Schedule / Resource |
| **Description** | Phase 1 effort estimated at 40 weeks (upper bound); team capacity is 40 weeks with zero buffer |
| **Likelihood** | Medium (2) |
| **Impact** | High (3) |
| **Score** | 6 — Significant |
| **Owner** | Unisoft Team Lead |
| **Mitigation** | Markdown reuse saves 4–8 weeks; AI-assisted dev saves 8–12 weeks; aggressive templating saves 4–8 weeks; pre-mortem cuts defined for Week 12 if behind |
| **Contingency** | Scope trim list agreed upfront (gaming hub interactive deferred; advanced analytics deferred); backup dev on bench |
| **Trigger** | Velocity < 80% for 2 consecutive sprints |
| **Status** | Active monitoring |

---

### R-02: One Developer Absent >= 2 Weeks

| Field | Detail |
|-------|--------|
| **Category** | Resource |
| **Description** | One of two developers unavailable for extended period (vacation, illness, resignation) |
| **Likelihood** | Medium (2) |
| **Impact** | High (3) |
| **Score** | 6 — Significant |
| **Owner** | Unisoft Team Lead |
| **Mitigation** | Daily commits ensure both know codebase; ADRs document all decisions; pair programming 1h/day; backup dev identified with read access |
| **Contingency** | Backup dev activated; scope trim if absence > 3 weeks; contract clause for replacement within 1 week |
| **Trigger** | Developer announces absence > 1 week |
| **Status** | Mitigation in place |

---

### R-03: Marketing Team Content Authoring Lags Developer Pace

| Field | Detail |
|-------|--------|
| **Category** | Resource / Schedule |
| **Description** | TwinMOS Marketing team cannot keep pace with content review and approval; developers blocked |
| **Likelihood** | Medium (2) |
| **Impact** | Medium (2) |
| **Score** | 4 — Moderate |
| **Owner** | TwinMOS PM |
| **Mitigation** | Front-load templates so marketing can self-serve; CMS training in Week 16; content ownership matrix defined; 10+ hours/week commitment in contract |
| **Contingency** | Unisoft devs create placeholder content; marketing replaces post-launch; content freeze at Week 14 |
| **Trigger** | Content review queue > 20 items pending > 3 days |
| **Status** | Mitigation in place |

---

### R-04: Translation Vendor Delivers Late or Poor Quality

| Field | Detail |
|-------|--------|
| **Category** | External / Schedule |
| **Description** | Translation vendor misses deadlines or delivers poor quality translations |
| **Likelihood** | Medium (2) |
| **Impact** | Medium (2) |
| **Score** | 4 — Moderate |
| **Owner** | TwinMOS PM |
| **Mitigation** | Engage vendor by Phase 1 Week 12; staged delivery with milestones; glossary of 200+ technical terms provided; English fallback always available |
| **Contingency** | Secondary vendor on standby; launch with English + partial translations; post-launch update |
| **Trigger** | Vendor misses first milestone |
| **Status** | Monitoring |

---

### R-05: Phase 3 E-Commerce Scope Creep (PCI, Fraud, Tax)

| Field | Detail |
|-------|--------|
| **Category** | Scope / Budget |
| **Description** | E-commerce requirements expand beyond MVP (full PCI compliance, advanced fraud detection, multi-country tax) |
| **Likelihood** | Medium (2) |
| **Impact** | High (3) |
| **Score** | 6 — Significant |
| **Owner** | Operational Sponsor |
| **Mitigation** | Stripe Checkout shifts PCI burden; Medusa.js handles fraud basics; TaxJar for tax rules; scope locked in ADR; change request process enforced |
| **Contingency** | Defer to Phase 4 retainer; launch with Stripe Checkout only; add Medusa.js later |
| **Trigger** | New e-commerce requirement proposed in Phase 3 |
| **Status** | Mitigation in place |

---

### R-06: TwinMOS Product Data Not Provided on Time

| Field | Detail |
|-------|--------|
| **Category** | External / Schedule |
| **Description** | TwinMOS Product Manager does not provide SKU data, specifications, images, datasheets within 2 weeks of Sprint 0 |
| **Likelihood** | Medium (2) |
| **Impact** | High (3) |
| **Score** | 6 — Significant |
| **Owner** | TwinMOS PM |
| **Mitigation** | Data request sent at contract signing; template provided; weekly reminders; placeholder data for development |
| **Contingency** | Develop with placeholder SKUs; populate when data arrives; launch delay if data > 4 weeks late |
| **Trigger** | Data not received by Week 3 |
| **Status** | Monitoring |

---

### R-07: Lighthouse Score < 90 on Certain Pages

| Field | Detail |
|-------|--------|
| **Category** | Technical / Quality |
| **Description** | Some pages (heavy product galleries, interactive features) score below 90 on Lighthouse Performance |
| **Likelihood** | Low (1) |
| **Impact** | Medium (2) |
| **Score** | 2 — Minor |
| **Owner** | Unisoft Team Lead |
| **Mitigation** | Astro default 95+; Lighthouse CI enforces in pipeline; image budgets defined; route-level code splitting; third-party script audit |
| **Contingency** | Performance sprint dedicated to optimization; lazy loading; image optimization pass |
| **Trigger** | Lighthouse CI fails on any PR |
| **Status** | Mitigation in place |

---

### R-08: WCAG 2.1 AA Findings Discovered Late

| Field | Detail |
|-------|--------|
| **Category** | Compliance / Quality |
| **Description** | Accessibility issues discovered late in development requiring significant rework |
| **Likelihood** | Low (1) |
| **Impact** | High (3) |
| **Score** | 3 — Moderate |
| **Owner** | Unisoft Senior Dev |
| **Mitigation** | axe-core in CI from Sprint 0; never deferred; manual NVDA/VoiceOver test monthly; accessibility review in design phase |
| **Contingency** | Accessibility sprint before launch; external accessibility audit if needed |
| **Trigger** | axe-core critical/serious findings on any PR |
| **Status** | Mitigation in place |

---

### R-09: Security Vulnerability Discovered Post-Launch

| Field | Detail |
|-------|--------|
| **Category** | Security |
| **Description** | Critical security vulnerability discovered after public launch |
| **Likelihood** | Low (1) |
| **Impact** | High (3) |
| **Score** | 3 — Moderate |
| **Owner** | Unisoft Team Lead |
| **Mitigation** | OWASP ZAP scan weekly; dependency audit via Snyk; CSP strict; penetration test pre-launch; security pass in Sprint 7 |
| **Contingency** | Incident response runbook; hotfix process; rollback plan; security retainer with pen-test vendor |
| **Trigger** | Snyk high CVE or ZAP critical finding |
| **Status** | Mitigation in place |

---

### R-10: DNS/Domain Issues at Launch

| Field | Detail |
|-------|--------|
| **Category** | Technical |
| **Description** | DNS propagation issues, SSL certificate problems, or domain configuration errors at launch |
| **Likelihood** | Low (1) |
| **Impact** | High (3) |
| **Score** | 3 — Moderate |
| **Owner** | TwinMOS IT Lead |
| **Mitigation** | DNS configured 48 hours before cutover; SSL pre-provisioned; staging on production domain; rollback DNS ready |
| **Contingency** | Maintenance page ready; DNS rollback within 15 minutes; Cloudflare proxy for instant switch |
| **Trigger** | DNS cutover begins |
| **Status** | Mitigation in place |

---

### R-11: ERP Integration Complexity (Phase 2)

| Field | Detail |
|-------|--------|
| **Category** | Technical / External |
| **Description** | TwinMOS ERP system has undocumented APIs, unstable endpoints, or data format inconsistencies |
| **Likelihood** | Medium (2) |
| **Impact** | Medium (2) |
| **Score** | 4 — Moderate |
| **Owner** | Unisoft Senior Dev |
| **Mitigation** | ERP API audit in Phase 1 Week 12; read-only scope minimizes risk; error handling and retry logic; daily sync with validation |
| **Contingency** | Manual CSV import fallback; deferred to Phase 3 if API unavailable |
| **Trigger** | ERP API audit reveals issues |
| **Status** | Monitoring |

---

### R-12: Manufacturing Serial Data Unavailable (Phase 2)

| Field | Detail |
|-------|--------|
| **Category** | External / Schedule |
| **Description** | Manufacturing team cannot provide valid serial number database for anti-counterfeit feature |
| **Likelihood** | Medium (2) |
| **Impact** | Medium (2) |
| **Score** | 4 — Moderate |
| **Owner** | TwinMOS Product Manager |
| **Mitigation** | Request serial data at Phase 1 Week 12; CSV template provided; validate format early; placeholder data for testing |
| **Contingency** | Launch anti-counterfeit with manual validation; auto-check deferred; email-based verification |
| **Trigger** | Serial data not received by Phase 2 Week 21 |
| **Status** | Monitoring |

---

### R-13: HubSpot CRM Integration Issues (Phase 2)

| Field | Detail |
|-------|--------|
| **Category** | Technical / External |
| **Description** | HubSpot API rate limits, schema mismatches, or authentication issues block CRM sync |
| **Likelihood** | Low (1) |
| **Impact** | Medium (2) |
| **Score** | 2 — Minor |
| **Owner** | Unisoft Senior Dev |
| **Mitigation** | API keys provisioned early; rate limit monitoring; error handling with queue; schema validation |
| **Contingency** | Form submissions stored in Strapi; manual export to HubSpot; alternative CRM integration |
| **Trigger** | HubSpot API errors in testing |
| **Status** | Monitoring |

---

### R-14: Stripe Integration Issues (Phase 3)

| Field | Detail |
|-------|--------|
| **Category** | Technical / External |
| **Description** | Stripe webhook failures, payment processing errors, or account configuration issues |
| **Likelihood** | Low (1) |
| **Impact** | High (3) |
| **Score** | 3 — Moderate |
| **Owner** | Unisoft Senior Dev |
| **Mitigation** | Stripe test mode thorough testing; webhook signature verification; idempotency keys; error handling; Stripe dashboard monitoring |
| **Contingency** | Manual payment processing; alternative payment provider; deferred e-commerce launch |
| **Trigger** | Stripe webhook failures in production |
| **Status** | Monitoring |

---

### R-15: Traffic Exceeds Hetzner Capacity (Phase 3)

| Field | Detail |
|-------|--------|
| **Category** | Technical / Scalability |
| **Description** | E-commerce launch drives traffic beyond Hetzner CX42 capacity |
| **Likelihood** | Low (1) |
| **Impact** | Medium (2) |
| **Score** | 2 — Minor |
| **Owner** | Unisoft Team Lead |
| **Mitigation** | Postgres read replica; Cloudflare cache aggressive; Stripe absorbs checkout load; load testing at 5,000 concurrent users |
| **Contingency** | Upgrade to CX42 or dedicated server; CDN optimization; database scaling |
| **Trigger** | Load test fails or monitoring alerts on traffic |
| **Status** | Monitoring |

---

### R-16: Budget Overrun

| Field | Detail |
|-------|--------|
| **Category** | Budget |
| **Description** | Project costs exceed approved budget due to scope creep, vendor costs, or unforeseen expenses |
| **Likelihood** | Medium (2) |
| **Impact** | High (3) |
| **Score** | 6 — Significant |
| **Owner** | TwinMOS PM |
| **Mitigation** | Change request process enforced; monthly budget review; contingency reserve (10%); pre-approved scope trim list |
| **Contingency** | Scope reduction; Phase 3 deferral; additional funding request to sponsor |
| **Trigger** | Monthly budget review shows > 10% variance |
| **Status** | Active monitoring |

---

### R-17: TwinMOS PM Unresponsive

| Field | Detail |
|-------|--------|
| **Category** | Resource |
| **Description** | TwinMOS PM does not respond to blockers or decisions within agreed SLA |
| **Likelihood** | Low (1) |
| **Impact** | Medium (2) |
| **Score** | 2 — Minor |
| **Owner** | Operational Sponsor |
| **Mitigation** | 24-hour decision SLA in contract; escalation path defined; async-friendly communication; backup PM identified |
| **Contingency** | Escalate to Operational Sponsor; Unisoft Team Lead makes tactical decisions; contract penalty clause |
| **Trigger** | PM response > 24 hours on blocker |
| **Status** | Mitigation in place |

---

### R-18: Design Direction Changes Mid-Development

| Field | Detail |
|-------|--------|
| **Category** | Scope |
| **Description** | TwinMOS Marketing Director requests significant design changes after development has begun |
| **Likelihood** | Medium (2) |
| **Impact** | Medium (2) |
| **Score** | 4 — Moderate |
| **Owner** | TwinMOS Marketing Director |
| **Mitigation** | Design Approval milestone (Week 7) with formal sign-off; design freeze after approval; change request process; prototype review early |
| **Contingency** | Change request with impact assessment; sponsor approval for significant changes; defer to Phase 4 |
| **Trigger** | Design change request post-Week 7 |
| **Status** | Mitigation in place |

---

### R-19: Third-Party Service Outage

| Field | Detail |
|-------|--------|
| **Category** | Technical / External |
| **Description** | Critical third-party service (Stripe, Cloudflare, Backblaze) experiences outage |
| **Likelihood** | Low (1) |
| **Impact** | High (3) |
| **Score** | 3 — Moderate |
| **Owner** | Unisoft Team Lead |
| **Mitigation** | Multi-region failover where possible; graceful degradation; status page monitoring; alternative providers identified |
| **Contingency** | Maintenance mode; manual processing; service switch |
| **Trigger** | Third-party status page shows outage |
| **Status** | Monitoring |

---

### R-20: Regulatory Compliance Gap

| Field | Detail |
|-------|--------|
| **Category** | Compliance |
| **Description** | New regulation or interpretation requires additional compliance measures not in scope |
| **Likelihood** | Low (1) |
| **Impact** | Medium (2) |
| **Score** | 2 — Minor |
| **Owner** | TwinMOS Legal/Compliance |
| **Mitigation** | Legal review at each phase gate; compliance checklist for GDPR/UAE PDPL/India DPDP/KSA PDPL; cookie consent granular; data deletion workflow |
| **Contingency** | Legal review of new requirement; change request; compliance sprint; Phase 4 retainer |
| **Trigger** | New regulation announced or legal review identifies gap |
| **Status** | Monitoring |

---

## 4. Risk Summary by Phase

### Phase 1 — Core Website (Top 5 Risks)

| Rank | Risk ID | Risk | Score |
|------|---------|------|-------|
| 1 | R-01 | Phase 1 effort at upper estimate | 6 |
| 2 | R-02 | One developer absent >= 2 weeks | 6 |
| 3 | R-03 | Marketing team content authoring lags | 4 |
| 4 | R-06 | Product data not provided on time | 6 |
| 5 | R-18 | Design direction changes mid-development | 4 |

### Phase 2 — Localization & Partner Enablement (Top 5 Risks)

| Rank | Risk ID | Risk | Score |
|------|---------|------|-------|
| 1 | R-04 | Translation vendor delivers late/poor quality | 4 |
| 2 | R-11 | ERP integration complexity | 4 |
| 3 | R-12 | Manufacturing serial data unavailable | 4 |
| 4 | R-02 | One developer absent >= 2 weeks | 6 |
| 5 | R-13 | HubSpot CRM integration issues | 2 |

### Phase 3 — Commerce & Advanced Features (Top 5 Risks)

| Rank | Risk ID | Risk | Score |
|------|---------|------|-------|
| 1 | R-05 | E-commerce scope creep | 6 |
| 2 | R-14 | Stripe integration issues | 3 |
| 3 | R-15 | Traffic exceeds Hetzner capacity | 2 |
| 4 | R-16 | Budget overrun | 6 |
| 5 | R-02 | One developer absent >= 2 weeks | 6 |

---

## 5. Risk Monitoring and Reporting

### 5.1 Risk Review Cadence

| Review | Frequency | Participants | Output |
|--------|-----------|--------------|--------|
| Risk identification | Continuous | All team members | New risks added to register |
| Risk assessment | Bi-weekly | TwinMOS PM + Team Lead | Updated scores and priorities |
| Risk review | Monthly | Steering Committee | Executive risk summary |
| Risk escalation | As needed | Sponsor + Operational Sponsor | Decision on critical risks |

### 5.2 Risk Status Definitions

| Status | Definition |
|--------|------------|
| **Identified** | Risk recognized but not yet assessed |
| **Monitoring** | Risk assessed; mitigation in place; being watched |
| **Mitigation in place** | Active measures implemented to reduce likelihood or impact |
| **Escalated** | Risk requires sponsor or executive attention |
| **Occurred** | Risk has materialized; contingency plan activated |
| **Closed** | Risk no longer relevant or fully mitigated |
| **Superseded** | Risk replaced by another or resolved through scope change |

---

## 6. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial register |

**Next Review:** Bi-weekly at sprint planning; monthly at steering committee

**Related Documents:**
- TwinMOSWebsiteProject_Charter.md
- TwinMOSWebsiteProjectPlanPhases_1-3.md
- TwinMOSWebsiteIssue_Log.md
- TwinMOSWebsiteStatusReportTemplate.md

---

*This Risk Register is a living document. All team members are responsible for identifying and reporting new risks.*
