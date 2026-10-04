# TwinMOS Website — Content Publishing Workflow

**Document Reference:** TWN-OPS-2026-016  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** TwinMOS Marketing Director  
**Audience:** Content Editors, Authors, Marketing Staff, Product Managers, Legal Reviewers  
**Classification:** INTERNAL — TwinMOS Staff Use  
**Synchronized With:** BRD v3.0 §17, §18, BR-10.1, BR-10.2, BR-10.3, BR-10.4, Tech Stack v1.1 §5.4, §5.5, §24.4

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This document defines the end-to-end content publishing workflow for the TwinMOS website. It covers content creation, review, approval, publication, and rollback procedures, ensuring all published content meets quality, brand, legal, and technical standards.

---

## 2. Workflow Overview

### 2.1 High-Level Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CREATE    │ →  │    SAVE     │ →  │   REVIEW    │ →  │   PUBLISH   │ →  │   VERIFY    │
│  (Author)   │    │  (Draft)    │    │  (Editor)   │    │  (Editor)   │    │  (Auto)     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │                  │
       ↓                  ↓                  ↓                  ↓                  ↓
  Write content      Auto-save         Check quality     Trigger ISR       Website updated
  Add media          every 30s         Fact-check        rebuild           within 60s
  Fill SEO           Manual save       Legal review      Webhook fired     Cache purged
                     Version history   Approve/Reject    Sitemap updated   CDN refreshed
```

### 2.2 Content Types & Workflows

| Content Type | Workflow | Review Required | Legal Review | Phase |
|--------------|----------|-----------------|--------------|-------|
| News Article | Standard | Editor | No | P1 |
| Product Page | Spec Review | Editor + Product Manager | No | P1 |
| Legal Page | Legal Review | Editor + Legal Counsel | Yes | P1 |
| Partner Portal Content | Partner Review | Editor + Sales Director | If pricing | P2 |
| Promotion / Campaign | Marketing Review | Editor + Marketing Director | If terms | P1 |
| Job Posting | HR Review | Editor + HR Director | Yes (privacy) | P1 |
| Regional Page | Regional Review | Editor + Regional Stakeholder | No | P1 |

---

## 3. Step-by-Step Workflow

### 3.1 Step 1 — Content Creation

**Actor:** Author / Editor

1. Log in to Strapi admin at `https://admin.twinmos.com`
2. Navigate to **Content Manager** → select content type
3. Click **"Create new entry"**
4. Complete all required fields:
   - Title, slug, body content
   - Media (images with alt text)
   - SEO fields (title, description, OG image)
   - Category, tags, related content
   - Locale (if creating translation)
5. Content auto-saves every 30 seconds
6. Click **"Save"** to create a draft version

**Content Quality Checklist (Author self-check):**
- [ ] Spelling and grammar checked
- [ ] Facts verified (especially product specs, pricing, dates)
- [ ] Images have alt text
- [ ] SEO fields completed
- [ ] Cross-links to related content added
- [ ] Tone aligns with TwinMOS brand guidelines

### 3.2 Step 2 — Review & Approval

**Actor:** Editor (or designated reviewer)

1. Navigate to the draft content in Content Manager
2. Review all fields against the Content Quality Checklist
3. For product pages: verify specifications against `_master-sku-reference.md` (BR-10.2)
4. For legal pages: send to Legal Counsel for review
5. For regional pages: verify with regional stakeholder
6. Use **Live Preview** to review the rendered page
7. Decision:
   - **Approve**: Proceed to publish
   - **Request Changes**: Add comments, return to Author
   - **Reject**: Document reason, archive if appropriate

**Review Turnaround SLA:**
- Standard content: 24 hours (business days)
- Time-sensitive (events, promotions): 4 hours
- Legal review: 48 hours

### 3.3 Step 3 — Publication

**Actor:** Editor / Admin

1. Open the approved content entry
2. Verify all review comments are resolved
3. Click **"Publish"**
4. System actions (automatic):
   - Content status changes to `published`
   - Webhook fires to Cloudflare Pages
   - ISR (Incremental Static Regeneration) rebuild triggered
   - Sitemap regenerated with new/updated URL
   - Cache purged for affected pages
   - Audit log entry created

**Publication Timing:**
- Standard content: publish immediately after approval
- Scheduled content: use Publisher plugin to set future date
- Event content: publish 7 days before event date (default)

### 3.4 Step 4 — Verification

**Actor:** Automated + Editor (spot-check)

1. **Automated (within 60 seconds):**
   - ISR rebuild completes
   - Cloudflare cache purged
   - Sitemap updated
   - Search index updated (MeiliSearch)

2. **Manual verification (Editor):**
   - Visit the public URL
   - Check rendering, images, links
   - Verify SEO meta tags (use browser dev tools)
   - Test on mobile device
   - Check related content and cross-links

