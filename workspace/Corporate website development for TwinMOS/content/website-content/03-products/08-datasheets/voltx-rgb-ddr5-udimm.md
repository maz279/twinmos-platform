---
title: "Datasheet — VOLTX RGB DDR5 U-DIMM | TwinMOS"
slug: "datasheet-voltx-rgb-ddr5-udimm"
url: "/products/datasheets/voltx-rgb-ddr5-udimm"
template: "datasheet-pdf"
description: "Official TwinMOS VOLTX RGB DDR5 U-DIMM datasheet. 5600–6000MHz, CL36, ARGB lighting, XMP 3.0 & EXPO, 288-pin for Intel LGA 1700 and AMD AM5."
keywords: ["TwinMOS VOLTX RGB DDR5", "DDR5 RGB memory", "ARGB DDR5 U-DIMM", "DDR5 6000MHz RGB", "XMP 3.0 EXPO RGB", "TwinMOS datasheet", "Aura Sync DDR5", "addressable RGB memory", "PC5-48000 RGB", "DDR5 desktop RGB kit"]
persona: ["professional", "enterprise", "technician", "distributor", "engineer"]
phase: P1
priority: P0
owner: "product"
status: published
last_reviewed: "2026-04-30"
locale: en
schema: "Product"
ctas:
  - text: "Download PDF"
    url: "/downloads/datasheets/voltx-rgb-ddr5-udimm.pdf"
  - text: "View Product Page"
    url: "/products/memory/voltx-rgb-ddr5-udimm"
  - text: "Contact Sales"
    url: "/contact"
cross_links:
  - "/products/datasheets"
  - "/products/memory"
  - "/support"
sources: ["CP", "TwinMOS Official Specifications 2026"]
---

# Datasheet — VOLTX RGB DDR5 U-DIMM

## Document Information

| Field | Value |
|-------|-------|
| Product Name | TwinMOS VOLTX RGB DDR5 U-DIMM |
| Product Family | VOLTX DDR5 Desktop Memory — RGB Series |
| Document Number | TM-DS-DDR5URGB-001 |
| Revision | 1.0 |
| Date | 2026-04-30 |
| Status | Published |
| Classification | Public |

---

## Product Overview

The TwinMOS VOLTX RGB DDR5 U-DIMM combines enthusiast-class DDR5 memory performance with fully addressable RGB illumination, designed for high-performance PC builds where visual aesthetics are as important as memory bandwidth. Operating at 5600 MT/s and 6000 MT/s with CL36 timings via Intel XMP 3.0 and AMD EXPO profiles, the VOLTX RGB series provides the same core performance specifications as the heatspreader-equipped VOLTX DDR5 models while adding an integrated 5V ARGB light bar diffuser embedded in the Dark Maroon aluminum heatspreader assembly.

The addressable RGB subsystem is designed to integrate natively with the four major motherboard lighting ecosystems: ASUS Aura Sync, Gigabyte RGB Fusion 2.0, MSI Mystic Light, and ASRock Polychrome SYNC. Lighting control is handled through the motherboard's 5V ARGB (3-pin) header, allowing users to synchronize the VOLTX RGB modules with other system components — including CPU coolers, chassis fans, and GPU lighting — for a unified aesthetic experience. Six programmable lighting effects are supported, from static color and breathing to music-reactive sync.

Structurally, every VOLTX RGB module is built on the DDR5 SDRAM architecture with on-die ECC and an on-module PMIC, ensuring the reliability and power management benefits of the full VOLTX platform. The Dark Maroon aluminum heatspreader serves both as a thermal management component and as the housing for the RGB diffuser bar. Factory-matched dual-channel kits (2×16 GB and 2×32 GB) are available for customers requiring validated pairs with guaranteed synchronized RGB behavior and memory compatibility.

The VOLTX RGB DDR5 U-DIMM is certified to ISO 9001 quality standards and complies with CE, FCC Part 15 Class B, RoHS, REACH, BSMI, and KC regulatory requirements.

---

## Specifications

### General Specifications

