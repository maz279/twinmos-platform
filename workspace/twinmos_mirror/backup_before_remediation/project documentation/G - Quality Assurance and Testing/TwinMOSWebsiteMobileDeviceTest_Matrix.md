# Mobile Device Test Matrix

**Document Reference:** TWN-QA-MOBILE-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P1
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** QA Team, Front-End Developers, UX Designers, Project Manager
**Synchronized With:** URD v3.0 §7.1, §23, BRD v3.0 §32.1, Tech Stack v1.1 §21.1

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with device matrix, touch interaction tests, responsive breakpoint validation, and real-device testing protocols |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Device Selection Rationale](#2-device-selection-rationale)
3. [Device Test Matrix](#3-device-test-matrix)
4. [Responsive Breakpoint Validation](#4-responsive-breakpoint-validation)
5. [Touch Interaction Test Cases](#5-touch-interaction-test-cases)
6. [Mobile-Specific Feature Tests](#6-mobile-specific-feature-tests)
7. [Performance on Mobile Devices](#7-performance-on-mobile-devices)
8. [Real Device Testing Protocol](#8-real-device-testing-protocol)
9. [BrowserStack App Live Schedule](#9-browserstack-app-live-schedule)
10. [Mobile Defect Categories](#10-mobile-defect-categories)
11. [Appendix A: Device Specifications](#appendix-a-device-specifications)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document defines the **mobile device test matrix** for the TwinMOS corporate website. With **55-80% of users accessing the site via mobile devices** (depending on persona), mobile testing is critical to project success. This matrix ensures comprehensive coverage across smartphones, tablets, and emerging foldable devices.

### 1.2 Scope

**In scope:**
- Smartphone testing (iOS and Android)
- Tablet testing (iPad and Android tablets)
- Touch interaction validation (tap, swipe, pinch, scroll)
- Responsive breakpoint verification
- Mobile-specific features (hamburger menu, bottom sheets, sticky CTAs)
- Mobile performance (LCP, CLS, INP on 3G/4G)
- Offline behavior and network resilience
- Mobile form input validation
- Camera access (anti-counterfeit QR scan — Phase 2)

**Out of scope:**
- Desktop-only features (mega-menus, hover states)
- CMS admin panel mobile experience (Strapi default)
- Native mobile app testing (not in scope)

### 1.3 Key Statistics

| Metric | Value | Source |
|--------|-------|--------|
| Mobile traffic share target | >= 60% sessions | BRD §20.1 |
| Aisha (Laptop Upgrader) mobile usage | 80% | URD §7.1 |
| Rahul (Gamer) mobile usage | 60% | URD §7.1 |
| Android market share | 55% | URD §7.2 |
| iOS market share | 15% | URD §7.2 |
| Samsung Internet share | 8% | URD §7.2 |

---

## 2. Device Selection Rationale

### 2.1 Selection Criteria

Devices are selected based on:
1. **Market share** in target regions (UAE, India, Bangladesh, Africa, CIS)
2. **Screen size diversity** (small, medium, large phones; tablets)
3. **Performance tiers** (budget, mid-range, flagship)
4. **OS version coverage** (latest 2 versions)
5. **TwinMOS stakeholder device preferences**

### 2.2 Device Tiers

| Tier | Description | Testing Frequency |
|------|-------------|-------------------|
| **Tier 1 (P0)** | Flagship devices with highest market share | Every build + weekly |
| **Tier 2 (P1)** | Popular mid-range devices | Weekly burst |
| **Tier 3 (P2)** | Budget devices, tablets, foldables | Pre-release + monthly |

---

## 3. Device Test Matrix

### 3.1 Smartphones

| Device | OS | Screen Size | Resolution | Tier | Priority | Test Focus |
|--------|-----|-------------|------------|------|----------|------------|
| **iPhone 15 Pro** | iOS 18 | 6.1" | 1179 x 2556 | Tier 1 | P0 | Baseline iOS experience |
| **iPhone 15** | iOS 18 | 6.1" | 1179 x 2556 | Tier 1 | P0 | Standard iOS user |
| **iPhone 14** | iOS 17 | 6.1" | 1170 x 2532 | Tier 1 | P0 | Previous gen iOS |
| **iPhone SE (2022)** | iOS 18 | 4.7" | 750 x 1334 | Tier 2 | P1 | Small screen edge cases |
| **Samsung Galaxy S24** | Android 14 | 6.2" | 1080 x 2340 | Tier 1 | P0 | Baseline Android |
| **Samsung Galaxy S23** | Android 14 | 6.1" | 1080 x 2340 | Tier 1 | P0 | Previous gen Android |
| **Google Pixel 8** | Android 14 | 6.2" | 1080 x 2400 | Tier 1 | P0 | Pure Android reference |
| **Google Pixel 7** | Android 13 | 6.3" | 1080 x 2400 | Tier 2 | P1 | Previous gen Pixel |
| **Xiaomi Redmi Note 13** | Android 13 | 6.67" | 1080 x 2400 | Tier 2 | P1 | Popular in India/Asia |
| **Samsung Galaxy A54** | Android 14 | 6.4" | 1080 x 2340 | Tier 2 | P1 | Mid-range Samsung |
| **iPhone 13 mini** | iOS 17 | 5.4" | 1080 x 2340 | Tier 2 | P1 | Small screen iOS |
| **OnePlus 12** | Android 14 | 6.82" | 1440 x 3168 | Tier 2 | P1 | Large screen Android |
| **Motorola Moto G Power** | Android 13 | 6.5" | 720 x 1600 | Tier 3 | P2 | Budget device, low res |
| **Samsung Galaxy Z Fold 5** | Android 14 | 7.6" unfolded | 1812 x 2176 | Tier 3 | P2 | Foldable — layout stress |
| **Samsung Galaxy Z Flip 5** | Android 14 | 6.7" unfolded | 1080 x 2640 | Tier 3 | P2 | Foldable — cover screen |

### 3.2 Tablets

| Device | OS | Screen Size | Resolution | Tier | Priority | Test Focus |
|--------|-----|-------------|------------|------|----------|------------|
| **iPad Pro 11" (M4)** | iPadOS 18 | 11" | 1668 x 2388 | Tier 2 | P1 | Tablet baseline |
| **iPad Air (M2)** | iPadOS 18 | 10.9" | 1640 x 2360 | Tier 2 | P1 | Popular tablet |
| **iPad (10th gen)** | iPadOS 17 | 10.9" | 1640 x 2360 | Tier 2 | P1 | Budget iPad |
| **Samsung Galaxy Tab S9** | Android 14 | 11" | 1600 x 2560 | Tier 2 | P1 | Android tablet |
| **Samsung Galaxy Tab A9+** | Android 13 | 11" | 1200 x 1920 | Tier 3 | P2 | Budget Android tablet |

### 3.3 Device x Feature Matrix

| Feature | iPhone 15 Pro | iPhone SE | Galaxy S24 | Pixel 8 | iPad Pro | Tab S9 | Fold 5 |
|---------|:-------------:|:---------:|:----------:|:-------:|:--------:|:------:|:------:|
| Homepage hero carousel | A | A | A | A | A | A | A |
| Hamburger navigation | A | A | A | A | M | M | A |
| Product search | A | A | A | A | A | A | A |
| Product image gallery (swipe) | A | A | A | A | A | A | A |
| Product comparison | M | M | M | M | A | A | M |
| Compatibility finder | A | A | A | A | A | A | A |
| Where to Buy (map) | A | A | A | A | A | A | A |
| Contact form | A | A | A | A | A | A | A |
| Newsletter signup | A | A | A | A | A | A | A |
| PDF download | A | A | A | A | A | A | A |
| Language switcher | A | A | A | A | A | A | A |
| RTL layout (P2) | A | A | A | A | A | A | A |
| Partner portal (P2) | A | M | A | A | A | A | A |
| Live chat (P2) | A | A | A | A | A | A | A |
| Warranty form (P2) | A | A | A | A | A | A | A |
| RMA submission (P2) | A | A | A | A | A | A | A |
| Anti-counterfeit scan (P2) | A | A | A | A | M | M | A |
| E-commerce checkout (P3) | A | M | A | A | A | A | A |
| Apple Pay / Google Pay (P3) | A | A | — | — | A | — | — |

**Legend:** A = Automated (Playwright device emulation); M = Manual (BrowserStack real device)

---

## 4. Responsive Breakpoint Validation

### 4.1 Breakpoints (from URD §23.1)

| Name | Range | Target Devices |
|------|-------|---------------|
| **Mobile** | 320px – 767px | Smartphones, small tablets |
| **Tablet** | 768px – 1023px | iPads, large tablets |
| **Desktop** | 1024px – 1439px | Laptops, small desktops |
| **Wide** | 1440px+ | Large monitors, 4K displays |

### 4.2 Breakpoint Test Cases

| Test Case ID | Description | Viewport | Devices |
|--------------|-------------|----------|---------|
| RESP-01 | Verify hamburger menu appears below 768px | 375px, 767px | iPhone SE, iPhone 15 |
| RESP-02 | Verify horizontal nav appears at 1024px+ | 1024px, 1280px | iPad Pro landscape |
| RESP-03 | Verify category grid is 2-col at 375px | 375px | iPhone SE |
| RESP-04 | Verify category grid is 3-col at 768px | 768px | iPad portrait |
| RESP-05 | Verify category grid is 4-col at 1440px+ | 1440px, 1920px | Desktop |
| RESP-06 | Verify product grid is 1-col at 375px | 375px | iPhone SE |
| RESP-07 | Verify product grid is 2-col at 768px | 768px | iPad portrait |
| RESP-08 | Verify product grid is 3-col at 1024px+ | 1024px, 1280px | Desktop |
| RESP-09 | Verify footer stacks vertically at 375px | 375px | iPhone SE |
| RESP-10 | Verify footer is multi-column at 1024px+ | 1024px+ | Desktop |
| RESP-11 | Verify hero carousel is full-width at all breakpoints | 375px–1920px | All |
| RESP-12 | Verify search bar is expandable on mobile | 375px–767px | All phones |
| RESP-13 | Verify sticky CTA is bottom-positioned on mobile | 375px–767px | All phones |
| RESP-14 | Verify map is half-screen on mobile Where to Buy | 375px–767px | All phones |
| RESP-15 | Verify filter panel is bottom sheet on mobile | 375px–767px | All phones |

### 4.3 Playwright Viewport Configuration

```typescript
// playwright.config.ts — viewport projects
{
  name: 'Mobile Small',
  use: { viewport: { width: 375, height: 667 } }, // iPhone SE
},
{
  name: 'Mobile Medium',
  use: { viewport: { width: 390, height: 844 } }, // iPhone 15
},
{
  name: 'Mobile Large',
  use: { viewport: { width: 430, height: 932 } }, // iPhone 15 Pro Max
},
{
  name: 'Tablet Portrait',
  use: { viewport: { width: 768, height: 1024 } }, // iPad
},
{
  name: 'Tablet Landscape',
  use: { viewport: { width: 1024, height: 768 } }, // iPad landscape
},
{
  name: 'Desktop',
  use: { viewport: { width: 1280, height: 720 } },
},
{
  name: 'Wide',
  use: { viewport: { width: 1920, height: 1080 } },
},
```

---

## 5. Touch Interaction Test Cases

### 5.1 Tap Targets

| Test Case ID | Element | Minimum Size | Padding | Test Method |
|--------------|---------|-------------|---------|-------------|
| TOUCH-01 | Primary buttons | 44 x 44px | 12px | Visual inspection + axe-core |
| TOUCH-02 | Secondary buttons | 44 x 44px | 12px | Visual inspection + axe-core |
| TOUCH-03 | Navigation links | 44px height | 16px horizontal | Visual inspection |
| TOUCH-04 | Form inputs | 48px height | 12px horizontal | Visual inspection |
| TOUCH-05 | Checkbox/radio | 20 x 20px visual, 44 x 44px tap | — | Touch test |
| TOUCH-06 | Product cards | Full card clickable | — | Touch test |
| TOUCH-07 | Map pins | 32 x 32px | — | Touch test |
| TOUCH-08 | Carousel dots | 44 x 44px | 8px | Touch test |
| TOUCH-09 | Accordion headers | 48px height | 12px | Touch test |
| TOUCH-10 | Dropdown items | 44px height | 12px horizontal | Touch test |

### 5.2 Gesture Tests

| Test Case ID | Gesture | Element | Expected Behavior |
|--------------|---------|---------|-------------------|
| GEST-01 | Tap | Hamburger menu icon | Menu opens with slide animation |
| GEST-02 | Tap | Menu close button / overlay | Menu closes |
| GEST-03 | Swipe left | Hero carousel | Next slide with fade transition |
| GEST-04 | Swipe right | Hero carousel | Previous slide |
| GEST-05 | Swipe left | Product image gallery | Next image |
| GEST-06 | Swipe right | Product image gallery | Previous image |
| GEST-07 | Pinch zoom | Product image | Image zooms within container |
| GEST-08 | Pinch zoom out | Product image | Returns to normal size |
| GEST-09 | Swipe up | Filter bottom sheet | Sheet expands to full height |
| GEST-10 | Swipe down | Filter bottom sheet | Sheet collapses / closes |
| GEST-11 | Swipe up | Where to Buy map | List view expands |
| GEST-12 | Swipe down | Where to Buy list | Map view expands |
| GEST-13 | Long press | Product image | Context menu (save image, copy) |
| GEST-14 | Double tap | Product image | Quick zoom to tap point |
| GEST-15 | Pull to refresh | Product list | Disabled or shows message |
| GEST-16 | Swipe left | Comparison table | Horizontal scroll |

### 5.3 Scroll Behavior

| Test Case ID | Scenario | Expected Behavior |
|--------------|----------|-------------------|
| SCROLL-01 | Fast scroll on product grid | Smooth 60fps, images lazy-load |
| SCROLL-02 | Scroll to bottom of long page | Footer visible, no layout shift |
| SCROLL-03 | Scroll with sticky header | Header remains fixed, content scrolls |
| SCROLL-04 | Scroll with sticky CTA | CTA remains visible above safe area |
| SCROLL-05 | Scroll-triggered animations | Fire at correct viewport position |
| SCROLL-06 | Infinite scroll (if applicable) | Loads more products smoothly |
| SCROLL-07 | Scroll to anchor link | Smooth scroll to section |
| SCROLL-08 | Scroll with keyboard open | Content adjusts, input remains visible |

---

## 6. Mobile-Specific Feature Tests

### 6.1 Navigation

| Test Case ID | Feature | Test Steps | Expected Result |
|--------------|---------|------------|-----------------|
| NAV-01 | Hamburger menu opens | Tap hamburger icon | Full-screen overlay slides from right |
| NAV-02 | Hamburger menu closes | Tap close or overlay | Menu slides out, content visible |
| NAV-03 | Accordion categories | Tap "Products" in menu | Sub-menu expands with animation |
| NAV-04 | Deep link from menu | Tap "DDR5 Desktop" | Navigates directly, menu closes |
| NAV-05 | Search in header | Tap search icon | Search input expands, keyboard opens |
| NAV-06 | Search dismiss | Tap close or scroll | Search collapses, keyboard closes |
| NAV-07 | Breadcrumb navigation | Tap breadcrumb link | Navigates to parent page |
| NAV-08 | Skip links | Tap "Skip to content" | Focus moves to main content |

### 6.2 Forms

| Test Case ID | Feature | Test Steps | Expected Result |
|--------------|---------|------------|-----------------|
| FORM-01 | Input focus | Tap form field | Field focused, keyboard opens, no zoom |
| FORM-02 | Input types | Tap date/email/tel fields | Correct keyboard type shown |
| FORM-03 | Form validation | Submit empty required field | Inline error appears, field highlighted |
| FORM-04 | Autocomplete | Start typing in address field | Address suggestions appear |
| FORM-05 | File upload | Tap upload button | Native file picker opens |
| FORM-06 | Camera access (P2) | Tap scan QR button | Camera permission request, then preview |

### 6.3 Media

| Test Case ID | Feature | Test Steps | Expected Result |
|--------------|---------|------------|-----------------|
| MEDIA-01 | Hero video (if applicable) | Load homepage | Video autoplays muted, respects data saver |
| MEDIA-02 | Image lazy loading | Scroll product grid | Images load as they enter viewport |
| MEDIA-03 | Image quality | View product image | WebP served, sharp at device pixel ratio |
| MEDIA-04 | PDF download | Tap datasheet button | PDF opens in native viewer or downloads |
| MEDIA-05 | Social share | Tap share button | Native share sheet opens (Web Share API) |

---

## 7. Performance on Mobile Devices

### 7.1 Core Web Vitals — Mobile Targets

| Metric | Target | Maximum | Test Method |
|--------|--------|---------|-------------|
| LCP | < 1.8s | 2.5s | Lighthouse mobile emulation |
| FID | < 50ms | 100ms | Playwright performance API |
| INP | < 150ms | 200ms | Playwright performance API |
| CLS | < 0.05 | 0.1 | Lighthouse mobile emulation |
| TTFB | < 150ms | 300ms | WebPageTest mobile |
| Speed Index | < 2.0s | 3.0s | Lighthouse |

### 7.2 Network Condition Testing

| Condition | Download | Latency | Test Focus |
|-----------|----------|---------|------------|
| Fast 4G | 20 Mbps | 20ms | Full experience |
| Slow 4G | 5 Mbps | 100ms | Compressed images, lazy loading |
| 3G | 1.6 Mbps | 300ms | Graceful degradation |
| Offline | 0 | — | Service worker fallback (P2) |

### 7.3 Playwright Network Throttling

```typescript
// tests/e2e/mobile/performance.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads within budget on slow 4G', async ({ page, context }) => {
  // Emulate slow 4G
  await context.setOffline(false);
  await page.route('**/*', async (route) => {
    await new Promise(r => setTimeout(r, 100)); // 100ms latency
    await route.continue();
  });

  const start = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;

  expect(loadTime).toBeLessThan(3000); // 3s budget on slow 4G
});
```

---

## 8. Real Device Testing Protocol

### 8.1 Pre-Test Setup

1. **Device preparation:**
   - Ensure device is charged > 50%
   - Clear browser cache and cookies
   - Disable battery saver / low power mode
   - Set brightness to 50%
   - Connect to stable WiFi

2. **Browser preparation:**
   - Use default browser for device (Safari on iOS, Chrome on Android)
   - Ensure browser is updated to latest version
   - Disable ad blockers for testing session

3. **Test environment:**
   - Document device model, OS version, browser version
   - Record screen for critical path tests
   - Note network conditions

### 8.2 Test Execution Flow

| Step | Activity | Duration |
|------|----------|----------|
| 1 | Device setup and baseline checks | 5 min |
| 2 | Homepage load and visual inspection | 5 min |
| 3 | Navigation flow (hamburger, search, footer) | 10 min |
| 4 | Product discovery (search, category, detail) | 15 min |
| 5 | Interactive features (compatibility, where to buy) | 15 min |
| 6 | Form submission (contact, newsletter) | 10 min |
| 7 | PDF download and media | 5 min |
| 8 | Performance check (perceived load times) | 5 min |
| 9 | Accessibility quick check (VoiceOver/TalkBack) | 10 min |
| 10 | Defect documentation | 10 min |
| **Total** | | **90 min per device** |

### 8.3 Post-Test

- Upload screen recordings to shared drive
- File defects with device details and reproduction steps
- Update device test log
- Clear test data from device

---

## 9. BrowserStack App Live Schedule

### 9.1 Weekly Real-Device Testing

| Day | Time | Devices | Focus Area |
|-----|------|---------|------------|
| Tuesday | 10:00 | iPhone 15 Pro, iPhone SE | iOS baseline + small screen |
| Tuesday | 14:00 | Galaxy S24, Pixel 8 | Android baseline + pure Android |
| Thursday | 10:00 | iPad Pro, Galaxy Tab S9 | Tablet experience |
| Thursday | 14:00 | Galaxy Z Fold 5, Moto G Power | Foldable + budget stress test |

### 9.2 Monthly Extended Testing

| Week | Focus |
|------|-------|
| Week 1 | New features on Tier 1 devices |
| Week 2 | Regression on Tier 2 devices |
| Week 3 | Accessibility on all devices |
| Week 4 | Performance benchmarking |

---

## 10. Mobile Defect Categories

### 10.1 Category Definitions

| Category | Description | Severity Range |
|----------|-------------|----------------|
| **Layout** | Visual breakage, overlapping elements, overflow | Medium – Critical |
| **Touch** | Unresponsive taps, gesture failures, incorrect targets | High – Critical |
| **Performance** | Slow load, janky scroll, animation drops | Medium – High |
| **Input** | Keyboard issues, form validation, focus problems | Medium – High |
| **Media** | Images not loading, PDF issues, video problems | Medium – High |
| **Navigation** | Menu failures, broken links, routing issues | High – Critical |
| **RTL** | Arabic layout issues on mobile | High – Critical |

### 10.2 Mobile-Specific Severity Rules

| Scenario | Severity | Rationale |
|----------|----------|-----------|
| Sticky CTA covers content on iOS | Critical | Blocks user action |
| Hamburger menu unresponsive | Critical | Blocks navigation |
| Form input zooms on focus | High | Poor UX, disorienting |
| Touch target < 44px | High | WCAG violation, hard to tap |
| Scroll jank on product grid | Medium | Degraded experience |
| Image slightly blurry on budget device | Low | Device limitation |

---

## Appendix A: Device Specifications

### A.1 Reference Dimensions

| Device | Width (px) | Height (px) | DPR | CSS Width |
|--------|-----------|-------------|-----|-----------|
| iPhone SE | 375 | 667 | 2 | 375 |
| iPhone 15 | 390 | 844 | 3 | 390 |
| iPhone 15 Pro | 393 | 852 | 3 | 393 |
| iPhone 15 Pro Max | 430 | 932 | 3 | 430 |
| Galaxy S24 | 360 | 780 | 3 | 360 |
| Galaxy S23 | 360 | 780 | 3 | 360 |
| Pixel 8 | 412 | 915 | 2.625 | 412 |
| Pixel 7 | 412 | 915 | 2.625 | 412 |
| iPad Pro 11" | 834 | 1194 | 2 | 834 |
| iPad (portrait) | 768 | 1024 | 2 | 768 |
| Galaxy Tab S9 | 800 | 1280 | 2 | 800 |

### A.2 Safe Area Insets (iOS)

| Device | Top | Bottom | Left | Right |
|--------|-----|--------|------|-------|
| iPhone 15 Pro (portrait) | 59px | 34px | 0 | 0 |
| iPhone 15 Pro (landscape) | 0 | 21px | 59px | 59px |
| iPhone SE | 0 | 0 | 0 | 0 |

---

**End of Document**
