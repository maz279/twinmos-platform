# TwinMOS Technologies Corporate Website
# Payment Processing Specification

| Field | Value |
|---|---|
| **Document Reference** | TWN-P3-PAY-2026-001 |
| **Version** | 1.0 |
| **Status** | FINAL |
| **Date** | 1 May 2026 |
| **Author** | TwinMOS Project Management Office |
| **Owner** | Dev B (Strapi + Medusa Backend) |
| **Classification** | Internal — Confidential — PCI Sensitive |
| **Related Documents** | TWN-P3-ECOM-2026-001, TWN-P3-CART-2026-001, TWN-P3-KICK-2026-001, TWN-BRD-2026-001 v3.0 |
| **PCI DSS SAQ Type** | SAQ A |

> **SECURITY NOTICE:** This document contains payment processing architecture details. Access is restricted to authorised TwinMOS project team members and must not be shared externally without TwinMOS PM approval.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Payment Architecture](#2-payment-architecture)
3. [PCI DSS Scope](#3-pci-dss-scope)
4. [Supported Payment Methods by Region](#4-supported-payment-methods-by-region)
5. [Stripe Account Configuration](#5-stripe-account-configuration)
6. [Medusa.js Stripe Plugin Configuration](#6-medusajs-stripe-plugin-configuration)
7. [Checkout Flow: Stripe Checkout vs Stripe Elements](#7-checkout-flow-stripe-checkout-vs-stripe-elements)
8. [Stripe Checkout Session Creation](#8-stripe-checkout-session-creation)
9. [Payment Webhook Handling](#9-payment-webhook-handling)
10. [Webhook Security](#10-webhook-security)
11. [Payment Failure Handling](#11-payment-failure-handling)
12. [Refund Processing](#12-refund-processing)
13. [Fraud Prevention](#13-fraud-prevention)
14. [Rate Limiting](#14-rate-limiting)
15. [Currency Handling](#15-currency-handling)
16. [3D Secure Authentication](#16-3d-secure-authentication)
17. [Payment Receipts and Invoicing](#17-payment-receipts-and-invoicing)
18. [Admin Payment Dashboard](#18-admin-payment-dashboard)
19. [Reconciliation](#19-reconciliation)
20. [Error Codes and User-Facing Messages](#20-error-codes-and-user-facing-messages)
21. [Security Requirements](#21-security-requirements)
22. [Acceptance Criteria](#22-acceptance-criteria)
23. [Integration Test Plan](#23-integration-test-plan)

---

## 1. Executive Summary

This document specifies the complete payment processing architecture for TwinMOS Technologies' Phase 3 e-commerce platform. Payment processing is the most security-critical component of the entire project, and all design decisions have been made to achieve the simplest, most secure, and most maintainable implementation possible.

**Core Decision:** TwinMOS Technologies will use **Stripe Checkout** (hosted by Stripe) as the primary payment interface, with payments processed via Stripe's global payment infrastructure and managed through Medusa.js v2's `@medusajs/payment-stripe` module.

**PCI Scope:** Because TwinMOS redirects all customers to Stripe's hosted checkout page for payment, and because no card data ever enters TwinMOS's own systems (servers, databases, logs, or browser code), TwinMOS qualifies for **PCI DSS SAQ A** — the simplest PCI compliance level, requiring only that TwinMOS verify that Stripe is a certified PCI Level 1 Service Provider and that its own systems do not interact with cardholder data.

**Markets Supported at Launch:** UAE (AED), India (INR), Bangladesh (BDT), KSA (SAR), and International (USD) — each with market-appropriate payment methods enabled via Stripe's regional payment method configuration.

**Phase 4 Additions (out of scope for Phase 3):** PayPal (International), bKash (Bangladesh), KNET (Kuwait). These are noted in this document for planning purposes.

---

## 2. Payment Architecture

### 2.1 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  CUSTOMER BROWSER (TwinMOS Storefront)                       │
│  Astro 5 on Cloudflare Pages                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  /checkout/payment  (Astro SSR page)                   │  │
│  │  Shows: Order summary, payment method icons, Pay button│  │
│  │  NO card form — redirect to Stripe only                │  │
│  └──────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │ 1. Customer clicks "Pay"
                              │ 2. Astro SSR calls Medusa
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  MEDUSA.JS v2 Backend  (Hetzner CX42 via Coolify)            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  @medusajs/payment-stripe  module                      │  │
│  │  - Creates Stripe Checkout Session                     │  │
│  │  - Passes cart line items, region, metadata            │  │
│  │  - Returns Stripe session URL to Astro                 │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                                │
│  ┌──────────────────────────▼─────────────────────────────┐  │
│  │  Webhook Handler  (POST /webhooks/stripe)               │  │
│  │  - Verifies Stripe signature                            │  │
│  │  - Processes checkout.session.completed                 │  │
│  │  - Creates Medusa order                                 │  │
│  │  - Triggers inventory decrement                         │  │
│  │  - Triggers Resend order confirmation email             │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────┘
                              │ 3. Redirect to Stripe
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  STRIPE  (PCI Level 1 Certified Service Provider)            │
│                                                              │
│  ┌─────────────────────────────┐  ┌───────────────────────┐  │
│  │  Stripe Checkout            │  │  Stripe Tax           │  │
│  │  Hosted payment page        │  │  VAT/GST calculation  │  │
│  │  - Customer enters card     │  │  per region           │  │
│  │  - 3DS handled by Stripe    │  └───────────────────────┘  │
│  │  - Apple Pay / Google Pay   │                            │
│  │  - UPI / RuPay / Mada       │  ┌───────────────────────┐  │
│  │  - Redirect to success_url  │  │  Stripe Radar         │  │
│  └─────────────────────────────┘  │  Fraud detection      │  │
│                                   └───────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Stripe Webhooks                                       │  │
│  │  → checkout.session.completed                          │  │
│  │  → payment_intent.payment_failed                       │  │
│  │  → charge.refund.created                               │  │
│  │  → checkout.session.expired                            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Payment Responsibility Matrix

| Responsibility | Owner | System |
|---|---|---|
| Card number capture | Stripe | Stripe Checkout (hosted page) |
| Card validation | Stripe | Stripe |
| 3DS challenge | Stripe | Stripe Checkout |
| Fraud detection (Stripe Radar) | Stripe + TwinMOS rules | Stripe |
| Payment authorisation | Stripe → Card Networks | Stripe |
| Checkout session creation | TwinMOS backend | Medusa + Stripe API |
| Tax calculation (VAT/GST) | Stripe Tax | Stripe |
| Order creation after payment | TwinMOS backend | Medusa (webhook handler) |
| Refund initiation | TwinMOS admin | Medusa Admin → Stripe API |
| Refund processing | Stripe | Stripe |
| Invoice generation | TwinMOS backend | Medusa + Resend |
| Invoice storage | TwinMOS | Backblaze B2 |
| Payout to TwinMOS bank account | Stripe | Stripe (automated daily) |
| Payout reconciliation | TwinMOS Finance | Stripe Dashboard + Medusa |

---

## 3. PCI DSS Scope

### 3.1 SAQ A Eligibility

TwinMOS Technologies qualifies for **PCI DSS SAQ A** because:

1. All cardholder data functions are fully outsourced to Stripe, a PCI DSS Level 1 validated Service Provider
2. The TwinMOS merchant website does not receive cardholder data (TwinMOS systems are completely outside the payment flow for cardholder data)
3. TwinMOS uses iframe-based or redirect-based Stripe Checkout — specifically, Stripe Checkout **redirect** (the most restrictive and secure approach)
4. All pages that previously contained payment forms (if any existed) have been removed

### 3.2 SAQ A Scope Definition

**In scope (TwinMOS must ensure):**
- The `success_url` and `cancel_url` redirect pages do not capture or store any payment data
- Stripe is confirmed as a PCI DSS Level 1 Service Provider (verify annually at pcisecuritystandards.org)
- TwinMOS website is protected against script injection attacks that could redirect customers to fraudulent payment pages (CSP, Subresource Integrity)
- Access to Stripe Dashboard is controlled (MFA required for all admin users)
- Stripe API keys are stored as environment variables, never in code or version control

**Out of scope (Stripe handles):**
- Cardholder data storage
- Encryption of card data in transit
- Card network communications
- 3DS authentication
- PAN tokenisation

### 3.3 SAQ A Self-Assessment Checklist

This checklist must be completed by TwinMOS PM before go-live:

| Requirement | Status | Evidence |
|---|---|---|
| SAQ A Question 2.2: Stripe is PCI Level 1 certified | ☐ Verify before go-live | Stripe PCI certificate at stripe.com/docs/security |
| SAQ A Question 6.3: Merchant site protected from malicious script injection | ☐ CSP headers configured | Cloudflare CSP header review |
| SAQ A Question 8.3: MFA enabled on all Stripe Dashboard accounts | ☐ Verify before go-live | Stripe Dashboard security settings |
| SAQ A Question 9.4: No card data in TwinMOS logs or databases | ☐ Log audit before go-live | Log scanning (automated pattern check) |
| SAQ A Question 12.8: Vendor management — Stripe responsibility documented | ☐ This document | Section 2.2 above |

### 3.4 Content Security Policy for Payment Pages

To prevent malicious script injection that could redirect customers to fraudulent payment pages, the following CSP header is applied to all TwinMOS pages (via Cloudflare Pages headers configuration):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM_NONCE}' https://js.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  connect-src 'self' https://api.stripe.com;
  img-src 'self' data: https://*.backblazeb2.com https://stripe.com;
  style-src 'self' 'unsafe-inline';
  form-action 'self' https://checkout.stripe.com;
```

---

## 4. Supported Payment Methods by Region

### 4.1 UAE — AED

| Payment Method | Enabled at Launch | Notes |
|---|---|---|
| Visa (Credit & Debit) | Yes | All issuers |
| Mastercard (Credit & Debit) | Yes | All issuers |
| American Express | Yes | Subject to Stripe UAE Amex enablement |
| Apple Pay | Yes | Requires Apple Pay domain verification (`apple-developer-merchantid-domain-association` file on Cloudflare Pages) |
| Google Pay | Yes | No additional setup required; auto-detected by Stripe |
| KNET | No (Phase 4) | Kuwait debit network; requires separate integration |
| Tabby / Tamara (BNPL) | No (Phase 4) | Buy Now Pay Later; requires separate Tabby/Tamara integration |

### 4.2 India — INR

| Payment Method | Enabled at Launch | Notes |
|---|---|---|
| Visa (Credit & Debit) | Yes | |
| Mastercard (Credit & Debit) | Yes | |
| RuPay | Yes | Indian domestic scheme; via Stripe India |
| UPI | Yes | Unified Payments Interface; via Stripe India; real-time bank transfer |
| American Express | Yes | |
| Netbanking | No (Phase 4) | Direct bank transfer via Indian banks |
| EMI (Equated Monthly Installments) | No (Phase 4) | |

**UPI Notes:**
- UPI payments require a mobile number linked to the customer's UPI ID
- UPI is a "push" payment: customer approves in their UPI app (PhonePe, GPay, Paytm, etc.)
- Payment confirmation is instant
- Stripe handles UPI via Stripe India entity

### 4.3 Bangladesh — BDT

| Payment Method | Enabled at Launch | Notes |
|---|---|---|
| Visa (Credit & Debit) | Yes | International card acceptance |
| Mastercard (Credit & Debit) | Yes | |
| bKash | No (Phase 4) | Bangladesh's leading mobile money; requires bKash API integration |
| Nagad | No (Phase 4) | |

**Bangladesh Payment Note:** Bangladesh has limited international payment card penetration. The primary Phase 3 launch covers Visa/Mastercard only. The bKash integration (Phase 4) is expected to significantly increase conversion in this market.

### 4.4 KSA — SAR

| Payment Method | Enabled at Launch | Notes |
|---|---|---|
| Visa (Credit & Debit) | Yes | |
| Mastercard (Credit & Debit) | Yes | |
| Mada | Yes | Saudi domestic debit scheme; via Stripe Saudi Arabia; required for Saudi market |
| Apple Pay | Yes | High Apple Pay adoption in KSA market |
| Google Pay | Yes | |
| STC Pay | No (Phase 4) | Saudi Telecom's digital wallet |

**Mada Notes:**
- Mada is the dominant debit scheme in KSA (>80% of Saudi debit cards are Mada)
- Mada is supported by Stripe for Saudi Arabia accounts
- Mada uses the same Stripe integration as Visa/Mastercard; enabled in Stripe Dashboard > Payment Methods > Mada

### 4.5 International — USD

| Payment Method | Enabled at Launch | Notes |
|---|---|---|
| Visa (Credit & Debit) | Yes | |
| Mastercard (Credit & Debit) | Yes | |
| American Express | Yes | |
| PayPal | No (Phase 4) | Requires Stripe PayPal connector or separate PayPal integration |

### 4.6 Payment Method Activation in Stripe Dashboard

Payment methods must be activated in the Stripe Dashboard **before** they are available in Stripe Checkout. The activation order for go-live:

1. Visa / Mastercard — Active by default on Stripe account
2. Amex — Activate in Dashboard > Payment Methods > Cards
3. Apple Pay — Requires domain verification
4. Google Pay — Auto-active when Apple Pay is configured
5. Mada (KSA) — Activate in Stripe Dashboard > Payment Methods > Mada
6. UPI (India) — Activate in Stripe Dashboard > Payment Methods > UPI
7. RuPay (India) — Activate in Stripe Dashboard > Payment Methods > RuPay

---

## 5. Stripe Account Configuration

### 5.1 Account Structure Decision (ADR-020)

**Decision:** Use a **single global Stripe account** with multi-currency support rather than separate Stripe accounts per market.

**Rationale:**
- Simpler to manage: one dashboard, one set of API keys, one webhook endpoint
- Stripe supports AED, INR, BDT, SAR, and USD on a single account
- Multi-currency payouts: Stripe pays out each currency to the appropriate bank account (TwinMOS to provide bank account details for each currency)
- Stripe Radar fraud rules apply globally
- Stripe Tax handles jurisdiction-specific tax calculation without separate accounts

**Consideration:** If TwinMOS requires separate legal entities for different markets (e.g., a separate Indian entity), separate Stripe accounts may be needed in Phase 4. This is a finance/legal decision outside Phase 3 scope.

### 5.2 Stripe Account Setup Checklist

| Task | Owner | Due |
|---|---|---|
| Create Stripe account at stripe.com (if not existing) | TwinMOS Finance | Month 10, W1 |
| Complete identity verification (business info, directors, beneficial owners) | TwinMOS Finance | Month 10, W1 |
| Upload TwinMOS business registration documents (DAFZA licence) | TwinMOS Finance | Month 10, W1 |
| Add bank accounts for AED, INR, BDT, SAR, USD payouts | TwinMOS Finance | Month 10, W2 |
| Enable multi-currency payouts | TwinMOS Finance | Month 10, W2 |
| Enable specific payment methods (Mada, UPI, RuPay, Apple Pay) | Dev B + TwinMOS Finance | Month 10, W3 |
| Complete Apple Pay domain verification | Dev A | Month 10, W3 |
| Enable Stripe Tax and configure tax registrations | Dev B | Month 11, W1 |
| Add UAE VAT registration (TRN) to Stripe Tax | TwinMOS Finance | Month 11, W1 |
| Add India GSTIN to Stripe Tax | TwinMOS Finance | Month 11, W1 |
| Add KSA TRN to Stripe Tax | TwinMOS Finance | Month 11, W1 |
| Enable Stripe Radar and configure custom rules | Dev B | Month 11, W2 |
| MFA enabled for all Stripe Dashboard users | TwinMOS PM | Before go-live |
| Stripe live mode enabled | Dev B + TwinMOS PM | Month 15, W24 (go-live) |

### 5.3 Stripe API Keys

```bash
# Environment variables (never committed to version control)
# Stored in Coolify environment configuration on Hetzner

# Test mode (used for staging)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Live mode (used for production — set only at go-live)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

**Key Rotation Policy:**
- API keys are rotated immediately if any potential exposure is detected
- Keys are reviewed every 90 days
- Old keys are revoked 24 hours after rotation to allow any in-flight requests to complete
- Key rotation is documented in the security log

---

## 6. Medusa.js Stripe Plugin Configuration

### 6.1 Plugin Installation

```bash
# In Medusa backend
npm install @medusajs/payment-stripe
```

### 6.2 Plugin Configuration in medusa-config.ts

```typescript
// medusa-config.ts — Stripe payment module configuration
{
  resolve: "@medusajs/payment-stripe",
  options: {
    // Stripe secret key (live or test depending on environment)
    apiKey: process.env.STRIPE_SECRET_KEY,

    // Webhook secret for signature verification
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

    // Auto-capture: capture payment immediately on auth
    // (as opposed to authorise-only and capture manually)
    capture: true,

    // Allow automatic payment methods (Apple Pay, Google Pay, etc.)
    automaticPaymentMethods: {
      enabled: true,
    },

    // Stripe Tax: delegate tax calculation to Stripe
    // Requires tax registrations configured in Stripe Dashboard
    stripeOptions: {
      automatic_tax: {
        enabled: true,
      },
    },
  },
},
```

### 6.3 Stripe Plugin Payment Flow

```
Astro SSR (checkout step 4)
        │
        │ POST /store/carts/{cartId}/payment-sessions
        ▼
Medusa payment module
        │
        │ Creates PaymentSession record in Medusa DB
        │ Calls @medusajs/payment-stripe:
        │   stripeClient.checkout.sessions.create(params)
        ▼
Stripe API
        │
        │ Returns: { url: "https://checkout.stripe.com/pay/cs_..." }
        ▼
Medusa returns session URL to Astro SSR
        │
        │ Astro SSR redirects browser to Stripe URL
        ▼
Customer pays on Stripe-hosted page
        │
        │ Stripe sends webhook to TwinMOS
        ▼
Medusa webhook handler
        │ POST /webhooks/stripe (TwinMOS endpoint)
        │ Verifies signature
        │ Processes event
        ▼
Order created in Medusa
```

---

## 7. Checkout Flow: Stripe Checkout vs Stripe Elements

### 7.1 ADR-019: Decision Record

**Decision:** Use **Stripe Checkout redirect** (not Stripe Elements embedded) for Phase 3.

**Context:** Two options exist for integrating Stripe payments into a website:

| Option | Description | PCI Scope | Customisation | Complexity |
|---|---|---|---|---|
| **Stripe Checkout (redirect)** | Customer is redirected to a Stripe-hosted payment page at `checkout.stripe.com` | SAQ A | Low — Stripe's branded page | Low |
| **Stripe Elements (embedded)** | Stripe payment form is embedded in the TwinMOS checkout page via an iframe | SAQ A-EP | High — matches TwinMOS branding | Medium |
| **Custom payment form** | TwinMOS renders its own card fields | SAQ D | Full | Very High |

**Decision Factors:**

| Factor | Stripe Checkout | Elements |
|---|---|---|
| PCI compliance | SAQ A (simplest) | SAQ A-EP (still simple, but more questions) |
| Development time | 1–2 days | 5–10 days |
| Conversion rate | Industry average; Stripe's own conversion optimisation | Can be higher with native UX |
| Branding consistency | Stripe-branded page with logo and colour customisation | Full TwinMOS branding |
| Payment methods | Auto-enabled (Apple Pay, Google Pay, UPI, Mada) | Must be manually configured |
| Mobile optimisation | Stripe's mobile-optimised UI | Requires custom mobile CSS |
| A/B testing capability | Limited | Full control |

**Outcome:** Stripe Checkout redirect selected for Phase 3 for speed and simplicity. Phase 3.1 (post-launch iteration) may switch to Stripe Elements if conversion data justifies the investment.

### 7.2 Stripe Checkout Customisation

While Stripe Checkout is hosted by Stripe, TwinMOS can customise:

```typescript
// Stripe Checkout session customisation options
const sessionParams = {
  // Branding
  payment_method_configuration: "pmc_...", // Custom payment method config
  // OR configure via Stripe Dashboard > Checkout > Branding:
  // - Logo upload
  // - Background colour
  // - Button colour
  // - Font family

  // Custom fields (Phase 3.1 option)
  custom_fields: [
    {
      key: "order_note",
      label: { type: "custom", custom: "Order note (optional)" },
      type: "text",
      optional: true,
    },
  ],

  // Phone number collection
  phone_number_collection: { enabled: false }, // Collected in TwinMOS checkout

  // Consent collection
  consent_collection: {
    terms_of_service: "required", // Customer must accept T&Cs
  },
};
```

---

## 8. Stripe Checkout Session Creation

### 8.1 Full Session Creation Implementation

```typescript
// Dev B: Medusa custom payment provider or webhook handler
// File: src/modules/payment/stripe-checkout.ts

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia", // Pin API version
  typescript: true,
});

export async function createCheckoutSession(
  cart: MedusaCart,
  region: MedusaRegion
): Promise<string> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    cart.items.map((item) => ({
      price_data: {
        currency: region.currency_code,
        product_data: {
          name: item.title,
          description: item.description,
          images: item.thumbnail ? [item.thumbnail] : [],
          metadata: {
            medusa_variant_id: item.variant_id,
            medusa_product_id: item.product_id,
            strapi_slug: item.metadata?.strapi_product_slug ?? "",
          },
        },
        // Amount in smallest currency unit
        unit_amount: item.unit_price,
        // Tax behaviour: Stripe Tax will add tax on top
        tax_behavior: shouldDisplayTaxExclusive(region) ? "exclusive" : "inclusive",
      },
      quantity: item.quantity,
    }));

  // Add loyalty discount as a line item if applied
  if (cart.metadata?.loyalty_discount_applied) {
    lineItems.push({
      price_data: {
        currency: region.currency_code,
        product_data: {
          name: "Loyalty Points Discount",
          description: `${cart.metadata.loyalty_points_redeemed} points redeemed`,
        },
        unit_amount: -Math.abs(cart.metadata.loyalty_discount_applied),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: region.currency_code,
    line_items: lineItems,

    // Shipping
    shipping_options: cart.shipping_methods?.map((method) => ({
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: method.price,
          currency: region.currency_code,
        },
        display_name: method.shipping_option.name,
        delivery_estimate: {
          minimum: { unit: "business_day", value: 1 },
          maximum: { unit: "business_day", value: 7 },
        },
        tax_behavior: "exclusive",
      },
    })) ?? [],

    // Tax
    automatic_tax: { enabled: true },

    // Customer info
    customer_email: cart.email,
    shipping_address_collection: {
      allowed_countries: getAllowedCountriesForRegion(region),
    },

    // Metadata for webhook processing
    metadata: {
      medusa_cart_id: cart.id,
      medusa_region_id: cart.region_id,
      twinmos_locale: cart.metadata?.locale ?? "en",
      loyalty_points_redeemed: String(cart.metadata?.loyalty_points_redeemed ?? 0),
      loyalty_discount_applied: String(cart.metadata?.loyalty_discount_applied ?? 0),
      is_guest: cart.customer_id ? "false" : "true",
    },

    // Payment method types — auto-detected by Stripe based on country
    // Setting to undefined lets Stripe pick the best methods automatically
    payment_method_types: undefined,
    automatic_payment_methods: { enabled: true },

    // Redirect URLs
    success_url: `${process.env.STORE_URL}/{locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.STORE_URL}/{locale}/checkout/cancel`,

    // Stripe Checkout branding
    custom_text: {
      submit: {
        message: "Your order will be confirmed immediately after payment.",
      },
      terms_of_service_acceptance: {
        message:
          "By completing your purchase, you agree to our [Terms and Conditions](https://twinmos.com/terms) and [Privacy Policy](https://twinmos.com/privacy).",
      },
    },

    // 30-minute expiry (aligns with cart inventory reservation)
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return session.url!;
}

function shouldDisplayTaxExclusive(region: MedusaRegion): boolean {
  // UAE: tax-inclusive display; India and KSA: tax-exclusive
  return region.currency_code !== "aed";
}

function getAllowedCountriesForRegion(
  region: MedusaRegion
): Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] {
  const countryMap: Record<string, string[]> = {
    UAE: ["AE"],
    India: ["IN"],
    Bangladesh: ["BD"],
    KSA: ["SA"],
    International: [], // All countries — omit this field to allow all
  };
  return (countryMap[region.name] as any[]) ?? [];
}
```

### 8.2 Order ID Generation

TwinMOS uses a custom order ID format: `TWN-{YEAR}-{NNNNNN}` (e.g., `TWN-2026-000001`).

```typescript
// Custom Medusa order ID generator
// File: src/modules/order/id-generator.ts
export async function generateOrderId(
  medusaOrderService: any
): Promise<string> {
  const year = new Date().getFullYear();
  const lastOrder = await medusaOrderService.list(
    { year },
    { order: { created_at: "DESC" }, take: 1 }
  );
  const lastSequence = lastOrder.length > 0
    ? parseInt(lastOrder[0].display_id ?? "0", 10)
    : 0;
  const nextSequence = String(lastSequence + 1).padStart(6, "0");
  return `TWN-${year}-${nextSequence}`;
}
```

---

## 9. Payment Webhook Handling

### 9.1 Webhook Endpoint

**Endpoint:** `POST /webhooks/stripe`
**Authentication:** Stripe signature verification (not Bearer token)
**Registered in Stripe Dashboard at:** `https://api.twinmos.com/webhooks/stripe`

### 9.2 Events Handled

| Event | Priority | Action |
|---|---|---|
| `checkout.session.completed` | Critical | Create Medusa order; decrement inventory; deduct loyalty points; send confirmation email |
| `checkout.session.expired` | High | Release inventory reservation; update cart status to abandoned; trigger abandoned cart email |
| `payment_intent.payment_failed` | High | Update payment session status; log failure reason; (Stripe handles retry on its page) |
| `payment_intent.succeeded` | Medium | Secondary confirmation; used for reconciliation |
| `charge.refund.created` | High | Update Medusa order refund status; trigger refund confirmation email |
| `charge.dispute.created` | High | Alert TwinMOS PM via email; freeze order for dispute resolution |
| `charge.dispute.closed` | Medium | Update order status based on dispute outcome |

### 9.3 Webhook Handler Implementation

```typescript
// File: src/api/webhooks/stripe/route.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Idempotency: store processed event IDs to prevent duplicate processing
const processedEvents = new Set<string>(); // In production: use Redis or PostgreSQL

export async function POST(req: Request): Promise<Response> {
  const body = await req.text(); // Raw body for signature verification
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err}`);
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  // Idempotency check
  if (processedEvents.has(event.id)) {
    console.log(`Event ${event.id} already processed, skipping`);
    return new Response("Already processed", { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refund.created":
        await handleRefundCreated(event.data.object as Stripe.Refund);
        break;

      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    processedEvents.add(event.id);
    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error(`Error processing event ${event.id}: ${err}`);
    // Return 500 so Stripe retries the webhook
    return new Response("Internal error", { status: 500 });
  }
}

// Handler: checkout.session.completed
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const cartId = session.metadata?.medusa_cart_id;
  if (!cartId) throw new Error("No cart ID in session metadata");

  // 1. Complete the cart in Medusa → creates order
  const { order } = await medusaClient.carts.complete(cartId);

  // 2. Update order with Stripe session ID and payment intent ID
  await medusaClient.orders.update(order.id, {
    metadata: {
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
    },
  });

  // 3. Deduct loyalty points if redeemed
  const loyaltyPointsRedeemed = parseInt(
    session.metadata?.loyalty_points_redeemed ?? "0", 10
  );
  if (loyaltyPointsRedeemed > 0) {
    await deductLoyaltyPoints(order.customer_id, loyaltyPointsRedeemed, order.id);
  }

  // 4. Award loyalty points for the purchase
  // (1 point per USD 1 equivalent)
  await awardLoyaltyPoints(order.customer_id, order.total, order.currency_code, order.id);

  // 5. Send order confirmation email via Resend
  await sendOrderConfirmationEmail(order);

  // 6. Sync order to HubSpot CRM (deal created)
  await syncOrderToHubspot(order);

  console.log(`Order created: ${order.display_id} for cart ${cartId}`);
}

// Handler: checkout.session.expired
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const cartId = session.metadata?.medusa_cart_id;
  if (!cartId) return;

  // Release inventory reservation
  await medusaClient.carts.update(cartId, {
    metadata: { checkout_started_at: null },
  });

  // Trigger abandoned cart workflow
  const cart = await medusaClient.carts.retrieve(cartId);
  if (cart.email) {
    await triggerAbandonedCartHubspot(cart);
  }
}

// Handler: payment_intent.payment_failed
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const cartId = paymentIntent.metadata?.medusa_cart_id;

  // Log for analytics
  console.error(`Payment failed for cart ${cartId}:`, {
    code: paymentIntent.last_payment_error?.code,
    message: paymentIntent.last_payment_error?.message,
    decline_code: paymentIntent.last_payment_error?.decline_code,
  });

  // Update cart payment session status
  // (Stripe will show the error on its hosted page; customer can retry there)
}

// Handler: charge.refund.created
async function handleRefundCreated(refund: Stripe.Refund) {
  const chargeId = refund.charge as string;

  // Find Medusa order by Stripe payment intent
  const orders = await medusaClient.orders.list({
    metadata: { stripe_payment_intent_id: refund.payment_intent as string },
  });

  if (orders.orders.length === 0) {
    console.error(`No order found for refund ${refund.id}`);
    return;
  }

  const order = orders.orders[0];

  // Create refund in Medusa
  await medusaClient.orders.refunds.create(order.id, {
    amount: refund.amount,
    reason: refund.reason ?? "requested_by_customer",
    note: `Stripe refund ID: ${refund.id}`,
  });

  // Send refund confirmation email
  await sendRefundConfirmationEmail(order, refund.amount, order.currency_code);
}
```

### 9.4 Webhook Retry Policy (Stripe Side)

Stripe retries failed webhooks (when TwinMOS endpoint returns 4xx or 5xx) using an exponential backoff schedule:
- Attempt 1: Immediate
- Attempt 2: 5 minutes
- Attempt 3: 30 minutes
- Attempt 4: 2 hours
- Attempt 5: 5 hours
- Attempts 6–18: increasing intervals up to 72 hours

**TwinMOS webhook endpoint must:**
- Return `200 OK` within 30 seconds
- Return `500` if processing failed (so Stripe retries)
- Never return `200` before processing is confirmed

---

## 10. Webhook Security

### 10.1 Stripe Signature Verification

Every webhook request from Stripe includes a `Stripe-Signature` header containing a timestamp and HMAC-SHA256 signature. The signature is computed using the webhook endpoint's secret key.

```typescript
// Stripe signature verification — must happen before any processing
function verifyStripeWebhook(
  rawBody: string,
  signature: string,
  secret: string
): Stripe.Event {
  // stripe.webhooks.constructEvent:
  // 1. Parses the Stripe-Signature header (timestamp + v1 signature)
  // 2. Computes HMAC-SHA256 of `${timestamp}.${rawBody}` with the secret
  // 3. Compares computed signature to v1 signature
  // 4. Verifies timestamp is within 5 minutes (prevents replay attacks)
  // 5. Throws StripeSignatureVerificationError if any check fails
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
```

**Critical Implementation Requirements:**
- The webhook handler must receive the **raw request body** (as a string or Buffer), NOT the parsed JSON body. Express/Node.js body parsers modify the body, breaking signature verification.
- The 5-minute timestamp window (Stripe's default tolerance) is not configurable but provides protection against replay attacks.
- The webhook secret is different from the API secret key and is generated per-webhook-endpoint in the Stripe Dashboard.

### 10.2 Webhook Endpoint Security Hardening

```typescript
// Additional security: verify webhook source IP is a Stripe IP
// Stripe publishes its IP ranges at: https://stripe.com/docs/ips
const STRIPE_WEBHOOK_IPS = [
  "3.18.12.63",
  "3.130.192.231",
  "13.235.14.237",
  // ... full list in Stripe documentation
];

// Cloudflare WAF rule: only allow requests to /webhooks/stripe
// from Stripe IP ranges (configured in Cloudflare WAF)
// This is defence-in-depth; signature verification is the primary control
```

### 10.3 Idempotency

Stripe may deliver the same webhook event more than once (e.g., after a timeout or on retry). The webhook handler must be idempotent:

```typescript
// PostgreSQL-based idempotency store (production-grade)
// Table: stripe_processed_events (event_id VARCHAR PRIMARY KEY, processed_at TIMESTAMP)

async function isEventProcessed(eventId: string): Promise<boolean> {
  const result = await db.query(
    "SELECT 1 FROM stripe_processed_events WHERE event_id = $1",
    [eventId]
  );
  return result.rows.length > 0;
}

async function markEventProcessed(eventId: string): Promise<void> {
  await db.query(
    "INSERT INTO stripe_processed_events (event_id, processed_at) VALUES ($1, NOW()) ON CONFLICT DO NOTHING",
    [eventId]
  );
}
```

---

## 11. Payment Failure Handling

### 11.1 Stripe's Built-In Retry Handling

When using Stripe Checkout (redirect), Stripe's hosted page handles all payment failures and retry prompts automatically:
- If a card is declined, Stripe shows a localised error message on the checkout page
- Stripe allows the customer to try a different card without leaving the checkout session
- Stripe allows up to 3 payment attempts per checkout session before expiring the session

TwinMOS does not need to implement payment retry logic — Stripe Checkout manages this entirely.

### 11.2 Failed Checkout Session Handling (TwinMOS Side)

When a checkout session expires without successful payment (customer abandons after payment failure):

1. Stripe fires `checkout.session.expired` webhook
2. TwinMOS webhook handler (see Section 9.3) releases inventory reservation
3. Customer is on the Stripe hosted page; Stripe redirects to `cancel_url` after session expires
4. TwinMOS `/checkout/cancel` page shows a user-friendly message

### 11.3 Cancel Page Specification

**URL:** `/checkout/cancel`

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ⚠  Payment was not completed                            │
│                                                           │
│  No payment has been taken. Your cart has been saved.    │
│                                                           │
│  What would you like to do?                              │
│                                                           │
│  [  RETURN TO CART  ]    [  TRY AGAIN  ]                 │
│                                                           │
│  Need help? Contact us:                                   │
│  support@twinmos.com | +971 4 XXX XXXX                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

"Return to Cart" links to `/cart/` with the customer's saved cart.
"Try Again" re-initiates the checkout process from Step 4 (payment).

---

## 12. Refund Processing

### 12.1 Refund Policy

TwinMOS returns and refund policy (to be finalised with TwinMOS legal team):
- Defective products: full refund within 14 days of receipt
- Change of mind: store credit only (no cash refund) within 7 days
- Opened packaging: assessed on a case-by-case basis
- International orders: customer responsible for return shipping

This specification covers the technical implementation of refunds; the policy is defined externally.

### 12.2 Refund Types

| Type | Description | Initiated By | Timeline |
|---|---|---|---|
| Full refund | 100% of order total returned | Medusa Admin (TwinMOS support) | Processed by Stripe; 5–10 business days to card |
| Partial refund | Refund of specific items or portion of order | Medusa Admin | Same as full refund |
| Stripe-initiated refund | Stripe Radar auto-refund for suspected fraud | Stripe (automated) | Immediate; triggers webhook |

### 12.3 Refund Initiation via Medusa Admin

```typescript
// Medusa Admin: initiate refund
// This calls Stripe API behind the scenes via Medusa payment module
const refund = await medusaClient.orders.refunds.create(orderId, {
  amount: refundAmountInSmallestUnit,
  // e.g., for AED 299.00 = 29900 (fils)
  reason: "customer_request", // or "defective" | "other"
  note: "Customer reported product defect - DOA",
});
// Medusa automatically calls stripe.refunds.create({ payment_intent: ... })
```

### 12.4 Refund Notification

When `charge.refund.created` webhook is received:
1. Medusa order refund record is created
2. Resend email is sent to customer:
   - Subject: "Your TwinMOS refund has been processed"
   - Body: Order number, refund amount, refund method (original payment method), expected timeline (5–10 business days)
   - Support contact if questions

### 12.5 Refund Accounting

For UAE VAT compliance, refunds must:
- Issue a Credit Note (debit note against the original tax invoice)
- Credit Note stored in Backblaze B2 alongside the original invoice
- Credit Note sent to customer with refund confirmation email
- Recorded in TwinMOS finance system for VAT return filing

---

## 13. Fraud Prevention

### 13.1 Stripe Radar (Primary Fraud Defence)

Stripe Radar is Stripe's machine learning-based fraud detection system. It is automatically active on all Stripe accounts and analyses each payment attempt against Stripe's global fraud network (insights from millions of businesses worldwide).

**Default Stripe Radar Behaviour:**
- High-risk payments are automatically blocked (score > threshold)
- Medium-risk payments are flagged for 3DS challenge
- Low-risk payments proceed without friction

### 13.2 Custom Stripe Radar Rules

TwinMOS configures the following custom Radar rules in the Stripe Dashboard:

| Rule | Action | Rationale |
|---|---|---|
| Block if `dispute_rate > 0.08` per card country | Block | Elevated chargeback risk countries |
| Block if `ip_country != billing_country AND ip_country != shipping_country` | Review | IP/billing address mismatch |
| Block if order amount > AED 5,000 (and not a known customer) | Review | High-value orders from new customers |
| Block if same customer email, 3+ failed payments in 24h | Block | Payment brute-forcing |
| Allow if `customer_id` is not null (registered customer with order history) | Allow | Trust registered customers with history |

### 13.3 Cloudflare WAF Rules (Supplementary)

Cloudflare WAF provides network-level protection before requests reach the Medusa backend:

| WAF Rule | Description |
|---|---|
| Block Tor exit nodes | Tor traffic blocked from checkout endpoints |
| Block known malicious IPs | Cloudflare threat intelligence IP block list |
| Rate limit: /webhooks/stripe | Only allow Stripe IP ranges (defence in depth) |
| Bot challenge on /checkout/* | Challenge suspicious bot-like traffic (high request rate, missing cookies) |
| Block countries with TwinMOS restrictions | If TwinMOS has any sanctioned-country requirements |

### 13.4 Application-Level Rate Limiting

See Section 14 for rate limiting on checkout endpoints.

### 13.5 Fraud Response Protocol

When a suspected fraudulent order is detected:

1. **Stripe auto-block:** Stripe Radar blocks payment; no action needed from TwinMOS
2. **Stripe Radar review flag:** TwinMOS PM reviews in Stripe Dashboard within 24h; approves or refunds
3. **Chargeback received:** TwinMOS PM provides dispute evidence (order details, delivery confirmation, communication logs) via Stripe Dashboard within 7 days of chargeback notification

---

## 14. Rate Limiting

### 14.1 Checkout Endpoint Rate Limits

| Endpoint | Limit | Window | Enforcement Layer |
|---|---|---|---|
| `POST /store/carts` (create cart) | 20 per IP | 1 minute | Medusa middleware |
| `POST /store/carts/{id}/line-items` (add to cart) | 30 per IP | 1 minute | Medusa middleware |
| `POST /store/carts/{id}/payment-sessions` (initiate payment) | 5 per IP | 1 minute | Medusa middleware + Cloudflare |
| `POST /webhooks/stripe` | Unlimited for Stripe IPs; 0 for non-Stripe IPs | — | Cloudflare WAF |
| `GET /store/shipping-options` | 20 per IP | 1 minute | Medusa middleware |

### 14.2 Rate Limit Implementation

```typescript
// Medusa API middleware: rate limiting using Redis
// File: src/api/middlewares/rate-limit.ts
import { RateLimiterRedis } from "rate-limiter-flexible";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });

const checkoutRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "checkout_rl",
  points: 5,        // 5 requests
  duration: 60,     // per 60 seconds
  blockDuration: 300, // Block for 5 minutes after limit exceeded
});

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: Function
) {
  const ip = req.headers["cf-connecting-ip"] ?? req.ip; // Cloudflare real IP
  try {
    await checkoutRateLimiter.consume(ip as string);
    next();
  } catch {
    res.status(429).json({
      message: "Too many requests. Please wait a moment before trying again.",
      retry_after: 60,
    });
  }
}
```

### 14.3 User-Facing Rate Limit Message

When a customer hits a rate limit:
```
⚠  Too many attempts
Please wait 60 seconds before trying again.
If you need help, contact support@twinmos.com
```

---

## 15. Currency Handling

### 15.1 Amount Storage (Smallest Currency Unit)

All monetary amounts in Medusa and Stripe are stored and transmitted as integers in the **smallest currency unit** of each currency. This eliminates floating-point precision errors.

| Currency | Smallest Unit | Example |
|---|---|---|
| AED | Fils (1 AED = 100 fils) | AED 299.00 → 29900 |
| INR | Paise (1 INR = 100 paise) | ₹24,999.00 → 2499900 |
| BDT | Poisha (1 BDT = 100 poisha) | ৳3,299.00 → 329900 |
| SAR | Halala (1 SAR = 100 halala) | SAR 299.00 → 29900 |
| USD | Cents (1 USD = 100 cents) | $249.00 → 24900 |

**Note:** BDT is technically a zero-decimal currency in some systems, but Stripe treats it as a two-decimal currency (100 poisha per taka). Always use 100 as the divisor for BDT.

### 15.2 Price Display Conversion

```typescript
// Currency display utility — Astro storefront
export function displayPrice(
  amountInSmallestUnit: number,
  currencyCode: string,
  locale: string
): string {
  // Stripe and Medusa always use smallest unit
  // All currencies TwinMOS uses are 2-decimal (not zero-decimal)
  const amount = amountInSmallestUnit / 100;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Examples:
displayPrice(29900, "aed", "en-AE")    // → "AED 299.00"
displayPrice(2499900, "inr", "en-IN")  // → "₹24,999.00"
displayPrice(329900, "bdt", "bn-BD")   // → "৳3,299.00"
displayPrice(29900, "sar", "ar-SA")    // → "SAR 299.00"
displayPrice(24900, "usd", "en-US")    // → "$249.00"
```

### 15.3 Exchange Rate Handling for Loyalty Points

Loyalty points are denominated in USD-equivalent values internally (1 point = USD 0.01). When a customer redeems points in a non-USD currency:

```typescript
// Loyalty points discount calculation
function calculateLoyaltyDiscount(
  pointsToRedeem: number,
  currencyCode: string,
  exchangeRates: Record<string, number>  // From Medusa metadata, updated daily
): number {
  // 100 points = USD 1.00 = 100 cents
  const usdValueCents = pointsToRedeem; // 1 point = 1 cent

  if (currencyCode === "usd") return usdValueCents;

  // Convert USD cents to target currency smallest unit
  const rate = exchangeRates[currencyCode.toUpperCase()]; // e.g., AED: 3.67
  return Math.floor(usdValueCents * rate);
}
```

---

## 16. 3D Secure Authentication

### 16.1 3DS Handling by Stripe

3D Secure (3DS) authentication is handled entirely by Stripe. When using Stripe Checkout (redirect), Stripe automatically:

1. **Determines 3DS requirement** based on:
   - Card issuer requirements (many cards require 3DS for online transactions)
   - Stripe Radar risk assessment (higher-risk transactions prompted for 3DS)
   - European Strong Customer Authentication (SCA) rules (applicable to EU-issued cards)
   - Indian RBI 2FA requirements (applicable to Indian card issuers — required for all online transactions)

2. **Presents 3DS challenge** within the Stripe Checkout page — the customer does not leave Stripe's page

3. **Completes or abandons** 3DS — if the customer fails or abandons 3DS, Stripe marks the payment as failed

4. **Returns control to TwinMOS** via `success_url` or `cancel_url`

**TwinMOS does not implement any 3DS logic.** All 3DS complexity is managed by Stripe.

### 16.2 India-Specific 3DS Requirement

The Reserve Bank of India (RBI) mandates 2FA for all card transactions in India. Stripe India (used for INR payments) automatically applies 3DS for Indian-issued cards. This is transparent to TwinMOS.

### 16.3 3DS and Mada (KSA)

Mada cards in KSA typically require OTP-based authentication. Stripe handles this automatically for Mada transactions via the Saudi payment network.

---

## 17. Payment Receipts and Invoicing

### 17.1 Invoice Requirements

TwinMOS must issue a tax invoice for every completed order, compliant with:
- **UAE FTA (Federal Tax Authority):** Tax invoice requirements under UAE VAT law (Federal Decree-Law No. 8 of 2017)
- **India CGST/IGST:** GST invoice requirements under Indian GST law
- **KSA GAZT/ZATCA:** VAT invoice requirements under Saudi VAT law

### 17.2 Invoice Contents (All Markets)

| Field | Required | Example |
|---|---|---|
| Invoice number | Yes | INV-TWN-2026-000142 |
| Invoice date | Yes | 2026-05-15 |
| TwinMOS name and address | Yes | TwinMOS Technologies, DAFZA, Dubai, UAE |
| TwinMOS Tax Registration Number (TRN/GSTIN) | Yes | UAE TRN: 100XXXXXXXXXX3 |
| Customer name and address | Yes | John Smith, Business Bay, Dubai |
| Customer TRN (B2B only — optional for B2C) | Optional | — |
| Line items with description, quantity, unit price | Yes | VOLTX DDR5 16GB × 1 = AED 285.71 |
| Subtotal (excl. tax) | Yes | AED 898.00 |
| Tax amount and rate | Yes | VAT (5%) = AED 44.90 |
| Total (incl. tax) | Yes | AED 942.90 |
| Payment method | Yes | Visa ending 4242 |
| Order reference | Yes | TWN-2026-000142 |
| Currency | Yes | AED |

### 17.3 Invoice Generation

```typescript
// Invoice generation using a PDF library
// Triggered in handleCheckoutCompleted webhook handler
import PDFDocument from "pdfkit"; // or @derhuerst/pdf-lib

async function generateInvoice(order: MedusaOrder): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {});

  // Header
  doc.image("./assets/twinmos-logo.png", 50, 50, { width: 150 });
  doc.fontSize(20).text("TAX INVOICE", { align: "right" });

  // Invoice metadata
  doc.fontSize(10)
    .text(`Invoice No: INV-${order.display_id}`)
    .text(`Date: ${order.created_at.toISOString().split("T")[0]}`)
    .text(`Order Ref: ${order.display_id}`);

  // TwinMOS details
  doc.text("TwinMOS Technologies LLC")
    .text("Dubai Airport Free Zone (DAFZA)")
    .text("Dubai, United Arab Emirates")
    .text(`TRN: ${process.env.UAE_VAT_TRN}`);

  // Bill to
  doc.text("BILL TO:")
    .text(`${order.shipping_address.first_name} ${order.shipping_address.last_name}`)
    .text(order.shipping_address.address_1)
    .text(`${order.shipping_address.city}, ${order.shipping_address.country_code?.toUpperCase()}`);

  // Line items table
  order.items.forEach((item) => {
    const unitExclTax = item.unit_price / (1 + order.tax_rate / 100);
    doc.text(`${item.title} - ${item.description}`)
      .text(`Qty: ${item.quantity}`)
      .text(`Unit Price (excl. tax): ${displayPrice(unitExclTax, order.currency_code, "en")}`)
      .text(`Line Total: ${displayPrice(item.subtotal, order.currency_code, "en")}`);
  });

  // Summary
  doc.text(`Subtotal: ${displayPrice(order.subtotal, order.currency_code, "en")}`)
    .text(`Tax (${order.tax_rate}%): ${displayPrice(order.tax_total, order.currency_code, "en")}`)
    .text(`Shipping: ${displayPrice(order.shipping_total, order.currency_code, "en")}`)
    .text(`TOTAL: ${displayPrice(order.total, order.currency_code, "en")}`);

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function storeInvoice(
  orderId: string,
  pdfBuffer: Buffer
): Promise<string> {
  // Store in Backblaze B2 with 7-year retention
  const b2 = new B2({
    applicationKeyId: process.env.B2_KEY_ID!,
    applicationKey: process.env.B2_APP_KEY!,
  });

  await b2.authorize();
  const fileName = `invoices/${new Date().getFullYear()}/${orderId}/invoice.pdf`;
  const uploadUrl = await b2.getUploadUrl({ bucketId: process.env.B2_INVOICE_BUCKET_ID! });

  await b2.uploadFile({
    uploadUrl: uploadUrl.data.uploadUrl,
    uploadAuthToken: uploadUrl.data.authorizationToken,
    fileName,
    data: pdfBuffer,
    contentType: "application/pdf",
  });

  return fileName;
}
```

### 17.4 Invoice Retention

- **Retention period:** 7 years from invoice date (UAE FTA requirement; also meets India and KSA requirements)
- **Storage:** Backblaze B2 dedicated invoice bucket (`twinmos-invoices`)
- **Access:** TwinMOS Finance team can retrieve invoices via B2 web interface or CLI
- **Customer access:** Invoice PDF attached to order confirmation email; also downloadable from /account/orders/{id}

---

## 18. Admin Payment Dashboard

### 18.1 Primary Tool: Stripe Dashboard

The Stripe Dashboard (dashboard.stripe.com) is the primary tool for TwinMOS Finance and TwinMOS PM to monitor payments:

| Feature | Stripe Dashboard Location |
|---|---|
| Live transaction monitoring | Dashboard > Payments |
| Payment failure analysis | Dashboard > Payments > Failed |
| Chargeback management | Dashboard > Disputes |
| Refund initiation | Dashboard > Payments > [Payment] > Refund |
| Payout schedule and history | Dashboard > Payouts |
| Stripe Radar fraud review | Dashboard > Radar |
| Stripe Tax filings | Dashboard > Tax > Filings |
| Revenue reports | Dashboard > Reports > Revenue |

### 18.2 Secondary Tool: Medusa Admin

The Medusa Admin panel (accessible at the Medusa admin URL, IP-allowlisted) provides:

| Feature | Medusa Admin Location |
|---|---|
| Order list with payment status | Orders > All Orders |
| Order detail with payment breakdown | Orders > [Order ID] |
| Refund initiation (calls Stripe API) | Orders > [Order ID] > Refund |
| Loyalty points adjustment | Customers > [Customer] > Loyalty |
| Promotion/coupon management | Promotions |
| Product inventory management | Products > Inventory |

### 18.3 Dashboard Access Control

| Role | Stripe Dashboard Access | Medusa Admin Access |
|---|---|---|
| TwinMOS PM | Full | Full |
| TwinMOS Finance | Full | Read-only (orders, reports) |
| Dev B | Full (for debugging) | Full |
| Dev A | No payment access | No payment access |
| TwinMOS Marketing | Reports only | Read-only (orders) |

All Stripe Dashboard accounts must have MFA enabled. Access is reviewed monthly.

---

## 19. Reconciliation

### 19.1 Daily Reconciliation Process

Stripe pays out TwinMOS's collected funds on a rolling daily basis (T+2 for most currencies; T+7 for first payout on a new account). TwinMOS Finance must reconcile Stripe payouts against Medusa orders daily.

**Reconciliation Steps (TwinMOS Finance — daily):**

1. Download Stripe payout report from Dashboard > Reports > Balance
2. Download Medusa orders report for the same date range (Medusa Admin > Orders > Export)
3. Match each Stripe payment intent ID against Medusa order `metadata.stripe_payment_intent_id`
4. Verify: total Stripe revenue per currency = sum of Medusa order totals per currency
5. Identify and investigate any discrepancies (unmatched orders, refunds, Stripe fees)
6. Record reconciliation in TwinMOS finance system

### 19.2 Automated Reconciliation (Phase 3.1 Enhancement)

A scheduled job runs daily at 02:00 UAE time to perform automated reconciliation:

```typescript
// Scheduled job: daily reconciliation check
// Runs at 02:00 UAE time (22:00 UTC previous day)
async function dailyReconciliation() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();

  // Fetch Stripe payments
  const stripePayments = await stripe.paymentIntents.list({
    created: {
      gte: Math.floor(yesterday.getTime() / 1000),
      lt: Math.floor(today.getTime() / 1000),
    },
    limit: 100,
  });

  // Fetch Medusa orders
  const medusaOrders = await medusaClient.orders.list({
    created_at: { gte: yesterday.toISOString(), lt: today.toISOString() },
  });

  // Find discrepancies
  const discrepancies = findReconciliationDiscrepancies(
    stripePayments.data,
    medusaOrders.orders
  );

  if (discrepancies.length > 0) {
    await sendReconciliationAlert(discrepancies); // Resend email to TwinMOS Finance
  }
}
```

### 19.3 Stripe Fee Accounting

Stripe charges a percentage fee + fixed fee per transaction. TwinMOS Finance must account for these fees:
- **UAE/International:** 2.9% + $0.30 per successful card charge (varies by country and card type)
- **India:** Stripe India rates (check current pricing at stripe.com/en-in/pricing)
- The fees are visible in Stripe Dashboard > Payouts; net amount (after fees) is what TwinMOS receives

---

## 20. Error Codes and User-Facing Messages

### 20.1 Stripe Decline Codes and TwinMOS User Messages

| Stripe Error / Decline Code | User-Facing Message | Suggested Action |
|---|---|---|
| `card_declined` (generic) | "Your card was declined. Please try a different payment method or contact your bank." | Try different card |
| `insufficient_funds` | "Your card has insufficient funds. Please try a different card or payment method." | Try different card |
| `do_not_honor` | "Your card was declined. Please contact your card issuer for more information." | Contact bank |
| `expired_card` | "Your card has expired. Please use a different card." | Use new card |
| `incorrect_cvc` | "Your card's security code is incorrect." (Stripe shows this on its page) | Re-enter CVC |
| `authentication_required` | "This payment requires additional authentication. Please complete the verification on your bank's page." | Complete 3DS |
| `3ds_authentication_failed` | "Payment authentication failed. Please try again or contact your bank." | Retry or call bank |
| `payment_method_not_supported` | "This payment method is not supported in your region. Please use a different method." | Use supported method |
| `rate_limit` (TwinMOS) | "Too many checkout attempts. Please wait a moment and try again." | Wait and retry |
| `stripe_service_unavailable` | "Our payment service is temporarily unavailable. Please try again shortly or contact support@twinmos.com." | Wait and retry |

### 20.2 Webhook Processing Error Codes (Internal)

| Error | Log Message | Action |
|---|---|---|
| Missing `medusa_cart_id` in metadata | `WEBHOOK_ERR: No cart ID in session ${session.id}` | Alert to TwinMOS PM; manual order creation required |
| Cart already completed (duplicate webhook) | `WEBHOOK_DUP: Cart ${cartId} already completed` | Idempotency guard; safe to ignore |
| Medusa order creation failed | `ORDER_ERR: Failed to complete cart ${cartId}: ${error}` | Retry 3x; alert to TwinMOS PM |
| Resend email failed | `EMAIL_ERR: Order confirmation failed for ${orderId}` | Retry 3x; manual email fallback |
| Loyalty deduction failed | `LOYALTY_ERR: Failed to deduct points for ${orderId}` | Alert; manual points adjustment |

---

## 21. Security Requirements

### 21.1 Transport Security

| Requirement | Specification |
|---|---|
| TLS version | TLS 1.3 minimum; TLS 1.2 allowed for compatibility; SSL/TLS 1.0/1.1 disabled |
| HSTS | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| Certificate | Cloudflare managed certificate (auto-renewed) |
| API connections to Stripe | TLS 1.2+ (Stripe enforces this on their side) |

### 21.2 Data Handling — PCI Requirements

| Requirement | Implementation |
|---|---|
| No PAN (card number) in logs | Log scrubbing: regex pattern to detect and redact 12–19 digit sequences from all logs |
| No CVV in logs | Regex pattern to detect and redact 3–4 digit sequences adjacent to card-like patterns |
| No card expiry in logs | Regex pattern to detect and redact MM/YY patterns adjacent to card-like data |
| No Stripe API secret key in code | Environment variable only; `.env` in `.gitignore` |
| No Stripe webhook secret in code | Environment variable only |
| Stripe API key in Medusa config | Read from environment at runtime; never serialised to response |

### 21.3 Log Sanitisation Implementation

```typescript
// Log sanitiser: runs on all log output before writing
const PCI_PATTERNS = [
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,  // Card number
  /\b\d{13,19}\b/g,                                  // Long numeric sequences (PAN)
  /cvv[=:"\s]+\d{3,4}/gi,                           // CVV field
  /cvc[=:"\s]+\d{3,4}/gi,                           // CVC field
  /\b(0[1-9]|1[0-2])\/\d{2,4}\b/g,                 // Expiry date MM/YY
  /sk_live_[a-zA-Z0-9]{20,}/g,                      // Stripe live secret key
  /whsec_[a-zA-Z0-9]{20,}/g,                        // Stripe webhook secret
];

export function sanitiseLogs(message: string): string {
  let sanitised = message;
  for (const pattern of PCI_PATTERNS) {
    sanitised = sanitised.replace(pattern, "[REDACTED]");
  }
  return sanitised;
}
```

### 21.4 Access Control

| System | Access Control |
|---|---|
| Stripe Dashboard | MFA required; minimum access principle by role |
| Medusa Admin | IP allowlist + Basic Auth; accessible only from approved office IPs or via VPN |
| PostgreSQL database | No direct external access; only via Medusa backend running on same server |
| Backblaze B2 invoice bucket | Access key restricted to invoice read/write only; separate from media bucket |
| Coolify (server management) | MFA required; TwinMOS PM and Dev B only |

---

## 22. Acceptance Criteria

| ID | Acceptance Criterion | Verification Method |
|---|---|---|
| AC-PAY-001 | Guest can complete purchase with Visa card in AED via Stripe Checkout | UAT with Stripe test card |
| AC-PAY-002 | Guest can complete purchase with Mastercard in INR | UAT with Stripe test card |
| AC-PAY-003 | Guest can complete purchase in BDT | UAT with Stripe test card |
| AC-PAY-004 | Guest can complete purchase with SAR and Mada (test mode) | UAT with Stripe test card |
| AC-PAY-005 | Guest can complete purchase with USD | UAT with Stripe test card |
| AC-PAY-006 | Apple Pay button appears on UAE checkout (Safari on iPhone) | Device test |
| AC-PAY-007 | UPI option visible on India checkout | Stripe test mode verification |
| AC-PAY-008 | Payment declined: Stripe shows error on hosted page; user can retry | Stripe test card 4000000000000002 |
| AC-PAY-009 | 3DS required: Stripe shows 3DS challenge; success completes payment | Stripe test card 4000002500003155 |
| AC-PAY-010 | 3DS failed: payment not completed; cancel_url reached | Stripe test card 4000008400001629 |
| AC-PAY-011 | checkout.session.completed webhook received; Medusa order created within 30 seconds | Stripe webhook log + Medusa admin |
| AC-PAY-012 | Webhook signature verification rejects invalid signature | Send webhook with wrong secret; verify 400 response |
| AC-PAY-013 | Duplicate webhook: same event_id processed only once | Send same webhook twice; verify single order |
| AC-PAY-014 | Order confirmation email sent within 2 minutes of payment | Email timestamp verification |
| AC-PAY-015 | PDF invoice attached to order confirmation email | Email attachment check |
| AC-PAY-016 | Full refund via Medusa Admin updates order status and triggers refund email | UAT refund flow |
| AC-PAY-017 | Partial refund: correct amount refunded; order shows partial refund status | UAT partial refund |
| AC-PAY-018 | Checkout rate limit: 6th attempt within 1 minute returns 429 | Automated rate limit test |
| AC-PAY-019 | No PAN, CVV, or card expiry appears in Medusa or Stripe webhook handler logs | Log audit |
| AC-PAY-020 | UAE VAT: tax is 5% of pre-tax price; TRN shown on invoice | Invoice verification for UAE order |
| AC-PAY-021 | India GST: tax is 18%; GSTIN shown on invoice | Invoice verification for India order |
| AC-PAY-022 | KSA VAT: tax is 15%; KSA TRN shown on invoice | Invoice verification for KSA order |
| AC-PAY-023 | International USD: no tax line on invoice | Invoice verification for USD order |
| AC-PAY-024 | Invoice stored in Backblaze B2 and retrievable by TwinMOS Finance | B2 bucket file existence check |
| AC-PAY-025 | SAQ A self-assessment completed and signed off before go-live | SAQ A document |

---

## 23. Integration Test Plan

### 23.1 Test Environment

All payment integration tests are conducted in Stripe **test mode** using Stripe's test card numbers. No real payments are made during testing.

**Stripe Test Cards:**

| Card Number | Outcome | Use For |
|---|---|---|
| `4242 4242 4242 4242` | Payment succeeds | Happy path test |
| `4000 0000 0000 0002` | Card declined | Decline handling test |
| `4000 0025 0000 3155` | 3DS required — success | 3DS flow test |
| `4000 0084 0000 1629` | 3DS required — fails | 3DS failure test |
| `4000 0000 0000 9995` | Insufficient funds | Insufficient funds test |
| `4100 0000 0000 0019` | Fraudulent (Radar blocks) | Fraud detection test |
| `4000 0000 0000 3220` | 3DS required — card authentication unavailable | 3DS edge case |

**UPI Test (India):**
- Use Stripe test mode UPI flow; Stripe provides test UPI IDs in documentation

**Mada Test (KSA):**
- Use Stripe test mode Mada cards; verify Mada branding appears on Stripe Checkout

### 23.2 Test Cases

| Test ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| IT-PAY-001 | Happy path — UAE guest checkout | Add VOLTX DDR5 to cart → Checkout → Enter UAE address → Select Aramex → Pay with 4242 card | Order created; email received; order in Medusa |
| IT-PAY-002 | Happy path — India registered checkout | Login → Cart with CoreX Pro → Checkout with INR → Pay with test card | Order in INR; GST invoice |
| IT-PAY-003 | Card declined | Checkout → Pay with 4000000000000002 | Error shown on Stripe page; customer can retry |
| IT-PAY-004 | 3DS success | Checkout → Pay with 4000002500003155 → Complete 3DS | Payment succeeds after 3DS |
| IT-PAY-005 | 3DS failure | Checkout → Pay with 4000008400001629 → Fail 3DS | Payment fails; cancel_url reached |
| IT-PAY-006 | Webhook processing | Complete test payment → verify webhook received | Order in Medusa within 30s |
| IT-PAY-007 | Duplicate webhook | Send same webhook event_id twice | Order created once; second webhook returns 200 without duplicate order |
| IT-PAY-008 | Invalid webhook signature | Send webhook with wrong secret | 400 response; no order created |
| IT-PAY-009 | Full refund | Create order → Refund from Medusa Admin | Refund appears in Stripe; email sent |
| IT-PAY-010 | Partial refund | Create order (2 items) → Partial refund for 1 item | Correct amount refunded |
| IT-PAY-011 | Rate limiting | Send 6 payment session create requests within 1 minute | 6th request returns 429 |
| IT-PAY-012 | UAE VAT calculation | Create UAE order AED 298.00 excl. tax | Tax = AED 14.90; total = AED 312.90 |
| IT-PAY-013 | India GST calculation | Create India order INR 23,600 excl. tax | Tax = INR 4,248; total = INR 27,848 |
| IT-PAY-014 | KSA VAT calculation | Create KSA order SAR 298.00 excl. tax | Tax = SAR 44.70; total = SAR 342.70 |
| IT-PAY-015 | Apple Pay on iPhone Safari (UAE) | Navigate to checkout on iPhone; verify Apple Pay button | Apple Pay appears; payment completes |
| IT-PAY-016 | Loyalty points with payment | Checkout with 500 loyalty points → Pay | AED 5 deducted; points balance reduced by 500 post-payment |
| IT-PAY-017 | 30-min session expiry | Start checkout → wait 31 minutes → pay | Session expired; checkout.session.expired webhook fired; inventory released |
| IT-PAY-018 | Checkout session cancel | Start checkout → click "cancel" on Stripe page | cancel_url loaded; cart preserved |
| IT-PAY-019 | Log sanitisation | Complete payment; check Medusa logs for PAN/CVV | No card data in logs |
| IT-PAY-020 | Invoice generation | Complete payment | PDF invoice in Backblaze B2; attached to email |

### 23.3 Load Test for Payment Endpoint

```bash
# k6 load test for checkout session creation
# File: tests/payment-load.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,           // 50 virtual users
  duration: "2m",    // For 2 minutes
  thresholds: {
    http_req_duration: ["p(95)<3000"], // 95% of requests < 3 seconds
    http_req_failed: ["rate<0.01"],    // < 1% failure rate
  },
};

export default function () {
  // Create a cart
  const cartRes = http.post(
    `${__ENV.MEDUSA_URL}/store/carts`,
    JSON.stringify({ region_id: "reg_ae" }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(cartRes, { "cart created": (r) => r.status === 200 });
  const cartId = cartRes.json("cart.id");

  // Add item
  http.post(
    `${__ENV.MEDUSA_URL}/store/carts/${cartId}/line-items`,
    JSON.stringify({ variant_id: __ENV.TEST_VARIANT_ID, quantity: 1 }),
    { headers: { "Content-Type": "application/json" } }
  );

  sleep(1);

  // Create payment session
  const payRes = http.post(
    `${__ENV.MEDUSA_URL}/store/carts/${cartId}/payment-sessions`,
    JSON.stringify({ provider_id: "stripe" }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(payRes, {
    "payment session created": (r) => r.status === 200,
    "session URL returned": (r) => r.json("cart.payment_session.data.url") !== null,
  });

  sleep(2);
}
```

---

*TwinMOS Technologies — Payment Processing Specification*
*Reference: TWN-P3-PAY-2026-001 v1.0 | FINAL | 1 May 2026*
*Classification: Internal — Confidential — PCI Sensitive*
*Access restricted to authorised TwinMOS project team members*
