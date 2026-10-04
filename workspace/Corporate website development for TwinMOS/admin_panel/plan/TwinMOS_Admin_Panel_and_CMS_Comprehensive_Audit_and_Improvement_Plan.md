# TwinMOS Admin Panel & Headless CMS — Comprehensive Audit & Phased Improvement Plan

**Document Reference:** TWN-ADMIN-CMS-AUDIT-PLAN-2026-001  
**Audit Date:** September 29, 2026  
**Audited Target:** `http://localhost:5174/` (Admin Panel SPA) & `http://127.0.0.1:8787/api/v1/` (REST API)  
**Codebase:** `twinmso_codebase` (npm workspaces: `apps/admin`, `apps/api`, `apps/web`, `packages/db`, `packages/shared`)  
**Authority Ground Truth:** Live twinmos.com crawl, `FORENSIC_AUDIT_REPORT_2026-09-23.md`, `TwinMOS_Website_BRD.md`, `TwinMOS_Website_URD.md`, `TwinMOS_Website_Implementation_Roadmap_15_Phase.md`, `docs/04-ADMIN-CMS-SPEC.md`, `docs/08-ADMIN-CONSOLE-PLAN.md`  
**Classification:** Internal Architectural & Engineering Blueprint  

---

## Executive Summary

TwinMOS Technologies requires a sophisticated, enterprise-grade, and highly reliable Admin Panel & Headless Content Management System (CMS) to manage its global multi-category hardware catalog, 9-locale corporate content corpus, customer RMA returns pipeline, B2B partner distribution network, anti-counterfeit serial verification, and digital assets.

A comprehensive forensic audit of the active codebase (`twinmso_codebase`) and running application services (`http://localhost:5174/` and `http://127.0.0.1:8787`) was executed. The system currently features a solid, high-discipline foundational architecture:
- Parameter-bound Drizzle ORM queries over 22 PostgreSQL/PGlite tables with zero raw string SQL assembly.
- Strict RFC 9457 `application/problem+json` error envelope compliance.
- Strict OWASP security headers (Content-Security-Policy, HSTS, X-Frame-Options DENY, nosniff).
- 128 automated end-to-end Vitest integration tests passing 100% across 9 test suites.
- Clean TypeScript compilation with zero type errors.
- Session-persisted multi-tab workspace, 9-group navigation shell with live badge counts, and ⌘K global command palette search.
- Native Time-based One-Time Password (TOTP) Multi-Factor Authentication (MFA) via Better Auth.

However, significant functional, architectural, and operational gaps exist that prevent the system from meeting the requirements for a full-scale corporate production launch. Most notably, the current visual layout lacks the polish of a top-tier enterprise CMS. To meet corporate standards, the UI architecture will undergo a complete visual overhaul inspired by the **Microsoft Dynamics 365 Unified Interface** and **Fluent 2 Design System**, incorporating deep hierarchical navigation, contextual workspaces, comprehensive data entry layouts, and rich info-visual dashboards. This document details the complete forensic audit findings and establishes a concrete, phase-by-phase engineering improvement roadmap.

---

## Part 1: Forensic System & Architecture Audit

### 1.1 Running Environment & Infrastructure Status

| Service | Environment / Framework | Port | Status | Verification Evidence |
|---|---|---|---|---|
| **Admin Panel SPA** | React 19.3.0, Vite 8.3.1, React Router 7.9.0 | `http://localhost:5174/` | **ONLINE** | HTTP 200 OK; dev proxy `/api` forwards to `:8787` |
| **REST API Engine** | Hono 4.13.9, `@hono/node-server`, Better Auth 1.7.6 | `http://127.0.0.1:8787/api/v1/` | **ONLINE** | `{"status":"ok","service":"twinmos-api","version":"0.3.0","db":"connected"}` |
| **Corporate Website** | Astro 5, SSR/SSG, Tailwind CSS | `http://localhost:4321/` | **ONLINE** | Astro preview server active |
| **Database** | Drizzle ORM 0.45.3, `@electric-sql/pglite` 0.2 (dev/test) / Postgres 16 (prod) | Embedded / 5432 | **ONLINE** | 22 relational tables migrated and seeded |
| **Test Suite** | Vitest 5.0.2 | CLI | **128/128 PASSING** | 9 test files, 118s execution duration |
| **TypeScript** | TypeScript 5.9.3 | CLI | **0 ERRORS** | Clean check across `apps/api`, `apps/admin`, `packages/db`, `packages/shared` |

### 1.2 Frontend Architecture & Performance Audit (`apps/admin`)

1. **Bundle Monolith & Lack of Code Splitting:**
   - `vite build` emits a single monolithic client bundle: `dist/assets/index-B797ULW8.js` of **501.73 kB (uncompressed) / 148.27 kB (gzip)**.
   - Vite warns: `(!) Some chunks are larger than 500 kB after minification`.
   - All 12 modules (`Dashboard`, `Search`, `Content`, `Products`, `Submissions`, `RMA`, `Partners`, `Jobs`, `Media`, `Translations`, `Audit`, `Settings`) are statically imported at the top of `apps/admin/src/nav.ts`.
   - **Target:** Dynamic `React.lazy()` / code-split route chunking per module, reducing the entry shell to <80 kB.

