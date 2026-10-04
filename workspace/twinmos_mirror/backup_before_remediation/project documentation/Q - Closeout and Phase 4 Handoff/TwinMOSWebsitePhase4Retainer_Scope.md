# TwinMOS Corporate Website — Phase 4 Retainer Scope

**Document Reference:** TWN-Q-P4RETAINER-2026-001  
**Version:** 1.0  
**Date:** October 2027 (Finalised at Phase 3 Closeout)  
**Prepared by:** TwinMOS Digital Transformation Team  
**Reviewed by:** Unisoft Solutions Ltd. — Team Lead  
**Approved by:** Mohd Mazharul Islam, Chairman & Managing Director  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Distribution:** Executive Leadership, TwinMOS PM, Unisoft Solutions Ltd. (if retained)  
**Parent Documents:** TWN-Q-P4BACKLOG-2026-001, TWN-LEGAL-MSA-2026-001 §4 (Term & Renewal), TWN-BRD-2026-001 §6.1 Phase 4 definition  

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | September 2027 | TwinMOS PM | Draft for stakeholder review |
| 1.0 | October 2027 | TwinMOS Digital Transformation Team | Final approved scope document |

---

## 1. Purpose and Scope

This document defines the agreed scope, service model, resource structure, governance framework, pricing principles, and SLA for the **Phase 4 Ongoing Optimization Retainer** between:

- **Client:** TwinMOS Technologies Middle East FZE, Dubai Airport Free Zone (DAFZA), Dubai, UAE
- **Retained Vendor (if Unisoft continued):** Unisoft Solutions Ltd.
- **Alternative:** TwinMOS internal team or an alternative development vendor, using this document as the retainer specification

Phase 4 covers **Month 16 onwards** (November 2027 onwards) and is explicitly a **continuous optimization and enhancement retainer** rather than a project-based engagement. It operates under the existing MSA (TWN-LEGAL-MSA-2026-001) via a new Statement of Work (SOW-004) executed at Phase 4 commencement.

---

## 2. Phase 4 Strategic Context

### 2.1 What Phase 4 Is

Phase 4 is the post-delivery optimization, localization expansion, and business growth phase. The website platform is fully operational, commercially live, and generating revenue. Phase 4 activities shift from building to **optimizing, expanding, and growing** — with an emphasis on:

- **Conversion rate improvement** (squeeze more value from existing traffic)
- **New locale launches** (Spanish, Portuguese, German — highest unaddressed revenue opportunities)
- **Platform resilience** (dependency upgrades, security hardening, compliance maintenance)
- **Commercial expansion** (new e-commerce markets, B2B tooling, loyalty tier enhancements)
- **Data-driven decision making** (PostHog insights driving feature prioritisation)

### 2.2 What Phase 4 Is NOT

Phase 4 is not a blank-cheque engagement. The retainer is **time-boxed, scope-bounded, and governed**. Changes outside the defined monthly cadence require a formal Change Request (CR) against the MSA change management process. Phase 4 does not cover:

- Complete redesigns or architectural rewrites
- New product lines or entirely new business units
- ERP replacement or CRM platform procurement
- Content production (copywriting, photography, video production) — this is TwinMOS Marketing's remit
- Translation services — covered under the separate Translation Vendor Master Agreement

---

## 3. Retainer Service Model

### 3.1 Model: Flexible Time-and-Materials Retainer with Quarterly Scope Reviews

| Parameter | Value |
|-----------|-------|
| **Engagement Type** | Ongoing Time-and-Materials Retainer |
| **Minimum Commitment Period** | 12 months (renewable annually) |
| **Resource Allocation** | 1 Senior Full-Stack Developer (0.5 FTE equivalent) + on-demand capacity |
| **Monthly Retainer Hours** | 80 hours / month (baseline) |
| **Flex Hours** | Up to 40 additional hours/month available at agreed T&M rate |
| **Quarterly Scope Reviews** | Q4 review to plan next quarter's focus areas from Phase 4 Backlog |
| **Sprint Cadence** | 2-week sprints; sprint planning every second Monday |
| **Demo / Review Cadence** | Bi-weekly demo on sprint completion |
| **Priority Protocol** | Backlog items triaged by TwinMOS PM; critical security issues interrupt any active sprint |

### 3.2 Retainer Scope Categories (Monthly Allocation Guidance)

