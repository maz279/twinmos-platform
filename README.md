# TwinMOS Platform (`twinmso_codebase`)

Production codebase for the TwinMOS corporate website — converted from the audited static prototype (28 pages) per the plan in `docs/`.

## What's here

| Path | What it is |
|---|---|
| `apps/web` | Astro 7 static public site (prototype UI ports here page-by-page — see `docs/05`) |
| `apps/admin` | React 19 CMS control panel / admin dashboard (login, RBAC, modules per `docs/04`) |
| `apps/api` | Hono REST API: auth (Better Auth), public forms, RMA tracker, admin CRUD + audit |
| `packages/db` | Drizzle schema (Postgres dialect, 22 tables), migrations, PGlite dev client |
| `packages/shared` | Zod contracts + enums shared by API, admin, and web |
| `docs/` | Master plan, architecture, API spec, DB spec, admin spec, migration guide, ADRs |

## Quickstart (Node ≥ 24)

```bash
npm install                 # workspace deps
cp .env.example .env        # defaults work for local dev (PGlite, no Turnstile bypass in prod!)
npm run db:migrate          # apply packages/db/migrations to ./data/dev.pgdata
npm run db:seed             # first admin user + reference rows
npm run dev                 # api :8787 · admin :5173 (proxies /api) · web :4321
```

> **Windows dev note:** if the API is force-killed (e.g. `taskkill /F`), PGlite may abort on the next boot. Stop the server with Ctrl+C (graceful shutdown is wired), or recover with `npm run db:reset` — dev data is fully reproducible.

> **Seed Account Configuration:** Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in your local `.env` (or environment secrets in staging/production). Hardcoded default credentials are strictly rejected in staging/production by the seed runner (`SEED-01`, `SEED-02`).

## Verify
```bash
# Automated Phase A close-out scorecard (12 checks: TS, ESLint, security, DB, a11y, E2E)
npm run verify:gate-a

# Interactive manual test suite (Admin security UI, invites, lockout, upload caps)
npm run verify:manual

# Visual & WCAG 2.2 AA contrast audit across 29 public routes (screenshots in tooling/verify/evidence)
npm run verify:visual

# Sanity probes
curl http://127.0.0.1:8787/api/v1/health
curl -X POST http://127.0.0.1:8787/api/v1/forms/contact -H 'content-type: application/json' \
     -d '{"email":"a@b.io","consent":true}'   # dev bypass skips Turnstile
```

## Rules of the repo
1. **Parameter-bound queries only** — Drizzle builder / `sql` template; never string-assembled SQL.
2. The prototype's HTML/CSS is the web UI contract (parity gates in CI).
3. Every admin mutation writes an audit row.
4. PGlite is dev/test only — the API refuses it when `NODE_ENV=production`.
