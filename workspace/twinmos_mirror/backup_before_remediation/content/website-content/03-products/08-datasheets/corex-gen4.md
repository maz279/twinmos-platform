---
title: "CoreX M.2 PCIe Gen 4.0 NVMe SSD — Product Datasheet"
slug: "corex-gen4-datasheet"
url: "/products/datasheets/corex-gen4/"
template: "datasheet"
description: "Official product datasheet for the TwinMOS CoreX M.2 PCIe Gen 4.0 NVMe SSD. Single-sided PCB design optimised for slim laptops and compact platforms. Covers full technical specifications, performance data, interface details, ordering information, and regulatory compliance."
keywords: ["TwinMOS CoreX", "PCIe Gen 4 SSD", "NVMe 1.4 SSD", "M.2 2280 single-sided SSD", "slim laptop SSD", "5000 MB/s SSD", "NVCX1TBG42280", "HMB SSD", "DRAM-less Gen4"]
persona: "engineer, laptop-user, system-integrator, procurement"
status: published
last_reviewed: 2026-04-30
---

# Datasheet — TwinMOS CoreX M.2 PCIe Gen 4.0 NVMe SSD

---

## Document Information

| Field              | Detail                                              |
|--------------------|-----------------------------------------------------|
| Document Title     | TwinMOS CoreX PCIe Gen 4.0 NVMe SSD — Product Datasheet |
| Document Number    | DS-NVCX-G4-2280-R1.0                               |
| Revision           | 1.0                                                 |
| Release Date       | 2026-04-30                                          |
| Product Line       | CoreX Series                                        |
| Applicability      | NVCX1TBG42280 (1 TB)                               |
| Classification     | Public                                              |
| Prepared By        | TwinMOS Product Engineering                        |
| Contact            | support@twinmos.com                                 |

---

## Product Overview

The TwinMOS CoreX is a PCIe Gen 4.0 x4 NVMe SSD engineered specifically around the physical and thermal constraints of ultra-thin laptops, small-form-factor desktop builds, and embedded computing platforms. Its defining characteristic is a single-sided PCB layout — all NAND flash packages and the NVMe controller are populated on one face of the board, reducing the assembled height to 2.15 mm and ensuring compatibility with M.2 socket designs that impose strict component clearance requirements on the reverse side. This makes the CoreX a primary specification target for OEM laptop platforms and upgraders replacing factory-fitted drives in thin-and-light notebooks where double-sided M.2 drives may not physically seat.

Internally, the CoreX pairs a low-power PCIe Gen 4.0 NVMe controller with 3D TLC NAND and implements Host Memory Buffer (HMB) caching in place of dedicated DRAM. HMB allows the drive controller to request a small allocation of host system DRAM (typically up to 64 MB) via the NVMe specification for use as an L2P (logical-to-physical) mapping cache. This approach eliminates the power draw and PCB area of a discrete DRAM package while retaining most of the random read performance benefit over fully cacheless designs. Active power consumption is rated at approximately 4.5 W — notably lower than competing DRAM-equipped Gen 4 drives — and idle draw is just 30 mW, contributing to longer system battery life.

The CoreX is positioned as the mainstream PCIe 4.0 option within the TwinMOS portfolio, delivering 5,000 MB/s sequential reads that represent a tangible upgrade from PCIe 3.0 drives while avoiding the power and thermal demands of top-tier Gen 4 or Gen 5 products. Its MTBF rating of greater than 1,500,000 hours and a 600 TBW endurance rating for the 1 TB capacity reflect the use of high-quality NAND and a conservative over-provisioning strategy. The CoreX is certified to CE, FCC, RoHS, and REACH standards and carries a 3-year TwinMOS warranty.

---

## Specifications

### General Specifications

