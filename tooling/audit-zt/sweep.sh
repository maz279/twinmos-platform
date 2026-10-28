#!/usr/bin/env bash
# One iteration sweep on a freshly reset lab: provision accounts, business-flow
# probe, live route table + authorization sweep, CMS reflection, full browser crawl.
# Usage: tooling/audit-zt/sweep.sh <evidenceDir>
set -uo pipefail
cd "$(dirname "$0")/../.."
E=$1; mkdir -p "$E"
rm -f tooling/audit-zt/lab/.state/accounts.json
bash tooling/audit-zt/lab/up.sh --reset > "$E/lab-up.log" 2>&1; echo "lab-up rc=$?"
node tooling/audit-zt/lab/provision.mjs < /dev/null > "$E/provision.log" 2>&1; echo "provision rc=$?"
node tooling/audit-zt/tools-api.mjs "$E/tools-api.json" < /dev/null > "$E/tools-api.txt" 2>&1; echo "tools-api rc=$?"
sed 's#../../../apps/api/src/app.ts#./src/app.ts#' tooling/audit-zt/lib/dump-routes.ts | MSYS_NO_PATHCONV=1 docker exec -i -w /app/apps/api -e AUDIT_RETENTION_DISABLED=1 twinmos-lab-api-1 node --no-warnings --input-type=module-typescript > "$E/routes.jsonl" 2> "$E/routes.err"; echo "routes $(wc -l < "$E/routes.jsonl")"
node tooling/audit-zt/routes-authz.mjs "$E/routes.jsonl" "$E/routes-authz.json" < /dev/null > "$E/routes-authz.txt" 2>&1; echo "routes-authz rc=$?"
node tooling/audit-zt/cms-reflect.mjs "$E/cms-reflect.json" < /dev/null > "$E/cms-reflect.txt" 2>&1; echo "cms-reflect rc=$?"
# ZT-077: uploads must survive an api restart (named volume, not tmpfs)
node tooling/audit-zt/media-persist.mjs upload "$E/media-persist.state" < /dev/null > "$E/media-persist.txt" 2>&1
docker restart twinmos-lab-api-1 >> "$E/media-persist.txt" 2>&1
for i in $(seq 1 30); do [ "$(docker inspect -f '{{.State.Health.Status}}' twinmos-lab-api-1)" = healthy ] && break; sleep 2; done
node tooling/audit-zt/media-persist.mjs verify "$E/media-persist.state" "$E/media-persist.json" < /dev/null >> "$E/media-persist.txt" 2>&1; echo "media-persist rc=$?"
# backup + DR drill with the production scripts against the lab stack
LABC="docker compose -p twinmos-lab --env-file tooling/audit-zt/lab/lab.vars -f deploy/compose/docker-compose.yml -f deploy/compose/docker-compose.prod.yml -f tooling/audit-zt/lab/docker-compose.lab.yml"
TWINMOS_COMPOSE="$LABC" BACKUP_ROOT="$PWD/$E/backup" bash deploy/backup.sh > "$E/backup.log" 2>&1; echo "backup rc=$?"
TWINMOS_COMPOSE="$LABC" bash deploy/restore.sh --drill "$(ls -d "$E"/backup/20* | tail -1)" > "$E/restore-drill.log" 2>&1; echo "restore-drill rc=$?"
ZT_MAX_PAGES=700 bash tooling/audit-zt/run-in-browser.sh tooling/audit-zt/crawl.mjs "$E/crawl" > "$E/crawl.log" 2>&1; echo "crawl rc=$?"
