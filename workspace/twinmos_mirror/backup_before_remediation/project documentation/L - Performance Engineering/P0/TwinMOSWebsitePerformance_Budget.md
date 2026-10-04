# TwinMOS Website — Performance Budget Document

**Document Reference:** TWN-PERF-BUDGET-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation)  
**Audience:** Frontend developers, QA engineers, DevOps, Marketing stakeholders  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** BRD §20, Tech Stack §22, RFP §6.2 / §10.2, URD §32

---

## 1. Executive Summary

This document establishes the **authoritative performance budget** for the TwinMOS corporate website (twinmos.com) redevelopment project. It translates the BRD §20 performance requirements, Tech Stack §22 quality gates, and RFP §10.2 Core Web Vitals targets into concrete, measurable resource limits that are enforced in CI/CD and monitored in production.

A performance budget is a set of limits imposed on metrics that affect site performance. These limits are treated as **non-negotiable quality gates** — a pull request that causes a budget overrun cannot merge to `main` without explicit approval from the Technical Lead and documented remediation plans.

### 1.1 Why Performance Budgets Matter for TwinMOS

| Business Driver | Performance Impact |
|----------------|-------------------|
| **Competitive parity with Kingston, Corsair, ADATA** | Tier-1 memory brand websites consistently hit Lighthouse 90+; sub-par performance signals sub-par engineering |
| **India market entry (Supertron partnership)** | Indian mobile users often experience 3G/4G variability; performance directly affects conversion |
| **Distributor recruitment** | Enterprise buyers and distributors evaluate vendor websites as proxy for operational maturity |
| **SEO ranking** | Google uses Core Web Vitals as ranking signals; poor performance = reduced organic visibility |
| **Gaming hub (VOLTX)** | Rich media must not compromise load times; gamers expect instant response |

### 1.2 Budget Philosophy

> **"Performance is a feature, not an optimization."**

- **Budgets are cumulative** — the sum of all resources on a page must stay within limits.
- **Budgets are per-page-type** — homepage has stricter limits than a long-form article.
- **Budgets are phase-aware** — Phase 1 has the strictest baseline; Phase 2/3 additions must not regress.
- **Budgets are user-centric** — targets are derived from real-world device and network conditions (India Tier 2/3, Africa 3G/4G).

---

## 2. Page-Type Performance Budgets

### 2.1 Budget Matrix

| Page Type | Lighthouse Performance | Lighthouse Accessibility | Lighthouse Best Practices | Lighthouse SEO | Total Page Weight | JS Bundle (Initial) | CSS (Critical + Deferred) | Images (Above Fold) | Third-Party Scripts |
|-----------|----------------------|------------------------|------------------------|--------------|------------------|-------------------|--------------------------|-------------------|-------------------|
| **Homepage** | ≥ 95 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 1.2 MB | ≤ 60 KB | ≤ 18 KB critical + ≤ 35 KB deferred | ≤ 350 KB | ≤ 45 KB |
| **Product Category** | ≥ 92 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 1.0 MB | ≤ 55 KB | ≤ 18 KB critical + ≤ 30 KB deferred | ≤ 250 KB | ≤ 45 KB |
| **Product Detail Page (PDP)** | ≥ 93 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 1.4 MB | ≤ 65 KB | ≤ 18 KB critical + ≤ 40 KB deferred | ≤ 450 KB | ≤ 45 KB |
| **Content Page (About, Learn, Tech)** | ≥ 96 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 800 KB | ≤ 45 KB | ≤ 15 KB critical + ≤ 25 KB deferred | ≤ 200 KB | ≤ 30 KB |
| **Gaming Hub** | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 2.0 MB | ≤ 85 KB | ≤ 20 KB critical + ≤ 50 KB deferred | ≤ 600 KB | ≤ 60 KB |
| **Where to Buy / Locator** | ≥ 92 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 1.1 MB | ≤ 70 KB* | ≤ 18 KB critical + ≤ 30 KB deferred | ≤ 150 KB | ≤ 55 KB |
| **Forms (Contact, Warranty, RMA)** | ≥ 94 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 700 KB | ≤ 50 KB | ≤ 15 KB critical + ≤ 25 KB deferred | ≤ 100 KB | ≤ 40 KB |
| **Partner Portal (P2)** | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 1.5 MB | ≤ 90 KB | ≤ 18 KB critical + ≤ 45 KB deferred | ≤ 300 KB | ≤ 50 KB |
| **E-Commerce (P3)** | ≥ 88 | ≥ 95 | ≥ 95 | ≥ 95 | ≤ 1.8 MB | ≤ 110 KB | ≤ 20 KB critical + ≤ 55 KB deferred | ≤ 400 KB | ≤ 70 KB |

