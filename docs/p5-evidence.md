# P5 Evidence — Partner Portal & Anti-Counterfeit

**Date:** 2026-09-27 · **Scope (master plan §3 P5):** Partner portal (Better Auth orgs: Distributor/OEM/SI roles; gated content, price files, MDF), SN-check anti-counterfeit API + reporting.
**Exit criterion:** *Partner login + role-gated content E2E* — **proven in a real browser** (§3): `P5_DONE PORTAL_OK price=true download=true | SN_OK genuine`.

---

## 1. What shipped

| Layer | Deliverable |
|---|---|
| Schema (migration 0004) | `partner_org` (type: distributor/oem/si · status: pending/active/suspended), `partner_member` (user×org unique, owner/staff), `partner_asset` (category: price_file/mdf/resource · `visibleToTypes[]` · org-scoped or global), `sn_check` (verification log) |
| Contracts (`packages/shared`) | PARTNER_TYPES/STATUSES/ASSET_CATEGORIES enums + Zod schemas (org create/update, member add, sn check); snCheck regex charset contract |
| API `routes/partner.ts` | **Member endpoints** (public mount): `GET /partner/me` (active membership + org + role), `GET /partner/assets` (gated: org-scope OR global ∩ visibleToTypes ∋ member org type), `GET /partner/assets/:id/download` (double gate: org scope + type visibility; resolve-based path-traversal guard; `no-store`; audited) · **Admin endpoints** (admin mount): org CRUD (admin+; activate/suspend), member add-by-email (404 if no site account, 409 duplicate), asset upload (multipart → PARTNER_FILES_DIR, content-hash filename, ≥1 visible type), asset list/delete — all audited |
| API `routes/sncheck.ts` | **Public** `POST /sn-check` (rate-limited 10/min/IP): registry lookup → `valid` (sku + manufacturedAt + advice) or `unverified` (advice); every check logged to `sn_check`; `verifiedCount` incremented atomically · **Reporting** `GET /admin/sn-checks` (editor+): window totals, byResult split, top-10 serials, recent 50 |
| Admin SPA | **Partners module**: Organizations tab (create, activate/suspend, member add, gated-asset upload w/ category+visibility) + SN-check report tab (totals/split/top serials/recent) |
| Web `portal.js` | **partners.html:** the prototype's demo sign-in becomes a real partner sign-in (capture-phase — the fake "demo accepted" handler never fires; on success an inline portal dashboard renders org + role + gated documents with authenticated download links; page-load session detection) · **support.html:** collapsed "Verify a product serial number" chip appended at the END of main (zero shift above it) that expands into the SN-check verifier (genuine/not-verified verdict cards) |
| Seed | demo distributor org (active) + seeded admin as owner + global distributor price-file asset + 2 registry serials (`TM-DEMO-0001/0002`) |
| Dev topology | `apps/api/scripts/dev-p5.ts` (env bundle incl. `BETTER_AUTH_URL=http://localhost:8787` + 4321 in trustedOrigins) and `apps/web/.env` → `PUBLIC_API_URL=http://localhost:8787/...` — **localhost on both sides so site+API share a "site"** and Better Auth's SameSite=Lax cookies flow cross-origin (127.0.0.1 vs localhost is cross-site → silent cookie drop; root-caused during E2E) |

**Design note (org model):** the master plan says "Better Auth orgs" — implemented as Better Auth sessions + first-class `partner_org`/`partner_member` tables in our own migration system rather than the better-auth organization plugin (which generates its own table set and plugin boundary). Same capability — orgs, membership roles, gating — with zero generated schema; documented here as the deliberate tradeoff.

## 2. Test evidence — `apps/api/test/p5-portal.e2e.test.ts` (16 tests after the audit iteration; suite total **82/82**)

- **Org lifecycle:** create → `pending`; editor PATCH 403 (admin+ only); activate → `active`
- **Membership gating:** member of a PENDING org → `/partner/me` 403; non-member 403; anonymous 401
- **Membership admin:** add-by-email 201; duplicate 409; unknown email 404 with "account" guidance
- **`/partner/me`** returns org + type + memberRole for the active owner
- **Assets & gating:** global distributor-only price list + org-scoped si resource uploaded; si member sees only the si resource (not the distributor list); distributor member sees only the global price list; cross-org download 403; in-scope download 200 with byte-exact round-trip + attachment disposition; `partner.download` audited
- **Suspension:** suspended org loses `/partner/me` + `/partner/assets` immediately (403)
- **SN-check:** valid (sku round-trip, `verifiedCount` 1→ logged), unregistered (`unverified` + caution advice, sku null, logged), junk serial 422, 11th-per-minute 429 + Retry-After
- **Reporting:** viewer 403; editor 200 — totals ≥12, byResult split correct, topSerial[0] = the checked serial, recent rows present

## 3. The exit-criterion loop (browser, both surfaces)

Harness `tooling/audit-harness/p5-e2e.html` drives the real site in an iframe:

**`P5_DONE PORTAL_OK price=true download=true | SN_OK genuine`**

1. partners.html: fills the real (formerly demo) sign-in form → **portal dashboard renders** with the demo distributor org, the gated **Q4 price list**, and an authenticated **download link** — partner login + role-gated content, live.
2. support.html: clicks the collapsed serial-verification chip → types `TM-DEMO-0001` → **genuine verdict** with SKU — the anti-counterfeit surface, live.

Two real bugs this loop caught and fixed: (a) Better Auth rejected sign-in from :4321 (missing trustedOrigin) — surfaced as a misleading "no membership" error; (b) the first SN widget rendered expanded mid-page, dropping support@390 parity badly — redesigned as a collapsed end-of-main chip (zero shift above it).

