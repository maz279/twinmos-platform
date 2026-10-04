---
title: "Datasheet — VOLTX DDR5 U-DIMM | TwinMOS"
slug: "datasheet-voltx-ddr5-udimm"
url: "/products/datasheets/voltx-ddr5-udimm"
template: "datasheet-pdf"
description: "Official TwinMOS VOLTX DDR5 U-DIMM datasheet. Speeds 4800–6000MHz, 8–32GB, XMP 3.0 & EXPO, on-die ECC, 288-pin for Intel & AMD AM5 platforms."
keywords: ["TwinMOS VOLTX DDR5", "DDR5 U-DIMM datasheet", "DDR5 6000MHz", "XMP 3.0", "AMD EXPO", "288-pin DDR5", "TwinMOS datasheet", "DDR5 desktop memory", "PC5-48000", "on-die ECC DDR5"]
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
    url: "/downloads/datasheets/voltx-ddr5-udimm.pdf"
  - text: "View Product Page"
    url: "/products/memory/voltx-ddr5-udimm"
  - text: "Contact Sales"
    url: "/contact"
cross_links:
  - "/products/datasheets"
  - "/products/memory"
  - "/support"
sources: ["CP", "TwinMOS Official Specifications 2026"]
---

# Datasheet — VOLTX DDR5 U-DIMM

## Document Information

| Field | Value |
|-------|-------|
| Product Name | TwinMOS VOLTX DDR5 U-DIMM |
| Product Family | VOLTX DDR5 Desktop Memory |
| Document Number | TM-DS-DDR5U-001 |
| Revision | 1.0 |
| Date | 2026-04-30 |
| Status | Published |
| Classification | Public |

---

## Product Overview

The TwinMOS VOLTX DDR5 U-DIMM is a high-performance desktop memory module engineered to meet the demands of enthusiast PC builders, system integrators, and enterprise workstation deployments. Built on the DDR5 SDRAM standard, the VOLTX series delivers substantial bandwidth improvements over previous-generation DDR4, with transfer speeds ranging from 4800 MT/s (PC5-38400) up to 6000 MT/s (PC5-48000) in overclocked XMP 3.0 and EXPO configurations.

Each module integrates an on-die ECC (Error Correction Code) engine, which proactively detects and corrects single-bit memory errors at the DRAM die level without operating system overhead — a foundational reliability feature for DDR5 that benefits both consumer and professional applications. An on-module Power Management IC (PMIC) regulates power delivery locally on the module, reducing motherboard power rail noise and enabling tighter voltage control for stable overclocking headroom.

The VOLTX DDR5 U-DIMM is available in two physical variants: a slim low-profile configuration (Without Heatsink, WO) for JEDEC-speed and 5200 MHz builds where case clearance is a priority, and a heatsink-equipped variant fitted with either a black or Dark Maroon anodized aluminum spreader for enhanced thermal dissipation at 5600 and 6000 MHz. Both variants use a 288-pin U-DIMM interface and are validated for compatibility with Intel 12th, 13th, and 14th Generation LGA 1700 platforms as well as AMD Ryzen 7000 and 9000 series AM5 platforms.

TwinMOS certifies the VOLTX DDR5 U-DIMM to ISO 9001 quality management standards and the modules comply with CE, FCC, RoHS, REACH, BSMI, and KC regulatory requirements.

---

## Specifications

### General Specifications

| Parameter | Value |
|-----------|-------|
| Memory Type | DDR5 SDRAM |
| Form Factor | U-DIMM (Unbuffered DIMM) |
| Pin Count | 288-pin |
| Channels per DIMM | 2× 32-bit subchannels (64-bit effective) |
| Speeds Supported | 4800 MHz / 5200 MHz / 5600 MHz / 6000 MHz |
| PC Speed Ratings | PC5-38400 / PC5-41600 / PC5-44800 / PC5-48000 |
| Capacities Available | 8 GB, 16 GB, 32 GB (single module); 32 GB kit (2×16 GB) |
| ECC | On-die ECC (integrated per JEDEC DDR5 specification) |
| Power Management | On-module PMIC (Power Management IC) |
| Heatsink Options | Without Heatsink (WO); Black aluminum; Dark Maroon aluminum |
| Standard Compliance | JEDEC JESD79-5 DDR5 |
| Overclocking Support | Intel XMP 3.0 (up to 5 profiles); AMD EXPO |

### Electrical Specifications