\* Includes Leaflet (42 KB) or MapLibre (290 KB in P2) map library.

### 2.2 Budget Rationale by Page Type

#### Homepage
- Most visited page; primary brand impression.
- Hero carousel + category grid + trust bar + news teaser.
- Images are the dominant weight; JS is minimal (Astro static-first).

#### Product Detail Page
- Hero image (1200×1200 PNG source → WebP/AVIF optimized).
- Image gallery with 3–5 thumbnails.
- Compatibility finder island (lazy-loaded).
- Datasheet PDF link (not loaded until clicked).

#### Gaming Hub
- Intentionally higher budget due to RGB visualizer, video assets, and immersive dark theme.
- Still must hit ≥ 90 Lighthouse; rich media must be progressively enhanced.
- Videos use `loading="lazy"` + privacy-enhanced YouTube embeds.

#### Where to Buy
- Map library (Leaflet 42 KB) is the largest JS dependency.
- Retailer list is text-heavy; images are minimal.
- Geolocation API call is non-blocking.

---

## 3. Core Web Vitals Budgets

### 3.1 Universal Targets (All Pages)

| Metric | Target (75th percentile) | Maximum Acceptable | Budget Owner | Measurement |
|--------|-------------------------|-------------------|--------------|-------------|
| **First Contentful Paint (FCP)** | < 1.0 s | 1.5 s | Frontend | Lighthouse + CrUX |
| **Largest Contentful Paint (LCP)** | < 1.8 s | 2.5 s | Frontend | Lighthouse + CrUX |
| **Interaction to Next Paint (INP)** | < 150 ms | 200 ms | Frontend | CrUX + Sentry RUM |
| **Cumulative Layout Shift (CLS)** | < 0.05 | 0.1 | Frontend | Lighthouse + CrUX |
| **Time to First Byte (TTFB)** | < 150 ms | 300 ms | DevOps | WebPageTest + Sentry |
| **Total Blocking Time (TBT)** | < 150 ms | 300 ms | Frontend | Lighthouse |
| **First Input Delay (FID)** | < 50 ms | 100 ms | Frontend | CrUX (legacy) |
| **Speed Index** | < 2.0 s | 3.0 s | Frontend | Lighthouse |

### 3.2 Per-Page-Type LCP Budgets

| Page Type | LCP Element | Max LCP Weight | Preload Strategy |
|-----------|------------|---------------|-----------------|
| Homepage | Hero image / carousel first slide | ≤ 150 KB WebP/AVIF | `<link rel="preload">` + `fetchpriority="high"` |
| Category | Category hero + first product thumbnail | ≤ 120 KB | Preload hero; lazy-load grid |
| PDP | Product hero image | ≤ 180 KB | Preload hero; `fetchpriority="high"` |
| Content | Featured image / first heading | ≤ 100 KB | Preload if image is LCP |
| Gaming Hub | Hero video poster / RGB showcase | ≤ 200 KB | Preload poster; defer video |
| Where to Buy | Map container (not an image) | N/A | Preconnect to OSM tile server |
| Forms | Form heading (text LCP) | N/A | Inline critical CSS; no image preload needed |

---

## 4. Resource-Specific Budgets

### 4.1 JavaScript Budgets

| Budget Category | Limit | Enforcement |
|----------------|-------|-------------|
| **Initial JS (render-blocking)** | ≤ 45 KB gzipped | `rollup-plugin-visualizer` in CI |
| **Total JS per route (all chunks)** | ≤ 110 KB gzipped | Lighthouse CI + custom bundle check |
| **Third-party JS** | ≤ 60 KB gzipped | Manual audit + `lighthouse-ci` |
| **Astro framework runtime** | ≤ 25 KB gzipped | Astro build output analysis |
| **React islands (hydrated)** | ≤ 35 KB gzipped | `client:visible` preferred over `client:load` |
| **Map library (Leaflet / MapLibre)** | 42 KB / 290 KB | Lazy-load on island visibility only |

**JS Budget Rules:**
1. Every route must declare its expected JS weight in ADR comments.
2. Adding a new npm dependency > 10 KB requires Technical Lead approval.
3. `dynamic import()` must be used for any island > 15 KB.
4. Analytics scripts (GA4, GTM, Meta Pixel, LinkedIn) are loaded via GTM after consent; they do not count toward initial JS budget but do count toward total page weight.

### 4.2 CSS Budgets

