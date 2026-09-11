import React, { useState, useEffect, useCallback, useRef } from 'react';

const T      = '#ff7a00';
const BG     = '#060c1a';
const C1     = '#0d1424';
const C2     = '#111c30';
const C3     = '#1a2640';
const MUTED  = '#3d5270';
const BODY   = '#8fa3be';
const BRIGHT = '#dce8f5';
const RED    = '#ef4444';
const GREEN  = '#22c55e';

const USERS = [
  { id: 1, username: 'admin',    password: 'admin',       role: 'admin',    email: 'admin@hust.soict.edu.vn',      salary: 5000,  account_number: '1029384756', account_balance: 5000.00   },
  { id: 2, username: 'user1',    password: 'user123',     role: 'user',     email: 'user1@gmail.com',              salary: 1000,  account_number: '5647382910', account_balance: 85000.00  },
  { id: 3, username: 'bobby',    password: 'password123', role: 'user',     email: 'bobby.tables@outlook.com',     salary: 1200,  account_number: '9876543210', account_balance: 120000.00 },
  { id: 4, username: 'alice',    password: 'qwerty',      role: 'user',     email: 'alice.security@hust.edu.vn',   salary: 1500,  account_number: '1122334455', account_balance: 1500.00   },
  { id: 5, username: 'guest',    password: 'guest',       role: 'guest',    email: 'guest@local.host',             salary: 0,     account_number: '9988776655', account_balance: 0.00      },
  { id: 6, username: 'ceo_minh', password: '123456',      role: 'director', email: 'minh.director@soict.vn',       salary: 20000, account_number: '4455667788', account_balance: 250000.00 },
  { id: 7, username: 'hr_lan',   password: '123123',      role: 'hr',       email: 'lan.hr@soict.vn',              salary: 2500,  account_number: '1231231234', account_balance: 9500.00   },
  { id: 8, username: 'dev_quan', password: 'iloveyou',    role: 'user',     email: 'quan.dev@soict.vn',            salary: 1800,  account_number: '5556667778', account_balance: 1800.00   },
];

const ADMIN_FLAG = 'FLAG{jwt_n0ne_4lg_byp4ss_m4st3r_2026}';

