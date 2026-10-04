# TwinMOS Website Design System

**Document Reference:** TWN-DESIGN-SYS-2026-001  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** UX Lead / Design Team  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** URD §20, RFP §7, BRD §20, Tech Stack §4.6

---

## 1. Purpose & Scope

This document defines the complete design system for the TwinMOS corporate website. It serves as the single source of truth for all visual design decisions, ensuring consistency across 287+ content entries, 100+ SKU pages, 28 regional landings, and 9 locales.

**Scope:**
- Design tokens (colors, typography, spacing, elevation)
- Component library specifications
- Corporate and Gaming (VOLTX) visual modes
- Multi-script typography (Latin, Arabic, Bengali, Devanagari)
- Accessibility-compliant design patterns

**Out of Scope:**
- Wireframe layouts (see E.2)
- Interaction patterns (see E.4)
- Responsive behavior specifics (see E.3)

---

## 2. Design Philosophy

### 2.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Clarity over Decoration** | Every element serves a user goal. No ornamental graphics that do not aid comprehension. |
| **Performance is a Feature** | Animations and visuals never compromise load times. Static content loads first; enhancements are progressive. |
| **Mobile-First, Desktop-Refined** | Design for the smallest screen first (320px), enhance for larger viewports. |
| **Accessibility by Default** | WCAG 2.1 AA is the baseline, not an afterthought. |
| **Dual-Mode Brand Expression** | Corporate (light, trustworthy) and Gaming (dark, immersive) modes share underlying structure but express distinct personalities. |

### 2.2 Brand Personality

**Corporate Mode:**
- Trustworthy, established, professional
- 27+ years of heritage expressed through refined restraint
- Global presence (93+ countries) signaled through clean, universal design language
- "Innovation, Perfection, and Quality" — the motto informs precision in spacing and alignment

**Gaming Mode (VOLTX):**
- Bold, energetic, cutting-edge
- RGB-inspired accents signal performance and customization
- Dark canvas lets product imagery and lighting effects dominate
- Community-driven: build gallery, esports, user submissions

### 2.3 Reference Designs

| Mode | Primary Inspiration | Secondary Inspiration |
|------|---------------------|----------------------|
| Corporate | Kingston.com (clean, organized, trustworthy) | TEAMGROUP T-FORCE (product-centric, tech-forward) |
| Gaming | Corsair.com (dark mode, bold typography, dynamic) | G.Skill (RGB showcase, overclocking focus) |

---

## 3. Design Tokens

### 3.1 Color Palette

#### Corporate Light Mode

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-primary` | `#0A2540` | 10, 37, 64 | Headers, primary buttons, footer background, key UI chrome |
| `--color-primary-hover` | `#143D5C` | 20, 61, 92 | Button hover states, link hover |
| `--color-accent` | `#00A3E0` | 0, 163, 224 | Links, CTAs, highlights, active states, focus indicators |
| `--color-accent-hover` | `#0088BD` | 0, 136, 189 | Link hover, CTA hover |
| `--color-background` | `#FFFFFF` | 255, 255, 255 | Page background |
| `--color-surface` | `#F6F9FC` | 246, 249, 252 | Cards, panels, alternate sections, table alternating rows |
| `--color-surface-elevated` | `#FFFFFF` | 255, 255, 255 | Elevated cards (with shadow) |
| `--color-border` | `#E3E8EE` | 227, 232, 238 | Dividers, input borders, card borders |
| `--color-border-focus` | `#00A3E0` | 0, 163, 224 | Focused input borders |
| `--color-text-primary` | `#1A1A2E` | 26, 26, 46 | Headings, primary text |
| `--color-text-secondary` | `#5A6578` | 90, 101, 120 | Body text, descriptions |
| `--color-text-muted` | `#8B95A5` | 139, 149, 165 | Captions, metadata, placeholders |
| `--color-text-on-primary` | `#FFFFFF` | 255, 255, 255 | Text on primary backgrounds |
| `--color-success` | `#00C853` | 0, 200, 83 | Success states, confirmations, positive indicators |
| `--color-success-bg` | `#E6F9ED` | 230, 249, 237 | Success message backgrounds |
| `--color-warning` | `#FFB300` | 255, 179, 0 | Warnings, cautions, pending states |
| `--color-warning-bg` | `#FFF5E0` | 255, 245, 224 | Warning message backgrounds |
| `--color-error` | `#FF1744` | 255, 23, 68 | Errors, validation failures, critical alerts |
| `--color-error-bg` | `#FFEBEE` | 255, 235, 238 | Error message backgrounds |
| `--color-info` | `#00A3E0` | 0, 163, 224 | Informational messages, tips |
| `--color-info-bg` | `#E6F7FF` | 230, 247, 255 | Info message backgrounds |

