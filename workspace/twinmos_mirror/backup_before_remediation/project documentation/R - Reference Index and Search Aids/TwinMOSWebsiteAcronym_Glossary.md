# TwinMOS Corporate Website — Acronym & Glossary Reference

**Document Reference:** TWN-REF-GLOSSARY-2026-001
**Version:** 1.0
**Date:** 1 May 2026
**Classification:** Internal — All Team Members
**Prepared by:** TwinMOS Digital Transformation Team
**Audience:** TwinMOS staff, Unisoft developers, content authors, QA team, vendors

---

## Purpose

This document provides definitions for all acronyms and technical terms used across the TwinMOS corporate website project. It covers three domains:

1. **Hardware & Product Technology** — memory, storage, and electronics terms
2. **Web Development & Architecture** — frontend, backend, DevOps, and performance terms
3. **Project Management & Business** — project, compliance, and business terms

Use this glossary to ensure consistent terminology in all project documents, content pages, and communications.

---

## Part 1: Hardware & Product Technology

### Memory Technology

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **DRAM** | Dynamic Random-Access Memory | A type of RAM that stores data in capacitors that must be continually refreshed. Used in desktop, laptop, and server memory modules. Volatile — data is lost when power is removed. |
| **SRAM** | Static Random-Access Memory | Faster and more expensive than DRAM; uses flip-flops. Primarily used in CPU caches (L1/L2/L3), not consumer memory modules. |
| **DDR** | Double Data Rate | A type of SDRAM that transfers data on both the rising and falling edges of the clock cycle, effectively doubling data throughput compared to single data rate. |
| **DDR3** | Double Data Rate 3 | Third generation DDR memory. Speeds: 800–2133 MHz. Voltage: 1.5V standard. Legacy standard used in systems from 2007–2015. |
| **DDR4** | Double Data Rate 4 | Fourth generation DDR. Speeds: 2133–4800 MHz (standard to overclocked). Voltage: 1.2V (standard), 1.35V (overclocked). Industry mainstream 2014–present. |
| **DDR5** | Double Data Rate 5 | Fifth generation DDR. Speeds: 4800–8400+ MHz. Voltage: 1.1V standard. Introduced 2021. Features on-die ECC and PMIC. TwinMOS current flagship (VOLTX series). |
| **LPDDR** | Low Power DDR | Mobile variant of DDR memory. Lower voltage and power consumption. Used in smartphones, tablets, and thin laptops. (TwinMOS does not currently produce LPDDR.) |
| **SO-DIMM** | Small Outline Dual Inline Memory Module | Compact 67.6 mm memory module form factor for laptops, mini PCs, and NUCs. TwinMOS products: VOLTX DDR5 SO-DIMM, DDR4 SO-DIMM. |
| **U-DIMM** | Unbuffered Dual Inline Memory Module | Standard 133.35 mm memory module for desktop PCs. Most common consumer form factor. TwinMOS products: VOLTX DDR5, TornadoX7, Thunder GX, Concord. |
| **R-DIMM** | Registered DIMM | Memory module with a register component between the controller and DRAM chips. Used in servers and workstations. Also called RDIMM. |
| **ECC** | Error-Correcting Code | Technology that detects and corrects single-bit memory errors in real time. Critical for servers and enterprise applications. DDR5 includes on-die ECC on all modules. |
| **XMP** | Extreme Memory Profile | Intel specification embedded in memory modules that allows automatic overclocking to rated speeds via BIOS. XMP 3.0 is the latest version (DDR5). TwinMOS VOLTX supports XMP 3.0. |
| **EXPO** | Extended Profiles for Overclocking | AMD's equivalent of Intel XMP for DDR5 overclocking. Supported by TwinMOS VOLTX RGB DDR5. |
| **JEDEC** | Joint Electron Device Engineering Council | International standards body for microelectronics, including memory standards. Publishes DDR specifications (JESD79 series), NAND standards, and UFS standards. |
| **PMIC** | Power Management Integrated Circuit | On-module chip (new in DDR5) that manages power delivery to individual DRAM chips. Improves stability at high frequencies and reduces motherboard VRM load. |
| **MHz** | Megahertz | Frequency measurement unit. For memory, the effective transfer rate is quoted (e.g., DDR5-5600 operates at 2800 MHz clock but 5600 MT/s transfer rate). |
| **MT/s** | Mega-transfers per second | More accurate than MHz for DDR memory; represents actual data transfer rate. DDR5-6000 = 6000 MT/s. |
| **GB/s** | Gigabytes per second | Memory bandwidth measurement. DDR5-6000 with dual channel = ~96 GB/s bandwidth. |
| **CAS** | Column Address Strobe | The delay (in clock cycles) between issuing a READ command and the first data output. Lower CAS latency = faster access. Also written as CL. |
| **CL** | CAS Latency | See CAS. TwinMOS VOLTX DDR5-6000 CL36 means 36 clock cycles latency at 6000 MT/s. |
| **tRCD** | RAS to CAS Delay | Time from activating a DRAM row until a column can be accessed. Part of primary timing set (CL-tRCD-tRP-tRAS). |
| **tRP** | Row Precharge Time | Time to deactivate a row and prepare for the next access. Part of primary timing set. |
| **tRAS** | Row Active Time | Minimum time a row must remain active during an access. Part of primary timing set. |
| **QVL** | Qualified Vendor List | Motherboard manufacturer's list of tested and validated memory modules. TwinMOS products appear on QVLs for ASUS, MSI, Gigabyte, and ASRock boards. |
| **MTCD** | Maximum Thermal Conduction and Dissipation | TwinMOS proprietary heat spreader design. Optimises heat dissipation from DRAM ICs to the aluminium heatsink. Featured on VOLTX DDR5 SO-DIMM. |
| **SPD** | Serial Presence Detect | Small EEPROM chip on memory modules storing timing and voltage parameters read by the system BIOS during POST. |

