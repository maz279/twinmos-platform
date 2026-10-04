# TwinMOS Website — DR Drill Procedure

**Document ID:** H.4-005  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteDisasterRecoveryPlan.md · TwinMOSWebsiteBackupRestoreRunbook.md · TwinMOSWebsiteHetznerProvisioningGuide.md

---

## 1. Purpose

This document defines procedures for conducting DR drills to validate that:

1. Recovery procedures documented in the Disaster Recovery Plan are accurate and executable
2. RTO ≤ 4 hours and RPO ≤ 15 minutes can be achieved in practice
3. The team can confidently execute recovery under pressure
4. Any gaps in tooling, documentation, or access are discovered before a real incident

**Principle:** A DR plan that has never been tested is a theory, not a capability. Drills turn theory into muscle memory.

---

## 2. Drill Schedule

| Drill | Type | Duration | Date |
|-------|------|----------|------|
| Pre-Phase 1 launch drill | Full DR drill | 4 hours | Month 5 (before go-live) |
| Post-Phase 1 | Tabletop | 30 min | Month 6 |
| Pre-Phase 2 | Backup restore drill | 2 hours | Month 9 |
| Quarterly | Tabletop | 30 min | Month 12 |
| Pre-Phase 3 | Full DR drill | 4 hours | Month 15 |
| Ongoing quarterly | Tabletop alternating with backup restore | 30–120 min | Q4, Q8, Q12... |

---

## 3. Drill Types

### Type A — Tabletop Drill (30 min)

**What it is:** Verbal walkthrough of the DR Plan with team present. No actual infrastructure changes.

**Participants:** Tech Lead, Developer B, Chairman (observer)

**Agenda:**
```
1. Read §5 of TwinMOSWebsiteDisasterRecoveryPlan.md aloud (15 min)
   - Each person identifies steps they could not complete (missing access, unclear instructions)
   - Flag any tool/credential gaps

2. Quiz: Tech Lead asks questions (15 min)
   - "Where is the GPG passphrase stored?"
   - "Which B2 bucket stores PostgreSQL backups?"
   - "What DNS records need updating after full DR?"
   - "What is the Hetzner console URL?"
   - "How do you trigger a manual Coolify deploy?"
   - "What is the Cloudflare Zone ID used for?"

3. Action items: Document any gaps found
```

**Pass criteria:** All participants can answer questions correctly; no critical access gaps identified.

---

### Type B — Backup Restore Drill (2 hours)

**What it is:** Download and restore the most recent production backup to the dev environment. Verify data integrity.

**Participants:** Tech Lead (lead), Developer B (observer/verifier)

**Infrastructure used:** twinmos-dev server (CX22) — not production

**Risk:** Low. Dev environment only. No production impact.

---

### Type C — Full DR Drill (4 hours)

**What it is:** Simulate complete Hetzner production server failure. Provision a new server from scratch, restore data, switch DNS, run smoke tests. Measures actual RTO against the ≤ 4h target.

**Participants:** Tech Lead (lead), Developer B (second)

**Infrastructure used:** Spare Hetzner CX32 provisioned for drill purposes (€13.10/mo billed for ~1 day = ~$0.43)

**Risk:** Medium. DNS is temporarily switched to drill server. Coordinates with team to minimize user impact.

---

## 4. Pre-Drill Checklist (All Drill Types)

Complete at least 24 hours before any drill:

```
□ Announce drill in Slack #ops:
  "DR drill scheduled for [date/time UTC]. 
   Type: [A/B/C]. Expected duration: [X] hours.
   No deployments during drill window."

□ Confirm access (all participants):
  □ Bitwarden access: GPG passphrase + DB password readable
  □ Hetzner Cloud Console access: Can create servers
  □ B2 CLI authorized on test machine: b2 ls twinmos-backups-prod/daily/
  □ Cloudflare DNS edit access: Can update A records
  □ GitHub Actions manual trigger access

□ Verify latest backup exists:
  b2 ls --long twinmos-backups-prod/daily/ | sort -r | head -3
  (Should show backup from last 24h)

□ Set up timer tool (phone stopwatch or shared Google Doc timer)

□ For Type C: Budget approval for temporary spare server (~$1 cost)

□ For Type C: Schedule during low-traffic window (Tue/Wed 08:00–14:00 UTC)
  Notify sales/support: "Brief planned DNS maintenance [date] [window] UTC"
```

