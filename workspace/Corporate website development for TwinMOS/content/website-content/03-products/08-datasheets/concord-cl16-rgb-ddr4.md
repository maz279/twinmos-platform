---
title: "Concord CL16 RGB DDR4 U-DIMM Kit — Product Datasheet"
slug: "concord-cl16-rgb-ddr4"
url: "/products/datasheets/concord-cl16-rgb-ddr4/"
template: "datasheet"
description: "Official product datasheet for TwinMOS Concord CL16 RGB DDR4 U-DIMM dual-channel kit. 3200MHz CL16 with addressable RGB, XMP 2.0, ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light, and ASRock Polychrome SYNC support."
keywords:
  - Concord CL16 RGB
  - DDR4 RGB memory
  - ARGB DDR4
  - DDR4 3200MHz CL16
  - PC4-25600
  - XMP 2.0
  - ASUS Aura Sync
  - RGB Fusion 2.0
  - MSI Mystic Light
  - ASRock Polychrome
  - TwinMOS RGB RAM
  - dual-channel kit
persona: "PC builder, enthusiast, gamer, content creator, RGB system builder"
status: published
last_reviewed: "2026-04-30"
product_line: "Concord RGB"
document_number: "TM-DS-CCRGB-DDR4-001"
revision: "1.2"
---

# Datasheet — TwinMOS Concord CL16 RGB DDR4 U-DIMM Kit

---

## Document Information

| Field               | Detail                                       |
|---------------------|----------------------------------------------|
| Document Number     | TM-DS-CCRGB-DDR4-001                         |
| Revision            | 1.2                                          |
| Release Date        | 2026-04-30                                   |
| Product Line        | Concord RGB                                  |
| Product Family      | DDR4 U-DIMM RGB Desktop Memory — Dual-Channel Kit |
| Applicability       | 16 GB (2×8 GB) dual-channel matched kit      |
| Prepared By         | TwinMOS Technologies — Product Engineering   |
| Classification      | Public / Commercial Datasheet                |

---

## Product Overview

The TwinMOS Concord CL16 RGB DDR4 U-DIMM Kit is a factory-matched dual-channel memory solution combining aggressive CL16-18-18-38 performance at 3200 MHz (PC4-25600) with a full-length addressable RGB (ARGB) lighting bar integrated into an aluminum alloy heatspreader assembly. Shipped as a 16 GB (2×8 GB) dual-channel kit, both modules are binned from the same production batch and characterized as matched pairs, ensuring identical electrical timing parameters, identical XMP profiles, and consistent interleaved dual-channel initialization. The Concord CL16 RGB operates under Intel XMP 2.0 at 1.35 V for maximum performance, and falls back to JEDEC-standard 1.2 V operation on non-XMP platforms. The 5 V addressable RGB (ARGB) header design is fully compatible with ASUS Aura Sync, Gigabyte RGB Fusion 2.0, MSI Mystic Light Sync, and ASRock Polychrome SYNC ecosystems via 3-pin 5 V ARGB motherboard headers, allowing unified system lighting control without third-party software. For platforms without ARGB header support, the modules default to a static rainbow cycling mode. The Concord CL16 RGB is validated for Intel 300 through 500 series DDR4 chipsets and AMD AM4 (300, 400, and 500 series), making it suitable for high-visibility gaming builds, streaming rigs, and showcase workstation systems.

---

## Specifications

### General Specifications

