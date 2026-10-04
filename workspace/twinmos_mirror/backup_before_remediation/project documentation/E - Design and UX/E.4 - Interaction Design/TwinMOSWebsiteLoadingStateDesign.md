# TwinMOS Website — Loading State Design

**Document ID:** E.4.6
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose

Defines loading state designs for async operations.

## 2. Types

| Type | Context |
|------|---------|
| Page load | Initial render |
| Component | Data fetch |
| Skeleton | Content placeholder |
| Action | Button submit |

## 3. Skeleton Screens

- Background: `#E5E7EB`
- Shimmer animation: 1.5s infinite
- Match final layout dimensions

## 4. Spinners

- Inline: 16px, `#00A3E0`
- Page: 48px, `#00A3E0`
- Speed: 800ms rotation

## 5. Best Practices

- Show skeleton immediately
- Maintain layout (no shifts)
- Timeout after 10s → error state

## 6. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-01 | Final specification |
