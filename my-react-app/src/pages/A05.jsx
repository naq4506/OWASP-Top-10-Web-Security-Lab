import React, { useState, useEffect, useRef } from 'react';

// ── A05 color palette — matches Home's a05 accent (#29b6f6)
const T      = '#29b6f6';   // sky-blue accent
const BG     = '#0a1120';
const C1     = '#0c1829';
const C2     = '#0f1f35';
const C3     = '#1a3050';
const MUTED  = '#4a6280';
const BODY   = '#8ba4c0';
const BRIGHT = '#e2eaf4';

const TOTAL_QUESTIONS = 5;

// ── Reusable utility hooks ─────────────────────────────────────────
function useCountUp(target, duration = 1200, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

// ── Sub-components ─────────────────────────────────────────────────
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
            : `linear-gradient(90deg,${T},#7dd3fc)`,
          borderRadius: '4px',
          transition: 'width 0.55s cubic-bezier(.16,1,.3,1)',
          boxShadow: pct > 0 ? `0 0 10px ${done ? '#22c55e' : T}90` : 'none',
        }} />
      </div>
      <span style={{
        fontSize: '0.75rem', fontFamily: "'JetBrains Mono',monospace", fontWeight: '700',
        color: done ? '#22c55e' : T, whiteSpace: 'nowrap', minWidth: '44px', textAlign: 'right',
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
        border: 'none', fontSize: '0.9rem', background: T, color: BG,
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

function Code({ children }) {
  return (
    <code style={{
      background: C2, padding: '2px 6px', borderRadius: '4px',
      fontFamily: 'monospace', color: '#f43f5e',
      fontSize: '0.88rem', border: `1px solid ${C3}`,
    }}>{children}</code>
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

// Q5 options
const Q5_OPTIONS = [
  { id: 'remove_debug',   label: 'Set FLASK_DEBUG=0 in production',  desc: 'Disable the Werkzeug interactive debugger before deploying to production servers.' },
  { id: 'password_input', label: 'Add a password prompt to /console', desc: 'Protect the debug console with a login form so only developers can access it.' },
  { id: 'rename_route',   label: 'Rename /console to a random path', desc: 'Obscure the URL so attackers cannot find the console through enumeration.' },
  { id: 'firewall_port',  label: 'Block port 5000 at the firewall',  desc: 'Use network-level controls to restrict who can reach the application server port.' },
];

// ── Main component ─────────────────────────────────────────────────
export default function A05({ onBack, onOpenLab }) {

  const [q1Input, setQ1Input] = useState('');
  const [q2Input, setQ2Input] = useState('');
  const [q3Input, setQ3Input] = useState('');
  const [q4Input, setQ4Input] = useState('');
  const [q5Sel,   setQ5Sel]   = useState('');

  const [fbQ1, setFbQ1] = useState({ message: '', status: '' });
  const [fbQ2, setFbQ2] = useState({ message: '', status: '' });
  const [fbQ3, setFbQ3] = useState({ message: '', status: '' });
  const [fbQ4, setFbQ4] = useState({ message: '', status: '' });
  const [fbQ5, setFbQ5] = useState({ message: '', status: '' });

  const [hintQ1, setHintQ1] = useState(false);
  const [hintQ2, setHintQ2] = useState(false);
  const [hintQ3, setHintQ3] = useState(false);
  const [hintQ4, setHintQ4] = useState(false);
  const [hintQ5, setHintQ5] = useState(false);

  const [complete, setComplete] = useState(false);
  const [backHov,  setBackHov]  = useState(false);
  const [labHov,   setLabHov]   = useState(false);
  const [hovV, setHovV] = useState({ q1: false, q2: false, q3: false, q4: false, q5: false });
  const [hovH, setHovH] = useState({ q1: false, q2: false, q3: false, q4: false, q5: false });
  const [hovQ5, setHovQ5] = useState('');

  const statuses = [fbQ1.status, fbQ2.status, fbQ3.status, fbQ4.status, fbQ5.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const goHome  = () => { if (onBack) onBack(); else window.location.href = '/'; };
  const openLab = () => { if (onOpenLab) onOpenLab(); };

  // ── Question checks ──────────────────────────────────────────────
  const checkQ1 = (e) => {
    e.preventDefault();
    const v = q1Input.trim().toLowerCase();
    if (!v) { setFbQ1({ message: '⚠️ Please enter your answer.', status: 'error' }); return; }
    if (v === 'defaults' || v === 'default') {
      setFbQ1({ message: '🎉 Correct! Security Misconfiguration most commonly stems from insecure default settings being left unchanged. "Ship secure by default" is the core principle.', status: 'success' });
    } else {
      setFbQ1({ message: "❌ Incorrect. Re-read Section 1. The most common root cause is one word — what is unchanged from the factory settings?", status: 'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    const v = q2Input.trim();
    if (!v) { setFbQ2({ message: '⚠️ Please enter the file name.', status: 'error' }); return; }
    if (v === 'passwords_old.txt') {
      setFbQ2({ message: '🎉 Correct! passwords_old.txt is listed openly in the /uploads/ directory — containing plaintext credentials for admin, root, and a service account.', status: 'success' });
    } else {
      setFbQ2({ message: '❌ Wrong file. Run ls /a05/uploads/ in the lab terminal. Which filename obviously contains credentials?', status: 'error' });
    }
  };

  const checkQ3 = (e) => {
    e.preventDefault();
    const v = q3Input.trim();
    if (!v) { setFbQ3({ message: '⚠️ Please enter the DB_PASSWORD value.', status: 'error' }); return; }
    if (v.toLowerCase() === 'sup3rsecretdb!2024') {
      setFbQ3({ message: '🎉 Correct! DB_PASSWORD=Sup3rSecretDB!2024 was sitting in a plaintext .env file accessible over the web — game over for that database.', status: 'success' });
    } else {
      setFbQ3({ message: '❌ Incorrect. Run cat /a05/uploads/.env in the lab terminal and copy the exact value after DB_PASSWORD=.', status: 'error' });
    }
  };

  const checkQ4 = (e) => {
    e.preventDefault();
    const v = q4Input.trim().toLowerCase();
    if (!v) { setFbQ4({ message: '⚠️ Please enter the header name.', status: 'error' }); return; }
    if (v.includes('x-frame-options') || v === 'x-frame-options') {
      setFbQ4({ message: '🎉 Correct! X-Frame-Options prevents clickjacking by forbidding other sites from embedding this page in an <iframe> — it was absent from the response.', status: 'success' });
    } else if (v.includes('content-security-policy') || v === 'csp') {
      setFbQ4({ message: '🎉 Also correct! Content-Security-Policy with frame-ancestors is the modern replacement for X-Frame-Options — and it was missing too.', status: 'success' });
    } else {
      setFbQ4({ message: '❌ Not quite. Run curl -I http://localhost:5000/a05/headers in the lab terminal. Which security header is absent that controls iframe embedding?', status: 'error' });
    }
  };

  const checkQ5 = (e) => {
    e.preventDefault();
    if (!q5Sel) { setFbQ5({ message: '⚠️ Please select an option.', status: 'error' }); return; }
    if (q5Sel === 'remove_debug') {
      setFbQ5({ message: '🎉 Correct! The fix is disabling debug mode entirely (FLASK_DEBUG=0 / debug=False) before deployment. Password-protecting or renaming the endpoint still leaves code-execution capability in production — unacceptable.', status: 'success' });
    } else {
      const msgs = {
        password_input: '❌ A password prompt is better than nothing, but the console itself — remote code execution — should never exist in production. Disable it, not gate it.',
        rename_route:   '❌ Security through obscurity. Scanners and wordlists find renamed paths quickly. The debug console must be disabled, not hidden.',
        firewall_port:  "❌ Network-layer controls help in depth, but they don't remove the vulnerability. If the firewall ever misconfigures, the console is instantly exploitable. Disable debug mode at the application layer.",
      };
      setFbQ5({ message: msgs[q5Sel] || '❌ Incorrect.', status: 'error' });
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: '100vh', color: BODY, boxSizing: 'border-box', position: 'relative' }}>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes popIn      { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        @keyframes float      { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(4deg)} }
        @keyframes backdropIn { from{opacity:0} to{opacity:1} }
        @keyframes glowPulse  { 0%,100%{box-shadow:0 0 6px ${T}40} 50%{box-shadow:0 0 20px ${T}80} }
        @keyframes shimmer    { 0%{left:-160%} 45%{left:160%} 100%{left:160%} }
        @keyframes borderFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
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
        .lab-btn::before {
          content:''; position:absolute; top:0; left:-160%; width:55%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
          transform:skewX(-22deg); animation:shimmer 3.8s infinite;
        }
        .cyber-grid {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image: linear-gradient(rgba(30,41,59,.25) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(30,41,59,.25) 1px,transparent 1px);
          background-size: 40px 40px;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
      `}</style>

      {/* Cyber grid */}
      <div className="cyber-grid" />

      {/* COMPLETION MODAL */}
      {complete && (
        <div onClick={() => setComplete(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,17,32,.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn .3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '16px', padding: '40px 36px', textAlign: 'center', maxWidth: '440px', width: '92%' }} className="pop-in">
            <div style={{ fontSize: '64px', marginBottom: '12px' }} className="float">🏆</div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: T, margin: '0 0 10px' }}>Challenge Complete!</h2>
            <p style={{ color: BODY, lineHeight: '1.6', margin: '0 0 18px' }}>
              You've mastered <strong style={{ color: BRIGHT }}>A05: Security Misconfiguration</strong> — the art of finding doors left open that should be locked.
            </p>
            <div style={{ background: C2, borderRadius: '8px', padding: '14px 18px', fontSize: '0.85rem', color: BODY, textAlign: 'left', lineHeight: '1.9', marginBottom: '20px' }}>
              <div>✓ Root cause of misconfiguration identified</div>
              <div>✓ Credential file found via directory listing</div>
              <div>✓ DB_PASSWORD extracted from exposed .env</div>
              <div>✓ Missing clickjacking header named correctly</div>
              <div>✓ Correct debug console remediation selected</div>
            </div>
            <button onClick={() => setComplete(false)} style={{ background: T, color: BG, border: 'none', borderRadius: '8px', padding: '11px 32px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }} className="btn">
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: `${BG}e8`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C3}`, padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={goHome}
          onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
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
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: T }}>A05:2021</span>
        </div>
      </nav>

      {/* HERO */}
      <div
        className="hero-shimmer"
        style={{ position: 'relative', overflow: 'hidden', padding: '72px 32px 60px', textAlign: 'center', background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${T}10 0%, transparent 70%)` }}
      >
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: .04, fontFamily: 'monospace', fontSize: '0.65rem', lineHeight: '1.4', color: T, userSelect: 'none', whiteSpace: 'pre-wrap', padding: '10px', pointerEvents: 'none' }}>
          {Array(12).fill('GET /uploads/ 200  Server: Apache/2.4.1  DB_PASSWORD=supersecret123  X-Frame-Options: MISSING  FLASK_DEBUG=1  ').join('\n')}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${T}15`, border: `1px solid ${T}35`, borderRadius: '20px', padding: '5px 16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '2px' }}>A05:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: '800', color: BRIGHT, margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Security<br /><span style={{ color: T }}>Misconfiguration</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: BODY, maxWidth: '560px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            You don't have to break the lock if it was never fastened. Default credentials, exposed debug consoles, directory listings, and missing headers are doors that attackers walk straight through.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', maxWidth: '720px', margin: '0 auto' }}>
            <StatCard value={90}  suffix="%" label="Of apps carry at least one misconfiguration" delay={0} />
            <StatCard value={5}   suffix="th" label="OWASP rank in 2021 (up from #6 in 2017)" delay={100} />
            <StatCard value={4}   suffix=""   label="Flaw categories exposed in this lab" delay={200} />
            <StatCard value={208} suffix=""   label="Known CVEs related to default configs in 2023" delay={300} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* SECTION 1 — Definition */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Definition" title="What is Security Misconfiguration?" id="definition" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <p style={{ margin: '0 0 14px', lineHeight: '1.75', fontSize: '0.95rem' }}>
                <strong style={{ color: BRIGHT }}>A05:2021 – Security Misconfiguration</strong> occurs when a system is deployed with insecure <strong style={{ color: T }}>defaults</strong>, unnecessary features enabled, missing hardening steps, or improperly configured permissions and headers.
              </p>
              <p style={{ margin: 0, lineHeight: '1.75', fontSize: '0.95rem' }}>
                Unlike injection or broken access control, this category requires no custom exploit code. Attackers simply probe for well-known paths, default credentials, or verbose error pages that hand them a map of the system.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Checklist: Common Warning Signs</div>
              {[
                'Are default credentials still in use on any service?',
                'Is directory listing enabled on the web server?',
                'Are .env, .git, or backup files web-accessible?',
                'Does the application run with FLASK_DEBUG=1 in production?',
                'Are security headers (CSP, X-Frame-Options) present on every response?',
              ].map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 4 ? '10px' : 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
                  <span style={{ color: T, fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: BODY }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2 — Core Concept */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Core Concept" title="How Misconfiguration Happens" id="concept" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>The "Secure by Default" Problem</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                Many frameworks and platforms ship with permissive settings designed for developer convenience — verbose error pages, open admin panels, directory listings, and debug consoles. The problem arises when these settings reach production unchanged.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Dev mode',   val: 'FLASK_DEBUG=1 — full stack traces, interactive console exposed', bad: true },
                  { label: 'No headers', val: 'X-Frame-Options missing — clickjacking possible on any page',     bad: true },
                  { label: 'Hardened',   val: 'FLASK_DEBUG=0, headers set, directory listing disabled',          bad: false },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: C2, borderRadius: '6px', border: `1px solid ${C3}` }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: r.bad ? '#ef4444' : T, flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: BODY, lineHeight: '1.5', textAlign: 'right' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Why Defaults Are Dangerous</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                Default configurations are publicly documented. Attackers know exactly which paths, credentials, and behaviors to probe — no reconnaissance needed. A single unchanged setting can expose the entire system.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                Every deployment must answer: <strong style={{ color: BRIGHT }}>does this service expose anything that wasn't explicitly enabled for production?</strong> No exceptions.
              </p>
            </div>
          </div>

          {/* Vulnerable vs Secure: Nginx headers */}
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1.5px' }}>🌐 Nginx · security headers</span>
              <div style={{ flex: 1, height: '1px', background: C3 }} />
              <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: MUTED }}>nginx.conf</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ef4444', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>❌ Vulnerable (no headers)</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #ef444430' }}>
                  <div><span style={{ color: MUTED }}># nginx.conf</span></div>
                  <div><span style={{ color: '#f43f5e' }}>server {'{'}</span></div>
                  <div><span style={{ color: MUTED }}>  # nothing added</span></div>
                  <div><span style={{ color: MUTED }}>  # headers: default only</span></div>
                  <div><span style={{ color: '#f43f5e' }}>{'}'}</span></div>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: MUTED, lineHeight: '1.6' }}>
                  No clickjacking protection, no MIME sniffing guard, server version leaked in every response.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#22c55e', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>✓ Hardened</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #22c55e30' }}>
                  <div><span style={{ color: MUTED }}># nginx.conf</span></div>
                  <div><span style={{ color: '#22c55e' }}>add_header</span> <span style={{ color: T }}>X-Frame-Options</span> <span style={{ color: '#fbbf24' }}>"DENY"</span><span style={{ color: BODY }}>;</span></div>
                  <div><span style={{ color: '#22c55e' }}>add_header</span> <span style={{ color: T }}>X-Content-Type-Options</span> <span style={{ color: '#fbbf24' }}>"nosniff"</span><span style={{ color: BODY }}>;</span></div>
                  <div><span style={{ color: '#22c55e' }}>add_header</span> <span style={{ color: T }}>Content-Security-Policy</span> <span style={{ color: '#fbbf24' }}>"default-src 'self'"</span><span style={{ color: BODY }}>;</span></div>
                  <div><span style={{ color: '#22c55e' }}>server_tokens</span> <span style={{ color: '#fbbf24' }}>off</span><span style={{ color: BODY }}>;</span></div>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: MUTED, lineHeight: '1.6' }}>
                  Clickjacking blocked, MIME sniffing prevented, server version hidden.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — Attack Patterns */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Attack Patterns" title="Four Misconfiguration Scenarios" id="scenarios" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '📂', title: 'Directory Listing',    text: "The web server displays all files in a folder instead of returning a 403. Attackers download backups, credentials, and source code without any auth." },
              { icon: '🔑', title: 'Exposed .env File',    text: "Configuration files containing secrets (API keys, DB passwords, session keys) are placed in the web root and served to any HTTP request." },
              { icon: '🛡️', title: 'Missing HTTP Headers', text: "Without X-Frame-Options, Content-Security-Policy, and X-Content-Type-Options, the app is open to clickjacking, XSS, and MIME-sniffing attacks." },
              { icon: '⚙️', title: 'Debug Console Open',  text: "Werkzeug's interactive Python console — or Django's debug page — left reachable in production gives attackers arbitrary remote code execution." },
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
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>Typical Misconfiguration Attack Chain</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { step: '01', label: 'Probe Defaults',  sub: 'Request /.env, /console, /uploads/' },
                { step: '02', label: 'Harvest Secrets', sub: 'Download credentials and API keys' },
                { step: '03', label: 'Exploit Headers', sub: 'Embed page in iframe for clickjacking' },
                { step: '04', label: 'Execute Code',    sub: 'Use debug console for RCE' },
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

        {/* SECTION 4 — Mitigation */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Defense" title="Mitigation Strategies" id="mitigation" />
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            <TimelineStep icon="🏗️" accent="#22c55e" title="Minimal, hardened installations"
              text="Disable or remove every feature, port, service, page, and account that is not required. A smaller attack surface means fewer misconfigurations can exist." />
            <TimelineStep icon="🔄" accent="#3b82f6" title="Automated, repeatable config pipeline"
              text="Manage infrastructure as code. Identical hardened environments should be reproducible from a single script — eliminating manual drift between staging and production." />
            <TimelineStep icon="📋" accent="#8b5cf6" title="Review and patch security headers"
              text="Run every response through securityheaders.com or OWASP's ZAP. Add X-Frame-Options, Content-Security-Policy, X-Content-Type-Options, and Referrer-Policy to all server configurations." />
            <TimelineStep icon="🔍" accent="#f97316" title="Continuous scanning and architecture review"
              text="Schedule quarterly configuration audits and integrate scanners (Trivy, Lynis, AWS Config) into the CI/CD pipeline so misconfigurations are caught before deployment." />
          </div>
        </section>

        {/* SECTION 5 — Case Studies */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World Misconfiguration Incidents" id="examples" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
            {[
              { year: '2017', org: 'Capital One', icon: '🏦', count: '100M',  desc: 'A misconfigured AWS WAF and over-permissive IAM role let an attacker query the metadata service, steal credentials, and exfiltrate 100M credit applications from S3.' },
              { year: '2019', org: 'Twitch',      icon: '🎮', count: '125GB', desc: '125 GB of source code, internal tooling, and streamer payouts were exposed. Root cause traced to a misconfigured internal git server accessible from the internet.' },
              { year: '2021', org: 'Facebook',    icon: '📘', count: '533M',  desc: 'A scraping endpoint left public with no rate limit or auth exposed phone numbers and personal data for 533M users — a textbook case of missing function-level access control via misconfiguration.' },
              { year: '2022', org: 'Toyota',      icon: '🚗', count: '296K',  desc: 'An API key accidentally published to a public GitHub repository granted access to customer location data for 296,019 users. The key had been exposed for nearly five years.' },
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

        {/* SECTION 6 — Challenge */}
        <section className="fade-up">
          <SectionHead label="Lab" title="Interactive Challenge: Find the Misconfigurations" id="challenge" />

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Lab header */}
            <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: BRIGHT }}>Security Lab · A05 — Security Misconfiguration</span>
              </div>
              <button
                onClick={openLab}
                onMouseEnter={() => setLabHov(true)}
                onMouseLeave={() => setLabHov(false)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  padding: '9px 22px', borderRadius: '6px', border: 'none',
                  background: labHov ? '#4ec5ff' : T,
                  color: BG, fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
                  boxShadow: labHov ? `0 0 20px ${T}80` : `0 4px 12px ${T}40`,
                  transform: labHov ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all .22s ease',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                className="btn lab-btn"
              >
                🖥️ Open Lab Terminal
              </button>
            </div>

            <div style={{ padding: '32px 28px' }}>
              <p style={{ margin: '0 0 32px', fontSize: '0.95rem', color: BODY, lineHeight: '1.7' }}>
                A misconfigured web server is running at{' '}
                <Code>localhost:5000/a05/</Code>.{' '}
                Use the <strong style={{ color: BRIGHT }}>Lab Terminal</strong> to probe its endpoints, then answer the questions below.
                Questions 2–4 require running commands in the terminal.
              </p>

              {/* Q1 — Theory */}
              <QuestionBlock num={1} solved={fbQ1.status === 'success'}
                label={<>According to Section 1, what is the single most common root cause of Security Misconfiguration? <span style={{ color: MUTED, fontWeight: '400' }}>(one word)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Enter the root cause…" value={q1Input}
                    onChange={e => setQ1Input(e.target.value)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1: v }))} />
                  <HintBtn onClick={() => setHintQ1(!hintQ1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1: v }))} />
                </div>
                {hintQ1 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Section 1 says it occurs when systems are deployed with insecure _____ settings left unchanged. One word, starts with 'D'.
                  </div>
                )}
                {fbQ1.message && <div style={fbStyle(fbQ1.status)} className="slide-in">{fbQ1.message}</div>}
              </QuestionBlock>

              {/* Q2 — ls */}
              <QuestionBlock num={2} solved={fbQ2.status === 'success'}
                label={
                  <>
                    Run <Code>ls /a05/uploads/</Code> in the lab terminal. Which file in the directory listing contains plaintext credentials?{' '}
                    <span style={{ color: MUTED, fontWeight: '400' }}>(its name makes it obvious)</span>
                  </>
                }>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="filename.txt" value={q2Input}
                    onChange={e => setQ2Input(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2: v }))} />
                  <HintBtn onClick={() => setHintQ2(!hintQ2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2: v }))} />
                </div>
                {hintQ2 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> One of the listed files has "passwords" in its filename. Enter the full filename including extension.
                  </div>
                )}
                {fbQ2.message && <div style={fbStyle(fbQ2.status)} className="slide-in">{fbQ2.message}</div>}
              </QuestionBlock>

              {/* Q3 — cat .env */}
              <QuestionBlock num={3} solved={fbQ3.status === 'success'}
                label={
                  <>
                    Run <Code>cat /a05/uploads/.env</Code> in the lab terminal. What is the value of <Code>DB_PASSWORD</Code>?
                  </>
                }>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Enter the DB_PASSWORD value…" value={q3Input}
                    onChange={e => setQ3Input(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3: v }))} />
                  <HintBtn onClick={() => setHintQ3(!hintQ3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3: v }))} />
                </div>
                {hintQ3 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> The .env file contains a line like DB_PASSWORD=&lt;value&gt;. Copy the value exactly as it appears.
                  </div>
                )}
                {fbQ3.message && <div style={fbStyle(fbQ3.status)} className="slide-in">{fbQ3.message}</div>}
              </QuestionBlock>

              {/* Q4 — curl -I headers */}
              <QuestionBlock num={4} solved={fbQ4.status === 'success'}
                label={
                  <>
                    Run <Code>curl -I http://localhost:5000/a05/headers</Code> in the lab terminal. What HTTP security header is{' '}
                    <strong style={{ color: T }}>missing</strong> that would prevent the page from being embedded in an {'<iframe>'}?
                  </>
                }>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Enter the missing header name…" value={q4Input}
                    onChange={e => setQ4Input(e.target.value)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ4} hov={hovV.q4} onHov={v => setHovV(p => ({ ...p, q4: v }))} />
                  <HintBtn onClick={() => setHintQ4(!hintQ4)} hov={hovH.q4} onHov={v => setHovH(p => ({ ...p, q4: v }))} />
                </div>
                {hintQ4 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> The header that controls framing starts with "X-Frame" — its absence is what enables clickjacking attacks.
                  </div>
                )}
                {fbQ4.message && <div style={fbStyle(fbQ4.status)} className="slide-in">{fbQ4.message}</div>}
              </QuestionBlock>

              {/* Q5 — choice: fix debug console */}
              <QuestionBlock num={5} solved={fbQ5.status === 'success'}
                label={<>Based on the <strong style={{ color: T }}>Mitigation Strategies</strong> section, what is the correct fix for a Werkzeug debug console exposed in production?</>}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', marginBottom: '14px' }}>
                  {Q5_OPTIONS.map(opt => {
                    const sel = q5Sel === opt.id;
                    const hov = hovQ5 === opt.id;
                    return (
                      <div key={opt.id}
                        onClick={() => setQ5Sel(opt.id)}
                        onMouseEnter={() => setHovQ5(opt.id)}
                        onMouseLeave={() => setHovQ5('')}
                        style={{
                          padding: '14px 16px', borderRadius: '8px', cursor: 'pointer',
                          border: sel ? `2px solid ${T}` : hov ? `2px solid ${T}60` : `2px solid ${C3}`,
                          background: sel ? `${T}10` : C2,
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
                  <VerifyBtn label="Submit Answer" onClick={checkQ5} hov={hovV.q5} onHov={v => setHovV(p => ({ ...p, q5: v }))} />
                  <HintBtn onClick={() => setHintQ5(!hintQ5)} hov={hovH.q5} onHov={v => setHovH(p => ({ ...p, q5: v }))} />
                </div>
                {hintQ5 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Ask yourself: should a debug tool exist in production at all, even behind a password? The mitigation section says "minimal, hardened installations" — apply that principle.
                  </div>
                )}
                {fbQ5.message && <div style={fbStyle(fbQ5.status)} className="slide-in">{fbQ5.message}</div>}
              </QuestionBlock>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}