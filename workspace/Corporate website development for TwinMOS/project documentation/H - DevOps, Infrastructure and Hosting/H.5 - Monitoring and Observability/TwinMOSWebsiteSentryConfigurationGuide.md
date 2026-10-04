# TwinMOS Website — Sentry Configuration Guide

**Document ID:** H.5-004  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteMonitoring_Specification.md · TwinMOSWebsiteAlerting_Rules.md · TwinMOSWebsiteCICDPipeline_Spec.md · TwinMOSWebsiteEnvironmentVariablesReference.md

---

## 1. Account Setup

```
Region:      EU (sentry.io/eu — data stored in Germany, GDPR compliant)
Organisation: TwinMOS Technologies
Plan:         Team ($26/month) — required for 90-day retention, performance monitoring, session replay
Primary email: devops@twinmos.com
2FA:          Required (TOTP) for all members
```

### 1.1 Projects

| Project | Slug | Platform | Environment Tags |
|---------|------|----------|-----------------|
| TwinMOS Frontend | `twinmos-frontend` | JavaScript (Astro) | production, staging, development |
| TwinMOS Backend | `twinmos-backend` | Node.js (Strapi) | production, staging, development |

### 1.2 Team Members

| Member | Role | Projects |
|--------|------|---------|
| Tech Lead | Owner | All |
| Developer B | Member | All |
| Chairman | Viewer | All |

---

## 2. Frontend SDK Configuration (Astro)

### 2.1 Package Installation

```bash
pnpm add @sentry/astro
```

### 2.2 Astro Integration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    sentry({
      dsn: import.meta.env.PUBLIC_SENTRY_DSN,
      environment: import.meta.env.PUBLIC_ENV,
      // Sourcemaps automatically uploaded if SENTRY_AUTH_TOKEN is set
      sourceMapsUploadOptions: {
        project: 'twinmos-frontend',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
    // ... other integrations
  ],
});
```

### 2.3 Client-Side Sentry Config

```typescript
// src/sentry.client.config.ts
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.PUBLIC_ENV || 'development',
  release: import.meta.env.PUBLIC_APP_VERSION || 'unknown',

  // Performance monitoring
  tracesSampleRate: import.meta.env.PUBLIC_ENV === 'production' ? 0.1 : 1.0,
  // 10% of transactions sampled in production; 100% in staging/dev

  // Session replay — only on errors (privacy-first)
  replaysSessionSampleRate: 0,       // 0% normal sessions
  replaysOnErrorSampleRate: 1.0,     // 100% when error occurs

  integrations: [
    Sentry.replayIntegration({
      // Mask all text content for privacy (MENA market — conservative)
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: false, // Allow media to load (needed for visual replay context)
    }),
    Sentry.browserTracingIntegration({
      // Automatically instrument navigation, XHR, fetch
      enableLongAnimationFrame: true,
    }),
  ],

  // Ignore common browser noise
  ignoreErrors: [
    // Browser extensions
    'Non-Error exception captured',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors (user connectivity, not app bugs)
    'Failed to fetch',
    'Load failed',
    'NetworkError',
    // Safari-specific non-issues
    'AbortError: Fetch is aborted',
    'The operation was aborted',
  ],

  // Filter events before sending
  beforeSend(event, hint) {
    // Don't send events in development
    if (import.meta.env.PUBLIC_ENV === 'development') return null;

    // Don't send events from browser extensions
    const url = event.request?.url || '';
    if (url.includes('chrome-extension://') || url.includes('moz-extension://')) {
      return null;
    }

    return event;
  },
});
```

### 2.4 Server-Side Sentry Config (SSR/API Routes)

```typescript
// src/sentry.server.config.ts
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.PUBLIC_ENV || 'development',
  tracesSampleRate: import.meta.env.PUBLIC_ENV === 'production' ? 0.1 : 1.0,
});
```

---

## 3. Backend SDK Configuration (Strapi)

### 3.1 Package Installation

```bash
# In twinmos-backend (Strapi) repo
pnpm add @sentry/node @sentry/profiling-node
```

### 3.2 Sentry Initialization in Strapi

```typescript
// src/instrument.ts — Must be imported BEFORE all other imports
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION || 'unknown',

  integrations: [
    nodeProfilingIntegration(),
  ],

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 0.1, // Profile 10% of sampled transactions

  // Don't capture expected Strapi framework errors
  ignoreErrors: [
    'ValidationError',      // User input validation (not a bug)
    'PolicyError',          // Authorization failures (expected)
    'NotFoundError',        // 404s from API queries (expected)
  ],
});
```

```typescript
// src/index.ts (Strapi entry point)
import './instrument'; // Must be first import
import Strapi from '@strapi/strapi';
```

### 3.3 Strapi Middleware for Request Tracking

```typescript
// src/middlewares/sentry.ts
import * as Sentry from '@sentry/node';

