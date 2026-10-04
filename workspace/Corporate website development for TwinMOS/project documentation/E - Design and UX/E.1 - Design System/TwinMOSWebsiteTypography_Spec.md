# TwinMOS Website Typography Specification

**Document Reference:** TWN-TYPO-2026-001  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** UX Lead / Design Team  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** URD §20.3, Tech Stack §4.6, RFP §7.2, BRD §20

---

## 1. Purpose

This document specifies the complete typography system for the TwinMOS corporate website, covering font families, type scales, multi-script support, and implementation guidelines across 9 locales.

---

## 2. Font Families

### 2.1 Primary Typeface: Inter

Inter is a typeface carefully crafted and designed for computer screens. It features a tall x-height to improve readability of mixed-case and lower-case text, and its letterforms are optimized for UI interfaces.

| Property | Value |
|----------|-------|
| **Family** | Inter |
| **Designer** | Rasmus Andersson |
| **License** | SIL Open Font License 1.1 |
| **Source** | Google Fonts / Self-hosted |
| **Classification** | Neo-grotesque sans-serif |

**Selected Weights:**

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Subheadings, navigation, labels |
| SemiBold | 600 | Section headings, card titles, buttons |
| Bold | 700 | Hero headings, emphasis |
| ExtraBold | 800 | Gaming display headlines |

### 2.2 Multi-Script Font Stack

| Script/Language | Primary Font | Fallback Stack | Weights |
|-----------------|-------------|----------------|---------|
| Latin (EN, FR, ES, PT, DE) | Inter | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | 400–800 |
| Arabic (AR) | Noto Sans Arabic | `'Noto Sans Arabic', 'Inter', sans-serif` | 400–700 |
| Devanagari (HI) | Noto Sans Devanagari | `'Noto Sans Devanagari', 'Inter', sans-serif` | 400–700 |
| Cyrillic (RU) | Inter | Same as Latin | 400–800 |
| Chinese Simplified (ZH) | Noto Sans SC | `'Noto Sans SC', 'Inter', sans-serif` | 400–700 |

### 2.3 Font Stack Definitions

```css
/* Latin */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Arabic */
font-family: 'Noto Sans Arabic', 'Inter', sans-serif;

/* Devanagari (Hindi) */
font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;

/* Chinese Simplified */
font-family: 'Noto Sans SC', 'Inter', sans-serif;
```

---

## 3. Type Scale

### 3.1 Desktop Type Scale (1024px+)

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Display | 64px | 800 | 1.0 | -0.02em | Gaming hero headlines |
| H1 | 48px | 700 | 1.1 | -0.01em | Page titles, hero headings |
| H2 | 36px | 600 | 1.2 | -0.005em | Section headings |
| H3 | 24px | 600 | 1.3 | 0 | Card titles, subsection headings |
| H4 | 20px | 500 | 1.4 | 0 | Subsection headings, feature titles |
| H5 | 16px | 600 | 1.4 | 0.01em | Labels, small headings |
| Body | 16px | 400 | 1.6 | 0 | Paragraphs, general content |
| Body Small | 14px | 400 | 1.5 | 0 | Secondary content, descriptions |
| Caption | 12px | 400 | 1.4 | 0.01em | Metadata, timestamps, captions |
| Overline | 12px | 600 | 1.4 | 0.08em | Category labels, uppercase labels |
| Button | 14px | 600 | 1.0 | 0.01em | Button text |
| Nav Link | 14px | 500 | 1.0 | 0 | Navigation items |

### 3.2 Tablet Type Scale (768–1023px)

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Display | 52px | 800 | 1.0 | -0.02em |
| H1 | 40px | 700 | 1.1 | -0.01em |
| H2 | 32px | 600 | 1.2 | -0.005em |
| H3 | 22px | 600 | 1.3 | 0 |
| H4 | 18px | 500 | 1.4 | 0 |
| H5 | 16px | 600 | 1.4 | 0.01em |
| Body | 16px | 400 | 1.6 | 0 |
| Body Small | 14px | 400 | 1.5 | 0 |
| Caption | 12px | 400 | 1.4 | 0.01em |
| Overline | 12px | 600 | 1.4 | 0.08em |
| Button | 14px | 600 | 1.0 | 0.01em |
| Nav Link | 14px | 500 | 1.0 | 0 |

