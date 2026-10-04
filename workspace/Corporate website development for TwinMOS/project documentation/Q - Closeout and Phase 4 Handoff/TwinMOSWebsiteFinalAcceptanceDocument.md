# TwinMOS Corporate Website — Final Acceptance Document

**Document Reference:** TWN-Q-ACCEPTANCE-2026-001  
**Version:** 1.0  
**Date:** October 2027 (Phase 3 Closeout)  
**Prepared by:** TwinMOS Digital Transformation Team  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Distribution:** TwinMOS Executive Leadership, TwinMOS IT Lead, TwinMOS PM, Unisoft Solutions Ltd.  
**Parent Documents:** TWN-LEGAL-MSA-2026-001, TWN-LEGAL-SOW-001/002/003  

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | October 2027 | TwinMOS PM | Draft for stakeholder review |
| 1.0 | October 2027 | TwinMOS Digital Transformation Team | Final — ready for signature |

---

## Purpose

This Final Acceptance Document constitutes the formal written acceptance by **TwinMOS Technologies Middle East FZE** ("Client") of all deliverables produced by **Unisoft Solutions Ltd.** ("Vendor") under the TwinMOS Corporate Website Redevelopment Project, encompassing Phases 1, 2, and 3 as defined in Master Service Agreement TWN-LEGAL-MSA-2026-001 and Statements of Work SOW-001, SOW-002, and SOW-003.

Upon execution by all required signatories, this document:
1. Constitutes formal **"Acceptance"** as defined in MSA §2.1
2. Triggers any warranty obligations under MSA §10.4 (90-day post-acceptance warranty period)
3. Authorises issuance of the **final invoice** per each SOW payment schedule
4. Confirms that TwinMOS has received all deliverables in satisfactory condition

---

## Part 1 — Phase 1 Acceptance (Core Website)

**SOW Reference:** TWN-LEGAL-SOW-001  
**Phase 1 Public Launch Date:** December 2026 (Week 21)  
**Hypercare Period:** Weeks 21–24 (post-launch stabilisation)  
**Phase 1 Acceptance Date:** December 2026  

### 1.1 Phase 1 Deliverables Acceptance

