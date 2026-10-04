# TwinMOS Website — Integration Specification: Backblaze B2 Object Storage

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-B2-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P1 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §8, §19.3; BRD §21.2 |

---

## 1. Overview

**Backblaze B2** is the object storage provider for TwinMOS website media assets (product images, datasheets, firmware files, marketing assets, user-uploaded RMA attachments). B2 is S3-compatible, enabling use of standard AWS S3 SDKs.

### 1.1 Why Backblaze B2

| Criterion | B2 Value | AWS S3 Comparison |
|-----------|---------|-------------------|
| Storage cost | $6/TB/month | $23/TB/month |
| Egress cost | Free first 3x monthly storage; $0.01/GB after | $0.09/GB |
| Cloudflare partnership | Free egress when used with Cloudflare CDN (Bandwidth Alliance) | Not applicable |
| S3 compatibility | Full S3-compatible API | Native S3 |
| Data residency (EU) | Backblaze EU Central (Frankfurt) | AWS eu-central-1 |

**Effective egress cost with Cloudflare:** $0 (Backblaze ↔ Cloudflare Bandwidth Alliance partnership eliminates egress fees).

---

## 2. Bucket Structure

### 2.1 Buckets

| Bucket Name | Access | Purpose |
|------------|--------|---------|
| `twinmos-public` | Public (read) | Product images, brand assets, marketing media |
| `twinmos-documents` | Private | Datasheets, firmware, manuals (served via ImgProxy or presigned URLs) |
| `twinmos-uploads` | Private | User uploads: RMA attachments, proof-of-purchase photos |
| `twinmos-backups` | Private | Strapi DB backups, configuration snapshots |

### 2.2 S3-Compatible Endpoint

| Region | Endpoint |
|--------|----------|
| EU Central (Frankfurt) | `s3.eu-central-003.backblazeb2.com` |

---

## 3. Strapi Upload Provider Configuration

Strapi uses `@strapi/provider-upload-aws-s3` pointed at the B2 S3-compatible endpoint.

### 3.1 Installation

```bash
npm install @strapi/provider-upload-aws-s3
```

### 3.2 Strapi Plugin Configuration

**`config/plugins.ts`:**
```typescript
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('B2_KEY_ID'),
        secretAccessKey: env('B2_APPLICATION_KEY'),
        region: 'eu-central-003',
        params: {
          Bucket: env('B2_PUBLIC_BUCKET', 'twinmos-public'),
        },
        endpoint: 'https://s3.eu-central-003.backblazeb2.com',
        forcePathStyle: true,  // Required for B2
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

### 3.3 Content Security Policy Update

Add B2/Cloudflare media domain to Strapi's CSP:

```typescript
// config/middlewares.ts
{
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'data:', 'blob:', '*.twinmos.com', '*.backblazeb2.com'],
        'media-src': ["'self'", '*.twinmos.com'],
      },
    },
  },
},
```

---

## 4. Media Delivery Pipeline

### 4.1 Image Flow (via ImgProxy)

```
Strapi admin uploads image
          │
          ▼
  B2 twinmos-public bucket
  (original full-res file)
          │
          ▼
  ImgProxy (self-hosted on Hetzner)
  Generates WebP/AVIF on-demand
  URL: https://media.twinmos.com/rs:fill:800:600/plain/b2://twinmos-public/{key}
          │
          ▼
  Cloudflare CDN
  (caches transformed images at edge — free egress via Bandwidth Alliance)
          │
          ▼
  End user browser
```

### 4.2 ImgProxy URL Structure

```
https://media.twinmos.com/{processing_options}/plain/b2://{bucket}/{key}
```

**Examples:**
```
# Product thumbnail — 400×300, WebP, 85% quality
https://media.twinmos.com/rs:fill:400:300/q:85/plain/b2://twinmos-public/products/voltx-ddr5-16gb.jpg

# Hero image — 1920px wide, auto-height, AVIF
https://media.twinmos.com/rs:fit:1920:0/f:avif/plain/b2://twinmos-public/hero/gaming-setup.jpg

# Original (no transform)
https://media.twinmos.com/plain/b2://twinmos-public/datasheets/voltx-ddr5-datasheet.pdf
```

### 4.3 ImgProxy HMAC URL Signing

All ImgProxy URLs are signed with HMAC-SHA256 to prevent unsigned access and hotlinking:

```
https://media.twinmos.com/{signature}/{processing_options}/plain/b2://{bucket}/{key}
```

Signing key: `IMGPROXY_KEY` and `IMGPROXY_SALT` env vars.

### 4.4 Document/Firmware Downloads

Firmware and manuals in `twinmos-documents` bucket are served via **presigned URLs** with 1-hour expiry:

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'eu-central-003',
  endpoint: 'https://s3.eu-central-003.backblazeb2.com',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
  forcePathStyle: true,
});

export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: 'twinmos-documents',
    Key: key,
    ResponseContentDisposition: `attachment; filename="${path.basename(key)}"`,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
}
```

