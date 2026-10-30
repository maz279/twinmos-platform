# 04 — Admin Dashboard & CMS Control Panel (`apps/admin`)

React 19 SPA · TanStack Router (file routes, code-split per module via `React.lazy`) · TanStack Query (server state) · Tailwind 4 with TwinMOS design tokens · Dark chrome unified with public brand identity.

---

## 1. Module Registry & Navigation (`apps/admin/src/nav.ts`)

The TwinMOS Admin Console features exactly **18 production modules** partitioned across 9 functional navigation groups. Access is strictly controlled at the routing, navigation, and API boundary via server-side `requireRole()` middleware (`NEW-07`).

| # | Module ID | Label | Navigation Group | Minimum Role | Key Capabilities & Features |
|---|:---|:---|:---|:---|:---|
| 1 | `dashboard` | **Dashboard** | Overview | `viewer` | Real-time KPI summary (submissions today/7d, open RMAs by state, published content count, low-stock/featured SKUs), live audit tail activity feed, quick launch shortcuts. |
| 2 | `search` | **Search** | Overview | `viewer` | Global unified search across all platform entities: leads, quotes, products, content articles, RMA tickets, media files, and serial numbers. |
| 3 | `content` | **Content** | Content Studio | `viewer` | Multi-type content manager (Articles, News, Events, Pages, FAQ) with markdown editor, frontmatter form, 30-type visual page block builder, scheduled publishing, and revision rollbacks. |
| 4 | `entities` | **Truth & Entities** | Content Studio | `editor` | Single Source of Truth governance: versioned legal policies, approved corporate offices, permission-backed customer testimonials, and interactive contact/quote form definitions. |
| 5 | `products` | **Products** | Catalog | `viewer` | Product catalog administration: SKU management, jsonb specifications schema editor, media gallery, downloadable datasheets, marketing badges, and variant hierarchies. SKU lock after publish requires Admin. |
| 6 | `compatibility`| **Compatibility** | Catalog | `viewer` | Qualified Vendor List (QVL) matrix: motherboard, desktop, and laptop memory/storage compatibility rule authoring and search indexing. |
| 7 | `submissions` | **Leads & quotes** | Support & Leads | `viewer` | Lead management inbox: SLA-tracked 5-state lifecycle (`new` → `contacted` → `qualified` → `converted` / `lost` / `spam`), priority and type filters, internal notes, and CSV data export. |
| 8 | `rma` | **RMA board** | Support & Leads | `viewer` | Returns Merchandise Authorization board: 7-state kanban pipeline (`submitted` → `received` → `inspecting` → `approved` / `rejected` → `replaced` / `refunded`), transition guards, and audit notes. |
| 9 | `partners` | **Partners & channel**| Channel & Partners| `viewer` | Authorized distributor directory (region, country, tier, status), verified marketplace listings, and secure partner asset distribution. |
| 10| `serials` | **SN-check & serials**| Channel & Partners| `viewer` | Anti-counterfeit serial number registry: batch CSV import, genuine verification lookups, counterfeit IP anomaly scans, and distributor assignment. |
| 11| `jobs` | **Careers** | Careers | `viewer` | Job opening requisition editor and privacy-compliant candidate application inbox with metadata tracking. |
| 12| `media` | **Media library** | Media Library | `viewer` | Digital asset management: upload processing, Sharp-derived responsive image variants, mandatory WCAG alt-text enforcement, usage references, and folder hierarchies. |
| 13| `translations`| **Translations** | Localization | `viewer` | 9-locale translation matrix: string localization, completeness coverage progress, and PO/JSON import/export tools. |
| 14| `users` | **Users & Roles** | Administration | `super_admin`| Staff identity governance: user directory, invitation dispatch, role assignment (`requireRole()`), mandatory MFA enforcement, and active session revocation. |
| 15| `audit` | **Audit log** | Administration | `editor` | Immutable read-only security audit trail (actor, entity, action, timestamp, client IP, requestId). 12-month retention policy. |
| 16| `settings` | **Settings** | Administration | `admin` | Global platform configuration, locale routing rules, SEO redirects mapping, and feature toggles managed via platform runtime environment (NF-38). |
| 17| `privacy` | **Privacy & DSAR** | Administration | `super_admin`| Compliance operations: Data Subject Access Request (DSAR) JSON/PDF export, verified cryptographic erasure with zero-PII audit preservation, and automated retention sweeps. |
| 18| `alerts` | **Alerts & Telemetry**| Administration | `viewer` | Cluster observability dashboard: live alerting status, firing anomaly logs, RFC 9457 error summaries, and operational health drill triggers. |

