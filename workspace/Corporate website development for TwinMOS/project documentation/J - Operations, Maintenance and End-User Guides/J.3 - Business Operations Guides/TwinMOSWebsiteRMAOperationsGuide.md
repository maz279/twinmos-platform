# TwinMOS Website — RMA (Return Merchandise Authorization) Operations Guide

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-030 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS IT Operations / Customer Support Lead |
| **Audience** | RMA Coordinators, Customer Support Agents, Warehouse Staff, Finance Team |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §7.3), TWN-URD-2025-002 (URD §5.4), TWN-OPS-2026-029 (Customer Support Playbook), TWN-OPS-2026-034 (Refund & Cancellation Process) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide defines the end-to-end operational procedures for processing Return Merchandise Authorization (RMA) requests submitted through the TwinMOS corporate website. It covers:

- RMA request intake via web form, email, and phone
- Eligibility verification and warranty validation
- RMA number generation and tracking
- Return shipping coordination
- Receiving, inspection, and disposition workflows
- Refund, replacement, or repair resolution
- Reporting and continuous improvement

**Scope:** All RMA requests for TwinMOS products sold through the official website, partner channels, and authorized retailers.

---

## 2. RMA Request Channels

| Channel | System / Tool | Response SLA | Notes |
|:---|:---|:---|:---|
| Website RMA Form | Strapi form → Chatwoot ticket | 24 business hours | Primary channel; auto-creates ticket |
| Email | support@twinmos.com | 24 business hours | Forwarded to Chatwoot automatically |
| Phone | +880-XXX-XXXX (Dhaka HQ) | Immediate (during hours) | Agent creates ticket manually |
| Partner Portal | Partner dashboard → internal queue | 48 business hours | B2B bulk returns |
| Live Chat | Chatwoot | Immediate | Escalated to RMA queue if complex |

---

## 3. RMA Eligibility Criteria

### 3.1 General Requirements

Before an RMA is approved, the following must be verified:

| Check | Details | Responsible |
|:---|:---|:---|
| Purchase proof | Valid invoice, receipt, or order confirmation | Customer (provide) / Agent (verify) |
| Warranty status | Within warranty period (see Section 4) | System auto-check |
| Product condition | Unmodified, no physical damage (unless DOA) | Agent assessment |
| Return window | Within 14 days for refund (EU: 14 days by law) | System auto-check |
| Region lock | Product purchased from authorized region | Agent verification |
| Serial number | Valid and not flagged (counterfeit check) | Anti-counterfeit system |

### 3.2 Non-Returnable Items

- Products with removed or defaced serial numbers
- Items damaged by misuse, overclocking, or improper installation
- Software or digital products (once activated)
- Special-order or customized products (unless defective)
- Products purchased from unauthorized resellers

---

## 4. Warranty Validation

### 4.1 Warranty Periods by Product Category

| Product Category | Standard Warranty | Extended Warranty | Registration Required |
|:---|:---|:---|:---|
| DDR4/DDR5 Memory Modules | Lifetime | N/A | Recommended |
| SSD (SATA/NVMe) | 3 years | +2 years (register within 30 days) | Yes for extended |
| USB Flash Drives | 5 years | N/A | Recommended |
| Memory Cards | 5 years | N/A | Recommended |
| External SSDs | 3 years | +2 years (register within 30 days) | Yes for extended |
| Gaming Peripherals | 2 years | N/A | Recommended |
| Enterprise/Industrial | Per contract | Per contract | Per contract |

### 4.2 Warranty Validation Process

1. **Customer provides serial number** via RMA form or to agent
2. **System lookup** queries the warranty registration database (Strapi + PostgreSQL)
3. **Auto-verification** checks:
   - Serial number exists in production database
   - Purchase date within warranty period
   - Not previously returned or flagged
   - Not on counterfeit watchlist
4. **Result returned** to agent with:
   - Warranty status (Valid / Expired / Not Found)
   - Remaining warranty period
   - Original purchase details (if registered)

---

## 5. RMA Workflow — Step by Step

### Phase 1: Intake (0–24 hours)

