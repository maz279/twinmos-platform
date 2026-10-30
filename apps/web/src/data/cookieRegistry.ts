// cookieRegistry.ts — Official registry of cookies and browser storage items (T6.3.1.5).
// Powers the dynamic cookie table rendered in the legal and privacy policies.

export interface CookieEntry {
  name: string;
  category: 'essential' | 'analytics' | 'marketing' | 'preferences';
  categoryLabel: string;
  provider: string;
  purpose: string;
  expiry: string;
  type: 'Cookie' | 'localStorage';
}

export const COOKIE_REGISTRY: CookieEntry[] = [
  {
    name: 'twinmos_consent',
    category: 'essential',
    categoryLabel: 'Strictly Necessary',
    provider: 'TwinMOS Technologies (First-party)',
    purpose: 'Stores the visitor’s cookie consent status and granular category choices.',
    expiry: '12 months',
    type: 'localStorage',
  },
  {
    name: 'twinmos_locale',
    category: 'essential',
    categoryLabel: 'Strictly Necessary',
    provider: 'TwinMOS Technologies (First-party)',
    purpose: 'Remembers the visitor’s chosen language and right-to-left layout preference.',
    expiry: '12 months',
    type: 'Cookie',
  },
  {
    name: 'better-auth.session_token',
    category: 'essential',
    categoryLabel: 'Strictly Necessary',
    provider: 'TwinMOS Technologies (First-party)',
    purpose: 'Maintains authenticated staff sessions for administrative console operations.',
    expiry: '30 days',
    type: 'Cookie',
  },
  {
    name: 'twinmos_compare',
    category: 'preferences',
    categoryLabel: 'Preferences',
    provider: 'TwinMOS Technologies (First-party)',
    purpose: 'Persists user-selected products in the comparison tray across browsing sessions.',
    expiry: 'Persistent',
    type: 'localStorage',
  },
  {
    name: '_ga, _ga_*',
    category: 'analytics',
    categoryLabel: 'Analytics',
    provider: 'Google LLC (Google Analytics 4)',
    purpose: 'Measures anonymous visitor volumes, traffic channels, and page load performance.',
    expiry: '24 months',
    type: 'Cookie',
  },
  {
    name: 'twinmos_ref',
    category: 'marketing',
    categoryLabel: 'Marketing',
    provider: 'TwinMOS Technologies (First-party)',
    purpose: 'Records distributor referral codes and campaign attribution for marketplace links.',
    expiry: '30 days',
    type: 'Cookie',
  },
];

export function getCookiesByCategory(category: string): CookieEntry[] {
  return COOKIE_REGISTRY.filter((c) => c.category === category);
}
