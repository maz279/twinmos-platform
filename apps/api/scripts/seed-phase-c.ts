// Seed Phase C Content Model Data (Tasks C2a, C2b, C5a, C5b, C6a, C6b)
// Usage: node --env-file-if-exists=../../.env --experimental-strip-types --no-warnings scripts/seed-phase-c.ts
import { eq } from 'drizzle-orm';
import {
  createDb,
  navMenu,
  navItem,
  glossaryTerm,
  office,
  testimonial,
  policyDocument,
  formDefinition,
  formField,
} from '@twinmos/db';

const db = createDb();

async function seedPhaseC() {
  console.log('[seed-phase-c] Starting Phase C data seeding...');

  // ============================================================
  // 1. Navigation Menus & Items (Task C2a, C2b)
  // ============================================================
  const existingMenus = await db.select({ id: navMenu.id, code: navMenu.code }).from(navMenu);
  if (existingMenus.length === 0) {
    console.log('[seed-phase-c] Seeding Navigation Menus...');

    // Header Menu
    const [headerMenu] = await db.insert(navMenu).values({
      code: 'header',
      title: 'Primary Header Navigation',
      locale: 'en',
    }).returning();

    // Drawer Menu
    const [drawerMenu] = await db.insert(navMenu).values({
      code: 'drawer',
      title: 'Mobile Navigation Drawer',
      locale: 'en',
    }).returning();

    // Footer Menu
    const [footerMenu] = await db.insert(navMenu).values({
      code: 'footer',
      title: 'Footer Multi-Column Navigation',
      locale: 'en',
    }).returning();

    // Legal Menu
    const [legalMenu] = await db.insert(navMenu).values({
      code: 'legal',
      title: 'Legal & Compliance Links',
      locale: 'en',
    }).returning();

    // Populate Header Items (hierarchical)
    const [headerProducts] = await db.insert(navItem).values({
      menuId: headerMenu.id,
      parentId: null,
      title: 'Products',
      targetType: 'category',
      targetUrl: '/products.html',
      sort: 10,
    }).returning();

    await db.insert(navItem).values([
      { menuId: headerMenu.id, parentId: headerProducts.id, title: 'Gaming DRAM (VOLTX)', targetType: 'category', targetUrl: '/products.html?cat=gaming-dram', sort: 10 },
      { menuId: headerMenu.id, parentId: headerProducts.id, title: 'Desktop & Laptop RAM', targetType: 'category', targetUrl: '/products.html?cat=standard-dram', sort: 20 },
      { menuId: headerMenu.id, parentId: headerProducts.id, title: 'Gen5 & Gen4 NVMe SSDs', targetType: 'category', targetUrl: '/products.html?cat=nvme-ssd', sort: 30 },
      { menuId: headerMenu.id, parentId: headerProducts.id, title: '2.5" SATA SSDs', targetType: 'category', targetUrl: '/products.html?cat=sata-ssd', sort: 40 },
      { menuId: headerMenu.id, parentId: headerProducts.id, title: 'Memory Cards & Flash', targetType: 'category', targetUrl: '/products.html?cat=flash-memory', sort: 50 },
    ]);

    const [headerSolutions] = await db.insert(navItem).values({
      menuId: headerMenu.id,
      parentId: null,
      title: 'Solutions',
      targetType: 'url',
      targetUrl: '/solutions.html',
      sort: 20,
    }).returning();

    await db.insert(navItem).values([
      { menuId: headerMenu.id, parentId: headerSolutions.id, title: 'Industrial & Embedded', targetType: 'url', targetUrl: '/solutions/industrial.html', sort: 10 },
      { menuId: headerMenu.id, parentId: headerSolutions.id, title: 'Enterprise Data Storage', targetType: 'url', targetUrl: '/solutions/enterprise.html', sort: 20 },
      { menuId: headerMenu.id, parentId: headerSolutions.id, title: 'Creator & Gaming Workstations', targetType: 'url', targetUrl: '/solutions/creators.html', sort: 30 },
    ]);

    await db.insert(navItem).values([
      { menuId: headerMenu.id, parentId: null, title: 'Support', targetType: 'url', targetUrl: '/support.html', sort: 30 },
      { menuId: headerMenu.id, parentId: null, title: 'Where to Buy', targetType: 'url', targetUrl: '/where-to-buy.html', sort: 40 },
      { menuId: headerMenu.id, parentId: null, title: 'About Us', targetType: 'url', targetUrl: '/about.html', sort: 50 },
      { menuId: headerMenu.id, parentId: null, title: 'Contact', targetType: 'url', targetUrl: '/contact.html', sort: 60 },
    ]);

    // Drawer Menu Items
    await db.insert(navItem).values([
      { menuId: drawerMenu.id, parentId: null, title: 'Products Overview', targetType: 'url', targetUrl: '/products.html', sort: 10 },
      { menuId: drawerMenu.id, parentId: null, title: 'Gaming Series (VOLTX)', targetType: 'url', targetUrl: '/products.html?brand=voltx', sort: 20 },
      { menuId: drawerMenu.id, parentId: null, title: 'DRAM Modules', targetType: 'category', targetUrl: '/products.html?cat=dram', sort: 30 },
      { menuId: drawerMenu.id, parentId: null, title: 'Solid State Drives', targetType: 'category', targetUrl: '/products.html?cat=ssd', sort: 40 },
      { menuId: drawerMenu.id, parentId: null, title: 'Support & Warranty', targetType: 'url', targetUrl: '/support.html', sort: 50 },
      { menuId: drawerMenu.id, parentId: null, title: 'Global Offices', targetType: 'url', targetUrl: '/offices.html', sort: 60 },
      { menuId: drawerMenu.id, parentId: null, title: 'Tech Glossary', targetType: 'url', targetUrl: '/glossary.html', sort: 70 },
      { menuId: drawerMenu.id, parentId: null, title: 'Distributor Inquiry', targetType: 'url', targetUrl: '/contact.html?type=distributor', sort: 80 },
    ]);

    // Footer Menu Items
    const [footerCol1] = await db.insert(navItem).values({ menuId: footerMenu.id, parentId: null, title: 'Products', targetType: 'url', targetUrl: '/products.html', sort: 10 }).returning();
    await db.insert(navItem).values([
      { menuId: footerMenu.id, parentId: footerCol1.id, title: 'Gaming Memory (DDR5/DDR4)', targetType: 'url', targetUrl: '/products.html?cat=gaming-dram', sort: 10 },
      { menuId: footerMenu.id, parentId: footerCol1.id, title: 'NVMe M.2 Solid State Drives', targetType: 'url', targetUrl: '/products.html?cat=nvme-ssd', sort: 20 },
      { menuId: footerMenu.id, parentId: footerCol1.id, title: 'Enterprise Storage Solutions', targetType: 'url', targetUrl: '/solutions/enterprise.html', sort: 30 },
      { menuId: footerMenu.id, parentId: footerCol1.id, title: 'Flash Cards & Portable Drives', targetType: 'url', targetUrl: '/products.html?cat=flash', sort: 40 },
    ]);

    const [footerCol2] = await db.insert(navItem).values({ menuId: footerMenu.id, parentId: null, title: 'Support & Tools', targetType: 'url', targetUrl: '/support.html', sort: 20 }).returning();
    await db.insert(navItem).values([
      { menuId: footerMenu.id, parentId: footerCol2.id, title: 'Warranty & RMA Registration', targetType: 'url', targetUrl: '/warranty.html', sort: 10 },
      { menuId: footerMenu.id, parentId: footerCol2.id, title: 'Product Authenticity Check', targetType: 'url', targetUrl: '/sncheck.html', sort: 20 },
      { menuId: footerMenu.id, parentId: footerCol2.id, title: 'QVL & Motherboard Compatibility', targetType: 'url', targetUrl: '/compatibility.html', sort: 30 },
      { menuId: footerMenu.id, parentId: footerCol2.id, title: 'Datasheet & Driver Downloads', targetType: 'url', targetUrl: '/downloads.html', sort: 40 },
    ]);

    const [footerCol3] = await db.insert(navItem).values({ menuId: footerMenu.id, parentId: null, title: 'Company', targetType: 'url', targetUrl: '/about.html', sort: 30 }).returning();
    await db.insert(navItem).values([
      { menuId: footerMenu.id, parentId: footerCol3.id, title: 'About TwinMOS', targetType: 'url', targetUrl: '/about.html', sort: 10 },
      { menuId: footerMenu.id, parentId: footerCol3.id, title: 'Global Offices & Hubs', targetType: 'url', targetUrl: '/offices.html', sort: 20 },
      { menuId: footerMenu.id, parentId: footerCol3.id, title: 'News & Announcements', targetType: 'url', targetUrl: '/news.html', sort: 30 },
      { menuId: footerMenu.id, parentId: footerCol3.id, title: 'Careers at TwinMOS', targetType: 'url', targetUrl: '/careers.html', sort: 40 },
    ]);

    // Legal Menu Items
    await db.insert(navItem).values([
      { menuId: legalMenu.id, parentId: null, title: 'Privacy Policy', targetType: 'url', targetUrl: '/legal/privacy-policy.html', sort: 10 },
      { menuId: legalMenu.id, parentId: null, title: 'Terms of Service', targetType: 'url', targetUrl: '/legal/terms-of-service.html', sort: 20 },
      { menuId: legalMenu.id, parentId: null, title: 'Cookie Policy', targetType: 'url', targetUrl: '/legal/cookie-policy.html', sort: 30 },
      { menuId: legalMenu.id, parentId: null, title: 'Warranty Terms', targetType: 'url', targetUrl: '/legal/warranty-policy.html', sort: 40 },
    ]);

    console.log('[seed-phase-c] Navigation Menus seeded successfully.');
  }

  // ============================================================
  // 2. Glossary Terms (Task C5a, CMS-E6 - 113 Terms)
  // ============================================================
  const existingGlossary = await db.select({ id: glossaryTerm.id }).from(glossaryTerm).limit(1);
  if (existingGlossary.length === 0) {
    console.log('[seed-phase-c] Seeding 113 Glossary Terms...');
    const terms = [
      { t: 'A1 App Performance', d: 'SD card performance class guaranteeing at least 1500 read IOPS and 500 write IOPS.' },
      { t: 'A2 App Performance', d: 'SD card performance class guaranteeing at least 4000 read IOPS and 2000 write IOPS.' },
      { t: 'AES 256-bit', d: 'Advanced Encryption Standard using 256-bit cryptographic keys for military-grade hardware storage encryption.' },
      { t: 'Bad Block Management', d: 'Controller mechanism identifying and replacing defective NAND flash blocks with factory spare blocks.' },
      { t: 'Bandwidth', d: 'The maximum rate of data transfer across a memory bus or storage interface, typically measured in GB/s.' },
      { t: 'BGA', d: 'Ball Grid Array: a surface-mount packaging method used for soldering DRAM and NAND chips onto PCBs.' },
      { t: 'BIOS', d: 'Basic Input/Output System firmware initializing hardware components during power-on self-test (POST).' },
      { t: 'CAS Latency (CL)', d: 'The time delay in clock cycles between sending a column address to memory and receiving output data.' },
      { t: 'Channel Interleaving', d: 'A memory architecture technique spreading memory accesses evenly across multiple channels to maximize throughput.' },
      { t: 'Clear CMOS', d: 'Resetting the motherboard BIOS settings to factory defaults to recover from unstable overclocking profiles.' },
      { t: 'Controller', d: 'The embedded processor orchestrating read, write, wear-leveling, and ECC operations on an SSD.' },
      { t: 'DDR', d: 'Double Data Rate synchronous DRAM transferring data on both the rising and falling edges of the clock signal.' },
      { t: 'DDR2', d: 'Second-generation Double Data Rate memory with operating voltages of 1.8V.' },
      { t: 'DDR3', d: 'Third-generation Double Data Rate memory standard operating at 1.5V and 1.35V (DDR3L).' },
      { t: 'DDR4', d: 'Fourth-generation Double Data Rate memory operating at 1.2V with bank grouping and advanced refresh.' },
      { t: 'DDR5', d: 'Fifth-generation Double Data Rate memory featuring on-die ECC, dual 32-bit subchannels, and PMIC on-module.' },
      { t: 'DirectStorage', d: 'API bypassing CPU decompression to stream asset data directly from NVMe SSDs into GPU VRAM.' },
      { t: 'DRAM', d: 'Dynamic Random-Access Memory storing each bit in a capacitor and transistor requiring continuous refresh.' },
      { t: 'DRAM Cache', d: 'Dedicated high-speed DRAM chip on an SSD maintaining the Flash Translation Layer table for rapid lookup.' },
      { t: 'DRAM-less', d: 'Cost-effective SSD design lacking on-board DRAM, often utilizing Host Memory Buffer (HMB) via system RAM.' },
      { t: 'Dual-Channel', d: 'Memory subsystem utilizing two independent 64-bit channels (or four 32-bit subchannels in DDR5) to double bandwidth.' },
      { t: 'Dual-Rank', d: 'A memory module containing two distinct groups (ranks) of DRAM chips accessed through chip-select signals.' },
      { t: 'DWPD', d: 'Drive Writes Per Day: enterprise metric defining how many times total drive capacity can be rewritten daily over warranty.' },
      { t: 'ECC', d: 'Error-Correcting Code: specialized memory detecting and correcting single-bit data corruption in real time.' },
      { t: 'Endurance', d: 'Total cumulative volume of write operations a solid-state drive can sustain before NAND cell degradation occurs.' },
      { t: 'End-to-End Data Protection', d: 'Data path integrity verification calculating parity checks at every stage between host interface and NAND.' },
      { t: 'EXPO', d: 'Extended Profiles for Overclocking: AMD standard for one-click DDR5 memory overclocking profiles.' },
      { t: 'Flash Translation Layer (FTL)', d: 'Firmware translation layer mapping logical block addresses (LBA) from the host OS to physical NAND blocks.' },
      { t: 'Form Factor', d: 'Physical dimensions, mounting specifications, and connector interfaces of computer hardware components.' },
      { t: 'Frequency', d: 'The clock rate of a memory module in MHz, directly determining the timing of operations and data throughput.' },
      { t: 'Garbage Collection', d: 'Internal background SSD process moving valid data pages to clean blocks and erasing stale blocks.' },
      { t: 'Graphene Heatsink', d: 'Ultra-thin composite thermal spreader leveraging high thermal conductivity graphene to prevent SSD throttling.' },
      { t: 'Hardware Encryption', d: 'Cryptographic execution handled entirely on-board by the storage controller without CPU overhead.' },
      { t: 'Heatsink', d: 'Passive cooling component engineered to absorb and dissipate heat away from memory or storage controllers.' },
      { t: 'Host Memory Buffer (HMB)', d: 'NVMe feature permitting DRAM-less SSDs to allocate a small portion of host PC system memory as FTL cache.' },
      { t: 'IOPS', d: 'Input/Output Operations Per Second: benchmark metric measuring storage responsiveness for random 4KB accesses.' },
      { t: 'JEDEC', d: 'Joint Electron Device Engineering Council: the global semiconductor engineering standardization body.' },
      { t: 'Latency', d: 'The delay in nanoseconds or clock cycles between an operation request and the onset of its execution.' },
      { t: 'LDPC ECC', d: 'Low-Density Parity-Check: advanced iterative error correction algorithm extending 3D NAND lifespan.' },
      { t: 'Load-Reduced DIMM (LRDIMM)', d: 'Server memory module buffering both control lines and data lines to minimize memory bus capacitive loading.' },
      { t: 'LPDDR', d: 'Low-Power Double Data Rate SDRAM tailored for mobile devices, laptops, and energy-constrained platforms.' },
      { t: 'LPDDR5', d: 'High-speed low-power memory standard delivering transfer speeds up to 6400 MT/s at reduced operating voltages.' },
      { t: 'M.2', d: 'Compact internal expansion form factor supporting PCIe, SATA, and USB interfaces in lengths such as 2242, 2280, 22110.' },
      { t: 'M.2 2230', d: 'Compact 22mm x 30mm SSD form factor commonly deployed in handheld gaming PCs and ultralight laptops.' },
      { t: 'M.2 2242', d: '22mm x 42mm SSD form factor balancing small physical footprint and storage capacity for compact systems.' },
      { t: 'M.2 2280', d: 'Standard 22mm wide by 80mm long solid-state drive form factor prevalent across modern desktop and laptop motherboards.' },
      { t: 'Mean Time Between Failures (MTBF)', d: 'Predicted elapsed time between inherent failures of a mechanical or electronic system during normal operation.' },
      { t: 'Memory Bus', d: 'Electrical pathways conveying memory addresses, instructions, and data between the memory controller and RAM.' },
      { t: 'Memory Timings', d: 'Sequence of four primary cycle parameters (CL-tRCD-tRP-tRAS) governing DRAM internal cell access speeds.' },
      { t: 'MicroSD', d: 'Removable miniature flash memory card format utilized in smartphones, action cameras, and single-board computers.' },
      { t: 'MLC', d: 'Multi-Level Cell NAND flash storing 2 bits of data per memory cell.' },
      { t: 'Motherboard Chipset', d: 'Silicon circuit managing data flow between processor, memory channels, expansion slots, and storage buses.' },
      { t: 'MT/s', d: 'MegaTransfers per second: unit measuring effective Double Data Rate bus throughput independently of raw clock frequency.' },
      { t: 'NAND Flash', d: 'Non-volatile solid-state memory retaining stored data charges when electrical power is disconnected.' },
      { t: 'Non-ECC', d: 'Standard consumer memory lacking parity-based error correction bits on the module circuit.' },
      { t: 'NVMe', d: 'Non-Volatile Memory Express: high-performance protocol engineered specifically for flash storage via PCIe.' },
      { t: 'On-Die ECC', d: 'Internal error-correction mechanism built into DDR5 DRAM chips correcting single-bit errors within the cell array.' },
      { t: 'OTG (On-The-Go)', d: 'USB specification enabling mobile devices like smartphones to act as hosts for flash drives and peripherals.' },
      { t: 'Overclocking', d: 'Configuring computer hardware components to run at higher clock speeds or tighter timings than rated factory specifications.' },
      { t: 'Over-Provisioning', d: 'Reserving physical NAND capacity invisible to the host OS for garbage collection, wear leveling, and endurance.' },
      { t: 'PCB Layers', d: 'Number of copper conductive sheets bonded within a printed circuit board, providing electrical signal shielding.' },
      { t: 'PCIe', d: 'Peripheral Component Interconnect Express: high-speed serial computer expansion bus standard.' },
      { t: 'PCIe 3.0', d: 'Third-generation PCIe standard delivering approximately 1 GB/s raw bandwidth per lane.' },
      { t: 'PCIe 4.0', d: 'Fourth-generation PCIe standard delivering up to 2 GB/s per lane, achieving ~8 GB/s on x4 M.2 SSD slots.' },
      { t: 'PCIe 5.0', d: 'Fifth-generation PCIe standard delivering up to 4 GB/s per lane, reaching ~14-16 GB/s on x4 NVMe solid-state drives.' },
      { t: 'PLC', d: 'Penta-Level Cell NAND flash storing 5 bits of digital information per physical floating-gate or charge-trap cell.' },
      { t: 'PMIC', d: 'Power Management Integrated Circuit relocated directly onto DDR5 DIMM modules to regulate voltage with low noise.' },
      { t: 'Portable SSD', d: 'Compact external storage drive enclosing high-speed solid-state memory within a ruggedized portable enclosure.' },
      { t: 'Power Loss Protection (PLP)', d: 'Hardware circuit using onboard capacitors to flush volatile cache to NAND during sudden power interruption.' },
      { t: 'QLC', d: 'Quad-Level Cell NAND flash storing 4 bits per cell, maximizing storage density for high-capacity consumer drives.' },
      { t: 'Quad-Channel', d: 'Memory subsystem interleaving across four separate memory channels, common in workstation and server platforms.' },
      { t: 'QVL (Qualified Vendor List)', d: 'Motherboard manufacturer compatibility roster certifying tested and verified memory kit operation.' },
      { t: 'Random 4K Read', d: 'Storage benchmark measuring speed when accessing non-contiguous 4-kilobyte data blocks across the drive.' },
      { t: 'Random 4K Write', d: 'Performance metric measuring throughput when writing dispersed 4-kilobyte data clusters to flash storage.' },
      { t: 'Registered DIMM (RDIMM)', d: 'Server RAM containing an onboard register buffer between the memory controller and DRAM command/address pins.' },
      { t: 'Resizable BAR', d: 'PCIe feature allowing the CPU full access to the entire GPU VRAM framebuffer to eliminate data bottlenecks.' },
      { t: 'RMA', d: 'Return Merchandise Authorization: formal transaction process authorizing product return for warranty replacement.' },
      { t: 'RMA Portal', d: 'Digital self-service web console for customers and partners to submit and track warranty return claims.' },
      { t: 'S.M.A.R.T.', d: 'Self-Monitoring, Analysis and Reporting Technology diagnostic subsystem monitoring storage health parameters.' },
      { t: 'SATA', d: 'Serial Advanced Technology Attachment: legacy bus interface connecting mass storage devices at up to 6 Gbps.' },
      { t: 'SATA III', d: 'Third-revision SATA interface specifying theoretical maximum bandwidth throughput of 600 MB/s.' },
      { t: 'SD Card', d: 'Secure Digital non-volatile memory card format widely utilized in digital cameras, camcorders, and audio gear.' },
      { t: 'SDRAM', d: 'Synchronous Dynamic Random-Access Memory synchronizing its control interface with the computer system bus clock.' },
      { t: 'Secure Erase', d: 'Hardware command overwriting all NAND blocks with zero patterns or generating a new cryptographic key.' },
      { t: 'Sequential Read', d: 'Transfer rate achieved when reading continuous linear blocks of data, standard in large media file streaming.' },
      { t: 'Sequential Write', d: 'Transfer speed sustained when writing large contiguous files such as 4K/8K video recordings to disk.' },
      { t: 'Single-Rank', d: 'Memory module where all DRAM chips are connected to a single 64-bit chip-select bus signal line.' },
      { t: 'SLC', d: 'Single-Level Cell NAND flash storing 1 bit of data per cell, providing the highest endurance, reliability, and speed.' },
      { t: 'SLC Caching', d: 'Operating a fraction of TLC/QLC NAND in single-bit pseudo-SLC mode to deliver rapid burst write speeds.' },
      { t: 'SO-DIMM', d: 'Small Outline Dual In-line Memory Module designed for notebooks, mini-PCs, and compact motherboards.' },
      { t: 'SPD (Serial Presence Detect)', d: 'EEPROM chip on a memory module containing JEDEC factory timings, serial numbers, and vendor profiles.' },
      { t: 'SSD', d: 'Solid-State Drive: non-volatile data storage device using semiconductor flash memory rather than spinning magnetic platters.' },
      { t: 'TBW (Terabytes Written)', d: 'Total cumulative volume of terabytes that can be written to an SSD over its rated warranty lifespan.' },
      { t: 'TCG Opal', d: 'Trusted Computing Group security standard defining hardware self-encrypting drive management specifications.' },
      { t: 'Thermal Pad', d: 'Pre-formed thermally conductive material facilitating heat transfer between hot ICs and heatsinks.' },
      { t: 'Thermal Throttling', d: 'Automatic reduction of clock frequency or throughput to prevent semiconductor overheating and hardware damage.' },
      { t: 'Throughput', d: 'The actual realized amount of payload data processed and transferred by a system within a given time frame.' },
      { t: 'Timeline', d: 'Chronological progression of hardware architecture milestones, product releases, and corporate history.' },
      { t: 'TLC', d: 'Triple-Level Cell NAND flash storing 3 bits of data per cell, the industry standard for mainstream SSDs.' },
      { t: 'TRIM', d: 'Operating system command informing an SSD which logical data blocks are no longer in use and can be wiped.' },
      { t: 'U.2', d: '2.5-inch enterprise SSD interface formerly known as SFF-8639, routing PCIe lanes with hot-swap support.' },
      { t: 'U-DIMM', d: 'Unbuffered Dual In-line Memory Module standard for desktop personal computers and consumer workstations.' },
      { t: 'UEFI', d: 'Unified Extensible Firmware Interface: modern specification replacing legacy BIOS with GUI and security features.' },
      { t: 'UHS-I', d: 'Ultra High Speed bus interface for SD/MicroSD cards providing bus transfer speeds up to 104 MB/s.' },
      { t: 'UHS-II', d: 'Second-generation Ultra High Speed interface adding a second physical pin row to achieve up to 312 MB/s.' },
      { t: 'USB 3.2 Gen 1', d: 'Universal Serial Bus standard offering maximum signalling transfer rates of 5 Gbps.' },
      { t: 'USB 3.2 Gen 2', d: 'USB standard operating at 10 Gbps signalling speed, standard for mainstream high-speed portable SSDs.' },
      { t: 'USB 3.2 Gen 2x2', d: 'Dual-lane USB standard aggregating two 10 Gbps channels to deliver 20 Gbps external storage speeds.' },
      { t: 'USB Type-C', d: 'Reversible 24-pin connector standard supporting power delivery, video output, and high-speed data buses.' },
      { t: 'USB4', d: 'Advanced USB architecture protocol incorporating Thunderbolt 3 protocols for speeds up to 40 Gbps.' },
      { t: 'V30', d: 'Video Speed Class certifying minimum sustained sequential write speed of 30 MB/s for 4K video recording.' },
      { t: 'V60', d: 'Video Speed Class certifying minimum sustained write speed of 60 MB/s for 6K and high-frame-rate video capture.' },
      { t: 'V90', d: 'Top-tier Video Speed Class guaranteeing sustained write speeds of 90 MB/s for 8K broadcast video recording.' },
      { t: 'Voltage', d: 'Electrical potential difference supplied to hardware modules, such as 1.1V for DDR5 or 1.2V for DDR4 standard.' },
      { t: 'Warranty Tier', d: 'Designation classifying product warranty coverage duration (e.g. Standard 3-Year, 5-Year, or Limited Lifetime).' },
      { t: 'Wear Leveling', d: 'Algorithmic controller routine distributing program/erase cycles uniformly across all NAND blocks.' },
      { t: 'Where to Buy', d: 'Official TwinMOS global directory indexing authorized distributors, retail partners, and e-commerce stockists.' },
      { t: 'Write Amplification Factor (WAF)', d: 'Ratio of physical data written to NAND flash compared to logical data written by the host OS.' },
      { t: 'XMP (Extreme Memory Profile)', d: 'Intel specification allowing pre-tested overclocking timings and voltages stored on DIMM SPD chips.' },
      { t: '3D NAND', d: 'Flash memory architecture stacking memory cells vertically in multi-layer dies to achieve massive density.' },
    ];

    const values = terms.map(item => ({
      term: item.t,
      definition: item.d,
      letter: item.t.charAt(0).toUpperCase(),
      locale: 'en',
    }));

    await db.insert(glossaryTerm).values(values);
    console.log(`[seed-phase-c] ${values.length} Glossary terms seeded successfully.`);
  }

  // ============================================================
  // 3. Global Offices (Task C5b, CMS-E7)
  // ============================================================
  const existingOffices = await db.select({ id: office.id }).from(office).limit(1);
  if (existingOffices.length === 0) {
    console.log('[seed-phase-c] Seeding Global Offices...');
    await db.insert(office).values([
      {
        role: 'Global Headquarters',
        title: 'Dubai Corporate Headquarters',
        entity: 'TwinMOS Technologies Middle East FZE',
        address: 'PO Box 61129, Jebel Ali Free Zone, Dubai, United Arab Emirates',
        flag: '🇦🇪',
        note: 'Executive management, international sales, supply chain logistics, and EMEA operations.',
        sort: 10,
        locale: 'en',
      },
      {
        role: 'R&D and Design Center',
        title: 'Taiwan Technology & Innovation Center',
        entity: 'TwinMOS Technologies Inc. (Taiwan)',
        address: 'Neihu Technology Park, Taipei City, Taiwan (R.O.C.)',
        flag: '🇹🇼',
        note: 'Hardware engineering, high-speed PCB simulation, firmware R&D, and quality validation labs.',
        sort: 20,
        locale: 'en',
      },
      {
        role: 'European Logistics & Operations Hub',
        title: 'Netherlands Distribution & RMA Hub',
        entity: 'TwinMOS Europe B.V.',
        address: 'Waalhaven Oostzijde, 3087 BM Rotterdam, The Netherlands',
        flag: '🇳🇱',
        note: 'European Union fulfillment, B2B wholesale distribution, and regional RMA warranty depot.',
        sort: 30,
        locale: 'en',
      },
      {
        role: 'North America Commercial Center',
        title: 'USA Liaison & Business Development',
        entity: 'TwinMOS Americas Corporation',
        address: 'Silicon Valley Commercial Center, San Jose, California, USA',
        flag: '🇺🇸',
        note: 'North American OEM partnerships, retail channel distribution, and customer support.',
        sort: 40,
        locale: 'en',
      },
      {
        role: 'Regional Support & Technical Center',
        title: 'Germany Technical Support Office',
        entity: 'TwinMOS Central Europe GmbH',
        address: 'Mainzer Landstraße, 60329 Frankfurt am Main, Germany',
        flag: '🇩🇪',
        note: 'Central European field application engineering, retail technical training, and commercial sales.',
        sort: 50,
        locale: 'en',
      },
      {
        role: 'Asia-Pacific Logistics Hub',
        title: 'Hong Kong Logistics Center',
        entity: 'TwinMOS Asia Pacific Logistics Ltd.',
        address: 'Kwai Chung Logistics Center, New Territories, Hong Kong SAR',
        flag: '🇭🇰',
        note: 'APAC bonded warehousing, multimodal cargo consolidation, and high-volume freight logistics.',
        sort: 60,
        locale: 'en',
      },
    ]);
    console.log('[seed-phase-c] Global Offices seeded successfully.');
  }

  // ============================================================
  // 4. Testimonials (Task C5b, CMS-E8)
  // ============================================================
  const existingTestimonials = await db.select({ id: testimonial.id }).from(testimonial).limit(1);
  if (existingTestimonials.length === 0) {
    console.log('[seed-phase-c] Seeding Testimonials...');
    await db.insert(testimonial).values([
      {
        quote: 'We standardise all our custom AI training rigs on TwinMOS VOLTX DDR5. Over 18 months of intensive 24/7 compute workloads, memory failure rates have remained at absolute zero.',
        author: 'Marcus Vance',
        role: 'Chief Technology Officer',
        context: 'Apex Neural Systems (High-Performance Compute)',
        permissionFlag: true,
        sort: 10,
        locale: 'en',
      },
      {
        quote: 'TwinMOS NVMe Gen4 drives deliver the sustained write performance our broadcast production team needs when editing multi-cam 8K ProRes timelines under unforgiving broadcast deadlines.',
        author: 'Elena Rostova',
        role: 'Post-Production Supervisor',
        context: 'CineNordic Studios Europe',
        permissionFlag: true,
        sort: 20,
        locale: 'en',
      },
      {
        quote: 'As a regional IT distributor moving over 50,000 components monthly, TwinMOS provides the perfect harmony of tier-1 NAND quality, attractive commercial margins, and reliable warranty support.',
        author: 'Tariq Al-Mansoor',
        role: 'Managing Director',
        context: 'Gulf Silicon Components Distribution FZCO',
        permissionFlag: true,
        sort: 30,
        locale: 'en',
      },
      {
        quote: 'The thermal stability of the Graphene-heatsink Gen5 SSD is extraordinary. Even inside compact SFF builds with minimal airflow, write speeds never throttle during endurance stress testing.',
        author: 'Dave Chen',
        role: 'Lead Hardware Reviewer',
        context: 'TechBench PC Labs Taiwan',
        permissionFlag: true,
        sort: 40,
        locale: 'en',
      },
      {
        quote: 'Upgrading our corporate laptop fleet to TwinMOS industrial-grade memory extended the service life of 2,400 machines by three years, reducing IT capital expenditures significantly.',
        author: 'Sarah Jenkins',
        role: 'Head of Global Enterprise Infrastructure',
        context: 'Meridian Financial Group London',
        permissionFlag: true,
        sort: 50,
        locale: 'en',
      },
      {
        quote: 'From fast serial verification through the anti-counterfeit portal to swift RMA turnaround, TwinMOS has proven to be our most dependable hardware partner across the Middle East and Africa.',
        author: 'Rashid Kabbani',
        role: 'Procurement Director',
        context: 'Al-Khaleej Systems Integration Co.',
        permissionFlag: true,
        sort: 60,
        locale: 'en',
      },
    ]);
    console.log('[seed-phase-c] Testimonials seeded successfully.');
  }

  // ============================================================
  // 5. Policy Documents (Task C6a, CMS-E8)
  // ============================================================
  const existingPolicies = await db.select({ id: policyDocument.id }).from(policyDocument).limit(1);
  if (existingPolicies.length === 0) {
    console.log('[seed-phase-c] Seeding Policy Documents...');
    await db.insert(policyDocument).values([
      {
        slug: 'privacy-policy',
        title: 'TwinMOS Global Privacy Policy',
        version: '2.1',
        status: 'published',
        effectiveDate: new Date('2026-01-01'),
        summary: 'Comprehensive details on how TwinMOS Technologies collects, processes, protects, and governs user personal data in compliance with GDPR, CCPA, and international data protection laws.',
        body: 'TwinMOS Technologies respects your privacy and is committed to protecting your personal information. This Privacy Policy details our practices concerning data collection, telemetry logging, warranty registration records, and your statutory rights to access, rectify, or erase your information under applicable global regulations.',
        cookieCategories: [
          { key: 'essential', label: 'Strictly Necessary', description: 'Mandatory cookies required for security, authentication, and core website functionality.', required: true },
          { key: 'functional', label: 'Functional Cookies', description: 'Stores user preferences such as selected language, currency, and region.', required: false },
          { key: 'analytics', label: 'Performance & Analytics', description: 'Collects anonymized traffic metrics to evaluate page speed and navigational performance.', required: false },
        ],
        locale: 'en',
      },
      {
        slug: 'terms-of-service',
        title: 'Website Terms of Service & Commercial Usage',
        version: '1.4',
        status: 'published',
        effectiveDate: new Date('2026-01-01'),
        summary: 'Terms and conditions governing the access, browsing, partner portal utilization, and electronic service engagements with TwinMOS Technologies online properties.',
        body: 'By accessing or using the TwinMOS Corporate Website, B2B Partner Portal, or warranty verification utilities, you agree to be bound by these Terms of Service. All content, technical specifications, brand trademarks, and downloadable software assets are the proprietary intellectual property of TwinMOS Technologies.',
        cookieCategories: [],
        locale: 'en',
      },
      {
        slug: 'cookie-policy',
        title: 'Cookie & Tracking Technologies Policy',
        version: '2.0',
        status: 'published',
        effectiveDate: new Date('2026-01-01'),
        summary: 'Transparent breakdown of cookie classifications, storage lifespans, purpose declarations, and granular opt-out mechanisms available on TwinMOS digital portals.',
        body: 'This Cookie Policy explains how TwinMOS uses cookies and similar storage technologies on our website. You have full control over non-essential tracking cookies and can adjust your consent preferences at any time through our interactive privacy consent manager.',
        cookieCategories: [
          { key: 'essential', label: 'Strictly Necessary', description: 'Essential cookies ensuring session integrity, CSRF protection, and load balancing.', required: true },
          { key: 'analytics', label: 'Analytics & Optimization', description: 'Assists in identifying bottlenecks and optimizing content delivery worldwide.', required: false },
        ],
        locale: 'en',
      },
      {
        slug: 'warranty-policy',
        title: 'Global Warranty Policy & Return Merchandise (RMA) Terms',
        version: '3.0',
        status: 'published',
        effectiveDate: new Date('2026-01-01'),
        summary: 'Standard, extended, and lifetime warranty coverage guidelines, RMA claim eligibility criteria, counterfeit verification mandates, and replacement procedures for all TwinMOS product tiers.',
        body: 'TwinMOS Technologies warrants that all branded memory modules, solid-state storage drives, and flash cards are free from manufacturing defects in materials and workmanship. Warranty periods vary by product tier: DRAM modules feature Limited Lifetime Warranty; NVMe/SATA SSDs carry 3-Year or 5-Year coverage subject to TBW endurance limits; Flash memory cards carry 3-Year to 5-Year terms.',
        cookieCategories: [],
        locale: 'en',
      },
    ]);
    console.log('[seed-phase-c] Policy Documents seeded successfully.');
  }

  // ============================================================
  // 6. Form Definitions & Fields (Task C6b, CMS-E14)
  // ============================================================
  const existingForms = await db.select({ id: formDefinition.id }).from(formDefinition).limit(1);
  if (existingForms.length === 0) {
    console.log('[seed-phase-c] Seeding 7 Form Definitions & Fields...');

    // 1. General Contact Form
    const [fContact] = await db.insert(formDefinition).values({
      type: 'contact',
      title: 'General Contact & Inquiries',
      description: 'Get in touch with the TwinMOS global customer and corporate communications team.',
      successMessage: 'Thank you for contacting TwinMOS. Our team will review your message and respond within 24 business hours.',
      routingEmail: 'contact@twinmos.com',
      privacyNotice: 'Your details are processed strictly in accordance with our Global Privacy Policy.',
      isActive: true,
    }).returning();

    await db.insert(formField).values([
      { formId: fContact.id, name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'e.g. Jane Doe', required: true, sort: 10 },
      { formId: fContact.id, name: 'email', label: 'Business Email', type: 'email', placeholder: 'jane@company.com', required: true, sort: 20 },
      { formId: fContact.id, name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 555-0199', required: false, sort: 30 },
      { formId: fContact.id, name: 'country', label: 'Country / Region', type: 'text', placeholder: 'e.g. United Arab Emirates', required: true, sort: 40 },
      { formId: fContact.id, name: 'subject', label: 'Inquiry Subject', type: 'select', required: true, options: ['Product Information', 'Technical Support', 'Sales Inquiry', 'Media Relations', 'Other'], sort: 50 },
      { formId: fContact.id, name: 'message', label: 'Message Details', type: 'textarea', placeholder: 'Please describe your request...', required: true, sort: 60 },
    ]);

    // 2. RMA Claim Form
    const [fRma] = await db.insert(formDefinition).values({
      type: 'rma',
      title: 'Warranty Service & RMA Claim Request',
      description: 'Submit a formal Return Merchandise Authorization claim for defective hardware inspection or replacement.',
      successMessage: 'Your RMA claim has been registered. You will receive an email confirmation with RMA tracking instructions.',
      routingEmail: 'rma@twinmos.com',
      privacyNotice: 'RMA serial validation and service records are stored in compliance with our Global Warranty Policy.',
      isActive: true,
    }).returning();

    await db.insert(formField).values([
      { formId: fRma.id, name: 'customerName', label: 'Contact Person', type: 'text', placeholder: 'Full Name', required: true, sort: 10 },
      { formId: fRma.id, name: 'customerEmail', label: 'Contact Email', type: 'email', placeholder: 'name@domain.com', required: true, sort: 20 },
      { formId: fRma.id, name: 'productModel', label: 'Product Model / SKU', type: 'text', placeholder: 'e.g. VLT-DDR5-6000-16G', required: true, sort: 30 },
      { formId: fRma.id, name: 'serialNumber', label: 'Product Serial Number (SN)', type: 'text', placeholder: 'Scan or enter 14-digit serial', required: true, sort: 40 },
      { formId: fRma.id, name: 'purchaseDate', label: 'Purchase Date', type: 'text', placeholder: 'YYYY-MM-DD', required: true, sort: 50 },
      { formId: fRma.id, name: 'placeOfPurchase', label: 'Place of Purchase / Vendor', type: 'text', placeholder: 'Retail store or e-tailer', required: true, sort: 60 },
      { formId: fRma.id, name: 'defectDescription', label: 'Fault Description & Symptoms', type: 'textarea', placeholder: 'Describe memory errors, bluescreens, non-detection, etc.', required: true, sort: 70 },
    ]);

    // 3. B2B Inquiry Form
    const [fB2b] = await db.insert(formDefinition).values({
      type: 'b2b',
      title: 'B2B & Enterprise Volume Purchasing',
      description: 'Request commercial quotation, customized enterprise NAND builds, or volume memory allocation.',
      successMessage: 'Thank you for your inquiry. A regional TwinMOS account executive will reach out promptly.',
      routingEmail: 'b2b-sales@twinmos.com',
      privacyNotice: 'Corporate inquiry records are managed confidentially under corporate commercial terms.',
      isActive: true,
    }).returning();

    await db.insert(formField).values([
      { formId: fB2b.id, name: 'companyName', label: 'Company / Organization Name', type: 'text', placeholder: 'Enterprise Ltd.', required: true, sort: 10 },
      { formId: fB2b.id, name: 'contactName', label: 'Authorized Representative', type: 'text', placeholder: 'Full Name', required: true, sort: 20 },
      { formId: fB2b.id, name: 'businessEmail', label: 'Official Corporate Email', type: 'email', placeholder: 'procurement@company.com', required: true, sort: 30 },
      { formId: fB2b.id, name: 'estimatedVolume', label: 'Estimated Monthly Units', type: 'select', required: true, options: ['100 - 500 units', '500 - 2,500 units', '2,500 - 10,000 units', '10,000+ units'], sort: 40 },
      { formId: fB2b.id, name: 'projectRequirements', label: 'Technical Specifications & Project Scope', type: 'textarea', placeholder: 'Specify capacity, form factor, controller preference, etc.', required: true, sort: 50 },
    ]);

    // 4. Distributor Application Form
    const [fDist] = await db.insert(formDefinition).values({
      type: 'distributor',
      title: 'Official Distributor Application',
      description: 'Apply to become an authorized regional TwinMOS channel distributor and logistics partner.',
      successMessage: 'Your distributor application has been submitted to the Executive Channel Board for review.',
      routingEmail: 'distributors@twinmos.com',
      privacyNotice: 'Distribution partnership vetting is subject to non-disclosure and commercial review.',
      isActive: true,
    }).returning();

    await db.insert(formField).values([
      { formId: fDist.id, name: 'legalEntityName', label: 'Registered Business Name', type: 'text', placeholder: 'Official Commercial Entity Name', required: true, sort: 10 },
      { formId: fDist.id, name: 'territoryCountry', label: 'Proposed Distribution Territory', type: 'text', placeholder: 'Country or Geographic Region', required: true, sort: 20 },
      { formId: fDist.id, name: 'businessRegistrationNumber', label: 'Business License / VAT Number', type: 'text', placeholder: 'Commercial Registry No.', required: true, sort: 30 },
      { formId: fDist.id, name: 'annualRevenue', label: 'Annual Turnover (USD)', type: 'select', required: true, options: ['Under $1M', '$1M - $5M', '$5M - $25M', 'Over $25M'], sort: 40 },
      { formId: fDist.id, name: 'primaryContactEmail', label: 'Principal Executive Email', type: 'email', placeholder: 'director@distributor.com', required: true, sort: 50 },
      { formId: fDist.id, name: 'channelOverview', label: 'Current Distribution Network Summary', type: 'textarea', placeholder: 'Describe retail footprint, sub-dealer network, warehousing capacity...', required: true, sort: 60 },
    ]);

    // 5. Partner Portal Registration
    const [fPartner] = await db.insert(formDefinition).values({
      type: 'partner',
      title: 'Partner Portal Access Request',
      description: 'Register for verified partner access to real-time inventory price lists, marketing collaterals, and firmware assets.',
      successMessage: 'Your portal access request is pending verification. Check your email for authentication instructions.',
      routingEmail: 'partner-admin@twinmos.com',
      privacyNotice: 'Portal credentials require authentication and periodic password rotation.',
      isActive: true,
    }).returning();

    await db.insert(formField).values([
      { formId: fPartner.id, name: 'partnerOrgName', label: 'Partner Organization', type: 'text', placeholder: 'Registered Organization Name', required: true, sort: 10 },
      { formId: fPartner.id, name: 'representativeName', label: 'Representative Name', type: 'text', placeholder: 'First & Last Name', required: true, sort: 20 },
      { formId: fPartner.id, name: 'corporateEmail', label: 'Verified Corporate Email', type: 'email', placeholder: 'user@partner.org', required: true, sort: 30 },
      { formId: fPartner.id, name: 'partnerType', label: 'Partnership Category', type: 'select', required: true, options: ['Authorized Distributor', 'Retail Stockist', 'System Integrator (SI)', 'OEM Partner'], sort: 40 },
      { formId: fPartner.id, name: 'accountReason', label: 'Portal Usage Scope', type: 'textarea', placeholder: 'Indicate which assets or tools are required.', required: false, sort: 50 },
    ]);

    // 6. Press & Media Inquiries
    const [fPress] = await db.insert(formDefinition).values({
      type: 'press',
      title: 'Press & Media Relations',
      description: 'Inquiries from tech journalists, review publications, hardware benchmark outlets, and content creators.',
      successMessage: 'Thank you for reaching out. The TwinMOS PR team will respond with review samples or press kit assets.',
      routingEmail: 'press@twinmos.com',
      privacyNotice: 'Editorial communications are handled in compliance with media embargo guidelines.',
      isActive: true,
    }).returning();

    await db.insert(formField).values([
      { formId: fPress.id, name: 'publicationName', label: 'Publication / Media Channel', type: 'text', placeholder: 'e.g. Hardware Review Magazine', required: true, sort: 10 },
      { formId: fPress.id, name: 'journalistName', label: 'Journalist / Creator Name', type: 'text', placeholder: 'Full Name', required: true, sort: 20 },
      { formId: fPress.id, name: 'mediaRequestType', label: 'Request Type', type: 'select', required: true, options: ['Review Sample Request', 'Executive Interview', 'Press Release Query', 'Event Attendance'], sort: 30 },
    ]);

    // 7. Product Feedback Form
    const [fFeedback] = await db.insert(formDefinition).values({
      type: 'feedback',
      title: 'Product Experience & Community Feedback',
      description: 'Share your hardware feedback, feature suggestions, or compatibility observations directly with our R&D team.',
      successMessage: 'Thank you for your valuable feedback! Your insights directly guide future TwinMOS product engineering.',
      routingEmail: 'feedback@twinmos.com',
      privacyNotice: 'Community submissions are anonymized and reviewed by engineering teams.',
      isActive: true,
    }).returning();

    await db.insert(formField).values([
      { formId: fFeedback.id, name: 'productFamily', label: 'Product Family', type: 'select', required: true, options: ['Gaming DRAM (VOLTX)', 'Standard Desktop/Laptop RAM', 'NVMe PCIe Gen5/Gen4 SSDs', 'SATA 2.5" SSDs', 'USB & Portable Storage', 'Memory Cards'], sort: 10 },
      { formId: fFeedback.id, name: 'satisfactionRating', label: 'Overall Experience Rating', type: 'select', required: true, options: ['5 - Exceptional', '4 - Very Good', '3 - Satisfactory', '2 - Needs Improvement', '1 - Unsatisfactory'], sort: 20 },
      { formId: fFeedback.id, name: 'feedbackDetails', label: 'Detailed Feedback or Improvement Idea', type: 'textarea', placeholder: 'Tell us about your setup, benchmark scores, or design suggestions...', required: true, sort: 30 },
      { formId: fFeedback.id, name: 'allowContact', label: 'TwinMOS R&D may contact me for follow-up details', type: 'checkbox', required: false, sort: 40 },
    ]);

    console.log('[seed-phase-c] 7 Form Definitions and 36 Form Fields seeded successfully.');
  }

  console.log('[seed-phase-c] Phase C data seeding completed successfully!');
  process.exit(0);
}

seedPhaseC().catch((err) => {
  console.error('[seed-phase-c] Fatal error during seeding:', err);
  process.exit(1);
});
