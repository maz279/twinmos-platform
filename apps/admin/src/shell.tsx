// P1 console shell — professional navigation architecture (docs/08-ADMIN-CONSOLE-PLAN.md):
//   • grouped collapsible sidebar (icons, live badges, rail-collapse mode, role-filtered)
//   • top bar: mega menu ("all modules" grid), breadcrumbs, ⌘K search trigger, user chip
//   • multi-tab workspace: per-module tabs with deep-link context, open/close, Shift+click
//     opens a module in a new tab, cross-nav from modules lands here as focused tabs
// Tab state is owned by main.tsx; this file renders from the registry in nav.ts.
import React, { useEffect, useRef, useState } from 'react';
import { API } from './api';
import { Icon } from './icons';
import { GROUP_ORDER, MODULES, visibleModules } from './nav';
import type { ModuleDef, ModProps, NavOpen, TabCtx } from './nav';
import type { Me } from './login';
import { Badge, btn } from './ui';

export const NAVY = '#0A2540'; const CYAN = '#00A3E0'; const GOLD = '#D9A441';

export type Tab = { id: string; module: string; ctx?: TabCtx; title: string };
export type Badges = { newLeads?: number; openRma?: number; pendingApps?: number };

const shellCss = `
  .tm-side-group-h { display:flex; align-items:center; gap:8px; width:100%; border:0; background:none; color:#7E9CC0;
    font-size:10.5px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; cursor:pointer; padding:14px 12px 6px; }
  .tm-side-group-h:hover { color:#B9D2EC; }
  .tm-side-item { display:flex; align-items:center; gap:10px; width:100%; border:0; background:none; text-align:left;
    color:#D5E4F2; font-size:13.5px; padding:8px 12px; border-radius:7px; cursor:pointer; position:relative; }
  .tm-side-item:hover { background:rgba(255,255,255,.08); color:#fff; }
  .tm-side-item.on { background:linear-gradient(90deg, rgba(0,163,224,.28), rgba(0,163,224,.10)); color:#fff; }
  .tm-side-item.on::before { content:''; position:absolute; left:0; top:6px; bottom:6px; width:3px; border-radius:2px; background:${CYAN}; }
  .tm-tab { display:flex; align-items:center; gap:8px; padding:0 6px 0 12px; height:34px; border:1px solid transparent;
    border-radius:8px 8px 0 0; background:transparent; color:#4E6783; font-size:13px; cursor:pointer; white-space:nowrap; }
  .tm-tab:hover { background:#EAF1F8; color:${NAVY}; }
  .tm-tab.on { background:#fff; border-color:#D9E4EF; border-bottom-color:#fff; color:${NAVY}; font-weight:700; }
  .tm-tab-x { display:grid; place-items:center; width:18px; height:18px; border:0; border-radius:5px; background:none; color:#8CA3BA; cursor:pointer; }
  .tm-tab-x:hover { background:#D9E4EF; color:${NAVY}; }
  .tm-mm-card { display:block; width:100%; text-align:left; border:1px solid #E3EBF3; background:#fff; border-radius:10px;
    padding:10px 12px; cursor:pointer; transition:box-shadow .12s, border-color .12s; }
  .tm-mm-card:hover { border-color:${CYAN}; box-shadow:0 4px 14px rgba(10,37,64,.10); }
  .tm-chipbtn { display:flex; align-items:center; gap:8px; border:1px solid #D9E4EF; background:#fff; border-radius:8px;
    padding:7px 12px; font-size:13px; color:#4E6783; cursor:pointer; }
  .tm-chipbtn:hover { border-color:${CYAN}; color:${NAVY}; }
`;

function RailLogo({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '14px 0' : '0 0 12px' }}>
      {!collapsed && (
        <span style={{ display: 'inline-flex', background: 'rgba(255,255,255,.92)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(2,12,28,.35)' }}>
          <img src="/assets/img/logo.webp" alt="TwinMOS" style={{ height: 20, width: 'auto', display: 'block' }} />
        </span>
      )}
      <button onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{ marginLeft: 'auto', border: 0, background: 'none', color: '#7E9CC0', cursor: 'pointer', padding: 4 }}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: collapsed ? 'none' : 'rotate(180deg)' }}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>
  );
}

