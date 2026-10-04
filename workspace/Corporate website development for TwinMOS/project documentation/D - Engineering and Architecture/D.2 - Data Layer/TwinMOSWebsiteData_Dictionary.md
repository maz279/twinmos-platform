# TwinMOS Corporate Website — Data Dictionary

**Document Reference:** TWN-DATA-DICT-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** ERD v1.0, BRD v3.0 §19

---

## 1. Overview

### Field Classification Legend

| Classification | Description |
|---------------|-------------|
| **PII** | Personally Identifiable Information |
| **Financial** | Financial/Billing Data |
| **Sensitive** | Business-Sensitive Data |
| **Public** | Publicly Available Data |
| **Internal** | Internal Use Only |

---

## 2. Product Catalog Fields

### Product

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| document_id | String(255) | Yes | Internal | Strapi v5 document ID |
| sku | String(100) | Yes | Public | Stock Keeping Unit (unique) |
| slug | String(255) | Yes | Public | URL-friendly identifier |
| name | String(255) | Yes | Public | Product display name |
| short_description | Text | No | Public | Brief product summary |
| description | Rich Text | No | Public | Full product description |
| meta_title | String(255) | No | Public | SEO title |
| meta_description | Text | No | Public | SEO description |
| og_image | Media | No | Public | Social sharing image |
| category_id | Relation | Yes | Public | Product category |
| brand_id | Relation | Yes | Public | Product brand |
| status | Enumeration | Yes | Public | draft / published / archived |
| published_at | DateTime | No | Public | Publication timestamp |
| created_at | DateTime | Yes | Internal | Creation timestamp |
| updated_at | DateTime | Yes | Internal | Last update timestamp |
| deleted_at | DateTime | No | Internal | Soft delete timestamp |
| locale | String(10) | Yes | Public | Content locale |

### Category

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| name | String(100) | Yes | Public | Category name |
| slug | String(255) | Yes | Public | URL slug (unique) |
| description | Text | No | Public | Category description |
| parent_id | Relation | No | Public | Parent category |
| sort_order | Integer | No | Public | Display order |
| image | Media | No | Public | Category image |
| icon | String(100) | No | Public | Icon identifier |
| status | Enumeration | Yes | Public | draft / published / archived |
| locale | String(10) | Yes | Public | Content locale |

---

## 3. Support Fields

### WarrantyRegistration

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| product_id | Relation | Yes | Public | Registered product |
| serial_number | String(100) | Yes | Public | Product serial number |
| customer_name | String(255) | Yes | PII | Customer full name |
| customer_email | String(255) | Yes | PII | Customer email |
| customer_phone | String(50) | No | PII | Customer phone |
| customer_address | Text | No | PII | Customer address |
| country | String(100) | No | PII | Customer country |
| purchase_date | Date | Yes | Public | Date of purchase |
| retailer_name | String(255) | No | Public | Purchase retailer |
| warranty_period_months | Integer | Yes | Public | Warranty duration |
| warranty_expiry | Date | No | Public | Warranty expiration |
| status | Enumeration | Yes | Public | active / expired / void |

### RMARequest

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| rma_number | String(50) | Yes | Public | Unique RMA number |
| product_id | Relation | Yes | Public | Product being returned |
| serial_number | String(100) | Yes | Public | Product serial |
| customer_name | String(255) | Yes | PII | Customer name |
| customer_email | String(255) | Yes | PII | Customer email |
| customer_phone | String(50) | No | PII | Customer phone |
| issue_description | Text | Yes | Public | Problem description |
| status | Enumeration | Yes | Public | pending / approved / received / in_progress / resolved / rejected |
| resolution | Enumeration | No | Public | repair / replace / refund |
| tracking_number_in | String(100) | No | Public | Incoming tracking |
| tracking_number_out | String(100) | No | Public | Outgoing tracking |

---

## 4. Content Fields

