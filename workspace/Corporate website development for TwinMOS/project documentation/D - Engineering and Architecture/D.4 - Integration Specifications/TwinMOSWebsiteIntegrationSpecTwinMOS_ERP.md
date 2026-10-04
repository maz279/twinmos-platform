# TwinMOS Website — Integration Specification: ERP Integration

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-ERP-001 |
| **Version** | 0.2 (Draft — ERP TBD) |
| **Status** | Draft |
| **Phase** | P3 (ERP sync); P1 (Strapi-only product master) |
| **Priority** | P3 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §14.5; BRD §25.2 |

---

## 1. Status Notice

> **ERP system is TBD.** A Sprint 0 audit will determine the appropriate ERP platform before Phase 2 integration begins. This document outlines the integration architecture that is ERP-agnostic where possible.
>
> **Phase 1:** Strapi is the sole product master. No ERP connection.
> **Phase 2:** Read-only API sync (ERP → Strapi for price/stock). Requires ERP selection.
> **Phase 3:** Write-back (Medusa order data → ERP).

---

## 2. ERP Candidate Assessment

| Platform | License | Target Use Case | Cost Estimate |
|----------|---------|----------------|--------------|
| **SAP Business One** | Commercial | Mid-market, manufacturing, distribution | $1,500-4,000/user (perpetual) |
| **Microsoft Dynamics 365 Business Central** | SaaS | Mid-market, cloud-first | $70-100/user/month |
| **Odoo** | Open source (Community) / Subscription (Enterprise) | SME, flexible modules | $0 (community) / $20-50/user/month |

**Selection criteria for Sprint 0 audit:**
1. Does TwinMOS Dubai (DAFZA) already operate an ERP system?
2. What data does the ERP currently manage? (inventory, pricing, orders, accounting)
3. Does the ERP have a modern REST or GraphQL API?
4. What is the IT team's capacity to support ERP integration?

---

## 3. Phase 1 — Strapi as Product Master

In Phase 1, the Strapi CMS is the **authoritative source** for all product data displayed on the website:

| Data | Source | Managed By |
|------|--------|-----------|
| Product names & descriptions | Strapi | Marketing/Content team |
| Technical specifications | Strapi | Product team |
| Product images & media | Strapi (B2) | Marketing team |
| Part numbers & EANs | Strapi | Product team |
| Pricing (if displayed) | Strapi (manual entry) | Product team |
| Stock availability | Not displayed in Phase 1 | — |

---

## 4. Phase 2 — Read-Only ERP Sync (ERP → Strapi)

### 4.1 Integration Architecture

```
ERP System
    │
    │  REST/SOAP/GraphQL API
    │  (ERP-specific protocol)
    ▼
ERPSync Strapi Service
    │
    │  Daily batch + on-demand webhook
    ▼
Strapi PostgreSQL
    │
    ▼
Website (via Strapi API)
```

### 4.2 Data Sync Scope

| ERP Field | Strapi Field | Sync Direction | Conflict Resolution |
|-----------|-------------|---------------|-------------------|
| SKU / Part number | `product.partNumber` | ERP → Strapi | **ERP wins** |
| RRP / List price | `product.msrpPrice` | ERP → Strapi | **ERP wins** |
| Stock status | `product.stockStatus` | ERP → Strapi | **ERP wins** |
| Product active/inactive | `product.status` | ERP → Strapi | ERP can deactivate; Strapi cannot reactivate without ERP |
| Product name | `product.name` | Manual (Strapi) | **Strapi wins** (marketing copy) |
| Description | `product.description` | Manual (Strapi) | **Strapi wins** |
| Images | `product.images` | Manual (Strapi) | **Strapi wins** |
| SEO metadata | `product.seoTitle` etc. | Manual (Strapi) | **Strapi wins** |

### 4.3 ERPSync Service

**File:** `src/services/erpSyncService.ts`

```typescript
interface ERPProduct {
  sku: string;
  price: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'discontinued';
  active: boolean;
}

export async function syncFromERP(): Promise<void> {
  strapi.log.info('[ERPSync] Starting sync...');
  
  const erpProducts = await fetchERPProductCatalog();
  
  for (const erpProduct of erpProducts) {
    const strapiProduct = await strapi.db.query('api::product.product').findOne({
      where: { partNumber: erpProduct.sku },
    });

    if (!strapiProduct) {
      strapi.log.warn(`[ERPSync] SKU ${erpProduct.sku} not found in Strapi — skipped`);
      continue;
    }

    await strapi.db.query('api::product.product').update({
      where: { id: strapiProduct.id },
      data: {
        msrpPrice: erpProduct.price,
        stockStatus: erpProduct.stockStatus,
        // Do NOT update name, description, images — Strapi owns these
      },
    });
  }

  strapi.log.info(`[ERPSync] Sync complete. ${erpProducts.length} products processed.`);
}
```

### 4.4 Sync Schedule

```typescript
// Coolify cron job configuration (or Strapi cron plugin)
// Daily at 02:00 UTC to avoid peak traffic
module.exports = {
  '0 2 * * *': async ({ strapi }) => {
    await strapi.service('api::product.erp-sync').syncFromERP();
  },
};
```

---

## 5. Phase 3 — Write-Back (Medusa Orders → ERP)

When Medusa.js e-commerce is enabled:

| Event | Action |
|-------|--------|
| Order placed (Medusa) | Create sales order in ERP |
| Order shipped | Update ERP fulfillment |
| Order refunded | Create credit note in ERP |
| Inventory reserved (cart) | Reserve stock in ERP (if real-time inventory required) |

This integration will be fully specified in Phase 3 design sprint, once ERP selection is confirmed.

---

## 6. Authentication (ERP-Specific — TBD)

| ERP | Expected Auth Method |
|-----|---------------------|
| SAP Business One | Service Layer REST API with session token |
| Dynamics 365 BC | OAuth 2.0 (Azure AD) |
| Odoo | JSON-RPC API with API key |

All ERP credentials stored in Strapi environment variables — never hardcoded.

---

## 7. Related Documents

- [TwinMOSWebsiteIntegrationSpecMedusa_Commerce.md](TwinMOSWebsiteIntegrationSpecMedusa_Commerce.md) — Phase 3 commerce integration
- [TwinMOSWebsiteDataModelStrapi_Collections.md](../D.2 - Data Layer/TwinMOSWebsiteDataModelStrapi_Collections.md)
- ADR-013: ERP Integration Mode
