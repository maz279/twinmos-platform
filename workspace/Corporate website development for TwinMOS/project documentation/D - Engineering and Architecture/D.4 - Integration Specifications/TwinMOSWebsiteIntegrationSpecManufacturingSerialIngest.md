# TwinMOS Website — Integration Specification: Manufacturing Serial Number Ingest

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-SERIAL-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P2 (serial lookup); P3 (warranty tie-in) |
| **Priority** | P3 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §14.3; BRD §17 |

---

## 1. Overview

The **Anti-Counterfeit Serial Number Verification** feature allows customers to verify the authenticity of their TwinMOS products by checking the serial number against TwinMOS manufacturing records. This system is fed by regular CSV exports from the Taiwan manufacturing facility.

### 1.1 Business Goals

1. **Anti-counterfeit protection** — Customers can confirm their product is genuine TwinMOS
2. **Warranty pre-qualification** — Serial lookup confirms warranty eligibility
3. **Market intelligence** — Detect counterfeit hotspots by geography (reported_counterfeit status)
4. **Distributor accountability** — Track if genuine products are reaching correct markets

---

## 2. Serial Number Format

TwinMOS serial numbers follow a structured format:

```
TW-{PRODUCT_CODE}-{YEAR}{MONTH}-{SEQUENCE}

Examples:
TW-DDR5-202501-00123456
TW-SSD-202503-00987654
TW-USB-202412-00456789
```

| Segment | Description | Example |
|---------|-------------|---------|
| `TW` | TwinMOS prefix | Fixed |
| `{PRODUCT_CODE}` | Category code (DDR5, SSD, USB, PORTABLE) | DDR5 |
| `{YEAR}{MONTH}` | Manufacturing date | 202501 (Jan 2025) |
| `{SEQUENCE}` | 8-digit sequential number | 00123456 |

---

## 3. Data Ingest Flow

### 3.1 Manufacturing CSV Format

The Taiwan facility provides monthly CSV exports:

```csv
serial_number,product_sku,batch_id,manufactured_at,factory_code,status
TW-DDR5-202501-00123456,TMD516GB5600U36,BATCH-2025-01-001,2025-01-15,TW-FAC-01,active
TW-DDR5-202501-00123457,TMD516GB5600U36,BATCH-2025-01-001,2025-01-15,TW-FAC-01,active
...
```

### 3.2 Ingest Process

```
Manufacturing team (Taiwan)
        │
        │  Secure file transfer (SFTP or email with PGP encryption)
        ▼
TwinMOS Operations team (Dubai)
        │
        │  Upload CSV via Strapi Admin Panel
        │  (Import Plugin: strapi-plugin-import-export-entries)
        ▼
Strapi serial_number collection
        │
        ▼
PostgreSQL (indexed on serial_number column)
```

### 3.3 Strapi Import Plugin

```bash
npm install strapi-plugin-import-export-entries
```

Operations team uses the Strapi admin panel to bulk-import CSV files without developer involvement. The plugin maps CSV columns to Strapi collection fields.

### 3.4 Import Validation Rules

Before import, the Strapi import service validates:
- Serial number format matches `TW-{CODE}-{YYYYMM}-{8digits}` pattern
- Product SKU exists in Strapi product catalog
- No duplicate serial numbers (unique constraint on DB)
- Manufacturing date is not in the future
- `status` is one of `active`, `inactive`, `reported_counterfeit`

Invalid rows are rejected and logged — import continues for valid rows.

---

## 4. Serial Number Collection Schema

**Strapi collection:** `serial_number`

```javascript
// schema.json
{
  "kind": "collectionType",
  "collectionName": "serial_numbers",
  "info": {
    "singularName": "serial-number",
    "pluralName": "serial-numbers",
    "displayName": "Serial Numbers"
  },
  "attributes": {
    "serial": {
      "type": "string",
      "required": true,
      "unique": true,
      "maxLength": 50
    },
    "product": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::product.product"
    },
    "productSku": {
      "type": "string",
      "required": true
    },
    "batchId": {
      "type": "string"
    },
    "manufacturedAt": {
      "type": "date"
    },
    "factoryCode": {
      "type": "string"
    },
    "status": {
      "type": "enumeration",
      "enum": ["active", "inactive", "registered", "reported_counterfeit"],
      "default": "active"
    },
    "registeredAt": {
      "type": "datetime",
      "description": "When warranty was registered against this serial"
    },
    "warrantyRegistration": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "api::warranty-registration.warranty-registration"
    }
  }
}
```

