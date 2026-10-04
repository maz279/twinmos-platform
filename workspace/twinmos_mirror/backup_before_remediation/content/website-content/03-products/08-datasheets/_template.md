---
# ============================================================
# TWINMOS PRODUCT DATASHEET — YAML FRONTMATTER TEMPLATE
# ============================================================
# Instructions: Replace every placeholder value (shown in UPPER_CASE
# or with a leading dash "—") with the correct product-specific value.
# Remove comment lines (lines starting with #) before publishing.
# ============================================================

title: "Datasheet — [PRODUCT FULL NAME]"
# Example: "Datasheet — VOLTX DDR5 U-DIMM 6000 MT/s"
# Format: "Datasheet — [Brand] [Series] [Interface/Type] [Speed/Tier]"

slug: "datasheet-[product-slug]"
# Example: "datasheet-voltx-ddr5-udimm"
# Use lowercase, hyphens only, no special characters.

url: "/products/datasheets/[product-slug]"
# Must match the slug. Example: "/products/datasheets/voltx-ddr5-udimm"

template: "datasheet-pdf"
# Do not change. All individual datasheets use this template.

description: "Official TwinMOS [PRODUCT NAME] datasheet. Technical specifications, electrical ratings, environmental limits, ordering information, and compliance data for engineers and procurement professionals."
# Max 160 characters for SEO. Include product name, category, and key value terms.

keywords:
  - "TwinMOS [product name] datasheet"
  - "[product name] specifications"
  - "[INTERFACE] [TYPE] datasheet"
  # Add 4-8 targeted keywords. Include product model, interface (DDR5, NVMe, SATA),
  # and category (memory, SSD, portable storage). Do not keyword-stuff.
  - "TwinMOS datasheet"
  - "TwinMOS [CATEGORY] specifications"

persona:
  - "professional"
  - "enterprise"
  - "technician"
  - "distributor"
  - "procurement"
  # Add "oem" or "system-integrator" if applicable to this product.

phase: P1
priority: P0
owner: "product"
# owner must be "product". Change to "engineering" only for internal-only datasheets.

status: published
# Lifecycle: draft → review → published → archived
# Set to "archived" when a product reaches end-of-life and is removed from active sale.

last_reviewed: "YYYY-MM-DD"
# Date this file was last reviewed and confirmed accurate. Update on every revision.

locale: en
# Use ISO 639-1 codes. For localised variants: en, ar, zh-TW, de, fr, es, etc.

schema: "Product"
# Always "Product" for product datasheets. Drives JSON-LD structured data output.

ctas:
  - text: "Download PDF"
    url: "/downloads/datasheets/[product-slug].pdf"
    # Primary CTA. Must point to the live PDF asset on the CDN.
  - text: "View Product Page"
    url: "/products/[CATEGORY]/[product-slug]"
    # Secondary CTA. Link to the full product landing page.
  - text: "Check Compatibility"
    url: "/support/compatibility"
    # Optional. Include for memory and SSD products where compatibility tools exist.
  - text: "Contact Sales"
    url: "/support/contact"
    # Always include as a fallback CTA.

cross_links:
  - "/products/datasheets"
  # Always include — links back to the datasheet directory index.
  - "/products/[CATEGORY]"
  # Category page: /products/memory, /products/ssd, /products/portable, etc.
  - "/products/[CATEGORY]/[product-slug]"
  # Product landing page.
  - "/support"
  - "/about/certifications"
  # Include if this datasheet references certifications prominently.

sources:
  - "CP"
  # "CP" = Content Production (default for all published datasheets).
  # Add "ENG" if engineering team directly authored or validated the document.
---

<!-- ============================================================
     TWINMOS PRODUCT DATASHEET — MASTER CONTENT TEMPLATE
     Version: 1.0  |  Last Updated: 2026-04-30
     Owner: Product Team  |  TwinMOS Technologies

     USAGE INSTRUCTIONS
     ------------------
     This file is the master template for all TwinMOS product datasheets.
     Copy this file, rename it to [product-slug].md, and replace every
     placeholder with real product data before submitting for review.

     Placeholders are marked: [LIKE THIS] or with a dash: —
     Comments (like this block) explain what each section requires.
     Remove all comment blocks and instruction lines before publishing.

     Section order must be preserved. Do not add or remove H2 sections
     without approval from the Product Owner.
     ============================================================ -->

