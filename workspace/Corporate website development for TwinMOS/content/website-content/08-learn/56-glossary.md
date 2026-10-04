---
title: "Technology Glossary: A-Z Memory & Storage Terms"
slug: "glossary"
url: "/learn/glossary/"
template: "page-glossary"
description: "A comprehensive A-Z glossary of memory and storage technology terms. Quick definitions for DRAM, SSD, NAND, and computing terminology."
keywords: ["technology glossary", "memory terms", "SSD glossary", "computer terminology", "tech definitions"]
persona: ["consumer", "gamer", "creator", "enterprise"]
phase: P1
priority: P0
owner: "marketing"
status: draft
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas:
  - label: "Technology Explainers"
    url: "/learn/explained/"
  - label: "Buying Guides"
    url: "/learn/buying-guides/"
cross_links: []
sources:
  - title: "JEDEC Memory Standards"
    url: "https://www.jedec.org/standards-documents"
  - title: "NVMe Specification"
    url: "https://nvmexpress.org/specifications/"
  - title: "PCI-SIG Specifications"
    url: "https://pcisig.com/specifications"
---

# Technology Glossary: A-Z Memory & Storage Terms

## A

**AHCI** — Advanced Host Controller Interface. The legacy protocol for SATA devices, replaced by NVMe for high-performance SSDs.

**AFR** — Annualized Failure Rate. The expected percentage of units that fail in one year, derived from MTBF: `AFR = (8,760 ÷ MTBF) × 100%`. A 1.5M hour MTBF equals approximately 0.58% AFR.

**ARGB** — Addressable RGB. Per-LED lighting control allowing complex effects and patterns independent of neighbor LEDs.

**ATTO** — A disk benchmarking tool that measures performance across various transfer sizes.

## B

**Bandwidth** — The rate at which data can be transferred, typically measured in MB/s or GB/s.

**Bank Group** — A collection of memory banks in DDR4/DDR5 that can operate with partial independence. DDR5 doubles bank groups from 4 to 8 vs. DDR4.

**BIOS** — Basic Input/Output System. Firmware that initializes hardware during boot. Modern systems use UEFI.

**Boot Drive** — The storage device containing the operating system.

**Buffer** — Temporary storage area used to compensate for speed differences between components.

**Burst** — A sequence of data transfers triggered by a single command in DRAM.

## C

**Cache** — Fast memory that stores frequently accessed data for quicker retrieval.

**CAMM2** — Compression Attached Memory Module 2. An emerging memory form factor that mounts flat to the motherboard using compression contacts rather than traditional slots. Thinner than SO-DIMM, enables DDR5-6400+ in laptops, and provides dual-channel operation from a single module. Not compatible with SO-DIMM or UDIMM. Gaining adoption in premium laptops; desktop CAMM2 demonstrated at COMPUTEX 2025.

**CAS Latency (CL)** — The delay between a read command and data output in memory. Measured in clock cycles — use true latency (ns) for real comparisons. See [CAS Latency Explained](/learn/explained/cas-latency-explained/).

**Channel** — An independent data path between the CPU and memory. Dual-channel = two paths for doubled bandwidth.

**CK** — Clock signal. The timing reference for synchronous memory operations.

**Controller** — The processor on an SSD that manages NAND operations, error correction, wear leveling, and host communication.

**CoreX Pro** — TwinMOS flagship Gen5 NVMe SSD with up to 14,000 MB/s sequential read speeds. See [CoreX Pro Gen5](/products/corex-pro-gen5/).

**CUDIMM** — Clock Driver DIMM. An advanced DDR5 module variant with an integrated clock buffer (CKD) chip that improves signal integrity at extreme frequencies (DDR5-7200+). Required for Intel Core Ultra 200S Plus platforms targeting DDR5-7200 natively. Functionally compatible with standard DDR5 systems but does not offer CUDIMM advantages there.

## D

**DDR** — Double Data Rate. Memory that transfers data on both rising and falling clock edges, doubling effective bandwidth vs. SDR.

**DDR4** — Fourth generation DDR memory (1.2V, up to DDR4-3200 standard; DDR4-5333+ overclocked).

**DDR5** — Fifth generation DDR memory (1.1V, DDR5-4800+ standard, dual 32-bit subchannels, on-die ECC, PMIC). See [What is DDR5?](/learn/explained/what-is-ddr5/).

