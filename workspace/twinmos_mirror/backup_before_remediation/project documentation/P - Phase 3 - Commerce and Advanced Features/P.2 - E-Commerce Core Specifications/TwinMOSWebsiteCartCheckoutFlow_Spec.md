# TwinMOS Technologies Corporate Website
# Cart and Checkout Flow Specification

| Field | Value |
|---|---|
| **Document Reference** | TWN-P3-CART-2026-001 |
| **Version** | 1.0 |
| **Status** | FINAL |
| **Date** | 1 May 2026 |
| **Author** | TwinMOS Project Management Office |
| **Owner** | Dev A (Astro Frontend) + Dev B (Strapi + Medusa Backend) |
| **Classification** | Internal — Confidential |
| **Related Documents** | TWN-P3-ECOM-2026-001, TWN-P3-PAY-2026-001, TWN-P3-KICK-2026-001, TWN-BRD-2026-001 v3.0 |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Cart Architecture](#2-cart-architecture)
3. [Cart States](#3-cart-states)
4. [Cart Business Rules](#4-cart-business-rules)
5. [Cart UI Specification](#5-cart-ui-specification)
6. [Checkout Flow — 4 Steps](#6-checkout-flow--4-steps)
7. [Guest Checkout Flow](#7-guest-checkout-flow)
8. [Registered Checkout Flow](#8-registered-checkout-flow)
9. [Order Review Section](#9-order-review-section)
10. [Coupon and Discount Codes](#10-coupon-and-discount-codes)
11. [Loyalty Points Redemption](#11-loyalty-points-redemption)
12. [Payment Step](#12-payment-step)
13. [Order Confirmation Page](#13-order-confirmation-page)
14. [Sequence Diagrams](#14-sequence-diagrams)
15. [Error States](#15-error-states)
16. [Performance Targets](#16-performance-targets)
17. [LocalStorage Draft Preservation](#17-localstorage-draft-preservation)
18. [RTL Layout Support](#18-rtl-layout-support)
19. [Accessibility Requirements](#19-accessibility-requirements)
20. [Acceptance Criteria](#20-acceptance-criteria)

---

## 1. Overview

This document specifies the complete cart and checkout experience for the TwinMOS Technologies e-commerce storefront. The cart and checkout system is the most critical user journey in the entire Phase 3 project — it is the point where a potential customer becomes a paying customer. Every design and implementation decision in this specification prioritises three outcomes:

1. **Conversion** — Minimising friction so customers complete their purchase
2. **Confidence** — Providing clear pricing, tax, and shipping information so customers feel safe to pay
3. **Correctness** — Ensuring inventory, tax, promotions, and payment are calculated accurately

The cart is powered by **Medusa.js v2's Cart API** for server-side persistence (registered users) and supplemented by **localStorage** for guest users. The checkout is a **4-step linear flow** rendered as Astro SSR pages, culminating in a redirect to **Stripe Checkout** for payment (SAQ A PCI compliance).

This specification covers:
- The full technical architecture of the cart (data model, persistence, merge logic)
- All cart UI components (mini-cart, full cart page, cart badge)
- The complete 4-step checkout flow with all states, validations, and transitions
- Guest and registered checkout paths with their differences
- Error handling for all failure scenarios
- Sequence diagrams for the most important flows
- Accessibility and RTL requirements
- Performance targets and acceptance criteria

---

## 2. Cart Architecture

### 2.1 Cart Data Model

The Medusa cart is the source of truth for all cart state. The Medusa cart schema stores:

```typescript
interface MedusaCart {
  id: string;                    // cart_XXXXXXXX (Medusa generated)
  customer_id?: string;          // Set when customer logs in
  email?: string;                // Set at checkout step 1
  region_id: string;             // Determined by IP geolocation
  currency_code: string;         // From region
  items: CartLineItem[];
  shipping_address?: Address;
  billing_address?: Address;
  shipping_methods?: ShippingMethod[];
  payment_session?: PaymentSession;
  discounts?: CartDiscount[];
  gift_cards?: GiftCard[];       // Phase 4
  subtotal: number;              // Smallest currency unit
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  metadata: {
    locale: string;              // Active storefront locale
    loyalty_points_redeemed?: number;
    loyalty_discount_applied?: number;
  };
}

interface CartLineItem {
  id: string;
  cart_id: string;
  variant_id: string;
  product_id: string;
  variant: MedusaVariant;
  title: string;
  description: string;          // Variant title
  thumbnail: string;            // Image URL (Backblaze B2)
  quantity: number;
  unit_price: number;           // Price per unit in smallest currency unit
  subtotal: number;             // unit_price × quantity
  tax_total: number;
  total: number;
  metadata: {
    strapi_product_slug: string; // For linking back to product page
  };
}
```

### 2.2 Cart Persistence Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GUEST USER                               │
│                                                                 │
│  Browser (localStorage)                                         │
│  ┌─────────────────────────┐                                    │
│  │  cart_id: "cart_abc123" │  ← Medusa cart ID stored locally  │
│  │  region_id: "reg_ae"    │                                    │
│  └─────────────────────────┘                                    │
│              │                                                  │
│              │ All cart operations via Medusa Cart API          │
│              ▼                                                  │
│  ┌─────────────────────────┐                                    │
│  │  MEDUSA CART API        │                                    │
│  │  (Server-side cart)     │  ← Cart data lives in Medusa DB   │
│  │  cart_abc123            │                                    │
│  └─────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    REGISTERED USER                              │
│                                                                 │
│  Browser (localStorage)                                         │
│  ┌─────────────────────────┐                                    │
│  │  cart_id: "cart_xyz789" │  ← Medusa cart ID (after merge)   │
│  └─────────────────────────┘                                    │
│              │                                                  │
│              │ Cart associated with customer_id in Medusa       │
│              ▼                                                  │
│  ┌─────────────────────────┐                                    │
│  │  MEDUSA CART API        │                                    │
│  │  cart_xyz789            │                                    │
│  │  customer_id: "cust_111"│  ← Cart linked to account         │
│  └─────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Cart Merge Logic (Guest → Registered)

When a guest user logs in and they have an active localStorage cart:

```typescript
// Executed in Astro SSR middleware on auth session establishment
async function mergeGuestCart(
  guestCartId: string,
  customerId: string,
  medusaClient: MedusaClient
): Promise<string> {
  // 1. Fetch the guest cart from Medusa
  const guestCart = await medusaClient.carts.retrieve(guestCartId);

  // 2. Check if customer already has an active cart
  const existingCustomerCart = await medusaClient.carts.findByCustomer(customerId);

  if (!existingCustomerCart) {
    // 3a. No existing customer cart: simply associate guest cart with customer
    const updatedCart = await medusaClient.carts.update(guestCartId, {
      customer_id: customerId,
    });
    return updatedCart.id;
  }

  // 3b. Existing customer cart: merge guest items into customer cart
  for (const item of guestCart.items) {
    const existingItem = existingCustomerCart.items.find(
      (i) => i.variant_id === item.variant_id
    );

    if (existingItem) {
      // Item already in customer cart: sum quantities, cap at 5 (BR-ECOM-009)
      const newQuantity = Math.min(existingItem.quantity + item.quantity, 5);
      await medusaClient.carts.lineItems.update(
        existingCustomerCart.id,
        existingItem.id,
        { quantity: newQuantity }
      );
    } else {
      // New item: add to customer cart
      await medusaClient.carts.lineItems.create(existingCustomerCart.id, {
        variant_id: item.variant_id,
        quantity: Math.min(item.quantity, 5),
      });
    }
  }

  // 4. Delete the guest cart (or leave to expire)
  await medusaClient.carts.delete(guestCartId);

  // 5. Clear localStorage cart_id; store customer cart ID
  // (Done client-side after redirect)

  return existingCustomerCart.id;
}
```

### 2.4 Cart Badge — Server Island Implementation

The cart badge in the site header must display the current item count in real time without requiring a full page reload. This is implemented as an Astro Server Island:

```astro
---
// CartBadge.astro (Server Island component)
// This component is rendered server-side on each request
// so the count is always accurate without client JS required

import { getCartFromRequest } from "../lib/cart";

const cart = await getCartFromRequest(Astro.request);
const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
---

<div
  id="cart-badge"
  class="cart-badge"
  aria-label={`Shopping cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
>
  <svg aria-hidden="true"><!-- Cart icon SVG --></svg>
  {itemCount > 0 && (
    <span class="cart-count" aria-hidden="true">{itemCount}</span>
  )}
</div>
```

The Server Island renders on each page request using the current session's cart, ensuring the badge count is always accurate. For instant feedback after add-to-cart actions, a lightweight client-side counter is incremented immediately, then reconciled with the server count on the next navigation.

---

## 3. Cart States

| State | Definition | Trigger | UI Behaviour |
|---|---|---|---|
| **Empty** | Cart exists in Medusa but has zero line items | All items removed; new session | Show empty cart message + product recommendations |
| **Active** | Cart has ≥1 line item and was updated within the last 24 hours | Item added or updated | Normal cart display; mini-cart accessible |
| **Checkout In Progress** | Checkout initiated; inventory reserved for 30 minutes | Customer navigates to /checkout | Cart locked; items show "Reserved" status |
| **Abandoned** | Cart has ≥1 item but no activity for 24 hours | 24h inactivity timer | HubSpot webhook triggered; abandoned cart email sequence starts |
| **Converted** | Checkout completed; order created | Stripe payment confirmed, webhook received | Cart cleared; replaced with new empty cart |
| **Expired** | Cart reservation expired (30 min at checkout, no payment) | 30-minute reservation timeout | Inventory released; customer redirected back to cart with notice |

### 3.1 Cart State Transition Diagram

```
            ┌───────────────┐
            │     EMPTY     │
            │  (no items)   │
            └───────┬───────┘
                    │ Item added
                    ▼
            ┌───────────────┐
            │    ACTIVE     │◄──────────────────────────────┐
            │  (items in    │                                │
            │   cart)       │                                │ Item updated/added
            └───────┬───────┘                                │
                    │                    ┌──────────────────┐│
                    │ Checkout           │    ABANDONED     ││
                    │ initiated          │ (24h inactivity) │┤
                    ▼                    └──────────────────┘│
     ┌──────────────────────────┐               ↑           │
     │   CHECKOUT IN PROGRESS   │    24h inactivity         │
     │  (inventory reserved     │    timer fires            │
     │   for 30 minutes)        │                           │
     └──────┬──────────┬────────┘                           │
            │          │                                    │
            │Payment   │30 min                              │
            │success   │timeout                             │
            ▼          ▼                                    │
     ┌──────────┐  ┌──────────┐                            │
     │CONVERTED │  │ EXPIRED  │────────────────────────────┘
     │(order    │  │(inventory│  Customer returns;
     │created)  │  │released) │  cart reset to Active
     └──────────┘  └──────────┘
```

---

## 4. Cart Business Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| CRT-BR-001 | Maximum 10 unique SKUs (distinct variant IDs) per cart | Medusa cart API — returns 400 error if exceeded |
| CRT-BR-002 | Maximum quantity 5 per SKU — anti-hoarding for limited-stock items | Medusa cart API validation + Astro frontend quantity cap |
| CRT-BR-003 | Cart is considered abandoned after 24 hours of inactivity (no add, remove, or update events) | Background job in Medusa (cron-style scheduled task) |
| CRT-BR-004 | Upon checkout initiation, Medusa reserves inventory for up to 30 minutes | Medusa inventory module reservation |
| CRT-BR-005 | If payment is not completed within 30 minutes of checkout initiation, inventory reservation is released and the cart returns to Active state | Medusa scheduled job |
| CRT-BR-006 | When a guest logs in, their localStorage cart is merged with their server-side cart; quantities are summed up to the max of 5 per SKU | Cart merge function (see Section 2.3) |
| CRT-BR-007 | Minimum order value applies per market; attempting to checkout below minimum shows an error: UAE AED 50, India INR 500, Bangladesh BDT 500, KSA SAR 50, International USD 15 | Medusa cart validation at checkout initiation |
| CRT-BR-008 | Only one coupon/promotion code may be applied per cart at a time | Medusa promotions API |
| CRT-BR-009 | If a product becomes out of stock after being added to the cart (e.g., another customer purchases the last unit), the item remains in the cart but is flagged as unavailable at checkout | Medusa inventory check at checkout start |
| CRT-BR-010 | Prices in the cart are locked to the price at the time of adding to cart; price changes in Medusa after an item is added do not update the cart until the cart is refreshed | Medusa line item price lock behaviour |
| CRT-BR-011 | Cart data in localStorage is encrypted using a simple Base64 encoding (not sensitive — only stores the Medusa cart ID, not item details) | Astro client script |
| CRT-BR-012 | Abandoned cart email sequence: first email at 24h, second at 48h, third (final) at 72h | HubSpot workflow + Resend |

---

## 5. Cart UI Specification

### 5.1 Mini-Cart Sidebar

The mini-cart is a right-side slide-in drawer that appears when:
- A user clicks "Add to Cart" on a product page
- A user clicks the cart icon in the header

**Mini-Cart Layout:**

```
┌────────────────────────────────────┐
│  ← Your Cart  (2 items)        [X] │
├────────────────────────────────────┤
│  ┌──────┐  VOLTX DDR5 16GB         │
│  │ IMG  │  6000 MT/s DIMM          │
│  │      │  AED 299.00        Qty: 1│
│  └──────┘                    [−][+]│
│                              [🗑]  │
├────────────────────────────────────┤
│  ┌──────┐  CoreX Pro Gen5 1TB      │
│  │ IMG  │  NVMe SSD                │
│  │      │  AED 599.00        Qty: 1│
│  └──────┘                    [−][+]│
│                              [🗑]  │
├────────────────────────────────────┤
│  Subtotal              AED 898.00  │
│  Shipping              FREE        │
│  Tax (5% VAT)          AED 42.76   │
├────────────────────────────────────┤
│  [   VIEW FULL CART   ]            │
│  [   CHECKOUT (AED 940.76)   ]     │
└────────────────────────────────────┘
```

**Mini-Cart Behaviour:**
- Slides in from the right on a 300ms ease-in-out transition
- Background overlay (opacity 0.5, z-index behind drawer) closes mini-cart on click
- ESC key closes the mini-cart
- Quantity changes call Medusa API immediately; spinner shown during API call
- Remove button shows confirmation tooltip before removing (only on hover; tap = direct remove on mobile)
- Subtotal updates in real time after each quantity change
- If cart total ≥ free shipping threshold, shipping shows "FREE"; otherwise shows estimated shipping rate
- Tax is estimated based on the customer's region; final tax calculated at checkout

### 5.2 Full Cart Page (/cart)

**URL:** `/cart/`
**Rendering:** Client-side (CSR) — fetches cart from Medusa on mount

**Full Cart Page Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (with cart badge)                                        │
├─────────────────────────────────────────────────────────────────┤
│  YOUR CART  (2 items)                                           │
│                                                                 │
│  ┌────────────────────────────────┐  ┌──────────────────────┐  │
│  │ CART ITEMS                     │  │ ORDER SUMMARY         │  │
│  │                                │  │                       │  │
│  │ [ITEM 1]                       │  │ Subtotal     AED 898  │  │
│  │  IMG | VOLTX DDR5 16GB 6000    │  │ Discount     — AED 0  │  │
│  │       AED 299.00 × [1]         │  │ Shipping     FREE     │  │
│  │       Line total: AED 299.00   │  │ Tax (5% VAT) AED 42   │  │
│  │       [Remove]                 │  ├───────────────────────┤  │
│  │                                │  │ Total        AED 940  │  │
│  │ [ITEM 2]                       │  │                       │  │
│  │  IMG | CoreX Pro Gen5 1TB      │  │ [  CHECKOUT  ]        │  │
│  │       AED 599.00 × [1]         │  │                       │  │
│  │       Line total: AED 599.00   │  │ ✓ Secure checkout     │  │
│  │       [Remove]                 │  │ ✓ Free returns (UAE)  │  │
│  │                                │  │ ✓ VAT included        │  │
│  └────────────────────────────────┘  └──────────────────────┘  │
│                                                                 │
│  ─── YOU MIGHT ALSO LIKE ─────────────────────────────────────  │
│  [Product card] [Product card] [Product card]                   │
└─────────────────────────────────────────────────────────────────┘
```

**Free Shipping Progress Bar (when below threshold):**
```
┌──────────────────────────────────────────────────────────────┐
│  🚚  Add AED 102.00 more for FREE shipping                   │
│  [██████████████░░░░░░░░░░] AED 298 / AED 400                │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Empty Cart State

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🛒  Your cart is empty                         │
│                                                             │
│   Looks like you haven't added anything yet.               │
│                                                             │
│         [  CONTINUE SHOPPING  ]                             │
│                                                             │
│   ─── POPULAR PRODUCTS ─────────────────────────────────   │
│   [VOLTX DDR5]  [CoreX Pro]  [Xtreme Gen4]  [USB Drive]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The "Popular Products" section is a static list pre-configured in Strapi (a "Featured Products" block), not dynamically computed, to keep the empty cart state fast and simple.

---

## 6. Checkout Flow — 4 Steps

The checkout is a 4-step linear flow. All steps share the same page layout: step progress indicator at top, step content in the main area, order summary sidebar on the right (hidden on mobile, accessible via an "Order Summary" expandable).

### 6.1 Step Progress Indicator

```
[1 Contact] ──── [2 Shipping] ──── [3 Delivery] ──── [4 Payment]
  ✓ Done           ● Active          ○ Upcoming         ○ Upcoming
```

Each completed step shows a checkmark and the entered summary (e.g., "john@example.com" under Step 1 when on Step 2). Clicking a completed step navigates back to it.

### 6.2 Step 1 — Contact Information

**URL:** `/checkout/`

**Purpose:** Capture customer email, offer login/registration prompt, validate email.

**UI Components:**

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: CONTACT INFORMATION                                │
│                                                             │
│  Email address *                                            │
│  [email@example.com                             ]           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Already have an account?  [Log in]                 │   │
│  │  New here?  [Create an account] — earn loyalty pts  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Phone number (optional, for delivery updates)              │
│  [+971 __ ___ ____                              ]           │
│                                                             │
│  [     CONTINUE TO SHIPPING     ]                           │
└─────────────────────────────────────────────────────────────┘
```

**Validations:**
- Email: valid format (RFC 5321); real-time inline validation on blur
- Email: if already registered, show "This email has an account. [Log in to save your order to your account]" (soft prompt, not a blocker)
- Phone: optional; if provided, must be a valid international format

**On Continue:**
1. Email is set on the Medusa cart (`PUT /store/carts/{id}` with `{ email }`)
2. If guest, proceed to Step 2
3. If user logs in (via Better Auth modal), cart merge is triggered, then proceed to Step 2 with pre-filled address

### 6.3 Step 2 — Shipping Address

**URL:** `/checkout/shipping/`

**Purpose:** Capture the delivery address. Validate completeness. For registered users with a saved address, pre-fill the form.

**UI Components:**

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: DELIVERY ADDRESS                                   │
│                                                             │
│  First Name *          Last Name *                          │
│  [                ]    [                ]                   │
│                                                             │
│  Company (optional)                                         │
│  [                                      ]                   │
│                                                             │
│  Address Line 1 *                                           │
│  [                                      ]                   │
│                                                             │
│  Address Line 2 (Apartment, suite, etc.)                    │
│  [                                      ]                   │
│                                                             │
│  City *                    Postal Code                      │
│  [                ]        [           ]                    │
│                                                             │
│  State / Emirate / Province                                 │
│  [Dropdown or text                      ]                   │
│                                                             │
│  Country *                                                  │
│  [United Arab Emirates ▼               ]                    │
│                                                             │
│  ☐ Save this address to my account (registered users only) │
│                                                             │
│  [  ← BACK  ]       [  CONTINUE TO DELIVERY  ]             │
└─────────────────────────────────────────────────────────────┘
```

**Country Selector Behaviour:**
- Default country from IP geolocation (Cloudflare CF-IPCountry header)
- Changing country updates the Medusa cart region, which refreshes pricing and available shipping methods
- If country change results in currency change, a banner is shown: "Prices have been updated to [CURRENCY] for your selected country."

**Address Validation Rules:**
- First name: required, 1–50 chars
- Last name: required, 1–50 chars
- Address Line 1: required, 5–100 chars
- City: required, 2–50 chars
- Country: required
- Postal code: optional but recommended (required for India)
- State/Emirate: required for India (for GST calculation), UAE (Emirate), KSA

**On Continue:**
1. Address is set on the Medusa cart (`PUT /store/carts/{id}` with `{ shipping_address }`)
2. Medusa returns available shipping methods for the address/region
3. Proceed to Step 3

### 6.4 Step 3 — Shipping Method Selection

**URL:** `/checkout/delivery/`

**Purpose:** Display available shipping carriers and services with real-time rates and ETAs. Customer selects their preferred shipping option.

**UI Components:**

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: DELIVERY METHOD                                    │
│                                                             │
│  Shipping to: Dubai, UAE                                    │
│                                                             │
│  ○  [ARAMEX LOGO]  Aramex Express                          │
│     Estimated delivery: 1–2 business days                   │
│     FREE (order qualifies for free shipping)                │
│                                                             │
│  ○  [FEDEX LOGO]   FedEx International Priority             │
│     Estimated delivery: Next business day                   │
│     AED 45.00                                               │
│                                                             │
│  ○  [DHL LOGO]     DHL Express                              │
│     Estimated delivery: 1–3 business days                   │
│     AED 35.00                                               │
│                                                             │
│  ⚠ Rates are calculated based on package weight and         │
│    destination. Final rates confirmed at payment.           │
│                                                             │
│  [  ← BACK  ]       [  CONTINUE TO PAYMENT  ]              │
└─────────────────────────────────────────────────────────────┘
```

**Shipping Rate Retrieval:**

```typescript
// Dev B: Shipping method fetch from Medusa
async function fetchShippingOptions(
  cartId: string,
  region: string
): Promise<ShippingOption[]> {
  const response = await medusaClient.shippingOptions.list({
    cart_id: cartId,
    is_return: false,
  });

  // Medusa calls carrier APIs (Aramex/FedEx/DHL) via fulfillment provider plugins
  // Returns sorted list by price ascending
  return response.shipping_options.map((option) => ({
    id: option.id,
    name: option.name,                     // e.g., "Aramex Express"
    carrierId: option.provider_id,         // e.g., "aramex"
    price: option.amount,                   // In smallest currency unit
    estimatedDays: option.metadata.estimated_days,
    logoUrl: option.metadata.logo_url,
    isFree: option.amount === 0,
  }));
}
```

**Fallback Shipping (when carrier API fails):**
If all carrier APIs are unavailable (circuit breaker open), Medusa returns pre-configured flat-rate shipping options:

| Market | Fallback Option | Price |
|---|---|---|
| UAE | Standard Delivery (3–5 days) | AED 20.00 |
| India | Standard Delivery (7–10 days) | INR 200.00 |
| Bangladesh | Standard Delivery (7–10 days) | BDT 150.00 |
| KSA | Standard Delivery (3–7 days) | SAR 25.00 |
| International | Standard International | USD 25.00 |

A banner informs the customer: "We're having trouble fetching live shipping rates. Estimated rates are shown. Final rates will be confirmed by email."

**On Method Selection:**
1. Selected shipping method ID set on Medusa cart (`POST /store/carts/{id}/shipping-methods`)
2. Proceed to Step 4

### 6.5 Step 4 — Payment and Order Review

**URL:** `/checkout/payment/`

**Purpose:** Present a complete order review and redirect to Stripe Checkout for payment.

**UI Components:**

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: REVIEW AND PAY                                     │
│                                                             │
│  DELIVERY TO:                          [Edit ✎]            │
│  John Smith                                                 │
│  Apartment 501, Building 7, Business Bay                    │
│  Dubai, United Arab Emirates                                │
│                                                             │
│  DELIVERY METHOD:                      [Edit ✎]            │
│  Aramex Express — 1–2 business days — FREE                  │
│                                                             │
│  ORDER ITEMS:                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ VOLTX DDR5 16GB / 6000 MT/s / DIMM    × 1  AED 299   │ │
│  │ CoreX Pro Gen5 NVMe SSD 1TB           × 1  AED 599   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  PROMO CODE:                                                │
│  [Enter code            ] [APPLY]                           │
│                                                             │
│  LOYALTY POINTS:   [○ Use 500 points = AED 5.00 off]       │
│  (Balance: 500 points)                                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Subtotal                              AED 898.00      │ │
│  │ Shipping                                    FREE      │ │
│  │ VAT (5%)                              AED  42.76      │ │
│  │ ──────────────────────────────────────────────────── │ │
│  │ TOTAL                                 AED 940.76      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  PAYMENT:                                                   │
│  🔒 You will be redirected to Stripe's secure payment page │
│     to complete your purchase.                              │
│                                                             │
│  Accepted: [VISA][MC][AMEX][Apple Pay][Google Pay]          │
│                                                             │
│  [  ← BACK  ]     [  PAY AED 940.76 SECURELY  ]            │
│                                                             │
│  🔒 Your payment details are processed by Stripe.           │
│     TwinMOS never stores your card information.             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Guest Checkout Flow

Guest checkout is the primary path for new customers or customers who prefer not to create an account. It requires only an email address to complete a purchase.

### 7.1 Guest Checkout Distinctions

| Feature | Guest | Registered |
|---|---|---|
| Account required | No | Yes |
| Cart persistence | localStorage (Medusa cart ID) | Server-side (Medusa customer cart) |
| Address pre-fill | No | Yes (from saved address) |
| Loyalty points | No | Yes (if enrolled) |
| Order history in account | No | Yes |
| Order tracking | Email link only | /account/orders/{id} |
| Cart merge on future login | Yes | N/A |

### 7.2 Guest Checkout Post-Order Prompt

After a successful guest checkout, the order confirmation page includes a soft prompt to create an account:

```
┌────────────────────────────────────────────────────────────────┐
│  💡 Save time on future orders!                                │
│                                                                │
│  Create an account with john@example.com to:                  │
│  ✓ View order history and track deliveries                     │
│  ✓ Earn loyalty points on every purchase                       │
│  ✓ Faster checkout with saved address                          │
│                                                                │
│  [  CREATE ACCOUNT  ]          [  No thanks  ]                 │
└────────────────────────────────────────────────────────────────┘
```

If the customer clicks "Create Account", Better Auth registration is triggered with the email pre-filled, and the completed order is associated with the new account.

---

## 8. Registered Checkout Flow

### 8.1 Registered Checkout Enhancements

A registered and logged-in customer experiences an accelerated checkout:

1. **Email pre-filled** at Step 1 (read from Better Auth session; not editable to prevent account hijack — customer must log out to change email)
2. **Address pre-filled** at Step 2 (most recently used shipping address from Medusa customer profile)
3. **Saved address selector**: if customer has multiple saved addresses, a dropdown shows them; "Add new address" option available
4. **Loyalty points balance** visible at Step 4 with redemption toggle
5. **Faster reorder**: if navigating to checkout from a "Reorder" button, all steps pre-filled from the previous order

### 8.2 Address Management

Registered users can have up to 5 saved addresses in their Medusa customer profile. At Step 2:

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: DELIVERY ADDRESS                                   │
│                                                             │
│  SAVED ADDRESSES:                                           │
│  ● Home — Business Bay, Dubai, UAE         [Edit] [Use]     │
│  ○ Office — DAFZA, Dubai, UAE              [Edit] [Use]     │
│                                                             │
│  [+ Add a new address]                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Order Review Section

The order review section at Step 4 shows a complete breakdown. All amounts are final (tax-inclusive for UAE; tax-exclusive with tax shown separately for India/KSA).

### 9.1 Line Item Display

Each cart item in the review shows:
- Product thumbnail (50×50px, from Backblaze B2)
- Product name (from Strapi, in active locale)
- Variant description (from Medusa variant title)
- Quantity
- Unit price and line total

### 9.2 Price Summary Breakdown

**UAE (tax-inclusive):**
```
Subtotal (incl. 5% VAT)          AED 940.76
Shipping                          FREE
──────────────────────────────────────────
TOTAL                             AED 940.76
(VAT component: AED 44.80)
```

**India (tax-exclusive):**
```
Subtotal (excl. GST)              ₹ 23,600.00
Shipping                          ₹    299.00
GST (18%)                         ₹  4,248.00
──────────────────────────────────────────────
TOTAL                             ₹ 28,147.00
```

---

## 10. Coupon and Discount Codes

### 10.1 Coupon Field Specification

The coupon field is available at Step 4 (Order Review). Only one coupon may be applied per order (BR-ECOM-020).

**Coupon Field States:**

| State | UI |
|---|---|
| Empty | Input with placeholder "Enter promo code" and [APPLY] button |
| Validating | Spinner in input; [APPLY] button disabled |
| Valid | Green checkmark; discount line shown in order summary; [Remove] link |
| Invalid | Red inline error: "This code is invalid or has expired" |
| Applied (type: % discount) | "SUMMER10 applied — 10% off" → discount shown as line item |
| Applied (type: fixed amount) | "WELCOME20 applied — AED 20 off" → discount shown |
| Minimum order not met | "This code requires a minimum order of AED 200" |

### 10.2 Coupon Validation API Call

```typescript
// Step 4 — Apply Coupon
async function applyDiscount(cartId: string, code: string) {
  try {
    const response = await fetch(
      `/store/carts/${cartId}/discounts/${code}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      // Handle: "discount_not_applicable", "discount_usage_limit_reached",
      //         "discount_condition_not_met"
      return { success: false, error: error.message };
    }

    const { cart } = await response.json();
    return { success: true, cart };
  } catch {
    return { success: false, error: "Could not apply discount. Please try again." };
  }
}
```

---

## 11. Loyalty Points Redemption

### 11.1 Redemption Toggle Specification

The loyalty points redemption toggle appears at Step 4 for registered users who are enrolled in the loyalty programme and have a balance of ≥100 points.

**Redemption Rate:** 100 points = AED 1.00 (or equivalent in other currencies at the day's exchange rate stored in Medusa metadata)

**Toggle UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  LOYALTY POINTS                                             │
│                                                             │
│  Your balance: 750 points  (worth AED 7.50)                │
│                                                             │
│  [○ Apply 750 points for AED 7.50 off this order]          │
│     (Min. 100 points to redeem)                             │
└─────────────────────────────────────────────────────────────┘
```

When toggled ON:
- The maximum redeemable points is `Math.min(user_balance, Math.floor(order_subtotal_in_aed * 100))`
  (Loyalty redemption cannot exceed the order subtotal)
- A "Loyalty Discount" line appears in the order summary: `−AED 7.50`
- The Medusa cart `metadata.loyalty_points_redeemed` is updated
- A custom Medusa discount is applied via the promotions API for the points value

When toggled OFF:
- The loyalty discount is removed from the cart
- Points balance is restored (points are not deducted until order is confirmed)

### 11.2 Points Deduction Timing

Points are deducted from the customer's balance only when the Stripe `checkout.session.completed` webhook is received and the Medusa order is created. Points are NOT deducted during cart or checkout preparation — only on confirmed payment.

---

## 12. Payment Step

### 12.1 Stripe Checkout Redirect Flow

Per ADR-019 (Phase 3 decision: Stripe Checkout redirect, not embedded Elements), the payment step redirects the customer to Stripe's hosted checkout page.

**Why Stripe Checkout redirect (SAQ A) for Phase 3:**
- Simplest PCI compliance path (SAQ A — only verify Stripe is certified)
- No custom payment form to maintain or secure
- Stripe handles 3DS, Apple Pay, Google Pay natively
- Stripe Checkout is mobile-optimised out of the box
- Can switch to embedded Elements (SAQ A-EP) in Phase 3.1 if conversion data justifies the additional complexity

**Stripe Checkout Session Creation (Dev B):**

```typescript
// Create Stripe Checkout session via Medusa payment module
async function createStripeCheckoutSession(cartId: string) {
  const cart = await medusaClient.carts.retrieve(cartId);

  // Medusa's Stripe plugin creates the checkout session
  const paymentSession = await medusaClient.carts.createPaymentSession(cartId, {
    provider_id: "stripe",
  });

  // The session ID is returned by Medusa
  // Redirect customer to Stripe Checkout URL
  const stripeSession = paymentSession.payment_session.data;
  return stripeSession.url; // Stripe-hosted checkout URL
}
```

**Stripe Checkout Session Parameters:**

```typescript
// Stripe session created by Medusa Stripe plugin (internal)
const sessionParams: Stripe.Checkout.SessionCreateParams = {
  mode: "payment",
  currency: cart.region.currency_code,
  line_items: cart.items.map((item) => ({
    price_data: {
      currency: cart.region.currency_code,
      product_data: {
        name: item.title,
        description: item.description,
        images: [item.thumbnail],
        metadata: {
          medusa_variant_id: item.variant_id,
          medusa_product_id: item.product_id,
        },
      },
      unit_amount: item.unit_price,
    },
    quantity: item.quantity,
  })),
  shipping_options: [{
    shipping_rate_data: {
      display_name: cart.shipping_methods[0]?.shipping_option?.name,
      type: "fixed_amount",
      fixed_amount: {
        amount: cart.shipping_total,
        currency: cart.region.currency_code,
      },
    },
  }],
  automatic_tax: {
    enabled: true,  // Stripe Tax handles VAT/GST
  },
  customer_email: cart.email,
  metadata: {
    medusa_cart_id: cart.id,
    medusa_region_id: cart.region_id,
    twinmos_locale: cart.metadata?.locale,
    loyalty_points_redeemed: String(cart.metadata?.loyalty_points_redeemed ?? 0),
  },
  success_url: `${process.env.STORE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.STORE_URL}/checkout/cancel`,
};
```

### 12.2 Payment Method Display (Step 4 UI)

Before the "Pay Now" button, the accepted payment methods for the detected market are shown as icon badges:

| Market | Icons Shown |
|---|---|
| UAE | Visa, Mastercard, Amex, Apple Pay, Google Pay |
| India | Visa, Mastercard, RuPay, UPI |
| Bangladesh | Visa, Mastercard |
| KSA | Visa, Mastercard, Mada, Apple Pay |
| International | Visa, Mastercard, Amex |

---

## 13. Order Confirmation Page

### 13.1 URL and Rendering

**URL:** `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
**Rendering:** SSR (Astro SSR adapter)

On load, the page server-side fetches the Medusa order using the Stripe session ID from the query param. If the session ID is valid and the order exists, the confirmation page is rendered. If the session ID is invalid or order not found, redirect to `/checkout/cancel`.

### 13.2 Order Confirmation Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ✓  ORDER CONFIRMED!                                        │
│                                                             │
│  Thank you, John! Your order has been placed.               │
│                                                             │
│  ORDER NUMBER:  TWN-2026-000142                             │
│  CONFIRMATION:  Sent to john@example.com                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ORDER SUMMARY                                       │   │
│  │ VOLTX DDR5 16GB 6000 DIMM        × 1    AED 299    │   │
│  │ CoreX Pro Gen5 NVMe SSD 1TB      × 1    AED 599    │   │
│  │ ─────────────────────────────────────────────────  │   │
│  │ Shipping (Aramex Express)                 FREE     │   │
│  │ VAT (5%)                               AED 42.76   │   │
│  │ TOTAL                                  AED 940.76  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  DELIVERY TO:                                               │
│  John Smith, Business Bay, Dubai, UAE                       │
│  Estimated delivery: 1–2 business days                      │
│                                                             │
│  [  TRACK ORDER  ]      [  CONTINUE SHOPPING  ]             │
│                                                             │
│  ─── CREATE AN ACCOUNT TO EARN LOYALTY POINTS ─────────── │
│  (Guest only — see Section 7.2 for registration prompt)     │
└─────────────────────────────────────────────────────────────┘
```

### 13.3 Order Confirmation Email

Triggered server-side when Stripe webhook `checkout.session.completed` is received. Sent via Resend within 2 minutes.

**Email Contents:**
- TwinMOS logo header
- "Your order is confirmed" subject line
- Order number (TWN-2026-NNNNNN)
- Ordered items with images, names, variants, quantities, and prices
- Delivery address
- Estimated delivery date and carrier
- Order tracking link (when tracking number available)
- Customer support email and phone
- PDF invoice attached (generated at order creation, stored in Backblaze B2)

---

## 14. Sequence Diagrams

### 14.1 Guest Checkout Success Flow

```
Customer         Astro SSR        Medusa API       Stripe         Resend
   │                │                 │               │              │
   │──Add to cart──►│                 │               │              │
   │                │──Create cart───►│               │              │
   │                │◄──cart_id───────│               │              │
   │◄──Cart badge───│                 │               │              │
   │                │                 │               │              │
   │──Go to /cart──►│                 │               │              │
   │                │──GET cart───────►               │              │
   │                │◄──cart data─────│               │              │
   │◄──Cart page────│                 │               │              │
   │                │                 │               │              │
   │──Checkout──────►│                │               │              │
   │                │──Set email──────►               │              │
   │                │──Set address────►               │              │
   │                │──Set shipping───►               │              │
   │◄──Step 4───────│                 │               │              │
   │                │                 │               │              │
   │──Pay Now───────►│                │               │              │
   │                │──Create payment session─────────►              │
   │                │◄──Stripe session URL────────────│              │
   │◄──Redirect─────│                 │               │              │
   │                │                 │               │              │
   │───────────────────────────────────Pay on Stripe──►              │
   │◄──────────────────────────────────Redirect to ────│              │
   │                                  /checkout/success│              │
   │                │                 │               │              │
   │                │                 │◄──Webhook─────│              │
   │                │                 │ (checkout.session.completed)  │
   │                │                 │──Create order─┤              │
   │                │                 │──Decrement inv┤              │
   │                │                 │──────────────────────Email──►│
   │                │                 │               │              │──Send─►Customer
   │──Load /success►│                 │               │              │
   │                │──GET order──────►               │              │
   │◄──Confirmation─│                 │               │              │
```

### 14.2 Registered Checkout with Loyalty Redemption

```
Customer         Astro SSR       Better Auth      Medusa API       Stripe
   │                │                │                │               │
   │──Login─────────►│               │                │               │
   │                │──Verify──────►│                │               │
   │                │◄──Session─────│                │               │
   │                │──Merge cart───────────────────►│               │
   │◄──Cart merged──│               │                │               │
   │                │               │                │               │
   │──Checkout──────►│              │                │               │
   │                │──GET profile──────────────────►│               │
   │◄──Pre-filled───│               │                │               │
   │                │               │                │               │
   │──Toggle points─►│              │                │               │
   │                │──Apply loyalty discount────────►│               │
   │                │◄──Updated cart total───────────│               │
   │◄──Updated UI───│               │                │               │
   │                │               │                │               │
   │──Pay Now───────►│              │                │               │
   │                │──Create payment session───────────────────────►│
   │◄──Redirect─────│               │                │               │
   │                │               │                │               │
   │─────────────────────────────────Pay on Stripe──────────────────►│
   │◄────────────────────────────────/checkout/success───────────────│
   │                │               │                │               │
   │                │               │                │◄──Webhook─────│
   │                │               │                │──Create order  │
   │                │               │                │──Deduct points │
   │                │               │                │──Award new pts │
```

### 14.3 Payment Failure and Retry Flow

```
Customer         Stripe Checkout    Medusa API       Astro SSR
   │                    │               │                │
   │──Pay──────────────►│               │                │
   │                    │──Payment fails│                │
   │◄──Stripe error msg─│               │                │
   │                    │               │                │
   │──Retry (1/3)───────►              │                │
   │                    │──Payment fails│                │
   │◄──Stripe error msg─│               │                │
   │                    │               │                │
   │──Retry (2/3)───────►              │                │
   │                    │──Payment fails│                │
   │◄──Stripe error msg─│               │                │
   │                    │               │                │
   │                    │──Webhook──────►                │
   │                    │ (payment_intent.payment_failed)│
   │                    │               │──Update cart status
   │◄────────────────────────────────────Redirect /cancel│
   │                    │               │                │
   │──Load /cancel─────────────────────────────────────►│
   │◄──"Payment failed" page + retry CTA────────────────│
```

### 14.4 Inventory Out-of-Stock Error Mid-Checkout

```
Customer         Astro SSR        Medusa API
   │                │                 │
   │──Checkout──────►│                │
   │                │──Initiate checkout──────────────►│
   │                │                 │──Check inventory│
   │                │                 │  (Item A: 0 remaining)
   │                │◄──Inventory error────────────────│
   │◄──Step 1 error─│                 │
   │                │                 │
   │  "1 item in your cart is no longer available"     │
   │  [VIEW CART]  [REMOVE UNAVAILABLE AND CONTINUE]   │
   │                │                 │
   │──Remove item───►│               │
   │                │──Remove item from cart────────────►
   │◄──Updated cart─│               │
   │──Continue──────►│               │
   │                │──Re-check inventory─────────────►│
   │                │◄──OK─────────────────────────────│
   │◄──Checkout continues─────────────────────────────│
```

---

## 15. Error States

### 15.1 Checkout Error State Catalogue

| Error | Cause | User-Facing Message | Action Available |
|---|---|---|---|
| Item out of stock | Inventory depleted between add-to-cart and checkout | "[Product name] is no longer available." | Remove item and continue; or Cancel |
| Minimum order not met | Cart total below market minimum | "Your cart total must be at least [amount] to check out." | Continue shopping |
| Invalid coupon code | Code expired, wrong, or usage limit reached | "This promo code is invalid or has expired." | Try another code |
| Address validation failed | Missing required fields or unrecognised address | "Please check your address. [Field] is required." | Correct address |
| Shipping method unavailable | Carrier API failure and no fallback | "Shipping is temporarily unavailable. Please try again." | Retry; support contact |
| Payment failed (Stripe) | Card declined, 3DS failed, insufficient funds | Stripe's localised error message + "Please try a different card." | Retry; try different method |
| Session timeout | 30-minute inventory reservation expired | "Your session has expired. Your cart is saved." | Return to cart |
| Cart empty at checkout | All items removed or expired | "Your cart is empty." | Continue shopping |
| Network error | API call failed | "Something went wrong. Please check your connection and try again." | Retry |
| Webhook not received | Stripe webhook not processed within 5 minutes | Internal alert to TwinMOS PM; customer sees normal success page (Medusa polls Stripe as fallback) | Auto-recovery via polling |

### 15.2 Error Display Design

All inline checkout errors follow this pattern:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠  [Error message in clear, non-technical language]        │
│     [Suggested action or support link]                       │
└─────────────────────────────────────────────────────────────┘
```

- Errors are displayed inline in the form (near the relevant field) where possible
- Page-level errors are displayed in a banner below the step indicator
- Error messages must never expose internal system details (stack traces, internal IDs)
- All error messages must be translated for all active locales

---

## 16. Performance Targets

| Metric | Target | Page | Measurement Method |
|---|---|---|---|
| Checkout page Time to Interactive (TTI) | ≤3.0s | /checkout/ | Lighthouse |
| Checkout page LCP | ≤2.5s | /checkout/ | PageSpeed Insights |
| Cart page first meaningful paint | ≤1.5s | /cart/ | Lighthouse |
| Add-to-cart API response | ≤300ms P95 | Product page → cart | k6 |
| Shipping rate retrieval | ≤2.0s P95 | /checkout/delivery/ | k6 |
| Stripe Checkout redirect initiation | ≤1.5s | /checkout/payment/ | Browser DevTools |
| Order confirmation page load | ≤2.0s | /checkout/success/ | Lighthouse |
| Cart badge Server Island render | ≤200ms | All pages (header) | Browser DevTools |

---

## 17. LocalStorage Draft Preservation

To prevent customers from losing their entered checkout data due to accidental navigation, form fields are auto-saved to localStorage every 5 seconds.

### 17.1 Preserved Fields

| Field | localStorage Key | Notes |
|---|---|---|
| Email | `twn_checkout_email` | Cleared on order completion |
| First name | `twn_checkout_first_name` | |
| Last name | `twn_checkout_last_name` | |
| Address line 1 | `twn_checkout_address_1` | |
| Address line 2 | `twn_checkout_address_2` | |
| City | `twn_checkout_city` | |
| Postal code | `twn_checkout_postal` | |
| State/Province | `twn_checkout_state` | |
| Country | `twn_checkout_country` | |
| Phone number | `twn_checkout_phone` | |
| Selected shipping method ID | `twn_checkout_shipping` | |
| Applied coupon code | `twn_checkout_coupon` | |

### 17.2 Auto-Save Implementation

```typescript
// Astro checkout form auto-save script
class CheckoutAutoSave {
  private fields: NodeListOf<HTMLInputElement | HTMLSelectElement>;
  private interval: ReturnType<typeof setInterval>;
  private readonly STORAGE_PREFIX = "twn_checkout_";
  private readonly SAVE_INTERVAL_MS = 5000;

  constructor() {
    this.fields = document.querySelectorAll("[data-checkout-persist]");
    this.restoreFromStorage();
    this.interval = setInterval(() => this.saveToStorage(), this.SAVE_INTERVAL_MS);
  }

  private saveToStorage() {
    this.fields.forEach((field) => {
      const key = this.STORAGE_PREFIX + field.dataset.checkoutPersist;
      localStorage.setItem(key, field.value);
    });
  }

  private restoreFromStorage() {
    this.fields.forEach((field) => {
      const key = this.STORAGE_PREFIX + field.dataset.checkoutPersist;
      const saved = localStorage.getItem(key);
      if (saved) field.value = saved;
    });
  }

  public clearOnSuccess() {
    clearInterval(this.interval);
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  }
}

// Usage: new CheckoutAutoSave() on /checkout/ page mount
// Call .clearOnSuccess() when redirecting to /checkout/success
```

### 17.3 Privacy Note

LocalStorage checkout data contains only the customer's address and contact details — no payment data whatsoever (payment is handled exclusively by Stripe). This data is cleared on successful order completion. The privacy policy must disclose this temporary local storage.

---

## 18. RTL Layout Support

The Arabic locale (`/ar/`) requires a full right-to-left layout for the checkout pages.

### 18.1 RTL Requirements

| Element | LTR Behaviour | RTL Behaviour |
|---|---|---|
| Page direction | `dir="ltr"` | `dir="rtl"` |
| Mini-cart slide-in | Right side | Left side |
| Step progress indicator | Left to right | Right to left |
| Form fields | Labels left-aligned | Labels right-aligned |
| Breadcrumb separator | `>` | `<` |
| Price display | Currency symbol prefix | Currency symbol suffix (SAR, AED in Arabic display) |
| Button layout | Primary right | Primary left |
| Error icons | Left of message | Right of message |

### 18.2 CSS RTL Implementation

```css
/* Checkout RTL overrides — applied when html[dir="rtl"] */
[dir="rtl"] .checkout-sidebar {
  left: 0;
  right: auto;
}

[dir="rtl"] .mini-cart {
  left: 0;
  right: auto;
  transform-origin: left center;
}

[dir="rtl"] .step-indicator {
  flex-direction: row-reverse;
}

[dir="rtl"] .form-label {
  text-align: right;
}

[dir="rtl"] .error-icon {
  margin-right: 0;
  margin-left: 0.5rem;
}
```

### 18.3 Arabic Number Formatting

Arabic-locale price display uses `Intl.NumberFormat` with `ar-AE` locale:
```typescript
new Intl.NumberFormat("ar-AE", {
  style: "currency",
  currency: "AED",
}).format(299.00)
// → "٢٩٩٫٠٠ د.إ.‏"
```

---

## 19. Accessibility Requirements

The checkout flow must be fully accessible per WCAG 2.1 Level AA.

### 19.1 WCAG 2.1 AA Requirements

| WCAG Criterion | Requirement | Implementation |
|---|---|---|
| 1.1.1 Non-text Content | All images have descriptive alt text | Product thumbnails: alt="${product.title} - ${variant.title}" |
| 1.3.1 Info and Relationships | Form labels associated with inputs | `<label for="...">` on all form fields |
| 1.3.3 Sensory Characteristics | Instructions do not rely on colour alone | Error states use icon + text, not colour only |
| 1.4.1 Use of Colour | Error/success states not colour-only | Red errors also show ⚠ icon |
| 1.4.3 Contrast (Minimum) | Text contrast ≥4.5:1 | Verified via Figma contrast checker |
| 2.1.1 Keyboard | All interactive elements keyboard-accessible | Tab order tested; no keyboard traps |
| 2.1.2 No Keyboard Trap | Keyboard can always escape mini-cart | ESC closes mini-cart; focus returned to trigger |
| 2.4.3 Focus Order | Logical focus order through form fields | DOM order matches visual order |
| 2.4.4 Link Purpose | All links have descriptive text | "View Order TWN-2026-000142" not "Click here" |
| 2.4.7 Focus Visible | Visible focus indicator on all elements | 2px solid focus ring on all interactive elements |
| 3.2.2 On Input | Form doesn't submit on input change | No auto-submit; explicit "Continue" button only |
| 3.3.1 Error Identification | Errors identify the field | "Email: Please enter a valid email address" |
| 3.3.2 Labels or Instructions | All form fields have labels | Placeholder text supplements but does not replace labels |
| 4.1.2 Name, Role, Value | All UI components have ARIA attributes | `aria-label`, `aria-required`, `aria-invalid` on form fields |
| 4.1.3 Status Messages | Dynamic updates announced | Cart count changes: `aria-live="polite"` on badge |

### 19.2 Screen Reader Testing

The checkout flow must be tested with:
- **NVDA + Chrome** (Windows)
- **VoiceOver + Safari** (macOS / iOS)
- **TalkBack + Chrome** (Android)

Screen reader test script covers: Add to cart → mini-cart interaction → checkout start → address form → shipping selection → order review → pay button.

---

## 20. Acceptance Criteria

| ID | Acceptance Criterion | Verification |
|---|---|---|
| AC-CART-001 | Guest can add a product to cart, proceed through all 4 checkout steps, and complete payment via Stripe Checkout | Manual UAT |
| AC-CART-002 | Registered user's cart persists across browser sessions and devices | Login on a second device; cart items present |
| AC-CART-003 | Guest cart merges correctly with server cart on login | Add 2 items as guest, log in, verify all items present |
| AC-CART-004 | Quantity update in cart calls Medusa API and reflects immediately without page reload | Network tab inspection + visual verification |
| AC-CART-005 | Mini-cart badge count matches actual cart item count at all times | Add/remove items; verify badge vs API response |
| AC-CART-006 | Maximum 5 units per SKU enforced: attempting to add 6th unit shows error | Add 5 units, try to add 1 more |
| AC-CART-007 | Maximum 10 unique SKUs enforced | Add 10 different SKUs, try to add 11th |
| AC-CART-008 | Coupon code applies discount correctly; one code at a time only | Apply valid code, verify discount; try second code |
| AC-CART-009 | Loyalty points redemption reduces order total by the correct amount | Apply 500 points, verify AED 5 discount |
| AC-CART-010 | Checkout step navigation: completed steps show summary; can navigate back | Complete step 2, go back to step 1, verify |
| AC-CART-011 | Address country change updates currency and pricing | Change UAE to India; verify INR pricing |
| AC-CART-012 | Shipping rates from at least 2 carriers shown for UAE orders | UAE shipping step verification |
| AC-CART-013 | Flat-rate shipping fallback appears when carrier API is unavailable | Disable carrier API; verify fallback shown |
| AC-CART-014 | Out-of-stock item at checkout: clear error shown, option to remove | Deplete inventory mid-checkout; verify UX |
| AC-CART-015 | 30-minute inventory reservation expires, cart returns to Active state | Wait 31 minutes after checkout initiation |
| AC-CART-016 | Order confirmation page shows correct order number in TWN-{YEAR}-{NNNNNN} format | Complete purchase; check confirmation page |
| AC-CART-017 | Form fields auto-saved to localStorage every 5 seconds; restored on return | Fill form, navigate away, return; verify fields |
| AC-CART-018 | AR locale checkout is RTL-compliant (verified by Arabic-speaking QA reviewer) | Visual review by Arabic speaker |
| AC-CART-019 | WCAG 2.1 AA: keyboard navigation through full checkout without mouse | Keyboard-only checkout test |
| AC-CART-020 | WCAG 2.1 AA: screen reader (NVDA + Chrome) completes checkout without errors | NVDA screen reader test |
| AC-CART-021 | Checkout Time to Interactive ≤3.0s on production | Lighthouse measurement |
| AC-CART-022 | Empty cart state shows product recommendations and "Continue Shopping" CTA | Remove all items from cart; verify |
| AC-CART-023 | Guest post-purchase: registration prompt shown on confirmation page | Complete guest checkout; verify prompt |
| AC-CART-024 | Abandoned cart: 24h inactivity triggers HubSpot webhook and email sequence | Simulate 24h abandonment in test environment |

---

*TwinMOS Technologies — Cart and Checkout Flow Specification*
*Reference: TWN-P3-CART-2026-001 v1.0 | FINAL | 1 May 2026*
*Classification: Internal — Confidential*
