# TwinMOS Corporate Website — Compatibility Finder Algorithm Specification

**Document Reference:** TWN-P2-FINDER-2027-001  
**Document Version:** 1.0  
**Status:** APPROVED — For development implementation  
**Phase:** Phase 2 — Localization & Partner Enablement (full algorithm; MVP launched in Phase 1)  
**Feature:** Compatibility Finder — Full Algorithm & Search Engine Specification  
**Planned Delivery:** Phase 2, Sprint 7 (March 2027); Phase 1 MVP already live  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead + Product Marketing  
**Audience:** Unisoft Dev A (Frontend), Dev B (Backend), TwinMOS Product Team  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Source References:**  
- Tech Stack v1.1 §10.5 (QVL ingest), §3.3 (Data flow), §7 (MeiliSearch)  
- BRD v3.0 §6 (Product Catalog Epic), RFP-FR-8.2.1–8.2.4 (Finder requirements)  
- Content Map: `content/website-content/03-products/07-finder/` (6 files)  
- Master SKU Reference: `_master-sku-reference.md`

---

## Table of Contents

1. [Overview & Phase Scope](#1-overview--phase-scope)
2. [Search Modes](#2-search-modes)
3. [Data Model](#3-data-model)
4. [Matching Algorithm — By Laptop](#4-matching-algorithm--by-laptop)
5. [Matching Algorithm — By Desktop](#5-matching-algorithm--by-desktop)
6. [Matching Algorithm — By Motherboard QVL](#6-matching-algorithm--by-motherboard-qvl)
7. [Result Scoring & Ranking](#7-result-scoring--ranking)
8. [QVL Status Hierarchy](#8-qvl-status-hierarchy)
9. [MeiliSearch Index Configuration](#9-meilisearch-index-configuration)
10. [API Endpoints](#10-api-endpoints)
11. [React Island Architecture](#11-react-island-architecture)
12. [Typeahead / Autocomplete Algorithm](#12-typeahead--autocomplete-algorithm)
13. [Edge Cases & Special Handling](#13-edge-cases--special-handling)
14. [Performance Targets](#14-performance-targets)
15. [Phase 1 vs Phase 2 Feature Delta](#15-phase-1-vs-phase-2-feature-delta)
16. [Acceptance Criteria](#16-acceptance-criteria)

---

## 1. Overview & Phase Scope

### 1.1 Purpose

The TwinMOS Compatibility Finder allows consumers, IT professionals, and system builders to find the exact TwinMOS memory and SSD products compatible with their specific hardware, returning results from a QVL-backed database with guaranteed compatibility ratings.

**User problem solved:** "I don't know which TwinMOS product fits my system — I'm afraid of buying the wrong thing."

### 1.2 Phase 1 vs Phase 2

| Capability | Phase 1 (MVP) | Phase 2 (Full) |
|------------|--------------|----------------|
| Search modes | Laptop, Desktop, Motherboard | Same |
| QVL database size | Top-100 motherboards | Top-500+ motherboards |
| Compatibility data sources | Manual entry only | Manual + CSV bulk import + community + vendor QVL scrape |
| Typeahead suggestion speed | < 300ms | < 100ms (Redis-cached suggestions) |
| Result quality | Basic specification matching | Full QVL hierarchy + XMP/EXPO profile matching |
| Community reports | None | `Reported-Working` status from community submissions |
| SSD compatibility | Basic M.2 form factor matching | Full protocol + slot + generation matching |
| Mobile UX | Responsive | Enhanced: native-like filter chips |

---

## 2. Search Modes

### 2.1 Mode 1 — By Laptop

**User input:** Laptop brand (dropdown) + model name (typeahead text)  
**Example:** `HP` → `EliteBook 840 G10`

**Algorithm produces:**
1. Look up `Device` record with `device_type = 'laptop'`, `brand = HP`, `model = 'EliteBook 840 G10'`
2. Extract device memory specification:
   - `memory_type`: DDR5 | DDR4 | LPDDR5X (soldered, non-upgradeable)
   - `form_factor`: SO-DIMM | LPDDR5X (soldered)
   - `max_capacity_per_slot`: number in GB
   - `slots_total`: number
   - `slots_open`: number (may be 0 for fully soldered, or < slots_total for hybrid)
   - `max_speed_mhz`: default supported speed (without XMP, which laptops typically don't support)
3. Extract storage specification:
   - `m2_slots`: array of `{slot_type: 'NVMe-only' | 'SATA-or-NVMe' | 'SATA-only', form_factor: '2280' | '2230' | '2242', gen: 3 | 4 | 5}`
   - `sata_25_bay`: boolean
4. Match against `Compatibility` collection:
   - Find all records where `device_id = deviceRecord.id`
   - Return matching TwinMOS SKUs sorted by QVL status rank + capacity + speed

### 2.2 Mode 2 — By Desktop

**User input:** Brand dropdown → Model typeahead (or "Custom Build" radio button)  
If "Custom Build": CPU type (Intel/AMD) + generation + socket → narrows compatible memory type

**Algorithm produces:**
- For named desktop: same as laptop lookup, `device_type = 'desktop'`
- For Custom Build: specification-match algorithm (see §5)

### 2.3 Mode 3 — By Motherboard QVL

**User input:** Motherboard brand (dropdown) + model (typeahead text)  
**Example:** `ASUS` → `ROG Strix Z790-E Gaming WIFI`

**Algorithm produces:**
1. Find `MotherboardQVL` records where `brand = 'ASUS'` AND `model = 'ROG Strix Z790-E Gaming WIFI'`
2. These are physical QVL-tested entries — each row links a specific TwinMOS SKU to this motherboard with a test result
3. Return all matching SKUs ordered by QVL status rank

---

## 3. Data Model

### 3.1 Core Collections

#### `Device` Collection
```ts
interface Device {
  id: number;
  device_type: 'laptop' | 'desktop' | 'server' | 'nuc';
  brand: string;                    // Normalized: 'HP' | 'Dell' | 'Lenovo' etc.
  model: string;                    // Normalized model name
  model_aliases: string[];          // Regional variants (e.g., 'ThinkPad T14 Gen 5 (AMD)')
  release_year: number;
  cpu_brands: CpuBrand[];          // 'Intel' | 'AMD' (for custom build matching)
  cpu_generation: string;           // 'Raptor Lake' | 'Alder Lake' | 'Zen 4' etc.
  
  // Memory
  memory_type: MemoryType;          // 'DDR5' | 'DDR4' | 'DDR3' | 'LPDDR5X' | 'LPDDR4X'
  form_factor: 'SO-DIMM' | 'U-DIMM' | 'LPDDR-soldered';
  slots_total: number;
  slots_open: number;              // 0 = fully soldered
  max_capacity_gb_per_slot: number;
  max_capacity_gb_total: number;
  base_speed_mhz: number;         // JEDEC default
  max_speed_mhz: number;          // With XMP/EXPO on desktop; same as base on laptops typically
  supports_xmp: boolean;
  supports_expo: boolean;
  soldered_base_gb?: number;      // For hybrid configs (e.g., 8GB soldered + 1 open slot)
  voltage: number;                // 1.1 for DDR5; 1.2 for DDR4
  
  // Storage
  m2_slots: M2Slot[];
  sata_25_bay: boolean;
  sata_25_count: number;
  
  // Source
  data_source: 'manufacturer_spec' | 'community_verified' | 'twinmos_qa';
  verified_at: Date;
}

interface M2Slot {
  slot_number: number;
  protocol: 'NVMe' | 'SATA' | 'SATA-or-NVMe';
  form_factors: ('2280' | '2230' | '2242' | '22110')[];
  pcie_generation: 3 | 4 | 5 | null;  // null for SATA-only
  pcie_lanes: 2 | 4 | null;
  keying: 'M' | 'B+M';
}
```

#### `Compatibility` Collection
```ts
interface Compatibility {
  id: number;
  device: Relation<Device>;
  product: Relation<Product>;          // TwinMOS SKU
  
  // QVL Status
  qvl_status: QVLStatus;
  tested_speed_mhz: number;           // Speed at which tested
  tested_capacity_gb: number;
  tested_as_dual_channel: boolean;
  
  // Testing details (for QVL entries)
  test_date?: Date;
  tester: 'TwinMOS QA' | 'TwinMOS Engineering' | 'Vendor Lab' | 'Community';
  bios_version_tested?: string;       // BIOS version when tested
  bios_notes?: string;               // e.g., "Requires BIOS F12 or newer"
  slot_notes?: string;               // e.g., "Use A2+B2 slots for dual channel"
  xmp_profile_number?: number;       // Which XMP profile was used (1, 2, or 3)
  
  // For specification-match entries (non-QVL)
  compatibility_basis?: 'jedec_spec' | 'jedec_ddr_gen_match' | 'platform_spec';
  
  // Meta
  created_at: Date;
  updated_at: Date;
  created_by: string;               // agent email or 'ingest-pipeline'
}

type QVLStatus = 
  | 'Certified'           // Full QVL — physically tested + certified by TwinMOS
  | 'Tested'              // Physically tested but not formally certified
  | 'Reported-Working'    // Community-submitted, unverified
  | 'Spec-Compatible'     // Specification match only (not physically tested)
  | 'Reported-Issue'      // Community-reported compatibility issue
  | 'Not-Compatible';     // Confirmed incompatible (do not show in results)
```

#### `MotherboardQVL` Collection
```ts
interface MotherboardQVL {
  id: number;
  brand: string;                    // 'ASUS' | 'GIGABYTE' | 'MSI' | 'ASRock' | 'Intel' | 'AMD'
  model: string;                    // Normalized motherboard model name
  chipset: string;                  // 'Z790' | 'Z690' | 'B760' | 'X670E' etc.
  socket: string;                   // 'LGA1700' | 'AM5' | 'LGA1200' etc.
  memory_type: 'DDR5' | 'DDR4' | 'DDR3';
  dimm_slots: number;
  
  // QVL entries
  entries: MotherboardQVLEntry[];
  
  data_source: 'twinmos_qa' | 'vendor_qvl_scrape' | 'community';
  last_updated: Date;
}

interface MotherboardQVLEntry {
  product: Relation<Product>;       // TwinMOS SKU
  qvl_status: QVLStatus;
  tested_speed_mhz: number;
  tested_capacity_gb: number;
  tested_as_dual_channel: boolean;
  bios_version?: string;
  bios_notes?: string;
  slot_config?: string;
  test_date?: Date;
}
```

---

## 4. Matching Algorithm — By Laptop

### 4.1 Algorithm Steps

```ts
async function findByLaptop(brand: string, model: string): Promise<FinderResult> {
  
  // Step 1: Normalize inputs
  const normalizedBrand = normalizeBrand(brand);
  const normalizedModel = normalizeModel(model);
  
  // Step 2: Find Device record (exact match + alias match)
  const device = await findDevice(normalizedBrand, normalizedModel, 'laptop');
  
  if (!device) {
    return { status: 'NOT_FOUND', suggestions: await getSimilarModels(brand, model) };
  }
  
  // Step 3: Check if memory is soldered (non-upgradeable)
  if (device.slots_open === 0 && device.form_factor === 'LPDDR-soldered') {
    return {
      status: 'SOLDERED_NOT_UPGRADEABLE',
      device,
      ssd_results: await findCompatibleSSDs(device),
      message: generateSolderedMessage(device),
    };
  }
  
  // Step 4: Find compatible memory products
  const memoryResults = await findCompatibleMemory(device);
  
  // Step 5: Find compatible SSDs
  const ssdResults = await findCompatibleSSDs(device);
  
  // Step 6: Rank and filter results
  return {
    status: 'FOUND',
    device,
    memory_results: rankResults(memoryResults),
    ssd_results: rankResults(ssdResults),
    upgrade_notes: generateUpgradeNotes(device),
  };
}
```

### 4.2 Memory Compatibility Matching

```ts
async function findCompatibleMemory(device: Device): Promise<MemoryResult[]> {
  // Filter 1: Memory generation must match exactly (DDR5 ≠ DDR4)
  const products = await strapi.db.query('api::product.product').findMany({
    where: {
      product_type: 'memory',
      memory_type: device.memory_type,
      form_factor: device.form_factor,
      capacity_per_module_gb: { $lte: device.max_capacity_gb_per_slot },
    },
  });
  
  // Filter 2: Speed filter (laptop — only JEDEC-compatible speeds)
  // Laptops typically don't support XMP; filter to speeds ≤ device.max_speed_mhz
  const speedFiltered = device.device_type === 'laptop'
    ? products.filter(p => p.jedec_speeds.some(s => s <= device.max_speed_mhz))
    : products;  // Desktops: XMP/EXPO allows faster speeds
  
  // Filter 3: Check existing Compatibility records for QVL entries
  const qvlEntries = await findQVLEntries(device.id, speedFiltered.map(p => p.id));
  
  // Merge: QVL entries override spec-match entries
  return mergeWithQVL(speedFiltered, qvlEntries, device);
}
```

---

## 5. Matching Algorithm — By Desktop

### 5.1 Named Desktop

Identical to laptop algorithm with `device_type = 'desktop'`, but:
- `max_speed_mhz` reflects XMP/EXPO potential (higher speeds shown)
- `supports_xmp` and `supports_expo` flags shown on results

### 5.2 Custom Build Algorithm

```ts
async function findByCustomBuild(
  cpuBrand: 'Intel' | 'AMD',
  cpuGeneration: string,      // e.g., 'Raptor Lake (13th Gen)' or 'Zen 4 (Ryzen 7000)'
  socket: string,             // e.g., 'LGA1700' or 'AM5'
): Promise<FinderResult> {
  
  // Step 1: Determine memory type from CPU/socket
  const memoryType = getMemoryTypeFromPlatform(socket);
  // AM5 → DDR5 only
  // LGA1700 (12th/13th Gen) → DDR4 or DDR5 (board-dependent; show both, note this)
  // LGA1851 (Arrow Lake / 15th Gen) → DDR5 only
  // AM4 → DDR4 only
  
  // Step 2: Determine XMP/EXPO support
  const supportsXMP = cpuBrand === 'Intel';
  const supportsEXPO = cpuBrand === 'AMD';
  
  // Step 3: Find all compatible TwinMOS memory products
  const products = await findMemoryBySpec({
    memory_type: memoryType,
    form_factor: 'U-DIMM',
    xmp_filter: supportsXMP ? 'xmp_3_0' : undefined,
    expo_filter: supportsEXPO ? 'expo' : undefined,
  });
  
  return {
    status: 'FOUND',
    memory_type_note: getMemoryTypeNote(socket, cpuBrand),
    memory_results: rankResults(products),
    custom_build_notes: generateCustomBuildNotes(cpuBrand, socket),
  };
}
```

---

## 6. Matching Algorithm — By Motherboard QVL

### 6.1 Algorithm Steps

```ts
async function findByMotherboard(brand: string, model: string): Promise<FinderResult> {
  
  // Step 1: Exact match in MotherboardQVL collection
  const qvlRecord = await findMotherboardQVL(brand, model);
  
  if (!qvlRecord) {
    // Step 2: Fuzzy fallback — try chipset-based matching
    const chipset = extractChipsetFromModel(model); // e.g., 'Z790' from 'ROG Strix Z790-E'
    if (chipset) {
      return await findByChipset(chipset, brand);
    }
    return { status: 'NOT_FOUND', suggestions: await getSimilarMotherboards(brand, model) };
  }
  
  // Step 3: Return QVL entries sorted by QVL status rank
  const results = qvlRecord.entries
    .filter(e => e.qvl_status !== 'Not-Compatible')
    .sort((a, b) => QVL_RANK[b.qvl_status] - QVL_RANK[a.qvl_status]);
  
  return {
    status: 'FOUND',
    motherboard: qvlRecord,
    memory_results: results,
    qvl_note: 'Results shown are from TwinMOS physical QVL testing on this exact board.',
  };
}
```

---

## 7. Result Scoring & Ranking

### 7.1 Ranking Formula

Results are ranked by a composite score:

```ts
function calculateScore(
  result: CompatibilityResult,
  device: Device
): number {
  let score = 0;
  
  // Factor 1: QVL Status (0–100 points)
  score += QVL_RANK[result.qvl_status] * 20;
  
  // Factor 2: Speed optimization (0–30 points)
  // Prefer results that match the device's maximum supported speed
  const speedDelta = Math.abs(result.tested_speed_mhz - device.max_speed_mhz);
  score += Math.max(0, 30 - speedDelta / 100);
  
  // Factor 3: Capacity optimization (0–20 points)
  // Prefer higher capacity (more useful upgrade)
  score += Math.min(20, result.product.capacity_gb / 4);
  
  // Factor 4: Dual-channel bonus (10 points)
  if (result.tested_as_dual_channel) score += 10;
  
  // Factor 5: XMP/EXPO profile available (5 points)
  if (result.product.has_xmp_3_0 && device.supports_xmp) score += 5;
  if (result.product.has_expo && device.supports_expo) score += 5;
  
  return score;
}

const QVL_RANK: Record<QVLStatus, number> = {
  'Certified': 5,
  'Tested': 4,
  'Reported-Working': 3,
  'Spec-Compatible': 2,
  'Reported-Issue': 1,  // Shown at bottom with warning
  'Not-Compatible': 0,  // Never shown
};
```

### 7.2 Result Grouping

Results are grouped for display:

```
Group 1: QVL Listed (Certified + Tested)
  → Hero section: "Guaranteed Compatible — Physically Tested"
  
Group 2: Compatible (Spec-Compatible)
  → Section: "Compatible — Specification Matched"
  
Group 3: Community Reported (Reported-Working)
  → Section: "Community Reported — User Verified"
  
Group 4: Reported Issues (Reported-Issue)  
  → Collapsed section: "Known Issues — Review Before Purchase"
```

---

## 8. QVL Status Hierarchy

### 8.1 Status Definitions for End Users

| Status | Customer-Facing Label | Description |
|--------|----------------------|-------------|
| `Certified` | "QVL Certified ✓" | TwinMOS physically installed this module on this exact device/board and ran full stress tests. Highest confidence. |
| `Tested` | "Tested Compatible" | TwinMOS tested this module; stable operation confirmed. Not yet in formal certification programme. |
| `Reported-Working` | "Community Verified" | Multiple TwinMOS customers have reported this combination working. Not TwinMOS-tested. |
| `Spec-Compatible` | "Compatible" | Module meets all documented hardware specifications for this device/platform. Not physically tested. |
| `Reported-Issue` | "Known Issues ⚠" | One or more users have reported incompatibility. Visible but with strong warning. |
| `Not-Compatible` | — | Never shown to customers. Filtered from all results. |

### 8.2 Certified Compatible Badge

Products and motherboard pages on the main site display "Certified Compatible" badges linking to the QVL entry:

```html
<span class="badge badge-qvl-certified">
  QVL Certified for ASUS ROG Strix Z790-E ✓
</span>
```

---

## 9. MeiliSearch Index Configuration

### 9.1 `compatibility` Index Settings

```json
{
  "searchableAttributes": [
    "device_brand",
    "device_model",
    "device_model_aliases",
    "product_name",
    "product_sku"
  ],
  "filterableAttributes": [
    "device_type",
    "device_brand",
    "qvl_status",
    "memory_type",
    "form_factor",
    "capacity_gb",
    "speed_mhz",
    "product_sku"
  ],
  "sortableAttributes": [
    "qvl_rank",
    "speed_mhz",
    "capacity_gb",
    "test_date"
  ],
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness"
  ],
  "typoTolerance": {
    "enabled": true,
    "minWordSizeForTypos": {
      "oneTypo": 5,
      "twoTypos": 9
    }
  },
  "synonyms": {
    "thinkpad": ["think pad", "tp"],
    "elitebook": ["elite book", "hpeb"],
    "rog": ["republic of gamers"],
    "ddr5": ["ddr 5", "lpddr5"],
    "nvme": ["m.2", "pcie ssd"],
    "sodimm": ["so dimm", "laptop ram"]
  }
}
```

### 9.2 Device Typeahead Index (`device_typeahead`)

A lighter index for the autocomplete dropdown:
```json
{
  "searchableAttributes": ["brand", "model", "model_aliases"],
  "filterableAttributes": ["device_type", "brand"],
  "displayedAttributes": ["id", "brand", "model", "device_type", "release_year"]
}
```

Redis caches top-500 popular model queries with 1-hour TTL (Phase 2 Redis addition).

---

## 10. API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/finder/brands?device_type=laptop` | None | List brands for a device type (for dropdown) |
| GET | `/api/v1/finder/models?brand=HP&device_type=laptop&q=Elite` | None | Typeahead model suggestions |
| POST | `/api/v1/finder/laptop` | None | Find by laptop brand + model |
| POST | `/api/v1/finder/desktop` | None | Find by desktop brand + model |
| POST | `/api/v1/finder/custom-build` | None | Find by CPU platform |
| POST | `/api/v1/finder/motherboard` | None | Find by motherboard brand + model |
| GET | `/api/v1/finder/motherboard/brands` | None | List motherboard brands |
| GET | `/api/v1/finder/motherboard/models?brand=ASUS&q=Z790` | None | Motherboard model typeahead |
| POST | `/api/v1/finder/device/:id/report-compatibility` | Turnstile | Community compatibility report |

### 10.1 Laptop Search Request/Response

**Request:**
```json
{
  "brand": "HP",
  "model": "EliteBook 840 G10"
}
```

**Response:**
```json
{
  "status": "FOUND",
  "device": {
    "brand": "HP",
    "model": "HP EliteBook 840 G10",
    "memory_type": "DDR5",
    "form_factor": "SO-DIMM",
    "slots_open": 2,
    "max_capacity_gb_per_slot": 32,
    "max_speed_mhz": 5200
  },
  "memory_results": {
    "qvl_certified": [
      {
        "product_name": "VOLTX DDR5 SO-DIMM 16GB 5200MHz",
        "sku": "TM-D5-VOLT-SODIMM-16G-5200",
        "qvl_status": "Certified",
        "tested_speed_mhz": 5200,
        "tested_as_dual_channel": true,
        "bios_notes": null,
        "score": 95
      }
    ],
    "compatible": [...],
    "community_reported": [...]
  },
  "ssd_results": {
    "m2_nvme_2280": [
      {
        "product_name": "Xtreme Gen4 NVMe SSD 1TB",
        "sku": "TM-SSD-XTREME-1TB-G4",
        "slot_protocol": "NVMe",
        "form_factor": "2280",
        "pcie_gen": 4
      }
    ]
  },
  "upgrade_notes": [
    "Your laptop supports up to 64GB total (2×32GB). Current slot configuration: 2 open SO-DIMM slots.",
    "Speed capped at DDR5-5200 on this platform. XMP 3.0 profiles (higher speeds) will not activate."
  ]
}
```

---

## 11. React Island Architecture

### 11.1 `<CompatibilityFinder />` Island

```
<CompatibilityFinder />  (client:visible)
├── <FinderTabs />         -- Laptop | Desktop | Motherboard tabs
├── <LaptopFinder />       -- Laptop search mode
│   ├── <BrandSelect />    -- Dropdown of brands
│   └── <ModelTypeahead /> -- Typeahead input
├── <DesktopFinder />      -- Desktop search mode
│   ├── <BrandSelect />
│   ├── <ModelTypeahead />
│   └── <CustomBuildPanel /> -- "Custom Build" radio option
├── <MotherboardFinder />  -- Motherboard search mode
│   ├── <BoardBrandSelect />
│   └── <BoardModelTypeahead />
└── <FinderResults />      -- Results panel
    ├── <DeviceConfirmation />  -- "Showing results for: HP EliteBook 840 G10"
    ├── <UpgradeNotes />        -- Platform-specific notes
    ├── <MemoryResultsGroup label="QVL Certified" />
    ├── <MemoryResultsGroup label="Compatible" />
    ├── <MemoryResultsGroup label="Community Reported" collapsed />
    ├── <SSDResultsGroup />
    └── <NoResultsState />
```

### 11.2 State Management (Nanostores)

```ts
import { atom } from 'nanostores';

export const $finderMode = atom<'laptop' | 'desktop' | 'motherboard'>('laptop');
export const $selectedDevice = atom<Device | null>(null);
export const $findingInProgress = atom<boolean>(false);
export const $findingResults = atom<FinderResult | null>(null);
export const $findingError = atom<string | null>(null);
```

### 11.3 URL State Persistence

Finder results are reflected in URL parameters for shareability:

```
/products/finder?mode=laptop&brand=HP&model=EliteBook+840+G10
/products/finder?mode=motherboard&brand=ASUS&model=ROG+Strix+Z790-E
```

On page load, if URL params are present, the finder auto-runs the search and shows results.

---

## 12. Typeahead / Autocomplete Algorithm

### 12.1 Typeahead Flow

```
User types ≥ 2 chars in model field
    → Debounce 150ms
    → GET /api/v1/finder/models?brand=HP&device_type=laptop&q=Elite
    → Server queries MeiliSearch `device_typeahead` index
    → MeiliSearch: typo-tolerant prefix search, top 8 results
    → Return results JSON to island
    → Render dropdown with highlighted matches
    → User selects → trigger full finder search
```

### 12.2 Normalization

Before storing in the database:

```ts
function normalizeModel(model: string): string {
  return model
    .trim()
    .replace(/\s+/g, ' ')          // Collapse multiple spaces
    .replace(/\(.*?\)/g, '')       // Remove parenthetical suffixes
    .replace(/\b(wifi|wi-fi)\b/gi, '') // Remove connectivity suffixes
    .replace(/[^\w\s\-]/g, '')     // Remove special chars except hyphen
    .trim();
}

function normalizeBrand(brand: string): string {
  const brandMap: Record<string, string> = {
    'hewlett packard': 'HP',
    'hewlett-packard': 'HP',
    'asustek': 'ASUS',
    'gigabyte technology': 'GIGABYTE',
    'msi (micro-star)': 'MSI',
    'lenovo group': 'Lenovo',
  };
  return brandMap[brand.toLowerCase()] ?? brand;
}
```

---

## 13. Edge Cases & Special Handling

| Scenario | Handling |
|----------|---------|
| **Soldered LPDDR5X laptop** (e.g., MacBook, Dell XPS 13 2024) | Return `SOLDERED_NOT_UPGRADEABLE` status; redirect to SSD finder only |
| **Hybrid config** (e.g., 8GB soldered + 1 open SO-DIMM slot) | Show soldered amount; filter memory results to single-slot configs; note dual-channel is disabled |
| **Platform supports DDR4 or DDR5** (e.g., LGA1700 with Z690 chipset) | Return results for both generations; label clearly; note that board determines which generation |
| **Model not in database** | Return `NOT_FOUND` with: (a) suggestions for similar models, (b) manual spec entry option, (c) Contact Support link |
| **Motherboard model has many variants** (e.g., ROG Strix Z790-E vs Z790-F vs Z790-I) | Treat each variant as separate entry; typeahead lists all matching variants |
| **Customer installed wrong generation** | If customer reports DDR4 in DDR5 slot, explain it's physically impossible (different notch) |
| **XMP profile not listed on results** | Add note: "If your rated speed doesn't activate, enable XMP 3.0 or EXPO in BIOS" |
| **No QVL entries for a very new board** | Show `Spec-Compatible` results with note: "QVL testing pending for this board" |
| **SSD form factor mismatch** | Show only SSDs matching the laptop's M.2 slot form factor; if 2230 slot, show 2230 SSDs prominently |
| **Community report contradicts QVL** | QVL (`Certified`) always wins over community report; show community note as caveat |

---

## 14. Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Typeahead suggestion (typing) | < 100ms (Phase 2) | MeiliSearch + Redis cache response |
| Full finder search (POST) | < 300ms | Strapi API response |
| Results render (island) | < 500ms total including network | Lighthouse lab metrics |
| Device database size (Phase 2) | 5,000+ devices | — |
| QVL entries (Phase 2) | 500+ motherboards × avg 20 SKUs = 10,000+ entries | — |

---

## 15. Phase 1 vs Phase 2 Feature Delta

| Feature | Phase 1 | Phase 2 |
|---------|---------|---------|
| Database size | 100 motherboards, ~1,000 devices | 500 motherboards, 5,000 devices |
| Typeahead speed | < 300ms | < 100ms (Redis cache) |
| Community reports | No | Yes (`Reported-Working` status) |
| Vendor QVL scrape pipeline | No | Yes (quarterly; see QVL Ingest Spec) |
| SSD form factor matching | Basic | Full slot protocol + gen matching |
| URL state sharing | No | Yes (`?mode=&brand=&model=` params) |
| Custom Build mode | Basic CPU brand filter | Full platform + XMP/EXPO matching |
| Hybrid laptop configs | Shown as "not upgradeable" | Correctly shows 1-slot open config |
| Localized results | English only | AR/BN/HI result text |

---

## 16. Acceptance Criteria

### 16.1 Search Modes

- [ ] Laptop search with HP EliteBook 840 G10 returns VOLTX SO-DIMM results
- [ ] Soldered laptop returns SOLDERED_NOT_UPGRADEABLE with SSD results only
- [ ] Motherboard search with ASUS ROG Strix Z790-E returns QVL-certified results first
- [ ] Custom Build (AMD AM5) returns DDR5 + EXPO-tagged results only

### 16.2 Algorithm & Ranking

- [ ] QVL Certified results always appear before Spec-Compatible results
- [ ] Speed-optimized results appear before lower-speed alternatives (at same QVL level)
- [ ] Not-Compatible results are never shown to users

### 16.3 Typeahead

- [ ] Model typeahead returns suggestions within 300ms at Phase 1; 100ms target at Phase 2
- [ ] Typo tolerance: "Elitbook" returns "EliteBook 840 G10" suggestions
- [ ] Alias matching: "ThinkPad T14 Gen 5 AMD" found via model_aliases

### 16.4 Edge Cases

- [ ] Unknown model returns NOT_FOUND with similar model suggestions
- [ ] URL state: `/products/finder?mode=laptop&brand=HP&model=EliteBook+840+G10` auto-runs search on load
- [ ] Community report form submits and shows in admin as `Reported-Working` after manual approval

---

*Compatibility Finder Algorithm Specification v1.0 | TwinMOS Technologies | Phase 2*  
*Synchronized with: Tech Stack v1.1 §10.5 · BRD v3.0 §6 · RFP-FR-8.2.1–4*