---

### Storage Technology — NAND Flash & SSDs

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **NAND** | Not AND (gate) | Type of non-volatile flash memory used in SSDs, USB drives, and memory cards. NAND stores data in cells arranged in pages and blocks. Does not require constant power to retain data. |
| **SSD** | Solid-State Drive | Storage device using NAND flash memory. No moving parts. Faster, lighter, and more shock-resistant than HDDs. Types: NVMe (PCIe) and SATA. |
| **HDD** | Hard Disk Drive | Traditional magnetic spinning storage. Lower cost per GB but slower and more fragile than SSD. TwinMOS ProDrive Ultra is a portable HDD. |
| **NVMe** | Non-Volatile Memory Express | High-performance interface protocol for SSDs via PCIe bus. Replaces AHCI for flash storage. Lower latency and much higher throughput than SATA. |
| **PCIe** | Peripheral Component Interconnect Express | High-speed motherboard bus interface. NVMe SSDs connect via PCIe lanes. Generations: Gen 3 (~3.5 GB/s), Gen 4 (~7.5 GB/s), Gen 5 (~14 GB/s). |
| **Gen 3** | PCIe Generation 3 | PCIe 3.0 x4: max ~3,500 MB/s read. TwinMOS products: Alpha Pro, TW300. |
| **Gen 4** | PCIe Generation 4 | PCIe 4.0 x4: max ~7,500 MB/s read. TwinMOS products: Xtreme M.2, CoreX M.2. Requires compatible CPU/motherboard. |
| **Gen 5** | PCIe Generation 5 | PCIe 5.0 x4: max ~14,000 MB/s read. TwinMOS flagship: CoreX Pro M.2. Requires Intel 12th+ gen or AMD Ryzen 7000 series. |
| **SATA** | Serial ATA (Advanced Technology Attachment) | Legacy storage interface. Max speed: 600 MB/s (SATA III). Slower than NVMe but widely compatible. TwinMOS: Hyper H2 Ultra, M.2 2280 SATA. |
| **AHCI** | Advanced Host Controller Interface | Legacy storage protocol for SATA drives. Replaced by NVMe for flash storage. |
| **M.2** | — | Small form-factor connector standard (née NGFF). Form factor 2280 (22mm × 80mm) most common. Supports both NVMe (PCIe) and SATA drives depending on the drive type and slot. |
| **2.5"** | — | Standard laptop-sized HDD/SSD form factor (2.5 inches wide). Used by TwinMOS Hyper H2 Ultra SATA SSD. |
| **TLC** | Triple-Level Cell | NAND flash storing 3 bits per cell. Best balance of cost, density, and performance for consumer SSDs. Used in TwinMOS NVMe and SATA SSDs. |
| **QLC** | Quad-Level Cell | NAND flash storing 4 bits per cell. Higher density/lower cost but slower write speeds and shorter endurance than TLC. |
| **SLC** | Single-Level Cell | NAND flash storing 1 bit per cell. Fastest and most durable but expensive. Used in enterprise drives and SLC cache buffers. |
| **MLC** | Multi-Level Cell | NAND flash storing 2 bits per cell. Better endurance than TLC but more expensive. Common in enterprise SSDs. |
| **3D NAND** | Three-dimensional NAND | NAND technology that stacks memory cells vertically rather than planar (flat). Enables higher densities, better endurance, and lower cost per GB. All TwinMOS SSDs use 3D NAND. |
| **DRAM Cache** | — | Small amount of fast DRAM on an SSD controller that stores the FTL map in RAM for faster random I/O. TwinMOS CoreX Pro features DRAM cache. Drives without DRAM cache use HMB. |
| **HMB** | Host Memory Buffer | Feature allowing a DRAM-less NVMe SSD to use a portion of system RAM as its FTL cache. Reduces cost. Used in TwinMOS Alpha Pro. |
| **FTL** | Flash Translation Layer | Firmware layer managing the mapping between logical block addresses (LBA) and physical NAND pages. Handles wear leveling, garbage collection, and bad block management. |
| **TRIM** | — | ATA command allowing the OS to inform the SSD which data blocks are no longer in use, enabling proactive erasure for better performance. Supported by all TwinMOS SSDs. |
| **S.M.A.R.T.** | Self-Monitoring, Analysis, and Reporting Technology | Drive health monitoring standard. Reports metrics like read error rates, temperature, and power-on hours to detect imminent failure. All TwinMOS SSDs support S.M.A.R.T. |
| **NCQ** | Native Command Queuing | Feature allowing SSDs and HDDs to reorder commands internally for optimal execution. |
| **LDPC ECC** | Low-Density Parity-Check Error Correcting Code | Advanced ECC algorithm used in modern NAND controllers to detect and correct multi-bit errors. More powerful than older BCH ECC. Featured in TwinMOS SSD controllers. |
| **MTBF** | Mean Time Between Failures | Reliability metric in hours. TwinMOS SSDs: >1,000,000 hours. TwinMOS Alpha Pro: 1,500,000 hours. |
| **TBW** | Terabytes Written | SSD endurance rating — total amount of data that can be written before expected wear-out. |
| **IOPS** | Input/Output Operations Per Second | Measure of SSD random read/write performance. More relevant than sequential speed for OS and database workloads. |
| **SMI** | Silicon Motion Inc. | SSD controller manufacturer. TwinMOS uses SMI controllers in Xtreme and Alpha Pro NVMe SSDs. |
| **Phison** | — | SSD controller manufacturer. Used in select TwinMOS NVMe SSDs. |
| **USB 3.2 Gen 2** | — | USB standard: 10 Gbps theoretical max. Used in TwinMOS ELITE Drive Pro portable SSD. Equivalent to USB 3.1 Gen 2 / SuperSpeed USB 10Gbps. |
| **USB 3.0** | — | USB standard: 5 Gbps theoretical max. Used in TwinMOS ProDrive Ultra HDD. |
| **Type-C** | USB Type-C | Reversible USB connector. Used on TwinMOS ELITE Drive Pro. |

