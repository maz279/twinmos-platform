# TwinMOS Website — Lighthouse CI Integration

**Document ID:** H.5-005  
**Version:** 1.0  
**Status:** [M] Must-Have  
**Priority:** P1  
**Owner:** DevOps Lead / Frontend Lead  
**Date:** 2026-05-01  
**Review Cycle:** Quarterly

---

## 1. Purpose & Scope

This document specifies the integration of **Lighthouse CI** into the TwinMOS website CI/CD pipeline for automated performance, accessibility, best-practices, and SEO auditing. Lighthouse CI runs on every pull request and on a nightly schedule against production, enforcing performance budgets and preventing regressions.

**Scope:**
- Lighthouse CI configuration (`lighthouserc.js`)
- GitHub Actions workflow integration
- Performance budgets and assertion rules
- Arabic RTL locale testing
- Report artifact storage and PR comment integration

**Out of scope:** Manual Lighthouse runs (covered in performance testing docs).

---

## 2. Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Pull Request   │────▶│  GitHub Actions  │────▶│  Build Preview  │
│   Opened        │     │  Lighthouse Job  │     │  (Cloudflare)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Lighthouse  │
                        │     CI       │
                        │  (5 URLs)    │
                        └──────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  Assert  │    │  Upload  │    │  PR      │
        │  Budgets │    │  Reports │    │  Comment │
        └──────────┘    └──────────┘    └──────────┘
```

---

## 3. Tooling & Versions

| Component | Version | Purpose |
|-----------|---------|---------|
| Lighthouse CI | `@lhci/cli@0.14.x` | Core CLI for running audits |
| Puppeteer | `^21.0.0` | Headless browser for CI runs |
| GitHub Action | `treosh/lighthouse-ci-action@v11` | Native GitHub Actions integration |
| Node.js | `20.x` | Runtime for Lighthouse CI |

---

## 4. Configuration

### 4.1 lighthouserc.js

Create at repository root:

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      // Number of runs per URL for statistical significance
      numberOfRuns: 3,
      
      // Puppeteer settings for consistent runs
      puppeteerScript: './lighthouse/puppeteer-script.js',
      puppeteerLaunchOptions: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      
      // URLs to audit (production + staging variants)
      url: [
        // English (default)
        'http://localhost:4321/',
        'http://localhost:4321/products/',
        'http://localhost:4321/about/',
        'http://localhost:4321/support/',
        
        // Arabic RTL (critical for locale testing)
        'http://localhost:4321/ar/',
        'http://localhost:4321/ar/products/',
      ],
      
      // Start server before collecting
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'ready in',
      startServerReadyTimeout: 60000,
      
      // Settings for each run
      settings: {
        preset: 'desktop',
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        // Arabic locale testing
        locale: 'en',
        // Additional run for Arabic
      },
    },
    
    assert: {
      // Fail CI if assertions fail
      assertMatrix: [
        {
          // English pages - stricter budgets
          matchingUrlPattern: '^(?!.*\/ar\/).*$',
          assertions: {
            'categories:performance': ['warn', { minScore: 0.85 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['warn', { minScore: 0.90 }],
            'categories:seo': ['error', { minScore: 0.95 }],
            
            // Core Web Vitals
            'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
            'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
            'total-blocking-time': ['warn', { maxNumericValue: 200 }],
            'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
            'speed-index': ['warn', { maxNumericValue: 3400 }],
            
            // Resource budgets
            'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }],
            'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }],
            'resource-summary:image:size': ['warn', { maxNumericValue: 2000000 }],
            'resource-summary:font:size': ['warn', { maxNumericValue: 300000 }],
            'resource-summary:total:size': ['warn', { maxNumericValue: 4000000 }],
            'resource-summary:third-party:count': ['warn', { maxNumericValue: 10 }],
            
            // Accessibility specific
            'color-contrast': 'error',
            'image-alt': 'error',
            'label': 'error',
            'link-name': 'error',
          },
        },
        {
          // Arabic RTL pages - slightly relaxed for RTL complexity
          matchingUrlPattern: '.*\/ar\/.*',
          assertions: {
            'categories:performance': ['warn', { minScore: 0.80 }],
            'categories:accessibility': ['error', { minScore: 0.92 }],
            'categories:best-practices': ['warn', { minScore: 0.88 }],
            'categories:seo': ['error', { minScore: 0.93 }],
            
            'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
            'largest-contentful-paint': ['warn', { maxNumericValue: 2800 }],
            'total-blocking-time': ['warn', { maxNumericValue: 250 }],
            'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
          },
        },
      ],
    },
    
    upload: {
      target: 'temporary-public-storage',
      // Alternative: upload to self-hosted LHCI server (P2)
      // serverBaseUrl: 'https://lhci.twinmos.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};
```

### 4.2 Puppeteer Script (Cookie Consent + Locale)

