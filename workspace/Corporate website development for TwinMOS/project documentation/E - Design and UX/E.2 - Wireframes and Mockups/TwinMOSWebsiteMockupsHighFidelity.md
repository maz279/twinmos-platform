# TwinMOS Website — High-Fidelity Mockups

Document ID: E.2.2 | Version: 1.0 | Date: 30 April 2026 | Status: FINAL

## 1. Overview

High-fidelity mockup specifications for the TwinMOS corporate website.

## 2. Design Tool Setup

### Figma File Structure
- 01 - Design System (Colors, Typography, Grid, Components)
- 02 - Corporate Pages (Homepage, Category, Product Detail, etc.)
- 03 - Gaming Hub (Gaming Homepage, VOLTX, RGB Showcase)
- 04 - CMS / Admin
- 05 - Responsive (Mobile, Tablet, Desktop)

### Figma Setup
- Frame width: 1440px (desktop), 768px (tablet), 375px (mobile)
- Grid: 12 columns, 24px gutter, 32px margin
- 8-pt grid enabled

## 3. Homepage Specifications

### Header
- Height: 64px, Background: #FFFFFF
- Logo: 140px, TwinMOS primary
- Nav: Inter 14px Medium, #1A1A2E
- Nav hover: #00A3E0, underline slide-in 150ms
- Contact CTA: Primary button medium

### Hero Section
- Background: #FFFFFF, Min-height: 600px
- Padding: 96px vertical
- Layout: 50/50 split
- Headline: Inter 48px Bold, #0A2540, line-height 1.1
- Subheadline: Inter 20px Regular, #5A6578
- CTA: Large primary + secondary buttons
- Carousel dots: 8px, active #00A3E0, inactive #E3E8EE

### Trust Bar
- Background: #F6F9FC, Padding: 24px vertical
- Text: Inter 14px Medium, #5A6578
- Partner logos: Grayscale, 40px, opacity 0.6

### Product Categories
- Background: #FFFFFF, Padding: 64px vertical
- Title: Inter 36px SemiBold, #0A2540
- Grid: 5 columns desktop, 3 tablet, 2 mobile
- Card: #F6F9FC bg, 12px radius, 48px icon #00A3E0
- Card hover: #E6F7FF bg, icon scale 1.1

### Featured Products
- Background: #FFFFFF, Padding: 64px vertical
- Title: Inter 36px SemiBold
- Grid: 4 columns desktop, 2 tablet, 1 mobile
- Product card component

### Brand Trust
- Background: #0A2540, Padding: 80px vertical
- Stats: Inter 48px Bold, #FFFFFF
- Labels: Inter 14px, #8B95A5
- Badges: White SVG, 60px

### News Teaser
- Background: #FFFFFF, Padding: 64px vertical
- Title: Inter 36px SemiBold
- Grid: 3 columns desktop, 2 tablet, 1 mobile

### Gaming CTA
- Background: #0D0D0D, Padding: 80px vertical
- Headline: Inter 40px Bold, #FFFFFF
- Subheadline: Inter 18px, #A0A0A0
- CTA: Gaming button variant
- Product image with RGB glow

### Footer
- Background: #0A2540, Padding: 64px top, 32px bottom
- Logo: White, 120px
- Column titles: Inter 16px SemiBold, #FFFFFF
- Links: Inter 14px, #8B95A5, hover #00A3E0
- Newsletter: 48px input + accent button
- Social icons: 24px, #8B95A5
- Legal: Inter 14px, #8B95A5

## 4. Product Category Page

### Page Header
- Breadcrumb: Inter 14px, #5A6578
- Title: Inter 36px SemiBold, #0A2540
- Count: Inter 16px, #5A6578
- Sort: Standard select, right-aligned

### Filter Sidebar
- Width: 280px, Background: #FFFFFF
- Section title: Inter 16px SemiBold
- Options: Inter 14px, #1A1A2E
- Checkbox: Custom 20px component
- Active filters: Pill badges with X
- Clear All: Accent text 14px

### Product Grid
- Columns: 3 desktop, 2 tablet, 1 mobile
- Gap: 24px
- Load more: Primary button centered

## 5. Product Detail Page

