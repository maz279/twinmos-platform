# -*- coding: utf-8 -*-
"""TwinMOS prototype — content module (pure data, no I/O).
All corporate facts sourced from twinmos_mirror/authoritative_facts.md and the
live-site mirror crawl (2026-09-23). Demo items are explicitly labeled."""

CATS = [
    ('dram-gaming',   'Gaming DRAM'),
    ('dram-desktop',  'Desktop DRAM'),
    ('dram-notebook', 'Notebook DRAM'),
    ('ssd-nvme',      'NVMe SSD'),
    ('ssd-sata',      'SATA SSD'),
    ('portable-ssd',  'Portable SSD'),
    ('portable-hdd',  'Portable HDD'),
    ('flash',         'USB Flash Drive'),
    ('microsd',       'MicroSD Card'),
    ('psu',           'Power Supply'),
    ('hub',           'USB HUB'),
]

CURATED = {
    'TwinMOS VOLTX RGB DDR5 U-DIMM for Desktop': 'rgb-ram.webp',
    'TwinMOS VOLTX DDR5 U-DIMM for Desktop': 'voltx-rgb-elem.webp',
    'TwinMOS VOLTX DDR5 SO-DIMM for Laptop': 'sodimm.webp',
    'TwinMOS TornadoX7 Pro DDR4 3200MHz CL16 U-DIMM for Desktop': 'x7-pro.webp',
    'TwinMOS TornadoX7 DDR4 3200MHz CL22 U-DIMM for Desktop': 'tornado-x7.webp',
    'TwinMOS TornadoX6 DDR4 3200MHz U-DIMM for Desktop': 'tornado-x7.webp',
    'TwinMOS Thunder GX DDR4 U-DIMM for Desktop': 'thundergx.webp',
    'TwinMOS DDR4 Concord CL16 RGB Gaming For Desktop': 'rgb-ram.webp',
    'TwinMOS CoreX Pro M.2 PCIe Gen 5.0 NVMe SSD': 'corex-pro.webp',
    'TwinMOS CoreX M.2 PCIe Gen 4.0 NVMe SSD': 'corex-final.webp',
    'TwinMOS Xtreme Gen4X4 NVMe Pro M.2 2280 SSD': 'xtreme.webp',
    'TwinMOS AlphaPro NVMe M.2 2280 New SSD': 'alphapro.png',
    'TwinMOS NVMe M.2 2280 SSD': 'nvme-m2.webp',
    'TwinMOS M.2 2280 SSD SATAIII': 'm2sata.webp',
    'TwinMOS Hyper SSD H2 Ultra': 'h2ultra.webp',
    'TwinMOS Portable SSD ELITE Drive Pro USB Type-C': 'elite-2.webp',
    'TwinMOS Portable SSD EliteDrive USB 3.0/Type-C': 'elite-1.webp',
    'TwinMOS Portable HDD ProDrive Ultra USB 3.0': 'prodrive-1.webp',
    'TwinMOS Portable HDD ProDrive USB 3.0': 'prodrive-2.webp',
    'TwinMOS M16 USB 3.2 Flash Drive': 'usb-m16.webp',
    'TwinMOS X3 Ultra USB 3.2 Flash Drive': 'usb-3.webp',
    'TwinMOS microSDXC Class 10 V30 UHS-3': 'microsd.png',
    'TwinMOS SmartX RGB 80 PLUS Bronze Power Supply- 550W': 'cat-psu.webp',
    'TwinMOS SmartX RGB 80 PLUS Bronze Power Supply- 450W': 'cat-psu.webp',
    'TwinMOS Xpower 80 PLUS Bronze- 450W': 'cat-psu.webp',
    'TwinMOS Xpower 80 PLUS Bronze- 550W': 'cat-psu.webp',
    'TwinMOS 4 Port USB3.0 Hub – EzeeHUB 34L-M': 'ezeehub.webp',
    'TwinMOS 3 Ports USB 2.0 and 1 Port USB 3.0 HUB – 23L': 'ezeehub.webp',
    'TwinMOS 3 Ports USB 2.0 and 1 Port USB 3.0 HUB – EzeeHUB23P': 'ezeehub.webp',
}

CAT_FALLBACK = {
    'dram-gaming': 'cat-dram.webp', 'dram-desktop': 'cat-dram.webp', 'dram-notebook': 'cat-dram.webp',
    'ssd-nvme': 'cat-nvme.webp', 'ssd-sata': 'cat-sata.webp',
    'portable-ssd': 'cat-portable.webp', 'portable-hdd': 'cat-portable.webp',
    'flash': 'cat-usb.webp', 'microsd': 'cat-microsd.webp', 'psu': 'cat-psu.webp', 'hub': 'ezeehub.webp',
}

FEATURED = [
    'voltx-rgb-ddr5-u-dimm-for-desktop', 'corex-pro-m2-pcie-gen-5-0-nvme-ssd',
    'portable-ssd-elite-drive-pro-usb-type-c', 'tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop',
]
IS_NEW = {'corex-pro-m2-pcie-gen-5-0-nvme-ssd', 'corex-m2-pcie-gen-4-0-nvme-ssd',
          'voltx-rgb-ddr5-u-dimm-for-desktop', 'voltx-ddr5-u-dimm-for-desktop',
          'voltx-ddr5-so-dimm-for-laptop', 'xtreme-gen4x4-nvme-pro-m2-2280-ssd',
          'alphapro-nvme-m2-2280-new-ssd'}

WARRANTY_DEFAULT = {
    'dram-gaming': 'Lifetime', 'dram-desktop': 'Lifetime', 'dram-notebook': 'Lifetime',
    'ssd-nvme': '5 Years', 'ssd-sata': '3 Years', 'flash': '5 Years', 'microsd': '5 Years',
    'portable-ssd': '3 Years', 'portable-hdd': '3 Years', 'psu': '1 Year', 'hub': '1 Year',
}