| Budget Category | Limit | Enforcement |
|----------------|-------|-------------|
| **Critical CSS (above-fold)** | ≤ 20 KB | Critical CSS extraction tool |
| **Deferred CSS (below-fold)** | ≤ 55 KB | Total CSS budget check in CI |
| **Tailwind generated CSS** | ≤ 45 KB | PurgeCSS + Tailwind content config |
| **Print styles** | ≤ 5 KB | Separate `print.css` file |
| **RTL overrides (Arabic)** | ≤ 8 KB | `rtl:` modifiers only; no duplicate rules |

**CSS Budget Rules:**
1. Critical CSS is inlined in `<head>`; deferred CSS is loaded via `rel="preload"` with `onload="this.rel='stylesheet'"`.
2. No `@import` in CSS; all imports resolved at build time.
3. Unused CSS must be < 5% of total CSS per route (PurifyCSS check).

### 4.3 Image Budgets

| Budget Category | Limit | Notes |
|----------------|-------|-------|
| **Total image weight per page** | ≤ 600 KB (gaming) / ≤ 450 KB (PDP) / ≤ 200 KB (content) | See §2.1 |
| **Single hero image** | ≤ 200 KB | WebP/AVIF at quality 75–85 |
| **Product thumbnail** | ≤ 30 KB | 400×400 WebP |
| **Gallery image** | ≤ 80 KB | 800×800 WebP |
| **OG image (social)** | ≤ 120 KB | 1200×630 JPEG/PNG |
| **Icon / SVG** | ≤ 5 KB each | SVG sprite sheet preferred |
| **360° product view frame** | ≤ 50 KB | WebP/MP4 low-bitrate |

**Image Budget Rules:**
1. All images must have explicit `width` and `height` attributes.
2. All images must use `srcset` for responsive sizing.
3. LCP image must use `fetchpriority="high"` and `loading="eager"`.
4. Below-fold images must use `loading="lazy"`.
5. AVIF is preferred; WebP is fallback; JPEG is legacy fallback.

### 4.4 Font Budgets

| Budget Category | Limit | Notes |
|----------------|-------|-------|
| **Total font weight per page** | ≤ 120 KB | All font subsets combined |
| **Latin subset (Noto Sans)** | ≤ 35 KB | `unicode-range: U+0000-00FF` |
| **Arabic subset** | ≤ 35 KB | Loaded only for `/ar/*` routes |
| **Bengali subset** | ≤ 30 KB | Loaded only for `/bn/*` routes |
| **Devanagari subset** | ≤ 30 KB | Loaded only for `/hi/*` routes |
| **Cyrillic subset (P3)** | ≤ 25 KB | Loaded only for `/ru/*` routes |
| **CJK subset (P3)** | ≤ 40 KB | Loaded only for `/zh-CN/*` routes |

See `TwinMOSWebsiteFontLoadingStrategy.md` for detailed font loading rules.

### 4.5 Third-Party Script Budgets

| Script Category | Weight | Loading Strategy | Phase |
|----------------|--------|-----------------|-------|
| **Google Analytics 4 + GTM** | ~45 KB | Consent-gated via GTM; `defer` | P1 |
| **Meta Pixel** | ~25 KB | Consent-gated; `defer` | P1 |
| **LinkedIn Insight Tag** | ~15 KB | Consent-gated; `defer` | P1 |
| **Sentry SDK** | ~25 KB | `defer`; loaded from `cdn.sentry.io` | P1 |
| **Plausible** | ~1 KB | Inline script; no cookie | P1 |
| **Cloudflare Turnstile** | ~30 KB | Loaded only on form pages | P1 |
| **Chatwoot widget** | ~50 KB | Lazy-load on footer visibility | P2 |
| **PostHog (P3)** | ~40 KB | Consent-gated; `defer` | P3 |
| **Stripe.js (P3)** | ~80 KB | Loaded only on checkout pages | P3 |

**Third-Party Rules:**
1. All third-party scripts must be loaded via Partytown (`@astrojs/partytown`) where possible.
2. Analytics scripts must not block render.
3. Marketing pixels must not fire until after `DOMContentLoaded`.
4. Every third-party script must have a documented fallback (graceful degradation if the service is down).

---

## 5. API Performance Budgets

| Endpoint | Target Response Time | Maximum | Budget Owner |
|----------|---------------------|---------|--------------|
| Product List (paginated) | < 200 ms | 500 ms | Backend |
| Product Detail | < 150 ms | 300 ms | Backend |
| Compatibility Search | < 300 ms | 800 ms | Backend |
| Retailer Locator | < 250 ms | 500 ms | Backend |
| MeiliSearch Search | < 100 ms | 200 ms | Backend |
| Form Submission | < 500 ms | 1 s | Backend |
| CMS Admin Load | < 1 s | 2 s | Backend |
| Strapi REST API (general) | < 200 ms | 400 ms | Backend |

