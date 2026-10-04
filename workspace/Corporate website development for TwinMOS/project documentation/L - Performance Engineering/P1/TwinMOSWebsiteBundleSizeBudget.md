# TwinMOS Website — Bundle Size Budget Document

**Document Reference:** TWN-BUNDLE-BUDGET-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation)  
**Audience:** Frontend developers, DevOps engineers  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** Tech Stack §20.3 (Bundle size budget), §22.3 (Performance Optimization Toolkit), BRD §20.1

---

## 1. Executive Summary

This document establishes **bundle size budgets** for the Astro 5 frontend of the TwinMOS corporate website. Bundle size is a critical determinant of JavaScript parse/compile time, which directly impacts **Total Blocking Time (TBT)** and **Interaction to Next Paint (INP)** — especially on mid-range mobile devices prevalent in TwinMOS's key markets (India, Africa).

> **Principle:** The best code is the code you don't ship. Astro's static-first architecture means most pages ship near-zero JavaScript by default. This document ensures we preserve that advantage as interactive islands are added.

---

## 2. Global Bundle Size Budgets

### 2.1 Per-Route Budgets (Gzipped)

| Route Type | Initial JS | Total JS | Initial CSS | Total CSS | Total Resources | Critical Path |
|-----------|-----------|---------|------------|----------|----------------|--------------|
| **Static content** (About, Legal, Learn) | ≤ 25 KB | ≤ 45 KB | ≤ 12 KB | ≤ 25 KB | ≤ 800 KB | HTML + critical CSS |
| **Homepage** | ≤ 45 KB | ≤ 60 KB | ≤ 15 KB | ≤ 35 KB | ≤ 1.2 MB | Hero image + carousel |
| **Product category** | ≤ 40 KB | ≤ 55 KB | ≤ 15 KB | ≤ 30 KB | ≤ 1.0 MB | Filter island + thumbnails |
| **Product detail** | ≤ 50 KB | ≤ 65 KB | ≤ 15 KB | ≤ 40 KB | ≤ 1.4 MB | Gallery + specs + related |
| **Gaming hub** | ≤ 70 KB | ≤ 85 KB | ≤ 18 KB | ≤ 50 KB | ≤ 2.0 MB | RGB visualizer + video |
| **Where to buy** | ≤ 55 KB | ≤ 70 KB | ≤ 15 KB | ≤ 30 KB | ≤ 1.1 MB | Leaflet map + locator |
| **Forms** | ≤ 35 KB | ≤ 50 KB | ≤ 12 KB | ≤ 25 KB | ≤ 700 KB | Validation + submission |
| **Partner portal (P2)** | ≤ 75 KB | ≤ 90 KB | ≤ 15 KB | ≤ 45 KB | ≤ 1.5 MB | Auth + dashboard |
| **E-commerce checkout (P3)** | ≤ 95 KB | ≤ 110 KB | ≤ 18 KB | ≤ 55 KB | ≤ 1.8 MB | Cart + Stripe integration |

### 2.2 Budget Definitions

- **Initial JS:** JavaScript that blocks or delays first paint (synchronous scripts, modulepreload chunks).
- **Total JS:** All JavaScript loaded on the route, including dynamically imported chunks and deferred scripts.
- **Initial CSS:** Critical CSS inlined in `<head>` or loaded synchronously.
- **Total CSS:** All CSS for the route, including deferred stylesheets.
- **Total Resources:** Sum of all network-transferred bytes (HTML, CSS, JS, images, fonts, JSON).

---

## 3. Component-Level Budgets

### 3.1 Astro Islands Budget

