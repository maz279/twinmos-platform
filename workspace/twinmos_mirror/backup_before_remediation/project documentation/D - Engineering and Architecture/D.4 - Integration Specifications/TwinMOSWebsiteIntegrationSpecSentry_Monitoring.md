# TwinMOS Website — Integration Specification: Sentry Error Monitoring

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-SENTRY-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P1 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §17; BRD §22.3 |

---

## 1. Overview

**Sentry** provides error tracking, performance monitoring, and session replay for both the Astro frontend (Cloudflare Pages) and the Strapi backend (Hetzner VPS). It captures unhandled exceptions, API performance metrics, and traces the full request lifecycle from browser to server.

### 1.1 Sentry Plan

| Phase | Plan | Cost | Error Quota |
|-------|------|------|------------|
| Phase 1–2 | Free | $0/mo | 5,000 errors/month |
| Phase 3+ | Team | $26/mo | 50,000 errors/month |

### 1.2 Runtime Compatibility Note

> **Critical:** Sentry Node.js SDK (`@sentry/node`) works only with **Node.js runtime**. The Astro frontend deployed to **Cloudflare Pages** uses the **Cloudflare Workers runtime** for SSR (if any). Browser-side Sentry (`@sentry/astro` client bundle) works on all runtimes.
>
> **Impact:** TwinMOS uses SSG (static site generation) for Cloudflare Pages — no server-side Astro runtime. Therefore `@sentry/astro` client-side SDK is used for frontend error capture. Sentry Node.js SDK is used in Strapi (Node.js runtime on Hetzner).

---

## 2. Architecture

```
Browser (Cloudflare Pages)                 Server (Hetzner — Node.js)
        │                                            │
  @sentry/astro                               @sentry/node
  (client bundle)                            (Strapi plugin)
        │                                            │
        └──────────────┬─────────────────────────────┘
                       │
                  Sentry.io
              (sentry.io cloud)
                       │
           ┌───────────┼───────────┐
           │           │           │
         Issues    Performance  Releases
        (errors)   (traces)    (deployments)
```

---

## 3. Frontend Integration (Astro)

### 3.1 Installation

```bash
# In twinmos-website-frontend
npx astro add @sentry/astro
# or manual:
npm install @sentry/astro
```

### 3.2 Astro Configuration

**`astro.config.ts`:**
```typescript
import { defineConfig } from 'astro/config';
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    sentry({
      dsn: import.meta.env.PUBLIC_SENTRY_DSN,
      tracing: {
        instrumenter: 'otel',
        trackComponents: true,
      },
      replaysSessionSampleRate: 0.1,   // 10% of sessions
      replaysOnErrorSampleRate: 1.0,   // 100% on error
    }),
  ],
});
```

### 3.3 Client-Side Config

**`sentry.client.config.ts`:**
```typescript
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.PUBLIC_ENV ?? 'development',
  release: import.meta.env.PUBLIC_RELEASE_VERSION,

  // Performance monitoring
  tracesSampleRate: import.meta.env.PUBLIC_ENV === 'production' ? 0.1 : 1.0,

  // Session replay
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter out non-actionable errors
  ignoreErrors: [
    'AbortError',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    'Non-Error promise rejection captured with value: null',
  ],

  beforeSend(event) {
    // Remove sensitive data from error payloads
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

### 3.4 Server-Side Config

**`sentry.server.config.ts`:**
```typescript
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.PUBLIC_ENV ?? 'development',
  tracesSampleRate: import.meta.env.PUBLIC_ENV === 'production' ? 0.05 : 1.0,
});
```

---

## 4. Backend Integration (Strapi)

### 4.1 Installation

```bash
# In twinmos-website-backend (Strapi)
npm install @sentry/node @sentry/profiling-node
```

### 4.2 Sentry Initialization in Strapi

**`src/index.ts` (Strapi register hook):**
```typescript
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export default {
  register({ strapi }) {
    // Initialize Sentry before any other code runs
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? 'development',
      release: process.env.SENTRY_RELEASE ?? 'unknown',
      
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,  // Requires @sentry/profiling-node

      integrations: [
        nodeProfilingIntegration(),
        Sentry.httpIntegration({ tracing: true }),
        Sentry.postgresIntegration(),
      ],

      ignoreErrors: [
        'ECONNRESET',  // Expected during server restarts
      ],
    });

    strapi.log.info('[Sentry] Initialized — DSN configured');
  },
};
```

### 4.3 Sentry in Error Handler Middleware

The RFC 9457 error handler (see `TwinMOSWebsiteAPIErrorHandling_RFC9457.md`) captures 5xx errors:

```typescript
// In errorHandler middleware
if (status >= 500) {
  Sentry.captureException(err, {
    extra: {
      traceId,
      path: ctx.path,
      method: ctx.method,
      userId: ctx.state?.user?.id,
    },
    tags: {
      component: 'strapi-api',
      route: ctx.routerPath ?? ctx.path,
    },
  });
}
```

---

## 5. Performance Monitoring

### 5.1 Trace Coverage

| Operation | Traced By |
|-----------|----------|
| Astro page loads | `@sentry/astro` automatic |
| React island render/hydration | `trackComponents: true` |
| API fetch calls (browser) | `@sentry/astro` fetch instrumentation |
| Strapi HTTP requests | `@sentry/node` http integration |
| PostgreSQL queries | `@sentry/node` postgres integration |
| MeiliSearch queries | Manual spans |
| External service calls (Resend, HubSpot) | Manual spans |

### 5.2 Manual Spans for Key Operations

```typescript
// In searchService.ts
import * as Sentry from '@sentry/node';