3. **If issues found:**
   - Unpublish immediately
   - Fix in CMS
   - Re-publish
   - Report issue to Unisoft Team Lead if technical

---

## 4. Special Workflows

### 4.1 Product Specification Changes (BR-10.2)

Product specification changes require additional review:

1. Author/Editor makes changes to Product entry
2. System flags spec fields as "pending review"
3. Product Manager receives notification
4. Product Manager reviews and approves specifications
5. Editor publishes the updated product
6. Audit log records spec change with before/after diff

**Fields requiring Product Manager review:**
- SKU, EAN, MPN
- Technical specifications (speed, capacity, voltage, timings)
- Compatibility data
- Warranty period
- Pricing (if applicable)

### 4.2 Legal Content Workflow

Legal pages require Legal Counsel sign-off:

1. Author creates draft legal content
2. Editor reviews for formatting and completeness
3. Legal Counsel reviews for accuracy and compliance
4. Legal Counsel approves (digital sign-off in comments)
5. Editor publishes
6. Legal Counsel notified of publication

**Legal content types:**
- Privacy Policy
- Terms of Use / Terms of Sale
- Cookie Policy
- Warranty Policy
- Accessibility Statement
- Compliance pages (RoHS, REACH, CE, etc.)
- Counterfeit Policy
- Security Disclosure

### 4.3 Emergency Content Removal

If published content must be removed immediately:

1. Open the content entry in CMS
2. Click **"Unpublish"**
3. Content is removed from public site within 60 seconds
4. Document reason in audit log comments
5. Notify relevant stakeholders
6. If legal/regulatory issue: notify Legal Counsel immediately

### 4.4 Content Rollback

To revert to a previous version:

1. Open the content entry
2. Navigate to **Version History** (if available) or manually revert fields
3. If version history unavailable: restore from backup (contact Unisoft Team Lead)
4. Save and re-publish
5. Document rollback reason

---

## 5. Content Lifecycle States

| State | Description | Visibility | Who Can Set |
|-------|-------------|------------|-------------|
| **Draft** | Work in progress | CMS only | Author, Editor |
| **Ready for Review** | Awaiting review | CMS only | Author |
| **In Review** | Being reviewed | CMS only | Editor |
| **Changes Requested** | Returned to author | CMS only | Editor |
| **Approved** | Ready to publish | CMS only | Editor, Admin |
| **Published** | Live on website | Public | Editor, Admin |
| **Unpublished** | Was live, now hidden | CMS only | Editor, Admin |
| **Scheduled** | Will publish at set time | CMS only | Editor, Admin |
| **Archived** | Retired content | CMS only | Admin |

---

## 6. Multi-Language Publishing

### 6.1 Translation Workflow

1. Source content published in English (EN)
2. Translation vendor receives XLIFF/CSV export
3. Translator completes translation
4. TwinMOS regional reviewer validates
5. XLIFF/CSV imported into Strapi target locale
6. Editor reviews imported translation
7. Publish target locale

### 6.2 Locale Publishing Rules

- English (EN) is the source of truth and must be published first
- Other locales can be published independently
- If EN content is updated, a task is created to update translations
- Fallback: if a locale is not published, visitors see EN content
- RTL (Arabic): verify layout in Live Preview before publishing

---

## 7. Audit & Compliance

### 7.1 Audit Trail

Every content action is logged:
- Create, update, delete, publish, unpublish
- Who performed the action
- Timestamp
- Before/after diff for updates
- IP address and user agent

### 7.2 Compliance Requirements

| Requirement | Implementation |
|-------------|----------------|
| GDPR Art. 30 (Records of Processing) | Audit log retained 12 months online + 24 months archived |
| BR-10.1 (User creation restrictions) | Only Admin/Super Admin can create CMS users |
| BR-10.2 (Spec change review) | Product spec fields require Product Manager approval |
| BR-10.3 (Draft-first publishing) | New content defaults to draft; explicit publish required |
| BR-10.4 (30-day soft-delete) | Deleted content recoverable for 30 days |

---

## 8. Communication Templates

### 8.1 Content Ready for Review

```
Subject: [REVIEW REQUIRED] [Content Type]: [Title]

Hi [Reviewer],

The following content is ready for your review:

Title: [Title]
Type: [Content Type]
URL (Preview): [Live Preview link]
CMS Link: [Strapi admin link]

Please review by [DATE/TIME].

Notes: [Any special instructions]
```

### 8.2 Content Published Notification

```
Subject: [PUBLISHED] [Content Type]: [Title]

Hi Team,

The following content has been published:

Title: [Title]
Type: [Content Type]
Public URL: [URL]
Published by: [Name]
Published at: [Date/Time]

Please verify the live page and report any issues.
```

---

## 9. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Marketing Director | (TBC) | _______________ | _________ |
| Legal Counsel | (TBC) | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.2 - CMS and Content Operations/TwinMOSWebsiteContentPublishingWorkflow.md`
