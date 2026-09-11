import React, { useState, useEffect, useRef } from 'react';

// ── A06 color palette — matches Home's a06 accent (#b388ff)
const T      = '#b388ff';   // violet accent
const BG     = '#0a0f1e';
const C1     = '#0f1729';
const C2     = '#192035';
const C3     = '#1e2a45';
const MUTED  = '#4a5878';
const BODY   = '#94a3b8';
const BRIGHT = '#e2e8f0';

const TOTAL_QUESTIONS = 4;

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
            : `linear-gradient(90deg,${T},#d8c4ff)`,
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

// Q4 options — correct fix for the vulnerable/outdated component usage
const Q4_OPTIONS = [
  { id: 'safe_load',    label: 'Replace yaml.load() with yaml.safe_load()', desc: 'Use the constructor that only builds plain Python types (dict, list, str, int…) and refuses object tags.' },
  { id: 'block_string', label: 'Block any upload containing the word "python"', desc: 'Reject files whose raw text contains the substring "python" before parsing.' },
  { id: 'rename_field', label: 'Rename the upload field to yaml_file_safe', desc: 'Change the form field name so attackers cannot guess where to send payloads.' },
  { id: 'minify_yaml',  label: 'Minify the YAML before parsing', desc: 'Strip whitespace and comments from the YAML document before passing it to the loader.' },
];

