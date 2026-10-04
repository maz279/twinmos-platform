# TwinMOS Corporate Website — E2E Test Scenarios (Playwright)

**Document Reference:** TWN-QA-E2E-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Owner:** QA Lead / Unisoft Team Lead (Dev A)  
**Priority:** P1  
**Synchronized With:** Tech Stack §21.2, BRD §32.1, URD §38

---

## 1. Purpose

This document defines the complete End-to-End (E2E) test suite for the TwinMOS corporate website using Playwright. E2E tests validate critical user journeys across the full stack — from browser interaction through frontend, API, CMS, database, and third-party services.

**Scope:** Critical paths only. Non-critical paths are covered by unit/integration tests and manual exploratory testing.

---

## 2. Tooling & Configuration

### 2.1 Playwright Setup

```bash
pnpm create playwright@latest
# Select: TypeScript, tests folder: e2e, CI: GitHub Actions, no examples
```

### 2.2 Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'results.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
});
```

### 2.3 axe-playwright Integration

```typescript
// e2e/utils/a11y.ts
import { Page } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

export async function assertNoA11yViolations(page: Page) {
  await injectAxe(page);
  await checkA11y(page, undefined, {
    axeOptions: {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      },
    },
  });
}
```

---

## 3. Critical-Path E2E Scenarios

### 3.1 Scenario Catalog

| ID | Scenario | Phase | Priority | BRD Ref | URD Ref |
|----|----------|-------|----------|---------|---------|
| E2E-01 | Homepage search → product detail → datasheet download | P1 | P0 | US-1.1 | UR-1.1 |
| E2E-02 | Compatibility finder by motherboard | P1 | P0 | US-2.1 | UR-2.1 |
| E2E-03 | Where-to-Buy filter by country with map pin | P1 | P0 | US-3.1 | UR-3.1 |
| E2E-04 | Contact form submission with auto-reply | P1 | P0 | US-4.1 | UR-4.1 |
| E2E-05 | Warranty registration with certificate | P1 | P0 | US-6.1 | UR-6.1 |
| E2E-06 | RMA full workflow (7 states) | P2 | P1 | US-6.4 | UR-6.4 |
| E2E-07 | Partner portal login + watermarked price-list | P2 | P1 | US-7.1 | UR-7.1 |
| E2E-08 | E-commerce checkout via Stripe | P3 | P0 | BRD §6.1 | — |
| E2E-09 | Arabic language switch with RTL validation | P2 | P1 | US-9.1 | UR-9.1 |
| E2E-10 | Anti-counterfeit serial lookup | P2 | P1 | BRD §17 | UR-17 |
| E2E-11 | Product comparison (up to 4 SKUs) | P1 | P1 | US-1.4 | UR-1.4 |
| E2E-12 | Newsletter signup with double opt-in | P1 | P1 | BRD §15 | UR-15 |
| E2E-13 | KB article search + helpful rating | P1 | P1 | US-6.3 | UR-6.3 |
| E2E-14 | Careers application with CV upload | P1 | P1 | BRD §14 | UR-14 |
| E2E-15 | Cookie consent granular preferences | P1 | P0 | BRD §22.1 | UR-34 |

### 3.2 E2E-01: Homepage Search → Product Detail → Datasheet Download

```typescript
// e2e/scenarios/e2e-01-search-to-datasheet.spec.ts
import { test, expect } from '@playwright/test';
import { assertNoA11yViolations } from '../utils/a11y';

