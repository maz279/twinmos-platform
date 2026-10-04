# TwinMOS Website — Schema.org JSON-LD Templates

**Document Reference:** TWN-F3-SCHEMA-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Front-End Lead
**Relates To:** Tech Stack §12.1; TwinMOSWebsiteSEO_Strategy.md §9

---

## Table of Contents

1. [Overview and Implementation](#1-overview-and-implementation)
2. [Organization + WebSite (Homepage)](#2-organization--website-homepage)
3. [Product + Offer (Product Detail Page)](#3-product--offer-product-detail-page)
4. [Article + FAQPage (Buying Guide / Learn Hub)](#4-article--faqpage-buying-guide--learn-hub)
5. [Article + HowTo (KB Article)](#5-article--howto-kb-article)
6. [NewsArticle (News / Press Release)](#6-newsarticle-news--press-release)
7. [Event (Event Pages)](#7-event-event-pages)
8. [FAQPage (Standalone FAQ)](#8-faqpage-standalone-faq)
9. [Person (Leadership Profile)](#9-person-leadership-profile)
10. [LocalBusiness (Where-to-Buy / Office / Regional)](#10-localbusiness-where-to-buy--office--regional)
11. [JobPosting (Careers)](#11-jobposting-careers)
12. [BreadcrumbList (All Pages)](#12-breadcrumblist-all-pages)
13. [Review and AggregateRating (Phase 2)](#13-review-and-aggregaterating-phase-2)
14. [Astro `<JsonLd />` Component Usage](#14-astro-jsonld--component-usage)
15. [Validation Checklist](#15-validation-checklist)

---

## 1. Overview and Implementation

### 1.1 Approach

All structured data is implemented as **JSON-LD** embedded in the `<head>` of each page via an Astro component. JSON-LD is Google's recommended format and is the only format validated by the Rich Results Test.

**Implementation rule:** Every page on `twinmos.com` must include at minimum:
- `BreadcrumbList` (all non-homepage pages)
- The primary schema for that page type (listed in §2–§12)

### 1.2 Astro Component

The `<JsonLd />` component (in `src/components/seo/JsonLd.astro`) accepts a typed `schema` prop and renders the JSON-LD `<script>` tag in the page `<head>`.

```astro
---
// src/components/seo/JsonLd.astro
interface Props {
  schema: object | object[];
}
const { schema } = Astro.props;
const json = JSON.stringify(Array.isArray(schema) ? schema : [schema]);
---
<script type="application/ld+json" set:html={json} />
```

### 1.3 Multiple Schemas per Page

Pass an array when a page requires multiple schema types:
```astro
<JsonLd schema={[productSchema, breadcrumbSchema, faqSchema]} />
```

### 1.4 Schema Types per Page Type

| Page Type | Schema(s) Required | Phase |
|-----------|-------------------|-------|
| Homepage | `WebSite` + `Organization` | P1 |
| Product detail | `Product` + `Offer` + `BreadcrumbList` | P1 |
| Product + reviews (P2) | `Product` + `Offer` + `AggregateRating` + `BreadcrumbList` | P2 |
| Buying guide | `Article` + `FAQPage` + `BreadcrumbList` | P1 |
| KB article | `Article` + `HowTo` + `BreadcrumbList` | P1 |
| News article | `NewsArticle` + `BreadcrumbList` | P1 |
| Press release | `NewsArticle` + `BreadcrumbList` | P1 |
| Event | `Event` + `BreadcrumbList` | P1 |
| FAQ page | `FAQPage` + `BreadcrumbList` | P1 |
| Leadership profile | `Person` + `BreadcrumbList` | P1 |
| Office / Where-to-Buy | `LocalBusiness` + `BreadcrumbList` | P1 |
| Regional landing | `Organization` + `LocalBusiness` + `BreadcrumbList` | P1 |
| Careers | `BreadcrumbList` (individual job postings use `JobPosting`) | P1 |
| Individual job listing | `JobPosting` + `BreadcrumbList` | P1 |
| About | `Organization` + `BreadcrumbList` | P1 |
| Contact | `Organization` + `BreadcrumbList` | P1 |
| Legal | `BreadcrumbList` | P1 |
| Support hub | `BreadcrumbList` | P1 |
| Learn hub | `BreadcrumbList` | P1 |

---

## 2. Organization + WebSite (Homepage)

### 2.1 WebSite Schema

Enables the Google site-search box in search results for branded queries.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TwinMOS Technologies",
  "url": "https://twinmos.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://twinmos.com/search/?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### 2.2 Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TwinMOS Technologies",
  "legalName": "TwinMOS Technologies Middle East FZE",
  "url": "https://twinmos.com/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://twinmos.com/images/logos/twinmos/twinmos-logo-512x512.png",
    "width": 512,
    "height": 512
  },
  "foundingDate": "1998",
  "founders": [
    {
      "@type": "Person",
      "name": "William Chen"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Dubai Airport Free Zone",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@twinmos.com",
      "availableLanguage": ["English", "Arabic", "Hindi"]
    },
    {
      "@type": "ContactPoint",
      "contactType": "sales",
      "email": "sales@twinmos.com"
    }
  ],
  "sameAs": [
    "https://www.linkedin.com/company/twinmos-technologies",
    "https://twitter.com/twinmos",
    "https://www.facebook.com/twinmos",
    "https://www.youtube.com/@twinmos"
  ],
  "description": "TwinMOS Technologies has engineered high-performance memory and storage solutions since 1998. Products distributed in 93 countries including DDR5, DDR4, NVMe SSD, and portable storage.",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 200
  },
  "areaServed": "Worldwide"
}
```

---

## 3. Product + Offer (Product Detail Page)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "VOLTX DDR5 U-DIMM 6000MHz 32GB",
  "description": "VOLTX DDR5 U-DIMM desktop memory running at 6000 MHz with CL40 latency, 1.35V, 32GB (2×16GB) kit. Supports Intel XMP 3.0 and AMD EXPO. On-die ECC. 5-year warranty.",
  "brand": {
    "@type": "Brand",
    "name": "VOLTX by TwinMOS"
  },
  "manufacturer": {
    "@type": "Organization",
    "name": "TwinMOS Technologies"
  },
  "model": "VOLTX DDR5 6000MHz 32GB",
  "sku": "TMD5R600032G-U",
  "mpn": "TMD5R600032G-U",
  "gtin13": "PLACEHOLDER_EAN13",
  "image": [
    "https://cdn.twinmos.com/images/products/memory/ddr5/voltx-ddr5-6000-32gb_hero_black_1200x900@1x.webp",
    "https://cdn.twinmos.com/images/products/memory/ddr5/voltx-ddr5-6000-32gb_angle-front_black_1200x900@1x.webp"
  ],
  "category": "Computer Memory > DDR5 RAM",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "PLACEHOLDER_PRICE",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "url": "https://twinmos.com/products/memory/voltx-ddr5-6000mhz-32gb/",
    "seller": {
      "@type": "Organization",
      "name": "TwinMOS Technologies"
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "AE",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30
    },
    "warranty": {
      "@type": "WarrantyPromise",
      "durationOfWarranty": {
        "@type": "QuantitativeValue",
        "value": 5,
        "unitCode": "ANN"
      },
      "warrantyScope": "https://schema.org/WarrantyScope"
    }
  },
  "additionalProperty": [
    {"@type": "PropertyValue", "name": "Form Factor", "value": "U-DIMM"},
    {"@type": "PropertyValue", "name": "Memory Type", "value": "DDR5"},
    {"@type": "PropertyValue", "name": "Speed", "value": "6000 MHz"},
    {"@type": "PropertyValue", "name": "Capacity", "value": "32 GB"},
    {"@type": "PropertyValue", "name": "Latency", "value": "CL40"},
    {"@type": "PropertyValue", "name": "Voltage", "value": "1.35 V"},
    {"@type": "PropertyValue", "name": "XMP", "value": "Intel XMP 3.0"},
    {"@type": "PropertyValue", "name": "EXPO", "value": "AMD EXPO"},
    {"@type": "PropertyValue", "name": "ECC", "value": "On-die ECC"}
  ]
}
```

**Implementation note:** `price` and `gtin13` are populated from the Strapi product entry fields. If a product has no GTIN, omit the `gtin13` field entirely (do not leave as "PLACEHOLDER_EAN13").

---

## 4. Article + FAQPage (Buying Guide / Learn Hub)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "DDR5 vs DDR4: Complete Buying Guide 2026",
  "description": "Everything you need to know to choose between DDR5 and DDR4 RAM in 2026 — performance differences, platform compatibility, price analysis, and our recommendations.",
  "image": "https://cdn.twinmos.com/images/sections/learn/learn_ddr5-vs-ddr4_1200x675@1x.webp",
  "author": {
    "@type": "Organization",
    "name": "TwinMOS Technologies"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TwinMOS Technologies",
    "logo": {
      "@type": "ImageObject",
      "url": "https://twinmos.com/images/logos/twinmos/twinmos-logo-512x512.png"
    }
  },
  "datePublished": "2026-05-01",
  "dateModified": "2026-05-01",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://twinmos.com/learn/buying-guide/ddr5-vs-ddr4/"
  },
  "articleSection": "Buying Guide",
  "wordCount": 3200
}
```

**FAQPage** (combined on buying guide pages with embedded FAQ section):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DDR5 worth it over DDR4 in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, if you are building a new system with an Intel LGA 1700 (Raptor Lake or Arrow Lake) or AMD AM5 (Ryzen 7000) platform. DDR5 offers approximately 50–80% more bandwidth at comparable price points as of 2026. For existing DDR4 systems, an upgrade to the DDR5 platform requires a new CPU and motherboard — making DDR5 RAM a component choice rather than a standalone upgrade."
      }
    },
    {
      "@type": "Question",
      "name": "What is the best DDR5 speed for gaming?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DDR5 6000 MHz (with AMD EXPO or Intel XMP 3.0 enabled) is widely considered the sweet spot for gaming in 2026. It delivers near-maximum gaming performance without requiring the higher voltages and instability risks associated with DDR5 7200 MHz or above. VOLTX DDR5 6000MHz CL40 is specifically tuned for this use case."
      }
    }
  ]
}
```

---

## 5. Article + HowTo (KB Article)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Install a DDR5 RAM Module (Desktop)",
  "description": "Step-by-step guide for installing a DDR5 U-DIMM memory module into a desktop motherboard. Includes preparation, slot selection, and first-boot verification.",
  "author": {"@type": "Organization", "name": "TwinMOS Technologies"},
  "publisher": {
    "@type": "Organization",
    "name": "TwinMOS Technologies",
    "logo": {"@type": "ImageObject", "url": "https://twinmos.com/images/logos/twinmos/twinmos-logo-512x512.png"}
  },
  "datePublished": "2026-05-01",
  "dateModified": "2026-05-01",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://twinmos.com/support/kb/how-to-install-ddr5-ram/"
  }
}
```

**HowTo** (combined on KB installation guides):

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Install a DDR5 RAM Module",
  "totalTime": "PT10M",
  "supply": [
    {"@type": "HowToSupply", "name": "DDR5 U-DIMM module"},
    {"@type": "HowToSupply", "name": "Anti-static wrist strap (recommended)"}
  ],
  "tool": [
    {"@type": "HowToTool", "name": "Phillips-head screwdriver (for case panel)"}
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Power down and unplug the system",
      "text": "Shut down your computer completely. Unplug the power cable from the wall socket. Press the power button once to discharge residual electricity.",
      "position": 1
    },
    {
      "@type": "HowToStep",
      "name": "Locate the DIMM slots on your motherboard",
      "text": "Open the computer case and locate the DIMM slots near the CPU socket. Consult your motherboard manual for the recommended slot order (typically slots A2 and B2 for dual-channel).",
      "position": 2
    },
    {
      "@type": "HowToStep",
      "name": "Release the retention clips",
      "text": "DDR5 slots have retention clips at one or both ends. Press down to release each clip before inserting the module.",
      "position": 3
    },
    {
      "@type": "HowToStep",
      "name": "Align and seat the module",
      "text": "Align the notch on the DDR5 module with the key in the DIMM slot. Press down firmly and evenly until the retention clips click into place.",
      "position": 4
    },
    {
      "@type": "HowToStep",
      "name": "Verify installation and enable XMP/EXPO",
      "text": "Reconnect and power on the system. Enter BIOS (typically Delete or F2 key). Navigate to the memory settings and enable XMP 3.0 (Intel) or EXPO (AMD) to run at the rated speed.",
      "position": 5
    }
  ]
}
```

---

## 6. NewsArticle (News / Press Release)

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "TwinMOS Launches VOLTX DDR5 6000MHz at COMPUTEX 2026",
  "description": "TwinMOS Technologies announces the VOLTX DDR5 U-DIMM at 6000 MHz with Intel XMP 3.0 and AMD EXPO support at COMPUTEX Taipei 2026.",
  "image": "https://cdn.twinmos.com/images/sections/news/news_voltx-ddr5-launch-computex-2026_1200x675@1x.webp",
  "author": {"@type": "Organization", "name": "TwinMOS Technologies"},
  "publisher": {
    "@type": "Organization",
    "name": "TwinMOS Technologies",
    "logo": {"@type": "ImageObject", "url": "https://twinmos.com/images/logos/twinmos/twinmos-logo-512x512.png"}
  },
  "datePublished": "2026-06-03",
  "dateModified": "2026-06-03",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://twinmos.com/news/press-releases/twinmos-voltx-ddr5-computex-2026/"
  },
  "articleSection": "Press Release",
  "inLanguage": "en"
}
```

---

## 7. Event (Event Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "COMPUTEX 2026 — TwinMOS Booth",
  "description": "Visit TwinMOS at COMPUTEX 2026 (Taipei Nangang Exhibition Center, Hall 1) to see the VOLTX DDR5 and CoreX Pro Gen 5 launches and meet our engineering team.",
  "startDate": "2026-06-03",
  "endDate": "2026-06-07",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Taipei Nangang Exhibition Center",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "No. 1, Jingmao 2nd Road, Nangang District",
      "addressLocality": "Taipei",
      "addressCountry": "TW"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "TwinMOS Technologies",
    "url": "https://twinmos.com/"
  },
  "image": "https://cdn.twinmos.com/images/sections/news/news_computex-2026-booth_1200x675@1x.webp",
  "url": "https://twinmos.com/news/events/computex-2026/"
}
```

---

## 8. FAQPage (Standalone FAQ)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is TwinMOS's warranty period?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TwinMOS memory modules and NVMe SSDs carry a 5-year limited warranty covering manufacturing defects. Portable drives carry a 3-year warranty. Full warranty terms are available at https://twinmos.com/legal/warranty-policy/."
      }
    },
    {
      "@type": "Question",
      "name": "How do I check if my TwinMOS product is genuine?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the TwinMOS Serial Number Checker at https://twinmos.com/support/serial-number-checker/ to verify product authenticity. Genuine TwinMOS products have a holographic anti-counterfeit label on the packaging."
      }
    },
    {
      "@type": "Question",
      "name": "Does TwinMOS ship internationally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TwinMOS products are available through authorised distributors in 93 countries. Find your nearest authorised retailer at https://twinmos.com/where-to-buy/."
      }
    }
  ]
}
```

---

## 9. Person (Leadership Profile)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Mohd Mazharul Islam",
  "jobTitle": "Chairman",
  "worksFor": {
    "@type": "Organization",
    "name": "TwinMOS Technologies Middle East FZE",
    "url": "https://twinmos.com/"
  },
  "image": "https://cdn.twinmos.com/images/sections/about/about_team-chairman-mohd-mazharul-islam_600x600@1x.webp",
  "url": "https://twinmos.com/about/leadership/"
}
```

