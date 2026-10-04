# TwinMOS Website — Backup & Restore Runbook

**Document ID:** H.4-003  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteBackblazeB2Bucket_Spec.md · TwinMOSWebsiteDisasterRecoveryPlan.md · TwinMOSWebsiteCoolifyConfigurationGuide.md · TwinMOSWebsiteHetznerProvisioningGuide.md

---

## 1. Backup Strategy Overview

### 1.1 Backup Targets

| Component | What Is Backed Up | Method | RPO |
|-----------|------------------|--------|-----|
| PostgreSQL 16 | All databases (strapi_prod, plausible) | pg_dump + WAL archiving | ≤ 15 min |
| MeiliSearch 1.13 | Product search index + settings | MeiliSearch dump API | ≤ 24 h |
| Strapi media | Product images, datasheets, team photos | Backblaze B2 (live — no separate backup needed) | Real-time |
| Coolify configuration | Application definitions, env vars, secrets | Coolify export + tar | ≤ 24 h |
| Redis | Session cache only (ephemeral) | Not backed up — stateless | N/A |

### 1.2 Backup Schedule

| Backup Type | Schedule | Retention | Storage Location |
|-------------|----------|-----------|-----------------|
| PostgreSQL full dump (daily) | 02:00 UTC daily | 30 days | B2: `twinmos-backups-prod/daily/` |
| PostgreSQL full dump (monthly) | 1st of month 02:30 UTC | 12 months | B2: `twinmos-backups-prod/monthly/` |
| PostgreSQL WAL archive | Continuous (every 15 min) | 7 days | B2: `twinmos-backups-prod/wal/` |
| MeiliSearch dump | 03:00 UTC daily | 30 days | B2: `twinmos-backups-prod/meilisearch/` |
| Coolify config export | 04:00 UTC daily | 90 days | B2: `twinmos-backups-prod/coolify/` |

### 1.3 Encryption

All backup files are encrypted with GPG AES-256 before upload to B2.

```
GPG passphrase: Stored in Bitwarden → TwinMOS Vault → Infrastructure → GPG Backup Passphrase
Minimum length: 32 characters (randomly generated)
Never stored in code, env files, or CI secrets — only Bitwarden + Coolify secrets
```

---

## 2. Cron Job Setup

### 2.1 Install Backup Scripts

```bash
# SSH to Hetzner production server
ssh deploy@<server-ip>

# Create backup scripts directory
sudo mkdir -p /opt/twinmos/backup
sudo chown deploy:deploy /opt/twinmos/backup

# Upload scripts from this runbook (copy content below into each file)
nano /opt/twinmos/backup/backup-postgres.sh
nano /opt/twinmos/backup/backup-meilisearch.sh
nano /opt/twinmos/backup/backup-coolify-config.sh
nano /opt/twinmos/backup/verify-backup.sh

# Make executable
chmod +x /opt/twinmos/backup/*.sh
```

### 2.2 Crontab Configuration

```bash
# Edit deploy user crontab
crontab -e

# Add these lines:
# Daily PostgreSQL backup at 02:00 UTC
0 2 * * * /opt/twinmos/backup/backup-postgres.sh >> /var/log/twinmos-backup.log 2>&1

# Monthly PostgreSQL backup on 1st of month at 02:30 UTC
30 2 1 * * /opt/twinmos/backup/backup-postgres.sh --monthly >> /var/log/twinmos-backup.log 2>&1

# MeiliSearch dump at 03:00 UTC
0 3 * * * /opt/twinmos/backup/backup-meilisearch.sh >> /var/log/twinmos-backup.log 2>&1

# Coolify config at 04:00 UTC
0 4 * * * /opt/twinmos/backup/backup-coolify-config.sh >> /var/log/twinmos-backup.log 2>&1

# Backup verification at 06:00 UTC (after all backups complete)
0 6 * * * /opt/twinmos/backup/verify-backup.sh >> /var/log/twinmos-backup.log 2>&1
```

---

## 3. Backup Scripts

### 3.1 backup-postgres.sh

```bash
#!/usr/bin/env bash
# /opt/twinmos/backup/backup-postgres.sh
# PostgreSQL full dump with GPG encryption and B2 upload

set -euo pipefail

# ---- Configuration ----
POSTGRES_CONTAINER="twinmos-postgres-1"
POSTGRES_USER="strapi_user"
POSTGRES_DB="strapi_prod"
PLAUSIBLE_DB="plausible"
BACKUP_TEMP_DIR="/tmp/twinmos-backup"
B2_BUCKET="twinmos-backups-prod"
SLACK_WEBHOOK="${SLACK_WEBHOOK_OPS:-}"

# From Coolify environment (inject via systemd or .env file)
GPG_BACKUP_PASSPHRASE="${GPG_BACKUP_PASSPHRASE}"

MONTHLY=false
if [[ "${1:-}" == "--monthly" ]]; then
  MONTHLY=true
fi

TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
DATE_PREFIX=$(date -u +%Y%m%d)
YEAR_MONTH=$(date -u +%Y%m)

# ---- Helpers ----
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

notify_slack() {
  local message="$1"
  if [[ -n "${SLACK_WEBHOOK}" ]]; then
    curl -s -X POST "${SLACK_WEBHOOK}" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"${message}\"}" > /dev/null
  fi
}

# ---- Setup temp directory ----
mkdir -p "${BACKUP_TEMP_DIR}"
trap 'rm -rf "${BACKUP_TEMP_DIR}"' EXIT

# ---- Dump PostgreSQL ----
log "Starting PostgreSQL dump: ${POSTGRES_DB}"

DUMP_FILE="${BACKUP_TEMP_DIR}/pg_backup_${TIMESTAMP}.dump"

docker exec "${POSTGRES_CONTAINER}" pg_dump \
  --username="${POSTGRES_USER}" \
  --format=custom \
  --compress=9 \
  "${POSTGRES_DB}" \
  > "${DUMP_FILE}"

if [[ ! -s "${DUMP_FILE}" ]]; then
  log "ERROR: pg_dump produced empty file"
  notify_slack "⚠️ TwinMOS BACKUP FAILED: pg_dump empty output (${POSTGRES_DB})"
  exit 1
fi

DUMP_SIZE=$(du -sh "${DUMP_FILE}" | cut -f1)
log "Dump complete: ${DUMP_SIZE}"

# ---- Also dump Plausible DB ----
PLAUSIBLE_DUMP="${BACKUP_TEMP_DIR}/pg_plausible_${TIMESTAMP}.dump"
docker exec "${POSTGRES_CONTAINER}" pg_dump \
  --username="${POSTGRES_USER}" \
  --format=custom \
  --compress=9 \
  "${PLAUSIBLE_DB}" \
  > "${PLAUSIBLE_DUMP}" || log "WARN: Plausible dump failed (non-critical)"

# ---- Combine dumps into tar ----
ARCHIVE_FILE="${BACKUP_TEMP_DIR}/pg_all_${TIMESTAMP}.tar"
tar -cf "${ARCHIVE_FILE}" -C "${BACKUP_TEMP_DIR}" \
  "$(basename ${DUMP_FILE})" \
  "$(basename ${PLAUSIBLE_DUMP})" 2>/dev/null || true

# ---- GPG encrypt ----
ENCRYPTED_FILE="${ARCHIVE_FILE}.gpg"
gpg --symmetric \
    --cipher-algo AES256 \
    --compress-algo none \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch \
    --yes \
    -o "${ENCRYPTED_FILE}" \
    "${ARCHIVE_FILE}"

ENCRYPTED_SIZE=$(du -sh "${ENCRYPTED_FILE}" | cut -f1)
log "Encryption complete: ${ENCRYPTED_SIZE}"

# ---- Upload to B2 ----
if $MONTHLY; then
  B2_PATH="monthly/pg_backup_${YEAR_MONTH}_monthly.tar.gpg"
else
  B2_PATH="daily/pg_backup_${TIMESTAMP}.tar.gpg"
fi

b2 upload-file \
  --noProgress \
  "${B2_BUCKET}" \
  "${ENCRYPTED_FILE}" \
  "${B2_PATH}"

log "Upload complete: b2://${B2_BUCKET}/${B2_PATH}"

# ---- Cleanup old backups (daily: keep 30 days) ----
if ! $MONTHLY; then
  CUTOFF=$(date -u -d '30 days ago' +%Y%m%d)
  log "Cleaning up daily backups older than ${CUTOFF}"
  b2 ls --long "${B2_BUCKET}/daily/" | while read -r _size _date _sha _action filename; do
    # Extract date from filename: pg_backup_20260101_020000.tar.gpg
    FILE_DATE=$(basename "${filename}" | grep -oP '\d{8}' | head -1)
    if [[ -n "${FILE_DATE}" ]] && [[ "${FILE_DATE}" < "${CUTOFF}" ]]; then
      log "Deleting old backup: ${filename}"
      b2 delete-file-version "${B2_BUCKET}" "${filename}" 2>/dev/null || true
    fi
  done
fi

log "Backup completed successfully: ${B2_PATH}"
notify_slack "✅ TwinMOS backup complete: pg_backup_${TIMESTAMP} (${ENCRYPTED_SIZE})"
```

