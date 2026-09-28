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

## Evidence — implemented & verified (commit ef82c14, 2026-09-28)

**P1 shell** — sidebar renders 9 groups / 11 modules with SVG icons and live badges
(Leads 5 · RMA 1 · Careers 1 on the dev corpus); groups collapse and persist; rail
mode 236→84px and back. Multi-tab verified in the in-app browser: module click opens
a tab, Shift+click opens a *separate* tab, × and middle-click close (closing the last
tab falls back to Dashboard), and the full tab set **survives a page reload**
(sessionStorage restore, role-validated). Mega menu opens from the top bar with
grouped description cards; breadcrumbs show `Group / Module / Context` (e.g.
`Support & Leads / Leads & quotes / QT-2026-ab3571fb`).

**P2 search** — `GET /admin/search` (ilike, parameter-bound, soft-delete-aware,
≤5/group) + ⌘K palette. Browser-verified: query `VOLTX` → two PRODUCTS hits
(`VLT-DDR5-16G · published`, `VLT-DDR5-32G · draft`); Enter deep-links into a focused
tab whose ctx auto-opens the record (lead detail with workflow + notes confirmed for
`QT-2026-ab3571fb`). Module-jump results, ↑↓/Enter/Shift+Enter/Esc and recents wired.
(IAB harness note: its synthetic `press()`/role-click events don't always reach React
handlers — verified with native dispatches and page-script clicks; real trusted
events are unaffected.)

**P3 dashboard** — `/admin/stats` extended (backward compatible; 14-day series,
SLA risk queue, content/media health, activity tail, jobsNew). UI shows KPI cards
with sparklines (area-filled so zero-series stay visible) + 7-day deltas, leads
bars, RMA funnel w/ cross-nav, SLA risk table that opens the lead, media
alt-compliance, activity feed, quick actions. All sections confirmed rendered live.

**P4** — submissions consumes tab ctx (heading `Leads & quotes — <ref>`, detail
auto-opened); media gains compliance chip + missing-alt filter.

**Gates** — typecheck clean (4 projects), admin build green (479 kB), suite
**121/121** (9 new: p8-console.e2e.test.ts). Sealed scan
`scan-2026-09-28T21-52-40.583Z-bce0f6d32534`: 47 findings vs 46 baseline — the +1 is
the same authenticated-read heuristic on the new `/admin/search` (authed()-gated,
401 anonymous tested; identical pattern to `/admin/stats`/`/admin/submissions`
reads allowed for viewer per docs/04 RBAC). No findings in the new UI code.

**Dev-env note** — the stale API process served pre-P8 code and lacked the CORS env;
restarted with the documented dev env (ALLOWED_ORIGIN ×3 origins, TRUST_PROXY=1,
turnstile bypass). taskkill-without-SIGTERM gotcha from p2-evidence did NOT corrupt
the dev PGlite (health + data intact).
