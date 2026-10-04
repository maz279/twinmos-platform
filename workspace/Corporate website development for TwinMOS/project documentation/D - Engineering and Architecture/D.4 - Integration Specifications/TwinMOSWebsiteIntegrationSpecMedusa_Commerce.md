# TwinMOS Website — Integration Specification: Medusa.js E-Commerce

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-MEDUSA-001 |
| **Version** | 0.1 (Draft) |
| **Status** | Draft |
| **Phase** | P3 |
| **Priority** | P3 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §12; BRD §20 |

---

## 1. Status Notice

> **Medusa.js is a Phase 3 feature** (months 10–15). This document provides the planned integration architecture. Full specification will be developed during the Phase 3 design sprint.

---

## 2. Overview

**Medusa.js v2** is the headless e-commerce engine for TwinMOS direct-to-consumer sales. It handles cart management, checkout, order management, customer accounts, and inventory reservations. Stripe processes payments (see [TwinMOSWebsiteIntegrationSpecStripe_Payment.md](TwinMOSWebsiteIntegrationSpecStripe_Payment.md)).

### 2.1 Why Medusa.js Over Stripe-Only

| Approach | Cart | Orders | Admin | Inventory | Cost |
|----------|------|--------|-------|-----------|------|
| Stripe-only | Custom build | Custom build | Custom build | None | High dev cost |
| **Medusa.js** | Built-in | Built-in | Medusa Admin | Basic | Low dev cost |
| Shopify | Built-in | Built-in | Shopify Admin | Advanced | $79+/mo + fees |

Medusa is open source (MIT), self-hosted on Hetzner CX42 via Coolify.

---

## 3. Architecture

```
Astro Frontend (Cloudflare Pages)
    │
    │  Medusa Storefront API (REST)
    │  https://shop.twinmos.com/api
    ▼
Medusa.js v2 (Hetzner CX42)
    ├── Product catalog (synced from Strapi)
    ├── Cart management
    ├── Checkout (→ Stripe)
    ├── Order management
    └── Customer accounts (→ Better Auth)
         │
         ├── PostgreSQL (orders, cart, customers)
         ├── Redis (cart sessions)
         └── Stripe (payments)
```

---

## 4. Strapi → Medusa Product Sync

Strapi remains the **single source of truth** for product content (descriptions, images, specs). Medusa maintains its own product catalog for commerce operations (pricing, stock, variants).

### 4.1 Sync Strategy

| Field | Source | Sync Direction |
|-------|--------|---------------|
| Product name | Strapi | Strapi → Medusa |
| Thumbnail image | Strapi (B2) | Strapi → Medusa |
| Part number / handle | Strapi | Strapi → Medusa |
| Price | ERP or manual | Direct to Medusa |
| Stock quantity | ERP or manual | Direct to Medusa |
| Variants (capacity, color) | Strapi product | Strapi → Medusa |

### 4.2 Sync Trigger

A Strapi lifecycle hook (`product.afterPublish`) calls the Medusa Admin API to create or update the corresponding product in Medusa.

```typescript
// Strapi lifecycle → Medusa product upsert
async function syncProductToMedusa(strapiProduct) {
  await fetch(`${MEDUSA_ADMIN_URL}/admin/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MEDUSA_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: strapiProduct.name,
      handle: strapiProduct.slug,
      thumbnail: strapiProduct.images[0]?.url,
      variants: buildMedusaVariants(strapiProduct),
    }),
  });
}
```

---

## 5. Storefront API Integration

Astro checkout islands call Medusa Storefront API:

| Operation | Endpoint |
|-----------|----------|
| Browse products | `GET /store/products` |
| Create cart | `POST /store/carts` |
| Add to cart | `POST /store/carts/{id}/line-items` |
| Initiate checkout | `POST /store/carts/{id}/payment-sessions` |
| Complete checkout | `POST /store/carts/{id}/complete` |
| Order history | `GET /store/orders` (authenticated) |

---

## 6. Medusa Admin

**URL:** `https://shop.twinmos.com/admin`

Operations team uses Medusa Admin to:
- View and manage orders
- Issue refunds
- Update product pricing
- Manage inventory stock levels
- Create discount codes / promotions

---

## 7. Infrastructure

| Component | Hosting | Phase |
|-----------|---------|-------|
| Medusa.js server | Hetzner CX42 (upgraded from CX32) | P3 |
| Medusa PostgreSQL | Shared with Strapi DB (separate schema) or dedicated | P3 |
| Medusa Redis | Shared Redis 7 instance | P3 |
| Medusa Admin UI | Same server, separate process | P3 |

---

## 8. Customer Accounts

Medusa customer accounts are linked to **Better Auth** sessions (Phase 3 partner portal):
- Customer creates account via Better Auth
- Better Auth user ID linked to Medusa customer ID
- Single sign-on across partner portal and storefront

---

## 9. Related Documents

- [TwinMOSWebsiteIntegrationSpecStripe_Payment.md](TwinMOSWebsiteIntegrationSpecStripe_Payment.md)
- [TwinMOSWebsiteIntegrationSpecBetter_Auth.md](TwinMOSWebsiteIntegrationSpecBetter_Auth.md)
- [TwinMOSWebsiteIntegrationSpecTwinMOS_ERP.md](TwinMOSWebsiteIntegrationSpecTwinMOS_ERP.md)
- ADR-014: E-commerce — Medusa vs Stripe-only