export default function A06({ onBack, onOpenLab }) {

  const [q1Input, setQ1Input] = useState('');
  const [q2Input, setQ2Input] = useState('');
  const [q3Input, setQ3Input] = useState('');
  const [q4Sel,   setQ4Sel]   = useState('');

  const [fbQ1, setFbQ1] = useState({ message: '', status: '' });
  const [fbQ2, setFbQ2] = useState({ message: '', status: '' });
  const [fbQ3, setFbQ3] = useState({ message: '', status: '' });
  const [fbQ4, setFbQ4] = useState({ message: '', status: '' });

  const [hintQ1, setHintQ1] = useState(false);
  const [hintQ2, setHintQ2] = useState(false);
  const [hintQ3, setHintQ3] = useState(false);
  const [hintQ4, setHintQ4] = useState(false);

  const [complete, setComplete] = useState(false);
  const [backHov,  setBackHov]  = useState(false);
  const [siteHov,  setSiteHov]  = useState(false);
  const [hovV, setHovV] = useState({ q1: false, q2: false, q3: false, q4: false });
  const [hovH, setHovH] = useState({ q1: false, q2: false, q3: false, q4: false });
  const [hovQ4, setHovQ4] = useState('');

  const statuses = [fbQ1.status, fbQ2.status, fbQ3.status, fbQ4.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const goHome = () => { if (onBack) onBack(); else window.location.href = '/'; };
  const openSite = () => {
    if (onOpenLab) { onOpenLab(); return; }
    window.open(`${window.location.origin}${window.location.pathname}?mode=a06_lab`, '_blank');
  };

  // ── Question checks ──────────────────────────────────────────────
  const checkQ1 = (e) => {
    e.preventDefault();
    const v = q1Input.trim().toLowerCase();
    if (!v) { setFbQ1({ message: '⚠️ Please enter your answer.', status: 'error' }); return; }
    if (v === 'safe_load' || v === 'yaml.safe_load' || v === 'yaml.safe_load()') {
      setFbQ1({ message: '🎉 Correct! yaml.safe_load() only constructs plain Python built-in types and rejects any !!python/object tag outright.', status: 'success' });
    } else {
      setFbQ1({ message: '❌ Incorrect. Re-read Section 1 — which specific PyYAML function is described as the safe alternative?', status: 'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    const v = q2Input.trim();
    if (!v) { setFbQ2({ message: '⚠️ Please enter the tag name.', status: 'error' }); return; }
    const normalized = v.replace(/\s+/g, '').toLowerCase();
    if (normalized.includes('python/object/apply')) {
      setFbQ2({ message: '🎉 Correct! !!python/object/apply:<callable> tells an unsafe loader to call any importable Python function — including subprocess.check_output — with attacker-supplied arguments.', status: 'success' });
    } else {
      setFbQ2({ message: '❌ Not quite. Go to the lab, open the converter, and look at the YAML tag that begins with "!!python/object/apply:".', status: 'error' });
    }
  };

  const checkQ3 = (e) => {
    e.preventDefault();
    const v = q3Input.trim().toLowerCase();
    if (!v) { setFbQ3({ message: '⚠️ Please enter the command name.', status: 'error' }); return; }
    if (v === 'whoami') {
      setFbQ3({ message: '🎉 Correct! The lab\'s simulated converter shows "whoami" → svc_yamlparser, illustrating what an unsafe loader would have revealed about the server\'s execution context.', status: 'success' });
    } else {
      setFbQ3({ message: '❌ Incorrect. Submit the example payload in the lab\'s YAML converter and look at the "simulated_command" field returned in the warning block.', status: 'error' });
    }
  };

  const checkQ4 = (e) => {
    e.preventDefault();
    if (!q4Sel) { setFbQ4({ message: '⚠️ Please select an option.', status: 'error' }); return; }
    if (q4Sel === 'safe_load') {
      setFbQ4({ message: '🎉 Correct! Swapping the unsafe loader for yaml.safe_load() (or upgrading to a PyYAML version where safe_load is enforced) removes the object-construction capability entirely — the proper fix for a vulnerable/outdated component.', status: 'success' });
    } else {
      const msgs = {
        block_string: '❌ Keyword blocklisting is trivially bypassed (e.g. via !!python/object/new: instead of /apply:, or by avoiding the literal word). The loader itself must be safe.',
        rename_field: '❌ Renaming a form field does nothing to the parser. An attacker who finds the new field name can send the exact same payload.',
        minify_yaml:  '❌ Whitespace and comments are irrelevant to whether the loader constructs Python objects. Minifying does not change which constructor is used.',
      };
      setFbQ4({ message: msgs[q4Sel] || '❌ Incorrect. Re-read the Mitigation Strategies section.', status: 'error' });
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: '100vh', color: BODY, boxSizing: 'border-box' }}>

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
        .view-btn::before {
          content:''; position:absolute; top:0; left:-160%; width:55%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
          transform:skewX(-22deg); animation:shimmer 3.8s infinite;
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
              You've mastered <strong style={{ color: BRIGHT }}>A06: Vulnerable & Outdated Components</strong> — seeing how an unsafe deserialization function inside a trusted library can hand attackers code execution.
            </p>
            <div style={{ background: C2, borderRadius: '8px', padding: '14px 18px', fontSize: '0.85rem', color: BODY, textAlign: 'left', lineHeight: '1.9', marginBottom: '20px' }}>
              <div>✓ Safe PyYAML loader identified</div>
              <div>✓ Dangerous YAML tag recognized</div>
              <div>✓ Simulated exploit output traced</div>
              <div>✓ Correct remediation selected</div>
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
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: T }}>A06:2021</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 32px 60px', textAlign: 'center', background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${T}12 0%, transparent 70%)` }} className="hero-shimmer">
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: .04, fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: '1.4', color: T, userSelect: 'none', whiteSpace: 'pre-wrap', padding: '10px', pointerEvents: 'none' }}>
          {Array(12).fill('pyyaml==5.1  !!python/object/apply:  yaml.load(data)  CVE-2020-1747  CVE-2020-14343  outdated dependency  ').join('\n')}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${T}18`, border: `1px solid ${T}40`, borderRadius: '20px', padding: '5px 16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '2px' }}>A06:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: '800', color: BRIGHT, margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Vulnerable &amp;<br />
            <span style={{ color: T }}>Outdated Components</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: BODY, maxWidth: '580px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            Your code can be flawless and still be exploitable — if a library you trust ships an unsafe function or an old, unpatched version. One risky call inside a popular package is all an attacker needs.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', maxWidth: '720px', margin: '0 auto' }}>
            <StatCard value={91}  suffix="%" label="Apps contain at least one outdated dependency" delay={0} />
            <StatCard value={6}   suffix="th" label="OWASP rank in 2021" delay={100} />
            <StatCard value={1}   suffix=""   label="Unsafe loader call away from full RCE" delay={200} />
            <StatCard value={2}   suffix=""   label="Lab tools: YAML converter + fixed terminal" delay={300} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* SECTION 1: Definition */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Definition" title="What are Vulnerable & Outdated Components?" id="definition" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <p style={{ margin: '0 0 14px', lineHeight: '1.75', fontSize: '0.95rem' }}>
                <strong style={{ color: BRIGHT }}>A06:2021 – Vulnerable and Outdated Components</strong> covers any third-party library, framework, or runtime your application depends on that is unpatched, unmaintained, or used through an unsafe API the library itself exposes.
              </p>
              <p style={{ margin: 0, lineHeight: '1.75', fontSize: '0.95rem' }}>
                A textbook example is Python's <strong style={{ color: T }}>PyYAML</strong> library. Its full loader, <Code>yaml.load()</Code>, can construct arbitrary Python objects from the document — including calling functions like <Code>subprocess.check_output</Code>. The safe alternative, <strong style={{ color: T }}>yaml.safe_load()</strong>, only ever builds plain types (str, int, list, dict) and refuses anything else.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Common Warning Signs</div>
              {[
                'Does the app call yaml.load() instead of yaml.safe_load()?',
                'Is the dependency pinned to a version with known CVEs?',
                'Does any code path deserialize untrusted user input directly?',
                'Is there a process to track CVEs for every dependency?',
                'Are dependency updates tested and shipped on a regular cadence?',
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
          <SectionHead label="Core Concept" title="How an Unsafe Loader Becomes RCE" id="concept" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Deserialization, Not Just Parsing</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                "Parsing" YAML into plain data and "deserializing" YAML into live Python objects are very different operations. PyYAML's full loader supports special tags that do the latter.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'safe_load()', val: 'Builds only str / int / float / list / dict / bool / None', good: true },
                  { label: 'load() (no Loader=)', val: 'Historically defaulted to the unsafe full loader in older PyYAML', good: false },
                  { label: '!!python/object/apply:', val: 'Tag that invokes any importable Python callable with given args', good: false },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: C2, borderRadius: '6px', border: `1px solid ${C3}` }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: r.good ? T : '#ef4444', flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: BODY, lineHeight: '1.5', textAlign: 'right' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Why "It's Just a Library Default" Matters</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                Developers rarely write deserialization vulnerabilities by hand — they inherit them by calling a convenient function from a popular package without reading what that function is capable of.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                Every dependency must be asked: <strong style={{ color: BRIGHT }}>which of its functions can execute code, and am I calling the hardened version?</strong> Pin versions, read changelogs, and prefer the safest API a library offers.
              </p>
            </div>
          </div>
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Vulnerable vs Secure Code Pattern</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ef4444', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>❌ Vulnerable (unsafe loader)</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #ef444430' }}>
                  <div><span style={{ color: MUTED }}># app.py</span></div>
                  <div><span style={{ color: '#f43f5e' }}>import</span> <span style={{ color: BODY }}>yaml</span></div>
                  <div></div>
                  <div><span style={{ color: BODY }}>data = request.files[</span><span style={{ color: '#fbbf24' }}>'file'</span><span style={{ color: BODY }}>].read()</span></div>
                  <div><span style={{ color: BODY }}>result = yaml.</span><span style={{ color: '#f43f5e' }}>load</span><span style={{ color: BODY }}>(data)</span> <span style={{ color: MUTED }}># can execute code</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>
                  Any uploaded YAML with a <Code>!!python/object/apply:</Code> tag can call arbitrary functions.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#22c55e', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>✓ Secure (safe loader)</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #22c55e30' }}>
                  <div><span style={{ color: MUTED }}># app.py</span></div>
                  <div><span style={{ color: '#f43f5e' }}>import</span> <span style={{ color: BODY }}>yaml</span></div>
                  <div></div>
                  <div><span style={{ color: BODY }}>data = request.files[</span><span style={{ color: '#fbbf24' }}>'file'</span><span style={{ color: BODY }}>].read()</span></div>
                  <div><span style={{ color: BODY }}>result = yaml.</span><span style={{ color: '#22c55e' }}>safe_load</span><span style={{ color: BODY }}>(data)</span> <span style={{ color: MUTED }}># data only</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>
                  The same payload raises a constructor error — no object is ever built, no function is ever called.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Attack Patterns */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Attack Patterns" title="Common Scenarios" id="scenarios" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '🧬', title: 'Insecure Deserialization', text: 'An unsafe loader (YAML, pickle, XML with external entities) turns untrusted input directly into live objects or function calls.' },
              { icon: '📦', title: 'Unpinned / Outdated Package', text: 'A dependency is installed without a version pin, silently picking up a release that reintroduces a previously-patched vulnerability.' },
              { icon: '🕳️', title: 'Known CVE Left Unpatched', text: 'A component with a public, indexed CVE keeps running in production because no one tracks the security bulletins for it.' },
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
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>Typical Component-Abuse Attack Chain</div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { step: '01', label: 'Fingerprint',  sub: 'Identify the library and version in use' },
                { step: '02', label: 'Find the CVE', sub: 'Search public advisories for known flaws' },
                { step: '03', label: 'Craft Payload', sub: 'Build input that triggers the unsafe code path' },
                { step: '04', label: 'Gain Execution', sub: 'Library runs attacker-controlled logic' },
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
            <TimelineStep icon="🧰" accent="#22c55e" title="Always reach for the safest API a library offers"
              text="Prefer yaml.safe_load() over yaml.load(), json.loads() over pickle.loads() on untrusted data, and defusedxml over the standard library's XML parser. Read the docs before calling a deserialization function." />
            <TimelineStep icon="📌" accent="#3b82f6" title="Pin and inventory every dependency"
              text="Track exact versions of every direct and nested dependency. Tools like pip-audit, OWASP Dependency-Check, or retire.js can flag known-vulnerable versions automatically." />
            <TimelineStep icon="🔔" accent="#8b5cf6" title="Subscribe to security advisories"
              text="Monitor CVE/NVD feeds and GitHub Security Advisories for every component you depend on, so a patch is available before an exploit becomes public." />
            <TimelineStep icon="🧪" accent="#f97316" title="Automate scanning in CI/CD"
              text="Run software composition analysis on every build. Block merges that introduce a package with an open, unpatched critical vulnerability." />
          </div>
        </section>

        {/* SECTION 5: Case Studies */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World Component Failures" id="examples" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
            {[
              { year: '2017', org: 'Equifax',  icon: '🏦', count: '147M',  desc: 'An unpatched Apache Struts 2 component (CVE-2017-5638) let attackers run arbitrary commands, leading to one of the largest breaches in history.' },
              { year: '2020', org: 'PyYAML',   icon: '🐍', count: 'CVE-2020-1747', desc: 'A flaw in the default yaml.load() loader allowed arbitrary code execution via crafted YAML — the exact class of bug this lab demonstrates.' },
              { year: '2021', org: 'Log4j',    icon: '☕', count: '~3B devices', desc: 'Log4Shell (CVE-2021-44228) let attackers achieve remote code execution through a single logged string in a hugely popular Java logging component.' },
              { year: '2022', org: 'Spring4Shell', icon: '🌱', count: 'Global RCE', desc: 'A deserialization flaw in the Spring Framework allowed remote code execution on apps that hadn\'t updated to a patched version.' },
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

        {/* SECTION 6: Challenge */}
        <section className="fade-up">
          <SectionHead label="Lab" title="Interactive Challenge: Unsafe YAML Deserialization" id="challenge" />

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Lab header */}
            <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: BRIGHT }}>Security Lab · A06 — Vulnerable & Outdated Components</span>
              </div>
              <button
                onClick={openSite}
                onMouseEnter={() => setSiteHov(true)}
                onMouseLeave={() => setSiteHov(false)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  padding: '9px 22px', borderRadius: '6px', border: 'none',
                  background: siteHov ? '#c9aeff' : T,
                  color: '#0a0f1e', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
                  boxShadow: siteHov ? `0 0 20px ${T}80` : `0 4px 12px ${T}40`,
                  transform: siteHov ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all .22s ease',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                className="btn view-btn"
              >
                🌐 View Site
              </button>
            </div>

            <div style={{ padding: '32px 28px' }}>
              <p style={{ margin: '0 0 32px', fontSize: '0.95rem', color: BODY, lineHeight: '1.7' }}>
                The target site hosts a <strong style={{ color: BRIGHT }}>YAML → JSON converter</strong> plus a fixed-command lab terminal. The backend always uses <Code>yaml.safe_load()</Code>, so nothing you upload is ever executed — but when it detects a dangerous tag like{' '}
                <Code>!!python/object/apply:</Code>, it shows you a clearly-labelled <strong style={{ color: T }}>simulation</strong> of what an unsafe loader would have leaked. Open the site, try the example payload, and answer all four questions.
              </p>

              {/* Q1 */}
              <QuestionBlock num={1} solved={fbQ1.status === 'success'}
                label={<>According to Section 1, what is the name of the safe PyYAML function that should replace <Code>yaml.load()</Code>? <span style={{ color: MUTED, fontWeight: '400' }}>(function name)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="yaml.____()" value={q1Input}
                    onChange={e => setQ1Input(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1: v }))} />
                  <HintBtn onClick={() => setHintQ1(!hintQ1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1: v }))} />
                </div>
                {hintQ1 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Section 1 names it directly: "The safe alternative, yaml.____(), only ever builds plain types." Fill in the blank.
                  </div>
                )}
                {fbQ1.message && <div style={fbStyle(fbQ1.status)} className="slide-in">{fbQ1.message}</div>}
              </QuestionBlock>

              {/* Q2 */}
              <QuestionBlock num={2} solved={fbQ2.status === 'success'}
                label={<>Open the lab's YAML converter and try the example payload. What is the name of the dangerous YAML tag it contains?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="!!python/object/..." value={q2Input}
                    onChange={e => setQ2Input(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2: v }))} />
                  <HintBtn onClick={() => setHintQ2(!hintQ2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2: v }))} />
                </div>
                {hintQ2 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> The lab response includes a field called <Code>dangerous_tag_detected</Code> — copy its value exactly.
                  </div>
                )}
                {fbQ2.message && <div style={fbStyle(fbQ2.status)} className="slide-in">{fbQ2.message}</div>}
              </QuestionBlock>

              {/* Q3 */}
              <QuestionBlock num={3} solved={fbQ3.status === 'success'}
                label={<>In the converter's simulated warning, which command name is shown as the <strong style={{ color: T }}>simulated_command</strong> for the example payload?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Enter the command name…" value={q3Input}
                    onChange={e => setQ3Input(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3: v }))} />
                  <HintBtn onClick={() => setHintQ3(!hintQ3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3: v }))} />
                </div>
                {hintQ3 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> The example payload's argument list contains a single, very common reconnaissance command — the same one you can also try directly in the lab's fixed terminal.
                  </div>
                )}
                {fbQ3.message && <div style={fbStyle(fbQ3.status)} className="slide-in">{fbQ3.message}</div>}
              </QuestionBlock>

              {/* Q4 — radio card question */}
              <QuestionBlock num={4} solved={fbQ4.status === 'success'}
                label={<>Based on the <strong style={{ color: T }}>Mitigation Strategies</strong> section, what is the correct fix for an application that calls the unsafe <Code>yaml.load()</Code> on user-supplied files?</>}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', marginBottom: '14px' }}>
                  {Q4_OPTIONS.map(opt => {
                    const sel = q4Sel === opt.id;
                    const hov = hovQ4 === opt.id;
                    return (
                      <div key={opt.id}
                        onClick={() => setQ4Sel(opt.id)}
                        onMouseEnter={() => setHovQ4(opt.id)}
                        onMouseLeave={() => setHovQ4('')}
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
                  <VerifyBtn label="Submit Answer" onClick={checkQ4} hov={hovV.q4} onHov={v => setHovV(p => ({ ...p, q4: v }))} />
                  <HintBtn onClick={() => setHintQ4(!hintQ4)} hov={hovH.q4} onHov={v => setHovH(p => ({ ...p, q4: v }))} />
                </div>
                {hintQ4 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Ask yourself: which option changes the actual loader function being called, rather than just disguising or filtering the input around it?
                  </div>
                )}
                {fbQ4.message && <div style={fbStyle(fbQ4.status)} className="slide-in">{fbQ4.message}</div>}
              </QuestionBlock>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}