| Island | Hydration Directive | Estimated JS Size | Lazy-Load Threshold |
|--------|-------------------|------------------|---------------------|
| `<HeaderNavigation />` | `client:idle` | ~8 KB | Immediate (idle) |
| `<LanguageSelector />` | `client:idle` | ~5 KB | Immediate (idle) |
| `<SearchBar />` | `client:visible` | ~12 KB | Scroll into viewport |
| `<CookieBanner />` | `client:load` | ~6 KB | DOM ready |
| `<ProductFilter />` | `client:visible` | ~15 KB | Scroll into viewport |
| `<ProductCompare />` | `client:visible` | ~10 KB | Scroll into viewport |
| `<CompatibilityFinder />` | `client:visible` | ~18 KB | Scroll into viewport |
| `<WhereToBuyLocator />` | `client:visible` | ~42 KB* | Scroll into viewport |
| `<ContactForm />` | `client:visible` | ~14 KB | Scroll into viewport |
| `<NewsletterSignup />` | `client:idle` | ~6 KB | Immediate (idle) |
| `<WarrantyRegistration />` | `client:visible` | ~12 KB | Scroll into viewport |
| `<RMARequest />` | `client:visible` | ~14 KB | Scroll into viewport |
| `<SerialNumberCheck />` | `client:visible` | ~8 KB | Scroll into viewport |
| `<RGBVisualizer />` | `client:visible` | ~35 KB | Scroll into viewport |
| `<BuildSubmission />` | `client:visible` | ~16 KB | Scroll into viewport |
| `<ChatwootWidget />` | `client:visible` | ~50 KB** | Footer area visible |
| `<CartBadge />` | Server Island | ~3 KB | Runtime |
| `<CheckoutFlow />` | `client:load` | ~65 KB | DOM ready |

\* Includes Leaflet library (42 KB).  
\*\* Includes Chatwoot widget script (loaded from external source).

### 3.2 Third-Party Library Budgets

| Library | Size (min+gz) | Loading Strategy | Route Restriction |
|---------|--------------|-----------------|-------------------|
| **Astro runtime** | ~12 KB | Framework (automatic) | All |
| **React 19** | ~25 KB | Framework (islands only) | Islands routes |
| **React DOM 19** | ~35 KB | Framework (islands only) | Islands routes |
| **Tailwind CSS** | ~0 KB (purge at build) | Build-time | All |
| **Leaflet** | 42 KB | Dynamic import | `/where-to-buy/` only |
| **MapLibre (P2 opt)** | 290 KB | Dynamic import | `/where-to-buy/` only (decision gate) |
| **Framer Motion** | ~25 KB | Dynamic import | Gaming hub only |
| **Day.js** | ~6 KB | Static import | All (localized dates) |
| **Zod** | ~12 KB | Static import | Form routes |
| **React Hook Form** | ~18 KB | Dynamic import | Form routes |
| **Sentry SDK** | ~25 KB | `defer` | All |
| **GA4 + GTM** | ~45 KB | Partytown / `defer` | All (consent-gated) |
| **Meta Pixel** | ~25 KB | `defer` | All (consent-gated) |
| **LinkedIn Insight** | ~15 KB | `defer` | All (consent-gated) |
| **Stripe.js (P3)** | ~80 KB | Dynamic import | `/checkout/` only |

### 3.3 Library Addition Rules

1. **Any new dependency > 10 KB gzipped** requires Technical Lead approval and ADR.
2. **Any new dependency > 25 KB gzipped** requires Marketing Director sign-off and offsetting optimization.
3. **Prefer native APIs over libraries:**
   - Use native `fetch()` instead of axios (~13 KB saved).
   - Use native `Intl.DateTimeFormat` instead of heavy date libraries where possible.
   - Use native `IntersectionObserver` instead of scroll libraries.
4. **Audit quarterly:** Run `npm audit` + bundle analysis; remove unused dependencies.

---

## 4. Build-Time Bundle Analysis

### 4.1 Tools & Configuration

| Tool | Purpose | Integration |
|------|---------|-------------|
| **`rollup-plugin-visualizer`** | Generate interactive bundle treemap | `astro build` post-step |
| **`bundlesize`** | CI gate for specific file sizes | GitHub Actions |
| **Lighthouse CI** | Performance score gate (includes TBT) | GitHub Actions |
| **webpack-bundle-analyzer** (if needed) | Deep dive into chunk composition | Manual analysis |

