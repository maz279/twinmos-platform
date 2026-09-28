# 08 — Admin Console Professionalization Plan

Gap source: `docs/04-ADMIN-CMS-SPEC.md` (target UX) vs current `apps/admin` (flat sidebar, single-view
workspace, no search, no tabs, basic dashboard). Backend surface already covers content CRUD +
workflow + revisions + preview, media, submissions/RMA/jobs/products, partners, translations,
settings/redirects/locales, stats, audit — the console must expose it professionally.

## Research findings

**API endpoints available** (role-guarded): content/:entity (CRUD, transition, revisions, revert,
preview), media (list/upload/patch/delete), settings (get/put, redirects CRUD, locales patch),
partner-orgs/members/assets, translations (get/put/import), submissions (filters, detail, notes,
CSV), RMA (board + transitions + idempotency), job-applications, products CRUD, audit, stats,
sn-checks, public forms intake.

**Current console gaps**: flat 11-item list (no grouping/icons/badges); one module on screen at a
time; no global search; no breadcrumbs; no cross-links between related records; dashboard = 5 KPI
numbers + 2 plain lists (no trends/charts/activity); no mega menu / multi-point navigation;
Users & Roles module absent (spec §Modules — needs API support too).

## Phases

### P1 — Navigation shell (registry, sidebar, multi-tab workspace, mega menu, cross-nav)
- `nav.ts`: single module registry — id, group, label, icon, description, minRole, badge key,
  crossNav targets. Groups: Overview · Content Studio · Catalog · Support & Leads · Channel &
  Partners · Careers · Media Library · Localization · Administration.
- Sidebar: grouped sections, collapsible groups (persisted), icons, live badges (new leads, open
  RMA, pending apps), active state, collapse-to-rail mode, role-filtered, glass-chip logo header.
- Multi-tab workspace (right pane): tab bar with open/close, per-tab context (e.g. a selected
  lead), overflow scrolling, middle-click close, "open in new tab" everywhere (Shift+click nav),
  session-persisted tab set; closing last tab shows Dashboard.
- Top bar: breadcrumbs (Group / Module / Context), global-search trigger (⌘K), mega-menu button
  ("All modules" grid — grouped cards with descriptions + role filter + open/open-in-tab), user
  chip (role badge, MFA state, sign-out).
- Cross-navigation API: `nav.open(moduleId, ctx)` passed to modules — audit row → entity, lead →
  assignee/content, RMA → its submission, product → site page, content row → preview.

### P2 — Global search (⌘K command palette + unified API)
- `GET /api/v1/admin/search?q=` — role-guarded unified ilike search across articles/news/pages/
  FAQ, products (SKU/name), submissions (ref/email), RMA (number/email), job applications,
  media (filename/alt), job postings; grouped, capped (≤5/group), audited as read.
- Command palette component: ⌘K/Ctrl+K opens, fuzzy module navigation + entity results, keyboard
  driven (↑↓ Enter Esc), recent items (localStorage), grouped result sections with type badges,
  Enter opens result in new tab (cross-nav).

### P3 — Dashboard info visuals
- Extend `GET /admin/stats`: 14-day submissions/rma time-series, SLA risk list (due_soon +
  overdue w/ refs), content published counts by entity, audit activity feed (last 8), top
  viewed/most-recent content, jobs pending, media alt-compliance %.
- Dashboard UI: KPI cards w/ 7-day delta chips + sparklines (inline SVG, no chart lib), leads
  by-type bar chart, RMA pipeline funnel, SLA risk table (click → open lead tab), activity feed,
  quick actions row (New article, New product, Add redirect, Export CSV).

### P4 — Content & media depth + cross-nav links
- Content: status filter chips, type tabs, scheduled-publish indicator, revision history drawer
  (diff summary + revert), preview button (opens preview URL in new tab), per-row cross-nav
  (edit / revisions / preview).
- Media: grid/table toggle, alt-text compliance column + inline fix, usage refs display, type /
  folder filters, copy-URL action, upload with progress.
- Products/Partners/Jobs/RMA/Submissions: adopt `ctx` deep-linking (row click opens record in
  tab context) and "open in tab" actions.

### P5 — Verification & gates
- API e2e: search endpoint (grouping, caps, RBAC, no-leak across roles), stats extension shapes.
- Browser walkthrough (IAB): every group/module/tab/search/breadcrumb/cross-nav path; multi-tab
  persistence across reload; role-filtered nav for a viewer account.
- Gates: typecheck, admin build, full suite, parity untouched, sealed scan, commits per phase,
  evidence section appended to this doc.

## Deferred (documented, out of scope this pass)
- Users & Roles module (needs new Better Auth admin endpoints — separate security review).
- Menus management + feature flags UI (site nav is build-time; redirects exist already).
- Optimistic locking / dirty-state guard framework (per-record tab contexts land first).
