# TwinMOS Website — Accessibility Design Specification (WCAG 2.1 AA)

**Document ID:** E.3.3
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document defines accessibility design requirements for the TwinMOS website, ensuring compliance with WCAG 2.1 Level AA standards. Covers perceivable, operable, understandable, and robust design principles.

**Cross-references:**
- URD Section 3.5 (Accessibility Requirements)
- E.3.4 RTL Design Specification
- Tech Stack: Astro 5, React Aria, Tailwind CSS

## 2. WCAG 2.1 AA Compliance Matrix

| Principle | Guideline | Level | Status |
|-----------|-----------|-------|--------|
| Perceivable | 1.1 Text Alternatives | A | Required |
| Perceivable | 1.2 Time-based Media | A/AA | Required |
| Perceivable | 1.3 Adaptable | A | Required |
| Perceivable | 1.4 Distinguishable | AA | Required |
| Operable | 2.1 Keyboard Accessible | A | Required |
| Operable | 2.2 Enough Time | A | Required |
| Operable | 2.3 Seizures | A | Required |
| Operable | 2.4 Navigable | AA | Required |
| Operable | 2.5 Input Modalities | AA | Required |
| Understandable | 3.1 Readable | AA | Required |
| Understandable | 3.2 Predictable | AA | Required |
| Understandable | 3.3 Input Assistance | AA | Required |
| Robust | 4.1 Compatible | A | Required |

## 3. Color & Contrast

### 3.1 Minimum Contrast Ratios

| Element | Ratio | Example Pair | Actual Ratio |
|---------|-------|--------------|--------------|
| Normal text (< 18px) | 4.5:1 | `#1A1A2E` on `#FFFFFF` | 15.8:1 |
| Large text (18px+ bold) | 3:1 | `#0A2540` on `#F6F9FC` | 11.2:1 |
| UI Components | 3:1 | `#00A3E0` border on `#FFFFFF` | 3.1:1 |
| Graphical objects | 3:1 | Icons, charts, diagrams | 4.5:1 target |

### 3.2 Color-Independent Information

Never rely on color alone to convey information:

- Error states: Red border + icon + text message
- Success states: Green border + checkmark + text
- Required fields: Asterisk + label text + border
- Links: Underline + color change + hover state

### 3.3 Focus Indicators

| Element | Focus Style |
|---------|-------------|
| Links | 2px `#00A3E0` outline, 2px offset |
| Buttons | 2px `#00A3E0` outline, 2px offset |
| Inputs | 2px `#00A3E0` border |
| Checkboxes | 2px `#00A3E0` outline |
| Custom components | Visible focus ring, high contrast |

## 4. Typography & Readability

### 4.1 Text Resizing

- Text must remain readable at 200% browser zoom
- Layout must not break at 200% zoom
- No horizontal scrolling required at 320px viewport (400% zoom equivalent)

### 4.2 Line Height & Spacing

| Property | Minimum | Recommended |
|----------|---------|-------------|
| Line height | 1.5x font size | 1.6x |
| Paragraph spacing | 2x font size | 2x |
| Letter spacing | 0.12x font size | 0.01em |
| Word spacing | 0.16x font size | 0.02em |

### 4.3 Text Contrast Exceptions

The following are exempt from contrast requirements but should still be readable:

- Logos and brand marks
- Decorative text (non-informative)
- Inactive/disabled UI elements

## 5. Keyboard Navigation

### 5.1 Focus Order

- Logical top-to-bottom, left-to-right flow
- Modal dialogs trap focus until closed
- Skip links bypass repetitive content
- Focus visible on all interactive elements

### 5.2 Keyboard Shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| Tab | Next focusable element | Global |
| Shift+Tab | Previous focusable element | Global |
| Enter/Space | Activate button/link | Global |
| Escape | Close modal/menu | Modal/overlay |
| Arrow keys | Navigate menus, tabs, radios | Component |
| Home/End | First/last item in list | List components |

### 5.3 No Keyboard Traps

Users must be able to navigate away from any component using only the keyboard:

- Carousels: Tab through controls, not each slide
- Modals: Escape closes, focus returns to trigger
- Custom widgets: Arrow keys for internal navigation, Tab to exit

## 6. Screen Reader Support

### 6.1 Semantic HTML

Use correct HTML elements for their intended purpose:

| Element | Usage |
|---------|-------|
| `<header>` | Page/section header |
| `<nav>` | Navigation regions |
| `<main>` | Primary content |
| `<article>` | Self-contained content |
| `<section>` | Thematic grouping |
| `<aside>` | Sidebar content |
| `<footer>` | Page/section footer |
| `<button>` | Clickable actions |
| `<a>` | Navigation links |

### 6.2 ARIA Labels & Roles

| Pattern | Implementation |
|---------|---------------|
| Icon buttons | `aria-label="Search"` |
| Current page | `aria-current="page"` |
| Expanded state | `aria-expanded="true/false"` |
| Live regions | `aria-live="polite/assertive"` |
| Required fields | `aria-required="true"` |
| Invalid input | `aria-invalid="true"` |
| Descriptions | `aria-describedby="id"` |

### 6.3 Alt Text Guidelines

| Image Type | Alt Text |
|------------|----------|
| Product photos | "TwinMOS VOLTX DDR5 32GB RGB RAM" |
| Decorative | `alt=""` (empty) |
| Icons with labels | `aria-hidden="true"` |
| Charts/graphs | Description of data + summary |
| Hero banners | Key message conveyed |
| Team photos | "[Name], [Title] at TwinMOS" |

## 7. Motion & Animation

### 7.1 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.2 Animation Constraints

| Property | Limit |
|----------|-------|
| Flash frequency | Max 3 per second |
| Auto-playing media | Stop after 5 seconds |
| Moving content | Can be paused |
| Parallax | Disable on reduced motion |

## 8. Form Accessibility

### 8.1 Label Association

```html
<!-- Correct -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" />

<!-- Also correct -->
<label>
  Email Address
  <input type="email" name="email" />
</label>
```

### 8.2 Error Prevention

- Required fields clearly marked
- Error messages associated with inputs via `aria-describedby`
- Suggestions provided for corrections
- Confirm on destructive actions
- Review before final submission

### 8.3 Input Assistance

| Scenario | Assistance |
|----------|------------|
| Format required | Placeholder + helper text |
| Password | Strength indicator + requirements list |
| Date | Date picker + format hint |
| Search | Autocomplete suggestions |
| Phone | Auto-format as user types |

## 9. Multi-Language & RTL

### 9.1 Language Declaration

```html
<html lang="en" dir="ltr">
<html lang="ar" dir="rtl">
<html lang="zh-CN" dir="ltr">
```

### 9.2 RTL Accessibility

- Focus indicators adapt to text direction
- Screen readers announce correct reading order
- Icons with directional meaning mirror appropriately
- Tab order follows RTL logic

## 10. Testing Checklist

### 10.1 Automated Testing

| Tool | Checks | Frequency |
|------|--------|-----------|
| axe DevTools | WCAG violations | Per build |
| Lighthouse | Accessibility score | Per build |
| WAVE | Visual feedback | Weekly |
| Pa11y | CI integration | Per PR |

### 10.2 Manual Testing

| Test | Method | Frequency |
|------|--------|-----------|
| Keyboard navigation | Tab through entire page | Per feature |
| Screen reader | NVDA, JAWS, VoiceOver | Per sprint |
| Color contrast | Manual inspection | Per design |
| Zoom 200% | Browser zoom | Per page |
| Reduced motion | System preference | Per animation |

### 10.3 Target Scores

| Metric | Target | Minimum |
|--------|--------|---------|
| Lighthouse Accessibility | 100 | 95 |
| axe-core violations | 0 | 0 |
| Color contrast failures | 0 | 0 |
| Missing alt text | 0 | 0 |

## 11. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-04-10 | Initial WCAG mapping |
| 0.5 | 2026-04-22 | Added screen reader specs |
| 1.0 | 2026-05-01 | Final specification |
