# TwinMOS Website — Performance Test Plan (k6)

| | |
|:---|:---|
| **Document ID** | TWINMOS-QA-PERF-001 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Author** | QA Lead |
| **Status** | Draft |
| **Phase** | P1 — Core Website |

## 1. Purpose and Scope

### 1.1 Purpose
This document defines the performance testing strategy, test types, scripts, and success criteria for the TwinMOS corporate website using **k6** (Grafana k6). It ensures the Astro 5 static-first frontend, Strapi v5 backend APIs, and search infrastructure (MeiliSearch) meet performance targets under expected and peak load conditions.

### 1.2 Scope
| In Scope | Out of Scope |
|:---|:---|
| Frontend page load performance (LCP, CLS, INP) | CDN edge performance (covered by Cloudflare analytics) |
| Strapi REST/GraphQL API response times | Third-party payment gateways (Phase 3) |
| MeiliSearch query performance | ERP integration latency (Phase 3) |
| Static asset delivery (images, JS, CSS bundles) | Email service performance |
| Partner portal authenticated endpoints (Phase 2) | Real-time WebSocket performance |

### 1.3 References
- [TwinMOS Website BRD](file:///c:/software_project/TwinMOS/Corporate%20website%20development%20for%20TwinMOS/TwinMOS_Website_BRD.md)
- [TwinMOS Technology Stack](file:///c:/software_project/TwinMOS/Corporate%20website%20development%20for%20TwinMOS/TwinMOS_Website_Technology_Stack.md)
- [L — Performance Engineering](file:///c:/software_project/TwinMOS/Corporate%20website%20development%20for%20TwinMOS/project%20documentation/L%20-%20Performance%20Engineering)
- Google Lighthouse Performance Budgets

---

## 2. Performance Targets and SLAs

### 2.1 Frontend Performance Budgets

| Metric | Target | Maximum Acceptable | Measurement Tool |
|:---|:---|:---|:---|
| Largest Contentful Paint (LCP) | < 1.2s | < 1.8s | Lighthouse CI, WebPageTest |
| Cumulative Layout Shift (CLS) | < 0.03 | < 0.05 | Lighthouse CI |
| Interaction to Next Paint (INP) | < 100ms | < 150ms | Chrome UX Report, Lighthouse |
| First Contentful Paint (FCP) | < 0.8s | < 1.2s | Lighthouse CI |
| Time to First Byte (TTFB) | < 200ms | < 400ms | WebPageTest, k6 |
| Total Blocking Time (TBT) | < 150ms | < 300ms | Lighthouse CI |
| Lighthouse Performance Score | >= 95 | >= 90 | Lighthouse CI |

### 2.2 Backend API SLAs

| Endpoint Category | p50 Response Time | p95 Response Time | p99 Response Time | Error Rate |
|:---|:---|:---|:---|:---|
| Public read (pages, products) | < 50ms | < 150ms | < 300ms | < 0.1% |
| Search queries (MeiliSearch) | < 30ms | < 80ms | < 150ms | < 0.1% |
| Authenticated (partner portal) | < 100ms | < 300ms | < 600ms | < 0.5% |
| Form submissions | < 200ms | < 500ms | < 1000ms | < 1% |
| Media delivery (CDN) | < 50ms | < 100ms | < 200ms | < 0.1% |

### 2.3 Load Capacity Targets

| Scenario | Concurrent Users | Requests/Second | Duration |
|:---|:---|:---|:---|
| Normal load | 500 | 100 req/s | Sustained |
| Peak load (product launch) | 2,000 | 500 req/s | 30 minutes |
| Stress test ceiling | 5,000 | 1,000 req/s | 10 minutes |
| Soak test | 500 | 100 req/s | 8 hours |

---

## 3. Test Types and Methodology

### 3.1 Load Testing
Simulate expected user traffic to validate system behavior under normal and peak conditions.

### 3.2 Stress Testing
Gradually increase load beyond expected capacity to identify breaking points and degradation patterns.

### 3.3 Spike Testing
Sudden, extreme increases in traffic to test auto-scaling and recovery (simulates viral social media post or PR event).

### 3.4 Soak Testing
Sustained moderate load over extended periods to detect memory leaks, connection pool exhaustion, or gradual degradation.

### 3.5 Breakpoint Testing
Incremental load increase until system failure to determine absolute capacity limits.

---

## 4. k6 Test Scripts

### 4.1 Project Structure

```
performance-tests/
├── config/
│   ├── environments.js          # Environment URLs and credentials
│   └── thresholds.js            # Shared threshold definitions
├── scripts/
│   ├── smoke-test.js            # Minimal validation (1 VU)
│   ├── load-test-homepage.js    # Homepage under normal load
│   ├── load-test-api.js         # API endpoints under normal load
│   ├── stress-test.js           # Gradual overload
│   ├── spike-test.js            # Sudden traffic surge
│   ├── soak-test.js             # 8-hour endurance
│   └── breakpoint-test.js       # Find breaking point
├── helpers/
│   ├── auth.js                  # JWT authentication helpers
│   ├── data.js                  # Test data generators
│   └── metrics.js               # Custom metrics definitions
├── data/
│   ├── product-ids.json         # Sample product IDs for queries
│   └── search-terms.json        # Common search terms
└── results/
    └── .gitkeep
```

### 4.2 Shared Configuration (config/thresholds.js)

```javascript
// config/thresholds.js
export const thresholds = {
  http_req_duration: ['p(95)<150', 'p(99)<300'],
  http_req_failed: ['rate<0.001'],
  http_req_waiting: ['p(95)<100'],
  iteration_duration: ['p(95)<2000'],
};

export const homepageThresholds = {
  http_req_duration: ['p(95)<100', 'p(99)<200'],
  http_req_failed: ['rate<0.0005'],
};

export const apiThresholds = {
  http_req_duration: ['p(50)<50', 'p(95)<150', 'p(99)<300'],
  http_req_failed: ['rate<0.001'],
};
```

### 4.3 Homepage Load Test (scripts/load-test-homepage.js)

```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { thresholds } from '../config/thresholds.js';

// Custom metrics
const lcpSimulated = new Trend('lcp_simulated');
const pageErrorRate = new Rate('page_errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Steady state
    { duration: '2m', target: 200 },   // Increase
    { duration: '5m', target: 200 },   // Steady state
    { duration: '2m', target: 500 },   // Peak
    { duration: '5m', target: 500 },   // Sustained peak
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    ...thresholds,
    http_req_duration: ['p(95)<150', 'p(99)<300'],
    lcp_simulated: ['p(95)<1200'],
    page_errors: ['rate<0.001'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.twinmos.com';
const PAGES = [
  '/',
  '/about',
  '/products',
  '/products/memory/ddr5-voltx',
  '/support',
  '/where-to-buy',
];

export default function () {
  group('Homepage Load', () => {
    const page = PAGES[Math.floor(Math.random() * PAGES.length)];
    const res = http.get(`${BASE_URL}${page}`, {
      headers: {
        'Accept': 'text/html',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 200ms': (r) => r.timings.waiting < 200,
      'content-type is html': (r) => r.headers['Content-Type'].includes('text/html'),
      'has critical content': (r) => r.body.includes('TwinMOS'),
    });

    pageErrorRate.add(!success);
    lcpSimulated.add(res.timings.waiting + res.timings.receiving);
  });

  group('Static Assets', () => {
    const assets = [
      '/_astro/main.hash.js',
      '/_astro/styles.hash.css',
    ];
    
    assets.forEach(asset => {
      const res = http.get(`${BASE_URL}${asset}`, {
        headers: { 'Accept-Encoding': 'gzip, deflate, br' },
      });
      check(res, {
        'asset status 200': (r) => r.status === 200,
        'asset cached or fast': (r) => r.timings.waiting < 50,
      });
    });
  });

  sleep(Math.random() * 3 + 1); // Think time: 1-4s
}
```

### 4.4 API Load Test (scripts/load-test-api.js)

```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';
import { apiThresholds } from '../config/thresholds.js';

const apiErrorRate = new Rate('api_errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: apiThresholds,
};

const API_URL = __ENV.API_URL || 'https://api-staging.twinmos.com/api';

export default function () {
  group('Public API Endpoints', () => {
    // Products list
    const productsRes = http.get(`${API_URL}/products?populate=*&pagination[pageSize]=12`);
    const productsOk = check(productsRes, {
      'products status 200': (r) => r.status === 200,
      'products response < 150ms': (r) => r.timings.duration < 150,
      'products has data': (r) => JSON.parse(r.body).data.length > 0,
    });
    apiErrorRate.add(!productsOk);

    // Single product
    const productRes = http.get(`${API_URL}/products/1?populate=*`);
    check(productRes, {
      'product detail status 200': (r) => r.status === 200,
      'product detail < 100ms': (r) => r.timings.duration < 100,
    });

    // Categories
    const categoriesRes = http.get(`${API_URL}/categories`);
    check(categoriesRes, {
      'categories status 200': (r) => r.status === 200,
      'categories < 50ms': (r) => r.timings.duration < 50,
    });
  });

  group('Search API', () => {
    const searchTerms = ['DDR5', 'SSD', 'VolTX', 'gaming', 'memory'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const searchRes = http.get(
      `${API_URL}/search?q=${encodeURIComponent(term)}&limit=10`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    const searchOk = check(searchRes, {
      'search status 200': (r) => r.status === 200,
      'search < 80ms': (r) => r.timings.duration < 80,
      'search returns results': (r) => JSON.parse(r.body).hits !== undefined,
    });
    apiErrorRate.add(!searchOk);
  });

  group('Compatibility Finder', () => {
    const compatRes = http.get(
      `${API_URL}/compatibilities?filters[motherboard][$eq]=B650&populate=*`
    );
    check(compatRes, {
      'compatibility status 200': (r) => r.status === 200,
      'compatibility < 200ms': (r) => r.timings.duration < 200,
    });
  });

  sleep(Math.random() * 2 + 0.5);
}
```

### 4.5 Stress Test (scripts/stress-test.js)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 500 },    // Normal
    { duration: '5m', target: 1000 },   // High
    { duration: '5m', target: 2000 },   // Very high
    { duration: '5m', target: 3000 },   // Extreme
    { duration: '5m', target: 5000 },   // Breaking point
    { duration: '5m', target: 0 },      // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.twinmos.com';

export default function () {
  const endpoints = ['/', '/products', '/about', '/support'];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const res = http.get(`${BASE_URL}${endpoint}`);
  check(res, {
    'status is 200 or cached': (r) => r.status === 200 || r.status === 304,
    'response received': (r) => r.timings.duration > 0,
  });

  sleep(0.5);
}
```

### 4.6 Spike Test (scripts/spike-test.js)

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },     // Baseline
    { duration: '30s', target: 2000 },   // SPIKE
    { duration: '3m', target: 2000 },    // Sustained spike
    { duration: '30s', target: 100 },    // Drop
    { duration: '3m', target: 100 },     // Recovery validation
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.10'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.twinmos.com';

export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'status acceptable': (r) => r.status === 200 || r.status === 429 || r.status === 503,
    'no timeout': (r) => r.timings.duration < 10000,
  });
}
```

### 4.7 Soak Test (scripts/soak-test.js)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const memoryLeakIndicator = new Counter('memory_growth_checks');

export const options = {
  stages: [
    { duration: '10m', target: 100 },   // Ramp up
    { duration: '7h', target: 100 },    // Sustained (7 hours)
    { duration: '10m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.001'],
    iteration_duration: ['p(95)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.twinmos.com';

export default function () {
  const pages = ['/', '/products', '/about', '/support', '/where-to-buy'];
  const page = pages[Math.floor(Math.random() * pages.length)];
  
  const res = http.get(`${BASE_URL}${page}`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'response time stable': (r) => r.timings.duration < 300,
  });

  // Every 100 iterations, check for memory indicators
  if (__ITER % 100 === 0) {
    memoryLeakIndicator.add(1);
  }

  sleep(Math.random() * 5 + 2);
}
```

---

## 5. Execution Schedule

| Test Type | Environment | Frequency | Trigger |
|:---|:---|:---|:---|
| Smoke test | Staging | Every deployment | CI/CD pipeline |
| Load test | Staging | Weekly (Sundays 02:00 UTC) | Scheduled |
| Load test | Production | Monthly (first Sunday) | Scheduled |
| Stress test | Staging | Bi-weekly | Manual trigger |
| Spike test | Staging | Before major campaigns | Manual trigger |
| Soak test | Staging | Monthly | Manual trigger |
| Breakpoint | Staging | Quarterly | Manual trigger |

---

## 6. CI/CD Integration

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly Sundays
  workflow_dispatch:
    inputs:
      test_type:
        description: 'Test type to run'
        required: true
        default: 'load'
        type: choice
        options:
          - smoke
          - load
          - stress
          - spike
          - soak

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup k6
        uses: grafana/setup-k6-action@v1
        with:
          k6-version: '0.52.0'
      
      - name: Run Smoke Test
        if: github.event.inputs.test_type == 'smoke' || github.event.inputs.test_type == ''
        run: k6 run --out json=results/smoke.json scripts/smoke-test.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          API_URL: ${{ secrets.STAGING_API_URL }}
      
      - name: Run Load Test
        if: github.event.inputs.test_type == 'load'
        run: k6 run --out influxdb=${{ secrets.INFLUXDB_URL }} scripts/load-test-homepage.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          K6_OUT: influxdb=http://influxdb:8086/k6
      
      - name: Upload Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: k6-results
          path: results/
```

### 6.2 Grafana Dashboard Configuration

Key panels to configure:
- Response time percentiles (p50, p95, p99)
- Request rate and error rate
- Virtual users over time
- Custom metrics (LCP simulated, API error rate)
- Threshold breach alerts

---

## 7. Reporting and Escalation

### 7.1 Test Report Template

Each test run produces:
1. **Executive Summary**: Pass/fail status, key metrics vs targets
2. **Detailed Metrics**: All percentiles, error rates, throughput
3. **Graphs**: Response time distribution, VU ramp, error timeline
4. **Bottleneck Analysis**: Slowest endpoints, resource constraints
5. **Recommendations**: Specific optimizations needed

### 7.2 Escalation Criteria

| Condition | Action | Owner |
|:---|:---|:---|
| p95 response time > 2x target | Immediate investigation | Backend Lead |
| Error rate > 1% | Stop release, investigate | QA Lead |
| Memory growth > 20% during soak | Create critical bug | DevOps Lead |
| CDN cache hit rate < 85% | Review cache configuration | DevOps Engineer |

---

## 8. Test Data Requirements

| Data Type | Source | Volume | Refresh Frequency |
|:---|:---|:---|:---|
| Product catalog | Strapi seed data | 500 products | Weekly |
| Search terms | Analytics export | Top 100 terms | Monthly |
| User credentials | Test account pool | 50 accounts | Per test |
| Compatibility data | Seed scripts | 10,000 records | Per deployment |

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|:---|:---|:---|
| Staging environment differs from production | High | Use production-like data volumes; validate infrastructure parity |
| Third-party services (CDN, search) skew results | Medium | Isolate external calls; mock where appropriate |
| Test scripts don't reflect real user behavior | High | Base scenarios on analytics data; review quarterly |
| Resource contention on shared staging | Medium | Schedule tests during low-usage windows |

---

## 10. Approval

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| QA Lead | | | |
| Backend Lead | | | |
| DevOps Lead | | | |
| Project Manager | | | |

---

*Document Control: Changes must be approved by QA Lead and recorded in the project changelog.*