2. **Primitive State Management & Cache Invalidation:**
   - Data fetching is handled via an ad-hoc custom hook `useAsync()` in `apps/admin/src/ui.tsx`.
   - There is no client-side caching, background re-validation, request de-duplication, or shared cache store (such as TanStack Query / React Query).
   - In the multi-tab workspace, opening multiple tabs of related data or updating a record in one tab does not automatically invalidate or update data in another tab without manual `reload()` calls.

3. **Absence of Optimistic Locking & Dirty-State Detection:**
   - If an editor is editing product specifications or long-form marketing copy and accidentally closes the tab or switches modules, **all uncommitted input is lost instantly** without confirmation.
   - The API supports no `If-Match` or `updatedAt` / `version` check. If two administrators concurrently edit the same product SKU or article, the last write silently overwrites the first.

4. **Scattered Styling & Lack of Component Tokenization:**
   - Styling is implemented using raw inline React style objects (`style={{ ... }}`) repeated across components, duplicating color constants (`NAVY = '#0A2540'`, `CYAN = '#00A3E0'`, `GOLD = '#D9A441'`).
   - Lacks a unified design system with reusable accessible primitives (e.g. Radix UI or Tailwind component abstractions).

---

## Part 2: Module-by-Module Technical Audit & Gap Analysis

### 2.1 Product & Catalog Management (`apps/admin/src/modules/products.tsx` & `admin.ts`)

| Feature Requirement (URD / BRD / Spec) | Current Implementation | Status | Gap & Severity |
|---|---|---|---|
| **Product CRUD** | Single-page editor with SKU, slug, name, brand, category, description, price, badges, specs, datasheets. | **Implemented** | Functional basic CRUD. |
| **Forensic Audit Currency Compliance** | Hardcoded dropdown in `products.tsx` line 226: `['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY']`. | **FAIL (Violation)** | **HIGH:** Includes `BDT` (Bangladeshi Taka). The Forensic Audit (`FORENSIC_AUDIT_REPORT_2026-09-23.md`) explicitly stripped all STBL/Bangladesh claims and mandated the authorized currency set: `AED, INR, SAR, USD, EUR, RUB`. |
| **Product Variants (`productVariant` table)** | DB table exists in `packages/db/src/schema.ts` lines 147–150. | **MISSING** | **HIGH:** No admin UI or API endpoints exist to manage variants (capacities 16GB/32GB, speeds 6000MT/s, colors, RGB). |
| **Compatibility Matrix / QVL (`compatibilityRule`)** | DB table exists in `schema.ts` lines 143–146. | **MISSING** | **HIGH:** No admin UI or API exists to manage laptop/motherboard compatibility rules. |
| **Bulk Import / Export (CSV / Excel)** | Specified in BRD US-10.1 & F20.8. | **MISSING** | **HIGH:** No CSV/Excel bulk import or export capability with dry-run schema validation. |
| **Image Resolution & Transparency Checks** | BR-1.2: Minimum 1200x1200px, transparent PNG preferred. | **MISSING** | **MEDIUM:** Media picker allows selecting any image without resolution or format validation. |
| **Optimistic Concurrency Check** | URD §31.3: updatedAt snapshot check returning 409 conflict. | **MISSING** | **MEDIUM:** Silent overwrite on concurrent saves. |

### 2.2 Content Studio & Page Builder (`apps/admin/src/modules/content.tsx` & `content.ts`)

| Feature Requirement (URD / BRD / Spec) | Current Implementation | Status | Gap & Severity |
|---|---|---|---|
| **Content CRUD & Lifecycle** | Articles, News, Pages, FAQ; Draft → In Review → Scheduled → Published → Archived. | **Implemented** | Robust state machine with audit logging and rollback revisions. |
| **Visual Page Builder (F20.3, US-10.2)** | `content.tsx` lines 244–249 renders a raw `<textarea>` requiring manual JSON typing: `placeholder={'Blocks JSON, e.g.\n[\n  { "type": "hero", "title": "..." }\n]'}`. | **CRITICAL DEFECT** | **CRITICAL:** Completely unusable for non-technical marketing staff. Requires a visual block builder (Hero, Text+Image, Feature Grid, Testimonials, CTA, FAQ, Stats, Team). |
| **Rich-Text / WYSIWYG Editor** | Plain `<textarea>` with split tab for client-side markdown parse. | **DEFECT** | **HIGH:** Lacks a rich-text formatting toolbar (headings, lists, tables, bold, italics, code). |
| **Direct Media Insertion** | User must manually copy URL from media tab and paste markdown `![alt](url)`. | **DEFECT** | **HIGH:** No media picker modal integrated directly into the article/news editor. |
| **Two-Person Review & Commenting (BR-5.1)** | Authors cannot publish (enforced in `content.ts`), but no review queue exists. | **PARTIAL** | **MEDIUM:** No inline editorial review comments, revision diff inspector, or email alerts for pending approvals. |
| **Multi-Locale Content Editing (F18.1)** | Database supports `locale` column on articles, news, pages. | **PARTIAL** | **MEDIUM:** UI defaults to 'en'; cannot view or edit parallel locale translations side-by-side. |

