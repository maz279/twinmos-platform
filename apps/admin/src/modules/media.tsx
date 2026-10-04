// Media library (Phase 4 DAM + 0023) — folder hierarchy sidebar with counts and
// create/rename/delete, upload into a chosen folder (alt text required),
// grid/table views with thumbnails served from the responsive variants when
// available, inline alt editing + compliance filter, low-resolution flag
// (BR-1.2 wants ≥1200px masters), copy URL, move-to-folder, and an admin
// delete that surfaces the API's in-use referential guard as a dialog.
// 0023 upgrades: library analytics strip, search across key+alt, kind filter,
// bulk upload with filename-derived alt, and a per-asset usage drawer (where
// the file is referenced + admin/public URLs).
import React, { useRef, useState } from 'react';
import { API, apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, useAsync, usePanelScroll } from '../ui';

type Asset = {
  id: number; key: string; kind: string; alt: string | null; width: number | null; height: number | null;
  folderId: number | null;
  meta: {
    origName?: string; mime?: string; bytes?: number;
    variants?: Record<string, { key: string; mime: string; bytes: number; width: number; height: number }>;
    profile?: { format: string; space: string; hasAlpha: boolean };
    variantError?: string;
  };
  uploadedBy: string | null; createdAt: string;
};
type Folder = { id: number; name: string; parentId: number | null; assetCount: number };
type MediaAnalytics = {
  total: number; byKind: Array<{ kind: string; n: number; bytes: number }>;
  withAlt: number; altCompliance: number; lowRes: number; variantCoverage: number;
  storageBytes: number; series: Array<{ d: string; n: number }>;
};
type Usage = {
  id: number;
  usage: Array<{ entity: string; id: number; label: string }>;
  urls: { admin: string; public: string; variants: string[] };
};

