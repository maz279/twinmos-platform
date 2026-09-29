// Media library — upload (alt text required), grid/table views with thumbnails,
// alt editing + compliance filter, copy URL, admin delete.
import React, { useRef, useState } from 'react';
import { API, apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, useAsync } from '../ui';

type Asset = {
  id: number; key: string; kind: string; alt: string | null;
  meta: { origName?: string; mime?: string; bytes?: number; folder?: string };
  uploadedBy: string | null; createdAt: string;
};

export default function Media({ isAdmin }: { isAdmin: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [copied, setCopied] = useState<number | null>(null);
  const { data, error: loadError, loading, reload } = useAsync<{ items: Asset[] }>(() => apiGet('/admin/media'), []);
  const items = (data?.items ?? []).filter((m) => (missingOnly ? !m.alt : true));
  const missing = (data?.items ?? []).filter((m) => !m.alt).length;
  const total = data?.items?.length ?? 0;
  const fileUrl = (id: number) => API + '/admin/media/' + id + '/file';
  async function copyUrl(id: number) {
    try { await navigator.clipboard.writeText(fileUrl(id)); setCopied(id); setTimeout(() => setCopied(null), 1500); } catch { /* clipboard unavailable */ }
  }

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError('Choose a file first.'); return; }
    if (!alt.trim()) { setError('Alt text is required (accessibility).'); return; }
    setBusy(true); setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('alt', alt.trim());
      const res = await fetch((import.meta.env.VITE_API_URL ?? '/api/v1') + '/admin/media', {
        method: 'POST', credentials: 'include', body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.title || ('HTTP ' + res.status));
      }
      setAlt('');
      if (fileRef.current) fileRef.current.value = '';
      reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function saveAlt(id: number) {
    setBusy(true); setError(null);
    try {
      await apiSend('PATCH', `/admin/media/${id}`, { alt: editAlt.trim() });
      setEditing(null);
      reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function remove(id: number) {
    setBusy(true); setError(null);
    try { await apiSend('DELETE', `/admin/media/${id}`, {}); reload(); }
    catch (e) { setError(e); } finally { setBusy(false); }
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Media library</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: missing ? '#FCECEB' : '#E7F6EE', color: missing ? '#C2453C' : '#1F9D62' }}>
          {total - missing}/{total} alt-text compliant
        </span>
        <button style={{ ...btnGhost, fontWeight: missingOnly ? 800 : 400, borderColor: missingOnly ? '#1DBF9F' : undefined, color: missingOnly ? '#0E9F7E' : undefined }}
          onClick={() => setMissingOnly((v) => !v)}>
          {missingOnly ? `Showing ${missing} missing alt only` : `Show missing alt (${missing})`}
        </button>
        <span style={{ flex: 1 }} />
        <button style={{ ...btnGhost, fontWeight: view === 'grid' ? 800 : 400 }} onClick={() => setView(view === 'grid' ? 'table' : 'grid')}>
          {view === 'grid' ? '▦ Grid' : '☰ Table'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <input ref={fileRef} type="file" style={input} accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.pdf,.webm,.mp4" />
        <input style={{ ...input, flex: '1 1 240px' }} placeholder="Alt text (required)" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <button style={btn} disabled={busy} onClick={upload}>Upload</button>
      </div>
      {error ? <Err error={error} /> : null}
      {loadError ? <Err error={loadError} /> : loading ? <p>Loading…</p> : data ? (
        view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(168px,1fr))', gap: 12 }}>
            {items.map((m) => (
              <div key={m.id} style={{ border: '1px solid #E6EBF1', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                <a href={fileUrl(m.id)} target="_blank" rel="noopener" style={{ display: 'block', aspectRatio: '4/3', background: '#EEF1F5' }}>
                  {m.kind === 'image'
                    ? <img src={fileUrl(m.id)} alt={m.alt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <span style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#93A0B4', fontSize: 12 }}>{m.kind}</span>}
                </a>
                <div style={{ padding: '8px 10px' }}>
                  <b style={{ display: 'block', fontSize: 12, color: '#1F2A37', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.meta?.origName ?? m.key}>{m.meta?.origName ?? m.key}</b>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 6px' }}>
                    <Badge value={m.kind} />
                    {m.alt
                      ? <span style={{ fontSize: 11, color: '#1F9D62' }}>alt ✓</span>
                      : <span style={{ fontSize: 11, color: '#C2453C' }}>⚠ no alt</span>}
                    {isAdmin && <button style={{ ...btnGhost, marginLeft: 'auto', padding: '2px 7px', fontSize: 11 }} disabled={busy} onClick={() => remove(m.id)}>Delete</button>}
                  </div>
                  {editing === m.id ? (
                    <span style={{ display: 'flex', gap: 6 }}>
                      <input style={{ ...input, flex: 1, minWidth: 0 }} value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
                      <button style={{ ...btnGhost, padding: '3px 8px' }} disabled={busy} onClick={() => saveAlt(m.id)}>Save</button>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', gap: 6 }}>
                      <span style={{ flex: 1, fontSize: 11, color: '#66748A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.alt ?? ''}>{m.alt ?? '—'}</span>
                      <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} onClick={() => { setEditing(m.id); setEditAlt(m.alt ?? ''); }}>Alt</button>
                      <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} onClick={() => copyUrl(m.id)}>{copied === m.id ? '✓' : 'URL'}</button>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>{['File', 'Kind', 'Alt text', 'Size', 'Uploaded', ''].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E6EBF1' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  <b>{m.meta?.origName ?? m.key}</b>
                  <div style={{ color: '#66748A', fontSize: 12 }}>{m.key}</div>
                  <a href={fileUrl(m.id)} target="_blank" rel="noopener" style={{ fontSize: 12 }}>View file ↗</a>
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}><Badge value={m.kind} /></td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  {editing === m.id ? (
                    <span style={{ display: 'flex', gap: 6 }}>
                      <input style={input} value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
                      <button style={btnGhost} disabled={busy} onClick={() => saveAlt(m.id)}>Save</button>
                    </span>
                  ) : (
                    <span>
                      {m.alt ? m.alt : <span style={{ color: '#DC2626' }}>⚠ missing</span>}
                      <button style={{ ...btnGhost, marginLeft: 8 }} onClick={() => { setEditing(m.id); setEditAlt(m.alt ?? ''); }}>Edit</button>
                    </span>
                  )}
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{m.meta?.bytes ? Math.round(m.meta.bytes / 1024) + ' KB' : '—'}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{fmtDate(m.createdAt)}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                  <button style={{ ...btnGhost, marginRight: 6 }} onClick={() => copyUrl(m.id)}>{copied === m.id ? 'Copied ✓' : 'Copy URL'}</button>
                  {isAdmin && <button style={btnGhost} disabled={busy} onClick={() => remove(m.id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )
      ) : null}
      {data && total === 0 && <Empty text="No media uploaded yet." />}
      {data && total > 0 && items.length === 0 && <Empty text="Every asset has alt text. 🎉" />}
    </div>
  );
}
