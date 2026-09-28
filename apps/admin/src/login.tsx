// P7+ MFA-capable professional login — split-screen: brand rail (navy, product
// line, security assurances) + credential card. Three steps in one component:
//   credentials → (if MFA enrolled) TOTP/backup-code challenge → signed in.
// QR rendering is LOCAL (canvas, no third-party QR service) via a tiny
// self-contained QR encoder — the TOTP URI is a secret.
import React, { useEffect, useRef, useState } from 'react';
import { API, apiGet } from './api';

const NAVY = '#0A2540'; const CYAN = '#00A3E0'; const GOLD = '#D9A441';
const cardIn: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', borderRadius: 8,
  fontSize: 14.5, marginBottom: 12, background: '#fff', boxSizing: 'border-box',
};
const btnMain: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: 0, borderRadius: 8, background: CYAN,
  color: NAVY, fontWeight: 800, fontSize: 15, cursor: 'pointer', letterSpacing: 0.2,
};

export type Me = { user?: { id: string; email: string; role: string; twoFactorEnabled?: boolean } };

export default function Login({ onDone }: { onDone: (me: Me) => void }) {
  const [step, setStep] = useState<'credentials' | 'challenge'>('credentials');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [code, setCode] = useState(''); const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const res = await fetch(API + '/auth/sign-in/email', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) {
        setErr(typeof body?.message === 'string' && body.message ? body.message : 'Sign-in failed — check your credentials.');
        return;
      }
      // Better Auth twoFactor: enabled accounts get { twoFactorRedirect: true } and NO session yet
      if ((body as { twoFactorRedirect?: boolean }).twoFactorRedirect) {
        setStep('challenge');
        return;
      }
      await finish();
    } catch { setErr('Network error — is the API running?'); } finally { setBusy(false); }
  }

  async function submitCode(e?: React.FormEvent) {
    e?.preventDefault(); setErr(''); setBusy(true);
    const trimmed = code.trim();
    try {
      const isBackup = trimmed.includes('-') && trimmed.length > 10;
      const path = isBackup ? 'verify-backup-code' : 'verify-totp';
      const payload = isBackup ? { code: trimmed, disableSession: false } : { code: trimmed };
      const res = await fetch(API + '/auth/two-factor/' + path, {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setErr(b?.message?.includes?.('lock') ? 'Account temporarily locked after too many attempts — try again shortly.'
          : 'That code was not accepted — check your authenticator and try again.');
        return;
      }
      await finish();
    } catch { setErr('Network error during verification.'); } finally { setBusy(false); }
  }

  async function finish() {
    const me = await apiGet<Me>('/auth/get-session');
    if (!me?.user) { setErr('Signed in, but the session could not be read.'); return; }
    onDone(me); // the shell offers MFA enrollment when twoFactorEnabled is false
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B1B31', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}>
      {/* ---- brand rail ---- */}
      <aside style={{
        flex: '1 1 52%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px', color: '#E8F2FA',
        background: `linear-gradient(160deg, ${NAVY} 0%, #0D3A66 58%, #0E4E85 100%)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: `linear-gradient(135deg, ${CYAN}, ${GOLD})`, display: 'grid', placeItems: 'center', fontWeight: 900, color: NAVY, fontSize: 17 }}>T</div>
          <div>
            <div style={{ fontWeight: 800, letterSpacing: 0.4 }}>TwinMOS Technologies</div>
            <div style={{ fontSize: 12, color: '#8FB4D9', letterSpacing: 1.4 }}>CMS CONTROL PANEL</div>
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 30, lineHeight: 1.25, margin: '0 0 14px', fontWeight: 800, maxWidth: 460 }}>
            Memory &amp; storage,<br />managed at scale.
          </h1>
          <p style={{ color: '#A9C6E0', maxWidth: 430, lineHeight: 1.6, fontSize: 14.5, margin: 0 }}>
            The operations console for the twinmos.com platform — content, catalog, leads,
            RMA, partners and translations in one audited workspace.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
            {['Content studio', 'Lead workflows', 'RMA board', 'Partner portal'].map(t => (
              <span key={t} style={{ fontSize: 12, padding: '5px 11px', borderRadius: 999, border: '1px solid rgba(143,180,217,.35)', color: '#C9DDF0' }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 12.5, color: '#8FB4D9' }}>
          <span>🔒 TOTP multi-factor ready</span>
          <span>🛡 Role-based access</span>
          <span>📜 Full audit trail</span>
        </div>
      </aside>

      {/* ---- credential card ---- */}
      <main style={{ flex: '1 1 48%', display: 'grid', placeItems: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {step === 'credentials' && (
            <form onSubmit={submitCredentials} style={{ background: '#fff', padding: '36px 34px', borderRadius: 16, boxShadow: '0 24px 70px rgba(2,12,28,.45)' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 21, color: NAVY }}>Staff sign-in</h2>
              <p style={{ margin: '0 0 22px', color: '#5E7691', fontSize: 13.5 }}>Authorised TwinMOS personnel only. Activity is logged.</p>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 5 }}>User ID (email)</label>
              <input autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="name@twinmos.com" type="email" required autoComplete="username" style={cardIn} />
              <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 5 }}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" type="password" required autoComplete="current-password" style={cardIn} />
              <button disabled={busy} style={{ ...btnMain, opacity: busy ? 0.6 : 1 }}>{busy ? 'Verifying…' : 'Sign in'}</button>
              {err && <p role="alert" style={{ color: '#B3261E', fontSize: 13.5, margin: '12px 0 0' }}>{err}</p>}
              <p style={{ color: '#8CA3BA', fontSize: 12, margin: '18px 0 0', textAlign: 'center' }}>
                Protected by TOTP multi-factor · TwinMOS ISO-aligned controls
              </p>
            </form>
          )}

          {step === 'challenge' && (
            <form onSubmit={submitCode} style={{ background: '#fff', padding: '36px 34px', borderRadius: 16, boxShadow: '0 24px 70px rgba(2,12,28,.45)', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, margin: '0 auto 14px', borderRadius: 12, background: `linear-gradient(135deg, ${CYAN}, #0E4E85)`, display: 'grid', placeItems: 'center', fontSize: 24 }}>🔐</div>
              <h2 style={{ margin: '0 0 6px', fontSize: 20, color: NAVY }}>Two-factor verification</h2>
              <p style={{ color: '#5E7691', fontSize: 13.5, margin: '0 0 20px' }}>
                Enter the 6-digit code from your authenticator app.<br />
                <span style={{ fontSize: 12.5 }}>You may also enter a recovery code (format XXXX-XXXX).</span>
              </p>
              <input autoFocus value={code} onChange={e => setCode(e.target.value)} placeholder="123 456" inputMode="numeric" autoComplete="one-time-code" required
                style={{ ...cardIn, textAlign: 'center', fontSize: 22, letterSpacing: 6, fontWeight: 700 }} />
              <button disabled={busy} style={{ ...btnMain, opacity: busy ? 0.6 : 1 }}>{busy ? 'Checking…' : 'Verify'}</button>
              {err && <p role="alert" style={{ color: '#B3261E', fontSize: 13.5, margin: '12px 0 0' }}>{err}</p>}
              <button type="button" onClick={() => { setStep('credentials'); setCode(''); setErr(''); }} style={{ background: 'none', border: 0, color: '#5E7691', fontSize: 13, marginTop: 16, cursor: 'pointer', textDecoration: 'underline' }}>
                Use a different account
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
