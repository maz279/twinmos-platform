# Cross-Browser Compatibility Test Matrix

**Document Reference:** TWN-QA-CROSSBROWSER-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P1

## 1. Purpose & Scope

This document defines the cross-browser compatibility test matrix for the TwinMOS corporate website.

### 1.2 Scope

**In scope:**
- All public-facing pages and user journeys
- Partner portal (Phase 2) authentication flows
- E-commerce checkout (Phase 3) payment flows
- RTL (Arabic) rendering across browsers
- Form submission, file upload, and PDF download behaviors

**Out of scope:**
- CMS admin panel (Strapi default UI)
- Internal tools and dashboards
- Browsers with < 0.5% market share

## 2. Browser Support Policy

### 2.1 Support Tiers

| Tier | Browsers | Policy | Testing Frequency |
|------|----------|--------|-------------------|
| **Tier 1 (P0)** | Chrome (Desktop + Mobile), Safari (iOS + macOS) | Full feature parity | Every build + weekly regression |
| **Tier 2 (P1)** | Samsung Internet, Firefox (Desktop + Android) | Functional parity | Weekly burst + pre-release |
| **Tier 3 (P2)** | Edge, Opera, UC Browser | Best-effort support | Pre-release only |

### 2.2 Version Policy

| Browser | Supported Versions | Rationale |
|---------|-------------------|-----------|
| Chrome | Latest 2 major versions | Auto-update; 65% market share |
| Safari (iOS) | Latest 2 iOS versions (iOS 17, 18) | Tied to OS; 18% market share |
| Samsung Internet | Latest 2 versions | 8% share in MEA/Asia |
| Firefox | Latest 2 ESR versions | Privacy-conscious users |
| Edge | Latest 2 versions | Windows default |
| Opera | Latest version | 1% share; notable in CIS regions |
| UC Browser | Latest version | Popular in India/Bangladesh |

## 3. Browser x OS Matrix

### 3.1 Primary Matrix (All Phases)

| Browser | Windows 11 | Windows 10 | macOS Sonoma | macOS Ventura | iOS 18 | iOS 17 | Android 14 | Android 13 |
|---------|:----------:|:----------:|:------------:|:-------------:|:------:|:------:|:----------:|:----------:|
| **Chrome 136** | P0 | P0 | P0 | P1 | — | — | P0 | P1 |
| **Chrome 135** | P1 | P1 | P1 | P2 | — | — | P1 | P2 |
| **Safari 18** | — | — | P0 | P1 | P0 | — | — | — |
| **Safari 17** | — | — | P1 | P2 | — | P0 | — | — |
| **Samsung Internet 27** | — | — | — | — | — | — | P1 | P1 |
| **Firefox 138** | P1 | P1 | P1 | P2 | — | — | P1 | P2 |
| **Edge 136** | P2 | P2 | — | — | — | — | — | — |
| **Opera 118** | P2 | P2 | P2 | P2 | — | — | P2 | P2 |

## 4. Feature x Browser Coverage Matrix

### 4.1 Core Features (Phase 1)

| Feature / Page | Chrome | Safari iOS | Safari macOS | Samsung Int. | Firefox | Edge |
|----------------|:------:|:----------:|:------------:|:------------:|:-------:|:----:|
| Homepage (hero carousel) | A | A | A | A | A | M |
| Product category browsing | A | A | A | A | A | M |
| Product detail (image gallery) | A | A | A | A | A | M |
| Search (MeiliSearch) | A | A | A | A | A | M |
| Compatibility finder | A | A | A | M | A | M |
| Where to Buy (map + list) | A | A | A | M | A | M |
| Contact form submission | A | A | A | A | A | M |
| Newsletter signup | A | A | A | A | A | M |
| Datasheet PDF download | A | A | A | A | A | M |
| Mobile hamburger navigation | — | A | — | A | — | — |
| Cookie banner & consent | A | A | A | A | A | M |

**Legend:** A = Automated (Playwright); M = Manual (BrowserStack)

### 4.2 Phase 2 Features

| Feature / Page | Chrome | Safari iOS | Safari macOS | Samsung Int. | Firefox | Edge |
|----------------|:------:|:----------:|:------------:|:------------:|:-------:|:----:|
| Arabic RTL layout | A | A | A | M | A | M |
| Partner portal login (Better Auth) | A | A | A | M | A | M |
| Live chat (Chatwoot) | A | A | A | M | A | M |
| Warranty registration form | A | A | A | A | A | M |
| RMA submission & tracking | A | A | A | M | A | M |
| Anti-counterfeit serial lookup | A | A | A | M | A | M |

### 4.3 Phase 3 Features