---

### Certifications & Compliance Standards

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **FCC** | Federal Communications Commission | US regulatory body. FCC certification required for electronic devices sold in the USA — confirms device does not cause harmful radio frequency interference. |
| **CE** | Conformité Européenne (European Conformity) | European Union certification mark. Required for products sold in the EU/EEA. Covers safety, health, EMC, and environmental requirements. |
| **UKCA** | UK Conformity Assessed | UK equivalent of CE marking post-Brexit. Required for products placed on the Great Britain (England, Wales, Scotland) market from 1 January 2023. |
| **EAC** | Eurasian Conformity | Mandatory conformity mark for products sold in the Eurasian Economic Union (EAEU): Russia, Belarus, Kazakhstan, Armenia, Kyrgyzstan. |
| **RoHS** | Restriction of Hazardous Substances | EU Directive 2011/65/EU. Restricts use of specific hazardous materials (lead, mercury, cadmium, etc.) in electronic equipment. All TwinMOS products are RoHS compliant. |
| **REACH** | Registration, Evaluation, Authorisation and Restriction of Chemicals | EU chemical safety regulation (REGULATION (EC) No 1907/2006). Requires tracking and reporting hazardous substances in products. |
| **BIS** | Bureau of Indian Standards | India's national standards body. BIS certification required for certain electronic products imported to India (IS 13252 for IT equipment). Important for India market activation. |
| **ISO 9001:2015** | International Organisation for Standardisation — Quality Management | International standard for quality management systems. Demonstrates consistent product quality and continuous improvement. TwinMOS manufacturing partners certified. |
| **GDPR** | General Data Protection Regulation | EU regulation (2016/679) governing personal data processing. Applies to any organisation processing data of EU residents. Key compliance requirement for twinmos.com. |
| **UAE PDPL** | UAE Personal Data Protection Law | UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection. Applies to data processing in/from the UAE. Critical given TwinMOS HQ in Dubai. |
| **India DPDP** | India Digital Personal Data Protection Act | India's data protection law (2023). Applies to digital personal data processing. Required compliance for India market. |
| **KSA PDPL** | Kingdom of Saudi Arabia Personal Data Protection Law | Saudi Arabia's data protection law. Applies to personal data of Saudi residents. |
| **WCAG** | Web Content Accessibility Guidelines | W3C guidelines for accessible web content. WCAG 2.1 AA is the target standard for twinmos.com. WCAG 2.2 is the current version (October 2023). |
| **OWASP** | Open Web Application Security Project | Non-profit organisation publishing the OWASP Top 10 — the most critical web application security risks. TwinMOS website targets OWASP Top 10:2021 compliance. |

