import React, { useState, useEffect } from 'react';
import { API_BASE } from './apiConfig';

// ─────────────────────────────────────────────────────────────────────────
// A01 Target Site: "SecureBank Online" customer profile page.
// This is the vulnerable target that the "View Site" button in A01.jsx
// opens via: ?mode=a01_target&user_id=<id>
//
// It calls the backend IDOR endpoint registered in modules/a01/a01_idor.py:
//   GET /api/a01/profile?user_id=<id>
// ─────────────────────────────────────────────────────────────────────────

function A01Target() {
  const themeColor = '#00e5ff';

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('1');

  const getUserIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('user_id') || '1';
  };

  const fetchProfile = (id) => {
    setLoading(true);
    setError('');
    setProfile(null);

    fetch(`${API_BASE}/api/a01/profile?user_id=${encodeURIComponent(id)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'User Profile Not Found');
        }
        setProfile(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const id = getUserIdFromUrl();
    setUserId(id);
    fetchProfile(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (num) =>
    '$' + Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.45; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes flagGlow {
          0%,100% { box-shadow: 0 0 0px rgba(34,197,94,0.0); }
          50% { box-shadow: 0 0 18px rgba(34,197,94,0.45); }
        }
        .skel { animation: pulse 1.4s ease-in-out infinite; background:#334155; border-radius:6px; }
        .fade-in { animation: fadeIn 0.35s ease forwards; }
        .flag-glow { animation: flagGlow 2.4s ease-in-out infinite; }
        .nav-btn { transition: all 0.15s ease; }
        .nav-btn:hover { background:#334155 !important; border-color:#475569 !important; }
        .nav-btn:active { transform: scale(0.94); }
        .go-btn { transition: all 0.2s ease; }
        .go-btn:hover { box-shadow: 0 0 14px rgba(0,229,255,0.45); transform: translateY(-1px); }
        .id-input::placeholder { color:#64748b; }
      `}</style>

      <div style={styles.shell}>

        {/* ── TOP BAR ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div style={styles.brandRow}>
            <div style={{ ...styles.brandIcon, background: `linear-gradient(135deg, ${themeColor}, #0ea5e9)` }}>🏦</div>
            <div>
              <div style={styles.brandText}>SecureBank Online</div>
              <div style={styles.brandSub}>Customer Account Portal</div>
            </div>
          </div>
          <div style={styles.statusPill}>
            <span style={styles.statusDot}></span> Session Active
          </div>
        </div>

        {/* ── CARD ────────────────────────────────────────────── */}
        <div style={styles.card} className="fade-in" key={userId}>

          {/* Loading skeleton */}
          {loading && (
            <div>
              <div style={styles.avatarRow}>
                <div className="skel" style={{ width: 64, height: 64, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skel" style={{ width: '60%', height: 16, marginBottom: 8 }} />
                  <div className="skel" style={{ width: '40%', height: 12 }} />
                </div>
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={styles.field}>
                  <div className="skel" style={{ width: 110, height: 12 }} />
                  <div className="skel" style={{ width: 140, height: 12 }} />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={styles.errorBox}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚫</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>User Profile Not Found</div>
              <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>{error}</div>
            </div>
          )}

          {/* Profile content */}
          {!loading && profile && (
            <>
              <div style={styles.avatarRow}>
                <div style={{ ...styles.avatar, background: `linear-gradient(135deg, ${themeColor}, #6366f1)` }}>
                  {getInitials(profile.username)}
                </div>
                <div>
                  <div style={styles.profileName}>{profile.username}</div>
                  <div style={styles.profileSub}>Account ID #{profile.id}</div>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <Field label="🏦 Bank Account ID" value={profile.id} />
                <Field label="👤 Full Name" value={profile.username} />
                <Field label="💳 Account Number" value={profile.account_number} mono />
                <Field
                  label="💰 Current Balance"
                  value={formatCurrency(profile.account_balance)}
                  valueStyle={{ color: themeColor, fontSize: '1.35rem', fontWeight: 800 }}
                  noBorder
                />
              </div>

              {profile.flag && (
                <div style={styles.flagBox} className="flag-glow">
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>🚩</div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Hidden field detected</div>
                  <code style={styles.flagCode}>{profile.flag}</code>
                </div>
              )}
            </>
          )}

        </div>

        {/* ── HINT FOOTER ─────────────────────────────────────── */}
        <div style={styles.urlHint}>
          Viewing profile for <code style={styles.code}>user_id={userId}</code> — no authentication required.
          <br />
          Try other IDs, e.g.{' '}
          <code style={styles.code}>?mode=a01_target&amp;user_id=2</code>,{' '}
          <code style={styles.code}>?mode=a01_target&amp;user_id=3</code> ...
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, valueStyle, mono, noBorder }) {
  return (
    <div style={{ ...styles.field, ...(noBorder ? { borderBottom: 'none' } : {}) }}>
      <span style={styles.fieldLabel}>{label}</span>
      <span
        style={{
          ...styles.fieldValue,
          ...(mono ? { fontFamily: 'monospace', letterSpacing: '0.5px' } : {}),
          ...valueStyle,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 60%)',
    color: '#e2e8f0',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  },
  shell: {
    width: '100%',
    maxWidth: '440px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandIcon: {
    width: '42px', height: '42px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
    boxShadow: '0 4px 14px rgba(0,229,255,0.25)',
  },
  brandText: { fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.3px' },
  brandSub: { fontSize: '0.75rem', color: '#64748b', marginTop: '2px' },
  statusPill: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '0.75rem', color: '#86efac',
    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
    padding: '5px 12px', borderRadius: '999px', fontWeight: 600,
  },
  statusDot: {
    width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e',
    boxShadow: '0 0 6px #22c55e',
  },
  card: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '26px 28px',
    width: '100%',
    boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
    border: '1px solid #334155',
    boxSizing: 'border-box',
  },
  avatarRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  avatar: {
    width: '64px', height: '64px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.4rem', fontWeight: 800, color: '#0f172a',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(0,229,255,0.3)',
  },
  profileName: { fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', wordBreak: 'break-word' },
  profileSub: { fontSize: '0.8rem', color: '#64748b', marginTop: '3px' },
  fieldGroup: {
    background: '#0f172a',
    borderRadius: '10px',
    padding: '4px 16px',
    border: '1px solid #1e293b',
  },
  field: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '13px 0', borderBottom: '1px solid #1e293b', fontSize: '0.92rem',
    gap: '12px',
  },
  fieldLabel: { color: '#94a3b8', whiteSpace: 'nowrap' },
  fieldValue: { color: '#f8fafc', fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' },
  errorBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5', padding: '24px 18px', borderRadius: '10px', fontSize: '0.95rem', textAlign: 'center',
  },
  flagBox: {
    marginTop: '18px',
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.35)',
    color: '#86efac', padding: '16px 18px', borderRadius: '10px',
    fontSize: '0.9rem', textAlign: 'center',
  },
  flagCode: {
    display: 'inline-block', marginTop: '4px',
    background: '#0f172a', padding: '6px 12px', borderRadius: '6px',
    color: '#4ade80', fontWeight: 700, wordBreak: 'break-all',
    border: '1px solid rgba(34,197,94,0.3)',
  },
  navigator: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', marginTop: '22px',
  },
  navArrow: {
    width: '38px', height: '38px', borderRadius: '8px',
    background: '#0f172a', border: '1px solid #334155', color: '#94a3b8',
    fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  idForm: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
    padding: '6px 10px', flex: 1, minWidth: 0,
  },
  idPrefix: { fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' },
  idInput: {
    flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
    color: '#f8fafc', fontSize: '0.95rem', fontFamily: 'monospace',
  },
  goBtn: {
    border: 'none', borderRadius: '6px', padding: '6px 14px',
    color: '#0f172a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
  },
  urlHint: { marginTop: '18px', fontSize: '0.78rem', color: '#64748b', textAlign: 'center', lineHeight: '1.6' },
  code: { background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#00e5ff', border: '1px solid #334155' },
};

export default A01Target;