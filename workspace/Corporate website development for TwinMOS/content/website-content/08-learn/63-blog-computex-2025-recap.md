---
title: "COMPUTEX 2025 Recap: The Future of Memory and Storage"
slug: "computex-2025-recap"
url: "/learn/blog/computex-2025-recap/"
template: "page-blog-post"
description: "TwinMOS recaps COMPUTEX 2025 in Taipei. Key trends in DDR6, PCIe Gen6, AI storage, CAMM2 desktop adoption, and the next generation of consumer hardware."
keywords: ["COMPUTEX 2025", "Taipei tech show", "DDR6 news", "PCIe Gen6", "AI storage trends", "CAMM2 desktop"]
persona: ["consumer", "gamer", "creator", "enterprise"]
phase: P1
priority: P0
owner: "marketing"
status: draft
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas:
  - label: "Shop CoreX Pro Gen5"
    url: "/products/corex-pro-gen5/"
  - label: "Technology Explainers"
    url: "/learn/explained/"
cross_links:
  - "/learn/blog/launch-corex-pro/"
  - "/learn/blog/launch-voltx-rgb/"
  - "/learn/explained/what-is-ddr5/"
sources:
  - title: "COMPUTEX Taipei Official Site"
    url: "https://www.computex.com.tw/"
    date: "2025"
  - title: "TwinMOS Product News"
    url: "/news-events/"
  - title: "TwinMOS Company Profile"
    url: "/about/"
---

# COMPUTEX 2025 Recap: The Future of Memory and Storage

Taipei's COMPUTEX 2025 delivered another wave of innovation, announcements, and industry-shaping trends. The TwinMOS team was on the ground throughout the show, meeting partners, evaluating new technologies, and discussing the future of memory and storage with industry leaders. Here are the key takeaways from this year's event.

## DDR6: Closer Than You Think

JEDEC's DDR6 development made significant strides at COMPUTEX 2025. LPDDR6 — the mobile variant — was officially standardized in July 2025, confirming that the next generation is no longer theoretical. Early LPDDR6 devices began sampling with speeds starting at 10,667 MT/s and roadmaps extending beyond 17,000 MT/s.

Desktop DDR6 specifications are finalizing, with JEDEC ratification targeted for late 2025 or early 2026. Early specifications indicate:

- **Speed targets**: 12,800 MT/s base, scaling to 17,000+ MT/s
- **Voltage**: Further reduction toward 1.0V
- **Channel architecture**: Possible quad-subchannel design (vs. DDR5's dual)
- **Capacity**: Standard modules up to 64GB per DIMM, with roadmap toward 128GB

While desktop DDR6 platforms won't reach mass-market consumers until 2027, the confirmation of LPDDR6 standardization means the technical groundwork is firmly established. Mobile devices shipping with LPDDR6 in late 2025 and 2026 will validate the silicon before desktop adoption ramps.

**TwinMOS perspective**: Our engineering team is actively evaluating DDR6 prototypes. The VOLTX series will evolve to embrace next-generation standards when platforms mature and deliver clear performance benefits over DDR5.

## CAMM2 Reaches the Desktop

The Compression Attached Memory Module (CAMM2) standard — previously discussed only in the context of laptops — made a significant leap at COMPUTEX 2025: desktop adoption. MSI demonstrated the Z890 platform with CAMM2 slots capable of supporting DDR5-8000+ without the signal integrity challenges that limit conventional DIMM configurations at extreme speeds.

CAMM2 advantages that drove this desktop interest:

- **Superior signal integrity**: Compression-mounted contacts eliminate the stub effects of traditional DIMM slots, enabling stable operation at speeds that are difficult or impossible with UDIMM
- **Higher speed ceilings**: DDR5-8000 MT/s and beyond become more accessible
- **Thinner form factor**: Relevant for compact desktop builds and SFF (Small Form Factor) systems
- **Dual-channel in a single module**: Replaces two DIMMs with one, simplifying installation

CAMM2 desktop adoption timeline remains uncertain — JEDEC is still finalizing the desktop specification — but the industry momentum demonstrated at COMPUTEX 2025 suggests this could reshape high-end desktop memory configurations within 2-3 years.

For laptops, CAMM2 adoption is accelerating. Several OEMs announced CAMM2 designs for thin-and-light and ultrabook segments, where the reduced height (roughly half of SO-DIMM) is critical.

## PCIe Gen6 Makes Progress

PCI-SIG demonstrated Gen6 signaling with early test silicon at COMPUTEX 2025. Key details:

- **64 GT/s per lane** (double Gen5's 32 GT/s)
- **PAM4 signaling** replacing NRZ for higher data rates
- **Backward compatibility** maintained with previous generations
- **Enterprise-first timeline**: Server and data center deployments are expected in 2026-2027

Consumer Gen6 SSDs and discrete graphics cards face a longer road. The physical challenges of PAM4 signaling at 64 GT/s in consumer-grade hardware — longer PCBs, mixed cable environments, cost-sensitive motherboards — mean consumer Gen6 is realistically a 2030 or later technology for mainstream adoption. Gen5 drives like the TwinMOS CoreX Pro will remain the consumer performance standard for the remainder of this decade.

## AI Drives Storage Innovation

Artificial intelligence was the dominant theme at COMPUTEX 2025, with significant implications for storage:

### AI-Optimized SSDs

Several vendors announced SSDs with dedicated AI accelerators for:

- On-device inference for edge applications
- Neural network-based data compression
- Predictive caching algorithms that anticipate file access patterns

### Higher Capacity Needs

Training large language models requires massive datasets. Enterprise SSD capacities are scaling toward 128TB per drive, with QLC NAND becoming viable for warm storage tiers where cost per terabyte matters more than peak endurance.

### Memory Pooling

CXL (Compute Express Link) 3.0 demonstrations showed memory pooling across multiple servers — a technology that could reshape data center architecture and DRAM demand. CXL-attached memory modules allow disaggregated memory that multiple compute nodes can access, potentially reducing the total DRAM a given server must carry while increasing aggregate memory bandwidth.

## DirectStorage: Current State

Microsoft showcased continued DirectStorage development, with the current DirectStorage 1.4 release supporting Zstd compression for GPU-accelerated asset decompression. Real-world adoption is growing but still limited to under a dozen major game titles as of mid-2025.

Demonstrated capabilities:

- **GPU decompression**: Up to 3x faster asset loading compared to CPU decompression in supporting titles
- **Asset streaming**: Reduced pop-in and shorter loading screens in open-world games
- **NVMe requirement**: DirectStorage requires NVMe; SATA drives are not compatible with GPU decompression mode

The TwinMOS CoreX Pro Gen5 is ideally positioned for DirectStorage workloads, with bandwidth headroom that ensures consistent performance even as game assets grow in size and complexity.

## Sustainability Focus

COMPUTEX 2025 placed unprecedented emphasis on sustainability:

- **Low-power DDR5**: New modules targeting sub-1W active power for mobile applications
- **Recycled materials**: Several vendors using recycled aluminum for heatsinks
- **Packaging reduction**: Industry-wide moves toward plastic-free packaging
- **Carbon reporting**: Major manufacturers publishing supply chain emissions data

TwinMOS is committed to sustainable manufacturing from our Dubai headquarters, with ongoing initiatives to reduce packaging waste and optimize shipping logistics across our 93-country distribution network.

## Emerging Form Factors

### CAMM2 (Desktop and Laptop)

As noted above, CAMM2 gained major momentum at COMPUTEX 2025. For consumers, the technology is most immediately relevant in premium laptops and, within 2-3 years, potentially in high-end desktop builds where extreme memory speeds are desired.

### E1.S and E1.L

Enterprise form factors for dense storage deployments showed wider adoption among hyperscalers and cloud providers, though they remain well outside the consumer market.

## What This Means for Consumers

### Near-Term (2025-2026)

- DDR5-6400 to DDR5-7200 becomes standard enthusiast speed
- LPDDR6 begins appearing in flagship mobile devices
- Gen5 SSD prices drop toward Gen4 levels
- DirectStorage adoption expands as more titles implement it
- 64GB memory configurations grow in popularity for creators

### Medium-Term (2027-2028)

- Desktop DDR6 platforms emerge for early adopters
- CAMM2 potentially appears in high-end desktop builds
- Gen5 SSDs become the default for new builds
- AI-assisted features appear in consumer storage controllers
- CXL technology may influence high-end workstation design

### Long-Term (2029+)

- DDR6 matures and begins replacing DDR5 in mainstream builds
- PCIe Gen6 enters consumer market
- Memory and storage architectures continue converging
- CAMM2 potentially reshapes both laptop and compact desktop design

## TwinMOS at COMPUTEX 2025

Our booth showcased:

- **CoreX Pro Gen5** live demonstrations achieving sustained 14,000 MB/s sequential reads
- **VOLTX DDR5 RGB** synchronized lighting across 50+ devices
- **Enterprise NVMe** solutions for data center partners
- **Roadmap previews** of upcoming products for 2025-2026

We met with motherboard partners, system integrators, and distributors from across Asia, Europe, and the Americas. The feedback on our Gen5 launch and VOLTX DDR5 series has been overwhelmingly positive.

## Conclusion

COMPUTEX 2025 confirmed that the memory and storage industry continues to innovate at a rapid pace. LPDDR6 standardization and desktop CAMM2 momentum signal that the post-DDR5 era is beginning to take shape — but DDR5 has years of relevance ahead, with speeds continuing to climb and platform support expanding.

For builders and upgraders in 2025, the message is clear: invest in current technology with confidence. DDR5 and Gen5 NVMe will remain relevant and performant for years, and TwinMOS products are designed to maximize that investment. When DDR6 does arrive in force, TwinMOS will be ready.

[Explore VOLTX DDR5 →](/products/voltx-ddr5/)

[Explore CoreX Pro Gen5 →](/products/corex-pro-gen5/)

---

*TwinMOS has participated in COMPUTEX since 2002, using the show as a platform to connect with partners and showcase innovations to the global tech community. Follow us on social media for year-round updates.*
