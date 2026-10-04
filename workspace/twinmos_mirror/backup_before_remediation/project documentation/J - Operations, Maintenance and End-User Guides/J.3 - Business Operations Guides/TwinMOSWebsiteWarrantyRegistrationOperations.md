# TwinMOS Website — Warranty Registration Operations Guide

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-031 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Customer Support / Product Management |
| **Audience** | Customer Support Agents, Marketing Team, Data Analysts, IT Operations |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §7.3), TWN-URD-2025-002 (URD §5.4), TWN-OPS-2026-030 (RMA Operations Guide) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide defines the operational procedures for managing product warranty registrations submitted through the TwinMOS corporate website. It covers:

- Warranty registration form intake and validation
- Serial number verification and database management
- Extended warranty activation
- Customer communication and confirmation
- Data quality and reporting
- Integration with RMA and anti-counterfeit systems

**Scope:** All warranty registrations for TwinMOS consumer and enterprise products submitted via the official website.

---

## 2. Warranty Registration Channels

| Channel | URL / Access | Notes |
|:---|:---|:---|
| Website Registration Form | `/support/warranty-registration` | Primary channel; multi-step form |
| QR Code (Retail Packaging) | Scans to registration URL | Auto-fills product model |
| Partner Portal | Partner dashboard bulk upload | B2B batch registrations |
| Customer Service | Agent-assisted registration | For customers unable to use web form |

---

## 3. Registration Form Fields

### 3.1 Required Fields

| Field | Validation | Purpose |
|:---|:---|:---|
| Product Category | Dropdown (Memory, SSD, USB, Card, Peripheral) | Determines warranty terms |
| Product Model | Dropdown (populated by category) | Identifies specific product |
| Serial Number | Alphanumeric, 8–20 characters, checksum | Unique product identifier |
| Purchase Date | Date picker, not future, within 2 years | Warranty start date |
| Purchase Location | Dropdown + free text | Channel tracking |
| Upload Proof of Purchase | Image/PDF, max 5MB | Verification document |
| Customer Name | Text, 2–100 characters | Warranty holder |
| Email Address | Valid email format | Primary communication |
| Phone Number | E.164 format with country code | Secondary contact |
| Country / Region | Dropdown (9 supported locales) | Regional warranty terms |

### 3.2 Optional Fields

| Field | Purpose |
|:---|:---|
| Mailing Address | For replacement shipping |
| Preferred Contact Method | Email / Phone / SMS |
| Newsletter Opt-In | Marketing consent |
| Product Usage | Personal / Gaming / Professional / Enterprise |
| Where did you hear about us? | Marketing attribution |

---

## 4. Serial Number Validation

### 4.1 Validation Rules

| Check | Description | Failure Action |
|:---|:---|:---|
| Format validation | Matches expected pattern for product line | Reject with format guidance |
| Checksum verification | Internal checksum algorithm | Reject as invalid serial |
| Duplication check | Not already registered | Reject with lookup option |
| Production database | Exists in manufacturing records | Reject if not found (possible counterfeit) |
| Counterfeit flag | Not on known counterfeit list | Flag for investigation |
| Previous RMA | Not associated with closed RMA | Allow with note |

### 4.2 Serial Number Format by Product Line

| Product Line | Format Example | Length | Checksum |
|:---|:---|:---|:---|
| DDR Memory | `TM-DDR5-32G-XXXXXX` | 18 chars | Mod-11 |
| SATA SSD | `TM-SSD-S1TB-XXXXXX` | 18 chars | Mod-11 |
| NVMe SSD | `TM-NVMe-2TB-XXXXXX` | 18 chars | Mod-11 |
| USB Drive | `TM-USB-128G-XXXXX` | 17 chars | Mod-11 |
| Memory Card | `TM-SD-256G-XXXXX` | 17 chars | Mod-11 |
| Gaming Mouse | `TM-GM-PRO-XXXXX` | 15 chars | Mod-11 |

---

## 5. Registration Workflow

### Phase 1: Submission (Customer)

1. Customer navigates to `/support/warranty-registration`
2. Selects product category and model
3. Enters serial number (real-time validation provides feedback)
4. Completes personal and purchase information
5. Uploads proof of purchase
6. Submits form

### Phase 2: Automated Processing (System)

| Step | Action | Result |
|:---|:---|:---|
| 2.1 | Form data validated | Errors returned immediately if invalid |
| 2.2 | Serial number verified against production DB | Pass / Fail / Flag |
| 2.3 | Duplicate check performed | New registration or merge prompt |
| 2.4 | Warranty end date calculated | Based on product + registration date |
| 2.5 | Registration record created in Strapi | `warranty-registration` collection |
| 2.6 | Confirmation email sent | Contains registration details and warranty certificate |
| 2.7 | If extended warranty eligible: offer presented | Email with activation link |

### Phase 3: Manual Review (If Required)

Manual review triggered when:
- Serial number fails production database check
- Proof of purchase is unclear or suspicious
- Duplicate registration detected
- Counterfeit flag raised
- Bulk registration from unusual source

