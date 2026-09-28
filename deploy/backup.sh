#!/usr/bin/env bash
# TwinMOS nightly backup (P7) — Postgres dump + uploaded files, B2-style target.
# RPO 15 min is handled by WAL archiving (postgres config); this is the nightly
# full image. Cron: 15 2 * * * /opt/twinmos/deploy/backup.sh >> /var/log/twinmos-backup.log 2>&1
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must point at the production Postgres}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/twinmos}"
RETAIN_DAYS="${RETAIN_DAYS:-35}"          # nightly fulls: ~1 month
STAMP="$(date -u +%Y%m%d-%H%M%S)"
DEST="$BACKUP_ROOT/$STAMP"
mkdir -p "$DEST"

echo "[$(date -u +%FT%TZ)] backup → $DEST"

# 1) database — custom format, verified checksum
pg_dump "$DATABASE_URL" -Fc -f "$DEST/db.dump"
pg_restore --list "$DEST/db.dump" > "$DEST/db.list"   # readable catalog = integrity check
sha256sum "$DEST/db.dump" > "$DEST/db.dump.sha256"

# 2) uploaded files (media + partner price files — NOT in the DB)
tar czf "$DEST/files.tgz" -C /var/lib/twinmos partner-files media
sha256sum "$DEST/files.tgz" > "$DEST/files.tgz.sha256"

# 3) rotate local fulls
find "$BACKUP_ROOT" -maxdepth 1 -type d -name '20*' -mtime "+$RETAIN_DAYS" -exec rm -rf {} +

# 4) offsite copy (Backblaze B2 per docs/01 §4.6) — wire with: b2 sync ...
if command -v b2 >/dev/null 2>&1 && [ -n "${B2_BUCKET:-}" ]; then
  b2 sync --replaceNewer "$DEST" "b2://$B2_BUCKET/fulls/$STAMP"
fi

echo "[$(date -u +%FT%TZ)] backup complete: $(du -sh "$DEST" | cut -f1)"
