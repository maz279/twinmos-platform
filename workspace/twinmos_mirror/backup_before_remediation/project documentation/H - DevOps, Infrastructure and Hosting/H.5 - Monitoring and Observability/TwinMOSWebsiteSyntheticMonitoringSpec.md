# TwinMOS Website — Synthetic Monitoring Specification

**Document ID:** H.5-007  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteMonitoring_Specification.md · TwinMOSWebsiteAlerting_Rules.md · TwinMOSWebsiteSLISLODefinitions.md · TwinMOSWebsiteCICDPipeline_Spec.md

---

## 1. Synthetic Monitoring Overview

Synthetic monitoring runs scripted tests against the website on a schedule — simulating real users — to detect issues before real users encounter them.

| Tool | Purpose | When It Runs | Threshold on Failure |
|------|---------|-------------|---------------------|
| **Playwright** | Functional smoke tests (user flows) | Every 30 min on production | Alert to Slack #ops |
| **Lighthouse CI** | Core Web Vitals + performance regression | Every PR + weekly prod audit | Block PR merge / alert |
| **axe-core** | Accessibility regression | Every PR + weekly prod scan | Block PR merge / alert |

---

## 2. Playwright Smoke Tests

### 2.1 Test Suite Overview

| Test ID | Name | Pages | What It Verifies | Critical? |
|---------|------|-------|-----------------|----------|
| E2E-01 | Homepage Loads | / | Hero visible, navigation present | ✅ Yes |
| E2E-02 | Product Listing | /products/ | Products grid renders, ≥1 product visible | ✅ Yes |
| E2E-03 | Product Detail | /products/voltx-ddr5/ | Product name, specs, CTA button visible | ✅ Yes |
| E2E-04 | Product Search | / | Search returns results for "DDR5" | ✅ Yes |
| E2E-05 | Arabic Locale | /ar/ | RTL layout, Arabic text present | ✅ Yes |
| E2E-06 | Contact Form | /contact/ | Form renders, required fields present | ✅ Yes |
| E2E-07 | Where to Buy | /where-to-buy/ | Distributor list renders | ✅ Yes |
| E2E-08 | Support Page | /support/ | FAQ/contact options visible | ⚡ Medium |
| E2E-09 | Navigation | / | All main nav links present, no broken links in nav | ⚡ Medium |
| E2E-10 | Image Rendering | /products/voltx-ddr5/ | At least 1 product image loads (no broken images) | ✅ Yes |

### 2.2 Smoke Test Implementation

```typescript
// tests/smoke/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-01: Homepage', () => {
  test('Homepage loads with hero section visible', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TwinMOS/);
    
    // Hero section visible
    const hero = page.locator('[data-testid="hero"]').or(page.locator('h1').first());
    await expect(hero).toBeVisible({ timeout: 10000 });
    
    // Main navigation present
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // No error messages visible
    await expect(page.locator('[data-testid="error"]')).not.toBeVisible();
    
    // Page responds within acceptable time
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 5s hard limit for smoke test
  });
});
```

```typescript
// tests/smoke/products.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-02: Product Listing', () => {
  test('Products page renders with at least one product', async ({ page }) => {
    await page.goto('/products/');
    
    // Wait for products to load (API might take time)
    const productCards = page.locator('[data-testid="product-card"]')
      .or(page.locator('.product-card'))
      .or(page.locator('article[class*="product"]'));
    
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('E2E-03: Product Detail', () => {
  test('Product detail page renders correctly', async ({ page }) => {
    await page.goto('/products/voltx-ddr5/');
    
    // Product name visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText(/VoltX/i);
    
    // At least one product image loads
    const productImage = page.locator('img[alt*="DDR5"]').or(
      page.locator('[data-testid="product-image"] img').or(
        page.locator('.product-gallery img')
      )
    ).first();
    await expect(productImage).toBeVisible({ timeout: 10000 });
    
    // CTA button present
    const ctaButton = page.locator('[data-testid="cta-where-to-buy"]').or(
      page.locator('a[href*="where-to-buy"]').or(
        page.getByRole('link', { name: /where to buy/i })
      )
    ).first();
    await expect(ctaButton).toBeVisible();
  });
});
```

```typescript
// tests/smoke/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-04: Product Search', () => {
  test('Search returns results for DDR5', async ({ page }) => {
    await page.goto('/');
    
    // Find and use search
    const searchInput = page.locator('[data-testid="search-input"]').or(
      page.locator('input[type="search"]').or(
        page.locator('input[placeholder*="search" i]')
      )
    ).first();
    
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('DDR5');
    await searchInput.press('Enter');
    
    // Wait for search results
    await page.waitForURL(/search|q=/, { timeout: 10000 });
    
    const results = page.locator('[data-testid="search-result"]').or(
      page.locator('.search-results article')
    );
    await expect(results.first()).toBeVisible({ timeout: 15000 });
    
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });
});
```

