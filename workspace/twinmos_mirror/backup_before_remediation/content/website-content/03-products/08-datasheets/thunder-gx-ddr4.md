---
title: "Thunder GX DDR4 U-DIMM — Product Datasheet"
slug: "thunder-gx-ddr4"
url: "/products/datasheets/thunder-gx-ddr4/"
template: "datasheet"
description: "Official product datasheet for TwinMOS Thunder GX DDR4 U-DIMM 3200MHz gaming memory with low-profile heatspreader and XMP 2.0 support. Includes full specifications, compatibility, and ordering data."
keywords:
  - Thunder GX
  - DDR4 gaming memory
  - DDR4 3200MHz
  - PC4-25600
  - XMP 2.0
  - low-profile heatspreader
  - TwinMOS gaming RAM
  - desktop DDR4
  - CL22
persona: "gamer, system builder, small-form-factor builder, PC enthusiast"
status: published
last_reviewed: "2026-04-30"
product_line: "Thunder GX"
document_number: "TM-DS-TGX-DDR4-001"
revision: "1.2"
---

# Datasheet — TwinMOS Thunder GX DDR4 U-DIMM

---

## Document Information

| Field               | Detail                                       |
|---------------------|----------------------------------------------|
| Document Number     | TM-DS-TGX-DDR4-001                           |
| Revision            | 1.2                                          |
| Release Date        | 2026-04-30                                   |
| Product Line        | Thunder GX                                   |
| Product Family      | DDR4 U-DIMM Gaming Desktop Memory            |
| Applicability       | 8 GB and 16 GB single-module variants        |
| Prepared By         | TwinMOS Technologies — Product Engineering   |
| Classification      | Public / Commercial Datasheet                |

---

## Product Overview

The TwinMOS Thunder GX DDR4 U-DIMM is a gaming-validated desktop memory solution combining the bandwidth efficiency of the DDR4-3200 (PC4-25600) standard with a low-profile aluminum heatspreader designed for thermal management without compromising clearance in compact mid-tower and small-form-factor chassis. The Thunder GX is engineered for enthusiast gaming workloads — extended session gaming, streaming, and concurrent background application loads — and is validated through TwinMOS's proprietary extended gaming qualification protocol, which subjects modules to continuous read/write cycling under real-world game engine memory access patterns for a minimum of 72 hours at rated operating temperature. The module ships with Intel XMP 2.0 profile data programmed into its SPD EEPROM, enabling automatic 3200 MHz / CL22-22-22-52 operation on compatible Intel platforms via BIOS toggle. JEDEC default operation at 1.2 V ensures out-of-box compatibility with any DDR4 motherboard, while the optional 1.35 V XMP mode is available on platforms supporting extended voltage control. Available in 8 GB and 16 GB capacities, Thunder GX modules are individually characterized and matched in kit form for guaranteed dual-channel stability under extended gaming sessions.

---

## Specifications

### General Specifications

| Parameter                     | Value                                        |
|-------------------------------|----------------------------------------------|
| Memory Type                   | DDR4 SDRAM                                   |
| Form Factor                   | U-DIMM (Unbuffered DIMM)                     |
| Pin Count                     | 288-pin                                      |
| ECC Support                   | Non-ECC                                      |
| Buffering                     | Unbuffered                                   |
| Rated Speed (XMP)             | 3200 MHz (PC4-25600)                         |
| Rated Speed (JEDEC)           | 2133 MHz (auto-detect)                       |
| JEDEC Supported Speeds        | 2133 / 2400 / 2666 / 3200 MHz               |
| CAS Latency (JEDEC / 3200)    | CL22-22-22-52 at 1.2 V                      |
| CAS Latency (XMP variant)     | May vary; see ordering table per SKU         |
| Available Capacities          | 8 GB, 16 GB                                  |
| Module Organization (8 GB)    | 1 Rank × 8 × 8 Gb (1Rx8)                    |
| Module Organization (16 GB)   | 2 Rank × 8 × 8 Gb (2Rx8)                    |
| Burst Length                  | BL8 (fixed), BC4 (on-the-fly)               |
| Prefetch                      | 8n                                           |
| Banks                         | 16 (4 bank groups × 4 banks)                 |
| XMP Version                   | Intel XMP 2.0                                |
| Gaming Validation             | Extended 72-hour gaming session certified    |
| Heatspreader                  | Low-profile aluminum alloy                   |

