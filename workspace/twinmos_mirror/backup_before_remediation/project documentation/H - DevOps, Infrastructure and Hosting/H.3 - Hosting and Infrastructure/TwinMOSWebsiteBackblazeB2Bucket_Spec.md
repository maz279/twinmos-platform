# TwinMOS Website — Backblaze B2 Bucket Specification

**Document ID:** H.3-006  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteHostingArchitectureSpec.md · TwinMOSWebsiteBackupRestoreRunbook.md · TwinMOSWebsiteEnvironmentVariablesReference.md

---

## 1. Overview

Backblaze B2 is used as the primary object storage provider for the TwinMOS website. It stores:
1. Strapi CMS media uploads (product images, datasheets, team photos)
2. Encrypted PostgreSQL backups (daily dumps + WAL archives)
3. Build artifacts and deployment packages
4. Log archives (P2+)

**Why Backblaze B2:**
- **Cost:** $0.005/GB storage (10× cheaper than S3), $0.01/GB download (free egress to Cloudflare)
- **S3-compatible API:** Works with all S3 libraries; no vendor-specific code
- **Free egress to Cloudflare:** With Cloudflare+B2 partnership, egress from B2 → Cloudflare is free
- **Simple pricing:** No request costs, no minimum storage

---

## 2. Account Configuration

### 2.1 B2 Account Details

```
Account: twinmos-technologies (team account)
Primary email: devops@twinmos.com
2FA: Required (TOTP + hardware key)
Master application key: Stored in Bitwarden only — NEVER in code or env files
Region: US West (us-west-002) — all buckets
```

### 2.2 Application Keys (Per-Bucket, Least Privilege)

Each service or environment gets its own restricted application key.

| Key Name | Bucket Access | Permissions | Used By | Rotation |
|----------|--------------|-------------|---------|----------|
| `strapi-prod-media-key` | twinmos-media-prod | read + write + list | Strapi (production) | 180 days |
| `strapi-staging-media-key` | twinmos-media-staging | read + write + list | Strapi (staging) | 180 days |
| `backup-prod-key` | twinmos-backups-prod | write + list | Backup scripts (cron) | 180 days |
| `restore-prod-key` | twinmos-backups-prod | read + list | DR restore procedures | 180 days |
| `artifacts-key` | twinmos-artifacts | read + write + list + delete | GitHub Actions CI | 180 days |
| `logs-archive-key` (P2+) | twinmos-logs-archive | write + list | Vector log shipper | 180 days |

> **Never use master application key in application code.** Create restricted keys for every use case.

---

## 3. Bucket Inventory

### 3.1 Bucket: `twinmos-media-prod`

| Attribute | Value |
|-----------|-------|
| Purpose | Strapi production media files |
| Access | Public read |
| Region | us-west-002 |
| Lifecycle | Incomplete multipart uploads: delete after 1 day |
| Versioning | Off (managed by Strapi; no versioning needed for media) |
| Estimated size P1 | ~2 GB |
| Estimated size P3 | ~20 GB |
| Monthly cost P1 | ~$0.01 |
| Monthly cost P3 | ~$0.10 |

**Bucket settings:**
```
Bucket type: Public
File access: Public
CORS rules: Allow GET from https://twinmos.com, https://staging.twinmos.com
Default server-side encryption: None (media files are not sensitive)
```

**CORS configuration (JSON):**
```json
[{
  "corsRuleName": "twinmos-frontend",
  "allowedOrigins": [
    "https://twinmos.com",
    "https://www.twinmos.com",
    "https://staging.twinmos.com",
    "http://localhost:4321"
  ],
  "allowedOperations": ["b2_download_file_by_id", "b2_download_file_by_name"],
  "allowedHeaders": ["*"],
  "maxAgeSeconds": 86400
}]
```

### 3.2 Bucket: `twinmos-media-staging`

| Attribute | Value |
|-----------|-------|
| Purpose | Strapi staging media files |
| Access | Public read |
| Region | us-west-002 |
| Lifecycle | Auto-delete files older than 30 days (staging data is ephemeral) |
| Estimated size | ~500 MB |
| Monthly cost | ~$0.005 |

### 3.3 Bucket: `twinmos-backups-prod`

