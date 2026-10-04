# TwinMOS Corporate Website — Integration Test Plan

**Document Reference:** TWN-QA-INT-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Owner:** Unisoft Senior Developer (Dev B)  
**Priority:** P1

---

## 1. Purpose

This document defines the integration testing strategy for the TwinMOS corporate website. Integration tests validate the interactions between Strapi controllers, services, database queries, and external API calls — ensuring that components work correctly when composed together.

**Coverage Target:** All custom Strapi controllers and API endpoints covered by Phase 1 launch.

---

## 2. Tooling & Configuration

### 2.1 Test Framework

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | ^2.x | Test runner |
| Supertest | ^7.x | HTTP assertion library for API testing |
| @strapi/strapi | ^5.31.0 | Strapi test harness |
| testcontainers | ^10.x | PostgreSQL container for isolated DB tests |
| msw (Mock Service Worker) | ^2.x | External API mocking |

### 2.2 Test Environment

Integration tests run against a real Strapi instance with an ephemeral PostgreSQL container:

```typescript
// backend/tests/integration/setup.ts
import { GenericContainer } from 'testcontainers';

let postgresContainer;

beforeAll(async () => {
  postgresContainer = await new GenericContainer('postgres:16')
    .withEnvironment({ POSTGRES_DB: 'strapi_test', POSTGRES_PASSWORD: 'test' })
    .withExposedPorts(5432)
    .start();
  
  process.env.DATABASE_HOST = postgresContainer.getHost();
  process.env.DATABASE_PORT = String(postgresContainer.getMappedPort(5432));
  
  // Bootstrap Strapi in test mode
  await strapi.load();
}, 60000);

afterAll(async () => {
  await strapi.destroy();
  await postgresContainer.stop();
});
```

---

## 3. Scope

### 3.1 In Scope

| Layer | Examples | Priority |
|-------|----------|----------|
| **Strapi custom controllers** | Product list with filters, form submission, warranty registration, RMA status | P0 |
| **Strapi services** | Serial validation, email auto-routing, price-list generation | P0 |
| **Strapi lifecycle hooks** | Post-save webhooks, audit log writes, Slack notifications | P0 |
| **Database transactions** | Multi-table writes (warranty + serial lookup), rollback on error | P0 |
| **External API integrations** | Resend email, HubSpot CRM webhook, Cloudflare cache purge | P1 |
| **MeiliSearch indexing** | Product index updates, search query accuracy | P1 |
| **Auth flows** | JWT token refresh, MFA verification, role-based access | P1 |
| **File upload pipeline** | ImgProxy transform, Backblaze B2 storage, virus scan | P1 |

### 3.2 Out of Scope

- Pure UI interactions (covered by E2E tests)
- Static page rendering (covered by E2E + Lighthouse)
- Third-party service internals (mocked at API boundary)
- Performance under load (covered by k6)

---

## 4. Test Categories

### 4.1 API Endpoint Integration Tests

```typescript
// backend/tests/integration/api/products.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

describe('GET /api/v1/products', () => {
  it('returns paginated product list', async () => {
    const res = await request(strapi.server.httpServer)
      .get('/api/v1/products?page=1&pageSize=12')
      .expect(200);
    
    expect(res.body.data).toHaveLength(12);
    expect(res.body.meta.pagination.page).toBe(1);
  });

  it('filters by category', async () => {
    const res = await request(strapi.server.httpServer)
      .get('/api/v1/products?filters[category][$eq]=memory')
      .expect(200);
    
    expect(res.body.data.every(p => p.category === 'memory')).toBe(true);
  });

  it('filters by brand line', async () => {
    const res = await request(strapi.server.httpServer)
      .get('/api/v1/products?filters[brand_line][$eq]=voltx')
      .expect(200);
    
    expect(res.body.data.every(p => p.brand_line === 'voltx')).toBe(true);
  });

  it('returns empty array for invalid filter', async () => {
    const res = await request(strapi.server.httpServer)
      .get('/api/v1/products?filters[category][$eq]=nonexistent')
      .expect(200);
    
    expect(res.body.data).toHaveLength(0);
  });
});
```

### 4.2 Form Submission Integration Tests

