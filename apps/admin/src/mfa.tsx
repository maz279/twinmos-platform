// P7+ MFA enrollment — offered in the shell after sign-in when
// twoFactorEnabled is false. Flow: confirm password → server returns TOTP URI
// + backup codes → user scans a LOCALLY-rendered QR (the `qrcode` package —
// rendered in-browser; the secret URI never leaves the page) → enters a live
// code → verify-totp flips twoFactorEnabled. Backup codes are shown once with
// a download button.
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { API } from './api';

const NAVY = '#1F2A37'; const CYAN = '#1DBF9F';
const LOGO = '/assets/img/logo.webp';
const cardIn: React.CSSProperties = {
  width: '100%', padding: '11px 13px', border: '1px solid #D9E0E8', borderRadius: 8,
  fontSize: 14, marginBottom: 12, background: '#fff', boxSizing: 'border-box',
};
const btnMain: React.CSSProperties = {
  padding: '11px 18px', border: 0, borderRadius: 8, background: CYAN, color: '#fff',
  fontWeight: 800, fontSize: 14.5, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = { ...btnMain, background: '#F2F5F8' };

function QrCanvas({ text, size = 190 }: { text: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!ref.current || !text) return;
    QRCode.toCanvas(ref.current, text, { width: size, margin: 2, color: { dark: '#16222F', light: '#ffffff' } })
      .then(() => setFailed(false))
      .catch(() => setFailed(true));
  }, [text, size]);
  if (failed) return <p style={{ color: '#C2453C', fontSize: 13 }}>QR render failed — enter the key manually below.</p>;
  return <canvas ref={ref} style={{ width: size, height: size, borderRadius: 8, border: '1px solid #E6EBF1' }} />;
}

export default function MfaSetup({ onEnrolled, onSkip }: { onEnrolled: () => void; onSkip: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'enroll' | 'done'>('idle');
  const [totpURI, setTotpURI] = useState(''); const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [pw, setPw] = useState(''); const [code, setCode] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true); setErr('');
    try {
      const res = await fetch(API + '/auth/two-factor/enable', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ password: pw }),
      });
      const body = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) { setErr(String((body as { message?: string }).message || 'Could not start enrollment — check the password.')); return; }
      setTotpURI(String((body as { totpURI?: string }).totpURI || ''));
      setBackupCodes(((body as { backupCodes?: unknown[] }).backupCodes ?? []).map(String));
      setPhase('enroll');
    } catch { setErr('Network error.'); } finally { setBusy(false); }
  }

  async function confirm() {
    setBusy(true); setErr('');
    try {
      const res = await fetch(API + '/auth/two-factor/verify-totp', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) { setErr('Code not accepted — make sure your authenticator shows "TwinMOS Admin".'); return; }
      setPhase('done');
    } catch { setErr('Network error during verification.'); } finally { setBusy(false); }
  }

  const secret = (totpURI.match(/secret=([A-Za-z2-7]+)/) || [])[1] || '';

  return (
    <div style={{ maxWidth: 580, margin: '24px auto', background: '#fff', borderRadius: 14, padding: '26px 28px', border: '1px solid #E6EBF1', boxShadow: '0 10px 34px rgba(10,37,64,.10)' }}>
      <img src={LOGO} alt="TwinMOS" style={{ height: 26, width: 'auto', display: 'block', margin: '0 auto 10px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>🛡️</span>
        <h2 style={{ margin: 0, fontSize: 19, color: NAVY }}>Secure your account — enable MFA</h2>
      </div>
      <p style={{ color: '#66748A', fontSize: 13.5, margin: '0 0 18px' }}>
        TwinMOS staff accounts use time-based one-time passwords (TOTP). Scan the QR with Google Authenticator,
        Microsoft Authenticator, 1Password or any TOTP app, then confirm with a live code.
      </p>

      {phase === 'idle' && (
        <>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 5 }}>Confirm your password to begin</label>
          <input autoFocus type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••••" style={cardIn} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button disabled={busy || !pw} onClick={start} style={{ ...btnMain, opacity: busy || !pw ? 0.5 : 1 }}>{busy ? 'Starting…' : 'Begin setup'}</button>
            <button onClick={onSkip} style={btnGhost}>Not now</button>
          </div>
        </>
      )}

      {phase === 'enroll' && (
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <QrCanvas text={totpURI} size={190} />
            <p style={{ fontSize: 12, color: '#93A0B4', margin: '8px 0 0' }}>Scan with your authenticator</p>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 6px' }}>Can't scan? Enter this key manually:</p>
            <code style={{ display: 'block', background: '#F1F6FB', borderRadius: 8, padding: '8px 10px', fontSize: 13, letterSpacing: 1, wordBreak: 'break-all', marginBottom: 14 }}>{secret || '—'}</code>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 5 }}>Enter the 6-digit code</label>
            <input autoFocus value={code} onChange={e => setCode(e.target.value)} placeholder="123 456" inputMode="numeric" style={{ ...cardIn, letterSpacing: 4, fontWeight: 700, textAlign: 'center', fontSize: 18 }} />
            <button disabled={busy || code.trim().length < 6} onClick={confirm} style={{ ...btnMain, width: '100%', opacity: busy || code.trim().length < 6 ? 0.5 : 1 }}>{busy ? 'Verifying…' : 'Confirm & enable MFA'}</button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div>
          <p style={{ color: '#1F9D62', fontWeight: 700, fontSize: 15 }}>✓ Multi-factor authentication is now active.</p>
          <p style={{ color: '#66748A', fontSize: 13.5 }}>Save these one-time recovery codes somewhere safe — each works once if you lose your device:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, margin: '12px 0 16px' }}>
            {backupCodes.map(c => <code key={c} style={{ background: '#F1F6FB', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}>{c}</code>)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => {
              const blob = new Blob([`TwinMOS Admin — recovery codes\n\n${backupCodes.join('\n')}\n`], { type: 'text/plain' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob); a.download = 'twinmos-admin-recovery-codes.txt'; a.click();
              URL.revokeObjectURL(a.href);
            }} style={btnGhost}>Download codes</button>
            <button onClick={onEnrolled} style={btnMain}>I've saved them — continue</button>
          </div>
        </div>
      )}

      {err && <p role="alert" style={{ color: '#C2453C', fontSize: 13.5, margin: '12px 0 0' }}>{err}</p>}
    </div>
  );
}