| Parameter              | Value                                                    |
|------------------------|----------------------------------------------------------|
| Product Family         | CoreX Series                                             |
| Form Factor            | M.2 2280 (22 mm × 80 mm)                                |
| PCB Design             | Single-sided (all components on one face)               |
| Interface              | PCIe Gen 4.0 x4                                          |
| NVMe Specification     | NVMe 1.4                                                 |
| NAND Type              | 3D TLC NAND                                              |
| Controller             | Low-power PCIe Gen 4.0 NVMe controller                  |
| DRAM Cache             | None (DRAM-less design)                                  |
| HMB Support            | Yes — Host Memory Buffer per NVMe 1.4 specification     |
| Available Capacities   | 1 TB                                                     |
| MTBF                   | > 1,500,000 hours                                        |
| Data Integrity         | End-to-end data path protection, LDPC ECC               |
| Security               | AES 256-bit hardware encryption                          |
| Wear Leveling          | Dynamic and static wear leveling                         |
| Over-Provisioning      | Factory-configured                                       |

### Electrical Specifications

| Parameter              | Value                             |
|------------------------|-----------------------------------|
| Supply Voltage         | 3.3 V ± 5%                        |
| Active Power (Peak)    | ~4.5 W (full sequential load)     |
| Idle Power (PS1)       | 30 mW                             |
| DevSleep Power (PS4)   | 3 mW                              |
| ESD Protection         | ± 2 kV (Human Body Model)        |
| M.2 Key               | M-key (2280)                      |

### Environmental Specifications

| Parameter                  | Value                              |
|----------------------------|------------------------------------|
| Operating Temperature      | 0°C to 70°C                        |
| Storage Temperature        | -40°C to 85°C                      |
| Relative Humidity          | 5% to 95% (non-condensing)         |
| Operating Shock            | 1,500 G / 0.5 ms half-sine         |
| Non-Operating Vibration    | 20–2,000 Hz, 20 G (non-operating)  |
| Altitude (Operating)       | -300 m to 3,048 m                  |
| RoHS Compliance            | Yes                                |
| REACH Compliance           | Yes                                |

---

## Performance Specifications

| Capacity | Part Number    | DRAM Config     | Seq. Read   | Seq. Write  | Rand. Read          | Rand. Write         | TBW     |
|----------|----------------|-----------------|-------------|-------------|---------------------|---------------------|---------|
| 1 TB     | NVCX1TBG42280  | DRAM-less + HMB | 5,000 MB/s  | 4,800 MB/s  | ~500,000 IOPS (est.)| ~450,000 IOPS (est.)| 600 TBW |

> Sequential performance measured using CrystalDiskMark 8.0 under Windows 11 with a PCIe 4.0 x4 host. Random I/O figures are estimated based on controller specifications and internal qualification testing at QD32/T16. The notation "(est.)" indicates these are engineering estimates; independently verified IOPS figures will be updated in a subsequent revision.
>
> HMB allocation is negotiated at drive initialization; host must have available DRAM. Random read latency with HMB is higher than with dedicated DRAM under cache-miss conditions.

---

## Key Features

**1. Single-Sided PCB — Slim Laptop Optimised**
By populating all active components on one PCB face, the CoreX achieves an assembled height of only 2.15 mm. Many ultra-thin laptop designs (particularly 13"–15" form factors from major OEM brands) specify that the M.2 2280 slot will only accept single-sided drives due to structural or thermal provisions on the motherboard directly beneath the socket. The CoreX is designed to meet these OEM clearance requirements without performance compromise.

**2. PCIe Gen 4.0 x4 — Significant Laptop Upgrade Path**
For users upgrading from factory-fitted PCIe 3.0 x4 drives, the CoreX's 5,000 MB/s sequential read rating represents up to 50% higher sustained read bandwidth, reducing OS boot times, application launch times, and file copy durations. PCIe 4.0 x4 is supported natively on Intel 11th Gen and later and AMD Ryzen 5000 and later mobile platforms.

**3. HMB (Host Memory Buffer) Caching**
Under NVMe 1.4, the drive controller negotiates an allocation from host system DRAM for use as a mapping cache. The CoreX requests up to 64 MB from the host. When the accessed LBA range fits within the HMB-cached portion of the L2P table, random read latency is comparable to DRAM-equipped drives. HMB imposes no additional PCB footprint, DRAM component cost, or idle power overhead.

**4. Low Active Power (4.5 W) and Ultra-Low Idle (30 mW)**
At a peak draw of approximately 4.5 W — approximately 2 W below top-tier Gen 4 competitors — the CoreX generates less heat under sustained loads, reducing controller thermal throttle events in constrained laptop chassis. At 30 mW idle, storage represents a negligible fraction of total system idle power, and at 3 mW DevSleep, the drive is effectively quiescent during display-off or connected-standby states.

