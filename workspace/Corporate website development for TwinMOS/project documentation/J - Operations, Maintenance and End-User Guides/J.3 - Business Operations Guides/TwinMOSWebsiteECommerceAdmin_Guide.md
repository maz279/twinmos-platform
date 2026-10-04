# TwinMOS Website — E-Commerce Administration Guide

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-037 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS E-Commerce Operations / IT |
| **Audience** | E-Commerce Managers, Product Administrators, Finance Team, IT Operations |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §9), TWN-URD-2025-002 (URD §7), TWN-OPS-2026-038 (Order Fulfillment Process), TWN-OPS-2026-039 (Refund & Cancellation Process) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide defines the operational procedures for administering the TwinMOS e-commerce platform (Phase 3, Medusa.js). It covers:

- Product catalog management
- Pricing and promotion administration
- Inventory management
- Order management and oversight
- Customer account administration
- Payment and transaction monitoring
- Store configuration and settings
- Reporting and analytics

**Scope:** All administrative activities for the TwinMOS direct-to-consumer online store.

---

## 2. E-Commerce Platform Overview

### 2.1 Technology Stack (Phase 3)

| Component | Technology | Purpose |
|:---|:---|:---|
| E-Commerce Engine | Medusa.js v2 | Core commerce platform |
| Frontend Storefront | Astro + React islands | Customer-facing store |
| Payment Processing | Stripe + PayPal | Payment acceptance |
| Inventory Management | Medusa + ERP integration | Stock tracking |
| Shipping | Carrier APIs (DHL, FedEx, local) | Label generation, tracking |
| Tax Calculation | TaxJar / Avalara | Automated tax computation |
| Email Notifications | Medusa notifications + SendGrid | Order confirmations, updates |

### 2.2 Admin Access Levels

| Role | Permissions |
|:---|:---|
| **E-Commerce Admin** | Full access to all store functions |
| **Product Manager** | Catalog, pricing, promotions, inventory |
| **Order Manager** | Orders, fulfillment, refunds, customer service |
| **Finance Viewer** | Transactions, reports, read-only order access |
| **Support Agent** | Order lookup, status updates, basic customer actions |

---

## 3. Product Catalog Management

### 3.1 Product Creation

**Required Fields:**

| Field | Description | Example |
|:---|:---|:---|
| Product Title | Display name | "TwinMOS DDR5 32GB 5600MHz Desktop Memory" |
| Handle | URL-friendly identifier | `ddr5-32gb-5600mhz-desktop` |
| Description | Rich text product description | Full specs and features |
| Product Type | Category | Memory / SSD / USB / Card / Peripheral |
| Collection | Grouping | DDR5 Memory / NVMe SSDs |
| Tags | Search/filter keywords | `gaming`, `high-performance`, `rgb` |
| Images | Product photos | Min 3 images (front, angle, detail) |
| Variants | SKU-level options | Capacity, speed, color |
| Options | Variant dimensions | Capacity: 16GB / 32GB / 64GB |

**Variant Fields:**

| Field | Description |
|:---|:---|
| SKU | Unique stock code |
| Barcode / EAN | Global trade identifier |
| Inventory quantity | Stock on hand |
| Allow backorders | Yes / No |
| Manage inventory | Yes / No |
| Material, Weight, Dimensions | Shipping calculation |
| Prices | By currency and region |

### 3.2 Product Updates

| Update Type | Process | Notes |
|:---|:---|:---|
| Price change | Edit variant price, set effective date | Log reason for audit |
| Description update | Edit product, save | Version history tracked |
| Image update | Upload new, remove old | Maintain alt text for accessibility |
| Stock adjustment | Update inventory quantity | Requires reason code |
| Product discontinuation | Set status to "Draft" or add "Discontinued" tag | Keep for order history |
| New variant launch | Add variant to existing product | Update related products |

### 3.3 Bulk Operations

| Operation | Tool | Use Case |
|:---|:---|:---|
| Bulk price update | CSV import / Medusa admin | Seasonal pricing, promotions |
| Bulk inventory update | CSV import / API | Stock count adjustments |
| Bulk product import | CSV import | New product line launch |
| Bulk image upload | Media library bulk upload | Product photography batch |
| Bulk tag/collection update | CSV import | Categorization changes |

---

## 4. Pricing and Promotions

### 4.1 Price Management

| Price Type | Description | Management |
|:---|:---|:---|
| Base price | Standard selling price | Product variant |
| Sale price | Temporary discounted price | Product variant + date range |
| Regional price | Currency/region-specific | Price list per region |
| Tier price | Volume discount (B2B) | Customer group pricing |
| MSRP | Manufacturer's suggested retail | Display only |

### 4.2 Promotion Types

| Promotion | Configuration | Example |
|:---|:---|:---|
| Percentage discount | % off cart or items | "10% off all SSDs" |
| Fixed amount discount | $ off cart or items | "$20 off orders over $100" |
| Free shipping | Shipping method discount | "Free shipping on orders $50+" |
| Buy X Get Y | Conditional free item | "Buy 2 memory modules, get 1 free" |
| Bundle discount | Combined product discount | "Gaming bundle: RAM + SSD for $199" |
| Coupon code | Customer-entered code | "SUMMER2026 for 15% off" |

### 4.3 Creating a Promotion

1. Navigate to Promotions → Create New
2. Select promotion type
3. Define conditions (minimum cart value, product eligibility, customer group)
4. Define application (discount amount, free item, shipping)
5. Set validity period (start date, end date, or ongoing)
6. Set usage limits (total redemptions, per customer)
7. Save and activate

