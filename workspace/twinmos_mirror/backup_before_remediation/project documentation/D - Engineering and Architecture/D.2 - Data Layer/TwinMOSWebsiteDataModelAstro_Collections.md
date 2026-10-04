# TwinMOS Website — Astro Content Collections Schema

**Document Reference:** TWN-ENG-D2-004
**Version:** 1.0
**Status:** FINAL
**Date:** 1 May 2026
**Owner:** Frontend Lead / Full-Stack Developer
**Audience:** Unisoft Engineering, TwinMOS IT

---

## 1. Overview

This document defines the Astro Content Collections schema for the TwinMOS corporate website. Astro 5 Content Layer provides type-safe, Zod-validated content access for 454 markdown files and remote CMS data fetched at build time.

### 1.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Type Safety** | Zod schemas generate TypeScript types |
| **Validation** | All frontmatter validated at build |
| **Localization** | Locale-specific collections with fallback |
| **Performance** | Build-time data loading, zero runtime JS |
| **CMS Integration** | Remote Strapi data fetched via loader |

---

## 2. Base Schema Definitions

### 2.1 Core Zod Imports

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { strapiLoader } from '@util/strapi-loader';
```

### 2.2 Shared Schema Components

```typescript
// Shared SEO schema
const seoSchema = z.object({
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  og_image: z.string().url().optional(),
  canonical_url: z.string().url().optional(),
  no_index: z.boolean().default(false),
});

// Shared locale schema
const localeSchema = z.object({
  locale: z.enum(['en', 'ar', 'bn', 'hi', 'ru', 'zh-CN', 'fr', 'es', 'pt', 'de']).default('en'),
});

// Shared timestamp schema
const timestampSchema = z.object({
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});
```

---

## 3. Content Collection Definitions

### 3.1 Pages Collection

```typescript
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    template: z.enum(['default', 'hero', 'product', 'legal', 'form']).default('default'),
    sort_order: z.number().int().default(0),
    is_active: z.boolean().default(true),
  }).merge(seoSchema).merge(localeSchema).merge(timestampSchema),
});
```

**File location:** `src/content/pages/**/*.md`
**Entry count:** ~287 content pages

### 3.2 Products Collection

```typescript
const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string().max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    category: z.string(),
    brand: z.string().default('TwinMOS'),
    description: z.string(),
    features: z.array(z.string()).default([]),
    warranty: z.string().optional(),
    is_active: z.boolean().default(true),
  }).merge(seoSchema).merge(localeSchema).merge(timestampSchema),
});
```

**File location:** `src/content/products/**/*.md`
**Entry count:** ~100+ SKU detail pages

### 3.3 News Collection

```typescript
const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    excerpt: z.string().max(500),
    author: z.string(),
    category: z.string(),
    cover_image: z.string().url().optional(),
    published_at: z.coerce.date(),
    is_published: z.boolean().default(false),
  }).merge(seoSchema).merge(localeSchema).merge(timestampSchema),
});
```

**File location:** `src/content/news/**/*.md`
**Entry count:** ~50 news articles

### 3.4 Regional Pages Collection

```typescript
const regionalCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    country_code: z.string().length(2),
    region_name: z.string().max(100),
    is_active: z.boolean().default(true),
  }).merge(seoSchema).merge(localeSchema).merge(timestampSchema),
});
```

**File location:** `src/content/regional/**/*.md`
**Entry count:** ~28 regional landing pages

### 3.5 Legal Pages Collection

```typescript
const legalCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    last_updated: z.coerce.date(),
    jurisdiction: z.string().optional(),
    is_active: z.boolean().default(true),
  }).merge(seoSchema).merge(localeSchema).merge(timestampSchema),
});
```

**File location:** `src/content/legal/**/*.md`
**Entry count:** ~34 legal pages

---

## 4. Remote CMS Data Loader

### 4.1 Strapi Loader Configuration

```typescript
// src/content/config.ts
const strapiProducts = defineCollection({
  loader: strapiLoader({
    endpoint: '/api/products',
    apiToken: import.meta.env.STRAPI_API_TOKEN,
    baseUrl: import.meta.env.STRAPI_URL,
    populate: ['category', 'brand', 'skus', 'images'],
  }),
  schema: z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    slug: z.string(),
    category: z.object({ name: z.string() }),
    skus: z.array(z.object({
      sku_code: z.string(),
      specs: z.record(z.any()),
    })),
  }),
});
```

### 4.2 Export Collections

```typescript
export const collections = {
  pages: pagesCollection,
  products: productsCollection,
  news: newsCollection,
  regional: regionalCollection,
  legal: legalCollection,
  strapiProducts: strapiProducts,
};
```

---

## 5. TypeScript Type Generation

Astro automatically generates types from `src/content/config.ts`:

```typescript
// Usage in components
import { getCollection, getEntry } from 'astro:content';

// Type-safe collection query
const allProducts = await getCollection('products');
// Returns: CollectionEntry<'products'>[]

// Type-safe single entry
const product = await getEntry('products', 'volt-x-ddr5');
// Returns: CollectionEntry<'products'> | undefined
```

---

## 6. Build-Time vs Runtime Data Sources

| Data Source | Timing | Collection | Use Case |
|-------------|--------|------------|----------|
| Markdown files | Build-time | pages, products, news, regional, legal | Static content, SEO |
| Strapi API | Build-time | strapiProducts, strapiNews | Dynamic CMS content |
| MeiliSearch | Runtime | N/A (API call) | Search, filtering |
| PostgreSQL | Runtime | N/A (API call) | Forms, user data |

---

## 7. Validation Rules

| Rule | Schema | Error Action |
|------|--------|------------|
| Required title | `z.string().min(1)` | Build fails with file path |
| Valid slug | `z.string().regex(/^[a-z0-9-]+$/)` | Build fails with invalid slug |
| Max meta title | `z.string().max(70)` | Truncation warning |
| Valid locale | `z.enum([...])` | Falls back to 'en' |
| Valid date | `z.coerce.date()` | Build fails with invalid date |

---

## Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Frontend Lead | (TBC) | _______________ | _________ |
| Full-Stack Developer | (TBC) | _______________ | _________ |
