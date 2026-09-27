# P2 Evidence — Forms, RMA & Admin v1

**Date:** 2026-09-27 · **Scope (master plan §3 P2):** all 15 form types → API + Resend routing + Turnstile spam guard; RMA 7-state workflow + public tracker; admin modules (Dashboard KPIs, Submissions inbox, RMA board, Job applications).
**Exit criteria:** every form E2E-tested · RMA lifecycle E2E · audit log records all mutations — **all met** (evidence below).

---

## 1. What shipped

| Layer | Deliverable |
|---|---|
| Contracts (`packages/shared`) | `rmaIntakeSchema`, `submissionUpdateSchema`, `rmaTransitionSchema`, `jobApplicationUpdateSchema` alongside the existing 15-type registry + `RMA_TRANSITIONS` matrix |
| Mailer (`apps/api/src/mailer.ts`) | 15-type routing table with static subject/body templates (customer data only in a plain-text summary block); drivers: Resend (prod, `RESEND_API_KEY`) / JSON file outbox (dev, `MAIL_OUTBOX_DIR`); recipients env-only (`FORMS_TO`, per-type `<TYPE>_TO`) |
| Forms API (`routes/forms.ts`) | POST creates submission + routing email; `rma` type also creates a real case (CSPRNG 6-digit number `TM-RMA-YYYY-NNNNNN` + creation event + customer confirmation email); `job-application`/`general-application` also materialise `job_application` rows; `Idempotency-Key` replay; GET `/rma/:number` public tracker with masked customer info |
| Admin API (`routes/admin.ts`) | `GET /stats` (KPIs), `GET/PATCH /submissions` (cursor + type/status filters, assign/status), `GET /rma` + `/rma/:id` + `POST /rma/:id/transition` (server-enforced `RMA_TRANSITIONS`, note + optional customer email, Idempotency-Key), `GET/PATCH /job-applications`; reads = any authed role, writes = editor+; **every mutation writes an audit row** (action/entity/actor/requestId/ip) |
| Admin SPA (`apps/admin/src`) | Shell with role-aware nav + 6 modules: Dashboard (live KPIs), Submissions inbox (filters, detail, assign/status), RMA board (search/state filter, detail + timeline, legal-transition buttons), Applications (HR), Products, Audit log; read-only role indicator |
| Web wiring (`apps/web`) | Port-only `assets/js/forms.js`: capture-phase submit interception (prototype handler never fires for wired forms), page→type map (contact/quote/careers→job-application/rma/newsletter), label→key collection, prototype-identical `.form-success` UI, RMA number surfaced to the customer, inline error states; RMA tracker prefers the real API with synchronous interception + prototype-demo fallback; optional Turnstile widget when `TURNSTILE_SITE_KEY` is set; `PUBLIC_API_URL` build-time config in Layout.astro |
| Fixes en route | `auth.ts`/`app.ts` refactor: **one DB handle for the whole API** (auth previously created a second PGlite instance on the same data dir — latent P0 write-visibility bug); `trustedOrigins` env-driven; `DB` type unified (PGlite-flavoured, cast at the Postgres factory boundary); full `npm run typecheck` green including pre-existing P0 debt |

## 2. Exit-criteria evidence

### Every form E2E-tested — Vitest `apps/api/test/p2.e2e.test.ts` (28/28 green, ~10s, isolated PGlite per run)

- **15/15 registry types** → 201 + `FRM-YYYY-xxxxxxxx` reference + DB row + routing email in the dev outbox (`it.each(TYPES)`)
- `rma` additionally: `TM-RMA-…` number + `rma_request` row + **2 emails** (routing + customer confirmation); job types → `job_application` row
- Validation: unknown type 422 · missing consent 422 · invalid email 422 · short RMA issue 422 with `detail`
- Rate limit: 5/min/IP then **429 + Retry-After**
- Idempotency: same `Idempotency-Key` → identical reference, exactly one row

### RMA lifecycle E2E

- Legal path **submitted → under_review → approved → in_repair → shipped → delivered → closed** (6 transitions, each 200, Idempotency-Key per step)
- Illegal jump (submitted → in_repair) → **422 "legal next states"**; closed → terminal 422
- Public tracker: masked name (`John S.`), no email leak, optional `TM-` prefix, junk → 400, unknown → 404, full timeline incl. creation event
- `notifyCustomer` transition → status email in outbox containing the RMA number

### Audit log records all mutations

- `rma.transition` audit rows == transitions performed (6)
- `submission.update` + `job_application.update` audit rows asserted per mutation
- RBAC: anonymous → 401 problem+json; **viewer reads 200 / writes 403**

