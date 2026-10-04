# TwinMOS Website — Lazy Loading Specification

**Document Reference:** TWN-LAZY-LOAD-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation)  
**Audience:** Frontend developers, QA engineers  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** Tech Stack §8.2 (Lazy loading), §22.3 (Performance Optimization Toolkit), BRD §20.1, URD §32.3, RFP §10.2

---

## 1. Executive Summary

Lazy loading defers the loading of non-critical resources until they are needed — typically when they enter or are about to enter the user's viewport. This specification defines the lazy loading strategy for the TwinMOS website, covering images, iframes, videos, third-party scripts, and interactive islands.

> **Goal:** Ensure that only resources required for the initial viewport are loaded on first paint, reducing initial page weight by 30–50% and improving LCP, FCP, and TBT.

---

## 2. Lazy Loading Principles

### 2.1 Core Rules

1. **Never lazy-load the LCP element.** The Largest Contentful Paint element must load immediately.
2. **Lazy-load everything below the fold.** Any image, video, or iframe not visible in the initial viewport should be deferred.
3. **Use native `loading="lazy"` as the default.** It is supported in all modern browsers and requires zero JavaScript.
4. **Use `client:visible` for Astro islands.** Hydrate interactive components only when scrolled into view.
5. **Respect `prefers-reduced-data`.** For users with data saver enabled, be even more aggressive with lazy loading.

### 2.2 Priority Matrix

| Resource Type | Above Fold | Just Below Fold | Deep Below Fold | Hidden / Modal |
|--------------|-----------|----------------|----------------|---------------|
| **Hero image** | `eager` + `fetchpriority="high"` | N/A | N/A | N/A |
| **Product thumbnails** | `eager` (first 4) | `lazy` | `lazy` | N/A |
| **Content images** | `eager` (if LCP) | `lazy` | `lazy` | N/A |
| **Gallery images** | N/A | `lazy` | `lazy` | `lazy` |
| **Video embeds** | N/A | `lazy` | `lazy` | `lazy` |
| **Iframes (maps)** | N/A | `lazy` | `lazy` | N/A |
| **Third-party scripts** | N/A | N/A | `lazy` / `defer` | On interaction |
| **Astro islands** | `client:load` / `client:idle` | `client:visible` | `client:visible` | On interaction |
| **Comments / reviews** | N/A | N/A | `lazy` | N/A |

---

## 3. Image Lazy Loading

### 3.1 Native Lazy Loading

```html
<!-- Above-fold LCP image: NEVER lazy -->
<img 
  src="hero-1200.avif"
  alt="TwinMOS VOLTX RGB Memory"
  width="1600"
  height="900"
  loading="eager"
  fetchpriority="high"
/>

<!-- Below-fold content image: lazy -->
<img 
  src="article-diagram.webp"
  alt="DDR5 architecture diagram"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
/>

<!-- Deep below fold: lazy + low fetchpriority -->
<img 
  src="footer-badge.webp"
  alt="ISO 9001 Certification"
  width="200"
  height="200"
  loading="lazy"
  fetchpriority="low"
  decoding="async"
/>
```

### 3.2 Lazy Loading Rules by Page Type

| Page Type | Eager-Loaded Images | Lazy-Loaded Images |
|-----------|--------------------|--------------------|
| **Homepage** | Hero slide 1, first 2 category thumbnails | Remaining slides, news thumbnails, trust bar logos |
| **Product Category** | First 4 product thumbnails, category hero | Remaining grid items, pagination |
| **Product Detail** | Hero image, first gallery thumbnail | Additional gallery images, related products |
| **Content Page** | Featured image (if above fold) | Inline content images, author avatar |
| **Gaming Hub** | Hero poster, first RGB preview | Video embeds, build gallery thumbnails, wallpapers |
| **Where to Buy** | None (map is text-based LCP) | Retailer logos, map tiles |
| **Forms** | None (text LCP) | Decorative icons, help images |

### 3.3 Image Placeholders

To prevent layout shift while lazy-loaded images load, use one of:

| Technique | Implementation | Best For |
|-----------|---------------|----------|
| **Explicit width/height** | `width="800" height="600"` | All images |
| **Aspect-ratio CSS** | `aspect-ratio: 4/3;` | Responsive containers |
| **Blur-up placeholder** | Tiny 20px base64 blur → sharp image | Hero images, product photos |
| **Skeleton placeholder** | CSS gradient pulse | Product grids, news listings |
| **Dominant color placeholder** | Single-color background matching image | Content images |

### 3.4 Blur-Up Implementation

