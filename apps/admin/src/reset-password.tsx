import React, { useState } from 'react';
import { API } from './api';

const NAVY = '#16222F';
const CYAN = '#1DBF9F';
const LOGO = `${import.meta.env.BASE_URL}assets/img/logo.webp`;

const cardIn: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #D9E0E8', borderRadius: 8,
  fontSize: 14.5, marginBottom: 14, background: '#fff', boxSizing: 'border-box',
};
const btnMain: React.CSSProperties = {
  width: '100%', padding: '13px 18px', border: 0, borderRadius: 8,
  background: CYAN, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
};

export default function ResetPassword({
  token,
  onDone,
}: {
  token: string;
  onDone: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 10) {
      setErr('Password must be at least 10 characters.');
      return;
    }
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(API + '/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newPassword: password,
          token,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || body?.detail || 'Password reset failed');
      }
      setSuccess(true);
    } catch (e: any) {
      setErr(e.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      background: '#fff', padding: '38px 36px', borderRadius: 18,
      boxShadow: '0 28px 80px rgba(2,12,28,.55)', maxWidth: 400, width: '100%',
    }}>
      <img src={LOGO} alt="TwinMOS" style={{ height: 28, width: 'auto', display: 'block', margin: '0 auto 18px' }} />
      <h2 style={{ margin: '0 0 6px', fontSize: 20, color: NAVY, textAlign: 'center' }}>Choose new password</h2>
      <p style={{ margin: '0 0 20px', color: '#66748A', fontSize: 13.5, textAlign: 'center' }}>
        Enter a new secure password (minimum 10 characters).
      </p>

      {success ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E6F8F4', color: CYAN, fontSize: 24, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>✓</div>
          <p style={{ color: NAVY, fontWeight: 700, margin: '0 0 8px' }}>Password Updated</p>
          <p style={{ color: '#66748A', fontSize: 13, lineHeight: 1.5, margin: '0 0 24px' }}>
            Your account password has been updated. All previous sessions have been revoked.
          </p>
          <button type="button" onClick={onDone} style={{ ...btnMain, background: NAVY }}>Sign In Now</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>New password</label>
          <input
            className="tm-in"
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 10 characters"
            style={cardIn}
          />
          <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>Confirm password</label>
          <input
            className="tm-in"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            style={cardIn}
          />
          <button className="tm-btn" disabled={busy} style={{ ...btnMain, opacity: busy ? 0.65 : 1 }}>
            {busy ? 'Updating…' : 'Set new password'}
          </button>
          {err && <p role="alert" style={{ color: '#C2453C', fontSize: 13, margin: '14px 0 0', textAlign: 'center' }}>{err}</p>}
        </form>
      )}
    </div>
  );
}
