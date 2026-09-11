import React, { useState, useEffect, useRef } from 'react';

const T      = '#ff7a00';
const BG     = '#0a0f1e';
const C1     = '#0f1729';
const C2     = '#192035';
const C3     = '#1e2a45';
const MUTED  = '#4a5878';
const BODY   = '#94a3b8';
const BRIGHT = '#e2e8f0';

const TOTAL_QUESTIONS = 4;

function useCountUp(target, duration = 1200, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

function StatCard({ value, suffix, label, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(value, 1400, visible);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '28px 16px', background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '10px', animationDelay: `${delay}ms` }}>
      <div style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: '2.4rem', fontWeight: '800', color: T, lineHeight: 1, letterSpacing: '-1px' }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</div>
    </div>
  );
}

function SectionHead({ label, title, id }) {
  return (
    <div id={id} style={{ marginBottom: '32px', scrollMarginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{ width: '32px', height: '3px', background: T, borderRadius: '2px' }} />
        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '2px' }}>{label}</span>
      </div>
      <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: '700', color: BRIGHT }}>{title}</h2>
    </div>
  );
}

function ProgressBar({ completed }) {
  const pct  = Math.round((completed / TOTAL_QUESTIONS) * 100);
  const done = pct === 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '0.72rem', color: MUTED, whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>Progress</span>
      <div style={{ position: 'relative', width: '160px', height: '8px', background: C3, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`,
          background: done ? 'linear-gradient(90deg,#22c55e,#4ade80)' : `linear-gradient(90deg,${T},#ffaa44)`,
          borderRadius: '4px', transition: 'width 0.55s cubic-bezier(.16,1,.3,1)',
          boxShadow: pct > 0 ? `0 0 10px ${done ? '#22c55e' : T}90` : 'none',
        }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono',monospace", fontWeight: '700', color: done ? '#22c55e' : T, whiteSpace: 'nowrap', minWidth: '44px', textAlign: 'right' }}>
        {done ? '✓ Done' : `${completed}/${TOTAL_QUESTIONS}`}
      </span>
    </div>
  );
}

function QuestionBlock({ num, label, solved, children }) {
  return (
    <div style={{ marginBottom: '36px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
          background: solved ? '#064e3b' : `${T}20`,
          border: `1px solid ${solved ? '#10b981' : T + '60'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: '800', color: solved ? '#34d399' : T,
          transition: 'all 0.3s ease',
        }}>
          {solved ? '✓' : num}
        </div>
        <label style={{ fontSize: '0.98rem', color: BRIGHT, fontWeight: '600', lineHeight: '1.5' }}>{label}</label>
      </div>
      <div style={{ paddingLeft: '36px' }}>{children}</div>
    </div>
  );
}

function VerifyBtn({ onClick, hov, onHov, label = 'Verify' }) {
  return (
    <button onClick={onClick} onMouseEnter={() => onHov(true)} onMouseLeave={() => onHov(false)}
      style={{ padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', border: 'none', fontSize: '0.9rem', background: T, color: '#0a0f1e', boxShadow: hov ? `0 0 16px ${T}70` : 'none', transform: hov ? 'scale(1.03)' : 'scale(1)', transition: 'all .2s' }}
      className="btn">{label}</button>
  );
}

function HintBtn({ onClick, hov, onHov }) {
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => onHov(true)} onMouseLeave={() => onHov(false)}
      style={{ padding: '10px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', background: C2, border: `1px solid ${hov ? '#eab308' : C3}`, color: hov ? '#eab308' : BODY, transition: 'all .2s' }}
      className="btn">💡 Hint</button>
  );
}

const inputStyle = {
  flex: '1', minWidth: '200px', padding: '10px 14px',
  borderRadius: '6px', border: `1px solid ${C3}`,
  background: C2, color: BRIGHT, fontSize: '0.92rem', outline: 'none',
};
const hintStyle = {
  marginTop: '12px', padding: '12px 16px',
  background: 'rgba(234,179,8,.08)', borderLeft: '4px solid #eab308',
  borderRadius: '0 6px 6px 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.65',
};
const fbStyle = (status) => ({
  marginTop: '10px', padding: '12px 16px', borderRadius: '6px',
  fontSize: '0.9rem', lineHeight: '1.55',
  background: status === 'success' ? '#064e3b' : '#7f1d1d',
  color: status === 'success' ? '#34d399' : '#fca5a5',
  borderLeft: `5px solid ${status === 'success' ? '#10b981' : '#ef4444'}`,
});
const hintCode = (color) => ({
  background: C1, color, fontFamily: 'monospace',
  padding: '1px 6px', borderRadius: '4px', border: `1px solid ${C3}`, fontSize: '0.85em',
});

function TimelineStep({ icon, title, text, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '20px 22px', borderRadius: '10px', background: hov ? C2 : 'transparent', border: `1px solid ${hov ? C3 : 'transparent'}`, transition: 'all 0.25s ease', cursor: 'default' }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `${accent}18`, border: `2px solid ${accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0, boxShadow: hov ? `0 0 16px ${accent}40` : 'none', transition: 'box-shadow 0.25s ease' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: BRIGHT, marginBottom: '6px' }}>{title}</div>
        <div style={{ fontSize: '0.88rem', color: BODY, lineHeight: '1.65' }}>{text}</div>
      </div>
    </div>
  );
}

// ── Q4 options ────────────────────────────────────────────────────────────────
const Q4_OPTIONS = [
  { id: 'verify_sig',     label: 'Verify JWT signature on every request',       desc: 'Always validate the cryptographic signature server-side; reject tokens whose alg field does not match the expected algorithm' },
  { id: 'encrypt_token',  label: 'Encrypt the JWT payload with AES',             desc: 'Wrap the payload in AES-256-GCM so the contents are unreadable to the client' },
  { id: 'short_expiry',   label: 'Set a very short token expiry (1 minute)',      desc: 'Reduce the token lifetime so a stolen or forged token expires quickly' },
  { id: 'https_only',     label: 'Transmit tokens over HTTPS only',              desc: 'Use TLS to prevent interception of the token in transit' },
];

export default function A08({ onBack, onOpenLab }) {
  const [theoryInput,  setTheoryInput]  = useState('');
  const [algInput,     setAlgInput]     = useState('');
  const [flagInput,    setFlagInput]    = useState('');
  const [selectedQ4,   setSelectedQ4]   = useState('');

  const [feedbackQ1, setFeedbackQ1] = useState({ message: '', status: '' });
  const [feedbackQ2, setFeedbackQ2] = useState({ message: '', status: '' });
  const [feedbackQ3, setFeedbackQ3] = useState({ message: '', status: '' });
  const [feedbackQ4, setFeedbackQ4] = useState({ message: '', status: '' });

  const [showHintQ1, setShowHintQ1] = useState(false);
  const [showHintQ2, setShowHintQ2] = useState(false);
  const [showHintQ3, setShowHintQ3] = useState(false);
  const [showHintQ4, setShowHintQ4] = useState(false);

  const [complete, setComplete] = useState(false);
  const [backHov,  setBackHov]  = useState(false);
  const [siteHov,  setSiteHov]  = useState(false);
  const [hovV, setHovV] = useState({ q1: false, q2: false, q3: false, q4: false });
  const [hovH, setHovH] = useState({ q1: false, q2: false, q3: false, q4: false });
  const [hovQ4, setHovQ4] = useState('');

  const statuses       = [feedbackQ1.status, feedbackQ2.status, feedbackQ3.status, feedbackQ4.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const goHome   = () => { if (onBack) onBack(); else window.location.href = '/'; };
  const openSite = () => { if (onOpenLab) onOpenLab(); else window.open('/?mode=a08_lab', '_blank'); };

  // ── Answers ───────────────────────────────────────────────────────────────
  const checkQ1 = (e) => {
    e.preventDefault();
    const v = theoryInput.trim().toLowerCase();
    if (!v) { setFeedbackQ1({ message: '⚠️ Please enter your answer.', status: 'error' }); return; }
    if (v === 'integrity') {
      setFeedbackQ1({ message: '🎉 Correct! A08 is fundamentally about protecting Integrity — ensuring that code, data, tokens, and pipelines have not been tampered with by an unauthorized party.', status: 'success' });
    } else {
      setFeedbackQ1({ message: '❌ Incorrect. Look at the Definition section — what specific property does A08 aim to protect? (One word, starts with "I")', status: 'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    const v = algInput.trim().toLowerCase().replace(/"/g, '').replace(/'/g, '');
    if (!v) { setFeedbackQ2({ message: '⚠️ Please enter a value.', status: 'error' }); return; }
    if (v === 'none') {
      setFeedbackQ2({ message: '🎉 Correct! Setting alg to "none" tells a vulnerable server to skip signature verification entirely — any payload is then trusted unconditionally.', status: 'success' });
    } else {
      setFeedbackQ2({ message: `❌ Incorrect. Look at the "Algorithm Confusion" attack pattern in Section 3 — what specific algorithm value disables signature verification?`, status: 'error' });
    }
  };

  const checkQ3 = (e) => {
    e.preventDefault();
    const v = flagInput.trim();
    if (!v) { setFeedbackQ3({ message: '⚠️ Please enter the flag.', status: 'error' }); return; }
    if (v === 'FLAG{jwt_n0ne_4lg_byp4ss_m4st3r_2026}') {
      setFeedbackQ3({ message: '🎉 Flag captured! You forged an admin JWT by exploiting the "alg:none" vulnerability — the server skipped signature validation and granted full admin access.', status: 'success' });
    } else {
      setFeedbackQ3({ message: '❌ Wrong flag. Open the lab, login as alice/qwerty, then forge a token with alg:"none" and username:"admin". The flag appears in the Admin Console.', status: 'error' });
    }
  };

  const checkQ4 = (e) => {
    e.preventDefault();
    if (!selectedQ4) { setFeedbackQ4({ message: '⚠️ Please select an option.', status: 'error' }); return; }
    if (selectedQ4 === 'verify_sig') {
      setFeedbackQ4({ message: '🎉 Correct! The root fix is enforcing server-side signature verification with an allowlist of valid algorithms (e.g. only HS256 or RS256). Rejecting "none" eliminates the entire attack class.', status: 'success' });
    } else {
      const msgs = {
        encrypt_token: '❌ Encrypting the payload hides its contents but does not prevent an attacker from crafting a forged header with alg:none and an arbitrary payload.',
        short_expiry:  '❌ Short expiry limits the window for a stolen token but does not prevent forging a brand-new token with alg:none — the attacker creates a fresh token, not replays an old one.',
        https_only:    '❌ HTTPS prevents interception in transit but the alg:none attack is performed entirely client-side by modifying the local token — TLS does not block it.',
      };
      setFeedbackQ4({ message: msgs[selectedQ4] || '❌ Incorrect. Re-read the Mitigation Strategies section.', status: 'error' });
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: '100vh', color: BODY, boxSizing: 'border-box' }}>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes popIn     { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        @keyframes float     { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(4deg)} }
        @keyframes backdropIn{ from{opacity:0} to{opacity:1} }
        @keyframes shimmerOrange { 0%{left:-160%} 45%{left:160%} 100%{left:160%} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 6px ${T}40} 50%{box-shadow:0 0 20px ${T}80} }
        @keyframes borderFlow{ 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .fade-up  { animation: fadeUp 0.4s cubic-bezier(.16,1,.3,1) both; }
        .pop-in   { animation: popIn 0.5s cubic-bezier(.34,1.56,.64,1) both; }
        .float    { animation: float 2.2s ease-in-out infinite; }
        .slide-in { animation: fadeUp 0.35s cubic-bezier(.16,1,.3,1) both; }
        .btn      { transition: all .22s cubic-bezier(.4,0,.2,1); }
        .btn:active { transform: scale(.95) !important; }
        input::placeholder { color: ${MUTED}; }
        .hero-shimmer::after {
          content:''; position:absolute; inset:0; pointer-events:none;
          background: linear-gradient(105deg, transparent 30%, ${T}07 50%, transparent 70%);
          background-size: 200% 100%; animation: borderFlow 6s linear infinite;
        }
        .view-btn::before {
          content:''; position:absolute; top:0; left:-160%; width:55%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
          transform:skewX(-22deg); animation:shimmerOrange 3.8s infinite;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
      `}</style>

      {/* COMPLETION MODAL */}
      {complete && (
        <div onClick={() => setComplete(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn .3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '16px', padding: '40px 36px', textAlign: 'center', maxWidth: '440px', width: '92%' }} className="pop-in">
            <div style={{ fontSize: '64px', marginBottom: '12px' }} className="float">🔓</div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: T, margin: '0 0 10px' }}>Lab Complete!</h2>
            <p style={{ color: BODY, lineHeight: '1.6', margin: '0 0 18px' }}>
              You've mastered <strong style={{ color: BRIGHT }}>A08: Software & Data Integrity Failures</strong> — understanding how JWT algorithm confusion enables complete authentication bypass without knowing the signing key.
            </p>
            <div style={{ background: C2, borderRadius: '8px', padding: '14px 18px', fontSize: '0.85rem', color: BODY, textAlign: 'left', lineHeight: '1.9', marginBottom: '20px' }}>
              <div>✓ Integrity property correctly identified as A08's core concern</div>
              <div>✓ alg:none bypass mechanism understood</div>
              <div>✓ Admin flag captured via JWT forge attack</div>
              <div>✓ Correct server-side mitigation identified</div>
            </div>
            <button onClick={() => setComplete(false)} style={{ background: T, color: '#0a0f1e', border: 'none', borderRadius: '8px', padding: '11px 32px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }} className="btn">
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: `${BG}e8`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C3}`, padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={goHome} onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
          style={{ padding: '7px 16px', borderRadius: '6px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', border: `1px solid ${backHov ? T : C3}`, color: backHov ? T : BODY, background: 'transparent', transform: backHov ? 'translateX(-3px)' : 'none', transition: 'all .2s ease', flexShrink: 0 }}
          className="btn">← Back</button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ProgressBar completed={completedCount} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T, boxShadow: `0 0 8px ${T}`, animation: 'glowPulse 2s infinite' }} />
          <span style={{ fontSize: '0.8rem', color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' }}>OWASP Top 10</span>
          <span style={{ color: C3 }}>·</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: T }}>A08:2021</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 32px 60px', textAlign: 'center', background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${T}12 0%, transparent 70%)` }} className="hero-shimmer">
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: .04, fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: '1.4', color: T, userSelect: 'none', whiteSpace: 'pre-wrap', padding: '10px', pointerEvents: 'none' }}>
          {Array(12).fill('JWT  alg:none  HEADER.PAYLOAD.  eyJhbGciOiJub25lIn0  CI/CD  SUPPLY_CHAIN  INTEGRITY  BYPASS  UNSIGNED  ').join('\n')}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${T}18`, border: `1px solid ${T}40`, borderRadius: '20px', padding: '5px 16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '2px' }}>A08:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: '800', color: BRIGHT, margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Software & Data<br />
            <span style={{ color: T }}>Integrity Failures</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: BODY, maxWidth: '560px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            When code, tokens, and pipelines are trusted without verification — attackers forge identities, poison CI/CD pipelines, and compromise entire supply chains without ever knowing the signing key.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', maxWidth: '720px', margin: '0 auto' }}>
            <StatCard value={8}   suffix="th" label="OWASP rank — new category merging XSS & deserialization" delay={0} />
            <StatCard value={10}  suffix="+"  label="CWEs mapped to integrity failures" delay={100} />
            <StatCard value={18}  suffix="K"  label="Packages poisoned in SolarWinds supply chain attack" delay={200} />
            <StatCard value={3}   suffix=""   label="Attack vectors: JWT forgery, CI/CD, insecure deserialization" delay={300} />
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* SECTION 1: Definition */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Definition" title="What are Software & Data Integrity Failures?" id="definition" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <p style={{ margin: '0 0 14px', lineHeight: '1.75', fontSize: '0.95rem' }}>
                <strong style={{ color: BRIGHT }}>A08:2021 – Software and Data Integrity Failures</strong> covers scenarios where code, data, tokens, or CI/CD pipelines are used without verifying their <strong style={{ color: T }}>Integrity</strong>. An attacker who can modify a trusted artifact — without detection — can fully subvert the system.
              </p>
              <p style={{ margin: 0, lineHeight: '1.75', fontSize: '0.95rem' }}>
                This category covers JWT algorithm confusion attacks, insecure deserialization, and software supply chain compromises. The common thread: the application <em style={{ color: '#cbd5e1' }}>trusts</em> data it has not independently verified.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Key Integrity Failure Signals</div>
              {[
                'Does the app accept JWTs with any algorithm the client specifies?',
                'Are software packages downloaded without verifying checksums or signatures?',
                'Does the CI/CD pipeline pull from untrusted sources without review?',
                'Is deserialized data from the client trusted without validation?',
                'Are CDN-hosted scripts loaded without subresource integrity (SRI) checks?',
              ].map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 4 ? '10px' : 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
                  <span style={{ color: T, fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: BODY }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Core Concept — JWT */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Core Concept" title="JWT Algorithm Confusion" id="concept" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>How JWT Works (Intended)</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                A JWT consists of three Base64URL-encoded parts: <strong style={{ color: T }}>Header</strong> (algorithm + type), <strong style={{ color: T }}>Payload</strong> (claims), and <strong style={{ color: T }}>Signature</strong> (HMAC or RSA over header.payload). The server signs with a secret and verifies that signature on every request.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                The signature ensures the payload cannot be altered without detection — unless the server trusts the client's algorithm choice.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>The "None" Algorithm Bypass</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                The JWT specification allows <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: '#ef4444' }}>alg: "none"</code> for unsigned tokens. A vulnerable server that reads the algorithm from the token itself — rather than enforcing a fixed allowlist — will skip signature verification entirely.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                An attacker changes the header to <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: '#ef4444' }}>alg:none</code>, sets <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: '#ef4444' }}>username:admin</code>, drops the signature, and the server trusts the forged payload blindly.
              </p>
            </div>
          </div>

          {/* JWT anatomy */}
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>JWT Anatomy: Legitimate vs Forged</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#22c55e', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>✓ Legitimate HS256 Token</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #22c55e30' }}>
                  <div><span style={{ color: T }}>Header:</span> <span style={{ color: BODY }}>{'{ "alg":"HS256", "typ":"JWT" }'}</span></div>
                  <div><span style={{ color: T }}>Payload:</span> <span style={{ color: BODY }}>{'{ "username":"alice", "exp":... }'}</span></div>
                  <div><span style={{ color: T }}>Sig:</span> <span style={{ color: '#22c55e' }}>HMAC-SHA256(secret, h.p) ✓</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>Server verifies signature using its own secret. Tamper with any part → signature mismatch → 401.</p>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ef4444', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>❌ Forged "None" Token</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #ef444430' }}>
                  <div><span style={{ color: '#ef4444' }}>Header:</span> <span style={{ color: BODY }}>{'{ "alg":"none", "typ":"JWT" }'}</span></div>
                  <div><span style={{ color: '#ef4444' }}>Payload:</span> <span style={{ color: BODY }}>{'{ "username":"admin", ... }'}</span></div>
                  <div><span style={{ color: '#ef4444' }}>Sig:</span> <span style={{ color: '#fca5a5' }}>(empty string) — no check!</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>Vulnerable server reads alg from token, disables verification, trusts "admin" claim with zero proof.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Attack Patterns */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Attack Patterns" title="Common Scenarios" id="scenarios" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '🪪', title: 'JWT Algorithm Confusion',   text: 'Attacker modifies the JWT header to alg:"none" or switches RS256 → HS256 (signing with the public key). A server that trusts the client-supplied algorithm accepts any forged payload.' },
              { icon: '🏗️', title: 'CI/CD Pipeline Poisoning', text: 'An attacker with write access to a dependency or build script injects malicious code that executes during automated builds — compromising every downstream artifact silently.' },
              { icon: '📦', title: 'Supply Chain Compromise',   text: 'Trojanized packages published to npm/PyPI or injected into third-party libraries (SolarWinds) propagate malware to thousands of organizations without modifying any first-party code.' },
            ].map(s => (
              <div key={s.title} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '10px', padding: '22px' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{s.icon}</div>
                <div style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.95rem', marginBottom: '10px' }}>{s.title}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: BODY, lineHeight: '1.65' }}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Attack chain */}
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>JWT alg:none Attack Chain</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { step: '01', label: 'Obtain Token',    sub: 'Login as any valid user to receive a JWT' },
                { step: '02', label: 'Decode Header',   sub: 'Base64URL-decode the first segment' },
                { step: '03', label: 'Forge Payload',   sub: 'Set alg:none, username:admin, re-encode' },
                { step: '04', label: 'Send & Escalate', sub: 'Submit forged token — server grants admin access' },
              ].map((s, i, arr) => (
                <React.Fragment key={s.step}>
                  <div style={{ flex: '1 1 160px', textAlign: 'center', padding: '12px 8px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: T, fontWeight: '700', marginBottom: '6px' }}>{s.step}</div>
                    <div style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.9rem', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontSize: '0.75rem', color: MUTED }}>{s.sub}</div>
                  </div>
                  {i < arr.length - 1 && <div style={{ color: C3, fontSize: '1.4rem', flexShrink: 0, padding: '0 4px' }}>→</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: Mitigation */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Defense" title="Mitigation Strategies" id="mitigation" />
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            <TimelineStep icon="🔑" accent="#22c55e" title="Enforce a server-side algorithm allowlist"
              text="Never read the algorithm from the token header. Hardcode the expected algorithm (e.g. HS256 or RS256) on the server and reject any token whose alg field differs. The 'none' algorithm must always be explicitly rejected." />
            <TimelineStep icon="✅" accent="#3b82f6" title="Verify digital signatures and checksums on all artifacts"
              text="Use signed package manifests, SRI hashes for CDN scripts, and GPG-signed commits. Reject any artifact whose integrity cannot be cryptographically confirmed against a trusted source." />
            <TimelineStep icon="🔒" accent="#8b5cf6" title="Lock CI/CD pipelines and dependency sources"
              text="Pin dependencies to exact versions with verified hashes. Restrict pipeline write access with branch protection and code owners. Audit third-party GitHub Actions and build tools for supply chain risks." />
            <TimelineStep icon="🧪" accent="#f97316" title="Validate and sanitize all deserialized data"
              text="Treat all deserialized input as untrusted. Prefer data formats without executable semantics (JSON over Java/Python pickle). Implement type and value validation before acting on deserialized objects." />
          </div>
        </section>

        {/* SECTION 5: Case Studies */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World Integrity Failures" id="examples" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
            {[
              { year: '2020', org: 'SolarWinds', icon: '☀️', stat: '18,000 orgs',       desc: 'Attackers injected malicious code (SUNBURST) into SolarWinds Orion build pipeline. Signed, trusted software updates delivered backdoors to 18,000 organizations including US federal agencies.' },
              { year: '2021', org: 'Codecov',    icon: '📊', stat: '29,000 customers',   desc: 'Attackers modified the Codecov bash uploader script to exfiltrate CI/CD environment variables. The supply chain attack harvested secrets from thousands of downstream users.' },
              { year: '2022', org: 'PyTorch',    icon: '🔥', stat: 'Nightly builds',     desc: 'A malicious package "torchtriton" was published to PyPI mimicking a PyTorch dependency. Users who installed nightly builds downloaded a data-stealing trojan from the official package registry.' },
              { year: '2023', org: 'MOVEit',     icon: '📁', stat: '2,000+ orgs',        desc: 'A critical deserialization and SQL injection flaw in MOVEit Transfer was mass-exploited, leading to data theft at hundreds of organizations. Integrity checks on transfer metadata were absent.' },
            ].map(c => (
              <div key={c.org} style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '10px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
                    <span style={{ fontWeight: '800', color: BRIGHT, fontSize: '1rem' }}>{c.org}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: MUTED, background: C2, padding: '3px 8px', borderRadius: '4px' }}>{c.year}</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: '800', color: T, marginBottom: '10px' }}>{c.stat}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: BODY, lineHeight: '1.65' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Lab Challenge */}
        <section className="fade-up">
          <SectionHead label="Lab" title="Interactive Challenge: JWT Forgery Attack" id="challenge" />

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Lab header */}
            <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: BRIGHT }}>Security Lab · A08 — Software & Data Integrity Failures</span>
              </div>
              <button onClick={openSite} onMouseEnter={() => setSiteHov(true)} onMouseLeave={() => setSiteHov(false)}
                style={{ position: 'relative', overflow: 'hidden', padding: '9px 22px', borderRadius: '6px', border: 'none', background: siteHov ? '#ff9a33' : T, color: '#0a0f1e', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', boxShadow: siteHov ? `0 0 20px ${T}80` : `0 4px 12px ${T}40`, transform: siteHov ? 'scale(1.03)' : 'scale(1)', transition: 'all .22s ease', display: 'flex', alignItems: 'center', gap: '8px' }}
                className="btn view-btn">
                🌐 View Site
              </button>
            </div>

            <div style={{ padding: '32px 28px' }}>
              <p style={{ margin: '0 0 32px', fontSize: '0.95rem', color: BODY, lineHeight: '1.7' }}>
                A banking portal issues JWTs for authentication but accepts any algorithm the client specifies.
                Login as <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: T, fontSize: '0.88rem', border: `1px solid ${C3}` }}>alice</code> / <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: T, fontSize: '0.88rem', border: `1px solid ${C3}` }}>qwerty</code>, inspect the JWT,
                then forge a token with <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: '#ef4444', fontSize: '0.88rem', border: `1px solid ${C3}` }}>alg:"none"</code> to gain admin access.
              </p>

              {/* Q1 */}
              <QuestionBlock num={1} solved={feedbackQ1.status === 'success'}
                label={<>According to the Definition section, what specific property does A08 aim to protect in code, data, and pipelines? <span style={{ color: MUTED, fontWeight: '400' }}>(one word)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder='Enter the word from Section 1…' value={theoryInput}
                    onChange={e => setTheoryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkQ1(e)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1: v }))} />
                  <HintBtn onClick={() => setShowHintQ1(!showHintQ1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1: v }))} />
                </div>
                {showHintQ1 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Look at the first sentence of Section 1. The answer is a single word (starts with "I") that describes what must be guaranteed for code and data.</div>}
                {feedbackQ1.message && <div style={fbStyle(feedbackQ1.status)} className="slide-in">{feedbackQ1.message}</div>}
              </QuestionBlock>

              {/* Q2 */}
              <QuestionBlock num={2} solved={feedbackQ2.status === 'success'}
                label={<>In the JWT algorithm confusion attack, what specific value does the attacker set the <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: T, fontSize: '0.88rem' }}>alg</code> field to in order to disable signature verification?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder='Enter the alg value…' value={algInput}
                    onChange={e => setAlgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkQ2(e)}
                    style={{ ...inputStyle, fontFamily: 'monospace', color: '#ef4444' }} />
                  <VerifyBtn onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2: v }))} />
                  <HintBtn onClick={() => setShowHintQ2(!showHintQ2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2: v }))} />
                </div>
                {showHintQ2 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Check the "None Algorithm Bypass" panel in Section 2. The value is a 4-letter word — the JWT spec uses it for unsigned tokens.</div>}
                {feedbackQ2.message && <div style={fbStyle(feedbackQ2.status)} className="slide-in">{feedbackQ2.message}</div>}
              </QuestionBlock>

              {/* Q3 */}
              <QuestionBlock num={3} solved={feedbackQ3.status === 'success'}
                label={<>Open the lab, login as <strong style={{ color: T }}>alice / qwerty</strong>, then forge a JWT with <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: '#ef4444', fontSize: '0.88rem' }}>alg:"none"</code> and <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: '#ef4444', fontSize: '0.88rem' }}>username:"admin"</code>. What is the flag?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="FLAG{…}" value={flagInput}
                    onChange={e => setFlagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkQ3(e)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn label="Submit Flag" onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3: v }))} />
                  <HintBtn onClick={() => setShowHintQ3(!showHintQ3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3: v }))} />
                </div>
                {showHintQ3 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> In the lab — (1) Login as <code style={hintCode(T)}>alice / qwerty</code> to get a JWT. (2) Switch to the "Token Forge" tab. (3) Change <code style={hintCode('#ef4444')}>alg</code> to <code style={hintCode('#ef4444')}>none</code> and <code style={hintCode('#ef4444')}>username</code> to <code style={hintCode('#ef4444')}>admin</code> in the decoded JSON, then re-encode and paste the new token. The flag appears in the Admin Console.
                  </div>
                )}
                {feedbackQ3.message && <div style={fbStyle(feedbackQ3.status)} className="slide-in">{feedbackQ3.message}</div>}
              </QuestionBlock>

              {/* Q4 */}
              <QuestionBlock num={4} solved={feedbackQ4.status === 'success'}
                label={<>Based on the <strong style={{ color: T }}>Mitigation Strategies</strong> section, which measure directly prevents the alg:none JWT bypass?</>}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', marginBottom: '14px' }}>
                  {Q4_OPTIONS.map(opt => {
                    const sel = selectedQ4 === opt.id;
                    const hov = hovQ4 === opt.id;
                    return (
                      <div key={opt.id} onClick={() => setSelectedQ4(opt.id)}
                        onMouseEnter={() => setHovQ4(opt.id)} onMouseLeave={() => setHovQ4('')}
                        style={{ padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', border: sel ? `2px solid ${T}` : hov ? `2px solid ${T}60` : `2px solid ${C3}`, background: sel ? `${T}12` : C2, transition: 'all .2s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: `2px solid ${sel ? T : '#475569'}`, background: sel ? T : 'transparent', flexShrink: 0, transition: 'all .2s' }} />
                          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: sel ? T : BRIGHT }}>{opt.label}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: MUTED, lineHeight: '1.4' }}>{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <VerifyBtn label="Submit Answer" onClick={checkQ4} hov={hovV.q4} onHov={v => setHovV(p => ({ ...p, q4: v }))} />
                  <HintBtn onClick={() => setShowHintQ4(!showHintQ4)} hov={hovH.q4} onHov={v => setHovH(p => ({ ...p, q4: v }))} />
                </div>
                {showHintQ4 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Re-read the first mitigation step. The attack works because the server reads the algorithm from the token. Which option closes that exact gap on the server side?</div>}
                {feedbackQ4.message && <div style={fbStyle(feedbackQ4.status)} className="slide-in">{feedbackQ4.message}</div>}
              </QuestionBlock>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}