import React, { useState, useEffect } from 'react';

// ── Design tokens ─────────────────────────────────────────────────────────────
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

// ── Shared input / label styles ───────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '7px',
  border: `1px solid ${C3}`,
  background: C2,
  color: BRIGHT,
  fontSize: '0.93rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .2s, box-shadow .2s',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const labelStyle = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: '600',
  color: BODY,
  marginBottom: '6px',
  letterSpacing: '0.3px',
};

const cardStyle = {
  background: C1,
  border: `1px solid ${C3}`,
  borderRadius: '16px',
  padding: '36px 32px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 32px 80px rgba(0,0,0,.6)',
  position: 'relative',
  overflow: 'hidden',
};

// ── Animated lock icon SVG ────────────────────────────────────────────────────
function LockIcon({ size = 36, color = T }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display:'block' }}>
      <rect x="7" y="16" width="22" height="15" rx="3" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.8"/>
      <path d="M12 16v-4a6 6 0 1 1 12 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="18" cy="23" r="2.2" fill={color}/>
      <line x1="18" y1="25" x2="18" y2="28" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// ── Bank logo mark ────────────────────────────────────────────────────────────
function BankMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="5" fill={T} fillOpacity="0.15"/>
      <path d="M4 14h12M10 5l6 4H4l6-4z" stroke={T} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      <rect x="5" y="9" width="2" height="5" rx="0.5" fill={T}/>
      <rect x="9" y="9" width="2" height="5" rx="0.5" fill={T}/>
      <rect x="13" y="9" width="2" height="5" rx="0.5" fill={T}/>
    </svg>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, autoComplete, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position:'relative' }}>
        {icon && (
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem', opacity:0.5, pointerEvents:'none' }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            borderColor: focused ? T : C3,
            boxShadow: focused ? `0 0 0 3px ${T}18` : 'none',
            paddingLeft: icon ? '38px' : '14px',
          }}
        />
      </div>
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
function Alert({ msg, status }) {
  if (!msg) return null;
  const isOk = status === 'success';
  return (
    <div style={{
      padding: '11px 14px',
      borderRadius: '8px',
      fontSize: '0.88rem',
      lineHeight: '1.55',
      marginBottom: '18px',
      background: isOk ? '#064e3b' : '#7f1d1d',
      color: isOk ? '#34d399' : '#fca5a5',
      borderLeft: `4px solid ${isOk ? GREEN : '#ef4444'}`,
      animation: 'fadeSlideIn .25s cubic-bezier(.16,1,.3,1) both',
    }}>{msg}</div>
  );
}

// ── Primary button ────────────────────────────────────────────────────────────
function PrimaryBtn({ onClick, loading, label, loadingLabel }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={loading}
      style={{
        width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
        background: loading ? MUTED : hov ? '#e01b79' : T,
        color: '#fff', fontWeight: '800', fontSize: '1rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all .2s',
        boxShadow: hov && !loading ? `0 6px 24px ${T}50` : 'none',
        transform: hov && !loading ? 'translateY(-1px)' : 'none',
        letterSpacing: '0.3px',
        position: 'relative', overflow: 'hidden',
      }}>
      {hov && !loading && (
        <span style={{
          position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)',
          animation:'btnShimmer .6s linear',
          pointerEvents:'none',
        }}/>
      )}
      {loading ? loadingLabel : label}
    </button>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'20px 0' }}>
      <div style={{ flex:1, height:'1px', background:C3 }}/>
      <span style={{ fontSize:'0.72rem', color:MUTED, letterSpacing:'1px' }}>BANK.THM</span>
      <div style={{ flex:1, height:'1px', background:C3 }}/>
    </div>
  );
}

