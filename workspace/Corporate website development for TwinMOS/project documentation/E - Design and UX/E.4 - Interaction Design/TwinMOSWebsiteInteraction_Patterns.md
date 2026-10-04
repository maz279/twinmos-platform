# TwinMOS Website — Interaction Patterns Design Document

**Document ID:** E.4.2
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document defines reusable interaction patterns used across the TwinMOS website. Each pattern includes behavior, states, animations, and accessibility considerations.

**Cross-references:**
- E.1.9 Motion & Animation Specification
- E.4.1 User Flows
- E.3.3 Accessibility Design Specification

## 2. Navigation Patterns

### 2.1 Primary Navigation

**Behavior:**
- Desktop: Horizontal menu, dropdown on hover (200ms delay)
- Mobile: Hamburger menu, full-screen overlay
- Active state: Underline + color `#00A3E0`

**States:**

| State | Visual | Transition |
|-------|--------|------------|
| Default | `#1A1A2E` text | — |
| Hover | `#00A3E0` text | 150ms ease |
| Active | `#00A3E0` text + underline | 200ms ease |
| Focus | 2px outline `#00A3E0` | Instant |
| Disabled | `#9CA3AF` text | — |

**Dropdown:**
- Trigger: Hover (desktop) / Tap (mobile)
- Animation: Fade + slide down (200ms ease-out)
- Close: Mouse leave (desktop) / Tap outside (mobile)

### 2.2 Breadcrumbs

**Behavior:**
- Separator: `>` character
- Current page: No link, `#6B7280` text
- Clickable: Previous pages link to respective URLs

**Example:**
```
Home > Products > DDR5 Memory > VOLTX RGB 32GB
 [Link]  [Link]   [Link]      [Current]
```

### 2.3 Skip Link

**Behavior:**
- Hidden by default, visible on first Tab
- Links to `#main-content`
- Style: Fixed top-left, `#0A2540` bg, white text

## 3. Input Patterns

### 3.1 Text Input

**States:**

| State | Border | Background | Label |
|-------|--------|------------|-------|
| Default | `#D1D5DB` | `#FFFFFF` | `#4B5563` |
| Hover | `#9CA3AF` | `#FFFFFF` | `#4B5563` |
| Focus | `#00A3E0` (2px) | `#FFFFFF` | `#00A3E0` |
| Error | `#EF4444` (2px) | `#FEF2F2` | `#EF4444` |
| Success | `#10B981` (2px) | `#ECFDF5` | `#10B981` |
| Disabled | `#E5E7EB` | `#F9FAFB` | `#9CA3AF` |
| Filled | `#D1D5DB` | `#FFFFFF` | `#0A2540` |

**Animation:**
- Label float: 150ms ease on focus/fill
- Error shake: 300ms horizontal shake

### 3.2 Search Input

**Behavior:**
- Icon: Search (left), Clear X (right when filled)
- Auto-suggest: Dropdown after 2+ characters, 150ms debounce
- Keyboard: Enter submits, Escape clears

### 3.3 Dropdown / Select

**Behavior:**
- Trigger: Click/tap on field
- Options: Scrollable list, max 8 visible
- Selection: Closes dropdown, updates field
- Multi-select: Checkboxes, chips appear below

**Animation:**
- Open: Fade + scale from top (150ms)
- Close: Fade out (100ms)

## 4. Feedback Patterns

### 4.1 Toast Notifications

**Types:**

| Type | Icon | Background | Duration |
|------|------|------------|----------|
| Success | Checkmark | `#ECFDF5` | 4 seconds |
| Error | X circle | `#FEF2F2` | 6 seconds |
| Warning | Triangle | `#FFFBEB` | 5 seconds |
| Info | Info circle | `#EFF6FF` | 4 seconds |

**Behavior:**
- Position: Top-right (desktop), top-full-width (mobile)
- Entry: Slide from right + fade (300ms)
- Exit: Fade out (200ms)
- Action: Manual dismiss via X or auto-dismiss
- Stacking: Max 3, newest on top

### 4.2 Loading States

**Spinner:**
- Size: 24px (inline), 48px (page)
- Color: `#00A3E0`
- Animation: 360deg rotation, 800ms linear infinite

**Skeleton:**
- Background: `#E5E7EB`
- Shimmer: Gradient sweep left-to-right, 1.5s infinite
- Used for: Cards, lists, content blocks

### 4.3 Progress Indicators