| Feature / Page | Chrome | Safari iOS | Safari macOS | Samsung Int. | Firefox | Edge |
|----------------|:------:|:----------:|:------------:|:------------:|:-------:|:----:|
| E-commerce product listing | A | A | A | M | A | M |
| Shopping cart (Medusa.js) | A | A | A | M | A | M |
| Stripe Checkout | A | A | A | M | A | M |
| Apple Pay / Google Pay | A | A | — | — | — | — |

## 5. Critical Path Scenarios by Browser

| Scenario ID | Description | Browsers Tested |
|-------------|-------------|-----------------|
| CB-01 | Homepage loads, hero carousel auto-plays, navigation works | All Tier 1 + Tier 2 |
| CB-02 | Product search -> result click -> product detail -> datasheet download | All Tier 1 + Tier 2 |
| CB-03 | Compatibility finder: select motherboard -> view compatible RAM | All Tier 1 + Tier 2 |
| CB-04 | Where to Buy: filter by country -> view map pin -> click retailer | All Tier 1 + Tier 2 |
| CB-05 | Contact form: fill all fields -> submit -> success message | All Tier 1 + Tier 2 |
| CB-06 | Mobile: hamburger menu -> navigate -> close menu -> scroll | All mobile browsers |
| CB-07 | Newsletter signup in footer -> submit -> confirmation toast | All Tier 1 + Tier 2 |
| CB-08 | Language switch (P2): EN -> AR -> verify RTL layout | All Tier 1 + Tier 2 |
| CB-09 | Partner portal login (P2): credentials -> dashboard -> logout | All Tier 1 + Tier 2 |
| CB-10 | E-commerce checkout (P3): add to cart -> Stripe -> confirmation | All Tier 1 + Tier 2 |

## 6. BrowserStack Configuration

### 6.1 Account Setup

| Setting | Value |
|---------|-------|
| Plan | BrowserStack Automate Pro (5 parallel sessions) |
| Annual Cost | $1,200 |
| Integration | Playwright + BrowserStack local tunnel |

### 6.4 BrowserStack App Live (Manual Testing)

| Session Type | Duration | Frequency | Testers |
|-------------|----------|-----------|---------|
| Real device burst — iOS | 2 hours | Weekly | QA Lead |
| Real device burst — Android | 2 hours | Weekly | QA Lead |
| Real device burst — Tablets | 1 hour | Bi-weekly | QA Lead |
| Exploratory — Edge/Opera | 1 hour | Pre-release | QA Lead |

## 7. Playwright Cross-Browser Projects

The primary playwright.config.ts already defines 5 projects:
1. Chromium (Desktop)
2. Firefox (Desktop)
3. WebKit (Desktop Safari)
4. Mobile Chrome (Pixel 7)
5. Mobile Safari (iPhone 14)

## 8. Test Execution Schedule

| Day | Time | Activity | Browser Combinations |
|-----|------|----------|---------------------|
| Monday | 09:00 | Automated Tier 1 run | Chrome Win11, Safari iOS, Safari macOS |
| Monday | 10:30 | Automated Tier 2 run | Firefox, Samsung Internet |
| Wednesday | 14:00 | Manual BrowserStack burst — iOS | Safari iOS 18, iOS 17 |
| Wednesday | 16:00 | Manual BrowserStack burst — Android | Chrome Android 14, Samsung Internet |
| Friday | 11:00 | Report review & defect triage | All findings |

## 9. Known Browser Quirks & Workarounds

### Safari (iOS & macOS)
- `100vh` includes dynamic nav bar -> Use `-webkit-fill-available`
- WebP animation not supported -> Use MP4/WebM for animations
- `:focus-visible` support added in 15.4 -> Use `@supports` detection

### Samsung Internet
- Custom video player UI -> Use `playsinline` attribute
- Dark mode forces dark CSS -> Test `prefers-color-scheme` handling

### Firefox
- Strict ETP blocks GA4/GTM -> Expected; Plausible unaffected
- `scrollbar-width` property -> Use `scrollbar-color` for consistency

### Edge
- Sleeping tabs pause JS -> Use `visibilitychange` event to re-hydrate
- Vertical tabs reduce viewport width -> Test at 1080px with vertical tabs

### UC Browser
- Limited ES6+ support -> Babel transpile to ES5
- No WebP support -> JPEG fallback in `<picture>` element

## 10. Defect Triage for Browser Issues

| Severity | Browser Tier | Example | SLA |
|----------|-------------|---------|-----|
| **Critical** | Any | Checkout fails on Safari iOS | Fix in current sprint |
| **High** | Tier 1 | Layout broken on Chrome Android | Fix in current sprint |
| **High** | Tier 2 | Feature unavailable on Samsung Internet | Fix in next sprint |
| **Medium** | Tier 1 | Minor visual glitch on Firefox | Fix in next 2 sprints |
| **Low** | Tier 3 | Cosmetic issue on Opera | Backlog |

---

**End of Document**
