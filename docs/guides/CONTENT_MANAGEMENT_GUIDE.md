# TwinMOS Content Management Guide & Editorial Manual

> **Authority:** TwinMOS Corporate Editorial & Governance Architecture (T7.4.4 / F5).  
> **Target Audience:** Content Authors, Editors, Category Managers, Marketing Staff, and Site Administrators.  
> **Platform Version:** TwinMOS Platform v0.3.0 (Node.js 24 LTS, PostgreSQL 18, React 19 Admin SPA).

---

## 1. Overview & Content Governance

The TwinMOS Corporate Platform operates on a headless, decoupled architecture:
- **Admin Console (`apps/admin`)**: A React 19 SPA running in dark chrome with TanStack Router and Query.
- **Content Storage (`@twinmos/db`)**: Pinned PostgreSQL 18 with jsonb snapshot revisions and strict Zod validation schemas (`@twinmos/shared`).
- **Storefront Rendering (`apps/web`)**: Astro SSR with on-demand edge caching and instantaneous ISR outbox revalidation (`REVALIDATE_SECRET`).

Every piece of published content is treated as an immutable corporate record:
1. **Single Source of Truth**: Legal policies, corporate offices, customer testimonials, and contact forms are governed through the Truth & Entities subsystem (`apps/admin/src/modules/entities`).
2. **Deterministic Schemas**: All page content is authored using the 30-type shared block framework. Fallbacks and unstructured arbitrary HTML are strictly prohibited.
3. **Accessibility by Default**: Every image requires descriptive alternative text before publishing is permitted.

---

## 2. Roles & Editorial Capabilities (`NEW-07`)

The platform implements strict role-based access control (RBAC) enforced on both the client interface and server API endpoints:

| Role | Permissions & Responsibilities | Content Studio Rights |
|:---|:---|:---|
| **`super_admin`** | Complete platform authority: user creation, MFA resets, security configuration, DSAR erasure sweeps. | Global publish, unpublish, delete, revise. |
| **`admin`** | Operational management: content publishing, SKU locks, RMA adjudication, support dispatch, site settings. | Global publish, unpublish, delete, revise. |
| **`editor`** | Content ownership: creates, reviews, schedules, and publishes articles, pages, and news within assigned locales. | Author, review, approve, publish, and rollback (scoped to assigned locales). |
| **`author`** | Content drafting: writes draft articles, pages, and case studies. Cannot publish directly or review others' drafts. | Create and edit own drafts only. |
| **`viewer`** | Read-only oversight: stakeholder reviews, previewing staged content, inspecting analytics. | Read and preview only. |

---

## 3. Publishing Lifecycle & Revision Management

All content items follow an audited 5-state lifecycle:

```
[ draft ] ──> [ in_review ] ──> [ scheduled ] ──> [ published ] ──> [ archived ]
   ▲               │                                   │
   │               ▼                                   │
   └───────────────┴─────────── [ revisions ] <────────┘
```

### State Transitions
1. **`draft`**: Working draft created by an Author or Editor. Accessible only within the Admin Console and preview routes.
2. **`in_review`**: Draft submitted by an Author for editorial review. Editors receive notification to verify grammar, SEO metadata, and brand compliance.
3. **`scheduled`**: Approved content assigned a future `publishAt` timestamp. The API background cron worker automatically promotes the item to `published` upon reaching the scheduled timestamp.
4. **`published`**: Live on the public website. Triggers an asynchronous ISR revalidation outbox message to purge edge cache.
5. **`archived`**: Retired content preserved in the database for auditing and regulatory history. Returns 404/410 to public visitors.

### Revisions & Rollback
Every time an item is published, a complete JSONB snapshot of its blocks, metadata, and fields is saved to the `content_revisions` table. If an error is detected post-publish, an Editor or Admin can execute an **instantaneous one-click rollback** from the Revisions drawer, restoring the previous snapshot without downtime.

---

## 4. Comprehensive Block Reference Guide (All 30 Block Types)

The visual Page Builder features exactly 30 production-validated block types:

### A. Core Layout & Brand Blocks
1. **`hero`**: Main landing banner. Supports eyebrow text, title, lead body, primary/secondary CTA buttons, and responsive media or video background.
2. **`slider`**: Multi-slide carousel with accessible slide controls, autoplay with pause-on-hover/focus, and individual slide CTAs.
3. **`statsCounter`**: Grid of prominent numerical metrics with animated counting, prefixes, suffixes, and explanatory subtext.
4. **`featureGrid`**: 2, 3, or 4-column card grid highlighting key product capabilities, architectural advantages, or feature points.
5. **`bentoGrid`**: Modern asymmetrical modular grid highlighting flagship features with variable tile spans and visual media.
6. **`ctaBanner`**: Full-width high-contrast call-to-action banner driving conversions or contact inquiries.
7. **`splitCta`**: Two-column contrasting call-to-action dividing user pathways (e.g., Enterprise Sales vs. Consumer Support).
8. **`timeline`**: Chronological milestone display tracing corporate history, technological breakthroughs, or roadmap phases.
9. **`textMedia`**: Clean editorial layout pairing formatted typography with responsive photography or technical diagrams (left/right alignment).