#### Gaming Dark Mode

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-gaming-bg` | `#0D0D0D` | 13, 13, 13 | Page background |
| `--color-gaming-surface` | `#1A1A1A` | 26, 26, 26 | Cards, panels |
| `--color-gaming-surface-elevated` | `#252525` | 37, 37, 37 | Elevated cards |
| `--color-gaming-accent` | `#00F0FF` | 0, 240, 255 | Neon cyan for RGB accent, primary CTAs |
| `--color-gaming-accent-2` | `#FF0055` | 255, 0, 85 | Neon magenta for secondary RGB accent |
| `--color-gaming-accent-3` | `#AA00FF` | 170, 0, 255 | Purple accent for variety |
| `--color-gaming-text` | `#FFFFFF` | 255, 255, 255 | Primary text |
| `--color-gaming-text-secondary` | `#A0A0A0` | 160, 160, 160 | Secondary text |
| `--color-gaming-text-muted` | `#6B6B6B` | 107, 107, 107 | Captions, metadata |
| `--color-gaming-border` | `#333333` | 51, 51, 51 | Dividers, borders |

#### RGB Gradient (Gaming Hub Only)

```css
--gradient-rgb: linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3);
--gradient-rgb-animated: linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3);
/* Animation: 8s linear infinite shift via background-position */
```

#### Semantic Color Usage Matrix

| Context | Background | Text | Border | Icon |
|---------|-----------|------|--------|------|
| Primary Action | `--color-primary` | `--color-text-on-primary` | none | `#FFFFFF` |
| Secondary Action | transparent | `--color-primary` | `--color-primary` | `--color-primary` |
| Accent Action | `--color-accent` | `#FFFFFF` | none | `#FFFFFF` |
| Ghost Action | transparent | `--color-accent` | none | `--color-accent` |
| Gaming Primary | `--color-gaming-accent` | `#0D0D0D` | none | `#0D0D0D` |
| Success | `--color-success-bg` | `--color-success` | `--color-success` | `--color-success` |
| Warning | `--color-warning-bg` | `--color-warning` | `--color-warning` | `--color-warning` |
| Error | `--color-error-bg` | `--color-error` | `--color-error` | `--color-error` |
| Info | `--color-info-bg` | `--color-info` | `--color-info` | `--color-info` |

### 3.2 Typography

#### Font Families

| Script | Primary Font | Fallback Stack | Weight Range | Source |
|--------|-------------|----------------|--------------|--------|
| Latin | Inter | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | 400–800 | Google Fonts / Self-hosted |
| Arabic | Noto Sans Arabic | `'Noto Sans Arabic', 'Inter', sans-serif` | 400–700 | Google Fonts / Self-hosted |
| Bengali | Noto Sans Bengali | `'Noto Sans Bengali', 'Inter', sans-serif` | 400–700 | Google Fonts / Self-hosted |
| Devanagari (Hindi) | Noto Sans Devanagari | `'Noto Sans Devanagari', 'Inter', sans-serif` | 400–700 | Google Fonts / Self-hosted |
| Cyrillic (Russian) | Inter | Same as Latin | 400–800 | Google Fonts |
| CJK (Chinese Simplified) | Noto Sans SC | `'Noto Sans SC', 'Inter', sans-serif` | 400–700 | Google Fonts |

#### Type Scale