### 2.3 Media Library & Digital Asset Management (`apps/admin/src/modules/media.tsx` & `media.ts`)

| Feature Requirement (URD / BRD / Spec) | Current Implementation | Status | Gap & Severity |
|---|---|---|---|
| **Upload & Accessibility Validation** | Multipart upload, mandatory alt-text, mime magic-byte sniffing, SVG sanitization. | **Implemented** | High-discipline security and accessibility gating. |
| **Disk File Deletion on Asset Delete** | In `media.ts` line 200, `db.delete(mediaAsset)` removes DB row only. | **BUG / LEAK** | **HIGH:** Physical disk file is never deleted from `MEDIA_DIR`, resulting in storage leaks. |
| **Cloud Object Storage (S3 / R2 / B2)** | Local disk only (`MEDIA_DIR = ./data/media`). | **GAP** | **HIGH:** Production requires S3/Cloudflare R2 storage abstraction with signed URLs. |
| **Image Optimization & Sharp Variants** | `docs/04-ADMIN-CMS-SPEC.md`: "Sharp-derived variants; B2/S3 driver". | **MISSING** | **HIGH:** No automatic generation of responsive WebP/AVIF variants, retina resolutions, or thumbnails. |
| **Folder Hierarchy & Usage Protection** | Flat list with rudimentary string folder meta. | **PARTIAL** | **MEDIUM:** Lacks tree navigation and referential check preventing deletion of images currently active on public products. |

### 2.4 User Governance, RBAC & Administration (`auth.ts`, `settings.tsx`, `audit.tsx`)

| Feature Requirement (URD / BRD / Spec) | Current Implementation | Status | Gap & Severity |
|---|---|---|---|
| **TOTP Multi-Factor Authentication** | Real TOTP with QR code generation via `qrcode` and backup codes via `better-auth`. | **Implemented** | Highly polished, secure MFA enrollment and challenge flow. |
| **Users & Roles Management Module** | Required by URD UR-10.3 & `docs/04`: User list, invite, role assignment, session revocation. | **MISSING** | **CRITICAL:** Completely omitted from `apps/admin`. Better Auth `admin()` plugin is not configured in `auth.ts`. |
| **Audit Log Filtering & Search** | Shows last 100 rows; `Open ↗` cross-navigation button. | **PARTIAL** | **HIGH:** Zero filter inputs (cannot filter by Actor, Entity, Action, Date range, IP) and no CSV export. |
| **Visual Menus Builder** | Settings module renders Menus as raw JSON string in a textarea. | **DEFECT** | **MEDIUM:** Needs visual drag-and-drop hierarchy builder for main navigation and footer. |
| **Integration & Secret Keys UI** | Settings allows raw key/value PUT for super_admin. | **PARTIAL** | **MEDIUM:** Needs structured integration management for Resend, Turnstile, Sentry, and Cloudflare R2. |

### 2.5 Channel, Support, Careers & Anti-Counterfeit (`partners.tsx`, `submissions.tsx`, `rma.tsx`, `jobs.tsx`)

| Feature Requirement (URD / BRD / Spec) | Current Implementation | Status | Gap & Severity |
|---|---|---|---|
| **Leads & Quotes Workflow** | 5-state machine, priority, SLA countdown badges, internal notes, CSV export. | **Implemented** | ADR-009 compliant, formula-injection hardened. |
| **RMA 7-State Pipeline** | Strict legal transitions, timeline events, automated email notifications via Resend. | **Implemented** | High-integrity after-sales warranty tracking. |
| **Careers / Job Postings Editor** | `apps/admin/src/modules/jobs.tsx` only lists incoming candidate applications. | **DEFECT** | **HIGH:** `job_posting` table exists in DB, but there is NO UI to create/edit job postings! |
| **Serial Registry Management** | Anti-counterfeit check log viewer exists in Partners. | **PARTIAL** | **HIGH:** No UI to view, search, upload, or invalidate authentic serial numbers in `serialRegistry`. |
| **Staff Lead Assignment** | Only supports "Assign to me" or "Unassign". | **PARTIAL** | **MEDIUM:** Cannot assign a lead to another specific team member from a user dropdown. |

---

### 2.6 UI/UX & Visual Architecture (Dynamics 365 Standard Gap Analysis)