### Electrical Specifications

| Parameter                     | Min        | Nominal    | Max        |
|-------------------------------|------------|------------|------------|
| Supply Voltage (VDD) — JEDEC  | 1.14 V     | 1.20 V     | 1.26 V     |
| Supply Voltage (VDD) — XMP    | 1.28 V     | 1.35 V     | 1.40 V     |
| I/O Supply Voltage (VDDQ)     | = VDD      | = VDD      | = VDD      |
| Reference Voltage (VREFCA)    | 0.49 V     | 0.50 VDD   | 0.51 V     |
| Input High Voltage (VIH)      | VREF + 0.1 V | —        | VDD        |
| Input Low Voltage (VIL)       | VSS        | —          | VREF − 0.1 V |
| Idle Current (IDD2N)          | —          | ≤ 23 mA    | 30 mA      |
| Active Current (IDD4R/W)      | —          | ≤ 335 mA   | 390 mA     |
| Data Transfer Rate            | —          | 3200 MT/s  | —          |
| Data Bus Width                | —          | 64-bit     | —          |
| Effective Bandwidth           | —          | 25,600 MB/s| —          |
| ESD Tolerance (HBM Model)     | ≥ 2000 V   | —          | —          |

### Environmental Specifications

| Parameter                     | Value                                        |
|-------------------------------|----------------------------------------------|
| Operating Temperature         | 0°C to +85°C                                |
| Storage Temperature           | −40°C to +95°C                              |
| Operating Humidity            | 5% to 95% RH, non-condensing                |
| Storage Humidity              | 5% to 95% RH, non-condensing                |
| Shock (non-operating)         | 1000 G / 1 ms half-sine                     |
| Vibration                     | 50 Hz to 2000 Hz, 1.5 G RMS                 |
| Altitude (operating)          | 0 to 3000 m above sea level                 |
| Altitude (non-operating)      | 0 to 12,000 m                               |
| Heatspreader Material         | Aluminum alloy (anodized finish)             |
| Heatspreader Thermal Rating   | Passive cooling; no additional airflow required at rated speed |

---

## Key Features

- **Gaming-Session Validated:** Thunder GX modules undergo TwinMOS's proprietary 72-hour extended gaming qualification protocol, which replicates real-world game engine memory access patterns (random read-heavy, burst write, streaming) at full 3200 MHz and rated temperature, ensuring sustained stability under demanding, extended gaming workloads.
- **Low-Profile Aluminum Heatspreader:** The integrated low-profile heatspreader (maximum 35 mm total module height) provides passive thermal management for DRAM die temperature reduction during extended operation, while maintaining clearance compatibility with standard tower CPU coolers and all common AIO radiator configurations.
- **Intel XMP 2.0 Ready:** Factory-programmed XMP 2.0 profile data enables single-toggle 3200 MHz initialization on Intel 10th, 11th, and select 12th-generation DDR4 platforms, eliminating the need for manual timing entry or BIOS expertise.
- **Dual-Voltage Design:** JEDEC 1.2 V default operation ensures compatibility across all DDR4 platforms; XMP 1.35 V mode available for maximum bandwidth on supported motherboards with adjustable DRAM voltage.
- **AMD Ryzen Validated:** Comprehensive compatibility validation on AMD Ryzen 3000 (Matisse), 4000 (Renoir), and 5000 (Vermeer/Cezanne) series AM4 processors ensures stable 3200 MHz DOCP operation with the leading gaming CPU platform.
- **Dual-Channel Kit Matching:** Kit variants are sourced from the same production lot and binned to matching electrical characteristics, ensuring balanced timing, identical refresh parameters, and stable interleaved operation critical for gaming frame-time consistency.
- **6-Layer High-Speed PCB:** The multi-layer PCB substrate with controlled impedance routing minimizes signal reflections and cross-talk at 3200 MT/s, reducing training cycles and improving system boot reliability under automated clock speed negotiation.
- **JEDEC SPD Plug-and-Play:** Fully compliant SPD EEPROM data ensures the module is correctly identified and initialized by any DDR4-compatible UEFI/BIOS at safe JEDEC speeds regardless of whether XMP is enabled, guaranteeing no-fault installation.

---

## Physical Dimensions

| Attribute                     | Value                                         |
|-------------------------------|-----------------------------------------------|
| Module Length                 | 133.35 mm                                     |
| Module Height (bare PCB)      | 31.25 mm                                      |
| Module Height (with heatspreader) | ~35.0 mm                                 |
| Module Thickness (with heatspreader) | ~8.0 mm                               |
| Module Weight (approximate)   | ~22 g (with heatspreader)                    |
| PCB Layers                    | 6-layer controlled-impedance PCB             |
| PCB Color                     | Matte black                                   |
| Heatspreader Color            | Gunmetal gray anodized aluminum               |
| Component Population          | Single-side (8 GB); Dual-side (16 GB)         |
| Connector Type                | 288-pin DDR4 edge connector                   |
| CPU Cooler Clearance          | Compatible with all standard 120 mm+ tower coolers |

---

## Pin Configuration / Connector Definitions

The Thunder GX DDR4 U-DIMM uses the JEDEC-standard 288-pin DDR4 edge connector. The keying notch is positioned at a different location from DDR3 (240-pin), physically preventing cross-generation slot insertion. Signal group definitions per JEDEC JESD79-4B:

| Signal Group            | Designation                  | Function                                                    |
|-------------------------|------------------------------|-------------------------------------------------------------|
| Core Power              | VDD (multiple pins)          | DRAM array and logic supply: 1.20 V (JEDEC) / 1.35 V (XMP)|
| I/O Power               | VDDQ (multiple pins)         | I/O interface supply voltage; tracks VDD                   |
| Ground                  | VSS (multiple pins)          | Digital ground reference                                    |
| Data Bus                | DQ[63:0]                     | 64-bit bidirectional data bus, source-synchronous          |
| Data Strobes            | DQS[7:0]+/DQS[7:0]−          | Differential read/write data strobes (8 lanes)             |
| Data Mask / Bus Inversion | DM/DBI[7:0]                | Per-byte write mask; DBI reduces switching current         |
| Address Bus             | A[16:0]                      | Multiplexed row (17-bit) and column (10-bit) address       |
| Bank Address            | BA[1:0]                      | Selects bank within bank group (4 banks per group)         |
| Bank Group              | BG[1:0]                      | Selects bank group (4 groups × 4 banks = 16 banks total)   |
| Differential Clock      | CK+/CK−                      | Source-synchronous system clock input pair                  |
| Clock Enable            | CKE                           | Enables clock; controls power-down and self-refresh entry  |
| Chip Select             | CS#                           | Activates DRAM for command decoding (active low)           |
| Activate Command        | ACT#                          | DDR4-specific activate row command                          |
| Command Bus             | RAS#, CAS#, WE#               | Legacy-encoded DDR4 commands per CA bus specification      |
| On-Die Termination      | ODT                           | Controls internal read/write termination dynamically       |
| Module Reset            | RESET#                        | Asynchronous module reset (active low); JEDEC-defined      |
| SPD Address             | SA[2:0]                       | I2C slave address select for SPD EEPROM                    |
| SPD Interface           | SCL, SDA                      | I2C serial clock and data for SPD read/write access        |
| Test Enable             | TEN                           | Manufacturing connectivity test enable                      |

> Complete pin assignment per JEDEC Standard 21C, Annex L. Electrical characteristics per JESD79-4B and JESD79-4C.

---

## Ordering Information

| Part Number           | Capacity | Speed     | Timings        | Voltage        | Configuration    |
|-----------------------|----------|-----------|----------------|----------------|------------------|
| TMD4U08G3200C22-TGX   | 8 GB     | 3200 MHz  | CL22-22-22-52  | 1.2 V JEDEC    | 1× single module |
| TMD4U16G3200C22-TGX   | 16 GB    | 3200 MHz  | CL22-22-22-52  | 1.2 V JEDEC    | 1× single module |
| TMD4U08G3200C22K-TGX  | 16 GB    | 3200 MHz  | CL22-22-22-52  | 1.2 V JEDEC    | 2×8 GB dual kit  |
| TMD4U16G3200C22K-TGX  | 32 GB    | 3200 MHz  | CL22-22-22-52  | 1.2 V JEDEC    | 2×16 GB dual kit |
| TMD4U08G3200C16X-TGX  | 8 GB     | 3200 MHz  | CL16-18-18-38  | 1.35 V XMP     | 1× XMP variant   |
| TMD4U16G3200C16XK-TGX | 32 GB    | 3200 MHz  | CL16-18-18-38  | 1.35 V XMP     | 2×16 GB XMP kit  |

> "TGX" suffix denotes Thunder GX product line. "K" suffix indicates factory-matched kit. "X" suffix in part number indicates XMP-optimized CL16 binning. All kits are tested as matched pairs prior to packaging.

---

## Performance Notes

### Bandwidth

| Configuration               | Theoretical Peak Bandwidth |
|-----------------------------|---------------------------|
| Single Module (64-bit)      | 25,600 MB/s               |
| Dual-Channel (2× 64-bit)    | ~51,200 MB/s              |

> For gaming workloads specifically, dual-channel operation typically yields 10–25% improvement in minimum frame rates in VRAM-limited scenarios, compared to single-channel at equivalent total capacity.

### Gaming Latency Reference

| Metric                          | JEDEC CL22 @ 3200 MHz       | XMP CL16 @ 3200 MHz         |
|---------------------------------|-----------------------------|-----------------------------|
| CAS Latency (cycles)            | 22 cycles                   | 16 cycles                   |
| True Latency (ns)               | 13.75 ns                    | 10.0 ns                     |
| tRCD (cycles / ns)              | 22 / 13.75 ns               | 18 / 11.25 ns               |
| tRP (cycles / ns)               | 22 / 13.75 ns               | 18 / 11.25 ns               |
| tRAS (cycles / ns)              | 52 / 32.5 ns                | 38 / 23.75 ns               |
| Bandwidth (64-bit)              | 25,600 MB/s                 | 25,600 MB/s                 |

> The XMP CL16 variant improves true memory access latency by ~27% compared to JEDEC CL22, with identical bandwidth. For latency-sensitive gaming scenarios (open world, CPU-bound titles), the XMP CL16 SKU is recommended.

---

## Platform Compatibility

| Platform / Chipset               | Supported Speed     | Generation         | Notes                                  |
|----------------------------------|---------------------|--------------------|----------------------------------------|
| Intel Z590 / H570 / B560         | 3200 MHz XMP        | 11th Gen (Rocket Lake) | Full XMP 2.0 support               |
| Intel Z490 / H470 / B460         | 3200 MHz XMP        | 10th Gen (Comet Lake) | Full XMP 2.0 support                |
| Intel Z390 / H370 / B360         | 3200 MHz XMP        | 9th/8th Gen (Coffee Lake) | Full XMP 2.0 support            |
| Intel Z690 / H670 (DDR4)         | 3200 MHz XMP        | 12th Gen (Alder Lake) | DDR4 slot variants only            |
| AMD X570 / B550 (AM4)            | 3200 MHz DOCP       | Ryzen 5000/4000    | Native 3200 MHz IMC; DOCP recommended  |
| AMD X470 / B450 (AM4)            | 3200 MHz DOCP       | Ryzen 3000/2000    | AGESA BIOS update recommended          |
| AMD X370 / B350 (AM4)            | 3200 MHz DOCP       | Ryzen 1000/2000    | Latest BIOS required; 1DPC preferred   |
| AMD A520 (AM4)                   | Up to 3200 MHz      | Ryzen 5000/4000    | OC may not be supported; JEDEC default |

