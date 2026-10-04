# TwinMOS Website — Database Migration Runbook

**Document ID:** H.4-007  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteBackupRestoreRunbook.md · TwinMOSWebsiteCoolifyConfigurationGuide.md · TwinMOSWebsiteDeployment_Runbook.md

---

## 1. Overview

This runbook covers all database migration scenarios for the TwinMOS website:

1. **Strapi schema migrations** — automatic on Strapi container restart (most common)
2. **Strapi config-sync** — roles, permissions, settings propagation across environments
3. **PostgreSQL version upgrades** — major version upgrades (e.g., PG 16 → PG 17)
4. **Data migrations** — bulk content import/export operations
5. **Phase 3 commerce migration** — WooCommerce product data → Medusa

---

## 2. How Strapi Migrations Work

### 2.1 Automatic Schema Migrations

Strapi 5 uses its own migration system. When you change content types in the Strapi Content-Type Builder (or modify content type JSON files directly), Strapi:

1. Detects the schema delta on startup
2. Automatically generates and runs the required `ALTER TABLE` / `CREATE TABLE` SQL
3. Records the migration in the `strapi_migrations` table

**This is fully automatic — no manual SQL is required for Strapi content type changes.**

```bash
# Verify migrations ran after deployment
docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -c \
  "SELECT name, created_at FROM strapi_migrations ORDER BY created_at DESC LIMIT 10;"
```

### 2.2 What config-sync Manages

`strapi-plugin-config-sync` synchronises configuration that lives in the database (not in content type JSON files):

| Config Type | Example | Synced? |
|-------------|---------|---------|
| Roles | Editor, Author | ✅ Yes |
| Permissions | Editor can publish products | ✅ Yes |
| Settings | Upload provider settings | ✅ Yes |
| Admin users | Individual admin accounts | ❌ No (manual) |
| Content records | Actual product data | ❌ No (separate) |

```bash
# Check diff between local config-sync files and current database
docker exec twinmos-strapi-1 \
  ./node_modules/.bin/strapi config-sync diff

# Export current DB config to JSON files (creates/updates config-sync/*.json)
docker exec twinmos-strapi-1 \
  ./node_modules/.bin/strapi config-sync export

# Import config from JSON files into database
docker exec twinmos-strapi-1 \
  ./node_modules/.bin/strapi config-sync import --force
```

---

## 3. Pre-Migration Checklist

Complete before ANY migration to production:

```
□ BACKUP: Full pg_dump backup completed and verified (within last 2 hours)
  docker exec twinmos-postgres-1 pg_dump -U strapi_user strapi_prod | wc -c
  (Confirm non-zero output)

□ BACKUP LABELLED: Upload backup to B2 with explicit pre-migration label
  Run: /opt/twinmos/backup/backup-postgres.sh
  Then rename in B2: b2 copy-file <source-id> daily/ pre-migration-YYYYMMDD.tar.gpg

□ TESTED: Migration tested on dev environment first, then staging
  Verify: strapi config-sync diff on staging shows no unexpected changes

□ ROLLBACK PLAN: pg_restore procedure confirmed accessible
  (TwinMOSWebsiteBackupRestoreRunbook.md §4.1)

□ WINDOW: Migration scheduled during low-traffic window (02:00–04:00 UTC)
  Avoid Monday–Friday 15:00–22:00 UTC (MENA peak business hours = 19:00–02:00 GST)

□ NOTIFICATION: Post in Slack #ops:
  "DB migration scheduled for [time UTC]. 
   Services may be unavailable for ~5 min during restart."

□ DEPLOYMENT FROZEN: No other deploys during migration window
```

---

## 4. Standard Strapi Migration Procedure (Production)

### 4.1 Schema Change Migration

This covers: adding/removing content types, adding/removing fields, changing field types.

