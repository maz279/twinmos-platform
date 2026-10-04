# TwinMOS Corporate Website — Anti-Counterfeit System Specification

**Document Reference:** TWN-P2-ANTICOUNTERFEIT-2027-001  
**Document Version:** 1.0  
**Status:** APPROVED — For development implementation  
**Phase:** Phase 2 — Localization & Partner Enablement  
**Feature:** Anti-Counterfeit Serial Number Verification Engine  
**Planned Delivery:** Phase 2, Sprint 6B (February 2027)  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead + Legal Counsel  
**Audience:** Unisoft Dev B (Backend), Dev A (Frontend), TwinMOS Legal, Manufacturing Liaison  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Source References:**  
- Tech Stack v1.1 §10.3 (Anti-Counterfeit Engine outline), §10.1 (Form inventory)  
- BRD v3.0 §17 (Anti-Counterfeit Epic), BR-17.2 (5-day SLA), RFP-FR-16.2 (verification classes)  
- Content Map: `content/website-content/07-support/` (anti-counterfeit-sn-checker, counterfeit-policy)  
- Content Map: `content/website-content/14-legal/` (counterfeit-policy)

---

## Table of Contents

1. [Overview & Business Rationale](#1-overview--business-rationale)
2. [System Architecture](#2-system-architecture)
3. [Serial Number Format & Validation](#3-serial-number-format--validation)
4. [Serial Number Database & Ingest Pipeline](#4-serial-number-database--ingest-pipeline)
5. [Verification API Endpoint](#5-verification-api-endpoint)
6. [Response Classes & Customer UI](#6-response-classes--customer-ui)
7. [Rate Limiting & Abuse Prevention](#7-rate-limiting--abuse-prevention)
8. [Counterfeit Report Form](#8-counterfeit-report-form)
9. [Legal Review Workflow](#9-legal-review-workflow)
10. [Public Policy Pages](#10-public-policy-pages)
11. [Strapi Data Model](#11-strapi-data-model)
12. [Manufacturing Ingest Pipeline](#12-manufacturing-ingest-pipeline)
13. [Security Considerations](#13-security-considerations)
14. [Localization](#14-localization)
15. [Acceptance Criteria](#15-acceptance-criteria)

---

## 1. Overview & Business Rationale

### 1.1 Problem Statement

TwinMOS products — particularly VOLTX DDR5 memory and CoreX Pro SSDs — are targets for counterfeit production in certain markets (predominantly informal retail channels in South Asia, Middle East, and Africa). Counterfeit products:

- Fail to meet JEDEC specifications, causing system instability for end users
- Damage the TwinMOS brand reputation
- Expose TwinMOS to potential liability if counterfeit products cause data loss
- Undermine authorized distributor revenue

### 1.2 Solution

A **public-facing serial number verification tool** allows any customer to verify whether their TwinMOS product is genuine before purchase, upon receipt, or when experiencing issues. The system:

1. Maintains a database of all valid TwinMOS serial numbers (sourced from manufacturing)
2. Provides a public lookup API that returns one of three verification classes
3. Enables customers to report suspected counterfeit products directly
4. Routes counterfeit reports to TwinMOS Legal for investigation within 5 business days

### 1.3 Security Principle

The verification system must be designed so that **counterfeiters cannot use it to generate valid serial numbers**. Key design rules:
- The API returns only pass/fail/warning — no hints about serial number format
- Partial serial number matching is never allowed
- Serial numbers are stored as salted hashes, not plaintext (see §13.3)
- Rate limiting prevents brute-force enumeration attacks

---

## 2. System Architecture

### 2.1 Component Overview

```
Customer Browser
    │
    ▼
[Astro /support/anti-counterfeit-checker]
    │ React island <SerialNumberCheck />
    │ client:visible
    │
    ▼
[Cloudflare WAF]
    │ Rate limiting (5 req/IP/min)
    │ Turnstile gate (after 3 requests)
    │
    ▼
[POST /api/v1/serial/check]
    │ Strapi REST API controller
    │
    ▼
[Strapi — SerialValidation controller]
    │ Hash input serial → SHA-256 with pepper
    │ Query valid_serials collection
    │
    ▼
[PostgreSQL / MeiliSearch valid_serials index]
    │ Match: VERIFIED_GENUINE
    │ No match: NOT_FOUND
    │ Flagged: SUSPECTED_COUNTERFEIT
    │
    ▼
Response → Astro → Customer UI
```

### 2.2 Data Flow for Ingest

```
TwinMOS Manufacturing System
    │ Nightly at 03:00 UTC
    │ CSV export: new serials from production run
    │
    ▼
[Strapi ERPSync cron job]
    │ Download CSV from secure FTP or S3 drop
    │ Validate CSV schema (see §12)
    │ Hash each serial (SHA-256 + pepper)
    │ Upsert into valid_serials collection
    │ Reindex MeiliSearch valid_serials index
    │
    ▼
[Backblaze B2 — ingest log archive]
    │ Store original CSV (encrypted) for audit
```

---

## 3. Serial Number Format & Validation

### 3.1 TwinMOS Serial Number Format

Serial numbers follow the format:

```
TW{YY}{MM}{FACTORY}{SEQUENCE}
```

| Component | Format | Example | Description |
|-----------|--------|---------|-------------|
| Prefix | `TW` | `TW` | Always "TW" for TwinMOS |
| Year | 2-digit | `25` | Production year (2025) |
| Month | 2-digit | `K0` (encoded) | Production month (encoded) |
| Factory code | 1 char | `1` | Manufacturing facility identifier |
| Sequence | 7 digits | `234567` | Unit sequence within production batch |

**Full example:** `TW25K01234567` (16 characters total)

**Note:** The exact format is TwinMOS manufacturing confidential and must be confirmed by the Manufacturing Liaison before implementation. The format above is based on known example serials and may require revision. Dev B must validate with IT Lead before Sprint 6B encoding implementation.

### 3.2 Client-Side Input Sanitization

Before sending to the API, the Astro island must:
1. Strip all spaces and hyphens (users often type with separators)
2. Convert to uppercase
3. Validate minimum/maximum length (8–20 alphanumeric characters)
4. Reject inputs containing non-alphanumeric characters

```ts
function sanitizeSerial(input: string): string {
  return input.replace(/[\s\-]/g, '').toUpperCase();
}

function isValidSerialFormat(serial: string): boolean {
  return /^[A-Z0-9]{8,20}$/.test(serial);
}
```

Client-side validation is UX only — it does not replace server-side validation.

---

## 4. Serial Number Database & Ingest Pipeline

### 4.1 Database Storage

Serial numbers are stored **hashed**, not in plaintext, to prevent the database from becoming a "list of valid serials" if ever breached.

**Hashing method:**

```ts
import { createHmac } from 'crypto';

const SERIAL_PEPPER = process.env.SERIAL_HASH_PEPPER; // Must not be stored in DB; only in Coolify secrets

function hashSerial(serial: string): string {
  return createHmac('sha256', SERIAL_PEPPER)
    .update(serial.toUpperCase())
    .digest('hex');
}
```

The `valid_serials` collection stores:
- `serial_hash` — the HMAC-SHA256 of the serial number
- `product_sku` — associated product (for display in VERIFIED_GENUINE response)
- `production_date` — month of production
- `factory_code` — production facility
- `batch_id` — production batch reference
- `is_flagged` — boolean; set to true for known counterfeit serials reported by Legal
- `flag_reason` — only visible to admin
- `created_at` — when the record was ingested

### 4.2 MeiliSearch Index

The `valid_serials` MeiliSearch index is indexed on `serial_hash` only. No other fields are searchable publicly. The index is used for fast exact-match lookup:

```ts
// MeiliSearch search is exact-match only for valid_serials
const result = await meiliSearch.index('valid_serials').search(null, {
  filter: `serial_hash = "${hashedSerial}"`,
  limit: 1,
});
```

---

## 5. Verification API Endpoint

### 5.1 Endpoint Specification

```
POST /api/v1/serial/check
```

**Authentication:** None (public endpoint)  
**Rate Limiting:** 5 requests per IP per minute; Turnstile required after 3rd request within 60 seconds  
**Bot Protection:** Cloudflare Turnstile (mandatory in request body after threshold)

### 5.2 Request Body

```json
{
  "serial_number": "TW25K01234567",
  "turnstile_token": "<cf-turnstile-token-if-required>"
}
```

### 5.3 Response Schema

**Content-Type:** `application/json`

```json
{
  "result": "VERIFIED_GENUINE",
  "serial": "TW25***4567",
  "product": {
    "name": "VOLTX DDR5 RGB 32GB (2×16GB) 6000MHz",
    "sku": "TM-D5-VOLT-RGB-32G-6000",
    "image_url": "https://cdn.twinmos.com/products/voltx-ddr5-rgb-32gb.webp"
  },
  "message": "This product is a genuine TwinMOS product.",
  "checked_at": "2027-02-15T10:32:44Z"
}
```

```json
{
  "result": "NOT_FOUND",
  "serial": "XY99Z99999999",
  "message": "This serial number was not found in our records. This may indicate a counterfeit product, or the product may have been manufactured before our serial tracking system was implemented (pre-2022). If you believe this product is genuine, please contact our support team.",
  "checked_at": "2027-02-15T10:33:01Z"
}
```

```json
{
  "result": "SUSPECTED_COUNTERFEIT",
  "serial": "TW25***4567",
  "message": "This serial number has been flagged in our system. This product may be counterfeit or unauthorized. Please do not use this product. Contact TwinMOS Legal immediately at legal@twinmos.com.",
  "report_url": "/support/report-counterfeit",
  "checked_at": "2027-02-15T10:33:15Z"
}
```

### 5.4 Serial Masking in Response

The API response echoes back a **masked** version of the serial:
- First 2 characters shown
- Characters 3 through (length-4) replaced with `*`
- Last 4 characters shown

Example: `TW25K01234567` → `TW***4567`

This confirms to the user which serial they checked, without exposing the full string to logging systems.

### 5.5 Rate Limit Response (RFC 9457)

```json
{
  "type": "https://twinmos.com/errors/rate-limit",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "You have exceeded the maximum number of serial checks. Please wait before checking again.",
  "retry_after": 60
}
```

---

## 6. Response Classes & Customer UI

### 6.1 VERIFIED_GENUINE UI

**Green confirmation banner:**

```
✅ GENUINE TwinMOS Product

This serial number is verified as a genuine TwinMOS product.

Product: VOLTX DDR5 RGB 32GB 6000MHz
Checked: 15 February 2027 at 10:32 UTC

[Register Warranty] [View Product Page] [Contact Support]
```

Product image displayed alongside confirmation.

### 6.2 NOT_FOUND UI

**Amber warning banner:**

```
⚠ Serial Number Not Found

This serial number (TW****567) was not found in our database.

This could mean:
• The product is counterfeit or unauthorized
• The product was manufactured before our serial tracking system (pre-2022)
• The serial number was entered incorrectly

What to do:
→ Re-enter your serial number carefully (no spaces or hyphens)
→ If still not found, contact TwinMOS Support with your proof of purchase
→ If you believe this is a counterfeit product, please report it

[Try Again] [Contact Support] [Report Counterfeit]
```

### 6.3 SUSPECTED_COUNTERFEIT UI

**Red alert banner:**

```
🚨 SUSPECTED COUNTERFEIT PRODUCT

This serial number has been flagged in our counterfeit database.

⚠ DO NOT USE THIS PRODUCT ⚠

This product may be:
• A counterfeit with substandard components
• A risk to your hardware and data
• Associated with an ongoing investigation

IMMEDIATE ACTIONS:
1. Stop using this product immediately
2. Do not install it in your system
3. Preserve the product and all packaging
4. Report this product using the button below

[Report This Counterfeit] [Contact TwinMOS Legal]

legal@twinmos.com | +971-4-2996421 (Business hours GST)
```

---

## 7. Rate Limiting & Abuse Prevention

### 7.1 Rate Limiting Configuration

| Limit | Window | Action |
|-------|--------|--------|
| 5 requests | Per IP per minute | 429 response with retry_after |
| 3 requests | Per IP per 60 seconds | Trigger Turnstile challenge in UI |
| 20 requests | Per IP per hour | Cloudflare WAF custom rule: temporary IP block (5 minutes) |
| 100 requests | Per IP per 24 hours | Cloudflare WAF: flag for review + Slack alert |

### 7.2 Anti-Enumeration Design

The system is designed to resist brute-force serial number enumeration:

1. **Hashed storage** — even with DB access, valid serials cannot be extracted
2. **No partial matching** — exact hash match only; no fuzzy or partial responses
3. **Identical response time** for FOUND and NOT_FOUND (add synthetic delay if needed to prevent timing attacks)
4. **No sequential hints** — response never indicates how close a guess is
5. **Log all lookups** — monitoring for patterns (same IP checking many sequential-looking serials)

### 7.3 Suspicious Activity Alerting

Strapi background job monitors lookup logs for:
- Same IP checking > 20 serials in 1 hour → Slack `#security` alert
- Same serial checked > 10 times from different IPs in 1 hour → Slack alert (possible verification bypass attempt)
- Any `SUSPECTED_COUNTERFEIT` result → immediate Slack `#legal` notification

---

## 8. Counterfeit Report Form

### 8.1 URL

`/support/report-counterfeit` (also linked from `/legal/counterfeit-policy`)

### 8.2 Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Serial Number | Text | Conditional | Pre-filled if arriving from SN check result |
| Product Model | Dropdown | Yes | |
| Where Purchased | Text | Yes | Retailer name + country |
| Purchase Date | Date | Yes | |
| Purchase Channel | Radio | Yes | Online marketplace / Brick-and-mortar / Street vendor / Other |
| Description of Suspicion | Textarea | Yes | Min 50 chars — packaging differences, performance, etc. |
| Product Photos | File upload (up to 5 JPG/PNG, ≤5MB each) | Recommended | Packaging, labels, heatsink, box |
| Packaging Photos | File upload | No | |
| Reporter Name | Text | Yes | |
| Reporter Email | Email | Yes | For investigation updates |
| Reporter Phone | Tel | No | |
| Country | Dropdown | Yes | |
| Consent to be contacted | Checkbox | Yes | GDPR Art. 6(1)(a) consent for contact |

### 8.3 Submission Confirmation

```
✓ Counterfeit Report Received

Reference: TWN-CF-2027-000045

Thank you for helping protect TwinMOS customers and the integrity of our products.

Our Legal team will review your report within 5 business days (BR-17.2).
You will receive updates at [email].

In the meantime:
• Preserve the product and packaging in its current condition
• Do not return the product to the retailer without legal guidance
• If you are in immediate danger or this involves a large-scale operation,
  contact local authorities

TwinMOS Legal Team | legal@twinmos.com
```

---

## 9. Legal Review Workflow

### 9.1 Workflow States

```
RECEIVED → UNDER_REVIEW → INVESTIGATING → RESOLVED / REFERRED_TO_AUTHORITIES
                         ↓
                     CLOSED_INCONCLUSIVE
```

### 9.2 Review SLA

| Stage | SLA |
|-------|-----|
| RECEIVED → UNDER_REVIEW | 5 business days (BR-17.2) |
| UNDER_REVIEW → INVESTIGATING | 10 business days |
| Investigation → Resolution | Varies (ongoing investigations may take months) |

### 9.3 Escalation Path

1. Report auto-assigned to Legal team via Strapi `CounterfeitReport` collection
2. Legal team reviews photos, product description, purchase channel
3. If credible: mark `is_flagged=true` on the reported serial number in `valid_serials`
4. Coordinate with TwinMOS Manufacturing to trace batch origin
5. If large-scale operation suspected: refer to local IP enforcement authorities
6. Update reporter on outcome (general terms; no confidential investigation details shared)

### 9.4 Flagging a Serial as SUSPECTED_COUNTERFEIT

```ts
// Admin action in Strapi admin
await strapi.db.query('api::valid-serial.valid-serial').update({
  where: { serial_hash: hashSerial(serialNumber) },
  data: {
    is_flagged: true,
    flag_reason: 'Reported counterfeit — Legal case #CF-2027-045',
    flagged_at: new Date(),
    flagged_by: adminUser.email,
  },
});
```

This immediately causes the verification API to return `SUSPECTED_COUNTERFEIT` for that serial number.

---

## 10. Public Policy Pages

### 10.1 Anti-Counterfeit Policy Page

**URL:** `/support/counterfeit-policy/` and `/legal/counterfeit-policy/`  
(Both URLs serve the same content per BRD §10.3; `counterfeit-policy` exists in both `07-support/` and `14-legal/`)

**Content includes:**
- How to identify genuine TwinMOS products (hologram, packaging, QR code, serial number)
- Warning signs of counterfeit products (poor printing, missing hologram, unrealistic pricing)
- How to use the serial number checker
- How to report counterfeit products
- TwinMOS's zero-tolerance policy statement
- Legal consequences for counterfeit manufacturing and distribution
- Regional contact information for IP enforcement

### 10.2 Serial Number Checker Page

**URL:** `/support/anti-counterfeit-checker/`

**Content:**
- `<SerialNumberCheck />` React island (client:visible)
- How to find your serial number (product label, packaging, BIOS/UEFI system information)
- Understanding your result (GENUINE / NOT FOUND / SUSPECTED COUNTERFEIT)
- Privacy notice: "Your serial number is not stored after verification"

---

## 11. Strapi Data Model

### 11.1 `valid_serials` Collection

```ts
interface ValidSerial {
  id: number;
  serial_hash: string;            // HMAC-SHA256 (unique index)
  product_sku: string;            // e.g., 'TM-D5-VOLT-32G-6000'
  production_date: string;        // YYYY-MM format
  factory_code: string;           // 1-char facility identifier
  batch_id: string;               // internal batch reference
  is_flagged: boolean;            // true = SUSPECTED_COUNTERFEIT
  flag_reason?: string;           // admin-only; not exposed in API
  flagged_at?: Date;
  flagged_by?: string;            // admin email
  created_at: Date;               // when ingested
  ingest_job_id: string;         // reference to IngestJob
}
```

**Indexes:**
- `serial_hash` — unique B-tree index (primary lookup)
- `product_sku` — for stats queries
- `created_at` — for recency queries
- Composite: `(is_flagged, created_at)` for monitoring queries

### 11.2 `CounterfeitReport` Collection

```ts
interface CounterfeitReport {
  id: number;
  report_reference: string;       // TWN-CF-YYYY-NNNNNN
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED_INCONCLUSIVE' | 'REFERRED_TO_AUTHORITIES';
  serial_number_reported?: string; // plaintext (Legal use only; not stored in valid_serials)
  product_model: string;
  where_purchased: string;
  purchase_date: Date;
  purchase_channel: PurchaseChannel;
  description: string;
  photos: string[];               // Backblaze B2 URLs
  reporter_name: string;
  reporter_email: string;
  reporter_phone?: string;
  country: string;
  consent_given: boolean;
  consent_timestamp: Date;
  assigned_to?: Relation<StrapiUser>;  // Legal team member
  internal_notes: string;
  reporter_update_sent_at?: Date;
  resolved_at?: Date;
  resolution_summary?: string;   // shared with reporter (general terms)
  created_at: Date;
}
```

### 11.3 `SerialLookupLog` Collection (Audit/Monitoring)

```ts
interface SerialLookupLog {
  id: number;
  serial_hash: string;           // hashed for storage
  result: 'VERIFIED_GENUINE' | 'NOT_FOUND' | 'SUSPECTED_COUNTERFEIT';
  ip_address: string;
  user_agent: string;
  country_code: string;          // from Cloudflare cf-ipcountry header
  turnstile_used: boolean;
  checked_at: Date;
}
```

Retention: 90 days (rate limiting monitoring); no longer than 6 months (GDPR minimization).

---

## 12. Manufacturing Ingest Pipeline

### 12.1 Ingest Schedule

| Cadence | Trigger | Source Format |
|---------|---------|---------------|
| Nightly 03:00 UTC (primary) | Automated cron | CSV from manufacturing system |
| On-demand (new product launch) | Manual trigger in Strapi admin | Same CSV format |

### 12.2 CSV Input Format

```csv
serial_number,product_sku,production_date,factory_code,batch_id
TW25K01234567,TM-D5-VOLT-32G-6000,2025-11,1,BATCH-2025-11-001
TW25K01234568,TM-D5-VOLT-32G-6000,2025-11,1,BATCH-2025-11-001
TW25L02345678,TM-SSD-COREX-2TB,2025-12,2,BATCH-2025-12-015
```

**Columns:**
- `serial_number` — plaintext serial (8–20 alphanumeric chars)
- `product_sku` — must match a valid `Product.sku` in Strapi
- `production_date` — YYYY-MM format
- `factory_code` — single character
- `batch_id` — internal reference (max 50 chars)

### 12.3 Ingest Validation Rules

| Rule | Action on Failure |
|------|------------------|
| `serial_number` format: /^[A-Z0-9]{8,20}$/ | Skip row; log warning |
| `product_sku` must exist in Strapi `Product` collection | Skip row; log error |
| Duplicate `serial_number` (already hashed and stored) | Skip row; log info (not an error; expected for incremental imports) |
| CSV file > 5MB | Reject entire file; Slack alert |
| CSV encoding not UTF-8 | Reject; Slack alert |
| Missing required columns | Reject entire file; Slack alert |
| Row count > 1,000,000 | Reject; escalate to IT Lead |

### 12.4 Ingest Job Record

```ts
interface IngestJob {
  id: string;
  triggered_by: 'cron' | 'manual';
  started_at: Date;
  completed_at?: Date;
  status: 'running' | 'completed' | 'failed';
  rows_processed: number;
  rows_inserted: number;
  rows_skipped: number;
  rows_errored: number;
  error_log: string;             // JSON array of row-level errors
  source_filename: string;
  source_checksum: string;       // SHA-256 of original CSV
}
```

Strapi admin shows last 30 ingest jobs. Slack `#ops` notified on completion (summary) or failure (alert).

### 12.5 Delivery Method for CSV

TwinMOS Manufacturing team delivers the CSV via one of:
1. **Secure SFTP drop** — Hetzner storage accessible by manufacturing system (preferred)
2. **Encrypted email** — CSV encrypted with GPG, sent to a monitored alias
3. **Backblaze B2 drop folder** — manufacturing system uploads to `twinmos-manufacturing-drops/serials/` bucket

Final method to be determined by TwinMOS IT Lead in Sprint 6B planning.

---

## 13. Security Considerations

### 13.1 Threat Model

| Threat | Mitigation |
|--------|-----------|
| Counterfeiters enumerate valid serial numbers | Hashed storage; rate limiting; no sequential hints |
| Brute-force attack on SN checker | Cloudflare WAF + Turnstile + IP blocks |
| SQL injection via serial number field | Parameterized queries in Strapi; Zod schema validation |
| CSV injection in ingest file | Server-side validation of all CSV values before DB insert |
| Unauthorized serial flagging | Only Super Admin and Legal role can set `is_flagged=true`; audit log |
| DB breach exposing valid serials | Hashed storage — breach reveals only hashes, not actual serials |
| SSRF via malformed serial input | Input sanitized to alphanumeric before any processing |
| Timing attack to distinguish FOUND vs NOT_FOUND | Normalize response time (add synthetic delay to make responses equal time) |

### 13.2 SERIAL_HASH_PEPPER Management

The pepper is a secret key used in HMAC-SHA256 hashing:
- Stored in Coolify secrets (never in source code or DB)
- 256-bit random value generated at deployment
- Rotation procedure: re-hash all existing serials with new pepper (Strapi migration script; planned quarterly rotation review)
- If pepper is compromised: full re-hash required + notify IT Lead immediately

### 13.3 Legal Considerations

- The anti-counterfeit database contains only hashes — no user data collected during normal verification
- `SerialLookupLog` stores IP addresses — covered by Privacy Policy under legitimate interest (fraud prevention)
- Counterfeit report form collects PII — GDPR Art. 6(1)(a) consent + separate retention policy (investigation period + 5 years)
- Legal review of the SUSPECTED_COUNTERFEIT response language required before launch (see Phase 2 Kick-Off Document §10.1)

---

## 14. Localization

### 14.1 API Response Localization

The verification API accepts a `locale` query parameter:

```
POST /api/v1/serial/check?locale=ar
```

Response `message` field is returned in the requested locale. Supported in Phase 2: `en`, `ar`, `bn`, `hi`.

### 14.2 UI Localization

`<SerialNumberCheck />` React island adapts to the active Astro locale:
- Input placeholder text in Arabic (RTL) for `/ar/support/anti-counterfeit-checker/`
- Response banners and CTAs in all 4 Phase 2 locales
- "How to find your serial number" guide localized for each market

---

## 15. Acceptance Criteria

### 15.1 Core Verification

- [ ] Valid serial number returns `VERIFIED_GENUINE` with correct product name and SKU
- [ ] Random / invalid serial returns `NOT_FOUND`
- [ ] Flagged serial returns `SUSPECTED_COUNTERFEIT` with report link
- [ ] Serial number is masked in API response (first 2 + last 4 chars shown)
- [ ] Response time: < 200ms p99 under normal load

### 15.2 Rate Limiting

- [ ] 6th request within 60 seconds returns 429 with `retry_after`
- [ ] Turnstile challenge triggered after 3rd request within 60 seconds
- [ ] Cloudflare WAF blocks IP after 20 requests per hour

### 15.3 Ingest Pipeline

- [ ] Nightly cron runs at 03:00 UTC and processes CSV without errors
- [ ] New serials from CSV are queryable via API within 5 minutes of ingest
- [ ] Ingest job record created with correct stats (rows processed, inserted, skipped)
- [ ] Invalid CSV row is skipped with log entry; other rows continue processing
- [ ] Slack notification sent on completion (or failure) of each ingest job

### 15.4 Counterfeit Report Form

- [ ] Form submits successfully with all required fields
- [ ] Confirmation email sent within 5 minutes
- [ ] Report reference number generated in format `TWN-CF-2027-NNNNNN`
- [ ] Report visible in Strapi admin for Legal team
- [ ] Report auto-flagged serial in `valid_serials` when Legal team marks `is_flagged=true`

### 15.5 Security

- [ ] OWASP ZAP scan on `/api/v1/serial/check` endpoint shows no Critical or High findings
- [ ] SQL injection attempt via serial_number field returns 400 (not 500)
- [ ] Hash enumeration test: 10,000 sequential guesses find 0 valid serials (expected: not found)
- [ ] Response time for FOUND and NOT_FOUND are within 20ms of each other

---

*Anti-Counterfeit System Specification v1.0 | TwinMOS Technologies | Phase 2*  
*Synchronized with: Tech Stack v1.1 §10.3 · BRD v3.0 §17 · RFP-FR-16.2*