| Feature Requirement | Current Implementation | Status | Gap & Severity |
|---|---|---|---|
| **Hierarchical Menu Organization** | Flat 9-group shell. | **DEFECT** | **HIGH:** Needs 3-tier deep linking (Area → Group → Subarea) to support complex catalog hierarchies natively seen in Dynamics 365. |
| **Global Search** | Basic ⌘K command palette. | **PARTIAL** | **MEDIUM:** Must be upgraded to a Dataverse-style categorized global search across all entities with inline action buttons. |
| **Comprehensive Data Entry Forms** | Flat, single-column scrolling forms. | **DEFECT** | **HIGH:** Forms must adopt Dynamics 365 layouts (Tabs, Multi-column sections, sticky Action Ribbons/Command Bars). |
| **Info Visuals & Dashboards** | Only data tables exist. | **MISSING** | **HIGH:** Needs interactive visual dashboards (charts, funnels, metric cards) at the root of every module. |
| **Working Space Context** | Multi-tab is basic. | **PARTIAL** | **MEDIUM:** Requires context-aware workspaces with progressive disclosure and unsaved-changes guards. |

---

## Part 3: Phased Improvement Blueprint

The following structured, 6-phase engineering plan outlines every technical requirement, file modification, API route, and UX enhancement required to achieve an enterprise-grade administration suite.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    TWINMOS ADMIN & CMS TRANSFORMATION                      │
├─────────────────────┬──────────────────────────────────────────────────────┤
│ Phase 1: Security & │ Users & Roles Module · Forensic Currency Fix ·        │
│ Governance (P0)     │ Audit Log Filters & Export · Media Unlink Leak Fix   │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Phase 2: Content    │ Visual Block Page Builder · Rich-Text Editor Toolbar │
│ Studio (P0)         │ Inline Media Picker · Editorial Review Queue & Diff  │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Phase 3: Catalog    │ Product Variants (Attrs/SKUs) · QVL Compatibility    │
│ Engineering (P0)    │ Drag-and-Drop Image Ingest · CSV/Excel Bulk Ops     │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Phase 4: Media DAM  │ S3/R2 Cloud Driver · Sharp Image Variants/WebP/AVIF   │
│ & Storage (P1)      │ Folder Hierarchy · In-Use Deletion Guard             │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Phase 5: Global     │ Side-by-Side Translation Studio · XLIFF 1.2/2.0      │
│ Operations (P1)     │ Job Postings CRUD · Serial Registry & Anomaly Alert  │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ Phase 6: Frontend   │ TanStack Query Server-State · Code-Split Chunks      │
│ Modernization (P2)  │ Unsaved Changes Guard · Design System Componentized  │
└─────────────────────┴──────────────────────────────────────────────────────┘
```

---

### Phase 1: Security, User Governance & RBAC Foundation (P0 — Immediate)

**Objective:** Secure platform governance, eliminate compliance violations, fix resource leaks, and provide full administrator control over staff credentials and audit visibility.

#### 1.1 Better Auth Admin Integration & User Management Module
- **Backend API (`apps/api/src/auth.ts`):**
  - Configure the Better Auth `admin()` plugin in `initAuth(db)`.
  - Expose role-guarded endpoints under `/api/v1/admin/users`:
    - `GET /api/v1/admin/users` — paginated list of accounts with roles, email verification status, MFA state, and last active timestamp.
    - `POST /api/v1/admin/users/invite` — invite a new team member with assigned role (`super_admin`, `admin`, `editor`, `author`, `viewer`).
    - `PATCH /api/v1/admin/users/:id/role` — update user role (super_admin only).
    - `POST /api/v1/admin/users/:id/revoke-sessions` — forcibly terminate active sessions.
    - `POST /api/v1/admin/users/:id/ban` & `unban` — account suspension lifecycle.
- **Frontend SPA (`apps/admin/src/modules/users.tsx` & `nav.ts`):**
  - Add `Users & Roles` module under the `Administration` group.
  - Render user table with status chips, MFA status indicators, role change dropdowns, session revocation actions, and user invitation modal.
  - Register in `nav.ts` with `minRole: 'super_admin'` (per `docs/04-ADMIN-CMS-SPEC.md#L30`, standard admins are strictly barred from user/role administration).

#### 1.2 Forensic Audit Compliance Fix (Currency Sanitization & Contract Validation)
- **Contract Schema (`packages/shared/src/index.ts`):**
  - Update `productCreateSchema` and `productUpdateSchema` line 101 from permissive `z.string().length(3)` to strict enum validation:
    ```typescript
    // Authoritative TwinMOS currency set per FORENSIC_AUDIT_REPORT_2026-09-23#L43
    export const AUTHORIZED_CURRENCIES = ['USD', 'EUR', 'AED', 'SAR', 'INR', 'RUB'] as const;
    export const currencySchema = z.enum(AUTHORIZED_CURRENCIES).default('USD');
    ```
- **Frontend SPA (`apps/admin/src/modules/products.tsx`):**
  - In `products.tsx` line 226, replace the illegal `BDT` currency option with `AUTHORIZED_CURRENCIES` from `@twinmos/shared`. Ensure all UI price formats display the authorized currency codes.