---

## 10. LocalBusiness (Where-to-Buy / Office / Regional)

### 10.1 Office (Dubai HQ)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "TwinMOS Technologies — Dubai Office",
  "image": "https://cdn.twinmos.com/images/sections/about/about_manufacturing-facility_800x600@1x.webp",
  "url": "https://twinmos.com/contact/offices/dubai/",
  "telephone": "+971-4-XXXXXXX",
  "email": "sales@twinmos.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Dubai Airport Free Zone",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 25.2532,
    "longitude": 55.3657
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "parentOrganization": {
    "@type": "Organization",
    "name": "TwinMOS Technologies"
  }
}
```

### 10.2 Authorised Retailer Entry (Where-to-Buy)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "RETAILER NAME PLACEHOLDER",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  },
  "telephone": "RETAILER_PHONE",
  "url": "RETAILER_WEBSITE",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "TwinMOS Products"
  }
}
```

---

## 11. JobPosting (Careers)

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Product Manager — Memory and Storage",
  "description": "TwinMOS Technologies is seeking a Product Manager to lead the development and go-to-market strategy for our DDR5 and NVMe SSD product lines...",
  "datePosted": "2026-05-01",
  "validThrough": "2026-07-01",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "TwinMOS Technologies",
    "sameAs": "https://twinmos.com/",
    "logo": "https://twinmos.com/images/logos/twinmos/twinmos-logo-512x512.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dubai",
      "addressRegion": "Dubai",
      "addressCountry": "AE"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "AED",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 15000,
      "maxValue": 25000,
      "unitText": "MONTH"
    }
  }
}
```

---

## 12. BreadcrumbList (All Pages)

Required on every non-homepage page.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://twinmos.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://twinmos.com/products/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "DDR5 Memory",
      "item": "https://twinmos.com/products/memory/ddr5/"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "VOLTX DDR5 6000MHz 32GB",
      "item": "https://twinmos.com/products/memory/voltx-ddr5-6000mhz-32gb/"
    }
  ]
}
```

