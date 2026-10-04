# TwinMOS Website — Integration Specification: OpenStreetMap (Where-to-Buy Locator)

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-OSM-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P1 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §13.2; BRD §15 |

---

## 1. Overview

The **Where-to-Buy Locator** enables website visitors to find TwinMOS distributors and retail outlets globally. It uses **OpenStreetMap** (OSM) as the tile provider and **Leaflet.js** with **react-leaflet** as the mapping library, rendered as a React island in Astro.

### 1.1 Why OpenStreetMap + Leaflet

| Criterion | Assessment |
|-----------|-----------|
| Cost | Free — OSM tiles are free; no API key needed |
| Licensing | Open Data Commons Open Database License (ODbL) — attribution required |
| Privacy | No Google dependency; no cross-site tracking |
| React integration | react-leaflet 4.x provides declarative React components |
| Feature coverage | Clustering, custom markers, popups, geolocation — all supported |

---

## 2. Component Architecture

```
Astro page (where-to-buy.astro)
    │
    │  client:visible
    ▼
WhereToBuyLocator (React island, ~30 KB)
    │
    ├── Fetch distributors from /api/distributors (Strapi)
    ├── Fetch retailers from /api/retailers (Strapi)
    │
    ├── MapContainer (react-leaflet)
    │   ├── TileLayer (OSM Mapnik tiles)
    │   ├── MarkerClusterGroup (leaflet.markercluster)
    │   │   ├── Marker (distributor 1)
    │   │   │   └── Popup (distributor card)
    │   │   ├── Marker (distributor 2)
    │   │   └── ... (500+ retailer markers)
    │   └── ZoomControl
    │
    └── Sidebar (country/region filter list)
```

---

## 3. Dependencies

```bash
# In twinmos-website-frontend
npm install leaflet react-leaflet leaflet.markercluster
npm install -D @types/leaflet
```

| Package | Version | Purpose |
|---------|---------|---------|
| `leaflet` | 1.9.x | Core mapping library |
| `react-leaflet` | 4.x | React bindings for Leaflet |
| `leaflet.markercluster` | 1.5.x | Cluster overlapping pins |

---

## 4. Implementation

### 4.1 Astro Page Integration

**`src/pages/where-to-buy.astro`:**
```astro
---
import LayoutContent from '../layouts/LayoutContent.astro';
---
<LayoutContent title="Where to Buy TwinMOS" description="Find TwinMOS distributors and retailers near you.">
  <!-- Static fallback (no JS) -->
  <noscript>
    <div id="distributor-list-static">
      <!-- Server-rendered static list of distributors -->
    </div>
  </noscript>

  <!-- React island — loads only when scrolled into view -->
  <WhereToBuyLocator client:visible />
</LayoutContent>
```

> **SSR Note:** Leaflet uses browser APIs (`window`, `document`, `navigator`). The `client:visible` directive ensures this component is only hydrated in the browser — it is never executed server-side by Astro.

### 4.2 WhereToBuyLocator Component

**`src/components/islands/WhereToBuyLocator.tsx`:**
```tsx
'use client'; // Signals browser-only execution

import { useEffect, useState, lazy, Suspense } from 'react';

// Lazy-import leaflet components to avoid SSR issues
const MapContainer = lazy(() => import('react-leaflet').then(m => ({ default: m.MapContainer })));
const TileLayer = lazy(() => import('react-leaflet').then(m => ({ default: m.TileLayer })));
const Marker = lazy(() => import('react-leaflet').then(m => ({ default: m.Marker })));
const Popup = lazy(() => import('react-leaflet').then(m => ({ default: m.Popup })));

// Fix Leaflet default marker icon issue with webpack/vite
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

interface Distributor {
  id: number;
  name: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  tier: string;
  website?: string;
  phone?: string;
  productLines: string[];
}

export default function WhereToBuyLocator() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  useEffect(() => {
    // Import Leaflet CSS dynamically (browser only)
    import('leaflet/dist/leaflet.css');
    import('leaflet.markercluster/dist/MarkerCluster.css');
    import('leaflet.markercluster/dist/MarkerCluster.Default.css');

    // Fetch distributors from Strapi API
    fetch('/api/distributors?fields=name,lat,lng,country,city,tier,website,phone,productLines')
      .then(r => r.json())
      .then(json => {
        setDistributors(json.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredDistributors = selectedCountry === 'all'
    ? distributors
    : distributors.filter(d => d.country === selectedCountry);

  const countries = [...new Set(distributors.map(d => d.country))].sort();

  // Dubai, UAE coordinates as default center
  const DEFAULT_CENTER: [number, number] = [25.2048, 55.2708];

  if (isLoading) return <div className="map-loading">Loading distributor map...</div>;

  return (
    <div className="where-to-buy-wrapper">
      {/* Country filter */}
      <div className="map-filter-bar">
        <select
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
          aria-label="Filter by country"
        >
          <option value="all">All Countries</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="result-count">
          {filteredDistributors.length} distributor{filteredDistributors.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Suspense fallback={<div>Loading map...</div>}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={3}
          style={{ height: '500px', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {filteredDistributors.map(d => (
            d.lat && d.lng ? (
              <Marker key={d.id} position={[d.lat, d.lng]}>
                <Popup>
                  <div className="distributor-popup">
                    <h3>{d.name}</h3>
                    <p>{d.city}, {d.country}</p>
                    <p>Tier: {d.tier}</p>
                    {d.phone && <p><a href={`tel:${d.phone}`}>{d.phone}</a></p>}
                    {d.website && (
                      <a href={d.website} target="_blank" rel="noopener noreferrer">
                        Visit website →
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </Suspense>

      {/* Static list fallback / accessible alternative */}
      <details className="distributor-list-details">
        <summary>View as list ({filteredDistributors.length} results)</summary>
        <ul>
          {filteredDistributors.map(d => (
            <li key={d.id}>
              <strong>{d.name}</strong> — {d.city}, {d.country}
              {d.website && <> · <a href={d.website}>Website</a></>}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
```

---

## 5. Marker Clustering

For regions with many retailers (e.g., Bangladesh has 200+ listed retailers), marker clustering prevents visual clutter:

```tsx
import { MarkerClusterGroup } from 'react-leaflet-cluster';

// Wrap markers in cluster group
<MarkerClusterGroup chunkedLoading>
  {retailers.map(r => (
    <Marker key={r.id} position={[r.lat, r.lng]}>
      <Popup>...</Popup>
    </Marker>
  ))}
</MarkerClusterGroup>
```

---

## 6. Custom Markers

Distributors and retailers use different marker icons to visually distinguish tier:

```typescript
const distributorIcon = L.divIcon({
  className: 'custom-marker distributor-marker',
  html: '<div class="marker-pin marker-gold"></div>',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42],
});

const retailerIcon = L.divIcon({
  className: 'custom-marker retailer-marker',
  html: '<div class="marker-pin marker-blue"></div>',
  iconSize: [20, 28],
  iconAnchor: [10, 28],
  popupAnchor: [0, -28],
});
```

---

## 7. Data Source & API

### 7.1 Distributor Data from Strapi

```
GET /api/distributors?fields=name,lat,lng,country,city,tier,website,phone&pagination[pageSize]=500
```

All 500+ distributors loaded once on component mount. Pagination not required for map display (all pins needed upfront).

### 7.2 Coordinate Data Entry

Coordinates (`lat`, `lng`) are stored in Strapi at admin data-entry time:
- Operations team manually enters lat/lng when adding distributors
- Helper: Strapi admin panel shows a link to OpenStreetMap nominatim for geocoding
- No runtime geocoding API calls (avoids cost and latency)

### 7.3 API Caching

Distributor data is relatively static (changes weekly at most):
- Astro build-time: Distributor data pre-fetched and embedded in page for initial render
- Client-side: Stale-while-revalidate pattern; revalidated after 5 minutes
- Cloudflare CDN: `/api/distributors` response cached for 5 minutes (Cache-Control: max-age=300)

---

## 8. Geolocation (Optional Enhancement)

User's current location used to auto-center the map and sort results by distance:

```typescript
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation([position.coords.latitude, position.coords.longitude]);
    },
    (error) => {
      // Geolocation denied or unavailable — use default center
      console.log('Geolocation unavailable:', error.message);
    },
    { timeout: 5000 }
  );
}
```

User is prompted by browser for permission; map works without it.

---

## 9. OSM Usage Policy & Attribution

OpenStreetMap requires attribution on all maps:

**Required attribution (visible on map):**
```html
&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
```

This is automatically included via Leaflet's `TileLayer` `attribution` prop.

**OSM Tile Usage Policy:**
- Free for low-to-medium traffic sites
- If TwinMOS exceeds ~10,000 map tile requests/day: consider self-hosting OSM tiles or using a paid tile provider (MapTiler, Stadia Maps ~$19/mo)
- Phase 1 traffic projection: Well within free usage limits

---

## 10. Accessibility

| Feature | Implementation |
|---------|--------------|
| Keyboard navigation | Leaflet built-in — Tab to cycle markers, Enter to open popup |
| Screen readers | `aria-label` on map container, popup text is readable |
| Static list fallback | `<details>` element provides accessible alternative to map |
| Color contrast | Custom markers use WCAG AA-compliant colors |
| Focus management | React popup closes on Escape key |

---

## 11. Related Documents

- [TwinMOSWebsiteComponent_Architecture.md](../D.1 - Design Documents/TwinMOSWebsiteComponent_Architecture.md)
- [TwinMOSWebsiteAPISpecificationOpenAPI.yaml](../D.3 - API Specifications/TwinMOSWebsiteAPISpecificationOpenAPI.yaml) — `/api/distributors` endpoint