| Category | % of Monthly Hours | Description |
|----------|-------------------|-------------|
| **Platform Maintenance & Security** | 20% (16 hrs) | Dependency updates, security patching, Dependabot PR reviews, infrastructure monitoring, CMS schema migrations |
| **SEO & Performance** | 15% (12 hrs) | Monthly Lighthouse CI review, Core Web Vitals remediation, structured data updates, crawl error fixes |
| **Feature Development** | 40% (32 hrs) | Backlog items from Phase 4 Backlog per quarterly sprint plan |
| **Analytics & Reporting** | 10% (8 hrs) | PostHog dashboard maintenance, conversion funnel analysis, monthly analytics report |
| **Content Support** | 10% (8 hrs) | CMS schema additions for new content types, bulk import support, translation import, new page templates |
| **Ad Hoc / Emergency** | 5% (4 hrs) | Unplanned issues, urgent business requests, rapid response |

### 3.3 Escalation Model

| Severity | Definition | Response Time | Resolution SLA |
|----------|------------|---------------|----------------|
| **P1 — Critical** | Site down or e-commerce checkout broken | 1 hour (business hours) / 2 hours (out-of-hours) | 4 hours |
| **P2 — High** | Key feature degraded (partner portal, RMA, search) | 4 hours | 24 hours |
| **P3 — Medium** | Non-critical feature issue or performance regression | 1 business day | 5 business days |
| **P4 — Low** | Minor bug, cosmetic issue, content error | 3 business days | 20 business days |

> Business hours: Sunday–Thursday 09:00–18:00 GST (Dubai time)  
> Out-of-hours on-call: P1 Critical only, via emergency contact number in Maintenance Handover Document

---

## 4. Phase 4 Priority Deliverables

### 4.1 High Priority (Q1–Q2 of Phase 4, approximately Months 16–21)

The following items from the Phase 4 Backlog are designated high-priority and should be planned for execution in the first two quarters of Phase 4. See `TwinMOSWebsitePhase4Backlog.md` for full details.

| Backlog ID | Item | Estimated Hours | Target Quarter |
|------------|------|----------------|----------------|
| BL-01-001 | Spanish (ES) Translation — Full Site | 60–80 hrs (engineering only) | Q1 |
| BL-01-002 | Portuguese (PT) Translation — Full Site | 60–80 hrs (engineering only) | Q1 |
| BL-02-001 | Continuous SEO Monitoring & Remediation | 8 hrs/month (ongoing) | Ongoing from Day 1 |
| BL-05-009 | Dependency Vulnerability Monitoring Automation | 8 hrs | Week 1 |
| BL-09-001 | WCAG 2.2 AA Assessment & Remediation | 24–40 hrs | Q1 |
| BL-09-002 | Annual Penetration Test (Year 1) | 16 hrs (coordination + remediation) | Q1 |
| BL-02-002 | CRO Programme Setup | 40–60 hrs | Q1–Q2 |
| BL-06-001 | PostHog Advanced Cohort Analysis | 24–32 hrs | Q1 |
| BL-06-002 | Business Intelligence Dashboard (Metabase) | 32–40 hrs | Q1 |

### 4.2 Medium Priority (Q3–Q4 of Phase 4, approximately Months 22–27)

| Backlog ID | Item | Estimated Hours | Target Quarter |
|------------|------|----------------|----------------|
| BL-01-003 | German (DE) Translation — Full Site | 60–80 hrs (engineering only) | Q3 |
| BL-02-003 | Long-Tail Keyword Content Strategy (infrastructure) | 16–24 hrs | Q2 |
| BL-03-002 | Advanced Loyalty Tiers (Bronze/Silver/Gold) | 48–64 hrs | Q3 |
| BL-03-003 | Customer Review & Rating System | 24–32 hrs | Q3 |
| BL-05-001 | Strapi v5 → v6 Upgrade (when stable) | 32–40 hrs | Q4 (post GA) |
| BL-05-002 | Astro 5 → 6 Upgrade | 12–16 hrs | Q3 |
| BL-05-003 | PostgreSQL LTS Upgrade | 8 hrs | Q2 |
| BL-04-001 | Investor Relations Section Activation | 16–24 hrs | Q3 |
| BL-04-002 | Case Studies Programme (infrastructure) | 12–16 hrs | Q2 |

### 4.3 Low Priority / Optional (Month 28+)

Items marked Low priority in the Phase 4 Backlog, plus the mobile app evaluation (BL-07-001), B2B Enterprise Portal (BL-08-001), and advanced CRM integrations. These are subject to business case approval and separate SOW/budget allocation if required.

---

## 5. Governance and Change Control

