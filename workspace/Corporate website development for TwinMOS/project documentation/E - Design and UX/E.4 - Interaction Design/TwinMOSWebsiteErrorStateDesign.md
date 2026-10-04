# TwinMOS Website — Error State Design

**Document ID:** E.4.4
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose

Defines visual and interaction design for all error states.

## 2. Error Severity Levels

| Level | Color | Usage |
|-------|-------|-------|
| Critical | `#DC2626` | System failure |
| Error | `#EF4444` | User-correctable |
| Warning | `#F59E0B` | Attention needed |
| Info | `#3B82F6` | Contextual notice |

## 3. HTTP Error Pages

### 3.1 404 Not Found

- Headline: "Page Not Found"
- Message: "Sorry, the page you are looking for does not exist."
- Search bar + popular links
- CTA: "Go to Homepage"

### 3.2 500 Server Error

- Headline: "Something Went Wrong"
- Error ID for support reference
- Actions: Refresh, Contact Support

## 4. Form Errors

- Inline: Red border + icon + message
- Form-level: Summary at top
- Auto-scroll to first error

## 5. Messaging Guidelines

- Apologetic but not overly so
- Helpful and specific
- No technical jargon
- Clear next action

## 6. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-01 | Final specification |
