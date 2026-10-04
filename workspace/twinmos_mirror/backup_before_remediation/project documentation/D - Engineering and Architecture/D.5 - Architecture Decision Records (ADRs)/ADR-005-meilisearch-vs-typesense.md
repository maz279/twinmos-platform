# ADR-005: Search Engine — MeiliSearch vs Typesense

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-005 |
| **Date** | 2026-04-01 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §7.1 |

---

## 1. Context

The TwinMOS website requires a full-text search engine for:
- **Product search:** 100+ SKUs with specs, brands, part numbers
- **Site-wide search:** Products + news articles + content pages
- **Compatibility finder autocomplete:** Motherboard model/make suggestions
- **Phase 2:** Arabic-language search (RTL, Arabic tokenisation)
- **Phase 3:** Chinese-Simplified (ZH-CN) search

The search engine must be **self-hostable** (no SaaS recurring cost), support **multilingual content** (9 locales), and integrate cleanly with the Astro + Strapi stack.

---

## 2. Decision

**We will use MeiliSearch 1.13.x, self-hosted on the existing Hetzner CX32 VPS via Coolify, with zero incremental hosting cost.**

---

## 3. Rationale

### Decisive Factor: Arabic + Chinese Language Support

The **single most important factor** in this decision is Phase 2/3 multilingual search:

| Language | MeiliSearch | Typesense |
|----------|------------|----------|
| **Arabic** | **Native tokeniser + stemming** | Limited |
| **Chinese (ZH-CN)** | **Built-in CJK tokenisation** | Limited |
| English | Excellent | Excellent |
| Bengali, Hindi | Good | Good |

Arabic is TwinMOS's primary market language (Phase 2). A search engine that cannot properly tokenise Arabic would mean degraded search quality for the most important regional market. MeiliSearch's native Arabic support is not available in Typesense at equivalent quality.

### Secondary Factors

| Criterion | MeiliSearch | Typesense |
|-----------|------------|----------|
| **Hosting cost** | **$0** (existing Hetzner VPS) | $0 (same VPS) — equal |
| **Schema** | **Schema-less** (adapts to any data) | Requires predefined schema |
| **Query configuration** | Smart defaults, async indexing | Dynamic at query-time |
| **Hybrid search** | **Keyword + semantic (built-in)** | Keyword only (standard) |
| **React library** | `react-instantsearch` | `react-instantsearch` + custom |
| **Language** | Rust (high performance, memory safe) | C++ (high performance) |
| **License** | MIT / Proprietary (SSPL for self-hosted enterprise) | MIT |
| **Cloud upgrade** | MeiliSearch Cloud $29/mo | Typesense Cloud $15/mo |
| **Active development** | Yes (v1.13.x as of 2026) | Yes |

### Schema-Less Advantage

MeiliSearch's schema-less approach means:
- Strapi product fields can evolve without updating search index schema
- New content types (news, pages) added to same index without reconfiguration
- Custom attributes added to products appear in search immediately on next index sync

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Typesense** | Limited Arabic tokenisation — fatal for Phase 2 MEA market; would require migration after launch |
| **Algolia** | $99+/month SaaS cost; vendor lock-in; Arabic support good but cost prohibitive |
| **Elasticsearch / OpenSearch** | Heavy: requires 2+ GB RAM dedicated; overkill for 10,000 documents; steep ops burden for 2-dev team |
| **PostgreSQL Full Text Search** | Built-in but poor multilingual support; limited relevance ranking; no instant-search UX |
| **Meilisearch Cloud** | $29/mo is available as upgrade path if self-hosted proves insufficient |

---

## 5. Consequences

### Positive
- Zero incremental hosting cost (shares Hetzner VPS with Strapi)
- Arabic and Chinese search quality is market-appropriate from Phase 2 onwards
- Schema-less means product catalog evolution doesn't break search
- Hybrid search (vector + keyword) available for Phase 3 enhanced relevance
- `react-instantsearch` provides turnkey SearchBar island with faceted filtering

### Negative / Trade-offs
- MeiliSearch runs on same VPS as Strapi and PostgreSQL — resource competition during reindexing. **Mitigated:** Indexing scheduled during off-peak hours (02:00 UTC); MeiliSearch RAM-mapped indexes are efficient
- If Phase 3 traffic is very high (>1M queries/month), upgrade to MeiliSearch Cloud or dedicated VPS

### Neutral
- MeiliSearch uses a task queue for async indexing — there is a brief delay between Strapi content publish and search index update (~seconds). Acceptable for content search use case.

---

## 6. Implementation Notes

**MeiliSearch configuration:**
```typescript
// src/services/searchService.ts
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
});

const productIndex = client.index('products');

// Index configuration (run once at setup)
await productIndex.updateSettings({
  searchableAttributes: ['name', 'shortDescription', 'partNumber', 'category.name', 'brand.name'],
  filterableAttributes: ['category.slug', 'brand.slug', 'status', 'locale'],
  sortableAttributes: ['launchDate', 'name'],
  typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 5 } },
});
```

**Strapi → MeiliSearch sync:**
Product lifecycle hooks sync to MeiliSearch on `afterCreate`, `afterUpdate`, `afterPublish`, `afterUnpublish`.

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-007: Hetzner vs AWS (hosting that includes MeiliSearch)
