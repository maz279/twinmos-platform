---
title: "DDR4 SO-DIMM Laptop Memory — Product Datasheet"
slug: "ddr4-sodimm"
url: "/products/datasheets/ddr4-sodimm/"
template: "datasheet"
description: "Official product datasheet for TwinMOS DDR4 SO-DIMM laptop and mobile memory modules. Covers 2666MHz and 3200MHz variants in 4GB, 8GB, and 16GB capacities for notebooks, ultrabooks, NUCs, and mini-PCs."
keywords:
  - DDR4 SO-DIMM
  - laptop RAM
  - DDR4 2666MHz
  - DDR4 3200MHz
  - PC4-21333
  - PC4-25600
  - notebook memory
  - TwinMOS SO-DIMM
  - 260-pin DDR4
  - mini-PC memory
  - NUC memory
  - ultrabook RAM
persona: "laptop user, IT administrator, notebook upgrader, system integrator, NUC builder"
status: published
last_reviewed: "2026-04-30"
product_line: "DDR4 SO-DIMM"
document_number: "TM-DS-D4SO-001"
revision: "1.4"
---

# Datasheet — TwinMOS DDR4 SO-DIMM Laptop Memory

---

## Document Information

| Field               | Detail                                         |
|---------------------|------------------------------------------------|
| Document Number     | TM-DS-D4SO-001                                 |
| Revision            | 1.4                                            |
| Release Date        | 2026-04-30                                     |
| Product Line        | DDR4 SO-DIMM                                   |
| Product Family      | DDR4 SO-DIMM Mobile / Laptop Memory           |
| Applicability       | 4 GB, 8 GB, 16 GB; 2666 MHz and 3200 MHz variants |
| Prepared By         | TwinMOS Technologies — Product Engineering     |
| Classification      | Public / Commercial Datasheet                  |

---

## Product Overview

The TwinMOS DDR4 SO-DIMM is a compact-form-factor memory module designed for installation in DDR4-compatible notebook computers, ultrabooks, compact all-in-one systems, Intel NUC platforms, and mini-PC systems utilizing the 260-pin SO-DIMM slot standard. Produced in compliance with JEDEC DDR4 SO-DIMM specifications (JESD79-4B, Annex M), the TwinMOS DDR4 SO-DIMM is available in two speed grades — 2666 MHz (PC4-21333) and 3200 MHz (PC4-25600) — and three density options: 4 GB, 8 GB, and 16 GB. All variants operate at the JEDEC-standard 1.2 V supply voltage, consuming 40% less power than the equivalent DDR3 1.5 V standard, which is a critical consideration for battery-operated portable devices. The low-profile SO-DIMM package (67.60 mm × 30.0 mm × 3.8 mm) fits the compact mechanical envelope of modern thin-and-light notebook designs and meets the standard SO-DIMM cutout geometry, ensuring insertion compatibility across all DDR4 laptop socket designs without modification. Each module is 100% ATE-tested at the rated clock speed and validated for compatibility with the major laptop OEM and Intel NUC platform memory subsystems, providing a reliable drop-in upgrade path for memory-bound mobile workloads including virtualization, video editing, and browser-intensive workflows.

---

## Specifications

### General Specifications

| Parameter                      | Value                                           |
|--------------------------------|-------------------------------------------------|
| Memory Type                    | DDR4 SDRAM                                      |
| Form Factor                    | SO-DIMM (Small Outline DIMM)                    |
| Pin Count                      | 260-pin                                         |
| ECC Support                    | Non-ECC                                         |
| Buffering                      | Unbuffered                                      |
| Available Capacities           | 4 GB, 8 GB, 16 GB                               |
| Available Speeds               | 2666 MHz (PC4-21333), 3200 MHz (PC4-25600)      |
| CAS Latency — 2666 MHz         | CL19-19-19-43                                   |
| CAS Latency — 3200 MHz         | CL22-22-22-52                                   |
| Module Organization — 4 GB     | 1 Rank × 8 × 4 Gb (1Rx16)                      |
| Module Organization — 8 GB     | 1 Rank × 8 × 8 Gb (1Rx8)                       |
| Module Organization — 16 GB    | 2 Rank × 8 × 8 Gb (2Rx8)                       |
| Data Bus Width                 | 64-bit                                           |
| Burst Length                   | BL8 (fixed), BC4 (on-the-fly)                  |
| Prefetch                       | 8n                                              |
| Banks                          | 16 (4 bank groups × 4 banks)                    |
| JEDEC Compliance               | JESD79-4B, Annex M (SO-DIMM)                    |
| XMP Support                    | Not applicable (mobile platform JEDEC only)     |
| SPD EEPROM                     | 256-byte JEDEC SPD, I2C interface               |
| Thermal Sensor                 | Not present                                      |

