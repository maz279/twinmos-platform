---
title: "CoreX Pro M.2 PCIe Gen 5.0 NVMe SSD — Product Datasheet"
slug: "corex-pro-gen5-datasheet"
url: "/products/datasheets/corex-pro-gen5/"
template: "datasheet"
description: "Official product datasheet for the TwinMOS CoreX Pro M.2 PCIe Gen 5.0 NVMe SSD. Covers full technical specifications, performance data, interface details, ordering information, and regulatory compliance."
keywords: ["TwinMOS CoreX Pro", "PCIe Gen 5 SSD", "NVMe 2.0 SSD", "M.2 2280 SSD", "14000 MB/s SSD", "Gen5 NVMe datasheet", "NVCXP1TBG52280", "NVCXP2TBG52280", "NVCXP4TBG52280"]
persona: "engineer, system-builder, procurement"
status: published
last_reviewed: 2026-04-30
---

# Datasheet — TwinMOS CoreX Pro M.2 PCIe Gen 5.0 NVMe SSD

---

## Document Information

| Field              | Detail                                              |
|--------------------|-----------------------------------------------------|
| Document Title     | TwinMOS CoreX Pro PCIe Gen 5.0 NVMe SSD — Product Datasheet |
| Document Number    | DS-NVCXP-G5-2280-R1.0                              |
| Revision           | 1.0                                                 |
| Release Date       | 2026-04-30                                          |
| Product Line       | CoreX Pro Series                                    |
| Applicability      | NVCXP1TBG52280 / NVCXP2TBG52280 / NVCXP4TBG52280  |
| Classification     | Public                                              |
| Prepared By        | TwinMOS Product Engineering                        |
| Contact            | support@twinmos.com                                 |

---

## Product Overview

The TwinMOS CoreX Pro is the company's flagship consumer and prosumer NVMe solid-state drive, engineered to exploit the full bandwidth headroom of the PCIe 5.0 x4 interface as defined by the NVMe 2.0 specification. Built on premium Micron or SK Hynix 232-layer 3D TLC NAND and paired with an eight-channel PCIe Gen 5.0 controller, the CoreX Pro delivers sequential read throughput of up to 14,000 MB/s — making it one of the fastest commercially available M.2 drives at the time of publication. LPDDR4 DRAM cache is provisioned proportionally to drive capacity, sustaining low-latency random I/O at up to 1,500,000 IOPS in both read and write directions.

Thermal management is a first-class design consideration for drives operating at PCIe 5.0 speeds. The CoreX Pro integrates a graphene-composite thermal dissipation layer bonded directly to the PCB surface, reducing component junction temperatures under sustained workloads without requiring an externally removable heatsink in most standard deployments. The drive's power envelope peaks at approximately 10 W under full sequential load, requiring a host slot rated for the M.2 2280 high-power specification; system integrators should verify motherboard slot power delivery before deployment in thermally constrained enclosures.

Target applications include high-end desktop workstations, video editing and 3D rendering pipelines, AI/ML data-staging volumes, next-generation gaming platforms, and any environment where storage bandwidth constitutes a production bottleneck. The CoreX Pro is backward-compatible with PCIe 4.0 x4 and PCIe 3.0 x4 M.2 slots; however, maximum sequential throughput is only achieved on a native PCIe 5.0 x4 host slot. The drive ships without an external heatsink and is intended for use in motherboards or enclosures that provide adequate airflow or integrated thermal solutions.

---

## Specifications

### General Specifications

| Parameter              | Value                                                       |
|------------------------|-------------------------------------------------------------|
| Product Family         | CoreX Pro Series                                            |
| Form Factor            | M.2 2280 (22 mm × 80 mm)                                   |
| Interface              | PCIe Gen 5.0 x4                                             |
| NVMe Specification     | NVMe 2.0                                                    |
| NAND Type              | 232-layer 3D TLC NAND (Micron / SK Hynix)                  |
| Controller             | 8-channel PCIe Gen 5.0 NVMe controller                     |
| DRAM Cache             | LPDDR4, proportional to capacity (see Performance table)   |
| Thermal Solution       | Integrated graphene thermal dissipation layer               |
| Available Capacities   | 1 TB, 2 TB, 4 TB                                            |
| PCB Design             | Double-sided                                                |
| MTBF                   | > 1,800,000 hours                                           |
| Data Integrity         | End-to-end data path protection, ECC                        |
| Security               | AES 256-bit hardware encryption (TCG Opal 2.0 compatible)  |
| Wear Leveling          | Dynamic and static wear leveling                            |
| Over-Provisioning      | Factory-configured                                          |

