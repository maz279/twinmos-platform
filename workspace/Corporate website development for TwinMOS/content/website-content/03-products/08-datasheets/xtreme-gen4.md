---
title: "Xtreme M.2 PCIe Gen 4.0 NVMe SSD — Product Datasheet"
slug: "xtreme-gen4-datasheet"
url: "/products/datasheets/xtreme-gen4/"
template: "datasheet"
description: "Official product datasheet for the TwinMOS Xtreme M.2 PCIe Gen 4.0 NVMe SSD. Covers full technical specifications, performance data by capacity, interface details, PS5 compatibility, ordering information, and regulatory compliance."
keywords: ["TwinMOS Xtreme", "PCIe Gen 4 SSD", "NVMe 1.4 SSD", "M.2 2280 SSD", "7500 MB/s SSD", "Gen4 NVMe datasheet", "PS5 SSD", "NV1TBG42280v", "NV2TBG42280"]
persona: "engineer, gamer, system-builder, procurement"
status: published
last_reviewed: 2026-04-30
---

# Datasheet — TwinMOS Xtreme M.2 PCIe Gen 4.0 NVMe SSD

---

## Document Information

| Field              | Detail                                               |
|--------------------|------------------------------------------------------|
| Document Title     | TwinMOS Xtreme PCIe Gen 4.0 NVMe SSD — Product Datasheet |
| Document Number    | DS-NVXT-G4-2280-R1.0                                 |
| Revision           | 1.0                                                  |
| Release Date       | 2026-04-30                                           |
| Product Line       | Xtreme Series                                        |
| Applicability      | 512 GB / NV1TBG42280v (1 TB) / NV2TBG42280 (2 TB)  |
| Classification     | Public                                               |
| Prepared By        | TwinMOS Product Engineering                         |
| Contact            | support@twinmos.com                                  |

---

## Product Overview

The TwinMOS Xtreme is a high-performance M.2 NVMe solid-state drive targeting mainstream gaming PCs, creative workstations, and console upgrades on the PlayStation 5 platform. Operating over PCIe Gen 4.0 x4 with the NVMe 1.4 protocol, the Xtreme achieves sequential read throughput of up to 7,500 MB/s and sequential write throughput of up to 6,800 MB/s — approximately twice the bandwidth ceiling of PCIe 3.0 x4 drives. The drive employs a Silicon Motion (SMI) Gen 4 controller paired with Micron or SK Hynix 3D TLC NAND, a combination selected to balance peak throughput with sustained workload consistency and long-term endurance.

Cache architecture is capacity-dependent to optimise cost-to-performance ratios across the product line. The 2 TB model is equipped with 2 GB of LPDDR4 DRAM for full random I/O mapping, while the 512 GB and 1 TB models utilise a DRAM-less design with Host Memory Buffer (HMB), which leverages a small portion of host system DRAM (typically 64 MB) via the NVMe HMB command for L2P table caching. HMB-based designs deliver random read latency competitive with DRAM-equipped drives in typical mixed-workload scenarios at lower BOM cost, making the Xtreme an attractive value proposition in the 512 GB and 1 TB capacity points.

A graphene thermal heatsink is included in the retail package for all capacity variants. The heatsink is specifically dimensioned for PlayStation 5 slot compatibility (PS5 M.2 bay clearance) and is required for PS5 installation per Sony's guidelines. Desktop and laptop users may install with or without the heatsink depending on platform thermal provisions. The Xtreme carries full FCC, CE, UKCA, EAC, RoHS, and REACH certifications and is backed by a 3-year TwinMOS warranty.

---

## Specifications

### General Specifications

| Parameter              | Value                                                         |
|------------------------|---------------------------------------------------------------|
| Product Family         | Xtreme Series                                                 |
| Form Factor            | M.2 2280 (22 mm × 80 mm)                                     |
| Interface              | PCIe Gen 4.0 x4                                               |
| NVMe Specification     | NVMe 1.4                                                      |
| NAND Type              | 3D TLC NAND (Micron / SK Hynix)                              |
| Controller             | Silicon Motion (SMI) PCIe Gen 4.0 NVMe controller           |
| DRAM Cache             | 512 GB / 1 TB: DRAM-less with HMB; 2 TB: 2 GB LPDDR4        |
| Heatsink               | Graphene thermal heatsink (included, PS5-compatible)          |
| Available Capacities   | 512 GB, 1 TB, 2 TB                                            |
| PCB Design             | Double-sided                                                   |
| MTBF                   | > 1,000,000 hours                                             |
| Data Integrity         | End-to-end data path protection, LDPC ECC                    |
| Security               | AES 256-bit hardware encryption                               |
| Wear Leveling          | Dynamic and static wear leveling                              |
| HMB Support            | Yes (512 GB / 1 TB models; host allocates up to 64 MB DRAM)  |

