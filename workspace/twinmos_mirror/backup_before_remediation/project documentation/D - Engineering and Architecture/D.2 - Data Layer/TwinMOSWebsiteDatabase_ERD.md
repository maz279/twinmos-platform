# TwinMOS Website — Database Entity Relationship Diagram (ERD)

**Document Reference:** TWN-ENG-D2-001
**Version:** 1.0
**Status:** FINAL
**Date:** 1 May 2026
**Owner:** Data Architect / Backend Lead
**Audience:** Unisoft Engineering, TwinMOS IT

---

## 1. Overview

This document defines the complete Entity Relationship Diagram for the TwinMOS corporate website database layer. The schema is implemented in PostgreSQL 16 and managed through Strapi v5. It supports 9 locales, 100+ SKUs, 28 regional pages, and 287+ content entries.

### 1.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Relational Integrity** | Foreign key constraints with ON DELETE/UPDATE rules |
| **Localization** | Unified Document System (Strapi v5) — single table per entity with i18n fields |
| **Soft Delete** | `deleted_at` timestamp + `is_deleted` boolean on all mutable entities |
| **Audit Trail** | Separate `audit_logs` table with JSONB `changes` column |
| **Optimistic Locking** | `version` integer incremented on every update |
| **Partitioning** | Time-based partitioning on `audit_logs`, `form_submissions` |

---

## 2. Entity Relationship Diagram

### 2.1 Core Product Catalog

```
+----------------+       +----------------+       +----------------+
|    CATEGORY    |       |    PRODUCT     |       |      SKU       |
+----------------+       +----------------+       +----------------+
| PK id          |<-----<| PK id          |>-----<| PK id          |
|    name        |   1:M |    name        |   1:M |    sku_code    |
|    slug        |       |    slug        |       |    product_id  |
|    parent_id   |------>|    category_id |<------|    specs       |
|    level       |  self |    brand_id    |------>|    price       |
|    sort_order  |  1:M  |    description |       |    stock       |
|    icon        |       |    features    |       |    images      |
|    is_active   |       |    warranty    |       |    is_active   |
|    locale      |       |    is_active   |       |    locale      |
|    created_at  |       |    locale      |       |    created_at  |
|    updated_at  |       |    created_at  |       |    updated_at  |
+----------------+       |    updated_at  |       +----------------+
                         +----------------+
                                  |
                                  | M:1
                                  v
                         +----------------+
                         |     BRAND      |
                         +----------------+
                         | PK id          |
                         |    name        |
                         |    slug        |
                         |    logo        |
                         |    website     |
                         |    description |
                         |    is_active   |
                         |    locale      |
                         |    created_at  |
                         |    updated_at  |
                         +----------------+
```

### 2.2 Compatibility and Support

```
+----------------+       +----------------+       +----------------+
|  MOTHERBOARD   |       |  COMPATIBILITY |       |  MEMORY_TYPE   |
+----------------+       +----------------+       +----------------+
| PK id          |>-----<| PK id          |>-----<| PK id          |
|    model       |   1:M |    motherboard_id|M:1 |    type_name   |
|    manufacturer|       |    memory_type_id|   |    speed       |
|    chipset     |       |    sku_id        |------|    voltage   |
|    socket      |       |    status        |       |    capacity  |
|    form_factor |       |    tested_by     |       |    is_active |
|    bios_ver    |       |    tested_date   |       |    created_at|
|    is_active   |       |    notes         |       |    updated_at|
|    created_at  |       |    created_at    |       +----------------+
|    updated_at  |       |    updated_at    |
+----------------+       +----------------+
                                  |
                                  | M:1
                                  v
                         +----------------+
                         |      SKU       |
                         +----------------+
```

### 2.3 Distributor and Retailer Network

```
+----------------+       +----------------+       +----------------+
|   DISTRIBUTOR  |       |  DIST_REGION   |       |    RETAILER    |
+----------------+       +----------------+       +----------------+
| PK id          |>-----<| PK id          |>-----<| PK id          |
|    company_name|   1:M |    distributor_id|M:1 |    name        |
|    slug        |       |    country_code|       |    distributor_id
|    contact_email|      |    region_name |       |    address     |
|    phone       |       |    is_active   |       |    city        |
|    website     |       |    created_at  |       |    country     |
|    logo        |       |    updated_at  |       |    phone       |
|    is_verified |       +----------------+       |    email       |
|    tier        |                                |    lat         |
|    is_active   |                                |    lng         |
|    created_at  |                                |    is_active   |
|    updated_at  |                                |    created_at  |
+----------------+                                |    updated_at  |
                                                  +----------------+
```