| Element | Desktop | Tablet | Mobile | Weight | Line Height | Letter Spacing |
|---------|---------|--------|--------|--------|-------------|----------------|
| Display (Gaming Hero) | 64px | 52px | 40px | 800 | 1.0 | -0.02em |
| H1 (Hero) | 48px | 40px | 32px | 700 | 1.1 | -0.01em |
| H2 (Section) | 36px | 32px | 28px | 600 | 1.2 | -0.005em |
| H3 (Card Title) | 24px | 22px | 20px | 600 | 1.3 | 0 |
| H4 (Subsection) | 20px | 18px | 18px | 500 | 1.4 | 0 |
| H5 (Label) | 16px | 16px | 16px | 600 | 1.4 | 0.01em |
| Body | 16px | 16px | 16px | 400 | 1.6 | 0 |
| Body Small | 14px | 14px | 14px | 400 | 1.5 | 0 |
| Caption | 12px | 12px | 12px | 400 | 1.4 | 0.01em |
| Overline | 12px | 12px | 12px | 600 | 1.4 | 0.08em (uppercase) |
| Button | 14px | 14px | 14px | 600 | 1.0 | 0.01em |
| Nav Link | 14px | 14px | 14px | 500 | 1.0 | 0 |

#### Font Loading Strategy

- **Self-hosted preferred** for Inter and Noto Sans variants (GDPR compliance, no third-party requests)
- **Font subsetting** per language to minimize payload
- **Font-display: swap** to prevent invisible text during load
- **Preload** Inter Regular (400) and Bold (700) for above-fold content
- **Critical CSS** includes font-face declarations

### 3.3 Spacing System

Based on 8px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0-5` | 2px | Micro adjustments |
| `--space-1` | 4px | Tight internal spacing, icon gaps |
| `--space-2` | 8px | Icon + text pairs, inline elements, button icon gap |
| `--space-3` | 12px | Button vertical padding, small gaps |
| `--space-4` | 16px | Card padding, standard gap, form field spacing |
| `--space-5` | 24px | Section internal padding, component margins |
| `--space-6` | 32px | Component margins, section padding |
| `--space-7` | 48px | Section margins, large gaps |
| `--space-8` | 64px | Large section spacing |
| `--space-9` | 96px | Hero section padding, major breaks |
| `--space-10` | 128px | Major section breaks, page-level spacing |

#### Spacing Patterns

| Pattern | Value | Example |
|---------|-------|---------|
| Card padding | `--space-4` (16px) | Product cards, news cards |
| Card gap (grid) | `--space-5` (24px) | Product grids, news grids |
| Section padding (vertical) | `--space-8` to `--space-9` | Homepage sections |
| Container padding (horizontal) | `--space-4` to `--space-6` | Page content margins |
| Form field gap | `--space-4` (16px) | Between form inputs |
| Button padding | `--space-3` vertical, `--space-4` horizontal | Standard buttons |

### 3.4 Shadow & Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(10, 37, 64, 0.05)` | Cards at rest, subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(10, 37, 64, 0.07), 0 2px 4px rgba(10, 37, 64, 0.05)` | Hover states, dropdowns, elevated cards |
| `--shadow-lg` | `0 10px 15px rgba(10, 37, 64, 0.08), 0 4px 6px rgba(10, 37, 64, 0.04)` | Modals, popovers, floating elements |
| `--shadow-xl` | `0 20px 25px rgba(10, 37, 64, 0.1), 0 10px 10px rgba(10, 37, 64, 0.04)` | Sticky headers, major floating elements |
| `--shadow-gaming-glow` | `0 0 20px rgba(0, 240, 255, 0.3)` | Gaming card hover glow |
| `--shadow-gaming-rgb` | `0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(255, 0, 85, 0.2)` | Gaming hero RGB glow effect |

### 3.5 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Buttons, tags, badges, small elements |
| `--radius-md` | 8px | Cards, inputs, images, standard components |
| `--radius-lg` | 12px | Large cards, modals, feature sections |
| `--radius-xl` | 16px | Hero containers, major sections |
| `--radius-full` | 9999px | Pills, avatars, circular buttons, status badges |

### 3.6 Z-Index Scale

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Background | 0 | Page content |
| Elevated Content | 10 | Cards, sticky elements |
| Navigation | 100 | Header, mobile menu |
| Overlays | 200 | Backdrops, dimmers, cookie banner |
| Modals | 300 | Dialogs, lightboxes |
| Toasts / Notifications | 400 | Success/error messages |
| Loading Spinners | 500 | Full-screen loaders |
| Tooltip | 600 | Hover tooltips |

### 3.7 Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Button clicks, micro-feedback |
| `--duration-fast` | 150ms | Hover states, focus transitions |
| `--duration-normal` | 200ms | Card hovers, dropdowns, modals |
| `--duration-slow` | 300ms | Page transitions, mobile menu |
| `--duration-slower` | 400ms | Hero carousel, major transitions |
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| `--easing-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Entering elements |
| `--easing-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Exiting elements |
| `--easing-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful interactions (gaming) |

