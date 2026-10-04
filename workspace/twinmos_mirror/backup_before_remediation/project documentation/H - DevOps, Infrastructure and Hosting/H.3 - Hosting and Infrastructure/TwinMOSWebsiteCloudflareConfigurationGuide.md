# TwinMOS Website — Cloudflare Configuration Guide

**Document ID:** H.3-004  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteHostingArchitectureSpec.md · TwinMOSWebsiteDNSRecordsSpecification.md · TwinMOSWebsiteCDNCachingStrategy.md · TwinMOSWebsiteSSLCertificateRenewal_Runbook.md

---

## 1. Account & Project Setup

### 1.1 Cloudflare Account Configuration

```
Account type: Cloudflare Business (or Pro — Pro is sufficient for P1)
Plan: Cloudflare Pro ($20/month)
  Includes: WAF, Argo, Image Resizing, Advanced Rate Limiting, Real User Monitoring

Organisation name: TwinMOS Technologies
Primary email: devops@twinmos.com
2FA: Required (TOTP) for all admin users
```

### 1.2 Team Members & Permissions

| Role | Account Access | Notes |
|------|---------------|-------|
| Tech Lead | Super Administrator | Full access |
| Developer B | Administrator (Zone) | DNS + Pages only |
| TwinMOS Chairman | Read Only | Monitoring dashboards only |

---

## 2. Cloudflare Pages Configuration

### 2.1 Project Creation

```
Cloudflare Dashboard → Workers & Pages → Pages → Create a project
  Project name: twinmos-website
  Connect to Git: GitHub → twinmos/twinmos-frontend

  Production branch: main
  Preview branches: All branches except main and staging

  Build settings:
    Framework preset: Astro
    Build command: pnpm build
    Build output directory: dist
    Root directory: / (repo root)
    Node.js version: 22
```

### 2.2 Environment Variables (Pages)

Set these in Pages → Settings → Environment Variables:

**Production environment:**
```
PUBLIC_API_URL=https://api.twinmos.com
PUBLIC_SEARCH_URL=https://search.twinmos.com
PUBLIC_IMGPROXY_URL=https://imgproxy.twinmos.com
PUBLIC_SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>
PUBLIC_PLAUSIBLE_DOMAIN=twinmos.com
PUBLIC_PLAUSIBLE_URL=https://analytics.twinmos.com
PUBLIC_SITE_URL=https://twinmos.com
PUBLIC_ENV=production
PUBLIC_CLOUDFLARE_TURNSTILE_KEY=<site key>
```

**Staging environment:**
```
PUBLIC_API_URL=https://staging-api.twinmos.com
PUBLIC_SEARCH_URL=https://staging-search.twinmos.com
PUBLIC_SITE_URL=https://staging.twinmos.com
PUBLIC_ENV=staging
PUBLIC_SENTRY_DSN=https://<staging-key>@o<org>.ingest.sentry.io/<staging-project>
```

### 2.3 Custom Domains

```
Pages → twinmos-website → Custom domains
  Add: twinmos.com  (apex — requires Cloudflare DNS)
  Add: www.twinmos.com  (www — redirected to apex)
  Add: staging.twinmos.com  (staging environment)
```

---

## 3. DNS Configuration

Full DNS records are specified in `TwinMOSWebsiteDNSRecordsSpecification.md`. Key summary:

```
twinmos.com         CNAME → twinmos-website.pages.dev   [Proxied]
www.twinmos.com     CNAME → twinmos-website.pages.dev   [Proxied]
api.twinmos.com     A     → <Hetzner CX32 IP>           [Proxied]
admin.twinmos.com   A     → <Hetzner CX32 IP>           [Proxied]
search.twinmos.com  A     → <Hetzner CX32 IP>           [Proxied]
```

**Important:** All records pointing to Hetzner must have Cloudflare proxy **enabled** (orange cloud). This ensures:
1. Origin IP is hidden from attackers
2. WAF rules apply to all traffic
3. Cloudflare SSL terminates at the edge

---

## 4. SSL/TLS Configuration

```
SSL/TLS → Overview
  Encryption mode: Full (strict)
  ← NOT "Full" — must be "Full (strict)" to prevent MITM on Cloudflare→Origin leg

SSL/TLS → Edge Certificates
  Always Use HTTPS: ON
  Minimum TLS Version: TLS 1.2 (1.3 preferred — 1.2 for legacy device compatibility)
  TLS 1.3: ON
  Opportunistic Encryption: ON
  HSTS: ON
    Max-Age: 31536000 (1 year)
    Include Subdomains: Yes
    Preload: Yes (submit to hstspreload.org after 6 months stable)

SSL/TLS → Origin Server
  Create Cloudflare Origin Certificate:
    Hostnames: *.twinmos.com, twinmos.com
    Expiry: 15 years
    Install on Hetzner server (Coolify/Traefik uses this for origin-to-Cloudflare TLS)
```

---