---

## Part 2: Web Development & Architecture

### Frontend Technologies

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **Astro** | — | Modern static site generator and web framework. Supports multiple UI frameworks (React, Vue, Svelte) via Islands Architecture. Chosen as TwinMOS website frontend framework. Ships zero JS by default. |
| **React** | — | JavaScript UI library by Meta. Used as the island framework within Astro for interactive components (search, compatibility finder, forms). |
| **TypeScript** | — | Strongly-typed superset of JavaScript. All TwinMOS website code is written in TypeScript for type safety and maintainability. |
| **SSG** | Static Site Generation | Rendering pages to static HTML at build time. Astro default mode — fast, SEO-friendly, Cloudflare Pages-compatible. Used for all static content pages. |
| **SSR** | Server-Side Rendering | Rendering pages on the server at request time. Used by Astro for dynamic pages requiring live data (search results, user account pages). |
| **ISR** | Incremental Static Regeneration | Hybrid approach: pages are statically generated but can be updated on a schedule without full rebuild. Supported in some Astro adapters. |
| **CSR** | Client-Side Rendering | Rendering in the user's browser via JavaScript. Used sparingly (islands only) in TwinMOS website for interactive components. |
| **Islands Architecture** | — | Web architecture pattern where only interactive page components ("islands") ship JavaScript. The rest of the page is static HTML. Core Astro concept — reduces JS payload. |
| **Hydration** | — | Process of attaching JavaScript event handlers to server-rendered HTML. In Astro, islands use directive-based selective hydration (`client:load`, `client:idle`, `client:visible`). |
| **Vite** | — | Next-generation JavaScript build tool and dev server. Used internally by Astro. |
| **Biome** | — | Fast JavaScript/TypeScript linter and formatter (replaces ESLint + Prettier). Used for TwinMOS website code quality. |
| **Tailwind CSS** | — | Utility-first CSS framework. Provides design tokens and responsive utilities. Referenced in TwinMOS design system. |
| **RTL** | Right-to-Left | Text direction for Arabic, Hebrew, and Urdu. Required for the Arabic (`ar`) locale in Phase 2. Requires CSS `dir="rtl"` and bidirectional layout adjustments. |
| **hreflang** | — | HTML attribute and XML sitemap tag indicating alternate language versions of a page. Critical for international SEO. Format: `hreflang="ar-AE"`. |
| **i18n** | Internationalisation | Process of designing software/content to support multiple languages and regional settings without code changes. (The "18" represents 18 letters between "i" and "n" in "internationalisation".) |
| **l10n** | Localisation | Process of adapting content for a specific locale — translation, currency, date formats, cultural adjustments. |
| **SEO** | Search Engine Optimisation | Practices to improve website ranking in organic search engine results. Key disciplines: on-page optimisation, technical SEO, link building, Core Web Vitals. |
| **Core Web Vitals** | — | Google's user experience metrics used as ranking signals: LCP (load speed), INP (interactivity), CLS (visual stability). |
| **LCP** | Largest Contentful Paint | Core Web Vital measuring loading performance. Good: ≤2.5s. Target for twinmos.com: ≤2.0s. |
| **INP** | Interaction to Next Paint | Core Web Vital measuring responsiveness to user input. Good: ≤200ms. Replaced FID as of March 2024. |
| **CLS** | Cumulative Layout Shift | Core Web Vital measuring visual stability (unexpected layout shifts). Good: ≤0.1. |
| **FCP** | First Contentful Paint | Time until first content element appears. Indicator of perceived load speed. |
| **TTFB** | Time to First Byte | Time from navigation start to first byte received from server. Influenced by server response time and CDN. |
| **OG** | Open Graph | Meta tag protocol by Facebook for rich social media link previews. TwinMOS pages include OG title, description, and image tags. |
| **JSON-LD** | JavaScript Object Notation for Linked Data | Recommended format for structured data (schema.org). Embedded in `<script type="application/ld+json">` tags. Used for Product, BreadcrumbList, FAQPage, Article schema. |