export default (config: any, { strapi }: any) => {
  return async (ctx: any, next: any) => {
    const transaction = Sentry.startInactiveSpan({
      name: `${ctx.method} ${ctx.path}`,
      op: 'http.server',
      attributes: {
        'http.method': ctx.method,
        'http.url': ctx.path,
        'http.target': ctx.originalUrl,
      },
    });

    try {
      await next();
      transaction.setStatus({ code: 1, message: 'ok' }); // SpanStatusCode.OK
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          url: ctx.originalUrl,
          method: ctx.method,
          body: ctx.request.body,
        },
      });
      transaction.setStatus({ code: 2, message: 'internal_error' });
      throw error;
    } finally {
      transaction.end();
    }
  };
};
```

```javascript
// config/middlewares.ts — Register the middleware
export default [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  { name: 'global::sentry' },  // Add Sentry middleware
];
```

---

## 4. Source Maps

Source maps allow Sentry to show original TypeScript source in stack traces rather than minified JavaScript.

### 4.1 Frontend Source Maps (Astro Build)

The `@sentry/astro` integration automatically uploads source maps during `astro build` when `SENTRY_AUTH_TOKEN` is present.

```bash
# Required build-time environment variable (GitHub Actions Secret)
SENTRY_AUTH_TOKEN=<sentry-auth-token>

# Build command (uploads source maps automatically)
pnpm build
```

### 4.2 Backend Source Maps (Strapi Build)

```json
// package.json (Strapi)
{
  "scripts": {
    "build": "strapi build",
    "build:sentry": "strapi build && sentry-cli sourcemaps upload --project twinmos-backend ./build"
  }
}
```

```yaml
# GitHub Actions — backend deploy step
- name: Build and upload sourcemaps
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: twinmos
    SENTRY_PROJECT: twinmos-backend
  run: |
    pnpm build
    pnpm dlx @sentry/cli sourcemaps upload \
      --org twinmos \
      --project twinmos-backend \
      ./dist
```

---

## 5. Release Tracking

Sentry links errors to specific releases. Configure in GitHub Actions CI:

```yaml
# .github/workflows/frontend-ci.yml — add after build step
- name: Create Sentry release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: twinmos
    SENTRY_PROJECT: twinmos-frontend
  run: |
    VERSION=$(git describe --tags --always)
    pnpm dlx @sentry/cli releases new "${VERSION}"
    pnpm dlx @sentry/cli releases set-commits "${VERSION}" --auto
    pnpm dlx @sentry/cli releases finalize "${VERSION}"
    pnpm dlx @sentry/cli releases deploys "${VERSION}" new -e production
```

---

## 6. Alert Rules Configuration

### 6.1 Frontend Alert Rules

```
Rule: New Critical Issue (Frontend)
  Conditions: A new issue is created AND priority is critical
  Actions: Send Slack notification to #ops
           Send email to devops@twinmos.com

Rule: Error Volume Spike
  Conditions: Number of events > 50 in 1 hour
  Actions: Send Slack notification to #ops

Rule: Regression (Resolved Issue Reoccurs)
  Conditions: A previously resolved issue is seen again
  Actions: Send Slack notification to #alerts

Rule: LCP Degradation
  Conditions: p75(measurements.lcp) > 4000 ms (5 min window)
  Actions: Send Slack notification to #alerts
```

### 6.2 Backend Alert Rules

```
Rule: Critical Backend Error
  Conditions: A new issue is created AND level is fatal or error AND 
              environment is production
  Actions: Send Slack notification to #ops (with @tech-lead mention)
           Send email to devops@twinmos.com

Rule: API Transaction P95 Critical
  Conditions: p95(transaction.duration) > 2000 ms (5-min window, >10 events)
  Actions: Send Slack notification to #ops

Rule: API Transaction P95 Warning
  Conditions: p95(transaction.duration) > 500 ms (5-min window, >20 events)
  Actions: Send Slack notification to #alerts

Rule: High Error Rate After Deploy
  Conditions: Number of events increases by 2x within 30 min of a release
  Actions: Send Slack notification to #ops
           (Investigate whether to rollback)
