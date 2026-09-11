import React, { useState, useEffect, useRef } from 'react';

const T      = '#ffca28';
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
            : `linear-gradient(90deg,${T},#ffe57a)`,
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

const Q2_OPTIONS = [
  { id: 'parameterized', label: 'Parameterized queries / Prepared statements', desc: 'Separate SQL code from user data at the database driver level — the engine never interprets input as syntax' },
  { id: 'escape_input',  label: 'Escape special characters manually',          desc: 'Replace dangerous characters like \' and -- in user input before building the query string' },
  { id: 'client_valid',  label: 'Client-side input validation (JavaScript)',   desc: 'Check and reject suspicious input in the browser before the form is submitted' },
  { id: 'waf_only',      label: 'Deploy a Web Application Firewall only',      desc: 'Route all traffic through a WAF that blocks requests containing SQL keywords' },
];

export default function A03({ onBack }) {

  const [theoryInput,    setTheoryInput]    = useState('');
  const [selectedQ2,     setSelectedQ2]     = useState('');
  const [productInput,   setProductInput]   = useState('');
  const [adminBalInput,  setAdminBalInput]  = useState('');
  const [aliceEmailInput,setAliceEmailInput]= useState('');

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
  const [hovQ2Option, setHovQ2Option] = useState('');

  const statuses       = [feedbackQ1.status, feedbackQ2.status, feedbackQ3.status, feedbackQ4.status, feedbackQ5.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const openSite = () =>
    window.open(`${window.location.origin}${window.location.pathname}?mode=a03_target`, '_blank');
  const goHome = () => { if (onBack) onBack(); else window.location.href = '/'; };

  // ── Answer checkers ──────────────────────────────────────────────────────

  const checkQ1 = (e) => {
    e.preventDefault();
    const v = theoryInput.trim().toLowerCase();
    if (!v) { setFeedbackQ1({ message: '⚠️ Please enter your answer before verifying.', status: 'error' }); return; }
    if (v === 'interpreter') {
      setFeedbackQ1({ message: '🎉 Correct! SQL Injection exploits the interpreter — the database engine that parses and executes SQL commands — by smuggling malicious syntax through untrusted user input.', status: 'success' });
    } else {
      setFeedbackQ1({ message: '❌ Incorrect. Re-read the first paragraph of the Definition section. What component "receives" and "executes" the injected commands?', status: 'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    if (!selectedQ2) { setFeedbackQ2({ message: '⚠️ Please select an option before verifying.', status: 'error' }); return; }
    if (selectedQ2 === 'parameterized') {
      setFeedbackQ2({ message: '🎉 Correct! Parameterized queries (prepared statements) are the gold standard — they guarantee that user input is always treated as data, never as SQL syntax, regardless of its content.', status: 'success' });
    } else {
      const msgs = {
        escape_input:  '❌ Manual escaping is brittle and error-prone. A missed edge-case or encoding mismatch leaves the door open. Parameterized queries are always the safer, more reliable solution.',
        client_valid:  '❌ Client-side validation can be bypassed trivially with DevTools or by sending a raw HTTP request. Authorization and sanitization must live on the server.',
        waf_only:      '❌ A WAF is a useful defense-in-depth layer, but it can be bypassed with obfuscation techniques. It is not a substitute for fixing the root cause in the application code.',
      };
      setFeedbackQ2({ message: msgs[selectedQ2], status: 'error' });
    }
  };

  // Q3 — hidden products via search injection
  const checkQ3 = (e) => {
    e.preventDefault();
    const v = productInput.trim().toLowerCase();
    if (!v) { setFeedbackQ3({ message: '⚠️ Please enter a product name.', status: 'error' }); return; }
    const accepted = [
      'calculus 1 2 3 exam secrets',
      'calculus 1 2 3 exam secrets (hust edition)',
      'hust pentest toolkits v2',
      'hust pentest toolkits v2 (internal)',
    ];
    if (accepted.some(a => v.includes('calculus') || v.includes('hust pentest'))) {
      setFeedbackQ3({
        message: "🎉 Correct! Injecting ' OR '1'='1'-- into the search box collapses all WHERE conditions to TRUE, exposing every product row including hidden ones such as \"Calculus 1 2 3 Exam Secrets\" and \"HUST Pentest Toolkits v2\" that are normally invisible to the public.",
        status: 'success',
      });
    } else {
      setFeedbackQ3({
        message: "❌ Incorrect. Open the target site, type ' OR '1'='1'-- into the search box and press Search. Look for products tagged 🔒 HIDDEN in the results.",
        status: 'error',
      });
    }
  };

  // Q4 — admin balance after login SQLi
  const checkQ4 = (e) => {
    e.preventDefault();
    const v = adminBalInput.trim().replace(/,/g, '').replace(/\$/g, '');
    if (!v) { setFeedbackQ4({ message: '⚠️ Please enter the balance amount.', status: 'error' }); return; }
    if (v === '5000' || v === '5000.00' || v === '5,000') {
      setFeedbackQ4({
        message: "🎉 Correct! Injecting ' OR '1'='1'-- into the login username field causes the query to return all user rows. The first row is the admin account, and the JSON response exposes the account_balance field — $5,000.",
        status: 'success',
      });
    } else {
      setFeedbackQ4({
        message: "❌ Incorrect. On the target site go to Login, enter ' OR '1'='1'-- as the username (any password). Read the JSON response carefully — find the account_balance field of the first returned user (admin).",
        status: 'error',
      });
    }
  };

  // Q5 — alice email via UNION injection
  const checkQ5 = (e) => {
    e.preventDefault();
    const v = aliceEmailInput.trim().toLowerCase();
    if (!v) { setFeedbackQ5({ message: '⚠️ Please enter the email address.', status: 'error' }); return; }
    if (v === 'alice.security@hust.edu.vn') {
      setFeedbackQ5({
        message: "🎉 Correct! By injecting ' UNION SELECT id, username, password, account_balance, role, is_active FROM users-- into the search box, the query appends the entire users table to the product results. Alice's row reveals her email: alice.security@hust.edu.vn.",
        status: 'success',
      });
    } else {
      setFeedbackQ5({
        message: "❌ Incorrect. In the search box on the target site, enter exactly: ' UNION SELECT id, username, password, account_balance, role, is_active FROM users-- and press Search. Find the row for alice and read her email.",
        status: 'error',
      });
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
        @keyframes shimmerYellow{ 0%{left:-160%} 45%{left:160%} 100%{left:160%} }
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
          background-size: 200% 100%;
          animation: borderFlow 6s linear infinite;
        }
        .view-btn::before {
          content:''; position:absolute; top:0; left:-160%; width:55%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
          transform:skewX(-22deg); animation:shimmerYellow 3.8s infinite;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
      `}</style>

      {/* COMPLETION MODAL */}
      {complete && (
        <div onClick={() => setComplete(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn .3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '16px', padding: '40px 36px', textAlign: 'center', maxWidth: '440px', width: '92%' }} className="pop-in">
            <div style={{ fontSize: '64px', marginBottom: '12px' }} className="float">💉</div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: T, margin: '0 0 10px' }}>Injection Mastered!</h2>
            <p style={{ color: BODY, lineHeight: '1.6', margin: '0 0 18px' }}>
              You've completed <strong style={{ color: BRIGHT }}>A03: Injection</strong> — understanding how SQL injection exploits unsanitised input to extract hidden data, bypass authentication, and expose every record in a database.
            </p>
            <div style={{ background: C2, borderRadius: '8px', padding: '14px 18px', fontSize: '0.85rem', color: BODY, textAlign: 'left', lineHeight: '1.9', marginBottom: '20px' }}>
              <div>✓ Injection root cause (interpreter) identified</div>
              <div>✓ Correct prevention strategy selected</div>
              <div>✓ Hidden products exposed via boolean bypass on search</div>
              <div>✓ Admin account balance leaked from login endpoint</div>
              <div>✓ Alice's email extracted via UNION SELECT injection</div>
            </div>
            <button onClick={() => setComplete(false)} style={{ background: T, color: '#0a0f1e', border: 'none', borderRadius: '8px', padding: '11px 32px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }} className="btn">
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: `${BG}e8`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C3}`, padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={goHome}
          onMouseEnter={() => setBackHov(true)}
          onMouseLeave={() => setBackHov(false)}
          style={{ padding: '7px 16px', borderRadius: '6px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', border: `1px solid ${backHov ? T : C3}`, color: backHov ? T : BODY, background: 'transparent', transform: backHov ? 'translateX(-3px)' : 'none', transition: 'all .2s ease', flexShrink: 0 }}
          className="btn"
        >← Back</button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ProgressBar completed={completedCount} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T, boxShadow: `0 0 8px ${T}`, animation: 'glowPulse 2s infinite' }} />
          <span style={{ fontSize: '0.8rem', color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' }}>OWASP Top 10</span>
          <span style={{ color: C3 }}>·</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: T }}>A03:2021</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 32px 60px', textAlign: 'center', background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${T}10 0%, transparent 70%)` }} className="hero-shimmer">
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: .04, fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: '1.4', color: T, userSelect: 'none', whiteSpace: 'pre-wrap', padding: '10px', pointerEvents: 'none' }}>
          {Array(12).fill("' OR '1'='1'--   ' UNION SELECT * FROM users--   DROP TABLE products--   ' OR 1=1--   admin'--   ").join('\n')}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${T}18`, border: `1px solid ${T}40`, borderRadius: '20px', padding: '5px 16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '2px' }}>A03:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: '800', color: BRIGHT, margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Injection<br />
            <span style={{ color: T }}>SQL · NoSQL · Command</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: BODY, maxWidth: '560px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            When user-supplied data is sent directly to an interpreter without validation, attackers can rewrite the query itself — reading any row, bypassing authentication, or destroying the entire database.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', maxWidth: '720px', margin: '0 auto' }}>
            <StatCard value={3}   suffix="rd"  label="Most critical OWASP risk since 2017" delay={0} />
            <StatCard value={274} suffix="+"   label="CWEs mapped to injection vulnerabilities" delay={100} />
            <StatCard value={19}  suffix="s"   label="Average time to exploit an unpatched SQLi endpoint" delay={200} />
            <StatCard value={100} suffix="%"   label="Preventable with parameterized queries" delay={300} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* SECTION 1: Definition */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Definition" title="What is Injection?" id="definition" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <p style={{ margin: '0 0 14px', lineHeight: '1.75', fontSize: '0.95rem' }}>
                <strong style={{ color: BRIGHT }}>A03:2021 – Injection</strong> occurs when an application sends untrusted data to an <strong style={{ color: T }}>interpreter</strong> — a database engine, OS shell, XML parser, or LDAP directory — as part of a command or query. The interpreter cannot distinguish intended commands from attacker-supplied payload, so it executes both.
              </p>
              <p style={{ margin: 0, lineHeight: '1.75', fontSize: '0.95rem' }}>
                SQL Injection is the most prevalent form: an attacker injects SQL syntax into a search box, login form, or URL parameter, rewriting the query the server runs. The result can be full data extraction, authentication bypass, or destructive data manipulation.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>How to Spot a Vulnerable App</div>
              {[
                'Does the app build queries by concatenating user input directly?',
                'Are error messages exposing SQL syntax or table names to the user?',
                'Can special characters like \' or -- change the query structure?',
                'Does the app use an ORM but still fall back to raw queries?',
                'Are input values reflected unencoded in database-driven responses?',
              ].map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 4 ? '10px' : 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
                  <span style={{ color: T, fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: BODY }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Core Concept */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Core Concept" title="How SQL Injection Works" id="concept" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>The Anatomy of an Injection</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                A vulnerable query concatenates raw user input into SQL. A single quote <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', color: T, fontSize: '0.85rem' }}>'</code> closes the string literal, and anything after it becomes raw SQL the database executes.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Intended input',    val: 'laptop',                         ok: true  },
                  { label: 'Injected input',    val: "' OR '1'='1'--",               ok: false },
                  { label: 'Resulting query',   val: "WHERE name='' OR '1'='1'--'",  ok: false },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '10px 14px', background: C2, borderRadius: '6px', border: `1px solid ${C3}` }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: r.ok ? T : '#ef4444', flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: BODY, lineHeight: '1.5', textAlign: 'right' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Types of SQL Injection</h3>
              {[
                { type: 'Boolean-based',  desc: 'Force the app to return different responses for true/false conditions — used to enumerate data row by row.' },
                { type: 'UNION-based',    desc: 'Append a second SELECT to the original query, pulling data from any table into the visible response.' },
                { type: 'Error-based',    desc: 'Trigger verbose database errors that reveal schema, version, and data in the error message itself.' },
                { type: 'Blind / Time',   desc: 'No output is returned — instead, inject SLEEP() or BENCHMARK() to infer data from response delays.' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', background: C2, borderRadius: '6px', border: `1px solid ${C3}`, marginBottom: i < 3 ? '8px' : 0 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: T, flexShrink: 0, minWidth: '90px' }}>{r.type}</span>
                  <span style={{ fontSize: '0.8rem', color: BODY, lineHeight: '1.5' }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Vulnerable vs Secure Code</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ef4444', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>❌ Vulnerable (string concatenation)</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #ef444430' }}>
                  <div><span style={{ color: MUTED }}>// Raw input injected into SQL</span></div>
                  <div><span style={{ color: '#f43f5e' }}>query</span> <span style={{ color: BODY }}>= "SELECT * FROM products"</span></div>
                  <div><span style={{ color: BODY }}>  + " WHERE name = '" + </span><span style={{ color: '#fbbf24' }}>userInput</span> + <span style={{ color: BODY }}>"'"</span></div>
                  <div><span style={{ color: '#f43f5e' }}>db.execute</span><span style={{ color: BODY }}>(query)</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>
                  Input closes the string, then appends arbitrary SQL. The engine executes it all.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#22c55e', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>✓ Secure (parameterized query)</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #22c55e30' }}>
                  <div><span style={{ color: MUTED }}>// Placeholder keeps data separate</span></div>
                  <div><span style={{ color: '#22c55e' }}>query</span> <span style={{ color: BODY }}>= "SELECT * FROM products"</span></div>
                  <div><span style={{ color: BODY }}>  + " WHERE name = </span><span style={{ color: T }}>?"</span></div>
                  <div><span style={{ color: '#22c55e' }}>db.execute</span><span style={{ color: BODY }}>(query, [</span><span style={{ color: '#fbbf24' }}>userInput</span><span style={{ color: BODY }}>])</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>
                  The driver escapes the value before binding. No amount of SQL syntax in the input changes the query structure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Attack Patterns */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Attack Patterns" title="Common Injection Scenarios" id="scenarios" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '🔓', title: 'Authentication Bypass',   text: "Injecting ' OR '1'='1'-- into a login form causes the WHERE clause to always evaluate true — the database returns the first user row (usually the admin) regardless of the password supplied." },
              { icon: '📦', title: 'Data Extraction (UNION)', text: "UNION SELECT appends a second query whose results are returned alongside the original. Attackers map column counts, then pull passwords, emails, and balances from any table." },
              { icon: '🗂️', title: 'Hidden Record Exposure',  text: "Search filters built with raw SQL can be bypassed with boolean conditions like OR 1=1, collapsing all WHERE restrictions and returning rows the application never intended to display." },
            ].map(s => (
              <div key={s.title} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '10px', padding: '22px' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{s.icon}</div>
                <div style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.95rem', marginBottom: '10px' }}>{s.title}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: BODY, lineHeight: '1.65' }}>{s.text}</p>
              </div>
            ))}
          </div>

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>Typical SQLi Attack Chain on a Shopping Site</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { step: '01', label: 'Probe',       sub: "Inject ' into search — observe SQL error" },
                { step: '02', label: 'Boolean Bypass', sub: "OR '1'='1'-- reveals all hidden rows" },
                { step: '03', label: 'Auth Bypass',  sub: "Same payload on login leaks first user row" },
                { step: '04', label: 'UNION Inject', sub: 'Append SELECT from users — steal email & data' },
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
            <TimelineStep icon="🔒" accent="#22c55e" title="Use parameterized queries / prepared statements everywhere"
              text="Never build SQL by concatenating strings. Use placeholders and pass user data as bound parameters — the database driver ensures data is never interpreted as SQL syntax." />
            <TimelineStep icon="🏗️" accent="#3b82f6" title="Use an ORM with caution — avoid raw query fallbacks"
              text="ORMs like Hibernate, SQLAlchemy, or Prisma generate safe queries by default, but many offer an 'escape hatch' to raw SQL. Treat any raw() or exec() call as a red flag requiring a code review." />
            <TimelineStep icon="🚫" accent="#8b5cf6" title="Validate and allow-list input on the server"
              text="Reject input that does not match the expected format (e.g. integer product IDs, alphabetic category names). Never deny-list specific characters — attackers can encode or obfuscate around blocklists." />
            <TimelineStep icon="🔐" accent="#f97316" title="Apply least-privilege to the database account"
              text="The application's DB user should only have SELECT, INSERT, and UPDATE on the tables it needs — never DROP, CREATE, or access to the information_schema. Even a successful injection is limited by the account's privileges." />
          </div>
        </section>

        {/* SECTION 5: Case Studies */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World Injection Breaches" id="examples" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
            {[
              { year: '2009', org: 'Heartland Payment', icon: '💳', count: '130M cards',     desc: 'SQL injection on a web form gave attackers access to the payment processing network. Malware was installed and card data was siphoned for months before detection.' },
              { year: '2012', org: 'LinkedIn',           icon: '💼', count: '6.5M hashes',   desc: 'An injection vulnerability exposed unsalted SHA-1 password hashes. Over 100M plaintext passwords were eventually cracked and published years later.' },
              { year: '2015', org: 'TalkTalk',           icon: '📞', count: '157K records',  desc: 'A teenager used SQL injection to extract customer names, email addresses, and partial payment details. The UK regulator fined TalkTalk £400,000 for basic security failures.' },
              { year: '2021', org: 'Twitch',             icon: '🎮', count: '125GB data',    desc: 'Source code, creator payouts, and internal tool data were leaked. Post-incident analysis attributed portions of the breach to unsanitised query parameters in internal APIs.' },
            ].map(c => (
              <div key={c.org} style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '10px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
                    <span style={{ fontWeight: '800', color: BRIGHT, fontSize: '1rem' }}>{c.org}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: MUTED, background: C2, padding: '3px 8px', borderRadius: '4px' }}>{c.year}</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '800', color: T, marginBottom: '10px' }}>{c.count}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: BODY, lineHeight: '1.65' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Lab */}
        <section className="fade-up">
          <SectionHead label="Lab" title="Interactive Challenge: SQL Injection on SecShop" id="challenge" />

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Lab header */}
            <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: BRIGHT }}>Security Lab · A03 — SQL Injection · SecShop</span>
              </div>
              <button
                onClick={openSite}
                onMouseEnter={() => setSiteHov(true)}
                onMouseLeave={() => setSiteHov(false)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  padding: '9px 22px', borderRadius: '6px', border: 'none',
                  background: siteHov ? '#ffe57a' : T,
                  color: '#0a0f1e', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
                  boxShadow: siteHov ? `0 0 20px ${T}80` : `0 4px 12px ${T}40`,
                  transform: siteHov ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all .22s ease',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                className="btn view-btn"
              >
                🌐 Open SecShop
              </button>
            </div>

            <div style={{ padding: '32px 28px' }}>
              <p style={{ margin: '0 0 32px', fontSize: '0.95rem', color: BODY, lineHeight: '1.7' }}>
                <strong style={{ color: BRIGHT }}>SecShop</strong> is an intentionally vulnerable e-commerce site that builds all SQL queries via string concatenation. Open the target site and exploit its search box and login form to answer the five questions below.
              </p>

              {/* ── Q1 — theory ── */}
              <QuestionBlock num={1} solved={feedbackQ1.status === 'success'}
                label={<>According to the Definition section, what component receives and executes user-supplied input as commands in an Injection attack? <span style={{ color: MUTED, fontWeight: '400' }}>(one word)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Enter the one-word answer…" value={theoryInput}
                    onChange={e => setTheoryInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkQ1(e)}
                    style={inputStyle} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1: v }))} />
                  <HintBtn onClick={() => setShowHintQ1(!showHintQ1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1: v }))} />
                </div>
                {showHintQ1 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Re-read the first sentence of the Definition section. The answer is a single noun that describes the engine (database, OS shell, LDAP directory…) that <em>receives</em> untrusted data as part of a command or query.
                  </div>
                )}
                {feedbackQ1.message && <div style={fbStyle(feedbackQ1.status)} className="slide-in">{feedbackQ1.message}</div>}
              </QuestionBlock>

              {/* ── Q2 — radio ── */}
              <QuestionBlock num={2} solved={feedbackQ2.status === 'success'}
                label={<>Based on the <strong style={{ color: T }}>Mitigation Strategies</strong> section, which approach most reliably prevents SQL Injection?</>}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', marginBottom: '14px' }}>
                  {Q2_OPTIONS.map(opt => {
                    const sel = selectedQ2 === opt.id;
                    const hov = hovQ2Option === opt.id;
                    return (
                      <div key={opt.id}
                        onClick={() => setSelectedQ2(opt.id)}
                        onMouseEnter={() => setHovQ2Option(opt.id)}
                        onMouseLeave={() => setHovQ2Option('')}
                        style={{
                          padding: '14px 16px', borderRadius: '8px', cursor: 'pointer',
                          border: sel ? `2px solid ${T}` : hov ? `2px solid ${T}60` : `2px solid ${C3}`,
                          background: sel ? `${T}12` : C2,
                          transition: 'all .2s ease',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{
                            width: '15px', height: '15px', borderRadius: '50%',
                            border: `2px solid ${sel ? T : '#475569'}`,
                            background: sel ? T : 'transparent',
                            flexShrink: 0, transition: 'all .2s',
                          }} />
                          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: sel ? T : BRIGHT }}>{opt.label}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: MUTED, lineHeight: '1.4' }}>{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <VerifyBtn label="Submit Answer" onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2: v }))} />
                  <HintBtn onClick={() => setShowHintQ2(!showHintQ2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2: v }))} />
                </div>
                {showHintQ2 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> The first mitigation step names the technique. Ask yourself: which option works at the database driver level and makes it <em>structurally impossible</em> for input to be interpreted as SQL — regardless of what the input contains?
                  </div>
                )}
                {feedbackQ2.message && <div style={fbStyle(feedbackQ2.status)} className="slide-in">{feedbackQ2.message}</div>}
              </QuestionBlock>

              {/* ── Q3 — hidden products via search ── */}
              <QuestionBlock num={3} solved={feedbackQ3.status === 'success'}
                label={
                  <>
                    On SecShop, enter{' '}
                    <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', color: T, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      ' OR '1'='1'--
                    </code>{' '}
                    into the <strong style={{ color: T }}>search box</strong> to reveal every product, including hidden ones. Enter the name of <strong style={{ color: T }}>either one</strong> of the hidden products you find.
                  </>
                }>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Enter the hidden product name…" value={productInput}
                    onChange={e => setProductInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkQ3(e)}
                    style={inputStyle} />
                  <VerifyBtn onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3: v }))} />
                  <HintBtn onClick={() => setShowHintQ3(!showHintQ3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3: v }))} />
                </div>
                {showHintQ3 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Open SecShop, type{' '}
                    <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>
                      ' OR '1'='1'--
                    </code>{' '}
                    into the Search box and press Search. Hidden products will appear tagged with a{' '}
                    <span style={{ color: '#fca5a5', fontWeight: '700' }}>🔒 HIDDEN</span> badge.
                    Enter the name of one of them above.
                  </div>
                )}
                {feedbackQ3.message && <div style={fbStyle(feedbackQ3.status)} className="slide-in">{feedbackQ3.message}</div>}
              </QuestionBlock>

              {/* ── Q4 — admin balance from login SQLi ── */}
              <QuestionBlock num={4} solved={feedbackQ4.status === 'success'}
                label={
                  <>
                    On SecShop's <strong style={{ color: T }}>login page</strong>, enter{' '}
                    <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', color: T, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      ' OR '1'='1'--
                    </code>{' '}
                    into the username field to bypass authentication. What is the{' '}
                    <strong style={{ color: T }}>admin</strong>'s <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', color: T, fontFamily: 'monospace', fontSize: '0.85rem' }}>account_balance</code>?
                  </>
                }>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="e.g. 5000" value={adminBalInput}
                    onChange={e => setAdminBalInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkQ4(e)}
                    style={{ ...inputStyle, fontFamily: 'monospace', color: T }} />
                  <VerifyBtn onClick={checkQ4} hov={hovV.q4} onHov={v => setHovV(p => ({ ...p, q4: v }))} />
                  <HintBtn onClick={() => setShowHintQ4(!showHintQ4)} hov={hovH.q4} onHov={v => setHovH(p => ({ ...p, q4: v }))} />
                </div>
                {showHintQ4 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Open SecShop → click the 👤 icon → Sign In. Enter{' '}
                    <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>
                      ' OR '1'='1'--
                    </code>{' '}
                    into the Username field (leave the password blank, or enter anything). The server returns JSON — find the{' '}
                    <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T, fontFamily: 'monospace' }}>account_balance</code> field of the first returned user (admin).
                  </div>
                )}
                {feedbackQ4.message && <div style={fbStyle(feedbackQ4.status)} className="slide-in">{feedbackQ4.message}</div>}
              </QuestionBlock>

              {/* ── Q5 — alice email via UNION injection ── */}
              <QuestionBlock num={5} solved={feedbackQ5.status === 'success'}
                label={
                  <>
                    Use the following{' '}
                    <strong style={{ color: T }}>UNION SELECT</strong> injection in SecShop's search box:{' '}
                    <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', color: T, fontSize: '0.82rem', fontFamily: 'monospace', display: 'inline-block', marginTop: '4px', wordBreak: 'break-all' }}>
                      ' UNION SELECT id, username, password, account_balance, role, is_active FROM users--
                    </code>
                    <br />
                    <span style={{ fontWeight: '400', color: MUTED, fontSize: '0.88rem' }}>
                      What email address does the result expose for <strong style={{ color: T }}>alice</strong>?
                    </span>
                  </>
                }>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="alice.???@???.???" value={aliceEmailInput}
                    onChange={e => setAliceEmailInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkQ5(e)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn label="Submit Email" onClick={checkQ5} hov={hovV.q5} onHov={v => setHovV(p => ({ ...p, q5: v }))} />
                  <HintBtn onClick={() => setShowHintQ5(!showHintQ5)} hov={hovH.q5} onHov={v => setHovH(p => ({ ...p, q5: v }))} />
                </div>
                {showHintQ5 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Copy the payload above and paste it into SecShop's Search box, then press Search. The results will include rows from the{' '}
                    <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T, fontFamily: 'monospace' }}>users</code> table.
                    Find the row named <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T, fontFamily: 'monospace' }}>alice</code> — the description field will reveal her email.
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