| Parameter | Value |
|-----------|-------|
| Memory Type | DDR5 SDRAM |
| Form Factor | U-DIMM (Unbuffered DIMM) |
| Pin Count | 288-pin |
| Channels per DIMM | 2× 32-bit subchannels (64-bit effective) |
| Speeds Supported | 5600 MHz, 6000 MHz |
| PC Speed Ratings | PC5-44800, PC5-48000 |
| Capacities Available | 16 GB, 32 GB (single module); 32 GB kit (2×16 GB); 64 GB kit (2×32 GB) |
| CAS Latency | CL36 (XMP 3.0 / EXPO profiles) |
| ECC | On-die ECC (integrated per JEDEC DDR5 specification) |
| Power Management | On-module PMIC (Power Management IC) |
| Heatspreader | Dark Maroon anodized aluminum with integrated RGB diffuser bar |
| RGB Interface | 5V Addressable RGB (ARGB), 3-pin / 5-pin header |
| Standard Compliance | JEDEC JESD79-5 DDR5 |
| Overclocking Support | Intel XMP 3.0; AMD EXPO |

### Electrical Specifications

| Parameter | Value |
|-----------|-------|
| Operating Voltage (JEDEC default) | 1.1 V (VDD / VDDQ) |
| Operating Voltage (XMP 3.0 / EXPO) | 1.35 V |
| VDDQ | Equal to VDD |
| VPP (Activation Power Supply) | 1.8 V |
| RGB LED Supply Voltage | 5 V (supplied by motherboard ARGB header) |
| RGB LED Current (typical, per module) | ~300 mA (full-color, maximum brightness) |
| Input Logic High (VIH) | ≥ 0.65 × VDD |
| Input Logic Low (VIL) | ≤ 0.35 × VDD |
| Power State Support | Active, Self-Refresh, Power-Down |
| Termination | On-die termination (ODT) |

### CAS Latency by Speed Grade

| Speed Grade | Data Rate | CAS Latency | tRCD | tRP | tRAS | Voltage |
|-------------|-----------|-------------|------|-----|------|---------|
| DDR5-5600 (XMP/EXPO) | 5600 MT/s | CL36 | 36 | 36 | 68 | 1.35 V |
| DDR5-6000 (XMP/EXPO) | 6000 MT/s | CL36 | 46 | 46 | 86 | 1.35 V |
| DDR5-4800 (JEDEC default) | 4800 MT/s | CL40 | 40 | 40 | 77 | 1.1 V |

### Environmental Specifications

| Parameter | Value |
|-----------|-------|
| Operating Temperature | 0°C to 85°C |
| Storage Temperature | -40°C to 95°C |
| Operating Humidity | 5% to 95% relative humidity, non-condensing |
| Storage Humidity | 5% to 95% relative humidity, non-condensing |
| Altitude (Operating) | Up to 3000 m |

---

## Key Features

1. **Addressable RGB (ARGB) Illumination via 5V Header**: The VOLTX RGB series incorporates a 5V addressable RGB light bar integrated into the heatspreader assembly. Unlike fixed-color or 12V RGB implementations, the 5V ARGB architecture allows independent control of each LED zone, enabling gradient effects, zone-specific color assignments, and real-time reactive effects. Connection is via the motherboard's 3-pin 5V ARGB header, and no proprietary software or external controllers are required when used with a compatible motherboard.

2. **Motherboard Ecosystem Synchronization (Aura Sync, RGB Fusion 2.0, Mystic Light, Polychrome SYNC)**: The VOLTX RGB is natively compatible with the four leading motherboard RGB ecosystems: ASUS Aura Sync, Gigabyte RGB Fusion 2.0, MSI Mystic Light, and ASRock Polychrome SYNC. When connected to a compatible motherboard, the memory RGB lighting is automatically detected and controllable from within the motherboard's lighting software, enabling full system-wide RGB synchronization with CPU coolers, case fans, and GPU lighting without the need for third-party software.

3. **Six Programmable Lighting Effects**: The VOLTX RGB supports six factory-selectable and software-programmable lighting modes: Static (solid color), Breathing (fade in/out), Color Cycle (automated hue rotation), Rainbow Wave (color band movement across the module), Music Sync (audio-reactive frequency response via system audio), and Strobing (high-speed flash). Effects can be configured and synchronized independently per module in kits or applied uniformly across all modules in a matched set.

4. **High-Performance DDR5-6000 CL36 and DDR5-5600 CL36 via XMP 3.0 and EXPO**: The VOLTX RGB achieves a maximum rated speed of 6000 MT/s with CL36-46-46-86 timings at 1.35 V under Intel XMP 3.0 and AMD EXPO profiles. The CL36 primary latency at 5600 MT/s (36-36-36-68) represents an aggressive timing bin that delivers strong real-world performance in both gaming and content creation workloads. Both profiles are factory-validated and stored in the module's SPD EEPROM.

