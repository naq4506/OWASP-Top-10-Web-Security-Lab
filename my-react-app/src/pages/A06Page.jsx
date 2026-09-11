import React, { useState, useRef, useEffect } from 'react';

// ── A06 color palette — matches A06.jsx / Home's a06 accent (#b388ff)
const T      = '#b388ff';
const BG     = '#0a0f1e';
const C1     = '#120f29';
const C2     = '#1c1935';
const C3     = '#2a2450';
const MUTED  = '#5a5478';
const BODY   = '#a89cc8';
const BRIGHT = '#ece8fa';

const API_BASE = ''; // same-origin; Flask dev server proxied or CORS-enabled

const EXAMPLE_PAYLOAD = `
exploit: !!python/object/apply:subprocess.check_output
  args: [['whoami']]
`;

const SAFE_EXAMPLE = `name: lab-config
version: 1.4
services:
  - api
  - worker
settings:
  debug: false
  retries: 3
`;

const TERMINAL_COMMANDS = ['whoami', 'id', 'pwd', 'hostname', 'uname -a', 'ls', 'env', 'help', 'clear'];

function Code({ children }) {
  return (
    <code style={{
      background: C2, padding: '2px 6px', borderRadius: '4px',
      fontFamily: 'monospace', color: '#f43f5e',
      fontSize: '0.85rem', border: `1px solid ${C3}`,
    }}>{children}</code>
  );
}

// ── Typewriter effect for terminal-style output lines ───────────────
function TypedLine({ text, speed = 12, onDone }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        onDone && onDone();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return <span>{shown}</span>;
}

function Pill({ children, color = T }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: `${color}18`, border: `1px solid ${color}40`,
      borderRadius: '20px', padding: '4px 12px',
      fontSize: '0.72rem', fontWeight: '700', color,
      textTransform: 'uppercase', letterSpacing: '1px',
    }}>{children}</span>
  );
}