### 2.4 Forms and Submissions

```
+----------------+       +----------------+       +----------------+
|  FORM_TEMPLATE |       | FORM_SUBMISSION|       |  FORM_FIELD    |
+----------------+       +----------------+       +----------------+
| PK id          |>-----<| PK id          |>-----<| PK id          |
|    name        |   1:M |    form_template_id|M:1|    form_template_id
|    slug        |       |    submitter_ip  |     |    field_name  |
|    description |       |    submitter_email|    |    field_type  |
|    recipient_email      |    data (JSONB)  |    |    is_required |
|    success_msg |       |    status        |     |    sort_order  |
|    is_active   |       |    assigned_to   |     |    options     |
|    created_at  |       |    notes         |     |    is_active   |
|    updated_at  |       |    created_at    |     |    created_at  |
+----------------+       |    updated_at    |     |    updated_at  |
                         +----------------+       +----------------+
```

### 2.5 RMA and Warranty

```
+----------------+       +----------------+       +----------------+
| WARRANTY_REG   |       |  RMA_REQUEST   |       | SERIAL_NUMBER  |
+----------------+       +----------------+       +----------------+
| PK id          |       | PK id          |       | PK id          |
|    product_id  |------>|    warranty_reg_id|M:1 |    serial_code |
|    sku_id      |------>|    serial_number_id|M:1|    sku_id      |
|    serial_num  |------>|    issue_type    |     |    batch_id    |
|    customer_name      |    description   |     |    manufacture_date
|    customer_email     |    status        |     |    sold_date   |
|    purchase_date      |    resolution    |     |    is_verified |
|    purchase_retailer   |    shipping_label|    |    is_active   |
|    proof_image |       |    created_at    |     |    created_at  |
|    is_active   |       |    updated_at    |     |    updated_at  |
|    created_at  |       +----------------+       +----------------+
|    updated_at  |
+----------------+
```

### 2.6 Content Management

```
+----------------+       +----------------+       +----------------+
|  CONTENT_PAGE  |       |  NEWS_ARTICLE  |       |  REGIONAL_PAGE |
+----------------+       +----------------+       +----------------+
| PK id          |       | PK id          |       | PK id          |
|    title       |       |    title       |       |    title       |
|    slug        |       |    slug        |       |    slug        |
|    content     |       |    excerpt     |       |    country_code|
|    meta_title  |       |    body        |       |    region_name |
|    meta_desc   |       |    cover_image |       |    content     |
|    og_image    |       |    author_id   |------>|    locale      |
|    template    |       |    category_id |------>|    is_active   |
|    sort_order  |       |    published_at|       |    created_at  |
|    is_active   |       |    is_published|       |    updated_at  |
|    locale      |       |    locale      |       +----------------+
|    created_at  |       |    created_at  |
|    updated_at  |       |    updated_at  |
+----------------+       +----------------+
         |
         | M:1
         v
+----------------+
|    AUTHOR      |
+----------------+
| PK id          |
|    name        |
|    email       |
|    avatar      |
|    bio         |
|    role        |
|    is_active   |
|    created_at  |
|    updated_at  |
+----------------+
```

### 2.7 User Management and Auth

```
+----------------+       +----------------+       +----------------+
|     USER       |       |  USER_ROLE     |       |     ROLE       |
+----------------+       +----------------+       +----------------+
| PK id          |>-----<| PK id          |>-----<| PK id          |
|    username    |   1:M |    user_id     |   M:1 |    name        |
|    email       |       |    role_id     |       |    description |
|    password    |       |    granted_by  |       |    permissions |
|    is_active   |       |    created_at  |       |    is_active   |
|    confirmed   |       +----------------+       |    created_at  |
|    blocked     |                                |    updated_at  |
|    locale      |                                +----------------+
|    created_at  |
|    updated_at  |
+----------------+
```

### 2.8 Audit and System

