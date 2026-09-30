// Global toast + notification system (Phase 6.3).
// A single ToastProvider mounted in main.tsx above <App/>, so both the Login
// screen and the console Shell can raise notifications. The floating stack is
// pinned bottom-right and layered ABOVE every overlay in the console (the
// highest today is zIndex 1000 in modules/users.tsx) — toasts must stay
// reachable while a dialog is open.
//
// Behaviour contract (master plan §6.3 — admin_panel/plan/
// TwinMOS_Admin_Panel_and_CMS_Comprehensive_Audit_and_Improvement_Plan.md;
// delivery recorded under "Evidence — Phase 6" in docs/08-ADMIN-CONSOLE-PLAN.md):
//   • auto-dismiss 5s, or 10s when the toast carries an action button
//     (both overridable per-call via durationMs)
//   • click anywhere on the card to dismiss
//   • at most 4 stacked — the oldest slides out first
//   • the region is aria-live="polite"; the action is a real <button>, so it
//     is reachable and activatable from the keyboard
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CARD_SHADOW, GREEN, IconChip, INK, LINE, TEAL } from './ui';

export type ToastKind = 'success' | 'error' | 'info';
export type ToastAction = { label: string; run: () => void };
export type ToastOptions = { action?: ToastAction; durationMs?: number };
export type ToastApi = {
  success(msg: string, opts?: ToastOptions): void;
  error(msg: string, opts?: ToastOptions): void;
  info(msg: string, opts?: ToastOptions): void;
};

const MAX_STACKED = 4;
const DEFAULT_MS = 5000;
const WITH_ACTION_MS = 10000;
// Above the users.tsx modals (zIndex 1000), the media-picker / preview
// overlays (70) and the ⌘K palette (60).
const TOAST_LAYER = 1100;
const ERROR = '#C2453C'; // error tint named by the plan; the one colour not in ui.tsx

const TONE: Record<ToastKind, string> = { success: GREEN, error: ERROR, info: TEAL };
const GLYPH: Record<ToastKind, string> = { success: '✓', error: '!', info: 'i' };

type ToastItem = { id: number; kind: ToastKind; msg: string; action?: ToastAction };

const ToastCtx = React.createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Authoritative mirror of the stack: push() can fire twice inside one tick
  // (a batch of failures), and reading `toasts` there would see a stale list.
  const stackRef = useRef<ToastItem[]>([]);
  const timers = useRef(new Map<number, number>());
  const seq = useRef(0);

  const clearTimer = useCallback((id: number) => {
    const h = timers.current.get(id);
    if (h !== undefined) { clearTimeout(h); timers.current.delete(id); }
  }, []);

  const dismiss = useCallback((id: number) => {
    clearTimer(id);
    const next = stackRef.current.filter((t) => t.id !== id);
    stackRef.current = next;
    setToasts(next);
  }, [clearTimer]);

  const push = useCallback((kind: ToastKind, msg: string, opts?: ToastOptions) => {
    const item: ToastItem = { id: ++seq.current, kind, msg, action: opts?.action };
    const next = [...stackRef.current, item];
    // Cap the stack at 4: the OLDEST slides out. Its pending timer must be
    // cancelled too, or an overflow-dropped toast leaves a dead handle behind.
    const overflow = next.length > MAX_STACKED ? next.slice(0, next.length - MAX_STACKED) : [];
    for (const gone of overflow) clearTimer(gone.id);
    const kept = next.slice(-MAX_STACKED);
    stackRef.current = kept;
    setToasts(kept);
    const ms = opts?.durationMs ?? (opts?.action ? WITH_ACTION_MS : DEFAULT_MS);
    timers.current.set(item.id, window.setTimeout(() => dismiss(item.id), ms));
  }, [clearTimer, dismiss]);

  // Never leak timers if the provider unmounts with toasts still in flight.
  useEffect(() => () => { for (const h of timers.current.values()) clearTimeout(h); }, []);

  // push is stable, so the API identity is stable too — consumers that list it
  // in dep arrays (or hand it to memoised callbacks) never re-subscribe.
  const api = useMemo<ToastApi>(() => ({
    success: (m, o) => push('success', m, o),
    error: (m, o) => push('error', m, o),
    info: (m, o) => push('info', m, o),
  }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* Live region: additions are announced politely. The container itself
          is click-through so it never blocks the page beneath empty space. */}
      <div aria-live="polite" aria-atomic="false" style={{
        position: 'fixed', right: 16, bottom: 16, zIndex: TOAST_LAYER,
        display: 'flex', flexDirection: 'column', gap: 10,
        width: 'min(380px, calc(100vw - 32px))', pointerEvents: 'none',
      }}>
        {toasts.map((t) => {
          const tone = TONE[t.kind];
          return (
            <div key={t.id} onClick={() => dismiss(t.id)} title="Dismiss"
              style={{
                pointerEvents: 'auto', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 11,
                background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12,
                boxShadow: CARD_SHADOW, padding: '11px 13px',
                borderLeft: `4px solid ${tone}`,
              }}>
              <IconChip tint={tone} size={28}>
                <span style={{ fontWeight: 800, fontSize: 14, lineHeight: 1 }}>{GLYPH[t.kind]}</span>
              </IconChip>
              <div style={{
                flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.45, color: INK,
                overflowWrap: 'anywhere', whiteSpace: 'pre-line',
              }}>{t.msg}</div>
              {t.action && (
                <button onClick={(e) => { e.stopPropagation(); t.action!.run(); dismiss(t.id); }}
                  style={{
                    flexShrink: 0, padding: '6px 11px', borderRadius: 8, border: 0,
                    background: tone, color: '#fff', fontWeight: 700, fontSize: 12.5,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>{t.action.label}</button>
              )}
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