---

### Backend & CMS

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **Strapi** | — | Open-source headless CMS. Provides REST and GraphQL APIs. Chosen as TwinMOS website CMS for product data, pages, and blog content. Runs on Hetzner VPS via Coolify. |
| **Headless CMS** | — | Content management system that decouples the content repository ("body") from the presentation layer ("head"). Content is delivered via API to any frontend. |
| **REST** | Representational State Transfer | Architectural style for web APIs using HTTP methods (GET, POST, PUT, DELETE). Strapi provides a REST API for content delivery. |
| **GraphQL** | Graph Query Language | API query language allowing clients to request exactly the data they need. Strapi includes a GraphQL plugin. Planned for Phase 3. |
| **JWT** | JSON Web Token | Compact, URL-safe token for authentication. TwinMOS website uses JWT for Strapi API authentication and partner portal sessions. |
| **API** | Application Programming Interface | Set of rules/endpoints for software communication. The Strapi API serves content to the Astro frontend. |
| **Webhook** | — | HTTP callback triggered by an event (e.g., content published in Strapi triggers Cloudflare Pages rebuild). |
| **CRUD** | Create, Read, Update, Delete | The four basic operations on data. Strapi admin panel performs CRUD operations on all content types. |
| **ORM** | Object-Relational Mapping | Software pattern for interacting with databases using objects instead of SQL. Strapi uses an ORM (TypeORM/Knex) over PostgreSQL/SQLite. |

---

### Infrastructure & DevOps

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **CDN** | Content Delivery Network | Globally distributed network of servers that cache and serve static assets (HTML, images, JS, CSS) from locations closest to users. Cloudflare CDN is used for twinmos.com. |
| **DNS** | Domain Name System | System translating domain names (twinmos.com) to IP addresses. Cloudflare manages DNS for twinmos.com. Migration from legacy host is covered in DNS Migration Plan. |
| **SSL** | Secure Sockets Layer | Legacy predecessor to TLS. Often used colloquially to mean the HTTPS encryption certificate. |
| **TLS** | Transport Layer Security | Cryptographic protocol providing HTTPS encryption. TwinMOS website targets TLS 1.3. |
| **VPS** | Virtual Private Server | A virtualised server with dedicated resources. TwinMOS uses Hetzner VPS (CX31 or higher) to host Strapi, Meilisearch, imgproxy, and other backend services. |
| **CI/CD** | Continuous Integration / Continuous Delivery (or Deployment) | Automated pipeline that builds, tests, and deploys code. GitHub Actions is the CI/CD platform for TwinMOS website. |
| **Docker** | — | Containerisation platform. All TwinMOS backend services run in Docker containers managed by Coolify. |
| **Coolify** | — | Open-source self-hosted PaaS (Platform as a Service). Manages Docker containers on Hetzner VPS. Alternative to Heroku/Render. |
| **Hetzner** | — | German cloud hosting provider. Provides VPS for TwinMOS backend (Strapi, Meilisearch, Coolify). Selected for cost-efficiency and European data residency. |
| **Cloudflare** | — | Web infrastructure company providing CDN, DNS, DDoS protection, and Cloudflare Pages for TwinMOS website. |
| **Cloudflare Pages** | — | Cloudflare's static site hosting platform. Serves the Astro-built TwinMOS frontend via global CDN with automatic deploys from GitHub. |
| **Backblaze B2** | — | S3-compatible object storage service. Stores product images, datasheets, and media assets for TwinMOS website. More affordable than AWS S3. |
| **imgproxy** | — | Open-source image processing proxy. Resizes, converts (WebP/AVIF), and optimises images on-demand. Self-hosted on Hetzner VPS. |
| **Meilisearch** | — | Open-source, fast full-text search engine. Powers TwinMOS product and knowledge base search. Self-hosted on Hetzner VPS. |
| **GitHub Actions** | — | CI/CD automation platform integrated with GitHub. Runs build, test, lint, and deploy workflows for TwinMOS website. |
| **Sentry** | — | Application error monitoring and performance tracing platform. Used for TwinMOS website frontend and Strapi error tracking. |
| **Plausible** | — | Privacy-friendly, GDPR-compliant web analytics platform. Alternative to Google Analytics for basic traffic metrics. |
| **GA4** | Google Analytics 4 | Google's analytics platform. Used alongside Plausible for TwinMOS website. Events tracked: page views, product views, search queries, form submissions, leads. |
| **CSP** | Content Security Policy | HTTP security header restricting resources the browser is allowed to load. Prevents XSS attacks. TwinMOS targets a strict CSP. |
| **HSTS** | HTTP Strict Transport Security | HTTP header forcing browsers to use HTTPS. Prevents downgrade attacks. Max-age: 1 year + preload. |
| **WAF** | Web Application Firewall | Security layer filtering malicious HTTP traffic. Cloudflare provides WAF for twinmos.com. |
| **DDoS** | Distributed Denial of Service | Attack flooding a server with traffic to make it unavailable. Cloudflare provides DDoS protection. |
| **RTO** | Recovery Time Objective | Maximum acceptable downtime after an incident. TwinMOS target: ≤4 hours for P1 incidents. |
| **RPO** | Recovery Point Objective | Maximum acceptable data loss measured in time. TwinMOS target: ≤24 hours (daily backups). |
| **SLO** | Service Level Objective | Internal performance target (e.g., 99.9% uptime). |
| **SLA** | Service Level Agreement | Contractual commitment on service levels between TwinMOS and Unisoft. |
| **SLI** | Service Level Indicator | Metric measuring service performance (e.g., request success rate, latency p99). |
| **DevOps** | Development + Operations | Culture and set of practices combining software development and IT operations for faster, more reliable delivery. |
| **IaC** | Infrastructure as Code | Managing infrastructure (servers, DNS, firewalls) through code/configuration files. |
| **PR** | Pull Request | A request to merge code changes into a target branch in GitHub. Subject to code review before merging. |
| **ADR** | Architecture Decision Record | Lightweight document capturing a significant architectural decision, its context, and consequences. Stored in `docs/adr/`. |
| **OWASP Top 10** | Open Web Application Security Project Top 10 | Annual list of the most critical web security risks. TwinMOS targets OWASP Top 10:2021 compliance. Key risks: injection, broken authentication, XSS, insecure deserialization. |
| **XSS** | Cross-Site Scripting | Web security vulnerability where attackers inject malicious scripts into web pages. Prevented via CSP and output encoding. |
| **CSRF** | Cross-Site Request Forgery | Attack tricking authenticated users into making unwanted requests. Prevented via CSRF tokens on forms. |
| **WebP** | Web Picture | Modern image format with superior compression vs JPEG/PNG. TwinMOS images are served in WebP (with AVIF for supporting browsers). |
| **AVIF** | AV1 Image File Format | Next-generation image format with even better compression than WebP. Used for TwinMOS product images on supporting browsers. |