### 3.3 Mobile Type Scale (< 768px)

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Display | 40px | 800 | 1.0 | -0.02em |
| H1 | 32px | 700 | 1.1 | -0.01em |
| H2 | 28px | 600 | 1.2 | -0.005em |
| H3 | 20px | 600 | 1.3 | 0 |
| H4 | 18px | 500 | 1.4 | 0 |
| H5 | 16px | 600 | 1.4 | 0.01em |
| Body | 16px | 400 | 1.6 | 0 |
| Body Small | 14px | 400 | 1.5 | 0 |
| Caption | 12px | 400 | 1.4 | 0.01em |
| Overline | 12px | 600 | 1.4 | 0.08em |
| Button | 14px | 600 | 1.0 | 0.01em |
| Nav Link | 14px | 500 | 1.0 | 0 |

### 3.4 Wide Desktop Type Scale (1440px+)

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Display | 72px | 800 | 1.0 | -0.02em |
| H1 | 56px | 700 | 1.1 | -0.01em |
| H2 | 40px | 600 | 1.2 | -0.005em |
| H3 | 28px | 600 | 1.3 | 0 |
| H4 | 22px | 500 | 1.4 | 0 |
| H5 | 18px | 600 | 1.4 | 0.01em |
| Body | 18px | 400 | 1.6 | 0 |
| Body Small | 14px | 400 | 1.5 | 0 |
| Caption | 14px | 400 | 1.4 | 0.01em |
| Overline | 12px | 600 | 1.4 | 0.08em |
| Button | 14px | 600 | 1.0 | 0.01em |
| Nav Link | 14px | 500 | 1.0 | 0 |

---

## 4. Script-Specific Adjustments

### 4.1 Arabic (RTL)

| Property | Adjustment | Rationale |
|----------|-----------|-----------|
| Font | Noto Sans Arabic | Optimized for Arabic script |
| Line height | 1.8 | Arabic requires more vertical space |
| Letter spacing | 0 | Arabic does not use letter spacing |
| Text alignment | Right-aligned by default | RTL reading direction |
| Numerals | Arabic-Indic or Eastern Arabic | Per locale preference |
| Font size | Same as Latin | Noto Sans Arabic matches Inter metrics |


### 4.3 Devanagari (Hindi)

| Property | Adjustment | Rationale |
|----------|-----------|-----------|
| Font | Noto Sans Devanagari | Optimized for Devanagari |
| Line height | 1.8 | Matras above/below base characters |
| Font size | Same as Latin | Noto Sans Devanagari matches Inter |

### 4.4 Chinese Simplified

| Property | Adjustment | Rationale |
|----------|-----------|-----------|
| Font | Noto Sans SC | Optimized for CJK characters |
| Line height | 1.75 | CJK characters are square |
| Word spacing | Minimal | Chinese does not use spaces between words |
| Font weight | Minimum 400 | Thin strokes may disappear at low weights |

---

## 5. Typography Patterns

### 5.1 Heading Hierarchy

```
H1: Page Title (only one per page)
  H2: Major Section
    H3: Subsection
      H4: Sub-subsection
        H5: Label/Minor heading
```

**Rules:**
- Only one H1 per page
- Do not skip heading levels (H2 → H4 is prohibited)
- Headings must be descriptive and unique

### 5.2 Body Text Patterns

| Context | Size | Line Length (max) | Color |
|---------|------|-------------------|-------|
| Hero description | Body (16px) | 60 characters | `--color-text-secondary` |
| Section body | Body (16px) | 75 characters | `--color-text-secondary` |
| Card description | Body Small (14px) | 50 characters | `--color-text-secondary` |
| Metadata | Caption (12px) | N/A | `--color-text-muted` |
| Legal text | Body Small (14px) | 80 characters | `--color-text-secondary` |

### 5.3 Gaming Typography