### Electrical Specifications

| Parameter              | Value                                 |
|------------------------|---------------------------------------|
| Supply Voltage         | 3.3 V ± 5%                            |
| Active Power (Peak)    | Up to 10 W (full sequential load)     |
| Idle Power             | 50 mW (PS1)                           |
| DevSleep Power         | < 5 mW                                |
| Power Loss Protection  | Capacitor-based (power-off protection)|
| ESD Protection         | ± 2 kV (Human Body Model)            |
| M.2 Key               | M-key (2280)                          |

### Environmental Specifications

| Parameter                  | Value                             |
|----------------------------|-----------------------------------|
| Operating Temperature      | 0°C to 70°C                       |
| Storage Temperature        | -40°C to 85°C                     |
| Relative Humidity          | 5% to 95% (non-condensing)        |
| Operating Shock            | 1,500 G / 0.5 ms half-sine        |
| Non-Operating Vibration    | 20–2,000 Hz, 20 G                 |
| Altitude (Operating)       | -300 m to 3,048 m                 |
| RoHS Compliance            | Yes — RoHS Directive 2015/863/EU  |
| REACH Compliance           | Yes                               |

---

## Performance Specifications

| Capacity | Part Number       | DRAM Cache | Seq. Read   | Seq. Write  | Rand. Read     | Rand. Write    | TBW       |
|----------|-------------------|------------|-------------|-------------|----------------|----------------|-----------|
| 1 TB     | NVCXP1TBG52280    | 1 GB LPDDR4| 14,000 MB/s | 10,000 MB/s | 1,500,000 IOPS | 1,500,000 IOPS | 700 TBW   |
| 2 TB     | NVCXP2TBG52280    | 2 GB LPDDR4| 14,000 MB/s | 13,000 MB/s | 1,500,000 IOPS | 1,500,000 IOPS | 1,400 TBW |
| 4 TB     | NVCXP4TBG52280    | 4 GB LPDDR4| 14,000 MB/s | 13,000 MB/s | 1,500,000 IOPS | 1,500,000 IOPS | 2,800 TBW |

> Performance figures are measured using CrystalDiskMark 8.0 under Windows 11 with a PCIe 5.0 x4 host controller. Actual performance may vary based on host configuration, firmware revision, operating temperature, and drive fill level.

---

## Key Features

**1. PCIe Gen 5.0 x4 with NVMe 2.0 Protocol**
Operating at up to 128 GT/s aggregate lane bandwidth, the CoreX Pro saturates the PCIe 5.0 x4 link to deliver 14,000 MB/s sequential reads. NVMe 2.0 introduces enhanced namespace management, improved I/O determinism, and copy offload commands (Simple Copy) that reduce host CPU involvement in data migration tasks.

**2. 232-Layer 3D TLC NAND**
High-density 232-layer vertical NAND stacking maximises areal density and reduces the number of dies required per capacity point, lowering inter-chip signal paths and improving per-die read latency versus prior-generation 176-layer NAND. Both Micron and SK Hynix supply NAND meeting TwinMOS qualification criteria; binning is performed at the factory level.

**3. Eight-Channel Controller Architecture**
The eight-channel controller enables simultaneous access across all NAND channels, maximising internal parallelism and sustaining peak throughput even as background housekeeping tasks (garbage collection, wear levelling) execute concurrently. The controller supports NVMe Command Queuing (NCQ) with up to 64 K commands per queue and 64 K queues.

**4. LPDDR4 DRAM Cache (Capacity-Proportional)**
Dedicated LPDDR4 DRAM caches the L2P (logical-to-physical) mapping table, eliminating the DRAM bandwidth overhead that degrades random read latency in DRAM-less designs. At 1 TB, 1 GB of LPDDR4 is provisioned; at 2 TB and 4 TB, 2 GB and 4 GB respectively.

