---
title: "Site Search Component"
slug: "search-bar"
url: "/components/search-bar"
template: "component"
description: "Intelligent site search with autocomplete, category filtering, popular queries, recent searches, and results preview for products, support articles, news, and company information."
keywords: ["search", "find", "query", "search bar", "autocomplete", "product search", "site search", "TwinMOS"]
persona: ["visitor", "buyer", "distributor", "press"]
phase: P1
priority: P1
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: []
cross_links: ["/products", "/support", "/news", "/about"]
sources: ["BRD", "URD"]
---

# Site Search Component

## Overview
The site search provides fast, relevant access to all TwinMOS content including products, support articles, news, and company pages. It features real-time autocomplete, category-filtered results, and intelligent query suggestions to minimize user effort and maximize discovery.

**Search Technology**: Elasticsearch or Algolia (vendor TBD per RFP §6.3)

---

## Component Placement

### Header Integration
- **Position**: Top-right of utility navigation, adjacent to language selector
- **Default State**: Collapsed icon (magnifying glass) on desktop; expands on click/focus
- **Expanded State**: 400px wide search input with dropdown overlay
- **Mobile**: Full-screen overlay on tap

### Search Results Page
- **URL**: `/search?q={query}`
- **Layout**: Filter sidebar + results grid
- **Pagination**: 20 results per page

---

## Search Input

### Placeholder Text
"Search products, support, and more…"

### Active State Label
"Search TwinMOS"

### Input Behavior
- **Autocomplete Delay**: 150ms after typing stops
- **Minimum Query Length**: 2 characters
- **Maximum Query Length**: 100 characters
- **Debounce**: 300ms for API calls
- **Case Handling**: Case-insensitive search

### Keyboard Shortcut
- **Trigger**: Press `/` (forward slash) from anywhere on the site
- **Focus**: Immediately focuses search input
- **Scope**: Global — works on any page except when typing in form fields
- **Hint Display**: "Press `/` to search" (fades after 3 visits)

---

## Autocomplete Dropdown

### Trigger
Appears after typing 2+ characters with a 150ms debounce.

### Sections (in order)

#### 1. Suggested Queries
- **Heading**: "Suggestions"
- **Content**: Auto-completed search phrases based on query prefix
- **Max Items**: 5
- **Example**: Typing "ddr" suggests "DDR5 memory", "DDR4 3200MHz", "DDR3 legacy"

#### 2. Product Matches
- **Heading**: "Products"
- **Content**: Product name + category tag + thumbnail
- **Max Items**: 4
- **Fields Searched**: Product name, model number, SKU, specifications
- **Example**: "VOLTX DDR5 RGB 6000MHz"

#### 3. Support Article Matches
- **Heading**: "Support"
- **Content**: Article title + category + excerpt with query highlighted
- **Max Items**: 3
- **Fields Searched**: Title, content, tags
- **Example**: "How to Enable XMP in BIOS"

#### 4. News Matches
- **Heading**: "News"
- **Content**: Article title + date + excerpt
- **Max Items**: 2
- **Fields Searched**: Title, content, tags

#### 5. Quick Links
- **Heading**: "Quick Links"
- **Content**: Direct navigation to popular pages matching the query
- **Max Items**: 3
- **Example**: Query "warranty" → "Warranty Registration", "Warranty Policy", "RMA Process"

### Dropdown Footer
- **Text**: "Press Enter to see all results for \"{query}\""
- **Link**: "View all results →"

---

## Popular Searches

### Display Condition
Shown when search input is focused but empty (before typing).

### Heading
"Popular Searches"

### Query List (Ranked by Search Volume)
1. **VOLTX DDR5** — Flagship gaming memory
2. **CoreX Pro Gen5** — PCIe Gen 5.0 NVMe SSD
3. **Warranty Registration** — Register your product
4. **Where to Buy** — Find authorized distributors
5. **DDR4 3200MHz** — Popular desktop memory speed
6. **NVMe SSD** — Internal solid-state drives
7. **ELITE Drive Pro** — Portable SSD
8. **USB Hub** — 4-port USB accessories
9. **Distributor Inquiry** — Become a partner
10. **Technical Support** — Get help with your product

### Update Frequency
Review and refresh quarterly based on analytics data.

---

## Recent Searches

### Display Condition
Shown when user has previous searches stored (localStorage).

### Heading
"Your Recent Searches"

### Behavior
- Stores last 10 unique searches
- Persists for 30 days
- Clicking a recent search executes the query immediately
- Each item has an individual "Remove" (X) button
- "Clear All" link removes all recent searches

### Privacy Note
Recent searches are stored locally in the browser and are not transmitted to TwinMOS servers.

---

## Search Categories (Filter Tabs)

Available on the full search results page (`/search`):