| Step | Action | System | Owner |
|:---|:---|:---|:---|
| 1.1 | Customer submits RMA request | Website form / Chatwoot | Customer |
| 1.2 | Auto-acknowledgment email sent | Chatwoot automation | System |
| 1.3 | Ticket created and categorized | Chatwoot | System |
| 1.4 | Agent reviews request, verifies eligibility | Chatwoot + Strapi admin | Support Agent |
| 1.5 | Warranty validation performed | Warranty DB lookup | System / Agent |
| 1.6 | Decision: Approve / Request info / Decline | Chatwoot | Support Agent |

### Phase 2: Approval & Shipping (24–72 hours)

| Step | Action | System | Owner |
|:---|:---|:---|:---|
| 2.1 | If approved: RMA number generated | Internal RMA system | System |
| 2.2 | Return instructions emailed to customer | Chatwoot / Email | System |
| 2.3 | Prepaid return label issued (if applicable) | Logistics integration | System / Agent |
| 2.4 | Customer ships product with RMA number visible | Carrier | Customer |
| 2.5 | Tracking number logged in ticket | Chatwoot | Agent (if provided) |

**RMA Number Format:** `RMA-YYYY-XXXXXX` (e.g., `RMA-2026-004219`)

### Phase 3: Receiving & Inspection (0–3 days after receipt)

| Step | Action | System | Owner |
|:---|:---|:---|:---|
| 3.1 | Package received at RMA facility | Warehouse system | Warehouse Staff |
| 3.2 | RMA number scanned, ticket updated | Barcode scanner + API | Warehouse Staff |
| 3.3 | Physical inspection performed | Inspection checklist | QC Technician |
| 3.4 | Photos taken of product condition | Digital camera / phone | QC Technician |
| 3.5 | Inspection results logged | Strapi (RMA collection) | QC Technician |
| 3.6 | Disposition assigned | System + supervisor | QC Lead |

**Inspection Checklist:**
- [ ] Serial number matches RMA record
- [ ] Physical damage assessment (none / minor / major)
- [ ] Accessories completeness (retail packaging, manuals, etc.)
- [ ] Functional test (if applicable)
- [ ] Counterfeit verification (scan serial against database)

### Phase 4: Disposition & Resolution (1–5 days after inspection)

| Disposition | Criteria | Resolution | SLA |
|:---|:---|:---|:---|
| **Replace** | Defective confirmed, stock available | Ship replacement; customer keeps or returns original per policy | 3 business days |
| **Repair** | Defective confirmed, repairable, no stock | Repair and return; or offer replacement if repair >7 days | 7–14 business days |
| **Refund** | Within return window, no defect, or DOA | Process refund to original payment method | 5–10 business days |
| **Partial Refund** | Minor cosmetic damage, still functional | Negotiated partial refund or store credit | 3 business days |
| **Return to Customer** | No defect found, misuse, or out of warranty | Return at customer expense with explanation | 3 business days |
| **Scrap / Recycle** | Beyond repair, no replacement value | Dispose per WEEE/e-waste regulations; issue refund if warranted | 5 business days |

### Phase 5: Closure & Follow-Up

| Step | Action | System | Owner |
|:---|:---|:---|:---|
| 5.1 | Resolution executed (ship replacement / process refund) | ERP / E-commerce system | Warehouse / Finance |
| 5.2 | Tracking number or refund confirmation sent | Chatwoot / Email | System |
| 5.3 | Customer satisfaction survey sent | Chatwoot (48 hours after closure) | System |
| 5.4 | Ticket closed with resolution code | Chatwoot | Agent |
| 5.5 | Data aggregated for reporting | Analytics dashboard | Automatic |

---

## 6. RMA Status Definitions

| Status | Description | Visible to Customer? |
|:---|:---|:---|
| **Submitted** | Request received, pending review | Yes |
| **Under Review** | Agent verifying eligibility and warranty | Yes |
| **Info Requested** | Awaiting additional information from customer | Yes |
| **Approved** | RMA approved, return instructions sent | Yes |
| **Shipped to Us** | Customer has shipped item, in transit | Yes |
| **Received** | Item received at facility, awaiting inspection | Yes |
| **In Inspection** | Quality control inspection in progress | Yes |
| **Awaiting Disposition** | Inspection complete, awaiting resolution decision | No |
| **Replacement Shipped** | Replacement item shipped to customer | Yes |
| **Refund Processing** | Refund initiated to finance | Yes |
| **Refund Issued** | Refund completed | Yes |
| **Return to Customer** | Item being returned to customer (no action) | Yes |
| **Closed** | RMA resolved and closed | Yes |
| **Declined** | RMA request declined with reason | Yes |
| **Escalated** | Escalated to supervisor or specialized team | No |