| Parameter | Value |
|-----------|-------|
| Operating Voltage (JEDEC) | 1.1 V (VDD / VDDQ) |
| Operating Voltage (XMP 3.0 / EXPO) | 1.35 V |
| VDDQ | Equal to VDD |
| VPP (Activation Power Supply) | 1.8 V |
| Input Logic High (VIH) | ≥ 0.65 × VDD |
| Input Logic Low (VIL) | ≤ 0.35 × VDD |
| Power State Support | Active, Self-Refresh, Power-Down |
| Termination | On-die termination (ODT) |

### CAS Latency by Speed Grade

| Speed Grade | Data Rate | CAS Latency | tRCD | tRP | tRAS | Cycle Time |
|-------------|-----------|-------------|------|-----|------|------------|
| DDR5-4800 | 4800 MT/s | CL40 | 40 | 40 | 77 | 0.417 ns |
| DDR5-5200 | 5200 MT/s | CL42 | 42 | 42 | 84 | 0.385 ns |
| DDR5-5600 (HS) | 5600 MT/s | CL36 or CL46 | 36/46 | 36/46 | 68/86 | 0.357 ns |
| DDR5-6000 (HS) | 6000 MT/s | CL36 | 46 | 46 | 86 | 0.333 ns |

### Environmental Specifications

| Parameter | Value |
|-----------|-------|
| Operating Temperature | 0°C to 85°C |
| Storage Temperature | -40°C to 95°C |
| Operating Humidity | 5% to 95% relative humidity, non-condensing |
| Storage Humidity | 5% to 95% relative humidity, non-condensing |
| Shock Resistance | 1000 G / 1 ms half-sine |
| Vibration Resistance | 50 Hz to 2000 Hz, 1.5 G |
| Altitude (Operating) | Up to 3000 m |

---

## Key Features

1. **Intel XMP 3.0 with Up to 5 Stored Profiles**: The VOLTX DDR5 U-DIMM supports Intel Extreme Memory Profile (XMP) version 3.0, the industry standard for plug-and-play memory overclocking on Intel platforms. Up to five independent timing and voltage profiles can be stored on the module's SPD EEPROM, enabling users to select optimized configurations for performance, stability, or power efficiency directly from BIOS — without manual timing adjustments.

2. **AMD EXPO (Extended Profiles for Overclocking) Compatible**: Full AMD EXPO support ensures native one-click overclocking on AMD Ryzen 7000 and 9000 series AM5 platforms. EXPO profiles are validated at the same speed and timing points as XMP 3.0 profiles, providing equivalent overclocked performance across both major platform ecosystems from a single module SKU.

3. **On-Die ECC for Enhanced Reliability**: Per the JEDEC DDR5 specification, every VOLTX module incorporates on-die error correction code (ECC) logic within the DRAM die itself. This transparently corrects single-bit errors at the memory cell level before data reaches the memory controller, reducing transient faults caused by charge leakage in high-density die configurations. This feature operates independently of any system-level ECC and adds no latency overhead.

4. **Integrated PMIC for Stable Voltage Regulation**: An on-module Power Management IC handles all voltage conversion and regulation directly on the DIMM, a significant architectural change from DDR4 where voltage regulation was performed on the motherboard. The PMIC provides precise, low-noise power delivery to the DRAM components, improving signal integrity at high frequencies and enabling reliable operation at both JEDEC and overclocked voltages.

5. **Dual 32-Bit Subchannels Architecture**: DDR5 replaces the single 64-bit channel of DDR4 with two independent 32-bit subchannels per DIMM. This architecture doubles the available memory command bandwidth, as each subchannel can issue its own independent commands simultaneously. The result is substantially reduced memory latency under multi-threaded workloads and improved average bandwidth utilization for applications such as video editing, 3D rendering, and scientific computing.

6. **Aluminum Heatspreader Thermal Management (HS Variants)**: Modules operating at 5600 and 6000 MHz are equipped with precision-machined anodized aluminum heatspreaders in either Black or Dark Maroon finish. The spreader provides direct thermal contact across all DRAM packages, conducting heat away from the dies and dissipating it into the airflow path of the case. This thermal solution ensures modules remain within safe operating temperature ranges even under sustained maximum-bandwidth workloads in full tower and mid-tower chassis configurations.

7. **Dual-Channel Kit Validation**: Paired 2×16 GB dual-channel kits (DK suffix SKUs) are factory-tested and validated as matched pairs, ensuring both modules meet identical timing binning and signal integrity parameters. Using matched kits versus pairing individually-purchased modules reduces the risk of training failures during boot and maximizes the probability of achieving the rated XMP/EXPO speeds on first activation.