### 5.1 Quarterly Planning Cycle

| Event | Timing | Participants | Outcome |
|-------|--------|-------------|---------|
| **Quarterly Roadmap Review** | Last week of each quarter | TwinMOS PM, Marketing Director, IT Lead, Unisoft Team Lead | Next quarter backlog prioritised; time allocation per sprint confirmed |
| **Monthly Progress Review** | Last Thursday of each month | TwinMOS PM, Unisoft Team Lead | Hours consumed vs. allocated; items completed vs. planned; risks identified |
| **Bi-Weekly Sprint Demo** | Every second Monday | TwinMOS PM + relevant stakeholders | Working features demonstrated; feedback captured; sprint velocity tracked |
| **Annual Contract Renewal** | 60 days before contract anniversary | Chairman / GM, TwinMOS PM, Unisoft | Renewal terms confirmed; rate review if applicable; Phase 4 Backlog reprioritised |

### 5.2 Change Request Process

Any work not included in the approved sprint backlog must follow the formal Change Request (CR) process:

1. TwinMOS PM submits CR via the agreed project management platform (Notion or Jira)
2. Unisoft provides impact assessment within 2 business days (effort estimate, schedule impact, cost)
3. TwinMOS PM and Operational Sponsor approve or reject
4. Approved CRs are scheduled into the next available sprint
5. Emergency CRs (P1/P2 security or business-critical) bypass sprint scheduling with immediate resource allocation

### 5.3 Velocity and Capacity Reporting

Unisoft shall deliver monthly to TwinMOS PM:
- Hours consumed vs. retainer allocation
- Sprint velocity (story points or hours per category)
- Backlog burndown
- Any capacity risks for the following month (leave, peak load)
- Proposed sprint backlog for the next 2 weeks

---

## 6. Technology Governance Obligations

### 6.1 Dependency Update Policy

| Dependency Type | Update Frequency | Process |
|----------------|-----------------|---------|
| Security patches (patch-level) | Within 7 days of CVE disclosure | Automated via Dependabot + manual merge after staging test |
| Minor version updates | Monthly | Bundled into monthly maintenance sprint |
| Major version updates | Quarterly review; upgrade per planned schedule | Staging upgrade first; regression test; scheduled maintenance window for production |
| OS-level VPS patches | Monthly | Coolify-managed; Unisoft applies within monthly cycle |

### 6.2 Platform Monitoring Obligations

| Area | Tool | Responsibility | Frequency |
|------|------|----------------|-----------|
| Uptime monitoring | UptimeRobot | Unisoft (alerts) / TwinMOS IT (response) | Real-time |
| Error monitoring | Sentry | Unisoft (triage new errors) | Weekly review |
| Performance monitoring | Lighthouse CI in GitHub Actions | Unisoft (address regressions) | Per deploy |
| Security scanning | OWASP ZAP + npm audit | Unisoft | Monthly |
| Database performance | PostgreSQL slow query log | Unisoft | Monthly |
| CDN performance | Cloudflare Analytics | Unisoft (report) | Monthly |

### 6.3 Documentation Obligations

Unisoft shall maintain the following documentation throughout Phase 4:
- Update the Operations Runbook Master (`TwinMOSWebsiteOperationsRunbookMaster.md`) with any new procedures
- Update the Environment Variables Reference when new env vars are added
- Update the API documentation when new Strapi endpoints are created
- Maintain a Phase 4 Change Log documenting all features shipped (appended quarterly)

---

## 7. Financial Framework

### 7.1 Retainer Fee Structure

| Component | Basis | Notes |
|-----------|-------|-------|
| **Monthly Retainer Fee** | 80 hours × agreed day rate ÷ 8 hours/day | Invoiced on the 1st of each month; due within 15 business days |
| **Flex Hours Rate** | Agreed T&M day rate for hours 81–120/month | Approved in advance by TwinMOS PM; invoiced monthly with timesheet |
| **Emergency Callout (P1 out-of-hours)** | Agreed callout rate per incident (2-hour minimum) | Only for genuine P1 out-of-hours incidents |
| **Major Scope Items (>40 hrs each)** | Separate mini-SOW with fixed price or T&M with cap | For items like BL-07-001 (mobile app) or BL-08-001 (enterprise portal) |
| **Annual Rate Review** | Inflation + market rate adjustment, max 5% per annum | Agreed 60 days before contract anniversary |

> Specific fee amounts are redacted per MSA §8 confidentiality provisions. The agreed day rate and retainer monthly fee are recorded in the executed SOW-004 and maintained in the TwinMOS Finance system.

