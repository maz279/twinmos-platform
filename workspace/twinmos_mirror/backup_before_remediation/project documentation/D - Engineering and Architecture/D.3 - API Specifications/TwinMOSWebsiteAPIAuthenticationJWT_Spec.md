# TwinMOS Website — API Authentication & JWT Specification

| Field | Value |
|-------|-------|
| **Document ID** | TWN-API-AUTH-001 |
| **Version** | 1.1 |
| **Status** | Accepted |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §5.6, §5.7, §9.2; BRD §26.3 |

---

## 1. Overview

The TwinMOS Website API uses **JSON Web Tokens (JWT)** for authentication, issued and validated by the **Strapi v5 Users-Permissions plugin**. This document specifies the token structure, authentication flows, refresh strategy, role model, and security requirements.

### 1.1 Authentication Model Summary

| Aspect | Detail |
|--------|--------|
| Token type | JWT (JSON Web Token) |
| Algorithm | HS256 (HMAC-SHA256) |
| Access token TTL | 1 hour (3,600 seconds) |
| Refresh token TTL | 30 days max; 7 days idle expiry |
| Refresh strategy | Rotating refresh tokens (new pair on every refresh) |
| Transport | HTTP `Authorization: Bearer {token}` header only |
| Cookie auth | Not used for API; HTTP-only cookies used for partner portal (Phase 3) |
| MFA | TOTP required for Editor/Admin roles (Phase 2+) |

---

## 2. Token Structure

### 2.1 Access Token (JWT)

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "id": 42,
  "iat": 1746086400,
  "exp": 1746090000
}
```

| Claim | Description |
|-------|-------------|
| `id` | Strapi user ID (integer) |
| `iat` | Issued-at timestamp (Unix epoch) |
| `exp` | Expiry timestamp (iat + 3600) |

> **Note:** Strapi v5 JWT payload is intentionally minimal. Role and permission data is resolved server-side from the database on each authenticated request — it is **not** embedded in the token to prevent stale permission caches.

### 2.2 Token Secret

The JWT signing secret is stored in `JWT_SECRET` environment variable (minimum 32 characters, randomly generated). It is **never** committed to version control.

```
JWT_SECRET=<randomly-generated-256-bit-secret>
```

Configured in Strapi: `config/plugins.ts`:
```typescript
export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '1h',
      },
      jwtManagement: 'refresh',
      sessions: {
        maxRefreshTokenLifespan: 30 * 24 * 60 * 60, // 30 days in seconds
        idleRefreshTokenLifespan: 7 * 24 * 60 * 60,  // 7 days in seconds
      },
    },
  },
});
```

---

## 3. Authentication Flows

### 3.1 Login Flow (Email + Password)

```
Client                          Strapi
  │                               │
  │  POST /api/auth/local         │
  │  { identifier, password }     │
  │ ─────────────────────────────►│
  │                               │ Validate credentials
  │                               │ Generate access token (1h)
  │                               │ Generate refresh token (30d)
  │  200 OK                       │
  │  { jwt, refreshToken, user }  │
  │ ◄─────────────────────────────│
  │                               │
  │  Store tokens securely        │
  │  (memory / httpOnly cookie)   │
```

**Request:**
```http
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "editor@twinmos.com",
  "password": "SecureP@ssword123"
}
```

**Response (200 OK):**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIsImlhdCI6MTc0NjA4NjQwMCwiZXhwIjoxNzQ2MDkwMDAwfQ.HMAC_SIGNATURE",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.REFRESH_PAYLOAD.REFRESH_SIGNATURE",
  "user": {
    "id": 42,
    "username": "twinmos_editor",
    "email": "editor@twinmos.com",
    "role": {
      "id": 3,
      "name": "Editor",
      "type": "editor"
    }
  }
}
```

### 3.2 Authenticated Request

All authenticated API requests must include the access token in the `Authorization` header:

```http
GET /api/rma-requests/RMA-2026-00123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 Token Refresh Flow (Rotating Tokens)

When the access token expires, the client uses the refresh token to obtain a new pair:

```
Client                          Strapi
  │                               │
  │  POST /api/auth/refresh       │
  │  { refreshToken: "..." }      │
  │ ─────────────────────────────►│
  │                               │ Validate refresh token
  │                               │ Check not expired/revoked
  │                               │ Invalidate OLD refresh token
  │                               │ Issue NEW access token + refresh token
  │  200 OK                       │
  │  { jwt, refreshToken }        │
  │ ◄─────────────────────────────│
  │                               │
  │  Replace stored tokens        │
```

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_ACCESS_TOKEN",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_REFRESH_TOKEN"
}
```

> **Critical:** Each refresh token is **single-use**. Using a previously-consumed refresh token returns `401 Unauthorized` and invalidates the entire session (security protection against refresh token theft).

### 3.4 Logout Flow

```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "..."
}
```

Server-side action: revoke refresh token immediately. Access token remains technically valid until its 1-hour expiry, but the client discards it.

### 3.5 Token Expiry Handling (Client-Side)

```
Client receives 401 Unauthorized
       │
       ▼
Is refreshToken available and not expired?
       │
  Yes──┤──► POST /api/auth/refresh
       │          │
       │     Success? ─► Retry original request with new token
       │          │
       │     Failure? ─► Redirect to login
       │
  No───┴──► Redirect to login
```

---

## 4. Role Model (Strapi RBAC)

### 4.1 Roles