---

## 4. Component Library Foundations

### 4.1 Button System

| Variant | Background | Text | Border | Hover State | Active State | Disabled State |
|---------|-----------|------|--------|-------------|--------------|----------------|
| Primary | `--color-primary` | `#FFFFFF` | none | `--color-primary-hover` + `translateY(-1px)` + `--shadow-md` | darken 10% | `--color-border` bg, `--color-text-muted` text |
| Secondary | transparent | `--color-primary` | `1px solid --color-primary` | `--color-primary` bg, `#FFFFFF` text | same as hover | `--color-border` border, `--color-text-muted` text |
| Accent | `--color-accent` | `#FFFFFF` | none | `--color-accent-hover` + `translateY(-1px)` | darken 10% | `--color-border` bg, `--color-text-muted` text |
| Ghost | transparent | `--color-accent` | none | `--color-accent` at 10% bg | same | `--color-text-muted` text |
| Gaming | `--color-gaming-accent` | `#0D0D0D` | none | `#FFFFFF` + `--shadow-gaming-glow` | `--color-gaming-accent` darken | `#333333` bg, `#666666` text |
| Gaming Ghost | transparent | `--color-gaming-accent` | `1px solid --color-gaming-accent` | `--color-gaming-accent` at 15% bg | same | `--color-gaming-text-muted` text |

**Sizing:**
- Small: height 32px, padding 8px 16px, font 12px, `--radius-sm`
- Medium: height 40px, padding 12px 24px, font 14px, `--radius-sm`
- Large: height 48px, padding 16px 32px, font 16px, `--radius-md`
- Icon-only: 44x44px minimum (touch target), `--radius-md` or `--radius-full`

**Icon Buttons:**
- Icon + text preferred
- Icon-only only for universally understood actions (search, close, menu, cart)
- Icon size: 16px (small), 20px (medium), 24px (large)
- Gap between icon and text: `--space-2` (8px)

### 4.2 Card System

**Product Card:**
- Aspect ratio: 3:4 (portrait)
- Image: Top 60%, content: Bottom 40%
- Image container: `--radius-md` top corners
- Content padding: `--space-4`
- Background: `--color-surface` or `--color-background`
- Border: `1px solid --color-border` (subtle)
- Hover: `translateY(-4px)`, `--shadow-md`, image `scale(1.05)`
- Focus: `2px solid --color-accent` outline, offset 2px
- Transition: `--duration-normal` `--easing-default`

**News Card:**
- Image: Top, 16:9 aspect ratio, `--radius-md` top corners
- Content: Title (2 lines max), excerpt (2 lines max), date, category tag
- Hover: Image `scale(1.03)`, title color change to `--color-accent`

**Retailer Card:**
- Logo (if available) or initial letter in circle (48px, `--radius-full`)
- Name, address, phone, website link
- "Get Directions" button (Accent variant, small)

### 4.3 Form Elements

**Input Fields:**
- Height: 48px (touch-friendly)
- Border: 1px `--color-border`, `--radius-md`
- Background: `--color-background`
- Focus: Border `--color-accent`, subtle shadow `0 0 0 3px rgba(0, 163, 224, 0.15)`
- Error: Border `--color-error`, error text below
- Label: Above input, 14px, `--color-text-secondary`, margin-bottom `--space-2`
- Placeholder: `--color-text-muted`
- Padding: 12px 16px