```typescript
// tests/smoke/i18n.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-05: Arabic RTL Locale', () => {
  test('Arabic locale renders with RTL layout', async ({ page }) => {
    await page.goto('/ar/');
    
    // HTML lang and dir attributes
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', /ar/);
    await expect(html).toHaveAttribute('dir', 'rtl');
    
    // Arabic text visible (contains Arabic Unicode characters)
    const bodyText = await page.locator('body').innerText();
    const hasArabicText = /[؀-ۿ]/.test(bodyText);
    expect(hasArabicText).toBe(true);
    
    // Page title in Arabic or includes TwinMOS
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
```

```typescript
// tests/smoke/contact.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-06: Contact Form', () => {
  test('Contact form renders with required fields', async ({ page }) => {
    await page.goto('/contact/');
    
    // Form present
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 10000 });
    
    // Required fields present
    const nameField = page.locator('input[name="name"]').or(
      page.locator('input[placeholder*="name" i]')
    ).first();
    await expect(nameField).toBeVisible();
    
    const emailField = page.locator('input[type="email"]').first();
    await expect(emailField).toBeVisible();
    
    const submitButton = page.locator('button[type="submit"]').or(
      page.getByRole('button', { name: /submit|send/i })
    ).first();
    await expect(submitButton).toBeVisible();
    
    // Cloudflare Turnstile loaded (anti-spam)
    const turnstile = page.locator('iframe[src*="challenges.cloudflare.com"]');
    await expect(turnstile).toBeVisible({ timeout: 5000 });
  });
});
```

### 2.3 Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/smoke',
  
  // Smoke tests should be fast
  timeout: 30000,
  retries: 1, // Retry once on failure (transient network issues)
  workers: 2, // Parallel workers

  use: {
    baseURL: process.env.BASE_URL || 'https://twinmos.com',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    
    // Realistic browser settings
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TwinMOS-SmokeTest/1.0',
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari (iPhone 14)',
      use: { ...devices['iPhone 14'] },
      // Only run critical mobile tests on schedule
      testMatch: /E2E-0[1-5]\.spec\.ts/,
    },
  ],

  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/smoke-results.json' }],
  ],
});
```

### 2.4 Scheduled Smoke Tests (GitHub Actions)

```yaml
# .github/workflows/smoke-tests.yml
name: Production Smoke Tests

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:          # Manual trigger

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install chromium --with-deps

      - name: Run smoke tests
        env:
          BASE_URL: https://twinmos.com
        run: pnpm exec playwright test tests/smoke/ --project="Desktop Chrome"

      - name: Upload test results on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: smoke-test-failure-${{ github.run_number }}
          path: test-results/
          retention-days: 7

      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_OPS }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "🔴 [P1] Production smoke tests FAILED at ${{ github.run_html_url }} — immediate investigation required"
            }
```

---

## 3. Lighthouse CI Configuration

### 3.1 Lighthouse CI Setup

```bash
# Install
pnpm add -D @lhci/cli

# Initialize LHCI config
pnpm lhci wizard  # Follow prompts OR use config below
```

### 3.2 LHCI Configuration File

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        // English (default locale)
        'https://staging.twinmos.com/',
        'https://staging.twinmos.com/products/',
        'https://staging.twinmos.com/products/voltx-ddr5/',
        'https://staging.twinmos.com/products/corex-pro-gen5/',
        'https://staging.twinmos.com/where-to-buy/',
        'https://staging.twinmos.com/support/',
        // Arabic RTL
        'https://staging.twinmos.com/ar/',
        'https://staging.twinmos.com/ar/products/',
        'https://staging.twinmos.com/ar/products/voltx-ddr5/',
      ],
      numberOfRuns: 3,
      settings: {
        // Desktop
        emulatedFormFactor: 'desktop',
        throttlingMethod: 'simulate',
        // Disable Cloudflare Turnstile for Lighthouse testing
        extraHeaders: { 'X-LH-Test': '1' },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.85, aggregationMethod: 'median-run' }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],

        // SEO
        'categories:seo': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],

        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.9, aggregationMethod: 'median-run' }],

        // Resource budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 512000 }], // 500 KB JS
        'resource-summary:total:size': ['warn', { maxNumericValue: 4000000 }], // 4 MB total

        // Specific Lighthouse checks
        'uses-responsive-images': 'warn',
        'uses-webp-images': 'warn',
        'uses-text-compression': 'error',
        'uses-long-cache-ttl': 'warn',
        'render-blocking-resources': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage', // No LHCI server needed; uses GitHub Actions artifact
    },
  },
};
```

### 3.3 Lighthouse CI in GitHub Actions