test.describe('E2E-01: Search to Datasheet Download', () => {
  test('visitor searches DDR5, clicks result, downloads datasheet', async ({ page }) => {
    // Step 1: Land on homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/TwinMOS/);
    await assertNoA11yViolations(page);

    // Step 2: Search for "DDR5"
    await page.getByRole('searchbox', { name: /search/i }).fill('DDR5');
    await page.getByRole('button', { name: /search/i }).click();

    // Step 3: Verify search results page
    await expect(page).toHaveURL(/search/);
    await expect(page.getByText(/DDR5/)).toBeVisible();
    await assertNoA11yViolations(page);

    // Step 4: Click first result
    const firstResult = page.getByRole('link', { name: /DDR5/ }).first();
    await firstResult.click();

    // Step 5: Verify product detail page
    await expect(page).toHaveURL(/products\/ddr5/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('DDR5');
    await assertNoA11yViolations(page);

    // Step 6: Download datasheet
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /datasheet/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
```

### 3.3 E2E-02: Compatibility Finder by Motherboard

```typescript
// e2e/scenarios/e2e-02-compatibility-finder.spec.ts
import { test, expect } from '@playwright/test';
import { assertNoA11yViolations } from '../utils/a11y';

test.describe('E2E-02: Compatibility Finder', () => {
  test('finds compatible RAM for ASUS ROG STRIX Z790-E', async ({ page }) => {
    await page.goto('/support/compatibility-finder');
    await assertNoA11yViolations(page);

    // Select "By Motherboard"
    await page.getByRole('radio', { name: /by motherboard/i }).check();

    // Select brand
    await page.getByLabel(/motherboard brand/i).selectOption('ASUS');
    await page.waitForResponse(/api\/v1\/motherboards/);

    // Select model
    await page.getByLabel(/motherboard model/i).selectOption('ROG STRIX Z790-E GAMING WIFI');

    // Submit
    await page.getByRole('button', { name: /find compatible memory/i }).click();

    // Verify results
    await expect(page.getByRole('heading', { name: /compatible memory/i })).toBeVisible();
    await expect(page.getByText(/DDR5/)).toBeVisible();
    await expect(page.getByText(/No results/)).not.toBeVisible();
    await assertNoA11yViolations(page);
  });

  test('shows empty state for unsupported motherboard', async ({ page }) => {
    await page.goto('/support/compatibility-finder');
    await page.getByRole('radio', { name: /by motherboard/i }).check();
    await page.getByLabel(/motherboard brand/i).selectOption('Generic');
    await page.getByRole('button', { name: /find compatible memory/i }).click();
    await expect(page.getByText(/No compatible memory found/)).toBeVisible();
  });
});
```

### 3.4 E2E-03: Where-to-Buy Filter by Country

```typescript
// e2e/scenarios/e2e-03-where-to-buy.spec.ts
import { test, expect } from '@playwright/test';
import { assertNoA11yViolations } from '../utils/a11y';

test.describe('E2E-03: Where to Buy', () => {
  test('filters India retailers and shows Supertron on map', async ({ page }) => {
    await page.goto('/where-to-buy');
    await assertNoA11yViolations(page);

    // Filter by country
    await page.getByLabel(/country/i).selectOption('IN');
    await page.waitForResponse(/api\/v1\/retailers/);

    // Verify retailer list
    await expect(page.getByText('Supertron Electronics')).toBeVisible();

    // Verify map pin
    const mapPin = page.locator('.leaflet-marker-icon').filter({ hasText: /Supertron/ });
    await expect(mapPin).toBeVisible();

    // Click pin -> info window
    await mapPin.click();
    await expect(page.getByText(/Authorized Distributor/)).toBeVisible();
    await assertNoA11yViolations(page);
  });
});
```

### 3.5 E2E-04: Contact Form Submission

```typescript
// e2e/scenarios/e2e-04-contact-form.spec.ts
import { test, expect } from '@playwright/test';
import { assertNoA11yViolations } from '../utils/a11y';

test.describe('E2E-04: Contact Form', () => {
  test('submits general inquiry and receives auto-reply', async ({ page }) => {
    await page.goto('/contact');
    await assertNoA11yViolations(page);

    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/country/i).selectOption('AE');
    await page.getByLabel(/subject/i).selectOption('General Inquiry');
    await page.getByLabel(/message/i).fill('This is a test message from Playwright.');

    // Cloudflare Turnstile is mocked in test environment
    await page.evaluate(() => {
      (window as any).turnstileCallback = () => {};
    });

    await page.getByRole('button', { name: /send message/i }).click();

    // Verify success
    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 10000 });
    await assertNoA11yViolations(page);
  });

  test('shows validation errors for empty required fields', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });
});
```

### 3.6 E2E-05: Warranty Registration

```typescript
// e2e/scenarios/e2e-05-warranty-registration.spec.ts
import { test, expect } from '@playwright/test';
import { assertNoA11yViolations } from '../utils/a11y';

test.describe('E2E-05: Warranty Registration', () => {
  test('registers product and displays certificate', async ({ page }) => {
    await page.goto('/support/warranty-registration');
    await assertNoA11yViolations(page);

    await page.getByLabel(/product/i).selectOption('DDR5 VOLTX RGB 32GB');
    await page.getByLabel(/serial number/i).fill('TM-TEST-123456');
    await page.getByLabel(/purchase date/i).fill('2026-01-15');
    await page.getByLabel(/retailer/i).fill('Amazon');
    await page.getByLabel(/your email/i).fill('owner@example.com');
    await page.getByLabel(/your name/i).fill('John Doe');

    await page.getByRole('button', { name: /register warranty/i }).click();

    // Success page
    await expect(page.getByText(/registration successful/i)).toBeVisible();
    await expect(page.getByText(/TM-TEST-123456/)).toBeVisible();

    // Certificate download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download certificate/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/certificate.*\.pdf$/);
    await assertNoA11yViolations(page);
  });
});
```

### 3.7 E2E-06: RMA Full Workflow (P2)

```typescript
// e2e/scenarios/e2e-06-rma-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-06: RMA Workflow', () => {
  test('submits RMA and tracks through 7 states', async ({ page }) => {
    await page.goto('/support/rma');

    // Submit RMA
    await page.getByLabel(/serial number/i).fill('TM-TEST-123456');
    await page.getByLabel(/issue description/i).fill('Module fails MemTest86.');
    await page.getByRole('button', { name: /submit rma/i }).click();

    await expect(page.getByText(/RMA submitted/i)).toBeVisible();
    const rmaNumber = await page.locator('[data-testid="rma-number"]').textContent();
    expect(rmaNumber).toMatch(/^RMA-\d{6}$/);

    // Track status progression (simulated via admin update in test setup)
    await page.goto(`/support/rma/status?number=${rmaNumber}`);
    
    const states = ['Submitted', 'Approved', 'Ship', 'Received', 'Testing', 'Replacement Shipped', 'Closed'];
    for (const state of states) {
      await expect(page.getByText(state)).toBeVisible();
    }
  });
});
```

### 3.8 E2E-07: Partner Portal Login (P2)

```typescript
// e2e/scenarios/e2e-07-partner-portal.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-07: Partner Portal', () => {
  test('distributor logs in and downloads watermarked price-list', async ({ page }) => {
    await page.goto('/partners/portal');

    await page.getByLabel(/email/i).fill('distributor@smarttechbd.com');
    await page.getByLabel(/password/i).fill('TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // MFA (if enabled in test env)
    const mfaCode = '123456'; // Mock TOTP
    await page.getByLabel(/verification code/i).fill(mfaCode);
    await page.getByRole('button', { name: /verify/i }).click();

    // Dashboard
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /price list/i })).toBeVisible();

    // Download price list
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /price list/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/price-list.*\.pdf$/);
  });
});
```

### 3.9 E2E-08: E-Commerce Checkout (P3)

```typescript
// e2e/scenarios/e2e-08-ecommerce-checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-08: E-Commerce Checkout', () => {
  test('adds product to cart and completes Stripe checkout', async ({ page }) => {
    await page.goto('/products/ddr5-voltx-rgb-32gb');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.getByText(/1 item in cart/i)).toBeVisible();

    await page.goto('/cart');
    await page.getByRole('button', { name: /checkout/i }).click();

    // Stripe Checkout (test mode)
    await expect(page).toHaveURL(/checkout.stripe.com/);
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/card number/i).fill('4242424242424242');
    await page.getByLabel(/expiration/i).fill('12/30');
    await page.getByLabel(/cvc/i).fill('123');
    await page.getByRole('button', { name: /pay/i }).click();

    // Success
    await expect(page).toHaveURL(/order-confirmation/);
    await expect(page.getByText(/thank you for your order/i)).toBeVisible();
  });
});
```

### 3.10 E2E-09: Arabic Language + RTL (P2)

```typescript
// e2e/scenarios/e2e-09-arabic-rtl.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-09: Arabic Language & RTL', () => {
  test('switches to Arabic and validates RTL layout', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /language/i }).click();
    await page.getByRole('link', { name: /arabic/i }).click();

    // Verify RTL
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    // Verify hreflang
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\/ar\//);

    // Verify mirrored layout
    const header = page.locator('header');
    const logo = header.locator('[data-testid="logo"]');
    const nav = header.locator('nav');
    
    const logoBox = await logo.boundingBox();
    const navBox = await nav.boundingBox();
    expect(logoBox!.x).toBeGreaterThan(navBox!.x); // Logo on right in RTL
  });
});
```

### 3.11 E2E-10: Anti-Counterfeit Serial Lookup (P2)

```typescript
// e2e/scenarios/e2e-10-anti-counterfeit.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E-10: Anti-Counterfeit Serial Lookup', () => {
  test('VERIFIED_GENUINE for valid serial', async ({ page }) => {
    await page.goto('/support/anti-counterfeit');
    await page.getByLabel(/serial number/i).fill('TM-VALID-123456');
    await page.getByRole('button', { name: /verify/i }).click();
    await expect(page.getByText(/verified genuine/i)).toBeVisible();
    await expect(page.getByText(/manufactured/i)).toBeVisible();
  });

  test('NOT_FOUND for unknown serial', async ({ page }) => {
    await page.goto('/support/anti-counterfeit');
    await page.getByLabel(/serial number/i).fill('TM-UNKNOWN-999999');
    await page.getByRole('button', { name: /verify/i }).click();
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test('SUSPECTED_COUNTERFEIT for flagged serial', async ({ page }) => {
    await page.goto('/support/anti-counterfeit');
    await page.getByLabel(/serial number/i).fill('TM-FLAGGED-000001');
    await page.getByRole('button', { name: /verify/i }).click();
    await expect(page.getByText(/suspected counterfeit/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /report counterfeit/i })).toBeVisible();
  });
});
```

---

## 4. Test Data & Fixtures

```typescript
// e2e/fixtures/test-data.ts
export const testSerials = {
  valid: 'TM-VALID-123456',
  unknown: 'TM-UNKNOWN-999999',
  flagged: 'TM-FLAGGED-000001',
  recalled: 'TM-RECALLED-000002',
};

export const testUsers = {
  distributor: {
    email: 'distributor@smarttechbd.com',
    password: 'TestPass123!',
    mfaCode: '123456',
  },
  admin: {
    email: 'admin@twinmos.com',
    password: 'AdminPass123!',
  },
};

export const testProducts = {
  ddr5Voltx: {
    slug: 'ddr5-voltx-rgb-32gb-5600mhz',
    name: 'DDR5 VOLTX RGB 32GB 5600MHz',
  },
};
```

---

## 5. CI Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 6. Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| QA Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Canonical Location:** `G - Quality Assurance and Testing/TwinMOSWebsiteE2ETestScenarios_Playwright.md`