// ── Page header (shared) ──────────────────────────────────────────────────────
function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom:'28px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'6px' }}>
        <div style={{
          width:'46px', height:'46px', borderRadius:'12px',
          background:`${T}18`, border:`1.5px solid ${T}50`,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:`0 0 20px ${T}20`,
          flexShrink:0,
        }}>
          <LockIcon size={22} color={T}/>
        </div>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <BankMark size={16}/>
            <span style={{ fontSize:'0.72rem', fontWeight:'700', color:MUTED, textTransform:'uppercase', letterSpacing:'1.5px' }}>
              Secure Banking
            </span>
          </div>
          <div style={{ fontSize:'1.25rem', fontWeight:'800', color:BRIGHT, letterSpacing:'-0.4px', lineHeight:'1.2', marginTop:'2px' }}>
            {title}
          </div>
        </div>
      </div>
      {subtitle && (
        <p style={{ margin:'10px 0 0', fontSize:'0.83rem', color:MUTED, lineHeight:'1.55', textAlign:'center' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Login page ────────────────────────────────────────────────────────────────
function LoginPage({ onLoginSuccess, onGoRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fb, setFb] = useState({ msg: '', status: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setFb({ msg: '⚠️ Please enter both username and password.', status: 'error' });
      return;
    }
    setLoading(true);
    setFb({ msg: '', status: '' });
    try {
      const res = await fetch('http://localhost:5000/api/a07/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setFb({ msg: '✅ Login successful! Redirecting…', status: 'success' });
        setTimeout(() => onLoginSuccess(data.user), 600);
      } else {
        setFb({ msg: `❌ ${data.error || 'Invalid credentials'}`, status: 'error' });
      }
    } catch {
      setFb({ msg: '❌ Cannot reach server. Is Flask running?', status: 'error' });
    }
    setLoading(false);
  };

  return (
    <div style={cardStyle} className="page-enter">
      <PageHeader
        title="Sign in to Bank.THM"
        subtitle="Enter your credentials to access your account securely."
      />
      <Alert msg={fb.msg} status={fb.status} />
      <Field label="Username" icon="👤" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" autoComplete="username" />
      <Field label="Password" type="password" icon="🔒" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
      <PrimaryBtn onClick={handleLogin} loading={loading} label="Sign In" loadingLabel="Signing in…"/>
      <Divider/>
      <p style={{ textAlign:'center', fontSize:'0.87rem', color:MUTED, margin:0 }}>
        Don't have an account?{' '}
        <span onClick={onGoRegister} className="link-hover">
          Create one
        </span>
      </p>
    </div>
  );
}

// ── Register page ─────────────────────────────────────────────────────────────
function RegisterPage({ onGoLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [fb, setFb] = useState({ msg: '', status: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password || !confirm) {
      setFb({ msg: '⚠️ All fields are required.', status: 'error' });
      return;
    }
    if (password !== confirm) {
      setFb({ msg: '❌ Passwords do not match.', status: 'error' });
      return;
    }
    setLoading(true);
    setFb({ msg: '', status: '' });
    try {
      const res = await fetch('http://localhost:5000/api/a07/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, confirm_password: confirm }),
      });
      const data = await res.json();
      if (res.ok) {
        setFb({ msg: '✅ Account created! You can now log in.', status: 'success' });
        setUsername(''); setPassword(''); setConfirm('');
      } else {
        setFb({ msg: `❌ ${data.error || 'Registration failed'}`, status: 'error' });
      }
    } catch {
      setFb({ msg: '❌ Cannot reach server. Is Flask running?', status: 'error' });
    }
    setLoading(false);
  };

  return (
    <div style={cardStyle} className="page-enter">
      <PageHeader
        title="Create Account"
        subtitle="Register a new Bank.THM account. Choose a unique username."
      />
      <Alert msg={fb.msg} status={fb.status} />
      <Field label="Username" icon="👤" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" autoComplete="username" />
      <Field label="Password" type="password" icon="🔒" value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a password" autoComplete="new-password" />
      <Field label="Confirm Password" type="password" icon="✅" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" />
      <PrimaryBtn onClick={handleRegister} loading={loading} label="Create Account" loadingLabel="Creating…"/>
      <Divider/>
      <p style={{ textAlign:'center', fontSize:'0.87rem', color:MUTED, margin:0 }}>
        Already have an account?{' '}
        <span onClick={onGoLogin} className="link-hover">
          Sign in
        </span>
      </p>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [logoutHov, setLogoutHov] = useState(false);
  const [revealed,  setRevealed]  = useState(false);

  const roleColor = { admin: '#ef4444', ceo: T, user: GREEN }[user.role] || BODY;

  const handleLogout = async () => {
    try { await fetch('http://localhost:5000/api/a07/logout', { method: 'POST', credentials: 'include' }); }
    catch { /* ignore */ }
    onLogout();
  };

  useEffect(() => { const t = setTimeout(() => setRevealed(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ ...cardStyle, maxWidth:'520px' }} className="page-enter">
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:GREEN, boxShadow:`0 0 8px ${GREEN}`, animation:'pulse 2s infinite' }}/>
          <BankMark size={16}/>
          <span style={{ fontSize:'0.75rem', fontWeight:'700', color:MUTED, textTransform:'uppercase', letterSpacing:'1.5px' }}>Bank.THM</span>
        </div>
        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHov(true)}
          onMouseLeave={() => setLogoutHov(false)}
          style={{
            padding:'6px 14px', borderRadius:'6px',
            border:`1px solid ${logoutHov ? '#ef4444' : C3}`,
            background: logoutHov ? '#ef444418' : 'transparent',
            color: logoutHov ? '#ef4444' : MUTED,
            fontSize:'0.82rem', fontWeight:'600', cursor:'pointer', transition:'all .2s',
          }}>
          ← Logout
        </button>
      </div>

      {/* Avatar + name */}
      <div style={{ textAlign:'center', marginBottom:'28px' }}>
        <div style={{
          width:'76px', height:'76px', borderRadius:'50%',
          background:`${roleColor}18`,
          border:`2px solid ${roleColor}50`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'2rem', margin:'0 auto 14px',
          boxShadow:`0 0 32px ${roleColor}25`,
          transition:'box-shadow .4s',
        }}>
          {user.role === 'admin' ? '🛡️' : user.role === 'ceo' ? '👔' : '👤'}
        </div>
        <div style={{ fontSize:'1.5rem', fontWeight:'800', color:BRIGHT, letterSpacing:'-0.5px' }}>
          {user.username}
        </div>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          marginTop:'8px', padding:'4px 14px', borderRadius:'20px',
          background:`${roleColor}18`, border:`1px solid ${roleColor}40`,
          fontSize:'0.72rem', fontWeight:'700', color:roleColor,
          textTransform:'uppercase', letterSpacing:'1.5px',
        }}>
          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:roleColor, display:'inline-block' }}/>
          {user.role}
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
        <InfoCard icon="📧" label="Email"   value={user.email} mono revealed={revealed} delay={0}/>
        <InfoCard icon="💰" label="Balance" value={`$${user.balance?.toLocaleString('en-US', { minimumFractionDigits:2 })}`} highlight revealed={revealed} delay={80}/>
        <InfoCard icon="🆔" label="User ID" value={`#${user.id}`} mono revealed={revealed} delay={160}/>
        <InfoCard icon="🔑" label="Role"    value={user.role} roleColor={roleColor} revealed={revealed} delay={240}/>
      </div>

      {/* A07 notice */}
      <div style={{
        padding:'14px 16px', borderRadius:'10px',
        background:`${T}10`, border:`1px solid ${T}30`,
        borderLeft:`4px solid ${T}`,
        fontSize:'0.83rem', color:BODY, lineHeight:'1.7',
      }}>
        <span style={{ color:T, fontWeight:'700' }}>⚠️ A07 Demonstrated: </span>
        Logged in as <strong style={{ color:BRIGHT }}>{user.username}</strong>. If you registered with a spoofed
        variant (e.g.{' '}
        <code style={{ background:C2, padding:'1px 5px', borderRadius:'3px', color:YELLOW }}>aDmin</code>
        ), the server resolved it to the original account — this is an{' '}
        <strong style={{ color:T }}>Identification & Authentication Failure (OWASP A07)</strong>.
      </div>
    </div>
  );
}