### 3.2 backup-meilisearch.sh

```bash
#!/usr/bin/env bash
# /opt/twinmos/backup/backup-meilisearch.sh
# MeiliSearch dump via API with encryption and B2 upload

set -euo pipefail

MEILI_HOST="http://localhost:7700"
MEILI_MASTER_KEY="${MEILI_MASTER_KEY}"
GPG_BACKUP_PASSPHRASE="${GPG_BACKUP_PASSPHRASE}"
B2_BUCKET="twinmos-backups-prod"
BACKUP_TEMP_DIR="/tmp/twinmos-meili-backup"
SLACK_WEBHOOK="${SLACK_WEBHOOK_OPS:-}"
DUMP_TIMEOUT=300  # 5 minutes

TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

mkdir -p "${BACKUP_TEMP_DIR}"
trap 'rm -rf "${BACKUP_TEMP_DIR}"' EXIT

# ---- Trigger MeiliSearch dump ----
log "Triggering MeiliSearch dump"

TASK_RESPONSE=$(curl -s -X POST \
  "${MEILI_HOST}/dumps" \
  -H "Authorization: Bearer ${MEILI_MASTER_KEY}")

TASK_UID=$(echo "${TASK_RESPONSE}" | jq -r '.taskUid')

if [[ -z "${TASK_UID}" ]] || [[ "${TASK_UID}" == "null" ]]; then
  log "ERROR: Failed to trigger MeiliSearch dump: ${TASK_RESPONSE}"
  exit 1
fi

log "Dump task created: UID=${TASK_UID}"

# ---- Wait for dump to complete ----
ELAPSED=0
DUMP_STATUS=""
while [[ "${DUMP_STATUS}" != "succeeded" ]]; do
  sleep 5
  ELAPSED=$((ELAPSED + 5))

  TASK_INFO=$(curl -s \
    "${MEILI_HOST}/tasks/${TASK_UID}" \
    -H "Authorization: Bearer ${MEILI_MASTER_KEY}")

  DUMP_STATUS=$(echo "${TASK_INFO}" | jq -r '.status')
  DUMP_UID=$(echo "${TASK_INFO}" | jq -r '.details.dumpUid // empty')

  log "Dump status: ${DUMP_STATUS} (${ELAPSED}s elapsed)"

  if [[ "${DUMP_STATUS}" == "failed" ]]; then
    log "ERROR: MeiliSearch dump failed: ${TASK_INFO}"
    exit 1
  fi

  if [[ "${ELAPSED}" -ge "${DUMP_TIMEOUT}" ]]; then
    log "ERROR: Dump timed out after ${DUMP_TIMEOUT}s"
    exit 1
  fi
done

log "Dump complete. UID: ${DUMP_UID}"

# MeiliSearch dumps are stored in the data directory
# Access via docker cp
CONTAINER_DUMP_PATH="/meili_data/dumps/${DUMP_UID}.dump"
LOCAL_DUMP="${BACKUP_TEMP_DIR}/${DUMP_UID}.dump"

docker cp "twinmos-meilisearch-1:${CONTAINER_DUMP_PATH}" "${LOCAL_DUMP}"

DUMP_SIZE=$(du -sh "${LOCAL_DUMP}" | cut -f1)
log "Dump file copied: ${DUMP_SIZE}"

# ---- GPG encrypt ----
ENCRYPTED_FILE="${LOCAL_DUMP}.gpg"
gpg --symmetric \
    --cipher-algo AES256 \
    --compress-algo none \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch \
    --yes \
    -o "${ENCRYPTED_FILE}" \
    "${LOCAL_DUMP}"

# ---- Upload to B2 ----
B2_PATH="meilisearch/meili_dump_${TIMESTAMP}.dump.gpg"
b2 upload-file --noProgress "${B2_BUCKET}" "${ENCRYPTED_FILE}" "${B2_PATH}"

log "MeiliSearch backup complete: b2://${B2_BUCKET}/${B2_PATH}"

# ---- Cleanup old dumps in MeiliSearch data dir ----
docker exec twinmos-meilisearch-1 find /meili_data/dumps -name "*.dump" -mtime +7 -delete 2>/dev/null || true

# ---- Cleanup old B2 entries (30 days) ----
CUTOFF=$(date -u -d '30 days ago' +%Y%m%d)
b2 ls --long "${B2_BUCKET}/meilisearch/" | while read -r _size _date _sha _action filename; do
  FILE_DATE=$(basename "${filename}" | grep -oP '\d{8}' | head -1)
  if [[ -n "${FILE_DATE}" ]] && [[ "${FILE_DATE}" < "${CUTOFF}" ]]; then
    b2 delete-file-version "${B2_BUCKET}" "${filename}" 2>/dev/null || true
  fi
done
```