```javascript
// lighthouse/puppeteer-script.js
/**
 * Puppeteer script executed before each Lighthouse run.
 * Handles cookie consent dismissal and locale setup.
 */

module.exports = async (browser, context) => {
  const page = await browser.newPage();
  
  // Set viewport for consistent measurements
  await page.setViewport({ width: 1350, height: 940 });
  
  // Navigate to target URL
  await page.goto(context.url, { waitUntil: 'networkidle2' });
  
  // Dismiss cookie banner if present (accept analytics)
  try {
    const cookieAccept = await page.$('[data-testid="cookie-accept"]');
    if (cookieAccept) {
      await cookieAccept.click();
      await page.waitForTimeout(500);
    }
  } catch (e) {
    // Cookie banner not present, continue
  }
  
  // Wait for fonts to load (critical for Arabic)
  await page.evaluate(() => document.fonts.ready);
  
  // Wait for any lazy-loaded images
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img[loading="lazy"]'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      });
    }));
  });
  
  // Return the page for Lighthouse to audit
  return page;
};
```

### 4.3 Mobile Configuration (lighthouserc.mobile.js)

```javascript
// lighthouserc.mobile.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        'http://localhost:4321/',
        'http://localhost:4321/products/',
        'http://localhost:4321/ar/',
      ],
      startServerCommand: 'npm run preview',
      settings: {
        preset: 'mobile',
        throttlingMethod: 'simulate',
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 5. GitHub Actions Integration

### 5.1 PR Lighthouse Check (`.github/workflows/lighthouse-pr.yml`)

```yaml
name: Lighthouse CI (PR)

on:
  pull_request:
    branches: [main, develop]
    paths:
      - 'apps/frontend/**'
      - 'packages/ui/**'
      - 'lighthouserc.js'
      - 'lighthouserc.mobile.js'

