# TwinMOS Corporate Website — Database Indexing Strategy

**Document Reference:** TWN-INDEX-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** Tech Stack v1.1, ERD v1.0, BRD v3.0

---

## Table of Contents

1. [Indexing Strategy Overview](#1-indexing-strategy-overview)
2. [PostgreSQL Indexing](#2-postgresql-indexing)
3. [MeiliSearch Indexing](#3-meilisearch-indexing)
4. [Query Performance Targets](#4-query-performance-targets)
5. [Index Maintenance](#5-index-maintenance)
6. [Monitoring and Optimization](#6-monitoring-and-optimization)

---

## 1. Indexing Strategy Overview

### 1.1 Indexing Layers

| Layer | Technology | Purpose | Data Volume |
|-------|-----------|---------|-------------|
| Primary Database | PostgreSQL 16 | ACID transactions, relational queries | < 50 GB |
| Search Engine | MeiliSearch 1.13 | Full-text search, faceting, typeahead | < 5 GB |
| Application Cache | Redis (P2) | Hot query cache, sessions, rate limits | < 1 GB |
| CDN Cache | Cloudflare | Static content, API responses | Edge-distributed |

### 1.2 Indexing Principles

1. **Index for read performance**: All frequent read queries must use indexes
2. **Minimize write overhead**: Balance read speed vs. write speed
3. **Covering indexes**: Include commonly queried columns to avoid table lookups
4. **Partial indexes**: Index subsets for specialized queries
5. **Composite indexes**: Match query patterns with column ordering

---

## 2. PostgreSQL Indexing

### 2.1 Core Product Catalog Indexes

```sql
-- Product table indexes
CREATE INDEX idx_product_brand ON products(brand_id);
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_status ON products(status) WHERE status = 'published';
CREATE INDEX idx_product_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_product_slug ON products(slug);
CREATE INDEX idx_product_sku ON products(sku);
CREATE INDEX idx_product_release ON products(release_date DESC);

-- Composite index for catalog listing
CREATE INDEX idx_product_catalog ON products(status, category_id, brand_id, release_date DESC);

-- Full-text search on product name/description (fallback for MeiliSearch)
CREATE INDEX idx_product_fts ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(short_description, '')));
```

### 2.2 Content and Editorial Indexes

```sql
-- News articles
CREATE INDEX idx_news_status ON news_articles(status, publish_date DESC);
CREATE INDEX idx_news_category ON news_articles(category, publish_date DESC);
CREATE INDEX idx_news_slug ON news_articles(slug);

-- Events
CREATE INDEX idx_events_date ON events(start_date, end_date);
CREATE INDEX idx_events_status ON events(status, start_date);

-- KB Articles
CREATE INDEX idx_kb_category ON kb_articles(category);
CREATE INDEX idx_kb_tags ON kb_articles USING gin(tags);
```

### 2.3 Support and Service Indexes

```sql
-- Warranty registrations
CREATE INDEX idx_warranty_serial ON warranty_registrations(serial_number);
CREATE INDEX idx_warranty_email ON warranty_registrations(owner_email);
CREATE INDEX idx_warranty_product ON warranty_registrations(product_id);

-- RMA requests
CREATE INDEX idx_rma_number ON rma_requests(rma_number);
CREATE INDEX idx_rma_status ON rma_requests(status, created_at DESC);
CREATE INDEX idx_rma_email ON rma_requests(customer_email);

-- Retailers
CREATE INDEX idx_retailer_country ON retailers(country_code);
CREATE INDEX idx_retailer_type ON retailers(type, country_code);
CREATE INDEX idx_retailer_location ON retailers USING gist(ll_to_earth(lat, lng));

-- Valid serials (P2)
CREATE INDEX idx_serial_number ON valid_serials(serial_number);
CREATE INDEX idx_serial_product ON valid_serials(product_id);
```

### 2.4 Form and Submission Indexes

```sql
-- Form submissions
CREATE INDEX idx_form_type ON form_submissions(type, created_at DESC);
CREATE INDEX idx_form_status ON form_submissions(status, priority);
CREATE INDEX idx_form_email ON form_submissions(email);
CREATE INDEX idx_form_ticket ON form_submissions(ticket_number);

-- Newsletter subscribers
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE UNIQUE INDEX idx_newsletter_email_unique ON newsletter_subscribers(email) WHERE deleted_at IS NULL;
```

### 2.5 Audit and System Indexes

```sql
-- Audit logs
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, resource_type);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Redirects
CREATE INDEX idx_redirect_from ON redirects(from_path);
CREATE INDEX idx_redirect_active ON redirects(from_path) WHERE is_active = true;
```

### 2.6 Partial and Expression Indexes

```sql
-- Published content only (excludes drafts)
CREATE INDEX idx_product_published ON products(created_at DESC) WHERE status = 'published';

-- Active retailers only
CREATE INDEX idx_retailer_active ON retailers(country_code) WHERE is_authorized = true;

-- Lowercase email lookup
CREATE INDEX idx_user_email_lower ON cms_users(LOWER(email));
```

---

## 3. MeiliSearch Indexing

### 3.1 Index Configuration

```javascript
// MeiliSearch index settings
const indexSettings = {
  products: {
    searchableAttributes: [
      'name',
      'short_description',
      'long_description',
      'keywords',
      'sku',
      'ean',
      'mpn'
    ],
    displayedAttributes: [
      'id', 'name', 'slug', 'sku', 'hero_image',
      'category', 'brand_line', 'short_description', 'status'
    ],
    filterableAttributes: [
      'category', 'brand_line', 'status', 'is_featured', 'is_new',
      'capacity', 'speed', 'form_factor', 'rgb'
    ],
    sortableAttributes: [
      'price', 'release_date', 'name'
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'release_date:desc'
    ],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 }
    },
    synonyms: {
      'ram': ['memory', 'dram'],
      'memory': ['ram', 'dram'],
      'ssd': ['solid state drive', 'storage'],
      'ddr5': ['ddr5 memory', 'ddr5 ram']
    }
  },

  articles: {
    searchableAttributes: ['title', 'excerpt', 'body', 'tags'],
    filterableAttributes: ['category', 'author', 'tags', 'status'],
    sortableAttributes: ['publish_date', 'title'],
  },

  kb_items: {
    searchableAttributes: ['title', 'body', 'tags', 'category'],
    filterableAttributes: ['category', 'tags'],
    sortableAttributes: ['helpful_count', 'view_count'],
  },

  retailers: {
    searchableAttributes: ['company_name', 'city', 'country', 'address'],
    filterableAttributes: ['country', 'type', 'is_authorized', 'is_featured'],
    sortableAttributes: ['company_name'],
  },

  compatibility: {
    searchableAttributes: ['device_brand', 'device_model'],
    filterableAttributes: ['device_type', 'qvl_status', 'product_id'],
  }
};
```

### 3.2 Indexing Triggers

| Event | Source | Action |
|-------|--------|--------|
| Product created | Strapi lifecycle | Index product document |
| Product updated | Strapi lifecycle | Update product document |
| Product deleted | Strapi lifecycle | Remove from index |
| Product published | Strapi webhook | Re-index with status change |
| Bulk import | Import script | Batch index (100 docs/batch) |

### 3.3 Multi-Language Indexing

| Locale | Index Suffix | Tokenizer |
|--------|-------------|-----------|
| en | _en | English |
| ar | _ar | Arabic (RTL) |
| hi | _hi | Devanagari |
| ru | _ru | Cyrillic |
| zh-CN | _zh | Chinese (CJK) |
| fr | _fr | French |

---

## 4. Query Performance Targets

### 4.1 PostgreSQL Query Targets

| Query Type | Target | Maximum | Index Used |
|------------|--------|---------|------------|
| Product by SKU | < 5 ms | 20 ms | idx_product_sku |
| Product list (paginated) | < 50 ms | 200 ms | idx_product_catalog |
| Product search (LIKE) | < 100 ms | 500 ms | idx_product_fts |
| News list by category | < 30 ms | 100 ms | idx_news_category |
| Retailer by country | < 20 ms | 50 ms | idx_retailer_country |
| Warranty by serial | < 10 ms | 30 ms | idx_warranty_serial |
| Form submissions by type | < 50 ms | 200 ms | idx_form_type |
| Audit log by user | < 100 ms | 500 ms | idx_audit_user |

### 4.2 MeiliSearch Query Targets

| Query Type | Target | Maximum |
|------------|--------|---------|
| Product search | < 50 ms | 100 ms |
| Auto-suggest | < 20 ms | 50 ms |
| Faceted filter | < 30 ms | 100 ms |
| Retailer search | < 30 ms | 100 ms |
| KB article search | < 50 ms | 100 ms |

---

## 5. Index Maintenance

### 5.1 PostgreSQL Maintenance

| Task | Frequency | Command |
|------|-----------|---------|
| Analyze tables | Daily (auto) | AUTOVACUUM |
| Vacuum dead tuples | Daily (auto) | AUTOVACUUM |
| Reindex | Monthly | REINDEX TABLE CONCURRENTLY |
| Check bloat | Weekly | pgstattuple extension |
| Update statistics | Daily | ANALYZE |

### 5.2 MeiliSearch Maintenance

| Task | Frequency | Command |
|------|-----------|---------|
| Dump index | Daily | POST /dumps |
| Update settings | On change | PUT /indexes/{id}/settings |
| Delete old documents | Monthly | DELETE /indexes/{id}/documents |
| Monitor index size | Weekly | GET /stats |

---

## 6. Monitoring and Optimization

### 6.1 PostgreSQL Monitoring

```sql
-- Slow query log (queries > 100ms)
ALTER SYSTEM SET log_min_duration_statement = 100;

-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top slow queries
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Index usage statistics
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 6.2 MeiliSearch Monitoring

```bash
# Index statistics
curl -X GET "http://localhost:7700/indexes/products/stats"

# Health check
curl -X GET "http://localhost:7700/health"

# Index size
curl -X GET "http://localhost:7700/indexes/products/stats" | jq ".numberOfDocuments"
```

### 6.3 Optimization Runbook

| Symptom | Diagnosis | Action |
|---------|-----------|--------|
| Query > 200ms | EXPLAIN ANALYZE | Add missing index |
| Sequential scan | pg_stat_user_tables | Create index or optimize query |
| High buffer reads | pg_stat_statements | Increase shared_buffers |
| Index bloat > 30% | pgstattuple | REINDEX CONCURRENTLY |
| MeiliSearch slow | /stats endpoint | Review ranking rules |
| Cache miss rate high | Redis INFO | Adjust cache TTL |

---

**Document End**
