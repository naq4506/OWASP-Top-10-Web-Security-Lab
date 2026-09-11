import React, { useState, useRef, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

const ACCENT = '#d4ff00';
const BG     = '#0a1120';
const CARD   = '#111c30';
const BORDER = '#1e293b';
const MUTED  = '#94a3b8';
const BRIGHT = '#ffffff';
const DIM    = '#475569';

const BLOGS = [
  {
    value: 'blog1.txt',
    tag: 'Cloud Security',
    readTime: '6 min read',
    date: 'Jun 12, 2025',
    title: 'Introduction to Cloud Security',
    excerpt: 'How shared responsibility between providers and customers shapes the modern cloud security model.',
    content: `Cloud security is a shared responsibility between the provider and the customer. While hyperscalers like AWS, Azure, and GCP invest billions in securing the underlying physical and virtual infrastructure, the customer is solely accountable for what they build on top.

This means configuring identity policies with least-privilege principles, locking down network rules with security groups and VPCs, enabling encryption at rest and in transit, and applying application-level access controls that suit your threat model.

Misconfigurations are the leading cause of cloud data breaches. Publicly exposed S3 buckets, over-permissive IAM roles, and disabled CloudTrail logging have each led to high-profile incidents. The good news: cloud providers surface native tooling — AWS Config, Azure Policy, GCP Security Command Center — that continuously audits your posture.

Zero-trust architecture extends this further: assume breach, verify every request, and enforce micro-segmentation so that a compromised workload cannot pivot laterally through your environment. Combined with immutable infrastructure and automated patch pipelines, this dramatically shrinks the blast radius of any successful intrusion.`,
  },
  {
    value: 'blog2.txt',
    tag: 'API Design',
    readTime: '5 min read',
    date: 'Jun 15, 2025',
    title: 'Understanding REST APIs',
    excerpt: 'Statelessness, uniform interfaces, and the architectural constraints that define the REST style.',
    content: `REST (Representational State Transfer) is an architectural style, not a protocol. Its six constraints — statelessness, client-server separation, cacheability, uniform interface, layered system, and code-on-demand (optional) — together produce highly scalable, loosely coupled systems.

The uniform interface constraint is what most developers interact with daily: resources are identified by URIs, manipulated via standard HTTP verbs (GET, POST, PUT, PATCH, DELETE), and represented in negotiated formats (typically JSON or XML). Responses carry status codes that communicate outcome without requiring the client to inspect the body.

Statelessness is the scalability superpower: each request contains all information necessary to process it, freeing servers to handle requests from any client without session affinity. This is why REST APIs pair so well with horizontal auto-scaling groups behind load balancers.

Versioning strategy matters enormously as APIs evolve. URI versioning (/v1/, /v2/) offers clarity; header-based versioning (Accept: application/vnd.api+json;version=2) keeps URIs clean. Whichever you choose, communicate deprecation timelines clearly and honour them — breaking changes silently erode consumer trust.`,
  },
  {
    value: 'blog3.txt',
    tag: 'Architecture',
    readTime: '7 min read',
    date: 'Jun 18, 2025',
    title: 'Microservices Architecture 101',
    excerpt: 'Decomposing monoliths into independently deployable services — and the security surface that expands with them.',
    content: `Microservices decompose a monolithic application into small, independently deployable units that communicate over the network. Each service owns a bounded domain context — orders, inventory, payments — and exposes a well-defined API contract to the rest of the system.

The operational benefits are real: teams ship independently, services scale in isolation, and a failure in one domain no longer cascades across the entire process. But the architectural shift introduces new complexity that monoliths never faced.

Every internal call is now a network call. Latency, partial failure, and serialization overhead must all be accounted for. Circuit breakers (Hystrix, Resilience4j) prevent cascading failures; distributed tracing (Jaeger, Zipkin) replaces function call stacks as your debugging primitive; service meshes (Istio, Linkerd) enforce mutual TLS and policy without application code changes.

From a security perspective, the attack surface expands with every new service boundary. East-west traffic between services is often trusted implicitly — a dangerous assumption. Enforce authentication on internal APIs with short-lived tokens, log all inter-service calls to your SIEM, and run network policies that allowlist only the communication paths your architecture actually requires.`,
  },
  {
    value: 'blog4.txt',
    tag: 'DevOps',
    readTime: '6 min read',
    date: 'Jun 21, 2025',
    title: 'DevOps Best Practices',
    excerpt: 'From CI/CD pipelines to infrastructure-as-code: the practices that close the gap between development and operations.',
    content: `DevOps is fundamentally a culture shift before it is a toolchain. Breaking down silos between development and operations teams enables faster feedback loops, shared ownership of reliability, and a system that continuously improves rather than accumulates technical debt.

Continuous integration (CI) validates every commit: automated builds, unit tests, integration tests, and static analysis run in minutes, surfacing regressions before they reach production. Continuous delivery (CD) extends this to automated deployment pipelines where every green build is a release candidate that can be promoted to production with a single approval — or fully automatically in mature organisations.

Treating infrastructure as code (IaC) with Terraform, Pulumi, or CloudFormation brings the same discipline to infrastructure that CI/CD brings to application code: version control, peer review, automated testing, and reproducible environments. Drift detection ensures the actual state never silently diverges from the declared state.

DevSecOps integrates security into every pipeline stage rather than bolting it on at the end. Dependency scanning (Dependabot, Snyk), container image scanning (Trivy, Grype), secrets detection (GitLeaks, TruffleHog), and DAST against staging environments all run automatically. Security findings become build failures — not post-release tickets — and the mean time to remediate drops dramatically.`,
  },
];

function Sidebar({ blogs, activeValue, onSelect, busy }) {
  const [hovId, setHovId] = useState(null);

  return (
    <div style={{
      width: '240px', flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {blogs.map((b) => {
        const active = b.value === activeValue;
        const hov    = hovId === b.value;
        return (
          <SidebarButton
            key={b.value}
            blog={b}
            active={active}
            hov={hov}
            busy={busy}
            onHov={setHovId}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

function SidebarButton({ blog, active, hov, busy, onHov, onSelect }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = blog.value;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const blogValue = inputRef.current.value;
    onSelect({ loading: true, sentValue: blogValue, blog });
    try {
      const res = await fetch(`${API_BASE}/api/a10/read-blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `blog=${encodeURIComponent(blogValue)}`,
        credentials: 'include',
      });
      const data = await res.json();
      onSelect({ loading: false, sentValue: blogValue, ok: res.ok, data, blog });
    } catch (err) {
      onSelect({ loading: false, sentValue: blogValue, ok: false, error: err.message, blog });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="hidden" name="blog" />
      <button
        type="submit"
        disabled={busy}
        onMouseEnter={() => onHov(blog.value)}
        onMouseLeave={() => onHov(null)}
        style={{
          width: '100%', textAlign: 'left',
          padding: '14px 16px',
          borderRadius: '10px',
          border: `1px solid ${active ? ACCENT : hov ? '#2d3f5e' : BORDER}`,
          background: active ? `${ACCENT}12` : hov ? '#172033' : CARD,
          cursor: busy ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          /* ✦ removed box-shadow pulse — static glow only when active */
          boxShadow: active ? `0 0 16px ${ACCENT}25` : 'none',
          fontFamily: 'inherit',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {active && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '3px', background: ACCENT,
            boxShadow: `0 0 8px ${ACCENT}`,
          }} />
        )}
        <div style={{
          fontSize: '0.62rem', fontWeight: '700', letterSpacing: '1px',
          color: active ? ACCENT : DIM,
          textTransform: 'uppercase', marginBottom: '5px',
          paddingLeft: active ? '8px' : '0',
          transition: 'padding 0.2s ease',
        }}>{blog.tag}</div>
        <div style={{
          fontSize: '0.82rem', fontWeight: '700', lineHeight: '1.35',
          color: active ? BRIGHT : hov ? '#cbd5e1' : MUTED,
          paddingLeft: active ? '8px' : '0',
          transition: 'all 0.2s ease',
        }}>{blog.title}</div>
        <div style={{
          fontSize: '0.68rem', color: DIM, marginTop: '6px',
          paddingLeft: active ? '8px' : '0',
          transition: 'padding 0.2s ease',
        }}>{blog.readTime}</div>
      </button>
    </form>
  );
}

export default function A10Page({ onBack }) {
  const [result, setResult]     = useState(null);
  const [backHov, setBackHov]   = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [busy, setBusy]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleSelect = (res) => {
    if (res.loading) { setBusy(true); setResult(res); }
    else { setBusy(false); setResult(res); }
  };

  const goBack = () => { if (onBack) onBack(); else window.close(); };
  const exploited = result?.data?.exploited;
  const activeBlog = result?.blog;

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: BG, minHeight: '100vh', color: MUTED }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes scanline  { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        .fade-up { animation: fadeUp 0.35s cubic-bezier(.16,1,.3,1) both; }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0a1120}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
      `}</style>

      {/* grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(rgba(30,41,59,0.25) 1px,transparent 1px),linear-gradient(90deg,rgba(30,41,59,0.25) 1px,transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(10,17,32,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? BORDER : 'transparent'}`,
        padding: '15px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: `linear-gradient(135deg, ${ACCENT}, #a3c400)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
            }}>📰</div>
            <span style={{ fontWeight: '800', fontSize: '1rem', color: BRIGHT, letterSpacing: '-0.3px' }}>TechBlog</span>
          </div>
          <span style={{
            fontSize: '0.63rem', fontWeight: '700', letterSpacing: '1.5px',
            color: ACCENT, background: `${ACCENT}12`,
            border: `1px solid ${ACCENT}40`,
            padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase',
          }}>SSRF Lab · A10:2021</span>
        </div>
        <button
          onClick={goBack}
          onMouseEnter={() => setBackHov(true)}
          onMouseLeave={() => setBackHov(false)}
          style={{
            padding: '7px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'inherit',
            border: `1px solid ${backHov ? ACCENT : BORDER}`,
            color: backHov ? ACCENT : DIM,
            background: backHov ? `${ACCENT}0d` : 'transparent',
            transition: 'all .2s ease',
            boxShadow: backHov ? `0 0 12px ${ACCENT}30` : 'none',
          }}
        >✕ Close</button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px 80px', position: 'relative', zIndex: 1 }}>

        {/* PAGE HEADER */}
        <div className="fade-up" style={{ marginBottom: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: `${ACCENT}10`, border: `1px solid ${ACCENT}35`,
            color: ACCENT, borderRadius: '20px', padding: '4px 14px',
            fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase',
            marginBottom: '18px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />
            Security Research
          </div>
          <h1 style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: '800',
            color: BRIGHT, lineHeight: '1.15', letterSpacing: '-0.8px', marginBottom: '14px',
          }}>
            Tech Insights &{' '}
            <span style={{ color: ACCENT, textShadow: `0 0 24px ${ACCENT}60` }}>Security Deep-Dives</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: DIM, lineHeight: '1.7', maxWidth: '580px', textAlign: 'center' }}>
            Select an article on the left. Each request posts a hidden{' '}
            <code style={{
              background: '#0f172a', border: `1px solid ${BORDER}`,
              padding: '1px 6px', borderRadius: '4px', color: '#f43f5e', fontSize: '0.87em',
              fontFamily: "'JetBrains Mono',monospace",
            }}>blog</code>{' '}
            field server-side — with zero validation of what that value actually is.
          </p>
        </div>

        {/* ARTICLES label above the two-column layout */}
        <div style={{
          fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2.5px',
          color: DIM, textTransform: 'uppercase',
          marginBottom: '10px',
          width: '240px', /* match sidebar width so label stays left-aligned */
        }}>Articles</div>

        {/* MAIN LAYOUT: sidebar + content */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* SIDEBAR — no top label here anymore */}
          <div className="fade-up" style={{ animationDelay: '0.08s' }}>
            <Sidebar
              blogs={BLOGS}
              activeValue={activeBlog?.value}
              onSelect={handleSelect}
              busy={busy}
            />
          </div>

          {/* CONTENT AREA */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* empty state */}
            {!result && (
              <div className="fade-up" style={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderTop: `3px solid ${ACCENT}`,
                borderRadius: '14px', padding: '48px 32px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.3 }}>📰</div>
                <p style={{ color: DIM, fontSize: '0.9rem' }}>Select an article from the sidebar to read it here.</p>
              </div>
            )}

            {/* RESULT CARD — ✦ pulse-acc / pulse-red removed */}
            {result && (
              <div
                className="fade-up"
                style={{
                  background: exploited ? '#0d0f1a' : CARD,
                  border: `1px solid ${exploited ? 'rgba(239,68,68,0.4)' : BORDER}`,
                  borderTop: `3px solid ${exploited ? '#ef4444' : ACCENT}`,
                  borderRadius: '14px', overflow: 'hidden',
                }}
              >
                {/* browser bar */}
                <div style={{
                  padding: '11px 20px',
                  background: exploited ? 'rgba(239,68,68,0.06)' : `${ACCENT}06`,
                  borderBottom: `1px solid ${exploited ? 'rgba(239,68,68,0.15)' : BORDER}`,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  {['#ef4444','#f59e0b','#22c55e'].map((c,i) => (
                    <div key={i} style={{ width:'9px', height:'9px', borderRadius:'50%', background:c, opacity:0.7 }} />
                  ))}
                  <span style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '0.7rem', color: exploited ? '#fca5a5' : DIM,
                    marginLeft: '8px', wordBreak: 'break-all',
                  }}>
                    POST /api/a10/read-blog → blog=
                    <span style={{ color: exploited ? '#f87171' : ACCENT }}>{result.sentValue}</span>
                  </span>
                </div>

                <div style={{ padding: '32px 36px' }}>
                  {result.loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: DIM }}>
                      <div style={{
                        width: '15px', height: '15px',
                        border: `2px solid ${ACCENT}`, borderTopColor: 'transparent',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                      }} />
                      Fetching resource…
                    </div>
                  ) : (
                    <>
                      {exploited && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                          borderRadius: '8px', padding: '7px 16px', marginBottom: '22px',
                          fontSize: '0.76rem', fontWeight: '700', color: '#fca5a5',
                        }}>
                          <span style={{ animation: 'blink 1s step-end infinite' }}>🚨</span>
                          SSRF TRIGGERED — Internal resource reached
                        </div>
                      )}

                      {/* article meta */}
                      {!exploited && activeBlog && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px',
                            color: ACCENT, background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`,
                            padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase',
                          }}>{activeBlog.tag}</span>
                          <span style={{ fontSize: '0.75rem', color: DIM }}>{activeBlog.date}</span>
                          <span style={{ width:'3px', height:'3px', borderRadius:'50%', background: DIM }} />
                          <span style={{ fontSize: '0.75rem', color: DIM }}>{activeBlog.readTime}</span>
                        </div>
                      )}

                      <h2 style={{
                        fontSize: '1.5rem', fontWeight: '800',
                        color: exploited ? '#fca5a5' : BRIGHT,
                        marginBottom: '20px', lineHeight: '1.3',
                        letterSpacing: '-0.3px',
                      }}>
                        {result.data?.title}
                      </h2>

                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        {exploited && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
                            background: 'linear-gradient(180deg,transparent 0%,rgba(239,68,68,0.03) 50%,transparent 100%)',
                            animation: 'scanline 3s linear infinite',
                          }} />
                        )}
                        {exploited ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* ── meta / body pre block ── */}
                            <pre style={{
                              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: '0.78rem', lineHeight: '1.7', color: '#94a3b8',
                              background: '#060912', padding: '14px 18px',
                              borderRadius: '10px', border: `1px solid ${BORDER}`,
                            }}>
                              {result.error
                                ? `Network error: ${result.error}`
                                : result.data?.content}
                            </pre>

                            {/* ── image preview (only when backend flagged is_image) ── */}
                            {result.data?.is_image && result.data?.image_b64 && (
                              <div style={{
                                background: '#060912', borderRadius: '10px',
                                border: '1px solid rgba(239,68,68,0.35)', padding: '16px',
                                display: 'flex', flexDirection: 'column', gap: '10px',
                              }}>
                                <span style={{
                                  fontFamily: "'JetBrains Mono',monospace",
                                  fontSize: '0.68rem', color: '#f87171', letterSpacing: '0.5px',
                                }}>
                                  ⚠ IMAGE EXFILTRATED — server fetched binary on behalf of attacker ({result.data.media_type})
                                </span>
                                <img
                                  src={`data:${result.data.media_type};base64,${result.data.image_b64}`}
                                  alt="Exfiltrated remote image"
                                  style={{
                                    maxWidth: '100%', borderRadius: '8px',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    display: 'block',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.95rem', lineHeight: '1.85', color: '#cbd5e1' }}>
                            {(result.data?.content || '').split('\n\n').map((para, i) => (
                              <p key={i} style={{ marginBottom: i < (result.data?.content || '').split('\n\n').length - 1 ? '20px' : '0' }}>
                                {para}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* HINT PANEL */}
            <div style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '12px', overflow: 'hidden', marginTop: '20px',
            }}>
              <button
                onClick={() => setHintOpen(!hintOpen)}
                style={{
                  width: '100%', textAlign: 'left', padding: '16px 22px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  color: BRIGHT, fontWeight: '700', fontSize: '0.88rem', fontFamily: 'inherit',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '26px', height: '26px', borderRadius: '7px',
                    background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                  }}>💡</span>
                  How would an attacker exploit this?
                </span>
                <span style={{ color: '#fbbf24', transform: hintOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>▾</span>
              </button>

              {hintOpen && (
                <div className="fade-up" style={{
                  padding: '0 22px 22px', fontSize: '0.85rem',
                  lineHeight: '1.8', color: DIM, borderTop: `1px solid ${BORDER}`,
                }}>
                  <ol style={{ paddingLeft: '20px', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      <>Right-click any sidebar button → <strong style={{ color: BRIGHT }}>Inspect</strong>.</>,
                      <>Find <code style={{ background:'#0f172a', border:`1px solid ${BORDER}`, padding:'2px 7px', borderRadius:'5px', color: ACCENT, fontFamily:"'JetBrains Mono',monospace", fontSize:'0.83em' }}>&lt;input type="hidden" name="blog" value="blog1.txt"&gt;</code></>,
                      <>Double-click <code style={{ background:'#0f172a', border:`1px solid ${BORDER}`, padding:'2px 7px', borderRadius:'5px', color:'#fbbf24', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.83em' }}>value</code> and replace it with the URL below, then press Enter.</>,
                      <>Click the button again — the server fetches whatever is in that field with no validation whatsoever.</>,
                    ].map((s, i) => <li key={i} style={{ paddingLeft: '4px' }}>{s}</li>)}
                  </ol>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}