```bash
# STEP 1: Take pre-migration backup
/opt/twinmos/backup/backup-postgres.sh
echo "Backup completed: $(date -u)"

# STEP 2: Verify backup
LATEST=$(b2 ls --long twinmos-backups-prod/daily/ | sort -r | head -1 | awk '{print $NF}')
echo "Latest backup: ${LATEST}"
b2 ls --long "twinmos-backups-prod/${LATEST}"

# STEP 3: Check current Strapi migration state
docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -c \
  "SELECT name, created_at FROM strapi_migrations ORDER BY created_at DESC LIMIT 5;"

# STEP 4: Record current row counts (for verification after migration)
docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -c \
  "SELECT schemaname, tablename, n_live_tup 
   FROM pg_stat_user_tables 
   WHERE n_live_tup > 0
   ORDER BY n_live_tup DESC 
   LIMIT 20;"

# STEP 5: Deploy new Strapi image via Coolify
# Coolify → Applications → twinmos-strapi → Deployments → Deploy
# OR trigger via GitHub Actions: push to main branch → CI deploys automatically

# Monitor deployment:
# Coolify → Applications → twinmos-strapi → Logs

# STEP 6: Monitor Strapi startup logs for migration output
docker logs -f twinmos-strapi-1 --since 5m | grep -E "migration|ERROR|WARN|info"
# Expected output:
# [info] Running migration: xxxx_create_products_table.js
# [info] Migration complete

# STEP 7: Verify Strapi admin accessible
curl https://admin.twinmos.com/admin
# Expected: HTTP 200

# STEP 8: Verify API health
curl https://api.twinmos.com/api/_health
# Expected: {"data":{"server":"running"}}

# STEP 9: Check new migration was recorded
docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -c \
  "SELECT name, created_at FROM strapi_migrations ORDER BY created_at DESC LIMIT 5;"
# Should show new migration entry with recent timestamp

# STEP 10: Verify row counts match (or increase if new content added)
docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -c \
  "SELECT schemaname, tablename, n_live_tup 
   FROM pg_stat_user_tables 
   WHERE n_live_tup > 0
   ORDER BY n_live_tup DESC 
   LIMIT 20;"

# STEP 11: Post to Slack #ops
# "DB migration complete at [time UTC]. All services healthy. Migration: [description]"
```

### 4.2 Config-Sync Migration (Roles & Permissions)

Run whenever roles/permissions change or after restoring to a new environment:

```bash
# STEP 1: Compare current DB config vs config-sync JSON files
docker exec twinmos-strapi-1 \
  ./node_modules/.bin/strapi config-sync diff

# Review the diff — only expected changes should appear

# STEP 2: If diff looks correct, import config
docker exec twinmos-strapi-1 \
  ./node_modules/.bin/strapi config-sync import --force

# STEP 3: Verify roles/permissions in Strapi admin
# Settings → Roles → Review Editor, Author, Admin roles
# Settings → Users & Permissions → Roles → Verify API permissions correct
```

---

## 5. Rollback Procedure

If migration causes errors:

### 5.1 Quick Rollback (Schema rollback via previous Strapi image)

```bash
# OPTION 1: Deploy previous Strapi Docker image via Coolify
# Coolify → Applications → twinmos-strapi → Deployments
# Select previous successful deployment → Redeploy
# NOTE: Strapi does NOT automatically reverse migrations on downgrade
# If the schema change is destructive (column drop), must use DB restore (Option 2)

# OPTION 2: Full DB restore from pre-migration backup
# See TwinMOSWebsiteBackupRestoreRunbook.md §4.1
# Use the backup labelled "pre-migration-YYYYMMDD"

# Verify rollback:
curl https://api.twinmos.com/api/_health
# Expected: {"data":{"server":"running"}}
```

### 5.2 When to Use Each Option

| Migration Type | Quick Rollback (redeploy old image) | DB Restore Required |
|---------------|-------------------------------------|---------------------|
| Added new column (nullable) | ✅ Safe | Not needed |
| Added new table | ✅ Safe | Not needed |
| Removed column | ⚠️ Old image may error on missing column | ✅ Yes — restore DB |
| Dropped table | ❌ Data lost — DB restore required | ✅ Yes |
| Changed field type | ⚠️ Depends on type change | ✅ Recommended |
| Added NOT NULL constraint | ❌ Old data may be invalid | ✅ Recommended |

---

## 6. Data Migration Procedures

### 6.1 Bulk Content Import (CSV)

