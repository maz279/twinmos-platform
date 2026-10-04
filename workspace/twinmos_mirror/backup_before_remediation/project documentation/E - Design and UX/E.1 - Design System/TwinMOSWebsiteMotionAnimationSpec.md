# TwinMOS Website — Motion & Animation Specification

**Document ID:** E.1.9
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose

Defines motion and animation standards for the TwinMOS website.

## 2. Performance Budget

- 60fps target for all animations
- GPU-accelerated properties only: transform, opacity
- No layout-triggering animations

## 3. Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| instant | 0ms | State changes |
| fast | 100ms | Micro-interactions |
| normal | 200ms | Standard transitions |
| slow | 300ms | Page transitions |
| dramatic | 500ms | Hero animations |

## 4. Easing Curves

| Name | Value | Usage |
|------|-------|-------|
| ease-out | cubic-bezier(0,0,0.2,1) | Entrances |
| ease-in-out | cubic-bezier(0.4,0,0.2,1) | Standard |
| spring | cubic-bezier(0.34,1.56,0.64,1) | Playful |

## 5. Micro-interactions

### 5.1 Button Hover

- Background color: 150ms ease
- Transform scale(1.02): 100ms ease

### 5.2 Card Hover

- translateY(-4px): 200ms ease-out
- Shadow increase: 200ms ease-out

### 5.3 Link Underline

- Width 0 to 100%: 150ms ease
- Direction: left to right (RTL: right to left)

## 6. Page Transitions

### 6.1 Page Load

- Content fade in: 300ms ease-out
- Stagger children: 50ms delay

### 6.2 Carousel

- Slide transition: 500ms ease-in-out
- Crossfade option: 400ms

## 7. Scroll Animations

### 7.1 Reveal on Scroll

- Trigger: Intersection Observer at 20%
- Animation: Fade + translateY(20px to 0)
- Duration: 400ms ease-out

## 8. Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## 9. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-01 | Final specification |
