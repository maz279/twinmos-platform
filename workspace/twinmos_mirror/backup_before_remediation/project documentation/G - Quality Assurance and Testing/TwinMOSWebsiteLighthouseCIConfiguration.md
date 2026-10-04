# TwinMOS Website — Lighthouse CI Configuration

| | |
|:---|:---|
| **Document ID** | TWINMOS-QA-LHCI-001 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Author** | QA Lead |
| **Status** | Draft |
| **Phase** | P1 — Core Website |

## 1. Purpose and Scope

### 1.1 Purpose
This document defines the Lighthouse CI configuration, performance budgets, and automated auditing pipeline for the TwinMOS corporate website. Lighthouse CI runs on every Pull Request and deployment to catch performance, accessibility, best-practice, and SEO regressions before they reach production.

### 1.2 Scope
| In Scope | Out of Scope |
|:---|:---|
| Lighthouse CI automated audits in CI/CD | Manual Lighthouse runs (covered in testing procedures) |
| Performance budget enforcement | Synthetic monitoring (separate tool: UptimeRobot) |
| Accessibility score tracking | Full WCAG audit (covered in Accessibility Test Plan) |
| SEO score validation | Content quality review |
| PWA checks (if applicable) | Security headers audit (covered in Security Test Plan) |

### 1.3 References
- [L — Performance Engineering](file:///c:/software_project/TwinMOS/Corporate%20website%20development%20for%20TwinMOS/project%20documentation/L%20-%20Performance%20Engineering)
- [TwinMOS Technology Stack](file:///c:/software_project/TwinMOS/Corporate%20website%20development%20for%20TwinMOS/TwinMOS_Website_Technology_Stack.md)
- Google Lighthouse CI Documentation: https://github.com/GoogleChrome/lighthouse-ci

---

## 2. Lighthouse CI Architecture

### 2.1 Integration Points

```
Developer Push
      |
      v
GitHub Actions CI
      |
      +---> Build Astro Site
      |           |
      |           v
      |    Static HTML Output
      |           |
      v           v
Lighthouse CI Audit (lhci autorun)
      |
      +---> Performance Budget Check
      +---> Accessibility Score Check
      +---> Best Practices Check
      +---> SEO Score Check
      |
      v
LHCI Server (self-hosted or temporary)
      |
      v
GitHub Status Check / PR Comment
      |
      v
Pass / Fail Decision
```

### 2.2 Environments

| Environment | URL Pattern | Audit Frequency | Budget Strictness |
|:---|:---|:---|:---|
| PR Preview | Vercel/Netlify preview URL | Every PR | Warn on breach |
| Staging | https://staging.twinmos.com | Every merge to develop | Fail on breach |
| Production | https://www.twinmos.com | Weekly scheduled | Fail on breach |

---

## 3. Configuration Files

### 3.1 Main Configuration (lighthouserc.js)

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    // Upload configuration
    upload: {
      target: 'temporary-public-storage',
      // Alternative: self-hosted LHCI server
      // target: 'lhci',
      // serverBaseUrl: 'https://lhci.twinmos.com',
      // token: process.env.LHCI_TOKEN,
    },

    // Collect configuration
    collect: {
      // Number of runs to average
      numberOfRuns: 3,
      
      // Start local server for static sites
      staticDistDir: './dist',
      
      // Or use URL for deployed sites
      // url: ['http://localhost:4321/'],
      
      // Chrome flags for consistent results
      chromeFlags: '--no-sandbox --headless --disable-gpu --disable-dev-shm-usage',
      
      // Settings for each run
      settings: {
        // Emulated form factor
        formFactor: 'desktop',
        
        // Screen emulation
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        
        // Throttling
        throttling: {
          // Simulate fast 4G
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        
        // Only categories we care about
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        
        // Skip audits that are flaky or not applicable
        skipAudits: [
          'uses-http2',           // Local server doesn't use HTTP/2
          'canonical',            // Staging URLs differ
          'robots-txt',           // Staging may block crawlers
        ],
      },
    },

    // Assert configuration - PERFORMANCE BUDGETS
    assert: {
      preset: 'lighthouse:recommended',
      
      assertions: {
        // ===== PERFORMANCE =====
        'categories:performance': ['warn', { minScore: 0.90 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1200 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 2000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        
        // Resource budgets
        'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }],     // 50KB HTML
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }],      // 500KB JS
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }],  // 100KB CSS
        'resource-summary:image:size': ['warn', { maxNumericValue: 2000000 }],      // 2MB images
        'resource-summary:font:size': ['warn', { maxNumericValue: 200000 }],        // 200KB fonts
        'resource-summary:third-party:size': ['warn', { maxNumericValue: 300000 }], // 300KB 3rd party
        
        // Request counts
        'resource-summary:script:count': ['warn', { maxNumericValue: 15 }],
        'resource-summary:stylesheet:count': ['warn', { maxNumericValue: 3 }],
        
        // ===== ACCESSIBILITY =====
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-required-children': 'error',
        'aria-required-parent': 'error',
        'aria-roles': 'error',
        'aria-valid-attr-value': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'bypass': 'error',
        'color-contrast': 'warn',
        'document-title': 'error',
        'duplicate-id-aria': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'image-alt': 'error',
        'input-image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'listitem': 'error',
        'meta-viewport': 'error',
        
        // ===== BEST PRACTICES =====
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'errors-in-console': 'error',
        'inspector-issues': 'warn',
        'no-unload-listeners': 'warn',
        'notification-on-start': 'warn',
        'password-inputs-can-be-pasted-into': 'error',
        
        // ===== SEO =====
        'categories:seo': ['warn', { minScore: 0.90 }],
        'document-title': 'error',
        'meta-description': 'warn',
        'http-status-code': 'error',
        'link-text': 'warn',
        'crawlable-anchors': 'error',
        'is-crawlable': 'error',
        'hreflang': 'warn',           // Important for i18n
        'viewport': 'error',
      },
    },
  },
};
```

### 3.2 Mobile Configuration (lighthouserc.mobile.js)

```javascript
// lighthouserc.mobile.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      staticDistDir: './dist',
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          disabled: false,
        },
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.90 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### 3.3 Multi-URL Configuration

