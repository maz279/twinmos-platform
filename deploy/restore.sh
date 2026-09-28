#!/usr/bin/env bash
# TwinMOS restore + DR drill (P7) — RTO 4h / RPO 15min (WAL).
# Usage: restore.sh <backup-dir> [--drill]
#   --drill restores into a THROWAWAY database and runs verification queries,
#   leaving production untouched. Run quarterly (docs/runbooks/DR.md).
set -euo pipefail

SRC="${1:?usage: restore.sh <backup-dir> [--drill]}"
DRILL="${2:-}"
[ -f "$SRC/db.dump" ] || { echo "no db.dump in $SRC" >&2; exit 1; }

# integrity first
( cd "$SRC" && sha256sum -c db.dump.sha256 )

if [ "$DRILL" = "--drill" ]; then
  TARGET="${DRILL_DATABASE_URL:?DRILL_DATABASE_URL must point at a throwaway database}"
  LABEL="DRILL"
else
  read -r -p "RESTORE TO PRODUCTION from $SRC? Type the stamp to confirm: " CONFIRM
  [ "$CONFIRM" = "$(basename "$SRC")" ] || { echo "aborted"; exit 1; }
  TARGET="${DATABASE_URL:?DATABASE_URL required}"
  LABEL="PRODUCTION"
  sudo systemctl stop twinmos-api
fi

echo "[$LABEL] dropping + recreating schema in target…"
psql "$TARGET" -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
pg_restore --no-owner --no-privileges "$SRC/db.dump" -d "$TARGET"

echo "[$LABEL] restoring uploaded files…"
tar xzf "$SRC/files.tgz" -C /var/lib/twinmos

echo "[$LABEL] verification queries:"
psql "$TARGET" -t -c "SELECT 'users=' || count(*) FROM \"user\";"
psql "$TARGET" -t -c "SELECT 'products=' || count(*) FROM product;"
psql "$TARGET" -t -c "SELECT 'articles=' || count(*) FROM article;"
psql "$TARGET" -t -c "SELECT 'audit_rows=' || count(*) FROM audit_log;"

if [ "$LABEL" = "PRODUCTION" ]; then
  sudo systemctl start twinmos-api
  curl -fsS http://127.0.0.1:8787/api/v1/health && echo " ← health OK"
else
  echo "DRILL complete — production untouched. Record results in docs/runbooks/DR.md."
fi
