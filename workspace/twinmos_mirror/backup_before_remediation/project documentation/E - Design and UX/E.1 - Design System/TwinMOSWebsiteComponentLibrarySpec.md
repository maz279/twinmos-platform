# TwinMOS Website — Component Library Specification

**Document ID:** E.1.8
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose

Defines the atomic design component library for the TwinMOS website.

## 2. Atoms

### 2.1 Button

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| Primary | `#00A3E0` | White | None | `#0077A8` |
| Secondary | `#0A2540` | White | None | `#1A3A5C` |
| Accent | `#00F0FF` | `#0A0A0F` | None | `#33F3FF` |
| Ghost | Transparent | `#0A2540` | 1px `#0A2540` | `#F6F9FC` |
| Danger | `#EF4444` | White | None | `#DC2626` |

Sizes: Small (32px), Medium (40px), Large (48px).

### 2.2 Input

| State | Border | Background |
|-------|--------|------------|
| Default | `#D1D5DB` | `#FFFFFF` |
| Focus | `#00A3E0` (2px) | `#FFFFFF` |
| Error | `#EF4444` (2px) | `#FEF2F2` |
| Disabled | `#E5E7EB` | `#F9FAFB` |

### 2.3 Badge

| Type | Background | Text |
|------|------------|------|
| Default | `#F6F9FC` | `#0A2540` |
| Success | `#ECFDF5` | `#10B981` |
| Warning | `#FFFBEB` | `#F59E0B` |
| Error | `#FEF2F2` | `#EF4444` |
| Gaming | `#00F0FF` | `#0A0A0F` |

## 3. Molecules

### 3.1 Product Card

- Image: 16:10 aspect ratio
- Title: 18px SemiBold
- Specs: 14px Regular, 2-3 lines
- Price: 20px Bold (optional)
- CTA: Ghost button
- Hover: Lift + shadow

### 3.2 Search Bar

- Input + search icon + clear button
- Auto-suggest dropdown
- 48px height

## 4. Organisms

### 4.1 Header

- Height: 64px desktop, 56px mobile
- Logo left, nav center, actions right
- Sticky on scroll

### 4.2 Footer

- 4-column layout desktop
- Stacked mobile
- Newsletter signup
- Social links

### 4.3 Hero Section

- 600px height desktop
- Headline + subheadline + CTA
- Background image or video

## 5. Templates

### 5.1 Page Template

```
[Header]
[Hero]
[Content Blocks...]
[CTA]
[Footer]
```

### 5.2 Article Template

```
[Header]
[Article Header]
[Content]
[Related Articles]
[Footer]
```

## 6. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-01 | Final specification |
