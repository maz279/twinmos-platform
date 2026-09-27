// P5 Partners admin — channel organizations (approve/suspend, members, gated
// asset upload) + anti-counterfeit SN-check report. Docs/04 §Channel.
import React, { useRef, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';

type Org = { id: number; name: string; type: string; status: string; country: string | null; contactEmail: string | null; memberCount: number; createdAt: string };
type Member = { id: number; userId: string; email: string; role: string };
type Asset = { id: number; category: string; title: string; mime: string; bytes: number; createdAt: string };
type SnReport = {
  window: { from: string; to: string }; total: number; byResult: Record<string, number>;
  topSerials: Array<{ serial: string; checks: number }>;
  recent: Array<{ id: number; serial: string; sku: string | null; result: string; ip: string | null; checkedAt: string }>;
};

export default function Partners({ canManage }: { canManage: boolean }) {
  const [tab, setTab] = useState<'orgs' | 'sn'>('orgs');
  return (
    <div>
      <h1>Partners</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button style={tab === 'orgs' ? btn : btnGhost} onClick={() => setTab('orgs')}>Organizations</button>
        <button style={tab === 'sn' ? btn : btnGhost} onClick={() => setTab('sn')}>SN-check report</button>
      </div>
      {tab === 'orgs' && <Orgs canManage={canManage} />}
      {tab === 'sn' && <SnChecks />}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = { active: '#047857', pending: '#B7791F', suspended: '#DC2626' };

function Orgs({ canManage }: { canManage: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: Org[] }>(() => apiGet('/admin/partner-orgs'), []);
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState<unknown>(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('distributor');

  async function setStatus(id: number, status: string) {
    setBusy(true); setError2(null);
    try { await apiSend('PATCH', `/admin/partner-orgs/${id}`, { status }); reload(); }
    catch (e) { setError2(e); } finally { setBusy(false); }
  }
  async function create() {
    setBusy(true); setError2(null);
    try { await apiSend('POST', '/admin/partner-orgs', { name: newName, type: newType }); setNewName(''); reload(); }
    catch (e) { setError2(e); } finally { setBusy(false); }
  }

  return (
    <div>
      {canManage && (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
          <input style={{ ...input, flex: '1 1 220px' }} placeholder="New organization name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <select style={input} value={newType} onChange={(e) => setNewType(e.target.value)}>
            <option value="distributor">distributor</option><option value="oem">oem</option><option value="si">si</option>
          </select>
          <button style={btn} disabled={busy || !newName.trim()} onClick={create}>Add org</button>
        </div>
      )}
      {error ? <Err error={error} /> : error2 ? <Err error={error2} /> : loading ? <p>Loading…</p> : data ? (
        <Table head={['Org', 'Type', 'Status', 'Members', 'Created', '']}>
          {data.items.map((o) => (
            <tr key={o.id}>
              <td style={td}><b>{o.name}</b><div style={{ color: '#5E7691', fontSize: 12 }}>{o.country ?? '—'}</div></td>
              <td style={td}>{o.type}</td>
              <td style={td}><span style={{ color: STATUS_TONE[o.status] ?? '#64748B', fontWeight: 700 }}>{o.status}</span></td>
              <td style={td}>{o.memberCount}</td>
              <td style={td}>{fmtDate(o.createdAt)}</td>
              <td style={td}>
                {canManage && (
                  <>
                    {o.status !== 'active' && <button style={btnGhost} disabled={busy} onClick={() => setStatus(o.id, 'active')}>Activate</button>}
                    {o.status === 'active' && <button style={btnGhost} disabled={busy} onClick={() => setStatus(o.id, 'suspended')}>Suspend</button>}
                    <button style={{ ...btnGhost, marginLeft: 6 }} onClick={() => setOpenId(openId === o.id ? null : o.id)}>Manage</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No partner organizations yet." />}
      {openId != null && canManage && <OrgDetail id={openId} onChanged={reload} />}
    </div>
  );
}

function OrgDetail({ id, onChanged }: { id: number; onChanged: () => void }) {
  const { data, error, loading, reload } = useAsync<{ items: Member[] }>(() => apiGet(`/admin/partner-orgs/${id}/members`), [id]);
  const { data: assets, reload: reloadAssets } = useAsync<{ items: Asset[] }>(() => apiGet(`/admin/partner-assets?org=${id}`), [id]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('price_file');
  const [types, setTypes] = useState('distributor');
  const [memberEmail, setMemberEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  async function addMember() {
    setBusy(true); setErr(null);
    try { await apiSend('POST', `/admin/partner-orgs/${id}/members`, { email: memberEmail, role: 'staff' }); setMemberEmail(''); reload(); onChanged(); }
    catch (e) { setErr(e); } finally { setBusy(false); }
  }
  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) { setErr(new Error('File and title required.')); return; }
    setBusy(true); setErr(null);
    try {
      const form = new FormData();
      form.append('file', file); form.append('title', title); form.append('category', category); form.append('visibleToTypes', types);
      const res = await fetch((import.meta.env.VITE_API_URL ?? '/api/v1') + `/admin/partner-orgs/${id}/assets`, {
        method: 'POST', credentials: 'include', body: form,
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.detail || b.title || ('HTTP ' + res.status)); }
      setTitle(''); if (fileRef.current) fileRef.current.value = '';
      reloadAssets();
    } catch (e) { setErr(e); } finally { setBusy(false); }
  }

  return (
    <div style={{ marginTop: 16, border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, background: '#F8FAFC' }}>
      <b>Members</b>
      {err ? <Err error={err} /> : null}
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : (
        <>
          {(data?.items ?? []).map((m) => (
            <div key={m.id} style={{ fontSize: 13.5, padding: '4px 0' }}>{m.email} · {m.role}</div>
          ))}
          {data && data.items.length === 0 && <p style={{ color: '#5E7691', fontSize: 13 }}>No members — add the partner's site account email.</p>}
        </>
      )}
      <div style={{ display: 'flex', gap: 8, margin: '8px 0 16px' }}>
        <input style={{ ...input, flex: 1 }} placeholder="member email (existing site account)" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
        <button style={btnGhost} disabled={busy || !memberEmail} onClick={addMember}>Add member</button>
      </div>

      <b>Gated assets</b>
      <Table head={['Category', 'Title', 'Size', 'Created']}>
        {(assets?.items ?? []).map((a) => (
          <tr key={a.id}><td style={td}>{a.category}</td><td style={td}>{a.title}</td><td style={td}>{a.bytes ? Math.round(a.bytes / 1024) + ' KB' : '—'}</td><td style={td}>{fmtDate(a.createdAt)}</td></tr>
        ))}
      </Table>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <input ref={fileRef} type="file" style={input} />
        <input style={{ ...input, flex: '1 1 160px' }} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select style={input} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="price_file">price_file</option><option value="mdf">mdf</option><option value="resource">resource</option>
        </select>
        <select style={input} value={types} onChange={(e) => setTypes(e.target.value)}>
          <option value="distributor">distributor</option><option value="oem">oem</option><option value="si">si</option>
          <option value="distributor,oem,si">all types</option>
        </select>
        <button style={btnGhost} disabled={busy} onClick={upload}>Upload</button>
      </div>
    </div>
  );
}

function SnChecks() {
  const { data, error, loading } = useAsync<SnReport>(() => apiGet('/admin/sn-checks'), []);
  if (loading) return <p>Loading…</p>;
  if (error) return <Err error={error} />;
  if (!data) return null;
  return (
    <div>
      <p style={{ color: '#5E7691' }}>Window: {fmtDate(data.window.from)} → {fmtDate(data.window.to)} · <b>{data.total}</b> checks ({data.byResult.valid ?? 0} valid / {data.byResult.unverified ?? 0} unverified)</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h3>Top serials</h3>
          {data.topSerials.map((s) => (
            <div key={s.serial} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEF2F6', padding: '6px 2px', fontSize: 13.5 }}>
              <span>{s.serial}</span><b>{s.checks}</b>
            </div>
          ))}
        </div>
        <div>
          <h3>Recent checks</h3>
          <Table head={['Serial', 'Result', 'IP', 'When']}>
            {data.recent.slice(0, 15).map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.serial}{r.sku ? <span style={{ color: '#5E7691' }}> ({r.sku})</span> : null}</td>
                <td style={td}><Badge value={r.result} /></td>
                <td style={{ ...td, color: '#5E7691', fontSize: 12 }}>{r.ip ?? '—'}</td>
                <td style={td}>{fmtDate(r.checkedAt)}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
}
