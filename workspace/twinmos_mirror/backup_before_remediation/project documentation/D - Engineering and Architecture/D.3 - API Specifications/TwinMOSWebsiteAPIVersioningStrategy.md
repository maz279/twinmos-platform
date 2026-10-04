# TwinMOS Website — API Versioning Strategy

| Field | Value |
|-------|-------|
| **Document ID** | TWN-API-VERS-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §1.2; BRD §26.3 |

---

## 1. Overview

The TwinMOS Website API adopts **URL-path versioning** as its primary versioning strategy. All API endpoints are prefixed with a version segment, ensuring backward compatibility and providing clear upgrade paths for API consumers (frontend, CRM, ERP, partner integrations).

This document defines:
- Versioning scheme and conventions
- Current version baseline
- Lifecycle phases (current → deprecated → sunset)
- Breaking vs. non-breaking change classification
- Client migration playbook

---

## 2. Versioning Scheme

### 2.1 URL Structure

```
https://cms.twinmos.com/api/v{major}/{resource}
```

**Examples:**
```
GET https://cms.twinmos.com/api/v1/products
GET https://cms.twinmos.com/api/v1/products/42
POST https://cms.twinmos.com/api/v1/form-submissions
GET https://cms.twinmos.com/api/v2/products   ← (future, only if breaking change)
```

### 2.2 Version Scope

Versioning applies at the **major** level only:

| Component | Versioned? | Notes |
|-----------|-----------|-------|
| URL path (`/api/v1/...`) | Yes | Major version in path |
| Response schema fields (additions) | No | Non-breaking; always additive |
| Response schema fields (removals/renames) | Yes | Triggers new major version |
| Query parameter additions | No | Non-breaking |
| Query parameter removals | Yes | Triggers new major version |
| HTTP method changes | Yes | Triggers new major version |
| Error format (RFC 9457) | No | Stable across all versions |
| Authentication mechanism | No | JWT Bearer is version-agnostic |

### 2.3 Current Version

| Version | Status | Available Since | Sunset Date |
|---------|--------|----------------|-------------|
| **v1** | **Current** | Phase 1 Launch | TBD (minimum 12 months after v2 launch) |

There is currently **no v2**. A v2 will only be created if a breaking change is unavoidable and cannot be mitigated through additive design.

---

## 3. Lifecycle Phases

```
PROPOSED → CURRENT → DEPRECATED → SUNSET
```

### 3.1 Current
- Active version, fully supported
- All new features added here first
- SLA: 99.9% uptime guaranteed

### 3.2 Deprecated
- Still functional; a successor version (`v2`) exists
- **Minimum 12-month deprecation notice** before sunset
- Deprecation signalled via HTTP response headers on every request:
  ```
  Deprecation: true
  Sunset: Sat, 01 May 2027 00:00:00 GMT
  Link: <https://cms.twinmos.com/api/v2/products>; rel="successor-version"
  ```
- Monthly email notice to registered API consumers
- Documentation updated with migration guide

### 3.3 Sunset
- Version is shut down
- Returns `HTTP 410 Gone` with RFC 9457 Problem Details:
  ```json
  {
    "type": "https://api.twinmos.com/errors/version-sunset",
    "title": "API Version Sunset",
    "status": 410,
    "detail": "API v1 has been sunset. Please migrate to /api/v2/.",
    "instance": "/api/v1/products"
  }
  ```

---

## 4. Breaking vs. Non-Breaking Changes

### 4.1 Breaking Changes (require new major version)

A change is **breaking** if it can cause existing clients to fail without modification:

| Change Type | Example |
|------------|---------|
| Remove a response field | Remove `ean` from Product response |
| Rename a response field | `partNumber` → `sku` |
| Change a field's data type | `id: integer` → `id: string` |
| Remove an endpoint | DELETE `/api/v1/search` |
| Change an endpoint's HTTP method | POST `/api/v1/products` → PUT |
| Make a previously optional request field required | `email` was optional, now required |
| Remove a query parameter | Remove `filters[brand][slug]` support |
| Change pagination behaviour (cursor vs offset) | Switch from limit/offset to cursor |
| Change authentication requirement | Public endpoint becomes authenticated-only |
| Change error response format | Switch from RFC 9457 to custom format |

### 4.2 Non-Breaking Changes (no new version required)

