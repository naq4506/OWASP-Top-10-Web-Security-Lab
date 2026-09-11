import React, { useState, useEffect, useRef } from 'react';

const T      = '#ff2d95';
const BG     = '#0a0f1e';
const C1     = '#0f1729';
const C2     = '#192035';
const C3     = '#1e2a45';
const MUTED  = '#4a5878';
const BODY   = '#94a3b8';
const BRIGHT = '#e2e8f0';
const GREEN  = '#22c55e';
const YELLOW = '#eab308';

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
    <div ref={ref} style={{ textAlign:'center', padding:'28px 16px', background:C1, border:`1px solid ${C3}`, borderTop:`3px solid ${T}`, borderRadius:'10px', animationDelay:`${delay}ms` }}>
      <div style={{ fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:'2.4rem', fontWeight:'800', color:T, lineHeight:1, letterSpacing:'-1px' }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize:'0.78rem', color:MUTED, marginTop:'8px', textTransform:'uppercase', letterSpacing:'1.5px' }}>{label}</div>
    </div>
  );
}

function TimelineStep({ icon, title, text, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', gap:'20px', alignItems:'flex-start', padding:'20px 22px', borderRadius:'10px', background:hov ? C2 : 'transparent', border:`1px solid ${hov ? C3 : 'transparent'}`, transition:'all 0.25s ease', cursor:'default' }}>
      <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:`${accent}18`, border:`2px solid ${accent}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.15rem', flexShrink:0, boxShadow:hov ? `0 0 16px ${accent}40` : 'none', transition:'box-shadow 0.25s ease' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:'0.95rem', fontWeight:'700', color:BRIGHT, marginBottom:'6px' }}>{title}</div>
        <div style={{ fontSize:'0.88rem', color:BODY, lineHeight:'1.65' }}>{text}</div>
      </div>
    </div>
  );
}

function SectionHead({ label, title, id }) {
  return (
    <div id={id} style={{ marginBottom:'32px', scrollMarginTop:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
        <div style={{ width:'32px', height:'3px', background:T, borderRadius:'2px' }} />
        <span style={{ fontSize:'0.72rem', fontWeight:'700', color:T, textTransform:'uppercase', letterSpacing:'2px' }}>{label}</span>
      </div>
      <h2 style={{ margin:0, fontSize:'1.65rem', fontWeight:'700', color:BRIGHT }}>{title}</h2>
    </div>
  );
}

function ProgressBar({ completed }) {
  const pct  = Math.round((completed / TOTAL_QUESTIONS) * 100);
  const done = pct === 100;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
      <span style={{ fontSize:'0.72rem', color:MUTED, whiteSpace:'nowrap', letterSpacing:'0.5px' }}>Progress</span>
      <div style={{ position:'relative', width:'160px', height:'8px', background:C3, borderRadius:'4px', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, height:'100%', width:`${pct}%`, background:done ? 'linear-gradient(90deg,#22c55e,#4ade80)' : `linear-gradient(90deg,${T},#ff7ac0)`, borderRadius:'4px', transition:'width 0.55s cubic-bezier(.16,1,.3,1)', boxShadow:pct > 0 ? `0 0 10px ${done ? '#22c55e' : T}90` : 'none' }} />
      </div>
      <span style={{ fontSize:'0.75rem', fontFamily:"'JetBrains Mono',monospace", fontWeight:'700', color:done ? '#22c55e' : T, whiteSpace:'nowrap', minWidth:'44px', textAlign:'right' }}>
        {done ? '✓ Done' : `${completed}/${TOTAL_QUESTIONS}`}
      </span>
    </div>
  );
}

function QuestionBlock({ num, label, solved, children }) {
  return (
    <div style={{ marginBottom:'36px', position:'relative' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'12px' }}>
        <div style={{ width:'26px', height:'26px', borderRadius:'50%', flexShrink:0, background:solved ? '#064e3b' : `${T}20`, border:`1px solid ${solved ? '#10b981' : T+'60'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'800', color:solved ? '#34d399' : T, transition:'all 0.3s ease' }}>
          {solved ? '✓' : num}
        </div>
        <label style={{ fontSize:'0.98rem', color:BRIGHT, fontWeight:'600', lineHeight:'1.5' }}>{label}</label>
      </div>
      <div style={{ paddingLeft:'36px' }}>{children}</div>
    </div>
  );
}

function VerifyBtn({ onClick, hov, onHov, label = 'Verify' }) {
  return (
    <button onClick={onClick} onMouseEnter={() => onHov(true)} onMouseLeave={() => onHov(false)}
      style={{ padding:'10px 20px', borderRadius:'6px', fontWeight:'700', cursor:'pointer', border:'none', fontSize:'0.9rem', background:T, color:'#0a0f1e', boxShadow:hov ? `0 0 16px ${T}70` : 'none', transform:hov ? 'scale(1.03)' : 'scale(1)', transition:'all .2s' }}
      className="btn">{label}</button>
  );
}

function HintBtn({ onClick, hov, onHov }) {
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => onHov(true)} onMouseLeave={() => onHov(false)}
      style={{ padding:'10px 18px', borderRadius:'6px', fontWeight:'600', cursor:'pointer', fontSize:'0.9rem', background:C2, border:`1px solid ${hov ? YELLOW : C3}`, color:hov ? YELLOW : BODY, transition:'all .2s' }}
      className="btn">💡 Hint</button>
  );
}

const inputStyle = { flex:'1', minWidth:'200px', padding:'10px 14px', borderRadius:'6px', border:`1px solid ${C3}`, background:C2, color:BRIGHT, fontSize:'0.92rem', outline:'none' };
const hintStyle  = { marginTop:'12px', padding:'12px 16px', background:'rgba(234,179,8,.08)', borderLeft:'4px solid #eab308', borderRadius:'0 6px 6px 0', fontSize:'0.88rem', color:'#cbd5e1', lineHeight:'1.65' };
const fbStyle = (s) => ({ marginTop:'10px', padding:'12px 16px', borderRadius:'6px', fontSize:'0.9rem', lineHeight:'1.55', background:s === 'success' ? '#064e3b' : '#7f1d1d', color:s === 'success' ? '#34d399' : '#fca5a5', borderLeft:`5px solid ${s === 'success' ? '#10b981' : '#ef4444'}` });

const Q3_OPTIONS = [
  { id:'collation_bypass',  label:'Username Collation Bypass',      desc:'Register "aDmin" (case-sensitive check), login resolves to "admin" (case-insensitive LOWER())' },
  { id:'sql_injection',     label:'SQL Injection in username field', desc:'Input not sanitized before being used in a SQL query' },
  { id:'weak_password',     label:'Weak password policy',           desc:'Server accepts passwords shorter than 8 characters' },
  { id:'no_logging',        label:'No login event logging',         desc:'System does not record authentication attempts' },
];

const Q4_ANSWER = 'admin@hust.soict.edu.vn';
const Q5_ANSWER = 'ceo';

export default function A07({ onBack }) {
  const [q1Input, setQ1Input] = useState('');
  const [q2Input, setQ2Input] = useState('');
  const [selectedQ3, setSelectedQ3] = useState('');
  const [q4Input, setQ4Input] = useState('');
  const [q5Input, setQ5Input] = useState('');

  const [fb1, setFb1] = useState({ message:'', status:'' });
  const [fb2, setFb2] = useState({ message:'', status:'' });
  const [fb3, setFb3] = useState({ message:'', status:'' });
  const [fb4, setFb4] = useState({ message:'', status:'' });
  const [fb5, setFb5] = useState({ message:'', status:'' });

  const [hint1, setHint1] = useState(false);
  const [hint2, setHint2] = useState(false);
  const [hint3, setHint3] = useState(false);
  const [hint4, setHint4] = useState(false);
  const [hint5, setHint5] = useState(false);

  const [complete, setComplete] = useState(false);
  const [backHov,  setBackHov]  = useState(false);
  const [siteHov,  setSiteHov]  = useState(false);
  const [hovV, setHovV] = useState({ q1:false, q2:false, q3:false, q4:false, q5:false });
  const [hovH, setHovH] = useState({ q1:false, q2:false, q3:false, q4:false, q5:false });
  const [hovQ3, setHovQ3] = useState('');

  const statuses       = [fb1.status, fb2.status, fb3.status, fb4.status, fb5.status];
  const completedCount = statuses.filter(s => s === 'success').length;

  useEffect(() => {
    if (completedCount === TOTAL_QUESTIONS) setTimeout(() => setComplete(true), 400);
  }, [completedCount]);

  const goHome   = () => { if (onBack) onBack(); else window.location.href = '/'; };
  const openSite = () => window.open(`${window.location.origin}${window.location.pathname}?mode=a07_lab`, '_blank');

  const checkQ1 = (e) => {
    e.preventDefault();
    const v = q1Input.trim().toLowerCase();
    if (!v) { setFb1({ message:'⚠️ Please enter an answer.', status:'error' }); return; }
    if (v === 'authentication' || v === 'auth') {
      setFb1({ message:'🎉 Correct! A07 covers systems that fail to properly perform Authentication — allowing attackers to impersonate other users or escalate privileges without knowing their real credentials.', status:'success' });
    } else {
      setFb1({ message:'❌ Not quite. Re-read the Definition section — what mechanism is the system failing to check correctly?', status:'error' });
    }
  };

  const checkQ2 = (e) => {
    e.preventDefault();
    const v = q2Input.trim().toLowerCase();
    if (!v) { setFb2({ message:'⚠️ Please enter an answer.', status:'error' }); return; }
    const keywords = ['normaliz', 'write', 'store', 'lower', 'canon', 'same', 'consistenc', 'collat'];
    if (keywords.some(k => v.includes(k))) {
      setFb2({ message:'🎉 Correct! The Mitigation Strategies section recommends normalizing identifiers at write time — always lowercasing (or applying a canonical form) the username before storing it, so every code path uses the same comparison rule and the gap disappears.', status:'success' });
    } else {
      setFb2({ message:'❌ Not quite. Read the first point in the Mitigation Strategies section — what should be done to the username before it is stored?', status:'error' });
    }
  };

  const checkQ3 = (e) => {
    e.preventDefault();
    if (!selectedQ3) { setFb3({ message:'⚠️ Please select an answer.', status:'error' }); return; }
    if (selectedQ3 === 'collation_bypass') {
      setFb3({ message:'🎉 Correct! The collation bypass is a textbook A07 vulnerability — two code paths (register vs login) apply different string comparison rules to the same identifier, creating a gap that attackers exploit to hijack existing accounts.', status:'success' });
    } else {
      const msgs = {
        sql_injection: '❌ SQL Injection is an A03 (Injection) vulnerability, not A07.',
        weak_password: '❌ Weak password policy is a contributing factor but belongs under A07 only when it enables account takeover directly — here the root cause is identifier confusion.',
        no_logging:    '❌ Missing logs is an A09 (Security Logging Failures) issue — related but not the primary vulnerability here.',
      };
      setFb3({ message: msgs[selectedQ3] || '❌ Incorrect.', status:'error' });
    }
  };

  const checkQ4 = (e) => {
    e.preventDefault();
    const v = q4Input.trim().toLowerCase();
    if (!v) { setFb4({ message:'⚠️ Please enter an email.', status:'error' }); return; }
    if (v === Q4_ANSWER) {
      setFb4({ message:`🎉 Correct! The server exposed admin's email "admin@hust.soict.edu.vn". Even though you only registered a case-variant "aDmin", the login resolved to the real admin account (id=1) — leaking their email, role, and balance without knowing their password.`, status:'success' });
    } else {
      setFb4({ message:'❌ Incorrect. Register a case-variant of "admin" (e.g. "aDmin") with any password, log in, then read the EMAIL card on the dashboard.', status:'error' });
    }
  };

  const checkQ5 = (e) => {
    e.preventDefault();
    const v = q5Input.trim().toLowerCase();
    if (!v) { setFb5({ message:'⚠️ Please enter an answer.', status:'error' }); return; }
    if (v === Q5_ANSWER) {
      setFb5({ message:`🎉 Correct! The server returned role: "ceo". By registering "CeO_Minh" or "CEO_MINH" and logging in, the LOWER() normalisation resolves to the original ceo_minh account — leaking their role, salary, account number, and balance without knowing their real password.`, status:'success' });
    } else {
      setFb5({ message:'❌ Incorrect. Register a case-variant of "ceo_minh" (e.g. "CeO_Minh"), log in with any password, then read the "role" field from the server JSON response.', status:'error' });
    }
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:BG, minHeight:'100vh', color:BODY, boxSizing:'border-box' }}>

      <style>{`
        * { box-sizing:border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes popIn     { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        @keyframes float     { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(4deg)} }
        @keyframes backdropIn{ from{opacity:0} to{opacity:1} }
        @keyframes shimmerPink { 0%{left:-160%} 45%{left:160%} 100%{left:160%} }
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
          transform:skewX(-22deg); animation:shimmerPink 3.8s infinite;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
      `}</style>

      {/* ── COMPLETION MODAL ── */}
      {complete && (
        <div onClick={() => setComplete(false)} style={{ position:'fixed', inset:0, background:'rgba(10,15,30,.9)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, animation:'backdropIn .3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C1, border:`1px solid ${C3}`, borderTop:`3px solid ${T}`, borderRadius:'16px', padding:'40px 36px', textAlign:'center', maxWidth:'440px', width:'92%' }} className="pop-in">
            <div style={{ fontSize:'64px', marginBottom:'12px' }} className="float">🔓</div>
            <h2 style={{ fontSize:'1.9rem', fontWeight:'800', color:T, margin:'0 0 10px' }}>Lab Complete!</h2>
            <p style={{ color:BODY, lineHeight:'1.6', margin:'0 0 18px' }}>
              You've mastered <strong style={{ color:BRIGHT }}>A07: Identification & Authentication Failures</strong> — specifically how identifier confusion and collation mismatches let attackers silently hijack privileged accounts.
            </p>
            <div style={{ background:C2, borderRadius:'8px', padding:'14px 18px', fontSize:'0.85rem', color:BODY, textAlign:'left', lineHeight:'1.9', marginBottom:'20px' }}>
              <div>✓ A07 concept correctly explained</div>
              <div>✓ Register/login collation inconsistency identified</div>
              <div>✓ A07 vulnerability type correctly distinguished</div>
              <div>✓ Admin account hijack demonstrated</div>
              <div>✓ ceo_minh account hijack demonstrated</div>
            </div>
            <button onClick={() => setComplete(false)} style={{ background:T, color:'#0a0f1e', border:'none', borderRadius:'8px', padding:'11px 32px', fontWeight:'700', fontSize:'0.95rem', cursor:'pointer' }} className="btn">
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:`${BG}e8`, backdropFilter:'blur(12px)', borderBottom:`1px solid ${C3}`, padding:'12px 32px', display:'flex', alignItems:'center', gap:'16px' }}>
        <button onClick={goHome}
          onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
          style={{ padding:'7px 16px', borderRadius:'6px', fontSize:'0.88rem', fontWeight:'600', cursor:'pointer', border:`1px solid ${backHov ? T : C3}`, color:backHov ? T : BODY, background:'transparent', transform:backHov ? 'translateX(-3px)' : 'none', transition:'all .2s ease', flexShrink:0 }}
          className="btn">← Back</button>
        <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <ProgressBar completed={completedCount} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:T, boxShadow:`0 0 8px ${T}`, animation:'glowPulse 2s infinite' }} />
          <span style={{ fontSize:'0.8rem', color:MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>OWASP Top 10</span>
          <span style={{ color:C3 }}>·</span>
          <span style={{ fontSize:'0.8rem', fontWeight:'700', color:T }}>A07:2021</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position:'relative', overflow:'hidden', padding:'72px 32px 60px', textAlign:'center', background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${T}12 0%, transparent 70%)` }} className="hero-shimmer">
        <div aria-hidden style={{ position:'absolute', inset:0, overflow:'hidden', opacity:.04, fontFamily:'monospace', fontSize:'0.7rem', lineHeight:'1.4', color:T, userSelect:'none', whiteSpace:'pre-wrap', padding:'10px', pointerEvents:'none' }}>
          {Array(12).fill('REGISTER aDmin COLLATE CS → pass  LOGIN LOWER(aDmin)=LOWER(admin) → id=1  role=admin  session_hijack  username_confusion  collation_mismatch  ceo_minh → CeO_Minh  A07  ').join('\n')}
        </div>
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:`${T}18`, border:`1px solid ${T}40`, borderRadius:'20px', padding:'5px 16px', marginBottom:'24px' }}>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:T, textTransform:'uppercase', letterSpacing:'2px' }}>A07:2021 · OWASP Top 10</span>
          </div>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.4rem)', fontWeight:'800', color:BRIGHT, margin:'0 0 16px', lineHeight:'1.15', letterSpacing:'-1px' }}>
            Identification &amp;<br /><span style={{ color:T }}>Authentication Failures</span>
          </h1>
          <p style={{ fontSize:'1.1rem', color:BODY, maxWidth:'580px', margin:'0 auto 40px', lineHeight:'1.7' }}>
            When systems use different rules to <em>register</em> and <em>verify</em> identity, an attacker can register a look-alike username and silently inherit another user's account — no password cracking required.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'16px', maxWidth:'720px', margin:'0 auto' }}>
            <StatCard value={80}  suffix="%" label="Data breaches involving weak/broken authentication" delay={0} />
            <StatCard value={7}   suffix="th" label="OWASP 2021 rank — previously #2 in 2017" delay={100} />
            <StatCard value={2}   suffix=""   label="SQL collation rules that create the vulnerability" delay={200} />
            <StatCard value={3}   suffix=""   label="Main attack types: spoofing, stuffing, session" delay={300} />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth:'960px', margin:'0 auto', padding:'48px 24px 80px' }}>

        {/* SECTION 1: Definition */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Definition" title="What are Authentication Failures?" id="definition" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
            <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
              <p style={{ margin:'0 0 14px', lineHeight:'1.75', fontSize:'0.95rem' }}>
                <strong style={{ color:BRIGHT }}>A07:2021 – Identification and Authentication Failures</strong> occurs when a system fails to properly perform <strong style={{ color:T }}>Authentication</strong>, allowing attackers to impersonate other users, gain unauthorized access, or escalate privileges.
              </p>
              <p style={{ margin:0, lineHeight:'1.75', fontSize:'0.95rem' }}>
                These failures include: inconsistent identifier handling, storing passwords in plain text, overly detailed error messages (verbose errors), insecure session management, and not enforcing MFA.
              </p>
            </div>

            {/* ── Signs list — fixed alignment ── */}
            <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px', textAlign:'left' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:'700', color:T, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'16px' }}>Signs of an A07 Vulnerability</div>
              {[
                'Register and login use different collation / case rules for usernames?',
                'Passwords stored as plain text or weak hash (MD5)?',
                'Error messages reveal "user does not exist" or "wrong password"?',
                'Session tokens not invalidated after logout?',
                'MFA not required for privileged accounts?',
              ].map((q, i) => (
                <div key={i} style={{ display:'flex', gap:'12px', marginBottom: i < 4 ? '12px' : 0, fontSize:'0.88rem', lineHeight:'1.55', alignItems:'flex-start', textAlign:'left' }}>
                  <span style={{ color:T, fontWeight:'700', flexShrink:0, minWidth:'20px', textAlign:'right' }}>{i + 1}.</span>
                  <span style={{ color:BODY, flex:1 }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Core Concept */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Core Concept" title="Identifier Confusion & Collation Mismatch" id="concept" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'24px' }}>

            {/* Three Main Attack Types — chỉ dùng T (hồng) */}
            <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:'1.05rem', fontWeight:'700', color:BRIGHT }}>Three Main Attack Types</h3>
              {[
                { label:'Username Spoofing',   val:'Register "aDmin" (CS check passes), login resolves to "admin" via LOWER() — inheriting the privileged account' },
                { label:'Credential Stuffing', val:'Using leaked user/pass lists from other breaches to try on new systems' },
                { label:'Session Hijacking',   val:'Stealing session tokens via XSS, MITM, or non-expiring tokens' },
              ].map(r => (
                <div key={r.label} style={{ display:'flex', gap:'14px', alignItems:'flex-start', padding:'12px 14px', background:C2, borderRadius:'6px', border:`1px solid ${C3}`, marginBottom:'10px' }}>
                  <span style={{ fontSize:'0.82rem', fontWeight:'700', color:T, flexShrink:0, minWidth:'130px' }}>{r.label}</span>
                  <span style={{ fontFamily:'monospace', fontSize:'0.78rem', color:BODY, lineHeight:'1.55' }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Why Collation Mismatch — code block dùng T + YELLOW thôi */}
            <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:'1.05rem', fontWeight:'700', color:BRIGHT }}>Why Collation Mismatch Is Dangerous</h3>
              <p style={{ margin:'0 0 14px', fontSize:'0.9rem', lineHeight:'1.7' }}>
                When registration enforces <strong style={{ color:BRIGHT }}>case-sensitive</strong> uniqueness (so <code style={{ background:C2, padding:'1px 5px', borderRadius:'3px', color:YELLOW }}>aDmin ≠ admin</code>) but login uses <strong style={{ color:BRIGHT }}>case-insensitive</strong> lookup (<code style={{ background:C2, padding:'1px 5px', borderRadius:'3px', color:YELLOW }}>LOWER(aDmin) = LOWER(admin)</code>), an attacker can register a variant and inherit the real account.
              </p>
              <div style={{ background:C2, borderRadius:'8px', padding:'14px', fontFamily:'monospace', fontSize:'0.78rem', lineHeight:'1.9', border:`1px solid ${C3}` }}>
                <div><span style={{ color:T }}>REGISTER</span> <span style={{ color:YELLOW }}>"aDmin"</span> <span style={{ color:MUTED }}>→ CS check: aDmin ≠ admin ✓ allowed</span></div>
                <div><span style={{ color:T }}>LOGIN    </span> <span style={{ color:YELLOW }}>"aDmin"</span> <span style={{ color:MUTED }}>→ LOWER() → resolves to admin (id=1)</span></div>
                <div style={{ marginTop:'6px', color:'#fca5a5' }}>⚠ Attacker now has admin session</div>
              </div>
            </div>
          </div>

          {/* Vulnerable vs Secure — chỉ dùng T + GREEN */}
          <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
            <h3 style={{ margin:'0 0 20px', fontSize:'1.05rem', fontWeight:'700', color:BRIGHT }}>Vulnerable vs Secure — Username Handling</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:'700', color:T, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px' }}>❌ Vulnerable</div>
                <div style={{ background:C2, borderRadius:'8px', padding:'16px', fontFamily:'monospace', fontSize:'0.78rem', lineHeight:'2', border:`1px solid ${T}30` }}>
                  <div><span style={{ color:MUTED }}># Register: case-sensitive</span></div>
                  <div><span style={{ color:BODY }}>WHERE username COLLATE CS = ?</span></div>
                  <div><span style={{ color:MUTED }}># Login: case-insensitive</span></div>
                  <div><span style={{ color:T }}>WHERE LOWER(username) = LOWER(?)</span></div>
                  <div><span style={{ color:MUTED }}># → two different rules, one identifier</span></div>
                </div>
              </div>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:'700', color:GREEN, marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px' }}>✓ Secure</div>
                <div style={{ background:C2, borderRadius:'8px', padding:'16px', fontFamily:'monospace', fontSize:'0.78rem', lineHeight:'2', border:`1px solid ${GREEN}30` }}>
                  <div><span style={{ color:MUTED }}># Normalize on write</span></div>
                  <div><span style={{ color:GREEN }}>username = username.lower().strip()</span></div>
                  <div><span style={{ color:MUTED }}># Same rule everywhere</span></div>
                  <div><span style={{ color:BODY }}>WHERE username = ?  -- always CI</span></div>
                  <div><span style={{ color:MUTED }}># No ambiguity at any code path</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Attack Chain */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Attack Patterns" title="Username Spoofing — Step by Step" id="scenarios" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'16px', marginBottom:'24px' }}>
            {[
              { icon:'🔍', title:'Reconnaissance',         text:'Identify existing privileged usernames — "admin", "ceo_minh" — from verbose errors, public pages, or source code.' },
              { icon:'✏️', title:'Craft Lookalike',        text:'Register a case-variant: "aDmin", "CeO_Minh". The server\'s case-sensitive register check sees them as new — account is created successfully.' },
              { icon:'🔑', title:'Login & Resolve',        text:'Log in with the spoofed username. The server\'s LOWER() normalization maps it to the original account and opens a session as that user.' },
              { icon:'📦', title:'Harvest Privileged Data', text:'The JSON response returns the real account\'s role, email, salary, account number, and balance — no password cracking needed.' },
            ].map(s => (
              <div key={s.title} style={{ background:C1, border:`1px solid ${C3}`, borderTop:`3px solid ${T}`, borderRadius:'10px', padding:'22px' }}>
                <div style={{ fontSize:'1.6rem', marginBottom:'12px' }}>{s.icon}</div>
                <div style={{ fontWeight:'700', color:BRIGHT, fontSize:'0.95rem', marginBottom:'10px' }}>{s.title}</div>
                <p style={{ margin:0, fontSize:'0.85rem', color:BODY, lineHeight:'1.65' }}>{s.text}</p>
              </div>
            ))}
          </div>
          <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', padding:'28px' }}>
            <div style={{ fontSize:'0.72rem', fontWeight:'700', color:MUTED, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'20px' }}>Full Attack Chain</div>
            <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap' }}>
              {[
                { step:'01', label:'Find Target',       sub:'Discover privileged username' },
                { step:'02', label:'Spoof Register',    sub:'"aDmin" passes CS uniqueness check' },
                { step:'03', label:'Login Resolve',     sub:'LOWER() maps to real admin (id=1)' },
                { step:'04', label:'Data Exfiltration', sub:'Role, salary, balance exposed in JSON' },
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

        {/* SECTION 4: Defense */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Defense" title="Mitigation Strategies" id="mitigation" />
          <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', overflow:'hidden' }}>
            <TimelineStep icon="🗂️" accent={GREEN} title="Normalize identifiers at write time"
              text="Always lowercase (or apply a canonical form) the username before storing it — never after. If every username is stored as lowercase, register and login will always use the same comparison rule and there is no gap to exploit." />
            <TimelineStep icon="🔒" accent="#3b82f6" title="Use the same collation everywhere"
              text="If you must keep mixed-case usernames, use the same SQL collation (CI or CS) in every query that touches the username column — registration, login, /me, password reset. Mixing CS and CI in different queries is the root cause of this vulnerability." />
            <TimelineStep icon="📱" accent="#8b5cf6" title="Multi-Factor Authentication (MFA)"
              text="Even if an attacker registers a spoofed username, MFA on the target account prevents them from completing login — because they would need the second factor belonging to the real account owner." />
            <TimelineStep icon="🚫" accent="#f97316" title="Generic Error Messages"
              text='Always return "Invalid credentials" — never reveal whether a username exists or if only the password was wrong. This prevents reconnaissance of valid usernames that attackers need to craft spoofed variants.' />
          </div>
        </section>

        {/* SECTION 5: Case Studies */}
        <section style={{ marginBottom:'64px' }} className="fade-up">
          <SectionHead label="Case Studies" title="Real-World Authentication Failures" id="examples" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'16px' }}>
            {[
              { year:'2012', org:'LinkedIn',  icon:'💼', count:'117M',  desc:'6.5M unsalted SHA-1 hashes leaked. In 2016, an additional 117M accounts were cracked due to weak hashing — no bcrypt or salting.' },
              { year:'2019', org:'Facebook',  icon:'📘', count:'600M',  desc:'600 million passwords stored in plain text in internal log systems. Employees could read passwords directly without cracking.' },
              { year:'2020', org:'Zoom',      icon:'📹', count:'500K',  desc:'Credential stuffing attack: a list of 500K user/pass pairs from other breaches was used to log into Zoom. Successful due to no rate-limiting or MFA.' },
              { year:'2023', org:'23andMe',   icon:'🧬', count:'6.9M',  desc:'Credential stuffing compromised root accounts, then the DNA Relatives feature was exploited to harvest data from 6.9M related users.' },
            ].map(c => (
              <div key={c.org} style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'10px', padding:'22px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ fontSize:'1.3rem' }}>{c.icon}</span>
                    <span style={{ fontWeight:'800', color:BRIGHT, fontSize:'1rem' }}>{c.org}</span>
                  </div>
                  <span style={{ fontSize:'0.72rem', color:MUTED, background:C2, padding:'3px 8px', borderRadius:'4px' }}>{c.year}</span>
                </div>
                <div style={{ fontFamily:'monospace', fontSize:'1.2rem', fontWeight:'800', color:T, marginBottom:'10px' }}>{c.count} accounts</div>
                <p style={{ margin:0, fontSize:'0.85rem', color:BODY, lineHeight:'1.65' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Challenge */}
        <section className="fade-up">
          <SectionHead label="Lab" title="Interactive Challenge: Username Spoofing Attack" id="challenge" />

          <div style={{ background:C1, border:`1px solid ${C3}`, borderRadius:'12px', overflow:'hidden' }}>
            <div style={{ background:C2, borderBottom:`1px solid ${C3}`, padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:GREEN, boxShadow:`0 0 6px ${GREEN}` }} />
                <span style={{ fontSize:'0.8rem', fontWeight:'700', color:BRIGHT }}>Security Lab · A07 — Authentication Failures</span>
              </div>
              <button onClick={openSite}
                onMouseEnter={() => setSiteHov(true)} onMouseLeave={() => setSiteHov(false)}
                style={{ position:'relative', overflow:'hidden', padding:'9px 22px', borderRadius:'6px', border:'none', background:siteHov ? '#ff5aab' : T, color:'#0a0f1e', fontWeight:'700', fontSize:'0.88rem', cursor:'pointer', boxShadow:siteHov ? `0 0 20px ${T}80` : `0 4px 12px ${T}40`, transform:siteHov ? 'scale(1.03)' : 'scale(1)', transition:'all .22s ease', display:'flex', alignItems:'center', gap:'8px' }}
                className="btn view-btn">
                🌐 View Site
              </button>
            </div>

            <div style={{ padding:'32px 28px' }}>
              <p style={{ margin:'0 0 28px', fontSize:'0.95rem', color:BODY, lineHeight:'1.7' }}>
                The lab's register endpoint uses a <strong style={{ color:BRIGHT }}>case-sensitive collation</strong> to check uniqueness, but the login endpoint uses <strong style={{ color:BRIGHT }}>LOWER()</strong> to match usernames.
                This mismatch lets you register a look-alike username and inherit any existing account.
              </p>

              {/* Q1 */}
              <QuestionBlock num={1} solved={fb1.status === 'success'}
                label={<>According to the Definition section, A07 occurs when a system fails to properly implement which mechanism? <span style={{ color:MUTED, fontWeight:'400' }}>(1 word)</span></>}>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <input type="text" placeholder="Enter the answer…" value={q1Input} onChange={e => setQ1Input(e.target.value)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ1} hov={hovV.q1} onHov={v => setHovV(p => ({ ...p, q1:v }))} />
                  <HintBtn onClick={() => setHint1(!hint1)} hov={hovH.q1} onHov={v => setHovH(p => ({ ...p, q1:v }))} />
                </div>
                {hint1 && <div style={hintStyle} className="slide-in"><strong style={{ color:YELLOW }}>Hint:</strong> Read the first sentence of the Definition section. The bold pink word starting with "A" is the answer.</div>}
                {fb1.message && <div style={fbStyle(fb1.status)} className="slide-in">{fb1.message}</div>}
              </QuestionBlock>

              {/* Q2 */}
              <QuestionBlock num={2} solved={fb2.status === 'success'}
                label={<>According to the <strong style={{ color:BRIGHT }}>Mitigation Strategies</strong> section, what should be done to a username <em>before storing it</em> to prevent this type of attack? <span style={{ color:MUTED, fontWeight:'400' }}>(1 word)</span></>}>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <input type="text" placeholder="e.g., normalize at …" value={q2Input} onChange={e => setQ2Input(e.target.value)} style={inputStyle} />
                  <VerifyBtn onClick={checkQ2} hov={hovV.q2} onHov={v => setHovV(p => ({ ...p, q2:v }))} />
                  <HintBtn onClick={() => setHint2(!hint2)} hov={hovH.q2} onHov={v => setHovH(p => ({ ...p, q2:v }))} />
                </div>
                {hint2 && <div style={hintStyle} className="slide-in"><strong style={{ color:YELLOW }}>Hint:</strong> Scroll to the Mitigation Strategies section and read the first point — it explains what transformation to apply to the username at write time so that every code path uses the same rule.</div>}
                {fb2.message && <div style={fbStyle(fb2.status)} className="slide-in">{fb2.message}</div>}
              </QuestionBlock>

              {/* Q3 */}
              <QuestionBlock num={3} solved={fb3.status === 'success'}
                label={<>Which of the following is a <strong style={{ color:T }}>direct</strong> example of A07 Identification & Authentication Failures as demonstrated in this lab?</>}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'12px', marginBottom:'14px' }}>
                  {Q3_OPTIONS.map(opt => {
                    const sel = selectedQ3 === opt.id;
                    const hov = hovQ3 === opt.id;
                    return (
                      <div key={opt.id} onClick={() => setSelectedQ3(opt.id)}
                        onMouseEnter={() => setHovQ3(opt.id)} onMouseLeave={() => setHovQ3('')}
                        style={{ padding:'14px 16px', borderRadius:'8px', cursor:'pointer', border:sel ? `2px solid ${T}` : hov ? `2px solid ${T}60` : `2px solid ${C3}`, background:sel ? `${T}12` : C2, transition:'all .2s ease' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                          <div style={{ width:'15px', height:'15px', borderRadius:'50%', border:`2px solid ${sel ? T : '#475569'}`, background:sel ? T : 'transparent', flexShrink:0, transition:'all .2s' }} />
                          <span style={{ fontWeight:'700', fontSize:'0.88rem', color:sel ? T : BRIGHT }}>{opt.label}</span>
                        </div>
                        <p style={{ margin:0, fontSize:'0.78rem', color:MUTED, lineHeight:'1.4' }}>{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <VerifyBtn label="Submit Answer" onClick={checkQ3} hov={hovV.q3} onHov={v => setHovV(p => ({ ...p, q3:v }))} />
                  <HintBtn onClick={() => setHint3(!hint3)} hov={hovH.q3} onHov={v => setHovH(p => ({ ...p, q3:v }))} />
                </div>
                {hint3 && <div style={hintStyle} className="slide-in"><strong style={{ color:YELLOW }}>Hint:</strong> The other options belong to A03 and A09. Which one describes the gap between how the server registers vs authenticates a username?</div>}
                {fb3.message && <div style={fbStyle(fb3.status)} className="slide-in">{fb3.message}</div>}
              </QuestionBlock>

              {/* Q4 */}
              <QuestionBlock num={4} solved={fb4.status === 'success'}
                label={<>On the lab site, register a case-variant of <code style={{ background:C2, padding:'2px 6px', borderRadius:'4px', color:YELLOW, fontSize:'0.9em' }}>admin</code> (e.g. <code style={{ background:C2, padding:'2px 6px', borderRadius:'4px', color:YELLOW, fontSize:'0.9em' }}>aDmin</code>) with any password, then log in. What is the <strong style={{ color:T }}>email</strong> shown on the dashboard?</>}>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <input type="text" placeholder="Enter the email address…" value={q4Input} onChange={e => setQ4Input(e.target.value)} style={{ ...inputStyle, fontFamily:'monospace' }} />
                  <VerifyBtn onClick={checkQ4} hov={hovV.q4} onHov={v => setHovV(p => ({ ...p, q4:v }))} />
                  <HintBtn onClick={() => setHint4(!hint4)} hov={hovH.q4} onHov={v => setHovH(p => ({ ...p, q4:v }))} />
                </div>
                {hint4 && <div style={hintStyle} className="slide-in"><strong style={{ color:YELLOW }}>Hint:</strong> Register a higher-case variant of "admin" (e.g. <code style={{ background:C2, padding:'1px 6px', borderRadius:'4px', color:YELLOW, fontFamily:'monospace' }}>aDmin</code>) with any password you choose, then log in with that same account. The dashboard will display the real admin's EMAIL card — that is the answer.</div>}
                {fb4.message && <div style={fbStyle(fb4.status)} className="slide-in">{fb4.message}</div>}
              </QuestionBlock>

              {/* Q5 */}
              <QuestionBlock num={5} solved={fb5.status === 'success'}
                label={<>Now register a case-variant of <code style={{ background:C2, padding:'2px 6px', borderRadius:'4px', color:YELLOW, fontSize:'0.9em' }}>ceo_minh</code> (e.g. <code style={{ background:C2, padding:'2px 6px', borderRadius:'4px', color:YELLOW, fontSize:'0.9em' }}>CeO_Minh</code>) and log in. What <strong style={{ color:T }}>role</strong> does the server return for that account?</>}>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <input type="text" placeholder="Enter the role value…" value={q5Input} onChange={e => setQ5Input(e.target.value)} style={{ ...inputStyle, fontFamily:'monospace' }} />
                  <VerifyBtn onClick={checkQ5} hov={hovV.q5} onHov={v => setHovV(p => ({ ...p, q5:v }))} />
                  <HintBtn onClick={() => setHint5(!hint5)} hov={hovH.q5} onHov={v => setHovH(p => ({ ...p, q5:v }))} />
                </div>
                {hint5 && <div style={hintStyle} className="slide-in"><strong style={{ color:YELLOW }}>Hint:</strong> Register a higher-case variant of "ceo_minh" (e.g. <code style={{ background:C2, padding:'1px 6px', borderRadius:'4px', color:YELLOW, fontFamily:'monospace' }}>CeO_Minh</code>) with any password, then log in with that same account. The dashboard will resolve to the real ceo_minh account — read the ROLE card to get the answer.</div>}
                {fb5.message && <div style={fbStyle(fb5.status)} className="slide-in">{fb5.message}</div>}
              </QuestionBlock>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}