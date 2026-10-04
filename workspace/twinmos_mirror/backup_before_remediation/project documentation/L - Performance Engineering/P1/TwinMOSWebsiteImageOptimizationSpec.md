# TwinMOS Website — Image Optimization Specification

**Document Reference:** TWN-IMG-OPT-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation) / Marketing Director (Asset Quality)  
**Audience:** Frontend developers, content editors, designers, DevOps  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** Tech Stack §8, BRD §20.1, RFP §7.3, URD §32.1, BR-GLOBAL-4

---

## 1. Executive Summary

Images are the single largest contributor to page weight on the TwinMOS website and typically drive the **Largest Contentful Paint (LCP)** metric. This specification defines the complete image optimization pipeline — from source asset standards through build-time and runtime transformations to delivery via CDN.

> **Goal:** Reduce total image payload by 50–70% versus unoptimized sources while maintaining visual quality appropriate for a premium technology brand.

### 1.1 Business Impact

| Impact Area | Quantified Benefit |
|------------|-------------------|
| **LCP improvement** | Optimized images can reduce LCP by 0.5–1.5 seconds |
| **Bandwidth savings** | ~60% reduction in image bytes (JPEG → WebP/AVIF) |
| **Mobile user experience** | Critical for India, Bangladesh, Africa markets |
| **CDN cost reduction** | Fewer bytes served = lower Backblaze B2 + Cloudflare egress |
| **SEO ranking** | Image optimization directly improves Core Web Vitals |

---

## 2. Image Categories & Requirements

### 2.1 Image Type Matrix

| Category | Source Format | Output Format | Min Resolution | Max File Size | Transparency | Use Case |
|----------|--------------|--------------|---------------|--------------|--------------|----------|
| **Product hero** | PNG (transparent) | AVIF → WebP → PNG fallback | 1200×1200 | ≤ 180 KB | Required | PDP hero, category grid |
| **Product thumbnail** | PNG | WebP → JPEG | 400×400 | ≤ 30 KB | Optional | Category listings, related products |
| **Product gallery** | PNG / JPEG | AVIF → WebP → JPEG | 800×800 | ≤ 80 KB | Optional | PDP gallery zoom |
| **360° product view** | PNG sequence | WebP / MP4 (low-bitrate) | 600×600 | ≤ 50 KB/frame | Optional | Interactive product spin |
| **Lifestyle / context** | JPEG | AVIF → WebP → JPEG | 1600×900 | ≤ 200 KB | No | Homepage hero, solutions pages |
| **Content featured** | JPEG | AVIF → WebP → JPEG | 1200×630 | ≤ 150 KB | No | Blog posts, news articles |
| **OG image (social)** | JPEG / PNG | JPEG (universal compatibility) | 1200×630 | ≤ 120 KB | No | Social sharing preview |
| **Icon / logo** | SVG source | SVG (vector) | Scalable | ≤ 5 KB | Yes | Header, footer, UI elements |
| **Certification badge** | SVG / PNG | SVG preferred | Scalable / 200×200 | ≤ 5 KB | Yes | Product pages, compliance hub |
| **Wallpaper download** | JPEG | JPEG (original quality) | 1920×1080+ | ≤ 500 KB | No | Gaming hub downloads |
| **Video poster** | JPEG | WebP → JPEG | 1280×720 | ≤ 150 KB | No | YouTube/Vimeo embed placeholder |

### 2.2 Quality Settings by Format

| Format | Quality | Use Case | Notes |
|--------|---------|----------|-------|
| **AVIF** | 65–75 | Hero images, lifestyle | Best compression; slower encode |
| **WebP (lossy)** | 75–85 | Product photos, content | Best balance of quality/size |
| **WebP (lossless)** | — | Logos, graphics with text | When transparency + quality needed |
| **JPEG** | 80–90 | OG images, legacy fallback | Universal compatibility |
| **PNG** | — | Source only; avoid for web | Use WebP/AVIF instead |
| **SVG** | — | Icons, logos, badges | Compress with svgo |

---

## 3. Build-Time Image Pipeline (Astro Sharp)

### 3.1 Astro Image Integration

Astro 5 includes built-in image optimization via Sharp. Configuration:

```ts
// astro.config.ts
import { defineConfig } from 'astro/config';
import image from '@astrojs/image';

export default defineConfig({
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    // Default quality for all transforms
    defaultQuality: 80,
    // Allowed formats for automatic selection
    formats: ['avif', 'webp', 'jpeg'],
    // Default breakpoints for responsive images
    breakpoints: [400, 800, 1200, 1600],
  },
});
```

### 3.2 Astro `<Image />` Component Usage