---

## 5. Inventory Management

### 5.1 Stock Tracking

| Metric | Source | Update Frequency |
|:---|:---|:---|
| Available inventory | Medusa inventory module | Real-time (sales) / Daily (receipts) |
| Reserved inventory | Orders in "Pending" status | Real-time |
| Incoming stock | Purchase orders | As updated by procurement |
| Safety stock threshold | Configured per SKU | Manual setting |

### 5.2 Inventory Alerts

| Alert Type | Trigger | Notification |
|:---|:---|:---|
| Low stock | Available < safety stock threshold | Email to Product Manager |
| Out of stock | Available = 0 | Email + storefront "Out of Stock" display |
| Overstock | Available > 6 months of sales | Monthly report to Planning |
| Discrepancy | System vs. physical count mismatch | Immediate alert after stocktake |

### 5.3 Stock Adjustments

| Reason Code | Use Case | Authorization |
|:---|:---|:---|
| Physical count | Stocktake correction | Warehouse supervisor |
| Damaged goods | Unsellable inventory | QC + Warehouse manager |
| Return to vendor | Defective batch return | Procurement |
| Internal use | Samples, marketing, RMA replacements | E-Commerce Manager |
| Initial setup | New product launch stock | E-Commerce Admin |

---

## 6. Order Management

### 6.1 Order Status Lifecycle

| Status | Definition | Trigger |
|:---|:---|:---|
| **Pending** | Order placed, payment pending | Customer checkout |
| **Awaiting Payment** | Payment initiated, not confirmed | Payment gateway |
| **Paid** | Payment confirmed | Payment gateway confirmation |
| **Processing** | Order being prepared | Manual or auto (paid orders) |
| **Shipped** | Order dispatched, tracking available | Fulfillment team |
| **Delivered** | Carrier confirms delivery | Tracking webhook |
| **Cancelled** | Order cancelled | Customer or admin action |
| **Refunded** | Refund processed | Finance action |
| **On Hold** | Awaiting verification or stock | Admin action |

### 6.2 Order Actions

| Action | Who | How | Notes |
|:---|:---|:---|:---|
| View order details | Any admin role | Click order ID | Full customer, item, payment, shipping info |
| Edit order | Order Manager | Edit function | Limited edits (address, items before processing) |
| Cancel order | Order Manager | Cancel button | Requires reason; auto-refund if paid |
| Issue refund | Order Manager + Finance | Refund function | Partial or full; linked to payment method |
| Resend confirmation | Support Agent | Email action | To customer email on file |
| Add internal note | Any admin | Private note | Not visible to customer |
| Export order | Any admin | Export function | CSV or PDF |

### 6.3 Fraud Review

| Indicator | Action |
|:---|:---|
| Billing/shipping address mismatch | Hold for verification |
| High-value order + first-time customer | Hold for verification |
| Multiple failed payment attempts | Auto-cancel + flag |
| IP geolocation mismatch | Hold for verification |
| Known fraudulent email/domain | Auto-cancel + block |
| Velocity check (>3 orders in 1 hour) | Hold for review |

---

## 7. Customer Account Administration

### 7.1 Customer Lookup

Search by: Email, name, phone, order number, or customer ID.

### 7.2 Account Actions

| Action | Authorization | Notes |
|:---|:---|:---|
| View profile | Support Agent+ | Order history, addresses, preferences |
| Edit profile | Order Manager+ | Correct errors, update contact info |
| Reset password | Support Agent | Send reset link; do not set manually |
| Merge accounts | E-Commerce Admin | Duplicate accounts from different emails |
| Deactivate account | E-Commerce Admin | Soft delete; preserve order history |
| Add store credit | E-Commerce Admin | Goodwill gesture or refund alternative |
| Update customer group | E-Commerce Admin | B2B tier changes, VIP status |

---

## 8. Payment and Transaction Monitoring

### 8.1 Payment Methods

| Method | Status | Configuration |
|:---|:---|:---|
| Credit/Debit Card (Stripe) | Active | Visa, Mastercard, Amex |
| PayPal | Active | Standard checkout |
| Bank Transfer | B2B only | Manual verification required |
| Buy Now Pay Later | Phase 3+ | Klarna / Afterpay (future) |

### 8.2 Transaction Monitoring

| Check | Frequency | Action on Issue |
|:---|:---|:---|
| Payment gateway health | Real-time | Escalate to IT if downtime |
| Failed payment rate | Daily | >5% triggers investigation |
| Refund volume | Daily | Unusual spike triggers review |
| Chargeback rate | Weekly | >1% triggers fraud review |
| Settlement reconciliation | Daily | Match gateway to bank deposits |

---

## 9. Reporting and Analytics

| Report | Frequency | Owner | Key Metrics |
|:---|:---|:---|:---|
| Sales summary | Daily | E-Commerce Manager | Revenue, orders, AOV, conversion rate |
| Product performance | Weekly | Product Manager | Units sold, revenue, returns by SKU |
| Inventory status | Weekly | Operations | Stock levels, turnover, low stock alerts |
| Customer acquisition | Monthly | Marketing | New customers, CAC, channel attribution |
| Promotion effectiveness | Per campaign | Marketing | Redemption rate, incremental revenue |
| Financial reconciliation | Monthly | Finance | Payments, refunds, fees, net revenue |
| Abandoned cart analysis | Weekly | E-Commerce Manager | Cart value, recovery rate, reasons |

---

## 10. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| E-Commerce Manager | | | |
| Finance Lead | | | |
| IT Operations | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteECommerceAdmin_Guide.md`
