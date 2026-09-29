// Block preview (Phase 2 §2.1) — renders the 13 TwinMOS block types visually
// with the public-site tokens (navy/cyan/gold), and the responsive Preview
// Modal (desktop 1200 / tablet 768 / mobile 375) so staff see the real page
// shape without leaving the console.
import React, { useState } from 'react';
import { API } from '../../api';
import type { PageBlock } from './blocks';

const NAVY = '#0A2540'; const CYAN = '#00A3E0'; const GOLD = '#D9A441';
const S = (o: React.CSSProperties): React.CSSProperties => o;

function Media({ id, alt, style }: { id: unknown; alt?: string; style?: React.CSSProperties }) {
  const n = id == null ? null : Number(id);
  if (n == null || !Number.isFinite(n)) return <div style={{ ...style, background: '#E7EEF5', display: 'grid', placeItems: 'center', color: '#8CA3BA', fontSize: 12 }}>image</div>;
  return <img src={API + '/admin/media/' + n + '/file'} alt={alt ?? ''} style={{ ...style, objectFit: 'cover', display: 'block' }} />;
}
const str = (v: unknown, d = '') => (v == null ? d : String(v));
const arr = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);

/** Minimal markdown-ish render (bold/headings/lists) — enough for previews. */
function Md({ text }: { text: unknown }) {
  const lines = str(text).split('\n');
  return (
    <div style={{ fontSize: 14.5, lineHeight: 1.65, color: '#33475C' }}>
      {lines.map((l, i) => {
        if (l.startsWith('### ')) return <h4 key={i} style={{ margin: '8px 0 2px', color: NAVY }}>{l.slice(4)}</h4>;
        if (l.startsWith('## ')) return <h3 key={i} style={{ margin: '10px 0 3px', color: NAVY }}>{l.slice(3)}</h3>;
        if (l.startsWith('# ')) return <h2 key={i} style={{ margin: '12px 0 4px', color: NAVY }}>{l.slice(2)}</h2>;
        if (l.startsWith('- ')) return <div key={i} style={{ paddingLeft: 14, textIndent: '-12px' }}>• {l.slice(2)}</div>;
        return <p key={i} style={{ margin: '4px 0' }}>{l}</p>;
      })}
    </div>
  );
}

export function BlockPreview({ blocks }: { blocks: PageBlock[] }) {
  if (!blocks.length) return <p style={{ color: '#8CA3BA' }}>Empty page — add blocks to see them here.</p>;
  return <div>{blocks.map((b, i) => <BlockView key={i} block={b} />)}</div>;
}

