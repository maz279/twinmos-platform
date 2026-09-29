// Search workspace (P8 iteration 2) — the full-page home of global search:
// type the query here, see grouped results in place, filter by entity type,
// and jump to any hit. The ⌘K palette remains the quick-jump entry; this page
// is the "search window" for sustained lookup work (deep-link ctx { kind:'q', id }).
import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api';
import { Empty, Err, input } from '../ui';
import { Icon } from '../icons';
import { MODULES } from '../nav';
import type { ModProps } from '../nav';

type Hit = { id: number; title: string; sub?: string; module: string; kind: string };
type Group = { type: string; items: Hit[] };

const KIND_ICON: Record<string, string> = {
  article: 'doc', page: 'doc', news: 'doc', faq: 'doc',
  product: 'layers', lead: 'inbox', rma: 'tool', application: 'briefcase', posting: 'briefcase', media: 'image',
  compat: 'shield', q: 'search',
};

export default function SearchPage({ ctx, nav }: ModProps) {
  const [q, setQ] = useState(ctx?.kind === 'q' ? (ctx.id ?? '') : '');
  const [groups, setGroups] = useState<Group[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [type, setType] = useState('');

  useEffect(() => {
    if (q.trim().length < 2) { setGroups([]); setError(null); return; }
    setBusy(true);
    apiGet<{ groups: Group[] }>(`/admin/search?q=${encodeURIComponent(q.trim())}`)
      .then((d) => setGroups(d?.groups ?? []))
      .catch((e) => setError(e))
      .finally(() => setBusy(false));
  }, [q]);

  const allTypes = useMemo(() => groups.map((g) => g.type), [groups]);
  const shown = type ? groups.filter((g) => g.type === type) : groups;
  const total = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div>
      <h1 style={{ margin: '0 0 2px', fontSize: 22 }}>Search</h1>
      <p style={{ margin: '0 0 14px', color: '#66748A', fontSize: 13 }}>
        Everything manageable, one query — leads, products, content, RMA, applications and media. ⌘K opens the quick palette anywhere.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input autoFocus style={{ ...input, flex: 1, fontSize: 15, padding: '10px 12px' }}
          placeholder="Search by reference, SKU, title, email, asset name…" value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button style={{ ...input, background: '#F2F5F8', cursor: 'pointer' }} onClick={() => { setQ(''); setType(''); }}>Clear</button>}
      </div>

      {q.trim().length < 2 && <Empty text="Type at least 2 characters to search." />}
      {error ? <Err error={error} /> : null}
      {q.trim().length >= 2 && !busy && total === 0 && !error && <Empty text={`No matches for “${q.trim()}”.`} />}

      {allTypes.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0 12px' }}>
          <button onClick={() => setType('')} style={chip(!type)}>All ({total})</button>
          {allTypes.map((t) => {
            const n = groups.find((g) => g.type === t)!.items.length;
            return <button key={t} onClick={() => setType(t)} style={chip(type === t)}>{t} ({n})</button>;
          })}
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {shown.map((g) => (
          <div key={g.type} style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: '10px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#93A0B4', margin: '4px 0 8px' }}>{g.type}</div>
            {g.items.map((h) => (
              <button key={`${h.kind}-${h.id}`} onClick={() => nav(h.module, { kind: h.kind, id: String(h.id), label: h.title })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '8px 8px', border: 0, borderRadius: 8, background: 'transparent', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#E7F7F2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <Icon name={(KIND_ICON[h.kind] ?? 'search') as 'doc'} size={15} style={{ color: '#0E9F7E', flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', color: '#1F2A37', fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</b>
                  {h.sub && <span style={{ display: 'block', color: '#93A0B4', fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.sub}</span>}
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, color: '#0E9F7E', background: '#E7F7F2', borderRadius: 5, padding: '2px 6px', flexShrink: 0 }}>
                  {(MODULES.find((m) => m.id === h.module)?.label ?? h.module).toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {busy && total === 0 && <p style={{ color: '#93A0B4', fontSize: 12.5 }}>Searching…</p>}
    </div>
  );
}

function chip(on: boolean): React.CSSProperties {
  return { border: on ? '1px solid #1DBF9F' : '1px solid #E6EBF1', background: on ? '#E7F7F2' : '#fff', color: on ? '#0E9F7E' : '#66748A', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: on ? 800 : 500, cursor: 'pointer' };
}
