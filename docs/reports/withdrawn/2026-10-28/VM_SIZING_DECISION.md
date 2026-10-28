# Infrastructure VM Sizing Decision & Capacity Plan (Task F4 / T7.4.3 / LOAD-01)

> **Authority:** TwinMOS Production Load & Stress Verification Suite (T7.4.1 / LOAD-01).  
> **Replaces:** `docs/reports/withdrawn/VM_SIZING_DECISION.md` (formally retired for outdated runtime specifications).  
> **Date:** October 2026 · Target Production Release (Node 24 LTS, PostgreSQL 18, Docker Compose / Systemd).  
> **Authors:** Infrastructure & DevOps Team (DO, FS2).

---

## 1. Executive Summary

This document establishes the official production infrastructure VM sizing and capacity architecture for the TwinMOS Corporate Platform. The decisions herein are grounded entirely in **empirical load test results** ([`docs/evidence/load_test_report.json`](../evidence/load_test_report.json) and [`docs/evidence/load_test_results.md`](../evidence/load_test_results.md)) gathered from concurrent multi-worker benchmarks against the production software stack.

---

## 2. Empirical Benchmark Findings (T7.4.1)

Under concurrent multi-worker load, the software stack achieved the following performance metrics:

| Traffic Scenario | Target SLA | Measured Throughput | p50 Latency | p95 Latency | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Browsing on Cache Hits (HTML / Edge)** | $\ge 200\text{ req/s}$, $p95 < 300\text{ms}$ | **378 req/s** | 59.25 ms | **98.28 ms** | **0 (0%)** |
| **Browsing on Cache Misses (Dynamic SSR)** | $\ge 30\text{ req/s}$, $p95 < 800\text{ms}$ | **406 req/s** | 19.53 ms | **41.36 ms** | **0 (0%)** |
| **Catalog & Delivery Search Queries** | $p95 < 400\text{ms}$ | **130 req/s** | 63.23 ms | **114.44 ms** | **0 (0%)** |
| **Form & Consent Submissions** | $p95 < 500\text{ms}$ | **254 req/s** | 26.97 ms | **34.56 ms** | **0 (0%)** |
| **Publishing Under Load (Concurrency)** | Concurrency safety | **95 req/s** | 57.35 ms | **105.62 ms** | **0 (0%)** |

All scenarios met or exceeded the agreed SLA targets with **0% errors** across 560+ concurrent transactions.

---

## 3. Subsystem Memory & Compute Profiling

The table below profiles the measured working set memory (RSS) and CPU utilization across each subsystem on Linux kernel 6.8+ (Ubuntu 24.04 LTS):

| Component | Runtime Architecture | Measured Working Set (RSS) | CPU Usage @ Peak Concurrency |
| :--- | :--- | :--- | :--- |
| **Nginx Edge Ingress** | Event-driven reverse proxy (`epoll`) | ~60 MB | ~5% of 1 core |
| **TwinMOS API (Hono)** | Node.js 24 LTS (native ES modules) | ~240 MB | ~25% of 1 core |
| **Astro SSR Web App** | Node.js 24 LTS standalone SSR server | ~280 MB | ~30% of 1 core |
| **PostgreSQL 18** | Relational engine (`shared_buffers = 1536MB`) | ~1,536 MB | ~20% of 1 core |
| **Host System & Utilities** | systemd, journald, cron, fail2ban (systemd native services) | ~400 MB | ~5% of 1 core |
| **Linux OS Page/Buffer Cache**| Filesystem buffer cache for NVMe storage | ~2,500 MB | N/A |
| **Total Working Set** | Combined Steady-State Allocation | **~5.0 GB** | **~85% of 1 core** |

---

## 4. Hardware Sizing Recommendation

### Production Specification (Selected Tier: General Purpose Cloud VM)
- **vCPU**: **4 vCPU** (x86_64 or ARM Neoverse)
- **Memory**: **8 GB ECC RAM**
- **Storage**: **80 GB NVMe SSD** (minimum 5,000 burstable IOPS)
- **Network**: **1 Gbps** guaranteed burst bandwidth
- **Operating System**: Ubuntu 24.04 LTS (HWE kernel)
- **Runtimes**: Node.js 24 LTS, PostgreSQL 18 (PGDG repository), Nginx 1.26+

### Headroom & Safety Margin
- At peak steady-state traffic (200 cached + 30 dynamic req/s), aggregate CPU utilization across 4 cores is **~22%**, providing a **4.5x headroom factor** for traffic spikes, seasonal product launches, or search engine re-indexing passes.
- Available memory headroom is **~3.0 GB**, completely preventing Linux OOM killer invocations during intensive pg_dumpall exports or sharp image derivative processing.

---

## 5. Database Connection Pool Architecture
- **Engine**: PostgreSQL 18
- **Maximum Connections (`max_connections`)**: `100`
- **Application Pool Size**: `50` maximum connections (API server pool)
- **Idle Connections**: `20`
- **Connection Timeout**: `3,000 ms`
- **Statement Timeout**: `10,000 ms`

---

## 6. Scaling & Expansion Milestones
1. **Launch Phase (Single VM Host)**: 4 vCPU / 8 GB RAM instance hosting Nginx edge, API, SSR, and PostgreSQL 18 with automated WAL archiving to offsite storage.
2. **Phase 2 Expansion (Managed DB Decoupling)**: When dynamic request rate exceeds 150 req/s sustained, decouple PostgreSQL 18 to a dedicated database instance with zero application code changes.
3. **Phase 3 Expansion (Horizontal App Nodes)**: Deploy multiple stateless containerized web/API replicas behind Cloudflare Load Balancing.
