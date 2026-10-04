---
title: "DDR3 Legacy Memory — Product Datasheet"
slug: "ddr3-legacy"
url: "/products/datasheets/ddr3-legacy/"
template: "datasheet"
description: "Official product datasheet for TwinMOS DDR3 Legacy Memory in U-DIMM (240-pin) and SO-DIMM (204-pin) form factors. Covers DDR3-1333 and DDR3-1600 in 4GB and 8GB configurations for Intel Sandy Bridge through Haswell and AMD AM3/AM3+/FM2/FM2+ platforms."
keywords:
  - DDR3 memory
  - DDR3 U-DIMM
  - DDR3 SO-DIMM
  - DDR3 1333MHz
  - DDR3 1600MHz
  - PC3-10600
  - PC3-12800
  - 240-pin DDR3
  - 204-pin DDR3
  - legacy DDR3
  - Sandy Bridge memory
  - Ivy Bridge memory
  - Haswell memory
  - AM3 DDR3
  - TwinMOS DDR3
persona: "IT administrator, legacy system maintainer, small business, industrial system operator, budget upgrader"
status: published
last_reviewed: "2026-04-30"
product_line: "DDR3 Legacy"
document_number: "TM-DS-D3LG-001"
revision: "2.1"
---

# Datasheet — TwinMOS DDR3 Legacy Memory

---

## Document Information

| Field               | Detail                                          |
|---------------------|-------------------------------------------------|
| Document Number     | TM-DS-D3LG-001                                  |
| Revision            | 2.1                                             |
| Release Date        | 2026-04-30                                      |
| Product Line        | DDR3 Legacy                                     |
| Product Family      | DDR3 SDRAM — Desktop U-DIMM and Laptop SO-DIMM  |
| Applicability       | 4 GB and 8 GB; 1333 MHz and 1600 MHz; U-DIMM and SO-DIMM |
| Prepared By         | TwinMOS Technologies — Product Engineering      |
| Classification      | Public / Commercial Datasheet                   |

---

## Product Overview

The TwinMOS DDR3 Legacy Memory series provides genuine DDR3 SDRAM modules for the sustained global installed base of desktop and notebook systems built on Intel 2nd through 4th Generation Core platforms (Sandy Bridge, Ivy Bridge, Haswell) and AMD AM3, AM3+, FM2, and FM2+ processor platforms. Available as both 240-pin DDR3 U-DIMM for desktop systems and 204-pin DDR3 SO-DIMM for notebook and compact systems, the TwinMOS DDR3 Legacy series covers DDR3-1333 (PC3-10600) and DDR3-1600 (PC3-12800) speed grades in 4 GB and 8 GB capacities. All modules operate at the JEDEC-standard 1.5 V supply voltage and are fully compliant with JEDEC Standard No. JESD79-3F (DDR3 SDRAM), including complete SPD EEPROM data encoding per JEDEC Standard No. 21C, Annex J. TwinMOS maintains continued production of DDR3 modules to support the large installed base of enterprise, small business, industrial, and educational computing infrastructure that relies on DDR3 platforms for day-to-day operations — particularly in regions and sectors where DDR4 platform migration has not yet been undertaken. Each module is 100% factory tested at rated speed on industry-standard ATE platforms and ships with JEDEC-compliant SPD data ensuring transparent plug-and-play initialization without any BIOS configuration.

---

## Specifications

### General Specifications

| Parameter                        | U-DIMM (Desktop)                | SO-DIMM (Laptop/Mobile)          |
|----------------------------------|---------------------------------|----------------------------------|
| Memory Type                      | DDR3 SDRAM                      | DDR3 SDRAM                       |
| Form Factor                      | U-DIMM (Unbuffered DIMM)        | SO-DIMM (Small Outline DIMM)     |
| Pin Count                        | 240-pin                         | 204-pin                          |
| ECC Support                      | Non-ECC                         | Non-ECC                          |
| Buffering                        | Unbuffered                      | Unbuffered                       |
| Available Capacities             | 4 GB, 8 GB                      | 4 GB, 8 GB                       |
| DDR3-1333 Speed                  | 1333 MHz (PC3-10600)            | 1333 MHz (PC3-10600)             |
| DDR3-1600 Speed                  | 1600 MHz (PC3-12800)            | 1600 MHz (PC3-12800)             |
| CAS Latency (DDR3-1333)          | CL9-9-9-24                      | CL9-9-9-24                       |
| CAS Latency (DDR3-1600)          | CL11-11-11-28                   | CL11-11-11-28                    |
| JEDEC Standard                   | JESD79-3F                       | JESD79-3F                        |
| Module Organization (4 GB)       | 2 Rank × 8 × 2 Gb (2Rx8)       | 2 Rank × 8 × 2 Gb (2Rx8)        |
| Module Organization (8 GB)       | 2 Rank × 8 × 4 Gb (2Rx8)       | 2 Rank × 8 × 4 Gb (2Rx8)        |
| Data Bus Width                   | 64-bit                          | 64-bit                           |
| Burst Length                     | BL8 (fixed), BC4, BL4           | BL8 (fixed), BC4, BL4            |
| Prefetch                         | 8n                              | 8n                               |
| Internal Banks                   | 8                               | 8                                |
| SPD EEPROM                       | 256-byte, I2C (JESD21C Annex J) | 256-byte, I2C (JESD21C Annex J)  |

### Electrical Specifications

| Parameter                        | Min         | Nominal     | Max         |
|----------------------------------|-------------|-------------|-------------|
| Supply Voltage (VDD)             | 1.425 V     | 1.50 V      | 1.575 V     |
| I/O Supply Voltage (VDDQ)        | = VDD       | = VDD       | = VDD       |
| Reference Voltage (VREF)         | 0.49 V      | 0.50 VDD    | 0.51 V      |
| Input High Voltage (VIH)         | VREF + 0.1 V| —           | VDD         |
| Input Low Voltage (VIL)          | VSS         | —           | VREF − 0.1 V|
| Idle Current (IDD2N) — DDR3-1333 | —           | ≤ 20 mA     | 28 mA       |
| Idle Current (IDD2N) — DDR3-1600 | —           | ≤ 22 mA     | 30 mA       |
| Active Current IDD4R/W           | —           | ≤ 300 mA    | 360 mA      |
| Self-Refresh Current (IDD6)      | —           | ≤ 6 mA      | 10 mA       |
| Data Transfer Rate — DDR3-1333   | —           | 1333 MT/s   | —           |
| Data Transfer Rate — DDR3-1600   | —           | 1600 MT/s   | —           |
| Bandwidth — DDR3-1333            | —           | 10,666 MB/s | —           |
| Bandwidth — DDR3-1600            | —           | 12,800 MB/s | —           |
| ESD Tolerance (HBM)              | ≥ 2000 V    | —           | —           |

### Environmental Specifications

| Parameter                        | Value                                           |
|----------------------------------|-------------------------------------------------|
| Operating Temperature            | 0°C to +85°C                                   |
| Storage Temperature              | −40°C to +95°C                                 |
| Operating Humidity               | 5% to 95% RH, non-condensing                   |
| Storage Humidity                 | 5% to 95% RH, non-condensing                   |
| Shock (non-operating)            | 1000 G / 1 ms half-sine                        |
| Vibration                        | 50 Hz to 2000 Hz, 1.5 G RMS                    |
| Altitude (operating)             | 0 to 3000 m                                    |
| Altitude (non-operating)         | 0 to 12,000 m                                  |
| Thermal Sensor                   | Not present                                     |

---

## Key Features

- **Sustained DDR3 Production:** TwinMOS maintains active production of DDR3 U-DIMM and SO-DIMM modules, providing a reliable supply channel for enterprise IT departments, system integrators, industrial automation, and educational institutions managing large installed bases of DDR3-era hardware.
- **Dual Form Factor Coverage:** Single product family covering both 240-pin DDR3 U-DIMM (desktop) and 204-pin DDR3 SO-DIMM (notebook) form factors under unified part number structure and warranty coverage, simplifying procurement for multi-platform deployments.
- **JEDEC DDR3 Standard Compliance:** Full compliance with JEDEC JESD79-3F ensures transparent compatibility with all DDR3 memory controllers, requiring no BIOS modifications, special firmware, or XMP profiles — module data is read from SPD EEPROM and the platform initializes at the correct speed automatically.
- **Backward Compatibility:** DDR3-1600 modules automatically downclock to DDR3-1333 or DDR3-1066 on platforms where the CPU or chipset does not support 1600 MT/s, ensuring safe operation without user intervention when mixing speed grades or upgrading from slower modules.
- **Sandy Bridge Through Haswell Validation:** Explicitly validated on Intel 2nd Generation Core (Sandy Bridge, LGA1155), 3rd Generation Core (Ivy Bridge, LGA1155/LGA1150), and 4th Generation Core (Haswell, LGA1150) platforms — the three most common DDR3 desktop CPU generations still in active service globally.
- **AMD AM3/AM3+/FM2/FM2+ Coverage:** Compatible with AMD FX series (AM3+), AMD Phenom II (AM3), and AMD A-series APU (FM2/FM2+) desktop platforms, providing upgrade coverage for the full AMD DDR3 desktop ecosystem including both CPU-only and APU-based systems.
- **Registered SPD EEPROM:** Each module ships with fully populated JEDEC SPD data in the on-module I2C EEPROM, covering all supported speed grades (DDR3-1066 through DDR3-1600), voltage specification, module organization, manufacturing information, and JEDEC-standard timing tables.
- **RoHS and REACH Compliant Manufacturing:** All DDR3 Legacy modules are manufactured under TwinMOS's ISO 9001:2015 quality management system using RoHS-compliant materials, ensuring import eligibility into EU, UK, and other regulated markets regardless of end-of-life platform status.

---

## Physical Dimensions

### U-DIMM (Desktop — 240-pin)

| Attribute                     | Value                                           |
|-------------------------------|-------------------------------------------------|
| Module Length                 | 133.35 mm                                       |
| Module Height                 | 30.0 mm                                         |
| Module Thickness              | 3.72 mm                                         |
| Module Weight (4 GB)          | ~10 g                                           |
| Module Weight (8 GB)          | ~12 g                                           |
| PCB Layers                    | 6-layer PCB                                     |
| PCB Color                     | Dark green                                      |
| Component Population          | Dual-side (4 GB and 8 GB)                       |
| Connector Type                | 240-pin DDR3 edge connector (keyed)             |
| Key Position                  | DDR3 U-DIMM key (different from DDR2 / DDR4)   |

### SO-DIMM (Laptop/Mobile — 204-pin)

| Attribute                     | Value                                           |
|-------------------------------|-------------------------------------------------|
| Module Length                 | 67.60 mm                                        |
| Module Height                 | 30.0 mm                                         |
| Module Thickness              | 3.8 mm                                          |
| Module Weight (4 GB)          | ~7 g                                            |
| Module Weight (8 GB)          | ~9 g                                            |
| PCB Layers                    | 6-layer PCB                                     |
| PCB Color                     | Dark green                                      |
| Component Population          | Single or dual-side depending on density        |
| Connector Type                | 204-pin DDR3 SO-DIMM edge connector (keyed)    |
| Installation Angle            | 45° insertion angle (JEDEC SO-DIMM standard)    |

---

## Pin Configuration / Connector Definitions

### DDR3 U-DIMM (240-pin) Signal Groups

The 240-pin DDR3 U-DIMM connector is defined per JEDEC Standard No. 21C, Annex J. The key notch is distinct from DDR2 (240-pin, different key position) and DDR4 (288-pin), physically preventing cross-generation errors.

| Signal Group              | Pin Range / Designation   | Function                                                      |
|---------------------------|---------------------------|---------------------------------------------------------------|
| VDD                       | Power supply pins         | DRAM core supply: 1.425 V – 1.575 V (nominal 1.5 V)         |
| VDDQ                      | I/O power pins            | I/O supply; nominally = VDD                                   |
| VSS                       | Ground (multiple)         | Digital ground reference                                      |
| DQ[63:0]                  | Data bus                  | 64-bit bidirectional data (8 bytes × 8 bits)                 |
| DQS[7:0]+/DQS[7:0]−       | Data strobes              | Differential per-byte-lane data strobes                      |
| DM[7:0]                   | Data mask                 | Write data byte mask (DDR3; no DBI)                          |
| A[14:0]                   | Address bus               | Multiplexed row (15-bit) and column (10-bit) address         |
| BA[2:0]                   | Bank address              | 8-bank select (3-bit bank address)                            |
| CK+/CK−                   | Differential clock        | Source-synchronous system clock pair                          |
| CKE                       | Clock enable              | Clock enable; power-down and self-refresh mode control       |
| CS#[1:0]                  | Chip select               | DRAM rank select (active low); 2 ranks supported             |
| RAS#/CAS#/WE#             | Command bus               | Row address strobe, column address strobe, write enable      |
| ODT[1:0]                  | On-die termination        | Selects termination per rank during read/write               |
| RESET#                    | Module reset              | Asynchronous reset for DDR3 initialization sequence          |
| SA[2:0] / SCL / SDA       | SPD interface             | I2C SPD EEPROM access; address select + bus                  |
| TEN                       | Test enable               | Manufacturing connectivity test mode                          |
| VTT                       | Termination voltage       | I/O termination reference (VDDQ/2); platform-supplied        |
| VREF                      | Reference voltage         | Data input reference; internally generated on DDR3            |

### DDR3 SO-DIMM (204-pin) Signal Groups

The 204-pin DDR3 SO-DIMM connector is defined per JEDEC Standard No. 21C, Annex J (SO-DIMM addendum). Signal assignments are equivalent to U-DIMM with reduced power pin count appropriate for mobile implementation:

| Signal Group              | Notable Differences from U-DIMM                              |
|---------------------------|--------------------------------------------------------------|
| Power / Ground            | Fewer VDD/VDDQ/VSS pins due to reduced module width          |
| Address / Command / Data  | Identical signal definitions; same electrical specifications |
| SPD Interface             | Identical I2C SPD EEPROM interface                           |
| Key Position              | 45.0 mm from left edge (DDR3 SO-DIMM specific key)          |
| VTT                       | May be omitted on platforms with integrated ODT control      |

---

## Ordering Information

### U-DIMM (Desktop — 240-pin)

| Part Number              | Capacity | Speed     | Timings       | Voltage | Form Factor |
|--------------------------|----------|-----------|---------------|---------|-------------|
| TMD3U04G1333C9-LG        | 4 GB     | 1333 MHz  | CL9-9-9-24    | 1.5 V   | U-DIMM      |
| TMD3U08G1333C9-LG        | 8 GB     | 1333 MHz  | CL9-9-9-24    | 1.5 V   | U-DIMM      |
| TMD3U04G1600C11-LG       | 4 GB     | 1600 MHz  | CL11-11-11-28 | 1.5 V   | U-DIMM      |
| TMD3U08G1600C11-LG       | 8 GB     | 1600 MHz  | CL11-11-11-28 | 1.5 V   | U-DIMM      |
| TMD3U04G1333C9K-LG       | 2×4 GB   | 1333 MHz  | CL9-9-9-24    | 1.5 V   | U-DIMM Kit  |
| TMD3U08G1600C11K-LG      | 2×8 GB   | 1600 MHz  | CL11-11-11-28 | 1.5 V   | U-DIMM Kit  |

### SO-DIMM (Laptop/Mobile — 204-pin)

| Part Number              | Capacity | Speed     | Timings       | Voltage | Form Factor |
|--------------------------|----------|-----------|---------------|---------|-------------|
| TMD3S04G1333C9-LG        | 4 GB     | 1333 MHz  | CL9-9-9-24    | 1.5 V   | SO-DIMM     |
| TMD3S08G1333C9-LG        | 8 GB     | 1333 MHz  | CL9-9-9-24    | 1.5 V   | SO-DIMM     |
| TMD3S04G1600C11-LG       | 4 GB     | 1600 MHz  | CL11-11-11-28 | 1.5 V   | SO-DIMM     |
| TMD3S08G1600C11-LG       | 8 GB     | 1600 MHz  | CL11-11-11-28 | 1.5 V   | SO-DIMM     |
| TMD3S04G1333C9K-LG       | 2×4 GB   | 1333 MHz  | CL9-9-9-24    | 1.5 V   | SO-DIMM Kit |
| TMD3S08G1600C11K-LG      | 2×8 GB   | 1600 MHz  | CL11-11-11-28 | 1.5 V   | SO-DIMM Kit |

> Part number structure: TMD3 = TwinMOS DDR3; U = U-DIMM / S = SO-DIMM; capacity; speed; CAS latency; "-LG" = Legacy product line suffix. "K" = factory-matched dual-channel kit.

---

## Performance Notes

### Bandwidth by Speed Grade

| Speed Grade     | Transfer Rate | Bus Width | Theoretical Peak Bandwidth | Dual-Channel     |
|-----------------|---------------|-----------|---------------------------|------------------|
| DDR3-1333       | 1333 MT/s     | 64-bit    | 10,666 MB/s               | ~21,333 MB/s     |
| DDR3-1600       | 1600 MT/s     | 64-bit    | 12,800 MB/s               | ~25,600 MB/s     |

> Note: DDR3-1600 dual-channel theoretical peak bandwidth (25,600 MB/s) equals DDR4-3200 single-channel bandwidth, illustrating that channel configuration has as significant an impact as raw clock speed. For DDR3 platforms, enabling dual-channel operation is the most impactful single configuration change available.

### Latency Reference

| Parameter                   | DDR3-1333 / CL9           | DDR3-1600 / CL11          |
|-----------------------------|---------------------------|---------------------------|
| CAS Latency (cycles)        | 9                         | 11                        |
| True Latency (ns)           | 9 / 666.5 = 13.5 ns       | 11 / 800 = 13.75 ns       |
| tRCD (cycles / ns)          | 9 / 13.5 ns               | 11 / 13.75 ns             |
| tRP (cycles / ns)           | 9 / 13.5 ns               | 11 / 13.75 ns             |
| tRAS (cycles / ns)          | 24 / 36.0 ns              | 28 / 35.0 ns              |
| tRC (min)                   | 33 cycles                 | 39 cycles                 |

> Both DDR3-1333/CL9 and DDR3-1600/CL11 produce nearly identical true access latency in nanoseconds (~13.5 ns vs. 13.75 ns), meaning that for latency-sensitive workloads the difference is negligible. DDR3-1600 provides a 20% bandwidth increase over DDR3-1333, which is the primary differentiator.

---

## Platform Compatibility

### Desktop (U-DIMM — 240-pin)

| Platform                        | Chipset                    | Max Speed       | Notes                                            |
|---------------------------------|----------------------------|-----------------|--------------------------------------------------|
| Intel 4th Gen Core (Haswell)    | Z97 / H97 / B85 / H81      | DDR3-1600       | LGA1150; native DDR3-1600; some Z97 support 1866+ |
| Intel 3rd Gen Core (Ivy Bridge) | Z77 / H77 / B75            | DDR3-1600       | LGA1155; full DDR3-1600 support                  |
| Intel 2nd Gen Core (Sandy Bridge)| Z68 / P67 / H67 / H61     | DDR3-1333       | LGA1155; native DDR3-1333; 1600 OC possible on Z68 |
| Intel Xeon E3-1200 v1/v2/v3     | C216 / C226                | DDR3-1600 ECC   | ECC U-DIMM required for ECC; non-ECC also supported |
| AMD FX Series (Vishera/Zambezi) | AMD 990FX / 970 / 760G     | DDR3-1600+      | AM3+; officially DDR3-1866; use 1600 for full compat |
| AMD Phenom II / Athlon II       | AMD 890FX / 870 / 760G     | DDR3-1333       | AM3; DDR3-1333 natively; 1600 possible with BIOS |
| AMD A-Series APU (Richland/Trinity) | AMD A85X / A75 / A55   | DDR3-1600       | FM2/FM2+; shared memory bandwidth matters for iGPU |
| AMD A-Series APU (Kaveri)       | AMD A88X / A78 / A58       | DDR3-1600       | FM2+; up to DDR3-2133 possible with compatible modules |

### Laptop / Mobile (SO-DIMM — 204-pin)

| Platform                        | CPU Generation / Series     | Max Speed       | Notes                                            |
|---------------------------------|----------------------------|-----------------|--------------------------------------------------|
| Intel Core i7/i5/i3 (Ivy Bridge-M) | 3000-series mobile     | DDR3-1600       | rPGA989/BGA; laptops with SO-DIMM slots          |
| Intel Core i7/i5/i3 (Sandy Bridge-M)| 2000-series mobile    | DDR3-1333       | rPGA989/BGA; max 1333 on most platforms          |
| Intel Core i7/i5/i3 (Haswell-M) | 4000-series mobile          | DDR3-1600       | rPGA946/BGA; standard laptop DDR3 generation     |
| Intel Celeron / Pentium (DDR3)  | Bay Trail-M / Haswell-ULT  | DDR3-1333       | Budget laptops; verify SO-DIMM slot presence     |
| AMD A-Series APU (DDR3 laptop)  | Llano / Trinity / Richland | DDR3-1600       | FS1 / FP2 socket laptops; confirm socket type    |
| AMD Phenom II / Turion II       | Caspian / Champlain         | DDR3-1333       | AM3 / S1g4 laptop; verify DDR3 compatibility     |

> TwinMOS DDR3 SO-DIMM modules are also compatible with DDR3 NAS devices, DDR3 embedded computing boards, and industrial SBC platforms specifying 204-pin DDR3 SO-DIMM compliance.

---

## Regulatory Compliance

| Certification / Standard      | Status       | Scope                                              |
|-------------------------------|--------------|-----------------------------------------------------|
| JEDEC JESD79-3F               | Compliant    | DDR3 SDRAM electrical, timing, and functional spec  |
| JEDEC JESD21C Annex J         | Compliant    | DDR3 U-DIMM and SO-DIMM SPD encoding               |
| CE Marking (EU)               | Certified    | EMC Directive 2014/30/EU                            |
| UKCA Marking                  | Certified    | UK Conformity Assessed                              |
| FCC Part 15 Class B           | Certified    | US FCC emissions standard                           |
| RoHS 2011/65/EU               | Compliant    | Hazardous substance restrictions                    |
| REACH (EC) 1907/2006          | Compliant    | SVHC compliance in PCB and DRAM materials           |
| EAC TR CU 020/2011            | Certified    | Eurasian Conformity                                 |
| ISO 9001:2015                 | Certified    | TwinMOS quality management system                   |
| WEEE 2012/19/EU               | Compliant    | End-of-life electrical waste compliance             |

---

## Warranty

TwinMOS Technologies provides a **Limited Lifetime Warranty** on DDR3 Legacy Memory modules against defects in materials and workmanship under normal use conditions as specified in this datasheet. Warranty is provided to the original purchaser through authorized TwinMOS distribution channels, subject to valid proof of purchase. This warranty does not cover: insertion into DDR2 (240-pin, different key) or DDR4 (288-pin) slots; operation at voltages exceeding 1.575 V; damage from physical impact or electrostatic discharge; failures attributable to the host platform's memory controller; or any modification to the module's PCB, components, or label markings.

For warranty service, contact **support@twinmos.com** providing the part number, purchase date and vendor, platform information, and a clear description of the observed failure. TwinMOS will assess the claim and issue an RMA number for eligible returns. Replacement modules are dispatched from TwinMOS regional distribution centers.

---

## Revision History

| Revision | Date       | Author                        | Changes                                                       |
|----------|------------|-------------------------------|---------------------------------------------------------------|
| 1.0      | 2020-06-01 | TwinMOS Product Engineering   | Initial legacy DDR3 datasheet release                         |
| 1.1      | 2021-03-15 | TwinMOS Product Engineering   | Added AMD FM2/FM2+ A-Series APU laptop SO-DIMM compatibility  |
| 1.2      | 2022-08-10 | TwinMOS Product Engineering   | Added NAS / industrial SBC SO-DIMM note; expanded ordering table |
| 2.0      | 2024-01-20 | TwinMOS Product Engineering   | Full document reformat; added dual form factor side-by-side specs; added DDR3/DDR4 bandwidth comparison note; revised latency table |
| 2.1      | 2026-04-30 | TwinMOS Product Engineering   | UKCA certification added; altitude spec updated; Xeon E3 compatibility note added |

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

This datasheet is provided by TwinMOS Technologies for informational and procurement reference purposes. All specifications are based on engineering design targets and characterization data from production-representative samples and are subject to change without notice. Platform compatibility information is provided as guidance based on validated testing on representative hardware; TwinMOS Technologies cannot guarantee operation on every possible system configuration within the listed platform families, as individual motherboard designs, BIOS implementations, and CPU revisions may affect behavior. DDR3 Legacy modules are intended for use in DDR3-specific platforms only; use in DDR4 or DDR2 systems will result in physical insertion failure due to connector key mismatch. TwinMOS Technologies shall not be liable for any damages arising from use of information in this document. All platform names, CPU codenames, and trademarks are the property of their respective owners. Reproduction requires prior written authorization from TwinMOS Technologies.

**TwinMOS Technologies — Committed to Quality Since 1998**
*ISO 9001:2015 Certified | CE | UKCA | FCC | RoHS | REACH | EAC | JEDEC*
