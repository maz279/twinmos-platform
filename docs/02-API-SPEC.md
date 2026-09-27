# 02 — API Specification (v1)

Base: `/api/v1` · JSON only · RFC 9457 errors · `X-Request-Id` on all responses.

## Public
| Method | Path | Body/Params | Response | Notes |
|---|---|---|---|---|
| GET | /health | — | {status, version, db} | no auth |
| POST | /forms/:type | Zod `formSubmission` (type ∈ 15 registry types) | 201 {id, reference} | Turnstile token required; rate-limit 5/min/IP; sends Resend routing email |
| GET | /rma/:number | `TM-RMA-YYYY-NNNNNN` | {status, timeline[], maskedInfo} | public tracking projection |

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

## Conventions
- Cursor pagination: `?cursor=<opaque>&limit=≤100`.
- Idempotency: `Idempotency-Key` honored on POST /forms and RMA transitions.
- Validation errors: 422 with `errors[]` field paths (Zod → problem detail extensions).
- Audit: 207 not used; mutations → 200/201 and an audit row (never blocks response).

## Security (OWASP mapping)
Rate limiting (A04/07) · Turnstile (A07 bots) · Zod allow-lists (A03 injection — plus parameter-bound queries only) · RBAC deny-by-default (A01) · session cookie `httpOnly secure sameSite=lax` + rotation (A07) · no PII in logs (A09) · dependency audit in CI (A06) · CSP on admin + web (A05).