#### 1.3 Audit Log Deep Filtering & Export
- **Backend API (`apps/api/src/routes/admin.ts`):**
  - Refactor `GET /admin/audit` to accept query filters:
    - `actorId` (filter by staff member)
    - `entity` (filter by `product`, `article`, `rma_request`, `user`, etc.)
    - `action` (filter by `create`, `update`, `delete`, `transition`, `revert`)
    - `from` and `to` (ISO timestamp bounds)
    - `cursor` (keyset pagination)
  - Add `GET /admin/audit.csv` with formula injection prevention for external compliance archiving.
- **Frontend SPA (`apps/admin/src/modules/audit.tsx`):**
  - Implement interactive filter bar (Entity selector, Actor dropdown, Action type, Date picker, Reset button, and Export CSV).

#### 1.4 Media Deletion Physical File Cleanup
- **Backend API (`apps/api/src/routes/media.ts`):**
  - In `r.delete('/media/:id')`, retrieve the media asset row before deletion.
  - Safely resolve the absolute file path within `MEDIA_DIR`.
  - Unlink the physical file from disk via `fs.unlinkSync(targetPath)` inside a try/catch block before deleting the database record, preventing orphaned storage leaks.

---

### Phase 2: Visual Component Page Builder & CMS Authoring Studio (P0)

**Objective:** Empower non-technical marketing and content teams to build and publish responsive landing pages, articles, and corporate news without writing code or raw JSON.

#### 2.1 Drag-and-Drop Visual Page Builder (`apps/admin/src/modules/page-builder/`)
- Replace the raw `<textarea>` in `apps/admin/src/modules/content.tsx` when `entity === 'page'` with an interactive visual block builder:
  - **Component Library (`BlockPalette`):**
    1. `HeroBlock`: Main headline, eyebrow tag, subdeck, background media picker, primary & secondary CTA buttons.
    2. `TextMediaBlock`: 50/50 layout (image left/right), rich text, caption, badge.
    3. `FeatureGridBlock`: 2/3/4 column feature cards with SVG icon picker, title, description, and link.
    4. `ProductShowcaseBlock`: Dynamic product picker by category or SKU with live specs preview.
    5. `SpecComparisonBlock`: Comparative technical specifications table (sequential read/write speeds, IOPS, interface, form factor, NAND type, TBW, MTBF).
    6. `WhereToBuyBlock`: Interactive region/country distributor locator and authorized retail partner links for hardware distribution.
    7. `DownloadDatasheetBlock`: Technical downloads block for PDF datasheets, QVL compatibility lists, and user quick-start guides.
    8. `QvlCompatibilityBlock`: Live compatibility check widget embedded directly into hardware product category landing pages.
    9. `TestimonialBlock`: Quote text, author name, company, avatar image, verified attribution badge.
    10. `CtaBannerBlock`: Full-width colored or image-backed lead capture / where-to-buy banner.
    11. `FaqAccordionBlock`: Question and answer items with re-ordering.
    12. `StatsCounterBlock`: Numeric KPIs with label and unit (e.g. `93+ Countries`, `25+ Years`).
    13. `TimelineBlock`: Year/date milestones with title, description, and media.
  - **Block Actions:** Drag to reorder, move up/down buttons, duplicate block, delete block, collapsible settings panel per block.
  - **Live Preview Modal:** Render actual responsive public layout (desktop 1200px / tablet 768px / mobile 375px) using the public site CSS tokens.

#### 2.2 Rich-Text Authoring Studio for Articles & News
- Integrate a rich-text / visual markdown editor component:
  - Floating formatting toolbar: H1, H2, H3, Bold, Italic, Strikethrough, Bulleted List, Numbered List, Blockquote, Code block, Table generator.
  - **Direct Media Picker Integration:** Toolbar button opens the Media Picker modal; selecting an image automatically inserts optimized markdown `![alt](url)` with custom dimensions and alignment.
  - Side-by-side or tabbed live markdown preview.

#### 2.3 Editorial Review Workflow & Diff Inspector (BR-5.1)
- Implement two-person editorial review governance:
  - Authors see a prominent "Submit for Review" button.
  - Dedicated "Review Queue" tab in Content Studio for Editors and Admins.
  - **Visual Diff Viewer:** Compares current draft against the live published version, highlighting additions in green and deletions in red.
  - Editorial review comments: Editors can add feedback and request revisions from the author prior to publishing.

---

### Phase 3: Catalog Engineering, Variants & Compatibility (P0)

**Objective:** Provide complete catalog management for TwinMOS's DRAM, SSD, and accessory portfolios, including hardware variants, QVL compatibility, and bulk catalog ingestion.

#### 3.1 Product Variants Manager (`apps/admin/src/modules/products/variants.tsx`)
- **Backend API (`apps/api/src/routes/admin.ts`):**
  - Add endpoints for `product_variant` table:
    - `GET /api/v1/admin/products/:id/variants`
    - `POST /api/v1/admin/products/:id/variants`
    - `PATCH /api/v1/admin/products/:id/variants/:varId`
    - `DELETE /api/v1/admin/products/:id/variants/:varId`
