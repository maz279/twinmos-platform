# TwinMOS Website — Webhook Specification

| Field | Value |
|-------|-------|
| **Document ID** | TWN-API-WEBHOOK-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §14.4, §15; BRD §26.3 |

---

## 1. Overview

The TwinMOS Website uses **outbound webhooks** to notify downstream systems when CMS events occur in Strapi. Webhooks enable:

- **ISR revalidation:** Trigger Cloudflare Pages to rebuild stale static pages when content is published
- **CRM sync:** Push new leads and form submissions to HubSpot CRM automatically
- **Build triggers:** Initiate Cloudflare Pages production deploy on major content changes
- **Email notifications:** Trigger Resend email sequences on key events

All webhooks are sent from **Strapi** (the webhook producer) to **external consumers**.

> **Inbound webhooks** (external systems calling Strapi) are covered in the respective integration specifications.

---

## 2. Webhook Architecture

```
Strapi CMS
    │
    │  Lifecycle hook triggers on entity event
    │
    ▼
Strapi Webhook Service
    │
    ├──► Cloudflare Pages (ISR revalidation)
    ├──► HubSpot CRM (lead creation)
    ├──► Resend (transactional email trigger)
    └──► Cloudflare Build Hook (full rebuild)
```

---

## 3. Webhook Payload Format

### 3.1 Standard Payload Structure

All webhook payloads follow a consistent envelope:

```json
{
  "apiVersion": "v1",
  "event": "product.published",
  "timestamp": "2026-05-01T10:30:00.000Z",
  "webhookId": "01HXYZ-WEBHOOK-UUID",
  "environment": "production",
  "data": {
    "id": 42,
    "documentId": "abc123xyz",
    "model": "product",
    "entry": {
      "id": 42,
      "name": "VOLTX DDR5 16GB 5600MHz",
      "slug": "voltx-ddr5-16gb-5600mhz",
      "status": "published",
      "publishedAt": "2026-05-01T10:29:55.000Z",
      "updatedAt": "2026-05-01T10:29:55.000Z"
    }
  },
  "meta": {
    "requestId": "01HXYZ-REQUEST-UUID",
    "strapiVersion": "5.x"
  }
}
```

### 3.2 Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| `apiVersion` | string | Webhook payload version (`v1`) |
| `event` | string | Event name (see §4) |
| `timestamp` | ISO 8601 | When the event occurred (UTC) |
| `webhookId` | string | Unique webhook delivery ID (ULID) |
| `environment` | string | `production`, `staging`, or `development` |
| `data.id` | integer | Entity primary key |
| `data.documentId` | string | Strapi v5 document ID |
| `data.model` | string | Strapi content type (e.g., `product`, `news-article`) |
| `data.entry` | object | Partial entity data (fields relevant to the consumer) |
| `meta.requestId` | string | Idempotency key — same event will have same `requestId` on retry |
| `meta.strapiVersion` | string | Strapi version that emitted the webhook |

---

## 4. Event Catalog

### 4.1 Product Events

| Event | Trigger | Consumers |
|-------|---------|----------|
| `product.published` | Product moves to `published` state in Strapi | Cloudflare Pages ISR, MeiliSearch index update |
| `product.unpublished` | Product moves to `draft` state | Cloudflare Pages ISR, MeiliSearch index delete |
| `product.deleted` | Product permanently deleted | Cloudflare Pages ISR, MeiliSearch index delete |
| `product.updated` | Published product fields updated | Cloudflare Pages ISR (if slug changed: full rebuild) |

### 4.2 Form & CRM Events

| Event | Trigger | Consumers |
|-------|---------|----------|
| `formSubmission.created` | New form submission saved | HubSpot CRM, Resend email |
| `warrantyRegistration.created` | Warranty registration confirmed | Resend email (confirmation to customer) |
| `rmaRequest.created` | New RMA request submitted (P2) | Resend email (acknowledgement), HubSpot ticket |
| `rmaRequest.statusUpdated` | RMA status changes (P2) | Resend email (status update to customer) |

### 4.3 Content Events

| Event | Trigger | Consumers |
|-------|---------|----------|
| `newsArticle.published` | News article published | Cloudflare Pages ISR, MeiliSearch index |
| `newsArticle.updated` | Published news article edited | Cloudflare Pages ISR |
| `contentPage.published` | Content page published | Cloudflare Pages build hook |
| `regionalPage.updated` | Regional landing page updated | Cloudflare Pages ISR |

### 4.4 Distribution Events

| Event | Trigger | Consumers |
|-------|---------|----------|
| `distributor.updated` | Distributor record updated (address, lat/lng) | Cloudflare Pages ISR (where-to-buy pages) |
| `retailer.updated` | Retailer record updated | Cloudflare Pages ISR |

---

## 5. Security

### 5.1 HMAC-SHA256 Signature

Every webhook delivery includes an **HMAC-SHA256 signature** in the request headers so consumers can verify authenticity.

**Signature header:** `X-TwinMOS-Signature: sha256={hex_digest}`

**Signing:**
```typescript
import { createHmac } from 'crypto';

function signPayload(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
}
```