### 4.2 Visualizer Output

After every build, the following artifacts are generated in `/dist/analysis/`:

```
dist/analysis/
├── stats.html          # Interactive treemap
├── bundle-size.json    # Machine-readable size report
└── budget-report.json  # Pass/fail per route
```

### 4.3 CI Bundle Check Script

```bash
#!/bin/bash
# scripts/check-bundle-size.sh

set -e

BUDGET_INITIAL_JS=45000      # 45 KB
BUDGET_TOTAL_JS=110000       # 110 KB
BUDGET_INITIAL_CSS=20000     # 20 KB
BUDGET_TOTAL_CSS=55000       # 55 KB

echo "🔍 Checking bundle sizes against budget..."

# Parse astro build output or use bundlesize config
# Fail CI if any budget exceeded

npx bundlesize --config bundlesize.config.json

echo "✅ All bundle sizes within budget."
```

### 4.4 Bundlesize Configuration

```json
{
  "files": [
    {
      "path": "./dist/**/*.html",
      "maxSize": "50 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/_astro/*.js",
      "maxSize": "110 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/_astro/*.css",
      "maxSize": "55 kB",
      "compression": "gzip"
    }
  ]
}
```

---

## 5. Code Splitting Strategy

### 5.1 Route-Based Splitting

Astro 5 automatically code-splits by route. Each page gets only the JS/CSS it needs.

### 5.2 Component-Based Dynamic Imports

For heavy interactive components, use dynamic imports:

```astro
---
// ProductDetail.astro
---

<!-- Static content rendered at build time -->
<h1>{product.name}</h1>
<img src={product.heroImage} alt={product.name} />

<!-- Heavy island loaded only when visible -->
<CompatibilityFinder client:visible>
  <script>
    // CompatibilityFinder is dynamically imported
    // Only fetched when user scrolls to this section
  </script>
</CompatibilityFinder>
```

```typescript
// src/components/CompatibilityFinder.tsx
import { lazy, Suspense } from 'react';

// Dynamically import the heavy compatibility matching logic
const CompatibilityEngine = lazy(() => import('./CompatibilityEngine'));

export default function CompatibilityFinder() {
  return (
    <Suspense fallback={<CompatibilitySkeleton />}>
      <CompatibilityEngine />
    </Suspense>
  );
}
```

### 5.3 Library Splitting

| Library | Split Strategy | Chunk Name |
|---------|---------------|-----------|
| **Leaflet / MapLibre** | Dynamic import in locator island | `map-chunk.js` |
| **Framer Motion** | Dynamic import in gaming components | `animation-chunk.js` |
| **React Hook Form + Zod** | Dynamic import in form islands | `form-chunk.js` |
| **Chart.js (if needed P3)** | Dynamic import in analytics dashboard | `chart-chunk.js` |
| **Stripe.js** | Dynamic import on checkout page | `stripe-chunk.js` |

---

## 6. Tree Shaking & Dead Code Elimination

### 6.1 Vite Default Behavior

Astro 5 uses Vite, which provides excellent tree shaking out of the box. Ensure:

1. **ESM imports only:** No `require()` statements.
2. **`sideEffects: false`** in `package.json` for the frontend repo.
3. **Named imports:** `import { useState } from 'react'` not `import React from 'react'`.
4. **No barrel files with side effects:** Avoid `index.ts` that imports everything.

### 6.2 Manual Tree Shaking Checks

| Check | Tool | Frequency |
|-------|------|-----------|
| Unused exports | `ts-unused-exports` | Weekly |
| Duplicate dependencies | `depcheck` | Weekly |
| Large dependencies | `npm-bundle-analyzer` | Monthly |
| Import cost (IDE) | VSCode Import Cost extension | Continuous |

---

## 7. Third-Party Script Budget

### 7.1 Third-Party Impact Assessment