```typescript
// backend/tests/integration/api/inquiries.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('POST /api/v1/inquiries', () => {
  it('creates inquiry and sends auto-reply', async () => {
    const res = await request(strapi.server.httpServer)
      .post('/api/v1/inquiries')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        country: 'AE',
        inquiry_type: 'sales',
        message: 'Interested in distribution.',
      })
      .expect(201);

    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.attributes.ticket_number).toMatch(/^TWIN-\d{6}$/);
  });

  it('rejects submission without required fields', async () => {
    await request(strapi.server.httpServer)
      .post('/api/v1/inquiries')
      .send({ name: 'Incomplete' })
      .expect(400);
  });

  it('rejects submission with invalid email', async () => {
    await request(strapi.server.httpServer)
      .post('/api/v1/inquiries')
      .send({
        name: 'Test',
        email: 'not-an-email',
        country: 'AE',
        inquiry_type: 'sales',
        message: 'Test',
      })
      .expect(400);
  });

  it('applies rate limiting', async () => {
    // Submit 101 requests rapidly
    const requests = Array(101).fill(null).map(() =>
      request(strapi.server.httpServer)
        .post('/api/v1/inquiries')
        .send({ name: 'Bot', email: 'bot@example.com', country: 'AE', inquiry_type: 'sales', message: 'Spam' })
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

### 4.3 Warranty Registration Integration Tests

```typescript
// backend/tests/integration/api/warranty.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('POST /api/v1/warranty/register', () => {
  it('registers warranty with valid serial', async () => {
    const res = await request(strapi.server.httpServer)
      .post('/api/v1/warranty/register')
      .send({
        serial_number: 'TM123456789',
        product: 1,
        purchase_date: '2026-01-15',
        retailer: 'Amazon',
        owner_email: 'owner@example.com',
        owner_name: 'John Doe',
      })
      .expect(201);

    expect(res.body.data.attributes.certificate_url).toBeDefined();
  });

  it('rejects duplicate registration', async () => {
    await request(strapi.server.httpServer)
      .post('/api/v1/warranty/register')
      .send({
        serial_number: 'TM123456789',
        product: 1,
        purchase_date: '2026-01-15',
        retailer: 'Amazon',
        owner_email: 'owner@example.com',
        owner_name: 'John Doe',
      });

    await request(strapi.server.httpServer)
      .post('/api/v1/warranty/register')
      .send({
        serial_number: 'TM123456789',
        product: 1,
        purchase_date: '2026-02-01',
        retailer: 'Newegg',
        owner_email: 'other@example.com',
        owner_name: 'Jane Doe',
      })
      .expect(409);
  });

  it('rejects invalid serial format', async () => {
    await request(strapi.server.httpServer)
      .post('/api/v1/warranty/register')
      .send({
        serial_number: 'INVALID',
        product: 1,
        purchase_date: '2026-01-15',
        retailer: 'Amazon',
        owner_email: 'owner@example.com',
        owner_name: 'John Doe',
      })
      .expect(400);
  });
});
```

### 4.4 MeiliSearch Integration Tests

```typescript
// backend/tests/integration/search/meilisearch.test.ts
import { describe, it, expect } from 'vitest';

describe('MeiliSearch product index', () => {
  it('indexes new product on create', async () => {
    const product = await strapi.entityService.create('api::product.product', {
      data: { name: 'Test SSD', slug: 'test-ssd', category: 'ssd' },
    });

    const searchResults = await meilisearch.index('products').search('Test SSD');
    expect(searchResults.hits.some(h => h.id === product.id)).toBe(true);
  });

  it('returns results for Arabic query', async () => {
    const results = await meilisearch.index('products').search('ذاكرة');
    expect(results.hits.length).toBeGreaterThan(0);
  });

  it('applies faceted filters', async () => {
    const results = await meilisearch.index('products').search('DDR5', {
      filter: ['category = memory', 'brand_line = voltx'],
    });
    expect(results.hits.every(h => h.category === 'memory')).toBe(true);
  });
});
```

---

## 5. External Service Mocking

### 5.1 Resend Email Mock

```typescript
// backend/tests/integration/mocks/resend.ts
import { http, HttpResponse } from 'msw';

export const resendHandlers = [
  http.post('https://api.resend.com/emails', async () => {
    return HttpResponse.json({ id: 'test-email-id' }, { status: 200 });
  }),
];
```

### 5.2 HubSpot CRM Webhook Mock

```typescript
// backend/tests/integration/mocks/hubspot.ts
import { http, HttpResponse } from 'msw';

export const hubspotHandlers = [
  http.post('https://api.hubapi.com/crm/v3/objects/contacts', async () => {
    return HttpResponse.json({ id: 'hubspot-test-id' }, { status: 201 });
  }),
];
```

---

## 6. Database Seeding

```typescript
// backend/tests/integration/seed.ts
export async function seedTestData(strapi) {
  const category = await strapi.entityService.create('api::category.category', {
    data: { name: 'Memory', slug: 'memory' },
  });

  const brand = await strapi.entityService.create('api::brand-line.brand-line', {
    data: { name: 'VOLTX', slug: 'voltx', color_primary: '#00A3E0' },
  });

  const product = await strapi.entityService.create('api::product.product', {
    data: {
      sku: 'TM-DDR5-32GB-RGB',
      name: 'DDR5 VOLTX RGB 32GB',
      slug: 'ddr5-voltx-rgb-32gb',
      category: category.id,
      brand_line: 'voltx',
      status: 'published',
    },
  });

  return { category, brand, product };
}
```

---

## 7. CI Integration

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests
on: [push, pull_request]
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: strapi_test, POSTGRES_PASSWORD: test }
        ports: ['5432:5432']
      meilisearch:
        image: getmeili/meilisearch:v1.13
        ports: ['7700:7700']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm vitest run --config vitest.integration.config.ts
```

---

## 8. Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Unisoft Senior Developer | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| QA Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Canonical Location:** `G - Quality Assurance and Testing/TwinMOSWebsiteIntegrationTestPlan.md`
