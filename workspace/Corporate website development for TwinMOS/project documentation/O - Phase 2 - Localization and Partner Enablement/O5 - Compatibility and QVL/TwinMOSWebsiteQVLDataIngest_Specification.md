# TwinMOS Corporate Website — QVL Data Ingest Specification

**Document Reference:** TWN-P2-QVL-INGEST-2027-001  
**Document Version:** 1.0  
**Status:** APPROVED — For development implementation  
**Phase:** Phase 2 — Localization & Partner Enablement  
**Feature:** QVL (Qualified Vendor List) Data Ingest Pipeline  
**Planned Delivery:** Phase 2, Sprint 7 (March 2027)  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead + TwinMOS Product Engineering  
**Audience:** Unisoft Dev B (Backend), TwinMOS Product Team, QA/Testing Team  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Source References:**  
- Tech Stack v1.1 §10.5 (QVL Ingest Pipeline), §5.2 (Strapi plugins)  
- BRD v3.0 BR-2.x (QVL validation rules)  
- Compatibility Finder Algorithm Spec (O5 folder)

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Data Sources & Cadence](#2-data-sources--cadence)
3. [CSV Schema Specification](#3-csv-schema-specification)
4. [Ingest Pipeline Architecture](#4-ingest-pipeline-architecture)
5. [Validation Rules](#5-validation-rules)
6. [Deduplication Logic](#6-deduplication-logic)
7. [MeiliSearch Re-index Trigger](#7-meilisearch-re-index-trigger)
8. [Device Normalization](#8-device-normalization)
9. [Ingest Job Record & Logging](#9-ingest-job-record--logging)
10. [Manual Entry Interface (Strapi Admin)](#10-manual-entry-interface-strapi-admin)
11. [Community Compatibility Report Pipeline](#11-community-compatibility-report-pipeline)
12. [Vendor QVL Scrape Pipeline](#12-vendor-qvl-scrape-pipeline)
13. [Error Handling & Alerting](#13-error-handling--alerting)
14. [Testing & Validation Procedure](#14-testing--validation-procedure)
15. [Acceptance Criteria](#15-acceptance-criteria)

---

## 1. Overview & Purpose

### 1.1 Problem Solved

The Compatibility Finder (see Algorithm Spec) requires a rich, accurate, and continuously updated database of compatibility entries linking TwinMOS memory and SSD SKUs to specific devices (laptops, desktops) and motherboards. Without a systematic ingest pipeline, this database would require manually entering thousands of compatibility records one-by-one in Strapi admin — infeasible at scale.

### 1.2 Phase 2 Target

| Metric | Phase 1 | Phase 2 Target |
|--------|---------|----------------|
| Motherboard QVL entries | 100 boards manually entered | 500+ boards |
| Device profiles (laptops + desktops) | 200 devices | 2,000+ devices |
| QVL entries per SKU (average) | 5 | 50+ |
| Total compatibility records | ~500 | 10,000+ |

### 1.3 Data Sources Summary

| Source | Type | Cadence | Owner |
|--------|------|---------|-------|
| TwinMOS QA Lab (manual) | QVL Certified | Continuous | Product Engineering |
| Manufacturing partner QVL feed | Tested/Certified | Monthly CSV | Procurement |
| Community submissions | Reported-Working | Ad hoc | Moderated by Product Marketing |
| Vendor QVL scrape (ASUS, MSI, Gigabyte, Lenovo, Dell, HP) | Vendor-sourced | Quarterly | Engineering automation |
| Strapi admin manual entry | Any status | On-demand | Support / Product |

---

## 2. Data Sources & Cadence

### 2.1 TwinMOS QA Lab (Continuous)

TwinMOS product engineers physically test memory and SSD modules on specific platforms. Results are entered directly in Strapi admin or via CSV batch upload after a test campaign (e.g., VOLTX DDR5 RGB tested on 50 new Z890 boards post-COMPUTEX 2025 launch).

**Cadence:** Ongoing; typically 5–20 new entries per week from QA team.

### 2.2 Manufacturing Partner QVL Feed (Monthly)

TwinMOS's Taiwan-based manufacturing partners maintain QVL data from their own lab testing. This data is supplied as a structured CSV on a monthly basis.

**Cadence:** 1st of each month (automated import).  
**Volume:** 200–500 new or updated records per import.  
**Format:** Proprietary CSV (TwinMOS spec; see §3).

### 2.3 Community Submissions (Ad Hoc)

Customers can submit compatibility reports via a form on the website:
- "I have [product] working in [laptop/motherboard]" 
- These create `CompatibilityReport` records in Strapi for human review before being promoted to `Compatibility` entries as `Reported-Working` status

**Cadence:** Ad hoc; moderation review weekly.

### 2.4 Vendor QVL Scrape (Quarterly)

Major motherboard vendors (ASUS, MSI, GIGABYTE, ASRock) and laptop vendors (Lenovo, Dell, HP) publish official QVL pages on their support sites. A Node.js scraper collects this data quarterly, converts it to the TwinMOS QVL CSV format, and runs it through the standard ingest pipeline.

**Cadence:** Quarterly (January, April, July, October).  
**Tech Stack:** Node.js scraper + Playwright + CSV transformer.  
**Coverage targets for Phase 2:** ASUS Z790/Z890/B860, MSI Z790/Z890/B760, GIGABYTE Z790/Z890, ASRock Z790.

---

## 3. CSV Schema Specification

### 3.1 TwinMOS QVL CSV Format

All ingest sources must convert their data to the TwinMOS QVL CSV format before ingestion:

```csv
source_type,device_brand,device_type,device_model,product_sku,qvl_status,tested_speed_mhz,tested_capacity_gb,tested_capacity_config,tested_as_dual_channel,bios_version,bios_notes,slot_config,test_date,tester,notes
QA,ASUS,motherboard,ROG Strix Z790-E Gaming WIFI,TM-D5-VOLT-32G-6000,Certified,6000,32,"2x16GB",true,F12,Requires BIOS F12+,A2+B2,2026-11-15,TwinMOS QA,Full stress test passed
QA,HP,laptop,EliteBook 840 G10,TM-D5-VOLT-SODIMM-16G-5200,Certified,5200,16,"1x16GB",false,1.08,,Slot 1,2026-10-20,TwinMOS QA,
Partner,GIGABYTE,motherboard,AORUS Master Z790,TM-D5-VOLT-RGB-32G-6000,Tested,6000,32,"2x16GB",true,F5,,A2+B2,2026-09-01,Partner Lab,RGB sync confirmed
```

### 3.2 Column Definitions

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `source_type` | enum | Yes | `QA` / `Partner` / `Community` / `VendorScrape` |
| `device_brand` | string | Yes | Normalized brand name (see §8) |
| `device_type` | enum | Yes | `laptop` / `desktop` / `motherboard` / `server` |
| `device_model` | string | Yes | Normalized model name (see §8) |
| `product_sku` | string | Yes | Must match a valid `Product.sku` in Strapi |
| `qvl_status` | enum | Yes | `Certified` / `Tested` / `Reported-Working` / `Spec-Compatible` / `Reported-Issue` |
| `tested_speed_mhz` | integer | Yes | Speed at which tested (e.g., 6000) |
| `tested_capacity_gb` | integer | Yes | Total capacity tested (e.g., 32) |
| `tested_capacity_config` | string | Yes | Config notation (e.g., "2x16GB") |
| `tested_as_dual_channel` | boolean | Yes | `true` / `false` |
| `bios_version` | string | No | BIOS version when tested (e.g., "F12") |
| `bios_notes` | string | No | Free text notes visible to customer |
| `slot_config` | string | No | Slot recommendation (e.g., "A2+B2") |
| `test_date` | date | Conditional | Required for QA/Partner sources; YYYY-MM-DD |
| `tester` | string | Conditional | Required for QA/Partner: name or lab identifier |
| `notes` | string | No | Internal notes (not customer-visible) |

### 3.3 Enum Values

```ts
type SourceType = 'QA' | 'Partner' | 'Community' | 'VendorScrape';
type DeviceType = 'laptop' | 'desktop' | 'motherboard' | 'server';
type QVLStatus = 'Certified' | 'Tested' | 'Reported-Working' | 'Spec-Compatible' | 'Reported-Issue';
```

---

## 4. Ingest Pipeline Architecture

### 4.1 Pipeline Flow

```
Data Source (CSV file / Strapi admin)
    │
    ▼
[Step 1: File Receipt]
    │ SFTP / S3 bucket / Strapi upload / Manual trigger
    │
    ▼
[Step 2: Pre-validation]
    │ CSV schema validation (column presence, types)
    │ Encoding check (must be UTF-8)
    │ Row count check (> 0, < 50,000 per batch)
    │ Reject entire file if structural errors found
    │
    ▼
[Step 3: Row-level Validation]
    │ Per-row validation rules (see §5)
    │ Collect errors per row
    │ Continue processing valid rows; skip invalid rows
    │
    ▼
[Step 4: Device Normalization]
    │ Normalize device_brand + device_model
    │ Find or create Device record in Strapi
    │
    ▼
[Step 5: Deduplication]
    │ Check for existing Compatibility record on:
    │ (device_id, product_id, tested_speed_mhz)
    │ If exists: update if incoming source_type has higher authority
    │ If not exists: insert
    │
    ▼
[Step 6: Upsert to Strapi]
    │ Batch upsert Compatibility records
    │ Use strapi-plugin-import-export-entries or custom Strapi controller
    │
    ▼
[Step 7: MeiliSearch Re-index]
    │ Strapi lifecycle hook afterCreate/afterUpdate fires
    │ Triggers MeiliSearch index rebuild for `compatibility` index
    │
    ▼
[Step 8: Job Record Update]
    │ Update IngestJob record with final stats
    │ Store processed CSV in Backblaze B2 (encrypted, 12-month retention)
    │ Slack notification: success summary or failure alert
```

### 4.2 Ingest Trigger Methods

| Method | Use Case | Authentication |
|--------|----------|----------------|
| Strapi cron job (1st of month) | Scheduled monthly partner feed import | Internal cron |
| Strapi admin manual trigger | On-demand: new product launch, QA campaign | Admin JWT |
| S3 drop folder watcher | Real-time: partner drops CSV to B2 bucket | S3 webhook → Strapi endpoint |
| API endpoint (authenticated) | CI/CD: automated quarterly vendor scrape | Service account JWT |

### 4.3 Batch Processing

To prevent memory issues with large CSV files (up to 50,000 rows), rows are processed in batches of 500:

```ts
async function processBatch(rows: QVLRow[], jobId: string): Promise<BatchResult> {
  const results = { inserted: 0, updated: 0, skipped: 0, errors: 0 };
  
  for (const row of rows) {
    try {
      const device = await findOrCreateDevice(row);
      const product = await findProduct(row.product_sku);
      
      if (!product) {
        results.errors++;
        logRowError(jobId, row, 'product_sku not found in Strapi');
        continue;
      }
      
      const dedupeKey = `${device.id}-${product.id}-${row.tested_speed_mhz}`;
      const existing = await findCompatibilityByKey(dedupeKey);
      
      if (existing) {
        if (shouldOverwrite(existing.source_type, row.source_type)) {
          await updateCompatibility(existing.id, mapRowToCompatibility(row, device, product));
          results.updated++;
        } else {
          results.skipped++;
        }
      } else {
        await createCompatibility(mapRowToCompatibility(row, device, product));
        results.inserted++;
      }
    } catch (err) {
      results.errors++;
      logRowError(jobId, row, err.message);
    }
  }
  
  return results;
}
```

---

## 5. Validation Rules

### 5.1 File-Level Rules

| Rule | Action on Failure |
|------|------------------|
| File encoding is UTF-8 | Reject entire file; Slack alert |
| Required columns present (all 11 mandatory columns) | Reject entire file |
| File size ≤ 10 MB (approx 50,000 rows) | Reject; request split into multiple files |
| Row count > 0 | Reject |
| `source_type` column contains only valid enum values | Reject entire file |

### 5.2 Row-Level Validation Rules (BR-2.x)

| Rule | Action on Failure |
|------|------------------|
| `product_sku` must exist in Strapi `Product` collection | Skip row; error log |
| `device_brand` must be in known brands list or within edit distance 2 of a known brand | Skip row if no match; warning log |
| `device_model` must be ≥ 5 characters | Skip row; error log |
| `qvl_status` must be a valid enum value | Skip row; error log |
| `tested_speed_mhz` must be a positive integer ≥ 1600 and ≤ 12000 | Skip row; error log |
| `tested_capacity_gb` must be a positive integer: 2, 4, 8, 16, 32, 64, 128, 256 | Skip row; error log |
| `tested_speed_mhz` must match a speed in the product's `specifications.speeds[]` | Warning log; row still inserted |
| `test_date` must be ≤ today and ≥ 2015-01-01 if provided | Skip row if out of range |
| `tested_as_dual_channel` must be `true` or `false` | Skip row; error log |
| `qvl_status = Certified` requires `test_date` and `tester` | Skip row; error log |

### 5.3 Source Authority Hierarchy

When a row with the same deduplication key already exists, only overwrite if the incoming source has equal or higher authority:

```
QA > Partner > VendorScrape > Community
```

| Existing | Incoming | Action |
|----------|---------|--------|
| Community | VendorScrape | Overwrite |
| Community | QA | Overwrite |
| VendorScrape | Partner | Overwrite |
| Partner | QA | Overwrite |
| QA | Partner | Skip (QA is authoritative) |
| QA | Community | Skip |
| Certified | Tested (same source type) | Skip (downgrade not allowed) |
| Tested | Certified | Overwrite (upgrade allowed) |

---

## 6. Deduplication Logic

### 6.1 Deduplication Key

A compatibility entry is considered a duplicate if the combination of:
- `device_id` (resolved from brand + model + type)
- `product_id` (resolved from SKU)
- `tested_speed_mhz`

already exists in the `Compatibility` collection.

### 6.2 Deduplicate Decision Matrix

```ts
function shouldOverwrite(existingSourceType: SourceType, incomingSourceType: SourceType): boolean {
  const authority: Record<SourceType, number> = {
    'QA': 4,
    'Partner': 3,
    'VendorScrape': 2,
    'Community': 1,
  };
  return authority[incomingSourceType] >= authority[existingSourceType];
}
```

A record already `Certified` is never downgraded to `Tested` by an import, even from a QA source. Status can only be upgraded (e.g., `Tested` → `Certified`).

---

## 7. MeiliSearch Re-index Trigger

### 7.1 Incremental Re-index on Lifecycle Hook

After each compatibility record is created or updated in Strapi, the `strapi-plugin-meilisearch` lifecycle hook fires and updates the MeiliSearch `compatibility` index:

```ts
// Strapi lifecycle: Compatibility.afterCreate / afterUpdate
async function afterSave(event: StrapiLifecycleEvent) {
  const entry = event.result;
  await meiliSearch.index('compatibility').updateDocuments([
    mapCompatibilityToSearchDoc(entry)
  ]);
}
```

### 7.2 Full Re-index After Bulk Import

After a bulk import completes (500+ rows), the pipeline triggers a full re-index rather than incremental updates:

```ts
async function fullReindex() {
  const allEntries = await strapi.db.query('api::compatibility.compatibility').findMany({
    populate: ['device', 'product'],
    limit: -1,
  });
  
  await meiliSearch.index('compatibility').deleteAllDocuments();
  await meiliSearch.index('compatibility').addDocuments(
    allEntries.map(mapCompatibilityToSearchDoc),
    { primaryKey: 'id' }
  );
}
```

Full re-index time estimate: < 30 seconds for 50,000 records on MeiliSearch 1.13.x.

---

## 8. Device Normalization

### 8.1 Purpose

Different data sources use different naming conventions for the same device:
- `HP EliteBook 840 G10` vs `hp elitebook 840 g10` vs `EliteBook 840 G10 (Intel Core Ultra)` vs `840G10`

Normalization ensures these all resolve to the same `Device` record.

### 8.2 Normalization Steps

```ts
function normalizeDeviceModel(input: string): { normalized: string; aliases: string[] } {
  const cleaned = input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(wifi|wi-fi|4g|5g|lte|thunderbolt|bt|bluetooth)\b/gi, '')
    .replace(/\(.*?\)/g, '')          // Remove parenthetical suffixes
    .replace(/[^\w\s\-\.]/g, '')      // Remove special chars
    .trim();
  
  return {
    normalized: cleaned,
    aliases: [input.trim(), cleaned],
  };
}
```

### 8.3 `findOrCreateDevice` Logic

```ts
async function findOrCreateDevice(row: QVLRow): Promise<Device> {
  const { normalized, aliases } = normalizeDeviceModel(row.device_model);
  
  // Try exact match first
  let device = await strapi.db.query('api::device.device').findOne({
    where: { brand: row.device_brand, model: normalized, device_type: row.device_type }
  });
  
  if (device) return device;
  
  // Try alias match
  device = await strapi.db.query('api::device.device').findOne({
    where: { brand: row.device_brand, model_aliases: { $contains: row.device_model } }
  });
  
  if (device) {
    // Add new alias to existing device record
    await strapi.db.query('api::device.device').update({
      where: { id: device.id },
      data: { model_aliases: [...device.model_aliases, row.device_model] }
    });
    return device;
  }
  
  // Create new device record (minimal; full specs populated manually or via spec lookup)
  device = await strapi.db.query('api::device.device').create({
    data: {
      brand: row.device_brand,
      model: normalized,
      model_aliases: aliases,
      device_type: row.device_type,
      data_source: mapSourceType(row.source_type),
      verified_at: new Date(),
    }
  });
  
  return device;
}
```

---

## 9. Ingest Job Record & Logging

### 9.1 `QVLIngestJob` Collection Schema

```ts
interface QVLIngestJob {
  id: number;
  job_reference: string;          // QVL-JOB-YYYY-NNNN
  triggered_by: 'cron' | 'manual' | 'api' | 's3_watch';
  triggered_by_user?: string;    // email if manual
  source_type: SourceType;
  started_at: Date;
  completed_at?: Date;
  duration_ms?: number;
  status: 'running' | 'completed' | 'failed' | 'partial';
  
  // File info
  source_filename: string;
  source_checksum: string;       // SHA-256 of input CSV
  source_row_count: number;
  
  // Results
  rows_validated: number;
  rows_inserted: number;
  rows_updated: number;
  rows_skipped: number;
  rows_errored: number;
  
  // Error detail
  error_log: QVLIngestError[];
  
  // Archive
  archived_file_url?: string;    // Backblaze B2 URL of original CSV
}

interface QVLIngestError {
  row_number: number;
  device_model: string;
  product_sku: string;
  error_type: string;
  error_message: string;
}
```

### 9.2 Slack Notifications

**On completion:**
```
✅ QVL Ingest Job Completed
Source: Partner (Monthly Feed — December 2026)
Duration: 4m 32s
Rows: 1,245 processed | 892 inserted | 156 updated | 197 skipped | 0 errors
Finder DB: 8,432 total entries (↑892 from last run)
→ https://admin.twinmos.com/qvl-ingest/job/456
```

**On failure:**
```
🚨 QVL Ingest Job FAILED
Source: Monthly Partner Feed
Error: CSV validation failed — missing required column 'tested_as_dual_channel'
Action Required: Fix CSV format and re-upload at https://admin.twinmos.com/qvl-ingest/upload
```

---

## 10. Manual Entry Interface (Strapi Admin)

### 10.1 Single Entry

Strapi admin provides a form for adding individual compatibility entries without CSV:
- Used for urgent entries (e.g., new flagship motherboard launches)
- All fields from §3.2 are form fields
- `product_sku` uses a relational picker (shows product name + SKU dropdown)
- `device_model` has typeahead from existing `Device` records + "Create New" option
- `test_date` defaults to today

### 10.2 Bulk CSV Upload

Admin users with `Editor` or `Super Admin` role can:
1. Download a blank CSV template from Strapi admin
2. Fill in compatibility data
3. Upload via drag-and-drop in Strapi admin
4. Preview validation results (rows valid/invalid) before committing
5. Confirm import

---

## 11. Community Compatibility Report Pipeline

### 11.1 Community Report Submission Form

URL: `/products/finder/report-compatibility`

**Fields:**
- TwinMOS product used (dropdown from Product collection)
- Device brand + model (text, normalized)
- Did it work? (Yes / No / Partially)
- Speed tested (MHz, if overclock was tested)
- Dual channel tested? (Yes/No)
- BIOS version (optional)
- Notes (textarea, max 500 chars)
- Submitter email (optional; for follow-up)
- Consent checkbox

### 11.2 Moderation Queue

Community reports create a `CompatibilityReport` record in Strapi:

```
Status: PENDING_REVIEW → APPROVED (promoted to Compatibility entry as Reported-Working)
                       → REJECTED (spam / invalid)
                       → ESCALATED (requires QA follow-up)
```

**Moderation criteria:**
- Approved if: product + device combination is plausible; report is detailed enough
- Rejected if: spam, impossible hardware combination, product not in catalog
- Escalated if: reports incompatibility with a certified combination (requires engineering review)

**Moderation SLA:** Weekly review by Product Marketing team.

---

## 12. Vendor QVL Scrape Pipeline

### 12.1 Purpose

Motherboard vendors publish official QVL pages listing compatible memory modules. These pages include TwinMOS SKUs when TwinMOS submits samples for certification. The scraper automates extracting this data.

### 12.2 Scraper Architecture

```
Node.js Scraper (Playwright + Cheerio)
    │
    ├── Target URLs (quarterly updated):
    │   ├── ASUS: support.asus.com/qvl/{model}
    │   ├── GIGABYTE: gigabyte.com/Motherboard/{model}/Support#memory
    │   ├── MSI: msi.com/Motherboard/{model}/#mem-supplist
    │   └── ASRock: asrock.com/mb/spec/{model}/#Memory
    │
    ▼
[Page scraping with Playwright (headless Chromium)]
    │ Load page → wait for QVL table to render
    │ Extract: brand, speed, capacity, part_number
    │
    ▼
[Part Number Matching]
    │ Match scraped part_number against TwinMOS SKU aliases
    │ (Manufacturing part number → TwinMOS SKU mapping table)
    │
    ▼
[CSV Generation]
    │ Transform to TwinMOS QVL CSV format
    │ source_type = 'VendorScrape'
    │ qvl_status = 'Tested' (vendor-certified, not TwinMOS QA)
    │
    ▼
[Standard QVL Ingest Pipeline] (see §4)
```

### 12.3 TwinMOS Part Number → SKU Mapping

Manufacturing part numbers (e.g., `TMD516G6000D50H01`) must be mapped to TwinMOS website SKUs (e.g., `TM-D5-VOLT-16G-6000`). This mapping table is maintained in Strapi as `ProductAlias` collection.

### 12.4 Scrape Cadence & Coverage

| Vendor | Target Boards | Cadence |
|--------|--------------|---------|
| ASUS | All Z890, Z790, B860 boards | Quarterly |
| GIGABYTE | All AORUS Z890, Z790, B860 boards | Quarterly |
| MSI | All MEG/MPG Z890, Z790, MAG B860 boards | Quarterly |
| ASRock | All Taichi / Phantom Gaming Z890, Z790 | Quarterly |
| Lenovo | ThinkPad T/E-series 2024–2025 | Quarterly |
| Dell | XPS 15/17, Latitude 5000/7000 series 2024–2025 | Quarterly |
| HP | EliteBook 800 series, ProBook 400 series 2024–2025 | Quarterly |

---

## 13. Error Handling & Alerting

### 13.1 Error Categories

| Category | Severity | Action |
|----------|----------|--------|
| File structural error (wrong encoding, missing columns) | Critical | Reject file; Slack #ops alert |
| Row validation error (invalid SKU, invalid enum) | Warning | Skip row; log in IngestJob.error_log |
| Device not found (no match, no alias) | Info | Create stub Device record; flag for review |
| MeiliSearch re-index failure | High | Retry 3 times; if all fail → Slack #ops alert + fallback to direct DB query |
| Database constraint violation | High | Skip row; log error; continue batch |
| Ingest job takes > 30 minutes | High | Slack alert; investigate for deadlock or oversized CSV |

### 13.2 Retry Policy

Failed row processing is retried once immediately. If the second attempt fails, the row is logged as an error and skipped. Failed ingest jobs (file-level failures) are retried up to 3 times with 5-minute delays before generating a Slack alert.

---

## 14. Testing & Validation Procedure

### 14.1 Pre-Production Test Procedure

Before activating the QVL ingest pipeline in production:

1. **Unit tests** for each validation rule (pass/fail with edge cases)
2. **Integration test**: ingest a 1,000-row test CSV against staging Strapi; verify row counts
3. **Deduplication test**: run same CSV twice; verify row count unchanged on second run
4. **Device normalization test**: 50 known model name variants → verify they resolve to correct Device records
5. **MeiliSearch re-index test**: after ingest, search `compatibility` index and verify results appear
6. **Error handling test**: intentionally broken CSV rows; verify skipped + logged without crashing job
7. **Vendor scrape test**: scrape 5 ASUS Z790 boards in staging; verify TwinMOS SKUs correctly identified

---

## 15. Acceptance Criteria

### 15.1 CSV Ingest

- [ ] 1,000-row CSV processes in < 2 minutes
- [ ] Rows with invalid product_sku are skipped and logged (not crash the import)
- [ ] Duplicate rows (same device+product+speed) are detected and handled per deduplication rules
- [ ] New rows appear in Compatibility Finder search results within 5 minutes of ingest completion

### 15.2 Device Normalization

- [ ] "HP EliteBook 840 G10" and "HP EliteBook 840 G10 (Intel)" resolve to same Device record
- [ ] Unknown device creates new stub Device record (not an error)
- [ ] Model aliases are correctly populated and used in typeahead search

### 15.3 MeiliSearch

- [ ] After bulk import, `compatibility` index is fully re-indexed within 60 seconds
- [ ] Finder search correctly returns newly ingested entries

### 15.4 Community Reports

- [ ] Community report creates `CompatibilityReport` in Strapi
- [ ] Approved report creates `Compatibility` record with `qvl_status = Reported-Working`
- [ ] Rejected reports send no email (no false confirmation to submitter)

### 15.5 Vendor Scrape

- [ ] ASUS Z790-E scrape produces correct CSV with ≥ 5 TwinMOS SKU matches
- [ ] Part number mapping correctly resolves manufacturing codes to website SKUs

---

*QVL Data Ingest Specification v1.0 | TwinMOS Technologies | Phase 2*  
*Synchronized with: Tech Stack v1.1 §10.5 · Compatibility Finder Algorithm Spec · BRD v3.0 BR-2.x*
