#!/usr/bin/env bash
# ==============================================================================
# TwinMOS nightly backup for the docker compose deployment (T7.1.2 / T7.1.3).
# Database (pg_dump -Fc) + roles (pg_dumpall --globals-only) + uploaded files
# (the api_files volume: CMS media and partner assets), checksummed, encrypted
# for off-site copies.
#
# Everything runs through `docker compose exec`, so it reaches the database and
# the files where they actually live (the postgres service publishes no port and
# the files sit in a named volume). Any failing step aborts with a non-zero exit:
# a backup that "succeeds" without data is worse than a failed one (ZT-078).
#
# RPO is 24 h (one nightly full). Continuous WAL archiving is NOT configured in
# this topology — a 15-minute RPO needs it set up and drilled first.
#
#   TWINMOS_COMPOSE   compose command prefix (default: the production stack below)
#   BACKUP_ROOT       local backup directory (default /var/backups/twinmos)
#   BACKUP_ENCRYPTION_KEY  required whenever an off-site target (B2_BUCKET /
#                     S3_BUCKET) is set; only the encrypted copies leave the host
# Cron (repo checkout in /opt/twinmos):
#   15 2 * * * cd /opt/twinmos && deploy/backup.sh >> /var/log/twinmos-backup.log 2>&1
# ==============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."
read -r -a C <<< "${TWINMOS_COMPOSE:-docker compose -f deploy/compose/docker-compose.yml -f deploy/compose/docker-compose.prod.yml}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/twinmos}"
RETAIN_DAYS="${RETAIN_DAYS:-35}"
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"
OFFSITE="${B2_BUCKET:-}${S3_BUCKET:-}"
if [ -n "$OFFSITE" ] && [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
  echo "[backup] FATAL: an off-site target is set but BACKUP_ENCRYPTION_KEY is empty — refusing to ship plaintext." >&2
  exit 1
fi

STAMP="$(date -u +%Y%m%d-%H%M%S)"
DEST="$BACKUP_ROOT/$STAMP"
mkdir -p "$DEST"
chmod 700 "$DEST"
echo "[$(date -u +%FT%TZ)] Starting backup → $DEST"

# 1) Database (custom format) — credentials come from the container's own env
echo "[backup] pg_dump -Fc"
"${C[@]}" exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$DEST/db.dump"
# the catalogue listing doubles as a readability check of the archive
"${C[@]}" exec -T postgres pg_restore --list < "$DEST/db.dump" > "$DEST/db.list"
[ "$(grep -c 'TABLE DATA' "$DEST/db.list")" -gt 0 ] || { echo "[backup] FATAL: dump has no table data" >&2; exit 1; }

# 2) Roles and grants
echo "[backup] pg_dumpall --globals-only"
"${C[@]}" exec -T postgres sh -c 'pg_dumpall -U "$POSTGRES_USER" --globals-only' > "$DEST/globals.sql"

# 3) Uploaded files (api_files volume, mounted in the api container)
echo "[backup] uploaded files (media + partner-files)"
"${C[@]}" exec -T api tar czf - -C /app/apps/api/data . > "$DEST/files.tgz"
tar tzf "$DEST/files.tgz" > /dev/null

# 3b) Archived WAL segments (ZT-079: PITR between nightly fulls, RPO ≤ 15 min).
# Snapshots every segment currently on the wal_archive volume; retention
# prunes the volume after the segments have landed in nightly backups.
echo "[backup] archived WAL segments (PITR)"
WALDEST="$DEST/wal"
mkdir -p "$WALDEST"
for f in $("${C[@]}" exec -T postgres sh -c 'ls /var/lib/postgresql/wal_archive 2>/dev/null' | tr -d '\r'); do
  "${C[@]}" exec -T postgres sh -c "cat /var/lib/postgresql/wal_archive/$f" > "$WALDEST/$f"
done
rmdir "$WALDEST" 2>/dev/null || true

if [ -d "$DEST/wal" ] && [ -n "$(ls -A "$DEST/wal" 2>/dev/null)" ]; then
  ( cd "$DEST" && sha256sum db.dump globals.sql files.tgz wal/* > SHA256SUMS )
else
  ( cd "$DEST" && sha256sum db.dump globals.sql files.tgz > SHA256SUMS )
fi

# 4) Encrypted copies for off-site storage
if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
  echo "[backup] encrypting (AES-256-CBC, PBKDF2)"
  mkdir -p "$DEST/offsite"
  for f in db.dump globals.sql files.tgz; do
    openssl enc -aes-256-cbc -salt -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY -in "$DEST/$f" -out "$DEST/offsite/$f.enc"
  done
  if [ -d "$DEST/wal" ] && [ -n "$(ls -A "$DEST/wal" 2>/dev/null)" ]; then
    tar czf "$DEST/offsite/wal.tgz.enc.tar" -C "$DEST" wal 2>/dev/null \
      && openssl enc -aes-256-cbc -salt -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY \
           -in "$DEST/offsite/wal.tgz.enc.tar" -out "$DEST/offsite/wal.tgz.enc" \
      && rm -f "$DEST/offsite/wal.tgz.enc.tar"
  fi
  ( cd "$DEST/offsite" && sha256sum ./*.enc > SHA256SUMS )
fi

# 5) Off-site replication: the encrypted directory only
if [ -n "${B2_BUCKET:-}" ]; then
  echo "[backup] → b2://$B2_BUCKET/fulls/$STAMP"
  b2 sync --replaceNewer "$DEST/offsite" "b2://$B2_BUCKET/fulls/$STAMP"
elif [ -n "${S3_BUCKET:-}" ]; then
  echo "[backup] → s3://$S3_BUCKET/fulls/$STAMP"
  aws s3 sync "$DEST/offsite" "s3://$S3_BUCKET/fulls/$STAMP" --sse AES256
else
  echo "[backup] WARNING: no off-site target configured (B2_BUCKET / S3_BUCKET) — this backup exists on this host only." >&2
fi

# 6) Retention
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -name '20*' -mtime "+$RETAIN_DAYS" -exec rm -rf {} +

echo "[$(date -u +%FT%TZ)] Backup complete: $DEST ($(du -sh "$DEST" | cut -f1))"