export async function searchProducts(query: string) {
  return Sentry.startSpan(
    { name: 'meilisearch.search', op: 'db.query', attributes: { query } },
    async (span) => {
      const results = await meiliClient.index('products').search(query);
      span.setAttribute('hits_count', results.hits.length);
      return results;
    }
  );
}
```

### 5.3 Performance Targets & Alerting

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| API p95 response time | < 500ms | > 1,000ms |
| API error rate | < 0.5% | > 2% |
| Frontend LCP | < 1,800ms | > 3,000ms |
| Frontend CLS | < 0.05 | > 0.1 |

---

## 6. Source Maps

### 6.1 Frontend (Astro)

Source maps uploaded automatically by `@sentry/astro` plugin during `astro build`:

```typescript
// astro.config.ts — Sentry integration handles source map upload
sentry({
  sourceMapsUploadOptions: {
    project: 'twinmos-frontend',
    authToken: process.env.SENTRY_AUTH_TOKEN,
  },
}),
```

### 6.2 Backend (Strapi)

Source maps uploaded in CI/CD pipeline after Strapi build:

```bash
# In GitHub Actions deploy workflow
npx @sentry/cli releases new "$SENTRY_RELEASE"
npx @sentry/cli releases files "$SENTRY_RELEASE" upload-sourcemaps ./dist
npx @sentry/cli releases finalize "$SENTRY_RELEASE"
npx @sentry/cli releases deploys "$SENTRY_RELEASE" new -e production
```

---

## 7. Releases & Deployment Tracking

Every deployment creates a Sentry release, enabling:
- "Resolved in version" tracking for issues
- Regression detection between releases
- Commit blame linking

```bash
# Release name format
SENTRY_RELEASE=$(git rev-parse --short HEAD)
```

Sentry release is linked to the git SHA via GitHub integration.

---

## 8. Alerts & Notifications

### 8.1 Alert Rules

| Condition | Channel | Severity |
|-----------|---------|---------|
| New error type seen | Slack `#dev-alerts` | Warning |
| Error rate > 2% over 5 min | Slack `#dev-alerts` | Critical |
| P95 API latency > 1s over 10 min | Slack `#dev-alerts` | Warning |
| Any `internal-server` error (500) in production | Email to engineering | Error |
| More than 50 errors in 1 minute | PagerDuty (P2) | Critical |

### 8.2 Slack Integration

Configured in Sentry → Settings → Integrations → Slack. Alert notifications posted to `#dev-alerts` channel.

---

## 9. Data Privacy

- Source code is not sent to Sentry (only compiled bundle + source maps)
- User PII is scrubbed before sending:
  - Cookies removed from request context
  - Passwords stripped from request bodies
  - Email addresses in error messages replaced with `[email]`
- Session replay: Text masking disabled for product pages (no PII displayed), enabled for form pages
- Sentry EU data residency selected (GDPR compliance)
- Sentry processes data under Standard Contractual Clauses

---

## 10. Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PUBLIC_SENTRY_DSN` | Astro env | Frontend Sentry DSN (public) |
| `SENTRY_DSN` | Strapi env | Backend Sentry DSN |
| `SENTRY_AUTH_TOKEN` | CI/CD (GitHub Actions secret) | Source map upload token |
| `SENTRY_RELEASE` | CI/CD | Release identifier (git SHA) |
| `PUBLIC_ENV` | Astro env | `production`, `staging`, or `development` |

---

## 11. Related Documents

- [TwinMOSWebsiteAPIErrorHandling_RFC9457.md](../D.3 - API Specifications/TwinMOSWebsiteAPIErrorHandling_RFC9457.md)
- [TwinMOSWebsiteIntegrationSpecGA4_Analytics.md](TwinMOSWebsiteIntegrationSpecGA4_Analytics.md)
