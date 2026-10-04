# TwinMOS Website — Critical CSS Strategy

**Document Reference:** TWN-CRITICAL-CSS-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation)  
**Audience:** Frontend developers, DevOps engineers  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** Tech Stack §22.3 (Critical CSS), BRD §20.1, URD §32.1, Implementation Strategy v3.0 §11.1

---

## 1. Executive Summary

Critical CSS is the subset of CSS required to render the above-the-fold content of a page. By inlining this CSS directly in the HTML `<head>`, we eliminate the render-blocking request for an external stylesheet, dramatically improving **First Contentful Paint (FCP)** and **Largest Contentful Paint (LCP)**.

This document defines the critical CSS strategy for the TwinMOS website, leveraging Astro 5's built-in critical CSS extraction capabilities and Tailwind CSS's utility-first approach.

> **Goal:** Render above-fold content within 100 ms of HTML delivery, with zero render-blocking CSS requests.

---

## 2. Critical CSS Principles

### 2.1 What Is Critical CSS?

Critical CSS includes:
- **Layout framework:** CSS needed for page structure (header, footer, main grid)
- **Above-fold components:** Hero section, navigation, first content block
- **Typography:** Font-face declarations and base text styles
- **Color tokens:** Background, text, and accent colors
- **Utility classes** used in the initial viewport

Non-critical CSS (loaded asynchronously) includes:
- Below-fold component styles
- Animation keyframes not used above fold
- Print stylesheets
- Component-specific styles for lazy-loaded islands

### 2.2 Tailwind CSS + Critical CSS

Tailwind CSS generates utility classes based on the classes actually used in your markup. This makes it inherently tree-shakeable and well-suited for critical CSS extraction:

```html
<!-- Only the utilities used here are included in CSS -->
<div class="bg-white text-gray-900 px-4 py-8 md:px-8 lg:px-16">
  <h1 class="text-3xl font-bold text-twinmos-blue">
    VOLTX DDR5 RGB Memory
  </h1>
</div>
```

---

## 3. Astro 5 Critical CSS Extraction

### 3.1 Built-In Critical CSS

Astro 5 automatically extracts critical CSS when using scoped styles or Tailwind:

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
---

<Layout>
  <Hero />
  <!-- Below-fold content -->
  <ProductGrid />
  <NewsSection />
</Layout>

<style>
  /* These styles are scoped to this page */
  /* Astro can inline critical styles automatically */
</style>
```

### 3.2 Tailwind Configuration for Critical CSS

```ts
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        'twinmos-blue': '#00A3E0',
        'twinmos-dark': '#0A2540',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

### 3.3 Critical CSS Build Process

```
1. Astro scans all .astro files for class names
2. Tailwind generates only used utilities
3. Astro identifies above-fold components
4. Critical CSS is inlined in <head>
5. Remaining CSS is split into deferred chunks
6. Deferred CSS loaded via <link rel="preload"> with onload switch
```

---

## 4. Inline Critical CSS

### 4.1 Critical CSS Content

```html
<head>
  <!-- Critical CSS inlined -->
  <style>
    /* === TAILWIND BASE === */
    @tailwind base;
    
    /* === FONT FACE (critical only: Regular weight) === */
    @font-face {
      font-family: 'Noto Sans';
      src: url('/fonts/noto-sans/NotoSans-Regular-latin.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    
    /* === CRITICAL LAYOUT === */
    html { scroll-behavior: smooth; }
    body { 
      font-family: 'Noto Sans', Arial, sans-serif;
      background-color: #ffffff;
      color: #1a1a1a;
      margin: 0;
      line-height: 1.6;
    }
    
    /* === HEADER === */
    .site-header {
      position: fixed;
      top: 0;
      width: 100%;
      height: 64px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      z-index: 50;
    }
    
    /* === HERO SECTION === */
    .hero {
      min-height: 80vh;
      display: flex;
      align-items: center;
      padding-top: 64px; /* header offset */
    }
    
    /* === CRITICAL UTILITIES === */
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
    .container { width: 100%; max-width: 1280px; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
    @media (min-width: 768px) { .container { padding-left: 2rem; padding-right: 2rem; } }
    .text-twinmos-blue { color: #00A3E0; }
    .bg-twinmos-dark { background-color: #0A2540; }
    /* ... other critical utilities ... */
  </style>
  
  <!-- Deferred non-critical CSS -->
  <link 
    rel="preload" 
    href="/_astro/non-critical.css" 
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  />
  <noscript>
    <link rel="stylesheet" href="/_astro/non-critical.css" />
  </noscript>
</head>
```

### 4.2 Critical CSS Budget

| Page Type | Critical CSS Limit | Notes |
|-----------|-------------------|-------|
| **Homepage** | ≤ 15 KB | Header + hero + first section |
| **Product pages** | ≤ 18 KB | Header + product hero + specs table |
| **Content pages** | ≤ 12 KB | Header + article layout + typography |
| **Gaming hub** | ≤ 20 KB | Header + dark theme + hero |
| **Forms** | ≤ 12 KB | Header + form layout + inputs |

---

## 5. Deferred CSS Loading

### 5.1 The `preload` + `onload` Pattern

```html
<link 
  rel="preload" 
  href="/_astro/styles.deadbeef.css" 
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link rel="stylesheet" href="/_astro/styles.deadbeef.css" />
</noscript>
```