| Element | Size | Weight | Effect |
|---------|------|--------|--------|
| Gaming hero headline | Display (64px desktop) | 800 | May use uppercase for short phrases |
| Gaming section title | H1 (48px) | 700 | Normal case |
| Gaming card title | H3 (24px) | 600 | Normal case |
| Gaming stats | H2 (36px) | 700 | Monospace for numbers |
| RGB showcase labels | Body Small (14px) | 500 | `--color-gaming-accent` |

---

## 6. Font Loading Strategy

### 6.1 Self-Hosting

All fonts are self-hosted for GDPR compliance and performance.

| Font | Weights | Formats | Subsetting |
|------|---------|---------|------------|
| Inter | 400, 500, 600, 700, 800 | woff2, woff | Latin, Latin Extended |
| Noto Sans Arabic | 400, 500, 700 | woff2, woff | Arabic |
| Noto Sans Devanagari | 400, 500, 700 | woff2, woff | Devanagari |
| Noto Sans SC | 400, 500, 700 | woff2, woff | Chinese Simplified |

### 6.2 Loading Priority

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-700.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font face declarations -->
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-400.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-700.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
</style>
```

### 6.3 Performance Budget

| Metric | Target |
|--------|--------|
| Total font payload (Latin) | < 100KB (woff2) |
| Total font payload (all scripts) | < 300KB |
| First Contentful Paint | < 1.0s |
| Font blocking time | Minimal (font-display: swap) |

---

## 7. Implementation

### 7.1 Tailwind Configuration

```javascript
// tailwind.config.ts
export default {
  theme: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      arabic: ['Noto Sans Arabic', 'Inter', 'sans-serif'],      devanagari: ['Noto Sans Devanagari', 'Inter', 'sans-serif'],
      chinese: ['Noto Sans SC', 'Inter', 'sans-serif'],
    },
    fontSize: {
      'display': ['64px', { lineHeight: '1.0', letterSpacing: '-0.02em', fontWeight: '800' }],
      'h1': ['48px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
      'h2': ['36px', { lineHeight: '1.2', letterSpacing: '-0.005em', fontWeight: '600' }],
      'h3': ['24px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
      'h4': ['20px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
      'h5': ['16px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
      'body': ['16px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
      'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
      'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '400' }],
      'overline': ['12px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '600' }],
      'button': ['14px', { lineHeight: '1.0', letterSpacing: '0.01em', fontWeight: '600' }],
      'nav': ['14px', { lineHeight: '1.0', letterSpacing: '0', fontWeight: '500' }],
    },
  },
};
```

### 7.2 CSS Implementation

```css
/* Base typography */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-primary);
}

/* Headings */
h1, .h1 { font-size: 48px; font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; }
h2, .h2 { font-size: 36px; font-weight: 600; line-height: 1.2; letter-spacing: -0.005em; }
h3, .h3 { font-size: 24px; font-weight: 600; line-height: 1.3; }
h4, .h4 { font-size: 20px; font-weight: 500; line-height: 1.4; }
h5, .h5 { font-size: 16px; font-weight: 600; line-height: 1.4; letter-spacing: 0.01em; }

/* Arabic */
[lang="ar"] body {
  font-family: 'Noto Sans Arabic', 'Inter', sans-serif;
  line-height: 1.8;
}


/* Hindi */
[lang="hi"] body {
  font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
  line-height: 1.8;
}

/* Chinese Simplified */
[lang="zh-CN"] body {
  font-family: 'Noto Sans SC', 'Inter', sans-serif;
  line-height: 1.75;
}
```

---

## 8. Accessibility

### 8.1 Readability

| Requirement | Specification |
|-------------|--------------|
| Minimum font size | 12px (captions), 16px (body) |
| Line length (optimal) | 60–75 characters |
| Line height (body) | 1.6 |
| Paragraph spacing | 1em (16px) between paragraphs |

### 8.2 Text Resizing

- Site must remain functional at 200% zoom
- No horizontal scroll at 200% zoom
- Text containers must wrap gracefully

### 8.3 Dyslexia Considerations

- Avoid justified text (use left-aligned)
- Maintain generous line height (1.6+)
- Use sufficient paragraph spacing
- Avoid all-caps for long passages

---

## 9. Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 1 May 2026 | Complete typography specification for Phase 1 |

---

*This typography specification ensures consistent, readable, and accessible text across all TwinMOS website pages and locales.*
