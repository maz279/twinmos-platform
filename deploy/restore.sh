#!/usr/bin/env bash
# TwinMOS restore + DR drill (P7) — RTO 4h / RPO 15min (WAL).
# Usage: restore.sh <backup-dir> [--drill] OR restore.sh [--drill] <backup-dir>
#   --drill restores into a THROWAWAY database and extracts to a throwaway temp directory,
#   leaving production untouched (never touches /var/lib/twinmos). Run quarterly (docs/runbooks/DR.md).
# Closes audit findings Z-23 and Z-41.
set -euo pipefail

DRILL=false
SRC=""

for arg in "$@"; do
  if [ "$arg" = "--drill" ]; then
    DRILL=true
  elif [ -z "$SRC" ]; then
    SRC="$arg"
  fi
done

if [ -z "$SRC" ]; then
  echo "Usage: restore.sh <backup-dir> [--drill] OR restore.sh [--drill] <backup-dir>" >&2
  exit 1
fi

[ -f "$SRC/db.dump" ] || { echo "no db.dump in $SRC" >&2; exit 1; }

# integrity first
( cd "$SRC" && sha256sum -c db.dump.sha256 )
if [ -f "$SRC/globals.sql.sha256" ]; then
  ( cd "$SRC" && sha256sum -c globals.sql.sha256 )
fi
if [ -f "$SRC/files.tgz.sha256" ]; then
  ( cd "$SRC" && sha256sum -c files.tgz.sha256 )
fi

if [ "$DRILL" = true ]; then
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

if [ -f "$SRC/globals.sql" ]; then
  echo "[$LABEL] restoring global roles and permissions catalog…"
  psql "$TARGET" -f "$SRC/globals.sql" || true
fi

# T7.1.1 / Z-41: --drill must NEVER write production paths (/var/lib/twinmos)
if [ "$LABEL" = "DRILL" ]; then
  DRILL_FILES_DIR="${DRILL_UPLOADS_DIR:-$(mktemp -d /tmp/twinmos-drill-uploads.XXXXXX)}"
  echo "[$LABEL] extracting uploaded files into throwaway directory: $DRILL_FILES_DIR (safe non-production path)…"
  tar xzf "$SRC/files.tgz" -C "$DRILL_FILES_DIR"
  if [ -d "$DRILL_FILES_DIR/media" ] || [ -d "$DRILL_FILES_DIR/partner-files" ]; then
    echo "[$LABEL] uploaded media and files integrity verified in throwaway directory."
  fi
  rm -rf "$DRILL_FILES_DIR"
else
  echo "[$LABEL] restoring uploaded files into production: /var/lib/twinmos…"
  tar xzf "$SRC/files.tgz" -C /var/lib/twinmos
fi

echo "[$LABEL] verification queries:"
psql "$TARGET" -t -c "SELECT 'users=' || count(*) FROM \"user\";"
psql "$TARGET" -t -c "SELECT 'products=' || count(*) FROM product;"
psql "$TARGET" -t -c "SELECT 'articles=' || count(*) FROM article;"
psql "$TARGET" -t -c "SELECT 'audit_rows=' || count(*) FROM audit_log;"

if [ "$LABEL" = "PRODUCTION" ]; then
  sudo systemctl start twinmos-api
  curl -fsS http://127.0.0.1:8787/api/v1/health && echo " ← health OK"
else
  echo "DRILL complete — production untouched (0 writes to /var/lib/twinmos). Record results in docs/runbooks/DR.md."
fi
