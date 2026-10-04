# TwinMOS Technologies Middle East FZE — Unisoft Solutions Ltd.

# Statement of Work (SOW) Template

**Document Reference:** TWN-LEGAL-SOW-2026-001  
**Version:** 1.0  
**Effective Date:** [DATE UPON EXECUTION]  
**Parent MSA:** TWN-LEGAL-MSA-2026-001

---

> **Instructions:** This document serves as the template for all Statements of Work executed under the Master Service Agreement. Each SOW shall be completed with project-specific details and signed by authorized representatives of both Parties. SOW-001 (Phase 1) is pre-populated below as the initial active SOW. Subsequent SOWs (SOW-002 for Phase 2, SOW-003 for Phase 3) shall follow this template.

---

## SOW-001: Phase 1 — Core Website Rebuild

### 1. SOW Identification

| Field | Value |
|-------|-------|
| **SOW Number** | SOW-001 |
| **SOW Title** | Phase 1: Core Website Rebuild |
| **Project Name** | TwinMOS Corporate Website (twinmos.com) |
| **Parent MSA** | TWN-LEGAL-MSA-2026-001 |
| **BRD Reference** | TWN-BRD-2026-001, Sections 6.1, 8–18 |
| **RFP Reference** | TWN-RFP-2026-001, Sections 4, 6, 8 |
| **URD Reference** | TWN-URD-2026-001, UR-Epics 1–10 |
| **Technology Stack** | TWN-TECHSTACK-2026-001 |
| **Implementation Strategy** | TWN-IMPL-STRAT-2026-001, Section 12.1 |

### 2. SOW Overview and Objectives

#### 2.1 Background

TwinMOS Technologies Middle East FZE requires a complete rebuild of its corporate website (twinmos.com) to replace the current underperforming site. The existing site suffers from critical issues including broken product pages (404 errors), missing contact forms, inaccurate company information, and no mobile-friendly structure. This SOW covers Phase 1 of the 3-phase engagement, delivering a fully functional, performant, and secure core website.

#### 2.2 Objectives

| Objective ID | Objective | Success Criteria |
|--------------|-----------|----------------|
| OBJ-1.1 | Launch a modern, responsive corporate website | Site live on twinmos.com with all core features operational |
| OBJ-1.2 | Establish headless CMS for content management | Strapi v5 operational with all content types configured |
| OBJ-1.3 | Deliver product catalog with 100+ SKUs | All active products have detail pages with specifications |
| OBJ-1.4 | Implement compatibility finder (MVP) | Users can search by laptop/desktop brand and model |
| OBJ-1.5 | Deploy "Where to Buy" locator | Interactive map with retailer pins for all authorized markets |
| OBJ-1.6 | Achieve performance targets | Lighthouse Performance >= 90, LCP < 1.8s, CLS < 0.05 |
| OBJ-1.7 | Meet security and compliance standards | TLS 1.3, OWASP Top 10 compliance, GDPR/UAE PDPL readiness |
| OBJ-1.8 | Establish CI/CD and DevOps pipeline | GitHub Actions pipelines operational for frontend and backend |

### 3. Scope of Services

#### 3.1 In-Scope Deliverables

