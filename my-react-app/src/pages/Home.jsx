import React, { useState } from 'react';

function Home({ onSelectModule }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Hệ thống màu Neon công nghệ cao (High-Tech Palette)
  const modules = [
{ id: 'a01', name: 'Broken Access Control', desc: 'Restrictions on what authenticated users are allowed to do are not properly enforced.', color: '#00f0ff' },
    { id: 'a02', name: 'Cryptographic Failures', desc: 'Focuses on failures related to cryptography which often leads to sensitive data exposure.', color: '#ff6b6b' },
    { id: 'a03', name: 'Injection', desc: 'Supplied data is not filtered, filtered improperly, or executed directly by the interpreter.', color: '#ffca28' },
    { id: 'a04', name: 'Insecure Design', desc: 'A broad category representing different flaws, focusing on risks related to design flaws.', color: '#4edf7c' },
    { id: 'a05', name: 'Security Misconfiguration', desc: 'Highly customizable component setups or default configurations left unchanged.', color: '#29b6f6' },
    { id: 'a06', name: 'Vulnerable Components', desc: 'Using third-party components that contain known security bugs or unpatched exploits.', color: '#b388ff' },
    { id: 'a07', name: 'Identification & Authentication', desc: 'Confirmation of the user\'s identity, authentication, and session management fail.', color: '#ff2d95' },
    { id: 'a08', name: 'Software & Data Integrity Failures', desc: 'Code and infrastructure that does not protect against integrity violations.', color: '#ff7a00' },
    { id: 'a09', name: 'Security Logging & Monitoring', desc: 'Failures to detect, escalate, and respond to active security breaches in real-time.', color: '#00f0ff' },
    { id: 'a10', name: 'Server-Side Request Forgery', desc: 'Web applications fetching a remote resource without validating the user-supplied URL.', color: '#d4ff00' }
  ];

  return (
    <div style={styles.container}>
      {/* Lưới ảo ảnh công nghệ dạng sáng mảnh */}
      <div style={styles.cyberGridOverlay}></div>

      <div style={styles.innerContent}>
        <header style={styles.header}>
          <div style={styles.logoTech}>SYSTEM SECURITY LAB</div>
          <h1 style={styles.title}>OWASP TOP 10 VULNERABILITIES</h1>
          <p style={styles.subtitle}>
            Security Practice Academy — Experiment with real-world cyber attack scenarios
          </p>
          <div style={styles.headerLine}></div>
        </header>

        <div style={styles.grid}>
          {modules.map((mod) => {
            const isHovered = hoveredId === mod.id;

            const dynamicCardStyle = {
              ...styles.card,
              backgroundColor: isHovered ? '#1e293b' : '#111c30', 
              borderColor: isHovered ? mod.color : '#1e293b',
              transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: isHovered 
                ? `0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px ${mod.color}40` 
                : '0 4px 15px rgba(0, 0, 0, 0.2)',
            };

            return (
              <div 
                key={mod.id} 
                style={dynamicCardStyle}
                onClick={() => onSelectModule(mod.id)}
                onMouseEnter={() => setHoveredId(mod.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Viền góc phát sáng khi hover */}
                {isHovered && <div style={{ ...styles.cornerLight, top: -1, left: -1, borderLeftColor: mod.color, borderTopColor: mod.color }} />}
                
                <div style={styles.cardContent}>
                  <div style={styles.cardHeaderArea}>
                    <span style={{ 
                      ...styles.badge, 
                      color: mod.color, 
                      borderColor: `${mod.color}60`,
                      backgroundColor: 'rgba(9, 15, 28, 0.4)',
                      boxShadow: isHovered ? `0 0 10px ${mod.color}40` : 'none'
                    }}>
                      {mod.id.toUpperCase()}
                    </span>
                    <span style={{ ...styles.techIndex, color: isHovered ? `${mod.color}70` : '#475569' }}>
                      // 0{mod.id.replace('a','') }
                    </span>
                  </div>
                  
                  <h3 style={{ ...styles.cardTitle, color: isHovered ? mod.color : '#ffffff' }}>
                    {mod.name}
                  </h3>
                  <p style={styles.cardDescription}>{mod.desc}</p>
                </div>

                <div style={{ 
                  ...styles.arrow, 
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                  color: isHovered ? mod.color : '#475569',
                  textShadow: isHovered ? `0 0 10px ${mod.color}` : 'none'
                }}>
                  🗲
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#0a1120', 
    minHeight: '100vh',
    width: '100%',
    padding: '60px 0',
    boxSizing: 'border-box',
    position: 'relative',
    overflowX: 'hidden'
  },
  cyberGridOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.3) 1px, transparent 1px), 
                      linear-gradient(90deg, rgba(30, 41, 59, 0.3) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 1
  },
  innerContent: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '0 24px',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 2
  },
  header: {
    textAlign: 'center',
    marginBottom: '55px',
    padding: '0 10px'
  },
  logoTech: {
    color: '#00f0ff',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '3px',
    marginBottom: '14px',
    textShadow: '0 0 10px rgba(0,240,255,0.4)'
  },
  title: {
    color: '#ffffff',
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', // Khắc phục lỗi vỡ font: Tự co giãn thông minh theo màn hình
    fontWeight: '800',
    margin: '0 auto 16px auto',
    maxWidth: '100%',
    lineHeight: '1.2',
    letterSpacing: '0.5px', // Giảm bớt khoảng cách chữ tránh dính chữ
    wordBreak: 'break-word',
    background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8', 
    fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', // Tự động co giãn kích thước linh hoạt
    margin: '0 auto',
    maxWidth: '700px',
    fontWeight: '400',
    lineHeight: '1.5'
  },
  headerLine: {
    width: '60px',
    height: '3px',
    backgroundColor: '#00f0ff',
    margin: '22px auto 0 auto',
    boxShadow: '0 0 10px #00f0ff'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '26px',
  },
  card: {
    borderRadius: '14px', 
    padding: '28px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    border: '1px solid #1e293b',
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    position: 'relative',
  },
  cornerLight: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderLeft: '2px solid',
    borderTop: '2px solid',
    borderRadius: '4px 0 0 0'
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px'
  },
  badge: {
    padding: '4px 14px',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '700',
    border: '1px solid',
    letterSpacing: '0.5px',
    transition: 'all 0.25s ease'
  },
  techIndex: {
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'all 0.25s ease'
  },
  cardTitle: {
    margin: '0 0 12px 0',
    fontSize: '1.25rem',
    lineHeight: '1.4',
    fontWeight: '700',
    letterSpacing: '-0.2px',
    transition: 'color 0.25s ease'
  },
  cardDescription: {
    margin: 0,
    color: '#94a3b8', 
    fontSize: '0.88rem',
    lineHeight: '1.55',
  },
  arrow: {
    fontSize: '1.5rem',
    marginLeft: '20px',
    transition: 'all 0.25s ease',
    userSelect: 'none'
  }
};

export default Home;