### Electrical Specifications

| Parameter                      | Min         | Nominal     | Max         |
|--------------------------------|-------------|-------------|-------------|
| Supply Voltage (VDD)           | 1.14 V      | 1.20 V      | 1.26 V      |
| I/O Supply Voltage (VDDQ)      | = VDD       | = VDD       | = VDD       |
| Reference Voltage (VREFCA)     | 0.49 V      | 0.50 VDD    | 0.51 V      |
| Input High Voltage (VIH)       | VREF + 0.1 V| —           | VDD         |
| Input Low Voltage (VIL)        | VSS         | —           | VREF − 0.1 V|
| Idle Current (IDD2N)           | —           | ≤ 15 mA     | 22 mA       |
| Active Current (IDD4R/W)       | —           | ≤ 250 mA    | 310 mA      |
| Self-Refresh Current (IDD6)    | —           | ≤ 5 mA      | 8 mA        |
| Data Transfer Rate — 2666      | —           | 2666 MT/s   | —           |
| Data Transfer Rate — 3200      | —           | 3200 MT/s   | —           |
| Effective Bandwidth — 2666     | —           | 21,333 MB/s | —           |
| Effective Bandwidth — 3200     | —           | 25,600 MB/s | —           |
| ESD Tolerance (HBM)            | ≥ 2000 V    | —           | —           |

### Environmental Specifications

| Parameter                      | Value                                           |
|--------------------------------|-------------------------------------------------|
| Operating Temperature          | 0°C to +85°C                                   |
| Storage Temperature            | −40°C to +95°C                                 |
| Operating Humidity             | 5% to 95% RH, non-condensing                   |
| Storage Humidity               | 5% to 95% RH, non-condensing                   |
| Shock (non-operating)          | 1000 G / 1 ms half-sine                        |
| Vibration                      | 50 Hz to 2000 Hz, 1.5 G RMS                    |
| Altitude (operating)           | 0 to 5000 m (suitable for high-altitude use)   |
| Altitude (non-operating)       | 0 to 12,000 m                                  |

---

## Key Features

- **Dual Speed Grade Availability:** Available in both DDR4-2666 (PC4-21333) and DDR4-3200 (PC4-25600), allowing system builders and end users to select the speed grade that best matches their platform's native supported DDR4 frequency — maximizing compatibility without requiring platform overrides.
- **Low-Power 1.2 V Operation:** All variants operate at the JEDEC DDR4 standard of 1.2 V, representing a 20% reduction in supply voltage and approximately 33% reduction in memory power consumption compared to DDR3-1600 at 1.5 V, directly contributing to improved notebook battery runtime.
- **Compact SO-DIMM Form Factor:** The 260-pin, 67.60 mm module length conforms to JEDEC standard SO-DIMM geometry, providing mechanical compatibility with all DDR4 notebook SO-DIMM sockets and insertion clearances without adapter or modification.
- **Wide Capacity Range:** 4 GB, 8 GB, and 16 GB configurations support a range of platform needs, from basic productivity upgrades in entry-level notebooks (4 GB dual-channel + onboard = 12 GB) through demanding workstation configurations (dual-slot 16 GB + 16 GB = 32 GB total).
- **Universal Platform Compatibility:** Validated across the major notebook and mobile computing DDR4 platform families, including Intel Core 8th through 13th Generation (DDR4 variants), AMD Ryzen Mobile (3000-series through 5000-series), and Intel NUC platforms with DDR4 SO-DIMM slots.
- **Enhanced Mobile Self-Refresh:** Supports DDR4 LPDDR-level power modes including self-refresh at ≤ 5 mA, which enables extended display-on low-activity states in portable systems and contributes to measured battery life improvement.
- **100% ATE Factory Testing:** Each module is individually tested using automated test equipment at rated clock speed (2666 MHz or 3200 MHz) with comprehensive data pattern coverage — checkerboard, marching 1s/0s, row hammer stress, and worst-case address — prior to packaging and shipment.
- **Non-ECC Standard Compliance:** Full JEDEC non-ECC compliance ensures that any DDR4 memory controller can correctly identify module parameters via SPD and initialize to safe operating conditions on first boot, without user intervention.