## 5. Redirect Rules

```
Rules → Redirect Rules → Create Rule

Rule 1: WWW to Apex
  Name: www-to-apex
  Match: hostname equals www.twinmos.com
  Action: 301 redirect → https://twinmos.com${uri}

Rule 2: HTTP to HTTPS (fallback — also handled by "Always Use HTTPS")
  Name: http-to-https
  Match: ssl is off
  Action: 301 redirect → https://${host}${uri}

Rule 3: Legacy /products/ paths
  Name: legacy-products-redirect
  Match: URI path starts with /products/memory-modules/
  Action: 301 redirect → /products/memory/

Rule 4: Block WordPress admin attempts
  Name: block-wp-admin
  Match: URI path starts with /wp-admin/ or /wp-login.php
  Action: Block (return 404)

Rule 5: Old .html extension URLs
  Name: strip-html-extension
  Match: URI path ends with .html
  Action: 301 redirect → ${uri without .html}
```

---

## 6. Cache Rules

```
Rules → Cache Rules → Create Rule

Rule 1: Static assets — aggressive cache
  Name: static-assets-aggressive
  Match: URI path matches regex ^/assets/.*\.(js|css|woff2|woff|ttf|eot)$
  Actions:
    Cache Level: Cache Everything
    Edge Cache TTL: 1 year
    Browser Cache TTL: 1 year
    Vary on Accept-Encoding: Yes

Rule 2: Product images — long cache
  Name: product-images
  Match: URI path matches regex \.(webp|avif|jpg|jpeg|png|gif|svg|ico)$
         AND hostname is twinmos.com
  Actions:
    Cache Level: Cache Everything
    Edge Cache TTL: 7 days
    Browser Cache TTL: 1 day

Rule 3: HTML pages — short cache (ISR-style)
  Name: html-pages
  Match: URI path ends with / OR URI path matches .html
         AND NOT URI path starts with /admin
  Actions:
    Cache Level: Standard
    Edge Cache TTL: 1 hour
    Browser Cache TTL: no-store (always revalidate)
    Cache on Cookie: No (don't cache if cookie present — logged-in users)

Rule 4: API responses — bypass
  Name: api-bypass
  Match: hostname starts with api.
  Actions:
    Cache Level: Bypass

Rule 5: Admin routes — bypass
  Name: admin-bypass
  Match: hostname starts with admin. OR URI path starts with /admin
  Actions:
    Cache Level: Bypass
    Disable Apps: Yes
    Disable Performance: Yes

Rule 6: XML sitemap
  Name: sitemap-cache
  Match: URI path matches /sitemap*.xml
  Actions:
    Cache Level: Cache Everything
    Edge Cache TTL: 24 hours
    Browser Cache TTL: 4 hours
```

---

## 7. Security Headers (Transform Rules)

```
Rules → Transform Rules → Modify Response Headers → Create Rule

Name: security-headers
Match: Always (all requests)
Actions — Add Response Headers:

Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(self "https://js.stripe.com")
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Content-Security-Policy: default-src 'self';
  script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com https://analytics.twinmos.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://*.backblazeb2.com https://imgproxy.twinmos.com;
  connect-src 'self' https://api.twinmos.com https://search.twinmos.com https://sentry.io https://analytics.twinmos.com;
  font-src 'self' data:;
  frame-src https://challenges.cloudflare.com https://js.stripe.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  report-uri https://o<org>.ingest.sentry.io/api/<project>/security/?sentry_key=<key>
```

---

## 8. WAF Configuration

### 8.1 Managed Rules

```
Security → WAF → Managed Rules

Cloudflare Managed Ruleset: ON
  Sensitivity: Medium
  Mode: Block (not Log)

OWASP Core Ruleset: ON
  Sensitivity: Low (start conservative; increase after testing)
  Mode: Block

Cloudflare Leaked Credentials: ON (blocks known compromised credential patterns)
```

### 8.2 Custom WAF Rules

```
Security → WAF → Custom Rules

Rule 1: Block direct origin access
  Name: block-direct-origin-access
  Expression: (http.host eq "<Hetzner-IP>")
  Action: Block
  Notes: Prevents bypassing Cloudflare by hitting IP directly

Rule 2: Admin geo-restriction
  Name: restrict-admin-to-office
  Expression: (http.host contains "admin.twinmos.com")
    AND NOT (ip.src in {<office-ip>/32 <vpn-cidr>})
  Action: Block
  Notes: Strapi admin only accessible from TwinMOS office + VPN

Rule 3: Block known bad bots
  Name: block-bad-user-agents
  Expression: (http.user_agent contains "sqlmap")
    OR (http.user_agent contains "nikto")
    OR (http.user_agent contains "masscan")
  Action: Block

Rule 4: Rate limit contact form
  Name: contact-form-rate-limit
  Expression: (http.request.uri.path eq "/contact/" AND http.request.method eq "POST")
  Action: Managed Challenge (CAPTCHA)
  Rate: 5 submissions per IP per hour
```

