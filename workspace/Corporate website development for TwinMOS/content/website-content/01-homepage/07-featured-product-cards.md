---
title: "Featured Product Cards"
slug: "featured-products"
url: "/homepage/featured-products"
template: "component"
description: "Four spotlighted product cards for the TwinMOS homepage."
keywords: ["featured products", "spotlight", "homepage", "DDR5", "NVMe", "SSD"]
persona: ["buyer", "gamer", "enthusiast"]
phase: P1
priority: P0
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: ["view-product", "where-to-buy"]
cross_links: []
sources: []
---

# Featured Product Cards

## Overview
The featured products section is the primary product discovery driver on the homepage. It showcases four flagship SKUs that represent the breadth of TwinMOS's portfolio — from enthusiast gaming memory to professional portable storage. Card design must balance visual appeal with information density to drive clicks without overwhelming.

**Business Rule**: Product selection managed via CMS. Marketing team can swap SKUs quarterly or during campaign periods. Default selection prioritizes highest-margin and newest-release products.

---

## Section Header

### Headline
Featured Products

### Subheadline
Engineered for performance. Backed by decades of innovation.

### Section CTA (Optional)
"[View All Products](/products)" — Text link with arrow, right-aligned beside headline on desktop

---

## Card Design System

### Card Structure (All Cards)
Each card follows a consistent template:

1. **Image Container** (aspect ratio 4:3, max-height 240px)
   - Product hero shot on neutral background
   - Hover: Image scales 1.05×, subtle shadow increase
   - Badge overlay (top-left): Series badge or "New" flag

2. **Product Name**
   - 18px bold, brand dark color
   - Max 2 lines, truncate with ellipsis

3. **Tagline**
   - 14px regular, brand accent color
   - Single line descriptor

4. **Spec Highlights**
   - 2–3 key specs as icon + text chips
   - 12px, muted color

5. **Price** (if e-commerce enabled for region)
   - Starting price in local currency
   - "From $XX.XX" format

6. **CTA Row**
   - Primary: "View Product" — filled button
   - Secondary: "Compare" — text link with checkbox icon

7. **Wishlist/Quick Actions** (hover-only on desktop)
   - Heart icon for wishlist
   - Quick-view eye icon

### Card Hover State
- Image: Scale 1.05× with 300ms ease-out transition
- Card: Shadow elevates (0 4px 20px rgba(0,0,0,0.12))
- CTA Button: Background darkens, icon shifts right 4px
- Quick actions: Fade in at top-right corner

---

## Card 1: VOLTX DDR5 RGB

### Product Name
VOLTX DDR5 RGB

### Tagline
Next-Gen Gaming Memory

### Series Badge
"Gaming" — Red accent badge

### Spec Highlights
- 5600MHz / 6000MHz speeds
- 8GB | 16GB | 32GB capacities
- Dynamic RGB lighting (major motherboard sync)
- Intel XMP 3.0 & AMD EXPO ready

### Warranty Badge
"Limited Lifetime" — Small shield icon + text

### CTA
- **Primary**: [View Product](/products/memory/voltx-ddr5-rgb) — Filled primary button
- **Secondary**: [Compare](/products/compare?skus=voltx-ddr5-rgb) — Text link

### Image
- **Src**: `/assets/images/products/voltx-ddr5-rgb-card.jpg`
- **Alt**: "TwinMOS VOLTX DDR5 RGB memory module with illuminated aluminum heat spreader showing spectrum lighting."
- **Dimensions**: 800×600px

### Analytics
- `featured_product_impression` — product: "voltx-ddr5-rgb", position: 1
- `featured_product_click` — product: "voltx-ddr5-rgb", position: 1

---

## Card 2: CoreX Pro Gen5 NVMe

### Product Name
CoreX Pro Gen5 NVMe

### Tagline
PCIe 5.0 Speed Demon

### Series Badge
"Pro" — Blue accent badge

### Spec Highlights
- Up to 14,000 MB/s sequential read
- PCIe Gen5 ×4 NVMe 2.0 interface
- 1TB | 2TB | 4TB capacities
- Advanced thermal management heatsink

### Warranty Badge
"5-Year Warranty" — Small shield icon + text

### CTA
- **Primary**: [View Product](/products/ssd/corex-pro-gen5) — Filled primary button
- **Secondary**: [Compare](/products/compare?skus=corex-pro-gen5) — Text link

