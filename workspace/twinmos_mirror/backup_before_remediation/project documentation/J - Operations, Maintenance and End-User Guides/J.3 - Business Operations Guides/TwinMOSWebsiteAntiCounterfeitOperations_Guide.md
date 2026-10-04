# TwinMOS Website — Anti-Counterfeit Operations Guide

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-032 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Brand Protection / Legal & IT Security |
| **Audience** | Brand Protection Team, Legal Counsel, Customer Support, Partner Managers, IT Operations |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §7.4), TWN-URD-2025-002 (URD §5.5), TWN-OPS-2026-030 (RMA Operations Guide), TWN-OPS-2026-033 (Counterfeit Report Triage Process) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide defines the operational procedures for managing TwinMOS's anti-counterfeit program through the corporate website. It covers:

- Serial number authentication and verification
- Counterfeit detection workflows
- Brand protection monitoring
- Partner and retailer verification
- Customer education and reporting
- Legal enforcement coordination
- Data analysis and trend identification

**Scope:** All anti-counterfeit activities related to TwinMOS products sold through official and third-party channels, with primary intake via the website.

---

## 2. Anti-Counterfeit System Overview

### 2.1 Core Components

| Component | Technology | Purpose |
|:---|:---|:---|
| Serial Number Database | Strapi + PostgreSQL | Master record of all legitimate serial numbers |
| Online Verification Tool | Astro frontend + Strapi API | Customer-facing serial check |
| Batch Verification API | REST API | Partner and B2B bulk checks |
| Reporting Portal | Strapi form + Chatwoot | Counterfeit incident intake |
| Monitoring Dashboard | Custom / Plausible | Analytics and trend detection |
| Alert System | Chatwoot + Email | Notifications for suspicious activity |

### 2.2 Verification Channels

| Channel | Access | Use Case |
|:---|:---|:---|
| Website Verification | `/support/verify-product` | Consumer single-product check |
| QR Code Scan | On product packaging | Direct to verification result |
| Partner API | Authenticated API key | Distributors, retailers bulk verification |
| Mobile (future) | Responsive web / PWA | On-the-go verification |

---

## 3. Serial Number Authentication

### 3.1 Verification Process

```
Customer enters serial → Format validation → Checksum verification →
Database lookup → Result returned
```

### 3.2 Result Types

| Result | Meaning | Customer Message | Action |
|:---|:---|:---|:---|
| **Authentic** | Valid serial, registered in database | "This is a genuine TwinMOS product." | None |
| **Authentic — Unregistered** | Valid serial, not yet registered | "Genuine product. Register for full warranty." | Prompt registration |
| **Already Verified** | Serial checked previously | "Previously verified on [date]." | Show history |
| **Not Found** | Serial not in database | "Serial not recognized. Contact support." | Flag for investigation |
| **Counterfeit Suspected** | Failed checksum or pattern match | "Potential counterfeit detected. Report for investigation." | Auto-create incident |
| **Blocked** | Known counterfeit serial | "This product has been identified as counterfeit." | Auto-create high-priority incident |

### 3.3 Rate Limiting

| Tier | Requests / Hour | Applies To |
|:---|:---|:---|
| Anonymous web | 10 | Unauthenticated website visitors |
| Registered user | 50 | Logged-in customer accounts |
| Partner API | 1,000 | Authenticated partner API keys |
| Internal | Unlimited | Staff via admin panel |

---

## 4. Counterfeit Detection Workflows

### 4.1 Automated Detection Triggers

| Trigger | Source | Severity | Auto-Action |
|:---|:---|:---|:---|
| Failed checksum | Verification API | Medium | Log + increment counter |
| Unknown serial pattern | Verification API | High | Flag + create incident |
| Bulk failed checks from IP | API logs | High | Rate limit + alert |
| Geographic anomaly | Verification location | Medium | Log for analysis |
| Retailer report | Partner portal | High | Create incident + notify legal |
| RMA counterfeit finding | RMA inspection | Critical | Create incident + block serial |
| Customer report | Website form | High | Create incident + acknowledge |

### 4.2 Incident Creation

All counterfeit incidents are created in the Strapi `counterfeit-incident` collection with:

| Field | Description |
|:---|:---|
| `incidentId` | Auto-generated: `CF-YYYY-XXXXXX` |
| `serialNumber` | Suspected counterfeit serial |
| `productModel` | Reported product model |
| `source` | How detected (verification, RMA, report, etc.) |
| `severity` | Low / Medium / High / Critical |
| `reporterInfo` | Customer or partner details |
| `purchaseLocation` | Where product was acquired |
| `evidence` | Photos, documents, descriptions |
| `status` | Open / Under Investigation / Confirmed / Closed |
| `assignedTo` | Investigator |
| `resolution` | Final determination |
| `legalAction` | Yes / No / Pending |

---

## 5. Investigation Procedures

### 5.1 Investigation Team Roles

| Role | Responsibilities |
|:---|:---|
| **Tier 1 Analyst** | Initial triage, data collection, customer contact |
| **Tier 2 Investigator** | Deep investigation, retailer/partner follow-up |
| **Brand Protection Lead** | Case oversight, legal coordination, escalation |
| **Legal Counsel** | Cease & desist, litigation, law enforcement liaison |

### 5.2 Investigation Workflow