## 4. Regression guards

- Full suite **82/82** after the audit iteration (P2 29 + P3 26 + P4 11 + P5 16); 4-project typecheck clean; admin builds.
- Parity after the audit iteration's breadcrumb fix (§6): **10-page @390 sweep 99.0–99.8, all PASS** (partners 99.69, support 99.03, rma 99.35, about 99.37, index 99.15, shop 99.40, contact 99.49, product 99.10, article 99.83, legal 99.67) — scored with `tooling/parity-score.py` (per-pixel max-channel, tol ≤8, gate ≥98, tautology guard).

## 5. Audit iteration (2nd pass, 2026-09-27) — findings and fixes

Re-audited every P5 requirement against the live system. Fixes shipped in this iteration (each with a regression test):

1. **Partner asset upload hardening** — no size cap, no type allowlist, client-declared MIME stored. Now: 25 MB cap (env `PARTNER_MAX_BYTES`), document-oriented extension allowlist (pdf/xlsx/xls/csv/docx/doc/pptx/zip/png/jpg/jpeg), and the stored MIME comes from the extension map, never the client. Tests: `.exe` → 422, oversized → 413, `renamed.pdf` declared `text/html` → stored as `application/pdf`.
2. **Member removal was impossible** (add-only). Now `DELETE /admin/partner-orgs/:id/members/:memberId` — last-owner protected (409), removal kills portal access instantly (403), ghost 404, re-add 201; admin drawer gained a Remove button.
3. **Non-deterministic multi-org membership** — `/partner/me` picked an arbitrary org when a user belonged to several. Now ordered by membership id (first-joined wins), tested.
4. **Asset delete left orphan files on disk** — now unlinks (best-effort).
5. **Download response lacked `X-Content-Type-Options: nosniff`** — added (tested).
6. **SN report crashed on bad dates** — `?from=not-a-date` produced an Invalid-Date bind → 500. Now 422 with guidance (tested both params).
7. **Portal had no sign-out** — the signed-in partner dashboard now has a Sign out button (Better Auth sign-out + dashboard teardown); browser-verified `SIGNOUT_OK dashboard cleared`.
8. **`dir="ltr"` on LTR pages** (P4-era) — the prototype ships `<html lang="en">` with no dir; the explicit attr shifted text rasterization. `dir` is now emitted **only for RTL** (`ar`); P4 site tests updated to the corrected contract.
9. **Parity regression root-caused and fixed** — the port-only `nav.breadcrumb { min-height: 37px }` CLS reserve (justified for dynamically-inserted breadcrumbs) applied to the Astro port's *static* breadcrumbs, adding ~5px vs the prototype on every breadcrumb page since P1. Removed (comment explains the history); partners 97.93→99.69, support 97.94→99.03 @390, and every re-measured page improved.

**Measurement defects this audit uncovered** (why the above hid for five phases): (a) several P1 reference pairs (`partners/support/shop-390-a/b.png`) were the **same file copied** — md5-identical — so "100%" was a tautology; (b) the ad-hoc scorer read PIL's per-channel histogram as packed RGB, producing garbage scores (94.44 for a true 97.93). Both are now impossible: `tooling/parity-score.py` computes the true per-pixel delta and refuses byte-identical pairs. A control re-sweep (P1-commit build rebuilt today == current build, 100.0) proved the *build* never regressed — the references and the scorer had.

**Features-catalog cross-check (deferred items, deliberately out of P5 build scope):** TOTP MFA + passkeys + `__Host-` cookies (F17.4 — P7 hardening), per-distributor watermarked PDFs (F17.6 — needs pdf generation service, P6/P7), bulk ZIP download + preview (F17.5 — later portal iteration), training/certification module (F17.7 — Phase 10 roadmap), counterfeit report form + 5-day SLA (F9.2) and paired policy pages (F9.3) — content/ops follow-ups, daily manufacturing CSV ingest + 100/h rate tier (F9.1 — production ops; current: manual registry seed + 10/min/IP), three-result verdict incl. SUSPECTED COUNTERFEIT → report form (current: two-result valid/unverified + caution advice, upgradeable without schema change).

**Pre-commit sealed scan (audit iteration):** `scan-2026-09-27T13-08-41.137Z-c3ed34a8bb57`, seal `sha256:90a2c226…31a4241`, 15 medium findings — all the static heuristic "sensitive operation without observed role/permission check", which does not recognize the project's in-handler guard pattern (`const guard = await roleGuard(c); if (guard instanceof Response) return guard;`). Each flagged route was hand-verified in code and by existing RBAC tests: `PUT /settings` + `DELETE /redirects/:id` = super_admin `roleGuard`, `DELETE /translations` = superAdmin guard, `DELETE /partner-assets/:id` = `adminGuard` (admin+, 403 asserted in p5 tests), `POST /content/:entity/:id/preview` = authorGuard; `POST /forms/:type` (rate limit + Turnstile) and `GET /preview/:token` (unguessable token) are public by design. No real authorization gap found; the equivalent code scanned clean in earlier phase scans (heuristic coverage is changed-file-steered).

## 6. Running it

```bash
npm run db:migrate -w @twinmos/api      # applies 0004_partner_portal
npm run db:seed -w @twinmos/api         # demo org + admin-owner + price asset + serials
node --experimental-strip-types --no-warnings apps/api/scripts/dev-p5.ts   # API w/ full env
npm run build -w @twinmos/web           # .env → PUBLIC_API_URL=http://localhost:8787/api/v1
# partners.html → sign in as the seeded admin → portal; support.html → serial chip
```