### Electrical Specifications

| Parameter              | Value                                    |
|------------------------|------------------------------------------|
| Supply Voltage         | 3.3 V ± 5%                               |
| Active Power (Peak)    | ~6.5 W (full sequential load)            |
| Idle Power (PS1)       | 50 mW                                    |
| DevSleep Power (PS4)   | 5 mW                                     |
| ESD Protection         | ± 2 kV (Human Body Model)               |
| M.2 Key               | M-key (2280)                             |

### Environmental Specifications

| Parameter                  | Value                              |
|----------------------------|------------------------------------|
| Operating Temperature      | 0°C to 70°C                        |
| Storage Temperature        | -40°C to 85°C                      |
| Relative Humidity          | 5% to 95% (non-condensing)         |
| Operating Shock            | 1,500 G / 0.5 ms half-sine         |
| Non-Operating Vibration    | 20–2,000 Hz, 20 G                  |
| Altitude (Operating)       | -300 m to 3,048 m                  |
| RoHS Compliance            | Yes                                |
| REACH Compliance           | Yes                                |

---

## Performance Specifications

| Capacity | Part Number       | DRAM Config        | Seq. Read   | Seq. Write  | Rand. Read     | Rand. Write    | TBW      |
|----------|-------------------|--------------------|-------------|-------------|----------------|----------------|----------|
| 512 GB   | —                 | DRAM-less + HMB    | 7,500 MB/s  | 6,000 MB/s  | 750,000 IOPS   | 650,000 IOPS   | 300 TBW  |
| 1 TB     | NV1TBG42280v      | DRAM-less + HMB    | 7,500 MB/s  | 6,800 MB/s  | 750,000 IOPS   | 680,000 IOPS   | 600 TBW  |
| 2 TB     | NV2TBG42280       | 2 GB LPDDR4        | 7,500 MB/s  | 6,800 MB/s  | 750,000 IOPS   | 680,000 IOPS   | 1,200 TBW|

> Performance figures are measured using CrystalDiskMark 8.0 under Windows 11 with a PCIe 4.0 x4 host controller. Random I/O IOPS are measured at queue depth 32, thread count 16. Actual performance may vary based on host configuration, firmware revision, thermal state, and drive fill level.

---

## Key Features

**1. PCIe Gen 4.0 x4 — Mainstream High-Performance Interface**
PCIe 4.0 x4 doubles the lane bandwidth of PCIe 3.0 x4, enabling 7,500 MB/s sequential reads that reduce large-file transfer times, game level load times, and video scrubbing latencies by up to 2x versus prior-generation drives. The NVMe 1.4 protocol adds persistent memory regions, enhanced power management states, and improved queue arbitration over NVMe 1.3.

**2. Silicon Motion (SMI) Gen 4 Controller**
The SMI controller delivers high-parallelism NAND channel management with robust background housekeeping algorithms. SMI's firmware implements adaptive thermal throttling, real-time bad-block scanning, and predictive wear-levelling policies that maintain consistent throughput across the drive's rated lifespan.

**3. Flexible Cache Architecture (DRAM / HMB by Capacity)**
The 2 TB model's dedicated 2 GB LPDDR4 DRAM provides the lowest random read latency (sub-100 µs in typical conditions). The 512 GB and 1 TB models use HMB to reduce BOM cost while retaining competitive random I/O latency: the NVMe controller requests a host-side memory allocation (typically 64 MB) that caches the frequently accessed portion of the L2P mapping table, avoiding the full NAND lookup penalty of cacheless designs.

