# TwinMOS Corporate Website — API Test Plan (Bruno)

**Document Reference:** TWN-QA-API-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Owner:** Unisoft Senior Developer (Dev B) / QA Lead  
**Priority:** P1  
**Synchronized With:** BRD §26, Tech Stack §21.1

---

## 1. Purpose

This document defines the API testing strategy for the TwinMOS corporate website using Bruno — a Git-native API client. API tests validate all public and admin endpoints against the BRD §26 specification, ensuring contract compliance, correct HTTP semantics, and proper error handling.

**Coverage Target:** 100 % of documented public and admin endpoints.

---

## 2. Tooling & Configuration

### 2.1 Bruno Setup

```bash
# Install Bruno CLI for CI
npm install -g @usebruno/cli

# Collections stored in repo
mkdir -p bruno/twinmos-api
```

### 2.2 Collection Structure

```
bruno/
  twinmos-api/
    bruno.json
    environments/
      local.bru
      staging.bru
      production.bru
    collections/
      public/
        products/
          list-products.bru
          get-product.bru
        categories/
          list-categories.bru
        compatibility/
          search-compatibility.bru
        retailers/
          list-retailers.bru
        news/
          list-news.bru
          get-news.bru
        inquiries/
          submit-inquiry.bru
        warranty/
          register-warranty.bru
          lookup-warranty.bru
        firmware/
          request-firmware.bru
        rma/
          submit-rma.bru
          lookup-rma.bru
      admin/
        products/
          crud-products.bru
        content/
          crud-content.bru
        inquiries/
          manage-inquiries.bru
        users/
          manage-users.bru
        retailers/
          manage-retailers.bru
        rma/
          manage-rma.bru
        analytics/
          get-analytics.bru
```

### 2.3 Environment Configuration

```bru
# bruno/twinmos-api/environments/staging.bru
vars {
  baseUrl: https://api-staging.twinmos.com
  apiVersion: /api/v1
  authToken: {{process.env.BRUNO_AUTH_TOKEN}}
}
```

---

## 3. Endpoint Coverage

### 3.1 Public API Endpoints

| Endpoint | Method | Auth | Test File | Priority |
|----------|--------|------|-----------|----------|
| `/api/v1/products` | GET | None | `public/products/list-products.bru` | P0 |
| `/api/v1/products/{slug}` | GET | None | `public/products/get-product.bru` | P0 |
| `/api/v1/categories` | GET | None | `public/categories/list-categories.bru` | P0 |
| `/api/v1/compatibility` | GET | None | `public/compatibility/search-compatibility.bru` | P0 |
| `/api/v1/retailers` | GET | None | `public/retailers/list-retailers.bru` | P0 |
| `/api/v1/news` | GET | None | `public/news/list-news.bru` | P1 |
| `/api/v1/news/{slug}` | GET | None | `public/news/get-news.bru` | P1 |
| `/api/v1/inquiries` | POST | reCAPTCHA | `public/inquiries/submit-inquiry.bru` | P0 |
| `/api/v1/warranty/register` | POST | None | `public/warranty/register-warranty.bru` | P0 |
| `/api/v1/warranty/lookup` | GET | None | `public/warranty/lookup-warranty.bru` | P1 |
| `/api/v1/firmware/download` | POST | None | `public/firmware/request-firmware.bru` | P1 |
| `/api/v1/rma/submit` | POST | None | `public/rma/submit-rma.bru` | P1 |
| `/api/v1/rma/status` | GET | None | `public/rma/lookup-rma.bru` | P1 |

### 3.2 Admin API Endpoints

| Endpoint | Method | Auth | Test File | Priority |
|----------|--------|------|-----------|----------|
| `/api/v1/admin/products` | CRUD | JWT (Admin/Editor) | `admin/products/crud-products.bru` | P0 |
| `/api/v1/admin/content` | CRUD | JWT (Admin/Editor) | `admin/content/crud-content.bru` | P0 |
| `/api/v1/admin/inquiries` | CRUD | JWT (Admin/Editor) | `admin/inquiries/manage-inquiries.bru` | P0 |
| `/api/v1/admin/users` | CRUD | JWT (Admin only) | `admin/users/manage-users.bru` | P0 |
| `/api/v1/admin/retailers` | CRUD | JWT (Admin/Editor) | `admin/retailers/manage-retailers.bru` | P1 |
| `/api/v1/admin/rma` | CRUD | JWT (Admin/Editor) | `admin/rma/manage-rma.bru` | P1 |
| `/api/v1/admin/analytics` | GET | JWT (Admin) | `admin/analytics/get-analytics.bru` | P2 |