### 3.3 backup-coolify-config.sh

```bash
#!/usr/bin/env bash
# /opt/twinmos/backup/backup-coolify-config.sh
# Exports Coolify configuration and uploads encrypted archive to B2

set -euo pipefail

BACKUP_TEMP_DIR="/tmp/twinmos-coolify-backup"
B2_BUCKET="twinmos-backups-prod"
GPG_BACKUP_PASSPHRASE="${GPG_BACKUP_PASSPHRASE}"
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

mkdir -p "${BACKUP_TEMP_DIR}"
trap 'rm -rf "${BACKUP_TEMP_DIR}"' EXIT

log "Exporting Coolify configuration"

# Coolify stores its config in /data/coolify
# This includes application definitions, service configs, SSL certs
ARCHIVE_FILE="${BACKUP_TEMP_DIR}/coolify_config_${TIMESTAMP}.tar.gz"

tar -czf "${ARCHIVE_FILE}" \
  /data/coolify/applications \
  /data/coolify/services \
  /data/coolify/.env \
  2>/dev/null || true

ARCHIVE_SIZE=$(du -sh "${ARCHIVE_FILE}" | cut -f1)
log "Coolify config archived: ${ARCHIVE_SIZE}"

# ---- GPG encrypt ----
ENCRYPTED_FILE="${ARCHIVE_FILE}.gpg"
gpg --symmetric \
    --cipher-algo AES256 \
    --compress-algo none \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch \
    --yes \
    -o "${ENCRYPTED_FILE}" \
    "${ARCHIVE_FILE}"

# ---- Upload to B2 ----
B2_PATH="coolify/coolify_config_${TIMESTAMP}.tar.gz.gpg"
b2 upload-file --noProgress "${B2_BUCKET}" "${ENCRYPTED_FILE}" "${B2_PATH}"

log "Coolify backup complete: b2://${B2_BUCKET}/${B2_PATH}"

# ---- Cleanup old B2 entries (90 days) ----
CUTOFF=$(date -u -d '90 days ago' +%Y%m%d)
b2 ls --long "${B2_BUCKET}/coolify/" | while read -r _size _date _sha _action filename; do
  FILE_DATE=$(basename "${filename}" | grep -oP '\d{8}' | head -1)
  if [[ -n "${FILE_DATE}" ]] && [[ "${FILE_DATE}" < "${CUTOFF}" ]]; then
    b2 delete-file-version "${B2_BUCKET}" "${filename}" 2>/dev/null || true
  fi
done
```

### 3.4 verify-backup.sh

