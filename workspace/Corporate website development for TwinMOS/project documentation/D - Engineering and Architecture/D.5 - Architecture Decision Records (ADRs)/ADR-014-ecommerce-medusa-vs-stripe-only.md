# ADR-014: E-Commerce Engine — Medusa.js vs Stripe-Only

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-014 |
| **Date** | 2026-04-15 |
| **Status** | Accepted — Deferred to Phase 3 |
| **Deciders** | Engineering Lead, Project Owner |
| **Source** | Tech Stack §15 |

---

## 1. Context

TwinMOS Phase 3 (months 10–15) introduces direct-to-consumer (DTC) e-commerce capability on the website. The primary market is the VOLTX gaming memory and storage segment, where TwinMOS wants to sell directly to end consumers in select markets (initially UAE and India).

Phase 1 and Phase 2 do not include any commerce features. This ADR records the Phase 3 approach chosen during architecture planning so it is not re-decided later.

### Commerce Requirements (Phase 3)

| Requirement | Detail |
|------------|--------|
| Product catalogue | Already in Strapi CMS (100+ SKUs) |
| Shopping cart | Persistent, session-based |
| Checkout | Hosted or embedded (Stripe Checkout v1) |
| Payment methods | Card, Apple Pay, Google Pay; MENA local methods TBD |
| Order management | Admin ability to view, fulfil, refund orders |
| Customer accounts | Order history, saved addresses |
| Distributor pricing tiers | Different prices for partners vs. retail consumers |
| Multi-currency | USD primary; AED, INR TBD |
| DTC market scope | UAE + India initially |
| PCI compliance | SAQ A (no card data on TwinMOS servers) |

---

## 2. Decision

**We will use Medusa.js v2 (headless commerce engine) + Stripe Checkout (payment processing) for Phase 3 e-commerce.**

- Medusa.js v2 runs self-hosted on a Hetzner CX42 (or dedicated CX22) via Coolify
- Stripe Checkout (hosted) processes payments — TwinMOS never handles card data (SAQ A)
- Strapi product catalogue syncs to Medusa product catalog via webhook/script
- Astro frontend integrates with Medusa Storefront API for cart/checkout UX

---

## 3. Rationale

### Why Not Stripe-Only (Without Medusa)

Stripe Checkout processes payments — but it is not a commerce engine. A "Stripe-only" approach would require building:
- Cart state management (session/cookie/database)
- Order creation and storage
- Order history for customer accounts
- Admin order management interface
- Fulfilment status tracking
- Distributor pricing tiers
- Product inventory management
- Refund management
- Multi-currency price management

That is essentially building a custom e-commerce backend — a significant engineering investment. Medusa.js provides all of this out-of-the-box.

### Why Medusa.js v2

**Medusa.js v2** is an open-source, TypeScript-first headless commerce platform:

| Feature | Medusa.js v2 | Comparable Shopify Headless |
|---------|-------------|---------------------------|
| Self-hosted | **Yes** | No (Shopify SaaS) |
| Licensing cost | **$0 (MIT)** | $79/mo (Basic) minimum |
| TypeScript-first | **Yes** | No (REST API + GraphQL) |
| Headless API | **Yes (REST + React hooks)** | Yes (Storefront API) |
| Multi-currency | **Yes** | Yes |
| Distributor pricing | **Yes (price lists)** | Yes (B2B apps) |
| Customer accounts | **Yes** | Yes |
| Admin dashboard | **Yes** | Yes |
| Stripe plugin | **`@medusajs/payment-stripe`** | Built-in |
| Astro compatibility | **Yes (REST API)** | Yes (REST API) |
| Node.js runtime | **Yes** | N/A |

Medusa.js v2 was rebuilt from the ground up with a modular architecture. It aligns perfectly with the TwinMOS stack: Node.js/TypeScript on Hetzner, PostgreSQL database, Stripe payments.

### Why Stripe Checkout (Not Stripe Elements)

| | Stripe Checkout (hosted) | Stripe Elements (embedded) |
|--|--------------------------|--------------------------|
| PCI scope | SAQ A (simplest) | SAQ A-EP (more complex) |
| Implementation time | 2–4 hours | 2–4 days |
| Customisation | Branded (logo + colors) | Full CSS control |
| Apple Pay / Google Pay | Built-in | Manual integration |
| 3DS / SCA | Automatic | Manual handling |
| Local payment methods | Built-in (region-configurable) | Manual integration |