### Image
- **Src**: `/assets/images/products/corex-pro-gen5-card.jpg`
- **Alt**: "TwinMOS CoreX Pro Gen5 NVMe SSD with integrated aluminum heatsink."
- **Dimensions**: 800×600px

### Analytics
- `featured_product_impression` — product: "corex-pro-gen5", position: 2
- `featured_product_click` — product: "corex-pro-gen5", position: 2

---

## Card 3: ELITE Drive Pro Portable SSD

### Product Name
ELITE Drive Pro

### Tagline
Professional Portable Storage

### Series Badge
"Portable" — Green accent badge

### Spec Highlights
- USB 3.2 Gen 2 Type-C (up to 1,050 MB/s)
- 500GB | 1TB | 2TB capacities
- Shock-resistant aluminum unibody
- Universal compatibility (Windows, macOS, Android)

### Warranty Badge
"3-Year Warranty" — Small shield icon + text

### CTA
- **Primary**: [View Product](/products/portable/elite-drive-pro) — Filled primary button
- **Secondary**: [Compare](/products/compare?skus=elite-drive-pro) — Text link

### Image
- **Src**: `/assets/images/products/elite-drive-pro-card.jpg`
- **Alt**: "TwinMOS ELITE Drive Pro portable SSD with USB-C cable on modern desk."
- **Dimensions**: 800×600px

### Analytics
- `featured_product_impression` — product: "elite-drive-pro", position: 3
- `featured_product_click` — product: "elite-drive-pro", position: 3

---

## Card 4: TornadoX7 Pro DDR4

### Product Name
TornadoX7 Pro DDR4

### Tagline
Reliable Performance, Exceptional Value

### Series Badge
"Value" — Orange accent badge

### Spec Highlights
- 3200MHz CL16 optimized latency
- DDR4 desktop memory
- Intel & AMD platform compatible
- Black aluminum heat spreader

### Warranty Badge
"Limited Lifetime" — Small shield icon + text

### CTA
- **Primary**: [View Product](/products/memory/tornadox7-pro-ddr4) — Filled primary button
- **Secondary**: [Compare](/products/compare?skus=tornadox7-pro-ddr4) — Text link

### Image
- **Src**: `/assets/images/products/tornadox7-pro-ddr4-card.jpg`
- **Alt**: "TwinMOS TornadoX7 Pro DDR4 memory module with black aluminum heat spreader."
- **Dimensions**: 800×600px

### Analytics
- `featured_product_impression` — product: "tornadox7-pro-ddr4", position: 4
- `featured_product_click` — product: "tornadox7-pro-ddr4", position: 4

---

## Grid Layout

### Desktop (≥1024px)
- 4-column equal grid
- Gap: 24px
- Container: Max-width 1280px, centered

### Tablet (768–1023px)
- 2×2 grid
- Gap: 20px

### Mobile (<768px)
- Single column, stacked
- Gap: 16px
- Full-width cards with container padding

### Mobile Carousel (Optional A/B Test)
- Horizontal scroll carousel
- Card width: 85vw
- Snap scroll to card boundaries
- Peek of next card visible (5vw)

---

## Scroll Animation
- Cards fade-in + translateY(30px → 0) on viewport entry
- Stagger: 150ms delay between each card (left to right)
- Duration: 500ms per card
- Easing: ease-out

---

## Accessibility
- Cards are keyboard-navigable (Tab order follows visual layout)
- Focus state: 2px outline offset, visible on all cards
- Product names are `<h3>` elements for heading hierarchy
- Images have descriptive `alt` text
- Compare checkbox has associated `<label>`
- Color contrast: All text meets WCAG AA against card background

---

## CMS Configuration
```yaml
featured_products:
  - sku: "voltx-ddr5-rgb"
    position: 1
    badge: "gaming"
    active: true
  - sku: "corex-pro-gen5"
    position: 2
    badge: "pro"
    active: true
  - sku: "elite-drive-pro"
    position: 3
    badge: "portable"
    active: true
  - sku: "tornadox7-pro-ddr4"
    position: 4
    badge: "value"
    active: true
```

---

## Analytics Summary
| Event | Parameters |
|-------|-----------|
| `featured_section_view` | section: "featured_products" |
| `featured_product_impression` | product, position, badge |
| `featured_product_click` | product, position, destination |
| `featured_product_compare_toggle` | product, checked |
| `featured_product_quickview` | product |
| `featured_product_wishlist` | product, action |
| `view_all_products_click` | source: "featured_section" |
