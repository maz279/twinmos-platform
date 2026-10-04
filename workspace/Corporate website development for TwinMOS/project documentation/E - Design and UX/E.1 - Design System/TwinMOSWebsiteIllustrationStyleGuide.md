# TwinMOS Website — Illustration Style Guide

**Document ID:** E.1.11 | **Version:** 1.0 | **Date:** 30 April 2026 | **Status:** FINAL

**Cross-References:** URD §20, §22.7, §27 | Brand Guideline | Color Palette | Imagery Guide

---

## 1. Overview

This document defines the illustration style for the TwinMOS corporate website. Illustrations communicate abstract concepts, guide users through empty states, and add personality to error pages and loading states across both Corporate (light) and Gaming (dark) modes.

**Principles:** Functional first, brand-aligned, scalable (SVG), lightweight (<20KB), accessible.

---

## 2. Illustration Categories

### Empty States
| Context | Concept | Size |
|---------|---------|------|
| No search results | Magnifying glass over memory module | 200×200px |
| No products | Empty product shelf | 240×200px |
| No compatibility | Device + question mark | 200×200px |
| No retailers | Map pin with "?" | 200×200px |
| Empty cart | Open box with dashed outline | 200×200px |

### Error States
| Error | Concept | Size |
|-------|---------|------|
| 404 | Disconnected memory module | 320×240px |
| 500 | Server rack with warning | 320×240px |
| Network error | Broken connection + retry arrow | 200×200px |
| Session expired | Lock with clock icon | 200×200px |
| Maintenance | Tools + logo + "back soon" | 320×240px |

### Success States
| Context | Concept | Size |
|---------|---------|------|
| Warranty registered | Shield + checkmark | 200×200px |
| RMA submitted | Package with shipping label | 200×200px |
| Newsletter subscribed | Envelope with heart | 160×160px |

---

## 3. Visual Style

### Art Direction
| Attribute | Corporate | Gaming |
|-----------|-----------|--------|
| Style | Clean, geometric, minimal | Bold, dynamic, energetic |
| Line weight | 1.5–2px | 2–3px |
| Corners | Rounded (4–8px) | Sharp or slightly rounded |
| Perspective | Flat or slight isometric | Dynamic angles |
| Human figures | Abstract silhouettes only | Abstract silhouettes only |

### Corporate Color Palette
| Element | Color | Usage |
|---------|-------|-------|
| Primary lines | `#0A2540` | Outlines, shapes |
| Secondary lines | `#5A6578` | Details |
| Accent fills | `#00A3E0` | Highlights |
| Primary fills | `#E6F7FF` | Surfaces |
| Secondary fills | `#F6F9FC` | Alternate surfaces |
| Success | `#00C853` | Positive states |
| Warning | `#FFB300` | Caution |
| Error | `#FF1744` | Error states |

### Gaming Color Palette
| Element | Color | Usage |
|---------|-------|-------|
| Primary lines | `#FFFFFF` | Outlines |
| Secondary lines | `#A0A0A0` | Details |
| Accent fills | `#00F0FF` | RGB highlights |
| Secondary accent | `#FF0055` | Magenta accents |
| Primary fills | `#1A1A1A` | Dark surfaces |
| Secondary fills | `#333333` | Alternate dark |

### Line Style
- Line cap: Round
- Line join: Round
- All elements have visible outline (no fill-only shapes)
- Dashed lines: "missing" or "optional" concepts only
- Dotted lines: connections, networks, data flow

### Shape Language
| Shape | Meaning | Usage |
|-------|---------|-------|
| Rounded rectangles | Products, containers | Hardware |
| Circles | Status, buttons, users | Actions, states |
| Triangles | Direction, play | CTAs, hints |
| Hexagons | Tech, chips, memory | Technology |
| Organic curves | Human, natural | Community |
| Straight lines | Connections, structure | Diagrams |

---

## 4. Size Hierarchy

| Type | Size | Usage |
|------|------|-------|
| Icon | 12–64px | UI elements |
| Small illustration | 80–160px | Inline with text |
| Medium illustration | 180–280px | Empty states |
| Large illustration | 300–480px | Error pages |
| Background | 100% container | Decorative |

### Responsive Sizing
| Breakpoint | Empty State | Error Page |
|-----------|-------------|-----------|
| Mobile | 160×160px | 240×180px |
| Tablet | 200×200px | 320×240px |
| Desktop | 240×240px | 400×300px |

---

## 5. Key Illustration Specifications

### 404 — Disconnected Memory
| Property | Value |
|----------|-------|
| Size | 320×240px (mobile: 240×180px) |
| Style | Isometric memory module separated from slot |
| Colors | `#0A2540` lines, `#E6F7FF` fill, `#00A3E0` accent |
| Animation | Subtle float (translateY ±4px, 3s loop) |

### 500 — Server Resting
| Property | Value |
|----------|-------|
| Size | 320×240px |
| Style | Server rack with "sleeping" indicator |
| Colors | Warning yellow `#FFB300`, neutral grays |

### Empty Search
| Property | Value |
|----------|-------|
| Size | 200×200px |
| Style | Magnifying glass over empty container |
| Colors | Muted `#5A6578`, `#00A3E0` accent |

