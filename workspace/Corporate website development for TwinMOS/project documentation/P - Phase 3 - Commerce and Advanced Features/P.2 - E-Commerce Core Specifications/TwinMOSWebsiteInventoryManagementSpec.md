# Inventory Management Specification
## TwinMOS Technologies Corporate Website — Phase 3

| Field | Value |
|---|---|
| Document Reference | TWN-P3-INV-2026-001 |
| Version | 1.0 |
| Date | 2026-05-01 |
| Author | TwinMOS Web Platform Team |
| Status | Draft for Review |
| Phase | Phase 3 — Commerce and Advanced Features |
| Module | P.2 — E-Commerce Core Specifications |

---

## Table of Contents

1. [Overview and Purpose](#1-overview-and-purpose)
2. [Inventory Architecture](#2-inventory-architecture)
3. [Inventory Data Model](#3-inventory-data-model)
4. [Stock Locations](#4-stock-locations)
5. [ERP Integration for Inventory Sync](#5-erp-integration-for-inventory-sync)
6. [Stock Status Display](#6-stock-status-display)
7. [Cart Reservation System](#7-cart-reservation-system)
8. [Business Rules](#8-business-rules)
9. [Backorder Handling](#9-backorder-handling)
10. [Bundle Product Inventory](#10-bundle-product-inventory)
11. [Inventory Reporting](#11-inventory-reporting)
12. [Medusa.js Inventory Module Configuration](#12-medusajs-inventory-module-configuration)
13. [API Endpoints](#13-api-endpoints)
14. [Admin Inventory Management](#14-admin-inventory-management)
15. [Performance Requirements](#15-performance-requirements)
16. [Test Scenarios](#16-test-scenarios)
17. [Acceptance Criteria](#17-acceptance-criteria)
18. [Business Rules Reference](#18-business-rules-reference)

---

## 1. Overview and Purpose

### 1.1 Document Scope

This specification defines the complete inventory management architecture for the TwinMOS Technologies e-commerce platform. It covers the Medusa.js v2 inventory module configuration, ERP synchronization, stock status display logic, cart reservation, low-stock alerting, and inventory reporting.

### 1.2 Business Context

TwinMOS Technologies manages physical inventory across multiple regional warehouses. The website must reflect accurate, real-time inventory availability to prevent overselling, provide customers with clear stock information, and support operations teams with proactive low-stock alerts.

Key inventory challenges:
- Multiple warehouse locations across 4+ countries
- ERP system is the source of truth for physical stock levels
- Website inventory must stay synchronized without latency that causes customer disappointment
- High-velocity SKUs (popular DDR5 modules) can sell out within hours of a promotion

### 1.3 Inventory Data Flow Summary

```
TwinMOS ERP (SAP Business One / MS Dynamics)
         │
         │ Inventory levels (batch every 4h, webhook on movement)
         ▼
Strapi v5 InventoryLevel Collection
         │
         │ Sync job
         ▼
Medusa.js v2 Inventory Module
         │
         │ Real-time availability check
         ▼
Website product pages / checkout
```

### 1.4 Stakeholders

| Stakeholder | Role |
|---|---|
| TwinMOS Operations Team | Warehouse management, stock movement owner |
| TwinMOS Sales Team | Monitors stock for promotions and allocation |
| Platform Engineering | Medusa inventory module configuration |
| ERP Administrator | ERP webhook and API configuration |
| TwinMOS Customer Service | Handles stock queries from customers |

---

## 2. Inventory Architecture

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│            TwinMOS ERP (Source of Truth)                    │
│       SAP Business One / Microsoft Dynamics                 │
│                                                             │
│  Inventory Item → Warehouse → Quantity on Hand              │
└──────────┬──────────────────┬───────────────────────────────┘
           │                  │
           │ Batch sync        │ Webhook (on movement)
           │ (every 4h)        │ (real-time trigger)
           ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Strapi v5 (Content + Data Layer)               │
│                                                             │
│  Collection: InventoryLevel                                 │
│  Fields: sku, location_id, quantity, reserved, available    │
└──────────────────────┬──────────────────────────────────────┘
                       │ Sync job
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          Medusa.js v2 — Inventory Module                    │
│                                                             │
│  InventoryItem → InventoryLevel (per location)             │
│  ReservationItems (cart holds)                             │
└──────────┬──────────────────────────────────────────────────┘
           │ Availability check
           ▼
┌─────────────────────────────────────────────────────────────┐
│       Website (Astro 5 Frontend)                           │
│  Product pages: In Stock / Low Stock / Out of Stock        │
│  Checkout: Cart validation against availability            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Responsibilities

| Component | Responsibility |
|---|---|
| TwinMOS ERP | Physical inventory tracking, goods receipt, shipment, adjustment |
| Strapi InventoryLevel | Intermediate cache; decouples ERP from Medusa |
| Medusa Inventory Module | Website availability, cart reservation, checkout validation |
| PostHog | Track inventory-related events (stock viewed, out-of-stock notification signup) |
| Resend | Send low-stock alerts and customer back-in-stock notifications |
| Slack | Internal #inventory channel for low-stock and stockout alerts |

---

## 3. Inventory Data Model

### 3.1 Medusa.js Inventory Data Model

```
InventoryItem
├── id: string (medusa internal ID)
├── sku: string (TwinMOS product SKU e.g. VOLTX-DDR5-16)
├── title: string (e.g. "VOLTX DDR5 16GB")
├── description: string
├── thumbnail: string (image URL)
├── weight: number (grams)
├── length: number (cm)
├── width: number (cm)
├── height: number (cm)
├── origin_country: string (TW — Taiwan)
├── hs_code: string (e.g. "8473.30")
├── mid_code: string
├── material: string
├── metadata: Record<string, unknown>
│   ├── erp_item_code: string (ERP item ID)
│   ├── is_pre_order: boolean
│   ├── pre_order_availability_date: string
└── created_at / updated_at: Date

ProductVariant (links to InventoryItem)
├── id: string
├── product_id: string
├── sku: string
├── title: string (e.g. "16GB / DDR5-4800 / Black")
├── inventory_items: InventoryItemVariant[] (join table)
└── ...

InventoryLevel (per location)
├── id: string
├── inventory_item_id: string (FK to InventoryItem)
├── location_id: string (FK to StockLocation)
├── stocked_quantity: number (total physical stock)
├── reserved_quantity: number (held for active carts/orders)
├── incoming_quantity: number (in transit / PO on order)
├── available_quantity: number (computed: stocked - reserved)
└── created_at / updated_at: Date

StockLocation
├── id: string
├── name: string (e.g. "UAE Warehouse — DAFZA")
├── address: StockLocationAddress
└── metadata: { country_code, warehouse_code, timezone }

ReservationItem
├── id: string
├── inventory_item_id: string
├── location_id: string
├── quantity: number (reserved)
├── line_item_id: string (Medusa cart line item)
├── description: string
└── created_at / expires_at: Date
```

### 3.2 Strapi InventoryLevel Collection (Sync Layer)

```typescript
// Strapi content type: InventoryLevel
interface StratpiInventoryLevel {
  id: number;
  sku: string; // TwinMOS SKU (matches Medusa InventoryItem.sku)
  erp_item_code: string; // ERP internal item code
  location_id: string; // Medusa StockLocation ID
  location_name: string; // Human-readable (e.g., "UAE DAFZA")
  quantity_on_hand: number; // From ERP
  quantity_committed: number; // Committed to confirmed orders in ERP
  quantity_available: number; // on_hand - committed
  last_synced_at: Date; // Timestamp of last ERP sync
  sync_source: 'batch' | 'webhook'; // How this update arrived
  erp_sync_version: string; // ERP version/timestamp for conflict resolution
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.3 Product Variant to Inventory Item Mapping

Each product variant has exactly one associated inventory item in Phase 3. Many-to-many is supported by Medusa for kits.

```typescript
// Mapping: ProductVariant → InventoryItem
const variantInventoryMapping = {
  'VOLTX-DDR5-16GB-STICK': {
    inventory_item_id: 'iitem_01JX....',
    required_quantity: 1, // Per unit sold
  },
  'VOLTX-DDR5-32GB-KIT-2X16': {
    // Bundle: 2 sticks per kit
    inventory_items: [
      { inventory_item_id: 'iitem_VOLTX16...', required_quantity: 2 }
    ]
  }
};
```

---

## 4. Stock Locations

### 4.1 Location Overview

| Location ID | Name | Country | City | Warehouse Code | Timezone |
|---|---|---|---|---|---|
| `loc_uae_dafza` | UAE Warehouse — DAFZA | AE | Dubai | TM-WH-UAE-001 | Asia/Dubai |
| `loc_in_delhi` | India Warehouse — New Delhi | IN | New Delhi | TM-WH-IN-001 | Asia/Kolkata |
| `loc_bd_dhaka` | Bangladesh Warehouse — Dhaka | BD | Dhaka | TM-WH-BD-001 | Asia/Dhaka |
| `loc_ksa_riyadh` | KSA Warehouse — Riyadh | SA | Riyadh | TM-WH-KSA-001 | Asia/Riyadh |
| `loc_intl_uae` | International Fulfillment (Dubai) | AE | Dubai | TM-WH-UAE-001 | Asia/Dubai |

**Notes:**
- International orders (Zone 5) are fulfilled from the UAE DAFZA warehouse
- The UAE warehouse and International fulfillment location share the same physical warehouse (loc_uae_dafza and loc_intl_uae can be the same Medusa location with logical separation via metadata)
- KSA warehouse is a Phase 3 target; Phase 3.0 may fulfill KSA from UAE until KSA warehouse is operational

### 4.2 Location Configuration in Medusa

```typescript
// Seeding stock locations
const locations = [
  {
    name: 'UAE Warehouse — DAFZA',
    address: {
      address_1: 'Dubai Airport Free Zone (DAFZA)',
      city: 'Dubai',
      country_code: 'ae',
      postal_code: '00000', // DAFZA postal code — confirm with Operations
    },
    metadata: {
      warehouse_code: 'TM-WH-UAE-001',
      timezone: 'Asia/Dubai',
      country_code: 'AE',
      ships_internationally: true,
      erp_warehouse_id: 'WH001', // ERP warehouse code
    }
  },
  {
    name: 'India Warehouse — New Delhi',
    address: {
      address_1: '[India Warehouse Address]',
      city: 'New Delhi',
      country_code: 'in',
      postal_code: '110001',
    },
    metadata: {
      warehouse_code: 'TM-WH-IN-001',
      timezone: 'Asia/Kolkata',
      country_code: 'IN',
      ships_internationally: false,
      erp_warehouse_id: 'WH002',
    }
  },
  // ... Bangladesh, KSA locations
];
```

### 4.3 Location to Region Routing

When an order is placed, Medusa selects the fulfillment location based on the customer's delivery region:

| Customer Region | Fulfillment Location | Priority |
|---|---|---|
| UAE | loc_uae_dafza | Primary |
| India | loc_in_delhi | Primary → loc_uae_dafza (fallback if OOS) |
| Bangladesh | loc_bd_dhaka | Primary → loc_uae_dafza (fallback) |
| KSA | loc_ksa_riyadh | Primary → loc_uae_dafza (fallback) |
| International | loc_intl_uae | Always |

---

## 5. ERP Integration for Inventory Sync

### 5.1 ERP System Overview

TwinMOS operates an ERP system (SAP Business One or Microsoft Dynamics — confirm with TwinMOS IT) as the authoritative source for physical inventory. The website reads inventory from the ERP but does not write back directly.

**Integration Principle:** The ERP is the master; the website is a read-only consumer of inventory data.

### 5.2 Sync Mechanisms

Two sync mechanisms maintain inventory accuracy:

| Mechanism | Trigger | Frequency | Use Case |
|---|---|---|---|
| Batch Sync | Scheduled job | Every 4h (business hours), every 8h (overnight) | Routine inventory refresh |
| Webhook Sync | ERP event (push) | Real-time on movement | Urgent updates (receiving, shipment confirmation) |

### 5.3 Batch Sync Process

```typescript
// src/jobs/inventory-sync.ts
import { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export default async function inventorySyncJob(container: MedusaContainer) {
  const inventoryModule = container.resolve(Modules.INVENTORY);
  const strapiService = container.resolve('strapiService');
  const logger = container.resolve('logger');

  logger.info('[InventorySync] Starting batch inventory sync');

  try {
    // Step 1: Fetch all InventoryLevel records from Strapi
    const strapiLevels = await strapiService.findMany('inventory-levels', {
      filters: {
        last_synced_at: {
          $gte: getLastSyncTimestamp(), // Only changed records
        }
      },
      pagination: { pageSize: 500 }
    });

    logger.info(`[InventorySync] Found ${strapiLevels.length} inventory level records to sync`);

    // Step 2: Update Medusa inventory levels
    for (const strapiLevel of strapiLevels) {
      try {
        const inventoryItem = await inventoryModule.retrieveInventoryItemByField(
          'sku', strapiLevel.sku
        );

        if (!inventoryItem) {
          logger.warn(`[InventorySync] No Medusa InventoryItem for SKU: ${strapiLevel.sku}`);
          continue;
        }

        // Check existing level in Medusa
        const existingLevels = await inventoryModule.listInventoryLevels({
          inventory_item_id: inventoryItem.id,
          location_id: strapiLevel.location_id,
        });

        if (existingLevels.length > 0) {
          // Update existing level
          await inventoryModule.updateInventoryLevels([{
            inventory_item_id: inventoryItem.id,
            location_id: strapiLevel.location_id,
            stocked_quantity: strapiLevel.quantity_on_hand,
          }]);
        } else {
          // Create new level
          await inventoryModule.createInventoryLevels([{
            inventory_item_id: inventoryItem.id,
            location_id: strapiLevel.location_id,
            stocked_quantity: strapiLevel.quantity_on_hand,
          }]);
        }

        logger.info(`[InventorySync] Updated SKU ${strapiLevel.sku} at ${strapiLevel.location_id}: qty=${strapiLevel.quantity_on_hand}`);

      } catch (itemError) {
        logger.error(`[InventorySync] Failed to sync SKU ${strapiLevel.sku}: ${itemError.message}`);
        // Continue with next item — don't abort entire batch
      }
    }

    logger.info('[InventorySync] Batch sync completed successfully');
    await updateLastSyncTimestamp();

  } catch (error) {
    logger.error(`[InventorySync] Batch sync failed: ${error.message}`);
    await notifySlack('#inventory', `CRITICAL: Inventory sync job failed — ${error.message}`);
    throw error;
  }
}

// Schedule configuration (medusa-config.ts)
export const inventorySyncSchedule = {
  name: 'inventory-sync-job',
  schedule: '0 */4 7-19 * * *', // Every 4h during 7AM-7PM
  handler: inventorySyncJob,
};

export const inventorySyncScheduleOff = {
  name: 'inventory-sync-job-overnight',
  schedule: '0 */8 19-7 * * *', // Every 8h overnight 7PM-7AM
  handler: inventorySyncJob,
};
```

### 5.4 Webhook Sync (ERP Events)

The ERP fires webhooks to the TwinMOS platform when inventory movements occur:

**ERP Events That Trigger Webhooks:**

| ERP Event | Webhook Action | Inventory Impact |
|---|---|---|
| Goods Receipt (purchase order received) | `inventory.received` | stocked_quantity increases |
| Goods Issue (shipment dispatched) | `inventory.issued` | stocked_quantity decreases |
| Stock Adjustment | `inventory.adjusted` | stocked_quantity set to new value |
| Stock Transfer (warehouse to warehouse) | `inventory.transferred` | One location decreases, another increases |
| Sales Order Confirmed (ERP) | `inventory.committed` | No Medusa change (managed by Medusa reservation) |

**Webhook Handler:**

```typescript
// src/api/webhooks/erp-inventory.ts
import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { event, sku, warehouse_id, quantity, timestamp, erp_reference } = req.body;

  // Validate webhook signature (HMAC from ERP)
  const isValid = validateErpWebhookSignature(
    req.headers['x-erp-signature'],
    JSON.stringify(req.body),
    process.env.ERP_WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const inventoryModule = req.scope.resolve('inventory');
  const logger = req.scope.resolve('logger');

  logger.info(`[ERPWebhook] Received ${event} for SKU ${sku}, warehouse ${warehouse_id}, qty ${quantity}`);

  try {
    // Map ERP warehouse_id to Medusa location_id
    const locationId = mapErpWarehouseToLocation(warehouse_id);
    const inventoryItem = await getInventoryItemBySku(inventoryModule, sku);

    if (!inventoryItem) {
      logger.warn(`[ERPWebhook] Unknown SKU: ${sku}`);
      return res.status(200).json({ status: 'skipped', reason: 'unknown_sku' });
    }

    switch (event) {
      case 'inventory.received':
      case 'inventory.adjusted':
        await inventoryModule.updateInventoryLevels([{
          inventory_item_id: inventoryItem.id,
          location_id: locationId,
          stocked_quantity: quantity, // Absolute quantity from ERP
        }]);
        break;

      case 'inventory.transferred':
        const { from_warehouse, to_warehouse, transfer_quantity } = req.body;
        await processTransfer(inventoryModule, inventoryItem.id, from_warehouse, to_warehouse, transfer_quantity);
        break;

      default:
        logger.warn(`[ERPWebhook] Unhandled event: ${event}`);
    }

    // Also update Strapi for consistency
    await updateStrapiInventoryLevel(sku, locationId, quantity);

    // Check if any alerts needed after update
    await checkAndSendStockAlerts(inventoryItem, locationId, quantity);

    res.status(200).json({ status: 'ok', processed_event: event });

  } catch (error) {
    logger.error(`[ERPWebhook] Error processing ${event} for ${sku}: ${error.message}`);
    res.status(500).json({ error: 'Processing failed' });
  }
}
```

### 5.5 Conflict Resolution

When the batch sync and webhook sync might conflict:

| Conflict Scenario | Resolution |
|---|---|
| ERP batch and webhook arrive simultaneously for same SKU | ERP quantity wins; latest timestamp wins |
| Medusa reservation exists; ERP reduces stock below reserved | Alert operations; do not cancel existing reservations automatically |
| Webhook arrives with stale timestamp | Reject if timestamp older than last successful sync |
| ERP system unreachable | Medusa holds last known quantity; no reduction; alert fired |

```typescript
// Conflict resolution logic
async function resolveInventoryConflict(
  medusaLevel: InventoryLevel,
  incomingQuantity: number,
  incomingTimestamp: Date,
  source: 'batch' | 'webhook'
): Promise<void> {
  const lastUpdated = new Date(medusaLevel.updated_at);

  // Reject stale batch updates
  if (source === 'batch' && incomingTimestamp < lastUpdated) {
    logger.warn('Stale batch update rejected — webhook update is newer');
    return;
  }

  const reservedQty = medusaLevel.reserved_quantity;
  if (incomingQuantity < reservedQty) {
    // ERP says less stock than we have reserved for active carts
    await alertOperationsTeam({
      type: 'INVENTORY_CONFLICT',
      sku: medusaLevel.sku,
      erp_quantity: incomingQuantity,
      reserved_quantity: reservedQty,
      message: `ERP reports ${incomingQuantity} units but ${reservedQty} are reserved in active carts`,
    });
    // Still update to ERP quantity — reservations may expire
  }

  await inventoryModule.updateInventoryLevels([{
    inventory_item_id: medusaLevel.inventory_item_id,
    location_id: medusaLevel.location_id,
    stocked_quantity: incomingQuantity,
  }]);
}
```

### 5.6 ERP Sync Monitoring

A Strapi scheduled job monitors the health of the ERP sync:

```typescript
// Monitor: alert if no sync in > 6 hours during business hours
async function checkSyncHealth() {
  const lastSync = await getLastSyncTimestamp();
  const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
  const isBusinessHours = isCurrentlyBusinessHours('Asia/Dubai');

  if (isBusinessHours && hoursSinceSync > 6) {
    await notifySlack('#inventory', `WARNING: ERP inventory sync has not run in ${hoursSinceSync.toFixed(1)} hours`);
    await notifyEmail('operations@twinmos.com', 'ERP Sync Alert', `Inventory sync stalled at ${lastSync.toISOString()}`);
  }
}
```

---

## 6. Stock Status Display

### 6.1 Stock Status Rules

| Status | Condition | Display | Color | Action |
|---|---|---|---|---|
| In Stock | available_quantity > 10 | "In Stock" | Green (#22C55E) | Normal add to cart |
| Low Stock | 1 ≤ available_quantity ≤ 10 | "Only X left in stock" | Amber (#F59E0B) | Normal add to cart; urgency shown |
| Out of Stock | available_quantity = 0 | "Out of Stock" | Red (#EF4444) | Add to cart disabled; notification signup |
| Pre-Order | is_pre_order = true (any quantity) | "Pre-Order" badge | Blue (#3B82F6) | Pre-order add to cart enabled |

### 6.2 Stock Status Calculation

```typescript
// src/utils/inventory.ts
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';

export interface StockDisplay {
  status: StockStatus;
  label: string;
  quantity?: number; // Only shown for low_stock
  color: string;
  purchasable: boolean;
}

export function getStockDisplay(
  availableQuantity: number,
  isPreOrder: boolean,
  variantMetadata?: Record<string, unknown>
): StockDisplay {
  if (isPreOrder) {
    return {
      status: 'pre_order',
      label: `Pre-Order${variantMetadata?.pre_order_availability_date ? ` — Ships ${variantMetadata.pre_order_availability_date}` : ''}`,
      color: '#3B82F6',
      purchasable: true,
    };
  }

  if (availableQuantity <= 0) {
    return {
      status: 'out_of_stock',
      label: 'Out of Stock',
      color: '#EF4444',
      purchasable: false,
    };
  }

  if (availableQuantity <= 10) {
    return {
      status: 'low_stock',
      label: `Only ${availableQuantity} left in stock`,
      quantity: availableQuantity,
      color: '#F59E0B',
      purchasable: true,
    };
  }

  return {
    status: 'in_stock',
    label: 'In Stock',
    color: '#22C55E',
    purchasable: true,
  };
}
```

### 6.3 Stock Status on Product Pages (Astro 5)

```astro
---
// src/components/ProductStockStatus.astro
import { getStockDisplay } from '../utils/inventory';

interface Props {
  availableQuantity: number;
  isPreOrder: boolean;
  variantMetadata?: Record<string, unknown>;
}

const { availableQuantity, isPreOrder, variantMetadata } = Astro.props;
const stockDisplay = getStockDisplay(availableQuantity, isPreOrder, variantMetadata);
---

<div class="stock-status" data-status={stockDisplay.status}>
  <span
    class="stock-indicator"
    style={`color: ${stockDisplay.color}`}
  >
    {stockDisplay.status !== 'out_of_stock' && (
      <span class="stock-dot" style={`background-color: ${stockDisplay.color}`}></span>
    )}
    {stockDisplay.label}
  </span>

  {stockDisplay.status === 'out_of_stock' && (
    <div class="oos-notification-signup">
      <p>Be the first to know when this is back in stock</p>
      <form class="oos-form" action="/api/oos-notify" method="POST">
        <input type="hidden" name="variant_id" value={variantId} />
        <input type="email" name="email" placeholder="Your email" required />
        <button type="submit">Notify Me</button>
      </form>
    </div>
  )}
</div>
```

### 6.4 Location-Specific Stock Display

For customers in a specific region, show stock availability for their region's warehouse:

```typescript
// Get available quantity for customer's region
async function getRegionalAvailability(
  inventoryItemId: string,
  customerRegion: string
): Promise<number> {
  const regionLocationMap: Record<string, string[]> = {
    UAE: ['loc_uae_dafza'],
    IN: ['loc_in_delhi', 'loc_uae_dafza'], // Fallback to UAE
    BD: ['loc_bd_dhaka', 'loc_uae_dafza'],
    SA: ['loc_ksa_riyadh', 'loc_uae_dafza'],
    INTL: ['loc_intl_uae'],
  };

  const locationIds = regionLocationMap[customerRegion] ?? ['loc_uae_dafza'];
  let totalAvailable = 0;

  for (const locationId of locationIds) {
    const levels = await inventoryModule.listInventoryLevels({
      inventory_item_id: inventoryItemId,
      location_id: locationId,
    });
    if (levels.length > 0) {
      totalAvailable += levels[0].stocked_quantity - levels[0].reserved_quantity;
      break; // Use first available location
    }
  }

  return Math.max(0, totalAvailable);
}
```

### 6.5 Out of Stock Notification

When a customer signs up for out-of-stock notification:

```typescript
// Store OOS notification request
await strapi.create('oos-notifications', {
  email: customerEmail,
  variant_id: variantId,
  product_id: productId,
  sku: sku,
  created_at: new Date(),
  notified: false,
});

// When stock returns (triggered by inventory webhook/sync)
async function sendBackInStockNotifications(inventoryItemId: string) {
  const inventoryItem = await inventoryModule.retrieveInventoryItem(inventoryItemId);
  const notifications = await strapi.findMany('oos-notifications', {
    filters: { sku: inventoryItem.sku, notified: false }
  });

  for (const notification of notifications) {
    await resend.emails.send({
      from: 'notifications@twinmos.com',
      to: notification.email,
      subject: `${inventoryItem.title} is back in stock!`,
      react: BackInStockEmail({ productName: inventoryItem.title, productUrl: getProductUrl(inventoryItem) })
    });

    // Mark as notified
    await strapi.update('oos-notifications', notification.id, { notified: true });
  }
}
```

---

## 7. Cart Reservation System

### 7.1 Reservation Overview

When a customer adds an item to their cart and proceeds to checkout, Medusa creates a **reservation** that holds the inventory for that customer:

```
Customer adds to cart → Cart created (no reservation yet)
Customer enters checkout → ReservationItem created (30-minute TTL)
Payment captured → Reservation converted to fulfillment (permanent deduction)
Cart abandoned (30 min timeout) → Reservation released automatically
```

### 7.2 Reservation Creation

```typescript
// Medusa creates reservation when cart moves to checkout
// This happens automatically in Medusa v2 payment flow

// Manual reservation (if needed via API)
const reservation = await inventoryModule.createReservationItems([{
  inventory_item_id: inventoryItem.id,
  location_id: fulfillmentLocationId,
  quantity: lineItem.quantity,
  line_item_id: lineItem.id,
  description: `Cart reservation for order ${cart.id}`,
  // TTL handled via scheduled cleanup job
  metadata: {
    cart_id: cart.id,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
  }
}]);
```

### 7.3 Reservation TTL Enforcement

A scheduled job cleans up expired reservations:

```typescript
// src/jobs/reservation-cleanup.ts
// Runs every 5 minutes
export default async function reservationCleanupJob(container: MedusaContainer) {
  const inventoryModule = container.resolve(Modules.INVENTORY);
  const cartModule = container.resolve(Modules.CART);

  // Find reservations for expired carts
  const reservations = await inventoryModule.listReservationItems({
    // Filter by metadata.expires_at < now
  });

  for (const reservation of reservations) {
    const expiresAt = new Date(reservation.metadata?.expires_at as string);
    if (expiresAt < new Date()) {
      // Check if cart still active
      const cart = await cartModule.retrieveCart(reservation.metadata?.cart_id as string);

      if (!cart || cart.completed_at) {
        // Cart is done or doesn't exist — release reservation
        await inventoryModule.deleteReservationItems([reservation.id]);
        logger.info(`Released expired reservation ${reservation.id} for cart ${reservation.metadata?.cart_id}`);
      }
    }
  }
}
```

### 7.4 Stock Race Condition Handling

When two customers simultaneously attempt to purchase the last unit:

```typescript
// Inventory check at checkout confirmation (Medusa workflow)
async function validateInventoryAtCheckout(cart: Cart): Promise<void> {
  for (const lineItem of cart.items) {
    const available = await getAvailableQuantity(
      lineItem.variant_id,
      fulfillmentLocationId
    );

    if (available < lineItem.quantity) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Insufficient stock for "${lineItem.title}". Only ${available} available, requested ${lineItem.quantity}. Please update your cart.`
      );
    }
  }
}
```

When this error is thrown, the customer sees a clear error message and the cart is updated to reflect the available quantity.

---

## 8. Business Rules

### 8.1 Core Inventory Business Rules

| Rule ID | Rule Description |
|---|---|
| BR-INV-001 | Out-of-stock items cannot be added to cart or purchased (unless explicitly marked as pre-order) |
| BR-INV-002 | If available inventory reaches 0 during an active checkout, the customer receives an error and the cart is updated |
| BR-INV-003 | Low stock threshold is 10 units per SKU per location — triggers internal Slack #inventory alert |
| BR-INV-004 | New product inventory must be seeded in Medusa before the product page is published live |
| BR-INV-005 | Cart reservations expire after 30 minutes of inactivity at checkout |
| BR-INV-006 | ERP is the authoritative source for stocked_quantity — Medusa does not override ERP quantities |
| BR-INV-007 | Medusa is authoritative for reserved_quantity (cart holds) — ERP does not control this |
| BR-INV-008 | A product variant may only be linked to inventory items in locations that serve its sales region |
| BR-INV-009 | Inventory sync failures must not block the website from displaying products (last known stock is shown) |
| BR-INV-010 | Stockout alerts (0 available) are sent to Slack #inventory immediately, not batched |
| BR-INV-011 | Low stock alerts are sent to Slack #inventory at most once per 4 hours per SKU per location |
| BR-INV-012 | Back-in-stock email notifications are sent to subscribed customers within 15 minutes of stock update |
| BR-INV-013 | Inventory data is never exposed publicly at granular levels; only the status (In Stock/Low/OOS) is shown |
| BR-INV-014 | Incoming quantity (PO on order) is displayed to admin but not shown to customers |
| BR-INV-015 | Product bundles (kits) deduct inventory from component items, not from a separate kit SKU |

### 8.2 Low Stock Alert Logic

```typescript
// Low stock and stockout alert system
async function checkAndSendStockAlerts(
  inventoryItem: InventoryItem,
  locationId: string,
  newQuantity: number
): Promise<void> {
  const LOW_STOCK_THRESHOLD = 10;

  if (newQuantity === 0) {
    // Immediate stockout alert
    await notifySlack('#inventory', {
      type: 'STOCKOUT',
      sku: inventoryItem.sku,
      title: inventoryItem.title,
      location: locationId,
      message: `STOCKOUT: ${inventoryItem.title} (${inventoryItem.sku}) is now out of stock at ${locationId}`,
    });
    // Trigger back-in-stock notification prep (mark in Strapi)
    return;
  }

  if (newQuantity <= LOW_STOCK_THRESHOLD) {
    // Rate-limited low stock alert (max once per 4h per SKU per location)
    const alertKey = `low-stock-${inventoryItem.sku}-${locationId}`;
    const lastAlert = await cache.get(alertKey);

    if (!lastAlert) {
      await notifySlack('#inventory', {
        type: 'LOW_STOCK',
        sku: inventoryItem.sku,
        title: inventoryItem.title,
        location: locationId,
        quantity: newQuantity,
        message: `LOW STOCK: ${inventoryItem.title} (${inventoryItem.sku}) has only ${newQuantity} units left at ${locationId}`,
      });
      await cache.set(alertKey, true, 4 * 60 * 60); // 4-hour TTL
    }
  }
}
```

---

## 9. Backorder Handling

### 9.1 Phase 3 Backorder Policy

**Backorders are NOT enabled in Phase 3.** This decision was made to:
- Avoid committing to delivery timelines that depend on uncertain ERP stock replenishment
- Simplify the initial checkout and fulfillment flows
- Prevent customer disappointment from long backorder wait times

**Future consideration (Phase 4):** Backorders may be enabled for specific high-demand products when TwinMOS has reliable supply chain visibility in the ERP.

### 9.2 Alternative to Backorders: Pre-Order

Instead of backorders, TwinMOS uses **Pre-Order** status for products where stock is known to be arriving soon:

| Scenario | Approach |
|---|---|
| New product, stock arriving in 2 weeks | Pre-Order with estimated ship date |
| Popular product, restocking expected | Out of Stock + email notification signup |
| Discontinued product | Out of Stock (permanent); product hidden after 30 days |

---

## 10. Bundle Product Inventory

### 10.1 RAM Kit Bundles

TwinMOS may offer RAM kits (e.g., VOLTX DDR5 2×16GB Kit). Bundle inventory is tracked at the component level:

| Kit SKU | Component SKU | Quantity Per Kit |
|---|---|---|
| VOLTX-DDR5-2X16-KIT | VOLTX-DDR5-16 | 2 |
| VOLTX-DDR5-2X32-KIT | VOLTX-DDR5-32 | 2 |
| TX7-DDR4-2X8-KIT | TX7-DDR4-8 | 2 |

### 10.2 Bundle Availability Calculation

```typescript
// Available quantity for a kit is determined by component availability
async function getBundleAvailability(
  kitVariantId: string,
  locationId: string
): Promise<number> {
  const bundleComponents = await getBundleComponents(kitVariantId);

  let maxKits = Infinity;

  for (const component of bundleComponents) {
    const componentLevel = await inventoryModule.retrieveInventoryLevel(
      component.inventory_item_id,
      locationId
    );
    const componentAvailable = componentLevel.stocked_quantity - componentLevel.reserved_quantity;
    const kitsFromComponent = Math.floor(componentAvailable / component.required_quantity);
    maxKits = Math.min(maxKits, kitsFromComponent);
  }

  return maxKits === Infinity ? 0 : maxKits;
}
```

### 10.3 Bundle Reservation

When a customer purchases a kit:

```typescript
// Reserve component inventory for kit purchase
async function reserveBundleInventory(
  kitVariantId: string,
  kitQuantity: number,
  locationId: string,
  cartLineItemId: string
): Promise<void> {
  const bundleComponents = await getBundleComponents(kitVariantId);

  for (const component of bundleComponents) {
    await inventoryModule.createReservationItems([{
      inventory_item_id: component.inventory_item_id,
      location_id: locationId,
      quantity: component.required_quantity * kitQuantity,
      line_item_id: cartLineItemId,
      description: `Kit reservation: ${kitVariantId} (${kitQuantity} kits)`,
    }]);
  }
}
```

---

## 11. Inventory Reporting

### 11.1 Weekly Low Stock Report

Every Monday at 7:00 AM Dubai time, a low-stock report is emailed to TwinMOS Operations:

```typescript
// src/jobs/weekly-low-stock-report.ts
// Schedule: 0 7 * * 1 (Monday 7AM UTC+4 = 3AM UTC)
export async function generateWeeklyLowStockReport() {
  const inventoryModule = container.resolve(Modules.INVENTORY);

  // Get all inventory levels below threshold
  const allLevels = await inventoryModule.listInventoryLevels({});
  const lowStockItems = [];

  for (const level of allLevels) {
    const available = level.stocked_quantity - level.reserved_quantity;
    const incoming = level.incoming_quantity ?? 0;

    if (available <= 20) { // Report threshold (slightly above alert threshold)
      const inventoryItem = await inventoryModule.retrieveInventoryItem(level.inventory_item_id);
      lowStockItems.push({
        sku: inventoryItem.sku,
        title: inventoryItem.title,
        location: level.location_id,
        stocked: level.stocked_quantity,
        reserved: level.reserved_quantity,
        available,
        incoming,
      });
    }
  }

  // Sort by available quantity ascending (most critical first)
  lowStockItems.sort((a, b) => a.available - b.available);

  await resend.emails.send({
    from: 'reports@twinmos.com',
    to: ['operations@twinmos.com', 'sales@twinmos.com'],
    subject: `TwinMOS Weekly Low Stock Report — ${formatDate(new Date())}`,
    react: LowStockReportEmail({ items: lowStockItems, reportDate: new Date() }),
  });
}
```

### 11.2 Daily Stockout Report

Every morning at 6:00 AM, a stockout report lists all current zero-stock items:

```typescript
// src/jobs/daily-stockout-report.ts
// Schedule: 0 6 * * * (Daily 6AM Dubai time)
export async function generateDailyStockoutReport() {
  const stockoutItems = await getStockoutItems(); // available_quantity = 0

  if (stockoutItems.length === 0) {
    return; // No report needed if no stockouts
  }

  await resend.emails.send({
    from: 'reports@twinmos.com',
    to: ['operations@twinmos.com'],
    subject: `TwinMOS Daily Stockout Report — ${stockoutItems.length} items OOS — ${formatDate(new Date())}`,
    react: StockoutReportEmail({ items: stockoutItems }),
  });
}
```

### 11.3 Inventory Snapshot Report

Monthly inventory snapshot for Finance and Operations:

| Report | Contents | Frequency | Recipients |
|---|---|---|---|
| Weekly Low Stock | Items with ≤20 units available | Weekly (Monday) | Operations, Sales |
| Daily Stockout | Items with 0 available | Daily (06:00 AM) | Operations |
| Monthly Snapshot | Full inventory count by SKU and location | 1st of month | Operations, Finance |
| ERP Sync Health | Sync success/failure log | Daily | IT Admin |

---

## 12. Medusa.js Inventory Module Configuration

### 12.1 Module Configuration

```typescript
// medusa-config.ts
import { defineConfig, Modules } from '@medusajs/framework/utils';

export default defineConfig({
  modules: [
    {
      resolve: '@medusajs/medusa/inventory-next',
      options: {
        // Use default Medusa inventory module (Postgres-backed)
      }
    },
    {
      resolve: '@medusajs/medusa/stock-location-next',
      options: {
        // Default stock location module
      }
    },
  ],
  // ... other config
});
```

### 12.2 Inventory Item Seeding

```typescript
// src/scripts/seed-inventory.ts
export async function seedInventoryItems(container: MedusaContainer) {
  const inventoryModule = container.resolve(Modules.INVENTORY);
  const locationIds = await getStockLocationIds(container);

  const products = [
    {
      sku: 'VOLTX-DDR5-16',
      title: 'VOLTX DDR5 16GB',
      description: 'TwinMOS VOLTX DDR5 16GB 4800MHz',
      weight: 120, // packaged weight in grams
      length: 16, height: 8, width: 4,
      hs_code: '8473.30',
      origin_country: 'TW',
      metadata: { erp_item_code: 'TM-DDR5-16-V1', is_pre_order: false }
    },
    {
      sku: 'COREX-GEN5-1TB',
      title: 'CoreX Pro Gen5 NVMe 1TB',
      description: 'TwinMOS CoreX Pro Gen5 NVMe SSD 1TB',
      weight: 75,
      length: 12, height: 8, width: 3,
      hs_code: '8471.70',
      origin_country: 'TW',
      metadata: { erp_item_code: 'TM-NVME-G5-1T', is_pre_order: false }
    },
    // ... all products
  ];

  for (const product of products) {
    const inventoryItem = await inventoryModule.createInventoryItems([{
      sku: product.sku,
      title: product.title,
      description: product.description,
      weight: product.weight,
      length: product.length,
      height: product.height,
      width: product.width,
      hs_code: product.hs_code,
      origin_country: product.origin_country,
      metadata: product.metadata,
    }]);

    // Set initial inventory levels per location
    await inventoryModule.createInventoryLevels([
      { inventory_item_id: inventoryItem[0].id, location_id: locationIds.uae, stocked_quantity: 0 },
      { inventory_item_id: inventoryItem[0].id, location_id: locationIds.india, stocked_quantity: 0 },
      { inventory_item_id: inventoryItem[0].id, location_id: locationIds.bangladesh, stocked_quantity: 0 },
      { inventory_item_id: inventoryItem[0].id, location_id: locationIds.ksa, stocked_quantity: 0 },
    ]);

    console.log(`Seeded inventory item: ${product.sku}`);
  }
}
```

### 12.3 Linking Variants to Inventory Items

```typescript
// Link product variants to inventory items after seeding
async function linkVariantsToInventoryItems(container: MedusaContainer) {
  const productModule = container.resolve(Modules.PRODUCT);
  const inventoryModule = container.resolve(Modules.INVENTORY);
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

  // Get all products with variants
  const products = await productModule.listProducts({}, { relations: ['variants'] });

  for (const product of products) {
    for (const variant of product.variants) {
      // Find matching inventory item by SKU
      const inventoryItems = await inventoryModule.listInventoryItems({ sku: [variant.sku] });

      if (inventoryItems.length === 0) {
        console.warn(`No inventory item found for SKU: ${variant.sku}`);
        continue;
      }

      // Create the link between variant and inventory item
      await remoteLink.create({
        [Modules.PRODUCT]: { variant_id: variant.id },
        [Modules.INVENTORY]: { inventory_item_id: inventoryItems[0].id },
      });

      console.log(`Linked variant ${variant.sku} to inventory item ${inventoryItems[0].id}`);
    }
  }
}
```

---

## 13. API Endpoints

### 13.1 Store API — Inventory Availability

```typescript
// GET /store/inventory/availability?variant_ids=var1,var2&region=UAE
// Returns availability for multiple variants in a region

// Response:
{
  "availability": [
    {
      "variant_id": "var_01JX...",
      "sku": "VOLTX-DDR5-16",
      "status": "in_stock",
      "available_quantity": 45,
      "label": "In Stock",
      "purchasable": true
    },
    {
      "variant_id": "var_01JY...",
      "sku": "ELITE-SATA-1TB",
      "status": "low_stock",
      "available_quantity": 3,
      "label": "Only 3 left in stock",
      "purchasable": true
    }
  ]
}
```

### 13.2 Store API — OOS Notification Signup

```typescript
// POST /store/inventory/oos-notify
// Request:
{
  "email": "customer@example.com",
  "variant_id": "var_01JX...",
  "product_id": "prod_01JX..."
}

// Response:
{
  "success": true,
  "message": "You will be notified when this item is back in stock"
}
```

### 13.3 Admin API — Inventory Level Update (Manual)

```typescript
// POST /admin/inventory-items/{id}/location-levels/{location_id}
// Auth: Medusa admin JWT required

// Request:
{
  "stocked_quantity": 100,
  "incoming_quantity": 50
}

// Response: Updated InventoryLevel object
```

### 13.4 Webhook — ERP Inventory Update

```
POST /api/webhooks/erp-inventory
Headers:
  x-erp-signature: HMAC-SHA256 signature
  Content-Type: application/json

Body:
{
  "event": "inventory.received",
  "sku": "VOLTX-DDR5-16",
  "warehouse_id": "WH001",
  "quantity": 500,
  "timestamp": "2026-05-01T10:00:00Z",
  "erp_reference": "GRN-2026-001234"
}
```

---

## 14. Admin Inventory Management

### 14.1 Medusa Admin — Inventory View

**Navigation:** Medusa Admin → Inventory

**Inventory List View:**
- Table of all inventory items with SKU, title, total stocked, total reserved, total available
- Filter by location, stock status (in stock / low stock / out of stock)
- Search by SKU or product name
- Click-through to item detail

**Inventory Item Detail View:**
- All locations with stock levels (stocked / reserved / available / incoming)
- Edit stocked_quantity (manual adjustment — requires audit note)
- View reservation history
- View sync history (last ERP update)
- Link to product variant

### 14.2 Manual Inventory Adjustment

When warehouse staff need to manually adjust stock (damaged goods, miscounting):

```typescript
// Admin manual adjustment via Medusa API
// POST /admin/inventory-items/{id}/location-levels/{location_id}
{
  "stocked_quantity": newQuantity,
  // Note: this is an absolute set, not a delta
}

// Audit trail: all manual adjustments logged to Strapi
interface InventoryAdjustmentLog {
  inventory_item_id: string;
  location_id: string;
  previous_quantity: number;
  new_quantity: number;
  reason: string; // Required: "damaged", "miscounting", "write-off", "correction"
  adjusted_by: string; // Admin user ID
  adjusted_at: Date;
  erp_reference?: string; // ERP adjustment document reference
}
```

### 14.3 New Product Inventory Checklist

Before a new product can be published on the website:

- [ ] Inventory item created in Medusa with correct SKU
- [ ] Inventory item linked to product variant
- [ ] Inventory levels created for all relevant locations (set to 0)
- [ ] ERP item code mapped in metadata
- [ ] Initial stock quantity received and synced from ERP
- [ ] Stock status verified on product preview page
- [ ] Low stock threshold confirmed (default: 10 units)

---

## 15. Performance Requirements

| Requirement | Target | Priority |
|---|---|---|
| Inventory availability check (single SKU) | < 200ms | Must Have |
| Inventory availability check (batch, up to 20 SKUs) | < 500ms | Must Have |
| ERP webhook processing time | < 2 seconds | Must Have |
| Batch sync job completion (all SKUs) | < 10 minutes | Should Have |
| Back-in-stock notification delivery | < 15 minutes of stock update | Should Have |
| Cart reservation creation | < 300ms | Must Have |
| Reservation cleanup job | < 5 minutes run time | Should Have |
| Inventory data cache TTL (product pages) | 60 seconds (Astro SSR cache) | Should Have |

---

## 16. Test Scenarios

### 16.1 ERP Sync Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| INV-SYNC-001 | Batch sync runs with valid ERP data | Medusa inventory levels updated correctly |
| INV-SYNC-002 | ERP webhook fires for goods received | Medusa stocked_quantity updated within 2 seconds |
| INV-SYNC-003 | ERP sends stale timestamp webhook | Webhook rejected; no Medusa update |
| INV-SYNC-004 | ERP unreachable for 6 hours | Slack alert fired; last known inventory displayed |
| INV-SYNC-005 | ERP quantity lower than Medusa reserved | Alert fired; Medusa not auto-cancelled |

### 16.2 Stock Status Display Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| INV-DISPLAY-001 | Product with 50 available units | Shows "In Stock" (green) |
| INV-DISPLAY-002 | Product with 5 available units | Shows "Only 5 left in stock" (amber) |
| INV-DISPLAY-003 | Product with 0 available units | Shows "Out of Stock" (red) + notification form |
| INV-DISPLAY-004 | Pre-order product | Shows "Pre-Order" badge (blue) + availability date |
| INV-DISPLAY-005 | Regional availability (India customer, UAE fallback) | Shows India stock; falls back to UAE if India OOS |

### 16.3 Cart Reservation Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| INV-CART-001 | Customer adds last unit; another customer tries to add same | Second customer sees "Out of Stock" |
| INV-CART-002 | Cart expires after 30 min | Reservation released; stock available again |
| INV-CART-003 | Customer completes checkout | Reservation converted to fulfillment; permanent deduction |
| INV-CART-004 | Customer cancels order | Reservation reversed; stock restored |

### 16.4 Alert Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| INV-ALERT-001 | Stock drops to 8 units | Low stock Slack alert sent to #inventory |
| INV-ALERT-002 | Low stock alert sent; stock stays low for 4 hours | No second alert (rate limited) |
| INV-ALERT-003 | Stock drops to 0 | Immediate Slack #inventory alert (no rate limit for stockout) |
| INV-ALERT-004 | Stock restored from 0 to 20 | Back-in-stock emails sent to subscribers within 15 minutes |

---

## 17. Acceptance Criteria

| ID | Criterion | Priority |
|---|---|---|
| AC-INV-001 | Inventory levels sync from ERP to Medusa at least every 4 hours during business hours | Must Have |
| AC-INV-002 | ERP webhook updates Medusa inventory within 2 seconds of event receipt | Must Have |
| AC-INV-003 | Out-of-stock items cannot be purchased at checkout | Must Have |
| AC-INV-004 | Cart reservations expire after 30 minutes and are cleaned up automatically | Must Have |
| AC-INV-005 | Low stock (≤10 units) triggers Slack #inventory alert | Must Have |
| AC-INV-006 | Stockout triggers immediate Slack #inventory alert | Must Have |
| AC-INV-007 | Back-in-stock emails reach subscribed customers within 15 minutes | Should Have |
| AC-INV-008 | New products require inventory seeding before being published | Must Have |
| AC-INV-009 | Inventory availability check completes in < 200ms per SKU | Must Have |
| AC-INV-010 | Admin can manually adjust inventory quantities with audit logging | Must Have |
| AC-INV-011 | Bundle/kit inventory correctly deducts from component items | Should Have |
| AC-INV-012 | Weekly low-stock report delivered every Monday morning | Should Have |
| AC-INV-013 | Daily stockout report delivered every morning when items are OOS | Should Have |

---

## 18. Business Rules Reference

| Rule ID | Rule Description |
|---|---|
| BR-INV-001 | Out-of-stock items cannot be added to cart or purchased (except pre-orders) |
| BR-INV-002 | If inventory reaches 0 during active checkout, customer receives an error and cart updates |
| BR-INV-003 | Low stock threshold is 10 units — triggers Slack #inventory alert |
| BR-INV-004 | New product inventory must be seeded before product page goes live |
| BR-INV-005 | Cart reservations expire after 30 minutes of inactivity at checkout |
| BR-INV-006 | ERP is authoritative for stocked_quantity; Medusa does not override ERP values |
| BR-INV-007 | Medusa is authoritative for reserved_quantity; ERP does not control cart holds |
| BR-INV-008 | Product variants are only linked to inventory items in locations serving their region |
| BR-INV-009 | Inventory sync failures do not block the website; last known stock is displayed |
| BR-INV-010 | Stockout alerts (0 available) are sent immediately to Slack #inventory |
| BR-INV-011 | Low stock Slack alerts are rate-limited to one per 4 hours per SKU per location |
| BR-INV-012 | Back-in-stock emails are sent within 15 minutes of stock update |
| BR-INV-013 | Only stock status (In Stock / Low Stock / Out of Stock) is publicly visible; not exact quantities (except Low Stock count) |
| BR-INV-014 | Incoming/PO quantity is visible in admin only |
| BR-INV-015 | Kit/bundle inventory deducts from component items using required_quantity per kit |

---

*Document End — TWN-P3-INV-2026-001 v1.0*
*TwinMOS Technologies — Confidential*