**Database index:** PostgreSQL B-tree index on `serial` column for O(log n) lookup performance.

---

## 5. Serial Check API

### 5.1 Endpoint

```
POST /api/serial-check
Content-Type: application/json

{
  "serial": "TW-DDR5-202501-00123456",
  "turnstileToken": "..."
}
```

### 5.2 Response — Valid Serial

```json
{
  "data": {
    "serial": "TW-DDR5-202501-00123456",
    "valid": true,
    "status": "active",
    "product": {
      "id": 42,
      "name": "VOLTX DDR5 16GB 5600MHz U-DIMM",
      "partNumber": "TMD516GB5600U36",
      "slug": "voltx-ddr5-16gb-5600mhz-udimm"
    },
    "manufacturedAt": "2025-01-15",
    "warrantyEligible": true
  }
}
```

### 5.3 Response — Already Registered

```json
{
  "data": {
    "serial": "TW-DDR5-202501-00123456",
    "valid": true,
    "status": "registered",
    "product": { ... },
    "warrantyEligible": false,
    "message": "This serial number has already been registered for warranty."
  }
}
```

### 5.4 Response — Invalid / Counterfeit

```json
{
  "data": {
    "serial": "FAKE-SERIAL-000000",
    "valid": false,
    "status": "invalid",
    "message": "Serial number not found. If you believe this is an error, please contact support@twinmos.com"
  }
}
```

### 5.5 Controller Implementation

```typescript
// src/api/serial-check/controllers/serial-check.ts
export default {
  async check(ctx) {
    const { serial, turnstileToken } = ctx.request.body;

    // Validate Turnstile
    const valid = await verifyTurnstileToken(turnstileToken, ctx.request.ip);
    if (!valid) return ctx.forbidden({ message: 'CAPTCHA failed' });

    // Normalize serial (trim, uppercase)
    const normalizedSerial = serial.trim().toUpperCase();

    // Lookup in database
    const record = await strapi.db.query('api::serial-number.serial-number').findOne({
      where: { serial: normalizedSerial },
      populate: ['product'],
    });

    if (!record) {
      return ctx.ok({
        data: {
          serial: normalizedSerial,
          valid: false,
          status: 'invalid',
          message: 'Serial number not found.',
        }
      });
    }

    // Audit log the lookup
    await strapi.service('api::audit-log.audit-log').create({
      action: 'serial.checked',
      entity: 'serial_number',
      entityId: record.id,
      details: { ip: ctx.request.ip, serial: normalizedSerial },
    });

    return ctx.ok({
      data: {
        serial: normalizedSerial,
        valid: true,
        status: record.status,
        product: record.status !== 'reported_counterfeit' ? record.product : null,
        manufacturedAt: record.manufacturedAt,
        warrantyEligible: record.status === 'active',
      }
    });
  },
};
```

---

## 6. Rate Limiting

| Limit | Value | Reason |
|-------|-------|--------|
| 30 requests/minute per IP | Hard limit | Prevent bulk serial scraping |
| Turnstile required | Every request | Bot protection |
| Max serial length | 50 chars | Prevent memory exhaustion |

---

## 7. Counterfeit Reporting

Users can report suspected counterfeit products via the contact form (`formType: counterfeit_report`). Operations team reviews and updates serial status to `reported_counterfeit` manually in Strapi admin.

Automated: If same serial is looked up from 5+ different IP addresses in 24h → flag for review.

---

## 8. Data Volumes

| Metric | Estimate |
|--------|---------|
| Monthly new serials ingested | ~50,000 |
| Total serial records (after 3 years) | ~1.8 million |
| Query performance | PostgreSQL B-tree index: <5ms per lookup |
| CSV import time (50k records) | ~2-5 minutes |

---

## 9. Related Documents

- [TwinMOSWebsiteAPISpecificationOpenAPI.yaml](../D.3 - API Specifications/TwinMOSWebsiteAPISpecificationOpenAPI.yaml) — `/api/serial-check` endpoint
- [TwinMOSWebsiteDataModelStrapi_Collections.md](../D.2 - Data Layer/TwinMOSWebsiteDataModelStrapi_Collections.md)
- [TwinMOSWebsiteDatabaseIndexingStrategy.md](../D.2 - Data Layer/TwinMOSWebsiteDatabaseIndexingStrategy.md)
