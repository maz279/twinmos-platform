# TwinMOS Website — Data Migration Plan

**Document Reference:** TWN-ENG-D2-005
**Version:** 1.0
**Status:** FINAL
**Date:** 1 May 2026
**Owner:** Data Architect / Backend Lead
**Audience:** Unisoft Engineering, TwinMOS IT, Content Team

---

## 1. Overview

This document defines the comprehensive data migration strategy for the TwinMOS corporate website. The migration transfers 454 markdown files, product data, retailer information, compatibility QVL data, and legacy URL redirects into the new Strapi v5 + PostgreSQL 16 infrastructure.

### 1.1 Migration Scope

| Source | Count | Destination | Phase |
|--------|-------|-------------|-------|
| Markdown content files | 454 | Astro Content Layer + Strapi | P1 |
| Product SKUs | 100+ | Strapi Product/SKU collections | P1 |
| Distributor records | ~50 | Strapi Distributor collection | P1 |
| Retailer locations | ~200 | Strapi Retailer collection | P1 |
| Compatibility QVL entries | ~500 | Strapi Compatibility collection | P1 |
| Legacy URL redirects | ~100 | Strapi Redirect collection | P1 |
| Newsletter subscribers | TBD | Strapi + Resend | P2 |
| Warranty registrations | TBD | Strapi Warranty collection | P2 |

---

## 2. Migration Architecture

```
+----------------+     +----------------+     +----------------+
|  SOURCE DATA   | --> |  MIGRATION     | --> |  DESTINATION   |
|                |     |  PIPELINE      |     |                |
+----------------+     +----------------+     +----------------+
| 454 Markdown   |     | Parse/Transform|     | Strapi v5 API  |
| files          |     | Validate       |     | PostgreSQL 16  |
| Legacy DB      |     | Enrich         |     | MeiliSearch    |
| CSV/Excel      |     | Deduplicate    |     | Backblaze B2   |
| Manual entry   |     | Localize       |     | Astro Content  |
+----------------+     +----------------+     +----------------+
```

---

## 3. Migration Phases

### Phase 1: Content Migration (Month 3-4)

**Objective:** Migrate all static content to Astro Content Layer and Strapi CMS

#### 3.1.1 Markdown Content (454 files)

| Step | Action | Tool | Owner |
|------|--------|------|-------|
| 1 | Inventory all markdown files | Custom script | Backend |
| 2 | Parse frontmatter + body | gray-matter | Backend |
| 3 | Validate against Zod schema | zod | Backend |
| 4 | Map to Strapi collections | Custom mapper | Backend |
| 5 | Upload via Strapi API | strapi-sdk-js | Backend |
| 6 | Generate Astro collections | File copy | Frontend |
| 7 | Verify with checksum | Custom script | QA |

#### 3.1.2 Product Data (100+ SKUs)

| Step | Action | Tool | Owner |
|------|--------|------|-------|
| 1 | Extract from master SKU reference | Manual | Content |
| 2 | Normalize specifications | Custom script | Backend |
| 3 | Import to Strapi Product collection | strapi-import | Backend |
| 4 | Create SKU variants | Strapi API | Backend |
| 5 | Upload product images | Backblaze B2 API | Backend |
| 6 | Link images to products | Strapi API | Backend |
| 7 | Validate completeness | Custom script | QA |

#### 3.1.3 Distributor & Retailer Data

| Step | Action | Tool | Owner |
|------|--------|------|-------|
| 1 | Collect from business team | Spreadsheet | Business |
| 2 | Geocode addresses | OpenStreetMap Nominatim | Backend |
| 3 | Validate country codes | iso-3166 | Backend |
| 4 | Import to Strapi | CSV import plugin | Backend |
| 5 | Verify on map | Manual | QA |

#### 3.1.4 Compatibility QVL Data

| Step | Action | Tool | Owner |
|------|--------|------|-------|
| 1 | Extract from existing QVL | Manual | Content |
| 2 | Normalize motherboard data | Custom script | Backend |
| 3 | Map to SKU references | Custom script | Backend |
| 4 | Import to Strapi | Batch API | Backend |
| 5 | Validate relationships | Custom script | QA |

### Phase 2: User Data Migration (Month 6-7)

| Data | Source | Destination | Method |
|------|--------|-------------|--------|
| Newsletter subscribers | Legacy system | Strapi + Resend | API sync |
| Warranty registrations | Legacy system | Strapi Warranty | CSV import |
| Form submissions | Legacy system | Strapi Forms | Database dump |

### Phase 3: E-Commerce Data (Month 10-12)

| Data | Source | Destination | Method |
|------|--------|-------------|--------|
| Inventory | ERP system | Medusa.js | API integration |
| Pricing | ERP system | Medusa.js | API integration |
| Orders | Legacy system | Medusa.js | CSV import |

---

## 4. Migration Tools

### 4.1 Strapi Import/Export

```bash
# Export from source
npm run strapi export -- --file source-data.tar.gz

# Import to destination
npm run strapi import -- --file source-data.tar.gz --exclude config
```

### 4.2 Custom Migration Scripts

```typescript
// scripts/migrate-content.ts
import { glob } from 'glob';
import matter from 'gray-matter';
import { strapi } from '../lib/strapi-client';

async function migrateContent() {
  const files = await glob('content/**/*.md');
  for (const file of files) {
    const { data, content } = matter.read(file);
    await strapi.create('api::page.page', {
      title: data.title,
      slug: data.slug,
      content: content,
      locale: data.locale || 'en',
    });
  }
}
```

### 4.3 CSV Import Plugin

| Feature | Configuration |
|---------|--------------|
| Delimiter | Auto-detect (comma, semicolon, tab) |
| Encoding | UTF-8 |
| Batch size | 100 rows |
| Error handling | Skip row, log error |
| Duplicate handling | Update existing by unique key |

---

## 5. Validation & Verification

### 5.1 Pre-Migration Checks

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Source data integrity | Hash checksum | Match expected |
| Schema compatibility | Zod validation | 0 errors |
| Locale coverage | Script count | All 9 locales present |
| Image availability | URL check | 404 rate < 1% |

### 5.2 Post-Migration Verification

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Row count match | SQL COUNT | Source = Destination |
| Content accuracy | Spot check 10% | 100% match |
| Relationship integrity | FK check | 0 orphaned records |
| Search index sync | MeiliSearch query | All records indexed |
| Image rendering | Visual check | All images load |

### 5.3 Rollback Plan

```
1. Pre-migration snapshot: pg_dump full database
2. Migration runs in transaction (where possible)
3. On failure: restore from snapshot
4. RTO: 2 hours
5. RPO: 0 (snapshot taken immediately before)
```

---

## 6. Timeline

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| Migration script development | Month 2 | Working scripts |
| Test migration (staging) | Month 3 | Validated data |
| Content migration (production) | Month 4 | Live content |
| Product data migration | Month 4 | Live products |
| User data migration | Month 6 | Live user data |
| E-commerce data migration | Month 10 | Live commerce |

---

## Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Data Architect | (TBC) | _______________ | _________ |
| Backend Lead | (TBC) | _______________ | _________ |
| Content Manager | (TBC) | _______________ | _________ |
