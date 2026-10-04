# TwinMOS Website — API Error Handling (RFC 9457 Problem Details)

| Field | Value |
|-------|-------|
| **Document ID** | TWN-API-ERR-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §1.2; BRD §26.3 (TRISK-16) |

---

## 1. Overview

The TwinMOS Website API uses **RFC 9457 — Problem Details for HTTP APIs** as the standardised error response format. This supersedes the older RFC 7807 and provides machine-readable, structured error information that enables API consumers to handle errors programmatically.

**Content-Type:** `application/problem+json`

**Standard:** [https://www.rfc-editor.org/rfc/rfc9457](https://www.rfc-editor.org/rfc/rfc9457)

> **Risk Note (TRISK-16):** Strapi v5 does not natively emit RFC 9457 responses. A custom Koa error-handling middleware has been implemented to intercept all error responses and transform them into the Problem Details format.

---

## 2. Problem Details Document Structure

### 2.1 Standard Fields

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `type` | URI string | Yes | Identifies the problem type. MUST be a URI. Dereferencing should return human-readable documentation. |
| `title` | string | Yes | Short, human-readable summary of the problem. Does NOT change between occurrences of the same problem type. |
| `status` | integer | Yes | HTTP status code (mirrors the HTTP response status). |
| `detail` | string | No | Human-readable explanation specific to this occurrence. MAY vary between occurrences. |
| `instance` | URI string | No | Reference to the specific request instance (usually the request path). |

### 2.2 TwinMOS Custom Extensions

Beyond the RFC 9457 standard fields, TwinMOS API responses include:

| Field | Type | Description |
|-------|------|-------------|
| `traceId` | string | Unique request trace ID (correlates with Sentry events and server logs) |
| `requestId` | string | Idempotency key or request UUID |
| `errors` | array | Array of field-level validation errors (validation errors only) |
| `errors[].field` | string | Field path that failed validation (e.g., `email`, `data.serialNumber`) |
| `errors[].message` | string | Human-readable validation failure message |
| `errors[].code` | string | Machine-readable validation error code |

### 2.3 Minimal Example

```json
{
  "type": "https://api.twinmos.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Product with ID 9999 was not found.",
  "instance": "/api/v1/products/9999",
  "traceId": "01HXYZ-EXAMPLE-TRACE-ID"
}
```

### 2.4 Validation Error Example (with `errors` extension)

```json
{
  "type": "https://api.twinmos.com/errors/validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more request fields failed validation.",
  "instance": "/api/v1/form-submissions",
  "traceId": "01HABC-EXAMPLE-TRACE-ID",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address.",
      "code": "invalid_format"
    },
    {
      "field": "name",
      "message": "Name is required and must be at least 2 characters.",
      "code": "required"
    }
  ]
}
```

---

## 3. Error Type Catalog

All `type` URIs use the base `https://api.twinmos.com/errors/` prefix.

### 3.1 Complete Error Type Registry

| HTTP Status | Type URI | Title | When Used |
|------------|---------|-------|----------|
| 400 | `.../errors/validation` | Validation Failed | Request body or query parameters fail schema validation |
| 400 | `.../errors/bad-request` | Bad Request | Malformed JSON, unsupported content-type |
| 400 | `.../errors/captcha-failed` | CAPTCHA Verification Failed | Cloudflare Turnstile token invalid or expired |
| 401 | `.../errors/authentication` | Unauthorized | Missing, invalid, or expired JWT access token |
| 401 | `.../errors/token-expired` | Token Expired | JWT specifically expired (distinct from invalid) |
| 401 | `.../errors/refresh-token-invalid` | Refresh Token Invalid | Refresh token expired, revoked, or reused |
| 403 | `.../errors/authorization` | Forbidden | Valid JWT but insufficient role permissions |
| 403 | `.../errors/account-locked` | Account Locked | Too many failed login attempts |
| 404 | `.../errors/not-found` | Resource Not Found | Entity with given ID or slug does not exist |
| 404 | `.../errors/route-not-found` | Endpoint Not Found | API path does not exist |
| 405 | `.../errors/method-not-allowed` | Method Not Allowed | HTTP verb not supported on this endpoint |
| 409 | `.../errors/conflict` | Conflict | Duplicate resource (e.g., email already registered) |
| 410 | `.../errors/version-sunset` | API Version Sunset | Requested API version has been sunset |
| 413 | `.../errors/payload-too-large` | Payload Too Large | Request body exceeds 10 MB limit |
| 415 | `.../errors/unsupported-media-type` | Unsupported Media Type | Content-Type not `application/json` or `multipart/form-data` |
| 422 | `.../errors/unprocessable-entity` | Unprocessable Entity | Semantically invalid request (e.g., purchase date in future) |
| 429 | `.../errors/rate-limit` | Too Many Requests | Rate limit exceeded (see rate limiting spec) |
| 500 | `.../errors/internal-server` | Internal Server Error | Unexpected server-side error |
| 502 | `.../errors/bad-gateway` | Bad Gateway | Upstream service (MeiliSearch, Resend) returned error |
| 503 | `.../errors/service-unavailable` | Service Unavailable | Strapi or database temporarily unavailable |

### 3.2 Type URI Resolution

Each error type URI resolves to documentation:

```
GET https://api.twinmos.com/errors/not-found
→ Returns HTML/JSON documentation for this error type
  (Implemented as a Cloudflare Worker or static page)
```

---

## 4. HTTP Status → Error Type Mapping

```
4xx Client Errors
├── 400 Bad Request
│   ├── application/json parse error       → bad-request
│   ├── Schema validation failure          → validation
│   └── Turnstile token failure            → captcha-failed
│
├── 401 Unauthorized
│   ├── No Authorization header            → authentication
│   ├── Invalid JWT                        → authentication
│   ├── Expired access token               → token-expired
│   └── Invalid/reused refresh token       → refresh-token-invalid
│
├── 403 Forbidden
│   ├── Insufficient role                  → authorization
│   └── Account locked                     → account-locked
│
├── 404 Not Found
│   ├── Entity not found                   → not-found
│   └── Unknown API route                  → route-not-found
│
├── 409 Conflict                           → conflict
├── 410 Gone (sunset)                      → version-sunset
└── 429 Too Many Requests                  → rate-limit

5xx Server Errors
├── 500 Internal Server Error              → internal-server
├── 502 Bad Gateway                        → bad-gateway
└── 503 Service Unavailable                → service-unavailable
```

---

## 5. Strapi Custom Error Middleware

### 5.1 Implementation

**File:** `src/middlewares/errorHandler.ts`

```typescript
import { Strapi } from '@strapi/types';

export default (_config: unknown, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err: any) {
      const status = err.status ?? err.statusCode ?? 500;
      const traceId = ctx.state?.traceId ?? crypto.randomUUID();

      ctx.status = status;
      ctx.type = 'application/problem+json';
      ctx.body = buildProblemDetails(err, status, ctx.path, traceId);

      // Log 5xx errors to Sentry
      if (status >= 500) {
        strapi.log.error('[ErrorHandler] 5xx:', err);
        Sentry.captureException(err, { extra: { traceId, path: ctx.path } });
      }
    }
  };
};

function buildProblemDetails(err: any, status: number, path: string, traceId: string) {
  const typeMap: Record<number, string> = {
    400: 'https://api.twinmos.com/errors/validation',
    401: 'https://api.twinmos.com/errors/authentication',
    403: 'https://api.twinmos.com/errors/authorization',
    404: 'https://api.twinmos.com/errors/not-found',
    409: 'https://api.twinmos.com/errors/conflict',
    429: 'https://api.twinmos.com/errors/rate-limit',
    500: 'https://api.twinmos.com/errors/internal-server',
    502: 'https://api.twinmos.com/errors/bad-gateway',
    503: 'https://api.twinmos.com/errors/service-unavailable',
  };

  const titleMap: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Resource Not Found',
    409: 'Conflict',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  const problem: Record<string, unknown> = {
    type: typeMap[status] ?? `https://api.twinmos.com/errors/http-${status}`,
    title: titleMap[status] ?? 'Unknown Error',
    status,
    detail: status < 500 ? (err.message ?? err.details?.message) : 'An unexpected error occurred.',
    instance: path,
    traceId,
  };

  // Include field-level validation errors for 400 responses
  if (status === 400 && err.details?.errors) {
    problem.errors = err.details.errors.map((e: any) => ({
      field: e.path?.join('.') ?? e.field,
      message: e.message,
      code: e.type ?? 'invalid',
    }));
  }

  return problem;
}
```

### 5.2 Middleware Registration

**File:** `config/middlewares.ts`

```typescript
export default [
  'strapi::logger',
  'strapi::errors',     // Strapi default (overridden by our handler below)
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'global::apiVersioning',
  'global::rateLimiter',
  'global::errorHandler',  // Our RFC 9457 handler — registered last
];
```

---

## 6. Error Response Examples

### 6.1 Validation Error (400)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://api.twinmos.com/errors/validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more request fields failed validation.",
  "instance": "/api/v1/warranty-registrations",
  "traceId": "01HX9J-EXAMPLE",
  "errors": [
    {
      "field": "serialNumber",
      "message": "Serial number is required.",
      "code": "required"
    },
    {
      "field": "purchaseDate",
      "message": "Purchase date cannot be in the future.",
      "code": "invalid_date_range"
    }
  ]
}
```

