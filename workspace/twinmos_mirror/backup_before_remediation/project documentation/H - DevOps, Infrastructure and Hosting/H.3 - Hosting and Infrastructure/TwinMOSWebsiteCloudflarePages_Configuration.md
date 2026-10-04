# TwinMOS Website — Cloudflare Pages Configuration Guide

| | |
|:---|:---|
| **Reference** | H.3-002 |
| **Priority** | P0 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document provides the complete configuration guide for hosting the TwinMOS frontend (Astro 5.x) on Cloudflare Pages. It covers project setup, build configuration, custom domains, caching rules, edge functions, and deployment procedures.

---

## 2. Cloudflare Account Setup

### 2.1 Prerequisites

- Cloudflare account with Pro plan ($20/month)
- Domain `twinmos.com` added to Cloudflare
- API token with Pages:Edit and Zone:Edit permissions

### 2.2 API Token Creation

1. Navigate to Cloudflare Dashboard -> My Profile -> API Tokens
2. Create Token -> Custom token
3. Configure permissions:

| Permission | Level |
|:---|:---|
| Zone | Read |
| Zone Settings | Edit |
| Page Rules | Edit |
| Cloudflare Pages | Edit |
| Account | Read |

4. Zone Resources: Include - Specific zone - `twinmos.com`
5. Copy token to `CLOUDFLARE_API_TOKEN` secret in GitHub

---

## 3. Pages Project Configuration

### 3.1 Project Creation

**Production Project:**

| Setting | Value |
|:---|:---|
| **Project Name** | `twinmos-website-prod` |
| **Production Branch** | `main` |
| **Build Command** | `pnpm --filter frontend build` |
| **Build Output Directory** | `apps/frontend/dist` |
| **Root Directory** | `/` |

**Staging Project:**

| Setting | Value |
|:---|:---|
| **Project Name** | `twinmos-website-staging` |
| **Production Branch** | `main` |
| **Build Command** | `pnpm --filter frontend build` |
| **Build Output Directory** | `apps/frontend/dist` |
| **Root Directory** | `/` |

### 3.2 Environment Variables (Cloudflare Dashboard)

**Production Environment:**

| Variable | Value | Sensitive |
|:---|:---|:---|
| `NODE_VERSION` | `22` | No |
| `PNPM_VERSION` | `9` | No |
| `NODE_ENV` | `production` | No |
| `STRAPI_API_URL` | `https://api.twinmos.com` | No |
| `PUBLIC_SENTRY_DSN` | `<sentry-dsn>` | Yes |
| `PUBLIC_PLAUSIBLE_DOMAIN` | `twinmos.com` | No |
| `SITE_URL` | `https://www.twinmos.com` | No |

**Staging Environment:**

| Variable | Value | Sensitive |
|:---|:---|:---|
| `NODE_VERSION` | `22` | No |
| `PNPM_VERSION` | `9` | No |
| `NODE_ENV` | `staging` | No |
| `STRAPI_API_URL` | `https://api-staging.twinmos.com` | No |
| `PUBLIC_SENTRY_DSN` | `<sentry-dsn>` | Yes |
| `PUBLIC_PLAUSIBLE_DOMAIN` | `staging.twinmos.com` | No |
| `SITE_URL` | `https://staging.twinmos.com` | No |

---

## 4. Build Configuration

### 4.1 Astro Configuration for Cloudflare

```javascript
// apps/frontend/astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://www.twinmos.com',
  base: '/',
  
  // i18n routing
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'bn', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt'],
    routing: {
      prefixDefaultLocale: true,
      strategy: 'pathname'
    }
  },
  
  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    domains: ['api.twinmos.com', 'media.twinmos.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.twinmos.com' }
    ]
  },
  
  // Vite configuration
  vite: {
    define: {
      'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(process.env.npm_package_version)
    }
  }
});
```

### 4.2 Build Script

```json
// apps/frontend/package.json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "lint": "eslint . --ext .js,.ts,.astro",
    "typecheck": "astro check && tsc --noEmit"
  }
}
```