```astro
---
import { getImage } from 'astro:assets';
const optimized = await getImage({ src: productHero, width: 1200, quality: 85 });
const placeholder = await getImage({ src: productHero, width: 20, quality: 20 });
---

<div class="image-container" style={`aspect-ratio: 1/1;`}>
  <img 
    src={placeholder.src}
    alt=""
    class="blur-placeholder"
    aria-hidden="true"
    style="filter: blur(20px); transform: scale(1.1);"
  />
  <img 
    src={optimized.src}
    alt="VOLTX DDR5 RGB Memory"
    loading="eager"
    fetchpriority="high"
    class="final-image"
    onload="this.previousElementSibling.style.display='none'"
  />
</div>
```

---

## 4. Iframe Lazy Loading

### 4.1 Video Embeds (YouTube / Vimeo)

```html
<!-- Lazy-loaded YouTube embed with facade pattern -->
<div class="video-facade" data-video-id="VIDEO_ID" style="aspect-ratio: 16/9;">
  <img 
    src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
    alt="TwinMOS product video thumbnail"
    loading="lazy"
    class="video-poster"
  />
  <button class="play-button" aria-label="Play video">
    <svg><!-- play icon --></svg>
  </button>
</div>

<script>
  // On click, replace facade with actual iframe
  document.querySelectorAll('.video-facade').forEach(facade => {
    facade.addEventListener('click', () => {
      const videoId = facade.dataset.videoId;
      facade.innerHTML = `
        <iframe 
          src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      `;
    });
  });
</script>
```

### 4.2 Map Embeds

```html
<!-- Leaflet map container -->
<div id="map" style="height: 400px;" data-lazy-map="true"></div>

<!-- Map is initialized only when container scrolls into view -->
<WhereToBuyLocator client:visible />
```

---

## 5. Third-Party Script Lazy Loading

### 5.1 Consent-Gated Loading

All analytics and marketing scripts are loaded only after user consent:

```html
<!-- Consent banner loads first (client:load) -->
<CookieBanner client:load />

<!-- Analytics scripts injected via GTM after consent -->
<!-- No script tags in initial HTML -->
```

### 5.2 Partytown for Analytics

```ts
// astro.config.ts
import partytown from '@astrojs/partytown';

export default defineConfig({
  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push', 'gtag', 'fbq', 'lintrk'],
      },
    }),
  ],
});
```

### 5.3 Chat Widget Lazy Loading (Phase 2)

```html
<!-- Chatwoot widget loads only when user scrolls to footer -->
<ChatwootWidget client:visible />
```

### 5.4 Third-Party Script Loading Matrix

| Script | Phase | Load Trigger | Size | Strategy |
|--------|-------|-------------|------|----------|
| **Plausible** | P1 | Immediate | ~1 KB | Inline script; no lazy load needed |
| **Sentry** | P1 | `defer` | ~25 KB | Non-blocking; loads after HTML parse |
| **GA4 + GTM** | P1 | Consent + `defer` | ~45 KB | Partytown or `defer` |
| **Meta Pixel** | P1 | Consent + `defer` | ~25 KB | Loaded via GTM |
| **LinkedIn Insight** | P1 | Consent + `defer` | ~15 KB | Loaded via GTM |
| **Cloudflare Turnstile** | P1 | Form page visible | ~30 KB | Loaded when form island hydrates |
| **Chatwoot** | P2 | Footer visible | ~50 KB | `client:visible` island |
| **PostHog** | P3 | Consent + `defer` | ~40 KB | `defer`; sampled 10% |
| **Stripe.js** | P3 | Checkout page | ~80 KB | Dynamic import on `/checkout/*` |

---

## 6. Astro Islands Lazy Hydration

### 6.1 Hydration Directives

| Directive | Hydrates When | Use Case | JS Cost |
|-----------|--------------|----------|---------|
| `client:load` | Immediately on page load | Cookie banner, cart badge | Immediate |
| `client:idle` | First `requestIdleCallback` | Header nav, language selector | Delayed (non-blocking) |
| `client:visible` | Element enters viewport | Product filter, map, chat widget | Only when needed |
| `client:media` | Media query matches | Mobile-specific components | Conditional |
| `client:only` | Never server-rendered | RGB visualizer (needs canvas) | Client only |
| `client:interaction` | User interaction | Modal, dropdown | On demand |

### 6.2 Island Hydration Map