OFFICES = [
    ('Taiwan — HQ &amp; R&amp;D Center', 'TwinMOS Technologies Ltd.', '5F.-5, No. 29, Sec. 1, Minsheng E. Rd., Zhongshan Dist., Taipei City 104619, Taiwan (R.O.C.)', '🇹🇼'),
    ('Dubai — International Office (MEA/CIS)', 'TwinMOS Technologies', 'C-9, DAFZA (Dubai Airport Free Zone), Dubai, UAE', '🇦🇪'),
    ('China — Manufacturing Facility', 'TwinMOS Technologies Co., Ltd.', 'No. 5, Tech Road, Dongguan, Guangdong, China', '🇨🇳'),
    ('Europe — European Office', 'TwinMOS Europe GmbH', 'Schanzenstraße 23, 51063 Cologne, Germany', '🇩🇪'),
    ('USA — American Office', 'TwinMOS America Inc.', '12345 Silicon Valley Blvd, Suite 100, San Jose, CA 95123, USA', '🇺🇸'),
]

ARTICLES = [
 dict(id='corex-pro-gen5-launch', cat='Product News', date='2025', tag='CoreX Pro · PCIe Gen 5.0',
      title='TwinMOS Unleashes Unprecedented Speed with CoreX Pro M.2 PCIe Gen 5.0 NVMe SSD',
      desc='The TwinMOS CoreX Pro harnesses the raw power of the PCIe Gen 5.0 interface, delivering blazing sequential read speeds of up to 14,000 MB/s.',
      body=[('A new generation of storage', 'The CoreX Pro M.2 2280 SSD rides the PCIe Gen 5.0 x4 interface with NVMe 2.0, reaching sequential reads of up to 14,000 MB/s and writes of up to 10,000 MB/s — a generational leap over Gen 4 drives.'),
            ('Engineered for endurance', 'TLC 3D NAND, an LDPC engine, bad-block management and static/dynamic wear-leveling keep data intact, with rated endurance of up to 1,400 TBW on the 2 TB model. A graphene sticker keeps the controller cool under sustained loads.'),
            ('Available now', 'CoreX Pro ships in 1 TB and 2 TB capacities backed by a 5-year warranty. Check the catalog page for full specifications and where to buy.')]),
 dict(id='voltx-ddr5-rgb-gaming', cat='Product News', date='2025', tag='VOLTX · DDR5',
      title='Elevate Your Gaming Experience with TwinMOS VOLTX DDR5 Desktop DRAM RGB',
      desc='In the realm of high-performance computing, memory is a critical component that directly influences your system’s responsiveness and speed.',
      body=[('Built for gamers', 'The VOLTX DDR5 RGB U-DIMM family pairs high-frequency DDR5 ICs with an addressable RGB light bar that synchronizes with major motherboard RGB ecosystems.'),
            ('Why DDR5 matters for gaming', 'Higher densities and improved bus efficiency give modern platforms headroom for bigger maps, faster level loads and smoother multitasking while streaming.'),
            ('Explore the line', 'VOLTX spans RGB and non-RGB U-DIMM kits for desktops and SO-DIMM modules for laptops — all covered by the TwinMOS lifetime warranty on memory modules.')]),
 dict(id='gitex-global-2025', cat='Event', date='13–17 Oct 2025', tag='Dubai',
      title='TwinMOS Is Coming to GITEX GLOBAL 2025 in Dubai',
      desc='Join TwinMOS at GITEX GLOBAL 2025 in Dubai this October 13-17. Connect with our team at the TwinMOS stand and experience our latest memory and storage innovations.',
      body=[('Meet us in Dubai', 'GITEX GLOBAL is one of the largest technology exhibitions in the region. The TwinMOS team from our DAFZA office will present the full portfolio — from Gen 5 SSDs to VOLTX gaming memory.'),
            ('Why it matters', 'With a Dubai free-zone office anchoring MEA and CIS operations, TwinMOS uses regional flagship events to meet distributors, system integrators and retail partners face to face.')]),
 dict(id='computex-2025', cat='Event', date='May 2025', tag='Taipei',
      title='TwinMOS to Showcase Cutting-Edge Memory & Storage Solutions at COMPUTEX TAIPEI 2025',
      desc='Join TwinMOS at COMPUTEX TAIPEI 2025 as we unveil our latest innovations in memory and storage technology.',
      body=[('Innovation on home turf', 'COMPUTEX brings the global ICT industry to TwinMOS’s hometown of Taipei — a natural stage to premiere new DRAM and SSD platforms alongside the wider ecosystem.'),
            ('What we showed', 'The 2025 lineup spotlighted PCIe Gen 5.0 NVMe storage, the VOLTX DDR5 gaming family and the broad DDR4/DDR3 catalog that keeps legacy fleets running.')]),
 dict(id='uae-superbrand-2022', cat='News', date='2022', tag='Recognition',
      title='TwinMOS Technologies — UAE’s Superbrand in 2022',
      desc='It is a great pleasure to announce that TwinMOS Technologies has been awarded the title of UAE’s Superbrand in 2022.',
      body=[('A regional milestone', 'The Superbrand distinction recognizes brands with a strong, trusted presence in the UAE market — a region TwinMOS has served through its Dubai DAFZA office for years.')]),
 dict(id='boost-pc-performance-ram-or-ssd-first', cat='Article', date='2025', tag='Upgrade guide',
      title='Boost PC Performance: Should You Upgrade RAM or SSD First?',
      desc='Struggling with a slow PC? Discover whether you need a RAM or SSD upgrade to boost your system’s performance. Follow our expert guide to optimize your hardware.',
      body=[('Two different bottlenecks', 'RAM and storage solve different problems. Not enough memory shows up as slowdowns when you multitask; a slow drive shows up as long boot times, slow app launches and file operations that keep the disk at 100%.'),
            ('Choose RAM when', 'You routinely run many browser tabs, virtual machines, large spreadsheets or creative suites; your system often resorts to the page file; or you are moving from 8 GB in a modern workflow.'),
            ('Choose an SSD when', 'You are still on a hard disk or an older SATA drive. Moving to an NVMe SSD — such as a TwinMOS CoreX or AlphaPro M.2 — is the single most noticeable upgrade most PCs can receive.'),
            ('The pragmatic answer', 'If the machine still boots from an HDD, upgrade storage first. If it already has an NVMe drive but stalls under load, add memory. And if the platform supports DDR5 or PCIe Gen 5, a VOLTX or CoreX Pro upgrade future-proofs the build.')]),
 dict(id='dram-for-ai-computing', cat='Article', date='2025', tag='AI workloads',
      title='How Do You Choose the Best DRAM and Memory Solution for AI Computing?',
      desc='As AI transforms computing, system memory has become the critical performance bottleneck. This guide explores the strategic role of high-speed DRAM in powering local AI workloads.',
      body=[('Memory is the AI bottleneck', 'Local AI — from LLM inference to model fine-tuning — streams enormous weight files through memory. Capacity determines which models fit; bandwidth determines how fast tokens appear.'),
            ('What to prioritize', 'Capacity first: match module count to the model sizes you run. Then bandwidth: newer DDR generations and dual-channel configurations feed the CPU pipeline faster. Registered/ECC platforms matter for workstation-class reliability.'),
            ('A sensible AI PC baseline', 'For local inference workstations, 32–64 GB of DDR5 in dual channel is a strong start, paired with a fast NVMe SSD so model loads are not disk-bound. TwinMOS’s DDR5 VOLTX line covers the performance tier; the volume DDR4 catalog covers fleet desktops.')]),
 dict(id='how-much-ram-do-you-need', cat='Article', date='2025', tag='Buying guide',
      title='How Much RAM Do You Need on Your Computer?',
      desc='Is your computer slowing down when you open too many tabs or apps? Discover what RAM is, how it dictates your PC’s speed, and exactly how much memory you need.',
      body=[('What RAM does', 'RAM is the workspace your programs live in while running. More workspace means more apps and data held instantly ready, without the system swapping to disk.'),
            ('By workload', '8 GB covers browsing and office work; 16 GB is the sweet spot for most users and casual gaming; 32 GB suits content creation, development and serious multitasking; 64 GB+ is for professional video, VMs and local AI.'),
            ('Speed and capacity together', 'Once capacity is sufficient, frequency and generation (DDR4 vs DDR5) influence throughput-sensitive tasks. Match your platform: DDR5 for new builds, quality DDR4 like TwinMOS 3200 MHz kits to refresh older ones.')]),
 dict(id='nvme-gen3-gen4-gen5-explained', cat='Article', date='2025', tag='Technology',
      title='A Generational Leap in SSD Technology: Understanding NVMe Speeds (Gen3, Gen4, Gen5)',
      desc='Learn how SSD technology has evolved through NVMe generations. Discover the difference between Gen3, Gen4 and Gen5 drives — and which one fits your needs.',
      body=[('The interface ladder', 'PCIe Gen 3 tops out around 3,500 MB/s for SSDs, Gen 4 around 7,000 MB/s, and Gen 5 — like the TwinMOS CoreX Pro — reaches up to 14,000 MB/s. Each generation also raises the ceiling for queue depth and IOPS.'),
            ('Real-world gains', 'Large-file creators, gamers loading expansive worlds and anyone moving big datasets feel generational gains most. Everyday office work saturates well below Gen 3 limits.'),
            ('Backward compatibility', 'NVMe drives are backward compatible: a Gen 5 drive runs in a Gen 4 slot at Gen 4 speeds. Buy the newest generation your platform (and budget) supports — it will follow you into the next build.')]),
 dict(id='directstorage-gen5-gaming', cat='Article', date='2025', tag='Gaming',
      title='Explaining DirectStorage: How Our Gen5 SSD Will Change Your Gaming',
      desc='DirectStorage is redefining the future of gaming. Learn how TwinMOS Gen5 SSDs deliver blazing load speeds in DirectStorage-enabled titles.',
      body=[('What DirectStorage does', 'Microsoft’s DirectStorage lets games stream assets from NVMe storage directly to the GPU with minimal CPU overhead, decompressing in parallel instead of serially.'),
            ('Why Gen 5 matters here', 'DirectStorage rewards interface bandwidth. A PCIe Gen 5 drive such as the CoreX Pro keeps the pipeline fed — up to 14,000 MB/s of sequential reads — so worlds appear faster and traversal hitches less.'),
            ('Getting ready', 'Pair a Gen 5 NVMe SSD with a supported platform and DirectStorage-enabled titles; keep some headroom on the drive for the technology’s asset batches.')]),
 dict(id='how-to-check-motherboard-ram-compatibility', cat='Article', date='2025', tag='How-to',
      title='How to Check Your Motherboard and RAM Compatibility',
      desc='Building or upgrading a PC can be a rewarding experience, but ensuring all the components work together is crucial. Here is how to verify RAM fits your board.',
      body=[('Start with the QVL', 'Your motherboard’s Qualified Vendor List and manual state the memory generations (DDR3/DDR4/DDR5), maximum capacity, supported speeds and slot configuration the board is validated for.'),
            ('Match the fundamentals', 'Generation must match exactly — DDR4 will not fit a DDR5 board. Then match form factor (U-DIMM for desktops, SO-DIMM for laptops/mini PCs) and choose speeds within the board’s supported range.'),
            ('Use a compatibility finder', 'Our compatibility finder walks laptop, desktop and DIY builders from platform to matching TwinMOS modules in three steps. When in doubt, contact support with your board model and we will confirm.')]),
 dict(id='ram-glossary', cat='Article', date='2025', tag='Glossary',
      title='Decoding the Language of RAM: Your Ultimate Computer Memory Glossary',
      desc='Feeling lost in a sea of tech terms like DDR5, Latency, and DIMM? This glossary decodes the most common memory terms in plain language.',
      body=[('The essentials', 'DIMM is the module; DDR is the interface generation; MHz is the clock; CL (CAS latency) is the delay before data is served; a “kit” is a pair of matched modules meant for dual channel.'),
            ('Reading a label', '“DDR5-5600 CL36” means generation 5, 5,600 transfers per second, 36-cycle CAS latency. Lower CL at the same speed is snappier; higher capacity means more workspace.'),
            ('ECC, EXPO and XMP', 'ECC adds error correction for workstation reliability; Intel XMP 3.0 and AMD EXPO are one-step overclock profiles that bring rated speeds to life on supporting boards.')]),
 dict(id='laptop-nvme-upgrade-guide', cat='Article', date='2025', tag='How-to',
      title='Bring New Life to Your Old Laptop: TwinMOS NVMe Upgrade Guide',
      desc='Doesn’t upgrading your laptop seem a little too hard and pricey? With a TwinMOS NVMe SSD it is neither — follow this guide to a faster machine.',
      body=[('Check before you buy', 'Confirm the slot type (M.2 NVMe vs SATA), maximum supported capacity and thickness clearance in your laptop’s manual. Most machines from the last decade take an M.2 2280 NVMe drive.'),
            ('Clone or clean install', 'Disk-cloning tools copy your system wholesale; a clean OS install on the new drive sheds years of accumulation. Either way, back up first.'),
            ('After the swap', 'Boot times drop from minutes to seconds and apps launch instantly. TwinMOS NVMe lines — AlphaPro, Xtreme, CoreX — span budgets, all with 5-year warranty.')]),
]