---

## Physical Dimensions

| Attribute                      | Value                                           |
|--------------------------------|-------------------------------------------------|
| Module Length                  | 67.60 mm                                        |
| Module Height                  | 30.0 mm                                         |
| Module Thickness               | 3.8 mm                                          |
| Module Weight (4 GB)           | ~7 g                                            |
| Module Weight (8 GB)           | ~8 g                                            |
| Module Weight (16 GB)          | ~10 g                                           |
| PCB Layers                     | 6-layer controlled-impedance PCB                |
| PCB Color                      | Dark green / black                              |
| Component Population           | Single-side (4 GB, 8 GB); Dual-side (16 GB)     |
| Connector Type                 | 260-pin SO-DIMM edge connector (DDR4 keyed)     |
| Connector Key Position         | 78.0 mm from left edge (DDR4 SO-DIMM key)      |
| Installation Angle             | Standard 45° insertion angle (JEDEC SO-DIMM)    |

---

## Pin Configuration / Connector Definitions

The TwinMOS DDR4 SO-DIMM employs the JEDEC standard 260-pin SO-DIMM edge connector as defined in JEDEC Standard No. 21C, Annex M. The 260-pin DDR4 SO-DIMM connector is physically distinct from 204-pin DDR3 SO-DIMM, preventing cross-generation installation. Key signal groups:

| Signal Group              | Pin Designation           | Function                                                    |
|---------------------------|---------------------------|-------------------------------------------------------------|
| VDD                       | Power pins (multiple)     | DRAM array core supply: 1.14 V – 1.26 V (nom. 1.2 V)      |
| VDDQ                      | I/O power (multiple)      | I/O interface supply; tracks VDD                           |
| VSS                       | Ground (multiple)         | Digital ground reference                                    |
| DQ[63:0]                  | Data bus                  | 64-bit bidirectional data                                   |
| DQS[7:0]+/DQS[7:0]−       | Differential strobes      | Per-byte-lane differential data strobes                    |
| DM/DBI[7:0]               | Data mask / bus inversion | Write mask and read bus inversion control                  |
| A[16:0]                   | Address bus               | Multiplexed row/column address (17-bit row, 10-bit column) |
| BA[1:0]                   | Bank address              | 4-bank select within bank group                            |
| BG[1:0]                   | Bank group                | 4-bank-group select                                         |
| CK+/CK−                   | Differential clock        | Source-synchronous system clock                            |
| CKE                       | Clock enable              | Clock enable and power-down control                        |
| CS#                       | Chip select               | DRAM command reception enable (active low)                 |
| ACT#                      | Activate                  | DDR4 activate command                                       |
| RAS#/CAS#/WE#             | Command encoding          | Legacy DDR4 CA bus command encoding                        |
| ODT                       | On-die termination        | Dynamic termination control                                |
| RESET#                    | Module reset              | Asynchronous reset (active low)                            |
| SA[2:0] / SCL / SDA       | SPD interface             | I2C address select and serial bus for SPD EEPROM          |
| TEN                       | Test enable               | Connectivity test mode (factory use)                       |
| VPP                       | Activation power (DDR4)   | 2.5 V activation power (optional; tied to VDD on SO-DIMM) |

> Full signal definitions per JEDEC Standard No. 21C, Annex M (DDR4 SO-DIMM). Electrical characteristics per JESD79-4B.

---

## Ordering Information

