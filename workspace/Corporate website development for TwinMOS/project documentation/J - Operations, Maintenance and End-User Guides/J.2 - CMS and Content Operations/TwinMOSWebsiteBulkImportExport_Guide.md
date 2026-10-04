# TwinMOS Website — Bulk Import & Export Guide

**Document Reference:** TWN-OPS-2026-018  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** Unisoft Senior Developer / TwinMOS Product Manager  
**Audience:** Product Managers, Data Entry Staff, Marketing Operations, System Administrators  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0 §17, §19, Tech Stack v1.1 §5.2, §10.5

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This guide documents the bulk import and export procedures for the TwinMOS website CMS. It covers product catalogs, retailer/distributor data, compatibility (QVL) data, serial numbers, and other bulk data operations using the `strapi-plugin-import-export-entries` plugin and custom import pipelines.

---

## 2. Tools & Plugins

### 2.1 Primary Tool: strapi-plugin-import-export-entries

- **Purpose:** Import and export CMS entries via CSV, JSON, or Excel
- **Access:** Strapi admin → Content Manager → Import/Export button
- **Permissions:** Admin and Editor roles (configurable)
- **Phase:** P1

### 2.2 Custom Import Pipelines

| Pipeline | Format | Cadence | Owner | Phase |
|----------|--------|---------|-------|-------|
| Manufacturing serial ingest | CSV | Daily (cron) | Operations | P2 |
| QVL compatibility data | CSV | Monthly | Product/Engineering | P2 |
| Retailer/distributor data | GeoCSV | Quarterly | Sales | P1 |
| Motherboard vendor QVL | Custom scraper → CSV | Quarterly | Engineering | P2 |

---

## 3. Product Catalog Bulk Import

### 3.1 Import Template

Download the product import template from:
`https://admin.twinmos.com/import-templates/product-import-template.csv`

**Required Columns:**

| Column | Format | Example | Notes |
|--------|--------|---------|-------|
| sku | String | `VOLTX-DDR5-6000-32GB` | Unique identifier |
| name | String | `VOLTX DDR5 6000MHz 32GB U-DIMM` | Display name |
| slug | String | `voltx-ddr5-6000-32gb` | URL-friendly |
| category | String | `DDR5 Desktop DRAM` | Must exist in Category collection |
| brand_line | String | `voltx` | Must exist in BrandLine collection |
| short_description | Text | `High-performance DDR5...` | ≤200 characters |
| long_description | Rich Text | `Full HTML/markdown` | Detailed description |
| specifications | JSON | `{"speed":"6000MHz",...}` | Key-value pairs |
| warranty_period_months | Integer | `60` | Months |
| status | Enum | `published` / `draft` | Publication status |
| ean | String | `4719000123456` | European Article Number |
| mpn | String | `TMV532G60D5` | Manufacturer Part Number |
| hero_image | URL | `https://.../image.png` | Media Library URL |
| locale | String | `en` | Language code |

### 3.2 Import Procedure

1. **Prepare data:**
   - Fill in the template with product data
   - Verify SKU uniqueness against `_master-sku-reference.md`
   - Ensure all referenced categories and brand lines exist
   - Validate EAN/MPN formats

2. **Upload to Media Library:**
   - Product images must be uploaded before import
   - Note the Media Library URLs for the import sheet

3. **Import:**
   - Navigate to **Content Manager → Product**
   - Click **"Import"** button
   - Select your CSV file
   - Choose import mode:
     - **Create new** — only add new entries
     - **Update existing** — match by SKU and update fields
     - **Create or update** — combination of both
   - Map CSV columns to Strapi fields
   - Click **"Import"**

4. **Verify:**
   - Check import log for errors
   - Review sample entries in Content Manager
   - Verify on staging before publishing to production
   - Trigger MeiliSearch re-index if needed

### 3.3 Validation Rules

- SKU must be unique (case-insensitive)
- Category must exist in the Category collection
- Brand line must exist in the BrandLine collection
- EAN must be 13 digits (if provided)
- Warranty period must be a positive integer
- Slug must be unique and URL-safe (lowercase, hyphens only)

---

## 4. Retailer / Distributor Data Import

### 4.1 Import Template

| Column | Format | Example |
|--------|--------|---------|
| type | Enum | `authorized` / `e-commerce` / `distributor` / `service` |
| country_code | ISO 3166-1 alpha-2 | `BD` |
| region | String | `South Asia` |
| city | String | `Dhaka` |
| address | Text | `123 Gulshan Avenue` |
| phone | String | `+880-2-XXXX-XXXX` |
| email | Email | `info@smarttechbd.com` |
| website_url | URL | `https://smarttechbd.com` |
| lat | Decimal | `23.8103` |
| lng | Decimal | `90.4125` |
| is_authorized | Boolean | `true` |
| is_featured | Boolean | `false` |
| twinmos_brands | Array | `["voltx","tornadox7"]` |

### 4.2 Import Procedure

1. Collect retailer data from Sales team
2. Verify coordinates using Google Maps or OpenStreetMap
3. Ensure country codes are valid ISO codes
4. Import via Content Manager → Retailer → Import
5. Verify map display on `/where-to-buy/` page

