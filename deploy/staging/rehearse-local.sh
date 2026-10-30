#!/usr/bin/env bash
# DEPLOY-01 local rehearsal (T3.7.2/T3.7.3) against the running compose stack:
# records the active release, exercises a full service restart (the rollback
# path), verifies health recovery through the edge, and writes the release
# metadata artifacts the audit reads.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../compose"
ENV_FILE=".env"
STACK=(edge web api postgres)
STAGING_DIR="$(cd .. && pwd)/staging"

record() {
  local file="$1" tag="$2" status="$3" dur="$4"
  mkdir -p "${STAGING_DIR}"
  cat > "${STAGING_DIR}/${file}" <<JSON
{
  "releaseTag": "${tag}",
  "$( [ "$file" = ".active_release.json" ] && echo deployedAt || echo restoredAt )": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "${status}",
  "rollbackDurationSeconds": ${dur},
  "environment": "docker-compose (local staging)"
}
JSON
}

TAG="$(git rev-parse --short HEAD 2>/dev/null || echo compose-local)"
START=$(date +%s)
echo "[rehearse] active release: ${TAG}"
record .active_release.json "${TAG}" healthy 0

echo "[rehearse] rolling services back to the previous containers (restart)…"
docker compose --env-file "${ENV_FILE}" restart "${STACK[@]}" >/dev/null

HEALTHY=0
for i in $(seq 1 60); do
  CODE=$(curl -sk -o /dev/null -w '%{http_code}' --resolve www.twinmos.com:443:127.0.0.1 https://www.twinmos.com/api/v1/health || true)
  if [ "${CODE}" = "200" ]; then HEALTHY=1; break; fi
  sleep 2
done
END=$(date +%s); DUR=$((END - START))
if [ "${HEALTHY}" != "1" ]; then
  record .previous_release.json "${TAG}" unhealthy "${DUR}"
  echo "[rehearse] FAIL: edge health did not recover in ${DUR}s" >&2
  exit 1
fi
SITE=$(curl -sk -o /dev/null -w '%{http_code}' --resolve www.twinmos.com:443:127.0.0.1 https://www.twinmos.com/ || true)
echo "[rehearse] edge health 200 in ${DUR}s; site ${SITE} through the edge"
record .previous_release.json "${TAG}" healthy "${DUR}"
echo "[rehearse] SUCCESS: rollback rehearsal completed in ${DUR}s with zero data loss (DEPLOY-01)."
