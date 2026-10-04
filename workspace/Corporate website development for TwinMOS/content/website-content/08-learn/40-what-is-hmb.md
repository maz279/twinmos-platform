---
title: "What Is HMB (Host Memory Buffer)?"
slug: "what-is-hmb"
url: "/learn/explained/what-is-hmb/"
template: "page-explainer"
description: "Learn how Host Memory Buffer (HMB) technology lets DRAM-less NVMe SSDs borrow system RAM to boost performance, and how it compares to full DRAM cache."
keywords: ["HMB", "Host Memory Buffer", "DRAM-less SSD", "NVMe SSD cache", "SSD performance", "FTL mapping"]
persona: ["consumer", "buyer", "enthusiast"]
phase: P1
priority: P0
owner: "marketing"
status: draft
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas:
  - label: "How to Choose an SSD"
    url: "/learn/buying-guides/how-to-choose-an-ssd/"
  - label: "What Is DRAM Cache on SSDs?"
    url: "/learn/explained/what-is-dram-cache-on-ssd/"
cross_links:
  - "/learn/explained/what-is-nvme/"
  - "/learn/explained/what-is-dram-cache-on-ssd/"
  - "/learn/explained/what-is-3d-tlc-nand/"
  - "/learn/buying-guides/how-to-choose-an-ssd/"
sources:
  - title: "NVMe Specification 1.2 - Host Memory Buffer"
    url: "https://nvmexpress.org/specifications/"
    date: "2014"
  - title: "NVM Express Host Memory Buffer Explained"
    url: "https://www.anandtech.com/show/10205"
    date: "2016"
  - title: "TwinMOS Xtreme Gen4 SSD with DRAM Cache"
    url: "/products/xtreme-gen4/"
---

# What Is HMB (Host Memory Buffer)?

Host Memory Buffer (HMB) is a feature introduced in NVMe 1.2 that allows a DRAM-less SSD to borrow a small portion of the host system's main memory (RAM) for its own use as a high-speed cache. The result is an NVMe drive that costs less to manufacture — because it omits a dedicated DRAM chip — while still delivering performance that is meaningfully better than a completely cache-less design.

Understanding HMB requires knowing why SSDs need a cache at all, and why its location matters.

## Why SSDs Need a Cache

Every NVMe SSD uses a Flash Translation Layer (FTL) — essentially a large lookup table that maps the logical block addresses (LBAs) the host OS uses to the physical NAND page locations where data actually lives. This mapping is necessary because NAND flash cannot be overwritten in-place; it can only be written to erased blocks, so data is constantly being moved and remapped.

For a 1TB drive, the complete FTL mapping table can consume 1-2 GB of data. Reading this mapping from NAND flash would take 50-100 microseconds per lookup — far too slow for responsive operation. Traditional SSDs solve this by storing the working portion of the FTL in dedicated DRAM chips soldered to the drive's PCB. DRAM lookup takes only 10-20 nanoseconds, roughly 1,000-5,000 times faster.

Without any cache, every random read requires:

1. Look up the LBA → physical address mapping **from NAND** (slow: ~50-100 μs)
2. Read the actual data from NAND (another ~50-100 μs)

This serializes two slow NAND accesses for every random read, severely limiting IOPS.

## How HMB Solves This Without Dedicated DRAM

When HMB is enabled, the NVMe driver negotiates with the SSD's controller through a standardized protocol. The driver asks the host OS to allocate a contiguous region of system RAM — typically 16MB to 128MB — and makes it accessible to the SSD controller over the PCIe bus.

The SSD then uses this borrowed memory exactly as it would use dedicated DRAM: to cache the hot portion of the FTL mapping table. Most workloads access a small subset of the drive's total capacity repeatedly (the "working set"), so a 64MB HMB allocation can effectively cache the mapping for the most-used 30-60GB of data on the drive.

The result:

1. For addresses in the cached region: look up in **HMB** (fast: ~80-200 ns over PCIe) → read data from NAND
2. For addresses outside the cached region: fall back to NAND-based lookup → read data from NAND

PCIe access to system RAM is slower than local DRAM (DRAM sits right beside the controller), but dramatically faster than reading from NAND.

## HMB Allocation: Size and Configuration

The NVMe specification defines the HMB feature formally, including:

- The drive declares its preferred HMB size in its Identify Controller data
- The driver negotiates a size the host can provide — from the drive's minimum (often 4MB) up to its preferred maximum
- Common HMB sizes: 16MB (budget drives), 64MB (mainstream), 128MB (performance-oriented DRAM-less)
- Some drives support chunked HMB — multiple non-contiguous RAM allocations if a single large contiguous block is unavailable