FAQ = [
 ('DRAM', [
   ('How much RAM do I need?', '8 GB covers everyday browsing and office work; 16 GB is the sweet spot for most users and gaming; 32 GB+ suits content creation, development and local AI workloads. See our guide “How Much RAM Do You Need on Your Computer?” for details.'),
   ('What is the difference between DDR4 and DDR5?', 'DDR5 offers higher densities, higher standard speeds and improved efficiency than DDR4. The two are not interchangeable — your motherboard supports exactly one generation. Choose DDR5 for new builds; quality DDR4 (like TwinMOS 3200 MHz modules) is a great way to refresh older platforms.'),
   ('How do I check RAM compatibility with my motherboard?', 'Match the generation (DDR3/DDR4/DDR5), form factor (U-DIMM desktop / SO-DIMM laptop) and supported speed list in your board manual or QVL. Our Compatibility Finder walks you from device to matching modules in three steps.'),
   ('What does the TwinMOS lifetime warranty on memory modules cover?', 'TwinMOS memory modules carry a lifetime warranty against defects in materials and workmanship, for as long as the product line remains in production. It does not cover misuse, unauthorized modification or physical damage — see the full Warranty Policy.'),
 ]),
 ('SSD', [
   ('What is the difference between NVMe Gen3, Gen4 and Gen5?', 'Each PCIe generation roughly doubles SSD bandwidth: Gen 3 drives reach about 3,500 MB/s, Gen 4 about 7,000 MB/s, and Gen 5 drives like the TwinMOS CoreX Pro reach up to 14,000 MB/s. NVMe drives are backward compatible with older slots at that slot’s speed.'),
   ('Can I use a Gen 5 SSD in a Gen 4 motherboard?', 'Yes — NVMe SSDs are backward compatible. A CoreX Pro in a Gen 4 slot runs at Gen 4 speeds. Buy the newest generation your platform supports and it will follow you to the next build.'),
   ('Which SSD warranty applies to me?', 'TwinMOS NVMe SSDs (including CoreX Pro, CoreX, Xtreme and AlphaPro) carry a 5-year limited warranty; SATA SSDs such as the H2 Ultra and M.2 SATAIII carry 3 years.'),
   ('What is DirectStorage and do I need a special SSD?', 'DirectStorage is a Microsoft technology that streams game assets from NVMe storage directly to the GPU. It works best on high-bandwidth drives — a Gen 5 NVMe SSD like the CoreX Pro keeps the pipeline fully fed.'),
 ]),
 ('Flash & Cards', [
   ('How fast are USB 3.2 flash drives?', 'USB 3.2 Gen 1 reaches 5 Gb/s and Gen 2 up to 10 Gb/s interface speed; real-world file speeds depend on the drive. TwinMOS X3 Ultra and M16 USB 3.2 drives deliver a large step up from USB 2.0 sticks.'),
   ('What do microSD classes like V30 / UHS-3 / Class 10 mean?', 'Class 10 guarantees at least 10 MB/s sequential write; UHS-3 (U3) at least 30 MB/s; V30 is the video speed class equivalent — suited to 4K recording. The TwinMOS microSDXC Class 10 V30 UHS-3 card is built for exactly that workload.'),
   ('What warranty covers flash drives and memory cards?', 'USB flash drives and flash cards carry a 5-year limited warranty.'),
 ]),
 ('Accessories & Power', [
   ('Do TwinMOS USB hubs need external power?', 'The EzeeHUB line is bus-powered from the host port. High-draw devices (external HDDs, fast-charge phones) are best served by hubs connected to a powered host port.'),
   ('What does 80 PLUS Bronze mean on a power supply?', '80 PLUS Bronze certifies at least 82–85% efficiency at typical loads — less wasted heat and lower electricity draw. TwinMOS SmartX RGB and Xpower PSUs are 80 PLUS Bronze certified units in 450 W and 550 W.'),
   ('What warranty covers accessories?', 'Computer accessories, including USB hubs and power supplies, carry a 1-year limited warranty.'),
 ]),
]