---

## 5. CORS Configuration

Required to allow browser-based presigned URL uploads from the TwinMOS domain.

**B2 Bucket CORS rules (via Backblaze CLI):**
```json
[
  {
    "corsRuleName": "twinmos-uploads",
    "allowedOrigins": ["https://twinmos.com", "https://*.twinmos.com"],
    "allowedOperations": ["b2_upload_file", "b2_download_file_by_name"],
    "allowedHeaders": ["content-type", "x-bz-file-name", "x-bz-content-sha1"],
    "exposeHeaders": ["x-bz-file-id"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 6. Direct Browser Upload (Presigned URLs)

For large file uploads (RMA attachments, proof of purchase) — client uploads directly to B2 without proxying through Strapi:

```
Client (browser)                  Strapi                    B2
    │                               │                         │
    │  POST /api/upload/presign     │                         │
    │  { fileName, contentType }    │                         │
    │ ─────────────────────────────►│                         │
    │                               │ Generate presigned URL  │
    │  { uploadUrl, fields }        │ ────────────────────────►
    │ ◄─────────────────────────────│                         │
    │                               │                         │
    │  PUT {uploadUrl} + file data  │                         │
    │ ──────────────────────────────────────────────────────►│
    │  200 OK (B2 returns key)      │                         │
    │ ◄──────────────────────────────────────────────────────│
    │                               │                         │
    │  POST /api/form-submissions   │                         │
    │  { ..., attachmentKey: key }  │                         │
    │ ─────────────────────────────►│                         │
```

---

## 7. Lifecycle Rules

| Bucket | Rule | Retention |
|--------|------|----------|
| `twinmos-public` | Keep all originals | Indefinite |
| `twinmos-documents` | Keep all versions | Indefinite |
| `twinmos-uploads` | RMA attachments | 3 years (warranty period) |
| `twinmos-backups` | Daily DB backups | 30 days rolling |
| Any bucket | Incomplete multipart uploads | Auto-delete after 24 hours |

---

## 8. Backup Strategy

Strapi PostgreSQL database backups to `twinmos-backups`:

```bash
# Coolify cron job — daily 03:00 UTC
pg_dump $DATABASE_URL | gzip | \
  aws s3 cp - s3://twinmos-backups/pg/twinmos-$(date +%Y%m%d).sql.gz \
  --endpoint-url https://s3.eu-central-003.backblazeb2.com
```

Backups retained for 30 days. Tested monthly via restore drill.

---

## 9. Access Control

### 9.1 Application Keys (Principle of Least Privilege)

| Key Name | Permissions | Used By |
|----------|------------|--------|
| `strapi-upload` | Write to `twinmos-public`, `twinmos-documents` | Strapi upload provider |
| `strapi-private` | Read/write `twinmos-uploads`, `twinmos-backups` | Strapi presigned URLs, backup scripts |
| `imgproxy-read` | Read from `twinmos-public`, `twinmos-documents` | ImgProxy |

### 9.2 Public Bucket

`twinmos-public` bucket has **public read** enabled. All media in this bucket is accessible at:
`https://f003.backblazeb2.com/file/twinmos-public/{key}`

However, all media is served via `media.twinmos.com` (ImgProxy + Cloudflare CDN) — direct B2 URLs are not used in templates.

---

## 10. Environment Variables

| Variable | Description |
|----------|-------------|
| `B2_KEY_ID` | Backblaze application key ID |
| `B2_APPLICATION_KEY` | Backblaze application key secret |
| `B2_PUBLIC_BUCKET` | Public bucket name (`twinmos-public`) |
| `B2_DOCUMENTS_BUCKET` | Documents bucket name (`twinmos-documents`) |
| `B2_UPLOADS_BUCKET` | User uploads bucket name (`twinmos-uploads`) |
| `B2_ENDPOINT` | S3 endpoint URL |
| `IMGPROXY_KEY` | ImgProxy HMAC signing key |
| `IMGPROXY_SALT` | ImgProxy HMAC salt |

---

## 11. Related Documents

- [TwinMOSWebsiteSystemArchitectureDiagram.md](../D.1 - Design Documents/TwinMOSWebsiteSystemArchitectureDiagram.md)
- [TwinMOSWebsiteDeployment_Diagram.md](../D.1 - Design Documents/TwinMOSWebsiteDeployment_Diagram.md)