### Browser-level E2E (real pages, real API, headless Chrome)

Harness `tooling/audit-harness/form-e2e.html` (drives the ported page in an iframe; skips demo sign-in forms exactly like forms.js; `mode=track` drives the RMA tracker, `mode=nl` the footer newsletter):

- **contact:** `E2E_OK ✓ Submitted …` → DB row + routing email (`outbox/…json` shows name/topic/message + Reply-To + reference)
- **quote:** `E2E_OK ✓ … Quote request received — your regional office will reply …`
- **partners (channel application):** `E2E_OK ✓ … Application received — the channel team …` → `partner-inquiry` row (`company/country/email/channelType`)
- **careers (specific role):** `E2E_OK ✓ … HR will review …` → `job-application` row + `job_application` record with the chosen position
- **careers (General Application):** `E2E_OK` → typed as **`general-application`** (verified via `/admin/stats` byType)
- **newsletter:** `E2E_NL ✓ Subscribed — welcome aboard` (footer form on index)
- **rma:** `E2E_OK ✓ … Your RMA number is TM-RMA-2026-653266 — confirmation email … on its way`
- **tracker:** real timeline rendered (`✓ TM-RMA-2026-653266 — submitted · Case created — submitted · RMA request received via website form`)
- **admin SPA:** `ADMIN_AUTHED nav=Dashboard,Submissions,RMA board,Applications,Products,Audit log … admin@twinmos.dev super admin` (live KPI cards against `/admin/stats`; Audit nav is role-gated to admin+)

**Gap-audit iteration (2026-09-27, this doc v2):** full sweep of every prototype `data-tm-form` against the wiring map found the partners channel-application form unwired — fixed (`/partners.html → partner-inquiry`, demo sign-in excluded); careers now switches to `general-application` when the Position select is "General Application"; the admin E2E harness moved out of the shipped `apps/admin/public` (bundle hygiene); dev API URL is pinned in gitignored `apps/web/.env` so rebuilds never lose it (a recurring 404 source). Parity re-verified after the changes: partners 98.17/98.98 · careers 98.86/98.52 — all ≥98%.

**Hardening iteration (2026-09-27, doc v3):** comment-vs-code audit found the idempotency stores never evicted (the "30-minute window" existed only in a comment — replay keys worked forever and the maps grew unbounded) and rate-limit buckets for never-returning IPs leaked. Fixed with `apps/api/src/idem.ts` — an `IdempotencyStore` with lazy TTL eviction (`IDEMPOTENCY_TTL_MS`, default 30 min) plus a FIFO hard cap (10k) — wired into POST /forms and RMA transitions; the form rate limiter now sweeps expired buckets. Unit-tested (TTL expiry + cap eviction) in the suite (29 tests). Also closed a verification gap: **the admin SPA had never been typechecked** (Vite/esbuild doesn't check types) — added `apps/admin/tsconfig.json` (Bundler resolution, react-jsx) to the root `typecheck` chain and fixed everything it surfaced (`unknown`-typed JSX guards → explicit ternaries; double-await artifacts in tests). Post-change verification: 4-project typecheck clean · 29/29 tests · admin `ADMIN_AUTHED` smoke · contact-form browser smoke `E2E_OK`.

### Parity guard (P1 contract preserved)

Form pages re-shot A/B @390/768 after forms.js landed: contact 98.65/98.91 · quote 98.40 · careers 98.86 · partners 98.17 · rma 98.62/98.61 · index@768 99.58 (retry pair; single-shot carousel-phase artifact 89.7 as documented in p1-evidence §2) — **all ≥98%**; forms.js is submit-time-only, zero pixel impact.

## 3. Running it

```bash
# API (dev): PGlite + file outbox + turnstile bypass + trusted dev origins
cd apps/api && API_ALLOW_NO_TURNSTILE=1 FORMS_TO=support@twinmos.dev \
  BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173,http://localhost:5174 \
  ALLOWED_ORIGIN=http://localhost:4321,http://localhost:5173,http://localhost:5174 \
  npm run dev
# Web pointed at the API (dev cross-origin): PUBLIC_API_URL=http://127.0.0.1:8787/api/v1 npm run build && npm run preview
# Admin: npm run dev (Vite proxies /api → 8787)
# Tests: npm run test -w @twinmos/api   (28 E2E, isolated temp DB)
```

Gotchas encoded here: restart `astro preview` after every build (in-memory cache); `taskkill` on the API without SIGTERM corrupts PGlite → `npm run db:reset` + migrate + seed; the browser-use controlled tab throttles fetches — subprocess Chrome is the reliable driver.
