# TwinMOS Corporate Website — Quality Assurance Strategy

**Document Reference:** TWN-QA-STRAT-2026-001  
**Document Version:** 1.0  
**Status:** FINAL — for Unisoft Engineering & TwinMOS Leadership Sign-Off  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** QA Lead / IT-Technical Lead (Implementation)  
**Audience:** Unisoft engineering team, TwinMOS leadership, Marketing, Legal, Security  
**Classification:** CONFIDENTIAL — Unisoft + TwinMOS Internal Use  
**Synchronized With:** RFP v3.0, BRD v3.0, URD v3.0, Tech Stack v1.1, Implementation Strategy v3.0, Content Map v1.0

---

## 1. Executive Summary

This document defines the **comprehensive Quality Assurance (QA) Strategy** for the TwinMOS corporate website redevelopment project. It governs how quality is built into every phase of delivery — from Sprint 0 through Phase 3 launch and ongoing operations — ensuring the site meets enterprise-grade standards for performance, accessibility, security, reliability, and user experience.

The strategy is anchored in four pillars:

1. **Shift-Left Quality** — Quality gates are enforced from the first commit, not at the end of a phase.
2. **Automated-First** — All repeatable tests (unit, integration, E2E, accessibility, performance, security) are automated and run in CI/CD.
3. **User-Centric Validation** — UAT, usability testing, and manual accessibility audits ensure the site works for real users, not just test scripts.
4. **Continuous Improvement** — Metrics, retrospectives, and root-cause analysis drive ongoing quality uplift.

**Key Targets (from BRD §20, §21, §24; Tech Stack §21–22):**

| Target | Value | Source |
|--------|-------|--------|
| Lighthouse Performance | >= 90 every page | BRD §28.1 |
| Lighthouse Accessibility | >= 95 | Tech Stack §1.2 |
| WCAG 2.1 AA + EN 301 549 | Full compliance | BRD §22.2, RFP §11.2 |
| OWASP Top 10 | Zero high/critical findings | BRD §21 |
| Unit-test coverage (business logic) | 100 % | Tech Stack §21.1 |
| Overall test coverage | >= 70 % Phase 1; >= 80 % Phase 3 | Implementation Strategy §11.6 |
| Uptime | >= 99.9 % | BRD §23, RFP §6.3 |
| RTO / RPO | <= 4 h / <= 15 min | BRD §23.3 |

---

## 2. Scope & Boundaries

### 2.1 In Scope

All testing activities for the TwinMOS corporate website across:

- **Frontend (Astro 5 + React islands)** — Static pages, dynamic islands, routing, i18n, RTL, SEO, analytics
- **Backend (Strapi v5)** — CMS APIs, custom controllers, webhooks, auth, plugins
- **Database (PostgreSQL 16)** — Schema integrity, migrations, data consistency
- **Search (MeiliSearch)** — Indexing, query accuracy, faceting, multilingual tokenization
- **Integrations** — Resend, GA4/GTM, Plausible, Sentry, Cloudflare, HubSpot CRM, Stripe (P3)
- **Third-party services** — Maps (Leaflet/MapLibre), ImgProxy, Chatwoot (P2), Medusa.js (P3)
- **Content** — 287 content entries, 100+ SKU pages, 34 legal pages, 28 regional landings

### 2.2 Out of Scope

- TwinMOS ERP/CRM system testing (integration tested at API boundary only)
- Manufacturing QA (covered in `content/website-content/02-about/05-quality-assurance.md`)
- Physical product testing (DRAM, SSD, portable storage)
- Third-party SaaS SLA validation (e.g., Cloudflare, Stripe) — monitored but not tested by this team

### 2.3 Phase Boundaries

| Phase | Months | QA Focus |
|-------|--------|----------|
| Phase 1 — Core Website | 1–5 | Foundation gates, unit + E2E baseline, accessibility baseline, performance baseline, security baseline, UAT |
| Phase 2 — Localization & Partner Enablement | 6–9 | RTL/regression, partner portal security, RMA workflow E2E, anti-counterfeit E2E, locale-specific accessibility |
| Phase 3 — Commerce & Advanced Features | 10–15 | E-commerce E2E, payment security (PCI scope), load testing at scale, advanced analytics validation |
| Phase 4+ — Ongoing | 16+ | Regression automation, continuous monitoring, periodic pen-tests, accessibility audits |