# Datasheet — [PRODUCT FULL NAME]

<!-- Product full name must exactly match the title in the YAML frontmatter.
     Example: # Datasheet — VOLTX DDR5 U-DIMM 6000 MT/s -->

---

## Document Information

<!-- This table is required on every datasheet. It must be the first
     content block after the H1. Fill in all fields accurately.
     Document Number format: TW-DS-[CATEGORY CODE]-[SEQUENCE]
     Category codes: MEM (memory), SSD (solid-state drive),
     PST (portable storage), USB (USB flash), ACC (accessories)
     Example: TW-DS-MEM-0012  |  TW-DS-SSD-0008 -->

| Field | Value |
|-------|-------|
| Product Name | [PRODUCT FULL NAME] |
| Brand / Series | [BRAND] / [SERIES] |
| Model Number | [MODEL NUMBER] |
| Document Number | TW-DS-[CATEGORY]-[SEQUENCE] |
| Revision | 1.0 |
| Release Date | YYYY-MM-DD |
| Status | Published |
| Classification | Public |
| Prepared By | TwinMOS Product Team |
| Reviewed By | TwinMOS Engineering |

---

## Product Overview

<!-- Write 2-3 paragraphs. Paragraph 1: concise technical summary — what the product is,
     its primary interface, capacity range, and performance tier. Paragraph 2: target
     applications and use cases — who uses it and in what system configurations.
     Paragraph 3 (optional): key differentiators versus the competitive landscape or
     previous-generation products. Write for an engineering audience: be specific,
     avoid marketing superlatives, cite actual specification numbers.
     Approximate length: 120-200 words total. -->

[PARAGRAPH 1 — Technical summary: product type, interface, NAND/DRAM type, capacity range, headline performance figure. Example: "The TwinMOS CoreX Pro M.2 is a PCIe Gen 5.0 x4 NVMe 2.0 solid-state drive in the M.2 2280 form factor, available in capacities from 500 GB to 4 TB. Based on 232-layer TLC NAND and a PCIe Gen 5.0 controller, the drive delivers sequential read performance up to 14,500 MB/s and sequential write performance up to 12,000 MB/s."]

[PARAGRAPH 2 — Target applications: describe the system configurations, workloads, and user profiles this product is designed for. Example: "The CoreX Pro targets high-end desktop and workstation systems equipped with Intel Core Ultra 200 or AMD Ryzen 9000 series processors and a motherboard providing a PCIe 5.0 x4 M.2 slot. Primary applications include 4K/8K video editing, large-dataset scientific computing, game streaming, and professional content creation workflows that require sustained high-bandwidth storage throughput."]

[PARAGRAPH 3 — Key differentiators (optional): generation-over-generation improvement, unique features, or certification highlights that distinguish this product. Example: "Compared to the previous-generation CoreX Gen 4, the CoreX Pro delivers approximately 2.6× higher sequential read bandwidth, enabling perceptibly faster large-file transfers and OS boot times on capable platforms. All capacity variants carry TBW endurance ratings certified under the JESD218 endurance testing standard."]

---

## Specifications

### General Specifications

<!-- Fill in every row. Use exact values as measured or rated — do not round liberally.
     For "N/A" rows, delete the row rather than leave it as N/A.
     Speed grades: list all offered variants (e.g. 4800 / 5600 / 6000 MT/s).
     Capacity: list all offered capacities in ascending order.
     If a parameter varies by capacity or speed grade, note it in the value column. -->

