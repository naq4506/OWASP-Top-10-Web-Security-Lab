import React, { useState } from 'react';

const LOGS = [
  { id: 1,  time: '2025-01-15', clock: '08:20:11', status: 200, statusLabel: '200 OK',      ip: '172.217.22.67',  method: 'GET',  url: '/home',                          username: null },
  { id: 2,  time: '2025-01-15', clock: '08:22:44', status: 200, statusLabel: '200 OK',      ip: '104.21.234.89',  method: 'GET',  url: '/profile',                       username: null },
  { id: 3,  time: '2025-01-15', clock: '08:25:47', status: 302, statusLabel: '302 Redirect', ip: '87.120.45.78',  method: 'GET',  url: '/oldpage',                       username: null },
  { id: 4,  time: '2025-01-15', clock: '08:27:03', status: 200, statusLabel: '200 OK',      ip: '104.21.234.89',  method: 'GET',  url: '/profile',                       username: null },
  { id: 5,  time: '2025-01-15', clock: '08:28:19', status: 401, statusLabel: '401 Unauthorized', ip: '51.195.67.123', method: 'POST', url: '/login?user=john&pass=wrong123',  username: 'john' },
  { id: 6,  time: '2025-01-15', clock: '08:29:42', status: 200, statusLabel: '200 OK',      ip: '45.142.212.61',  method: 'POST', url: '/transfer',                      username: null },
  { id: 7,  time: '2025-01-15', clock: '08:31:05', status: 200, statusLabel: '200 OK',      ip: '185.220.101.56', method: 'GET',  url: '/help',                          username: null },
  { id: 8,  time: '2025-01-15', clock: '08:32:28', status: 200, statusLabel: '200 OK',      ip: '198.51.100.42',  method: 'GET',  url: '/transactions',                  username: null },
  { id: 9,  time: '2025-01-15', clock: '08:33:51', status: 302, statusLabel: '302 Redirect', ip: '93.184.216.34', method: 'GET',  url: '/legacy',                        username: null },
  { id: 10, time: '2025-01-15', clock: '08:35:14', status: 200, statusLabel: '200 OK',      ip: '74.125.224.23',  method: 'GET',  url: '/balance',                       username: null },
  { id: 11, time: '2025-01-15', clock: '08:36:02', status: 200, statusLabel: '200 OK',      ip: '208.80.152.45',  method: 'GET',  url: '/cards',                         username: null },
  { id: 12, time: '2025-01-15', clock: '08:37:10', status: 401, statusLabel: '401 Unauthorized', ip: '151.80.31.167', method: 'POST', url: '/login?user=admin&pass=admin', username: 'admin' },
  { id: 13, time: '2025-01-15', clock: '08:37:22', status: 401, statusLabel: '401 Unauthorized', ip: '151.80.31.167', method: 'POST', url: '/login?user=administrator&pass=password', username: 'administrator' },
  { id: 14, time: '2025-01-15', clock: '08:37:35', status: 401, statusLabel: '401 Unauthorized', ip: '151.80.31.167', method: 'POST', url: '/login?user=root&pass=toor',  username: 'root' },
  { id: 15, time: '2025-01-15', clock: '08:37:48', status: 401, statusLabel: '401 Unauthorized', ip: '151.80.31.167', method: 'POST', url: '/login?user=sarah&pass=qwerty', username: 'sarah' },
  { id: 16, time: '2025-01-15', clock: '08:38:00', status: 401, statusLabel: '401 Unauthorized', ip: '151.80.31.167', method: 'POST', url: '/login?user=sarah&pass=test123', username: 'sarah' },
  { id: 17, time: '2025-01-15', clock: '08:38:13', status: 401, statusLabel: '401 Unauthorized', ip: '151.80.31.167', method: 'POST', url: '/login?user=sarah&pass=sarah2025', username: 'sarah' },
  { id: 18, time: '2025-01-15', clock: '08:38:26', status: 200, statusLabel: '200 OK',      ip: '151.80.31.167',  method: 'POST', url: '/login?user=sarah&pass=iloveyou', username: 'sarah' },
  { id: 19, time: '2025-01-15', clock: '08:39:23', status: 200, statusLabel: '200 OK',      ip: '172.217.22.67',  method: 'GET',  url: '/loans',                         username: null },
  { id: 20, time: '2025-01-15', clock: '08:41:55', status: 200, statusLabel: '200 OK',      ip: '192.168.1.10',   method: 'GET',  url: '/dashboard',                     username: null },
];

function statusColor(code) {
  if (code === 200) return { bg: '#14532d', text: '#4ade80', border: '#16a34a' };
  if (code === 302) return { bg: '#1e3a5f', text: '#60a5fa', border: '#2563eb' };
  if (code === 401) return { bg: '#7f1d1d', text: '#f87171', border: '#dc2626' };
  return { bg: '#1e293b', text: '#94a3b8', border: '#475569' };
}

function methodColor(m) {
  if (m === 'GET')  return { bg: '#0c4a6e', text: '#38bdf8' };
  if (m === 'POST') return { bg: '#3b0764', text: '#c084fc' };
  return { bg: '#1e293b', text: '#94a3b8' };
}

