import React, { useState, useEffect, useRef } from 'react';

const T      = '#00e5ff';
const BG     = '#0a0f1e';
const C1     = '#0f1729';
const C2     = '#192035';
const C3     = '#1e2a45';
const MUTED  = '#4a5878';
const BODY   = '#94a3b8';
const BRIGHT = '#e2e8f0';

const TOTAL_QUESTIONS = 5;

// ── Shared helpers ─────────────────────────────────────────────────

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
    <div ref={ref} style={{
      textAlign: 'center', padding: '28px 16px',
      background: C1, border: `1px solid ${C3}`,
      borderTop: `3px solid ${T}`, borderRadius: '10px',
      animationDelay: `${delay}ms`,
    }}>
      <div style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: '2.4rem', fontWeight: '800', color: T, lineHeight: 1, letterSpacing: '-1px' }}>
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
          position: 'absolute', top: 0, left: 0,
          height: '100%', width: `${pct}%`,
          background: done
            ? 'linear-gradient(90deg,#22c55e,#4ade80)'
            : `linear-gradient(90deg,${T},#33eeff)`,
          borderRadius: '4px',
          transition: 'width 0.55s cubic-bezier(.16,1,.3,1)',
          boxShadow: pct > 0 ? `0 0 10px ${done ? '#22c55e' : T}90` : 'none',
        }} />
      </div>
      <span style={{
        fontSize: '0.75rem',
        fontFamily: "'JetBrains Mono',monospace",
        fontWeight: '700',
        color: done ? '#22c55e' : T,
        whiteSpace: 'nowrap',
        minWidth: '44px',
        textAlign: 'right',
      }}>
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
    <button onClick={onClick}
      onMouseEnter={() => onHov(true)} onMouseLeave={() => onHov(false)}
      style={{
        padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer',
        border: 'none', fontSize: '0.9rem', background: T, color: '#0a0f1e',
        boxShadow: hov ? `0 0 16px ${T}70` : 'none',
        transform: hov ? 'scale(1.03)' : 'scale(1)',
        transition: 'all .2s',
      }}
      className="btn">{label}</button>
  );
}

function HintBtn({ onClick, hov, onHov }) {
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => onHov(true)} onMouseLeave={() => onHov(false)}
      style={{
        padding: '10px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer',
        fontSize: '0.9rem', background: C2,
        border: `1px solid ${hov ? '#eab308' : C3}`,
        color: hov ? '#eab308' : BODY,
        transition: 'all .2s',
      }}
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

// Q3 attack options
const Q3_OPTIONS = [
  { id: 'brute_force',   label: 'Brute Force Attack',               desc: 'Systematically trying many credentials from one source in rapid succession' },
  { id: 'sql_injection', label: 'SQL Injection (SQLi)',              desc: 'Injecting malicious SQL code into input fields to manipulate the database' },
  { id: 'xss',           label: 'Cross-Site Scripting (XSS)',        desc: 'Injecting client-side scripts into pages viewed by other users' },
  { id: 'csrf',          label: 'Cross-Site Request Forgery (CSRF)', desc: 'Tricking a user\'s browser into sending unintended authenticated requests' },
];