| Parameter | Value |
|-----------|-------|
| Product Type | [e.g. DDR5 U-DIMM / M.2 NVMe SSD / Portable SSD / USB Flash Drive] |
| Interface | [e.g. DDR5 / PCIe Gen 5.0 x4 NVMe 2.0 / SATA III 6 Gb/s / USB 3.2 Gen 2] |
| Form Factor | [e.g. 288-pin U-DIMM / M.2 2280 / 2.5-inch / USB Type-A] |
| Capacity / Density Options | [e.g. 8 GB, 16 GB, 32 GB / 500 GB, 1 TB, 2 TB, 4 TB] |
| Speed Grade(s) | [e.g. DDR5-4800 / DDR5-5600 / DDR5-6000 — or — up to 14,500 MB/s sequential read] |
| Sequential Read (Max) | [e.g. 14,500 MB/s — SSDs only; delete row for memory] |
| Sequential Write (Max) | [e.g. 12,000 MB/s — SSDs only; delete row for memory] |
| Random Read 4K (Max) | [e.g. 1,800,000 IOPS — SSDs only; delete row for memory] |
| Random Write 4K (Max) | [e.g. 1,600,000 IOPS — SSDs only; delete row for memory] |
| CAS Latency | [e.g. CL36 / CL38 / CL40 — memory only; delete row for SSDs] |
| Timing (tCL-tRCD-tRP-tRAS) | [e.g. 36-38-38-80 — memory only; delete row for SSDs] |
| NAND Flash Type | [e.g. 3D TLC / 3D QLC — SSDs only; delete row for memory] |
| DRAM Cache | [e.g. LPDDR4 — SSDs with DRAM cache; delete row if DRAM-less] |
| Error Correction | [e.g. On-Die ECC (DDR5) / LDPC — specify standard] |
| Channels | [e.g. 1 (single), 2 (dual) — memory only; delete row for SSDs] |
| Rank Configuration | [e.g. 1Rx8 / 2Rx8 — memory only; delete row for SSDs] |
| Operating Temperature | [e.g. 0°C to 70°C (commercial) / 0°C to 85°C (industrial)] |
| Storage Temperature | [e.g. -40°C to 85°C] |
| Weight | [e.g. 7 g / 32 g — per module or drive] |

### Electrical Specifications

<!-- Provide exact voltage and current values. Use typical and maximum columns
     where applicable. For memory, include all VDD rails. For SSDs, include
     the supply rail (3.3 V for M.2; 5 V for 2.5-inch SATA).
     Delete rows that do not apply to this product category. -->

| Parameter | Typical | Maximum | Unit |
|-----------|---------|---------|------|
| VDD Supply Voltage | [e.g. 1.10] | [e.g. 1.15] | V |
| VDDQ Supply Voltage | [e.g. 1.10] | [e.g. 1.15] | V |
| VPP Supply Voltage | [e.g. 1.80] | [e.g. 1.90] | V (DDR5 memory only) |
| 3.3 V Supply (M.2) | [e.g. 3.30] | [e.g. 3.46] | V (M.2 SSD only) |
| 5 V Supply (SATA) | [e.g. 5.00] | [e.g. 5.25] | V (2.5-inch SATA only) |
| Active Current Draw | [e.g. 1.50] | [e.g. 2.10] | A |
| Idle Current Draw | [e.g. 0.05] | [e.g. 0.10] | A |
| Sleep / DevSleep Current | [e.g. 0.002] | [e.g. 0.005] | A (SSDs only) |
| Power Consumption (Active) | [e.g. 4.95] | [e.g. 6.93] | W |
| Power Consumption (Idle) | [e.g. 0.165] | [e.g. 0.33] | W |
| Power Consumption (Sleep) | [e.g. 0.006] | — | W (SSDs only) |
| ESD Protection | [e.g. ±2 kV HBM per JEDEC JS-001] | | |

### Environmental Specifications

<!-- Values shown are typical TwinMOS defaults. Adjust if a specific product
     carries a different rating. Do not change altitude unless confirmed. -->

| Parameter | Specification |
|-----------|---------------|
| Operating Temperature | [e.g. 0°C to 70°C] |
| Storage Temperature | [e.g. -40°C to 85°C] |
| Relative Humidity (Operating) | 5% to 90% RH, non-condensing |
| Relative Humidity (Storage) | 5% to 95% RH, non-condensing |
| Operating Altitude | 0 to 3,048 m (0 to 10,000 ft) |
| Storage Altitude | 0 to 12,192 m (0 to 40,000 ft) |
| Shock (Operating) | [e.g. 1,500 G / 0.5 ms half-sine — SSDs; confirm from test data] |
| Shock (Non-Operating) | [e.g. 1,500 G / 0.5 ms half-sine] |
| Vibration (Operating) | [e.g. 2.17 G RMS, 10–2000 Hz] |
| Vibration (Non-Operating) | [e.g. 3.13 G RMS, 10–2000 Hz] |
| Acoustic Noise | [e.g. N/A (solid-state) / ≤ 28 dBA (HDD products only)] |