function BlockView({ block }: { block: PageBlock }) {
  const t = String(block.type);
  const w = (k: string) => block[k];

  if (t === 'hero') {
    return (
      <section style={S({ position: 'relative', borderRadius: 12, overflow: 'hidden', minHeight: 220, display: 'grid', alignItems: 'center', padding: '28px 32px', color: '#fff', background: `linear-gradient(135deg, ${NAVY}, #0E4E85)` })}>
        {w('bgMediaId') != null && <Media id={w('bgMediaId')} alt={str(w('title'))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.38 }} />}
        <div style={S({ position: 'relative', maxWidth: 620 })}>
          {str(w('eyebrow')) && <span style={S({ fontSize: 11.5, letterSpacing: 2, fontWeight: 800, color: GOLD, textTransform: 'uppercase' })}>{str(w('eyebrow'))}</span>}
          <h1 style={S({ margin: '6px 0 8px', fontSize: 34, lineHeight: 1.15, color: '#fff' })}>{str(w('title'), 'Hero headline')}</h1>
          {str(w('subdeck')) && <p style={S({ margin: 0, color: '#C9DDF0', fontSize: 15 })}>{str(w('subdeck'))}</p>}
          <div style={S({ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' })}>
            {str(w('ctaLabel')) && <span style={S({ background: CYAN, color: '#fff', fontWeight: 800, padding: '9px 18px', borderRadius: 8, fontSize: 14 })}>{str(w('ctaLabel'))}</span>}
            {str(w('ctaSecondaryLabel')) && <span style={S({ border: '1px solid rgba(255,255,255,.5)', color: '#fff', fontWeight: 700, padding: '9px 18px', borderRadius: 8, fontSize: 14 })}>{str(w('ctaSecondaryLabel'))}</span>}
          </div>
        </div>
      </section>
    );
  }
  if (t === 'textMedia') {
    const mediaFirst = str(w('layout'), 'right') === 'left';
    const media = (
      <figure style={S({ margin: 0, flex: 1, minWidth: 200 })}>
        <Media id={w('mediaId')} style={{ width: '100%', height: 220, borderRadius: 10 }} />
        {str(w('caption')) && <figcaption style={{ fontSize: 12, color: '#8CA3BA', marginTop: 5 }}>{str(w('caption'))}</figcaption>}
      </figure>
    );
    const textCol = (
      <div style={S({ flex: 1, minWidth: 220 })}>
        {str(w('badge')) && <span style={S({ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#0E7FB8', background: '#EAF6FC', borderRadius: 5, padding: '2px 8px', marginBottom: 8 })}>{str(w('badge'))}</span>}
        <Md text={w('markdown')} />
      </div>
    );
    return <section style={S({ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' })}>{mediaFirst ? [media, textCol] : [textCol, media]}</section>;
  }
  if (t === 'featureGrid') {
    const cols = Number(str(w('columns'), '3')) || 3;
    return (
      <section>
        {str(w('headline')) && <h2 style={S({ margin: '0 0 14px', fontSize: 22, color: NAVY })}>{str(w('headline'))}</h2>}
        <div style={S({ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${cols >= 4 ? 150 : cols === 3 ? 190 : 260}px,1fr))`, gap: 12 })}>
          {arr(w('items')).map((it, i) => (
            <div key={i} style={S({ border: '1px solid #E3EBF3', borderRadius: 10, padding: 14, background: '#fff' })}>
              <div style={{ fontSize: 22 }}>{str(it.icon, '▪️')}</div>
              <b style={S({ display: 'block', color: NAVY, margin: '6px 0 4px', fontSize: 14.5 })}>{str(it.title)}</b>
              <span style={{ fontSize: 12.5, color: '#5E7691' }}>{str(it.desc)}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (t === 'productShowcase') {
    return (
      <section>
        {str(w('headline')) && <h2 style={S({ margin: '0 0 6px', fontSize: 22, color: NAVY })}>{str(w('headline'))}</h2>}
        {str(w('blurb')) && <p style={{ color: '#5E7691', margin: '0 0 12px' }}>{str(w('blurb'))}</p>}
        <div style={S({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 12 })}>
          {arr(w('skus')).map((s, i) => (
            <div key={i} style={S({ border: '1px solid #E3EBF3', borderRadius: 10, padding: 14, textAlign: 'center' })}>
              <div style={S({ width: 72, height: 54, margin: '0 auto 8px', background: '#F1F6FA', borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 22 })}>💾</div>
              <b style={{ color: NAVY, fontSize: 14 }}>{str(s.sku, 'SKU')}</b>
              {str(s.note) && <div style={{ fontSize: 11.5, color: CYAN, marginTop: 3 }}>{str(s.note)}</div>}
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (t === 'specComparison') {
    const cols = arr(w('columns'));
    const rows = arr(w('rows'));
    return (
      <section>
        {str(w('headline')) && <h2 style={S({ margin: '0 0 12px', fontSize: 22, color: NAVY })}>{str(w('headline'))}</h2>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr>
            <th style={S({ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E2E8F0', color: '#8CA3BA' })}>Spec</th>
            {cols.map((c, i) => <th key={i} style={S({ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #E2E8F0', color: NAVY })}>{str(c.name, 'Product')}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r, i) => {
              const vals = str(r.values).split('|').map((s) => s.trim());
              return (
                <tr key={i}>
                  <td style={S({ padding: '7px 10px', borderBottom: '1px solid #EEF2F6', color: '#5E7691' })}>{str(r.label)}</td>
                  {cols.map((_, j) => <td key={j} style={S({ padding: '7px 10px', borderBottom: '1px solid #EEF2F6', fontWeight: 700, color: NAVY })}>{vals[j] ?? '—'}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  }
  if (t === 'whereToBuy') {
    return (
      <section style={S({ border: '1px solid #E3EBF3', borderRadius: 12, padding: 20, background: '#F7FAFD' })}>
        <h2 style={S({ margin: '0 0 6px', fontSize: 21, color: NAVY })}>{str(w('headline'), 'Where to buy')}</h2>
        <p style={{ color: '#5E7691', margin: '0 0 12px' }}>{str(w('blurb'))}</p>
        <div style={S({ display: 'flex', gap: 10, flexWrap: 'wrap' })}>
          {arr(w('regions')).map((r, i) => (
            <span key={i} style={S({ border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 14px', fontSize: 13.5, color: NAVY, background: '#fff' })}>📍 {str(r.region, 'Region')}</span>
          ))}
        </div>
      </section>
    );
  }
  if (t === 'downloadDatasheet') {
    return (
      <section>
        <h2 style={S({ margin: '0 0 12px', fontSize: 21, color: NAVY })}>{str(w('headline'), 'Downloads')}</h2>
        <div style={S({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10 })}>
          {arr(w('files')).map((f, i) => (
            <span key={i} style={S({ display: 'flex', gap: 8, alignItems: 'center', border: '1px solid #E3EBF3', borderRadius: 8, padding: '9px 12px', background: '#fff', fontSize: 13.5, color: NAVY })}>📄 {str(f.label, 'File')}</span>
          ))}
        </div>
      </section>
    );
  }
  if (t === 'qvlCompatibility') {
    return (
      <section style={S({ border: `2px solid ${CYAN}`, borderRadius: 12, padding: 22, textAlign: 'center' })}>
        <h2 style={S({ margin: '0 0 6px', fontSize: 20, color: NAVY })}>{str(w('headline'), 'Compatibility check')}</h2>
        <p style={{ color: '#5E7691', margin: '0 0 10px' }}>{str(w('blurb'))}</p>
        <span style={S({ background: NAVY, color: '#fff', fontWeight: 800, borderRadius: 8, padding: '9px 18px', fontSize: 13.5, display: 'inline-block' })}>🔍 {str(w('ctaLabel'), 'Check compatibility')}</span>
      </section>
    );
  }
  if (t === 'testimonial') {
    return (
      <section>
        {str(w('headline')) && <h2 style={S({ margin: '0 0 12px', fontSize: 21, color: NAVY })}>{str(w('headline'))}</h2>}
        <div style={S({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 })}>
          {arr(w('items')).map((it, i) => (
            <figure key={i} style={S({ margin: 0, border: '1px solid #E3EBF3', borderRadius: 10, padding: 14, background: '#fff' })}>
              <blockquote style={{ margin: 0, fontSize: 13.5, color: '#33475C', fontStyle: 'italic' }}>“{str(it.quote)}”</blockquote>
              <figcaption style={S({ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 })}>
                <Media id={it.avatarMediaId} style={{ width: 30, height: 30, borderRadius: 999 }} />
                <span style={{ fontSize: 12.5, color: NAVY, fontWeight: 700 }}>{str(it.author)}{str(it.company) ? ` · ${str(it.company)}` : ''}</span>
                {str(it.verified) === 'yes' && <span style={{ fontSize: 10.5, color: '#15803D', fontWeight: 800 }}>✓ verified</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }
  if (t === 'ctaBanner') {
    const tones: Record<string, string> = { brand: `linear-gradient(120deg, ${NAVY}, #0E4E85)`, dark: '#0B1B31', light: '#EAF6FC' };
    const light = str(w('tone'), 'brand') === 'light';
    return (
      <section style={S({ borderRadius: 12, padding: '26px 30px', background: tones[str(w('tone'), 'brand')] ?? tones.brand, color: light ? NAVY : '#fff', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' })}>
        <div>
          <h2 style={S({ margin: '0 0 4px', fontSize: 22, color: light ? NAVY : '#fff' })}>{str(w('title'), 'Banner title')}</h2>
          {str(w('blurb')) && <p style={{ margin: 0, color: light ? '#5E7691' : '#C9DDF0' }}>{str(w('blurb'))}</p>}
        </div>
        {str(w('ctaLabel')) && <span style={S({ background: light ? NAVY : CYAN, color: '#fff', fontWeight: 800, borderRadius: 8, padding: '10px 20px', fontSize: 14 })}>{str(w('ctaLabel'))}</span>}
      </section>
    );
  }
  if (t === 'faqAccordion') {
    return (
      <section>
        <h2 style={S({ margin: '0 0 10px', fontSize: 21, color: NAVY })}>{str(w('headline'), 'FAQ')}</h2>
        {arr(w('items')).map((it, i) => (
          <details key={i} style={S({ border: '1px solid #E3EBF3', borderRadius: 8, padding: '10px 12px', marginBottom: 6, background: '#fff' })}>
            <summary style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{str(it.q, 'Question')}</summary>
            <div style={{ marginTop: 6 }}><Md text={it.a} /></div>
          </details>
        ))}
      </section>
    );
  }
  if (t === 'statsCounter') {
    return (
      <section style={S({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, textAlign: 'center' })}>
        {arr(w('items')).map((it, i) => (
          <div key={i}>
            <div style={{ fontSize: 32, fontWeight: 800, color: CYAN }}>{str(it.value, '0')}<span style={{ color: GOLD }}>{str(it.unit)}</span></div>
            <div style={{ fontSize: 12.5, color: '#5E7691' }}>{str(it.label)}</div>
          </div>
        ))}
      </section>
    );
  }
  if (t === 'timeline') {
    return (
      <section>
        {str(w('headline')) && <h2 style={S({ margin: '0 0 14px', fontSize: 21, color: NAVY })}>{str(w('headline'))}</h2>}
        <div style={S({ borderLeft: `3px solid ${CYAN}`, paddingLeft: 18, display: 'grid', gap: 14 })}>
          {arr(w('items')).map((it, i) => (
            <div key={i} style={S({ position: 'relative' })}>
              <span style={S({ position: 'absolute', left: -25, top: 4, width: 11, height: 11, borderRadius: 999, background: GOLD, border: `2px solid #fff` })} />
              <b style={{ color: CYAN, fontSize: 12.5 }}>{str(it.date)}</b>
              {it.mediaId != null && <Media id={it.mediaId} style={{ width: 150, height: 96, borderRadius: 8, float: 'right', marginLeft: 12 }} />}
              <b style={S({ display: 'block', color: NAVY, fontSize: 15, margin: '2px 0' })}>{str(it.title)}</b>
              <span style={{ fontSize: 13, color: '#5E7691' }}>{str(it.desc)}</span>
              <div style={{ clear: 'both' }} />
            </div>
          ))}
        </div>
      </section>
    );
  }
  return <section style={{ border: '1px dashed #CBD5E1', borderRadius: 8, padding: 12, color: '#8CA3BA', fontSize: 12.5 }}>Unknown block type “{t}”</section>;
}

const VIEWPORTS: Array<[string, number]> = [['Desktop', 1200], ['Tablet', 768], ['Mobile', 375]];

/** Responsive preview modal — desktop / tablet / mobile of the composed page. */
export function PreviewModal({ blocks, title, onClose }: { blocks: PageBlock[]; title: string; onClose: () => void }) {
  const [vp, setVp] = useState(0);
  const width = VIEWPORTS[vp][1];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,.55)', zIndex: 70, display: 'grid', alignItems: 'start', justifyContent: 'center', padding: '3vh 16px' }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Page preview"
        style={{ width: 'min(1280px, 96vw)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 14, boxShadow: '0 30px 80px rgba(2,12,28,.5)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #E3EBF3' }}>
          <b style={{ color: NAVY, flex: 1, fontSize: 14 }}>Preview — {title || 'Untitled page'}</b>
          {VIEWPORTS.map(([label, w], i) => (
            <button key={label} onClick={() => setVp(i)}
              style={{ border: vp === i ? '1px solid #00A3E0' : '1px solid #D9E4EF', background: vp === i ? '#EAF6FC' : '#fff', color: vp === i ? '#0E7FB8' : '#5E7691', borderRadius: 7, padding: '4px 12px', fontSize: 12, fontWeight: vp === i ? 800 : 500, cursor: 'pointer' }}>
              {label} <span style={{ opacity: 0.7 }}>{w}px</span>
            </button>
          ))}
          <button onClick={onClose} style={{ border: 0, background: 'none', fontSize: 15, cursor: 'pointer', color: '#8CA3BA' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: '#EFF4F9', padding: 16, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: Math.min(width, 1180), background: '#fff', borderRadius: 10, border: '1px solid #D9E4EF', padding: 18, display: 'grid', gap: 26, transition: 'width .15s' }}>
            <BlockPreview blocks={blocks} />
          </div>
        </div>
      </div>
    </div>
  );
}