**5. LDPC Error Correction for TLC NAND**
Low Density Parity Check (LDPC) error correction is implemented in hardware within the controller, providing correction capability sufficient for the higher raw bit error rates of TLC NAND versus SLC or MLC. This protects data integrity over the drive's rated life and contributes to the > 1,500,000 hour MTBF figure.

**6. AES 256-Bit Hardware Encryption**
Full-disk AES-256 encryption executes in the controller datapath with no measurable throughput degradation. The CoreX supports OS-managed encryption workflows including Windows BitLocker (when configured for hardware encryption mode) and Linux dm-crypt/LUKS.

**7. Backward Compatibility with PCIe 3.0**
The CoreX negotiates to PCIe 3.0 x4 on hosts that do not support PCIe 4.0, delivering up to approximately 3,500 MB/s sequential read. Users on Intel 10th Gen, AMD Ryzen 3000, or similar PCIe 3.0 platforms can install the CoreX and benefit from its capacity, endurance, and single-sided form factor while retaining the option for higher performance if they later migrate to a PCIe 4.0 host.

**8. 600 TBW Endurance at 1 TB**
A 600 TBW rating means the drive is warranted to sustain 600 terabytes of host writes over its service life — equivalent to writing approximately 329 GB per day for 5 years. This comfortably exceeds typical consumer and light prosumer workloads, which commonly generate 20–100 GB/day of NAND writes.

---

## Physical Dimensions

| Parameter                  | Value                                     |
|----------------------------|-------------------------------------------|
| Length                     | 80.00 mm                                  |
| Width                      | 22.00 mm                                  |
| Height (PCB, single-sided) | 2.15 mm                                   |
| Weight                     | ~7 g                                      |
| PCB Design                 | Single-sided (reverse side component-free)|
| M.2 Key Notch              | M-key                                     |
| Mounting Hole              | Standard M.2 2280 single-screw            |
| Heatsink Included          | No (heatsink not included in retail kit)  |

> The 2.15 mm height makes the CoreX compatible with the majority of M.2 socket designs that impose a 2.38 mm or greater clearance requirement on the component side. Verify host slot clearance requirements before installation in embedded or industrial platforms.

---

## Interface & Connector Details

| Parameter              | Detail                                                |
|------------------------|-------------------------------------------------------|
| Host Interface         | PCIe Gen 4.0 x4 (64 GT/s aggregate)                  |
| Protocol               | NVMe 1.4                                              |
| Connector Type         | M.2 M-key (75-pin edge connector)                    |
| Lane Negotiation       | Auto-negotiation to Gen 3.0 x4                       |
| HMB                    | Supported; host must have available DRAM              |
| Command Queue Depth    | Up to 64,535 commands per queue                       |
| Max Queue Count        | Up to 64,535 queues                                   |
| Power States           | PS0 (active), PS1 (idle, 30 mW), PS4 (DevSleep, 3 mW)|

---

## Ordering Information

| Capacity | Part Number       | Description                                               |
|----------|-------------------|-----------------------------------------------------------|
| 1 TB     | NVCX1TBG42280     | CoreX 1TB M.2 2280 PCIe Gen 4.0 NVMe SSD (Single-Sided)  |

Currently available as a 1 TB single capacity point. Additional capacities may be introduced in future product revisions. For volume pricing, OEM configurations, or procurement inquiries, contact sales@twinmos.com.

---

## Endurance & Reliability

| Parameter                       | 1 TB                 |
|---------------------------------|----------------------|
| TBW (Terabytes Written)         | 600 TBW              |
| MTBF                            | > 1,500,000 hours    |
| UBER                            | < 1 in 10¹⁷ bits read |
| Data Retention (powered-off)    | > 1 year at 30°C (JEDEC JESD47) |
| ECC Technology                  | LDPC (hardware)      |
| Bad Block Management            | Dynamic remapping    |
| Wear Leveling                   | Dynamic + static     |

The 600 TBW rating is derived from JEDEC-standard workload qualification testing. Workloads with a higher proportion of random writes versus sequential writes may consume TBW at a higher rate than JEDEC modelling assumes. Drive S.M.A.R.T. attribute 232 (Endurance Remaining) provides a real-time TBW consumption indicator accessible through standard NVMe management utilities.