function Sidebar({ modules, activeModule, badges, collapsed, onToggleCollapse, open }: {
  modules: ModuleDef[]; activeModule: string; badges: Badges; collapsed: boolean;
  onToggleCollapse: () => void; open: NavOpen;
}) {
  const [closedGroups, setClosedGroups] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tm.nav.closedGroups') ?? '[]') as string[]; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('tm.nav.closedGroups', JSON.stringify(closedGroups)); } catch { /* private mode */ } }, [closedGroups]);
  const groups = GROUP_ORDER.filter((g) => modules.some((m) => m.group === g));
  return (
    <nav style={{ width: collapsed ? 64 : 236, flexShrink: 0, background: NAVY, color: '#fff', padding: collapsed ? '14px 10px' : '16px 12px', display: 'flex', flexDirection: 'column', transition: 'width .15s', overflowY: 'auto' }}>
      <RailLogo collapsed={collapsed} onToggle={onToggleCollapse} />
      {groups.map((g) => {
        const items = modules.filter((m) => m.group === g);
        const closed = closedGroups.includes(g);
        return (
          <div key={g} style={{ marginBottom: 2 }}>
            {/* group header only when the group has 2+ items — a single-item
                group (e.g. Careers → Careers) would render two identical
                buttons and the first click would just toggle collapse */}
            {!collapsed && items.length > 1 && (
              <button className="tm-side-group-h" onClick={() => setClosedGroups((s) => (closed ? s.filter((x) => x !== g) : [...s, g]))}>
                <span style={{ flex: 1, textAlign: 'left' }}>{g}</span>
                <Icon name="chevron" size={12} style={{ transform: closed ? 'rotate(-90deg)' : 'none', transition: 'transform .12s' }} />
              </button>
            )}
            {!collapsed && items.length === 1 && (
              <div style={{ fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5E7CA6', fontWeight: 700, padding: '14px 12px 4px' }}>{g}</div>
            )}
            {collapsed && <div style={{ height: 1, background: 'rgba(255,255,255,.10)', margin: '8px 4px' }} />}
            {(!closed || collapsed) && items.map((m) => {
              const n = m.badge ? badges[m.badge] : undefined;
              const on = activeModule === m.id;
              const badgeBg = m.badge === 'newLeads' ? CYAN : m.badge === 'openRma' ? GOLD : '#7EE2A8';
              return (
                <button key={m.id} className={'tm-side-item' + (on ? ' on' : '')} title={`${m.label}${n ? ` (${n})` : ''} — Shift+click opens a new tab`}
                  onClick={(e) => open(m.id, undefined, { newTab: e.shiftKey })}>
                  <Icon name={m.icon} size={16} />
                  {!collapsed && <span style={{ flex: 1 }}>{m.label}</span>}
                  {!collapsed && !!n && (
                    <span style={{ background: badgeBg, color: m.badge === 'openRma' ? NAVY : '#fff', borderRadius: 999, fontSize: 10.5, fontWeight: 800, padding: '1px 7px' }}>{n}</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function MegaMenu({ modules, badges, open, onClose }: { modules: ModuleDef[]; badges: Badges; open: NavOpen; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function away(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    function esc(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [onClose]);
  const groups = GROUP_ORDER.filter((g) => modules.some((m) => m.group === g));
  return (
    <div ref={ref} style={{ position: 'absolute', top: 46, left: 12, right: 12, background: '#fff', border: '1px solid #D9E4EF', borderRadius: 14, boxShadow: '0 24px 64px rgba(10,37,64,.22)', padding: 18, zIndex: 40, maxHeight: '72vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <b style={{ color: NAVY, fontSize: 14 }}>All modules <span style={{ color: '#8CA3BA', fontWeight: 400 }}>— {modules.length} available · Shift+click opens in a new tab</span></b>
        <button className="tm-tab-x" onClick={onClose} title="Close"><Icon name="x" size={14} /></button>
      </div>
      {groups.map((g) => (
        <div key={g} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase', color: '#8CA3BA', fontWeight: 700, margin: '4px 0 8px' }}>{g}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 8 }}>
            {modules.filter((m) => m.group === g).map((m) => {
              const n = m.badge ? badges[m.badge] : undefined;
              return (
                <button key={m.id} className="tm-mm-card" onClick={(e) => { open(m.id, undefined, { newTab: e.shiftKey }); onClose(); }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: NAVY, fontWeight: 700, fontSize: 13.5 }}>
                    <Icon name={m.icon} size={15} style={{ color: CYAN }} />{m.label}
                    {!!n && <span style={{ background: '#EAF6FC', color: '#0E7FB8', borderRadius: 999, fontSize: 10.5, fontWeight: 800, padding: '1px 7px' }}>{n}</span>}
                  </div>
                  <div style={{ color: '#5E7691', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopBar({ me, module, tab, badges, onOpenSearch, onSignOut, onMfaSetup, open }: {
  me: Me; module?: ModuleDef; tab?: Tab; badges: Badges; onOpenSearch: () => void;
  onSignOut: () => void; onMfaSetup: () => void; open: NavOpen;
}) {
  const [mega, setMega] = useState(false);
  async function signOut() { await fetch(API + '/auth/sign-out', { method: 'POST', credentials: 'include' }).catch(() => {}); onSignOut(); }
  return (
    <header style={{ position: 'relative', height: 46, flexShrink: 0, background: 'linear-gradient(180deg,#FFFFFF,#F7FAFD)', borderBottom: '1px solid #D9E4EF', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', zIndex: 30 }}>
      <button className="tm-chipbtn" onClick={() => setMega((v) => !v)} title="Browse every module (mega menu)">
        <Icon name="grid" size={14} style={{ color: CYAN }} />Modules
      </button>
      <button className="tm-chipbtn" onClick={onOpenSearch} title="Global search (Ctrl/⌘ + K)" style={{ minWidth: 200, justifyContent: 'flex-start', color: '#8CA3BA' }}>
        <Icon name="search" size={14} />Search everything… <kbd style={{ marginLeft: 'auto', fontSize: 10.5, border: '1px solid #D9E4EF', borderRadius: 5, padding: '1px 5px', color: '#8CA3BA' }}>Ctrl K</kbd>
      </button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#8CA3BA', overflow: 'hidden' }}>
        {module && <>
          <span>{module.group}</span><span>/</span>
          <span style={{ color: NAVY, fontWeight: 700 }}>{module.label}</span>
          {tab?.ctx?.label && <><span>/</span><span style={{ color: CYAN }}>{tab.ctx.label}</span></>}
        </>}
      </div>
      <span style={{ fontSize: 12.5, color: '#4E6783', display: 'flex', alignItems: 'center', gap: 6 }}>
        {me.user?.email} <Badge value={me.user?.role ?? 'unknown'} />
        {me.user?.twoFactorEnabled
          ? <span title="Multi-factor authentication is active" style={{ color: '#15803D', fontSize: 11.5, fontWeight: 700 }}>🔐 MFA on</span>
          : <button onClick={onMfaSetup} style={{ ...btn, background: 'rgba(217,164,65,.18)', color: '#8A6420', fontSize: 11, padding: '3px 8px' }}>Enable MFA</button>}
        <button onClick={signOut} style={{ ...btn, background: '#EEF2F6', color: '#33475C', fontSize: 12, padding: '5px 10px' }}>Sign out</button>
      </span>
      {mega && <MegaMenu modules={visibleModules(me.user?.role)} badges={badges} open={open} onClose={() => setMega(false)} />}
    </header>
  );
}

function TabStrip({ tabs, activeId, onSelect, onClose }: {
  tabs: Tab[]; activeId: string; onSelect: (id: string) => void; onClose: (id: string) => void;
}) {
  return (
    <div role="tablist" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, background: '#EFF4F9', borderBottom: '1px solid #D9E4EF', padding: '8px 10px 0', overflowX: 'auto', flexShrink: 0 }}>
      {tabs.map((t) => {
        const mod = MODULES.find((m) => m.id === t.module);
        const on = t.id === activeId;
        return (
          <div key={t.id} role="tab" aria-selected={on} className={'tm-tab' + (on ? ' on' : '')} style={{ flexShrink: 0 }}
            onClick={() => onSelect(t.id)}
            onMouseDown={(e) => { if (e.button === 1) { e.preventDefault(); onClose(t.id); } }}>
            {mod && <Icon name={mod.icon} size={13} style={{ color: on ? CYAN : '#8CA3BA' }} />}
            <span>{t.title}</span>
            <button className="tm-tab-x" title="Close tab" onClick={(e) => { e.stopPropagation(); onClose(t.id); }}><Icon name="x" size={11} /></button>
          </div>
        );
      })}
    </div>
  );
}

export function Shell({ me, badges, tabs, activeId, setActiveId, openTab, closeTab, onSignOut, onMfaChange, onMfaSetup, onOpenSearch, mfaPanel, children }: {
  me: Me; badges: Badges; tabs: Tab[]; activeId: string; setActiveId: (id: string) => void;
  openTab: NavOpen; closeTab: (id: string) => void; onSignOut: () => void; onMfaChange: () => void;
  onMfaSetup: () => void; onOpenSearch: () => void; mfaPanel: React.ReactNode; children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const visible = visibleModules(me.user?.role);
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const module = visible.find((m) => m.id === activeTab?.module);
  if (mfaPanel) return <>{mfaPanel}</>;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', background: '#F5F8FB' }}>
      <style>{shellCss}</style>
      <Sidebar modules={visible} activeModule={activeTab?.module ?? ''} badges={badges}
        collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} open={openTab} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar me={me} module={module} tab={activeTab} badges={badges} onOpenSearch={onOpenSearch}
          onSignOut={onSignOut} onMfaSetup={onMfaSetup} open={openTab} />
        <TabStrip tabs={tabs} activeId={activeTab?.id ?? ''} onSelect={setActiveId} onClose={closeTab} />
        <main style={{ flex: 1, padding: 22, overflowX: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