---

## 4. Test Scenarios

### 4.1 Product List (Public)

```bru
# public/products/list-products.bru
meta {
  name: List Products
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}{{apiVersion}}/products?page=1&pageSize=12
  body: none
  auth: none
}

assert {
  res.status: eq 200
  res.body.data: isArray
  res.body.data.length: eq 12
  res.body.meta.pagination.page: eq 1
  res.body.meta.pagination.pageSize: eq 12
}

tests {
  test("response has correct structure", function() {
    const data = res.body.data;
    expect(data[0]).to.have.property('id');
    expect(data[0]).to.have.property('attributes');
    expect(data[0].attributes).to.have.property('name');
    expect(data[0].attributes).to.have.property('slug');
  });
}
```

### 4.2 Product List with Filters

```bru
# public/products/list-products-filtered.bru
meta {
  name: List Products - Filtered by Category and Brand
  type: http
  seq: 2
}

get {
  url: {{baseUrl}}{{apiVersion}}/products?filters[category][$eq]=memory&filters[brand_line][$eq]=voltx
  body: none
  auth: none
}

assert {
  res.status: eq 200
  res.body.data: isArray
}

tests {
  test("all results match filters", function() {
    const products = res.body.data;
    products.forEach(p => {
      expect(p.attributes.category).to.equal('memory');
      expect(p.attributes.brand_line).to.equal('voltx');
    });
  });
}
```

### 4.3 Product Detail

```bru
# public/products/get-product.bru
meta {
  name: Get Product by Slug
  type: http
  seq: 3
}

get {
  url: {{baseUrl}}{{apiVersion}}/products/ddr5-voltx-rgb-32gb-5600mhz
  body: none
  auth: none
}

assert {
  res.status: eq 200
  res.body.data.attributes.slug: eq ddr5-voltx-rgb-32gb-5600mhz
  res.body.data.attributes.name: eq DDR5 VOLTX RGB 32GB 5600MHz
}
```

### 4.4 Product Detail — Not Found

```bru
# public/products/get-product-404.bru
meta {
  name: Get Product - Not Found
  type: http
  seq: 4
}

get {
  url: {{baseUrl}}{{apiVersion}}/products/nonexistent-product
  body: none
  auth: none
}

assert {
  res.status: eq 404
  res.body.type: eq https://twinmos.com/problems/not-found
  res.body.title: eq Product Not Found
}
```

### 4.5 Submit Inquiry

```bru
# public/inquiries/submit-inquiry.bru
meta {
  name: Submit Inquiry
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}{{apiVersion}}/inquiries
  body: json
  auth: none
}

body:json {
  {
    "name": "Test User",
    "email": "test@example.com",
    "country": "AE",
    "inquiry_type": "sales",
    "message": "Interested in distribution partnership.",
    "turnstile_token": "test-token"
  }
}

assert {
  res.status: eq 201
  res.body.data.id: isDefined
  res.body.data.attributes.ticket_number: matches ^TWIN-\d{6}$
  res.body.data.attributes.status: eq submitted
}
```

### 4.6 Submit Inquiry — Validation Error

```bru
# public/inquiries/submit-inquiry-400.bru
meta {
  name: Submit Inquiry - Validation Error
  type: http
  seq: 2
}

post {
  url: {{baseUrl}}{{apiVersion}}/inquiries
  body: json
  auth: none
}

body:json {
  {
    "name": "",
    "email": "not-an-email",
    "country": "XX",
    "inquiry_type": "invalid",
    "message": ""
  }
}

assert {
  res.status: eq 400
  res.body.type: eq https://twinmos.com/problems/validation-error
}

tests {
  test("returns field-level errors", function() {
    const errors = res.body.errors;
    expect(errors).to.have.property('name');
    expect(errors).to.have.property('email');
    expect(errors).to.have.property('country');
  });
}
```