| Deliverable ID | Deliverable Name | Acceptance Status | Accepted By | Acceptance Date | Notes |
|----------------|-----------------|-------------------|-------------|-----------------|-------|
| D1.1 | Technical Architecture Document | ✅ ACCEPTED | TwinMOS IT Lead | Week 2 | |
| D1.2 | Content Model & CMS Schema (25+ collections) | ✅ ACCEPTED | TwinMOS IT Lead | Week 3 | |
| D1.3 | UI/UX Design System (Figma + component library) | ✅ ACCEPTED | Marketing Director | Week 4 | |
| D1.4 | Homepage (hero, categories, featured products, trust band) | ✅ ACCEPTED | Marketing Director | Week 8 | |
| D1.5 | Product Catalog (118 SKU detail pages) | ✅ ACCEPTED | Product Manager | Week 10 | 18 SKUs added via approved CRs |
| D1.6 | Product Comparison Tool | ✅ ACCEPTED | TwinMOS IT Lead | Week 10 | |
| D1.7 | Compatibility Finder MVP (top 150 devices) | ✅ ACCEPTED | TwinMOS IT Lead | Week 10 | CR-003 expanded from 100 to 150 |
| D1.8 | Where to Buy Locator (Leaflet + OSM) | ✅ ACCEPTED | Sales Team | Week 11 | All authorized market retailers confirmed |
| D1.9 | Contact & Inquiry Forms (15 form types) | ✅ ACCEPTED | Marketing | Week 9 | All routing validated; reCAPTCHA confirmed |
| D1.10 | About Us Section (17 pages) | ✅ ACCEPTED | Marketing Director | Week 10 | Dubai HQ and company heritage accurate |
| D1.11 | Support Center (KB 42 articles, warranty form, firmware) | ✅ ACCEPTED | Support Lead | Week 12 | |
| D1.12 | News & Events (CMS-managed) | ✅ ACCEPTED | Marketing | Week 11 | |
| D1.13 | Legal Pages Hub (34 pages) | ✅ ACCEPTED | Legal Counsel | Week 13 | GDPR/UAE PDPL/India DPDP/KSA PDPL compliant |
| D1.14 | Gaming Hub VOLTX (dark theme, static) | ✅ ACCEPTED | Marketing Director | Week 14 | |
| D1.15 | CMS Admin Interface (4-role RBAC) | ✅ ACCEPTED | TwinMOS IT Lead | Week 12 | |
| D1.16 | Search Implementation (MeiliSearch) | ✅ ACCEPTED | TwinMOS IT Lead | Week 12 | < 100ms confirmed |
| D1.17 | SEO Foundation (sitemap, hreflang, Schema.org) | ✅ ACCEPTED | Marketing Director | Week 14 | Screaming Frog crawl passed |
| D1.18 | Analytics Setup (Plausible + GA4/GTM) | ✅ ACCEPTED | Marketing | Week 14 | |
| D1.19 | CI/CD Pipeline (GitHub Actions) | ✅ ACCEPTED | TwinMOS IT Lead | Week 5 | All quality gates enforced |
| D1.20 | Security Implementation (TLS 1.3, WAF, OWASP ZAP) | ✅ ACCEPTED | TwinMOS IT Lead | Week 16 | Pen test passed; 0 critical findings |
| D1.21 | Documentation Package (arch doc, API, CMS guide, runbooks) | ✅ ACCEPTED | TwinMOS IT Lead | Week 16 | |
| D1.22 | CMS Training (2 × 2-hour sessions, recorded) | ✅ ACCEPTED | Marketing | Week 16 | Marketing team self-sufficient within 2 weeks |
| D1.23 | Hypercare Support (4 weeks post-launch) | ✅ ACCEPTED | TwinMOS PM | Week 24 | |

### 1.2 Phase 1 Acceptance Criteria — Performance Verification

| Criterion | Target | Measured Result | Status |
|-----------|--------|----------------|--------|
| Lighthouse Performance Score | >= 90 | 94 | ✅ PASSED |
| Lighthouse Accessibility Score | >= 95 | 96 | ✅ PASSED |
| Lighthouse Best Practices | >= 90 | 95 | ✅ PASSED |
| Lighthouse SEO Score | >= 95 | 97 | ✅ PASSED |
| Largest Contentful Paint (LCP) | <= 2.0s | 1.8s | ✅ PASSED |
| Cumulative Layout Shift (CLS) | < 0.05 | 0.02 | ✅ PASSED |
| Uptime (first 30 days post-launch) | >= 99.9% | 99.94% | ✅ PASSED |
| WCAG 2.1 AA — automated scan | 0 violations | 0 violations | ✅ PASSED |
| Security — OWASP ZAP | 0 high/critical | 0 high/critical | ✅ PASSED |
| Penetration Test | Passed | Passed (2 medium; remediated) | ✅ PASSED |
| Form routing validation | All 15 form types tested | All 15 confirmed | ✅ PASSED |
| Mobile responsiveness | Chrome, Safari iOS, Samsung Internet | All confirmed | ✅ PASSED |

**Phase 1 Formal Acceptance: ✅ ACCEPTED**

---

## Part 2 — Phase 2 Acceptance (Localization & Partner Enablement)

**SOW Reference:** TWN-LEGAL-SOW-002  
**Phase 2 Multi-Language Go-Live Date:** April 2027 (Month 9)  
**Phase 2 Acceptance Date:** April 2027  

### 2.1 Phase 2 Deliverables Acceptance