- **Frontend SPA (`apps/admin/src/modules/products.tsx`):**
  - Add "Variants & SKUs" tab in Product Editor:
    - Manage variant attributes: Capacity (8GB, 16GB, 32GB, 64GB), Frequency/Speed (4800, 5600, 6000, 6400 MT/s), Heatsink Finish (Black, Titanium, White), Lighting (RGB, Non-RGB).
    - Unique SKU generation (e.g. `VLT-DDR5-6000-32GB-RGB`).
    - Individual variant pricing and inventory tracking status.

#### 3.2 System Compatibility Finder & QVL Matrix (`apps/admin/src/modules/compatibility.tsx`)
- **Backend API & Schema:**
  - Mount `/api/v1/admin/compatibility` CRUD endpoints backed by `compatibility_rule` table.
- **Frontend SPA:**
  - Create dedicated `Compatibility Matrix` module under the `Catalog` group.
  - Manage motherboard and laptop compatibility entries:
    - Device Brand (ASUS, MSI, Gigabyte, ASRock, Dell, HP, Lenovo).
    - Device Model / Chipset (Z790, B650, X670E, etc.).
    - Supported Memory Generation (DDR4, DDR5).
    - Form Factor (U-DIMM, SO-DIMM, M.2 2280 NVMe).
    - Maximum Supported RAM Capacity (GB) and validated speed profiles.

#### 3.3 Product Bulk CSV / Excel Import & Export
- **Backend API:**
  - `POST /api/v1/admin/products/import` with `dryRun: boolean`:
    - Parses multipart CSV/XLSX.
    - Validates mandatory fields: unique SKU, brand slug, category slug, status, valid currency.
    - Dry-run mode returns detailed line-by-line validation report (e.g. `Line 14: Duplicate SKU VLT-DDR5-16G`, `Line 22: Unknown Category dram-server`).
    - Commit mode executes transaction-wrapped batch upserts.
  - `GET /api/v1/admin/products/export.csv` — full catalog dump.
- **Frontend SPA:**
  - Bulk Operations modal with downloadable CSV template, upload dropzone, pre-commit validation preview table, and execution confirmation.

#### 3.4 Concurrency Guard (Optimistic Locking)
- Pass `If-Match: "<updatedAt>"` or version tag on `PATCH /admin/products/:id` and `PATCH /admin/content/:entity/:id`.
- On timestamp mismatch, API returns `409 Conflict`.
- Frontend displays side-by-side conflict modal allowing the user to either reload fresh data or review conflicting fields.

---

### Phase 4: Digital Asset Management (DAM) & Media Optimization (P1)

**Objective:** Transition media management from local disk storage to scalable, resilient cloud object storage with automated image processing.

#### 4.1 Pluggable Cloud Storage Driver
- Implement a unified Storage Provider Interface in `apps/api`:
  ```typescript
  export interface StorageDriver {
    put(key: string, bytes: Uint8Array, mime: string): Promise<string>;
    get(key: string): Promise<{ stream: ReadableStream; mime: string; bytes: number }>;
    delete(key: string): Promise<void>;
    getUrl(key: string): string;
  }
  ```
- Implement `LocalStorageDriver` for local development/testing.
- Implement `S3CompatibleStorageDriver` supporting Cloudflare R2, AWS S3, or Backblaze B2 in production with HMAC-signed download URLs.

#### 4.2 Sharp Image Optimization & Variant Generation
- Integrate `sharp` in `apps/api`:
  - Automatically process uploaded images into web-optimized variants:
    - `thumb` (150×150 WebP)
    - `card` (400×300 WebP)
    - `hero` (1200×800 WebP + AVIF)
    - `full` (original max 2560px WebP)
  - Extract exact pixel dimensions, color profile, and file size to store in `media_asset.meta`.

#### 4.3 Folder Hierarchy & In-Use Referential Integrity
- Upgrade `mediaAsset` schema with `folderId` hierarchy table:
  - Organize into structured virtual folders: `/products`, `/banners`, `/news`, `/branding`, `/datasheets`.
- Referential check on deletion:
  - Query `product.heroMediaId`, `product.gallery`, and `article.heroMediaId`.
  - If the asset is currently referenced, deletion is blocked with a warning dialog indicating which entities use the asset.

---

### Phase 5: Localization Studio & Global Operations Hub (P1)

**Objective:** Modernize multilingual operations for the 9 verified locales, provide complete careers management, and harden anti-counterfeit protection.

#### 5.1 Side-by-Side Translation Studio
- Redesign `apps/admin/src/modules/translations.tsx` & relax RBAC:
  - **RBAC Alignment:** Update `apps/api/src/routes/translations.ts` and UI to allow `editor` and `admin` roles to update strings for assigned locales. Reserve `super_admin` only for adding new locales or modifying core framework keys.
  - Split-view interface: English source string on the left, Target locale input on the right.
  - Translation progress matrix: visual progress bar showing % translated per namespace and per locale.
  - RTL-enabled text editing area for Arabic (`ar`) with appropriate font rendering (`Noto Sans Arabic`).
  - Search and filter by translation key, namespace, or missing translations only.
  - Support XLIFF 1.2 / 2.0 import and export for external CAT translation vendors (Crowdin / Trados).

