# TwinMOS Website — Content Authoring Guide for Marketing

**Document Reference:** TWN-F2-AUTH-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Marketing Director
**Applies To:** Marketing team, regional content contributors, external copywriters

---

## Table of Contents

1. [Who This Guide Is For](#1-who-this-guide-is-for)
2. [Content Lifecycle Overview](#2-content-lifecycle-overview)
3. [Content Brief Template](#3-content-brief-template)
4. [Strapi CMS — Step-by-Step Authoring Guide](#4-strapi-cms--step-by-step-authoring-guide)
5. [SEO Writing Checklist](#5-seo-writing-checklist)
6. [Approval Matrix](#6-approval-matrix)
7. [Campaign Content Checklist](#7-campaign-content-checklist)
8. [Content Update Policy](#8-content-update-policy)
9. [Common Mistakes and How to Fix Them](#9-common-mistakes-and-how-to-fix-them)
10. [Useful References](#10-useful-references)

---

## 1. Who This Guide Is For

This guide serves:
- **Marketing Team** — creating campaigns, news, promotions, regional landing pages.
- **Regional Content Contributors** — writing and submitting locale-specific content (UAE, India, Bangladesh, etc.).
- **External Copywriters** — producing content on behalf of TwinMOS under the [Editorial Style Guide](TwinMOSWebsiteEditorialStyleGuide.md) and [Tone of Voice Guide](TwinMOSWebsiteToneofVoice_Guide.md).

It covers the full content creation lifecycle: brief → draft → SEO check → edit → approval → CMS publish → post-publish review.

Product technical content (specifications, compatibility data, datasheets) is owned by the **Product Manager** and authored using separate product documentation workflows. This guide covers marketing, campaign, and editorial content only.

---

## 2. Content Lifecycle Overview

```
1. REQUEST       →  Submit Content Brief (§3)
2. DRAFT         →  Write in approved format (markdown or Google Docs)
3. SEO CHECK     →  Apply SEO Checklist (§5) before submitting
4. PEER EDIT     →  Style and tone review against Editorial Style Guide
5. APPROVAL      →  Sign-off per Approval Matrix (§6)
6. CMS ENTRY     →  Enter into Strapi CMS (§4)
7. STAGING CHECK →  QA team reviews on staging URL
8. PUBLISH       →  Schedule or immediate publish via Strapi
9. CONFIRM LIVE  →  Author confirms page renders correctly on production
10. POST-PUBLISH →  Share link internally; monitor for 72 hours
```

### Status Labels in Strapi

| Strapi Status | Meaning |
|--------------|---------|
| Draft | Created but not submitted for review |
| In Review | Submitted; awaiting approval |
| Approved | Approved; ready to schedule or publish |
| Scheduled | Queued for future publish date/time |
| Published | Live on the website |
| Archived | Removed from public view; retained for 30 days |

---

## 3. Content Brief Template

Submit this brief before starting to write. The brief aligns stakeholders and prevents rewrites.

```markdown
## Content Brief

**Requested by:** [Name, role]
**Date submitted:** [YYYY-MM-DD]
**Target publish date:** [YYYY-MM-DD]
**Priority:** [P0 / P1 / P2 / P3]

---

### Page Details

**Page title (H1 draft):** [Proposed heading]
**URL slug:** /[section]/[proposed-slug]/
**Content section:** [01-homepage / 03-products / 08-learn / 10-news-events / 15-marketing / etc.]
**Content type:** [New page / Update existing / Campaign landing / News article / Press release / KB article]

---

### Objective

What does this page need to accomplish?
[1–3 sentences: business goal + user goal]

---

### Target Audience

Primary persona: [Gamer / IT Pro / Home Builder / Distributor / Enterprise Buyer / Student]
Secondary persona (if applicable): [—]

---

### SEO

**Primary keyword:** [exact phrase, e.g., "best DDR5 RAM for gaming"]
**Secondary keywords (up to 3):** [—]
**Search intent:** [Informational / Commercial / Transactional / Navigational]

---

### Content Requirements

**Target word count:** [e.g., 1,500 words]
**Key sections to cover:**
1. [—]
2. [—]
3. [—]

**Must include:**
- [ ] Product name(s): [—]
- [ ] Call-to-action (CTA): [—]
- [ ] Specific claims or data to highlight: [—]
- [ ] Internal links to include: [—]

**Must avoid:**
- [ ] [Any topics to avoid, competitors not to name, etc.]

---

### Assets

**Images needed:** [List: hero, thumbnail, OG image, diagrams]
**Image source:** [Product team / Marketing / Stock — specify]

---

### Approvals Required

- [ ] Marketing Director
- [ ] Product Manager (if product claims made)
- [ ] Legal (if legal/compliance claims made)
- [ ] Regional Manager (if locale-specific content)

---

### Notes

[Any additional context, background links, related briefs, campaign context]
```

---

## 4. Strapi CMS — Step-by-Step Authoring Guide

### 4.1 Accessing the CMS

- URL: `https://cms.twinmos.com/admin` (internal use only — requires VPN on non-office networks)
- Login: Use your Strapi account credentials (request access from the Front-End Lead)
- Role: Authors can create and edit content in Draft status; they cannot publish directly

### 4.2 Creating a New Page Entry

1. Log in to Strapi Admin.
2. In the left sidebar, select the content type for your page (e.g., **Article**, **Product**, **Landing Page**, **News**).
3. Click **"+ Create new entry"** (top-right).
4. Fill in all required fields (marked with a red asterisk):
   - **Title** (H1) — matches the Content Brief
   - **Slug** — URL path (auto-generated from title; verify it matches the planned URL)
   - **SEO Title** — ≤60 characters
   - **SEO Description** — ≤160 characters (see §5)
   - **Body / Rich Text** — main page content
   - **Featured Image** — upload product hero or page hero image
   - **OG Image** — 1200×630 px Open Graph image
   - **Locale** — set to `en` unless authoring directly in another locale
5. **Save as Draft** — do not publish until approval is complete.

### 4.3 Uploading Images via Media Library

1. In the entry editor, click the image field → **"Add an existing asset"** or **"Upload a new asset"**.
2. In the Media Library, click **"Upload assets"**.
3. Drag and drop your image files (WebP format, named per the [Image Asset Naming Convention](TwinMOSWebsiteImageAssetNaming_Convention.md)).
4. After upload, add **Alt Text** in the asset detail panel — this field is mandatory.
5. Select the uploaded image to attach it to your entry.

> **Alt Text is required** — entries cannot be approved if any image lacks alt text.

### 4.4 Rich Text Formatting in Strapi

The Strapi Rich Text field uses a WYSIWYG editor. Key formatting rules:

| Action | How to Apply |
|--------|-------------|
| Heading H2 | Select text → Heading 2 from the block type selector |
| Heading H3 | Select text → Heading 3 |
| Bold | Ctrl/Cmd + B |
| Italic | Ctrl/Cmd + I |
| Bullet list | Click the list icon |
| Numbered list | Click the numbered list icon |
| Link | Select text → click link icon → paste URL |
| Internal link | Use relative path: `/products/voltx-ddr5/` (not full domain) |
| Code block | Use the code icon for inline or block code |

Do not use H1 in the rich text body — H1 is the page **Title** field. The body content starts at H2.

### 4.5 Scheduling a Publish

1. Complete all required fields and ensure the entry is in **Approved** status.
2. Click the arrow next to **"Publish"** → select **"Schedule publish"**.
3. Set the date and time (use GST/UTC — confirm with Marketing Director for time zone).
4. Save. The entry status changes to **Scheduled**.

### 4.6 Editing an Existing Page

1. Find the entry via Content Manager → search by title or slug.
2. Open the entry. If currently **Published**, any edits automatically create a new **Draft** version (the live version remains unchanged until you publish).
3. Make your edits, re-run the SEO checklist, get approval, then publish.

### 4.7 Archiving a Page

Do not delete pages — archive them:
1. Open the published entry.
2. Change status to **Archived** (via the status dropdown).
3. Save. The page is removed from the sitemap and returns a 404. The Strapi redirect plugin will catch traffic if a redirect rule is configured.

Archived entries are retained for 30 days before permanent deletion (per BRD BR-10.4).

---

## 5. SEO Writing Checklist

Run this checklist on every piece of content before submitting for approval.

### 5.1 Title Tag

- [ ] SEO title is ≤60 characters (including spaces).
- [ ] Primary keyword appears in the SEO title (preferably near the start).
- [ ] Brand "TwinMOS" appears in the SEO title (last segment, e.g., "| TwinMOS").
- [ ] Title is unique — no two pages share the same SEO title.

**Title tag templates by page type:**

| Page Type | Template | Max Length |
|-----------|---------|-----------|
| Product page | `{Product Name} {Key Spec} \| TwinMOS` | 60 |
| Category page | `{Category}: DDR5 / NVMe SSD \| TwinMOS` | 60 |
| Buying guide | `{Topic}: Complete Buying Guide — TwinMOS` | 60 |
| KB article | `How to {Action}: {Product} — TwinMOS Support` | 60 |
| News article | `{Headline (shortened)} — TwinMOS` | 60 |
| Regional page | `TwinMOS in {Country}: Memory & SSD` | 60 |

### 5.2 Meta Description

- [ ] Meta description is ≤160 characters.
- [ ] Primary keyword appears naturally in the description.
- [ ] Description includes a value proposition or differentiator (e.g., "5-year warranty", "Taiwan-engineered", "JEDEC-compliant").
- [ ] Description ends with an implicit or explicit call to action.
- [ ] Description is unique — no two pages share the same meta description.

**Meta description formula:**
`[Product/topic name] + [key benefit or spec] + [differentiator] + [CTA or benefit]`

Example: "VOLTX DDR5 6000MHz 32GB U-DIMM — 48 GB/s bandwidth, Intel XMP 3.0 and AMD EXPO support, 5-year warranty. Engineered in Taiwan."

### 5.3 H1 Heading

- [ ] Exactly one H1 per page.
- [ ] Primary keyword appears in the H1.
- [ ] H1 is unique across the site.

### 5.4 Body Content

- [ ] Primary keyword appears in the first paragraph (within the first 100 words).
- [ ] Secondary keywords appear naturally in H2/H3 subheadings (2–3 uses per page).
- [ ] No keyword stuffing — keywords flow naturally in the text.
- [ ] Content meets the minimum word count for the page type (see Editorial Style Guide §14).

### 5.5 Images

- [ ] Every image has a descriptive alt text (not blank, not "image of").
- [ ] Hero image alt text includes the primary keyword.
- [ ] OG image is set (1200×630 px).
- [ ] Featured image is attached to the entry.

### 5.6 Internal Links

- [ ] At least 2 internal links from this page to related content.
- [ ] At least 1 link back to this page from a relevant category or hub page (update the hub page).
- [ ] Anchor text is descriptive (not "click here" or "read more").
- [ ] Breadcrumb is correctly configured in Strapi.

### 5.7 URL Slug

- [ ] Slug is lowercase and hyphen-separated.
- [ ] Slug is ≤60 characters.
- [ ] Slug contains the primary keyword.
- [ ] Slug follows the URL structure spec (`/section/slug/`).

### 5.8 Technical

- [ ] Canonical URL is set to the correct path.
- [ ] If updating existing content: confirm canonical does not point to an outdated URL.
- [ ] Page is not set to `noindex` unless intentional (e.g., thank-you pages).

---

## 6. Approval Matrix

| Content Type | First Approver | Second Approver | Notes |
|-------------|---------------|-----------------|-------|
| Product description / specs | Product Manager | Marketing Director | Product Manager checks accuracy |
| Buying guide / Learn Hub | Marketing Director | Technical Lead (if technical claims) | |
| News article | Marketing Director | — | |
| Press release | Marketing Director | CEO/Chairman | Must be approved at executive level |
| Campaign landing page | Marketing Director | — | |
| Promotional copy (banners, popups) | Marketing Director | — | |
| Legal / compliance page | Legal/Compliance | Marketing Director | Legal signs off first |
| Regional landing page | Regional Manager | Marketing Director | Regional Manager validates local accuracy |
| Careers page | HR Lead | Marketing Director | |
| KB / support article | Technical Lead | — | |
| About page / company history | CEO / Chairman | Marketing Director | Sensitive — requires executive approval |

### 6.1 SLA

- Standard content approval: **5 business days** from submission.
- Urgent / time-sensitive (product launch, event): **24–48 hours** — flag as urgent in the brief.
- Press releases: **48 hours minimum** — never bypassed.

### 6.2 Approval Workflow in Practice

1. Author marks entry as **"In Review"** in Strapi.
2. Reviewer receives email notification (Strapi workflow email).
3. Reviewer comments directly in Strapi entry fields (using the **Notes** field) or in the shared Google Doc.
4. Author addresses all feedback.
5. Reviewer approves by changing status to **"Approved"** and adding their name to the approval field.
6. For two-approver content: first approver marks as "Review 1 Complete" in notes; second approver marks as "Approved".

---

## 7. Campaign Content Checklist

For promotional campaigns (product launches, seasonal sales, event tie-ins), complete the following in addition to the standard SEO checklist.

### 7.1 Campaign Tracking

- [ ] UTM parameters defined and documented:
  - `utm_source=` (e.g., newsletter, linkedin, google)
  - `utm_medium=` (e.g., email, social, cpc)
  - `utm_campaign=` (e.g., ddr5-launch-may2026, diwali-2026)
  - `utm_content=` (e.g., banner-hero, cta-button)
- [ ] UTM builder spreadsheet updated with this campaign's parameters.
- [ ] All campaign URLs using UTM parameters tested (do not shorten UTM links for internal tracking).

### 7.2 Landing Page

- [ ] Dedicated landing page created (not just a product page) for multi-channel campaigns.
- [ ] Landing page has a single clear CTA (Buy Now / Find a Retailer / Download Datasheet).
- [ ] Landing page noindex tag removed if it should be indexed (confirm with SEO team).
- [ ] Thank-you or confirmation page configured with noindex.
- [ ] Landing page removed or archived after campaign end date.

### 7.3 Newsletter

- [ ] Newsletter segment defined (All subscribers / Region: India / Product interest: Gaming).
- [ ] Email preview text ≤100 characters.
- [ ] Email subject line ≤50 characters.
- [ ] Plain text version of email prepared.
- [ ] Email reviewed on mobile (iOS Mail, Gmail mobile) and desktop (Outlook, Gmail web).
- [ ] Unsubscribe link present and functional.
- [ ] Sender name: "TwinMOS Technologies" — not personal name unless specifically agreed.

### 7.4 Social Media

- [ ] Post copy approved per Social Media Tone guidelines (§10 of Tone of Voice Guide).
- [ ] Hashtags reviewed: use 3–5 relevant hashtags maximum.
- [ ] Post scheduled in Buffer/Hootsuite (or equivalent) at optimal posting times per region.
- [ ] Images for social are cropped to platform specs (Instagram 1:1 or 4:5; LinkedIn 1.91:1; Twitter/X 2:1).

### 7.5 Popups and Banners

- [ ] Popup timing configured (delay: ≥5 seconds after page load; exit-intent: preferred).
- [ ] Popup frequency cap set (show once per session, or once per 7 days per visitor).
- [ ] Banner links to the correct landing page (not the homepage).
- [ ] Banner has an accessible close button (keyboard-accessible, ARIA label).
- [ ] Campaign end date set in Strapi to auto-archive banner/popup.

---

## 8. Content Update Policy

### 8.1 When to Create a New Page

Create a new page when:
- The topic is distinct enough to warrant its own URL (unique keyword target, different user intent).
- The page covers a new product, product line, or content category.
- The existing page is being significantly restructured (>50% of content changes).
- A new regional locale page is needed.

### 8.2 When to Update an Existing Page

Update an existing page (do not create a new one) when:
- Product specifications change (capacity, speed tiers, certifications added).
- Pricing, availability, or distributor information changes.
- SEO improvements are needed (meta tags, keyword optimisation, internal link updates).
- Minor corrections: typos, broken links, outdated data.
- Seasonal copy refresh (same page, updated promotional messaging).

Updating an existing page is always preferred over creating a new one with similar content — duplicate content is penalised by search engines.

### 8.3 Content Review Schedule

| Content Type | Review Cadence | Owner |
|-------------|----------------|-------|
| Product specifications | On product update / quarterly | Product Manager |
| Buying guides and Learn Hub | Annually + on-demand (technology changes) | Technical Lead / Marketing |
| Pricing and availability | Monthly (or as distributor data changes) | Sales Director |
| Regional landing pages | Annually + on partner roster updates | Regional Manager |
| KB / support articles | Bi-annually + when support tickets spike on a topic | Technical Lead |
| Legal pages (Privacy, Terms) | Quarterly (per BRD BR-16.4) | Legal / Compliance |
| Careers / job listings | Weekly (active positions) | HR Lead |
| News / press releases | Never edited after publish (archive and republish if major correction needed) | Marketing Director |

### 8.4 Archiving vs. Deleting

- **Archive** pages that are no longer relevant but have inbound links or organic traffic.
- **Delete** only pages with no traffic and no inbound links (verify in Search Console before deleting).
- Before archiving a product page: set up a 301 redirect to the replacement product or category page.
- Never archive a page without checking its inbound links first (use Screaming Frog or Ahrefs).

---

## 9. Common Mistakes and How to Fix Them

| Mistake | How to Fix |
|---------|-----------|
| **Keyword stuffing** — repeating the primary keyword unnaturally 10+ times | Read the content aloud. If it sounds robotic, rewrite. Use synonyms and related terms. |
| **Duplicate meta descriptions** — copying the same description for multiple pages | Each page must have a unique description. Use the meta description formula in §5.2. |
| **Missing alt text on images** | Never leave alt text blank for informative images. Review the Image Alt Text section in the Editorial Style Guide. |
| **Publishing without approval** | Always complete the approval matrix for the content type. Authors do not have publish rights — only Editors and above. |
| **Using "click here" as link text** | Replace with descriptive anchor text describing the destination. |
| **Creating a new page for every product variant** | Create one canonical product page for the product family; list all variants (capacities, speeds) on that page using a variant selector. |
| **Not setting a canonical URL** | Every Strapi entry has a Canonical URL field — always populate it with the correct absolute URL. |
| **Campaign page left live after campaign ends** | Set a campaign end date in Strapi. The automation will archive it. If not using automation, add a calendar reminder. |
| **Images uploaded without following naming convention** | Rename files before upload. Do not rename in Strapi after upload — this breaks CDN URLs. |
| **Publishing locale content without regional team review** | Regional content (Arabic, Hindi, Bengali, etc.) must be reviewed by the designated regional manager. Never publish without that sign-off. |
| **Missing OG image** | Every page needs a 1200×630 OG image. Use the category/fallback OG if a custom one is not yet available. |
| **H2 used before H1** | The H1 is the page Title field in Strapi. Body content starts at H2. Never put an H1 tag in the Rich Text body. |
| **Broken internal links** | Run the Screaming Frog crawl before publishing if you have manually entered internal links. Strapi content links auto-resolve to slugs. |

---

## 10. Useful References

| Document | Location |
|---------|---------|
| Editorial Style Guide | [F.2 - Editorial Standards/TwinMOSWebsiteEditorialStyleGuide.md](TwinMOSWebsiteEditorialStyleGuide.md) |
| Tone of Voice Guide | [F.2 - Editorial Standards/TwinMOSWebsiteToneofVoice_Guide.md](TwinMOSWebsiteToneofVoice_Guide.md) |
| Image Asset Naming Convention | [F.2 - Editorial Standards/TwinMOSWebsiteImageAssetNaming_Convention.md](TwinMOSWebsiteImageAssetNaming_Convention.md) |
| URL Structure Spec | [F.3 - SEO/TwinMOSWebsiteURLStructureSpec.md](../F.3%20-%20SEO/TwinMOSWebsiteURLStructureSpec.md) |
| SEO Strategy | [F.3 - SEO/TwinMOSWebsiteSEO_Strategy.md](../F.3%20-%20SEO/TwinMOSWebsiteSEO_Strategy.md) |
| Keyword Research | [F.3 - SEO/TwinMOSWebsiteKeyword_Research.md](../F.3%20-%20SEO/TwinMOSWebsiteKeyword_Research.md) |
| Meta Tag Templates | [F.3 - SEO/TwinMOSWebsiteMetaTagTemplates.md](../F.3%20-%20SEO/TwinMOSWebsiteMetaTagTemplates.md) |
| Localization Strategy | [F.4 - Localization/TwinMOSWebsiteLocalization_Strategy.md](../F.4%20-%20Localization/TwinMOSWebsiteLocalization_Strategy.md) |
| Content Map | [content/TwinMOS_Website_Content_Map.md](../../../../content/TwinMOS_Website_Content_Map.md) |
| Master SKU Reference | [content/website-content/_master-sku-reference.md](../../../../content/website-content/_master-sku-reference.md) |

---

*Questions? Contact the Marketing Director or raise an issue in the project tracker.*