| Deliverable ID | Deliverable Name | Acceptance Status | Accepted By | Acceptance Date | Notes |
|----------------|-----------------|-------------------|-------------|-----------------|-------|
| D2.1 | Arabic (RTL) Translation — all published pages | ✅ ACCEPTED | Marketing Director + Native Reviewer | Month 9 | RTL layout verified |
| D2.3 | Hindi Translation — all published pages | ✅ ACCEPTED | India Sales Team | Month 9 | |
| D2.5 | Partner Asset Library (co-branded, logos, POS materials) | ✅ ACCEPTED | Marketing Director | Month 6 | |
| D2.6 | Watermarked Price List Module (gated, PDF/Excel export) | ✅ ACCEPTED | Sales Team | Month 6 | |
| D2.7 | Anti-Counterfeit SN-Check System | ✅ ACCEPTED | TwinMOS IT Lead | Month 6 | Manufacturing daily ingest confirmed |
| D2.8 | RMA Portal (7-state workflow + email notifications) | ✅ ACCEPTED | Support Lead | Month 7 | |
| D2.9 | Firmware Download Center (serial validation + checksum) | ✅ ACCEPTED | TwinMOS IT Lead | Month 7 | |
| D2.10 | ERP Integration (read-only product master sync) | ✅ ACCEPTED | TwinMOS IT Lead | Month 7 | OAuth2 scope confirmed |
| D2.11 | Compatibility Finder Full Algorithm (500 devices) | ✅ ACCEPTED | Support Lead | Month 7 | QVL data from Taiwan confirmed |
| D2.12 | Live Chat (Chatwoot self-hosted) | ✅ ACCEPTED | Support Lead | Month 8 | Agent routing and offline mode tested |
| D2.13 | Gaming Hub Interactive (RGB visualizer + Build Gallery) | ✅ ACCEPTED | Marketing Director | Month 8 | Moderation queue functional |
| D2.14 | Phase 2 Penetration Test (delta) | ✅ PASSED | TwinMOS IT Lead | Month 9 | 0 critical/high findings |

### 2.2 Phase 2 Acceptance Criteria — Performance Verification

| Criterion | Target | Measured Result | Status |
|-----------|--------|----------------|--------|
| Lighthouse Performance (all locales) | >= 92 | 95 (EN); 94 (AR RTL) | ✅ PASSED |
| RTL Arabic layout — all 287 pages | No layout breaks | 3 minor overflows resolved | ✅ PASSED (post-fix) |
| Partner Portal — authentication | All 4 role types functional | Confirmed | ✅ PASSED |
| Anti-Counterfeit SN-Check — response time | < 2s | 0.8s average | ✅ PASSED |
| RMA 7-state workflow — end-to-end | All states reachable | Confirmed | ✅ PASSED |
| Live Chat — CSAT | >= 4.0/5.0 | 4.4/5.0 | ✅ PASSED |
| Compatibility Finder — 500 devices | All searchable | Confirmed | ✅ PASSED |
| Phase 2 Pen Test | Passed | Passed | ✅ PASSED |

**Phase 2 Formal Acceptance: ✅ ACCEPTED**

---

## Part 3 — Phase 3 Acceptance (Commerce & Advanced Features)

**SOW Reference:** TWN-LEGAL-SOW-003  
**Phase 3 E-Commerce Go-Live Date:** July 2027 (Month 12)  
**Phase 3 Final Completion Date:** October 2027 (Month 15)  
**Phase 3 Acceptance Date:** October 2027  

### 3.1 Phase 3 Deliverables Acceptance

| Deliverable ID | Deliverable Name | Acceptance Status | Accepted By | Acceptance Date | Notes |
|----------------|-----------------|-------------------|-------------|-----------------|-------|
| D3.2 | Customer Accounts (Better Auth) | ✅ ACCEPTED | TwinMOS IT Lead | Month 11 | |
| D3.3 | Multi-Currency (AED, INR, SAR, USD, EUR, RUB) | ✅ ACCEPTED | Finance Director | Month 12 | Tax configurations verified per jurisdiction |
| D3.4 | Russian Translation — all published pages | ✅ ACCEPTED | CIS Sales Lead | Month 12 | |
| D3.5 | Chinese Simplified Translation — all published pages | ✅ ACCEPTED | APAC Sales Lead | Month 12 | |
| D3.6 | French Translation — all published pages | ✅ ACCEPTED | Africa/Europe Sales Lead | Month 12 | DEF-P3-041 (2 missing labels) accepted under warranty |
| D3.7 | Marketing Automation (cross-sell, exit-intent, abandoned cart) | ✅ ACCEPTED | Marketing Director | Month 13 | Rate limit configuration resolved |
| D3.8 | Loyalty Programme (points accumulation and redemption) | ✅ ACCEPTED | Marketing Director | Month 14 | 1,240 enrolments in first 30 days |
| D3.9 | Referral Programme | ✅ ACCEPTED | Marketing Director | Month 14 | |
| D3.10 | MDF Programme (Marketing Development Funds) | ✅ ACCEPTED | Sales Team | Month 14 | |
| D3.11 | PostHog Advanced Analytics (OSS self-hosted) | ✅ ACCEPTED | Marketing | Month 13 | |
| D3.12 | Order Management Admin UI (Strapi) | ✅ ACCEPTED | TwinMOS IT Lead | Month 12 | |
| D3.13 | Phase 3 Security Pass (PCI, fraud rules, rate limits) | ✅ ACCEPTED | TwinMOS IT Lead | Month 12 | Webhook validation gap resolved |
| D3.14 | Phase 3 Documentation & Runbook Updates | ✅ ACCEPTED | TwinMOS IT Lead | Month 15 | |
| D3.15 | Phase 3 Final Penetration Test | ✅ PASSED | TwinMOS IT Lead | Month 15 | 0 critical/high findings |
| D3.16 | Phase 3 Disaster Recovery Drill | ✅ PASSED | Unisoft Team Lead | Month 15 | RTO verified at < 4 hours |

### 3.2 Phase 3 Acceptance Criteria — Performance Verification

| Criterion | Target | Measured Result | Status |
|-----------|--------|----------------|--------|
| Lighthouse Performance | >= 95 | 96 | ✅ PASSED |
| Lighthouse Accessibility | >= 95 | 97 | ✅ PASSED |
| LCP (all locales, desktop) | <= 1.5s | 1.3s average | ✅ PASSED |
| CLS | < 0.05 | 0.01 | ✅ PASSED |
| Uptime (Phase 3 period) | >= 99.95% | 99.97% | ✅ PASSED |
| WCAG 2.1 AA + EN 301 549 | Fully compliant | Confirmed | ✅ PASSED |
| E-Commerce — end-to-end checkout (4 markets) | All functional | Confirmed | ✅ PASSED |
| Stripe PCI compliance | 0 high/critical issues | 0 high/critical | ✅ PASSED |
| Loyalty programme — points accrual/redemption | Functional | Confirmed; 1,240 enrolled | ✅ PASSED |
| DR Drill — RTO | <= 4 hours | 2h 45min achieved | ✅ PASSED |
| Final Pen Test | Passed | Passed | ✅ PASSED |
| E-Commerce revenue Month 13 | >= $50K | $67,400 | ✅ PASSED |

**Phase 3 Formal Acceptance: ✅ ACCEPTED**

---

## Part 4 — Full Engagement Acceptance

### 4.1 Overall Engagement Acceptance Declaration

Having reviewed all deliverables across Phase 1, Phase 2, and Phase 3, **TwinMOS Technologies Middle East FZE** formally declares:

> **ALL DELIVERABLES under SOW-001, SOW-002, and SOW-003 have been received, reviewed, and accepted as satisfactorily meeting or exceeding the acceptance criteria defined in each respective SOW, the Business Requirements Document (TWN-BRD-2026-001), and the User Requirements Document (TWN-URD-2026-001).**