### ContentPage

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| document_id | String(255) | Yes | Internal | Strapi document ID |
| title | String(255) | Yes | Public | Page title |
| slug | String(255) | Yes | Public | URL slug |
| meta_title | String(255) | No | Public | SEO title |
| meta_description | Text | No | Public | SEO description |
| og_image | Media | No | Public | Social image |
| excerpt | Text | No | Public | Brief summary |
| content | Rich Text | No | Public | Page content |
| status | Enumeration | Yes | Public | draft / published / archived |
| published_at | DateTime | No | Public | Publication date |
| locale | String(10) | Yes | Public | Content locale |
| deleted_at | DateTime | No | Internal | Soft delete |

### NewsArticle

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| title | String(255) | Yes | Public | Article title |
| slug | String(255) | Yes | Public | URL slug (unique) |
| excerpt | Text | No | Public | Article summary |
| content | Rich Text | Yes | Public | Article body |
| featured_image | Media | No | Public | Hero image |
| author_name | String(255) | No | Public | Author name |
| category | String(100) | No | Public | News category |
| tags | Array | No | Public | Article tags |
| is_featured | Boolean | No | Public | Featured flag |
| status | Enumeration | Yes | Public | draft / published / archived |
| published_at | DateTime | No | Public | Publication date |
| locale | String(10) | Yes | Public | Content locale |

---

## 5. Form Fields

### FormSubmission

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| form_type | Enumeration | Yes | Public | contact / distributor / warranty / rma / newsletter / job |
| status | Enumeration | Yes | Internal | new / processing / resolved / spam |
| data | JSON | Yes | PII | Form data (structured) |
| customer_email | String(255) | No | PII | Submitter email |
| customer_name | String(255) | No | PII | Submitter name |
| customer_phone | String(50) | No | PII | Submitter phone |
| customer_country | String(100) | No | PII | Submitter country |
| ip_address | String(45) | No | Internal | Client IP |
| user_agent | Text | No | Internal | Client user agent |
| turnstile_token | String(500) | No | Internal | Bot verification token |
| crm_lead_id | String(100) | No | Internal | CRM reference |
| created_at | DateTime | Yes | Internal | Creation timestamp |

---

## 6. User & Auth Fields

### PartnerUser

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| email | String(255) | Yes | PII | Login email (unique) |
| password_hash | String(255) | Yes | PII | Bcrypt hashed password |
| first_name | String(100) | No | PII | First name |
| last_name | String(100) | No | PII | Last name |
| company_id | Relation | Yes | Sensitive | Partner company |
| role | Enumeration | Yes | Internal | viewer / marketing / procurement / admin |
| is_active | Boolean | Yes | Internal | Account status |
| email_verified_at | DateTime | No | Internal | Verification timestamp |
| mfa_enabled | Boolean | Yes | Internal | MFA status |
| mfa_secret | String(255) | No | PII | TOTP secret |
| last_login_at | DateTime | No | Internal | Last login |

### PartnerCompany

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| company_name | String(255) | Yes | Sensitive | Company name |
| legal_name | String(255) | No | Sensitive | Legal entity name |
| registration_number | String(100) | No | Sensitive | Business registration |
| tax_id | String(100) | No | Sensitive | Tax/VAT ID |
| website | String(255) | No | Public | Company website |
| country | String(100) | No | Public | Country |
| city | String(100) | No | Public | City |
| address | Text | No | PII | Full address |
| phone | String(50) | No | PII | Contact phone |
| email | String(255) | No | PII | Contact email |
| territory | Array | No | Sensitive | Operating territories |
| partner_type | Enumeration | No | Public | distributor / retailer / oem |
| status | Enumeration | Yes | Internal | pending / approved / suspended |
| credit_limit | Decimal | No | Sensitive | Credit limit |
| payment_terms | String(50) | No | Sensitive | Payment terms |

---

## 7. Commerce Fields (P3)