```javascript
// lighthouserc.urls.js - Audit critical pages
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        // Core pages
        'http://localhost:4321/',
        'http://localhost:4321/about',
        'http://localhost:4321/products',
        'http://localhost:4321/products/memory/ddr5-voltx',
        'http://localhost:4321/support',
        'http://localhost:4321/contact',
        'http://localhost:4321/where-to-buy',
        
        // Content pages
        'http://localhost:4321/news',
        'http://localhost:4321/careers',
        
        // Utility pages
        'http://localhost:4321/search',
        'http://localhost:4321/404',
      ],
      settings: {
        formFactor: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 4. GitHub Actions Integration

### 4.1 PR Audit Workflow

```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lighthouse-desktop:
    name: Lighthouse Desktop Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Astro site
        run: npm run build
      
      - name: Run Lighthouse CI (Desktop)
        run: |
          npm install -g @lhci/cli@0.14.x
          lhci autorun --config=lighthouserc.js
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-desktop-results
          path: '.lighthouseci/'

  lighthouse-mobile:
    name: Lighthouse Mobile Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Astro site
        run: npm run build
      
      - name: Run Lighthouse CI (Mobile)
        run: |
          npm install -g @lhci/cli@0.14.x
          lhci autorun --config=lighthouserc.mobile.js
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-mobile-results
          path: '.lighthouseci/'

  lighthouse-multi-url:
    name: Lighthouse Multi-URL Audit
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Astro site
        run: npm run build
      
      - name: Run Lighthouse CI (Multi-URL)
        run: |
          npm install -g @lhci/cli@0.14.x
          lhci autorun --config=lighthouserc.urls.js
      
      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-multi-url-results
          path: '.lighthouseci/'
```

### 4.2 PR Comment Integration

```yaml
# .github/workflows/lighthouse-pr-comment.yml
name: Lighthouse PR Comment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Build and audit
        run: |
          npm ci
          npm run build
          npm install -g @lhci/cli@0.14.x
          lhci autorun --config=lighthouserc.js | tee lighthouse-output.log
      
      - name: Parse results and comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const manifest = JSON.parse(fs.readFileSync('.lighthouseci/manifest.json'));
            
            let comment = '## Lighthouse CI Results\n\n';
            comment += '| Page | Performance | Accessibility | Best Practices | SEO |\n';
            comment += '|------|-------------|---------------|----------------|-----|\n';
            
            manifest.forEach(result => {
              const summary = result.summary;
              comment += `| ${result.url} | ${(summary.performance * 100).toFixed(0)} | ${(summary.accessibility * 100).toFixed(0)} | ${(summary['best-practices'] * 100).toFixed(0)} | ${(summary.seo * 100).toFixed(0)} |\n`;
            });
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## 5. Performance Budgets Summary