---

## Platform Compatibility

| Platform                            | Compatibility     | Notes                                               |
|-------------------------------------|-------------------|-----------------------------------------------------|
| Ultra-thin laptops (single-sided M.2)| Primary target   | 2.15 mm height meets strict OEM clearance specs     |
| Intel 11th Gen mobile (Tiger Lake)   | Yes              | PCIe 4.0 x4 M.2 slot                               |
| Intel 12th Gen+ mobile (Alder Lake+) | Yes              | Full PCIe 4.0 support                               |
| AMD Ryzen 5000 mobile (Zen 3)        | Yes              | PCIe 4.0 x4 NVMe                                   |
| AMD Ryzen 7000 mobile (Zen 4)        | Yes              | PCIe 5.0 slot, operates at PCIe 4.0 x4             |
| Intel 10th Gen / AMD Ryzen 3000      | Yes (fallback)   | PCIe 3.0 x4 speeds (~3,500 MB/s)                   |
| PlayStation 5                        | Not recommended  | PS5 bay designed for double-sided drives with heatsink; use Xtreme instead |
| Windows 10 / 11 (64-bit)             | Yes              | Native NVMe driver                                  |
| Linux (kernel 4.15+)                 | Yes              | nvme kernel module                                  |
| macOS                                | Partial          | Via Thunderbolt 4 NVMe enclosure (unofficial)       |

---

## Regulatory Compliance

| Certification | Standard / Directive                       | Territory          |
|---------------|--------------------------------------------|--------------------|
| CE            | EMC Directive 2014/30/EU                   | European Union     |
| FCC           | FCC Part 15 Class B                        | United States      |
| RoHS          | EU Directive 2015/863/EU (RoHS 3)          | European Union     |
| REACH         | Regulation (EC) No 1907/2006              | European Union     |
| ISO 9001:2015 | Quality Management System                  | TwinMOS Manufacturing |

---

## Warranty

TwinMOS Technologies warrants the CoreX M.2 PCIe Gen 4.0 NVMe SSD against defects in materials and workmanship for a period of **3 (three) years** from the date of original retail purchase, subject to the following conditions:

- Warranty is void if the drive TBW endurance rating has been exceeded as reported by S.M.A.R.T. attributes.
- Physical damage, liquid ingress, electrostatic discharge, or evidence of unauthorised modification voids the warranty.
- Warranty service is provided via TwinMOS-authorised regional distributors or directly through TwinMOS support.
- Data recovery is not included within the warranty scope. Users must maintain independent backups of critical data at all times.

To initiate a warranty claim: support@twinmos.com | www.twinmos.com/support

---

## Revision History

| Revision | Date       | Author                      | Changes                                       |
|----------|------------|-----------------------------|-----------------------------------------------|
| 1.0      | 2026-04-30 | TwinMOS Product Engineering | Initial release; random IOPS marked estimated |

---

## Contact Information

| Department         | Contact                                         |
|--------------------|-------------------------------------------------|
| Technical Support  | support@twinmos.com                             |
| Sales & Procurement| sales@twinmos.com                               |
| Website            | www.twinmos.com                                 |
| Headquarters       | Dubai Airport Free Zone (DAFZA), Dubai, UAE     |
| Regional Office    | Taipei, Taiwan                                  |

---

## Disclaimer

The specifications, performance figures, and feature descriptions contained in this document are provided for informational purposes and reflect TwinMOS Technologies' best knowledge at the time of publication. Random I/O performance figures are marked as estimated and are based on controller specifications and internal testing; independently verified data will be published in a future document revision.

TwinMOS Technologies reserves the right to modify product specifications, part numbers, pricing, and availability without prior notice. Single-sided PCB compatibility with specific laptop models is based on publicly available OEM specifications; TwinMOS does not guarantee compatibility with every laptop or embedded platform. Users should verify physical clearance requirements with their platform documentation before installation.

TwinMOS Technologies shall not be liable for any loss of data. Users are solely responsible for maintaining adequate data backups. All trademarks referenced herein are the property of their respective owners.

&copy; 2026 TwinMOS Technologies. All rights reserved. Unauthorized reproduction or distribution of this document is prohibited.
