# DR — Disaster Recovery drill & guide (P7)

**Targets (docs/01 §4.6): Bare-Metal Disaster Recovery RTO < 4 hours · Service Rollback RTO < 15 minutes (< 900s) · RPO 15 minutes (continuous WAL archiving).**

> **Current state (zero-trust audit 2026-10-28, ZT-078/079):** WAL archiving is **not** set up in the docker compose deployment, so the achievable RPO today is **24 h** (nightly `deploy/backup.sh`). The 15-minute target is open until archiving is configured and a PITR drill is recorded below.

## Architecture facts a responder needs
- Web + admin are STATIC bundles — instantly redeployable from git (`npm run build`), no state.
- ALL state lives in: Postgres (the `pgdata` volume: schema + content + leads + partners + audit) and the `api_files` volume (`/app/apps/api/data/{media,partner-files}` in the api container).
- Nightly fulls: `deploy/backup.sh` (via `docker compose exec`) → `db.dump` (pg_dump -Fc) + `globals.sql` + `files.tgz`, `SHA256SUMS`, rotated ~35d; only the encrypted copies (`offsite/*.enc`) are synced to B2/S3.
- Continuous WAL archiving: **not configured yet** (see above).

## Quarterly drill (record every run below)
1. `deploy/restore.sh --drill /var/backups/twinmos/<latest>` — restores into a throwaway database inside the running postgres service and unpacks the files to a temp dir; both are removed afterwards.
2. Confirm the printed row counts match production expectations and the file counts match the media library.
3. (Once WAL archiving exists) restore to drill point +15 min and confirm a row written in that window survives (proves RPO).
4. Time-box a "VM lost" walkthrough: fresh VM → DEPLOY.md steps 0–4 from git + latest B2 full + WAL. Target ≤ 4h.
5. Record: date, duration, gaps found, fix commits.

## Incident quick-reference
| Symptom | First action |
|---|---|
| API down (`/health` fails) | `systemctl status twinmos-api` → logs (`journalctl -u twinmos-api -n 200`) → restart; if DB down, start Postgres first |
| Site down, API up | nginx (`systemctl status nginx`, `nginx -t`); Cloudflare status page |
| DB corruption | stop API → `restore.sh <latest-good>` → start API → verify checklist (DEPLOY.md §6) |
| Bad deploy | rollback per DEPLOY.md §7 (previous bundles / previous tag) |
| Data accident (bad migration/bulk edit) | point-in-time WAL recovery to just before the event; forward-only migrations otherwise |

## Drill log
| Date | Duration | Result | Gaps found → fixes |
|---|---|---|---|
| 2026-10-28 (zero-trust lab, PG18 compose stack — not production) | ~15 s | PASS — `deploy/backup.sh` + `deploy/restore.sh --drill`: checksums OK; throwaway DB restored in one transaction; counts user=6, product=39, page=28, media_asset=1 equal to the live lab DB; 7 files (6 media) restored. Evidence: evidence/zt-2026-10-28/iter-4/{backup,restore-drill}.log | No PITR (WAL archiving not configured: RPO 24 h). A production drill is still required after go-live. |
| ~~2026-10-27~~ | — | **WITHDRAWN 2026-10-28** — produced by the simulator `tooling/ops/dr-restore-drill.mjs` (4-row PGlite, no real dump/restore); see docs/reports/withdrawn/2026-10-28. Original text: (PITR restore verified: schema migrations restored, incremental WAL transactions replayed to T_TARGET, users/products/forms/audit verified, API health 200 with DB connected, RTO < 900s) | Z-23: Deleted fake drill tooling/dr-drill.mjs and implemented production-grade tooling/ops/dr-restore-drill.mjs. Z-41: Safe drill throwaway directory without writing to /var/lib/twinmos; fixed argument order in ROLLBACK.md. |
| local-dev 2026-09-28 | 11.0s | PASS (Historical baseline run prior to MS7.1 hardening) | none |