```bash
#!/usr/bin/env bash
# /opt/twinmos/backup/verify-backup.sh
# Verifies yesterday's backup exists and is non-zero size

set -euo pipefail

B2_BUCKET="twinmos-backups-prod"
SLACK_WEBHOOK="${SLACK_WEBHOOK_OPS:-}"
YESTERDAY=$(date -u -d '1 day ago' +%Y%m%d)

PASS=true

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

notify_slack() {
  local message="$1"
  if [[ -n "${SLACK_WEBHOOK}" ]]; then
    curl -s -X POST "${SLACK_WEBHOOK}" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"${message}\"}" > /dev/null
  fi
}

# Check PostgreSQL backup
log "Checking PostgreSQL backup for ${YESTERDAY}"
PG_COUNT=$(b2 ls "${B2_BUCKET}/daily/" | grep "pg_backup_${YESTERDAY}" | wc -l)
if [[ "${PG_COUNT}" -eq 0 ]]; then
  log "MISSING: PostgreSQL backup for ${YESTERDAY}"
  notify_slack "🚨 TwinMOS: PostgreSQL backup MISSING for ${YESTERDAY}"
  PASS=false
else
  log "OK: PostgreSQL backup found (${PG_COUNT} file(s))"
fi

# Check MeiliSearch backup
log "Checking MeiliSearch backup for ${YESTERDAY}"
MEILI_COUNT=$(b2 ls "${B2_BUCKET}/meilisearch/" | grep "meili_dump_${YESTERDAY}" | wc -l)
if [[ "${MEILI_COUNT}" -eq 0 ]]; then
  log "MISSING: MeiliSearch backup for ${YESTERDAY}"
  notify_slack "⚠️ TwinMOS: MeiliSearch backup MISSING for ${YESTERDAY}"
  PASS=false
else
  log "OK: MeiliSearch backup found"
fi

# Check Coolify config backup
log "Checking Coolify config backup for ${YESTERDAY}"
COOLIFY_COUNT=$(b2 ls "${B2_BUCKET}/coolify/" | grep "coolify_config_${YESTERDAY}" | wc -l)
if [[ "${COOLIFY_COUNT}" -eq 0 ]]; then
  log "MISSING: Coolify config backup for ${YESTERDAY}"
  notify_slack "⚠️ TwinMOS: Coolify config backup MISSING for ${YESTERDAY}"
  PASS=false
else
  log "OK: Coolify config backup found"
fi

if $PASS; then
  log "All backups verified successfully"
else
  log "One or more backups MISSING — check alerts"
  exit 1
fi
```

---

## 4. Restore Procedures

### 4.1 Restore PostgreSQL — Full Dump Restore

**When to use:** Database corruption, accidental data deletion, DR scenario.

**Estimated time:** 20–40 minutes depending on DB size.

**Prerequisites:**
- SSH access to Hetzner production server
- GPG passphrase available (Bitwarden → TwinMOS Vault → Infrastructure → GPG Backup Passphrase)
- B2 credentials (`restore-prod-key`) available

```bash
# STEP 1: Identify backup to restore
b2 ls --long twinmos-backups-prod/daily/ | sort -r | head -10
# Select the target backup filename

BACKUP_FILE="daily/pg_backup_20260101_020000.tar.gpg"  # REPLACE with actual filename

# STEP 2: Stop Strapi to prevent writes during restore
# Via Coolify: Applications → twinmos-strapi → Stop
# Or via CLI:
docker stop twinmos-strapi-1
echo "Strapi stopped at $(date -u)"

# STEP 3: Download backup from B2
mkdir -p /tmp/twinmos-restore
b2 download-file-by-name \
  twinmos-backups-prod \
  "${BACKUP_FILE}" \
  /tmp/twinmos-restore/backup.tar.gpg

# STEP 4: Decrypt GPG archive
read -s -p "Enter GPG passphrase: " GPG_PASS
echo
gpg --decrypt \
    --passphrase "${GPG_PASS}" \
    --batch \
    /tmp/twinmos-restore/backup.tar.gpg \
    > /tmp/twinmos-restore/backup.tar

# STEP 5: Extract dump files
tar -xf /tmp/twinmos-restore/backup.tar -C /tmp/twinmos-restore/

# STEP 6: Drop and recreate database
docker exec twinmos-postgres-1 psql -U strapi_user -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'strapi_prod';"

docker exec twinmos-postgres-1 psql -U strapi_user -c \
  "DROP DATABASE IF EXISTS strapi_prod;"

docker exec twinmos-postgres-1 psql -U strapi_user -c \
  "CREATE DATABASE strapi_prod OWNER strapi_user;"

# STEP 7: Restore from dump
DUMP_FILE=$(ls /tmp/twinmos-restore/pg_backup_*.dump 2>/dev/null | head -1)
docker exec -i twinmos-postgres-1 pg_restore \
  --username=strapi_user \
  --dbname=strapi_prod \
  --no-owner \
  --role=strapi_user \
  --verbose \
  < "${DUMP_FILE}"

echo "Restore exit code: $?"

# STEP 8: Verify record counts
docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -c \
  "SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 20;"

# STEP 9: Restart Strapi
docker start twinmos-strapi-1
# Or via Coolify: Applications → twinmos-strapi → Start

# STEP 10: Verify Strapi health
sleep 30
curl https://api.twinmos.com/api/_health
# Expected: {"data":{"server":"running"}}

# STEP 11: Login to Strapi admin and spot-check content
# https://admin.twinmos.com

# STEP 12: Clean up temp files
rm -rf /tmp/twinmos-restore
```

