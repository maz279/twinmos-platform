// Media library — upload (alt text required), list with compliance column,
// alt editing, admin delete.
import React, { useRef, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
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
  const { data, error: loadError, loading, reload } = useAsync<{ items: Asset[] }>(() => apiGet('/admin/media'), []);

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
      <h1>Media library</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <input ref={fileRef} type="file" style={input} accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.pdf,.webm,.mp4" />
        <input style={{ ...input, flex: '1 1 240px' }} placeholder="Alt text (required)" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <button style={btn} disabled={busy} onClick={upload}>Upload</button>
      </div>
      {error ? <Err error={error} /> : null}
      {loadError ? <Err error={loadError} /> : loading ? <p>Loading…</p> : data ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>{['File', 'Kind', 'Alt text', 'Size', 'Uploaded', ''].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E2E8F0' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {data.items.map((m) => (
              <tr key={m.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEF2F6' }}>
                  <b>{m.meta?.origName ?? m.key}</b>
                  <div style={{ color: '#5E7691', fontSize: 12 }}>{m.key}</div>
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEF2F6' }}><Badge value={m.kind} /></td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEF2F6' }}>
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
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEF2F6' }}>{m.meta?.bytes ? Math.round(m.meta.bytes / 1024) + ' KB' : '—'}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEF2F6' }}>{fmtDate(m.createdAt)}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #EEF2F6' }}>
                  {isAdmin && <button style={btnGhost} disabled={busy} onClick={() => remove(m.id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No media uploaded yet." />}
    </div>
  );
}