**4. PS5 Compatible with Included Graphene Heatsink**
Sony requires that aftermarket M.2 SSDs installed in PlayStation 5 include a heatsink. The included graphene thermal heatsink fits within the PS5 M.2 slot height clearance and satisfies Sony's installation requirements without modification. The Xtreme's PCIe 4.0 x4 interface is natively supported by the PS5's M.2 expansion slot (PCIe 4.0 x4 NVMe).

**5. 3D TLC NAND for Density and Endurance**
Three-dimensional TLC NAND stacks multiple cell layers vertically, increasing capacity per die while maintaining cell-to-cell isolation superior to planar NAND. Combined with LDPC error correction, the Xtreme achieves an uncorrectable bit error rate (UBER) of less than 1 in 10¹⁷ bits read.

**6. AES 256-Bit Hardware Encryption**
Full-disk AES-256 encryption is performed entirely within the controller with no host CPU overhead and no measurable impact on sustained throughput. Users managing sensitive data can activate drive-level encryption through OS-level tools (BitLocker on Windows, FileVault on macOS with adapter, dm-crypt on Linux).

**7. DevSleep Low-Power State**
At 5 mW in DevSleep (PS4) mode, the Xtreme is suitable for battery-operated laptops and ultrabooks where storage idle power directly impacts battery runtime. Transition from DevSleep to active state is managed by the NVMe power state machine with minimal host-visible latency.

**8. Backward Compatibility with PCIe 3.0**
The Xtreme auto-negotiates to PCIe 3.0 x4 on older platforms, delivering up to approximately 3,500 MB/s sequential read — still a significant improvement over SATA 6 Gbps. This ensures compatibility with systems predating PCIe 4.0 while providing a clear upgrade benefit as hosts are refreshed.

---

## Physical Dimensions

| Parameter              | Value                                             |
|------------------------|---------------------------------------------------|
| Length                 | 80.00 mm                                          |
| Width                  | 22.00 mm                                          |
| Height (without heatsink) | 2.38 mm                                        |
| Height (with heatsink) | Varies by heatsink; refer to heatsink datasheet  |
| Weight (drive only)    | ~9 g                                              |
| PCB Design             | Double-sided                                      |
| M.2 Key Notch          | M-key                                             |
| Mounting Hole          | Standard M.2 2280 single-screw                    |

---

## Interface & Connector Details

| Parameter              | Detail                                              |
|------------------------|-----------------------------------------------------|
| Host Interface         | PCIe Gen 4.0 x4 (64 GT/s aggregate)                |
| Protocol               | NVMe 1.4                                            |
| Connector Type         | M.2 M-key (75-pin edge connector)                  |
| Lane Negotiation       | Auto-negotiation to Gen 3.0 x4                     |
| HMB                    | Supported (512 GB / 1 TB); host allocates DRAM page |
| Command Queue Depth    | Up to 64,535 commands per queue                     |
| Max Queue Count        | Up to 64,535 queues                                 |
| Power States           | PS0 (active), PS1 (idle), PS4 (DevSleep, 5 mW)    |

---

## Ordering Information

| Capacity | Part Number       | Description                                           | PS5 Compatible |
|----------|-------------------|-------------------------------------------------------|----------------|
| 512 GB   | (contact TwinMOS) | Xtreme 512GB M.2 2280 PCIe Gen 4.0 NVMe SSD          | Yes            |
| 1 TB     | NV1TBG42280v      | Xtreme 1TB M.2 2280 PCIe Gen 4.0 NVMe SSD            | Yes            |
| 2 TB     | NV2TBG42280       | Xtreme 2TB M.2 2280 PCIe Gen 4.0 NVMe SSD (2 GB DRAM)| Yes            |

Heatsink is included with all retail units. For OEM configurations (drive only, no heatsink), bulk orders, or custom packaging, contact sales@twinmos.com.

---

## Endurance & Reliability

| Parameter                       | 512 GB            | 1 TB              | 2 TB               |
|---------------------------------|-------------------|-------------------|--------------------|
| TBW (Terabytes Written)         | 300 TBW           | 600 TBW           | 1,200 TBW          |
| MTBF                            | > 1,000,000 hours | > 1,000,000 hours | > 1,000,000 hours  |
| UBER                            | < 1 in 10¹⁷ bits  | < 1 in 10¹⁷ bits  | < 1 in 10¹⁷ bits   |
| Data Retention (powered-off)    | > 1 year at 30°C  | > 1 year at 30°C  | > 1 year at 30°C   |
| ECC Technology                  | LDPC              | LDPC              | LDPC               |
| Bad Block Management            | Dynamic remapping | Dynamic remapping | Dynamic remapping  |