---

### Performance & Testing

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **Lighthouse** | — | Open-source automated tool by Google for auditing webpage quality (performance, SEO, accessibility, best practices). Target score: 95+ for TwinMOS. |
| **Vitest** | — | Fast unit testing framework for Vite/Astro projects. Used for TwinMOS component and utility function tests. |
| **Playwright** | — | Microsoft's end-to-end browser testing framework. Used for TwinMOS E2E test suite (critical user flows). |
| **Bruno** | — | Open-source API client (alternative to Postman). Used for TwinMOS API test collections. |
| **k6** | — | Open-source load testing tool. Used for TwinMOS performance/stress testing. |
| **axe** | — | Accessibility testing engine (Deque Systems). Integrated in Playwright and browser devtools for WCAG compliance checks. |
| **NVDA** | Non-Visual Desktop Access | Free open-source screen reader for Windows. Used for TwinMOS accessibility testing. |
| **WAVE** | Web Accessibility Evaluation Tool | Browser extension for manual accessibility testing. Used alongside axe. |
| **UAT** | User Acceptance Testing | Final testing phase where actual users (TwinMOS stakeholders) verify the system meets requirements before sign-off. |
| **E2E** | End-to-End (testing) | Tests that simulate complete user journeys from start to finish. Run via Playwright. |
| **QA** | Quality Assurance | Process of ensuring software meets defined quality standards. Covers functional, performance, accessibility, and security testing. |
| **RACI** | Responsible, Accountable, Consulted, Informed | Project management framework for defining roles and responsibilities in a matrix. |

---

## Part 3: Project Management & Business

