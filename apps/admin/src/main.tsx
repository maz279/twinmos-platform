// TwinMOS Admin — P1+ console: login/MFA state machine + tab workspace shell.
// Navigation architecture (grouped sidebar, mega menu, multi-tab, ⌘K search) lives
// in shell.tsx and nav.ts (docs/08-ADMIN-CONSOLE-PLAN.md); this file owns state.
import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { API, apiGet } from './api';
import Login from './login';
import type { Me } from './login';
import MfaSetup from './mfa';
import { MODULES, visibleModules } from './nav';
import type { NavOpen, TabCtx } from './nav';
import { Shell } from './shell';
import type { Badges, Tab } from './shell';
import SearchPalette from './search';

const WRITE_ROLES = ['super_admin', 'admin', 'editor', 'author'];
const canWrite = (role?: string) => !!role && WRITE_ROLES.includes(role);

function tabKey(module: string, ctx?: TabCtx): string {
  return `${module}:${ctx?.kind ?? ''}:${ctx?.id ?? ''}`;
}
function defaultTab(): Tab {
  return { id: 'dashboard::', module: 'dashboard', title: 'Dashboard' };
}
function restoreTabs(role?: string): { tabs: Tab[]; activeId: string } {
  const allowed = new Set(visibleModules(role).map((m) => m.id));
  try {
    const saved = JSON.parse(sessionStorage.getItem('tm.tabs') ?? 'null') as { tabs: Tab[]; activeId: string } | null;
    const tabs = (saved?.tabs ?? []).filter((t) => allowed.has(t.module));
    if (tabs.length) return { tabs, activeId: tabs.some((t) => t.id === saved?.activeId) ? saved!.activeId : tabs[0].id };
  } catch { /* corrupted session storage — fall through */ }
  const t = defaultTab();
  return { tabs: [t], activeId: t.id };
}

function Workspace({ me, onSignOut, onMfaChange }: { me: Me; onSignOut: () => void; onMfaChange: () => void }) {
  const [{ tabs, activeId }, setTabState] = useState(() => restoreTabs(me.user?.role));
  const [badges, setBadges] = useState<Badges>({});
  const [mfaOpen, setMfaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl+K opens the global search palette from anywhere in the console
  useEffect(() => {
    function combo(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen((v) => !v); }
    }
    document.addEventListener('keydown', combo);
    return () => document.removeEventListener('keydown', combo);
  }, []);

  useEffect(() => {
    apiGet<{ submissions: { byStatus: Record<string, number> }; rma: { open: number }; jobApplications: number }>('/admin/stats')
      .then((s) => setBadges({ newLeads: s?.submissions?.byStatus?.new, openRma: s?.rma?.open, pendingApps: s?.jobApplications }))
      .catch(() => { /* sidebar badges are non-critical */ });
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem('tm.tabs', JSON.stringify({ tabs, activeId })); } catch { /* private mode */ }
  }, [tabs, activeId]);

  const openTab: NavOpen = useCallback((module, ctx, opts) => {
    const mod = MODULES.find((m) => m.id === module);
    if (!mod) return;
    const key = tabKey(module, ctx);
    // ONE pure updater: focus the existing tab when it exists (unless newTab),
    // otherwise append. Calling a second setState from inside an updater is
    // impure — React may drop it, which made sidebar clicks to already-open
    // modules silently fail to activate.
    setTabState((prev) => {
      if (!opts?.newTab && prev.tabs.some((t) => t.id === key)) {
        return prev.activeId === key ? prev : { ...prev, activeId: key };
      }
      const id = opts?.newTab ? `${key}#${Date.now().toString(36)}` : key;
      return { tabs: [...prev.tabs, { id, module, ctx, title: ctx?.label ?? mod.label }], activeId: id };
    });
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabState((prev) => {
      const idx = prev.tabs.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const tabs = prev.tabs.filter((t) => t.id !== id);
      if (!tabs.length) { const d = defaultTab(); return { tabs: [d], activeId: d.id }; }
      const activeId = prev.activeId === id ? (tabs[Math.max(0, idx - 1)]?.id ?? tabs[0].id) : prev.activeId;
      return { tabs, activeId };
    });
  }, []);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const mod = visibleModules(me.user?.role).find((m) => m.id === activeTab?.module);

  return (
    <Shell
      me={me} badges={badges} tabs={tabs} activeId={activeTab?.id ?? ''} setActiveId={(id) => setTabState((p) => ({ ...p, activeId: id }))}
      openTab={openTab} closeTab={closeTab} onSignOut={onSignOut} onMfaChange={onMfaChange}
      onMfaSetup={() => setMfaOpen(true)} onOpenSearch={() => setSearchOpen(true)}
      mfaPanel={mfaOpen ? (
        <div style={{ minHeight: '100vh', background: '#F2F4F6' }}>
          <MfaSetup onEnrolled={() => { setMfaOpen(false); onMfaChange(); }} onSkip={() => setMfaOpen(false)} />
        </div>
      ) : null}>
      {/* key per tab: two tabs of the same module must NOT share component state
          (a Search tab focused on "VLT" would otherwise keep the previous query) */}
      {mod ? <mod.comp key={activeTab?.id} canWrite={canWrite(me.user?.role)} me={me} ctx={activeTab?.ctx} nav={openTab} /> : null}
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} open={openTab} />}
    </Shell>
  );
}

function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [state, setState] = useState<'loading' | 'anon' | 'authed' | 'mfa-setup'>('loading');
  useEffect(() => {
    (async () => {
      // Dev convenience: try a server-side dev session first so the console opens
      // straight in during iteration. import.meta.env.DEV is false in production
      // builds, and the endpoint itself is flag+NODE_ENV guarded server-side —
      // in any non-dev deployment this call simply never happens.
      if (import.meta.env.DEV) {
        try { await fetch(API + '/dev/session', { method: 'POST', credentials: 'include' }); } catch { /* fall through to the login form */ }
      }
      try {
        const d = await apiGet<Me>('/auth/get-session');
        setMe(d);
        // signed-in staff without MFA get a one-time enrollment offer (skippable);
        // suppressed in dev while iterating so the console opens without friction
        const offerMfa = !!d?.user && d.user.role !== 'viewer' && !d.user.twoFactorEnabled && !import.meta.env.DEV;
        setState(d?.user ? (offerMfa ? 'mfa-setup' : 'authed') : 'anon');
      } catch { setState('anon'); }
    })();
  }, []);
  const refreshMe = () => apiGet<Me>('/auth/get-session').then((d) => { setMe(d); setState(d?.user ? 'authed' : 'anon'); }).catch(() => {});
  if (state === 'loading') return null;
  if (state === 'anon') return <Login onDone={refreshMe} />;
  if (state === 'mfa-setup') {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F4F6' }}>
        <MfaSetup onEnrolled={refreshMe} onSkip={() => setState('authed')} />
      </div>
    );
  }
  return <Workspace me={me ?? {}} onSignOut={() => setState('anon')} onMfaChange={refreshMe} />;
}

createRoot(document.getElementById('root')!).render(<App />);
