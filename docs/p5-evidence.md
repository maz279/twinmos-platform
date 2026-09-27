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

## 2. Test evidence — `apps/api/test/p5-portal.e2e.test.ts` (11 tests; suite total **77/77**)

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

Two real bugs this loop caught and fixed: (a) Better Auth rejected sign-in from :4321 (missing trustedOrigin) — surfaced as a misleading "no membership" error; (b) the first SN widget rendered expanded mid-page, dropping support@390 parity to 77% — redesigned as a collapsed end-of-main chip → **98.14%** (partners 98.17%).

## 4. Regression guards

- Parity @390 after P5: partners 98.17 / support 98.14 — within the documented band; the SN chip adds zero pixels above itself.
- Full suite **77/77** (P2 29 + P3 26 + P4 11 + P5 11); 4-project typecheck clean; admin builds.

## 5. Running it

```bash
npm run db:migrate -w @twinmos/api      # applies 0004_partner_portal
npm run db:seed -w @twinmos/api         # demo org + admin-owner + price asset + serials
node --experimental-strip-types --no-warnings apps/api/scripts/dev-p5.ts   # API w/ full env
npm run build -w @twinmos/web           # .env → PUBLIC_API_URL=http://localhost:8787/api/v1
# partners.html → sign in as the seeded admin → portal; support.html → serial chip
```
