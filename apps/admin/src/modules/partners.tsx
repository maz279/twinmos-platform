// P5 + 0020 Partners admin — channel organizations (approve/suspend, members,
// gated assets) AND the where-to-buy directory (distributors + verified
// marketplaces) that feeds the public locator through the export/merge bridge.
// The standalone SN-check tab moved to the dedicated "SN-check & serials"
// module (Channel & Partners group).
import React, { useRef, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, Toolbar, useAsync, usePanelScroll } from '../ui';
import { DISTRIBUTOR_REGIONS, DISTRIBUTOR_REGION_LABELS, DISTRIBUTOR_STATUSES, DISTRIBUTOR_STATUS_LABELS } from '@twinmos/shared';

type Org = { id: number; name: string; type: string; status: string; country: string | null; contactEmail: string | null; memberCount: number; createdAt: string };
type Member = { id: number; userId: string; email: string; role: string };
type Asset = { id: number; category: string; title: string; mime: string; bytes: number; createdAt: string };
type Distributor = {
  id: number; name: string; country: string; region: string; status: string;
  cities: string[] | null; contact: Record<string, string> | null; note: string | null; createdAt: string;
};
type Listing = { id: number; platform: string; url: string; country: string | null; verifiedAt: string | null; createdAt: string };

export default function Partners({ canManage }: { canManage: boolean }) {
  const [tab, setTab] = useState<'orgs' | 'directory'>('orgs');
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Partners &amp; channel</h1>
      <p style={{ color: '#66748A', fontSize: 13, margin: '4px 0 0' }}>
        Portal organizations (approve/suspend, members, gated assets) and the public where-to-buy directory.
        Serial registry &amp; counterfeit anomaly scans live in <b>SN-check &amp; serials</b>.
      </p>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button style={tab === 'orgs' ? btn : btnGhost} onClick={() => setTab('orgs')}>Portal organizations</button>
        <button style={tab === 'directory' ? btn : btnGhost} onClick={() => setTab('directory')}>Where-to-buy directory</button>
      </div>
      {tab === 'orgs' && <Orgs canManage={canManage} />}
      {tab === 'directory' && <Directory canWrite={canManage} />}
    </div>
  );
}

// ---- portal organizations -----------------------------------------------------

const STATUS_TONE: Record<string, string> = { active: '#047857', pending: '#B7791F', suspended: '#DC2626' };

