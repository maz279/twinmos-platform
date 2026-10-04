# TwinMOS Corporate Website — Strapi Collections Specification

**Document Reference:** TWN-STRAPI-COLLECTIONS-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** Tech Stack v1.1, ERD v1.0

---

## 1. Collection Overview

| # | Collection | Type | Records | Phase |
|---|-----------|------|---------|-------|
| 1 | product | Collection | 100+ | P1 |
| 2 | category | Collection | 15+ | P1 |
| 3 | brand | Collection | 5+ | P1 |
| 4 | spec-group | Collection | 10+ | P1 |
| 5 | spec-value | Collection | 500+ | P1 |
| 6 | motherboard | Collection | 500+ | P1 |
| 7 | compatibility-entry | Collection | 1000+ | P1 |
| 8 | distributor | Collection | 50+ | P1 |
| 9 | retailer | Collection | 200+ | P1 |
| 10 | form-submission | Collection | 10K+/yr | P1 |
| 11 | warranty-registration | Collection | 5K+/yr | P1 |
| 12 | rma-request | Collection | 500+/yr | P2 |
| 13 | serial-number | Collection | 1M+ | P2 |
| 14 | news-article | Collection | 100+ | P1 |
| 15 | content-page | Collection | 287 | P1 |
| 16 | regional-page | Collection | 28 | P1 |
| 17 | legal-page | Collection | 34 | P1 |
| 18 | partner-user | Collection | 100+ | P2 |
| 19 | partner-company | Collection | 50+ | P2 |
| 20 | newsletter-subscriber | Collection | 5K+ | P1 |
| 21 | redirect | Collection | 10K+ | P1 |
| 22 | audit-log | Collection | 10K+/yr | P1 |
| 23 | order | Collection | TBD | P3 |
| 24 | build-submission | Collection | 500+ | P2 |

### Single Types

| # | Single Type | Purpose | Phase |
|---|------------|---------|-------|
| 1 | global | Site-wide settings | P1 |
| 2 | homepage | Homepage configuration | P1 |
| 3 | navigation | Header/footer nav structure | P1 |
| 4 | seo-defaults | Default SEO metadata | P1 |
| 5 | cookie-consent | Cookie banner config | P1 |

---

## 2. Content-Type Definitions

### 2.1 Product

```json
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": {
    "singularName": "product",
    "pluralName": "products",
    "displayName": "Product"
  },
  "options": {
    "draftAndPublish": true,
    "softDelete": true
  },
  "pluginOptions": {
    "i18n": { "localized": true }
  },
  "attributes": {
    "sku": {
      "type": "string",
      "required": true,
      "unique": true,
      "maxLength": 100
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "name": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "shortDescription": {
      "type": "text",
      "maxLength": 500,
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "description": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "metaTitle": {
      "type": "string",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "metaDescription": {
      "type": "text",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "ogImage": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "category": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category"
    },
    "brand": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::brand.brand"
    },
    "images": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    },
    "specs": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::spec-value.spec-value",
      "mappedBy": "product"
    },
    "compatibility": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::compatibility-entry.compatibility-entry",
      "mappedBy": "product"
    },
    "relatedProducts": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::product.product"
    },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "published", "archived"],
      "default": "draft",
      "required": true
    },
    "publishedAt": {
      "type": "datetime"
    }
  }
}
```

### 2.2 Category

```json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Category"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": {
    "i18n": { "localized": true }
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "description": {
      "type": "text",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "parent": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category"
    },
    "children": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::category.category",
      "mappedBy": "parent"
    },
    "products": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::product.product",
      "mappedBy": "category"
    },
    "sortOrder": {
      "type": "integer",
      "default": 0
    },
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "icon": {
      "type": "string",
      "maxLength": 100
    },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "published", "archived"],
      "default": "published"
    }
  }
}
```

### 2.3 Form Submission

```json
{
  "kind": "collectionType",
  "collectionName": "form_submissions",
  "info": {
    "singularName": "form-submission",
    "pluralName": "form-submissions",
    "displayName": "Form Submission"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "formType": {
      "type": "enumeration",
      "enum": [
        "contact",
        "distributor",
        "warranty",
        "rma",
        "newsletter",
        "job",
        "build"
      ],
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["new", "processing", "resolved", "spam"],
      "default": "new"
    },
    "data": {
      "type": "json",
      "required": true
    },
    "customerEmail": { "type": "email" },
    "customerName": { "type": "string" },
    "customerPhone": { "type": "string" },
    "customerCountry": { "type": "string" },
    "ipAddress": { "type": "string" },
    "userAgent": { "type": "text" },
    "turnstileToken": { "type": "string" },
    "sourcePage": { "type": "string" },
    "crmLeadId": { "type": "string" },
    "emailSentAt": { "type": "datetime" },
    "notes": { "type": "richtext" }
  }
}
```

