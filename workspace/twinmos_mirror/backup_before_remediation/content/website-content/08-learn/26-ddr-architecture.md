---
title: "DDR Architecture: Banks, Rows, Columns, and How Memory Works"
slug: "ddr-architecture"
url: "/learn/explained/ddr-architecture/"
template: "page-explainer"
description: "Understand how DDR memory is organized internally. Learn about banks, rows, columns, ranks, and how the memory controller interacts with DRAM chips."
keywords: ["DDR architecture", "memory banks", "DRAM organization", "memory ranks", "how DRAM works", "memory rows columns"]
persona: ["consumer"]
phase: P1
priority: P0
owner: "marketing"
status: draft
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas:
  - label: "What is DDR5?"
    url: "/learn/explained/what-is-ddr5/"
  - label: "Memory Bandwidth Explained"
    url: "/learn/explained/memory-bandwidth-explained/"
cross_links:
  - "/learn/explained/what-is-ddr/"
  - "/learn/explained/memory-bandwidth-explained/"
  - "/learn/explained/cas-latency-explained/"
sources:
  - title: "JEDEC DDR5 Standard (JESD79-5)"
    url: "https://www.jedec.org/standards-documents/docs/jesd79-5"
    date: "2020"
  - title: "Understanding DRAM Architecture - AnandTech"
    url: "https://www.anandtech.com/show/2870"
    date: "2021"
  - title: "TwinMOS VOLTX DDR5 Series"
    url: "/products/voltx-ddr5/"
---

# DDR Architecture: Banks, Rows, Columns, and How Memory Works

To the user, RAM is simply "memory" — a place where data lives temporarily. But beneath the surface, DRAM is an intricate engineering marvel organized into a hierarchical structure of banks, rows, and columns. Understanding this architecture explains why memory behaves the way it does: why latency exists, why bandwidth matters, and why certain access patterns are faster than others.

## The Basic Storage Unit: The Capacitor

DRAM stores data as electrical charge in tiny capacitors — one capacitor per bit. A charged capacitor represents a "1"; a discharged one represents a "0". Each capacitor is paired with a transistor that acts as a switch, controlling access to the stored charge.

The challenge: capacitors leak charge. Without intervention, a stored "1" would become a "0" in milliseconds. This is why it's called Dynamic RAM — the memory controller must periodically refresh every cell by reading and rewriting it, typically every 64 milliseconds.

## The Memory Array: Rows and Columns

Capacitors are organized in a grid — a two-dimensional array:
- **Rows** (also called "pages"): Horizontal lines of cells
- **Columns**: Vertical access lines

To read a specific bit, the memory controller must:
1. Activate the row containing that bit (open the row)
2. Select the specific column
3. Sense the charge and output the data
4. Close the row (precharge) when done

This row/column organization is why memory latency is measured in cycles — opening a row takes time, but once open, accessing other columns in the same row is faster.

## Banks: Parallel Arrays

A single row/column grid would be too slow for modern processors. Instead, DRAM chips contain multiple independent arrays called **banks**. Each bank has its own set of rows and columns and can operate independently.

### Bank Operation

When the memory controller sends a command:
- It specifies which bank to access
- That bank opens the requested row
- Other banks remain available for concurrent operations

DDR4 organizes banks into **bank groups** — sets of banks that share some internal resources but can still operate with partial independence. DDR4 has 4 bank groups with 4 banks each (16 total banks). DDR5 doubles this to 8 bank groups.

### Why Banks Matter

More banks enable more parallelism. If the CPU requests data from Bank 0 while Bank 1 is still processing a previous request, the memory controller can interleave these operations. DDR5's increased bank group count is one reason it achieves higher effective bandwidth than DDR4 despite similar prefetch widths.

## Ranks: Doubling Capacity on a Module

A **rank** is a 64-bit wide block of data (72-bit with ECC) that can be accessed independently. A single memory module can contain one rank (single-rank), two ranks (dual-rank), or even four ranks (quad-rank, common in servers).

To create dual-rank modules, manufacturers place memory chips on both sides of the PCB or use higher-density chips. From the memory controller's perspective, each rank appears as a separate logical device, though they share the module's electrical interface.

### Single-Rank vs Dual-Rank Performance

- **Single-rank**: Lower latency for initial access, simpler for the memory controller
- **Dual-rank**: Can offer better throughput through rank interleaving — alternating between ranks on successive accesses

For most users, the difference is small. Gamers sometimes prefer single-rank for slightly lower latency, while workstation users may benefit from dual-rank's bandwidth advantages.

## The Memory Controller: The Traffic Cop

The memory controller — integrated into modern CPUs — manages all DRAM operations. Its responsibilities include:

1. **Address translation**: Converting physical addresses to bank/row/column coordinates
2. **Command scheduling**: Issuing ACTIVATE, READ, WRITE, and PRECHARGE commands
3. **Refresh management**: Ensuring capacitors are refreshed before they lose charge
4. **Timing enforcement**: Respecting constraints like tRCD, tRP, and tRAS
5. **Power management**: Entering low-power states when memory is idle

Modern memory controllers are sophisticated multi-channel engines that can issue commands to different banks and channels simultaneously, extracting maximum parallelism from the DRAM subsystem.

## Channels: The Highway to the CPU

Memory channels are independent pathways between the CPU and memory modules. Each channel has its own memory controller logic and data bus.

- **Single-channel**: One 64-bit data path
- **Dual-channel**: Two independent 64-bit paths (128-bit total)
- **Quad-channel**: Four paths (256-bit total) — found in HEDT/workstation platforms
- **Octa-channel**: Eight paths — server platforms

DDR5 introduces a twist: each DIMM is split into two 32-bit subchannels, so a single DDR5 DIMM in single-channel mode provides some of the parallelism benefits previously requiring two DIMMs.

## The Anatomy of a Memory Access

When the CPU requests data from memory, here's what happens:

1. **Address decode**: The memory controller determines which channel, DIMM, rank, bank, row, and column contains the data.

2. **Row activate (tRCD)**: The controller sends an ACTIVATE command to open the correct row. This takes several clock cycles (tRCD).

3. **Column access (CAS latency)**: Once the row is open, the controller sends a READ or WRITE command specifying the column. After CAS latency (CL) cycles, data begins to transfer.

4. **Data burst**: Modern DDR transfers multiple words in a burst (typically 8 beats for a cache line). The prefetch buffer facilitates this.

5. **Row precharge (tRP)**: When done with the row, the controller sends PRECHARGE to close it and prepare the bank for a different row. This also takes several cycles.

Understanding this sequence explains why memory latency has multiple components and why random access (different rows) is slower than sequential access (same row, different columns).

## Summary

DRAM architecture is a beautiful compromise between density, speed, cost, and power. The hierarchical organization — channels, ranks, banks, rows, and columns — allows memory controllers to extract impressive parallelism from fundamentally simple capacitor-based storage. Each DDR generation refines this architecture: more banks, better grouping, faster signaling, and smarter controllers.

**Dig deeper**: Explore [CAS Latency](/learn/explained/cas-latency-explained/) to understand timing parameters, or [Memory Bandwidth](/learn/explained/memory-bandwidth-explained/) to see how architecture translates to performance.
