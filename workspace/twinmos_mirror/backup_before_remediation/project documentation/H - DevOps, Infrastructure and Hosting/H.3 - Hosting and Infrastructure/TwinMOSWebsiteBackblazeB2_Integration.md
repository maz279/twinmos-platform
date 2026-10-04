# TwinMOS Website — Backblaze B2 Integration Guide

| | |
|:---|:---|
| **Reference** | H.3-005 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the integration of Backblaze B2 Cloud Storage for the TwinMOS website.

---

## 2. Backblaze B2 Overview

| Attribute | Specification |
|:---|:---|
| **Service** | Backblaze B2 Cloud Storage |
| **Storage Cost** | $0.005/GB/month |
| **Download Cost** | $0.01/GB |
| **Upload Cost** | Free |
| **Encryption** | AES-256 at rest, TLS 1.2+ in transit |
| **Durability** | 99.999999% |

---

## 3. Account Setup

1. Sign up at backblaze.com/b2
2. Create Application Key with Read/Write access
3. Store credentials in GitHub Secrets

---

## 4. Bucket Configuration

| Bucket Name | Purpose | Lifecycle |
|:---|:---|:---|
| `twinmos-media-prod` | Production CMS media | Keep forever |
| `twinmos-media-staging` | Staging media | Delete after 90 days |
| `twinmos-db-backups` | Database backups | Glacier after 30 days |
| `twinmos-build-artifacts` | CI build outputs | Delete after 30 days |

---

## 5. Strapi Media Provider

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('B2_KEY_ID'),
        secretAccessKey: env('B2_APPLICATION_KEY'),
        endpoint: env('B2_ENDPOINT'),
        region: env('B2_REGION', 'us-west-004'),
        params: { Bucket: env('B2_MEDIA_BUCKET') },
        baseUrl: env('B2_CDN_URL'),
      },
      actionOptions: {
        upload: { ACL: 'private', CacheControl: 'public, max-age=31536000, immutable' },
        delete: {},
      },
    },
  },
});
```

---

## 6. Backup Automation

```bash
#!/bin/bash
set -euo pipefail
B2_BUCKET="twinmos-db-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL backup
 docker exec postgres-db pg_dump -U strapi strapi | gzip > "/tmp/postgres_$DATE.sql.gz"
gpg --symmetric --cipher-algo AES256 --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
  --output "/tmp/postgres_$DATE.sql.gz.gpg" "/tmp/postgres_$DATE.sql.gz"
b2 file upload "$B2_BUCKET" "/tmp/postgres_$DATE.sql.gz.gpg" "postgres/postgres_$DATE.sql.gz.gpg"
rm "/tmp/postgres_$DATE.sql.gz" "/tmp/postgres_$DATE.sql.gz.gpg"

echo "Backup complete: $DATE"
```

**Cron**: `0 2 * * *`

---

## 7. Lifecycle Rules

```bash
b2 lifecycle-rules set twinmos-media-staging --days-from-uploading-to-hiding 90 --days-from-hiding-to-deleting 1
b2 lifecycle-rules set twinmos-db-backups --days-from-uploading-to-hiding 30 --days-from-hiding-to-deleting 335
b2 lifecycle-rules set twinmos-build-artifacts --days-from-uploading-to-hiding 30 --days-from-hiding-to-deleting 1
```

---

## 8. Cost Monitoring

| Bucket | Storage (P3) | Monthly Cost |
|:---|:---|:---|
| Media | 200 GB | $1.00 |
| Backups | 100 GB | $0.50 |
| Artifacts | 20 GB | $0.10 |
| Download (1 TB) | | $10.00 |
| **Total (P3)** | | **~$14.00** |

---

## 9. Security

| Principal | Bucket | Permissions |
|:---|:---|:---|
| Strapi backend | twinmos-media-prod | Read, Write, Delete |
| Backup script | twinmos-db-backups | Write only |
| CI/CD | twinmos-build-artifacts | Read, Write |
| ImgProxy | twinmos-media-prod | Read only |

---

## 10. Troubleshooting

| Issue | Solution |
|:---|:---|
| Upload fails (403) | Check application key permissions |
| Slow uploads | Use multipart upload for files > 100 MB |
| CORS error | Verify CORS rules include requesting domain |
| High costs | Review lifecycle rules, check download volume |

---

## 11. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 12. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