### Reliability & Endurance

<!-- MTBF must cite the calculation standard (MIL-HDBK-217, Telcordia SR-332, etc.).
     TBW (Total Bytes Written) applies to SSDs only — delete row for memory.
     DWPD (Drive Writes Per Day) applies to SSDs only — delete row for memory.
     Endurance Rating applies to memory (lifetime cycles) — delete row for SSDs. -->

| Parameter | Value |
|-----------|-------|
| MTBF | [e.g. 1,500,000 hours (MIL-HDBK-217F)] |
| TBW (Total Bytes Written) — per capacity | [e.g. 500 GB: 300 TBW / 1 TB: 600 TBW / 2 TB: 1,200 TBW] |
| DWPD (Drive Writes Per Day, 5-year) | [e.g. 0.33 DWPD — SSDs only] |
| Uncorrectable Bit Error Rate (UBER) | [e.g. < 1 sector per 10^16 bits read — SSDs only] |
| Data Retention (powered off) | [e.g. 1 year at 40°C — SSDs only] |
| Endurance Rating (Memory) | [e.g. Unlimited — standard DRAM; delete row for SSDs] |
| Warranty Period | [e.g. 3 years / 5 years — must match Warranty section below] |

---

## Key Features

<!-- List 8-10 features. Each feature must have a bold label and a concise technical
     explanation. Avoid vague marketing language. Each bullet should tell an engineer
     something specific and verifiable. -->

- **[FEATURE 1 LABEL]**: [Technical explanation — e.g. "PCIe Gen 5.0 x4 Interface: Delivers up to 128 Gbps of raw bandwidth per the PCI Express Base Specification Revision 5.0, doubling the throughput ceiling of Gen 4 platforms."]
- **[FEATURE 2 LABEL]**: [Technical explanation — e.g. "LPDDR4 DRAM Cache: An onboard DRAM cache sized proportional to NAND capacity (1 GB per TB) accelerates directory lookups and write-buffer management, reducing worst-case latency on mixed workloads."]
- **[FEATURE 3 LABEL]**: [Technical explanation — e.g. "On-Die ECC: DDR5 devices include on-die error-correction circuitry that detects and corrects single-bit errors within each die before data exits the chip, improving effective data integrity versus DDR4."]
- **[FEATURE 4 LABEL]**: [Technical explanation]
- **[FEATURE 5 LABEL]**: [Technical explanation]
- **[FEATURE 6 LABEL]**: [Technical explanation]
- **[FEATURE 7 LABEL]**: [Technical explanation]
- **[FEATURE 8 LABEL]**: [Technical explanation]
- **[FEATURE 9 LABEL (optional)]**: [Technical explanation]
- **[FEATURE 10 LABEL (optional)]**: [Technical explanation]

---

## Physical Dimensions

<!-- Dimensions must be exact (not nominal) as verified by QA measurement.
     For memory DIMMs include PCB thickness. For M.2 drives include key type.
     For 2.5-inch drives include the 7 mm / 9.5 mm height standard.
     Delete rows that do not apply. Add a note if dimensions vary by capacity. -->

| Dimension | Value |
|-----------|-------|
| Length | [e.g. 80.00 mm (M.2 2280) / 133.35 mm (U-DIMM)] |
| Width | [e.g. 22.00 mm (M.2) / 30.48 mm (DDR5 U-DIMM)] |
| Height (without heatspreader) | [e.g. 2.23 mm (M.2 PCB) / 4.20 mm (bare U-DIMM)] |
| Height (with heatspreader, if fitted) | [e.g. 6.80 mm — delete row if no heatspreader] |
| PCB Thickness | [e.g. 1.00 mm ± 0.10 mm — for DIMMs and M.2] |
| Weight (per unit) | [e.g. 7 g (bare DIMM) / 8.5 g (M.2 SSD)] |
| M.2 Key Type | [e.g. M-key (2280) — M.2 products only; delete row otherwise] |
| SATA Connector Type | [e.g. SATA 22-pin (7-pin data + 15-pin power) — SATA products only] |
| USB Connector Type | [e.g. USB Type-A Male / USB Type-C Male — USB products only] |
| Enclosure Material | [e.g. Aluminium alloy / ABS plastic — portable products only] |
| Dimensional Drawing Reference | [e.g. See Figure 1 in the PDF datasheet; or "Contact engineering for 3D CAD model"] |

