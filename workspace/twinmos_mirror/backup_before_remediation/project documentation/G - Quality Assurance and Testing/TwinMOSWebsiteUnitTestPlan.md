# TwinMOS Corporate Website — Unit Test Plan

**Document Reference:** TWN-QA-UNIT-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Owner:** Unisoft Team Lead (Dev A) / Unisoft Senior Developer (Dev B)  
**Priority:** P1

---

## 1. Purpose

This document defines the unit testing strategy, scope, and implementation guidelines for the TwinMOS corporate website. Unit tests validate individual functions, utilities, and business logic in isolation, providing the fastest feedback loop in the test pyramid.

**Coverage Target:** 100 % business logic; >= 70 % overall by Phase 1 launch; >= 80 % by Phase 3 launch.

---

## 2. Tooling & Configuration

### 2.1 Test Framework

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | ^2.x | Unit test runner (Vite-native, Jest-compatible API) |
| @vitest/coverage-v8 | ^2.x | Code coverage reporting |
| @testing-library/react | ^14.x | React component testing utilities |
| @testing-library/jest-dom | ^6.x | Custom DOM matchers |
| jsdom / happy-dom | Latest | DOM environment for component tests |
| msw (Mock Service Worker) | ^2.x | API mocking for unit tests |

### 2.2 Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/', '.astro/'],
  },
});
```

### 2.3 Coverage Thresholds by Phase

| Phase | Lines | Functions | Branches | Statements |
|-------|-------|-----------|----------|------------|
| Phase 1 (Month 5) | >= 70 % | >= 70 % | >= 60 % | >= 70 % |
| Phase 2 (Month 9) | >= 75 % | >= 75 % | >= 65 % | >= 75 % |
| Phase 3 (Month 15) | >= 80 % | >= 80 % | >= 70 % | >= 80 % |

---

## 3. Scope & Categories

### 3.1 Frontend Unit Tests (Astro + React)

| Category | Examples | Priority |
|----------|----------|----------|
| **Utility functions** | `slugify`, `formatDate`, `truncateText`, `debounce`, `throttle` | P0 |
| **Form validators** | Zod schemas for contact, warranty, RMA, distributor inquiry | P0 |
| **Data transformers** | Product spec normalizers, retailer geoJSON mappers | P0 |
| **URL builders** | `hreflang` generators, canonical URL constructors | P1 |
| **i18n helpers** | Locale detection, RTL detection, number/currency formatters | P1 |
| **Analytics event builders** | GA4 event parameter constructors, consent state managers | P1 |
| **React hooks** | `useLocalStorage`, `useMediaQuery`, `useInView`, `useForm` | P1 |
| **Component logic** | Pagination math, filter state reducers, sort comparators | P1 |

### 3.2 Backend Unit Tests (Strapi)

| Category | Examples | Priority |
|----------|----------|----------|
| **Custom controllers** | Form submission handlers, warranty validation, RMA state transitions | P0 |
| **Lifecycle hooks** | Auto-reply email triggers, Slack notifications, audit log writes | P0 |
| **Service functions** | Serial validation, watermark PDF generation, price-list export | P0 |
| **Policy functions** | RBAC checks, field-level access control | P0 |
| **Webhook handlers** | Cloudflare cache purge, HubSpot CRM sync, ERP sync (P2) | P1 |
| **Utility functions** | Date formatters, slug generators, token validators | P1 |

### 3.3 Explicitly Out of Scope

- UI rendering (covered by component/E2E tests)
- Database query logic (covered by integration tests)
- Third-party service behavior (mocked with MSW)
- Static Astro page generation (covered by E2E + Lighthouse)

---

## 4. Test Patterns & Examples

### 4.1 Utility Function Test Pattern

```typescript
// src/utils/slugify.test.ts
import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('DDR5 VOLTX RGB')).toBe('ddr5-voltx-rgb');
  });

  it('removes special characters', () => {
    expect(slugify('CoreX Pro (Gen5)')).toBe('corex-pro-gen5');
  });

  it('handles Arabic text', () => {
    expect(slugify('ذاكرة DDR5')).toBe('ذاكرة-ddr5');
  });

  it('truncates to max length', () => {
    expect(slugify('a'.repeat(100), { maxLength: 50 })).toHaveLength(50);
  });
});
```

### 4.2 Zod Schema Validation Test Pattern

```typescript
// src/validators/contactForm.test.ts
import { describe, it, expect } from 'vitest';
import { contactFormSchema } from './contactForm';