---

## Platform Compatibility

| Platform                    | Compatibility | Notes                                          |
|-----------------------------|---------------|------------------------------------------------|
| PlayStation 5 (M.2 bay)     | Yes           | Heatsink included; PCIe 4.0 x4 NVMe required  |
| Intel 11th Gen (Rocket Lake) | Yes           | PCIe 4.0 x4 on Z590 motherboards              |
| Intel 12th Gen+ (Alder Lake+)| Yes           | Full PCIe 4.0 support on Z690/B660+            |
| AMD Ryzen 5000 (Zen 3)      | Yes           | PCIe 4.0 x4 M.2 on B550/X570 and later        |
| AMD Ryzen 7000 (Zen 4)      | Yes           | PCIe 5.0 host, operates at PCIe 4.0 speeds    |
| Intel 10th Gen / AMD Ryzen 3000 | Yes (fallback) | Auto-negotiates to PCIe 3.0 x4            |
| Windows 11 / 10 (64-bit)    | Yes           | NVMe driver included in OS                     |
| Linux (kernel 4.15+)        | Yes           | nvme kernel module                             |
| macOS                       | Partial       | Via compatible Thunderbolt 4 NVMe enclosure    |

---

## Regulatory Compliance

| Certification | Standard / Directive                     | Territory              |
|---------------|------------------------------------------|------------------------|
| FCC           | FCC Part 15 Class B                      | United States          |
| CE            | EMC Directive 2014/30/EU                 | European Union         |
| UKCA          | UK EMC Regulations 2016                  | United Kingdom         |
| EAC           | TR CU 020/2011                           | Eurasian Economic Union|
| RoHS          | EU Directive 2015/863/EU (RoHS 3)        | European Union         |
| REACH         | Regulation (EC) No 1907/2006             | European Union         |
| ISO 9001 | Quality Management System                | TwinMOS Manufacturing  |

---

## Warranty

TwinMOS Technologies warrants the Xtreme M.2 PCIe Gen 4.0 NVMe SSD against defects in materials and workmanship for a period of **3 (three) years** from the date of original retail purchase, subject to the following conditions:

- Warranty is void if the drive TBW endurance rating has been exceeded.
- Physical damage, liquid ingress, electrostatic discharge damage, or evidence of unauthorised modification voids the warranty.
- Warranty claims are handled through TwinMOS-authorised regional distributors or via direct TwinMOS support.
- Data recovery is not covered; users must maintain independent backups.

To initiate a warranty claim: support@twinmos.com | www.twinmos.com/support

---

## Revision History

| Revision | Date       | Author                      | Changes          |
|----------|------------|-----------------------------|------------------|
| 1.0      | 2026-04-30 | TwinMOS Product Engineering | Initial release  |

---

## Contact Information

| Department         | Contact                                          |
|--------------------|--------------------------------------------------|
| Technical Support  | support@twinmos.com                              |
| Sales & Procurement| sales@twinmos.com                                |
| Website            | www.twinmos.com                                  |
| Headquarters       | Dubai Airport Free Zone (DAFZA), Dubai, UAE      |
| Regional Office    | Taipei, Taiwan                                   |

---

## Disclaimer

The specifications, performance figures, and feature descriptions contained in this document are provided for informational purposes and reflect TwinMOS Technologies' best knowledge at the time of publication. TwinMOS Technologies reserves the right to modify product specifications, part numbers, pricing, and availability without prior notice. Performance measurements are obtained under controlled laboratory conditions using specific test configurations; actual performance in end-user systems may differ.

"PlayStation" and "PS5" are registered trademarks of Sony Interactive Entertainment Inc. TwinMOS Technologies has no affiliation with Sony Interactive Entertainment Inc. PS5 compatibility is based on publicly available Sony hardware specifications.

TwinMOS Technologies shall not be liable for any loss of data; users are solely responsible for maintaining adequate data backups. All trademarks referenced herein are the property of their respective owners.

&copy; 2026 TwinMOS Technologies. All rights reserved. Unauthorized reproduction or distribution of this document is prohibited.