export default function Media({ isAdmin }: { isAdmin: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [copied, setCopied] = useState<number | null>(null);
  // 0023: search + kind filter + usage drawer + bulk upload progress
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [usageFor, setUsageFor] = useState<number | null>(null);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  // Phase 4.3 — folder state
  const [folder, setFolder] = useState<'all' | 'none' | number>('all');
  const [newFolder, setNewFolder] = useState('');
  const [renaming, setRenaming] = useState<number | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [moveFor, setMoveFor] = useState<number | null>(null);
  const [inUse, setInUse] = useState<string | null>(null);

  const listQs = new URLSearchParams();
  if (q.trim()) listQs.set('q', q.trim());
  if (kind) listQs.set('kind', kind);
  if (missingOnly) listQs.set('missingAlt', '1');
  if (folder !== 'all') listQs.set('folder', String(folder));
  const { data, error: loadError, loading, reload } = useAsync<{ items: Asset[]; total?: number }>(
    () => apiGet('/admin/media' + (listQs.toString() ? '?' + listQs.toString() : '')), [q, kind, folder, missingOnly]);
  const folders = useAsync<{ items: Folder[]; unfiledCount: number }>(() => apiGet('/admin/media-folders'), []);
  const reloadAll = () => { reload(); folders.reload(); };

  const items = data?.items ?? [];
  const missing = items.filter((m) => !m.alt).length;
  const total = data?.total ?? items.length;
  const fileUrl = (id: number) => API + '/admin/media/' + id + '/file';
  const publicUrl = (id: number) => {
    const base = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/api\/v1$/, '');
    return base + '/api/v1/media/' + id + '/file';
  };
  // grid thumbnails prefer the derived card variant (400×300 WebP) when present
  const thumbUrl = (m: Asset) => (m.meta?.variants?.card ? fileUrl(m.id) + '?variant=card' : fileUrl(m.id));
  async function copyUrl(text: string, id: number) {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500); } catch { /* clipboard unavailable */ }
  }
  /** Filename → human alt ("brand-campaign-hero.png" → "brand campaign hero"). */
  const altFromName = (name: string) => name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

  async function uploadOne(file: File, altText: string): Promise<boolean> {
    const form = new FormData();
    form.append('file', file);
    form.append('alt', altText);
    if (typeof folder === 'number') form.append('folderId', String(folder));
    const res = await fetch((import.meta.env.VITE_API_URL ?? '/api/v1') + '/admin/media', {
      method: 'POST', credentials: 'include', body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`${file.name}: ${body.detail || body.title || 'HTTP ' + res.status}`);
    }
    return true;
  }

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError('Choose a file first.'); return; }
    if (!alt.trim()) { setError('Alt text is required (accessibility).'); return; }
    setBusy(true); setError(null);
    try {
      await uploadOne(file, alt.trim());
      setAlt('');
      if (fileRef.current) fileRef.current.value = '';
      reloadAll();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  /** Bulk upload — one request per file (per-file validation + variants),
   *  alt derived from the filename, editable after. */
  async function bulkUpload() {
    const files = Array.from(bulkRef.current?.files ?? []);
    if (!files.length) { setError('Choose one or more files first.'); return; }
    setBusy(true); setError(null); setBulkMsg(null);
    let ok = 0;
    const failures: string[] = [];
    for (const f of files) {
      try { await uploadOne(f, altFromName(f.name) || f.name); ok++; }
      catch (e) { failures.push(e instanceof Error ? e.message : String(e)); }
    }
    if (bulkRef.current) bulkRef.current.value = '';
    setBulkMsg(`Uploaded ${ok}/${files.length}${failures.length ? ' — failures: ' + failures.slice(0, 3).join('; ') : ''}. Alt text was derived from filenames — review with the missing/alt filter.`);
    reloadAll();
    setBusy(false);
  }

  async function saveAlt(id: number) {
    setBusy(true); setError(null);
    try {
      await apiSend('PATCH', `/admin/media/${id}`, { alt: editAlt.trim() });
      setEditing(null);
      reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function moveTo(id: number, target: string) {
    setMoveFor(null);
    setBusy(true); setError(null);
    try {
      await apiSend('PATCH', `/admin/media/${id}`, { folderId: target === '' ? null : Number(target) });
      reloadAll();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function remove(id: number) {
    setBusy(true); setError(null); setInUse(null);
    try { await apiSend('DELETE', `/admin/media/${id}`, {}); reloadAll(); }
    catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('In use') || msg.includes('referenced by')) setInUse(msg); else setError(e);
    } finally { setBusy(false); }
  }

  async function createFolder() {
    if (!newFolder.trim()) return;
    setBusy(true); setError(null);
    try {
      await apiSend('POST', '/admin/media-folders', { name: newFolder.trim(), parentId: typeof folder === 'number' ? folder : null });
      setNewFolder(''); folders.reload();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }
  async function renameFolder(id: number) {
    if (!renameVal.trim()) { setRenaming(null); return; }
    setBusy(true); setError(null);
    try { await apiSend('PATCH', '/admin/media-folders/' + id, { name: renameVal.trim() }); setRenaming(null); folders.reload(); }
    catch (e) { setError(e); } finally { setBusy(false); }
  }
  async function deleteFolder(id: number) {
    setBusy(true); setError(null);
    try { await apiSend('DELETE', '/admin/media-folders/' + id, {}); if (folder === id) setFolder('all'); folders.reload(); }
    catch (e) { setError(e); } finally { setBusy(false); }
  }

  const folderName = (id: number | null) => id == null ? 'Unfiled' : (folders.data?.items.find((f) => f.id === id)?.name ?? `#${id}`);
  const chip = (label: string, title: string, color: string): React.ReactNode => (
    <span title={title} style={{ fontSize: 10, fontWeight: 800, background: color + '1C', color, borderRadius: 5, padding: '1px 6px' }}>{label}</span>
  );

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Media library</h1>
      <AnalyticsStrip />
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...input, width: 220 }} placeholder="Search key or alt text…" value={q}
          onChange={(e) => setQ(e.target.value)} />
        <select style={input} value={kind} onChange={(e) => setKind(e.target.value)} title="Kind">
          <option value="">All kinds</option>
          <option value="image">image</option><option value="video">video</option><option value="document">document</option>
        </select>
        <span style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: missing ? '#FCECEB' : '#E7F6EE', color: missing ? '#C2453C' : '#1F9D62' }}>
          {total - missing}/{total} alt-text compliant
        </span>
        <button style={{ ...btnGhost, fontWeight: missingOnly ? 800 : 400, borderColor: missingOnly ? '#1DBF9F' : undefined, color: missingOnly ? '#0E9F7E' : undefined }}
          onClick={() => setMissingOnly((v) => !v)}>
          {missingOnly ? `Showing missing alt only` : `Show missing alt`}
        </button>
        {(q || kind || missingOnly) && <button style={btnGhost} onClick={() => { setQ(''); setKind(''); setMissingOnly(false); }}>Reset</button>}
        <span style={{ flex: 1 }} />
        <button style={{ ...btnGhost, fontWeight: view === 'grid' ? 800 : 400 }} onClick={() => setView(view === 'grid' ? 'table' : 'grid')}>
          {view === 'grid' ? '▦ Grid' : '☰ Table'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <input ref={fileRef} type="file" style={input} accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.pdf,.webm,.mp4" />
        <input style={{ ...input, flex: '1 1 200px' }} placeholder="Alt text (required)" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <button style={btn} disabled={busy} onClick={upload}>Upload{typeof folder === 'number' ? ` → ${folderName(folder)}` : ''}</button>
        <span style={{ borderLeft: '1px solid #E6EBF1', paddingLeft: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input ref={bulkRef} type="file" multiple style={{ ...input, maxWidth: 240 }} accept=".png,.jpg,.jpeg,.webp,.gif,.avif,.pdf" title="Bulk upload — alt is derived from each filename" />
          <button style={btnGhost} disabled={busy} onClick={bulkUpload} title="Uploads each file with alt text derived from its filename">Bulk ↑</button>
        </span>
      </div>
      {bulkMsg && <div role="status" style={{ margin: '0 0 10px', padding: '8px 12px', borderRadius: 8, background: '#EDFAF6', border: '1px solid #BFE8DC', color: '#0F6B54', fontSize: 13 }}>{bulkMsg}</div>}
      {error ? <Err error={error} /> : null}
      {inUse && (
        <div role="alert" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '10px 0', color: '#8A5A00', background: '#FBF3E2', border: '1px solid #E8CE9A', borderRadius: 8, padding: '10px 12px' }}>
          <b>⚠ In use — not deleted:</b>
          <span style={{ flex: 1, fontSize: 12.5 }}>{inUse}</span>
          <button style={{ ...btnGhost, padding: '3px 9px' }} onClick={() => setInUse(null)}>Dismiss</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,240px) 1fr', gap: 14, alignItems: 'start' }}>
        {/* ---- Phase 4.3 folder tree ---- */}
        <aside style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: 12, position: 'sticky', top: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#93A0B4', margin: '2px 0 8px' }}>Folders</div>
          <button onClick={() => setFolder('all')}
            style={{ display: 'flex', gap: 8, width: '100%', textAlign: 'left', border: 0, background: folder === 'all' ? '#E7F7F2' : 'none', color: folder === 'all' ? '#0E9F7E' : '#475467', fontWeight: folder === 'all' ? 800 : 500, borderRadius: 7, padding: '5px 8px', cursor: 'pointer', fontSize: 13 }}>
            <span style={{ flex: 1 }}>📁 All media</span>
          </button>
          <button onClick={() => setFolder('none')}
            style={{ display: 'flex', gap: 8, width: '100%', textAlign: 'left', border: 0, background: folder === 'none' ? '#E7F7F2' : 'none', color: folder === 'none' ? '#0E9F7E' : '#475467', fontWeight: folder === 'none' ? 800 : 500, borderRadius: 7, padding: '5px 8px', cursor: 'pointer', fontSize: 13 }}>
            <span style={{ flex: 1 }}>📄 Unfiled</span>
            <span style={{ color: '#93A0B4', fontSize: 11.5 }}>{folders.data?.unfiledCount ?? 0}</span>
          </button>
          {(folders.data?.items ?? []).map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {renaming === f.id ? (
                <>
                  <input style={{ ...input, flex: 1, minWidth: 0, padding: '4px 7px', fontSize: 12.5 }} value={renameVal} onChange={(e) => setRenameVal(e.target.value)} autoFocus />
                  <button style={{ ...btnGhost, padding: '3px 7px', fontSize: 11 }} disabled={busy} onClick={() => renameFolder(f.id)}>✓</button>
                </>
              ) : (
                <>
                  <button onClick={() => setFolder(f.id)} title="Show this folder's assets"
                    style={{ display: 'flex', gap: 8, flex: 1, textAlign: 'left', border: 0, background: folder === f.id ? '#E7F7F2' : 'none', color: folder === f.id ? '#0E9F7E' : '#475467', fontWeight: folder === f.id ? 800 : 500, borderRadius: 7, padding: '5px 8px', cursor: 'pointer', fontSize: 13, minWidth: 0 }}>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.parentId == null ? '📁' : '↳'} {f.name}</span>
                    <span style={{ color: '#93A0B4', fontSize: 11.5 }}>{f.assetCount}</span>
                  </button>
                  <button title="Rename" style={{ border: 0, background: 'none', color: '#93A0B4', cursor: 'pointer', padding: '2px 4px', fontSize: 11 }} onClick={() => { setRenaming(f.id); setRenameVal(f.name); }}>✎</button>
                  <button title="Delete (must be empty)" style={{ border: 0, background: 'none', color: '#93A0B4', cursor: 'pointer', padding: '2px 4px', fontSize: 11 }} disabled={busy} onClick={() => deleteFolder(f.id)}>✕</button>
                </>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <input style={{ ...input, flex: 1, minWidth: 0, padding: '5px 8px', fontSize: 12.5 }} placeholder="New folder name…" value={newFolder} onChange={(e) => setNewFolder(e.target.value)} />
            <button style={{ ...btn, padding: '5px 10px', fontSize: 12 }} disabled={busy || !newFolder.trim()} onClick={createFolder}>+</button>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 11, color: '#93A0B4', lineHeight: 1.5 }}>
            Uploads land in the selected folder. Deleting a folder never deletes its assets — they become unfiled.
          </p>
        </aside>

        <div style={{ minWidth: 0 }}>
          {loadError ? <Err error={loadError} /> : loading ? <p>Loading…</p> : data ? (
            view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(168px,1fr))', gap: 12 }}>
                {items.map((m) => {
                  const variants = Object.keys(m.meta?.variants ?? {});
                  const lowRes = m.kind === 'image' && m.width != null && m.width < 1200;
                  return (
                    <div key={m.id} style={{ border: '1px solid #E6EBF1', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                      <a href={fileUrl(m.id)} target="_blank" rel="noopener" style={{ display: 'block', aspectRatio: '4/3', background: '#EEF1F5' }}>
                        {m.kind === 'image'
                          ? <img src={thumbUrl(m)} alt={m.alt ?? ''} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : <span style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#93A0B4', fontSize: 12 }}>{m.kind}</span>}
                      </a>
                      <div style={{ padding: '8px 10px' }}>
                        <b style={{ display: 'block', fontSize: 12, color: '#1F2A37', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.meta?.origName ?? m.key}>{m.meta?.origName ?? m.key}</b>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '4px 0 6px', flexWrap: 'wrap' }}>
                          <Badge value={m.kind} />
                          {lowRes && chip('low-res', `Master is ${m.width}×${m.height}px — BR-1.2 wants ≥1200px masters`, '#E8A33D')}
                          {variants.length > 0 && chip('T/C/H/F', `${variants.length} responsive variants (thumb/card/hero/full${m.meta?.variants?.heroAvif ? ' +AVIF' : ''})`, '#1DBF9F')}
                        </div>
                        {editing === m.id ? (
                          <span style={{ display: 'flex', gap: 6 }}>
                            <input style={{ ...input, flex: 1, minWidth: 0 }} value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
                            <button style={{ ...btnGhost, padding: '3px 8px' }} disabled={busy} onClick={() => saveAlt(m.id)}>Save</button>
                          </span>
                        ) : (
                          <span style={{ display: 'flex', gap: 6 }}>
                            <span style={{ flex: 1, fontSize: 11, color: m.alt ? '#66748A' : '#C2453C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.alt ?? ''}>{m.alt ?? '⚠ no alt'}</span>
                            <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} onClick={() => { setEditing(m.id); setEditAlt(m.alt ?? ''); }}>Alt</button>
                            <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} onClick={() => copyUrl(fileUrl(m.id), m.id)}>{copied === m.id ? '✓' : 'URL'}</button>
                            <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} title="Public URL (usable on the site)" onClick={() => copyUrl(publicUrl(m.id), m.id)}>Pub</button>
                            <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} title="Usage & references" onClick={() => setUsageFor(usageFor === m.id ? null : m.id)}>ⓘ</button>
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                          <select style={{ ...input, flex: 1, minWidth: 0, padding: '3px 6px', fontSize: 11.5, color: '#66748A' }} value={moveFor === m.id ? undefined : m.folderId ?? ''} onChange={(e) => moveTo(m.id, e.target.value)} title="Move to folder">
                            <option value="">{folderName(m.folderId)}…</option>
                            <option value="">— Unfiled —</option>
                            {(folders.data?.items ?? []).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                          {isAdmin && <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} disabled={busy} onClick={() => remove(m.id)}>Delete</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead><tr>{['File', 'Kind', 'Folder', 'Alt text', 'Variants', 'Size', 'Uploaded', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E6EBF1' }}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m.id}>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                        <b>{m.meta?.origName ?? m.key}</b>
                        <div style={{ color: '#93A0B4', fontSize: 12 }}>{m.key}{m.width != null ? ` · ${m.width}×${m.height}` : ''}</div>
                        <a href={fileUrl(m.id)} target="_blank" rel="noopener" style={{ fontSize: 12 }}>View file ↗</a>
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}><Badge value={m.kind} /></td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7', color: '#66748A' }}>{folderName(m.folderId)}</td>
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
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7', fontSize: 11.5, color: '#66748A' }}>
                        {Object.keys(m.meta?.variants ?? {}).join(', ') || (m.meta?.variantError ? '—' : '—')}
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{m.meta?.bytes ? Math.round(m.meta.bytes / 1024) + ' KB' : '—'}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>{fmtDate(m.createdAt)}</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #F0F3F7' }}>
                        <button style={{ ...btnGhost, marginRight: 6 }} onClick={() => copyUrl(fileUrl(m.id), m.id)}>{copied === m.id ? 'Copied ✓' : 'Copy URL'}</button>
                        <button style={{ ...btnGhost, marginRight: 6 }} title="Public URL" onClick={() => copyUrl(publicUrl(m.id), m.id)}>Pub</button>
                        <button style={{ ...btnGhost, marginRight: 6 }} title="Usage & references" onClick={() => setUsageFor(usageFor === m.id ? null : m.id)}>ⓘ</button>
                        {isAdmin && <button style={btnGhost} disabled={busy} onClick={() => remove(m.id)}>Delete</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : null}
          {data && total === 0 && <Empty text={folder === 'none' ? 'No unfiled assets — everything is filed away. 🎉' : 'No media in this view yet.'} />}
          {data && total > 0 && items.length === 0 && <Empty text="Every asset here has alt text. 🎉" />}
          {usageFor != null && <UsageDrawer id={usageFor} onClose={() => setUsageFor(null)} />}
        </div>
      </div>
    </div>
  );
}

// ---- 0023: library analytics strip ------------------------------------------

function AnalyticsStrip() {
  const { data, error, loading } = useAsync<MediaAnalytics>(() => apiGet('/admin/media-analytics'), []);
  if (loading) return null;
  if (error || !data) return null;
  const fmtBytes = (b: number) => b > 1e9 ? (b / 1e9).toFixed(1) + ' GB' : b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.round(b / 1e3) + ' KB';
  const maxArrivals = Math.max(1, ...data.series.map((x) => x.n));
  const kpi = (label: string, value: string, sub: string, tone = '#1F2A37') => (
    <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: tone, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#66748A' }}>{sub}</div>
    </div>
  );
  return (
    <details style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: '10px 16px', marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 800, color: '#1F2A37', userSelect: 'none' }}>
        Analytics — <span style={{ color: '#66748A', fontWeight: 400 }}>
          {data.total} assets · {data.altCompliance}% alt compliance · {fmtBytes(data.storageBytes)} storage{data.lowRes ? ` · ${data.lowRes} low-res` : ''}
        </span>
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginTop: 12 }}>
        {kpi('Assets', String(data.total), data.byKind.map((k) => `${k.n} ${k.kind}`).join(' · '))}
        {kpi('Alt compliance', data.altCompliance + '%', `${data.withAlt}/${data.total} with alt`, data.altCompliance === 100 ? '#1F9D62' : '#B45309')}
        {kpi('Variant coverage', data.variantCoverage + '%', 'responsive derivatives')}
        {kpi('Storage', fmtBytes(data.storageBytes), 'originals + variants')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginTop: 14 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 }}>Uploads — last 14 days</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, borderBottom: '1px solid #E6EBF1' }}>
            {data.series.map((x) => (
              <div key={x.d} title={x.d + ': ' + x.n} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <span style={{ width: '70%', borderRadius: '3px 3px 0 0', background: '#1DBF9F', height: Math.max((x.n / maxArrivals) * 100, x.n ? 6 : 0) + '%', display: 'block', margin: '0 auto' }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 }}>By kind</div>
          {data.byKind.map((k) => (
            <div key={k.kind} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#66748A', padding: '3px 0' }}>
              <span>{k.kind}</span>
              <span><b style={{ color: '#1F2A37' }}>{k.n}</b> · {fmtBytes(k.bytes)}</span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

// ---- 0023: per-asset usage drawer -------------------------------------------

function UsageDrawer({ id, onClose }: { id: number; onClose: () => void }) {
  const panelRef = usePanelScroll<HTMLDivElement>();
  const { data, error, loading } = useAsync<Usage>(() => apiGet('/admin/media/' + id + '/usage'), [id]);
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(text: string, tag: string) {
    try { await navigator.clipboard.writeText(text); setCopied(tag); setTimeout(() => setCopied(null), 1500); } catch { /* unavailable */ }
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return (
    <div ref={panelRef} style={{ marginTop: 12, border: '1px solid #E6EBF1', borderRadius: 12, background: '#F8FAFC', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <b style={{ color: '#1F2A37' }}>Asset #{id} — usage &amp; URLs</b>
        <span style={{ flex: 1 }} />
        <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={onClose}>Close</button>
      </div>
      {error ? <div style={{ marginTop: 8 }}><Err error={error} /></div> : loading ? <p style={{ marginTop: 8 }}>Loading…</p> : data ? (
        <>
          <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
            <button style={{ ...btnGhost, padding: '4px 10px', fontSize: 12 }} onClick={() => copy(origin + data.urls.admin, 'admin')}>
              {copied === 'admin' ? 'Copied ✓' : 'Copy admin URL'}
            </button>
            <button style={{ ...btnGhost, padding: '4px 10px', fontSize: 12 }} onClick={() => copy(origin + data.urls.public, 'pub')}>
              {copied === 'pub' ? 'Copied ✓' : 'Copy public URL'}
            </button>
            {data.urls.variants.length > 0 && (
              <span style={{ fontSize: 11.5, color: '#93A0B4', alignSelf: 'center' }}>
                variants: {data.urls.variants.join(', ')}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', margin: '8px 0 6px' }}>
            Referenced by ({data.usage.length})
          </div>
          {data.usage.length === 0 ? (
            <span style={{ fontSize: 12.5, color: '#66748A' }}>Not referenced — safe to delete (subject to role).</span>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {data.usage.map((u) => (
                <span key={u.entity + u.id} style={{ fontSize: 12, background: '#fff', border: '1px solid #E6EBF1', borderRadius: 8, padding: '4px 10px' }}>
                  <Badge value={u.entity} /> {u.label}
                </span>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
