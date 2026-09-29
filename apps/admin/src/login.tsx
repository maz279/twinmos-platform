// P7+ MFA-capable professional login — split-screen: brand rail (navy, TwinMOS
// logo, product line, security assurances) + credential card. Steps:
//   credentials → (if MFA enrolled) TOTP/backup-code challenge → signed in.
// The TwinMOS wordmark is the REAL logo asset (transparent navy WebP). On the
// dark rail it sits in a frosted white glass chip so the true brand colours
// stay high-contrast at any zoom or pane width — no monochrome filter that can
// wash out against the gradient. On white cards the navy wordmark is as-is.
import React, { useState } from 'react';
import { API, apiGet } from './api';

const NAVY = '#16222F'; const CYAN = '#1DBF9F'; const GOLD = '#E8A33D';
const LOGO = '/assets/img/logo.webp';
// Rail top: the ORIGINAL navy TwinMOS wordmark on a frosted-glass chip — true
// brand colours stay visible against the dark rail regardless of width/zoom
// (a filtered monochrome wordmark can read as washed out or invisible).
const glassChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 12,
  background: 'rgba(255,255,255,.92)', borderRadius: 10, padding: '9px 14px',
  boxShadow: '0 6px 18px rgba(2,12,28,.35)', backdropFilter: 'blur(6px)',
};
const navyLogo: React.CSSProperties = { height: 22, width: 'auto', display: 'block' };