| Attribute | Value |
|-----------|-------|
| Purpose | Encrypted PostgreSQL dumps, WAL archives, MeiliSearch dumps, Coolify config |
| Access | Private (no public access) |
| Region | us-west-002 |
| Encryption | AES-256-GCM GPG encryption applied BEFORE upload |
| Versioning | Off (backup files are unique by timestamp) |
| Estimated size P1 | ~5 GB (30 daily + 12 monthly PostgreSQL dumps) |
| Monthly cost P1 | ~$0.025 |

**Folder structure:**
```
twinmos-backups-prod/
├── daily/
│   ├── pg_backup_20260101_020000.dump.gpg    (PostgreSQL daily dump)
│   ├── pg_backup_20260102_020000.dump.gpg
│   └── ...                                   (30-day retention)
├── monthly/
│   ├── pg_backup_202601_monthly.dump.gpg     (PostgreSQL monthly archive)
│   └── ...                                   (12-month retention)
├── wal/
│   ├── 000000010000000000000001.gpg          (PostgreSQL WAL segments)
│   └── ...                                   (7-day retention)
├── meilisearch/
│   ├── meili_dump_20260101_020000.dump.gpg
│   └── ...                                   (30-day retention)
└── coolify/
    ├── coolify_config_20260101.tar.gz.gpg
    └── ...                                   (90-day retention)
```

**Lifecycle rules:**
```
Rule 1: daily/ → delete files older than 30 days
Rule 2: wal/   → delete files older than 7 days
Rule 3: monthly/ → delete files older than 365 days
Rule 4: meilisearch/ → delete files older than 30 days
Rule 5: coolify/ → delete files older than 90 days
```

### 3.4 Bucket: `twinmos-artifacts`

| Attribute | Value |
|-----------|-------|
| Purpose | GitHub Actions build artifacts, deployment packages |
| Access | Private |
| Region | us-west-002 |
| Lifecycle | Delete all files older than 14 days |
| Estimated size | ~1 GB |
| Monthly cost | ~$0.005 |

### 3.5 Bucket: `twinmos-logs-archive` (Phase 2+)

| Attribute | Value |
|-----------|-------|
| Purpose | Cloudflare Logpush + application log cold archive |
| Access | Private |
| Region | us-west-002 |
| Lifecycle | Delete files older than 730 days (2-year retention) |
| Estimated size P2 | ~50 GB/year |
| Monthly cost P2 | ~$0.25 |

---

## 4. Strapi S3-Compatible Provider Configuration

Strapi uses the `@strapi/provider-upload-aws-s3` package to connect to Backblaze B2 via S3-compatible API.

```javascript
// config/plugins.ts (Strapi)
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('B2_ACCESS_KEY_ID'),
        secretAccessKey: env('B2_SECRET_ACCESS_KEY'),
        endpoint: 'https://s3.us-west-002.backblazeb2.com',
        region: 'us-west-002',
        params: {
          Bucket: env('B2_BUCKET_NAME'),
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
```

```bash
# Required environment variables (in Coolify):
B2_ACCESS_KEY_ID=<strapi-prod-media-key ID>
B2_SECRET_ACCESS_KEY=<strapi-prod-media-key secret>
B2_BUCKET_NAME=twinmos-media-prod
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_REGION=us-west-002
# CDN URL (direct B2 URL — or via Cloudflare if B2 CDN enabled)
B2_CDN_URL=https://twinmos-media-prod.s3.us-west-002.backblazeb2.com
```

---

## 5. Backup Encryption Specification

All files in `twinmos-backups-prod` are GPG-encrypted before upload.

### 5.1 Encryption method

```
Algorithm: AES-256 (symmetric)
Tool: gpg --symmetric --cipher-algo AES256
Passphrase: Stored in Bitwarden (TwinMOS vault → Infrastructure → GPG Backup Passphrase)
            Minimum 32 characters, randomly generated
```

### 5.2 Encryption command

```bash
gpg --symmetric \
    --cipher-algo AES256 \
    --compress-algo none \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch \
    --yes \
    -o "backup.dump.gpg" \
    "backup.dump"
```

### 5.3 Decryption command (for restore)

