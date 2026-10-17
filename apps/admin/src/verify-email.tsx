import React, { useState, useEffect } from 'react';
import { API } from './api';

const NAVY = '#16222F';
const CYAN = '#1DBF9F';
const LOGO = `${import.meta.env.BASE_URL}assets/img/logo.webp`;

const btnMain: React.CSSProperties = {
  width: '100%', padding: '13px 18px', border: 0, borderRadius: 8,
  background: CYAN, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
};

export default function VerifyEmail({
  token,
  onDone,
}: {
  token: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(true);
  const [verified, setVerified] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function verify() {
      try {
        const res = await fetch(`${API}/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message || body?.detail || 'Verification token is invalid or has expired.');
        }
        if (active) {
          setVerified(true);
          setBusy(false);
        }
      } catch (ex: any) {
        if (active) {
          setErr(ex.message || 'Verification failed. Please request a new verification link.');
          setBusy(false);
        }
      }
    }
    void verify();
    return () => { active = false; };
  }, [token]);

  return (
    <div style={{
      background: '#fff', padding: '38px 36px', borderRadius: 18,
      boxShadow: '0 28px 80px rgba(2,12,28,.55)', maxWidth: 420, width: '100%',
    }}>
      <img src={LOGO} alt="TwinMOS" style={{ height: 28, width: 'auto', display: 'block', margin: '0 auto 18px' }} />
      <h2 style={{ margin: '0 0 6px', fontSize: 20, color: NAVY, textAlign: 'center' }}>Email Verification</h2>

      {busy ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ color: '#66748A', fontSize: 14 }}>Verifying your email token…</p>
        </div>
      ) : verified ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E6F8F4', color: CYAN, fontSize: 24, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>✓</div>
          <p style={{ color: NAVY, fontWeight: 700, margin: '0 0 8px' }}>Email Verified</p>
          <p style={{ color: '#66748A', fontSize: 13, lineHeight: 1.5, margin: '0 0 24px' }}>
            Your email address has been verified successfully. You can now access the TwinMOS Administration Portal.
          </p>
          <button type="button" onClick={onDone} style={{ ...btnMain, background: NAVY }}>Proceed to Sign In</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FDECEB', color: '#C2453C', fontSize: 24, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>✕</div>
          <p style={{ color: NAVY, fontWeight: 700, margin: '0 0 8px' }}>Verification Unsuccessful</p>
          <p role="alert" style={{ color: '#C2453C', fontSize: 13, lineHeight: 1.5, margin: '0 0 24px' }}>
            {err}
          </p>
          <button type="button" onClick={onDone} style={{ ...btnMain, background: NAVY }}>Return to Sign In</button>
        </div>
      )}
    </div>
  );
}