### 7.2 Payment Terms

- Retainer invoices: Net 15 business days
- T&M flex hours invoices: Net 15 business days (with approved timesheet attached)
- Late payment: Per MSA §6.4 (interest at UAE Central Bank lending rate + 2%)
- Suspension of service: Retainer activities suspended if invoices unpaid after 30 days, per MSA §12

### 7.3 Value Measurement

TwinMOS PM shall produce a **quarterly Phase 4 ROI Report** measuring:
- Organic traffic growth vs. Phase 3 baseline
- Conversion rate improvement per optimisation experiment
- E-commerce revenue growth (MoM)
- Cost per lead reduction
- Distributor application volume growth
- Partner portal active user growth

---

## 8. SOW-004 — Phase 4 Retainer Statement of Work

This section provides a template for the formal SOW-004 that activates Phase 4 under the existing MSA.

### 8.1 SOW-004 Identification

| Field | Value |
|-------|-------|
| **SOW Number** | SOW-004 |
| **SOW Title** | Phase 4: Ongoing Optimization Retainer |
| **Effective Date** | November 2027 (Month 16) |
| **Parent MSA** | TWN-LEGAL-MSA-2026-001 |
| **Initial Term** | 12 months (November 2027 – October 2028) |
| **Renewal** | Automatic 12-month renewal unless 60 days written notice given |
| **Governing Scope** | This document (TWN-Q-P4RETAINER-2026-001) + Phase 4 Backlog (TWN-Q-P4BACKLOG-2026-001) |

### 8.2 Key Personnel

| Role | Name | Responsibility |
|------|------|----------------|
| Client Operational Sponsor | Robiul Islam, GM Dubai | Final approval for CR, contract matters |
| Client PM | [TwinMOS PM Name] | Day-to-day engagement management, sprint backlog |
| Vendor Team Lead | [Unisoft Team Lead Name] | Technical delivery, sprint planning |

### 8.3 Reporting Requirements

| Report | Frequency | Format | Recipient |
|--------|-----------|--------|-----------|
| Monthly Hours & Velocity Report | Monthly | Markdown or PDF via email | TwinMOS PM |
| Quarterly Roadmap Review Deck | Quarterly | Slides | TwinMOS PM + Operational Sponsor |
| Annual ROI Review Report | Annual | Document | Chairman, GM, Marketing Director |
| Incident Post-Mortem | Per P1/P2 incident | Document | TwinMOS IT Lead, PM |
| Security Scan Results | Monthly | OWASP ZAP HTML report | TwinMOS IT Lead |

---

## 9. Exit and Transition Provisions

### 9.1 Termination for Convenience

Either party may terminate SOW-004 with **60 days written notice**. Upon notice:
- Unisoft completes in-progress sprint tasks
- All work in progress is documented and handed over
- No new feature work begins in the notice period (maintenance/security only)
- Final invoice covers hours worked to termination date

### 9.2 Vendor Transition (if changing from Unisoft)

Should TwinMOS elect to bring Phase 4 in-house or engage a different vendor:

| Obligation | Unisoft Responsibility | Timeline |
|------------|----------------------|----------|
| Code handover | All private repos transferred to TwinMOS GitHub organization | Day of termination |
| Knowledge transfer sessions | Minimum 4 × 2-hour sessions with incoming team | Within 30-day notice period |
| Documentation update | All runbooks and architecture docs updated to current state | Within 30-day notice period |
| Credentials handover | All service accounts with Unisoft credentials rotated to TwinMOS | Day of termination |
| Warranty obligations | 90-day post-termination bug warranty for Unisoft-authored code | Per MSA §10.4 |

### 9.3 Intellectual Property

Per the IP Ownership Transfer Agreement (TWN-LEGAL-IP-2026-001), all code produced during Phase 4 is automatically and immediately assigned to TwinMOS Technologies Middle East FZE upon creation. No additional IP assignment instrument is required at Phase 4 termination.

---

## 10. Acceptance and Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor (Client) | Mohd Mazharul Islam, Chairman & MD | _______________ | _________ |
| Operational Sponsor (Client) | Robiul Islam, General Manager | _______________ | _________ |
| TwinMOS PM | [Name] | _______________ | _________ |
| Vendor Team Lead (if Unisoft retained) | [Unisoft Team Lead Name] | _______________ | _________ |

---

*Document prepared by TwinMOS Digital Transformation Team | Confidential — Internal Use Only*