---

## 3. QA Governance & RACI

### 3.1 Roles

| Role | Responsibility | Person |
|------|---------------|--------|
| **QA Lead** | Strategy, test planning, risk assessment, sign-off gates, stakeholder reporting | (TBC) |
| **Unisoft Team Lead (Dev A)** | Frontend quality, Lighthouse CI, axe-core, Playwright E2E, cross-browser | (TBC) |
| **Unisoft Senior Developer (Dev B)** | Backend quality, API tests, Strapi integration tests, security scans | (TBC) |
| **TwinMOS Marketing Director** | UAT Beta round owner, content accuracy sign-off | (TBC) |
| **TwinMOS IT/Technical Lead** | Infrastructure QA, DR drill validation, security review | (TBC) |

### 3.2 RACI Matrix (Key QA Activities)

| Activity | QA Lead | Dev A | Dev B | Marketing | IT Lead | Chairman |
|----------|---------|-------|-------|-----------|---------|----------|
| QA Strategy & planning | R | C | C | I | I | A |
| Unit test authoring | C | R | R | — | — | — |
| E2E test authoring | R | R | C | — | — | — |
| Accessibility audit | R | R | C | I | — | — |
| Performance test | R | R | C | — | I | — |
| Security scan (ZAP) | R | C | R | — | C | — |
| UAT coordination | R | C | C | R | I | A |
| Bug triage | R | R | R | C | I | — |
| Launch gate decision | C | C | C | C | C | A |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

---

## 4. Testing Philosophy & Principles

### 4.1 TwinMOS QA Philosophy (from Product Culture)

> *"Quality is not an afterthought — it is engineered into every product from the earliest design phase through final shipment."*
>
> This product-level philosophy, documented in [`content/website-content/02-about/05-quality-assurance.md`](../../content/website-content/02-about/05-quality-assurance.md), directly informs our software QA approach:

1. **Prevention over Detection** — Design reviews, pair programming, and static analysis catch defects before they reach test.
2. **Data-Driven Quality** — Every quality decision is backed by metrics (coverage, Lighthouse scores, defect density, MTTR).
3. **Continuous Verification** — Quality gates run on every PR, every deploy, and every scheduled audit.
4. **User-First Validation** — Automated tests verify function; manual tests verify experience.

### 4.2 Core Principles

| Principle | Implementation |
|-----------|---------------|
| **Shift-Left** | Lint, type-check, unit tests, and axe-core run on every PR before human review. |
| **Fail Fast** | CI pipeline stops on first quality gate failure; no merges on red. |
| **Traceability** | Every test maps to a BRD user story, URD requirement, or RFP feature ID. |
| **Independence** | QA Lead has authority to block release regardless of schedule pressure. |
| **Repeatability** | All automated tests are deterministic; flaky tests are fixed or removed within 24 h. |
| **Environment Parity** | Staging mirrors production in data schema, CDN config, and security headers. |

---

## 5. Test Pyramid & Toolchain

### 5.1 Test Pyramid (Tech Stack §21.1)

```
        /\
       /  \     E2E (Playwright) — Critical paths
      /----\    — 10 scenarios, expanding per phase
     /      \
    /--------\  Integration (Vitest + Supertest / Bruno)
   /          \ — All custom controllers, API endpoints
  /------------\\ Component (Testing Library + Astro Container API)
 /              \\— Interactive islands (React)
/----------------\\ Unit (Vitest)
                  \\— Business logic, utilities, helpers
```

### 5.2 Toolchain Summary

| Layer | Tool | Version | Purpose |
|-------|------|---------|---------|
| Unit | Vitest | ^2.x | Business logic, utilities, helpers |
| Component | Testing Library (React) + Astro Container API | ^14.x / Astro native | Interactive island validation |
| Integration | Vitest + Supertest | ^2.x / ^7.x | Strapi custom controllers |
| API | Bruno + Newman | Latest / ^6.x | Public + admin endpoint contracts |
| E2E | Playwright | ^1.49.x | Critical user journeys |
| Accessibility | axe-core + axe-playwright | ^4.10.x | Automated WCAG 2.1 AA checks |
| Visual Regression | Playwright snapshot | ^1.49.x | Baseline comparison (P2+) |
| Performance | Lighthouse CI | ^12.x | Per-page performance auditing |
| Load | k6 | Latest | Concurrency, stress, spike testing |
| Security | OWASP ZAP | Latest | DAST, vulnerability scanning |
| Cross-browser | BrowserStack / Sauce Labs | SaaS | Real device + browser matrix |
| Mobile | BrowserStack App Live | SaaS | iOS + Android real-device testing |
| SCA | Snyk + Dependabot | SaaS | Dependency vulnerability scanning |
| Lint | ESLint + Prettier | ^9.x / ^3.x | Code quality gates |
| Pre-commit | Husky + lint-staged | ^9.x / ^15.x | Local quality gates |