**DDR6** — Sixth generation DDR memory. Desktop specification finalizing late 2025/early 2026; consumer platform adoption expected 2027+. Speed targets: 12,800+ MT/s base. LPDDR6 was standardized by JEDEC in July 2025.

**DirectStorage** — Microsoft API (current version 1.4) allowing GPUs to load compressed game assets directly from NVMe SSDs, bypassing CPU decompression. Requires NVMe (SATA incompatible). Includes Zstd compression support. See [Best SSD for Gaming](/learn/buying-guides/best-ssd-for-gaming/).

**DIMM** — Dual In-line Memory Module. Standard desktop memory stick (also called UDIMM).

**DRAM** — Dynamic Random-Access Memory. Volatile memory used as system RAM.

**DWPD** — Drive Writes Per Day. Enterprise SSD endurance metric indicating how many times the full capacity can be written daily over the warranty period.

## E

**ECC** — Error-Correcting Code. Memory that detects and corrects data errors. See [What is ECC Memory?](/learn/explained/what-is-ecc-memory/).

**EEPROM** — Electrically Erasable Programmable Read-Only Memory.

**Endurance** — The total amount of data that can be written to an SSD before reaching its wear limit (TBW).

**EXPO** — AMD EXtended Profiles for Overclocking. AMD's open-standard DDR5 memory profile system, optimized for Ryzen platforms with Infinity Fabric settings. See [What is AMD EXPO?](/learn/explained/what-is-amd-expo/).

**Erase** — The process of clearing a NAND block (minimum erase unit) to prepare it for new writes.

## F

**Firmware** — Software embedded in hardware devices controlling their operation.

**FIT** — Failures In Time. Failures per billion device-hours. `MTBF = 1,000,000,000 ÷ FIT`.

**Flash** — Non-volatile memory technology used in SSDs (NAND flash).

**Form Factor** — Physical dimensions and connector type of a component (e.g., M.2 2280, M.2 2230, SO-DIMM).

**FSB** — Front Side Bus. Legacy term for CPU-to-chipset connection.

**FTL** — Flash Translation Layer. SSD firmware that maps logical addresses to physical NAND locations, enabling wear leveling and garbage collection.

## G

**Garbage Collection** — SSD background process that reclaims space by consolidating valid pages and erasing blocks containing stale data. See [TRIM and Garbage Collection](/learn/explained/what-is-trim-and-garbage-collection/).

**GB/s** — Gigabytes per second. Unit of data transfer rate.

**Gen3/Gen4/Gen5** — PCIe generations, each doubling bandwidth per lane. Gen5 is the current consumer peak at ~16 GB/s (x4 configuration).

**Graphene Heatsink** — Ultra-thin thermal solution using graphene's exceptional thermal conductivity (~5,300 W/mK vs. aluminum's ~237 W/mK). See [What is a Graphene Heatsink?](/learn/explained/what-is-graphene-heatsink/).

## H

**HDD** — Hard Disk Drive. Mechanical storage with spinning magnetic platters.

**Heatsink** — A component that dissipates heat from hot devices through conduction and convection.

**HMB** — Host Memory Buffer. NVMe 1.2+ feature allowing DRAM-less SSDs to borrow 16–128 MB of system RAM for FTL caching. Improves random performance vs. no cache (200K–400K IOPS vs. 30K–80K IOPS). See [What is HMB?](/learn/explained/what-is-hmb/).

**Hyper H2 Ultra** — TwinMOS SATA SSD delivering up to 580/550 MB/s read/write speeds. See [Hyper H2 Ultra](/products/hyper-h2-ultra/).

## I

**I/O** — Input/Output. Data transfer between a device and the rest of the system.

**IC** — Integrated Circuit. A chip containing miniaturized electronic circuits.

**IOPS** — Input/Output Operations Per Second. The key measure of random storage performance.

## J

**JEDEC** — Joint Electron Device Engineering Council. The standards body that defines DRAM and memory specifications globally.

**Joule** — Unit of energy; relevant for understanding power consumption and heat output.

## K

**KB** — Kilobyte. 1,024 bytes.

**Keying** — Physical notches on connectors preventing incorrect insertion (e.g., M.2 B-key vs. M-key, DDR4 vs. DDR5 notch positions).

## L

**Latency** — Delay between a request and its response. Lower is better for responsiveness.

**LBA** — Logical Block Addressing. How the OS addresses storage locations, which the SSD maps to physical NAND via FTL.