```bash
gpg --decrypt \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch \
    "backup.dump.gpg" > "backup.dump"
```

---

## 6. B2 CLI Configuration

Install B2 CLI on Hetzner server for backup scripts:

```bash
# Install B2 CLI
pip3 install b2

# Authorize (use backup-prod-key — not master key)
b2 account authorize <keyID> <applicationKey>

# Test connection
b2 ls twinmos-backups-prod/daily/

# Upload a file
b2 upload-file twinmos-backups-prod backup.dump.gpg daily/backup_20260101.dump.gpg

# Download a file
b2 download-file-by-name twinmos-backups-prod daily/backup_20260101.dump.gpg ./restore/backup.dump.gpg

# List files with sizes and dates
b2 ls --long twinmos-backups-prod/daily/
```

---

## 7. Cost Estimates

### Phase 1 (P1)

| Bucket | Size | Storage Cost | Download | Total/mo |
|--------|------|-------------|---------|---------|
| twinmos-media-prod | 2 GB | $0.01 | Free (Cloudflare egress) | $0.01 |
| twinmos-media-staging | 0.5 GB | $0.003 | Minimal | $0.003 |
| twinmos-backups-prod | 5 GB | $0.025 | Minimal (restore only) | $0.025 |
| twinmos-artifacts | 1 GB | $0.005 | Minimal | $0.005 |
| **P1 Total** | **8.5 GB** | | | **~$0.05/mo** |

### Phase 3 (P3 — commerce + full product catalog)

| Bucket | Size | Storage Cost | Total/mo |
|--------|------|-------------|---------|
| twinmos-media-prod | 20 GB | $0.10 | $0.10 |
| twinmos-backups-prod | 15 GB | $0.075 | $0.075 |
| twinmos-logs-archive | 5 GB/mo | $0.025 | $0.025 |
| **P3 Total** | **40+ GB** | | **~$0.20/mo** |

> B2 costs are negligible for this project. The only meaningful costs are storage and download. Cloudflare-B2 free egress applies when Cloudflare is in the request path (which it is for media served via CDN).

---

## 8. Monitoring

### 8.1 Backup Completeness Check

```bash
#!/usr/bin/env bash
# Run daily (after backup cron) to verify backup completed

YESTERDAY=$(date -d '1 day ago' +%Y%m%d)
BACKUP_FILE="daily/pg_backup_${YESTERDAY}_020000.dump.gpg"

if b2 ls twinmos-backups-prod/${BACKUP_FILE} > /dev/null 2>&1; then
    echo "✓ Backup ${BACKUP_FILE} found"
else
    echo "✗ MISSING: Backup ${BACKUP_FILE} not found!"
    # Send alert to Slack
    curl -s -X POST "${SLACK_WEBHOOK_OPS}" \
      -d "{\"text\":\"⚠️ TwinMOS backup MISSING: ${BACKUP_FILE}\"}"
fi
```

### 8.2 Storage Usage Alert

```bash
# Monthly cost check script
STORAGE_GB=$(b2 account get | jq '.storageSize' | awk '{printf "%.2f", $1/1024/1024/1024}')
COST=$(echo "${STORAGE_GB} * 0.005" | bc)
echo "B2 storage: ${STORAGE_GB} GB — estimated $${COST}/mo"
```

---

## 9. Security Controls

| Control | Implementation |
|---------|---------------|
| Access | Restricted application keys per service (no master key in apps) |
| Encryption | AES-256 GPG on all backup files before upload |
| CORS | Only twinmos.com and localhost origins allowed for media bucket |
| Public bucket | Media only — no personal data stored in public bucket |
| Backup bucket | Private — no public read access |
| 2FA on B2 account | TOTP + hardware key required |
| Key rotation | Every 180 days or on staff offboarding |

---

## 10. Access from GitHub Actions

```yaml
# In GitHub Actions workflow (CI)
- name: Upload build artifact to B2
  run: |
    pip install b2
    b2 account authorize ${{ secrets.B2_ARTIFACTS_KEY_ID }} ${{ secrets.B2_ARTIFACTS_KEY }}
    b2 upload-file twinmos-artifacts ./dist.tar.gz "builds/build-${{ github.sha }}.tar.gz"
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.1, §23.2*
