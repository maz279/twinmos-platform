# TwinMOS Website — Mobile-First Design Guide

**Document ID:** E.3.2
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document establishes mobile-first design principles and practices for the TwinMOS website. All design decisions prioritize the mobile experience, with progressive enhancement for larger viewports.

**Cross-references:**
- E.3.1 Responsive Breakpoints Specification
- E.1.8 Component Library Specification
- Tech Stack: Tailwind CSS, Astro 5

## 2. Mobile-First Philosophy

### 2.1 Core Principles

1. **Content Priority:** Essential content first; secondary content available via progressive disclosure
2. **Performance Budget:** Mobile pages load in < 3s on 3G networks
3. **Touch-First:** All interactions optimized for touch; mouse/keyboard enhancements added at desktop
4. **Constraint-Driven:** Design within mobile constraints (viewport, bandwidth, input method)
5. **Progressive Enhancement:** Add features as viewport and capability increase

### 2.2 Design Process

```
Step 1: Design mobile layout (320px)
Step 2: Validate content hierarchy
Step 3: Add tablet enhancements (768px)
Step 4: Add desktop enhancements (1024px)
Step 5: Add wide-screen enhancements (1440px)
Step 6: Test across all breakpoints
```

## 3. Mobile Layout Patterns

### 3.1 Single Column Layout

Default layout for all pages on mobile:

```
┌─────────────────────┐
│ [Header] 56px       │
├─────────────────────┤
│ [Hero] 400px        │
├─────────────────────┤
│ [Content]           │
│  Full width         │
│  16px padding       │
├─────────────────────┤
│ [CTA] Full width    │
├─────────────────────┤
│ [Footer] Stacked    │
└─────────────────────┘
```

### 3.2 Stacked Cards

Product cards, news items, testimonials stack vertically:

```
┌─────────────────────┐
│ [Card 1]            │
│  Image (full width) │
│  Title              │
│  Description        │
│  CTA                │
├─────────────────────┤
│ [Card 2]            │
│  ...                │
├─────────────────────┤
│ [Card 3]            │
│  ...                │
└─────────────────────┘
```

### 3.3 Accordion Sections

Content-heavy sections use accordions:

```
┌─────────────────────┐
│ Section Title    [+]│
├─────────────────────┤
│ (Collapsed content) │
├─────────────────────┤
│ Section Title    [+]│
├─────────────────────┤
│ Section Title    [-]│
│ Expanded content... │
│ ...                 │
└─────────────────────┘
```

## 4. Navigation Patterns

### 4.1 Hamburger Menu

| Property | Specification |
|----------|---------------|
| Icon | 3-line hamburger, 24x24px |
| Position | Top-right, 16px margin |
| Animation | Morph to X (200ms ease) |
| Menu overlay | Full-screen, `#0A2540` bg |
| Menu items | 20px Inter SemiBold, stacked |
| Item spacing | 24px vertical |
| Submenu | Chevron expand, slide-in |
| Close | X icon or swipe left |

### 4.2 Bottom Navigation (Optional)

For key actions on product pages:

```
┌─────────────────────────────────┐
│ [Content area]                  │
│                                 │
├─────────────────────────────────┤
│ [Specs] [Compare] [Buy]         │
│  Bottom fixed bar, 56px height  │
└─────────────────────────────────┘
```

## 5. Touch Interaction Guidelines

### 5.1 Touch Targets

| Element | Minimum Size | Preferred Size |
|---------|-------------|----------------|
| Buttons | 44x44px | 48x48px |
| Links (inline) | 44px height | 48px height |
| Form inputs | 48px height | 56px height |
| Checkboxes | 44x44px | 48x48px |
| Radio buttons | 44x44px | 48x48px |
| Dropdowns | 48px height | 56px height |

### 5.2 Gesture Support

| Gesture | Action | Target |
|---------|--------|--------|
| Tap | Select/Activate | All interactive elements |
| Double tap | Zoom image | Product gallery |
| Swipe left | Next slide | Carousels, galleries |
| Swipe right | Previous slide | Carousels, galleries |
| Swipe down | Refresh | Support ticket list |
| Swipe up | Load more | Product lists, news |
| Pinch | Zoom | Product images |
| Long press | Context menu | Product cards (quick actions) |