**5. Integrated Graphene Thermal Dissipation**
A graphene-composite thermal interface layer is bonded to the PCB during manufacturing. Graphene's high in-plane thermal conductivity (approximately 2,000 W/m·K) spreads heat across the board surface efficiently, reducing controller hot-spot temperatures by up to 10°C compared to bare-PCB designs under sustained loads.

**6. AES 256-Bit Hardware Encryption**
On-controller AES-256 encryption operates transparently to the host OS at full drive throughput, with no measurable performance penalty. TCG Opal 2.0 compliance enables software-based disk management through compatible security applications and enterprise management frameworks.

**7. Power Loss Protection**
An on-board capacitor array provides sufficient hold-up energy to flush in-flight write data to NAND in the event of sudden host power loss, protecting filesystem integrity and preventing partial-write data corruption.

**8. Backward Compatibility**
The CoreX Pro operates in PCIe 4.0 x4 and PCIe 3.0 x4 M.2 slots at reduced link speeds. This ensures investment protection and enables use in current-generation laptops and motherboards while providing a performance upgrade path as PCIe 5.0 platforms become mainstream.

---

## Physical Dimensions

| Parameter              | Value                                    |
|------------------------|------------------------------------------|
| Length                 | 80.00 mm                                 |
| Width                  | 22.00 mm                                 |
| Height (PCB only)      | 3.58 mm                                  |
| Height (with graphene layer) | 3.58 mm (integrated, no additional protrusion) |
| Weight                 | ~10 g                                    |
| PCB Layers             | Multi-layer (double-sided component population) |
| M.2 Key Notch          | M-key                                    |
| Mounting Hole          | Standard M.2 2280 single-screw           |

---

## Interface & Connector Details

| Parameter              | Detail                                              |
|------------------------|-----------------------------------------------------|
| Host Interface         | PCIe Gen 5.0 x4 (128 GT/s aggregate)               |
| Protocol               | NVMe 2.0                                            |
| Connector Type         | M.2 M-key (75-pin edge connector)                  |
| Lane Negotiation       | Auto-negotiation to Gen 4.0 / Gen 3.0 x4 when required |
| Command Queue Depth    | Up to 64,535 commands per queue                     |
| Max Queue Count        | Up to 64,535 queues                                 |
| Namespace Support      | Multiple namespaces (NVMe 2.0)                      |
| Power States           | PS0 (active), PS1 (idle), PS4 (DevSleep)           |

---

## Ordering Information

| Capacity | Part Number        | Description                                          | EAN / Barcode     |
|----------|--------------------|------------------------------------------------------|-------------------|
| 1 TB     | NVCXP1TBG52280     | CoreX Pro 1TB M.2 2280 PCIe Gen 5.0 NVMe SSD        | Contact TwinMOS   |
| 2 TB     | NVCXP2TBG52280     | CoreX Pro 2TB M.2 2280 PCIe Gen 5.0 NVMe SSD        | Contact TwinMOS   |
| 4 TB     | NVCXP4TBG52280     | CoreX Pro 4TB M.2 2280 PCIe Gen 5.0 NVMe SSD        | Contact TwinMOS   |

For volume pricing, OEM/ODM configurations, or region-specific packaging variants, contact sales@twinmos.com.

---

## Endurance & Reliability

| Parameter                  | 1 TB              | 2 TB              | 4 TB              |
|----------------------------|-------------------|-------------------|-------------------|
| TBW (Terabytes Written)    | 700 TBW           | 1,400 TBW         | 2,800 TBW         |
| MTBF                       | > 1,800,000 hours | > 1,800,000 hours | > 1,800,000 hours |
| Uncorrectable Bit Error Rate (UBER) | < 1 in 10¹⁷ bits read | < 1 in 10¹⁷ bits read | < 1 in 10¹⁷ bits read |
| Data Retention (powered-off) | > 1 year at 30°C (per JEDEC JESD47) | > 1 year | > 1 year |
| ECC Technology             | LDPC (Low Density Parity Check)                   |
| Bad Block Management       | Dynamic bad block remapping                       |
| Over-Provisioning          | Factory-configured (NAND:user ratio)             |

TBW values are estimated based on JEDEC workload definitions and internal qualification testing. Actual endurance may vary with workload composition. Drives exceeding TBW remain operational; TBW is an endurance reference metric, not a hard shutdown threshold.