| Part Number              | Capacity | Speed     | Timings        | Voltage | Form Factor |
|--------------------------|----------|-----------|----------------|---------|-------------|
| TMD4S04G2666C19-SO       | 4 GB     | 2666 MHz  | CL19-19-19-43  | 1.2 V   | SO-DIMM     |
| TMD4S08G2666C19-SO       | 8 GB     | 2666 MHz  | CL19-19-19-43  | 1.2 V   | SO-DIMM     |
| TMD4S16G2666C19-SO       | 16 GB    | 2666 MHz  | CL19-19-19-43  | 1.2 V   | SO-DIMM     |
| TMD4S04G3200C22-SO       | 4 GB     | 3200 MHz  | CL22-22-22-52  | 1.2 V   | SO-DIMM     |
| TMD4S08G3200C22-SO       | 8 GB     | 3200 MHz  | CL22-22-22-52  | 1.2 V   | SO-DIMM     |
| TMD4S16G3200C22-SO       | 16 GB    | 3200 MHz  | CL22-22-22-52  | 1.2 V   | SO-DIMM     |
| TMD4S08G2666C19K-SO      | 2×8 GB   | 2666 MHz  | CL19-19-19-43  | 1.2 V   | SO-DIMM Kit |
| TMD4S16G3200C22K-SO      | 2×16 GB  | 3200 MHz  | CL22-22-22-52  | 1.2 V   | SO-DIMM Kit |

> Part number structure: TMD4S = TwinMOS DDR4 SO-DIMM; next field = capacity; speed grade; CAS latency prefix; "-SO" product line identifier; "K" suffix = matched dual-channel kit. Kit configurations intended for 2-slot platforms (NUC, workstation laptops, desktop replacement notebooks).

---

## Performance Notes

### Bandwidth by Speed Grade

| Speed Grade    | Transfer Rate | Bus Width | Theoretical Peak Bandwidth | Dual-Channel |
|----------------|---------------|-----------|---------------------------|--------------|
| DDR4-2666      | 2666 MT/s     | 64-bit    | 21,333 MB/s               | ~42,666 MB/s |
| DDR4-3200      | 3200 MT/s     | 64-bit    | 25,600 MB/s               | ~51,200 MB/s |

### Latency Reference

| Parameter                   | DDR4-2666 / CL19         | DDR4-3200 / CL22          |
|-----------------------------|--------------------------|---------------------------|
| CAS Latency (cycles)        | 19                       | 22                        |
| True Latency (ns)           | 19 / 1333 = 14.25 ns     | 22 / 1600 = 13.75 ns      |
| tRCD (cycles / ns)          | 19 / 14.25 ns            | 22 / 13.75 ns             |
| tRP (cycles / ns)           | 19 / 14.25 ns            | 22 / 13.75 ns             |
| tRAS (cycles / ns)          | 43 / 32.25 ns            | 52 / 32.5 ns              |
| Self-Refresh Rate           | ≤ 5 mA                   | ≤ 5 mA                    |

> DDR4-3200 provides both higher bandwidth and marginally lower absolute latency (ns) compared to DDR4-2666 at equivalent CAS multiplier, making it the preferred specification for platforms that natively support 3200 MHz. Select DDR4-2666 for platforms where 3200 MHz is not on the official supported frequency list.

---

## Platform Compatibility

| Platform                             | Supported Speeds       | Notes                                              |
|--------------------------------------|------------------------|----------------------------------------------------|
| Intel Core 12th Gen (DDR4 models)    | Up to 3200 MHz         | DDR4 SO-DIMM variant only; Alder Lake-P/U DDR4     |
| Intel Core 11th Gen (Tiger Lake)     | Up to 3200 MHz         | Native DDR4-3200 support                           |
| Intel Core 10th Gen (Ice Lake / CML-U)| Up to 3200 MHz        | Ice Lake supports DDR4-3200 natively               |
| Intel Core 8th/9th Gen (Whiskey Lake / CML)| Up to 2666 MHz  | Max 2666 MHz on most; some boards support 3200     |
| Intel NUC 10 / NUC 11 / NUC 12 (DDR4)| Up to 3200 MHz       | Confirm NUC model supports DDR4 SO-DIMM            |
| AMD Ryzen 5000 Mobile (Cezanne)      | Up to 3200 MHz         | Native DDR4-3200 IMC support                       |
| AMD Ryzen 4000 Mobile (Renoir)       | Up to 3200 MHz         | Native DDR4-3200 IMC support                       |
| AMD Ryzen 3000 Mobile (Picasso)      | Up to 2666 MHz         | Max 2666 MHz officially; 3200 BIOS-dependent       |
| Intel Core i-series (6th/7th Gen)    | Up to 2400 MHz         | Skylake/Kaby Lake DDR4; max 2400 officially        |

