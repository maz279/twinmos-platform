# P6 Evidence — Commerce Decision (ADR-009) + Quote/Lead Hardening

**Date:** 2026-09-27 · **Master-plan scope:** *"Quote/lead flow hardened **or** Medusa.js/Stripe integration — decided by then-business case (ADR at phase start)"*.
**Decision:** harden the quote/lead flow — **ADR-009** (`docs/adr/ADR-009-commerce-quote-vs-medusa.md`, registry line added). Commerce (Medusa/Stripe) is deferred with explicit revisit triggers (direct-retail market confirmation, channel-conflict policy, commissioned cart UI, Terms-of-Sale approval); when triggered, Stripe-Checkout-only is the recommended first step. Rationale: the prototype contract has no cart surface, TwinMOS sells through an authorized channel (BR-3.1 / constraint C-02), and one-platform topology keeps P7 hardening simple.

## 1. What shipped

| Layer | Deliverable |
|---|---|
| ADR | `ADR-009` — decision, consequences, revisit triggers, Stripe-first recommendation |
| Schema (migration 0005) | `submission_status` enum extended with `in_progress` + `closed` (append-only); `form_submission.priority` + `due_at` (SLA) columns with partial index on open states; `form_note` table (author FK, cascade) |
| Contracts (`packages/shared`) | `SUBMISSION_STATUS` (6), `SUBMISSION_TRANSITIONS` (server-enforced graph), `SUBMISSION_PRIORITY`, `SUBMISSION_SLA_HOURS` + `submissionSlaHours()`, `SUBMISSION_REF_PREFIX` + `submissionRefPrefix()`, `submissionAutoPriority()`, `formNoteCreateSchema`; `submissionUpdateSchema` gains `priority` |
| Intake (`routes/forms.ts`) | Type-aware ticket refs (`QT-…`, `DS-…`, `TS-…`; `FRM-` fallback), auto-priority (quote/distributor/partner → high), SLA `dueAt` set per family, and a **ticketed auto-reply to the submitter for every form family** (BR-4.1 — previously RMA-only) |
| Admin (`routes/admin.ts`) | PATCH enforces `SUBMISSION_TRANSITIONS` (422 + legal list on illegal jumps); assigning an unowned NEW lead auto-advances to `assigned`; list gains `priority`/`sla` filters + computed `slaState`; detail includes notes (author + newest-first); `POST /submissions/:id/notes` (editor+); `GET /submissions.csv` (editor+, filtered, structured lead columns from payload, audited); `/admin/stats` gains `open` + `overdue` |
| Admin SPA | Submissions module → **Leads & quotes** board: priority select, SLA badges (overdue ⚠ / due soon / on track), transition buttons driven by the shared graph (terminal states show no buttons), priority select in detail, internal-notes thread + add box, CSV export link; Dashboard gains an **Overdue leads** KPI |
| Web (`forms.js`) | Post-submit success text now appends `Your reference: QT-…` — post-action only, zero pixels at rest (quote @390 parity **99.57**) |
| Seed | Demo `QT-…` lead (new/high) + an **overdue urgent** `TS-…` lead so SLA badges and the dashboard KPI demo out of the box |

**Deferred (documented, deliberate):** RFQ document upload (the prototype quote form has no file field — adding one would violate the parity contract); business-hours SLA calendar (calendar hours used; F7.1 wording simplified and noted here); ERP inventory/price sync and everything in catalog C21 (commerce phase).

## 2. Test evidence — `apps/api/test/p6-leads.e2e.test.ts` (9 tests; suite total **91/91**)

- Quote intake: `QT-` ref, priority `high`, `dueAt` within 24h ±0.2, auto-reply in outbox containing the ref (subject + body)
- Contact intake: `CT-` ref, priority `normal`
- SLA: computed `slaState` (on_track/overdue) + `?sla=overdue` filter matches only past-due open leads
- State machine: `new→closed` 422; `new→assigned` via assignment auto-advance; happy path `assigned→in_progress→resolved→closed`; `closed→assigned` 422 (terminal); `slaState` null once closed
- Spam flow: `new→spam→new` (un-spam returns to queue)
- Priority: viewer PATCH 403, admin PATCH 200 → `urgent`, audited
- Notes: viewer 403, editor 201 ×2, listed newest-first with author email
- CSV: viewer 403; editor 200 `text/csv`, exact header, QT row contains company/quantity/priority
- `/admin/stats`: `open` and `overdue` counts present
- P2's prefix expectation updated to the type-aware map (all 15 types still asserted)

## 3. Browser evidence (both surfaces, real Chrome)

- **Admin board** (`tooling/audit-harness/p6-leads-e2e.html` via the Vite proxy):
  `P6_LEADS_DONE signin=200 | board qt=true priority=true sla=true csv=true | detail notes=1 | note_added=true | moved=true`
- **Public flow** (same-origin harness on :4321 filling the real quote form):
  `P6_QUOTE_DONE ✓ Submitted … Your reference: QT-2026-8fc1cb1a.`
- Parity @390 after the forms.js change: **quote 99.57 PASS** (gate 98; post-action-only UI).

## 5. Audit iteration 2 (2026-09-28) — findings and fixes

Re-audited every P6 deliverable against the live system. Fixes shipped:

1. **CSV formula-injection neutralised** — user payloads (company/name/etc.) land in a CSV ops opens in Excel; cells beginning `= + - @ TAB CR` are now apostrophe-prefixed inside their quotes (`'=HYPERLINK(...)`). Regression-tested with a live injection probe (p6 test + verified through the running API).
2. **Assignee shown as a raw UUID** in the lead detail and the CSV — the API now joins `user.email` and returns `assigneeEmail` on list/detail/CSV; the admin drawer shows the email. Regression-tested (row must contain the email and no UUID).
3. **Legacy `due_at` backfill** — rows created before migration 0005 got NULL dueAt (invisible to SLA). The migration now backfills OPEN legacy rows with `created_at + per-family hours` (idempotent; closed/spam rows intentionally stay NULL).
4. **Spec docs were stale** — 02-API-SPEC (lead-board endpoints, enforced transitions, notes, CSV, ticketed intake), 03-DATABASE-SCHEMA (status enum, priority, dueAt, form_note), 04-ADMIN-CMS-SPEC (Leads & quotes board) all updated.
5. **`tooling/devdb-rebuild.mjs`** — one command to rebuild the disposable dev PGlite (migrate + seed + corpus) after a hard-kill corruption; hit twice this engagement (PGlite datadirs are fragile across `taskkill //F`; always stop the API first).

Verified-clean on re-audit (no action): mailer fire-and-forget semantics (auto-reply can never 500 a submission); spam excluded from SLA; transitions on PATCH-only status changes; `p6_leads` suite now **11 tests** (suite total **93/93**); assignee join + CSV hardening verified through the live API and the admin UI in a real browser.

```bash
npm run db:migrate -w @twinmos/api   # applies 0005_lead_hardening
npm run db:seed -w @twinmos/api      # demo QT lead + overdue TS lead
node apps/api/scripts/dev-p5.ts      # API (env bundle)
# site: quote.html → submit → reference shown; admin (5174) → "Leads & quotes"
```

Note: a hard-killed dev API can leave a stale `data/dev.pgdata/postmaster.pid` — delete it before restarting, or PGlite aborts on boot (hit during this phase; recovery = `rm postmaster.pid` → `db:migrate` → `db:seed` → `import-corpus.ts` with `PGLITE_DATA=./apps/api/data/dev.pgdata`).

## 6. Running it