**Linear:**
- Height: 4px
- Track: `#E5E7EB`
- Fill: `#00A3E0`
- Animation: Width transition 300ms ease

**Circular:**
- Size: 48px
- Stroke: 4px
- Color: `#00A3E0`
- Used for: File uploads, multi-step forms

## 5. Selection Patterns

### 5.1 Checkbox

**States:**

| State | Visual |
|-------|--------|
| Unchecked | 20px square, 2px `#D1D5DB` border |
| Checked | `#00A3E0` fill, white checkmark |
| Indeterminate | `#00A3E0` fill, white dash |
| Disabled | `#E5E7EB` bg, `#9CA3AF` border |
| Error | `#EF4444` border |

**Animation:**
- Check: Scale bounce (150ms spring)

### 5.2 Radio Button

**States:**

| State | Visual |
|-------|--------|
| Unchecked | 20px circle, 2px `#D1D5DB` border |
| Checked | `#00A3E0` outer, 8px white inner |
| Disabled | `#E5E7EB` bg, `#9CA3AF` border |

**Animation:**
- Select: Inner dot scale (150ms ease-out)

### 5.3 Toggle Switch

**States:**

| State | Track | Thumb |
|-------|-------|-------|
| Off | `#D1D5DB` | Left, `#FFFFFF` |
| On | `#00A3E0` | Right, `#FFFFFF` |
| Disabled | `#E5E7EB` | `#F3F4F6` |

**Animation:**
- Slide: 200ms ease

## 6. Overlay Patterns

### 6.1 Modal / Dialog

**Behavior:**
- Trigger: Button click
- Backdrop: `#0A2540` at 50% opacity
- Close: X button, Escape key, backdrop click
- Focus: Traps focus within modal
- Scroll: Body scroll locked

**Animation:**
- Open: Backdrop fade (200ms), content scale + fade (300ms)
- Close: Reverse (200ms)

**Sizes:**

| Size | Width | Use Case |
|------|-------|----------|
| Small | 400px | Confirmations, alerts |
| Medium | 560px | Forms, detail views |
| Large | 800px | Media galleries, comparisons |
| Full | 100% | Mobile menus, immersive |

### 6.2 Tooltip

**Behavior:**
- Trigger: Hover (desktop), long-press (mobile)
- Position: Auto (top/bottom/left/right)
- Close: Mouse leave or 3s timeout

**Style:**
- Background: `#0A2540`
- Text: `#FFFFFF`, 14px
- Padding: 8px 12px
- Border-radius: 6px
- Arrow: 6px triangle

**Animation:**
- Appear: Fade + translate 4px (150ms)

### 6.3 Popover

**Behavior:**
- Trigger: Click
- Close: Click outside, Escape
- Used for: Filters, menus, info panels

## 7. Data Display Patterns

### 7.1 Pagination

**Style:**
- Previous/Next: Text + chevron
- Pages: Number buttons
- Current: `#00A3E0` bg, white text
- Other: `#FFFFFF` bg, `#1A1A2E` text

**Behavior:**
- Ellipsis for large ranges
- Mobile: Prev/Next + current page only

### 7.2 Tabs

**Style:**
- Underline style: Bottom border indicator
- Pill style: Rounded background indicator

**Behavior:**
- Click switches content panel
- Keyboard: Arrow keys navigate
- URL: Optional hash update

### 7.3 Accordion

**Behavior:**
- Click header expands/collapses
- Multi-expand or single-expand (configurable)
- Keyboard: Enter/Space toggles

**Animation:**
- Expand: Height 0 to auto (300ms ease)
- Icon: Chevron rotates 180deg (200ms)

## 8. E-Commerce Patterns (Phase 3)

### 8.1 Add to Cart

**Behavior:**
- Click: Button state changes to "Added"
- Animation: Product image flies to cart icon
- Toast: "Added to cart" confirmation

### 8.2 Compare Products

**Behavior:**
- Checkbox selection on product cards
- Max 4 products
- Sticky compare bar appears at bottom
- Click opens comparison modal/table

## 9. Gaming Hub Patterns

### 9.1 RGB Preview

**Behavior:**
- Interactive color picker
- Real-time product image update
- Preset modes: Static, breathing, rainbow

### 9.2 Spec Comparison

**Behavior:**
- Side-by-side table
- Highlight differences
- Expandable detailed specs

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-04-15 | Initial pattern library |
| 0.5 | 2026-04-25 | Added gaming patterns |
| 1.0 | 2026-05-01 | Final specification |
