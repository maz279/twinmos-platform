# Accessibility Test Plan — axe-core + NVDA

**Document Reference:** TWN-QA-A11Y-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P1
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** QA Team, Front-End Developers, UX Designers, Accessibility Consultant
**Synchronized With:** BRD v3.0 §22.2, URD v3.0 §33, Tech Stack v1.1 §21.1, QA Strategy v1.0

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with axe-core CI integration, NVDA manual protocols, and WCAG 2.1 AA compliance matrix |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Accessibility Standards](#2-accessibility-standards)
3. [Testing Tools](#3-testing-tools)
4. [Automated Testing — axe-core](#4-automated-testing--axe-core)
5. [Manual Testing — NVDA](#5-manual-testing--nvda)
6. [Keyboard-Only Testing](#6-keyboard-only-testing)
7. [Color Contrast Testing](#7-color-contrast-testing)
8. [Zoom and Reflow Testing](#8-zoom-and-reflow-testing)
9. [Screen Reader Matrix](#9-screen-reader-matrix)
10. [Accessibility Regression](#10-accessibility-regression)
11. [Defect Classification](#11-defect-classification)
12. [Appendix A: WCAG 2.1 AA Checklist](#appendix-a-wcag-21-aa-checklist)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document defines the **accessibility testing approach** for the TwinMOS corporate website. It ensures compliance with WCAG 2.1 AA, EN 301 549, and regional accessibility requirements across all 9 supported locales including Arabic RTL. The plan combines automated testing (axe-core) with manual testing (NVDA, keyboard-only) to achieve comprehensive coverage.

### 1.2 Scope

**In scope:**
- All public-facing pages and components
- Partner portal (Phase 2)
- E-commerce checkout (Phase 3)
- Arabic RTL accessibility
- Mobile accessibility (iOS VoiceOver, Android TalkBack)
- PDF accessibility (datasheets)
- Form accessibility
- Dynamic content accessibility (search results, filters)

**Out of scope:**
- CMS admin panel (Strapi default accessibility)
- Third-party widgets (maps, chat) — tested for basic integration only
- Video content (if added, requires captions)

---

## 2. Accessibility Standards

### 2.1 Compliance Targets

| Standard | Level | Source |
|----------|-------|--------|
| **WCAG 2.1** | AA (minimum) | BRD §22.2, RFP §11.2 |
| **WCAG 2.1** | AAA (where feasible) | Best practice |
| **EN 301 549** | Full compliance | EU market requirement |
| **Section 508** | Equivalent | US market consideration |

### 2.2 Key Accessibility Requirements

| Requirement | WCAG Criterion | Test Method |
|-------------|---------------|-------------|
| Text alternatives for images | 1.1.1 | axe-core + manual |
| Keyboard accessible | 2.1.1, 2.1.2 | Keyboard-only test |
| No keyboard traps | 2.1.2 | Keyboard-only test |
| Focus visible | 2.4.7 | Visual inspection |
| Focus order logical | 2.4.3 | Keyboard-only test |
| Color contrast >= 4.5:1 | 1.4.3 | axe-core + manual |
| Large text contrast >= 3:1 | 1.4.3 | axe-core + manual |
| UI component contrast >= 3:1 | 1.4.11 | axe-core + manual |
| Text resize to 200% | 1.4.4 | Browser zoom test |
| Reflow at 320px | 1.4.10 | Responsive test |
| Consistent navigation | 3.2.3 | Manual review |
| Form labels | 3.3.2 | axe-core + NVDA |
| Error identification | 3.3.1 | Manual test |
| Status messages | 4.1.3 | NVDA test |
| Language identification | 3.1.1, 3.1.2 | axe-core + manual |

---

## 3. Testing Tools

### 3.1 Tool Stack

| Layer | Tool | Purpose | Frequency |
|-------|------|---------|-----------|
| Automated | axe-core | WCAG violation detection | Every build |
| Automated | axe-playwright | E2E accessibility tests | Every build |
| Automated | Lighthouse | Accessibility score | Every build |
| Manual | NVDA (Windows) | Screen reader testing | Weekly |
| Manual | JAWS (Windows) | Screen reader testing | Monthly |
| Manual | VoiceOver (macOS/iOS) | Screen reader testing | Monthly |
| Manual | TalkBack (Android) | Screen reader testing | Monthly |
| Manual | Keyboard only | Navigation testing | Weekly |
| Manual | Color contrast analyzer | Visual contrast check | Weekly |
| Manual | WAVE browser extension | Quick manual checks | Ad-hoc |

### 3.2 Tool Versions

| Tool | Version | Notes |
|------|---------|-------|
| axe-core | ^4.10 | Latest stable |
| axe-playwright | ^4.10 | Playwright integration |
| NVDA | 2024.4 | Free screen reader |
| Lighthouse | 12.x | Built into Chrome |
| WAVE | Browser extension | Quick checks |

---

## 4. Automated Testing — axe-core

### 4.1 CI Integration

```typescript
// tests/accessibility/axe.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const CRITICAL_PAGES = [
  '/',
  '/products/',
  '/products/memory/',
  '/products/voltx-rgb-ddr5-32gb-5600mhz/',
  '/compatibility/',
  '/where-to-buy/',
  '/contact/',
  '/support/',
  '/about/',
  '/ar/',                    // Arabic RTL
  '/partner/login/',         // Phase 2
];

for (const path of CRITICAL_PAGES) {
  test(`accessibility: ${path}`, async ({ page }) => {
    await page.goto(path);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
}
```

### 4.2 Axe Configuration

```typescript
// tests/accessibility/axe-config.ts
export const axeConfig = {
  // WCAG tags to evaluate
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  
  // Rules to disable (if false positives)
  rules: [
    {
      id: 'color-contrast',
      enabled: true,
    },
    {
      id: 'heading-order',
      enabled: true,
    },
    {
      id: 'region',
      enabled: true,
    },
    {
      id: 'landmark-one-main',
      enabled: true,
    },
  ],
  
  // Exclude third-party widgets
  exclude: [
    ['#chatwoot-widget'],           // Live chat
    ['.maplibregl-canvas'],         // Map canvas
    ['[data-testid="third-party"]'],
  ],
};
```

### 4.3 Per-Component Axe Tests

```typescript
// tests/accessibility/components.spec.ts
test('product card is accessible', async ({ page }) => {
  await page.goto('/products/memory/');
  
  const card = page.locator('[data-testid="product-card"]').first();
  const results = await new AxeBuilder({ page })
    .include('[data-testid="product-card"]')
    .analyze();
  
  expect(results.violations).toEqual([]);
});

test('contact form is accessible', async ({ page }) => {
  await page.goto('/contact/');
  
  const form = page.locator('[data-testid="contact-form"]');
  const results = await new AxeBuilder({ page })
    .include('[data-testid="contact-form"]')
    .analyze();
  
  expect(results.violations).toEqual([]);
});
```

### 4.4 GitHub Actions Integration

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Build and start
        run: |
          npm run build
          npm run preview &
          npx wait-on http://localhost:4321
      - name: Run axe tests
        run: npx playwright test tests/accessibility/
      - name: Upload report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report
          path: test-results/
```

---

## 5. Manual Testing — NVDA

### 5.1 NVDA Test Environment

| Setting | Value |
|---------|-------|
| Screen Reader | NVDA 2024.4 |
| Browser | Firefox (primary), Chrome (secondary) |
| OS | Windows 11 |
| Synthesizer | eSpeak NG or Windows OneCore |
| Braille | None (screen reader only) |

### 5.2 NVDA Test Protocol

#### Homepage NVDA Test

| Step | Action | Expected NVDA Output |
|------|--------|---------------------|
| 1 | Open homepage | "TwinMOS Technologies — Homepage, heading level 1" |
| 2 | Press H | Navigate to next heading |
| 3 | Press 1 | Navigate to heading level 1 |
| 4 | Press Tab | Focus moves to skip link, then nav items |
| 5 | Press Enter on "Products" | Navigate to Products page |
| 6 | Press L | Navigate to lists (category grid) |
| 7 | Press G | Navigate to graphics (images have alt text) |
| 8 | Press F | Navigate to form fields (newsletter) |
| 9 | Press T | Navigate to tables (if any) |
| 10 | Press Insert + F7 | Elements list shows all headings, links, landmarks |

#### Product Detail NVDA Test

| Step | Action | Expected NVDA Output |
|------|--------|---------------------|
| 1 | Open product page | Product name announced as heading level 1 |
| 2 | Tab to image gallery | "Product image, graphic, VOLTX RGB DDR5" |
| 3 | Tab to specs table | Table announced with row/column counts |
| 4 | Tab to "Download Datasheet" | "Download Datasheet, link, opens in new tab" |
| 5 | Tab to related products | Related products announced as list |

#### Form NVDA Test

| Step | Action | Expected NVDA Output |
|------|--------|---------------------|
| 1 | Tab to name field | "Your Name, edit, required, blank" |
| 2 | Type "Test User" | Characters announced as typed |
| 3 | Tab to email field | "Email Address, edit, required, blank" |
| 4 | Submit with errors | "Form has 3 errors" + error list announced |
| 5 | Tab to error | "Error: Email is required" |

### 5.3 NVDA Testing Schedule

| Page | Frequency | Duration |
|------|-----------|----------|
| Homepage | Weekly | 15 min |
| Product Category | Weekly | 10 min |
| Product Detail | Weekly | 15 min |
| Compatibility Finder | Weekly | 10 min |
| Where to Buy | Weekly | 10 min |
| Contact Form | Weekly | 10 min |
| Partner Portal (P2) | Weekly | 15 min |
| Arabic RTL (P2) | Weekly | 15 min |
| E-commerce Checkout (P3) | Weekly | 15 min |

---

## 6. Keyboard-Only Testing

### 6.1 Keyboard Navigation Test

| Key | Action | Test On |
|-----|--------|---------|
| Tab | Move forward through interactive elements | All pages |
| Shift + Tab | Move backward | All pages |
| Enter | Activate links and buttons | All pages |
| Space | Activate buttons, check checkboxes | All pages |
| Arrow keys | Navigate within widgets (menus, tabs, radios) | All pages |
| Escape | Close modals, menus, dropdowns | All pages |
| Home / End | Jump to start/end of list | Lists, menus |
| Page Up / Down | Scroll | Long pages |

### 6.2 Keyboard Test Scenarios

#### Scenario: Complete Purchase Journey (Keyboard Only)

| Step | Key(s) | Expected Result |
|------|--------|----------------|
| 1 | Tab to search | Search input focused |
| 2 | Type "DDR5", Enter | Search results displayed |
| 3 | Tab to first product, Enter | Product detail page |
| 4 | Tab to "Add to Compare", Space | Product added |
| 5 | Tab to "Where to Buy", Enter | Where to Buy page |
| 6 | Tab to country filter, Arrow, Enter | Filter applied |
| 7 | Tab to retailer, Enter | Retailer details |
| 8 | Tab to "Contact", Enter | Contact page |
| 9 | Tab through form, fill, Tab to submit, Enter | Form submitted |

### 6.3 Focus Visibility Requirements

| Element | Focus Style | CSS |
|---------|-------------|-----|
| Links | 2px solid outline, 2px offset | `outline: 2px solid #0056D6; outline-offset: 2px;` |
| Buttons | 2px solid outline, 2px offset | Same as links |
| Form inputs | 2px border color change | `border-color: #0056D6; box-shadow: 0 0 0 3px rgba(0,86,214,0.2);` |
| Cards | 2px outline | `outline: 2px solid #0056D6;` |

---

## 7. Color Contrast Testing

### 7.1 Contrast Requirements

| Element | Ratio | Example |
|---------|-------|---------|
| Normal text (< 18pt) | >= 4.5:1 | Body text on background |
| Large text (>= 18pt bold / 24pt) | >= 3:1 | Headings |
| UI components | >= 3:1 | Buttons, form borders |
| Graphical objects | >= 3:1 | Icons, charts |

### 7.2 TwinMOS Color Palette Contrast

| Color | Hex | On White | On Dark | Usage |
|-------|-----|----------|---------|-------|
| Primary Blue | #0056D6 | 6.8:1 | — | Links, buttons |
| Primary Hover | #004BB8 | 7.9:1 | — | Hover states |
| Text Primary | #1A1A1A | 15.3:1 | — | Body text |
| Text Secondary | #4A4A4A | 8.9:1 | — | Secondary text |
| Text Muted | #6B7280 | 5.7:1 | — | Captions |
| Success | #059669 | 5.1:1 | — | Success states |
| Error | #DC2626 | 5.4:1 | — | Error states |
| Warning | #D97706 | 3.8:1 | — | Warning states |

### 7.3 Automated Contrast Testing

```typescript
// tests/accessibility/contrast.spec.ts
test('color contrast meets WCAG AA', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa'])
    .options({
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'color-contrast-enhanced',
          enabled: true, // AAA level
        },
      ],
    })
    .analyze();
  
  expect(results.violations.filter(v => v.id === 'color-contrast')).toEqual([]);
});
```

---

## 8. Zoom and Reflow Testing

### 8.1 Zoom Test Cases

| Zoom Level | Test | Expected Result |
|------------|------|----------------|
| 100% | Baseline | Normal layout |
| 150% | Text zoom | Text larger, layout adjusts |
| 200% | WCAG requirement | No horizontal scroll, content readable |
| 250% | Stress test | Still usable, may require more scrolling |
| 400% | Maximum | Content visible, navigation accessible |

### 8.2 Reflow Test (320px viewport)

| Element | At 320px | Expected |
|---------|----------|----------|
| Homepage | Mobile layout | Single column, stacked |
| Navigation | Hamburger menu | Accessible |
| Product grid | 1 column | Cards stack vertically |
| Form inputs | Full width | Labels above inputs |
| Tables | Horizontal scroll or cards | Data accessible |

---

## 9. Screen Reader Matrix

### 9.1 Monthly Screen Reader Testing

| Screen Reader | Browser | OS | Frequency | Tester |
|---------------|---------|-----|-----------|--------|
| NVDA | Firefox | Windows 11 | Weekly | QA Lead |
| NVDA | Chrome | Windows 11 | Monthly | QA Lead |
| JAWS | Chrome | Windows 11 | Monthly | External consultant |
| VoiceOver | Safari | macOS Sonoma | Monthly | QA Lead |
| VoiceOver | Safari | iOS 18 | Monthly | QA Lead |
| TalkBack | Chrome | Android 14 | Monthly | QA Lead |

### 9.2 Screen Reader Test Results Template

| Page | NVDA | JAWS | VoiceOver macOS | VoiceOver iOS | TalkBack | Date |
|------|------|------|-----------------|---------------|----------|------|
| Homepage | Pass | | | | | |
| Product Category | Pass | | | | | |
| Product Detail | Pass | | | | | |
| Compatibility | Pass | | | | | |
| Where to Buy | Pass | | | | | |
| Contact Form | Pass | | | | | |
| Partner Portal | — | | | | | |
| Arabic RTL | — | | | | | |

---

## 10. Accessibility Regression

### 10.1 Regression Suite

```typescript
// tests/accessibility/regression.spec.ts
const A11Y_REGRESSION_PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/products/', name: 'product-category' },
  { path: '/products/voltx-rgb-ddr5-32gb-5600mhz/', name: 'product-detail' },
  { path: '/compatibility/', name: 'compatibility' },
  { path: '/where-to-buy/', name: 'where-to-buy' },
  { path: '/contact/', name: 'contact' },
  { path: '/ar/', name: 'arabic-homepage' },
];

for (const { path, name } of A11Y_REGRESSION_PAGES) {
  test(`a11y regression: ${name}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

### 10.2 Lighthouse Accessibility Gate

```javascript
// lighthouserc.js — accessibility assertions
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'accessibility-aria-allowed-attr': 'error',
        'accessibility-aria-required-attr': 'error',
        'accessibility-aria-required-children': 'error',
        'accessibility-aria-roles': 'error',
        'accessibility-aria-valid-attr-value': 'error',
        'accessibility-aria-valid-attr': 'error',
        'accessibility-button-name': 'error',
        'accessibility-bypass': 'error',
        'accessibility-color-contrast': 'error',
        'accessibility-definition-list': 'error',
        'accessibility-dlitem': 'error',
        'accessibility-document-title': 'error',
        'accessibility-duplicate-id-active': 'error',
        'accessibility-duplicate-id-aria': 'error',
        'accessibility-form-field-multiple-labels': 'error',
        'accessibility-frame-title': 'error',
        'accessibility-heading-order': 'error',
        'accessibility-html-has-lang': 'error',
        'accessibility-html-lang-valid': 'error',
        'accessibility-image-alt': 'error',
        'accessibility-input-image-alt': 'error',
        'accessibility-label': 'error',
        'accessibility-link-name': 'error',
        'accessibility-list': 'error',
        'accessibility-listitem': 'error',
        'accessibility-meta-refresh': 'error',
        'accessibility-meta-viewport': 'error',
        'accessibility-object-alt': 'error',
        'accessibility-tabindex': 'error',
        'accessibility-td-headers-attr': 'error',
        'accessibility-th-has-data-cells': 'error',
        'accessibility-valid-lang': 'error',
        'accessibility-video-caption': 'error',
      },
    },
  },
};
```

---

## 11. Defect Classification

### 11.1 Accessibility Defect Severity

| Severity | Definition | Example |
|----------|------------|---------|
| **Critical** | Screen reader users cannot complete primary tasks | Form has no labels, keyboard trap |
| **High** | Significant barrier for assistive technology users | Missing alt text on product images, no focus indicator |
| **Medium** | Noticeable issue but workaround exists | Heading hierarchy skipped, redundant alt text |
| **Low** | Minor issue, minimal impact | Slightly insufficient contrast (4.4:1), decorative image has alt |

### 11.2 Defect Examples

| WCAG Criterion | Severity | Example |
|---------------|----------|---------|
| 1.1.1 Non-text Content | High | Product images missing alt text |
| 1.3.1 Info and Relationships | High | Form labels not associated with inputs |
| 1.4.3 Contrast | Medium | Footer text contrast 4.2:1 |
| 2.1.1 Keyboard | Critical | Carousel cannot be operated with keyboard |
| 2.4.3 Focus Order | High | Tab order jumps illogically |
| 2.4.7 Focus Visible | High | No focus indicator on buttons |
| 3.1.1 Language of Page | Medium | Arabic page missing lang="ar" |
| 4.1.2 Name, Role, Value | High | Custom dropdown missing ARIA |

---

## Appendix A: WCAG 2.1 AA Checklist

### Perceivable

- [ ] 1.1.1 Text Alternatives — All images have appropriate alt text
- [ ] 1.2.1 Captions (Prerecorded) — Videos have captions
- [ ] 1.3.1 Info and Relationships — Structure conveyed through markup
- [ ] 1.3.2 Meaningful Sequence — Content order is logical
- [ ] 1.3.3 Sensory Characteristics — Instructions not color-only
- [ ] 1.4.1 Use of Color — Information not conveyed by color alone
- [ ] 1.4.2 Audio Control — No auto-playing audio
- [ ] 1.4.3 Contrast (Minimum) — 4.5:1 for normal text
- [ ] 1.4.4 Resize Text — Text resizable to 200%
- [ ] 1.4.5 Images of Text — Text used instead of images where possible
- [ ] 1.4.10 Reflow — Content readable at 320px width
- [ ] 1.4.11 Non-text Contrast — UI components have 3:1 contrast
- [ ] 1.4.12 Text Spacing — Text readable with increased spacing
- [ ] 1.4.13 Content on Hover — Hover content is dismissible

### Operable

- [ ] 2.1.1 Keyboard — All functionality available via keyboard
- [ ] 2.1.2 No Keyboard Trap — Keyboard users not trapped
- [ ] 2.2.1 Timing Adjustable — Time limits can be extended
- [ ] 2.2.2 Pause, Stop, Hide — Moving content can be controlled
- [ ] 2.3.1 Three Flashes — No content flashes > 3 times per second
- [ ] 2.4.1 Bypass Blocks — Skip links available
- [ ] 2.4.2 Page Titled — Pages have descriptive titles
- [ ] 2.4.3 Focus Order — Focus order is logical
- [ ] 2.4.4 Link Purpose — Link text describes destination
- [ ] 2.4.5 Multiple Ways — Multiple ways to find pages
- [ ] 2.4.6 Headings and Labels — Descriptive headings and labels
- [ ] 2.4.7 Focus Visible — Focus indicator visible
- [ ] 2.5.1 Pointer Gestures — Single-pointer alternatives
- [ ] 2.5.2 Pointer Cancellation — Actions on mouse up
- [ ] 2.5.3 Label in Name — Accessible name contains visible label
- [ ] 2.5.4 Motion Actuation — Motion can be disabled

### Understandable

- [ ] 3.1.1 Language of Page — Page language declared
- [ ] 3.1.2 Language of Parts — Language changes declared
- [ ] 3.2.1 On Focus — Focus does not change context
- [ ] 3.2.2 On Input — Input does not change context unexpectedly
- [ ] 3.2.3 Consistent Navigation — Navigation consistent across pages
- [ ] 3.2.4 Consistent Identification — Components identified consistently
- [ ] 3.3.1 Error Identification — Errors identified clearly
- [ ] 3.3.2 Labels or Instructions — Form fields have labels
- [ ] 3.3.3 Error Suggestion — Error correction suggested
- [ ] 3.3.4 Error Prevention — Important submissions can be reversed

### Robust

- [ ] 4.1.1 Parsing — Valid HTML
- [ ] 4.1.2 Name, Role, Value — Custom components have ARIA
- [ ] 4.1.3 Status Messages — Status messages announced

---

**End of Document**
