# Visual Regression Test Plan

**Document Reference:** TWN-QA-VISUAL-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P3
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** QA Team, Front-End Developers, UX Designers, Project Manager
**Synchronized With:** Tech Stack v1.1 §21.1, E2E Test Plan, Cross-Browser Matrix

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with Playwright snapshot strategy, baseline management, and approval workflow |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Visual Regression Strategy](#2-visual-regression-strategy)
3. [Tools & Configuration](#3-tools--configuration)
4. [Baseline Management](#4-baseline-management)
5. [Test Coverage](#5-test-coverage)
6. [Execution Schedule](#6-execution-schedule)
7. [Thresholds & Tolerance](#7-thresholds--tolerance)
8. [Review & Approval Workflow](#8-review--approval-workflow)
9. [Cross-Browser Visual Testing](#9-cross-browser-visual-testing)
10. [Mobile Visual Testing](#10-mobile-visual-testing)
11. [Maintenance & Cleanup](#11-maintenance--cleanup)
12. [Appendix A: Snapshot Naming Convention](#appendix-a-snapshot-naming-convention)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document defines the **visual regression testing approach** for the TwinMOS corporate website. Visual regression testing detects unintended visual changes by comparing screenshots of web pages against approved baseline images. It complements functional testing by catching CSS regressions, layout shifts, and design inconsistencies that functional tests cannot detect.

### 1.2 Scope

**In scope:**
- Homepage visual validation
- Product detail page visual validation
- Key component visual validation (hero, cards, forms)
- Cross-browser visual comparison (Tier 1 browsers)
- Mobile viewport visual comparison
- RTL layout visual comparison (Phase 2)
- Dark mode visual comparison (Gaming hub)

**Out of scope:**
- CMS admin panel visual testing (Strapi default UI)
- Dynamic content visual testing (user-generated content)
- Video/frame-by-frame visual testing
- Third-party widget visual testing (maps, chat)

### 1.3 When to Use Visual Regression

| Scenario | Visual Regression? | Rationale |
|----------|-------------------|-----------|
| CSS framework update | Yes | High risk of visual changes |
| Design system token change | Yes | Affects all components |
| Component library update | Yes | May change rendering |
| New page launch | Yes | Establish new baseline |
| Content update | No | Expected to change |
| Copy change | No | Expected to change |
| Backend API change | Maybe | If it affects displayed data |
| Bug fix | Maybe | If fix area has visual tests |

---

## 2. Visual Regression Strategy

### 2.1 Approach

The TwinMOS project uses **Playwright's built-in snapshot testing** for visual regression. This approach:

- Integrates seamlessly with existing Playwright E2E tests
- Requires no additional tools or subscriptions
- Supports multiple browsers and viewports
- Provides pixel-by-pixel comparison with configurable thresholds
- Generates diff images for easy review

### 2.2 Visual Testing Pyramid

```
        /\
       /  \     Page-level snapshots (full page)
      /____\        Homepage, Product Detail, Category
     /      \   
    /        \  Component-level snapshots (isolated)
   /__________\     Hero, Product Card, Form, Navigation
  /            \
 /              \ Element-level snapshots (single element)
/________________\    Buttons, Icons, Badges
```

### 2.3 Visual Test Types

| Type | Description | Example | Frequency |
|------|-------------|---------|-----------|
| **Full page** | Entire page screenshot | Homepage at 1280px | Weekly |
| **Component** | Isolated component screenshot | Product card | Per component change |
| **Element** | Single element screenshot | Primary button | Per design token change |
| **Viewport** | Specific viewport screenshot | Mobile menu | Per responsive change |

---

## 3. Tools & Configuration

### 3.1 Playwright Snapshot Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  // ... other config
  expect: {
    toHaveScreenshot: {
      // Pixel matching threshold (0 = exact, 1 = anything)
      threshold: 0.2,
      // Maximum allowed pixel difference ratio
      maxDiffPixelRatio: 0.02,
      // Maximum allowed pixel difference count
      maxDiffPixels: 100,
      // Animation handling
      animations: 'disabled',
      // Scale factor for high-DPI displays
      scale: 'css',
      // Full page or viewport
      fullPage: false,
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },
});
```

### 3.2 Snapshot Project Configuration

```typescript
// playwright.config.ts — add visual regression project
{
  name: 'Visual Regression',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 720 },
  },
  testMatch: 'tests/visual/**/*.spec.ts',
},
{
  name: 'Visual Regression Mobile',
  use: {
    ...devices['iPhone 14'],
  },
  testMatch: 'tests/visual/**/*.spec.ts',
},
```

### 3.3 Visual Test Helper

```typescript
// tests/utils/visual-test.ts
import { Page, expect } from '@playwright/test';

export async function takeVisualSnapshot(
  page: Page,
  name: string,
  options: {
    fullPage?: boolean;
    mask?: string[];
    clip?: { x: number; y: number; width: number; height: number };
  } = {}
) {
  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);
  
  // Wait for images to load
  await page.waitForFunction(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).every(img => img.complete);
  });
  
  // Wait for animations to settle
  await page.waitForTimeout(500);
  
  // Take screenshot
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: options.fullPage ?? false,
    mask: options.mask?.map(selector => page.locator(selector)),
    clip: options.clip,
  });
}
```

---

## 4. Baseline Management

### 4.1 Baseline Storage

| Aspect | Configuration |
|--------|---------------|
| Storage location | `tests/visual/__snapshots__/` |
| Version control | Yes, committed to Git |
| File format | PNG |
| Naming | `{test-name}-{browser}-{viewport}.png` |
| Organization | Mirror test file structure |

### 4.2 Baseline Directory Structure

```
tests/
├── visual/
│   ├── homepage.spec.ts
│   ├── product-detail.spec.ts
│   ├── components.spec.ts
│   └── __snapshots__/
│       ├── homepage.spec.ts/
│       │   ├── homepage-hero-chromium-1280x720.png
│       │   ├── homepage-full-chromium-1280x720.png
│       │   ├── homepage-hero-webkit-1280x720.png
│       │   └── homepage-hero-chromium-375x667.png
│       ├── product-detail.spec.ts/
│       │   ├── product-detail-chromium-1280x720.png
│       │   └── product-detail-mobile-chromium-375x667.png
│       └── components.spec.ts/
│           ├── product-card-chromium-1280x720.png
│           └── primary-button-chromium-1280x720.png
```

### 4.3 Baseline Update Workflow

```
Visual test fails
      |
      v
Review diff image
      |
      +-- Intentional change? --> Update baseline
      |                           |
      |                           v
      |                         Run: npx playwright test --update-snapshots
      |                           |
      |                           v
      |                         Commit new baseline
      |                           |
      |                           v
      |                         PR review for visual changes
      |
      +-- Unintentional change? --> File bug, fix code
                                    |
                                    v
                                  Do NOT update baseline
```

### 4.4 Baseline Update Commands

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update specific test snapshots
npx playwright test tests/visual/homepage.spec.ts --update-snapshots

# Update snapshots for specific project
npx playwright test --project="Visual Regression" --update-snapshots
```

---

## 5. Test Coverage

### 5.1 Page-Level Visual Tests

| Page | Viewports | Elements Tested | Priority |
|------|-----------|-----------------|----------|
| **Homepage** | 1280x720, 375x667 | Hero, categories, featured products, footer | P1 |
| **Product Category** | 1280x720, 375x667 | Grid, filters, pagination, breadcrumbs | P1 |
| **Product Detail** | 1280x720, 375x667 | Gallery, specs, CTA, related products | P1 |
| **Compatibility Finder** | 1280x720, 375x667 | Search, results, cards | P2 |
| **Where to Buy** | 1280x720, 375x667 | Map, list, filters | P2 |
| **Contact** | 1280x720, 375x667 | Form, info, map | P2 |
| **Partner Portal Login** | 1280x720, 375x667 | Login form, branding | P2 |
| **Partner Portal Dashboard** | 1280x720 | Dashboard, charts, tables | P3 |
| **Cart (P3)** | 1280x720, 375x667 | Cart items, summary, checkout CTA | P3 |

### 5.2 Component-Level Visual Tests

| Component | States Tested | Priority |
|-----------|--------------|----------|
| **Hero Carousel** | Default, hover, active slide | P1 |
| **Product Card** | Default, hover, out of stock | P1 |
| **Primary Button** | Default, hover, active, disabled | P1 |
| **Form Input** | Default, focus, error, filled | P1 |
| **Navigation** | Desktop, mobile open, mobile closed | P1 |
| **Cookie Banner** | Default, accepted | P2 |
| **Modal/Dialog** | Open, closed | P2 |
| **Toast Notification** | Success, error, warning | P2 |
| **Pagination** | First page, middle, last | P3 |
| **Breadcrumb** | Default, hover | P3 |

### 5.3 Visual Test Examples

```typescript
// tests/visual/homepage.spec.ts
import { test, expect } from '@playwright/test';
import { takeVisualSnapshot } from '../utils/visual-test';

test.describe('Homepage Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for hero carousel to settle
    await page.waitForTimeout(1000);
  });

  test('hero section matches baseline', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-section"]');
    await expect(hero).toHaveScreenshot('homepage-hero.png');
  });

  test('full page matches baseline', async ({ page }) => {
    await takeVisualSnapshot(page, 'homepage-full', { fullPage: true });
  });

  test('category grid matches baseline', async ({ page }) => {
    const grid = page.locator('[data-testid="category-grid"]');
    await expect(grid).toHaveScreenshot('homepage-category-grid.png');
  });

  test('mobile homepage matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await takeVisualSnapshot(page, 'homepage-mobile', { fullPage: true });
  });
});

// tests/visual/product-detail.spec.ts
test.describe('Product Detail Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products/voltx-rgb-ddr5-32gb-5600mhz');
    await page.waitForTimeout(1000);
  });

  test('product gallery matches baseline', async ({ page }) => {
    const gallery = page.locator('[data-testid="product-gallery"]');
    await expect(gallery).toHaveScreenshot('product-gallery.png');
  });

  test('specifications table matches baseline', async ({ page }) => {
    const specs = page.locator('[data-testid="specs-table"]');
    await expect(specs).toHaveScreenshot('product-specs-table.png');
  });

  test('CTA section matches baseline', async ({ page }) => {
    const cta = page.locator('[data-testid="product-cta"]');
    await expect(cta).toHaveScreenshot('product-cta.png');
  });
});

// tests/visual/components.spec.ts
test.describe('Component Visual Regression', () => {
  test('primary button states', async ({ page }) => {
    await page.goto('/storybook/button'); // Or component test page
    
    const button = page.locator('[data-testid="primary-button"]');
    
    // Default state
    await expect(button).toHaveScreenshot('button-primary-default.png');
    
    // Hover state
    await button.hover();
    await expect(button).toHaveScreenshot('button-primary-hover.png');
    
    // Active state
    await button.click();
    await expect(button).toHaveScreenshot('button-primary-active.png');
    
    // Disabled state
    await page.evaluate(() => {
      document.querySelector('[data-testid="primary-button"]')?.setAttribute('disabled', 'true');
    });
    await expect(button).toHaveScreenshot('button-primary-disabled.png');
  });
});
```

---

## 6. Execution Schedule

### 6.1 Visual Regression Schedule

| Trigger | Tests Run | Baseline Update |
|---------|-----------|-----------------|
| **Every build** | Smoke visual tests (homepage only) | No |
| **Weekly (Friday)** | Full visual suite | Only if intentional |
| **Before release** | Full visual suite + cross-browser | Only if intentional |
| **Design token change** | All component tests | Yes |
| **CSS framework update** | Full visual suite | Yes |
| **New page launch** | New page tests | Yes (new baseline) |

### 6.2 CI Integration

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on:
  push:
    branches: [main, develop]
    paths:
      - 'src/**/*.css'
      - 'src/**/*.scss'
      - 'src/**/*.astro'
      - 'src/**/*.tsx'
      - 'tests/visual/**'
  pull_request:
    paths:
      - 'src/**/*.css'
      - 'src/**/*.scss'
      - 'src/**/*.astro'
      - 'src/**/*.tsx'
      - 'tests/visual/**'

jobs:
  visual:
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
      - name: Start server
        run: npm run preview &
      - name: Wait for server
        run: npx wait-on http://localhost:4321
      - name: Run visual tests
        run: npx playwright test tests/visual/ --project="Visual Regression"
      - name: Upload diff artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diff
          path: test-results/
```

---

## 7. Thresholds & Tolerance

### 7.1 Threshold Configuration

| Test Type | maxDiffPixelRatio | maxDiffPixels | threshold | Rationale |
|-----------|-------------------|---------------|-----------|-----------|
| **Full page** | 0.02 | 200 | 0.2 | Minor anti-aliasing differences |
| **Component** | 0.01 | 50 | 0.2 | Tighter control on components |
| **Element** | 0.005 | 20 | 0.2 | Strictest for single elements |
| **Mobile** | 0.03 | 150 | 0.2 | More tolerance for font rendering |
| **Cross-browser** | 0.05 | 300 | 0.3 | Browser rendering differences |

### 7.2 Common Causes of Diff Failures

| Cause | Action | Prevention |
|-------|--------|------------|
| Font loading timing | Wait for fonts before screenshot | `document.fonts.ready` |
| Image loading timing | Wait for images before screenshot | `img.complete` check |
| Animation in progress | Disable animations or wait | `animations: 'disabled'` |
| Date/time display | Mock date in tests | `page.evaluate(() => { Date.now = ... })` |
| Dynamic content | Mask dynamic areas | `mask` option |
| Anti-aliasing differences | Increase threshold slightly | Config per test |
| Browser version update | Update baseline | `--update-snapshots` |

### 7.3 Masking Dynamic Content

```typescript
// Mask elements that change between runs
await expect(page).toHaveScreenshot('homepage.png', {
  mask: [
    page.locator('[data-testid="news-ticker"]'),     // Rotating news
    page.locator('[data-testid="live-chat-widget"]'), // Third-party
    page.locator('[data-testid="user-greeting"]'),    // Personalized
  ],
});
```

---

## 8. Review & Approval Workflow

### 8.1 Visual Change Review Process

```
Visual test fails in CI
      |
      v
Diff artifact uploaded
      |
      v
PR reviewer checks diff image
      |
      +-- Intentional design change?
      |   |
      |   +-- YES --> Developer updates baseline
      |   |           |
      |   |           v
      |   |         UX Designer approves visual change
      |   |           |
      |   |           v
      |   |         Commit updated baseline
      |   |           |
      |   |           v
      |   |         PR merged
      |   |
      |   +-- NO --> Developer fixes code
      |               |
      |               v
      |             Re-run tests
      |
      +-- Unsure? --> Schedule UX review meeting
```

### 8.2 Approval Roles

| Role | Authority | When Needed |
|------|-----------|-------------|
| **Developer** | Can update baseline | After confirming intentional change |
| **UX Designer** | Must approve visual changes | Any pixel-level design change |
| **QA Lead** | Can approve minor threshold adjustments | Anti-aliasing, font rendering |
| **Product Manager** | Approves significant visual changes | Rebrand, layout changes |

### 8.3 Visual Change Documentation

When baselines are updated, the PR must include:

```markdown
## Visual Changes

### Baselines Updated
- `homepage-hero.png` — Updated hero image (new product launch)
- `product-card.png` — Updated card shadow per design system v2

### Reason for Change
Design system tokens updated in PR #123. Shadow values changed from `0 2px 4px rgba(0,0,0,0.1)` to `0 4px 8px rgba(0,0,0,0.15)`.

### UX Approval
- [x] Approved by @ux-designer

### Screenshots
[Attach before/after comparison]
```

---

## 9. Cross-Browser Visual Testing

### 9.1 Browser-Specific Baselines

Each browser has its own baseline due to rendering differences:

| Browser | Baseline Suffix | Notes |
|---------|----------------|-------|
| Chrome | `-chromium` | Primary baseline |
| Safari | `-webkit` | Font rendering differences |
| Firefox | `-firefox` | Subtle layout differences |

### 9.2 Cross-Browser Test Example

```typescript
// tests/visual/cross-browser.spec.ts
test.describe('Cross-Browser Visual Regression', () => {
  test('homepage renders consistently', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05, // More tolerance for cross-browser
    });
  });
});
```

### 9.3 Cross-Browser Tolerance

| Browser Pair | Expected Differences | Tolerance |
|--------------|---------------------|-----------|
| Chrome ↔ Safari | Fonts, anti-aliasing, form controls | 5% |
| Chrome ↔ Firefox | Scrollbars, fonts, shadows | 5% |
| Safari ↔ Firefox | Fonts, flexbox rendering | 5% |

---

## 10. Mobile Visual Testing

### 10.1 Mobile Viewport Tests

| Device | Viewport | Tests |
|--------|----------|-------|
| iPhone SE | 375 x 667 | Homepage, Product Detail, Navigation |
| iPhone 15 | 390 x 844 | Homepage, Product Detail, Forms |
| iPhone 15 Pro Max | 430 x 932 | Full page tests |
| Pixel 8 | 412 x 915 | Android-specific rendering |

### 10.2 Mobile-Specific Considerations

| Consideration | Handling |
|---------------|----------|
| Safe area insets | Test with and without notch |
| Touch targets | Visual verification of 44px minimum |
| Hamburger menu | Capture open and closed states |
| Bottom sheets | Capture half-expanded and full states |
| Keyboard open | Mask keyboard area |

---

## 11. Maintenance & Cleanup

### 11.1 Baseline Maintenance

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Review outdated baselines | Monthly | QA Lead |
| Remove baselines for deprecated pages | Per release | QA Lead |
| Compress baseline images | Monthly | DevOps |
| Archive old baselines | Quarterly | QA Lead |

### 11.2 Storage Optimization

| Strategy | Implementation |
|----------|----------------|
| **Git LFS** | Store baselines in Git LFS to avoid repo bloat |
| **Compression** | Use PNG compression on baseline images |
| **Selective storage** | Only store baselines for stable pages |
| **Cleanup script** | Remove orphaned baselines automatically |

```bash
# Git LFS setup
git lfs track "tests/visual/__snapshots__/**/*.png"

# Compress baselines
find tests/visual/__snapshots__ -name "*.png" -exec pngquant --quality=80-95 {} \;
```

### 11.3 Baseline Retention

| Baseline Type | Retention | Action After |
|---------------|-----------|--------------|
| Current release | Active | Archive after 2 releases |
| Archived | 6 months | Delete after 6 months |
| Orphaned (no test) | Immediate | Delete on discovery |

---

## Appendix A: Snapshot Naming Convention

### A.1 Naming Pattern

```
{page-or-component}-{element-or-state}-{browser}-{viewport-width}x{viewport-height}.png
```

### A.2 Examples

| File Name | Description |
|-----------|-------------|
| `homepage-hero-chromium-1280x720.png` | Homepage hero section, Chrome, desktop |
| `homepage-full-webkit-375x667.png` | Full homepage, Safari, iPhone SE |
| `product-detail-gallery-chromium-1280x720.png` | Product gallery, Chrome, desktop |
| `product-card-hover-chromium-1280x720.png` | Product card hover state, Chrome |
| `button-primary-disabled-chromium-1280x720.png` | Primary button disabled state |
| `nav-mobile-open-chromium-375x667.png` | Mobile navigation open state |

---

**End of Document**