8. **Wide Platform Compatibility and JEDEC Baseline**: All VOLTX DDR5 modules initialize at the JEDEC default speed of 4800 MT/s at 1.1 V, ensuring out-of-the-box compatibility with any DDR5-capable platform regardless of whether the system BIOS supports XMP or EXPO. Faster speeds and lower-latency profiles are activated through XMP/EXPO profile selection and are supported across Intel 12th, 13th, and 14th Generation LGA 1700 and AMD Ryzen 7000/9000 AM5 platforms.

---

## Physical Dimensions

### Without Heatsink (WO) Variant

| Dimension | Value |
|-----------|-------|
| Length | 133.35 mm |
| Width (PCB Height) | 31.25 mm |
| Thickness | 3.72 mm |
| Weight (approx.) | ~12 g |
| PCB Color | Black |
| Connector | 288-pin DDR5 edge connector |

### With Heatsink (HS) Variant

| Dimension | Value |
|-----------|-------|
| Length | 133.35 mm |
| Width (with heatspreader) | 43.0 mm |
| Thickness (with heatspreader) | 8.0 mm |
| Weight (approx.) | ~45 g |
| Heatspreader Material | Anodized aluminum |
| Heatspreader Colors | Black; Dark Maroon |
| Connector | 288-pin DDR5 edge connector |

> **Note:** Heatspreader dimensions may affect compatibility with low-clearance CPU coolers. Verify cooler clearance specifications before installation. Standard tower coolers with ≥43 mm DIMM slot clearance are compatible.

---

## Pin Configuration

The VOLTX DDR5 U-DIMM uses the JEDEC-standard 288-pin DDR5 U-DIMM pinout as defined in JEDEC Standard JESD79-5. Key signal groups are summarized below.

| Signal Group | Description |
|--------------|-------------|
| DQ[63:0] | 64-bit data bus (2× 32-bit subchannels) |
| DQS[7:0], DQS#[7:0] | Data strobe differential pairs (8 per module) |
| CB[7:0] | Check bits (on-die ECC, not externally routable) |
| A[17:0] | Row/Column address bus |
| BA[1:0] | Bank address |
| BG[2:0] | Bank group address |
| CKE[1:0] | Clock enable (one per subchannel) |
| CS#[1:0] | Chip select (one per subchannel) |
| ACT# | Activate command signal |
| CK_t / CK_c | Differential clock (one pair per subchannel) |
| CA[13:0] | Command/Address bus per subchannel |
| RESET# | Module reset signal |
| ALERT# | On-die ECC error alert |
| SCL / SDA | SPD I2C bus (XMP profile storage) |
| VDD | 1.1 V / 1.35 V main power supply |
| VDDQ | 1.1 V / 1.35 V I/O power supply |
| VPP | 1.8 V DRAM activation power |
| VSS | Ground reference |
| VDDSPD | 1.8 V SPD supply |

Full pin assignments conform to JEDEC JESD79-5 Annex A. Refer to the JEDEC specification for complete pin-by-pin assignments.

---

## XMP 3.0 and EXPO Profiles

The following profiles are pre-programmed in the module SPD EEPROM. Profiles are activated via BIOS settings on compatible platforms.

| Profile | Transfer Rate | CL | tRCD | tRP | tRAS | Voltage | Target Platform |
|---------|--------------|-----|------|-----|------|---------|----------------|
| XMP 3.0 — Profile 1 | 6000 MT/s | 36 | 46 | 46 | 86 | 1.35 V | Intel (LGA 1700) |
| XMP 3.0 — Profile 2 | 5600 MT/s | 36 | 36 | 36 | 68 | 1.35 V | Intel (LGA 1700) |
| EXPO — Profile 1 | 6000 MT/s | 36 | 46 | 46 | 86 | 1.35 V | AMD (AM5) |
| EXPO — Profile 2 | 5600 MT/s | 36 | 36 | 36 | 68 | 1.35 V | AMD (AM5) |
| JEDEC Default | 4800 MT/s | 40 | 40 | 40 | 77 | 1.1 V | Universal |

> **Note:** XMP 3.0 and EXPO profiles require a compatible motherboard and BIOS with XMP/EXPO support enabled. Enabling overclocked profiles increases operating voltage to 1.35 V. TwinMOS recommends ensuring adequate chassis airflow when operating at XMP/EXPO speeds.

