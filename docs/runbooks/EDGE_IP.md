# TwinMOS Runbook: Edge Real Client IP & Cloudflare Ranges

> **Target Audience:** DevOps Engineers, Platform Administrators  
> **Applicable Gates:** `EDGE-01`, `EDGE-RIP`, `EDGE-START`, `S-09`, `S-10`, `S-16a`  
> **Roadmap Task:** `T2.5.1`, `T2.5.2`, `T2.5.4` (Sources A6, A5)

---

## 1. Architecture Overview

TwinMOS runs behind Cloudflare for DDoS protection, TLS termination, and edge caching. To accurately rate limit visitors, enforce anti-scraping rules, and attribute audit logs, the origin edge server (nginx) must reconstruct the true client IP address from Cloudflare's `CF-Connecting-IP` header:

```
[ Visitor Client ]
       │
       ▼ (Client IP: e.g., 203.0.113.88)
[ Cloudflare Edge ]
       │
       ▼ (CF Egress IP: e.g., 172.64.0.1; Header: CF-Connecting-IP: 203.0.113.88)
[ TwinMOS Nginx Edge ] (Restores $remote_addr from CF-Connecting-IP via set_real_ip_from)
       │
       ▼ (Header: X-Real-IP: 203.0.113.88)
[ TwinMOS API (Node) ] (clientIp() reads ONLY X-Real-IP when TRUST_PROXY=1)
```

### Security Rules
1. **Never Trust Public Internet Headers Directly**: The API does not accept `CF-Connecting-IP` or `X-Forwarded-For` from arbitrary callers.
2. **Single Trusted Ingress Header**: Nginx strips/sanitizes untrusted inbound headers and sets `proxy_set_header X-Real-IP $remote_addr;`.
3. **API Flag Enforcement**: In `apps/api/src/app.ts`, `clientIp()` reads `X-Real-IP` **only** when `TRUST_PROXY === '1'`. In untrusted/direct environments, it falls back strictly to the TCP socket's remote address.
4. **No Direct Origin Access**: Untrusted requests directly hitting origin (bypassing Cloudflare) are either dropped by firewall (`UFW`) or default server block (`return 444;`).

---

## 2. Cloudflare Range Configuration

Cloudflare publishes its active network CIDRs at:
- IPv4: `https://www.cloudflare.com/ips-v4`
- IPv6: `https://www.cloudflare.com/ips-v6`

These ranges are maintained in:
`deploy/nginx/realip_cloudflare.conf`

This file is included at the `http` / `server` level in nginx:
```nginx
include /etc/nginx/snippets/realip_cloudflare.conf;
```

---

## 3. Range Refresh Procedure

Cloudflare IP ranges change infrequently, but standard operational procedure requires quarterly validation or immediate update upon Cloudflare notifications.

### 3.1 Automated Range Refresh

Run the automated refresh script:

```bash
# Using Node.js (cross-platform):
node tooling/refresh-cf-ranges.mjs

# Or using shell:
./deploy/edge/refresh-cf-ranges.sh
```

The script will:
1. Fetch latest published IPv4 and IPv6 CIDRs from Cloudflare.
2. Validate CIDR formatting ($\ge 10$ IPv4 and $\ge 5$ IPv6 blocks).
3. Update `deploy/nginx/realip_cloudflare.conf`.
4. Run validation checks.

### 3.2 Testing & Applying

1. **Verify Nginx Configuration Syntax**:
   ```bash
   # On Docker edge:
   docker run --rm twinmos-edge-test nginx -t

   # On host / VM:
   sudo nginx -t
   ```

2. **Reload Nginx Without Downtime**:
   ```bash
   # On Docker:
   docker compose -f deploy/compose/docker-compose.yml exec edge nginx -s reload

   # On host / systemd:
   sudo systemctl reload nginx
   ```

3. **Verify Verification Checks**:
   ```bash
   node tooling/verify/edge-ip-proof.mjs
   ```

---

## 4. Verification & Testing Reference

- `tooling/verify/edge-ip-proof.mjs`: Static linter verifying CIDRs, single `real_ip_header`, no private CIDR leakage, and security headers.
- `tooling/verify/edge-ip-live-proof.mjs`: Live probe verifying distinct client IP isolation and rate limit behavior in simulated Cloudflare vs direct topology.
- `apps/api/test/security-pack.e2e.test.ts`: Automated integration tests `S-09` (separate sign-in buckets for distinct IPs) and `S-10` (forged headers do not override client IP).
