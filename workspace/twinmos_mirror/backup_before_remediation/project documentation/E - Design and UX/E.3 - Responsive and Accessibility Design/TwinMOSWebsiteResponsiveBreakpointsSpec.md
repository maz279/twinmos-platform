# TwinMOS Website — Responsive Breakpoints Specification

**Document ID:** E.3.1
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document defines the responsive breakpoint system for the TwinMOS website, including viewport ranges, device targeting, grid behavior, and content adaptation rules across all breakpoints.

**Cross-references:**
- E.1.7 Spacing & Grid System
- Tech Stack: Tailwind CSS v3.4, Astro 5
- URD Section 3.4 (Device & Browser Support)

## 2. Breakpoint Definitions

| Name | Min Width | Max Width | Target Devices | Container Max |
|------|-----------|-----------|----------------|---------------|
| Mobile | 320px | 767px | Phones, small devices | 100% - 32px |
| Tablet | 768px | 1023px | iPad, Android tablets | 720px |
| Desktop | 1024px | 1439px | Laptops, small monitors | 1200px |
| Wide | 1440px | — | Large monitors, 4K displays | 1400px |

### 2.1 Breakpoint Tokens (Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      "sm": "320px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1440px",
    },
  },
};
```

### 2.2 CSS Custom Properties

```css
:root {
  --bp-mobile: 320px;
  --bp-tablet: 768px;
  --bp-desktop: 1024px;
  --bp-wide: 1440px;

  --container-sm: calc(100% - 32px);
  --container-md: 720px;
  --container-lg: 1200px;
  --container-xl: 1400px;
}
```

## 3. Grid Behavior by Breakpoint

| Breakpoint | Columns | Gutter | Margin |
|------------|---------|--------|--------|
| Mobile | 4 | 16px | 16px |
| Tablet | 8 | 24px | 24px |
| Desktop | 12 | 24px | 32px |
| Wide | 12 | 32px | 48px |

## 4. Component Adaptations

### 4.1 Header/Navigation

| Element | Mobile | Tablet | Desktop | Wide |
|---------|--------|--------|---------|------|
| Height | 56px | 64px | 64px | 72px |
| Logo size | 120x34px | 140x40px | 140x40px | 160x46px |
| Navigation | Hamburger menu | Hamburger menu | Horizontal nav | Horizontal nav |
| Search | Icon only | Icon only | Icon + shortcut | Icon + shortcut |
| Language | Icon only | Icon + code | Dropdown | Dropdown |

### 4.2 Hero Section

| Element | Mobile | Tablet | Desktop | Wide |
|---------|--------|--------|---------|------|
| Height | 400px | 500px | 600px | 700px |
| Headline size | 32px | 40px | 48px | 56px |
| Subheadline | 16px | 18px | 20px | 22px |
| CTA layout | Stacked | Stacked | Horizontal | Horizontal |
| Carousel dots | Bottom center | Bottom center | Bottom right | Bottom right |

### 4.3 Product Cards

| Element | Mobile | Tablet | Desktop | Wide |
|---------|--------|--------|---------|------|
| Grid columns | 1 | 2 | 3 | 4 |
| Card padding | 16px | 20px | 24px | 24px |
| Image aspect | 4:3 | 16:10 | 16:10 | 16:10 |
| Specs visible | 2 lines | 3 lines | 4 lines | 4 lines |
| Hover effect | Tap | Tap | Lift + shadow | Lift + shadow |

### 4.4 Footer

| Element | Mobile | Tablet | Desktop | Wide |
|---------|--------|--------|---------|------|
| Columns | 1 (stacked) | 2 | 4 | 4 |
| Logo position | Top center | Top left | Top left | Top left |
| Social icons | Center | Left | Left | Left |
| Newsletter | Full width | 2-col span | 1-col | 1-col |

## 5. Typography Scaling

| Element | Mobile | Tablet | Desktop | Wide |
|---------|--------|--------|---------|------|
| H1 | 32px / 1.2 | 40px / 1.2 | 48px / 1.2 | 56px / 1.2 |
| H2 | 28px / 1.25 | 32px / 1.25 | 36px / 1.25 | 40px / 1.25 |
| H3 | 22px / 1.3 | 24px / 1.3 | 28px / 1.3 | 30px / 1.3 |
| Body | 15px / 1.6 | 16px / 1.6 | 16px / 1.6 | 17px / 1.6 |
| Caption | 13px / 1.5 | 14px / 1.5 | 14px / 1.5 | 14px / 1.5 |
| Button | 14px | 15px | 16px | 16px |

## 6. Spacing Scaling

| Token | Mobile | Tablet | Desktop | Wide |
|-------|--------|--------|---------|------|
| Section padding (y) | 48px | 64px | 80px | 96px |
| Section padding (x) | 16px | 24px | 32px | 48px |
| Content gap | 16px | 24px | 32px | 40px |
| Component gap | 12px | 16px | 24px | 24px |

## 7. Image Scaling

| Image Type | Mobile | Tablet | Desktop | Wide |
|------------|--------|--------|---------|------|
| Hero | 768x400 | 1024x500 | 1440x600 | 1920x700 |
| Product thumbnail | 400x300 | 500x375 | 600x450 | 600x450 |
| Category icon | 64x64 | 80x80 | 96x96 | 96x96 |
| Avatar | 40x40 | 48x48 | 48x48 | 48x48 |

## 8. Touch Target Minimums

| Breakpoint | Min Touch Target | Button Height | Input Height |
|------------|------------------|---------------|--------------|
| Mobile | 44x44px | 48px | 48px |
| Tablet | 44x44px | 44px | 44px |
| Desktop | 32x32px | 40px | 40px |
| Wide | 32x32px | 40px | 40px |

## 9. Media Query Patterns

### 9.1 Mobile-First Approach

```css
/* Base: Mobile (320px+) */
.component {
  padding: 16px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .component {
    padding: 24px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .component {
    padding: 32px;
  }
}

/* Wide (1440px+) */
@media (min-width: 1440px) {
  .component {
    padding: 48px;
  }
}
```

### 9.2 Tailwind Utility Pattern

```html
<div class="px-4 md:px-6 lg:px-8 xl:px-12
            py-12 md:py-16 lg:py-20 xl:py-24">
  <!-- Content -->
</div>
```

## 10. Testing Matrix

| Device | OS | Browser | Viewport | Priority |
|--------|----|---------|----------|----------|
| iPhone 14 Pro | iOS 17 | Safari | 393x852 | Critical |
| iPhone SE | iOS 17 | Safari | 375x667 | Critical |
| Samsung S24 | Android 14 | Chrome | 412x915 | Critical |
| iPad Pro | iPadOS 17 | Safari | 1024x1366 | Critical |
| iPad Mini | iPadOS 17 | Safari | 768x1024 | High |
| MacBook Pro 14 | macOS 14 | Chrome | 1512x982 | Critical |
| Windows Desktop | Win 11 | Edge | 1920x1080 | Critical |
| 4K Monitor | Win 11 | Chrome | 3840x2160 | High |

## 11. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-04-10 | Initial breakpoints defined |
| 0.5 | 2026-04-20 | Added touch target specs |
| 1.0 | 2026-05-01 | Final specification |