| # | Deliverable | Description | Acceptance Criteria | Phase/Week |
|---|-------------|-------------|---------------------|------------|
| D1.1 | **Technical Architecture Document** | Detailed architecture diagrams, infrastructure design, security architecture | Approved by TwinMOS Technical Lead | Week 2 |
| D1.2 | **Content Model & CMS Schema** | Strapi collection types, relationships, validation rules, i18n configuration | All 25+ collection types configured per Tech Stack Section 25.2 | Week 3 |
| D1.3 | **UI/UX Design System** | Figma design system with components, tokens, responsive breakpoints, dark mode (gaming) | Design approved by Marketing Director; pixel-perfect implementation target +/- 5% | Weeks 2–4 |
| D1.4 | **Homepage** | Hero carousel, product categories, featured products, trust signals, news teaser, gaming CTA, footer | Functional, responsive, performance-tested, content-populated | Weeks 5–8 |
| D1.5 | **Product Catalog** | Category pages, subcategory pages, product grid with filters, product detail pages | All 100+ SKUs have detail pages; filter by category, brand, capacity, speed, RGB | Weeks 5–10 |
| D1.6 | **Product Comparison Tool** | Side-by-side comparison for up to 4 products, shareable URLs, print view | Functional comparison with highlight differences; max 4 products | Weeks 8–10 |
| D1.7 | **Compatibility Finder (MVP)** | Search by laptop/desktop brand + model with auto-suggest; top 500 devices | Search < 2s; results show compatible products with device specs | Weeks 7–10 |
| D1.8 | **Where to Buy Locator** | Interactive map (Leaflet + OSM), country auto-detect, retailer list, featured distributors | Map loads < 3s; all authorized retailers displayed; Supertron featured for India | Weeks 8–11 |
| D1.9 | **Contact & Inquiry Forms** | General contact, bulk quote request, distributor inquiry, newsletter signup | All forms validated, routed correctly, auto-reply within 5 min, reCAPTCHA/Turnstile | Weeks 6–9 |
| D1.10 | **About Us Section** | Company story, leadership, global presence, certifications, awards | All content accurate and populated; Dubai HQ prominently displayed | Weeks 7–10 |
| D1.11 | **Support Center** | Knowledge base, FAQ, warranty registration form, firmware download (serial-validated) | KB searchable; warranty form validates serial; firmware download validates serial | Weeks 9–12 |
| D1.12 | **News & Events** | News article listing, article detail, event pages, press releases | CMS-managed; SEO metadata; social sharing | Weeks 8–11 |
| D1.13 | **Legal Pages Hub** | Privacy Policy, Cookie Policy, Terms of Use, Warranty Policy, Accessibility Statement, Imprint (EU), Data Deletion Request | All pages compliant with GDPR/UAE PDPL/India DPDP; "Last Updated" date visible | Weeks 10–13 |
| D1.14 | **Gaming Hub (VOLTX)** | Dark-themed gaming section, VOLTX product showcase, RGB visualizer (static/animated) | Dark theme implemented; product grid functional; RGB showcase accessible | Weeks 10–14 |
| D1.15 | **CMS Admin Interface** | Strapi admin with custom views, role-based access, content workflows | Admin, Editor, Author, Viewer roles functional; workflow: Draft → Review → Published | Weeks 4–12 |
| D1.16 | **Search Implementation** | MeiliSearch integration, product search, auto-suggest, search analytics | Search < 100ms; auto-suggest < 100ms per keystroke; faceted search | Weeks 9–12 |
| D1.17 | **SEO Foundation** | XML sitemap, hreflang tags, structured data (Schema.org), meta tags, canonical URLs | Screaming Frog crawl passes; all public pages have unique meta | Weeks 10–14 |
| D1.18 | **Analytics Setup** | Plausible (self-hosted) integration, event tracking, conversion goals | All critical paths tracked; GA4/GTM integration ready | Weeks 11–14 |
| D1.19 | **CI/CD Pipeline** | GitHub Actions workflows for frontend (lint, typecheck, test, Lighthouse, deploy) and backend (lint, test, security scan, deploy) | All quality gates enforced; automated deployment to staging and production | Weeks 2–5 |
| D1.20 | **Security Implementation** | TLS 1.3, HSTS, CSP, secure cookies, WAF rules, OWASP ZAP integration | Security scan passes with zero high/critical findings; pen-test ready | Weeks 12–16 |
| D1.21 | **Documentation** | Technical architecture doc, API documentation, CMS user guide, deployment runbook | Complete and reviewed by TwinMOS Technical Lead | Weeks 14–16 |
| D1.22 | **CMS Training** | Training session for TwinMOS marketing staff (2 sessions, 2 hours each) | Marketing staff can create/edit/publish content independently | Week 16 |
| D1.23 | **Hypercare Support** | 4 weeks post-launch bug fixes, performance monitoring, incident response | All critical/high bugs resolved within SLA; performance stable | Weeks 17–20 |

#### 3.2 Out-of-Scope (Phase 1)

The following are explicitly excluded from Phase 1 and shall be addressed in subsequent SOWs:

| # | Item | Deferred To |
|---|------|-------------|
| OOS-1 | Multi-language content (Arabic, Bengali, Hindi, etc.) | Phase 2 (SOW-002) |
| OOS-2 | Partner Portal with authentication | Phase 2 (SOW-002) |
| OOS-3 | RMA full workflow (7-state machine) | Phase 2 (SOW-002) |
| OOS-4 | Anti-counterfeit SN check system | Phase 2 (SOW-002) |
| OOS-5 | Live chat with agent routing | Phase 2 (SOW-002) |
| OOS-6 | E-commerce checkout (Medusa.js + Stripe) | Phase 3 (SOW-003) |
| OOS-7 | Customer account system | Phase 3 (SOW-003) |
| OOS-8 | Marketing automation (exit-intent, abandoned cart) | Phase 3 (SOW-003) |
| OOS-9 | Loyalty / referral programs | Phase 3 (SOW-003) |
| OOS-10 | Advanced analytics (A/B testing, session replay) | Phase 3 (SOW-003) |

### 4. Timeline and Milestones

#### 4.1 Phase 1 Schedule (20 Weeks)

| Month | Weeks | Focus | Key Milestones |
|-------|-------|-------|----------------|
| **Month 1** | Weeks 1–4 | Foundation & Architecture | Architecture approved; CMS schema complete; Design system approved; CI/CD operational |
| **Month 2** | Weeks 5–8 | Content & Core Pages | Homepage live; Product catalog framework; Contact forms operational; About section complete |
| **Month 3** | Weeks 9–12 | Application Surfaces | Compatibility finder MVP; Where to Buy locator; Support center; News & Events; Search live |
| **Month 4** | Weeks 13–16 | Quality & Integration | Security hardening; SEO foundation; Performance optimization; Accessibility audit; Legal pages |
| **Month 5** | Weeks 17–20 | Stabilization & Launch | Alpha/Beta UAT; Stakeholder UAT; Penetration test; Soft launch; Public launch; Hypercare |

#### 4.2 Critical Path Milestones

| Milestone ID | Milestone | Target Date | Dependencies |
|--------------|-----------|-------------|--------------|
| M-1.1 | Kickoff & Architecture Approval | Week 2 | Contract signed; TwinMOS product data provided |
| M-1.2 | Design Approval | Week 4 | M-1.1; Brand guidelines provided |
| M-1.3 | CMS Schema Freeze | Week 3 | M-1.1 |
| M-1.4 | Homepage Demo | Week 6 | M-1.2 |
| M-1.5 | Product Catalog Beta | Week 10 | M-1.3; Product data complete |
| M-1.6 | Feature Complete (Code Freeze) | Week 14 | All D1.1–D1.20 delivered |
| M-1.7 | Alpha UAT Complete | Week 17 | M-1.6 |
| M-1.8 | Beta UAT Complete | Week 18 | M-1.7 |
| M-1.9 | Penetration Test Passed | Week 19 | M-1.8 |
| M-1.10 | Public Launch | Week 20 | M-1.9; All launch readiness criteria met |

### 5. Resource Plan

#### 5.1 Unisoft Team

| Role | FTE | Start Week | End Week | Responsibilities |
|------|-----|------------|----------|------------------|
| **Senior Full-Stack Developer / Team Lead** | 1.0 | Week 1 | Week 20 | Architecture, backend (Strapi), DevOps, code review, technical decisions |
| **Full-Stack Developer** | 1.0 | Week 1 | Week 20 | Frontend (Astro/React), CMS integration, testing, documentation |

#### 5.2 TwinMOS Responsibilities

| Responsibility | Owner | Timing |
|----------------|-------|--------|
| Provide product master data (Excel/CSV) | Product Manager | Week 4 |
| Provide high-resolution product images | Marketing | Week 6 |
| Provide distributor/retailer contact list | Sales | Week 8 |
| Provide brand guidelines and design direction | Marketing Director | Week 2 |
| Review and approve designs | Marketing Director | Week 4 |
| Provide legal page content (Privacy, Terms) | Legal | Week 14 |
| Participate in UAT cycles | Marketing, Sales, Product | Weeks 17–19 |
| Assign CMS users and attend training | Marketing | Week 16 |
| Approve launch readiness | Chairman / GM | Week 19 |

### 6. Fees and Payment Schedule

#### 6.1 Total Fee

| Component | Estimated Range (USD) |
|-----------|----------------------|
| Discovery & Strategy | $8,000 – $15,000 |
| UI/UX Design | $25,000 – $45,000 |
| Front-End Development | $40,000 – $75,000 |
| Back-End & CMS | $30,000 – $55,000 |
| Feature Development | $35,000 – $65,000 |
| Content Population | $12,000 – $25,000 |
| SEO & Analytics Setup | $5,000 – $9,000 |
| Testing & QA | $10,000 – $18,000 |
| Training & Documentation | $4,000 – $8,000 |
| Post-Launch Hypercare | $10,000 – $18,000 |
| **TOTAL PHASE 1** | **$179,000 – $333,000** |

