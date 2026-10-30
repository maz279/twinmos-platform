> [!CAUTION]
> # THIS REPORT HAS BEEN FORMALLY WITHDRAWN
> **Reason**: WITHDRAWN (Task R0.1 / Finding Z-34): Contradicts architecture specification ADR D-10 (Postgres 18), engines (Node >= 24), and containerized edge architecture.
> **Authority**: TwinMOS Revised Implementation Roadmap v3.0 (Task R0.1) & Zero-Trust Audit TM-VER-2026-10-16.

---

# Infrastructure VM Sizing Decision & Capacity Plan (Task F4 / LOAD-01)

## 1. Executive Summary

This document establishes the production infrastructure VM sizing and capacity architecture for the TwinMOS Corporate Platform, based on simulated peak traffic benchmarks, memory footprints across all subsystem runtimes, and resilience requirements.

---

## 2. Workload & Traffic Modeling

| Traffic Category | Peak Rate | Serving Layer | Target Latency (p95) |
| :--- | :--- | :--- | :--- |
| **Edge Cache Hits (Static / Micro-cached)** | 200 req/s | Cloudflare CDN & Nginx `ssr_cache` | < 50ms |
| **Dynamic Content (Astro SSR & Delivery API)** | 30 req/s | Node.js Hono API & Astro SSR | < 300ms |
| **Lead Submissions & Serial Verification** | 5 req/s | API + PostgreSQL + Outbox | < 500ms |
| **Admin Console Operations** | 2 req/s | Admin SPA + Authenticated API | < 400ms |

---

## 3. Subsystem Memory & Compute Profiling

| Component | Architecture | Working Set Memory (RSS) | CPU Utilization @ Peak |
| :--- | :--- | :--- | :--- |
| **Nginx Edge Ingress** | Event-driven (epoll) | ~60 MB | ~5% of 1 core |
| **TwinMOS API (Hono)** | Single-process Node.js 20 | ~220 MB | ~25% of 1 core |
| **Astro SSR Frontend** | Standalone Node.js server | ~260 MB | ~30% of 1 core |
| **PostgreSQL 18 DB** | Relational engine | ~1,536 MB (`shared_buffers`) | ~20% of 1 core |
| **OS, PM2, Cron, Tools** | Ubuntu 24.04 LTS kernel | ~500 MB | ~5% |
| **Buffer/Page Cache** | OS filesystem cache for NVMe | ~3,000 MB | N/A |
| **Total Allocation** | Combined | **~5.6 GB** | **~85% of 1 core** |

---

## 4. Hardware Sizing Recommendation

### Production Specification (Selected: General Purpose Cloud VM)
- **vCPU**: 4 vCPU (x86_64 or ARM Neoverse)
- **Memory**: 8 GB ECC RAM
- **Storage**: 80 GB NVMe SSD (minimum 5,000 IOPS burstable)
- **Network**: 1 Gbps guaranteed burst bandwidth
- **Monthly Cost Estimate**: ~$40–$55/month on standard cloud providers (Hetzner, DigitalOcean, Linode, AWS t4g.xlarge).

### Headroom & Safety Margin
- At peak steady-state (200 cached + 30 dynamic req/s), aggregate CPU usage across 4 cores is **~22%**, leaving a **4.5x headroom factor** for traffic surges, marketing promotions, or automated crawler spikes.
- Available memory headroom is **~2.4 GB**, completely preventing Linux OOM killer invocation during intensive media uploads or database dumps.

---

## 5. Scaling & Expansion Milestones

1. **Stage 1 (Launch VM)**: Single 4 vCPU / 8 GB RAM instance hosting Nginx, API, SSR, and PostgreSQL on-box with hourly WAL archiving and daily snapshot dumps.
2. **Stage 2 (Stateless Decoupling)**: When dynamic traffic exceeds 100 req/s, migrate PostgreSQL to managed cloud database service (e.g., Supabase / RDS / Cloud SQL).
3. **Stage 3 (Horizontal Expansion)**: Deploy multiple stateless VM app nodes behind Cloudflare Load Balancer with zero code changes.