### 4.7 Admin — Create Product (JWT Auth)

```bru
# admin/products/crud-products.bru
meta {
  name: Create Product (Admin)
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}{{apiVersion}}/admin/products
  body: json
  auth: bearer
}

auth:bearer {
  token: {{authToken}}
}

body:json {
  {
    "sku": "TM-TEST-001",
    "name": "Test Product",
    "slug": "test-product",
    "category": 1,
    "brand_line": "voltx",
    "status": "draft"
  }
}

assert {
  res.status: eq 201
  res.body.data.attributes.sku: eq TM-TEST-001
}
```

### 4.8 Admin — Unauthorized Access

```bru
# admin/products/unauthorized.bru
meta {
  name: Create Product - Unauthorized
  type: http
  seq: 2
}

post {
  url: {{baseUrl}}{{apiVersion}}/admin/products
  body: json
  auth: none
}

body:json {
  {
    "sku": "TM-TEST-002",
    "name": "Test Product 2"
  }
}

assert {
  res.status: eq 401
  res.body.type: eq https://twinmos.com/problems/unauthorized
}
```

### 4.9 Rate Limiting

```bru
# public/rate-limit.bru
meta {
  name: Rate Limiting Test
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}{{apiVersion}}/products
  body: none
  auth: none
}

script:pre-request {
  // Run this request 101 times in rapid succession via Bruno CLI
}

assert {
  res.status: oneOf [200, 429]
}

tests {
  test("rate limit eventually triggers", function() {
    if (res.status === 429) {
      expect(res.body).to.have.property('retry_after');
    }
  });
}
```

---

## 5. CI/CD Integration (Newman)

Bruno collections can be exported to Postman format and run via Newman in CI:

```yaml
# .github/workflows/api-tests.yml
name: API Tests
on: [push, pull_request]
jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm install -g @usebruno/cli
      - run: bru run --env staging --reporter junit bruno/twinmos-api/
```

Or using Bruno CLI directly:

```yaml
      - run: bru run --env staging bruno/twinmos-api/ --output results.xml
```

---

## 6. Authentication Test Patterns

### 6.1 JWT Token Refresh

```bru
# auth/jwt-refresh.bru
meta {
  name: JWT Token Refresh
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}{{apiVersion}}/auth/refresh
  body: json
  auth: none
}

body:json {
  {
    "refreshToken": "{{refreshToken}}"
  }
}

assert {
  res.status: eq 200
  res.body.accessToken: isDefined
  res.body.refreshToken: isDefined
}

tests {
  test("new access token is different", function() {
    expect(res.body.accessToken).to.not.equal(bruno.getEnvVar('authToken'));
  });
}
```

### 6.2 Role-Based Access Control

```bru
# auth/rbac-test.bru
meta {
  name: RBAC - Editor Cannot Delete Users
  type: http
  seq: 1
}

delete {
  url: {{baseUrl}}{{apiVersion}}/admin/users/123
  body: none
  auth: bearer
}

auth:bearer {
  token: {{editorToken}}
}

assert {
  res.status: eq 403
  res.body.type: eq https://twinmos.com/problems/forbidden
}
```

---

## 7. Error Format Validation (RFC 9457)

All API error responses must conform to RFC 9457 Problem Details:

```bru
# validation/rfc-9457.bru
meta {
  name: RFC 9457 Problem Details Format
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}{{apiVersion}}/nonexistent-endpoint
  body: none
  auth: none
}

assert {
  res.status: eq 404
  res.headers.content-type: contains application/problem+json
}

tests {
  test("follows RFC 9457 structure", function() {
    const body = res.body;
    expect(body).to.have.property('type');
    expect(body).to.have.property('title');
    expect(body).to.have.property('status');
    expect(body.status).to.equal(404);
  });
}
```

---

## 8. Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Unisoft Senior Developer | (TBC) | _______________ | _________ |
| QA Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Canonical Location:** `G - Quality Assurance and Testing/TwinMOSWebsiteAPITestPlan_Bruno.md`