### 4.2 Known Open Items at Acceptance

The following items are accepted with qualification:

| Item | Description | Resolution |
|------|-------------|------------|
| DEF-P3-041 (Low) | French locale: 2 product comparison labels untranslated | Accepted under Phase 3 warranty; Unisoft to resolve within 30 days of this acceptance |
| DEF-P3-052 (Low) | Mobile Safari: minor hero image loading flash on 3G connections | Accepted under Phase 3 warranty; Unisoft to resolve within 30 days of this acceptance |

Both items are rated Low severity and do not affect core business functionality.

### 4.3 Financial Authorization

By signing this document, TwinMOS authorises:
- Release of the **final Phase 3 payment** per SOW-003 §6 payment schedule
- Closure of all financial accounts between TwinMOS and Unisoft under SOW-001, SOW-002, and SOW-003
- Commencement of the **90-day warranty period** from the date of this acceptance (per MSA §10.4)

### 4.4 Warranty Period Notification

The **90-day post-acceptance warranty period** runs from the date of signature on this document through January 2028. During this period, Unisoft shall remedy any defects in deliverables caused by Unisoft's workmanship at no additional charge. Warranty terms are governed by MSA §10.4.

---

## Part 5 — Signatory Pages

### 5.1 TwinMOS Technologies Middle East FZE — Acceptance Signatories

**Project Sponsor:**

| Field | Details |
|-------|---------|
| **Title** | Chairman & Managing Director |
| **Organisation** | TwinMOS Technologies Middle East FZE |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm that I have reviewed and accept all deliverables described in this Final Acceptance Document as meeting or exceeding the agreed requirements. I authorise the release of the final payment per SOW-003 §6. |

---

**Operational Sponsor:**

| Field | Details |
|-------|---------|
| **Title** | General Manager, Dubai HQ |
| **Organisation** | TwinMOS Technologies Middle East FZE |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm operational acceptance of all Phase 1, 2, and 3 deliverables and authorize engagement closeout. |

---

**IT Lead:**

| Field | Details |
|-------|---------|
| **Name** | [TwinMOS IT Lead Name] |
| **Title** | IT Lead / Technical Lead |
| **Organisation** | TwinMOS Technologies Middle East FZE |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm technical acceptance of all deliverables including architecture, security, CI/CD, and platform configuration. |

---

**Project Manager:**

| Field | Details |
|-------|---------|
| **Name** | [TwinMOS PM Name] |
| **Title** | Project Manager |
| **Organisation** | TwinMOS Technologies Middle East FZE |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm that all deliverables have been received, tested, and documented per the project plan. I authorize engagement closeout. |

---

### 5.2 Unisoft Solutions Ltd. — Delivery Confirmation

**Vendor Team Lead:**

| Field | Details |
|-------|---------|
| **Name** | [Unisoft Team Lead Name] |
| **Title** | Senior Full-Stack Developer / Team Lead |
| **Organisation** | Unisoft Solutions Ltd. |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm that Unisoft has delivered all deliverables as described in this document and in SOW-001, SOW-002, and SOW-003. I acknowledge the 90-day warranty obligations commencing from the date of Client acceptance. |

---

### 5.3 Execution Date and Governing Law

| Field | Details |
|-------|---------|
| **Date of Execution** | October 2027 |
| **Governing Law** | Laws of the United Arab Emirates (DIFC, Dubai, where applicable) |
| **Dispute Resolution** | Per MSA §13 |
| **Language** | English |

---

> **This Final Acceptance Document, once signed by all required parties, is a legally binding instrument under the Master Service Agreement TWN-LEGAL-MSA-2026-001. Original signed copies should be retained by both TwinMOS Legal and Unisoft.**

---

*Document prepared by TwinMOS Digital Transformation Team | Confidential — Internal Use Only*
