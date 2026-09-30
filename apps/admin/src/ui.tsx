// Shared UI atoms + the console design tokens (2026 reference restyle).
// Palette extracted from the approved design boards in admin_panel/design_sample:
// deep-navy sidebar, teal accent, light-gray canvas, white soft-shadow cards.
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
 *  console font, teal focus rings, thin dark scrollbars for the sidebar. The
 *  main > :first-child rule keeps the module pages' top gap after the shell
 *  moved main's padding-top to 0 — Chrome resolves a sticky child's top:0
 *  against the scroll container's content box, so padding-top on main itself
 *  would leave a strip where scrolled content passes ABOVE a pinned bar. */
export const globalCss = `
  main > :first-child { padding-top: 22px; }
  button, input, select, textarea { font: inherit; }
  .tm-in:focus { outline: none; border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(29,191,159,.16); }
  button:focus-visible, a:focus-visible { outline: 2px solid ${TEAL}; outline-offset: 1px; }
  .tm-scroll::-webkit-scrollbar { width: 8px; }
  .tm-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 8px; }
  .tm-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.24); }
  .tm-scroll-light::-webkit-scrollbar { width: 8px; height: 8px; }
  .tm-scroll-light::-webkit-scrollbar-thumb { background: #D3DAE3; border-radius: 8px; }
  /* tab strip scrolls horizontally when crowded — hide the bar (wheel/drag still work) */
  .tm-tabs-scroll { scrollbar-width: none; -ms-overflow-style: none; }
  .tm-tabs-scroll::-webkit-scrollbar { display: none; }
  /* professional row affordance on every data table */
  main table tbody tr:hover td { background: #F8FAFB; }
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
/** djb2 hashed to base36 — a short stable id for a useAsync CALL SITE. `fn` is
 *  re-created every render, but its source text is byte-identical across
 *  renders of the same call site, so the hash is a stable key component. */
function fnKeyOf(fn: () => unknown): string {
  let h = 5381;
  const src = fn.toString();
  for (let i = 0; i < src.length; i++) h = (((h << 5) + h + src.charCodeAt(i)) >>> 0);
  return h.toString(36);
}

/** Data-fetching hook behind every module view, backed by TanStack Query
 *  (TASK 6.1). Public contract — { data: T|null, error, loading, reload } — is
 *  unchanged, so no caller needed to move.
 *
 *  The query key is [fnKey, ...deps]: fnKey identifies the call site (a djb2
 *  hash of the fetcher's source text — see fnKeyOf) and deps carry its
 *  parameters (strings/numbers in every caller, so keys serialize and collide
 *  only intentionally). Because keys are shared app-wide, two workspace tabs
 *  viewing the same data resolve to ONE cache entry: switching tabs paints from
 *  cache within the client's staleTime (60s), mounted views refetch together on
 *  window focus, and in-flight requests for the same key are deduped.
 *
 *  `loading` maps to Query's isPending (true only while NO data exists yet for
 *  the current key), matching the previous hook's visible behavior — the
 *  "Loading…" placeholder shows on first load and on dep changes, while
 *  background refetches keep the previous data on screen. `reload()` invalidates
 *  exactly this key, refetching every active view of it. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | null; error: unknown; loading: boolean; reload: () => void } {
  const qc = useQueryClient();
  const fnKey = fnKeyOf(fn);
  const queryKey = [fnKey, ...deps];
  const q = useQuery<T>({ queryKey, queryFn: fn });
  return {
    data: q.data ?? null,
    error: q.error,
    loading: q.isPending,
    reload: () => { void qc.invalidateQueries({ queryKey }); },
  };
}

/** The SAME key useAsync derives for a fetch site — pass the identical fn and
 *  deps so an optimistic mutation writes into exactly the cache entry the
 *  view reads. Exported for useOptimisticUpdate callers. */
export function queryKeyOf(fn: () => unknown, deps: unknown[]): readonly unknown[] {
  return [fnKeyOf(fn), ...deps];
}

/** §6.1 optimistic updates with automatic rollback. `apply` rewrites the
 *  cached data the moment the user acts; the server call then runs — on
 *  failure the snapshot is restored verbatim, on success the key is
 *  invalidated so the truth refetches. `mutate` returns the promise so
 *  callers can toast on settle. */
export function useOptimisticUpdate<TData, TVars>(opts: {
  /** Same fn/deps the view's useAsync uses — the cache entry to patch. */
  fn: () => unknown;
  deps: unknown[];
  mutationFn: (vars: TVars) => Promise<unknown>;
  /** Pure rewrite of the cached value for the optimistic state. */
  apply: (cached: TData, vars: TVars) => TData;
}): { mutate: (vars: TVars) => Promise<void>; pending: boolean } {
  const qc = useQueryClient();
  const key = queryKeyOf(opts.fn, opts.deps);
  const [pending, setPending] = React.useState(false);
  const mutate = React.useCallback(async (vars: TVars) => {
    setPending(true);
    // cancel in-flight fetches for this key so a refetch cannot overwrite
    // the optimistic write mid-flight
    await qc.cancelQueries({ queryKey: key as unknown[] });
    const previous = qc.getQueryData<TData>(key as unknown[]);
    if (previous !== undefined) qc.setQueryData(key as unknown[], opts.apply(previous, vars));
    try {
      await opts.mutationFn(vars);
      await qc.invalidateQueries({ queryKey: key as unknown[] });
    } catch (e) {
      if (previous !== undefined) qc.setQueryData(key as unknown[], previous); // rollback
      throw e;
    } finally {
      setPending(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc, opts.mutationFn, opts.apply, key.join('\u0001')]);
  return { mutate, pending };
}

/** §6.4 command bar — the sticky contextual action ribbon pinned above
 *  long-scrolling editor forms (Save / Publish / Back…). Stays flush at the
 *  top of the scroll container, white with a hairline + shadow so scrolled
 *  content slides under it. */
export function CommandBar({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      background: '#fff', borderBottom: `1px solid ${LINE}`,
      boxShadow: CARD_SHADOW, borderRadius: 8, padding: '8px 12px',
      ...style,
    }}>{children}</div>
  );
}

// ---- layout & form primitives (Phase 6.4/6.5) ------------------------------
// Extracted from the patterns repeated across the module views so editors stop
// re-declaring them inline. Built ONLY from the tokens above — no new colors,
// no new sizes: each primitive renders the same styles as the inline markup it
// replaces. Call sites may override spacing via `style` where their local
// rhythm differed (e.g. gap 10 toolbars), which keeps the conversion pixel-faithful.

/** Responsive form grid — the 6.5 multi-column discipline. One shared
 *  auto-fit minmax pattern for editor forms: columns never shrink below `min`
 *  px (default 150, the products Variants form's proven value) and empty
 *  tracks collapse, so a two-field row (compatibility's Memory gen / Form
 *  factor) fills its card exactly like the old `1fr 1fr` while narrow windows
 *  drop to a single column instead of overflowing. Use a larger `min` where a
 *  form must keep fewer, wider columns. */
export function formGrid(min = 150): React.CSSProperties {
  return { display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`, gap: 10 };
}

