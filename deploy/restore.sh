#!/usr/bin/env bash
# TwinMOS restore + DR drill for the docker compose deployment (P7).
# Usage: deploy/restore.sh [--drill] <backup-dir>
#   --drill  restores the dump into a THROWAWAY database inside the running
#            postgres service and unpacks the files into a temp directory, checks
#            them, then drops both. Production data is never touched.
#   (none)   PRODUCTION restore: asks for the stamp, stops api+web, restores the
#            database in one transaction and replaces the uploaded files.
# TWINMOS_COMPOSE overrides the compose command prefix (see backup.sh).
set -euo pipefail

cd "$(dirname "$0")/.."
read -r -a C <<< "${TWINMOS_COMPOSE:-docker compose -f deploy/compose/docker-compose.yml -f deploy/compose/docker-compose.prod.yml}"
DRILL=false
SRC=""
for arg in "$@"; do
  if [ "$arg" = "--drill" ]; then DRILL=true; elif [ -z "$SRC" ]; then SRC="$arg"; fi
done
[ -n "$SRC" ] || { echo "Usage: restore.sh [--drill] <backup-dir>" >&2; exit 1; }
for f in db.dump globals.sql files.tgz SHA256SUMS; do
  [ -f "$SRC/$f" ] || { echo "missing $SRC/$f" >&2; exit 1; }
done

# integrity first
( cd "$SRC" && sha256sum -c SHA256SUMS )

pgq() { "${C[@]}" exec -T postgres sh -c "psql -v ON_ERROR_STOP=1 -U \"\$POSTGRES_USER\" -d $1 -tA -c \"$2\""; }
counts() {
  for t in '"user"' product article page audit_log rma_request product_registration media_asset; do
    echo "  $t=$(pgq "$1" "SELECT count(*) FROM $t")"
  done
}

if [ "$DRILL" = true ]; then
  DB="twinmos_drill_$(date -u +%Y%m%d%H%M%S)"
  echo "[DRILL] restoring into throwaway database $DB"
  "${C[@]}" exec -T postgres sh -c "createdb -U \"\$POSTGRES_USER\" $DB"
  trap '"${C[@]}" exec -T postgres sh -c "dropdb -U \"\$POSTGRES_USER\" --if-exists '"$DB"'" >/dev/null || true' EXIT
  "${C[@]}" exec -T postgres sh -c "pg_restore -U \"\$POSTGRES_USER\" -d $DB --no-owner --no-privileges --exit-on-error --single-transaction" < "$SRC/db.dump"
  echo "[DRILL] restored row counts:"
  counts "$DB"
  TMP="$(mktemp -d)"
  tar xzf "$SRC/files.tgz" -C "$TMP"
  echo "[DRILL] files restored: $(find "$TMP" -type f | wc -l) (media: $(find "$TMP/media" -type f 2>/dev/null | wc -l), partner-files: $(find "$TMP/partner-files" -type f 2>/dev/null | wc -l))"
  rm -rf "$TMP"
  echo "[DRILL] complete — production untouched. Record the result in docs/runbooks/DR.md."
  exit 0
fi

read -r -p "RESTORE TO PRODUCTION from $SRC? Type the stamp to confirm: " CONFIRM
[ "$CONFIRM" = "$(basename "$SRC")" ] || { echo "aborted"; exit 1; }

echo "[PRODUCTION] stopping api + web"
"${C[@]}" stop api web
restart() { "${C[@]}" start api web; }
trap restart EXIT

echo "[PRODUCTION] restoring database (one transaction: all or nothing)"
"${C[@]}" exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges --exit-on-error --single-transaction' < "$SRC/db.dump"

echo "[PRODUCTION] replacing uploaded files"
"${C[@]}" run --rm --no-deps -T --entrypoint sh api -c 'find /app/apps/api/data -mindepth 1 -delete && tar xzf - -C /app/apps/api/data' < "$SRC/files.tgz"

echo "[PRODUCTION] restored row counts:"
counts '"$POSTGRES_DB"'
trap - EXIT
restart
for i in $(seq 1 30); do
  if "${C[@]}" exec -T api node -e "fetch('http://127.0.0.1:8787/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    echo "[PRODUCTION] api healthy"; exit 0
  fi
  sleep 2
done
echo "[PRODUCTION] api did not become healthy — check '${C[*]} logs api'" >&2
exit 1
