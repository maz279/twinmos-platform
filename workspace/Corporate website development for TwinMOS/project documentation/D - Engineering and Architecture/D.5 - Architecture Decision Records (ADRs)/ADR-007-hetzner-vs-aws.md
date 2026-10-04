# ADR-007: Backend Hosting — Hetzner VPS + Coolify vs AWS

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-007 |
| **Date** | 2026-04-01 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead, Project Owner |
| **Source** | Tech Stack §19 |

---

## 1. Context

The TwinMOS backend consists of:
- **Strapi v5** (Node.js CMS/API) — 1 instance
- **PostgreSQL 16** — primary database
- **MeiliSearch 1.13** — search engine
- **ImgProxy** — image transformation server
- **Redis 7** (Phase 2) — caching layer
- **Plausible Analytics** (Phase 2) — self-hosted analytics
- **Chatwoot** (Phase 2) — live chat
- **Medusa.js** (Phase 3) — e-commerce

All services run on a single VPS with Docker containers managed by Coolify. The decision is where to host this VPS.

### Project Cost Constraints

- Phase 1 backend: **<$25/month total**
- Phase 3 backend: **<$80/month total**

No dedicated DevOps engineer is available — the solution must be manageable by a 2-developer team without specialised infrastructure knowledge.

---

## 2. Decision

**We will use Hetzner Cloud (Germany) VPS + Coolify (self-hosted PaaS) for all backend services.**

| Phase | Server | Monthly Cost |
|-------|--------|-------------|
| Phase 1–2 | Hetzner CX32 (4 vCPU, 8 GB RAM, 80 GB SSD) | €13.10 (~$14) |
| Phase 3+ | Hetzner CX42 (8 vCPU, 16 GB RAM, 160 GB SSD) | €25.20 (~$27) |

---

## 3. Rationale

### Cost Comparison

| Service | Hetzner CX32 | AWS Equivalent | Factor |
|---------|-------------|----------------|--------|
| 4 vCPU, 8 GB RAM | **€13.10/mo** | EC2 t3.xlarge: ~$150/mo | **11x cheaper** |
| Bandwidth (20 TB included) | **€0** | $0.09/GB → $1,800/mo for 20TB | **Immense saving** |
| Managed DB (PostgreSQL) | Not needed (self-managed) | RDS db.t3.medium: $50/mo | — |
| Total comparable stack | **~€15-20/mo** | ~$300-500/mo | **15-20x cheaper** |

### Why Not AWS for This Project

1. **Cost:** AWS equivalent infrastructure would be $300-500/month — 15-20x the Hetzner cost and 10-20x over the Phase 1 budget constraint. This is not justified for a 2-developer startup project.

2. **Managed service overhead:** AWS managed services (RDS, ElastiCache, etc.) add significant cost to avoid operational work. But the project uses **Coolify** (see below) which provides equivalent operational simplification at $0 extra cost.

3. **No geographic latency advantage for this stack:** The Astro frontend (static) is already on Cloudflare's global edge (310+ PoPs). The Strapi API is called at **build time** (SSG), not at user request time. Real-time API calls (form submissions, search) have acceptable latency from Hetzner DE to MEA/South Asia users (100-200ms — well under page interaction thresholds).

4. **Team capacity:** A 2-developer team managing AWS IAM, VPCs, security groups, ECS, RDS parameter groups etc. would spend 20+ hours/month on infrastructure. Hetzner + Coolify requires ~2 hours/month.

### Why Coolify

**Coolify** is a self-hosted open-source PaaS (similar to Heroku, Render) that:
- Provides a GUI for deploying Docker containers
- Handles SSL certificates (Let's Encrypt) automatically
- Manages environment variables securely
- Provides deployment rollback (previous image) with one click
- Runs automated backups to B2
- **Zero licensing cost** — runs on the same Hetzner VPS

Without Coolify, the team would need to manually write docker-compose files, manage nginx, configure SSL, handle deployments — 10+ hours to set up vs. 30 minutes with Coolify.

### Data Residency

| User Region | Data Path |
|-------------|-----------|
| MEA (primary) | Strapi on Hetzner DE → EU data residency |
| South Asia | Hetzner DE — acceptable for GDPR/PDPL compliance |
| EU | Hetzner DE — full GDPR compliance |

Hetzner Falkenstein (Germany) provides EU data residency which covers GDPR compliance. UAE PDPL has adequacy provisions for EU servers.

---

## 4. Alternatives Considered

| Option | Monthly Cost | Reason Not Chosen |
|--------|-------------|------------------|
| **AWS (EC2 + RDS + ElastiCache)** | $300-500 | 15-20x over budget; excessive management overhead for 2-dev team |
| **DigitalOcean** | ~$40-80 | 3-5x Hetzner cost; no Coolify native integration advantage |
| **Railway.app** | $20-50 | Per-resource pricing unpredictable; no self-hosted option; vendor lock-in |
| **Fly.io** | $30-60 | Good but more complex for this multi-service stack; Coolify simpler |
| **Render** | $40-80 | Managed but expensive at scale; limited free tier |
| **Google Cloud (GCP)** | $200-400 | Similar to AWS — overkill and over-budget |
| **Azure** | $200-400 | Similar to AWS |

---

## 5. Consequences

### Positive
- Phase 1 cost: **€13.10/month** — well within $25 budget
- Phase 3 cost: **€25.20/month** — well within $80 budget
- Zero bandwidth charges (20 TB included on CX32)
- Coolify eliminates DevOps specialist requirement
- EU data residency for GDPR compliance
- Single SSH access to debug/investigate all services
- Hetzner has 99.9%+ uptime SLA

### Negative / Trade-offs
- **No automatic failover:** If the single Hetzner VPS fails, all backend services are unavailable. **Mitigated:** Cloudflare CDN serves static pages from cache (site remains accessible for static content). Strapi downtime only affects form submissions and dynamic searches. RTO: <4 hours (Coolify redeploy on new VPS from backup).
- **No auto-scaling:** Single VPS cannot auto-scale under traffic spikes. **Mitigated:** SSG means Strapi API is only called at build time or for form submissions (low frequency). MeiliSearch search queries are read-only and fast.
- **Single point of failure for database:** No read replicas in Phase 1. **Mitigated:** pg_dump daily backups to B2; WAL streaming to be evaluated in Phase 2.

### Phase 3 Upgrade Path

If Phase 3 traffic warrants additional infrastructure:
1. Upgrade to Hetzner CX42 (€25/month)
2. Add separate Hetzner CX22 for PostgreSQL (€7/month)
3. Add managed Redis (or dedicated Redis Hetzner instance)
4. Total: ~€35-40/month — still within budget

---

## 6. Related ADRs

- ADR-001: Stack Selection
- ADR-006: Cloudflare Pages vs Vercel (frontend hosting)
- [TwinMOSWebsiteDeployment_Diagram.md](../D.1 - Design Documents/TwinMOSWebsiteDeployment_Diagram.md)
- [TwinMOSWebsiteNetworkTopologyDiagram.md](../D.1 - Design Documents/TwinMOSWebsiteNetworkTopologyDiagram.md)
