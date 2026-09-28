// Media picker — modal chooser over the media library, used by data-entry forms
// (product hero/gallery). Single or multi select; thumbnails come from the
// authenticated file endpoint. Selection is by media id, never by URL.
import React, { useEffect, useState } from 'react';
import { API, apiGet } from './api';
import { btn, btnGhost, Empty, input } from './ui';

type Asset = { id: number; key: string; kind: string; alt: string | null; meta: { origName?: string } };

export function MediaPicker({ multi, selected, onConfirm, onClose }: {
  multi?: boolean; selected: number[]; onConfirm: (ids: number[]) => void; onClose: () => void;
}) {
  const [items, setItems] = useState<Asset[] | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [pick, setPick] = useState<number[]>(selected);
  const [q, setQ] = useState('');

  useEffect(() => {
    apiGet<{ items: Asset[] }>('/admin/media')
      .then((d) => setItems(d?.items ?? []))
      .catch((e) => setErr(e));
  }, []);

  useEffect(() => {
    function esc(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const shown = (items ?? []).filter((m) => !q || (m.key + ' ' + (m.alt ?? '') + ' ' + (m.meta?.origName ?? '')).toLowerCase().includes(q.toLowerCase()));

  function toggle(id: number) {
    setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : multi ? [...p, id].slice(0, 12) : [id]));
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,.45)', display: 'grid', alignItems: 'start', justifyContent: 'center', paddingTop: '8vh', zIndex: 70 }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Choose media"
        style={{ width: 'min(760px, 94vw)', background: '#fff', borderRadius: 14, boxShadow: '0 30px 80px rgba(2,12,28,.5)', padding: 18, maxHeight: '78vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <b style={{ color: '#0A2540', flex: 1 }}>Choose {multi ? 'gallery images' : 'an image'} <span style={{ color: '#8CA3BA', fontWeight: 400 }}>— from the media library ({pick.length} selected)</span></b>
          <input style={{ ...input, width: 200 }} placeholder="Filter by name/alt" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {err ? <p style={{ color: '#B3261E' }}>Could not load the media library.</p> : null}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {items && shown.length === 0 && <Empty text={items.length === 0 ? 'No media yet — upload assets in the Media library first.' : 'No asset matches that filter.'} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))', gap: 10 }}>
            {(items ?? []).length > 0 && shown.map((m) => {
              const on = pick.includes(m.id);
              return (
                <button key={m.id} onClick={() => toggle(m.id)} title={m.alt ?? m.key}
                  style={{ position: 'relative', border: on ? '2px solid #00A3E0' : '1px solid #E3EBF3', borderRadius: 10, background: '#F7FAFD', padding: 6, cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ display: 'block', aspectRatio: '4/3', borderRadius: 7, background: '#E7EEF5', overflow: 'hidden' }}>
                    <img src={API + '/admin/media/' + m.id + '/file'} alt={m.alt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: '#33475C', marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.meta?.origName ?? m.key}</span>
                  {!m.alt && <span style={{ fontSize: 10, color: '#B3261E' }}>no alt</span>}
                  {on && <span style={{ position: 'absolute', top: 8, right: 8, background: '#00A3E0', color: '#fff', borderRadius: 999, fontSize: 10.5, fontWeight: 800, padding: '1px 7px' }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
          <button style={btnGhost} onClick={onClose}>Cancel</button>
          <button style={btn} onClick={() => onConfirm(pick)} disabled={pick.length === 0 && !multi}>Use selected{pick.length ? ` (${pick.length})` : ''}</button>
        </div>
      </div>
    </div>
  );
}
