# TwinMOS Website — RTL (Right-to-Left) Design Specification

**Document ID:** E.3.4
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document defines design specifications for right-to-left (RTL) layouts supporting Arabic and other RTL languages across the TwinMOS website. Covers layout mirroring, typography, iconography, and component adaptations.

**Cross-references:**
- URD Section 4.4 (Multi-Language & Localization)
- E.3.3 Accessibility Design Specification
- E.1.7 Spacing & Grid System
- Content: Arabic locale content files

## 2. RTL Language Support

| Locale | Language | Script | Direction | Status |
|--------|----------|--------|-----------|--------|
| ar | Arabic | Arabic | RTL | Phase 1 |
| ar-AE | Arabic (UAE) | Arabic | RTL | Phase 1 |
| ar-SA | Arabic (KSA) | Arabic | RTL | Phase 2 |
| ur | Urdu | Arabic | RTL | Phase 2 |
| fa | Persian | Arabic | RTL | Phase 3 |

## 3. Layout Mirroring Rules

### 3.1 Fully Mirrored Elements

These elements flip horizontally in RTL:

| Element | LTR | RTL |
|---------|-----|-----|
| Page layout | Left-aligned | Right-aligned |
| Navigation | Left-to-right | Right-to-left |
| Logo | Top-left | Top-right |
| Text alignment | Left | Right |
| Margins (logical) | margin-left | margin-inline-start |
| Padding (logical) | padding-left | padding-inline-start |
| Floats | float: left | float: right |
| Flex direction | row | row-reverse |
| Grid flow | left-to-right | right-to-left |

### 3.2 Non-Mirrored Elements

These elements remain unchanged in RTL:

| Element | Reason |
|---------|--------|
| Product images | Visual content, not directional |
| Charts/graphs | Data visualization direction |
| Video players | Standard controls orientation |
| Brand logos | Trademark consistency |
| Progress bars | Left-to-right is standard |
| Mathematical expressions | Universal notation |
| Timelines | Chronological left-to-right |

### 3.3 Conditionally Mirrored

| Element | LTR | RTL | Condition |
|---------|-----|-----|-----------|
| Arrows (navigation) | Point right | Point left | Contextual |
| Chevron icons | Right for next | Left for next | In menus |
| Sliders | Min left, max right | Min right, max left | Numeric |
| Checkmarks | Left of label | Right of label | Form labels |

## 4. CSS Implementation

### 4.1 Logical Properties

```css
/* Instead of directional properties */
.component {
  /* LTR: left margin; RTL: right margin */
  margin-inline-start: 16px;
  
  /* LTR: left+right padding; RTL: same */
  padding-inline: 24px;
  
  /* LTR: left border; RTL: right border */
  border-inline-start: 2px solid #00A3E0;
  
  /* Text alignment follows direction */
  text-align: start;
}
```

### 4.2 Tailwind RTL Plugin

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require("tailwindcss-rtl"),
  ],
};
```

```html
<!-- Usage -->
<div class="ms-4 me-2 ps-6 pe-4 text-start">
  <!-- margin-inline-start: 1rem -->
  <!-- margin-inline-end: 0.5rem -->
  <!-- padding-inline-start: 1.5rem -->
  <!-- padding-inline-end: 1rem -->
  <!-- text-align: start -->
</div>
```

### 4.3 Direction-Aware Utilities

```css
[dir="rtl"] .rtl-flip {
  transform: scaleX(-1);
}

[dir="rtl"] .rtl-reverse {
  flex-direction: row-reverse;
}