| Reviewer | Action | SLA |
|:---|:---|:---|
| Support Agent | Verify documentation, contact customer if needed | 48 hours |
| Supervisor | Approve/reject flagged registrations | 24 hours |
| Anti-Counterfeit Team | Investigate counterfeit flags | 72 hours |

### Phase 4: Confirmation & Certificate

Upon approval:
1. Warranty certificate generated (PDF)
2. Email sent with:
   - Registration confirmation number
   - Warranty start and end dates
   - Product details
   - Terms and conditions link
   - RMA portal link
   - Extended warranty offer (if applicable)
3. Customer account updated (if registered user)
4. Data synced to CRM and analytics

---

## 6. Extended Warranty Activation

### 6.1 Eligibility

| Product Category | Standard | Extended | Activation Window | Cost |
|:---|:---|:---|:---|:---|
| SSD (SATA/NVMe) | 3 years | +2 years (total 5) | Within 30 days of purchase | $15–$45 (by capacity) |
| External SSD | 3 years | +2 years (total 5) | Within 30 days of purchase | $20–$50 (by capacity) |

### 6.2 Activation Process

1. Customer clicks extended warranty link in confirmation email
2. System verifies eligibility (within 30-day window, product category eligible)
3. Payment processed via integrated payment gateway (Phase 3)
4. Extended warranty record created and linked to base registration
5. Updated certificate emailed to customer

---

## 7. Data Management

### 7.1 Strapi Content Type: `warranty-registration`

| Field | Type | Notes |
|:---|:---|:---|
| `registrationNumber` | UID | Auto-generated: `WR-YYYY-XXXXXX` |
| `serialNumber` | String | Unique, indexed |
| `product` | Relation → `product` | Links to product catalog |
| `productCategory` | Enumeration | Memory, SSD, USB, Card, Peripheral |
| `purchaseDate` | Date | Warranty start |
| `warrantyEndDate` | Date | Calculated |
| `extendedWarranty` | Boolean | |
| `extendedWarrantyEndDate` | Date | If applicable |
| `customerName` | String | |
| `customerEmail` | Email | |
| `customerPhone` | String | |
| `country` | Relation → `country` | |
| `proofOfPurchase` | Media | PDF or image |
| `purchaseLocation` | String | |
| `status` | Enumeration | Pending, Approved, Rejected, Under Review |
| `reviewNotes` | Text | Internal use |
| `registrationDate` | DateTime | Auto |
| `lastUpdated` | DateTime | Auto |

### 7.2 Data Retention

| Data Type | Retention Period | Action After |
|:---|:---|:---|
| Active warranty records | Duration of warranty + 2 years | Archive |
| Archived records | 7 years total | Secure deletion |
| Proof of purchase files | Duration of warranty + 2 years | Delete |
| Failed/invalid registrations | 90 days | Delete |

### 7.3 Privacy & Compliance

- All personal data handled per TwinMOS Privacy Policy and GDPR (for EU customers)
- Consent captured for marketing communications
- Data export available upon customer request (GDPR Article 20)
- Right to erasure requests processed within 30 days (where not overridden by legal retention)

---

## 8. Reporting & Analytics

| Report | Frequency | Owner | Key Metrics |
|:---|:---|:---|:---|
| Registration Volume | Weekly | Marketing | Total registrations, by product, by region |
| Conversion Rate | Monthly | Marketing | Registrations / Units Sold (by channel) |
| Extended Warranty Uptake | Monthly | Product Mgmt | % of eligible customers purchasing extension |
| Data Quality Score | Monthly | Operations | % registrations with complete, valid data |
| Counterfeit Detection | Weekly | Security | Flags raised, confirmed counterfeits |
| Registration-to-RMA Correlation | Quarterly | Support | RMA rate by registration status |

---

## 9. Troubleshooting Common Issues

| Issue | Cause | Resolution |
|:---|:---|:---|
| "Serial number not found" | Not yet in production DB (recent purchase) | Allow retry in 7 days; agent can override with proof |
| "Serial number already registered" | Previous owner registered; or duplicate | Lookup existing record; offer transfer with proof |
| Upload fails | File too large or wrong format | Guide customer to compress or convert |
| Extended warranty link expired | >30 days since purchase | Deny; offer standard warranty only |
| Email not received | Spam filter, wrong address | Resend; verify address; check spam guidance |
| Country not in dropdown | Unsupported region | Direct to regional partner or email support |

---

## 10. System Integration

| System | Purpose | Integration Method |
|:---|:---|:---|
| Strapi (Warranty DB) | Master registration data | Native |
| Strapi (Product Catalog) | Product and warranty term lookup | Relation |
| Strapi (RMA) | Cross-reference for returns | API |
| Anti-Counterfeit System | Serial validation and flagging | API |
| Chatwoot | Customer support tickets | Webhook |
| Medusa.js (P3) | Order verification for e-commerce purchases | API |
| Email Service | Confirmation and certificate delivery | SMTP/API |
| Analytics (Plausible) | Form conversion tracking | Script |

---

## 11. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Customer Support Lead | | | |
| Product Management | | | |
| IT Operations | | | |
| Data Protection Officer | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteWarrantyRegistrationOperations.md`
