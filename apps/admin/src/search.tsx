// ⌘K global search palette (P2) — unified entity search over GET /admin/search
// plus client-side module navigation and recent items. Keyboard-first: ↑↓ select,
// Enter opens (Shift+Enter = new tab), Esc closes. Results deep-link into tabs
// via the cross-nav handle, so a hit on a lead opens the Leads tab focused on it.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiGet } from './api';
import { Icon } from './icons';
import { MODULES } from './nav';
import type { NavOpen } from './nav';

type Hit = { id: number; title: string; sub?: string; module: string; kind: string };
type Row =
  | { sel: 'module'; id: string; module: string; title: string; sub: string }
  | { sel: 'entity'; id: string; module: string; kind: string; title: string; sub: string };
type Recent = { module: string; kind: string; id?: string; title: string };

const RECENTS_KEY = 'tm.search.recent';
function loadRecents(): Recent[] { try { return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]') as Recent[]; } catch { return []; } }
function pushRecent(r: Recent) {
  try {
    const next = [r, ...loadRecents().filter((x) => !(x.module === r.module && x.id === r.id))].slice(0, 8);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch { /* private mode */ }
}

export default function SearchPalette({ onClose, open }: { onClose: () => void; open: NavOpen }) {
  const [q, setQ] = useState('');
  const [groups, setGroups] = useState<Array<{ type: string; items: Hit[] }>>([]);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // debounced server search (≥2 chars)
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length < 2) { setGroups([]); setBusy(false); return; }
      setBusy(true);
      apiGet<{ groups: Array<{ type: string; items: Hit[] }> }>(`/admin/search?q=${encodeURIComponent(q.trim())}`)
        .then((d) => setGroups(d?.groups ?? []))
        .catch(() => setGroups([]))
        .finally(() => setBusy(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const moduleRows: Row[] = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return MODULES
      .filter((m) => m.label.toLowerCase().includes(needle) || m.group.toLowerCase().includes(needle) || m.desc.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((m) => ({ sel: 'module', id: m.id, module: m.id, title: m.label, sub: m.desc }));
  }, [q]);

  const entityRows: Row[] = useMemo(() =>
    groups.flatMap((g) => g.items.map((h) => ({ sel: 'entity', id: `${h.kind}:${h.id}`, module: h.module, kind: h.kind, title: h.title, sub: h.sub ?? g.type }))),
    [groups]);

  const recentRows: Row[] = useMemo(() =>
    q.trim() ? [] : loadRecents().map((r) => ({ sel: 'entity', id: `${r.kind}:${r.id ?? ''}`, module: r.module, kind: r.kind, title: r.title, sub: 'recent' })),
    [q]);

  const rows: Row[] = useMemo(() => [...moduleRows, ...entityRows, ...recentRows], [moduleRows, entityRows, recentRows]);
  useEffect(() => { setActive(0); }, [rows.length, q]);

  function fire(row: Row, newTab: boolean) {
    if (row.sel === 'module') open(row.module, undefined, { newTab });
    else {
      open(row.module, { kind: row.kind, id: row.id.split(':')[1], label: row.title }, { newTab });
      pushRecent({ module: row.module, kind: row.kind, id: row.id.split(':')[1], title: row.title });
    }
    onClose();
  }

  function key(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, rows.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && rows[active]) { e.preventDefault(); fire(rows[active], e.shiftKey); }
  }

  const modLabel = (id: string) => MODULES.find((m) => m.id === id)?.label ?? id;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,.45)', display: 'grid', alignItems: 'start', justifyContent: 'center', paddingTop: '11vh', zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Global search" onKeyDown={key}
        style={{ width: 'min(620px, 92vw)', background: '#fff', borderRadius: 14, boxShadow: '0 30px 80px rgba(2,12,28,.5)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #E3EBF3' }}>
          <Icon name="search" size={17} style={{ color: '#1DBF9F' }} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, products, content, RMA, media… or jump to a module"
            style={{ flex: 1, border: 0, outline: 'none', fontSize: 15.5, color: '#1F2A37' }} />
          {busy && <span style={{ fontSize: 11.5, color: '#8CA3BA' }}>searching…</span>}
          <kbd style={{ fontSize: 10.5, border: '1px solid #D9E4EF', borderRadius: 5, padding: '1px 6px', color: '#8CA3BA' }}>esc</kbd>
        </div>
        <div style={{ maxHeight: '52vh', overflowY: 'auto' }}>
          {rows.length === 0 && (
            <div style={{ padding: '22px 18px', color: '#8CA3BA', fontSize: 13.5 }}>
              {q.trim().length >= 2 ? 'No matches. Try a lead reference, product SKU, article title or email.' : 'Type to search — results open in workspace tabs. Shift+Enter opens a new tab.'}
            </div>
          )}
          {moduleRows.length > 0 && <SectionLabel>Jump to module</SectionLabel>}
          {rows.map((row, i) => {
            const on = i === active;
            const isModule = row.sel === 'module';
            return (
              <button key={`${row.sel}-${row.id}-${i}`} onClick={(e) => fire(row, e.shiftKey)} onMouseEnter={() => setActive(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '9px 16px', border: 0, cursor: 'pointer', background: on ? '#E7F7F2' : '#fff' }}>
                <Icon name={MODULES.find((m) => m.id === row.module)?.icon ?? 'search'} size={15} style={{ color: isModule ? '#0E9F7E' : '#93A0B4', flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', color: '#1F2A37', fontSize: 13.5, fontWeight: isModule ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.title}</span>
                  <span style={{ display: 'block', color: '#8CA3BA', fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.sub}</span>
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, color: '#0E9F7E', background: '#E7F7F2', borderRadius: 5, padding: '2px 6px', flexShrink: 0 }}>{modLabel(row.module).toUpperCase()}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '9px 16px', borderTop: '1px solid #E3EBF3', background: '#F7FAFD', color: '#8CA3BA', fontSize: 11.5 }}>
          <span>↑↓ navigate</span><span>↵ open</span><span>⇧↵ new tab</span><span>esc close</span>
          <button onClick={() => { open('search', { kind: 'q', id: q.trim(), label: q.trim() ? `Search: ${q.trim()}` : 'Search' }); onClose(); }}
            style={{ marginLeft: 'auto', border: '1px solid #E6EBF1', background: '#fff', borderRadius: 7, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, color: '#0E9F7E', cursor: 'pointer' }}>
            Open full search ↗
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '8px 16px 2px', fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8CA3BA' }}>{children}</div>;
}
