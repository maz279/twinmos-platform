// Settings — redirects manager + key/value settings (menus live under the
// 'menus' key) + locales list. Admin+ for redirects/settings; super_admin for
// locale activation (docs/04 RBAC).
import React, { useState } from 'react';
import { apiGet, apiSend } from '../api';
import { btn, btnGhost, Empty, Err, input, useAsync } from '../ui';

type Redirect = { id: number; from: string; to: string; code: number };
type Setting = { key: string; value: unknown; updatedAt: string };
type Locale = { code: string; name: string; dir: string; active: boolean };

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

function Redirects({ canManage }: { canManage: boolean }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [code, setCode] = useState('301');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { data, error: loadError, loading, reload } = useAsync<{ items: Redirect[] }>(() => apiGet('/admin/redirects'), []);
  async function add() {
    setBusy(true); setError(null);
    try {
      await apiSend('POST', '/admin/redirects', { from, to, code: Number(code) });
      setFrom(''); setTo(''); reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }
  async function remove(id: number) {
    setBusy(true); setError(null);
    try { await apiSend('DELETE', `/admin/redirects/${id}`, {}); reload(); }
    catch (e) { setError(e); } finally { setBusy(false); }
  }
  return (
    <div>
      {canManage && (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
          <input style={input} placeholder="/old-path" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input style={{ ...input, flex: '1 1 220px' }} placeholder="/new-path" value={to} onChange={(e) => setTo(e.target.value)} />
          <select style={input} value={code} onChange={(e) => setCode(e.target.value)}>
            <option>301</option><option>302</option><option>308</option>
          </select>
          <button style={btn} disabled={busy || !from || !to} onClick={add}>Add</button>
        </div>
      )}
      {error ? <Err error={error} /> : null}
      {loadError ? <Err error={loadError} /> : loading ? <p>Loading…</p> : data ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>{['From', 'To', 'Code', ''].map((h) => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E6EBF1' }}>{h}</th>)}</tr></thead>
          <tbody>
            {data.items.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{r.from}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{r.to}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{r.code}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  {canManage && <button style={btnGhost} disabled={busy} onClick={() => remove(r.id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No redirects configured." />}
    </div>
  );
}

const SAMPLE_MENUS = {
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
  const [draft, setDraft] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const text = draft || JSON.stringify((menusSetting?.value as unknown) ?? SAMPLE_MENUS, null, 2);

  async function save() {
    setBusy(true); setSaveError(null);
    try {
      JSON.parse(text); // validate before sending
      await apiSend('PUT', '/admin/settings', { key: 'menus', value: JSON.parse(text) });
      setDraft('');
      reload();
    } catch (e) { setSaveError(e instanceof SyntaxError ? new Error('Invalid JSON: ' + e.message) : e); } finally { setBusy(false); }
  }
  return (
    <div>
      <p style={{ color: '#66748A' }}>Menus are stored as a settings document (label/url per slot). The site build consumes this at P4 localization.</p>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : (
        <>
          <textarea style={{ ...input, minHeight: 260, fontFamily: 'ui-monospace, monospace', fontSize: 13 }} value={text} onChange={(e) => setDraft(e.target.value)} disabled={!canManage} />
          {saveError ? <Err error={saveError} /> : null}
          {canManage && <button style={{ ...btn, marginTop: 8 }} disabled={busy} onClick={save}>Save menus</button>}
        </>
      )}
    </div>
  );
}

function Locales({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: Locale[] }>(() => apiGet('/admin/locales'), []);
  const [busy, setBusy] = useState(false);
  async function toggle(code: string, active: boolean) {
    setBusy(true);
    try { await apiSend('PATCH', `/admin/locales/${code}`, { active }); reload(); }
    finally { setBusy(false); }
  }
  return (
    <div>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <table style={{ borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>{['Code', 'Name', 'Direction', 'Active', ''].map((h) => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E6EBF1' }}>{h}</th>)}</tr></thead>
          <tbody>
            {data.items.map((l) => (
              <tr key={l.code}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}><b>{l.code}</b></td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.name}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.dir}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{l.active ? '✓' : '—'}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  {isSuperAdmin && <button style={btnGhost} disabled={busy} onClick={() => toggle(l.code, !l.active)}>{l.active ? 'Deactivate' : 'Activate'}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
