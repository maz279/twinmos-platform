// P1.4: forced password-rotation screen. Accounts invited with a system-
// generated temporary credential land here before the workspace unlocks —
// the server refuses every /admin route until the rotation completes
// (app.ts guard). Flow: Better Auth change-password with the temporary
// credential, then clear the flag via /admin/users/me/accept-password.
import React, { useState } from 'react';
import { API, ApiError, apiSend } from './api';

const CYAN = '#14A98B';

const card: React.CSSProperties = {
  width: 'min(430px, 92vw)', background: '#fff', borderRadius: 14, padding: '30px 28px',
  boxShadow: '0 18px 50px rgba(10,30,45,.14)', border: '1px solid #E5EBF1',
};
const input: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #D8E0E8', borderRadius: 8,
  fontSize: 15, marginBottom: 14, outline: 'none', background: '#fff',
};
const btn: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: 0, borderRadius: 8,
  background: `linear-gradient(135deg, ${CYAN} 0%, #14A98B 100%)`,
  color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', letterSpacing: 0.3,
};

export default function ForcePasswordChange({ onDone, email }: { onDone: () => void; email: string }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (next.length < 10) { setErr('New password must be at least 10 characters.'); return; }
      if (next !== confirm) { setErr('The two new-password entries do not match.'); return; }
      // 1) rotate through Better Auth (temporary credential is the current one)
      await apiSend('POST', '/auth/change-password', { currentPassword: current, newPassword: next, revokeOtherSessions: true });
      // change-password rotates the session token — sign in fresh with the new
      // password so the accept call carries a live session cookie.
      await fetch(API + '/auth/sign-in/email', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ email, password: next }),
      });
      // 2) clear the rotation flag (allowlisted past the admin guard)
      await apiSend('POST', '/admin/users/me/accept-password', {});
      onDone();
    } catch (ex) {
      setErr(ex instanceof ApiError ? `${ex.message}${ex.detail ? ' — ' + ex.detail : ''}` : 'Password change failed — please retry.');
    } finally { setBusy(false); }  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(1200px 500px at 70% -10%, #E8F6F1 0%, #F2F4F6 55%)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <form style={card} onSubmit={submit}>
        <div style={{ fontSize: 13, fontWeight: 800, color: CYAN, letterSpacing: 2, marginBottom: 6 }}>SECURITY · REQUIRED</div>
        <h1 style={{ fontSize: 23, margin: '0 0 8px', color: '#16222F' }}>Set your own password</h1>
        <p style={{ fontSize: 13.5, color: '#5B6B7B', margin: '0 0 18px', lineHeight: 1.5 }}>
          The account <b>{email}</b> was invited with a temporary password. Choose a new one to unlock the console — every admin function stays disabled until then.
        </p>
        <input style={input} type="password" placeholder="Temporary password (from your invite email)" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        <input style={input} type="password" placeholder="New password (10+ characters)" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required minLength={10} />
        <input style={input} type="password" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        {err && <div role="alert" style={{ color: '#B3261E', fontSize: 13, margin: '-4px 0 12px' }}>{err}</div>}
        <button style={{ ...btn, opacity: busy ? 0.7 : 1 }} type="submit" disabled={busy}>{busy ? 'Saving…' : 'Set password & continue'}</button>
      </form>
    </div>
  );
}
