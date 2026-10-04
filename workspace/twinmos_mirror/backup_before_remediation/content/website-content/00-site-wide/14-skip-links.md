---
title: "Skip Links"
slug: "skip-links"
url: "/components/skip-links"
template: "component"
description: "WCAG 2.1 compliant skip navigation links enabling keyboard users to bypass repetitive content blocks and navigate efficiently to main content, primary navigation, search, and footer."
keywords: ["accessibility", "skip links", "a11y", "keyboard navigation", "WCAG 2.1", "bypass blocks", "screen reader"]
persona: ["visitor"]
phase: P1
priority: P0
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: []
cross_links: []
sources: ["BRD", "URD"]
---

# Skip Links

## Overview
Skip links are essential accessibility features that allow keyboard users and screen reader users to bypass repetitive navigation elements and jump directly to the main content or other key page regions. They are the first interactive elements in the DOM and are critical for WCAG 2.1 Level A compliance.

**WCAG Reference**: Success Criterion 2.4.1 — Bypass Blocks (Level A)  
**Impact**: Enables efficient navigation for users who cannot or prefer not to use a mouse.

---

## Skip Link Targets

### Primary Skip Link (Required on ALL Pages)
**Link Text**: "Skip to main content"  
**Target**: `#main-content`  
**Purpose**: Bypasses header, navigation, and hero to reach the primary page content  
**Position**: First focusable element in `<body>`

### Secondary Skip Links (Recommended)

#### Skip to Primary Navigation
**Link Text**: "Skip to main navigation"  
**Target**: `#primary-navigation`  
**Purpose**: For users who want to navigate directly to the menu  
**Pages**: All pages with complex navigation

#### Skip to Site Search
**Link Text**: "Skip to search"  
**Target**: `#site-search`  
**Purpose**: For users who want to search immediately  
**Pages**: All pages with search functionality

#### Skip to Footer
**Link Text**: "Skip to footer"  
**Target**: `#footer`  
**Purpose**: For users who want to access footer links, contact info, or legal pages  
**Pages**: All pages

---

## Visual Design

### Default State (Unfocused)
- **Visibility**: Visually hidden but accessible to assistive technologies
- **Position**: Absolute, off-screen (`top: -40px`)
- **Size**: Zero or minimal dimensions
- **ARIA**: Not hidden (`aria-hidden="false"` by default)

