import React, { useState, useEffect, useRef } from 'react';

const T      = '#ff6b6b';
const BG     = '#0a0f1e';
const C1     = '#0f1729';
const C2     = '#192035';
const C3     = '#1e2a45';
const MUTED  = '#4a5878';
const BODY   = '#94a3b8';
const BRIGHT = '#e2e8f0';

const TOTAL_QUESTIONS = 5;

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
      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '2.6rem', fontWeight: '800', color: T, lineHeight: 1, letterSpacing: '-1px' }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</div>
    </div>
  );
}

function TimelineStep({ icon, title, text, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', gap: '20px', alignItems: 'flex-start',
        padding: '20px 22px', borderRadius: '10px',
        background: hov ? C2 : 'transparent',
        border: `1px solid ${hov ? C3 : 'transparent'}`,
        transition: 'all 0.25s ease', cursor: 'default',
      }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        background: `${accent}18`, border: `2px solid ${accent}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.15rem', flexShrink: 0,
        boxShadow: hov ? `0 0 16px ${accent}40` : 'none',
        transition: 'box-shadow 0.25s ease',
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: BRIGHT, marginBottom: '6px' }}>{title}</div>
        <div style={{ fontSize: '0.88rem', color: BODY, lineHeight: '1.65' }}>{text}</div>
      </div>
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
  const pct = Math.round((completed / TOTAL_QUESTIONS) * 100);
  const done = pct === 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '0.72rem', color: MUTED, whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>Progress</span>
      <div style={{ position: 'relative', width: '160px', height: '8px', background: C3, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`,
          background: done ? 'linear-gradient(90deg,#22c55e,#4ade80)' : `linear-gradient(90deg,${T},#ff9898)`,
          borderRadius: '4px', transition: 'width 0.55s cubic-bezier(.16,1,.3,1)',
          boxShadow: pct > 0 ? `0 0 10px ${done ? '#22c55e' : T}90` : 'none',
        }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700', color: done ? '#22c55e' : T, whiteSpace: 'nowrap', minWidth: '36px', textAlign: 'right' }}>
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
          fontSize: '0.75rem', fontWeight: '800',
          color: solved ? '#34d399' : T,
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