| Parameter                      | Value                                         |
|--------------------------------|-----------------------------------------------|
| Memory Type                    | DDR4 SDRAM                                    |
| Form Factor                    | U-DIMM (Unbuffered DIMM)                      |
| Pin Count                      | 288-pin                                       |
| ECC Support                    | Non-ECC                                       |
| Buffering                      | Unbuffered                                    |
| Kit Configuration              | 16 GB (2×8 GB) dual-channel matched kit       |
| Per-Module Capacity            | 8 GB                                          |
| Module Organization            | 1 Rank × 8 × 8 Gb (1Rx8)                     |
| Rated Speed (XMP)              | 3200 MHz (PC4-25600)                          |
| Rated Speed (JEDEC default)    | 2133 MHz                                      |
| CAS Latency (XMP)              | CL16-18-18-38 at 1.35 V                      |
| CAS Latency (JEDEC / 3200)     | CL22-22-22-52 at 1.2 V                       |
| XMP Version                    | Intel XMP 2.0                                 |
| Burst Length                   | BL8 (fixed), BC4 (on-the-fly)                |
| Prefetch                       | 8n                                            |
| Banks                          | 16 (4 bank groups × 4 banks)                  |
| Factory Matching               | Same production lot, binned matched pairs      |
| RGB Type                       | Addressable RGB (ARGB), 5 V, 3-pin            |
| RGB Controller                 | Integrated per-module ARGB controller IC      |
| RGB Zone Count                 | 8 individually addressable LED zones per module |

### Electrical Specifications

| Parameter                      | Min        | Nominal    | Max        |
|--------------------------------|------------|------------|------------|
| Supply Voltage (VDD) — JEDEC   | 1.14 V     | 1.20 V     | 1.26 V     |
| Supply Voltage (VDD) — XMP     | 1.28 V     | 1.35 V     | 1.40 V     |
| I/O Supply Voltage (VDDQ)      | = VDD      | = VDD      | = VDD      |
| ARGB LED Supply Voltage        | 4.75 V     | 5.00 V     | 5.25 V     |
| ARGB Current (per module, max) | —          | ≤ 500 mA   | 600 mA     |
| Reference Voltage (VREFCA)     | 0.49 V     | 0.50 VDD   | 0.51 V     |
| Input High Voltage (VIH)       | VREF + 0.1 V | —        | VDD        |
| Input Low Voltage (VIL)        | VSS        | —          | VREF − 0.1 V |
| Active Current IDD4R/W (DRAM)  | —          | ≤ 350 mA   | 400 mA     |
| Total Module Current (peak)    | —          | ≤ 850 mA   | 1000 mA    |
| Data Transfer Rate             | —          | 3200 MT/s  | —          |
| Data Bus Width                 | —          | 64-bit     | —          |
| Effective Bandwidth            | —          | 25,600 MB/s| —          |

### Environmental Specifications

| Parameter                      | Value                                         |
|--------------------------------|-----------------------------------------------|
| Operating Temperature          | 0°C to +85°C                                 |
| Storage Temperature            | −40°C to +95°C                               |
| Operating Humidity             | 5% to 95% RH, non-condensing                 |
| Storage Humidity               | 5% to 95% RH, non-condensing                 |
| Shock (non-operating)          | 1000 G / 1 ms half-sine                      |
| Vibration                      | 50 Hz to 2000 Hz, 1.5 G RMS                  |
| Altitude (operating)           | 0 to 3000 m                                   |

---

## Key Features