```

---

## 7. Performance Monitoring Configuration

### 7.1 Frontend Performance

Sentry automatically captures these Web Vitals from real users:

| Metric | Good | Needs Improvement | Poor | Alert Threshold |
|--------|------|------------------|------|----------------|
| LCP | < 2.5s | 2.5–4.0s | > 4.0s | Alert if p75 > 4.0s |
| INP | < 200ms | 200–500ms | > 500ms | Alert if p75 > 500ms |
| CLS | < 0.1 | 0.1–0.25 | > 0.25 | Alert if p75 > 0.25 |
| FCP | < 1.8s | 1.8–3.0s | > 3.0s | No alert (LCP is primary) |
| TTFB | < 800ms | 800ms–1.8s | > 1.8s | No alert (CDN TTFB tracked separately) |

### 7.2 Key Transactions to Monitor

```typescript
// Instrument key user flows with custom spans

// Product search
async function searchProducts(query: string) {
  return Sentry.startSpan({
    name: 'search.products',
    op: 'search',
    attributes: { query_length: query.length },
  }, async (span) => {
    const results = await meiliSearch.search(query);
    span.setAttribute('result_count', results.hits.length);
    return results;
  });
}

// Where-to-buy lookup
async function getDistributors(country: string) {
  return Sentry.startSpan({
    name: 'distributors.lookup',
    op: 'db',
    attributes: { country },
  }, async () => {
    return await strapi.findMany('distributors', { filters: { country } });
  });
}
```

### 7.3 Performance Dashboard

```
Sentry → twinmos-frontend → Performance

Key pages to monitor:
  Transaction: /                         (homepage)
  Transaction: /products/                (product listing)
  Transaction: /products/[slug]/         (product detail)
  Transaction: /where-to-buy/            (distributor finder)
  Transaction: /support/                 (support page)

Filters to apply:
  Environment: production
  Device: Mobile (separate from desktop)
  Browser: Chrome, Safari, Firefox separately

Review weekly: Any page with p95 > 2s or INP > 200ms
```

---

## 8. Session Replay

Session replay captures a visual recording of the user's screen when an error occurs. Configured with maximum privacy settings:

```typescript
// src/sentry.client.config.ts
replaysOnErrorSampleRate: 1.0,  // Capture all sessions that have errors

Sentry.replayIntegration({
  maskAllText: true,        // Replace all text with asterisks
  maskAllInputs: true,      // Replace input values with asterisks
  blockAllMedia: false,     // Allow images (needed for visual context)
  
  // Additional privacy
  block: ['.sensitive-data'],   // CSS selector to block elements
  ignore: ['.analytics-only'],  // CSS selector to ignore interactions
})
```

**What gets captured:**
- User click/scroll interactions (anonymised)
- DOM mutations (text masked)
- Network requests (URL only, no request body)
- Console output

**Access:** Sentry → twinmos-frontend → Replays → Filter by session with errors

---

## 9. Ignored Errors Reference

Full list of ignored error patterns (to reduce noise):

```typescript
ignoreErrors: [
  // React/browser noise
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
  'Non-Error exception captured',

  // Network connectivity errors (user's connection, not our bug)
  /Failed to fetch/,
  /Load failed/,
  /Network request failed/,
  /NetworkError when attempting to fetch resource/,
  /The Internet connection appears to be offline/,

  // Safari-specific non-issues
  /AbortError: Fetch is aborted/,
  /The operation was aborted/,
  /AbortError: The user aborted a request/,

  // Browser extension interference
  /chrome-extension:\/\//,
  /moz-extension:\/\//,
  /safari-extension:\/\//,

  // Cloudflare Turnstile (expected if bot challenge)
  /Turnstile/,

  // Expected user behavior
  'ChunkLoadError',  // User navigating away during lazy load
],

denyUrls: [
  // Ignore errors from third-party scripts loaded in browser
  /plausible\.io/,
  /cloudflare\.com\/cdn-cgi/,
],
```

---

## 10. Cost Management

Sentry Team plan: $26/month

Cost optimisation settings:
```
tracesSampleRate: 0.1      (10% of transactions — reduces quota usage)
replaysSessionSampleRate: 0  (no random session capture — only on error)
replaysOnErrorSampleRate: 1.0 (all error sessions — high value, low volume)
```

**Monitoring quota usage:**
```
Sentry → Settings → Usage & Stats → Error quota used this month
If approaching quota: reduce tracesSampleRate to 0.05
```

---

## 11. Environment Variables Required

```bash
# Cloudflare Pages (PUBLIC_ prefix = exposed to browser)
PUBLIC_SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>
PUBLIC_ENV=production
PUBLIC_APP_VERSION=1.0.0  # Set by CI to git tag

# Strapi backend (private)
SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<backend-project>

# GitHub Actions (for CI source map upload)
SENTRY_AUTH_TOKEN=<token-with-project:write-permission>
SENTRY_ORG=twinmos
SENTRY_PROJECT=twinmos-frontend  # or twinmos-backend
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §20.2*