#### 6.2 Payment Milestones

| # | Milestone | Payment % | Amount (at $179K) | Amount (at $333K) | Trigger |
|---|-----------|-----------|-------------------|-------------------|---------|
| 1 | Contract Signing | 20% | $35,800 | $66,600 | SOW execution |
| 2 | Design Approval | 20% | $35,800 | $66,600 | Written design approval |
| 3 | Beta Delivery | 20% | $35,800 | $66,600 | Beta UAT sign-off |
| 4 | Public Launch | 20% | $35,800 | $66,600 | Go-live + 7-day stability |
| 5 | Post-Launch Support | 20% | $35,800 | $66,600 | Hypercare + 90-day warranty complete |

#### 6.3 Final Fee Determination

The final fee shall be determined based on:

(a) Actual hours worked (time-and-materials basis with hourly rate caps)  
(b) Or fixed-price per deliverable (to be agreed in writing prior to SOW execution)  
(c) Any approved Change Requests

Hourly rate caps (if time-and-materials):

| Role | Hourly Rate Cap (USD) |
|------|----------------------|
| Senior Full-Stack Developer / Team Lead | $120/hour |
| Full-Stack Developer | $90/hour |

### 7. Acceptance Criteria and Process

#### 7.1 Acceptance Criteria Template

Each deliverable must meet the following before Acceptance:

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | Functional completeness | Feature checklist review against BRD/URD |
| 2 | Design fidelity | Pixel-perfect match to approved designs (+/- 5%) |
| 3 | Responsive behavior | Tested on mobile (375px), tablet (768px), desktop (1440px) |
| 4 | Performance | Lighthouse CI report: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 95 |
| 5 | Accessibility | axe-core scan: zero critical/serious violations; manual screen reader test |
| 6 | Security | OWASP ZAP scan: zero high/critical findings |
| 7 | Cross-browser | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| 8 | Content accuracy | Content audit checklist; all forms tested and routing correctly |
| 9 | Analytics | Tracking events verified in Plausible/GA4 debug mode |
| 10 | Documentation | Technical docs complete and reviewed |

#### 7.2 Acceptance Process

| Step | Action | Owner | Timeline |
|------|--------|-------|----------|
| 1 | Unisoft submits deliverable for review | Unisoft | Upon completion |
| 2 | TwinMOS reviews against Acceptance Criteria | TwinMOS | 5 business days |
| 3 | If approved: TwinMOS issues written Acceptance | TwinMOS | Upon approval |
| 4 | If rejected: TwinMOS provides detailed feedback | TwinMOS | Within 5 business days |
| 5 | Unisoft remedies and resubmits | Unisoft | Per defect severity SLA |
| 6 | Repeat Steps 2–5 until Acceptance | — | — |

#### 7.3 Deemed Acceptance

If TwinMOS does not provide written acceptance or rejection within **ten (10) business days** of deliverable submission, the deliverable shall be deemed accepted, provided Unisoft has given written notice of the submission.

### 8. Change Control

#### 8.1 Change Request Process

| Step | Action | Owner |
|------|--------|-------|
| 1 | Either Party submits Change Request (CR) form | Initiating Party |
| 2 | Unisoft assesses impact (effort, cost, timeline) | Unisoft |
| 3 | TwinMOS reviews and approves/rejects | TwinMOS |
| 4 | If approved: CR is incorporated into SOW | Both Parties |

#### 8.2 Change Request Form

```
CR-ID: CR-[SOW]-[###]
Date: [YYYY-MM-DD]
Requested By: [Name / Role]
Description: [What is changing and why]
Business Justification: [Why this change is needed]
Impact on Scope: [Add / Modify / Remove]
Impact on Timeline: [Days added/removed]
Impact on Cost: [USD amount]
Impact on Quality: [Any impact on performance, security, etc.]
Approval: [Name / Date / Signature]
```

### 9. Risk Management

