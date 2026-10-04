# TwinMOS Website — Social Media Assets Design Specification

**Document ID:** E.2.7
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document defines design specifications for social media assets derived from the TwinMOS website. Covers Open Graph images, Twitter Cards, shareable graphics, and social link previews across all major platforms.

**Cross-references:**
- URD Section 5.2 (Social Media Integration)
- Tech Stack: Astro OG Image generation, ImgProxy
- Content: `15-marketing/social-media-campaigns.md`

## 2. Asset Inventory

| ID | Asset | Platform | Dimensions | Format |
|----|-------|----------|------------|--------|
| SOC-01 | Open Graph Default | Facebook/LinkedIn | 1200 x 630 | PNG |
| SOC-02 | Twitter Summary Card | Twitter/X | 1200 x 600 | PNG |
| SOC-03 | Twitter Large Image | Twitter/X | 1200 x 675 | PNG |
| SOC-04 | Instagram Feed | Instagram | 1080 x 1080 | JPG |
| SOC-05 | Instagram Story | Instagram | 1080 x 1920 | JPG |
| SOC-06 | Pinterest Pin | Pinterest | 1000 x 1500 | JPG |
| SOC-07 | YouTube Thumbnail | YouTube | 1280 x 720 | JPG |
| SOC-08 | WhatsApp Preview | WhatsApp | 300 x 200 | JPG |
| SOC-09 | Product Share Card | Universal | 1200 x 630 | PNG |
| SOC-10 | Event Banner | Universal | 1920 x 1080 | JPG |

## 3. Design System for Social Assets

### 3.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--social-primary` | `#0A2540` | Background, overlays |
| `--social-accent` | `#00A3E0` | CTAs, highlights, badges |
| `--social-gaming` | `#00F0FF` | VOLTX content accent |
| `--social-text` | `#FFFFFF` | Primary text on dark |
| `--social-text-dark` | `#1A1A2E` | Text on light backgrounds |

### 3.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headline | Inter | 48-72px | 800 |
| Subheadline | Inter | 24-32px | 600 |
| Body | Inter | 16-20px | 400 |
| Brand mark | Inter | 14px | 500 |

### 3.3 Safe Zones

| Platform | Text Safe Zone | Logo Safe Zone |
|----------|--------------|----------------|
| Facebook/OG | 60px from edges | Top-left 200x80px |
| Twitter | 60px from edges | Top-left 200x80px |
| Instagram Feed | 120px from edges | Center-bottom 400x100px |
| Instagram Story | 200px from top/bottom | Top-center 300x80px |
| YouTube | 80px from edges | Bottom-right 200x60px |

## 4. Open Graph Default (SOC-01)

```
Dimensions: 1200 x 630px
Aspect ratio: 1.91:1

Layout:
┌────────────────────────────────────────┐
│ [BRAND BAR] #0A2540, 80px height       │
│  TwinMOS logo (white) left-aligned     │
├────────────────────────────────────────┤
│                                        │
│ [HERO IMAGE] 1200 x 450px              │
│  Product or lifestyle imagery          │
│  Subtle #0A2540 gradient overlay       │
│                                        │
├────────────────────────────────────────┤
│ [FOOTER BAR] #0A2540, 100px height     │
│  Headline: 32px white Inter Bold       │
│  URL: twinmos.com (14px #00A3E0)       │
└────────────────────────────────────────┘
```

## 5. Twitter Cards

### 5.1 Summary Card (SOC-02)

- 1200 x 600px
- Compact layout with left image (600x600), right text
- Title max 70 characters
- Description max 200 characters

### 5.2 Large Image Card (SOC-03)

- 1200 x 675px (16:9)
- Full-width hero image top 70%
- Title and description bottom 30% on #0A2540 bar

## 6. Instagram Assets

### 6.1 Feed Post (SOC-04)

- 1080 x 1080px (1:1)
- Product photography centered
- Minimal text overlay (max 20% coverage)
- TwinMOS watermark: bottom-right, 30% opacity

### 6.2 Story (SOC-05)

- 1080 x 1920px (9:16)
- Vertical product showcase
- Interactive sticker zones: top 200px, bottom 300px
- Swipe-up CTA area: bottom 150px

## 7. Product Share Card (SOC-09)

```
Dimensions: 1200 x 630px

Layout:
┌────────────────────────────────────────┐
│ [HEADER] #0A2540                       │
│  Product Category Badge (#00A3E0)      │
├────────────────────────────────────────┤
│                                        │
│  [PRODUCT IMAGE] 500 x 500px centered  │
│                                        │
├────────────────────────────────────────┤
│ [PRODUCT INFO]                         │
│  Product Name: 36px Bold               │
│  Tagline: 20px Regular                 │
│  Specs: 16px (3 key specs max)         │
├────────────────────────────────────────┤
│ [FOOTER] #0A2540                       │
│  twinmos.com | #TwinMOS                │
└────────────────────────────────────────┘
```

## 8. Technical Specifications

| Property | Value |
|----------|-------|
| Color space | sRGB |
| DPI | 72 |
| Max file size | 500KB (OG), 1MB (Instagram) |
| Compression | PNG-24 or JPEG quality 85 |
| Text as shapes | Yes (avoid font embedding issues) |

## 9. Dynamic Generation

### 9.1 Astro OG Image API

```typescript
// src/pages/og/[...slug].png.ts
export const GET: APIRoute = async ({ params }) => {
  const page = await getPage(params.slug);
  return generateOGImage({
    title: page.title,
    description: page.description,
    image: page.heroImage,
    template: "default"
  });
};
```

### 9.2 Parameters

| Parameter | Type | Default |
|-----------|------|---------|
| `title` | string | "TwinMOS Technologies" |
| `description` | string | "Reliable Memory Solutions" |
| `image` | URL | Default hero image |
| `template` | enum | "default", "product", "gaming" |
| `locale` | string | "en" |

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-04-15 | Initial draft |
| 1.0 | 2026-05-01 | Final specification |