// ── YAML → JSON converter panel ─────────────────────────────────────
function YamlConverter() {
  const [yamlText, setYamlText] = useState(SAFE_EXAMPLE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setYamlText(e.target.result);
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const submitConvert = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/a06/yaml-to-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml_content: yamlText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError({ error: 'Network error contacting the lab backend: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setYamlText(EXAMPLE_PAYLOAD);
    setFileName('');
    setResult(null);
    setError(null);
  };

  const loadSafe = () => {
    setYamlText(SAFE_EXAMPLE);
    setFileName('');
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🔄</span>
          <span style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.95rem' }}>YAML → JSON Converter</span>
        </div>
        <Pill>yaml.safe_load() backend</Pill>
      </div>

      <div style={{ padding: '24px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: BODY, lineHeight: '1.6' }}>
          Upload or paste a YAML document. The backend parses it with <Code>yaml.safe_load()</Code> — real
          conversion, zero code execution risk. If a dangerous tag is detected, a clearly-labelled simulated
          warning is also returned.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? T : C3}`, borderRadius: '10px',
            padding: '20px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? `${T}0c` : C2, marginBottom: '14px',
            transition: 'all .2s ease',
          }}
        >
          <input ref={fileInputRef} type="file" accept=".yaml,.yml,.txt" style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0])} />
          <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>📁</div>
          <div style={{ fontSize: '0.85rem', color: BRIGHT, fontWeight: '600' }}>
            {fileName || 'Drop a .yaml/.yml file here, or click to browse'}
          </div>
          <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: '4px' }}>Max 20KB · .yaml, .yml, .txt</div>
        </div>

        <textarea
          value={yamlText}
          onChange={(e) => { setYamlText(e.target.value); setFileName(''); }}
          spellCheck={false}
          style={{
            width: '100%', minHeight: '160px', padding: '14px',
            background: C2, border: `1px solid ${C3}`, borderRadius: '8px',
            color: BRIGHT, fontFamily: 'monospace', fontSize: '0.82rem',
            lineHeight: '1.6', resize: 'vertical', outline: 'none', marginBottom: '14px',
          }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button onClick={submitConvert} disabled={loading} className="a06-btn a06-btn-primary" style={{
            padding: '10px 22px', borderRadius: '6px', border: 'none', fontWeight: '700',
            fontSize: '0.88rem', background: T, color: '#0a0f1e', cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>{loading ? 'Converting…' : '▶ Convert to JSON'}</button>
          <button onClick={loadExample} className="a06-btn a06-btn-danger" style={{
            padding: '10px 18px', borderRadius: '6px', border: `1px solid ${C3}`, fontWeight: '600',
            fontSize: '0.85rem', background: C2, color: '#f43f5e', cursor: 'pointer',
          }}>⚠ Load Example Exploit Payload</button>
          <button onClick={loadSafe} className="a06-btn a06-btn-ghost" style={{
            padding: '10px 18px', borderRadius: '6px', border: `1px solid ${C3}`, fontWeight: '600',
            fontSize: '0.85rem', background: C2, color: BODY, cursor: 'pointer',
          }}>Load Safe Example</button>
        </div>

        {/*
          NOTE: We intentionally only render the `simulated_exploit` block
          (when present) and skip the raw safe_load() error/note text.
          The backend still ALWAYS uses yaml.safe_load() and NEVER executes
          anything — this is purely a UI presentation choice so the panel
          reads like a single clean "result", instead of exposing the
          underlying parser-error plumbing.
        */}
        <style>{`
          @keyframes a06FadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes a06Glow { 0%, 100% { box-shadow: 0 0 0px #eab30800; } 50% { box-shadow: 0 0 14px #eab30855; } }
          @keyframes a06Pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
          .a06-fade-up { animation: a06FadeUp .35s ease-out; }
          .a06-glow-box { animation: a06FadeUp .35s ease-out, a06Glow 2.2s ease-in-out infinite; }
          .a06-pulse-icon { display: inline-block; animation: a06Pulse 1.4s ease-in-out infinite; }
        `}</style>

        {error && error.simulated_exploit && (
          <div className="a06-fade-up" style={{ marginBottom: '14px' }}>
            <div className="a06-glow-box" style={{
              padding: '18px 20px', borderRadius: '8px', background: 'rgba(234,179,8,.07)',
              border: '1px solid #eab30850', borderLeft: '4px solid #eab308',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="a06-pulse-icon" style={{ fontSize: '1.1rem' }}>⚠️</span>
                <span style={{ fontWeight: '800', color: '#eab308', fontSize: '0.88rem' }}>SIMULATED — Nothing Was Executed</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.84rem', color: '#fde68a', lineHeight: '1.65' }}>
                {error.simulated_exploit.warning}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 14px', fontSize: '0.82rem' }}>
                <span style={{ color: MUTED, fontWeight: '700' }}>dangerous_tag_detected:</span>
                <Code>{error.dangerous_tag_detected}</Code>
                <span style={{ color: MUTED, fontWeight: '700' }}>simulated_command:</span>
                <Code>{error.simulated_exploit.simulated_command}</Code>
                <span style={{ color: MUTED, fontWeight: '700' }}>simulated_output:</span>
                <Code><TypedLine text={error.simulated_exploit.simulated_output} speed={18} /></Code>
              </div>
            </div>
          </div>
        )}

        {/* Generic errors (no dangerous tag involved) still show the plain message */}
        {error && !error.simulated_exploit && (
          <div className="a06-fade-up" style={{
            marginBottom: '14px', padding: '16px 18px', borderRadius: '8px', background: '#7f1d1d20',
            border: '1px solid #ef444450', borderLeft: '4px solid #ef4444',
          }}>
            <div style={{ fontWeight: '700', color: '#fca5a5', fontSize: '0.88rem' }}>
              {error.error}
            </div>
          </div>
        )}

        {result && (
          <div className="a06-fade-up">
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: T, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              JSON Result
            </div>
            <pre style={{
              background: C2, border: `1px solid ${C3}`, borderRadius: '8px', padding: '16px',
              fontFamily: 'monospace', fontSize: '0.8rem', color: '#a7f3d0', overflowX: 'auto',
            }}>{JSON.stringify(result.json_result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fixed-command fake terminal panel ───────────────────────────────
function FakeTerminal() {
  const [lines, setLines] = useState([
    { type: 'system', text: 'Simulated lab terminal — fixed command set only. Type "help" to list commands.', typed: true },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const markTyped = (idx) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, typed: true } : l)));
  };

  const runCommand = async (rawCmd) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;
    setLines((prev) => [...prev, { type: 'input', text: cmd, typed: true }]);

    if (cmd.toLowerCase() === 'clear') {
      setLines([{ type: 'system', text: 'Terminal cleared.', typed: true }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/a06/terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      setLines((prev) => [...prev, { type: 'output', text: data.output, typed: false }]);
    } catch (err) {
      setLines((prev) => [...prev, { type: 'error', text: 'Network error: ' + err.message, typed: false }]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    runCommand(input);
    setInput('');
  };

  return (
    <div style={{ background: C1, border: `1px solid ${C3}`, borderRadius: '12px', overflow: 'hidden' }}>
      <style>{`
        @keyframes a06Blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
        @keyframes a06LineIn { from { opacity: 0; } to { opacity: 1; } }
        .a06-cursor { display: inline-block; width: 7px; height: 14px; background: ${T}; margin-left: 2px; vertical-align: middle; animation: a06Blink 1s step-end infinite; }
        .a06-term-line { animation: a06LineIn .2s ease-out; }
      `}</style>
      <div style={{ background: C2, borderBottom: `1px solid ${C3}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🖥️</span>
          <span style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.95rem' }}>Lab Terminal (Fixed Commands)</span>
        </div>
        <Pill color="#22c55e">No real shell access</Pill>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <p style={{ margin: '0 0 14px', fontSize: '0.83rem', color: BODY, lineHeight: '1.6' }}>
          This terminal does not call <Code>subprocess</Code>, <Code>os.system</Code>, or any real shell. Every
          response is a pre-written string looked up from a fixed allow-list of commands.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {TERMINAL_COMMANDS.map((c) => (
            <button key={c} onClick={() => runCommand(c)} disabled={loading} className="a06-btn a06-btn-cmd" style={{
              padding: '5px 10px', borderRadius: '5px', border: `1px solid ${C3}`,
              background: C2, color: T, fontSize: '0.75rem', fontFamily: 'monospace',
              cursor: loading ? 'wait' : 'pointer',
            }}>{c}</button>
          ))}
        </div>

        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            background: '#06070f', border: `1px solid ${C3}`, borderRadius: '8px',
            padding: '16px', height: '260px', overflowY: 'auto',
            fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.7', cursor: 'text',
          }}>
          {lines.map((l, i) => (
            <div key={i} className="a06-term-line" style={{
              color: l.type === 'input' ? '#7dd3fc' : l.type === 'error' ? '#fca5a5' : l.type === 'system' ? MUTED : '#a7f3d0',
              whiteSpace: 'pre-wrap', marginBottom: '4px',
            }}>
              {l.type === 'input'
                ? `$ ${l.text}`
                : l.typed
                  ? l.text
                  : <TypedLine text={l.text} speed={8} onDone={() => markTyped(i)} />}
            </div>
          ))}
          {loading && <div style={{ color: MUTED }}>…</div>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <span style={{ color: T, fontFamily: 'monospace', fontSize: '0.95rem', alignSelf: 'center' }}>$</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Try: whoami, id, ls, env, help…"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '6px', border: `1px solid ${C3}`,
                background: C2, color: BRIGHT, fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none',
              }}
            />
          </div>
          <button type="submit" disabled={loading} className="a06-btn a06-btn-primary" style={{
            padding: '10px 18px', borderRadius: '6px', border: 'none', fontWeight: '700',
            fontSize: '0.85rem', background: T, color: '#0a0f1e', cursor: loading ? 'wait' : 'pointer',
          }}>Run</button>
        </form>
      </div>
    </div>
  );
}

// ── Page shell ───────────────────────────────────────────────────────
export default function A06Page({ onBack }) {
  const close = () => { if (onBack) onBack(); else window.close(); };

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: BG, minHeight: '100vh', color: BODY }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:${C1}; }
        ::-webkit-scrollbar-thumb { background:${C3}; border-radius:3px; }
        input::placeholder, textarea::placeholder { color: ${MUTED}; }

        .a06-btn {
          transition: transform .15s ease, box-shadow .15s ease, filter .15s ease, opacity .15s ease;
        }
        .a06-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.03);
          filter: brightness(1.08);
        }
        .a06-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.97);
          filter: brightness(0.95);
        }
        .a06-btn-primary:hover:not(:disabled) {
          box-shadow: 0 4px 16px ${T}55;
        }
        .a06-btn-danger:hover:not(:disabled) {
          box-shadow: 0 4px 14px #f43f5e40;
          border-color: #f43f5e80 !important;
        }
        .a06-btn-ghost:hover:not(:disabled) {
          box-shadow: 0 4px 14px ${T}25;
          border-color: ${T}80 !important;
        }
        .a06-btn-cmd:hover:not(:disabled) {
          background: ${T}1c !important;
          border-color: ${T}80 !important;
          box-shadow: 0 2px 10px ${T}30;
        }
        .a06-btn-close:hover {
          background: ${C2} !important;
          border-color: #f43f5e60 !important;
          color: #fca5a5 !important;
        }
        .a06-btn:disabled { transform: none; filter: none; }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: `${BG}f0`, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C3}`, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ fontWeight: '700', color: BRIGHT, fontSize: '0.92rem' }}>Target: A06 Lab Site</span>
        </div>
        <button onClick={close} className="a06-btn a06-btn-close" style={{
          padding: '7px 16px', borderRadius: '6px', border: `1px solid ${C3}`, background: 'transparent',
          color: BODY, fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
        }}>✕ Close Tab</button>
      </nav>

      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: '800', color: BRIGHT }}>
            Internal Config Tools
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: MUTED, lineHeight: '1.6' }}>
            A small internal portal used by the ops team to convert config files and run quick diagnostics.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <YamlConverter />
          <FakeTerminal />
        </div>
      </div>
    </div>
  );
}