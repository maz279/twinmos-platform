# TwinMOS Website — Font Loading Strategy

**Document Reference:** TWN-FONT-STRAT-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation) / UX Lead (Typography)  
**Audience:** Frontend developers, designers, content editors  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** Tech Stack §22.3 (Font subsetting), BRD §20.1, URD §32.1, URD §16 (Multi-script support)

---

## 1. Executive Summary

Web fonts are a critical visual asset for the TwinMOS brand but represent a significant performance risk. Poor font loading can cause **Cumulative Layout Shift (CLS)**, **delayed First Contentful Paint (FCP)**, and a degraded perceived performance — especially on mobile networks in India, Bangladesh, and Africa.

This document defines the complete font loading strategy for the TwinMOS website, covering:

- Font family selection and fallbacks
- Self-hosting vs. third-party services
- Subsetting for 9 locales
- Loading tactics (preload, display strategies, critical font inlining)
- RTL (Arabic) typography considerations

> **Goal:** Render text within 100 ms of FCP with zero layout shift from font loading, across all 9 supported locales.

---

## 2. Font Family Architecture

### 2.1 Primary Typeface: Noto Sans

Google's **Noto Sans** is selected as the primary typeface for the TwinMOS website because:

- **Comprehensive multi-script support:** Covers Latin, Arabic, Bengali, Devanagari (Hindi), Cyrillic (Russian), CJK (Chinese-Simplified)
- **Consistent visual identity:** Unified design language across all locales
- **Open source:** No licensing fees; full self-hosting freedom
- **Variable font availability:** Single file for all weights (where supported)

### 2.2 Font Stack by Locale

| Locale | Primary Font | Fallback Stack | Weight Range | File Size (subset) |
|--------|-------------|---------------|-------------|-------------------|
| **English (en)** | Noto Sans Latin | `"Noto Sans", "Arial", sans-serif` | 400–700 | ~35 KB |
| **Arabic (ar)** | Noto Sans Arabic | `"Noto Sans Arabic", "Tahoma", sans-serif` | 400–700 | ~35 KB |
| **Bengali (bn)** | Noto Sans Bengali | `"Noto Sans Bengali", "Vrinda", sans-serif` | 400–700 | ~30 KB |
| **Hindi (hi)** | Noto Sans Devanagari | `"Noto Sans Devanagari", "Mangal", sans-serif` | 400–700 | ~30 KB |
| **Russian (ru)** | Noto Sans Cyrillic | `"Noto Sans", "Arial", sans-serif` | 400–700 | ~25 KB |
| **Chinese-Simplified (zh-CN)** | Noto Sans SC | `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif` | 400–700 | ~40 KB |
| **French (fr)** | Noto Sans Latin | `"Noto Sans", "Arial", sans-serif` | 400–700 | ~35 KB |

### 2.3 Gaming Hub Display Font (Optional)

For the VOLTX gaming hub headings, a display font may be used for brand differentiation:

| Usage | Font | Loading Strategy | Max Size |
|-------|------|-----------------|----------|
| **Gaming headlines** | Orbitron or Rajdhani (Google Fonts) | Self-hosted subset; `font-display: swap` | ≤ 25 KB |
| **RGB showcase labels** | Same as primary (Noto Sans) | Already loaded | — |

> **Note:** Display font usage must be approved by Technical Lead to ensure it doesn't exceed the Gaming Hub JS/CSS budget.

---

## 3. Self-Hosting Strategy

### 3.1 Why Self-Host Fonts

| Factor | Google Fonts CDN | Self-Hosted |
|--------|-----------------|-------------|
| **Privacy (GDPR)** | Sends user IP to Google | No external request |
| **Performance** | Extra DNS + TCP + TLS handshake | Preconnected; same origin |
| **Control** | Limited subset control | Full subset customization |
| **Availability** | Subject to Google uptime | Controlled by TwinMOS |
| **Caching** | Shared cache (deprecated in Chrome) | Cache-Control optimized |

**Decision:** All fonts are self-hosted and served from `twinmos.com` (Cloudflare edge).

### 3.2 Font File Organization

```
public/fonts/
├── noto-sans/
│   ├── NotoSans-Regular-latin.woff2
│   ├── NotoSans-Bold-latin.woff2
│   ├── NotoSans-Italic-latin.woff2
│   └── NotoSans-BoldItalic-latin.woff2
├── noto-sans-arabic/
│   ├── NotoSansArabic-Regular.woff2
│   └── NotoSansArabic-Bold.woff2
├── noto-sans-bengali/
│   ├── NotoSansBengali-Regular.woff2
│   └── NotoSansBengali-Bold.woff2
├── noto-sans-devanagari/
│   ├── NotoSansDevanagari-Regular.woff2
│   └── NotoSansDevanagari-Bold.woff2
├── noto-sans-cyrillic/
│   ├── NotoSans-Regular-cyrillic.woff2
│   └── NotoSans-Bold-cyrillic.woff2
└── noto-sans-sc/
    ├── NotoSansSC-Regular.woff2
    └── NotoSansSC-Bold.woff2
```