---

## Interface & Pin Configuration

<!-- Include the relevant subsection(s) for this product. Delete subsections
     that do not apply. For memory, use the DDR5 or DDR4 subsection.
     For NVMe SSDs, use the M.2 subsection. For SATA, use the SATA subsection.
     Full pinout tables for DDR5 288-pin and DDR4 288-pin are large; summarise
     key power, data, and command groups and direct readers to JEDEC standards
     for full pinout detail. For M.2 and SATA, provide the key signal groups. -->

### DDR5 288-Pin U-DIMM (Memory Products)

<!-- Applicable to: VOLTX DDR5 U-DIMM, VOLTX RGB DDR5 U-DIMM.
     Delete this subsection for non-DDR5-UDIMM products. -->

| Pin Group | Pin Count | Description |
|-----------|-----------|-------------|
| DQ (Data) | 64 | 64-bit data bus, CMOS levels |
| DQS / DQS# | 16 | Differential data strobe pairs (8 pairs) |
| CA (Command/Address) | 14 | Row/column address and command bus |
| CS# (Chip Select) | 2 | Per-rank chip select |
| CK / CK# | 2 | Differential clock input pair |
| VDD / VDDQ / VPP | — | Power rails (1.1 V VDD/VDDQ, 1.8 V VPP) |
| GND | — | Ground references |
| SPD (Serial Presence Detect) | — | I2C bus for SPD EEPROM (SDA, SCL, SA0–SA2) |
| RESET# | 1 | Module reset |
| EVENT# | 1 | PMIC event notification |

Full pinout per JEDEC Standard No. 21C, Annex L (DDR5 SDRAM SPD and Module Pinout).

### DDR5 / DDR4 SO-DIMM (Laptop Memory Products)

<!-- Applicable to: VOLTX DDR5 SO-DIMM, DDR4 SO-DIMM.
     Delete this subsection for non-SO-DIMM products. -->

| Parameter | DDR5 SO-DIMM | DDR4 SO-DIMM |
|-----------|-------------|-------------|
| Pin Count | 262-pin | 260-pin |
| Connector Type | Edge connector, 0.5 mm pitch | Edge connector, 0.5 mm pitch |
| Key Notch Position | Offset toward power pins (DDR5-specific) | Centre-offset (DDR4-specific) |
| Data Bus Width | 64-bit | 64-bit |
| Clock Frequency | Up to 3,200 MHz (DDR5-6400 transfer rate) | Up to 2,133 MHz (DDR4-4266 transfer rate) |

Full pinout per JEDEC Standard No. 21C, Annex M (SO-DIMM pinout).

### M.2 2280 (NVMe and SATA SSD Products)

<!-- Applicable to: CoreX Pro Gen 5, Xtreme Gen 4, CoreX Gen 4, Xtreme Pro Gen 4,
     Alpha Pro Gen 3, TW300 Gen 3, M.2 2280 SATA III.
     Delete this subsection for non-M.2 products. -->

| Pin Group | Interface | Description |
|-----------|-----------|-------------|
| PERn/PERp (x4) | PCIe | PCIe receive differential pairs (lanes 0–3) |
| PETn/PETp (x4) | PCIe | PCIe transmit differential pairs (lanes 0–3) |
| REFCLK+ / REFCLK- | PCIe | 100 MHz reference clock differential pair |
| PERST# | PCIe / NVMe | PCIe reset signal |
| SATA A+/A- | SATA | SATA transmit (for M.2 SATA mode only) |
| SATA B+/B- | SATA | SATA receive (for M.2 SATA mode only) |
| 3.3 V | Power | Main supply (M.2 M-key provides 3.3 V) |
| GND | Power | Ground references |
| M-Key notch | Mechanical | Pins 67–74 absent (M-key configuration) |

Per M.2 Specification Revision 1.0 (PCI-SIG) and SATA-IO M.2 Application Note.

### SATA III 2.5-Inch (SATA SSD Products)

<!-- Applicable to: Hyper H2 Ultra SATA III 2.5".
     Delete this subsection for non-SATA-2.5 products. -->