### 5.3 CI/CD Integration

All quality tools are integrated into the GitHub Actions pipeline:

```yaml
# Simplified pipeline (see TwinMOSWebsiteLighthouseCIConfiguration.md for full config)
name: QA Pipeline
on: [push, pull_request]
jobs:
  lint-and-type:
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, lint, type-check]
  unit-tests:
    needs: lint-and-type
    steps: [checkout, setup-node, vitest run --coverage]
  integration-tests:
    needs: unit-tests
    steps: [checkout, setup-node, start-strapi, supertest]
  e2e-tests:
    needs: integration-tests
    steps: [checkout, setup-node, playwright install, playwright test]
  accessibility-audit:
    needs: e2e-tests
    steps: [checkout, setup-node, axe-playwright scan]
  lighthouse-ci:
    needs: e2e-tests
    steps: [checkout, setup-node, lhci autorun]
  security-scan:
    needs: e2e-tests
    steps: [checkout, setup-zap, zap-baseline.py]
```

---

## 6. Quality Gates & Entry/Exit Criteria

### 6.1 Per-Phase Quality Gates

| Gate | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| **G1: Code Quality** | ESLint 0 errors; Prettier clean; TypeScript strict | Same + no new warnings | Same + zero warnings |
| **G2: Unit Test Pass** | >= 70 % overall; 100 % business logic | >= 75 % overall | >= 80 % overall |
| **G3: Integration Test Pass** | All custom controllers covered | All API endpoints covered | All third-party integrations covered |
| **G4: E2E Critical Path** | 10 scenarios green | 15 scenarios green | 20 scenarios green |
| **G5: Accessibility** | axe-core 0 critical/serious; NVDA manual top 30 pages | axe-core 0 critical/serious; NVDA manual all templates | axe-core 0 critical/serious; NVDA + JAWS + VO + TalkBack full |
| **G6: Performance** | Lighthouse >= 90 all pages; LCP <= 1.8 s | Same + API <= targets | Same + e-commerce checkout <= 2 s |
| **G7: Security** | ZAP 0 high/critical; pen-test scheduled | ZAP 0 high/critical; pen-test clean | ZAP 0 high/critical; PCI SAQ A validated |
| **G8: Cross-Browser** | Chrome, Safari, Firefox, Samsung Internet green | + Edge, Opera/UC Browser | Same + expanded device matrix |
| **G9: UAT Sign-Off** | Alpha + Beta + Stakeholder signed | Beta + Stakeholder signed | Beta + Stakeholder signed |
| **G10: DR Drill** | RTO <= 4 h verified | Same | Same |

### 6.2 Entry Criteria (Before Testing Starts)

1. Feature code complete and peer-reviewed.
2. Unit tests written and passing for new business logic.
3. Design approved (Figma/Adobe XD) and accessible contrast checked.
4. Test data prepared and sanitized (see TwinMOSWebsiteTestDataStrategy.md).
5. Environment provisioned (staging mirrors production config).

### 6.3 Exit Criteria (Before Release)

1. All quality gates for the phase are green.
2. Zero open P0/P1 defects.
3. P2 defects have documented workarounds or acceptance.
4. UAT sign-off obtained from designated stakeholders.
5. Security scan (ZAP) and pen-test (if scheduled) are clean.
6. Performance baseline recorded and meets targets.
7. Accessibility audit report filed with remediation plan for any minor findings.
8. Runbooks and incident-response docs are current.

---

## 7. Risk-Based Testing Approach

### 7.1 Risk Assessment Matrix