export default function A02({ onBack }) {
  const [theoryInput, setTheoryInput]     = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [saltInput, setSaltInput]         = useState('');
  const [selectedAlgo, setSelectedAlgo]   = useState('');
  const [selectedBreach, setSelectedBreach] = useState('');

  const [feedbackQ1, setFeedbackQ1] = useState({ message: '', status: '' });
  const [feedbackQ2, setFeedbackQ2] = useState({ message: '', status: '' });
  const [feedbackQ3, setFeedbackQ3] = useState({ message: '', status: '' });
  const [feedbackQ4, setFeedbackQ4] = useState({ message: '', status: '' });
  const [feedbackQ5, setFeedbackQ5] = useState({ message: '', status: '' });

  const [showHintQ1, setShowHintQ1] = useState(false);
  const [showHintQ2, setShowHintQ2] = useState(false);
  const [showHintQ3, setShowHintQ3] = useState(false);
  const [showHintQ4, setShowHintQ4] = useState(false);
  const [showHintQ5, setShowHintQ5] = useState(false);

  const [complete, setComplete] = useState(false);
  const [backHov,  setBackHov]  = useState(false);
  const [siteHov,  setSiteHov]  = useState(false);
  const [hovV, setHovV] = useState({ q1: false, q2: false, q3: false, q4: false, q5: false });
  const [hovH, setHovH] = useState({ q1: false, q2: false, q3: false, q4: false, q5: false });
  const [hovAlgo, setHovAlgo] = useState('');

  const statuses       = [feedbackQ1.status, feedbackQ2.status, feedbackQ3.status, feedbackQ4.status, feedbackQ5.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const openSite = () => window.open(`${window.location.origin}${window.location.pathname}?mode=a02_target`, '_blank');
  const goHome   = () => { if (onBack) onBack(); else window.location.href = '/'; };

  const checkQ1 = (e) => {
    e.preventDefault();
    const v = theoryInput.trim().toLowerCase();
    if (!v) { setFeedbackQ1({ message: '⚠️ Please enter your answer.', status: 'error' }); return; }
    if (['sensitive data exposure', 'sensitive data', 'data exposure'].some(a => v.includes(a))) {
      setFeedbackQ1({ message: '🎉 Correct! Cryptographic failures are the direct gateway to Sensitive Data Exposure — attackers don\'t break the math, they just exploit weak or absent cryptography to read data in the clear.', status: 'success' });
    } else {
      setFeedbackQ1({ message: '❌ Not quite. Section 1 mentions the old name of this OWASP category — that name is the answer. Think: what type of data gets exposed?', status: 'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) { setFeedbackQ2({ message: '⚠️ Enter the cracked password.', status: 'error' }); return; }
    if (passwordInput.trim() === 'admin') {
      setFeedbackQ2({ message: '🎉 Correct! The MD5 hash 0192023a7bbd73250516f069df18b500 maps to "admin123" — top of every wordlist. A GPU running 10B hashes/sec cracks this in microseconds.', status: 'success' });
    } else {
      setFeedbackQ2({ message: '❌ Wrong. Open the target site → Database Dump tab, find the admin row, copy the hash, paste into the Wordlist Cracker tab.', status: 'error' });
    }
  };

  const checkQ3 = (e) => {
    e.preventDefault();
    if (!selectedAlgo) { setFeedbackQ3({ message: '⚠️ Please select an algorithm.', status: 'error' }); return; }
    if (selectedAlgo === 'bcrypt') {
      setFeedbackQ3({ message: '🎉 Correct! bcrypt\'s tunable cost factor makes each guess exponentially slower as hardware improves — and its built-in salt ensures two identical passwords never produce the same hash.', status: 'success' });
    } else {
      const extra = selectedAlgo === 'argon2'
        ? ' (Argon2 is excellent — but the question asks which one is demonstrated in Section 3\'s mitigation strategies.)'
        : ' It\'s a fast hash — speed is the enemy of password storage.';
      const nm = { md5: 'MD5', sha1: 'SHA-1', sha256: 'SHA-256 (unsalted)', argon2: 'Argon2' };
      setFeedbackQ3({ message: `❌ ${nm[selectedAlgo] || selectedAlgo} is not the best answer here.${extra}`, status: 'error' });
    }
  };

  const checkQ4 = (e) => {
    e.preventDefault();
    const v = saltInput.trim().toLowerCase();
    if (!v) { setFeedbackQ4({ message: '⚠️ Please enter your answer.', status: 'error' }); return; }
    if (['salt', 'salting', 'salt the password', 'add a salt', 'random salt'].some(a => v.includes(a))) {
      setFeedbackQ4({ message: '🎉 Correct! Salting adds a unique random value to each password before hashing. This makes precomputed rainbow tables completely useless — attackers must brute-force every account separately.', status: 'success' });
    } else {
      setFeedbackQ4({ message: '❌ Not quite. Think about what bcrypt/Argon2 automatically add to each password before hashing to make rainbow tables useless. Section 2 covers it explicitly.', status: 'error' });
    }
  };

  const checkQ5 = (e) => {
    e.preventDefault();
    if (!selectedBreach) { setFeedbackQ5({ message: '⚠️ Please select a breach.', status: 'error' }); return; }
    if (selectedBreach === 'facebook') {
      setFeedbackQ5({ message: '🎉 Correct! Facebook/Instagram stored millions of passwords in plaintext internal logs — no hashing at all. A logging misconfiguration meant anyone with log access could read raw passwords.', status: 'success' });
    } else {
      const msgs = {
        linkedin: '❌ LinkedIn used MD5 without salt — still cryptography, just broken. Look for the breach where NO hashing was used at all.',
        adobe:    '❌ Adobe used 3DES in ECB mode — bad crypto, but still crypto. The question asks which organisation skipped encryption entirely.',
        myspace:  '❌ MySpace used SHA-1 without salt — weak, but still a hash function. Check Section 5 for the 2019 case.',
      };
      setFeedbackQ5({ message: msgs[selectedBreach] || '❌ Incorrect. Re-read Section 5\'s real-world case studies.', status: 'error' });
    }
  };

  const algoOptions = [
    { id: 'md5',    label: 'MD5',                desc: '128-bit · ~10B hashes/sec on GPU · no salt' },
    { id: 'sha1',   label: 'SHA-1',              desc: '160-bit · ~4B hashes/sec · collision attacks known' },
    { id: 'bcrypt', label: 'bcrypt',             desc: 'Cost factor · ~25K hashes/sec · salt built-in' },
    { id: 'sha256', label: 'SHA-256 (unsalted)', desc: '256-bit · ~1B hashes/sec · rainbow table vulnerable' },
  ];

  const breachOptions = [
    { id: 'linkedin', label: 'LinkedIn (2012)', desc: 'MD5 without salt — 6.5M records' },
    { id: 'adobe',    label: 'Adobe (2013)',    desc: '3DES/ECB encryption — 153M records' },
    { id: 'myspace',  label: 'MySpace (2016)',  desc: 'SHA-1 unsalted — 360M records' },
    { id: 'facebook', label: 'Facebook (2019)', desc: 'Instagram passwords in plaintext logs — 600M records' },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: '100vh', color: BODY, boxSizing: 'border-box' }}>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes popIn     { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        @keyframes float     { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(4deg)} }
        @keyframes backdropIn{ from{opacity:0} to{opacity:1} }
        @keyframes shimmerRed{ 0%{left:-160%} 45%{left:160%} 100%{left:160%} }
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
          background: linear-gradient(105deg, transparent 30%, ${T}08 50%, transparent 70%);
          background-size: 200% 100%; animation: borderFlow 6s linear infinite;
        }
        .view-btn::before {
          content:''; position:absolute; top:0; left:-160%; width:55%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
          transform:skewX(-22deg); animation:shimmerRed 3.8s infinite;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
      `}</style>

      {/* COMPLETION MODAL */}
      {complete && (
        <div onClick={() => setComplete(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn .3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '16px', padding: '40px 36px', textAlign: 'center', maxWidth: '440px', width: '92%' }} className="pop-in">
            <div style={{ fontSize: '64px', marginBottom: '12px' }} className="float">🏆</div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: T, margin: '0 0 10px' }}>Challenge Complete!</h2>
            <p style={{ color: BODY, lineHeight: '1.6', margin: '0 0 18px' }}>
              You've mastered <strong style={{ color: BRIGHT }}>A02: Cryptographic Failures</strong> — understanding why weak hashing destroys security and what to use instead.
            </p>
            <div style={{ background: C2, borderRadius: '8px', padding: '14px 18px', fontSize: '0.85rem', color: BODY, textAlign: 'left', lineHeight: '1.9', marginBottom: '20px' }}>
              <div>✓ Identified what cryptographic failures expose</div>
              <div>✓ Cracked an admin MD5 hash from a live target</div>
              <div>✓ Selected the correct password hashing algorithm</div>
              <div>✓ Named the technique that defeats rainbow tables</div>
              <div>✓ Identified the breach with zero cryptography</div>
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
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: T }}>A02:2021</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 32px 60px', textAlign: 'center', background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${T}12 0%, transparent 70%)` }} className="hero-shimmer">
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: .04, fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: '1.4', color: T, userSelect: 'none', whiteSpace: 'pre-wrap', padding: '10px', pointerEvents: 'none' }}>
          {Array(12).fill('5f4dcc3b5aa765d  0192023a7bbd73  e10adc3949ba59  827ccb0eea8a70  0d107d09f5bbe4  25d55ad283aa40  ').join('\n')}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${T}18`, border: `1px solid ${T}40`, borderRadius: '20px', padding: '5px 16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '2px' }}>A02:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: '800', color: BRIGHT, margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Cryptographic<br /><span style={{ color: T }}>Failures</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: BODY, maxWidth: '560px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            When encryption is absent, weak, or misapplied — passwords, financial records, and personal data become trivially readable by any attacker with a wordlist.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', maxWidth: '720px', margin: '0 auto' }}>
            <StatCard value={10}  suffix="B/s" label="MD5 hashes per second (GPU)" delay={0} />
            <StatCard value={6}   suffix="hrs" label="Time to crack 8-char password" delay={100} />
            <StatCard value={280} suffix="yrs" label="Same attack against bcrypt" delay={200} />
            <StatCard value={14}  suffix="M"   label="Passwords in rockyou.txt" delay={300} />
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* SECTION 1 */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Definition" title="What are Cryptographic Failures?" id="definition" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <p style={{ margin: '0 0 14px', lineHeight: '1.75', fontSize: '0.95rem' }}>
                <strong style={{ color: BRIGHT }}>A02:2021 – Cryptographic Failures</strong> (formerly "Sensitive Data Exposure") describes situations where cryptography is missing, weak, or incorrectly implemented.
              </p>
              <p style={{ margin: 0, lineHeight: '1.75', fontSize: '0.95rem' }}>
                This doesn't require "breaking" modern math. Attackers exploit shortcuts: a leaked database full of MD5 passwords, an HTTP endpoint serving credit card data, or an outdated cipher like DES in production.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Ask These First</div>
              {[
                'Is any data transmitted in cleartext (HTTP, FTP, SMTP)?',
                'Are passwords stored with old hashes like MD5 or SHA-1?',
                'Are deprecated cryptographic algorithms still in use?',
                'Are encryption keys hard-coded or poorly managed?',
                'Is encryption actually enforced, or just available?',
              ].map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 4 ? '10px' : 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
                  <span style={{ color: T, fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: BODY }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2 */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Core Concept" title="How Password Hashing Works" id="hashing" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>The Promise of Hashing</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                A hash function converts any input into a fixed-length string. It's a <strong style={{ color: BRIGHT }}>one-way function</strong> — you can't mathematically reverse it. Websites hash passwords so that even if their database is stolen, attackers can't directly read passwords.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                The problem: <em style={{ color: T }}>not all hash functions are equal</em>. MD5 was built for speed (checksums, file verification) — that same speed is catastrophic for passwords.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Why Speed Kills</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'MD5 speed',      val: '10,000,000,000/s', bad: true },
                  { label: 'SHA-256 speed',  val: '1,000,000,000/s',  bad: true },
                  { label: 'bcrypt cost=10', val: '~100/s',           bad: false },
                  { label: 'Argon2 tuned',   val: '~10/s',            bad: false },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: C2, borderRadius: '6px', border: `1px solid ${C3}` }}>
                    <span style={{ fontSize: '0.85rem', color: BODY }}>{r.label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: '700', color: r.bad ? T : '#22c55e' }}>{r.val}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: MUTED, lineHeight: '1.6' }}>
                At 10B hashes/sec, rockyou.txt (14M words) is exhausted in 1.4 milliseconds.
              </p>
            </div>
          </div>
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Rainbow Tables & Why Salting Matters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: T, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Without Salt</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '14px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.9' }}>
                  <div><span style={{ color: MUTED }}>user_a:</span> <span style={{ color: T }}>5f4dcc3b...</span> <span style={{ color: '#ef4444' }}>← "password"</span></div>
                  <div><span style={{ color: MUTED }}>user_b:</span> <span style={{ color: T }}>5f4dcc3b...</span> <span style={{ color: '#ef4444' }}>← same hash!</span></div>
                  <div><span style={{ color: MUTED }}>user_c:</span> <span style={{ color: T }}>5f4dcc3b...</span> <span style={{ color: '#ef4444' }}>← crack once, own all</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>Precomputed rainbow tables map every common hash to its plaintext. One lookup = instant crack.</p>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#22c55e', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>With Salt (bcrypt)</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '14px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.9' }}>
                  <div><span style={{ color: MUTED }}>user_a:</span> <span style={{ color: '#22c55e' }}>$2b$12$Xa7k...</span></div>
                  <div><span style={{ color: MUTED }}>user_b:</span> <span style={{ color: '#22c55e' }}>$2b$12$mQ9p...</span></div>
                  <div><span style={{ color: MUTED }}>user_c:</span> <span style={{ color: '#22c55e' }}>$2b$12$Tz3r...</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>Every hash is unique. Rainbow tables are useless. Each account must be brute-forced individually at 25K/sec.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — Common Scenarios: all cards now use primary T color */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Threat Landscape" title="Common Scenarios" id="scenarios" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '🗄️', title: 'Database Breach + Weak Hashes', text: 'Attacker dumps user table. All MD5/SHA-1 passwords are cracked within hours using GPU rigs and Hashcat. Entire user base compromised with zero cryptographic "breaking."' },
              { icon: '🌐', title: 'Man-in-the-Middle (MITM)',       text: 'Login over HTTP allows a network attacker to capture credentials in transit — no encryption means no protection. Common on public Wi-Fi, rogue APs, or misconfigured proxies.' },
              { icon: '🔑', title: 'Hard-coded / Exposed Keys',      text: 'API keys, TLS certificates, or encryption secrets committed to GitHub repos or baked into APKs. Automated scanners find these within minutes of a public push.' },
              { icon: '🧮', title: 'Deprecated Algorithm Usage',     text: 'DES (56-bit), RC4, or MD5 used for signatures/encryption. Each has known practical attacks. False security — data appears "encrypted" but is trivially recoverable.' },
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
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>Typical Attack Chain</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { step: '01', label: 'DB Breach',           sub: 'SQL injection or server exploit' },
                { step: '02', label: 'Hash Dump',           sub: 'Download password_hash column' },
                { step: '03', label: 'Hashcat',             sub: 'GPU dictionary + rules attack' },
                { step: '04', label: 'Credential Stuffing', sub: 'Cracked passwords → all services' },
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

        {/* SECTION 4 */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Defense" title="Mitigation Strategies" id="mitigation" />
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            <TimelineStep icon="🔑" accent="#22c55e" title="Use purpose-built password hashing algorithms" text="Store passwords with bcrypt, scrypt, or Argon2id — never MD5, SHA-1, or plain SHA-256. These algorithms have a tunable cost factor: as hardware gets faster, you increase the cost to keep crack times constant. bcrypt at cost=12 allows ~25K guesses/sec; a typical GPU doing 10B/sec against MD5 is reduced by a factor of 400,000×." />
            <TimelineStep icon="🧂" accent="#3b82f6" title="Always salt — or use an algorithm that does it for you" text="A unique random salt (added before hashing) ensures two users with the same password have completely different hashes. bcrypt/Argon2 handle salting automatically and store the salt alongside the hash in one string. Never implement salt manually with SHA-256 — use a dedicated library." />
            <TimelineStep icon="🔐" accent="#8b5cf6" title="Enforce TLS 1.2+ everywhere, disable legacy protocols" text="All data in transit — login forms, API calls, password resets — must travel over TLS. Disable TLS 1.0, TLS 1.1, SSL 2/3, and weak cipher suites (RC4, 3DES). Enable HSTS with preloading to prevent protocol downgrade attacks." />
            <TimelineStep icon="🗑️" accent="#f97316" title="Minimise what you store" text="Don't encrypt sensitive data — avoid storing it entirely if you can. For payment data, use tokenization (Stripe, Braintree). For PII, store only what's legally required. The safest data breach is the one where stolen records contain nothing useful." />
            <TimelineStep icon="🔄" accent="#eab308" title="Rotate keys, audit algorithms, plan migration" text="Set a key rotation schedule. Audit every hash algorithm in production annually — mark MD5/SHA-1 for replacement. When migrating, re-hash passwords transparently on next login using a wrapper that recognises the old format." />
          </div>
        </section>

        {/* SECTION 5 */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World Cryptographic Failures" id="examples" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
            {[
              { year: '2012', org: 'LinkedIn', icon: '💼', count: '6.5M',  desc: 'MD5 password hashes leaked without salt. 90% cracked within days. Led to a second breach in 2016 where 117M accounts were found affected.' },
              { year: '2013', org: 'Adobe',    icon: '🎨', count: '153M',  desc: 'Encrypted with 3DES in ECB mode — same blocks produce same ciphertext. Passwords were effectively in plaintext due to visual patterns.' },
              { year: '2016', org: 'MySpace',  icon: '🎵', count: '360M',  desc: 'SHA-1 unsalted hashes from 2008 leaked. Cracked en masse. Demonstrated how old breaches compound when users reuse passwords.' },
              { year: '2019', org: 'Facebook', icon: '📱', count: '600M',  desc: 'Millions of Instagram passwords stored in plaintext in internal logs. No cryptography at all — a logging misconfiguration exposed everything.' },
            ].map(c => (
              <div key={c.org} style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '10px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
                    <span style={{ fontWeight: '800', color: BRIGHT, fontSize: '1rem' }}>{c.org}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: MUTED, background: C2, padding: '3px 8px', borderRadius: '4px' }}>{c.year}</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: '800', color: T, marginBottom: '10px' }}>{c.count} records</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: BODY, lineHeight: '1.65' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Challenge */}
        <section className="fade-up">
          <SectionHead label="Lab" title="Interactive Challenge: MD5 Hash Cracking" id="challenge" />

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Lab header */}
            <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: BRIGHT }}>Security Lab · A02 — Cryptographic Failures</span>
              </div>
              <button onClick={openSite} onMouseEnter={() => setSiteHov(true)} onMouseLeave={() => setSiteHov(false)}
                style={{
                  position: 'relative', overflow: 'hidden', padding: '9px 22px', borderRadius: '6px', border: 'none',
                  background: siteHov ? '#ff8585' : T, color: '#0a0f1e', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
                  boxShadow: siteHov ? `0 0 20px ${T}80` : `0 4px 12px ${T}40`,
                  transform: siteHov ? 'scale(1.03)' : 'scale(1)', transition: 'all .22s ease',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                className="btn view-btn">🌐 View Site</button>
            </div>

            <div style={{ padding: '32px 28px' }}>
              <p style={{ margin: '0 0 32px', fontSize: '0.95rem', color: BODY, lineHeight: '1.7' }}>
                A simulated database leak from <strong style={{ color: BRIGHT }}>ShopVN</strong>, a fictional e-commerce site, has been made available for analysis.
                Open the target site, inspect the exposed MD5 hashes, use the built-in wordlist cracker, and answer all five questions to complete this lab.
              </p>

              {/* Q1 */}
              <QuestionBlock num={1} solved={feedbackQ1.status === 'success'}
                label={<>According to Section 1, cryptographic failures often directly lead to what type of security incident? <span style={{ color: MUTED, fontWeight: '400' }}>(2–3 words)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Type your answer…" value={theoryInput}
                    onChange={e => setTheoryInput(e.target.value)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1: v }))} />
                  <HintBtn onClick={() => setShowHintQ1(!showHintQ1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1: v }))} />
                </div>
                {showHintQ1 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Section 1 reveals the old OWASP name for this category. That former name is exactly the answer.</div>}
                {feedbackQ1.message && <div style={fbStyle(feedbackQ1.status)} className="slide-in">{feedbackQ1.message}</div>}
              </QuestionBlock>

              {/* Q2 */}
              <QuestionBlock num={2} solved={feedbackQ2.status === 'success'}
                label={<>On the target site, find the <strong style={{ color: T }}>admin</strong> account's MD5 hash and crack it. What is the plaintext password?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Enter cracked password…" value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    style={{ ...inputStyle, color: '#fbbf24', fontFamily: 'monospace' }} />
                  <VerifyBtn onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2: v }))} />
                  <HintBtn onClick={() => setShowHintQ2(!showHintQ2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2: v }))} />
                </div>
                {showHintQ2 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Target site → Database Dump tab → admin row → copy hash → Wordlist Cracker tab → paste and run.</div>}
                {feedbackQ2.message && <div style={fbStyle(feedbackQ2.status)} className="slide-in">{feedbackQ2.message}</div>}
              </QuestionBlock>

              {/* Q3 — radio cards */}
              <QuestionBlock num={3} solved={feedbackQ3.status === 'success'}
                label="Which algorithm should you use to securely store user passwords?">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '12px', marginBottom: '14px' }}>
                  {algoOptions.map(opt => {
                    const sel = selectedAlgo === opt.id;
                    const hov = hovAlgo === opt.id;
                    return (
                      <div key={opt.id} onClick={() => setSelectedAlgo(opt.id)}
                        onMouseEnter={() => setHovAlgo(opt.id)} onMouseLeave={() => setHovAlgo('')}
                        style={{ padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', border: sel ? `2px solid ${T}` : hov ? `2px solid ${T}60` : `2px solid ${C3}`, background: sel ? `${T}12` : C2, transition: 'all .2s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: `2px solid ${sel ? T : '#475569'}`, background: sel ? T : 'transparent', flexShrink: 0, transition: 'all .2s' }} />
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', fontFamily: 'monospace', color: sel ? T : BRIGHT }}>{opt.label}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: MUTED, lineHeight: '1.4' }}>{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <VerifyBtn label="Submit Answer" onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3: v }))} />
                  <HintBtn onClick={() => setShowHintQ3(!showHintQ3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3: v }))} />
                </div>
                {showHintQ3 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Look for the algorithm in Section 4's Mitigation Strategies that mentions a "cost factor" making it intentionally slow.</div>}
                {feedbackQ3.message && <div style={fbStyle(feedbackQ3.status)} className="slide-in">{feedbackQ3.message}</div>}
              </QuestionBlock>

              {/* Q4 */}
              <QuestionBlock num={4} solved={feedbackQ4.status === 'success'}
                label={<>According to Section 2, what technique makes precomputed rainbow table attacks completely useless? <span style={{ color: MUTED, fontWeight: '400' }}>(one word)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Type your answer…" value={saltInput}
                    onChange={e => setSaltInput(e.target.value)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ4} hov={hovV.q4} onHov={v => setHovV(p => ({ ...p, q4: v }))} />
                  <HintBtn onClick={() => setShowHintQ4(!showHintQ4)} hov={hovH.q4} onHov={v => setHovH(p => ({ ...p, q4: v }))} />
                </div>
                {showHintQ4 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Section 2 shows the "Without ___" vs "With ___ (bcrypt)" comparison. The missing word is the answer.</div>}
                {feedbackQ4.message && <div style={fbStyle(feedbackQ4.status)} className="slide-in">{feedbackQ4.message}</div>}
              </QuestionBlock>

              {/* Q5 — radio cards */}
              <QuestionBlock num={5} solved={feedbackQ5.status === 'success'}
                label="Based on the real-world case studies in Section 5, which organisation stored passwords with NO cryptography whatsoever?">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', marginBottom: '14px' }}>
                  {breachOptions.map(opt => {
                    const sel = selectedBreach === opt.id;
                    const hov = hovAlgo === `breach_${opt.id}`;
                    return (
                      <div key={opt.id} onClick={() => setSelectedBreach(opt.id)}
                        onMouseEnter={() => setHovAlgo(`breach_${opt.id}`)} onMouseLeave={() => setHovAlgo('')}
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
                  <VerifyBtn label="Submit Answer" onClick={checkQ5} hov={hovV.q5} onHov={v => setHovV(p => ({ ...p, q5: v }))} />
                  <HintBtn onClick={() => setShowHintQ5(!showHintQ5)} hov={hovH.q5} onHov={v => setHovH(p => ({ ...p, q5: v }))} />
                </div>
                {showHintQ5 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Look for the 2019 case study — the description mentions "no cryptography at all" and a logging misconfiguration.</div>}
                {feedbackQ5.message && <div style={fbStyle(feedbackQ5.status)} className="slide-in">{feedbackQ5.message}</div>}
              </QuestionBlock>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}