| Island | Directive | Justification |
|--------|-----------|---------------|
| `<HeaderNavigation />` | `client:idle` | Needed for interaction but not for initial paint |
| `<LanguageSelector />` | `client:idle` | Low priority; user may not interact |
| `<SearchBar />` | `client:visible` | Only needed when user scrolls to header or focuses |
| `<CookieBanner />` | `client:load` | Must be interactive immediately |
| `<ProductFilter />` | `client:visible` | Below fold on category pages |
| `<ProductCompare />` | `client:visible` | Appears in sidebar; may be below fold |
| `<CompatibilityFinder />` | `client:visible` | Usually below product details |
| `<WhereToBuyLocator />` | `client:visible` | Map is heavy; only load when needed |
| `<ContactForm />` | `client:visible` | Form may be below fold |
| `<NewsletterSignup />` | `client:idle` | Footer element; low priority |
| `<WarrantyRegistration />` | `client:visible` | Form page; may be below fold |
| `<RGBVisualizer />` | `client:visible` | Gaming hub; heavy WebGL |
| `<ChatwootWidget />` | `client:visible` | Footer area; load on scroll |
| `<CartBadge />` | Server Island | No hydration needed; server-rendered |
| `<CheckoutFlow />` | `client:load` | Must be interactive immediately |

### 6.3 Server Islands (Astro 5)

For personalized content that doesn't need client-side JS:

```astro
<!-- Server Island: rendered at edge, no hydration -->
<CartBadge server:defer>
  <!-- Fetches cart count from Medusa API at edge -->
  <!-- Zero JavaScript shipped to browser -->
</CartBadge>
```

---

## 7. Content Lazy Loading

### 7.1 Progressive Content Loading

For long content pages (learn articles, technology deep-dives):

| Technique | Implementation | Benefit |
|-----------|---------------|---------|
| **Table of contents** | Static HTML; links to sections | No JS needed |
| **Code blocks** | Static HTML with expressive-code | Syntax highlighting at build time |
| **Image galleries** | Lazy-load images beyond first 2 | Reduce initial weight |
| **Expandable sections** | `<details>` / `<summary>` | Native HTML; no JS |
| **Related articles** | Lazy-load on scroll | Footer content deferred |

### 7.2 Infinite Scroll vs. Pagination

| Pattern | Use Case | Lazy Loading Approach |
|---------|----------|----------------------|
| **Pagination** | Product categories, news listings | Click to load next page; prefetch on hover |
| **Infinite scroll** | Blog archives, build gallery | Intersection Observer triggers fetch; skeleton placeholders |
| **Load more button** | Search results | Click triggers fetch; explicit user control |

**Recommendation:** Use **pagination** for product categories (SEO-friendly, predictable). Use **infinite scroll** only for build gallery and social feeds where content exploration is the primary goal.

---

## 8. Network-Aware Lazy Loading

### 8.1 Connection-Aware Loading

```typescript
// Network-aware loading utility
function shouldLazyLoadAggressively(): boolean {
  const connection = (navigator as any).connection;
  
  if (!connection) return false;
  
  // Aggressive lazy loading on slow connections
  return (
    connection.saveData ||                    // Data saver mode
    connection.effectiveType === '2g' ||      // 2G network
    connection.effectiveType === 'slow-2g'    // Very slow
  );
}

// Usage: on slow connections, lazy-load even above-fold images
// (except LCP element)
```

### 8.2 Battery-Aware Loading

```typescript
function shouldReduceMotionAndLoading(): boolean {
  return (
    navigator.hardwareConcurrency < 4 ||      // Low-end device
    (navigator as any).deviceMemory < 4       // < 4GB RAM
  );
}
```

---

## 9. Monitoring & Testing

### 9.1 Lazy Loading Validation

| Check | Tool | Frequency |
|-------|------|-----------|
| LCP image not lazy-loaded | Lighthouse | Every PR |
| Below-fold images are lazy-loaded | Custom script | Every PR |
| Islands use correct directive | ESLint plugin | Every commit |
| Total requests on first paint | WebPageTest | Weekly |
| Images loaded without dimensions | axe-core | Every PR |

### 9.2 CI Check Script

```bash
#!/bin/bash
# scripts/verify-lazy-loading.sh

echo "🔍 Verifying lazy loading rules..."

# Check that LCP images don't have loading="lazy"
if grep -r 'fetchpriority="high".*loading="lazy"' src/; then
  echo "❌ FAIL: LCP image with fetchpriority=high must not have loading=lazy"
  exit 1
fi

# Check that below-fold images have loading="lazy"
# (This requires build-time analysis or manual review)

echo "✅ Lazy loading rules verified."
```

---

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final spec |

---

## 11. References

- Tech Stack §8.2 — Specifications (Below-fold images: native `loading="lazy"`)
- Tech Stack §22.3 — Performance Optimization Toolkit (Resource hints, Service worker)
- BRD §20.1 — Page Load Performance (LCP targets)
- URD §32.3 — Loading Strategies from User Perspective
- RFP §10.2 — Core Web Vitals Targets
- `TwinMOSWebsitePerformance_Budget.md`
- `TwinMOSWebsiteImageOptimizationSpec.md`
