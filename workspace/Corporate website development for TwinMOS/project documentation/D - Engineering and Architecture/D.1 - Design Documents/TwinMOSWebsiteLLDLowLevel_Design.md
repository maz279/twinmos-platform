# TwinMOS Corporate Website — Low-Level Design (LLD)

**Document Reference:** TWN-LLD-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** HLD v1.0, Tech Stack v1.1, BRD v3.0

---

## Table of Contents

1. [Frontend Module Design](#1-frontend-module-design)
2. [Backend Module Design](#2-backend-module-design)
3. [Database Module Design](#3-database-module-design)
4. [API Endpoint Catalog](#4-api-endpoint-catalog)
5. [Service Layer Design](#5-service-layer-design)
6. [Middleware Pipeline](#6-middleware-pipeline)
7. [State Management](#7-state-management)
8. [Caching Strategy](#8-caching-strategy)
9. [File Organization and Naming Conventions](#9-file-organization-and-naming-conventions)
10. [Build and Deployment Pipeline](#10-build-and-deployment-pipeline)

---

## 1. Frontend Module Design

### 1.1 Astro Layout Hierarchy

| Layout | File | Usage | Approx Pages |
|--------|------|-------|--------------|
| Base Layout | `src/layouts/LayoutBase.astro` | All pages (HTML shell, meta, scripts) | All |
| Hero Layout | `src/layouts/LayoutHero.astro` | Homepage, brand pages, solutions, gaming, regional hubs | ~70 |
| Content Layout | `src/layouts/LayoutContent.astro` | About, Technology, Learn Hub, News, Blog | ~150 |
| Product Detail Layout | `src/layouts/LayoutProductDetail.astro` | SKU detail pages | 100+ |
| Legal Layout | `src/layouts/LayoutLegal.astro` | Legal/compliance pages | 34 |
| Form Layout | `src/layouts/LayoutForm.astro` | Contact, Distributor, Warranty, RMA, Job application | 16+ |
| Locator Layout | `src/layouts/LayoutLocator.astro` | Where-to-buy, regional offices | ~10 |
| Catalog Layout | `src/layouts/LayoutCatalog.astro` | Category browsing, dual-axis catalog | ~15 |
| Comparison Layout | `src/layouts/LayoutComparison.astro` | SKU comparison (up to 4) | ~5 |

### 1.2 Layout Inheritance

```
LayoutBase.astro
├── HTML shell (<!DOCTYPE>, <html>, <head>, <body>)
├── Meta tags (SEO, OG, Twitter, canonical, hreflang)
├── Global scripts (Plausible, Sentry, consent manager)
├── CSS imports (Tailwind, global styles)
└── <slot /> (page content)

    LayoutHero.astro extends LayoutBase
    ├── Hero section (full-width, background image/video)
    ├── Breadcrumb navigation
    ├── Main content area
    └── CTA section

    LayoutContent.astro extends LayoutBase
    ├── Article header
    ├── Table of contents (optional)
    ├── Main content (prose styling)
    └── Related content sidebar

    LayoutProductDetail.astro extends LayoutBase
    ├── Product hero (image gallery, key specs)
    ├── Tabbed content (specs, compatibility, reviews)
    ├── Related products
    └── Where-to-buy CTA
```

### 1.3 React Islands Inventory

| Island | Component | Hydration | Phase | Bundle Size |
|--------|-----------|-----------|-------|-------------|
| Header Navigation | `HeaderNavigation.tsx` | `client:idle` | P1 | ~15 KB |
| Language Selector | `LanguageSelector.tsx` | `client:idle` | P1 | ~5 KB |
| Search Bar | `SearchBar.tsx` | `client:visible` | P1 | ~25 KB |
| Cookie Banner | `CookieBanner.tsx` | `client:load` | P1 | ~8 KB |
| Product Filter | `ProductFilter.tsx` | `client:visible` | P1 | ~20 KB |
| Product Compare | `ProductCompare.tsx` | `client:visible` | P1 | ~12 KB |
| Compatibility Finder | `CompatibilityFinder.tsx` | `client:visible` | P1 | ~18 KB |
| Where-to-Buy Locator | `WhereToBuyLocator.tsx` | `client:visible` | P1 | ~30 KB |
| Contact Form | `ContactForm.tsx` | `client:visible` | P1 | ~15 KB |
| Newsletter Signup | `NewsletterSignup.tsx` | `client:idle` | P1 | ~5 KB |
| Warranty Registration | `WarrantyRegistration.tsx` | `client:visible` | P1 | ~12 KB |
| RMA Request | `RMARequest.tsx` | `client:visible` | P2 | ~15 KB |
| Serial Number Check | `SerialNumberCheck.tsx` | `client:visible` | P2 | ~8 KB |
| RGB Visualizer | `RGBVisualizer.tsx` | `client:visible` | P2 | ~35 KB |
| Build Submission | `BuildSubmission.tsx` | `client:visible` | P2 | ~10 KB |
| Chatwoot Widget | `ChatwootWidget.tsx` | `client:visible` | P2 | ~10 KB |
| Cart Badge | `CartBadge.tsx` | `server:defer` | P3 | ~5 KB |
| Checkout Flow | `CheckoutFlow.tsx` | `client:load` | P3 | ~40 KB |

**Total JS Budget:** ~150 KB (all islands, lazy-loaded)

### 1.4 Component Composition Patterns

**Atomic Design Methodology:**

```
atoms/          # Smallest units (Button, Input, Label, Icon)
molecules/      # Combinations of atoms (SearchField, FormField, Card)
organisms/      # Complex components (Header, Footer, ProductCard, FilterPanel)
templates/      # Page layouts (LayoutHero, LayoutContent)
pages/          # Page components (Astro pages)
```

**Example: Product Card Molecule**

```tsx
// src/components/molecules/ProductCard.tsx
interface ProductCardProps {
  sku: string;
  name: string;
  category: string;
  image: string;
  specs: Record<string, string>;
  href: string;
}

export function ProductCard({ sku, name, category, image, specs, href }: ProductCardProps) {
  return (
    <article className="group relative flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg">
      <a href={href} className="block">
        <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
          <img src={image} alt={name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{sku}</p>
        <dl className="mt-2 space-y-1">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <dt className="text-gray-500">{key}</dt>
              <dd className="font-medium text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </a>
      <div className="mt-4 flex gap-2">
        <Button variant="primary" size="sm">View Details</Button>
        <Button variant="outline" size="sm">Compare</Button>
      </div>
    </article>
  );
}
```

### 1.5 Page Template to Content Mapping

| Template | Content Types | Count |
|----------|--------------|-------|
| LayoutHero | Homepage, brand pages (/voltx, /elite), solutions (/solutions/*), gaming (/gaming), regional (/regional/*) | ~70 |
| LayoutContent | About (/about/*), Technology (/technology/*), Learn (/learn/*), News (/news/*), Press (/about/press) | ~150 |
| LayoutProductDetail | SKU pages (/products/*) | 100+ |
| LayoutLegal | Legal, privacy, terms (/legal/*, /privacy, /terms) | 34 |
| LayoutForm | Contact, distributor, warranty, RMA, careers (/contact, /distributors/apply, /support/warranty, /support/rma, /careers/apply) | 16+ |
| LayoutLocator | Where-to-buy, offices (/where-to-buy, /contact/offices) | ~10 |
| LayoutCatalog | Category pages (/products/memory, /products/ssd, etc.) | ~15 |
| LayoutComparison | Comparison tool (/compare) | ~5 |

---

## 2. Backend Module Design

### 2.1 Strapi API Extensions Structure

```
src/api/
├── product/
│   ├── controllers/product.js
│   ├── services/product.js
│   ├── routes/product.js
│   └── content-types/product/schema.json
├── category/
│   ├── controllers/category.js
│   ├── services/category.js
│   └── content-types/category/schema.json
├── form-submission/
│   ├── controllers/form-submission.js
│   ├── services/form-submission.js
│   ├── routes/form-submission.js
│   └── content-types/form-submission/schema.json
├── compatibility/
│   ├── controllers/compatibility.js
│   ├── services/compatibility.js
│   └── content-types/compatibility/schema.json
├── distributor/
│   ├── controllers/distributor.js
│   ├── services/distributor.js
│   └── content-types/distributor/schema.json
├── retailer/
│   ├── controllers/retailer.js
│   ├── services/retailer.js
│   └── content-types/retailer/schema.json
├── news-article/
│   ├── controllers/news-article.js
│   ├── services/news-article.js
│   └── content-types/news-article/schema.json
├── rma-request/
│   ├── controllers/rma-request.js
│   ├── services/rma-request.js
│   └── content-types/rma-request/schema.json
├── warranty-registration/
│   ├── controllers/warranty-registration.js
│   ├── services/warranty-registration.js
│   └── content-types/warranty-registration/schema.json
├── serial-number/
│   ├── controllers/serial-number.js
│   ├── services/serial-number.js
│   └── content-types/serial-number/schema.json
└── ... (additional collections)
```

### 2.2 Controller Pattern

```javascript
// src/api/product/controllers/product.js
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;
    
    // Apply default population for product detail
    const populatedQuery = {
      ...query,
      populate: {
        category: true,
        brand: true,
        specs: true,
        images: true,
        compatibility: true,
        ...query.populate
      }
    };
    
    const { data, meta } = await super.find({ ...ctx, query: populatedQuery });
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    
    const entity = await strapi.service('api::product.product').findOne(id, {
      populate: {
        category: true,
        brand: true,
        specs: true,
        images: true,
        compatibility: { motherboard: true },
        relatedProducts: true
      }
    });
    
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  }
}));
```

### 2.3 Service Layer Pattern

```javascript
// src/api/form-submission/services/form-submission.js
'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::form-submission.form-submission', ({ strapi }) => ({
  async create(data) {
    // Validate form data
    const validatedData = await this.validateFormData(data);
    
    // Create submission
    const submission = await super.create({ data: validatedData });
    
    // Trigger post-creation workflows
    await strapi.service('api::form-submission.form-submission').postCreateWorkflows(submission);
    
    return submission;
  },

  async validateFormData(data) {
    const { formType } = data;
    
    const validators = {
      contact: ['name', 'email', 'subject', 'message'],
      distributor: ['companyName', 'country', 'email', 'phone', 'territory', 'experience'],
      warranty: ['productSku', 'serialNumber', 'purchaseDate', 'retailer', 'proofOfPurchase'],
      rma: ['productSku', 'serialNumber', 'issueDescription', 'contactInfo']
    };
    
    const required = validators[formType] || [];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return data;
  },

  async postCreateWorkflows(submission) {
    // Send confirmation email
    await strapi.service('email::resend').sendConfirmation(submission);
    
    // Post to CRM
    await strapi.service('integration::crm').createLead(submission);
    
    // Send Slack notification
    await strapi.service('notification::slack').sendFormAlert(submission);
  }
}));
```

### 2.4 Lifecycle Hooks

```javascript
// src/api/product/content-types/product/lifecycles.js
'use strict';

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index in MeiliSearch
    await strapi.service('plugin::meilisearch.meilisearch').addOrUpdateObject(
      'product',
      result
    );
    
    // Invalidate ISR cache
    await strapi.service('cache::cloudflare').purgeTag(`product:${result.id}`);
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Re-index in MeiliSearch
    await strapi.service('plugin::meilisearch.meilisearch').addOrUpdateObject(
      'product',
      result
    );
    
    // Invalidate ISR cache
    await strapi.service('cache::cloudflare').purgeTag(`product:${result.id}`);
    await strapi.service('cache::cloudflare').purgeTag(`category:${result.category?.id}`);
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove from MeiliSearch
    await strapi.service('plugin::meilisearch.meilisearch').deleteObject(
      'product',
      result.id
    );
    
    // Invalidate cache
    await strapi.service('cache::cloudflare').purgeTag(`product:${result.id}`);
  }
};
```

---

## 3. Database Module Design

### 3.1 Schema Modules

| Module | Collections | Purpose |
|--------|-------------|---------|
| **Catalog** | product, category, brand, spec_group, spec_value | Product catalog and specifications |
| **Compatibility** | compatibility_entry, motherboard, qvl_list | QVL and compatibility data |
| **Distribution** | distributor, retailer, territory | Partner and retailer network |
| **Forms** | form_submission, form_template | Form submissions and templates |
| **Support** | rma_request, warranty_registration, support_ticket | Customer support workflows |
| **Content** | content_page, news_article, regional_page, legal_page | CMS content |
| **Users** | admin_user, partner_user, newsletter_subscriber | User management |
| **Commerce** | order, cart, payment (P3) | E-commerce data |
| **System** | audit_log, redirect, sitemap_entry | System operations |

### 3.2 Entity Relationship Detail

```
product ||--o{ product_image : has
product ||--|| category : belongs_to
product ||--|| brand : belongs_to
product ||--o{ spec_value : has
product ||--o{ compatibility_entry : compatible_with
product ||--o{ related_product : related_to

category ||--o{ product : contains
category ||--|| category : parent_of

brand ||--o{ product : manufactures

spec_group ||--o{ spec_value : contains
spec_value ||--|| spec_group : belongs_to
spec_value ||--|| product : describes

compatibility_entry ||--|| product : tests
compatibility_entry ||--|| motherboard : on
motherboard ||--o{ compatibility_entry : tested_with

form_submission ||--|| form_template : uses
form_submission ||--o{ form_field_value : contains

distributor ||--|| territory : operates_in
retailer ||--|| distributor : supplied_by
retailer ||--o{ retailer_location : has

rma_request ||--|| warranty_registration : for
warranty_registration ||--|| product : covers
```

---

## 4. API Endpoint Catalog

### 4.1 REST API Endpoints

| Method | Endpoint | Auth | Description | Phase |
|--------|----------|------|-------------|-------|
| GET | `/api/products` | Public | List products (paginated, filterable) | P1 |
| GET | `/api/products/:id` | Public | Get single product with relations | P1 |
| GET | `/api/categories` | Public | List categories | P1 |
| GET | `/api/categories/:id` | Public | Get category with products | P1 |
| GET | `/api/brands` | Public | List brands | P1 |
| GET | `/api/brands/:id` | Public | Get brand with products | P1 |
| GET | `/api/compatibility/search` | Public | Search compatibility by device/MB | P1 |
| GET | `/api/distributors` | Public | List distributors | P1 |
| GET | `/api/retailers` | Public | List retailers (geo-filterable) | P1 |
| POST | `/api/form-submissions` | Public | Submit a form | P1 |
| GET | `/api/news` | Public | List news articles | P1 |
| GET | `/api/news/:id` | Public | Get news article | P1 |
| GET | `/api/search` | Public | Global search (MeiliSearch proxy) | P1 |
| POST | `/api/serial-check` | Public | Check serial authenticity | P2 |
| POST | `/api/rma` | Auth | Create RMA request | P2 |
| GET | `/api/rma/:id` | Auth | Get RMA status | P2 |
| POST | `/api/warranty-register` | Public | Register warranty | P1 |
| GET | `/api/regional-pages` | Public | List regional pages | P1 |
| GET | `/api/regional-pages/:slug` | Public | Get regional page | P1 |
| GET | `/api/content-pages/:slug` | Public | Get content page by slug | P1 |

### 4.2 GraphQL Endpoints (P2)

| Endpoint | Auth | Description |
|----------|------|-------------|
| `/graphql` | Public/Auth | Partner portal queries |

### 4.3 Admin API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/POST/PUT/DELETE | `/admin/api/*` | Admin JWT | Strapi admin API |
| POST | `/admin/login` | None | Admin authentication |
| POST | `/admin/refresh-token` | Refresh token | Token refresh |

---

## 5. Service Layer Design

### 5.1 Service Responsibilities

| Service | Responsibility | Dependencies |
|---------|---------------|--------------|
| `productService` | CRUD, search, filtering, relations | PostgreSQL, MeiliSearch |
| `formService` | Validation, submission, routing | PostgreSQL, Resend, CRM |
| `compatibilityService` | QVL lookup, device matching | PostgreSQL, MeiliSearch |
| `distributorService` | Partner data, geo queries | PostgreSQL |
| `searchService` | MeiliSearch proxy, query building | MeiliSearch |
| `emailService` | Template rendering, delivery | Resend API |
| `crmService` | Lead sync, webhook dispatch | CRM API |
| `cacheService` | Cloudflare cache purge, tag management | Cloudflare API |
| `analyticsService` | Event tracking, consent management | Plausible, GA4 |
| `authService` | JWT issuance, validation, refresh | PostgreSQL |
| `auditService` | Action logging, compliance reporting | PostgreSQL |

### 5.2 Service Interface Example

```typescript
// shared/types/services/product.d.ts
interface ProductService {
  find(params: ProductQueryParams): Promise<PaginatedResult<Product>>;
  findOne(id: string, populate?: string[]): Promise<Product | null>;
  findBySlug(slug: string, locale?: string): Promise<Product | null>;
  search(query: string, filters?: ProductFilters): Promise<SearchResult<Product>>;
  getRelated(productId: string, limit?: number): Promise<Product[]>;
  getCompatibility(productId: string, deviceType?: string): Promise<CompatibilityEntry[]>;
}

interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
  populate?: string[];
  locale?: string;
}
```

---

## 6. Middleware Pipeline

### 6.1 Request Pipeline

```
Incoming Request
    |
    v
[Cloudflare WAF] → DDoS/Bot filtering
    |
    v
[Cloudflare Rate Limit] → Edge rate limiting
    |
    v
[TLS Termination] → TLS 1.3
    |
    v
[Strapi Security Middleware] → CORS, CSP, HSTS
    |
    v
[Strapi Logger Middleware] → Request logging
    |
    v
[Custom JWT Validation] → Token verification
    |
    v
[Custom Rate Limiter] → API rate limiting (100/1000 req/min)
    |
    v
[Custom Error Handler] → RFC 9457 formatting
    |
    v
[Strapi Router] → Route matching
    |
    v
[Controller] → Business logic
    |
    v
[Response] → JSON/Problem Details
```

### 6.2 Middleware Configuration

```javascript
// config/middlewares.js
module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::jwt-validation',
    config: {
      excludedPaths: [
        '/api/auth/local',
        '/api/auth/local/register',
        '/api/products',
        '/api/categories',
        '/api/search',
        '/api/form-submissions'
      ]
    }
  },
  {
    name: 'global::rate-limiter',
    config: {
      public: { windowMs: 60000, maxRequests: 100 },
      authenticated: { windowMs: 60000, maxRequests: 1000 }
    }
  },
  {
    name: 'global::error-handler',
    config: {
      format: 'rfc9457'
    }
  }
];
```

---

## 7. State Management

### 7.1 Client-Side State (Nanostores)

```typescript
// src/stores/cart.ts
import { atom, map } from 'nanostores';

export interface CartItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

export const cartItems = map<Record<string, CartItem>>({});
export const cartTotal = atom<number>(0);

export function addToCart(item: CartItem) {
  const current = cartItems.get();
  if (current[item.sku]) {
    cartItems.setKey(item.sku, {
      ...current[item.sku],
      quantity: current[item.sku].quantity + item.quantity
    });
  } else {
    cartItems.setKey(item.sku, item);
  }
  updateCartTotal();
}

export function removeFromCart(sku: string) {
  cartItems.setKey(sku, undefined);
  updateCartTotal();
}

function updateCartTotal() {
  const items = Object.values(cartItems.get());
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.set(total);
}
```

### 7.2 Server-Side State (Strapi Sessions)

```javascript
// config/plugins.js
module.exports = {
  // Session configuration for admin and partner portal
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET
      },
      refreshToken: {
        enabled: true,
        expiresIn: '7d',
        rotation: true
      }
    }
  }
};
```

### 7.3 Cross-Island Communication

```typescript
// src/stores/ui.ts
import { atom } from 'nanostores';

// Shared across islands for UI state
export const isSearchOpen = atom(false);
export const activeFilters = atom<Record<string, string[]>>({});
export const toastMessages = atom<Array<{ id: string; type: string; message: string }>>([]);

export function showToast(type: string, message: string) {
  const id = Math.random().toString(36).substring(7);
  toastMessages.set([...toastMessages.get(), { id, type, message }]);
  setTimeout(() => {
    toastMessages.set(toastMessages.get().filter(t => t.id !== id));
  }, 5000);
}
```

---

## 8. Caching Strategy

### 8.1 Cache Layers

| Layer | Technology | Scope | TTL | Invalidation |
|-------|-----------|-------|-----|--------------|
| Browser Cache | Cache-Control | Static assets | 1 year | Filename hash |
| Cloudflare Edge | CDN Cache | HTML pages | 1 hour | Webhook purge |
| Cloudflare Edge | CDN Cache | API responses | 5 minutes | Cache-tag purge |
| Redis (P2) | Key-value | API responses | 10 minutes | Key deletion |
| Redis (P2) | Key-value | Sessions | 24 hours | On logout |
| Astro ISR | File system | Rendered pages | 60 seconds | Webhook revalidation |
| MeiliSearch | In-memory | Search indexes | N/A | Real-time updates |

### 8.2 Cache Invalidation Strategy

```javascript
// services/cache-service.js
module.exports = {
  async invalidateProduct(productId) {
    // Purge Cloudflare cache by tag
    await this.purgeCloudflareTag(`product:${productId}`);
    
    // Delete Redis cache keys
    await redis.del(`api:product:${productId}`);
    await redis.del('api:products:list');
    
    // Trigger Astro ISR revalidation
    await this.revalidateAstroPage(`/products/${productId}`);
  },

  async invalidateCategory(categoryId) {
    await this.purgeCloudflareTag(`category:${categoryId}`);
    await redis.del(`api:category:${categoryId}`);
    await this.revalidateAstroPage(`/products`);
  },

  async purgeCloudflareTag(tag) {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tags: [tag] })
    });
  }
};
```

---

## 9. File Organization and Naming Conventions

### 9.1 Frontend Repository Structure

```
twinmos-website-frontend/
├── src/
│   ├── layouts/              # Astro layouts
│   ├── pages/                # File-based routing
│   │   ├── index.astro
│   │   ├── [locale]/
│   │   │   ├── index.astro
│   │   │   ├── products/
│   │   │   │   ├── index.astro
│   │   │   │   ├── [slug].astro
│   │   │   │   └── category/
│   │   │   │       └── [category].astro
│   │   │   ├── about/
│   │   │   ├── support/
│   │   │   ├── contact.astro
│   │   │   └── ...
│   │   └── api/              # API routes
│   │       └── form-submissions.ts
│   ├── components/
│   │   ├── atoms/            # Primitive components
│   │   ├── molecules/        # Composite components
│   │   ├── organisms/        # Complex components
│   │   └── shared/           # Shared layout components
│   ├── islands/              # React islands
│   ├── content/              # Astro Content Layer
│   │   └── website-content/
│   │       └── ...           # 454 markdown files
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── api.ts            # Strapi API client
│   │   ├── search.ts         # MeiliSearch client
│   │   └── i18n.ts           # i18n utilities
│   ├── stores/               # Nanostores
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.config.ts
│   └── types/
│       └── index.ts
├── public/
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── astro.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── ...
```

### 9.2 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Astro layouts | PascalCase + `Layout` suffix | `LayoutHero.astro` |
| Astro pages | kebab-case | `[slug].astro`, `contact.astro` |
| React components | PascalCase | `ProductCard.tsx`, `SearchBar.tsx` |
| React hooks | camelCase + `use` prefix | `useSearch.ts`, `useCart.ts` |
| Utilities | camelCase | `formatDate.ts`, `slugify.ts` |
| Stores | camelCase | `cartItems.ts`, `uiState.ts` |
| API routes | kebab-case | `form-submissions.ts` |
| CSS classes | kebab-case | `product-card`, `hero-section` |
| Tailwind variants | kebab-case | `btn-primary`, `input-error` |

### 9.3 Backend Repository Structure

```
twinmos-website-backend/
├── src/
│   ├── api/                  # API extensions
│   │   ├── product/
│   │   ├── category/
│   │   └── ...
│   ├── extensions/           # Custom plugins
│   ├── middlewares/          # Custom middleware
│   ├── policies/             # Custom policies
│   ├── services/             # Shared services
│   └── config/               # Strapi config
├── config/
│   ├── admin.js
│   ├── api.js
│   ├── database.js
│   ├── middlewares.js
│   ├── plugins.js
│   └── server.js
├── database/
│   └── migrations/
├── public/
│   └── uploads/
├── package.json
└── ...
```

---

## 10. Build and Deployment Pipeline

### 10.1 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Lighthouse CI
        run: npm run lighthouse

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: twinmos-website
          directory: dist
```

### 10.2 Deployment Flow

```
Developer Push
    |
    v
GitHub Actions Triggered
    |
    v
[Lint + Type Check] → ESLint, Prettier, tsc
    |
    v
[Unit Tests] → Vitest
    |
    v
[E2E Tests] → Playwright
    |
    v
[Build] → Astro build
    |
    v
[Lighthouse CI] → Performance audit
    |
    v
[Deploy Preview] → Cloudflare Pages (PR previews)
    |
    v
[Merge to main] → Production deploy
```

### 10.3 Environment Configuration

| Environment | Branch | Frontend | Backend | Database |
|-------------|--------|----------|---------|----------|
| Development | feature/* | Local dev server | Local Docker | Local PostgreSQL |
| Staging | develop | Cloudflare Pages (staging) | Coolify Staging | Staging PostgreSQL |
| Production | main | Cloudflare Pages (production) | Coolify Production | Production PostgreSQL |

### 10.4 Rollback Procedure

1. **Frontend Rollback:** Revert commit → push → Cloudflare Pages auto-deploys previous build
2. **Backend Rollback:** Coolify rollback to previous container image
3. **Database Rollback:** Restore from latest pg_dump + replay WAL to desired point
4. **Full System Rollback:** Restore from Coolify backup (weekly snapshots)
