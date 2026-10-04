# TwinMOS Corporate Website — Watermarked PDF Generation Specification

**Document Reference:** TWN-P2-PDF-2027-001  
**Document Version:** 1.0  
**Status:** APPROVED — For development implementation  
**Phase:** Phase 2 — Localization & Partner Enablement  
**Feature:** Watermarked PDF Generation for Partner Portal  
**Planned Delivery:** Phase 2, Sprint 6B (February 2027)  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead + Marketing Director  
**Audience:** Unisoft Dev B (Backend), TwinMOS Marketing, Legal  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Source References:**  
- Tech Stack v1.1 §9.3 (Partner Portal), §5.3 (Strapi Roles: Partner Procurement)  
- Partner Portal Functional Spec §9 (Watermarked PDF Price List Delivery)  
- BRD v3.0 §17 (Partner Portal Epic)

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Documents Covered](#2-documents-covered)
3. [Watermark Design Specification](#3-watermark-design-specification)
4. [PDF Generation Architecture](#4-pdf-generation-architecture)
5. [Technology Stack](#5-technology-stack)
6. [HTML Price List Template](#6-html-price-list-template)
7. [Watermark Implementation](#7-watermark-implementation)
8. [Storage & Delivery Pipeline](#8-storage--delivery-pipeline)
9. [API Endpoints](#9-api-endpoints)
10. [Security Controls](#10-security-controls)
11. [Audit Logging](#11-audit-logging)
12. [Performance Targets](#12-performance-targets)
13. [Error Handling](#13-error-handling)
14. [Acceptance Criteria](#14-acceptance-criteria)

---

## 1. Overview & Purpose

### 1.1 Why Watermarking

TwinMOS distributor price lists contain sensitive commercial pricing that:
- Could undermine authorized distributors if leaked to their customers
- Could damage TwinMOS's channel pricing strategy if shared with unauthorized parties
- Could be used by competitors to undercut pricing in specific markets

Watermarking each downloaded PDF with the distributor's identity, download timestamp, and session token creates accountability and deters unauthorized redistribution. Even if a price list is shared, the watermark enables TwinMOS to identify the source of the leak.

### 1.2 Scope

This specification covers watermarked PDF generation for:
- Distributor Price Lists (quarterly)
- Reseller Price Lists
- System Builder Price Lists
- Promotional / Bundle Pricing PDFs
- MAP (Minimum Advertised Price) Policy PDFs (watermarked but not confidential)

It does **not** cover:
- Public datasheets (no watermark required)
- Product brochures (no watermark required)
- Marketing assets (managed separately via Asset Library)

---

## 2. Documents Covered

### 2.1 Price List Types

| Document Type | Audience | Sensitivity | Watermark Level |
|--------------|---------|-------------|-----------------|
| Distributor Price List | Distributors (Elite/Certified) | Highly Confidential | Full watermark |
| Reseller Suggested Price List | Resellers | Confidential | Full watermark |
| System Builder Price List | System Builders | Confidential | Full watermark |
| Promotional Bundle Pricing | All tiers (role-filtered) | Confidential | Standard watermark |
| MAP Policy | All tiers | Internal | Light watermark (header/footer only) |

### 2.2 Document Structure (Price List)

Each price list PDF contains:

1. **Cover page** — TwinMOS branding, partner name, effective date, confidentiality notice
2. **Table of contents** (for large price lists > 3 pages)
3. **Product sections** by category:
   - DDR5 Desktop Memory (VOLTX series)
   - DDR4 Desktop Memory
   - DDR5/DDR4 Laptop Memory (SO-DIMM)
   - NVMe SSDs (CoreX Pro Gen5, Xtreme Gen4, etc.)
   - SATA SSDs
   - Portable SSDs
   - USB Flash Drives
   - Accessories
4. **Pricing table** per section with columns: SKU | Product Name | Capacity | Speed | Distributor Price | MSRP | MAP
5. **Terms & Conditions** page
6. **Footer** on every page: confidentiality notice + partner ID

---

## 3. Watermark Design Specification

### 3.1 Watermark Layers

Each generated PDF has **three watermark layers**:

**Layer 1: Diagonal Full-Page Watermark (every page)**

```
CONFIDENTIAL
Authorized Use Only: {{Company Name}} ({{Partner ID}})
Downloaded: {{DD Month YYYY HH:MM UTC}}
Session: {{last-8-chars-of-session-id}}
```

- Font: Noto Sans, 24pt, gray (CMYK 0/0/0/30 = RGB 178/178/178)
- Angle: 45 degrees
- Opacity: 15%
- Repeating pattern: 3 times per page diagonally (top-left, center, bottom-right)

**Layer 2: Header Band (page 1 only)**

```
█████████████████████████████████████████████████████████████
CONFIDENTIAL — TwinMOS Authorized Partner Price List
Partner: {{Company Name}} | ID: {{Partner ID}} | Downloaded: {{DD Mon YYYY HH:MM UTC}}
This document is provided exclusively to the above named authorized TwinMOS partner.
Redistribution, reproduction, or disclosure to any third party is strictly prohibited.
█████████████████████████████████████████████████████████████
```

- Background: TwinMOS brand blue (#00A3E0), white text
- Height: 60px

**Layer 3: Footer Band (every page)**

```
CONFIDENTIAL — For {{Company Name}} use only | TWN-PDF-{{Session-Last-8}} | Page {{N}} of {{Total}}
```

- Font: 8pt, gray
- Placement: 15px from bottom edge

### 3.2 Watermark Content Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{Partner ID}}` | Partner.id or custom partner code | "TW-IND-001" |
| `{{DD Month YYYY HH:MM UTC}}` | Timestamp at generation time | "15 February 2027 10:32 UTC" |
| `{{last-8-chars-of-session-id}}` | Better Auth session ID (last 8 chars) | "a3f9c21b" |
| `{{Page N of Total}}` | PDF page counter | "Page 3 of 12" |

---

## 4. PDF Generation Architecture

### 4.1 Generation Flow

```
Partner requests price list download
    │ POST /api/v1/partner/price-lists/:id/generate-pdf
    │
    ▼
[Strapi Controller]
    │ Validate Better Auth session → partner identity
    │ Check role: Certified or Elite tier (Procurement sub-role)
    │ Retrieve PriceList data from Strapi collection
    │
    ▼
[PDF Generation Service (Node.js)]
    │ Render HTML template with price list data
    │ Inject watermark variables (company name, partner ID, timestamp, session)
    │
    ▼
[Puppeteer — headless Chrome]
    │ Launch headless Chromium
    │ Load rendered HTML
    │ print to PDF (A4, 210×297mm)
    │
    ▼
[PDF-lib — Watermark Layer]
    │ Load Puppeteer-generated PDF bytes
    │ Add diagonal watermark text on each page
    │ Add header band on page 1
    │ Add footer on each page
    │
    ▼
[Backblaze B2 — Temporary Storage]
    │ Upload PDF to temporary bucket path:
    │ twinmos-assets-production/partner-pdfs/tmp/{session-hash}/{price_list_id}.pdf
    │ TTL: 60 minutes (lifecycle rule deletes automatically)
    │ Generate Backblaze B2 signed URL (expires 60 minutes)
    │
    ▼
Response: { download_url: "https://b2-signed-url...", expires_in: 3600 }
    │
    ▼
[PDFDownloadLog created in Strapi]
    │ Log: partner_id, user_email, price_list_id, session_id, generated_at, url_expires_at
```

### 4.2 Component Separation

The PDF generation runs as a **separate Node.js process** (not inside Strapi):
- Puppeteer requires its own Node.js runtime with Chrome
- Isolates heavy rendering from Strapi API performance
- Deployed as a separate Docker container on the same Hetzner VPS via Coolify

Communication: Strapi makes an internal HTTP call to the PDF service:
```
POST http://pdf-service:3000/generate
Authorization: Bearer <internal-service-token>
Content-Type: application/json

{
  "template": "price-list",
  "data": { ... },
  "watermark": { "company_name": "...", "partner_id": "...", "timestamp": "...", "session_suffix": "..." }
}

→ Response: { "pdf_bytes": "<base64>" }
```

---

## 5. Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| HTML rendering | Handlebars.js | 4.x | Template engine for price list HTML |
| Headless browser | Puppeteer | 21.x | HTML → PDF rendering |
| Chrome | Chrome (bundled with Puppeteer) | Latest stable | Rendering engine |
| PDF manipulation | pdf-lib | 1.17.x | Watermark layer application, page manipulation |
| Font embedding | pdf-lib / Noto Sans TTF | — | Ensure watermark font is embedded in PDF |
| PDF storage | Backblaze B2 (S3-compatible) | — | Temporary storage with 60-min TTL |
| PDF service framework | Express.js | 4.x | HTTP server for PDF service |
| Deployment | Docker + Coolify | — | Container on Hetzner VPS |

### 5.1 Why Puppeteer over Pure PDF Libraries

| Option | Pros | Cons |
|--------|------|------|
| Puppeteer (chosen) | Renders any CSS/HTML; WYSIWYG tables; handles complex layouts; pixel-perfect | Requires Chrome; ~200MB RAM per instance |
| PDFKit (Node.js) | Lightweight; no browser | Complex tables require manual layout code; time-intensive to develop |
| wkhtmltopdf | Mature; widely used | Deprecated; no active maintenance; WebKit engine |
| Flying Saucer (Java) | Excellent HTML/CSS support | Wrong language stack |

Puppeteer is the correct choice for TwinMOS because the price list table structure (multi-column, multi-category) is complex to build without HTML/CSS rendering.

---

## 6. HTML Price List Template

### 6.1 Template Structure (Handlebars)

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    /* Print-optimized CSS */
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Noto Sans', sans-serif; font-size: 10pt; color: #1a1a1a; }
    
    .header-band {
      background: #00A3E0;
      color: white;
      padding: 8px 12px;
      font-size: 8pt;
      margin-bottom: 20px;
    }
    
    table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    thead { display: table-header-group; /* Repeat on each page */ }
    tr { page-break-inside: avoid; }
    th { background: #00A3E0; color: white; padding: 6px 8px; font-size: 9pt; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e5e5; font-size: 9pt; }
    tr:nth-child(even) td { background: #f9f9f9; }
    
    .section-header { background: #f0f0f0; font-weight: bold; padding: 8px; margin-top: 16px; }
    .confidential-footer { font-size: 7pt; color: #888; text-align: center; margin-top: 10px; }
    .page-number::after { content: counter(page) " of " counter(pages); }
  </style>
</head>
<body>
  <!-- Cover page -->
  <div class="header-band">
    CONFIDENTIAL — TwinMOS Authorized Partner Price List<br>
    Partner: {{partnerName}} | ID: {{partnerId}} | Downloaded: {{timestamp}}<br>
    This document is provided exclusively to the above named authorized TwinMOS partner.
    Redistribution is strictly prohibited.
  </div>
  
  <h1 style="color:#00A3E0;">TwinMOS Technologies</h1>
  <h2>{{priceListTitle}}</h2>
  <p><strong>Effective Date:</strong> {{effectiveDate}}</p>
  <p><strong>Expiry Date:</strong> {{expiryDate}}</p>
  <p><strong>Currency:</strong> {{currency}}</p>
  
  <!-- Product sections -->
  {{#each sections}}
  <div class="section-header">{{this.category}}</div>
  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Product Name</th>
        <th>Capacity</th>
        <th>Speed</th>
        <th>Distributor Price ({{../currency}})</th>
        <th>MSRP</th>
        <th>MAP</th>
        <th>MOQ</th>
      </tr>
    </thead>
    <tbody>
      {{#each this.products}}
      <tr>
        <td>{{this.sku}}</td>
        <td>{{this.name}}</td>
        <td>{{this.capacity}}</td>
        <td>{{this.speed}}</td>
        <td style="font-weight:bold;">{{this.distributor_price}}</td>
        <td>{{this.msrp}}</td>
        <td>{{this.map_price}}</td>
        <td>{{this.moq}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/each}}
  
  <!-- Terms -->
  <div style="page-break-before: always;">
    <h3>Terms & Conditions</h3>
    <p>{{termsAndConditions}}</p>
  </div>
  
  <div class="confidential-footer">
    CONFIDENTIAL — For {{partnerName}} ({{partnerId}}) use only | 
    TWN-PDF-{{sessionSuffix}} | 
    Downloaded: {{timestamp}}
  </div>
</body>
</html>
```

---

## 7. Watermark Implementation

### 7.1 Puppeteer → Base PDF

```ts
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
});

const page = await browser.newPage();
await page.setContent(renderedHtml, { waitUntil: 'networkidle0' });

const pdfBytes = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
  displayHeaderFooter: false,  // Using HTML-rendered header/footer instead
});

await browser.close();
```

### 7.2 pdf-lib Watermark Layer

```ts
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

async function applyWatermark(
  pdfBytes: Buffer,
  watermark: WatermarkData
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  // Embed font
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  const watermarkText = [
    'CONFIDENTIAL',
    `${watermark.companyName} (${watermark.partnerId})`,
    `Downloaded: ${watermark.timestamp}`,
    `Session: ${watermark.sessionSuffix}`,
  ].join('\n');
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    // Three diagonal watermark instances per page
    const positions = [
      { x: width * 0.1, y: height * 0.8 },
      { x: width * 0.35, y: height * 0.5 },
      { x: width * 0.6, y: height * 0.2 },
    ];
    
    for (const pos of positions) {
      page.drawText(watermarkText, {
        x: pos.x,
        y: pos.y,
        size: 24,
        font,
        color: rgb(0.7, 0.7, 0.7),  // Light gray
        rotate: degrees(45),
        opacity: 0.15,
      });
    }
    
    // Footer on every page
    page.drawText(
      `CONFIDENTIAL — For ${watermark.companyName} use only | TWN-PDF-${watermark.sessionSuffix}`,
      {
        x: 30,
        y: 20,
        size: 8,
        font,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.8,
      }
    );
  }
  
  return Buffer.from(await pdfDoc.save());
}
```

---

## 8. Storage & Delivery Pipeline

### 8.1 Temporary Storage (Backblaze B2)

Generated PDFs are stored temporarily in Backblaze B2 at:

```
Bucket: twinmos-assets-production
Path: /partner-pdfs/tmp/{YYYY-MM-DD}/{partner_id}/{price_list_id}-{session_hash_8}.pdf
TTL: 60 minutes (B2 lifecycle rule)
```

A **pre-signed URL** is generated with 60-minute expiry:

```ts
const signedUrl = await b2.getSignedDownloadUrl({
  bucketId: process.env.B2_BUCKET_ID,
  fileName: pdfPath,
  validDurationInSeconds: 3600,  // 60 minutes
  b2ContentDisposition: `attachment; filename="TwinMOS-PriceList-${partnerId}-${dateStr}.pdf"`,
});
```

### 8.2 Delivery to Client

The partner receives the signed URL. Their browser downloads directly from Backblaze B2 (no Strapi/Hetzner bandwidth consumed).

```json
{
  "download_url": "https://f000.backblazeb2.com/file/twinmos-assets/partner-pdfs/...",
  "expires_at": "2027-02-15T11:32:44Z",
  "file_size_bytes": 245678,
  "generated_at": "2027-02-15T10:32:44Z"
}
```

### 8.3 No Server-Side Caching

PDFs are **never cached or reused**. Every download request generates a fresh PDF with the current timestamp and a new session identifier. This ensures:
- The download log accurately records when each copy was generated
- An old watermarked copy cannot be shared and passed off as a "fresh" download
- Pricing data is always current (not stale from a cached PDF)

---

## 9. API Endpoints

### 9.1 Trigger PDF Generation

```
POST /api/v1/partner/price-lists/:id/generate-pdf
Authorization: Session cookie (__Host-twinmos-session)

→ 202 Accepted (if generation takes > 3 seconds, return job ID)
→ 200 OK (if fast < 3 seconds):
{
  "download_url": "...",
  "expires_at": "...",
  "filename": "..."
}
```

### 9.2 Check Generation Status (for async jobs)

```
GET /api/v1/partner/price-lists/generate-job/:jobId
Authorization: Session cookie

→ 200 OK:
{
  "status": "completed" | "generating" | "failed",
  "download_url": "..." (if completed),
  "error": "..." (if failed)
}
```

### 9.3 Download PDF (Redirect)

```
GET /api/v1/partner/price-lists/:id/download?token=<download-token>
→ 302 Redirect to Backblaze B2 signed URL
```

---

## 10. Security Controls

### 10.1 Access Control

- Only `Certified` or `Elite` tier partners can request PDF generation
- Only `Procurement` sub-role can access price lists (within an eligible partner account)
- Session must be valid at both generation time AND download time
- PDF download URL is a Backblaze signed URL — not publicly accessible without the signature

### 10.2 Anti-Sharing Measures

| Measure | Implementation |
|---------|----------------|
| Per-partner watermark | Company name + Partner ID on every page |
| Timestamp binding | Download time embedded; old copies are identifiable |
| Session suffix | Links each copy to a specific login session |
| No server caching | Every download = new PDF = new watermark data |
| Signed URLs expire in 60 min | Link can't be widely shared; direct link stops working quickly |
| Download log | Every download logged with IP, session, timestamp |

### 10.3 PDF Security Properties

The generated PDF is configured with:
- Print: Allowed
- Copy text: Restricted (pdf-lib `permissions` options)
- Edit: Restricted
- Fill forms: Not applicable
- Password protection: Not applied (would break partner UX; watermark is the security layer)

---

## 11. Audit Logging

Every PDF generation and download is logged in Strapi `PDFDownloadLog`:

```ts
interface PDFDownloadLog {
  id: number;
  partner_id: string;
  company_name: string;
  user_email: string;
  price_list_id: number;
  price_list_title: string;
  session_id_suffix: string;          // Last 8 chars of session ID
  generated_at: Date;
  download_url_expires_at: Date;
  downloaded_at?: Date;              // Set when redirect endpoint is called
  ip_address: string;
  user_agent: string;
  file_size_bytes: number;
}
```

**Retention:** 36 months (commercial audit evidence).

**Reporting:** TwinMOS Marketing can filter log by partner, date range, and price list to monitor download frequency.

---

## 12. Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| PDF generation (full price list ~12 pages) | < 8 seconds | Puppeteer rendering + watermark |
| PDF generation (short list ~4 pages) | < 3 seconds | Fast path (synchronous response) |
| B2 upload time | < 2 seconds | Low-latency Hetzner → Backblaze B2 |
| Total time from click to download link | < 12 seconds | Including all steps |
| Concurrent generation | Up to 5 simultaneous | Queue for overflow |
| PDF file size | 200KB–500KB (typical) | Compressed, no images |

### 12.1 Puppeteer Resource Management

```ts
// Reuse browser instance (don't launch per-request)
const browser = await puppeteer.launch({ ... });
app.on('close', () => browser.close());

// Limit concurrent requests to 5 (queue overflow)
const pdfQueue = new PQueue({ concurrency: 5 });
```

---

## 13. Error Handling

| Scenario | Response |
|----------|---------|
| Invalid session / tier | 403 RFC 9457 error; do not generate |
| Price list ID not found | 404 RFC 9457 error |
| Puppeteer rendering fails (> 30s timeout) | 500; retry once; if fail → error logged; user shown "Generation failed, try again" |
| Backblaze B2 upload fails | 500; retry 3 times with backoff; Slack #ops alert |
| PDF service unreachable | 503; queue request; Slack alert |
| Concurrent requests > 5 | 429 with retry_after; show "Generating... please wait" in UI |

---

## 14. Acceptance Criteria

### 14.1 Watermark Verification

- [ ] Downloaded PDF contains diagonal watermark with correct company name and timestamp
- [ ] Header band on page 1 shows correct partner name and download time
- [ ] Footer on every page shows correct session suffix
- [ ] Watermark is visible on screen but does not obscure table data (opacity 15%)
- [ ] PDF copy text is restricted (not copyable by keyboard shortcut)

### 14.2 Access Control

- [ ] Registered tier partner cannot access price list (403 returned)
- [ ] Certified tier with Marketing sub-role cannot download price list (403 returned)
- [ ] Certified tier with Procurement sub-role can download price list successfully
- [ ] Download after 60-minute link expiry returns error; new generation required

### 14.3 Performance

- [ ] 12-page price list generates in < 8 seconds
- [ ] 5 simultaneous generation requests all complete within 15 seconds

### 14.4 Audit

- [ ] Every download logged in PDFDownloadLog with correct partner name, user email, and timestamp
- [ ] Log is accessible to TwinMOS Marketing admin in Strapi

---

*Watermarked PDF Generation Specification v1.0 | TwinMOS Technologies | Phase 2*  
*Synchronized with: Tech Stack v1.1 §9.3 · Partner Portal Functional Spec §9 · BRD v3.0 §17*