function Orgs({ canManage }: { canManage: boolean }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState({ q: '', type: '', status: '' });
  const qs = new URLSearchParams();
  if (query.q) qs.set('q', query.q);
  if (query.type) qs.set('type', query.type);
  if (query.status) qs.set('status', query.status);
  const { data, error, loading, reload } = useAsync<{ items: Org[] }>(() => apiGet('/admin/partner-orgs?' + qs.toString()), [query.q, query.type, query.status]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState<unknown>(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('distributor');
  const [newCountry, setNewCountry] = useState('');
  const [newEmail, setNewEmail] = useState('');

  async function setStatus2(id: number, status: string) {
    setBusy(true); setError2(null);
    try { await apiSend('PATCH', `/admin/partner-orgs/${id}`, { status }); reload(); }
    catch (e) { setError2(e); } finally { setBusy(false); }
  }
  async function removeOrg(id: number) {
    if (!window.confirm("Delete this organization? Refused while it still has members.")) return;
    setBusy(true); setError2(null);
    try { await apiSend('DELETE', `/admin/partner-orgs/${id}`); setOpenId(null); reload(); }
    catch (e) { setError2(e); } finally { setBusy(false); }
  }
  async function create() {
    setBusy(true); setError2(null);
    try {
      await apiSend('POST', '/admin/partner-orgs', {
        name: newName, type: newType,
        ...(newCountry.trim() ? { country: newCountry.trim() } : {}),
        ...(newEmail.trim() ? { contactEmail: newEmail.trim() } : {}),
      });
      setNewName(''); setNewCountry(''); setNewEmail(''); reload();
    } catch (e) { setError2(e); } finally { setBusy(false); }
  }

  return (
    <div>
      {canManage && (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
          <input style={{ ...input, flex: '1 1 180px' }} placeholder="New organization name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <select style={input} value={newType} onChange={(e) => setNewType(e.target.value)}>
            <option value="distributor">distributor</option><option value="oem">oem</option><option value="si">si</option>
          </select>
          <input style={{ ...input, width: 130 }} placeholder="Country" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} />
          <input style={{ ...input, width: 190 }} placeholder="Contact email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <button style={btn} disabled={busy || !newName.trim()} onClick={create}>Add org</button>
        </div>
      )}
      <Toolbar style={{ margin: '10px 0' }}>
        <input style={{ ...input, width: 220 }} placeholder="Search name…" value={q}
          onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') setQuery({ q: q.trim(), type, status }); }} />
        <select style={input} value={type} onChange={(e) => { setType(e.target.value); setQuery({ q, type: e.target.value, status }); }}>
          <option value="">All types</option><option value="distributor">distributor</option><option value="oem">oem</option><option value="si">si</option>
        </select>
        <select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ q, type, status: e.target.value }); }}>
          <option value="">All statuses</option><option value="pending">pending</option><option value="active">active</option><option value="suspended">suspended</option>
        </select>
        <button style={btnGhost} onClick={() => setQuery({ q: q.trim(), type, status })}>Search</button>
      </Toolbar>
      {error ? <Err error={error} /> : error2 ? <Err error={error2} /> : loading ? <p>Loading…</p> : data ? (
        <Table head={['Org', 'Type', 'Status', 'Members', 'Created', '']}>
          {data.items.map((o) => (
            <tr key={o.id} onClick={() => setOpenId(openId === o.id ? null : o.id)} style={{ cursor: 'pointer', background: openId === o.id ? '#F0F9FF' : undefined }}>
              <td style={td}><b>{o.name}</b><div style={{ color: '#66748A', fontSize: 12 }}>{o.country ?? '—'}{o.contactEmail ? ` · ${o.contactEmail}` : ''}</div></td>
              <td style={td}>{o.type}</td>
              <td style={td}><span style={{ color: STATUS_TONE[o.status] ?? '#64748B', fontWeight: 700 }}>{o.status}</span></td>
              <td style={td}>{o.memberCount}</td>
              <td style={td}>{fmtDate(o.createdAt)}</td>
              <td style={td}>
                {canManage && (
                  <>
                    {o.status !== 'active' && <button style={btnGhost} disabled={busy} onClick={(e) => { e.stopPropagation(); setStatus2(o.id, 'active'); }}>Activate</button>}
                    {o.status === 'active' && <button style={btnGhost} disabled={busy} onClick={(e) => { e.stopPropagation(); setStatus2(o.id, 'suspended'); }}>Suspend</button>}
                    <button style={{ ...btnGhost, marginLeft: 6 }} onClick={(e) => { e.stopPropagation(); setOpenId(openId === o.id ? null : o.id); }}>Manage</button>
                    <button style={{ ...btnGhost, marginLeft: 6 }} disabled={busy} title="Delete (refused while members exist)" onClick={(e) => { e.stopPropagation(); removeOrg(o.id); }}>✕</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No partner organizations match." />}
      {openId != null && canManage && <OrgDetail id={openId} onChanged={reload} />}
    </div>
  );
}

function OrgDetail({ id, onChanged }: { id: number; onChanged: () => void }) {
  const panelRef = usePanelScroll<HTMLDivElement>();
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
  async function removeMember(memberId: number) {
    setBusy(true); setErr(null);
    try { await apiSend('DELETE', `/admin/partner-orgs/${id}/members/${memberId}`); reload(); onChanged(); }
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
  async function deleteAsset(assetId: number) {
    setBusy(true); setErr(null);
    try { await apiSend('DELETE', `/admin/partner-assets/${assetId}`); reloadAssets(); }
    catch (e) { setErr(e); } finally { setBusy(false); }
  }

  return (
    <div ref={panelRef} style={{ marginTop: 16, border: '1px solid #E6EBF1', borderRadius: 10, padding: 16, background: '#F8FAFC' }}>
      <b>Members</b>
      {err ? <Err error={err} /> : null}
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : (
        <>
          {(data?.items ?? []).map((m) => (
            <div key={m.id} style={{ fontSize: 13.5, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1 }}>{m.email} · {m.role}</span>
              <button style={{ ...btnGhost, padding: '2px 8px', fontSize: 12 }} disabled={busy}
                onClick={() => removeMember(m.id)}>Remove</button>
            </div>
          ))}
          {data && data.items.length === 0 && <p style={{ color: '#66748A', fontSize: 13 }}>No members — add the partner's site account email.</p>}
        </>
      )}
      <div style={{ display: 'flex', gap: 8, margin: '8px 0 16px' }}>
        <input style={{ ...input, flex: 1 }} placeholder="member email (existing site account)" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
        <button style={btnGhost} disabled={busy || !memberEmail} onClick={addMember}>Add member</button>
      </div>

      <b>Gated assets</b>
      <Table head={['Category', 'Title', 'Size', 'Created', '']}>
        {(assets?.items ?? []).map((a) => (
          <tr key={a.id}>
            <td style={td}>{a.category}</td><td style={td}>{a.title}</td>
            <td style={td}>{a.bytes ? Math.round(a.bytes / 1024) + ' KB' : '—'}</td>
            <td style={td}>{fmtDate(a.createdAt)}</td>
            <td style={td}><button style={{ ...btnGhost, padding: '2px 8px', fontSize: 12 }} disabled={busy} onClick={() => deleteAsset(a.id)}>✕</button></td>
          </tr>
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

// ---- 0020: where-to-buy directory ----------------------------------------------

const CSV_TEMPLATE = 'name,country,region,status,cities,contactEmail,website,note\n'
  + 'Acme Trading,Kenya,af,expanding,"Nairobi; Mombasa",sales@acme.example,https://acme.example,Regional consumer electronics distributor';

function Directory({ canWrite }: { canWrite: boolean }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState({ q: '', region: '', status: '' });
  const [editing, setEditing] = useState<Distributor | 'new' | null>(null);
  const [csv, setCsv] = useState('');
  const [report, setReport] = useState<{ dryRun?: boolean; wouldCreate?: number; wouldUpdate?: number; imported?: number; updated?: number; errors?: Array<{ line: number; message: string }> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  const listings = useAsync<{ items: Listing[] }>(() => apiGet('/admin/marketplace-listings'), []);

  const qs = new URLSearchParams();
  if (query.q) qs.set('q', query.q);
  if (query.region) qs.set('region', query.region);
  if (query.status) qs.set('status', query.status);
  const { data, error, loading, reload } = useAsync<{ items: Distributor[]; total: number }>(
    () => apiGet('/admin/distributors?' + qs.toString()), [query.q, query.region, query.status]);

  async function runImport(dryRun: boolean) {
    setErr(null); setBusy(true);
    try {
      const res = await apiSend<typeof report>('POST', '/admin/distributors/import', { csv, dryRun });
      setReport(res);
      if (!dryRun) { setCsv(''); reload(); }
    } catch (e) { setErr(e); } finally { setBusy(false); }
  }
  async function remove(id: number) {
    setErr(null); setBusy(true);
    try { await apiSend('DELETE', `/admin/distributors/${id}`); reload(); }
    catch (e) { setErr(e); } finally { setBusy(false); }
  }

  return (
    <div>
      <p style={{ color: '#66748A', fontSize: 13, margin: '0 0 10px' }}>
        The directory behind the public <b>Where to Buy</b> locator — published entries flow to the site on the next
        content export (same bridge as the catalog). Region/status values match the site's filter chips.
      </p>
      <Toolbar style={{ marginBottom: 10 }}>
        <input style={{ ...input, width: 210 }} placeholder="Search country, name, city…" value={q}
          onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') setQuery({ q: q.trim(), region, status }); }} />
        <select style={input} value={region} onChange={(e) => { setRegion(e.target.value); setQuery({ q, region: e.target.value, status }); }}>
          <option value="">All regions</option>
          {DISTRIBUTOR_REGIONS.map((r) => <option key={r} value={r}>{DISTRIBUTOR_REGION_LABELS[r]}</option>)}
        </select>
        <select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ q, region, status: e.target.value }); }}>
          <option value="">All statuses</option>
          {DISTRIBUTOR_STATUSES.map((s) => <option key={s} value={s}>{DISTRIBUTOR_STATUS_LABELS[s]}</option>)}
        </select>
        <button style={btnGhost} onClick={() => setQuery({ q: q.trim(), region, status })}>Search</button>
        <span style={{ flex: 1 }} />
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ Add distributor</button>}
      </Toolbar>
      {err ? <Err error={err} /> : error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <Table head={['Country / entry', 'Region', 'Status', 'Cities', 'Contact', '']}>
          {data.items.map((d) => (
            <tr key={d.id} onClick={() => setEditing(d)} style={{ cursor: 'pointer' }}>
              <td style={td}><b>{d.country}</b>{d.name !== d.country && <div style={{ color: '#66748A', fontSize: 12 }}>{d.name}</div>}</td>
              <td style={{ ...td, fontSize: 12.5 }}>{DISTRIBUTOR_REGION_LABELS[d.region as keyof typeof DISTRIBUTOR_REGION_LABELS] ?? d.region}</td>
              <td style={td}><Badge value={d.status} /></td>
              <td style={{ ...td, fontSize: 12, color: '#66748A', maxWidth: 180 }}>{(d.cities ?? []).join(', ') || '—'}</td>
              <td style={{ ...td, fontSize: 12, color: '#66748A', maxWidth: 180 }}>
                {d.contact?.website ? <a href={d.contact.website} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} style={{ color: '#0F766E' }}>{d.contact.website.replace(/^https?:\/\//, '')}</a> : d.contact?.email ?? '—'}
              </td>
              <td style={td}>{canWrite && <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12 }} disabled={busy} onClick={(e) => { e.stopPropagation(); remove(d.id); }}>✕</button>}</td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No directory entries — add one or import the batch CSV." />}

      {editing && (
        <DistributorEditor
          key={editing === 'new' ? 'new' : `d-${(editing as Distributor).id}`}
          row={editing === 'new' ? null : editing}
          canWrite={canWrite}
          onDone={() => { setEditing(null); reload(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {canWrite && (
        <div style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: 12, marginTop: 14 }}>
          <b style={{ fontSize: 13 }}>Batch CSV import</b>
          <p style={{ margin: '6px 0 8px', fontSize: 12.5, color: '#66748A' }}>
            Header: <code>name,country,region,status,cities,contactEmail,website,note</code> — cities are <b>;</b>-separated;
            upserts by name + country. Regions: {DISTRIBUTOR_REGIONS.join(', ')} · Statuses: {DISTRIBUTOR_STATUSES.join(', ')}.
          </p>
          <textarea style={{ ...input, width: '100%', minHeight: 90, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            placeholder={CSV_TEMPLATE} value={csv} onChange={(e) => { setCsv(e.target.value); setReport(null); }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={btnGhost} onClick={() => setCsv(CSV_TEMPLATE)}>Insert sample</button>
            <button style={btnGhost} disabled={busy || !csv.trim()} onClick={() => runImport(true)}>Validate (dry run)</button>
            <button style={btn} disabled={busy || !csv.trim()} onClick={() => runImport(false)}>Import batch</button>
          </div>
          {report && (
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {report.dryRun
                ? <span>Would create <b>{report.wouldCreate ?? 0}</b>, update <b>{report.wouldUpdate ?? 0}</b>. {report.errors?.length ? 'Fix errors below.' : 'Clean — safe to import.'}</span>
                : <span>Imported <b>{report.imported ?? 0}</b>, updated <b>{report.updated ?? 0}</b> — audited.</span>}
              {!!report.errors?.length && (
                <div style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, marginTop: 8, maxHeight: 200, overflow: 'auto' }}>
                  {report.errors.map((e) => <div key={e.line}>Line {e.line}: {e.message}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: 12, marginTop: 14 }}>
        <b style={{ fontSize: 13 }}>Verified online marketplaces</b>
        <p style={{ margin: '6px 0 8px', fontSize: 12.5, color: '#66748A' }}>Official store fronts — listed as verified channels on the site.</p>
        {listings.error ? <Err error={listings.error} /> : listings.loading ? <p>Loading…</p> : (
          <Table head={['Platform', 'URL', 'Country', 'Verified', '']}>
            {(listings.data?.items ?? []).map((m) => (
              <tr key={m.id}>
                <td style={td}><b>{m.platform}</b></td>
                <td style={{ ...td, fontSize: 12 }}><a href={m.url} target="_blank" rel="noopener" style={{ color: '#0F766E' }}>{m.url.slice(0, 50)}</a></td>
                <td style={td}>{m.country ?? '—'}</td>
                <td style={td}>{m.verifiedAt ? fmtDate(m.verifiedAt) : '—'}</td>
                <td style={td}>{canWrite && <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12 }} onClick={() => { void apiSend('DELETE', `/admin/marketplace-listings/${m.id}`).then(listings.reload); }}>✕</button>}</td>
              </tr>
            ))}
          </Table>
        )}
        {canWrite && <MarketplaceAdd onAdded={listings.reload} />}
      </div>
    </div>
  );
}

function DistributorEditor({ row, canWrite, onDone, onCancel }: {
  row: Distributor | null; canWrite: boolean; onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: row?.name ?? '', country: row?.country ?? '', region: row?.region ?? 'me', status: row?.status ?? 'authorized',
    cities: (row?.cities ?? []).join('; '), email: row?.contact?.email ?? '', website: row?.contact?.website ?? '',
    note: row?.note ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const panelRef = usePanelScroll<HTMLDivElement>();
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#1F2A37', display: 'block', margin: '10px 0 4px' };
  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setErr(null);
    if (!form.name.trim() || !form.country.trim()) { setErr('Name and country are required.'); return; }
    const body = {
      name: form.name.trim(), country: form.country.trim(), region: form.region, status: form.status,
      cities: form.cities.split(';').map((s) => s.trim()).filter(Boolean).slice(0, 20),
      contact: {
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(form.website.trim() ? { website: form.website.trim() } : {}),
      },
      note: form.note.trim() || null,
    };
    setBusy(true);
    try {
      if (row) await apiSend('PATCH', `/admin/distributors/${row.id}`, body);
      else await apiSend('POST', '/admin/distributors', body);
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed.');
    } finally { setBusy(false); }
  }

  return (
    <div ref={panelRef} style={{ border: '1px solid #E6EBF1', borderRadius: 10, padding: 16, background: '#F8FAFC', marginTop: 12 }}>
      <b>{row ? `Edit — ${row.country}` : 'Add distributor'}</b>
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px' }}>{err}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        <span><label style={label}>Card title / country *</label>
          <input style={{ ...input, width: '100%' }} placeholder="United Arab Emirates" value={form.country} onChange={(e) => set('country', e.target.value)} /></span>
        <span><label style={label}>Distributor name</label>
          <input style={{ ...input, width: '100%' }} placeholder="Acme Trading" value={form.name} onChange={(e) => set('name', e.target.value)} /></span>
        <span><label style={label}>Region *</label>
          <select style={{ ...input, width: '100%' }} value={form.region} onChange={(e) => set('region', e.target.value)}>
            {DISTRIBUTOR_REGIONS.map((r) => <option key={r} value={r}>{DISTRIBUTOR_REGION_LABELS[r]}</option>)}
          </select></span>
        <span><label style={label}>Status *</label>
          <select style={{ ...input, width: '100%' }} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {DISTRIBUTOR_STATUSES.map((s) => <option key={s} value={s}>{DISTRIBUTOR_STATUS_LABELS[s]}</option>)}
          </select></span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <span><label style={label}>Cities <span style={{ color: '#93A0B4', fontWeight: 400 }}>(; separated)</span></label>
          <input style={{ ...input, width: '100%' }} placeholder="Dubai; Abu Dhabi" value={form.cities} onChange={(e) => set('cities', e.target.value)} /></span>
        <span><label style={label}>Contact email</label>
          <input style={{ ...input, width: '100%' }} placeholder="sales@…" value={form.email} onChange={(e) => set('email', e.target.value)} /></span>
        <span><label style={label}>Website</label>
          <input style={{ ...input, width: '100%' }} placeholder="https://…" value={form.website} onChange={(e) => set('website', e.target.value)} /></span>
      </div>
      <label style={label}>Card note</label>
      <textarea style={{ ...input, width: '100%', minHeight: 60, fontFamily: 'inherit' }} placeholder="Shown on the where-to-buy card…"
        value={form.note} onChange={(e) => set('note', e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {canWrite && <button style={btn} disabled={busy} onClick={save}>{busy ? 'Saving…' : row ? 'Save changes' : 'Add entry'}</button>}
        <button style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function MarketplaceAdd({ onAdded }: { onAdded: () => void }) {
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [country, setCountry] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function add() {
    setErr(null); setBusy(true);
    try {
      await apiSend('POST', '/admin/marketplace-listings', {
        platform: platform.trim(), url: url.trim(),
        ...(country.trim() ? { country: country.trim() } : {}),
      });
      setPlatform(''); setUrl(''); setCountry(''); onAdded();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Add failed.');
    } finally { setBusy(false); }
  }
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {err && <span style={{ color: '#C2453C', fontSize: 12.5, width: '100%' }}>{err}</span>}
      <input style={{ ...input, width: 150 }} placeholder="Platform (Amazon AE)" value={platform} onChange={(e) => setPlatform(e.target.value)} />
      <input style={{ ...input, flex: '1 1 220px' }} placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
      <input style={{ ...input, width: 120 }} placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      <button style={btnGhost} disabled={busy || !platform.trim() || !url.trim()} onClick={add}>Add listing</button>
    </div>
  );
}
