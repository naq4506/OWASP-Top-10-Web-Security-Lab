import React, { useState, useEffect } from 'react';

const themeColor = '#ff6b6b';
// Use relative URL so it works regardless of which port/host Flask is on
const API_BASE = '';

// ── Fallback data (mirrors the real DB, used if API is unreachable) ──
const FALLBACK_USERS = [
  { id:1, username:'admin',    email:'admin@hust.soict.edu.vn',       role:'admin',    password_hash:'0192023a7bbd73250516f069df18b500', algo:'MD5' },
  { id:2, username:'user1',    email:'user1@gmail.com',                role:'user',     password_hash:'a722c63db8ec8625af8f533ca0086a55', algo:'MD5' },
  { id:3, username:'bobby',    email:'bobby.tables@outlook.com',       role:'user',     password_hash:'482c811da5d5b4bc6d497ffa98491e38', algo:'MD5' },
  { id:4, username:'alice',    email:'alice.security@hust.edu.vn',     role:'user',     password_hash:'d8578edf8458ce06fbc5bb76a58c5ca4', algo:'MD5' },
  { id:5, username:'guest',    email:'guest@local.host',               role:'guest',    password_hash:'084e0343a0486ff05530df6c705c8bb4', algo:'MD5' },
  { id:6, username:'ceo_minh', email:'minh.director@soict.vn',         role:'director', password_hash:'e10adc3949ba59abbe56e057f20f883e', algo:'MD5' },
  { id:7, username:'hr_lan',   email:'lan.hr@soict.vn',                role:'hr',       password_hash:'4297f44b13955235245b2497399d7a93', algo:'MD5' },
  { id:8, username:'dev_quan', email:'quan.dev@soict.vn',              role:'user',     password_hash:'f447b20a7fcbf53a5d5be013ea0b15af', algo:'MD5' },
];

// ── Helpers ──────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '3px 10px', fontSize: '0.72rem', borderRadius: '4px', cursor: 'pointer',
        backgroundColor: copied ? '#064e3b' : '#1e293b',
        color:           copied ? '#34d399'  : '#94a3b8',
        border:          `1px solid ${copied ? '#10b981' : '#334155'}`,
        transition: 'all 0.2s ease', fontFamily: 'monospace',
      }}
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}

function TabButton({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 22px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
        borderRadius: '8px 8px 0 0',
        backgroundColor: active ? '#1e293b' : hovered ? '#111827' : 'transparent',
        color:           active ? themeColor : hovered ? '#94a3b8' : '#64748b',
        border:          active ? '1px solid #334155' : '1px solid transparent',
        borderBottom:    active ? '1px solid #1e293b' : '1px solid #334155',
        transition: 'all 0.2s ease',
        marginBottom: '-1px',
        boxShadow: active ? `0 -2px 8px rgba(255,107,107,0.15)` : 'none',
      }}
    >
      {label}
    </button>
  );
}