---

## 5. Compatibility (QVL) Data Import

### 5.1 Import Template

| Column | Format | Example | Validation |
|--------|--------|---------|------------|
| product_sku | String | `VOLTX-DDR5-6000-32GB` | Must exist in Product |
| device_brand | String | `ASUS` | Normalized format |
| device_model | String | `ROG Strix Z890-E Gaming WIFI` | Normalized format |
| device_type | Enum | `motherboard` / `laptop` / `desktop` | — |
| qvl_status | Enum | `Tested` / `Certified` / `Reported-Working` / `Reported-Issue` / `Not-Compatible` | — |
| max_capacity | String | `128GB` | — |
| tested_speed | String | `6000MHz` | Must match SKU spec |
| notes | Text | `XMP 3.0 enabled` | Optional |

### 5.2 Import Validation Rules

- SKU must exist in Product collection
- Device brand + model must follow normalized format
- `tested_speed` must match a value in the SKU's `specifications.speeds[]`
- Duplicate detection on `(product_id, device_brand, device_model)` tuple
- Invalid entries are logged and skipped

### 5.3 Import Procedure

1. Product team provides QVL data (CSV)
2. Engineering validates format
3. Import via Content Manager → Compatibility → Import
4. MeiliSearch `compatibility` index auto-rebuilds on import
5. Verify Compatibility Finder UI functionality

---

## 6. Manufacturing Serial Number Ingest

### 6.1 Daily Ingest Pipeline

**Source:** Manufacturing system CSV export  
**Frequency:** Daily at 03:00 UTC (cron job)  
**Destination:** Strapi `ValidSerial` collection

### 6.2 CSV Format

| Column | Format | Example |
|--------|--------|---------|
| serial_number | String | `TM2026A123456789` | Unique |
| product_sku | String | `VOLTX-DDR5-6000-32GB` | Must exist |
| manufactured_at | ISO 8601 | `2026-01-15T00:00:00Z` | — |
| status | Enum | `active` / `recalled` / `transferred` | Default: `active` |

### 6.3 Ingest Procedure

1. Manufacturing system exports CSV to SFTP drop folder
2. Cron job (`/config/cron-tasks/serial-ingest.js`) runs daily at 03:00 UTC
3. Job validates each row
4. Valid rows upserted into `ValidSerial` collection
5. Invalid rows logged to `/logs/serial-ingest-errors-[date].log`
6. Summary posted to Slack #operations

### 6.4 Monitoring

- Check Slack #operations for daily ingest summary
- Review error logs if ingest count differs from expected
- Verify anti-counterfeit lookup functionality after ingest

---

## 7. Export Procedures

### 7.1 Exporting Content for Translation

1. Navigate to **Content Manager → [Content Type]**
2. Select entries to export (or select all)
3. Click **"Export"** button
4. Choose format: **XLIFF** (recommended for translation vendors) or **CSV**
5. Select source locale: **EN**
6. Click **"Export"**
7. Send file to translation vendor

### 7.2 Exporting Product Data

1. Navigate to **Content Manager → Product**
2. Filter by category, brand, or status as needed
3. Click **"Export"**
4. Choose format: **CSV** or **JSON**
5. Select fields to include
6. Download file

### 7.3 Exporting Form Submissions

1. Navigate to **Content Manager → Inquiry** (or FormSubmission)
2. Filter by date range, form type, or status
3. Click **"Export"**
4. Choose format: **CSV** or **Excel**
5. Download file for CRM import or reporting

---

## 8. Bulk Update Procedures

### 8.1 Updating Prices

1. Export current product data
2. Modify prices in spreadsheet
3. Re-import with **"Update existing"** mode
4. Verify changes in Content Manager
5. Check e-commerce sync (P3) if applicable

### 8.2 Updating Retailer Information

1. Export current retailer data
2. Update fields (addresses, phone numbers, etc.)
3. Re-import with **"Update existing"** mode (match by `company_name` or ID)
4. Verify map display updates

### 8.3 Archiving Old Content

1. Export content to be archived
2. Store export file in backup location
3. Use bulk action in Content Manager to change status to `archived`
4. Or delete (soft-delete, 30-day recovery window)

---

## 9. Error Handling

### 9.1 Common Import Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "SKU already exists" | Duplicate SKU in import file | Remove duplicate or use "Update existing" mode |
| "Category not found" | Category doesn't exist | Create category first or check spelling |
| "Invalid EAN format" | EAN not 13 digits | Correct EAN or leave blank |
| "Image URL not found" | Image not in Media Library | Upload image first |
| "Required field missing" | Mandatory field is empty | Fill in all required fields |
| "Invalid enum value" | Value not in allowed list | Check enum options in Strapi |

### 9.2 Recovery

- Failed imports do not affect existing data
- Review error log, fix issues, and re-import
- For large imports: break into smaller batches (≤500 rows)
- Test import on staging environment first

---

## 10. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Product Manager | (TBC) | _______________ | _________ |
| Marketing Director | (TBC) | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.2 - CMS and Content Operations/TwinMOSWebsiteBulkImportExport_Guide.md`
