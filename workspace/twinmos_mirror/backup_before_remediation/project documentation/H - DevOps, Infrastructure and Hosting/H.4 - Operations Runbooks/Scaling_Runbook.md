# TwinMOS Website — Scaling Runbook

| | |
|:---|:---|
| **Reference** | H.4-004 |
| **Priority** | P2 |
| **Status** | [P] Planned |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This runbook provides procedures for scaling the TwinMOS website infrastructure vertically and horizontally.

---

## 2. Scaling Triggers

| Metric | Threshold | Action |
|:---|:---|:---|
| CPU > 70% for 10 min | Scale up | Upgrade VPS or optimize |
| RAM > 80% for 10 min | Scale up | Add swap or upgrade |
| Disk > 80% | Scale storage | Add volume or clean up |
| Response time > 2s | Optimize | Enable caching, CDN |
| Error rate > 1% | Investigate | Check logs, scale if needed |
| Concurrent users > 1000 | Scale up | Upgrade to CX42 |

---

## 3. Vertical Scaling (Hetzner VPS)

### 3.1 Upgrade CX32 to CX42

1. **Create snapshot**
```bash
hcloud server create-image --type snapshot twinmos-backend-prod --description "pre-scale-snapshot"
```

2. **Power off server**
```bash
hcloud server poweroff twinmos-backend-prod
```

3. **Change type**
```bash
hcloud server change-type twinmos-backend-prod cx42
```

4. **Power on**
```bash
hcloud server poweron twinmos-backend-prod
```

5. **Verify**
```bash
ssh root@<hetzner-ip>
free -h  # Check RAM
df -h    # Check disk
lscpu    # Check CPU
```

6. **Restart services**
```bash
cd /data/coolify
 docker compose up -d
```

**Downtime**: ~5 minutes

---

## 4. Horizontal Scaling (P3)

### 4.1 Add Load Balancer

```bash
# Create Hetzner Load Balancer
hcloud load-balancer create --name twinmos-lb --type lb11 --location nuremberg

# Add target
hcloud load-balancer add-target twinmos-lb --server twinmos-backend-prod --use-private-ip

# Add service
hcloud load-balancer add-service twinmos-lb --protocol https --destination-port 443
```

### 4.2 Add Read Replica (PostgreSQL)

```bash
# Create replica server
hcloud server create --name twinmos-db-replica --type cx21 --image ubuntu-24.04

# Configure streaming replication
# See PostgreSQL documentation for replica setup
```

---

## 5. Cloudflare Scaling

### 5.1 Upgrade Plan

| From | To | When |
|:---|:---|:---|
| Pro ($20) | Business ($200) | High traffic or need advanced WAF |
| Free Workers | Paid Workers | Need more than 100k requests/day |

### 5.2 Enable Argo Smart Routing

Cloudflare Dashboard -> Speed -> Argo -> Enable

---

## 6. Emergency Scaling

If sudden traffic spike:

1. **Enable Cloudflare Under Attack mode**
2. **Scale containers horizontally**
```bash
docker compose up -d --scale strapi-backend=3
```
3. **Enable rate limiting**
4. **Add caching rules**
5. **Monitor and adjust**

---

## 7. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 8. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