**Phase 1: Triage (0–24 hours)**
1. Incident reviewed and assigned
2. Serial number cross-checked against production records
3. Initial evidence assessment (photos, purchase documentation)
4. Severity confirmed or adjusted
5. Customer contacted for additional information if needed

**Phase 2: Investigation (1–14 days)**
1. Purchase source traced (retailer, marketplace, distributor)
2. Similar incidents checked for patterns
3. Partner / retailer notified if authorized channel involved
4. Geographic clustering analyzed
5. Product samples obtained if possible

**Phase 3: Resolution (1–30 days)**
1. Determination: Confirmed counterfeit / False positive / Inconclusive
2. If confirmed:
   - Serial number added to blocked list
   - Legal review for enforcement action
   - Retailer/distributor notified and relationship reviewed
   - Public advisory issued if widespread
3. If false positive: Close with explanation, update detection rules
4. Case documented and closed

---

## 6. Partner & Retailer Verification

### 6.1 Authorized Partner Registry

Maintained in Strapi `authorized-partner` collection:

| Field | Purpose |
|:---|:---|
| `companyName` | Legal business name |
| `businessType` | Distributor / Retailer / E-commerce / OEM |
| `region` | Authorized geographic region |
| `verificationStatus` | Verified / Pending / Suspended / Revoked |
| `apiKey` | For batch verification access |
| `contactInfo` | Primary contact for anti-counterfeit matters |
| `lastAuditDate` | Date of last compliance check |

### 6.2 Partner Compliance Requirements

- Annual verification of supply chain documentation
- Immediate reporting of suspected counterfeit products
- Cooperation with investigations
- Display of TwinMOS authenticity messaging
- Participation in training programs

### 6.3 Suspension Triggers

- Confirmed sale of counterfeit products
- Failure to cooperate with investigation
- Pattern of customer counterfeit reports
- Unauthorized distribution outside assigned region

---

## 7. Customer Education

### 7.1 Website Content

| Content Piece | Location | Purpose |
|:---|:---|:---|
| "How to Spot a Fake" guide | `/support/authenticity` | Visual guide to genuine vs. counterfeit |
| Verification tutorial | `/support/verify-product` | Step-by-step verification instructions |
| Authorized retailer list | `/support/where-to-buy` | Direct customers to verified sellers |
| Report counterfeit CTA | `/support/report-counterfeit` | Easy access to reporting form |
| FAQ | `/support/faq` | Common questions about authenticity |

### 7.2 Packaging & Product

- QR code on all retail packaging linking to verification
- Holographic security seal (selected product lines)
- Serial number in multiple locations (product + packaging)
- "Verify before you buy" messaging

---

## 8. Legal Enforcement Coordination

### 8.1 Evidence Preservation

All counterfeit incidents require preservation of:
- Original customer report and communications
- Product photos and serial number evidence
- Purchase documentation
- Investigation notes and findings
- Correspondence with retailers or partners

**Retention:** 7 years minimum for confirmed counterfeits; legal hold if litigation pending.

### 8.2 Enforcement Actions

| Action | Authority | Trigger | Timeline |
|:---|:---|:---|:---|
| Cease & Desist letter | Legal Counsel | Confirmed counterfeit from known source | 7 days |
| Marketplace takedown | Brand Protection + Legal | Counterfeit listings on e-commerce platforms | 3–5 days |
| Partner suspension | Partner Management | Authorized partner selling counterfeits | Immediate |
| Law enforcement referral | Legal Counsel | Large-scale operation or organized counterfeit | Case by case |
| Public advisory | Marketing + Legal | Widespread counterfeit product in market | 48 hours |

---

## 9. Reporting & Analytics

| Report | Frequency | Audience | Key Insights |
|:---|:---|:---|:---|
| Counterfeit Incident Summary | Weekly | Brand Protection Lead | Volume, severity, status, trends |
| Geographic Heat Map | Monthly | Legal + Management | Hotspots by country/region |
| Product Line Risk Assessment | Quarterly | Product Management | Which products most counterfeited |
| Partner Compliance Scorecard | Quarterly | Partner Management | Verification rates, incident correlation |
| Verification Volume & Rate | Monthly | Operations | Total checks, authentic vs. suspect rates |
| Legal Action Tracker | Monthly | Legal Counsel | Cases, outcomes, costs |

---

## 10. System Configuration

### 10.1 Strapi Content Types

| Collection | Purpose |
|:---|:---|
| `serial-number-master` | All legitimate serial numbers from manufacturing |
| `counterfeit-incident` | Investigation cases and tracking |
| `authorized-partner` | Verified distribution partners |
| `blocked-serial` | Known counterfeit serial numbers |
| `verification-log` | Audit trail of all verification attempts |

### 10.2 API Endpoints

| Endpoint | Method | Auth | Purpose |
|:---|:---|:---|:---|
| `/api/verify-serial` | POST | None (rate limited) | Public serial verification |
| `/api/batch-verify` | POST | API Key | Partner bulk verification |
| `/api/report-counterfeit` | POST | None | Public counterfeit reporting |
| `/api/counterfeit-incidents` | GET | Admin | Internal incident management |

---

## 11. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Brand Protection Lead | | | |
| Legal Counsel | | | |
| IT Security | | | |
| Partner Management | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteAntiCounterfeitOperations_Guide.md`