### Focused State
- **Visibility**: Fully visible, positioned at top-left of viewport
- **Position**: `top: 0; left: 0;`
- **Background**: High-contrast yellow (#FFEB3B) or brand accent color
- **Text Color**: Black (#000000) for maximum contrast
- **Padding**: 12px 20px
- **Font Size**: 16px
- **Font Weight**: Bold
- **Z-Index**: 99999 (above all other content)
- **Border**: 2px solid black
- **Box Shadow**: 0 4px 12px rgba(0,0,0,0.3)

### Focused State CSS
```css
.skip-link {
  position: absolute;
  top: -60px;
  left: 0;
  background: #ffeb3b;
  color: #000;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  border: 2px solid #000;
  border-radius: 0 0 4px 0;
  z-index: 99999;
  transition: top 0.25s ease-in-out;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid #0056D2;
  outline-offset: 2px;
}
```

---

## HTML Structure

### Container
```html
<div class="skip-links">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <a href="#primary-navigation" class="skip-link">Skip to main navigation</a>
  <a href="#site-search" class="skip-link">Skip to search</a>
  <a href="#footer" class="skip-link">Skip to footer</a>
</div>
```

### Target Elements
```html
<nav id="primary-navigation" aria-label="Main navigation">
  <!-- Navigation content -->
</nav>

<div id="site-search" role="search" aria-label="Site search">
  <!-- Search form -->
</div>

<main id="main-content" tabindex="-1">
  <!-- Main page content -->
</main>

<footer id="footer">
  <!-- Footer content -->
</footer>
```

---

## Target Element Requirements

### tabindex="-1"
All skip link targets MUST have `tabindex="-1"` to ensure they can receive programmatic focus:

```html
<main id="main-content" tabindex="-1">
```

**Why**: Without `tabindex="-1"`, the focus will jump to the element but the browser won't actually focus it, causing the next Tab press to return to the top of the page.

### Focus Management
When a skip link is activated:
1. Visual focus moves to the target element
2. Screen reader focus moves to the target element
3. The target element should NOT have a visible focus ring (it's not interactive)
4. Subsequent Tab presses move to the next interactive element within the target

### CSS for Target Elements
```css
#main-content:focus,
#primary-navigation:focus,
#site-search:focus,
#footer:focus {
  outline: none; /* Remove visible focus ring from non-interactive targets */
}
```

---

## Multiple Skip Links Strategy

### When to Use Multiple Skip Links
Use multiple skip links when a page has:
- Complex multi-level navigation
- Large hero sections with multiple CTAs
- Extensive sidebar content
- Search functionality prominently placed

### Stacking Multiple Links
When multiple skip links are present, they stack vertically:

```
┌─────────────────────────────┐
│ Skip to main content        │ ← First Tab stop
│ Skip to main navigation     │ ← Second Tab stop
│ Skip to search              │ ← Third Tab stop
│ Skip to footer              │ ← Fourth Tab stop
├─────────────────────────────┤
│      [Header/Logo]          │
│      [Navigation]           │
│      [Hero Section]         │
│      [Main Content]         │
│      [Footer]               │
└─────────────────────────────┘
```

### Reducing Clutter
On pages with simple layouts, consider showing only the primary "Skip to main content" link. Additional skip links can be revealed via a "More skip options" expander.

---

## Page-Specific Configurations

### Homepage
- Skip to main content
- Skip to search
- Skip to footer

### Product Detail Pages
- Skip to main content
- Skip to product specifications
- Skip to Where to Buy CTA
- Skip to footer

### Support Article Pages
- Skip to main content
- Skip to table of contents
- Skip to footer

### Form Pages (Contact, Warranty Registration)
- Skip to main content
- Skip to form
- Skip to footer

---

## Screen Reader Behavior

### Announcement
When a skip link receives focus, screen readers announce:
- "Skip to main content, link"
- "Skip to main navigation, link"

### After Activation
When activated, screen readers announce:
- "Main content, region" (if `<main>` has `role="main"` or is `<main>`)
- "Main navigation, navigation" (if `<nav>` has `aria-label`)

### Testing with NVDA
1. Press Tab — focus moves to first skip link
2. Hear: "Skip to main content, link"
3. Press Enter — focus moves to main content
4. Press Tab — focus moves to first interactive element in main content

### Testing with JAWS
1. Press Tab — focus moves to first skip link
2. Hear: "Skip to main content, link"
3. Press Enter — JAWS announces the region name
4. Press Tab — continues from main content

### Testing with VoiceOver (macOS/iOS)
1. VO+Right Arrow — navigate to skip link
2. Hear: "Skip to main content, link"
3. VO+Space — activate link
4. VO+Right Arrow — continues from main content

---

## Keyboard Navigation

### Tab Order
1. Skip links (first in DOM)
2. Header logo (if linked)
3. Navigation items
4. Search trigger
5. Utility navigation (language, account)
6. Hero CTA buttons
7. Main content interactive elements
8. Footer links

### Keyboard Shortcuts (Optional Enhancement)
- **Alt + 1**: Skip to main content
- **Alt + 2**: Skip to navigation
- **Alt + 3**: Skip to search
- **Alt + 4**: Skip to footer

**Note**: These shortcuts follow the UK Government Digital Service standard and should be documented in accessibility help.

---

## WCAG Compliance

### Success Criterion 2.4.1 — Bypass Blocks (Level A)
> "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages."

**Compliance**: Skip links provide a mechanism to bypass the header and navigation.

### Success Criterion 2.4.3 — Focus Order (Level A)
> "If a Web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability."

**Compliance**: Skip links are first in focus order, preserving logical navigation.

### Success Criterion 2.4.7 — Focus Visible (Level AA)
> "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible."

**Compliance**: Skip links are highly visible when focused.

---

## Testing Checklist

### Automated Tests
- [ ] Skip link is first focusable element on page
- [ ] Skip link target has `tabindex="-1"`
- [ ] Skip link is not hidden from assistive technology
- [ ] Focus moves correctly to target element

### Manual Tests
- [ ] Press Tab on page load — skip link appears
- [ ] Press Enter on skip link — focus moves to main content
- [ ] Press Tab again — focus moves to next element in main content (not back to top)
- [ ] Test with screen reader — correct announcements
- [ ] Test on mobile — skip link visible and functional
- [ ] Test with high contrast mode — skip link visible

### Browser Testing
- [ ] Chrome / Edge
- [ ] Firefox
- [ ] Safari
- [ ] Chrome on Android
- [ ] Safari on iOS

---

## Common Mistakes to Avoid

1. **Missing `tabindex="-1"`** — Target element cannot receive focus
2. **Hiding from screen readers** — `display: none` or `visibility: hidden` makes skip links unusable
3. **Wrong focus order** — Skip links not first in DOM/Tab order
4. **No visual indication on focus** — Users can't see where focus is
5. **Linking to wrong target** — `#main-content` doesn't exist or is misspelled
6. **Multiple identical targets** — Multiple elements with same ID
7. **Focus ring on non-interactive targets** — Creates confusion about element interactivity

---

## Related Components
- [Breadcrumb Navigation](/components/breadcrumb) — Secondary wayfinding
- [Header Navigation](/components/header-navigation) — Primary navigation target
- [Search Bar](/components/search-bar) — Search target
- [Footer](/components/footer) — Footer target