**LDPC** — Low-Density Parity Check. Advanced error correction algorithm used in modern SSD controllers.

**Lifetime Warranty** — TwinMOS DRAM warranty covering the useful life of the product.

**LPDDR6** — Low Power DDR6. Mobile memory standard standardized by JEDEC in July 2025. Starting speeds: 10,667 MT/s, scaling toward 17,000+ MT/s. Informs desktop DDR6 architecture.

## M

**M.2** — Compact form factor for SSDs and wireless cards, connecting via PCIe (NVMe) or SATA. Common lengths: 2280 (80 mm) and 2230 (30 mm).

**Mapping Table** — The SSD's Flash Translation Layer data structure translating logical addresses to physical NAND locations.

**MB/s** — Megabytes per second. Unit of data transfer rate.

**Memory Controller** — CPU-integrated logic managing all DRAM operations, timing, and error correction.

**MLC** — Multi-Level Cell. NAND storing 2 bits per cell. Better endurance than TLC/QLC; mostly replaced in consumer products.

**MTBF** — Mean Time Between Failures. Statistical measure of hardware reliability expressed in hours. For non-repairable items (SSDs), technically MTTF, but the industry uses MTBF for both. See [What is MTBF?](/learn/explained/what-is-mtbf/).

**MTTF** — Mean Time To Failure. The technically correct reliability metric for non-repairable items like SSDs (vs. MTBF for repairable systems). In practice, the storage industry uses "MTBF" for both. `AFR = (8,760 ÷ MTTF) × 100%`.

**MT/s** — Megatransfers per second. The accurate way to express DDR memory data rates (e.g., DDR5-6000 = 6,000 MT/s).

## N

**NAND** — Type of flash memory used in SSDs. Named after the NAND logic gate. Varieties: SLC, MLC, TLC, QLC.

**NCQ** — Native Command Queuing. SATA feature for reordering commands to optimize mechanical drive performance; less relevant for SSDs.

**NM** — Nanometer. Unit of measurement for semiconductor process nodes (e.g., 176-layer NAND, 12nm controller).

**NVMe** — Non-Volatile Memory Express. High-performance protocol for PCIe SSDs. Supports 64K queues × 64K commands per queue. See [What is NVMe?](/learn/explained/what-is-nvme/).

## O

**On-Die ECC** — Error correction built into every DDR5 memory chip as a standard feature. Corrects single-bit errors transparently with no performance penalty. See [On-Die ECC Explained](/learn/explained/on-die-ecc/).

**Over-Provisioning** — Extra NAND capacity beyond the advertised drive size, reserved for wear leveling, garbage collection, and spare block management.

## P

**Page** — The smallest writable unit in NAND flash (typically 4–16 KB).

**PCIe** — Peripheral Component Interconnect Express. High-speed serial expansion bus. Each generation doubles per-lane bandwidth. See [What is PCIe?](/learn/explained/what-is-pcie/).

**PMIC** — Power Management Integrated Circuit. On-module voltage regulator standard on DDR5, enabling granular power control and improved stability. See [PMIC Explained](/learn/explained/pmic-explained/).

**Prefetch** — Memory architecture that fetches multiple bits per internal clock cycle to match bus width.

## Q

**QLC** — Quad-Level Cell. NAND storing 4 bits per cell. Highest density, lowest endurance; common in high-capacity consumer drives.

**Queue Depth** — Number of pending I/O operations a storage device handles simultaneously.

## R

**RAID** — Redundant Array of Independent Disks. Multiple drives combined for performance or redundancy.

**RAM** — Random Access Memory. Volatile working memory; data lost on power loss.

**Random I/O** — Access pattern reading/writing scattered non-sequential locations. Measured in IOPS; harder for storage than sequential.

**Rank** — A 64-bit wide logical memory device on a DIMM.

**Refresh** — DRAM maintenance operation rewriting cells to prevent charge decay; occurs thousands of times per second automatically.

**RGB** — Red Green Blue. Lighting system in PC components for visual customization.

**RTX 5000 series** — NVIDIA's Blackwell-architecture GPU lineup (2025): RTX 5060 ($299), RTX 5060 Ti ($429), RTX 5070 ($549), RTX 5080 ($999), RTX 5090 ($1,999+). Features DLSS 4 Multi Frame Generation AI upscaling.

**RX 9000 series** — AMD's RDNA 4 GPU lineup (2025), including RX 9070 (~$449) and RX 9070 XT (~$499). Supports FSR 4 AI upscaling.

