// Shared UI atoms + the console design tokens (2026 reference restyle).
// Palette extracted from the approved design boards in admin_panel/design_sample:
// deep-navy sidebar, teal accent, light-gray canvas, white soft-shadow cards.
import React from 'react';

// ---- design tokens -------------------------------------------------------
export const NAVY = '#16222F';   // sidebar / brand rail
export const INK = '#1F2A37';    // headings on white
export const TEAL = '#1DBF9F';   // primary accent (buttons, active nav, charts)
export const TEAL_DK = '#0E9F7E';// accent text / pressed states
export const GOLD = '#E8A33D';   // secondary (RMA / warnings)
export const RED = '#E0524D';
export const GREEN = '#1F9D62';
export const BLUE = '#3E8DDD';
export const PURPLE = '#7C5CDB';
export const MUTED = '#66748A';  // secondary text
export const FAINT = '#93A0B4';  // captions / placeholders
export const LINE = '#E6EBF1';   // card borders
export const PAGE = '#F2F4F6';   // canvas behind cards

export const CARD_SHADOW = '0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.04)';

/** Global polish rendered once by the shell/login: form controls inherit the
 *  console font, teal focus rings, thin dark scrollbars for the sidebar. */
export const globalCss = `
  button, input, select, textarea { font: inherit; }
  .tm-in:focus { outline: none; border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(29,191,159,.16); }
  button:focus-visible, a:focus-visible { outline: 2px solid ${TEAL}; outline-offset: 1px; }
  .tm-scroll::-webkit-scrollbar { width: 8px; }
  .tm-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 8px; }
  .tm-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.24); }
  .tm-scroll-light::-webkit-scrollbar { width: 8px; height: 8px; }
  .tm-scroll-light::-webkit-scrollbar-thumb { background: #D3DAE3; border-radius: 8px; }
  .tm-card-hover { transition: box-shadow .14s, border-color .14s, transform .14s; }
  .tm-card-hover:hover { border-color: ${TEAL}; box-shadow: 0 6px 18px rgba(16,24,40,.10); }
`;

// ---- atoms ----------------------------------------------------------------
export const card: React.CSSProperties = {
  border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, background: '#fff',
  boxShadow: CARD_SHADOW,
};
export const btn: React.CSSProperties = {
  padding: '8px 14px', border: 0, borderRadius: 8,
  background: `linear-gradient(135deg, ${TEAL} 0%, #17A98D 100%)`,
  color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13,
  boxShadow: '0 1px 2px rgba(14,159,126,.30)',
};
export const btnGhost: React.CSSProperties = {
  padding: '8px 14px', border: `1px solid ${LINE}`, borderRadius: 8,
  background: '#fff', color: INK, fontWeight: 600, cursor: 'pointer', fontSize: 13,
};
export const input: React.CSSProperties = {
  padding: '8px 11px', border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13,
  background: '#fff', color: INK,
};

/** Rounded icon chip used by KPI tiles and module cards (teal-tinted). */
export function IconChip({ children, tint = TEAL, size = 34 }: { children: React.ReactNode; tint?: string; size?: number }) {
  return (
    <span style={{
      display: 'grid', placeItems: 'center', width: size, height: size, flexShrink: 0,
      borderRadius: Math.round(size * 0.28), background: tint + '1C', color: tint, fontSize: size * 0.48,
    }}>{children}</span>
  );
}

export function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <b style={{ fontSize: 26, color: INK }}>{value}</b>
      <span>{label}</span>
      {hint && <span style={{ fontSize: 12, color: MUTED }}>{hint}</span>}
    </div>
  );
}

const TONES: Record<string, string> = {
  new: TEAL, submitted: TEAL, under_review: PURPLE, approved: GREEN,
  in_repair: GOLD, shipped: BLUE, delivered: GREEN, closed: '#64748B',
  assigned: PURPLE, resolved: GREEN, spam: RED, draft: '#64748B',
  in_review: GOLD, scheduled: BLUE, published: GREEN, archived: '#94A3B8',
};
export function Badge({ value }: { value: string }) {
  const tone = TONES[value] ?? '#64748B';
  return <span style={{ background: tone + '1C', color: tone, border: `1px solid ${tone}44`, borderRadius: 99, padding: '2px 10px', fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{value.replace(/_/g, ' ')}</span>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>{head.map((h) => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', borderBottom: `1px solid ${LINE}`, color: FAINT, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export const td: React.CSSProperties = { padding: '9px 10px', borderBottom: `1px solid #F0F3F7`, verticalAlign: 'top', color: INK };

export function Empty({ text }: { text: string }) {
  return <p style={{ color: MUTED, padding: 18, textAlign: 'center', fontSize: 13 }}>{text}</p>;
}
export function Err({ error }: { error: unknown }) {
  const e = error as { message?: string; detail?: string; status?: number };
  return <p role="alert" style={{ background: '#FCECEB', color: '#9C3230', borderRadius: 8, padding: 10 }}>{e?.status ? `HTTP ${e.status}: ` : ''}{e?.message ?? String(error)}{e?.detail ? ` — ${e.detail}` : ''}</p>;
}
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | null; error: unknown; loading: boolean; reload: () => void } {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(true);
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fn().then((d) => { if (alive) { setData(d); setError(null); } })
      .catch((e) => { if (alive) setError(e); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}