This pattern:
1. Preloads the CSS file (browser discovers it early)
2. Applies it as a stylesheet once loaded (via `onload`)
3. Falls back to synchronous load for no-JS browsers

### 5.2 Media Query Splitting

Load CSS only when needed:

```html
<!-- Print styles: only loaded for print -->
<link 
  rel="stylesheet" 
  href="/_astro/print.css" 
  media="print"
/>

<!-- Dark mode styles (if implemented) -->
<link 
  rel="stylesheet" 
  href="/_astro/dark.css" 
  media="(prefers-color-scheme: dark)"
/>
```

---

## 6. Tailwind-Specific Optimizations

### 6.1 PurgeCSS Configuration

```ts
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  // Only generate utilities that are actually used
  safelist: [
    // Dynamically generated classes that PurgeCSS might miss
    'bg-twinmos-blue',
    'text-twinmos-blue',
    'animate-fade-in',
  ],
};
```

### 6.2 CSS Splitting by Route

Astro + Vite automatically code-splits CSS by route:

```
dist/
├── _astro/
│   ├── index.css           # Homepage-specific styles
│   ├── product-category.css
│   ├── product-detail.css
│   ├── gaming.css
│   └── common.css          # Shared across all pages
```

### 6.3 Unused CSS Monitoring

| Tool | Purpose | Frequency |
|------|---------|-----------|
| **Coverage tab (Chrome DevTools)** | See used vs. unused CSS | Development |
| **Lighthouse** | Flags unused CSS | Every PR |
| **PurgeCSS** | Removes unused Tailwind classes | Every build |
| **Stylelint** | Enforces CSS best practices | Every commit |

---

## 7. Gaming Hub: Dark Theme CSS

The gaming hub uses a dark theme that differs from the corporate light theme:

```css
/* Critical dark theme styles (inlined for gaming pages) */
[data-theme="gaming"] {
  --color-bg: #0A0A0A;
  --color-text: #E0E0E0;
  --color-accent: #00FF88;
  --color-card: #1A1A1A;
}

[data-theme="gaming"] body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

[data-theme="gaming"] .hero {
  background: linear-gradient(135deg, #0A0A0A 0%, #1A0A2E 100%);
}
```

**Strategy:** Gaming hub pages inline the dark theme CSS as critical, while corporate pages skip it entirely.

---

## 8. RTL (Arabic) Critical CSS

For Arabic pages, critical CSS includes RTL overrides:

```css
/* Arabic critical additions */
[dir="rtl"] .site-header {
  direction: rtl;
}

[dir="rtl"] .container {
  /* No change needed if using logical properties */
}

[dir="rtl"] .hero {
  text-align: right;
}

[dir="rtl"] .icon-chevron {
  transform: scaleX(-1);
}
```

**Strategy:** Use CSS logical properties (`margin-inline-start`, `padding-inline-end`, `text-align: start`) wherever possible to minimize RTL-specific CSS.

---

## 9. Performance Impact

### 9.1 Before vs. After Critical CSS

| Metric | Without Critical CSS | With Critical CSS | Improvement |
|--------|---------------------|-------------------|-------------|
| **FCP** | ~1.5 s | ~0.8 s | -47% |
| **LCP** | ~2.2 s | ~1.4 s | -36% |
| **Render-blocking resources** | 2–3 CSS files | 0 CSS files | Eliminated |
| **Time to render text** | ~1.2 s | ~0.3 s | -75% |

### 9.2 Key Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Critical CSS size** | ≤ 20 KB per page | Build output analysis |
| **Deferred CSS size** | ≤ 55 KB total | Build output analysis |
| **Unused CSS** | < 5% of total | Chrome Coverage tab |
| **Render-blocking resources** | 0 | Lighthouse |

---

## 10. CI/CD Integration

### 10.1 Critical CSS Validation

```bash
#!/bin/bash
# scripts/verify-critical-css.sh

MAX_CRITICAL_CSS=20000  # 20 KB

echo "🔍 Checking critical CSS size..."

# Extract inline <style> tags from built HTML and measure
for file in dist/**/*.html; do
  size=$(grep -oP '(?<=<style>).*?(?=</style>)' "$file" | wc -c)
  if [ "$size" -gt "$MAX_CRITICAL_CSS" ]; then
    echo "❌ FAIL: $file has ${size}B critical CSS (max: ${MAX_CRITICAL_CSS}B)"
    exit 1
  fi
done

echo "✅ All critical CSS within budget."
```

### 10.2 Lighthouse Checks

```json
{
  "assertions": {
    "render-blocking-resources": ["error", { "maxLength": 0 }],
    "unused-css-rules": ["warn", { "maxLength": 0 }]
  }
}
```

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final strategy |

---

## 12. References

- Tech Stack §22.3 — Performance Optimization Toolkit (Critical CSS inline)
- BRD §20.1 — Performance Requirements (FCP/LCP targets)
- URD §32.1 — Perceived Performance Targets
- Astro CSS documentation: https://docs.astro.build/en/guides/styling/
- Tailwind CSS optimization: https://tailwindcss.com/docs/optimizing-for-production
- `TwinMOSWebsitePerformance_Budget.md`
- `TwinMOSWebsiteFontLoadingStrategy.md`
