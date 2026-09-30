// TwinMOS Admin — P1+ console: login/MFA state machine + tab workspace shell.
// Navigation architecture (grouped sidebar, mega menu, multi-tab, ⌘K search) lives
// in shell.tsx and nav.ts (docs/08-ADMIN-CONSOLE-PLAN.md); this file owns state.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { API, apiGet } from './api';
import Login from './login';
import type { Me } from './login';
import MfaSetup from './mfa';
import { MODULES, visibleModules } from './nav';
import type { NavOpen, TabCtx } from './nav';
import { Shell } from './shell';
import type { Badges, Tab } from './shell';
import SearchPalette from './search';
import { ToastProvider } from './toast';
import { LINE, PAGE } from './ui';

const WRITE_ROLES = ['super_admin', 'admin', 'editor', 'author'];
const canWrite = (role?: string) => !!role && WRITE_ROLES.includes(role);

// TASK 6.2: modules are React.lazy chunks (see nav.ts) — this is the Suspense
// fallback shown while a module chunk streams in. Static placeholder cards on
// the PAGE canvas using LINE borders, mirroring the dashboard KPI/panel grid
// (repeat(auto-fit,minmax(...)) with the same 12px gaps) so the swap-in doesn't
// shift. Deliberately no animation loop.
function ModuleSkeleton() {
  return (
    <div style={{ background: PAGE, padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(196px,1fr))', gap: 12, marginBottom: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 108, borderRadius: 12, border: `1px solid ${LINE}`, background: '#FFFFFF' }} />
        ))}
      </div>
    </div>
  );
}

/** Review finding (medium): a REJECTED dynamic import — stale hashed chunk
 *  after a redeploy, or a network drop — throws during render and React
 *  unmounts the whole console (white screen, all tab state lost). Suspense
 *  does not catch errors, so this boundary wraps each lazy module; on failure
 *  it offers a one-click reload that pulls fresh chunk URLs. */
class ModuleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ background: PAGE, padding: 40, textAlign: 'center' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', border: `1px solid ${LINE}`, borderRadius: 12, background: '#fff', padding: 28 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 17, color: '#1F2A37' }}>This module could not be loaded</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#66748A', lineHeight: 1.6 }}>
            The console was updated since this tab opened (or the network dropped), so its code
            chunk is no longer available. Reload to pick up the current version — your other
            tabs are unaffected until then.
          </p>
          <button onClick={() => location.reload()}
            style={{ padding: '9px 18px', border: 0, borderRadius: 8, background: '#1DBF9F', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Reload console
          </button>
        </div>
      </div>
    );
  }
}

function tabKey(module: string, ctx?: TabCtx): string {
  return `${module}:${ctx?.kind ?? ''}:${ctx?.id ?? ''}`;
}
function defaultTab(): Tab {
  return { id: 'dashboard::', module: 'dashboard', title: 'Dashboard' };
}

// ---- URL hash deep-links ---------------------------------------------------
// The console is state-driven; the hash makes the workspace shareable and
// gives visitors an explicit home:  #/home → dashboard,
// #/m/<module> → module tab,  #/m/<module>/<ctxKind>/<ctxId> → deep-linked tab.
function tabFromHash(hash: string): { module: string; ctx?: TabCtx } | null {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0 || (parts.length === 1 && parts[0] === 'home')) return { module: 'dashboard' };
  if (parts[0] === 'm' && parts.length >= 2) {
    const ctx = parts.length >= 4
      ? { kind: parts[2], id: parts[3], label: parts[3] }
      : undefined;
    return { module: parts[1], ctx };
  }
  return null;
}
function hashFromTab(t: Tab | undefined): string {
  if (!t || (t.module === 'dashboard' && !t.ctx)) return '#/home';
  const segs = ['m', t.module];
  if (t.ctx?.kind && t.ctx?.id) segs.push(t.ctx.kind, encodeURIComponent(t.ctx.id));
  return `#/${segs.join('/')}`;
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

  // Hash deep-links: open the tab the URL asks for (mount + manual hash edits),
  // and mirror the active tab back into the URL (replaceState → no history spam).
  const openRef = useRef(openTab);
  openRef.current = openTab;
  useEffect(() => {
    const apply = () => {
      const target = tabFromHash(location.hash);
      if (target && visibleModules(me.user?.role).some((m) => m.id === target.module)) {
        openRef.current(target.module, target.ctx);
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const h = hashFromTab(activeTab);
    if (location.hash !== h) history.replaceState(null, '', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.id]);

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
          (a Search tab focused on "VLT" would otherwise keep the previous query).
          Suspense boundary per active module: swapping tabs shows ModuleSkeleton
          only while that module's lazy chunk loads; an already-loaded chunk
          re-renders synchronously with no fallback flash. */}
      {mod ? (
        <ModuleErrorBoundary>
          <React.Suspense fallback={<ModuleSkeleton />}>
            <mod.comp key={activeTab?.id} canWrite={canWrite(me.user?.role)} me={me} ctx={activeTab?.ctx} nav={openTab} />
          </React.Suspense>
        </ModuleErrorBoundary>
      ) : null}
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

// TASK 6.1: one QueryClient for the whole console — the single shared cache
// behind useAsync (ui.tsx). staleTime 60s means switching workspace tabs back
// to recently-viewed data paints from cache; refetchOnWindowFocus keeps every
// mounted view fresh when the operator returns to the tab; retry 1 avoids
// hammering the API on hard failures while riding out a single blip.
// Nesting order: QueryClientProvider OUTSIDE ToastProvider — the query client
// is pure infrastructure (no UI, no toasts), and every branch of the state
// machine below (Login, MFA setup, Workspace modules via useAsync) must sit
// inside BOTH providers, so this order keeps ToastProvider wrapping the whole
// app exactly as before while the client context reaches everything.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60000, refetchOnWindowFocus: true, retry: 1 },
  },
});

// ToastProvider wraps the WHOLE app so every branch of the state machine —
// anon (Login), mfa-setup and the authed Workspace that hosts the module
// components — sits inside it and can call useToast().
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ToastProvider><App /></ToastProvider>
  </QueryClientProvider>,
);
