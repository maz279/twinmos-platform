# TwinMOS Website — RTL Implementation Guide (Arabic Locale)

**Document Reference:** TWN-F4-RTL-2026-001
**Version:** 1.0
**Status:** Approved
**Owner:** Frontend Developer / Localization Lead
**Last Updated:** 1 May 2026
**Target Phase:** Phase 2 (Arabic locale — Month 6, June 2026)
**Related Documents:** TWN-F4-L10N-2026-001 (Localization Strategy), TWN-TECHSTACK-2026-001 §7 (Astro + Tailwind), TWN-F4-LQAC-2026-001 (Locale QA Checklist)

---

## Table of Contents

1. [Overview and Scope](#1-overview-and-scope)
2. [HTML-Level RTL Setup in Astro](#2-html-level-rtl-setup-in-astro)
3. [CSS Strategy — Tailwind RTL Modifier and Logical Properties](#3-css-strategy--tailwind-rtl-modifier-and-logical-properties)
4. [Physical vs. Logical Property Reference](#4-physical-vs-logical-property-reference)
5. [Arabic Typography](#5-arabic-typography)
6. [Icon and SVG Mirroring](#6-icon-and-svgmirroring)
7. [Form Fields and Input Handling](#7-form-fields-and-input-handling)
8. [Floating UI Components](#8-floating-ui-components)
9. [Tables](#9-tables)
10. [Date, Time, and Number Formatting](#10-date-time-and-number-formatting)
11. [LTR Islands Inside RTL Pages](#11-ltr-islands-inside-rtl-pages)
12. [Navigation and Mega-Menu Adaptation](#12-navigation-and-mega-menu-adaptation)
13. [Component-by-Component RTL Checklist](#13-component-by-component-rtl-checklist)
14. [Testing Tools and Process](#14-testing-tools-and-process)
15. [Known Issues and Workarounds](#15-known-issues-and-workarounds)

---

## 1. Overview and Scope

The Arabic (`ar`) locale requires **Right-to-Left (RTL)** layout throughout the entire TwinMOS website. RTL affects not only text direction but the spatial layout of every component — margins, paddings, borders, flex/grid direction, icon orientation, table column order, and floating UI placement all reverse.

**In scope:** All pages under `/ar/` prefix (Phase 2+).

**Out of scope:** All other locales (EN, HI, RU, ZH-CN, FR) use LTR layout. Even though Hindi uses a non-Latin script, its writing direction is left-to-right.

**Technology stack relevant to RTL:**
- Astro 5 (page/component framework)
- Tailwind CSS v3 (utility classes + `rtl:` modifier)
- CSS Logical Properties (supported in all modern browsers)
- Noto Sans Arabic (Google Fonts, loaded only for Arabic locale)

**Implementation timeline:** RTL work must begin by **Month 4** (April 2026) to allow development and QA time before the Phase 2 Arabic launch in **Month 6** (June 2026).

---

## 2. HTML-Level RTL Setup in Astro

### 2.1 Setting `dir="rtl"` and `lang="ar"`

The `dir` attribute on the `<html>` element is the root instruction for RTL layout. It cascades to all child elements.

In Astro, the root layout component must be locale-aware:

```astro
---
// src/layouts/BaseLayout.astro
const { locale = 'en' } = Astro.props;
const isRTL = locale === 'ar';
---
<!DOCTYPE html>
<html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
  <head>
    <meta charset="UTF-8">
    <!-- BaseHead component handles meta, hreflang, fonts -->
    <BaseHead locale={locale} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

For Astro i18n routing, `Astro.currentLocale` provides the active locale:

```astro
---
// src/pages/[locale]/index.astro
const locale = Astro.currentLocale ?? 'en';
const isRTL = locale === 'ar';
---
<BaseLayout locale={locale}>
  <!-- page content -->
</BaseLayout>
```

### 2.2 Tailwind Configuration for RTL

Tailwind's `rtl:` modifier activates automatically when `dir="rtl"` is set on a parent element. No additional Tailwind configuration is required — the `rtl:` and `ltr:` variants are built in as of Tailwind v3.

Enable Tailwind's logical property support in `tailwind.config.mjs`:

```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,svelte}'],
  theme: { extend: {} },
  plugins: [],
  // No special RTL configuration needed — rtl: modifier is built-in
}
```

---

## 3. CSS Strategy — Tailwind RTL Modifier and Logical Properties

There are two complementary approaches to RTL in Tailwind:

### Approach A — Tailwind `rtl:` Modifier (Recommended for Most Cases)

Use the `rtl:` prefix to apply a utility only when the page direction is RTL:

```html
<!-- Margin on the right in LTR; margin on the left in RTL -->
<div class="mr-4 rtl:mr-0 rtl:ml-4">...</div>

<!-- Icon faces left by default; mirror it in RTL -->
<svg class="rtl:scale-x-[-1]">...</svg>

<!-- Text aligned left in LTR; right in RTL -->
<p class="text-left rtl:text-right">...</p>
```

### Approach B — CSS Logical Properties (Preferred for New Components)

Logical properties automatically adapt to text direction — write them once, they work in both LTR and RTL:

| Physical Property | Logical Equivalent | Behaviour |
|---|---|---|
| `margin-left` | `margin-inline-start` | Left in LTR, Right in RTL |
| `margin-right` | `margin-inline-end` | Right in LTR, Left in RTL |
| `padding-left` | `padding-inline-start` | Left in LTR, Right in RTL |
| `padding-right` | `padding-inline-end` | Right in LTR, Left in RTL |
| `border-left` | `border-inline-start` | Left in LTR, Right in RTL |
| `border-right` | `border-inline-end` | Right in LTR, Left in RTL |
| `left: 0` | `inset-inline-start: 0` | Left in LTR, Right in RTL |
| `right: 0` | `inset-inline-end: 0` | Right in LTR, Left in RTL |
| `text-align: left` | `text-align: start` | Start edge in both directions |
| `text-align: right` | `text-align: end` | End edge in both directions |
| `border-top-left-radius` | `border-start-start-radius` | Logical corner |
| `border-top-right-radius` | `border-start-end-radius` | Logical corner |
| `float: left` | `float: inline-start` | Start edge |
| `float: right` | `float: inline-end` | End edge |

In Tailwind CSS v3, logical property utilities are available:
- `ms-4` = `margin-inline-start: 1rem`
- `me-4` = `margin-inline-end: 1rem`
- `ps-4` = `padding-inline-start: 1rem`
- `pe-4` = `padding-inline-end: 1rem`
- `start-0` = `inset-inline-start: 0`
- `end-0` = `inset-inline-end: 0`
- `text-start` = `text-align: start`
- `text-end` = `text-align: end`

**Recommendation:** For new components (Month 4+ work), use logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`). For existing EN components that need RTL support retrofitted, use the `rtl:` modifier to minimise diff.

---

## 4. Physical vs. Logical Property Reference

The following table is the canonical reference for converting existing LTR-only component code to RTL-safe code:

### 4.1 Spacing Conversion

| LTR Tailwind Class | RTL-Safe Alternative | Notes |
|---|---|---|
| `ml-{n}` | `ms-{n}` | Logical inline-start margin |
| `mr-{n}` | `me-{n}` | Logical inline-end margin |
| `pl-{n}` | `ps-{n}` | Logical inline-start padding |
| `pr-{n}` | `pe-{n}` | Logical inline-end padding |
| `ml-auto` | `ms-auto` | Auto inline-start margin (common for right-align in LTR) |
| `space-x-{n}` | Use `gap-{n}` with flex/grid | `space-x-*` doesn't flip; use gap |

### 4.2 Position Conversion

| LTR Tailwind Class | RTL-Safe Alternative |
|---|---|
| `left-0` | `start-0` |
| `right-0` | `end-0` |
| `left-{n}` | `start-{n}` |
| `right-{n}` | `end-{n}` |

### 4.3 Text Alignment

| LTR Class | RTL-Safe Alternative | Notes |
|---|---|---|
| `text-left` | `text-start` | Aligns to reading start |
| `text-right` | `text-end` | Aligns to reading end |
| `text-center` | `text-center` | No change needed |

### 4.4 Border Conversion

| LTR Class | RTL-Safe Alternative |
|---|---|
| `border-l-{n}` | `border-s-{n}` |
| `border-r-{n}` | `border-e-{n}` |
| `rounded-l-{n}` | `rounded-s-{n}` |
| `rounded-r-{n}` | `rounded-e-{n}` |
| `rounded-tl-{n}` | `rounded-ss-{n}` |
| `rounded-tr-{n}` | `rounded-se-{n}` |
| `rounded-bl-{n}` | `rounded-es-{n}` |
| `rounded-br-{n}` | `rounded-ee-{n}` |

---

## 5. Arabic Typography

### 5.1 Font Loading

Arabic text requires a font that includes the Arabic Unicode block (U+0600–U+06FF). The selected font is **Noto Sans Arabic** from Google Fonts.

Load Arabic fonts only on Arabic pages to avoid performance overhead on all other locales:

```astro
---
// src/components/BaseHead.astro
const { locale } = Astro.props;
---
{locale === 'ar' && (
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  >
)}
```

Alternatively, self-host via the Backblaze B2 CDN (`cdn.twinmos.com`) to eliminate the Google Fonts third-party request:

```css
/* Arabic-only stylesheet: /public/fonts/arabic.css */
@font-face {
  font-family: 'Noto Sans Arabic';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('https://cdn.twinmos.com/fonts/noto-sans-arabic/NotoSansArabic-Variable.woff2')
       format('woff2');
  unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF;
}
```

### 5.2 Font Stack in Tailwind Config

```javascript
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter var',          // Primary: all LTR locales
          'Noto Sans Arabic',   // Arabic fallback
          'system-ui',
          'sans-serif'
        ],
      }
    }
  }
}
```

### 5.3 Font Size Adjustments for Arabic

Arabic script renders approximately **8–12% larger** than Latin text at the same `font-size`. This can cause layout overflow if not accounted for. Options:

**Option A — Arabic-specific font size:**
```css
:lang(ar) {
  font-size: 0.95rem; /* slightly reduce to compensate for visual size */
}
```

**Option B — Override per heading level in Tailwind:**
```html
<h1 class="text-4xl rtl:text-3xl">عنوان المنتج</h1>
```

Use Option A globally with Option B for specific headings that overflow.

### 5.4 Line Height for Arabic

Arabic text with diacritics (harakat) requires additional line height:

```css
:lang(ar) {
  line-height: 1.8; /* vs. 1.5 for Latin */
}
```

In Tailwind: `leading-relaxed` (1.625) is acceptable; `leading-loose` (2) may be too spacious for body text.

---

## 6. Icon and SVG Mirroring

### 6.1 Which Icons to Mirror

Directional icons (those that indicate a direction of movement or progress) must be horizontally mirrored in RTL:

| Icon Type | Mirror in RTL? | Examples |
|---|---|---|
| Arrow pointing right | ✅ Yes | "Next" arrow, "proceed" CTA |
| Arrow pointing left | ✅ Yes | "Back" arrow, "previous" |
| Chevron right | ✅ Yes | Breadcrumb separator, accordion expand |
| Chevron left | ✅ Yes | Back navigation, carousel previous |
| Back button | ✅ Yes | Browser-style back arrow |
| Forward button | ✅ Yes | Browser-style forward arrow |
| List item bullet (triangle) | ✅ Yes | If triangle points right |
| Progress indicator | ✅ Yes | If directionality implied |
| Home icon | ❌ No | Symmetric — no direction |
| Search icon (magnifying glass) | ❌ No | Symmetric |
| Cart / basket icon | ❌ No | Symmetric |
| User / account icon | ❌ No | Symmetric |
| Settings / gear icon | ❌ No | Symmetric |
| Logo (TwinMOS) | ❌ No | Brand asset — never mirror |
| Product images | ❌ No | Real-world objects don't mirror |
| Flag icons | ❌ No | Never mirror flags |

### 6.2 Mirror Implementation

Use Tailwind `rtl:` modifier:
```html
<svg class="w-5 h-5 rtl:scale-x-[-1]" aria-hidden="true">
  <!-- right-pointing chevron SVG path -->
</svg>
```

Or use a CSS class:
```css
[dir="rtl"] .icon-directional {
  transform: scaleX(-1);
}
```

### 6.3 CSS `transform: scaleX(-1)` vs. CSS `rotate(180deg)`

- `scaleX(-1)` — mirrors horizontally (correct for directional arrows and chevrons)
- `rotate(180deg)` — flips 180°, also mirroring vertically (wrong for most icons)

Use `scaleX(-1)` exclusively for icon mirroring.

---

## 7. Form Fields and Input Handling

### 7.1 Text Input Direction

Text inputs in Arabic should be right-aligned with RTL text entry:

```html
<!-- For Arabic text fields -->
<input type="text" dir="auto" class="text-start">
```

Use `dir="auto"` to allow the browser to detect direction from the first character typed. This handles mixed-content fields correctly (e.g., a field where a user types their email in English inside an Arabic form).

### 7.2 Number Inputs Stay LTR

Phone numbers, quantities, part numbers, and other numeric inputs should remain LTR even on Arabic pages:

```html
<input type="tel" dir="ltr" inputmode="numeric" class="text-left">
<input type="number" dir="ltr">
```

### 7.3 Search Field

The search input should use `dir="auto"`:

```html
<input
  type="search"
  dir="auto"
  placeholder="ابحث عن منتج..."
  class="w-full ps-4 pe-10 rtl:pe-4 rtl:ps-10"
>
<!-- Search icon positioned at inline-end in RTL -->
<button class="absolute end-0 inset-y-0 flex items-center pe-3">
  <SearchIcon />
</button>
```

### 7.4 Form Labels

Labels should appear to the right of inputs in RTL:

```html
<div class="flex items-center gap-2 rtl:flex-row-reverse">
  <input type="checkbox" id="subscribe">
  <label for="subscribe">اشترك في النشرة</label>
</div>
```

Or more cleanly with logical properties:
```html
<label class="flex items-center gap-2">
  <input type="checkbox">
  <span>اشترك في النشرة</span>
</label>
```
Flex row naturally reverses with `dir="rtl"`, placing the checkbox on the right.

### 7.5 Validation Messages

Error and success messages use `text-start`:

```html
<p class="text-sm text-red-600 text-start">الرجاء إدخال بريد إلكتروني صحيح</p>
```

---

## 8. Floating UI Components

Components that use `@floating-ui/dom` (tooltips, dropdowns, popovers, select menus) position relative to their anchor using `placement` props. In RTL, `start` and `end` placements automatically adapt to direction when using Floating UI's middleware.

### 8.1 Floating UI Configuration for RTL

```typescript
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

// Use logical placements ('start', 'end') not physical ('left', 'right')
const { x, y } = await computePosition(button, tooltip, {
  placement: 'bottom-start', // This correctly becomes bottom-right in RTL
  middleware: [
    offset(8),
    flip(),
    shift({ padding: 8 })
  ]
});
```

### 8.2 Dropdown Menu Direction

Dropdown menus should open toward the reading end:

```html
<!-- In RTL, this dropdown menu appears below and to the LEFT of the trigger (end edge) -->
<div class="relative">
  <button>خيارات</button>
  <ul class="absolute end-0 top-full mt-1 ...">
    <!-- menu items -->
  </ul>
</div>
```

### 8.3 Tooltip Arrow Direction

If tooltips have an arrow/caret, mirror the arrow position in RTL using the `rtl:` modifier or logical properties.

---

## 9. Tables

HTML tables respect the `dir` attribute set on `<html>` — when `dir="rtl"`, columns are ordered right to left, and text within cells is right-aligned.

### 9.1 Table Behaviour in RTL

```html
<!-- In RTL, first column appears on the RIGHT -->
<table>
  <thead>
    <tr>
      <th class="text-start">المواصفة</th>
      <th class="text-start">القيمة</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-start">السرعة</td>
      <td class="text-start">6000 MT/s</td>
    </tr>
  </tbody>
</table>
```

### 9.2 Numeric Columns

Technical specification values (speeds, capacities) should remain in LTR order even in RTL tables:

```html
<td dir="ltr" class="text-end">6000 MT/s</td>
```

Using `dir="ltr"` on the cell keeps the value order correct; `text-end` aligns it to the right edge of the cell (which is correct for a numeric column in RTL).

### 9.3 Stripe Patterns

Table row stripe patterns (alternate background colours) work regardless of direction — no change needed.

---

## 10. Date, Time, and Number Formatting

### 10.1 Date Formatting with Day.js

```typescript
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

// Set Arabic locale
dayjs.locale('ar');

// Format dates for display
dayjs('2026-05-01').format('D MMMM YYYY');
// → "١ مايو ٢٠٢٦" (Arabic-Indic digits + Arabic month name)
```

For product spec dates (release dates, warranty expiry) and dates in metadata, use ISO 8601 (`YYYY-MM-DD`) — a locale-independent format.

### 10.2 Number Formatting with Intl

**Product specifications use Western (ASCII) digits** — do not convert product specs to Arabic-Indic numerals:

```typescript
// CORRECT: Keep product specs in Western digits
'6000 MT/s';
'32 GB';

// Use Intl for Arabic prose numerals (optional, context-dependent)
const formatter = new Intl.NumberFormat('ar-EG');
formatter.format(6000); // → "٦٬٠٠٠"
```

Default to Western digits (`ar-u-nu-latn`) for all product data and technical specs:

```typescript
const technicalFormatter = new Intl.NumberFormat('ar-SA-u-nu-latn');
technicalFormatter.format(6000); // → "6,000" (Western digits, Arabic thousands separator)
```

### 10.3 Currency Formatting

```typescript
const currencyFormatter = new Intl.NumberFormat('ar-AE', {
  style: 'currency',
  currency: 'AED',
  currencyDisplay: 'symbol'
});
currencyFormatter.format(299); // → "د.إ.‏ 299.00"
```

### 10.4 `<time>` Element Direction

Use `dir="ltr"` on `<time>` elements displaying ISO dates:

```html
<time datetime="2026-05-01" dir="ltr">1 May 2026</time>
```

If displaying the localised Arabic date, omit `dir="ltr"`:

```html
<time datetime="2026-05-01">١ مايو ٢٠٢٦</time>
```

---

## 11. LTR Islands Inside RTL Pages

Certain content must remain LTR even on Arabic pages:

| Content Type | Implementation |
|---|---|
| Product SKU codes | `<span dir="ltr">MDD564GB6000HC30ABRGB</span>` |
| URLs and domain names | `<span dir="ltr">twinmos.com/products/</span>` |
| Email addresses | `<span dir="ltr">support@twinmos.com</span>` |
| Phone numbers | `<span dir="ltr">+971 4 XXX XXXX</span>` |
| Brand names in Latin (TwinMOS, VOLTX) | Naturally LTR; Arabic script around them handles bidi |
| Code snippets | `<code dir="ltr">npm install</code>` |
| Version numbers | `<span dir="ltr">v3.0.1</span>` |
| Social media handles | `<span dir="ltr">@TwinMOS</span>` |
| Technical spec values | `<td dir="ltr">6000 MT/s</td>` |

The Unicode Bidirectional Algorithm (BiDi) handles short Latin strings embedded in Arabic text automatically in most cases. Use explicit `dir="ltr"` only when the automatic BiDi detection fails or produces incorrect rendering.

---

## 12. Navigation and Mega-Menu Adaptation

### 12.1 Top Navigation Bar

In RTL, the logo should remain in its standard position (top-left in LTR → becomes top-right in RTL due to `dir="rtl"`). The hamburger menu moves to the left. Navigation links flow right-to-left.

```html
<header class="flex items-center justify-between px-6">
  <!-- Logo: naturally at start edge (right in RTL) -->
  <a href="/" class="flex-shrink-0">
    <img src="/logo.svg" alt="TwinMOS">
  </a>
  <!-- Nav links: flow from start edge -->
  <nav class="flex items-center gap-6">
    <a href="/ar/products/">المنتجات</a>
    <a href="/ar/learn/">تعلّم</a>
    <a href="/ar/support/">الدعم</a>
  </nav>
  <!-- Utilities: at end edge (left in RTL) -->
  <div class="flex items-center gap-4">
    <button aria-label="بحث"><SearchIcon /></button>
    <LocaleSelector />
    <button aria-label="القائمة" class="md:hidden"><MenuIcon /></button>
  </div>
</header>
```

Using `justify-between` with `dir="rtl"` automatically puts the logo on the right and utilities on the left without any `rtl:` overrides.

### 12.2 Mega-Menu Panel

Mega-menu panels that open below a nav item should expand toward the start edge in RTL:

```html
<div class="absolute start-0 top-full w-screen max-w-3xl bg-white shadow-lg">
  <!-- mega menu content -->
</div>
```

`start-0` positions the panel at the right edge of the viewport in RTL.

### 12.3 Breadcrumbs

Breadcrumb separators (chevrons or slashes) must face the correct direction:

```html
<!-- Breadcrumb separator -->
<li class="flex items-center">
  <a href="/ar/products/">المنتجات</a>
  <ChevronRight class="mx-2 rtl:scale-x-[-1] text-gray-400" />
  <a href="/ar/products/memory/">الذاكرة</a>
</li>
```

The BreadcrumbList schema is direction-independent (it contains URLs, not directional content) — no RTL changes needed for structured data.

### 12.4 Mobile Navigation (Sidebar Drawer)

The mobile navigation drawer should slide in from the right (start edge) in RTL:

```css
/* LTR: drawer slides from left */
.drawer { transform: translateX(-100%); }
.drawer.open { transform: translateX(0); }

/* RTL: drawer slides from right */
[dir="rtl"] .drawer { transform: translateX(100%); }
[dir="rtl"] .drawer.open { transform: translateX(0); }
```

In Tailwind:
```html
<nav class="fixed inset-y-0 start-0 w-72 -translate-x-full rtl:translate-x-full
            transition-transform data-[open]:translate-x-0">
```

---

## 13. Component-by-Component RTL Checklist

Use this checklist during development and QA for each component:

### Header
- [ ] Logo positioned at start edge (right in RTL)
- [ ] Nav links flow right-to-left
- [ ] Search icon at end edge (left in RTL)
- [ ] Hamburger menu at end edge (left in RTL)
- [ ] Locale selector accessible and correct

### Footer
- [ ] Logo at start edge
- [ ] Footer columns reflow correctly in RTL
- [ ] Social media links at end edge
- [ ] Copyright text right-aligned

### Product Card
- [ ] Product image centred or at start edge
- [ ] Title and price text right-aligned
- [ ] "View details" CTA arrow mirrored
- [ ] Border/shadow on correct edge

### Product Hero Section
- [ ] Text block at start edge (right)
- [ ] Product image at end edge (left)
- [ ] CTA button arrow mirrored
- [ ] Badge/label positioning correct

### Breadcrumb
- [ ] Items flow right to left
- [ ] Separator chevrons mirrored
- [ ] Home icon at start (right)

### Specification Table
- [ ] Column order reversed (spec name on right, value on left)
- [ ] Technical values remain in Western digit order with `dir="ltr"` on cells

### Pagination
- [ ] "Previous" and "Next" arrows mirrored
- [ ] Page number sequence reads right-to-left

### Form (Contact, RMA, Newsletter)
- [ ] Labels right-aligned
- [ ] Input text entry right-to-left
- [ ] Numeric/email fields remain LTR
- [ ] Error messages right-aligned
- [ ] Submit button at end edge (left) or full-width

### Modal / Dialog
- [ ] Close (×) button at start edge (left in RTL → changes to right? No: close button is typically at top-right in LTR → top-left in RTL)
- [ ] Content text right-aligned
- [ ] Action buttons (Cancel | Confirm) reversed in order

### Carousel / Slider
- [ ] Slide navigation arrows mirrored
- [ ] Auto-scroll direction reversed (right-to-left in RTL)
- [ ] Dot indicators still bottom-centred (no change needed)

### Accordion / FAQ
- [ ] Expand arrow mirrored
- [ ] Open state down-arrow correct
- [ ] Text right-aligned

### Tabs
- [ ] Tab items flow right-to-left
- [ ] Active indicator on correct side

### Tooltip
- [ ] Tooltip appears on correct side of trigger
- [ ] Arrow/caret pointing correctly

### Notification / Toast
- [ ] Appears at start edge (top-right in LTR → top-left in RTL)
- [ ] Close button at end edge

### Progress Bar
- [ ] Fill starts from start edge (right in RTL) and extends left

### Search Results
- [ ] Result items right-aligned
- [ ] Pagination arrows mirrored
- [ ] Filter panel on end side (left in RTL)

---

## 14. Testing Tools and Process

### 14.1 Browser Testing

| Browser | RTL Support | Notes |
|---|---|---|
| Chrome (latest) | Excellent | Primary testing browser |
| Firefox (latest) | Excellent | Required for cross-browser validation |
| Safari (iOS/macOS) | Good | Test on iPhone for mobile RTL |
| Edge (latest) | Excellent | Inherits Chromium RTL support |

### 14.2 RTL Testing Bookmarklet

Use this bookmarklet to quickly toggle the `dir` attribute on any page for rapid visual inspection:

```javascript
javascript:(function(){var h=document.querySelector('html');h.setAttribute('dir',h.getAttribute('dir')==='rtl'?'ltr':'rtl');})();
```

### 14.3 Automated Accessibility Testing

- **NVDA screen reader** (Windows) — test Arabic page navigation with Arabic language pack installed
- **VoiceOver** (macOS/iOS) — test with Arabic TTS language
- **axe DevTools** — run accessibility audit on Arabic pages

### 14.4 RTL QA Process

1. **Developer self-review** — Enable Chrome DevTools → toggle `dir="rtl"` on `<html>` and review all components visually.
2. **QA engineer review** — Use the Component-by-Component Checklist (§13) on the staging server with actual Arabic translations loaded.
3. **Native Arabic speaker review** — Arabic-speaking regional contact reviews the staging site for reading comfort and layout naturalness. This is NOT a translation review (that happens separately); this is a layout and UX review.
4. **Cross-browser check** — Test on Chrome, Firefox, Safari (mobile) with actual Arabic text.
5. **Sign-off** — Frontend Lead signs off RTL implementation before Phase 2 go-live.

### 14.5 Visual Regression Testing

Implement Playwright visual regression tests for key Arabic page screenshots:

```typescript
// tests/rtl.spec.ts
import { test, expect } from '@playwright/test';

test('Arabic homepage RTL layout', async ({ page }) => {
  await page.goto('http://localhost:3000/ar/');
  await expect(page).toHaveScreenshot('ar-homepage.png');
});

test('Arabic product page RTL layout', async ({ page }) => {
  await page.goto('http://localhost:3000/ar/products/memory/ddr5/voltx-32gb/');
  await expect(page).toHaveScreenshot('ar-product-page.png');
});
```

---

## 15. Known Issues and Workarounds

| Issue | Affected Component | Workaround | Status |
|---|---|---|---|
| Tailwind `space-x-*` utilities do not flip in RTL | Flex rows using `space-x-*` | Replace `space-x-*` with `gap-*` in flex/grid containers | Apply when refactoring |
| `@keystatic/core` rich text editor does not support RTL | Admin CMS (if used) | Use Strapi admin (separate domain, non-public) — not end-user facing | Accepted |
| Inter variable font has no Arabic glyphs | All Arabic text | Noto Sans Arabic fallback in font stack handles this automatically | Resolved by font config |
| CSS `direction: rtl` without `unicode-bidi: bidi-override` may cause mixed-direction text issues in deeply nested elements | Complex product description markup | Use `unicode-bidi: embed` on containers with mixed LTR/RTL | Monitor in QA |
| `<details>/<summary>` summary marker (▶) doesn't mirror in all browsers | Accordion fallback | Replace with custom icon + JavaScript; already planned in component design | Resolved |
| Floating UI `autoPlacement` middleware ignores `dir` attribute | Dynamic tooltips | Explicitly set `placement: 'bottom-start'` rather than using `autoPlacement` | Apply in component config |
| CSS `resize` property on textarea doesn't flip in RTL (resize handle stays at bottom-right) | Contact form textarea | Visually minor; accepted as known limitation for MVP | Accepted for MVP |

---

*Document End — TWN-F4-RTL-2026-001 v1.0*
