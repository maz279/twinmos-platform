# TwinMOS Website — Environment Variables Reference

**Document Reference:** TWN-DEVOPS-H1-004
**Document Version:** 1.0
**Status:** DRAFT — for Unisoft Engineering Review
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead (Implementation)
**Audience:** Unisoft engineering team, DevOps operators
**Classification:** CONFIDENTIAL — Unisoft + TwinMOS Internal Use
**Synchronized With:** Technology Stack v1.1 §19, BRD v3.0 §21, §26

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release — complete env var inventory for all services |

---

## Table of Contents

1. [Variable Naming Conventions](#1-variable-naming-conventions)
2. [Frontend (Astro) Variables](#2-frontend-astro-variables)
3. [Backend (Strapi) Variables](#3-backend-strapi-variables)
4. [Database Variables](#4-database-variables)
5. [Search (MeiliSearch) Variables](#5-search-meilisearch-variables)
6. [Image Pipeline (ImgProxy) Variables](#6-image-pipeline-imgproxy-variables)
7. [Object Storage (Backblaze B2) Variables](#7-object-storage-backblaze-b2-variables)
8. [Email (Resend) Variables](#8-email-resend-variables)
9. [Analytics (Plausible) Variables](#9-analytics-plausible-variables)
10. [Monitoring (Sentry) Variables](#10-monitoring-sentry-variables)
11. [Authentication Variables](#11-authentication-variables)
12. [Security Variables](#12-security-variables)
13. [Third-Party Integration Variables](#13-third-party-integration-variables)
14. [Environment-Specific Values](#14-environment-specific-values)
15. [Variable Validation](#15-variable-validation)

---

## 1. Variable Naming Conventions

### 1.1 Prefix Rules

| Prefix | Scope | Example |
|--------|-------|---------|
| `PUBLIC_` | Exposed to browser (Astro) | `PUBLIC_API_URL` |
| `PRIVATE_` | Server-only (Astro) | `PRIVATE_SENTRY_DSN` |
| `STRAPI_` | Strapi-specific | `STRAPI_ADMIN_JWT_SECRET` |
| `DB_` | Database | `DB_HOST` |
| `MEILI_` | MeiliSearch | `MEILI_MASTER_KEY` |
| `IMGPROXY_` | ImgProxy | `IMGPROXY_KEY` |
| `B2_` | Backblaze B2 | `B2_KEY_ID` |
| `RESEND_` | Resend email | `RESEND_API_KEY` |
| `SENTRY_` | Sentry monitoring | `SENTRY_DSN` |
| `PLAUSIBLE_` | Plausible analytics | `PLAUSIBLE_BASE_URL` |
| `CLOUDFLARE_` | Cloudflare | `CLOUDFLARE_API_TOKEN` |
| `REDIS_` | Redis cache | `REDIS_URL` |

### 1.2 Sensitivity Classification

| Classification | Storage | Rotation | Example |
|----------------|---------|----------|---------|
| **Public** | Repo OK | N/A | `PUBLIC_SITE_URL` |
| **Internal** | `.env` file (gitignored) | On change | `DATABASE_HOST` |
| **Secret** | Coolify secrets / Doppler | Quarterly | `JWT_SECRET` |
| **Critical** | Hardware security module (future) | On breach | `STRIPE_SECRET_KEY` (P3) |

---

## 2. Frontend (Astro) Variables

### 2.1 Public Variables (Browser-Accessible)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `PUBLIC_SITE_URL` | Canonical site URL | `https://twinmos.com` | Yes |
| `PUBLIC_API_URL` | Strapi REST API base URL | `https://api.twinmos.com` | Yes |
| `PUBLIC_SEARCH_URL` | MeiliSearch public endpoint | `https://search.twinmos.com` | Yes |
| `PUBLIC_IMGPROXY_URL` | ImgProxy public endpoint | `https://imgproxy.twinmos.com` | Yes |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Plausible tracking domain | `twinmos.com` | Yes |
| `PUBLIC_PLAUSIBLE_SCRIPT_URL` | Plausible script URL | `https://analytics.twinmos.com/js/script.js` | Yes |
| `PUBLIC_SENTRY_DSN` | Sentry browser DSN | `https://xxx@o123.ingest.sentry.io/456` | Yes |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | `0x4AAAAAA...` | Yes |
| `PUBLIC_GA4_MEASUREMENT_ID` | Google Analytics 4 ID | `G-XXXXXXXXXX` | No |
| `PUBLIC_GTM_ID` | Google Tag Manager ID | `GTM-XXXXXX` | No |
| `PUBLIC_MAP_TILE_URL` | OpenStreetMap tile server | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Yes |
| `PUBLIC_DEFAULT_LOCALE` | Default language | `en` | Yes |
| `PUBLIC_AVAILABLE_LOCALES` | Comma-separated locale codes | `en,ar,bn,hi,ru,zh-CN,fr` | Yes |

### 2.2 Private Variables (Server-Only)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `PRIVATE_SENTRY_AUTH_TOKEN` | Sentry CLI auth token | `sntrys_ey...` | Yes |
| `PRIVATE_WEBHOOK_SECRET` | Strapi webhook verification | `whsec_...` | Yes |
| `PRIVATE_REVALIDATE_TOKEN` | ISR cache revalidation token | `tok_...` | Yes |

---

## 3. Backend (Strapi) Variables

### 3.1 Core Strapi Configuration

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `HOST` | Strapi bind address | `0.0.0.0` | Yes |
| `PORT` | Strapi port | `1337` | Yes |
| `APP_KEYS` | Comma-separated app keys (4) | `key1,key2,key3,key4` | Yes |
| `API_TOKEN_SALT` | Salt for API tokens | `salt_...` | Yes |
| `ADMIN_JWT_SECRET` | JWT secret for admin panel | `jwt_...` | Yes |
| `TRANSFER_TOKEN_SALT` | Salt for transfer tokens | `xfer_...` | Yes |
| `JWT_SECRET` | JWT secret for Users-Permissions | `jwt_user_...` | Yes |

### 3.2 Strapi Plugin Configuration

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `STRAPI_PLUGIN_I18N_DEFAULT_LOCALE` | Default CMS locale | `en` | Yes |
| `STRAPI_TELEMETRY_DISABLED` | Disable Strapi telemetry | `true` | Yes |

---

## 4. Database Variables

### 4.1 PostgreSQL Connection

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `DATABASE_CLIENT` | Database client type | `postgres` | Yes |
| `DATABASE_HOST` | PostgreSQL host | `localhost` / `postgres` | Yes |
| `DATABASE_PORT` | PostgreSQL port | `5432` | Yes |
| `DATABASE_NAME` | Database name | `twinmos_production` | Yes |
| `DATABASE_USERNAME` | Database user | `twinmos` | Yes |
| `DATABASE_PASSWORD` | Database password | `...` | Yes |
| `DATABASE_SSL` | Enable SSL connection | `true` / `false` | Yes |
| `DATABASE_SSL_CA` | SSL CA certificate path | `/path/to/ca.crt` | No |
| `DATABASE_POOL_MIN` | Min connection pool size | `2` | No |
| `DATABASE_POOL_MAX` | Max connection pool size | `10` | No |
| `DATABASE_TIMEOUT` | Query timeout (ms) | `30000` | No |

### 4.2 Connection Pool (PgBouncer — Phase 2+)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `DATABASE_URL` | Full connection string | `postgres://user:pass@host:port/db?sslmode=require` | No |
| `PG_BOUNCER_URL` | PgBouncer connection string | `postgres://user:pass@localhost:6432/db` | No |

---

## 5. Search (MeiliSearch) Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `MEILISEARCH_HOST` | MeiliSearch server URL | `http://localhost:7700` | Yes |
| `MEILISEARCH_API_KEY` | Admin API key | `master_key_...` | Yes |
| `MEILISEARCH_PUBLIC_KEY` | Read-only public key | `public_...` | Yes |
| `MEILISEARCH_INDEX_PREFIX` | Index name prefix | `twinmos_prod_` | No |

---

## 6. Image Pipeline (ImgProxy) Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `IMGPROXY_KEY` | ImgProxy signature key (hex) | `a1b2c3...` | Yes |
| `IMGPROXY_SALT` | ImgProxy signature salt (hex) | `d4e5f6...` | Yes |
| `IMGPROXY_BASE_URL` | ImgProxy public URL | `https://imgproxy.twinmos.com` | Yes |
| `IMGPROXY_S3_REGION` | S3-compatible region | `us-west-002` | Yes |
| `IMGPROXY_S3_ENDPOINT` | S3-compatible endpoint | `https://s3.us-west-002.backblazeb2.com` | Yes |
| `IMGPROXY_S3_KEY` | S3 access key | `...` | Yes |
| `IMGPROXY_S3_SECRET` | S3 secret key | `...` | Yes |
| `IMGPROXY_S3_BUCKET` | Source bucket name | `twinmos-assets-production` | Yes |

---

## 7. Object Storage (Backblaze B2) Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `B2_ACCOUNT_ID` | B2 account ID | `...` | Yes |
| `B2_APPLICATION_KEY` | B2 application key | `...` | Yes |
| `B2_BUCKET_NAME` | Target bucket name | `twinmos-assets-production` | Yes |
| `B2_REGION` | S3-compatible region | `us-west-002` | Yes |
| `B2_ENDPOINT` | S3-compatible endpoint | `https://s3.us-west-002.backblazeb2.com` | Yes |
| `B2_PUBLIC_URL_BASE` | Public CDN base URL | `https://f002.backblazeb2.com/file/twinmos-assets-production` | Yes |
| `B2_BACKUP_BUCKET` | Backup/archive bucket | `twinmos-backups-production` | Yes |

---

## 8. Email (Resend) Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Yes |
| `RESEND_FROM_DOMAIN` | Sender domain | `mail.twinmos.com` | Yes |
| `RESEND_FROM_EMAIL` | Default sender address | `noreply@twinmos.com` | Yes |
| `RESEND_WEBHOOK_SECRET` | Resend webhook verification | `whsec_...` | Yes |

### 8.1 Mailbox Aliases (Configured in Resend)

| Alias | Purpose | Environment |
|-------|---------|-------------|
| `info@twinmos.com` | General inquiries | All |
| `sales@twinmos.com` | Sales inquiries | All |
| `support@twinmos.com` | Technical support | All |
| `partners@twinmos.com` | Distributor applications | All |
| `oem@twinmos.com` | OEM/ODM inquiries | All |
| `press@twinmos.com` | Media inquiries | All |
| `warranty@twinmos.com` | Warranty registration | All |
| `feedback@twinmos.com` | General feedback | All |
| `hr@twinmos.com` | Job applications | All |
| `legal@twinmos.com` | Legal inquiries | All |
| `security@twinmos.com` | Vulnerability reports | All |
| `dpo@twinmos.com` | Data Protection Officer (GDPR/UAE) | All |
| `in-privacy@twinmos.com` | India DPDP Grievance Officer | All |
| `webmaster@twinmos.com` | Technical issues | All |
| `accessibility@twinmos.com` | Accessibility feedback | All |

---

## 9. Analytics (Plausible) Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `PLAUSIBLE_BASE_URL` | Plausible instance URL | `https://analytics.twinmos.com` | Yes |
| `PLAUSIBLE_SECRET_KEY` | Secret key base (32+ chars) | `...` | Yes |
| `PLAUSIBLE_DATABASE_URL` | PostgreSQL connection for Plausible | `postgres://...` | Yes |
| `PLAUSIBLE_DOMAIN` | Tracked domain | `twinmos.com` | Yes |

---

## 10. Monitoring (Sentry) Variables

### 10.1 Frontend (Astro)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `SENTRY_DSN` | Browser DSN | `https://xxx@o123.ingest.sentry.io/456` | Yes |
| `SENTRY_AUTH_TOKEN` | CLI auth token for source maps | `sntrys_ey...` | Yes |
| `SENTRY_ORG` | Sentry organization slug | `twinmos` | Yes |
| `SENTRY_PROJECT` | Project slug | `twinmos-website-frontend` | Yes |
| `SENTRY_RELEASE` | Release identifier | `frontend@1.2.3` | Yes |
| `SENTRY_ENVIRONMENT` | Environment tag | `production` | Yes |

### 10.2 Backend (Strapi)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `SENTRY_DSN` | Node.js DSN | `https://yyy@o123.ingest.sentry.io/789` | Yes |
| `SENTRY_ORG` | Sentry organization slug | `twinmos` | Yes |
| `SENTRY_PROJECT` | Project slug | `twinmos-website-backend` | Yes |
| `SENTRY_RELEASE` | Release identifier | `backend@1.2.3` | Yes |
| `SENTRY_ENVIRONMENT` | Environment tag | `production` | Yes |

---

## 11. Authentication Variables

### 11.1 Strapi Users-Permissions (CMS Admin)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `JWT_ACCESS_TOKEN_EXPIRES` | Access token TTL (seconds) | `3600` (1 hour) | Yes |
| `JWT_REFRESH_TOKEN_EXPIRES` | Refresh token TTL (seconds) | `604800` (7 days) | Yes |
| `JWT_ALGORITHM` | Token signing algorithm | `RS256` | Yes |
| `JWT_PRIVATE_KEY` | RS256 private key (PEM) | `-----BEGIN PRIVATE KEY-----...` | Yes |
| `JWT_PUBLIC_KEY` | RS256 public key (PEM) | `-----BEGIN PUBLIC KEY-----...` | Yes |

### 11.2 Better Auth (Partner Portal — Phase 2)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `BETTER_AUTH_SECRET` | Better Auth secret | `ba_secret_...` | P2 |
| `BETTER_AUTH_URL` | Better Auth base URL | `https://partner.twinmos.com` | P2 |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Allowed CORS origins | `https://twinmos.com,https://partner.twinmos.com` | P2 |
| `OAUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID | `...` | P2 (optional) |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `...` | P2 (optional) |
| `OAUTH_MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID | `...` | P2 (optional) |
| `OAUTH_MICROSOFT_CLIENT_SECRET` | Microsoft OAuth client secret | `...` | P2 (optional) |

---

## 12. Security Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `CSP_REPORT_URI` | Content Security Policy report endpoint | `https://o123.ingest.sentry.io/api/.../security/` | Yes |
| `HSTS_MAX_AGE` | HSTS max-age header | `31536000` | Yes |
| `RATE_LIMIT_PUBLIC` | Public API rate limit (req/min) | `100` | Yes |
| `RATE_LIMIT_AUTH` | Authenticated API rate limit (req/min) | `1000` | Yes |
| `RATE_LIMIT_FORM` | Form submission rate limit (per IP per 10 min) | `10` | Yes |
| `CLOUDFLARE_TURNSTILE_SECRET` | Turnstile server-side secret | `0x4AAAAAA...` | Yes |
| `ENCRYPTION_KEY` | AES-256 key for sensitive data at rest | `...` | Yes |

---

## 13. Third-Party Integration Variables

### 13.1 Cloudflare

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | `...` | Yes |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | `...` | Yes |
| `CLOUDFLARE_ZONE_ID` | twinmos.com zone ID | `...` | Yes |
| `CLOUDFLARE_PAGES_PROJECT` | Pages project name | `twinmos-website` | Yes |

### 13.2 HubSpot CRM (Phase 1 Week 4 ADR)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `HUBSPOT_API_KEY` | HubSpot private app token | `...` | P1 |
| `HUBSPOT_PORTAL_ID` | HubSpot portal ID | `...` | P1 |
| `HUBSPOT_CLIENT_ID` | OAuth client ID | `...` | P1 |
| `HUBSPOT_CLIENT_SECRET` | OAuth client secret | `...` | P1 |

### 13.3 Stripe (Phase 3)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` | P3 |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` | P3 |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | `whsec_...` | P3 |
| `STRIPE_TAX_API_KEY` | Stripe Tax API key | `...` | P3 |

### 13.4 UptimeRobot

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `UPTIMEROBOT_API_KEY` | UptimeRobot API key | `ur...` | No |

---

## 14. Environment-Specific Values

### 14.1 Production Environment

```bash
# ─── Core ───
NODE_ENV=production
HOST=0.0.0.0
PORT=1337

# ─── URLs ───
PUBLIC_SITE_URL=https://twinmos.com
PUBLIC_API_URL=https://api.twinmos.com
PUBLIC_SEARCH_URL=https://search.twinmos.com
PUBLIC_IMGPROXY_URL=https://imgproxy.twinmos.com

# ─── Database ───
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=twinmos_production
DATABASE_USERNAME=twinmos_prod
DATABASE_PASSWORD=<SECRET>
DATABASE_SSL=true
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# ─── Search ───
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=<SECRET>
MEILISEARCH_PUBLIC_KEY=<PUBLIC_SECRET>

# ─── ImgProxy ───
IMGPROXY_KEY=<HEX_SECRET>
IMGPROXY_SALT=<HEX_SECRET>
IMGPROXY_BASE_URL=https://imgproxy.twinmos.com
IMGPROXY_S3_REGION=us-west-002
IMGPROXY_S3_ENDPOINT=https://s3.us-west-002.backblazeb2.com
IMGPROXY_S3_KEY=<SECRET>
IMGPROXY_S3_SECRET=<SECRET>
IMGPROXY_S3_BUCKET=twinmos-assets-production

# ─── Backblaze B2 ───
B2_ACCOUNT_ID=<SECRET>
B2_APPLICATION_KEY=<SECRET>
B2_BUCKET_NAME=twinmos-assets-production
B2_REGION=us-west-002
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_PUBLIC_URL_BASE=https://f002.backblazeb2.com/file/twinmos-assets-production
B2_BACKUP_BUCKET=twinmos-backups-production

# ─── Email ───
RESEND_API_KEY=re_<SECRET>
RESEND_FROM_DOMAIN=mail.twinmos.com
RESEND_FROM_EMAIL=noreply@twinmos.com
RESEND_WEBHOOK_SECRET=<SECRET>

# ─── Analytics ───
PLAUSIBLE_BASE_URL=https://analytics.twinmos.com
PLAUSIBLE_SECRET_KEY=<32+ CHAR SECRET>
PLAUSIBLE_DATABASE_URL=postgres://.../plausible_production
PLAUSIBLE_DOMAIN=twinmos.com

# ─── Sentry ───
SENTRY_DSN=https://<KEY>@o<ORG>.ingest.sentry.io/<PROJECT>
SENTRY_AUTH_TOKEN=sntrys_<TOKEN>
SENTRY_ORG=twinmos
SENTRY_PROJECT=twinmos-website-backend
SENTRY_RELEASE=backend@<VERSION>
SENTRY_ENVIRONMENT=production

# ─── Cloudflare ───
CLOUDFLARE_API_TOKEN=<TOKEN>
CLOUDFLARE_ACCOUNT_ID=<ID>
CLOUDFLARE_ZONE_ID=<ID>
CLOUDFLARE_PAGES_PROJECT=twinmos-website

# ─── Auth ───
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=604800
JWT_ALGORITHM=RS256
JWT_PRIVATE_KEY=<PEM>
JWT_PUBLIC_KEY=<PEM>

# ─── Security ───
CSP_REPORT_URI=https://o<ORG>.ingest.sentry.io/api/<PROJECT>/security/?sentry_key=<KEY>
HSTS_MAX_AGE=31536000
RATE_LIMIT_PUBLIC=100
RATE_LIMIT_AUTH=1000
RATE_LIMIT_FORM=10
CLOUDFLARE_TURNSTILE_SECRET=0x4AAAAAA...
ENCRYPTION_KEY=<32_BYTE_HEX>

# ─── Redis (Phase 2+) ───
REDIS_URL=redis://localhost:6379

# ─── HubSpot CRM ───
HUBSPOT_API_KEY=<TOKEN>
HUBSPOT_PORTAL_ID=<ID>
```

### 14.2 Staging Environment

Staging uses the same variable names with `_STAGING` suffix in Coolify, or separate `.env.staging` file. Key differences:
- All URLs use `staging.twinmos.com`
- Database name: `twinmos_staging`
- B2 bucket: `twinmos-assets-staging`
- Sentry project: `twinmos-website-staging`
- Lower rate limits for testing

### 14.3 Development Environment

- All URLs use `dev.twinmos.com`
- Database name: `twinmos_development`
- B2 bucket: `twinmos-assets-development`
- Sentry project: `twinmos-website-development`
- Relaxed rate limits
- Debug logging enabled

### 14.4 Local Environment

- URLs use `localhost`
- Database name: `twinmos_dev`
- Local filesystem for uploads (no B2)
- Console output for email (no Resend)
- Optional Sentry DSN (or disabled)
- Test Turnstile keys

---

## 15. Variable Validation

### 15.1 Startup Validation

Both frontend and backend validate required environment variables at startup using Zod schemas. Missing or invalid values throw descriptive errors and prevent application start.

### 15.2 Validation Schema (Backend Example)

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.string().transform(Number).default('1337'),
  DATABASE_CLIENT: z.literal('postgres'),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.string().transform(Number).default('5432'),
  DATABASE_NAME: z.string().min(1),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(8),
  DATABASE_SSL: z.string().transform((v) => v === 'true'),
  MEILISEARCH_HOST: z.string().url(),
  MEILISEARCH_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith('re_'),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

### 15.3 Secret Rotation Checklist

| Step | Action | Owner |
|------|--------|-------|
| 1 | Generate new secret | DevOps |
| 2 | Update in Coolify / `.env` | DevOps |
| 3 | Restart affected services | DevOps |
| 4 | Verify application health | DevOps |
| 5 | Revoke old secret (if applicable) | DevOps |
| 6 | Update password manager / vault | DevOps |
| 7 | Document rotation in audit log | DevOps |

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0
**Issued:** 2 May 2026
**Next Review:** Upon environment provisioning and quarterly thereafter
**Canonical Location:** `H.1 - Local and Environment Setup/TwinMOSWebsiteEnvironmentVariablesReference.md`