| Connector | Pins | Function |
|-----------|------|----------|
| SATA Data Connector (7-pin) | A1–A7 | Differential data pairs (TX+, TX-, GND, RX+, RX-, GND, GND) |
| SATA Power Connector (15-pin) | P1–P15 | 3.3 V (P1–P3), GND (P4–P6), 5 V (P7–P9), GND (P10–P12), 12 V (P13–P15) |
| Note | — | 12 V pins not used by 2.5-inch SSDs; 3.3 V pins optional per host |

### USB Type-C (Portable SSD Products)

<!-- Applicable to: ELITE Drive Pro Portable SSD.
     Delete this subsection for non-USB-C products. -->

| Signal Group | USB Standard | Description |
|-------------|-------------|-------------|
| USB3 SuperSpeed TX/RX | USB 3.2 Gen 2 (10 Gbps) | SuperSpeed differential pairs |
| USB2 D+/D- | USB 2.0 | High-speed fallback data pairs |
| CC1 / CC2 | USB-C | Configuration channel, plug orientation detection |
| VBUS | USB-C | 5 V bus power (up to 900 mA, USB 3.x) |
| GND | USB-C | Ground |

---

## Ordering Information

<!-- Include one row per unique SKU. If many SKUs exist, group by capacity tier.
     EAN-13/GTIN: obtain the authorised barcode from the Product team before publishing.
     Packaging: standard retail box (colour), OEM white box, bulk tray.
     MOQ: minimum order quantity — for distributor-facing datasheets only; delete if not needed. -->

| Model Number | Description | Capacity | EAN-13 / GTIN | Packaging |
|--------------|-------------|----------|---------------|-----------|
| [MODEL-SKU-1] | [Full marketing description] | [e.g. 1 TB] | [13-digit EAN] | [e.g. Retail box] |
| [MODEL-SKU-2] | [Full marketing description] | [e.g. 2 TB] | [13-digit EAN] | [e.g. Retail box] |
| [MODEL-SKU-3] | [Full marketing description] | [e.g. 4 TB] | [13-digit EAN] | [e.g. Retail box] |
| [MODEL-SKU-OEM] | [OEM variant, if applicable] | [e.g. 1 TB] | [13-digit EAN] | [e.g. OEM white box] |

---

## Performance Benchmarks

<!-- OPTIONAL SECTION. Include only if verified benchmark data is available.
     All benchmark results must be obtained under the test conditions described
     in the header row. Do not include estimates or marketing claims.
     For memory: bandwidth and latency by XMP/EXPO profile.
     For SSDs: sequential and random performance by capacity tier.
     If benchmarks are not yet available, delete this entire section. -->

### Test Conditions

<!-- Describe the test platform exactly: CPU, motherboard, chipset, BIOS version,
     OS, benchmark tool and version, and number of test runs. -->

| Component | Specification |
|-----------|---------------|
| Test Platform | [e.g. Intel Core Ultra 9 285K / ASUS ROG MAXIMUS Z890 APEX / BIOS 1201] |
| Operating System | [e.g. Windows 11 Pro 24H2 (Build 26100.xxxx)] |
| Benchmark Tool | [e.g. CrystalDiskMark 8.0.5 / AIDA64 7.20] |
| Ambient Temperature | [e.g. 23°C ± 2°C] |
| Test Runs | [e.g. 5 runs; best result shown] |

### Benchmark Results

| Test | [CAPACITY 1] | [CAPACITY 2] | [CAPACITY 3] | Unit |
|------|-------------|-------------|-------------|------|
| Sequential Read (Q8T1) | — | — | — | MB/s |
| Sequential Write (Q8T1) | — | — | — | MB/s |
| Random Read 4K (Q32T1) | — | — | — | IOPS |
| Random Write 4K (Q32T1) | — | — | — | IOPS |
| Sequential Read (Q1T1) | — | — | — | MB/s |
| Sequential Write (Q1T1) | — | — | — | MB/s |

---

## Platform Compatibility

<!-- List confirmed compatible chipsets, sockets, and operating systems.
     "Confirmed" means QA-tested. Do not list theoretical compatibility.
     For memory: include XMP 3.0 and EXPO support status.
     For SSDs: include NVMe version and whether hot-plug is supported. -->

### Compatible Chipsets & Sockets

