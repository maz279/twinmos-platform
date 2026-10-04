# TwinMOS Technologies Corporate Website
# E-Commerce Functional Specification

| Field | Value |
|---|---|
| **Document Reference** | TWN-P3-ECOM-2026-001 |
| **Version** | 1.0 |
| **Status** | FINAL |
| **Date** | 1 May 2026 |
| **Author** | TwinMOS Project Management Office |
| **Owner** | Dev B (Strapi + Medusa Backend) |
| **Classification** | Internal — Confidential |
| **Related Documents** | TWN-P3-KICK-2026-001, TWN-BRD-2026-001 v3.0, TWN-TECHSTACK-2026-001 v1.1, TWN-P3-CART-2026-001, TWN-P3-PAY-2026-001 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Decision: Why Medusa.js v2](#3-technology-decision-why-medusajs-v2)
4. [Data Flow](#4-data-flow)
5. [Supported Markets](#5-supported-markets)
6. [Product Catalog Integration](#6-product-catalog-integration)
7. [Storefront Pages](#7-storefront-pages)
8. [User Stories](#8-user-stories)
9. [Business Rules](#9-business-rules)
10. [Functional Requirements](#10-functional-requirements)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Medusa.js v2 Configuration](#12-medusajs-v2-configuration)
13. [Strapi ↔ Medusa Sync Architecture](#13-strapi--medusa-sync-architecture)
14. [Multi-Currency and Multi-Region Configuration](#14-multi-currency-and-multi-region-configuration)
15. [Error Handling and Fallback States](#15-error-handling-and-fallback-states)
16. [Acceptance Criteria](#16-acceptance-criteria)
17. [Dependencies on Other Specifications](#17-dependencies-on-other-specifications)

---

## 1. Executive Summary

This document defines the complete functional specification for the TwinMOS Technologies e-commerce platform, to be built as part of Phase 3 of the corporate website project. The e-commerce platform enables TwinMOS to sell its full product range — memory modules (VOLTX DDR5, VOLTX RGB DDR5, TornadoX7 DDR4, Thunder GX DDR4) and storage products (CoreX Pro Gen5 NVMe SSD, Xtreme Gen4 NVMe SSD, Elite Drive SATA SSD, portable SSDs, USB flash drives) — directly to consumers and business buyers across five markets: UAE (AED), India (INR), Bangladesh (BDT), Kingdom of Saudi Arabia (SAR), and International (USD).

The e-commerce platform is built on a composable, headless architecture:

- **Medusa.js v2** serves as the commerce engine, managing products, pricing, inventory, carts, orders, promotions, and customer data.
- **Strapi v5** serves as the content management layer, providing editorial copy, media assets, SEO metadata, and product descriptions managed by the TwinMOS content team.
- **Astro 5** serves as the storefront rendering layer, delivering fast, SEO-optimised pages with Server Islands for dynamic commerce data (prices, stock, cart badge).
- **Stripe Checkout** handles all payment processing, maintaining PCI DSS SAQ A compliance by ensuring TwinMOS systems never handle raw card data.

This specification defines all business rules, functional requirements, user journeys, data models, API integration patterns, and acceptance criteria required for the e-commerce platform to be considered production-ready. It is the primary reference document for Dev A (frontend) and Dev B (backend) during Months 10–12 of Phase 3.

---

## 2. Architecture Overview

### 2.1 System Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE PAGES                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    ASTRO 5 STOREFRONT                       │    │
│  │  Static pages (SSG) + Server Islands (dynamic commerce)    │    │
│  │  - /products/{slug}    (SSG + Server Island for price)     │    │
│  │  - /cart               (CSR via Medusa Cart API)           │    │
│  │  - /checkout           (SSR via Astro SSR adapter)         │    │
│  │  - /checkout/success   (SSR)                               │    │
│  │  - /account/orders     (SSR, auth-gated)                   │    │
│  └──────────────────────────┬──────────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ API calls (REST / storefront SDK)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    HETZNER CX42 VIA COOLIFY                         │
│                                                                     │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐   │
│  │    MEDUSA.JS v2      │◄───│         STRAPI v5                │   │
│  │  Commerce Engine     │    │  Content Management System       │   │
│  │  - Products/Variants │    │  - Product copy & media          │   │
│  │  - Pricing (regions) │    │  - SEO metadata                  │   │
│  │  - Inventory         │    │  - Blog, pages                   │   │
│  │  - Carts             │    │  - Partner portal content        │   │
│  │  - Orders            │    │                                  │   │
│  │  - Customers         │    │  Sync via medusa-plugin-strapi   │   │
│  │  - Promotions        │    └──────────────────────────────────┘   │
│  │  - Fulfillment       │                                           │
│  └──────────┬───────────┘    ┌──────────────────────────────────┐   │
│             │                │      BETTER AUTH                 │   │
│             │                │  - Customer accounts             │   │
│             │                │  - Partner portal accounts       │   │
│             │                │  - Session management            │   │
│             │                └──────────────────────────────────┘   │
│             │                                                       │
│  ┌──────────▼───────────┐    ┌──────────────────────────────────┐   │
│  │   POSTGRESQL 16      │    │        MEILISEARCH               │   │
│  │  - Medusa DB schema  │    │  - Product search index          │   │
│  │  - Strapi DB schema  │    │  - Faceted filtering             │   │
│  │  - Better Auth DB    │    │                                  │   │
│  └──────────────────────┘    └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │    STRIPE          │
                    │  Payment Gateway   │
                    │  - Checkout        │
                    │  - Tax             │
                    │  - Radar (fraud)   │
                    │  - Webhooks        │
                    └────────────────────┘
```

### 2.2 Request Flow Summary

| Request Type | Rendering Strategy | Data Source |
|---|---|---|
| Product listing page | Static (SSG, rebuilt on CMS publish) | Strapi (copy) + Medusa (prices) |
| Product detail page | SSG + Server Island (dynamic price/stock) | Strapi (copy/media) + Medusa (price/stock) |
| Cart page | Client-side (CSR, Medusa Cart API) | Medusa |
| Checkout | Server-side (SSR, Astro SSR adapter) | Medusa + Better Auth + Stripe |
| Order confirmation | SSR | Medusa |
| Account / order history | SSR, auth-gated | Medusa + Better Auth |
| Search results | Client-side + MeiliSearch | MeiliSearch |

---

## 3. Technology Decision: Why Medusa.js v2

### 3.1 Decision Record Reference: ADR-016

**Decision:** Use Medusa.js v2 as the commerce engine rather than Stripe-only, Saleor, or WooCommerce.

### 3.2 Alternatives Considered

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Stripe-only (no dedicated commerce layer)** | Simple, fewer moving parts | No inventory management, no cart persistence, no promotions engine, no order management, would require custom build of all commerce logic | Rejected |
| **Saleor** | Django-based, GraphQL-first, mature | Python/Django stack inconsistent with Node.js project; GraphQL adds complexity vs REST; smaller community in MENA region | Rejected |
| **WooCommerce** | Widely used, large ecosystem | PHP/WordPress not compatible with Astro 5 headless stack; monolithic, poor headless story | Rejected |
| **Shopify Headless** | Very mature, reliable | Vendor lock-in; monthly fees scale with volume; cannot self-host; limited customisation of checkout | Rejected |
| **Medusa.js v2** | OSS, Node.js, MIT license, excellent Strapi integration via `medusa-plugin-strapi`, composable module architecture, active community, Stripe first-class support, self-hostable on Hetzner | Newer (v2 released 2024); smaller talent pool than Shopify | **Selected** |

### 3.3 Key Reasons for Medusa.js v2

1. **Node.js ecosystem consistency** — Medusa, Strapi, and Astro are all Node.js applications, enabling a unified JavaScript/TypeScript development experience. Dev B does not need to context-switch between languages.

2. **Composable module architecture** — Medusa v2 introduces a module system that allows selective use of commerce features. TwinMOS can start with Products, Carts, and Orders, then activate Promotions, Loyalty, and Fulfillment modules as needed.

3. **Mature Strapi integration** — The `medusa-plugin-strapi` plugin provides a tested synchronisation layer between Strapi content types and Medusa product records, enabling the TwinMOS content team to manage editorial content in Strapi while Medusa manages commerce-specific data (pricing, inventory).

4. **Self-hosted, no SaaS fees** — Medusa runs on the existing Hetzner CX42 via Coolify, with no per-transaction or monthly SaaS fees, significantly reducing ongoing costs at scale.

5. **PCI scope compatibility** — Medusa's payment module design delegates card processing entirely to Stripe, maintaining SAQ A PCI scope. Medusa never stores or processes raw card data.

6. **Multi-region and multi-currency built-in** — Medusa v2 natively supports price lists, regions, and currency configuration, directly mapping to TwinMOS's five-market requirement.

7. **Active development and community** — Medusa v2 is actively maintained, with a roadmap covering improvements to the inventory module, B2B features, and marketplace capabilities relevant to Phase 4.

---

## 4. Data Flow

### 4.1 Editorial Content Flow (Strapi → Storefront)

```
TwinMOS Content Editor
        │
        │ Creates/updates product in Strapi CMS
        ▼
┌─────────────────────────────┐
│  STRAPI v5                  │
│  - Product collection type  │
│  - Rich text description    │
│  - Images (Backblaze B2)    │
│  - SEO metadata             │
│  - Localised content        │
│    (EN/AR/RU/ZH-CN/FR)      │
└──────────────┬──────────────┘
               │ Webhook on publish
               ▼
┌─────────────────────────────┐
│  medusa-plugin-strapi       │
│  Sync handler               │
│  - Maps Strapi product to   │
│    Medusa product schema    │
│  - Preserves Medusa IDs     │
│  - Updates product handle   │
└──────────────┬──────────────┘
               │ Medusa Admin API call
               ▼
┌─────────────────────────────┐
│  MEDUSA.JS v2               │
│  Product module             │
│  - Product + variants       │
│  - Prices per region        │
│  - Inventory levels         │
└──────────────┬──────────────┘
               │ Astro build trigger (Cloudflare Pages webhook)
               ▼
┌─────────────────────────────┐
│  ASTRO 5 BUILD              │
│  - SSG: product pages       │
│  - Deployed to Cloudflare   │
│    Pages CDN globally       │
└─────────────────────────────┘
```

### 4.2 Purchase Flow (Storefront → Stripe → Medusa → Customer)

```
Customer (browser)
        │
        │ 1. Add to cart
        ▼
┌─────────────────────────┐
│  Medusa Cart API        │
│  POST /store/carts      │
│  POST /store/carts/{id}/line-items
└────────────┬────────────┘
             │ 2. Checkout initiated
             ▼
┌─────────────────────────┐
│  Medusa Checkout API    │
│  - Set email            │
│  - Set shipping address │
│  - Select shipping method│
│  - Apply promotions     │
└────────────┬────────────┘
             │ 3. Payment session created
             ▼
┌─────────────────────────┐
│  Stripe                 │
│  Checkout Session created│
│  - Line items           │
│  - Tax (Stripe Tax)     │
│  - Shipping cost        │
│  - Currency/region      │
│  - success_url          │
│  - cancel_url           │
└────────────┬────────────┘
             │ 4. Customer pays on Stripe-hosted page
             ▼
┌─────────────────────────┐
│  Stripe Webhook         │
│  checkout.session.completed
│  → Medusa webhook handler
│  → Order created in Medusa
│  → Inventory decremented
└────────────┬────────────┘
             │ 5. Order confirmed
             ▼
┌─────────────────────────┐
│  Resend                 │
│  Order confirmation email│
│  sent to customer       │
└─────────────────────────┘
             │ 6. Redirect to /checkout/success
             ▼
Customer sees order confirmation page
```

---

## 5. Supported Markets

### 5.1 Market Configuration Table

| Market | Currency | ISO Code | Tax Rate | Tax Type | Tax Label on Invoice | VAT/GST Registration Required |
|---|---|---|---|---|---|---|
| UAE | UAE Dirham | AED | 5% | VAT | VAT (المضاف القيمة ضريبة) | Yes — TRN required |
| India | Indian Rupee | INR | 18% | GST | GST (IGST for interstate) | Yes — GSTIN required |
| Bangladesh | Bangladeshi Taka | BDT | 15% | VAT | VAT | TBD (verify with TwinMOS Finance) |
| Kingdom of Saudi Arabia | Saudi Riyal | SAR | 15% | VAT | VAT (القيمة المضافة ضريبة) | Yes — TRN required |
| International | US Dollar | USD | 0% | None (TwinMOS not liable for destination-country tax) | None | N/A |

### 5.2 Currency Display Rules

| Currency | Symbol | Position | Decimal Places | Example |
|---|---|---|---|---|
| AED | AED or د.إ | Prefix (EN) / Suffix (AR) | 2 | AED 299.00 |
| INR | ₹ | Prefix | 2 | ₹ 24,999.00 |
| BDT | ৳ | Prefix | 2 | ৳ 3,299.00 |
| SAR | SAR or ر.س | Prefix (EN) / Suffix (AR) | 2 | SAR 299.00 |
| USD | $ | Prefix | 2 | $249.00 |

### 5.3 Market-Specific Shipping Rules

| Market | Available Carriers | Free Shipping Threshold | Estimated Delivery |
|---|---|---|---|
| UAE | Aramex, FedEx, DHL, Local (Fetchr) | AED 200 | 1–3 business days |
| India | FedEx, DHL, Delhivery (Phase 4) | INR 2,000 | 3–7 business days |
| Bangladesh | DHL, Local courier (Pathao — Phase 4) | BDT 2,000 | 5–10 business days |
| KSA | Aramex, FedEx, DHL | SAR 200 | 2–5 business days |
| International | FedEx, DHL | $300 USD | 7–14 business days |

### 5.4 Market Availability Phasing

| Market | Phase 3 Launch | Notes |
|---|---|---|
| UAE | Yes | Primary market; first to go live |
| India | Yes | High volume; INR pricing from day 1 |
| KSA | Yes | SAR pricing; KSA VAT via Stripe Tax |
| Bangladesh | Yes | BDT pricing; DHL primary carrier |
| International | Yes | USD fallback for all other countries |

---

## 6. Product Catalog Integration

### 6.1 Product Portfolio

TwinMOS Phase 3 will list the following product categories in the e-commerce store:

| Category | Products | Key Variants |
|---|---|---|
| DDR5 Memory | VOLTX DDR5, VOLTX RGB DDR5 | Capacity (8GB/16GB/32GB), Speed (4800/5200/6000/6400 MT/s), Form factor (DIMM/SODIMM) |
| DDR4 Memory | TornadoX7 DDR4, Thunder GX DDR4 | Capacity (4GB/8GB/16GB/32GB), Speed (2400/2666/3200/3600 MT/s) |
| NVMe SSD | CoreX Pro Gen5, Xtreme Gen4 | Capacity (250GB/500GB/1TB/2TB/4TB) |
| SATA SSD | Elite Drive SATA SSD | Capacity (120GB/240GB/480GB/960GB/1.92TB) |
| Portable SSD | TwinMOS Portable SSD (model TBD) | Capacity (500GB/1TB/2TB) |
| USB Flash Drive | TwinMOS USB Flash (model TBD) | Capacity (16GB/32GB/64GB/128GB/256GB) |

### 6.2 Strapi Product Content Type (Extended for E-Commerce)

The existing Strapi `Product` content type is extended with the following fields for Phase 3:

```typescript
// Strapi Product Content Type — Phase 3 Extensions
interface StrapiProduct {
  // Existing Phase 1/2 fields
  id: string;
  title: string;
  slug: string;           // Used as Medusa product handle
  description: RichText;
  shortDescription: string;
  images: MediaAsset[];
  category: ProductCategory;
  specifications: Specification[];
  seoTitle: string;
  seoDescription: string;
  locale: string;         // EN | AR | RU | ZH-CN | FR

  // New Phase 3 fields
  medusaProductId: string;    // Medusa internal ID (set after first sync)
  isSellable: boolean;        // Whether this product is available for purchase
  warrantyPeriod: string;     // e.g., "3 years limited"
  boxContents: string[];      // e.g., ["1x Memory Module", "Installation guide"]
  compatibilityNotes: string; // Freeform text for compatibility info
  relatedProducts: StrapiProduct[]; // Cross-sell recommendations
}
```

### 6.3 Medusa Product Schema

Medusa manages the commerce-specific data for each product:

```typescript
// Medusa Product (commerce layer)
interface MedusaProduct {
  id: string;
  handle: string;           // Matches Strapi product slug
  title: string;            // Synced from Strapi (EN only in Medusa)
  status: "published" | "draft";
  variants: MedusaVariant[];
  collection: MedusaCollection; // e.g., "DDR5 Memory"
  tags: MedusaTag[];
  metadata: {
    strapi_id: string;      // Reference back to Strapi
  };
}

interface MedusaVariant {
  id: string;
  sku: string;              // e.g., "VOLTX-DDR5-16GB-6000-DIMM"
  title: string;            // e.g., "16GB / 6000 MT/s / DIMM"
  inventory_quantity: number;
  manage_inventory: boolean; // true for Phase 3
  allow_backorder: boolean;  // false for Phase 3
  prices: MedusaPrice[];    // One per region/currency
  weight: number;           // grams (for shipping rate calc)
  length: number;           // mm
  width: number;
  height: number;
  metadata: {
    color?: string;
    rgb_capable?: boolean;
    heat_spreader?: string;
  };
}

interface MedusaPrice {
  id: string;
  currency_code: string;    // "aed" | "inr" | "bdt" | "sar" | "usd"
  amount: number;           // Stored in smallest currency unit (fils/paise/etc)
  region_id?: string;
  price_list_id?: string;   // For promotional pricing
}
```

### 6.4 Sync Rules

| Field | Source of Truth | Sync Direction | Sync Trigger |
|---|---|---|---|
| Product title (EN) | Strapi | Strapi → Medusa | Strapi publish webhook |
| Product description | Strapi | Strapi → Astro (direct) | Astro build |
| Product images | Strapi (Backblaze B2) | Strapi → Medusa metadata | Strapi publish webhook |
| Product slug / handle | Strapi | Strapi → Medusa | Strapi publish webhook |
| Product pricing (AED/INR/etc) | Medusa | Medusa only | Manual in Medusa Admin |
| Inventory quantity | Medusa | Medusa only | Manual / ERP (future) |
| Product variants | Medusa | Medusa only | Manual in Medusa Admin |
| `isSellable` flag | Strapi | Strapi → Medusa (status) | Strapi publish webhook |
| SEO metadata | Strapi | Strapi → Astro (direct) | Astro build |
| Localised content (AR/RU/ZH-CN/FR) | Strapi | Strapi → Astro (direct) | Astro build |

**Note:** Pricing is intentionally managed only in Medusa Admin to prevent accidental price overwrites from CMS edits. The content team in Strapi cannot set prices; only TwinMOS PM or designated admin can change prices in Medusa.

---

## 7. Storefront Pages

### 7.1 Page Inventory

| URL Pattern | Rendering | Auth Required | Description |
|---|---|---|---|
| `/products/` | SSG | No | Product listing / catalogue |
| `/products/{category}/` | SSG | No | Category listing page |
| `/products/{slug}/` | SSG + Server Island | No | Product detail page |
| `/cart/` | CSR | No | Full cart page |
| `/checkout/` | SSR | No (guest allowed) | Checkout step 1: Contact info |
| `/checkout/shipping/` | SSR | No | Checkout step 2-3: Address + Shipping |
| `/checkout/payment/` | SSR | No | Checkout step 4: Payment + Review |
| `/checkout/success/` | SSR | No | Order confirmation page |
| `/checkout/cancel/` | SSR | No | Checkout cancelled / payment failed |
| `/account/` | SSR | Yes | Customer account dashboard |
| `/account/orders/` | SSR | Yes | Order history list |
| `/account/orders/{id}/` | SSR | Yes | Order detail view |
| `/account/loyalty/` | SSR | Yes | Loyalty points balance and history |
| `/account/referral/` | SSR | Yes | Referral programme dashboard |
| `/search/` | CSR | No | MeiliSearch-powered search results |

### 7.2 Product Detail Page Specification

**URL:** `/products/{slug}/`
**Rendering:** SSG for static content + Server Island for dynamic price/stock

**Page Sections:**

```
┌─────────────────────────────────────────────────────────┐
│  Breadcrumb: Home > Memory > DDR5 > VOLTX DDR5          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌────────────────────────────────┐   │
│  │   Product   │  │  Product Title                  │   │
│  │   Images    │  │  Short Description              │   │
│  │  (gallery)  │  │  ─────────────────────────────  │   │
│  │             │  │  Variant Selector               │   │
│  │             │  │  (capacity / speed / form)      │   │
│  │             │  │  ─────────────────────────────  │   │
│  │             │  │  [SERVER ISLAND]                │   │
│  │             │  │  Price: AED 299.00              │   │
│  │             │  │  Tax: Incl. 5% VAT              │   │
│  │             │  │  Stock: In Stock (12 units)     │   │
│  │             │  │  ─────────────────────────────  │   │
│  │             │  │  Qty: [−] [1] [+]               │   │
│  │             │  │  [      ADD TO CART      ]      │   │
│  │             │  │  ─────────────────────────────  │   │
│  │             │  │  Shipping: Free over AED 200    │   │
│  │             │  │  Warranty: 3 Years Limited      │   │
│  └─────────────┘  └────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  TABS: Description | Specifications | Compatibility      │
├─────────────────────────────────────────────────────────┤
│  Related Products (Strapi `relatedProducts` field)       │
└─────────────────────────────────────────────────────────┘
```

---

## 8. User Stories

### 8.1 Browsing Journey

| ID | As a... | I want to... | So that... | Acceptance Criteria |
|---|---|---|---|---|
| US-001 | Visitor | Browse all TwinMOS products organised by category | I can discover the right product for my needs | Category pages load in <2s; all products with `isSellable=true` shown |
| US-002 | Visitor | Filter products by type (DDR5/DDR4/NVMe/SATA/USB) | I can narrow down quickly | Filter updates page without full reload; URL reflects active filters |
| US-003 | Visitor | Search for a product by name or spec | I can find a specific SKU quickly | MeiliSearch returns results in <500ms; search field in header available on all pages |
| US-004 | Visitor | View a product detail page with full specs and price | I can make an informed purchase decision | Price shown in my region's currency; specs table fully rendered; images load via Backblaze B2 |
| US-005 | Visitor | See stock status on a product page | I know whether I can buy now or not | "In Stock", "Low Stock" (<10 units), or "Out of Stock" displayed via Server Island |
| US-006 | Visitor | Select a product variant (e.g., 16GB DDR5 6000 MT/s) | I can buy the exact specification I need | Variant selector updates price and stock status; URL updated with variant ID |

### 8.2 Cart Journey

| ID | As a... | I want to... | So that... | Acceptance Criteria |
|---|---|---|---|---|
| US-007 | Visitor | Add a product to my cart | I can proceed to purchase | Cart badge increments; mini-cart slides in showing added item |
| US-008 | Visitor | Update item quantity in cart | I can buy the right amount | Quantity update calls Medusa API; cart total updates in real time |
| US-009 | Visitor | Remove an item from cart | I can change my mind | Item removed; cart total recalculated; empty cart state shown if last item |
| US-010 | Visitor | See my cart with subtotal, estimated tax, and shipping | I know what I will pay before checkout | Cart page shows subtotal, estimated tax (based on saved region), and free shipping indicator |
| US-011 | Registered User | Have my cart saved when I leave and return | I don't lose my selections | Cart persisted in Medusa (server-side); restored on next visit |
| US-012 | Registered User | Have my guest cart merged with my account cart on login | I don't lose items added before logging in | Cart merge logic: local cart items added to server cart on auth |

### 8.3 Checkout Journey

| ID | As a... | I want to... | So that... | Acceptance Criteria |
|---|---|---|---|---|
| US-013 | Guest | Check out without creating an account | I can buy quickly without friction | Guest checkout flow available; only email required for order tracking |
| US-014 | Guest | Enter my shipping address and see available carriers with rates | I can choose my preferred delivery option | Aramex/FedEx/DHL rates returned in real time based on destination |
| US-015 | Guest | Pay with Visa/Mastercard via Stripe Checkout | I can complete my purchase securely | Stripe Checkout redirect; payment processed; redirect to /checkout/success |
| US-016 | Registered User | Check out with my saved address pre-filled | I have a faster checkout experience | Address field pre-populated from Better Auth customer profile |
| US-017 | Registered User | Apply my loyalty points during checkout | I can get a discount using earned points | Loyalty toggle shown; points applied; order total reduced; points deducted from balance |
| US-018 | Buyer | Enter a discount/coupon code | I can apply a promotional discount | Coupon field in checkout; Medusa promotion API validates and applies discount |
| US-019 | Buyer | Receive an order confirmation email | I have a record of my purchase | Resend email delivered within 2 minutes with order number, items, total, estimated delivery |
| US-020 | Buyer | See a confirmation page with my order number after payment | I know my order was successful | /checkout/success page shows order number and "Track Order" and "Continue Shopping" CTAs |

### 8.4 Account and Order Management Journey

| ID | As a... | I want to... | So that... | Acceptance Criteria |
|---|---|---|---|---|
| US-021 | Registered User | View my order history | I can track past purchases | /account/orders lists all orders with date, status, total |
| US-022 | Registered User | View order details | I can see exactly what I ordered | /account/orders/{id} shows line items, shipping address, tracking number when available |
| US-023 | Registered User | Reorder a previous order | I can quickly repurchase the same items | "Reorder" button adds all eligible items back to cart |
| US-024 | Registered User | See my loyalty points balance | I know what I can redeem | /account/loyalty shows balance, tier, history of earned/redeemed points |

---

## 9. Business Rules

### 9.1 Business Rules Catalogue

| ID | Category | Rule | Enforcement Layer |
|---|---|---|---|
| BR-ECOM-001 | Pricing | All product prices are stored in Medusa in the smallest currency unit (fils for AED, paise for INR, poisha for BDT, halala for SAR, cents for USD) | Medusa |
| BR-ECOM-002 | Pricing | Prices displayed on storefront are always rounded to 2 decimal places using currency-standard rounding | Astro storefront |
| BR-ECOM-003 | Pricing | UAE prices are displayed tax-inclusive (VAT included in displayed price) per UAE consumer protection norms | Astro storefront |
| BR-ECOM-004 | Pricing | India prices are displayed tax-exclusive; GST shown as a separate line at checkout | Astro storefront + Stripe Tax |
| BR-ECOM-005 | Pricing | KSA prices are displayed tax-exclusive; VAT shown as a separate line | Astro storefront + Stripe Tax |
| BR-ECOM-006 | Pricing | International (USD) prices are displayed with no tax; buyer is responsible for import duties | Astro storefront |
| BR-ECOM-007 | Pricing | Currency is determined by the detected region (based on IP geolocation via Cloudflare headers) with manual override allowed | Astro storefront + Cloudflare |
| BR-ECOM-008 | Cart | Maximum 10 unique SKUs per cart | Medusa cart service validation |
| BR-ECOM-009 | Cart | Maximum quantity 5 per SKU per cart | Medusa cart service validation |
| BR-ECOM-010 | Cart | Abandoned cart is defined as a cart with no activity for 24 hours | Medusa cart + HubSpot trigger |
| BR-ECOM-011 | Checkout | Inventory is reserved (soft-locked) for 30 minutes once checkout is initiated | Medusa inventory module |
| BR-ECOM-012 | Checkout | If a customer fails to complete payment within 30 minutes, the cart is unlocked and inventory reservation released | Medusa inventory module |
| BR-ECOM-013 | Checkout | Minimum order value: AED 50 / INR 500 / BDT 500 / SAR 50 / USD 15 | Medusa cart service validation |
| BR-ECOM-014 | Payment | TwinMOS never stores raw card numbers, CVVs, or full card data in any TwinMOS system | Stripe Checkout (SAQ A scope) |
| BR-ECOM-015 | Shipping | Free shipping thresholds are applied per market (see Section 5.3) | Medusa shipping module |
| BR-ECOM-016 | Orders | Order IDs follow the format: TWN-{YEAR}-{NNNNNN} (e.g., TWN-2026-000001) | Medusa order module (custom ID generator) |
| BR-ECOM-017 | Orders | A PDF invoice must be generated and stored for every completed order (7-year retention for UAE VAT compliance) | Resend + Backblaze B2 |
| BR-ECOM-018 | Inventory | Products with inventory_quantity = 0 and allow_backorder = false must show "Out of Stock" and disable the Add to Cart button | Medusa + Astro storefront |
| BR-ECOM-019 | Inventory | Products with inventory_quantity ≤ 10 must show a "Low Stock" indicator | Astro Server Island |
| BR-ECOM-020 | Promotions | Only one coupon/promotion code may be applied per order (cannot stack promotions in Phase 3) | Medusa promotions module |

---

## 10. Functional Requirements

### 10.1 Product Pages

| ID | Requirement | Priority | Owner |
|---|---|---|---|
| FR-ECOM-001 | The product detail page MUST display the product price in the detected market currency, fetched from Medusa via Server Island | Must Have | Dev A |
| FR-ECOM-002 | The product detail page MUST display stock status ("In Stock", "Low Stock", or "Out of Stock") fetched from Medusa inventory module | Must Have | Dev A |
| FR-ECOM-003 | The product detail page MUST include a variant selector that updates price, stock status, and SKU when a different variant is selected | Must Have | Dev A |
| FR-ECOM-004 | The product detail page MUST include a quantity selector with − and + controls, constrained to 1–5 units (per BR-ECOM-009) | Must Have | Dev A |
| FR-ECOM-005 | The "Add to Cart" button MUST be disabled when the selected variant is out of stock | Must Have | Dev A |
| FR-ECOM-006 | Adding to cart MUST trigger the mini-cart sidebar to open with the newly added item visible | Must Have | Dev A |
| FR-ECOM-007 | The product page MUST display warranty period and box contents (sourced from Strapi) | Should Have | Dev A |
| FR-ECOM-008 | The product page MUST display related product cards in a horizontal scroll row | Should Have | Dev A |
| FR-ECOM-009 | The product page MUST include structured data (JSON-LD schema: Product, Offer, Review forthcoming Phase 4) | Should Have | Dev A |

### 10.2 Cart

| ID | Requirement | Priority | Owner |
|---|---|---|---|
| FR-ECOM-010 | The cart MUST persist across page reloads for guests via localStorage; for registered users, the cart MUST be server-side in Medusa | Must Have | Dev A + Dev B |
| FR-ECOM-011 | The cart header badge MUST display the current item count, updated via Server Island without full page reload | Must Have | Dev A |
| FR-ECOM-012 | The cart page (/cart) MUST display all line items with product image, name, variant, unit price, quantity control, line total, and remove button | Must Have | Dev A |
| FR-ECOM-013 | The cart page MUST display subtotal, estimated shipping (when region is known), estimated tax, and total | Must Have | Dev A |
| FR-ECOM-014 | The cart page MUST display a free shipping progress bar when the cart total is below the free shipping threshold for the detected market | Should Have | Dev A |
| FR-ECOM-015 | The cart page MUST show an empty state with product recommendations when no items are in the cart | Should Have | Dev A |
| FR-ECOM-016 | On user login, if a localStorage cart exists, it MUST be merged with the server-side cart before the cart page is rendered | Must Have | Dev B |

### 10.3 Checkout

| ID | Requirement | Priority | Owner |
|---|---|---|---|
| FR-ECOM-017 | Checkout Step 1 MUST capture email address and optionally prompt the user to log in or create an account | Must Have | Dev A |
| FR-ECOM-018 | Checkout Step 2 MUST capture full shipping address with country selector, validated for completeness before proceeding | Must Have | Dev A |
| FR-ECOM-019 | Checkout Step 3 MUST display shipping method options with carrier name, service level, estimated delivery, and cost, sourced from real-time carrier API | Must Have | Dev A + Dev B |
| FR-ECOM-020 | Checkout Step 4 MUST display an order review summary with all line items, shipping, tax, discount, and total before payment | Must Have | Dev A |
| FR-ECOM-021 | Checkout MUST support a coupon/discount code input field that validates the code against the Medusa promotions API | Must Have | Dev A + Dev B |
| FR-ECOM-022 | Registered users MUST see a loyalty points redemption toggle at checkout, showing their available balance and the discount that will be applied | Should Have | Dev A + Dev B |
| FR-ECOM-023 | Checkout MUST redirect to Stripe Checkout for payment processing (SAQ A) | Must Have | Dev B |
| FR-ECOM-024 | Checkout form fields MUST be auto-saved to localStorage every 5 seconds to prevent data loss on accidental navigation | Should Have | Dev A |
| FR-ECOM-025 | The checkout flow MUST be fully accessible: keyboard-navigable, WCAG 2.1 AA compliant, screen reader tested | Must Have | Dev A |

### 10.4 Order Confirmation and Order Management

| ID | Requirement | Priority | Owner |
|---|---|---|---|
| FR-ECOM-026 | The /checkout/success page MUST display the order number (TWN-{YEAR}-{NNNNNN} format), items purchased, delivery estimate, and CTAs for "Track Order" and "Continue Shopping" | Must Have | Dev A |
| FR-ECOM-027 | An order confirmation email MUST be sent via Resend within 2 minutes of payment confirmation, containing order number, line items, delivery address, estimated delivery, and a link to track the order | Must Have | Dev B |
| FR-ECOM-028 | The /account/orders page MUST display a list of all past orders with order date, order number, status, and total | Must Have | Dev A + Dev B |
| FR-ECOM-029 | The /account/orders/{id} page MUST display full order details including line items, quantities, prices, shipping address, carrier, tracking number (when available), and order status | Must Have | Dev A + Dev B |
| FR-ECOM-030 | A "Reorder" button on the order detail page MUST add all in-stock items from that order to the current cart | Should Have | Dev A + Dev B |

---

## 11. Non-Functional Requirements

### 11.1 Performance Requirements

| ID | Requirement | Target | Measurement Method |
|---|---|---|---|
| NFR-PERF-001 | Product detail page Largest Contentful Paint (LCP) | ≤2.5s (good) | PageSpeed Insights; Lighthouse CI |
| NFR-PERF-002 | Checkout page Time to Interactive (TTI) | ≤3.0s | Lighthouse |
| NFR-PERF-003 | Cart API response time (add to cart) | ≤300ms P95 | Coolify logs; k6 load test |
| NFR-PERF-004 | Stripe Checkout redirect time | ≤2.0s | Browser DevTools; PostHog |
| NFR-PERF-005 | Product listing page: 20 products rendering | ≤1.5s LCP | PageSpeed Insights |
| NFR-PERF-006 | MeiliSearch product search result | ≤500ms P95 | MeiliSearch metrics dashboard |

### 11.2 Security Requirements

| ID | Requirement | Standard |
|---|---|---|
| NFR-SEC-001 | TwinMOS never handles raw card data; all payment processing via Stripe Checkout redirect | PCI DSS SAQ A |
| NFR-SEC-002 | All e-commerce API endpoints served over TLS 1.3 minimum | TLS 1.3 |
| NFR-SEC-003 | HSTS header with min-age 31536000 on all production domains | OWASP |
| NFR-SEC-004 | Rate limiting on checkout initiation endpoint: 5 attempts per IP per minute | OWASP |
| NFR-SEC-005 | Stripe webhook signature verification on all incoming webhooks | Stripe best practice |
| NFR-SEC-006 | No card data, PAN fragments, or CVV data in application logs, Strapi, or Medusa | PCI DSS |
| NFR-SEC-007 | Cloudflare WAF active for e-commerce pages | Cloudflare WAF |
| NFR-SEC-008 | Medusa Admin panel accessible only via IP allowlist or VPN | Access control |
| NFR-SEC-009 | External penetration test before go-live; all Critical and High findings resolved | Phase 3 gate criterion |

### 11.3 Availability Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-AVAIL-001 | Storefront uptime (Cloudflare Pages) | 99.99% (Cloudflare SLA) |
| NFR-AVAIL-002 | Medusa backend uptime | 99.9% per month |
| NFR-AVAIL-003 | Recovery Time Objective (RTO) on full server failure | ≤4 hours |
| NFR-AVAIL-004 | Recovery Point Objective (RPO) | ≤1 hour (hourly DB backups) |
| NFR-AVAIL-005 | Planned maintenance window | Sundays 02:00–06:00 UAE time |

### 11.4 Scalability Requirements

| ID | Requirement |
|---|---|
| NFR-SCALE-001 | System must handle 200 concurrent checkout sessions without performance degradation (verified by load test in Month 12) |
| NFR-SCALE-002 | Product catalogue must support up to 500 SKUs without search or listing performance regression |
| NFR-SCALE-003 | Database connection pool configured for ≥20 concurrent Medusa connections |

### 11.5 Compliance Requirements

| ID | Requirement | Region |
|---|---|---|
| NFR-COMP-001 | UAE VAT: 5% VAT applied to all UAE orders; TRN displayed on invoices; 7-year invoice retention | UAE |
| NFR-COMP-002 | India GST: 18% GST applied; GSTIN displayed; GST breakdown on invoices | India |
| NFR-COMP-003 | KSA VAT: 15% VAT applied; KSA TRN displayed on invoices | KSA |
| NFR-COMP-004 | GDPR: Customer data handled per privacy policy; consent captured at registration | EU customers |
| NFR-COMP-005 | Accessibility: WCAG 2.1 AA for all storefront and checkout pages | All markets |

---

## 12. Medusa.js v2 Configuration

### 12.1 Installation and Environment

```bash
# Medusa.js v2 installation
npx create-medusa-app@latest twinmos-medusa \
  --db-url postgresql://medusa_user:password@localhost:5432/medusa_db \
  --skip-db-setup false

# Install required plugins and modules
cd twinmos-medusa
npm install \
  @medusajs/payment-stripe \
  @medusajs/fulfillment \
  @medusajs/inventory \
  @medusajs/stock-location \
  medusa-plugin-strapi
```

### 12.2 Medusa Configuration File

```typescript
// medusa-config.ts
import { defineConfig } from "@medusajs/medusa";
import { Modules } from "@medusajs/framework/utils";

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,   // Astro storefront origin
      adminCors: process.env.ADMIN_CORS,   // Medusa Admin origin
      authCors: process.env.AUTH_CORS,     // Better Auth origin
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
    redisUrl: process.env.REDIS_URL,       // For event bus / job queue
  },
  admin: {
    disable: false,
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    // Payment: Stripe
    {
      resolve: "@medusajs/payment-stripe",
      options: {
        apiKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        capture: true,     // Auto-capture payments
        automaticPaymentMethods: true,
      },
    },
    // Inventory
    {
      resolve: "@medusajs/inventory",
    },
    // Stock Location
    {
      resolve: "@medusajs/stock-location",
    },
    // Fulfillment
    {
      resolve: "@medusajs/fulfillment",
    },
    // Strapi Sync
    {
      resolve: "medusa-plugin-strapi",
      options: {
        strapiProtocol: "https",
        strapiHost: process.env.STRAPI_HOST,
        strapiApiToken: process.env.STRAPI_API_TOKEN,
        strapiVersion: "v5",
        autoSyncEntities: ["product", "product-category"],
      },
    },
  ],
});
```

### 12.3 Region Configuration

Regions must be created in the Medusa Admin UI (or via migration script):

```typescript
// Seed script: create regions
const regions = [
  {
    name: "UAE",
    currency_code: "aed",
    tax_rate: 5,           // 5% VAT
    tax_code: "AE_VAT",
    countries: ["ae"],
    payment_providers: ["stripe"],
    fulfillment_providers: ["aramex", "fedex", "dhl"],
  },
  {
    name: "India",
    currency_code: "inr",
    tax_rate: 18,          // 18% GST
    tax_code: "IN_GST",
    countries: ["in"],
    payment_providers: ["stripe"],
    fulfillment_providers: ["fedex", "dhl"],
  },
  {
    name: "Bangladesh",
    currency_code: "bdt",
    tax_rate: 15,
    tax_code: "BD_VAT",
    countries: ["bd"],
    payment_providers: ["stripe"],
    fulfillment_providers: ["dhl"],
  },
  {
    name: "KSA",
    currency_code: "sar",
    tax_rate: 15,          // 15% VAT
    tax_code: "SA_VAT",
    countries: ["sa"],
    payment_providers: ["stripe"],
    fulfillment_providers: ["aramex", "fedex", "dhl"],
  },
  {
    name: "International",
    currency_code: "usd",
    tax_rate: 0,
    countries: [],         // Catch-all
    payment_providers: ["stripe"],
    fulfillment_providers: ["fedex", "dhl"],
  },
];
```

---

## 13. Strapi ↔ Medusa Sync Architecture

### 13.1 Sync Trigger Mechanisms

| Trigger | Mechanism | Frequency |
|---|---|---|
| Strapi product published | Strapi lifecycle hook → `medusa-plugin-strapi` | On each publish |
| Strapi product updated | Strapi lifecycle hook → `medusa-plugin-strapi` | On each save |
| Strapi product unpublished | Lifecycle hook → Medusa product status = draft | On unpublish |
| Strapi product deleted | Lifecycle hook → Medusa product status = draft (soft delete, not hard delete) | On delete |
| Manual full resync | Medusa Admin action / CLI command | Ad hoc |

### 13.2 Sync Error Handling

If the Strapi → Medusa sync fails:
1. Strapi logs the failure in the server log with the Strapi entity ID and error message
2. Medusa admin dashboard shows a sync error badge (custom plugin)
3. TwinMOS PM is notified via automated email (Resend) of sync failures
4. The product state in Medusa remains unchanged (last successful sync state)
5. Manual resync can be triggered from Medusa Admin

### 13.3 Strapi Lifecycle Hook Implementation

```typescript
// Strapi: /src/api/product/content-types/product/lifecycles.ts
export default {
  async afterCreate(event: any) {
    await triggerMedusaSync(event.result);
  },
  async afterUpdate(event: any) {
    await triggerMedusaSync(event.result);
  },
  async afterDelete(event: any) {
    await triggerMedusaUnpublish(event.result.id);
  },
};

async function triggerMedusaSync(strapiProduct: any) {
  const medusaApiUrl = process.env.MEDUSA_ADMIN_URL;
  const response = await fetch(`${medusaApiUrl}/admin/plugins/strapi/sync`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.MEDUSA_ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ strapiId: strapiProduct.id }),
  });
  if (!response.ok) {
    strapi.log.error(`Medusa sync failed for product ${strapiProduct.id}`);
  }
}
```

---

## 14. Multi-Currency and Multi-Region Configuration

### 14.1 Region Detection Flow

```
Browser request arrives at Cloudflare edge
        │
        │ Cloudflare adds CF-IPCountry header
        ▼
Astro SSR middleware reads CF-IPCountry
        │
        │ Maps country to Medusa region
        ▼
┌──────────────────────────────────┐
│  Country → Region mapping:       │
│  AE → UAE region (AED)          │
│  IN → India region (INR)        │
│  BD → Bangladesh region (BDT)   │
│  SA → KSA region (SAR)          │
│  * → International region (USD) │
└──────────────────────────────────┘
        │
        │ Region ID stored in cookie (region_id)
        │ User can override via currency selector
        ▼
All Medusa API calls include region_id parameter
```

### 14.2 Price Display Formatting

```typescript
// Astro utility: formatPrice.ts
export function formatPrice(
  amountInSmallestUnit: number,
  currencyCode: string,
  locale: string
): string {
  const amount = amountInSmallestUnit / 100; // Convert from fils/paise to AED/INR

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Usage examples:
// formatPrice(29900, "aed", "en-AE") → "AED 299.00"
// formatPrice(2499900, "inr", "en-IN") → "₹24,999.00"
// formatPrice(349900, "sar", "ar-SA") → "SAR 3,499.00"
```

---

## 15. Error Handling and Fallback States

### 15.1 Error Scenarios and Fallbacks

| Scenario | User-Facing Behaviour | Technical Response |
|---|---|---|
| Medusa API unreachable | Product page shows "Price unavailable; please refresh" via Server Island error boundary | Astro error boundary renders fallback UI; alert sent to TwinMOS PM |
| Out of stock discovered at checkout | Checkout step shows item as unavailable with "Remove from cart" option | Medusa inventory check at checkout initiation; cart invalidated for that item |
| Stripe session creation fails | "Payment service temporarily unavailable. Please try again." with retry button | 3 retries with exponential backoff; if all fail, error page with support email |
| Shipping API timeout | Fallback flat-rate shipping options displayed (pre-configured in Medusa) | Circuit breaker on carrier API; flat rates as fallback |
| Cart merge conflict (same SKU in both carts) | Quantities summed, capped at max 5 per BR-ECOM-009 | Merge logic enforces cap silently |
| Currency unavailable for product | Redirect to USD pricing with notice banner | Medusa returns USD price if regional price not set |
| Session timeout during checkout | "Your session has expired. Your cart has been saved." with return-to-cart CTA | localStorage cart preserved; server cart retained for 24h |

---

## 16. Acceptance Criteria

The e-commerce platform is considered functionally complete when all of the following acceptance criteria are met:

| ID | Acceptance Criterion | Verification Method |
|---|---|---|
| AC-ECOM-001 | A guest user can add a product to cart and complete purchase via Stripe Checkout in each of the 5 markets (AED/INR/BDT/SAR/USD) | Manual UAT for each market |
| AC-ECOM-002 | A registered user can log in, have their cart merged, pre-fill address, and complete checkout faster than guest | Timed comparison test |
| AC-ECOM-003 | Order confirmation email is received within 2 minutes for every completed test purchase | Email timestamp verification |
| AC-ECOM-004 | Tax is correctly calculated for UAE (5%), India (18%), KSA (15%), and $0 for Bangladesh and International | Stripe Tax test verification |
| AC-ECOM-005 | Shipping rates from at least 2 carriers appear correctly for each market | Carrier API response verification |
| AC-ECOM-006 | Inventory decrements correctly after each purchase and cannot be over-sold | Inventory level check pre/post purchase |
| AC-ECOM-007 | Out-of-stock products show correct status and disable Add to Cart | Manual product status test |
| AC-ECOM-008 | Discount code successfully applies Medusa promotion | Coupon code acceptance test |
| AC-ECOM-009 | Loyalty points redemption reduces order total correctly | Redemption calculation test |
| AC-ECOM-010 | RU, ZH-CN, and FR locale product pages are accessible and display translated content | Locale URL navigation test |
| AC-ECOM-011 | AR checkout is RTL-compliant | Visual review by Arabic speaker |
| AC-ECOM-012 | Checkout page LCP ≤2.5s on production | PageSpeed Insights |
| AC-ECOM-013 | Load test: 200 concurrent checkout sessions, P95 ≤3s | k6 load test report |
| AC-ECOM-014 | All Stripe webhooks processed with <0.1% failure rate | Stripe Dashboard webhook log |
| AC-ECOM-015 | Penetration test: zero Critical or High findings | Pen test report |

---

## 17. Dependencies on Other Specifications

| Specification | Reference | Dependency |
|---|---|---|
| Cart and Checkout Flow | TWN-P3-CART-2026-001 | Defines step-by-step checkout UI, cart business rules, error states, and sequence diagrams |
| Payment Processing | TWN-P3-PAY-2026-001 | Defines Stripe configuration, webhook handling, refund process, PCI compliance, and payment method matrix by region |
| Customer Account | Better Auth integration (TWN-BRD-2026-001 §8) | Registered checkout, order history, loyalty balance all require Better Auth session |
| Loyalty Programme | Phase 3 Loyalty Spec (P.3) | Points redemption at checkout depends on loyalty programme backend |
| Shipping Spec | Aramex/FedEx/DHL API integration (P.2 shipping) | Shipping method selection at checkout depends on carrier API integration |
| PostHog Analytics | Phase 3 Analytics Spec (P.4) | E-commerce funnel events must be defined and fired from storefront |
| MeiliSearch | Phase 1 search configuration | Product search on storefront requires synced MeiliSearch index |

---

*TwinMOS Technologies — E-Commerce Functional Specification*
*Reference: TWN-P3-ECOM-2026-001 v1.0 | FINAL | 1 May 2026*
*Classification: Internal — Confidential*