---

## 5. Type B — Backup Restore Drill (Detailed Procedure)

### Objective

Verify that the most recent production backup can be downloaded, decrypted, and restored to a PostgreSQL instance on the dev server — and that data integrity is confirmed.

### Time Target

| Phase | Target Time |
|-------|-------------|
| Download + decrypt backup | T+30 min |
| Restore PostgreSQL | T+60 min |
| Verify data integrity | T+90 min |
| Cleanup | T+120 min |

### Procedure

```bash
# ---- SETUP ---- (on twinmos-dev server)
ssh deploy@<dev-server-ip>

DRILL_DB="strapi_drill_$(date +%Y%m%d)"
DRILL_DIR="/tmp/drill-$(date +%Y%m%d)"
mkdir -p "${DRILL_DIR}"

# Record start time
START_TIME=$(date +%s)
echo "Drill started: $(date -u)"

# ---- STEP 1: Identify and download backup ----
echo "=== T+0: Listing available backups ==="
b2 ls --long twinmos-backups-prod/daily/ | sort -r | head -5

# Choose the latest backup
BACKUP_FILE="daily/pg_backup_YYYYMMDD_020000.tar.gpg"  # FILL IN from listing

echo "=== Downloading backup ==="
b2 download-file-by-name \
  twinmos-backups-prod \
  "${BACKUP_FILE}" \
  "${DRILL_DIR}/backup.tar.gpg"

echo "Download complete. File size: $(du -sh ${DRILL_DIR}/backup.tar.gpg | cut -f1)"
echo "Elapsed: $(( ($(date +%s) - START_TIME) / 60 )) minutes"

# ---- STEP 2: Decrypt ----
echo "=== Decrypting backup ==="
read -s -p "Enter GPG passphrase (from Bitwarden): " GPG_PASS; echo

gpg --decrypt \
    --passphrase "${GPG_PASS}" \
    --batch \
    "${DRILL_DIR}/backup.tar.gpg" \
    > "${DRILL_DIR}/backup.tar"

tar -xf "${DRILL_DIR}/backup.tar" -C "${DRILL_DIR}/"

DUMP_FILE=$(ls "${DRILL_DIR}"/pg_backup_*.dump 2>/dev/null | head -1)
if [[ -z "${DUMP_FILE}" ]]; then
  echo "ERROR: No .dump file found after extraction"
  ls -la "${DRILL_DIR}/"
  exit 1
fi
echo "Dump file: ${DUMP_FILE} ($(du -sh ${DUMP_FILE} | cut -f1))"
echo "Elapsed: $(( ($(date +%s) - START_TIME) / 60 )) minutes"

# ---- STEP 3: Create drill database ----
echo "=== Creating drill database: ${DRILL_DB} ==="
docker exec twinmos-postgres-dev-1 psql -U strapi_user -c \
  "CREATE DATABASE ${DRILL_DB} OWNER strapi_user;"

# ---- STEP 4: Restore ----
echo "=== Restoring PostgreSQL ==="
docker exec -i twinmos-postgres-dev-1 pg_restore \
  --username=strapi_user \
  --dbname="${DRILL_DB}" \
  --no-owner \
  --verbose \
  2>&1 | tail -20 \
  < "${DUMP_FILE}"

RESTORE_EXIT=$?
echo "pg_restore exit code: ${RESTORE_EXIT}"
echo "Elapsed: $(( ($(date +%s) - START_TIME) / 60 )) minutes"

# ---- STEP 5: Verify data integrity ----
echo "=== Data integrity verification ==="

# Count rows in key tables
echo "Products:"
docker exec twinmos-postgres-dev-1 psql -U strapi_user "${DRILL_DB}" -t -c \
  "SELECT count(*) FROM products;" 2>/dev/null || echo "Table not found"

echo "Uploaded files:"
docker exec twinmos-postgres-dev-1 psql -U strapi_user "${DRILL_DB}" -t -c \
  "SELECT count(*) FROM files;" 2>/dev/null || echo "Table not found"

echo "Strapi users:"
docker exec twinmos-postgres-dev-1 psql -U strapi_user "${DRILL_DB}" -t -c \
  "SELECT count(*) FROM admin_users;" 2>/dev/null || echo "Table not found"

# Verify schema version matches
echo "Strapi schema version:"
docker exec twinmos-postgres-dev-1 psql -U strapi_user "${DRILL_DB}" -t -c \
  "SELECT value FROM strapi_migrations ORDER BY id DESC LIMIT 1;" 2>/dev/null || echo "Migration table not found"

ELAPSED=$(( ($(date +%s) - START_TIME) / 60 ))
echo "=== Verification complete. Elapsed: ${ELAPSED} minutes ==="

# ---- STEP 6: Cleanup ----
docker exec twinmos-postgres-dev-1 psql -U strapi_user -c \
  "DROP DATABASE ${DRILL_DB};"
rm -rf "${DRILL_DIR}"
echo "Cleanup complete"

# ---- STEP 7: Record results ----
echo ""
echo "==== DRILL RESULTS ===="
echo "Total elapsed: ${ELAPSED} min"
echo "Backup date: $(echo ${BACKUP_FILE} | grep -oP '\d{8}')"
echo "Dump file size: $(du -sh ${DUMP_FILE} | cut -f1)"
echo "pg_restore exit code: ${RESTORE_EXIT}"
```

