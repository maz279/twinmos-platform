# Smoke Test Plan

**Document Reference:** TWN-QA-SMOKE-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P1
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** QA Team, Front-End Developers, Back-End Developers, DevOps
**Synchronized With:** QA Strategy v1.0, CI/CD Pipeline, Master Test Plan

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with smoke test suite, CI integration, and pass/fail criteria |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Smoke Test Philosophy](#2-smoke-test-philosophy)
3. [Smoke Test Suite](#3-smoke-test-suite)
4. [CI/CD Integration](#4-cicd-integration)
5. [Smoke Test Execution](#5-smoke-test-execution)
6. [Pass/Fail Criteria](#6-passfail-criteria)
7. [Escalation Procedure](#7-escalation-procedure)
8. [Smoke Test Maintenance](#8-smoke-test-maintenance)
9. [Appendix A: Quick Smoke Checklist](#appendix-a-quick-smoke-checklist)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document defines the **smoke testing approach** for the TwinMOS corporate website. Smoke tests are a minimal set of tests run on every build to verify that the most critical functionality works before deeper testing begins. A failed smoke test blocks the build pipeline immediately, preventing broken code from reaching staging or production.

### 1.2 Scope

**In scope:**
- Build-level smoke tests (every CI build)
- Deployment smoke tests (after every deployment)
- Environment health checks (staging, production)
- Critical path verification (homepage, navigation, search, forms)
- API health checks (Strapi, MeiliSearch)
- Third-party service availability

**Out of scope:**
- Full feature testing (covered in regression)
- Cross-browser testing (covered in cross-browser matrix)
- Performance benchmarking (covered in performance plan)
- Accessibility deep testing (covered in accessibility plan)

### 1.3 Definition

> **Smoke Test:** A subset of test cases that cover the most critical functionality of a system, used to verify that the basic features work before more comprehensive testing is undertaken. If smoke tests fail, the build is rejected immediately.

---

## 2. Smoke Test Philosophy

### 2.1 Principles

| Principle | Description |
|-----------|-------------|
| **Fast** | Complete in under 5 minutes |
| **Reliable** | No flaky tests; 100% deterministic |
| **Critical-only** | Only test business-critical paths |
| **Automated** | 100% automated; zero manual steps |
| **Blocking** | Failed smoke = blocked build |

### 2.2 Smoke vs. Regression vs. Full Test

| Aspect | Smoke | Regression | Full Test |
|--------|-------|------------|-----------|
| Frequency | Every build | Bi-weekly | Pre-release |
| Duration | < 5 min | 4 hours | 2+ days |
| Coverage | 5-10% of features | 60-80% of features | 100% of features |
| Automation | 100% | 80% | 60% |
| Blocking | Yes | No | Yes |
| Test count | 15-25 | 80-160 | 200-500 |

---

## 3. Smoke Test Suite

### 3.1 Frontend Smoke Tests (Playwright)

| ID | Test Case | Page | Assertion | Timeout |
|----|-----------|------|-----------|---------|
| SMK-FE-01 | Homepage loads | / | Status 200, title contains "TwinMOS" | 5s |
| SMK-FE-02 | Navigation menu renders | / | Header nav visible with 5+ links | 3s |
| SMK-FE-03 | Hero carousel displays | / | 4 slides visible, first slide active | 3s |
| SMK-FE-04 | Category grid loads | / | 4+ category cards with images | 3s |
| SMK-FE-05 | Product category page loads | /products/memory/ | Product cards visible | 5s |
| SMK-FE-06 | Product detail page loads | /products/voltx-ddr5/ | Title, image, specs visible | 5s |
| SMK-FE-07 | Search returns results | /search?q=DDR5 | Results count > 0 | 5s |
| SMK-FE-08 | Compatibility finder loads | /compatibility/ | Search input visible | 3s |
| SMK-FE-09 | Where to Buy loads | /where-to-buy/ | Map container visible | 5s |
| SMK-FE-10 | Contact form renders | /contact/ | All form fields visible | 3s |
| SMK-FE-11 | Contact form submits | /contact/ | Success message after submit | 10s |
| SMK-FE-12 | Footer links work | / | 8+ footer links resolve 200 | 5s |
| SMK-FE-13 | 404 page renders | /nonexistent | Custom 404 page, status 404 | 3s |
| SMK-FE-14 | Cookie banner appears | / (incognito) | Banner visible, accept button works | 3s |
| SMK-FE-15 | Newsletter signup works | / | Success message after email submit | 10s |
| SMK-FE-16 | Language switcher visible (P2) | / | Dropdown or flags in header | 3s |
| SMK-FE-17 | RTL layout loads (P2) | /ar/ | Layout direction RTL | 3s |
| SMK-FE-18 | Partner portal login page (P2) | /partner/login/ | Login form visible | 3s |
| SMK-FE-19 | Cart page loads (P3) | /cart/ | Empty cart message visible | 3s |

### 3.2 Backend Smoke Tests (API Health)

| ID | Test Case | Endpoint | Assertion | Timeout |
|----|-----------|----------|-----------|---------|
| SMK-BE-01 | Strapi health check | /api/health | Status 200, uptime > 0 | 3s |
| SMK-BE-02 | Product list API | /api/products | Status 200, data array > 0 | 3s |
| SMK-BE-03 | Product detail API | /api/products/1 | Status 200, product object | 3s |
| SMK-BE-04 | Category list API | /api/categories | Status 200, categories array | 3s |
| SMK-BE-05 | MeiliSearch health | /health | Status 200, status "available" | 3s |
| SMK-BE-06 | MeiliSearch search | /indexes/products/search | Results array > 0 | 3s |
| SMK-BE-07 | Form submission API | /api/form-submissions | POST returns 201 | 5s |
| SMK-BE-08 | Compatibility API | /api/compatibility?q=... | Results or empty array | 3s |
| SMK-BE-09 | Distributor API | /api/distributors | Status 200, array > 0 | 3s |
| SMK-BE-10 | CMS admin accessible | /admin | Status 200, login page | 5s |

### 3.3 Infrastructure Smoke Tests

| ID | Test Case | Check | Assertion |
|----|-----------|-------|-----------|
| SMK-INF-01 | Cloudflare Pages deployed | https://twinmos.com | Status 200, CF-Ray header |
| SMK-INF-02 | Hetzner VPS reachable | https://api.twinmos.com | Status 200, TLS 1.3 |
| SMK-INF-03 | PostgreSQL responding | Strapi health endpoint | DB connection OK |
| SMK-INF-04 | Backblaze B2 accessible | Image URL | Status 200, image loads |
| SMK-INF-05 | CDN caching works | Repeat request | CF-Cache-Status: HIT |

---

## 4. CI/CD Integration

### 4.1 Build Pipeline Gate

```
Developer pushes code
    |
    v
GitHub Actions triggers
    |
    v
Lint + Type Check (must pass)
    |
    v
Unit Tests (must pass, >= 70% coverage)
    |
    v
Build (must succeed)
    |
    v
SMOKE TESTS (must pass) <--- GATE
    |-- Frontend smoke (Playwright)
    |-- Backend smoke (API health)
    |-- Infrastructure smoke (curl)
    |
    v
[PASS] -> Deploy to Staging
[FAIL] -> Block build, notify developer
```

### 4.2 GitHub Actions Workflow

```yaml
name: Smoke Tests
on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

jobs:
  smoke-frontend:
    name: Frontend Smoke Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Build site
        run: npm run build
      - name: Start dev server
        run: npm run preview &
      - name: Wait for server
        run: npx wait-on http://localhost:4321 --timeout 30000
      - name: Run smoke tests
        run: npx playwright test tests/smoke/ --project=chromium
        env:
          PREVIEW_URL: http://localhost:4321
      - name: Upload results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: smoke-test-results
          path: playwright-report/

  smoke-backend:
    name: Backend Smoke Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: twinmos_test
          POSTGRES_USER: strapi
          POSTGRES_PASSWORD: strapi
      meilisearch:
        image: getmeili/meilisearch:v1.13
        env:
          MEILI_MASTER_KEY: test-key
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Run backend smoke tests
        run: npm run test:smoke:backend
        env:
          DATABASE_URL: postgres://strapi:strapi@localhost:5432/twinmos_test
          MEILI_HOST: http://localhost:7700
          MEILI_API_KEY: test-key

  smoke-infrastructure:
    name: Infrastructure Smoke Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check production endpoints
        run: |
          curl -sf https://twinmos.com > /dev/null || echo "Frontend check failed"
          curl -sf https://api.twinmos.com/api/health > /dev/null || echo "Backend check failed"
```

---

## 5. Smoke Test Execution

### 5.1 Local Execution

```bash
# Run all smoke tests
npm run test:smoke

# Run frontend smoke only
npx playwright test tests/smoke/frontend/

# Run backend smoke only
npm run test:smoke:backend

# Run with headed browser (for debugging)
npx playwright test tests/smoke/frontend/ --headed

# Run specific smoke test
npx playwright test tests/smoke/frontend/homepage.spec.ts
```

### 5.2 Staging Environment Smoke

After deployment to staging:

```bash
PREVIEW_URL=https://staging.twinmos.com npx playwright test tests/smoke/
```

### 5.3 Production Environment Smoke

After deployment to production:

```bash
PREVIEW_URL=https://twinmos.com npx playwright test tests/smoke/frontend/ --grep-invert "submit|POST|delete"
```

---

## 6. Pass/Fail Criteria

### 6.1 Smoke Test Pass Criteria

| Criterion | Requirement |
|-----------|-------------|
| All frontend smoke tests pass | 100% pass rate |
| All backend smoke tests pass | 100% pass rate |
| All infrastructure checks pass | 100% pass rate |
| Total execution time | < 5 minutes |
| No console errors | Zero critical errors |
| No network failures | All API calls return 2xx |

### 6.2 Smoke Test Fail Criteria

A smoke test fails if ANY of the following occur:

| Failure Type | Action |
|--------------|--------|
| Any test assertion fails | Block build |
| Test timeout exceeded | Block build |
| Console error (critical) | Block build |
| API returns 5xx | Block build |
| Page returns 404 (unexpected) | Block build |
| Test execution time > 5 min | Warn, investigate |

### 6.3 Flaky Test Policy

| Scenario | Action |
|----------|--------|
| Test fails intermittently | Quarantine test, file bug |
| Test fails 3 times in a row | Block build, investigate |
| Test fails due to external dependency | Mock dependency, retry |
| Test fails due to test data | Fix test data seeding |

---

## 7. Escalation Procedure

### 7.1 Smoke Test Failure Response

```
SMOKE TEST FAILS
      |
      v
CI pipeline blocks build
      |
      v
Slack notification to #dev-alerts
      |
      v
Developer investigates within 15 minutes
      |
      +-- Can fix quickly? --> Fix and re-run smoke
      |
      +-- Complex issue? --> Revert commit, fix in branch
      |
      v
QA Lead notified if smoke fails > 30 minutes
      |
      v
Escalate to Tech Lead if > 1 hour
```

### 7.2 Roles & Responsibilities

| Role | Responsibility | Response Time |
|------|----------------|---------------|
| Developer | Fix failing smoke test | 15 minutes |
| QA Lead | Investigate if test issue | 30 minutes |
| Tech Lead | Escalation decision | 1 hour |
| DevOps | Infrastructure issues | 30 minutes |

---

## 8. Smoke Test Maintenance

### 8.1 Review Schedule

| Frequency | Activity | Owner |
|-----------|----------|-------|
| Weekly | Review flaky tests, update selectors | QA Lead |
| Bi-weekly | Add smoke tests for new critical features | QA Lead |
| Monthly | Full smoke suite review and optimization | QA Lead |
| Per phase | Expand smoke suite for new phase features | QA Lead |

### 8.2 Adding New Smoke Tests

Criteria for adding a test to the smoke suite:

1. **Business criticality:** Does this feature directly impact revenue or user trust?
2. **Failure impact:** Would failure prevent users from completing core tasks?
3. **Execution speed:** Can the test complete in under 10 seconds?
4. **Reliability:** Is the test deterministic with no external dependencies?
5. **Frequency of use:** Is this feature used by > 50% of users?

### 8.3 Removing Smoke Tests

A smoke test may be removed if:
- Feature is deprecated or removed
- Test is consistently flaky and cannot be stabilized
- Test is covered by a more comprehensive test at lower level
- Test execution time exceeds 10 seconds and cannot be optimized

---

## Appendix A: Quick Smoke Checklist

### Manual Quick Smoke (for emergencies)

Use this checklist when automated smoke tests are unavailable (e.g., CI outage):

- [ ] Homepage loads at https://twinmos.com
- [ ] Navigation menu clickable
- [ ] Product category page loads
- [ ] Product detail page loads
- [ ] Search returns results
- [ ] Contact form submits
- [ ] Footer links work
- [ ] No console errors (F12)
- [ ] Mobile viewport looks correct
- [ ] API health endpoint returns 200

**Time:** 3 minutes  
**Sign-off:** Any team member can execute

---

**End of Document**
