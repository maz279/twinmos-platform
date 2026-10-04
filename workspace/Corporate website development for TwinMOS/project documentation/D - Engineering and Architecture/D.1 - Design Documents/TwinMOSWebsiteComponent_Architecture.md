# TwinMOS Corporate Website — Component Architecture

**Document Reference:** TWN-COMP-ARCH-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** LLD v1.0, URD v3.0, Tech Stack v1.1

---

## Table of Contents

1. [Component Architecture Overview](#1-component-architecture-overview)
2. [Astro Layout Hierarchy](#2-astro-layout-hierarchy)
3. [React Islands Inventory](#3-react-islands-inventory)
4. [Component Composition Patterns](#4-component-composition-patterns)
5. [Design Token Integration](#5-design-token-integration)
6. [Shared Component Library](#6-shared-component-library)
7. [Page Template to Content Mapping](#7-page-template-to-content-mapping)
8. [Component Lifecycle and State Management](#8-component-lifecycle-and-state-management)

---

## 1. Component Architecture Overview

The TwinMOS website uses a **hybrid rendering architecture** where:

- **Astro components** handle the static shell (HTML, CSS, minimal JS)
- **React islands** provide interactivity where needed
- **Server Islands** (Astro 5) handle personalized content

This approach delivers Lighthouse 95+ scores by default while maintaining rich interactivity.

### 1.1 Rendering Strategy Matrix

| Component Type | Technology | Render Mode | Hydration | Use Case |
|---------------|-----------|-------------|-----------|----------|
| Page shell | Astro | SSG | None | Layout, meta, static content |
| Navigation | React | SSG + client:idle | On idle | Header, footer, mobile menu |
| Search | React | SSG + client:visible | On visible | Search bar, filters |
| Forms | React | SSG + client:visible | On visible | Contact, warranty, RMA |
| Maps | React | SSG + client:visible | On visible | Where-to-buy locator |
| Cart | React | server:defer | Server | Cart badge (P3) |
| Analytics | Astro | SSG | None | Plausible script, consent banner |
| Content | Astro | SSG | None | Articles, product descriptions |

---

## 2. Astro Layout Hierarchy

### 2.1 Base Layout

```astro
---
// src/layouts/LayoutBase.astro
import { SEO } from 'astro-seo';
import Header from '../components/shared/Header.astro';
import Footer from '../components/shared/Footer.astro';
import CookieBanner from '../islands/CookieBanner.tsx';
import { getLangFromUrl } from '../lib/i18n';

interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}

const { title, description, image, type = 'website', noindex = false } = Astro.props;
const lang = getLangFromUrl(Astro.url);
const dir = lang === 'ar' ? 'rtl' : 'ltr';
---

<!DOCTYPE html>
<html lang={lang} dir={dir} class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <SEO 
    title={title}
    titleTemplate="%s | TwinMOS"
    description={description}
    openGraph={{ basic: { title, type, image } }}
    twitter={{ card: 'summary_large_image' }}
    noindex={noindex}
  />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <script defer data-domain="twinmos.com" src="https://analytics.twinmos.com/js/script.js"></script>
</head>
<body class="min-h-screen bg-white text-gray-900 antialiased">
  <Header />
  <main id="main-content" class="flex-1">
    <slot />
  </main>
  <Footer />
  <CookieBanner client:load />
</body>
</html>
```

### 2.2 Hero Layout

```astro
---
// src/layouts/LayoutHero.astro
import LayoutBase from './LayoutBase.astro';
import Breadcrumb from '../components/shared/Breadcrumb.astro';

interface Props {
  title: string;
  description?: string;
  heroImage?: string;
  heroVideo?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  showBreadcrumb?: boolean;
}

const { title, description, heroImage, heroVideo, heroTitle, heroSubtitle, showBreadcrumb = true } = Astro.props;
---

<LayoutBase title={title} description={description}>
  {showBreadcrumb && <Breadcrumb />}
  
  <section class="relative overflow-hidden">
    {heroVideo ? (
      <video autoplay muted loop playsinline class="absolute inset-0 h-full w-full object-cover">
        <source src={heroVideo} type="video/mp4" />
      </video>
    ) : heroImage ? (
      <img src={heroImage} alt="" class="absolute inset-0 h-full w-full object-cover" loading="eager" />
    ) : null}
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
    
    <div class="relative container mx-auto px-4 py-24 md:py-32">
      <h1 class="text-4xl md:text-6xl font-bold text-white">{heroTitle || title}</h1>
      {heroSubtitle && <p class="mt-4 text-xl text-white/90 max-w-2xl">{heroSubtitle}</p>}
    </div>
  </section>
  
  <div class="container mx-auto px-4 py-12">
    <slot />
  </div>
</LayoutBase>
```

### 2.3 Content Layout

```astro
---
// src/layouts/LayoutContent.astro
import LayoutBase from './LayoutBase.astro';
import TableOfContents from '../components/shared/TableOfContents.astro';

interface Props {
  title: string;
  description?: string;
  publishDate?: Date;
  author?: string;
  tags?: string[];
  showToc?: boolean;
}

const { title, description, publishDate, author, tags, showToc = true } = Astro.props;
---

<LayoutBase title={title} description={description} type="article">
  <article class="container mx-auto px-4 py-12">
    <header class="max-w-3xl mx-auto text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900">{title}</h1>
      {description && <p class="mt-4 text-xl text-gray-600">{description}</p>}
      {(publishDate || author) && (
        <div class="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
          {author && <span>By {author}</span>}
          {publishDate && <time datetime={publishDate.toISOString()}>{publishDate.toLocaleDateString()}</time>}
        </div>
      )}
    </header>
    
    <div class="flex gap-12">
      {showToc && (
        <aside class="hidden lg:block w-64 shrink-0">
          <TableOfContents />
        </aside>
      )}
      <div class="prose prose-lg max-w-none flex-1">
        <slot />
      </div>
    </div>
    
    {tags && tags.length > 0 && (
      <footer class="max-w-3xl mx-auto mt-12 pt-8 border-t">
        <div class="flex flex-wrap gap-2">
          {tags.map(tag => <span class="px-3 py-1 bg-gray-100 rounded-full text-sm">{tag}</span>)}
        </div>
      </footer>
    )}
  </article>
</LayoutBase>
```

### 2.4 Product Detail Layout

```astro
---
// src/layouts/LayoutProductDetail.astro
import LayoutBase from './LayoutBase.astro';
import ProductGallery from '../components/organisms/ProductGallery.astro';
import ProductSpecs from '../components/organisms/ProductSpecs.astro';
import ProductTabs from '../islands/ProductTabs.tsx';
import RelatedProducts from '../components/organisms/RelatedProducts.astro';
import WhereToBuyCTA from '../components/molecules/WhereToBuyCTA.astro';

interface Props {
  product: Product;
}

const { product } = Astro.props;
---

<LayoutBase 
  title={product.name} 
  description={product.metaDescription || product.shortDescription}
  image={product.ogImage?.url}
  type="product"
>
  <div class="container mx-auto px-4 py-8">
    <!-- Product Hero -->
    <div class="grid lg:grid-cols-2 gap-12 mb-16">
      <ProductGallery images={product.images} productName={product.name} />
      <div>
        <h1 class="text-3xl md:text-4xl font-bold">{product.name}</h1>
        <p class="mt-2 text-lg text-gray-600">{product.shortDescription}</p>
        <div class="mt-6 flex gap-4">
          <a href="#where-to-buy" class="btn-primary">Where to Buy</a>
          <button class="btn-outline" data-compare={product.sku}>Add to Compare</button>
        </div>
      </div>
    </div>
    
    <!-- Tabbed Content -->
    <ProductTabs client:visible product={product} />
    
    <!-- Related Products -->
    <RelatedProducts category={product.category} excludeSku={product.sku} />
    
    <!-- Where to Buy CTA -->
    <WhereToBuyCTA id="where-to-buy" />
  </div>
</LayoutBase>
```

---

## 3. React Islands Inventory

### 3.1 Header Navigation Island

```tsx
// src/islands/HeaderNavigation.tsx
import { useState, useEffect } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { SearchBar } from './SearchBar';
import { MobileMenu } from './MobileMenu';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Products', href: '/products', children: [
    { label: 'Memory', href: '/products/memory' },
    { label: 'SSD', href: '/products/ssd' },
    { label: 'Portable Storage', href: '/products/portable-storage' },
    { label: 'USB Flash', href: '/products/usb-flash' },
  ]},
  { label: 'Solutions', href: '/solutions' },
  { label: 'Gaming', href: '/gaming' },
  { label: 'Support', href: '/support' },
  { label: 'About', href: '/about' },
];

export function HeaderNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="TwinMOS" className="h-8 md:h-10" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <div key={item.href} className="relative group">
                <a href={item.href} className="text-sm font-medium hover:text-twinmos-blue transition-colors">
                  {item.label}
                </a>
                {item.children && (
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="bg-white rounded-lg shadow-lg border p-2 min-w-[200px]">
                      {item.children.map(child => (
                        <a key={child.href} href={child.href} className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-md">
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <SearchBar />
            <LanguageSelector />
            <button 
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && <MobileMenu items={navItems} onClose={() => setIsMobileMenuOpen(false)} />}
    </header>
  );
}
```

### 3.2 Search Bar Island

```tsx
// src/islands/SearchBar.tsx
import { useState, useRef, useEffect } from 'react';
import { searchClient } from '../lib/search';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  url: string;
  highlight?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const hits = await searchClient.search(query, { limit: 8 });
        setResults(hits);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <button 
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border p-4 z-50">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, articles..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-twinmos-blue focus:border-transparent"
          />
          
          {isLoading && <div className="mt-4 text-center text-gray-500">Searching...</div>}
          
          {results.length > 0 && (
            <ul className="mt-4 space-y-2">
              {results.map(result => (
                <li key={result.id}>
                  <a href={result.url} className="block p-2 hover:bg-gray-50 rounded-md">
                    <div className="text-sm font-medium">{result.title}</div>
                    <div className="text-xs text-gray-500">{result.type}</div>
                  </a>
                </li>
              ))}
            </ul>
          )}
          
          {query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="mt-4 text-center text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3.3 Product Filter Island

```tsx
// src/islands/ProductFilter.tsx
import { useState } from 'react';
import { activeFilters } from '../stores/ui';

interface FilterGroup {
  name: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
}

interface ProductFilterProps {
  filters: FilterGroup[];
}

export function ProductFilter({ filters }: ProductFilterProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['category']));
  const currentFilters = activeFilters.get();

  const toggleGroup = (name: string) => {
    const next = new Set(expandedGroups);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedGroups(next);
  };

  const toggleFilter = (group: string, value: string) => {
    const current = currentFilters[group] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    activeFilters.setKey(group, next);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      {filters.map(group => (
        <div key={group.name} className="border-b py-4">
          <button 
            onClick={() => toggleGroup(group.name)}
            className="flex items-center justify-between w-full text-left font-medium"
          >
            {group.label}
            <svg 
              className={`w-4 h-4 transition-transform ${expandedGroups.has(group.name) ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedGroups.has(group.name) && (
            <div className="mt-2 space-y-2">
              {group.options.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(currentFilters[group.name] || []).includes(option.value)}
                    onChange={() => toggleFilter(group.name, option.value)}
                    className="rounded border-gray-300 text-twinmos-blue focus:ring-twinmos-blue"
                  />
                  <span className="text-sm">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {Object.keys(currentFilters).length > 0 && (
        <button 
          onClick={() => activeFilters.set({})}
          className="mt-4 text-sm text-twinmos-blue hover:underline"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}
```

### 3.4 Contact Form Island

```tsx
// src/islands/ContactForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showToast } from '../stores/ui';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, formType: 'contact' })
      });
      
      if (!response.ok) throw new Error('Submission failed');
      
      showToast('success', 'Thank you! We will get back to you soon.');
      reset();
    } catch (err) {
      showToast('error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
        <input
          {...register('name')}
          id="name"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-twinmos-blue"
          placeholder="Your name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-twinmos-blue"
          placeholder="your@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
        <select
          {...register('subject')}
          id="subject"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-twinmos-blue"
        >
          <option value="">Select a subject</option>
          <option value="general">General Inquiry</option>
          <option value="product">Product Question</option>
          <option value="support">Technical Support</option>
          <option value="partnership">Partnership</option>
        </select>
        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
        <textarea
          {...register('message')}
          id="message"
          rows={5}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-twinmos-blue"
          placeholder="How can we help?"
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      {/* Cloudflare Turnstile */}
      <div className="cf-turnstile" data-sitekey={import.meta.env.TURNSTILE_SITE_KEY}></div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 bg-twinmos-blue text-white font-medium rounded-lg hover:bg-twinmos-blue-dark disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

---

## 4. Component Composition Patterns

### 4.1 Slot-Based Composition (Astro)

```astro
---
// src/components/organisms/Section.astro
interface Props {
  class?: string;
  background?: 'white' | 'gray' | 'dark';
}

const { class: className, background = 'white' } = Astro.props;

const bgClasses = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  dark: 'bg-gray-900 text-white'
};
---

<section class={`py-16 md:py-24 ${bgClasses[background]} ${className}`}>
  <div class="container mx-auto px-4">
    {Astro.slots.has('header') && (
      <div class="text-center mb-12">
        <slot name="header" />
      </div>
    )}
    <slot />
    {Astro.slots.has('footer') && (
      <div class="mt-12">
        <slot name="footer" />
      </div>
    )}
  </div>
</section>
```

### 4.2 Compound Component Pattern (React)

```tsx
// src/components/organisms/Tabs.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within <Tabs>');
  return context;
}

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children }: { children: ReactNode }) {
  return <div className="flex border-b" role="tablist">{children}</div>;
}

export function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabs();
  return (
    <button
      role="tab"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium border-b-2 transition-colors ${
        activeTab === id 
          ? 'border-twinmos-blue text-twinmos-blue' 
          : 'border-transparent hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabs();
  if (activeTab !== id) return null;
  return <div role="tabpanel" className="py-6">{children}</div>;
}
```

---

## 5. Design Token Integration

### 5.1 Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'twinmos-blue': '#00A3E0',
        'twinmos-blue-dark': '#0085B8',
        'twinmos-blue-light': '#E6F7FC',
        'twinmos-navy': '#1A2B3C',
        'twinmos-gray': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Noto Sans', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config;
```

### 5.2 CSS Custom Properties

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #00A3E0;
    --color-primary-dark: #0085B8;
    --color-primary-light: #E6F7FC;
    --color-navy: #1A2B3C;
    --color-text: #0F172A;
    --color-text-muted: #64748B;
    --color-background: #FFFFFF;
    --color-surface: #F8FAFC;
    --color-border: #E2E8F0;
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --transition-fast: 150ms ease;
    --transition-base: 250ms ease;
    --transition-slow: 350ms ease;
  }

  [dir="rtl"] {
    --direction: rtl;
  }

  [dir="ltr"] {
    --direction: ltr;
  }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center px-6 py-3 bg-twinmos-blue text-white font-medium rounded-lg hover:bg-twinmos-blue-dark transition-colors focus:outline-none focus:ring-2 focus:ring-twinmos-blue focus:ring-offset-2;
  }

  .btn-outline {
    @apply inline-flex items-center justify-center px-6 py-3 border-2 border-twinmos-blue text-twinmos-blue font-medium rounded-lg hover:bg-twinmos-blue-light transition-colors focus:outline-none focus:ring-2 focus:ring-twinmos-blue focus:ring-offset-2;
  }

  .card {
    @apply bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow;
  }

  .section-title {
    @apply text-3xl md:text-4xl font-bold text-gray-900;
  }

  .section-subtitle {
    @apply text-lg text-gray-600 mt-4 max-w-2xl;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## 6. Shared Component Library

### 6.1 Primitive Components (Atoms)

| Component | File | Props | Usage |
|-----------|------|-------|-------|
| Button | `atoms/Button.tsx` | variant, size, disabled, loading | All CTAs |
| Input | `atoms/Input.tsx` | type, label, error, helper | All forms |
| Select | `atoms/Select.tsx` | options, label, error | Form dropdowns |
| Checkbox | `atoms/Checkbox.tsx` | label, checked, indeterminate | Filter lists |
| Badge | `atoms/Badge.tsx` | variant, size | Status indicators |
| Icon | `atoms/Icon.tsx` | name, size, className | SVG icons |
| Skeleton | `atoms/Skeleton.tsx` | width, height, circle | Loading states |

### 6.2 Composite Components (Molecules)

| Component | File | Composition | Usage |
|-----------|------|-------------|-------|
| ProductCard | `molecules/ProductCard.tsx` | Image, Title, Specs, Buttons | Catalog grids |
| SearchField | `molecules/SearchField.tsx` | Input, Icon, Button | Search bar |
| FormField | `molecules/FormField.tsx` | Label, Input, Error, Helper | All forms |
| BreadcrumbItem | `molecules/BreadcrumbItem.tsx` | Link, Separator | Breadcrumbs |
| Pagination | `molecules/Pagination.tsx` | Buttons, Page numbers | List pagination |
| Alert | `molecules/Alert.tsx` | Icon, Title, Message, Actions | Notifications |
| Modal | `molecules/Modal.tsx` | Overlay, Content, Close | Dialogs |
| Dropdown | `molecules/Dropdown.tsx` | Trigger, Menu, Items | Navigation |

### 6.3 Complex Components (Organisms)

| Component | File | Composition | Usage |
|-----------|------|-------------|-------|
| Header | `organisms/Header.astro` | Logo, Nav, Search, Language | Site header |
| Footer | `organisms/Footer.astro` | Links, Social, Newsletter | Site footer |
| ProductGallery | `organisms/ProductGallery.astro` | Images, Thumbnails, Zoom | Product pages |
| ProductSpecs | `organisms/ProductSpecs.astro` | Tables, Icons, Groups | Product pages |
| FilterPanel | `organisms/FilterPanel.tsx` | Filter groups, Checkboxes | Catalog |
| HeroSection | `organisms/HeroSection.astro` | Background, Title, CTA | Landing pages |
| FeatureGrid | `organisms/FeatureGrid.astro` | Cards, Icons, Text | Feature pages |
| TestimonialSlider | `organisms/TestimonialSlider.tsx` | Quotes, Avatars, Controls | Homepage |

---

## 7. Page Template to Content Mapping

### 7.1 Content Map Coverage

| Template | Content Sections | Entry Count |
|----------|-----------------|-------------|
| LayoutHero | 00-site-wide, 01-homepage, 02-about, 04-solutions, 05-gaming, 09-partners, 11-regional, 15-marketing | ~70 |
| LayoutContent | 02-about, 06-technology, 08-learn, 10-news-events, 12-careers | ~150 |
| LayoutProductDetail | 03-products | 100+ |
| LayoutLegal | 14-legal | 34 |
| LayoutForm | 07-support, 09-partners, 12-careers, 13-contact | 16+ |
| LayoutLocator | 09-where-to-buy, 13-contact | ~10 |
| LayoutCatalog | 03-products | ~15 |

### 7.2 Dynamic Route Mapping

```typescript
// src/pages/[locale]/products/[slug].astro
export async function getStaticPaths() {
  const products = await fetchAllProducts();
  
  return products.flatMap(product => {
    // Generate paths for all active locales
    const locales = ['en']; // Phase 1
    // const locales = ['en', 'ar', 'bn', 'hi']; // Phase 2
    
    return locales.map(locale => ({
      params: { locale, slug: product.slug },
      props: { product }
    }));
  });
}
```

---

## 8. Component Lifecycle and State Management

### 8.1 Astro Component Lifecycle

```
1. Build Time
   ├── Parse .astro file
   ├── Execute frontmatter (server-side)
   ├── Render HTML (slots, children)
   ├── Generate static output
   └── Write to dist/

2. Runtime (Browser)
   ├── Load HTML
   ├── Parse <script> tags
   ├── Hydrate React islands (per directive)
   └── Islands become interactive
```

### 8.2 React Island Hydration Directives

| Directive | Trigger | Use Case |
|-----------|---------|----------|
| `client:load` | Immediately | Cookie banner, critical UI |
| `client:idle` | requestIdleCallback | Navigation, language selector |
| `client:visible` | Intersection Observer | Search, filters, forms, maps |
| `client:media` | Media query match | Responsive components |
| `server:defer` | On request | Cart badge, personalized content |

### 8.3 State Flow Diagram

```
User Interaction
    |
    v
React Island (client)
    |
    v
Nanostore (shared state)
    |
    +----> Other Islands (reactive update)
    |
    v
API Call (fetch)
    |
    v
Astro API Route / Strapi API
    |
    v
Database Update
    |
    v
Response → UI Update
```

### 8.4 Form State Management

```typescript
// src/stores/forms.ts
import { map } from 'nanostores';

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export const formStates = map<Record<string, FormState>>({});

export function createFormStore(formId: string) {
  formStates.setKey(formId, {
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true
  });

  return {
    setValue: (field: string, value: any) => {
      const state = formStates.get()[formId];
      formStates.setKey(formId, {
        ...state,
        values: { ...state.values, [field]: value }
      });
    },
    setError: (field: string, error: string) => {
      const state = formStates.get()[formId];
      formStates.setKey(formId, {
        ...state,
        errors: { ...state.errors, [field]: error }
      });
    },
    setSubmitting: (isSubmitting: boolean) => {
      const state = formStates.get()[formId];
      formStates.setKey(formId, { ...state, isSubmitting });
    }
  };
}
```