### 3.3 Font Source & Generation

| Step | Tool | Output |
|------|------|--------|
| **Download** | Google Fonts API or github.com/googlefonts/noto-fonts | Full TTF/OTF |
| **Subset** | `glyphhanger` or `pyftsubset` (fonttools) | Per-locale woff2 |
| **Optimize** | `woff2_compress` | Highly compressed woff2 |
| **Verify** | ` wakamaifondue` | Unicode coverage report |

---

## 4. Font Subsetting Specification

### 4.1 Latin Subset (English, French)

```bash
# glyphhanger command for Latin subset
glyphhanger \
  --subset=NotoSans-Regular.ttf \
  --formats=woff2 \
  --whitelist=U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD \
  --output-dir=public/fonts/noto-sans/
```

| Property | Value |
|----------|-------|
| **Unicode range** | `U+0000-00FF` (Basic Latin + Latin-1 Supplement) |
| **Characters covered** | A-Z, a-z, 0-9, punctuation, common symbols |
| **File size (Regular)** | ~18 KB |
| **File size (Bold)** | ~18 KB |
| **Total Latin payload** | ~36 KB |

### 4.2 Arabic Subset (RTL)

| Property | Value |
|----------|-------|
| **Unicode range** | `U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF` |
| **Characters covered** | Arabic script, Arabic Presentation Forms |
| **File size (Regular)** | ~20 KB |
| **File size (Bold)** | ~18 KB |
| **Total Arabic payload** | ~38 KB |
| **Special consideration** | RTL shaping; requires `dir="rtl"` |

### 4.3 Bengali Subset

| Property | Value |
|----------|-------|
| **Unicode range** | `U+0980-09FF` |
| **Characters covered** | Bengali script + conjuncts |
| **File size (Regular)** | ~16 KB |
| **File size (Bold)** | ~15 KB |
| **Total Bengali payload** | ~31 KB |

### 4.4 Devanagari Subset (Hindi)

| Property | Value |
|----------|-------|
| **Unicode range** | `U+0900-097F` |
| **Characters covered** | Devanagari script + conjuncts |
| **File size (Regular)** | ~16 KB |
| **File size (Bold)** | ~15 KB |
| **Total Devanagari payload** | ~31 KB |

### 4.5 Cyrillic Subset (Russian)

| Property | Value |
|----------|-------|
| **Unicode range** | `U+0400-045F, U+0490-0491, U+0462-0463` |
| **Characters covered** | Russian alphabet + extended Cyrillic |
| **File size (Regular)** | ~14 KB |
| **File size (Bold)** | ~13 KB |
| **Total Cyrillic payload** | ~27 KB |

### 4.6 CJK Subset (Chinese-Simplified)

> **Challenge:** CJK fonts are inherently large (thousands of glyphs). Subsetting to only used characters is essential.

| Property | Value |
|----------|-------|
| **Approach** | Dynamic subsetting based on content corpus |
| **Tool** | `glyphhanger` with `--spider` crawl of all Chinese content |
| **Estimated coverage** | ~3,000–5,000 glyphs for TwinMOS content |
| **File size (Regular)** | ~40 KB (subset) |
| **File size (Bold)** | ~38 KB (subset) |
| **Total CJK payload** | ~78 KB |
| **Fallback** | System Chinese fonts if subset misses a character |

---

## 5. Font Loading Tactics

### 5.1 Critical Font Preloading

For each locale, preload only the Regular weight (most common):

```html
<!-- English / French / Russian -->
<link 
  rel="preload" 
  href="/fonts/noto-sans/NotoSans-Regular-latin.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin 
/>

<!-- Arabic (loaded only for /ar/* routes) -->
<link 
  rel="preload" 
  href="/fonts/noto-sans-arabic/NotoSansArabic-Regular.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin 
/>
```

### 5.2 CSS Font-Face Declaration

```css
/* Latin */
@font-face {
  font-family: 'Noto Sans';
  src: url('/fonts/noto-sans/NotoSans-Regular-latin.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Noto Sans';
  src: url('/fonts/noto-sans/NotoSans-Bold-latin.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Arabic */
@font-face {
  font-family: 'Noto Sans Arabic';
  src: url('/fonts/noto-sans-arabic/NotoSansArabic-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
}
```

### 5.3 Font Display Strategy: `swap`

| Strategy | Behavior | CLS Risk | FCP Impact | Recommendation |
|----------|----------|----------|------------|----------------|
| **`auto`** | Browser decides | High | Medium | ❌ Avoid |
| **`block`** | 3s invisible text | None (FOIT) | High (delayed text) | ❌ Avoid |
| **`swap`** | Fallback immediately, swap when loaded | Medium (metrics shift) | None | ✅ **Recommended** |
| **`fallback`** | 100ms block, then swap | Low | Low | ⚠️ Optional |
| **`optional`** | 100ms block, then use fallback | None | None | ⚠️ For non-critical |

