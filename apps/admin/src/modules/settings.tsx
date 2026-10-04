// Settings — redirects manager + key/value settings (menus live under the
// 'menus' key) + locales list. Admin+ for redirects/settings; super_admin for
// locale activation (docs/04 RBAC).
// 0025: menus get a VISUAL builder (per-group label/URL rows with add/remove/
// reorder — the raw-JSON textarea stays as an escape hatch); redirects gain
// search, from-path format validation, a live "test" link and a count badge;
// locales gain search, an active count and the hreflang note.
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { btn, btnGhost, Empty, Err, input, useAsync } from '../ui';

type Redirect = { id: number; from: string; to: string; code: number };
type Setting = { key: string; value: unknown; updatedAt: string };
type Locale = { code: string; name: string; dir: string; active: boolean };
type MenuDoc = Record<string, Array<{ label: string; url: string }>>;

export default function Settings({ canManage, isSuperAdmin }: { canManage: boolean; isSuperAdmin: boolean }) {
  const [tab, setTab] = useState<'redirects' | 'menus' | 'locales'>('redirects');
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Settings</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {(['redirects', 'menus', 'locales'] as const).map((t) => (
          <button key={t} style={tab === t ? btn : btnGhost} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {tab === 'redirects' && <Redirects canManage={canManage} />}
      {tab === 'menus' && <Menus canManage={canManage} />}
      {tab === 'locales' && <Locales isSuperAdmin={isSuperAdmin} />}
    </div>
  );
}

// ---- redirects ------------------------------------------------------------

function Redirects({ canManage }: { canManage: boolean }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [code, setCode] = useState('301');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [q, setQ] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { data, error: loadError, loading, reload } = useAsync<{ items: Redirect[] }>(() => apiGet('/admin/redirects'), []);

  const items = (data?.items ?? []).filter((r) =>
    !q.trim() || r.from.toLowerCase().includes(q.trim().toLowerCase()) || r.to.toLowerCase().includes(q.trim().toLowerCase()));

  function validate(): string | null {
    if (!from.startsWith('/')) return '"From" must start with "/" (a site-relative path).';
    if (!to.startsWith('/') && !/^https?:\/\//.test(to)) return '"To" must start with "/" or be a full http(s) URL.';
    if (from === to) return 'Source and destination are the same.';
    return null;
  }

  async function add() {
    const v = validate();
    setFormError(v);
    if (v) return;
    setBusy(true); setError(null);
    try {
      await apiSend('POST', '/admin/redirects', { from: from.trim(), to: to.trim(), code: Number(code) });
      setFrom(''); setTo(''); reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }
  async function remove(id: number) {
    setBusy(true); setError(null);
    try { await apiSend('DELETE', `/admin/redirects/${id}`, {}); reload(); }
    catch (e) { setError(e); } finally { setBusy(false); }
  }

  const WEB = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/v1$/, '') || 'http://localhost:4321';
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 10px', flexWrap: 'wrap' }}>
        <input style={{ ...input, width: 220 }} placeholder="Search from / to…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span style={{ fontSize: 12.5, color: '#66748A' }}>{data?.items.length ?? 0} redirect{(data?.items.length ?? 0) === 1 ? '' : 's'} configured</span>
      </div>
      {canManage && (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
          <input style={input} placeholder="/old-path" value={from} onChange={(e) => { setFrom(e.target.value); setFormError(null); }} />
          <input style={{ ...input, flex: '1 1 220px' }} placeholder="/new-path or https://…" value={to} onChange={(e) => { setTo(e.target.value); setFormError(null); }} />
          <select style={input} value={code} onChange={(e) => setCode(e.target.value)} title="301 permanent · 302 temporary · 308 permanent, keep method">
            <option>301</option><option>302</option><option>308</option>
          </select>
          <button style={btn} disabled={busy || !from || !to} onClick={add}>Add</button>
        </div>
      )}
      {formError && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px', fontSize: 13 }}>{formError}</p>}
      {error ? <Err error={error} /> : null}
      {loadError ? <Err error={loadError} /> : loading ? <p>Loading…</p> : data ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>{['From', 'To', 'Code', 'Hits', ''].map((h) => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E6EBF1' }}>{h}</th>)}</tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7', fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>{r.from}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7', fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>{r.to}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}><b>{r.code}</b></td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  <a href={WEB + r.from} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#0F766E' }} title="Open the source path and watch it redirect">test ↗</a>
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  {canManage && <button style={btnGhost} disabled={busy} onClick={() => remove(r.id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {data && items.length === 0 && <Empty text={q ? 'No redirects match.' : 'No redirects configured.'} />}
    </div>
  );
}

// ---- menus ----------------------------------------------------------------

const SAMPLE_MENUS: MenuDoc = {
  main: [
    { label: 'Products', url: '/shop.html' },
    { label: 'Solutions', url: '/solutions.html' },
    { label: 'Support', url: '/support.html' },
  ],
  footer: [
    { label: 'About', url: '/about.html' },
    { label: 'Careers', url: '/careers.html' },
  ],
};

function Menus({ canManage }: { canManage: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: Setting[] }>(() => apiGet('/admin/settings'), []);
  const menusSetting = data?.items.find((s) => s.key === 'menus');
  const saved = (menusSetting?.value as MenuDoc) ?? SAMPLE_MENUS;
  const [draft, setDraft] = useState<MenuDoc | null>(null); // visual edits
  const [raw, setRaw] = useState(false); // JSON escape hatch
  const [rawText, setRawText] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const doc = draft ?? saved;
  const text = rawText || JSON.stringify(doc, null, 2);

  function edit(next: MenuDoc) { setDraft(next); setRawText(''); }
  function setGroup(g: string, rows: Array<{ label: string; url: string }>) { edit({ ...doc, [g]: rows }); }
  function moveRow(g: string, i: number, dir: -1 | 1) {
    const rows = [...(doc[g] ?? [])];
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    setGroup(g, rows);
  }

  async function save() {
    setBusy(true); setSaveError(null);
    try {
      const value = raw ? JSON.parse(text) : doc;
      await apiSend('PUT', '/admin/settings', { key: 'menus', value });
      setDraft(null); setRaw(false); setRawText('');
      setSavedAt(new Date().toLocaleTimeString());
      reload();
    } catch (e) { setSaveError(e instanceof SyntaxError ? new Error('Invalid JSON: ' + e.message) : e); } finally { setBusy(false); }
  }

  if (error) return <Err error={error} />;
  if (loading) return <p>Loading…</p>;
  const groups = Object.keys(doc);
  const dirty = draft != null || (raw && rawText !== '' && rawText !== JSON.stringify(doc, null, 2));
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#93A0B4' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 10px', flexWrap: 'wrap' }}>
        <p style={{ color: '#66748A', margin: 0, flex: 1, fontSize: 13 }}>
          Site menus — {groups.length} group{groups.length === 1 ? '' : 's'} · {groups.reduce((s, g) => s + (doc[g]?.length ?? 0), 0)} link slots.
          The site build consumes this at P4 localization.
        </p>
        {canManage && (
          <button style={{ ...btnGhost, fontWeight: raw ? 800 : 400 }} onClick={() => { setRaw(!raw); setRawText(raw ? '' : JSON.stringify(doc, null, 2)); }}>
            {'{ } JSON'}
          </button>
        )}
        {canManage && <button style={btn} disabled={busy || !dirty} onClick={save}>{busy ? 'Saving…' : 'Save menus'}</button>}
      </div>
      {savedAt && !dirty && <p style={{ color: '#1F9D62', fontSize: 12.5, margin: '0 0 8px' }}>Saved at {savedAt}{menusSetting?.updatedAt ? ` (previously ${fmtDate(menusSetting.updatedAt)})` : ''}</p>}
      {saveError ? <Err error={saveError} /> : null}
      {raw ? (
        <textarea style={{ ...input, minHeight: 260, fontFamily: 'ui-monospace, monospace', fontSize: 13 }} value={text} onChange={(e) => setRawText(e.target.value)} disabled={!canManage} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 12 }}>
          {groups.map((g) => (
            <div key={g} style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <b style={{ ...labelStyle, fontSize: 12, color: '#1F2A37', flex: 1 }}>{g}</b>
                <span style={{ fontSize: 11, color: '#93A0B4' }}>{doc[g]?.length ?? 0} slots</span>
                {canManage && (
                  <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} title="Delete this menu group (and its slots)"
                    onClick={() => { if (window.confirm(`Delete the "${g}" menu group?`)) { const next = { ...doc }; delete next[g]; edit(next); } }}>✕</button>
                )}
              </div>
              {(doc[g] ?? []).map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 22px 22px 22px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <input style={{ ...input, padding: '5px 8px', fontSize: 12.5 }} placeholder="Label" value={row.label} disabled={!canManage}
                    onChange={(e) => setGroup(g, (doc[g] ?? []).map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))} />
                  <input style={{ ...input, padding: '5px 8px', fontSize: 12.5, fontFamily: 'ui-monospace, monospace' }} placeholder="/url" value={row.url} disabled={!canManage}
                    onChange={(e) => setGroup(g, (doc[g] ?? []).map((r, j) => (j === i ? { ...r, url: e.target.value } : r)))} />
                  <button title="Move up" disabled={!canManage || i === 0} onClick={() => moveRow(g, i, -1)} style={{ border: 0, background: 'none', color: i === 0 ? '#D5DDE7' : '#66748A', cursor: canManage && i > 0 ? 'pointer' : 'default', fontSize: 13 }}>↑</button>
                  <button title="Move down" disabled={!canManage || i === (doc[g]?.length ?? 0) - 1} onClick={() => moveRow(g, i, 1)} style={{ border: 0, background: 'none', color: i === (doc[g]?.length ?? 0) - 1 ? '#D5DDE7' : '#66748A', cursor: canManage && i < (doc[g]?.length ?? 0) - 1 ? 'pointer' : 'default', fontSize: 13 }}>↓</button>
                  <button title="Remove" disabled={!canManage} onClick={() => setGroup(g, (doc[g] ?? []).filter((_, j) => j !== i))} style={{ border: 0, background: 'none', color: '#C2453C', cursor: canManage ? 'pointer' : 'default', fontSize: 12 }}>✕</button>
                </div>
              ))}
              {canManage && (
                <button style={{ ...btnGhost, fontSize: 12, marginTop: 4 }} onClick={() => setGroup(g, [...(doc[g] ?? []), { label: '', url: '' }])}>+ Add slot</button>
              )}
            </div>
          ))}
          {canManage && (
            <div style={{ border: '1px dashed #E6EBF1', borderRadius: 12, padding: 12, display: 'grid', gap: 8, alignContent: 'start' }}>
              <b style={{ ...labelStyle, fontSize: 12, color: '#1F2A37' }}>New group</b>
              <NewGroupInput onAdd={(name) => edit({ ...doc, [name]: [{ label: '', url: '' }] })} existing={groups} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewGroupInput({ onAdd, existing }: { onAdd: (name: string) => void; existing: string[] }) {
  const [name, setName] = useState('');
  const valid = name.trim() && /^[a-z][a-z0-9-]*$/.test(name.trim()) && !existing.includes(name.trim());
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input style={{ ...input, flex: 1 }} placeholder="group-id (e.g. legal)" value={name} onChange={(e) => setName(e.target.value)} />
      <button style={btn} disabled={!valid} title={name && !valid ? 'Lowercase letters/digits/dashes, unique' : undefined}
        onClick={() => { onAdd(name.trim()); setName(''); }}>Add group</button>
    </div>
  );
}

// ---- locales ---------------------------------------------------------------

function Locales({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [q, setQ] = useState('');
  const { data, error, loading, reload } = useAsync<{ items: Locale[] }>(() => apiGet('/admin/locales'), []);
  const [busy, setBusy] = useState(false);
  async function toggle(code: string, active: boolean) {
    setBusy(true);
    try { await apiSend('PATCH', `/admin/locales/${code}`, { active }); reload(); }
    finally { setBusy(false); }
  }
  const items = (data?.items ?? []).filter((l) =>
    !q.trim() || l.code.includes(q.trim().toLowerCase()) || l.name.toLowerCase().includes(q.trim().toLowerCase()));
  const active = (data?.items ?? []).filter((l) => l.active).length;
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 10px', flexWrap: 'wrap' }}>
        <input style={{ ...input, width: 200 }} placeholder="Search code or name…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span style={{ fontSize: 12.5, color: '#66748A' }}>
          <b>{active}</b> of {data?.items.length ?? 0} active — active locales receive hreflang alternates in the site build
          {(data?.items ?? []).some((l) => l.dir === 'rtl' && l.active) ? ' (includes RTL — verified in the P4 parity audit)' : ''}.
        </span>
      </div>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <table style={{ borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>{['Code', 'Name', 'Direction', 'Active', ''].map((h) => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E6EBF1' }}>{h}</th>)}</tr></thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.code} style={{ background: l.active ? undefined : '#FAFBFC' }}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}><b>{l.code}</b></td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.name}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.dir === 'rtl' ? <b style={{ color: '#B45309' }}>rtl</b> : 'ltr'}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.active ? '✓' : '—'}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  {isSuperAdmin && <button style={btnGhost} disabled={busy} onClick={() => toggle(l.code, !l.active)}>{l.active ? 'Deactivate' : 'Activate'}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {data && items.length === 0 && <Empty text="No locales match." />}
    </div>
  );
}