The allocated memory remains reserved for the SSD as long as the drive is active. On power loss or system sleep states, the HMB contents are lost; on the next power-on, the SSD rebuilds its working cache from NAND flash before full performance is restored (typically within seconds of first access).

## Performance Impact

HMB's benefit is most pronounced for random read IOPS, which depend heavily on FTL lookup speed. Representative comparison:

| Cache Type | Random 4K Read IOPS | Sequential Read | Typical Scenario |
|------------|--------------------|-----------------|--------------------|
| Full DRAM cache | 400,000-700,000 | Full rated speed | TwinMOS Xtreme Gen4, CoreX Pro Gen5 |
| HMB (64MB) | 200,000-400,000 | Full rated speed | Budget NVMe with HMB |
| No cache (no HMB) | 30,000-80,000 | Near rated speed | Ultra-budget or legacy DRAM-less |

Key observations:

- **HMB largely closes the gap for random reads** within the cached working set
- **Sequential performance is unaffected** — large sequential transfers go directly through the NAND controller and don't rely on the FTL cache
- **Cache misses hurt** — addresses outside the HMB working set fall back to NAND-level lookup, dropping IOPS significantly for large working sets
- **Latency is higher than full DRAM** — PCIe round-trip adds latency vs. local DRAM, so HMB drives have higher average read latency

## Requirements

HMB is not universal — it requires compatible hardware and software:

| Requirement | Details |
|------------|---------|
| Drive protocol | NVMe 1.2 or later |
| Host OS (Windows) | Windows 10 version 1703 (Creators Update) or later |
| Host OS (Linux) | Kernel 4.13 or later |
| Host OS (macOS) | Supported on Apple Silicon; limited on Intel Macs |
| BIOS/UEFI | Must not restrict PCIe DMA to system RAM |
| System RAM | Must have sufficient available RAM — HMB takes from the available pool |

To verify HMB is active on Windows, open Device Manager, navigate to the SSD's NVMe controller properties, and check the HMB allocation under the Details tab. Some monitoring utilities also report HMB status directly.

## HMB vs. Dedicated DRAM vs. No Cache

| Feature | Dedicated DRAM | HMB | No Cache |
|---------|---------------|-----|----------|
| Random IOPS | Highest | Good | Poor |
| Sequential speed | Full rated | Full rated | Full rated |
| Latency | Lowest (~10-20 ns lookup) | Medium (~80-200 ns) | Highest (~50 μs for miss) |
| Power consumption | Slightly higher | Negligible overhead | Lowest |
| System RAM used | None | 16-128 MB | None |
| Cost to manufacture | Higher | Lower | Lowest |
| Behavior on power loss | Survives (DRAM retains map) | Cache lost, rebuilt on next boot | N/A |
| Best for | Performance workloads | Everyday desktop use | Light or read-heavy archival |

## When HMB Matters Most

HMB provides meaningful real-world benefits in:

- **OS boot and application loading**: Boot drives access many small files in a limited address range — exactly what HMB's cached working set handles well
- **Gaming**: Level loads access many small game assets; HMB improves load times noticeably vs. no-cache designs
- **Web browsing and productivity**: Cache files, databases, and application assets are repeatedly accessed — small working set, ideal for HMB
- **Light office workloads**: Email clients, office suites, and file management are all random-read-heavy in the access pattern HMB optimizes

HMB provides minimal benefit for:

- **Large sequential transfers**: Video file copies, large backups — sequential speed is unchanged
- **Very large working sets**: If your active data spans hundreds of gigabytes spread across the drive, HMB cache-miss rates increase

## Trade-offs and Considerations

HMB's primary trade-off is borrowing system RAM. A 64MB allocation is negligible on a system with 16GB or more — the impact on other workloads is essentially zero. On systems with 4GB or 8GB, the allocation is still small but worth noting.

There is no permanent performance benefit to disabling HMB on a compatible system — the "cost" is trivial RAM, and the benefit is real IOPS improvement.

## TwinMOS Context

TwinMOS evaluates HMB technology for entry-level NVMe designs, ensuring that even cost-optimized drives deliver responsive boot and application-load times when paired with compatible platforms. For users who need maximum random I/O performance, TwinMOS's DRAM-equipped drives (Xtreme Gen4, CoreX Pro Gen5) provide full on-drive cache with no system RAM dependency and peak random read performance.

Choosing between a DRAM-cache drive and an HMB-equipped drive ultimately comes down to workload and budget. For most desktop users, a well-implemented HMB drive delivers a good experience. For sustained random I/O workloads — content creation, databases, development — dedicated DRAM is the better investment.

[Compare SSD options →](/products/)

[How to Choose an SSD →](/learn/buying-guides/how-to-choose-an-ssd/)
