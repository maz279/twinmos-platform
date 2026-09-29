// P1 console shell — professional navigation architecture (docs/08-ADMIN-CONSOLE-PLAN.md),
// restyled 2026 to the approved design boards (admin_panel/design_sample):
//   • deep-navy sidebar with brand block, user card, teal active indicators
//   • white topbar: module mega-menu, ⌘K search field, breadcrumbs, avatar chip
//   • multi-tab workspace rendered as rounded pills on the light-gray canvas
// Tab state is owned by main.tsx; this file renders from the registry in nav.ts.
import React, { useEffect, useRef, useState } from 'react';
import { API } from './api';
import { Icon } from './icons';
import { GROUP_ORDER, MODULES, visibleModules } from './nav';
import type { ModuleDef, ModProps, NavOpen, TabCtx } from './nav';
import type { Me } from './login';
import { Badge, btn, globalCss, GOLD, GREEN, INK, LINE, MUTED, NAVY, PAGE, FAINT, TEAL, TEAL_DK } from './ui';

export { NAVY };

export type Tab = { id: string; module: string; ctx?: TabCtx; title: string };
export type Badges = { newLeads?: number; openRma?: number; pendingApps?: number };

const SIDE_TEXT = '#A9B8C8';

const shellCss = `
  .tm-side-group-h { display:flex; align-items:center; gap:8px; width:100%; border:0; background:none; color:#5E7186;
    font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; padding:14px 10px 6px; }
  .tm-side-group-h:hover { color:#8FA3BA; }
  .tm-side-item { display:flex; align-items:center; gap:10px; width:100%; border:0; background:none; text-align:left;
    color:${SIDE_TEXT}; font-size:13px; padding:7px 10px; border-radius:8px; cursor:pointer; position:relative;
    transition:background .12s, color .12s; }
  .tm-side-item:hover { background:rgba(255,255,255,.06); color:#fff; }
  .tm-side-item.on { background:linear-gradient(90deg, rgba(29,191,159,.22), rgba(29,191,159,.05)); color:#fff; font-weight:700; }
  .tm-side-item.on svg { color:${TEAL}; }
  .tm-side-item.on::before { content:''; position:absolute; left:0; top:6px; bottom:6px; width:3px; border-radius:2px; background:${TEAL}; }
  .tm-tab { display:flex; align-items:center; gap:8px; padding:0 6px 0 12px; height:34px; border:1px solid transparent;
    border-radius:9px; background:transparent; color:${MUTED}; font-size:12.5px; cursor:pointer; white-space:nowrap; }
  .tm-tab:hover { background:#E8EDF2; color:${INK}; }
  .tm-tab.on { background:#fff; border-color:${LINE}; box-shadow:0 1px 3px rgba(16,24,40,.08); color:${INK}; font-weight:700; }
  .tm-tab-x { display:grid; place-items:center; width:18px; height:18px; border:0; border-radius:5px; background:none; color:${FAINT}; cursor:pointer; }
  .tm-tab-x:hover { background:#E4E9EF; color:${INK}; }
  .tm-mm-card { display:flex; align-items:flex-start; gap:10px; width:100%; text-align:left; border:1px solid ${LINE};
    background:#fff; border-radius:10px; padding:10px 12px; cursor:pointer; transition:box-shadow .13s, border-color .13s, transform .13s; }
  .tm-mm-card:hover { border-color:${TEAL}; box-shadow:0 6px 18px rgba(16,24,40,.10); transform:translateY(-1px); }
  .tm-chipbtn { display:flex; align-items:center; gap:8px; border:1px solid ${LINE}; background:#fff; border-radius:8px;
    padding:7px 12px; font-size:12.5px; font-weight:600; color:${MUTED}; cursor:pointer; transition:border-color .12s, color .12s; }
  .tm-chipbtn:hover { border-color:${TEAL}; color:${INK}; }
  .tm-searchbtn { display:flex; align-items:center; gap:9px; border:1px solid transparent; background:#F3F6F9; border-radius:8px;
    padding:'7px 12px'; min-width:260px; max-width:420px; flex:1; font-size:12.5px; color:${FAINT}; cursor:pointer;
    transition:border-color .12s, background .12s; }
  .tm-searchbtn:hover { border-color:${TEAL}; background:#fff; }
`;

function initials(email?: string): string {
  const p = (email ?? '?').split('@')[0].replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  return (p.slice(0, 2) || '?').toUpperCase();
}

function Avatar({ email, size = 28 }: { email?: string; size?: number }) {
  return (
    <span style={{
      display: 'grid', placeItems: 'center', width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${TEAL}, #14A98B)`, color: '#fff',
      fontSize: Math.round(size * 0.38), fontWeight: 800, letterSpacing: 0.5,
      boxShadow: '0 0 0 2px rgba(255,255,255,.85), 0 1px 3px rgba(14,159,126,.4)',
    }}>{initials(email)}</span>
  );
}