### 4.2 Restore PostgreSQL — Point-in-Time Recovery (PITR)

**When to use:** Accidental data corruption where exact timestamp of incident is known.

**Note:** Requires WAL archives in B2 (`twinmos-backups-prod/wal/`). This is a more complex procedure — coordinate with Tech Lead before proceeding.

```bash
# PITR is performed by:
# 1. Restore the most recent full dump BEFORE the target timestamp (§4.1)
# 2. Apply WAL segments from B2 up to the target timestamp

# Download WAL segments since the base backup
TARGET_TIME="2026-01-15 14:30:00"  # REPLACE with incident time (UTC)

b2 ls twinmos-backups-prod/wal/ | while read -r wal_file; do
  b2 download-file-by-name twinmos-backups-prod "${wal_file}" "/tmp/twinmos-wal/${wal_file}"
done

# Create recovery.conf for PostgreSQL PITR
cat > /tmp/recovery.conf << EOF
restore_command = 'cp /tmp/twinmos-wal/%f %p'
recovery_target_time = '${TARGET_TIME}'
recovery_target_action = 'promote'
EOF

# Copy recovery.conf into PostgreSQL container
docker cp /tmp/recovery.conf twinmos-postgres-1:/var/lib/postgresql/data/recovery.conf

# Restart PostgreSQL to apply WAL replay
docker restart twinmos-postgres-1

# Monitor recovery progress
docker logs -f twinmos-postgres-1 | grep -E "recovery|LOG|FATAL"
```

### 4.3 Restore MeiliSearch Index

**When to use:** Search index corruption, MeiliSearch data loss, DR scenario.

**Estimated time:** 5–15 minutes.

```bash
# STEP 1: Identify latest MeiliSearch backup
b2 ls --long twinmos-backups-prod/meilisearch/ | sort -r | head -5

BACKUP_FILE="meilisearch/meili_dump_20260101_030000.dump.gpg"  # REPLACE

# STEP 2: Download and decrypt
mkdir -p /tmp/twinmos-meili-restore
b2 download-file-by-name \
  twinmos-backups-prod \
  "${BACKUP_FILE}" \
  /tmp/twinmos-meili-restore/dump.dump.gpg

read -s -p "Enter GPG passphrase: " GPG_PASS
echo
gpg --decrypt \
    --passphrase "${GPG_PASS}" \
    --batch \
    /tmp/twinmos-meili-restore/dump.dump.gpg \
    > /tmp/twinmos-meili-restore/dump.dump

# STEP 3: Copy dump into MeiliSearch container
docker cp /tmp/twinmos-meili-restore/dump.dump \
  twinmos-meilisearch-1:/meili_data/dumps/restore.dump

# STEP 4: Import dump via API
curl -X POST \
  "http://localhost:7700/dumps/restore" \
  -H "Authorization: Bearer ${MEILI_MASTER_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"dumpUid": "restore"}'

# STEP 5: Monitor import progress
TASK_UID=$(...)  # from response above
watch -n 5 "curl -s http://localhost:7700/tasks/${TASK_UID} \
  -H 'Authorization: Bearer ${MEILI_MASTER_KEY}' | jq '.status'"

# STEP 6: Verify search works
curl "https://search.twinmos.com/indexes/products/search" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"q": "DDR5"}' | jq '.hits | length'
# Should return > 0

# Cleanup
rm -rf /tmp/twinmos-meili-restore
```

### 4.4 Restore Coolify Configuration

**When to use:** Coolify reinstall after server replacement.

```bash
# STEP 1: Download Coolify config backup
b2 ls --long twinmos-backups-prod/coolify/ | sort -r | head -5

b2 download-file-by-name \
  twinmos-backups-prod \
  "coolify/coolify_config_20260101_040000.tar.gz.gpg" \
  /tmp/coolify_backup.tar.gz.gpg

# STEP 2: Decrypt
gpg --decrypt \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch \
    /tmp/coolify_backup.tar.gz.gpg \
    > /tmp/coolify_backup.tar.gz

# STEP 3: Extract and restore
tar -xzf /tmp/coolify_backup.tar.gz -C /

# STEP 4: Restart Coolify
systemctl restart coolify
```

### 4.5 Restore Strapi Media Files

