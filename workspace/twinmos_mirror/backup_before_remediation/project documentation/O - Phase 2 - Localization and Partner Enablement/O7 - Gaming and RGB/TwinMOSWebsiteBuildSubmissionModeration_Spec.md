# Build Submission & Moderation System — Functional Specification

**Document Reference:** TWN-P2-BUILD-MOD-2027-001  
**Project:** TwinMOS Technologies Corporate Website  
**Engagement:** Unisoft Engineering  
**Phase:** Phase 2 — Localization and Partner Enablement  
**Version:** 1.0  
**Status:** Draft  
**Author:** Unisoft Engineering  
**Last Updated:** 2027-01-05  
**Reviewed By:** TwinMOS Marketing, TwinMOS Engineering Lead  

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Tech Stack Specification | TwinMOS_Website_Technology_Stack.md §5.4, §10.1 |
| RGB Visualizer Spec | TWN-P2-RGB-VIZ-2027-001 |
| Phase 2 Kickoff Document | TWN-P2-KICKOFF-2027-001 |
| Content: Build Submit Form | `/gaming/build-submit/` (07-build-submit-form.md) |
| Content: Build Gallery | `/gaming/build-gallery/` (06-build-gallery.md) |
| BRD references | BR-18.1, BR-18.2, BR-18.3, BR-18.4 |
| URD references | UR-8.1.1, UR-8.1.2, UR-8.2.1, UR-8.3.1, UR-8.4.1 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope and Objectives](#2-scope-and-objectives)
3. [User Roles and Personas](#3-user-roles-and-personas)
4. [Submission Workflow Overview](#4-submission-workflow-overview)
5. [Submission State Machine](#5-submission-state-machine)
6. [Data Model](#6-data-model)
7. [Form Implementation](#7-form-implementation)
8. [File Upload and Storage](#8-file-upload-and-storage)
9. [Moderation Queue — Backend](#9-moderation-queue--backend)
10. [Moderation Interface — Admin UI](#10-moderation-interface--admin-ui)
11. [Email Notification Templates](#11-email-notification-templates)
12. [Publication to Gallery](#12-publication-to-gallery)
13. [Gallery Frontend](#13-gallery-frontend)
14. [API Endpoints](#14-api-endpoints)
15. [Content Validation Rules](#15-content-validation-rules)
16. [Anti-Spam and Rate Limiting](#16-anti-spam-and-rate-limiting)
17. [Strapi Configuration](#17-strapi-configuration)
18. [Performance Requirements](#18-performance-requirements)
19. [Accessibility Requirements](#19-accessibility-requirements)
20. [Analytics and Tracking](#20-analytics-and-tracking)
21. [Acceptance Criteria](#21-acceptance-criteria)
22. [Open Questions](#22-open-questions)

---

## 1. Executive Summary

The Build Submission & Moderation System enables community members to submit their gaming PC builds to TwinMOS for review and publication in the Build Gallery at `/gaming/build-gallery/`. Submissions must include at least one TwinMOS or VOLTX product and pass a human moderation review before appearing publicly.

This system is a Phase 2 deliverable (Sprint 7, February–March 2027). In Phase 1, the `/gaming/build-submit/` and `/gaming/build-gallery/` pages exist as static content placeholders. Phase 2 activates:

- Live build submission form with photo upload
- Strapi-backed `BuildSubmission` content type with moderation queue
- Moderator review UI in Strapi admin panel
- Email notifications via Resend at each state transition
- Dynamic gallery page rendering approved submissions via MeiliSearch
- Monthly "Featured Build" selection workflow

The system serves the TwinMOS marketing goal of generating authentic user-generated content (UGC) that demonstrates real-world product use, supporting social media amplification and brand credibility in the gaming segment.

---

## 2. Scope and Objectives

### 2.1 In Scope (Phase 2)

- Build submission form with real-time validation (client-side + server-side)
- Multi-image upload: up to 5 images, 5MB each, JPG/PNG
- Strapi `BuildSubmission` content type with full lifecycle management
- 4-state moderation workflow: PENDING → UNDER_REVIEW → APPROVED / REJECTED
- Moderator email digest and individual submission notifications
- Submitter email notifications at PENDING confirmation and APPROVED/REJECTED decision
- Gallery rendering: paginated, filterable, sortable builds from MeiliSearch
- Featured Build of the Month: manual selection by moderator, promoted to hero position
- Build detail page at `/gaming/build-gallery/{build-slug}/`
- Social share buttons per build
- Resubmission workflow for rejected builds

### 2.2 Out of Scope (Phase 2)

- Community voting / "like" system (Phase 3)
- Build comparison tool (Phase 3)
- Video submission (Phase 3)
- User accounts for submitters — submissions are anonymous/guest (no auth required)
- Automated AI-based content moderation (future consideration)
- Partner/Ambassador priority queue (Phase 3)

### 2.3 Business Objectives

| Objective | Target | Measurement |
|-----------|--------|-------------|
| Monthly gallery submissions | ≥20 / month by Month 3 after launch | Plausible form_submit event |
| Approved publication rate | ≥60% of valid submissions | Strapi state analytics |
| Moderation turnaround | ≤5 business days | State timestamp delta |
| Social amplification | ≥5 builds shared/month on TwinMOS channels | Marketing team KPI |
| SEO value | Build detail pages indexed in Google within 30 days | Google Search Console |

---

## 3. User Roles and Personas

### 3.1 Community Submitter (Anonymous)

- No account required
- Submits form once per build (no drafts, no session persistence beyond current visit)
- Receives email notifications via provided email address
- May resubmit after rejection with a new form submission referencing original ID

### 3.2 Moderator (TwinMOS Marketing Team)

- Strapi admin role: `moderator`
- Can view all PENDING and UNDER_REVIEW submissions in moderation queue
- Can approve (with optional editorial note) or reject (with mandatory rejection reason)
- Can assign "Featured Build of the Month" flag to any APPROVED submission
- Cannot delete submissions (archive-only policy)
- Receives daily digest email of pending queue count

### 3.3 Content Manager (TwinMOS Marketing Lead)

- Strapi admin role: `content-manager`
- All moderator capabilities
- Can edit approved build content (fix typos, adjust attribution) before or after publication
- Can manually trigger gallery MeiliSearch re-index
- Can bulk-approve/reject submissions matching filter criteria

### 3.4 Gallery Visitor (Public)

- Reads published builds at `/gaming/build-gallery/`
- Can filter by category, country, and sort order
- Can share individual builds via social buttons
- No login required for gallery browsing

---

## 4. Submission Workflow Overview

```
[Public] /gaming/build-submit/
    │
    ▼
[Form Submission] POST /api/v1/builds/submit
    │
    ├─ Validation fails → 400 error, inline form errors shown
    │
    └─ Validation passes
          │
          ▼
    [Strapi] BuildSubmission created, state = PENDING
          │
          ├─ Trigger: afterCreate hook → add to moderation queue
          │
          ├─ Email to submitter: BSM-01 (Submission Received)
          │
          └─ Email to moderation team: BSM-02 (New Submission Alert)
                │
                ▼
    [Moderator] Reviews in Strapi Admin Panel
          │
          ├─ Assigns UNDER_REVIEW (locks from other moderators)
          │
          └─ Makes decision:
                │
                ├─ REJECTED → state = REJECTED
                │     ├─ Email to submitter: BSM-03 (Not Approved)
                │     └─ Resubmission allowed with feedback
                │
                └─ APPROVED → state = APPROVED
                      ├─ Build published to MeiliSearch index
                      ├─ Gallery page updated (ISR revalidation)
                      └─ Email to submitter: BSM-04 (Approved — You're in the Gallery!)
```

---

## 5. Submission State Machine

### 5.1 States

| State | Description | Who Can Set |
|-------|-------------|------------|
| `PENDING` | Submitted, awaiting assignment to a moderator | System (on create) |
| `UNDER_REVIEW` | Assigned to a moderator, review in progress | Moderator / Content Manager |
| `APPROVED` | Accepted, published to gallery | Moderator / Content Manager |
| `REJECTED` | Not accepted; submitter notified with reason | Moderator / Content Manager |
| `ARCHIVED` | Administratively removed from public view | Content Manager only |

### 5.2 Allowed Transitions

```
PENDING      → UNDER_REVIEW   (moderator assigns to self)
PENDING      → REJECTED        (moderator fast-tracks rejection)
UNDER_REVIEW → APPROVED        (moderator approves)
UNDER_REVIEW → REJECTED        (moderator rejects)
APPROVED     → ARCHIVED        (content manager removes from gallery)
REJECTED     → PENDING         (submitter resubmits; system creates new record referencing original)
```

### 5.3 Terminal States

`ARCHIVED` is terminal. `REJECTED` is semi-terminal — the original record is never changed, but a new submission record can reference it via `original_submission_id`.

### 5.4 SLA Targets (BR-18.3)

| Transition | SLA | Breach Action |
|------------|-----|---------------|
| PENDING → UNDER_REVIEW | 2 business days | Moderator escalation email |
| UNDER_REVIEW → APPROVED/REJECTED | 3 business days | Manager escalation email |
| Total PENDING → decision | 5 business days | SLA breach flag on record |

---

## 6. Data Model

### 6.1 `BuildSubmission` Content Type

```typescript
interface BuildSubmission {
  // Identity
  id: number;
  submission_ref: string;           // BSM-{YEAR}-{6-digit-seq} e.g. BSM-2027-000001
  state: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  
  // Submitter Information (internal only)
  gamer_tag: string;                // Max 50 chars; published with build if approved
  full_name: string | null;         // Max 100 chars; never published
  email: string;                    // Validated email; never published
  country_region: string;           // Max 100 chars; published on build card
  instagram_handle: string | null;
  twitter_handle: string | null;
  youtube_handle: string | null;
  twitch_handle: string | null;
  content_consent: boolean;         // Must be true; stored permanently
  terms_accepted: boolean;          // Must be true; stored permanently
  twinmos_product_confirmed: boolean; // Must be true
  
  // Build Specifications (published if approved)
  build_name: string;               // Max 100 chars
  build_category: BuildCategory;
  cpu: string;                      // Max 150 chars
  motherboard: string;              // Max 150 chars
  gpu: string;                      // Max 150 chars
  memory: string;                   // Max 150 chars; must reference VOLTX/TwinMOS
  storage: string;                  // Max 150 chars
  case_name: string;                // Max 150 chars
  cpu_cooler: string;               // Max 150 chars
  power_supply: string;             // Max 150 chars
  additional_components: string | null; // Max 500 chars
  build_story: string;              // Min 100, max 500 words
  
  // Photo Assets
  photos: BuildPhoto[];             // 1–5 items
  hero_photo_index: number;         // 0-based index into photos array; set by moderator on approval
  
  // SEO / Gallery (set on approval)
  build_slug: string | null;        // Auto-generated on approval: {gamer-tag}-{build-name-kebab}
  published_at: string | null;      // ISO 8601 UTC
  is_featured: boolean;             // Featured Build of the Month flag
  featured_month: string | null;    // e.g. "2027-03"
  
  // Moderation Metadata
  assigned_moderator: string | null; // Strapi user email
  moderator_note: string | null;    // Internal note (not sent to submitter)
  rejection_reason: RejectionReason | null;
  rejection_detail: string | null;  // Free text sent to submitter (max 500 chars)
  sla_breach: boolean;              // Set to true if >5 business days pending
  
  // Resubmission
  original_submission_id: number | null; // Links resubmission to rejected original
  resubmission_count: number;       // 0 for first-time submissions
  
  // Timestamps
  submitted_at: string;             // ISO 8601 UTC
  under_review_at: string | null;
  decided_at: string | null;
  updated_at: string;
}
```

### 6.2 `BuildPhoto` Embedded Type

```typescript
interface BuildPhoto {
  position: number;           // 1–5 (display order)
  storage_key: string;        // Backblaze B2 object key
  cdn_url: string;            // Cloudflare CDN URL (permanent after approval)
  thumbnail_url: string;      // 400×300 resized version
  original_filename: string;  // Sanitised original filename for reference
  file_size_bytes: number;
  width: number;
  height: number;
  mime_type: 'image/jpeg' | 'image/png';
  alt_text: string | null;    // Auto-generated on approval: "{build_name} by {gamer_tag} — {build_category}"
}
```

### 6.3 `BuildCategory` Enum

```typescript
type BuildCategory =
  | 'rgb-showcase'
  | 'minimalist'
  | 'competitive'
  | 'streaming'
  | 'budget-beast'
  | 'sff'
  | 'custom-loop';
```

### 6.4 `RejectionReason` Enum

```typescript
type RejectionReason =
  | 'NO_TWINMOS_PRODUCT'         // No TwinMOS/VOLTX product found in specs
  | 'LOW_QUALITY_PHOTOS'         // Photos too small, blurry, or poorly lit
  | 'INSUFFICIENT_STORY'         // Build story under 100 words or content-free
  | 'OFFENSIVE_CONTENT'          // Inappropriate imagery or text
  | 'DUPLICATE_SUBMISSION'       // Identical build already in gallery
  | 'STOCK_PHOTOS'               // Photos appear to be stock or renders
  | 'INCOMPLETE_SPECS'           // Missing required component fields
  | 'COMPETITOR_BRANDING'        // Prominent competitor brand watermarks/logos
  | 'OTHER';                     // Explanation required in rejection_detail
```

### 6.5 MeiliSearch Index: `build_gallery`

```json
{
  "indexName": "build_gallery",
  "primaryKey": "submission_ref",
  "searchableAttributes": [
    "build_name", "gamer_tag", "country_region",
    "cpu", "motherboard", "gpu", "memory", "storage",
    "build_story", "build_category"
  ],
  "filterableAttributes": [
    "build_category", "country_region", "is_featured",
    "featured_month", "published_at"
  ],
  "sortableAttributes": [
    "published_at", "is_featured"
  ],
  "displayedAttributes": [
    "submission_ref", "build_slug", "build_name", "gamer_tag",
    "country_region", "build_category", "cpu", "motherboard",
    "gpu", "memory", "storage", "case_name", "cpu_cooler",
    "power_supply", "build_story", "hero_photo_url",
    "thumbnail_url", "is_featured", "featured_month",
    "published_at", "social_handles"
  ]
}
```

---

## 7. Form Implementation

### 7.1 Route and Template

- **URL:** `/gaming/build-submit/`
- **Astro Template:** `src/pages/gaming/build-submit.astro`
- **Form Component:** `src/components/gaming/BuildSubmitForm.tsx` (`client:load`)
- **Hydration:** `client:load` — form must be interactive immediately; no lazy hydration

### 7.2 Form Structure (5-Step Progressive Disclosure)

```
Step 1: Personal Information
  - Gamer Tag / Display Name (required, 3–50 chars, alphanumeric + underscore + hyphen)
  - Full Name (optional, internal only)
  - Email Address (required, RFC 5322 validation)
  - Country / Region (required, dropdown from ISO 3166-1 country list + region field)
  - Social Handles (optional, 4 fields: Instagram, Twitter/X, YouTube, Twitch)

Step 2: Build Specifications
  - Build Name (required, 3–100 chars)
  - Build Category (required, dropdown from BuildCategory enum)
  - CPU (required, max 150 chars)
  - Motherboard (required, max 150 chars)
  - GPU (required, max 150 chars)
  - Memory (required, max 150 chars — includes soft validation for TwinMOS/VOLTX keyword)
  - Storage (required, max 150 chars)
  - Case (required, max 150 chars)
  - CPU Cooler (required, max 150 chars)
  - Power Supply (required, max 150 chars)
  - Additional Components (optional, max 500 chars)

Step 3: Build Story
  - Textarea (required, min 100 words / ~600 chars, max 500 words / ~3000 chars)
  - Live word count display
  - Prompt suggestions displayed as helper text

Step 4: Photo Upload
  - Drag-and-drop zone + file input fallback
  - 1–5 images required
  - Per-file: JPG/PNG only, max 5MB, min 1920×1080px (client-side dimension check)
  - Preview thumbnails with remove button
  - Position reordering via drag-and-drop (position[0] = hero photo suggestion)

Step 5: Terms and Submission
  - Content Consent checkbox (required)
  - Terms and Conditions checkbox (required)
  - TwinMOS Product Confirmation checkbox (required)
  - Summary of submission before final submit button
  - Cloudflare Turnstile CAPTCHA widget
```

### 7.3 Client-Side Validation (React Hook Form + Zod)

```typescript
import { z } from 'zod';

const BuildSubmissionSchema = z.object({
  gamer_tag: z.string()
    .min(3, 'Minimum 3 characters')
    .max(50, 'Maximum 50 characters')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Only letters, numbers, underscore and hyphen'),
  
  email: z.string().email('Please enter a valid email address'),
  
  country_region: z.string().min(2, 'Country is required'),
  
  build_name: z.string().min(3).max(100),
  
  build_category: z.enum([
    'rgb-showcase', 'minimalist', 'competitive',
    'streaming', 'budget-beast', 'sff', 'custom-loop'
  ]),
  
  // Build specs — all required, max 150 chars
  cpu: z.string().min(2).max(150),
  motherboard: z.string().min(2).max(150),
  gpu: z.string().min(2).max(150),
  memory: z.string().min(2).max(150),
  storage: z.string().min(2).max(150),
  case_name: z.string().min(2).max(150),
  cpu_cooler: z.string().min(2).max(150),
  power_supply: z.string().min(2).max(150),
  additional_components: z.string().max(500).optional(),
  
  build_story: z.string()
    .refine(s => s.trim().split(/\s+/).length >= 100, 'Minimum 100 words required')
    .refine(s => s.trim().split(/\s+/).length <= 500, 'Maximum 500 words allowed'),
  
  content_consent: z.literal(true, { errorMap: () => ({ message: 'Content consent is required' }) }),
  terms_accepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms' }) }),
  twinmos_product_confirmed: z.literal(true, { errorMap: () => ({ message: 'A TwinMOS product is required' }) }),
  
  turnstile_token: z.string().min(1, 'CAPTCHA verification required'),
});
```

### 7.4 Step Progress Indicator

- Horizontal step bar above form, always visible
- Current step highlighted; completed steps show checkmark
- Navigation: "Next" / "Back" buttons; step bar items are NOT clickable (no skipping)
- Step validation: user cannot proceed to next step until current step passes validation
- "Back" always allowed without re-validation

### 7.5 Form State Persistence

- Form state persisted in `sessionStorage` as user progresses between steps
- On page reload: partial state restored with a "Continue your submission" banner
- On successful submission: sessionStorage key cleared
- On navigation away mid-form: browser `beforeunload` warning shown

---

## 8. File Upload and Storage

### 8.1 Upload Endpoint

```
POST /api/v1/builds/upload-photo
Content-Type: multipart/form-data
```

- Called once per file, immediately on file selection (not on form submit)
- Returns a temporary `upload_token` valid for 2 hours
- On form submission, upload tokens are included in payload; server resolves to storage keys

### 8.2 Client-Side Pre-Processing

Before upload, the browser performs:
1. File type check: `['image/jpeg', 'image/png'].includes(file.type)`
2. File size check: `file.size <= 5 * 1024 * 1024` (5MB)
3. Dimension check: load into `Image` object, check `naturalWidth >= 1920 && naturalHeight >= 1080`
4. If any check fails: show inline error, do not upload

### 8.3 Server-Side Processing

On receiving the multipart upload:

1. Re-validate MIME type and size (do not trust client claims)
2. Strip EXIF metadata using `sharp` (privacy — remove GPS data, device info)
3. Generate thumbnail at 400×300 (cover crop, quality 80) using `sharp`
4. Upload original (EXIF-stripped) and thumbnail to Backblaze B2:
   - Bucket: `twinmos-build-submissions` (private, separate from partner PDF bucket)
   - Key pattern: `submissions/{year}/{month}/{uuid}-original.{ext}`
   - Key pattern: `submissions/{year}/{month}/{uuid}-thumb.jpg`
5. Return `upload_token` (JWT containing B2 key, expires 2h)

### 8.4 Post-Approval Permanent Storage

On moderation approval:
1. Move objects from `submissions/` prefix to `gallery/` prefix in B2
2. Update CDN URL references in Strapi to use permanent Cloudflare CDN path
3. Set B2 object metadata `x-bz-info-approved: true`
4. If submission rejected: objects remain in B2 for 30 days, then deleted by lifecycle rule

### 8.5 Storage Quotas

| Tier | Max files | Max total size |
|------|-----------|----------------|
| Per submission | 5 | 25MB |
| Per month (all submissions) | No hard cap | Monitored; alert at 5GB/month |

---

## 9. Moderation Queue — Backend

### 9.1 Strapi Lifecycle Hook: `BuildSubmission.afterCreate`

```typescript
// src/api/build-submission/content-types/build-submission/lifecycles.ts
import { generateSubmissionRef } from '../../../utils/submission-ref';
import { sendEmail } from '../../../utils/email';
import { notifyModerationTeam } from '../../../utils/moderation-queue';

export default {
  async afterCreate({ result }) {
    // Generate submission reference if not already set
    if (!result.submission_ref) {
      const ref = await generateSubmissionRef('BSM');
      await strapi.entityService.update('api::build-submission.build-submission', result.id, {
        data: { submission_ref: ref },
      });
    }
    
    // Send confirmation email to submitter
    await sendEmail({
      template: 'BSM-01',
      to: result.email,
      data: {
        gamer_tag: result.gamer_tag,
        submission_ref: result.submission_ref,
        build_name: result.build_name,
      },
    });
    
    // Notify moderation team
    await notifyModerationTeam(result);
  },

  async afterUpdate({ result, params }) {
    const previousState = params.data._previousState;
    const newState = result.state;
    
    if (previousState === newState) return;
    
    switch (newState) {
      case 'APPROVED':
        await onApproved(result);
        break;
      case 'REJECTED':
        await onRejected(result);
        break;
    }
  },
};
```

### 9.2 Reference Number Generation

```typescript
// Format: BSM-{YEAR}-{6-digit-seq}, resets yearly
// e.g. BSM-2027-000001

export async function generateSubmissionRef(prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const lastRef = await strapi.db.query('api::build-submission.build-submission')
    .findOne({
      where: { submission_ref: { $startsWith: `${prefix}-${year}` } },
      orderBy: { submitted_at: 'desc' },
    });
  
  const lastSeq = lastRef
    ? parseInt(lastRef.submission_ref.split('-')[2], 10)
    : 0;
  
  const nextSeq = String(lastSeq + 1).padStart(6, '0');
  return `${prefix}-${year}-${nextSeq}`;
}
```

### 9.3 Slug Generation on Approval

```typescript
import slugify from 'slugify';

function generateBuildSlug(gamer_tag: string, build_name: string): string {
  const base = `${gamer_tag}-${build_name}`;
  return slugify(base, { lower: true, strict: true, replacement: '-' }).substring(0, 100);
}

// Collision handling: append -2, -3 etc if slug already exists
async function getUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 2;
  while (await slugExists(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}
```

### 9.4 MeiliSearch Indexing on Approval

```typescript
async function onApproved(submission: BuildSubmission): Promise<void> {
  const slug = await getUniqueSlug(
    generateBuildSlug(submission.gamer_tag, submission.build_name)
  );
  
  // Finalise storage (move B2 objects to gallery prefix)
  await movePhotosToGallery(submission.photos);
  
  // Update record
  await strapi.entityService.update('api::build-submission.build-submission', submission.id, {
    data: {
      build_slug: slug,
      published_at: new Date().toISOString(),
      decided_at: new Date().toISOString(),
    },
  });
  
  // Add to MeiliSearch
  const meili = getMeiliSearchClient();
  await meili.index('build_gallery').addDocuments([formatForMeiliSearch(submission, slug)]);
  
  // Trigger Astro ISR revalidation for gallery page
  await fetch(`${process.env.ASTRO_REVALIDATE_URL}/api/revalidate`, {
    method: 'POST',
    headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET! },
    body: JSON.stringify({ paths: ['/gaming/build-gallery/', `/gaming/build-gallery/${slug}/`] }),
  });
  
  // Send approval email
  await sendEmail({ template: 'BSM-04', to: submission.email, data: { ...submission, slug } });
}
```

### 9.5 SLA Monitoring Cron Job

```typescript
// Runs daily at 09:00 UTC
// Flags submissions exceeding SLA thresholds

export async function checkBuildSubmissionSLAs() {
  const businessDays5Ago = subtractBusinessDays(new Date(), 5);
  
  const breachedSubmissions = await strapi.db.query('api::build-submission.build-submission')
    .findMany({
      where: {
        state: { $in: ['PENDING', 'UNDER_REVIEW'] },
        submitted_at: { $lt: businessDays5Ago.toISOString() },
        sla_breach: false,
      },
    });
  
  for (const submission of breachedSubmissions) {
    await strapi.entityService.update('api::build-submission.build-submission', submission.id, {
      data: { sla_breach: true },
    });
    
    // Escalate to content manager
    await sendEmail({
      template: 'BSM-SLA-BREACH',
      to: process.env.CONTENT_MANAGER_EMAIL!,
      data: {
        submission_ref: submission.submission_ref,
        build_name: submission.build_name,
        submitted_at: submission.submitted_at,
        days_pending: calculateBusinessDaysDiff(submission.submitted_at, new Date()),
      },
    });
  }
}
```

---

## 10. Moderation Interface — Admin UI

### 10.1 Moderation Queue View

The Strapi admin panel `build-submission` list view must be configured with the following custom columns and filters:

**List Columns (order):**

| Column | Type | Notes |
|--------|------|-------|
| Submission Ref | Text | Clickable link to record |
| Build Name | Text | |
| Gamer Tag | Text | |
| Country | Text | |
| Category | Badge | Color-coded by category |
| State | Badge | Color: PENDING=orange, UNDER_REVIEW=blue, APPROVED=green, REJECTED=red |
| SLA Breach | Icon | Red warning icon if `sla_breach = true` |
| Submitted At | DateTime | Sorted descending by default |
| Assigned Moderator | Text | Empty = unassigned |
| Photos | Count | "3 photos" |

**Default Filters:**
- State: PENDING | UNDER_REVIEW (exclude APPROVED/REJECTED/ARCHIVED from default view)
- Sort: Submitted At ASC (oldest first — FIFO moderation)

**Quick Actions (per row):**
- "Assign to me" — sets `assigned_moderator` to current user, state → UNDER_REVIEW
- "Approve" — opens approval confirmation modal
- "Reject" — opens rejection modal with reason dropdown + detail field

### 10.2 Submission Detail View

The detail view for a single `BuildSubmission` must display:

**Section 1 — Submitter Info (internal)**
- Full name, email, country (hidden from public but visible here)
- Consent checkboxes (read-only, confirmation these were checked)
- Social handles

**Section 2 — Build Specs**
- All component fields displayed in a formatted table
- Memory field highlighted if it contains "TwinMOS" or "VOLTX" (green) or does not (orange warning)

**Section 3 — Build Story**
- Full text with word count shown

**Section 4 — Photos**
- Grid of up to 5 photo thumbnails
- Click to view full resolution
- Moderator can set "Hero Photo" designation (default: position 1)
- Photo metadata: filename, dimensions, file size

**Section 5 — Moderation Actions**
- State selector (with transition validation)
- Assigned Moderator field (auto-populated on "Assign to me")
- Moderator Note field (internal, not sent to submitter)
- Rejection Reason dropdown + Rejection Detail text (required when rejecting)
- Featured Build toggle + Featured Month selector (available only on APPROVED records)

**Section 6 — Audit Trail**
- Timestamps for each state transition
- Who made each state change

### 10.3 Featured Build of the Month Selection

- Moderator sets `is_featured = true` and `featured_month = "YYYY-MM"` on any APPROVED record
- Only one record per featured_month should have `is_featured = true` — Strapi validation enforces this
- Gallery hero section queries `is_featured = true` for current month, falls back to most recent featured

---

## 11. Email Notification Templates

All emails sent via Resend. From address: `gallery@twinmos.com`. All timestamps in UTC.

### BSM-01 — Submission Received (to Submitter)

**Subject:** `Your build "${build_name}" has been submitted — Ref: ${submission_ref}`

```
Hi ${gamer_tag},

Thanks for submitting your build to the TwinMOS Build Gallery!

We've received your submission and it's now in our moderation queue.

Build Name:      ${build_name}
Submission Ref:  ${submission_ref}
Submitted:       ${submitted_at_formatted}

What happens next:
- Our team will review your submission within 5 business days
- We'll email you when a decision has been made
- If approved, your build will be published to /gaming/build-gallery/

Keep an eye on this email address for updates.

The TwinMOS Team
gaming@twinmos.com
```

### BSM-02 — New Submission Alert (to Moderation Team)

**Subject:** `[BUILD MOD] New submission: ${build_name} — ${submission_ref}`

**To:** Moderation team distribution list (`build-moderation@twinmos.com`)

```
A new build submission requires moderation.

Submission Ref:  ${submission_ref}
Build Name:      ${build_name}
Gamer Tag:       ${gamer_tag}
Category:        ${build_category}
Country:         ${country_region}
Memory:          ${memory}
Submitted:       ${submitted_at_formatted}

Review in Strapi Admin:
${strapi_admin_url}/content-manager/collectionType/api::build-submission.build-submission/${submission_id}

Current queue: ${pending_count} submission(s) awaiting review.
```

### BSM-03 — Submission Not Approved (to Submitter)

**Subject:** `Update on your build "${build_name}" — ${submission_ref}`

```
Hi ${gamer_tag},

Thank you for submitting your build "${build_name}" to the TwinMOS Build Gallery.

After careful review, we're unable to feature your build at this time.

Reason: ${rejection_reason_label}

${rejection_detail ? `Feedback from our team:\n"${rejection_detail}"` : ''}

We encourage you to address the feedback above and resubmit. Resubmissions are
welcome — simply submit a new entry and mention your original reference number
(${submission_ref}) in the Additional Components field so our team can track it.

If you have questions, please contact us at gaming@twinmos.com.

The TwinMOS Team
```

### BSM-04 — Build Approved and Published (to Submitter)

**Subject:** `Your build "${build_name}" is now live in the TwinMOS Gallery!`

```
Hi ${gamer_tag},

Great news! Your build "${build_name}" has been approved and is now 
live in the TwinMOS Build Gallery.

View your build:
https://twinmos.com/gaming/build-gallery/${build_slug}/

Share your build:
- Twitter/X: #MyVOLTXBuild @TwinMOS
- Instagram: Tag @TwinMOS
- Reddit: r/buildapc, r/pcmasterrace

${is_featured ? `🏆 FEATURED BUILD: Your build has also been selected as a\nFeatured Build of the Month for ${featured_month_label}!` : ''}

Thank you for sharing your build with the TwinMOS community.

The TwinMOS Team
gaming@twinmos.com
```

### BSM-SLA-BREACH — SLA Breach Escalation (to Content Manager)

**Subject:** `[URGENT] Build submission SLA breached — ${submission_ref}`

```
The following build submission has exceeded the 5 business day moderation SLA.

Submission Ref:  ${submission_ref}
Build Name:      ${build_name}
Gamer Tag:       ${gamer_tag}
Submitted:       ${submitted_at_formatted}
Days Pending:    ${days_pending} business days

Current State:   ${state}
Assigned To:     ${assigned_moderator || 'UNASSIGNED'}

Please review immediately:
${strapi_admin_url}/content-manager/collectionType/api::build-submission.build-submission/${submission_id}
```

### BSM-DAILY-DIGEST — Daily Moderator Digest (to Moderation Team)

**Subject:** `[BUILD MOD] Daily Queue Summary — ${date}`

**Sent:** Daily at 09:00 UTC if queue count > 0

```
Build Gallery Moderation Queue Summary — ${date}

PENDING (unassigned):   ${pending_count}
UNDER REVIEW:           ${under_review_count}
SLA BREACHES:           ${sla_breach_count}

This week:
  Approved:             ${approved_this_week}
  Rejected:             ${rejected_this_week}
  New submissions:      ${new_this_week}

Access the moderation queue:
${strapi_admin_url}/content-manager/collectionType/api::build-submission.build-submission
```

---

## 12. Publication to Gallery

### 12.1 Astro Page Architecture

```
src/pages/gaming/
  build-gallery/
    index.astro                    ← Gallery index (SSR or ISR)
    [slug].astro                   ← Individual build detail page (SSG on approval)
```

### 12.2 Gallery Index (`/gaming/build-gallery/`)

**Rendering mode:** SSR with Cloudflare Cache (CDN TTL 300 seconds, purged on new approval)

**Data fetching:** Query MeiliSearch `build_gallery` index.

```typescript
// Default query: all approved builds, sorted by published_at DESC, 12 per page
const { hits, estimatedTotalHits, facetDistribution } = await meili
  .index('build_gallery')
  .search(userQuery || '', {
    filter: buildFilterString(category, country),
    sort: sortOrder === 'featured' ? ['is_featured:desc', 'published_at:desc'] : ['published_at:desc'],
    limit: 12,
    offset: page * 12,
    facets: ['build_category', 'country_region'],
  });
```

### 12.3 Build Detail Page (`/gaming/build-gallery/{slug}/`)

**Rendering mode:** SSG — page generated at build time for all APPROVED submissions, regenerated via ISR webhook on new approvals.

**Structured data:** `schema.org/Article` + `schema.org/ImageObject` per photo.

**Open Graph meta:** `og:image` = hero photo CDN URL, `og:title` = build name, `og:description` = first 160 chars of build story.

### 12.4 Featured Build Section

Gallery index page hero section shows the current month's featured build if available:

```astro
---
const featuredBuild = await meili.index('build_gallery').search('', {
  filter: `is_featured = true AND featured_month = "${currentYearMonth}"`,
  limit: 1,
});
---

{featuredBuild.hits.length > 0 && (
  <FeaturedBuildHero build={featuredBuild.hits[0]} />
)}
```

---

## 13. Gallery Frontend

### 13.1 Component Structure

```
src/components/gaming/
  gallery/
    BuildGalleryGrid.tsx          ← Main grid; client:load for filtering
    BuildCard.tsx                 ← Individual build card
    BuildDetailModal.tsx          ← Expandable detail overlay (optional; P2 scope is link-to-page)
    GalleryFilterBar.tsx          ← Category pills + country + sort
    FeaturedBuildHero.tsx         ← Hero section for featured build
  submission/
    BuildSubmitForm.tsx           ← Multi-step submission form; client:load
    PhotoUploadZone.tsx           ← Drag-and-drop photo upload
    StepProgressBar.tsx           ← Step indicator component
```

### 13.2 Build Card Design

```
┌─────────────────────────────────┐
│                                 │
│   [Hero Photo — 16:9 aspect]    │
│                                 │
├─────────────────────────────────┤
│ 🏆 FEATURED  [category badge]   │
│                                 │
│ "Build Name"                    │
│ Gamer Tag — Country             │
│                                 │
│ CPU | GPU | Memory              │
│                                 │
│ [Share] [View Build →]          │
└─────────────────────────────────┘
```

- Card links to `/gaming/build-gallery/{slug}/`
- Category badge colors: rgb-showcase=purple, competitive=red, minimalist=grey, streaming=teal, budget-beast=yellow, sff=blue, custom-loop=cyan
- Hover state: subtle border highlight, "View Build" button becomes filled

### 13.3 Filter Bar

| Control | Type | Notes |
|---------|------|-------|
| Category | Multi-select pills | Shows count per category from facetDistribution |
| Country | Single-select dropdown | Top 10 countries + "All Countries" |
| Sort | Dropdown | Newest First / Featured First |
| Search | Text input | Free text search via MeiliSearch |
| Reset Filters | Link | Clears all filters |

URL state persisted: `/gaming/build-gallery/?category=rgb-showcase&country=India&sort=featured`

### 13.4 Pagination

- 12 builds per page
- "Load More" button (appends to grid, updates URL page param)
- Shows "Showing X of Y builds" count
- On filter change: reset to page 1

---

## 14. API Endpoints

### 14.1 Submit Build

```
POST /api/v1/builds/submit
Content-Type: application/json
```

**Request body:**
```typescript
{
  gamer_tag: string;
  full_name?: string;
  email: string;
  country_region: string;
  instagram_handle?: string;
  twitter_handle?: string;
  youtube_handle?: string;
  twitch_handle?: string;
  build_name: string;
  build_category: BuildCategory;
  cpu: string;
  motherboard: string;
  gpu: string;
  memory: string;
  storage: string;
  case_name: string;
  cpu_cooler: string;
  power_supply: string;
  additional_components?: string;
  build_story: string;
  photo_upload_tokens: string[];   // 1–5 tokens from /upload-photo
  content_consent: true;
  terms_accepted: true;
  twinmos_product_confirmed: true;
  turnstile_token: string;
}
```

**Success Response (201):**
```json
{
  "submission_ref": "BSM-2027-000042",
  "build_name": "Crimson Velocity",
  "state": "PENDING",
  "message": "Submission received. Check your email for confirmation."
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Field validation failed; errors array in response |
| 400 | `INVALID_UPLOAD_TOKEN` | One or more upload tokens expired or invalid |
| 422 | `TURNSTILE_FAILED` | Cloudflare Turnstile verification failed |
| 429 | `RATE_LIMITED` | Too many submissions from this IP; see §16 |
| 500 | `SUBMISSION_FAILED` | Internal error; retry safe |

### 14.2 Upload Photo (Pre-Upload)

```
POST /api/v1/builds/upload-photo
Content-Type: multipart/form-data
```

**Form fields:**
- `photo`: File (JPG/PNG, max 5MB)
- `position`: number (1–5)

**Success Response (200):**
```json
{
  "upload_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "thumbnail_url": "https://cdn.twinmos.com/build-submissions/temp/abc123-thumb.jpg",
  "dimensions": { "width": 2560, "height": 1440 },
  "file_size_bytes": 3145728,
  "expires_at": "2027-03-15T12:00:00Z"
}
```

### 14.3 Gallery Listing (Public)

```
GET /api/v1/builds/gallery
```

Query params: `category`, `country`, `sort` (newest|featured), `q` (search), `page`, `limit` (max 24)

**Response:** MeiliSearch results formatted for gallery consumption (no PII fields).

### 14.4 Build Detail (Public)

```
GET /api/v1/builds/gallery/{slug}
```

Returns single published build's full details (no PII).

---

## 15. Content Validation Rules

### 15.1 Server-Side Validation (in addition to Zod schema)

| Rule | Check | Action on Fail |
|------|-------|----------------|
| Turnstile verification | POST to Cloudflare `/siteverify` | 422 TURNSTILE_FAILED |
| Upload tokens valid | Each token: JWT signature + expiry + not-revoked | 400 INVALID_UPLOAD_TOKEN |
| Email blacklist | Check against known spam/disposable domains list | 422 INVALID_EMAIL_DOMAIN |
| Duplicate submission | Same email + same build_name within 7 days | 409 DUPLICATE_SUBMISSION |
| Photo minimum count | ≥1 valid upload token | 400 validation error |

### 15.2 Moderation Guidelines (Human Review)

Moderators apply these criteria during review:

| Criterion | Pass | Fail |
|-----------|------|------|
| TwinMOS Product | Memory or storage field contains "TwinMOS" or "VOLTX" brand | Neither brand mentioned |
| Photo Quality | Clear focus, good lighting, 1920×1080+, authentic PC photos | Blurry, stock images, renders |
| Build Story | Authentic, personal, ≥100 words with substance | Generic, <100 words, copied from web |
| Content Appropriateness | No offensive content, no excessive competitor branding | Violates community standards |
| Component Completeness | All required fields populated with real component names | "TBD", "N/A", or placeholder text |

### 15.3 Soft Warning on Memory Field

During form input (client-side), if the Memory field does not contain case-insensitive "twinmos" or "voltx":

```
⚠️ Your build must include TwinMOS or VOLTX memory or storage to qualify.
    If your VOLTX product is in the Storage field, that's fine — just make sure it's mentioned.
```

This is advisory only; the form can be submitted. The server does not block on this — moderators make the final call (e.g., a VOLTX SSD qualifies even if memory is from another brand).

---

## 16. Anti-Spam and Rate Limiting

### 16.1 Rate Limits

| Endpoint | Limit | Window | Response on exceed |
|----------|-------|--------|-------------------|
| `POST /submit` | 3 submissions | Per IP per 24h | 429 RATE_LIMITED |
| `POST /upload-photo` | 20 uploads | Per IP per hour | 429 RATE_LIMITED |
| `GET /gallery` | 120 requests | Per IP per minute | 429 (CDN-handled) |

### 16.2 Duplicate Detection

- If same `email` + same `build_name` submitted within 7 days: return 409 with `submission_ref` of existing record
- Prevents accidental double-submissions
- Does not prevent resubmissions after rejection (different build_name is sufficient)

### 16.3 Cloudflare Turnstile

- Widget embedded in Step 5 (final step before submission)
- `window.turnstile.render()` called when Step 5 becomes visible
- Token valid for 5 minutes; if user spends >5 min on Step 5, widget auto-refreshes
- Server verifies with Cloudflare `/siteverify` on every submission

---

## 17. Strapi Configuration

### 17.1 Collection Type Settings

```json
{
  "collectionName": "build_submissions",
  "info": {
    "singularName": "build-submission",
    "pluralName": "build-submissions",
    "displayName": "Build Submission"
  },
  "options": {
    "draftAndPublish": false,
    "comment": "Build gallery submissions from community. Published state controlled by moderation workflow, not Strapi draft/publish."
  },
  "pluginOptions": {},
  "attributes": { ... }
}
```

Note: Strapi's native "draft/publish" is disabled. Publication is controlled by the `state` field + `published_at` timestamp. This avoids confusion between Strapi draft state and moderation state.

### 17.2 Required Strapi Plugins

| Plugin | Purpose |
|--------|---------|
| `@strapi/provider-email-resend` | Email delivery via Resend |
| `strapi-plugin-meilisearch` | MeiliSearch sync for approved builds |

### 17.3 Content-Type Permissions

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Public API | Yes (via endpoint) | No direct access | No | No |
| Moderator | No | Yes (all states) | State transitions only | No |
| Content Manager | No | Yes | Yes (all fields) | No (archive only) |
| Super Admin | Yes | Yes | Yes | Yes |

Note: "Delete" is restricted to prevent accidental loss of submission records. ARCHIVED state is the soft-delete equivalent.

---

## 18. Performance Requirements

| Metric | Target | Notes |
|--------|--------|-------|
| Form page load (LCP) | <2.5s on 4G | Measured by Plausible/Sentry |
| Photo upload (5MB file) | <8s on 10Mbps connection | Including B2 upload + thumbnail generation |
| Gallery page load (12 builds) | <2s | MeiliSearch query + CDN |
| Build detail page (SSG) | <1s | Served from Cloudflare edge cache |
| Form submission API response | <1.5s | Excluding photo upload (pre-uploaded) |
| MeiliSearch gallery query | <50ms | For 12 results with filters |

---

## 19. Accessibility Requirements

Requirements sourced from URD §8.4 and WCAG 2.1 AA compliance target.

| Requirement | Implementation |
|-------------|----------------|
| All form fields have `<label>` | Required; `htmlFor` must match input `id` |
| Error messages announced | `aria-live="polite"` region for field errors; `aria-describedby` links field to error |
| Photo upload keyboard accessible | File input focusable; Space/Enter activates; drag zone has keyboard fallback |
| Required fields indicated | `aria-required="true"` + visible text indicator (not asterisk alone — use "(required)") |
| Step progress announced | `aria-current="step"` on current step; role="navigation" on step bar |
| Color not sole indicator | All validation states use icon + color + text |
| Mobile: touch targets | Minimum 44×44px on all interactive elements |
| Form keyboard navigation | Full Tab / Shift+Tab / Enter / Space support |
| Photo gallery (detail page) | Arrow keys for photo navigation; `aria-label="Photo 2 of 5"` |
| Filter controls | `fieldset` + `legend` for filter groups; `aria-pressed` for pill toggles |

---

## 20. Analytics and Tracking

All events sent to Plausible (privacy-first, no cookies).

| Event | Properties | Trigger |
|-------|-----------|---------|
| `form_start_build_submit` | `{ step: 1 }` | First field interaction |
| `form_step_complete_build_submit` | `{ step: 1–5 }` | "Next" click + validation pass |
| `form_abandon_build_submit` | `{ step: 1–4, field: string }` | `beforeunload` event |
| `upload_photo_build_submit` | `{ position: 1–5, size_kb: number }` | Successful photo upload |
| `upload_photo_error_build_submit` | `{ position: 1–5, error: string }` | Photo validation failure |
| `form_submit_build_submit` | `{ category: BuildCategory }` | Successful API 201 response |
| `form_submit_error_build_submit` | `{ error_code: string }` | API error response |
| `gallery_filter_build_gallery` | `{ filter: string, value: string }` | Filter applied |
| `gallery_sort_build_gallery` | `{ sort: string }` | Sort changed |
| `gallery_card_click_build_gallery` | `{ slug: string, category: string }` | Build card clicked |
| `gallery_share_build_gallery` | `{ platform: string, slug: string }` | Social share button clicked |
| `gallery_search_build_gallery` | `{ query_length: number }` | Search query submitted |

---

## 21. Acceptance Criteria

### 21.1 Submission Form

| ID | Criterion |
|----|-----------|
| AC-BS-01 | Form renders at `/gaming/build-submit/` with all 5 steps functional |
| AC-BS-02 | User cannot advance to next step until current step passes validation |
| AC-BS-03 | Photo upload validates MIME type, size (≤5MB), and dimensions (≥1920×1080) client-side before uploading |
| AC-BS-04 | Successful submission returns `submission_ref` and shows confirmation state on page |
| AC-BS-05 | Submitter receives BSM-01 email within 60 seconds of submission |
| AC-BS-06 | Moderation team receives BSM-02 email within 60 seconds of submission |
| AC-BS-07 | Cloudflare Turnstile must pass before form can be submitted; failed verification returns 422 |
| AC-BS-08 | Form state persists in sessionStorage across tab refreshes |
| AC-BS-09 | Submitting same email + build_name within 7 days returns 409 |
| AC-BS-10 | Rate limit of 3 submissions per IP per 24h enforced; 4th attempt returns 429 |
| AC-BS-11 | Form is fully keyboard-navigable; all WCAG 2.1 AA criteria met |
| AC-BS-12 | EXIF data is stripped from all uploaded photos before storage |

### 21.2 Moderation

| ID | Criterion |
|----|-----------|
| AC-MOD-01 | All new submissions appear in Strapi admin moderation queue within 30 seconds |
| AC-MOD-02 | Moderator can transition state: PENDING → UNDER_REVIEW → APPROVED / REJECTED |
| AC-MOD-03 | Rejection requires a `rejection_reason` selection; `OTHER` requires `rejection_detail` text |
| AC-MOD-04 | APPROVED state triggers: slug generation, B2 photo move, MeiliSearch index add, ISR revalidation, BSM-04 email |
| AC-MOD-05 | REJECTED state triggers: BSM-03 email with `rejection_reason_label` and `rejection_detail` |
| AC-MOD-06 | Featured Build toggle only available on APPROVED records; only one per `featured_month` enforced |
| AC-MOD-07 | SLA monitoring cron runs daily at 09:00 UTC; submissions >5 business days flagged and escalation email sent |
| AC-MOD-08 | SLA breach indicator visible in moderation queue list view |

### 21.3 Gallery

| ID | Criterion |
|----|-----------|
| AC-GAL-01 | Approved build appears in gallery at `/gaming/build-gallery/` within 5 minutes of approval |
| AC-GAL-02 | Build detail page accessible at `/gaming/build-gallery/{slug}/` with full spec table, build story, and photo gallery |
| AC-GAL-03 | Gallery filter by category returns only builds with matching `build_category` |
| AC-GAL-04 | Gallery filter by country returns only builds with matching `country_region` |
| AC-GAL-05 | Free text search returns relevant builds via MeiliSearch (typo tolerance enabled) |
| AC-GAL-06 | Featured Build of the Month appears in hero position on gallery index |
| AC-GAL-07 | Build detail page has correct Open Graph tags: `og:title`, `og:description`, `og:image` |
| AC-GAL-08 | Build detail page has `schema.org/Article` structured data |
| AC-GAL-09 | APPROVED builds contain no PII fields (email, full_name excluded from API response) |
| AC-GAL-10 | Social share buttons produce correct share URLs for Twitter/X, Facebook, WhatsApp |

---

## 22. Open Questions

| ID | Question | Owner | Target Resolution |
|----|----------|-------|-------------------|
| OQ-BS-01 | Should ambassador and partner submissions receive priority queue position or expedited SLA? | TwinMOS Marketing | Sprint 7 planning |
| OQ-BS-02 | Does TwinMOS require a manual approval step for Featured Build selection, or can the moderator set it without a second review? | TwinMOS Marketing Lead | Sprint 7 planning |
| OQ-BS-03 | Should rejected submissions with `OFFENSIVE_CONTENT` trigger a moderator alert to prevent repeat submitters? | TwinMOS Engineering + Legal | Sprint 7 planning |
| OQ-BS-04 | What is the maximum total number of approved builds expected in Year 1? MeiliSearch pagination behavior at 1000+ builds should be verified. | Unisoft Engineering | Sprint 7 |
| OQ-BS-05 | Are TwinMOS Flash Drives and portable storage (ELITE Drive Pro, ELF) considered qualifying products for gallery submission? | TwinMOS Marketing | Sprint 7 planning |
| OQ-BS-06 | Should build detail pages include a "Related Builds" section (same category or overlapping components)? | TwinMOS Marketing / UX | Phase 3 consideration |
| OQ-BS-07 | What is the desired behavior when no builds exist for a selected filter? Empty state with CTA to submit, or hide the filter option? | TwinMOS UX | Sprint 7 design review |

---

*Document Reference: TWN-P2-BUILD-MOD-2027-001 | Version 1.0 | Unisoft Engineering for TwinMOS Technologies*
