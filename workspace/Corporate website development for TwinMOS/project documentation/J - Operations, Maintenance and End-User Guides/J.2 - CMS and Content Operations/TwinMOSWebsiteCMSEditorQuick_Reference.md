# TwinMOS Website — CMS Editor Quick Reference

**Document Reference:** TWN-OPS-2026-015  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** TwinMOS Marketing Director  
**Audience:** Content Editors, Authors, Marketing Staff, Product Managers  
**Classification:** INTERNAL — TwinMOS Staff Use  
**Synchronized With:** BRD v3.0 §17, Tech Stack v1.1 §5, URD §17

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This quick reference guide provides step-by-step instructions for common content editing tasks in the TwinMOS website's Strapi v5 CMS. It is designed for non-technical users who need to create, edit, and publish content.

---

## 2. Getting Started

### 2.1 Logging In

1. Open your web browser (Chrome, Firefox, Safari, Edge)
2. Go to: `https://admin.twinmos.com`
3. Enter your email address and password
4. If prompted, enter your MFA code from your authenticator app
5. You will see the Strapi Dashboard

### 2.2 Dashboard Overview

```
┌─────────────────────────────────────────────────────────────┐
│  STRAPI ADMIN DASHBOARD                                     │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Home        │  CONTENT MANAGER                             │
│  Content     │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  Media       │  │Products │ │Articles │ │Events   │        │
│  Plugins     │  └─────────┘ └─────────┘ └─────────┘        │
│  Settings    │                                              │
│              │  RECENT ACTIVITY                             │
│              │  • Product "VOLTX DDR5" updated by Jane      │
│              │  • Article "COMPUTEX 2025" published         │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 3. Common Tasks

### 3.1 Creating a New Article

1. Click **Content Manager** in the left sidebar
2. Find and click **NewsArticle** (or relevant content type)
3. Click **"Create new entry"** button (top right)
4. Fill in the fields:
   - **Title**: Enter the article title (e.g., "TwinMOS Launches VOLTX DDR5 RGB Series")
   - **Slug**: Auto-generated from title (edit if needed — use lowercase and hyphens)
   - **Excerpt**: Short summary (1–2 sentences)
   - **Body**: Full article content (use the rich text editor)
   - **Category**: Select from dropdown (News, Press Release, Blog, etc.)
   - **Author**: Select or enter author name
   - **Hero Image**: Upload or select from Media Library
   - **SEO Title**: ≤60 characters (defaults to Title if blank)
   - **SEO Description**: ≤160 characters
   - **Publish Date**: Select date and time
5. Click **"Save"** (saves as draft)
6. Review your content using **Live Preview** (see Section 5)
7. When ready, click **"Publish"**

### 3.2 Editing an Existing Product

1. Click **Content Manager**
2. Click **Product**
3. Use the search bar or filters to find the product
4. Click the product name to open it
5. Edit the fields you need to change
6. **Important**: If changing product specifications, an Editor or Admin must review before publishing (BR-10.2)
7. Click **"Save"**
8. If you have publish permission, click **"Publish"**

### 3.3 Uploading Images to the Media Library

1. Click **Media Library** in the left sidebar
2. Click **"Add new assets"**
3. Drag and drop files or click to browse
4. For each image:
   - Add **Alt Text** (required for accessibility — WCAG 2.1 AA)
   - Add **Caption** (optional)
   - Choose **Folder** (optional — for organization)
5. Click **"Upload assets to the library"**

**Image Guidelines:**
- Product photos: 1200 × 1200 px, transparent PNG
- OG images: 1200 × 630 px
- Article hero images: 1920 × 1080 px minimum
- Maximum file size: 10 MB
- Preferred formats: PNG, JPG, WebP

### 3.4 Working with SEO Fields

Every content entry has SEO fields to optimize for search engines:

| Field | Purpose | Best Practice |
|-------|---------|---------------|
| **SEO Title** | Browser tab title, search result headline | ≤60 characters; include primary keyword |
| **SEO Description** | Search result snippet | ≤160 characters; compelling summary |
| **OG Title** | Social media share title | Can match SEO Title |
| **OG Description** | Social media share description | Can match SEO Description |
| **OG Image** | Social media share image | 1200 × 630 px |
| **Canonical URL** | Preferred URL if duplicates exist | Leave blank unless needed |

### 3.5 Managing Locales (Multi-Language)

1. Open any content entry
2. Look for the **locale selector** (top of the page, e.g., "EN")
3. Click the locale selector to switch languages
4. To create a translation:
   - Switch to the target locale (e.g., "AR")
   - Click **"Create [locale] version"**
   - Translate the content fields
   - Save and publish
5. The system will show which locales are published and which are draft

**Note:** Not all fields need translation. SKU codes, technical specs, and EAN/MPN numbers remain the same across all locales.

### 3.6 Scheduling Content Publication

1. Create or edit a content entry
2. Fill in all required fields
3. Instead of clicking **"Publish"**, click the **clock icon** next to the Publish button
4. Select the desired publish date and time
5. Click **"Schedule publication"**
6. The entry will automatically publish at the scheduled time

### 3.7 Unpublishing Content

1. Open the published entry
2. Click **"Unpublish"**
3. Confirm the action
4. The content will be removed from the public website but retained in the CMS

### 3.8 Deleting Content

1. Open the entry you want to delete
2. Click **"Delete"** (usually in the top-right menu)
3. Confirm the deletion
4. **Note**: Deletions are soft-deleted (30-day recovery window per BR-10.4). After 30 days, content is permanently removed.

---

## 4. Content Workflow

### 4.1 Draft → Review → Publish

```
Author creates content → Saves as Draft
         ↓
