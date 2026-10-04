# TwinMOS Website — Dark Mode Design Specification

**Document ID:** E.3.5
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document defines dark mode design specifications for the TwinMOS website. Dark mode is primarily used for the VOLTX Gaming hub and as an optional user preference across corporate pages.

**Cross-references:**
- E.1.1 Color Palette & Tokens
- E.1.3 Typography System
- URD Section 3.6 (Theme Preferences)
- Tech Stack: Tailwind CSS dark mode, CSS custom properties

## 2. Dark Mode Strategy

### 2.1 Implementation Approach

| Page Type | Default Mode | Toggle |
|-----------|--------------|--------|
| Corporate pages | Light | User preference (saved) |
| VOLTX Gaming hub | Dark | Always dark |
| Product detail (gaming) | Dark | Inherits gaming mode |
| Support pages | Light | User preference |

### 2.2 Toggle Mechanism

```
Location: Header, right side
Icon: Sun (light) / Moon (dark)
Size: 24x24px
Behavior: Click toggles, preference saved to localStorage
Default: Follows system preference (`prefers-color-scheme`)
```

## 3. Dark Mode Color Palette

### 3.1 Corporate Dark Mode

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--bg-primary` | `#FFFFFF` | `#0A0E1A` | Page background |
| `--bg-secondary` | `#F6F9FC` | `#111827` | Section backgrounds |
| `--bg-tertiary` | `#E5E7EB` | `#1F2937` | Cards, panels |
| `--text-primary` | `#1A1A2E` | `#F9FAFB` | Headlines, body |
| `--text-secondary` | `#4B5563` | `#9CA3AF` | Captions, meta |
| `--text-muted` | `#6B7280` | `#6B7280` | Disabled, hints |
| `--border` | `#E5E7EB` | `#374151` | Dividers, borders |
| `--accent` | `#00A3E0` | `#00A3E0` | Primary accent (unchanged) |
| `--accent-hover` | `#0077A8` | `#33B5E5` | Accent hover |
| `--surface` | `#FFFFFF` | `#1F2937` | Elevated surfaces |
| `--shadow` | `rgba(0,0,0,0.1)` | `rgba(0,0,0,0.4)` | Shadows |

### 3.2 Gaming Dark Mode (VOLTX)

| Token | Value | Usage |
|-------|-------|-------|
| `--gaming-bg` | `#0A0A0F` | Deep space background |
| `--gaming-surface` | `#14141E` | Cards, panels |
| `--gaming-border` | `#00F0FF33` | Cyan glow borders |
| `--gaming-accent` | `#00F0FF` | Neon cyan primary |
| `--gaming-accent-dim` | `#00A3E0` | Secondary accent |
| `--gaming-text` | `#FFFFFF` | Primary text |
| `--gaming-text-dim` | `#A0A0B0` | Secondary text |
| `--gaming-glow` | `#00F0FF66` | RGB glow effects |

## 4. Component Dark Mode Styles

### 4.1 Buttons

| Variant | Light | Dark |
|---------|-------|------|
| Primary | `#00A3E0` bg, white text | `#00A3E0` bg, white text |
| Secondary | `#0A2540` bg, white text | `#1F2937` bg, white text |
| Ghost | Transparent, `#0A2540` text | Transparent, `#F9FAFB` text |
| Gaming | `#00F0FF` bg, `#0A0A0F` text | `#00F0FF` bg, `#0A0A0F` text |

### 4.2 Cards

| Property | Light | Dark |
|----------|-------|------|
| Background | `#FFFFFF` | `#1F2937` |
| Border | 1px `#E5E7EB` | 1px `#374151` |
| Shadow | `0 2px 8px rgba(0,0,0,0.08)` | `0 2px 8px rgba(0,0,0,0.3)` |
| Hover shadow | `0 8px 24px rgba(0,0,0,0.12)` | `0 8px 24px rgba(0,0,0,0.4)` |

### 4.3 Forms

| Element | Light | Dark |
|---------|-------|------|
| Input bg | `#FFFFFF` | `#111827` |
| Input border | `#D1D5DB` | `#4B5563` |
| Input text | `#1A1A2E` | `#F9FAFB` |
| Placeholder | `#9CA3AF` | `#6B7280` |
| Focus ring | `#00A3E0` | `#00A3E0` |
| Error border | `#EF4444` | `#EF4444` |

### 4.4 Navigation

| Element | Light | Dark |
|---------|-------|------|
| Header bg | `#FFFFFF` | `#0A0E1A` |
| Header border | `#E5E7EB` | `#1F2937` |
| Nav text | `#1A1A2E` | `#F9FAFB` |
| Nav hover | `#F6F9FC` | `#1F2937` |
| Dropdown bg | `#FFFFFF` | `#1F2937` |
| Dropdown border | `#E5E7EB` | `#374151` |

## 5. Image Handling

### 5.1 Image Adaptations

| Image Type | Light Mode | Dark Mode |
|------------|------------|-----------|
| Product photos | Original | Slight brightness +10% |
| Lifestyle | Original | Subtle dark overlay |
| Icons (SVG) | CurrentColor | CurrentColor (adapts) |
| Illustrations | Full color | Reduced saturation option |
| Logos | Original | White variant |

### 5.2 CSS Filters

```css
.dark-mode img:not([data-no-adapt]) {
  filter: brightness(0.95) contrast(1.05);
}

.dark-mode .product-image {
  filter: brightness(1.1);
}
```

## 6. Code Implementation

### 6.1 Tailwind Dark Mode

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class", // Manual toggle via class
  theme: {
    extend: {
      colors: {
        "dm-bg": "#0A0E1A",
        "dm-surface": "#1F2937",
        "dm-text": "#F9FAFB",
      },
    },
  },
};
```

### 6.2 CSS Custom Properties

```css
:root {
  --color-bg: #FFFFFF;
  --color-text: #1A1A2E;
  --color-surface: #F6F9FC;
}

[data-theme="dark"] {
  --color-bg: #0A0E1A;
  --color-text: #F9FAFB;
  --color-surface: #1F2937;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

### 6.3 Theme Toggle Component

```jsx
function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
```

## 7. Accessibility in Dark Mode

### 7.1 Contrast Requirements

All dark mode color combinations must meet WCAG AA:

| Combination | Ratio | Pass |
|-------------|-------|------|
| `#F9FAFB` on `#0A0E1A` | 18.5:1 | Yes |
| `#9CA3AF` on `#0A0E1A` | 7.2:1 | Yes |
| `#00A3E0` on `#0A0E1A` | 5.8:1 | Yes |
| `#6B7280` on `#1F2937` | 4.8:1 | Yes |

### 7.2 Focus Indicators

Focus indicators remain `#00A3E0` in both modes for consistency.

### 7.3 Reduced Motion

`prefers-reduced-motion` respected regardless of color scheme.

## 8. Testing Requirements

| Test | Method | Frequency |
|------|--------|-----------|
| Contrast check | axe DevTools | Per build |
| Visual regression | Chromatic | Per PR |
| System preference | Manual toggle | Per feature |
| Persistence | localStorage check | Per session |
| Gaming mode | Always-dark verification | Per release |

## 9. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-04-15 | Initial dark mode palette |
| 0.5 | 2026-04-25 | Added gaming mode specs |
| 1.0 | 2026-05-01 | Final specification |