Strapi media files live in Backblaze B2 bucket `twinmos-media-prod`. They are served directly from B2 via Cloudflare CDN — **no restore action is needed**. If the Strapi application is redeployed on a new server, simply configure the same B2 credentials and all media becomes available immediately.

---

## 5. Backup Verification Procedures

### 5.1 Weekly Automated Restore Test (to Dev Environment)

Schedule this to run every Sunday at 05:00 UTC on the dev server:

```bash
#!/usr/bin/env bash
# weekly-restore-test.sh — runs on dev.twinmos.com
# Tests that production backup can be restored to dev PostgreSQL

set -euo pipefail

DEV_POSTGRES_CONTAINER="twinmos-postgres-dev-1"
B2_BUCKET="twinmos-backups-prod"
SLACK_WEBHOOK="${SLACK_WEBHOOK_OPS}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

log "Starting weekly restore test on dev environment"

# Find latest daily backup
LATEST=$(b2 ls --long "${B2_BUCKET}/daily/" | sort | tail -1 | awk '{print $NF}')
log "Testing restore of: ${LATEST}"

# Download + decrypt
mkdir -p /tmp/restore-test
b2 download-file-by-name "${B2_BUCKET}" "${LATEST}" /tmp/restore-test/backup.tar.gpg

gpg --decrypt \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch \
    /tmp/restore-test/backup.tar.gpg \
    > /tmp/restore-test/backup.tar

tar -xf /tmp/restore-test/backup.tar -C /tmp/restore-test/

DUMP_FILE=$(ls /tmp/restore-test/pg_backup_*.dump 2>/dev/null | head -1)

# Restore to dev DB (separate schema: strapi_restore_test)
docker exec "${DEV_POSTGRES_CONTAINER}" psql -U strapi_user -c \
  "DROP DATABASE IF EXISTS strapi_restore_test;"
docker exec "${DEV_POSTGRES_CONTAINER}" psql -U strapi_user -c \
  "CREATE DATABASE strapi_restore_test OWNER strapi_user;"

docker exec -i "${DEV_POSTGRES_CONTAINER}" pg_restore \
  --username=strapi_user \
  --dbname=strapi_restore_test \
  --no-owner \
  < "${DUMP_FILE}"

# Count rows as a sanity check
PRODUCT_COUNT=$(docker exec "${DEV_POSTGRES_CONTAINER}" psql -U strapi_user strapi_restore_test -t -c \
  "SELECT count(*) FROM products;" 2>/dev/null || echo "0")

log "Restore test complete. Products in restored DB: ${PRODUCT_COUNT}"

if [[ "${PRODUCT_COUNT}" -gt 0 ]]; then
  curl -s -X POST "${SLACK_WEBHOOK}" \
    -d "{\"text\":\"✅ TwinMOS weekly restore test PASSED. Products in DB: ${PRODUCT_COUNT}\"}"
else
  curl -s -X POST "${SLACK_WEBHOOK}" \
    -d "{\"text\":\"⚠️ TwinMOS weekly restore test: 0 products found — verify backup integrity\"}"
fi

# Cleanup
docker exec "${DEV_POSTGRES_CONTAINER}" psql -U strapi_user -c \
  "DROP DATABASE strapi_restore_test;"
rm -rf /tmp/restore-test
```

### 5.2 Monthly Manual Spot-Check

```
Every 1st Monday of the month, Tech Lead performs:

□ Open B2 console: twinmos-backups-prod/daily/ → Verify last 30 files present
□ Download 1 backup file from 2 weeks ago
□ Decrypt with GPG passphrase from Bitwarden
□ pg_restore to dev environment
□ Login to dev Strapi admin → verify content accessible
□ Confirm product count matches expectation
□ Document result in #ops Slack: "Monthly backup spot-check: PASS [date]"
```

---

## 6. RTO Summary

| Scenario | Estimated Recovery Time | Procedure |
|----------|------------------------|-----------|
| PostgreSQL full restore from daily dump | 20–40 min | §4.1 |
| PostgreSQL PITR from WAL | 45–90 min | §4.2 |
| MeiliSearch index restore | 5–15 min | §4.3 |
| Coolify config restore | 10 min | §4.4 |
| Strapi media (already on B2) | 0 min (no action needed) | §4.5 |
| Full server rebuild + restore | ≤ 4 h | See TwinMOSWebsiteDisasterRecoveryPlan.md |

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §22.1, §22.2, §22.3*