Author submits for review (if required by role)
         ↓
Editor reviews and either:
   • Approves → Publishes
   • Requests changes → Returns to Author with comments
         ↓
Published content appears on website (ISR rebuild within 60 seconds)
```

### 4.2 Role-Based Workflow

| Role | Can Create | Can Edit Own | Can Edit Others | Can Publish | Can Delete |
|------|-----------|--------------|-----------------|-------------|------------|
| Author | Yes | Yes | No | No | No |
| Editor | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes |

---

## 5. Live Preview

### 5.1 Using Live Preview

1. While editing any content entry, look for the **"Preview"** button
2. Click **"Open preview"**
3. A new tab opens showing how the content will appear on the website
4. The preview updates as you make changes (auto-refresh)
5. Share the preview URL with stakeholders for review

### 5.2 Preview Limitations

- Preview shows staging/styling; may differ slightly from production
- Dynamic data (forms, search, e-commerce) may not be fully functional
- Preview links expire after 24 hours
- Some interactive elements (maps, chat) are disabled in preview

---

## 6. Rich Text Editor Tips

### 6.1 Formatting

| Action | Shortcut | Button |
|--------|----------|--------|
| Bold | Ctrl+B | B |
| Italic | Ctrl+I | I |
| Heading 2 | — | H2 |
| Heading 3 | — | H3 |
| Bulleted list | — | • |
| Numbered list | — | 1. |
| Insert link | Ctrl+K | 🔗 |
| Insert image | — | 🖼️ |
| Insert table | — | ⊞ |
| Code block | — | `</>` |
| Quote | — | " |

### 6.2 Embedding Media

1. In the rich text editor, click the **image icon**
2. Select an image from the Media Library or upload new
3. The image will be embedded with responsive sizing
4. Add alt text for accessibility

### 6.3 Inserting Links

1. Select the text you want to link
2. Click the **link icon** or press Ctrl+K
3. Enter the URL
4. Choose "Open in new tab" for external links
5. Click **"Save"**

---

## 7. Tips & Best Practices

### 7.1 Content Quality

- Use clear, concise language
- Check spelling and grammar before publishing
- Ensure all facts are accurate (especially product specifications)
- Use consistent terminology (refer to the TwinMOS Glossary)
- Include relevant cross-links to other pages

### 7.2 Accessibility

- Always add alt text to images
- Use heading levels correctly (H1 for page title, H2 for sections, H3 for subsections)
- Ensure color contrast is sufficient (do not rely on color alone for meaning)
- Write descriptive link text (avoid "click here")

### 7.3 SEO

- Include target keywords naturally in title and first paragraph
- Write unique meta descriptions for every page
- Use descriptive URLs (slugs)
- Link to related internal content

### 7.4 Saving & Recovery

- Save your work frequently (Ctrl+S)
- The CMS auto-saves drafts every 30 seconds
- If you see a conflict warning, someone else is editing the same entry — coordinate with them
- Use the version history to compare changes and restore previous versions

---

## 8. Getting Help

| Issue | Contact | Method |
|-------|---------|--------|
| Cannot log in | TwinMOS IT Lead | Email / Slack |
| CMS is slow or not loading | Unisoft Team Lead | Slack #ops |
| Need new user account | Admin / Super Admin | Email request |
| Content not appearing on website | Unisoft Senior Developer | Slack #ops |
| Training needed | TwinMOS Marketing Director | Schedule session |
| Feature request | TwinMOS PM | Email / meeting |

---

## 9. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Marketing Director | (TBC) | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.2 - CMS and Content Operations/TwinMOSWebsiteCMSEditorQuick_Reference.md`