### Product Hero
- Layout: 50/50 split
- Main image: 1:1 ratio, 12px radius, zoom on click
- Thumbnails: 80px, 4px radius, active 2px accent border
- Badges: New (accent), Featured (primary)
- Name: Inter 32px SemiBold, #0A2540
- SKU: Inter 14px, #8B95A5, monospace
- Specs: Inter 16px, #5A6578, bullets
- Warranty: Success badge
- CTA: Large primary + ghost secondary

### Tab Navigation
- Horizontal, border-bottom #E3E8EE
- Active: Inter 14px SemiBold, #0A2540, bottom border 2px #00A3E0
- Inactive: Inter 14px, #5A6578
- Content padding: 32px top

### Spec Table
- Header: #0A2540 bg, #FFFFFF text, Inter 14px SemiBold
- Rows: Alternating #FFFFFF / #F6F9FC
- Parameter: 40% width, Inter 14px Medium, #5A6578
- Value: 60% width, Inter 14px, #1A1A2E
- Padding: 12px 16px, Border: 1px #E3E8EE

## 6. Gaming Hub

### Gaming Header
- Background: #0D0D0D
- Logo: White
- Nav: Inter 14px Medium, #FFFFFF, hover #00F0FF
- CTA: Gaming button

### Gaming Hero
- Background: #0D0D0D with animated gradient
- Headline: Inter 64px ExtraBold, #FFFFFF
- Subheadline: Inter 20px, #A0A0A0
- CTA: Gaming button
- RGB glow: Animated box-shadow, 4s cycle

### Gaming Product Cards
- Background: #1A1A1A
- Border: 1px #333333
- Hover border: 1px #00F0FF at 50%
- Hover shadow: 0 0 20px rgba(0,240,255,0.2)
- Name: Inter 18px SemiBold, #FFFFFF
- Specs: Inter 14px, #A0A0A0

## 7. Component States

### Button States
- Default: Base color
- Hover: Darken 10%, translateY(-1px), shadow-md
- Active: translateY(0), scale(0.98)
- Focus: 2px #00A3E0 outline, offset 2px
- Disabled: #E3E8EE bg, #8B95A5 text
- Loading: Spinner + reduced opacity

### Input States
- Default: Border #E3E8EE, bg #FFFFFF
- Hover: Border #C5CDD6
- Focus: Border #00A3E0, accent glow shadow
- Error: Border #FF1744, bg #FFF5F5, error glow
- Success: Border #00C853, bg #F5FFF8
- Disabled: Border #E3E8EE, bg #F6F9FC

### Card States
- Default: No transform, shadow-sm, border #E3E8EE
- Hover: translateY(-4px), shadow-md
- Focus: shadow-sm + outline #00A3E0
- Active: translateY(-2px), shadow-md, border #00A3E0

## 8. Responsive Specifications

### Breakpoint Frames
- Mobile: 375px (iPhone 14 Pro)
- Tablet: 768px (iPad Mini)
- Desktop: 1440px
- Wide: 1920px

### Responsive Adaptations
| Element | Mobile | Tablet | Desktop | Wide |
|---------|--------|--------|---------|------|
| Container padding | 16px | 24px | 32px | 48px |
| Hero headline | 32px | 40px | 48px | 56px |
| Product grid | 1 col | 2 col | 3 col | 4 col |
| Category grid | 2 col | 3 col | 5 col | 5 col |
| Footer columns | 1 col | 2 col | 4 col | 4 col |
| Header nav | Hamburger | Hamburger | Horizontal | Horizontal |
| Filter panel | Bottom sheet | Sidebar | Sidebar | Sidebar |

## 9. Figma Handoff

### Checklist
- [ ] All frames named and organized
- [ ] All layers properly named
- [ ] Colors use shared styles
- [ ] Typography uses shared styles
- [ ] Components use auto-layout
- [ ] Spacing follows 8-pt grid
- [ ] All states shown
- [ ] Responsive variants created
- [ ] Prototype flows connected
- [ ] Export settings configured

### Export Settings
- Icons: SVG, 1x
- Logos: SVG, 1x
- Illustrations: SVG, 1x
- Product images: WebP, 1x + 2x, 80%
- Hero images: WebP, 1x + 2x, 85%
- Screenshots: PNG, 2x

---

Document Owner: UX Lead / UI Designer | Review: Per sprint