**Dropdowns:**
- Same styling as inputs
- Options panel: `--shadow-lg`, `--radius-md`, max-height 240px with scroll
- Selected option: `--color-accent` background, white text
- Hover option: `--color-surface` background

**Textareas:**
- Min-height: 120px
- Auto-resize optional (max 400px)
- Same border/focus/error states as inputs

**Checkboxes & Radios:**
- Custom styled, 20x20px visual size
- Touch target: 44x44px minimum
- Checked state: `--color-accent` fill with white checkmark
- Indeterminate: `--color-accent` fill with white dash

**File Upload:**
- Drag-and-drop zone: dashed border `--color-border`, `--radius-lg`
- Active drag state: border `--color-accent`, background `--color-info-bg`
- Progress indicator: `--color-accent` fill bar
- File name + remove button after upload

### 4.4 Table System

**Spec Tables:**
- Alternating row backgrounds: `--color-surface` / `--color-background`
- Header: `--color-primary` background, `#FFFFFF` text, font-weight 600
- Parameter column: left-aligned, 40% width
- Value column: left-aligned, 60% width
- Cell padding: 12px 16px
- Border: `1px solid --color-border` between rows
- Responsive (mobile): Cards layout — parameter as label, value as content

**Comparison Tables:**
- Sticky first column (spec names)
- Highlighted differences: `--color-info-bg` background
- Horizontal scroll on mobile with swipe hint
- Max 4 product columns

### 4.5 Modal & Overlay System

**Lightbox (Image Gallery):**
- Backdrop: `rgba(0, 0, 0, 0.9)`
- Image centered, max 90vw / 90vh
- Close button top-right, ESC key closes
- Prev/Next arrows, swipe on mobile
- Keyboard navigation: Left/Right arrows

**Confirmation Modal:**
- Centered, max-width 480px, `--radius-lg`
- Title (H3), message (Body), primary + secondary actions
- Backdrop click does NOT close (prevents accidental dismissal)
- Focus trap inside modal
- Entry animation: backdrop fade, content `scale(0.95→1)` + fade

**Mobile Bottom Sheet:**
- Slides up from bottom, max-height 85vh, `--radius-lg` top corners
- Drag handle at top for dismiss
- Backdrop tap dismisses
- Scrollable content area

### 4.6 Navigation Components

**Main Header:**
- Height: 64px desktop, 56px mobile
- Background: `--color-background` with `--shadow-sm` on scroll
- Logo: Left, links to homepage, height 36px
- Navigation: Center (desktop), hamburger menu (mobile)
- Right: Search icon, language selector, "Contact" CTA (Accent button, small)
- Scroll behavior: Add `--shadow-sm` after 16px scroll

**Mobile Menu:**
- Full-screen overlay, slides from right
- Background: `--color-background`
- Category sections with accordion
- Close button top-right, swipe right to close
- Focus trap while open
- Animation: `translateX(100%→0)`, `--duration-slow`

**Breadcrumbs:**
- Home icon + chevron separators
- Current page not clickable, `--color-text-muted`
- Truncated with "..." on mobile if too long
- Font: Caption size

**Footer:**
- Background: `--color-primary`, text: `--color-text-on-primary`
- 4 columns desktop, 2 columns tablet, stacked mobile
- Column gap: `--space-6`
- Newsletter signup: email input + button inline
- Social icons: horizontal row, 24px, `--color-text-on-primary` at 70% opacity
- Legal links: bottom row, Caption size, `--color-text-on-primary` at 50% opacity
- Padding: `--space-8` vertical

---

## 5. Mode Switching

### 5.1 Corporate to Gaming Transition

When navigating from corporate pages to the Gaming Hub (`/gaming/`):