### Project & Delivery

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **RFP** | Request for Proposal | Document inviting vendors to propose solutions. TwinMOS issued an RFP (v2.0) for the website development project. |
| **BRD** | Business Requirements Document | Document specifying what the system must do (functional and non-functional requirements). TwinMOS BRD is the primary requirements bible (v2.0). |
| **URD** | User Requirements Document | Document capturing user needs as stories and acceptance criteria. TwinMOS URD (v2.0) covers all 5 personas and 180+ user stories. |
| **SOW** | Statement of Work | Legal document within the vendor contract defining specific deliverables, timelines, milestones, and payment terms. |
| **MSA** | Master Service Agreement | Umbrella legal agreement covering the overall vendor relationship, IP ownership, liability, and commercial terms. |
| **NDA** | Non-Disclosure Agreement | Legal agreement preventing parties from disclosing confidential project information to third parties. |
| **DPA** | Data Processing Agreement | Legal agreement under GDPR/UAE PDPL defining how a data processor (Unisoft) handles personal data on behalf of the data controller (TwinMOS). |
| **IP** | Intellectual Property | Legal rights over creative works, inventions, and designs. IP Ownership Transfer Agreement ensures all code/assets vest in TwinMOS. |
| **KPI** | Key Performance Indicator | Measurable metric tracking progress toward a goal. TwinMOS website KPIs: organic traffic, lead generation, page speed scores. |
| **MVP** | Minimum Viable Product | Smallest set of features to deliver value. Phase 1 of TwinMOS website is the MVP. |
| **P0 / P1 / P2 / P3** | Priority 0/1/2/3 | Priority rating for features and bugs. P0 = critical (must fix now / must exist at handover); P3 = low priority. |
| **Sprint** | — | Fixed-length development cycle (typically 2 weeks) in Agile methodology. TwinMOS project uses 2-week sprints. |
| **Backlog** | — | Ordered list of all work items (user stories, tasks, bugs) to be completed. Maintained in project management tool. |
| **Phase Gate** | — | Formal review point between project phases. TwinMOS has gates at end of Phase 1 (Month 5), Phase 2 (Month 9), Phase 3 (Month 15). Requires sponsor sign-off. |
| **Go-Live** | — | The moment the new website is switched on for public access. Also referred to as "launch" or "cutover". |
| **Hypercare** | — | Intensive post-launch support period (typically 30 days) with heightened monitoring and rapid response. |
| **Stakeholder** | — | Any person or organisation with an interest in or influence over the project. Includes TwinMOS executives, end users, vendors, and distributors. |

---

### Business & Commercial

| Acronym / Term | Full Form | Definition |
|----------------|-----------|------------|
| **B2B** | Business to Business | Commercial transactions between businesses (e.g., TwinMOS selling to distributors or enterprises). |
| **B2C** | Business to Consumer | Commercial transactions between a business and individual consumers. |
| **OEM** | Original Equipment Manufacturer | Company that manufactures products for another company to rebrand. TwinMOS has an OEM/ODM programme for device manufacturers. |
| **ODM** | Original Design Manufacturer | Company that designs and manufactures products that are rebranded and sold by another company. |
| **RMA** | Return Merchandise Authorisation | Process for authorising a product return under warranty. TwinMOS website includes a self-service RMA portal. |
| **SKU** | Stock Keeping Unit | Unique identifier for each distinct product variant. TwinMOS has 100+ active SKUs across all product categories. |
| **MOQ** | Minimum Order Quantity | Minimum number of units required for a purchase order. Relevant to TwinMOS distributor and OEM programmes. |
| **DAFZA** | Dubai Airport Free Zone Authority | Free trade zone in Dubai where TwinMOS Middle East FZE is headquartered (C-9, DAFZA). |
| **MENA** | Middle East and North Africa | Regional designation. Key TwinMOS market. |
| **MEA** | Middle East and Africa | Broader regional designation used by TwinMOS for its operations out of Dubai. |
| **CIS** | Commonwealth of Independent States | Post-Soviet regional organisation including Russia, Ukraine, Kazakhstan, Belarus, etc. An important TwinMOS distribution market. |
| **GCC** | Gulf Cooperation Council | Regional intergovernmental organisation: UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman. TwinMOS primary regional market. |
| **VID** | Vendor ID | Unique identifier assigned by USB Implementers Forum. TwinMOS VID: `4719` (TwinMOS Technologies ME FZE). |
| **OUI** | Organisationally Unique Identifier | IEEE-assigned identifier forming the first 3 bytes of a MAC address. TwinMOS OUI: `000B9D` (TwinMOS Technologies Inc., Taiwan). |
| **CRM** | Customer Relationship Management | Software managing customer interactions, leads, and sales pipeline. TwinMOS website will integrate with HubSpot or Zoho CRM (ADR-012 decision pending). |
| **ERP** | Enterprise Resource Planning | Software integrating core business processes (inventory, finance, orders). TwinMOS has an existing ERP system to integrate with the website in Phase 3. |

---

## Quick-Reference Alphabetical Index