| Script | Size | Impact on TBT | Mitigation |
|--------|------|--------------|------------|
| GA4 + GTM | ~45 KB | Medium | Partytown (offload to web worker) |
| Meta Pixel | ~25 KB | Low | `defer`, consent-gated |
| LinkedIn Insight | ~15 KB | Low | `defer`, consent-gated |
| Sentry | ~25 KB | Low | `defer`, lazy SDK init |
| Chatwoot (P2) | ~50 KB | Medium | Lazy-load on footer visibility |
| PostHog (P3) | ~40 KB | Medium | `defer`, sampled at 10% |
| Stripe (P3) | ~80 KB | High (on checkout) | Load only on `/checkout/*` |

### 7.2 Partytown Configuration

```ts
// astro.config.ts
import partytown from '@astrojs/partytown';

export default defineConfig({
  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push', 'gtag', 'fbq', 'lintrk'],
        resolveUrl: (url) => {
          // Proxy analytics through same origin to avoid ad-blockers
          if (url.hostname === 'www.google-analytics.com') {
            return new URL('/proxy/ga', 'https://twinmos.com');
          }
          return url;
        },
      },
    }),
  ],
});
```

### 7.3 Third-Party Budget Rule

> **Total third-party JavaScript must not exceed 60 KB gzipped on any page (except checkout, where Stripe is exempted).**

If marketing requires additional tracking scripts, they must:
1. Replace an existing script (one in, one out), OR
2. Be loaded via GTM with trigger conditions (not global), OR
3. Offset with JS optimization elsewhere.

---

## 8. Budget Enforcement & Monitoring

### 8.1 CI Gates

| Gate | Condition | Action |
|------|-----------|--------|
| **Bundle size** | Any route exceeds budget | ❌ Block merge |
| **New dependency** | > 10 KB without approval | ⚠️ Yellow flag; TL review |
| **Third-party addition** | Any new script added | ⚠️ Security + performance review |
| **Lighthouse TBT** | > 300 ms | ❌ Block merge |
| **Visualizer diff** | Unexpected chunk growth > 20% | ⚠️ Investigation required |

### 8.2 Production Monitoring

| Metric | Tool | Alert Threshold |
|--------|------|----------------|
| JS download size (RUM) | Sentry | > 120 KB avg per page |
| TBT | Lighthouse CI weekly | > 300 ms |
| INP | Sentry RUM | > 200 ms (75th percentile) |
| Long tasks > 50 ms | Sentry RUM | > 10 per session |

### 8.3 Quarterly Bundle Audit

Every quarter, the engineering team conducts a bundle audit:

1. Run `rollup-plugin-visualizer` on production build.
2. Identify largest chunks and dependencies.
3. Review if any dependencies can be replaced with lighter alternatives.
4. Check for duplicate dependencies across chunks.
5. Update this document with any budget revisions.

---

## 9. Exception Handling

### 9.1 Pre-Approved Exceptions

| Exception | Size | Justification | Compensating Optimization |
|-----------|------|--------------|--------------------------|
| MapLibre upgrade (P2) | 290 KB vs 42 KB | Vector tile quality | Lazy-load only; Cloudflare cache tiles |
| Stripe.js (P3) | 80 KB | PCI compliance | Route-restricted; dynamic import |
| PostHog (P3) | 40 KB | Session replay | 10% sampling; consent-gated |

### 9.2 Exception Process

1. Developer documents need in ADR (`/docs/adr/NNN-bundle-exception.md`).
2. Proposes offsetting optimization (e.g., "We add 30 KB for X, but save 35 KB by replacing Y with Z").
3. Technical Lead reviews and approves.
4. Marketing Director informed if user-facing impact.
5. Budget document updated.
6. Monitoring alert added for 2 weeks post-deployment.

---

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final with CI gates |

---

## 11. References

- Tech Stack §20.3 — Quality Gates (Bundle size budget)
- Tech Stack §22.3 — Performance Optimization Toolkit (Code splitting, Tree shaking)
- BRD §20.1 — Performance Requirements (TBT, INP)
- `TwinMOSWebsitePerformance_Budget.md`
- `TwinMOSWebsiteThirdPartyScript_Audit.md`
