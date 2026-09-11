import React, { useState, useEffect, useRef } from 'react';

const T      = '#d4ff00';
const BG     = '#0a0f1e';
const C1     = '#0f1729';
const C2     = '#192035';
const C3     = '#1e2a45';
const MUTED  = '#4a5878';
const BODY   = '#94a3b8';
const BRIGHT = '#e2e8f0';

const TOTAL_QUESTIONS = 6;

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
            : `linear-gradient(90deg,${T},#eaff7a)`,
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
    <div style={{ marginBottom: '24px', position: 'relative' }}>
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

const Q5_OPTIONS = [
  { id: 'allowlist',       label: 'Allow-list permitted destinations',    desc: 'Explicitly permit only known-safe hosts/protocols for every outbound server-side request; deny everything else by default' },
  { id: 'blocklist',       label: 'Block-list known-bad IPs',             desc: 'Maintain a deny-list of dangerous addresses such as 169.254.169.254 and hope nothing else is missed' },
  { id: 'client_validate', label: 'Validate the URL in JavaScript',       desc: 'Check the URL format in the browser before the form is submitted to the server' },
  { id: 'timeout',         label: 'Increase the request timeout',        desc: 'Give the server more time to complete the outbound fetch request' },
];

export default function A10({ onBack }) {

  const [theoryInput,      setTheoryInput]      = useState('');
  const [ipInput,          setIpInput]          = useState('');
  const [flagEnvInput,     setFlagEnvInput]     = useState('');
  const [flagInput,        setFlagInput]        = useState('');
  const [selectedQ5,       setSelectedQ5]       = useState('');
  const [imageAnswerInput, setImageAnswerInput] = useState('');

  const [feedbackQ1, setFeedbackQ1] = useState({ message: '', status: '' });
  const [feedbackQ2, setFeedbackQ2] = useState({ message: '', status: '' });
  const [feedbackQ3, setFeedbackQ3] = useState({ message: '', status: '' });
  const [feedbackQ4, setFeedbackQ4] = useState({ message: '', status: '' });
  const [feedbackQ5, setFeedbackQ5] = useState({ message: '', status: '' });
  const [feedbackQ6, setFeedbackQ6] = useState({ message: '', status: '' });

  const [showHintQ1, setShowHintQ1] = useState(false);
  const [showHintQ2, setShowHintQ2] = useState(false);
  const [showHintQ3, setShowHintQ3] = useState(false);
  const [showHintQ4, setShowHintQ4] = useState(false);
  const [showHintQ5, setShowHintQ5] = useState(false);
  const [showHintQ6, setShowHintQ6] = useState(false);

  const [complete, setComplete] = useState(false);
  const [backHov,  setBackHov]  = useState(false);
  const [siteHov,  setSiteHov]  = useState(false);
  const [hovV, setHovV] = useState({ q1: false, q2: false, q3: false, q4: false, q5: false, q6: false });
  const [hovH, setHovH] = useState({ q1: false, q2: false, q3: false, q4: false, q5: false, q6: false });
  const [hovQ5Option, setHovQ5Option] = useState('');

  const statuses       = [feedbackQ1.status, feedbackQ2.status, feedbackQ3.status, feedbackQ4.status, feedbackQ5.status, feedbackQ6.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const openSite = () =>
    window.open(`${window.location.origin}${window.location.pathname}?mode=a10_target`, '_blank');
  const goHome = () => { if (onBack) onBack(); else window.location.href = '/'; };

  const checkQ1 = (e) => {
    e.preventDefault();
    const v = theoryInput.trim().toLowerCase();
    if (!v) { setFeedbackQ1({ message: '⚠️ Please enter your answer before verifying.', status: 'error' }); return; }
    if (v === 'url') {
      setFeedbackQ1({ message: '🎉 Correct! SSRF occurs when the server fetches a remote resource without validating the user-supplied URL — the server, not the browser, makes the request.', status: 'success' });
    } else {
      setFeedbackQ1({ message: '❌ Incorrect. Re-read the first paragraph of Section 1 — what does the application fail to validate before fetching?', status: 'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    const v = ipInput.trim();
    if (!v) { setFeedbackQ2({ message: '⚠️ Please enter an IP address.', status: 'error' }); return; }
    if (v === '169.254.169.254') {
      setFeedbackQ2({ message: '🎉 Correct! 169.254.169.254 is the link-local address used by AWS, Azure, and GCP to serve instance metadata — including temporary IAM credentials — and it is the single most targeted address in SSRF attacks.', status: 'success' });
    } else {
      setFeedbackQ2({ message: `❌ Incorrect (you entered "${v}"). Look at the Attack Patterns section — "Cloud Metadata Exploitation" names this exact link-local address.`, status: 'error' });
    }
  };

  const checkQ3 = (e) => {
    e.preventDefault();
    const v = flagInput.trim();
    if (!v) { setFeedbackQ3({ message: '⚠️ Please enter an IP address.', status: 'error' }); return; }
    if (v === '118.71.154.97') {
      setFeedbackQ3({ message: '🎉 Correct! By replacing the blog value with https://ifconfig.me/ip, the server fetched the URL on your behalf and returned the server\'s own public IP address — demonstrating how SSRF lets attackers probe the server\'s network identity.', status: 'success' });
    } else {
      setFeedbackQ3({ message: '❌ Incorrect. On the target site, edit the hidden blog field from "blog1.txt" to "https://ifconfig.me/ip", then resubmit the form. The response will be the server\'s public IP.', status: 'error' });
    }
  };

  const checkQ4 = (e) => {
    e.preventDefault();
    const v = flagEnvInput.trim();
    if (!v) { setFeedbackQ4({ message: '⚠️ Please enter the flag string.', status: 'error' }); return; }
    if (v === 'FLAG{SSRF_0w4sp_A10_Excl01t_Succ3ss}') {
      setFeedbackQ4({ message: '🎉 Flag captured! By replacing the blog value with file://.env, the server read its own environment file and returned the secret FLAG — demonstrating how SSRF with file:// scheme leads to full local file disclosure.', status: 'success' });
    } else {
      setFeedbackQ4({ message: '❌ Incorrect flag. On the target site, change the hidden blog field to file://.env and resubmit. Look for the FLAG= line in the server response.', status: 'error' });
    }
  };

  const checkQ5 = (e) => {
    e.preventDefault();
    if (!selectedQ5) { setFeedbackQ5({ message: '⚠️ Please select an option before verifying.', status: 'error' }); return; }
    if (selectedQ5 === 'allowlist') {
      setFeedbackQ5({ message: '🎉 Correct! An explicit allow-list of permitted hosts, ports, and protocols — deny by default — is the only mitigation that scales, because it does not rely on enumerating every possible internal target an attacker might guess.', status: 'success' });
    } else {
      const msgs = {
        blocklist:       '❌ Block-lists are incomplete by nature — attackers route around them with redirects, DNS rebinding, or alternate IP encodings (e.g. decimal/octal forms of 169.254.169.254).',
        client_validate: '❌ Client-side JavaScript validation runs in the attacker\'s own browser and is trivially bypassed by editing the request directly, exactly as in this lab.',
        timeout:         '❌ A timeout limits how long a malicious request can run — it does nothing to stop the request from reaching an internal resource in the first place.',
      };
      setFeedbackQ5({ message: msgs[selectedQ5] || '❌ Incorrect. Re-read the Mitigation Strategies section.', status: 'error' });
    }
  };

  const checkQ6 = (e) => {
    e.preventDefault();
    const v = imageAnswerInput.trim().toLowerCase();
    if (!v) { setFeedbackQ6({ message: '⚠️ Please enter your answer before verifying.', status: 'error' }); return; }
    if (v === 'jerry') {
      setFeedbackQ6({ message: '🎉 Correct! The server fetched the remote image from that external URL on your behalf and rendered it — proving that SSRF is not limited to text: binary assets like images can be exfiltrated the same way. The meme features Jerry from Tom & Jerry.', status: 'success' });
    } else {
      setFeedbackQ6({ message: '❌ Incorrect. Replace the hidden blog field with the image URL above, resubmit, and look at the image that appears in the response panel. What cartoon character is shown in the meme?', status: 'error' });
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
        @keyframes shimmerLime{ 0%{left:-160%} 45%{left:160%} 100%{left:160%} }
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
          transform:skewX(-22deg); animation:shimmerLime 3.8s infinite;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
      `}</style>

      {/* COMPLETION MODAL */}
      {complete && (
        <div onClick={() => setComplete(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn .3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '16px', padding: '40px 36px', textAlign: 'center', maxWidth: '440px', width: '92%' }} className="pop-in">
            <div style={{ fontSize: '64px', marginBottom: '12px' }} className="float">🛰️</div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: T, margin: '0 0 10px' }}>Lab Cleared!</h2>
            <p style={{ color: BODY, lineHeight: '1.6', margin: '0 0 18px' }}>
              You've mastered <strong style={{ color: BRIGHT }}>A10: Server-Side Request Forgery</strong> — understanding how an unvalidated server-side fetch can be redirected into your own internal network.
            </p>
            <div style={{ background: C2, borderRadius: '8px', padding: '14px 18px', fontSize: '0.85rem', color: BODY, textAlign: 'left', lineHeight: '1.9', marginBottom: '20px' }}>
              <div>✓ Core SSRF concept explained correctly</div>
              <div>✓ Cloud metadata endpoint (169.254.169.254) identified</div>
              <div>✓ Server public IP leaked via external fetch redirect</div>
              <div>✓ Local .env file read via file:// scheme — FLAG captured</div>
              <div>✓ Correct SSRF mitigation strategy identified</div>
              <div>✓ Remote image exfiltrated via SSRF — binary assets exposed</div>
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
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: T }}>A10:2021</span>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 32px 60px', textAlign: 'center', background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${T}12 0%, transparent 70%)` }} className="hero-shimmer">
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: .04, fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: '1.4', color: T, userSelect: 'none', whiteSpace: 'pre-wrap', padding: '10px', pointerEvents: 'none' }}>
          {Array(12).fill('GET /api/read-blog?url=  169.254.169.254  /latest/meta-data/  file://  internal-admin:8080  ').join('\n')}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${T}18`, border: `1px solid ${T}40`, borderRadius: '20px', padding: '5px 16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '2px' }}>A10:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: '800', color: BRIGHT, margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Server-Side<br />
            <span style={{ color: T }}>Request Forgery</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: BODY, maxWidth: '560px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            When a server fetches a resource on the client's behalf without checking the destination — attackers redirect that fetch inward, reaching internal services, cloud metadata, and credentials no firewall was ever meant to expose.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', maxWidth: '720px', margin: '0 auto' }}>
            <StatCard value={1}   suffix="st" label="New category added to the Top 10 in 2021" delay={0} />
            <StatCard value={106} suffix="M"  label="Capital One customers affected by an SSRF breach" delay={100} />
            <StatCard value={4}   suffix=""   label="Vulnerable blog endpoints exposed in this lab" delay={200} />
            <StatCard value={169} suffix=""   label="First octet of the cloud metadata IP attackers target" delay={300} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* SECTION 1 */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Definition" title="What is Server-Side Request Forgery?" id="definition" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <p style={{ margin: '0 0 14px', lineHeight: '1.75', fontSize: '0.95rem' }}>
                <strong style={{ color: BRIGHT }}>A10:2021 – Server-Side Request Forgery (SSRF)</strong> flaws occur whenever a web application fetches a remote resource without validating the user-supplied <strong style={{ color: T }}>URL</strong>. The application itself becomes the attacker's proxy.
              </p>
              <p style={{ margin: 0, lineHeight: '1.75', fontSize: '0.95rem' }}>
                This lets an attacker coerce the application into sending a crafted request to an unexpected destination — even when that destination is protected by a firewall, VPN, or other network ACL — because the request originates from <em style={{ color: '#cbd5e1' }}>inside</em> the trusted network, not from the attacker's own machine.
              </p>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Common Vulnerability Signals</div>
              {[
                'Does the app fetch a URL, file path, or webhook based on user input?',
                'Is there an allow-list restricting which hosts/protocols can be requested?',
                'Can the app reach internal-only addresses (127.0.0.1, 169.254.169.254, 10.x)?',
                'Are URL schemes restricted to http/https only (no file://, gopher://)?',
                'Are raw fetch responses ever returned to the client unmodified?',
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
          <SectionHead label="Core Concept" title="SSRF vs CSRF — Who Sends the Request?" id="concept" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Two Very Different "Forgeries"</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                The names sound alike but the trust boundary being abused is completely different.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'CSRF', val: 'Tricks the victim\'s browser into sending a request — abuses the user\'s session', good: true },
                  { label: 'SSRF', val: 'Tricks the server into sending a request — abuses the server\'s network position', good: false },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: C2, borderRadius: '6px', border: `1px solid ${C3}` }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: r.good ? T : '#ef4444', flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: BODY, lineHeight: '1.5', textAlign: 'right' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Why Network Position Matters</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                A server sitting inside a VPC inherits firewall trust that a random internet attacker never has. SSRF doesn't break the firewall — it walks the attacker's request through the front door, wearing the server's identity.
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>
                The most valuable destination is almost always the <strong style={{ color: BRIGHT }}>cloud metadata service</strong>, which hands out temporary IAM credentials to anything that asks from inside the network — no authentication required.
              </p>
            </div>
          </div>
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: '700', color: BRIGHT }}>Vulnerable vs Secure Code Pattern</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ef4444', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>❌ Vulnerable (no destination check)</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #ef444430' }}>
                  <div><span style={{ color: MUTED }}># Server fetches whatever the client sends</span></div>
                  <div><span style={{ color: '#f43f5e' }}>POST</span> <span style={{ color: T }}>/api/read-blog</span></div>
                  <div><span style={{ color: BODY }}>blog</span> <span style={{ color: '#f43f5e' }}>=</span> <span style={{ color: BODY }}>request.form['blog']</span></div>
                  <div><span style={{ color: '#f43f5e' }}>resp</span> <span style={{ color: BODY }}>= requests.get(blog)</span></div>
                  <div><span style={{ color: '#f43f5e' }}>return</span> <span style={{ color: BODY }}>resp.text</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>
                  The server trusts the value with no allow-list. Swap a filename for an internal URL and the server fetches it for you.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#22c55e', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>✓ Secure (allow-list enforced)</div>
                <div style={{ background: C2, borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '2', border: '1px solid #22c55e30' }}>
                  <div><span style={{ color: MUTED }}># Resolve an ID against a fixed allow-list</span></div>
                  <div><span style={{ color: '#22c55e' }}>if</span> <span style={{ color: BODY }}>blog_id</span> <span style={{ color: '#f43f5e' }}>not in</span> <span style={{ color: BODY }}>ALLOWED_BLOGS:</span></div>
                  <div><span style={{ color: BODY }}>  </span><span style={{ color: '#f43f5e' }}>raise</span> <span style={{ color: BODY }}>400 Bad Request</span></div>
                  <div><span style={{ color: BODY }}>url</span> <span style={{ color: '#f43f5e' }}>=</span> <span style={{ color: BODY }}>ALLOWED_BLOGS[blog_id]</span></div>
                  <div><span style={{ color: '#22c55e' }}>return</span> <span style={{ color: BODY }}>sanitize(fetch(url))</span></div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: MUTED, lineHeight: '1.6' }}>
                  Only an explicit, known-safe identifier resolves to a real destination — nothing the attacker supplies is fetched directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Attack Patterns" title="Common Scenarios" id="scenarios" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '☁️', title: 'Cloud Metadata Exploitation',  text: 'The attacker points the server\'s fetch at 169.254.169.254 — the link-local metadata service on AWS/Azure/GCP — to steal temporary IAM credentials with no authentication required.' },
              { icon: '🔭', title: 'Internal Port Scanning',       text: 'The fetch feature is used to probe internal hosts and ports (localhost:6379 Redis, internal admin panels) that are normally unreachable from the public internet.' },
              { icon: '🧬', title: 'Protocol Smuggling',           text: 'Alternate URL schemes such as file://, gopher://, or dict:// are used to read local files or speak to non-HTTP internal services the developer never anticipated.' },
            ].map(s => (
              <div key={s.title} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${T}`, borderRadius: '10px', padding: '22px' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{s.icon}</div>
                <div style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.95rem', marginBottom: '10px' }}>{s.title}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: BODY, lineHeight: '1.65' }}>{s.text}</p>
              </div>
            ))}
          </div>
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', padding: '28px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px', textAlign: 'center' }}>Typical SSRF Attack Chain</div>
            <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: '0' }}>
              {[
                { step: '01', label: 'Find the Fetch Point',      sub: 'Locate a feature that fetches a URL/resource server-side' },
                { step: '02', label: 'Inspect the Request',       sub: 'Find the hidden parameter that names the resource' },
                { step: '03', label: 'Pivot to Metadata',         sub: 'Swap the value for 169.254.169.254/latest/meta-data/...' },
                { step: '04', label: 'Exfiltrate Credentials',    sub: 'Harvest the IAM token returned in the response' },
              ].map((s, i, arr) => (
                <React.Fragment key={s.step}>
                  <div style={{
                    flex: '1 1 0', minWidth: '120px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'flex-start', textAlign: 'center', padding: '16px 12px',
                  }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: T, fontWeight: '700', marginBottom: '10px' }}>{s.step}</div>
                    <div style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.9rem', marginBottom: '8px', lineHeight: '1.3' }}>{s.label}</div>
                    <div style={{ fontSize: '0.75rem', color: MUTED, lineHeight: '1.5' }}>{s.sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: C3, fontSize: '1.4rem', flexShrink: 0, paddingBottom: '24px', alignSelf: 'center' }}>→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Defense" title="Mitigation Strategies" id="mitigation" />
          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            <TimelineStep icon="🧱" accent="#22c55e" title="Enforce an allow-list of destinations"
              text="Maintain an explicit allow-list of permitted hosts, ports, and protocols for every outbound server-side request. Deny everything else by default — never rely on enumerating what's dangerous." />
            <TimelineStep icon="🌐" accent="#3b82f6" title="Disable unused URL schemes & redirects"
              text="Restrict outbound fetches to http/https only and disable automatic redirect-following, since attackers chain redirects to slip past an allow-list check after the first hop." />
            <TimelineStep icon="🔒" accent="#8b5cf6" title="Segment the network layer"
              text="Place metadata services and internal admin panels on a separate network segment with firewall rules, so the application server cannot reach them even if SSRF succeeds — defense in depth." />
            <TimelineStep icon="🧪" accent="#f97316" title="Sanitize responses before returning them"
              text="Never pass the raw upstream response straight back to the client. Strip headers, validate content type, and limit response size to reduce what an attacker can exfiltrate in one request." />
          </div>
        </section>

        {/* SECTION 5 */}
        <section style={{ marginBottom: '64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World SSRF Failures" id="examples" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
            {[
              { year: '2019', org: 'Capital One', icon: '🏦', count: '106M',  desc: 'A misconfigured WAF was tricked via SSRF into querying the EC2 metadata service, handing the attacker temporary IAM credentials that unlocked S3 buckets full of customer data.' },
              { year: '2019', org: 'Shopify',     icon: '🛍️', count: '$25K bounty', desc: 'A bug-bounty researcher found an SSRF in an image-upload feature that could reach internal Kubernetes and instance-metadata endpoints from inside Shopify\'s infrastructure.' },
              { year: '2021', org: 'Microsoft Exchange', icon: '📧', count: 'Thousands of servers', desc: 'SSRF in the Exchange Autodiscover feature was chained with other flaws (ProxyShell) to achieve remote code execution on on-premises mail servers worldwide.' },
              { year: '2023', org: 'Atlassian Confluence', icon: '🧩', count: 'CVE-rated critical', desc: 'A link-preview/widget macro could be coerced into fetching attacker-supplied URLs, reaching internal AWS metadata from inside hosted Confluence instances.' },
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
          <SectionHead label="Lab" title="Interactive Challenge: SSRF Exploitation" id="challenge" />

          <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Lab header */}
            <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: BRIGHT }}>Security Lab · A10 — Server-Side Request Forgery</span>
              </div>
              <button
                onClick={openSite}
                onMouseEnter={() => setSiteHov(true)}
                onMouseLeave={() => setSiteHov(false)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  padding: '9px 22px', borderRadius: '6px', border: 'none',
                  background: siteHov ? '#e4ff66' : T,
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

            <div style={{ padding: '24px 28px' }}>
              <p style={{ margin: '0 0 20px', fontSize: '0.95rem', color: BODY, lineHeight: '1.7' }}>
                A "Tech Blog Reader" loads each post through a hidden form field — the server simply resolves whatever value the client sends, with no allow-list. Open the target site, inspect the hidden{' '}
                <code style={{ background: C2, padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: '#f43f5e', fontSize: '0.88rem', border: `1px solid ${C3}` }}>blog</code>{' '}
                field on any button, redirect it at an external or internal resource, and answer all six questions.
              </p>

              {/* Q1 */}
              <QuestionBlock num={1} solved={feedbackQ1.status === 'success'}
                label={<>According to Section 1, SSRF occurs when the server fetches a remote resource without validating the user-supplied what? <span style={{ color: MUTED, fontWeight: '400' }}>(one word)</span></>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Enter the word from Section 1…" value={theoryInput}
                    onChange={e => setTheoryInput(e.target.value)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1: v }))} />
                  <HintBtn onClick={() => setShowHintQ1(!showHintQ1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1: v }))} />
                </div>
                {showHintQ1 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Look at the first sentence of Section 1. It states: "…fetches a remote resource without validating the user-supplied…". The answer is the three-letter abbreviation for a web address.</div>}
                {feedbackQ1.message && <div style={fbStyle(feedbackQ1.status)} className="slide-in">{feedbackQ1.message}</div>}
              </QuestionBlock>

              {/* Q2 */}
              <QuestionBlock num={2} solved={feedbackQ2.status === 'success'}
                label={<>What link-local IP address do cloud providers use to serve instance metadata, and is therefore the most common SSRF target?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="e.g. 169.254.x.x" value={ipInput}
                    onChange={e => setIpInput(e.target.value)}
                    style={{ ...inputStyle, color: '#fbbf24', fontFamily: 'monospace' }} />
                  <VerifyBtn onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2: v }))} />
                  <HintBtn onClick={() => setShowHintQ2(!showHintQ2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2: v }))} />
                </div>
                {showHintQ2 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Check the "Cloud Metadata Exploitation" card in Attack Patterns — the exact address is named there.</div>}
                {feedbackQ2.message && <div style={fbStyle(feedbackQ2.status)} className="slide-in">{feedbackQ2.message}</div>}
              </QuestionBlock>

              {/* Q3 */}
              <QuestionBlock num={3} solved={feedbackQ3.status === 'success'}
                label={<>On the target site, open DevTools, find the hidden <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: '#f43f5e', fontSize: '0.85em' }}>blog</code> field on <strong style={{ color: T }}>Blog 1</strong>, and change its value to <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: T, fontSize: '0.85em' }}>https://ifconfig.me/ip</code>. Resubmit. What public IP does the server return?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="x.x.x.x" value={flagInput}
                    onChange={e => setFlagInput(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} />
                  <VerifyBtn label="Verify" onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3: v }))} />
                  <HintBtn onClick={() => setShowHintQ3(!showHintQ3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3: v }))} />
                </div>
                {showHintQ3 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Right-click Blog 1 → Inspect → locate the hidden input → replace <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>blog1.txt</code> with <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>https://ifconfig.me/ip</code> → resubmit.</div>}
                {feedbackQ3.message && <div style={fbStyle(feedbackQ3.status)} className="slide-in">{feedbackQ3.message}</div>}
              </QuestionBlock>

              {/* Q4 */}
              <QuestionBlock num={4} solved={feedbackQ4.status === 'success'}
                label={<>Escalate using the <strong style={{ color: T }}>file://</strong> scheme. Change the hidden <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: '#f43f5e', fontSize: '0.85em' }}>blog</code> field to <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: T, fontSize: '0.85em' }}>file://.env</code> and resubmit. What is the <strong style={{ color: T }}>FLAG</strong> value in the server's <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: T, fontSize: '0.85em' }}>.env</code> file?</>}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="FLAG{…}" value={flagEnvInput}
                    onChange={e => setFlagEnvInput(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace', color: '#f43f5e' }} />
                  <VerifyBtn label="Verify" onClick={checkQ4} hov={hovV.q4} onHov={v => setHovV(p => ({ ...p, q4: v }))} />
                  <HintBtn onClick={() => setShowHintQ4(!showHintQ4)} hov={hovH.q4} onHov={v => setHovH(p => ({ ...p, q4: v }))} />
                </div>
                {showHintQ4 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Set the hidden <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>blog</code> value to <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>file://.env</code> and resubmit. Look for the <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>FLAG=</code> line in the response.</div>}
                {feedbackQ4.message && <div style={fbStyle(feedbackQ4.status)} className="slide-in">{feedbackQ4.message}</div>}
              </QuestionBlock>

              {/* Q5 */}
              <QuestionBlock num={5} solved={feedbackQ5.status === 'success'}
                label={<>Based on the <strong style={{ color: T }}>Mitigation Strategies</strong> section, which of the following correctly prevents an SSRF vulnerability?</>}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px', marginBottom: '14px' }}>
                  {Q5_OPTIONS.map(opt => {
                    const sel = selectedQ5 === opt.id;
                    const hov = hovQ5Option === opt.id;
                    return (
                      <div key={opt.id}
                        onClick={() => setSelectedQ5(opt.id)}
                        onMouseEnter={() => setHovQ5Option(opt.id)}
                        onMouseLeave={() => setHovQ5Option('')}
                        style={{
                          padding: '14px 16px', borderRadius: '8px', cursor: 'pointer',
                          border: sel ? `2px solid ${T}` : hov ? `2px solid ${T}60` : `2px solid ${C3}`,
                          background: sel ? `${T}12` : C2,
                          transition: 'all .2s ease',
                        }}>
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
                {showHintQ5 && <div style={hintStyle} className="slide-in"><strong style={{ color: '#eab308' }}>Hint:</strong> Re-read the first mitigation step. Ask yourself: which option works even against a destination the developer never thought to block?</div>}
                {feedbackQ5.message && <div style={fbStyle(feedbackQ5.status)} className="slide-in">{feedbackQ5.message}</div>}
              </QuestionBlock>

              {/* Q6 — Image SSRF */}
              <QuestionBlock num={6} solved={feedbackQ6.status === 'success'}
                label={
                  <>
                    SSRF isn't limited to text — the server can also be forced to fetch and return binary assets like images.
                    Change the hidden <code style={{ background: C2, padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', color: '#f43f5e', fontSize: '0.85em' }}>blog</code> field
                    to the URL below and resubmit. An image will appear in the response panel.{' '}
                    <strong style={{ color: T }}>What cartoon character is shown in the meme?</strong>
                    <div style={{
                      marginTop: '10px', padding: '10px 14px',
                      background: C2, border: `1px solid ${C3}`, borderRadius: '6px',
                      fontFamily: 'monospace', fontSize: '0.8rem', color: T,
                      wordBreak: 'break-all', letterSpacing: '0.2px',
                    }}>
                      https://tuanluupiano.com/wp-content/uploads/2026/01/meme-jerry-1.jpg
                    </div>
                  </>
                }>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Name of the cartoon character…"
                    value={imageAnswerInput}
                    onChange={e => setImageAnswerInput(e.target.value)}
                    style={inputStyle}
                  />
                  <VerifyBtn label="Verify" onClick={checkQ6} hov={hovV.q6} onHov={v => setHovV(p => ({ ...p, q6: v }))} />
                  <HintBtn onClick={() => setShowHintQ6(!showHintQ6)} hov={hovH.q6} onHov={v => setHovH(p => ({ ...p, q6: v }))} />
                </div>
                {showHintQ6 && (
                  <div style={hintStyle} className="slide-in">
                    <strong style={{ color: '#eab308' }}>Hint:</strong> Replace the hidden <code style={{ background: C2, padding: '1px 4px', borderRadius: '3px', color: T }}>blog</code> field value with the full image URL above, then resubmit. The server fetches and renders the image — look at it carefully. The character is the mouse from the classic cartoon duo <em style={{ color: '#cbd5e1' }}>Tom &amp; ___</em>.
                  </div>
                )}
                {feedbackQ6.message && <div style={fbStyle(feedbackQ6.status)} className="slide-in">{feedbackQ6.message}</div>}
              </QuestionBlock>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}