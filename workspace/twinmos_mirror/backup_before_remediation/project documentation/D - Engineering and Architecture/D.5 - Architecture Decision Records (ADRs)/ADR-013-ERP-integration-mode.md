# ADR-013: ERP Integration Mode

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-013 |
| **Date** | 2026-04-15 |
| **Status** | Accepted — Partially Deferred |
| **Deciders** | Engineering Lead, Project Owner |
| **Source** | Tech Stack §14.5 |

---

## 1. Context

TwinMOS Technologies is a hardware manufacturer distributing products across 93+ countries. The company uses (or will adopt) an ERP (Enterprise Resource Planning) system to manage:
- Product master data (SKUs, part numbers, specifications, pricing)
- Inventory and stock levels
- Purchase orders, sales orders
- Distributor pricing tiers and agreements
- Financial reporting

**The question:** How should the TwinMOS website (Strapi CMS) relate to the ERP system?

### Current State (Phase 1 Launch)

At Phase 1 launch, **no ERP integration exists**:
- TwinMOS's current ERP system has not been confirmed for the website project
- The product master data is being entered directly into Strapi by the operations/marketing team
- ERP integration is a Phase 2+ concern after the website launches

### ERP Candidates (to be confirmed in Sprint 0 audit)

| Candidate | Type | Cost | Notes |
|-----------|------|------|-------|
| **SAP Business One** | Enterprise | $80–$150/user/mo | Common in hardware manufacturing; strong inventory |
| **Microsoft Dynamics 365 Business Central** | Enterprise | $70–$100/user/mo | Microsoft ecosystem; good API (OData) |
| **Odoo (Community Edition)** | Open source | $0 self-hosted | Modular; REST API; Django-based; fits budget |
| **Sage X3** | Enterprise | $150+/user/mo | MENA region common; complex API |
| **NetSuite** | Enterprise | $999+/mo base | Overkill for current scale |

ERP selection is outside the scope of the website project — it is a business infrastructure decision.

---

## 2. Decision

**Phase 1 (Months 1–5):** Strapi is the sole product master. No ERP connection. Operations team enters all product data directly in Strapi admin.

**Phase 2 (Months 6–9):** Implement a **read-only pull integration** — ERP pushes or Strapi pulls product/price/stock data from ERP via scheduled batch sync (daily, 02:00 UTC). Strapi remains the frontend-facing data source.

**Phase 3 (Months 10–15):** Evaluate write-back from Medusa.js commerce orders to ERP. Scope confirmed at Phase 3 planning.

**Conflict resolution rule:** ERP wins for price, SKU, stock quantity. Strapi wins for marketing copy, product descriptions, images, SEO metadata.

---

## 3. Rationale

### Why Strapi-Only for Phase 1

1. **Unknown ERP:** The specific ERP system has not been confirmed. Building an integration before the target is known would produce throwaway code.
2. **Product catalogue is finite and stable at launch:** ~100 SKUs. Manual data entry into Strapi by operations team is manageable for initial content load.
3. **Faster Phase 1 delivery:** Removing ERP integration from Phase 1 scope eliminates a major source of external dependency delays (ERP access, IT approval, API documentation, etc.).
4. **Strapi is sufficient:** Strapi's admin panel handles all product management tasks needed for Phase 1.

### Why Pull Integration (Not Push) for Phase 2

