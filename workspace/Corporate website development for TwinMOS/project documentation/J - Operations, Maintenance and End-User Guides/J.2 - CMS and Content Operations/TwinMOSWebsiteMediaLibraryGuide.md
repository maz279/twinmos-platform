# TwinMOS Website — Media Library Guide

**Document Reference:** TWN-OPS-2026-019  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** TwinMOS Marketing Director  
**Audience:** Content Editors, Marketing Staff, Designers, Product Managers  
**Classification:** INTERNAL — TwinMOS Staff Use  
**Synchronized With:** BRD v3.0 §5.3, §8, Tech Stack v1.1 §8, URD §20

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This guide documents the Media Library usage for the TwinMOS website, including upload procedures, image optimization, organization, alt text requirements, and asset management best practices.

---

## 2. Media Library Overview

### 2.1 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **CMS Media Library** | Strapi v5 built-in | Upload, organize, manage assets |
| **Storage Provider** | Backblaze B2 (S3-compatible) | Object storage for all uploads |
| **Image Optimization** | ImgProxy (self-hosted) | On-demand WebP/AVIF conversion, resizing |
| **CDN Delivery** | Cloudflare + ImgProxy | Fast global asset delivery |

### 2.2 Supported Formats

| Format | Use Case | Max Size |
|--------|----------|----------|
| **PNG** | Product photos with transparency | 10 MB |
| **JPG/JPEG** | General photos, hero images | 10 MB |
| **WebP** | Preferred web format (auto-converted) | 10 MB |
| **GIF** | Simple animations only | 5 MB |
| **PDF** | Datasheets, manuals, whitepapers | 10 MB |
| **DOC/DOCX** | Documents (rarely used) | 10 MB |
| **MP4** | Product videos (embed via YouTube preferred) | 50 MB |

---

## 3. Image Specifications

### 3.1 Product Images

| Specification | Requirement | Reason |
|---------------|-------------|--------|
| **Resolution** | 1200 × 1200 px minimum | High-quality zoom capability |
| **Format** | Transparent PNG (source) | Clean backgrounds for product grids |
| **Color Space** | sRGB | Web compatibility |
| **Background** | Transparent or pure white | Consistent product grid appearance |
| **File Size** | < 2 MB (before upload) | Fast loading |
| **Naming** | `[SKU]-[angle]-[variant].png` | Organized, searchable |

**Example filenames:**
- `VOLTX-DDR5-6000-32GB-front.png`
- `VOLTX-DDR5-6000-32GB-angle.png`
- `VOLTX-DDR5-6000-32GB-RGB-lit.png`

### 3.2 Hero / Banner Images

| Specification | Requirement |
|---------------|-------------|
| **Resolution** | 1920 × 1080 px minimum (16:9) |
| **Format** | JPG or WebP |
| **File Size** | < 500 KB |
| **Safe Zone** | Keep text-safe area center 60% of image |
| **Text** | No text embedded in image (use HTML overlay) |

### 3.3 OG / Social Share Images

| Specification | Requirement |
|---------------|-------------|
| **Resolution** | 1200 × 630 px (1.91:1 ratio) |
| **Format** | JPG or PNG |
| **File Size** | < 300 KB |
| **Branding** | Include TwinMOS logo |

### 3.4 Article / Content Images

| Specification | Requirement |
|---------------|-------------|
| **Resolution** | 1200 px width minimum |
| **Format** | JPG or WebP |
| **File Size** | < 300 KB |
| **Aspect Ratio** | Flexible (document in alt text if unusual) |

---

## 4. Upload Procedures

### 4.1 Single File Upload

1. Navigate to **Media Library** in Strapi admin left sidebar
2. Click **"Add new assets"**
3. Drag and drop file OR click to browse
4. For each image, complete:
   - **Alternative text** (required — see Section 5)
   - **Caption** (optional)
   - **Folder** (optional — for organization)
5. Click **"Upload assets to the library"**
6. Verify upload success (thumbnail appears)

### 4.2 Bulk Upload

1. Navigate to **Media Library**
2. Click **"Add new assets"**
3. Select multiple files (Ctrl+Click or drag folder)
4. Complete alt text for each image
5. Click **"Upload assets to the library"**

### 4.3 Upload via Content Entry

1. Open any content entry in Content Manager
2. Click the image/media field
3. Select **"Upload new asset"** or choose from library
4. Complete alt text
5. Save content entry

---

## 5. Alt Text Requirements

### 5.1 Why Alt Text Matters

- **Accessibility:** Screen readers announce alt text to visually impaired users (WCAG 2.1 AA requirement)
- **SEO:** Search engines use alt text to understand image content
- **Fallback:** Displayed if image fails to load

### 5.2 Alt Text Best Practices

| Do | Don't |
|----|-------|
| Describe the image content concisely | "Image of..." (screen readers already say "image") |
| Include product name and key feature | "Picture" or "Logo" (too vague) |
| Mention text that appears in the image | Repeat adjacent caption text |
| Use proper punctuation | Use ALL CAPS |
| Keep under 125 characters | Exceed 250 characters |

