# Shipping Configuration Specification
## TwinMOS Technologies Corporate Website — Phase 3

| Field | Value |
|---|---|
| Document Reference | TWN-P3-SHIP-2026-001 |
| Version | 1.0 |
| Date | 2026-05-01 |
| Author | TwinMOS Web Platform Team |
| Status | Draft for Review |
| Phase | Phase 3 — Commerce and Advanced Features |
| Module | P.2 — E-Commerce Core Specifications |

---

## Table of Contents

1. [Overview and Purpose](#1-overview-and-purpose)
2. [Shipping Architecture](#2-shipping-architecture)
3. [Shipping Zones](#3-shipping-zones)
4. [Carrier Integrations](#4-carrier-integrations)
5. [Shipping Rate Calculation](#5-shipping-rate-calculation)
6. [Product Weights and Dimensions](#6-product-weights-and-dimensions)
7. [Packaging Rules](#7-packaging-rules)
8. [Estimated Delivery Times](#8-estimated-delivery-times)
9. [Order Tracking](#9-order-tracking)
10. [Shipping Restrictions and Compliance](#10-shipping-restrictions-and-compliance)
11. [Customs and International Shipping](#11-customs-and-international-shipping)
12. [In-Stock vs Pre-Order Handling](#12-in-stock-vs-pre-order-handling)
13. [Partial Shipment Handling](#13-partial-shipment-handling)
14. [Failed Delivery Handling](#14-failed-delivery-handling)
15. [Medusa.js Shipping Configuration](#15-medusajs-shipping-configuration)
16. [Admin Shipping Management](#16-admin-shipping-management)
17. [Performance Requirements](#17-performance-requirements)
18. [Test Scenarios](#18-test-scenarios)
19. [Acceptance Criteria](#19-acceptance-criteria)
20. [Business Rules Reference](#20-business-rules-reference)

---

## 1. Overview and Purpose

### 1.1 Document Scope

This specification defines the complete shipping configuration for the TwinMOS Technologies e-commerce platform across all Phase 3 markets. It covers carrier integrations, shipping zone definitions, rate calculation logic, packaging rules, tracking, customs compliance, and the Medusa.js v2 shipping module configuration.

### 1.2 Business Context

TwinMOS Technologies ships memory and storage hardware (RAM modules, SSDs, USB flash drives) from regional warehouses to customers in UAE, India, Bangladesh, KSA, and internationally. The shipping layer must:

- Support multiple regional carriers with appropriate SLAs per zone
- Provide accurate shipping rate calculation at checkout
- Offer free shipping incentives above defined order value thresholds
- Present realistic estimated delivery dates to customers
- Enable end-to-end order tracking via carrier tracking numbers

### 1.3 Shipping Phases

| Phase | Scope |
|---|---|
| Phase 3.0 (Launch) | Flat-rate shipping per zone, basic carrier integrations |
| Phase 3.1 (Post-launch) | Weight-based rates, real-time carrier rate APIs |
| Phase 3.2 (Future) | Dimensional weight pricing, multi-warehouse routing |

This specification covers both Phase 3.0 and Phase 3.1 requirements. Phase 3.1 features are marked as **[3.1]**.

### 1.4 Stakeholders

| Stakeholder | Role |
|---|---|
| TwinMOS Operations Team | Warehouse operations, carrier contracts |
| TwinMOS Customer Service | Handling shipping queries and exceptions |
| Platform Engineering | Medusa.js shipping module implementation |
| Aramex Account Manager | UAE and KSA carrier integration |
| FedEx Account Manager | India and international carrier integration |
| DHL Account Manager | International carrier integration |
| Delhivery / Blue Dart | India domestic carrier integrations |
| Pathao / eCourier / Paperfly | Bangladesh carrier integrations |

---

## 2. Shipping Architecture

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│               Customer Checkout (Astro 5 Frontend)           │
│         Shipping option selection at checkout step           │
└──────────────────────┬──────────────────────────────────────┘
                       │ Shipping options request
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Medusa.js v2 Shipping Module                    │
│         Fulfillment Provider Abstraction Layer               │
│                                                              │
│  ShippingOption → FulfillmentProvider → Carrier API          │
└──────┬─────────────┬────────────────────────────────────────┘
       │             │
       ▼             ▼
┌──────────┐  ┌──────────────────────────────────────────────┐
│ Flat Rate│  │         Carrier API Providers                 │
│ (Phase   │  │  Aramex │ FedEx │ DHL │ Delhivery │ Pathao   │
│  3.0)    │  │  (Phase 3.1 — real-time rate APIs)           │
└──────────┘  └──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│           Shipping Option Displayed at Checkout              │
│   Carrier name | Estimated delivery | Rate | Free threshold  │
└─────────────────────────────────────────────────────────────┘
       │ Order placed
       ▼
┌─────────────────────────────────────────────────────────────┐
│              Fulfillment Created in Medusa                   │
│         Tracking number assigned → Resend email              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Medusa.js v2 Shipping Concepts

| Concept | Description |
|---|---|
| **Shipping Option** | A shippable method available in a region (e.g., "Aramex Next Day UAE") |
| **Shipping Profile** | Groups products by shipping characteristics (e.g., standard, fragile) |
| **Fulfillment Provider** | Integration with a carrier or fulfillment service |
| **Fulfillment** | A created shipment from an order — linked to a shipping option |
| **Shipping Zone** | A geographic area served by defined shipping options |
| **Shipping Method** | The specific shipping option chosen by a customer at checkout |

### 2.3 Shipping Profile

All TwinMOS products share a single shipping profile in Phase 3:

```typescript
// Default shipping profile for all TwinMOS products
const shippingProfile = {
  name: 'TwinMOS Standard Hardware',
  type: 'default',
  // All products assigned to this profile
  // Phase 3.2: may add 'fragile' profile for large SSDs
};
```

---

## 3. Shipping Zones

### 3.1 Zone Overview

| Zone ID | Zone Name | Countries | Phase 3.0 Status |
|---|---|---|---|
| ZONE-1 | UAE | United Arab Emirates (AE) | Active |
| ZONE-2 | India | India (IN) | Active |
| ZONE-3 | Bangladesh | Bangladesh (BD) | Active |
| ZONE-4 | KSA | Kingdom of Saudi Arabia (SA) | Active |
| ZONE-5 | International | All other countries | Active |

### 3.2 Zone 1 — UAE

| Parameter | Value |
|---|---|
| Countries | UAE (AE) |
| Currency | AED |
| Warehousing | DAFZA, Dubai |
| Primary Carrier | Aramex |
| Secondary Carrier | FedEx |

**Carrier Options:**

| Carrier | Service | Delivery Time | Coverage |
|---|---|---|---|
| Aramex | UAE Same Day | Same day (order before 12:00 PM) | Dubai, Abu Dhabi, Sharjah |
| Aramex | UAE Next Day | Next business day | All UAE emirates |
| FedEx | FedEx Economy UAE | 2–3 business days | All UAE cities |

**Zone 1 Shipping Rules:**
- Same-day delivery available only for orders placed before 12:00 PM UAE time
- Same-day delivery only in Dubai, Abu Dhabi, Sharjah metropolitan areas
- Remote areas (e.g., Fujairah mountains, border regions) default to 2–3 day service
- Aramex has the strongest coverage in UAE and should be the default recommendation

### 3.3 Zone 2 — India

| Parameter | Value |
|---|---|
| Countries | India (IN) |
| Currency | INR |
| Warehousing | New Delhi (primary); potential Mumbai/Bengaluru as Phase 3.2 |
| Primary Carrier | FedEx |
| Secondary Carriers | Delhivery (metro), Blue Dart (premium) |

**Carrier Options:**

| Carrier | Service | Delivery Time | Coverage |
|---|---|---|---|
| FedEx | FedEx Economy India | 3–5 business days | Pan-India (800+ cities) |
| Delhivery | Delhivery Standard | 3–7 business days | Metro cities and tier-1 cities |
| Blue Dart | Blue Dart Premium | 2–3 business days | 35,000+ pin codes (major cities) |

**Indian City Tier Classification:**

| Tier | Cities | Default Carrier | Estimated Transit |
|---|---|---|---|
| Tier 1 (Metro) | Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata | FedEx / Blue Dart | 2–3 days |
| Tier 2 (Major) | Pune, Ahmedabad, Jaipur, Surat, Lucknow | FedEx / Delhivery | 3–5 days |
| Tier 3 (Other) | All other cities and towns | FedEx | 5–7 days |
| Remote / J&K | Remote and hill areas | FedEx | 7–10 days |

### 3.4 Zone 3 — Bangladesh

| Parameter | Value |
|---|---|
| Countries | Bangladesh (BD) |
| Currency | BDT |
| Warehousing | Dhaka (distributor warehouse) |
| Primary Carriers | Pathao, eCourier, Paperfly |

**Carrier Options:**

| Carrier | Service | Delivery Time (Dhaka) | Delivery Time (Other) |
|---|---|---|---|
| Pathao | Pathao Standard | 1–2 business days | 3–5 business days |
| eCourier | eCourier Economy | 1–3 business days | 3–5 business days |
| Paperfly | Paperfly Standard | 1–2 business days | 3–5 business days |

**Bangladesh Delivery Zones:**

| Zone | Area | Delivery Time |
|---|---|---|
| Dhaka City | Dhaka Metropolitan Area | 1–2 business days |
| Dhaka Division | Gazipur, Narayanganj, Savar | 2–3 business days |
| Major Cities | Chittagong, Sylhet, Rajshahi, Khulna | 3–5 business days |
| Other Districts | All remaining districts | 4–7 business days |

### 3.5 Zone 4 — KSA

| Parameter | Value |
|---|---|
| Countries | Saudi Arabia (SA) |
| Currency | SAR |
| Warehousing | Riyadh (Phase 3); shipped from Dubai (Phase 3.0 pre-KSA-warehouse) |
| Primary Carrier | Aramex |
| Secondary Carrier | Saudi Post Parcel (SPL) |

**Carrier Options:**

| Carrier | Service | Delivery Time | Coverage |
|---|---|---|---|
| Aramex | Aramex KSA Standard | 2–4 business days | All major KSA cities |
| Saudi Post | SPL Parcel | 3–5 business days | Pan-KSA including remote areas |

**KSA City Coverage:**

| City | Aramex Transit | SPL Transit |
|---|---|---|
| Riyadh | 2 business days | 3 business days |
| Jeddah | 2–3 business days | 3–4 business days |
| Dammam / Al Khobar | 2–3 business days | 3–5 business days |
| Makkah / Madinah | 3–4 business days | 4–5 business days |
| Remote areas | 4 business days | 5 business days |

### 3.6 Zone 5 — International

| Parameter | Value |
|---|---|
| Countries | All countries not in Zones 1–4 |
| Currency | USD |
| Warehousing | DAFZA, Dubai |
| Primary Carrier | DHL |
| Secondary Carrier | FedEx |

**Carrier Options:**

| Carrier | Service | Delivery Time | Notes |
|---|---|---|---|
| DHL | DHL Express Worldwide | 3–5 business days | Door-to-door, tracking included |
| FedEx | FedEx International Priority | 2–4 business days | Premium service, faster to USA/EU |

**International Sub-Zones (for estimated delivery time):**

| Region | DHL Express | FedEx Int'l Priority |
|---|---|---|
| GCC (non-KSA) | 2–3 business days | 2–3 business days |
| Europe | 3–5 business days | 2–4 business days |
| USA / Canada | 4–6 business days | 3–5 business days |
| Southeast Asia | 3–5 business days | 3–5 business days |
| Africa | 5–8 business days | 5–7 business days |
| Oceania | 5–7 business days | 4–6 business days |

---

## 4. Carrier Integrations

### 4.1 Integration Approach

**Phase 3.0 — Webhook/Manual Integration:**
Carrier integrations in Phase 3.0 are semi-automated. TwinMOS warehouse staff manually create shipments in carrier portals, then enter the tracking number into the Medusa admin. Medusa then sends a "shipped" email to the customer with the tracking number.

**Phase 3.1 — Full API Integration:**
Real-time carrier rate APIs are integrated as Medusa fulfillment providers. Labels are auto-generated, tracking numbers auto-populated.

### 4.2 Aramex Integration

**Phase 3.0:** Manual label creation in Aramex portal; tracking number entered in Medusa admin.

**Phase 3.1 — Aramex API:**

```typescript
// src/modules/fulfillment/aramex-provider.ts
import { AbstractFulfillmentProvider } from '@medusajs/framework/types';

export class AramexFulfillmentProvider extends AbstractFulfillmentProvider {
  static identifier = 'aramex';

  private aramexConfig = {
    clientInfo: {
      UserName: process.env.ARAMEX_USERNAME,
      Password: process.env.ARAMEX_PASSWORD,
      Version: 'v1',
      AccountNumber: process.env.ARAMEX_ACCOUNT_NUMBER,
      AccountPin: process.env.ARAMEX_ACCOUNT_PIN,
      AccountEntity: process.env.ARAMEX_ACCOUNT_ENTITY,
      AccountCountryCode: 'AE',
    }
  };

  async calculateShippingOptionPrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<number> {
    // Call Aramex Rate Calculator API
    const rateResponse = await this.callAramexRateCalc({
      OriginAddress: this.getDubaiWarehouseAddress(),
      DestinationAddress: data.shippingAddress,
      ShipmentDetails: {
        Dimensions: data.dimensions,
        ActualWeight: { Value: data.weight, Unit: 'KG' },
        ProductType: 'PPX', // Priority Parcel Express
        PaymentType: 'P', // Prepaid
        NumberOfPieces: 1,
      }
    });
    return rateResponse.TotalAmount.Value * 100; // Convert to fils
  }

  async createFulfillment(data: Record<string, unknown>, items: any[], order: any): Promise<any> {
    // Create Aramex shipment and get tracking number
    const shipmentResponse = await this.callAramexCreateShipment({
      Shipments: [{
        Reference1: order.id,
        Reference2: order.display_id,
        Shipper: this.getTwinMOSShipperDetails(),
        Consignee: this.mapOrderAddressToConsignee(order.shipping_address),
        ShippingDateTime: new Date().toISOString(),
        PickupLocation: 'Reception',
        PaymentType: 'P',
        ProductGroup: 'EXP',
        ProductType: 'PPX',
        Details: {
          Dimensions: { Length: 20, Width: 15, Height: 10, Unit: 'CM' },
          ActualWeight: { Value: data.weight / 1000, Unit: 'KG' },
          ChargeableWeight: { Value: data.weight / 1000, Unit: 'KG' },
          DescriptionOfGoods: 'Computer Memory and Storage Hardware',
          GoodsOriginCountry: 'AE',
          NumberOfPieces: 1,
          ProductionCountry: 'TW',
          CashOnDeliveryAmount: { Value: 0, CurrencyCode: 'AED' },
        }
      }]
    });

    return {
      tracking_number: shipmentResponse.Shipments[0].ID,
      carrier: 'Aramex',
      carrier_url: `https://www.aramex.com/track/results?mode=0&ShipmentNumber=${shipmentResponse.Shipments[0].ID}`
    };
  }
}
```

### 4.3 FedEx Integration

**Phase 3.1 — FedEx API:**

```typescript
// FedEx rate calculation (Phase 3.1)
const fedexRateRequest = {
  accountNumber: { value: process.env.FEDEX_ACCOUNT_NUMBER },
  requestedShipment: {
    shipper: { address: dubaiWarehouseAddress },
    recipient: { address: customerAddress },
    pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
    rateRequestType: ['LIST', 'ACCOUNT'],
    requestedPackageLineItems: [{
      weight: { units: 'KG', value: packageWeightKg },
      dimensions: { length: lengthCm, width: widthCm, height: heightCm, units: 'CM' }
    }]
  }
};
```

### 4.4 DHL Integration

**Phase 3.1 — DHL Express API:**

```typescript
// DHL Express rate shopping (Phase 3.1)
const dhlRateRequest = {
  customerDetails: {
    shipperDetails: { postalCode: 'DAFZA', cityName: 'Dubai', countryCode: 'AE' },
    receiverDetails: { postalCode: customerPostalCode, cityName: customerCity, countryCode: customerCountry }
  },
  accounts: [{ typeCode: 'shipper', number: process.env.DHL_ACCOUNT_NUMBER }],
  packages: [{ weight: packageWeightKg }],
  plannedShippingDateAndTime: new Date().toISOString(),
  unitOfMeasurement: 'metric',
};
```

### 4.5 Bangladesh Carriers (Pathao, eCourier, Paperfly)

Bangladesh carriers operate through the local distributor. The integration approach for Phase 3:

- **Phase 3.0:** Order data exported to distributor; distributor creates carrier bookings manually
- **Phase 3.1:** Direct API integration with Pathao (most API-mature carrier in Bangladesh)

```typescript
// Pathao courier API (Phase 3.1)
const pathaoShipmentRequest = {
  store_id: process.env.PATHAO_STORE_ID,
  merchant_order_id: order.id,
  recipient_name: order.shipping_address.first_name + ' ' + order.shipping_address.last_name,
  recipient_phone: order.shipping_address.phone,
  recipient_address: order.shipping_address.address_1,
  recipient_city: cityId, // Pathao city ID mapping
  recipient_zone: zoneId, // Pathao zone ID
  recipient_area: areaId,
  delivery_type: 48, // 48-hour delivery
  item_type: 2, // Parcel
  special_instruction: '',
  item_quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
  item_weight: totalWeightKg,
  amount_to_collect: 0, // No COD for online payments
  item_description: 'Computer Memory/Storage Hardware',
};
```

---

## 5. Shipping Rate Calculation

### 5.1 Phase 3.0 — Flat Rate Shipping

In Phase 3.0, shipping uses a flat-rate model per zone. This is the simplest approach for the initial launch.

**Flat Rate Table:**

| Zone | Market | Carrier | Flat Rate | Free Shipping Threshold |
|---|---|---|---|---|
| ZONE-1 | UAE | Aramex Next Day | AED 20.00 | AED 200+ (free) |
| ZONE-1 | UAE | Aramex Same Day | AED 35.00 | No free threshold |
| ZONE-1 | UAE | FedEx Economy | AED 25.00 | AED 200+ (free) |
| ZONE-2 | India | FedEx Economy | INR 100.00 | INR 1,000+ (free) |
| ZONE-2 | India | Blue Dart Premium | INR 150.00 | INR 2,000+ (free) |
| ZONE-3 | Bangladesh | Pathao Standard | BDT 100.00 | BDT 2,000+ (free) |
| ZONE-3 | Bangladesh | eCourier | BDT 100.00 | BDT 2,000+ (free) |
| ZONE-4 | KSA | Aramex Standard | SAR 20.00 | SAR 200+ (free) |
| ZONE-4 | KSA | Saudi Post Parcel | SAR 15.00 | SAR 200+ (free) |
| ZONE-5 | International | DHL Express | USD 25.00 | No free threshold |
| ZONE-5 | International | FedEx Int'l Priority | USD 35.00 | No free threshold |

### 5.2 Free Shipping Logic

```typescript
// Free shipping calculation
function calculateShippingRate(
  cartSubtotal: number,
  currency: string,
  selectedOption: ShippingOption
): number {
  const freeThresholds: Record<string, number> = {
    AED: 200_00, // AED 200 in fils
    INR: 1000_00, // INR 1000 in paise
    BDT: 2000_00, // BDT 2000 in poisha
    SAR: 200_00, // SAR 200 in halalas
    USD: 0, // No free threshold for international
  };

  // Same-day delivery never qualifies for free shipping
  if (selectedOption.metadata?.always_paid) {
    return selectedOption.amount;
  }

  const threshold = freeThresholds[currency.toUpperCase()] ?? 0;
  if (threshold > 0 && cartSubtotal >= threshold) {
    return 0; // Free shipping
  }

  return selectedOption.amount;
}
```

### 5.3 Phase 3.1 — Weight-Based Rates

**[3.1]** Weight-based shipping rates apply after the initial flat-rate period. The model charges a base rate for the first 500g and an increment per 100g thereafter.

**Weight-Based Rate Table:**

| Zone | Currency | Base Rate (≤500g) | Per 100g (after 500g) | Max Weight |
|---|---|---|---|---|
| UAE | AED | 20.00 | 2.00 | 30 kg |
| India | INR | 100.00 | 10.00 | 30 kg |
| Bangladesh | BDT | 100.00 | 10.00 | 25 kg |
| KSA | SAR | 20.00 | 2.00 | 30 kg |
| International | USD | 25.00 | 3.00 | 30 kg |

```typescript
// [3.1] Weight-based rate calculation
function calculateWeightBasedRate(
  weightGrams: number,
  zone: string
): number {
  const rates = {
    UAE: { base: 2000, increment: 200, baseWeight: 500 }, // fils
    India: { base: 10000, increment: 1000, baseWeight: 500 }, // paise
    Bangladesh: { base: 10000, increment: 1000, baseWeight: 500 }, // poisha
    KSA: { base: 2000, increment: 200, baseWeight: 500 }, // halalas
    International: { base: 2500, increment: 300, baseWeight: 500 }, // cents
  };

  const zoneRate = rates[zone];
  if (!zoneRate) return 0;

  if (weightGrams <= zoneRate.baseWeight) {
    return zoneRate.base;
  }

  const extraWeight = weightGrams - zoneRate.baseWeight;
  const extraIncrements = Math.ceil(extraWeight / 100);
  return zoneRate.base + (extraIncrements * zoneRate.increment);
}
```

### 5.4 Dimensional Weight

**[3.1]** For large but light packages, dimensional (volumetric) weight may exceed actual weight. The higher of actual weight vs. dimensional weight is used for billing.

**Dimensional Weight Formula:**
```
Dimensional Weight (kg) = (Length × Width × Height in cm) / 5000
```

```typescript
function calculateDimensionalWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number
): number {
  // Result in grams
  return ((lengthCm * widthCm * heightCm) / 5000) * 1000;
}

function getBillableWeight(actualWeightG: number, dimensionalWeightG: number): number {
  return Math.max(actualWeightG, dimensionalWeightG);
}
```

---

## 6. Product Weights and Dimensions

### 6.1 Individual Product Specifications

| Product | SKU Pattern | Weight | Dimensions (L×W×H) | Notes |
|---|---|---|---|---|
| DDR5 VOLTX 16GB | VOLTX-DDR5-16 | 50g | 14×3×1 cm | Standard DIMM |
| DDR5 VOLTX 32GB | VOLTX-DDR5-32 | 55g | 14×3×1.2 cm | Standard DIMM |
| DDR5 VOLTX RGB 16GB | VOLTXRGB-DDR5-16 | 55g | 14×4×1.5 cm | RGB heatspreader |
| DDR5 VOLTX RGB 32GB | VOLTXRGB-DDR5-32 | 60g | 14×4×1.5 cm | RGB heatspreader |
| TornadoX7 DDR4 8GB | TX7-DDR4-8 | 45g | 13.3×3×1 cm | Standard DIMM |
| TornadoX7 DDR4 16GB | TX7-DDR4-16 | 48g | 13.3×3×1 cm | Standard DIMM |
| Thunder GX DDR4 8GB | TGX-DDR4-8 | 46g | 13.3×3×1 cm | Gaming DIMM |
| Thunder GX DDR4 16GB | TGX-DDR4-16 | 50g | 13.3×3×1 cm | Gaming DIMM |
| CoreX Pro Gen5 NVMe 500GB | COREX-GEN5-500 | 10g | 8×2×0.4 cm | M.2 2280 |
| CoreX Pro Gen5 NVMe 1TB | COREX-GEN5-1TB | 10g | 8×2×0.4 cm | M.2 2280 |
| CoreX Pro Gen5 NVMe 2TB | COREX-GEN5-2TB | 12g | 8×2×0.4 cm | M.2 2280 |
| Xtreme Gen4 NVMe 500GB | XGEN4-500 | 8g | 8×2×0.4 cm | M.2 2280 |
| Xtreme Gen4 NVMe 1TB | XGEN4-1TB | 9g | 8×2×0.4 cm | M.2 2280 |
| Elite Drive SATA 2.5" 500GB | ELITE-SATA-500 | 60g | 10×7×0.7 cm | 2.5" SATA SSD |
| Elite Drive SATA 2.5" 1TB | ELITE-SATA-1TB | 62g | 10×7×0.7 cm | 2.5" SATA SSD |
| Portable SSD 500GB | PORT-SSD-500 | 80g | 10×6×1 cm | USB-C portable |
| Portable SSD 1TB | PORT-SSD-1TB | 90g | 10×6×1 cm | USB-C portable |
| Portable SSD 2TB | PORT-SSD-2TB | 100g | 10×6×1 cm | USB-C portable |
| USB Flash Drive 32GB | USB-32 | 20g | 6×2×1 cm | Standard USB-A |
| USB Flash Drive 64GB | USB-64 | 20g | 6×2×1 cm | Standard USB-A |
| USB Flash Drive 128GB | USB-128 | 22g | 6×2×1 cm | Standard USB-A |
| USB Flash Drive 256GB | USB-256 | 22g | 6×2×1 cm | Standard USB-A |

### 6.2 Packaged Weight (Including Retail Box)

The packaged weight includes the product, retail box, foam/bubble wrap insert, and outer shipping material:

| Product Category | Retail Box Add | Packaging Add | Total Overhead |
|---|---|---|---|
| RAM Module (DIMM) | +30g | +40g | +70g |
| M.2 NVMe SSD | +25g | +40g | +65g |
| 2.5" SATA SSD | +35g | +50g | +85g |
| Portable SSD | +50g | +60g | +110g |
| USB Flash Drive | +15g | +30g | +45g |

**Example — Packaged Weights:**

| Product | Bare Weight | Packaged Weight | Packaged Dimensions |
|---|---|---|---|
| DDR5 VOLTX 16GB | 50g | 120g | 16×8×4 cm |
| CoreX Pro Gen5 1TB | 10g | 75g | 12×8×3 cm |
| Elite Drive SATA 1TB | 62g | 147g | 14×10×4 cm |
| Portable SSD 1TB | 90g | 200g | 15×10×5 cm |
| USB Flash Drive 128GB | 22g | 67g | 10×6×3 cm |

---

## 7. Packaging Rules

### 7.1 Single Item Packaging

Each order with a single item is packed in the product's own retail box, placed inside a padded shipping envelope or small box with appropriate protection.

### 7.2 Multi-Item Packaging

When an order contains multiple items, they are packed together where possible:

**Packing Decision Logic:**

```typescript
interface PackageSpec {
  maxWeight: number; // grams
  maxDimension: number; // cm for longest side
  volume: number; // cm³
}

const standardPackages: PackageSpec[] = [
  { maxWeight: 500, maxDimension: 20, volume: 20 * 15 * 5 }, // Small envelope
  { maxWeight: 2000, maxDimension: 30, volume: 30 * 20 * 15 }, // Medium box
  { maxWeight: 5000, maxDimension: 45, volume: 45 * 35 * 25 }, // Large box
];

function determinePackageCount(items: OrderItem[]): number {
  let totalWeight = 0;
  items.forEach(item => {
    totalWeight += (item.packagedWeight * item.quantity);
  });

  // Start with smallest package; upgrade if weight or size exceeds limits
  if (totalWeight <= 500) return 1; // Small envelope
  if (totalWeight <= 2000) return 1; // Medium box
  if (totalWeight <= 5000) return 1; // Large box
  return Math.ceil(totalWeight / 5000); // Multiple boxes
}
```

### 7.3 Fragile Item Handling

All TwinMOS products require anti-static protection:
- RAM modules: Anti-static bag + foam insert
- SSDs: Anti-static bag + foam insert
- USB drives: Standard plastic tray

For international orders, all items receive additional bubble wrap protection.

### 7.4 Dimensional Weight Impact

If a multi-item order has items with low density (many small SSDs), dimensional weight is calculated and compared to actual weight:

```typescript
function calculateOrderShipmentWeight(order: Order): number {
  const items = order.line_items;
  let totalActualWeight = 0;

  items.forEach(item => {
    const product = item.variant.product;
    totalActualWeight += (product.metadata.packaged_weight_g * item.quantity);
  });

  // Estimate combined packaged dimensions
  const packageDimensions = estimatePackageDimensions(items);
  const dimWeight = calculateDimensionalWeight(
    packageDimensions.length,
    packageDimensions.width,
    packageDimensions.height
  );

  return getBillableWeight(totalActualWeight, dimWeight);
}
```

---

## 8. Estimated Delivery Times

### 8.1 Delivery Time Calculation

Estimated delivery time is calculated as:
```
Estimated Delivery = Order Processing Time + Transit Time
```

**Order Processing Time:**
- Standard: 1 business day (orders before 2:00 PM warehouse local time)
- Same-day eligible: 0 days (for UAE same-day, orders before 12:00 PM)

**Transit Time:** Per carrier/zone table in Section 3.

### 8.2 Display on Product Pages

On each product page, estimated delivery time is displayed in the India, UAE, KSA, and BD locales:

```html
<!-- Product page delivery estimate -->
<div class="delivery-estimate">
  <span class="delivery-icon">📦</span>
  <span class="delivery-text">
    Order now and receive by <strong>Thursday, May 7</strong>
    (via Aramex Next Day)
  </span>
</div>
```

**Implementation:**

```typescript
function getEstimatedDeliveryDate(
  region: string,
  selectedCarrier: string,
  orderTimestamp: Date
): { earliest: Date; latest: Date; label: string } {
  const transitDays = getTransitDays(region, selectedCarrier);
  const processingDays = isBeforeCutoffTime(orderTimestamp, region) ? 1 : 2;
  const totalDays = transitDays + processingDays;

  const earliest = addBusinessDays(orderTimestamp, totalDays.min);
  const latest = addBusinessDays(orderTimestamp, totalDays.max);

  return {
    earliest,
    latest,
    label: earliest.getTime() === latest.getTime()
      ? `by ${formatDate(earliest)}`
      : `between ${formatDate(earliest)} and ${formatDate(latest)}`
  };
}
```

### 8.3 Delivery Time at Checkout

At checkout, after the customer selects a shipping method, the estimated delivery window is displayed:

```
Aramex Next Day UAE — AED 20.00 (Free above AED 200)
Estimated delivery: Tuesday, May 5, 2026

FedEx Economy UAE — AED 25.00 (Free above AED 200)
Estimated delivery: Wednesday–Thursday, May 6–7, 2026
```

### 8.4 Business Days Calendar

The delivery time calculation uses business days. Non-delivery days:
- UAE: Friday, Saturday (weekend); UAE public holidays
- India: Sunday; Indian national holidays
- Bangladesh: Friday, Saturday; Bangladesh public holidays
- KSA: Friday, Saturday; KSA public holidays
- International: Destination country weekend and public holidays (approximate)

---

## 9. Order Tracking

### 9.1 Tracking Number Assignment

When TwinMOS warehouse staff fulfill an order:

1. Carrier label is created (manually in Phase 3.0, automatically in Phase 3.1)
2. Tracking number is entered in Medusa admin (Phase 3.0) or auto-populated (Phase 3.1)
3. Medusa triggers `order.shipment_created` event
4. Tracking email sent to customer via Resend

### 9.2 Tracking Email

```typescript
// Tracking notification email (Resend + React Email)
await resend.emails.send({
  from: 'orders@twinmos.com',
  to: order.email,
  subject: `Your TwinMOS Order is on its way! — ${order.display_id}`,
  react: ShipmentEmail({
    customerName: order.shipping_address.first_name,
    orderId: order.display_id,
    trackingNumber: fulfillment.tracking_numbers[0],
    carrier: fulfillment.metadata.carrier_name,
    trackingUrl: getTrackingUrl(fulfillment.metadata.carrier, fulfillment.tracking_numbers[0]),
    estimatedDelivery: fulfillment.metadata.estimated_delivery_date,
    items: order.items,
  })
});
```

### 9.3 Carrier Tracking URL Patterns

| Carrier | Tracking URL Format |
|---|---|
| Aramex | `https://www.aramex.com/track/results?mode=0&ShipmentNumber={TRACKING_NUMBER}` |
| FedEx | `https://www.fedex.com/fedextrack/?trknbr={TRACKING_NUMBER}` |
| DHL | `https://www.dhl.com/ae-en/home/tracking/tracking-express.html?submit=1&tracking-id={TRACKING_NUMBER}` |
| Delhivery | `https://www.delhivery.com/track/package/{TRACKING_NUMBER}` |
| Blue Dart | `https://www.bluedart.com/web/guest/trackdartresult?shipmentType=awb&shipmentNo={TRACKING_NUMBER}` |
| Saudi Post | `https://parcel.sa/search?id={TRACKING_NUMBER}` |
| Pathao | `https://pathao.com/parcel/track?invoice={TRACKING_NUMBER}` |
| eCourier | `https://ecourier.com.bd/tracking/{TRACKING_NUMBER}` |

```typescript
function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const patterns: Record<string, string> = {
    aramex: `https://www.aramex.com/track/results?mode=0&ShipmentNumber=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    dhl: `https://www.dhl.com/ae-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,
    delhivery: `https://www.delhivery.com/track/package/${trackingNumber}`,
    'blue-dart': `https://www.bluedart.com/web/guest/trackdartresult?shipmentType=awb&shipmentNo=${trackingNumber}`,
    'saudi-post': `https://parcel.sa/search?id=${trackingNumber}`,
    pathao: `https://pathao.com/parcel/track?invoice=${trackingNumber}`,
    ecourier: `https://ecourier.com.bd/tracking/${trackingNumber}`,
    paperfly: `https://paperfly.com.bd/tracking/${trackingNumber}`,
  };
  return patterns[carrier.toLowerCase()] ?? '#';
}
```

### 9.4 Customer Order Tracking Page

Customers can track their order at `/account/orders/{order_id}` (logged in) or `/orders/track` (guest):

**Tracking Page Elements:**
- Order status stepper (visual timeline)
- Tracking number displayed with "Copy" button
- "Track on carrier website" button (opens carrier tracking URL)
- Estimated delivery date
- Last carrier scan event (Phase 3.1 — via carrier tracking webhook)

---

## 10. Shipping Restrictions and Compliance

### 10.1 Export Control for Memory Products

Memory and storage hardware (RAM, SSDs) may be subject to export controls under:
- **UAE:** UAE Strategic Goods Control List
- **US Export Controls:** EAR (Export Administration Regulations) — if products contain US-origin technology
- **EU Dual-Use Regulations** — for EU-bound shipments

**Phase 3 Approach:**
- Standard consumer memory products (DDR4/DDR5 RAM, SATA/NVMe SSD) are generally classified under EAR99 (not controlled) for most destinations
- TwinMOS Legal team must confirm classification for each product
- Certain high-capacity/high-speed NVMe SSDs may require classification review
- Shipments to embargoed destinations (Russia, Belarus, North Korea, Iran, etc.) are blocked

**Blocked Destination Implementation:**

```typescript
// Blocked shipping destinations (per UAE and international regulations)
const BLOCKED_COUNTRIES = ['RU', 'BY', 'KP', 'IR', 'CU', 'SY'];

function isShippingAllowed(destinationCountry: string): boolean {
  return !BLOCKED_COUNTRIES.includes(destinationCountry.toUpperCase());
}

// Applied at checkout when customer selects delivery address
if (!isShippingAllowed(selectedCountry)) {
  throw new Error('SHIPPING_RESTRICTED: We are unable to ship to this destination due to regulatory restrictions.');
}
```

### 10.2 High-Value Shipment Insurance

| Order Value | Insurance | Action |
|---|---|---|
| < AED 500 | None required | Standard shipment |
| AED 500 – 2,000 | Carrier liability covers | Standard shipment |
| > AED 2,000 | Declare value + carrier insurance | Additional insurance premium may apply |
| > AED 5,000 | Mandatory declared value | Carrier consults required |

### 10.3 Dangerous Goods

TwinMOS products (RAM, SSDs, USB drives) are not classified as dangerous goods. No IATA dangerous goods declarations are required.

---

## 11. Customs and International Shipping

### 11.1 Harmonized System (HS) Codes

| Product Category | HS Code | Description |
|---|---|---|
| RAM Modules (DDR4/DDR5) | 8473.30 | Parts and accessories for computing machinery |
| NVMe SSD (M.2) | 8471.70 | Storage units for automatic data processing machines |
| SATA SSD (2.5") | 8471.70 | Storage units for automatic data processing machines |
| Portable SSD | 8471.70 | External storage units |
| USB Flash Drive | 8523.51 | Semiconductor media — flash memory |
| Computer Memory (DRAM) | 8542.32 | Dynamic RAM circuits (alternate) |

**Note:** HS code 8471.70 vs. 8542.32 for RAM depends on the importing country's tariff schedule. TwinMOS should consult a customs broker for country-specific classifications.

### 11.2 Commercial Invoice for International Shipments

All international shipments require a commercial invoice attached to the package, containing:

| Field | Value |
|---|---|
| Exporter | TwinMOS Technologies, DAFZA, Dubai, UAE |
| Importer | Customer name and full address |
| Country of Origin | Taiwan (TW) — where manufactured |
| Country of Export | United Arab Emirates (AE) |
| HS Code | Per product (see above) |
| Description of Goods | Full product name and specification |
| Quantity | Number of units per SKU |
| Unit Value (USD) | Per-unit declared value |
| Total Value (USD) | Total order value |
| Currency | USD |
| Terms of Sale | DAP (Delivered at Place) — customer pays import duties |
| Reason for Export | Sale |

### 11.3 Customs Declared Value

- The declared customs value equals the actual sale price (no under-declaration)
- TwinMOS does not under-declare customs values — this is illegal and carries significant penalties
- For gift shipments, mark as "Gift" with fair market value

### 11.4 De Minimis Thresholds (International)

Many countries have de minimis thresholds below which import duties are not charged:

| Country/Region | De Minimis (approx.) | Notes |
|---|---|---|
| USA | USD 800 | High threshold — most TwinMOS orders duty-free |
| EU | EUR 150 | VAT-free threshold (EUR 22 removed since 2021) |
| UK | GBP 135 | Low value imports scheme |
| Australia | AUD 1,000 | |
| Singapore | SGD 400 (2024+) | GST payable on all imports |
| India | INR 5,000 | Basic customs duty exemption |

**Note:** TwinMOS must clearly state to international customers that they are responsible for any import duties above de minimis thresholds.

---

## 12. In-Stock vs Pre-Order Handling

### 12.1 In-Stock Orders

Standard fulfillment flow:
1. Order placed → Payment captured
2. Warehouse picks and packs within 1 business day
3. Carrier pickup same or next business day
4. Tracking number assigned and emailed

### 12.2 Pre-Order Handling

When a product is in Pre-Order status:

**Checkout Behavior:**
- Customer sees "Pre-Order" badge on product
- Estimated availability date shown (e.g., "Available from June 15, 2026")
- Payment captured immediately at checkout (or optionally deferred — TBD with Finance)
- Shipping options shown with delayed estimated delivery date

**Pre-Order Email Flow:**
1. "Pre-Order Confirmed" email — immediately after payment
2. "Your pre-order is now ready" email — when stock arrives and order moves to processing
3. Standard shipping and delivery emails follow

**Medusa Pre-Order Implementation:**

```typescript
// Mark product variant as pre-order in Medusa
await medusa.admin.productVariants.update(variantId, {
  metadata: {
    is_pre_order: true,
    estimated_availability: '2026-06-15',
    pre_order_note: 'Expected to ship the week of June 15, 2026',
  },
  purchasable: true, // Still purchasable as pre-order
  inventory_quantity: 0, // Show as pre-order, not in stock
  allow_backorder: true, // Allow purchase despite 0 inventory
});
```

---

## 13. Partial Shipment Handling

### 13.1 When Partial Shipments Occur

Partial shipments occur when:
- Items in an order are in different warehouse locations
- Some items are in-stock and others are pre-order
- A single-location order has insufficient stock for all items (rare with proper inventory sync)

### 13.2 Partial Shipment Policy

**Phase 3 Default:** TwinMOS ships orders complete (all items at once) unless explicitly approved by Operations team. Partial shipment is not offered to customers as a self-service option.

**Exceptions (Operations team approves):**
- Pre-order + in-stock items in same order: in-stock items shipped first, pre-order items shipped when available
- Large orders with stock spread across warehouses: split by warehouse

### 13.3 Partial Shipment Implementation

```typescript
// Medusa fulfillment — create partial fulfillment
async function createPartialFulfillment(
  orderId: string,
  itemsToFulfill: { itemId: string; quantity: number }[]
): Promise<Fulfillment> {
  const fulfillment = await medusa.admin.orders.createFulfillment(orderId, {
    items: itemsToFulfill,
    metadata: {
      partial_shipment: true,
      remaining_items: getRemainingItems(orderId, itemsToFulfill),
    }
  });

  // Notify customer of partial shipment
  await notificationService.send('order.partial_shipment', {
    orderId,
    fulfilledItems: itemsToFulfill,
    remainingItems: fulfillment.metadata.remaining_items,
  });

  return fulfillment;
}
```

---

## 14. Failed Delivery Handling

### 14.1 Failed Delivery Scenarios

| Scenario | Carrier Action | TwinMOS Action |
|---|---|---|
| Customer not home (1st attempt) | Leave delivery notice; re-attempt next day | No action; customer notified by carrier |
| Customer not home (2nd attempt) | Hold at carrier depot (3–7 days) | Email customer with collection instructions |
| Customer not home (3rd attempt) | Return to sender | Customer service contacted; reship or refund |
| Incorrect address | Return to sender | Customer service contacted for correct address |
| Refused delivery | Return to sender | Refund processed minus return shipping cost |
| Damaged in transit | Carrier investigation | Insurance claim filed; replacement shipped |
| Lost in transit | Carrier investigation | Replacement shipped after 15 business days |

### 14.2 Return to Sender Process

When a package is returned to the TwinMOS warehouse:

1. Warehouse receives and inspects returned package
2. Customer Service contacts customer (email + phone)
3. Customer chooses: reship (at new shipping cost) or refund
4. If no response within 7 days: full refund minus outbound shipping cost

### 14.3 Refund for Failed Delivery

| Scenario | Refund |
|---|---|
| Carrier lost package (confirmed) | Full refund including shipping |
| Refused delivery | Product refund only (shipping not refunded) |
| Incorrect address (customer error) | Product refund only (shipping not refunded) |
| Damaged in transit | Full refund or replacement |

---

## 15. Medusa.js Shipping Configuration

### 15.1 Shipping Option Configuration

```typescript
// src/scripts/seed-shipping-options.ts
import { MedusaApp } from '@medusajs/framework';

async function seedShippingOptions() {
  const { container } = await MedusaApp({ ...config });
  const fulfillmentModuleService = container.resolve('fulfillment');

  // UAE — Aramex Next Day
  await fulfillmentModuleService.createShippingOptions({
    name: 'Aramex Next Day',
    service_zone_id: uaeServiceZoneId,
    shipping_profile_id: defaultProfileId,
    provider_id: 'aramex', // or 'manual' for Phase 3.0
    price_type: 'flat',
    type: {
      label: 'Next Day Delivery',
      description: 'Delivered next business day',
      code: 'aramex-next-day',
    },
    rules: [
      {
        attribute: 'cart.item_total',
        operator: 'gte',
        value: '20000', // AED 200.00 in fils — free shipping threshold
        // If rule applies AND is_return is false → 0 price
      }
    ],
    prices: [
      {
        currency_code: 'aed',
        amount: 2000, // AED 20.00 in fils
      },
      {
        // Free price record for orders above threshold
        currency_code: 'aed',
        amount: 0,
        rules: [{ attribute: 'cart.item_total', operator: 'gte', value: '20000' }]
      }
    ],
    data: {
      carrier: 'aramex',
      service_level: 'next_day',
      always_paid: false,
      estimated_days_min: 1,
      estimated_days_max: 1,
    }
  });

  // UAE — Aramex Same Day (always paid)
  await fulfillmentModuleService.createShippingOptions({
    name: 'Aramex Same Day (Dubai, Abu Dhabi, Sharjah)',
    service_zone_id: uaeSameDayServiceZoneId,
    shipping_profile_id: defaultProfileId,
    provider_id: 'aramex',
    price_type: 'flat',
    type: {
      label: 'Same Day Delivery',
      description: 'Delivered today (order before 12:00 PM)',
      code: 'aramex-same-day',
    },
    prices: [
      { currency_code: 'aed', amount: 3500 } // AED 35.00
    ],
    data: {
      carrier: 'aramex',
      service_level: 'same_day',
      always_paid: true, // Never free
      cutoff_time: '12:00',
      cutoff_timezone: 'Asia/Dubai',
      eligible_cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
      estimated_days_min: 0,
      estimated_days_max: 0,
    }
  });

  // India — FedEx Economy
  await fulfillmentModuleService.createShippingOptions({
    name: 'FedEx Economy',
    service_zone_id: indiaServiceZoneId,
    shipping_profile_id: defaultProfileId,
    provider_id: 'fedex',
    price_type: 'flat',
    type: {
      label: 'Standard Delivery',
      description: '3–5 business days',
      code: 'fedex-economy-india',
    },
    prices: [
      { currency_code: 'inr', amount: 10000 }, // INR 100.00
      { currency_code: 'inr', amount: 0, rules: [{ attribute: 'cart.item_total', operator: 'gte', value: '100000' }] } // Free above INR 1,000
    ],
    data: {
      carrier: 'fedex',
      service_level: 'economy',
      estimated_days_min: 3,
      estimated_days_max: 5,
    }
  });

  // International — DHL Express
  await fulfillmentModuleService.createShippingOptions({
    name: 'DHL Express Worldwide',
    service_zone_id: internationalServiceZoneId,
    shipping_profile_id: defaultProfileId,
    provider_id: 'dhl',
    price_type: 'flat',
    type: {
      label: 'DHL Express',
      description: '3–5 business days internationally',
      code: 'dhl-express-intl',
    },
    prices: [
      { currency_code: 'usd', amount: 2500 } // USD 25.00
    ],
    data: {
      carrier: 'dhl',
      service_level: 'express',
      estimated_days_min: 3,
      estimated_days_max: 5,
    }
  });
}
```

### 15.2 Service Zone Configuration

```typescript
// Define service zones for each market
const serviceZones = [
  {
    name: 'UAE Zone',
    fulfillment_set_id: uaeFulfillmentSetId,
    geo_zones: [{ type: 'country', country_code: 'ae' }]
  },
  {
    name: 'India Zone',
    fulfillment_set_id: indiaFulfillmentSetId,
    geo_zones: [{ type: 'country', country_code: 'in' }]
  },
  {
    name: 'Bangladesh Zone',
    fulfillment_set_id: bdFulfillmentSetId,
    geo_zones: [{ type: 'country', country_code: 'bd' }]
  },
  {
    name: 'KSA Zone',
    fulfillment_set_id: ksaFulfillmentSetId,
    geo_zones: [{ type: 'country', country_code: 'sa' }]
  },
  {
    name: 'International Zone',
    fulfillment_set_id: intlFulfillmentSetId,
    geo_zones: [
      // All countries not in above zones
      { type: 'country', country_code: 'us' },
      { type: 'country', country_code: 'gb' },
      // ... (complete list of allowed international countries)
    ]
  }
];
```

### 15.3 Manual Fulfillment Provider (Phase 3.0)

```typescript
// src/modules/fulfillment/manual-provider.ts
import { AbstractFulfillmentProvider } from '@medusajs/framework/types';

export class ManualFulfillmentProvider extends AbstractFulfillmentProvider {
  static identifier = 'manual';

  async createFulfillment(data, items, order, fulfillment) {
    // No automated carrier API call — warehouse staff handle manually
    return {
      data: {
        created_at: new Date().toISOString(),
        carrier: data.carrier ?? 'manual',
        requires_manual_tracking: true,
      }
    };
  }

  async createReturnFulfillment(data) {
    return { data: { type: 'return', requires_manual_processing: true } };
  }

  async cancelFulfillment(data) {
    return { data: { canceled_at: new Date().toISOString() } };
  }

  async getFulfillmentDocuments(data) {
    return [];
  }

  async getReturnDocuments(data) {
    return [];
  }

  async getShipDocuments(data) {
    return [];
  }

  async validateFulfillmentData(optionData, data, order) {
    return data;
  }

  async validateOption(data) {
    return true;
  }

  async canCalculate(data) {
    return false; // Flat rate, not real-time calculated
  }

  async calculatePrice(optionData, data) {
    return 0; // Price set as flat rate in shipping option config
  }
}
```

---

## 16. Admin Shipping Management

### 16.1 Medusa Admin — Shipping Options Management

TwinMOS operations staff can manage shipping options via the Medusa admin panel:

**Access Path:** Medusa Admin → Settings → Regions → [Region] → Shipping Options

**Available Actions:**
- View all shipping options per region
- Enable / disable a shipping option (without deleting)
- Edit shipping rates (flat rate update)
- Update estimated delivery time metadata
- Add new shipping options
- Set seasonal rate adjustments (manual update of price)

### 16.2 Seasonal Rate Adjustments

For peak periods (Ramadan, National Day UAE, Diwali, etc.), shipping costs from carriers may increase. To adjust:

```typescript
// Admin API — update shipping option price
await medusaAdminClient.shippingOptions.updatePrice(
  shippingOptionId,
  priceId,
  {
    amount: 3000, // AED 30.00 (temporary peak rate increase from AED 20.00)
  }
);

// Also update metadata
await medusaAdminClient.shippingOptions.update(shippingOptionId, {
  metadata: {
    peak_period: true,
    peak_period_label: 'Eid Al-Fitr period',
    peak_period_end: '2026-04-15',
  }
});
```

### 16.3 Carrier Contact Directory

| Carrier | Account Manager | Email | Phone | Account Number |
|---|---|---|---|---|
| Aramex UAE | [TBD] | [TBD] | [TBD] | [TBD] |
| FedEx MENA | [TBD] | [TBD] | [TBD] | [TBD] |
| DHL UAE | [TBD] | [TBD] | [TBD] | [TBD] |
| Delhivery | [TBD] | [TBD] | [TBD] | [TBD] |
| Blue Dart | [TBD] | [TBD] | [TBD] | [TBD] |
| Pathao | [TBD] | [TBD] | [TBD] | [TBD] |
| Saudi Post | [TBD] | [TBD] | [TBD] | [TBD] |

*To be completed by TwinMOS Operations team.*

---

## 17. Performance Requirements

| Requirement | Target | Priority |
|---|---|---|
| Shipping rate calculation (flat rate) | < 100ms | Must Have |
| Shipping rate calculation (carrier API, Phase 3.1) | < 500ms | Must Have |
| Shipping options display at checkout | < 200ms from address entry | Must Have |
| Tracking number propagation to customer | < 5 minutes of fulfillment creation | Must Have |
| Carrier API timeout fallback (Phase 3.1) | Fall back to flat rate if carrier API > 3s | Must Have |
| Shipping option list cache TTL | 5 minutes | Should Have |

---

## 18. Test Scenarios

### 18.1 UAE Shipping Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| SHIP-UAE-001 | UAE cart < AED 200, Aramex Next Day selected | Shipping: AED 20.00 |
| SHIP-UAE-002 | UAE cart >= AED 200, Aramex Next Day selected | Shipping: AED 0.00 (free) |
| SHIP-UAE-003 | UAE cart, order placed before 12:00 PM, Dubai delivery | Same-day option shown; AED 35.00 (not free) |
| SHIP-UAE-004 | UAE cart, order placed after 12:00 PM | Same-day option NOT shown |
| SHIP-UAE-005 | UAE cart, Fujairah delivery | Only Next Day / FedEx Economy shown (no same-day) |

### 18.2 India Shipping Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| SHIP-IN-001 | India cart < INR 1,000, FedEx Economy | Shipping: INR 100 |
| SHIP-IN-002 | India cart >= INR 1,000, FedEx Economy | Shipping: INR 0.00 (free) |
| SHIP-IN-003 | India metro city delivery | Blue Dart 2–3 days option shown |
| SHIP-IN-004 | India remote area delivery | FedEx only, 5–7 days displayed |

### 18.3 International Shipping Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| SHIP-INTL-001 | USA delivery, DHL Express | Shipping: USD 25.00 |
| SHIP-INTL-002 | Russia delivery | Error: "Shipping restricted to this destination" |
| SHIP-INTL-003 | UK delivery, FedEx Int'l Priority | Shipping: USD 35.00 |
| SHIP-INTL-004 | Commercial invoice generated | Invoice attached to package with correct HS codes |

### 18.4 Tracking Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| SHIP-TRACK-001 | Fulfillment created with tracking number | Tracking email sent within 5 minutes |
| SHIP-TRACK-002 | Customer clicks tracking link | Redirected to correct carrier tracking page |
| SHIP-TRACK-003 | Guest tracking via /orders/track | Order found with email + order ID |
| SHIP-TRACK-004 | Logged-in order history | Tracking number and link visible |

---

## 19. Acceptance Criteria

| ID | Criterion | Priority |
|---|---|---|
| AC-SHIP-001 | All five shipping zones have at least one active shipping option configured | Must Have |
| AC-SHIP-002 | Free shipping is correctly applied at defined thresholds for UAE, India, Bangladesh, KSA | Must Have |
| AC-SHIP-003 | Shipping rate calculation completes in < 500ms at checkout | Must Have |
| AC-SHIP-004 | UAE same-day delivery option is only shown for eligible cities and before 12:00 PM cutoff | Must Have |
| AC-SHIP-005 | International orders are blocked for countries on the restricted list | Must Have |
| AC-SHIP-006 | Tracking email is sent to customer within 5 minutes of fulfillment creation | Must Have |
| AC-SHIP-007 | Carrier tracking link on order page opens correct carrier website with correct tracking number | Must Have |
| AC-SHIP-008 | Estimated delivery date on product pages and checkout is accurate to within ±1 business day | Should Have |
| AC-SHIP-009 | Admin can enable/disable shipping options without code deployment | Must Have |
| AC-SHIP-010 | Phase 3.1 weight-based rates calculate correctly for orders above 500g | Should Have |

---

## 20. Business Rules Reference

| Rule ID | Rule Description |
|---|---|
| BR-SHIP-001 | Shipping options are determined by the customer's delivery address country, not their billing address |
| BR-SHIP-002 | Free shipping applies to the cart subtotal (before tax), not the total including tax |
| BR-SHIP-003 | Discount coupons applied to the cart do NOT affect free shipping threshold eligibility |
| BR-SHIP-004 | UAE same-day delivery is never free regardless of cart value |
| BR-SHIP-005 | Shipments to embargoed or restricted countries are blocked at checkout |
| BR-SHIP-006 | All international shipments declare the actual sale price as customs value — no under-declaration |
| BR-SHIP-007 | Shipping costs are non-refundable unless the carrier is responsible for loss or damage |
| BR-SHIP-008 | In Phase 3.0, tracking numbers are entered manually by warehouse staff within 1 business day of shipment |
| BR-SHIP-009 | Partial shipments are only permitted with explicit approval from Operations team |
| BR-SHIP-010 | Pre-order items in a mixed cart ship separately when in-stock items are ready (2-shipment approach) |
| BR-SHIP-011 | Carrier API failures in Phase 3.1 fall back to flat rates without blocking checkout |
| BR-SHIP-012 | Weight-based rates (Phase 3.1) use the greater of actual weight vs. dimensional weight |
| BR-SHIP-013 | All shipped packages must have a tracking number assigned in Medusa before the "Shipped" email is sent |
| BR-SHIP-014 | Failed delivery packages returned to warehouse must be processed within 5 business days |
| BR-SHIP-015 | Shipping options added/removed by admin take effect immediately without requiring deployment |

---

*Document End — TWN-P3-SHIP-2026-001 v1.0*
*TwinMOS Technologies — Confidential*