- **Aggressive CL16 XMP Performance:** Intel XMP 2.0 profile programs CL16-18-18-38 timings at 3200 MHz / 1.35 V, delivering 27% lower true access latency (10.0 ns) compared to standard JEDEC CL22 modules at identical clock speed — measurable in latency-sensitive gaming and content creation workloads.
- **Full-Spectrum Addressable RGB:** The integrated ARGB lighting bar spans the full 133.35 mm module length with 8 individually addressable RGB LED zones per module, supporting 16.7 million colors per zone and independent animation control via compatible ARGB software ecosystems.
- **Universal ARGB Ecosystem Compatibility:** Native support for ASUS Aura Sync, Gigabyte RGB Fusion 2.0, MSI Mystic Light Sync, and ASRock Polychrome SYNC via the 3-pin 5 V ARGB header eliminates the need for proprietary software or USB dongle connections for full lighting ecosystem integration.
- **Factory-Matched Dual-Channel Kit:** Both modules are selected from the same production batch and electrically characterized as a matched pair, guaranteeing identical SPD data, XMP profile data, refresh timing, and inter-module signal matching for maximum dual-channel stability.
- **Standalone RGB Mode:** When installed on motherboards without 3-pin ARGB headers, the modules default autonomously to a built-in rainbow cycling animation pattern — ensuring visual activity without software configuration on any DDR4 platform.
- **Aluminum Alloy Heatspreader:** The full-coverage aluminum alloy heatspreader with integrated ARGB light diffuser manages DRAM die temperature during sustained high-load operation, while the anodized finish provides corrosion resistance and aesthetic consistency across multi-module configurations.
- **Validated Platform Compatibility:** Comprehensive compatibility testing on Intel 300 (Coffee Lake), 400 (Comet Lake), and 500 (Rocket Lake) series chipsets, and AMD 300, 400, and 500 series AM4 chipsets ensures reliable dual-channel initialization at 3200 MHz across all primary gaming platforms.
- **JEDEC SPD Compliance:** Complete JEDEC SPD data ensures safe automatic initialization at JEDEC speeds on any DDR4 platform, providing a reliable fallback for configurations where XMP cannot be enabled.

---

## Physical Dimensions

| Attribute                       | Value                                         |
|---------------------------------|-----------------------------------------------|
| Module Length                   | 133.35 mm                                     |
| Module Height (with heatspreader + RGB bar) | ~44.0 mm                        |
| Module Thickness (with heatspreader) | ~8.0 mm                                |
| Module Weight (approximate)     | ~47 g per module                             |
| Kit Weight (2× modules)         | ~94 g                                         |
| PCB Layers                      | 6-layer high-speed PCB                        |
| PCB Color                       | Matte black                                   |
| Heatspreader Material           | Aluminum alloy, anodized                      |
| RGB Light Diffuser              | Frosted PC (polycarbonate) diffuser bar       |
| RGB LED Type                    | WS2812B-compatible individually addressable LEDs |
| ARGB Header Connector           | 3-pin 5 V ARGB (motherboard-side connection) |
| ARGB Cable Length               | 100 mm (per module, included)                |
| Connector Type                  | 288-pin DDR4 edge connector                   |
| CPU Cooler Clearance Note       | 44 mm total height — verify clearance with tower coolers; compatible with AIO coolers and open-air designs |

---

## Pin Configuration / Connector Definitions

The Concord CL16 RGB implements the JEDEC-standard 288-pin DDR4 U-DIMM edge connector for memory signaling, plus an auxiliary 3-pin 5 V ARGB header for RGB control.

### DDR4 Memory Interface (288-pin Edge Connector)

| Signal Group              | Function                                                  |
|---------------------------|-----------------------------------------------------------|
| VDD / VDDQ                | DDR4 DRAM core and I/O power (1.2 V JEDEC / 1.35 V XMP) |
| VSS                       | Ground reference                                          |
| DQ[63:0]                  | 64-bit bidirectional data bus                             |
| DQS[7:0]+/−               | Differential data strobe pairs (source-synchronous)      |
| DM/DBI[7:0]               | Data mask / data bus inversion per byte lane             |
| A[16:0] / BA[1:0] / BG[1:0] | Multiplexed address, bank, and bank group select      |
| CK+/CK−                   | Differential source clock pair                            |
| CKE / CS# / ACT#          | Clock enable, chip select, activate command               |
| RAS#/CAS#/WE#             | DDR4 encoded command bus                                  |
| ODT                       | On-die termination control                                |
| RESET#                    | Asynchronous module reset (active low)                    |
| SA[2:0] / SCL / SDA       | SPD I2C address select and bus (EEPROM access)           |
| TEN                       | Connectivity test enable (factory use)                    |

### ARGB Interface (3-pin 5 V ARGB Header)

