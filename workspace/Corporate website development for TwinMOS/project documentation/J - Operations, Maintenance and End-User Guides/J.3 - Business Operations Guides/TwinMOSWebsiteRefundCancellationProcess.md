# TwinMOS Website — Refund & Cancellation Process

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-039 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Finance / E-Commerce Operations |
| **Audience** | Finance Team, Order Managers, Customer Support, E-Commerce Admin |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §9.4), TWN-URD-2025-002 (URD §7.3), TWN-OPS-2026-037 (E-Commerce Admin Guide), TWN-OPS-2026-038 (Order Fulfillment Process) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide defines the operational procedures for processing order cancellations and refunds for the TwinMOS e-commerce platform (Phase 3). It covers:

- Cancellation policies and procedures
- Refund eligibility and calculation
- Refund processing workflows
- Payment method-specific procedures
- Partial refunds and store credit
- Exception handling
- Financial reconciliation and reporting

**Scope:** All cancellations and refunds for orders placed through the TwinMOS direct-to-consumer online store.

---

## 2. Cancellation Policy

### 2.1 Cancellation Windows

| Order Status | Customer Can Cancel? | Admin Can Cancel? | Notes |
|:---|:---|:---|:---|
| Pending / Awaiting Payment | Yes (self-service) | Yes | Immediate, no fees |
| Paid, not yet processing | Yes (contact support) | Yes | Immediate, no fees |
| Processing / Picking | No | Yes (emergency) | May incur restocking if picked |
| Shipped | No | No | Must follow return process |
| Delivered | No | No | Must follow return process |

### 2.2 Self-Service Cancellation

Customers can cancel orders in "Pending" or "Awaiting Payment" status via:
1. Log into account
2. Navigate to "My Orders"
3. Select order, click "Cancel Order"
4. Confirm cancellation reason
5. Immediate confirmation and refund (if paid)

### 2.3 Support-Assisted Cancellation

For orders in "Paid" status not yet processing:
1. Customer contacts support (chat, email, phone)
2. Agent verifies order status in Medusa admin
3. If eligible, agent processes cancellation
4. Refund initiated automatically
5. Confirmation sent to customer

---

## 3. Refund Policy

### 3.1 Refund Eligibility

| Scenario | Eligible? | Refund Type | Timeframe |
|:---|:---|:---|:---|
| Order cancelled before shipment | Yes | Full refund | Immediate |
| Item out of stock, order cancelled | Yes | Full refund | Immediate |
| Defective product (DOA) | Yes | Full refund or replacement | Upon return receipt |
| Product not as described | Yes | Full refund | Upon return receipt |
| Wrong item shipped | Yes | Full refund or replacement | Upon return receipt |
| Change of mind (unopened) | Yes | Full refund minus return shipping | Within 14 days of delivery |
| Change of mind (opened) | Yes | Refund minus restocking fee (15%) | Within 14 days of delivery |
| Change of mind (used/damaged) | No | Store credit at discretion | Case by case |
| Beyond return window | No | — | — |
| Gift returns | Yes | Store credit or exchange | Within 14 days |

### 3.2 Regional Variations

| Region | Consumer Protection | Return Window | Notes |
|:---|:---|:---|:---|
| EU / UK | Consumer Rights Directive | 14 days mandatory | No restocking fee for online purchases |
| USA | State-dependent | 14–30 days typical | Follow state regulations |
| Bangladesh | Contractual | 14 days standard | As stated in terms |
| Other regions | Contractual | 14 days standard | As stated in terms |

---

## 4. Refund Calculation

### 4.1 Full Refund

| Component | Refunded? | Amount |
|:---|:---|:---|
| Product subtotal | Yes | 100% |
| Shipping cost | Yes (if order not shipped) | 100% |
| Shipping cost | No (if order shipped) | $0 |
| Discount / coupon | Yes | Proportional |
| Tax | Yes | Proportional to refund amount |
| Restocking fee | N/A (full refund) | $0 |

### 4.2 Partial Refund

| Scenario | Calculation |
|:---|:---|
| Partial return (some items kept) | Refund = returned items' price + proportional tax + shipping (if eligible) |
| Opened item return | Refund = item price - 15% restocking fee + proportional tax |
| Damaged item (customer-caused) | Refund = $0 or store credit at discretion |
| Price adjustment (price dropped) | Refund = difference in price (within 7 days of purchase) |

### 4.3 Store Credit

Store credit may be offered:
- As goodwill gesture for minor issues
- When customer prefers credit over refund
- For gift returns without receipt
- As faster alternative to payment refund

Store credit:
- Never expires
- Can be used for any purchase
- Can be combined with other payment methods
- Not transferable between accounts

---

## 5. Refund Processing Workflows