MILESTONES = [
 ('1998', 'Founded in Taipei', 'TwinMOS Technologies begins operations in Taipei City, Taiwan — the start of a legendary memory brand.'),
 ('2001', 'Dubai DAFZA hub', 'TwinMOS Technologies Middle East FZE opens in the Dubai Airport Free Zone, anchoring MEA, CIS and South-Asia distribution at the crossroads of three continents.'),
 ('2002', 'ISO 9001:2000 certified', 'TÜV SÜD certifies TwinMOS’s quality management system, anchoring a discipline that still governs production today.'),
 ('2000s', 'Global expansion', 'Offices and operations extend across five continents — Dongguan, Cologne and San Jose join Taipei and Dubai.'),
 ('2010', 'First SSD solution award', 'The SSD line earns its first solution award at CES — the start of a decade of storage innovation.'),
 ('2022', 'VOLTX DDR5 RGB launches', 'Addressable RGB, XMP 3.0/EXPO profiles and enthusiast frequencies inaugurate the VOLTX gaming era.'),
 ('2023', 'Best SSD Manufacturer', 'The TwinMOS SSD line earns a Best SSD Manufacturer award.'),
 ('2024', 'CoreX Pro Gen 5', 'PCIe Gen 5 NVMe at up to 14,000 MB/s with graphene thermal management joins the catalog.'),
 ('Today', '93+ countries', 'Over 100 products across DRAM, SSD, portable storage, flash and accessories serve customers in more than 93 countries.'),
]

