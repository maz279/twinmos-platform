# TwinMOS Website — Core Web Vitals Strategy

**Document Reference:** TWN-CWV-STRAT-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation)  
**Audience:** Frontend developers, QA engineers, SEO team, Marketing stakeholders  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** BRD §20.1, Tech Stack §22.1, RFP §10.2, URD §32.1

---

## 1. Executive Summary

This document defines the **comprehensive strategy for achieving and maintaining Google Core Web Vitals (CWV) excellence** across the TwinMOS corporate website. It covers:

- Understanding each CWV metric in the TwinMOS context
- Target thresholds (stricter than Google's "Good" baseline)
- Per-metric optimization tactics mapped to the Astro 5 + Strapi v5 stack
- Measurement methodology (lab vs. field data)
- Continuous improvement processes

> **Strategic Goal:** Every page on twinmos.com must achieve **"Good" ratings for all three CWV metrics (LCP, INP, CLS)** at the 75th percentile of real users, with aspirational targets that match or exceed tier-1 competitor performance (Kingston, Corsair, ADATA).

---

## 2. Core Web Vitals Overview

### 2.1 The Three Core Metrics

| Metric | What It Measures | Google "Good" Threshold | **TwinMOS Target** | **TwinMOS Max Acceptable** |
|--------|-----------------|------------------------|-------------------|---------------------------|
| **LCP (Largest Contentful Paint)** | Loading performance — time until largest visible element renders | ≤ 2.5 s | **≤ 1.8 s** | 2.5 s |
| **INP (Interaction to Next Paint)** | Interactivity — responsiveness to user input | ≤ 200 ms | **≤ 150 ms** | 200 ms |
| **CLS (Cumulative Layout Shift)** | Visual stability — unexpected layout shifts | ≤ 0.1 | **≤ 0.05** | 0.1 |

### 2.2 Supporting Metrics (Non-CWV but Critical)

| Metric | Description | TwinMOS Target | Max Acceptable |
|--------|-------------|---------------|----------------|
| **FCP (First Contentful Paint)** | Time until first text/image renders | < 1.0 s | 1.5 s |
| **TTFB (Time to First Byte)** | Server response time | < 150 ms | 300 ms |
| **TBT (Total Blocking Time)** | Main thread blocked duration | < 150 ms | 300 ms |
| **FID (First Input Delay)** | Legacy interactivity metric (replaced by INP) | < 50 ms | 100 ms |
| **Speed Index** | How quickly above-fold content populates | < 2.0 s | 3.0 s |

### 2.3 Why TwinMOS Targets Are Stricter Than Google's

| Reason | Explanation |
|--------|-------------|
| **Competitive benchmarking** | Kingston.com and Corsair.com consistently hit LCP < 1.5s on desktop; TwinMOS must match |
| **Emerging market users** | India and African users often experience slower networks and mid-range devices |
| **Mobile-first traffic** | BRD projects ≥ 60% mobile sessions; mobile CWV thresholds are harder to meet |
| **Gaming audience expectations** | Gamers (VOLTX target persona) have low tolerance for sluggish interfaces |
| **SEO advantage** | Stricter targets provide buffer against field data variability |

---

## 3. LCP (Largest Contentful Paint) Strategy

### 3.1 What Counts as LCP on TwinMOS Pages

| Page Type | Typical LCP Element | Optimization Priority |
|-----------|-------------------|----------------------|
| Homepage | Hero carousel first slide image | Critical |
| Product Category | Category hero image or first product thumbnail | Critical |
| Product Detail | Product hero image (1200×1200 optimized) | Critical |
| Content pages | Featured image or H1 text block | High |
| Gaming Hub | Hero video poster image or RGB showcase | Critical |
| Where to Buy | Map container (text-based LCP) | Medium |
| Forms | H1 heading (text LCP; no image) | Low |

### 3.2 LCP Optimization Tactics

#### 3.2.1 Server-Side Optimizations

| Tactic | Implementation | Expected Impact |
|--------|---------------|----------------|
| **Static Site Generation (SSG)** | Astro 5 `output: 'static'` for 287 content pages | TTFB → 0 ms for static pages |
| **Incremental Static Regeneration (ISR)** | Cloudflare Workers cache + Strapi webhooks for news/events/SKU pages | TTFB < 100 ms for dynamic content |
| **Edge deployment** | Cloudflare Pages serves content from 300+ global PoPs | TTFB < 150 ms worldwide |
| **HTTP/3 + QUIC** | Cloudflare default protocol | Faster handshake, reduced latency |
| **Brotli compression** | Cloudflare + Coolify backend | 15–25% smaller than gzip |

#### 3.2.2 Resource Loading Optimizations

| Tactic | Implementation | Expected Impact |
|--------|---------------|----------------|
| **Preload LCP image** | `<link rel="preload" as="image" href="hero.webp" fetchpriority="high">` | Discover LCP image 200–500 ms earlier |
| **Fetch Priority** | `fetchpriority="high"` on LCP image; `fetchpriority="low"` on below-fold | Browser prioritizes critical resources |
| **Responsive images** | `<img srcset>` with density descriptors | Right-sized image for device |
| **Modern formats** | AVIF primary, WebP fallback, JPEG legacy | 30–50% smaller than JPEG |
| **ImgProxy runtime transforms** | Self-hosted ImgProxy on-demand resize/crop | No oversized CMS uploads served |
| **Avoid lazy-loading LCP** | `loading="eager"` on above-fold images; `loading="lazy"` only below-fold | Prevents browser deprioritization |

#### 3.2.3 Render-Path Optimizations

| Tactic | Implementation | Expected Impact |
|--------|---------------|----------------|
| **Inline critical CSS** | Extract above-fold styles; inline in `<head>` | Eliminates render-blocking CSS request |
| **Defer non-critical CSS** | `media="print"` trick or `rel="preload"` with onload | CSS loads after first paint |
| **Minimize render-blocking JS** | All scripts use `defer` or `type="module"` (implicit defer) | No JS blocks HTML parser |
| **Preconnect to origins** | `<link rel="preconnect">` to `api.twinmos.com`, `imgproxy.twinmos.com`, `search.twinmos.com` | Reduces DNS + TCP + TLS latency |
| **DNS prefetch** | `<link rel="dns-prefetch">` for third-party origins | Faster third-party resolution |

### 3.3 LCP Measurement Plan

| Tool | Frequency | What It Measures |
|------|-----------|-----------------|
| **Lighthouse CI** | Every PR | Lab LCP under controlled conditions |
| **Google Search Console (CrUX)** | Weekly | Field LCP from real Chrome users |
| **Sentry RUM** | Continuous | Real-user LCP with session context |
| **WebPageTest** | Weekly synthetic | LCP from MEA, India, EU, US regions |
| **PageSpeed Insights API** | Daily spot-checks | Lab + field data for key URLs |

---

## 4. INP (Interaction to Next Paint) Strategy

### 4.1 Why INP Matters for TwinMOS

INP replaced FID in March 2024 as a Core Web Vital. Unlike FID (which only measured the first interaction), INP measures **all interactions** throughout the page lifecycle — clicks, taps, and keyboard inputs. This is critical for TwinMOS because:

- **Product catalog filtering** requires instant AJAX updates
- **Compatibility finder** has typeahead search (keystroke responsiveness)
- **Gaming hub RGB visualizer** has interactive controls
- **Where-to-buy map** has pan/zoom interactions
- **Forms** have real-time validation

### 4.2 INP Optimization Tactics

#### 4.2.1 JavaScript Execution Optimization

| Tactic | Implementation | Expected Impact |
|--------|---------------|----------------|
| **Astro islands architecture** | Only hydrate interactive components; 95% of page is static HTML | Minimal JS on main thread |
| **Selective hydration** | `client:visible` for below-fold islands; `client:idle` for non-urgent | JS executes only when needed |
| **Code splitting** | Dynamic `import()` for heavy islands (RGB visualizer, comparison tool) | Initial JS < 45 KB |
| **Break up long tasks** | Yield to main thread with `scheduler.yield()` or `setTimeout(..., 0)` | Prevents input delay |
| **Web Workers** | Move heavy computations (compatibility matching, image processing) off main thread | Main thread stays responsive |
| **Minimize third-party JS impact** | Partytown for analytics; consent-gated loading | Analytics don't block interactions |

#### 4.2.2 DOM & Event Optimization

| Tactic | Implementation | Expected Impact |
|--------|---------------|----------------|
| **Small DOM size** | Keep total DOM nodes < 1,500; depth < 32 | Faster rendering and interaction |
| **Virtual scrolling** | For long product lists / KB articles | Only render visible items |
| **Debounce / throttle** | Search inputs, scroll handlers, resize observers | Reduces event frequency |
| **Passive event listeners** | `addEventListener('scroll', handler, { passive: true })` | Doesn't block scroll thread |
| **Avoid forced synchronous layouts** | Batch DOM reads/writes; use `requestAnimationFrame` | Prevents layout thrashing |

#### 4.2.3 CSS Optimization for Interactions

| Tactic | Implementation | Expected Impact |
|--------|---------------|----------------|
| **GPU-accelerated animations** | Use `transform` and `opacity` only; avoid `width`, `height`, `top`, `left` | 60 fps animations without layout recalc |
| **`content-visibility: auto`** | For product grid sections below fold | Reduces rendering cost of off-screen content |
| **Containment** | `contain: layout paint` on product cards | Isolates rendering scope |

### 4.3 INP Measurement Plan

| Tool | Frequency | Notes |
|------|-----------|-------|
| **Chrome DevTools Performance Panel** | During development | Identify long tasks and input delays |
| **web-vitals JS library** | Production RUM | Send INP data to analytics |
| **Sentry RUM** | Continuous | INP with replay for slow interactions |
| **CrUX (Search Console)** | Monthly | Field INP at 75th percentile |
| **Lighthouse** | Every PR | Total Blocking Time as proxy |

---

## 5. CLS (Cumulative Layout Shift) Strategy

### 5.1 Common CLS Risks on TwinMOS

| Risk Area | Cause | Prevention |
|-----------|-------|------------|
| **Product hero image** | Image loads without dimensions | Always specify `width` and `height` |
| **Font loading (Noto Sans)** | Flash of Invisible Text (FOIT) / Flash of Unstyled Text (FOUT) | `font-display: swap` + preloaded subsets |
| **Dynamic content injection** | News ticker, cookie banner, chat widget | Reserve space with `min-height` |
| **Ad / promo banners** | Marketing banners injected above content | Fixed container height |
| **Third-party embeds** | YouTube videos, social widgets | Aspect-ratio boxes |
| **Infinite scroll** | New products appended to grid | Skeleton placeholders matching final size |
| **Arabic RTL layout** | Mirrored layouts causing reflow | Logical CSS properties (`margin-inline-start`) |

### 5.2 CLS Optimization Tactics

#### 5.2.1 Image & Media Stability

```html
<!-- Good: explicit dimensions + aspect-ratio -->
<img 
  src="hero-800.webp" 
  width="800" 
  height="600" 
  alt="VOLTX DDR5 RGB Memory"
  style="aspect-ratio: 4/3; height: auto;"
/>

<!-- Good: responsive image with sizes -->
<img 
  src="product-400.webp"
  srcset="product-400.webp 400w, product-800.webp 800w, product-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  width="1200"
  height="1200"
  alt="TwinMOS Product"
/>
```

#### 5.2.2 Font Loading Stability

| Tactic | Implementation | CLS Impact |
|--------|---------------|-----------|
| **Preload critical fonts** | `<link rel="preload" as="font" href="noto-sans-latin.woff2" crossorigin>` | Eliminates font-loading delay |
| **`font-display: swap`** | `@font-face { font-display: swap; }` | Shows fallback immediately; no invisible text |
| **Match fallback metrics** | Choose `font-family: 'Noto Sans', 'Arial', sans-serif` with similar x-height | Minimizes swap size difference |
| **Subsetting** | Only load glyphs needed per locale | Smaller files, faster load |
| **Variable fonts** | Use Noto Sans Variable if available | Single file for all weights |

#### 5.2.3 Dynamic Content Stability

| Element | Reserved Space Strategy |
|---------|------------------------|
| **Cookie banner** | `<div style="min-height: 60px;">` as placeholder |
| **Chat widget** | Fixed position bottom-right; never pushes content |
| **News ticker** | `min-height: 40px; overflow: hidden;` |
| **Promo banner (exit-intent)** | Overlay (fixed position) rather than inline injection |
| **Search auto-suggest dropdown** | Absolute positioned; does not shift page flow |
| **Form validation messages** | Reserve space below input; `min-height: 24px;` |

#### 5.2.4 Skeleton Screens

For pages with dynamic content (product grids, search results, news listings), use skeleton screens that match the final layout dimensions:

```astro
<!-- Skeleton placeholder for product card -->
<div class="skeleton-card" style="aspect-ratio: 1/1.2;">
  <div class="skeleton-image" style="aspect-ratio: 1/1;"></div>
  <div class="skeleton-text" style="height: 20px; margin-top: 12px;"></div>
  <div class="skeleton-text" style="height: 16px; width: 60%; margin-top: 8px;"></div>
</div>
```

### 5.3 CLS Measurement Plan

| Tool | Frequency | Notes |
|------|-----------|-------|
| **Lighthouse** | Every PR | Lab CLS under stable conditions |
| **web-vitals library** | Production | Real-user CLS events |
| **Sentry RUM** | Continuous | CLS with element attribution |
| **CrUX** | Monthly | Field CLS at 75th percentile |
| **Playwright + axe** | Weekly | Automated layout stability checks |

---

## 6. TTFB (Time to First Byte) Strategy

### 6.1 TTFB Targets

| Scenario | Target | Max | Measurement |
|----------|--------|-----|-------------|
| Static page (SSG) | < 50 ms | 100 ms | Cloudflare edge cache |
| ISR page (news, events) | < 100 ms | 200 ms | Cloudflare + Strapi cache |
| API response | < 150 ms | 300 ms | Hetzner + Postgres |
| CMS admin | < 200 ms | 500 ms | Hetzner |

### 6.2 TTFB Optimization Tactics

| Tactic | Implementation | Impact |
|--------|---------------|--------|
| **Cloudflare edge caching** | Aggressive cache for static assets; 24h OSM tile cache | Eliminates origin round-trip |
| **ISR with short revalidation** | News/events: `revalidate: 60` seconds | Fresh content without server render |
| **Strapi API caching (P2)** | Redis cache for hot endpoints | < 50 ms for cached responses |
| **Database query optimization** | `pg_stat_statements` review; proper indexing | Reduces query time |
| **Connection pooling** | PgBouncer in Phase 2 if connections > 100 | Reduces connection overhead |
| **HTTP/3** | Cloudflare default | Faster handshake, especially on mobile |

---

## 7. Mobile-Specific CWV Strategy

### 7.1 Mobile Context for TwinMOS

| Market | Typical Device | Network | Constraints |
|--------|---------------|---------|-------------|
| **India** | Mid-range Android (4–6 GB RAM) | 4G / DSL (50–120 ms latency) | Aggressive lazy loading, minimal JS |
| **Pakistan** | Budget Android | 4G / WiFi | Lightweight pages, fast LCP |
| **Africa** | Variable (feature phones still present) | 3G/4G, variable | Minimal JS, fast LCP, image optimization |
| **Middle East** | iPhone + flagship Android | 5G / fiber | Full experience, but still optimize |
| **CIS / Russia** | Mid-range | 4G | Standard optimization |

### 7.2 Mobile Optimization Tactics

| Tactic | Implementation |
|--------|---------------|
| **Mobile-first responsive images** | `srcset` with `w` descriptors; mobile gets 400–800w images |
| **Touch target sizing** | Min 44×44 px (Tailwind plugin enforced) |
| **Viewport optimization** | `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| **Avoid large layout shifts on orientation change** | Fluid layouts; no fixed widths |
| **Reduce motion** | `prefers-reduced-motion` respected for all animations |
| **Offline form resilience** | LocalStorage draft saved every 5s |

---

## 8. Measurement & Governance

### 8.1 Lab vs. Field Data

| Type | Tools | Use Case | Limitations |
|------|-------|----------|-------------|
| **Lab Data** | Lighthouse, WebPageTest, PageSpeed Insights | CI gates, debugging, reproducible | Simulated network/device; may not match real users |
| **Field Data (RUM)** | CrUX, Sentry RUM, web-vitals library | Real user experience, ranking signals | 28-day rolling window; noisy for low-traffic pages |

### 8.2 Governance Model

```
Developer (local)
  → Lighthouse check in dev tools
  → Self-certify before PR

CI/CD (automated)
  → Lighthouse CI on PR
  → Bundle size check
  → axe-core accessibility check
  → Block merge if budgets exceeded

Staging (pre-deploy)
  → Full Lighthouse run on all page templates
  → WebPageTest multi-region
  → Manual QA on real devices

Production (continuous)
  → Sentry RUM monitors CWV
  → Plausible tracks load times
  → Google Search Console tracks CrUX
  → Weekly performance review meeting
```

### 8.3 Escalation Path

| Condition | Action | Owner |
|-----------|--------|-------|
| CWV drops below "Good" on any key page | Immediate triage; P2 bug created | Technical Lead |
| CWV drops below "Needs Improvement" | Hotfix deployment; post-mortem | Technical Lead + Marketing Director |
| Competitor launches faster site | Competitive audit; optimization sprint | Marketing Director |
| Phase 2/3 feature threatens CWV | ADR with offsetting optimizations | Technical Lead |

---

## 9. Competitor CWV Benchmarking

| Competitor | LCP (Mobile) | INP (Mobile) | CLS (Mobile) | Notes |
|------------|-------------|-------------|-------------|-------|
| **Kingston.com** | ~1.4 s | ~120 ms | ~0.02 | Strong SSG; optimized images |
| **Corsair.com** | ~1.6 s | ~140 ms | ~0.03 | Heavy JS but well-optimized |
| **ADATA.com** | ~1.8 s | ~160 ms | ~0.04 | Moderate complexity |
| **G.Skill.com** | ~1.5 s | ~130 ms | ~0.02 | Lightweight; fast LCP |
| **TEAMGROUP** | ~2.0 s | ~180 ms | ~0.05 | Room for improvement |
| **TwinMOS (Current)** | ~4.5 s | ~500 ms | ~0.25 | Broken; complete rebuild |
| **TwinMOS (Target P1)** | ≤ 1.8 s | ≤ 150 ms | ≤ 0.05 | Match tier-1 average |
| **TwinMOS (Aspirational)** | ≤ 1.5 s | ≤ 120 ms | ≤ 0.03 | Match Kingston/G.Skill |

---

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final strategy with measurement plan |

---

## 11. References

- BRD §20.1 — Page Load Performance
- Tech Stack §22.1 — Core Web Vitals Targets
- Tech Stack §22.3 — Performance Optimization Toolkit
- RFP §10.2 — Core Web Vitals Targets
- URD §32.1 — Perceived Performance Targets
- Google Core Web Vitals documentation (https://web.dev/vitals/)
- `TwinMOSWebsitePerformance_Budget.md`
- `TwinMOSWebsiteImageOptimizationSpec.md`
- `TwinMOSWebsiteLazyLoadingSpec.md`