### Type B Pass Criteria

```
□ Backup downloaded successfully
□ GPG decryption successful (no passphrase errors)
□ pg_restore exit code = 0
□ Products table row count > 0
□ Total time < 90 minutes
□ No data integrity errors reported
```

---

## 6. Type C — Full DR Drill (Detailed Procedure)

### Objective

Simulate production server total failure. Provision replacement server, restore data, switch DNS, confirm services healthy — all within 4 hours.

### Time Target Summary

| Milestone | T+ Target |
|-----------|-----------|
| New server provisioned and SSH accessible | T+20 min |
| Coolify installed and running | T+30 min |
| B2 backup downloaded and decrypted | T+50 min |
| PostgreSQL restored | T+80 min |
| All services deployed via Coolify | T+140 min |
| MeiliSearch index restored | T+160 min |
| DNS updated to new server | T+170 min |
| HTTPS verified from external network | T+175 min |
| Smoke tests passing | T+200 min |
| **Drill declared complete** | **≤ T+240 min** |

### Pre-Drill Actions (30 min before T+0)

```bash
# On Tech Lead laptop — verify all credentials accessible:

echo "=== Credential check ==="

# 1. GPG passphrase (from Bitwarden)
echo "GPG passphrase: accessible? [manual check]"

# 2. B2 restore key
b2 ls twinmos-backups-prod/daily/ | tail -2
echo "B2 access: OK"

# 3. Cloudflare DNS API token test
curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq '.success'
echo "Cloudflare API: OK"

# 4. Hetzner API key test
curl -s -H "Authorization: Bearer ${HETZNER_API_TOKEN}" \
  "https://api.hetzner.cloud/v1/servers" | jq '.servers | length'
echo "Hetzner API: OK"

# Record current production server state for comparison
PROD_IP="<current-production-ip>"
echo "Production IP: ${PROD_IP}"
echo "Production product count:"
curl -s "https://api.twinmos.com/api/products?pagination[pageSize]=1" | jq '.meta.pagination.total'
```

### T+0 — Drill Start