def M(v, l, **kw):
    d = dict(v=v, l=l); d.update(kw); return d

# Device facts (max_gb / slots / speed / ssd slot / ssd_cats / qvl) are demo-plausible
# values shown behind the prototype's "demo database" disclaimer — production data
# comes from the F5.4 QVL pipeline (lab + vendor QVL, quarterly refresh).
COMPAT_DB = dict(types=[
 dict(id='laptop', label='Laptop', brands=[
   dict(id='lenovo', label='Lenovo', models=[
     M('ideapad-slim-3', 'IdeaPad Slim 3 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=16, slots=1, speed='DDR4-3200', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme'],
       note='One SODIMM slot — check the installed module before ordering a second.'),
     M('thinkpad-t14-g4', 'ThinkPad T14 Gen 4 (DDR5)', gen='DDR5', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR5-5600', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme']),
     M('thinkpad-e16', 'ThinkPad E16 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=32, slots=2, speed='DDR4-3200', ssd='M.2 2280 NVMe / SATA', ssd_cats=['ssd-nvme', 'ssd-sata'])]),
   dict(id='hp', label='HP', models=[
     M('pavilion-15', 'Pavilion 15 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=16, slots=2, speed='DDR4-3200', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme']),
     M('omen-16', 'OMEN 16 (DDR5)', gen='DDR5', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR5-5600', ssd='M.2 2280 NVMe ×2', ssd_cats=['ssd-nvme']),
     M('victus-15', 'Victus 15 (DDR4/DDR5 by SKU)', gen='', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=32, slots=2, speed='DDR4-3200 / DDR5-4800', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme'],
       note='DDR generation varies by exact SKU — confirm in HP specs.')]),
   dict(id='dell', label='Dell', models=[
     M('inspiron-15-3000', 'Inspiron 15 3000 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=16, slots=2, speed='DDR4-3200', ssd='M.2 2280 NVMe / 2.5″ SATA', ssd_cats=['ssd-nvme', 'ssd-sata']),
     M('xps-15-9520', 'XPS 15 9520 (DDR5)', gen='DDR5', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR5-4800', ssd='M.2 2280 NVMe ×2', ssd_cats=['ssd-nvme']),
     M('latitude-5440', 'Latitude 5440 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=32, slots=2, speed='DDR4-3200', ssd='M.2 2230/2280 NVMe', ssd_cats=['ssd-nvme'])]),
   dict(id='asus', label='ASUS', models=[
     M('vivobook-15', 'VivoBook 15 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=16, slots=1, speed='DDR4-3200', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme'],
       note='8GB is often soldered — the single SO-DIMM slot tops the total up to 16GB.'),
     M('rog-strix-g16', 'ROG Strix G16 (DDR5)', gen='DDR5', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR5-4800', ssd='M.2 2280 NVMe ×2', ssd_cats=['ssd-nvme']),
     M('zenbook-14-oled', 'Zenbook 14 OLED (storage upgrade)', gen='', form='', cats=['portable-ssd'],
       max_gb=0, slots=0, speed='Memory soldered on board', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme', 'portable-ssd'],
       note='Many Zenbooks ship with soldered memory — the practical upgrade is storage.')]),
   dict(id='acer', label='Acer', models=[
     M('aspire-5', 'Aspire 5 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=32, slots=2, speed='DDR4-3200', ssd='M.2 2280 NVMe / 2.5″ SATA', ssd_cats=['ssd-nvme', 'ssd-sata']),
     M('nitro-5', 'Nitro 5 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=32, slots=2, speed='DDR4-3200', ssd='M.2 2280 NVMe ×2 + 2.5″ bay', ssd_cats=['ssd-nvme', 'ssd-sata'])]),
   dict(id='msi', label='MSI', models=[
     M('katana-15', 'Katana 15 (DDR5)', gen='DDR5', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR5-4800', ssd='M.2 2280 NVMe ×2', ssd_cats=['ssd-nvme']),
     M('modern-14', 'Modern 14 (DDR4)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=16, slots=1, speed='DDR4-3200', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme'])]),
   dict(id='apple', label='Apple', models=[
     M('macbook-pro-14-m3', 'MacBook Pro 14″ (M-series)', gen='', form='', cats=['portable-ssd'],
       max_gb=0, slots=0, speed='Unified memory — soldered', ssd='Internal storage soldered',
       note='MacBooks use soldered memory and storage — we recommend fast external TwinMOS portable SSDs instead.')]),
 ]),
 dict(id='desktop', label='Desktop PC', brands=[
   dict(id='hp', label='HP', models=[
     M('pavilion-tp01', 'Pavilion Desktop TP01 (DDR4)', gen='DDR4', form='U-DIMM', cats=['dram-desktop'],
       max_gb=32, slots=2, speed='DDR4-3200', ssd='M.2 NVMe + 3.5″/2.5″ bay', ssd_cats=['ssd-nvme', 'ssd-sata']),
     M('omen-45l', 'OMEN 45L (DDR5)', gen='DDR5', form='U-DIMM', cats=['dram-gaming', 'dram-desktop'],
       max_gb=64, slots=4, speed='DDR5-5200', ssd='M.2 2280 NVMe ×2 + 3.5″ bay', ssd_cats=['ssd-nvme', 'ssd-sata'])]),
   dict(id='dell', label='Dell', models=[
     M('inspiron-5410', 'Inspiron Desktop 5000 (DDR4)', gen='DDR4', form='U-DIMM', cats=['dram-desktop'],
       max_gb=32, slots=2, speed='DDR4-3200', ssd='M.2 NVMe + 3.5″ bay', ssd_cats=['ssd-nvme', 'ssd-sata']),
     M('alienware-r16', 'Alienware Aurora R16 (DDR5)', gen='DDR5', form='U-DIMM', cats=['dram-gaming', 'dram-desktop'],
       max_gb=64, slots=4, speed='DDR5-5600', ssd='M.2 2280 NVMe ×3', ssd_cats=['ssd-nvme'])]),
   dict(id='lenovo', label='Lenovo', models=[
     M('ideacentre-5i', 'IdeaCentre 5i (DDR4)', gen='DDR4', form='U-DIMM', cats=['dram-desktop'],
       max_gb=32, slots=2, speed='DDR4-3200', ssd='M.2 NVMe + 3.5″ bay', ssd_cats=['ssd-nvme', 'ssd-sata']),
     M('legion-t5-26', 'Legion T5 (DDR5)', gen='DDR5', form='U-DIMM', cats=['dram-gaming'],
       max_gb=32, slots=2, speed='DDR5-4800', ssd='M.2 2280 NVMe ×2', ssd_cats=['ssd-nvme'])]),
 ]),
 dict(id='diy', label='Motherboard (DIY build)', brands=[
   dict(id='asus', label='ASUS', models=[
     M('prime-b650m', 'PRIME B650M-A (DDR5)', gen='DDR5', form='U-DIMM', cats=['dram-desktop', 'dram-gaming'],
       max_gb=64, slots=2, speed='DDR5-6400 (OC)', ssd='M.2 Gen4 ×1 + Gen3 ×1', ssd_cats=['ssd-nvme'], qvl='verified'),
     M('tuf-b560m', 'TUF Gaming B560M (DDR4)', gen='DDR4', form='U-DIMM', cats=['dram-desktop', 'dram-gaming'],
       max_gb=128, slots=4, speed='DDR4-5000 (OC)', ssd='M.2 Gen3 ×2 + SATA ×6', ssd_cats=['ssd-nvme', 'ssd-sata'], qvl='tested'),
     M('rog-x670e', 'ROG Strix X670E (DDR5)', gen='DDR5', form='U-DIMM', cats=['dram-gaming', 'dram-desktop'],
       max_gb=128, slots=4, speed='DDR5-6400+ (OC)', ssd='M.2 Gen5 ×1 + Gen4 ×3', ssd_cats=['ssd-nvme'], qvl='verified',
       note='PCIe Gen 5 platform — pair with CoreX Pro for maximum storage speed.')]),
   dict(id='msi', label='MSI', models=[
     M('pro-b760m', 'PRO B760M (DDR5)', gen='DDR5', form='U-DIMM', cats=['dram-desktop'],
       max_gb=128, slots=4, speed='DDR5-7200 (OC)', ssd='M.2 Gen4 ×2 + SATA ×4', ssd_cats=['ssd-nvme', 'ssd-sata'], qvl='spec'),
     M('mag-b550', 'MAG B550 Tomahawk (DDR4)', gen='DDR4', form='U-DIMM', cats=['dram-gaming', 'dram-desktop'],
       max_gb=128, slots=4, speed='DDR4-4400 (OC)', ssd='M.2 Gen4 ×1 + Gen3 ×1 + SATA ×6', ssd_cats=['ssd-nvme', 'ssd-sata'], qvl='tested')]),
   dict(id='gigabyte', label='Gigabyte', models=[
     M('b650-aorus', 'B650 AORUS Elite (DDR5)', gen='DDR5', form='U-DIMM', cats=['dram-gaming', 'dram-desktop'],
       max_gb=128, slots=4, speed='DDR5-6000 (OC)', ssd='M.2 Gen4 ×2 + Gen3 ×1', ssd_cats=['ssd-nvme'], qvl='verified'),
     M('b450-aorus', 'B450 AORUS M (DDR4)', gen='DDR4', form='U-DIMM', cats=['dram-desktop'],
       max_gb=64, slots=2, speed='DDR4-3600 (OC)', ssd='M.2 Gen3 ×1 + SATA ×4', ssd_cats=['ssd-nvme', 'ssd-sata'], qvl='spec')]),
 ]),
 dict(id='minipc', label='Mini PC / NUC', brands=[
   dict(id='intel', label='Intel NUC', models=[
     M('nuc12-wsy', 'NUC 12 Wall Street Canyon (DDR4 SO-DIMM)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR4-3200', ssd='M.2 2280 NVMe ×2', ssd_cats=['ssd-nvme']),
     M('nuc13-arena', 'NUC 13 Arena (DDR4 SO-DIMM)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR4-3200', ssd='M.2 2280 NVMe + M.2 2242', ssd_cats=['ssd-nvme'])]),
   dict(id='asus', label='ASUS', models=[
     M('pn52', 'ExpertCenter PN52 (DDR5 SO-DIMM)', gen='DDR5', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR5-4800', ssd='M.2 2280 NVMe ×2', ssd_cats=['ssd-nvme']),
     M('pn54', 'ExpertCenter PN54 (DDR5 SO-DIMM)', gen='DDR5', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=64, slots=2, speed='DDR5-5600', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme'])]),
   dict(id='msi', label='MSI', models=[
     M('cub-n5', 'Cubi NUC 13 CUB (DDR4 SO-DIMM)', gen='DDR4', form='SO-DIMM', cats=['dram-notebook'],
       max_gb=32, slots=2, speed='DDR4-3200', ssd='M.2 2280 NVMe', ssd_cats=['ssd-nvme'])]),
 ]),
])

WARRANTY_BODY = (
 '<p>TwinMOS Technologies guarantees all products manufactured and bearing the “TwinMOS” labels with the conditions and limitations listed below. '
 'TwinMOS shall either repair or replace any part of its product(s) that proves defective due to faulty materials or workmanship. This warranty does not cover any defects arising from misuse, mishandling, abuse, accident, natural disaster, or any unauthorized repair, modification, or disassembly.</p>'
 '<p>This warranty applies to all “TwinMOS” labeled products based on the condition that the product(s) is still manufactured. Any product that has reached the end of its product lifetime (End-of-Life) or is discontinued shall not be covered by this warranty. The end of a product line will be announced by TwinMOS on its website three (3) months prior to the discontinuation of any product(s).</p>'
 '<h3>Duration of warranty</h3>'
 '<ul><li><b>Lifetime warranty:</b> Memory Modules</li>'
 '<li><b>Five years warranty:</b> NVMe SSD · Flash Cards · USB Flash Drives</li>'
 '<li><b>Three years warranty:</b> SATA SSD</li>'
 '<li><b>One year warranty:</b> Computer Accessories</li></ul>'
 '<p>TwinMOS Solid State Drives are designed for consumer and client applications, including desktop PCs, laptops, notebooks, and ultrabooks. These SSDs are not intended for use in server environments or enterprise computing platforms, as such scenarios can lead to accelerated wear and reduced endurance of the drives.</p>'
 '<h3>This warranty does not cover</h3>'
 '<ul><li>Wear and tear from normal use</li>'
 '<li>Any modifications, abuse, accidents, misapplication, or unauthorized repair</li>'
 '<li>Any improper operations, including any use not in accordance with the supplied product instructions</li>'
 '<li>Connection to any improper voltage supplies</li>'
 '<li>Any other cause not related to a product defect in materials or workmanship</li>'
 '<li>Products damaged during crypto mining operations</li></ul>'
 '<p><b>Note:</b> The warranties only cover repair or replacement of defective TwinMOS products, as provided above. TwinMOS is not liable for, and does not cover under warranty, any costs associated with servicing and/or the installation of TwinMOS products. TwinMOS will not discontinue support of its products, nor obsolete its products, as long as there are component materials available in the marketplace and reasonable customer demand for the products.</p>')

CAREERS_ROLES = [
    ('Firmware Engineer — SSD', 'Taipei, TW', 'Embedded firmware for NVMe controllers; C, low-level storage stacks, Gen 5 platforms.'),
    ('Validation Engineer — DRAM', 'Taipei, TW', 'Signal integrity, compatibility and burn-in validation across DDR4/DDR5 lines.'),
    ('Regional Sales Manager — MEA', 'Dubai, UAE (DAFZA)', 'Channel development across Middle East &amp; Africa with our DAFZA office team.'),
    ('Digital Marketing Specialist', 'Taipei, TW', 'SEO, performance campaigns and product launches across 9 locale markets.'),
    ('Quality Engineer', 'Dongguan, CN', 'On-line quality systems, SPC and supplier quality for the manufacturing base.'),
]

CAT_TILES = [
    ('dram-gaming', 'Gaming DRAM', 'VOLTX DDR5', 'cat-dram.webp'),
    ('ssd-nvme', 'NVMe SSD', 'Gen 5 · Gen 4 · Gen 3', 'cat-nvme.webp'),
    ('portable-ssd', 'Portable SSD', 'USB-C · High-speed', 'cat-portable.webp'),
    ('flash', 'USB Flash Drives', 'USB 3.2', 'cat-usb.webp'),
    ('microsd', 'MicroSD Cards', 'V30 · UHS-3', 'cat-microsd.webp'),
    ('psu', 'Power Supplies', '80 PLUS Bronze', 'cat-psu.webp'),
    ('hub', 'USB Hubs', 'EzeeHUB', 'ezeehub.webp'),
    ('ssd-sata', 'SATA SSD', '2.5″ · M.2 SATA', 'cat-sata.webp'),
]

SITEMAP_LINKS = [
    ('index.html', 'Home'), ('shop.html', 'Products catalog'), ('product.html', 'Product detail (per product)'),
    ('compatibility.html', 'Compatibility finder'), ('compare.html', 'Compare'), ('where-to-buy.html', 'Where to buy'),
    ('gaming.html', 'VOLTX gaming hub'), ('solutions.html', 'B2B &amp; OEM solutions'),
    ('support.html', 'Support center'), ('rma.html', 'RMA center'), ('learn.html', 'Knowledge hub'),
    ('learn-guides.html', 'Buying guides'), ('learn-explained.html', 'Technology explainers'),
    ('learn-benchmarks.html', 'Benchmarks'), ('learn-glossary.html', 'Glossary A-Z'),
    ('learn-blog.html', 'Tech insights &amp; blog'),
    ('news.html', 'Newsroom'),
    ('article.html', 'Articles (library)'), ('technology.html', 'Technology &amp; R&amp;D'), ('about.html', 'About TwinMOS'), ('careers.html', 'Careers'),
    ('contact.html', 'Contact'), ('quote.html', 'Request a quote'), ('legal.html', 'Legal &amp; warranty'),
    ('partners.html', 'Partners'), ('search.html', 'Search'), ('404.html', '404'),
]

# ---------------------------------------------------------------- hero sliders
# Each slide: kicker (uppercase chip), title (HTML allowed), lede, cta1/cta2,
# img (raw art — build.py bakes it into a blended banner), alt, mode
# ('product' = cut-out on studio scene · 'photo' = photo blended into scene),
# accent (scene palette: navy / gen5 / voltx / cyan / neon / neon2)
HOME_SLIDES = [
    dict(kicker='Legendary memory brand since 1998', accent='navy', mode='photo',
         title='Memory &amp; storage, <span class="sl-hi">engineered to last</span>',
         lede='TwinMOS designs and manufactures DRAM, SSDs, portable storage and accessories trusted in 93+ countries — from DDR5 gaming rigs to enterprise fleets, backed by up to a lifetime warranty.',
         cta1=('Explore products', 'shop.html'), cta2=('Find my upgrade', 'compatibility.html'),
         img='assets/img/voltx-rgb-bg.webp', zoom=1.22,
         alt='TwinMOS VOLTX DDR5 memory modules in a dark studio scene'),
    dict(kicker='New flagship · PCIe Gen 5.0', accent='gen5', mode='product',
         title='Up to <span class="sl-hi">14,000 MB/s</span><br>the Gen 5 era is here',
         lede='CoreX Pro M.2 2280 rides PCIe Gen 5.0 x4 with NVMe 2.0, TLC 3D NAND, graphene cooling and up to 1,400 TBW endurance. DirectStorage-ready.',
         cta1=('View CoreX Pro', 'product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd'), cta2=('Gen 3 vs 4 vs 5', 'article.html?id=nvme-gen3-gen4-gen5-explained'),
         img='assets/img/corex-pro.webp', alt='TwinMOS CoreX Pro M.2 PCIe Gen 5.0 NVMe SSD'),
    dict(kicker='VOLTX gaming line', accent='voltx', mode='product',
         title='Light up your rig —<br><span class="sl-hi">VOLTX DDR5 RGB</span>',
         lede='Addressable RGB bars, board-synced lighting and DDR5 frequencies for modern platforms. Lifetime warranty on every module.',
         cta1=('Enter the gaming hub', 'gaming.html'), cta2=('Shop gaming DRAM', 'shop.html?cat=dram-gaming'),
         img='assets/img/rgb-ram.webp', alt='TwinMOS VOLTX DDR5 RGB memory modules with addressable lighting'),
    dict(kicker='1,100 MB/s in your pocket', accent='cyan', mode='product',
         title='Portable SSD <span class="sl-hi">ELITE Drive Pro</span><br>USB Type-C',
         lede='Blazing sequential speeds of up to 1,100 MB/s read in a shock-resistant, pocket-sized USB Type-C drive for creators and professionals.',
         cta1=('View details', 'product.html?id=portable-ssd-elite-drive-pro-usb-type-c'), cta2=('Where to buy', 'where-to-buy.html'),
         img='assets/img/elite-1.webp', alt='TwinMOS Portable SSD ELITE Drive Pro USB Type-C'),
    dict(kicker='B2B · Distribution & OEM', accent='gold', mode='product',
         title='Partner with a <span class="sl-hi">global memory brand</span>',
         lede='Own-brand and OEM memory and storage since 1998 — from DDR3 to DDR5, SATA to Gen 5 NVMe — with regional support from Taipei, Dubai, Cologne and San Jose, and authorized distribution across 93+ countries.',
         cta1=('Become a partner', 'partners.html'), cta2=('Request a quote', 'quote.html'),
         img='assets/img/alphapro.png', alt='TwinMOS AlphaPro NVMe SSD on a deep navy banner'),
]

GAMING_SLIDES = [
    dict(kicker='VOLTX · TwinMOS Gaming', accent='neon', mode='photo',
         title='Built to <span class="sl-hi">dominate</span><br>every frame',
         lede='DDR5 frequencies, addressable RGB and a lifetime warranty — the VOLTX line feeds modern platforms the bandwidth games demand.',
         cta1=('Shop gaming DRAM', 'shop.html?cat=dram-gaming'), cta2=('Gen 5 SSDs', 'shop.html?cat=ssd-nvme'),
         img='assets/img/voltx-rgb-bg.webp', alt='TwinMOS VOLTX DDR5 RGB gaming memory'),
    dict(kicker='DirectStorage-ready', accent='neon2', mode='product',
         title='Gen 5 storage for<br><span class="sl-hi">instant loads</span>',
         lede='CoreX Pro delivers up to 14,000 MB/s over PCIe Gen 5.0 x4 — assets stream straight from NAND to the GPU, so open worlds stop loading and start playing.',
         cta1=('View CoreX Pro', 'product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd'), cta2=('Read the guide', 'article.html?id=directstorage-gen5-gaming'),
         img='assets/img/corex-pro.webp', alt='TwinMOS CoreX Pro PCIe Gen 5 NVMe SSD'),
    dict(kicker='Lifetime warranty', accent='neon', mode='product',
         title='Tuned today,<br><span class="sl-hi">trusted for decades</span>',
         lede='Every VOLTX module is JEDEC-compliant, validated across modern platforms and covered by TwinMOS’ lifetime DRAM warranty — trusted in 93+ countries since 1998.',
         cta1=('Shop the line', 'shop.html?cat=dram-gaming'), cta2=('Compare products', 'compare.html'),
         img='assets/img/voltx-rgb-elem.webp', alt='TwinMOS VOLTX RGB memory elements'),
]

# Article hero images (real product/brand photography from the workspace)
ARTICLE_IMGS = {
    'corex-pro-gen5-launch': 'assets/img/corex-pro.webp',
    'voltx-ddr5-rgb-gaming': 'assets/img/rgb-ram.webp',
    'gitex-global-2025': 'assets/img/hero-voltx-pc.webp',
    'computex-2025': 'assets/img/voltx-rgb-bg.webp',
    'uae-superbrand-2022': 'assets/img/usb-3.webp',
    'nvme-gen3-gen4-gen5-explained': 'assets/img/nvme-m2.webp',
    'directstorage-gen5-gaming': 'assets/img/voltx-rgb-elem.webp',
    'how-much-ram-do-you-need': 'assets/img/sodimm.webp',
    'how-to-check-motherboard-ram-compatibility': 'assets/img/cat-dram.webp',
    'laptop-nvme-upgrade-guide': 'assets/img/m2sata.webp',
    'boost-pc-performance-ram-or-ssd-first': 'assets/img/cat-nvme.webp',
    'ram-glossary': 'assets/img/alphapro.png',
    'dram-for-ai-computing': 'assets/img/hero-voltx-pc.webp',
}
