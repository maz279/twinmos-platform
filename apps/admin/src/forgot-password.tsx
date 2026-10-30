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

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(API + '/auth/forget-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: window.location.origin + window.location.pathname + '#reset',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || body?.detail || 'Request failed');
      }
      setSent(true);
    } catch (e: any) {
      setErr(e.message || 'Failed to dispatch reset email.');
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
      <h2 style={{ margin: '0 0 6px', fontSize: 20, color: NAVY, textAlign: 'center' }}>Reset password</h2>
      <p style={{ margin: '0 0 20px', color: '#66748A', fontSize: 13.5, textAlign: 'center' }}>
        Enter your verified email address to receive secure reset instructions.
      </p>

      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E6F8F4', color: CYAN, fontSize: 24, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>✓</div>
          <p style={{ color: NAVY, fontWeight: 700, margin: '0 0 8px' }}>Instructions Dispatched</p>
          <p style={{ color: '#66748A', fontSize: 13, lineHeight: 1.5, margin: '0 0 24px' }}>
            If an account is associated with <b>{email}</b>, password reset instructions have been dispatched. The secure link is valid for 1 hour.
          </p>
          <button type="button" onClick={onBack} style={{ ...btnMain, background: NAVY }}>Return to Sign-in</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor="forgot-email" style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>Email address</label>
          <input
            id="forgot-email"
            className="tm-in"
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@twinmos.com"
            style={cardIn}
          />
          <button className="tm-btn" disabled={busy} style={{ ...btnMain, opacity: busy ? 0.65 : 1 }}>
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
          {err && <p role="alert" style={{ color: '#C2453C', fontSize: 13, margin: '14px 0 0', textAlign: 'center' }}>{err}</p>}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              type="button"
              onClick={onBack}
              style={{ background: 'none', border: 0, color: '#66748A', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              Back to sign-in
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