// ── Info card with stagger reveal ─────────────────────────────────────────────
function InfoCard({ icon, label, value, mono, highlight, roleColor, revealed, delay }) {
  return (
    <div style={{
      background:C2, border:`1px solid ${C3}`, borderRadius:'10px', padding:'14px',
      overflow:'hidden',
      opacity: revealed ? 1 : 0,
      transform: revealed ? 'none' : 'translateY(8px)',
      transition: `opacity .4s ${delay}ms, transform .4s ${delay}ms cubic-bezier(.16,1,.3,1)`,
    }}>
      <div style={{ fontSize:'0.7rem', fontWeight:'700', color:MUTED, textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:'6px' }}>
        {icon} {label}
      </div>
      <div style={{
        fontSize: mono ? '0.82rem' : '0.95rem',
        fontWeight:'700',
        color: highlight ? GREEN : roleColor || BRIGHT,
        fontFamily: mono ? "'JetBrains Mono','Fira Code',monospace" : 'inherit',
        wordBreak:'break-all', lineHeight:'1.4',
      }}>
        {value}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function A07Page() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => { setUser(userData); setView('dashboard'); };
  const handleLogout       = ()          => { setUser(null);     setView('login');     };

  return (
    <div style={{
      fontFamily:"'Segoe UI', system-ui, sans-serif",
      background: BG,
      minHeight:'100vh',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'24px 16px', boxSizing:'border-box',
      position:'relative', overflow:'hidden',
    }}>
      <style>{`
        * { box-sizing:border-box; }
        input::placeholder { color:${MUTED}; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes pulse {
          0%,100% { box-shadow:0 0 6px ${GREEN}80; }
          50%      { box-shadow:0 0 14px ${GREEN}; }
        }
        @keyframes btnShimmer {
          from { transform:translateX(-100%); }
          to   { transform:translateX(200%); }
        }
        @keyframes bgPulse {
          0%,100% { opacity:.6; transform:translateX(-50%) scale(1); }
          50%      { opacity:1;  transform:translateX(-50%) scale(1.08); }
        }
        .page-enter { animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both; }

        .link-hover {
          color:${T};
          font-weight:700;
          cursor:pointer;
          text-decoration:underline;
          text-underline-offset:2px;
          transition:color .2s, opacity .2s;
        }
        .link-hover:hover {
          color:#e01b79;
          opacity:0.85;
        }
      `}</style>

      {/* Ambient glow */}
      <div aria-hidden style={{
        position:'fixed', top:'8%', left:'50%', transform:'translateX(-50%)',
        width:'700px', height:'340px', borderRadius:'50%',
        background:`radial-gradient(ellipse, ${T}14 0%, transparent 68%)`,
        pointerEvents:'none', zIndex:0,
        animation:'bgPulse 6s ease-in-out infinite',
      }}/>
      <div aria-hidden style={{
        position:'fixed', bottom:'-10%', right:'-10%',
        width:'400px', height:'400px', borderRadius:'50%',
        background:`radial-gradient(ellipse, #3b82f610 0%, transparent 70%)`,
        pointerEvents:'none', zIndex:0,
      }}/>

      {/* Top badge */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'28px', zIndex:1 }}>
        <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:T, boxShadow:`0 0 8px ${T}`, animation:'pulse 2s infinite' }}/>
        <span style={{ fontSize:'0.7rem', fontWeight:'700', color:MUTED, textTransform:'uppercase', letterSpacing:'2px' }}>OWASP Top 10</span>
        <span style={{ color:C3, fontSize:'1rem' }}>·</span>
        <span style={{ fontSize:'0.7rem', fontWeight:'700', color:T }}>A07:2021 Lab</span>
      </div>

      {/* Page content */}
      <div style={{ position:'relative', zIndex:1, width:'100%', display:'flex', justifyContent:'center' }}>
        {view === 'login'     && <LoginPage    onLoginSuccess={handleLoginSuccess} onGoRegister={() => setView('register')} />}
        {view === 'register'  && <RegisterPage onGoLogin={() => setView('login')} />}
        {view === 'dashboard' && user && <Dashboard user={user} onLogout={handleLogout} />}
      </div>

      {/* Footer */}
      <p style={{ marginTop:'28px', fontSize:'0.74rem', color:MUTED, zIndex:1, textAlign:'center' }}>
        Security Lab · Identification &amp; Authentication Failures ·{' '}
        <span style={{ color:T }}>A07:2021</span>
      </p>
    </div>
  );
}