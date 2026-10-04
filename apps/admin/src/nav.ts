// Module registry — the single source of truth for console navigation.
// Groups follow docs/04-ADMIN-CMS-SPEC.md §Modules; the shell (shell.tsx) renders
// the sidebar/mega-menu/tabs from this registry, role-filtered via ROLE_RANK.
// Modules import ONLY types from this file, so the component wiring here is acyclic.
// (createElement instead of JSX keeps this a .ts module — no build ambiguity.)
//
// TASK 6.2 (code splitting): every module ships as its OWN chunk via React.lazy,
// so the entry bundle keeps react/react-dom/shell/ui/login while the 14 modules
// load on first tab open (suspensed in main.tsx with ModuleSkeleton). This stays
// a .ts registry of createElement adapters — only the component references became
// lazy; lazy components accept props exactly like the eager ones they replaced.
import React, { lazy } from 'react';
import type { IconName } from './icons';
import type { Me } from './login';

const Dashboard = lazy(() => import('./modules/dashboard'));
const SearchPage = lazy(() => import('./modules/search'));
const Content = lazy(() => import('./modules/content'));
const Products = lazy(() => import('./modules/products'));
const Compatibility = lazy(() => import('./modules/compatibility'));
const Submissions = lazy(() => import('./modules/submissions'));
const RmaBoard = lazy(() => import('./modules/rma'));
const Partners = lazy(() => import('./modules/partners'));
const Serials = lazy(() => import('./modules/serials'));
const Jobs = lazy(() => import('./modules/jobs'));
const Media = lazy(() => import('./modules/media'));
const Translations = lazy(() => import('./modules/translations'));
const UsersModule = lazy(() => import('./modules/users'));
const AuditLog = lazy(() => import('./modules/audit'));
const Settings = lazy(() => import('./modules/settings'));

/** Per-tab context for deep links, e.g. { kind:'lead', id:'42', label:'QT-0042' }. */
export type TabCtx = { kind: string; id?: string; label?: string };
/** Cross-navigation handle passed into every module. */
export type NavOpen = (module: string, ctx?: TabCtx, opts?: { newTab?: boolean }) => void;
export type ModProps = { canWrite: boolean; me: Me; ctx?: TabCtx; nav: NavOpen };

/** Third sidebar level (TASK 6.4): an entry nested under a module that opens
 *  that module with a pre-filtered ctx. Static entries live on ModuleDef;
 *  dynamic ones (Products → taxonomy categories) are injected by the shell. */
export type NavChild = { id: string; label: string; ctx: TabCtx };

export type ModuleDef = {
  id: string;
  label: string;
  group: string;
  icon: IconName;
  desc: string;
  minRole: string;
  badge?: 'newLeads' | 'openRma' | 'pendingApps';
  /** Static third-level entries — see NavChild. */
  children?: NavChild[];
  comp: React.ComponentType<ModProps>;
};

export const GROUP_ORDER = [
  'Overview', 'Content Studio', 'Catalog', 'Support & Leads',
  'Channel & Partners', 'Careers', 'Media Library', 'Localization', 'Administration',
] as const;

const ROLE_RANK: Record<string, number> = { viewer: 1, author: 2, editor: 3, admin: 4, super_admin: 5 };

export function visibleModules(role: string | undefined): ModuleDef[] {
  const rank = ROLE_RANK[role ?? 'viewer'] ?? 0;
  return MODULES.filter((m) => rank >= (ROLE_RANK[m.minRole] ?? 5));
}

// adapters: modules keep their own narrower prop contracts, derived from role here
const isAdminRole = (r?: string) => r === 'super_admin' || r === 'admin';
const canPublishRole = (r?: string) => isAdminRole(r) || r === 'editor';
const h = React.createElement;

export const MODULES: ModuleDef[] = [
  { id: 'dashboard', label: 'Dashboard', group: 'Overview', icon: 'grid', minRole: 'viewer', desc: 'Live KPIs, trends and activity across the platform.', comp: Dashboard },
  { id: 'search', label: 'Search', group: 'Overview', icon: 'search', minRole: 'viewer', desc: 'Search everything — leads, products, content, RMA, media.', comp: SearchPage },
  { id: 'content', label: 'Content', group: 'Content Studio', icon: 'doc', minRole: 'viewer', desc: 'Articles, news, pages and FAQ — workflow, revisions, preview.', comp: (p) => h(Content, { canPublish: canPublishRole(p.me.user?.role), canWrite: p.canWrite }) },
  { id: 'products', label: 'Products', group: 'Catalog', icon: 'layers', minRole: 'viewer', desc: 'Product catalog: SKUs, specs, variants and badges.', comp: Products },
  { id: 'compatibility', label: 'Compatibility', group: 'Catalog', icon: 'shield', minRole: 'viewer', desc: 'QVL matrix — validated motherboard/laptop compatibility rules.', comp: (p) => h(Compatibility, { canWrite: p.canWrite }) },
  { id: 'submissions', label: 'Leads & quotes', group: 'Support & Leads', icon: 'inbox', minRole: 'viewer', badge: 'newLeads', desc: 'Lead inbox — SLA-tracked workflow, notes, CSV export.', comp: (p) => h(Submissions, { canWrite: p.canWrite, myId: p.me.user?.id, ctx: p.ctx }) },
  { id: 'rma', label: 'RMA board', group: 'Support & Leads', icon: 'tool', minRole: 'viewer', badge: 'openRma', desc: 'Returns board — 7-state pipeline with audited transitions.', comp: RmaBoard },
  { id: 'partners', label: 'Partners & channel', group: 'Channel & Partners', icon: 'share', minRole: 'viewer', desc: 'Distributors, marketplace listings and partner assets.', comp: (p) => h(Partners, { canManage: isAdminRole(p.me.user?.role) }) },
  { id: 'serials', label: 'SN-check & serials', group: 'Channel & Partners', icon: 'shield', minRole: 'viewer', desc: 'Anti-counterfeit serial registry, batch CSV import and counterfeit anomaly scans.', comp: (p) => h(Serials, { canWrite: p.canWrite }) },
  { id: 'jobs', label: 'Careers', group: 'Careers', icon: 'briefcase', minRole: 'viewer', badge: 'pendingApps', desc: 'Job postings editor and applications inbox.', comp: Jobs },
  { id: 'media', label: 'Media library', group: 'Media Library', icon: 'image', minRole: 'viewer', desc: 'Uploads, alt-text compliance and usage references.', comp: (p) => h(Media, { isAdmin: isAdminRole(p.me.user?.role) }) },
  { id: 'translations', label: 'Translations', group: 'Localization', icon: 'translate', minRole: 'viewer', desc: '9-locale translation strings with import/export.', comp: (p) => h(Translations, { isSuperAdmin: p.me.user?.role === 'super_admin' }) },
  { id: 'users', label: 'Users & Roles', group: 'Administration', icon: 'users', minRole: 'super_admin', desc: 'Staff directory, role governance, MFA enforcement, and active session management.', comp: UsersModule },
  { id: 'audit', label: 'Audit log', group: 'Administration', icon: 'shield', minRole: 'editor', desc: 'Filterable trail of every mutation (12-month retention).', comp: AuditLog },
  { id: 'settings', label: 'Settings', group: 'Administration', icon: 'sliders', minRole: 'admin', desc: 'Site settings, redirects and locale management.', comp: (p) => h(Settings, { canManage: isAdminRole(p.me.user?.role), isSuperAdmin: p.me.user?.role === 'super_admin' }) },
];