| Risk Area | Likelihood | Impact | Mitigation via Testing |
|-----------|-----------|--------|------------------------|
| RTL layout regression (Arabic) | Medium | High | Visual regression + native-speaker UAT |
| E-commerce checkout failure (P3) | Medium | Critical | Extensive E2E + load testing + Stripe test mode |
| Compatibility Finder QVL inaccuracy | Medium | High | Integration tests with real QVL dataset + edge-case E2E |
| Partner portal data leak | Low | Critical | Security scans + RBAC unit tests + pen-test |
| Performance degradation at scale | Low | High | k6 load tests at 5K–10K concurrent + Lighthouse CI |
| Accessibility violation in dynamic content | Medium | High | axe-core on every PR + monthly manual audit |
| CMS soft-delete expiry regret | Low | Medium | DR drill validates recovery from pg_dump |
| Third-party service outage (maps, chat) | Low | Medium | Graceful-degradation E2E + fallback UI tests |

### 7.2 Test Prioritization by Risk

- **P0 (Critical Path):** Product discovery, compatibility finder, where-to-buy, contact forms, warranty registration, checkout (P3), partner portal login (P2), anti-counterfeit (P2), RTL rendering (P2).
- **P1 (High Value):** News/events, KB search, RMA workflow (P2), live chat (P2), gaming hub interactive (P2).
- **P2 (Standard):** Careers, legal pages, press room, about pages, regional landings.
- **P3 (Nice-to-Have):** Visual regression on non-critical pages, advanced analytics events.

---

## 8. Defect Management

### 8.1 Defect Lifecycle

```
[Discovered] -> [Log] -> [Triage] -> [Assign] -> [Fix] -> [Verify] -> [Close]
                  |          |
                  v          v
            [Rejected]  [Deferred]
```

### 8.2 Defect Severity & Priority

See dedicated document: [TwinMOSWebsiteBugSeverityDefinitions.md](TwinMOSWebsiteBugSeverityDefinitions.md)

### 8.3 SLA Targets

| Severity | Acknowledge | Fix Attempt | Verify & Close |
|----------|-------------|-------------|----------------|
| S1 — Critical | 15 min | 4 h | 24 h |
| S2 — High | 1 h | 24 h | 48 h |
| S3 — Medium | 4 h | 72 h | 1 week |
| S4 — Low | 24 h | Next sprint | Next release |

---

## 9. Metrics & Reporting

### 9.1 QA Dashboard (Updated Daily)

| Metric | Target | Source |
|--------|--------|--------|
| Test coverage (overall) | >= 70 % (P1) / >= 80 % (P3) | Vitest + Playwright reports |
| E2E pass rate | >= 98 % | Playwright CI |
| Accessibility findings (critical/serious) | 0 | axe-core CI |
| Lighthouse Performance median | >= 90 | Lighthouse CI |
| Lighthouse Accessibility median | >= 95 | Lighthouse CI |
| ZAP high/critical findings | 0 | Weekly ZAP scan |
| Open defect count (S1+S2) | 0 at release | Issue tracker |
| Defect escape rate (prod defects / total defects) | < 5 % | Post-launch review |
| Mean Time To Repair (MTTR) S1 | < 4 h | Incident tracker |
| UAT pass rate | >= 95 % | UAT test scripts |

### 9.2 Reporting Cadence

| Report | Frequency | Audience |
|--------|-----------|----------|
| CI Quality Dashboard | Real-time | Engineering |
| Sprint QA Summary | Bi-weekly | Engineering + PM |
| Phase QA Report | Per phase end | Leadership + Sponsor |
| Accessibility Audit Report | Monthly | Engineering + Legal |
| Security Scan Report | Weekly | Engineering + IT Lead |
| Performance Baseline Report | Per phase + monthly | Engineering + Marketing |

---

## 10. Environment Strategy

### 10.1 Environment Definitions

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| **Local** | Developer testing | Synthetic / seeded | Devs only |
| **CI** | Automated test execution | Fresh seed per run | GitHub Actions |
| **Staging** | Pre-release validation | Anonymized production-like | QA + Dev + PM |
| **UAT** | Stakeholder acceptance | Representative real content | TwinMOS stakeholders |
| **Production** | Live site | Real user data | Public |

### 10.2 Environment Parity Checklist

