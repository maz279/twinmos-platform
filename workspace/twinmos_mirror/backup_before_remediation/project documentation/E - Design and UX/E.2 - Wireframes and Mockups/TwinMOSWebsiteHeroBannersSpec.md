# TwinMOS Website - Hero Banners Specification

Document ID: E.2.5 | Version: 1.0 | Date: 30 April 2026 | Status: FINAL

## 1. Overview

This document specifies the visual design, content, and behavior for all hero banner slides on the TwinMOS homepage and key landing pages.

## 2. Homepage Hero Carousel

### 2.1 Carousel Configuration

| Property | Value |
|----------|-------|
| Max slides | 3 |
| Auto-advance | 6 seconds |
| Transition | Slide horizontal + fade, 500ms |
| Pause on | Hover, focus, touch |
| Manual controls | Dot indicators + arrow buttons |
| Loop | Infinite |

### 2.2 Slide 1: VOLTX DDR5 RGB

| Element | Specification |
|---------|-------------|
| Headline | Unleash the Power of RGB |
| Subheadline | VOLTX DDR5 memory with customizable lighting for gamers and creators |
| CTA primary | Explore VOLTX |
| CTA secondary | View Specs |
| Background | Dark gradient (#0D0D0D to #1A1A1A) |
| Product image | VOLTX RGB module with rainbow lighting, right-aligned |
| Treatment | Gaming mode, RGB glow effect |

### 2.3 Slide 2: CoreX Pro SSD

| Element | Specification |
|---------|-------------|
| Headline | Speed That Keeps Up |
| Subheadline | CoreX Pro PCIe Gen 5 SSDs for professionals who demand performance |
| CTA primary | Explore SSDs |
| CTA secondary | Compare Models |
| Background | Light gradient (#FFFFFF to #F6F9FC) |
| Product image | CoreX Pro SSD, angled, left-aligned |
| Treatment | Corporate mode, clean studio shot |

### 2.4 Slide 3: Distributor / Enterprise

| Element | Specification |
|---------|-------------|
| Headline | Your Trusted Memory Partner |
| Subheadline | TwinMOS: 25+ years of quality memory and storage solutions in 93+ countries |
| CTA primary | Become a Distributor |
| CTA secondary | About TwinMOS |
| Background | #0A2540 with subtle tech pattern |
| Product image | Product lineup (DRAM + SSD + Portable), center-aligned |
| Treatment | Corporate mode, professional |

## 3. Gaming Hub Hero

| Element | Specification |
|---------|-------------|
| Headline | VOLTX |
| Subheadline | UNLEASH THE POWER |
| Body text | Premium gaming memory engineered for extreme performance and stunning RGB |
| CTA | Explore VOLTX Products |
| Background | #0D0D0D with animated RGB gradient |
| Media | Product video or high-quality animation |
| RGB glow | Pulsing box-shadow, 4s cycle, subtle |

## 4. Regional Landing Page Heroes

### 4.1 Default Regional Hero

| Element | Specification |
|---------|-------------|
| Headline | TwinMOS in [Country] |
| Subheadline | Find local retailers and explore products available in your region |
| CTA | Find Retailers |
| Background | Country-specific imagery or map |
| Treatment | Corporate mode |

## 5. Hero Banner Technical Specs

| Property | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Height | 600px | 500px | 400px |
| Padding | 96px | 64px | 48px |
| Headline size | 48px | 40px | 32px |
| Subheadline size | 20px | 18px | 16px |
| CTA size | Large | Medium | Medium |
| Image max-width | 50% | 45% | 80% (below text) |

## 6. Hero Image Requirements

| Property | Specification |
|----------|-------------|
| Format | WebP |
| Resolution | 2400x1600px (source) |
| Max file size | 200KB (WebP) |
| Aspect ratio | 3:2 |
| Background | Transparent or matching slide bg |
| Product accuracy | Must match actual SKU |

## 7. Accessibility

- Pause auto-advance when user hovers or focuses
- Manual controls always visible and accessible
- Dot indicators have aria-labels
- Arrow buttons have aria-labels (Previous slide, Next slide)
- Reduced motion: disable auto-advance, instant transitions

---

Document Owner: UX Lead | Review: Per sprint