**Consumer verification:**
```typescript
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = signPayload(payload, secret);
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

**Shared secret:** Stored in `WEBHOOK_SECRET` environment variable in Strapi. Never logged or included in payloads.

### 5.2 HTTPS Only

All webhook delivery endpoints must use HTTPS (TLS 1.2+). Strapi will refuse to deliver webhooks to HTTP endpoints.

### 5.3 IP Restrictions (Outbound from Strapi)

Webhook consumers should whitelist the Hetzner VPS IP to reject spoofed deliveries from other sources.

---

## 6. Delivery Semantics

### 6.1 Delivery Guarantees

| Property | Behaviour |
|----------|----------|
| Delivery guarantee | **At-least-once** (may send duplicates on retry) |
| Ordering | **Best-effort** (do not rely on delivery order) |
| Timeout | 10 seconds per attempt |
| Retry attempts | 3 (exponential backoff: 5s, 30s, 120s) |

### 6.2 Retry Policy

```
Attempt 1 → 10s timeout
    Failure → wait 5s
Attempt 2 → 10s timeout
    Failure → wait 30s
Attempt 3 → 10s timeout
    Failure → Log to dead-letter queue (audit_log)
    → Alert via Sentry (warning level)
```

### 6.3 Idempotency

Webhook consumers **must be idempotent** — duplicate deliveries of the same `webhookId` should not cause duplicate processing.

**Recommended consumer approach:**
```typescript
const processed = await redis.get(`webhook:processed:${webhookId}`);
if (processed) return res.status(200).json({ status: 'already_processed' });

await processWebhook(payload);
await redis.set(`webhook:processed:${webhookId}`, 'true', 'EX', 86400); // 24h TTL
```

### 6.4 Dead Letter Queue

Failed webhooks (all 3 retries exhausted) are stored in the Strapi `audit_log` collection:

```json
{
  "action": "webhook.delivery_failed",
  "entity": "webhook",
  "entityId": "01HXYZ-WEBHOOK-UUID",
  "details": {
    "event": "formSubmission.created",
    "consumer": "https://api.hubspot.com/crm/v3/objects/contacts",
    "attempts": 3,
    "lastError": "ECONNREFUSED",
    "payload": { ... }
  },
  "timestamp": "2026-05-01T10:30:05.000Z"
}
```

Ops team can replay failed webhooks from the Strapi admin panel.

---

## 7. Webhook Consumer Configurations

### 7.1 Cloudflare Pages ISR Revalidation Hook

| Property | Value |
|----------|-------|
| URL | `https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache` |
| Method | `POST` |
| Auth | `Authorization: Bearer {CF_API_TOKEN}` |
| Events | `product.published`, `product.updated`, `newsArticle.published`, `distributor.updated` |
| Payload adapter | Strapi → Cloudflare purge format (custom service) |

**Cloudflare purge payload:**
```json
{
  "tags": ["product-{documentId}", "product-list"]
}
```

### 7.2 Cloudflare Pages Full Build Hook

| Property | Value |
|----------|-------|
| URL | `https://api.cloudflare.com/client/v4/pages/projects/twinmos-frontend/deployments` |
| Method | `POST` |
| Events | `contentPage.published` (structural changes only) |
| Condition | Only trigger if slug changed or new page created |

### 7.3 HubSpot CRM Webhook

| Property | Value |
|----------|-------|
| URL | `https://api.hubapi.com/crm/v3/objects/contacts` |
| Method | `POST` |
| Auth | `Authorization: Bearer {HUBSPOT_API_TOKEN}` |
| Events | `formSubmission.created` |
| Field mapping | See [TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md](../D.4 - Integration Specifications/TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md) |

### 7.4 Resend Email Trigger

Resend emails are triggered via the **Strapi emailService** internal service call (not an outbound webhook). See [TwinMOSWebsiteIntegrationSpecResend_Email.md](../D.4 - Integration Specifications/TwinMOSWebsiteIntegrationSpecResend_Email.md).

---

## 8. Webhook Registration in Strapi

Webhooks are registered in the Strapi admin panel under **Settings → Webhooks** or via the Strapi API:

```http
POST /api/admin/webhooks
Authorization: Bearer {STRAPI_ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "CRM Lead Sync",
  "url": "https://internal-webhook-router.twinmos.com/crm-sync",
  "headers": {
    "X-Webhook-Source": "twinmos-strapi"
  },
  "events": ["entry.publish"],
  "enabled": true
}
```

**Internal webhook router** (`webhook-router` service on Strapi) handles routing events to specific consumers and applying the HMAC signature + payload transformation before forwarding.

---

## 9. Monitoring

- All webhook deliveries logged in Strapi `audit_log`
- Sentry alert on delivery failure (warning) and dead letter queue entry (error)
- Cloudflare build hook successes logged in Cloudflare Pages dashboard
- HubSpot CRM shows contact creation timestamps for CRM webhook verification

---

## 10. Related Documents

- [TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md](../D.4 - Integration Specifications/TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md)
- [TwinMOSWebsiteIntegrationSpecResend_Email.md](../D.4 - Integration Specifications/TwinMOSWebsiteIntegrationSpecResend_Email.md)
- [TwinMOSWebsiteAPIErrorHandling_RFC9457.md](TwinMOSWebsiteAPIErrorHandling_RFC9457.md)