### 4.3 Wrangler Configuration

```toml
# wrangler.toml
name = "twinmos-website-prod"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

# Pages-specific settings
[site]
bucket = "./apps/frontend/dist"

# Environment variables (non-sensitive)
[vars]
NODE_ENV = "production"
SITE_URL = "https://www.twinmos.com"

# Secrets (set via wrangler secret put)
# STRAPI_API_URL
# PUBLIC_SENTRY_DSN
# PUBLIC_PLAUSIBLE_DOMAIN
```

---

## 5. Custom Domain Configuration

### 5.1 Domain Setup

1. In Cloudflare Pages project, go to **Custom Domains**
2. Click **Set up a custom domain**
3. Enter `www.twinmos.com`
4. Cloudflare automatically creates DNS records
5. Verify SSL certificate is issued (automatic, may take 5 minutes)

### 5.2 Redirect Rules

**Page Rule 1: Redirect apex to www**

| Setting | Value |
|:---|:---|
| URL | `twinmos.com/*` |
| Forwarding URL | `https://www.twinmos.com/$1` |
| Status Code | 301 (Permanent Redirect) |

**Page Rule 2: Cache static assets**

| Setting | Value |
|:---|:---|
| URL | `*twinmos.com/_astro/*` |
| Cache Level | Cache Everything |
| Edge Cache TTL | 1 year |
| Browser Cache TTL | 1 year |

**Page Rule 3: Admin access restriction**

| Setting | Value |
|:---|:---|
| URL | `*twinmos.com/admin*` |
| Security Level | I'm Under Attack |

### 5.3 Bulk Redirects (Cloudflare Redirect Rules)

```
# Redirect old URLs (if migrating from existing site)
/old-products/* -> /products/:splat (301)
/support/contact-us -> /contact (301)
```

---

## 6. Caching Strategy

### 6.1 Cache Rules (Cloudflare)

**Rule 1: HTML Pages**

| Setting | Value |
|:---|:---|
| When Matching | `(http.host eq "www.twinmos.com" and not http.request.uri.path contains "/admin")` |
| Cache Level | Cache Everything |
| Edge TTL | 1 hour |
| Browser TTL | 4 hours |
| Respect Origin Headers | No |

**Rule 2: Static Assets**

| Setting | Value |
|:---|:---|
| When Matching | `(http.request.uri.path contains "_astro" or http.request.uri.path contains "assets")` |
| Cache Level | Cache Everything |
| Edge TTL | 1 year |
| Browser TTL | 1 year |
| Respect Origin Headers | No |

**Rule 3: API Responses (if cached at edge)**

| Setting | Value |
|:---|:---|
| When Matching | `(http.request.uri.path contains "/api/")` |
| Cache Level | Bypass Cache |

### 6.2 Cache Purge Strategy

| Trigger | Method | Command |
|:---|:---|:---|
| Production deploy | Automatic | Cloudflare Pages purges on deploy |
| Content update (CMS) | API | `POST /zones/{zone_id}/purge_cache` |
| Emergency purge | Dashboard | Caching -> Configuration -> Purge Everything |
| Selective purge | API | `POST /zones/{zone_id}/purge_cache` with files array |

**CMS Webhook Integration:**

```javascript
// Strapi webhook handler for cache purge
module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    
    // Purge specific URLs
    await fetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: [
          `https://www.twinmos.com/${result.locale}/products/${result.slug}`,
          `https://www.twinmos.com/${result.locale}/products`
        ]
      })
    });
  }
};
```

---

## 7. Edge Functions (Cloudflare Workers)

### 7.1 Form Handler

```typescript
// functions/api/contact.ts
export interface Env {
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // Rate limiting check (using Cloudflare KV)
  const clientIP = request.headers.get('CF-Connecting-IP');
  
  // Validate and process form data
  const formData = await request.formData();
  const email = formData.get('email');
  const message = formData.get('message');
  
  // Send via Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'contact@twinmos.com',
      to: 'support@twinmos.com',
      subject: 'New Contact Form Submission',
      html: `<p>From: ${email}</p><p>${message}</p>`
    })
  });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### 7.2 A/B Testing (P3)