5. **On-Die ECC for Transparent Error Correction**: Every VOLTX RGB module incorporates on-die ECC as mandated by the JEDEC DDR5 standard. The ECC engine within each DRAM die continuously monitors and corrects single-bit errors transparently, without any operating system configuration or performance overhead. This provides a meaningful reliability improvement over DDR4 in high-density, high-speed applications where cell leakage at extreme frequencies can cause transient data errors.

6. **Integrated PMIC for Clean High-Frequency Power Delivery**: The on-module Power Management IC manages all voltage regulation on the DIMM, isolating the DRAM components from motherboard power rail noise. For overclocked DDR5-5600 and DDR5-6000 operation, the PMIC's ability to deliver tightly regulated, low-ripple 1.35 V is critical to maintaining signal integrity at the high frequencies and aggressive timings the VOLTX RGB targets.

7. **Dark Maroon Aluminum Heatspreader with Integrated Diffuser**: The signature Dark Maroon anodized aluminum heatspreader serves a dual purpose: it conducts heat away from the DRAM packages for sustained thermal stability at overclocked speeds, and it houses the RGB diffuser bar that distributes light evenly along the top of the module. The diffuser material is optimized for uniform light output with minimal hot-spotting between LED zones, producing smooth gradient and wave effects without visible LED separation lines.

8. **Factory-Matched Dual-Channel Kits with RGB Synchronization**: All dual-channel DK kits ship as factory-tested matched pairs, with both modules binned to the same timing and speed grade. For RGB kits, TwinMOS additionally validates that both modules produce matched light output intensity and consistent LED behavior across lighting effects. This ensures symmetric, synchronized RGB displays when modules are installed in matched slots.

---

## Physical Dimensions

| Dimension | Value |
|-----------|-------|
| Length | 133.35 mm |
| Width (with heatspreader and RGB bar) | 43.0 mm |
| Thickness (with heatspreader) | 8.0 mm |
| Weight (approx.) | ~48 g |
| Heatspreader Material | Anodized aluminum |
| Heatspreader Color | Dark Maroon |
| RGB Bar Location | Top edge of heatspreader |
| Connector | 288-pin DDR5 edge connector |

> **Note:** The RGB bar adds approximately 3–4 mm to the effective module height above the standard heatspreader. Verify CPU cooler clearance (minimum 43 mm from PCB bottom edge) before installation. The 5V ARGB cable requires routing to the nearest available 3-pin 5V ARGB header on the motherboard.

---

## Pin Configuration

The VOLTX RGB DDR5 U-DIMM uses the JEDEC-standard 288-pin DDR5 U-DIMM pinout (JEDEC JESD79-5). The RGB subsystem connects via a separate 5V ARGB fly-wire header to the motherboard. Key signal groups for the memory interface are listed below.

### Memory Interface Signal Groups

| Signal Group | Description |
|--------------|-------------|
| DQ[63:0] | 64-bit data bus (2× 32-bit subchannels) |
| DQS[7:0], DQS#[7:0] | Data strobe differential pairs |
| CB[7:0] | On-die ECC check bits |
| A[17:0] | Row/Column address bus |
| BA[1:0] | Bank address |
| BG[2:0] | Bank group address |
| CKE[1:0] | Clock enable |
| CS#[1:0] | Chip select |
| ACT# | Activate command |
| CK_t / CK_c | Differential clock pairs |
| CA[13:0] | Command/Address per subchannel |
| RESET# | Module reset |
| ALERT# | On-die ECC error alert |
| SCL / SDA | SPD I2C bus |
| VDD | 1.1 V / 1.35 V main power supply |
| VDDQ | 1.1 V / 1.35 V I/O supply |
| VPP | 1.8 V activation power |
| VSS | Ground |

### RGB Interface Connector (Fly-Wire Header)

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | +5V | 5 V power supply from ARGB header |
| 2 | Data | Addressable RGB data signal (WS2812 protocol compatible) |
| 3 | N/C | Not connected |
| 4 (or shell) | GND | Ground reference |

> The RGB fly-wire terminates in a standard 3-pin 5V ARGB connector. Pin 2 carries the addressable data signal. The connector is keyed to prevent reverse insertion. Maximum cable length for reliable signal integrity is 300 mm.

---

## XMP 3.0 and EXPO Profiles