#### 5.2 Careers & Job Postings Full-Stack CRUD Module
- **Contract Schema (`packages/shared/src/index.ts`):**
  - Define `jobPostingCreateSchema` and `jobPostingUpdateSchema` with validation for title, department, location, type, seniority, salary band, and markdown description.
- **Backend API (`apps/api/src/routes/admin.ts`):**
  - Implement full CRUD endpoints:
    - `GET /api/v1/admin/job-postings`
    - `POST /api/v1/admin/job-postings`
    - `PATCH /api/v1/admin/job-postings/:id`
    - `DELETE /api/v1/admin/job-postings/:id`
- **Frontend SPA (`apps/admin/src/modules/jobs.tsx`):**
  - Add "Postings" tab alongside existing "Applications" tab:
    - Title, Department (R&D, Sales, Marketing, Operations, Support, QA), Location (Taipei, Dubai, Cologne, San Jose, Remote).
    - Employment Type (Full-time, Part-time, Contract, Internship) and Seniority Level (Entry, Mid, Senior, Lead, Executive).
    - Status: Draft, Published, Closed / Archived.
    - Salary band (where legally required per BR-14.1) and Equal Opportunity statement.
    - Markdown role description, key responsibilities, and qualifications.
  - Link directly to incoming candidate applications for that specific job posting.

#### 5.3 Serial Registry & Counterfeit Alerting
- Implement serial number management under `Partners & Channel`:
  - Upload authorized factory production batches (CSV with Serial, SKU, Production Date, Factory Batch).
  - Search and verify any serial's lifecycle status.
  - **Automated Anti-Counterfeit Anomaly Detection:**
    - Monitor `sn_check` verification logs.
    - Automatically flag serials queried >5 times across distinct IP addresses or distinct country codes within a 24-hour window as "Suspicious / Suspected Counterfeit".
    - Send automated email notification to the operations and compliance team.

---

### Phase 6: Frontend Modernization, TanStack Ecosystem & Design System (P2)

**Objective:** Refactor the admin frontend for long-term maintainability, sub-second route transitions, resilient offline caching, and responsive UX consistency.

#### 6.1 TanStack Query (React Query) Integration
- Replace ad-hoc `useAsync` with `@tanstack/react-query`:
  - Standardize query keys: `['products', filters]`, `['content', entity, status]`, `['leads', filters]`, `['audit', query]`.
  - Configured with `staleTime: 60_000` (1 minute) and `refetchOnWindowFocus: true`.
  - Automatic cache invalidation upon mutations (`queryClient.invalidateQueries({ queryKey: ['products'] })`).
  - Optimistic UI updates with automatic rollback on network failure.

#### 6.2 Code Splitting & Lazy-Loaded Route Chunks
- Refactor `nav.ts` to use `React.lazy()`:
  ```typescript
  const Dashboard = React.lazy(() => import('./modules/dashboard'));
  const Products = React.lazy(() => import('./modules/products'));
  const Content = React.lazy(() => import('./modules/content'));
  // ...
  ```
- Wrap workspace module renderer with `<React.Suspense fallback={<ModuleSkeleton />}>`.
- Drops initial bundle size from **501 kB** to **~75 kB**, loading module code on demand.

#### 6.3 Global Toast & Feedback Notification System
- Implement a centralized Toast notification system:
  - Floating status notifications in the bottom-right corner for:
    - Success actions (`Product "VLT-DDR5-16G" saved successfully`).
    - Network / validation errors (`Failed to save: Slug already in use`).
    - Destructive actions with a 10-second undo window (`Article moved to trash. [Undo]`).

#### 6.4 TwinMOS Admin Design System (Dynamics 365 / Fluent 2 Paradigm)
- Migrate from inline style attributes to **Microsoft's Fluent UI React v9 (`@fluentui/react-components`)** to achieve an enterprise-grade CMS interface.
- **Color Theme & Grid:** Adhere to the Fluent 2 4-pixel grid system and the 60-30-10 enterprise color strategy (60% neutral/surfaces, 30% TwinMOS brand primary, 10% accent). Utilize elevated surfaces (shadow tokens) to establish visual depth.
- **Hierarchical Navigation:** Implement a collapsible sidebar supporting 3-level deep menus (e.g., Catalog → Memory → DDR5) with state preservation.
- **Working Space & Command Bars:** Implement sticky contextual action ribbons at the top of multi-tabbed forms (Save, Save & Close, Revert, Export).