| Change Type | Example |
|------------|---------|
| Add a new optional response field | Add `specifications.thermalPad` to Product |
| Add a new optional query parameter | Add `filters[launchYear]` filter |
| Add a new endpoint | Add `/api/v1/firmware-downloads` |
| Add a new enum value | Add `campaign` to `formType` enum |
| Improve validation error messages | More descriptive `detail` text |
| Add new Strapi collection | New content type with own endpoints |
| Performance improvements | Caching, query optimisation |
| Change default sort order | `publishedAt:desc` (documented change, announced) |

> **Guideline:** When in doubt, design additive. Add new fields alongside old ones; deprecate old fields with a `@deprecated` note in the OpenAPI spec before removing in the next major version.

---

## 5. Additive Deprecation Pattern

Before removing a field in a breaking-change release, deprecate it in the current version:

**Step 1 — Mark field deprecated in OpenAPI spec:**
```yaml
properties:
  partNumber:
    type: string
    deprecated: true
    description: "Deprecated: use `sku` instead. Will be removed in v2."
  sku:
    type: string
    description: "Canonical SKU. Replaces `partNumber`."
```

**Step 2 — Return both fields during transition period:**
```json
{
  "partNumber": "TMD516GB5600U36",
  "sku": "TMD516GB5600U36"
}
```

**Step 3 — Remove `partNumber` only in v2, after minimum 12-month deprecation.**

---

## 6. API Version Discovery

Clients can discover supported versions:

```
GET https://cms.twinmos.com/api/versions
```

Response:
```json
{
  "versions": [
    {
      "version": "v1",
      "status": "current",
      "baseUrl": "https://cms.twinmos.com/api/v1",
      "docsUrl": "https://docs.twinmos.com/api/v1"
    }
  ],
  "currentVersion": "v1"
}
```

---

## 7. Versioning in Strapi v5

Strapi v5 uses the Strapi Document Service API internally. Custom versioning is implemented via:

1. **Custom Koa router middleware** that rewrites `/api/v1/` → Strapi's internal `/api/` route namespace.
2. All Strapi collection API routes are exposed under the versioned prefix.
3. A thin version-routing middleware logs which version each request uses for telemetry.

**Implementation file:** `src/middlewares/apiVersioning.ts`

```typescript
// Strips /v1/ prefix and forwards to Strapi default route handler
export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.path.startsWith('/api/v1/')) {
      ctx.path = ctx.path.replace('/api/v1/', '/api/');
    }
    await next();
  };
};
```

---

## 8. Versioning for Webhooks

Outbound webhooks (Strapi → CRM, ISR revalidation) include a version field in the payload:

```json
{
  "apiVersion": "v1",
  "event": "product.published",
  "timestamp": "2026-05-01T10:00:00Z",
  "data": { ... }
}
```

Webhook consumers must handle the `apiVersion` field for future compatibility. Webhook payload changes follow the same breaking/non-breaking rules as REST responses.

---

## 9. Client Migration Playbook

When v2 is launched:

| Step | Action | Timeline |
|------|--------|---------|
| 1 | Announce v2 availability via changelog and API consumers email list | T+0 |
| 2 | Add `Deprecation` + `Sunset` headers to all v1 responses | T+0 |
| 3 | Update OpenAPI spec to mark v1 as deprecated | T+0 |
| 4 | Publish v1 → v2 migration guide in docs | T+0 |
| 5 | Notify Astro frontend team to update API client | T+1 month |
| 6 | Notify CRM/ERP integration owners | T+1 month |
| 7 | Monitor v1 traffic in Plausible/Sentry; assist remaining consumers | T+1 to T+12 |
| 8 | Sunset v1 (return 410 Gone) | T+12 months |

---

## 10. Related Documents

- [TwinMOSWebsiteAPISpecificationOpenAPI.yaml](TwinMOSWebsiteAPISpecificationOpenAPI.yaml) — Full API spec
- [TwinMOSWebsiteAPIErrorHandling_RFC9457.md](TwinMOSWebsiteAPIErrorHandling_RFC9457.md) — Error response format
- [TwinMOSWebsiteAPIAuthenticationJWT_Spec.md](TwinMOSWebsiteAPIAuthenticationJWT_Spec.md) — Authentication spec
- ADR-002: Architecture Patterns
