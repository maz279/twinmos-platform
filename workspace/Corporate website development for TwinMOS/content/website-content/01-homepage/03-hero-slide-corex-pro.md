---
title: "Hero Slide — CoreX Pro Gen5 NVMe"
slug: "hero-corex-pro"
url: "/homepage/hero/corex-pro"
template: "hero-slide"
description: "Homepage hero slide for CoreX Pro Gen5 NVMe SSD."
keywords: ["CoreX Pro", "Gen5", "NVMe", "SSD", "PCIe 5.0", "hero"]
persona: ["enthusiast", "professional", "buyer"]
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

# Hero Slide — CoreX Pro Gen5 NVMe

## Slide Overview
**Position**: Slide 2 of 4
**Target Persona**: PC enthusiasts, content creators, workstation professionals, power users
**Campaign Theme**: Cutting-edge storage performance and professional productivity
**Seasonality**: Year-round; emphasize during back-to-school and professional upgrade seasons

---

## Headline
CoreX Pro Gen5 — Speed Without Limits

## Subheadline
Harness PCIe 5.0 performance with sequential read speeds up to 14,000 MB/s. Built on advanced 3D NAND with a high-performance controller, the CoreX Pro Gen5 obliterates load times for next-generation workstations, gaming rigs, and creative pipelines.

## Key Specs Bullet List
- **Interface**: PCIe Gen5 ×4 NVMe 2.0
- **Read Speed**: Up to 14,000 MB/s (sequential)
- **Write Speed**: Up to 12,000 MB/s (sequential)
- **Capacities**: 1TB | 2TB | 4TB
- **Controller**: Advanced multi-core NVMe controller with DRAM cache
- **NAND**: 3D TLC NAND flash
- **Warranty**: 5 Years with TBW endurance rating
- **Use Case**: 4K/8K video editing, 3D rendering, AAA gaming, AI/ML workloads

## Primary CTA
**Explore CoreX Pro** → `/products/ssd/corex-pro-gen5`
- Button style: Filled primary (brand blue)
- Icon: Arrow right
- Tracking: `hero_cta_click`, label: "explore_corex_pro", position: "slide_2"

## Secondary CTA
**Find a Retailer** → `/where-to-buy`
- Button style: Outline white
- Icon: Map pin
- Tracking: `hero_cta_click`, label: "find_retailer", position: "slide_2"

## Background / Visual Direction
- **Aesthetic**: Sleek metallic texture with speed lines and motion blur effect
- **Product Shot**: SSD floating at dynamic 20° angle with realistic reflection on brushed aluminum surface
- **Lighting**: Dramatic rim lighting highlighting heatsink fins; electric blue accent glow from controller area
- **Animation**: Speed lines animate outward from product on slide entry; subtle floating hover effect
- **Video Option**: 6-second loop showing data transfer visualization with speedometer graphic
- **Fallback**: Static image with CSS speed-line overlay animation

## Overlay Text Position
- **Desktop**: Bottom-left aligned, max-width 600px, padding 80px from edges
- **Tablet**: Bottom-left, max-width 500px, padding 48px
- **Mobile**: Bottom-center, full-width with 24px padding, text-align center

## Performance Badge
**Primary Badge**: "Up to 14,000 MB/s Read Speed"
- Position: Top-left of text overlay area
- Style: Tech-inspired angular badge, electric blue background, white text
- Animation: Counter animation from 0 to 14,000 on slide entry

**Secondary Badge** (optional): "PCIe 5.0 Ready"
- Position: Adjacent to primary badge
- Style: Outline badge, semi-transparent

## Performance Highlights (Optional Micro-copy)
- "14,000 MB/s Sequential Read"
- "PCIe Gen5 ×4 NVMe 2.0"
- "5-Year Warranty"
- Displayed as small icon + text chips below subheadline

## Accessibility
- **Alt Text**: "TwinMOS CoreX Pro Gen5 NVMe SSD with aluminum heatsink floating above a reflective brushed metal surface with electric blue speed effect lines."
- **ARIA**: Slide announced as "Slide 2 of 4: CoreX Pro Gen5 NVMe SSD"
- **Reduced Motion**: Static image, no speed-line animation or counter
- **Color Contrast**: All text meets WCAG AA against dark metallic background

## SEO Considerations
- **Slide Title** (visually hidden H2): "CoreX Pro Gen5 NVMe SSD"
- **Image Filename**: `hero-corex-pro-gen5-desktop.jpg`
- **Image Dimensions**: 1920×1080 (desktop), 1280×720 (tablet), 750×1334 (mobile)
- **Lazy Loading**: Lazy-loaded (not first slide)

## Localization Notes
- Speeds in MB/s are universal; no conversion needed
- "Gen5" and "PCIe" are standard technical terms globally
- Professional use cases (video editing, 3D rendering) resonate internationally
- Warranty period may require regional legal review

## Analytics Events
- `hero_slide_impression` — Slide becomes visible (slide_index: 2)
- `hero_slide_engagement` — User interacts with slide (hover 2+ seconds)
- `hero_cta_click` — CTA button clicked (with cta_type, slide_index)
- `hero_badge_impression` — Performance badge viewed

## A/B Testing Variants
- **Variant A** (current): "Speed Without Limits" — Performance-focused
- **Variant B**: "Your Workflow, Unleashed" — Productivity-focused
- **Variant C**: "14,000 MB/s. Zero Compromise." — Spec-forward headline
- Test metric: Click-through rate on primary CTA