```
+----------------+       +----------------+       +----------------+
|   AUDIT_LOG    |       | BUILD_SUBMISSION      |  REDIRECT      |
+----------------+       +----------------+       +----------------+
| PK id          |       | PK id          |       | PK id          |
|    action      |       |    build_name  |       |    source_url  |
|    entity_type |       |    components  |       |    target_url  |
|    entity_id   |       |    use_case    |       |    status_code |
|    user_id     |------>|    budget      |       |    is_active   |
|    changes     |       |    contact_email      |    created_at  |
|    ip_address  |       |    status      |       |    updated_at  |
|    user_agent  |       |    created_at  |       +----------------+
|    created_at  |       |    updated_at  |
+----------------+       +----------------+
```

---

## 3. Entity Definitions

### 3.1 Product Catalog Entities

#### CATEGORY
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| name | VARCHAR(100) | NOT NULL, i18n | Category name per locale |
| slug | VARCHAR(100) | NOT NULL, unique, i18n | URL-friendly identifier |
| parent_id | UUID | FK to category.id, nullable | Self-referencing for hierarchy |
| level | INTEGER | DEFAULT 0 | Nesting depth (0=root) |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| icon | VARCHAR(255) | nullable | Icon asset URL |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| locale | VARCHAR(10) | NOT NULL | Language code |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### PRODUCT
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| name | VARCHAR(200) | NOT NULL, i18n | Product name |
| slug | VARCHAR(200) | NOT NULL, unique, i18n | URL-friendly identifier |
| category_id | UUID | FK to category.id | Product category |
| brand_id | UUID | FK to brand.id | Product brand |
| description | TEXT | i18n | Full product description |
| features | JSONB | nullable | Structured feature list |
| warranty | VARCHAR(50) | nullable | Warranty period |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| locale | VARCHAR(10) | NOT NULL | Language code |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### SKU
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| sku_code | VARCHAR(50) | NOT NULL, unique | Stock keeping unit code |
| product_id | UUID | FK to product.id | Parent product |
| specs | JSONB | NOT NULL | Technical specifications |
| price | DECIMAL(10,2) | nullable | Retail price (P3) |
| stock | INTEGER | DEFAULT 0 | Inventory count (P3) |
| images | JSONB | nullable | Image asset references |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| locale | VARCHAR(10) | NOT NULL | Language code |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### BRAND
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| name | VARCHAR(100) | NOT NULL, i18n | Brand name |
| slug | VARCHAR(100) | NOT NULL, unique, i18n | URL-friendly identifier |
| logo | VARCHAR(255) | nullable | Logo asset URL |
| website | VARCHAR(255) | nullable | Official website URL |
| description | TEXT | i18n | Brand description |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| locale | VARCHAR(10) | NOT NULL | Language code |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

### 3.2 Compatibility Entities

#### MOTHERBOARD
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| model | VARCHAR(200) | NOT NULL | Motherboard model name |
| manufacturer | VARCHAR(100) | NOT NULL | Manufacturer |
| chipset | VARCHAR(50) | NOT NULL | Chipset family |
| socket | VARCHAR(50) | NOT NULL | CPU socket type |
| form_factor | VARCHAR(20) | NOT NULL | ATX, microATX, etc. |
| bios_version | VARCHAR(50) | nullable | Tested BIOS version |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### COMPATIBILITY
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| motherboard_id | UUID | FK to motherboard.id | Tested motherboard |
| memory_type_id | UUID | FK to memory_type.id | Memory specification |
| sku_id | UUID | FK to sku.id | Specific SKU tested |
| status | VARCHAR(20) | NOT NULL | verified, reported, pending |
| tested_by | VARCHAR(100) | nullable | Tester/organization |
| tested_date | DATE | nullable | Date of testing |
| notes | TEXT | nullable | Additional notes |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### MEMORY_TYPE
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| type_name | VARCHAR(50) | NOT NULL | DDR4, DDR5, etc. |
| speed | VARCHAR(20) | NOT NULL | 3200MHz, 5600MHz, etc. |
| voltage | VARCHAR(10) | nullable | 1.2V, 1.35V, etc. |
| capacity | VARCHAR(20) | NOT NULL | 8GB, 16GB, 32GB, etc. |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

### 3.3 Distributor and Retailer Entities

