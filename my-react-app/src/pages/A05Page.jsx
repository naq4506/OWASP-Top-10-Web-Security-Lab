import React, { useState, useEffect, useRef } from 'react';

// ── Color palette — matches A05.jsx ──────────────────────────────
const T      = '#29b6f6';
const BG     = '#0a1120';
const C1     = '#0c1829';
const C2     = '#0f1f35';
const C3     = '#1a3050';
const MUTED  = '#4a6280';
const BODY   = '#8ba4c0';
const BRIGHT = '#e2eaf4';

const API_BASE = 'http://localhost:5000';

const QUICK_COMMANDS = [
  'help',
  'ls /a05/uploads/',
  'cat /a05/uploads/.env',
  'cat /a05/uploads/passwords_old.txt',
  'curl -I http://localhost:5000/a05/headers',
  'curl http://localhost:5000/a05/console',
];

// ── Terminal output line types ────────────────────────────────────
function TermLine({ line }) {
  if (line.type === 'cmd') {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '2px' }}>
        <span style={{ color: '#22c55e', fontWeight: '700', flexShrink: 0 }}>www-data@lab</span>
        <span style={{ color: MUTED, flexShrink: 0 }}>:~$</span>
        <span style={{ color: BRIGHT }}>{line.text}</span>
      </div>
    );
  }
  if (line.type === 'out') {
    return (
      <div style={{ color: BODY, marginBottom: '2px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {line.text}
      </div>
    );
  }
  if (line.type === 'err') {
    return (
      <div style={{ color: '#f87171', marginBottom: '2px', whiteSpace: 'pre-wrap' }}>
        {line.text}
      </div>
    );
  }
  if (line.type === 'info') {
    return (
      <div style={{ color: T, marginBottom: '2px', fontStyle: 'italic', fontSize: '0.82rem' }}>
        {line.text}
      </div>
    );
  }
  return null;
}

// ── Terminal ──────────────────────────────────────────────────────
function Terminal() {
  const [history, setHistory] = useState([
    { type: 'info', text: 'Security Lab — A05:2021 Misconfiguration' },
    { type: 'info', text: 'Connected to: localhost:5000  ·  Type "help" for commands' },
    { type: 'info', text: '─────────────────────────────────────────────────────' },
  ]);
  const [input, setInput]         = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx]     = useState(-1);
  const [loading, setLoading]     = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const runCommand = async (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setCmdHistory(p => [cmd, ...p]);
    setHistIdx(-1);
    setHistory(p => [...p, { type: 'cmd', text: cmd }]);

    if (cmd.toLowerCase() === 'clear') {
      setHistory([{ type: 'info', text: 'Terminal cleared.' }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/a05/api/terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      const out = data.output || '';
      if (out === '__CLEAR__') {
        setHistory([{ type: 'info', text: 'Terminal cleared.' }]);
      } else {
        setHistory(p => [...p, { type: 'out', text: out }]);
      }
    } catch {
      setHistory(p => [...p, { type: 'err', text: '⚠ Connection error — is the lab server running?' }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') { runCommand(input); setInput(''); }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : cmdHistory[idx] || '');
    }
  };

  const insertQuick = (cmd) => {
    setInput(cmd);
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: '#050d18', fontFamily: "'JetBrains Mono','Fira Code',monospace",
        fontSize: '0.86rem', lineHeight: '1.7', overflow: 'hidden', cursor: 'text',
      }}
    >
      {/* Terminal toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '9px 18px', background: C2, borderBottom: `1px solid ${C3}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
        </div>
        <span style={{ fontSize: '0.74rem', color: MUTED, marginLeft: '8px', flex: 1, textAlign: 'center' }}>
          bash — www-data@lab-a05
        </span>
        {loading && (
          <span style={{ fontSize: '0.7rem', color: T, animation: 'glowPulse 1s infinite' }}>●</span>
        )}
      </div>

      {/* Output area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {history.map((line, i) => <TermLine key={i} line={line} />)}
        <div ref={bottomRef} />
      </div>

      {/* Quick command chips */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px',
        padding: '12px 20px', borderTop: `1px solid ${C3}`,
        background: C1, flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.7rem', color: MUTED, alignSelf: 'center', marginRight: '4px' }}>Try:</span>
        {QUICK_COMMANDS.map(cmd => (
          <button
            key={cmd}
            onClick={(e) => { e.stopPropagation(); insertQuick(cmd); }}
            style={{
              padding: '4px 10px', borderRadius: '5px', border: `1px solid ${C3}`,
              background: C2, color: T, fontFamily: 'monospace', fontSize: '0.74rem',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T; e.currentTarget.style.background = `${T}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C3; e.currentTarget.style.background = C2; }}
          >{cmd}</button>
        ))}
      </div>

      {/* Input line */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 20px', borderTop: `1px solid ${C3}`,
        background: '#050d18', flexShrink: 0,
      }}>
        <span style={{ color: '#22c55e', fontWeight: '700', flexShrink: 0 }}>www-data@lab</span>
        <span style={{ color: MUTED, flexShrink: 0 }}>:~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
          spellCheck={false}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: BRIGHT, fontFamily: 'inherit', fontSize: 'inherit',
            caretColor: T,
          }}
          placeholder={loading ? 'running…' : 'type a command…'}
          disabled={loading}
        />
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────
export default function A05Lab({ onBack }) {
  const [backHov, setBackHov] = useState(false);

  return (
    <div style={{
      fontFamily: "'Segoe UI',system-ui,sans-serif",
      background: BG, height: '100vh', display: 'flex', flexDirection: 'column',
      color: BODY, overflow: 'hidden',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes glowPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
        input::placeholder { color:${MUTED}; }
      `}</style>

      {/* NAV */}
      <nav style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px',
        padding: '10px 24px', background: `${BG}e8`, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C3}`, zIndex: 10,
      }}>
        <button
          onClick={onBack}
          onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
          style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
            cursor: 'pointer', border: `1px solid ${backHov ? T : C3}`,
            color: backHov ? T : BODY, background: 'transparent',
            transform: backHov ? 'translateX(-3px)' : 'none', transition: 'all .2s',
          }}
        >← Back</button>

        {/* URL bar removed */}
        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: T, boxShadow: `0 0 8px ${T}`, animation: 'glowPulse 2s infinite' }} />
          <span style={{ fontSize: '0.78rem', color: MUTED, letterSpacing: '1px', textTransform: 'uppercase' }}>A05 Lab</span>
          <span style={{ color: C3 }}>·</span>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: T }}>Terminal</span>
        </div>
      </nav>

      {/* Terminal fills the rest of the screen */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Terminal />
      </div>
    </div>
  );
}