### B. Structured & Technical Data Blocks
10. **`faqAccordion`**: Expandable FAQ accordion with keyboard navigation, search filtering, and schema.org structured data injection.
11. **`table`**: Accessible tabular data with sortable columns, responsive horizontal scrolling, and zebra striping.
12. **`productShowcase`**: Curated product cards rendering live SKU badges, key specifications, and direct datasheet links.
13. **`specComparison`**: Side-by-side technical specification matrix highlighting differences across 2 to 4 product variants.
14. **`whereToBuy`**: Interactive distributor and retailer locator filtered by geographic region, country, and channel tier.
15. **`downloadDatasheet`**: Download center listing firmware updates, user manuals, and technical specification PDFs.
16. **`qvlCompatibility`**: Qualified Vendor List search tool enabling users to verify memory/SSD compatibility against motherboard and laptop models.
17. **`testimonial`**: Customer testimonials and enterprise partner quotes carrying verified consent records and attribution metadata.

### C. UI & Navigation Components
18. **`badgeStrip`**: Horizontal strip displaying industry certifications (ISO 9001, RoHS, CE, FCC) and partnership badges.
19. **`steps`**: Numbered step-by-step process indicator (e.g., How to Submit an RMA, 3-Step Warranty Verification).
20. **`kpiMeters`**: Visual progress indicators and performance benchmark meters comparing read/write speeds.
21. **`callout`**: Prominent informational, warning, or tip banner highlighting critical notices or compatibility requirements.
22. **`linkChips`**: Interactive pill-shaped navigation chips for quick tagging and thematic category browsing.
23. **`anchorNav`**: In-page sticky table of contents providing smooth scrolling to anchored sections on long-form technical articles.
24. **`categoryTiles`**: Visual category navigation grid displaying product family thumbnails and SKU counts.

### D. Entity-Bound & Functional Blocks
25. **`policyTabs`**: Interactive tabbed legal document viewer bound directly to versioned policies in the Truth subsystem.
26. **`form`**: Embedded corporate contact, quote request, RMA submission, or newsletter subscription form with Turnstile bot protection.
27. **`officeCards`**: Verified global corporate headquarters and regional office directory with addresses, phone numbers, and local hours.
28. **`articleList`**: Dynamic feed of recent press releases, technology whitepapers, or corporate announcements.
29. **`glossaryIndex`**: Alphabetical glossary of storage and memory terminology (NVMe, PCIe 5.0, DRAM, ECC, TLC, QLC).
30. **`appEmbed`**: Sandboxed interactive calculator (e.g., Storage Capacity Calculator, Total Cost of Ownership Estimator).

---

## 5. Media & Asset Standards

1. **Resolution & Formats**: Upload high-resolution source images (PNG or WebP). The ingestion pipeline automatically derives WebP/AVIF variants at 1x, 2x, and thumbnail dimensions via Sharp.
2. **Mandatory Alt-Text**: Every image upload requires descriptive alternative text adhering to WCAG 2.2 AA. The Media Library prevents saving any asset without alt-text.
3. **Usage References**: The Media Library tracks every page, article, and SKU where an asset is utilized, preventing accidental deletion of live media.

---

## 6. Recorded Editor Training Walkthrough (Staging Rehearsal)

Follow this step-by-step training script during onboarding or staging rehearsal:

```bash
# Exercise: Create, Review, Publish, and Roll Back a Technical Product Page

1. SIGN IN:
   - Navigate to https://staging.twinmos.com/admin
   - Sign in using assigned staff credentials with TOTP 2FA code.

2. CREATE DRAFT:
   - Open 'Content' module -> Click 'New Page'.
   - Title: "TwinMOS PCIe Gen5 Extreme SSD Performance Guide"
   - Slug: "pcie-gen5-performance-guide"
   - Locale: "en"

3. COMPOSE BLOCKS:
   - Add Block: 'hero' -> Enter headline, subhead, and select hero image with alt-text.
   - Add Block: 'specComparison' -> Select NVMe Gen5 vs Gen4 benchmark SKUs.
   - Add Block: 'faqAccordion' -> Add 3 common thermal dissipation questions.
   - Add Block: 'ctaBanner' -> Link to "Where to Buy" distributor locator.

4. PREVIEW:
   - Click 'Live Preview' button.
   - Verify layout rendering, responsive mobile breakpoint, and contrast.

5. EDITORIAL REVIEW:
   - Author transitions state to 'in_review'.
   - Editor inspects draft, confirms accuracy, and sets state to 'published'.

6. REVISION ROLLBACK REHEARSAL:
   - Edit the hero headline text to a test typo and click 'Publish'.
   - Open 'Revisions' drawer -> Select the initial published revision.
   - Click 'Restore Revision' -> Confirm rollback restores pristine content.
```