Stripe Checkout (hosted) is chosen for Phase 3 because it is the fastest, most compliant implementation. PCI SAQ A means TwinMOS's systems are never in scope for cardholder data — Stripe handles all card processing. Stripe Elements can be adopted in Phase 4 if greater checkout customisation is required.

### Cost Analysis

| Approach | Setup Cost | Ongoing Cost |
|----------|-----------|-------------|
| **Medusa.js + Stripe** | ~40 dev hours | $0 platform + Stripe 1.5–2.9% + $0.30/transaction |
| Shopify + Stripe | ~20 dev hours | $79+/mo + 2% external payment fee |
| Custom-built + Stripe | ~200+ dev hours | $0 platform + Stripe fees |
| WooCommerce | ~30 dev hours | Hosting + plugins $20–100/mo |

Medusa.js provides the best balance of development time investment and zero recurring platform cost.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Stripe-only (custom order management)** | Requires building cart, order management, admin dashboard, customer accounts from scratch — 200+ dev hours |
| **Shopify Headless** | $79–$299/mo platform fee; external payment fee penalty (2%) if not using Shopify Payments; vendor lock-in |
| **WooCommerce** | WordPress dependency — wrong tech stack; PHP-based; security overhead |
| **Saleor** | Python/Django-based — language mismatch with Node.js stack; heavier operational overhead |
| **Commerce.js** | SaaS headless commerce — $49+/mo; vendor lock-in; no self-host option |
| **BigCommerce headless** | Enterprise SaaS — $29+/mo + transaction fees; vendor lock-in |

---

## 5. Consequences

### Phase 3 Architecture Addition

```
[Astro Frontend]
  → Cart/Checkout UI (Medusa React hooks)
  → Medusa Storefront API (new service on Hetzner)

[Medusa.js v2]
  ← Strapi product sync (webhook: product.published → Medusa product upsert)
  → Stripe Checkout API (create session)
  → PostgreSQL (orders, customers, cart, fulfilment)
  → Better Auth session (linked customer account)

[Stripe]
  → Webhook: checkout.session.completed → Medusa order fulfilment
```

### Positive
- $0 platform licensing cost
- Full ownership of order and customer data (no vendor lock-in)
- Stripe SAQ A compliance — TwinMOS never handles card numbers
- Medusa admin dashboard for order management without building custom UI
- TypeScript-first — consistent with project stack

### Negative / Trade-offs
- **Infrastructure addition:** Medusa.js requires its own Node.js process (separate from Strapi). Hetzner CX32 may need upgrade to CX42 (€25/mo) to accommodate Medusa + Strapi + PostgreSQL + MeiliSearch. **Decision:** Evaluate at Phase 3 planning; CX42 upgrade is within Phase 3 budget (<$80/mo)
- **Data sync complexity:** Strapi product catalog must sync to Medusa product catalog. Products exist in two systems. **Mitigation:** Strapi is product master; Medusa is commerce mirror. Sync via Strapi `product.published` webhook → Medusa Product API upsert
- **Phase 3 scope:** This ADR records the approach but full implementation is Phase 3. Detailed integration spec in `TwinMOSWebsiteIntegrationSpecMedusa_Commerce.md`

---

## 6. Implementation Notes

**Medusa.js installation (Phase 3):**
```bash
npx create-medusa-app@latest twinmos-store
# Select: Next.js storefront (replace with Astro integration)
# Database: PostgreSQL (existing Hetzner instance or separate schema)
```

**Strapi → Medusa product sync (Phase 3 lifecycle hook):**
```typescript
// Strapi: src/api/product/content-types/product/lifecycles.ts
async afterPublish({ result }) {
  await medusaClient.products.create({
    title:    result.name,
    handle:   result.slug,
    variants: result.variants.map(v => ({
      title: v.variantName,
      sku:   v.partNumber,
      prices: [{ currency_code: 'usd', amount: Math.round(v.msrpUsd * 100) }],
    })),
  });
}
```

**Stripe Checkout session (Medusa Stripe plugin):**
```typescript
// Configured in medusa-config.ts
modules: {
  paymentService: {
    resolve: '@medusajs/payment-stripe',
    options: {
      api_key: process.env.STRIPE_SECRET_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
      capture: true,
    },
  },
},
```

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-007: Hetzner vs AWS (Medusa.js deployment target)
- ADR-015: Better Auth (customer account sessions tied to Medusa)
- Integration Spec: Medusa Commerce
- Integration Spec: Stripe Payment
