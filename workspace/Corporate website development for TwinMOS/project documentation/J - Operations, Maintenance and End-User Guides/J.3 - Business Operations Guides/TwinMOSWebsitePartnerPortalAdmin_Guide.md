# TwinMOS Website — Partner Portal Administration Guide

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-034 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Partner Management / IT Operations |
| **Audience** | Partner Managers, Portal Administrators, IT Support, Sales Operations |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §8.2), TWN-URD-2025-002 (URD §6.2), TWN-OPS-2026-032 (Anti-Counterfeit Operations Guide) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide defines the administration and operational procedures for managing the TwinMOS Partner Portal. It covers:

- Partner onboarding and account provisioning
- Role and permission management
- Content and resource management
- Deal registration and lead management
- Co-marketing tools and assets
- Performance reporting and analytics
- Portal maintenance and troubleshooting

**Scope:** All administrative activities related to the TwinMOS Partner Portal, including distributors, resellers, system integrators, and e-commerce partners.

---

## 2. Partner Portal Overview

### 2.1 Portal Features (Phase 2)

| Feature | Description | Access Level |
|:---|:---|:---|
| Partner Dashboard | Overview of performance, leads, and notifications | All partners |
| Deal Registration | Register opportunities for protection and tracking | Resellers, SI |
| Lead Distribution | Receive and manage assigned leads | Approved partners |
| Marketing Library | Download co-branded assets, datasheets, images | All partners |
| Product Catalog | Access detailed specs, pricing tiers, availability | Approved partners |
| Training & Certification | Access training modules and track certifications | All partners |
| RMA Bulk Submission | Submit bulk RMA requests | Distributors |
| Serial Verification API | Batch product authenticity checks | All partners |
| Performance Reports | Sales data, pipeline, and commission tracking | Approved partners |
| Co-op Funds Tracker | View and claim marketing development funds | Eligible partners |

### 2.2 Partner Tiers

| Tier | Requirements | Benefits |
|:---|:---|:---|
| **Registered** | Signed agreement, basic profile | Marketing library access, training |
| **Authorized** | Met sales targets, completed certification | Lead distribution, deal registration, pricing access |
| **Premier** | Top 10% performance, multi-year commitment | Dedicated manager, co-op funds, early product access, API access |
| **Distributor** | Authorized distribution agreement | Bulk tools, inventory feeds, highest discount tier |

---

## 3. Partner Onboarding

### 3.1 Onboarding Workflow

| Step | Action | Owner | System | SLA |
|:---|:---|:---|:---|:---|
| 1 | Partner submits application via `/partners/apply` | Partner | Strapi form | — |
| 2 | Application received, auto-acknowledgment sent | System | Chatwoot | Immediate |
| 3 | Application reviewed by Partner Manager | Partner Manager | Strapi admin | 3 business days |
| 4 | Background and reference checks | Partner Manager | External | 5 business days |
| 5 | Decision: Approve / Request info / Decline | Partner Manager | Strapi admin | 1 business day |
| 6 | If approved: Account created, credentials sent | IT / System | Strapi + Email | 1 business day |
| 7 | Welcome email with onboarding checklist | System | Email | Immediate |
| 8 | Partner completes profile and training | Partner | Portal | 14 days |
| 9 | Account activated for full access | Partner Manager | Strapi admin | Upon completion |

### 3.2 Application Requirements

| Required Document | Purpose |
|:---|:---|
| Business registration / incorporation | Verify legal entity |
| Tax ID / VAT number | Compliance and invoicing |
| Bank details | Commission and co-op payments |
| Trade references (2 minimum) | Business verification |
| Signed partner agreement | Legal terms acceptance |
| Primary contact details | Communication and account management |
| Intended market and customer segment | Territory assignment |

### 3.3 Account Provisioning

**Strapi Admin Actions:**
1. Navigate to Content Manager → Partner collection
2. Create new entry with application data
3. Set partner tier to "Registered" (default)
4. Generate temporary password (must change on first login)
5. Assign territory and product categories
6. Set account manager (Partner Manager assignment)
7. Enable portal access flag
8. Send welcome email with login credentials and onboarding guide

---

## 4. Role and Permission Management

### 4.1 Portal User Roles

| Role | Permissions | Typical Assignee |
|:---|:---|:---|
| **Partner Admin** | Full access to company account, user management, reports | Business owner / manager |
| **Sales User** | Deal registration, lead management, pricing view | Sales representatives |
| **Marketing User** | Asset download, co-op claims, campaign tools | Marketing staff |
| **Support User** | RMA submission, serial verification, support tickets | Support / operations staff |
| **Read-Only** | View reports and catalog, no edit rights | Finance / executive |

### 4.2 Managing Partner Users

**Adding a User:**
1. Partner Admin (or TwinMOS admin) logs into portal
2. Navigate to "Company Settings" → "User Management"
3. Click "Add User"
4. Enter: Name, Email, Phone, Role
5. System sends invitation email with setup link
6. User sets password and completes profile

**Deactivating a User:**
1. Navigate to "Company Settings" → "User Management"
2. Select user, click "Deactivate"
3. User immediately loses access
4. Historical activity preserved for audit

---

## 5. Content and Resource Management

### 5.1 Marketing Asset Library

Administrators can manage assets in Strapi:

| Asset Type | Format | Organization |
|:---|:---|:---|
| Product images | PNG, JPG, WebP | By product line, resolution |
| Datasheets | PDF | By product, language |
| Logos and brand guidelines | AI, EPS, PNG, PDF | By use case (print, web, co-brand) |
| Presentation templates | PPTX | By audience (enterprise, consumer) |
| Video content | MP4 | By product, length |
| Banner ads | HTML5, GIF, JPG | By size (common IAB sizes) |