| Pin | Signal    | Function                                              |
|-----|-----------|-------------------------------------------------------|
| 1   | +5 V      | LED and controller supply voltage (4.75 V – 5.25 V)  |
| 2   | Data      | Serial addressable LED data signal (WS2812B protocol) |
| 3   | GND       | Ground reference for LED circuit                      |

> The ARGB connector is compatible with standard 3-pin 5 V ARGB headers on ASUS, Gigabyte, MSI, and ASRock motherboards. Do not connect to 4-pin 12 V RGB headers — doing so will permanently damage the RGB LED circuit and void warranty coverage for the RGB components.

---

## Ordering Information

| Part Number              | Kit Config  | Speed    | Timings       | Voltage    | RGB           |
|--------------------------|-------------|----------|---------------|------------|---------------|
| TMD4U08G3200C16KR-CC     | 2×8 GB kit  | 3200 MHz | CL16-18-18-38 | 1.35 V XMP | ARGB 5 V 3-pin |

> The Concord CL16 RGB is available exclusively as a factory-matched 2×8 GB dual-channel kit. Individual modules are not sold separately to preserve matched-pair guarantees. Part number suffix "-CC" designates the Concord series. "-KR" suffix indicates kit with RGB. Custom OEM configurations (different kit densities, channel counts) available on request — contact sales@twinmos.com.

---

## Performance Notes

### Bandwidth

| Configuration             | Theoretical Peak Bandwidth |
|---------------------------|---------------------------|
| Per Module (64-bit)       | 25,600 MB/s               |
| Dual-Channel (2× 64-bit)  | ~51,200 MB/s              |

### Latency Reference

| Metric                          | CL16 XMP @ 3200 MHz      | CL22 JEDEC @ 3200 MHz   |
|---------------------------------|--------------------------|-------------------------|
| CAS Latency (cycles)            | 16                       | 22                      |
| True Latency (ns)               | 10.0 ns                  | 13.75 ns                |
| tRCD (cycles / ns)              | 18 / 11.25 ns            | 22 / 13.75 ns           |
| tRP (cycles / ns)               | 18 / 11.25 ns            | 22 / 13.75 ns           |
| tRAS (cycles / ns)              | 38 / 23.75 ns            | 52 / 32.5 ns            |

> CL16 XMP mode offers a 27% reduction in true access latency vs. CL22 JEDEC at the same clock speed, providing a tangible advantage in latency-sensitive gaming titles and real-time audio workloads.

### RGB Power Budget Note

Each module requires up to 500 mA from the 5 V ARGB header at full LED brightness. Ensure your motherboard ARGB header supports at least 3 A total output when operating multiple ARGB devices simultaneously. Refer to your motherboard manual for ARGB header current rating before connecting additional ARGB devices.

---

## Platform Compatibility

| Platform / Chipset              | Speed (XMP)   | ARGB Ecosystem Compatibility                      |
|---------------------------------|---------------|---------------------------------------------------|
| Intel Z590 (Rocket Lake)        | 3200 MHz CL16 | ASUS Aura Sync; MSI Mystic Light; Gigabyte RGB Fusion 2.0; ASRock Polychrome SYNC |
| Intel Z490 (Comet Lake)         | 3200 MHz CL16 | Full ecosystem support                            |
| Intel Z390 (Coffee Lake-R)      | 3200 MHz CL16 | Full ecosystem support                            |
| Intel Z370 (Coffee Lake)        | 3200 MHz CL16 | Full ecosystem support                            |
| Intel B560 / H570               | 3200 MHz XMP  | Full ecosystem support (B560 allows XMP)          |
| Intel B460 / H470               | JEDEC only    | XMP locked; ARGB functional; standalone rainbow mode |
| AMD X570 / B550 (AM4)           | 3200 MHz DOCP | Full ecosystem support with ARGB-capable boards   |
| AMD X470 / B450 (AM4)           | 3200 MHz DOCP | ARGB support depends on board generation; verify header |
| AMD X370 / B350 (AM4)           | 3200 MHz DOCP | Older boards may lack ARGB header; standalone rainbow mode |

