# Data directory — read this before touching `dev.pgdata`

## The single-writer rule (binding)

`dev.pgdata` is an **embedded PGlite database owned by exactly one live process**.
A second instance opening the same directory — even "just to read", even from
another script — **silently corrupts the store**. This is not theoretical: the
2026-10-06 incident corrupted the dev database exactly this way while `/health`
kept reporting `db: connected`.

Enforcement lives in `packages/db/src/lock.ts` and is wired into `createDb`:
a `dev.pgdata.lock` file (PID inside) appears next to the directory while a
process owns it. A second open refuses with a loud error naming the owning
PID; stale locks (dead PID) are reclaimed automatically.

**Rules:**
1. The API server is the owner while it runs. Never run `import-*` /
   `export-content` / any PGlite-opening tool against this directory while
   the API is up — read state through the API instead.
2. Maintenance order: stop the stack → take/restore backups → run tooling →
   restart. `npm run dev` detaches children on Windows: kill PIDs on
   8787/4321/5173 with `taskkill //PID <pid> //T //F`.
3. Keep a backup refreshed after **every** maintenance window:
   `cp -r dev.pgdata dev.pgdata.bak-<date>` (API stopped).

## Recovery runbook (corruption)

Stop stack → `mv dev.pgdata dev.pgdata.corrupt-<date>` → restore the newest
`dev.pgdata.bak-*` → re-run the idempotent importers
(`tooling/import-catalog.ts`, `import-compat.ts`, `import-distributors.ts`)
→ `tooling/export-content.mjs` → restart → verify
`GET /api/v1/health` returns `200 {"db":"connected"}` and sign-in works.
Data written after the backup is lost — which is why rule 3 exists.

## Directory contents

- `dev.pgdata` — the live embedded database (gitignored)
- `dev.pgdata.bak-*` — dated backups (gitignored; keep at least one fresh)
- `dev.pgdata.corrupt-*` — quarantined corrupted copies; delete after 30 days
- `dev.pgdata.lock` — transient single-writer lock; auto-removed on exit
- `media/`, `outbox/`, `partner-files/` — file stores (survive DB restores)