| Platform | Chipset / Socket | Notes |
|----------|-----------------|-------|
| [e.g. Intel Desktop 14th/15th Gen] | [e.g. Z890, Z790, B760] | [e.g. XMP 3.0 supported] |
| [e.g. AMD Desktop Ryzen 9000 Series] | [e.g. X870E, X870, B850] | [e.g. EXPO supported] |
| [e.g. Intel Laptop Core Ultra 200H] | [e.g. HM870] | [e.g. SO-DIMM; check OEM BIOS] |
| [Add rows as needed] | | |

### Operating System Compatibility

| Operating System | Version | Support Status |
|-----------------|---------|----------------|
| Windows | 11 (24H2 and later) | Full support, plug-and-play |
| Windows | 10 (22H2) | Full support, plug-and-play |
| macOS | Ventura 13.x, Sonoma 14.x, Sequoia 15.x | [Confirm if applicable; SSDs/USB only] |
| Linux | Kernel 5.15 LTS and later | Full support |
| [Add OS as confirmed by QA] | | |

---

## Regulatory Compliance

<!-- List every certification this specific product carries. Do not copy-paste
     from another datasheet without verifying the certificates apply to this
     exact product model and its target markets.
     Standard Reference column must cite the specific standard/directive number. -->

| Certification | Standard / Directive | Scope |
|--------------|---------------------|-------|
| CE | EN 55032, EN 55035, EN IEC 61000-3-2, EN IEC 61000-3-3 | EMC — EU |
| CE | EN IEC 62368-1 | Safety — EU |
| UKCA | UK SI 2016/1091 (EMC), UK SI 2016/1101 (LVD) | UK market |
| FCC | Part 15 Subpart B, Class B | USA radio emissions |
| RoHS | EU Directive 2011/65/EU (RoHS 3) | Hazardous substance restriction |
| REACH | EU Regulation EC 1907/2006, SVHC Candidate List | Chemical substance declaration |
| EAC | TR CU 004/2011, TR CU 020/2011 | Eurasian Customs Union |
| JEDEC | [JESD79-5 (DDR5) / JESD79-4 (DDR4) / JESD218 (SSD endurance)] | Memory/SSD standard compliance |
| ISO 9001:2015 | ISO 9001:2015 | Manufacturing quality management |
| [Add additional certifications as applicable] | | |

---

## Quality Assurance

<!-- Describe the manufacturing and testing programme briefly. This section
     is important for enterprise and procurement readers who need assurance
     of process quality. Keep factual and auditable — do not over-promise. -->

TwinMOS Technologies operates under an ISO 9001:2015-certified quality management system covering product design, NAND/DRAM procurement, module assembly, in-circuit testing, and outgoing quality control.

Each [PRODUCT NAME] unit undergoes the following testing before shipment:

- **Incoming Inspection**: All NAND flash and DRAM ICs are lot-sampled and verified against vendor COA prior to production.
- **Automated In-Circuit Test (ICT)**: 100% electrical continuity and parametric testing at the PCB assembly stage.
- **Functional Performance Test**: Sequential and random performance verification against rated specifications under thermal load.
- **Burn-In Screening (where applicable)**: [e.g. "Extended thermal cycle burn-in at 70°C for 48 hours to screen early-life failures" — include if applicable, or delete.]
- **Final Quality Inspection**: Visual inspection and packaging verification prior to shipment.
- **Outgoing Quality Control (OQC)**: Statistical sample testing of finished goods before each production lot is released.

---

## Warranty

<!-- Warranty period must match the value in the Reliability & Endurance table above.
     Do not modify the warranty exclusions without approval from the Legal team.
     Regional warranty terms may differ — note here if a separate regional policy applies. -->

### Coverage

TwinMOS Technologies warrants this product against defects in materials and workmanship for **[WARRANTY PERIOD — e.g. 3 years / 5 years]** from the date of original retail purchase, under normal use and conditions.

For SSD products, the warranty is also subject to the TBW (Total Bytes Written) endurance limit stated in the Reliability & Endurance section above, whichever occurs first.

### Exclusions

The warranty does not cover:

- Physical damage resulting from accident, misuse, or unauthorised modification
- Damage caused by operating outside the specified electrical, environmental, or thermal limits stated in this datasheet
- Products with removed, damaged, or altered serial number labels
- Normal wear, cosmetic damage, or data loss
- Damage caused by use with non-compatible hardware or software