### 6.2 Authentication Error (401)

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/problem+json

{
  "type": "https://api.twinmos.com/errors/token-expired",
  "title": "Token Expired",
  "status": 401,
  "detail": "Your access token has expired. Please use your refresh token to obtain a new one.",
  "instance": "/api/v1/rma-requests",
  "traceId": "01HX9K-EXAMPLE"
}
```

### 6.3 Rate Limit Error (429)

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 37

{
  "type": "https://api.twinmos.com/errors/rate-limit",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit of 100 requests/minute exceeded. Retry after 37 seconds.",
  "instance": "/api/v1/search",
  "traceId": "01HX9L-EXAMPLE"
}
```

### 6.4 Not Found Error (404)

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "https://api.twinmos.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Product with documentId 'abc123xyz' was not found or is not published.",
  "instance": "/api/v1/products/abc123xyz",
  "traceId": "01HX9M-EXAMPLE"
}
```

### 6.5 Internal Server Error (500)

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/problem+json

{
  "type": "https://api.twinmos.com/errors/internal-server",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred. Our team has been notified.",
  "instance": "/api/v1/products",
  "traceId": "01HX9N-EXAMPLE"
}
```

> **Note:** 5xx `detail` messages are intentionally vague to avoid information leakage. The full error is captured in Sentry with the `traceId` for correlation.