| Role | ID | Description | API Access |
|------|----|-------------|------------|
| **Public** | — | Unauthenticated visitors | Read-only: products, categories, brands, distributors, news, content pages, search |
| **Authenticated** | 1 | Registered partner portal users | Public + warranty status, RMA status |
| **Author** | 2 | Content creators | Create/edit news articles, content pages (own content) |
| **Editor** | 3 | Content editors | Full content management, no admin settings |
| **Admin** | 4 | Full administrative access | All endpoints, Strapi admin panel |
| **API-Key** | — | Server-to-server (CRM, ERP) | Scoped by API key permissions |

### 4.2 Public Endpoints (No Auth Required)

All `GET` endpoints on: `/api/products`, `/api/categories`, `/api/brands`, `/api/compatibility/search`, `/api/distributors`, `/api/retailers`, `/api/news-articles`, `/api/content-pages`, `/api/regional-pages`, `/api/search`

Write endpoints: `POST /api/form-submissions`, `POST /api/warranty-registrations` (require Turnstile token, not JWT)

### 4.3 Authenticated Endpoints (JWT Required)

| Endpoint | Minimum Role |
|----------|-------------|
| `POST /api/rma-requests` | Authenticated |
| `GET /api/rma-requests/{id}` | Authenticated (own RMA only) |
| `POST /api/auth/refresh` | Valid refresh token |
| `POST /api/auth/logout` | Authenticated |
| `GET /api/partner/*` (Phase 3) | Authenticated (partner role) |

### 4.4 Admin-Only Endpoints (Editor+)

Content management, Strapi admin panel, webhook configuration — accessed via Strapi admin UI at `https://cms.twinmos.com/admin`.

---

## 5. Multi-Factor Authentication (Phase 2+)

MFA using Time-based One-Time Passwords (TOTP) is required for Editor and Admin roles.

**Provider:** Strapi v5 MFA plugin (TOTP via authenticator apps — Google Authenticator, Authy, 1Password)

**Flow:**
1. User logs in with email + password → receives `mfaRequired: true` in response
2. User submits 6-digit TOTP code: `POST /api/auth/local/mfa` `{ token: "123456", tempToken: "..." }`
3. Server validates TOTP → issues full JWT pair

**Backup codes:** 8 single-use recovery codes issued at MFA setup.

---

## 6. Partner Portal Authentication (Phase 3)

The Phase 3 partner portal uses **Better Auth** (TypeScript-first auth library) rather than Strapi's Users-Permissions plugin. Better Auth provides:
- Database-backed sessions (PostgreSQL)
- HTTP-only session cookies (not JWT for browser clients)
- TOTP MFA built-in
- Organisation management for distributor accounts

See: [TwinMOSWebsiteIntegrationSpecBetter_Auth.md](../D.4 - Integration Specifications/TwinMOSWebsiteIntegrationSpecBetter_Auth.md)

---

## 7. Security Requirements

### 7.1 Token Storage (Client-Side)

| Client Type | Storage Method | Notes |
|-------------|---------------|-------|
| Web frontend (Astro/React) | In-memory (JS variable) | Not localStorage — prevents XSS theft |
| Partner portal (Phase 3) | HTTP-only cookie | Set by server; inaccessible to JS |
| Server-to-server | Environment variable | Never in code or logs |

### 7.2 Transport Security

- **HTTPS only** — TLS 1.3, HSTS preload enabled on `cms.twinmos.com`
- **No HTTP fallback** — Any HTTP request returns `301 Redirect` to HTTPS
- Strapi security middleware enforces `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### 7.3 Token Security Practices

| Practice | Implementation |
|----------|---------------|
| Short access token TTL | 1 hour (balance between security and UX) |
| Rotating refresh tokens | Each use invalidates the old token |
| Refresh token revocation on logout | Server-side immediate revocation |
| Detect refresh token reuse | Reusing a consumed token = full session invalidation |
| Token binding to IP (optional P2) | Log IP at issue time; alert on major geographic change |
| Audit log | All auth events logged in Strapi `audit_log` collection |

### 7.4 Rate Limiting on Auth Endpoints

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/local` | 5 requests / 5 minutes per IP |
| `POST /api/auth/refresh` | 20 requests / 5 minutes per IP |
| `POST /api/auth/local/mfa` | 5 requests / 5 minutes per IP |

Lockout: After 10 failed login attempts → account temporarily locked, email notification sent.

---

## 8. Error Responses

All auth errors use RFC 9457 Problem Details format:

**401 Unauthorized (invalid or expired token):**
```json
{
  "type": "https://api.twinmos.com/errors/authentication",
  "title": "Unauthorized",
  "status": 401,
  "detail": "JWT access token is invalid or has expired.",
  "instance": "/api/rma-requests/RMA-2026-00123"
}
```

**403 Forbidden (insufficient permissions):**
```json
{
  "type": "https://api.twinmos.com/errors/authorization",
  "title": "Forbidden",
  "status": 403,
  "detail": "Your role 'authenticated' does not have access to this resource.",
  "instance": "/api/admin/users"
}
```

---

## 9. Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `STRAPI_ADMIN_JWT_SECRET` | Strapi admin panel JWT secret | Yes |
| `API_TOKEN_SALT` | Salt for Strapi API tokens | Yes |

---

## 10. Related Documents

- [TwinMOSWebsiteAPISpecificationOpenAPI.yaml](TwinMOSWebsiteAPISpecificationOpenAPI.yaml)
- [TwinMOSWebsiteAPIRateLimiting_Spec.md](TwinMOSWebsiteAPIRateLimiting_Spec.md)
- [TwinMOSWebsiteIntegrationSpecBetter_Auth.md](../D.4 - Integration Specifications/TwinMOSWebsiteIntegrationSpecBetter_Auth.md)
- ADR-015: Better Auth vs Lucia