```astro
---
import { Image } from 'astro:assets';
import productHero from '../assets/products/voltx-ddr5-hero.png';
---

<!-- Automatic format selection (AVIF → WebP → JPEG) + responsive srcset -->
<Image 
  src={productHero}
  alt="VOLTX DDR5 RGB 32GB Memory Module"
  width={1200}
  height={1200}
  quality={85}
  format="avif"
  loading="eager"
  fetchpriority="high"
/>
```

### 3.3 Astro `<Picture />` Component (Art Direction)

```astro
---
import { Picture } from 'astro:assets';
import heroDesktop from '../assets/hero-desktop.jpg';
import heroMobile from '../assets/hero-mobile.jpg';
---

<Picture 
  src={heroDesktop}
  alt="TwinMOS VOLTX Gaming Memory"
  widths={[400, 800, 1200, 1600]}
  sizes="(max-width: 768px) 100vw, 50vw"
  formats={['avif', 'webp']}
  fallbackFormat="jpeg"
  quality={80}
  loading="eager"
  fetchpriority="high"
/>
```

### 3.4 Build-Time Transform Rules

| Transform | Rule | Output |
|-----------|------|--------|
| **Format conversion** | Source PNG/JPEG → AVIF + WebP + JPEG | 3 variants per image |
| **Resize** | Generate widths: 400, 800, 1200, 1600 | 4 sizes per format |
| **Quality** | Product: 85; Hero: 80; Thumbnail: 75 | Per-category setting |
| **Metadata stripping** | Remove EXIF, GPS, camera info | Privacy + size reduction |
| **Color space** | Convert to sRGB | Consistent rendering |

### 3.5 Build Output Structure

```
dist/
├── _astro/
│   ├── assets/
│   │   ├── voltx-hero.400.avif
│   │   ├── voltx-hero.800.avif
│   │   ├── voltx-hero.1200.avif
│   │   ├── voltx-hero.400.webp
│   │   ├── voltx-hero.800.webp
│   │   ├── voltx-hero.1200.webp
│   │   ├── voltx-hero.400.jpg
│   │   ├── voltx-hero.800.jpg
│   │   └── voltx-hero.1200.jpg
```

---

## 4. Runtime Image Pipeline (ImgProxy)

### 4.1 Why ImgProxy

CMS-uploaded images (Strapi Media Library) cannot be optimized at build time. ImgProxy provides on-demand resizing, format conversion, and compression.

### 4.2 ImgProxy Configuration

```yaml
# Coolify-managed environment variables
IMGPROXY_KEY: <hex-secret>
IMGPROXY_SALT: <hex-secret>
IMGPROXY_BIND: ":8080"
IMGPROXY_USE_ETAG: "true"
IMGPROXY_TTL: 31536000              # 1 year cache
IMGPROXY_AUTO_WEBP: "true"          # Serve WebP if supported
IMGPROXY_AUTO_AVIF: "true"          # Serve AVIF if supported
IMGPROXY_ENFORCE_WEBP: "true"       # WebP as default modern format
IMGPROXY_PRESET_JPEG_BACKUP: "fmt:jpeg,q:85"
IMGPROXY_S3_REGION: "us-west-002"
IMGPROXY_S3_ENDPOINT: "https://s3.us-west-002.backblazeb2.com"
IMGPROXY_S3_BUCKET: "twinmos-assets-production"
```

### 4.3 ImgProxy URL Structure

```
https://imgproxy.twinmos.com/
  /{signature}/                          # Security signature
  /{options}/                            # Processing options
  /plain/
  /{source-url}                          # Original image URL from B2
```

Example:
```
https://imgproxy.twinmos.com/
  /abc123/
  /rs:fit:800:800:0/q:85/f:webp/
  /plain/
  /https://s3.us-west-002.backblazeb2.com/twinmos-assets/product-hero.png
```

### 4.4 Processing Presets

| Preset | Options | Use Case |
|--------|---------|----------|
| **thumb** | `rs:fit:400:400:0/q:75/f:webp` | Product thumbnails |
| **gallery** | `rs:fit:800:800:0/q:85/f:webp` | PDP gallery images |
| **hero** | `rs:fit:1200:1200:0/q:85/f:avif` | Product hero images |
| **lifestyle** | `rs:fit:1600:900:0/q:80/f:avif` | Homepage / solutions heroes |
| **og** | `rs:fit:1200:630:0/q:85/f:jpeg` | Social sharing images |
| **icon** | `rs:fit:64:64:0/q:90/f:png` | Small icons (PNG for alpha) |

### 4.5 ImgProxy Caching