**Decision:** Use `font-display: swap` for all fonts. Combine with:
- Preloading critical font files
- Matching fallback font metrics
- `size-adjust` in `@font-face` for precise metric matching

### 5.4 Fallback Font Matching

To minimize CLS during font swap, match the fallback font metrics as closely as possible:

```css
/* size-adjust helps match fallback to web font metrics */
@font-face {
  font-family: 'Noto Sans';
  src: url('/fonts/noto-sans/NotoSans-Regular-latin.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  size-adjust: 100%; /* Adjust if fallback metrics differ */
  ascent-override: 95%;
  descent-override: 25%;
  line-gap-override: 0%;
}
```

**Fallback font characteristics:**

| Web Font | Fallback | x-height match | Notes |
|----------|----------|---------------|-------|
| Noto Sans | Arial | Good | Both neo-grotesque sans-serifs |
| Noto Sans Arabic | Tahoma | Good | Common Arabic fallback |
| Noto Sans Bengali | Vrinda | Acceptable | Windows Bengali font |
| Noto Sans Devanagari | Mangal | Acceptable | Windows Hindi font |
| Noto Sans SC | PingFang SC / Microsoft YaHei | Good | System Chinese fonts |

---

## 6. Critical Font Inlining (Optional Advanced)

For the absolute fastest text rendering, the critical font subset (just the characters needed for above-fold content) can be inlined as a Base64 data URI:

```html
<style>
  @font-face {
    font-family: 'Noto Sans Critical';
    src: url(data:font/woff2;base64,...) format('woff2');
    font-weight: 400;
    font-display: block; /* Block briefly since it's already loaded */
  }
</style>
```

> **Use case:** Homepage hero headline only. Expected size: ~5–8 KB. Must be evaluated against budget impact.

---

## 7. RTL (Arabic) Typography Strategy

### 7.1 Arabic Font Loading

| Aspect | Rule |
|--------|------|
| **Font file** | Noto Sans Arabic (subset) |
| **Direction** | `dir="rtl"` on `<html>` for `/ar/*` routes |
| **Font loading** | Preload Arabic font only on Arabic routes |
| **Latin fragments** | `dir="ltr"` inline for SKUs, brand names, technical specs |
| **Numerals** | Default Western digits for product specs; Arabic-Indic optional for UI |

### 7.2 Arabic Layout Considerations

| CSS Property | Value | Purpose |
|-------------|-------|---------|
| `direction` | `rtl` | Text flow |
| `text-align` | `start` | Auto-flips based on direction |
| `margin-inline-start` | Logical property | Replaces `margin-left` |
| `padding-inline-end` | Logical property | Replaces `padding-right` |
| `transform: scaleX(-1)` | On directional icons | Mirror chevrons, arrows |

### 7.3 Arabic Font Size Adjustment

Arabic script typically requires 1–2 px larger font size for equivalent readability:

```css
[lang="ar"] {
  font-size: 1.05rem; /* Slight bump for Arabic */
  line-height: 1.7;   /* Arabic needs more line spacing */
}
```

---

## 8. Font Loading Performance Budget

| Metric | Budget | Measurement |
|--------|--------|-------------|
| **Total font weight per page** | ≤ 120 KB | All subsets combined |
| **Preloaded font files** | ≤ 2 per page | Regular + Bold (if above fold) |
| **Font loading time** | < 100 ms after FCP | Resource Timing API |
| **Font-induced CLS** | 0 | No layout shift from font swap |
| **FCP delay from fonts** | 0 ms | Preload eliminates render block |

---

## 9. Monitoring & Validation

### 9.1 Tools

| Tool | Purpose |
|------|---------|
| **Lighthouse** | Detects render-blocking fonts, missing `font-display` |
| **WebPageTest** | Filmstrip view shows font loading timeline |
| **Sentry RUM** | Tracks font load times in real users |
| **Font Face Observer** | Manual JS detection (if needed for complex loading) |

### 9.2 CI Checks

```bash
# Ensure all @font-face declarations use font-display: swap
grep -r "font-display" src/styles/ || echo "FAIL: Missing font-display"

# Ensure no @import for Google Fonts (must be self-hosted)
grep -r "fonts.googleapis.com" src/ && echo "FAIL: External font request found"

# Check total font weight in dist/
find dist/fonts -name "*.woff2" -exec du -ch {} + | tail -1
```

---

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final strategy |

---

## 11. References

- Tech Stack §22.3 — Performance Optimization Toolkit (Font subsetting)
- Tech Stack §11.4 — RTL Support (Arabic)
- BRD §20.1 — Performance Requirements (CLS targets)
- URD §16 — Multi-script support (Typography)
- URD §32.1 — Perceived Performance Targets
- Google Fonts Noto project: https://fonts.google.com/noto
- `TwinMOSWebsitePerformance_Budget.md`
- `TwinMOSWebsiteCriticalCSSStrategy.md`