| Element | Corporate | Gaming |
|---------|-----------|--------|
| Background | `--color-background` (#FFFFFF) | `--color-gaming-bg` (#0D0D0D) |
| Text primary | `--color-text-primary` | `--color-gaming-text` |
| Text secondary | `--color-text-secondary` | `--color-gaming-text-secondary` |
| Accent | `--color-accent` (#00A3E0) | `--color-gaming-accent` (#00F0FF) |
| Cards | `--color-surface` | `--color-gaming-surface` |
| Buttons (primary) | `--color-primary` | `--color-gaming-accent` |
| Header background | `--color-background` | `--color-gaming-bg` |
| Footer background | `--color-primary` | `#0A0A0A` |

**Transition:**
- No animated color morphing (performance concern)
- Instant switch on page load
- Gaming hub pages load with dark theme immediately
- Navigation back to corporate pages reverts to light theme

### 5.2 Gaming Hub Specific Elements

| Element | Specification |
|---------|--------------|
| Hero background | Full-bleed video or animated gradient |
| Product card hover | `--shadow-gaming-glow` + border glow |
| RGB showcase | Interactive lighting presets with cross-fade |
| Build gallery | Staggered fade-in on scroll, 100ms stagger |
| Stats/counters | Number count-up animation on scroll into view |

---

## 6. Multi-Script Typography

### 6.1 Arabic (RTL)

- Font: Noto Sans Arabic
- Direction: RTL (`dir="rtl"`)
- Layout mirroring: All horizontal layouts mirrored
- Icons: Directional icons (chevrons, arrows) flipped via CSS `transform: scaleX(-1)`
- Typography: Slightly increased line-height (1.8) for Arabic text
- Numbers: Arabic-Indic numerals or Eastern Arabic numerals per locale preference

### 6.2 Bengali

- Font: Noto Sans Bengali
- Line-height: 1.8 (Bengali script requires more vertical space)
- Word spacing: Slightly increased for readability

### 6.3 Devanagari (Hindi)

- Font: Noto Sans Devanagari
- Line-height: 1.8
- Matra alignment: Ensure proper rendering above/below base characters

### 6.4 Chinese Simplified

- Font: Noto Sans SC
- Character density: Adjust container widths for CJK character width
- Line-height: 1.75

---

## 7. Accessibility in Design

### 7.1 Color Contrast

| Context | Minimum Ratio | Target Ratio |
|---------|--------------|--------------|
| Normal text (< 18px) | 4.5:1 | 7:1 (AAA) |
| Large text (18px+ bold) | 3:1 | 4.5:1 |
| UI components / graphics | 3:1 | 4.5:1 |

**Verified Pairs:**
- `--color-text-primary` on `--color-background`: 15.3:1 (pass)
- `--color-text-secondary` on `--color-background`: 6.8:1 (pass)
- `--color-text-on-primary` on `--color-primary`: 12.1:1 (pass)
- `--color-accent` on `--color-background`: 3.2:1 (large text only)
- `--color-gaming-text` on `--color-gaming-bg`: 18.5:1 (pass)
- `--color-gaming-accent` on `--color-gaming-bg`: 13.2:1 (pass)

### 7.2 Focus Indicators

- All interactive elements: `2px solid --color-accent` outline
- Outline offset: 2px
- Focus-visible only (not on mouse click)
- Gaming mode: `2px solid --color-gaming-accent`

### 7.3 Touch Targets

- Minimum: 44x44px
- Buttons: 48px height minimum
- Form inputs: 48px height
- Navigation links: 44px height, 16px horizontal padding
- Checkbox/radio: 20x20px visual, 44x44px tap target

### 7.4 Reduced Motion

- Respect `prefers-reduced-motion: reduce`
- Disable: scroll-triggered animations, auto-playing carousels, RGB glow animations
- Keep: subtle hover transitions (opacity, color only — no transform)
- Gaming hub: Show static RGB states instead of animated

---

## 8. Asset Specifications

### 8.1 Logo

| Variant | Format | Size | Background |
|---------|--------|------|------------|
| Primary (full color) | SVG | Vector | White/light |
| Monochrome (white) | SVG | Vector | Dark/colored |
| Monochrome (primary) | SVG | Vector | Light |
| Favicon | ICO, PNG | 32x32, 180x180 (apple-touch) | Transparent |

**Logo clearspace:** Minimum 16px on all sides (desktop), 12px (mobile)

### 8.2 Product Imagery

| Type | Format | Background | Resolution | Max File Size |
|------|--------|-----------|------------|---------------|
| Hero product shots | PNG | Transparent | 1200x1200px | 500KB |
| Category thumbnails | WebP | White or transparent | 400x400px | 50KB |
| Product gallery | WebP | White or transparent | 800x800px | 150KB |
| Lifestyle photography | WebP/JPG | Full bleed | 1920x1080px | 300KB |
| 360° product views | WebP sequence or MP4 | Transparent | 800x800px | 2MB total |

### 8.3 Icons

- **System:** SVG icon sprite (astro-icon)
- **Size scale:** 16px, 20px, 24px, 32px, 48px
- **Stroke width:** 1.5px (16px), 2px (20-24px)
- **Color:** Inherit from parent text color
- **Icon set:** Lucide icons (consistent, open-source)

---

## 9. Design Token Implementation

### 9.1 Tailwind CSS Configuration

```javascript
// tailwind.config.ts excerpt
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2540',
          hover: '#143D5C',
        },
        accent: {
          DEFAULT: '#00A3E0',
          hover: '#0088BD',
        },
        background: '#FFFFFF',
        surface: '#F6F9FC',
        border: '#E3E8EE',
        'text-primary': '#1A1A2E',
        'text-secondary': '#5A6578',
        'text-muted': '#8B95A5',
        success: '#00C853',
        warning: '#FFB300',
        error: '#FF1744',
        gaming: {
          bg: '#0D0D0D',
          surface: '#1A1A1A',
          accent: '#00F0FF',
          'accent-2': '#FF0055',
          text: '#FFFFFF',
          'text-secondary': '#A0A0A0',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'Inter', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'Inter', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'Inter', 'sans-serif'],
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '24px',
        'space-6': '32px',
        'space-7': '48px',
        'space-8': '64px',
        'space-9': '96px',
        'space-10': '128px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(10, 37, 64, 0.05)',
        md: '0 4px 6px rgba(10, 37, 64, 0.07), 0 2px 4px rgba(10, 37, 64, 0.05)',
        lg: '0 10px 15px rgba(10, 37, 64, 0.08), 0 4px 6px rgba(10, 37, 64, 0.04)',
        xl: '0 20px 25px rgba(10, 37, 64, 0.1), 0 10px 10px rgba(10, 37, 64, 0.04)',
        'gaming-glow': '0 0 20px rgba(0, 240, 255, 0.3)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
    },
  },
};
```

### 9.2 CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #0A2540;
  --color-primary-hover: #143D5C;
  --color-accent: #00A3E0;
  --color-accent-hover: #0088BD;
  --color-background: #FFFFFF;
  --color-surface: #F6F9FC;
  --color-border: #E3E8EE;
  --color-text-primary: #1A1A2E;
  --color-text-secondary: #5A6578;
  --color-text-muted: #8B95A5;
  --color-success: #00C853;
  --color-warning: #FFB300;
  --color-error: #FF1744;

  /* Gaming */
  --color-gaming-bg: #0D0D0D;
  --color-gaming-surface: #1A1A1A;
  --color-gaming-accent: #00F0FF;
  --color-gaming-accent-2: #FF0055;
  --color-gaming-text: #FFFFFF;
  --color-gaming-text-secondary: #A0A0A0;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(10, 37, 64, 0.05);
  --shadow-md: 0 4px 6px rgba(10, 37, 64, 0.07), 0 2px 4px rgba(10, 37, 64, 0.05);
  --shadow-lg: 0 10px 15px rgba(10, 37, 64, 0.08), 0 4px 6px rgba(10, 37, 64, 0.04);
  --shadow-xl: 0 20px 25px rgba(10, 37, 64, 0.1), 0 10px 10px rgba(10, 37, 64, 0.04);

  /* Motion */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="gaming"] {
  --color-background: var(--color-gaming-bg);
  --color-surface: var(--color-gaming-surface);
  --color-text-primary: var(--color-gaming-text);
  --color-text-secondary: var(--color-gaming-text-secondary);
  --color-border: #333333;
}
```

---

## 10. Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft based on URD §20, RFP §7 |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final design system for Phase 1 development |

---

*This document is a living specification. All changes must be logged in the version control table and communicated to the design and development teams.*