export default function A09LogSite() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const filters = ['ALL', '200', '302', '401'];
  const filtered = filter === 'ALL' ? LOGS : LOGS.filter(l => String(l.status) === filter);
  const log = selected != null ? LOGS.find(l => l.id === selected) : null;

  return (
    <div style={{ fontFamily: "'Segoe UI', monospace", background: '#0d1117', minHeight: '100vh', color: '#e2e8f0' }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .log-row { cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #1e293b; }
        .log-row:hover { background: #161b22 !important; }
        .log-row.active { background: #0f2233 !important; border-left: 3px solid #22d3ee; }
        .filter-btn { border: none; cursor: pointer; padding: 5px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; transition: all 0.15s; }
        .slide-in { animation: slideIn 0.2s ease; }
        @keyframes slideIn { from { opacity:0; transform: translateX(10px); } to { opacity:1; transform: translateX(0); } }
        .blink { animation: blink 1.4s step-start infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>

      {/* Top bar */}
      <div style={{ background: '#010409', borderBottom: '1px solid #21262d', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }} className="blink" />
          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#22d3ee', fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
        </div>
        <span style={{ color: '#475569', fontSize: '0.85rem' }}>|</span>
        <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#64748b' }}>🛡️ SecureBank · Authentication Service · Log Monitor</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
        </div>
      </div>

      {/* Sub-header */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #21262d', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'monospace' }}>Filter by status:</span>
        {filters.map(f => {
          const active = filter === f;
          const colors = { ALL: '#22d3ee', '200': '#4ade80', '302': '#60a5fa', '401': '#f87171' };
          return (
            <button key={f} className="filter-btn" onClick={() => setFilter(f)} style={{
              background: active ? `${colors[f]}20` : '#161b22',
              color: active ? colors[f] : '#64748b',
              border: `1px solid ${active ? colors[f] : '#21262d'}`,
              boxShadow: active ? `0 0 8px ${colors[f]}40` : 'none',
            }}>{f === 'ALL' ? 'All' : `${f}`}</button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '0.78rem', color: '#334155' }}>
          {filtered.length} entries · 2025-01-15
        </span>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 92px)' }}>
        {/* Log table */}
        <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '130px 140px 60px 70px 1fr', gap: '0 16px', padding: '8px 20px', background: '#010409', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, zIndex: 10 }}>
            {['TIMESTAMP', 'IP ORIGIN', 'STATUS', 'METHOD', 'REQUEST URL'].map(h => (
              <span key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{h}</span>
            ))}
          </div>

          {filtered.map(l => {
            const sc = statusColor(l.status);
            const mc = methodColor(l.method);
            const isActive = selected === l.id;
            return (
              <div
                key={l.id}
                className={`log-row${isActive ? ' active' : ''}`}
                onClick={() => setSelected(isActive ? null : l.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 140px 60px 70px 1fr',
                  gap: '0 16px',
                  padding: '10px 20px',
                  background: isActive ? '#0f2233' : l.status === 401 ? '#100a0a' : 'transparent',
                  borderLeft: isActive ? '3px solid #22d3ee' : '3px solid transparent',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  <div style={{ color: '#e2e8f0' }}>{l.time}</div>
                  <div style={{ color: '#475569' }}>{l.clock}</div>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#94a3b8' }}>{l.ip}</div>
                <div>
                  <span style={{
                    background: sc.bg, color: sc.text,
                    border: `1px solid ${sc.border}`,
                    padding: '2px 7px', borderRadius: '4px',
                    fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap',
                  }}>{l.status}</span>
                </div>
                <div>
                  <span style={{
                    background: mc.bg, color: mc.text,
                    padding: '2px 8px', borderRadius: '4px',
                    fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace',
                  }}>{l.method}</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: l.status === 401 ? '#fca5a5' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.url}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {log ? (
          <div className="slide-in" style={{
            width: '320px', flexShrink: 0,
            background: '#010409', borderLeft: '1px solid #21262d',
            overflowY: 'auto', padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ color: '#22d3ee', fontSize: '1rem' }}>🛡️</div>
              <span style={{ color: '#22d3ee', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>Log Details</span>
              <button onClick={() => setSelected(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>

            {[
              { label: 'Timestamp', value: `${log.time} ${log.clock}` },
              { label: 'HTTP Response Code', value: log.status },
              { label: 'IP Origin', value: log.ip },
              { label: 'Request Type', value: log.method },
              { label: 'Request URL', value: log.url },
            ].map(({ label, value }) => {
              const sc = label === 'HTTP Response Code' ? statusColor(log.status) : null;
              return (
                <div key={label} style={{ marginBottom: '18px', borderBottom: '1px solid #161b22', paddingBottom: '14px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>
                  {sc ? (
                    <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: '3px 10px', borderRadius: '5px', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>{log.statusLabel}</span>
                  ) : (
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', wordBreak: 'break-all', lineHeight: 1.5 }}>{value}</div>
                  )}
                </div>
              );
            })}

            {log.status === 401 && (
              <div style={{ background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: '6px', padding: '12px', marginTop: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, marginBottom: '4px' }}>⚠️ ANOMALY DETECTED</div>
                <div style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.5 }}>
                  This request resulted in an authentication failure. Multiple failures from the same IP may indicate a credential attack.
                </div>
              </div>
            )}
            {log.status === 200 && log.ip === '151.80.31.167' && (
              <div style={{ background: '#0d2d1a', border: '1px solid #166534', borderRadius: '6px', padding: '12px', marginTop: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700, marginBottom: '4px' }}>🔓 ACCESS GRANTED</div>
                <div style={{ fontSize: '0.8rem', color: '#86efac', lineHeight: 1.5 }}>
                  Login succeeded after multiple failures. Possible successful brute force on this account.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: '280px', flexShrink: 0, background: '#010409', borderLeft: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#334155' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>Click a row to<br />inspect log details</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}