---

## 7. Client Error Handling Guidance

### 7.1 Recommended Client Logic

```typescript
async function handleApiError(response: Response) {
  const body = await response.json();
  
  switch (response.status) {
    case 400:
      // Show field-level errors to user
      displayFormErrors(body.errors ?? []);
      break;
    case 401:
      if (body.type.includes('token-expired')) {
        await refreshToken(); // Attempt token refresh
      } else {
        redirectToLogin();
      }
      break;
    case 403:
      showAccessDeniedMessage();
      break;
    case 404:
      show404Page();
      break;
    case 429:
      const retryAfter = parseInt(response.headers.get('Retry-After') ?? '60');
      await sleep(retryAfter * 1000);
      return retryRequest();
    case 500:
    case 502:
    case 503:
      showGenericErrorMessage(body.traceId); // "Please quote ref: {traceId}"
      break;
  }
}
```

### 7.2 User-Facing Error Messages

| Error Type | User-Facing Message |
|-----------|---------------------|
| `validation` | Show field-specific errors from `errors[]` array |
| `authentication` | "Please sign in to continue." |
| `token-expired` | Silent token refresh attempt → re-try |
| `authorization` | "You don't have permission to access this. Contact support." |
| `captcha-failed` | "Security check failed. Please try again." |
| `not-found` | "This page doesn't exist. It may have been moved or deleted." |
| `rate-limit` | "Too many requests. Please wait a moment and try again." |
| `internal-server` | "Something went wrong on our end. Please try again or contact support (ref: {traceId})." |
| `service-unavailable` | "Service is temporarily unavailable. Please try again in a few minutes." |

---

## 8. Logging & Tracing

- Every request generates a unique `traceId` (ULID format via `ulid` package)
- `traceId` is included in:
  - API response body (`traceId` field)
  - Strapi server logs
  - Sentry error events (`extra.traceId`)
  - Plausible custom event data
- All 5xx errors are automatically captured in Sentry with full stack trace
- All 4xx errors are logged at `warn` level (not captured in Sentry unless anomalous)

---

## 9. Related Documents

- [TwinMOSWebsiteAPISpecificationOpenAPI.yaml](TwinMOSWebsiteAPISpecificationOpenAPI.yaml) — Full API spec with response schemas
- [TwinMOSWebsiteAPIRateLimiting_Spec.md](TwinMOSWebsiteAPIRateLimiting_Spec.md)
- [TwinMOSWebsiteIntegrationSpecSentry_Monitoring.md](../D.4 - Integration Specifications/TwinMOSWebsiteIntegrationSpecSentry_Monitoring.md)