### 5.1 Automatic Refunds

Triggered automatically for:
- Self-service cancellations (before processing)
- Order cancellations due to stock unavailability
- Failed fraud checks (before shipment)

**Process:**
1. Cancellation event triggers refund workflow
2. Refund amount calculated automatically
3. Refund issued to original payment method
4. Customer notified via email
5. Transaction recorded in finance system

### 5.2 Manual Refunds

Required for:
- Returns after delivery
- Partial refunds
- Store credit issuance
- Goodwill gestures
- Payment method issues

**Process:**

| Step | Action | Owner | System |
|:---|:---|:---|:---|
| 1 | Refund request received and validated | Support Agent | Chatwoot / Medusa |
| 2 | Eligibility verified against policy | Support Agent | Medusa |
| 3 | Refund amount calculated | Support Agent | Medusa |
| 4 | Approval obtained (if over threshold) | Supervisor / Finance | — |
| 5 | Refund processed in payment gateway | Finance / Admin | Stripe / PayPal admin |
| 6 | Refund recorded in Medusa | Admin | Medusa |
| 7 | Customer notified | System | Email |
| 8 | Transaction logged for reconciliation | System | Finance system |

**Approval Thresholds:**

| Refund Amount | Approval Required |
|:---|:---|
| <$50 | Support Agent |
| $50–$200 | Support Supervisor |
| $200–$500 | E-Commerce Manager |
| >$500 | Finance Director |
| Any store credit >$100 | E-Commerce Manager |

### 5.3 Payment Method-Specific Procedures

| Payment Method | Refund Method | Timeline |
|:---|:---|:---|
| Credit/Debit Card (Stripe) | Reverse charge to original card | 5–10 business days |
| PayPal | Refund to PayPal account | 1–3 business days |
| Bank Transfer | Bank transfer to customer's account | 5–10 business days |
| Store Credit | Credit to customer account | Immediate |
| Gift Card | Credit to gift card or new gift card | Immediate |

---

## 6. Exception Handling

### 6.1 Failed Refunds

| Issue | Cause | Resolution |
|:---|:---|:---|
| Card expired / account closed | Customer's payment method no longer valid | Contact customer for alternative method or issue store credit |
| Refund exceeds original charge | Calculation error | Review and correct; process partial |
| Gateway error | Technical issue with payment provider | Retry; if persistent, escalate to IT and issue store credit |
| Duplicate refund | Accidental double processing | Reverse second refund; document incident |

### 6.2 Disputed Refunds

If customer disputes refund amount or eligibility:
1. Review case details and policy application
2. Escalate to supervisor if not resolvable
3. Offer store credit as compromise if appropriate
4. Document decision and rationale
5. If customer remains unsatisfied, offer formal complaint process

### 6.3 Chargebacks

| Step | Action | Owner |
|:---|:---|:---|
| 1 | Chargeback notification received from gateway | Finance |
| 2 | Gather evidence (order details, delivery proof, communications) | Support |
| 3 | Submit response to gateway within deadline (typically 10 days) | Finance |
| 4 | Monitor dispute outcome | Finance |
| 5 | If lost: Accept chargeback, update records | Finance |
| 6 | If won: Funds returned, update records | Finance |
| 7 | Analyze root cause, implement prevention | Operations |

---

## 7. Financial Reconciliation

### 7.1 Daily Reconciliation

| Check | Details |
|:---|:---|
| Refund total vs. payment gateway | Match Medusa refunds to Stripe/PayPal reports |
| Refund reason categorization | Ensure all refunds coded correctly |
| Exception review | Investigate any failed or unusual refunds |

### 7.2 Monthly Reporting

| Report | Content | Audience |
|:---|:---|:---|
| Refund summary | Volume, value, reasons, rates | E-Commerce Manager |
| Refund rate by product | Identify quality or description issues | Product Management |
| Refund rate by region | Identify regional patterns | Operations |
| Chargeback report | Volume, win/loss rate, reasons | Finance |
| Store credit liability | Outstanding credit balance | Finance |

---

## 8. Performance Metrics

| Metric | Target | Measurement |
|:---|:---|:---|
| Refund processing time | < 48 hours (from approval) | Time from approval to completion |
| Refund error rate | < 1% | Incorrect amounts / total refunds |
| Customer satisfaction (refund) | > 4.0 / 5.0 | Post-refund survey |
| Chargeback rate | < 0.5% | Chargebacks / total transactions |
| Refund rate | < 3% | Refunds / total orders |
| Store credit utilization | > 60% within 90 days | Credits used / Credits issued |

---

## 9. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Finance Director | | | |
| E-Commerce Manager | | | |
| Customer Support Lead | | | |
| Legal Counsel | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteRefundCancellationProcess.md`