| Category | Label | Description |
|----------|-------|-------------|
| All Results | All | Products, support, news, and pages combined |
| Products | Products | DRAM, SSD, portable storage, USB, accessories |
| Support | Support | KB articles, installation guides, FAQs, troubleshooting |
| News | News | Press releases, product launches, events, partnerships |
| About | About | Company pages, careers, contact, legal |

### Category Badges
Each result displays a category badge:
- **Product**: Blue badge with product icon
- **Support**: Green badge with help icon
- **News**: Orange badge with newspaper icon
- **About**: Gray badge with info icon

---

## Empty State (Before Typing)

### Message
"Start typing to find products, support articles, and company information."

### Sub-message
"Try searching for product names, part numbers, or topics like 'DDR5', 'NVMe', or 'warranty'."

---

## No Results State

### Headline
"No results found for \"{query}\""

### Body
"We couldn't find anything matching your search. Try these tips:"

### Suggestions
- Check your spelling (e.g., "VOLTX" not "VOLTEX")
- Try using broader keywords (e.g., "DDR5" instead of "DDR5-6000CL36")
- Use product category names (e.g., "NVMe SSD", "portable drive")
- Browse our [product catalog](/products) or [support center](/support)

### Alternative Actions
- **Browse Products** → `/products`
- **Visit Support** → `/support`
- **Contact Us** → `/contact`
- **Try Popular Searches**: [VOLTX DDR5] [CoreX Pro] [Warranty]

---

## Search Results Page Template

### Page Title
"Search Results for \"{query}\" — TwinMOS"

### Results Count
"{count} results found for \"{query}\""

### Sort Options
- **Relevance** (default)
- **Newest First** (for news and support)
- **Oldest First**
- **Alphabetical (A–Z)**

### Product Result Card
- Product image (thumbnail)
- Product name
- Category tag (e.g., "DDR5 Memory", "NVMe SSD")
- Short description (2 lines)
- Key specs (speed, capacity)
- "View Product" link
- "Add to Compare" button (if applicable)

### Support Result Card
- Article title
- Category (e.g., "Warranty", "Installation", "Troubleshooting")
- Excerpt with query terms highlighted
- Reading time estimate
- "Read Article" link
- Last updated date

### News Result Card
- Article title
- Publication date
- Category (e.g., "Product Launch", "Event", "Partnership")
- Excerpt with query terms highlighted
- "Read More" link
- Featured image thumbnail (if available)

### About Result Card
- Page title
- Page type (e.g., "Company", "Careers", "Legal")
- Brief description
- "Learn More" link

---

## Pagination

### Labels
- **Previous**: "← Previous"
- **Next**: "Next →"
- **Page Info**: "Page {current} of {total}"

### Behavior
- Show 20 results per page
- Show up to 5 page numbers in pagination bar
- Ellipsis (…) for gaps in page range
- First/Last page quick links on large result sets

---

## Loading State

### Message
"Searching TwinMOS…"

### Visual
- Spinner animation in search input
- Skeleton loaders for result cards (if >500ms load time)

---

## Accessibility

### ARIA Labels
- Search input: "Search products, support, and more"
- Search button: "Submit search"
- Clear button: "Clear search"
- Autocomplete list: "Search suggestions"
- Recent searches: "Your recent searches"
- Popular searches: "Popular searches"

### Keyboard Navigation
- `Tab`: Navigate between search input, suggestions, and filters
- `↑` / `↓`: Navigate autocomplete suggestions
- `Enter`: Select highlighted suggestion or submit search
- `Escape`: Close dropdown, clear input
- `/`: Focus search from anywhere (when not in a form field)

### Screen Reader Announcements
- "{n} suggestions available" when dropdown appears
- "No results found" when search returns empty
- "{n} results found" when results page loads

---

## Search Index Configuration

### Products Index
Fields weighted by relevance:
- Product name: 10x
- Model number/SKU: 8x
- Category: 5x
- Specifications: 3x
- Description: 2x

### Support Index
- Article title: 10x
- Tags: 8x
- Content headings: 5x
- Body content: 2x

### News Index
- Headline: 10x
- Tags: 8x
- Summary: 5x
- Body: 2x

### Synonyms Configured
- "RAM" → "DRAM", "memory"
- "hard drive" → "SSD", "solid state drive"
- "pendrive" → "USB flash drive", "Mobile Disk"
- "graphics card" → "GPU" (for compatibility finder context)

---

## Analytics Tracking

Track these search events (respecting cookie consent):
- Search initiated (query text, category filter)
- Autocomplete suggestion clicked
- Popular search clicked
- Recent search clicked
- Search results page viewed (query, result count, time to results)
- Result clicked (position, type, query)
- No-results query (for content gap analysis)
- Filter applied on results page