function b64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function b64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try { return decodeURIComponent(escape(atob(str))); } catch { return null; }
}
function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header  = JSON.parse(b64UrlDecode(parts[0]));
    const payload = JSON.parse(b64UrlDecode(parts[1]));
    return { header, payload, sig: parts[2] };
  } catch { return null; }
}
function createJwt(header, payload) {
  const h = b64UrlEncode(JSON.stringify(header));
  const p = b64UrlEncode(JSON.stringify(payload));
  const sig = header.alg === 'none' ? '' : 'SIG_' + btoa('super_secret_key_2026' + h + p).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
  return `${h}.${p}.${sig}`;
}
function getCookie(name) {
  const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
  return match ? match.split('=').slice(1).join('=') : null;
}
function setCookie(name, value, hours = 1) {
  const exp = new Date(Date.now() + hours * 3600 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${exp}; path=/; SameSite=Lax`;
}
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
function validateToken(token) {
  const parsed = parseJwt(token);
  if (!parsed) return { ok: false, reason: 'Malformed token' };
  const { header, payload } = parsed;
  if (header.alg === 'none') {
    if (payload.username === 'admin') return { ok: true, user: USERS[0], isAdmin: true, vuln: true };
    const user = USERS.find(u => u.username === payload.username);
    if (user) return { ok: true, user, isAdmin: false, vuln: true };
    return { ok: false, reason: 'User not found in token payload' };
  }
  if (header.alg === 'HS256') {
    const user = USERS.find(u => u.username === payload.username);
    if (!user) return { ok: false, reason: 'User not found' };
    if (Date.now() / 1000 > payload.exp) return { ok: false, reason: 'Token expired' };
    return { ok: true, user, isAdmin: user.role === 'admin', vuln: false };
  }
  return { ok: false, reason: `Unsupported algorithm: ${header.alg}` };
}

function Badge({ role }) {
  const map = { admin: RED, director: '#f97316', hr: '#8b5cf6', user: T, guest: MUTED };
  const c = map[role] || MUTED;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '20px', fontSize: '0.66rem', fontWeight: '800',
      border: `1px solid ${c}40`, color: c, background: `${c}12`,
      letterSpacing: '0.8px', textTransform: 'uppercase'
    }}>
      {role}
    </span>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      style={{
        padding: '4px 12px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer',
        border: `1px solid ${copied ? GREEN + '60' : C3}`,
        color: copied ? GREEN : MUTED,
        background: copied ? `${GREEN}10` : 'transparent',
        transition: 'all .25s ease',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function Step({ n, children }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%',
        background: `${T}18`, border: `1px solid ${T}45`, color: T,
        fontSize: '0.72rem', fontWeight: '800',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px'
      }}>{n}</div>
      <div style={{ fontSize: '0.84rem', color: BODY, lineHeight: '1.7', paddingTop: '2px' }}>{children}</div>
    </div>
  );
}

export default function A08Page({ onBack }) {
  const [page, setPage]         = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [session,  setSession]  = useState(null);
  const [token,    setToken]    = useState('');
  const [pulse,    setPulse]    = useState(false);
  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  const tokenRef = useRef('');

  const applyToken = (raw) => {
    tokenRef.current = raw || '';
    if (!raw) { setSession(null); setToken(''); return; }
    setToken(raw);
    const r = validateToken(raw);
    setSession(r.ok ? r : { error: r.reason });
  };

  const readCookie = useCallback(() => { applyToken(getCookie('jwt_token')); }, []);

  useEffect(() => {
    readCookie();
    const id = setInterval(() => {
      const raw = getCookie('jwt_token') || '';
      if (raw !== tokenRef.current) {
        setPulse(true);
        setTimeout(() => setPulse(false), 900);
        applyToken(raw);
      }
    }, 500);
    return () => clearInterval(id);
  }, [readCookie]);

  const handleLogin = (e) => {
    e?.preventDefault();
    if (btnState === 'loading') return;
    setLoginErr('');
    setBtnState('loading');

    setTimeout(() => {
      const u = USERS.find(uu => uu.username === username && uu.password === password);
      if (!u) {
        setLoginErr('Invalid username or password.');
        setBtnState('error');
        setTimeout(() => setBtnState('idle'), 1500);
        return;
      }
      const now = Math.floor(Date.now() / 1000);
      const jwt = createJwt({ typ: 'JWT', alg: 'HS256' }, { username: u.username, role: u.role, exp: now + 3600 });
      setCookie('jwt_token', jwt, 1);
      applyToken(jwt);
      setBtnState('success');
      setTimeout(() => setBtnState('idle'), 1200);
    }, 700);
  };

  const handleLogout = () => {
    deleteCookie('jwt_token');
    tokenRef.current = '';
    setSession(null); setToken('');
    setUsername(''); setPassword(''); setLoginErr('');
    setBtnState('idle');
  };

  const goHome = () => { if (onBack) onBack(); else window.history.back(); };

  const isLoggedIn = session && !session.error;
  const isAdmin    = isLoggedIn && session.isAdmin;
  const vuln       = isLoggedIn && session.vuln;
  const user       = isLoggedIn ? session.user : null;
  const parsed     = token ? parseJwt(token) : null;

  const NAV_ITEMS = [
    { id: 'login', icon: '🔐', label: 'Portal' },
    { id: 'guide', icon: '📖', label: 'Attack Guide' },
  ];

  const btnColor = btnState === 'success' ? GREEN : btnState === 'error' ? RED : T;
  const btnLabel = btnState === 'loading' ? 'Signing in…' : btnState === 'success' ? '✓ Access granted' : btnState === 'error' ? '✗ Try again' : 'Sign In →';

  return (
    <div style={{
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: BG, minHeight: '100vh', color: BODY,
      display: 'flex', flexDirection: 'column'
    }}>
      <style>{`
        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 6px ${T}40; }
          50%      { box-shadow: 0 0 18px ${T}70; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.95); }
          60%  { transform: scale(1.03); }
          100% { transform: scale(1); }
        }

        .fade-up  { animation: fadeUp  .4s cubic-bezier(.16,1,.3,1) both; }
        .fade-in  { animation: fadeIn  .3s ease both; }
        .shake    { animation: shake .4s ease; }
        .success  { animation: successPop .35s ease; }

        input {
          width: 100%; padding: 11px 14px;
          border-radius: 8px; border: 1px solid ${C3};
          background: ${C2}; color: ${BRIGHT};
          font-size: 0.92rem; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        input:focus {
          border-color: ${T}70;
          box-shadow: 0 0 0 3px ${T}18;
        }
        input::placeholder { color: ${MUTED}60; }

        kbd {
          background: ${C3}; padding: 2px 8px;
          border-radius: 4px; font-family: monospace;
          font-size: 0.76rem; color: ${BRIGHT};
          border: 1px solid ${MUTED}40;
        }
        code {
          font-family: monospace; font-size: 0.88em;
          background: ${C2}; color: ${T};
          padding: 1px 6px; border-radius: 4px; border: 1px solid ${C3};
        }
        a { color: ${T}; }

        .nav-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 7px; border: none;
          font-size: 0.86rem; cursor: pointer; text-align: left;
          transition: background .15s, color .15s;
        }
        .nav-btn:hover:not(.active) {
          background: ${C2};
          color: ${BRIGHT};
        }

        .card {
          background: ${C1};
          border: 1px solid ${C3};
          border-radius: 12px;
        }

        .stat-card {
          background: ${C2};
          border: 1px solid ${C3};
          border-radius: 10px;
          padding: 16px 18px;
          transition: border-color .2s, transform .2s;
        }
        .stat-card:hover {
          border-color: ${T}40;
          transform: translateY(-2px);
        }

        .sign-in-btn {
          width: 100%; padding: 12px;
          border-radius: 8px; border: none;
          font-weight: 800; font-size: 0.94rem;
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          position: relative; overflow: hidden;
          letter-spacing: 0.3px;
        }
        .sign-in-btn:hover:not(:disabled) {
          opacity: .92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px ${T}40;
        }
        .sign-in-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .sign-in-btn:disabled { cursor: not-allowed; opacity: .8; }

        .logout-btn {
          padding: 7px 15px; border-radius: 7px;
          background: transparent; color: ${MUTED};
          font-size: 0.82rem; border: 1px solid ${C3};
          cursor: pointer;
          transition: color .2s, border-color .2s, background .2s;
        }
        .logout-btn:hover {
          color: ${RED};
          border-color: ${RED}50;
          background: ${RED}10;
        }

        .token-row {
          font-family: monospace; font-size: 0.72rem;
          background: ${C2}; padding: 11px 13px;
          border-radius: 7px; border: 1px solid ${C3};
          word-break: break-all; line-height: 1.8;
        }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        @media (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        background: `${C1}f2`, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C3}`,
        padding: '0 24px', display: 'flex', alignItems: 'center',
        height: '54px', gap: '14px', flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <button
          onClick={goHome}
          style={{
            padding: '5px 14px', borderRadius: '7px', fontSize: '0.82rem',
            fontWeight: '600', cursor: 'pointer',
            border: `1px solid ${C3}`, color: MUTED, background: 'transparent',
            transition: 'all .15s'
          }}
          onMouseEnter={e => { e.target.style.color = T; e.target.style.borderColor = T; }}
          onMouseLeave={e => { e.target.style.color = MUTED; e.target.style.borderColor = C3; }}
        >← Back</button>

        <div style={{ width: '1px', height: '22px', background: C3 }} />

        <div style={{ fontSize: '0.68rem', color: MUTED, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          OWASP A08:2021
        </div>
        <div style={{ fontSize: '0.84rem', fontWeight: '800', color: T }}>JWT None Algorithm Lab</div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLoggedIn && (
            <div style={{
              fontSize: '0.78rem', fontWeight: '700', marginRight: '8px',
              color: isAdmin ? RED : GREEN
            }}>
              {isAdmin ? '⚠ ADMIN SESSION' : `✓ ${user?.username}`}
            </div>
          )}
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: GREEN, animation: 'glowPulse 2s infinite'
          }} />
          <span style={{ fontSize: '0.73rem', color: MUTED }}>Live</span>
        </div>
      </nav>

      {/* ── LAYOUT ── */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* SIDEBAR */}
        <aside style={{
          width: '200px', flexShrink: 0,
          background: C1, borderRight: `1px solid ${C3}`,
          padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <div style={{
            fontSize: '0.60rem', color: MUTED,
            textTransform: 'uppercase', letterSpacing: '1.5px',
            padding: '0 8px', marginBottom: '10px'
          }}>Navigation</div>

          {NAV_ITEMS.map(item => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`nav-btn${active ? ' active' : ''}`}
                style={{
                  background: active ? `${T}18` : 'transparent',
                  color: active ? T : BODY,
                  fontWeight: active ? '700' : '400',
                  borderLeft: `3px solid ${active ? T : 'transparent'}`,
                }}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          {/* Cookie status pill */}
          <div style={{
            marginTop: 'auto', padding: '13px', background: C2,
            borderRadius: '9px', border: `1px solid ${C3}`
          }}>
            <div style={{
              fontSize: '0.62rem', color: MUTED,
              textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '7px'
            }}>Cookie Status</div>
            {token ? (
              <>
                <div style={{
                  fontSize: '0.72rem', fontWeight: '700', marginBottom: '5px',
                  color: isAdmin ? RED : (isLoggedIn ? GREEN : '#facc15')
                }}>
                  {isAdmin ? '🔴 Admin' : isLoggedIn ? '🟢 Authenticated' : '🟡 Invalid'}
                </div>
                <div style={{
                  fontSize: '0.63rem', color: MUTED,
                  fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: '1.5'
                }}>
                  {token.slice(0, 22)}…
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.72rem', color: MUTED }}>No cookie set</div>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: '40px 36px', overflowY: 'auto' }}>

          {/* ══ PAGE: PORTAL ══ */}
          {page === 'login' && (
            <div className="fade-up">

              {/* Header */}
              <div style={{ marginBottom: '36px', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '4px 14px', borderRadius: '20px',
                  background: `${T}12`, border: `1px solid ${T}30`,
                  fontSize: '0.72rem', color: T, fontWeight: '700',
                  letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px'
                }}>
                  🏦 SecureBank Portal
                </div>
                <h1 style={{
                  margin: '0 0 8px', fontSize: '2rem', fontWeight: '900',
                  color: BRIGHT, letterSpacing: '-0.5px'
                }}>
                  Sign in to your account
                </h1>
                <p style={{ margin: 0, fontSize: '0.9rem', color: MUTED }}>
                  Only admins can view the classified flag.
                </p>
              </div>

              {/* ─── NOT LOGGED IN: centered single login card ─── */}
              {!isLoggedIn && !token && (
                <div style={{
                  maxWidth: '420px', margin: '0 auto',
                  animation: 'fadeUp .4s cubic-bezier(.16,1,.3,1)'
                }}>
                  <div className="card" style={{ padding: '30px' }}>
                    {/* Credential hint */}
                    <div style={{
                      background: `${T}0c`, border: `1px solid ${T}30`,
                      borderRadius: '8px', padding: '11px 14px', marginBottom: '22px',
                      fontSize: '0.8rem', color: BODY, lineHeight: '1.6'
                    }}>
                      <span style={{ color: T, fontWeight: '700' }}>Lab credentials: </span>
                      <code>alice</code> / <code>qwerty</code>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{
                          fontSize: '0.72rem', color: MUTED, display: 'block',
                          marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px'
                        }}>Username</label>
                        <input
                          value={username}
                          onChange={e => { setUsername(e.target.value); if (loginErr) setLoginErr(''); }}
                          placeholder="alice"
                          autoComplete="username"
                        />
                      </div>

                      <div>
                        <label style={{
                          fontSize: '0.72rem', color: MUTED, display: 'block',
                          marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px'
                        }}>Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={e => { setPassword(e.target.value); if (loginErr) setLoginErr(''); }}
                          placeholder="••••••"
                          onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
                          autoComplete="current-password"
                        />
                      </div>

                      {/* Error message */}
                      {loginErr && (
                        <div
                          className="shake"
                          style={{
                            padding: '10px 13px', borderRadius: '7px',
                            background: '#3f0e0e', color: '#fca5a5',
                            fontSize: '0.82rem', borderLeft: `3px solid ${RED}`,
                            animation: 'slideDown .25s ease'
                          }}
                        >
                          {loginErr}
                        </div>
                      )}

                      {/* Sign in button */}
                      <button
                        className={`sign-in-btn${btnState === 'success' ? ' success' : ''}`}
                        onClick={handleLogin}
                        disabled={btnState === 'loading'}
                        style={{
                          background: btnState === 'error'
                            ? RED
                            : btnState === 'success'
                            ? GREEN
                            : T,
                          color: btnState === 'success' ? '#0a1a0a' : '#060c1a',
                          boxShadow: `0 4px 16px ${btnColor}35`,
                          marginTop: '4px',
                        }}
                      >
                        {btnState === 'loading' ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{
                              width: '14px', height: '14px',
                              border: '2px solid #06091460',
                              borderTopColor: '#060914',
                              borderRadius: '50%',
                              display: 'inline-block',
                              animation: 'spin .7s linear infinite'
                            }} />
                            Signing in…
                          </span>
                        ) : btnLabel}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── INVALID TOKEN STATE ─── */}
              {token && session?.error && (
                <div style={{
                  maxWidth: '420px', margin: '0 auto',
                  background: C1, border: `1px solid ${RED}40`,
                  borderRadius: '12px', padding: '30px', textAlign: 'center',
                  animation: 'fadeUp .35s ease'
                }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>⛔</div>
                  <div style={{ color: RED, fontWeight: '700', marginBottom: '6px', fontSize: '1rem' }}>Token Rejected</div>
                  <div style={{ color: MUTED, fontSize: '0.84rem', marginBottom: '14px' }}>{session.error}</div>
                  <div style={{
                    fontSize: '0.78rem', color: MUTED,
                    background: C2, borderRadius: '7px', padding: '10px 13px', border: `1px solid ${C3}`
                  }}>
                    Token must end with a trailing dot and <strong style={{ color: BRIGHT }}>no signature</strong> for <code>alg:none</code>
                  </div>
                </div>
              )}

              {/* ─── LOGGED IN DASHBOARD ─── */}
              {isLoggedIn && user && (
                <div className="fade-up" style={{ maxWidth: '780px', margin: '0 auto' }}>

                  {/* Vuln alert */}
                  {vuln && (
                    <div style={{
                      padding: '13px 18px', borderRadius: '9px', marginBottom: '18px',
                      background: `${RED}10`, border: `1px solid ${RED}45`,
                      fontSize: '0.83rem', animation: 'slideDown .3s ease'
                    }}>
                      <div style={{ color: RED, fontWeight: '700', marginBottom: '4px' }}>
                        ⚠ Vulnerability Triggered — alg:none Bypass
                      </div>
                      <div style={{ color: '#fca5a5', lineHeight: '1.6' }}>
                        Server accepted an unsigned token. The payload was trusted without verifying the signing key.
                      </div>
                    </div>
                  )}

                  {/* Profile header card */}
                  <div className="card" style={{
                    padding: '24px 28px', marginBottom: '16px',
                    borderTop: `3px solid ${isAdmin ? RED : T}`,
                    border: `1px solid ${isAdmin ? RED + '45' : C3}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Avatar */}
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '14px',
                          background: isAdmin ? `${RED}20` : `${T}20`,
                          border: `2px solid ${isAdmin ? RED + '50' : T + '50'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem'
                        }}>
                          {isAdmin ? '👑' : '👤'}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '1.1rem', fontWeight: '900', color: BRIGHT,
                            marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '9px'
                          }}>
                            {user.username}
                            <Badge role={user.role} />
                          </div>
                          <div style={{ fontSize: '0.8rem', color: MUTED }}>{user.email}</div>
                        </div>
                      </div>
                      <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>

                    {/* Stats grid */}
                    <div className="grid-2" style={{ marginTop: '22px' }}>
                      {[
                        { label: 'Account Number', value: user.account_number, mono: true },
                        { label: 'Balance', value: `$${Number(user.account_balance).toLocaleString()}`, accent: true },
                        { label: 'Monthly Salary', value: `$${user.salary.toLocaleString()}`, mono: true },
                        { label: 'User ID', value: `#${user.id}`, mono: true },
                      ].map(({ label, value, mono, accent }) => (
                        <div className="stat-card" key={label}>
                          <div style={{
                            fontSize: '0.64rem', color: MUTED,
                            textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '6px'
                          }}>{label}</div>
                          <div style={{
                            fontFamily: mono ? 'monospace' : 'inherit',
                            fontSize: accent ? '1.1rem' : '0.92rem',
                            fontWeight: accent ? '800' : '600',
                            color: accent ? T : BRIGHT
                          }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {!isAdmin && (
                      <div style={{
                        marginTop: '16px', padding: '11px 15px',
                        borderRadius: '8px', background: `${T}09`,
                        border: `1px solid ${T}28`, fontSize: '0.8rem', color: BODY
                      }}>
                        🔒 <strong style={{ color: T }}>Restricted:</strong> Admin privileges required to view the CTF flag.
                      </div>
                    )}
                  </div>

                  {/* Admin console */}
                  {isAdmin && (
                    <div style={{
                      background: '#0e0808', border: `1px solid ${RED}35`,
                      borderRadius: '12px', padding: '24px',
                      animation: 'fadeUp .4s cubic-bezier(.16,1,.3,1)'
                    }}>
                      <div style={{
                        color: RED, fontWeight: '800', fontSize: '0.78rem',
                        textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '18px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        🔑 Admin Console — Classified
                      </div>

                      {/* Flag box */}
                      <div style={{
                        background: '#140a0a', borderRadius: '10px',
                        padding: '18px 20px', marginBottom: '20px',
                        border: `1px solid ${RED}30`,
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', marginBottom: '10px'
                        }}>
                          <div style={{ fontSize: '0.66rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            🚩 Capture The Flag
                          </div>
                          <CopyBtn text={ADMIN_FLAG} />
                        </div>
                        <div style={{
                          fontFamily: 'monospace', fontSize: '0.96rem', fontWeight: '800',
                          color: GREEN, letterSpacing: '0.4px', wordBreak: 'break-all'
                        }}>{ADMIN_FLAG}</div>
                      </div>

                      {/* Users table */}
                      <div style={{ fontSize: '0.66rem', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                        All User Records
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', tableLayout: 'fixed' }}>
                        <colgroup>
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '28%' }} />
                          <col style={{ width: '28%' }} />
                          <col style={{ width: '32%' }} />
                        </colgroup>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${C3}` }}>
                            {['ID', 'Username', 'Role', 'Balance'].map((h, i) => (
                              <th key={h} style={{
                                padding: '7px 11px',
                                textAlign: i === 3 ? 'right' : i === 2 ? 'center' : 'left',
                                color: MUTED,
                                fontWeight: '700', fontSize: '0.64rem',
                                textTransform: 'uppercase', letterSpacing: '0.8px'
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {USERS.map(uu => (
                            <tr key={uu.id} style={{
                              borderBottom: `1px solid ${C3}20`,
                              transition: 'background .15s'
                            }}
                              onMouseEnter={e => e.currentTarget.style.background = `${C2}80`}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '7px 11px', color: MUTED, fontFamily: 'monospace', textAlign: 'left' }}>{uu.id}</td>
                              <td style={{ padding: '7px 11px', color: BRIGHT, fontFamily: 'monospace', textAlign: 'left' }}>{uu.username}</td>
                              <td style={{ padding: '7px 11px', textAlign: 'center' }}><Badge role={uu.role} /></td>
                              <td style={{ padding: '7px 11px', color: T, fontFamily: 'monospace', textAlign: 'right' }}>
                                ${Number(uu.account_balance).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* ══ PAGE: GUIDE ══ */}
          {page === 'guide' && (
            <div className="fade-up" style={{ maxWidth: '740px', margin: '0 auto' }}>
              <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: '900', color: BRIGHT }}>
                  Attack Guide
                </h1>
                <p style={{ margin: 0, fontSize: '0.88rem', color: MUTED }}>
                  JWT None Algorithm Bypass — OWASP A08:2021 Software & Data Integrity Failures
                </p>
              </div>

              {/* Concept */}
              <div className="card" style={{ padding: '22px', marginBottom: '18px' }}>
                <div style={{
                  fontSize: '0.7rem', color: T, textTransform: 'uppercase',
                  letterSpacing: '1.2px', fontWeight: '700', marginBottom: '13px'
                }}>What is the alg:none vulnerability?</div>
                <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: BODY, lineHeight: '1.78' }}>
                  A JWT consists of three Base64URL-encoded parts:{' '}
                  <span style={{ color: '#60a5fa' }}>Header</span> ·{' '}
                  <span style={{ color: '#34d399' }}>Payload</span> ·{' '}
                  <span style={{ color: '#f472b6' }}>Signature</span>.
                  The header specifies which algorithm signed the token (e.g. <code>HS256</code>).
                </p>
                <p style={{ margin: '0 0 14px', fontSize: '0.86rem', color: BODY, lineHeight: '1.78' }}>
                  The <code style={{ color: RED }}>alg:none</code> vulnerability occurs when the server{' '}
                  <strong style={{ color: BRIGHT }}>reads the algorithm from the token itself</strong>{' '}
                  and blindly accepts <code style={{ color: RED }}>"none"</code> — meaning no signature is required.
                  An attacker can forge any payload and the server will trust it without verification.
                </p>
                <div style={{
                  background: C2, borderRadius: '8px', padding: '13px 16px',
                  border: `1px solid ${C3}`, fontFamily: 'monospace',
                  fontSize: '0.79rem', color: BODY, lineHeight: '1.85'
                }}>
                  <div style={{ color: MUTED, marginBottom: '5px', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Vulnerable server code (Python)
                  </div>
                  <div><span style={{ color: '#60a5fa' }}>alg</span> = header.<span style={{ color: T }}>get</span>(<span style={{ color: '#34d399' }}>'alg'</span>).lower()</div>
                  <div><span style={{ color: RED }}>if</span> alg == <span style={{ color: '#34d399' }}>'none'</span>:</div>
                  <div style={{ paddingLeft: '20px', color: MUTED }}># ⚠ No signature check — payload trusted blindly!</div>
                  <div style={{ paddingLeft: '20px' }}><span style={{ color: RED }}>return</span> payload</div>
                </div>
              </div>

              {/* Steps */}
              <div className="card" style={{ padding: '22px', marginBottom: '18px' }}>
                <div style={{
                  fontSize: '0.7rem', color: T, textTransform: 'uppercase',
                  letterSpacing: '1.2px', fontWeight: '700', marginBottom: '18px'
                }}>Step-by-step exploit</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Step n="1">
                    Go to the{' '}
                    <button onClick={() => setPage('login')} style={{
                      background: 'none', border: 'none', color: T, cursor: 'pointer',
                      padding: '0', fontWeight: '700', fontSize: 'inherit'
                    }}>Portal</button>{' '}
                    tab and sign in with <code>alice</code> / <code>qwerty</code>. The server issues a signed <code>HS256</code> JWT stored in the <code style={{ color: T }}>jwt_token</code> cookie.
                  </Step>
                  <Step n="2">
                    Open DevTools <kbd>F12</kbd> → <strong style={{ color: BRIGHT }}>Application</strong> → <strong style={{ color: BRIGHT }}>Cookies</strong> → <strong style={{ color: BRIGHT }}>localhost</strong>. Copy the <code style={{ color: T }}>jwt_token</code> value.
                  </Step>
                  <Step n="3">
                    Go to <a href="https://jwt.io" target="_blank" rel="noreferrer">jwt.io</a>, paste the token. You'll see: <code style={{ color: '#60a5fa' }}>{`{"alg":"HS256","typ":"JWT"}`}</code>
                  </Step>
                  <Step n="4">
                    Modify the header to <code style={{ color: RED }}>{`{"alg":"none","typ":"JWT"}`}</code> and change the payload to <code style={{ color: RED }}>{`"username":"admin"`}</code>. Re-encode both.
                  </Step>
                  <Step n="5">
                    Construct: <code style={{ color: '#60a5fa' }}>HEADER</code><code style={{ color: MUTED }}>.</code><code style={{ color: '#34d399' }}>PAYLOAD</code><code style={{ color: MUTED }}>.</code><em style={{ color: MUTED, fontSize: '0.78rem', fontStyle: 'italic' }}>(empty)</em>. Token must end with a trailing dot and <strong style={{ color: BRIGHT }}>no signature</strong>.
                  </Step>
                  <Step n="6">
                    In DevTools, double-click the cookie value, paste the forged token, press <kbd>Enter</kbd>.
                  </Step>
                  <Step n="7">
                    Press <kbd>F5</kbd> to refresh. The server skips signature verification and grants admin access. <strong style={{ color: GREEN }}>The flag appears in the Admin Console.</strong>
                  </Step>
                </div>
              </div>

              {/* Token visual */}
              <div className="card" style={{ padding: '22px', marginBottom: '18px' }}>
                <div style={{
                  fontSize: '0.7rem', color: T, textTransform: 'uppercase',
                  letterSpacing: '1.2px', fontWeight: '700', marginBottom: '16px'
                }}>Token structure — before vs after</div>
                {[
                  { label: 'Legitimate token (HS256)', alg: 'HS256', u: 'alice', sig: 'SIG_a7f3…', sigColor: '#f472b6', border: GREEN },
                  { label: 'Forged token (none)', alg: 'none', u: 'admin', sig: null, sigColor: null, border: RED },
                ].map(({ label, alg, u, sig, sigColor, border }) => (
                  <div key={label} style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.71rem', color: MUTED, marginBottom: '7px' }}>{label}</div>
                    <div style={{
                      background: C2, borderRadius: '7px', padding: '11px 14px',
                      border: `1px solid ${border}30`,
                      fontFamily: 'monospace', fontSize: '0.74rem',
                      wordBreak: 'break-all', lineHeight: '1.9'
                    }}>
                      <span style={{ color: '#60a5fa' }}>{b64UrlEncode(JSON.stringify({ alg, typ: 'JWT' }))}</span>
                      <span style={{ color: MUTED }}>.</span>
                      <span style={{ color: '#34d399' }}>{b64UrlEncode(JSON.stringify({ username: u, role: u === 'admin' ? 'admin' : 'user', exp: 9999999999 }))}</span>
                      <span style={{ color: MUTED }}>.</span>
                      {sig
                        ? <span style={{ color: sigColor }}>{sig}</span>
                        : <em style={{ color: RED, fontStyle: 'italic' }}>&lt;empty&gt;</em>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Remediation */}
              <div style={{
                background: `${GREEN}07`, border: `1px solid ${GREEN}28`,
                borderRadius: '12px', padding: '22px'
              }}>
                <div style={{
                  fontSize: '0.7rem', color: GREEN, textTransform: 'uppercase',
                  letterSpacing: '1.2px', fontWeight: '700', marginBottom: '14px'
                }}>✓ How to fix it</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Never trust the algorithm specified in the token header — always enforce an expected algorithm server-side.',
                    'Reject any token with alg set to "none", even if the library supports it.',
                    'Use a well-maintained JWT library (e.g. python-jose, PyJWT with algorithms= whitelist) and pin the allowed algorithm explicitly.',
                    'Rotate signing keys periodically and store them securely — never in client-side code.',
                  ].map((tip, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '11px',
                      fontSize: '0.84rem', color: BODY, lineHeight: '1.7'
                    }}>
                      <span style={{ color: GREEN, flexShrink: 0, marginTop: '2px' }}>✓</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}