### Maintenance Mode
| Property | Value |
|----------|-------|
| Size | 320×240px |
| Style | Tools + TwinMOS logo + progress indicator |
| Colors | `#0A2540`, `#00A3E0` |

### Gaming Empty Build
| Property | Value |
|----------|-------|
| Size | 240×200px |
| Style | PC case outline with RGB glow hints |
| Colors | Dark bg, `#00F0FF`, `#FF0055` |

---

## 6. Animation

### Allowed Animations
| Animation | Duration | Usage |
|-----------|----------|-------|
| Float | 3s loop | 404, empty states |
| Pulse | 2s loop | Loading states |
| Draw-in | 600ms | Success checkmarks |
| Bounce | 400ms | Drop pins |
| Fade-in | 300ms | All illustrations |
| Scale-in | 300ms | Success states |

### Constraints
- Respect `prefers-reduced-motion`
- Max 1 animation per illustration
- Use `transform` and `opacity` only
- Looping animations must be subtle

### Reduced Motion Fallback
```css
@media (prefers-reduced-motion: reduce) {
  .illustration-animated { animation: none; transform: none; }
}
```

---

## 7. SVG Technical Specs

### Requirements
| Property | Requirement |
|----------|-------------|
| Format | SVG |
| ViewBox | Explicitly defined |
| Inline vs External | Inline for above-fold; external for below |
| Optimization | SVGO (svgomg.github.io) |
| Max file size | 20KB |
| Accessibility | `<title>` element, `role="img"` |

### Template
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-labelledby="title">
  <title id="title">Description</title>
  <rect x="10" y="10" width="180" height="180" rx="8" fill="#F6F9FC" stroke="#0A2540" stroke-width="2"/>
</svg>
```

### Optimization Checklist
- [ ] Remove unnecessary `<g>` groups
- [ ] Remove editor metadata
- [ ] Minimize decimals (2–3 places)
- [ ] Remove unused defs
- [ ] Merge same-fill paths
- [ ] Use CSS classes for colors
- [ ] Correct viewBox
- [ ] Test at 50%, 100%, 200%

### CSS Variable Theming
```css
[data-theme="corporate"] {
  --illustration-primary: #E6F7FF;
  --illustration-stroke: #0A2540;
  --illustration-accent: #00A3E0;
}
[data-theme="gaming"] {
  --illustration-primary: #1A1A1A;
  --illustration-stroke: #FFFFFF;
  --illustration-accent: #00F0FF;
}
```

---

## 8. Inventory

### Phase 1 Required
| ID | Name | Context | Mode | Priority |
|----|------|---------|------|----------|
| ILL-001 | 404-disconnected | 404 page | Both | P0 |
| ILL-002 | 500-server-rest | 500 page | Both | P0 |
| ILL-003 | empty-search | No search results | Corporate | P0 |
| ILL-004 | empty-products | Category empty | Corporate | P0 |
| ILL-005 | empty-compatibility | No compatible products | Corporate | P0 |
| ILL-006 | empty-retailers | No retailers | Corporate | P0 |
| ILL-007 | maintenance-mode | Maintenance | Both | P0 |
| ILL-008 | warranty-success | Warranty registered | Corporate | P1 |
| ILL-009 | rma-success | RMA submitted | Corporate | P1 |
| ILL-010 | newsletter-success | Subscribed | Corporate | P1 |
| ILL-011 | compare-empty | Comparison empty | Corporate | P1 |
| ILL-012 | build-empty | No builds | Gaming | P2 |
| ILL-013 | network-error | Connection lost | Both | P1 |
| ILL-014 | file-too-large | Upload error | Both | P1 |
| ILL-015 | session-expired | Login required | Both | P1 |

### Phase 2+ Optional
| ID | Name | Context | Mode | Priority |
|----|------|---------|------|----------|
| ILL-016 | onboarding-compat | Compatibility intro | Corporate | P2 |
| ILL-017 | onboarding-wtb | Where to Buy intro | Corporate | P2 |
| ILL-018 | onboarding-warranty | Warranty intro | Corporate | P2 |
| ILL-019 | onboarding-rgb | RGB intro | Gaming | P2 |
| ILL-020 | achievement-build | Build approved | Gaming | P3 |

---

## 9. Creation Workflow

1. Identify need (empty state, error, etc.)
2. Sketch concept
3. Create in Figma with brand colors
4. Review with UX Lead + Brand Manager
5. Export SVG
6. Optimize with SVGOMG
7. Add accessibility attributes
8. Test in browser (all breakpoints)
9. Add to component library
10. Document in this guide

### Review Criteria
- [ ] Brand colors aligned
- [ ] Concept clear without text
- [ ] Under 20KB
- [ ] Scales cleanly
- [ ] Accessibility attributes present
- [ ] Reduced-motion fallback
- [ ] Consistent style
- [ ] No copyrighted elements

---

## 10. Usage Guidelines

**Do:** Use for empty/error states, keep style consistent, optimize SVGs, provide alt text, test responsive, use CSS variables for theming, respect reduced-motion.

**Don't:** Use as decoration only, mix styles, use raster formats, exceed 20KB, animate distractingly, use where icons suffice, forget accessibility.

---

*Document Owner: UX Lead / Brand Manager | Review: Monthly (active), Quarterly (post-launch)*