### Order

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| order_number | String(50) | Yes | Public | Unique order number |
| customer_email | String(255) | Yes | PII | Customer email |
| customer_name | String(255) | No | PII | Customer name |
| customer_phone | String(50) | No | PII | Customer phone |
| shipping_address | JSON | Yes | PII | Shipping address |
| billing_address | JSON | Yes | PII | Billing address |
| subtotal | Decimal | Yes | Financial | Order subtotal |
| shipping_cost | Decimal | Yes | Financial | Shipping cost |
| tax_amount | Decimal | Yes | Financial | Tax amount |
| discount_amount | Decimal | Yes | Financial | Discount |
| total_amount | Decimal | Yes | Financial | Total amount |
| currency | String(3) | Yes | Public | Currency code |
| status | Enumeration | Yes | Public | Order status |
| payment_status | Enumeration | Yes | Financial | Payment status |
| stripe_payment_intent_id | String(255) | No | Financial | Stripe reference |
| tracking_number | String(100) | No | Public | Shipping tracking |
| notes | Text | No | Internal | Order notes |

---

## 8. System Fields

### AuditLog

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| action | String(100) | Yes | Internal | Action performed |
| entity_type | String(100) | Yes | Internal | Affected entity type |
| entity_id | String(255) | No | Internal | Affected entity ID |
| user_id | Relation | No | Internal | Acting user |
| user_email | String(255) | No | Internal | Acting user email |
| changes | JSON | No | Internal | Change diff |
| ip_address | String(45) | No | Internal | Client IP |
| user_agent | Text | No | Internal | Client user agent |
| created_at | DateTime | Yes | Internal | Creation timestamp |

### Redirect

| Field | Type | Required | Classification | Description |
|-------|------|----------|----------------|-------------|
| id | Integer | Yes | Internal | Primary key |
| source_path | String(500) | Yes | Public | Source URL path |
| target_path | String(500) | Yes | Public | Target URL path |
| status_code | Integer | Yes | Public | HTTP status |
| is_active | Boolean | Yes | Public | Active flag |
| hit_count | Integer | Yes | Internal | Usage count |
| last_hit_at | DateTime | No | Internal | Last usage |

---

## 9. Sensitive Data Classification

### PII Fields Summary

| Entity | PII Fields | Protection |
|--------|-----------|------------|
| WarrantyRegistration | customer_name, customer_email, customer_phone, customer_address, country | Encryption at rest, access logging |
| RMARequest | customer_name, customer_email, customer_phone | Encryption at rest, access logging |
| FormSubmission | customer_name, customer_email, customer_phone, customer_country, data | Encryption at rest, 12-month retention |
| PartnerUser | email, password_hash, first_name, last_name, mfa_secret | Bcrypt hashing, encryption at rest |
| PartnerCompany | address, phone, email | Encryption at rest |
| Order | customer_email, customer_name, customer_phone, shipping_address, billing_address | Encryption at rest, PCI compliance |

### Data Retention by Classification

| Classification | Retention Period | Action After |
|---------------|-----------------|--------------|
| PII | 12-36 months | Anonymize or delete |
| Financial | 7 years | Archive (legal requirement) |
| Sensitive | 24 months | Review and purge |
| Public | Indefinite | None |
| Internal | 12 months | Archive |

---

## 10. Data Ownership Matrix

| Entity | Source of Truth | Owner | Consumers |
|--------|----------------|-------|-----------|
| Product | Strapi CMS | Product Manager | Website, Partner Portal, E-commerce |
| Category | Strapi CMS | Product Manager | Website, Search |
| Brand | Strapi CMS | Marketing | Website |
| Compatibility | Strapi CMS | QA Team | Website, Support |
| Distributor | Strapi CMS | Sales Team | Website, Partner Portal |
| FormSubmission | Strapi CMS | Marketing/Sales | CRM, Email, Slack |
| Warranty | Strapi CMS | Support Team | Support Portal, Email |
| RMA | Strapi CMS | Support Team | Support Portal, Email |
| SerialNumber | Manufacturing | Operations | Anti-counterfeit API |
| ContentPage | Strapi CMS | Marketing | Website |
| NewsArticle | Strapi CMS | Marketing | Website |
| RegionalPage | Strapi CMS | Marketing | Website |
| Order | Medusa.js (P3) | E-commerce | Website, ERP |
| PartnerUser | Better Auth (P2) | Sales Team | Partner Portal |
| AuditLog | Strapi CMS | IT/Security | Compliance reporting |
