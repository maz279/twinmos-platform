# TwinMOS Website — Image Asset Naming Convention

**Document Reference:** TWN-F2-IMG-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Marketing Director / Front-End Lead
**Applies To:** All image assets uploaded to the TwinMOS website, CMS, and CDN

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Master Naming Schema](#2-master-naming-schema)
3. [Segment Definitions](#3-segment-definitions)
4. [Folder Structure](#4-folder-structure)
5. [Format and Resolution Standards](#5-format-and-resolution-standards)
6. [Product Image Standards](#6-product-image-standards)
7. [Non-Product Image Standards](#7-non-product-image-standards)
8. [Locale-Specific Assets](#8-locale-specific-assets)
9. [Open Graph and Social Preview Images](#9-open-graph-and-social-preview-images)
10. [Backblaze B2 Bucket Path Mapping](#10-backblaze-b2-bucket-path-mapping)
11. [Version Control and Cache Busting](#11-version-control-and-cache-busting)
12. [Quick-Reference Cheat Sheet](#12-quick-reference-cheat-sheet)

---

## 1. Purpose and Scope

Consistent image asset naming:
- Prevents overwriting errors between contributors.
- Enables automatic image optimisation by Astro Sharp and ImgProxy.
- Ensures CDN cache-busting works correctly on updates.
- Makes debugging visual regressions straightforward.
- Supports locale-specific asset variants without ambiguity.

This convention applies to all images used on `twinmos.com` including product renders, lifestyle photography, diagrams, blog/news images, OG (Open Graph) preview images, icons, and locale text-overlay variants.

---

## 2. Master Naming Schema

### 2.1 Product Images

```
{product-slug}_{view}_{variant}_{width}x{height}@{scale}.{ext}
```

**Example:**
```
voltx-ddr5-6000-32gb_hero_black_1920x1080@1x.webp
voltx-ddr5-6000-32gb_hero_black_1920x1080@2x.webp
voltx-ddr5-6000-32gb_thumb_black_400x300@1x.webp
voltx-ddr5-6000-32gb_pcb-top_black_800x600@1x.webp
```

### 2.2 Non-Product Images (Blog, News, About, etc.)

```
{section-slug}_{descriptor}_{width}x{height}@{scale}.{ext}
```

**Example:**
```
homepage_hero-banner_1920x1080@1x.webp
about_manufacturing-facility_800x600@1x.webp
news_computex-2026-booth_1200x630@1x.webp
learn_ddr5-vs-ddr4-diagram_800x500@1x.webp
```

### 2.3 Open Graph / Social Preview Images

```
og_{page-slug}_1200x630.webp
```

**Example:**
```
og_homepage_1200x630.webp
og_voltx-ddr5-6000-32gb_1200x630.webp
og_learn-ddr5-vs-ddr4_1200x630.webp
```

### 2.4 Icons and UI Elements

```
icon_{name}_{size}.{ext}
```

**Example:**
```
icon_warranty_64x64.svg
icon_certified_32x32.png
icon_rgb_24x24.svg
```

---

## 3. Segment Definitions

### 3.1 `{product-slug}`

The canonical URL slug for the product as defined in the Master SKU Reference. Always lowercase, hyphen-separated.

| Product | Product Slug |
|---------|-------------|
| VOLTX DDR5 U-DIMM 6000MHz 32GB | `voltx-ddr5-6000-32gb` |
| VOLTX DDR5 U-DIMM 6000MHz 16GB | `voltx-ddr5-6000-16gb` |
| VOLTX RGB DDR5 6000MHz 32GB | `voltx-rgb-ddr5-6000-32gb` |
| VOLTX DDR5 SO-DIMM 5600MHz 16GB | `voltx-ddr5-so-dimm-5600-16gb` |
| TornadoX7 Pro DDR4 3200MHz 16GB | `tornadox7-pro-ddr4-3200-16gb` |
| Thunder GX DDR4 3200MHz 16GB | `thunder-gx-ddr4-3200-16gb` |
| CoreX Pro Gen 5 1TB NVMe | `corex-pro-gen5-nvme-1tb` |
| CoreX Gen 4 1TB NVMe | `corex-gen4-nvme-1tb` |
| Xtreme Gen 4 1TB NVMe | `xtreme-gen4-nvme-1tb` |
| Alpha Pro Gen 3 1TB NVMe | `alpha-pro-gen3-nvme-1tb` |
| Hyper H2 Ultra SATA 1TB | `hyper-h2-ultra-sata-1tb` |
| ELITE Drive Pro Portable SSD 1TB | `elite-drive-pro-ssd-1tb` |
| ProDrive Ultra Portable HDD 2TB | `prodrive-ultra-hdd-2tb` |
| Mobile Disk X3 USB 64GB | `mobile-disk-x3-usb-64gb` |

### 3.2 `{view}` Codes

| Code | Description |
|------|-------------|
| `hero` | Main hero/feature image of the product |
| `thumb` | Thumbnail image for product cards and lists |
| `lifestyle` | In-use / lifestyle context photograph |
| `diagram` | Technical diagram, specification graphic |
| `package` | Retail packaging shot |
| `pcb-top` | Printed circuit board — top view (bare module) |
| `pcb-bottom` | Printed circuit board — bottom view |
| `installed` | Module/drive installed in a system |
| `angle-front` | Angled front view |
| `angle-rear` | Angled rear view |
| `banner` | Full-width banner / hero slice |
| `gallery-{n}` | Gallery image n (e.g., `gallery-1`, `gallery-2`) |

### 3.3 `{variant}` Codes

| Code | Description |
|------|-------------|
| `black` | Black heatspreader / black finish |
| `white` | White heatspreader / white finish |
| `silver` | Silver / aluminium finish |
| `rgb-on` | RGB lighting on / active state |
| `rgb-off` | RGB lighting off / passive state |
| `installed` | Product as-installed in system |
| `default` | Single variant with no colour distinction |

If a product has only one variant, use `default`.

### 3.4 `{width}x{height}` Resolution

Always in pixels, no spaces, width before height.

### 3.5 `@{scale}` Descriptor

| Value | Meaning |
|-------|---------|
| `@1x` | Standard resolution (1:1 pixel ratio) |
| `@2x` | Retina / high-DPI (2:1 pixel ratio) |
| `@3x` | Ultra-high DPI (mobile retina) |

If only one resolution variant exists (e.g., SVG or icon), omit the `@{scale}` segment:
`icon_warranty_64x64.svg` (no `@1x` needed).

### 3.6 `{ext}` File Extension

Always use lowercase extension.

| Extension | When to Use |
|-----------|-------------|
| `.webp` | Primary format for all raster images |
| `.png` | Fallback for browsers without WebP support; also for images requiring transparency where WebP is not sufficient |
| `.svg` | Icons, logos, diagrams (vector) |
| `.jpg` | Only for photographic images where WebP is not yet available (legacy only — do not use for new uploads) |
| `.avif` | Future consideration (Phase 2) — not in current scope |

**Rule: Do not use `.jpg` / `.jpeg` for product renders.** JPEG compression creates visible artefacts around heatspreader edges and labels.

---

## 4. Folder Structure

All images are stored under `/public/images/` in the Astro project, and mirrored to Backblaze B2.

```
/public/
  images/
    products/
      memory/
        ddr5/             ← DDR5 product images
        ddr4/             ← DDR4 product images
        ddr3/             ← DDR3 product images
      ssd/
        nvme/             ← NVMe SSD images
        sata/             ← SATA SSD images
      portable/           ← Portable SSD/HDD images
      usb/                ← USB flash drive images
      accessories/        ← USB hub, accessories
    sections/
      homepage/           ← Homepage-specific assets
      about/              ← About Us, company photos
      gaming/             ← VOLTX gaming hub assets
      technology/         ← Tech hub diagrams
      solutions/          ← Solutions page images
      news/               ← News article thumbnails and hero images
        articles/         ← Per-article images
      learn/              ← Learn Hub diagrams and infographics
      regional/           ← Regional landing page images
      careers/            ← Careers and culture photos
      partners/           ← Partner logos and imagery
      support/            ← Support KB diagrams
    logos/
      twinmos/            ← TwinMOS logo variants (SVG + PNG)
      partners/           ← Partner/distributor logos
      certifications/     ← CE, FCC, RoHS, JEDEC, etc.
    icons/                ← UI icons (SVG preferred)
    og/                   ← Open Graph preview images (1200×630)
    locale/
      ar/                 ← Arabic text-overlay variants
      hi/                 ← Hindi text-overlay variants
      bn/                 ← Bengali text-overlay variants
      ru/                 ← Russian text-overlay variants
      zh-CN/              ← Simplified Chinese text-overlay variants
      fr/                 ← French text-overlay variants
```

---

## 5. Format and Resolution Standards

### 5.1 Resolution Presets

| Use Case | Width | Height | Format | Notes |
|----------|-------|--------|--------|-------|
| Hero / full-width banner | 1920 | 1080 | WebP | Also generate @2x (3840×2160) |
| Product hero | 1200 | 900 | WebP | 4:3 ratio; transparent background |
| Product thumbnail | 400 | 300 | WebP | Used in product cards and search results |
| OG / social preview | 1200 | 630 | WebP | Facebook, LinkedIn, Twitter |
| Category card | 800 | 600 | WebP | |
| Blog / news hero | 1200 | 675 | WebP | 16:9 ratio |
| Blog / news thumbnail | 400 | 225 | WebP | 16:9 ratio |
| Gallery image | 1000 | 750 | WebP | Lightbox target |
| Diagram / infographic | Variable | Variable | SVG or WebP | SVG preferred for line art |
| Certification badge | 120 | 120 | SVG / PNG | Square; transparent background |
| Partner / distributor logo | 300 | 150 | SVG / WebP | White or transparent background |
| Icon (UI) | 24/32/48/64 | 24/32/48/64 | SVG | Provide all four sizes |

### 5.2 Colour Space and Quality

- Colour profile: sRGB (not Adobe RGB — web cannot display Adobe RGB).
- WebP quality: 85 for photographs; 95 for product renders.
- PNG: lossless for images requiring exact colour (certification logos, badges).
- SVG: minified before commit (run `svgo`).

### 5.3 Transparent Background

- Product renders (hero, thumb, gallery): transparent (alpha) background — white-fill the background only in locale/social variants.
- Certification badges: transparent background.
- Full-width banners: solid background (lifestyle/composed), not transparent.

---

## 6. Product Image Standards

### 6.1 Required Image Set per Product

Every product SKU page must have a minimum image set:

| Image | Filename Pattern | Required |
|-------|-----------------|----------|
| Hero image | `{slug}_hero_{variant}_1200x900@1x.webp` | Mandatory |
| Hero @2x | `{slug}_hero_{variant}_1200x900@2x.webp` | Mandatory |
| Thumbnail | `{slug}_thumb_{variant}_400x300@1x.webp` | Mandatory |
| Packaging shot | `{slug}_package_{variant}_1000x750@1x.webp` | Recommended |
| PCB top view | `{slug}_pcb-top_{variant}_800x600@1x.webp` | Recommended for memory |
| Gallery image 1–3 | `{slug}_gallery-{n}_{variant}_1000x750@1x.webp` | Recommended |
| OG preview | `og_{slug}_1200x630.webp` | Mandatory |

### 6.2 Product Image Background

- Hero and thumbnail: white or transparent background (no shadows, no gradients unless brand-approved).
- Lifestyle images: composed on a dark desk/battlestation environment for gaming products; neutral studio for professional products.

### 6.3 Composite Kit Images

For kits (e.g., 2×16 GB dual-channel kit): both modules side-by-side, angled view, against white/transparent background.
- Filename: `voltx-ddr5-6000-32gb-kit_hero_black_1200x900@1x.webp` (add `-kit` suffix to slug).

---

## 7. Non-Product Image Standards

### 7.1 Blog and News Images

- Minimum resolution: 1200×675 (16:9).
- Must not include text baked into the image (text goes in HTML).
- For news images featuring TwinMOS staff: include name/title as caption in HTML, not burned into image.
- File pattern: `news_{article-slug}-hero_1200x675@1x.webp`

### 7.2 Diagrams and Infographics

- SVG for all line-art diagrams (architecture diagrams, flowcharts, spec comparisons).
- WebP for photographic-style infographics.
- All diagrams must have equivalent textual alt text or a data table for accessibility.
- Filename: `{section}_{diagram-descriptor}_{width}x{height}.svg`
  - Example: `learn_ddr5-architecture-diagram_800x500.svg`

### 7.3 People Photography (Leadership, Careers, Events)

- High-resolution (minimum 1200×800).
- Professional headshots: minimum 600×600, square crop, neutral background.
- Filename: `about_team-{role}-{firstname}-{lastname}_600x600@1x.webp`
  - Example: `about_team-ceo-william-chen_600x600@1x.webp`

---

## 8. Locale-Specific Assets

Some images require locale variants when they contain text overlays, localised product photography, or region-specific imagery.

### 8.1 Naming for Locale Variants

Append the locale code suffix before the extension:

```
{base-name}_{locale}.{ext}
```

**Example:**
```
homepage_hero-banner_1920x1080@1x.webp              ← English (default)
homepage_hero-banner_1920x1080@1x_ar.webp           ← Arabic RTL variant
homepage_hero-banner_1920x1080@1x_hi.webp           ← Hindi text overlay
homepage_hero-banner_1920x1080@1x_bn.webp           ← Bengali text overlay
```

### 8.2 Storage Location

Locale-specific images go in `/public/images/locale/{locale-code}/`, mirroring the same subfolder structure as the main `images/` directory.

### 8.3 Rules for Locale Image Creation

- Text in images must be translated by the designated translator and reviewed by the regional team.
- Do not use machine translation for any text baked into images.
- Arabic locale images: text must be in RTL layout — verify with a native Arabic speaker before upload.
- If no locale-specific image exists, the English default is used. This is acceptable for product renders with no text overlay.

---

## 9. Open Graph and Social Preview Images

### 9.1 Dimensions and Format

- Size: **1200 × 630 px** (standard OG image).
- Format: WebP (JPEG fallback generated automatically by Astro).
- File location: `/public/og/`
- Naming: `og_{page-slug}_1200x630.webp`

### 9.2 Content Requirements

OG images must include:
- TwinMOS logo (top-left or top-right corner).
- Product image or page-relevant visual.
- Page title text (short form) — must be legible at 600×315 (half size thumbnail).
- Brand colour background (`#002D72` navy or `#E63329` red, or product-specific colour).

### 9.3 OG Image Index

| Page | OG Image Filename |
|------|-----------------|
| Homepage | `og_homepage_1200x630.webp` |
| Products overview | `og_products_1200x630.webp` |
| VOLTX DDR5 6000MHz 32GB | `og_voltx-ddr5-6000-32gb_1200x630.webp` |
| CoreX Pro Gen 5 1TB | `og_corex-pro-gen5-nvme-1tb_1200x630.webp` |
| DDR5 vs DDR4 guide | `og_learn-ddr5-vs-ddr4_1200x630.webp` |
| About TwinMOS | `og_about_1200x630.webp` |
| Gaming Hub | `og_gaming-hub_1200x630.webp` |
| Support Hub | `og_support_1200x630.webp` |
| Careers | `og_careers_1200x630.webp` |
| Contact | `og_contact_1200x630.webp` |

For product pages without a custom OG image, fall back to the category OG image.

---

## 10. Backblaze B2 Bucket Path Mapping

All images are uploaded to Backblaze B2 and served via Cloudflare CDN. The B2 bucket path mirrors the `/public/images/` folder structure:

**Bucket:** `twinmos-website-assets`
**Base URL:** `https://cdn.twinmos.com/images/` (Cloudflare custom domain)

| Local Path | B2 Path | CDN URL |
|-----------|---------|---------|
| `/public/images/products/memory/ddr5/voltx-ddr5-6000-32gb_hero_black_1200x900@1x.webp` | `images/products/memory/ddr5/voltx-ddr5-6000-32gb_hero_black_1200x900@1x.webp` | `https://cdn.twinmos.com/images/products/memory/ddr5/...` |
| `/public/og/og_homepage_1200x630.webp` | `og/og_homepage_1200x630.webp` | `https://cdn.twinmos.com/og/...` |

Uploads to B2 are handled automatically by the CI/CD pipeline (GitHub Actions → Rclone sync on every main branch merge).

---

## 11. Version Control and Cache Busting

### 11.1 No Version Number in Filename

Do not append version numbers to image filenames (e.g., `_v2`, `_2026`, `_final`). Versioning is handled by:
- Git commit history for source images.
- Cloudflare CDN cache-busting via deployment build hash (Astro embeds a content hash in the generated `src` URL).

### 11.2 Updating an Image

When replacing an existing image with an updated version:
1. Upload the new file with the same filename, overwriting the old file.
2. Cloudflare cache is purged automatically by the GitHub Actions deployment workflow.
3. If immediate cache purge is required (e.g., incorrect product image live on site): trigger manual Cloudflare cache purge via the Cloudflare dashboard for the affected URL pattern.

### 11.3 Deleting an Image

Before deleting an image from B2 or the repository:
1. Confirm no page references the image via a codebase search (`grep -r "filename"` or Strapi media search).
2. Remove the reference from source first, then delete the asset.
3. Never delete a live asset without first removing all references — this causes 404 on CDN.

---

## 12. Quick-Reference Cheat Sheet

```
PRODUCT IMAGE NAMING
=====================
{product-slug}_{view}_{variant}_{width}x{height}@{scale}.{ext}

Example: voltx-ddr5-6000-32gb_hero_black_1200x900@1x.webp

Views: hero | thumb | lifestyle | diagram | package | pcb-top | pcb-bottom
       installed | angle-front | angle-rear | banner | gallery-{n}

Variants: black | white | silver | rgb-on | rgb-off | installed | default

Scales: @1x | @2x | @3x

Formats: .webp (primary) | .png (fallback/transparency) | .svg (vector)

NON-PRODUCT NAMING
===================
{section-slug}_{descriptor}_{width}x{height}@{scale}.{ext}

OG IMAGE NAMING
================
og_{page-slug}_1200x630.webp  →  stored in /public/og/

LOCALE VARIANT NAMING
======================
{base-name}_{locale}.{ext}
Example: homepage_hero-banner_1920x1080@1x_ar.webp

KEY RULES
==========
- All lowercase, hyphens (not underscores) in slug segments
- No spaces in filenames, ever
- No version numbers in filenames
- WebP primary format for all raster images
- No JPEG for product renders
- Transparent background for product hero and thumb images
- OG images: 1200×630 px, always
- Locale variants: add _ar / _hi / _bn / _ru / _zh-CN / _fr suffix
```

---

*Related documents: [Editorial Style Guide](TwinMOSWebsiteEditorialStyleGuide.md) | [Content Authoring Guide for Marketing](TwinMOSWebsiteContentAuthoringGuideforMarketing.md)*
