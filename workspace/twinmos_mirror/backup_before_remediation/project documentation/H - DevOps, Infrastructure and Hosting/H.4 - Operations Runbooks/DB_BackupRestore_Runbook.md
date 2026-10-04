# TwinMOS Website — Database Backup & Restore Runbook

| | |
|:---|:---|
| **Reference** | H.4-003 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This runbook provides procedures for backing up and restoring the TwinMOS website PostgreSQL and MeiliSearch databases.

---

## 2. Backup Strategy

| Backup Type | Frequency | Retention | Storage |
|:---|:---|:---|:---|
| **Full PostgreSQL dump** | Daily at 02:00 UTC | 365 days | Backblaze B2 |
| **WAL archiving** | Continuous | 7 days | Local + B2 |
| **MeiliSearch dump** | Daily at 02:30 UTC | 30 days | Backblaze B2 |
| **Configuration backup** | Weekly | 90 days | Backblaze B2 |

**RPO Target**: <= 15 minutes

---

## 3. Automated Backups

### 3.1 PostgreSQL Daily Backup

```bash
#!/bin/bash
set -euo pipefail
BACKUP_DIR="/backups/postgres"
B2_BUCKET="twinmos-db-backups"
DATE=$(date +%Y%m%d_%H%M%S)

 docker exec postgres-db pg_dump -U strapi -Fc strapi > "$BACKUP_DIR/strapi_$DATE.dump"
gzip -f "$BACKUP_DIR/strapi_$DATE.dump"
gpg --symmetric --cipher-algo AES256 --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --output "$BACKUP_DIR/strapi_$DATE.dump.gz.gpg" "$BACKUP_DIR/strapi_$DATE.dump.gz"
b2 file upload "$B2_BUCKET" "$BACKUP_DIR/strapi_$DATE.dump.gz.gpg" \
    "postgres/strapi_$DATE.dump.gz.gpg"
rm "$BACKUP_DIR/strapi_$DATE.dump.gz" "$BACKUP_DIR/strapi_$DATE.dump.gz.gpg"
find "$BACKUP_DIR" -name "*.gpg" -mtime +7 -delete
echo "Backup complete: $DATE"
```

**Cron**: `0 2 * * *`

### 3.2 MeiliSearch Daily Backup

```bash
#!/bin/bash
set -euo pipefail
BACKUP_DIR="/backups/meilisearch"
B2_BUCKET="twinmos-db-backups"
DATE=$(date +%Y%m%d_%H%M%S)

 docker exec meilisearch meilisearch --dump-dir /meili_data/dumps --dump
tar czf "$BACKUP_DIR/meilisearch_$DATE.tar.gz" -C /var/lib/docker/volumes/meilisearch_data/_data dumps/
gpg --symmetric --cipher-algo AES256 --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --output "$BACKUP_DIR/meilisearch_$DATE.tar.gz.gpg" "$BACKUP_DIR/meilisearch_$DATE.tar.gz"
b2 file upload "$B2_BUCKET" "$BACKUP_DIR/meilisearch_$DATE.tar.gz.gpg" \
    "meilisearch/meilisearch_$DATE.tar.gz.gpg"
rm "$BACKUP_DIR/meilisearch_$DATE.tar.gz" "$BACKUP_DIR/meilisearch_$DATE.tar.gz.gpg"
echo "MeiliSearch backup complete: $DATE"
```

**Cron**: `30 2 * * *`

---

## 4. Restore Procedures

### 4.1 PostgreSQL Full Restore

```bash
#!/bin/bash
set -euo pipefail
BACKUP_FILE="$1"

# Stop application
docker stop strapi-backend

# Download and decrypt
b2 file download twinmos-db-backups "$BACKUP_FILE" /tmp/restore.dump.gz.gpg
gpg --decrypt --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --output /tmp/restore.dump.gz /tmp/restore.dump.gz.gpg
gunzip -c /tmp/restore.dump.gz > /tmp/restore.dump

# Recreate database
docker exec postgres-db psql -U strapi -c "DROP DATABASE IF EXISTS strapi;"
docker exec postgres-db psql -U strapi -c "CREATE DATABASE strapi;"
docker exec postgres-db psql -U strapi -d strapi -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
docker exec postgres-db psql -U strapi -d strapi -c "CREATE EXTENSION IF NOT EXISTS unaccent;"

# Restore
docker exec -i postgres-db pg_restore -U strapi -d strapi --no-owner --no-privileges < /tmp/restore.dump

# Cleanup and restart
rm /tmp/restore.dump.gz.gpg /tmp/restore.dump.gz /tmp/restore.dump
docker start strapi-backend
sleep 10
curl -f http://localhost:1337/api/health
echo "Restore complete"
```

### 4.2 MeiliSearch Restore

```bash
#!/bin/bash
set -euo pipefail
BACKUP_FILE="$1"

docker stop meilisearch
b2 file download twinmos-db-backups "$BACKUP_FILE" /tmp/meili_restore.tar.gz.gpg
gpg --decrypt --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --output /tmp/meili_restore.tar.gz /tmp/meili_restore.tar.gz.gpg
rm -rf /var/lib/docker/volumes/meilisearch_data/_data/*
tar xzf /tmp/meili_restore.tar.gz -C /var/lib/docker/volumes/meilisearch_data/_data
rm /tmp/meili_restore.tar.gz.gpg /tmp/meili_restore.tar.gz
docker start meilisearch
sleep 5
curl -f http://localhost:7700/health
echo "MeiliSearch restore complete"
```

---

## 5. Backup Verification

```bash
#!/bin/bash
LATEST=$(b2 ls twinmos-db-backups postgres/ | tail -1)
b2 file download "twinmos-db-backups" "$LATEST" /tmp/verify.gpg
gpg --decrypt --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --output /tmp/verify.gz /tmp/verify.gpg
gunzip -t /tmp/verify.gz
rm /tmp/verify.gpg /tmp/verify.gz
echo "Backup verification passed"
```

**Cron**: `0 4 * * 0` (weekly)

---

## 6. Troubleshooting

| Issue | Solution |
|:---|:---|
| Backup fails (disk full) | Clean old backups, check disk usage |
| Upload to B2 fails | Check network, verify credentials |
| Restore fails (corrupt) | Use older backup |
| Decrypt fails | Verify encryption key in 1Password |

---

## 7. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 8. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
