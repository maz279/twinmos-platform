# TwinMOS Website — Spacing & Grid System

**Document ID:** E.1.7
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose

Defines the 8-pt grid system, spacing tokens, and responsive grid behavior for the TwinMOS website.

## 2. 8-Point Grid Foundation

All spacing values are multiples of 8px. Base unit: 4px for fine-tuning.

| Token | Value | Usage |
|-------|-------|-------|
| space-0_5 | 2px | Micro adjustments |
| space-1 | 4px | Tight gaps |
| space-2 | 8px | Default unit |
| space-3 | 12px | Small gaps |
| space-4 | 16px | Component padding |
| space-5 | 20px | Medium gaps |
| space-6 | 24px | Section padding |
| space-8 | 32px | Large gaps |
| space-10 | 40px | Section margins |
| space-12 | 48px | Major sections |
| space-16 | 64px | Hero spacing |
| space-20 | 80px | Page sections |
| space-24 | 96px | Major divisions |

## 3. Grid System

### 3.1 12-Column Grid

| Breakpoint | Columns | Gutter | Margin |
|------------|---------|--------|--------|
| Mobile (320px+) | 4 | 16px | 16px |
| Tablet (768px+) | 8 | 24px | 24px |
| Desktop (1024px+) | 12 | 24px | 32px |
| Wide (1440px+) | 12 | 32px | 48px |

### 3.2 Container

| Variant | Max Width | Padding |
|---------|-----------|---------|
| Default | 1280px | 32px |
| Wide | 1440px | 48px |
| Reading | 720px | 24px |
| Full | 100% | 0px |

## 4. Section Spacing

| Section Type | Mobile | Tablet | Desktop | Wide |
|-------------|--------|--------|---------|------|
| Hero | 48px | 64px | 80px | 96px |
| Content | 48px | 64px | 80px | 96px |
| Feature | 48px | 64px | 80px | 80px |
| CTA | 48px | 64px | 80px | 96px |
| Footer | 48px | 64px | 80px | 80px |

## 5. RTL Considerations

Use logical properties:
```css
.component {
  margin-inline-start: 24px;
  padding-inline: 16px;
  border-inline-end: 2px solid #00A3E0;
}
```

## 6. Tailwind Config

```javascript
module.exports = {
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
    },
  },
};
```

## 7. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-01 | Final specification |