#### DISTRIBUTOR
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| company_name | VARCHAR(200) | NOT NULL | Legal company name |
| slug | VARCHAR(200) | NOT NULL, unique | URL-friendly identifier |
| contact_email | VARCHAR(255) | NOT NULL | Primary contact email |
| phone | VARCHAR(50) | nullable | Contact phone |
| website | VARCHAR(255) | nullable | Company website |
| logo | VARCHAR(255) | nullable | Logo asset URL |
| is_verified | BOOLEAN | DEFAULT false | TwinMOS verification status |
| tier | VARCHAR(20) | DEFAULT standard | platinum, gold, standard |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### DIST_REGION
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| distributor_id | UUID | FK to distributor.id | Parent distributor |
| country_code | CHAR(2) | NOT NULL | ISO 3166-1 alpha-2 |
| region_name | VARCHAR(100) | NOT NULL | Regional office name |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### RETAILER
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| name | VARCHAR(200) | NOT NULL | Store name |
| distributor_id | UUID | FK to distributor.id | Parent distributor |
| address | TEXT | NOT NULL | Full address |
| city | VARCHAR(100) | NOT NULL | City name |
| country | VARCHAR(100) | NOT NULL | Country name |
| phone | VARCHAR(50) | nullable | Store phone |
| email | VARCHAR(255) | nullable | Store email |
| latitude | DECIMAL(10,8) | nullable | GPS latitude |
| longitude | DECIMAL(11,8) | nullable | GPS longitude |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

### 3.4 Form Entities

#### FORM_TEMPLATE
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Template name |
| slug | VARCHAR(100) | NOT NULL, unique | Machine identifier |
| description | TEXT | nullable | Purpose description |
| recipient_email | VARCHAR(255) | NOT NULL | Form delivery address |
| success_message | TEXT | NOT NULL | Post-submit message |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### FORM_SUBMISSION
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| form_template_id | UUID | FK to form_template.id | Source form |
| submitter_ip | INET | NOT NULL | Client IP address |
| submitter_email | VARCHAR(255) | nullable | Provided email |
| data | JSONB | NOT NULL | Submitted field values |
| status | VARCHAR(20) | DEFAULT new | new, read, responded, spam |
| assigned_to | UUID | FK to user.id, nullable | Assigned staff |
| notes | TEXT | nullable | Internal notes |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### FORM_FIELD
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| form_template_id | UUID | FK to form_template.id | Parent form |
| field_name | VARCHAR(100) | NOT NULL | Field identifier |
| field_type | VARCHAR(50) | NOT NULL | text, email, select, etc. |
| is_required | BOOLEAN | DEFAULT false | Mandatory flag |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| options | JSONB | nullable | Select/radio options |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

### 3.5 RMA and Warranty Entities

#### WARRANTY_REGISTRATION
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| product_id | UUID | FK to product.id | Registered product |
| sku_id | UUID | FK to sku.id | Specific SKU |
| serial_number | VARCHAR(100) | NOT NULL | Product serial |
| customer_name | VARCHAR(200) | NOT NULL | Customer full name |
| customer_email | VARCHAR(255) | NOT NULL | Customer email |
| customer_phone | VARCHAR(50) | nullable | Customer phone |
| purchase_date | DATE | NOT NULL | Date of purchase |
| purchase_retailer | VARCHAR(200) | nullable | Where purchased |
| proof_image | VARCHAR(255) | nullable | Receipt/image URL |
| is_active | BOOLEAN | DEFAULT true | Validity flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### RMA_REQUEST
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| warranty_reg_id | UUID | FK to warranty_registration.id | Linked registration |
| serial_number_id | UUID | FK to serial_number.id | Verified serial |
| issue_type | VARCHAR(50) | NOT NULL | defect, doa, compatibility |
| description | TEXT | NOT NULL | Problem description |
| status | VARCHAR(20) | DEFAULT pending | pending, approved, rejected, resolved |
| resolution | TEXT | nullable | Resolution notes |
| shipping_label | VARCHAR(255) | nullable | Return label URL |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### SERIAL_NUMBER
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| serial_code | VARCHAR(100) | NOT NULL, unique | Unique serial |
| sku_id | UUID | FK to sku.id | Associated SKU |
| batch_id | VARCHAR(50) | nullable | Manufacturing batch |
| manufacture_date | DATE | nullable | Production date |
| sold_date | DATE | nullable | Sale date |
| is_verified | BOOLEAN | DEFAULT false | Authenticity verified |
| is_active | BOOLEAN | DEFAULT true | Validity flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

### 3.6 Content Entities

