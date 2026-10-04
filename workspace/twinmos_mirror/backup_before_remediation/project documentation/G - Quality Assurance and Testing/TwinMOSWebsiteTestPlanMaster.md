# TwinMOS Corporate Website — Master Test Plan

**Document Reference:** TWN-QA-MASTER-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Owner:** QA Lead  
**Synchronized With:** QA Strategy v1.0, BRD v3.0, URD v3.0, Tech Stack v1.1

---

## 1. Purpose

This Master Test Plan (MTP) is the central document that governs all testing activities for the TwinMOS corporate website. It defines what will be tested, how it will be tested, who will perform the testing, and when testing occurs across Phases 1–3.

All subsidiary test plans (unit, integration, E2E, accessibility, performance, security, UAT) derive their scope and schedule from this document.

---

## 2. Test Scope Overview

### 2.1 Features in Scope

| Feature Area | BRD Section | URD Epic | Phase | Test Plans |
|-------------|-------------|----------|-------|-----------|
| Product Discovery & Catalog | §8 | UR-Epic 1 | P1 | Unit, E2E, API, Accessibility |
| Compatibility Finder | §9 | UR-Epic 2 | P1/P2 | Unit, E2E, API, Performance |
| Where to Buy / Locator | §10 | UR-Epic 3 | P1 | E2E, API, Accessibility |
| Lead Generation & Forms | §11 | UR-Epic 4 | P1 | E2E, API, Security, Accessibility |
| Content Management (CMS) | §12 | UR-Epic 5 | P1 | Integration, API, Accessibility |
| Support & Self-Service | §13 | UR-Epic 6 | P1/P2 | E2E, API, Accessibility |
| Partner / Distributor Portal | §14 | UR-Epic 7 | P2 | E2E, Security, API, Accessibility |
| Gaming Hub — VOLTX | §15 | UR-Epic 8 | P1/P2 | E2E, Accessibility, Performance |
| Multi-Language & RTL | §16 | UR-Epic 9 | P2 | E2E, Accessibility, Visual Regression |
| Admin & CMS | §17 | UR-Epic 10 | P1 | Integration, API, Security |
| Solutions / Verticals | §11 | UR-Epic 11 | P1 | E2E, Accessibility |
| Technology / R&D | §12 | UR-Epic 12 | P1 | E2E, Accessibility |
| Learn / Knowledge Hub | §13 | UR-Epic 13 | P1 | E2E, Accessibility |
| Careers | §14 | UR-Epic 14 | P1 | E2E, API, Accessibility |
| Marketing Programs | §15 | UR-Epic 15 | P1/P3 | E2E, API |
| Compliance & Legal | §16 | UR-Epic 16 | P1 | E2E, Accessibility |
| Anti-Counterfeit | §17 | UR-Epic 17 | P2 | E2E, API, Security |
| Channel Programs | §18 | UR-Epic 18 | P2/P3 | E2E, API, Security |
| E-Commerce (P3) | BRD §6.1 | — | P3 | E2E, Security, Performance, API |

### 2.2 Non-Functional Requirements in Scope

| NFR | BRD Section | Test Approach |
|-----|-------------|---------------|
| Performance (Core Web Vitals) | §20.1 | Lighthouse CI + k6 |
| API Performance | §20.2 | k6 + Supertest |
| Concurrent User Capacity | §20.3 | k6 load tests |
| Security (OWASP Top 10) | §21 | ZAP + Snyk + pen-test |
| Accessibility (WCAG 2.1 AA) | §24 | axe-core + NVDA/JAWS/VO/TalkBack |
| Compliance (GDPR/PDPL/DPDP) | §22.1 | E2E consent flows + data-deletion tests |
| Disaster Recovery | §23.3 | DR drill + smoke tests |
| SEO | BRD §28.1 | Automated meta validation + Lighthouse |

---

## 3. Test Levels

### 3.1 Level Definitions

| Level | Objective | Responsibility | Trigger |
|-------|-----------|---------------|---------|
| **Unit** | Validate individual functions, utilities, and business logic in isolation | Developer (Dev A / Dev B) | Every PR |
| **Component** | Validate React islands and Astro components in isolation | Developer (Dev A) | Every PR |
| **Integration** | Validate Strapi controllers, API routes, and service interactions | Developer (Dev B) | Every PR |
| **API Contract** | Validate public and admin API endpoints against spec | QA Lead + Dev B | Every PR + nightly |
| **E2E** | Validate complete user journeys across frontend + backend | QA Lead + Dev A | Every PR + nightly |
| **Accessibility** | Validate WCAG 2.1 AA compliance | QA Lead + Dev A | Every PR + monthly manual |
| **Performance** | Validate Core Web Vitals and API response times | QA Lead + Dev A | Every PR + pre-release |
| **Security** | Validate OWASP Top 10 and vulnerability posture | QA Lead + Dev B | Weekly + pre-release |
| **UAT** | Validate business requirements with stakeholders | TwinMOS stakeholders | Per phase |

### 3.2 Test Level Coverage Matrix

| Feature | Unit | Component | Integration | API | E2E | A11y | Perf | Sec | UAT |
|---------|------|-----------|-------------|-----|-----|------|------|-----|-----|
| Homepage | — | ✅ | — | — | ✅ | ✅ | ✅ | — | ✅ |
| Product Catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Product Detail | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Compatibility Finder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Where to Buy | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Contact Forms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Warranty Registration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| RMA Portal (P2) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Partner Portal (P2) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Anti-Counterfeit (P2) | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| E-Commerce Checkout (P3) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| News / Events | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| KB / Support | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Careers | — | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | ✅ |
| Legal / Compliance | — | — | — | — | ✅ | ✅ | — | — | ✅ |
| CMS Admin | — | — | ✅ | ✅ | — | ✅ | — | ✅ | ✅ |
| i18n / RTL (P2) | ✅ | ✅ | — | — | ✅ | ✅ | — | — | ✅ |
| Search (MeiliSearch) | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |

---

## 4. Test Schedule

### 4.1 Phase 1 — Core Website (Months 1–5)

| Week | Activity | Deliverable |
|------|----------|-------------|
| 1–2 | Scaffold test infrastructure; Vitest + Playwright + axe-core + Lighthouse CI baseline | CI pipeline green on skeleton |
| 3–4 | Unit tests for utilities, helpers, form validation | >= 50 % coverage |
| 5–8 | Component tests for site-wide components; E2E for homepage, navigation | Component test suite |
| 9–12 | E2E for catalog, product detail, compatibility MVP, where-to-buy, forms | 10 critical E2E scenarios |
| 13–14 | Accessibility audit (axe-core + NVDA manual top 30); performance baseline | Accessibility report |
| 15–16 | Security scan (ZAP baseline); cross-browser burst (BrowserStack) | Security report |
| 17 | Alpha UAT (internal); defect remediation | Alpha sign-off |
| 18 | Beta UAT (Marketing + Sales); defect remediation | Beta sign-off |
| 19 | Stakeholder UAT (Chairman + GM); soft launch | Stakeholder sign-off |
| 20 | Public launch; hypercare monitoring | Launch report |

### 4.2 Phase 2 — Localization & Partner Enablement (Months 6–9)

| Month | Activity | Deliverable |
|-------|----------|-------------|
| 6 | Partner portal E2E + security tests; anti-counterfeit E2E | 3 new E2E suites |
| 7 | RMA portal full workflow E2E; compatibility finder full algorithm tests | RMA E2E suite |
| 8 | Live chat E2E; gaming hub interactive E2E; RTL visual regression | Visual regression baseline |
| 9 | Locale-specific accessibility (Arabic NVDA); Phase 2 UAT | Phase 2 sign-off |

### 4.3 Phase 3 — Commerce & Advanced Features (Months 10–15)

| Month | Activity | Deliverable |
|-------|----------|-------------|
| 10–11 | E-commerce unit + E2E tests (cart, checkout, accounts) | Commerce E2E suite |
| 12 | E-commerce security pass; RU/ZH/FR locale E2E | Security report |
| 13 | Marketing automation E2E; analytics event validation | Analytics test suite |
| 14 | Loyalty / referral / MDF E2E | Programs E2E suite |
| 15 | Full regression suite execution; Phase 3 UAT; launch | Phase 3 sign-off |

---

## 5. Test Deliverables

