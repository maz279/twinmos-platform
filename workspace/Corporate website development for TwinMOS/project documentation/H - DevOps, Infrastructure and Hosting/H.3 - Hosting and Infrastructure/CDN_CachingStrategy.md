# TwinMOS Website — CDN Caching Strategy

| | |
|:---|:---|
| **Reference** | H.3-008 |
| **Priority** | P2 |
| **Status** | [P] Planned |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the CDN caching strategy for the TwinMOS website using Cloudflare.

---

## 2. CDN Architecture

| Attribute | Specification |
|:---|:---|
| **Plan** | Pro ($20/month) |
| **PoPs** | 300+ worldwide |
| **Caching** | Aggressive |

**Cache Layers:** Browser Cache -> Cloudflare Edge -> Cloudflare Origin -> Hetzner Backend

---

## 3. Cache Rules

| Priority | Pattern | Cache Level | Edge TTL | Browser TTL |
|:---|:---|:---|:---|:---|
| 1 | `/_astro/*` | Cache Everything | 1 year | 1 year |
| 2 | `/assets/*` | Cache Everything | 1 year | 1 year |
| 3 | `*.js, *.css` | Cache Everything | 1 year | 1 year |
| 4 | `/images/*` | Cache Everything | 30 days | 7 days |
| 5 | `/*.html` | Cache Everything | 1 hour | 4 hours |
| 6 | `/api/*` | Bypass Cache | - | - |
| 7 | `/graphql` | Bypass Cache | - | - |

---

## 4. TTL Policies

| Content Type | Edge TTL | Browser TTL |
|:---|:---|:---|
| HTML | 1 hour | 4 hours |
| CSS/JS (hashed) | 1 year | 1 year |
| Images | 30 days | 7 days |
| Fonts | 1 year | 1 year |
| JSON (API) | 0 | 0 |
| XML (sitemap) | 1 day | 1 hour |

---

## 5. Cache Purge Strategy

| Trigger | Method | Scope |
|:---|:---|:---|
| Production deploy | Automatic | Full purge |
| CMS content update | Webhook | Selective URL purge |
| Emergency | Manual | Full or selective |

**Selective Purge (CMS Webhook):**
```javascript
await fetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ files: [url1, url2, url3] })
});
```

**Full Purge:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 6. Cache Analytics

| Metric | Target |
|:---|:---|
| Cache Hit Ratio | > 90% |
| Edge Response Time | < 100ms |
| Bandwidth Saved | > 80% |
| Origin Requests | < 20% of total |

**Optimization:** Asset hashing (Astro), Brotli compression, Early Hints, HTTP/3

---

## 7. Staging vs Production

| Setting | Production | Staging |
|:---|:---|:---|
| Edge TTL (HTML) | 1 hour | 0 (no cache) |
| Asset TTL | 1 year | 1 hour |
| Purge on deploy | Yes | No |

---

## 8. Troubleshooting

| Issue | Solution |
|:---|:---|
| Stale content | Purge cache, check TTL |
| Cache miss | Verify cache rules, check headers |
| 404 cached | Purge specific URL |
| API cached | Ensure /api bypass rule |

---

## 9. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 10. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
