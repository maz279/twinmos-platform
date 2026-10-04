# Tax Calculation Specification
## TwinMOS Technologies Corporate Website — Phase 3

| Field | Value |
|---|---|
| Document Reference | TWN-P3-TAX-2026-001 |
| Version | 1.0 |
| Date | 2026-05-01 |
| Author | TwinMOS Web Platform Team |
| Status | Draft for Review |
| Phase | Phase 3 — Commerce and Advanced Features |
| Module | P.2 — E-Commerce Core Specifications |

---

## Table of Contents

1. [Overview and Purpose](#1-overview-and-purpose)
2. [Tax Architecture](#2-tax-architecture)
3. [Regional Tax Rules](#3-regional-tax-rules)
4. [Tax Display Rules](#4-tax-display-rules)
5. [Stripe Tax Configuration](#5-stripe-tax-configuration)
6. [TaxJar Configuration (Fallback)](#6-taxjar-configuration-fallback)
7. [Tax Calculation Flow](#7-tax-calculation-flow)
8. [Invoice Requirements by Region](#8-invoice-requirements-by-region)
9. [Invoice Generation and Delivery](#9-invoice-generation-and-delivery)
10. [Tax Exemptions](#10-tax-exemptions)
11. [Tax Reporting](#11-tax-reporting)
12. [Medusa.js Tax Module Configuration](#12-medusajs-tax-module-configuration)
13. [Edge Cases and Special Scenarios](#13-edge-cases-and-special-scenarios)
14. [Test Scenarios](#14-test-scenarios)
15. [Acceptance Criteria](#15-acceptance-criteria)
16. [Business Rules Reference](#16-business-rules-reference)

---

## 1. Overview and Purpose

### 1.1 Document Scope

This specification defines the complete tax calculation, display, collection, and reporting architecture for the TwinMOS Technologies e-commerce platform across all Phase 3 markets. It covers the integration of Stripe Tax as the primary tax engine with TaxJar as an alternative/fallback provider, regional compliance requirements, invoice generation, and reporting obligations.

### 1.2 Business Context

TwinMOS Technologies operates as a memory and storage manufacturer selling directly to consumers (B2C) and businesses (B2B) across five Phase 3 markets:

- **UAE** — United Arab Emirates (home market, DAFZA headquarters)
- **India** — Major growth market, operated via TwinMOS India Pvt Ltd
- **Bangladesh** — Distributor-managed market
- **KSA** — Kingdom of Saudi Arabia (high-growth Gulf market)
- **International** — Rest of world, USD-denominated

Each jurisdiction imposes distinct tax obligations with different rates, calculation methods, invoice formats, and compliance requirements. This specification ensures full compliance across all markets while providing a consistent, frictionless checkout experience for customers.

### 1.3 Compliance Disclaimer

This specification is based on tax regulations effective as of 2026-05-01. Tax laws are subject to change. TwinMOS Finance and Legal teams must review this specification with qualified tax advisors in each jurisdiction before go-live. The platform implementation must be flexible enough to accommodate rate changes without code deployments.

### 1.4 Stakeholders

| Stakeholder | Role |
|---|---|
| TwinMOS Finance Team | Tax compliance owner, reporting recipient |
| TwinMOS Legal Team | Regulatory compliance review |
| Platform Engineering | Implementation of tax integration |
| Stripe Account Manager | Stripe Tax configuration support |
| TaxJar Support | TaxJar integration support (if activated) |
| External Tax Advisor (UAE) | FTA compliance guidance |
| External Tax Advisor (India) | GST compliance guidance |
| External Tax Advisor (KSA) | ZATCA compliance guidance |

---

## 2. Tax Architecture

### 2.1 Architecture Overview

The TwinMOS tax architecture follows a layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Checkout                         │
│              (Astro 5 Frontend + Medusa.js)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ Tax calculation request
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Medusa.js Tax Module (v2)                       │
│         Tax Provider Abstraction Layer                       │
└──────────┬──────────────────────────────────────────────────┘
           │                         │
           ▼ Primary                 ▼ Fallback
┌──────────────────┐       ┌─────────────────────┐
│   Stripe Tax     │       │     TaxJar API       │
│   (Preferred)    │       │  (Alternative/Backup) │
│                  │       │                       │
│ - Real-time calc │       │ - Real-time calc      │
│ - Auto-filing    │       │ - Sales tax focus     │
│ - Multi-region   │       │ - Address validation  │
└──────────────────┘       └─────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Tax Results Applied to Cart                     │
│         Stripe Checkout / Medusa Cart Object                 │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│         Invoice Generation (Resend + React Email)            │
│              PDF stored in Backblaze B2                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Primary Provider: Stripe Tax

**Stripe Tax** is the preferred primary tax provider due to its native integration with the Stripe payment infrastructure already used by TwinMOS.

**Reasons for preferring Stripe Tax:**
- Native integration with Stripe Checkout (no separate API call needed)
- Automatic tax registration monitoring
- Built-in support for UAE VAT, Indian GST, and Saudi VAT
- Automatic rate updates (no manual maintenance required)
- Consistent data model with Stripe payment records
- Tax reports directly in Stripe Dashboard

**Activation Requirement:** Stripe Tax must be activated on the TwinMOS Stripe account for each jurisdiction before go-live.

### 2.3 Fallback Provider: TaxJar

**TaxJar** serves as the fallback/alternative provider in the following scenarios:

- Stripe Tax API is unavailable (HTTP 503 or timeout > 3 seconds)
- Stripe Tax does not support a specific tax jurisdiction required by TwinMOS
- Business decision to use TaxJar for specific markets (e.g., Bangladesh where Stripe Tax coverage may be limited)

**Fallback Trigger Logic:**

```typescript
// Medusa.js Tax Provider with fallback
async calculateTaxes(taxableAmount: TaxableAmountInput): Promise<ProviderTaxLine[]> {
  try {
    const result = await this.stripeTaxProvider.calculateTaxes(taxableAmount);
    return result;
  } catch (error) {
    if (error.code === 'STRIPE_TAX_UNAVAILABLE' || error.statusCode === 503) {
      this.logger.warn('Stripe Tax unavailable, falling back to TaxJar');
      return await this.taxJarProvider.calculateTaxes(taxableAmount);
    }
    throw error;
  }
}
```

### 2.4 Tax Provider Decision Matrix

| Market | Primary Provider | Fallback | Notes |
|---|---|---|---|
| UAE | Stripe Tax | TaxJar | FTA-compliant VAT |
| India | Stripe Tax | TaxJar | GST with CGST/SGST/IGST split |
| KSA | Stripe Tax | TaxJar | ZATCA-compliant |
| Bangladesh | TaxJar | Manual calculation | Stripe Tax coverage limited |
| International | Stripe Tax | None | No tax applied; duty at destination |

---

## 3. Regional Tax Rules

### 3.1 UAE — Value Added Tax (VAT)

#### 3.1.1 Regulatory Framework

| Parameter | Value |
|---|---|
| Tax Authority | Federal Tax Authority (FTA) |
| Tax Type | Value Added Tax (VAT) |
| Standard Rate | 5% |
| Zero Rate | 0% (exports outside GCC) |
| Exempt | Financial services, residential property (not applicable to TwinMOS) |
| TwinMOS TRN | [TRN to be inserted by Finance team] |
| Registration Status | Registered |
| Filing Frequency | Quarterly |
| Currency | AED |

#### 3.1.2 Applicable Product Categories

All TwinMOS products (RAM modules, SSDs, USB flash drives) are standard-rated at **5% VAT** in the UAE. There are no reduced rates or exemptions applicable to memory and storage hardware in the UAE tax framework.

| Product Category | VAT Rate | Notes |
|---|---|---|
| DDR5 / DDR4 RAM Modules | 5% | Standard electronic goods |
| NVMe SSDs | 5% | Standard electronic goods |
| SATA SSDs | 5% | Standard electronic goods |
| Portable SSDs | 5% | Standard electronic goods |
| USB Flash Drives | 5% | Standard electronic goods |
| Accessories / Packaging | 5% | Follows main product rate |
| Shipping charges | 5% | If separately itemized |

#### 3.1.3 B2B Transactions

For B2B customers in UAE with a valid TRN, VAT is still charged at 5% and the buyer recovers input VAT through their own returns. TwinMOS must record the buyer's TRN on the tax invoice if provided.

#### 3.1.4 Export Sales (UAE to International)

Sales from UAE warehouse to customers outside the GCC are zero-rated for UAE VAT purposes. The Stripe Tax system must be configured to apply 0% for UAE-origin shipments with international delivery addresses.

### 3.2 India — Goods and Services Tax (GST)

#### 3.2.1 Regulatory Framework

| Parameter | Value |
|---|---|
| Tax Authority | Goods and Services Tax Council / GSTN |
| Tax Type | Goods and Services Tax (GST) |
| Standard Rate | 18% (for computer hardware) |
| GSTIN | [GSTIN to be inserted by Finance team — TwinMOS India Pvt Ltd] |
| Registration Status | Registered (TwinMOS India Pvt Ltd) |
| Filing Frequency | Monthly GSTR-1, GSTR-3B; Annually GSTR-9 |
| Currency | INR |

#### 3.2.2 HSN Code Classification

| Product | HSN Code | GST Rate | Notes |
|---|---|---|---|
| RAM Modules (DDR4/DDR5) | 8473.30 | 18% | Parts/accessories for computers |
| NVMe SSD | 8471.70 | 18% | Storage units for computers |
| SATA SSD | 8471.70 | 18% | Storage units for computers |
| Portable SSD | 8471.70 | 18% | External storage |
| USB Flash Drive | 8523.51 | 18% | Semiconductor media |

#### 3.2.3 Intra-State vs. Inter-State Calculation

GST is split depending on whether the transaction is intra-state (same state for supplier and buyer) or inter-state:

**Intra-State Transaction (Supplier state = Buyer state):**
```
Total GST = 18%
├── CGST = 9% (Central Goods and Services Tax)
└── SGST = 9% (State Goods and Services Tax)
```

**Inter-State Transaction (Supplier state ≠ Buyer state):**
```
Total GST = 18%
├── CGST = 9% (Central Goods and Services Tax)
└── IGST = 9% (Integrated Goods and Services Tax)
```

**Note:** For the TwinMOS website, if the warehouse is in New Delhi (UT/State: Delhi), intra-state sales are to Delhi customers; all other state deliveries are inter-state. Stripe Tax handles this split automatically when configured correctly.

#### 3.2.4 E-Invoice Requirement (B2B)

For B2B transactions above INR 5,00,000 (5 lakh), TwinMOS India Pvt Ltd must generate an **e-invoice** through the GST e-Invoice portal (IRP — Invoice Registration Portal). This generates an IRN (Invoice Reference Number) and QR code that must appear on the invoice.

| Transaction Type | Amount Threshold | E-Invoice Required |
|---|---|---|
| B2B | > INR 5,00,000 | Yes (IRP integration required) |
| B2B | ≤ INR 5,00,000 | No (standard GST invoice) |
| B2C | Any amount | No (simplified invoice) |

**Phase 3 Implementation Note:** Full IRP e-invoice integration is deferred to Phase 3.1. In Phase 3.0, B2B orders above INR 5,00,000 will be flagged for manual e-invoice generation by TwinMOS India Finance team.

### 3.3 Kingdom of Saudi Arabia — VAT (ZATCA)

#### 3.3.1 Regulatory Framework

| Parameter | Value |
|---|---|
| Tax Authority | Zakat, Tax and Customs Authority (ZATCA) |
| Tax Type | Value Added Tax (VAT) |
| Standard Rate | 15% |
| TwinMOS VAT Registration | Must be completed prior to KSA sales launch |
| Filing Frequency | Quarterly |
| Currency | SAR |
| E-Invoice Mandate | Phase 2 (Fatoorah) — applies to KSA VAT-registered entities |

#### 3.3.2 ZATCA E-Invoice (Fatoorah) Compliance

Saudi Arabia mandates e-invoicing (Fatoorah) in two phases:
- **Phase 1** (Generation): Tax invoices must be generated electronically — applicable
- **Phase 2** (Integration): Invoices integrated with ZATCA platform — required for TwinMOS

All KSA invoices must include:
- QR code (TLV-encoded per ZATCA specs)
- Seller name and VAT registration number
- Invoice date and time
- Total amount including VAT
- VAT amount

#### 3.3.3 Product Tax Classification

All TwinMOS products are subject to standard rate 15% VAT in KSA. No exemptions or zero rates apply to electronic memory and storage hardware.

#### 3.3.4 Pre-Launch Requirement

**Critical:** TwinMOS must complete ZATCA VAT registration before the KSA market goes live. This is a legal prerequisite and not a platform feature. Finance team to confirm registration status.

### 3.4 Bangladesh — VAT

#### 3.4.1 Regulatory Framework

| Parameter | Value |
|---|---|
| Tax Authority | National Board of Revenue (NBR) |
| Tax Type | Value Added Tax |
| Standard Rate | 15% |
| Registration | TwinMOS BD distributor handles VAT registration |
| Currency | BDT |
| Responsibility | Distributor manages VAT compliance |

#### 3.4.2 Platform Approach for Bangladesh

Since TwinMOS's Bangladesh market operates through a distributor, TwinMOS is not directly liable for Bangladesh VAT collection. However:

- The website **displays VAT-inclusive prices** in BDT for all Bangladesh customers
- The platform records the 15% VAT component for transparency
- The distributor receives order data and manages actual VAT remittance
- The TwinMOS website does not file Bangladesh VAT returns directly

#### 3.4.3 Price Display for Bangladesh

Prices shown to Bangladesh customers already include 15% VAT. During checkout, a breakdown may optionally be shown:

```
Product Price (incl. 15% VAT): BDT 8,050
└── Base Price: BDT 7,000
└── VAT (15%): BDT 1,050
```

### 3.5 International Orders

#### 3.5.1 Tax Policy

TwinMOS does not collect or remit taxes for orders shipped to countries outside UAE, India, Bangladesh, and KSA. International orders:

- Are shipped from UAE warehouse
- Are zero-rated for UAE VAT (export)
- Display prices exclusive of any tax
- Include a clear disclaimer that import duties/taxes are the buyer's responsibility

#### 3.5.2 International Tax Disclaimer

The following disclaimer must be displayed prominently on the international checkout page and order confirmation:

> "TwinMOS does not collect import duties, customs fees, or local taxes for deliveries outside the UAE, India, Bangladesh, and KSA. Any import duties or local taxes applicable at the destination country are the sole responsibility of the recipient. Please consult your local customs authority for applicable rates."

---

## 4. Tax Display Rules

### 4.1 Display Rules by Region

| Market | Display Method | Price Format | Checkout Behavior |
|---|---|---|---|
| UAE | Tax-exclusive | "AED 245.00 excl. VAT" | VAT (5%) shown separately at checkout |
| India | Tax-inclusive | "₹3,499 incl. GST" | GST breakdown shown at checkout |
| KSA | Tax-inclusive | "SAR 189 incl. VAT" | VAT shown as line item |
| Bangladesh | Tax-inclusive | "BDT 8,050 incl. VAT" | VAT breakdown optional |
| International | Tax-exclusive | "USD 65.00" | No tax line |

### 4.2 UAE Tax Display Implementation

On product pages in UAE locale:

```html
<!-- UAE Product Price Display -->
<div class="price-display">
  <span class="price-amount">AED 245.00</span>
  <span class="price-tax-note">excl. VAT</span>
</div>

<!-- UAE Cart/Checkout Display -->
<div class="cart-summary">
  <div class="line-item">Subtotal: AED 245.00</div>
  <div class="tax-line">VAT (5%): AED 12.25</div>
  <div class="total-line">Total: AED 257.25</div>
</div>
```

### 4.3 India Tax Display Implementation

On product pages in India locale, prices include GST:

```html
<!-- India Product Price Display -->
<div class="price-display">
  <span class="price-amount">₹3,499</span>
  <span class="price-tax-note">incl. GST</span>
</div>

<!-- India Checkout Display (expanded breakdown) -->
<div class="cart-summary">
  <div class="line-item">Subtotal (excl. GST): ₹2,965</div>
  <div class="tax-line">CGST (9%): ₹267</div>
  <div class="tax-line">SGST (9%): ₹267</div>
  <!-- OR for inter-state: -->
  <div class="tax-line">CGST (9%): ₹267</div>
  <div class="tax-line">IGST (9%): ₹267</div>
  <div class="total-line">Total: ₹3,499</div>
</div>
```

### 4.4 KSA Tax Display Implementation

```html
<!-- KSA Product Price Display -->
<div class="price-display">
  <span class="price-amount">SAR 189</span>
  <span class="price-tax-note">incl. VAT</span>
</div>

<!-- KSA Checkout Display -->
<div class="cart-summary">
  <div class="line-item">Subtotal (excl. VAT): SAR 164.35</div>
  <div class="tax-line">VAT (15%): SAR 24.65</div>
  <div class="total-line">Total: SAR 189.00</div>
</div>
```

### 4.5 Dynamic Tax Label Logic

```typescript
// Tax label utility function
export function getTaxLabel(region: string): {
  productPageSuffix: string;
  checkoutLabel: string;
  taxRateName: string;
} {
  const labels = {
    UAE: {
      productPageSuffix: 'excl. VAT',
      checkoutLabel: 'VAT (5%)',
      taxRateName: 'UAE VAT'
    },
    IN: {
      productPageSuffix: 'incl. GST',
      checkoutLabel: 'GST (18%)',
      taxRateName: 'GST'
    },
    KSA: {
      productPageSuffix: 'incl. VAT',
      checkoutLabel: 'VAT (15%)',
      taxRateName: 'KSA VAT'
    },
    BD: {
      productPageSuffix: 'incl. VAT',
      checkoutLabel: 'VAT (15%)',
      taxRateName: 'Bangladesh VAT'
    },
    INTL: {
      productPageSuffix: '',
      checkoutLabel: '',
      taxRateName: ''
    }
  };
  return labels[region] ?? labels.INTL;
}
```

---

## 5. Stripe Tax Configuration

### 5.1 Stripe Tax Account Setup

#### 5.1.1 Enabling Stripe Tax

Stripe Tax must be enabled in the TwinMOS Stripe Dashboard under **Tax > Overview > Start collecting tax**.

Required configurations per market:

| Market | Stripe Tax Registration Type | Registration Number |
|---|---|---|
| UAE | VAT | TwinMOS TRN (from Finance) |
| India | GST | TwinMOS India GSTIN (from Finance) |
| KSA | VAT | ZATCA registration number |
| Bangladesh | Not registered (distributor handles) | N/A |

#### 5.1.2 Tax Registrations in Stripe

```bash
# Stripe CLI — Create UAE VAT registration
stripe tax registrations create \
  --country=AE \
  --type=standard \
  --active-from=now

# Stripe CLI — Create India GST registration
stripe tax registrations create \
  --country=IN \
  --type=standard \
  --active-from=now

# Stripe CLI — Create KSA VAT registration
stripe tax registrations create \
  --country=SA \
  --type=standard \
  --active-from=now
```

### 5.2 Product Tax Codes

Stripe Tax uses product tax codes (TCCs) to determine the applicable rate for a product in each jurisdiction.

| Product Category | Stripe Tax Code | Description |
|---|---|---|
| RAM Modules (DDR4/DDR5) | `txcd_34020000` | Electronic components — general |
| NVMe SSD | `txcd_34020000` | Electronic components — general |
| SATA SSD | `txcd_34020000` | Electronic components — general |
| Portable SSD | `txcd_34020000` | Electronic components — general |
| USB Flash Drive | `txcd_34020000` | Electronic components — general |
| Shipping (when taxable) | `txcd_92010001` | Shipping — standard |

**Note:** The code `txcd_34020000` maps to "Electronic Components — General" in Stripe Tax's taxonomy. TwinMOS Finance team should verify with Stripe Tax support that this is the most appropriate code for memory/storage hardware in UAE, India, and KSA. Alternative: `txcd_34010000` (Computer Hardware — General) may be more appropriate for SSDs.

#### 5.2.1 Setting Tax Code on Stripe Product

```typescript
// When creating/updating a product in Stripe
const product = await stripe.products.create({
  name: 'VOLTX DDR5 16GB',
  metadata: {
    medusa_product_id: 'prod_xxxxx',
    tax_code: 'txcd_34020000'
  },
  tax_code: 'txcd_34020000' // Stripe Tax product tax code
});
```

### 5.3 Tax Behavior Configuration

Stripe Tax supports two tax behaviors:

- **`exclusive`** — Tax is added on top of the stated price (price + tax = total)
- **`inclusive`** — Tax is already included in the stated price (price includes tax)

| Market | Stripe Tax Behavior | Rationale |
|---|---|---|
| UAE | `exclusive` | UAE consumer norm: show price + VAT |
| India | `inclusive` | GST-inclusive pricing is standard in India |
| KSA | `inclusive` | Saudi consumer regulations require inclusive display |
| Bangladesh | `inclusive` | VAT-inclusive pricing |
| International | `exclusive` | No tax applies; exclusive is neutral |

#### 5.3.1 Setting Tax Behavior per Price

```typescript
// Stripe Price object with tax behavior
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 24500, // AED 245.00 in fils
  currency: 'aed',
  tax_behavior: 'exclusive', // UAE — exclusive
});

// India price — inclusive
const priceIndia = await stripe.prices.create({
  product: product.id,
  unit_amount: 349900, // INR 3499.00 in paise
  currency: 'inr',
  tax_behavior: 'inclusive', // India — inclusive
});
```

### 5.4 Stripe Checkout Tax Integration

When using Stripe Checkout (the primary checkout flow via Medusa.js → Stripe), tax calculation is automatic when:

1. Stripe Tax is enabled on the account
2. The product has a valid `tax_code`
3. The customer's address is collected before finalizing the session

```typescript
// Creating Stripe Checkout session with tax
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: cartItems.map(item => ({
    price_data: {
      currency: regionCurrency,
      product_data: {
        name: item.name,
        tax_code: 'txcd_34020000',
      },
      unit_amount: item.unitAmount,
      tax_behavior: getRegionTaxBehavior(region),
    },
    quantity: item.quantity,
  })),
  automatic_tax: {
    enabled: true, // Enables Stripe Tax automatic calculation
  },
  customer_update: {
    address: 'auto', // Allow address collection for tax calculation
  },
  shipping_address_collection: {
    allowed_countries: ['AE', 'IN', 'BD', 'SA', /* international countries */],
  },
  success_url: `${process.env.STOREFRONT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.STOREFRONT_URL}/checkout/cancel`,
});
```

### 5.5 Tax Calculation API (Non-Checkout)

For cart-level tax preview (before redirecting to Stripe Checkout):

```typescript
// Tax calculation preview using Stripe Tax Calculations API
const taxCalculation = await stripe.tax.calculations.create({
  currency: 'aed',
  customer_details: {
    address: {
      line1: customerAddress.line1,
      city: customerAddress.city,
      country: 'AE',
      postal_code: customerAddress.postalCode,
    },
    address_source: 'shipping',
  },
  line_items: cartItems.map(item => ({
    amount: item.subtotal,
    reference: item.variantId,
    tax_code: 'txcd_34020000',
    tax_behavior: 'exclusive',
  })),
  shipping_cost: {
    amount: shippingCost,
    tax_behavior: 'exclusive',
    tax_code: 'txcd_92010001',
  },
  expand: ['line_items.data.tax_breakdown'],
});

// taxCalculation.tax_amount_exclusive — total tax to add
// taxCalculation.line_items.data[].tax_amount — per-line tax
```

---

## 6. TaxJar Configuration (Fallback)

### 6.1 TaxJar Account Setup

TaxJar is configured as the secondary tax provider. The Medusa.js tax module supports pluggable providers, allowing TaxJar to be activated when Stripe Tax is unavailable.

#### 6.1.1 TaxJar API Configuration

```typescript
// Environment variables for TaxJar
// .env (server-side only)
TAXJAR_API_KEY=your_taxjar_api_key
TAXJAR_SANDBOX=false // true for development/staging
TAXJAR_FROM_COUNTRY=AE
TAXJAR_FROM_STATE='' // UAE has no states
TAXJAR_FROM_ZIP='' // DAFZA postal code
TAXJAR_FROM_CITY=Dubai
```

#### 6.1.2 TaxJar Tax Rate Request

```typescript
import Taxjar from 'taxjar';

const taxjarClient = new Taxjar({
  apiKey: process.env.TAXJAR_API_KEY
});

// Calculate tax for UAE order
const taxResponse = await taxjarClient.taxForOrder({
  from_country: 'AE',
  from_city: 'Dubai',
  to_country: 'AE',
  to_city: customerCity,
  amount: orderSubtotal,
  shipping: shippingAmount,
  line_items: cartItems.map(item => ({
    id: item.variantId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    product_tax_code: '81100000', // TaxJar product code for electronics
  }))
});

// taxResponse.tax.amount_to_collect — total tax
// taxResponse.tax.rate — effective rate
```

### 6.2 TaxJar Nexus Configuration

TaxJar requires nexus (tax presence) configuration for each jurisdiction where TwinMOS is registered:

```typescript
// TaxJar nexus addresses
const nexusAddresses = [
  {
    id: 'twinmos-uae',
    country: 'AE',
    city: 'Dubai',
    zip: '', // DAFZA zip
    street: 'Dubai Airport Free Zone',
  },
  {
    id: 'twinmos-india',
    country: 'IN',
    state: 'DL', // Delhi state code
    city: 'New Delhi',
    zip: '110001',
    street: 'TwinMOS India Office Address',
  },
  {
    id: 'twinmos-ksa',
    country: 'SA',
    city: 'Riyadh',
  }
];
```

---

## 7. Tax Calculation Flow

### 7.1 End-to-End Tax Calculation Flow

```
Customer adds item to cart
         │
         ▼
Customer enters shipping address at checkout
         │
         ▼
Medusa.js detects region from shipping address
         │
         ▼
Medusa.js Tax Module calls getTaxLines()
         │
         ▼
Tax Provider (Stripe Tax) called with:
  - Cart line items (amount, tax_code)
  - Shipping address (country, state/emirate)
  - Tax behavior (inclusive/exclusive per region)
         │
         ▼
Stripe Tax returns:
  - tax_amount per line item
  - total_tax_amount
  - tax_rate applied
  - tax_breakdown (e.g., CGST/SGST for India)
         │
         ▼
Medusa.js applies tax lines to cart object
         │
         ▼
Frontend displays tax breakdown to customer
         │
         ▼
Customer confirms order → Stripe Checkout session
         │
         ▼
Payment captured → Order created in Medusa
         │
         ▼
Tax transaction recorded in Stripe Tax
         │
         ▼
Invoice generated with tax details (Resend + PDF)
         │
         ▼
Monthly tax report exported for Finance team
```

### 7.2 Tax Calculation Timing

| Event | Tax Action |
|---|---|
| Product page load | Display price with region-appropriate tax label (no calculation yet) |
| Cart created | No tax calculation (address unknown) |
| Shipping address entered at checkout | Trigger tax calculation preview |
| Address changed | Re-trigger tax calculation |
| Coupon/discount applied | Re-trigger tax calculation (tax on discounted amount) |
| Stripe Checkout session created | Final tax locked in by Stripe |
| Payment captured | Tax transaction finalized |
| Order canceled (before capture) | Tax transaction voided |
| Refund issued | Tax refund processed proportionally |

### 7.3 Tax on Discounts

When a discount/coupon is applied, tax is calculated on the **post-discount amount**:

```
Order subtotal: AED 500.00
Discount (10%): -AED 50.00
Taxable amount: AED 450.00
VAT (5%): AED 22.50
Total: AED 472.50
```

Stripe Tax handles this automatically when the discount is applied to the Stripe Checkout session.

### 7.4 Tax on Shipping

| Market | Shipping Tax |
|---|---|
| UAE | 5% VAT applies to shipping charges (if separately itemized) |
| India | 18% GST applies to shipping charges |
| KSA | 15% VAT applies to shipping charges |
| Bangladesh | 15% VAT applies (handled by distributor) |
| International | No shipping tax |

---

## 8. Invoice Requirements by Region

### 8.1 UAE VAT Invoice Requirements

Per FTA requirements, all UAE VAT invoices must include:

| Field | Required | Notes |
|---|---|---|
| Invoice title | Yes | "Tax Invoice" (in English and Arabic) |
| Supplier name | Yes | TwinMOS Technologies |
| Supplier TRN | Yes | TwinMOS UAE Tax Registration Number |
| Invoice date | Yes | Date of supply |
| Invoice number | Yes | Sequential, unique |
| Description of goods | Yes | Product name, quantity, specifications |
| Unit price (excl. VAT) | Yes | Price before VAT |
| Discount amount | If applicable | |
| Amount (excl. VAT) | Yes | Total before VAT |
| VAT rate | Yes | 5% |
| VAT amount | Yes | In AED |
| Total amount (incl. VAT) | Yes | Final amount |
| Buyer name | If B2B | For B2B invoices |
| Buyer TRN | If provided | Buyer's Tax Registration Number |
| Currency | Yes | AED |

**Invoice Format Example (UAE B2C):**

```
TAX INVOICE / فاتورة ضريبية
TwinMOS Technologies
DAFZA, Dubai, UAE
TRN: [TwinMOS TRN]

Invoice No: TM-INV-2026-00001234
Date: 01 May 2026

Bill To:
Customer Name: John Smith
Address: Dubai, UAE

─────────────────────────────────────────────
Item                  Qty  Unit Price   Amount
─────────────────────────────────────────────
VOLTX DDR5 16GB        1   AED 245.00  AED 245.00
CoreX Pro Gen5 NVMe    1   AED 350.00  AED 350.00
─────────────────────────────────────────────
Subtotal (excl. VAT)               AED 595.00
VAT @ 5%                           AED  29.75
─────────────────────────────────────────────
TOTAL                              AED 624.75
─────────────────────────────────────────────
Payment Method: Visa **** 4242
Order ID: TM-2026-00001234
```

### 8.2 India GST Tax Invoice Requirements

| Field | Required | Notes |
|---|---|---|
| "Tax Invoice" title | Yes | |
| Supplier name | Yes | TwinMOS India Pvt Ltd |
| Supplier GSTIN | Yes | TwinMOS India GSTIN |
| Supplier address | Yes | |
| Invoice number | Yes | Sequential per financial year |
| Invoice date | Yes | |
| Buyer name | Yes | |
| Buyer address | Yes | |
| Buyer GSTIN | If B2B | |
| HSN code | Yes | 8473.30 or 8471.70 |
| Description | Yes | |
| Quantity and unit | Yes | |
| Taxable value | Yes | Amount before GST |
| CGST rate and amount | Yes | 9% |
| SGST/IGST rate and amount | Yes | 9% (state or integrated) |
| Total amount | Yes | Including GST |
| Place of supply | Yes | State code + state name |
| Whether tax payable on reverse charge | Yes | "No" for standard sales |

### 8.3 KSA ZATCA-Compliant Invoice Requirements

| Field | Required | Notes |
|---|---|---|
| Invoice type | Yes | "Tax Invoice" |
| Seller name | Yes | TwinMOS (KSA registered entity) |
| Seller VAT number | Yes | ZATCA registration number |
| Invoice date and time | Yes | Date and time of supply |
| Invoice number | Yes | Sequential |
| Buyer name | Yes | |
| Buyer VAT number | If B2B | |
| Description | Yes | |
| Unit price (excl. VAT) | Yes | |
| Discount | If applicable | |
| Taxable amount | Yes | |
| VAT rate (15%) | Yes | |
| VAT amount | Yes | In SAR |
| Total (incl. VAT) | Yes | |
| QR code | Yes | TLV-encoded per ZATCA Phase 1/2 |

**KSA QR Code (TLV Encoding):**

The QR code must contain (TLV format):
- Tag 1: Seller name
- Tag 2: Seller VAT registration number
- Tag 3: Invoice timestamp
- Tag 4: Invoice total (incl. VAT)
- Tag 5: VAT amount

---

## 9. Invoice Generation and Delivery

### 9.1 Invoice Generation Architecture

```
Order confirmed (payment captured)
         │
         ▼
Medusa.js order.placed webhook
         │
         ▼
Invoice Service triggered
  - Retrieve order details from Medusa
  - Determine region for invoice template
  - Fetch tax line details from Stripe Tax
         │
         ▼
PDF Invoice generation
  - React Email / custom PDF renderer
  - Region-specific template (UAE/India/KSA/BD/INTL)
  - Include all regulatory required fields
         │
         ▼
Upload PDF to Backblaze B2
  - Bucket: twinmos-invoices
  - Path: /{year}/{month}/{order_id}/invoice_{invoice_number}.pdf
  - Retention: 7 years (auto-lifecycle rule)
         │
         ▼
Resend email sent to customer
  - Subject: "Your TwinMOS Invoice — Order {order_id}"
  - Invoice PDF as attachment
  - Link to download from B2 (signed URL, 30-day expiry)
         │
         ▼
Invoice record saved to Strapi
  - Collection: Invoices
  - Fields: order_id, invoice_number, region, pdf_url, generated_at
```

### 9.2 Invoice Numbering

Format: `TM-INV-{REGION}-{YEAR}-{SEQUENCE}`

Examples:
- UAE: `TM-INV-UAE-2026-00001234`
- India: `TM-INV-IN-2026-00001234`
- KSA: `TM-INV-KSA-2026-00001234`
- Bangladesh: `TM-INV-BD-2026-00001234`
- International: `TM-INV-INTL-2026-00001234`

Sequence numbers reset at the start of each financial year per regional requirements.

### 9.3 Invoice Retention Policy

| Market | Retention Period | Regulatory Basis |
|---|---|---|
| UAE | 7 years | FTA VAT Law |
| India | 8 years | GST Act |
| KSA | 10 years | ZATCA requirement |
| Bangladesh | 7 years | NBR requirement |
| International | 7 years | TwinMOS policy |

**Implementation:** Backblaze B2 lifecycle policy set to retain for 10 years (maximum requirement). Internal access via Strapi admin for Finance team.

### 9.4 Invoice Email Template

```typescript
// React Email invoice template (simplified)
import { Html, Head, Body, Container, Section, Text, Row, Column } from '@react-email/components';

interface InvoiceEmailProps {
  orderDetails: OrderDetails;
  invoicePdfUrl: string;
  region: string;
}

export const InvoiceEmail = ({ orderDetails, invoicePdfUrl, region }: InvoiceEmailProps) => {
  const taxLabel = getTaxLabel(region);

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Section>
            <Text>Dear {orderDetails.customerName},</Text>
            <Text>
              Please find your tax invoice attached for Order #{orderDetails.orderId}.
            </Text>
            <Text>
              You can also download your invoice here:{' '}
              <a href={invoicePdfUrl}>Download Invoice</a>
            </Text>
          </Section>
          {/* Order summary table */}
          {/* Tax breakdown */}
          {/* Footer with regulatory information */}
        </Container>
      </Body>
    </Html>
  );
};
```

---

## 10. Tax Exemptions

### 10.1 B2B Tax Exemption Policy

TwinMOS Phase 3 does **not** implement automated B2B tax exemptions in the checkout flow. Business reasoning:

- UAE: B2B customers still pay 5% VAT and reclaim it via their own FTA returns
- India: B2B customers pay GST and claim input credit — no exemption at source
- KSA: Same as UAE

**For B2B customers who request tax-free invoicing** (e.g., diplomatic missions, international organizations), this must be handled via a separate B2B portal or manual process by the TwinMOS Sales team. This is out of scope for Phase 3.

### 10.2 Export Zero-Rating

Goods exported outside the UAE are zero-rated for UAE VAT:

| Scenario | Tax Treatment |
|---|---|
| UAE customer, UAE delivery | 5% VAT |
| UAE warehouse, international delivery | 0% VAT (export) |
| UAE warehouse, GCC delivery (non-KSA) | 0% VAT (export outside UAE) — confirm with tax advisor |

**Platform Logic:**

```typescript
function getUaeTaxRate(deliveryCountry: string): number {
  const uaeVatCountries = ['AE']; // Only UAE domestic = 5%
  // GCC zero-rating to be confirmed with tax advisor
  return uaeVatCountries.includes(deliveryCountry) ? 0.05 : 0;
}
```

### 10.3 Coupon and Promotional Pricing

Tax is always calculated on the final taxable amount after discounts. Discount coupons do not affect the tax rate, only the taxable base amount.

---

## 11. Tax Reporting

### 11.1 Monthly Stripe Tax Report

The TwinMOS Finance team receives monthly tax reports generated from Stripe Tax:

**Report Contents:**
- Total tax collected by jurisdiction
- Transaction-level detail (order ID, customer, amount, tax)
- Tax rates applied
- Refunds and adjustments

**Export Process:**
1. Stripe Dashboard → Tax → Reports → Select month → Export CSV
2. Report delivered to Finance team email via automated Stripe notification
3. Report archived to Backblaze B2: `twinmos-tax-reports/{year}/{month}/stripe_tax_report.csv`

### 11.2 Regional Tax Filing Support Data

The platform generates supporting data for each regional tax filing:

| Market | Filing | Data Export |
|---|---|---|
| UAE | Quarterly VAT return (FTA portal) | Stripe Tax report filtered by AE |
| India | Monthly GSTR-1 and GSTR-3B | Stripe Tax report filtered by IN with HSN data |
| KSA | Quarterly VAT return (ZATCA) | Stripe Tax report filtered by SA |
| Bangladesh | Handled by distributor | Order data exported to distributor monthly |

### 11.3 Automated Tax Report Email

```typescript
// Monthly tax report job — runs on 1st of each month
// Cron: 0 6 1 * *
export async function sendMonthlyTaxReport() {
  const previousMonth = getPreviousMonth();
  
  // Fetch Stripe Tax report
  const report = await stripe.reporting.reportRuns.create({
    report_type: 'tax.transactions.summarized.1',
    parameters: {
      interval_start: previousMonth.start,
      interval_end: previousMonth.end,
    }
  });

  // Wait for report to be ready, then send via Resend
  await resend.emails.send({
    from: 'no-reply@twinmos.com',
    to: ['finance@twinmos.com'],
    subject: `TwinMOS Tax Report — ${previousMonth.label}`,
    html: taxReportEmailHtml,
    attachments: [{ filename: `tax_report_${previousMonth.label}.csv`, content: reportCsv }]
  });
}
```

---

## 12. Medusa.js Tax Module Configuration

### 12.1 Tax Module Setup

```typescript
// medusa-config.ts
import { defineConfig } from '@medusajs/framework/utils';

export default defineConfig({
  modules: [
    {
      resolve: '@medusajs/medusa/tax',
      options: {
        providers: [
          {
            resolve: './src/modules/tax/stripe-tax-provider',
            id: 'stripe-tax',
            options: {
              stripeApiKey: process.env.STRIPE_SECRET_KEY,
              stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            }
          },
          {
            resolve: './src/modules/tax/taxjar-provider',
            id: 'taxjar',
            options: {
              apiKey: process.env.TAXJAR_API_KEY,
              fromCountry: 'AE',
              fromCity: 'Dubai',
            }
          }
        ]
      }
    }
  ]
});
```

### 12.2 Custom Stripe Tax Provider

```typescript
// src/modules/tax/stripe-tax-provider.ts
import { AbstractTaxProvider, TaxCalculationContext, TaxableAmountInput, ProviderTaxLine } from '@medusajs/framework/types';
import Stripe from 'stripe';

export class StripeTaxProvider extends AbstractTaxProvider {
  static identifier = 'stripe-tax';

  private stripe: Stripe;

  constructor(_, options: { stripeApiKey: string }) {
    super(...arguments);
    this.stripe = new Stripe(options.stripeApiKey, { apiVersion: '2024-12-18' });
  }

  async getTaxLines(
    itemLines: TaxableAmountInput[],
    shippingLines: TaxableAmountInput[],
    context: TaxCalculationContext
  ): Promise<ProviderTaxLine[]> {
    const { address, region } = context;

    // Map Medusa region to tax behavior
    const taxBehavior = this.getTaxBehavior(region.currency_code);

    const calculation = await this.stripe.tax.calculations.create({
      currency: region.currency_code,
      customer_details: {
        address: {
          line1: address.address_1,
          city: address.city,
          country: address.country_code.toUpperCase(),
          postal_code: address.postal_code,
          state: address.province,
        },
        address_source: 'shipping',
      },
      line_items: itemLines.map(item => ({
        amount: Math.round(item.unit_price * item.quantity * 100),
        reference: item.line_item.variant_id,
        tax_code: 'txcd_34020000',
        tax_behavior: taxBehavior,
      })),
      ...(shippingLines.length > 0 && {
        shipping_cost: {
          amount: Math.round(shippingLines[0].unit_price * 100),
          tax_behavior: taxBehavior,
          tax_code: 'txcd_92010001',
        }
      }),
    });

    return calculation.line_items.data.map(lineItem => ({
      rate: lineItem.tax_amount / lineItem.amount,
      name: this.getTaxName(address.country_code),
      code: `stripe-tax-${address.country_code.toLowerCase()}`,
      provider_id: 'stripe-tax',
    }));
  }

  private getTaxBehavior(currencyCode: string): 'exclusive' | 'inclusive' {
    const inclusiveCurrencies = ['inr', 'sar', 'bdt'];
    return inclusiveCurrencies.includes(currencyCode.toLowerCase()) ? 'inclusive' : 'exclusive';
  }

  private getTaxName(countryCode: string): string {
    const names: Record<string, string> = {
      AE: 'UAE VAT (5%)',
      IN: 'GST (18%)',
      SA: 'KSA VAT (15%)',
      BD: 'Bangladesh VAT (15%)',
    };
    return names[countryCode.toUpperCase()] ?? 'Tax';
  }
}
```

### 12.3 Tax Region Configuration in Medusa Admin

Tax regions must be configured in the Medusa admin panel:

| Region | Country | Tax Provider | Default Rate | Tax Inclusive |
|---|---|---|---|---|
| UAE | AE | stripe-tax | 5% | false |
| India | IN | stripe-tax | 18% | true |
| KSA | SA | stripe-tax | 15% | true |
| Bangladesh | BD | taxjar | 15% | true |
| International | (all others) | stripe-tax | 0% | false |

```typescript
// Medusa admin API — create tax rate for UAE region
await medusaAdminClient.taxes.createRegionTaxRate(uaeRegionId, {
  name: 'UAE VAT',
  code: 'UAE-VAT-5',
  rate: 5,
  is_default: true,
  products: [], // applies to all products in region
});
```

---

## 13. Edge Cases and Special Scenarios

### 13.1 Split Shipments

When an order contains items from multiple warehouses and ships in multiple shipments:

**Rule BR-TAX-010:** Tax is calculated on the full order at time of checkout. Individual shipment invoices reference the original order's tax calculation. No re-calculation per shipment.

**Implementation:**
```typescript
// Split shipment: use original order tax calculation
// Only generate partial invoice for shipped items
// Total tax allocated proportionally across shipments

function allocateTaxToShipment(
  orderTaxTotal: number,
  shipmentSubtotal: number,
  orderSubtotal: number
): number {
  return (shipmentSubtotal / orderSubtotal) * orderTaxTotal;
}
```

### 13.2 Returns and Refunds

When a customer returns an item:

1. TwinMOS initiates refund in Medusa admin
2. Medusa calls Stripe refund API
3. Stripe automatically creates a tax refund transaction (reversal)
4. Credit note/refund invoice generated and emailed to customer

**Tax Refund Calculation:**
- Full return: 100% of tax refunded
- Partial return: Tax refunded proportionally (items returned / items ordered)
- Restocking fee: Tax is NOT charged on restocking fees (pure service fee)

```typescript
// Process refund with tax
async function processRefundWithTax(
  orderId: string,
  refundAmount: number,
  reason: string
): Promise<void> {
  const order = await medusa.orders.retrieve(orderId);

  // Create Medusa refund — Stripe handles tax refund automatically
  await medusa.orders.createRefund(orderId, {
    amount: refundAmount,
    reason: reason,
    note: `Customer return — ${reason}`,
  });

  // Generate credit note
  await invoiceService.generateCreditNote({
    originalInvoiceId: order.metadata.invoice_id,
    refundAmount,
    taxAmount: calculateProportionalTax(refundAmount, order),
  });
}
```

### 13.3 Price Adjustments (Post-Order)

If a price adjustment is needed after order placement (e.g., price error correction):

- Issue a partial refund for the difference
- Generate a credit note reflecting the adjustment
- Original invoice remains unchanged
- Tax on adjustment is recalculated on refund amount

### 13.4 Currency Conversion and Tax

All tax calculations are performed in the transaction currency (AED, INR, SAR, BDT, USD). No currency conversion is applied to tax amounts. Stripe handles rounding in the transaction currency.

**Rounding Rule:** Tax amounts are rounded to the nearest minor currency unit (fils for AED, paise for INR). Stripe Tax handles rounding automatically.

### 13.5 Tax Rate Changes

When tax rates change (government updates):

1. Stripe Tax automatically updates rates (no code change needed for Stripe Tax)
2. TaxJar rates update automatically via their API
3. Product prices may need to be adjusted if using inclusive pricing
4. Finance team must be notified immediately of any rate changes
5. Existing orders retain the tax rate at time of purchase

---

## 14. Test Scenarios

### 14.1 UAE Tax Test Scenarios

| Test ID | Scenario | Input | Expected Output |
|---|---|---|---|
| TAX-UAE-001 | Standard B2C purchase | 1x DDR5 @ AED 245, Dubai delivery | Tax: AED 12.25 (5%), Total: AED 257.25 |
| TAX-UAE-002 | Multiple items | 2x DDR5 @ AED 245 each, Dubai delivery | Tax: AED 24.50 (5%), Total: AED 514.50 |
| TAX-UAE-003 | With shipping charge | Items: AED 245, Shipping: AED 20, Dubai delivery | Tax: AED 13.25 (5% on AED 265), Total: AED 278.25 |
| TAX-UAE-004 | With discount coupon | Items: AED 500, 10% discount, Dubai delivery | Tax: AED 22.50 (5% on AED 450), Total: AED 472.50 |
| TAX-UAE-005 | International delivery from UAE | AED 245, USA delivery | Tax: AED 0 (zero-rated export), Total: AED 245 |
| TAX-UAE-006 | B2B with TRN | AED 500, TRN provided | Tax: AED 25 (5%), TRN recorded on invoice |

### 14.2 India Tax Test Scenarios

| Test ID | Scenario | Input | Expected Output |
|---|---|---|---|
| TAX-IN-001 | Inter-state B2C | 1x SSD @ INR 3,499 (incl. GST), Mumbai delivery | Base: INR 2,965, CGST: INR 267, IGST: INR 267 |
| TAX-IN-002 | Intra-state B2C | 1x SSD @ INR 3,499, Delhi delivery | Base: INR 2,965, CGST: INR 267, SGST: INR 267 |
| TAX-IN-003 | Price display on product page | SSD product page, India locale | Show: ₹3,499 incl. GST |
| TAX-IN-004 | B2B above 5 lakh | B2B order INR 600,000 | Flag for e-invoice, alert Finance team |
| TAX-IN-005 | Partial return | Return 1 of 2 items | 50% GST refunded |

### 14.3 KSA Tax Test Scenarios

| Test ID | Scenario | Input | Expected Output |
|---|---|---|---|
| TAX-KSA-001 | Standard B2C | 1x RAM @ SAR 189 (incl. VAT), Riyadh delivery | Base: SAR 164.35, VAT: SAR 24.65 |
| TAX-KSA-002 | ZATCA QR code | Any KSA invoice | QR code present and TLV-encoded correctly |
| TAX-KSA-003 | Missing VAT registration | KSA order, TwinMOS not registered | Block order, show error |

### 14.4 Bangladesh Tax Test Scenarios

| Test ID | Scenario | Input | Expected Output |
|---|---|---|---|
| TAX-BD-001 | Standard purchase | 1x USB Drive @ BDT 1,200 (incl. VAT) | Base: BDT 1,043, VAT: BDT 157 |
| TAX-BD-002 | TaxJar fallback | Stripe Tax unavailable | TaxJar calculates correctly |

### 14.5 Stripe Tax Fallback Test Scenarios

| Test ID | Scenario | Input | Expected Output |
|---|---|---|---|
| TAX-FALLBACK-001 | Stripe Tax timeout | Stripe Tax API returns 503 | TaxJar invoked within 100ms |
| TAX-FALLBACK-002 | Both providers fail | Stripe + TaxJar both fail | Checkout blocked, user shown error |
| TAX-FALLBACK-003 | Stripe Tax recovers | Stripe Tax returns after fallback | Next request uses Stripe Tax |

---

## 15. Acceptance Criteria

### 15.1 Tax Calculation Accuracy

| ID | Criterion | Priority |
|---|---|---|
| AC-TAX-001 | UAE orders apply 5% VAT correctly on all TwinMOS product categories | Must Have |
| AC-TAX-002 | India orders apply 18% GST with correct CGST/SGST or CGST/IGST split | Must Have |
| AC-TAX-003 | KSA orders apply 15% VAT correctly | Must Have |
| AC-TAX-004 | Bangladesh orders display VAT-inclusive prices correctly | Must Have |
| AC-TAX-005 | International orders have 0% tax applied | Must Have |
| AC-TAX-006 | Tax-inclusive prices display correctly (India, KSA, BD) | Must Have |
| AC-TAX-007 | Tax-exclusive prices display correctly with correct labels (UAE, INTL) | Must Have |

### 15.2 Invoice Compliance

| ID | Criterion | Priority |
|---|---|---|
| AC-INV-001 | UAE invoices include all FTA-required fields including supplier TRN | Must Have |
| AC-INV-002 | India invoices include GSTIN, HSN code, and GST breakdown | Must Have |
| AC-INV-003 | KSA invoices include ZATCA-compliant QR code | Must Have |
| AC-INV-004 | All invoices are emailed to customer within 5 minutes of order confirmation | Must Have |
| AC-INV-005 | Invoices are stored in Backblaze B2 and accessible for 7+ years | Must Have |
| AC-INV-006 | Invoice download link works from customer order page | Must Have |

### 15.3 Reliability and Performance

| ID | Criterion | Priority |
|---|---|---|
| AC-PERF-001 | Tax calculation completes within 1 second at checkout | Must Have |
| AC-PERF-002 | TaxJar fallback activates within 100ms of Stripe Tax failure | Must Have |
| AC-PERF-003 | Tax provider failure does not silently result in 0% tax on taxable orders | Must Have |
| AC-PERF-004 | Tax rate changes in Stripe Tax are reflected within 24 hours without code deploy | Should Have |

### 15.4 Reporting

| ID | Criterion | Priority |
|---|---|---|
| AC-REP-001 | Monthly tax report delivered to Finance team by 2nd of each month | Must Have |
| AC-REP-002 | Report includes transaction-level tax data exportable to CSV | Must Have |
| AC-REP-003 | Tax data is queryable by region, date range, and product | Should Have |

---

## 16. Business Rules Reference

| Rule ID | Rule Description |
|---|---|
| BR-TAX-001 | Tax is calculated at checkout based on the shipping address, not the billing address |
| BR-TAX-002 | Tax rates are locked at the time of order placement; rate changes do not affect existing orders |
| BR-TAX-003 | Tax is calculated on the post-discount subtotal (after coupon/promotion application) |
| BR-TAX-004 | Stripe Tax is the primary provider; TaxJar is the fallback; checkout is blocked if both fail |
| BR-TAX-005 | UAE VAT (5%) applies to all TwinMOS product categories without exception |
| BR-TAX-006 | India GST (18%) is split as CGST 9% + SGST 9% (intra-state) or CGST 9% + IGST 9% (inter-state) |
| BR-TAX-007 | KSA market must not go live until ZATCA VAT registration is confirmed |
| BR-TAX-008 | Bangladesh VAT compliance is the responsibility of the local distributor |
| BR-TAX-009 | International orders do not have tax applied by TwinMOS; customer is responsible for import duties |
| BR-TAX-010 | Tax for split shipments is allocated proportionally from the original order tax calculation |
| BR-TAX-011 | Full returns receive 100% tax refund; partial returns receive proportional tax refund |
| BR-TAX-012 | B2B tax exemptions are not automated in Phase 3; handled manually by Sales team |
| BR-TAX-013 | All invoices must be retained for a minimum of 7 years (10 years for KSA) |
| BR-TAX-014 | Monthly tax reports must be delivered to Finance team by the 2nd of each month |
| BR-TAX-015 | Shipping charges are taxable in UAE (5%), India (18%), and KSA (15%) |

---

*Document End — TWN-P3-TAX-2026-001 v1.0*
*TwinMOS Technologies — Confidential*