### 2.4 Content Page (with Dynamic Zones)

```json
{
  "kind": "collectionType",
  "collectionName": "content_pages",
  "info": {
    "singularName": "content-page",
    "pluralName": "content-pages",
    "displayName": "Content Page"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": {
    "i18n": { "localized": true }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "metaTitle": {
      "type": "string",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "metaDescription": {
      "type": "text",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "ogImage": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "excerpt": {
      "type": "text",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "blocks": {
      "type": "dynamiczone",
      "components": [
        "page.hero",
        "page.text-image",
        "page.feature-grid",
        "page.testimonials",
        "page.cta",
        "page.faq",
        "page.stats",
        "page.team",
        "page.timeline"
      ],
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "published", "archived"],
      "default": "draft"
    },
    "publishedAt": { "type": "datetime" },
    "sortOrder": { "type": "integer", "default": 0 }
  }
}
```

---

## 3. Component Definitions

### 3.1 Page Builder Components

**Hero Component:**
```json
{
  "collectionName": "components_page_heroes",
  "info": {
    "displayName": "Hero",
    "icon": "image",
    "description": "Full-width hero section"
  },
  "category": "page",
  "attributes": {
    "title": { "type": "string", "required": true },
    "subtitle": { "type": "text" },
    "backgroundImage": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "backgroundVideo": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["videos"]
    },
    "ctaText": { "type": "string" },
    "ctaLink": { "type": "string" },
    "alignment": {
      "type": "enumeration",
      "enum": ["left", "center", "right"],
      "default": "center"
    }
  }
}
```

**Text + Image Component:**
```json
{
  "collectionName": "components_page_text_images",
  "info": {
    "displayName": "Text + Image",
    "icon": "layout"
  },
  "category": "page",
  "attributes": {
    "title": { "type": "string" },
    "content": { "type": "richtext" },
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "imagePosition": {
      "type": "enumeration",
      "enum": ["left", "right"],
      "default": "right"
    },
    "ctaText": { "type": "string" },
    "ctaLink": { "type": "string" }
  }
}
```

**Feature Grid Component:**
```json
{
  "collectionName": "components_page_feature_grids",
  "info": {
    "displayName": "Feature Grid",
    "icon": "grid"
  },
  "category": "page",
  "attributes": {
    "title": { "type": "string" },
    "features": {
      "type": "component",
      "repeatable": true,
      "component": "page.feature-item"
    },
    "columns": {
      "type": "enumeration",
      "enum": ["2", "3", "4"],
      "default": "3"
    }
  }
}
```

**Feature Item Component:**
```json
{
  "collectionName": "components_page_feature_items",
  "info": {
    "displayName": "Feature Item",
    "icon": "star"
  },
  "category": "page",
  "attributes": {
    "icon": { "type": "string" },
    "title": { "type": "string", "required": true },
    "description": { "type": "text" }
  }
}
```

---

## 4. Single Types

### 4.1 Global Settings

```json
{
  "kind": "singleType",
  "collectionName": "globals",
  "info": {
    "singularName": "global",
    "pluralName": "globals",
    "displayName": "Global Settings"
  },
  "options": { "draftAndPublish": false },
  "pluginOptions": {
    "i18n": { "localized": true }
  },
  "attributes": {
    "siteName": {
      "type": "string",
      "default": "TwinMOS",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "siteDescription": {
      "type": "text",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    },
    "logo": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "favicon": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "socialLinks": {
      "type": "component",
      "repeatable": true,
      "component": "shared.social-link"
    },
    "contactEmail": { "type": "email" },
    "contactPhone": { "type": "string" },
    "contactAddress": { "type": "text" },
    "copyrightText": {
      "type": "string",
      "pluginOptions": {
        "i18n": { "localized": true }
      }
    }
  }
}
```

---

## 5. Plugin Configuration

### 5.1 MeiliSearch Plugin

