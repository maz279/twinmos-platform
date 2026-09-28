# DR — Disaster Recovery drill & guide (P7)

**Targets (docs/01 §4.6): RTO 4 hours · RPO 15 minutes.**

## Architecture facts a responder needs
- Web + admin are STATIC bundles — instantly redeployable from git (`npm run build`), no state.
- ALL state lives in: Postgres (schema + content + leads + partners + audit) and two upload dirs (`/var/lib/twinmos/partner-files`, `/var/lib/twinmos/media`).
- Nightly fulls: `deploy/backup.sh` → `db.dump` (pg_dump -Fc) + `files.tgz`, checksummed, rotated ~35d, synced to B2.
- Continuous: Postgres WAL archiving (RPO 15min) to the same B2 bucket (`archive_command`); recovery = last full + WAL replay (`recovery_target_time`).

## Quarterly drill (record every run below)
1. `DRILL_DATABASE_URL=postgres://.../twinmos_drill deploy/restore.sh /var/backups/twinmos/<latest> --drill`
2. Confirm the four verification counts (users/products/articles/audit_rows) match production expectations.
3. Restore WAL from the drill point +15 min on the drill DB; confirm a row written in that window survives (proves RPO).
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
| _pending first staging run_ | — | — | — |
