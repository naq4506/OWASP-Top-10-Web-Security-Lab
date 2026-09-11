import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE } from './apiConfig';
const API = `${API_BASE}/api/a03`;

const BG     = '#0a0f1e';
const C1     = '#0f1729';
const C2     = '#192035';
const C3     = '#1e2a45';
const MUTED  = '#4a5878';
const BODY   = '#94a3b8';
const BRIGHT = '#e2e8f0';
const ACC    = '#ffca28';

const CAT_ICON = {
  Mobile:      '📱',
  Laptop:      '💻',
  Accessories: '🖱️',
  Books:       '📚',
  Software:    '🛡️',
};

const CAT_IMG = {
  Mobile:      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  Laptop:      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  Accessories: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
  Books:       'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
  Software:    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Ripple + press AnimButton ────────────────────────────────────────────────
function AnimButton({ onClick, children, style = {}, disabled = false, title, onMouseEnter, onMouseLeave }) {
  const [ripples, setRipples] = useState([]);
  const [pressed, setPressed] = useState(false);
  const [hov, setHov]         = useState(false);

  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 580);
  };

  const handleClick = (e) => {
    if (disabled) return;
    addRipple(e);
    onClick && onClick(e);
  };

  return (
    <button
      disabled={disabled}
      title={title}
      onClick={handleClick}
      onMouseEnter={e => { setHov(true); onMouseEnter && onMouseEnter(e); }}
      onMouseLeave={e => { setHov(false); setPressed(false); onMouseLeave && onMouseLeave(e); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        outline: 'none',
        userSelect: 'none',
        transform: pressed ? 'scale(0.95)' : hov ? 'scale(1.04)' : 'scale(1)',
        transition: 'transform 0.15s cubic-bezier(.4,0,.2,1), box-shadow 0.2s, background 0.2s, color 0.2s, border-color 0.2s',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {ripples.map(rp => (
        <span key={rp.id} style={{
          position: 'absolute',
          left: rp.x - 70,
          top: rp.y - 70,
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          animation: 'rippleAnim 0.58s linear forwards',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        {children}
      </span>
    </button>
  );
}

// ── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, qty = 0, onAdd, onRemove }) {
  const [hov, setHov] = useState(false);
  const [pulse, setPulse] = useState(false);
  const img = CAT_IMG[product.category] || CAT_IMG.Software;
  const icon = CAT_ICON[product.category] || '📦';
  const isHidden = product.is_hidden === 1 || product.is_hidden === true;

  const handleAdd = () => {
    onAdd();
    setPulse(true);
    setTimeout(() => setPulse(false), 280);
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C1,
        border: `1px solid ${hov ? ACC + '60' : C3}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${ACC}30` : '0 4px 12px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {isHidden && (
        <div style={{
          position: 'absolute', top: '10px', left: '10px', zIndex: 2,
          background: '#7f1d1d', color: '#fca5a5',
          fontSize: '0.65rem', fontWeight: '800', padding: '3px 8px',
          borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase',
          border: '1px solid #ef444450',
        }}>
          🔒 HIDDEN
        </div>
      )}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: C2 }}>
        <img
          src={img} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hov ? 'scale(1.06)' : 'scale(1)' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div style={{
          position: 'absolute', bottom: '10px', right: '10px',
          background: `${C1}cc`, backdropFilter: 'blur(6px)',
          border: `1px solid ${C3}`, borderRadius: '6px',
          padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700', color: BODY,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <span>{icon}</span><span>{product.category}</span>
        </div>
      </div>
      <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '0.97rem', fontWeight: '700', color: BRIGHT, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
        <p style={{ margin: 0, fontSize: '0.8rem', color: BODY, lineHeight: '1.55', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', gap: '8px' }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: product.price === 0 ? '0.9rem' : '1.15rem', fontWeight: '800', color: product.price === 0 ? MUTED : ACC, flexShrink: 0 }}>
            {product.price === 0 ? 'Internal use' : `$${product.price.toLocaleString()}`}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {qty > 0 && (
              <AnimButton
                onClick={onRemove}
                title="Remove one from cart"
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: `1px solid #ef444450`, background: '#7f1d1d20',
                  color: '#f87171', fontSize: '0.85rem', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#7f1d1d50'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#7f1d1d20'; }}
              >−</AnimButton>
            )}
            <AnimButton
              onClick={handleAdd}
              style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700',
                background: hov ? ACC : `${ACC}20`,
                color: hov ? '#0a0f1e' : ACC,
                transform: pulse ? 'scale(0.94)' : 'scale(1)',
                position: 'relative',
              }}
            >
              {qty > 0 && (
                <span style={{
                  position: 'absolute', top: '-9px', left: '-9px',
                  background: '#ef4444', color: '#fff',
                  width: '20px', height: '20px', borderRadius: '50%',
                  fontSize: '0.66rem', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${C1}`,
                  transform: pulse ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform .25s ease',
                }}>{qty}</span>
              )}
              {product.price === 0 ? 'View' : 'Add to Cart'}
            </AnimButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast, leaving }) {
  return (
    <div style={{
      minWidth: '230px', maxWidth: '320px',
      padding: '13px 16px', borderRadius: '10px',
      background: C1, border: `1px solid ${toast.color}50`,
      borderLeft: `3px solid ${toast.color}`,
      boxShadow: '0 14px 36px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: '11px',
      animation: leaving ? 'toastOut 0.3s cubic-bezier(.4,0,1,1) forwards' : 'toastIn 0.45s cubic-bezier(.22,1,.36,1) both',
      fontSize: '0.85rem', color: BRIGHT, fontWeight: '600',
      pointerEvents: 'auto',
    }}>
      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{toast.icon}</span>
      <span>{toast.message}</span>
    </div>
  );
}

function ToastStack({ toasts }) {
  return createPortal((
    <div style={{ position: 'fixed', top: '76px', right: '24px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
      {toasts.map(t => <Toast key={t.id} toast={t} leaving={t.leaving} />)}
    </div>
  ), document.body);
}

// ── Login Modal ──────────────────────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setResult(null);
    try {
      const res  = await fetch(`${API}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      setResult(data);
      if (data.success) setTimeout(() => { onLogin(data.user); onClose(); }, 1200);
    } catch { setResult({ success: false, error: 'Cannot reach server.' }); }
    finally { setLoading(false); }
  };

  return createPortal((
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn 0.22s ease both' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${ACC}`, borderRadius: '14px', padding: '36px 32px', width: '100%', maxWidth: '400px', animation: 'modalSlideIn 0.32s cubic-bezier(.22,1,.36,1) both' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: '800', color: BRIGHT }}>Sign In</h2>
        <p style={{ margin: '0 0 24px', fontSize: '0.82rem', color: MUTED }}>🔓 This login form is intentionally vulnerable to SQL Injection</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: BODY, display: 'block', marginBottom: '6px' }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="e.g.  ' OR '1'='1'--"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: `1px solid ${C3}`, background: C2, color: BRIGHT, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', transition: 'border-color .2s, box-shadow .2s' }}
              onFocus={e => { e.target.style.borderColor = ACC + '80'; e.target.style.boxShadow = `0 0 0 3px ${ACC}18`; }}
              onBlur={e => { e.target.style.borderColor = C3; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: BODY, display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="any value"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: `1px solid ${C3}`, background: C2, color: BRIGHT, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s' }}
              onFocus={e => { e.target.style.borderColor = ACC + '80'; e.target.style.boxShadow = `0 0 0 3px ${ACC}18`; }}
              onBlur={e => { e.target.style.borderColor = C3; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Sign In — shimmer + ripple + spinner */}
          <AnimButton
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '12px', borderRadius: '7px',
              background: ACC,
              color: '#0a0f1e', fontWeight: '800', fontSize: '0.95rem',
              boxShadow: `0 4px 22px ${ACC}45`,
              letterSpacing: '0.3px',
            }}
          >
            {loading ? (
              <>
                <span style={{ width: '15px', height: '15px', border: '2.5px solid #0a0f1e40', borderTopColor: '#0a0f1e', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Signing in…
              </>
            ) : <>🔑 Sign In</>}
          </AnimButton>
        </div>

        {result && (
          <div style={{
            marginTop: '16px', padding: '12px 14px', borderRadius: '8px',
            background: result.success ? '#064e3b' : '#7f1d1d',
            border: `1px solid ${result.success ? '#10b98140' : '#ef444440'}`,
            fontSize: '0.78rem', fontFamily: 'monospace', color: result.success ? '#34d399' : '#fca5a5',
            lineHeight: '1.7', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            animation: 'fadeUp 0.28s ease both',
          }}>
            {JSON.stringify(result, null, 2)}
          </div>
        )}
      </div>
    </div>
  ), document.body);
}

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ user, onClose }) {
  const rows = [
    { label: 'Username', value: user.username, mono: false },
    { label: 'Password', value: user.password, mono: true },
    { label: 'Email',    value: user.email,    mono: false },
    { label: 'Role',     value: user.role,     mono: false },
    { label: 'Balance',  value: `$${parseFloat(user.account_balance || 0).toLocaleString()}`, mono: true, accent: true },
  ];

  return createPortal((
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn 0.22s ease both' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: `3px solid ${ACC}`, borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '420px', animation: 'modalSlideIn 0.32s cubic-bezier(.22,1,.36,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${ACC}25`, border: `2px solid ${ACC}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem', color: ACC, boxShadow: `0 0 18px ${ACC}40` }}>{getInitials(user.username)}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: BRIGHT }}>My Profile</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: MUTED }}>Raw data pulled from the users table</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rows.map((r, i) => (
            <div key={r.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: '8px',
              background: r.accent ? '#064e3b' : C2,
              border: `1px solid ${r.accent ? '#10b98140' : C3}`,
              animation: `fadeUp 0.38s cubic-bezier(.22,1,.36,1) ${i * 60}ms both`,
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: r.accent ? '#34d399' : MUTED }}>{r.label}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: r.accent ? '#34d399' : BRIGHT, fontFamily: r.mono ? 'monospace' : 'inherit', wordBreak: 'break-all', textAlign: 'right', marginLeft: '12px' }}>{r.value ?? '—'}</span>
            </div>
          ))}
        </div>

        <p style={{ margin: '18px 0 0', fontSize: '0.72rem', color: MUTED, lineHeight: '1.5' }}>
          🔓 This profile intentionally exposes the raw password field — part of the A03 lab scenario.
        </p>

        {/* Close button — ripple + hover glow */}
        <AnimButton
          onClick={onClose}
          style={{
            marginTop: '18px', width: '100%', padding: '11px', borderRadius: '7px',
            border: `1px solid ${C3}`, background: 'transparent', color: BODY,
            fontWeight: '700', fontSize: '0.88rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = C2;
            e.currentTarget.style.color = BRIGHT;
            e.currentTarget.style.borderColor = MUTED;
            e.currentTarget.style.boxShadow = `0 0 12px rgba(255,255,255,0.05)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = BODY;
            e.currentTarget.style.borderColor = C3;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ✕ Close
        </AnimButton>
      </div>
    </div>
  ), document.body);
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return createPortal((
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'backdropIn 0.22s ease both' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C1, border: `1px solid ${C3}`, borderTop: '3px solid #ef4444', borderRadius: '14px', padding: '28px 28px 24px', width: '100%', maxWidth: '360px', animation: 'modalSlideIn 0.32s cubic-bezier(.22,1,.36,1) both' }}>
        <div style={{ fontSize: '1.8rem', marginBottom: '10px', display: 'inline-block', animation: 'wobble 0.5s ease 0.15s both' }}>⚠️</div>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: '800', color: BRIGHT }}>{title}</h2>
        <p style={{ margin: '0 0 22px', fontSize: '0.85rem', color: BODY, lineHeight: '1.55' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Cancel */}
          <AnimButton
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: '7px',
              border: `1px solid ${C3}`, background: 'transparent',
              color: BODY, fontWeight: '700', fontSize: '0.85rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C2; e.currentTarget.style.color = BRIGHT; e.currentTarget.style.borderColor = MUTED; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = BODY; e.currentTarget.style.borderColor = C3; }}
          >
            Cancel
          </AnimButton>

          {/* Sign Out — danger ripple */}
          <AnimButton
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: '7px',
              background: '#ef4444', color: '#fff',
              fontWeight: '800', fontSize: '0.85rem',
              boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(239,68,68,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.4)'; }}
          >
            🚪 {confirmLabel}
          </AnimButton>
        </div>
      </div>
    </div>
  ), document.body);
}

// ── Avatar dropdown ──────────────────────────────────────────────────────────
function AvatarMenu({ user, onLoginClick, onLogout }) {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <AnimButton
        onClick={() => user ? setOpen(o => !o) : onLoginClick()}
        title={user ? user.username : 'Sign in'}
        style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: user ? `${ACC}25` : C2,
          border: `2px solid ${user ? ACC : C3}`,
          color: user ? ACC : BODY,
          fontWeight: '800', fontSize: user ? '0.85rem' : '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: user ? `0 0 14px ${ACC}40` : 'none',
        }}
      >
        {user ? getInitials(user.username) : '👤'}
      </AnimButton>

      {open && user && (
        <div style={{
          position: 'absolute', top: '48px', right: 0,
          background: C1, border: `1px solid ${C3}`,
          borderRadius: '10px', minWidth: '220px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden', zIndex: 200,
          animation: 'menuIn 0.18s cubic-bezier(.22,1,.36,1) both',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C3}`, background: C2 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: BRIGHT }}>{user.username}</div>
            <div style={{ fontSize: '0.75rem', color: MUTED, marginTop: '2px' }}>Role: {user.role}</div>
            <div style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '6px', background: '#064e3b', border: '1px solid #10b98140', fontSize: '0.75rem', fontFamily: 'monospace', color: '#34d399' }}>
              Balance: ${parseFloat(user.account_balance || 0).toLocaleString()}
            </div>
          </div>

          {[
            { icon: '👤', label: 'My Profile', onClick: () => { setOpen(false); setShowProfile(true); } },
            { icon: '📦', label: 'My Orders' },
            { icon: '💳', label: 'Payment Methods' },
            { icon: '⚙️', label: 'Settings' },
          ].map(item => (
            <button key={item.label} onClick={item.onClick}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '11px 16px', background: 'transparent', border: 'none', color: BODY, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', transition: 'background .15s, color .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = C2; e.currentTarget.style.color = BRIGHT; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = BODY; }}
            >
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}

          <div style={{ borderTop: `1px solid ${C3}` }}>
            <AnimButton
              onClick={() => { setOpen(false); setShowConfirmLogout(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 16px',
                background: 'transparent',
                color: '#f87171', fontSize: '0.85rem',
                textAlign: 'left', justifyContent: 'flex-start',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#7f1d1d30'; e.currentTarget.style.color = '#fca5a5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f87171'; }}
            >
              <span>🚪</span><span>Sign Out</span>
            </AnimButton>
          </div>
        </div>
      )}

      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
      {showConfirmLogout && (
        <ConfirmModal
          title="Sign out?"
          message="Are you sure you want to sign out of your account?"
          confirmLabel="Sign Out"
          onCancel={() => setShowConfirmLogout(false)}
          onConfirm={() => { setShowConfirmLogout(false); onLogout(); }}
        />
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function A03Target() {
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchInput,    setSearchInput]    = useState('');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [user,           setUser]           = useState(null);
  const [showLogin,      setShowLogin]      = useState(false);
  const [cart,           setCart]           = useState({});
  const [toasts,         setToasts]         = useState([]);
  const [searching,      setSearching]      = useState(false);
  const [searchFocused,  setSearchFocused]  = useState(false);

  const pushToast = (message, icon = '✅', color = '#22c55e') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, icon, color }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400);
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (product) => {
    setCart(c => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
    pushToast(`Added "${product.name}" to cart`, '🛒', '#ffca28');
  };

  const removeFromCart = (product) => {
    setCart(c => {
      const next = { ...c };
      const cur = next[product.id] || 0;
      if (cur <= 1) delete next[product.id]; else next[product.id] = cur - 1;
      return next;
    });
    pushToast(`Removed "${product.name}" from cart`, '🗑️', '#f87171');
  };

  useEffect(() => {
    fetch(`${API}/categories`).then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true); setError('');
    let url = `${API}/products`;
    if (searchQuery)         url += `?search=${encodeURIComponent(searchQuery)}`;
    else if (activeCategory) url += `?category=${encodeURIComponent(activeCategory)}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); if (d.error) setError(d.error); })
      .catch(() => setError('Cannot reach backend. Make sure Flask is running on port 5000.'))
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery]);

  const handleSearch = (e) => {
    e && e.preventDefault();
    setActiveCategory(''); setSearchQuery(searchInput);
    setSearching(true); setTimeout(() => setSearching(false), 500);
  };

  const handleCategoryClick = (cat) => {
    setSearchInput(''); setSearchQuery('');
    setActiveCategory(prev => prev === cat ? '' : cat);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: '100vh', color: BODY }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: ${MUTED}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C1}; }
        ::-webkit-scrollbar-thumb { background: ${C3}; border-radius: 3px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
        .prod-grid > * { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateX(40px) scale(0.9); }
          60%  { opacity: 1; transform: translateX(-4px) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut { to { opacity: 0; transform: translateX(40px) scale(0.92); } }

        /* ── New animations ── */
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.93); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes rippleAnim {
          from { transform: scale(0); opacity: 1; }
          to   { transform: scale(2.8); opacity: 0; }
        }
        @keyframes wobble {
          0%   { transform: rotate(0deg) scale(1); }
          20%  { transform: rotate(-16deg) scale(1.1); }
          40%  { transform: rotate(12deg) scale(1.05); }
          60%  { transform: rotate(-7deg); }
          80%  { transform: rotate(4deg); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes shimmerSearch {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        button { will-change: transform; }
      `}</style>

      <ToastStack toasts={toasts} />

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={(u) => { setUser(u); pushToast(`Welcome back, ${u.username}!`, '🎉', '#22c55e'); }}
        />
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: `${BG}f0`, backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C3}`,
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${ACC}20`, border: `1px solid ${ACC}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🛒</div>
          <span style={{ fontWeight: '800', fontSize: '1.05rem', color: BRIGHT }}>Sec<span style={{ color: ACC }}>Shop</span></span>
          <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#ef4444', background: '#7f1d1d', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.5px', border: '1px solid #ef444440' }}>SQLi LAB</span>
        </div>

        {/* Search with animated button */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '8px', maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '0.9rem', pointerEvents: 'none',
              color: searchFocused ? ACC : MUTED,
              transition: 'color 0.2s',
            }}>🔍</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products…"
              style={{
                width: '100%', padding: '9px 14px 9px 36px',
                borderRadius: '7px',
                border: `1px solid ${searchFocused ? ACC + '80' : C3}`,
                background: C2, color: BRIGHT, fontSize: '0.86rem', outline: 'none',
                transition: 'border-color .2s, box-shadow .2s',
                boxShadow: searchFocused ? `0 0 0 3px ${ACC}18` : 'none',
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Search button — shimmer while searching */}
          <AnimButton
            onClick={handleSearch}
            style={{
              padding: '9px 20px', borderRadius: '7px',
              background: searching
                ? `linear-gradient(90deg, ${ACC}, #fff5a0 45%, ${ACC})`
                : ACC,
              backgroundSize: '200% auto',
              animation: searching ? 'shimmerSearch 0.7s linear infinite' : 'none',
              color: '#0a0f1e', fontWeight: '700', fontSize: '0.85rem',
              boxShadow: searching ? `0 0 18px ${ACC}70` : `0 2px 10px ${ACC}30`,
              letterSpacing: '0.2px',
            }}
          >
            {searching ? '⌛ Searching…' : '🔍 Search'}
          </AnimButton>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: 'auto', flexShrink: 0 }}>
          <button style={{ position: 'relative', background: 'transparent', border: 'none', color: BODY, fontSize: '1.3rem', cursor: 'pointer', padding: '4px' }} title="Cart">
            🛍️
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-4px', background: ACC, color: '#0a0f1e', width: '16px', height: '16px', borderRadius: '50%', fontSize: '0.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeUp 0.2s ease both' }}>{cartCount}</span>
            )}
          </button>

          <AvatarMenu
            user={user}
            onLoginClick={() => setShowLogin(true)}
            onLogout={() => { setUser(null); pushToast('Signed out successfully', '👋', '#f87171'); }}
          />
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '28px 24px', gap: '28px' }}>
        <aside style={{ width: '200px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[{ label: 'All Products', value: '' }, ...categories.map(c => ({ label: c, value: c }))].map(cat => (
              <button key={cat.value} onClick={() => handleCategoryClick(cat.value)}
                style={{
                  padding: '9px 14px', borderRadius: '7px', border: 'none',
                  background: activeCategory === cat.value ? `${ACC}20` : 'transparent',
                  color: activeCategory === cat.value ? ACC : BODY,
                  fontWeight: activeCategory === cat.value ? '700' : '400',
                  fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left',
                  transition: 'all .15s', display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { if (activeCategory !== cat.value) e.currentTarget.style.background = C2; }}
                onMouseLeave={e => { if (activeCategory !== cat.value) e.currentTarget.style.background = 'transparent'; }}
              >
                <span>{cat.value ? (CAT_ICON[cat.value] || '📦') : '🏪'}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: BRIGHT }}>
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory ? `${CAT_ICON[activeCategory] || '📦'} ${activeCategory}` : '🏪 All Products'}
              </h1>
              {!loading && (
                <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: '4px' }}>
                  {products.length} product{products.length !== 1 ? 's' : ''} found
                  {products.some(p => p.is_hidden) && (
                    <span style={{ color: '#f87171', marginLeft: '8px' }}>· ⚠️ {products.filter(p => p.is_hidden).length} hidden record(s) exposed</span>
                  )}
                </div>
              )}
            </div>
            {(searchQuery || activeCategory) && (
              <AnimButton
                onClick={() => { setSearchInput(''); setSearchQuery(''); setActiveCategory(''); }}
                style={{
                  padding: '6px 14px', borderRadius: '6px', border: `1px solid ${C3}`,
                  background: 'transparent', color: BODY, fontSize: '0.82rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C2; e.currentTarget.style.color = BRIGHT; e.currentTarget.style.borderColor = MUTED; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = BODY; e.currentTarget.style.borderColor = C3; }}
              >
                ✕ Clear filter
              </AnimButton>
            )}
          </div>

          {error && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '8px', background: '#7f1d1d20', border: '1px solid #ef444440', fontSize: '0.82rem', fontFamily: 'monospace', color: '#fca5a5', lineHeight: '1.65', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              <div style={{ fontWeight: '700', marginBottom: '6px', color: '#ef4444' }}>🔴 Database Error (verbose output enabled):</div>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: MUTED }}>
              <div style={{ width: '32px', height: '32px', border: `3px solid ${C3}`, borderTopColor: ACC, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {products.map((p, i) => (
                <div key={i} style={{ animationDelay: `${i * 40}ms` }}>
                  <ProductCard product={p} qty={cart[p.id] || 0} onAdd={() => addToCart(p)} onRemove={() => removeFromCart(p)} />
                </div>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: MUTED }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: BODY, marginBottom: '6px' }}>No products found</div>
              <div style={{ fontSize: '0.85rem' }}>Try a different search term or category filter</div>
            </div>
          )}
        </main>
      </div>

      <div style={{ borderTop: `1px solid ${C3}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.72rem', color: MUTED }}>🔓 SecShop · Intentionally Vulnerable · A03:2021 SQL Injection Lab · For educational use only</span>
      </div>
    </div>
  );
}