---

## 2. Publishing Workflow & Lifecycle

The platform enforces a deterministic, 5-state editorial lifecycle across all published entities:

```
[ draft ] ──> [ in_review ] ──> [ scheduled ] ──> [ published ] ──> [ archived ]
   │               │                                   │
   └───────────────┴─────────── [ revisions ] <────────┘
```

- **Author**: Can create and edit own draft content; cannot transition to `published`.
- **Editor**: Can review, approve, and publish content scoped to assigned locales.
- **Admin & Super Admin**: Can publish, unpublish, schedule, or archive content globally.
- **Automated Promotion**: Scheduled jobs promote content at `publishAt` via API background cron worker.
- **Snapshot Revisions**: Every publish action snapshots prior jsonb state, enabling instantaneous one-click revision rollback.

---

## 3. Server-Side RBAC Enforcement (`NEW-07`)

All administrative endpoints are defended by server-side `requireRole()` middleware that inspects authenticated Better Auth sessions against `@twinmos/db` user role definitions:

| Capability / Module | `super_admin` | `admin` | `editor` | `author` | `viewer` |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard & Search** (`dashboard`, `search`) | Full | Full | Full | Full | Read |
| **Content Authoring** (`content`) | Full | Full | Edit & Publish (Locale) | Edit (Own) | Read |
| **Truth & Entities** (`entities`) | Full | Full | Full | Read | Read |
| **Catalog & Products** (`products`) | Full | Full (SKU unlock) | Edit | Read | Read |
| **QVL Compatibility** (`compatibility`) | Full | Full | Edit | Read | Read |
| **Support & Leads** (`submissions`) | Full | Full | Full | Read | Read |
| **RMA Board** (`rma`) | Full | Full | Full | Read | Read |
| **Channel & Serials** (`partners`, `serials`) | Full | Full | Edit | Read | Read |
| **Careers & Jobs** (`jobs`) | Full | Full | Edit | Read | Read |
| **Media Library** (`media`) | Full | Full | Upload/Edit | Upload (Own) | Read |
| **Translations** (`translations`) | Full | Full | Edit Strings | Read | Read |
| **Users & Roles** (`users`) | Full | — | — | — | — |
| **Audit Log** (`audit`) | Full | Full | Read-Only | — | — |
| **Settings & Redirects** (`settings`) | Full | Full | — | — | — |
| **Privacy & DSAR Operations** (`privacy`) | Full | — | — | — | — |
| **Alerts & Telemetry** (`alerts`) | Full | Full | Full | Full | Read |

---

## 4. Platform Runtime Configuration & Feature Toggles (`NF-38`)

In accordance with architectural requirement `NF-38`, operational settings and feature flags are managed via platform environment variables and runtime configuration rather than dynamic ad-hoc overrides:
- `API_ALLOW_NO_TURNSTILE`: Disables Turnstile validation during test harness execution (strictly `0` in production).
- `TRUST_PROXY`: Configures single-header proxy IP extraction (`X-Real-IP`) from trusted Cloudflare edge networks (`EDGE-01`).
- `BOOTSTRAP_SEED`: One-time flag initiating verified super admin seed generation.

---

## 5. UX & Accessibility Standards

- **Data Tables**: Cursor pagination, server-side sorting/filtering, saved column preferences, bulk actions with undo windows.
- **Form Controls**: Optimistic concurrency locking (conflict toasts), dirty-state guards, inline Zod schema validation matching `@twinmos/shared` contracts.
- **Accessibility**: Full WCAG 2.2 Level AA compliance across all 18 modules (enforced via `@a11y-debugging` audits and automated axe testing).