### 5.3 Alt Text Examples

| Image | Good Alt Text | Bad Alt Text |
|-------|--------------|--------------|
| Product photo | "TwinMOS VOLTX DDR5 6000MHz 32GB U-DIMM with RGB lighting" | "Memory module" |
| Hero banner | "TwinMOS VOLTX RGB DDR5 memory sticks glowing on a gaming motherboard" | "Banner image" |
| Team photo | "TwinMOS leadership team at COMPUTEX 2025 booth" | "People at event" |
| Logo | "TwinMOS Technologies logo" | "Logo" |
| Diagram | "Diagram showing DDR5 vs DDR4 speed comparison" | "Chart" |

### 5.4 Decorative Images

If an image is purely decorative (no meaningful content):
- Set alt text to empty string (`alt=""`)
- The CMS will handle this automatically if you check "Decorative image"
- Do NOT leave alt text blank without marking as decorative

---

## 6. Media Organization

### 6.1 Folder Structure

```
Media Library/
├── products/
│   ├── ddr5/
│   ├── ddr4/
│   ├── ssds/
│   └── portable/
├── marketing/
│   ├── banners/
│   ├── social/
│   └── campaigns/
├── news/
│   ├── 2026/
│   └── 2027/
├── events/
│   ├── computex/
│   └── gitex/
├── partners/
│   ├── logos/
│   └── co-branded/
├── legal/
│   └── certifications/
└── site-wide/
    ├── header/
    ├── footer/
    └── icons/
```

### 6.2 Creating Folders

1. In Media Library, click **"Create new folder"**
2. Enter folder name
3. Choose parent folder (or root)
4. Click **"Create"**

### 6.3 Moving Assets

1. Select asset(s) (check checkbox)
2. Click **"Move"** button
3. Select destination folder
4. Confirm

---

## 7. Image Optimization

### 7.1 Automatic Optimization

The TwinMOS website automatically optimizes images via ImgProxy:

| Feature | Behavior |
|---------|----------|
| **Format conversion** | Auto WebP (primary) + AVIF (where supported) + JPEG fallback |
| **Responsive sizing** | Multiple sizes generated: 320w, 640w, 960w, 1280w, 1920w |
| **Compression** | Quality 85% for photos, 90% for product images |
| **Lazy loading** | Below-fold images load on scroll |
| **Preload** | Hero/LCP images preloaded for fast rendering |

### 7.2 Manual Optimization (Before Upload)

For best results, optimize images before upload:

1. **Resize** to target dimensions (don't upload 5000×5000 px images)
2. **Compress** using tools like:
   - TinyPNG (online)
   - Squoosh (Google)
   - Photoshop "Export for Web"
3. **Verify** file size is under limits

### 7.3 Video Handling

- **Preferred:** Embed YouTube/Vimeo videos (lazy-loaded, privacy-enhanced mode)
- **Self-hosted:** Upload MP4 to Media Library (max 50 MB)
- **Accessibility:** Always provide captions or transcript

---

## 8. Replacing & Updating Media

### 8.1 Replacing an Image

1. Find the image in Media Library
2. Click on the image to open details
3. Click **"Replace media"**
4. Upload new file
5. The new file replaces the old one in all content entries that use it
6. **Note:** Old file is retained in version history for 30 days

### 8.2 Updating Without Replacing

If you need to keep the old version:
1. Upload new image as a separate asset
2. Update the content entry to reference the new image
3. Old image remains in library

### 8.3 Deleting Media

1. Select asset(s) in Media Library
2. Click **"Delete"**
3. Confirm deletion
4. **Warning:** If asset is used in content, deletion may break those pages. Check "Used in" tab first.

---

## 9. Asset URLs & CDN

### 9.1 URL Structure

```
https://imgproxy.twinmos.com/[signature]/[options]/plain/[backblaze-url]
```

Example:
```
https://imgproxy.twinmos.com/signature/rs:fill:800:600:1/g:sm/plain/https://s3.us-west-002.backblazeb2.com/twinmos-assets/products/voltx-ddr5-front.png
```

### 9.2 Direct Media Library URLs

For linking directly (not recommended for production):
```
https://s3.us-west-002.backblazeb2.com/twinmos-assets/[path]
```

Always use ImgProxy URLs for images to ensure optimization.

---

## 10. Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Upload fails | File too large | Compress image or split into smaller files |
| Upload fails | Invalid format | Convert to supported format (PNG, JPG, WebP) |
| Image not showing on website | ImgProxy error | Check Backblaze B2 credentials; verify asset exists |
| Image blurry | Too small for container | Upload higher resolution image |
| Image slow to load | Large file size | Compress before upload; verify ImgProxy is running |
| Alt text not saving | Field left empty | Alt text is required — enter description or mark as decorative |
| Cannot delete image | Used in content | Remove from all content entries first, or replace |

---

## 11. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Marketing Director | (TBC) | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.2 - CMS and Content Operations/TwinMOSWebsiteMediaLibraryGuide.md`
