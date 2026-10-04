# Regression Test Plan

**Document Reference:** TWN-QA-REGRESSION-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P2
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** QA Team, Front-End Developers, Back-End Developers, Project Manager
**Synchronized With:** QA Strategy v1.0, Master Test Plan, Sprint Backlog Phase 1

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with regression suite structure, automation strategy, and execution schedule |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Regression Strategy](#2-regression-strategy)
3. [Regression Suite Structure](#3-regression-suite-structure)
4. [Automated Regression](#4-automated-regression)
5. [Manual Regression](#5-manual-regression)
6. [Regression Execution Schedule](#6-regression-execution-schedule)
7. [Regression Test Cases by Module](#7-regression-test-cases-by-module)
8. [Defect Verification in Regression](#8-defect-verification-in-regression)
9. [Regression Metrics & Reporting](#9-regression-metrics--reporting)
10. [Appendix A: Regression Checklist Template](#appendix-a-regression-checklist-template)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document defines the **regression testing approach** for the TwinMOS corporate website. Regression testing ensures that new code changes, bug fixes, and feature additions do not inadvertently break existing functionality. It provides the structured test suites, execution schedule, and pass/fail criteria for each regression cycle.

### 1.2 Scope

**In scope:**
- Full regression before each phase launch
- Selective regression after each sprint (bi-weekly)
- Smoke regression after each build deployment
- Defect fix verification regression
- Cross-browser regression (weekly)
- Mobile regression (weekly)
- Accessibility regression (weekly)
- Performance regression (weekly via Lighthouse CI)

**Out of scope:**
- Exploratory testing (covered in separate sessions)
- UAT (covered in UAT Plan)
- Security penetration testing (covered in Security Test Plan)

---

## 2. Regression Strategy

### 2.1 Regression Types

| Type | Trigger | Scope | Duration | Automation |
|------|---------|-------|----------|------------|
| **Build Regression** | Every CI build | Smoke tests (30 min) | 15 min | 100% |
| **Sprint Regression** | End of each 2-week sprint | Core features + modified areas | 4 hours | 80% |
| **Pre-Release Regression** | Before each release | Full suite | 2 days | 70% |
| **Phase Launch Regression** | Before Phase 1/2/3 launch | Complete end-to-end | 1 week | 60% |
| **Hotfix Regression** | After production hotfix | Affected area + smoke | 1 hour | 90% |
| **Weekly Regression** | Every Friday | Cross-browser + mobile + a11y | 4 hours | 75% |

### 2.2 Risk-Based Regression Selection

Not all tests run in every regression. Selection is based on:

| Risk Factor | Weight | Impact on Selection |
|-------------|--------|---------------------|
| Code change area | High | Tests in modified modules prioritized |
| Business criticality | High | Critical paths always included |
| Defect density | Medium | Modules with recent bugs get extra coverage |
| User traffic | Medium | High-traffic pages always included |
| Technical complexity | Low | Complex integrations get regression focus |

### 2.3 Regression Automation Pyramid

```
        /\
       /  \     E2E Critical Paths (Playwright)
      /____\        ~20 tests, 30 min
     /      \   
    /        \  Integration + API (Vitest + Bruno)
   /__________\     ~100 tests, 10 min
  /            \
 /              \ Unit Tests (Vitest)
/________________\   ~300 tests, 5 min
```

---

## 3. Regression Suite Structure

### 3.1 Suite Hierarchy

```
regression/
├── smoke/                          # Build-level (every CI)
│   ├── homepage.spec.ts
│   ├── navigation.spec.ts
│   ├── search.spec.ts
│   └── forms.spec.ts
├── sprint/                         # Sprint-level (bi-weekly)
│   ├── product-catalog/
│   ├── compatibility/
│   ├── where-to-buy/
│   ├── support/
│   └── cms/
├── full/                           # Release-level (pre-launch)
│   ├── all-critical-paths/
│   ├── cross-browser/
│   ├── mobile/
│   ├── accessibility/
│   └── performance/
└── ad-hoc/                         # Hotfix verification
    └── defect-verification/
```

### 3.2 Test Case Count by Phase

| Phase | Smoke | Sprint | Full | Total |
|-------|-------|--------|------|-------|
| Phase 1 (Core Website) | 15 | 80 | 200 | 295 |
| Phase 2 (Portal + i18n) | 20 | 120 | 350 | 490 |
| Phase 3 (E-commerce) | 25 | 160 | 500 | 685 |

---

## 4. Automated Regression

### 4.1 CI/CD Integration

```yaml
# .github/workflows/regression.yml
name: Regression Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6 AM

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Smoke Tests
        run: npx playwright test tests/regression/smoke/ --project=chromium

  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Unit Tests
        run: npm run test:unit -- --coverage

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
      meilisearch:
        image: getmeili/meilisearch:v1.13
    steps:
      - uses: actions/checkout@v4
      - name: Run Integration Tests
        run: npm run test:integration

  e2e-critical:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run E2E Critical Paths
        run: npx playwright test tests/regression/sprint/ --project=chromium

  cross-browser:
    if: github.event.schedule
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Cross-Browser Tests
        run: npx playwright test tests/regression/full/cross-browser/
```

### 4.2 Automated Regression Tags

| Tag | Description | When Run |
|-----|-------------|----------|
| `@smoke` | Core functionality | Every build |
| `@sprint` | Sprint deliverables | End of sprint |
| `@regression` | Full regression | Pre-release |
| `@critical` | Business-critical paths | Every build |
| `@cross-browser` | Multi-browser validation | Weekly |
| `@mobile` | Mobile-specific tests | Weekly |
| `@a11y` | Accessibility tests | Weekly |
| `@performance` | Performance budgets | Weekly |
| `@phase2` | Phase 2 features | From Month 6 |
| `@phase3` | Phase 3 features | From Month 10 |

### 4.3 Selective Regression Command Examples

```bash
# Smoke regression (every build)
npx playwright test --grep @smoke

# Sprint regression (bi-weekly)
npx playwright test --grep "@sprint|@critical"

# Full regression (pre-release)
npx playwright test --grep @regression

# Cross-browser only
npx playwright test tests/regression/full/cross-browser/

# Mobile only
npx playwright test --grep @mobile --project="Mobile Chrome" --project="Mobile Safari"

# Accessibility only
npx playwright test --grep @a11y

# Phase 2 features only
npx playwright test --grep @phase2
```

---

## 5. Manual Regression

### 5.1 Manual Regression Areas

| Area | Reason for Manual | Tester | Time |
|------|-------------------|--------|------|
| Visual design parity | Requires human eye | UX Designer | 2 hours |
| Cross-browser visual | Subtle rendering differences | QA Lead | 2 hours |
| Mobile real-device | Emulator limitations | QA Lead | 3 hours |
| Accessibility (screen readers) | Automated tools limited | QA Lead | 2 hours |
| Content accuracy | Requires domain knowledge | Content Manager | 1 hour |
| Form validation edge cases | Complex business rules | QA Lead | 1 hour |
| PDF output quality | Visual inspection required | QA Lead | 1 hour |
| Email notification content | Requires inbox verification | QA Lead | 1 hour |

### 5.2 Manual Regression Checklist

#### Homepage
- [ ] Hero carousel auto-plays and responds to navigation
- [ ] Category grid displays correctly at all breakpoints
- [ ] Featured products load with images and prices
- [ ] Trust signals (certifications, awards) visible
- [ ] Newsletter signup form functional
- [ ] Footer links all resolve correctly
- [ ] Language selector visible (P2+)

#### Product Catalog
- [ ] All category pages load without errors
- [ ] Filter checkboxes update results instantly
- [ ] Sort options work correctly
- [ ] Pagination functions properly
- [ ] Product cards display correct information
- [ ] Empty states handled gracefully
- [ ] Breadcrumb navigation accurate

#### Product Detail
- [ ] Image gallery swipeable on mobile
- [ ] Specifications table complete and accurate
- [ ] "Download Datasheet" button functional
- [ ] Related products displayed
- [ ] Stock status accurate
- [ ] Social share buttons work

#### Compatibility Finder
- [ ] Search accepts laptop model and motherboard
- [ ] Results show compatible products
- [ ] Results grouped by category
- [ ] Maximum supported capacity displayed
- [ ] No results state handled

#### Where to Buy
- [ ] Map loads with correct region focus
- [ ] Retailer pins clickable
- [ ] Filter by country functional
- [ ] Retailer details accurate
- [ ] Directions link opens external map

#### Forms
- [ ] All required fields validated
- [ ] Email format validation works
- [ ] Phone number validation works
- [ ] File upload accepts correct formats
- [ ] Success message displayed
- [ ] Confirmation email received

---

## 6. Regression Execution Schedule

### 6.1 Phase 1 Schedule (Months 1–5)

| Week | Activity | Type | Duration |
|------|----------|------|----------|
| Every build | Smoke regression | Automated | 15 min |
| Sprint end (bi-weekly) | Sprint regression | Auto + Manual | 4 hours |
| Every Friday | Weekly regression | Auto (cross-browser, mobile, a11y) | 4 hours |
| Week 16 | Pre-launch full regression | Full suite | 2 days |
| Week 17 | Alpha UAT regression | Critical paths | 1 day |
| Week 18 | Beta UAT regression | Full suite | 2 days |
| Week 19 | Stakeholder regression | Critical paths | 1 day |

### 6.2 Phase 2 & 3 Schedule

| Trigger | Activity | Type | Duration |
|---------|----------|------|----------|
| Every build | Smoke + Phase 2/3 smoke | Automated | 20 min |
| Sprint end | Sprint + new feature regression | Auto + Manual | 6 hours |
| Weekly | Full cross-browser + mobile + a11y | Auto + Manual | 6 hours |
| Pre-launch | Full end-to-end regression | Full suite | 1 week |

---

## 7. Regression Test Cases by Module

### 7.1 Homepage Module (REG-HP)

| ID | Test Case | Priority | Type |
|----|-----------|----------|------|
| REG-HP-01 | Homepage loads within 2s | P0 | Auto |
| REG-HP-02 | Hero carousel displays 4 slides | P0 | Auto |
| REG-HP-03 | Hero carousel auto-advances every 5s | P0 | Auto |
| REG-HP-04 | Category grid links to correct pages | P0 | Auto |
| REG-HP-05 | Featured products display with images | P0 | Auto |
| REG-HP-06 | Trust bar shows certification logos | P1 | Auto |
| REG-HP-07 | Newsletter signup captures email | P0 | Auto |
| REG-HP-08 | Footer contains all required links | P1 | Auto |
| REG-HP-09 | Cookie banner appears for new visitors | P0 | Auto |
| REG-HP-10 | Language selector navigates to /ar/ (P2) | P1 | Auto |

### 7.2 Product Catalog Module (REG-PC)

| ID | Test Case | Priority | Type |
|----|-----------|----------|------|
| REG-PC-01 | Category page loads with products | P0 | Auto |
| REG-PC-02 | Filter by DDR5 shows only DDR5 products | P0 | Auto |
| REG-PC-03 | Sort by price ascending works | P0 | Auto |
| REG-PC-04 | Pagination shows correct page count | P0 | Auto |
| REG-PC-05 | Product card links to detail page | P0 | Auto |
| REG-PC-06 | Empty filter shows "No products found" | P1 | Auto |
| REG-PC-07 | URL updates with filter params | P1 | Auto |
| REG-PC-08 | Filter state persists on back navigation | P1 | Auto |

### 7.3 Product Detail Module (REG-PD)

| ID | Test Case | Priority | Type |
|----|-----------|----------|------|
| REG-PD-01 | Product detail loads with all data | P0 | Auto |
| REG-PD-02 | Image gallery displays all images | P0 | Auto |
| REG-PD-03 | Specifications table complete | P0 | Auto |
| REG-PD-04 | Datasheet PDF downloads | P0 | Auto |
| REG-PD-05 | Related products displayed | P1 | Auto |
| REG-PD-06 | Breadcrumb accurate | P1 | Auto |
| REG-PD-07 | Social share buttons functional | P2 | Manual |

### 7.4 Compatibility Finder Module (REG-CF)

| ID | Test Case | Priority | Type |
|----|-----------|----------|------|
| REG-CF-01 | Search by laptop model returns results | P0 | Auto |
| REG-CF-02 | Search by motherboard returns results | P0 | Auto |
| REG-CF-03 | Results grouped by category | P0 | Auto |
| REG-CF-04 | Compatible specs displayed | P0 | Auto |
| REG-CF-05 | No results shows helpful message | P1 | Auto |
| REG-CF-06 | Search works on mobile | P0 | Auto |

### 7.5 Where to Buy Module (REG-WTB)

| ID | Test Case | Priority | Type |
|----|-----------|----------|------|
| REG-WTB-01 | Map loads with correct default region | P0 | Auto |
| REG-WTB-02 | Retailer pins display on map | P0 | Auto |
| REG-WTB-03 | Filter by country updates map | P0 | Auto |
| REG-WTB-04 | Retailer list shows correct information | P0 | Auto |
| REG-WTB-05 | Clicking pin shows retailer details | P0 | Auto |
| REG-WTB-06 | Directions link opens Google Maps | P1 | Auto |

### 7.6 Forms Module (REG-FORM)

| ID | Test Case | Priority | Type |
|----|-----------|----------|------|
| REG-FORM-01 | Contact form submits successfully | P0 | Auto |
| REG-FORM-02 | Required field validation works | P0 | Auto |
| REG-FORM-03 | Email format validation works | P0 | Auto |
| REG-FORM-04 | File upload accepts PDF/DOC | P1 | Auto |
| REG-FORM-05 | Success message displayed | P0 | Auto |
| REG-FORM-06 | Confirmation email received | P0 | Manual |
| REG-FORM-07 | Warranty form submits (P2) | P0 | Auto |
| REG-FORM-08 | RMA form submits (P2) | P0 | Auto |

---

## 8. Defect Verification in Regression

### 8.1 Defect Fix Verification Process

```
1. Developer fixes defect and marks "Ready for QA"
2. QA pulls latest build from develop branch
3. QA executes defect-specific test case
4. QA executes related regression tests (affected module)
5. QA executes smoke tests
6. If all pass -> Close defect
7. If any fail -> Reopen defect with new evidence
```

### 8.2 Regression Scope for Defect Fixes

| Fix Area | Regression Tests to Run |
|----------|------------------------|
| Homepage component | REG-HP-01 to REG-HP-10 + smoke |
| Product card | REG-PC-01 to REG-PC-08 + REG-PD-01 to REG-PD-07 + smoke |
| Form validation | REG-FORM-01 to REG-FORM-08 + smoke |
| Search functionality | REG-PC-02, REG-CF-01 to REG-CF-06 + smoke |
| Map component | REG-WTB-01 to REG-WTB-06 + smoke |
| Navigation | All navigation tests + smoke |
| CSS/styling | Visual regression + cross-browser + smoke |
| API endpoint | Integration tests + affected E2E + smoke |

---

## 9. Regression Metrics & Reporting

### 9.1 Key Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Smoke test pass rate | 100% | Every build |
| Sprint regression pass rate | >= 95% | End of sprint |
| Full regression pass rate | >= 98% | Pre-release |
| Defect escape rate | < 2% | Post-release defects |
| Regression execution time | < 4 hours | Sprint regression |
| Automation coverage | >= 80% | Sprint regression |
| Flaky test rate | < 3% | All automated tests |

### 9.2 Regression Report Template

```markdown
# Regression Report — Sprint X / Release Y

**Date:** [Date]
**Executed By:** [Name]
**Build:** [Commit SHA]
**Environment:** [Staging/Production]

## Summary
| Metric | Value |
|--------|-------|
| Total Tests | 120 |
| Passed | 118 |
| Failed | 2 |
| Skipped | 0 |
| Pass Rate | 98.3% |

## Failed Tests
| Test ID | Description | Severity | Assigned To |
|---------|-------------|----------|-------------|
| REG-PC-03 | Sort by price broken | High | Dev A |
| REG-WTB-02 | Map pins not loading | Medium | Dev B |

## Defects Found
| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| BUG-123 | Price sort sends wrong param | High | Open |
| BUG-124 | Map API rate limited | Medium | Open |

## Sign-Off
| Role | Name | Decision |
|------|------|----------|
| QA Lead | [Name] | Go / No-Go |
```

---

## Appendix A: Regression Checklist Template

### Pre-Regression Checklist

- [ ] Test environment deployed with correct build
- [ ] Database seeded with regression test data
- [ ] Third-party services available (MeiliSearch, maps API)
- [ ] BrowserStack tunnel active (if needed)
- [ ] Test devices charged and available
- [ ] Previous regression report reviewed

### Post-Regression Checklist

- [ ] All automated tests executed
- [ ] All manual tests executed
- [ ] Failed tests investigated and documented
- [ ] Defects filed with reproduction steps
- [ ] Regression report generated
- [ ] Stakeholders notified of results
- [ ] Go/No-Go decision documented

---

**End of Document**