```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, staging]
  schedule:
    - cron: '0 8 * * 1'  # Weekly Monday 08:00 UTC (production audit)
  workflow_dispatch:
    inputs:
      target_url:
        description: 'URL to audit (default: staging)'
        default: 'https://staging.twinmos.com'

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Lighthouse CI
        run: pnpm lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
          # Post results as PR check status

      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-results-${{ github.sha }}
          path: .lighthouseci/
          retention-days: 30

      - name: Comment PR with Lighthouse scores
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const files = fs.readdirSync('.lighthouseci/').filter(f => f.endsWith('.json'));
            const results = files.map(f => JSON.parse(fs.readFileSync(`.lighthouseci/${f}`, 'utf8')));
            
            const scoreEmoji = (score) => score >= 0.9 ? '🟢' : score >= 0.7 ? '🟡' : '🔴';
            
            const summary = results.map(r => {
              const cats = r.categories;
              return `| ${r.finalUrl} | ${scoreEmoji(cats.performance.score)} ${Math.round(cats.performance.score * 100)} | ${scoreEmoji(cats.accessibility.score)} ${Math.round(cats.accessibility.score * 100)} | ${scoreEmoji(cats.seo.score)} ${Math.round(cats.seo.score * 100)} |`;
            }).join('\n');
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🔦 Lighthouse Results\n\n| URL | Performance | Accessibility | SEO |\n|---|---|---|---|\n${summary}`
            });
```

---

## 4. axe-core Accessibility Testing

### 4.1 Playwright + axe-core Integration

```typescript
// tests/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const KEY_PAGES = [
  { url: '/', name: 'Homepage (EN)' },
  { url: '/products/', name: 'Products (EN)' },
  { url: '/products/voltx-ddr5/', name: 'Product Detail (EN)' },
  { url: '/ar/', name: 'Homepage (AR)' },
  { url: '/where-to-buy/', name: 'Where to Buy (EN)' },
  { url: '/support/', name: 'Support (EN)' },
  { url: '/contact/', name: 'Contact (EN)' },
];

for (const page_config of KEY_PAGES) {
  test(`Accessibility: ${page_config.name}`, async ({ page }) => {
    await page.goto(page_config.url);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .disableRules([
        // Disable rules not applicable to our setup
        'color-contrast', // Will review separately for custom design tokens
      ])
      .analyze();

    // Zero critical violations
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    if (criticalViolations.length > 0) {
      console.log('Violations:', JSON.stringify(criticalViolations, null, 2));
    }
    
    expect(criticalViolations).toHaveLength(0);
  });
}
```

### 4.2 Weekly Accessibility Scan (Scheduled)

```yaml
# .github/workflows/accessibility-scan.yml
name: Weekly Accessibility Scan

on:
  schedule:
    - cron: '0 6 * * 1'  # Monday 06:00 UTC
  workflow_dispatch:

jobs:
  accessibility:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install chromium --with-deps

      - name: Run accessibility scan against production
        env:
          BASE_URL: https://twinmos.com
        run: pnpm exec playwright test tests/accessibility/ --reporter=html

      - name: Upload accessibility report
        uses: actions/upload-artifact@v4
        with:
          name: a11y-report-${{ github.run_number }}
          path: playwright-report/

      - name: Notify on violations
        if: failure()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_ALERTS }}
          payload: |
            {"text": "⚠️ [P2] Weekly accessibility scan found violations — check GitHub Actions report"}
```

---

## 5. Performance Budgets

### 5.1 Resource Budgets

| Resource Type | Budget | Enforcement |
|--------------|--------|-------------|
| Total page weight | 4 MB | Lighthouse CI error |
| JavaScript (total) | 500 KB (gzipped) | Lighthouse CI warn |
| CSS (total) | 100 KB (gzipped) | Manual review |
| Images per page | 2 MB | Lighthouse CI warn |
| Third-party scripts | 50 KB | Lighthouse CI warn |
| Web fonts | 100 KB | Manual review |

### 5.2 Timing Budgets

| Metric | Budget | Scope | Enforcement |
|--------|--------|-------|-------------|
| FCP | < 1.5s | Desktop EN | Lighthouse CI warn |
| LCP | < 2.5s | Desktop EN | Lighthouse CI error |
| LCP | < 3.0s | Desktop AR (RTL) | Lighthouse CI error |
| LCP | < 3.5s | Mobile EN | Lighthouse CI warn |
| TBT | < 300ms | Desktop | Lighthouse CI error |
| CLS | < 0.1 | All | Lighthouse CI error |
| TTI | < 3.5s | Desktop | Lighthouse CI warn |

---

## 6. Alert Thresholds

| Condition | Action |
|-----------|--------|
| Smoke test fails on production | Immediate alert → Slack #ops (P1) |
| Lighthouse Performance score drops >10 points from baseline | Alert → Slack #alerts (P2) |
| Lighthouse Accessibility score drops below 90 | Block PR merge + alert |
| Any axe-core critical/serious violation on production | Alert → Slack #alerts (P2) |
| LCP exceeds 4.0s for any key page | Alert → Slack #alerts (P2) |
| CLS exceeds 0.25 | Alert → Slack #alerts (P2) |

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §20.7, §14.3, §14.4*
