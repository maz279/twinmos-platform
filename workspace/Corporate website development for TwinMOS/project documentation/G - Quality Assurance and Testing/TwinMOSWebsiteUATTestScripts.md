# UAT Test Scripts

**Document Reference:** TWN-QA-UAT-SCRIPTS-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P2
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** UAT Participants, QA Team, Project Manager, Product Manager
**Synchronized With:** URD v3.0, BRD v3.0 §32.2, UAT Plan v1.0

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with detailed UAT test scripts for all user journeys |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Test Script Format](#2-test-script-format)
3. [Homepage & Navigation Scripts](#3-homepage--navigation-scripts)
4. [Product Discovery Scripts](#4-product-discovery-scripts)
5. [Compatibility Finder Scripts](#5-compatibility-finder-scripts)
6. [Where to Buy Scripts](#6-where-to-buy-scripts)
7. [Forms & Contact Scripts](#7-forms--contact-scripts)
8. [Support & Warranty Scripts](#8-support--warranty-scripts)
9. [Partner Portal Scripts (P2)](#9-partner-portal-scripts-p2)
10. [Multi-Language Scripts (P2)](#10-multi-language-scripts-p2)
11. [E-Commerce Scripts (P3)](#11-e-commerce-scripts-p3)
12. [Appendix A: UAT Execution Log](#appendix-a-uat-execution-log)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document contains the **detailed UAT test scripts** for the TwinMOS corporate website. These scripts guide UAT participants through structured testing of all user-facing features, ensuring comprehensive validation before each phase launch.

### 1.2 Scope

**In scope:**
- All user journeys defined in URD v3.0
- All acceptance criteria from BRD v3.0 §32.1
- Cross-browser validation on participant devices
- Mobile and desktop testing
- Accessibility validation (keyboard-only, screen reader)

**Out of scope:**
- CMS admin functionality (tested internally)
- API-only endpoints (tested via API Test Plan)
- Load/performance testing (tested via k6)

---

## 2. Test Script Format

### 2.1 Script Template

Each test script follows this format:

| Field | Description |
|-------|-------------|
| **Script ID** | Unique identifier (e.g., UAT-HP-01) |
| **Feature** | Feature being tested |
| **Priority** | P0/P1/P2 |
| **Preconditions** | Required setup before testing |
| **Steps** | Numbered steps to execute |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happened (filled by tester) |
| **Status** | Pass / Fail / Blocked / N/A |
| **Notes** | Additional observations |
| **Device/Browser** | Test environment |
| **Date** | Test execution date |
| **Tester** | Name of UAT participant |

### 2.2 Status Definitions

| Status | Meaning |
|--------|---------|
| **Pass** | Actual result matches expected result |
| **Fail** | Actual result does not match expected result |
| **Blocked** | Cannot execute due to external dependency |
| **N/A** | Not applicable for this test cycle |

---

## 3. Homepage & Navigation Scripts

### UAT-HP-01: Homepage Load and First Impression

| Field | Content |
|-------|---------|
| **Script ID** | UAT-HP-01 |
| **Feature** | Homepage load and visual inspection |
| **Priority** | P0 |
| **Preconditions** | Clear browser cache; use incognito mode |

**Steps:**
1. Open browser and navigate to https://twinmos.com
2. Wait for page to fully load (max 3 seconds)
3. Observe the hero section
4. Scroll down to view category grid
5. Scroll down to view featured products
6. Scroll down to view trust bar
7. Scroll down to view footer

**Expected Result:**
- Page loads within 3 seconds
- Hero carousel displays 4 slides with smooth transitions
- Category grid shows 4+ categories with clear icons
- Featured products display with images, names, and prices
- Trust bar shows certification logos (CE, FCC, RoHS, ISO)
- Footer contains links to all major sections
- No broken images or layout issues

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

**Notes:** _________________________________

---

### UAT-HP-02: Navigation Menu — Desktop

| Field | Content |
|-------|---------|
| **Script ID** | UAT-HP-02 |
| **Feature** | Desktop navigation menu |
| **Priority** | P0 |
| **Preconditions** | Desktop viewport (1280px+) |

**Steps:**
1. Hover over "Products" in main navigation
2. Click on "Memory" in dropdown
3. Click on "DDR5 Desktop" in sub-menu
4. Verify breadcrumb shows correct path
5. Click on TwinMOS logo to return home
6. Hover over "Support" in navigation
7. Click on "Warranty Registration"

**Expected Result:**
- Dropdown menus appear on hover with smooth animation
- All links navigate to correct pages
- Breadcrumb updates correctly
- Logo click returns to homepage
- No 404 errors

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-HP-03: Navigation Menu — Mobile

| Field | Content |
|-------|---------|
| **Script ID** | UAT-HP-03 |
| **Feature** | Mobile hamburger navigation |
| **Priority** | P0 |
| **Preconditions** | Mobile viewport (375px) or mobile device |

**Steps:**
1. Open site on mobile device or resize browser to 375px
2. Tap hamburger menu icon
3. Tap "Products" to expand category
4. Tap "DDR5 Desktop"
5. Tap back to close menu
6. Scroll down and verify sticky CTA remains visible

**Expected Result:**
- Hamburger menu opens with slide animation
- Categories expand with accordion animation
- Navigation works correctly
- Menu closes when tapping overlay or back
- Sticky CTA stays above safe area on iOS

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## 4. Product Discovery Scripts

### UAT-PD-01: Browse Product Categories

| Field | Content |
|-------|---------|
| **Script ID** | UAT-PD-01 |
| **Feature** | Product category browsing |
| **Priority** | P0 |
| **Preconditions** | None |

**Steps:**
1. Navigate to homepage
2. Click on "Memory" category card
3. Verify category page loads with products
4. Click on "DDR5 Desktop" sub-category
5. Verify filter shows "DDR5 Desktop" selected
6. Note the number of products displayed
7. Click on a product card

**Expected Result:**
- Category page loads within 2 seconds
- Products display with image, name, price, and key specs
- Filter panel shows active filters
- Product count is accurate
- Product detail page loads correctly

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-PD-02: Product Search

| Field | Content |
|-------|---------|
| **Script ID** | UAT-PD-02 |
| **Feature** | Product search functionality |
| **Priority** | P0 |
| **Preconditions** | None |

**Steps:**
1. Click on search icon in header
2. Type "DDR5 32GB"
3. Press Enter or click search button
4. Review search results
5. Click on first result
6. Return to search and type "nonexistent product"
7. Observe no-results state

**Expected Result:**
- Search suggestions appear as you type
- Results show relevant products with highlighting
- Results page loads within 1 second
- No-results page shows helpful message and suggestions
- Product detail page loads from search result

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-PD-03: Product Detail Page

| Field | Content |
|-------|---------|
| **Script ID** | UAT-PD-03 |
| **Feature** | Product detail page validation |
| **Priority** | P0 |
| **Preconditions** | Navigate to any product detail page |

**Steps:**
1. Navigate to /products/voltx-rgb-ddr5-32gb-5600mhz
2. Verify hero image displays clearly
3. Click on image gallery thumbnails
4. Verify specifications table is complete
5. Click "Download Datasheet" button
6. Verify PDF opens or downloads
7. Scroll to related products section
8. Click on a related product

**Expected Result:**
- All product images load clearly
- Image gallery navigation works
- Specifications are accurate and complete
- Datasheet PDF is accessible and < 2MB
- Related products are relevant
- Breadcrumb shows correct path

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-PD-04: Product Comparison

| Field | Content |
|-------|---------|
| **Script ID** | UAT-PD-04 |
| **Feature** | Product comparison tool |
| **Priority** | P1 |
| **Preconditions** | Navigate to product category page |

**Steps:**
1. Navigate to /products/memory/
2. Click "Add to Compare" on two products
3. Click "Compare" button
4. Review comparison table
5. Verify specifications are aligned
6. Click "Remove" on one product
7. Click "Add to Compare" on a third product

**Expected Result:**
- Compare checkbox/button is visible on product cards
- Comparison table shows products side by side
- Specifications are aligned for easy comparison
- Differences are highlighted
- Can add/remove products dynamically

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## 5. Compatibility Finder Scripts

### UAT-CF-01: Search by Laptop Model

| Field | Content |
|-------|---------|
| **Script ID** | UAT-CF-01 |
| **Feature** | Compatibility search by laptop |
| **Priority** | P0 |
| **Preconditions** | None |

**Steps:**
1. Navigate to /compatibility/
2. Select "Laptop" as device type
3. Select "Dell" as brand
4. Select "XPS 15 9530" as model
5. Click "Find Compatible Memory"
6. Review results
7. Click on a compatible product

**Expected Result:**
- Search form is intuitive and easy to use
- Brand and model dropdowns populate correctly
- Results show compatible RAM with capacity info
- Maximum supported capacity is displayed
- Results link to product detail pages

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-CF-02: Search by Motherboard

| Field | Content |
|-------|---------|
| **Script ID** | UAT-CF-02 |
| **Feature** | Compatibility search by motherboard |
| **Priority** | P0 |
| **Preconditions** | None |

**Steps:**
1. Navigate to /compatibility/
2. Select "Motherboard" as device type
3. Select "ASUS" as brand
4. Select "ROG Maximus Z790 Hero" as model
5. Click "Find Compatible Memory"
6. Review results
7. Verify speed and capacity information

**Expected Result:**
- Motherboard search works identically to laptop search
- Results show compatible DDR5 modules
- Speed compatibility (e.g., up to 7600MHz) is shown
- Dual-channel recommendations included

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-CF-03: No Results Handling

| Field | Content |
|-------|---------|
| **Script ID** | UAT-CF-03 |
| **Feature** | Compatibility no-results state |
| **Priority** | P1 |
| **Preconditions** | None |

**Steps:**
1. Navigate to /compatibility/
2. Enter a very old or obscure laptop model
3. Submit search
4. Observe no-results message
5. Verify helpful suggestions are provided
6. Verify contact support link is visible

**Expected Result:**
- No-results message is friendly and helpful
- Suggestions for alternative searches provided
- Contact support option visible
- No error messages or broken UI

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## 6. Where to Buy Scripts

### UAT-WTB-01: Find Local Retailers

| Field | Content |
|-------|---------|
| **Script ID** | UAT-WTB-01 |
| **Feature** | Retailer locator with map |
| **Priority** | P0 |
| **Preconditions** | None |

**Steps:**
1. Navigate to /where-to-buy/
2. Allow location access (if prompted)
3. Verify map centers on your region
4. Observe retailer pins on map
5. Click on a retailer pin
6. Verify retailer details popup
7. Click "Get Directions"
8. Verify external map opens

**Expected Result:**
- Map loads within 3 seconds
- Retailer pins are accurate and clickable
- Retailer details show name, address, phone, hours
- Directions link opens Google Maps or Apple Maps
- List view shows same retailers as map

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-WTB-02: Filter by Country

| Field | Content |
|-------|---------|
| **Script ID** | UAT-WTB-02 |
| **Feature** | Country filter for retailers |
| **Priority** | P0 |
| **Preconditions** | None |

**Steps:**
1. Navigate to /where-to-buy/
2. Click country dropdown
3. Select "United Arab Emirates"
4. Verify map updates to the UAE
5. Verify retailer list updates
7. Select "India"

**Expected Result:**
- Country filter updates map and list simultaneously
- Correct retailers shown for each country
- Map zooms to appropriate level
- No retailers message shown for countries with none

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## 7. Forms & Contact Scripts

### UAT-FORM-01: Contact Form Submission

| Field | Content |
|-------|---------|
| **Script ID** | UAT-FORM-01 |
| **Feature** | Contact form validation and submission |
| **Priority** | P0 |
| **Preconditions** | None |

**Steps:**
1. Navigate to /contact/
2. Leave all fields empty and click Submit
3. Verify validation messages appear
4. Fill in valid data:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "+880 1712 345678"
   - Country: "United Arab Emirates"
   - Subject: "Product Inquiry"
   - Message: "I need help choosing DDR5 RAM"
5. Check consent checkbox
6. Click Submit
7. Verify success message
8. Check email inbox for confirmation

**Expected Result:**
- Validation works for all required fields
- Email format is validated
- Success message displays after submission
- Confirmation email received within 5 minutes
- Form fields clear after successful submission

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-FORM-02: Newsletter Signup

| Field | Content |
|-------|---------|
| **Script ID** | UAT-FORM-02 |
| **Feature** | Newsletter signup in footer |
| **Priority** | P1 |
| **Preconditions** | None |

**Steps:**
1. Scroll to footer on any page
2. Enter email in newsletter field
3. Click "Subscribe"
4. Verify success toast/message
5. Try entering invalid email
6. Verify validation message

**Expected Result:**
- Newsletter signup is visible in footer
- Email validation works
- Success message displays
- No page reload (AJAX submission)

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## 8. Support & Warranty Scripts

### UAT-SUP-01: Warranty Registration

| Field | Content |
|-------|---------|
| **Script ID** | UAT-SUP-01 |
| **Feature** | Warranty registration form (P2) |
| **Priority** | P0 (P2) |
| **Preconditions** | Phase 2 features enabled |

**Steps:**
1. Navigate to /support/warranty/register/
2. Enter product serial number
3. Select purchase date
4. Enter retailer name
5. Upload invoice PDF
6. Enter personal details
7. Submit form
8. Verify success message and warranty certificate

**Expected Result:**
- Serial number validation works
- File upload accepts PDF and images
- Success message shows warranty ID
- PDF certificate can be downloaded
- Confirmation email received

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-SUP-02: RMA Submission

| Field | Content |
|-------|---------|
| **Script ID** | UAT-SUP-02 |
| **Feature** | RMA request submission (P2) |
| **Priority** | P1 (P2) |
| **Preconditions** | Valid warranty registered |

**Steps:**
1. Navigate to /support/rma/
2. Enter warranty ID
3. Select issue type from dropdown
4. Describe the problem
5. Upload photos of defective product
6. Submit RMA request
7. Verify tracking number provided

**Expected Result:**
- Warranty ID validation works
- Issue types are clear and comprehensive
- Photo upload works
- Tracking number generated
- Status tracking page accessible

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## 9. Partner Portal Scripts (P2)

### UAT-PP-01: Partner Login

| Field | Content |
|-------|---------|
| **Script ID** | UAT-PP-01 |
| **Feature** | Partner portal authentication |
| **Priority** | P0 (P2) |
| **Preconditions** | Partner account credentials provided |

**Steps:**
1. Navigate to /partner/login/
2. Enter username and password
3. Complete MFA if enabled
4. Verify dashboard loads
5. Verify correct company name displayed
6. Click logout
7. Verify redirect to login page

**Expected Result:**
- Login form is secure (HTTPS, no password in URL)
- MFA works if enabled
- Dashboard shows relevant data for partner tier
- Session expires after inactivity
- Logout clears session

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-PP-02: Download Price List

| Field | Content |
|-------|---------|
| **Script ID** | UAT-PP-02 |
| **Feature** | Watermarked price list download |
| **Priority** | P1 (P2) |
| **Preconditions** | Logged in as partner |

**Steps:**
1. Log in to partner portal
2. Navigate to "Price Lists" section
3. Select current month price list
4. Click "Download PDF"
5. Open downloaded PDF
6. Verify watermark with company name
7. Verify prices match partner tier

**Expected Result:**
- Price list downloads as PDF
- PDF contains watermark with partner company name
- Prices reflect correct tier (Gold/Silver/Bronze)
- PDF is professional and printable

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## 10. Multi-Language Scripts (P2)

### UAT-I18N-01: Arabic RTL Layout

| Field | Content |
|-------|---------|
| **Script ID** | UAT-I18N-01 |
| **Feature** | Arabic language and RTL layout |
| **Priority** | P0 (P2) |
| **Preconditions** | Phase 2 languages enabled |

**Steps:**
1. Navigate to homepage
2. Click language selector
3. Select "Arabic / العربية"
4. Verify page reloads with RTL layout
5. Verify text aligns right
6. Verify navigation flips to right side
7. Verify product cards mirror correctly
8. Navigate to product detail page
9. Verify breadcrumb works in RTL
10. Switch back to English

**Expected Result:**
- Layout fully mirrors for RTL
- Text reads right-to-left
- Images and icons position correctly
- Navigation works in RTL
- Language preference persists

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-I18N-02: Hindi Content

| Field | Content |
|-------|---------|
| **Script ID** | UAT-I18N-02 |
| **Feature** | Hindi language content |
| **Priority** | P1 (P2) |
| **Preconditions** | Phase 2 languages enabled |

**Steps:**
1. Select Hindi from language dropdown
2. Verify homepage content in Hindi
3. Navigate to product page
4. Verify product names and specs
5. Verify forms accept Hindi input
6. Check for any untranslated content

**Expected Result:**
- Content displays in Hindi script
- No truncation or overflow issues
- Fonts render correctly
- Untranslated content shows English fallback with indicator

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## 11. E-Commerce Scripts (P3)

### UAT-EC-01: Add to Cart

| Field | Content |
|-------|---------|
| **Script ID** | UAT-EC-01 |
| **Feature** | Shopping cart functionality |
| **Priority** | P0 (P3) |
| **Preconditions** | Phase 3 e-commerce enabled |

**Steps:**
1. Navigate to a product page
2. Select quantity (e.g., 2)
3. Click "Add to Cart"
4. Verify cart icon updates with count
5. Click cart icon
6. Verify product appears in cart
7. Verify correct quantity and price
8. Update quantity to 3
9. Verify price updates

**Expected Result:**
- Add to Cart works with animation feedback
- Cart persists across pages
- Quantity updates reflect in price
- Cart shows product image, name, price, quantity

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

### UAT-EC-02: Checkout Flow

| Field | Content |
|-------|---------|
| **Script ID** | UAT-EC-02 |
| **Feature** | Stripe checkout integration |
| **Priority** | P0 (P3) |
| **Preconditions** | Items in cart; Phase 3 enabled |

**Steps:**
1. Add product to cart
2. Click "Proceed to Checkout"
3. Enter shipping address
4. Select shipping method
5. Enter test card: 4242 4242 4242 4242
6. Enter expiry: 12/30, CVC: 123
7. Complete checkout
8. Verify order confirmation page
9. Verify confirmation email

**Expected Result:**
- Checkout flow is smooth and intuitive
- Stripe integration works securely
- Order confirmation shows correct details
- Confirmation email received
- Order appears in order history

**Actual Result:** _________________________________

**Status:** [ ] Pass [ ] Fail [ ] Blocked [ ] N/A

---

## Appendix A: UAT Execution Log

### A.1 Log Template

| Script ID | Feature | Tester | Device/Browser | Date | Status | Notes |
|-----------|---------|--------|----------------|------|--------|-------|
| UAT-HP-01 | Homepage | | | | | |
| UAT-HP-02 | Nav Desktop | | | | | |
| UAT-HP-03 | Nav Mobile | | | | | |
| UAT-PD-01 | Categories | | | | | |
| UAT-PD-02 | Search | | | | | |
| UAT-PD-03 | Product Detail | | | | | |
| UAT-PD-04 | Compare | | | | | |
| UAT-CF-01 | Laptop Compat | | | | | |
| UAT-CF-02 | MB Compat | | | | | |
| UAT-CF-03 | No Results | | | | | |
| UAT-WTB-01 | Retailer Map | | | | | |
| UAT-WTB-02 | Country Filter | | | | | |
| UAT-FORM-01 | Contact | | | | | |
| UAT-FORM-02 | Newsletter | | | | | |
| UAT-SUP-01 | Warranty | | | | | |
| UAT-SUP-02 | RMA | | | | | |
| UAT-PP-01 | Partner Login | | | | | |
| UAT-PP-02 | Price List | | | | | |
| UAT-I18N-01 | Arabic RTL | | | | | |
| UAT-I18N-02 | Hindi | | | | | |
| UAT-EC-01 | Add to Cart | | | | | |
| UAT-EC-02 | Checkout | | | | | |

### A.2 Defect Log Template

| ID | Script ID | Description | Severity | Status | Assigned | Date |
|----|-----------|-------------|----------|--------|----------|------|
| | | | | | | |

---

**End of Document**
