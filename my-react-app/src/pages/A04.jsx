import React, { useState, useEffect, useRef } from 'react';

const T      = '#2ecc71';
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
  const pct = Math.round((completed / TOTAL_QUESTIONS) * 100);
  const done = pct === 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '0.72rem', color: MUTED, whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>Progress</span>
      <div style={{ position: 'relative', width: '160px', height: '8px', background: C3, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`,
          background: done ? 'linear-gradient(90deg,#22c55e,#4ade80)' : `linear-gradient(90deg,${T},#5effa0)`,
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

export default function A04({ onBack }) {
  const [theoryInput,   setTheoryInput]   = useState('');
  const [strategyInput, setStrategyInput] = useState('');
  const [flagInput,     setFlagInput]     = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');

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
  const [hovScenario, setHovScenario] = useState('');

  const statuses       = [feedbackQ1.status, feedbackQ2.status, feedbackQ3.status, feedbackQ4.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const goHome   = () => { if (onBack) onBack(); else window.location.href = '/'; };
  const openSite = () => {
    const currentUrl = window.location.origin + window.location.pathname;
    window.open(`${currentUrl}?mode=target_site`, '_blank');
  };

  const checkQ1 = (e) => {
    e.preventDefault();
    const v = theoryInput.trim().toLowerCase();
    if (!v) { setFeedbackQ1({ message: '⚠️ Please enter your answer before verifying.', status: 'error' }); return; }
    if (v === 'structural implementation errors' || v === 'structural implementation error') {
      setFeedbackQ1({ message: '🎉 Correct! Insecure Design is fundamentally distinct from structural implementation errors — it lives at the architecture layer, not the code layer.', status: 'success' });
    } else {
      setFeedbackQ1({ message: '❌ Incorrect. Look at the second paragraph of the Definition section — find the 3-word phrase (starting with "structural…") that describes execution/coding bugs.', status: 'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    const v = strategyInput.trim().toLowerCase();
    if (!v) { setFeedbackQ2({ message: '⚠️ Please enter your answer before verifying.', status: 'error' }); return; }
    if (v === 'threat modeling' || v === 'threat model') {
      setFeedbackQ2({ message: '🎉 Correct! Threat Modeling (STRIDE/PASTA) applied early in the SDLC is the primary lever for catching design flaws before code is ever written.', status: 'success' });
    } else {
      setFeedbackQ2({ message: '❌ Incorrect. Check the Mitigation Strategies section — what is the first badge/strategy listed?', status: 'error' });
    }
  };

  const checkQ3 = (e) => {
    e.preventDefault();
    const v = flagInput.trim().toLowerCase();
    if (!v) { setFeedbackQ3({ message: '⚠️ Please enter the flag string.', status: 'error' }); return; }
    if (v === 'flag{insecure_design_logic_flaw_bypass_success}') {
      setFeedbackQ3({ message: '🎉 Flag verified! You successfully exploited the insecure authentication recovery design — a predictable security question with a hardcoded default answer.', status: 'success' });
    } else {
      setFeedbackQ3({ message: '❌ Wrong flag. Open the target site, enter username "joseph", click "Forgot Password?", select Question 3 and type "blue" as the answer. Copy the generated flag.', status: 'error' });
    }
  };

  const checkQ4 = (e) => {
    e.preventDefault();
    if (!selectedScenario) { setFeedbackQ4({ message: '⚠️ Please select an answer.', status: 'error' }); return; }
    if (selectedScenario === 'client_state') {
      setFeedbackQ4({ message: '🎉 Correct! Trusting client-side state (price, discount, quantity) is a design flaw — the server must validate all business-logic data server-side, never trusting values from the browser.', status: 'success' });
    } else {
      const msgs = {
        sql_injection: '❌ SQL injection is an implementation bug (code error), not a design flaw — it can be fixed by sanitising inputs without redesigning the system.',
        buffer_overflow: '❌ A buffer overflow is an implementation error at the code layer, not an architectural design flaw.',
        missing_tls: '❌ Missing TLS is a configuration/implementation gap. While serious, it does not require re-architecting the system\'s business logic.',
      };
      setFeedbackQ4({ message: msgs[selectedScenario] || '❌ Incorrect. Re-read the Attack Patterns section.', status: 'error' });
    }
  };

  const scenarioOptions = [
    { id: 'sql_injection',   label: 'SQL Injection',             desc: 'Unsanitised user input in a database query' },
    { id: 'client_state',    label: 'Trusting Client-Side State', desc: 'Price & discount sent from the browser and accepted server-side' },
    { id: 'buffer_overflow', label: 'Buffer Overflow',           desc: 'Writing past allocated memory boundaries in C code' },
    { id: 'missing_tls',     label: 'Missing TLS',               desc: 'Login form served over HTTP instead of HTTPS' },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: '100vh', color: BODY, boxSizing: 'border-box' }}>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes popIn     { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        @keyframes float     { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(4deg)} }
        @keyframes backdropIn{ from{opacity:0} to{opacity:1} }
        @keyframes shimmerGreen{ 0%{left:-160%} 45%{left:160%} 100%{left:160%} }
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
          background: linear-gradient(105deg, transparent 30%, ${T}06 50%, transparent 70%);
          background-size: 200% 100%; animation: borderFlow 6s linear infinite;
        }
        .view-btn::before {
          content:''; position:absolute; top:0; left:-160%; width:55%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
          transform:skewX(-22deg); animation:shimmerGreen 3.8s infinite;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
      `}</style>

      {/* COMPLETION MODAL */}
      {complete && (
        <div onClick={() => setComplete(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn .3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '16px', padding: '40px 36px', textAlign: 'center', maxWidth: '440px', width: '92%' }} className="pop-in">
            <div style={{ fontSize: '64px', marginBottom: '12px' }} className="float">⚡</div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: T, margin: '0 0 10px' }}>Lab Cleared!</h2>
            <p style={{ color: BODY, lineHeight: '1.6', margin: '0 0 18px' }}>
              You've mastered <strong style={{ color: BRIGHT }}>A04: Insecure Design</strong> — understanding how flawed architecture enables logic bypass attacks that no amount of careful coding can prevent.
            </p>
            <div style={{ background: C2, borderRadius: '8px', padding: '14px 18px', fontSize: '0.85rem', color: BODY, textAlign: 'left', lineHeight: '1.9', marginBottom: '20px' }}>
              <div>✓ Root cause vs implementation errors distinguished</div>
              <div>✓ Threat modeling identified as the key mitigation</div>
              <div>✓ Logic bypass flag captured from vulnerable portal</div>
              <div>✓ Design flaws correctly distinguished from code bugs</div>
            </div>
            <button onClick={() => setComplete(false)} style={{ background: T, color: '#0a0f1e', border: 'none', borderRadius: '8px', padding: '11px 32px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }} className="btn">
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: `${BG}e8`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C3}`, padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={goHome}
          onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
          style={{ padding: '7px 16px', borderRadius: '6px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', border: `1px solid ${backHov ? T : C3}`, color: backHov ? T : BODY, background: 'transparent', transform: backHov ? 'translateX(-3px)' : 'none', transition: 'all .2s ease', flexShrink: 0 }}
          className="btn">← Back</button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ProgressBar completed={completedCount} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T, boxShadow: `0 0 8px ${T}`, animation: 'glowPulse 2s infinite' }} />
          <span style={{ fontSize: '0.8rem', color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' }}>OWASP Top 10</span>
          <span style={{ color: C3 }}>·</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: T }}>A04:2021</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 32px 60px', textAlign: 'center', background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${T}10 0%, transparent 70%)` }} className="hero-shimmer">
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: .03, fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: '1.4', color: T, userSelect: 'none', whiteSpace: 'pre-wrap', padding: '10px', pointerEvents: 'none' }}>
          {Array(12).fill('THREAT_MODEL  STRIDE  PASTA  SDLC  AUTH_DESIGN  LOGIC_FLAW  RECOVERY_BYPASS  RATE_LIMIT  TRUST_BOUNDARY  ').join('\n')}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${T}18`, border: `1px solid ${T}40`, borderRadius: '20px', padding: '5px 16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '2px' }}>A04:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: '800', color: BRIGHT, margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Insecure<br /><span style={{ color: T }}>Design</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: BODY, maxWidth: '560px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            Flaws baked into architecture itself — no patch fixes a broken blueprint. When threat modeling is skipped, attackers exploit the logic of the system, not its bugs.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', maxWidth: '720px', margin: '0 auto' }}>
            <StatCard value={4}   suffix="th" label="Most critical OWASP risk — new category in 2021" delay={0} />
            <StatCard value={40}  suffix="+"  label="CWEs mapped to insecure design patterns" delay={100} />
            <StatCard value={3}   suffix=""   label="Core attack scenarios covered in this lab" delay={200} />
            <StatCard value={100} suffix="%"  label="Of design flaws preventable with early threat modeling" delay={300} />
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* SECTION 1: Definition */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Definition" title="What is Insecure Design?" id="definition" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <p style={{ margin: '0 0 14px', lineHeight: '1.75', fontSize: '0.95rem' }}>
                <strong style={{ color: BRIGHT }}>A04:2021 – Insecure Design</strong> is a new OWASP category focused on risks originating from flaws in architecture and system design — not from bugs in the implementation. If a design is inherently unsafe, even a perfectly written codebase cannot prevent exploitation.
              </p>
              <p style={{ margin: 0, lineHeight: '1.75', fontSize: '0.95rem' }}>
                Unlike <strong style={{ color: T }}>structural implementation errors</strong>, Insecure Design mandates a shift-left approach: integrating <em style={{ color: '#cbd5e1' }}>Threat Modeling</em>, secure design patterns, and reference architectures throughout the entire SDLC — before a single line of code is written.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Key Design vs Implementation Distinction</div>
              {[
                { label: 'Implementation bug', val: 'SQL injection, buffer overflow — fixed by patching or refactoring code', ok: true },
                { label: 'Design flaw',        val: 'Guessable password recovery, missing rate limits — fixing code alone cannot fix these', ok: false },
                { label: 'Why it matters',     val: 'A broken blueprint requires re-architecting the system, not just rewriting a function', ok: null },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: C2, borderRadius: '6px', border: `1px solid ${C3}`, marginBottom: i < 2 ? '10px' : 0 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: r.ok === null ? MUTED : r.ok ? T : '#ef4444', flexShrink: 0, minWidth: '110px' }}>{r.label}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: BODY, lineHeight: '1.5' }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Core Concept */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Core Concept" title="Design vs Implementation" id="concept" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>The Shift-Left Imperative</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                Security reviews and penetration tests happen late in development — long after fundamental design decisions are locked in. Insecure Design requires security to move <em style={{ color: T }}>left</em> in the SDLC: into requirements, architecture, and sprint planning.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                Once a flawed design ships, every subsequent patch is a workaround for a problem that should never have existed. The cost of fixing design flaws multiplies with each phase of the SDLC they survive.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Why Logic Flaws Are Dangerous</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                Implementation bugs leave fingerprints — crash logs, anomalous traffic, scanner signatures. Logic flaws leave none: the attacker follows the exact intended flow, just with a different intent.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                WAFs, IDS, and code scanners are blind to logic flaws because the request <strong style={{ color: BRIGHT }}>looks completely legitimate</strong>. Only a human reviewing the threat model can catch them.
              </p>
            </div>
          </div>
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Cost of Fixing a Design Flaw by SDLC Phase</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { phase: 'Requirements', bar: 6,   label: '1×' },
                { phase: 'Design',       bar: 30,  label: '5×' },
                { phase: 'Development',  bar: 60,  label: '10×' },
                { phase: 'Testing',      bar: 82,  label: '15×' },
                { phase: 'Production',   bar: 100, label: '30×+' },
              ].map((r) => (
                <div key={r.phase} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '0.8rem', color: BODY, minWidth: '100px', textAlign: 'right' }}>{r.phase}</span>
                  <div style={{ flex: 1, height: '10px', background: C2, borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.bar}%`, background: `linear-gradient(90deg, ${T}, ${T}80)`, borderRadius: '5px' }} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: '700', color: r.bar === 100 ? '#ef4444' : T, minWidth: '36px' }}>{r.label}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: '16px 0 0', fontSize: '0.8rem', color: MUTED, lineHeight: '1.5' }}>Relative cost multiplier to remediate a design flaw discovered at each phase (IBM Systems Sciences Institute)</p>
          </div>
        </section>

        {/* SECTION 3: Attack Patterns */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Attack Patterns" title="Common Scenarios" id="scenarios" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '🔑', title: 'Predictable Recovery Flow',          text: 'Password recovery via knowledge-based questions (KBQ) with guessable or hardcoded defaults — attackers enumerate common answers with no lockout, bypassing authentication entirely.' },
              { icon: '🛒', title: 'Trusting Client-Side State',          text: 'E-commerce designs that accept price, discount, or quantity parameters from the browser. Attackers modify the request payload to purchase items at arbitrary prices.' },
              { icon: '⏱️', title: 'Missing Business-Tier Rate Limiting', text: 'APIs or workflows with no anti-automation controls allow attackers to brute-force OTPs, exhaust inventory, mass-register accounts, or abuse free-tier resources at scale.' },
            ].map(s => (
              <div key={s.title} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '10px', padding: '22px' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{s.icon}</div>
                <div style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.95rem', marginBottom: '10px' }}>{s.title}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: BODY, lineHeight: '1.65' }}>{s.text}</p>
              </div>
            ))}
          </div>
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>Typical Logic Bypass Attack Chain</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { step: '01', label: 'Reconnaissance',    sub: 'Identify auth recovery endpoint' },
                { step: '02', label: 'Question Analysis', sub: 'Find weakest / most generic KBQ' },
                { step: '03', label: 'Enumeration',       sub: 'Try common answers: colors, pets, cities' },
                { step: '04', label: 'Credential Reset',  sub: 'Obtain temp password, log in as admin' },
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

        {/* SECTION 4: Defense */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Defense" title="Mitigation Strategies" id="mitigation" />
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            <TimelineStep icon="🗺️" accent="#22c55e" title="Integrate STRIDE/PASTA into every sprint" text="Formalize threat modeling early in sprint workflows to surface logic flaws before any backend components are built. Use STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) or PASTA to map trust boundaries systematically." />
            <TimelineStep icon="🔑" accent="#3b82f6" title="Deprecate knowledge-based questions entirely" text="Replace KBQ-based password recovery with out-of-band multi-factor signals: time-based OTPs (TOTP), hardware tokens, or magic links sent to a verified email/phone. These cannot be guessed — they require physical access." />
            <TimelineStep icon="⛓️" accent="#8b5cf6" title="Never trust data from the client tier" text="Enforce all business logic, price calculations, and state transitions on the server. Treat every value arriving from the front end as untrusted and validate it against authoritative server-side state." />
            <TimelineStep icon="🔢" accent="#f97316" title="Enforce limits at the business layer, not just network" text="Implement per-account, per-IP, and per-session rate limits on sensitive operations: password resets, OTP checks, account creation, and checkout. Pair with CAPTCHA for flows that allow unauthenticated access." />
          </div>
        </section>

        {/* SECTION 5: Case Studies */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World Design Failures" id="examples" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
            {[
              { year: '2016', org: 'Yahoo',    icon: '📧', stat: '500M accounts',       desc: 'Security questions were used as an account recovery fallback. Attackers brute-forced answers at scale — no rate limiting, no lockout. Knowledge-based auth at its worst.' },
              { year: '2018', org: 'Facebook', icon: '📘', stat: '50M sessions',        desc: '"View As" feature had a flawed token-generation logic that issued access tokens scoped to the wrong user. A design assumption about token ownership was simply wrong.' },
              { year: '2020', org: 'Twitter',  icon: '🐦', stat: '130 accounts',        desc: 'Social-engineering call-center agents into resetting accounts via a phone-based flow with no proper verification — the "recovery design" trusted human operators with no safeguards.' },
              { year: '2022', org: 'Uber',     icon: '🚗', stat: 'Full internal access', desc: 'MFA fatigue attack: contractor bombarded with push notifications until they approved one. The MFA design had no anomaly detection for excessive approval requests.' },
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

        {/* SECTION 6: Challenge */}
        <section className="fade-up">
          <SectionHead label="Lab" title="Interactive Challenge: Logic Bypass Simulation" id="challenge" />

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Lab header */}
            <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: BRIGHT }}>Security Lab · A04 — Insecure Design</span>
              </div>
              <button
                onClick={openSite}
                onMouseEnter={() => setSiteHov(true)}
                onMouseLeave={() => setSiteHov(false)}
                style={{
                  position: 'relative', overflow: 'hidden', padding: '9px 22px', borderRadius: '6px', border: 'none',
                  background: siteHov ? '#3eff87' : T, color: '#0a0f1e', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
                  boxShadow: siteHov ? `0 0 20px ${T}80` : `0 4px 12px ${T}40`,
                  transform: siteHov ? 'scale(1.03)' : 'scale(1)', transition: 'all .22s ease',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                className="btn view-btn">
                🌐 View Site
              </button>
            </div>

            <div style={{ padding: '32px 28px' }}>
              <p style={{ margin: '0 0 32px', fontSize: '0.95rem', color: BODY, lineHeight: '1.7' }}>
                A corporate admin portal uses knowledge-based security questions for password recovery. Enter username{' '}
                {/* ── CHANGE: joseph code → green ── */}
                <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: T, fontSize: '0.88rem', border: `1px solid ${C3}` }}>joseph</code>,
                trigger "Forgot Password", exploit the predictable recovery logic, and capture the flag.
              </p>

              {/* Q1 */}
              <QuestionBlock num={1} solved={feedbackQ1.status === 'success'}
                label={<>According to the Definition section, what specific category of errors is Insecure Design contrasted with? <span style={{ color: MUTED, fontWeight: '400' }}>(3 words)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder='e.g., "structural …"' value={theoryInput}
                    onChange={e => setTheoryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkQ1(e)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1: v }))} />
                  <HintBtn onClick={() => setShowHintQ1(!showHintQ1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1: v }))} />
                </div>
                {showHintQ1 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Read the second paragraph of the Definition section carefully. The answer is a 3-word phrase starting with <em>"structural…"</em> — it describes coding/execution bugs that are distinct from design-level problems.</div>}
                {feedbackQ1.message && <div style={fbStyle(feedbackQ1.status)} className="slide-in">{feedbackQ1.message}</div>}
              </QuestionBlock>

              {/* Q2 */}
              <QuestionBlock num={2} solved={feedbackQ2.status === 'success'}
                label={<>What process should be integrated early in the SDLC to proactively catch logic flaws before coding begins? <span style={{ color: MUTED, fontWeight: '400' }}>(2 words)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder='e.g., "threat …"' value={strategyInput}
                    onChange={e => setStrategyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkQ2(e)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2: v }))} />
                  <HintBtn onClick={() => setShowHintQ2(!showHintQ2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2: v }))} />
                </div>
                {showHintQ2 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Look at the Mitigation Strategies section — the very first badge/row names this 2-word process. It pairs with methodologies like STRIDE and PASTA.</div>}
                {feedbackQ2.message && <div style={fbStyle(feedbackQ2.status)} className="slide-in">{feedbackQ2.message}</div>}
              </QuestionBlock>

              {/* Q3 — flag */}
              <QuestionBlock num={3} solved={feedbackQ3.status === 'success'}
                label={<>Open the target site, bypass the password recovery using <strong style={{ color: T }}>Question 3</strong> with the default staging answer. What is the flag?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="FLAG{…}" value={flagInput}
                    onChange={e => setFlagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkQ3(e)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn label="Submit Flag" onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3: v }))} />
                  <HintBtn onClick={() => setShowHintQ3(!showHintQ3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3: v }))} />
                </div>
                {showHintQ3 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> On the target site — enter username{' '}
                    {/* ── CHANGE: joseph code in hint → green ── */}
                    <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>joseph</code>, click "Forgot Password?", select <em>Question 3: What is your favorite color?</em>, and type{' '}
                    {/* ── CHANGE: blue code in hint → green ── */}
                    <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>blue</code> as the answer. Copy the generated temporary password, log in, and retrieve the flag shown on the dashboard.
                  </div>
                )}
                {feedbackQ3.message && <div style={fbStyle(feedbackQ3.status)} className="slide-in">{feedbackQ3.message}</div>}
              </QuestionBlock>

              {/* Q4 */}
              <QuestionBlock num={4} solved={feedbackQ4.status === 'success'}
                label="Based on the Attack Patterns section, which of these is an example of an Insecure Design flaw — rather than an implementation bug?">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', marginBottom: '14px' }}>
                  {scenarioOptions.map(opt => {
                    const sel = selectedScenario === opt.id;
                    const hov = hovScenario === opt.id;
                    return (
                      <div key={opt.id} onClick={() => setSelectedScenario(opt.id)}
                        onMouseEnter={() => setHovScenario(opt.id)} onMouseLeave={() => setHovScenario('')}
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
                {showHintQ4 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Ask yourself: which option cannot be fixed by patching code alone — it requires re-thinking the system's architecture or business logic?</div>}
                {feedbackQ4.message && <div style={fbStyle(feedbackQ4.status)} className="slide-in">{feedbackQ4.message}</div>}
              </QuestionBlock>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}