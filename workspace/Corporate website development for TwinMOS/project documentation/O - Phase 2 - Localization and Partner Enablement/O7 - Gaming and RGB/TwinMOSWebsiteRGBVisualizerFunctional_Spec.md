# TwinMOS Corporate Website — RGB Visualizer Functional Specification

**Document Reference:** TWN-P2-RGB-VIZ-2027-001  
**Document Version:** 1.0  
**Status:** APPROVED — For development implementation  
**Phase:** Phase 2 — Localization & Partner Enablement  
**Feature:** VOLTX DDR5 RGB Interactive Visualizer (WebGL)  
**Planned Delivery:** Phase 2, Sprint 8 (April 2027)  
**Phase 1 State:** Static RGB showcase page (`/gaming/rgb-showcase/`) is live in Phase 1  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** Marketing Director + IT/Technical Lead  
**Audience:** Unisoft Dev A (Frontend), TwinMOS Marketing/Design  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Source References:**  
- Tech Stack v1.1 §4.5 (React Islands: `<RGBVisualizer />` client:visible, P2)  
- Content Map: `content/website-content/05-gaming/03-rgb-showcase.md` (content exists)  
- URD v3.0 (Gamer persona — Mark; visual engagement requirements)

---

## Table of Contents

1. [Overview & Phase Delta](#1-overview--phase-delta)
2. [User Experience Goals](#2-user-experience-goals)
3. [Visualizer Features](#3-visualizer-features)
4. [Technical Architecture](#4-technical-architecture)
5. [3D Module Rendering (Three.js)](#5-3d-module-rendering-threejs)
6. [Lighting Effect Engine](#6-lighting-effect-engine)
7. [Motherboard Sync Simulation](#7-motherboard-sync-simulation)
8. [Mobile & Low-Power Fallback](#8-mobile--low-power-fallback)
9. [Asset Requirements](#9-asset-requirements)
10. [React Island Implementation](#10-react-island-implementation)
11. [Performance Budget](#11-performance-budget)
12. [Accessibility Requirements](#12-accessibility-requirements)
13. [Analytics Tracking](#13-analytics-tracking)
14. [Acceptance Criteria](#14-acceptance-criteria)

---

## 1. Overview & Phase Delta

### 1.1 Phase 1 State (Already Live)

The Phase 1 `03-rgb-showcase.md` page delivers:
- Static text descriptions of 10 lighting effects with a data table
- Static product images showing VOLTX DDR5 RGB modules
- Sync ecosystem platform list (ASUS, Gigabyte, MSI, ASRock)
- RGB setup guide (text-based)
- Link to build gallery

**Source file:** Already exists at `content/website-content/05-gaming/03-rgb-showcase.md`

### 1.2 Phase 2 Addition — WebGL Interactive Visualizer

Phase 2 upgrades the page by adding a `<RGBVisualizer />` React island that provides:
- **3D interactive VOLTX DDR5 module** — user can rotate, zoom, and inspect
- **Real-time lighting effect preview** — click an effect to see it animate on the module
- **Motherboard sync simulation** — shows how memory lighting syncs with surrounding components
- **Effect customization** — color picker, speed slider, brightness slider
- **Export** — one-click capture of current visualization as a shareable image

The static content below the visualizer remains; the island is injected at the top of the page replacing the "Effect Previews" placeholder section.

---

## 2. User Experience Goals

| Goal | Success Metric |
|------|---------------|
| Reduce "what does this effect look like?" uncertainty for buyers | ≥ 60% of visitors interact with visualizer before clicking Buy/Find Retailer |
| Showcase premium product quality | Visualizer engagement correlates with ≥ 15% uplift in VOLTX product page visits |
| Build brand affinity with gaming audience | Average session time on `/gaming/rgb-showcase/` ≥ 2 minutes |
| Encourage build gallery submissions | ≥ 10% of visualizer users click "Submit Your Build" |

---

## 3. Visualizer Features

### 3.1 Core Features (Phase 2 MVP)

| Feature | Description |
|---------|-------------|
| 3D module viewer | Rotatable, zoomable VOLTX DDR5 RGB module (2 modules in dual-channel config) |
| Effect selector | 10-card gallery (matching Phase 1 effect table) — click to apply |
| Effect animation | Real-time animation of selected effect on the 3D module LEDs |
| Color customization | Primary color picker (applies to Static, Breathing, Wave effects) |
| Speed control | Slider: Slow / Medium / Fast — affects animation cycle speed |
| Brightness control | Slider: 10%–100% brightness |
| Platform sync button | Toggle: "Simulate ASUS Aura" / "Simulate MSI Mystic Light" etc. (shows component sync animation) |
| Pause/Play | Toggle animation on/off |
| Screenshot | Capture current view as PNG (downloads to user's device) |
| Mobile fallback | Swipeable static carousel if WebGL not available or device is mobile |

### 3.2 Effects Inventory

| # | Effect ID | Name | Animation Description |
|---|-----------|------|-----------------------|
| 1 | `static` | Static | Solid color, no animation |
| 2 | `breathing` | Breathing | Slow fade in → full → fade out |
| 3 | `rainbow` | Rainbow | Full spectrum flow across all LEDs, left to right |
| 4 | `color-cycle` | Color Cycle | Smooth hue rotation through predefined palette |
| 5 | `strobe` | Strobe | Fast on/off flashing |
| 6 | `wave` | Wave | Color wave propagates from LED 0 to LED N |
| 7 | `meteor` | Meteor | Bright streak travels with fading trail |
| 8 | `stack` | Stack | Colors accumulate from bottom LED upward |
| 9 | `flash-dash` | Flash and Dash | Quick flash + traveling point of light |
| 10 | `custom` | Custom | User-defined per-LED color painting (Phase 2 stretch goal) |

---

## 4. Technical Architecture

### 4.1 Technology Selection

| Component | Selected | Version | Rationale |
|-----------|---------|---------|-----------|
| 3D rendering engine | **Three.js** | r168+ | Most mature WebGL library; excellent docs; large community; works well with React |
| React integration | **@react-three/fiber** | 8.x | Declarative Three.js in React; great DX; consistent with React island architecture |
| Scene helpers | **@react-three/drei** | 9.x | Orbit controls, environment maps, soft shadows — reduces boilerplate |
| State | **Nanostores** | 0.10+ | Consistent with rest of Astro islands |
| Animation | **Three.js AnimationMixer** | Built-in | GLTF animations if available; otherwise manual frame loop |
| Fallback | Static HTML carousel | — | Mobile / no-WebGL devices |

### 4.2 Bundle Size Budget

| Library | Approx Bundle Size | Notes |
|---------|--------------------|-------|
| Three.js | ~160KB gzipped | Tree-shaken: only used geometry + materials |
| @react-three/fiber | ~30KB gzipped | — |
| @react-three/drei (partial) | ~15KB gzipped | Only OrbitControls + Environment |
| **Total visualizer bundle** | **~210KB gzipped** | Lazy-loaded only when island enters viewport |

The `<RGBVisualizer />` island uses `client:visible` — bundle is not loaded until the island scrolls into view, protecting Lighthouse score.

---

## 5. 3D Module Rendering (Three.js)

### 5.1 GLTF Model Specification

TwinMOS Design team must provide a GLTF/GLB model of the VOLTX DDR5 RGB module:

| Spec | Requirement |
|------|-------------|
| Format | GLTF 2.0 binary (.glb) |
| Polygon count | ≤ 15,000 triangles (mobile-friendly) |
| Textures | Albedo (diffuse), Normal map, Roughness/Metalness map — each 1024×1024 PBR |
| LED zones | LED strip must be a separate mesh group for programmatic color application |
| Heatsink material | Aluminum PBR material (metalness ~0.9, roughness ~0.3) |
| PCB material | Dark green/black PCB material |
| Scale | 1 unit = 1mm in GLTF; actual module 133.35mm × 30mm |

**Fallback if GLTF not available before Sprint 8:** Use a procedurally generated box-based module created with Three.js BoxGeometry. This is a fallback — Marketing should provide the GLTF asset.

### 5.2 Module Setup in Three.js

```ts
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function VOLTXModule({ ledColor, effectId }: ModuleProps) {
  const { scene } = useGLTF('/assets/3d/voltx-ddr5-rgb.glb');
  
  // Find LED mesh group by name (agreed with 3D artist)
  const ledMesh = scene.getObjectByName('LED_Strip');
  
  // Apply material color + emissive based on current effect
  if (ledMesh && ledMesh.isMesh) {
    (ledMesh.material as THREE.MeshStandardMaterial).emissive.setStyle(ledColor);
    (ledMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5;
  }
  
  return <primitive object={scene} />;
}

function RGBVisualizerScene({ effect }: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 30, 100], fov: 45 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[50, 100, 50]} intensity={1.2} />
      <Environment preset="studio" />
      
      {/* Two modules in dual-channel config */}
      <group position={[-15, 0, 0]}>
        <VOLTXModule ledColor={effect.primaryColor} effectId={effect.id} />
      </group>
      <group position={[15, 0, 0]}>
        <VOLTXModule ledColor={effect.primaryColor} effectId={effect.id} />
      </group>
      
      <OrbitControls
        enableZoom={true}
        minDistance={60}
        maxDistance={200}
        enablePan={false}
        autoRotate={false}
      />
    </Canvas>
  );
}
```

---

## 6. Lighting Effect Engine

### 6.1 Effect Animation Loop

Each effect is implemented as an animation function called in the Three.js render loop via `useFrame`:

```ts
import { useFrame } from '@react-three/fiber';

function useRGBEffect(effectId: string, speed: number, brightness: number) {
  const timeRef = useRef(0);
  const colorRef = useRef(new THREE.Color());
  
  useFrame((state, delta) => {
    timeRef.current += delta * speed;
    const t = timeRef.current;
    
    switch (effectId) {
      case 'breathing':
        const breathIntensity = (Math.sin(t * Math.PI) + 1) / 2;
        colorRef.current.setHSL(primaryHue, 1, breathIntensity * brightness * 0.5);
        break;
      
      case 'rainbow':
        const hue = (t * 0.1) % 1;
        colorRef.current.setHSL(hue, 1, 0.5 * brightness);
        break;
      
      case 'wave':
        // Per-LED color based on position + time offset
        // ledIndex / totalLeds creates position-based phase shift
        // (Implemented per LED if LED array mesh available)
        break;
      
      case 'meteor':
        const meteorPos = (t * speed) % totalLeds;
        // Each LED: brightness based on distance from meteorPos, fading trail
        break;
      
      // ... other effects
    }
    
    // Apply computed color to LED mesh material
    setLEDColor(colorRef.current.getStyle());
  });
}
```

### 6.2 Per-LED Animation (Advanced Effects)

For effects requiring per-LED control (Wave, Meteor, Stack), the LED strip mesh must support per-LED color via vertex colors or a texture. If the GLTF does not support per-LED control, these effects use a simplified whole-strip version as a graceful degradation.

---

## 7. Motherboard Sync Simulation

### 7.1 Sync Mode Feature

When the user clicks a platform sync button (ASUS Aura / MSI Mystic Light / Gigabyte RGB Fusion / ASRock Polychrome), the visualizer expands to show a **simplified motherboard graphic** around the memory modules, with the board's RGB zones also animating in sync.

### 7.2 Implementation

Phase 2 MVP: The board is a **2D plane** (not 3D) with illustrated RGB zone highlights (SVG overlay, not a separate 3D model). RGB zone colors mirror the memory effect in real-time.

```
[3D Canvas]
  └── [Memory Modules — 3D GLTF] ← same as before
  └── [Board Overlay — SVG in DOM, positioned below canvas]
      ├── DIMM slot area highlighting
      ├── M.2 slot RGB strip (animated)
      └── Chipset heatsink RGB (animated)
```

The SVG board overlay is a custom designed TwinMOS-branded graphic (not real-world motherboard accuracy) showing representative RGB zones. Each brand's sync mode has a slightly different board outline color.

---

## 8. Mobile & Low-Power Fallback

### 8.1 Detection Logic

```ts
function shouldUseFallback(): boolean {
  // No WebGL support
  const canvas = document.createElement('canvas');
  const hasWebGL = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  if (!hasWebGL) return true;
  
  // Mobile device (touch + viewport width)
  const isMobile = 'ontouchstart' in window && window.innerWidth < 768;
  if (isMobile) return true;
  
  // Low-power device (limited GPU memory or CPU)
  // Use Navigator.deviceMemory API where available (Chrome only)
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
  
  // Reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  
  return false;
}
```

### 8.2 Fallback — Swipeable Carousel

When fallback is detected, render the **static enhanced carousel** from Phase 1:
- One card per effect, showing the static GIF/WebM preview image
- Swipeable on mobile (touch events)
- Tap to expand with effect description
- Same effect selector grid as Phase 1

The fallback component is `<RGBVisualizerFallback />` — it renders from the same effect data array as the 3D visualizer, requiring no separate content source.

---

## 9. Asset Requirements

### 9.1 3D Model (from TwinMOS Design)

| Asset | Format | Deadline |
|-------|--------|---------|
| VOLTX DDR5 RGB module GLB | GLB (GLTF 2.0) | April 1, 2027 |
| PBR texture maps (albedo, normal, roughness) | PNG 1024×1024 | April 1, 2027 |
| VOLTX DDR5 RGB module — side profile photo (fallback reference) | JPG 1920×1080 | March 1, 2027 |

### 9.2 Effect Video Assets (from Marketing)

For the Phase 1 static page (already live), and for the carousel fallback:

| Asset | Format | Count | Deadline (if not yet done) |
|-------|--------|-------|--------------------------|
| Lighting effect demonstration video | WebM + MP4 fallback, 5s loop, 1920×1080 | 10 (one per effect) | Phase 2 Sprint 8 |
| Static thumbnail per effect | WebP, 600×400 | 10 | Phase 2 Sprint 8 |

**Note:** Effect video assets were listed as pending in `03-rgb-showcase.md` — "Asset Note: Each effect above requires a high-resolution animated GIF or WebM video." Marketing must deliver these before Sprint 8.

---

## 10. React Island Implementation

### 10.1 Component Hierarchy

```
<RGBVisualizer />  (client:visible — lazy loaded)
├── <VisualizerDetect />           — WebGL/mobile detection
│   ├── If 3D supported:
│   │   ├── <EffectSelector />    — 10 effect cards; current effect highlighted
│   │   ├── <CustomizationPanel />— color picker, speed, brightness sliders
│   │   ├── <SyncPlatformToggle />— ASUS / MSI / Gigabyte / ASRock buttons
│   │   ├── <RGBVisualizerScene />— Three.js Canvas
│   │   ├── <PlayPauseControl />  — Toggle animation
│   │   └── <ScreenshotButton />  — PNG download
│   └── If fallback:
│       └── <RGBVisualizerFallback />— Swipeable static carousel
└── <VisualizerA11yDescription />  — Screen reader description of current effect
```

### 10.2 Nanostores State

```ts
export const $rgbEffect = atom<EffectId>('rainbow');
export const $rgbPrimaryColor = atom<string>('#FF0000');
export const $rgbSpeed = atom<number>(1.0);       // 0.5 = slow, 1.0 = medium, 2.0 = fast
export const $rgbBrightness = atom<number>(1.0);  // 0.1–1.0
export const $rgbSyncPlatform = atom<Platform | null>(null);
export const $rgbPlaying = atom<boolean>(true);
```

---

## 11. Performance Budget

| Metric | Budget | Method |
|--------|--------|--------|
| Visualizer JS bundle (gzipped) | ≤ 210KB | Tree-shaking + lazy loading |
| Initial page load (without visualizer bundle) | Unchanged from Phase 1 | `client:visible` defers load |
| Time from island-enter-viewport to interactive | ≤ 3 seconds | Preload GLB in low-priority background fetch |
| Frame rate (3D animation, desktop) | 60fps | useFrame optimizations |
| Frame rate (3D animation, low-power desktop) | ≥ 30fps | Effect complexity reduction based on frame time |
| Memory usage (WebGL context) | ≤ 256MB | Dispose unused geometries and textures |

---

## 12. Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| All 10 effects have text descriptions | Already in Phase 1 table; linked from visualizer |
| Animations respect `prefers-reduced-motion` | Detection in fallback logic (see §8.1); if true → show static image only |
| Keyboard navigation for effect selector | Arrow keys cycle through effects; Enter applies |
| Color picker is labeled and keyboard-navigable | Standard HTML `<input type="color">` |
| Speed/brightness sliders are labeled | `<input type="range" aria-label="...">` |
| Screenshot button has accessible label | `aria-label="Download screenshot of current RGB effect"` |
| Canvas has `aria-label` and role `img` | `<canvas aria-label="VOLTX DDR5 RGB interactive lighting visualizer">` |
| Screen reader summary of current effect | `<VisualizerA11yDescription />` updates via `aria-live="polite"` |

---

## 13. Analytics Tracking

| Event | Tracking ID | Fires When |
|-------|-------------|-----------|
| Visualizer loads (3D) | `load_rgb_visualizer_3d` | Three.js canvas mounts |
| Visualizer loads (fallback) | `load_rgb_visualizer_fallback` | Fallback carousel mounts |
| Effect selected | `select_rgb_effect_[effect_id]` | Effect card clicked |
| Sync platform toggled | `toggle_rgb_sync_[platform]` | Platform button clicked |
| Screenshot downloaded | `download_rgb_screenshot` | Screenshot button clicked |
| Color picker used | `use_rgb_color_picker` | Color change event (debounced) |
| Pause/play toggled | `toggle_rgb_play_[state]` | Pause/Play clicked |
| View sync compatibility CTA | `cta_rgb_visualizer_sync` | Existing CTA from static page |
| Build gallery CTA | `cta_rgb_visualizer_gallery` | Existing CTA from static page |

---

## 14. Acceptance Criteria

### 14.1 Visualizer Functionality

- [ ] All 10 effects render and animate correctly in Three.js on desktop Chrome, Firefox, Safari, Edge
- [ ] Rainbow effect displays full visible spectrum flowing across modules
- [ ] Breathing effect performs smooth fade in/out at all three speed settings
- [ ] Color picker applies color correctly to Static, Breathing, and Wave effects
- [ ] Sync platform toggle shows board overlay matching the selected platform brand color
- [ ] Screenshot downloads a valid PNG of the current canvas state

### 14.2 Performance

- [ ] Lighthouse performance score unchanged (±3 points) after visualizer launch
- [ ] Visualizer bundle is NOT downloaded on initial page load (verified via Network tab)
- [ ] Visualizer interactive within 3 seconds of entering viewport (on broadband connection)

### 14.3 Fallback

- [ ] Mobile device (iPhone 15 Safari) shows carousel, not 3D visualizer
- [ ] `prefers-reduced-motion` device shows static images, no animations

### 14.4 Accessibility

- [ ] All controls keyboard-navigable (Tab, Arrow keys, Enter, Space)
- [ ] Effect descriptions read by screen reader when effect is selected
- [ ] Canvas has correct aria-label

---

*RGB Visualizer Functional Specification v1.0 | TwinMOS Technologies | Phase 2*  
*Synchronized with: Tech Stack v1.1 §4.5 · Content Map 05-gaming/03-rgb-showcase.md*