The breadcrumb trail is auto-generated by Astro from the URL path segments. Each segment maps to a Strapi entry's `title` field.

---

## 13. Review and AggregateRating (Phase 2)

To be added to `Product` schema when user reviews are enabled (Phase 2):

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "127",
  "bestRating": "5",
  "worstRating": "1"
},
"review": [
  {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "author": {"@type": "Person", "name": "Ahmed K."},
    "reviewBody": "Running at 6000MHz on my Ryzen 9 7950X without any issues. Excellent build quality.",
    "datePublished": "2026-04-15"
  }
]
```

**Important:** Only show `AggregateRating` when there are ≥4 reviews. Google suppresses rich snippets for single reviews.

---

## 14. Astro `<JsonLd />` Component Usage

### 14.1 Product Page Example

```astro
---
// src/pages/products/memory/[...slug].astro
import JsonLd from '@/components/seo/JsonLd.astro';
import BreadcrumbList from '@/components/seo/schemas/BreadcrumbList.astro';

const { product } = Astro.props;

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "sku": product.sku,
  // ... (populated from Strapi)
};

const breadcrumbSchema = buildBreadcrumb(Astro.url.pathname);
---

<JsonLd schema={[productSchema, breadcrumbSchema]} />
```

### 14.2 Schema Builder Utilities

Schema builder helper functions live in `src/lib/seo/schemas.ts`:
- `buildProductSchema(product: StrapiProduct): ProductSchema`
- `buildArticleSchema(article: StrapiArticle): ArticleSchema`
- `buildBreadcrumb(pathname: string): BreadcrumbSchema`
- `buildJobPosting(job: StrapiJob): JobPostingSchema`

---

## 15. Validation Checklist

Before each deployment, validate structured data:

- [ ] Schema Markup Validator at `https://validator.schema.org/` — paste the page HTML.
- [ ] Google Rich Results Test — test the live URL or code snippet.
- [ ] Product pages: confirm `Product` schema has `name`, `image`, `offers`, `brand`.
- [ ] Article pages: confirm `Article` has `headline`, `datePublished`, `author`, `publisher`.
- [ ] FAQ pages: confirm all question/answer pairs are complete (no empty strings).
- [ ] HowTo pages: confirm `step` array has at least 2 steps.
- [ ] BreadcrumbList: confirm position numbers are consecutive integers starting at 1.
- [ ] JobPosting: confirm `validThrough` date is in the future.
- [ ] AggregateRating (P2): confirm `ratingValue` is between `worstRating` and `bestRating`.

Monthly: run a Screaming Frog crawl with the custom extraction feature to verify structured data is present on all target page types.

---

*Related: [SEO Strategy](TwinMOSWebsiteSEO_Strategy.md) | [Meta Tag Templates](TwinMOSWebsiteMetaTagTemplates.md) | [Tech Stack §12.1](../../A%20-%20Foundation%20and%20Strategy/TwinMOSWebsiteTechnology_Stack.md)*