| Profile | Transfer Rate | CL | tRCD | tRP | tRAS | Voltage | Target Platform |
|---------|--------------|-----|------|-----|------|---------|----------------|
| XMP 3.0 — Profile 1 | 6000 MT/s | 36 | 46 | 46 | 86 | 1.35 V | Intel (LGA 1700) |
| XMP 3.0 — Profile 2 | 5600 MT/s | 36 | 36 | 36 | 68 | 1.35 V | Intel (LGA 1700) |
| EXPO — Profile 1 | 6000 MT/s | 36 | 46 | 46 | 86 | 1.35 V | AMD (AM5) |
| EXPO — Profile 2 | 5600 MT/s | 36 | 36 | 36 | 68 | 1.35 V | AMD (AM5) |
| JEDEC Default | 4800 MT/s | 40 | 40 | 40 | 77 | 1.1 V | Universal |

> XMP 3.0 and EXPO profiles are activated through the system BIOS. The JEDEC 4800 MT/s profile is the out-of-the-box default on all platforms. Overclocking to XMP/EXPO speeds requires a compatible motherboard with XMP 3.0 or EXPO support. Operating at 1.35 V is within the rated specification for these SKUs.

---

## RGB Lighting Effects Reference

| Effect | Description | Synchronization Support |
|--------|-------------|------------------------|
| Static | Solid user-defined color, always on | Aura Sync, RGB Fusion 2.0, Mystic Light, Polychrome SYNC |
| Breathing | Smooth fade from full brightness to off at configurable speed | Aura Sync, RGB Fusion 2.0, Mystic Light, Polychrome SYNC |
| Color Cycle | Continuous automated rotation through full HSV color spectrum | Aura Sync, RGB Fusion 2.0, Mystic Light, Polychrome SYNC |
| Rainbow Wave | Moving color band progressing along the length of the module | Aura Sync, RGB Fusion 2.0, Mystic Light, Polychrome SYNC |
| Music Sync | LED brightness and color modulated by system audio frequency and amplitude | Software-dependent; requires compatible motherboard utility |
| Strobing | High-frequency on/off flash at configurable rate | Aura Sync, RGB Fusion 2.0, Mystic Light, Polychrome SYNC |

> Lighting effects availability and customization depth depend on the motherboard manufacturer's lighting control software version. For standalone operation without software configuration, the module defaults to a Color Cycle effect at power-on.

---

## Compatible Platforms

| Platform Generation | Socket | Chipsets | XMP Support | EXPO Support |
|--------------------|--------|----------|-------------|--------------|
| Intel 12th Gen (Alder Lake) | LGA 1700 | Z690, B660, H670 | XMP 3.0 | — |
| Intel 13th Gen (Raptor Lake) | LGA 1700 | Z790, B760, H770 | XMP 3.0 | — |
| Intel 14th Gen (Raptor Lake Refresh) | LGA 1700 | Z790, B760 | XMP 3.0 | — |
| AMD Ryzen 7000 Series | AM5 | X670E, X670, B650E, B650 | — | EXPO |
| AMD Ryzen 9000 Series | AM5 | X870E, X870, B850 | — | EXPO |

> Motherboard ARGB header availability varies by model. Verify that the target motherboard has at least one free 3-pin 5V ARGB header for each VOLTX RGB module. Dual-channel kits require two available ARGB headers unless a splitter accessory is used.

---

## Ordering Information

### Single Modules

| Part Number | Capacity | Speed | CAS | Color | Bandwidth | EAN |
|-------------|----------|-------|-----|-------|-----------|-----|
| TMD516GB5600URGB36 | 16 GB | DDR5-5600 | CL36 | Dark Maroon RGB | 44,800 MB/s | — |
| TMD532GB5600URGB36 | 32 GB | DDR5-5600 | CL36 | Dark Maroon RGB | 44,800 MB/s | — |
| TMD516GB6000URGB36 | 16 GB | DDR5-6000 | CL36 | Dark Maroon RGB | 48,000 MB/s | — |
| TMD532GB6000URGB36 | 32 GB | DDR5-6000 | CL36 | Dark Maroon RGB | 48,000 MB/s | 6291104608023 |

### Dual-Channel Kits (DK) — Factory-Matched Pairs

| Part Number | Kit Capacity | Speed | CAS | Color | Dual-Ch Bandwidth |
|-------------|-------------|-------|-----|-------|-------------------|
| TMD532GB56DK36VXR | 32 GB (2×16 GB) | DDR5-5600 | CL36 | Dark Maroon RGB | ~89,600 MB/s |
| TMD532GB60DK36VXR | 32 GB (2×16 GB) | DDR5-6000 | CL36 | Dark Maroon RGB | ~96,000 MB/s |
| TBD | 64 GB (2×32 GB) | DDR5-6000 | CL36 | Dark Maroon RGB | ~96,000 MB/s |

