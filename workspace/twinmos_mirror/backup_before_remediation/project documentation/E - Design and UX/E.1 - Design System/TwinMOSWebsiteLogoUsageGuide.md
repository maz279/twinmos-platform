# TwinMOS Website Logo Usage Guide

**Document Reference:** TWN-LOGO-UG-2026-001  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** Marketing Director / Brand Manager  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** Brand Guideline, Design System

---

## 1. Logo Overview

The TwinMOS logo is the primary visual identifier of TwinMOS Technologies. Consistent and correct usage is essential to maintaining brand recognition and trust across all markets.

### 1.1 Logo Anatomy

```
+--------------------------------------------------+
|  [TWINMOS LOGO]                                  |
|                                                  |
|  The logo consists of:                           |
|  1. Wordmark: "TwinMOS" in custom typeface       |
|  2. Tagline (optional): "Technologies"           |
|  3. Symbol (optional): Abstract memory/storage   |
|     motif integrated with letterforms            |
+--------------------------------------------------+
```

### 1.2 Logo Variants

| Variant | Description | File Name | Usage |
|---------|-------------|-----------|-------|
| **Primary Full Color** | Deep Blue wordmark + Electric Blue accent | `twinmos-logo-primary.svg` | Default for all applications |
| **Monochrome White** | White version | `twinmos-logo-white.svg` | Dark backgrounds, overlays |
| **Monochrome Primary** | Deep Blue only | `twinmos-logo-mono.svg` | Single-color applications |
| **Compact Icon** | Symbol only | `twinmos-icon.svg` | Favicon, app icons, avatars |
| **Horizontal Lockup** | Logo + tagline horizontal | `twinmos-logo-horizontal.svg` | Headers, letterheads |
| **Vertical Lockup** | Logo + tagline stacked | `twinmos-logo-vertical.svg` | Square spaces, social profiles |

---

## 2. Logo Specifications

### 2.1 Color Specifications

| Variant | Primary Color | Accent Color | Background |
|---------|--------------|--------------|------------|
| Full Color | #0A2540 (Deep Blue) | #00A3E0 (Electric Blue) | White/light |
| Monochrome White | #FFFFFF | #FFFFFF | Dark/colored |
| Monochrome Primary | #0A2540 | #0A2540 | Light |

### 2.2 Minimum Sizes

| Medium | Minimum Width | Minimum Height |
|--------|--------------|----------------|
| Website header | 120px | 36px |
| Website footer | 100px | 30px |
| Mobile header | 100px | 30px |
| Favicon | 16px | 16px |
| Social avatar | 180px | 180px |
| Print (business cards) | 25mm | 7.5mm |
| Print (brochures) | 30mm | 9mm |
| Print (banners) | 100mm | 30mm |

### 2.3 Clearspace

Clearspace is the minimum area around the logo that must remain free of other elements.

| Context | Clearspace |
|---------|-----------|
| Digital (web) | Minimum 16px on all sides |
| Mobile | Minimum 12px on all sides |
| Print | Minimum height of the "T" in TwinMOS |

```
        +---------------------------+
        |      [CLEARSPACE]         |
        |   +-------------------+   |
        |   |                   |   |
        |   |    TWINMOS        |   |
        |   |    Technologies   |   |
        |   |                   |   |
        |   +-------------------+   |
        |      [CLEARSPACE]         |
        +---------------------------+
```

---

## 3. Correct Usage

### 3.1 Approved Backgrounds

