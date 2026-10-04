# TwinMOS Website — Hreflang Implementation Guide

**Document Reference:** TWN-F3-HREFLANG-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Front-End Lead
**Relates To:** Tech Stack §11.6; TwinMOSWebsiteLocalization_Strategy.md; TwinMOSWebsiteURLStructureSpec.md §4

---

## Table of Contents

1. [Hreflang Overview](#1-hreflang-overview)
2. [URL Pattern Table](#2-url-pattern-table)
3. [Complete Hreflang `<link>` Block Template](#3-complete-hreflang-link-block-template)
4. [`x-default` Handling Rules](#4-x-default-handling-rules)
5. [Bidirectional Requirement](#5-bidirectional-requirement)
6. [Astro Implementation](#6-astro-implementation)
7. [Hreflang in XML Sitemap](#7-hreflang-in-xml-sitemap)
8. [Edge Cases](#8-edge-cases)
9. [Validation Tools and Process](#9-validation-tools-and-process)
10. [Common Mistakes and Fixes](#10-common-mistakes-and-fixes)
11. [Phase Rollout](#11-phase-rollout)

---

## 1. Hreflang Overview

### 1.1 What Hreflang Does

The `hreflang` attribute tells search engines which language/region version of a page to serve to users in different locales. Without hreflang:
- A user in India searching in Hindi may receive the English version of a product page.
- Google may treat the different locale versions as duplicate content.

With correct hreflang implementation:
- Google serves the Arabic version to users in the UAE searching in Arabic.
- Each locale version is treated as unique, not duplicate.
- Rankings improve in target markets.

### 1.2 TwinMOS Hreflang Scope

| Phase | Locales Active | Hreflang Tags Required |
|-------|--------------|----------------------|
| P1 | EN only | `hreflang="en"` + `hreflang="x-default"` |
| P2 | EN + AR + BN + HI | 4 × alternates + x-default |
| P3 | EN + AR + BN + HI + RU + ZH-CN + FR | 7 × alternates + x-default |
| P4 | + ES + PT + DE (out of scope) | 10 × alternates + x-default |

---

## 2. URL Pattern Table

| Locale | Code | URL Prefix | Example URL |
|--------|------|-----------|------------|
| English (default) | `en` | `/` | `https://twinmos.com/products/memory/ddr5/` |
| Arabic | `ar` | `/ar/` | `https://twinmos.com/ar/products/memory/ddr5/` |
| Hindi | `hi` | `/hi/` | `https://twinmos.com/hi/products/memory/ddr5/` |
| Russian | `ru` | `/ru/` | `https://twinmos.com/ru/products/memory/ddr5/` |
| Chinese Simplified | `zh-CN` | `/zh-CN/` | `https://twinmos.com/zh-CN/products/memory/ddr5/` |
| French | `fr` | `/fr/` | `https://twinmos.com/fr/products/memory/ddr5/` |

**Key rules:**
- English has no prefix — it is served at the root path.
- `zh-CN` uses the full BCP 47 code with hyphen and capitalisation — match exactly in hreflang attributes.
- All URLs use `https://` (never `http://`).

---

## 3. Complete Hreflang `<link>` Block Template

### 3.1 Phase 1 (English Only)

```html
<!-- Phase 1: EN only -->
<link rel="alternate" hreflang="en"        href="https://twinmos.com/products/memory/ddr5/" />
<link rel="alternate" hreflang="x-default" href="https://twinmos.com/products/memory/ddr5/" />
```

### 3.2 Phase 2 (EN + AR + BN + HI)

```html
<link rel="alternate" hreflang="en"        href="https://twinmos.com/products/memory/ddr5/" />
<link rel="alternate" hreflang="ar"        href="https://twinmos.com/ar/products/memory/ddr5/" />
<link rel="alternate" hreflang="bn"        href="https://twinmos.com/bn/products/memory/ddr5/" />
<link rel="alternate" hreflang="hi"        href="https://twinmos.com/hi/products/memory/ddr5/" />
<link rel="alternate" hreflang="x-default" href="https://twinmos.com/products/memory/ddr5/" />
```

### 3.3 Phase 3 (EN + AR + BN + HI + RU + ZH-CN + FR)

```html
<link rel="alternate" hreflang="en"        href="https://twinmos.com/products/memory/ddr5/" />
<link rel="alternate" hreflang="ar"        href="https://twinmos.com/ar/products/memory/ddr5/" />
<link rel="alternate" hreflang="bn"        href="https://twinmos.com/bn/products/memory/ddr5/" />
<link rel="alternate" hreflang="hi"        href="https://twinmos.com/hi/products/memory/ddr5/" />
<link rel="alternate" hreflang="ru"        href="https://twinmos.com/ru/products/memory/ddr5/" />
<link rel="alternate" hreflang="zh-CN"     href="https://twinmos.com/zh-CN/products/memory/ddr5/" />
<link rel="alternate" hreflang="fr"        href="https://twinmos.com/fr/products/memory/ddr5/" />
<link rel="alternate" hreflang="x-default" href="https://twinmos.com/products/memory/ddr5/" />
```

---

## 4. `x-default` Handling Rules

### 4.1 What `x-default` Means

`hreflang="x-default"` designates the fallback page to serve when no other locale matches the user's language settings. It should point to the most universally accessible version — for TwinMOS, this is the English page.

### 4.2 Rules

- `x-default` always points to the **English (no-prefix) URL**.
- `x-default` is included on **every page** regardless of phase — even Phase 1 (EN only).
- When a new locale is launched, the `x-default` URL does not change — it always remains the EN URL.

### 4.3 Do NOT use `x-default` for a regional selector page

TwinMOS does not use a locale/language selector landing page. The English version is the canonical global default.

---

## 5. Bidirectional Requirement

### 5.1 The Rule

Hreflang is only valid when it is **bidirectional**: every locale page must reference all other locale pages, and every other locale page must reference it back.

**Example (required bidirectional linking):**

The English product page `/products/memory/ddr5/` lists:
```html
<link rel="alternate" hreflang="en" href="https://twinmos.com/products/memory/ddr5/" />
<link rel="alternate" hreflang="ar" href="https://twinmos.com/ar/products/memory/ddr5/" />
```

The Arabic product page `/ar/products/memory/ddr5/` **must also** list:
```html
<link rel="alternate" hreflang="en" href="https://twinmos.com/products/memory/ddr5/" />
<link rel="alternate" hreflang="ar" href="https://twinmos.com/ar/products/memory/ddr5/" />
```

If the Arabic page does not reference back to the English page, Google ignores the hreflang signal on both pages.

### 5.2 Implementation Approach

Astro's `@astrojs/sitemap` with the `i18n` configuration generates all `<xhtml:link>` entries automatically, and the `<BaseHead />` component generates hreflang `<link>` tags for all active locales on each page. This ensures bidirectionality without manual maintenance.

---

## 6. Astro Implementation

### 6.1 Astro i18n Configuration

```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'bn', 'hi', 'ru', 'zh-CN', 'fr'],
    routing: {
      prefixDefaultLocale: false,  // EN at root (no /en/ prefix)
    }
  }
});
```

### 6.2 Hreflang Generator Utility

```typescript
// src/lib/seo/hreflang.ts

const ACTIVE_LOCALES_BY_PHASE: Record<string, string[]> = {
  P1: ['en'],
  P2: ['en', 'ar', 'bn', 'hi'],
  P3: ['en', 'ar', 'bn', 'hi', 'ru', 'zh-CN', 'fr'],
};

// Current deployment phase — set in environment variable
const CURRENT_PHASE = import.meta.env.DEPLOY_PHASE ?? 'P1';
const ACTIVE_LOCALES = ACTIVE_LOCALES_BY_PHASE[CURRENT_PHASE];

export function buildHreflangUrls(pathname: string): Record<string, string> {
  const BASE = 'https://twinmos.com';
  const urls: Record<string, string> = {};

  for (const locale of ACTIVE_LOCALES) {
    if (locale === 'en') {
      urls['en'] = `${BASE}${pathname}`;
      urls['x-default'] = `${BASE}${pathname}`;
    } else {
      // Strip existing locale prefix if present, then add new one
      const cleanPath = pathname.replace(/^\/(ar|bn|hi|ru|zh-CN|fr)\//, '/');
      urls[locale] = `${BASE}/${locale}${cleanPath}`;
    }
  }
  return urls;
}
```

### 6.3 BaseHead Component Hreflang Rendering

```astro
---
// src/components/seo/BaseHead.astro
const hreflangUrls = buildHreflangUrls(Astro.url.pathname);
---

{Object.entries(hreflangUrls).map(([lang, url]) => (
  <link rel="alternate" hreflang={lang} href={url} />
))}
```

### 6.4 Locale Detection Logic

When a user visits `twinmos.com` without a locale prefix, the detection hierarchy is:
1. URL prefix (most authoritative — used once user has selected a locale).
2. Cookie `twinmos-locale` (set by LanguageSelector island on user's first manual selection).
3. `Accept-Language` HTTP header.
4. IP-geolocation via Cloudflare Workers (fallback — maps country to locale).
5. Default: English.

---

## 7. Hreflang in XML Sitemap

All per-locale sitemaps include `<xhtml:link>` elements that mirror the `<link rel="alternate">` tags from the `<head>`. See `TwinMOSWebsiteXMLSitemapStrategy.md §7` for the full implementation.

**Example entry in `sitemap-en.xml`:**
```xml
<url>
  <loc>https://twinmos.com/products/memory/ddr5/</loc>
  <xhtml:link rel="alternate" hreflang="en"
              href="https://twinmos.com/products/memory/ddr5/" />
  <xhtml:link rel="alternate" hreflang="ar"
              href="https://twinmos.com/ar/products/memory/ddr5/" />
  <xhtml:link rel="alternate" hreflang="bn"
              href="https://twinmos.com/bn/products/memory/ddr5/" />
  <xhtml:link rel="alternate" hreflang="hi"
              href="https://twinmos.com/hi/products/memory/ddr5/" />
  <xhtml:link rel="alternate" hreflang="x-default"
              href="https://twinmos.com/products/memory/ddr5/" />
</url>
```

The equivalent entry must appear in `sitemap-ar.xml` for the Arabic URL, referencing all locale variants. `@astrojs/sitemap` handles this automatically when the `i18n` config is correct.

---

## 8. Edge Cases

### 8.1 Pages Only Available in English (Phase 1)

During Phase 1, only English content exists. Hreflang for P1-only pages:

```html
<link rel="alternate" hreflang="en"        href="https://twinmos.com/[page]/" />
<link rel="alternate" hreflang="x-default" href="https://twinmos.com/[page]/" />
```

Do NOT add `hreflang="ar"` for a page that has no Arabic translation yet. Adding an `hreflang` tag pointing to a non-existent page causes a hreflang error in Google Search Console.

**When Phase 2 launches:** The Astro build automatically adds the additional locale tags once the locale routes are included in the build.

### 8.2 Pages Not Translated in a Given Locale

If a specific page (e.g., a legacy press release) is not translated into Arabic but the site is otherwise in Phase 2:
- Option A (preferred): Do not include the page in the Arabic locale at all — no Arabic URL exists, no hreflang for Arabic on this page.
- Option B: Point the Arabic hreflang to the English page (Google's documentation allows this but it can confuse users and signals to Google that you have not localised the page).
- **TwinMOS decision: Option A.** Untranslated pages are EN-only and have EN + x-default hreflang only.

### 8.3 Region-Specific vs Language-Specific Targeting

TwinMOS does not target country-specific locales (e.g., `en-GB`, `ar-AE`) — only language locales (`en`, `ar`, `hi`). This is appropriate because:
- The product catalog and pricing are not country-specific at P1/P2.
- Country-level targeting adds implementation complexity without sufficient benefit.
- Google Business Profile and regional landing pages handle country-level signals separately.

### 8.4 `zh-CN` vs `zh-TW` vs `zh`

TwinMOS targets only `zh-CN` (Simplified Chinese — mainland China, Singapore). Traditional Chinese (`zh-TW`) is not in scope. Do not use the generic `zh` tag — be specific with `zh-CN`.

---

## 9. Validation Tools and Process

### 9.1 Pre-Launch Validation

1. **Hreflang Tag Testing Tool** by Aleyda Solis: `https://www.aleydasolis.com/english/international-seo-tools/hreflang-tags-generator/`
   - Use to generate and verify tag pairs.
2. **Screaming Frog SEO Spider** → Configuration → Hreflang:
   - Crawl the site; Screaming Frog will report hreflang errors, missing return tags, unconfirmed hreflang (return tag present but not matching), and incorrect hreflang values.
3. **Google Search Console → International Targeting**:
   - After launch, GSC reports hreflang errors discovered during crawl. Monitor weekly during Phase 2 launch month.

### 9.2 Post-Launch Checks (Monthly)

- GSC → International Targeting → Hreflang errors — must be zero.
- GSC → Coverage → check that locale-prefixed URLs are being indexed by Google.
- Ahrefs Site Audit → check for hreflang issues.

### 9.3 Validation Checklist

- [ ] Every active locale page has `hreflang` tags for all active locales.
- [ ] Every active locale page has `hreflang="x-default"`.
- [ ] All `x-default` tags point to the EN URL.
- [ ] No `hreflang` tag points to a non-existent URL.
- [ ] Hreflang tags are bidirectional (verified by Screaming Frog).
- [ ] `zh-CN` uses the correct BCP 47 code (capital C, capital N).
- [ ] Sitemap `<xhtml:link>` entries match the `<head>` hreflang tags.
- [ ] GSC International Targeting report shows zero errors.

---

## 10. Common Mistakes and Fixes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Missing `x-default` | Google may not know which page to serve to unmatched users | Add `hreflang="x-default"` pointing to EN URL on every page |
| Non-bidirectional hreflang | Google ignores all hreflang signals on affected pages | Ensure every referenced locale page references back |
| Pointing to non-existent URL | Google ignores that hreflang signal; may crawl 404 | Only add hreflang for locales that are live |
| Using country codes (`hreflang="ae"`) instead of language codes | No standard meaning in hreflang | Use language codes: `en`, `ar`, `hi`, not country codes |
| Using wrong `zh` value | May serve Traditional Chinese to Simplified Chinese audience | Use `zh-CN` not `zh` or `zh-TW` |
| Hreflang only in sitemap, not `<head>` | GSC may or may not pick up sitemap-only hreflang | Include in both `<head>` and sitemap for redundancy |
| Adding hreflang for a locale before translation is ready | Serves EN content to users expecting the locale language | Only add hreflang when the translated page is published |
| HTTP in hreflang URLs | Mixed content; outdated URL in signals | All hreflang URLs must use `https://` |
| Trailing slash inconsistency | Duplicate signal confusion | Match the canonical URL exactly (with or without trailing slash — TwinMOS uses trailing slash) |

---

## 11. Phase Rollout

### Phase 1 — Launch (Month 5)

- Implement EN + x-default hreflang on all 287 pages.
- Verify via GSC International Targeting (no errors expected with EN-only).
- No locale sitemaps beyond `sitemap-en.xml`.

### Phase 2 — AR, BN, HI (Months 6–9)

**Pre-launch:**
1. Verify all translated pages are published in Strapi (status: Published).
2. Confirm Astro build generates `/ar/`, `/bn/`, `/hi/` routes.
3. Add AR, BN, HI to `ACTIVE_LOCALES` via `DEPLOY_PHASE=P2` environment variable.
4. Deploy and validate with Screaming Frog hreflang report.
5. Submit per-locale sitemaps to GSC.

**Post-launch:**
- Monitor GSC International Targeting weekly for 4 weeks.
- Verify Google is indexing `/ar/`, `/bn/`, `/hi/` URLs (GSC Coverage).

### Phase 3 — RU, ZH-CN, FR (Months 10–15)

Same process as Phase 2. Additionally:
- Verify Baidu Webmaster Tools setup for `zh-CN`.
- Run locale QA checklist for Cyrillic, CJK, and Latin-extension character rendering.

---

*Related: [Localization Strategy](../F.4%20-%20Localization/TwinMOSWebsiteLocalization_Strategy.md) | [XML Sitemap Strategy](TwinMOSWebsiteXMLSitemapStrategy.md) | [URL Structure Spec](TwinMOSWebsiteURLStructureSpec.md) | [Meta Tag Templates](TwinMOSWebsiteMetaTagTemplates.md)*