> ARGB header presence and software ecosystem support depend on individual motherboard model and firmware version. Consult your motherboard documentation to verify 3-pin 5 V ARGB header availability. RGB ecosystem software (Aura Sync, RGB Fusion, Mystic Light, Polychrome SYNC) installation may be required for full per-zone color control.

---

## Regulatory Compliance

| Certification / Standard      | Status       | Scope                                              |
|-------------------------------|--------------|-----------------------------------------------------|
| JEDEC JESD79-4B               | Compliant    | DDR4 SDRAM electrical and timing standard           |
| JEDEC SPD (JESD21C Annex L)   | Compliant    | Serial Presence Detect encoding                     |
| Intel XMP 2.0                 | Certified    | Extended Memory Profile — CL16 XMP certification   |
| CE Marking (EU)               | Certified    | EMC Directive 2014/30/EU; LED and electronics       |
| UKCA Marking                  | Certified    | UK Conformity Assessed                              |
| FCC Part 15 Class B           | Certified    | US electromagnetic emissions (DRAM + LED system)   |
| RoHS 2011/65/EU               | Compliant    | Hazardous substances — PCB, LEDs, heatspreader     |
| REACH (EC) 1907/2006          | Compliant    | SVHC compliance; LED materials assessed            |
| EAC TR CU 020/2011            | Certified    | Eurasian Conformity Mark                           |
| ISO 9001                 | Certified    | TwinMOS quality management — manufacturing         |
| WEEE 2012/19/EU               | Compliant    | End-of-life collection; LED components included    |

---

## Warranty

TwinMOS Technologies provides a **Limited Lifetime Warranty** on the Concord CL16 RGB DDR4 U-DIMM Kit against defects in materials and workmanship under normal use. The warranty covers both the DRAM memory function and the RGB LED assembly as an integrated product unit. Warranty is provided to the original purchaser via authorized TwinMOS channels. The warranty does not cover: LED damage from connection to non-compatible RGB headers (4-pin 12 V headers), physical damage to the ARGB connector or cable, damage from operation at supply voltages exceeding the maximums specified in this datasheet, electrostatic discharge damage, or unauthorized modification of the module PCB, heatspreader, or LED components.

Initiate warranty claims at **support@twinmos.com** with proof of purchase, part number, and description of the defect. RGB and memory failures are both covered under the same warranty claim process.

---

## Revision History

| Revision | Date       | Author                        | Changes                                                     |
|----------|------------|-------------------------------|-------------------------------------------------------------|
| 1.0      | 2024-01-15 | TwinMOS Product Engineering   | Initial product release                                     |
| 1.1      | 2025-02-28 | TwinMOS Product Engineering   | Added RGB power budget note; expanded ARGB pin table; clarified 4-pin warning |
| 1.2      | 2026-04-30 | TwinMOS Product Engineering   | UKCA added; ARGB current spec updated; platform table expanded |

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

This datasheet is published by TwinMOS Technologies for informational purposes only. Specifications are based on engineering design targets and characterization data and are subject to change without notice. Actual performance, RGB behavior, and platform compatibility may vary based on motherboard model, BIOS version, ARGB software version, and system configuration. RGB ecosystem compatibility (Aura Sync, RGB Fusion 2.0, Mystic Light, Polychrome SYNC) is validated on representative motherboard models; compatibility cannot be guaranteed for all board revisions or future firmware updates. TwinMOS Technologies shall not be liable for any damage caused by connection of the ARGB interface to non-compatible headers. All third-party product names, trademarks, and ecosystem names are the property of their respective owners. Reproduction of this document requires prior written consent from TwinMOS Technologies.

**TwinMOS Technologies — Committed to Quality Since 1998**
*ISO 9001 Certified | CE | UKCA | FCC | RoHS | REACH | EAC | JEDEC*