#### 6.5 Comprehensive Data Entry Forms & Global Search
- **Structured Form Layouts:** Refactor single-page scrolling forms into Dynamics-style tabbed interfaces. Implement progressive disclosure by hiding infrequent settings behind expandable sections. Include 2-column and 3-column data fieldsets.
- **Dataverse-Style Global Search:** Upgrade the search bar to support multi-entity indexed results, allowing users to search across Products, RMAs, and Content simultaneously with quick-action links.

#### 6.6 RMA 7-State Visual Kanban Board

- Redesign `apps/admin/src/modules/rma.tsx` per `docs/04-ADMIN-CMS-SPEC.md#L11`:
  - Replace the flat list/table view with a responsive 7-column Kanban board:
    1. `Submitted` → 2. `Under Review` → 3. `Approved` → 4. `In Repair` → 5. `Shipped` → 6. `Delivered` → 7. `Closed` (or `Rejected`).
  - Card drag-and-drop or quick transition buttons enforcing the legal state machine rules.
  - Card metadata chips: Customer name, Serial number, Product model, SLA aging timer, Assigned technician.
  - Retain toggleable table list view for dense administrative data export.

---

### Phase 7: Info Visuals, Dashboards & Analytics (P2)

**Objective:** Transform raw data tables into actionable, visual command centers for administrators.

#### 7.1 Module-Specific Interactive Dashboards
- Integrate an enterprise charting library (e.g., Recharts or Fluent UI charting extensions) to build rich info visuals:
  - **Sales/Leads Dashboard:** Funnel charts for lead progression, SLA countdown gauges.
  - **RMA Dashboard:** Pie charts of RMA status distribution, bar charts for return reasons by category.
  - **Content Dashboard:** Publish velocity line graphs, translation coverage heatmaps.

---

## Part 4: Implementation Phasing & Resource Matrix

| Phase | Core Deliverables | Target Timeline | Impact & Outcome |
|---|---|---|---|
| **Phase 1: Security & Governance** | Better Auth Admin plugin, Users & Roles module, Forensic currency sanitization (no BDT), Audit log filters & CSV export, Media file unlink fix. | 2 Weeks | Solves critical security, compliance, and memory/disk leak issues. Enables staff account management. |
| **Phase 2: Content Studio & Page Builder** | Visual drag-and-drop Page Builder (9 block types), Rich-text formatting toolbar, inline media insertion, two-person review queue & visual diff. | 3 Weeks | Transforms CMS into an intuitive marketing self-service platform without raw JSON or developer dependency. |
| **Phase 3: Catalog Engineering** | Product Variants (attrs/SKUs), QVL Compatibility Matrix manager, drag-and-drop image ingest, CSV/Excel bulk import/export with dry-run validator. | 3 Weeks | Completes the hardware catalog suite for all DRAM/SSD lines and solves bulk data ingestion. |
| **Phase 4: Media DAM & Storage** | Pluggable Cloudflare R2 / S3 storage driver, Sharp WebP/AVIF automated image optimizer, virtual folders, in-use referential deletion guard. | 2 Weeks | Enterprise asset scalability, fast global CDN delivery, zero orphaned files, and broken link prevention. |
| **Phase 5: Global Operations** | Side-by-side 9-locale translation studio, XLIFF import/export, Careers Job Postings CRUD, Serial Registry batch ingest & counterfeit anomaly alerts. | 2 Weeks | Operational readiness across international offices (Taipei, Dubai, Cologne, San Jose) and brand protection. |
| **Phase 6: Frontend Modernization** | TanStack Query integration, Vite code-split lazy chunks, global Toast notifications, tokenized UI component library. | 2 Weeks | Sub-second module transitions, bundle reduced by >80%, resilient state caching, and unified design polish. |
| **Phase 7: Info Visuals & Analytics** | Interactive module dashboards, Dataverse-style global search, Charting components (funnels, pies, gauges). | 2 Weeks | Provides high-level operational visibility, transforming the admin panel into an intelligent working space. |

---

## Part 5: Verification & Acceptance Criteria

Every milestone must satisfy the following automated and manual acceptance gates before deployment:

1. **Compilation & Type Safety:** `npm run typecheck` passes with zero TypeScript diagnostics across all workspace projects.
2. **Automated Test Coverage:** Existing 128 Vitest tests continue to pass 100%, plus dedicated new integration tests added for every new route (`admin.users.e2e.test.ts`, `admin.variants.e2e.test.ts`, `admin.builder.e2e.test.ts`).
3. **Forensic Integrity Guarantee:** Full-corpus scan confirms zero occurrences of unverified entities or prohibited currencies (`BDT`).
4. **Security & RBAC Enforcement:** Every new endpoint verifies session authentication and enforces the minimum role matrix (`super_admin` > `admin` > `editor` > `author` > `viewer`). Anonymous calls return RFC 9457 401 Problem JSON.
5. **Audit Logging Guarantee:** Every administrative mutation automatically writes an immutable row to `audit_log` with actor ID, entity, action, requestId, and JSON diff.
6. **Cross-Browser & Responsive Validation:** Admin panel renders cleanly across Chrome, Edge, Safari, and Firefox, maintaining full functionality down to tablet viewports.
