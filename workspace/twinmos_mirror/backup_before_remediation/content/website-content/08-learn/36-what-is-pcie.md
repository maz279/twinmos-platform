---
title: "What is PCIe? The Highway for High-Speed Components"
slug: "what-is-pcie"
url: "/learn/explained/what-is-pcie/"
template: "page-explainer"
description: "PCI Express connects GPUs, SSDs, and expansion cards to your CPU. Learn how PCIe lanes, generations, and bandwidth work — including the consumer timeline for Gen6."
keywords: ["what is PCIe", "PCI Express explained", "PCIe lanes", "PCIe generations", "PCIe bandwidth", "PCIe Gen6"]
persona: ["consumer"]
phase: P1
priority: P0
owner: "marketing"
status: draft
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas:
  - label: "PCIe Gen3 vs Gen4 vs Gen5"
    url: "/learn/buying-guides/pcie-gen3-vs-gen4-vs-gen5/"
  - label: "Shop NVMe SSDs"
    url: "/products/nvme-ssds/"
cross_links:
  - "/learn/buying-guides/pcie-gen3-vs-gen4-vs-gen5/"
  - "/learn/explained/what-is-nvme/"
  - "/learn/buying-guides/how-to-choose-an-ssd/"
sources:
  - title: "PCI-SIG PCIe 5.0 Specification"
    url: "https://pcisig.com/specifications"
    date: "2023"
  - title: "PCIe Generations Explained - Tom's Hardware"
    url: "https://www.tomshardware.com/reviews/pcie-definition"
    date: "2025"
  - title: "TwinMOS CoreX Pro Gen5 PCIe SSD"
    url: "/products/corex-pro-gen5/"
---

# What is PCIe? The Highway for High-Speed Components

PCI Express (Peripheral Component Interconnect Express), commonly called PCIe, is the high-speed interface that connects the most important components in your computer to the CPU. Your graphics card, NVMe SSD, Wi-Fi card, and many other expansion devices all communicate across PCIe lanes. Understanding PCIe helps you make sense of motherboard specifications, SSD performance tiers, and upgrade compatibility.

## What PCIe Replaced

Before PCIe, expansion cards used PCI and AGP — parallel buses that shared bandwidth among devices and faced signal integrity challenges at high speeds. PCIe solved these problems by switching to serial communication: data travels one bit at a time per lane, but at far higher speeds, with dedicated point-to-point connections between each device and the CPU or chipset.

## How PCIe Works

### Lanes

PCIe communicates through lanes — pairs of differential signal wires (one for transmit, one for receive). Each lane is a full-duplex serial connection, meaning data flows in both directions simultaneously.

Common lane configurations:
- **x1**: One lane (small cards — Wi-Fi, sound cards, USB controllers)
- **x4**: Four lanes (most NVMe SSDs, some capture cards)
- **x8**: Eight lanes (some RAID cards, secondary GPUs)
- **x16**: Sixteen lanes (graphics cards, enterprise SSDs)

### Point-to-Point Topology

Unlike the shared bus of old PCI, PCIe creates a dedicated connection between each device and the root complex (CPU or chipset). Devices don't compete for bandwidth — each connection operates at full speed independently.

### Packet-Based Communication

PCIe sends data in packets with headers and payloads, similar to network communication. This enables error detection and correction, quality-of-service prioritization, and efficient small-message handling.

## PCIe Generations

Each new PCIe generation doubles the bandwidth per lane:

| Generation | Consumer Adoption | Per-Lane Bandwidth | x4 Speed | x16 Speed |
|------------|------------------|--------------------|----------|-----------|
| Gen1 | 2003 | 250 MB/s | 1 GB/s | 4 GB/s |
| Gen2 | 2007 | 500 MB/s | 2 GB/s | 8 GB/s |
| Gen3 | 2010–present | ~1 GB/s | ~4 GB/s | ~16 GB/s |
| Gen4 | 2020–present | ~2 GB/s | ~8 GB/s | ~32 GB/s |
| Gen5 | 2022–present | ~4 GB/s | ~16 GB/s | ~64 GB/s |
| Gen6 | Enterprise: 2026; Consumer: **realistically 2030+** | ~8 GB/s | ~32 GB/s | ~128 GB/s |