describe('contactFormSchema', () => {
  it('accepts valid input', () => {
    const result = contactFormSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      country: 'AE',
      subject: 'sales',
      message: 'Interested in distribution.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = contactFormSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      country: 'AE',
      subject: 'sales',
      message: 'Test',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });

  it('rejects message over 5000 chars', () => {
    const result = contactFormSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      country: 'AE',
      subject: 'sales',
      message: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('requires GDPR consent for EU users', () => {
    const result = contactFormSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      country: 'DE',
      subject: 'sales',
      message: 'Test',
      gdprConsent: false,
    });
    expect(result.success).toBe(false);
  });
});
```

### 4.3 React Hook Test Pattern

```typescript
// src/hooks/useLocalStorage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default value when key not present', () => {
    const { result } = renderHook(() => useLocalStorage('compareList', []));
    expect(result.current[0]).toEqual([]);
  });

  it('persists value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('compareList', []));
    act(() => {
      result.current[1](['sku-123']);
    });
    expect(JSON.parse(localStorage.getItem('compareList')!)).toEqual(['sku-123']);
  });

  it('syncs across tabs via storage event', () => {
    const { result } = renderHook(() => useLocalStorage('compareList', []));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'compareList',
        newValue: JSON.stringify(['sku-456']),
      }));
    });
    expect(result.current[0]).toEqual(['sku-456']);
  });
});
```

### 4.4 Strapi Controller Test Pattern

```typescript
// backend/tests/unit/controllers/warranty.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSerial } from '../../../src/api/warranty/controllers/warranty';

describe('warranty controller', () => {
  let strapi;

  beforeEach(() => {
    strapi = {
      entityService: {
        findOne: vi.fn(),
      },
    };
  });

  it('returns VALID for known serial', async () => {
    strapi.entityService.findOne.mockResolvedValue({
      serial_number: 'TM123456789',
      status: 'active',
    });

    const result = await validateSerial(strapi, 'TM123456789');
    expect(result.status).toBe('VALID');
  });

  it('returns NOT_FOUND for unknown serial', async () => {
    strapi.entityService.findOne.mockResolvedValue(null);

    const result = await validateSerial(strapi, 'UNKNOWN');
    expect(result.status).toBe('NOT_FOUND');
  });

  it('returns RECALLED for recalled serial', async () => {
    strapi.entityService.findOne.mockResolvedValue({
      serial_number: 'TM987654321',
      status: 'recalled',
    });

    const result = await validateSerial(strapi, 'TM987654321');
    expect(result.status).toBe('RECALLED');
  });
});
```

---

## 5. Test Data & Mocking

### 5.1 Mock Service Worker (MSW) Setup

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/products', () => {
    return HttpResponse.json({
      data: [
        { id: 1, name: 'DDR5 VOLTX RGB 32GB', slug: 'ddr5-voltx-rgb-32gb' },
      ],
    });
  }),

  http.post('/api/v1/inquiries', async () => {
    return HttpResponse.json({ id: 123, status: 'submitted' }, { status: 201 });
  }),
];
```

### 5.2 Factory Functions for Test Data

```typescript
// src/test/factories/product.ts
export function createProduct(overrides = {}) {
  return {
    id: 1,
    sku: 'TM-DDR5-32GB-RGB',
    name: 'DDR5 VOLTX RGB 32GB 5600MHz',
    slug: 'ddr5-voltx-rgb-32gb-5600mhz',
    category: 'memory',
    brand_line: 'voltx',
    price: 129.99,
    currency: 'USD',
    specs: { capacity: '32GB', speed: '5600MHz', latency: 'CL36' },
    ...overrides,
  };
}
```

---

## 6. CI Integration

Unit tests run on every PR via GitHub Actions:

```yaml
# .github/workflows/unit-tests.yml
name: Unit Tests
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm vitest run --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

---

## 7. Naming Conventions

| Pattern | Example |
|---------|---------|
| Test file | `{module}.test.ts` or `{module}.spec.ts` |
| Describe block | `describe('moduleName', () => {})` |
| Test case | `it('should [expected behavior] when [condition]', () => {})` |
| Grouped tests | `describe('functionName', () => { it('...') })` |

---

## 8. Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |
| QA Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Canonical Location:** `G - Quality Assurance and Testing/TwinMOSWebsiteUnitTestPlan.md`