concurrency:
  group: lighthouse-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lighthouse-desktop:
    name: Lighthouse Desktop
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build --workspace=apps/frontend
        env:
          PUBLIC_STRAPI_URL: ${{ secrets.STRAPI_PREVIEW_URL }}
          PUBLIC_PLAUSIBLE_DOMAIN: twinmos.com

      - name: Run Lighthouse CI (Desktop)
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: './lighthouserc.js'
          uploadArtifacts: true
          temporaryPublicStorage: true
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Save reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-reports-desktop
          path: |
            .lighthouseci/
            !.lighthouseci/*.db

  lighthouse-mobile:
    name: Lighthouse Mobile
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build --workspace=apps/frontend
        env:
          PUBLIC_STRAPI_URL: ${{ secrets.STRAPI_PREVIEW_URL }}

      - name: Run Lighthouse CI (Mobile)
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: './lighthouserc.mobile.js'
          uploadArtifacts: true
          temporaryPublicStorage: true
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Save reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-reports-mobile
          path: |
            .lighthouseci/
            !.lighthouseci/*.db
```

### 5.2 Nightly Production Audit (`.github/workflows/lighthouse-nightly.yml`)

```yaml
name: Lighthouse CI (Nightly Production)

on:
  schedule:
    - cron: '0 2 * * *'  # 02:00 UTC daily
  workflow_dispatch:

jobs:
  lighthouse-production:
    name: Production Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Lighthouse CI globally
        run: npm install -g @lhci/cli@0.14.x

      - name: Run Lighthouse against production
        run: |
          lhci autorun \
            --collect.url=https://twinmos.com/ \
            --collect.url=https://twinmos.com/products/ \
            --collect.url=https://twinmos.com/about/ \
            --collect.url=https://twinmos.com/support/ \
            --collect.url=https://twinmos.com/ar/ \
            --collect.numberOfRuns=5 \
            --collect.settings.preset=desktop \
            --assert.assertions.categories:performance=warn:0.85 \
            --assert.assertions.categories:accessibility=error:0.95 \
            --assert.assertions.categories:seo=error:0.95 \
            --upload.target=temporary-public-storage
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-production-reports
          path: .lighthouseci/

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Lighthouse CI nightly audit failed for twinmos.com",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Lighthouse Nightly Audit Failed*\nProduction performance or accessibility budgets breached."
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 6. Performance Budgets

### 6.1 Budget Matrix

| Metric | Desktop EN | Desktop AR | Mobile EN | Mobile AR | Severity |
|--------|-----------|-----------|-----------|-----------|----------|
| Performance Score | >= 85 | >= 80 | >= 75 | >= 70 | warn |
| Accessibility Score | >= 95 | >= 92 | >= 95 | >= 92 | error |
| Best Practices | >= 90 | >= 88 | >= 90 | >= 88 | warn |
| SEO Score | >= 95 | >= 93 | >= 95 | >= 93 | error |
| FCP | <= 1800ms | <= 2000ms | <= 2500ms | <= 2800ms | warn |
| LCP | <= 2500ms | <= 2800ms | <= 4000ms | <= 4500ms | warn |
| TBT | <= 200ms | <= 250ms | <= 300ms | <= 350ms | warn |
| CLS | <= 0.1 | <= 0.15 | <= 0.1 | <= 0.15 | warn |
| Speed Index | <= 3400ms | <= 3800ms | <= 5800ms | <= 6300ms | warn |

### 6.2 Resource Budgets

| Resource Type | Max Size | Max Count |
|--------------|----------|-----------|
| HTML Document | 50 KB | — |
| JavaScript (total) | 500 KB | 15 files |
| Images (total) | 2 MB | 30 files |
| Web Fonts | 300 KB | 4 families |
| Total Page Weight | 4 MB | — |
| Third-party requests | — | 10 |

---

## 7. Arabic RTL Testing

### 7.1 RTL-Specific Assertions

```javascript
// Additional assertions for Arabic pages
{
  'categories:accessibility': ['error', { minScore: 0.92 }],
  // Arabic fonts may increase LCP
  'largest-contentful-paint': ['warn', { maxNumericValue: 2800 }],
  // RTL layout shift tolerance
  'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
}
```

### 7.2 Font Loading Strategy

- Preload Arabic font subset (`Noto Sans Arabic`)
- Use `font-display: swap` for all custom fonts
- Puppeteer script waits for `document.fonts.ready` before audit

---

## 8. Report Storage & Access

### 8.1 Artifact Retention

| Environment | Retention | Location |
|------------|-----------|----------|
| PR Checks | 30 days | GitHub Actions artifacts |
| Nightly Production | 90 days | GitHub Actions artifacts + Backblaze B2 |
| Release Tags | 1 year | Backblaze B2 archive |

### 8.2 Self-Hosted LHCI Server (P2)

Planned for Phase 2 to enable historical trend tracking:

```yaml
# docker-compose.lhci.yml
version: '3.8'
services:
  lhci-server:
    image: patrickhulce/lhci-server:latest
    ports:
      - '9001:9001'
    volumes:
      - lhci-data:/data
    environment:
      - LHCI_STORAGE__SQLITE_DATABASE_PATH=/data/lhci.db

volumes:
  lhci-data:
```

---

## 9. PR Comment Integration

### 9.1 Automated PR Comments

With `LHCI_GITHUB_APP_TOKEN` configured, Lighthouse CI automatically posts:

```
Lighthouse CI Results

| URL | Performance | Accessibility | Best Practices | SEO |
|-----|------------|---------------|----------------|-----|
| / | 92 | 98 | 95 | 100 |
| /products/ | 88 | 97 | 93 | 100 |
| /ar/ | 85 | 94 | 91 | 98 |

Report: https://storage.googleapis.com/...
```

### 9.2 Custom Comment Template

```javascript
// .github/scripts/lighthouse-comment.js
const fs = require('fs');

function formatReport() {
  const manifest = JSON.parse(
    fs.readFileSync('.lighthouseci/manifest.json', 'utf8')
  );
  
  const rows = manifest.map(entry => {
    const summary = entry.summary;
    return `| ${entry.url} | ${summary.performance * 100} | ${summary.accessibility * 100} | ${summary['best-practices'] * 100} | ${summary.seo * 100} |`;
  });
  
  return `## Lighthouse CI Results\n\n| URL | Performance | Accessibility | Best Practices | SEO |\n|-----|------------|---------------|----------------|-----|\n${rows.join('\n')}`;
}

module.exports = { formatReport };
```

---

## 10. Failure Handling

### 10.1 Assertion Failure Escalation

| Failure Type | Action | Notification |
|-------------|--------|--------------|
| warn threshold breached | PR merge blocked (optional) | PR comment |
| error threshold breached | PR merge blocked | PR comment + Slack |
| 3 consecutive nightly failures | Create P1 ticket | Slack + Email |
| Accessibility error | PR merge blocked immediately | PR comment |

### 10.2 Flakiness Mitigation

- **3 runs per URL** with median score used
- **Puppeteer script** ensures consistent page state
- **Retry logic** for transient network issues:
  ```yaml
  - name: Run Lighthouse CI
    uses: treosh/lighthouse-ci-action@v11
    with:
      configPath: './lighthouserc.js'
    retries: 2
  ```

---

## 11. Maintenance

### 11.1 Quarterly Review Checklist

- [ ] Review and adjust performance budgets based on real-user data (CrUX)
- [ ] Update URL list to match current sitemap
- [ ] Verify Arabic RTL pages are included
- [ ] Check third-party script impact on budgets
- [ ] Review mobile vs desktop score trends
- [ ] Update Puppeteer script for new UI components

### 11.2 Version Updates

| Component | Update Frequency | Owner |
|-----------|-----------------|-------|
| `@lhci/cli` | Monthly (patch), Quarterly (minor) | DevOps |
| Puppeteer | Quarterly | Frontend Lead |
| Action versions | Quarterly | DevOps |
| Budget thresholds | Quarterly (data-driven) | Performance Lead |

---

## 12. Related Documents

| Document | ID | Relationship |
|----------|-----|-------------|
| CI/CD Pipeline Spec | H.2-001 | Parent workflow |
| GitHub Actions Workflows Spec | H.2-002 | Workflow integration |
| Performance Engineering | L | Performance budgets alignment |
| Monitoring Architecture Overview | H.5-001 | Monitoring stack context |

---

## 13. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-01 | DevOps Lead | Initial version |

---

*This document is a living specification. Update when adding new page types, adjusting performance budgets, or integrating the self-hosted LHCI server.*