### A Note on PCIe Gen6

PCI-SIG published the PCIe Gen6 specification, and enterprise SSDs using the interface are expected to appear in 2026. However, consumer CPUs and chipsets with Gen6 support are a different story. Intel and AMD roadmaps through 2027 are built around Gen5 as the high-speed tier, with no consumer Gen6 CPU announcements. Realistically, consumer platforms with Gen6 NVMe slots are unlikely before 2030. Gen5 is the current and near-future benchmark for premium consumer storage.

## Backward Compatibility

PCIe is backward and forward compatible across generations:
- A Gen5 SSD works in a Gen4 slot (at Gen4 speeds)
- A Gen3 GPU works in a Gen5 slot (at Gen3 speeds)
- Physical connectors are identical within each form factor

The connection operates at the speed of the slowest component in the chain.

## PCIe in Modern Consumer Systems

### CPU PCIe Lanes

Modern consumer CPUs provide direct PCIe lanes to high-performance devices:

**AMD Ryzen 7000/9000 (AM5):**
- 28 PCIe Gen5 lanes from the CPU
- Typical allocation: x16 for GPU, x4 for primary M.2 NVMe, remaining lanes for the chipset link

**Intel Core Ultra 200S (Arrow Lake, LGA 1851):**
- PCIe Gen5 direct lanes for GPU and primary NVMe M.2
- Supports both Gen5 x16 GPU and Gen5 x4 NVMe simultaneously

**Intel 12th–14th Gen (LGA 1700):**
- Mix of Gen4 and Gen5 lanes depending on specific CPU and motherboard
- Check your motherboard manual for exact slot assignments

### Chipset PCIe Lanes

The chipset provides additional lanes for peripherals (typically Gen3 or Gen4), shared through the chipset-to-CPU link. Secondary M.2 slots, SATA ports, USB controllers, and Wi-Fi cards typically connect here.

## PCIe and SSDs

NVMe SSDs connect via PCIe, typically in M.2 x4 configuration:

| SSD Type | PCIe Version | Max Sequential Read | TwinMOS Drive |
|---------- |-------------|---------------------|--------------|
| SATA SSD | N/A (SATA) | ~550 MB/s | Hyper H2 Ultra |
| Gen3 NVMe | Gen3 x4 | ~3,600 MB/s | Alpha Pro Gen3 |
| Gen4 NVMe | Gen4 x4 | ~7,500 MB/s | Xtreme Gen4 |
| Gen5 NVMe | Gen5 x4 | ~14,000 MB/s | CoreX Pro Gen5 |

The TwinMOS CoreX Pro Gen5 leverages PCIe Gen5 x4 to deliver up to 14,000 MB/s sequential read speeds.

## PCIe and GPUs

Graphics cards use PCIe x16 slots. Key points:
- Modern GPUs from NVIDIA's RTX 5000 series and AMD's RX 9000 series both use Gen5-capable x16 slots on current platforms
- Running a GPU at x8 instead of x16 typically reduces performance by only 1–3%
- Gen4 and Gen5 provide bandwidth headroom for current and future GPU architectures

## M.2 and PCIe

The M.2 connector supports both SATA and PCIe protocols:
- **M-key**: PCIe x4 (NVMe SSDs) — the standard for high-speed M.2 drives
- **B+M key**: SATA or PCIe x2 (older/slower devices)

Always verify your M.2 slot's keying and PCIe generation before purchasing an SSD.

## Summary

PCIe is the high-speed serial interface connecting performance-critical components to your CPU. Each generation doubles per-lane bandwidth. Gen5 is the current consumer performance ceiling for both GPUs and NVMe SSDs on Intel and AMD platforms. PCIe Gen6 for consumers is realistically a 2030+ technology. Understanding PCIe helps you verify slot compatibility, avoid configuration bottlenecks, and choose SSDs that match your platform's capabilities.

**Harness PCIe Gen5**: The [TwinMOS CoreX Pro Gen5](/products/corex-pro-gen5/) utilizes the full bandwidth of PCIe Gen5 x4 for record-breaking storage performance.
