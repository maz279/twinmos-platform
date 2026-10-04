# TwinMOS Website — Form Design Guidelines

**Document ID:** E.4.3
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document defines design guidelines for all forms across the TwinMOS website, including layout, validation, error handling, and accessibility.

**Cross-references:**
- E.4.2 Interaction Patterns (Input patterns)
- E.3.3 Accessibility Design Specification
- E.3.2 Mobile-First Design Guide

## 2. Form Types

| Form | Location | Fields | Complexity |
|------|----------|--------|------------|
| Newsletter | Footer | 1 (email) | Low |
| Contact | Contact page | 5-7 | Medium |
| Support Ticket | Support center | 6-8 | Medium |
| Distributor App | Partners page | 12-15 | High |
| Compatibility | Support center | 3-4 | Low |
| Product Review | Product page | 4-5 | Low |
| Search | Header | 1 (query) | Low |

## 3. Form Layout

### 3.1 Single Column (Default)

```
┌─────────────────────────┐
│ Form Title              │
│ Description text        │
│                         │
│ Label                   │
│ [Input field        ]   │
│ Helper text             │
│                         │
│ Label *                 │
│ [Input field        ]   │
│ Error message           │
│                         │
│ [Submit Button]         │
└─────────────────────────┘
```

### 3.2 Two Column (Desktop Only)

Used for complex forms with related fields:

```
┌─────────────────────────────────┐
│ Label           │ Label         │
│ [First Name ]   │ [Last Name ]  │
│                 │               │
│ Label           │ Label         │
│ [Email      ]   │ [Phone      ]  │
└─────────────────────────────────┘
```

Rules:
- Only on 1024px+ viewports
- Related fields paired (name, address)
- Full-width for single fields

### 3.3 Multi-Step Forms

Used for distributor applications:

```
┌─────────────────────────┐
│ Step 1 of 4: Company    │
│ [Progress bar]          │
│                         │
│ Company Name *          │
│ [                  ]    │
│                         │
│ Country *               │
│ [Dropdown          ]    │
│                         │
│ [Previous] [Next]       │
└─────────────────────────┘
```

Step indicators:
- Progress bar or stepper
- Step labels visible
- Previous/Next navigation
- Review step before submit

## 4. Field Specifications

### 4.1 Label

| Property | Value |
|----------|-------|
| Font | Inter 14px Medium |
| Color | `#374151` |
| Position | Above input |
| Required | Asterisk (*) in `#EF4444` |
| Optional | "(Optional)" in `#6B7280` |

### 4.2 Input

| Property | Value |
|----------|-------|
| Height | 48px (mobile), 40px (desktop) |
| Padding | 12px 16px |
| Border | 1px `#D1D5DB`, radius 6px |
| Font | Inter 16px Regular |
| Placeholder | `#9CA3AF`, 16px |

### 4.3 Helper Text

| Property | Value |
|----------|-------|
| Font | Inter 13px Regular |
| Color | `#6B7280` |
| Position | Below input |
| Content | Format hints, examples |

### 4.4 Error Message

| Property | Value |
|----------|-------|
| Font | Inter 13px Regular |
| Color | `#EF4444` |
| Icon | Alert circle, 16px |
| Position | Below input |
| Animation | Fade in (150ms) |

## 5. Validation Rules

### 5.1 Real-Time Validation

Validate on blur for:
- Email format
- Phone number format
- Required fields
- Min/max length

### 5.2 Submit Validation

Validate all fields on submit:
- Show all errors simultaneously
- Scroll to first error
- Focus first invalid field

### 5.3 Validation Patterns

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Valid format | "Please enter a valid email address" |
| Phone | Min 8 digits | "Phone number must be at least 8 digits" |
| Required | Not empty | "This field is required" |
| Min length | >= specified | "Must be at least {n} characters" |
| Max length | <= specified | "Must be at most {n} characters" |
| URL | Valid format | "Please enter a valid URL" |
| File | Type/size | "File must be {type}, max {size}MB" |

## 6. Button States

| State | Style |
|-------|-------|
| Default | `#00A3E0` bg, white text |
| Hover | `#0077A8` bg |
| Active | `#005A7D` bg |
| Loading | Spinner + "Submitting..." |
| Success | `#10B981` bg + checkmark |
| Disabled | `#E5E7EB` bg, `#9CA3AF` text |

## 7. Accessibility

- All fields have associated labels
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required`
- Invalid fields marked with `aria-invalid`
- Fieldset/legend for grouped fields
- Focus management on validation

## 8. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-04-15 | Initial form guidelines |
| 1.0 | 2026-05-01 | Final specification |