/** Uppercase micro-label + control wrapper — the caption style repeated in
 *  every editor form (compatibility, product variants, jobs, translations):
 *  11px / 800 / uppercase FAINT with the 10px-over-4px rhythm. `hint` renders
 *  the non-uppercase parenthetical some fields carry (e.g. a suggested SKU). */
export function Field({ label, hint, children, style }: {
  label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <label style={{ display: 'block', minWidth: 0, ...style }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: FAINT, display: 'block', margin: '10px 0 4px' }}>
        {label}{hint != null && <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>{' '}{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Filter-chip / toolbar row — the flex-wrap container above data tables and
 *  around editor action rows. Defaults reproduce the module filter rows
 *  (gap 8, centered, 12px bottom margin); pass `style` for the local variants
 *  (e.g. `{{ gap: 10 }}`) so converted call sites keep their exact spacing. */
export function Toolbar({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '0 0 12px', ...style }}>{children}</div>;
}

/** Module page header: 22px / 800 ink title, muted 13px subtitle underneath
 *  and a right-aligned action row — the markup the compatibility and content
 *  studio headers render inline today. No bottom margin by default; add one
 *  via `style` to reproduce a page's existing rhythm. */
export function PageHeader({ title, subtitle, actions, style }: {
  title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', ...style }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: INK, letterSpacing: -0.2 }}>{title}</h1>
        {subtitle != null && <p style={{ margin: '4px 0 0', color: MUTED, fontSize: 13 }}>{subtitle}</p>}
      </div>
      {actions != null && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

/** White rounded section card with an h3 title — the container repeated across
 *  the products editor, the variants tab and the compatibility form: 1px LINE
 *  border, 12px radius, `4px 16px 16px` padding on #fff, and a plain h3 with
 *  the 12px top rhythm (inherited color, so it matches today's headings).
 *  `divider` swaps in the dashboard-style heading row (title + FAINT subtitle
 *  over a #F0F3F7 hairline). `collapsible` turns the heading into a chevron
 *  toggle for progressive disclosure — default open; pass `defaultOpen={false}`
 *  for sections that start collapsed (e.g. the products Record card). */
export function SectionCard({ title, subtitle, children, collapsible = false, defaultOpen = true, divider = false, style, titleStyle }: {
  title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode;
  collapsible?: boolean; defaultOpen?: boolean; divider?: boolean;
  style?: React.CSSProperties; titleStyle?: React.CSSProperties;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  let header: React.ReactNode;
  if (divider) {
    header = (
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginTop: 12, marginBottom: 10, paddingBottom: 9, borderBottom: '1px solid #F0F3F7' }}>
        <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: INK, ...titleStyle }}>{title}</h3>
        {subtitle != null && <span style={{ fontSize: 11.5, color: FAINT }}>{subtitle}</span>}
      </div>
    );
  } else if (collapsible) {
    header = (
      // the <h3> stays the section heading and WRAPS the toggle button —
      // heading content permits interactive phrasing elements, whereas an
      // <h3> inside <button> is invalid HTML and swallows the heading for
      // screen readers (review finding, ui.tsx collapsible header).
      <h3 style={{ margin: 0, marginTop: 12, ...titleStyle }}>
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}
          title={open ? 'Collapse section' : 'Expand section'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: 0, border: 0, background: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' }}>
          <span>{title}</span>
          {subtitle != null && <span style={{ fontSize: 11.5, color: FAINT }}>{subtitle}</span>}
          {/* same chevron glyph as icons.tsx, inlined so ui.tsx keeps no imports beyond React */}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            style={{ marginLeft: 'auto', flexShrink: 0, color: FAINT, transform: open ? 'rotate(90deg)' : 'none' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </h3>
    );
  } else {
    header = <h3 style={{ marginTop: 12, ...titleStyle }}>{title}</h3>;
  }
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: '4px 16px 16px', background: '#fff', minWidth: 0, ...style }}>
      {header}
      {collapsible ? (open ? <div style={{ marginTop: 4 }}>{children}</div> : null) : children}
    </div>
  );
}
