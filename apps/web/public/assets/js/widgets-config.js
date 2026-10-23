/**
 * TwinMOS Interactive Islands - Canonical Widget Configurations
 * Milestone MS4.8 / T4.8.2 / C4e
 * Decouples widget data literals from app.js runtime scripts.
 */
(function (global) {
  'use strict';

  global.TWINMOS_WIDGET_CONFIGS = {
    advisor: {
      laptop: [
        { id: 'ram', label: '⚡ Fast Laptop Memory (SO-DIMM)', prodId: 'voltx-ddr5-so-dimm-for-laptop', tag: 'DDR5 · 5600MHz · MTCD Thermal', desc: 'High-density DDR5 SODIMM to eradicate multitasking lag in modern laptops.' },
        { id: 'ssd', label: '🚀 M.2 NVMe SSD Expansion', prodId: 'alphapro-nvme-m2-2280-new-ssd', tag: 'PCIe Gen 3/4 · M.2 2280', desc: 'High-speed NVMe SSD with low power consumption and high endurance for slim laptops.' }
      ],
      desktop: [
        { id: 'gen5', label: '🔥 Flagship PCIe Gen 5.0 SSD', prodId: 'corex-pro-m2-pcie-gen-5-0-nvme-ssd', tag: '14,000 MB/s · Graphene Foil', desc: 'Next-generation NVMe 2.0 throughput for uncompromising PC rigs and heavy workloads.' },
        { id: 'ddr5', label: '⚡ VOLTX DDR5 RGB RAM', prodId: 'voltx-rgb-ddr5-u-dimm-for-desktop', tag: 'DDR5-6000 · Intel XMP 3.0', desc: 'Board-synced addressable RGB lighting, on-die ECC, and lifetime warranty.' },
        { id: 'psu', label: '🔌 80 PLUS Bronze Power', prodId: 'smartx-rgb-80-plus-bronze-power-supply-550w', tag: '550W · 80 PLUS Bronze · RGB', desc: 'Clean, reliable 12V single rail power delivery with hydraulic silent fan.' }
      ],
      gaming: [
        { id: 'gen5_direct', label: '🎮 DirectStorage Gen 5.0 SSD', prodId: 'corex-pro-m2-pcie-gen-5-0-nvme-ssd', tag: 'DirectStorage Ready · 14,000 MB/s', desc: 'Streams game assets directly to GPU VRAM for instant open-world transitions.' },
        { id: 'rgb_ram', label: '⚡ VOLTX RGB 6000MHz Memory', prodId: 'voltx-rgb-ddr5-u-dimm-for-desktop', tag: 'Low Latency · Sync Lighting', desc: 'Engineered for overclocking headroom and high FPS stability in demanding titles.' },
        { id: 'ps5_ssd', label: '🕹️ PS5 Compatible Gen 4 NVMe', prodId: 'xtreme-gen4x4-nvme-pro-m2-2280-ssd', tag: 'PCIe Gen 4x4 · Up to 7,400 MB/s', desc: 'Meets and exceeds PlayStation 5 internal expansion requirements with heatsink.' }
      ],
      creator: [
        { id: 'portable', label: '💼 1,100 MB/s Portable USB-C SSD', prodId: 'portable-ssd-elite-drive-pro-usb-type-c', tag: 'USB 3.2 Gen 2 · Rugged Pocket', desc: 'Shock-resistant pocket storage for on-set 4K video scrubbing and high-speed backups.' },
        { id: 'nvme_2tb', label: '🎬 High-Endurance 2TB NVMe', prodId: 'corex-pro-m2-pcie-gen-5-0-nvme-ssd', tag: '1,400 TBW · 3D TLC NAND', desc: 'Endurance and speed tuned for massive ProRes renders and uncompressed video timelines.' },
        { id: 'microsd_v30', label: '📹 4K V30 MicroSD Card', prodId: 'microsdxc-class-10-v30-uhs-3', tag: 'V30 · UHS-I U3 · 4K UHD Video', desc: 'Validated for 4K action cameras, drones, and handheld gaming consoles.' }
      ]
    },
    speed_visualizer: {
      directstorage: {
        takeaway: 'TwinMOS CoreX Pro Gen 5 streams assets directly to GPU VRAM at up to 14,000 MB/s, cutting massive open-world texture load times from minutes on HDD down to just 3.6 seconds.',
        rows: [
          { name: 'TwinMOS CoreX Pro', badge: 'Gen 5', bCls: 'sbg-g5', fCls: 'sbf-g5', pct: 100, speed: '14,000 MB/s', eta: '3.6 sec' },
          { name: 'PCIe Gen 4.0 NVMe', badge: 'Gen 4', bCls: 'sbg-g4', fCls: 'sbf-g4', pct: 53, speed: '7,400 MB/s', eta: '6.8 sec' },
          { name: 'PCIe Gen 3.0 NVMe', badge: 'Gen 3', bCls: 'sbg-g3', fCls: 'sbf-g3', pct: 25, speed: '3,500 MB/s', eta: '14.3 sec' },
          { name: 'SATA III 2.5″ SSD', badge: 'SATA', bCls: 'sbg-sata', fCls: 'sbf-sata', pct: 14, speed: '550 MB/s', eta: '1m 31s' },
          { name: 'Mechanical 7.2K HDD', badge: 'HDD', bCls: 'sbg-hdd', fCls: 'sbf-hdd', pct: 8, speed: '120 MB/s', eta: '6m 56s' }
        ]
      },
      video8k: {
        takeaway: 'Exporting or scrubbing 100GB of ProRes 8K video streams saturates interface bandwidth. CoreX Pro Gen 5.0 with graphene cooling handles sustained workloads without throttling.',
        rows: [
          { name: 'TwinMOS CoreX Pro', badge: 'Gen 5', bCls: 'sbg-g5', fCls: 'sbf-g5', pct: 100, speed: '14,000 MB/s', eta: '7.1 sec' },
          { name: 'PCIe Gen 4.0 NVMe', badge: 'Gen 4', bCls: 'sbg-g4', fCls: 'sbf-g4', pct: 53, speed: '7,400 MB/s', eta: '13.5 sec' },
          { name: 'PCIe Gen 3.0 NVMe', badge: 'Gen 3', bCls: 'sbg-g3', fCls: 'sbf-g3', pct: 25, speed: '3,500 MB/s', eta: '28.6 sec' },
          { name: 'SATA III 2.5″ SSD', badge: 'SATA', bCls: 'sbg-sata', fCls: 'sbf-sata', pct: 14, speed: '550 MB/s', eta: '3m 02s' },
          { name: 'Mechanical 7.2K HDD', badge: 'HDD', bCls: 'sbg-hdd', fCls: 'sbf-hdd', pct: 8, speed: '120 MB/s', eta: '13m 53s' }
        ]
      },
      boot: {
        takeaway: 'Instantaneous boot and application launch: 14,000 MB/s sequential combined with high 4K random IOPS launches the OS and creative suites almost instantaneously.',
        rows: [
          { name: 'TwinMOS CoreX Pro', badge: 'Gen 5', bCls: 'sbg-g5', fCls: 'sbf-g5', pct: 100, speed: '14,000 MB/s', eta: '4.2 sec' },
          { name: 'PCIe Gen 4.0 NVMe', badge: 'Gen 4', bCls: 'sbg-g4', fCls: 'sbf-g4', pct: 60, speed: '7,400 MB/s', eta: '7.5 sec' },
          { name: 'PCIe Gen 3.0 NVMe', badge: 'Gen 3', bCls: 'sbg-g3', fCls: 'sbf-g3', pct: 36, speed: '3,500 MB/s', eta: '12.0 sec' },
          { name: 'SATA III 2.5″ SSD', badge: 'SATA', bCls: 'sbg-sata', fCls: 'sbf-sata', pct: 22, speed: '550 MB/s', eta: '26.0 sec' },
          { name: 'Mechanical 7.2K HDD', badge: 'HDD', bCls: 'sbg-hdd', fCls: 'sbf-hdd', pct: 10, speed: '120 MB/s', eta: '85.0 sec' }
        ]
      }
    },
    flagship: {
      all: ['voltx-rgb-ddr5-u-dimm-for-desktop', 'corex-pro-m2-pcie-gen-5-0-nvme-ssd', 'portable-ssd-elite-drive-pro-usb-type-c', 'tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop'],
      nvme: ['corex-pro-m2-pcie-gen-5-0-nvme-ssd', 'corex-m2-pcie-gen-4-0-nvme-ssd', 'xtreme-gen4x4-nvme-pro-m2-2280-ssd', 'alphapro-nvme-m2-2280-new-ssd'],
      gaming: ['voltx-rgb-ddr5-u-dimm-for-desktop', 'voltx-ddr5-u-dimm-for-desktop', 'tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop', 'smartx-rgb-80-plus-bronze-power-supply-550w'],
      portable: ['portable-ssd-elite-drive-pro-usb-type-c', 'portable-ssd-elitedrive-usb-3-0-type-c', 'portable-hdd-prodrive-ultra-usb-3-0', 'x3-ultra-usb-3-2-flash-drive']
    }
  };
})(typeof window !== 'undefined' ? window : this);
