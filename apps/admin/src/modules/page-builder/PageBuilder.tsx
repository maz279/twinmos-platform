// Visual Page Builder (Phase 2 §2.1) — schema-driven editor over page.blocks.
// Non-technical staff compose pages from the 13 registered block types: add
// from the palette, edit in collapsible settings forms, drag to reorder (plus
// up/down/duplicate/delete actions), and see the page in the live preview
// modal (desktop/tablet/mobile). No raw JSON typing anywhere.
import React, { useState } from 'react';
import { BLOCK_DEFS, blockDef } from './blocks';
import type { FieldDef, PageBlock } from './blocks';
import { MediaPicker } from '../../media-picker';
import { API } from '../../api';
import { btn, btnGhost, input } from '../../ui';

const NAVY = '#1F2A37'; const CYAN = '#1DBF9F';

export default function PageBuilder({ blocks, onChange }: {
  blocks: PageBlock[]; onChange: (next: PageBlock[]) => void;
}) {
  const [open, setOpen] = useState<number | null>(null); // expanded block index
  const [palette, setPalette] = useState(false);
  const [pickMedia, setPickMedia] = useState<{ path: (number | string)[] } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const update = (next: PageBlock[]) => onChange(next);

  function addBlock(type: string) {
    const def = blockDef(type);
    if (!def) return;
    update([...blocks, def.make() as PageBlock]);
    setOpen(blocks.length); // expand the new block
    setPalette(false);
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [b] = next.splice(from, 1);
    next.splice(to, 0, b);
    update(next);
    setOpen(to);
  }
  function duplicate(i: number) {
    const next = [...blocks];
    next.splice(i + 1, 0, JSON.parse(JSON.stringify(blocks[i])) as PageBlock);
    update(next);
    setOpen(i + 1);
  }
  function remove(i: number) {
    update(blocks.filter((_, j) => j !== i));
    setOpen(null);
  }
  /** Set a (possibly nested, list-item) field by path of keys/indices. */
  function setField(blockIdx: number, path: (number | string)[], value: unknown) {
    const next = JSON.parse(JSON.stringify(blocks)) as PageBlock[];
    let node: unknown = next[blockIdx];
    for (let p = 0; p < path.length - 1; p++) node = (node as Record<string, unknown>)[path[p] as string];
    const last = path[path.length - 1];
    if (typeof last === 'number' && Array.isArray(node)) node[last] = value;
    else (node as Record<string, unknown>)[last as string] = value;
    update(next);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0 12px', flexWrap: 'wrap' }}>
        <button style={btn} onClick={() => setPalette((v) => !v)}>+ Add block</button>
        <span style={{ color: '#93A0B4', fontSize: 12.5 }}>{blocks.length} block{blocks.length === 1 ? '' : 's'} — drag cards to reorder</span>
      </div>

      {palette && (
        <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, background: '#F8FAFB', padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(215px,1fr))', gap: 8 }}>
            {BLOCK_DEFS.map((b) => (
              <button key={b.type} onClick={() => addBlock(b.type)} title={b.desc}
                style={{ display: 'flex', gap: 8, alignItems: 'flex-start', textAlign: 'left', border: '1px solid #E6EBF1', borderRadius: 9, background: '#fff', padding: '8px 10px', cursor: 'pointer' }}>
                <span style={{ fontSize: 17 }}>{b.icon}</span>
                <span>
                  <b style={{ display: 'block', color: NAVY, fontSize: 13 }}>{b.label}</b>
                  <span style={{ color: '#93A0B4', fontSize: 11.5, lineHeight: 1.35 }}>{b.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {blocks.length === 0 && (
        <div style={{ border: '1px dashed #D9E0E8', borderRadius: 10, padding: '26px 16px', textAlign: 'center', color: '#93A0B4', fontSize: 13.5 }}>
          Empty page — click <b style={{ color: NAVY }}>+ Add block</b> to compose it from sections.
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {blocks.map((block, i) => {
          const def = blockDef(block.type);
          const expanded = open === i;
          return (
            <div key={i} draggable
              onDragStart={() => setDragIdx(i)}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
              onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
              onDrop={(e) => { e.preventDefault(); if (dragIdx != null && dragIdx !== i) move(dragIdx, i); }}
              style={{
                border: `1px solid ${overIdx === i && dragIdx != null && dragIdx !== i ? CYAN : '#E6EBF1'}`,
                borderRadius: 10, background: dragIdx === i ? '#E7F7F2' : '#fff', overflow: 'hidden',
                opacity: dragIdx === i ? 0.7 : 1,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#F8FAFB', borderBottom: expanded ? '1px solid #E6EBF1' : 'none', cursor: 'grab' }}
                onClick={() => setOpen(expanded ? null : i)}>
                <span title="Drag to reorder" style={{ color: '#93A0B4', fontSize: 13, letterSpacing: 1 }}>⠿</span>
                <span>{def?.icon ?? '▪️'}</span>
                <b style={{ color: NAVY, fontSize: 13.5, flex: 1 }}>{def?.label ?? block.type} <span style={{ color: '#93A0B4', fontWeight: 400, fontSize: 11.5 }}>#{i + 1}</span></b>
                <span style={{ display: 'flex', gap: 4 }}>
                  <IconBtn title="Move up" disabled={i === 0} onClick={(e) => { e.stopPropagation(); move(i, i - 1); }}>↑</IconBtn>
                  <IconBtn title="Move down" disabled={i === blocks.length - 1} onClick={(e) => { e.stopPropagation(); move(i, i + 1); }}>↓</IconBtn>
                  <IconBtn title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicate(i); }}>⧉</IconBtn>
                  <IconBtn title="Delete block" onClick={(e) => { e.stopPropagation(); remove(i); }}>✕</IconBtn>
                  <IconBtn title={expanded ? 'Collapse' : 'Settings'}>{expanded ? '▾' : '▸'}</IconBtn>
                </span>
              </div>
              {expanded && def && (
                <div style={{ padding: '10px 12px', display: 'grid', gap: 10 }}>
                  {def.fields.map((f) => (
                    <FieldRow key={f.key} field={f} value={(block as Record<string, unknown>)[f.key]} basePath={[f.key]}
                      onMediaPick={(path) => setPickMedia({ path: [i, ...path] })}
                      onChange={(path, v) => setField(i, path, v)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pickMedia && (
        <MediaPicker
          selected={[]}
          onConfirm={(ids) => {
            if (ids.length && pickMedia) setField(pickMedia.path[0] as number, pickMedia.path.slice(1), ids[0]);
            setPickMedia(null);
          }}
          onClose={() => setPickMedia(null)}
        />
      )}
    </div>
  );
}

function IconBtn({ title, children, disabled, onClick }: { title: string; children: React.ReactNode; disabled?: boolean; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button title={title} disabled={disabled} onClick={onClick}
      style={{ width: 24, height: 24, border: '1px solid #E6EBF1', borderRadius: 6, background: '#fff', color: NAVY, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, fontSize: 12, padding: 0 }}>
      {children}
    </button>
  );
}

/** One schema field: scalar input, media picker trigger, or nested list editor. */
function FieldRow({ field, value, basePath, onChange, onMediaPick }: {
  field: FieldDef; value: unknown; basePath: (number | string)[];
  onChange: (path: (number | string)[], v: unknown) => void; onMediaPick: (path: (number | string)[]) => void;
}) {
  const label = <label style={{ fontSize: 11.5, fontWeight: 700, color: '#66748A', display: 'block', marginBottom: 3 }}>{field.label}</label>;

  if (field.k === 'list') {
    const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
    return (
      <div style={{ border: '1px solid #F0F3F7', borderRadius: 8, padding: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <b style={{ fontSize: 12, color: NAVY }}>{field.label}</b>
          <span style={{ color: '#93A0B4', fontSize: 11.5 }}>{items.length}{field.max ? `/${field.max}` : ''}</span>
          {(!field.max || items.length < field.max) && (
            <button style={{ ...btnGhost, padding: '2px 9px', fontSize: 11.5, marginLeft: 'auto' }}
              onClick={() => onChange(basePath, [...items, JSON.parse(JSON.stringify(field.defaultItem))])}>+ Add {field.itemLabel.toLowerCase()}</button>
          )}
        </div>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'grid', gap: 8, border: '1px solid #F0F3F7', borderRadius: 7, padding: 8, marginBottom: 8, background: '#FBFDFE' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <b style={{ fontSize: 11.5, color: '#66748A', flex: 1 }}>{field.itemLabel} {idx + 1}</b>
              <IconBtn title="Move up" disabled={idx === 0} onClick={() => {
                const next = [...items]; const [x] = next.splice(idx, 1); next.splice(idx - 1, 0, x); onChange(basePath, next);
              }}>↑</IconBtn>
              <IconBtn title="Move down" disabled={idx === items.length - 1} onClick={() => {
                const next = [...items]; const [x] = next.splice(idx, 1); next.splice(idx + 1, 0, x); onChange(basePath, next);
              }}>↓</IconBtn>
              <IconBtn title="Remove" onClick={() => onChange(basePath, items.filter((_, j) => j !== idx))}>✕</IconBtn>
            </div>
            {field.itemFields.map((f) => (
              <FieldRow key={f.key} field={f} value={item[f.key]} basePath={[...basePath, idx, f.key]}
                onMediaPick={onMediaPick} onChange={onChange} />
            ))}
          </div>
        ))}
        {items.length === 0 && <span style={{ color: '#93A0B4', fontSize: 12 }}>No {field.label.toLowerCase()} yet.</span>}
      </div>
    );
  }

  if (field.k === 'media') {
    const id = value == null ? null : Number(value);
    return (
      <div>
        {label}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 88, height: 62, borderRadius: 7, background: '#EEF1F5', overflow: 'hidden', display: 'block', flexShrink: 0 }}>
            {id != null && Number.isFinite(id) && <img src={API + '/admin/media/' + id + '/file'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          </span>
          <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => onMediaPick(basePath)}>{id ? 'Change' : 'Choose image'}</button>
          {id != null && <IconBtn title="Clear" onClick={() => onChange(basePath, null)}>✕</IconBtn>}
        </div>
      </div>
    );
  }

  if (field.k === 'select') {
    return (
      <div>
        {label}
        <select style={{ ...input, width: '100%' }} value={String(value ?? '')} onChange={(e) => onChange(basePath, e.target.value)}>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (field.k === 'textarea') {
    return (
      <div>
        {label}
        <textarea style={{ ...input, width: '100%', minHeight: 70, fontFamily: 'inherit' }} placeholder={field.placeholder}
          value={String(value ?? '')} onChange={(e) => onChange(basePath, e.target.value)} />
      </div>
    );
  }
  if (field.k === 'number') {
    return (
      <div>
        {label}
        <input type="number" style={{ ...input, width: '100%' }} min={field.min} max={field.max}
          value={value == null ? '' : Number(value)} onChange={(e) => onChange(basePath, e.target.value === '' ? null : Number(e.target.value))} />
      </div>
    );
  }
  return (
    <div>
      {label}
      <input style={{ ...input, width: '100%' }} placeholder={field.placeholder} value={String(value ?? '')}
        onChange={(e) => onChange(basePath, e.target.value)} />
    </div>
  );
}