function RailLogo({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0 8px' : '0 0 14px' }}>
      <span style={{ display: 'inline-flex', background: 'rgba(255,255,255,.94)', borderRadius: 9, padding: '7px 10px', boxShadow: '0 4px 14px rgba(2,12,28,.38)', flexShrink: 0 }}>
        <img src="/assets/img/logo.webp" alt="TwinMOS" style={{ height: 18, width: 'auto', display: 'block' }} />
      </span>
      {!collapsed && (
        <span style={{ lineHeight: 1.15 }}>
          <span style={{ display: 'block', color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: 0.3 }}>TwinMOS</span>
          <span style={{ display: 'block', color: '#5E7186', fontSize: 9.5, fontWeight: 800, letterSpacing: 1.8 }}>CONSOLE</span>
        </span>
      )}
      <button onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{ marginLeft: 'auto', border: 0, background: 'none', color: '#5E7186', cursor: 'pointer', padding: 5, borderRadius: 6 }}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: collapsed ? 'none' : 'rotate(180deg)' }}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>
  );
}

function UserCard({ me, collapsed }: { me: Me; collapsed: boolean }) {
  if (collapsed) return <div style={{ display: 'grid', placeItems: 'center', padding: '4px 0 10px' }}><Avatar email={me.user?.email} size={32} /></div>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: '9px 10px', marginBottom: 6 }}>
      <Avatar email={me.user?.email} size={32} />
      <span style={{ minWidth: 0, lineHeight: 1.3 }}>
        <span style={{ display: 'block', color: '#E7EDF3', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {(me.user?.email ?? 'staff').split('@')[0]}
        </span>
        <span style={{ display: 'block', color: '#6E8199', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          {me.user?.role?.replace('_', ' ') ?? 'staff'}
        </span>
      </span>
    </div>
  );
}

function Sidebar({ modules, activeModule, badges, collapsed, onToggleCollapse, me, open }: {
  modules: ModuleDef[]; activeModule: string; badges: Badges; collapsed: boolean; me: Me;
  onToggleCollapse: () => void; open: NavOpen;
}) {
  const [closedGroups, setClosedGroups] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tm.nav.closedGroups') ?? '[]') as string[]; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('tm.nav.closedGroups', JSON.stringify(closedGroups)); } catch { /* private mode */ } }, [closedGroups]);
  const groups = GROUP_ORDER.filter((g) => modules.some((m) => m.group === g));
  return (
    <nav className="tm-scroll" style={{ width: collapsed ? 64 : 240, flexShrink: 0, background: 'linear-gradient(180deg,#182736 0%,' + NAVY + ' 55%,#121D29 100%)', color: '#fff', padding: collapsed ? '12px 9px' : '14px 12px 10px', display: 'flex', flexDirection: 'column', transition: 'width .15s', overflowY: 'auto', overflowX: 'hidden' }}>
      <RailLogo collapsed={collapsed} onToggle={onToggleCollapse} />
      <UserCard me={me} collapsed={collapsed} />
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
              <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#5E7186', fontWeight: 800, padding: '12px 10px 4px' }}>{g}</div>
            )}
            {collapsed && <div style={{ height: 1, background: 'rgba(255,255,255,.09)', margin: '8px 4px' }} />}
            {(!closed || collapsed) && items.map((m) => {
              const n = m.badge ? badges[m.badge] : undefined;
              const on = activeModule === m.id;
              const badgeBg = m.badge === 'newLeads' ? TEAL : m.badge === 'openRma' ? GOLD : '#58C08A';
              return (
                <button key={m.id} className={'tm-side-item' + (on ? ' on' : '')} title={`${m.label}${n ? ` (${n})` : ''} — Shift+click opens a new tab`}
                  onClick={(e) => open(m.id, undefined, { newTab: e.shiftKey })}>
                  <Icon name={m.icon} size={16} style={{ flexShrink: 0, transition: 'color .12s' }} />
                  {!collapsed && <span style={{ flex: 1 }}>{m.label}</span>}
                  {!collapsed && !!n && (
                    <span style={{ background: badgeBg, color: m.badge === 'openRma' ? '#3D2E10' : '#fff', borderRadius: 999, fontSize: 10.5, fontWeight: 800, padding: '1px 7px' }}>{n}</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
      {!collapsed && (
        <div style={{ marginTop: 'auto', paddingTop: 14 }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)', marginBottom: 10 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#5E7186', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, boxShadow: `0 0 6px ${TEAL}` }} />
            TwinMOS Console · 2026.1
          </div>
        </div>
      )}
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
    <div ref={ref} style={{ position: 'absolute', top: 50, left: 12, right: 12, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: '0 24px 64px rgba(10,22,40,.20)', padding: 18, zIndex: 40, maxHeight: '74vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <b style={{ color: INK, fontSize: 14 }}>All modules <span style={{ color: FAINT, fontWeight: 400 }}>— {modules.length} available · Shift+click opens in a new tab</span></b>
        <button className="tm-tab-x" onClick={onClose} title="Close"><Icon name="x" size={14} /></button>
      </div>
      {groups.map((g) => (
        <div key={g} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: FAINT, fontWeight: 800, margin: '4px 0 8px' }}>{g}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 8 }}>
            {modules.filter((m) => m.group === g).map((m) => {
              const n = m.badge ? badges[m.badge] : undefined;
              return (
                <button key={m.id} className="tm-mm-card" onClick={(e) => { open(m.id, undefined, { newTab: e.shiftKey }); onClose(); }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, flexShrink: 0, borderRadius: 9, background: TEAL + '1C', color: TEAL }}>
                    <Icon name={m.icon} size={15} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: INK, fontWeight: 700, fontSize: 13 }}>
                      {m.label}
                      {!!n && <span style={{ background: TEAL + '1C', color: '#0E9F7E', borderRadius: 999, fontSize: 10.5, fontWeight: 800, padding: '1px 7px' }}>{n}</span>}
                    </span>
                    <span style={{ display: 'block', color: MUTED, fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>{m.desc}</span>
                  </span>
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
    <header style={{ position: 'relative', height: 58, flexShrink: 0, background: '#fff', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', zIndex: 30 }}>
      <button className="tm-chipbtn" onClick={() => setMega((v) => !v)} title="Browse every module (mega menu)" style={{ flexShrink: 0 }}>
        <Icon name="grid" size={14} style={{ color: TEAL }} />Modules
        <Icon name="chevron" size={11} style={{ marginTop: 2 }} />
      </button>
      <button className="tm-searchbtn" onClick={onOpenSearch} title="Global search (Ctrl/⌘ + K)">
        <Icon name="search" size={14} />
        <span style={{ flex: 1, textAlign: 'left' }}>Search anything…</span>
        <kbd style={{ fontSize: 10, fontWeight: 700, border: `1px solid ${LINE}`, borderRadius: 5, padding: '1px 6px', color: FAINT, background: '#fff' }}>⌘K</kbd>
      </button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: FAINT, overflow: 'hidden', minWidth: 0 }}>
        {module && <>
          <span>{module.group}</span><span>/</span>
          <span style={{ color: INK, fontWeight: 700 }}>{module.label}</span>
          {tab?.ctx?.label && <><span>/</span><span style={{ color: TEAL_DK }}>{tab.ctx.label}</span></>}
        </>}
      </div>
      {me.user?.twoFactorEnabled
        ? <span title="Multi-factor authentication is active" style={{ display: 'flex', alignItems: 'center', gap: 5, color: GREEN, fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN }} />MFA on</span>
        : <button onClick={onMfaSetup} style={{ ...btn, background: GOLD + '22', color: '#8A6420', boxShadow: 'none', fontSize: 11, padding: '4px 9px', flexShrink: 0 }}>Enable MFA</button>}
      <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, paddingLeft: 4 }}>
        <Avatar email={me.user?.email} size={30} />
        <span style={{ lineHeight: 1.25 }}>
          <span style={{ display: 'block', fontSize: 12, color: INK, fontWeight: 700, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.user?.email}</span>
          <Badge value={me.user?.role ?? 'unknown'} />
        </span>
        <button onClick={signOut} title="Sign out" style={{ ...btn, background: '#F2F5F8', color: MUTED, boxShadow: 'none', fontWeight: 700, padding: '7px 11px' }}>Sign out</button>
      </span>
      {mega && <MegaMenu modules={visibleModules(me.user?.role)} badges={badges} open={open} onClose={() => setMega(false)} />}
    </header>
  );
}

function TabStrip({ tabs, activeId, onSelect, onClose }: {
  tabs: Tab[]; activeId: string; onSelect: (id: string) => void; onClose: (id: string) => void;
}) {
  return (
    <div role="tablist" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px 0', overflowX: 'auto', flexShrink: 0 }}>
      {tabs.map((t) => {
        const mod = MODULES.find((m) => m.id === t.module);
        const on = t.id === activeId;
        return (
          <div key={t.id} role="tab" aria-selected={on} className={'tm-tab' + (on ? ' on' : '')} style={{ flexShrink: 0 }}
            onClick={() => onSelect(t.id)}
            onMouseDown={(e) => { if (e.button === 1) { e.preventDefault(); onClose(t.id); } }}>
            {mod && <Icon name={mod.icon} size={13} style={{ color: on ? TEAL : FAINT }} />}
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', background: PAGE }}>
      <style>{shellCss}{globalCss}</style>
      <Sidebar modules={visible} activeModule={activeTab?.module ?? ''} badges={badges} me={me}
        collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} open={openTab} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar me={me} module={module} tab={activeTab} badges={badges} onOpenSearch={onOpenSearch}
          onSignOut={onSignOut} onMfaSetup={onMfaSetup} open={openTab} />
        <TabStrip tabs={tabs} activeId={activeTab?.id ?? ''} onSelect={setActiveId} onClose={closeTab} />
        <main className="tm-scroll-light" style={{ flex: 1, padding: 22, overflowX: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
