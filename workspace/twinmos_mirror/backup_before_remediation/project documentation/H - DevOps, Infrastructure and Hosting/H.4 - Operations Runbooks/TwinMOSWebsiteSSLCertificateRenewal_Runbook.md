# TwinMOS Website — SSL Certificate Renewal Runbook

**Document ID:** H.4-008  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteCloudflareConfigurationGuide.md · TwinMOSWebsiteDNSRecordsSpecification.md · TwinMOSWebsiteUptimeRobot_Setup.md · TwinMOSWebsiteHetznerProvisioningGuide.md

---

## 1. Certificate Inventory

| Certificate | Domain(s) | Type | Provider | Renewal Method | Auto-Renew | Expiry Alert |
|-------------|-----------|------|----------|---------------|------------|-------------|
| Cloudflare Universal SSL | twinmos.com, *.twinmos.com | Managed TLS | Cloudflare (Let's Encrypt + DigiCert) | Automatic | ✅ Yes (30d before) | Cloudflare email + dashboard |
| Cloudflare Origin Certificate | *.twinmos.com, twinmos.com | Long-lived (15yr) | Cloudflare CA | Manual (15yr validity) | ❌ Manual at expiry | UptimeRobot (14d alert) |
| Let's Encrypt via Coolify | api.twinmos.com, admin.twinmos.com, search.twinmos.com, imgproxy.twinmos.com, analytics.twinmos.com | ACME | Let's Encrypt | Automatic (Traefik ACME) | ✅ Yes (30d before) | UptimeRobot (14d alert) |
| Let's Encrypt via Coolify | staging.twinmos.com, staging-api.twinmos.com | ACME | Let's Encrypt | Automatic (Traefik ACME) | ✅ Yes | UptimeRobot (14d alert) |

**Certificate architecture summary:**

```
User ──► Cloudflare Edge (Universal SSL — Cloudflare manages)
            ↓ internal TLS
         Hetzner Origin (Cloudflare Origin Certificate OR Let's Encrypt)
```

The user never sees the origin certificate directly — Cloudflare terminates TLS at the edge and presents its own Universal SSL certificate. The origin certificate secures the Cloudflare → Hetzner leg.

---

## 2. TLS Configuration Reference

```
Cloudflare SSL/TLS Mode: Full (strict)
  ← Never use "Flexible" (origin unencrypted) or plain "Full" (no origin cert validation)

Minimum TLS Version: TLS 1.2
  TLS 1.3: Enabled
  Reason: TLS 1.2 retained for legacy device compatibility (older Android devices in target markets)

HSTS:
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Max-Age: 31536000 (1 year)
  Include Subdomains: Yes
  Preload: Yes (submit to hstspreload.org after 6 months stable)

Cipher suites (Cloudflare default — Modern):
  TLS 1.3: TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256
  TLS 1.2: ECDHE-ECDSA-AES128-GCM-SHA256, ECDHE-RSA-AES128-GCM-SHA256 (and others)

Certificate Authority Authorization (CAA):
  @ CAA 0 issue "letsencrypt.org"
  @ CAA 0 issue "pki.goog"
  @ CAA 0 issuewild "letsencrypt.org"
  @ CAA 0 iodef "mailto:security@twinmos.com"
```

---

## 3. Cloudflare Universal SSL — Automatic Renewal

### 3.1 How It Works

Cloudflare manages the edge certificate entirely. It renews automatically ~30 days before expiry using its Let's Encrypt and DigiCert integrations.

**No action required under normal circumstances.**

### 3.2 Verify Current Certificate Status

```bash
# Check what certificate Cloudflare is presenting to users
echo | openssl s_client -connect twinmos.com:443 -servername twinmos.com 2>/dev/null \
  | openssl x509 -noout -issuer -subject -dates

# Expected output:
# subject=CN=twinmos.com
# issuer=C=US, O=Google Trust Services (or Let's Encrypt)
# notBefore=... (recent date)
# notAfter=... (3 months from issue — Let's Encrypt 90-day certs)

# Check in Cloudflare dashboard:
# SSL/TLS → Edge Certificates → Certificate expiry date shown
```

### 3.3 If Cloudflare Universal SSL Fails to Renew

Symptoms: Cloudflare dashboard shows "Certificate pending" or expiry alert.

```
1. Cloudflare Dashboard → twinmos.com → SSL/TLS → Edge Certificates
2. Check for any error messages

3. If "Certificate Authority Authorization (CAA) check failed":
   Verify CAA records in Cloudflare DNS match §2 above
   dig twinmos.com CAA +short

4. If "Domain validation failed":
   Ensure twinmos.com DNS is pointing to Cloudflare (nameservers are Cloudflare)
   Check that there are no CAA records blocking Cloudflare's CA

5. Force re-issuance:
   SSL/TLS → Edge Certificates → [Certificate] → ... → Request Advanced Certificate
   (Cloudflare will re-request from CA)

6. Emergency (certificate expired and cannot renew):
   Temporarily disable HTTPS-only for twinmos.com while investigating
   Escalate to Cloudflare support (Pro plan includes email support)
```

---

## 4. Cloudflare Origin Certificate — Installation & Management

### 4.1 Overview

The Cloudflare Origin Certificate is issued by Cloudflare's own CA, valid for 15 years. It is only trusted by Cloudflare — not by browsers directly. It secures the Cloudflare-to-Hetzner communication when SSL mode is "Full (strict)".

### 4.2 Create Origin Certificate

Only needed once at setup (or if replacing after compromise):

```
Cloudflare Dashboard → twinmos.com → SSL/TLS → Origin Server
→ Create Certificate

Settings:
  Generate private key: Cloudflare generates (or paste your own CSR)
  Hostnames: *.twinmos.com, twinmos.com
  Certificate Validity: 15 years

Download:
  Certificate: twinmos-origin.pem  (public certificate)
  Private Key: twinmos-origin.key  (private key — shown ONCE, download immediately)
```

### 4.3 Install on Hetzner Server

```bash
# Copy certificates to Hetzner server
scp twinmos-origin.pem deploy@<server-ip>:/tmp/
scp twinmos-origin.key deploy@<server-ip>:/tmp/

ssh deploy@<server-ip>

# Store in standard SSL directory
sudo mkdir -p /etc/ssl/twinmos
sudo mv /tmp/twinmos-origin.pem /etc/ssl/twinmos/twinmos-origin.pem
sudo mv /tmp/twinmos-origin.key /etc/ssl/twinmos/twinmos-origin.key
sudo chmod 644 /etc/ssl/twinmos/twinmos-origin.pem
sudo chmod 600 /etc/ssl/twinmos/twinmos-origin.key
sudo chown root:root /etc/ssl/twinmos/

# Configure Traefik (via Coolify) to use this certificate
# Coolify → Settings → Proxy (Traefik) → TLS
# Or add Traefik static config:
cat > /data/coolify/proxy/traefik.yml << EOF
tls:
  certificates:
    - certFile: /etc/ssl/twinmos/twinmos-origin.pem
      keyFile: /etc/ssl/twinmos/twinmos-origin.key
  stores:
    default:
      defaultCertificate:
        certFile: /etc/ssl/twinmos/twinmos-origin.pem
        keyFile: /etc/ssl/twinmos/twinmos-origin.key
EOF

# Restart Traefik/Coolify proxy
docker restart coolify-proxy

# Verify
curl -sI https://api.twinmos.com | head -5
```

### 4.4 Origin Certificate Expiry

The Cloudflare Origin Certificate is valid for 15 years. No renewal needed until ~2041. Set a calendar reminder for 2040.

---

## 5. Let's Encrypt via Coolify — Automatic Renewal

### 5.1 How It Works

Coolify uses Traefik as its reverse proxy. Traefik has a built-in ACME client that:
1. Requests Let's Encrypt certificates for all configured domains on first deployment
2. Automatically renews certificates 30 days before expiry (every 60-day renewal cycle for 90-day certs)
3. Stores certificates in `/data/coolify/proxy/acme.json`

**No action required under normal circumstances.**

### 5.2 Verify Let's Encrypt Certificates

```bash
# SSH to Hetzner server
ssh deploy@<server-ip>

# Check current certificate state
docker exec coolify-proxy cat /data/acme.json | \
  python3 -c "import json,sys; data=json.load(sys.stdin); \
  [print(d.get('domain',{}).get('main',''), d.get('certificate','')[:50]) \
   for d in data.get('letsencrypt',{}).get('Certificates',[])]"

# Check expiry dates for all domains
for domain in api admin search imgproxy analytics staging staging-api; do
  EXPIRY=$(echo | openssl s_client -connect ${domain}.twinmos.com:443 \
    -servername ${domain}.twinmos.com 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  echo "${domain}.twinmos.com: ${EXPIRY}"
done
```

### 5.3 If Let's Encrypt Auto-Renewal Fails

**Symptoms:** UptimeRobot SSL alert fires at 14 days remaining; Sentry shows SSL errors.

**Diagnosis:**

```bash
ssh deploy@<server-ip>

# Check Traefik logs for ACME errors
docker logs coolify-proxy --since 24h | grep -iE "acme|certificate|tls|error"

# Common errors:
# "too many requests" — Let's Encrypt rate limited (max 5 certs per domain per week)
# "CAA check failed" — CAA DNS record blocking Let's Encrypt
# "challenge failed" — Traefik cannot complete HTTP-01 challenge (firewall blocking port 80?)
```

**Fix — Rate limit:**

```bash
# If rate-limited: wait up to 7 days OR use staging Let's Encrypt for testing
# Check current rate limit: https://crt.sh/?q=twinmos.com

# Rate limits:
# 50 certificates per registered domain per week (*.twinmos.com counts as one)
# 5 duplicate certificates per week
```

**Fix — HTTP-01 challenge failure:**

```bash
# Ensure port 80 is accessible from Let's Encrypt servers
# Cloudflare must NOT be bypassing HTTP to HTTPS redirect before Let's Encrypt validates
# Temporary: Disable Cloudflare "Always Use HTTPS" during renewal, re-enable after
# Or: Use DNS-01 challenge via Cloudflare API (more robust)

# Configure DNS-01 challenge in Traefik:
cat >> /data/coolify/proxy/traefik.yml << EOF
certificatesResolvers:
  letsencrypt:
    acme:
      email: devops@twinmos.com
      storage: /data/acme.json
      dnsChallenge:
        provider: cloudflare
        delayBeforeCheck: 0
EOF

# Set Cloudflare API token in Traefik environment:
# CLOUDFLARE_DNS_API_TOKEN=<token with DNS:Edit permission>

docker restart coolify-proxy
```

**Fix — Force certificate renewal:**

```bash
# Force Traefik to re-request certificate
# Delete the domain's entry from acme.json (careful — this removes ALL certs in the file if not targeted)
# Better: restart Traefik, it will detect expired certs and renew

docker restart coolify-proxy

# Monitor renewal:
docker logs coolify-proxy -f | grep -iE "acme|certificate|tls"
# Look for: "Obtaining ACME certificate" → "Certificate obtained"

# Verify new expiry:
echo | openssl s_client -connect api.twinmos.com:443 2>/dev/null \
  | openssl x509 -noout -enddate
```

**Fix — Manual renewal using Certbot (emergency):**

```bash
# Install certbot as fallback
sudo apt-get install certbot

# Stop Traefik temporarily (frees port 80)
docker stop coolify-proxy

# Request certificate using standalone mode
sudo certbot certonly \
  --standalone \
  --domain api.twinmos.com \
  --domain admin.twinmos.com \
  --domain search.twinmos.com \
  --email devops@twinmos.com \
  --agree-tos \
  --non-interactive

# Copy certificates to Traefik's expected location
sudo cp /etc/letsencrypt/live/api.twinmos.com/fullchain.pem \
        /data/coolify/proxy/certs/api.twinmos.com.pem
sudo cp /etc/letsencrypt/live/api.twinmos.com/privkey.pem \
        /data/coolify/proxy/certs/api.twinmos.com.key

# Restart Traefik
docker start coolify-proxy

# Verify
echo | openssl s_client -connect api.twinmos.com:443 2>/dev/null | openssl x509 -noout -enddate
```

---

## 6. UptimeRobot SSL Monitoring Setup

Configure SSL certificate expiry monitoring in UptimeRobot to alert at 14 days remaining:

```
UptimeRobot → Monitors → Add Monitor

Monitor type: SSL Certificate
Friendly name: SSL — api.twinmos.com
URL: https://api.twinmos.com
Alert: 14 days before expiry
Alert contacts: tech-lead@twinmos.com + Slack #ops webhook

Repeat for each subdomain:
  SSL — twinmos.com
  SSL — admin.twinmos.com
  SSL — search.twinmos.com
  SSL — imgproxy.twinmos.com
  SSL — analytics.twinmos.com
  SSL — staging.twinmos.com
```

---

## 7. HSTS and Preloading

### 7.1 HSTS Header

Configured in Cloudflare Transform Rules → Security Headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Important:** HSTS with `preload` is a one-way commitment. Once preloaded in browsers, removing HSTS is very difficult. Only add `preload` when confident the domain will always serve HTTPS.

### 7.2 HSTS Preload Submission

After 6 months of stable HTTPS operation with all subdomains serving HTTPS:

```
1. Check eligibility: https://hstspreload.org/?domain=twinmos.com
   All checks must pass:
   □ max-age ≥ 10886400 (18 weeks)
   □ includeSubDomains present
   □ preload present
   □ HTTPS serves valid certificate
   □ Redirect HTTP → HTTPS

2. Submit: https://hstspreload.org → Submit

3. Propagation: 2–3 months to reach all browsers (Chrome, Firefox, Safari, Edge)

4. Once preloaded: browsers will refuse HTTP connections to twinmos.com without asking
```

### 7.3 HSTS Removal (Emergency)

If HTTPS must be disabled temporarily (very unlikely):

```
1. Reduce max-age to 0: Strict-Transport-Security: max-age=0
2. Wait for browsers to flush HSTS (up to previous max-age = 1 year)
3. If submitted to preload list: submit removal at https://hstspreload.org (takes months)
```

---

## 8. Annual SSL Audit Checklist

Run every 6 months:

```
□ Cloudflare Edge Certificate expiry:
  Cloudflare Dashboard → SSL/TLS → Edge Certificates → Check expiry
  Target: Renewed automatically; should show ≥60 days remaining at any time

□ Cloudflare Origin Certificate expiry:
  echo | openssl s_client -connect api.twinmos.com:443 2>/dev/null \
    | openssl x509 -noout -enddate
  If using Origin Cert (15yr): should show ~2040+ expiry

□ Let's Encrypt certs on all services:
  (Use the loop in §5.2)
  All should show ≥30 days remaining; anything <30 days needs investigation

□ TLS version check — verify TLS 1.0 and 1.1 are disabled:
  nmap --script ssl-enum-ciphers -p 443 api.twinmos.com | grep -E "TLSv|TLS 1\.[01]"
  Should NOT show TLS 1.0 or TLS 1.1

□ Cipher suite check:
  testssl.sh --fast api.twinmos.com
  No weak ciphers (RC4, DES, 3DES, EXPORT)

□ Certificate Transparency (CT) log check:
  https://crt.sh/?q=twinmos.com
  Verify only expected certificates issued in last 90 days
  Any unexpected cert: potential misissuance — check CAA records immediately

□ CAA records present and correct:
  dig twinmos.com CAA +short
  Expected output includes letsencrypt.org and pki.goog entries

□ HSTS header present:
  curl -sI https://twinmos.com | grep -i "strict-transport"
  Expected: max-age=31536000; includeSubDomains; preload

□ Document audit results in Slack #ops:
  "SSL audit [date]: All certs valid. TLS 1.0/1.1 disabled. No unexpected CT logs."
```

---

## 9. Certificate Emergency Contacts

| Scenario | Contact |
|----------|---------|
| Cloudflare certificate issue | support.cloudflare.com (Pro plan email support) |
| Let's Encrypt rate limit issue | community.letsencrypt.org |
| Certificate misissuance report | security@twinmos.com → CA's abuse contact |
| Domain hijacking / DNS compromise | Domain registrar emergency hotline + Cloudflare support |

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.5, §19.6*