### 8.3 Bot Management

```
Security → Bots
  Bot Fight Mode: ON
  Super Bot Fight Mode: (if available on Pro plan)

Cloudflare Turnstile (CAPTCHA replacement):
  Site Key: stored as PUBLIC_CLOUDFLARE_TURNSTILE_KEY env var in Astro
  Secret Key: stored in Strapi env for server-side validation
  Used on: contact form, warranty registration, RMA submission, partner inquiry
```

---

## 9. Rate Limiting

```
Security → WAF → Rate Limiting Rules

Rule 1: Global public rate limit
  Name: global-rate-limit
  Expression: true (all requests)
  Limit: 100 requests per 1 minute per IP
  Action: Block (after threshold)
  Period: 10 minutes ban

Rule 2: API rate limit (authenticated)
  Name: api-authenticated-rate-limit
  Expression: (http.host eq "api.twinmos.com") AND (http.request.headers["authorization"] ne "")
  Limit: 1000 requests per 1 minute per IP
  Action: Block

Rule 3: Login attempt rate limit
  Name: login-rate-limit
  Expression: (http.request.uri.path contains "/auth/") AND (http.request.method eq "POST")
  Limit: 10 requests per 5 minutes per IP
  Action: Managed Challenge
```

---

## 10. CMS Webhook for Cache Purge

When Strapi publishes content, it triggers a Cloudflare Cache Purge via webhook.

### 10.1 Strapi Lifecycle Hook

```javascript
// /src/api/product/content-types/product/lifecycles.ts
export default {
  async afterUpdate() {
    await purgeCloudflareCache(['product-catalog', 'home']);
  },
  async afterCreate() {
    await purgeCloudflareCache(['product-catalog']);
  },
};

async function purgeCloudflareCache(cacheTags: string[]) {
  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: cacheTags }),
    }
  );
}
```

### 10.2 Cloudflare Cache Tags (HTML pages)

Add `Cache-Tag` headers in Astro for tag-based purging:

```javascript
// src/pages/products/[slug].astro — server response headers
Astro.response.headers.set('Cache-Tag', `product-${slug},products`);
```

---

## 11. Wrangler CLI Configuration

For local Cloudflare Pages development and deployment:

```toml
# wrangler.toml
name = "twinmos-website"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"

[env.production]
vars = { PUBLIC_ENV = "production" }

[env.staging]
vars = { PUBLIC_ENV = "staging" }
```

```json
// package.json scripts
{
  "scripts": {
    "preview:cf": "wrangler pages dev ./dist --port 8788",
    "deploy:staging": "wrangler pages deploy ./dist --project-name twinmos-website --branch staging",
    "deploy:prod": "wrangler pages deploy ./dist --project-name twinmos-website --branch main"
  }
}
```

---

## 12. Astro Cloudflare Adapter Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'hybrid',  // Static by default; SSR for dynamic routes
  adapter: cloudflare({
    mode: 'advanced',
    functionPerRoute: true,
  }),
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', ar: 'ar-AE', hi: 'hi-IN', bn: 'bn-BD',
                   ru: 'ru-RU', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', zh: 'zh-CN' },
      },
    }),
    tailwind(),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'hi', 'bn', 'ru', 'fr', 'es', 'de', 'zh'],
    routing: { prefixDefaultLocale: false },
  },
  site: 'https://twinmos.com',
  vite: {
    ssr: { external: ['pg', 'ioredis'] },
  },
});
```

---

## 13. Deployment Procedures

### 13.1 Automated (Normal)

Every push to `main` triggers an automatic Cloudflare Pages deployment via GitHub Actions.

### 13.2 Manual Emergency Deploy

```bash
# Force deploy from local machine (emergency only)
pnpm build
npx wrangler pages deploy ./dist \
  --project-name twinmos-website \
  --branch main \
  --commit-message "Emergency deploy: <reason>"
```

### 13.3 Rollback via Cloudflare Dashboard

```
Cloudflare Dashboard → Workers & Pages → twinmos-website
→ Deployments → Select previous deployment → Retry deployment
```

---

## 14. Monitoring & Analytics

```
Cloudflare Dashboard → Analytics & Logs

Web Analytics: Real traffic, top pages, referrers (Cloudflare-native, no JS needed)
Security Events: WAF blocks, Bot blocks, Rate limit triggers
Cache Analytics: Cache hit ratio (target ≥85%)
Speed: Observed LCP, TTFB from Cloudflare RUM

Enable Cloudflare Logpush (Pro feature):
  Destination: Backblaze B2 bucket: twinmos-logs-archive
  Fields: ClientIP, ClientRequestHost, ClientRequestURI, EdgeResponseStatus,
          CacheCacheStatus, WAFAction, BotScore, ClientRequestBytes, EdgeResponseBytes
  Frequency: Every 5 minutes
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.5, §18.1*