---

## Compatible Platforms

| Platform Generation | Socket | Chipsets | XMP Support | EXPO Support |
|--------------------|--------|----------|-------------|--------------|
| Intel 12th Gen (Alder Lake) | LGA 1700 | Z690, B660, H670 | XMP 3.0 | — |
| Intel 13th Gen (Raptor Lake) | LGA 1700 | Z790, B760, H770 | XMP 3.0 | — |
| Intel 14th Gen (Raptor Lake Refresh) | LGA 1700 | Z790, B760 | XMP 3.0 | — |
| AMD Ryzen 7000 Series | AM5 | X670E, X670, B650E, B650 | — | EXPO |
| AMD Ryzen 9000 Series | AM5 | X870E, X870, B850 | — | EXPO |

> **Note:** DDR5 U-DIMM is not compatible with LGA 1200, LGA 1151, AM4, or any DDR4 platform. DDR5 and DDR4 slots are physically distinct and not cross-compatible.

---

## Performance Reference Data

| SKU | Capacity | Speed | Bandwidth (Theoretical) | Latency Profile |
|-----|----------|-------|------------------------|-----------------|
| TMD58GB4800U40 | 8 GB | 4800 MHz | 38,400 MB/s | CL40-40-40-77 |
| TMD516GB4800U40 | 16 GB | 4800 MHz | 38,400 MB/s | CL40-40-40-77 |
| TMD532GB4800U40 | 32 GB | 4800 MHz | 38,400 MB/s | CL40-40-40-77 |
| TMD58GB5200U42 | 8 GB | 5200 MHz | 41,600 MB/s | CL42-42-42-84 |
| TMD516GB5200U42 | 16 GB | 5200 MHz | 41,600 MB/s | CL42-42-42-84 |
| TMD532GB5200U42 | 32 GB | 5200 MHz | 41,600 MB/s | CL42-42-42-84 |
| TMD516GB5600U36 | 16 GB | 5600 MHz | 44,800 MB/s | CL36-36-36-68 |
| TMD516GB5600U46 | 16 GB | 5600 MHz | 44,800 MB/s | CL46-46-46-86 |
| TMD532GB5600U36 | 32 GB | 5600 MHz | 44,800 MB/s | CL36-36-36-68 |
| TMD532GB5600U46 | 32 GB | 5600 MHz | 44,800 MB/s | CL46-46-46-86 |
| TMD516GB6000U36 | 16 GB | 6000 MHz | 48,000 MB/s | CL36-46-46-86 |
| TMD532GB6000U36 | 32 GB | 6000 MHz | 48,000 MB/s | CL36-46-46-86 |
| TMD532GB56DK36VX | 32 GB kit (2×16 GB) | 5600 MHz | ~89,600 MB/s (dual-ch) | CL36-36-36-68 |
| TMD532GB60DK36VX | 32 GB kit (2×16 GB) | 6000 MHz | ~96,000 MB/s (dual-ch) | CL36-46-46-86 |

> Bandwidth figures are theoretical maximums based on data rate × bus width. Actual system bandwidth depends on memory controller, platform, and workload characteristics.

---

## Ordering Information

### Without Heatsink (WO) — JEDEC and Entry Overclocked

| Part Number | Capacity | Speed | CAS | Bandwidth | EAN |
|-------------|----------|-------|-----|-----------|-----|
| TMD58GB4800U40 | 8 GB | DDR5-4800 | CL40 | 38,400 MB/s | — |
| TMD516GB4800U40 | 16 GB | DDR5-4800 | CL40 | 38,400 MB/s | 6291104607569 |
| TMD532GB4800U40 | 32 GB | DDR5-4800 | CL40 | 38,400 MB/s | 6291104607675 |
| TMD58GB5200U42 | 8 GB | DDR5-5200 | CL42 | 41,600 MB/s | — |
| TMD516GB5200U42 | 16 GB | DDR5-5200 | CL42 | 41,600 MB/s | 6291104607682 |
| TMD532GB5200U42 | 32 GB | DDR5-5200 | CL42 | 41,600 MB/s | — |

### With Heatsink (HS) — High-Performance Overclocked