// ── Main component ─────────────────────────────────────────────────
export default function A09({ onBack }) {

  const [theoryInput,   setTheoryInput]   = useState('');
  const [ipInput,       setIpInput]       = useState('');
  const [userInput,     setUserInput]     = useState('');
  const [passInput,     setPassInput]     = useState('');
  const [selectedQ3,    setSelectedQ3]    = useState('');

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
  const [hovV, setHovV] = useState({ q1:false, q2:false, q3:false, q4:false, q5:false });
  const [hovH, setHovH] = useState({ q1:false, q2:false, q3:false, q4:false, q5:false });
  const [hovQ3Option, setHovQ3Option] = useState('');

  const statuses       = [feedbackQ1.status, feedbackQ2.status, feedbackQ3.status, feedbackQ4.status, feedbackQ5.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const goHome   = () => { if (onBack) onBack(); else window.location.href = '/'; };
  const openSite = () => window.open(`${window.location.origin}${window.location.pathname}?mode=a09_logs`, '_blank');

  // ── Answer checkers ──────────────────────────────────────────────

  const checkQ1 = (e) => {
    e.preventDefault();
    const v = theoryInput.trim().toLowerCase();
    if (!v) { setFeedbackQ1({ message: '⚠️ Please enter your answer before verifying.', status: 'error' }); return; }
    if (v === 'monitoring') {
      setFeedbackQ1({ message: '🎉 Correct! Logging & Monitoring are inseparable — logs without monitoring leave you with evidence nobody reads, while monitoring without logs has nothing to analyse.', status: 'success' });
    } else {
      setFeedbackQ1({ message: '❌ Incorrect. Look at the page title and Section 1\'s first sentence — the missing word is the paired term that follows "Logging &".', status: 'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    const v = ipInput.trim();
    if (!v) { setFeedbackQ2({ message: '⚠️ Please enter an IP address.', status: 'error' }); return; }
    if (v === '151.80.31.167') {
      setFeedbackQ2({ message: '🎉 Correct! 151.80.31.167 generated six consecutive 401 Unauthorized responses in under 90 seconds — a textbook brute-force signature.', status: 'success' });
    } else {
      setFeedbackQ2({ message: '❌ Wrong IP. Open the Log Viewer, filter by "401", and look for a single IP that appears multiple times within seconds of each other.', status: 'error' });
    }
  };

  const checkQ3 = (e) => {
    e.preventDefault();
    if (!selectedQ3) { setFeedbackQ3({ message: '⚠️ Please select an attack type first.', status: 'error' }); return; }
    if (selectedQ3 === 'brute_force') {
      setFeedbackQ3({ message: '🎉 Correct! Rapid sequential login attempts against multiple usernames from one IP, all within seconds, is the signature of a credential brute-force attack.', status: 'success' });
    } else {
      const msgs = {
        sql_injection: '❌ SQL Injection would target the database query, not generate authentication failures. Look at the pattern — repeated logins from one IP.',
        xss:           '❌ XSS targets other users\' browsers by injecting scripts. These logs show server-side 401 responses, not script injection.',
        csrf:          '❌ CSRF tricks a victim into making a request. Here the attacker is directly making requests themselves — and failing repeatedly.',
      };
      setFeedbackQ3({ message: msgs[selectedQ3] || '❌ Incorrect. Re-read the Common Scenarios section.', status: 'error' });
    }
  };

  const checkQ4 = (e) => {
    e.preventDefault();
    const v = userInput.trim().toLowerCase();
    if (!v) { setFeedbackQ4({ message: '⚠️ Please enter the username.', status: 'error' }); return; }
    if (v === 'sarah') {
      setFeedbackQ4({ message: '🎉 Correct! The attacker tried multiple usernames before focusing on "sarah" — and eventually succeeded with her account.', status: 'success' });
    } else {
      setFeedbackQ4({ message: '❌ Incorrect. Find the 200 OK response from IP 151.80.31.167 in the Log Viewer — the username is in the request URL after "user=".', status: 'error' });
    }
  };

  const checkQ5 = (e) => {
    e.preventDefault();
    const v = passInput.trim().toLowerCase();
    if (!v) { setFeedbackQ5({ message: '⚠️ Please enter the password.', status: 'error' }); return; }
    if (v === 'iloveyou') {
      setFeedbackQ5({ message: '🎉 Correct! "iloveyou" is the password that returned 200 OK — a common dictionary word that should have been blocked by any rate-limiting or lockout policy.', status: 'success' });
    } else {
      setFeedbackQ5({ message: '❌ Wrong password. Click on the 200 OK row from IP 151.80.31.167 in the Log Viewer — the password is visible after "pass=" in the request URL.', status: 'error' });
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
        @keyframes shimmerCyan{ 0%{left:-160%} 45%{left:160%} 100%{left:160%} }
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
          background-size: 200% 100%;
          animation: borderFlow 6s linear infinite;
        }
        .view-btn::before {
          content:''; position:absolute; top:0; left:-160%; width:55%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
          transform:skewX(-22deg); animation:shimmerCyan 3.8s infinite;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
      `}</style>

      {/* ── COMPLETION MODAL ── */}
      {complete && (
        <div onClick={() => setComplete(false)} style={{ position:'fixed', inset:0, background:'rgba(10,15,30,.9)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, animation:'backdropIn .3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C1, border:`1px solid ${C3}`, borderTop:`3px solid ${T}`, borderRadius:'16px', padding:'40px 36px', textAlign:'center', maxWidth:'440px', width:'92%' }} className="pop-in">
            <div style={{ fontSize:'64px', marginBottom:'12px' }} className="float">🏆</div>
            <h2 style={{ fontSize:'1.9rem', fontWeight:'800', color:T, margin:'0 0 10px' }}>Challenge Complete!</h2>
            <p style={{ color:BODY, lineHeight:'1.6', margin:'0 0 18px' }}>
              You've mastered <strong style={{ color:BRIGHT }}>A09: Security Logging & Monitoring Failures</strong> — understanding how invisible attacks exploit the absence of detection.
            </p>
            <div style={{ background:C2, borderRadius:'8px', padding:'14px 18px', fontSize:'0.85rem', color:BODY, textAlign:'left', lineHeight:'1.9', marginBottom:'20px' }}>
              <div>✓ Core concept paired term identified</div>
              <div>✓ Attacker IP correctly isolated</div>
              <div>✓ Attack vector classified as brute force</div>
              <div>✓ Compromised account username found</div>
              <div>✓ Cracked password recovered from log</div>
            </div>
            <button onClick={() => setComplete(false)} style={{ background:T, color:'#0a0f1e', border:'none', borderRadius:'8px', padding:'11px 32px', fontWeight:'700', fontSize:'0.95rem', cursor:'pointer' }} className="btn">
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:`${BG}e8`, backdropFilter:'blur(12px)', borderBottom:`1px solid ${C3}`, padding:'12px 32px', display:'flex', alignItems:'center', gap:'16px' }}>
        <button
          onClick={goHome}
          onMouseEnter={() => setBackHov(true)}
          onMouseLeave={() => setBackHov(false)}
          style={{ padding:'7px 16px', borderRadius:'6px', fontSize:'0.88rem', fontWeight:'600', cursor:'pointer', border:`1px solid ${backHov ? T : C3}`, color:backHov ? T : BODY, background:'transparent', transform:backHov ? 'translateX(-3px)' : 'none', transition:'all .2s ease', flexShrink:0 }}
          className="btn"
        >← Back</button>
        <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <ProgressBar completed={completedCount} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:T, boxShadow:`0 0 8px ${T}`, animation:'glowPulse 2s infinite' }} />
          <span style={{ fontSize:'0.8rem', color:MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>OWASP Top 10</span>
          <span style={{ color:C3 }}>·</span>
          <span style={{ fontSize:'0.8rem', fontWeight:'700', color:T }}>A09:2021</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position:'relative', overflow:'hidden', padding:'72px 32px 60px', textAlign:'center', background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${T}12 0%, transparent 70%)` }} className="hero-shimmer">
        <div aria-hidden style={{ position:'absolute', inset:0, overflow:'hidden', opacity:.04, fontFamily:'monospace', fontSize:'0.7rem', lineHeight:'1.4', color:T, userSelect:'none', whiteSpace:'pre-wrap', padding:'10px', pointerEvents:'none' }}>
          {Array(12).fill('401 Unauthorized  49.99.13.16  /login  401 Unauthorized  151.80.31.167  /login  200 OK  SIEM  log_alert  brute_force_detected  ').join('\n')}
        </div>
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:`${T}18`, border:`1px solid ${T}40`, borderRadius:'20px', padding:'5px 16px', marginBottom:'24px' }}>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:T, textTransform:'uppercase', letterSpacing:'2px' }}>A09:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.4rem)', fontWeight:'800', color:BRIGHT, margin:'0 0 16px', lineHeight:'1.15', letterSpacing:'-1px' }}>
            Security Logging &<br />
            <span style={{ color:T }}>Monitoring Failures</span>
          </h1>
          <p style={{ fontSize:'1.1rem', color:BODY, maxWidth:'560px', margin:'0 auto 40px', lineHeight:'1.7' }}>
            When systems cannot see themselves being attacked, adversaries operate freely — breaches go undetected for months while log files sit unread and alerts never fire.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'16px', maxWidth:'720px', margin:'0 auto' }}>
            <StatCard value={9}   suffix="th"  label="Most critical OWASP risk — elevated from #10 in 2017" delay={0} />
            <StatCard value={277} suffix=" d"  label="Average time to identify a breach without logging (IBM 2023)" delay={100} />
            <StatCard value={5}   suffix=""    label="Analyst tasks to complete in this lab" delay={200} />
            <StatCard value={3}   suffix=""    label="Core failure modes: no logs, no SIEM, no alerts" delay={300} />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth:'960px', margin:'0 auto', padding:'48px 24px 80px' }}>

        {/* SECTION 1: Definition */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Definition" title="What are Security Logging & Monitoring Failures?" id="definition" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
            <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
              <p style={{ margin:'0 0 14px', lineHeight:'1.75', fontSize:'0.95rem' }}>
                <strong style={{ color:BRIGHT }}>A09:2021 – Security Logging & Monitoring Failures</strong> covers the inability to detect, alert on, and respond to active security incidents. Without logs, you have no evidence. Without monitoring, you have no awareness. Without both, attackers operate with impunity.
              </p>
              <p style={{ margin:0, lineHeight:'1.75', fontSize:'0.95rem' }}>
                Previously named <em style={{ color:'#cbd5e1' }}>"Insufficient Logging & Monitoring"</em> in OWASP 2017, this category has been broadened to encompass all <strong style={{ color:T }}>Detection</strong> and <strong style={{ color:T }}>Response</strong> gaps — from missing log entries through to absent incident response plans.
              </p>
            </div>
            <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:'700', color:T, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'16px' }}>Key Failure Signals</div>
              {[
                'Are login failures, access denials, and input validation errors logged?',
                'Are logs only stored locally — on the same host that could be compromised?',
                'Is there a SIEM or centralised log aggregation in place?',
                'Are alert thresholds configured for anomalous patterns (e.g. rapid 401s)?',
                'Is there a tested incident response and escalation plan?',
              ].map((q, i) => (
                <div key={i} style={{ display:'flex', gap:'10px', marginBottom: i < 4 ? '10px' : 0, fontSize:'0.88rem', lineHeight:'1.5' }}>
                  <span style={{ color:T, fontWeight:'700', flexShrink:0 }}>{i + 1}.</span>
                  <span style={{ color:BODY }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Core Concept */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Core Concept" title="The Detection Gap" id="concept" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'24px' }}>
            <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:'1.05rem', fontWeight:'700', color:BRIGHT }}>Logging vs Monitoring</h3>
              <p style={{ margin:'0 0 14px', fontSize:'0.9rem', lineHeight:'1.7' }}>
                These two controls are often treated as one — but they serve distinct functions that must both be implemented correctly.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { label:'Logging',    val:'"What happened?" — records events: who, what, when, from where', ok:true },
                  { label:'Monitoring', val:'"Is something wrong now?" — analyses logs in real-time for threat patterns', ok:true },
                  { label:'Failure',    val:'Logs exist but nobody reads them — or patterns fire but alerts are suppressed', ok:false },
                ].map(r => (
                  <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', padding:'12px 14px', background:C2, borderRadius:'6px', border:`1px solid ${C3}` }}>
                    <span style={{ fontSize:'0.82rem', fontWeight:'700', color: r.ok === false ? '#ef4444' : T, flexShrink:0 }}>{r.label}</span>
                    <span style={{ fontFamily:'monospace', fontSize:'0.78rem', color:BODY, lineHeight:'1.5', textAlign:'right' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:'1.05rem', fontWeight:'700', color:BRIGHT }}>Why Attackers Love Silent Systems</h3>
              <p style={{ margin:'0 0 14px', fontSize:'0.9rem', lineHeight:'1.7' }}>
                The average breach takes <strong style={{ color:BRIGHT }}>277 days</strong> to identify when logging is inadequate. Attackers know this — and they specifically target environments without proper detection.
              </p>
              <p style={{ margin:0, fontSize:'0.9rem', lineHeight:'1.7' }}>
                A brute-force attack against a system with no monitoring runs at full speed indefinitely. With proper alerting, the same attack triggers a lockout and alert within seconds of the first anomalous pattern.
              </p>
            </div>
          </div>
          <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
            <h3 style={{ margin:'0 0 20px', fontSize:'1.05rem', fontWeight:'700', color:BRIGHT }}>Vulnerable vs Secure Log Architecture</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:'700', color:'#ef4444', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px' }}>❌ Vulnerable (local logs, no alerts)</div>
                <div style={{ background:C2, borderRadius:'8px', padding:'16px', fontFamily:'monospace', fontSize:'0.78rem', lineHeight:'2', border:'1px solid #ef444430' }}>
                  <div><span style={{ color:MUTED }}># Logs saved on the same host</span></div>
                  <div><span style={{ color:'#f43f5e' }}>tail</span> <span style={{ color:T }}>/var/log/auth.log</span></div>
                  <div><span style={{ color:MUTED }}># No SIEM forwarding</span></div>
                  <div><span style={{ color:MUTED }}># No alerting configured</span></div>
                  <div><span style={{ color:'#f43f5e' }}>alert_threshold</span><span style={{ color:BODY }}> = None</span></div>
                </div>
                <p style={{ margin:'10px 0 0', fontSize:'0.82rem', color:MUTED, lineHeight:'1.6' }}>
                  Attacker deletes local logs after breach. No SIEM means no record survives. No alert means nobody noticed.
                </p>
              </div>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:'700', color:'#22c55e', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px' }}>✓ Secure (centralised SIEM + alerting)</div>
                <div style={{ background:C2, borderRadius:'8px', padding:'16px', fontFamily:'monospace', fontSize:'0.78rem', lineHeight:'2', border:'1px solid #22c55e30' }}>
                  <div><span style={{ color:MUTED }}># Forward to immutable SIEM</span></div>
                  <div><span style={{ color:'#22c55e' }}>rsyslog</span> <span style={{ color:T }}>→ siem.internal</span></div>
                  <div><span style={{ color:MUTED }}># Alert on rapid 401 bursts</span></div>
                  <div><span style={{ color:'#22c55e' }}>if</span> <span style={{ color:BODY }}>(401s &gt; 5 in 60s) {'{'}</span></div>
                  <div><span style={{ color:BODY }}>  alert(</span><span style={{ color:T }}>"Brute force"</span><span style={{ color:BODY }}>)</span></div>
                </div>
                <p style={{ margin:'10px 0 0', fontSize:'0.82rem', color:MUTED, lineHeight:'1.6' }}>
                  Logs are immutable and off-host. Alert fires within seconds of the attack pattern. SOC team is notified immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Attack Patterns */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Attack Patterns" title="Common Scenarios" id="scenarios" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'16px', marginBottom:'24px' }}>
            {[
              { icon:'🔑', title:'Credential Guessing Undetected',   text:'Thousands of failed login attempts from one IP occur continuously. Without alerting, the system never blocks the attacker or notifies administrators — the attack runs until it succeeds.' },
              { icon:'🗑️', title:'Log Tampering After Breach',        text:'Logs stored locally on the compromised host are wiped or altered by the attacker to erase evidence of entry, lateral movement, and data exfiltration.' },
              { icon:'🔕', title:'Silent Alert Thresholds',           text:'Thresholds exist but are set too high, or alerts fire into a queue nobody monitors. Active breaches unfold in real time while the security team remains unaware.' },
            ].map(s => (
              <div key={s.title} style={{ background:C1, border:`1px solid ${C3}`, borderTop:`3px solid ${T}`, borderRadius:'10px', padding:'22px' }}>
                <div style={{ fontSize:'1.6rem', marginBottom:'12px' }}>{s.icon}</div>
                <div style={{ fontWeight:'700', color:BRIGHT, fontSize:'0.95rem', marginBottom:'10px' }}>{s.title}</div>
                <p style={{ margin:0, fontSize:'0.85rem', color:BODY, lineHeight:'1.65' }}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Attack chain */}
          <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
            <div style={{ fontSize:'0.72rem', fontWeight:'700', color:MUTED, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'20px' }}>Typical Undetected Brute-Force Attack Chain</div>
            <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap' }}>
              {[
                { step:'01', label:'Initial Probe',      sub:'Attacker tests login with common usernames' },
                { step:'02', label:'Rapid Enumeration',  sub:'Hundreds of passwords tried per minute' },
                { step:'03', label:'Successful Login',   sub:'Weak password found — 200 OK returned' },
                { step:'04', label:'Persistence',        sub:'Account hijacked; logs deleted locally' },
              ].map((s, i, arr) => (
                <React.Fragment key={s.step}>
                  <div style={{ flex:'1 1 160px', textAlign:'center', padding:'12px 8px' }}>
                    <div style={{ fontFamily:'monospace', fontSize:'0.68rem', color:T, fontWeight:'700', marginBottom:'6px' }}>{s.step}</div>
                    <div style={{ fontWeight:'700', color:BRIGHT, fontSize:'0.9rem', marginBottom:'4px' }}>{s.label}</div>
                    <div style={{ fontSize:'0.75rem', color:MUTED }}>{s.sub}</div>
                  </div>
                  {i < arr.length - 1 && <div style={{ color:C3, fontSize:'1.4rem', flexShrink:0, padding:'0 4px' }}>→</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: Mitigation */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Defense" title="Mitigation Strategies" id="mitigation" />
          <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', overflow:'hidden' }}>
            <TimelineStep icon="📝" accent="#22c55e" title="Contextual logging with sufficient user context"
              text="Log all login failures, access control denials, and server-side input validation errors. Each entry must include timestamp, source IP, user identifier, and endpoint — enough context to reconstruct an attacker's actions." />
            <TimelineStep icon="🛡️" accent="#3b82f6" title="Centralised SIEM — off-host, immutable log storage"
              text="Forward logs to a Security Information & Event Management system independent of the application host. Attackers who breach a server should never be able to reach or delete the log record of their entry." />
            <TimelineStep icon="🚨" accent="#8b5cf6" title="Real-time alerting on anomalous patterns"
              text="Configure thresholds to auto-trigger on patterns like five or more consecutive 401 Unauthorized responses from the same IP within 60 seconds. Pair with automated IP block and SOC notification." />
            <TimelineStep icon="🧱" accent="#f97316" title="WAF and rate-limiting as active defence"
              text="Adopt Web Application Firewalls, account lockout policies, and per-IP rate limiting to stop automated credential stuffing before brute force can succeed — defence in depth alongside detection." />
          </div>
        </section>

        {/* SECTION 5: Case Studies */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World Logging Failures" id="examples" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'16px' }}>
            {[
              { year:'2013', org:'Target',    icon:'🛒', stat:'40M card records', desc:'Intrusion alerts from the security tool fired correctly — but were suppressed or ignored. The monitoring was there; the human response was not. Attackers operated for weeks undetected.' },
              { year:'2017', org:'Equifax',   icon:'🏦', stat:'147M records',     desc:'An expired TLS certificate caused network monitoring tools to stop inspecting encrypted traffic for months. The breach ran for 76 days before discovery — logging existed, but a blind spot killed it.' },
              { year:'2020', org:'SolarWinds',icon:'☀️', stat:'18,000 orgs',      desc:'Attackers modified build artefacts and operated inside victim networks for months. Custom malware deliberately kept activity within noise thresholds — purpose-built to evade behavioural monitoring.' },
              { year:'2021', org:'Colonial Pipeline', icon:'⛽', stat:'$4.4M ransom', desc:'Attackers used a legacy VPN account with no MFA and no monitoring. The first sign of the breach was a ransom note — no alert, no log anomaly, no detection until it was too late.' },
            ].map(c => (
              <div key={c.org} style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'10px', padding:'22px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ fontSize:'1.3rem' }}>{c.icon}</span>
                    <span style={{ fontWeight:'800', color:BRIGHT, fontSize:'1rem' }}>{c.org}</span>
                  </div>
                  <span style={{ fontSize:'0.72rem', color:MUTED, background:C2, padding:'3px 8px', borderRadius:'4px' }}>{c.year}</span>
                </div>
                <div style={{ fontFamily:'monospace', fontSize:'1rem', fontWeight:'800', color:T, marginBottom:'10px' }}>{c.stat}</div>
                <p style={{ margin:0, fontSize:'0.85rem', color:BODY, lineHeight:'1.65' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Challenge */}
        <section className="fade-up">
          <SectionHead label="Lab" title="Interactive Challenge: Log Analysis" id="challenge" />

          <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', overflow:'hidden' }}>
            {/* Lab header */}
            <div style={{ background:C2, borderBottom:`1px solid ${C3}`, padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px #22c55e' }} />
                <span style={{ fontSize:'0.8rem', fontWeight:'700', color:BRIGHT }}>Security Lab · A09 — Security Logging & Monitoring Failures</span>
              </div>
              <button
                onClick={openSite}
                onMouseEnter={() => setSiteHov(true)}
                onMouseLeave={() => setSiteHov(false)}
                style={{
                  position:'relative', overflow:'hidden',
                  padding:'9px 22px', borderRadius:'6px', border:'none',
                  background: siteHov ? '#33eaff' : T,
                  color:'#0a0f1e', fontWeight:'700', fontSize:'0.88rem', cursor:'pointer',
                  boxShadow: siteHov ? `0 0 20px ${T}80` : `0 4px 12px ${T}40`,
                  transform: siteHov ? 'scale(1.03)' : 'scale(1)',
                  transition:'all .22s ease',
                  display:'flex', alignItems:'center', gap:'8px',
                }}
                className="btn view-btn"
              >
                🖥️ View Log Viewer
              </button>
            </div>

            <div style={{ padding:'32px 28px' }}>
              <p style={{ margin:'0 0 32px', fontSize:'0.95rem', color:BODY, lineHeight:'1.7' }}>
                You are a Cyber Security Analyst reviewing authentication logs for <strong style={{ color:BRIGHT }}>SecureBank</strong>. Open the Log Viewer above, study the traffic patterns for the session on{' '}
                <code style={{ background:C2, padding:'2px 6px', borderRadius:'4px', fontFamily:'monospace', color:T, fontSize:'0.88rem', border:`1px solid ${C3}` }}>2025-01-15</code>,
                {' '}and answer all five analyst questions below.
              </p>

              {/* Q1 */}
              <QuestionBlock num={1} solved={feedbackQ1.status === 'success'}
                label={<>OWASP A09 states that without effective <em>Security Logging & ____________</em>, active cyber attacks can occur completely undetected. What is the missing word? <span style={{ color:MUTED, fontWeight:'400' }}>(one word)</span></>}>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <input type="text" placeholder='e.g., "Detection", "Alerting"…' value={theoryInput}
                    onChange={e => setTheoryInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkQ1(e)}
                    style={inputStyle} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1:v }))} />
                  <HintBtn onClick={() => setShowHintQ1(!showHintQ1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1:v }))} />
                </div>
                {showHintQ1 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color:'#eab308' }}>Hint:</strong> Look at the page heading and Section 1's title — it names two paired terms. The first is "Logging", the second starts with "M".
                  </div>
                )}
                {feedbackQ1.message && <div style={fbStyle(feedbackQ1.status)} className="slide-in">{feedbackQ1.message}</div>}
              </QuestionBlock>

              {/* Q2 */}
              <QuestionBlock num={2} solved={feedbackQ2.status === 'success'}
                label={<>Open the Log Viewer and examine the authentication entries. What is the <strong style={{ color:T }}>IP address</strong> of the host executing the suspicious login attempts?</>}>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <input type="text" placeholder="e.g., 49.99.13.16" value={ipInput}
                    onChange={e => setIpInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkQ2(e)}
                    style={{ ...inputStyle, fontFamily:'monospace' }} />
                  <VerifyBtn onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2:v }))} />
                  <HintBtn onClick={() => setShowHintQ2(!showHintQ2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2:v }))} />
                </div>
                {showHintQ2 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color:'#eab308' }}>Hint:</strong> Filter the Log Viewer by "401" — look for one IP address that appears five or more times within a 90-second window.
                  </div>
                )}
                {feedbackQ2.message && <div style={fbStyle(feedbackQ2.status)} className="slide-in">{feedbackQ2.message}</div>}
              </QuestionBlock>

              {/* Q3 — card radio */}
              <QuestionBlock num={3} solved={feedbackQ3.status === 'success'}
                label="What type of attack does this log pattern represent?">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'12px', marginBottom:'14px' }}>
                  {Q3_OPTIONS.map(opt => {
                    const sel = selectedQ3 === opt.id;
                    const hov = hovQ3Option === opt.id;
                    return (
                      <div key={opt.id}
                        onClick={() => setSelectedQ3(opt.id)}
                        onMouseEnter={() => setHovQ3Option(opt.id)}
                        onMouseLeave={() => setHovQ3Option('')}
                        style={{
                          padding:'14px 16px', borderRadius:'8px', cursor:'pointer',
                          border: sel ? `2px solid ${T}` : hov ? `2px solid ${T}60` : `2px solid ${C3}`,
                          background: sel ? `${T}12` : C2,
                          transition:'all .2s ease',
                        }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                          <div style={{
                            width:'15px', height:'15px', borderRadius:'50%',
                            border:`2px solid ${sel ? T : '#475569'}`,
                            background: sel ? T : 'transparent',
                            flexShrink:0, transition:'all .2s',
                          }} />
                          <span style={{ fontWeight:'700', fontSize:'0.88rem', color: sel ? T : BRIGHT }}>{opt.label}</span>
                        </div>
                        <p style={{ margin:0, fontSize:'0.78rem', color:MUTED, lineHeight:'1.4' }}>{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <VerifyBtn label="Submit Answer" onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3:v }))} />
                  <HintBtn onClick={() => setShowHintQ3(!showHintQ3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3:v }))} />
                </div>
                {showHintQ3 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color:'#eab308' }}>Hint:</strong> Look at the Common Scenarios section — specifically "Credential Guessing Undetected". The pattern is one IP trying multiple usernames and passwords in rapid sequence.
                  </div>
                )}
                {feedbackQ3.message && <div style={fbStyle(feedbackQ3.status)} className="slide-in">{feedbackQ3.message}</div>}
              </QuestionBlock>

              {/* Q4 */}
              <QuestionBlock num={4} solved={feedbackQ4.status === 'success'}
                label={<>Looks like they were able to gain access! What is the <strong style={{ color:T }}>username</strong> of the compromised account?</>}>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <input type="text" placeholder="e.g., admin, root…" value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkQ4(e)}
                    style={{ ...inputStyle, fontFamily:'monospace' }} />
                  <VerifyBtn onClick={checkQ4} hov={hovV.q4} onHov={v => setHovV(p => ({ ...p, q4:v }))} />
                  <HintBtn onClick={() => setShowHintQ4(!showHintQ4)} hov={hovH.q4} onHov={v => setHovH(p => ({ ...p, q4:v }))} />
                </div>
                {showHintQ4 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color:'#eab308' }}>Hint:</strong> Find the <code style={{ background:C2, padding:'1px 4px', borderRadius:'3px', color:T }}>200 OK</code> response from the attacker's IP (151.80.31.167). Click the row to open Log Details — the username is after <code style={{ background:C2, padding:'1px 4px', borderRadius:'3px', color:T }}>user=</code> in the Request URL.
                  </div>
                )}
                {feedbackQ4.message && <div style={fbStyle(feedbackQ4.status)} className="slide-in">{feedbackQ4.message}</div>}
              </QuestionBlock>

              {/* Q5 */}
              <QuestionBlock num={5} solved={feedbackQ5.status === 'success'}
                label={<>The password that granted access is visible in the log entry's Request URL. What is it? <span style={{ color:MUTED, fontWeight:'400' }}>(check the 200 OK row from the attacker's IP)</span></>}>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <input type="text" placeholder="Enter the password…" value={passInput}
                    onChange={e => setPassInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkQ5(e)}
                    style={{ ...inputStyle, fontFamily:'monospace' }} />
                  <VerifyBtn onClick={checkQ5} hov={hovV.q5} onHov={v => setHovV(p => ({ ...p, q5:v }))} />
                  <HintBtn onClick={() => setShowHintQ5(!showHintQ5)} hov={hovH.q5} onHov={v => setHovH(p => ({ ...p, q5:v }))} />
                </div>
                {showHintQ5 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color:'#eab308' }}>Hint:</strong> In the Log Viewer, click the row showing <code style={{ background:C2, padding:'1px 4px', borderRadius:'3px', color:'#22c55e' }}>200 OK</code> from IP 151.80.31.167. The Request URL reads <code style={{ background:C2, padding:'1px 4px', borderRadius:'3px', color:T }}>/login?user=sarah&pass=___</code> — the answer is after "pass=". It's a common English phrase.
                  </div>
                )}
                {feedbackQ5.message && <div style={fbStyle(feedbackQ5.status)} className="slide-in">{feedbackQ5.message}</div>}
              </QuestionBlock>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}