```bash
echo "=== T+0 DR DRILL START: $(date -u) ==="
DRILL_START=$(date +%s)

# Announce in Slack #ops (if not already done):
# "DR drill starting now. DNS will be briefly updated to drill server.
#  Website may be briefly unreachable for 5-10 min around T+170.
#  Normal operations resume at end of drill."
```

### T+0 to T+20 — Provision Server

```bash
# Option A: Via Hetzner Cloud API (fastest)
HETZNER_API_TOKEN="<your-token>"

curl -s -X POST "https://api.hetzner.cloud/v1/servers" \
  -H "Authorization: Bearer ${HETZNER_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "twinmos-dr-drill-'$(date +%Y%m%d)'",
    "server_type": "cx32",
    "image": "ubuntu-24.04",
    "location": "nbg1",
    "ssh_keys": ["twinmos-deploy-key"],
    "firewalls": [{"firewall": {"id": <firewall-id>}}],
    "user_data": "<cloud-init-yaml-base64-encoded>"
  }' | jq '{id: .server.id, ip: .server.public_net.ipv4.ip, status: .server.status}'

# Wait for server to become available
# Poll every 15 seconds
while true; do
  STATUS=$(curl -s "https://api.hetzner.cloud/v1/servers/${SERVER_ID}" \
    -H "Authorization: Bearer ${HETZNER_API_TOKEN}" | jq -r '.server.status')
  echo "Server status: ${STATUS} ($(( ($(date +%s) - DRILL_START) / 60 )) min elapsed)"
  [[ "${STATUS}" == "running" ]] && break
  sleep 15
done

DRILL_IP=$(curl -s "https://api.hetzner.cloud/v1/servers/${SERVER_ID}" \
  -H "Authorization: Bearer ${HETZNER_API_TOKEN}" | jq -r '.server.public_net.ipv4.ip')

echo "Server ready: ${DRILL_IP}"
echo "T+$(( ($(date +%s) - DRILL_START) / 60 )) min"
```

### T+20 to T+30 — Install Coolify

```bash
ssh deploy@${DRILL_IP} "
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
"

# Wait for Coolify to be accessible
for i in {1..20}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://${DRILL_IP}:8000" 2>/dev/null)
  echo "Coolify status: ${STATUS} (${i}0s)"
  [[ "${STATUS}" == "200" || "${STATUS}" == "302" ]] && break
  sleep 10
done

echo "Coolify ready at http://${DRILL_IP}:8000"
echo "T+$(( ($(date +%s) - DRILL_START) / 60 )) min"
```

### T+30 to T+80 — Restore PostgreSQL

```bash
# Follow TwinMOSWebsiteBackupRestoreRunbook.md §4.1 steps 1–9
# On DRILL server, not production
ssh deploy@${DRILL_IP}

# Set GPG passphrase (prompt from Bitwarden)
read -s -p "GPG passphrase: " GPG_PASS; echo

# Download latest backup
LATEST=$(b2 ls --long twinmos-backups-prod/daily/ | sort -r | head -1 | awk '{print $NF}')
b2 download-file-by-name twinmos-backups-prod "${LATEST}" /tmp/backup.tar.gpg

# Decrypt and restore
gpg --decrypt --passphrase "${GPG_PASS}" --batch \
    /tmp/backup.tar.gpg > /tmp/backup.tar
tar -xf /tmp/backup.tar -C /tmp/

# Start PostgreSQL
docker run -d \
  --name twinmos-postgres-1 \
  -e POSTGRES_USER=strapi_user \
  -e POSTGRES_PASSWORD=<from-bitwarden> \
  -e POSTGRES_DB=strapi_prod \
  -v twinmos-postgres-data:/var/lib/postgresql/data \
  postgres:16

sleep 15

DUMP_FILE=$(ls /tmp/pg_backup_*.dump | head -1)
docker exec -i twinmos-postgres-1 pg_restore \
  --username=strapi_user \
  --dbname=strapi_prod \
  --no-owner < "${DUMP_FILE}"

# Verify
PRODUCT_COUNT=$(docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -t -c \
  "SELECT count(*) FROM products;" 2>/dev/null | tr -d ' ')
echo "Products restored: ${PRODUCT_COUNT}"
echo "T+$(( ($(date +%s) - DRILL_START) / 60 )) min"
```