### 5.3 Feedback Patterns

| Interaction | Feedback | Duration |
|-------------|----------|----------|
| Tap button | Background darken 10% | 100ms |
| Tap link | Underline + color shift | 150ms |
| Swipe carousel | Snap to next item | 300ms |
| Pull to refresh | Spinner + bounce | 400ms |
| Load more | Skeleton pulse | 800ms |

## 6. Content Strategy for Mobile

### 6.1 Content Prioritization

| Priority | Content Type | Treatment |
|----------|--------------|-----------|
| P0 | Headline, primary CTA | Always visible, above fold |
| P1 | Key value props | Visible, minimal scroll |
| P2 | Supporting details | Accordion or below fold |
| P3 | Related content | "More" section, lazy loaded |
| P4 | Footer links | Collapsed or minimal |

### 6.2 Text Optimization

- Headlines: Max 40 characters
- Body paragraphs: Max 3 lines (truncate with "Read more")
- Button labels: Max 3 words
- Form labels: Above input, not inline
- Error messages: Inline, below field

### 6.3 Image Optimization

| Image Type | Mobile Spec | Lazy Load |
|------------|-------------|-----------|
| Hero | 768x400, WebP, max 80KB | No (above fold) |
| Product | 400x300, WebP, max 40KB | Yes |
| Thumbnail | 200x200, WebP, max 15KB | Yes |
| Icon | SVG, inline | No |
| Background | CSS gradient fallback | No |

## 7. Form Design for Mobile

### 7.1 Input Fields

| Property | Specification |
|----------|---------------|
| Height | 48px minimum |
| Font size | 16px (prevents iOS zoom) |
| Padding | 12px 16px |
| Border | 1px `#D1D5DB`, radius 6px |
| Focus | 2px `#00A3E0` outline |
| Error | 2px `#EF4444` border + message |

### 7.2 Input Types

Use appropriate input types for mobile keyboards:

| Field | Input Type | Keyboard |
|-------|-----------|----------|
| Email | `type="email"` | Email keyboard |
| Phone | `type="tel"` | Numeric keypad |
| URL | `type="url"` | URL keyboard |
| Number | `type="number"` | Numeric |
| Date | `type="date"` | Date picker |
| Search | `type="search"` | Search keyboard |

### 7.3 Form Layout

```
┌─────────────────────┐
│ Label               │
│ [Input field    ]   │
│ Helper text         │
│                     │
│ Label               │
│ [Input field    ]   │
│ Error message       │
│                     │
│ [Submit button]     │
└─────────────────────┘
```

- Single column only
- Labels above inputs
- Full-width submit button
- Progress indicator for multi-step forms

## 8. Performance Guidelines

### 8.1 Mobile Performance Budget

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.0s | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.0s | < 2.5s |
| Time to Interactive (TTI) | < 3.0s | < 4.0s |
| Cumulative Layout Shift (CLS) | < 0.05 | < 0.1 |
| Total Page Weight | < 1MB | < 1.5MB |
| JavaScript | < 200KB | < 300KB |
| Images | < 500KB | < 800KB |
| CSS | < 50KB | < 75KB |

### 8.2 Optimization Techniques

1. **Critical CSS:** Inline above-fold CSS
2. **Lazy Loading:** Images below fold use `loading="lazy"`
3. **Responsive Images:** `srcset` with appropriate sizes
4. **Font Loading:** `font-display: swap` for custom fonts
5. **Code Splitting:** Route-based JS splitting
6. **Service Worker:** Cache static assets

## 9. Testing Requirements

| Test Type | Tool | Frequency |
|-----------|------|-----------|
| Device lab | BrowserStack | Weekly |
| Lighthouse mobile | Chrome DevTools | Per build |
| 3G simulation | Chrome DevTools | Per feature |
| Touch testing | Real devices | Per sprint |
| iOS Safari | iPhone device | Per release |
| Android Chrome | Android device | Per release |

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-04-12 | Initial mobile-first principles |
| 0.5 | 2026-04-25 | Added gesture support |
| 1.0 | 2026-05-01 | Final specification |