#### CONTENT_PAGE
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| title | VARCHAR(200) | NOT NULL, i18n | Page title |
| slug | VARCHAR(200) | NOT NULL, unique, i18n | URL path |
| content | JSONB | NOT NULL, i18n | Structured content blocks |
| meta_title | VARCHAR(70) | i18n | SEO title |
| meta_description | VARCHAR(160) | i18n | SEO description |
| og_image | VARCHAR(255) | nullable | Social share image |
| template | VARCHAR(50) | DEFAULT default | Layout template |
| sort_order | INTEGER | DEFAULT 0 | Navigation order |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| locale | VARCHAR(10) | NOT NULL | Language code |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### NEWS_ARTICLE
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| title | VARCHAR(200) | NOT NULL, i18n | Article headline |
| slug | VARCHAR(200) | NOT NULL, unique, i18n | URL path |
| excerpt | TEXT | i18n | Short summary |
| body | JSONB | NOT NULL, i18n | Article content blocks |
| cover_image | VARCHAR(255) | nullable | Featured image |
| author_id | UUID | FK to author.id | Content author |
| category_id | UUID | FK to news_category.id | Article category |
| published_at | TIMESTAMP | nullable | Go-live timestamp |
| is_published | BOOLEAN | DEFAULT false | Publication status |
| locale | VARCHAR(10) | NOT NULL | Language code |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### REGIONAL_PAGE
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| title | VARCHAR(200) | NOT NULL, i18n | Page title |
| slug | VARCHAR(200) | NOT NULL, unique, i18n | URL path |
| country_code | CHAR(2) | NOT NULL | Target country |
| region_name | VARCHAR(100) | NOT NULL | Region display name |
| content | JSONB | NOT NULL, i18n | Structured content |
| locale | VARCHAR(10) | NOT NULL | Language code |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### AUTHOR
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| name | VARCHAR(200) | NOT NULL | Full name |
| email | VARCHAR(255) | NOT NULL, unique | Contact email |
| avatar | VARCHAR(255) | nullable | Profile image |
| bio | TEXT | nullable | Short biography |
| role | VARCHAR(50) | DEFAULT contributor | author, editor, admin |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

### 3.7 User and Auth Entities

#### USER (Strapi Users-Permissions)
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| username | VARCHAR(100) | NOT NULL, unique | Login username |
| email | VARCHAR(255) | NOT NULL, unique | Email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| is_active | BOOLEAN | DEFAULT true | Account enabled |
| confirmed | BOOLEAN | DEFAULT false | Email confirmed |
| blocked | BOOLEAN | DEFAULT false | Account blocked |
| locale | VARCHAR(10) | DEFAULT en | Preferred language |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### ROLE
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| name | VARCHAR(100) | NOT NULL, unique | Role name |
| description | TEXT | nullable | Role purpose |
| permissions | JSONB | NOT NULL | Action permissions |
| is_active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### USER_ROLE (Junction)
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| user_id | UUID | FK to user.id | User reference |
| role_id | UUID | FK to role.id | Role reference |
| granted_by | UUID | FK to user.id, nullable | Admin who assigned |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |

### 3.8 System Entities

#### AUDIT_LOG
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| action | VARCHAR(50) | NOT NULL | create, update, delete, login |
| entity_type | VARCHAR(50) | NOT NULL | Table/collection name |
| entity_id | UUID | nullable | Affected record ID |
| user_id | UUID | FK to user.id, nullable | Acting user |
| changes | JSONB | nullable | Before/after diff |
| ip_address | INET | nullable | Client IP |
| user_agent | TEXT | nullable | Client browser |
| created_at | TIMESTAMP | DEFAULT now() | Event timestamp |

#### BUILD_SUBMISSION
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| build_name | VARCHAR(200) | NOT NULL | Build identifier |
| components | JSONB | NOT NULL | Selected components |
| use_case | VARCHAR(100) | NOT NULL | Gaming, workstation, etc. |
| budget | VARCHAR(50) | nullable | Budget range |
| contact_email | VARCHAR(255) | NOT NULL | Submitter email |
| status | VARCHAR(20) | DEFAULT pending | pending, reviewed, built |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### REDIRECT
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| source_url | VARCHAR(500) | NOT NULL | Old URL path |
| target_url | VARCHAR(500) | NOT NULL | New URL path |
| status_code | INTEGER | DEFAULT 301 | HTTP redirect code |
| is_active | BOOLEAN | DEFAULT true | Enabled flag |
| created_at | TIMESTAMP | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT now() | Last update timestamp |