| Deliverable | Owner | Due Date | Location |
|-------------|-------|----------|----------|
| QA Strategy | QA Lead | Week 2 | This folder |
| Master Test Plan | QA Lead | Week 2 | This document |
| Unit Test Plan | Dev A / Dev B | Week 4 | TwinMOSWebsiteUnitTestPlan.md |
| Integration Test Plan | Dev B | Week 6 | TwinMOSWebsiteIntegrationTestPlan.md |
| E2E Test Scenarios | QA Lead | Week 8 | TwinMOSWebsiteE2ETestScenarios_Playwright.md |
| API Test Plan | Dev B | Week 6 | TwinMOSWebsiteAPITestPlan_Bruno.md |
| UAT Plan | QA Lead | Week 14 | TwinMOSWebsiteUAT_Plan.md |
| UAT Test Scripts | QA Lead | Week 16 | TwinMOSWebsiteUATTestScripts.md |
| UAT Sign-Off Form | QA Lead | Week 19 | TwinMOSWebsiteUATSignOff_Form.md |
| Accessibility Test Plan | QA Lead | Week 10 | TwinMOSWebsiteAccessibilityTestPlanaxeNVDA.md |
| Performance Test Plan | QA Lead | Week 12 | TwinMOSWebsitePerformanceTestPlan_k6.md |
| Lighthouse CI Config | Dev A | Week 2 | TwinMOSWebsiteLighthouseCIConfiguration.md |
| Security Test Plan | QA Lead | Week 10 | TwinMOSWebsiteSecurityTestPlanOWASPZAP.md |
| Cross-Browser Matrix | QA Lead | Week 14 | TwinMOSWebsiteCrossBrowserCompatibility_Matrix.md |
| Mobile Device Matrix | QA Lead | Week 14 | TwinMOSWebsiteMobileDeviceTest_Matrix.md |
| Regression Test Plan | QA Lead | Week 16 | TwinMOSWebsiteRegressionTestPlan.md |
| Smoke Test Plan | QA Lead | Week 2 | TwinMOSWebsiteSmokeTestPlan.md |
| Bug Triage Process | QA Lead | Week 2 | TwinMOSWebsiteBugTriageProcess.md |
| Bug Severity Definitions | QA Lead | Week 2 | TwinMOSWebsiteBugSeverityDefinitions.md |
| Test Data Strategy | QA Lead | Week 4 | TwinMOSWebsiteTestDataStrategy.md |
| Visual Regression Plan | QA Lead | Month 6 | TwinMOSWebsiteVisualRegressionTest_Plan.md |

---

## 6. Resource Requirements

### 6.1 Personnel

| Role | Effort | Phase |
|------|--------|-------|
| QA Lead (full-time from Week 8) | 0.5 FTE Weeks 1–7; 1.0 FTE Weeks 8–20 | P1 |
| Dev A (frontend testing) | 0.2 FTE ongoing | P1–P3 |
| Dev B (backend testing) | 0.2 FTE ongoing | P1–P3 |
| TwinMOS Marketing (UAT) | 1 week per phase | P1–P3 |
| TwinMOS IT Lead (security review) | 0.1 FTE ongoing | P1–P3 |
| Penetration test vendor | 1 week pre-launch per phase | P1–P3 |

### 6.2 Tools & Licenses

| Tool | Cost | Phase |
|------|------|-------|
| BrowserStack (annual) | ~$1,200 | P1–P3 |
| Sentry Team tier | $26/mo | P2–P3 |
| GitHub Copilot x2 | $20/mo | P1–P3 |
| Lighthouse CI | Free (OSS) | P1–P3 |
| k6 Cloud (optional) | $0–$100/mo | P1–P3 |
| OWASP ZAP | Free (OSS) | P1–P3 |
| axe DevTools Pro | $40/mo | P1–P3 |
| Penetration tests | $3,000–8,000 per phase | P1–P3 |

---

## 7. Assumptions & Dependencies

### 7.1 Assumptions

1. Staging environment is provisioned by Week 3 and mirrors production.
2. Test data is available and sanitized by Week 4 (see Test Data Strategy).
3. Both developers commit to writing tests alongside feature code (TDD preferred).
4. TwinMOS stakeholders are available for UAT windows as scheduled.
5. Translation vendor delivers AR/BN/HI content by Month 6 for locale testing.

### 7.2 Dependencies

| Dependency | Required By | Risk if Missing |
|------------|-------------|-----------------|
| Strapi collections stable | Week 4 | Integration tests blocked |
| Design system (Figma) approved | Week 3 | Visual regression baseline blocked |
| QVL data (top 500 motherboards) | Month 7 | Compatibility finder full tests blocked |
| Valid serial data ingest | Month 6 | Anti-counterfeit tests blocked |
| Stripe test account | Month 10 | E-commerce checkout tests blocked |

---

## 8. Entry & Exit Criteria Summary

### 8.1 Master Test Plan Entry Criteria

- [ ] QA Strategy approved and signed.
- [ ] Test infrastructure (CI, environments, tools) provisioned.
- [ ] Test data strategy approved.
- [ ] BRD v3.0 and URD v3.0 baselined; no major requirement changes expected.

### 8.2 Master Test Plan Exit Criteria (Per Phase)

- [ ] All test plans for the phase are executed.
- [ ] All quality gates (G1–G10) are green.
- [ ] UAT sign-off obtained.
- [ ] Security scan and pen-test (if applicable) are clean.
- [ ] Defect backlog has zero S1/S2 items.
- [ ] Test coverage meets phase target.
- [ ] All test artifacts archived.

---

## 9. Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| QA Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| TwinMOS IT/Technical Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Phase 1 Week 17 (pre-UAT)  
**Canonical Location:** `G - Quality Assurance and Testing/TwinMOSWebsiteTestPlanMaster.md`
