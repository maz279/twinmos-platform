# TwinMOS Website — Integration Specification: Stripe Payment

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-STRIPE-001 |
| **Version** | 0.1 (Draft) |
| **Status** | Draft |
| **Phase** | P3 |
| **Priority** | P3 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §12; BRD §20 |

---

## 1. Status Notice

> **Stripe integration is a Phase 3 feature.** This document provides the planned integration specification. Full implementation details will be developed during the Phase 3 design sprint (months 10-15).
>
> **Prerequisite:** Medusa.js e-commerce engine must be deployed and configured before Stripe integration begins. See [TwinMOSWebsiteIntegrationSpecMedusa_Commerce.md](TwinMOSWebsiteIntegrationSpecMedusa_Commerce.md).

---

## 2. Overview

**Stripe** is the payment processor for TwinMOS direct-to-consumer e-commerce (Phase 3). Stripe Checkout (hosted) provides PCI-compliant payment processing without TwinMOS servers ever handling cardholder data.

### 2.1 Integration Stack

```
Browser (Astro / React)
        │
        │  AddToCart → Checkout
        ▼
Medusa.js (Hetzner VPS)
  ├── Cart management
  ├── Order management
  └── @medusajs/payment-stripe
        │
        │  Stripe API
        ▼
Stripe Checkout (hosted)
        │
        │  Webhooks
        ▼
Medusa.js webhook handler
```

---

## 3. Stripe Configuration

### 3.1 Medusa Stripe Plugin

```bash
npm install @medusajs/payment-stripe
```

**`medusa-config.js`:**
```javascript
const plugins = [
  {
    resolve: `@medusajs/payment-stripe`,
    options: {
      api_key: process.env.STRIPE_SECRET_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
      capture: true,    // Auto-capture on payment
    },
  },
];
```

### 3.2 Accepted Payment Methods

| Method | Region | Phase |
|--------|--------|-------|
| Card (Visa, Mastercard, Amex) | Global | P3 |
| Apple Pay | iOS/macOS browsers | P3 |
| Google Pay | Android/Chrome | P3 |
| KNET | Kuwait | P4 consideration |
| Tabby (Buy Now Pay Later) | UAE, KSA, Egypt | P4 consideration |
| PayTabs | MENA | P4 consideration |

### 3.3 Currencies

| Currency | Phase | Notes |
|----------|-------|-------|
| USD | P3 | Primary (international customers) |
| AED | P3 consideration | UAE market |
| INR | P3 consideration | India market |
| BDT | P4 | Bangladesh market |

---

## 4. Checkout Flow

```
Customer adds to cart
        │
        ▼
Checkout page (Astro)
        │  POST /store/carts/{id}/payment-sessions
        ▼
Medusa creates Stripe PaymentIntent
        │
        ▼
Stripe Checkout Session created
        │  Redirect to Stripe-hosted checkout
        ▼
Customer completes payment on Stripe
        │  Redirect back to twinmos.com/checkout/success
        ▼
Stripe sends webhook → Medusa
checkout.session.completed
        │
        ▼
Medusa marks order as paid
Fulfillment workflow triggered
```

---

## 5. PCI Compliance

TwinMOS achieves **SAQ A** (Self-Assessment Questionnaire A) compliance — the lowest PCI DSS level:

| Scope | Detail |
|-------|--------|
| Cardholder data on TwinMOS servers | None — Stripe hosts all card data |
| TwinMOS PCI scope | Minimal — only redirect/iframe |
| Annual assessment | SAQ A self-assessment only |
| 3DS / SCA | Automatic — Stripe Checkout handles Strong Customer Authentication |

---

## 6. Webhook Events

| Stripe Event | Medusa Action | Business Effect |
|-------------|--------------|----------------|
| `checkout.session.completed` | Mark order paid, trigger fulfillment | Order confirmed, email sent |
| `payment_intent.payment_failed` | Mark payment failed | Customer notified |
| `charge.refunded` | Create refund in Medusa | Customer refund initiated |
| `customer.subscription.*` | N/A (Phase 3 has no subscriptions) | — |

**Webhook endpoint:**
```
POST https://cms.twinmos.com/hooks/stripe
```

Secured with `STRIPE_WEBHOOK_SECRET` (Stripe signature verification).

---

## 7. Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key (`sk_live_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) — safe for frontend |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |

**Test keys:** `sk_test_...` and `pk_test_...` for staging/development.

---

## 8. Tax Handling

| Region | Tax Approach | Phase |
|--------|-------------|-------|
| UAE | 5% VAT (Stripe Tax) | P3 |
| India | 18% GST | P3/P4 |
| EU | VAT by country (Stripe Tax) | P4 |
| Bangladesh | TBD | P4 |

Stripe Tax (add-on) calculates and collects taxes automatically. TwinMOS must register for UAE VAT (already likely registered given DAFZA operations).

---

## 9. Related Documents

- [TwinMOSWebsiteIntegrationSpecMedusa_Commerce.md](TwinMOSWebsiteIntegrationSpecMedusa_Commerce.md)
- ADR-014: E-commerce — Medusa vs Stripe-only