```javascript
// config/plugins.js
module.exports = {
  meilisearch: {
    config: {
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_API_KEY,
      product: {
        indexName: 'products',
        entriesQuery: { locale: 'all' },
        settings: {
          searchableAttributes: ['name', 'shortDescription', 'sku'],
          filterableAttributes: ['category.name', 'brand.name', 'status', 'locale'],
          sortableAttributes: ['name', 'createdAt'],
          rankingRules: [
            'words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'
          ]
        }
      },
      'news-article': {
        indexName: 'news',
        settings: {
          searchableAttributes: ['title', 'excerpt', 'content'],
          filterableAttributes: ['category', 'tags', 'status', 'locale']
        }
      },
      'content-page': {
        indexName: 'content',
        settings: {
          searchableAttributes: ['title', 'excerpt', 'blocks'],
          filterableAttributes: ['status', 'locale']
        }
      }
    }
  }
};
```

### 5.2 Sitemap Plugin

```javascript
module.exports = {
  sitemap: {
    enabled: true,
    config: {
      cron: '0 0 * * *',
      limit: 45000,
      xsl: true,
      autoGenerate: true,
      caching: { enabled: true, duration: 86400000 },
      excludedTypes: ['form-submission', 'audit-log']
    }
  }
};
```

---

## 6. Lifecycle Hooks

### 6.1 Product Lifecycle

```javascript
// src/api/product/content-types/product/lifecycles.js
'use strict';

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    await strapi.plugin('meilisearch').service('meilisearch')
      .addOrUpdateObject('product', result);
    await strapi.service('cache').invalidateProduct(result.id);
    await strapi.service('audit').log({
      action: 'product.created',
      entityType: 'product',
      entityId: result.id,
      userId: result.createdBy?.id
    });
  },

  async afterUpdate(event) {
    const { result } = event;
    await strapi.plugin('meilisearch').service('meilisearch')
      .addOrUpdateObject('product', result);
    await strapi.service('cache').invalidateProduct(result.id);
    await strapi.service('audit').log({
      action: 'product.updated',
      entityType: 'product',
      entityId: result.id,
      userId: result.updatedBy?.id,
      changes: event.params.data
    });
  },

  async afterDelete(event) {
    const { result } = event;
    await strapi.plugin('meilisearch').service('meilisearch')
      .deleteObject('product', result.id);
    await strapi.service('cache').invalidateProduct(result.id);
    await strapi.service('audit').log({
      action: 'product.deleted',
      entityType: 'product',
      entityId: result.id
    });
  }
};
```

### 6.2 Form Submission Lifecycle

```javascript
// src/api/form-submission/content-types/form-submission/lifecycles.js
'use strict';

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    await strapi.service('email').sendFormConfirmation(result);
    await strapi.service('crm').createLead(result);
    await strapi.service('notification').slackFormAlert(result);
    await strapi.service('audit').log({
      action: 'form.submitted',
      entityType: 'form-submission',
      entityId: result.id
    });
  }
};
```

---

## 7. Permission Matrix

### 7.1 Role Permissions

| Collection | Super Admin | Admin | Editor | Author | Viewer | Partner |
|-----------|:-----------:|:-----:|:------:|:------:|:------:|:-------:|
| **Product** | | | | | | |
| Create | Yes | Yes | No | No | No | No |
| Read | Yes | Yes | Yes | Yes | Yes | Yes |
| Update | Yes | Yes | Yes | No | No | No |
| Delete | Yes | Yes | No | No | No | No |
| Publish | Yes | Yes | Yes | No | No | No |
| **Form Submission** | | | | | | |
| Create | No | No | No | No | No | No |
| Read | Yes | Yes | Yes | No | No | No |
| Update | Yes | Yes | Yes | No | No | No |
| Delete | Yes | Yes | No | No | No | No |
| **Content Page** | | | | | | |
| Create | Yes | Yes | Yes | Yes | No | No |
| Read | Yes | Yes | Yes | Yes | Yes | Yes |
| Update | Yes | Yes | Yes | Own | No | No |
| Delete | Yes | Yes | Yes | Own | No | No |
| Publish | Yes | Yes | Yes | No | No | No |
| **Partner User** | | | | | | |
| Create | Yes | Yes | No | No | No | No |
| Read | Yes | Yes | Yes | No | No | Own |
| Update | Yes | Yes | No | No | No | Own |
| Delete | Yes | Yes | No | No | No | No |
| **Audit Log** | | | | | | |
| Read | Yes | Yes | No | No | No | No |