## S

**SATA** — Serial ATA. Storage interface originally designed for hard drives; maximum throughput ~580 MB/s. Incompatible with DirectStorage. See [What is a SATA SSD?](/learn/explained/what-is-sata-ssd/).

**SECDED** — Single Error Correction, Double Error Detection. Common ECC algorithm.

**Sequential** — Access pattern reading/writing contiguous data blocks. Faster than random for any storage type.

**SLC** — Single-Level Cell. NAND storing 1 bit per cell. Fastest and most durable NAND type; used as SLC cache in consumer TLC drives.

**SMART** — Self-Monitoring, Analysis, and Reporting Technology. Drive health monitoring standard. See [What is SMART Monitoring?](/learn/explained/what-is-smart-monitoring/).

**SO-DIMM** — Small Outline DIMM. Laptop/mini-PC memory module, approximately half the length of UDIMM.

**SSD** — Solid State Drive. Storage using NAND flash with no moving parts; dramatically faster and more durable than HDDs.

## T

**TBW** — Terabytes Written. SSD endurance rating indicating total data writable before reaching wear limit.

**Thermal Throttling** — Automatic performance reduction to prevent component damage from overheating.

**TLC** — Triple-Level Cell. NAND storing 3 bits per cell. Current consumer standard; good balance of density, cost, and endurance.

**TRIM** — ATA command (NVMe: Deallocate) informing the SSD which logical blocks the OS considers free. Reduces write amplification and extends endurance. See [TRIM and Garbage Collection](/learn/explained/what-is-trim-and-garbage-collection/).

**True Latency** — Actual response time in nanoseconds: `(CAS Latency × 2000) ÷ Speed (MT/s)`. More meaningful than the raw CL number for cross-generation comparisons.

**TwinMOS** — Founded 1998. Global memory and storage manufacturer headquartered in Dubai, serving 93+ countries.

## U

**UDIMM** — Unbuffered DIMM. Standard full-size desktop memory module (~133 mm long, 288 pins for DDR5).

**UPS** — Uninterruptible Power Supply. Battery backup protecting systems from power outages and transients.

**USB** — Universal Serial Bus. Common peripheral connection standard.

## V

**VOLTX** — TwinMOS DDR5 memory series (DDR5-5600 CL28 and DDR5-6000 CL30), available in RGB and standard heatsink variants. See [VOLTX DDR5](/products/voltx-ddr5/).

**Voltage** — Electrical potential difference driving current flow. Lower voltage = less heat and power consumption.

## W

**WAF** — Write Amplification Factor. Ratio of physical NAND writes to logical host writes. A WAF of 1.0 is ideal; random workloads typically produce WAF of 2–5; drives without TRIM can reach WAF of 10+. Lower WAF extends NAND endurance.

**Wear Leveling** — Technique distributing writes evenly across all NAND blocks to prevent premature wear of frequently written locations. See [What is Wear Leveling?](/learn/explained/what-is-wear-leveling/).

**Write Amplification** — See WAF. The extra writes the SSD controller performs (for garbage collection, wear leveling, etc.) beyond what the host requested.

## X

**XMP** — Extreme Memory Profile. Intel's standard for storing tested overclocking profiles on memory modules. XMP 3.0 for DDR5 supports up to 5 profiles with CRC integrity. See [What is XMP?](/learn/explained/what-is-xmp/).

**Xtreme Gen4** — TwinMOS PCIe Gen4 NVMe SSD with up to 7,500/6,800 MB/s sequential read/write speeds and graphene heatsink. See [Xtreme Gen4](/products/xtreme-gen4/).

## Y

**Yield** — Percentage of manufactured chips that pass quality testing and reach market.

## Z

**Z-height** — Thickness measurement, often used for low-profile SSDs and memory modules.

**Zero Fill** — Overwriting all drive data with zeros. A method of secure erasure.

**ZNS** — Zoned Namespace. NVMe 2.0 feature organizing SSDs into append-only zones for reduced write amplification in workload-optimized environments.

**Zstd** — Zstandard. A modern lossless compression algorithm developed by Facebook (Meta). Used in Microsoft DirectStorage 1.4 for GPU-decompressed asset streaming. Offers higher compression ratios and faster decompression than previous game asset formats.

---

*Didn't find a term? Explore our [Technology Explainers](/learn/explained/) for in-depth articles on memory and storage concepts.*
