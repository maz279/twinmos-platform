# Test Data Strategy

**Document Reference:** TWN-QA-TESTDATA-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P1
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** QA Team, Developers, DevOps, Database Administrator
**Synchronized With:** BRD v3.0 §19, Tech Stack v1.1 §6, QA Strategy v1.0

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with test data categories, seeding strategy, GDPR compliance, and environment management |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Test Data Principles](#2-test-data-principles)
3. [Test Data Categories](#3-test-data-categories)
4. [Product Test Data](#4-product-test-data)
5. [User Test Data](#5-user-test-data)
6. [Form Submission Test Data](#6-form-submission-test-data)
7. [Compatibility Test Data](#7-compatibility-test-data)
8. [Distributor Test Data](#8-distributor-test-data)
9. [Test Data Generation](#9-test-data-generation)
10. [Test Data Seeding](#10-test-data-seeding)
11. [GDPR & Data Privacy Compliance](#11-gdpr--data-privacy-compliance)
12. [Environment-Specific Data](#12-environment-specific-data)
13. [Test Data Maintenance](#13-test-data-maintenance)
14. [Appendix A: Test Data Inventory](#appendix-a-test-data-inventory)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document defines the **test data strategy** for the TwinMOS corporate website project. It specifies how test data is created, managed, maintained, and protected across all testing environments. Proper test data ensures reliable, repeatable, and secure testing while complying with GDPR, UAE PDPL, India DPDP, and KSA PDPL requirements.

### 1.2 Scope

**In scope:**
- Product catalog test data (SKUs, categories, specifications)
- User account test data (partner portal, CMS users)
- Form submission test data (contact, warranty, RMA)
- Compatibility database test data (laptops, motherboards)
- Distributor/retailer test data (locations, contacts)
- Content test data (pages, articles, news)
- Search index test data (MeiliSearch)
- Image and media asset test data
- GDPR-compliant data masking and anonymization

**Out of scope:**
- Production user data (never used in testing)
- Payment card data (use Stripe test tokens only)
- Proprietary firmware or binary data

---

## 2. Test Data Principles

### 2.1 Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Synthetic** | All test data is artificially generated | Faker.js, custom generators |
| **Representative** | Data mirrors production patterns | Statistical distribution matching |
| **Isolated** | Each environment has independent data | Per-environment databases |
| **Versioned** | Test data changes tracked in Git | Seed scripts in repository |
| **Reproducible** | Same seed produces same data | Deterministic generation |
| **Compliant** | No real PII in test environments | Anonymization + synthetic data |
| **Minimal** | Only necessary data created | Targeted seeding per test |

### 2.2 Test Data Tenets

1. **Never use production data in test environments**
2. **Never commit real PII to version control**
3. **Always mask/anonymize if real data is absolutely required**
4. **Rotate test credentials quarterly**
5. **Clean up test data after test completion (where applicable)**
6. **Document all test data dependencies**

---

## 3. Test Data Categories

### 3.1 Category Overview

| Category | Records (Dev) | Records (Staging) | Records (Production) | Source |
|----------|---------------|-------------------|----------------------|--------|
| Products | 50 | 200 | 100+ | Synthetic + real SKU reference |
| Categories | 10 | 15 | 15 | Real taxonomy |
| Product Images | 200 | 800 | 500+ | Synthetic + sample real |
| Distributors | 20 | 50 | 50+ | Synthetic |
| Retailers | 50 | 200 | 200+ | Synthetic |
| Compatibility Entries | 500 | 2,000 | 5,000+ | Synthetic |
| CMS Users | 5 | 10 | 10 | Synthetic |
| Partner Users | 10 | 30 | 50+ | Synthetic |
| Form Submissions | 100 | 500 | N/A (production only) | Synthetic |
| News Articles | 10 | 50 | 50+ | Synthetic |
| Content Pages | 20 | 100 | 100+ | Synthetic + migrated |

### 3.2 Data Freshness Requirements

| Environment | Refresh Frequency | Method |
|-------------|-------------------|--------|
| Local Dev | On demand | `npm run db:seed` |
| CI/Test | Every build | Automated seed in pipeline |
| Staging | Weekly | Scheduled job + manual trigger |
| UAT | Before each UAT round | Fresh seed from production-like snapshot |
| Production | N/A | Real data only |

---

## 4. Product Test Data

### 4.1 Product Structure

```typescript
// test-data/products.ts
interface Product {
  id: string;                    // SKU: TWN-DDR5-32G-5600
  name: string;                  // "TwinMOS VOLTX RGB DDR5 32GB 5600MHz"
  slug: string;                  // "voltx-rgb-ddr5-32gb-5600mhz"
  category: string;              // "memory" | "ssd" | "portable-storage" | "usb"
  subCategory: string;           // "ddr5-desktop" | "ddr5-laptop" | "nvme-gen4"
  description: string;           // Rich text
  specifications: Specification[];
  images: Image[];
  status: "published" | "draft" | "discontinued";
  price: number | null;          // Informational only (Phase 1-2)
  currency: string;              // "USD" | "AED" | "INR"
  datasheet: string;             // PDF URL
  warranty: string;              // "Lifetime" | "3 Years" | "5 Years"
  certifications: string[];      // ["CE", "FCC", "RoHS"]
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Specification {
  label: string;                 // "Capacity"
  value: string;                 // "32GB (2 x 16GB)"
  group: string;                 // "Memory" | "Performance" | "Physical"
}
```

### 4.2 Sample Product Data

| SKU | Name | Category | Status |
|-----|------|----------|--------|
| TWN-DDR5-32G-5600-RGB | VOLTX RGB DDR5 32GB 5600MHz | Memory | Published |
| TWN-DDR5-64G-6000 | COREX PRO DDR5 64GB 6000MHz | Memory | Published |
| TWN-DDR4-16G-3200 | Classic DDR4 16GB 3200MHz | Memory | Published |
| TWN-SSD-NVMe-1T-Gen4 | ELITE DRIVE NVMe 1TB Gen4 | SSD | Published |
| TWN-SSD-SATA-512G | SPEEDSTER SATA 512GB | SSD | Published |
| TWN-USB-128G-3.2 | ULTRA SLIM USB 128GB 3.2 | USB | Published |
| TWN-SSD-NVMe-2T-Gen5 | ELITE DRIVE PRO NVMe 2TB Gen5 | SSD | Draft |
| TWN-DDR3-8G-1600 | Legacy DDR3 8GB 1600MHz | Memory | Discontinued |

### 4.3 Product Image Test Data

| Image Type | Dimensions | Format | Count |
|------------|-----------|--------|-------|
| Hero image | 1200 x 800 | WebP, AVIF, JPEG fallback | 1 per product |
| Gallery images | 800 x 800 | WebP, AVIF, JPEG fallback | 3-5 per product |
| Thumbnail | 300 x 300 | WebP | 1 per product |
| Spec diagram | 1200 x 600 | PNG | 0-1 per product |

Test images are generated using placeholder services or synthetic image generation:
- `https://via.placeholder.com/1200x800/0056D6/FFFFFF?text=TwinMOS+VOLTX`
- Or stored in `tests/fixtures/images/`

---

## 5. User Test Data

### 5.1 CMS User Accounts

| Role | Username | Email | Permissions |
|------|----------|-------|-------------|
| Super Admin | admin.twinmos | admin@twinmos.local | All |
| Marketing Manager | marketing.twinmos | marketing@twinmos.local | Content, Media |
| Product Manager | product.twinmos | product@twinmos.local | Products, Categories |
| Editor | editor.twinmos | editor@twinmos.local | Content (own only) |
| Viewer | viewer.twinmos | viewer@twinmos.local | Read-only |

**Passwords:** All test accounts use `TestPass123!` (documented in 1Password/Bitwarden)

### 5.2 Partner Portal Users (Phase 2)

| Role | Company | Username | Tier |
|------|---------|----------|------|
| Distributor | Regional Distributor | regional.partner | Silver |
| Retailer | Computer Source | compsource.partner | Bronze |
| OEM Partner | OEM Solutions Ltd | oemsol.partner | OEM |
| Internal Sales | TwinMOS Sales | sales.twinmos | Internal |

### 5.3 User Data Privacy

All user test data is synthetic:
- Emails use `@twinmos.local` domain (non-routable)
- Names generated with Faker.js
- Phone numbers use fake formats
- Addresses are fictional
- No real person data is used

---

## 6. Form Submission Test Data

### 6.1 Contact Form Test Data

```typescript
// test-data/forms.ts
const validContactForm = {
  firstName: "Aisha",
  lastName: "Rahman",
  email: "aisha.rahman@example.com",
  phone: "+971 50 123 4567",
  country: "United Arab Emirates",
  subject: "Product Inquiry",
  message: "I am looking for DDR5 RAM for my gaming PC. Can you recommend the best option?",
  company: "Personal",
  consent: true,
};

const invalidContactForms = [
  { ...validContactForm, email: "not-an-email" },        // Invalid email
  { ...validContactForm, email: "" },                    // Missing email
  { ...validContactForm, message: "" },                  // Missing message
  { ...validContactForm, phone: "abc" },                 // Invalid phone
  { ...validContactForm, consent: false },               // Missing consent
  { ...validContactForm, firstName: "<script>alert(1)</script>" }, // XSS attempt
];
```

### 6.2 Warranty Registration Test Data

```typescript
const validWarranty = {
  productSerial: "TWN-DDR5-32G-5600-RGB-ABC123456",
  purchaseDate: "2026-01-15",
  customerName: "Rahul Sharma",
  customerEmail: "rahul.sharma@example.com",
  customerPhone: "+91 98765 43210",
  customerAddress: "123 Park Street, Mumbai, India",
  invoiceNumber: "INV-2026-001234",
  invoiceFile: "invoice.pdf",
};
```

### 6.3 Edge Case Form Data

| Field | Edge Case | Expected Behavior |
|-------|-----------|-------------------|
| Name | 100+ characters | Truncated or validated |
| Email | 254 characters (RFC limit) | Accepted |
| Email | Unicode domain | Accepted or rejected gracefully |
| Phone | Various formats (+880, 0091, etc.) | Normalized |
| Message | 5000+ characters | Accepted or limited |
| Message | SQL injection attempt | Sanitized, no error |
| File | 10MB+ PDF | Rejected or compressed |
| File | Executable (.exe) | Rejected |
| File | SVG with embedded script | Sanitized |

---

## 7. Compatibility Test Data

### 7.1 Laptop Models

| Brand | Model | Compatible RAM | Max Capacity |
|-------|-------|---------------|--------------|
| Dell | XPS 15 9530 | DDR5-4800 | 64GB |
| HP | Spectre x360 14 | DDR5-5200 | 32GB |
| Lenovo | ThinkPad X1 Carbon Gen 11 | DDR5-5600 | 32GB |
| ASUS | ROG Zephyrus G14 | DDR5-4800 | 48GB |
| Apple | MacBook Pro 14" M3 | N/A (soldered) | 36GB |
| Acer | Predator Helios 16 | DDR5-5600 | 64GB |
| MSI | Raider GE78 | DDR5-5600 | 64GB |

### 7.2 Motherboard Models

| Brand | Model | Socket | Compatible RAM | Max Capacity |
|-------|-------|--------|---------------|--------------|
| ASUS | ROG Maximus Z790 Hero | LGA 1700 | DDR5-7600 | 128GB |
| MSI | MEG Z790 ACE | LGA 1700 | DDR5-7800 | 128GB |
| Gigabyte | Z790 AORUS Master | LGA 1700 | DDR5-7600 | 128GB |
| ASRock | Z790 Taichi | LGA 1700 | DDR5-7200 | 128GB |
| ASUS | ROG Strix B650E-E | AM5 | DDR5-6400 | 128GB |
| MSI | MAG B650 Tomahawk | AM5 | DDR5-6000 | 128GB |

### 7.3 Compatibility Matrix Test Data

```typescript
const compatibilityEntry = {
  deviceType: "laptop" | "motherboard",
  deviceBrand: "Dell",
  deviceModel: "XPS 15 9530",
  deviceModelNumber: "XPS9530-001",
  compatibleProducts: ["TWN-DDR5-32G-5600", "TWN-DDR5-64G-5600"],
  maxCapacity: "64GB",
  maxSpeed: "DDR5-5600",
  slots: 2,
  notes: "Requires BIOS 1.5.0+ for 5600MHz",
  verified: true,
  source: "QVL",
};
```

---

## 8. Distributor Test Data

### 8.1 Distributor Records

| Name | Country | City | Type | Status |
|------|---------|------|------|--------|
| Regional Distributor | UAE | Dubai | Distributor | Active |
| Computer Source | UAE | Dubai | Retailer | Active |
| Microless | UAE | Dubai | Retailer | Active |
| Amazon.ae | UAE | Dubai | Online | Active |
| Noon.com | UAE | Dubai | Online | Active |
| Jumia | Nigeria | Lagos | Online | Active |

### 8.2 Geographic Test Data

| Country | Cities | Currency | Language |
|---------|--------|----------|----------|
| India | Mumbai, Delhi, Kolkata, Chennai | INR | Hindi, English |
| UAE | Dubai, Abu Dhabi, Sharjah | AED | Arabic, English |
| Saudi Arabia | Riyadh, Jeddah, Dammam | SAR | Arabic |
| Egypt | Cairo, Alexandria | EGP | Arabic |
| Nigeria | Lagos, Abuja | NGN | English |
| South Africa | Johannesburg, Cape Town | ZAR | English |
| Kenya | Nairobi | KES | English |

---

## 9. Test Data Generation

### 9.1 Faker.js Configuration

```typescript
// tests/utils/faker-config.ts
import { faker } from "@faker-js/faker";

// Set seed for reproducibility
faker.seed(12345);

// Configure locales for TwinMOS markets
export const fakerEn = faker;
export const fakerAr = new Faker({ locale: [ar] });
export const fakerBn = new Faker({ locale: [bn] });
export const fakerHi = new Faker({ locale: [hi] });

// Custom TwinMOS generators
export const generateSKU = (category: string, specs: object) => {
  const prefix = "TWN";
  const cat = category.toUpperCase().substring(0, 3);
  const rand = faker.string.alphanumeric(6).toUpperCase();
  return `${prefix}-${cat}-${rand}`;
};

export const generateProduct = () => ({
  id: generateSKU("memory", {}),
  name: `${faker.commerce.productName()} ${faker.number.int({ min: 8, max: 64 })}GB`,
  description: faker.commerce.productDescription(),
  price: faker.commerce.price({ min: 50, max: 500 }),
  // ...
});
```

### 9.2 Deterministic Seeding

```typescript
// Ensure same data every run
const SEED = process.env.TEST_SEED || "twinmos-2026";
faker.seed(SEED);

// Usage in tests
beforeAll(() => {
  faker.seed("test-" + expect.getState().currentTestName);
});
```

---

## 10. Test Data Seeding

### 10.1 Seeding Scripts

```bash
# package.json scripts
{
  "db:seed": "tsx scripts/seed-database.ts",
  "db:seed:minimal": "tsx scripts/seed-database.ts --minimal",
  "db:seed:full": "tsx scripts/seed-database.ts --full",
  "db:reset": "tsx scripts/reset-database.ts && npm run db:seed",
  "db:seed:ci": "tsx scripts/seed-database.ts --ci"
}
```

### 10.2 Seeding Script Structure

```typescript
// scripts/seed-database.ts
import { seedProducts } from "./seeders/products";
import { seedCategories } from "./seeders/categories";
import { seedDistributors } from "./seeders/distributors";
import { seedCompatibility } from "./seeders/compatibility";
import { seedUsers } from "./seeders/users";
import { seedContent } from "./seeders/content";

async function seed(options: SeedOptions) {
  console.log("Starting database seed...");

  await seedCategories();
  console.log("Categories seeded");

  await seedProducts(options.productCount);
  console.log("Products seeded");

  await seedDistributors(options.distributorCount);
  console.log("Distributors seeded");

  await seedCompatibility(options.compatibilityCount);
  console.log("Compatibility data seeded");

  await seedUsers();
  console.log("Users seeded");

  await seedContent();
  console.log("Content seeded");

  console.log("Database seed complete!");
}

seed({
  productCount: process.env.CI ? 50 : 200,
  distributorCount: process.env.CI ? 20 : 50,
  compatibilityCount: process.env.CI ? 500 : 2000,
});
```

### 10.3 CI Pipeline Seeding

```yaml
# In GitHub Actions workflow
- name: Seed test database
  run: npm run db:seed:ci
  env:
    DATABASE_URL: postgres://strapi:strapi@localhost:5432/twinmos_test
```

---

## 11. GDPR & Data Privacy Compliance

### 11.1 Compliance Requirements

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| **GDPR** | No real PII in test | Synthetic data only |
| **UAE PDPL** | Data minimization | Minimal test records |
| **India DPDP** | Consent simulation | Test consent flags |
| **KSA PDPL** | Cross-border restrictions | Test data stays in region |

### 11.2 PII Protection Checklist

- [ ] No real names in test data
- [ ] No real email addresses (use @example.com or @twinmos.local)
- [ ] No real phone numbers
- [ ] No real addresses
- [ ] No real ID numbers or passport data
- [ ] No production database dumps in test
- [ ] Test data encrypted at rest (if required)
- [ ] Test data deleted after environment decommission

### 11.3 Data Masking (if real data ever needed)

```typescript
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  const maskedUser = user.substring(0, 2) + "***";
  return `${maskedUser}@${domain}`;
}

function maskPhone(phone: string): string {
  return phone.replace(/\d(?=\d{4})/g, "*");
}
```

---

## 12. Environment-Specific Data

### 12.1 Local Development

| Attribute | Value |
|-----------|-------|
| Database | Local PostgreSQL or Docker |
| Data volume | Minimal (50 products, 20 distributors) |
| Refresh | On demand (`npm run db:seed`) |
| Images | Local placeholders |
| Third-party APIs | Mocked or sandbox |

### 12.2 CI/Test Environment

| Attribute | Value |
|-----------|-------|
| Database | Ephemeral PostgreSQL container |
| Data volume | Minimal (50 products) |
| Refresh | Every build |
| Images | Placeholder URLs |
| Third-party APIs | Mocked (MSW) |

### 12.3 Staging Environment

| Attribute | Value |
|-----------|-------|
| Database | Shared staging PostgreSQL |
| Data volume | Full (200 products, 50 distributors) |
| Refresh | Weekly |
| Images | Backblaze B2 test bucket |
| Third-party APIs | Sandbox mode |

### 12.4 UAT Environment

| Attribute | Value |
|-----------|-------|
| Database | Fresh clone before each UAT round |
| Data volume | Production-like (500+ products) |
| Refresh | Before each UAT round |
| Images | Production CDN (read-only) |
| Third-party APIs | Production (with test credentials) |

---

## 13. Test Data Maintenance

### 13.1 Maintenance Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Review test data for accuracy | Monthly | QA Lead |
| Update product SKUs to match real catalog | Per release | Product Manager |
| Rotate test credentials | Quarterly | DevOps |
| Clean up stale test data | Monthly | QA Lead |
| Update compatibility database | Per QVL release | Product Manager |
| Audit for PII leakage | Quarterly | Security Lead |

### 13.2 Test Data Versioning

Test data changes are versioned in Git:

```
tests/
├── fixtures/
│   ├── products/
│   │   ├── products-v1.json      # Phase 1 products
│   │   ├── products-v2.json      # Phase 2 additions
│   │   └── products-v3.json      # Phase 3 additions
│   ├── images/
│   │   ├── placeholder-hero.webp
│   │   ├── placeholder-gallery.webp
│   │   └── placeholder-thumb.webp
│   └── forms/
│       ├── contact-valid.json
│       ├── contact-invalid.json
│       └── warranty-valid.json
└── seeders/
    ├── products.ts
    ├── categories.ts
    ├── distributors.ts
    ├── compatibility.ts
    ├── users.ts
    └── content.ts
```

---

## Appendix A: Test Data Inventory

### A.1 Complete Data Inventory

| Data Type | Source | Count (Dev) | Count (Staging) | PII Risk | Refresh |
|-----------|--------|-------------|-----------------|----------|---------|
| Products | Synthetic + real SKU | 50 | 200 | None | Monthly |
| Categories | Real taxonomy | 10 | 15 | None | Per release |
| Product specs | Synthetic | 300 | 1,200 | None | Monthly |
| Product images | Placeholder | 200 | 800 | None | On demand |
| Distributors | Synthetic | 20 | 50 | Low | Monthly |
| Retailers | Synthetic | 50 | 200 | Low | Monthly |
| Compatibility | Synthetic | 500 | 2,000 | None | Per QVL |
| CMS users | Synthetic | 5 | 10 | Low | Quarterly |
| Partner users | Synthetic | 10 | 30 | Low | Quarterly |
| Form submissions | Synthetic | 100 | 500 | Low | Weekly |
| News articles | Synthetic | 10 | 50 | None | Monthly |
| Content pages | Synthetic + migrated | 20 | 100 | None | Per release |
| Search index | Generated from products | 50 | 200 | None | Auto |
| Email templates | Static | 10 | 10 | None | Per release |

### A.2 Data Dependencies

```
Categories
  └── Products
        ├── Product Images
        ├── Product Specs
        └── Compatibility Entries
              ├── Laptop Models
              └── Motherboard Models

Distributors
  └── Retailers
        └── Where to Buy Map Data

CMS Users
  └── Content Pages
        └── News Articles

Partner Users
  └── Partner Portal Data
        ├── Price Lists
        └── Order History (P3)
```

---

**End of Document**
