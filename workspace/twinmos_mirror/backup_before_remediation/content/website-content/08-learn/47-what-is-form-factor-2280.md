---
title: "What is M.2 2280? The Standard SSD Form Factor"
slug: "what-is-form-factor-2280"
url: "/learn/explained/what-is-form-factor-2280/"
template: "page-explainer"
description: "M.2 2280 is the most common SSD size. Learn what the numbers mean, physical dimensions, keying types, and compatibility considerations."
keywords: ["M.2 2280 explained", "M.2 form factor", "NVMe M.2 size", "M.2 SSD dimensions", "2280 vs 2242"]
persona: ["consumer"]
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
  - label: "Best SSD for Laptops"
    url: "/learn/buying-guides/best-ssd-for-laptops/"
cross_links:
  - "/learn/buying-guides/how-to-choose-an-ssd/"
  - "/learn/buying-guides/best-ssd-for-laptops/"
  - "/learn/explained/what-is-nvme/"
sources:
  - title: "PCI-SIG M.2 Specification"
    url: "https://pcisig.com/specifications"
    date: "2023"
  - title: "TwinMOS M.2 SSD Product Line"
    url: "/products/m2-ssds/"
  - title: "SNIA SSD Form Factor Guide"
    url: "https://www.snia.org/education/ssd-form-factors"
    date: "2024"
---

# What is M.2 2280? The Standard SSD Form Factor

M.2 2280 is the de facto standard form factor for modern NVMe SSDs. The name sounds technical, but it's simply a description of physical dimensions and connector type. Understanding M.2 2280 — and its variants — ensures you buy an SSD that actually fits in your system.

## Decoding the Name

### M.2

M.2 (formerly NGFF — Next Generation Form Factor) is the connector and mounting standard. It replaces the older mSATA standard, offering:
- Smaller physical size
- Support for both SATA and PCIe protocols
- Multiple length options
- Higher data rates through PCIe

### 2280

The numbers describe dimensions in millimeters:
- **22**: Width in mm (all M.2 cards are 22mm wide except some specialty sizes)
- **80**: Length in mm

So M.2 2280 means 22mm wide by 80mm long.

## M.2 Length Variants

| Form Factor | Dimensions | Common Use |
|-------------|-----------|------------|
| M.2 2230 | 22 × 30 mm | Steam Deck, ultrabooks, compact devices |
| M.2 2242 | 22 × 42 mm | Some laptops, industrial systems |
| M.2 2260 | 22 × 60 mm | Rare, some older motherboards |
| M.2 2280 | 22 × 80 mm | Desktop and laptop standard |
| M.2 22110 | 22 × 110 mm | Enterprise/server, some high-end desktops |

M.2 2280 dominates the consumer market. The vast majority of motherboards and laptops use this size.

## Physical Design

### The PCB

An M.2 2280 SSD is a small printed circuit board containing:
- NAND flash chips (1-4 chips depending on capacity)
- SSD controller
- DRAM cache chip (on higher-end drives)
- Power management circuitry

The board is typically 0.8-1.0 mm thick.

### The Connector

The M.2 connector has 75 positions with up to 67 pins used, depending on keying. The card edge slides into the slot at an angle, then pivots down and secures with a screw.

### The Mounting Hole

At the far end of the PCB (75 mm from the connector on a 2280 drive), a half-circle notch accepts an M2 × 3 mm screw that secures the drive to a standoff on the motherboard.

## M.2 Keying

The M.2 connector has a key — a missing pin section that prevents incompatible devices from being inserted.

### Key B
- Missing pins on positions 12-19
- Supports SATA and PCIe ×2
- Used by some Wi-Fi cards and SATA SSDs

### Key M
- Missing pins on positions 59-66
- Supports PCIe ×4 (NVMe)
- Used by modern NVMe SSDs

### Key B+M
- Missing both B and M sections
- Fits in B or M slots
- Used by SATA SSDs and some PCIe ×2 devices

**For NVMe SSDs**: Look for Key M or B+M. Pure Key B won't support NVMe ×4.

## M.2 Slot Locations

### Desktop Motherboards

- **Primary M.2**: Usually near the CPU, connected to CPU PCIe lanes (fastest)
- **Secondary M.2**: Often near the chipset, connected to chipset lanes
- **Some boards**: M.2 slot under a heatsink cover

### Laptops

- **Internal bay**: Under a bottom panel or keyboard
- **Some ultrabooks**: Soldered storage (not upgradeable)
- **Length support**: Check if your laptop supports 2280 or only 2242/2230

## Compatibility Checklist

Before buying an M.2 SSD, verify:

1. **Slot availability**: Does your system have an M.2 slot?
2. **Length support**: Does it accept 2280, or only shorter lengths?
3. **Keying**: Is the slot Key M (for NVMe) or Key B (for SATA)?
4. **Protocol**: Does the slot support NVMe, SATA, or both?
5. **PCIe generation**: Gen3, Gen4, or Gen5?
6. **Physical clearance**: Is there room under a GPU or heatsink?

## M.2 2280 vs. 2.5-inch SATA

| Feature | M.2 2280 NVMe | 2.5-inch SATA |
|---------|--------------|---------------|
| Dimensions | 22 × 80 mm | 69.85 × 100.45 mm |
| Interface | PCIe (NVMe) | SATA |
| Max Speed | Up to 14,000 MB/s | ~580 MB/s |
| Cables | None (mounts to board) | Power + data cables |
| Capacity Range | 250GB - 8TB | 128GB - 8TB |
| Best For | Performance builds | Older systems, budget |

## M.2 2280 and Heat

The compact M.2 2280 form factor concentrates heat in a small area. High-performance Gen4 and Gen5 drives can throttle without adequate cooling. Solutions include:

- **Motherboard heatsinks**: Metal covers over M.2 slots
- **Graphene heatsinks**: Ultra-thin thermal solutions like those on the TwinMOS Xtreme Gen4 and CoreX Pro Gen5
- **Aftermarket heatsinks**: Attach to the SSD for additional cooling

## Future of M.2

M.2 2280 remains the consumer standard, but new form factors are emerging:
- **E1.S**: Enterprise-focused, 25mm wide, higher capacity
- **E1.L**: Longer enterprise format
- **CFexpress**: Camera/media card format using NVMe

For consumer PCs, M.2 2280 will remain dominant for years.

## Summary

M.2 2280 (22mm wide, 80mm long) is the standard form factor for modern NVMe SSDs. It mounts directly to the motherboard without cables, supports PCIe Gen3/Gen4/Gen5 speeds, and fits in most desktops and laptops. Understanding keying, slot compatibility, and length support ensures your SSD purchase fits and functions correctly.

**Find your fit**: The [TwinMOS M.2 SSD lineup](/products/m2-ssds/) includes M.2 2280 drives from the Gen3 Alpha Pro to the flagship Gen5 CoreX Pro.