| Term | Category | Part |
|------|----------|------|
| AHCI | Storage | 1 |
| ADR | DevOps | 2 |
| API | Backend | 2 |
| Astro | Frontend | 2 |
| AVIF | Performance | 2 |
| B2B | Business | 3 |
| BRD | Project | 3 |
| CAS / CL | Memory | 1 |
| CDN | Infrastructure | 2 |
| CE | Certification | 1 |
| CI/CD | DevOps | 2 |
| CIS | Business | 3 |
| CLS | Performance | 2 |
| Cloudflare | Infrastructure | 2 |
| CRM | Business | 3 |
| CSP | Security | 2 |
| CSRF | Security | 2 |
| DAFZA | Business | 3 |
| DDR3/4/5 | Memory | 1 |
| DevOps | DevOps | 2 |
| DDoS | Security | 2 |
| DNS | Infrastructure | 2 |
| Docker | Infrastructure | 2 |
| DPA | Project | 3 |
| DRAM | Memory | 1 |
| E2E | Testing | 2 |
| EAC | Certification | 1 |
| ECC | Memory | 1 |
| ERP | Business | 3 |
| EXPO | Memory | 1 |
| FCC | Certification | 1 |
| FCP | Performance | 2 |
| FTL | Storage | 1 |
| GA4 | Analytics | 2 |
| GCC | Business | 3 |
| GDPR | Compliance | 1 |
| Gen 3/4/5 | Storage | 1 |
| GitHub Actions | DevOps | 2 |
| GraphQL | Backend | 2 |
| HDD | Storage | 1 |
| Hetzner | Infrastructure | 2 |
| HMB | Storage | 1 |
| HSTS | Security | 2 |
| i18n | Frontend | 2 |
| INP | Performance | 2 |
| IOPS | Storage | 1 |
| IP | Project | 3 |
| ISO 9001 | Certification | 1 |
| JEDEC | Memory | 1 |
| JSON-LD | Frontend | 2 |
| JWT | Backend | 2 |
| KPI | Project | 3 |
| l10n | Frontend | 2 |
| LCP | Performance | 2 |
| LDPC ECC | Storage | 1 |
| Lighthouse | Testing | 2 |
| M.2 | Storage | 1 |
| MBA / MLC | Storage | 1 |
| MEA | Business | 3 |
| Meilisearch | Infrastructure | 2 |
| MENA | Business | 3 |
| MHz | Memory | 1 |
| MOQ | Business | 3 |
| MSA | Project | 3 |
| MTBF | Storage | 1 |
| MTCD | Memory | 1 |
| MT/s | Memory | 1 |
| MVP | Project | 3 |
| NAND | Storage | 1 |
| NDA | Project | 3 |
| NCQ | Storage | 1 |
| NVMe | Storage | 1 |
| OEM | Business | 3 |
| OG | Frontend | 2 |
| ORM | Backend | 2 |
| OUI | Business | 3 |
| OWASP | Security | 2 |
| PCIe | Storage | 1 |
| Playwright | Testing | 2 |
| PMIC | Memory | 1 |
| QA | Testing | 2 |
| QLC | Storage | 1 |
| QVL | Memory | 1 |
| RACI | Project | 3 |
| React | Frontend | 2 |
| REST | Backend | 2 |
| RFP | Project | 3 |
| RMA | Business | 3 |
| RoHS | Certification | 1 |
| RPO | Infrastructure | 2 |
| RTL | Frontend | 2 |
| RTO | Infrastructure | 2 |
| SATA | Storage | 1 |
| SEO | Frontend | 2 |
| SKU | Business | 3 |
| SLA | Project | 3 |
| SLC | Storage | 1 |
| SLI | Infrastructure | 2 |
| SLO | Infrastructure | 2 |
| S.M.A.R.T. | Storage | 1 |
| SMI | Storage | 1 |
| SO-DIMM | Memory | 1 |
| SOW | Project | 3 |
| SPD | Memory | 1 |
| SSD | Storage | 1 |
| SSL / TLS | Security | 2 |
| SSG | Frontend | 2 |
| SSR | Frontend | 2 |
| Strapi | Backend | 2 |
| TBW | Storage | 1 |
| TLC | Storage | 1 |
| TRIM | Storage | 1 |
| TTFB | Performance | 2 |
| TypeScript | Frontend | 2 |
| U-DIMM | Memory | 1 |
| UAT | Testing | 2 |
| UKCA | Certification | 1 |
| UAE PDPL | Compliance | 1 |
| URD | Project | 3 |
| USB | Storage | 1 |
| VID | Business | 3 |
| VPS | Infrastructure | 2 |
| WAF | Security | 2 |
| WCAG | Compliance | 1 |
| WebP | Performance | 2 |
| XMP | Memory | 1 |
| XSS | Security | 2 |

---

*Document Reference: TWN-REF-GLOSSARY-2026-001 | Version 1.0 | 1 May 2026 | Classification: Internal — All Team Members*