**Pull (Strapi cron pulls from ERP API):**
- Strapi initiates the connection on a schedule
- No changes required to ERP system (no webhook registration, no outbound firewall rules)
- If ERP API changes, only Strapi sync service needs updating
- Safer for ERP IT team (they don't have to configure outbound webhooks)

**Push (ERP pushes changes to Strapi webhook):**
- Requires ERP customisation to call Strapi webhook on product change
- ERP customisations are expensive, require ERP vendor/partner
- Real-time sync not required for product data (price updates once/day is adequate)

### Why Daily Batch (Not Real-Time)

TwinMOS product data changes are low frequency (new SKUs launched quarterly, price changes monthly). Real-time sync via webhooks would add ERP customisation cost for minimal benefit. A daily batch at 02:00 UTC keeps data fresh within 24 hours — acceptable for a product catalogue (not a live inventory system).

### Conflict Resolution

Strapi serves as the **presentation layer master** for content that doesn't exist in ERP (product descriptions, hero images, SEO titles, feature highlights). ERP is authoritative for **operational data** (part numbers, pricing, inventory). The conflict resolution rule:

```
ERP wins: partNumber, price, stockStatus, productStatus (active/discontinued)
Strapi wins: shortDescription, longDescription, images, specsTable, seoTitle, seoDescription
```

On sync conflict, ERPSync service logs the overwritten values to `audit_log`.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Real-time bidirectional sync (Phase 1)** | ERP unknown; real-time adds complexity for marginal benefit; product data changes infrequently |
| **ERP as sole product master (Strapi pulls all data)** | ERP typically lacks marketing copy fields, SEO metadata, lifestyle images — not built for web presentation |
| **Separate product API service** | Unnecessary abstraction layer for 2-developer team; adds operational complexity |
| **Manual sync (export CSV from ERP → import to Strapi)** | Error-prone; requires operations team manual work; not scalable beyond Phase 1 |
| **Strapi as sole system of record forever** | Does not scale if TwinMOS uses ERP for inventory management — data would diverge |

---

## 5. Consequences

### Phase 1
- Operations team manually enters and maintains all product data in Strapi
- No ERP dependency — Phase 1 delivery is not blocked by ERP project
- **Risk:** If ERP has the authoritative product list, Strapi may diverge until Phase 2 sync is built. **Mitigation:** Operations team has read access to ERP and is responsible for keeping Strapi current during Phase 1.

### Phase 2
- ERP sync service (`src/services/erpSyncService.ts`) implemented in Strapi
- Coolify cron job runs daily 02:00 UTC: `node sync-erp.js`
- Failed syncs logged to `audit_log`; notification sent to operations Slack channel
- SKUs in ERP but not in Strapi: created automatically with partial data (ERP fields only); operations team completes marketing content
- SKUs in Strapi but not in ERP: flagged as `status: unverified` — operations review required

### Phase 3
- Medusa.js order creation → ERP purchase order write-back
- Scope and API to be confirmed at Phase 3 planning sprint

---

## 6. Implementation Notes

**Phase 2 ERPSync service skeleton (to be implemented when ERP is confirmed):**
```typescript
// src/services/erpSyncService.ts
// NOTE: Implementation depends on ERP API (OData for Dynamics, REST for Odoo, SOAP for SAP B1)
// This service is a placeholder; concrete implementation at Phase 2 Sprint 1

export async function syncProductsFromERP(): Promise<SyncResult> {
  const erpProducts = await erpClient.getProducts({ updatedSince: lastSyncTimestamp() });

  for (const erpProduct of erpProducts) {
    const existingEntry = await strapi.entityService.findMany('api::product.product', {
      filters: { partNumber: erpProduct.sku },
    });

    if (existingEntry.length > 0) {
      // ERP wins for operational fields
      await strapi.entityService.update('api::product.product', existingEntry[0].id, {
        data: {
          partNumber:  erpProduct.sku,
          price:       erpProduct.msrp,
          stockStatus: erpProduct.inStock ? 'in_stock' : 'out_of_stock',
          status:      erpProduct.active ? 'published' : 'discontinued',
        },
      });
    } else {
      // New product — create stub, flag for marketing content
      await strapi.entityService.create('api::product.product', {
        data: { partNumber: erpProduct.sku, status: 'draft', source: 'erp_sync' },
      });
    }
  }

  return { synced: erpProducts.length, timestamp: new Date() };
}
```

**Coolify cron job configuration:**
```yaml
# Coolify scheduled task
schedule: "0 2 * * *"    # Daily at 02:00 UTC
command: "node dist/scripts/sync-erp.js"
container: strapi
```

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-003: Folder Structure (ERPSync service location)
- ADR-014: Ecommerce / Medusa.js (Phase 3 write-back to ERP)
- Integration Spec: TwinMOS ERP Integration
