# 02 — API Specification (v1)

Base: `/api/v1` · JSON only · RFC 9457 errors · `X-Request-Id` on all responses.

## Public
| Method | Path | Body/Params | Response | Notes |
|---|---|---|---|---|
| GET | /health | — | {status, version, db} | no auth |
| POST | /forms/:type | Zod `formSubmission` (type ∈ 15 registry types) | 201 {id, reference} | Turnstile token required; rate-limit 5/min/IP; Resend routing email + ticketed auto-reply |
| GET | /rma/:number | `TM-RMA-YYYY-NNNNNN` | {status, timeline[], maskedInfo} | public tracking projection |
| POST | /sn-check | {serial} | {serial, result valid\|unverified, sku?, manufacturedAt?, advice} | P5 anti-counterfeit; 10/min/IP; logs + atomic verifiedCount |
| GET | /i18n/:locale | — | {locale, strings{ns{key}}} | P4 public translation bundle (9 locales) |

## Auth (Better Auth mount)
`/auth/*` — sign-in, sign-out, session, MFA enrol/verify, admin plugin (user management), RBAC plugin (roles/permissions).

## Admin (session + RBAC required)
CRUD pattern for each entity E ∈ {products, categories, brands, articles, news, events, faqs, pages, distributors, jobs, media, redirects, settings}:
| Method | Path | Purpose |
|---|---|---|
| GET | /admin/E?cursor&limit&q&status | cursor-paginated list (q = full-text via pg trigram) |
| GET | /admin/E/:id | detail (+revisions where applicable) |
| POST | /admin/E | create (status=draft default) |
| PATCH | /admin/E/:id | partial update (optimistic locking via `updatedAt` if-match) |
| POST | /admin/E/:id/publish | workflow transition (role-gated) |
| DELETE | /admin/E/:id | soft delete (`deletedAt`) |
Specialist: /admin/submissions (**P6 lead board**: filter by type/status/priority/sla, detail incl. notes + assignee email; PATCH enforces the lead state machine `new→assigned→in_progress→resolved→closed` + `spam` side-track — assigning a NEW lead auto-advances it; POST :id/notes = internal note), /admin/submissions.csv (filtered CSV export, editor+, formula-injection-neutralised), /admin/rma (board + state transitions + notes), /admin/audit (read-only query), /admin/stats (dashboard KPIs incl. submissions.open + submissions.overdue).
Intake (P6): every form family returns a type-aware ticket reference (`QT-…`/`DS-…`/`TS-…`, `FRM-` fallback) and triggers a ticketed auto-reply to the submitter; quote/distributor/partner leads arrive with priority=high and an SLA dueAt.

**P3 media:** /admin/media (multipart upload, size cap `MEDIA_MAX_BYTES`, extension allow-list + magic-byte sniffing, SVG-sanitised, alt-text required) · GET /media/:key (serving).

**P4 translations (writes super_admin):** GET /admin/translations?locale&ns (export) · PUT /admin/translations (upsert single) · POST /admin/translations/import (≤5000 strings, UTF-8 JSON) · DELETE /admin/translations (bulk) — all audited; public read via /i18n/:locale.

**P5 partner portal (member mount):** GET /partner/me (active membership + org + role) · GET /partner/assets (gated: global ∩ org-scope ∩ visibleToTypes ∋ org type) · GET /partner/assets/:id/download (double-gated, path-traversal guarded, no-store, audited).
**P5 partner admin (admin+):** /admin/partner-orgs CRUD + PATCH :id (activate/suspend) · GET/POST /admin/partner-orgs/:id/members (+ DELETE :id/members/:memberId — last owner protected) · POST /admin/partner-orgs/:id/assets (multipart, `PARTNER_MAX_BYTES` cap, document extension allow-list, MIME from extension map) · GET /admin/partner-assets?org&category · DELETE /admin/partner-assets/:id.
**P5 reporting (editor+):** GET /admin/sn-checks?from&to (window totals, byResult, topSerials, recent 50; invalid dates → 422).

## Conventions
- Cursor pagination: `?cursor=<opaque>&limit=≤100`.
- Idempotency: `Idempotency-Key` honored on POST /forms and RMA transitions.
- Validation errors: 422 with `errors[]` field paths (Zod → problem detail extensions).
- Audit: 207 not used; mutations → 200/201 and an audit row (never blocks response).

## Security (OWASP mapping)
Rate limiting (A04/07) · Turnstile (A07 bots) · Zod allow-lists (A03 injection — plus parameter-bound queries only) · RBAC deny-by-default (A01) · session cookie `httpOnly secure sameSite=lax` + rotation (A07) · no PII in logs (A09) · dependency audit in CI (A06) · CSP on admin + web (A05).