| Risk ID | Risk | Probability | Impact | Mitigation | Owner |
|---------|------|-------------|--------|------------|-------|
| SOW-R1 | Content delays from TwinMOS | High | High | Begin with placeholder content; parallel content creation track | TwinMOS Marketing |
| SOW-R2 | Scope creep | High | Medium | Strict change control; weekly scope review | Project Managers |
| SOW-R3 | Third-party service integration issues | Medium | Medium | Early integration testing; fallback strategies | Unisoft Tech Lead |
| SOW-R4 | Performance targets not met | Medium | High | Performance budgets in CI; weekly Lighthouse audits | Unisoft Tech Lead |
| SOW-R5 | Security vulnerabilities discovered late | Low | Critical | Security scanning from Week 1; quarterly pen-tests | Unisoft + Security Lead |
| SOW-R6 | Key personnel unavailable | Low | High | 30-day notice for replacements; knowledge documentation | Unisoft |

### 10. Reporting and Governance

| Report | Frequency | Audience | Content |
|--------|-----------|----------|---------|
| Sprint Report | Bi-weekly | Project Teams | Completed stories, blockers, risks, upcoming sprint |
| Status Report | Weekly | Project Managers | Progress vs. plan, budget burn, issues, decisions needed |
| Steering Committee | Monthly | Directors | Strategic decisions, scope changes, escalations |
| Executive Summary | Monthly | Chairman / GM | High-level progress, key milestones, risks |

### 11. Assumptions and Dependencies

| ID | Assumption / Dependency | Impact if Not Met |
|----|------------------------|-------------------|
| A-1 | TwinMOS provides accurate product data by Week 4 | Product catalog delayed |
| A-2 | TwinMOS provides brand guidelines by Week 2 | Design phase delayed |
| A-3 | TwinMOS provides high-res product images by Week 6 | Product pages incomplete at launch |
| A-4 | TwinMOS provides distributor/retailer data by Week 8 | Where to Buy feature incomplete |
| A-5 | TwinMOS provides legal page content by Week 14 | Legal pages use placeholder text |
| A-6 | TwinMOS marketing dedicates 0.5 FTE to content | Content delays; launch postponement |
| A-7 | Domain (twinmos.com) and DNS control available | Re-domain required |
| A-8 | Third-party service accounts (GA4, GTM, etc.) provisioned by Week 3 | Integration delays |

### 12. Signatures

This Statement of Work is executed under and subject to the terms of the Master Service Agreement (TWN-LEGAL-MSA-2026-001).

**TwinMOS Technologies Middle East FZE**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Authorized Signatory | | _______________ | _________ |

**Unisoft Solutions Ltd.**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Authorized Signatory | | _______________ | _________ |

---

## Appendix: SOW Template for Future Phases

### SOW-[###]: [Phase Title]

Use the following template for SOW-002 (Phase 2), SOW-003 (Phase 3), and any additional SOWs:

```
### 1. SOW Identification
- SOW Number: SOW-[###]
- SOW Title: [Phase Title]
- Parent MSA: TWN-LEGAL-MSA-2026-001
- BRD Reference: [Relevant BRD sections]
- Previous SOW: SOW-[###-1]

### 2. SOW Overview and Objectives
[2–3 paragraphs describing the phase purpose and key objectives]

### 3. Scope of Services
#### 3.1 In-Scope Deliverables
[Table of deliverables with descriptions and acceptance criteria]

#### 3.2 Out-of-Scope
[List of explicitly excluded items]

### 4. Timeline and Milestones
[Phase schedule with weeks/months and critical milestones]

### 5. Resource Plan
[Team composition and TwinMOS responsibilities]

### 6. Fees and Payment Schedule
[Fee breakdown and payment milestones]

### 7. Acceptance Criteria and Process
[Deliverable acceptance criteria and process]

### 8. Change Control
[Change request process]

### 9. Risk Management
[Risk register]

### 10. Reporting and Governance
[Reporting schedule]

### 11. Assumptions and Dependencies
[Key assumptions]

### 12. Signatures
[Signature blocks]
```

---

**Document Control**

| Version | Date | Author | Changes | Approved By |
|---------|------|--------|---------|-------------|
| 0.1 | 1 May 2026 | TwinMOS Legal (Draft) | Initial draft with SOW-001 pre-populated | — |
| 1.0 | [DATE] | — | Final version for execution | — |

**Next Review:** Upon SOW execution or material scope change