> The 64 GB (2×32 GB) kit part number is pending. Contact sales@twinmos.com for availability and lead time on this configuration. All DK kits are boxed as matched pairs and cannot be split for separate resale.

---

## Regulatory Compliance

The TwinMOS VOLTX RGB DDR5 U-DIMM family is tested and certified to the following standards:

- **RoHS 2015/863/EU** — Restriction of Hazardous Substances in Electrical and Electronic Equipment; LEDs comply with RoHS material restrictions
- **REACH SVHC** — EU REACH Regulation (EC) No 1907/2006, Substances of Very High Concern declaration
- **CE (2014/30/EU)** — European Conformity, Electromagnetic Compatibility Directive; includes LED driver circuit emissions evaluation
- **FCC Part 15 Class B** — Federal Communications Commission, Unintentional Radiator, Class B digital device
- **BSMI** — Bureau of Standards, Metrology and Inspection (Taiwan)
- **KC** — Korea Certification (KCC), electromagnetic compatibility
- **JEDEC JESD79-5** — DDR5 SDRAM standard compliance
- **ISO 9001** — Quality Management System (manufacturing facility)

Declaration of Conformity documents are available upon request. Contact compliance@twinmos.com.

---

## Quality and Manufacturing

TwinMOS Technologies manufactures the VOLTX RGB DDR5 U-DIMM under ISO 9001 certification (TÜV SÜD, first certified 2002). All modules undergo:

- **100% electrical test** at rated speed and XMP/EXPO voltage prior to shipment
- **RGB subsystem functional test**: LED illumination, data signal integrity, and all six lighting effects validated on each unit
- **Automated optical inspection (AOI)** of PCB assembly, DRAM placement, and RGB assembly
- **XMP/EXPO profile validation** on certified Intel and AMD test platforms
- **Matched-pair binning** for dual-channel DK kits, including timing correlation and RGB output matching
- **ESD-safe packaging** with anti-static bag, individual module tray, and retail box

---

## Warranty

The TwinMOS VOLTX RGB DDR5 U-DIMM is covered by a **Limited Lifetime Warranty** from the date of original retail purchase, subject to the following conditions:

- Warranty covers defects in materials and workmanship in both the memory and RGB subsystem components under normal operating conditions.
- Warranty is void if the module has been physically damaged, subjected to voltages beyond rated maximums, modified, or shows evidence of unauthorized disassembly.
- RGB lighting malfunction due to user-induced damage (e.g., header mis-connection, ESD, reversed polarity) is not covered.
- Warranty does not cover damage resulting from system incompatibility, improper installation, accident, or misuse.
- To initiate a warranty claim, contact support@twinmos.com with proof of purchase and product serial number.

Regional warranty terms may vary. Visit www.twinmos.com/warranty for full terms and conditions.

---

## Revision History

| Revision | Date | Author | Summary of Changes |
|----------|------|--------|-------------------|
| 1.0 | 2026-04-30 | TwinMOS Product Team | Initial public release — full SKU matrix, RGB specification, XMP/EXPO profiles, platform and ecosystem compatibility |

---

## Contact Information

**TwinMOS Technologies**
Headquarters: Dubai, UAE / Taipei, Taiwan
Founded: 1998

| Channel | Details |
|---------|---------|
| Website | www.twinmos.com |
| Technical Support | support@twinmos.com |
| Sales Inquiries | sales@twinmos.com |
| Product Page | www.twinmos.com/products/memory/voltx-rgb-ddr5-udimm |

---

*This datasheet is provided for informational purposes only. Specifications are subject to change without notice. TwinMOS Technologies reserves the right to modify products, specifications, SKUs, RGB effects, and packaging at any time without prior notification. All performance figures are based on internal testing under controlled conditions; actual system performance will vary depending on platform, BIOS configuration, system configuration, workload, and RGB software version. TwinMOS Technologies makes no warranty, express or implied, regarding the fitness of this product for any particular application. It is the responsibility of the buyer to independently evaluate and test the adequacy of any product for their intended application. ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light, and ASRock Polychrome SYNC are trademarks of their respective owners. Intel, Intel XMP, AMD, and EXPO are trademarks of Intel Corporation and Advanced Micro Devices, Inc. respectively. All other trademarks are the property of their respective owners.*