### 5.1 Score Thresholds

| Category | Desktop Target | Desktop Minimum | Mobile Target | Mobile Minimum |
|:---|:---|:---|:---|:---|
| Performance | 95 | 90 | 90 | 85 |
| Accessibility | 98 | 95 | 98 | 95 |
| Best Practices | 95 | 90 | 95 | 90 |
| SEO | 95 | 90 | 95 | 90 |

### 5.2 Timing Budgets (Desktop)

| Metric | Target | Maximum |
|:---|:---|:---|
| First Contentful Paint | < 800ms | < 1,200ms |
| Largest Contentful Paint | < 1,200ms | < 1,800ms |
| Speed Index | < 1,500ms | < 2,000ms |
| Time to Interactive | < 2,500ms | < 3,500ms |
| Total Blocking Time | < 150ms | < 300ms |
| Cumulative Layout Shift | < 0.03 | < 0.05 |

### 5.3 Resource Budgets

| Resource Type | Size Budget | Count Budget |
|:---|:---|:---|
| HTML document | < 50KB | 1 |
| JavaScript (total) | < 500KB | < 15 files |
| CSS (total) | < 100KB | < 3 files |
| Images (total) | < 2MB | No limit |
| Web Fonts | < 200KB | < 4 families |
| Third-party scripts | < 300KB | < 5 files |

---

## 6. Self-Hosted LHCI Server (Optional)

### 6.1 Docker Compose Configuration

```yaml
# docker-compose.lhci.yml
version: '3.8'

services:
  lhci-server:
    image: patrickhulce/lhci-server:latest
    ports:
      - '9001:9001'
    environment:
      - LHCI_STORAGE__SQL_CONNECTION_URL=postgres://lhci:password@postgres:5432/lhci
      - LHCI_STORAGE__SQL_CONNECTION_SSL=false
    volumes:
      - lhci-data:/data
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=lhci
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=lhci
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  lhci-data:
  postgres-data:
```

### 6.2 LHCI Server Configuration

```javascript
// lighthouserc.server.js
module.exports = {
  ci: {
    upload: {
      target: 'lhci',
      serverBaseUrl: 'https://lhci.twinmos.com',
      token: process.env.LHCI_BUILD_TOKEN,
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'postgres',
        sqlConnectionUrl: process.env.LHCI_STORAGE__SQL_CONNECTION_URL,
      },
    },
  },
};
```

---

## 7. Monitoring and Alerting

### 7.1 Baseline Tracking

Lighthouse CI maintains historical baselines. Key practices:
- Compare each PR against the `main` branch baseline
- Flag regressions > 5 points in any category
- Track trends over time via LHCI server dashboard

### 7.2 Alert Conditions

| Condition | Severity | Notification |
|:---|:---|:---|
| Performance score drops below 90 | Error | Slack #alerts-performance |
| Accessibility score drops below 95 | Error | Slack #alerts-a11y + email |
| LCP exceeds 1.8s | Warning | Slack #alerts-performance |
| New console error detected | Error | Slack #alerts-frontend |
| Resource budget exceeded | Warning | PR comment |

---

## 8. Troubleshooting Guide

| Symptom | Likely Cause | Solution |
|:---|:---|:---|
| Inconsistent scores between runs | Network variance | Increase `numberOfRuns` to 5+ |
| "uses-http2" audit fails locally | Local dev server | Add to `skipAudits` |
| Low mobile scores vs desktop | CPU throttling | Expected; focus on mobile-specific budgets |
| Third-party scripts hurting score | Analytics, chat widgets | Defer non-critical scripts |
| Images flagged for optimization | Unoptimized assets | Implement Astro image optimization |

---

## 9. Maintenance

| Task | Frequency | Owner |
|:---|:---|:---|
| Review and adjust budgets | Monthly | Performance Lead |
| Update skipAudits list | Per release | QA Engineer |
| Validate budget alignment with RUM | Quarterly | Performance Lead |
| Upgrade @lhci/cli | Quarterly | DevOps |

---

## 10. Approval

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| QA Lead | | | |
| Frontend Lead | | | |
| Performance Lead | | | |
| Project Manager | | | |

---

*Document Control: Changes must be approved by QA Lead and recorded in the project changelog.*