---

## 7. Special RMA Scenarios

### 7.1 Dead on Arrival (DOA)

- **Definition:** Product non-functional upon first use, reported within 7 days of delivery
- **Process:** Fast-track approval; replacement shipped immediately upon receipt confirmation (advance replacement available for registered customers)
- **Documentation:** Delivery tracking + customer statement sufficient; full inspection still performed

### 7.2 Bulk / B2B RMAs

- **Threshold:** 10+ units or value >$5,000
- **Process:** Dedicated partner portal workflow; assigned account manager
- **Shipping:** TwinMOS arranges collection; prepaid freight
- **Resolution:** Prioritized based on contract terms

### 7.3 Cross-Border RMAs

- **EU Customers:** Must comply with EU Consumer Rights Directive (14-day withdrawal)
- **Non-EU Customers:** Follow standard warranty terms; customer may bear return shipping
- **Customs:** RMA documentation must include commercial invoice marked "Warranty Return — No Commercial Value"

### 7.4 Counterfeit Products

- If inspection reveals counterfeit product:
  1. Do not return to customer
  2. Flag serial number in anti-counterfeit database
  3. Generate counterfeit incident report (see TWN-OPS-2026-032)
  4. Notify customer with explanation and purchase guidance
  5. No warranty coverage; no refund unless purchased from authorized channel with proof

---

## 8. System Configuration & Data

### 8.1 Strapi Content Types

| Collection | Purpose | Key Fields |
|:---|:---|:---|
| `rma-request` | Store RMA submissions | rmaNumber, customerInfo, productDetails, status, warrantyStatus |
| `rma-inspection` | Inspection records | rma (relation), condition, photos, disposition, inspector |
| `warranty-registration` | Warranty database | serialNumber, product, purchaseDate, warrantyEndDate, customer |

### 8.2 Chatwoot Configuration

- **RMA Label:** Auto-applied to tickets containing "RMA" or submitted via RMA form
- **Custom Attributes:** RMA Number, Serial Number, Warranty Status, Disposition
- **Macros:**
  - `RMA: Request Info` — Standard info request template
  - `RMA: Approved` — Approval with instructions template
  - `RMA: Declined` — Decline with reason template
  - `RMA: Closed` — Closure with survey link template

### 8.3 Integration Points

| System | Integration | Data Flow |
|:---|:---|:---|
| Strapi (RMA) | Chatwoot | Ticket creation, status updates |
| Strapi (Warranty) | RMA workflow | Warranty validation lookup |
| Medusa.js (P3) | RMA system | Order lookup, refund processing |
| ERP / Accounting | RMA system | Refund approval, inventory adjustment |
| Logistics (carrier API) | RMA system | Label generation, tracking updates |

---

## 9. Performance Metrics & KPIs

| Metric | Target | Measurement |
|:---|:---|:---|
| First Response Time | < 24 business hours | Chatwoot analytics |
| RMA Approval Rate | > 85% of valid requests | (Approved / Total Valid) × 100 |
| Average Resolution Time | < 10 business days | From submission to closure |
| Customer Satisfaction (CSAT) | > 4.2 / 5.0 | Post-RMA survey |
| Refund Processing Time | < 5 business days | From approval to refund completion |
| Replacement Ship Time | < 3 business days | From approval to carrier handoff |
| Return to Customer Rate | < 10% | (No-action / Total) × 100 |
| RMA Escalation Rate | < 5% | (Escalated / Total) × 100 |

---

## 10. Escalation Triggers

Escalate to RMA Supervisor or Operations Manager when:

- RMA value exceeds $2,000
- Customer has submitted 3+ RMAs in 12 months
- Disposition is disputed by customer
- Counterfeit product detected
- Legal or regulatory implications (EU consumer rights, etc.)
- Media or social media attention risk
- SLA breach imminent (> 80% of resolution SLA elapsed)

---

## 11. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Customer Support Lead | | | |
| Warehouse / Logistics Lead | | | |
| Finance Representative | | | |
| IT Operations | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteRMAOperationsGuide.md`