---

## Platform Compatibility

| Platform                   | Minimum Requirement                        | Notes                               |
|----------------------------|--------------------------------------------|-------------------------------------|
| Intel Desktop              | Intel 12th Gen (Alder Lake) or later       | Full PCIe 5.0 performance on Z690+  |
| Intel Laptop               | Intel 12th Gen mobile or later             | Verify slot power rating (≥ 10 W)  |
| AMD Desktop                | AMD Ryzen 7000 series (AM5 socket)         | PCIe 5.0 M.2 slot required         |
| AMD Laptop                 | AMD Ryzen 7040 / 8040 series or later      | Platform-dependent slot assignment  |
| PlayStation / Console      | Not applicable                             | Desktop/workstation use only        |
| PCIe 4.0 Host (fallback)   | Any PCIe 4.0 x4 M.2 slot                  | Operates at up to ~7,000 MB/s       |
| PCIe 3.0 Host (fallback)   | Any PCIe 3.0 x4 M.2 slot                  | Operates at up to ~3,500 MB/s       |
| OS Support                 | Windows 10/11 (64-bit), Linux kernel 5.15+, macOS (via Thunderbolt adapter, unofficial) | |

> Note: PCIe 5.0 M.2 slot availability and power delivery varies by motherboard SKU. Verify your motherboard's M.2 slot specifications before installation.

---

## Regulatory Compliance

| Certification              | Standard / Directive                        | Territory          |
|----------------------------|---------------------------------------------|--------------------|
| CE Marking                 | EMC Directive 2014/30/EU                    | European Union     |
| FCC                        | FCC Part 15 Class B                         | United States      |
| UKCA                       | UK EMC Regulations 2016                     | United Kingdom     |
| EAC                        | TR CU 020/2011                              | Eurasian Economic Union |
| RoHS                       | EU Directive 2015/863/EU (RoHS 3)           | European Union     |
| REACH                      | REACH Regulation (EC) No 1907/2006          | European Union     |
| ISO 9001              | Quality Management System                   | Manufacturing (TwinMOS) |

---

## Warranty

TwinMOS Technologies warrants the CoreX Pro M.2 PCIe Gen 5.0 NVMe SSD against defects in materials and workmanship for a period of **5 (five) years** from the date of original retail purchase, subject to the following conditions:

- The warranty is valid provided the drive has not exceeded its rated TBW endurance rating.
- Physical damage, electrostatic discharge damage, liquid ingress, or evidence of unauthorised modification voids the warranty.
- Warranty service is provided via the authorised TwinMOS regional distributor or directly through TwinMOS support channels.
- Data recovery is not included within the warranty scope. Users should maintain independent backups of critical data.

To initiate a warranty claim: support@twinmos.com | www.twinmos.com/support

---

## Revision History

| Revision | Date       | Author                        | Changes                          |
|----------|------------|-------------------------------|----------------------------------|
| 1.0      | 2026-04-30 | TwinMOS Product Engineering   | Initial release                  |

---

## Contact Information

| Department         | Contact                        |
|--------------------|--------------------------------|
| Technical Support  | support@twinmos.com            |
| Sales & Procurement| sales@twinmos.com              |
| Website            | www.twinmos.com                |
| Headquarters       | Dubai Airport Free Zone (DAFZA), Dubai, UAE |
| Regional Office    | Taipei, Taiwan                 |

---

## Disclaimer

The specifications, performance figures, and feature descriptions contained in this document are provided for informational purposes and reflect TwinMOS Technologies' best knowledge at the time of publication. TwinMOS Technologies reserves the right to modify product specifications, part numbers, pricing, and availability without prior notice. Performance measurements are obtained under controlled laboratory conditions using specific test configurations; actual performance in end-user systems may differ due to host hardware, firmware version, system load, operating environment, and other variables.

TwinMOS Technologies makes no warranty, express or implied, regarding the accuracy or completeness of the information in this document. All trademarks referenced herein are the property of their respective owners. This document is intended for professional and technical audiences. TwinMOS Technologies shall not be liable for any loss of data; users are solely responsible for maintaining adequate data backups.

&copy; 2026 TwinMOS Technologies. All rights reserved. Unauthorized reproduction or distribution of this document is prohibited.