```typescript
// functions/_middleware.ts
export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  
  // Check for A/B test cookie
  const cookie = request.headers.get('Cookie') || '';
  const variant = cookie.includes('variant=B') ? 'B' : 'A';
  
  // Add variant header for Astro to use
  const modifiedRequest = new Request(request, {
    headers: {
      ...request.headers,
      'X-Variant': variant
    }
  });
  
  return context.next(modifiedRequest);
};
```

### 7.3 Geo-Redirect (P3)

```typescript
// functions/_middleware.ts
export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const country = request.cf?.country;
  
  // Redirect Arabic-speaking countries to /ar/
  const arabicCountries = ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'IQ', 'YE', 'LY', 'SD', 'TN', 'DZ', 'MA'];
  
  if (arabicCountries.includes(country)) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/en/') {
      url.pathname = '/ar/';
      return Response.redirect(url, 302);
    }
  }
  
  return context.next();
};
```

---

## 8. Security Headers

### 8.1 Headers Configuration

```toml
# _headers file in apps/frontend/public/
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(self)
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.twinmos.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self' https://api.twinmos.com https://sentry.io https://analytics.twinmos.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### 8.2 Transform Rules (Cloudflare)

Add security headers at the edge for all responses:

```
When: All incoming requests
Then: Add headers
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
```

---

## 9. Deployment Procedures

### 9.1 Automated Deployment (GitHub Actions)

See H.2-002 GitHub Actions Workflows Specification for complete workflow definitions.

### 9.2 Manual Deployment (Emergency)

```bash
# 1. Build locally
pnpm --filter frontend build

# 2. Deploy with Wrangler
npx wrangler pages deploy apps/frontend/dist \
  --project-name=twinmos-website-prod \
  --branch=main

# 3. Verify deployment
npx wrangler pages deployment list --project-name=twinmos-website-prod
```

### 9.3 Rollback Procedure

```bash
# List deployments
npx wrangler pages deployment list --project-name=twinmos-website-prod

# Rollback to specific deployment
npx wrangler pages deployment tail --project-name=twinmos-website-prod

# Or use Cloudflare Dashboard:
# Pages -> twinmos-website-prod -> Deployments -> Select previous -> Rollback
```

---

## 10. Monitoring & Analytics

### 10.1 Cloudflare Analytics

| Metric | Location | Alert Threshold |
|:---|:---|:---|
| Requests | Analytics -> Traffic | N/A |
| Bandwidth | Analytics -> Traffic | > 100 GB/day |
| Cache ratio | Analytics -> Caching | < 80% |
| Errors | Analytics -> Security | > 1% 5xx |
| Edge CPU time | Workers & Pages | > 50ms avg |

### 10.2 Real User Monitoring (RUM)

Enable Cloudflare Web Analytics (privacy-friendly, no cookie):

1. Cloudflare Dashboard -> Speed -> Real User Monitoring
2. Add site: `www.twinmos.com`
3. Copy JavaScript snippet to Astro layout

```astro
<!-- layouts/BaseLayout.astro -->
<head>
  <!-- Cloudflare Web Analytics -->
  <script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
    data-cf-beacon='{"token": "<CF_RUM_TOKEN>"}'></script>
</head>
```

---

## 11. Troubleshooting

| Issue | Symptom | Solution |
|:---|:---|:---|
| Build timeout | "Build exceeded 20 minutes" | Optimize build, reduce image processing, use remote caching |
| Function timeout | "Worker exceeded CPU time" | Simplify edge function, move heavy logic to backend |
| Cache not purging | Old content still showing | Check cache rules, use API purge, verify TTL settings |
| SSL error | "Certificate invalid" | Verify DNS records, check edge certificate status |
| 404 on routes | Client-side routing fails | Ensure Astro builds all routes, check trailing slashes |
| i18n 404 | Locale pages not found | Verify `i18n.routing` config, check `getStaticPaths` |

---

## 12. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 13. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
