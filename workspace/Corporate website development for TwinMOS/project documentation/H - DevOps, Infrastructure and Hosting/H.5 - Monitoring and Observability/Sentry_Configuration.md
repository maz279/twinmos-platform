# TwinMOS Website — Sentry Configuration Guide

| | |
|:---|:---|
| **Reference** | H.5-002 |
| **Priority** | P0 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the Sentry configuration for error tracking, performance monitoring, and Real User Monitoring (RUM) for the TwinMOS website.

---

## 2. Sentry Setup

### 2.1 Organization

| Setting | Value |
|:---|:---|
| **Organization** | twinmos |
| **Plan** | Team (or Business for P3) |
| **Data Residency** | EU (Frankfurt) |

### 2.2 Projects

| Project | Platform | DSN Secret |
|:---|:---|:---|
| `website-frontend` | JavaScript (Astro) | `SENTRY_DSN_FRONTEND` |
| `website-backend` | Node.js (Strapi) | `SENTRY_DSN_BACKEND` |

---

## 3. Frontend Configuration (Astro)

### 3.1 Install SDK

```bash
cd apps/frontend
npm install @sentry/astro
```

### 3.2 Astro Config

```javascript
// apps/frontend/astro.config.mjs
import { defineConfig } from 'astro/config';
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    sentry({
      dsn: process.env.PUBLIC_SENTRY_DSN,
      sourceMapsUploadOptions: {
        project: 'website-frontend',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
      tracesSampleRate: 0.1, // 10% of transactions
      replaysSessionSampleRate: 0.01, // 1% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of error sessions
    }),
  ],
});
```

### 3.3 Environment Variables

```env
PUBLIC_SENTRY_DSN=https://<key>@sentry.io/<project-id>
SENTRY_AUTH_TOKEN=<internal-integration-token>
```

---

## 4. Backend Configuration (Strapi)

### 4.1 Install SDK

```bash
cd apps/backend
npm install @sentry/node @sentry/profiling-node
```

### 4.2 Strapi Middleware

```javascript
// apps/backend/src/middlewares/sentry.js
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  };
};
```

### 4.3 Register Middleware

```javascript
// apps/backend/config/middlewares.js
module.exports = [
  'strapi::errors',
  'global::sentry', // Add Sentry middleware
  'strapi::security',
  // ... other middlewares
];
```

---

## 5. Alert Rules

### 5.1 Issue Alerts

| Condition | Action | Channel |
|:---|:---|:---|
| New issue in production | Notify | Slack #dev-alerts |
| Issue affects > 100 users | Notify + Page | Slack #ops-alerts |
| Regression detected | Notify | Slack #dev-alerts |
| Weekly issue digest | Email | Dev team |

### 5.2 Performance Alerts

| Condition | Threshold | Action |
|:---|:---|:---|
| LCP > 2.5s | P75 | Slack #dev-alerts |
| FID > 100ms | P75 | Slack #dev-alerts |
| CLS > 0.25 | P75 | Slack #dev-alerts |
| API p95 > 500ms | 95th percentile | Slack #dev-alerts |

---

## 6. Release Tracking

```yaml
# GitHub Actions workflow step
- name: Create Sentry release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: twinmos
    SENTRY_PROJECT: website-frontend
  with:
    environment: production
    version: ${{ github.ref_name }}
    sourcemaps: apps/frontend/dist
```

---

## 7. Troubleshooting

| Issue | Solution |
|:---|:---|
| No errors appearing | Check DSN, verify network, check filters |
| Source maps not working | Verify upload in build, check release association |
| Too many events | Reduce sample rate, add filters |
| Performance data missing | Enable tracing, check integration config |

---

## 8. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 9. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
