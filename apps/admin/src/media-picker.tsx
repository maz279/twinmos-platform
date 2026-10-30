// Media picker — modal chooser over the media library, used by data-entry forms
// (product hero/gallery). Single or multi select; thumbnails come from the
// authenticated file endpoint. Selection is by media id, never by URL.
import React, { useEffect, useState } from 'react';
import { API, apiGet } from './api';
import { btn, btnGhost, Empty, input } from './ui';
import { useDialogA11y } from './dialog-a11y';

type Asset = { id: number; key: string; kind: string; alt: string | null; meta: { origName?: string } };

export function MediaPicker({ multi, selected, onConfirm, onClose }: {
  multi?: boolean; selected: number[]; onConfirm: (ids: number[]) => void; onClose: () => void;
}) {
  const [items, setItems] = useState<Asset[] | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [pick, setPick] = useState<number[]>(selected);
  const [q, setQ] = useState('');
  const dialogRef = useDialogA11y({ isOpen: true, onClose });

  useEffect(() => {
    apiGet<{ items: Asset[] }>('/admin/media')
      .then((d) => setItems(d?.items ?? []))
      .catch((e) => setErr(e));
  }, []);

  const shown = (items ?? []).filter((m) => !q || (m.key + ' ' + (m.alt ?? '') + ' ' + (m.meta?.origName ?? '')).toLowerCase().includes(q.toLowerCase()));

  function toggle(id: number) {
    setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : multi ? [...p, id].slice(0, 12) : [id]));
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,.45)', display: 'grid', alignItems: 'start', justifyContent: 'center', paddingTop: '8vh', zIndex: 70 }}>
      <div ref={dialogRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Choose media"
        style={{ width: 'min(760px, 94vw)', background: '#fff', borderRadius: 14, boxShadow: '0 30px 80px rgba(2,12,28,.5)', padding: 18, maxHeight: '78vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <b style={{ color: '#1F2A37', flex: 1 }}>Choose {multi ? 'gallery images' : 'an image'} <span style={{ color: '#93A0B4', fontWeight: 400 }}>— from the media library ({pick.length} selected)</span></b>
          <input id="media-picker-search" aria-label="Filter media by name or alt text" style={{ ...input, width: 200 }} placeholder="Filter by name/alt" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {err ? <p style={{ color: '#C2453C' }}>Could not load the media library.</p> : null}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {items && shown.length === 0 && <Empty text={items.length === 0 ? 'No media yet — upload assets in the Media library first.' : 'No asset matches that filter.'} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))', gap: 10 }}>
            {(items ?? []).length > 0 && shown.map((m) => {
              const on = pick.includes(m.id);
              const hasAlt = Boolean(m.alt && m.alt.trim());
              return (
                <button key={m.id} onClick={() => hasAlt && toggle(m.id)} disabled={!hasAlt}
                  title={hasAlt ? (m.alt ?? m.key) : 'Alt text is mandatory before selecting this image (WCAG 2.2)'}
                  style={{ position: 'relative', border: on ? '2px solid #1DBF9F' : '1px solid #E6EBF1', borderRadius: 10, background: hasAlt ? '#F8FAFB' : '#FBF2F1', padding: 6, cursor: hasAlt ? 'pointer' : 'not-allowed', opacity: hasAlt ? 1 : 0.65, textAlign: 'left' }}>
                  <span style={{ display: 'block', aspectRatio: '4/3', borderRadius: 7, background: '#EEF1F5', overflow: 'hidden' }}>
                    <img src={API + '/admin/media/' + m.id + '/file?variant=thumb'} alt={m.alt ?? ''} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: '#475467', marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.meta?.origName ?? m.key}</span>
                  {!hasAlt ? (
                    <span style={{ fontSize: 10, color: '#C2453C', fontWeight: 600 }}>Alt required</span>
                  ) : (
                    <span style={{ fontSize: 10, color: '#1DBF9F' }}>✓ has alt</span>
                  )}
                  {on && <span style={{ position: 'absolute', top: 8, right: 8, background: '#1DBF9F', color: '#fff', borderRadius: 999, fontSize: 10.5, fontWeight: 800, padding: '1px 7px' }}>✓</span>}
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
