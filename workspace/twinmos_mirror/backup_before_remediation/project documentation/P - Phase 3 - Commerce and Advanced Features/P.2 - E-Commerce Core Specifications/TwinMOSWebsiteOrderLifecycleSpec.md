# Order Lifecycle Specification
## TwinMOS Technologies Corporate Website — Phase 3

| Field | Value |
|---|---|
| Document Reference | TWN-P3-ORDER-2026-001 |
| Version | 1.0 |
| Date | 2026-05-01 |
| Author | TwinMOS Web Platform Team |
| Status | Draft for Review |
| Phase | Phase 3 — Commerce and Advanced Features |
| Module | P.2 — E-Commerce Core Specifications |

---

## Table of Contents

1. [Overview and Purpose](#1-overview-and-purpose)
2. [Order State Machine](#2-order-state-machine)
3. [Order Data Model](#3-order-data-model)
4. [Order ID Format](#4-order-id-format)
5. [Email Notifications](#5-email-notifications)
6. [Customer-Facing Order Tracking](#6-customer-facing-order-tracking)
7. [Guest Order Tracking](#7-guest-order-tracking)
8. [Admin Order Management](#8-admin-order-management)
9. [Cancellation Policy](#9-cancellation-policy)
10. [Return Policy](#10-return-policy)
11. [Refund Processing](#11-refund-processing)
12. [Fraud Detection](#12-fraud-detection)
13. [Order Data Retention](#13-order-data-retention)
14. [Order Analytics](#14-order-analytics)
15. [Medusa.js Order Configuration](#15-medusajs-order-configuration)
16. [Test Scenarios](#16-test-scenarios)
17. [Acceptance Criteria](#17-acceptance-criteria)
18. [Business Rules Reference](#18-business-rules-reference)

---

## 1. Overview and Purpose

### 1.1 Document Scope

This specification defines the complete order lifecycle for the TwinMOS Technologies e-commerce platform. It covers the order state machine, all state transitions, email notifications, customer-facing order tracking, admin management, cancellation and return policies, fraud detection, and analytics.

### 1.2 Business Context

An order in the TwinMOS platform begins when a customer completes payment for products and ends when either:
- The order is delivered and confirmed complete, or
- The order is refunded and closed following a return or cancellation

The order lifecycle must be transparent to customers at every stage, provide operations staff with the tools to manage exceptions, and comply with regional regulatory retention requirements.

### 1.3 Key Design Principles

- **Clarity:** Customers always know the state of their order
- **Automation:** State transitions trigger automatic notifications without manual intervention
- **Auditability:** Every state transition is logged with timestamp and actor
- **Compliance:** Order records are retained per regional legal requirements
- **Flexibility:** Operations staff can manually intervene in any state for exception handling

### 1.4 Stakeholders

| Stakeholder | Role |
|---|---|
| TwinMOS Customer Service | Primary user of order management tools |
| TwinMOS Operations / Warehouse | Fulfillment and dispatch |
| TwinMOS Finance | Refund authorization, revenue reporting |
| Platform Engineering | Order module implementation |
| Customers (B2C) | Order status visibility |
| Business Customers (B2B) | Purchase and invoice requirements |

---

## 2. Order State Machine

### 2.1 State Overview

```
                          ┌─────────────────────┐
                          │       PENDING        │
                          │  Payment initiated   │
                          └────────┬────────┬────┘
                                   │        │
                     Payment OK    │        │  Payment Failed
                                   │        │
                    ┌──────────────▼──┐   ┌─▼──────────────┐
                    │ PAYMENT_CAPTURED│   │  PAYMENT_FAILED │
                    │ Payment success │   │   Try again or  │
                    └──────┬──────────┘   │    abandon      │
                           │              └────────┬────────┘
                           │                       │
                     Ops   │ processes             │ Customer retries
                           │                       ▼
                    ┌──────▼──────────┐       (back to pending)
                    │   PROCESSING   │
                    │ Warehouse picks │
                    │ and packs       │
                    └──────┬──────────┘
                           │
                    Carrier │ pickup
                           │
                    ┌──────▼──────────────┐
                    │ FULFILLMENT_CREATED │
                    │  Label generated    │
                    │  Tracking assigned  │
                    └──────┬──────────────┘
                           │
                  Carrier  │ scans
                           │
                    ┌──────▼──────────┐
                    │    SHIPPED      │
                    │ In transit with │
                    │    carrier      │
                    └──────┬──────────┘
                           │
               Delivered   │ to customer
                           │
                    ┌──────▼──────────┐
                    │   DELIVERED     │
                    │ Delivery        │
                    │ confirmed       │
                    └──────┬──────────┘
                           │
             Auto-complete │ after 7 days
                           │
                    ┌──────▼──────────┐    Return      ┌─────────────────────┐
                    │   COMPLETED     │────requested──▶│  RETURN_REQUESTED   │
                    └─────────────────┘                └──────┬──────────────┘
                                                              │
                                                    In transit│
                                                              │
                                                       ┌──────▼──────────────┐
                                                       │  RETURN_IN_TRANSIT  │
                                                       └──────┬──────────────┘
                                                              │
                                                    Received  │
                                                              │
                                                       ┌──────▼──────────────┐
                                                       │  RETURN_RECEIVED    │
                                                       └──────┬──────────────┘
                                                              │
                                                    Processed │
                                                              │
                                                       ┌──────▼──────────────┐
                                                       │     REFUNDED        │
                                                       └─────────────────────┘

Any state ──────────────── (within 2h, unpacked) ──────▶ CANCELED
```

### 2.2 State Definitions

| State | Code | Description | Actor |
|---|---|---|---|
| Pending | `pending` | Payment initiated; awaiting capture confirmation | System |
| Payment Captured | `payment_captured` | Payment successfully captured; order confirmed | Stripe |
| Payment Failed | `payment_failed` | Payment attempt failed | Stripe |
| Processing | `processing` | Warehouse has received the order; picking and packing | Operations |
| Fulfillment Created | `fulfillment_created` | Carrier label generated; tracking number assigned | Operations |
| Shipped | `shipped` | Package handed to carrier; in transit | Carrier |
| Delivered | `delivered` | Package confirmed delivered | Carrier / Customer |
| Completed | `completed` | Order fully completed (auto, 7 days post-delivery) | System |
| Canceled | `canceled` | Order canceled before shipment | Customer / Admin |
| Return Requested | `return_requested` | Customer has initiated a return | Customer |
| Return in Transit | `return_in_transit` | Return package shipped to TwinMOS | Customer / Carrier |
| Return Received | `return_received` | TwinMOS has received the returned goods | Warehouse |
| Refunded | `refunded` | Refund issued to customer payment method | Finance / System |

### 2.3 State Transition Rules

| From State | To State | Trigger | Actor | Conditions |
|---|---|---|---|---|
| — | pending | Customer initiates checkout | Customer | Valid cart |
| pending | payment_captured | Stripe payment webhook: `payment_intent.succeeded` | Stripe (auto) | — |
| pending | payment_failed | Stripe payment webhook: `payment_intent.payment_failed` | Stripe (auto) | — |
| payment_failed | pending | Customer retries payment | Customer | Within 24h |
| payment_captured | processing | Admin acknowledges order | Admin | — |
| payment_captured | canceled | Customer cancels | Customer | Within 2h of placement |
| processing | fulfillment_created | Admin creates fulfillment with tracking | Admin | — |
| processing | canceled | Admin cancels | Admin | Before fulfillment; 50% restocking fee |
| fulfillment_created | shipped | Carrier scans package | Carrier / Admin | — |
| shipped | delivered | Carrier confirms delivery | Carrier (webhook) / Admin | — |
| delivered | completed | Automatic after 7 days | System | No return request within 7 days |
| delivered | return_requested | Customer initiates return | Customer | Within 7 days of delivery |
| completed | return_requested | Customer initiates return | Customer | Within 30 days (defective only) |
| return_requested | return_in_transit | Customer ships return | Customer | — |
| return_in_transit | return_received | Warehouse logs receipt | Warehouse admin | — |
| return_received | refunded | Finance approves and issues refund | Finance / System | — |
| any state | canceled | Admin force cancels | Admin | With reason; may require manual refund |

### 2.4 State Transition Implementation (Medusa Workflows)

```typescript
// src/workflows/order-state-machine.ts
import { createWorkflow, createStep, WorkflowResponse } from '@medusajs/framework/workflows-sdk';
import { Modules } from '@medusajs/framework/utils';

// Step: Mark order as processing
const markOrderProcessingStep = createStep(
  'mark-order-processing',
  async ({ orderId }: { orderId: string }, { container }) => {
    const orderModule = container.resolve(Modules.ORDER);

    await orderModule.updateOrders([{
      id: orderId,
      status: 'processing',
    }]);

    // Send processing notification email
    const notificationModule = container.resolve(Modules.NOTIFICATION);
    await notificationModule.createNotifications([{
      to: order.email,
      channel: 'email',
      template: 'order-processing',
      data: { orderId },
    }]);
  }
);

// Step: Create fulfillment and mark as shipped
const markOrderShippedStep = createStep(
  'mark-order-shipped',
  async ({
    orderId,
    trackingNumber,
    carrier,
    trackingUrl,
  }: {
    orderId: string;
    trackingNumber: string;
    carrier: string;
    trackingUrl: string;
  }, { container }) => {
    const orderModule = container.resolve(Modules.ORDER);
    const order = await orderModule.retrieveOrder(orderId, { relations: ['fulfillments'] });

    // Update fulfillment with tracking
    await orderModule.updateFulfillments([{
      id: order.fulfillments[0].id,
      tracking_links: [{
        tracking_number: trackingNumber,
        url: trackingUrl,
      }],
      shipped_at: new Date(),
    }]);

    await orderModule.updateOrders([{
      id: orderId,
      status: 'shipped',
      metadata: {
        carrier,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        shipped_at: new Date().toISOString(),
      }
    }]);
  }
);
```

---

## 3. Order Data Model

### 3.1 Medusa Order Object

```typescript
interface TwinMOSOrder {
  // Medusa Order fields
  id: string; // Internal UUID (e.g., "order_01JX...")
  display_id: number; // Sequential number for display
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;

  // Customer
  customer_id: string | null; // null for guest orders
  email: string;

  // Addresses
  shipping_address: OrderAddress;
  billing_address: OrderAddress;

  // Items
  items: LineItem[]; // {variant_id, title, quantity, unit_price, total, thumbnail, metadata}
  discounts: Discount[];
  gift_cards: GiftCard[];

  // Pricing
  currency_code: string; // 'aed' | 'inr' | 'bdt' | 'sar' | 'usd'
  subtotal: number; // In minor currency units (fils, paise, etc.)
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  total: number;

  // Payment
  payment_collection: PaymentCollection; // Stripe PaymentIntent
  payments: Payment[];

  // Fulfillment
  fulfillments: Fulfillment[]; // {id, tracking_links, items, created_at, shipped_at}

  // Returns/Refunds
  returns: Return[];
  refunds: Refund[];

  // TwinMOS metadata
  metadata: {
    order_display_id: string; // 'TM-2026-00001234'
    region: string; // 'UAE' | 'IN' | 'BD' | 'SA' | 'INTL'
    invoice_id: string; // Strapi invoice record ID
    invoice_number: string; // 'TM-INV-UAE-2026-00001234'
    invoice_pdf_url: string; // Backblaze B2 signed URL
    fraud_reviewed: boolean;
    fraud_review_required: boolean;
    rma_number?: string; // Return Merchandise Authorization
    cancellation_reason?: string;
    cancellation_actor?: string; // 'customer' | 'admin' | 'system'
    notes?: string; // Internal CS notes
    tags?: string[]; // Internal tags for filtering
  };

  // Timestamps
  created_at: Date;
  updated_at: Date;
  canceled_at: Date | null;
  completed_at: Date | null;
}

interface OrderAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string; // State/emirate
  country_code: string;
  postal_code?: string;
  phone?: string;
  company?: string; // For B2B orders
  metadata?: {
    vat_number?: string; // For UAE/KSA B2B
    gstin?: string; // For India B2B
  };
}
```

### 3.2 Line Item Structure

```typescript
interface LineItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_id: string;
  title: string; // Product title
  variant_title: string; // e.g., "16GB / DDR5-4800"
  thumbnail: string; // Product image URL
  sku: string;
  quantity: number;
  unit_price: number; // In minor currency units
  subtotal: number; // unit_price × quantity
  tax_total: number;
  discount_total: number;
  total: number; // Final line item total
  metadata: {
    hs_code: string;
    weight_g: number;
  };
}
```

---

## 4. Order ID Format

### 4.1 Customer-Facing Order ID

**Format:** `TM-{YYYY}-{XXXXXXXX}`

- `TM` — TwinMOS brand prefix
- `YYYY` — 4-digit calendar year (based on order creation year)
- `XXXXXXXX` — 8-digit zero-padded sequential number (resets annually)

**Examples:**
```
TM-2026-00000001  (First order of 2026)
TM-2026-00001234
TM-2027-00000001  (First order of 2027)
```

### 4.2 ID Generation

```typescript
// src/subscribers/order-created.ts
// Generate display_id after order creation
async function generateOrderDisplayId(orderId: string, container: MedusaContainer): Promise<string> {
  const year = new Date().getFullYear();

  // Atomic increment using PostgreSQL sequence
  const { rows } = await db.query(
    `SELECT nextval('order_sequence_${year}') AS seq`
  );

  const sequenceNumber = rows[0].seq;
  const displayId = `TM-${year}-${String(sequenceNumber).padStart(8, '0')}`;

  // Store on order metadata
  await orderModule.updateOrders([{
    id: orderId,
    metadata: { order_display_id: displayId }
  }]);

  return displayId;
}

// Create sequence for new year if not exists
// Run annually (or on first order of each year)
async function ensureYearSequence(year: number) {
  await db.query(`
    CREATE SEQUENCE IF NOT EXISTS order_sequence_${year}
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    CACHE 10
  `);
}
```

### 4.3 Internal vs. Customer-Facing IDs

| ID Type | Example | Used For |
|---|---|---|
| Medusa internal ID | `order_01JX4M7NRQB3CK` | Internal APIs, database queries |
| Customer display ID | `TM-2026-00001234` | Customer emails, order pages, customer service |
| Invoice number | `TM-INV-UAE-2026-00001234` | Tax invoices, Finance records |
| Stripe Payment ID | `pi_3OxxxxxXXXXXXXX` | Payment reconciliation |
| RMA Number | `TM-RMA-2026-001234` | Return merchandise authorization |

---

## 5. Email Notifications

### 5.1 Email Infrastructure

All transactional emails use:
- **Service:** Resend
- **Templates:** React Email components
- **From Address:** `orders@twinmos.com` (transactional), `no-reply@twinmos.com` (alerts)
- **Reply-To:** `support@twinmos.com`
- **Tracking:** Resend delivery/open webhooks → PostHog

### 5.2 Complete Notification Matrix

| # | Email Template | Trigger State | Subject Line | Key Content |
|---|---|---|---|---|
| 1 | Order Confirmation | `payment_captured` | Your TwinMOS Order {TM-YYYY-XXXXXXXX} is confirmed | Order summary, items, total, estimated shipping |
| 2 | Order Processing | `processing` | We're preparing your TwinMOS order | "Warehouse is packing your order" |
| 3 | Order Shipped | `shipped` | Your TwinMOS order is on the way! | Tracking number, carrier, delivery estimate |
| 4 | Order Delivered | `delivered` | Your TwinMOS order has arrived! | Delivery confirmation, rate experience CTA |
| 5 | Payment Failed | `payment_failed` | Action required: Payment not processed | Payment error reason, retry link, support contact |
| 6 | Order Canceled | `canceled` | Your TwinMOS order has been canceled | Cancellation reason, refund timeline |
| 7 | Refund Initiated | refund created | Your TwinMOS refund is being processed | Refund amount, timeline (5-10 business days) |
| 8 | Return Requested | `return_requested` | Return request confirmed — TwinMOS | RMA number, return instructions, packaging guidance |
| 9 | Return Received | `return_received` | We've received your TwinMOS return | "Inspecting your return" |
| 10 | Refund Completed | `refunded` | Your TwinMOS refund is complete | Final refund amount, timeline reminder |

### 5.3 Email Template: Order Confirmation

```typescript
// src/emails/OrderConfirmationEmail.tsx
import {
  Html, Head, Body, Container, Section, Text, Row, Column,
  Img, Button, Hr, Link
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  orderDisplayId: string;
  customerName: string;
  items: LineItem[];
  subtotal: string;
  taxAmount: string;
  taxLabel: string;
  shippingAmount: string;
  total: string;
  currency: string;
  shippingAddress: OrderAddress;
  estimatedDelivery: string;
  orderPageUrl: string;
  invoiceUrl: string;
}

export const OrderConfirmationEmail = ({
  orderDisplayId,
  customerName,
  items,
  subtotal,
  taxAmount,
  taxLabel,
  shippingAmount,
  total,
  currency,
  shippingAddress,
  estimatedDelivery,
  orderPageUrl,
  invoiceUrl,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Body style={{ backgroundColor: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>

        {/* Header */}
        <Section style={{ backgroundColor: '#1a1a2e', padding: '24px' }}>
          <Img src="https://twinmos.com/logo-white.png" alt="TwinMOS" height="40" />
        </Section>

        {/* Body */}
        <Section style={{ padding: '32px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>
            Order Confirmed!
          </Text>
          <Text>Hi {customerName},</Text>
          <Text>
            Thank you for your order. We've received your payment and your order is confirmed.
          </Text>
          <Text style={{ color: '#6b7280' }}>Order: <strong>{orderDisplayId}</strong></Text>

          {/* Items Table */}
          <Hr />
          {items.map(item => (
            <Row key={item.id} style={{ marginBottom: '16px' }}>
              <Column style={{ width: '80px' }}>
                <Img src={item.thumbnail} alt={item.title} width="60" height="60" style={{ borderRadius: '4px' }} />
              </Column>
              <Column>
                <Text style={{ fontWeight: 'bold', margin: 0 }}>{item.title}</Text>
                <Text style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>{item.variant_title}</Text>
                <Text style={{ margin: 0, fontSize: '14px' }}>Qty: {item.quantity}</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text>{currency} {formatAmount(item.total)}</Text>
              </Column>
            </Row>
          ))}
          <Hr />

          {/* Totals */}
          <Row><Column>Subtotal</Column><Column style={{ textAlign: 'right' }}>{currency} {subtotal}</Column></Row>
          {taxAmount !== '0.00' && (
            <Row><Column>{taxLabel}</Column><Column style={{ textAlign: 'right' }}>{currency} {taxAmount}</Column></Row>
          )}
          <Row><Column>Shipping</Column><Column style={{ textAlign: 'right' }}>{shippingAmount === '0.00' ? 'Free' : `${currency} ${shippingAmount}`}</Column></Row>
          <Hr />
          <Row>
            <Column style={{ fontWeight: 'bold' }}>Total</Column>
            <Column style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>{currency} {total}</Column>
          </Row>
          <Hr />

          {/* Shipping Address */}
          <Text style={{ fontWeight: 'bold' }}>Shipping to:</Text>
          <Text style={{ color: '#374151' }}>
            {shippingAddress.first_name} {shippingAddress.last_name}<br />
            {shippingAddress.address_1}{shippingAddress.address_2 ? `, ${shippingAddress.address_2}` : ''}<br />
            {shippingAddress.city}, {shippingAddress.country_code.toUpperCase()}
          </Text>

          <Text>Estimated delivery: <strong>{estimatedDelivery}</strong></Text>

          {/* CTAs */}
          <Button href={orderPageUrl} style={{ backgroundColor: '#1a1a2e', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', display: 'inline-block', marginRight: '12px' }}>
            Track Your Order
          </Button>
          <Link href={invoiceUrl} style={{ color: '#3b82f6' }}>Download Invoice</Link>
        </Section>

        {/* Footer */}
        <Section style={{ backgroundColor: '#f8fafc', padding: '24px', textAlign: 'center' }}>
          <Text style={{ color: '#6b7280', fontSize: '12px' }}>
            Questions? Contact us at support@twinmos.com<br />
            TwinMOS Technologies, DAFZA, Dubai, UAE
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
```

### 5.4 Email Template: Order Shipped

```typescript
// src/emails/ShippedEmail.tsx (structure)
export const ShippedEmail = ({
  customerName,
  orderDisplayId,
  trackingNumber,
  carrier,
  trackingUrl,
  estimatedDelivery,
  items,
}: ShippedEmailProps) => (
  <Html>
    <Body>
      <Container>
        {/* "Your order is on the way!" header with package illustration */}
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>Great news — your TwinMOS order {orderDisplayId} is on its way!</Text>
        </Section>

        {/* Tracking box — prominent */}
        <Section style={{ border: '2px solid #3b82f6', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <Text style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>TRACKING NUMBER</Text>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', fontFamily: 'monospace' }}>
            {trackingNumber}
          </Text>
          <Text style={{ color: '#6b7280', margin: 0 }}>Carrier: {carrier}</Text>
          <Button href={trackingUrl} style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '10px 20px', borderRadius: '6px', marginTop: '12px' }}>
            Track Your Package
          </Button>
        </Section>

        <Text>Estimated delivery: <strong>{estimatedDelivery}</strong></Text>

        {/* Items shipped */}
        {items.map(item => (
          <Row key={item.id}>
            <Column><Img src={item.thumbnail} width="50" height="50" /></Column>
            <Column>{item.title} × {item.quantity}</Column>
          </Row>
        ))}
      </Container>
    </Body>
  </Html>
);
```

### 5.5 Email Template: Payment Failed

```typescript
// src/emails/PaymentFailedEmail.tsx (structure)
export const PaymentFailedEmail = ({
  customerName,
  orderDisplayId,
  failureReason,
  retryUrl,
}: PaymentFailedEmailProps) => (
  <Html>
    <Body>
      <Container>
        <Section style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '16px' }}>
          <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>Payment Not Processed</Text>
          <Text style={{ color: '#374151' }}>
            Unfortunately, we were unable to process your payment for order {orderDisplayId}.
          </Text>
          {failureReason && (
            <Text style={{ color: '#6b7280', fontSize: '14px' }}>
              Reason: {mapStripeErrorToFriendlyMessage(failureReason)}
            </Text>
          )}
        </Section>

        <Text>Your cart has been saved. You can try again using the button below:</Text>

        <Button href={retryUrl} style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '12px 24px', borderRadius: '6px' }}>
          Retry Payment
        </Button>

        <Text style={{ fontSize: '14px', color: '#6b7280' }}>
          If you continue to experience issues, please contact our support team at support@twinmos.com
          or try a different payment method.
        </Text>
      </Container>
    </Body>
  </Html>
);

// Map Stripe error codes to customer-friendly messages
function mapStripeErrorToFriendlyMessage(code: string): string {
  const messages: Record<string, string> = {
    'card_declined': 'Your card was declined. Please try a different card.',
    'insufficient_funds': 'Insufficient funds. Please check your account balance.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'incorrect_cvc': 'The security code (CVV) was incorrect.',
    'do_not_honor': 'Your bank declined the transaction. Please contact your bank.',
  };
  return messages[code] ?? 'Your payment could not be processed. Please try again.';
}
```

### 5.6 Email Sending Orchestration

```typescript
// src/subscribers/order-notifications.ts
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';

// Subscribe to all relevant order events
export default async function orderNotificationSubscriber({
  event: { name, data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModule = container.resolve(Modules.ORDER);
  const notificationModule = container.resolve(Modules.NOTIFICATION);

  const order = await orderModule.retrieveOrder(data.id, {
    relations: ['items', 'items.variant', 'shipping_address', 'fulfillments', 'refunds']
  });

  const templateMap: Record<string, string> = {
    'order.payment_captured': 'order-confirmation',
    'order.processing': 'order-processing',
    'order.fulfillment_created': 'order-fulfillment-created',
    'order.shipment_created': 'order-shipped',
    'order.delivered': 'order-delivered',
    'order.payment_failed': 'order-payment-failed',
    'order.canceled': 'order-canceled',
    'order.refund_created': 'order-refund-initiated',
    'return.created': 'return-requested',
    'return.received': 'return-received',
    'return.refunded': 'refund-completed',
  };

  const template = templateMap[name];
  if (!template) return;

  await notificationModule.createNotifications([{
    to: order.email,
    channel: 'email',
    template,
    data: {
      order,
      orderDisplayId: order.metadata?.order_display_id,
      orderPageUrl: `${process.env.STOREFRONT_URL}/account/orders/${order.metadata?.order_display_id}`,
      invoiceUrl: order.metadata?.invoice_pdf_url,
    }
  }]);
}

export const config: SubscriberConfig = {
  event: [
    'order.payment_captured',
    'order.processing',
    'order.fulfillment_created',
    'order.shipment_created',
    'order.delivered',
    'order.payment_failed',
    'order.canceled',
    'order.refund_created',
    'return.created',
    'return.received',
    'return.refunded',
  ],
};
```

---

## 6. Customer-Facing Order Tracking

### 6.1 Authenticated Order Tracking Page

**URL:** `/account/orders/{order_display_id}` (e.g., `/account/orders/TM-2026-00001234`)

**Access:** Logged-in customers can only view their own orders. Medusa Better Auth ensures the order belongs to the authenticated customer.

**Page Sections:**

#### 6.1.1 Order Status Timeline (Visual Stepper)

```astro
---
// src/components/OrderStatusStepper.astro
const steps = [
  { id: 'payment_captured', label: 'Order Confirmed', icon: 'check-circle' },
  { id: 'processing', label: 'Processing', icon: 'package' },
  { id: 'shipped', label: 'Shipped', icon: 'truck' },
  { id: 'delivered', label: 'Delivered', icon: 'home' },
  { id: 'completed', label: 'Completed', icon: 'star' },
];

const currentStepIndex = steps.findIndex(s => s.id === order.status);
---

<div class="order-stepper">
  {steps.map((step, index) => (
    <div
      class={`step ${index <= currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'current' : ''}`}
    >
      <div class="step-icon">
        <Icon name={step.icon} />
      </div>
      <div class="step-label">{step.label}</div>
      {step.id === 'shipped' && order.metadata?.tracking_number && (
        <div class="step-detail">
          <span>{order.metadata.carrier}: </span>
          <a href={order.metadata.tracking_url} target="_blank" rel="noopener">
            {order.metadata.tracking_number}
          </a>
        </div>
      )}
    </div>
  ))}
</div>
```

#### 6.1.2 Order Summary Section

Displays:
- Order display ID (`TM-2026-00001234`)
- Order date
- Estimated delivery / actual delivery date
- Line items with product thumbnail, name, variant, quantity, price
- Subtotal, tax breakdown, shipping, total
- Shipping address

#### 6.1.3 Payment Information

```html
<div class="payment-info">
  <h3>Payment Method</h3>
  <div class="card-info">
    <img src="/icons/visa.svg" alt="Visa" />
    <span>Visa ending in <strong>4242</strong></span>
    <span class="payment-status paid">Paid</span>
  </div>
  <div class="invoice-link">
    <a href="{invoiceUrl}" target="_blank">
      <img src="/icons/pdf.svg" /> Download Invoice
    </a>
  </div>
</div>
```

#### 6.1.4 Cancel Order Button

```typescript
// Cancel button visibility logic
function canCancelOrder(order: Order): boolean {
  const cancellableStatuses = ['payment_captured'];
  const createdAt = new Date(order.created_at);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  return (
    cancellableStatuses.includes(order.status) &&
    createdAt > twoHoursAgo &&
    !order.fulfillments?.length
  );
}
```

```astro
{canCancelOrder(order) && (
  <div class="cancel-section">
    <p class="cancel-warning">
      You can cancel this order within 2 hours of placement,
      provided it hasn't started processing.
    </p>
    <button
      class="btn-cancel"
      hx-post={`/api/orders/${order.id}/cancel`}
      hx-confirm="Are you sure you want to cancel this order?"
    >
      Cancel Order
    </button>
  </div>
)}
```

#### 6.1.5 Return Request Button

```astro
{order.status === 'delivered' && isWithinReturnWindow(order) && (
  <div class="return-section">
    <h3>Returns</h3>
    <p>Not satisfied? Return eligible items within 7 days of delivery.</p>
    <a href={`/account/orders/${order.metadata.order_display_id}/return`} class="btn-return">
      Request a Return
    </a>
  </div>
)}
```

### 6.2 Return Request Flow

**URL:** `/account/orders/{order_display_id}/return`

**Steps:**
1. Customer selects items to return and quantity
2. Customer selects return reason (dropdown: "Defective", "Wrong item received", "Changed my mind", "Doesn't meet expectations", "Other")
3. Customer uploads photo evidence (optional; required for defective claims)
4. Customer confirms return request
5. System generates RMA number and sends return instructions email
6. Customer ships back and enters tracking number

```typescript
// Return request API handler
// POST /store/orders/{id}/returns
export async function createReturnRequest(req: MedusaRequest, res: MedusaResponse) {
  const { items, reason, description, evidence_urls } = req.body;
  const orderId = req.params.id;

  // Validate order belongs to customer
  const order = await orderModule.retrieveOrder(orderId);
  if (order.customer_id !== req.auth_context.actor_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Validate return window
  const deliveredAt = new Date(order.metadata.delivered_at);
  const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);

  const maxReturnDays = reason === 'defective' ? 30 : 7;
  if (daysSinceDelivery > maxReturnDays) {
    return res.status(400).json({
      error: 'RETURN_WINDOW_EXPIRED',
      message: `Return window of ${maxReturnDays} days has expired.`
    });
  }

  // Generate RMA number
  const rmaNumber = `TM-RMA-${new Date().getFullYear()}-${String(await getNextRmaSequence()).padStart(6, '0')}`;

  // Create Medusa return
  const returnRecord = await orderModule.createReturns([{
    order_id: orderId,
    items: items.map(item => ({
      id: item.line_item_id,
      quantity: item.quantity,
      reason_id: returnReasonId,
    })),
    metadata: {
      rma_number: rmaNumber,
      return_reason: reason,
      description,
      evidence_urls,
      requested_at: new Date().toISOString(),
    }
  }]);

  // Send return confirmation email with RMA
  await sendReturnConfirmationEmail(order, rmaNumber, items);

  res.status(201).json({
    success: true,
    rma_number: rmaNumber,
    return_id: returnRecord[0].id,
  });
}
```

---

## 7. Guest Order Tracking

### 7.1 Guest Tracking Page

**URL:** `/orders/track`

Customers who completed a guest checkout (not logged in) can track their order by providing:
1. Email address used at checkout
2. Order display ID (`TM-2026-00001234`)

```astro
---
// src/pages/orders/track.astro
---
<Layout title="Track Your Order — TwinMOS">
  <div class="track-container">
    <h1>Track Your Order</h1>
    <p>Enter your order number and email address to check your order status.</p>

    <form
      class="track-form"
      hx-post="/api/orders/track"
      hx-target="#track-result"
      hx-swap="innerHTML"
    >
      <div class="field">
        <label for="order-id">Order Number</label>
        <input
          type="text"
          id="order-id"
          name="order_display_id"
          placeholder="TM-2026-00001234"
          pattern="TM-\d{4}-\d{8}"
          required
        />
      </div>
      <div class="field">
        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" placeholder="your@email.com" required />
      </div>
      <button type="submit" class="btn-primary">Track Order</button>
    </form>

    <div id="track-result">
      <!-- Result rendered here by HTMX -->
    </div>
  </div>
</Layout>
```

### 7.2 Guest Tracking API

```typescript
// POST /api/orders/track (public, no auth required)
export async function trackGuestOrder(req: MedusaRequest, res: MedusaResponse) {
  const { order_display_id, email } = req.body;

  // Validate format
  if (!/^TM-\d{4}-\d{8}$/.test(order_display_id)) {
    return res.status(400).json({ error: 'Invalid order number format' });
  }

  // Find order by display_id and email (both must match)
  const orders = await orderModule.listOrders({
    filters: {
      'metadata->order_display_id': order_display_id,
      email: email.toLowerCase(),
    }
  });

  if (orders.length === 0) {
    // Return generic error — don't confirm whether order_id exists (prevent enumeration)
    return res.status(404).json({
      error: 'ORDER_NOT_FOUND',
      message: 'No order found with the provided order number and email address.'
    });
  }

  const order = orders[0];

  // Return limited order data (no sensitive payment details)
  res.json({
    order_display_id: order.metadata.order_display_id,
    status: order.status,
    status_label: getStatusLabel(order.status),
    items_summary: order.items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      thumbnail: item.thumbnail,
    })),
    tracking_number: order.metadata.tracking_number ?? null,
    tracking_url: order.metadata.tracking_url ?? null,
    carrier: order.metadata.carrier ?? null,
    estimated_delivery: order.metadata.estimated_delivery ?? null,
    created_at: order.created_at,
  });
}
```

---

## 8. Admin Order Management

### 8.1 Order List View

**Navigation:** Medusa Admin → Orders

**Columns:**

| Column | Description |
|---|---|
| Order ID | TwinMOS display ID (TM-YYYY-XXXXXXXX) |
| Date | Order creation date/time |
| Customer | Customer name and email |
| Items | Number of line items |
| Status | Current order status (color-coded) |
| Payment Status | Payment state |
| Region | UAE / India / Bangladesh / KSA / International |
| Total | Order total with currency |
| Actions | View, Fulfill, Cancel |

**Filter Options:**
- Status: All / Pending / Processing / Shipped / Delivered / Canceled / Returned
- Date range: Custom date picker
- Region: UAE / India / Bangladesh / KSA / International
- Amount range: Min/Max order value
- Payment status: Captured / Pending / Failed / Refunded

**Search:** By order display ID, customer email, or customer name

### 8.2 Order Detail View

The admin order detail view provides full order information and action buttons:

**Sections:**
1. Order header (ID, status badge, creation date, region)
2. Customer information (name, email, account link)
3. Line items (with edit quantity option before processing)
4. Shipping address
5. Payment details (Stripe payment ID, amount, status)
6. Tax breakdown
7. Fulfillment section (tracking, carrier, shipped date)
8. Returns / Refunds history
9. Internal notes timeline
10. Order audit log (all state transitions with timestamps)

### 8.3 Manual State Transitions (Admin)

```typescript
// Admin actions available per state

// Mark as Processing (acknowledges order)
await medusaAdminClient.orders.createFulfillment(orderId, {
  // items to fulfill
  notify_customer: true,
});

// Mark as Shipped (enter tracking)
await medusaAdminClient.orders.createShipment(orderId, {
  fulfillment_id: fulfillmentId,
  tracking_numbers: [trackingNumber],
});

// Mark as Delivered (manual — if carrier webhook not available)
await medusaAdminClient.orders.updateOrder(orderId, {
  status: 'delivered',
  metadata: {
    delivered_at: new Date().toISOString(),
    delivery_confirmed_by: 'admin',
    admin_user_id: adminUserId,
  }
});

// Update tracking number (if entered incorrectly)
await medusaAdminClient.orders.updateFulfillment(fulfillmentId, {
  tracking_links: [{ tracking_number: correctedTrackingNumber, url: correctedUrl }]
});
```

### 8.4 Internal Notes

Admin staff can add internal notes to any order:

```typescript
// Add internal note to order
await medusaAdminClient.notes.create({
  resource_type: 'order',
  resource_id: orderId,
  value: 'Customer called — requested expedited shipping. Upgraded to express.',
  author_id: adminUserId,
});
```

Notes are displayed in a chronological timeline in the admin order detail view, visible only to admin staff (never shown to customers).

### 8.5 Refund Trigger

```typescript
// Admin initiates refund
await medusaAdminClient.orders.createRefund(orderId, {
  amount: refundAmount, // In minor currency units
  reason: 'return', // 'return' | 'discount' | 'fraud' | 'other'
  note: 'Customer return — product defective per return inspection.',
  // Refund automatically goes to original payment method via Stripe
});
```

### 8.6 Order Export

```typescript
// Export orders to CSV for accounting/Finance team
// GET /admin/orders/export?status=completed&date_from=2026-01-01&date_to=2026-01-31&region=UAE

// CSV columns:
const csvColumns = [
  'Order ID (TM-YYYY-XXXXXXXX)',
  'Medusa Order ID',
  'Order Date',
  'Customer Name',
  'Customer Email',
  'Region',
  'Status',
  'Items',
  'Subtotal',
  'Tax Amount',
  'Tax Rate',
  'Shipping',
  'Discount',
  'Total',
  'Currency',
  'Payment Method',
  'Stripe Payment ID',
  'Invoice Number',
  'Shipping Address',
  'Country',
];
```

---

## 9. Cancellation Policy

### 9.1 Customer Cancellation

| Condition | Allowed | Refund |
|---|---|---|
| Order status = `payment_captured`, within 2 hours of placement, not yet processing | Yes | 100% full refund |
| Order status = `payment_captured`, within 2 hours, processing has started | Requires admin approval | 50% restocking fee applies |
| Order status = `processing` or later | No self-service cancellation; must contact support | Case-by-case |
| Order status = `shipped` | Not cancellable; initiate return upon delivery | Per return policy |

### 9.2 Cancellation Window Enforcement

```typescript
// Validate cancellation eligibility
async function validateCancellation(order: Order): Promise<{ allowed: boolean; message: string }> {
  const cancellableStatuses = ['payment_captured'];

  if (!cancellableStatuses.includes(order.status)) {
    return {
      allowed: false,
      message: 'This order cannot be canceled in its current state. If your order has shipped, please initiate a return after delivery.'
    };
  }

  const createdAt = new Date(order.created_at);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  if (createdAt < twoHoursAgo) {
    return {
      allowed: false,
      message: 'The 2-hour cancellation window has passed. Please contact our support team at support@twinmos.com for assistance.'
    };
  }

  if (order.fulfillments && order.fulfillments.length > 0) {
    return {
      allowed: false,
      message: 'Your order has already been picked for packing. Please contact support for a 50% restocking fee cancellation.'
    };
  }

  return { allowed: true, message: 'Your order can be canceled for a full refund.' };
}
```

### 9.3 Restocking Fee (Processing Stage)

If Operations has started processing the order (picked from shelf, boxed), a 50% restocking fee applies:

- Customer requests cancellation
- Admin evaluates: if packed/processing has started → 50% restocking fee applies
- Admin communicates this to customer and obtains approval
- Admin manually triggers partial refund (50% of product subtotal; shipping not refunded)

---

## 10. Return Policy

### 10.1 Standard Return Window

| Product Condition | Return Window | Conditions |
|---|---|---|
| Any reason (change of mind) | 7 days from delivery | Unused, original packaging, all accessories included |
| Defective product | 30 days from delivery | Photo evidence required; TwinMOS verifies defect |
| Wrong item received | 7 days from delivery | Photo of received item required |

### 10.2 Non-Returnable Items

| Category | Return Status |
|---|---|
| Items with broken seal (unless defective) | Not returnable |
| Bundled kits with partial use | Not returnable |
| Items purchased during final sale | Not returnable |
| Digital downloads / software licenses | Not returnable |

### 10.3 Return Process

```
Customer initiates return at /account/orders/{id}/return
           │
           │ System validates:
           │   - Order is in returned/delivered/completed state
           │   - Return window not expired
           │
           ▼
     RMA Number generated
     Return instructions email sent (Resend)
           │
           │ Customer ships return to TwinMOS warehouse
           │ Customer provides tracking number (optional)
           │
           ▼
     TwinMOS warehouse receives return
     Admin marks as return_received in Medusa admin
           │
           │ Inspection:
           │   - Verify item is unused and in original packaging
           │   - For defective: verify defect claim
           │
           ▼
     Finance approves refund in Medusa admin
     Stripe refund initiated automatically
     Refund confirmation email sent to customer
```

### 10.4 Return Shipping

| Scenario | Return Shipping Paid By |
|---|---|
| Defective product | TwinMOS (prepaid label provided via email) |
| Wrong item received | TwinMOS (prepaid label provided) |
| Change of mind | Customer |
| Quality not as expected | Customer |

---

## 11. Refund Processing

### 11.1 Refund Methods and Timelines

| Payment Method | Refund Method | Timeline |
|---|---|---|
| Credit/Debit Card (Stripe) | Original card | 5–10 business days |
| Bank Transfer / Wire | Original bank account | 7–14 business days |

### 11.2 Refund Implementation

```typescript
// Process refund via Stripe through Medusa
async function processRefund(
  orderId: string,
  amount: number,
  reason: string,
  note: string
): Promise<Refund> {
  // Medusa handles Stripe refund automatically
  const refund = await orderModule.createRefunds([{
    order_id: orderId,
    amount, // In minor currency units
    reason,
    note,
    created_by: adminUserId,
  }]);

  // Stripe refund is created automatically by Medusa payment module
  // customer receives refund to original payment method

  // Send refund confirmation email
  await sendRefundInitiatedEmail(order, refund);

  // Log to Finance audit trail
  await logFinanceEvent({
    type: 'REFUND_ISSUED',
    order_id: orderId,
    refund_id: refund.id,
    amount,
    currency: order.currency_code,
    reason,
    issued_by: adminUserId,
    issued_at: new Date(),
  });

  return refund[0];
}
```

### 11.3 Partial Refunds

For partial returns (returning some items from a multi-item order):

```typescript
// Calculate partial refund amount
function calculatePartialRefundAmount(
  order: Order,
  returnedItems: { line_item_id: string; quantity: number }[]
): number {
  let refundAmount = 0;

  for (const returnedItem of returnedItems) {
    const lineItem = order.items.find(i => i.id === returnedItem.line_item_id);
    if (!lineItem) continue;

    const unitPrice = lineItem.total / lineItem.quantity;
    refundAmount += unitPrice * returnedItem.quantity;
  }

  // Pro-rata tax refund
  const taxRatio = order.tax_total / order.subtotal;
  const taxRefund = refundAmount * taxRatio;

  // Shipping: only refunded if all items returned
  const allItemsReturned = order.items.every(item =>
    returnedItems.find(r => r.line_item_id === item.id && r.quantity >= item.quantity)
  );
  const shippingRefund = allItemsReturned ? order.shipping_total : 0;

  return refundAmount + taxRefund + shippingRefund;
}
```

---

## 12. Fraud Detection

### 12.1 Stripe Radar (Card Fraud)

Stripe Radar is enabled on the TwinMOS Stripe account and provides:
- Machine learning-based card fraud detection
- Real-time blocking of high-risk payments
- Automatic 3D Secure (3DS) challenges for suspicious cards
- Radar Rules customization (via Stripe Dashboard)

**TwinMOS Stripe Radar Rules:**

| Rule | Action | Rationale |
|---|---|---|
| Block if card country ≠ billing country and amount > $500 | Block | High-risk mismatch |
| Review if CVV check failed | Manual review | Possible stolen card |
| Block if card is on Stripe's fraud list | Block | Known fraudulent card |
| 3DS if amount > $1,000 | 3D Secure challenge | High-value orders |

### 12.2 High-Value Order Review

Orders above USD 500 equivalent are flagged for manual review before fulfillment:

```typescript
// High-value order review threshold
const HIGH_VALUE_THRESHOLD_USD = 500;

const exchangeRates = {
  AED: 3.67,
  INR: 83.5,
  SAR: 3.75,
  BDT: 110,
  USD: 1,
};

async function checkHighValueOrder(order: Order): Promise<void> {
  const totalUsd = order.total / 100 / (exchangeRates[order.currency_code.toUpperCase()] ?? 1);

  if (totalUsd >= HIGH_VALUE_THRESHOLD_USD) {
    // Flag order for manual review
    await orderModule.updateOrders([{
      id: order.id,
      metadata: {
        fraud_review_required: true,
        fraud_review_reason: `Order value USD ${totalUsd.toFixed(2)} exceeds threshold`,
      }
    }]);

    // Alert Customer Service via Slack
    await notifySlack('#orders-review', {
      text: `High-value order requires review`,
      order_display_id: order.metadata.order_display_id,
      customer_email: order.email,
      total: `${order.currency_code.toUpperCase()} ${(order.total / 100).toFixed(2)}`,
      total_usd: `USD ${totalUsd.toFixed(2)}`,
      review_url: `${process.env.ADMIN_URL}/orders/${order.id}`,
    });
  }
}
```

### 12.3 Fraud Review Process

When an order is flagged:

1. Slack #orders-review notification sent to Customer Service
2. Order held in `payment_captured` status — does not proceed to `processing`
3. Customer Service reviews:
   - Customer purchase history (repeat customer?)
   - Shipping address vs. billing address match
   - Order pattern (multiple orders in short time?)
   - IP geolocation vs. shipping address
4. CS approves (mark `fraud_reviewed: true`) or cancels (full refund)

**SLA:** Fraud review must be completed within 4 business hours to avoid customer disappointment.

---

## 13. Order Data Retention

### 13.1 Retention Requirements

| Market | Regulation | Retention Period |
|---|---|---|
| UAE | FTA VAT Law — tax records | 7 years |
| India | GST Act — tax records | 8 years |
| KSA | ZATCA — e-invoice records | 10 years |
| Bangladesh | NBR — VAT records | 7 years |
| International | TwinMOS policy | 7 years |

**Platform Retention Period:** All orders and associated data (invoices, refunds, returns) are retained for **10 years** (maximum regulatory requirement).

### 13.2 Data Retention Implementation

```typescript
// Database retention: Medusa PostgreSQL
// No hard deletion — soft delete only (deleted_at field)

// Backblaze B2 lifecycle rules
const b2LifecycleRules = {
  invoices: { daysToDelete: 3650 }, // 10 years
  orderExports: { daysToDelete: 3650 }, // 10 years
  taxReports: { daysToDelete: 3650 }, // 10 years
};

// PostHog: order events retained for 7 years per PostHog settings
// Strapi: order records retained — no auto-deletion

// Archival strategy (Phase 3.2):
// Orders older than 3 years are moved to cold storage tier in Backblaze B2
// Still queryable by Finance via admin export tools
```

### 13.3 Customer Data Deletion Requests (GDPR / Privacy)

When a customer requests data deletion:
- Personal data (name, email, address) is anonymized in order records
- Order financial records are retained for regulatory compliance
- Anonymized order: customer name replaced with "Deleted Customer", email with "deleted_{hash}@twinmos.com"

```typescript
async function anonymizeCustomerData(customerId: string): Promise<void> {
  // Replace customer PII with anonymized placeholders
  await orderModule.updateOrders(
    { customer_id: customerId },
    {
      email: `deleted_${hashCustomerId(customerId)}@twinmos.com`,
      // Addresses anonymized
      // Keep: order amount, tax, products (required for compliance)
    }
  );
}
```

---

## 14. Order Analytics

### 14.1 Daily Order Volume Report

**Schedule:** Daily at 7:00 AM Dubai time
**Recipients:** TwinMOS Management, Sales, Operations

**Metrics:**
- Total orders placed (24h)
- Total orders placed (7d rolling)
- Total revenue (24h, by region and currency)
- Orders by status
- Average Order Value (AOV)
- Conversion rate (sessions → orders) — from PostHog

```typescript
// Daily order report job
// src/jobs/daily-order-report.ts
export async function generateDailyOrderReport() {
  const yesterday = getYesterday();
  const orders = await orderModule.listOrders({
    filters: {
      created_at: { $gte: yesterday.start, $lte: yesterday.end },
      status: { $ne: 'canceled' }
    }
  });

  const reportData = {
    date: yesterday.label,
    total_orders: orders.length,
    orders_by_region: groupBy(orders, 'metadata.region'),
    total_revenue: {
      AED: sumRevenue(orders.filter(o => o.currency_code === 'aed')),
      INR: sumRevenue(orders.filter(o => o.currency_code === 'inr')),
      SAR: sumRevenue(orders.filter(o => o.currency_code === 'sar')),
      BDT: sumRevenue(orders.filter(o => o.currency_code === 'bdt')),
      USD: sumRevenue(orders.filter(o => o.currency_code === 'usd')),
    },
    aov: orders.length > 0 ? sumRevenue(orders) / orders.length : 0,
    orders_by_status: groupBy(orders, 'status'),
    top_products: getTopProducts(orders, 5),
  };

  await resend.emails.send({
    from: 'reports@twinmos.com',
    to: ['management@twinmos.com', 'sales@twinmos.com', 'operations@twinmos.com'],
    subject: `TwinMOS Daily Order Report — ${yesterday.label}`,
    react: DailyOrderReportEmail(reportData),
  });
}
```

### 14.2 Revenue by Region Dashboard (PostHog)

PostHog OSS is configured to track order events:

```typescript
// Track order events in PostHog
import PostHog from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST // Self-hosted
});

// On order confirmed (payment_captured)
posthog.capture({
  distinctId: order.customer_id ?? order.email,
  event: 'order_confirmed',
  properties: {
    order_id: order.metadata.order_display_id,
    region: order.metadata.region,
    currency: order.currency_code,
    revenue: order.total / 100,
    tax_amount: order.tax_total / 100,
    shipping_amount: order.shipping_total / 100,
    item_count: order.items.reduce((sum, i) => sum + i.quantity, 0),
    product_categories: [...new Set(order.items.map(i => i.metadata?.category))],
    is_guest_checkout: !order.customer_id,
    coupon_used: order.discounts?.length > 0,
  }
});

// On refund
posthog.capture({
  distinctId: order.customer_id ?? order.email,
  event: 'order_refunded',
  properties: {
    order_id: order.metadata.order_display_id,
    refund_amount: refund.amount / 100,
    refund_reason: refund.reason,
    days_since_order: daysSince(order.created_at),
  }
});
```

### 14.3 Key Analytics Metrics

| Metric | Definition | Target |
|---|---|---|
| Daily Order Volume | Orders per day | Track trend |
| Revenue by Region | USD-equivalent revenue per market | Track growth |
| AOV | Average order value per region | Track upsell effectiveness |
| Conversion Rate | Checkout started / orders placed | > 60% |
| Return Rate | Returns / total orders | < 5% |
| Cancellation Rate | Cancellations / total orders | < 2% |
| Fulfillment Time | Hours from payment_captured to shipped | < 24h business hours |
| Fraud Rate | Fraudulent chargebacks / total orders | < 0.1% |

---

## 15. Medusa.js Order Configuration

### 15.1 Order Module Configuration

```typescript
// medusa-config.ts
export default defineConfig({
  modules: [
    {
      resolve: '@medusajs/medusa/order',
      options: {
        // Order module options
      }
    },
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: process.env.STRIPE_SECRET_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              automatic_payment_methods: true,
              capture: true, // Auto-capture payments
            }
          }
        ]
      }
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: './src/modules/notification/resend-provider',
            id: 'resend',
            options: {
              apiKey: process.env.RESEND_API_KEY,
              from: 'orders@twinmos.com',
            }
          }
        ]
      }
    }
  ]
});
```

### 15.2 Order Hooks Configuration

```typescript
// src/subscribers/order-hooks.ts

// Hook: Auto-complete orders 7 days after delivery
export const autoCompleteOrdersJob = {
  name: 'auto-complete-delivered-orders',
  schedule: '0 2 * * *', // Daily at 2AM
  handler: async (container: MedusaContainer) => {
    const orderModule = container.resolve(Modules.ORDER);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deliveredOrders = await orderModule.listOrders({
      filters: {
        status: 'delivered',
        updated_at: { $lte: sevenDaysAgo },
      }
    });

    for (const order of deliveredOrders) {
      // Check no return request pending
      if (!order.returns?.length) {
        await orderModule.updateOrders([{
          id: order.id,
          status: 'completed',
          completed_at: new Date(),
          metadata: { ...order.metadata, auto_completed: true }
        }]);
      }
    }
  }
};

// Hook: High-value fraud check on payment captured
export default async function fraudCheckSubscriber({
  event: { name, data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (name !== 'order.payment_captured') return;
  const orderModule = container.resolve(Modules.ORDER);
  const order = await orderModule.retrieveOrder(data.id);
  await checkHighValueOrder(order);
}

export const fraudCheckConfig: SubscriberConfig = {
  event: 'order.payment_captured',
};
```

### 15.3 Stripe Webhook Handler

```typescript
// src/api/webhooks/stripe.ts
import Stripe from 'stripe';
import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const sig = req.headers['stripe-signature'];
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Raw buffer — not parsed JSON
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const paymentModule = req.scope.resolve(Modules.PAYMENT);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await paymentModule.capturePayment({
        data: { stripePaymentIntentId: event.data.object.id }
      });
      break;

    case 'payment_intent.payment_failed':
      await paymentModule.cancelPayment({
        data: { stripePaymentIntentId: event.data.object.id }
      });
      break;

    case 'charge.dispute.created':
      // Handle chargeback/dispute
      await handleDispute(event.data.object, req.scope);
      break;

    default:
      // Unhandled event type — log and ignore
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  res.json({ received: true });
}
```

---

## 16. Test Scenarios

### 16.1 Happy Path Order Tests

| Test ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| ORD-HP-001 | Complete B2C purchase UAE | Add to cart → checkout → pay → track | Order created; confirmation email sent; tracking visible |
| ORD-HP-002 | Guest checkout | No login → checkout → pay | Guest order created; track via /orders/track |
| ORD-HP-003 | Multi-item order | 3 different products → checkout | All items in one fulfillment; one invoice |
| ORD-HP-004 | Free shipping threshold | UAE cart > AED 200 | Shipping: AED 0 |
| ORD-HP-005 | Order auto-completes | Delivered order, no return after 7 days | Status changes to "completed" |

### 16.2 Payment Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| ORD-PAY-001 | Stripe payment succeeds | Order moves to payment_captured; confirmation email sent |
| ORD-PAY-002 | Stripe payment fails (declined) | Order stays pending; payment failed email sent; retry link works |
| ORD-PAY-003 | 3DS challenge required | Customer redirected to 3DS; on success order confirmed |
| ORD-PAY-004 | High-value order > USD 500 | Fraud review flag set; Slack #orders-review notified |

### 16.3 Cancellation Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| ORD-CAN-001 | Cancel within 2h, unpacked | Full refund; order canceled; cancellation email |
| ORD-CAN-002 | Cancel after 2h | Cancellation button not shown; contact support message |
| ORD-CAN-003 | Cancel after shipped | Not possible; return instructions shown |
| ORD-CAN-004 | Admin force cancel | Admin can cancel in any state; note required |

### 16.4 Return and Refund Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| ORD-RET-001 | Return within 7 days | Return request accepted; RMA issued; return email sent |
| ORD-RET-002 | Return after 7 days (non-defective) | Return rejected with explanation |
| ORD-RET-003 | Defective product, within 30 days | Return accepted; prepaid label issued |
| ORD-RET-004 | Return received, refund issued | Refund email sent; Stripe refund created |
| ORD-RET-005 | Partial return (1 of 2 items) | Partial refund calculated correctly; tax pro-rated |

### 16.5 Notification Tests

| Test ID | Scenario | Expected Result |
|---|---|---|
| ORD-EMAIL-001 | Order confirmed | Confirmation email received within 2 minutes |
| ORD-EMAIL-002 | Tracking number added by admin | Shipped email with tracking link sent within 5 minutes |
| ORD-EMAIL-003 | Refund issued | Refund initiated email sent immediately |
| ORD-EMAIL-004 | Invalid email at checkout | Checkout validation prevents invalid email |

---

## 17. Acceptance Criteria

### 17.1 Order State Machine

| ID | Criterion | Priority |
|---|---|---|
| AC-ORD-001 | All state transitions work correctly per the state machine definition | Must Have |
| AC-ORD-002 | Order confirmation email is sent within 2 minutes of payment capture | Must Have |
| AC-ORD-003 | Tracking email is sent within 5 minutes of fulfillment creation with correct tracking URL | Must Have |
| AC-ORD-004 | Orders are auto-completed 7 days after delivery if no return requested | Must Have |
| AC-ORD-005 | Order display ID follows TM-YYYY-XXXXXXXX format with correct year and sequence | Must Have |

### 17.2 Customer Experience

| ID | Criterion | Priority |
|---|---|---|
| AC-ORD-006 | Logged-in customers can view all their order history and status in real time | Must Have |
| AC-ORD-007 | Guest customers can track orders via /orders/track with email + order ID | Must Have |
| AC-ORD-008 | Cancel button is shown only when eligible (status, 2h window, unfulfilled) | Must Have |
| AC-ORD-009 | Return request form correctly validates return eligibility window | Must Have |
| AC-ORD-010 | Invoice PDF is downloadable from order page for 7+ years | Must Have |

### 17.3 Admin Operations

| ID | Criterion | Priority |
|---|---|---|
| AC-ORD-011 | Admin can filter, search, and export orders by status, region, date, and amount | Must Have |
| AC-ORD-012 | Admin can manually trigger state transitions with audit logging | Must Have |
| AC-ORD-013 | Admin can add internal notes visible only to staff | Must Have |
| AC-ORD-014 | Admin can initiate refunds that automatically process via Stripe | Must Have |
| AC-ORD-015 | High-value orders (> USD 500) trigger Slack alert before processing | Must Have |

### 17.4 Compliance and Retention

| ID | Criterion | Priority |
|---|---|---|
| AC-ORD-016 | All orders and invoices are retained for minimum 10 years in Backblaze B2 | Must Have |
| AC-ORD-017 | Order data can be anonymized for customer data deletion requests | Should Have |
| AC-ORD-018 | Fraud chargebacks are logged and visible in admin with original order details | Must Have |

---

## 18. Business Rules Reference

| Rule ID | Rule Description |
|---|---|
| BR-ORD-001 | Order confirmation emails are sent immediately upon payment_captured event |
| BR-ORD-002 | Order display IDs follow the format TM-YYYY-XXXXXXXX with annual sequence reset |
| BR-ORD-003 | Orders auto-complete 7 days after delivery if no return request has been initiated |
| BR-ORD-004 | Customer self-service cancellation is only available within 2 hours of order placement and only when status is payment_captured and no fulfillment has started |
| BR-ORD-005 | A 50% restocking fee applies if processing has started at time of cancellation |
| BR-ORD-006 | Standard returns are accepted within 7 days of delivery for unused products in original packaging |
| BR-ORD-007 | Defective product returns are accepted within 30 days of delivery with photographic evidence |
| BR-ORD-008 | Card refunds take 5–10 business days; bank transfer refunds take 7–14 business days |
| BR-ORD-009 | Orders exceeding USD 500 equivalent are flagged for fraud review before moving to processing |
| BR-ORD-010 | Stripe Radar handles card-level fraud detection automatically |
| BR-ORD-011 | All order and invoice data is retained for a minimum of 10 years |
| BR-ORD-012 | Shipping charges are not refunded on change-of-mind returns |
| BR-ORD-013 | Shipping charges are refunded when the carrier is responsible for loss or damage |
| BR-ORD-014 | Tax amounts are refunded proportionally on partial returns |
| BR-ORD-015 | The RMA number format is TM-RMA-YYYY-XXXXXX (6-digit sequential) |
| BR-ORD-016 | Internal admin notes are never displayed to customers |
| BR-ORD-017 | Guest order tracking requires both email address AND order display ID (prevents enumeration) |
| BR-ORD-018 | Daily order volume and revenue reports are sent to management every morning at 07:00 Dubai time |
| BR-ORD-019 | Fraud review SLA: High-value orders must be reviewed within 4 business hours |
| BR-ORD-020 | Customer PII can be anonymized on data deletion request while retaining order financial records for compliance |

---

*Document End — TWN-P3-ORDER-2026-001 v1.0*
*TwinMOS Technologies — Confidential*