For importing product catalog data from spreadsheets or legacy systems:

**Plugin:** `strapi-plugin-import-export-entries` must be installed.

```bash
# Prepare CSV file format for products:
# CSV columns must match Strapi field names exactly
# Example: name, slug, description, specifications, category, status

# Import via Strapi admin:
# Content Manager → Products → Import → Upload CSV → Map fields → Import

# Import via API (for automation):
curl -X POST "https://api.twinmos.com/api/import-export-entries/content/import" \
  -H "Authorization: Bearer ${ADMIN_JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "api::product.product",
    "data": [
      {"name": "VoltX DDR5 16GB", "slug": "voltx-ddr5-16gb", "status": "published"}
    ],
    "format": "json"
  }'
```

**Verification after import:**

```bash
# Count imported records
curl "https://api.twinmos.com/api/products?pagination[pageSize]=1" | jq '.meta.pagination.total'

# Verify specific record
curl "https://api.twinmos.com/api/products?filters[slug][$eq]=voltx-ddr5-16gb" | jq '.data[0]'
```

### 6.2 Bulk Content Export

```bash
# Export all products to JSON
curl "https://api.twinmos.com/api/products?pagination[pageSize]=1000" \
  -H "Authorization: Bearer ${ADMIN_JWT_TOKEN}" \
  > products-export-$(date +%Y%m%d).json

# Export via Strapi admin plugin
# Content Manager → Products → Export → Select all → Export JSON/CSV
```

### 6.3 Environment Seeding (Dev/Staging)

For populating dev/staging with representative data:

```bash
# Export from production (sanitize personal data first)
docker exec twinmos-postgres-1 pg_dump \
  --username=strapi_user \
  --format=custom \
  --table='products' \
  --table='categories' \
  --table='files' \
  strapi_prod \
  > /tmp/seed-data.dump

# Restore to staging
docker cp /tmp/seed-data.dump twinmos-postgres-staging-1:/tmp/
docker exec twinmos-postgres-staging-1 pg_restore \
  --username=strapi_user \
  --dbname=strapi_staging \
  --no-owner \
  --clean \
  /tmp/seed-data.dump
```

---

## 7. PostgreSQL Version Upgrade (Major Version)

**When relevant:** Upgrading from PostgreSQL 16 → 17 (or future versions). Not needed for minor version updates (16.1 → 16.2 — handled by Docker image update).

**Important:** PostgreSQL major version upgrades require data directory migration via `pg_upgrade`. **Do not simply change the Docker image version without following this procedure.**

```bash
# STEP 1: Full backup + verify
/opt/twinmos/backup/backup-postgres.sh

# STEP 2: Take Hetzner snapshot for rollback
# Hetzner Console → twinmos-production-01 → Snapshots → Create

# STEP 3: Export data with old version
docker exec twinmos-postgres-1 pg_dumpall \
  --username=strapi_user \
  > /tmp/pg_dumpall_pre_upgrade.sql

# STEP 4: Stop all services that use PostgreSQL
docker stop twinmos-strapi-1 twinmos-plausible-1

# STEP 5: Stop old PostgreSQL
docker stop twinmos-postgres-1
docker rename twinmos-postgres-1 twinmos-postgres-old

# STEP 6: Start new PostgreSQL version with EMPTY data directory
docker run -d \
  --name twinmos-postgres-1 \
  -e POSTGRES_USER=strapi_user \
  -e POSTGRES_PASSWORD=<from-bitwarden> \
  -e POSTGRES_DB=strapi_prod \
  -v twinmos-postgres-data-new:/var/lib/postgresql/data \
  postgres:17  # new version

# STEP 7: Restore from dump
docker exec -i twinmos-postgres-1 psql -U strapi_user < /tmp/pg_dumpall_pre_upgrade.sql

# STEP 8: Restart services
docker start twinmos-strapi-1 twinmos-plausible-1

# STEP 9: Verify
curl https://api.twinmos.com/api/_health
docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -c \
  "SELECT count(*) FROM products;"

# STEP 10: If successful, delete old data volume (after 48h stable)
# docker volume rm twinmos-postgres-data
# docker rm twinmos-postgres-old
```

