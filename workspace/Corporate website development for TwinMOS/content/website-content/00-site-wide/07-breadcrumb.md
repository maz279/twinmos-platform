---
title: "Breadcrumb Navigation"
slug: "breadcrumb"
url: "/components/breadcrumb"
template: "component"
description: "Accessible breadcrumb navigation component with Schema.org structured data, responsive truncation, and comprehensive wayfinding patterns for all page types across the TwinMOS website."
keywords: ["breadcrumb", "navigation", "wayfinding", "structured data", "SEO", "WCAG"]
persona: ["visitor", "buyer", "distributor"]
phase: P1
priority: P1
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: "BreadcrumbList"
ctas: []
cross_links: []
sources: ["BRD", "URD"]
---

# Breadcrumb Navigation

## Overview
Breadcrumbs provide users with a clear understanding of their current location within the website hierarchy and offer a quick way to navigate back to parent sections. They are essential for SEO (Schema.org structured data) and accessibility (WCAG 2.4.1 Bypass Blocks).

---

## Design Specifications

### Visual Style
- **Position**: Below the header, above the main content area
- **Background**: Transparent (inherits page background)
- **Text Color**: Gray (#6B7280) for links, dark (#111827) for current page
- **Font Size**: 14px
- **Padding**: 16px vertical, aligned with content container
- **Separator**: `>` (right angle bracket) with 8px horizontal spacing

### Separator
- **Character**: `>` (greater-than sign)
- **HTML**: `<span aria-hidden="true">&gt;</span>`
- **Spacing**: 0 8px
- **Color**: #9CA3AF (lighter gray)

### Current Page
- **Style**: Plain text (not a link), font-weight 500
- **Color**: #111827 (near-black)
- **ARIA**: `aria-current="page"`

---

## Home Link

### Label
"Home"

### Icon Option
Small home icon (🏠) before the text, hidden from screen readers:
```html
<span aria-hidden="true">🏠</span> Home
```

### Link Target
[/](/)

---

## Accessibility Requirements

### ARIA Attributes
- **Nav Container**: `<nav aria-label="Breadcrumb">`
- **List**: `<ol>` (ordered list, semantically correct for breadcrumbs)
- **Current Page**: `<span aria-current="page">Current Page</span>`
- **Hidden Separators**: `aria-hidden="true"` on all visual separators

### Keyboard Navigation
- All breadcrumb links are focusable via Tab key
- Focus order follows visual left-to-right order
- Current page (non-link) is not focusable

### Screen Reader Announcement
Screen readers announce: "Breadcrumb navigation, list of 4 items. Link: Home. Link: Products. Link: DRAM Memory. Current page: VOLTX DDR5."

### WCAG Compliance
- **WCAG 2.1 Level A**: Success Criterion 2.4.1 (Bypass Blocks)
- **WCAG 2.1 Level AA**: Success Criterion 2.4.4 (Link Purpose in Context)
- **WCAG 2.1 Level AA**: Success Criterion 1.4.3 (Contrast Minimum — 4.5:1)

---

## Responsive Behavior

### Desktop (≥1024px)
- Full breadcrumb trail displayed
- All items visible
- Horizontal layout

### Tablet (768–1023px)
- Full trail displayed
- May wrap to second line if too long
- Slightly reduced font size (13px)

### Mobile (<768px)
- **Option A**: Hide breadcrumbs entirely (if navigation is clear from page title)
- **Option B**: Show only parent + current: `... > Parent > Current`
- **Option C**: Collapse to dropdown: "You are here: {Current Page} ▼" with full trail in dropdown

**Recommended**: Option B for product pages (helpful context), Option A for simple pages.

---

## Truncation Rules

### Long Breadcrumb Handling
When breadcrumb exceeds available width:

1. **First Priority**: Truncate current page title with ellipsis (e.g., "VOLTX DDR5 RGB 6000MHz...")
2. **Second Priority**: Collapse middle sections with "..." expand button
3. **Third Priority**: Show only Home > ... > Parent > Current

### Maximum Items
- **Recommended Max**: 5 items (including Home)
- **Overflow Behavior**: Collapse middle items into "..." dropdown
- **Dropdown Content**: Clicking "..." reveals hidden middle items

---

## Complete Example Patterns

### Homepage
No breadcrumb displayed (user is at root).

### Product Category Page
Home > Products

### Product Subcategory Page
Home > Products > DRAM Memory Modules

### Product Detail Page
Home > Products > DRAM Memory Modules > VOLTX DDR5

### Product Detail (Long Name)
Home > Products > SSD & NVMe > CoreX Pro Gen5 NVMe SSD

### Support Hub
Home > Support

### Support Article
Home > Support > Installation Guides > How to Install DDR5 Memory

### About Section
Home > About > Leadership Team

### News Article
Home > News > Press Releases > TwinMOS Unveils CoreX Pro Gen5 at COMPUTEX 2025

### Event Page
Home > News > Events > COMPUTEX TAIPEI 2025

### Regional Page
Home > Regional > Middle East & Africa > United Arab Emirates

### Contact Page
Home > Contact

### Legal Page
Home > Legal > Privacy Policy

---

## Schema.org Structured Data

### JSON-LD Implementation
Every page with breadcrumbs must include BreadcrumbList structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.twinmos.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://www.twinmos.com/products/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "DRAM Memory Modules",
      "item": "https://www.twinmos.com/products/memory/"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "VOLTX DDR5",
      "item": "https://www.twinmos.com/products/memory/voltx-ddr5/"
    }
  ]
}
```

### SEO Benefits
- Rich snippets in Google search results
- Improved click-through rates
- Better understanding of site structure by crawlers
- Enhanced navigation in mobile search results

---

## Dynamic Generation Rules

### CMS-Driven
Breadcrumbs are automatically generated based on:
1. **URL Structure**: Parse URL segments to build trail
2. **Page Parent**: CMS parent page relationship
3. **Manual Override**: Content editors can specify custom breadcrumb text

### Product Pages
```
Home > Products > {Category} > {Subcategory} > {Product Name}
```

### Support Pages
```
Home > Support > {Category} > {Article Title}
```

### News Pages
```
Home > News > {Category} > {Article Title}
```

### Regional Pages
```
Home > Regional > {Region} > {Country}
```

---

## Edge Cases

### Deep Nesting (6+ levels)
**Before**: Home > Products > Memory > DDR5 > Desktop > VOLTX RGB  
**After**: Home > ... > DDR5 > Desktop > VOLTX RGB

### Duplicate Page Names
If two pages in the trail have the same name, append parent context:  
"Support > Warranty (Policy) > Warranty (Registration)"

### Missing Parent Pages
If a parent page is unpublished or deleted, link to the nearest valid ancestor.

### External Links in Trail
Breadcrumbs should only link to internal TwinMOS pages. External references are plain text.

---

## Implementation Checklist
- [ ] Breadcrumb nav is first element after `<header>` (before `<main>`)
- [ ] `<nav aria-label="Breadcrumb">` wrapper present
- [ ] `<ol>` used for list structure
- [ ] All separators have `aria-hidden="true"`
- [ ] Current page has `aria-current="page"`
- [ ] JSON-LD BreadcrumbList in `<head>`
- [ ] Responsive behavior tested on mobile
- [ ] Keyboard navigation verified
- [ ] Screen reader testing completed
- [ ] Schema validation passed (Google Rich Results Test)
