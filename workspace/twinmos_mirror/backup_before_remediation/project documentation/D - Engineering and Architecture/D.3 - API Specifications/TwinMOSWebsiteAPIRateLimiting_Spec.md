# TwinMOS Website — API Rate Limiting Specification

| Field | Value |
|-------|-------|
| **Document ID** | TWN-API-RLIMIT-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §18.1, §22.2; BRD §26.3 |

---

## 1. Overview

The TwinMOS Website API enforces rate limiting at two independent layers:

1. **Cloudflare Edge** — First line of defence; blocks abusive traffic before it reaches the origin VPS
2. **Strapi Middleware** — Application-level limits; per-endpoint granularity

This dual-layer approach ensures protection against DDoS, scraping, brute-force, and spam even if one layer is bypassed.

---

## 2. Rate Limit Tiers

### 2.1 Global Tier Summary

| Tier | Applies To | Limit | Window | Enforced By |
|------|-----------|-------|--------|------------|
| **Public API** | All unauthenticated GET requests | 100 req/min | 60s rolling | Cloudflare + Strapi |
| **Authenticated API** | JWT-bearing requests | 1,000 req/min | 60s rolling | Strapi |
| **Auth endpoints** | Login, refresh | 5 req / 5 min | 300s rolling | Strapi (built-in) |
| **Form submissions** | `POST /api/form-submissions` | 10 req/min | 60s rolling | Strapi + Turnstile |
| **Warranty registration** | `POST /api/warranty-registrations` | 5 req/min | 60s rolling | Strapi |
| **Search** | `GET /api/search` | 60 req/min | 60s rolling | Strapi |
| **Serial check** (P2) | `POST /api/serial-check` | 30 req/min | 60s rolling | Strapi |
| **Webhook inbound** | CRM/ERP callbacks | Allowlisted IPs | N/A | Cloudflare IP allowlist |

### 2.2 IP-Based vs. User-Based Limiting

| Context | Identifier |
|---------|-----------|
| Public (unauthenticated) | Source IP address |
| Authenticated | JWT user ID (more generous limits) |
| Server-to-server (CRM, ERP) | IP allowlist (bypasses standard limits) |

---

## 3. Layer 1 — Cloudflare Edge Rate Limiting

Cloudflare rate limiting rules are defined in the Cloudflare dashboard and applied at the edge, before traffic reaches the Hetzner VPS.

### 3.1 Cloudflare Rules

| Rule Name | Expression | Action | Limit |
|-----------|-----------|--------|-------|
| API Public Rate Limit | `http.request.uri.path starts_with "/api/"` | Challenge / Block | 200 req/min per IP |
| Auth Endpoint Brute Force | `http.request.uri.path in {"/api/auth/local", "/api/auth/refresh"}` | Block | 10 req/min per IP |
| Form Spam Protection | `http.request.method eq "POST" and http.request.uri.path contains "/form-submissions"` | Challenge | 20 req/min per IP |
| Search Flood | `http.request.uri.path starts_with "/api/search"` | Block | 120 req/min per IP |

> **Note:** Cloudflare limits are intentionally set **2x** the Strapi limits to allow legitimate bursts while catching genuine abuse at the edge. Strapi limits are the enforced business limits.

### 3.2 Cloudflare WAF Bot Management

In addition to rate limits, Cloudflare Bot Management (included in Cloudflare Pro+):
- Automatically scores traffic for bot likelihood
- Blocks known malicious bots
- Challenges suspicious requests with Cloudflare Challenge page
- Allows Googlebot, Bingbot, and verified good bots

---

## 4. Layer 2 — Strapi Application Rate Limiting

### 4.1 Implementation

Strapi v5 does not have built-in per-route rate limiting beyond the auth plugin default. A custom middleware using **`koa2-ratelimit`** (or equivalent) is implemented.

**Installation:**
```bash
npm install koa2-ratelimit
```

**Middleware file:** `src/middlewares/rateLimiter.ts`

```typescript
import { RateLimit } from 'koa2-ratelimit';

const createLimiter = (max: number, intervalSeconds: number) =>
  RateLimit.middleware({
    interval: { second: intervalSeconds },
    max,
    keyGenerator: (ctx) => {
      // Use JWT user ID for authenticated requests, IP for public
      const userId = ctx.state?.user?.id;
      return userId ? `user:${userId}` : `ip:${ctx.ip}`;
    },
    handler: (ctx) => {
      ctx.status = 429;
      ctx.type = 'application/problem+json';
      ctx.body = {
        type: 'https://api.twinmos.com/errors/rate-limit',
        title: 'Too Many Requests',
        status: 429,
        detail: `Rate limit exceeded. Maximum ${max} requests per ${intervalSeconds} seconds.`,
        instance: ctx.path,
      };
    },
  });

export const publicApiLimiter = createLimiter(100, 60);
export const authApiLimiter = createLimiter(1000, 60);
export const formSubmissionLimiter = createLimiter(10, 60);
export const searchLimiter = createLimiter(60, 60);
export const serialCheckLimiter = createLimiter(30, 60);
export const warrantyLimiter = createLimiter(5, 60);
```

