import React, { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// A04 Target Site: "SecureAdmin Corporate Portal"
// Vulnerable insecure design target — predictable KBQ password recovery
// ─────────────────────────────────────────────────────────────────────────

const G      = '#2ecc71';   // emerald accent
const BG     = '#060d18';   // deepest bg
const PANEL  = '#0c1829';   // panel bg
const CARD   = '#0f1f35';   // card bg
const BORDER = '#1a3050';   // border
const MUTED  = '#4a6280';   // muted text
const BODY   = '#8ba4c0';   // body text
const BRIGHT = '#e2eaf4';   // headings

// ── CHANGE: brighter background for the right form area ──
const FORM_BG = '#0d1f38';

export default function A04_LoginPage({ onBypassSuccess, onCancel }) {
  const [step, setStep] = useState('login'); // 'login' | 'forgot' | 'reset_success' | 'dashboard'

  const [username,         setUsername]         = useState('');
  const [password,         setPassword]         = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('q1');
  const [securityAnswer,   setSecurityAnswer]   = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [errorMsg,         setErrorMsg]         = useState('');
  const [showPass,         setShowPass]         = useState(false);
  const [hov,              setHov]              = useState('');
  const [copyDone,         setCopyDone]         = useState(false);
  const [tick,             setTick]             = useState(0);

  // Clock tick for terminal header
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  const STEPS = ['Authenticate', 'Recovery', 'Reset', 'Access'];
  const stepIdx = { login: 0, forgot: 1, reset_success: 2, dashboard: 3 }[step];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (username.trim().toLowerCase() !== 'joseph') {
      setErrorMsg('User not found in corporate directory.');
      return;
    }
    if (generatedPassword !== '') {
      if (password === generatedPassword) {
        setStep('dashboard');
      } else {
        setErrorMsg('Invalid credentials. Use the temporary passcode from the recovery flow.');
      }
    } else {
      setErrorMsg('Invalid credentials. Hint: look for architectural flaws in the recovery flow.');
    }
  };

  const handleForgotLinkClick = () => {
    if (username.trim().toLowerCase() === 'joseph') {
      setErrorMsg('');
      setSecurityAnswer('');
      setStep('forgot');
    } else {
      setErrorMsg('Enter a valid target username (e.g., joseph) before invoking the recovery module.');
    }
  };

  const handleVerifySecurityQuestion = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (selectedQuestion !== 'q3') {
      setErrorMsg('Security answer does not match corporate records for this question.');
      return;
    }
    if (securityAnswer.trim().toLowerCase() === 'blue') {
      const temporaryPass = 'InsecureDesign_Bypass_' + Math.floor(1000 + Math.random() * 9000);
      setGeneratedPassword(temporaryPass);
      setStep('reset_success');
    } else {
      setErrorMsg('Security answer does not match predictable staging defaults.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(generatedPassword).catch(() => {});
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  // ── Shared input style ──
  const inp = (focused) => ({
    width: '100%', padding: '11px 14px', background: BG,
    border: `1px solid ${focused ? G + '60' : BORDER}`,
    borderRadius: '7px', color: BRIGHT, fontSize: '0.92rem', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color .2s',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  });

  const [focused, setFocused] = useState('');

  // ── Primary button ──
  const PrimaryBtn = ({ onClick, children, type = 'button', disabled }) => (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov('primary')} onMouseLeave={() => setHov('')}
      style={{
        width: '100%', padding: '12px', borderRadius: '7px', border: 'none',
        background: hov === 'primary' && !disabled ? '#35e07c' : G,
        color: '#0a1a0e', fontWeight: '700', fontSize: '0.95rem', cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: hov === 'primary' ? `0 0 20px ${G}50` : `0 4px 14px ${G}30`,
        transform: hov === 'primary' ? 'translateY(-1px)' : 'none',
        transition: 'all .2s', opacity: disabled ? 0.5 : 1,
      }}>
      {children}
    </button>
  );

  const SecBtn = ({ onClick, children }) => (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov('sec')} onMouseLeave={() => setHov('')}
      style={{
        padding: '11px 20px', borderRadius: '7px', border: `1px solid ${BORDER}`,
        background: hov === 'sec' ? '#1a3050' : 'transparent',
        color: hov === 'sec' ? BRIGHT : BODY, fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
        transition: 'all .2s',
      }}>
      {children}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: BG, minHeight: '100vh', color: BODY, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes glow   { 0%,100%{box-shadow:0 0 0 rgba(46,204,113,0)} 50%{box-shadow:0 0 28px rgba(46,204,113,.4)} }
        @keyframes flagPop { 0%{transform:scale(.94);opacity:0} 100%{transform:scale(1);opacity:1} }
        .fade-in  { animation: fadeIn .35s ease forwards; }
        .flag-glow { animation: glow 2.5s ease-in-out infinite; }
        .flag-pop  { animation: flagPop .4s cubic-bezier(.34,1.56,.64,1) forwards; }
        input:focus { outline:none; }
        select:focus { outline:none; }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:3px; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background: PANEL, borderBottom: `1px solid ${BORDER}`, padding: '0 24px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: G, boxShadow: `0 0 6px ${G}`, animation: 'pulse 2.2s infinite' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' }}>SecureAdmin Portal</span>
          <span style={{ color: BORDER }}>·</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: MUTED }}>v1.0-lab</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: MUTED }}>{timeStr}</span>
          {onCancel && (
            <button onClick={onCancel}
              onMouseEnter={() => setHov('cancel')} onMouseLeave={() => setHov('')}
              style={{ padding: '5px 12px', borderRadius: '5px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', border: `1px solid ${hov === 'cancel' ? BODY : BORDER}`, color: hov === 'cancel' ? BRIGHT : MUTED, background: 'transparent', transition: 'all .15s' }}>
              ← Close
            </button>
          )}
        </div>
      </div>

      {/* ── BODY: left info panel + right form ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Left panel */}
        <div style={{ width: '340px', flexShrink: 0, background: PANEL, borderRight: `1px solid ${BORDER}`, padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Brand */}
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `linear-gradient(135deg, ${G}30, #0c4a2640)`, border: `1px solid ${G}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '16px', boxShadow: `0 4px 18px ${G}20` }}>
              🔐
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: BRIGHT, marginBottom: '4px' }}>SecureAdmin</div>
            <div style={{ fontSize: '0.78rem', color: MUTED, letterSpacing: '0.5px' }}>Corporate Identity Management System</div>
          </div>

          {/* Step progress */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Session Flow</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {STEPS.map((s, i) => {
                const done    = i < stepIdx;
                const active  = i === stepIdx;
                const C3 = '#1e2a45';
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '7px', background: active ? `${G}12` : 'transparent', border: `1px solid ${active ? G + '30' : 'transparent'}`, transition: 'all .3s' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800', background: done ? G : active ? `${G}25` : C3, color: done ? '#0a1a0e' : active ? G : MUTED, border: `1px solid ${done ? G : active ? G + '60' : BORDER}`, boxShadow: active ? `0 0 10px ${G}40` : 'none', transition: 'all .3s' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: active ? '700' : '400', color: active ? BRIGHT : done ? G : MUTED, transition: 'color .3s' }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vulnerability notice */}
          <div style={{ marginTop: 'auto', padding: '14px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>⚠ Lab Environment</div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: MUTED, lineHeight: '1.6' }}>
              This portal contains an intentional <span style={{ color: '#fca5a5' }}>insecure design flaw</span> in the password recovery flow. Exploit it to capture the flag.
            </p>
          </div>
        </div>

        {/* ── CHANGE: Right form area — brighter background ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto', background: FORM_BG }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>

            {/* ── LOGIN ── */}
            {step === 'login' && (
              <div className="fade-in">
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: '800', color: BRIGHT, letterSpacing: '-0.5px' }}>System Authentication</h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: MUTED }}>Enter your corporate credentials to continue</p>
                </div>

                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: BODY, marginBottom: '7px', letterSpacing: '0.3px' }}>Corporate Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                      onFocus={() => setFocused('user')} onBlur={() => setFocused('')}
                      placeholder="e.g., joseph" style={inp(focused === 'user')} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: BODY, marginBottom: '7px', letterSpacing: '0.3px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                        placeholder={generatedPassword ? 'Paste temporary passcode…' : '••••••••'}
                        style={{ ...inp(focused === 'pass'), paddingRight: '44px' }} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '0.9rem', padding: '2px', lineHeight: 1 }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: '6px', fontSize: '0.84rem', color: '#fca5a5', lineHeight: '1.5' }}>
                      {errorMsg}
                    </div>
                  )}

                  <PrimaryBtn type="submit">Sign In →</PrimaryBtn>

                  <button type="button" onClick={handleForgotLinkClick}
                    onMouseEnter={() => setHov('link')} onMouseLeave={() => setHov('')}
                    style={{ background: 'none', border: 'none', color: hov === 'link' ? BRIGHT : MUTED, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all .2s', textAlign: 'center', padding: '4px' }}>
                    Forgot Password?
                  </button>
                </form>
              </div>
            )}

            {/* ── FORGOT ── */}
            {step === 'forgot' && (
              <div className="fade-in">
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${G}15`, border: `1px solid ${G}35`, borderRadius: '6px', padding: '4px 10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: G, textTransform: 'uppercase', letterSpacing: '1px' }}>Recovery Module</span>
                  </div>
                  <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: '800', color: BRIGHT, letterSpacing: '-0.5px' }}>Admin Password Recovery</h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: MUTED }}>
                    Target: <strong style={{ color: BRIGHT, fontFamily: 'monospace' }}>joseph</strong> · Administrator
                  </p>
                </div>

                <form onSubmit={handleVerifySecurityQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: BODY, marginBottom: '7px' }}>Select Security Question</label>
                    <select value={selectedQuestion} onChange={e => { setSelectedQuestion(e.target.value); setErrorMsg(''); }}
                      onFocus={() => setFocused('sel')} onBlur={() => setFocused('')}
                      style={{ ...inp(focused === 'sel'), cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234a6280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}>
                      <option value="q1">Q1 — What is your mother's maiden name?</option>
                      <option value="q2">Q2 — What was the name of your first pet?</option>
                      <option value="q3">Q3 — What is your favorite color?</option>
                    </select>
                  </div>

                  {selectedQuestion === 'q3' && (
                    <div style={{ padding: '12px 14px', background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.25)', borderRadius: '7px', fontSize: '0.84rem', color: '#fbbf24', lineHeight: '1.6' }}>
                      💡 <strong>Staging note:</strong> System architects used a generic placeholder during deployment testing.
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: BODY, marginBottom: '7px' }}>Your Answer</label>
                    <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)}
                      onFocus={() => setFocused('ans')} onBlur={() => setFocused('')}
                      placeholder="Enter verification answer…" style={inp(focused === 'ans')} autoFocus required />
                  </div>

                  {errorMsg && (
                    <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: '6px', fontSize: '0.84rem', color: '#fca5a5', lineHeight: '1.5' }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <SecBtn onClick={() => { setStep('login'); setErrorMsg(''); }}>← Back</SecBtn>
                    <button type="submit"
                      onMouseEnter={() => setHov('verify')} onMouseLeave={() => setHov('')}
                      style={{ flex: 1, padding: '12px', borderRadius: '7px', border: 'none', background: hov === 'verify' ? '#35e07c' : G, color: '#0a1a0e', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', boxShadow: hov === 'verify' ? `0 0 20px ${G}50` : 'none', transition: 'all .2s' }}>
                      Verify Factor →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── RESET SUCCESS ── */}
            {step === 'reset_success' && (
              <div className="fade-in">
                <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔄</div>
                  <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: '800', color: '#eab308', letterSpacing: '-0.5px' }}>Passcode Provisioned</h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: MUTED, lineHeight: '1.5' }}>
                    Recovery factor validated. Temporary administration passcode issued.
                  </p>
                </div>

                {/* Password token */}
                <div style={{ background: BG, border: '1px dashed rgba(234,179,8,.5)', borderRadius: '10px', padding: '18px 16px', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: '700', color: '#eab308', wordBreak: 'break-all', letterSpacing: '0.3px', marginBottom: '12px' }}>
                    {generatedPassword}
                  </div>
                  <button onClick={handleCopy}
                    onMouseEnter={() => setHov('copy')} onMouseLeave={() => setHov('')}
                    style={{ padding: '6px 16px', borderRadius: '5px', border: `1px solid ${hov === 'copy' ? '#eab308' : BORDER}`, background: 'transparent', color: copyDone ? G : MUTED, fontSize: '0.78rem', cursor: 'pointer', transition: 'all .2s', fontFamily: 'monospace' }}>
                    {copyDone ? '✓ Copied!' : '⎘ Copy'}
                  </button>
                </div>

                <p style={{ margin: '0 0 24px', fontSize: '0.84rem', color: MUTED, lineHeight: '1.6', textAlign: 'center' }}>
                  Copy the passcode above, return to the login panel, and authenticate as administrator.
                </p>

                <PrimaryBtn onClick={() => { setStep('login'); setErrorMsg(''); setPassword(''); }}>
                  Return to Login →
                </PrimaryBtn>
              </div>
            )}

            {/* ── DASHBOARD / FLAG ── */}
            {step === 'dashboard' && (
              <div className="fade-in">
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏆</div>
                  <h2 style={{ margin: '0 0 8px', fontSize: '1.6rem', fontWeight: '800', color: G, letterSpacing: '-0.5px' }}>Session Authenticated</h2>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: MUTED, lineHeight: '1.6' }}>
                    You exploited the insecure design flaw — a predictable KBQ with no lockout gave you full admin access.
                  </p>
                </div>

                {/* Flag box */}
                <div style={{ background: 'rgba(46,204,113,.06)', border: '1px solid rgba(46,204,113,.3)', borderRadius: '10px', padding: '20px', marginBottom: '24px', textAlign: 'center' }} className="flag-glow flag-pop">
                  <div style={{ fontSize: '0.68rem', fontWeight: '800', color: G, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>🚩 Target System Flag</div>
                  <code style={{ display: 'block', background: BG, padding: '12px 16px', borderRadius: '7px', color: '#4ade80', fontWeight: '700', fontSize: '0.9rem', border: '1px solid rgba(46,204,113,.25)', wordBreak: 'break-all', letterSpacing: '0.3px' }}>
                    FLAG{'{'}Insecure_Design_Logic_Flaw_Bypass_Success{'}'}
                  </code>
                </div>

                <div style={{ background: BG, borderRadius: '8px', padding: '14px 16px', fontSize: '0.8rem', color: MUTED, lineHeight: '1.8', marginBottom: '22px', border: `1px solid ${BORDER}` }}>
                  <div>✓ Identified weakest security question (Q3)</div>
                  <div>✓ Guessed hardcoded staging default answer</div>
                  <div>✓ Obtained temporary admin passcode</div>
                  <div>✓ Logged in — no valid password ever used</div>
                </div>

                {onBypassSuccess && (
                  <button onClick={onBypassSuccess}
                    onMouseEnter={() => setHov('sync')} onMouseLeave={() => setHov('')}
                    style={{ width: '100%', padding: '12px', borderRadius: '7px', border: 'none', background: hov === 'sync' ? '#35e07c' : G, color: '#0a1a0e', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', boxShadow: hov === 'sync' ? `0 0 20px ${G}50` : `0 4px 14px ${G}30`, transform: hov === 'sync' ? 'translateY(-1px)' : 'none', transition: 'all .2s' }}>
                    ⚡ Sync Progress & Complete Challenge
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// stub constants to avoid undefined refs
const C3 = '#1e2a45';