[dir="rtl"] .rtl-text-right {
  text-align: right;
}
```

## 5. Typography Adaptations

### 5.1 Arabic Typography

| Property | Latin | Arabic |
|----------|-------|--------|
| Font family | Inter | Noto Sans Arabic |
| Font size | 16px base | 17px base (script complexity) |
| Line height | 1.6 | 1.8 |
| Letter spacing | normal | normal (no tracking) |
| Word spacing | normal | slightly wider |

### 5.2 Mixed Content (Latin in Arabic)

When Latin text appears within Arabic content:

- Numbers: Always LTR (Unicode bidi algorithm)
- Product names: Keep LTR, wrap in `<span dir="ltr">`
- URLs: Always LTR
- Code snippets: Always LTR

```html
<p dir="rtl">
  احصل على ذاكرة
  <span dir="ltr">VOLTX DDR5</span>
  بسعة 32 جيجابايت
</p>
```

## 6. Component Adaptations

### 6.1 Navigation

```
LTR Navigation:          RTL Navigation:
┌──────────────────┐    ┌──────────────────┐
│ Logo  Nav1 Nav2  │    │  Nav2 Nav1  Logo │
│ [Search] [Lang]  │    │  [Lang] [Search] │
└──────────────────┘    └──────────────────┘
```

### 6.2 Breadcrumbs

```
LTR: Home > Products > DDR5     RTL: DDR5 < Products < Home
```

### 6.3 Product Cards

```
LTR Card:                RTL Card:
┌────────┬─────────┐    ┌─────────┬────────┐
│ Image  │ Title   │    │  Title  │ Image  │
│        │ Price   │    │  Price  │        │
│        │ [CTA]   │    │  [CTA]  │        │
└────────┴─────────┘    └─────────┴────────┘
```

### 6.4 Forms

```
LTR Form:                RTL Form:
Label: [Input]          [Input] :Label
Error: Message               Message :Error
```

- Checkbox: Checkmark appears on right side of label
- Radio buttons: Circle on right side
- Dropdown arrow: Points left

## 7. Iconography

### 7.1 Icon Mirroring Rules

| Icon | LTR | RTL | Action |
|------|-----|-----|--------|
| Arrow right | → | ← | Mirror |
| Arrow left | ← | → | Mirror |
| Chevron right | › | ‹ | Mirror |
| Chevron left | ‹ | › | Mirror |
| Back arrow | ← | → | Mirror |
| Forward arrow | → | ← | Mirror |
| Search | 🔍 | 🔍 | No change |
| Home | 🏠 | 🏠 | No change |
| User | 👤 | 👤 | No change |
| Settings | ⚙️ | ⚙️ | No change |

### 7.2 Implementation

```jsx
// React component with RTL-aware icons
import { ChevronRight, ChevronLeft } from "lucide-react";

function NavLink({ direction = "next" }) {
  const isRTL = document.dir === "rtl";
  const Icon = direction === "next"
    ? (isRTL ? ChevronLeft : ChevronRight)
    : (isRTL ? ChevronRight : ChevronLeft);
  
  return <Icon />;
}
```

## 8. Number & Date Formatting

### 8.1 Number Formats

| Format | LTR (en) | RTL (ar) |
|--------|----------|----------|
| Decimal | 1,234.56 | ١٬٢٣٤٫٥٦ |
| Percentage | 50% | ٥٠٪ |
| Currency | $1,234 | ١٬٢٣٤ $ |

### 8.2 Date Formats

| Format | LTR (en) | RTL (ar) |
|--------|----------|----------|
| Short | 05/01/2026 | ٠١/٠٥/٢٠٢٦ |
| Medium | May 1, 2026 | ١ مايو ٢٠٢٦ |
| Long | Friday, May 1, 2026 | الجمعة، ١ مايو ٢٠٢٦ |

## 9. Testing Requirements

| Test | Tool/Method | Frequency |
|------|-------------|-----------|
| Visual RTL check | Browser dev tools | Per component |
| Screen reader | NVDA Arabic | Per sprint |
| Bidirectional text | Manual mixed content | Per page |
| Number display | Arabic numerals | Per form |
| Icon mirroring | Visual inspection | Per component |

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-04-15 | Initial RTL guidelines |
| 1.0 | 2026-05-01 | Final specification |