> Platform maximum supported DDR4 SO-DIMM frequency is determined by the CPU's integrated memory controller (IMC) and system firmware. TwinMOS recommends installing the speed grade that matches or is at or below the platform's officially supported maximum to ensure stable, validated operation. Installing a 3200 MHz module in a 2666 MHz platform results in automatic downclocking to the platform's supported speed.

---

## Regulatory Compliance

| Certification / Standard      | Status       | Scope                                              |
|-------------------------------|--------------|-----------------------------------------------------|
| JEDEC JESD79-4B, Annex M      | Compliant    | DDR4 SO-DIMM electrical, timing, mechanical standard|
| JEDEC JEP106                  | Compliant    | Manufacturer ID encoding                           |
| JEDEC SPD (JESD21C Annex M)   | Compliant    | SO-DIMM Serial Presence Detect encoding            |
| CE Marking (EU)               | Certified    | EMC Directive 2014/30/EU                           |
| UKCA Marking                  | Certified    | UK Conformity Assessed                             |
| FCC Part 15 Class B           | Certified    | US electromagnetic emission standard               |
| RoHS 2011/65/EU               | Compliant    | Hazardous substance restrictions                   |
| REACH (EC) 1907/2006          | Compliant    | SVHC chemical substance compliance                 |
| EAC TR CU 020/2011            | Certified    | Eurasian Conformity — electromagnetic              |
| ISO 9001                 | Certified    | TwinMOS manufacturing quality management           |
| WEEE 2012/19/EU               | Compliant    | End-of-life disposal and collection                |

---

## Warranty

TwinMOS Technologies provides a **Limited Lifetime Warranty** on DDR4 SO-DIMM modules against defects in materials and workmanship under normal use conditions as defined in this datasheet. Coverage is provided to the original purchaser through authorized TwinMOS retail and distribution channels, with valid proof of purchase. The warranty does not cover: damage caused by incorrect SO-DIMM insertion into DDR3 or LPDDR4x slots; damage from exceeding the supply voltage maximum; module failures caused by platform memory controller faults; physical damage from mechanical impact; or failures resulting from unauthorized modifications.

Contact **support@twinmos.com** to initiate warranty service, providing the part number, purchase date, vendor, and a description of the observed failure. TwinMOS will issue an RMA number for defective module return and ship replacement units within standard processing timelines.

---

## Revision History

| Revision | Date       | Author                        | Changes                                                       |
|----------|------------|-------------------------------|---------------------------------------------------------------|
| 1.0      | 2022-11-01 | TwinMOS Product Engineering   | Initial release                                               |
| 1.1      | 2023-08-15 | TwinMOS Product Engineering   | Added Intel NUC 12 compatibility; expanded ordering table    |
| 1.2      | 2024-06-20 | TwinMOS Product Engineering   | Added AMD Ryzen 5000 Mobile platform row; self-refresh current spec added |
| 1.3      | 2025-03-10 | TwinMOS Product Engineering   | Added Intel 12th Gen DDR4 SO-DIMM note; VPP pin definition   |
| 1.4      | 2026-04-30 | TwinMOS Product Engineering   | UKCA certification added; altitude spec updated for high-altitude use |

---

## Contact Information

| Department              | Contact                         |
|-------------------------|---------------------------------|
| Technical Support       | support@twinmos.com             |
| Sales Enquiries         | sales@twinmos.com               |
| Website                 | www.twinmos.com                 |
| Headquarters (UAE)      | Dubai Airport Free Zone (DAFZA), Dubai, UAE |
| Regional Office (Asia)  | Taipei, Taiwan                  |

---

## Disclaimer

The information in this datasheet is provided by TwinMOS Technologies for reference only. Specifications reflect engineering design targets based on characterization data from representative production lots and are subject to change without notice. Actual performance is dependent on platform memory controller capability, BIOS revision, thermal environment, and notebook chassis design. Platform compatibility information is provided as guidance and does not constitute a guarantee of operation in all listed system configurations. TwinMOS Technologies shall not be liable for any damages, direct or indirect, arising from use of or reliance on information contained in this document. All third-party trademarks, CPU codenames, and platform designations are the property of their respective owners. Reproduction in whole or part requires prior written authorization from TwinMOS Technologies.

**TwinMOS Technologies — Committed to Quality Since 1998**
*ISO 9001 Certified | CE | UKCA | FCC | RoHS | REACH | EAC | JEDEC*