### T+80 to T+140 — Deploy Services via Coolify

```bash
# Open Coolify at http://${DRILL_IP}:8000
# Complete initial setup wizard (email, password)
# Register localhost as server (deploy user SSH key)

# Deploy services in this order:
# 1. PostgreSQL (already running — register in Coolify to manage)
# 2. Redis
# 3. MeiliSearch
# 4. ImgProxy
# 5. Strapi
# 6. Plausible + ClickHouse

# Verify each service health:
curl -s http://${DRILL_IP}:1337/api/_health | jq '.data.server'
# Expected: "running"

curl -s http://${DRILL_IP}:7700/health | jq '.status'
# Expected: "available"

echo "T+$(( ($(date +%s) - DRILL_START) / 60 )) min"
```

### T+140 to T+160 — Restore MeiliSearch Index

```bash
# Download and restore MeiliSearch backup
# Follow TwinMOSWebsiteBackupRestoreRunbook.md §4.3
LATEST_MEILI=$(b2 ls --long twinmos-backups-prod/meilisearch/ | sort -r | head -1 | awk '{print $NF}')
b2 download-file-by-name twinmos-backups-prod "${LATEST_MEILI}" /tmp/meili.dump.gpg
gpg --decrypt --passphrase "${GPG_PASS}" --batch /tmp/meili.dump.gpg > /tmp/meili.dump
docker cp /tmp/meili.dump twinmos-meilisearch-1:/meili_data/dumps/restore.dump
curl -X POST http://localhost:7700/dumps/restore \
  -H "Authorization: Bearer ${MEILI_MASTER_KEY}" \
  -d '{"dumpUid": "restore"}'

echo "T+$(( ($(date +%s) - DRILL_START) / 60 )) min"
```

### T+160 to T+170 — Update DNS (Critical Step)

```bash
# Update Cloudflare DNS to point to DRILL server
# Two-person confirmation required before executing

echo "=== DNS CUTOVER CONFIRMATION ==="
echo "About to update DNS from ${PROD_IP} → ${DRILL_IP}"
echo "This will redirect live traffic to drill server for ~10-15 minutes"
read -p "Tech Lead confirms (yes/no): " LEAD_CONFIRM
read -p "Developer B confirms (yes/no): " DEV_CONFIRM

if [[ "${LEAD_CONFIRM}" == "yes" ]] && [[ "${DEV_CONFIRM}" == "yes" ]]; then
  # Update DNS via Cloudflare API
  for RECORD_NAME in api admin search imgproxy analytics coolify; do
    RECORD_ID=$(curl -s \
      "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${RECORD_NAME}.twinmos.com" \
      -H "Authorization: Bearer ${CF_API_TOKEN}" | jq -r '.result[0].id')

    curl -s -X PUT \
      "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${RECORD_ID}" \
      -H "Authorization: Bearer ${CF_API_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"type\":\"A\",\"name\":\"${RECORD_NAME}.twinmos.com\",\"content\":\"${DRILL_IP}\",\"proxied\":true}" \
      | jq '.success'
  done
  echo "DNS updated to drill server: ${DRILL_IP}"
else
  echo "DNS update cancelled"
fi

echo "T+$(( ($(date +%s) - DRILL_START) / 60 )) min"
```

### T+170 to T+200 — Verify and Smoke Tests

```bash
# From external network (use mobile phone hotspot for true external test)

# API health via Cloudflare
curl https://api.twinmos.com/api/_health
# Expected: {"data":{"server":"running"}}

# Search health
curl https://search.twinmos.com/health
# Expected: {"status":"available"}

# Verify SSL
echo | openssl s_client -connect api.twinmos.com:443 2>/dev/null | grep "notAfter"

# Verify Cloudflare is serving (not direct to origin)
curl -sI https://twinmos.com | grep "cf-ray"

# Run smoke tests (Playwright)
cd twinmos-frontend
pnpm exec playwright test tests/smoke/ --reporter=list

echo "T+$(( ($(date +%s) - DRILL_START) / 60 )) min"
```