---

## 8. Phase 3 — WooCommerce to Medusa Migration (Reference)

**Context:** If TwinMOS has an existing WooCommerce store, Phase 3 requires migrating product/order/customer data to Medusa JS.

**Scope:** Product catalog, categories, SKUs, pricing, images. Customer accounts and order history handled separately by business decision.

### 8.1 ETL Script Approach

```javascript
// scripts/woocommerce-to-medusa.ts
// Reads WooCommerce REST API → transforms → writes to Medusa API

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import MedusaClient from '@medusajs/medusa-js';

const woo = new WooCommerceRestApi({
  url: process.env.WOO_URL,
  consumerKey: process.env.WOO_CONSUMER_KEY,
  consumerSecret: process.env.WOO_CONSUMER_SECRET,
  version: 'wc/v3'
});

const medusa = new MedusaClient({ baseUrl: process.env.MEDUSA_API_URL });

async function migrateProducts() {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data: wooProducts } = await woo.get('products', {
      per_page: 100,
      page,
      status: 'publish'
    });

    if (wooProducts.length === 0) { hasMore = false; break; }

    for (const woo of wooProducts) {
      const medusaProduct = {
        title: woo.name,
        handle: woo.slug,
        description: woo.description,
        status: 'published',
        variants: woo.variations.length > 0
          ? await mapVariants(woo)
          : [{ title: 'Default', prices: [{ currency_code: 'usd', amount: Math.round(parseFloat(woo.price) * 100) }] }],
        images: woo.images.map(img => ({ url: img.src })),
        categories: await mapCategories(woo.categories),
      };

      try {
        await medusa.admin.products.create(medusaProduct);
        console.log(`✓ Migrated: ${woo.name}`);
      } catch (err) {
        console.error(`✗ Failed: ${woo.name}: ${err.message}`);
      }
    }
    page++;
  }
}
```

### 8.2 Migration Phases

```
Phase 1 — Preparation (1 week before migration):
  □ Export WooCommerce product data to CSV for review
  □ Set up Medusa on staging, run migration script against WooCommerce staging export
  □ Verify product count and spot-check 20 products manually
  □ Validate pricing, categories, images, variants

Phase 2 — Staged migration (migration day):
  □ Run full migration script against production WooCommerce (read-only)
  □ Verify 100% of products migrated to Medusa staging
  □ Put WooCommerce in maintenance mode (no new orders)
  □ Run final incremental migration for any products added in last 24h

Phase 3 — Cutover:
  □ Switch twinmos.com/shop to Medusa Storefront
  □ Redirect old WooCommerce URLs to new Medusa product URLs
  □ Monitor Sentry for any 404s or product-not-found errors

Phase 4 — Decommission (4 weeks post-migration):
  □ Archive WooCommerce database
  □ Remove WooCommerce WordPress installation
  □ Redirect all legacy /product/ URLs to new /products/ paths
```

### 8.3 Dual-Write Period

During the transition, write new products to BOTH WooCommerce and Medusa in parallel:

```javascript
// In Strapi lifecycle (product afterCreate):
async function afterCreate(event) {
  const { result } = event;
  
  // Write to Medusa (new system)
  await medusaClient.products.create(transformToMedusa(result));
  
  // Write to WooCommerce legacy (if still active)
  if (process.env.WOO_DUAL_WRITE === 'true') {
    await wooClient.post('products', transformToWoo(result));
  }
}
```

---

## 9. Migration Verification Checklist

After any migration, verify:

```
□ Strapi API health: curl https://api.twinmos.com/api/_health → "running"
□ Products accessible: curl "https://api.twinmos.com/api/products?pagination[pageSize]=1" → count > 0
□ Admin panel accessible: https://admin.twinmos.com/admin → HTTP 200
□ Search functional: curl "https://search.twinmos.com/indexes/products/search" -d '{"q":"DDR5"}' → hits > 0
□ No new Sentry errors in last 10 min
□ Row counts match pre-migration expectations
□ Config-sync diff shows no unexpected changes
□ Post to Slack #ops: "Migration complete: [description] at [time UTC]"
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §17.2, §22.3*