| Layer | TTL | Behavior |
|-------|-----|----------|
| **Cloudflare edge** | 24 hours | Cache processed images at edge |
| **ImgProxy local** | 1 year | Cache source + processed on disk |
| **Browser** | 1 year | `Cache-Control: public, max-age=31536000` |
| **Backblaze B2** | Immutable | Versioned URLs on content update |

---

## 5. Responsive Images Strategy

### 5.1 Srcset & Sizes Patterns

```html
<!-- Product hero: scales from 400px (mobile) to 1200px (desktop) -->
<img 
  src="/product-hero-800.webp"
  srcset="
    /product-hero-400.webp 400w,
    /product-hero-800.webp 800w,
    /product-hero-1200.webp 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  width="1200"
  height="1200"
  alt="TwinMOS Product"
  loading="eager"
  fetchpriority="high"
/>
```

### 5.2 Breakpoint Strategy

| Breakpoint | Max Image Width | Typical Use |
|-----------|----------------|-------------|
| **Mobile** (< 768px) | 100vw | Full-width hero, stacked layout |
| **Tablet** (768–1024px) | 50vw | Side-by-side layouts |
| **Desktop** (1024–1440px) | 50vw | Grid layouts |
| **Wide** (> 1440px) | 33vw | Large screens, limited container width |

### 5.3 Density Descriptors (DPR)

For high-DPI displays (Retina, flagship Android):

```html
<img 
  srcset="
    /product-400.webp 1x,
    /product-800.webp 2x,
    /product-1200.webp 3x
  "
  src="/product-800.webp"
  alt="High-DPI product image"
/>
```

---

## 6. Lazy Loading Specification

### 6.1 Native Lazy Loading

```html
<!-- Above-fold: eager load -->
<img src="hero.webp" loading="eager" fetchpriority="high" ... />

<!-- Below-fold: lazy load -->
<img src="content-image.webp" loading="lazy" decoding="async" ... />

<!-- Near-fold: lazy with eager threshold -->
<img src="near-fold.webp" loading="lazy" ... />
```

### 6.2 Lazy Loading Rules by Position

| Position | `loading` | `fetchpriority` | `decoding` | Notes |
|----------|-----------|----------------|------------|-------|
| **Hero / above-fold** | `eager` | `high` | `auto` | Never lazy-load LCP element |
| **Just below fold** | `lazy` | `auto` | `async` | Browser heuristic handles |
| **Deep below fold** | `lazy` | `low` | `async` | Defer decoding too |
| **Hidden / modal** | `lazy` | `low` | `async` | Loaded on interaction |
| **Background images** | N/A | N/A | N/A | Use `content-visibility` or Intersection Observer |

### 6.3 Intersection Observer Fallback

For browsers that don't support `loading="lazy"` (negligible in 2026), Astro's `<Image />` component includes an Intersection Observer polyfill.

---

## 7. LCP Image Optimization

### 7.1 LCP Discovery & Preload

The LCP element is typically the largest image in the initial viewport. Optimize it aggressively:

```html
<head>
  <!-- Preload LCP image -->
  <link 
    rel="preload" 
    as="image" 
    href="/hero-1200.avif"
    imagesrcset="/hero-800.avif 800w, /hero-1200.avif 1200w"
    imagesizes="100vw"
    fetchpriority="high"
  />
  
  <!-- Preconnect to image origin -->
  <link rel="preconnect" href="https://imgproxy.twinmos.com" />
</head>

<body>
  <!-- LCP image -->
  <img 
    src="/hero-1200.avif"
    srcset="/hero-800.avif 800w, /hero-1200.avif 1200w"
    sizes="100vw"
    width="1600"
    height="900"
    alt="TwinMOS VOLTX RGB Memory"
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />
</body>
```

### 7.2 LCP Budget by Page

| Page | LCP Element | Max Size | Target LCP |
|------|------------|----------|-----------|
| Homepage | Hero image (first slide) | ≤ 150 KB AVIF | < 1.2 s |
| Category | Category hero | ≤ 120 KB AVIF | < 1.3 s |
| PDP | Product hero | ≤ 180 KB AVIF | < 1.5 s |
| Gaming Hub | RGB showcase poster | ≤ 200 KB AVIF | < 1.6 s |
| Content | Featured image | ≤ 100 KB AVIF | < 1.0 s |

---

## 8. Video & Animation Optimization

### 8.1 Video Embed Strategy

```html
<!-- Lazy-loaded YouTube embed with facade -->
<div class="video-container" style="aspect-ratio: 16/9;">
  <iframe 
    src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
    loading="lazy"
    title="TwinMOS Product Video"
    allowfullscreen
  ></iframe>
</div>
```

### 8.2 Video Rules