### T+200 — Declare Drill Complete (or Fail)

```bash
TOTAL_ELAPSED=$(( ($(date +%s) - DRILL_START) / 60 ))
echo "=== DRILL COMPLETE: ${TOTAL_ELAPSED} minutes ==="
```

### T+200 — Restore Production DNS (MANDATORY)

```bash
# IMMEDIATELY after declaring drill complete, restore DNS to production server

for RECORD_NAME in api admin search imgproxy analytics coolify; do
  RECORD_ID=$(curl -s \
    "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${RECORD_NAME}.twinmos.com" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" | jq -r '.result[0].id')

  curl -s -X PUT \
    "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${RECORD_ID}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"A\",\"name\":\"${RECORD_NAME}.twinmos.com\",\"content\":\"${PROD_IP}\",\"proxied\":true}" \
    | jq '.success'
done

echo "DNS restored to production: ${PROD_IP}"

# Verify production API health
curl https://api.twinmos.com/api/_health
```

### T+210 — Delete Drill Server

```bash
# Delete drill server from Hetzner to avoid ongoing charges
curl -X DELETE \
  "https://api.hetzner.cloud/v1/servers/${SERVER_ID}" \
  -H "Authorization: Bearer ${HETZNER_API_TOKEN}"

echo "Drill server deleted"
```

---

## 7. Drill Acceptance Criteria

### Type A (Tabletop)

```
□ All participants can identify where GPG passphrase is stored
□ All participants know which B2 bucket contains PostgreSQL backups
□ All participants know which Cloudflare DNS records to update
□ No critical access gaps identified
□ Any documentation gaps recorded as action items
```

### Type B (Backup Restore)

```
□ Latest daily backup downloaded successfully
□ GPG decryption successful — no errors
□ pg_restore exit code = 0 (or only non-critical warnings)
□ Products table row count > 0
□ schema version table present
□ Total elapsed time < 90 minutes
```

### Type C (Full DR)

```
□ Server provisioned within T+20
□ Coolify running within T+30
□ PostgreSQL restored within T+80
□ All services healthy within T+140
□ Smoke tests passing within T+200
□ Total elapsed time ≤ T+240 (RTO ≤ 4 hours)
□ DNS restored to production immediately after drill
□ Production verified healthy after DNS restore
□ Drill server deleted within T+210
```

---

## 8. Post-Drill Report Template

```markdown
# DR Drill Report — [Date]

**Drill type:** [A / B / C]
**Lead engineer:** [name]
**Participants:** [names]
**Total elapsed time:** [X min / h:mm]
**Result:** PASS / FAIL

## Timeline

| T+ (min) | Milestone | Target | Actual | Delta |
|----------|-----------|--------|--------|-------|
| T+20 | Server provisioned | 20 min | [X] min | [±] |
| T+30 | Coolify running | 30 min | [X] min | [±] |
| T+80 | PostgreSQL restored | 80 min | [X] min | [±] |
| T+140 | All services healthy | 140 min | [X] min | [±] |
| T+200 | Smoke tests passing | 200 min | [X] min | [±] |
| T+240 | Drill complete | ≤ 240 min | [X] min | [±] |

## Issues Encountered

| Issue | Impact | Resolution | Runbook Update Needed? |
|-------|--------|------------|----------------------|
| [issue] | [Low/Med/High] | [how resolved] | [Yes/No] |

## What Went Well

- [item]
- [item]

## What Needs Improvement

- [item]
- [item]

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| [action] | [name] | [date] |

## Metrics

- Backup age at time of restore: [X hours old]
- Products in restored DB: [count]
- Products in production DB: [count]
- Match: [Yes/No]

## Next Drill

Date: [scheduled date]  
Type: [A/B/C]
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §23.3*
