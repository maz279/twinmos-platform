# TwinMOS Website — Plausible Analytics Configuration

| | |
|:---|:---|
| **Reference** | H.5-004 |
| **Priority** | P1 |
| **Status** | [P] Planned |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the Plausible Analytics configuration for privacy-focused web analytics on the TwinMOS website.

---

## 2. Plausible Overview

| Attribute | Specification |
|:---|:---|
| **Version** | 2.1.x |
| **Hosting** | Self-hosted on Hetzner VPS (Docker) |
| **Domain** | analytics.twinmos.com |
| **Data Residency** | EU (same as server) |
| **Cookieless** | Yes |
| **GDPR Compliant** | Yes (no consent required) |

**Why Plausible:**
- Privacy-focused (no cookies, no personal data)
- Lightweight (< 1KB script)
- GDPR/CCPA compliant without consent banners
- Open source, self-hosted
- Simple, intuitive dashboard

---

## 3. Installation

### 3.1 Docker Compose

```yaml
# Added to Coolify project (see H.3-003)
version: '3.8'

services:
  plausible:
    image: plausible/analytics:v2.1
    ports:
      - "8000:8000"
    environment:
      - BASE_URL=https://analytics.twinmos.com
      - SECRET_KEY_BASE=${PLAUSIBLE_SECRET}
      - DATABASE_URL=postgres://plausible:${DB_PASSWORD}@plausible-db:5432/plausible
      - CLICKHOUSE_DATABASE_URL=http://plausible-events:8123/plausible_events_db
      - DISABLE_REGISTRATION=true
    depends_on:
      - plausible-db
      - plausible-events

  plausible-db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=plausible
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=plausible
    volumes:
      - plausible_db_data:/var/lib/postgresql/data

  plausible-events:
    image: clickhouse/clickhouse-server:24-alpine
    volumes:
      - plausible_events_data:/var/lib/clickhouse
```

### 3.2 Initial Setup

```bash
# Generate secret key
openssl rand -base64 64

# Run database migration
docker exec plausible bin/plausible db migrate

# Create admin user
docker exec plausible bin/plausible admin.create \
  admin@twinmos.com \
  "Admin User" \
  "SecurePassword123"
```

---

## 4. Website Integration

### 4.1 Astro Component

```astro
<!-- src/components/Plausible.astro -->
---
const { domain } = Astro.props;
---

<script defer data-domain={domain} src="https://analytics.twinmos.com/js/script.js"></script>
```

### 4.2 Base Layout

```astro
<!-- src/layouts/BaseLayout.astro -->
<html lang={lang} dir={dir}>
  <head>
    <!-- ... other head elements -->
    <Plausible domain="twinmos.com" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 4.3 Custom Events

```javascript
// Track custom goals
plausible('Download', { props: { product: 'VoltX DDR5' } });
plausible('Contact Form Submit');
plausible('Search', { props: { query: 'ddr5 memory' } });
```

---

## 5. Goals Configuration

| Goal Name | Trigger | Type |
|:---|:---|:---|
| Contact Form | `Contact Form Submit` | Custom event |
| Product Download | `Download` | Custom event |
| Newsletter Signup | `Newsletter Signup` | Custom event |
| Search | `Search` | Custom event |
| External Link | Outbound link click | Automatic |
| 404 Error | 404 page view | Automatic |

---

## 6. Dashboard Access

| Role | Access | Permissions |
|:---|:---|:---|
| DevOps Lead | Full | Admin, settings, goals |
| Marketing | Read | View stats, export reports |
| Project Manager | Read | View stats, share reports |

---

## 7. Data Retention

| Setting | Value |
|:---|:---|
| **Default retention** | 5 years |
| **Aggregate data** | Kept indefinitely |
| **Raw data** | 5 years |
| **Export format** | CSV |

---

## 8. Troubleshooting

| Issue | Solution |
|:---|:---|
| No data appearing | Check script URL, verify domain config, check ad blockers |
| Low page views | Compare with server logs, check script loading |
| Goals not tracking | Verify event names match exactly |
| Dashboard slow | Check ClickHouse performance, consider scaling |

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
