---
title: "Trust Band Copy"
slug: "trust-band"
url: "/homepage/trust-band"
template: "component"
description: "Below-hero trust strip copy for the TwinMOS homepage."
keywords: ["trust", "certifications", "stats", "homepage"]
persona: ["visitor", "buyer", "distributor"]
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

# Trust Band Copy

## Overview
The trust band is a critical credibility element positioned immediately below the hero carousel. It must communicate TwinMOS's legitimacy, scale, and standards compliance within 3 seconds of viewing. Research shows that B2B buyers and technical consumers look for certification and company scale signals before engaging with product content.

**Visibility Rule**: Always visible on homepage load. Do not lazy-load.

---

## Layout

### Desktop (≥1024px)
- Single horizontal strip, full container width
- Two sub-rows: Certification logos (top) + Statistics (bottom)
- Or single row with logos left, stats right (if space permits)

### Tablet (768–1023px)
- Certification logos: horizontally scrollable row, 4 visible
- Statistics: 3-column grid + 2-column grid below

### Mobile (<768px)
- Certification logos: horizontally scrollable carousel, 3 visible
- Statistics: 2-column grid, stacked vertically

---

## Certification Logos Row

### Display Rules
- **Style**: Monochrome (grayscale) by default; brand color on hover
- **Size**: Max height 48px, proportional width
- **Spacing**: 32px gap between logos
- **Tooltip**: Full certification name on hover (e.g., "ISO 9001 Quality Management")
- **Click**: Navigates to `/about/certifications` with anchor to specific cert

### Certifications (left to right)
1. **ISO 9001** — Quality Management Systems
2. **CE** — European Conformity
3. **UKCA** — UK Conformity Assessed
4. **FCC** — Federal Communications Commission (USA)
5. **RoHS** — Restriction of Hazardous Substances
6. **REACH** — Chemical Registration (EU)
7. **EAC** — Eurasian Conformity
8. **JEDEC** — Solid State Technology Association Standards

### Accessibility
- Each logo has `alt` text with certification name
- `aria-label` on container: "TwinMOS certifications and compliance standards"
- Keyboard focusable with visible focus ring

---

## Statistics Row

### Stat 1: Years of Heritage
**Number**: "27+"  
**Label**: "Years of Excellence"  
**Tooltip**: "Founded in 1998. Over two decades of memory and storage innovation."  
**Animation**: Count-up from 0 to 27 on scroll into viewport (1.5s duration)

### Stat 2: Global Reach
**Number**: "93+"  
**Label**: "Countries Reached"  
**Tooltip**: "Active distribution and support across 93+ countries on 6 continents."  
**Animation**: Count-up from 0 to 93 on scroll into viewport (2s duration)

### Stat 3: Company Scale
**Number**: "301–500"  
**Label**: "Global Employees"  
**Tooltip**: "Worldwide team across R&D, manufacturing, sales, and support functions."  
**Animation**: Fade-in with slight upward translate

### Stat 4: Engineering Pedigree
**Number**: "4719"  
**Label**: "USB-IF Vendor ID"  
**Tooltip**: "Official USB Implementers Forum Vendor ID — proof of standards membership and engineering legitimacy."  
**Animation**: Fade-in with slight upward translate (100ms delay after Stat 3)

### Stat 5: Standards Body
**Number**: "000B9D"  
**Label**: "IEEE OUI"  
**Tooltip**: "Official IEEE Organizationally Unique Identifier assigned to TwinMOS Technologies."  
**Animation**: Fade-in with slight upward translate (200ms delay after Stat 3)

---

## Supporting Text
**Tagline**: "TwinMOS Technologies — where Innovation, Perfection, and Quality meet global standards."
- Position: Centered below statistics row (desktop only; hidden on mobile)
- Style: Italic, muted text color, 14px

---

## Link
**[View All Certifications](/about/certifications)**
- Position: Right-aligned below statistics row (desktop); centered (mobile)
- Style: Text link with arrow icon
- Tracking: `trust_band_link_click`, label: "view_all_certifications"

---

## Visual Treatment
- **Background**: `#F8F9FA` (light gray) or subtle linear gradient `#F8F9FA → #FFFFFF`
- **Border**: 1px solid `#E9ECEF` top and bottom
- **Padding**: 40px vertical, container horizontal padding
- **Dividers**: Thin 1px `#DEE2E6` vertical lines between stat columns (desktop only)
- **Typography**:
  - Numbers: 36px bold, brand primary color
  - Labels: 12px uppercase, letter-spacing 0.05em, muted color
  - Tagline: 14px italic, muted color
- **Hover Effects**: Certification logos transition to brand color on hover; stats show tooltip

---

## Animation & Interaction
- **Scroll Trigger**: Fade-in + translateY(20px → 0) when section enters viewport
- **Stagger**: 100ms delay between each stat element
- **Count-up Animation**: Numbers animate from 0 to final value using ease-out
- **Reduced Motion**: Static display, no count-up animation
- **Logo Hover**: Grayscale → brand color, 200ms transition

---

## Responsive Behavior
| Breakpoint | Certification Layout | Stats Layout | Tagline |
|------------|---------------------|--------------|---------|
| Desktop ≥1024px | Horizontal row, all visible | 5-column equal | Visible |
| Tablet 768–1023px | Horizontal scroll, 4 visible | 3+2 grid | Hidden |
| Mobile <768px | Horizontal scroll, 3 visible | 2-column, 3 rows | Hidden |
| Mobile SM <480px | Horizontal scroll, 2 visible | 2-column, 3 rows | Hidden |

---

## Analytics Tracking
- `trust_band_view` — Section enters viewport
- `cert_logo_hover` — Certification logo hovered (with cert name)
- `cert_logo_click` — Certification logo clicked (with cert name)
- `stat_hover` — Statistic hovered (with stat label)
- `view_certifications_click` — "View All Certifications" link clicked

---

## Schema.org Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TwinMOS Technologies",
  "foundingDate": "1998",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "minValue": 301,
    "maxValue": 500
  },
  "areaServed": "Global",
  "hasCredential": [
    "ISO 9001",
    "CE",
    "UKCA",
    "FCC",
    "RoHS",
    "REACH",
    "EAC",
    "JEDEC"
  ]
}
```
