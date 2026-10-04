---
title: "What Is TRIM and Garbage Collection?"
slug: "what-is-trim-and-garbage-collection"
url: "/learn/explained/what-is-trim-and-garbage-collection/"
template: "page-explainer"
description: "Understand how TRIM and garbage collection keep your SSD fast and healthy by efficiently managing deleted data, erasing stale NAND blocks, and minimizing write amplification."
keywords: ["TRIM", "garbage collection SSD", "SSD maintenance", "NAND flash", "SSD performance", "write amplification", "Deallocate NVMe"]
persona: ["consumer", "buyer", "enthusiast"]
phase: P1
priority: P0
owner: "marketing"
status: draft
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas:
  - label: "What Is Wear Leveling?"
    url: "/learn/explained/what-is-wear-leveling/"
  - label: "How to Choose an SSD"
    url: "/learn/buying-guides/how-to-choose-an-ssd/"
cross_links:
  - "/learn/explained/what-is-3d-tlc-nand/"
  - "/learn/explained/what-is-wear-leveling/"
  - "/learn/explained/what-is-smart-monitoring/"
  - "/learn/buying-guides/how-to-choose-an-ssd/"
sources:
  - title: "ATA/ATAPI Command Set - TRIM"
    url: "https://www.t13.org/documents/UploadedDocuments/docs2016/di537r18-ATAATAPI_Command_Set_-_4.pdf"
    date: "2016"
  - title: "NVMe Specification - Dataset Management"
    url: "https://nvmexpress.org/specifications/"
    date: "2021"
  - title: "TwinMOS SSD Product Line"
    url: "/products/ssds/"
---

# What Is TRIM and Garbage Collection?

TRIM and garbage collection are two complementary processes that keep SSDs running at full speed over time. Without them, a solid-state drive would slow dramatically after weeks of normal use. Understanding how they work explains why SSDs need both, why over-provisioning matters, and what you can do to keep your drive healthy.

## The Core Problem: NAND Can't Overwrite Data

To understand why TRIM and garbage collection exist, you first need to understand a fundamental constraint of NAND flash memory: **it cannot overwrite data directly**.

Hard drives can write new data directly over old data at any location. NAND flash cannot. The smallest unit that NAND can *read* is a **page** (typically 4KB-16KB). The smallest unit NAND can *erase* is a **block** — a group of 64-512 pages (commonly 256-1024KB total).

The erase-before-write constraint creates a three-step sequence whenever existing data is "updated":

1. Read the old page's data
2. Modify it in the controller's RAM
3. Write the modified data to a *different* empty page

The old page is now **stale** — it holds outdated data that is no longer referenced, but the NAND block containing it cannot be erased until *every* page in that block is also stale.

As the drive fills up with stale pages mixed among valid pages, performance degrades because the controller must work harder to find clean space for new writes.

## Garbage Collection: Making Space for New Data

Garbage collection (GC) is the SSD controller's internal process for reclaiming storage space occupied by stale data. The process works as follows:

1. The controller scans blocks and identifies those with a mix of valid and stale pages
2. It selects a candidate block (usually one with many stale pages and few valid ones)
3. The **valid pages from that block** are read and written to a clean block
4. The now-fully-stale original block is **erased**, producing a clean block ready for new data
5. The clean block joins the pool of available space

This consolidation is called **compaction**. The controller runs it continuously in the background, typically during idle periods to avoid impacting user-facing performance.

### Write Amplification Factor

Garbage collection has a cost: the controller must write data again to move valid pages out of blocks being cleaned. The ratio of data physically written to NAND vs. data the host actually wrote is called the **Write Amplification Factor (WAF)**.

```
WAF = Physical bytes written to NAND ÷ Logical bytes written by host
```

A WAF of 1.0 is ideal (no extra writes). Real-world SSDs typically achieve:

- **Sequential-heavy workloads**: WAF 1.0-1.5 (efficient, minimal GC overhead)
- **Random-heavy workloads**: WAF 2-5+ (frequent GC needed, more extra writes)
- **Poorly managed or very full drive**: WAF 10+ (severe GC inefficiency)

Lower WAF means less unnecessary NAND wear and better sustained write performance. This is why TBW (Terabytes Written) ratings assume typical mixed workloads rather than worst-case random writes.

### SLC Cache and Garbage Collection

Most modern consumer SSDs use an SLC (Single Level Cell) write cache — a reserved portion of TLC NAND programmed in SLC mode (1 bit per cell instead of 3). Writes first land in the SLC cache at high speed, and garbage collection later migrates them to TLC at lower speed.

The SLC cache strategy means:

- Initial burst writes are fast
- Sustained writes beyond the cache size slow to TLC speeds (~500-800 MB/s for most consumer drives)
- GC runs in the background converting SLC-cached data to TLC and refreshing the SLC pool

## The TRIM Command: Telling the SSD What's Deleted

Here's the problem garbage collection cannot solve on its own: **the operating system doesn't automatically tell the SSD which data has been deleted**.

When you delete a file, the OS removes the file system pointer and marks the space as available in its own tables. But from the SSD's perspective, those NAND pages still contain data — they look valid. The controller has no way to know the data is obsolete.

Without further information, garbage collection must treat deleted data as valid, copy it to new blocks during compaction, and wear the NAND unnecessarily. This wastes write endurance and slows GC.

**TRIM** (formally the `DATA SET MANAGEMENT` command with the `Deallocate` action for ATA/SATA) solves this. When TRIM is enabled:

1. You delete a file
2. The OS sends a TRIM command specifying the affected Logical Block Addresses (LBAs)
3. The SSD's controller marks those pages as stale immediately
4. When garbage collection runs, it skips those stale pages — no unnecessary copies
5. Write amplification decreases; endurance improves

TRIM effectively bridges the gap between what the OS knows (these blocks are free) and what the SSD knows (these blocks still look like valid data).

### NVMe: Deallocate Instead of TRIM

On NVMe SSDs, the equivalent command is called **Deallocate** (part of the NVMe Dataset Management command). The effect is identical — the OS notifies the drive which LBAs are no longer in use. However, NVMe's Deallocate can be batched more efficiently and handles larger address ranges in fewer commands than ATA TRIM.

When this document refers to "TRIM," it applies equally to NVMe Deallocate unless otherwise specified.

## How They Work Together

The complete lifecycle of a delete operation with TRIM enabled:

```
1. User deletes file
2. OS removes file system pointers; space marked "free" in OS
3. OS issues TRIM/Deallocate for the file's LBAs
4. SSD controller marks those LBA mappings as stale (immediate)
5. [During idle]: Garbage collection identifies blocks with many stale pages
6. GC copies remaining valid pages to a clean block
7. GC erases the block — now it's fully clean
8. Clean block joins the free block pool; drive is ready for new writes
```

Without TRIM at step 3-4, GC would treat the deleted file's pages as valid and waste effort copying them.

## Over-Provisioning: GC's Working Room

Over-provisioning (OP) is drive capacity reserved exclusively for the SSD controller — it's never visible to the OS. This reserved space serves as a buffer that:

- Gives GC room to consolidate data before blocks are full
- Absorbs burst writes without triggering immediate GC
- Reduces WAF by giving the controller scheduling flexibility

Consumer drives typically ship with 7-10% over-provisioning (a nominally 1TB drive has ~1.07-1.1TB of NAND). Enterprise drives use 15-30% for workload-intensive environments.

Some drives allow users to increase over-provisioning by leaving unallocated space on the drive. A healthy rule of thumb: never fill a consumer SSD beyond 85-90% capacity.

## Checking TRIM Status

**Windows:**
```powershell
fsutil behavior query DisableDeleteNotify
```
- `DisableDeleteNotify = 0` → TRIM is **enabled** (normal state)
- `DisableDeleteNotify = 1` → TRIM is **disabled** (investigate why)

**Linux:**
```bash
lsblk --discard /dev/nvme0n1
```
Non-zero values in the DISC-GRAN and DISC-MAX columns confirm TRIM/discard support.

**macOS:**
TRIM is enabled by default on Apple SSDs. For third-party SSDs in macOS:
```bash
system_profiler SPSerialATADataType | grep -A2 "TRIM"
```
Look for "TRIM Support: Yes."

## Platform-Specific Behavior

| Platform | TRIM Default | Behavior |
|---------|-------------|----------|
| Windows 10/11 | Enabled | Scheduled TRIM runs periodically; real-time TRIM on delete |
| Linux (ext4, xfs, btrfs) | Disabled by default | Must enable periodic TRIM (fstrim) or mount with `discard` option |
| macOS | Enabled (Apple SSDs); can be enabled for third-party | Runs automatically |
| Virtualization | Varies | Guest TRIM requires hypervisor passthrough support (Hyper-V, VMware: check settings) |

**Note for Linux users**: The `discard` mount option (continuous TRIM) can reduce NAND longevity by triggering constant erase operations. Periodic TRIM via `fstrim` (weekly or daily) is generally preferred for consumer SSDs.

## Why TRIM Matters for Longevity

Beyond performance, TRIM has a direct impact on drive endurance. By reducing unnecessary writes through lower WAF, TRIM extends the working life of NAND flash. Drives that frequently operate without TRIM (some RAID configurations, certain virtualization setups) wear out faster and may show slower sustained write speeds earlier in their lifespan.

For the TBW (Terabytes Written) endurance ratings cited by manufacturers — including TwinMOS — those ratings assume typical workloads with TRIM enabled. Operating without TRIM can shorten effective endurance.

## Best Practices

- **Verify TRIM is enabled** using the OS commands above, especially on freshly installed systems
- **Keep firmware updated**: Controller firmware improvements often optimize GC algorithms and TRIM handling
- **Maintain headroom**: Keep 10-15% of drive capacity free to give GC room to operate without performance degradation
- **Avoid RAID 0 for boot drives**: Many RAID implementations do not pass TRIM commands to individual drives, disabling its benefits
- **Don't defragment SSDs**: Defragmentation generates massive unnecessary writes; modern OSes automatically disable it for SSDs
- **Use standard file systems**: NTFS, APFS, ext4, xfs, and btrfs all support TRIM; older or exotic file systems may not

## Summary

Garbage collection and TRIM work as a team: GC is the SSD's internal process for reclaiming stale space and maintaining a pool of clean blocks, while TRIM is the communication channel that tells the controller which blocks the OS considers free. Together they minimize write amplification, maintain sustained write performance, and extend NAND endurance.

Modern operating systems enable TRIM by default for NVMe and SATA SSDs. As long as your drive and OS both support it — and they almost certainly do — these processes run automatically in the background, keeping your SSD fast without any manual intervention.

[Learn about wear leveling →](/learn/explained/what-is-wear-leveling/)

[How to monitor your SSD's health →](/learn/explained/what-is-smart-monitoring/)