**Upload Process:**
1. Navigate to Media Library in Strapi admin
2. Create folder structure: `partner-portal/[category]/[language]`
3. Upload files with descriptive names
4. Add metadata: Title, Description, Tags, Allowed Tiers
5. Publish to make visible in portal

### 5.2 Product Catalog Management

| Data Element | Source | Update Frequency |
|:---|:---|:---|
| Product specs | Strapi product collection | As products launch/change |
| Pricing tiers | ERP / pricing system | Monthly or as negotiated |
| Availability / stock | ERP / inventory system | Daily sync |
| QVL (Qualified Vendor List) | Strapi QVL collection | As certified |

---

## 6. Deal Registration

### 6.1 Deal Registration Process

| Step | Action | Owner |
|:---|:---|:---|
| 1 | Partner submits deal via portal | Partner |
| 2 | System checks for conflicts (existing registrations, direct sales) | System |
| 3 | Deal assigned to account manager for approval | System |
| 4 | Account manager reviews and approves/declines | Partner Manager |
| 5 | If approved: Deal protected for partner (typically 90 days) | System |
| 6 | Partner updates deal status as it progresses | Partner |
| 7 | Deal closed (won/lost) and commission calculated | System / Finance |

### 6.2 Deal Registration Fields

| Field | Required | Notes |
|:---|:---|:---|
| Customer company name | Yes | |
| Customer contact | Yes | |
| Customer industry | Yes | Dropdown |
| Expected value | Yes | Currency |
| Expected close date | Yes | Date |
| Products of interest | Yes | Multi-select from catalog |
| Competition | No | Free text |
| Probability | No | Percentage |
| Notes | No | Free text |

### 6.3 Conflict Resolution

| Conflict Type | Resolution |
|:---|:---|
| Duplicate registration | First-registered wins; notify both parties |
| Direct sales overlap | Partner protected if registered before direct engagement |
| Territory violation | Referred to partner's assigned territory manager |
| Pricing dispute | Escalated to Partner Manager and Sales Director |

---

## 7. Lead Distribution

### 7.1 Lead Assignment Rules

| Rule | Priority | Description |
|:---|:---|:---|
| Territory match | 1 | Lead assigned to partner in customer's region |
| Tier priority | 2 | Premier partners receive leads before Authorized |
| Performance score | 3 | Higher-performing partners receive more leads |
| Specialization | 4 | Leads matched to partner's stated expertise |
| Round-robin | 5 | Even distribution within tier/territory |

### 7.2 Lead Lifecycle

| Status | Definition | Partner Action |
|:---|:---|:---|
| **New** | Just assigned, not yet viewed | Review and accept/decline |
| **Accepted** | Partner committed to pursue | Contact customer within 24 hours |
| **Contacted** | Initial contact made | Continue qualification |
| **Qualified** | Valid opportunity identified | Register as deal |
| **Converted** | Became registered deal | Update deal record |
| **Declined** | Partner cannot pursue | Provide reason, lead reassigned |
| **Expired** | No action within 72 hours | Lead reassigned automatically |

---

## 8. Reporting and Analytics

### 8.1 Partner Performance Dashboard

| Metric | Description | Frequency |
|:---|:---|:---|
| Registered deals | Count and value of registered deals | Real-time |
| Win rate | Closed-won / Total registered | Monthly |
| Average deal size | Total value / Count of closed deals | Monthly |
| Lead conversion | Converted leads / Total leads received | Monthly |
| Training completion | Certifications earned | Real-time |
| Portal engagement | Logins, downloads, page views | Monthly |
| RMA rate | RMAs / Units sold | Quarterly |

### 8.2 Admin Reports

| Report | Purpose | Audience |
|:---|:---|:---|
| Partner pipeline summary | Overall partner contribution to sales | Sales Director |
| Tier movement | Partners moving between tiers | Partner Management |
| Co-op fund utilization | Marketing fund spend vs. budget | Finance |
| Portal adoption | Login rates, feature usage | IT / Partner Management |
| Lead distribution fairness | Equitable distribution analysis | Partner Management |

---

## 9. Portal Maintenance

### 9.1 Regular Maintenance Tasks

| Task | Frequency | Owner |
|:---|:---|:---|
| Review pending partner applications | Daily | Partner Manager |
| Update marketing assets | As needed | Marketing |
| Sync product catalog and pricing | Daily (automated) / Weekly (manual review) | Product Management |
| Review deal registrations | Daily | Partner Managers |
| Audit user access | Monthly | IT / Security |
| Backup portal data | Daily (automated) | IT Operations |
| Review and archive old deals | Quarterly | Partner Management |

### 9.2 Troubleshooting Common Issues

| Issue | Cause | Resolution |
|:---|:---|:---|
| Partner cannot log in | Expired password / deactivated account | Reset password / reactivate account |
| Pricing not visible | Tier insufficient / pricing not synced | Verify tier / trigger manual sync |
| Deal registration rejected | Conflict detected / incomplete info | Review conflict report / request correction |
| Asset download fails | Permission / file corruption | Check tier permissions / re-upload file |
| API key invalid | Expired / revoked | Regenerate key in partner profile |
| Lead not received | Filtered by rules / expired | Review assignment rules / reassign manually |

---

## 10. Security and Compliance

- All partner data encrypted at rest and in transit
- MFA required for Partner Admin accounts
- Session timeout: 60 minutes
- Password policy: 12+ characters, complexity required
- Annual security review and agreement re-acceptance
- Data access logs retained for 12 months
- Right to audit partner data handling (contractual)

---

## 11. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Partner Management Lead | | | |
| IT Operations | | | |
| Sales Operations | | | |
| Legal Counsel | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsitePartnerPortalAdmin_Guide.md`
