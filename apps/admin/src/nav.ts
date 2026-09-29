// Module registry — the single source of truth for console navigation.
// Groups follow docs/04-ADMIN-CMS-SPEC.md §Modules; the shell (shell.tsx) renders
// the sidebar/mega-menu/tabs from this registry, role-filtered via ROLE_RANK.
// Modules import ONLY types from this file, so the component wiring here is acyclic.
// (createElement instead of JSX keeps this a .ts module — no build ambiguity.)
import React from 'react';
import type { IconName } from './icons';
import type { Me } from './login';
import Dashboard from './modules/dashboard';
import SearchPage from './modules/search';
import Content from './modules/content';
import Products from './modules/products';
import Submissions from './modules/submissions';
import RmaBoard from './modules/rma';
import Partners from './modules/partners';
import Jobs from './modules/jobs';
import Media from './modules/media';
import Translations from './modules/translations';
import UsersModule from './modules/users';
import AuditLog from './modules/audit';
import Settings from './modules/settings';

/** Per-tab context for deep links, e.g. { kind:'lead', id:'42', label:'QT-0042' }. */
export type TabCtx = { kind: string; id?: string; label?: string };
/** Cross-navigation handle passed into every module. */
export type NavOpen = (module: string, ctx?: TabCtx, opts?: { newTab?: boolean }) => void;
export type ModProps = { canWrite: boolean; me: Me; ctx?: TabCtx; nav: NavOpen };

export type ModuleDef = {
  id: string;
  label: string;
  group: string;
  icon: IconName;
  desc: string;
  minRole: string;
  badge?: 'newLeads' | 'openRma' | 'pendingApps';
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
  { id: 'submissions', label: 'Leads & quotes', group: 'Support & Leads', icon: 'inbox', minRole: 'viewer', badge: 'newLeads', desc: 'Lead inbox — SLA-tracked workflow, notes, CSV export.', comp: (p) => h(Submissions, { canWrite: p.canWrite, myId: p.me.user?.id, ctx: p.ctx }) },
  { id: 'rma', label: 'RMA board', group: 'Support & Leads', icon: 'tool', minRole: 'viewer', badge: 'openRma', desc: 'Returns board — 7-state pipeline with audited transitions.', comp: RmaBoard },
  { id: 'partners', label: 'Partners & channel', group: 'Channel & Partners', icon: 'share', minRole: 'viewer', desc: 'Distributors, marketplace listings and partner assets.', comp: (p) => h(Partners, { canManage: isAdminRole(p.me.user?.role) }) },
  { id: 'jobs', label: 'Careers', group: 'Careers', icon: 'briefcase', minRole: 'viewer', badge: 'pendingApps', desc: 'Job postings editor and applications inbox.', comp: Jobs },
  { id: 'media', label: 'Media library', group: 'Media Library', icon: 'image', minRole: 'viewer', desc: 'Uploads, alt-text compliance and usage references.', comp: (p) => h(Media, { isAdmin: isAdminRole(p.me.user?.role) }) },
  { id: 'translations', label: 'Translations', group: 'Localization', icon: 'translate', minRole: 'viewer', desc: '9-locale translation strings with import/export.', comp: (p) => h(Translations, { isSuperAdmin: p.me.user?.role === 'super_admin' }) },
  { id: 'users', label: 'Users & Roles', group: 'Administration', icon: 'users', minRole: 'super_admin', desc: 'Staff directory, role governance, MFA enforcement, and active session management.', comp: UsersModule },
  { id: 'audit', label: 'Audit log', group: 'Administration', icon: 'shield', minRole: 'editor', desc: 'Filterable trail of every mutation (12-month retention).', comp: AuditLog },
  { id: 'settings', label: 'Settings', group: 'Administration', icon: 'sliders', minRole: 'admin', desc: 'Site settings, redirects and locale management.', comp: (p) => h(Settings, { canManage: isAdminRole(p.me.user?.role), isSuperAdmin: p.me.user?.role === 'super_admin' }) },
];