- [ ] Same Node.js version (22 LTS) on all environments.
- [ ] Same PostgreSQL version (16.x) on all environments.
- [ ] Same Strapi version and plugin set.
- [ ] Same Cloudflare CDN / WAF rules on Staging and Production.
- [ ] Same security headers (CSP, HSTS, X-Frame-Options) on all environments.
- [ ] Staging database seeded with representative content volume (287 pages, 100+ SKUs).

---

## 11. Compliance & Audit Trail

### 11.1 Regulatory Alignment

| Regulation | QA Activity | Evidence |
|------------|-------------|----------|
| GDPR | Consent-flow E2E tests, data-deletion request tests, cookie-banner axe scans | Test reports, CI logs |
| UAE PDPL | Same as GDPR + DPO contact form tests | Test reports |
| India DPDP | Same as GDPR + grievance-officer form tests | Test reports |
| KSA PDPL | Cross-border data flow tests, CDN residency checks | Test reports |
| WCAG 2.1 AA | axe-core CI, NVDA/JAWS/VO/TalkBack manual audits | Audit reports |
| EN 301 549 | Same as WCAG 2.1 AA + public-sector-specific keyboard tests | Audit reports |

### 11.2 Audit Log Requirements

- All CMS actions (User, Action, Item, Timestamp) logged via `strapi-plugin-audit-log`.
- All test executions logged in CI with artifact retention (30 days).
- All security scan results archived (12 months).
- All accessibility audit reports archived (12 months).

---

## 12. Continuous Improvement

### 12.1 Retrospective Agenda (Per Sprint)

1. What quality practices worked well?
2. What defects escaped to staging / production?
3. Were any tests flaky? Root cause?
4. Did any quality gate feel like overhead without value?
5. What should we add/remove/change for next sprint?

### 12.2 Phase-End Quality Review

1. Coverage trend analysis — did we improve or regress?
2. Defect density by component — where are defects clustering?
3. Test execution time — are we slowing down the pipeline?
4. Tool effectiveness — should we replace or upgrade any tool?
5. Stakeholder satisfaction — UAT feedback summary.

---

## 13. Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| QA Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |
| TwinMOS IT/Technical Lead | (TBC) | _______________ | _________ |
| TwinMOS Marketing Director | (TBC) | _______________ | _________ |

---

## 14. References

| Document | Location |
|----------|----------|
| TwinMOS Website BRD v3.0 | `A - Foundation and Strategy/TwinMOSWebsiteBRD.md` |
| TwinMOS Website URD v3.0 | `A - Foundation and Strategy/TwinMOSWebsiteURD.md` |
| TwinMOS Website Technology Stack v1.1 | `A - Foundation and Strategy/TwinMOSWebsiteTechnology_Stack.md` |
| TwinMOS Website Implementation Strategy v3.0 | `A - Foundation and Strategy/TwinMOSWebsiteImplementation_Strategy.md` |
| TwinMOS QA Philosophy (Product) | `content/website-content/02-about/05-quality-assurance.md` |
| Master Test Plan | [TwinMOSWebsiteTestPlanMaster.md](TwinMOSWebsiteTestPlanMaster.md) |
| E2E Test Scenarios (Playwright) | [TwinMOSWebsiteE2ETestScenarios_Playwright.md](TwinMOSWebsiteE2ETestScenarios_Playwright.md) |
| Accessibility Test Plan | [TwinMOSWebsiteAccessibilityTestPlanaxeNVDA.md](TwinMOSWebsiteAccessibilityTestPlanaxeNVDA.md) |
| Performance Test Plan (k6) | [TwinMOSWebsitePerformanceTestPlan_k6.md](TwinMOSWebsitePerformanceTestPlan_k6.md) |
| Security Test Plan (OWASP ZAP) | [TwinMOSWebsiteSecurityTestPlanOWASPZAP.md](TwinMOSWebsiteSecurityTestPlanOWASPZAP.md) |
| Bug Severity Definitions | [TwinMOSWebsiteBugSeverityDefinitions.md](TwinMOSWebsiteBugSeverityDefinitions.md) |
| Bug Triage Process | [TwinMOSWebsiteBugTriageProcess.md](TwinMOSWebsiteBugTriageProcess.md) |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Phase 1 Week 17 (pre-UAT) and at every phase boundary (Months 5, 9, 15)  
**Canonical Location:** `G - Quality Assurance and Testing/TwinMOSWebsiteQA_Strategy.md`