| Rule | Implementation |
|------|---------------|
| **Lazy load all embeds** | `loading="lazy"` on iframes |
| **Privacy-enhanced mode** | `youtube-nocookie.com` domain |
| **Poster image** | Static JPEG/WebP poster loaded first; video on interaction |
| **Autoplay prohibition** | No autoplay unless muted and below fold |
| **360° product views** | WebP image sequence or low-bitrate MP4 (< 2 MB total) |

### 8.3 Animation Rules

| Animation Type | Format | Max Size | Loading |
|---------------|--------|---------|---------|
| **Simple UI animations** | CSS transitions | Inline | Immediate |
| **Micro-interactions** | Lottie JSON | ≤ 30 KB | Lazy |
| **RGB visualizer (Gaming)** | Canvas + WebGL | Runtime generated | On interaction |
| **Hero animations** | CSS `transform` + `opacity` | Inline CSS | Immediate |

---

## 9. SVG Optimization

### 9.1 SVG Usage Guidelines

| Use Case | Format | Optimization |
|----------|--------|-------------|
| **Logo** | Inline SVG | svgo optimization; remove unused paths |
| **Icons** | SVG sprite sheet | Single file; `<use>` references |
| **Certification badges** | Inline SVG | svgo; monochrome where possible |
| **Decorative graphics** | Inline SVG or CSS | `aria-hidden="true"` |

### 9.2 SVG Sprite System

```html
<!-- SVG sprite (loaded once, cached) -->
<svg style="display: none;">
  <defs>
    <symbol id="icon-search" viewBox="0 0 24 24">
      <path d="M..."/>
    </symbol>
    <symbol id="icon-cart" viewBox="0 0 24 24">
      <path d="M..."/>
    </symbol>
  </defs>
</svg>

<!-- Usage -->
<svg width="24" height="24" aria-hidden="true">
  <use href="#icon-search"/>
</svg>
```

### 9.3 SVG Optimization with svgo

```json
{
  "plugins": [
    "preset-default",
    "removeDimensions",
    "removeViewBox: false",
    "cleanupIds"
  ]
}
```

---

## 10. Content Authoring Guidelines

### 10.1 For Marketing / Content Editors

| Rule | Rationale |
|------|-----------|
| **Upload PNG for product photos** | Transparency needed for cutout backgrounds |
| **Upload JPEG for lifestyle photos** | No transparency needed; smaller source |
| **Minimum 1200×1200 for product heroes** | Downscaling is fine; upscaling is not |
| **No camera RAW uploads** | Process to PNG/JPEG before upload |
| **Descriptive file names** | SEO + accessibility: `voltx-ddr5-rgb-32gb-hero.png` |
| **Alt text mandatory** | Accessibility + SEO |

### 10.2 CMS Validation (Strapi)

| Validation | Rule | Enforcement |
|-----------|------|-------------|
| **Min dimensions** | Product hero: 1200×1200 | Strapi media library validation |
| **Max file size** | 5 MB per upload | Strapi config |
| **Format whitelist** | PNG, JPEG, WebP, AVIF, SVG | Strapi upload provider |
| **Alt text required** | Non-empty string | Strapi content-type validation |

---

## 11. Performance Monitoring

### 11.1 Image-Specific Metrics

| Metric | Tool | Target |
|--------|------|--------|
| **Image payload per page** | Lighthouse | ≤ 600 KB (gaming) / ≤ 450 KB (PDP) |
| **LCP image load time** | Lighthouse + Sentry | < 1.0 s |
| **Images without dimensions** | axe-core + custom lint | 0 violations |
| **Images without alt text** | axe-core | 0 violations |
| **Oversized images** | Custom CI check | 0 images > 2× display size |

### 11.2 CI Image Checks

```yaml
# .github/workflows/image-check.yml
- name: Check image optimization
  run: |
    # Ensure all images in dist/ have width/height
    node scripts/verify-image-dimensions.js
    
    # Ensure no unoptimized PNGs are served (should have WebP/AVIF)
    node scripts/verify-modern-formats.js
    
    # Check total image weight per route
    node scripts/verify-image-budget.js
```

---

## 12. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final spec with pipeline details |

---

## 13. References

- Tech Stack §8 — Image, Media & Asset Pipeline
- Tech Stack §22.3 — Performance Optimization Toolkit (Image optimization)
- BRD §20.1 — Page Load Performance (LCP targets)
- BR-GLOBAL-4 — Images must be served in WebP with JPEG fallback
- RFP §7.3 — Product Imagery requirements
- URD §32.1 — Perceived Performance Targets
- `TwinMOSWebsitePerformance_Budget.md`
- `TwinMOSWebsiteLazyLoadingSpec.md`