### 4.2 Route-to-Limiter Mapping

| Route Pattern | Limiter Applied |
|--------------|----------------|
| All public `GET /api/*` | `publicApiLimiter` |
| All authenticated `GET/POST /api/*` (with JWT) | `authApiLimiter` |
| `POST /api/form-submissions` | `formSubmissionLimiter` (overrides public) |
| `GET /api/search` | `searchLimiter` |
| `POST /api/serial-check` | `serialCheckLimiter` |
| `POST /api/warranty-registrations` | `warrantyLimiter` |

---

## 5. Rate Limit Response Headers

Every API response includes rate limit metadata headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 1746086460
X-RateLimit-Policy: 100;w=60
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `X-RateLimit-Policy` | Human-readable policy string (IETF draft) |

### 5.1 Rate Limit Exceeded Response (HTTP 429)

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 42
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1746086442

{
  "type": "https://api.twinmos.com/errors/rate-limit",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit of 100 requests/minute exceeded. Retry after 42 seconds.",
  "instance": "/api/products",
  "traceId": "01HXYZ..."
}
```

---

## 6. IP Allowlisting (Server-to-Server)

Internal and partner system calls (HubSpot webhooks, ERP sync, Cloudflare Pages build hooks) are exempted from rate limiting via IP allowlist.

**Allowlisted sources:**
- Cloudflare Pages build network (`104.16.0.0/12`, `162.158.0.0/15`)
- HubSpot webhook IPs (per HubSpot docs)
- Internal monitoring (UptimeRobot, Sentry uptime)

**Cloudflare Firewall Rule:**
```
ip.src in {104.16.0.0/12 162.158.0.0/15} → Skip all rate limits
```

**Strapi middleware:**
```typescript
const ALLOWLISTED_IPS = process.env.RATE_LIMIT_ALLOWLIST?.split(',') ?? [];

if (ALLOWLISTED_IPS.includes(ctx.ip)) {
  return next(); // Bypass rate limiting
}
```

---

## 7. Strapi Built-in Auth Rate Limiting

The Strapi `users-permissions` plugin includes built-in rate limiting for authentication endpoints:

**Configuration (`config/plugins.ts`):**
```typescript
export default ({ env }) => ({
  'users-permissions': {
    config: {
      rateLimit: {
        interval: 300000, // 5 minutes in milliseconds
        max: 5,           // 5 attempts per 5 minutes
      },
    },
  },
});
```

This applies to: `POST /api/auth/local`, `POST /api/auth/register`, `POST /api/auth/forgot-password`

**Lockout after 10 failures (custom middleware):**
After 10 cumulative failed login attempts within 24 hours, the account is locked and an unlock email is sent.

---

## 8. Monitoring & Alerting

### 8.1 Sentry Rate Limit Tracking

Custom Sentry event on rate limit trigger:
```typescript
Sentry.captureEvent({
  message: 'Rate limit triggered',
  level: 'warning',
  extra: {
    path: ctx.path,
    ip: ctx.ip,
    limit: max,
    userAgent: ctx.headers['user-agent'],
  },
});
```

### 8.2 Cloudflare Analytics

Cloudflare dashboard provides:
- Real-time rate limit challenge events
- Geographic distribution of blocked IPs
- Trend analysis for capacity planning

### 8.3 Alerting Thresholds

| Condition | Alert |
|-----------|-------|
| >500 rate limit events in 5 minutes | Slack alert → potential DDoS |
| Same IP triggered 100+ times in 1 hour | Auto-block + notify security |
| Auth endpoint rate limit from new geographic region | Slack + email alert |

---

## 9. Rate Limit Bypass Cases

| Scenario | Approach |
|----------|---------|
| Astro build-time data fetching | Cloudflare Pages build IPs are allowlisted |
| CMS webhook delivery | Strapi outbound (not inbound API) — not rate limited |
| Admin panel activity | Not subject to public API rate limits |
| Lighthouse CI / automated tests | CI runner IPs allowlisted in staging environment |

---

## 10. Phase Evolution

| Phase | Change |
|-------|--------|
| **Phase 1** | Cloudflare + Strapi middleware as specified above |
| **Phase 2** | Redis-backed rate limiter replaces in-memory store (survives server restarts, multi-instance ready) |
| **Phase 3** | Per-user tiered limits for partner API access (distributor tier: 5,000 req/min) |

---

## 11. Related Documents

- [TwinMOSWebsiteAPIErrorHandling_RFC9457.md](TwinMOSWebsiteAPIErrorHandling_RFC9457.md)
- [TwinMOSWebsiteAPIAuthenticationJWT_Spec.md](TwinMOSWebsiteAPIAuthenticationJWT_Spec.md)
- [TwinMOSWebsiteIntegrationSpecCloudflare_Turnstile.md](../D.4 - Integration Specifications/TwinMOSWebsiteIntegrationSpecCloudflare_Turnstile.md)