// ── Role badge ───────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    admin:    { bg: 'rgba(255,107,107,0.15)', color: '#ff6b6b', border: 'rgba(255,107,107,0.4)' },
    director: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.35)' },
    hr:       { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa', border: 'rgba(139,92,246,0.35)' },
    guest:    { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  };
  const style = map[role?.toLowerCase()] ?? { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' };
  return (
    <span style={{
      fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px',
      textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px',
      backgroundColor: style.bg, color: style.color,
      border: `1px solid ${style.border}`,
    }}>
      {role}
    </span>
  );
}

// ── Algorithm badge ──────────────────────────────────────────────────
function AlgoBadge({ algo }) {
  return (
    <span style={{
      fontSize: '0.75rem', backgroundColor: 'rgba(239,68,68,0.15)',
      color: '#ef4444', padding: '3px 8px', borderRadius: '4px',
      border: '1px solid rgba(239,68,68,0.3)', fontFamily: 'monospace',
    }}>
      {algo}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function A02Target() {
  const [activeTab,  setActiveTab]  = useState('db');
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Cracker state
  const [crackInput,  setCrackInput]  = useState('');
  const [crackResult, setCrackResult] = useState(null);
  const [cracking,    setCracking]    = useState(false);
  const [progress,    setProgress]    = useState(0);

  const [hoveredUser, setHoveredUser] = useState(null);

  // ── Fetch real users on mount ──────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/a02/users`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        // Exclude rows whose username starts with 'FLAG{' (CTF flag rows)
        const clean = (data.users ?? data).filter(
          u => !String(u.username ?? '').toUpperCase().startsWith('FLAG')
        );
        setUsers(clean);
        setLoading(false);
      })
      .catch(err => {
        setFetchError(err.message);
        setLoading(false);
      });
  }, []);

  // ── Crack via API ──────────────────────────────────────────────────
  const handleCrack = () => {
    const hash = crackInput.trim().toLowerCase();
    if (!hash || hash.length !== 32) return;
    setCrackResult(null);
    setCracking(true);
    setProgress(0);

    // Animate progress bar while waiting
    let p = 0;
    const ticker = setInterval(() => {
      p = Math.min(p + Math.random() * 12, 92);
      setProgress(Math.round(p));
    }, 120);

    fetch(`${API_BASE}/api/a02/crack`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ hash }),
    })
      .then(r => r.json())
      .then(data => {
        clearInterval(ticker);
        setProgress(100);
        if (data.cracked) {
          setCrackResult({ found: true,  password: data.password, attempts: data.attempts });
        } else {
          setCrackResult({ found: false, attempts: data.attempts });
        }
        setCracking(false);
      })
      .catch(err => {
        clearInterval(ticker);
        setProgress(100);
        setCrackResult({ found: false, error: err.message });
        setCracking(false);
      });
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Segoe UI',Roboto,sans-serif", backgroundColor: '#0a1120', minHeight: '100vh', color: '#cbd5e1' }}>

      <style>{`
        @keyframes glowPulse   { 0%,100%{box-shadow:0 0 8px rgba(255,107,107,.3)} 50%{box-shadow:0 0 20px rgba(255,107,107,.7),0 0 40px rgba(255,107,107,.3)} }
        @keyframes hashFlicker { 0%,96%,100%{opacity:1} 97%{opacity:.4} 98%{opacity:1} 99%{opacity:.6} }
        @keyframes slideInUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressGlow{ 0%,100%{box-shadow:0 0 6px rgba(255,107,107,.5)} 50%{box-shadow:0 0 16px rgba(255,107,107,.9)} }
        @keyframes badgePop    { 0%{transform:scale(.85);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        .hash-cell        { animation: hashFlicker 8s infinite; }
        .result-appear    { animation: slideInUp   .4s cubic-bezier(.16,1,.3,1) forwards; }
        .crack-badge      { animation: badgePop    .5s cubic-bezier(.34,1.56,.64,1) forwards; }
        .progress-bar-glow{ animation: progressGlow 1.2s ease-in-out infinite; }
        .table-row-hover  { transition: background-color .15s ease, box-shadow .15s ease !important; }
        .attack-btn       { transition: all .2s ease !important; }
        .attack-btn:hover { transform: scale(1.03) !important; box-shadow: 0 0 18px rgba(255,107,107,.55) !important; }
        .attack-btn:active{ transform: scale(.97) !important; }
        .tab-nav          { border-bottom: 1px solid #334155; margin-bottom: 0; display: flex; gap: 4px; }
        .quick-fill-btn   { transition: all .15s ease !important; }
        .quick-fill-btn:hover{ transform: translateY(-1px) !important; }
        .spinner          { width:20px;height:20px;border:2px solid #334155;border-top-color:${themeColor};border-radius:50%;animation:spin .7s linear infinite; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '2px', color: '#475569' }}>LAB TARGET</span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ color: themeColor, fontWeight: '700', fontSize: '0.9rem' }}>A02: Cryptographic Failures</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'glowPulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>OWASP_LAB · dbo.users — LEAKED</span>
        </div>
      </div>

      {/* ── ALERT BANNER ── */}
      <div style={{ backgroundColor: 'rgba(255,107,107,0.08)', borderBottom: `1px solid ${themeColor}30`, padding: '10px 32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1rem' }}>⚠️</span>
        <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
          <strong>Security Lab Simulation</strong> — Controlled environment. Data is fictional and used for educational purposes only.
        </span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── PAGE TITLE ── */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 6px' }}>
            🛒 ShopVN — User Database Leak
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            {loading
              ? 'Loading records…'
              : fetchError
              ? 'Could not reach database.'
              : `${users.length} account${users.length !== 1 ? 's' : ''} exposed · Passwords stored as unsalted MD5 · Server: Apache 2.2 / MySQL 5.5`}
          </p>
        </div>

        {/* ── TABS ── */}
        <div className="tab-nav">
          <TabButton label="🗄️ Database Dump"    active={activeTab === 'db'}      onClick={() => setActiveTab('db')} />
          <TabButton label="⚡ Wordlist Cracker"  active={activeTab === 'cracker'} onClick={() => setActiveTab('cracker')} />
        </div>

        {/* ══ TAB: DATABASE DUMP ══════════════════════════════════════ */}
        {activeTab === 'db' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '30px', animation: 'slideInUp 0.3s ease forwards' }}>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1.3rem', margin: '0 0 4px' }}>OWASP_LAB.dbo.users</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>Passwords hashed with unsalted MD5. Copy any hash → crack it in the Wordlist Cracker tab.</p>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '40px 0', justifyContent: 'center' }}>
                <div className="spinner" />
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Fetching from database…</span>
              </div>
            )}

            {/* Error */}
            {!loading && fetchError && (
              <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '20px 24px' }}>
                <div style={{ color: '#ef4444', fontWeight: '700', marginBottom: '6px' }}>⚠️ Could not reach API</div>
                <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontFamily: 'monospace' }}>{fetchError}</div>
                <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '8px' }}>Make sure the Flask server is running and CORS is enabled on <code>/api/a02/users</code>.</div>
              </div>
            )}

            {/* Table */}
            {!loading && !fetchError && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e293b' }}>
                      {['ID', 'Username', 'Email', 'Role', 'Password Hash (MD5)', 'Algorithm', 'Action'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: ['Email','Role','Username','Password Hash (MD5)'].includes(h) ? 'center' : 'left', color: '#94a3b8', fontWeight: '600', borderBottom: '1px solid #334155', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => {
                      const isAdmin = String(u.role ?? '').toLowerCase() === 'admin';
                      return (
                        <tr
                          key={u.id}
                          className="table-row-hover"
                          onMouseEnter={() => setHoveredUser(u.id)}
                          onMouseLeave={() => setHoveredUser(null)}
                          style={{
                            backgroundColor: hoveredUser === u.id
                              ? (isAdmin ? 'rgba(255,107,107,0.06)' : '#132035')
                              : i % 2 === 0 ? '#0f172a' : '#0d1526',
                            borderBottom: '1px solid #1e293b',
                            boxShadow: hoveredUser === u.id && isAdmin
                              ? `inset 0 0 0 1px ${themeColor}30`
                              : 'none',
                          }}
                        >
                          <td style={{ padding: '12px 14px', color: '#475569', fontFamily: 'monospace' }}>{u.id}</td>

                          <td style={{ padding: '12px 14px', fontWeight: '700', color: isAdmin ? themeColor : '#f8fafc', whiteSpace: 'nowrap', textAlign: 'center' }}>
                            {u.username}
                            {isAdmin && (
                              <span style={{
                                marginLeft: '6px', fontSize: '0.7rem',
                                backgroundColor: `${themeColor}20`, color: themeColor,
                                padding: '2px 6px', borderRadius: '4px',
                                border: `1px solid ${themeColor}50`,
                                animation: 'glowPulse 2.5s ease-in-out infinite',
                              }}>
                                ADMIN
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.82rem', textAlign: 'center' }}>{u.email}</td>

                          <td style={{ padding: '12px 14px', textAlign: 'center' }}><RoleBadge role={u.role} /></td>

                          <td
                            style={{ padding: '12px 14px', fontFamily: 'monospace', color: isAdmin ? '#fbbf24' : '#94a3b8', fontSize: '0.8rem', letterSpacing: '0.5px', textAlign: 'center' }}
                            className={isAdmin ? 'hash-cell' : ''}
                          >
                            {u.password_hash ?? '—'}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <AlgoBadge algo={u.algo ?? 'MD5'} />
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <CopyButton text={u.password_hash ?? ''} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !fetchError && (
              <div style={{ marginTop: '20px', padding: '14px 18px', backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '8px', fontSize: '0.88rem', color: '#fbbf24' }}>
                💡 <strong>Task:</strong> Copy the <strong>admin</strong> user's MD5 hash, then head to the <strong>Wordlist Cracker</strong> tab to crack it.
              </div>
            )}

            <button
              onClick={() => setActiveTab('cracker')}
              className="attack-btn"
              style={{ marginTop: '20px', padding: '10px 24px', backgroundColor: themeColor, color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              Go to Cracker →
            </button>
          </div>
        )}

        {/* ══ TAB: CRACKER ══════════════════════════════════════════ */}
        {activeTab === 'cracker' && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '30px', animation: 'slideInUp 0.3s ease forwards' }}>

            <h2 style={{ color: '#f8fafc', fontWeight: '600', fontSize: '1.3rem', margin: '0 0 8px' }}>⚡ Wordlist Hash Cracker</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
              Simulates a dictionary attack against MD5. Paste any hash from the database dump and run the wordlist.
            </p>

            {/* How it works */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', fontSize: '0.85rem', lineHeight: '1.7', color: '#94a3b8', border: '1px solid #334155' }}>
              <strong style={{ color: '#f8fafc' }}>How a dictionary attack works:</strong>
              <ol style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                <li>Take each word from a known password wordlist (rockyou.txt has 14 million entries)</li>
                <li>Compute MD5(word) for each one</li>
                <li>Compare the result to the target hash</li>
                <li>If they match → password found. No math needed, just speed.</li>
              </ol>
            </div>

            {/* Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                Target MD5 Hash
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Paste MD5 hash here (32 hex characters)…"
                  value={crackInput}
                  onChange={e => { setCrackInput(e.target.value); setCrackResult(null); }}
                  style={{
                    flex: '1', minWidth: '260px', padding: '11px 14px',
                    borderRadius: '6px', border: `1px solid ${crackInput ? themeColor + '60' : '#334155'}`,
                    backgroundColor: '#1e293b', color: '#fbbf24',
                    fontSize: '0.9rem', fontFamily: 'monospace', outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                    boxShadow: crackInput ? `0 0 0 3px ${themeColor}15` : 'none',
                  }}
                />
                <button
                  onClick={handleCrack}
                  disabled={cracking || crackInput.trim().length !== 32}
                  className="attack-btn"
                  style={{
                    padding: '11px 24px',
                    backgroundColor: cracking ? '#334155' : themeColor,
                    color:           cracking ? '#64748b'  : '#0f172a',
                    border: 'none', borderRadius: '6px', fontWeight: '700',
                    cursor: cracking ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cracking ? '⏳ Cracking…' : '⚡ Run Attack'}
                </button>
              </div>
            </div>

            {/* Quick-fill buttons from live data */}
            {users.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569', alignSelf: 'center' }}>Quick fill:</span>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { setCrackInput(u.password_hash ?? ''); setCrackResult(null); }}
                    className="quick-fill-btn"
                    style={{
                      padding: '4px 12px', fontSize: '0.78rem', borderRadius: '4px',
                      backgroundColor: '#1e293b',
                      color:  String(u.role ?? '').toLowerCase() === 'admin' ? themeColor : '#94a3b8',
                      border: `1px solid ${String(u.role ?? '').toLowerCase() === 'admin' ? themeColor + '60' : '#334155'}`,
                      cursor: 'pointer',
                      boxShadow: String(u.role ?? '').toLowerCase() === 'admin' ? `0 0 8px ${themeColor}25` : 'none',
                    }}
                  >
                    {u.username}
                  </button>
                ))}
              </div>
            )}

            {/* Progress bar */}
            {(cracking || crackResult) && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {cracking ? `Testing wordlist… ${progress}%` : 'Attack complete'}
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden', border: '1px solid #334155' }}>
                  <div
                    className={cracking ? 'progress-bar-glow' : ''}
                    style={{
                      height: '100%', width: `${progress}%`,
                      backgroundColor: crackResult?.found ? '#22c55e' : themeColor,
                      borderRadius: '3px', transition: 'width 0.1s linear',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Result */}
            {crackResult && (
              <div className="result-appear" style={{
                padding: '20px 24px', borderRadius: '10px', marginTop: '8px',
                backgroundColor: crackResult.found ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${crackResult.found ? '#22c55e40' : '#ef444440'}`,
                position: 'relative', overflow: 'hidden',
              }}>
                {crackResult.found && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #22c55e, transparent)' }} />
                )}
                {crackResult.found ? (
                  <>
                    <div className="crack-badge" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#22c55e', marginBottom: '8px' }}>
                      ✅ Hash cracked!
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Hash: </span>
                      <span style={{ color: '#fbbf24' }}>{crackInput.trim()}</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: '700' }}>
                      <span style={{ color: '#64748b' }}>Password: </span>
                      <span style={{ color: '#22c55e', textShadow: '0 0 12px rgba(34,197,94,0.5)' }}>"{crackResult.password}"</span>
                    </div>
                    {crackResult.attempts && (
                      <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#64748b', fontFamily: 'monospace' }}>
                        Found in {crackResult.attempts} attempt{crackResult.attempts !== 1 ? 's' : ''}
                      </div>
                    )}
                    <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
                      This password was found almost instantly because it exists in every common wordlist.
                      On a real GPU, MD5 can be tested at <strong style={{ color: '#f8fafc' }}>~10 billion/sec</strong> — the entire rockyou.txt wordlist takes milliseconds.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>
                      ❌ Not found in wordlist
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
                      {crackResult.error
                        ? `API error: ${crackResult.error}`
                        : 'This hash was not in the demo wordlist. In a real attack, tools like Hashcat use dictionaries with 14+ million entries and can crack most common passwords within minutes.'}
                    </p>
                  </>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}