const cardIn: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #D9E0E8', borderRadius: 8,
  fontSize: 14.5, marginBottom: 14, background: '#fff', boxSizing: 'border-box',
  transition: 'border-color .15s, box-shadow .15s',
};
const cardInFocus = 'outline:none;border-color:#1DBF9F;box-shadow:0 0 0 3px rgba(29,191,159,.16)';
const btnMain: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: 0, borderRadius: 8,
  background: `linear-gradient(135deg, ${CYAN} 0%, #14A98B 100%)`,
  color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', letterSpacing: 0.3,
  transition: 'transform .12s, box-shadow .15s, opacity .15s',
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

  const focusUplift = `
    button, input { font: inherit; }
    .tm-in:focus { ${cardInFocus} }
    .tm-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(20,169,139,.35); }
    .tm-btn:active { transform: translateY(0); }
    .tm-link:hover { color: #0E9F7E; }
    @media (max-width: 880px) { .tm-rail { display: none !important; } }
  `;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F1720', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}>
      <style>{focusUplift}</style>

      {/* ---- brand rail ---- */}
      <aside className="tm-rail" style={{
        flex: '1 1 52%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '46px 58px', color: '#E7EDF3', position: 'relative', overflow: 'hidden',
        background: `linear-gradient(160deg, #182736 0%, #14212F 58%, #101B26 100%)`,
      }}>
        {/* subtle radial glow accent */}
        <div style={{ position: 'absolute', right: '-120px', top: '20%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,191,159,.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-90px', bottom: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,163,61,.09) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <span style={glassChip}>
            <img src={LOGO} alt="TwinMOS" style={navyLogo} />
          </span>
          <span style={{ width: 1, height: 26, background: 'rgba(232,242,250,.25)' }} />
          <span style={{ fontSize: 11.5, letterSpacing: 2.2, color: '#8FA3BA', fontWeight: 600 }}>CMS CONTROL PANEL</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ width: 44, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${CYAN}, ${GOLD})`, marginBottom: 20 }} />
          <h1 style={{ fontSize: 32, lineHeight: 1.22, margin: '0 0 16px', fontWeight: 800, maxWidth: 480, letterSpacing: 0.2 }}>
            Memory &amp; storage,<br />managed at scale.
          </h1>
          <p style={{ color: '#9DB0C4', maxWidth: 440, lineHeight: 1.65, fontSize: 14.5, margin: 0 }}>
            The operations console for the twinmos.com platform — content, catalog, leads,
            RMA, partners and translations in one audited workspace.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
            {['Content studio', 'Lead workflows', 'RMA board', 'Partner portal'].map(t => (
              <span key={t} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(143,180,217,.35)', color: '#C6D2DE', background: 'rgba(255,255,255,.04)' }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 26, fontSize: 12.5, color: '#7C8FA5', position: 'relative' }}>
          <span>🔒 TOTP multi-factor</span>
          <span>🛡 Role-based access</span>
          <span>📜 Full audit trail</span>
        </div>
      </aside>

      {/* ---- credential card ---- */}
      <main style={{ flex: '1 1 48%', display: 'grid', placeItems: 'center', padding: 32, background: '#0F1720' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {step === 'credentials' && (
            <form onSubmit={submitCredentials} style={{
              background: '#fff', padding: '38px 36px', borderRadius: 18,
              boxShadow: '0 28px 80px rgba(2,12,28,.55)',
            }}>
              <img src={LOGO} alt="TwinMOS" style={{ ...navyLogo, height: 30, display: 'block', margin: '0 auto 18px' }} />
              <h2 style={{ margin: '0 0 4px', fontSize: 21, color: NAVY, textAlign: 'center' }}>Staff sign-in</h2>
              <p style={{ margin: '0 0 24px', color: '#66748A', fontSize: 13.5, textAlign: 'center' }}>
                Authorised TwinMOS personnel only. Activity is logged.
              </p>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>User ID (email)</label>
              <input className="tm-in" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="name@twinmos.com" type="email" required autoComplete="username" style={cardIn} />
              <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>Password</label>
              <input className="tm-in" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" type="password" required autoComplete="current-password" style={cardIn} />
              <button className="tm-btn" disabled={busy} style={{ ...btnMain, opacity: busy ? 0.65 : 1 }}>{busy ? 'Verifying…' : 'Sign in'}</button>
              {err && <p role="alert" style={{ color: '#C2453C', fontSize: 13.5, margin: '14px 0 0', textAlign: 'center' }}>{err}</p>}
              <p style={{ color: '#93A0B4', fontSize: 12, margin: '20px 0 0', textAlign: 'center' }}>
                Protected by TOTP multi-factor · TwinMOS ISO-aligned controls
              </p>
            </form>
          )}

          {step === 'challenge' && (
            <form onSubmit={submitCode} style={{
              background: '#fff', padding: '38px 36px', borderRadius: 18,
              boxShadow: '0 28px 80px rgba(2,12,28,.55)', textAlign: 'center',
            }}>
              <img src={LOGO} alt="TwinMOS" style={{ ...navyLogo, height: 26, display: 'block', margin: '0 auto 16px' }} />
              <div style={{ width: 54, height: 54, margin: '0 auto 16px', borderRadius: 14, background: `linear-gradient(135deg, ${CYAN}, #14A98B)`, display: 'grid', placeItems: 'center', fontSize: 26 }}>🔐</div>
              <h2 style={{ margin: '0 0 6px', fontSize: 20, color: NAVY }}>Two-factor verification</h2>
              <p style={{ color: '#66748A', fontSize: 13.5, margin: '0 0 22px' }}>
                Enter the 6-digit code from your authenticator app.<br />
                <span style={{ fontSize: 12.5 }}>You may also enter a recovery code (format XXXX-XXXX).</span>
              </p>
              <input className="tm-in" autoFocus value={code} onChange={e => setCode(e.target.value)} placeholder="123 456" inputMode="numeric" autoComplete="one-time-code" required
                style={{ ...cardIn, textAlign: 'center', fontSize: 22, letterSpacing: 6, fontWeight: 700 }} />
              <button className="tm-btn" disabled={busy} style={{ ...btnMain, opacity: busy ? 0.65 : 1 }}>{busy ? 'Checking…' : 'Verify'}</button>
              {err && <p role="alert" style={{ color: '#C2453C', fontSize: 13.5, margin: '14px 0 0' }}>{err}</p>}
              <button type="button" onClick={() => { setStep('credentials'); setCode(''); setErr(''); }} className="tm-link" style={{ background: 'none', border: 0, color: '#66748A', fontSize: 13, marginTop: 18, cursor: 'pointer', textDecoration: 'underline' }}>
                Use a different account
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