> TwinMOS validates Thunder GX on representative hardware from each platform generation. Final compatibility depends on individual motherboard PCB routing quality, BIOS implementation, and CPU IMC silicon. Using matched dual-channel kits is strongly recommended for AM4 platforms.

---

## Regulatory Compliance

| Certification / Standard      | Status       | Scope                                            |
|-------------------------------|--------------|--------------------------------------------------|
| JEDEC JESD79-4B / 4C          | Compliant    | DDR4 SDRAM electrical, timing, and SPD standard  |
| Intel XMP 2.0                 | Certified    | Extended Memory Profile (XMP SKUs)               |
| CE Marking (EU)               | Certified    | EMC Directive 2014/30/EU                         |
| UKCA Marking                  | Certified    | UK Conformity Assessed                           |
| FCC Part 15 Class B           | Certified    | Unintentional radiator — US markets              |
| RoHS 2011/65/EU               | Compliant    | Restriction of hazardous substances in electronics|
| REACH (EC) 1907/2006          | Compliant    | SVHC substance concentration below threshold     |
| EAC TR CU 020/2011            | Certified    | Eurasian Conformity Mark                         |
| ISO 9001:2015                 | Certified    | TwinMOS quality management system                |
| WEEE 2012/19/EU               | Compliant    | Waste electrical equipment — collection and recycling |

---

## Warranty

TwinMOS Technologies provides a **Limited Lifetime Warranty** on the Thunder GX DDR4 U-DIMM against manufacturing defects and material failures under normal operating conditions as defined in this datasheet. The warranty extends to the original purchaser through authorized TwinMOS retail and distribution channels. Warranty claims arising from physical damage, improper installation, operation outside the specified voltage and temperature ranges defined herein, use in systems with known-defective memory controllers, or modifications to the module are excluded.

Warranty service is initiated by contacting TwinMOS Technical Support at **support@twinmos.com**. Please retain your proof of purchase. TwinMOS will validate the warranty claim and issue an RMA authorization for defective module return and replacement.

---

## Revision History

| Revision | Date       | Author                        | Changes                                                     |
|----------|------------|-------------------------------|-------------------------------------------------------------|
| 1.0      | 2023-09-01 | TwinMOS Product Engineering   | Initial product release                                     |
| 1.1      | 2025-03-12 | TwinMOS Product Engineering   | Added XMP CL16 SKU variants to ordering table; updated gaming latency comparison table |
| 1.2      | 2026-04-30 | TwinMOS Product Engineering   | UKCA certification added; updated Intel Z690 DDR4 compatibility note; revised heatspreader dimension spec |

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

This datasheet is published by TwinMOS Technologies for informational purposes. All specifications are engineering targets based on characterization data from representative production samples and are subject to change without prior notice. Actual module performance and compatibility may vary based on platform, BIOS revision, CPU IMC quality, thermal environment, and workload type. TwinMOS Technologies does not warrant that operation will be uninterrupted or error-free, and shall not be liable for damages arising from application of information in this document. All third-party trademarks, including Intel, AMD, Ryzen, and platform names, are the property of their respective owners. No portion of this document may be reproduced without prior written authorization from TwinMOS Technologies.

**TwinMOS Technologies — Committed to Quality Since 1998**
*ISO 9001:2015 Certified | CE | UKCA | FCC | RoHS | REACH | EAC | JEDEC*