**API Budget Rules:**
1. All API endpoints must return `Server-Timing` headers for debugging.
2. Responses > 200 ms must be flagged in Sentry performance monitoring.
3. Phase 2 adds Redis caching for hot endpoints (Implementation Strategy v3.0 §12.2).
4. Database query time must be < 50 ms for 95th percentile.

---

## 6. CI/CD Enforcement

### 6.1 Lighthouse CI Configuration

```json
{
  "ci": {
    "collect": {
      "url": ["/", "/products/", "/products/voltx-ddr5/", "/support/", "/gaming/"],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "chromeFlags": "--no-sandbox --headless"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 110000 }],
        "resource-summary:image:size": ["error", { "maxNumericValue": 600000 }]
      }
    }
  }
}
```

### 6.2 Bundle Size Check Script

```bash
# scripts/check-bundle-size.sh
MAX_INITIAL_JS=45000  # 45 KB
MAX_TOTAL_JS=110000   # 110 KB
MAX_CSS=55000         # 55 KB

# Run after astro build
# Fail CI if any route exceeds budget
```

### 6.3 Performance Regression Gate

| Condition | Action |
|-----------|--------|
| Lighthouse score drops > 3 points vs `main` | Block merge; require remediation plan |
| Bundle size increases > 5 KB | Yellow flag; Technical Lead review required |
| New third-party script added | Security + performance review required |
| LCP regression > 200 ms | Block merge |
| CLS regression > 0.05 | Block merge |

---

## 7. Monitoring & Alerting

### 7.1 Real User Monitoring (RUM) Budgets

| Metric | Alert Threshold | PagerDuty Severity |
|--------|----------------|-------------------|
| LCP > 2.5 s (75th percentile) | Warning | P3 |
| LCP > 4.0 s (75th percentile) | Critical | P2 |
| INP > 200 ms (75th percentile) | Warning | P3 |
| INP > 500 ms (75th percentile) | Critical | P2 |
| CLS > 0.1 (75th percentile) | Warning | P3 |
| TTFB > 300 ms (95th percentile) | Critical | P2 |
| Total page weight > 2 MB | Warning | P3 |

### 7.2 Tools

| Tool | Purpose | Phase |
|------|---------|-------|
| **Lighthouse CI** | PR-level performance gates | P1 |
| **Sentry Performance + RUM** | Real-user Core Web Vitals tracking | P1 |
| **Plausible** | Page-level load time trends | P1 |
| **WebPageTest** | Synthetic multi-region testing | P1 |
| **Google Search Console (CrUX)** | Field data validation | P1 |
| **Calibre / SpeedCurve** | Budget dashboards (optional P2) | P2 |

---

## 8. Exception Handling

### 8.1 When a Budget Must Be Exceeded

In rare cases (e.g., Phase 3 e-commerce requiring Stripe.js), a budget may need adjustment:

1. **Document the justification** in an ADR (`/docs/adr/`).
2. **Propose offsetting optimizations** (e.g., reduce image weight by 50 KB to compensate for 50 KB of JS).
3. **Get sign-off** from Technical Lead + Marketing Director.
4. **Update this document** with revised budget and rationale.
5. **Monitor closely** for 2 weeks post-deployment.

### 8.2 Pre-Approved Exceptions

| Exception | Rationale | Compensating Optimization |
|-----------|-----------|--------------------------|
| MapLibre upgrade (P2) | 290 KB vs 42 KB Leaflet | Aggressive Cloudflare edge caching; map loads on scroll |
| Stripe.js (P3 checkout) | 80 KB required for PCI compliance | Loaded only on `/checkout/*`; deferred until cart interaction |
| PostHog OSS (P3) | 40 KB for session replay | Consent-gated; sampled at 10% |

---

## 9. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft based on BRD §20 + Tech Stack §22 |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final budget with CI gates and monitoring |

---

## 10. References

- BRD §20 — Performance Requirements
- Tech Stack §22 — Performance Engineering & Quality Gates
- RFP §6.2 / §10.2 — Technical Requirements / Core Web Vitals Targets
- URD §32 — Performance from User Perspective
- `TwinMOSWebsiteCoreWebVitals_Strategy.md`
- `TwinMOSWebsiteBundleSizeBudget.md`
- `TwinMOSWebsiteImageOptimizationSpec.md`