| Part Number | Capacity | Speed | CAS | Heatspreader | Bandwidth | EAN |
|-------------|----------|-------|-----|--------------|-----------|-----|
| TMD516GB5600U36 | 16 GB | DDR5-5600 | CL36 | Dark Maroon | 44,800 MB/s | 6291104607637 |
| TMD516GB5600U46 | 16 GB | DDR5-5600 | CL46 | Black | 44,800 MB/s | — |
| TMD532GB5600U36 | 32 GB | DDR5-5600 | CL36 | Dark Maroon | 44,800 MB/s | — |
| TMD532GB5600U46 | 32 GB | DDR5-5600 | CL46 | Black | 44,800 MB/s | — |
| TMD516GB6000U36 | 16 GB | DDR5-6000 | CL36 | Dark Maroon | 48,000 MB/s | — |
| TMD532GB6000U36 | 32 GB | DDR5-6000 | CL36 | Dark Maroon | 48,000 MB/s | — |

### Dual-Channel Kits (DK) — Factory-Matched Pairs

| Part Number | Kit Capacity | Speed | CAS | Heatspreader | Dual-Ch Bandwidth |
|-------------|-------------|-------|-----|--------------|-------------------|
| TMD532GB56DK36VX | 32 GB (2×16 GB) | DDR5-5600 | CL36 | With HS | ~89,600 MB/s |
| TMD532GB60DK36VX | 32 GB (2×16 GB) | DDR5-6000 | CL36 | With HS | ~96,000 MB/s |

> For the full current product catalog including regional availability and distributor pricing, contact sales@twinmos.com or visit www.twinmos.com.

---

## Regulatory Compliance

The TwinMOS VOLTX DDR5 U-DIMM family is tested and certified to the following standards:

- **RoHS 2015/863/EU** — Restriction of Hazardous Substances in Electrical and Electronic Equipment
- **REACH SVHC** — EU REACH Regulation (EC) No 1907/2006, Substances of Very High Concern declaration
- **CE (2014/30/EU)** — European Conformity, Electromagnetic Compatibility Directive
- **FCC Part 15 Class B** — Federal Communications Commission, Unintentional Radiator, Class B digital device
- **BSMI** — Bureau of Standards, Metrology and Inspection (Taiwan)
- **KC** — Korea Certification (KCC), electromagnetic compatibility
- **JEDEC JESD79-5** — DDR5 SDRAM standard compliance
- **ISO 9001** — Quality Management System (manufacturing facility)

Declaration of Conformity documents are available upon request. Contact compliance@twinmos.com.

---

## Quality and Manufacturing

TwinMOS Technologies operates its memory manufacturing under ISO 9001 certification (TÜV SÜD, first certified 2002). All VOLTX DDR5 modules undergo:

- **100% electrical test** at rated speed and voltage prior to shipment
- **Automated optical inspection (AOI)** of PCB and component placement
- **XMP/EXPO profile validation** on certified test platforms
- **Burn-in screening** for long-term reliability assurance
- **ESD-safe packaging** with anti-static bag and protective tray

---

## Warranty

The TwinMOS VOLTX DDR5 U-DIMM is covered by a **Limited Lifetime Warranty** from the date of original retail purchase, subject to the following conditions:

- Warranty covers defects in materials and workmanship under normal operating conditions.
- Warranty is void if the module has been physically damaged, subjected to voltages beyond the rated maximum, modified, or shows evidence of unauthorized disassembly.
- Warranty does not cover damage resulting from system incompatibility, improper installation, accident, or misuse.
- To initiate a warranty claim, contact support@twinmos.com with proof of purchase and product serial number.

Regional warranty terms may vary. Refer to the warranty card included in the product packaging or visit www.twinmos.com/warranty for full terms and conditions.

---

## Revision History

| Revision | Date | Author | Summary of Changes |
|----------|------|--------|-------------------|
| 1.0 | 2026-04-30 | TwinMOS Product Team | Initial public release — full SKU matrix, XMP/EXPO profiles, platform compatibility |

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
| Product Page | www.twinmos.com/products/memory/voltx-ddr5-udimm |

---

*This datasheet is provided for informational purposes only. Specifications are subject to change without notice. TwinMOS Technologies reserves the right to modify products, specifications, SKUs, and packaging at any time without prior notification. All performance figures are based on internal testing under controlled conditions; actual system performance will vary depending on platform, BIOS configuration, system configuration, and workload. TwinMOS Technologies makes no warranty, express or implied, regarding the fitness of this product for any particular application. It is the responsibility of the buyer to independently evaluate and test the adequacy of any product for their intended application. Intel, Intel XMP, and related marks are trademarks of Intel Corporation. AMD, EXPO, and related marks are trademarks of Advanced Micro Devices, Inc. All other trademarks are the property of their respective owners.*