### Warranty Claim Procedure

1. Contact TwinMOS Technical Support at support@twinmos.com with proof of purchase, product model, and serial number.
2. Support will issue an RMA (Return Merchandise Authorisation) number.
3. Ship the product prepaid to the address provided by Support, with the RMA number clearly marked on the outer packaging.
4. Upon receipt and verification, TwinMOS will, at its discretion, repair or replace the product.

Full warranty terms are available at [www.twinmos.com/warranty](https://www.twinmos.com/warranty).

---

## Revision History

<!-- Add a new row at the top of the table body for each new revision.
     Revision 1.0 is always "Initial release." For subsequent revisions,
     describe the change concisely — e.g. "Updated TBW rating for 4 TB SKU",
     "Added EAC certification", "Corrected operating voltage (1.10 V, was 1.05 V)". -->

| Revision | Date | Author | Change Summary |
|----------|------|--------|----------------|
| 1.0 | YYYY-MM-DD | TwinMOS Product Team | Initial release |

---

## Contact Information

**TwinMOS Technologies**

| Channel | Details |
|---------|---------|
| Website | [www.twinmos.com](https://www.twinmos.com) |
| Technical Support | support@twinmos.com |
| Sales & Distribution | sales@twinmos.com |
| Headquarters | Dubai Airport Free Zone (DAFZA), UAE |
| Engineering & Operations | Taipei, Taiwan |

For regional distributor contact details, visit [www.twinmos.com/distributors](https://www.twinmos.com/distributors).

---

## Legal Disclaimer

This datasheet is published by TwinMOS Technologies for informational and evaluation purposes only. The information contained herein is believed to be accurate at the time of publication but is subject to change without notice.

TwinMOS Technologies reserves the right to modify the products, specifications, feature sets, and packaging described in this document at any time and without obligation to notify any person or entity. The most current version of this datasheet is always available at [www.twinmos.com/products/datasheets](https://www.twinmos.com/products/datasheets).

Nothing in this datasheet constitutes a warranty of any kind, express or implied. All performance figures represent maximum rated values measured under specific test conditions; actual performance may vary depending on the host system, BIOS settings, software configuration, workload characteristics, and operating temperature.

TwinMOS Technologies shall not be liable for any errors, omissions, or damages of any kind arising from the use of information contained in this datasheet.

TwinMOS and all TwinMOS product names are trademarks or registered trademarks of TwinMOS Technologies. All other trademarks and product names are the property of their respective owners.

Copyright &copy; [YEAR] TwinMOS Technologies. All rights reserved. Reproduction in whole or in part without written permission is prohibited.

---

<!-- ============================================================
     END OF TEMPLATE
     ============================================================
     CONTENT AUTHOR CHECKLIST — verify before submitting for review:

     [ ] YAML frontmatter: all fields completed and accurate
     [ ] Document Information table: document number assigned and correct
     [ ] Product Overview: 2-3 paragraphs, no placeholder text remaining
     [ ] General Specifications: all applicable rows filled; inapplicable rows deleted
     [ ] Electrical Specifications: all voltage and current values confirmed with engineering
     [ ] Environmental Specifications: values match QA test report
     [ ] Reliability & Endurance: TBW values confirmed per JESD218 test
     [ ] Key Features: 8-10 bullets, all technically accurate
     [ ] Physical Dimensions: values confirmed against production drawing
     [ ] Interface & Pin Configuration: correct subsection(s) retained; others deleted
     [ ] Ordering Information: all SKUs listed with correct EAN-13 barcodes
     [ ] Performance Benchmarks: section present only if verified data available
     [ ] Platform Compatibility: QA-confirmed platforms only
     [ ] Regulatory Compliance: certificates verified for this exact product
     [ ] Quality Assurance: burn-in row present/absent as appropriate
     [ ] Warranty: period matches Reliability table; regional note added if needed
     [ ] Revision History: at minimum revision 1.0 row present
     [ ] Contact Information: no changes needed (standard block)
     [ ] Legal Disclaimer: copyright year updated
     [ ] All comment blocks removed before publishing
     [ ] Spell-check and technical review completed
     [ ] PDF exported and uploaded to CDN at /downloads/datasheets/[product-slug].pdf
     [ ] Datasheet directory (_index.md) updated with new entry
     ============================================================ -->
