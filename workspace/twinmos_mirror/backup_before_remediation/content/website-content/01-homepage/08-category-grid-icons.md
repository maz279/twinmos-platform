---
title: "Category Grid Icons"
slug: "category-grid"
url: "/homepage/category-grid"
template: "component"
description: "Five category cards with icons linking to product families."
keywords: ["categories", "product families", "grid", "icons", "homepage"]
persona: ["visitor", "buyer"]
phase: P1
priority: P0
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: []
cross_links: []
sources: []
---

# Category Grid Icons

## Overview
The category grid provides high-level pathway navigation to product families. It serves users who know what type of product they need but haven't yet decided on a specific SKU. The grid acts as a visual product directory, reducing cognitive load by grouping related products into recognizable categories.

**User Journey**: Homepage → Category Grid → Category Page → Product Detail → Purchase

---

## Section Header

### Headline
Explore by Category

### Subheadline
Find the right solution for your system — from legacy DDR3 to cutting-edge DDR5 and Gen5 NVMe.

---

## Card Design System

### Card Structure (All Cards)
1. **Icon Container** (80×80px, centered)
   - SVG icon, stroke style, 2px stroke width
   - Default: Brand primary color
   - Hover: Icon fills with brand color, white stroke

2. **Category Title**
   - 16px semibold, brand dark
   - Centered below icon

3. **Product Count Badge** (Optional)
   - "12 Products" — small pill badge
   - Muted background, small text
   - Updates dynamically from product catalog

4. **Description**
   - 14px regular, muted color
   - 2 lines max, centered
   - Hidden on mobile (<480px) to save space

5. **Hover State**
   - Background: Subtle brand tint (e.g., `#F0F4FF`)
   - Icon: Fill animation (stroke → filled)
   - Shadow: Subtle elevation
   - Transition: 200ms ease-out

---

## Card 1: DRAM Memory Modules

### Icon
**SVG**: Memory chip / RAM stick (dual inline module silhouette)
- Stroke: Brand primary
- Size: 64×64px viewbox

### Title
DRAM Memory Modules

### Product Count
"24+ Products"

### Description
Desktop, laptop, and gaming memory from DDR3 legacy to DDR5 flagship. Including VOLTX RGB, TornadoX7, Thunder GX, and Concord series.

### Link
[Browse DRAM](/products/memory)

### Analytics
- `category_card_impression` — category: "dram", position: 1
- `category_card_click` — category: "dram", position: 1

---

## Card 2: SSD & NVMe Storage

### Icon
**SVG**: M.2 SSD with heatsink silhouette
- Stroke: Brand primary
- Size: 64×64px viewbox

### Title
SSD & NVMe Storage

### Product Count
"18+ Products"

### Description
Internal storage from SATA III to PCIe Gen5. CoreX Pro, Xtreme, Alpha Pro, and Hyper H2 Ultra series for every performance tier.

### Link
[Browse SSDs](/products/ssd)

### Analytics
- `category_card_impression` — category: "ssd", position: 2
- `category_card_click` — category: "ssd", position: 2

---

## Card 3: Portable Storage

### Icon
**SVG**: Portable external drive with USB-C cable
- Stroke: Brand primary
- Size: 64×64px viewbox

### Title
Portable Storage

### Product Count
"8+ Products"

### Description
Take your data anywhere with ELITE Drive Pro portable SSDs and ProDrive Ultra portable HDDs. USB-C convenience, rugged reliability.

### Link
[Browse Portable Storage](/products/portable)

### Analytics
- `category_card_impression` — category: "portable", position: 3
- `category_card_click` — category: "portable", position: 3

---

## Card 4: USB Solutions

### Icon
**SVG**: USB hub with multiple ports + flash drive
- Stroke: Brand primary
- Size: 64×64px viewbox

### Title
USB Solutions

### Product Count
"6+ Products"

### Description
Expand your connectivity with TwinMOS USB Hubs and flash drives. Reliable, compact, and built for modern workflows.

### Link
[Browse USB](/products/usb)

### Analytics
- `category_card_impression` — category: "usb", position: 4
- `category_card_click` — category: "usb", position: 4

---

## Card 5: Gaming & eSports

### Icon
**SVG**: Joystick / game controller with RGB accents
- Stroke: Brand primary
- Size: 64×64px viewbox

### Title
Gaming & eSports

### Product Count
"15+ Products"

### Description
High-frequency DDR5 RGB, ultra-fast NVMe Gen5 SSDs, and low-latency configurations for competitive gaming and streaming.

### Link
[Browse Gaming](/gaming)

### Analytics
- `category_card_impression` — category: "gaming", position: 5
- `category_card_click` — category: "gaming", position: 5

---

## Grid Layout

### Desktop (≥1024px)
- 5-column equal grid
- Gap: 24px
- Card padding: 32px
- Container: Max-width 1280px

### Tablet (768–1023px)
- 3-column grid (first row: 3 cards, second row: 2 cards centered)
- Gap: 20px
- Card padding: 24px

### Mobile (480–767px)
- 2-column grid
- Gap: 16px
- Card padding: 20px
- Description hidden

### Mobile Small (<480px)
- 2-column grid
- Gap: 12px
- Card padding: 16px
- Icon size reduced to 48px
- Description hidden

---

## Scroll Animation
- Cards fade-in + scale(0.95 → 1) on viewport entry
- Stagger: 100ms delay between cards (left to right, top to bottom)
- Duration: 400ms
- Easing: ease-out

---

## Accessibility
- Cards are `<a>` elements (entire card clickable)
- Keyboard focus: Visible 2px outline offset
- Icon has `aria-hidden="true"` (decorative)
- Title is the accessible name of the link
- Description available to screen readers via `aria-describedby`
- Color contrast: All text meets WCAG AA

---

## CMS Configuration
Categories and product counts should be dynamically generated from the product catalog. Manual override available for:
- Category display order
- Icon selection (from SVG library)
- Description text (auto-generated from product tags or manual)
- Featured sub-category links (e.g., "[DDR5](/products/memory/ddr5) · [DDR4](/products/memory/ddr4)")

---

## Analytics Summary
| Event | Parameters |
|-------|-----------|
| `category_grid_view` | section: "category_grid" |
| `category_card_impression` | category, position, product_count |
| `category_card_click` | category, position, destination |
| `category_card_hover` | category, position |