| Logo Variant | Approved Backgrounds |
|-------------|---------------------|
| Primary Full Color | White (#FFFFFF), Surface Gray (#F6F9FC), very light tints |
| Monochrome White | Deep Blue (#0A2540), Dark Gray, Black (#0D0D0D), Gaming Black |
| Monochrome Primary | White, Surface Gray, light backgrounds |

### 3.2 Website Placement

| Location | Variant | Alignment | Size |
|----------|---------|-----------|------|
| Header (desktop) | Primary | Left | 140px width |
| Header (mobile) | Primary | Center | 120px width |
| Footer | White | Left | 120px width |
| Loading screen | Primary | Center | 200px width |
| Error pages | White | Center | 160px width |
| Partner portal | White | Center | 100px width |
| Email header | Primary | Left | 140px width |

### 3.3 Responsive Behavior

| Breakpoint | Header Logo Size | Alignment |
|------------|-----------------|-----------|
| Mobile (< 768px) | 120px width | Centered |
| Tablet (768–1023px) | 130px width | Left |
| Desktop (1024–1439px) | 140px width | Left |
| Wide (1440px+) | 160px width | Left |

---

## 4. Incorrect Usage (Prohibited)

The TwinMOS logo must NEVER be used in the following ways:

| Prohibition | Example | Correct Alternative |
|-------------|---------|---------------------|
| **Stretch/Compress** | Logo width changed without proportional height | Always scale proportionally |
| **Recolor** | Logo in unapproved colors (red, green, orange) | Use approved variants only |
| **Busy background** | Logo placed over complex imagery without clearance | Use solid background or add contrast overlay |
| **Drop shadow** | Logo with heavy drop shadow or glow | Use flat logo; shadow only subtle elevation |
| **Outline/Stroke** | Logo with added border or outline | Use approved variants |
| **Rotation** | Logo tilted or rotated | Always horizontal |
| **Cropping** | Logo partially cut off | Show complete logo |
| **Effects** | Logo with gradients, 3D effects, bevels | Use flat, approved colors |
| **Distortion** | Logo in perspective, warped | Maintain original proportions |
| **Low contrast** | Primary logo on dark background | Use white monochrome variant |

---

## 5. Favicon & Icon Usage

### 5.1 Favicon Specifications

| Size | Format | Purpose |
|------|--------|---------|
| 16x16 | ICO | Legacy browser favicon |
| 32x32 | PNG | Standard browser favicon |
| 48x48 | PNG | Windows taskbar |
| 180x180 | PNG | Apple touch icon |
| 192x192 | PNG | Android/Chrome icon |
| 512x512 | PNG | PWA splash screen |

### 5.2 Favicon Design

- Use the compact TwinMOS icon (symbol only)
- Background: Deep Blue (#0A2540) circle or square with rounded corners
- Icon: White or Electric Blue
- Safe area: Keep icon within central 80% of canvas

### 5.3 Web App Manifest Icons

```json
{
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 6. Social Media Applications

| Platform | Profile Image | Cover/Banner | Post Image |
|----------|--------------|--------------|------------|
| Facebook | 180x180px, icon variant | 820x312px, logo + tagline | Brand colors + product |
| Twitter/X | 400x400px, icon variant | 1500x500px, logo + tagline | Brand colors + product |
| Instagram | 320x320px, icon variant | N/A | 1080x1080px, product-focused |
| LinkedIn | 300x300px, icon variant | 1584x396px, corporate style | Brand colors + product |
| YouTube | 800x800px, icon variant | 2560x1440px, gaming style | Thumbnail: 1280x720px |

---

## 7. Partner & Co-Branded Usage

### 7.1 Partner Logo Placement

When TwinMOS logo appears alongside partner logos:

- TwinMOS logo must be equal or larger than partner logos
- Minimum clearspace around TwinMOS logo must be maintained
- TwinMOS logo should appear in primary position (left or top)
- Approved color variant only

### 7.2 Distributor Co-Branding

| Element | Specification |
|---------|--------------|
| TwinMOS logo | Primary or white variant |
| Distributor logo | As provided by partner |
| Separator | Vertical line or "+" symbol, `--color-border` |
| Background | White or light gray |
| Clearspace | Equal to TwinMOS logo height between logos |

---

## 8. File Formats & Delivery

### 8.1 Digital Formats

| Format | Extension | Usage |
|--------|-----------|-------|
| Scalable Vector | .svg | Website, apps, all digital |
| Portable Network Graphics | .png | Fallback, email, social |
| Icon | .ico | Browser favicon |

### 8.2 Print Formats

| Format | Extension | Usage |
|--------|-----------|-------|
| Encapsulated PostScript | .eps | Print, large format |
| Adobe Illustrator | .ai | Editable source |
| PDF | .pdf | Universal print |

### 8.3 File Naming Convention

```
twinmos-logo-{variant}.{format}

twinmos-logo-primary.svg
twinmos-logo-white.png
twinmos-logo-mono.svg
twinmos-icon.svg
twinmos-logo-horizontal-white.svg
twinmos-logo-vertical-primary.svg
```

---

## 9. Asset Download Locations

| Location | URL | Access |
|----------|-----|--------|
| Media Kit | `/about/press/media-kit/` | Public |
| Partner Portal (P2) | `/partners/assets/logos/` | Authorized distributors |
| CMS Media Library | Strapi admin | Internal team |
| Git Repository | `/public/assets/logos/` | Development team |

---

## 10. Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 1 May 2026 | Initial logo usage guide for website redevelopment |

---

*This guide ensures consistent and correct logo usage across all TwinMOS digital properties. Questions about logo usage should be directed to the Marketing Director.*
